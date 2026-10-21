'use strict';
/* Darūrī Reading Desk regressions. Run: node daruri/qa/verify-reading-desk-redesign.js
   Uses only Node built-ins; no network, browser account or user notes required. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(base,file),'utf8');
const js=read('reading-desk.js'),css=read('reading-desk.css'),dict=read('reading-desk-dictionary.js');
const sw=read('sw.js'),bundle=read('download-bundle.js');
for(const [name,source] of Object.entries({'reading-desk.js':js,'reading-desk-dictionary.js':dict,'sw.js':sw,'download-bundle.js':bundle}))
 new vm.Script(source,{filename:name});
const matches=(text,needle)=>text.includes(needle);
function ensure(condition,message){assert.ok(condition,message);}
const checks=[];
function test(name,fn){fn();checks.push(name);console.log('PASS '+name);}
const at=Date.UTC(2026,9,20,8),longText='EARLY '+('word '.repeat(210))+' EXACT QUOTATION AT END';
const sectionMap=new Map([
 ['190',{title:'Earlier section',segments:[{ar:'نص سابق',en:'EARLIER SAVED WORDS and a continuation'}]}],
 ['191',{title:'Current section',segments:[{ar:'النص العربي المقابل',en:longText}]}]
]);
function note(id,section,body='A personal scholarly observation'){
 return {id,kind:'note',target:{kind:'paragraph',section,segment:0,lang:'en'},
  body,title:'Observation '+id,created:at,updated:at,modified:0,dateSource:'recorded',deleted:0};
}
const quoted={id:'quotation-note',kind:'note',
 target:{kind:'quote',section:'191',segment:0,lang:'en',quote:'EXACT QUOTATION AT END',offset:1050},
 body:'The point at the end matters',title:'Specific quotation',created:at+100,updated:at+100,dateSource:'recorded'};
const archived=note('orphan','999','Never discard an orphaned research note');
archived.target.futureSourceField='must-survive';
const future={id:'future',kind:'future-kind',title:'Future research entry',body:'Preserve opaque content',
 target:{kind:'external-anchor-v2',identifier:'opaque'},created:at,updated:at,extra:{version:17}};
const legacy={id:'legacy',kind:'section',target:{kind:'section',section:'191'},created:0,updated:at,dateSource:'legacy-unknown'};
function backup(items,extra={}){return JSON.stringify({...extra,format:'gnamma-reading-desk',version:1,items});}
function boot(source,opts={}){
 let raw=source,writes=0,notes=[],sheet='',modal=null,preview=null;
 const events={};
 const activeFocus={isConnected:true,focus(){}};
 const main={innerHTML:'',prepend(){},querySelector(){return null}};
 const sectionSelector={value:'190',focus(){}},segmentSelector={value:'0',innerHTML:''};
 function side(text){
  const child={textContent:text,length:text.length,parentElement:{closest(){return false}}};
  return {nodes:[child],querySelectorAll(){return []}};
 }
 const earlier=side(sectionMap.get('190').segments[0].en),later=side(longText);
 function root(which){return {querySelector(query){
  return query.includes('.passage-en')?(which==='190'?earlier:later):null;
 }};}
 const grid=(number)=>({dataset:{segment:'0'},nextElementSibling:null,
  closest(){return {dataset:{readingSection:number}}},after(el){this.nextElementSibling=el},scrollIntoView(){}});
 const grids=[grid('190'),grid('191')],reader={
  querySelector(){return null},querySelectorAll(q){return q==='.passage-grid'?grids:[]}
 };
 const state={route:'bookmarks',n:'191',lang:'parallel',bookmarks:[],focusLevel:0,focusMode:false};
 const notifications=[];
 const context={state,book:{glossary:[],index:[]},sections:sectionMap,notes:new Map(),apps:new Map(),
  sectionRef:n=>'§'+n,setLegacyBookmarks(){},syncChrome(){},notify:n=>notifications.push(n),
  navigate(route){state.route=route;if(route==='bookmarks')desk.render()},
  goSection(n){state.n=String(n);state.route='reader'}};
 const doc={
  querySelector(q){
   if(q==='#mainContent')return main;
   if(q==='#mainContent .gn-rd-page'&&state.route==='bookmarks')return main;
   if(q==='#reader'&&state.route==='reader')return reader;
   if(q==='#gn-rd-relink-shade')return modal;
   if(q==='#gn-rd-relink-section')return modal?sectionSelector:null;
   if(q==='#gn-rd-relink-segment')return modal?segmentSelector:null;
   if(q==='#gn-continuous-190')return root('190');
   if(q==='#gn-continuous-191')return root('191');
   return null;
  },
  querySelectorAll(){return []},
  addEventListener:(type,fn)=>(events[type]??=[]).push(fn),
  activeElement:activeFocus,
  createElement(){
   const element={innerHTML:'',dataset:{},id:'',className:'',style:{},setAttribute(){},
    remove(){if(element===modal)modal=null},querySelector(q){
     if(q==='#gn-rd-relink-section')return sectionSelector;
     if(q==='#gn-rd-relink-segment')return segmentSelector;
     if(q==='#gn-rd-print-order-summary')return {textContent:''};
     if(q==='#gn-rd-print-sheet-body')return {set innerHTML(value){sheet=value},get innerHTML(){return sheet}};
     return {focus(){}};
    },querySelectorAll(){return []}};
   preview=element;return element;
  },
  createTreeWalker(container){
   let i=-1;return {nextNode(){this.currentNode=container.nodes[++i]||null;return !!this.currentNode}};
  },
  createRange(){return {setStart(){},setEnd(){},cloneContents(){return {querySelectorAll(){return []},textContent:''}}}},
  body:{append(el){if(el.id==='gn-rd-relink-shade')modal=el},classList:{add(){},remove(){},toggle(){}}}
 };
 const localStorage={getItem(){return opts.sharedStore?opts.sharedStore.value:raw},setItem(k,value){
  writes++;if(opts.failWrites)throw Error('QuotaExceededError');raw=value;
  if(opts.sharedStore)opts.sharedStore.value=value;
 }};
 const session={},sessionStorage={getItem:k=>session[k]??null,setItem:(k,v)=>session[k]=v,removeItem:k=>delete session[k]};
 const highlights=new Map(),cssApi={escape:x=>x,highlights};
 class Highlight{constructor(...ranges){this.ranges=ranges}}
 const window={scrollY:250,scrollTo(){},CSS:cssApi,addEventListener(type,fn){(events['window:'+type]??=[]).push(fn)}};
 const location={hash:'#bookmarks',href:'https://example.org/booksite/daruri/index.html'};
 const sandbox={window,document:doc,localStorage,sessionStorage,location,
  MutationObserver:class{observe(){}},FileReader:class{readAsText(file){this.result=file.text;this.onload()}},
  matchMedia:()=>({matches:opts.mobile??true}),requestAnimationFrame:fn=>fn(),
  CSS:cssApi,Highlight,NodeFilter:{SHOW_TEXT:4},URL,Intl,Date,Math,console,setTimeout,clearTimeout,confirm:()=>true,
  navigator:{},decodeURIComponent,encodeURIComponent};
 vm.runInNewContext(js,sandbox,{filename:'reading-desk.js'});
 const desk=window.GnammaReadingDesk.create(context);
 desk.render();
 function event(type,data){for(const fn of events[type]||[])fn({
  target:{...data,closest(){return this}},
  preventDefault(){},stopImmediatePropagation(){}
 })}
 return {desk,state,main,reader,grids,highlights,event,notifications,
  get printed(){return sheet},get preview(){return preview},get modal(){return modal},
  get stored(){return opts.sharedStore?opts.sharedStore.value:raw},get writes(){return writes},
  notifyExternalChange(){for(const fn of events['window:storage']||[])fn({key:'gnamma-reading-desk-v1',newValue:opts.sharedStore?.value??raw})}};
}
test('source scripts compile and cache version matches',()=>{
 ensure(sw.includes('20261021-readingdesk6'),'service worker cache not updated');
 ensure(bundle.includes('20261021-readingdesk6'),'offline bundle not updated');
 ensure(dict.includes("dateSource:'recorded'"),'dictionary dates missing');
});
test('mobile list and detail are mutually exclusive',()=>{
 ensure(css.includes('.gn-rd-page:not(.gn-rd-mobile-detail-open) .gn-rd-detail{display:none!important}'),'inline mobile detail not hidden');
 ensure(css.includes('.gn-rd-mobile-detail-open .gn-rd-mobile-back{display:inline-flex'),'mobile back button unconditional');
 const h=boot(backup([note('a','190')]));
 h.event('click',{dataset:{rd:'select',id:'a'}});
 ensure(h.main.innerHTML.includes('gn-rd-mobile-detail-open'),'mobile detail not selected');
 h.event('click',{dataset:{rd:'detail-back'}});
 ensure(!h.main.innerHTML.includes('class="gn-rd-page gn-rd-mobile-detail-open"'),'mobile detail not closed');
});
test('missing-source notes and unknown future records remain visible and survive saves',()=>{
 const h=boot(backup([archived,future,note('valid','190')],{editionExtra:{retainMe:1}}));
 ensure(h.desk.records().length===3,'lost records on load');
 ensure(h.main.innerHTML.includes('Source unavailable'),'orphan hidden');
 h.desk.toggleSection('191');
 const current=JSON.parse(h.stored);
 ensure(current.items.some(x=>x.id==='orphan'&&x.body===archived.body),'orphan dropped during save');
 ensure(current.items.find(x=>x.id==='future')?.extra.version===17,'future fields changed');
 ensure(current.editionExtra.retainMe===1,'envelope metadata lost');
});
test('exported JSON backups preserve opaque top-level metadata and saved notes',()=>{
 const h=boot(backup([note('original','190','Retain this observation')],{futureEnvelope:{origin:'later edition'}}));
 const payload=JSON.parse(h.desk.backup());
 ensure(payload.futureEnvelope?.origin==='later edition','export discarded unknown envelope fields');
 ensure(payload.items.find(r=>r.id==='original')?.body==='Retain this observation','export lost saved note');
});
test('corrupt and future-format storage is protected against writes',()=>{
 for(const contents of ['{broken JSON',JSON.stringify({format:'gnamma-reading-desk',version:2,items:[archived]})]){
  const h=boot(contents);h.desk.toggleSection('191');
  ensure(h.stored===contents&&h.writes===0,'unreadable collection overwritten');
  ensure(h.main.innerHTML.includes('Saved data protected'),'recovery warning missing');
 }
});
test('long note text is never truncated on load or save',()=>{
 const contents='z'.repeat(31000),huge=note('long','190',contents),h=boot(backup([huge]));
 h.desk.toggleSection('191');
 ensure(JSON.parse(h.stored).items.find(x=>x.id==='long').body===contents,'old long note truncated');
});
test('failed storage writes roll back bookmark deletion',()=>{
 const h=boot(backup([legacy]),{failWrites:true});
 h.desk.toggleSection('191');
 ensure(h.desk.records().find(x=>x.id==='legacy').deleted===0,'delete mutated in-memory entry');
});
test('importing a previous-edition backup preserves missing-source notes',()=>{
 const h=boot(backup([note('current','190')]));
 const imported=note('imported-orphan','999','This older imported note must not disappear');
 const file={size:450,text:backup([imported])};
 h.event('change',{id:'gn-rd-file',files:[file]});
 ensure(h.desk.records().some(r=>r.id==='imported-orphan'&&r.body===imported.body),
  'imported unresolvable note discarded');
 ensure(JSON.parse(h.stored).items.some(r=>r.id==='imported-orphan'),
  'imported unresolvable note not persisted');
});
test('long imported notes display and print their full text without silent clipping',()=>{
 const trailing=' COMPLETE FINAL PARAGRAPH — محفوظ إلى النهاية';
 const full='Beginning of very long personal note. '+('x'.repeat(110000))+trailing;
 const item=note('full-detail','190',full),h=boot(backup([item]));
 h.event('click',{dataset:{rd:'select',id:'full-detail'}});
 ensure(h.main.innerHTML.includes(trailing),'long note detail clipped its ending');
 h.event('click',{dataset:{rd:'print',id:'full-detail'}});
 ensure(h.printed.includes(trailing),'native print preview clipped long note content');
});
test('sharing large personal notes discloses excerpt limits',()=>{
 ensure(js.includes('Excerpt only: this shared text was shortened'),'share preview lacks disclosure');
 ensure(js.includes('Email excerpt shortened'),'mailto excerpt lacks disclosure');
});
test('long imported notes can be edited without forced truncation',()=>{
 ensure(js.includes("const body=String($('#gn-rd-note-body')?.value??'').trim()"),
  'editor still limits existing note body on save');
 ensure(js.includes('Math.max(30000,String(existing?.body||\'\').length+30000)'),
  'legacy editor max length not expanded');
 ensure(js.includes('escFull(existing?.body||\'\')'),
  'legacy editor body not rendered without truncation');
});
test('relink cannot silently attach old quotations to unrelated passages',()=>{
 const orphanQuote={...quoted,id:'relink-quote',target:{...quoted.target,section:'999'},body:'Do not lose original quote'};
 const h=boot(backup([orphanQuote]));
 h.event('click',{dataset:{rd:'select',id:'relink-quote'}});
 h.event('click',{dataset:{rd:'relink',id:'relink-quote'}});
 h.event('click',{dataset:{rd:'relink-save'}});
 ensure(h.desk.records()[0].target.section==='999','invalid quote was falsely relinked');
 ensure(h.notifications.some(x=>String(x).includes('not present')),'missing precise relink warning');
});
test('relink preserves content, date and prior source reference',()=>{
 const h=boot(backup([archived]));
 h.event('click',{dataset:{rd:'select',id:'orphan'}});
 h.event('click',{dataset:{rd:'relink',id:'orphan'}});
 ensure(h.modal?.innerHTML.includes('Reconnect saved source'),'relink dialog missing');
 h.event('click',{dataset:{rd:'relink-save'}});
 const restored=h.desk.records()[0];
 ensure(restored.target.section==='190','relink did not update section');
 ensure(restored.body===archived.body&&restored.created===archived.created,'relink changed original observation');
 ensure(restored.sourceHistory[0].target.section==='999','provenance lost');
});
test('quote-only personal note prints complete saved quotation',()=>{
 const h=boot(backup([quoted]));h.event('click',{dataset:{rd:'print',id:'quotation-note'}});
 ensure(h.printed.includes('EXACT QUOTATION AT END'),'saved words missing from printed note');
 ensure(h.printed.includes('The point at the end matters'),'private annotation missing from print');
 ensure(h.preview.innerHTML.includes('data-rd="print-order"')&&h.preview.innerHTML.includes('data-rd="download-pdf"'),'icon print sort and direct PDF download actions missing');
});
test('Reading Desk tools and filters are direct accessible icon choices without Editions links',()=>{
 const h=boot(backup([note('one','190')]));
 const html=h.main.innerHTML;
 ensure(html.includes('data-rd="source-filter"')&&html.includes('data-rd="sort-filter"'),'source/order toolbar choices absent');
 ensure(html.includes('data-rd="export"')&&html.includes('data-rd="import"'),'backup tool buttons missing');
 ensure(!html.includes('data-rd="personal-pdf"')&&!html.includes('id="gn-rd-sort"'),'redundant Editions link/dropdowns present');
 ensure(html.includes('aria-pressed="true"'),'selected toolbar option must be exposed');
});
test('source-anchored notes remain distinct from editorial notes',()=>{
 const h=boot(backup([note('personal','190'),quoted]));
 ensure(h.main.innerHTML.includes('data-value="mine"'),'My notes filter missing');
 h.event('click',{dataset:{rd:'filter',value:'mine'}});
 ensure(h.main.innerHTML.includes('Observation personal')&&h.main.innerHTML.includes('Specific quotation'),'my notes not shown');
});
test('continuous reading marks a saved quote outside the current section',()=>{
 const other={id:'other',kind:'quote',target:{kind:'quote',section:'190',segment:0,lang:'en',quote:'EARLIER SAVED WORDS',offset:0},created:at,updated:at,dateSource:'recorded'};
 const h=boot(backup([other]));h.state.route='reader';h.state.n='191';h.desk.afterReader();
 ensure(h.highlights.get('gn-rd-bookmark')?.ranges.length===1,'non-active section quote missed');
 ensure(h.grids[0].nextElementSibling.innerHTML.includes('data-section="190"'),'wrong continuous-mode source anchor');
});
test('URL and recovered quotation are preserved in source sharing',()=>{
 ensure(js.includes("'&segment='+Number(t.segment)"),'shared paragraph missing segment');
 ensure(js.includes('function followSharedSourceLink('),'shared paragraph cannot be reopened');
 ensure(js.includes('const savedSelections=items.filter(r=>r.target?.quote)'),'print selection not preserved');
});

test('stale tabs cannot overwrite newer annotations and can reload safely',()=>{
 const sharedStore={value:backup([note('initial','190')])};
 const first=boot(sharedStore.value,{sharedStore});
 const second=boot(sharedStore.value,{sharedStore});
 first.desk.toggleSection('191');
 const fresh=sharedStore.value;
 ensure(JSON.parse(fresh).items.length===2,'first tab write missing');
 second.desk.toggleSection('190');
 ensure(sharedStore.value===fresh,'stale tab overwrote newer data');
 ensure(second.desk.records().length===1,'failed stale write leaked into records');
 second.notifyExternalChange();
 ensure(second.main.innerHTML.includes('Reading Desk changed in another tab'),'conflict not explained');
 second.event('click',{dataset:{rd:'refresh-storage'}});
 ensure(second.desk.records().length===2,'refresh failed to read newer collection');
 second.desk.toggleSection('190');
 ensure(JSON.parse(sharedStore.value).items.length===3,'fresh tab cannot save after reload');
});
test('legacy migration is not re-applied when refreshing externally changed records',()=>{
 const initial=backup([note('original','190')]);
 const sharedStore={value:initial};
 const instance=boot(initial,{sharedStore});
 const next=backup([note('newer','191')]);
 sharedStore.value=next;
 instance.event('click',{dataset:{rd:'refresh-storage'}});
 ensure(instance.desk.records().length===1&&instance.desk.records()[0].id==='newer',
 'refresh resurrected stale item from earlier in-memory storage');
});
test('unresolved legacy section bookmarks and duplicate identifiers survive a save',()=>{
 const damaged={id:'damaged',kind:'section',target:null,body:'Preserve malformed source',created:at,updated:at};
 const same1={...note('duplicate','190'),title:'First author observation',body:'First'};
 const same2={...note('duplicate','191'),title:'Second author observation',body:'Second'};
 const h=boot(backup([damaged,same1,same2]));
 ensure(h.desk.records().length===3,'corrupt section or duplicate record dropped during load');
 const ids=h.desk.records().map(x=>x.id);
 ensure(new Set(ids).size===3,'duplicate identifiers were not safely disambiguated');
 h.desk.toggleSection('191');
 const saved=JSON.parse(h.stored).items;
 ensure(saved.some(r=>r.body==='Preserve malformed source'),'malformed section not preserved');
 ensure(saved.some(r=>r.body==='First')&&saved.some(r=>r.body==='Second'),'one duplicate record lost');
});
test('older exported backup with over three thousand records can be reimported',()=>{
 const h=boot(backup([]));
 const items=Array.from({length:3010},(_,i)=>({...note('archived-'+i,'190'),body:'Study observation '+i}));
 const encoded=backup(items);
 h.event('change',{id:'gn-rd-file',files:[{size:encoded.length,text:encoded}],value:encoded});
 ensure(h.desk.records().length===3010,'large historical backup rejected or truncated');
 ensure(JSON.parse(h.stored).items.length===3010,'large backup not written intact');
});
test('damaged source-history entries are displayed without changing the saved note',()=>{
 const record={...archived,id:'history-mixed',sourceHistory:[null,'old',{target:{section:'999',segment:0}},{relinkedAt:at,target:null}]};
 const h=boot(backup([record]));
 h.event('click',{dataset:{rd:'select',id:'history-mixed'}});
 ensure(h.main.innerHTML.includes('Previous source references (4)'),'history list hidden');
 ensure(h.desk.records()[0].sourceHistory.length===4,'history data changed');
 h.desk.toggleSection('191');
 ensure(JSON.parse(h.stored).items.find(x=>x.id==='history-mixed').sourceHistory.length===4,'history entries lost on save');
});
console.log('PASS '+checks.length+' Reading Desk tests (synthetic DOM; physical iOS Safari and Pages deployment require separate checks)');
