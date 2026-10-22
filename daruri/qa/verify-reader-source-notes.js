/* Reader Notes integration checks. Install jsdom separately and set NODE_PATH
   if needed. These use the actual local assets and DOM event handlers; they do
   not replace browser visual QA. The preservation digests are from b7af8f0,
   the published PDF-source release before the Notes presentation change. */
'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {JSDOM, ResourceLoader, VirtualConsole} = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = filename => fs.readFileSync(path.join(root, filename), 'utf8');
const html = read('index.html');
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const payload = {textContent:''};
vm.runInNewContext(read('edition-r3-20261020.js'), {document:{getElementById:() => payload}});
const book = JSON.parse(payload.textContent);
const sourceContext = {
  window:{}, URL,
  document:{
    baseURI:'https://gnamma-research.github.io/booksite/daruri/',
    currentScript:{src:'https://gnamma-research.github.io/booksite/daruri/source-reference-data.js'},
    createElement:()=>({}),
    head:{appendChild(){}}
  }
};
vm.runInNewContext(read('source-reference-data.js'), sourceContext);
const supplement = JSON.parse(JSON.stringify(sourceContext.window.DARURI_SOURCE_REFERENCES));
const quranMap = JSON.parse(read('build/data/quran-source-notes.json'));
const hadithMap = JSON.parse(read('build/data/hadith-source-notes.json'));

/* Static no-JS reader must keep the same cautious Section 1 citation policy.
   This also guards users whose browser is serving the fallback instead of the
   enhanced reader (for example if scripts are disabled or interrupted). */
const fallbackPairs = [
  {id:'QUR-R001-Q049', author:'معلّم البيان', verse:'عَلَّمَهُ ٱلْبَيَانَ'},
  {id:'QUR-R001-Q050', author:'الحجج البالغة', verse:'فَلِلَّهِ ٱلْحُجَّةُ ٱلْبَـٰلِغَةُ'}
];
for (const {id,author,verse} of fallbackPairs) {
  const expression = new RegExp('<article class="fb-note" id="fb-note-' + id + '"[^>]*>([\\s\\S]*?)<\\/article>');
  const found=html.match(expression);
  assert.ok(found,'Fallback section has a real source note for ' + id);
  const noteHTML=found[1];
  assert.ok(noteHTML.includes('“<bdi lang="ar" dir="rtl">' + author + '</bdi>”'), id + ' authorial phrase uses ordinary quotes');
  assert.ok(noteHTML.includes('<span class="gn-quran-bracket">﴿</span>') && noteHTML.includes('<span class="gn-quran-bracket">﴾</span>'), id + ' canonical verse uses Quran brackets');
  assert.ok(noteHTML.includes('<span class="gn-quran-words">' + verse + '</span>'), id + ' displays actual canonical wording');
  assert.ok(noteHTML.includes('possible allusion'), id + ' correctly disclaims certain quotation');
}
for (const withheldId of ['QUR-R001-Q051','QUR-R011-Q052','QUR-R047-Q053']) {
  assert.ok(!html.includes(withheldId), 'A withdrawn Quran reference survives in the static fallback: '+withheldId);
}
assert.ok(html.includes('<noscript><link rel="stylesheet" href="source-note-ui.css?v=20261021-fallback-quran1"></noscript>'),
  'No-JavaScript fallback must load the canonical Quran verse typography');
const backmatterMap = JSON.parse(read('build/data/backmatter-source-notes.json'));
const isTextSource = note => ['quran', 'hadith'].includes(note.source_type);
const oldNotes = book.notes.filter(note => !isTextSource(note));
const textSources = book.notes.filter(isTextSource);
const byID = new Map(book.notes.map(note => [note.id, note]));
const byApp = new Map(book.apps.map(app => [app.id, app]));
const appSources = Object.values(supplement.applications).flat();
const dictionarySources = Object.values(supplement.dictionaryArticles).flat();
const ownership = new Map();

