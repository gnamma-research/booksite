#!/usr/bin/env node
/* Behaviour/data checks for the subject browser with the real 302-entry corpus.
   Uses jsdom; browser layout and whole-reader return gates are separate checks. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const html=read('index.html'),book=require('./load-book')(html),before=JSON.stringify(book.index);
const data=JSON.parse(read('subject-index-data.json')),terms=new Set(book.index.map(e=>e.term));
const all=[...data.groups,...data.facets];
assert.equal(book.index.length,302);assert.equal(book.index.reduce((n,e)=>n+e.sub.length,0),1011);assert.equal(data.groups.length,8);
for(const group of all){assert.equal(new Set(group.terms).size,group.terms.length,group.id+' duplicate membership');for(const term of group.terms)assert(terms.has(term),'Unknown term '+term);for(const term of group.examples||[])assert(group.terms.includes(term));}
assert.deepEqual(new Set(all.flatMap(g=>g.terms)),terms,'Every index heading has an explicit category');
for(const q of data.questions)for(const term of q.terms)assert(terms.has(term));
const exported={window:{}};vm.runInNewContext(read('subject-index-data.js'),exported);assert.deepEqual(JSON.parse(JSON.stringify(exported.window.DARURI_SUBJECT_INDEX)),data,'Browser data matches shared JSON');
const synonyms=JSON.parse(html.match(/const INDEX_SYNONYMS = (\{[^\n]+\});/)[1]);
const redirects=JSON.parse(html.match(/const INDEX_REDIRECTS = (\{[^\n]+\});/)[1]);
const dom=new JSDOM('<main id="mainContent"></main>',{url:'https://example.test/daruri/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document;
w.HTMLElement.prototype.scrollIntoView=function(){w.__target=this.id;};
w.eval(read('subject-index-data.js'));w.eval(read('subject-index.js'));
const api=w.DaruriSubjectIndex,state={indexQuery:'',indexFocus:null,indexFocusPending:false};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fold=s=>String(s).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
let redirectsCalled=0;
const ctx={book,state,esc,icon:()=>'',panelHead:(a,b,c)=>`<header><h1>${esc(b)}</h1><p>${esc(c)}</p></header>`,contains:(s,q)=>fold(s).includes(fold(q)),sectionButton:n=>`<button type="button" data-section="${esc(n)}">§${esc(n)}</button>`,synonyms,redirects,renderRedirects:()=>redirectsCalled++};
function render(){d.getElementById('mainContent').innerHTML=api.render(ctx);api.update(ctx);}
function update(){api.update(ctx);}
function summaries(){return [...d.querySelectorAll('.index-record>summary')].map(s=>s.firstChild.textContent);}
function click(sel){const el=d.querySelector(sel);assert(el,'Missing '+sel);el.click();}
function query(q){state.indexQuery=q;state.indexFocus=null;state.indexFocusPending=false;d.getElementById('indexFilter').value=q;update();}
function select(value){const el=d.getElementById('indexFacet');el.value=value;el.dispatchEvent(new w.Event('change',{bubbles:true}));}
render();assert.equal(state.indexView,'subjects');assert.equal(d.querySelectorAll('.subject-group').length,9);assert.deepEqual(new Set(summaries()),terms);
click('[data-subject-view="az"]');assert.equal(d.querySelectorAll('.index-record').length,302);assert.equal(d.querySelectorAll('.subentry-row').length,1011);assert.equal(d.querySelectorAll('.subject-group').length,0);
const rows=[...d.querySelectorAll('.index-record')];
for(const record of rows){const term=record.querySelector('summary').firstChild.textContent,entry=book.index.find(e=>e.term===term);assert.deepEqual([...record.querySelectorAll('.subentry-title')].map(e=>e.textContent),entry.sub.map(s=>s.label));assert.deepEqual([...record.querySelectorAll('[data-section]')].map(e=>e.dataset.section),entry.sub.flatMap(s=>s.sections.map(String)));}
query('قياس');assert(summaries().includes('Analogy'),'Arabic synonym search');assert([...d.querySelectorAll('.index-record')].every(e=>e.open));
query('universal correctness');assert(summaries().includes('Correctness and error'));assert(d.querySelectorAll('.subentry-row').length>=3);
query('Al-Ghazālī');assert(summaries().includes('Ghazālī, Abū Ḥāmid al-'),'Redirect alias search');
query('');click('[data-subject-view="subjects"]');select('people');assert.deepEqual(new Set(summaries()),new Set(data.facets.find(f=>f.id==='people').terms));
select('edition');assert.deepEqual(summaries(),['Manuscript voices']);
state.indexFocus={term:'Probability (ẓann)',sub:'liability to mistake'};state.indexFocusPending=true;update();assert.equal(state.indexFacet,'all');assert.equal(d.querySelectorAll('#indexTargetRow').length,1);assert.equal(d.getElementById('indexTargetRow').querySelector('[data-section]').dataset.section,'243');assert(d.getElementById('indexTargetRow').closest('.subject-group').open);assert(d.getElementById('indexTargetRow').closest('.index-record').open);
state.indexFocus=null;click('[data-index-question="error"]');assert.equal(state.indexQuestion,'error');assert.deepEqual(new Set(summaries()),new Set(data.questions.find(q=>q.id==='error').terms));assert(d.getElementById('indexQuestionStatus').textContent.includes('blameworthy'));
click('[data-index-clear-question]');assert.equal(new Set(summaries()).size,302);
click('[data-index-expand="all"]');assert([...d.querySelectorAll('#indexList details')].every(e=>e.open));click('[data-index-expand="none"]');assert([...d.querySelectorAll('#indexList details')].every(e=>!e.open));
const key='group:language';state.indexOpen[key]=true;render();assert(d.querySelector(`[data-index-open-key="${key}"]`).open,'Group state survives complete rerender');
click('[data-subject-view="az"]');select('people');const pref=JSON.parse(w.localStorage.getItem('daruri-subject-index-view-v1'));assert.equal(pref.view,'az');assert.equal(pref.facet,'people');
const restored={...state,indexOpen:JSON.parse(JSON.stringify(state.indexOpen))};state.indexView='subjects';state.indexFacet='all';Object.assign(state,restored);render();assert.equal(d.querySelector('[data-subject-view="az"]').getAttribute('aria-pressed'),'true');assert.equal(d.getElementById('indexFacet').value,'people');
query('no-result-example-999');assert(d.querySelector('.empty-state'));assert.equal(d.querySelectorAll('.index-record').length,0);
assert.equal(JSON.stringify(book.index),before,'All index data and links unchanged');assert(redirectsCalled>10);
console.log('PASS: complete curated taxonomy, shared JSON/export, 302 headings/1,011 exact subentries and links, subject/A–Z views, Arabic/alias/subtopic search, facets, question routes, unique focused target, disclosure state, preferences and immutable corpus.');
dom.window.close();
