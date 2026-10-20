/* Self-contained lesson-print integration checks against the canonical corpus.
   Install jsdom separately and set NODE_PATH if needed. Pass --snapshots DIR
   to retain print-ready HTML for a separate visual PDF review. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {JSDOM, ResourceLoader, VirtualConsole} = require('jsdom');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const book = require('./load-book')(html);
const runtime = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'study-guide-data.js'), 'utf8'), runtime);
const lessons = runtime.window.DARURI_STUDY_DATA.lessons;
const levels = ['basic', 'intermediate', 'advanced'];
const bySection = new Map(book.sections.map(s => [String(s.id), s]));
const byNote = new Map(book.notes.map(n => [n.id, n]));
// Independent reader-facing expectations: exclude apparatus, while preserving
// the useful language explanation from the command/commander crux.
const excludedNotes = new Set(book.notes.filter(n => n.id !== 'N027' &&
  (['textual', 'crux'].includes(n.kind) || ['N050', 'N091'].includes(n.id))).map(n => n.id));
const adaptedNotes = {
  N001:['accusative expression of praise', 'The reading is interpretive.'],
  N021:['is read transitively', 'Ibn Rushd’s criticism'],
  N027:['the command', 'the commander', 'the person commanding'],
  N055:['the expression permits an extended usage', 'alternative nominal reading'],
  N092:['hamzat al-waṣl', 'form-IV command', 'فَاصْطَادُوا'],
  N096:['rendered “syllogism,”', 'an intended universal meaning'],
  N121:['Ibn Rushd’s authorial conclusion and date, 552 AH'],
  BA001:['double disciplinary reading', 'Ulrich Rudolph'],
  BA008:['the Law acknowledges the relevant kind', 'This is a comparison.'],
  BA011:['“in most cases”', 'This remains an interpretive argument.'],
  BA018:['unintentional error', 'may be pardoned without becoming a correct judgement'],
  'BA15-I01':['Mukhtaṣar al-Mustaṣfā', 'neither “abridgement” nor “necessary”'],
  'BA15-T01':['original nonliability', 'contradictory proofs'],
  'G-BA-270':['One syntactic reading', 'as a defective verb'],
  'HAD-R171':['al-Tirmidhī 1102', 'Ibn Rushd’s explanation'],
  'HAD-R191':['al-Nasāʾī 3688', 'thread and needle', 'Ṣaḥīḥ Muslim 1587c'],
  'HAD-R215':['al-Nasāʾī 3688', 'thread and needle']
};
const snapshotAt = process.argv.indexOf('--snapshots');
const snapshots = snapshotAt >= 0 ? path.resolve(process.argv[snapshotAt + 1]) : null;
const sampleNames = new Set(['purpose-basic', 'transmission-intermediate', 'transmission-advanced', 'meaning-intermediate']);
if (snapshots) fs.mkdirSync(snapshots, {recursive:true});
const normalize = value => String(value).replace(/\s+/g, ' ').trim();

class LocalAssets extends ResourceLoader {
  fetch(url) {
    const u = new URL(url);
    if (u.origin !== 'https://gnamma-research.github.io') return null;
    const filename = path.resolve(root, '..', u.pathname.replace(/^\/booksite\//, ''));
    if (!filename.startsWith(path.resolve(root, '..') + path.sep) || !fs.existsSync(filename)) return null;
    return Promise.resolve(fs.readFileSync(filename));
  }
}
async function makeDOM(hash, readerPrefs = {}) {
  const errors = [];
  const output = new VirtualConsole();
  output.on('jsdomError', error => {
    if (!/Could not parse CSS stylesheet/.test(error.message)) errors.push(error.message + (error.detail?.stack || ''));
  });
  const dom = new JSDOM(html, {
    url:'https://gnamma-research.github.io/booksite/daruri/' + hash,
    resources:new LocalAssets(), runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:output,
    beforeParse(w) {
      w.matchMedia = q => ({matches:false,media:q,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
      w.scrollTo = (x,y) => {w.__scroll = typeof x === 'object' ? x.top || 0 : y || 0;};
      w.scrollBy = () => {};
      Object.defineProperty(w, 'scrollY', {get:() => w.__scroll || 0});
      w.HTMLElement.prototype.scrollIntoView = function() {};
      w.HTMLElement.prototype.getClientRects = function() {return [{top:0,left:0,width:100,height:44}];};
      w.ResizeObserver = class {observe(){} disconnect(){} unobserve(){}};
      w.IntersectionObserver = class {observe(){} disconnect(){} unobserve(){}};
      w.CSS = {escape:s => String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&'),supports:() => true};
      w.TextEncoder = TextEncoder;
      w.TextDecoder = TextDecoder;
      w.print = () => {w.dispatchEvent(new w.Event('beforeprint'));w.dispatchEvent(new w.Event('afterprint'));};
      w.localStorage.setItem('daruri-reader-v2', JSON.stringify({lang:'english',vowels:false,theme:'dark',fontScale:1.1,...readerPrefs}));
    }
  });
  await new Promise(resolve => dom.window.addEventListener('load', resolve, {once:true}));
  await settle(dom.window);
  assert.equal(errors.length, 0, errors.join('\n'));
  return {dom,w:dom.window,d:dom.window.document,errors};
}
async function settle(w) {
  await new Promise(resolve => setTimeout(resolve, 50));
  await new Promise(resolve => w.requestAnimationFrame(() => w.requestAnimationFrame(resolve)));
}
async function navigate(w, id, level) {
  w.location.hash = '#study?topic=' + id + '&level=' + level;
  await settle(w);
}
function snapshot(d, name) {
  if (!snapshots || !sampleNames.has(name)) return;
  const copy = d.documentElement.cloneNode(true);
  // Inactive fallback copies and scripts are irrelevant to the hydrated print
  // snapshot and otherwise make offline layout needlessly expensive.
  copy.querySelectorAll('script,noscript').forEach(node => node.remove());
  copy.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    const value = link.getAttribute('href');
    if (/^https?:/.test(value)) link.remove();
    else link.setAttribute('href', 'file://' + path.resolve(root, value.split('?')[0]));
  });
  fs.writeFileSync(path.join(snapshots, name + '.html'), '<!doctype html>\n' + copy.outerHTML);
}

// Packet assertions are kept separate from the reader fixture so an accidental
// missing print preparer cannot be mistaken for a successful no-op.
function verifyPacket(d, lesson, level) {
  const article = d.querySelector('.sg-lesson');
  const inserted = [...article.querySelectorAll('[data-lesson-print]')];
  assert.ok(inserted.length > 0, 'Print preparation actually inserts the packet');
  for (const node of inserted) {
    assert.ok(node.classList.contains('sg-print-only'), 'Inserted material is print-only');
    assert.equal(node.style.display, 'none', 'Print additions stay hidden on screen');
  }
  const sections = [...article.querySelectorAll('[data-print-section]')];
  const sectionIds = sections.map(node => node.getAttribute('data-print-section'));
  assert.deepEqual(sectionIds.slice(0, lesson.levels[level].sections.length),
    Array.from(lesson.levels[level].sections, String), lesson.id + '/' + level + ': assigned reading order');
  assert.equal(new Set(sectionIds).size, sectionIds.length, 'Supplementary readings do not repeat assigned passages');
  const expectedNotes = new Set();
  for (const sectionElement of sections) {
    const id = sectionElement.getAttribute('data-print-section');
    const source = bySection.get(id);
    assert.ok(source, 'Printed section exists in the edition: ' + id);
    assert.ok(normalize((sectionElement.closest('.sg-readings > li') || sectionElement).textContent).includes(normalize(source.title)), 'Section title is retained');
    const segmentElements = [...sectionElement.querySelectorAll('[data-print-segment]')];
    const indices = [...new Set(segmentElements.map(node => Number(node.getAttribute('data-print-segment'))))];
    assert.deepEqual(indices, source.segments.map((_, i) => i), 'Every aligned passage is present in order for §' + id);
    for (const [i, segment] of source.segments.entries()) {
      const elements = segmentElements.filter(node => Number(node.getAttribute('data-print-segment')) === i);
      const languageNode = language => elements.find(node => node.getAttribute('lang') === language)
        || elements.map(node => node.querySelector('[lang="' + language + '"]')).find(Boolean);
      for (const [language, expected] of [['ar', segment.vocalized || segment.ar], ['en', segment.en]]) {
        const element = languageNode(language);
        assert.ok(element, language + ' included independently of screen language in §' + id);
        const copy = element.cloneNode(true);
        copy.querySelectorAll('[data-print-note-ref]').forEach(node => node.remove());
        assert.equal(normalize(copy.textContent), normalize(expected), 'Complete ' + language + ' source text, §' + id + ', passage ' + i);
        if (language === 'ar') assert.equal(element.getAttribute('dir'), 'rtl', 'Arabic direction is explicit');
      }
    }
    for (const id of source.noteIds || []) if (!excludedNotes.has(id)) expectedNotes.add(id);
  }
  const notes = [...article.querySelectorAll('[data-print-note]')];
  const noteIds = notes.map(node => node.getAttribute('data-print-note'));
  assert.equal(new Set(noteIds).size, noteIds.length, 'Each note appears only once');
  for (const [index, note] of notes.entries()) {
    const id = note.getAttribute('data-print-note');
    assert.ok(!excludedNotes.has(id), 'Manuscript/collation note is excluded: ' + id);
    assert.equal(note.id, 'sg-print-note-' + (index + 1), 'Endnote anchors are consecutive');
    assert.ok(note.querySelector('.sg-print-note-label').textContent.startsWith((index + 1) + '. '), 'Printed note numbers are consecutive');
    const body = normalize(note.querySelector('.sg-print-note-text').textContent);
    assert.ok(!/manuscript|collation|Escorial|conjectur|orthographic correction/i.test(body), 'Study note omits manuscript apparatus: ' + id);
    for (const match of body.matchAll(/\b(?:N\d{3}|BA\d{3}|BA15-[A-Z]\d{3}|G-B2-\d{4})\b/g)) {
      if (byNote.has(match[0])) assert.ok(noteIds.includes(match[0]), 'Named study-note reference resolves: ' + id + ' → ' + match[0]);
    }
    for (const phrase of adaptedNotes[id] || []) assert.ok(body.includes(phrase), 'Useful adapted explanation retained: ' + id + ' / ' + phrase);
    if (id === 'N027') assert.ok(note.querySelector('.sg-print-note-label').textContent.includes('Vocabulary'), 'Command/commander distinction is a vocabulary note');
  }
  for (const id of expectedNotes) {
    const original = byNote.get(id);
    assert.ok(original, 'The edition resolves note ' + id);
    const note = notes.find(node => node.getAttribute('data-print-note') === id);
    assert.ok(note, 'Relevant ' + original.kind + ' endnote included: ' + id);
    if (!adaptedNotes[id]) assert.ok(normalize(note.textContent).includes(normalize(original.text)), 'Complete retained note body: ' + id);
    assert.ok(article.querySelector('[data-print-note-ref="' + id + '"]'), 'Printed reading points to note ' + id);
  }
  for (const call of article.querySelectorAll('[data-print-note-ref]')) {
    const id = call.getAttribute('data-print-note-ref');
    assert.ok(noteIds.includes(id), 'Every printed note call resolves: ' + id);
    const anchor = call.matches('a') ? call : call.querySelector('a');
    assert.ok(anchor?.getAttribute('href')?.startsWith('#'), 'Endnote call is a local PDF link');
    assert.ok(d.getElementById(anchor.getAttribute('href').slice(1)), 'Endnote link target exists');
    assert.equal(anchor.textContent, '[' + (noteIds.indexOf(id) + 1) + ']', 'Call number matches its retained note');
  }
  return {sections:sections.length, notes:notes.length};
}

(async () => {
  const {dom,w,d,errors} = await makeDOM('#study');
  assert.equal(lessons.length, 28);
  let cases = 0;
  for (const lesson of lessons) for (const level of levels) {
    await navigate(w, lesson.id, level);
    assert.equal(d.querySelector('#sg-title')?.textContent, lesson.title);
    assert.equal(d.querySelector('[data-lesson-print]'), null, 'Source passages are absent from the normal lesson page');
    const oldHTML = d.querySelector('.sg-lesson').innerHTML;
    const oldDetails = [...d.querySelectorAll('.sg-lesson details')].map(x => [x, x.open]);
    const oldPreferences = w.localStorage.getItem('daruri-reader-v2');
    const oldHash = w.location.hash;
    w.dispatchEvent(new w.Event('beforeprint'));
    verifyPacket(d, lesson, level);
    const prepared = d.querySelector('.sg-lesson').innerHTML;
    w.dispatchEvent(new w.Event('beforeprint'));
    assert.equal(d.querySelector('.sg-lesson').innerHTML, prepared, 'Repeated preparation is idempotent');
    snapshot(d, lesson.id + '-' + level);
    w.dispatchEvent(new w.Event('afterprint'));
    assert.equal(d.querySelector('[data-lesson-print]'), null, 'Print/cancel removes the inserted packet');
    assert.equal(d.querySelector('.sg-lesson').innerHTML, oldHTML, 'Print/cancel restores the exact screen lesson');
    for (const [detail, opened] of oldDetails) assert.equal(detail.open, opened, 'Print/cancel restores disclosure state');
    assert.equal(w.localStorage.getItem('daruri-reader-v2'), oldPreferences, 'Print preserves reader preferences');
    assert.equal(w.location.hash, oldHash, 'Print preserves the lesson route');
    cases++;
  }
  // The lesson button must prepare complete content before printing and give
  // locally hosted Arabic/English fonts time to load on first use.
  await navigate(w, 'transmission', 'intermediate');
  const beforeButtonHTML = d.querySelector('.sg-lesson').innerHTML;
  const pendingFonts = [];
  Object.defineProperty(d, 'fonts', {configurable:true, value:{load:(font, sample) => {
    assert.ok(font.includes('14px'));
    assert.ok(sample);
    return new Promise(resolve => pendingFonts.push(resolve));
  }}});
  let printed = 0;
  w.print = () => {
    printed++;
    w.dispatchEvent(new w.Event('beforeprint'));
    verifyPacket(d, lessons.find(lesson => lesson.id === 'transmission'), 'intermediate');
    w.dispatchEvent(new w.Event('afterprint'));
  };
  d.querySelector('[data-sg-print]').click();
  assert.equal(printed, 0, 'Button waits while first-use reading fonts load');
  assert.equal(pendingFonts.length, 2, 'Both Arabic and English fonts are prepared');
  pendingFonts.forEach(resolve => resolve([]));
  await settle(w);
  assert.equal(printed, 1, 'Prepared lesson prints once after fonts settle');
  assert.equal(d.querySelector('.sg-lesson').innerHTML, beforeButtonHTML, 'Button print restores the exact screen lesson');
  // A user can leave the lesson while its first-use fonts are loading.
  // That must cancel the pending print instead of printing a different page.
  pendingFonts.length = 0;
  d.querySelector('[data-sg-print]').click();
  assert.equal(pendingFonts.length, 2);
  await navigate(w, 'purpose', 'basic');
  pendingFonts.forEach(resolve => resolve([]));
  await settle(w);
  assert.equal(printed, 1, 'Navigation cancels a delayed print');
  assert.equal(d.querySelector('[data-lesson-print]'), null, 'No packet leaks into the destination lesson');
  await navigate(w, 'transmission', 'intermediate');
  assert.equal(d.querySelector('[data-lesson-print]'), null, 'Returning to the source lesson has no stale print packet');
  assert.equal(errors.length, 0, errors.join('\n'));
  dom.window.close();
  console.log('PASS: ' + cases + ' self-contained lesson printouts; full bilingual readings, useful study notes, no manuscript apparatus, continuous numbering, resolved references, idempotence and restored screen state.');
})().catch(error => {console.error(error);process.exitCode = 1;});