assert.equal(book.sections.length, 259, 'All authorial sections and the colophon remain available');
assert.equal(book.notes.length, 625);
assert.equal(book.stats.notes, 625);
assert.equal(book.stats.noteCount, 625);
assert.equal(oldNotes.length, 542);
assert.equal(textSources.length, 83);
assert.equal(textSources.filter(note => note.source_type === 'quran').length, 50);
assert.equal(textSources.filter(note => note.source_type === 'hadith').length, 33);
assert.equal(digest(oldNotes), '4d8a6eda38a7918413a3d8e086564624cfb6999596a607ec0055b02a8ef4e8ad', 'All 542 original note records are unchanged');
const withheld = quranMap.withheld_editorial_allusions || [];
const withheldIds = ['QUR-R001-Q051','QUR-R011-Q052','QUR-R047-Q053'];
const restoredIds = ['QUR-R001-Q049','QUR-R001-Q050'];
assert.deepEqual(withheld.map(note => note.id), withheldIds, 'Only the three unpersuasive allusions remain withheld');
assert.ok(withheld.every(note => note.reference_type === 'allusion'), 'Genuine Quran quotations may not be silently withheld');
assert.equal(quranMap.counts.notes, 50);
assert.equal(quranMap.counts.withheld_allusions, 3);
assert.deepEqual(quranMap.notes.filter(n => restoredIds.includes(n.id)).map(n=>n.id),restoredIds);
assert.ok(restoredIds.every(id => byID.get(id)?.reference_type === 'allusion'), '§1 parallels are possible allusions, not direct quotations');
assert.ok(restoredIds.every(id => /possible verbal echo/.test(byID.get(id)?.text)), 'Every restored parallel has a visibly qualified note');
assert.ok(book.sections.find(s => String(s.id) === '1').noteIds.slice(-2).join('|') === restoredIds.join('|'), 'Section 1 owns both restored notes');
assert.ok(restoredIds.every(id => !withheldIds.includes(id)), 'Restored sources are distinct from the three withheld candidates');
assert.ok(textSources.every(note => !withheldIds.includes(note.id)), 'No withheld candidate in reader Notes');
assert.ok(quranMap.notes.every(note => !withheldIds.includes(note.id)), 'No withheld candidate in PDF source notes');
const originalSectionNotes = book.sections.map(section => [
  String(section.id),
  [...(section.noteIds || []),
   ...withheld.filter(note => String(note.section_id) === String(section.id)).map(note => note.id)]
]);
assert.equal(digest(originalSectionNotes), '9ab9a4096a8741da8cc5708f627a55561072c85c3c618bc9beb09b74041fffba',
  'Reinstating three withheld candidates only for provenance comparison recovers the original note order');
assert.equal(digest(book.apps), 'ae24ec973dfbadbea112b4f9cf729bfd4fa914341352169b253aba8576140a5c', 'All existing application texts and primary/related section mappings are unchanged');
assert.equal(byID.size, book.notes.length, 'Main note IDs are unique');
for (const section of book.sections) for (const id of section.noteIds || []) {
  assert.ok(byID.has(id), 'Known note ID ' + id);
  assert.ok(!ownership.has(id), 'Note has a single section owner: ' + id);
  ownership.set(id, String(section.id));
}
assert.equal(ownership.size, 625, 'No original or restored source note is orphaned');
assert.equal(ownership.get('N015'), '31', 'Legacy note ordinal n must not determine ownership');
assert.equal(ownership.get('BA15-I01'), '1', 'Bou Akl note retains its original section');

function references(note) {
  return (note.source_type === 'quran'
    ? note.references.map(ref => ({reference:ref.label_en, url:ref.url}))
    : note.source_references || []).map(({reference, url}) => ({reference, url}));
}
for (const note of quranMap.notes) {
  assert.equal(byID.get(note.id).text, note.text_en, 'Verified Qur’an note body: ' + note.id);
  assert.deepEqual(references(byID.get(note.id)), note.references.map(ref => ({reference:ref.label_en, url:ref.url})));
}
for (const note of Object.values(hadithMap.notes_by_section)) {
  assert.equal(byID.get(note.id).text, note.text, 'Verified hadith note body: ' + note.id);
  assert.deepEqual(references(byID.get(note.id)), (note.source_references || []).map(({reference, url}) => ({reference, url})));
}
assert.equal(references(byID.get('HAD-R189')).length, 0, 'Unresolved attribution notice intentionally has no invented source URL');
assert.equal(appSources.length, 12, 'Exactly 12 explicitly scoped application sources');
assert.equal(dictionarySources.length, 13);
assert.equal(new Set([...book.notes, ...appSources, ...dictionarySources].map(note => note.id)).size, 650, 'Main, application and dictionary source IDs are distinct');
for (const source of Object.values(backmatterMap.application_notes_by_section)) {
  const notes = supplement.applications[source.application_id] || [];
  const note = notes.find(item => item.id === source.id);
  assert.ok(note, 'Mapped application source ' + source.id);
  const app = byApp.get(note.application_id);
  assert.ok(app, 'Known application ' + note.application_id);
  assert.equal(String(app.n), String(source.application_section), 'Application uses its primary section');
  assert.equal(note.source_type, 'application');
  assert.equal(note.text, source.text, 'Application qualification retained exactly');
  assert.equal(note.anchor_en, source.anchor_en);
  assert.ok(app.text.includes(note.anchor_en), 'Cited material exists in its application');
  assert.deepEqual(references(note), source.source_references.map(({reference, url}) => ({reference, url})));
}

