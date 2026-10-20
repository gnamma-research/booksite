#!/usr/bin/env node
/* Full reader subject-index integration; all declared local scripts execute.
   Simulated geometry checks state, scrolling and focus, not browser typography. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
let enhancedShellHTML=null,fallbackCards=null;
async function harness({hash='#index', width=1280, height=900, session={}}={}) {
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
  w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;
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
    const index=d.querySelector('#fallbackReader #index');
    assert(index,'Static subject index present');
    const headings=[...index.querySelectorAll('.fb-index-entry')].map(el=>el.querySelector('summary').firstChild.textContent.trim());
    assert.equal(headings.length,302,'Static A–Z retains every heading');
    assert.deepEqual(headings,headings.slice().sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base',ignorePunctuation:true,numeric:true})),'Static entries are alphabetical');
    assert.equal(index.querySelectorAll('.fb-subject-group').length,9,'Eight subject groups and edition group in fallback');
    for(const a of index.querySelectorAll('.fb-subject-group a'))assert(d.getElementById(a.hash.slice(1)),'Static subject link target '+a.hash);
    fallbackCards={headings};
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
      assert(!/^[a-z]+:/.test(node.getAttribute('src')), 'Only local declared scripts are executed');
      assert(fs.existsSync(path.join(root,filename)),'Missing exact runtime data: '+filename);
      code=fs.readFileSync(path.join(root,filename),'utf8');
    }
    if (code.includes('function gnCaptureReferenceView(')) {
      const at=code.lastIndexOf('})();');
      assert(at>=0,'Reader closure terminator missing');
      code=code.slice(0,at)+`
        window.__subjectIndexQA={
          book:BOOK,
          state:()=>JSON.parse(JSON.stringify(state)),
          capture:()=>JSON.parse(JSON.stringify(gnCaptureReferenceView())),
          origin:()=>gnCrossView.origin,
          navigate, showTagged
        };
      `+code.slice(at);
    }
    new vm.Script(code,{filename});
    w.eval(code+'\n//# sourceURL='+filename);
  }
  const h={w,d,qa:w.__subjectIndexQA,errors,warnings,staticCards,
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

function fields(state){return Object.fromEntries(['indexQuery','indexView','indexFacet','indexQuestion','indexOpen'].map(k=>[k,state[k]]));}
async function roundTrip(h,{section,scroll=382}={}){
 const button=section?h.$(`#indexList [data-section="${section}"]`):h.$('#indexList [data-section]');
 button.focus({preventScroll:true});h.w.scrollTo(0,scroll);
 const scroller=button.closest('.subentry-list');scroller.scrollTop=37;
 const before=h.qa.capture(),target=button.dataset.section;
 await h.click(button);
 assert.equal(h.qa.state().route,'reader');assert.equal(String(h.qa.state().n),target);
 assert.match(h.$('[data-gn-source-back]').textContent,/Back to Subject index/);
 assert.deepEqual(fields(h.qa.origin().snapshot),fields(before.snapshot),'Exact new index fields captured');
 await h.click('[data-gn-source-back]');
 assert.equal(h.qa.state().route,'index');assert.deepEqual(fields(h.qa.state()),fields(before.snapshot),'Index query/view/facet/question/open map restored');
 assert.equal(h.w.scrollY,scroll,'Reference scroll position restored');
 assert.equal(h.d.activeElement.dataset.section,target,'Opener focus restored');
 assert.equal(h.d.activeElement.closest('.subentry-list').scrollTop,37,'Nested index scroll restored');
 const after=h.qa.capture();assert.deepEqual(after.ui.details,before.ui.details,'Exact disclosures restored');
}
if(require.main===module)(async()=>{
 const h=await harness();
 try{
  assert(h.w.DaruriSubjectIndex,'Module loaded from declared scripts');
  assert.equal(h.qa.state().indexView,'subjects');assert.equal(h.d.querySelectorAll('#indexList .subject-group').length,9);
  await h.click('[data-subject-view="az"]');
  assert.equal(h.d.querySelectorAll('#indexList .index-record').length,302);
  await h.input('#indexFacet','people','change');await h.input('#indexFilter','ghazali');
  assert.equal(h.d.querySelectorAll('#indexList .index-record').length,1);
  assert.match(h.$('#indexList .index-record>summary').textContent,/Ghazālī/);
  await roundTrip(h,{scroll:382});
  await h.input('#indexFacet','all','change');await h.input('#indexFilter','');
  await h.click('[data-subject-view="subjects"]');
  await h.click('[data-index-question="error"]');await h.input('#indexFilter','sin');
  assert.equal(h.qa.state().indexQuestion,'error');assert(h.d.querySelector('#indexList [data-section="242"]'));
  await roundTrip(h,{section:'242',scroll:713});
  await h.click('[data-index-clear-question]');await h.input('#indexFilter','');
  await h.input('#indexFacet','people','change');
  await h.click('[data-index-topic="Abrogation (naskh)"]');
  assert.equal(h.qa.state().indexFacet,'all','Redirect clears restrictive facet');assert.equal(h.qa.state().indexQuestion,'');
  assert([...h.d.querySelectorAll('#indexList .index-record>summary')].some(e=>e.firstChild.textContent==='Abrogation (naskh)'));
  await h.input('#indexFilter','');await h.input('#indexFacet','people','change');
  h.qa.navigate('reader','243');await h.settle();
  const tag=h.d.querySelector('#mainContent [data-tag]');assert(tag,'Actual reader concept link available');
  await h.click(tag);
  assert.equal(h.qa.state().route,'index');assert.equal(h.qa.state().indexFacet,'all','Reader concept jump clears restrictive facet');assert.equal(h.qa.state().indexQuestion,'');
  assert(h.d.querySelector('#indexList .index-record'),'Reader concept resolves a visible entry');
  assert(h.d.querySelectorAll('#indexTargetRow').length<=1,'Crosslisting never duplicates focused target ID');
  await h.input('#indexFilter','قياس');
  assert([...h.d.querySelectorAll('#indexList .index-record>summary')].some(e=>e.firstChild.textContent==='Analogy'),'Actual Arabic synonym search');
  assert.equal(h.qa.book.index.length,302);assert.equal(h.qa.book.index.reduce((n,e)=>n+e.sub.length,0),1011);
  console.log('PASS: full reader loads all local scripts; static302-entryA–Z/9groups; subject/A–Z/facet/search; exact section-return state, focus, scroll and disclosures; question route; redirects; reader concept jump; Arabic search.');
 }finally{h.close();}
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
module.exports={harness};
