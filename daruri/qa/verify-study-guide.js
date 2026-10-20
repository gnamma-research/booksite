/* DOM integration checks. Install jsdom separately and set NODE_PATH if needed.
   These exercise real reader code; visual QA still belongs in a browser. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {JSDOM, ResourceLoader, VirtualConsole} = require('jsdom');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const runtime = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'study-guide-data.js'), 'utf8'), runtime);
const lessons = runtime.window.DARURI_STUDY_DATA.lessons;
const levels = ['basic', 'intermediate', 'advanced'];
assert.equal(lessons.length, 28);
assert.equal((html.match(/class="sg-fallback-level"/g) || []).length, 84);
for (const l of lessons) for (const level of levels) {
  assert.ok(html.includes(l.levels[level].objective.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')), 'Fallback objective: ' + l.id + '/' + level);
}
class LocalAssets extends ResourceLoader {
  fetch(url) {
    const u = new URL(url);
    if (u.origin !== 'https://gnamma-research.github.io') return null;
    const relative = u.pathname.replace(/^\/booksite\//, '');
    const filename = path.resolve(root, '..', relative);
    if (!filename.startsWith(path.resolve(root, '..') + path.sep) || !fs.existsSync(filename)) return null;
    return Promise.resolve(fs.readFileSync(filename));
  }
}
async function makeDOM(hash, seed = {}) {
  const errors = [];
  const output = new VirtualConsole();
  output.on('jsdomError', error => {
    if (!/Could not parse CSS stylesheet/.test(error.message)) errors.push(error.message + (error.detail?.stack || ''));
  });
  const diagnosticHTML=html.replace('bind();bindReaderEnhancements();', 'window.__studyQA={state,gnCrossView,gnReferenceViews,gnCaptureReferenceView};bind();bindReaderEnhancements();');
  const dom = new JSDOM(diagnosticHTML, {
    url:'https://gnamma-research.github.io/booksite/daruri/' + hash,
    resources:new LocalAssets(), runScripts:'dangerously', pretendToBeVisual:true, virtualConsole:output,
    beforeParse(w) {
      w.matchMedia = q => ({matches:false, media:q, addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
      w.scrollTo = (x,y) => {w.__scroll = typeof x === 'object' ? x.top || 0 : y || 0;};
      w.scrollBy = () => {};
      Object.defineProperty(w, 'scrollY', {get:() => w.__scroll || 0});
      w.HTMLElement.prototype.scrollIntoView = function() {w.__scrolledTo = this.id;};
      w.HTMLElement.prototype.getClientRects = function() {return [{top:0,left:0,width:100,height:44}];};
      w.ResizeObserver = class {observe(){} disconnect(){} unobserve(){}};
      w.IntersectionObserver = class {observe(){} disconnect(){} unobserve(){}};
      w.CSS = {escape:s => String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&'),supports:() => true};
      w.TextEncoder = TextEncoder;
      w.TextDecoder = TextDecoder;
      w.print = () => {w.dispatchEvent(new w.Event('afterprint'));};
      w.navigator.clipboard = {writeText:async s => {w.__copied = s;}};
      w.localStorage.setItem('daruri-reader-v2', JSON.stringify({lang:'english', vowels:false, theme:'dark',fontScale:1.1,...seed}));
    }
  });
  await new Promise(resolve => dom.window.addEventListener('load', resolve, {once:true}));
  await settle();
  assert.equal(errors.length, 0, errors.join('\n'));
  return {dom,w:dom.window,d:dom.window.document,errors};
}
const settle = () => new Promise(resolve => setTimeout(resolve, 110));
const url = (id,level) => '#study?topic=' + id + '&level=' + level;
async function navigate(w, hash) {w.location.hash = hash; await settle();}
async function click(w, d, selector) {const el = d.querySelector(selector); assert.ok(el, 'Missing control ' + selector); el.click(); await settle();}

(async () => {
  const {dom,w,d,errors} = await makeDOM('#study');
  assert.equal(d.querySelectorAll('.sg-card').length,28);
  assert.equal(d.querySelectorAll('.sg-unit').length,8);
  assert.equal(d.querySelectorAll('.sg-levels a').length,3);
  const readingPrefs = JSON.parse(w.localStorage.getItem('daruri-reader-v2'));
  for (const l of lessons) for (const level of levels) {
    await navigate(w, url(l.id,level));
    assert.equal(d.querySelector('#sg-title')?.textContent,l.title);
    assert.equal(d.querySelector('.sg-levels [aria-current]')?.textContent,({basic:'BasicFoundations',intermediate:'IntermediateClose Reading',advanced:'AdvancedResearch'})[level]);
    assert.equal(d.querySelectorAll('.sg-readings>li').length,l.levels[level].sections.length);
    assert.equal(d.querySelectorAll('#sg-task>ol>li').length,l.levels[level].tasks.length);
    assert.equal(d.querySelectorAll('.sg-feedback>ol>li').length,l.levels[level].feedback.length);
    for (const a of d.querySelectorAll('.sg-readings a[data-sg-source]')) assert.ok(a.getAttribute('href').includes('&lesson=' + l.id + '&level=' + level));
  }
  // Each question's actual reader jump, next assigned passage and contextual return.
  for (const l of lessons) {
    await navigate(w, url(l.id,'basic'));
    const feedback = d.querySelector('.sg-feedback'); feedback.open = true;
    w.scrollTo({top:480});
    await click(w,d,'.sg-readings [data-sg-source]');
    assert.ok(d.querySelector('.reader'));
    assert.equal(w.location.hash,'#section=' + l.levels.basic.sections[0] + '&lesson=' + l.id + '&level=basic');
    assert.ok(d.querySelector('#sg-assignment'));
    if (l.levels.basic.sections.length > 1) {
      await click(w,d,'#sg-assignment .sg-primary[data-sg-source]');
      assert.ok(w.location.hash.startsWith('#section=' + l.levels.basic.sections[1] + '&'));
    }
    await click(w,d,'#sg-assignment [data-sg-back]');
    assert.equal(w.location.hash,url(l.id,'basic'));
    assert.equal(d.querySelector('.sg-feedback').open,true,'Open feedback restored');
    assert.equal(w.scrollY,480,'Lesson scroll restored');
  }
  // Search/filter state and level selection stay independent of reading preferences.
  await navigate(w,'#study?level=intermediate');
  d.querySelector('#sg-filter').value = 'qiyās';
  d.querySelector('#sg-filter').dispatchEvent(new w.Event('input',{bubbles:true}));
  d.querySelector('#sg-unit').value = '6';
  d.querySelector('#sg-unit').dispatchEvent(new w.Event('change',{bubbles:true}));
  const filtered = d.querySelectorAll('.sg-card').length; assert.ok(filtered > 0 && filtered < 28);
  await click(w,d,'.sg-card h3 a');
  await click(w,d,'.sg-levels a[href$="level=advanced"]');
  assert.equal(d.activeElement.id,'sg-title');
  await click(w,d,'.sg-breadcrumb [data-sg-nav]');
  assert.equal(d.querySelector('#sg-filter').value,'qiyās');
  assert.equal(d.querySelector('#sg-unit').value,'6');
  await navigate(w,url('transmission','basic'));
  await click(w,d,'[data-sg-complete]');
  assert.equal(JSON.parse(w.localStorage.getItem('daruri-study-v1')).done['transmission:basic'],true);
  await click(w,d,'.sg-levels a[href$="level=advanced"]');
  assert.equal(d.querySelector('[data-sg-complete]').getAttribute('aria-pressed'),'false');
  await click(w,d,'[data-sg-copy]');
  assert.equal(w.__copied,'https://gnamma-research.github.io/booksite/daruri/' + url('transmission','advanced'));
  const oldDetails = [...d.querySelectorAll('#mainContent details')].map(x=>x.open);
  await click(w,d,'[data-sg-print]');
  assert.deepEqual([...d.querySelectorAll('#mainContent details')].map(x=>x.open),oldDetails,'Print restores disclosure state');
  await click(w,d,'#searchBtn');
  await click(w,d,'[data-search-kind="study"]');
  const input = d.querySelector('#globalSearch'); input.value='coercion'; input.dispatchEvent(new w.Event('input',{bubbles:true}));
  assert.ok(d.querySelector('[data-sg-open="coercion"]'));
  await click(w,d,'[data-sg-open="coercion"]');
  assert.equal(w.location.hash,url('coercion','advanced'));
  assert.equal(d.querySelector('#searchOverlay').hidden,true);
  for (const key of ['lang','vowels','theme','fontScale']) assert.equal(JSON.parse(w.localStorage.getItem('daruri-reader-v2'))[key],readingPrefs[key],key + ' preserved');
  await navigate(w,url('purpose','basic'));
  w.scrollTo({top:480});
  await click(w,d,'.sg-readings [data-sg-source]');
  while (d.querySelector('#sg-assignment .sg-primary[data-sg-source]')) await click(w,d,'#sg-assignment .sg-primary[data-sg-source]');
  await click(w,d,'#sg-assignment [data-sg-task]');
  assert.equal(w.__scrolledTo,'sg-task','Final reading returns to task');
  assert.equal(d.activeElement.id,'sg-task');
  await navigate(w,'#study?topic=missing&level=__proto__');
  assert.equal(d.querySelectorAll('.sg-card').length,28);
  assert.match(d.querySelector('.sg-notice').textContent,/not found/);
  await navigate(w,'#section=%E0%A4%A');
  assert.ok(d.querySelector('.reader'),'Malformed URL does not crash reader');
  assert.equal(errors.length,0,errors.join('\n'));
  dom.window.close();
  // A shared source URL still has a lesson return without prior session state.
  const direct = await makeDOM('#section=81&lesson=transmission&level=intermediate');
  assert.ok(direct.d.querySelector('#sg-assignment'));
  await click(direct.w,direct.d,'#sg-assignment [data-sg-back]');
  assert.equal(direct.w.location.hash,url('transmission','intermediate'));
  assert.equal(direct.errors.length,0,direct.errors.join('\n'));
  direct.dom.window.close();
  console.log('PASS: all 84 lessons render; 28 reading sequences and contextual returns; feedback/scroll, filters, keyboard focus, independent progress, print, share, global search, preferences, direct URLs and malformed URLs.');
})().catch(error => {console.error(error);process.exitCode=1;});
