'use strict';
/* Run: node daruri/qa/verify-reading-desk-redesign.js */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(base,name),'utf8');
const js=read('reading-desk.js'),css=read('reading-desk.css'),dict=read('reading-desk-dictionary.js'),sw=read('sw.js'),bundle=read('download-bundle.js');
for(const [name,source] of Object.entries({'reading-desk.js':js,'reading-desk-dictionary.js':dict,'sw.js':sw,'download-bundle.js':bundle}))new vm.Script(source,{filename:name});
for(const name of ['matching','render','dateLine','sortItems','showContext','afterReader','openSource','toDesk','enterDeskFromText','returnToReading','restoreDeskReturnState','updatePrintSheet','exportMarkdown','importFile','saveEditor','ensureVisualsToggle']){
 const pattern=new RegExp('function '+name+'\\(');
 assert(pattern.test(js),'missing Reading Desk function '+name);
}
for(const mark of ["dateSource:'legacy-unknown'","dateSource:'recorded'","modified:editor.updated","data-section=","data-rd-print-option","sourceKey(r.target)","gn-rd-visuals-toggle","gn-rd-indicators"]){
 assert(js.includes(mark),'missing functionality '+mark);
}
assert(js.includes("contentFields=['kind','target','title','body','deleted','standalone']"),'backup merge should ignore metadata-only differences');
assert(css.includes('.gn-rd-mobile-detail-open'),'mobile detail view missing');
assert(css.includes('.gn-rd-inline-panel'),'in-text saved-note panel missing');
assert(css.includes('.gn-rd-print-bilingual'),'bilingual print presentation missing');
assert(sw.includes('20261021-readingdesk3'),'reading desk cache invalidation missing');
assert(bundle.includes('20261021-readingdesk3'),'downloadable bundle cache invalidation missing');
assert(dict.includes("dateSource:'recorded'"),'dictionary bookmark date provenance missing');
const at=Date.UTC(2026,9,19),items=[
 {id:'quote',kind:'quote',target:{kind:'quote',section:'1',segment:0,lang:'en',quote:'argument'},created:at,updated:at,dateSource:'recorded'},
 {id:'mine',kind:'note',target:{kind:'paragraph',section:'1',segment:0,lang:'en'},title:'Later observation',body:'Compare sources',created:at+86400000,updated:at+86400000,dateSource:'recorded'},
 {id:'legacy',kind:'section',target:{kind:'section',section:'1'},created:0,updated:at+86400000,dateSource:'legacy-unknown'}
];
const memory={'gnamma-reading-desk-v1':JSON.stringify({format:'gnamma-reading-desk',version:1,items})};
const listeners={},main={innerHTML:''};
const document={
 querySelector:q=>q==='#mainContent'?main:null,
 querySelectorAll:()=>[],
 addEventListener:(type,fn)=>(listeners[type]??=[]).push(fn),
 activeElement:{focus(){}},
 body:{append(){},classList:{add(){},remove(){},toggle(){}}}
};
const state={route:'bookmarks',n:1,bookmarks:[],focusLevel:0};
const ctx={state,book:{glossary:[],index:[]},notes:new Map(),apps:new Map(),
 sections:new Map([['1',{title:'Introduction',segments:[{ar:'نص عربي',en:'the argument follows'}]}]]),
 sectionRef:n=>'§'+n,setLegacyBookmarks(){},notify(){},navigate(){}};
const sandbox={window:{scrollY:0,scrollTo(){}},document,
 localStorage:{getItem:key=>memory[key]??null,setItem:(k,v)=>memory[k]=v},
 sessionStorage:{getItem(){return null},setItem(){},removeItem(){}},
 location:{hash:'#bookmarks',href:'https://example.org/daruri/index.html'},
 MutationObserver:class{observe(){}},matchMedia:()=>({matches:false}),
 requestAnimationFrame:fn=>fn(),CSS:{escape:x=>x,highlights:new Map()},URL,Intl,Date,Math,console,setTimeout,clearTimeout};
vm.runInNewContext(js,sandbox);
const desk=sandbox.window.GnammaReadingDesk.create(ctx);
desk.render();
assert.equal(desk.records().length,3);
assert(main.innerHTML.includes('original date unknown'),'migration should not fabricate dates');
assert(main.innerHTML.includes('id="gn-rd-sort"')&&main.innerHTML.includes('id="gn-rd-source"'),'missing filters');
assert(main.innerHTML.indexOf('>Later observation</strong>')<main.innerHTML.indexOf('>argument</strong>'),'creation-order default incorrect');
function dispatch(type,target){for(const handler of listeners[type]||[])handler({target:{...target,closest(){return this}},preventDefault(){},stopImmediatePropagation(){}})}
dispatch('click',{dataset:{rd:'filter',value:'mine'}});
assert(main.innerHTML.includes('>Later observation</strong>')&&!main.innerHTML.includes('>argument</strong>'),'personal notes not isolated');
dispatch('click',{dataset:{rd:'filter',value:'all'}});
dispatch('change',{id:'gn-rd-sort',value:'source'});
assert(main.innerHTML.includes('value="source" selected'),'sorting control failed');
console.log('PASS Reading Desk: syntax, schemas, dates, category/sort behavior, cache and print/anchor invariants');
