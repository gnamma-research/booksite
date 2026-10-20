#!/usr/bin/env node
/**
 * Bidāya application prose links and contextual-return regression checks.
 * Run: NODE_PATH=/path/to/node_modules node daruri/qa/verify-application-links.js
 * Requires jsdom and the exact edition, dictionary, source-reference and study
 * scripts beside index.html. Does not fetch data or rewrite reader/source files.
 * Executes the actual reader scripts. DOM geometry is simulated: these checks
 * verify navigation, focus and scroll bookkeeping, not visual browser layout.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
let jsdom;
try { jsdom = require('jsdom'); }
catch (error) {
  const available = '/tmp/daruri-node-test/node_modules/jsdom';
  if (!fs.existsSync(available)) throw new Error('Install jsdom or set NODE_PATH to its node_modules directory.', {cause:error});
  jsdom = require(available);
}
const {JSDOM, VirtualConsole} = jsdom;
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const expectedTextDigest = '02f42dfffe6e4308e9be2ed505248fb7611eee3bc6e0e14fa5189b654040fc2e';
const expectedRefs = {
  B01:['146','217'], B05:['43'], B06:['47'], B10:['64'], B15:['171'],
  B16:['201'], B19:['211'], B21:['217'], B24:['227'],
  B25:['237','245'], B28:['256','257']
};
const coreAssets = new Set(['dictionary-r3-20261020.js', 'edition-r3-20261020.js',
  'source-reference-data.js', 'study-guide-data.js', 'study-guide.js']);
const optionalAssets = new Set(['print.js', 'lesson-print.js', 'download-bundle.js']);
const tests = [];
const test = (name, work) => tests.push({name, work});
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const copy = value => JSON.parse(JSON.stringify(value));
let enhancedShellHTML=null, fallbackCards=null;

async function harness({hash='#applications', width=1280, height=900, session={}}={}) {
  const errors = [], warnings = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error));
  virtualConsole.on('error', (...args) => errors.push(new Error(args.join(' '))));
  virtualConsole.on('warn', (...args) => warnings.push(args.join(' ')));
  // CSS layout is outside this suite; retain all markup and actual scripts.
  const dom = new JSDOM(enhancedShellHTML||html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ''), {
    url:'https://gnamma-research.github.io/booksite/daruri/'+hash,
    runScripts:'outside-only', pretendToBeVisual:true, virtualConsole
  });
  const w=dom.window, d=w.document;
  let scrollX=0, scrollY=0, rafId=0;
  const rafs=new Map();
  Object.defineProperties(w, {
    innerWidth:{value:width, configurable:true}, innerHeight:{value:height, configurable:true},
    scrollX:{get:()=>scrollX}, scrollY:{get:()=>scrollY}, pageXOffset:{get:()=>scrollX}, pageYOffset:{get:()=>scrollY}
  });
  w.scrollTo=(x,y)=>{scrollX=Number(typeof x==='object'?x.left??scrollX:x)||0;scrollY=Math.max(0,Number(typeof x==='object'?x.top??scrollY:y)||0);d.documentElement.scrollTop=scrollY;};
  w.scrollBy=(x,y)=>w.scrollTo({left:scrollX+Number(typeof x==='object'?x.left||0:x||0),top:scrollY+Number(typeof x==='object'?x.top||0:y||0)});
  w.requestAnimationFrame=callback=>{rafs.set(++rafId,callback);return rafId;};
  w.cancelAnimationFrame=id=>rafs.delete(id);
  w.matchMedia=query=>({media:query,matches:query.split(',').some(part=>{
    if (/prefers-color-scheme\s*:\s*dark/.test(part)) return false;
    if (/pointer\s*:\s*coarse/.test(part) && width>1024) return false;
    if (/orientation\s*:\s*landscape/.test(part) && width<=height) return false;
    if (/orientation\s*:\s*portrait/.test(part) && width>height) return false;
    for (const m of part.matchAll(/(min|max)-(width|height)\s*:\s*(\d+)px/g)) {
      const actual=m[2]==='width'?width:height, limit=Number(m[3]);
      if (m[1]==='min'?actual<limit:actual>limit) return false;
    }
    return true;
  }),addEventListener(){},removeEventListener(){},addListener(){},removeListener(){},dispatchEvent(){return true;}});
  w.IntersectionObserver=class {observe(){} unobserve(){} disconnect(){}};
  w.ResizeObserver=class {observe(){} unobserve(){} disconnect(){}};
  // JSDOM omits this standard browser API used by the existing reader.
  w.CSS={escape(value){const chars=Array.from(String(value));return chars.map((c,i)=>{
    const n=c.codePointAt(0);
    if(n===0)return '\uFFFD';
    if(n<32||n===127||(/[0-9]/.test(c)&&(i===0||(i===1&&chars[0]==='-'))))return '\\'+n.toString(16)+' ';
    if(c==='-'&&chars.length===1)return '\\-';
    return n>=128||/[a-zA-Z0-9_-]/.test(c)?c:'\\'+c;
  }).join('');}};
  w.HTMLElement.prototype.getBoundingClientRect=function(){
    const section=this.closest('[data-reading-section]');
    const absolute=(section?(Number(section.dataset.readingSection)||259)*1100:0)+260+(Number(this.closest('[data-segment]')?.dataset.segment)||0)*240;
    const top=absolute-scrollY;
    return {x:0,y:top,left:0,top,width:720,height:220,right:720,bottom:top+220,toJSON(){return this;}};
  };
  w.HTMLElement.prototype.getClientRects=function(){return this.closest('[hidden]')?[]:[this.getBoundingClientRect()];};
  w.HTMLElement.prototype.scrollIntoView=function(){w.scrollTo({top:w.scrollY+this.getBoundingClientRect().top});};
  for (const [key,value] of Object.entries(session)) w.sessionStorage.setItem(key,JSON.stringify(value));
  if(!fallbackCards){
    fallbackCards=[...d.querySelectorAll('.fb-case')].map(card=>({
      id:card.id,paragraphs:[...card.querySelectorAll(':scope > p')].map(p=>({text:p.textContent,links:[...p.querySelectorAll('a[href^="#section="]')].map(a=>a.getAttribute('href').slice(9))}))
    }));
    // The static fallback is independently checked above. Cache its surrounding
    // uninitialized shell so subsequent behavioral cases need not parse it again.
    d.getElementById('fallbackReader')?.remove();
    enhancedShellHTML=d.documentElement.outerHTML;
  }
  const staticCards=fallbackCards;
  const scripts=[...d.querySelectorAll('script')];
  for (let i=0;i<scripts.length;i++) {
    const node=scripts[i];
    if (node.type && !/^(?:text|application)\/javascript$/.test(node.type)) continue;
    let code=node.textContent, filename='inline-'+i+'.js';
    if (node.src) {
      filename=path.basename(new URL(node.src).pathname);
      if (optionalAssets.has(filename)) continue;
      assert(coreAssets.has(filename),'Unreviewed runtime dependency: '+filename);
      assert(fs.existsSync(path.join(root,filename)),'Missing exact runtime data: '+filename);
      code=fs.readFileSync(path.join(root,filename),'utf8');
    }
    if (code.includes('function gnLinkAppRefs(')) {
      const at=code.lastIndexOf('})();');
      assert(at>=0,'Reader closure terminator missing');
      code=code.slice(0,at)+`
        window.__applicationLinkQA={
          book:BOOK, linkRefs:gnLinkAppRefs, card:appCard,
          detail:showAppDetail, popup:gnAppPopup,
          close:()=>{closeOverlays();gnCloseLayer(false);},
          state:()=>JSON.parse(JSON.stringify(state)),
          origin:()=>gnCrossView.origin,
          readerPoint:()=>JSON.parse(JSON.stringify(readerReturn))
        };
      `+code.slice(at);
    }
    new vm.Script(code,{filename});
    w.eval(code+'\n//# sourceURL='+filename);
  }
  const h={w,d,qa:w.__applicationLinkQA,errors,warnings,staticCards,
    $(selector){const el=d.querySelector(selector);assert(el,'Missing element: '+selector);return el;},
    async settle(){
      for(let i=0;i<12;i++){
        await tick();
        const frame=[...rafs.values()];rafs.clear();
        for(const callback of frame)callback(w.performance.now());
      }
      assert.equal(errors.length,0,errors.map(error=>error.stack||String(error)).join('\n'));
    },
    async click(selectorOrElement){const el=typeof selectorOrElement==='string'?h.$(selectorOrElement):selectorOrElement;el.focus({preventScroll:true});el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true,button:0}));await h.settle();},
    async input(selector,value,event='input'){const el=h.$(selector);el.value=value;el.dispatchEvent(new w.Event(event,{bubbles:true}));await h.settle();},
    async go(value){w.location.hash=value;await h.settle();},
    close(){dom.window.close();}
  };
  assert(h.qa,'Reader did not finish initialization');
  await h.settle();
  return h;
}

function checkProse(h,paragraph,app,label) {
  assert(paragraph,label+' summary paragraph missing');
  assert.equal(paragraph.textContent,app.text,label+' preserves exact prose');
  const links=[...paragraph.querySelectorAll('[data-gn-app-section]')];
  assert.deepEqual(links.map(a=>a.dataset.gnAppSection),expectedRefs[app.id]||[],label+' printed section references');
  for(const a of links){
    assert.equal(a.tagName,'A',label+' native link');
    assert.equal(a.getAttribute('href'),'#section='+a.dataset.gnAppSection,label+' valid href');
    assert.match(a.getAttribute('aria-label')||'',/Read Darūrī/,label+' accessible section label');
  }
}
function assertReader(h,section) {
  assert.equal(h.qa.state().route,'reader');
  assert.equal(String(h.qa.state().n),String(section));
  assert.match(h.w.location.hash,new RegExp('^#section='+section+'(?:&|$)'));
}
function assertBack(h,id) {
  assert.equal(h.d.querySelectorAll('[data-gn-source-back]').length,1,'exactly one contextual return');
  assert.match(h.$('[data-gn-source-back]').textContent,new RegExp('Back to Bidāya application '+id+'$'));
  assert.equal(h.d.querySelector('#gn-app-return'),null,'legacy application return absent');
}

test('28 unchanged summaries; all four renderers and fallback preserve prose and 14 printed references',async()=>{
  const h=await harness();
  try {
    const apps=h.qa.book.apps;
    assert.equal(apps.length,28);
    assert.equal(crypto.createHash('sha256').update(JSON.stringify(apps.map(a=>({id:a.id,text:a.text})))).digest('hex'),expectedTextDigest,'edition application prose fixture');
    assert.equal(Object.keys(expectedRefs).length,11);
    assert.equal(Object.values(expectedRefs).flat().length,14);
    for(const app of apps) {
      const card=h.$('#listapp-'+app.id);
      assert.equal(card.dataset.gnApplication,app.id);
      checkProse(h,[...card.querySelectorAll(':scope > p')].find(p=>!p.classList.contains('app-meta')),app,'list '+app.id);
      const template=h.d.createElement('template');template.innerHTML=h.qa.card(app);
      assert.equal(template.content.firstElementChild.dataset.gnApplication,app.id);
      checkProse(h,template.content.querySelector('article > p'),app,'inline '+app.id);
      h.qa.detail(app.id);await h.settle();
      assert.equal(h.$('#detailContent [data-gn-application]').dataset.gnApplication,app.id);
      checkProse(h,h.$('#detailContent .note-detail p'),app,'detail '+app.id);
      h.qa.close();h.qa.popup(app.id);await h.settle();
      assert.equal(h.$('#gn-scholar-layer [data-gn-application]').dataset.gnApplication,app.id);
      checkProse(h,h.$('#gn-scholar-layer .gn-layer-note > p'),app,'popup '+app.id);
      h.qa.close();
      const fallbacks=h.staticCards.filter(card=>card.id.endsWith(app.id));
      assert(fallbacks.length,'fallback '+app.id);
      for(const fallback of fallbacks){
        const p=fallback.paragraphs.find(p=>p.text===app.text);
        assert(p,'fallback exact prose '+fallback.id);
        assert.deepEqual(p.links,expectedRefs[app.id]||[],'fallback printed references '+fallback.id);
      }
    }
  } finally {h.close();}
});

test('explicit singles, lists, range endpoints and possessives; invalid and Qur’an numbers remain plain',async()=>{
  const h=await harness();
  try {
    const cases=[
      ['See §43 for the argument.',['43']],
      ['Darūrī §§146 and 217.',['146','217']],
      ['See §§18, 43 and 47.',['18','43','47']],
      ['See §§18, 43, and 47.',['18','43','47']],
      ['§§237–245; §§256-257; §§1—3.',['237','245','256','257','1','3']],
      ['§211’s caution and §227’s restriction.',['211','227']],
      ['Q 16:106; Q 2:184; Q 2:196; 237–245; 43 examples.',[]],
      ['Invalid §0, §259 and §9999.',[]],
      ['<img src=x onerror=alert(1)> & “§43”.',['43']]
    ];
    for(const [text,expected] of cases){
      const p=h.d.createElement('p');p.innerHTML=h.qa.linkRefs(text);
      assert.equal(p.textContent,text,'exact punctuation/text: '+text);
      assert.deepEqual([...p.querySelectorAll('[data-gn-app-section]')].map(a=>a.dataset.gnAppSection),expected,'explicit references: '+text);
      assert.equal(p.querySelector('img,script'),null,'literal markup remains escaped');
    }
  } finally {h.close();}
});

test('native link modifiers retain browser handling and do not overwrite application return context',async()=>{
  const h=await harness();
  try {
    const link=h.$('#listapp-B01 > p [data-gn-app-section="146"]');
    const initialState=h.qa.state(), initialOrigin=copy(h.qa.origin()), initialHash=h.w.location.hash;
    for(const modifier of ['ctrlKey','metaKey','shiftKey','altKey']){
      let preventedBeforeHarness=null;
      const observe=event=>{
        if(event.target!==link)return;
        preventedBeforeHarness=event.defaultPrevented;
        // Suppress JSDOM's default navigation only after the app has handled the
        // event. A real browser would open/follow the native href as requested.
        event.preventDefault();
      };
      h.d.addEventListener('click',observe);
      link.dispatchEvent(new h.w.MouseEvent('click',{bubbles:true,cancelable:true,button:0,[modifier]:true}));
      h.d.removeEventListener('click',observe);
      await h.settle();
      assert.equal(preventedBeforeHarness,false,modifier+' leaves native behavior available');
      assert.deepEqual(h.qa.state(),initialState,modifier+' does not navigate this reading context');
      assert.deepEqual(copy(h.qa.origin()),initialOrigin,modifier+' does not replace contextual return');
      assert.equal(h.w.location.hash,initialHash);
    }
  } finally {h.close();}
});

test('filtered applications → detail → section → next → back restores detail, scroll, focus and filters',async()=>{
  const h=await harness();
  try {
    await h.input('#applicationFilter','B01');await h.input('#applicationBook','Marriage','change');
    h.w.scrollTo({top:735});h.$('#applicationList').scrollTop=119;
    const opener=h.$('#listapp-B01 [data-app="B01"]');await h.click(opener);
    const dialog=h.$('#infoOverlay .detail-dialog');dialog.scrollTop=311;dialog.scrollLeft=7;
    h.$('#detailContent').scrollTop=67;
    await h.click('#detailContent .note-detail [data-gn-app-section="146"]');
    assertReader(h,146);assertBack(h,'B01');assert.equal(h.$('#infoOverlay').hidden,true);
    await h.click('#readerNext');assertReader(h,147);assertBack(h,'B01');
    await h.click('[data-gn-source-back]');
    assert.equal(h.qa.state().route,'applications');
    assert.equal(h.w.location.hash,'#applications');
    assert.equal(h.$('#applicationFilter').value,'B01');assert.equal(h.$('#applicationBook').value,'Marriage');
    assert.equal(h.$('#applicationList').children.length,1);assert.equal(h.$('#applicationList').scrollTop,119);
    assert.equal(h.w.scrollY,735);assert.equal(h.$('#infoOverlay').hidden,false);
    assert.equal(h.$('#detailContent [data-gn-application]').dataset.gnApplication,'B01');
    assert.equal(h.$('#infoOverlay .detail-dialog').scrollTop,311);assert.equal(h.$('#infoOverlay .detail-dialog').scrollLeft,7);
    assert.equal(h.$('#detailContent').scrollTop,67);assert.equal(h.d.activeElement.dataset.gnAppSection,'146');
    await h.click('#detailClose');
    assert.equal(h.$('#infoOverlay').hidden,true);assert.equal(h.d.activeElement.dataset.app,'B01');
    // Existing primary/related controls were routed through the same application
    // jump path; verify they retain their destinations and gain the same return.
    await h.click('#listapp-B01 [data-app="B01"]');
    for(const [selector,section] of [['#detailContent .primary[data-gn-app-section]','18'],['#detailContent .jump-list [data-gn-app-section="197"]','197']]){
      h.$('#infoOverlay .detail-dialog').scrollTop=93;
      await h.click(selector);assertReader(h,section);assertBack(h,'B01');
      await h.click('[data-gn-source-back]');
      assert.equal(h.$('#infoOverlay').hidden,false);assert.equal(h.$('#infoOverlay .detail-dialog').scrollTop,93);assert.equal(h.d.activeElement.dataset.gnAppSection,section);
    }
  } finally {h.close();}
});

test('filtered inline list link and direct application URL each return to their original surface',async()=>{
  const h=await harness();
  try {
    await h.input('#applicationFilter','B25');h.w.scrollTo({top:440});
    await h.click('#listapp-B25 > p [data-gn-app-section="245"]');assertReader(h,245);assertBack(h,'B25');
    await h.click('[data-gn-source-back]');assert.equal(h.w.location.hash,'#applications');assert.equal(h.$('#applicationFilter').value,'B25');assert.equal(h.w.scrollY,440);
    assert.equal(h.$('#infoOverlay').hidden,true);assert.equal(h.d.activeElement.dataset.gnAppSection,'245');
    await h.go('#application=B28');assert.equal(h.$('#infoOverlay').hidden,false);
    h.$('#infoOverlay .detail-dialog').scrollTop=188;
    await h.click('#detailContent .note-detail [data-gn-app-section="257"]');assertReader(h,257);assertBack(h,'B28');
    await h.click('[data-gn-source-back]');assert.equal(h.w.location.hash,'#application=B28');assert.equal(h.$('#infoOverlay').hidden,false);
    assert.equal(h.$('#infoOverlay .detail-dialog').scrollTop,188);assert.equal(h.d.activeElement.dataset.gnAppSection,'257');
  } finally {h.close();}
});

test('mobile popup returns to the same application, reading position, popup scroll and link focus',async()=>{
  const h=await harness({hash:'#section=18',width:390,height:844});
  try {
    h.w.scrollTo({top:915});await h.click('[data-gn-app-popup="B01"]');
    h.$('.gn-layer-scroll').scrollTop=276;h.$('.gn-layer-scroll').scrollLeft=9;
    await h.click('#gn-scholar-layer [data-gn-app-section="146"]');assertReader(h,146);assertBack(h,'B01');assert.equal(h.d.querySelector('#gn-scholar-layer'),null);
    await h.click('[data-gn-source-back]');assertReader(h,18);
    assert.equal(h.w.scrollY,915);assert.equal(h.$('#gn-scholar-layer [data-gn-application]').dataset.gnApplication,'B01');
    assert.equal(h.$('.gn-layer-scroll').scrollTop,276);assert.equal(h.$('.gn-layer-scroll').scrollLeft,9);assert.equal(h.d.activeElement.dataset.gnAppSection,'146');
    await h.click('#gn-scholar-layer button[data-gn-close]');assert.equal(h.d.activeElement.dataset.gnAppPopup,'B01');assert.equal(h.w.scrollY,915);
  } finally {h.close();}
});

test('same-section popup link and desktop inline link have complete return paths',async()=>{
  const h=await harness({hash:'#section=43'});
  try {
    h.w.scrollTo({top:610});await h.click('[data-gn-app-popup="B05"]');h.$('.gn-layer-scroll').scrollTop=152;
    await h.click('#gn-scholar-layer [data-gn-app-section="43"]');assertReader(h,43);assertBack(h,'B05');
    await h.click('[data-gn-source-back]');assertReader(h,43);assert.equal(h.w.scrollY,610);assert.equal(h.$('.gn-layer-scroll').scrollTop,152);
    await h.click('#gn-scholar-layer button[data-gn-close]');
    await h.go('#section=18');h.w.scrollTo({top:870});
    await h.click('#application-B01 > p [data-gn-app-section="217"]');assertReader(h,217);assertBack(h,'B01');
    await h.click('[data-gn-source-back]');assertReader(h,18);assert.equal(h.w.scrollY,870);assert.equal(h.d.querySelector('#gn-scholar-layer'),null);assert.equal(h.$('#infoOverlay').hidden,true);assert.equal(h.d.activeElement.dataset.gnAppSection,'217');
  } finally {h.close();}
});

test('nested application jumps preserve earlier application and contents return contexts',async()=>{
  const h=await harness({hash:'#contents'});
  try {
    await h.input('#contentsFilter','alternatives');h.w.scrollTo({top:480});
    await h.click('#mainContent [data-section="18"]');assertReader(h,18);assert.match(h.$('[data-gn-source-back]').textContent,/Back to Contents/);
    h.w.scrollTo({top:700});await h.click('[data-gn-app-popup="B01"]');h.$('.gn-layer-scroll').scrollTop=211;
    await h.click('#gn-scholar-layer [data-gn-app-section="217"]');assertReader(h,217);assertBack(h,'B01');
    await h.click('[data-gn-app-popup="B21"]');h.$('.gn-layer-scroll').scrollTop=122;
    await h.click('#gn-scholar-layer [data-gn-app-section="135"]');assertReader(h,135);assertBack(h,'B21');
    await h.click('[data-gn-source-back]');assertReader(h,217);assert.equal(h.$('#gn-scholar-layer [data-gn-application]').dataset.gnApplication,'B21');assert.equal(h.$('.gn-layer-scroll').scrollTop,122);
    await h.click('#gn-scholar-layer button[data-gn-close]');assertBack(h,'B01');
    await h.click('[data-gn-source-back]');assertReader(h,18);assert.equal(h.$('#gn-scholar-layer [data-gn-application]').dataset.gnApplication,'B01');assert.equal(h.$('.gn-layer-scroll').scrollTop,211);assert.equal(h.w.scrollY,700);
    await h.click('#gn-scholar-layer button[data-gn-close]');assert.match(h.$('[data-gn-source-back]').textContent,/Back to Contents/);
    await h.click('[data-gn-source-back]');assert.equal(h.w.location.hash,'#contents');assert.equal(h.$('#contentsFilter').value,'alternatives');assert.equal(h.w.scrollY,480);
  } finally {h.close();}
});

test('external dictionary origin survives an application visit without altering its snapshot',async()=>{
  const external={view:'all',term:'ijmāʿ',q:'consensus',y:527,created:Date.now()};
  const h=await harness({hash:'#section=18',session:{'daruri-dictionary-jump-origin':external}});
  try {
    const before=copy(h.qa.origin());assert.equal(before.route,'dictionary');
    await h.click('[data-gn-app-popup="B01"]');await h.click('#gn-scholar-layer [data-gn-app-section="146"]');assertBack(h,'B01');
    await h.click('[data-gn-source-back]');await h.click('#gn-scholar-layer button[data-gn-close]');
    assert.deepEqual(copy(h.qa.origin()),before);assert.match(h.$('[data-gn-source-back]').textContent,/Back to Dictionary/);
  } finally {h.close();}
});

test('study lesson → application detail → section → back restores lesson hash, expanded card and dialog',async()=>{
  const lessonHash='#study?topic=ruling&level=intermediate';
  const h=await harness({hash:lessonHash});
  try {
    const appButton=h.$('.sg-parallels [data-app="B01"]');
    appButton.closest('details').open=true;
    h.$('.sg-feedback').open=true;
    h.w.scrollTo({top:1250});
    await h.click(appButton);h.$('#infoOverlay .detail-dialog').scrollTop=234;
    await h.click('#detailContent .note-detail [data-gn-app-section="146"]');assertReader(h,146);assertBack(h,'B01');
    await h.click('[data-gn-source-back]');
    assert.equal(h.w.location.hash,lessonHash);assert.equal(h.qa.state().route,'study');
    assert.equal(h.$('.sg-parallels [data-app="B01"]').closest('details').open,true);
    assert.equal(h.$('.sg-feedback').open,true);assert.equal(h.w.scrollY,1250);
    assert.equal(h.$('#infoOverlay').hidden,false);assert.equal(h.$('#infoOverlay .detail-dialog').scrollTop,234);
    assert.equal(h.d.activeElement.dataset.gnAppSection,'146');
    await h.click('#detailClose');assert.equal(h.d.activeElement.dataset.app,'B01');
  } finally {h.close();}
});

(async()=>{
  let failed=0;
  const selected=process.env.DARURI_QA_FILTER?tests.filter(t=>new RegExp(process.env.DARURI_QA_FILTER).test(t.name)):tests;
  assert(selected.length,'No checks matched DARURI_QA_FILTER');
  for(const {name,work} of selected){
    try {await work();process.stdout.write('PASS '+name+'\n');}
    catch(error){failed++;process.stderr.write('FAIL '+name+'\n'+error.stack+'\n');}
  }
  process.stdout.write(`\n${selected.length-failed}/${selected.length} application-link checks passed. Actual reader + edition/dictionary/source/study scripts executed; print/download excluded. Geometry is simulated; browser visual layout is not asserted.\n`);
  if(failed)process.exitCode=1;
})().catch(error=>{process.stderr.write(error.stack+'\n');process.exitCode=1;});
