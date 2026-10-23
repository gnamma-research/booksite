#!/usr/bin/env node
/** Source-based contents behavior against the actual renderer and full book data.
 * NODE_PATH=/tmp/daruri-study-qa/node_modules node daruri/qa/verify-contents-structure.js
 * Requires jsdom. These are DOM/navigation checks; visual geometry is separate.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const BOOK=require('./load-book')(html);
// The last <script> may be a module included after the main reader script.
const scriptStart=html.indexOf("<script>\\n(() => {\\n'use strict';\\nconst BOOK");
assert.ok(scriptStart>=0,'Main reader script not found');
const scriptEnd=html.indexOf('</script>',scriptStart);
assert.ok(scriptEnd>scriptStart,'Main reader script not closed');
const script=html.slice(scriptStart+'<script>'.length,scriptEnd);
new vm.Script(script);
function extract(name){
 const start=script.indexOf('function '+name+'(');assert.ok(start>=0,name);
 for(let end=script.indexOf('}',start);end>=0;end=script.indexOf('}',end+1)){
  const candidate=script.slice(start,end+1);
  try{new vm.Script('('+candidate+')');return candidate;}catch(_){}
 }
 throw new Error('Cannot extract '+name);
}
const a=script.indexOf('const gnOriginalHeadingParent='),b=script.indexOf('\nfunction renderStudy()',a);
assert.ok(a>0&&b>a);
const dom=new JSDOM('<!doctype html><html><body><main id="mainContent"></main></body></html>',{url:'https://example.test/daruri/#contents',pretendToBeVisual:true});
const window=dom.window,document=window.document;
window.scrollTo=()=>{};
const state={route:'contents',n:'1',contentsMode:'original',contentsQuery:'',contentsOpen:{0:true,1:false,2:false,3:false,4:false}};
let saves=0;
const context=vm.createContext({BOOK,state,window,document,location:window.location,console,Date,Set,Map,Object,
 $:s=>document.querySelector(s),esc:s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'),
 contains:(text,q)=>String(text).toLowerCase().includes(q.toLowerCase()),
 sectionRef:n=>'§'+n,origPage:s=>'Arabic '+(s.pages||[]).join(', '),icon:()=>'',panelHead:(_k,title,intro)=>`<header><h1>${title}</h1><p>${intro}</p></header>`,updateReturnBar:()=>{},save:()=>{saves++;}
});
vm.runInContext(script.slice(a,b)+'\n'+extract('gnCaptureReferenceView')+'\n'+extract('gnRestoreReferenceView'),context);
const run=code=>vm.runInContext(code,context);
const all=selector=>[...document.querySelectorAll(selector)];
let groups=0;
function test(name,fn){try{fn();groups++;}catch(e){e.message=name+': '+e.message;throw e;}}
function render(mode='original',q=''){state.contentsMode=mode;state.contentsQuery=q;run('renderContents()');}
function sourceIDs(){return all('[data-contents-source]').map(e=>Number(e.dataset.contentsSource));}
function sourceParent(id){const row=document.querySelector('[data-contents-source="'+id+'"]');const list=row.closest('ol.contents-tree');if(!list)return null;const holder=list.parentElement;if(holder.matches('details'))return Number(holder.querySelector('[data-contents-source]').dataset.contentsSource);return Number(holder.querySelector(':scope > [data-contents-source]').dataset.contentsSource);}
test('five native disclosures, source default and all 46 unchanged rubrics',()=>{
 render();assert.equal(document.querySelector('h1').textContent,'Contents');
 const parts=all('details[data-contents-part]');assert.deepEqual(parts.map(e=>Number(e.dataset.contentsPart)),[0,1,2,3,4]);assert.deepEqual(parts.map(e=>e.open),[true,false,false,false,false]);
 const source=BOOK.sections.filter(s=>s.id!=='colophon'&&s.headingAr);assert.deepEqual(sourceIDs(),source.map(s=>Number(s.id)));
 for(const s of source){const row=document.querySelector('[data-contents-source="'+s.id+'"]');assert.equal(row.querySelector('[lang="ar"]').textContent,s.headingAr);assert.ok(row.textContent.includes(s.headingEn));assert.ok(row.querySelector('[data-section="'+s.id+'"]'));}
 assert.equal(document.querySelector('[data-section="colophon"]').closest('details'),null);
 assert.ok(document.querySelector('[data-contents-mode="original"]').textContent==='Book structure');
});
test('verified boundaries remain correct, including nonsequential hierarchy',()=>{
 assert.equal(sourceParent(115),62);assert.equal(sourceParent(101),66);assert.equal(sourceParent(105),66);assert.equal(sourceParent(96),94);assert.equal(sourceParent(252),249);assert.equal(sourceParent(256),230);
 assert.equal(sourceParent(26),17);assert.equal(sourceParent(32),17);
 assert.equal(document.querySelector('[data-contents-source="25"]'),null);
});
test('generic explanations are visibly marked and descriptive rubrics remain unaltered',()=>{
 assert.match(document.querySelector('[data-contents-source="11"] .toc-topic-caption').textContent,/Topic stated in the text: Definition of a ruling/);
 assert.match(document.querySelector('[data-contents-source="252"] .toc-topic-caption').textContent,/Editorial topic:/);
 assert.equal(document.querySelector('[data-contents-source="94"] .toc-topic-caption'),null);
});
test('heading search opens ancestry; part-topic search exposes the whole matching part',()=>{
 render('original','criticism');const ids=sourceIDs();assert.ok(ids.includes(62)&&ids.includes(66)&&ids.includes(94));assert.equal(document.querySelector('details[data-contents-part="2"]').open,true);assert.equal(document.querySelector('details[data-contents-part="1"]'),null);
 render('original','Part II');assert.deepEqual(all('details[data-contents-part]').map(e=>e.dataset.contentsPart),['2']);assert.equal(sourceIDs().length,18);
 render('original','Sources of rulings');assert.equal(sourceIDs().length,18);assert.ok(sourceIDs().includes(141));assert.equal(all('details[data-contents-part]').length,1);
 render('original','Definition of a ruling');assert.deepEqual(sourceIDs(),[10,11]);assert.match(document.getElementById('contentsResults').textContent,/Parent headings/);
 render('original','zzzz-no-matches');assert.equal(all('[data-section]').length,0);assert.match(document.querySelector('.empty-state').textContent,/No headings/);
});
test('expand/collapse persists across both modes, while filtering leaves preference intact',()=>{
 render();run('expandContents(true)');assert.ok(all('details[data-contents-part]').every(e=>e.open));assert.ok(saves>0);
 render('editorial');assert.ok(all('details[data-contents-part]').every(e=>e.open));
 run('expandContents(false)');assert.ok(all('details[data-contents-part]').every(e=>!e.open));
 render('original','criticism');assert.ok(all('details[data-contents-part]').every(e=>e.open));assert.ok(Object.values(state.contentsOpen).every(value=>!value));
 render();assert.ok(all('details[data-contents-part]').every(e=>!e.open));
});
test('native toggle preserves a fresh immutable state and exact section-guide coverage',()=>{
 render();const old=state.contentsOpen;const d=document.querySelector('details[data-contents-part="3"]');d.open=true;d.dispatchEvent(new window.Event('toggle'));
 assert.notEqual(state.contentsOpen,old);assert.equal(state.contentsOpen[3],true);
 render('editorial');assert.equal(document.querySelector('details[data-contents-part="3"]').open,true);
 const ids=all('.contents-list [data-section]').map(e=>String(e.dataset.section));assert.deepEqual(ids,BOOK.sections.filter(s=>s.id!=='colophon').map(s=>String(s.id)));assert.equal(ids.length,258);
 assert.match(document.querySelector('.contents-mode-note').textContent,/supplied by the editor/);
});
test('reference return captures mode, query, disclosure preferences and concrete UI state',()=>{
 render('original');run('expandContents(false)');const d=document.querySelector('details[data-contents-part="2"]');d.open=true;d.dispatchEvent(new window.Event('toggle'));
 const snapshot=run('gnCaptureReferenceView()');assert.equal(snapshot.snapshot.contentsMode,'original');assert.equal(snapshot.snapshot.contentsOpen[2],true);
 render('editorial','Obligation');Object.assign(state,snapshot.snapshot);render(state.contentsMode,state.contentsQuery);
 context.qaReturn=snapshot;run('gnRestoreReferenceView(qaReturn)');
 assert.deepEqual(all('details[data-contents-part]').map(e=>e.open),[false,false,true,false,false]);assert.deepEqual(sourceIDs(),BOOK.sections.filter(s=>s.id!=='colophon'&&s.headingAr).map(s=>Number(s.id)));
});
test('native fallback is collapsible, has source-first tabs and preserves every PDF link',()=>{
 const f=new JSDOM(html).window.document,contents=f.getElementById('contents');
 assert.equal(contents.querySelector('h1').textContent,'Contents');assert.equal(contents.querySelector('#fb-toc-original').checked,true);assert.equal(contents.querySelector('#fb-toc-editorial').checked,false);
 assert.deepEqual([...contents.querySelectorAll('.fb-toc-tabs label')].map(e=>e.textContent),['Book structure','Editorial section titles']);
 const original=contents.querySelector('.fb-toc-original');assert.equal(original.querySelectorAll('details.contents-source-part').length,4);assert.ok([...original.querySelectorAll('details.contents-source-part')].every(e=>!e.open));assert.equal(original.querySelector('.contents-opening-part').open,true);assert.equal(original.querySelectorAll('[data-contents-source]').length,46);
 assert.equal(contents.querySelectorAll('a[href^="daruri.pdf"]').length,306);
 assert.equal(contents.querySelector('.fb-toc-editorial').querySelectorAll('.fb-toc-part .fb-toc-row').length,258);
 const nav=[...f.querySelectorAll('.fb-left-panel nav > a')].map(e=>e.textContent);assert.ok(nav.indexOf('Subject index')<nav.indexOf('Dictionary'));
});
console.log(`PASS: ${groups} source-contents groups; source hierarchy, all 46 rubrics, all 258 editorial targets, native fallback, search ancestry, persistent disclosures and exact reference-state restoration.`);
dom.window.close();