class LocalAssets extends ResourceLoader {
  fetch(url) {
    const parsed = new URL(url);
    if (parsed.origin !== 'https://gnamma-research.github.io') return null;
    const filename = path.resolve(root, '..', parsed.pathname.replace(/^\/booksite\//, ''));
    if (!filename.startsWith(path.resolve(root, '..') + path.sep) || !fs.existsSync(filename)) return null;
    return Promise.resolve(fs.readFileSync(filename));
  }
}
const settle = () => new Promise(resolve => setTimeout(resolve, 110));
async function settleView(w) {
  await settle();
  await new Promise(resolve => w.requestAnimationFrame(() => w.requestAnimationFrame(resolve)));
}
async function makeDOM(hash, seed = {}) {
  const errors = [];
  const output = new VirtualConsole();
  output.on('jsdomError', error => {
    if (!/Could not parse CSS stylesheet/.test(error.message)) errors.push(error.message + (error.detail?.stack || ''));
  });
  const dom = new JSDOM(html, {
    url:'https://gnamma-research.github.io/booksite/daruri/' + hash,
    resources:new LocalAssets(), runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:output,
    beforeParse(w) {
      w.matchMedia = query => ({matches:false, media:query, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){}});
      w.scrollTo = (x, y) => {w.__scroll = typeof x === 'object' ? x.top || 0 : y || 0;};
      w.scrollBy = () => {};
      Object.defineProperty(w, 'scrollY', {get:() => w.__scroll || 0});
      w.HTMLElement.prototype.scrollIntoView = function() {w.__scrolledTo = this.id;};
      w.HTMLElement.prototype.getClientRects = () => [{top:0, left:0, width:100, height:44}];
      w.ResizeObserver = class {observe(){} disconnect(){} unobserve(){}};
      w.IntersectionObserver = class {observe(){} disconnect(){} unobserve(){}};
      w.CSS = {escape:s => String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&'), supports:() => true};
      w.TextEncoder = TextEncoder;
      w.TextDecoder = TextDecoder;
      w.navigator.clipboard = {writeText:async text => {w.__copied = text;}};
      w.localStorage.setItem('daruri-reader-v2', JSON.stringify({lang:'english', vowels:false, theme:'dark', fontScale:1.1, showNotes:true, ...seed}));
    }
  });
  await new Promise(resolve => dom.window.addEventListener('load', resolve, {once:true}));
  await settleView(dom.window);
  assert.equal(errors.length, 0, errors.join('\n'));
  return {dom, w:dom.window, d:dom.window.document, errors};
}
async function navigate(w, section) {
  const hash = '#section=' + section.id;
  if (w.location.hash !== hash) w.location.hash = hash;
  await settleView(w);
}
function expectedNotes(section) {
  return (section.noteIds || []).map(id => byID.get(id)).concat(book.apps
    .filter(app => String(app.n) === String(section.id))
    .flatMap(app => supplement.applications[app.id] || []));
}
function assertUniqueIDs(d, label) {
  const seen = new Set();
  for (const element of d.querySelectorAll('[id]')) {
    assert.ok(!seen.has(element.id), label + ': duplicate DOM ID ' + element.id);
    seen.add(element.id);
  }
}
const PRESENTATION_ONLY_BODY = Object.freeze({
  'QUR-R001-Q049': 'Ibn Rushd’s wording “معلّم البيان” may echo Qurʾān, al-Raḥmān 55:4. This is a possible verbal allusion, not a quotation; deliberate allusion is uncertain.',
  'QUR-R001-Q050': 'Ibn Rushd’s plural wording “الحجج البالغة” may echo Qurʾān, al-Anʿām 6:149, which uses the singular. This is a possible verbal allusion, not a quotation or proven citation.'
});
const PRESENTATION_ONLY_AUTHOR = Object.freeze({
  'QUR-R001-Q049': '“معلّم البيان”',
  'QUR-R001-Q050': '“الحجج البالغة”'
});
const PRESENTATION_ONLY_QURAN = Object.freeze({
  'QUR-R001-Q049': 'عَلَّمَهُ ٱلْبَيَانَ',
  'QUR-R001-Q050': 'فَلِلَّهِ ٱلْحُجَّةُ ٱلْبَـٰلِغَةُ'
});
function assertBodyAndLinks(element, note) {
  const body = element.cloneNode(true);
  body.querySelector('.source-note-links')?.remove();
  const expectedBody = PRESENTATION_ONLY_BODY[note.id] || note.text;
  assert.equal(body.textContent, expectedBody, 'Correct canonical body or display-only disambiguation: ' + note.id);
  if (PRESENTATION_ONLY_AUTHOR[note.id]) {
    const author = element.querySelector('span.gn-ibn-rushd-words');
    assert.equal(author?.textContent, PRESENTATION_ONLY_AUTHOR[note.id], 'Ibn Rushd uses ordinary typographic quotes');
    assert.equal(author?.getAttribute('dir'), 'ltr', 'Ordinary paired quotation marks retain their visual order');
    assert.equal(author?.querySelector('bdi')?.getAttribute('dir'), 'rtl', 'Arabic authorial text is bidi isolated');
    assert.equal(author?.querySelector('bdi')?.getAttribute('lang'), 'ar');
    assert.equal(author?.style.whiteSpace, 'nowrap', 'Quotation marks stay paired on narrow mobile screens');
    assert.ok(!body.textContent.includes(PRESENTATION_ONLY_QURAN[note.id]), 'Qurʾānic verse must not appear redundantly in ordinary parentheses');
    assert.ok(!body.textContent.includes('«'), 'Do not use ambiguous guillemets for Ibn Rushd');
    const figure = element.closest('.gn-note-entry')?.querySelector('.gn-verse-source-excerpt');
    assert.ok(figure, 'Correctly marked Qurʾānic verse panel exists');
    const wording = figure.querySelector('.gn-quran-words');
    assert.equal(wording?.textContent, PRESENTATION_ONLY_QURAN[note.id], 'Exact Qurʾānic text is shown only in the verse panel');
    const quotation = figure.querySelector('.gn-quran-quotation');
    assert.equal(quotation?.firstElementChild?.textContent, '﴿', 'Verse has Qurʾānic opening bracket');
    assert.equal(quotation?.lastElementChild?.textContent, '﴾', 'Verse has Qurʾānic closing bracket');
  }
  const links = [...element.querySelectorAll('.source-note-links a')];
  assert.deepEqual(links.map(link => ({reference:link.closest('.gn-source-citation')?.querySelector('.gn-source-label')?.textContent || link.textContent, url:link.getAttribute('href')})), references(note), 'Exact labelled source links: ' + note.id);
  for (const link of element.querySelectorAll('a')) {
    assert.match(link.href, /^https?:\/\//, 'External note link');
    assert.equal(link.target, '_blank');
    assert.ok(link.relList.contains('noopener') && link.relList.contains('noreferrer'));
  }
}
function assertCard(d, section, relevant) {
  const layer = d.querySelector('#gn-scholar-layer');
  assert.ok(layer, 'Notes dialog opens for ' + section.id);
  assert.equal(layer.querySelectorAll('.gn-unified-notes').length, 1, 'One unified Notes card');
  assert.equal(layer.querySelectorAll('[role="dialog"][aria-modal="true"]').length, 1);
  const entries = [...layer.querySelectorAll('.gn-note-entry')];
  const sources = relevant.filter(isTextSource);
  const applications = relevant.filter(note => note.source_type === 'application');
  const others = relevant.filter(note => !isTextSource(note) && note.source_type !== 'application');
  const expectedOrder = [...sources, ...applications, ...others];
  assert.deepEqual(entries.map(entry => entry.dataset.noteId), expectedOrder.map(note => note.id), 'Exact note IDs and source-first order for ' + section.id);
  const expectedGroups = [];
  if (sources.length) expectedGroups.push('Source references (' + sources.length + ')');
  if (applications.length) expectedGroups.push('Bidāya application sources (' + applications.length + ')');
  if (others.length) expectedGroups.push((sources.length || applications.length ? 'Other notes' : 'Reading notes') + ' (' + others.length + ')');
  assert.deepEqual([...layer.querySelectorAll('.gn-note-group-title')].map(element => element.textContent), expectedGroups);
  for (const [index, entry] of entries.entries()) {
    const note = expectedOrder[index];
    assert.equal(entry.dataset.noteKind, note.kind);
    const heading = entry.querySelector('h3').textContent;
    assert.ok(heading.includes(note.id), 'Stable note ID visible');
    assert.ok(heading.includes(note.kindLabel || ({crux:'Textual', editorial:'Editorial'}[note.kind] || note.kind)), 'Readable note kind');
    if (note.sourceLabel) assert.ok(heading.includes(note.sourceLabel), 'Local Qur’an source label');
    const scope = entry.querySelector('.gn-note-scope');
    if (note.source_type === 'application') {
      assert.equal(scope?.textContent, 'Source for the editorial Bidāya application: ' + byApp.get(note.application_id).title, 'Application cannot be mistaken for an authorial quotation');
    } else assert.equal(scope, null);
    const body = [...entry.children].find(element => element.tagName === 'P' && !element.classList.contains('gn-note-scope'));
    assert.ok(body, 'Note body exists');
    assertBodyAndLinks(body, note);
    assert.notEqual(note.source_type, 'dictionary', 'Dictionary citations remain outside authorial section Notes');
  }
  assertUniqueIDs(d, 'Open Notes for ' + section.id);
}
function assertOfflineAsset() {
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
  const asset = scripts.find(src => src.startsWith('source-reference-data.js?'));
  assert.ok(asset, 'Source data script is loaded by the reader');
  assert.equal(scripts.filter(src => src.startsWith('source-reference-data.js')).length, 1);
  const bundle = read('download-bundle.js');
  const mapping = bundle.match(/\[\s*['"]daruri\/source-reference-data\.js['"]\s*,\s*['"]([^'"]+)['"]\s*\]/);
  assert.ok(mapping, 'Offline ZIP includes the source data with the correct relative path');
  assert.equal(mapping[1], asset, 'Offline source data uses the reader cache version');
  const worker = read('sw.js');
  const coreMatch = worker.match(/const CORE\s*=\s*(\[[^\]]*\])/);
  assert.ok(coreMatch, 'Service worker has a core asset list');
  const core = vm.runInNewContext(coreMatch[1]);
  assert.equal(core.filter(src => src === asset).length, 1, 'Service worker precaches the same source data version');
}

(async () => {
  const {dom, w, d, errors} = await makeDOM('#section=1');
  const preferences = JSON.parse(w.localStorage.getItem('daruri-reader-v2'));
  const visited = new Set();
  let noteCards = 0;
  for (const [index, section] of book.sections.entries()) {
    await navigate(w, section);
    assert.ok(d.querySelector('.reader'), 'Reader route for ' + section.id);
    const relevant = expectedNotes(section);
    const trigger = d.querySelector('#reader [data-gn-notes-open]');
    if (!relevant.length) {
      assert.equal(trigger, null, 'No empty Notes trigger');
      continue;
    }
    assert.equal(trigger?.textContent, 'Notes (' + relevant.length + ')', 'Correct total for ' + section.id);
    assert.equal(trigger.id, 'notes', 'Context panel has an actual Notes target');
    const counts = ['quran', 'hadith', 'application'].map(kind => relevant.filter(note => note.source_type === kind).length);
    const labels = [counts[0] ? counts[0] + ' Qur’an' : '', counts[1] ? counts[1] + ' hadith' : '', counts[2] ? counts[2] + ' application source' + (counts[2] === 1 ? '' : 's') : ''].filter(Boolean).join(' · ');
    const summary = d.querySelector('#reader .gn-note-source-count');
    assert.equal(summary?.textContent.trim() || '', labels ? '· ' + labels : '', 'Source-note counts are independent of source-link counts');
    const hash = w.location.hash;
    w.scrollTo({top:360 + index});
    trigger.focus({preventScroll:true});
    trigger.click();
    // Note cards are enhanced by a MutationObserver after they are inserted.
    // Wait for that microtask before checking their final visible brackets.
    if (String(section.id) === '1') await new Promise(resolve => w.queueMicrotask(resolve));
    assert.equal(w.location.hash, hash, 'Opening Notes preserves route');
    assert.equal(w.scrollY, 360 + index, 'Opening Notes preserves reader scroll');
    assertCard(d, section, relevant);
    relevant.forEach(note => visited.add(note.id));
    assert.equal(d.activeElement, d.querySelector('#gn-scholar-layer button[data-gn-close]'), 'Opening Notes focuses its close control');
    const controls = [...d.querySelectorAll('#gn-scholar-layer button, #gn-scholar-layer a[href]')];
    const first = controls[0], last = controls[controls.length - 1];
    last.focus({preventScroll:true});
    const tab = new w.KeyboardEvent('keydown', {key:'Tab', bubbles:true, cancelable:true});
    d.dispatchEvent(tab);
    assert.ok(tab.defaultPrevented, 'Tab at the last modal control is handled');
    assert.equal(d.activeElement, first, 'Tab wraps to the first modal control');
    const backTab = new w.KeyboardEvent('keydown', {key:'Tab', shiftKey:true, bubbles:true, cancelable:true});
    d.dispatchEvent(backTab);
    assert.ok(backTab.defaultPrevented, 'Shift-Tab at the first modal control is handled');
    assert.equal(d.activeElement, last, 'Shift-Tab wraps to the last modal control');
    if (index % 2) d.dispatchEvent(new w.KeyboardEvent('keydown', {key:'Escape', bubbles:true}));
    else d.querySelector('#gn-scholar-layer button[data-gn-close]').click();
    assert.equal(d.querySelector('#gn-scholar-layer'), null, 'Close button/Escape removes Notes');
    assert.equal(d.activeElement, trigger, 'Closing Notes restores the originating Notes link');
    assert.equal(w.location.hash, hash, 'Closing Notes preserves route');
    assert.equal(w.scrollY, 360 + index, 'Closing Notes preserves reader scroll');
    assertUniqueIDs(d, 'Reader section ' + section.id);
    noteCards++;
    if ((index + 1) % 65 === 0) console.log('Checked ' + (index + 1) + ' of 259 reader sections.');
  }
  assert.equal(visited.size, 637, 'Every original note and all 98 main/application sources rendered once in its owned section');
  for (const note of [...book.notes, ...appSources]) assert.ok(visited.has(note.id), 'Rendered note ' + note.id);
  for (const note of dictionarySources) assert.ok(!visited.has(note.id));
  // Inline Qurʾānic markers must open exactly the same single-note presentation
  // as the section-end Notes card, including verified verse and ornate brackets.
  const inlineQuranChecks=[
    ['1','QUR-R001-Q049','عَلَّمَهُ ٱلْبَيَانَ'],
    ['1','QUR-R001-Q050','فَلِلَّهِ ٱلْحُجَّةُ ٱلْبَـٰلِغَةُ'],
    ['38','QUR-R038-Q001','يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تَقْرَبُوا۟ ٱلصَّلَوٰةَ وَأَنتُمْ سُكَـٰرَىٰ حَتَّىٰ تَعْلَمُوا۟ مَا تَقُولُونَ']
  ];
  for (const [sectionId,noteId,verse] of inlineQuranChecks) {
    await navigate(w,{id:sectionId});
    const marker=d.querySelector('.quran-source-ref[data-note-target="'+noteId+'"]');
    assert.ok(marker,'Inline Qurʾānic footnote marker exists: '+noteId);
    marker.focus({preventScroll:true});
    const hash=w.location.hash;
    w.scrollTo({top:412});
    marker.click();
    await new Promise(resolve => w.queueMicrotask(resolve));
    assert.equal(w.location.hash,hash,'Inline note does not navigate away: '+noteId);
    assert.equal(w.scrollY,412,'Inline note preserves reading position: '+noteId);
    assertCard(d,{id:sectionId},[byID.get(noteId)]);
    const context=d.querySelector('#gn-scholar-layer details[data-gn-quran-context="'+noteId+'"]');
    assert.ok(context,'One contextual disclosure under the same inline note: '+noteId);
    assert.equal(context.open,false,'Qurʾānic context starts collapsed: '+noteId);
    assert.equal(context.querySelectorAll('.gn-context-ayah').length,0,'No full verses rendered before request');
    const previousLoads=d.querySelectorAll('script[src*="quran-context-data.js"]').length;
    context.open=true;
    context.dispatchEvent(new w.Event('toggle'));
    await new Promise(resolve => w.setTimeout(resolve,90));
    assert.equal(context.dataset.gnContextReady,'1','Context loads when expanded: '+noteId);
    assert.equal(d.querySelectorAll('script[src*="quran-context-data.js"]').length,Math.max(1,previousLoads),
      'Local context script loads only once even across many notes');
    const rows=[...context.querySelectorAll('.gn-context-ayah')];
    const expected=JSON.parse(read('quran-context-data.json')).notes[noteId].flatMap(ref=>ref.verses);
    assert.deepEqual(rows.map(row=>row.querySelector('figcaption').textContent.split(' · ')[0]),
      expected,'Exact neighboring verse inventory: '+noteId);
    assert.equal(rows.filter(row=>row.classList.contains('gn-context-cited')).length,
      byID.get(noteId).references.reduce((sum,ref)=>sum+ref.ayah_end-ref.ayah_start+1,0));
    assert.ok(rows.every(row=>row.querySelector('.gn-quran-words')?.textContent&&row.querySelector('.gn-context-translation')?.textContent));
    assert.ok(rows.every(row=>row.querySelector('.gn-quran-quotation')?.firstElementChild?.textContent==='﴿'));
    assert.ok(rows.every(row=>row.querySelector('.gn-quran-quotation')?.lastElementChild?.textContent==='﴾'));
    assert.ok(context.querySelector('.gn-quran-context-credit')?.textContent.includes('Tanzil'),'Proper attribution in context');
    context.open=false;
    const figure=d.querySelector('#gn-scholar-layer .gn-note-entry .gn-verse-source-excerpt');
    assert.ok(figure,'Inline note shows a verified Qurʾānic excerpt: '+noteId);
    assert.equal(figure.querySelector('.gn-quran-words')?.textContent,verse);
    assert.equal(figure.querySelector('.gn-quran-quotation')?.firstElementChild?.textContent,'﴿');
    assert.equal(figure.querySelector('.gn-quran-quotation')?.lastElementChild?.textContent,'﴾');
    d.querySelector('#gn-scholar-layer button[data-gn-close]').click();
    assert.equal(d.activeElement,marker,'Inline Notes restores source marker focus: '+noteId);
  }
  // Application popups display the same source body beside the cited material.
  for (const app of book.apps.filter(item => supplement.applications[item.id])) {
    await navigate(w, {id:app.n});
    const opener = d.querySelector('[data-gn-app-popup="' + app.id + '"]');
    assert.ok(opener, 'Existing application popup trigger ' + app.id);
    opener.focus({preventScroll:true});
    const hash = w.location.hash;
    opener.click();
    const layer = d.querySelector('#gn-scholar-layer');
    // Existing inline section buttons normalize §§256–257 to §256–257.
    // Allow only that typography; all wording and cited anchors remain exact.
    const normalizeSectionMark = text => text.replace(/§{1,2}\s*/g, '§');
    const applicationBody = layer.querySelector('.gn-layer-note > p').textContent;
    assert.equal(normalizeSectionMark(applicationBody), normalizeSectionMark(app.text), 'Original application text remains complete: ' + app.id);
    for (const note of supplement.applications[app.id]) assert.ok(applicationBody.includes(note.anchor_en), 'Exact cited application anchor: ' + note.id);
    for (const note of supplement.applications[app.id]) assertBodyAndLinks(layer.querySelector('[data-application-source="' + note.id + '"]'), note);
    d.querySelector('#gn-scholar-layer button[data-gn-close]').click();
    assert.equal(d.activeElement, opener);
    assert.equal(w.location.hash, hash);
  }
  for (const key of ['lang', 'vowels', 'theme', 'fontScale', 'showNotes']) assert.equal(JSON.parse(w.localStorage.getItem('daruri-reader-v2'))[key], preferences[key], key + ' preference retained');
  assert.equal(errors.length, 0, errors.join('\n'));
  dom.window.close();
  assertOfflineAsset();
  console.log('PASS: all 259 section ownership/count checks; ' + noteCards + ' Notes cards; 542 original notes, 50 Quran references (including two qualified possible §1 parallels), 33 hadith notes and three withheld allusions; all 12 application source notes scoped only to their primary sections and popups; exact bodies/labelled links and URL-less HAD-R189 preserved; source groups first; no duplicate DOM/source IDs; Tab/Shift-Tab wrap, close/Escape focus, route, scroll and preferences retained; source data included in offline ZIP and service worker.');
})().catch(error => {console.error(error); process.exitCode = 1;});
