#!/usr/bin/env node
/* Targeted print/cancel regression over the actual reader and shared print.js.
   DOM tests establish complete disclosure and restoration, not physical printing. */
'use strict';
const assert=require('node:assert/strict');
const {harness}=require('./verify-subject-index-integration');
const event=(h,name)=>h.w.dispatchEvent(new h.w.Event(name));
function contentDetails(h){return [...h.d.querySelectorAll('#indexList .subject-group,#indexList .index-record')];}
function printedData(h){return [...h.d.querySelectorAll('#indexList .index-record')].map(el=>({
 heading:el.querySelector('summary').firstChild.textContent,
 topics:[...el.querySelectorAll('.subentry-title')].map(x=>x.textContent),
 sections:[...el.querySelectorAll('[data-section]')].map(x=>x.dataset.section)
}));}
function capture(h){return{
 state:h.qa.state(),origin:JSON.stringify(h.qa.origin()),hash:h.w.location.hash,
 details:[...h.d.querySelectorAll('#indexExplorer details')].map(d=>d.open),data:printedData(h),
 storage:[...Array(h.w.localStorage.length)].map((_,i)=>{const k=h.w.localStorage.key(i);return[k,h.w.localStorage.getItem(k)]}),
 focus:h.d.activeElement,scroll:[h.w.scrollX,h.w.scrollY],
 scrollers:[...h.d.querySelectorAll('#indexExplorer *')].filter(x=>x.scrollTop||x.scrollLeft).map(x=>[x,x.scrollLeft,x.scrollTop])
};}
function assertRestored(h,before,label){
 assert.deepEqual(h.qa.state(),before.state,label+' preserves complete reader state');
 assert.equal(JSON.stringify(h.qa.origin()),before.origin,label+' preserves contextual-return state');
 assert.equal(h.w.location.hash,before.hash);assert.deepEqual([...h.d.querySelectorAll('#indexExplorer details')].map(d=>d.open),before.details,label+' exact disclosures');
 assert.deepEqual(printedData(h),before.data,label+' exact visible subset and text');
 for(const[k,v]of before.storage)assert.equal(h.w.localStorage.getItem(k),v,label+' saved preferences '+k);
 assert.equal(h.d.activeElement,before.focus,label+' focus');assert.deepEqual([h.w.scrollX,h.w.scrollY],before.scroll,label+' page scroll');
 for(const[el,x,y]of before.scrollers){assert.equal(el.scrollLeft,x);assert.equal(el.scrollTop,y);}
}
async function cycle(h,label,immediate=false){
 h.$('#indexFilter').focus({preventScroll:true});h.w.scrollTo(0,529);
 h.$('#indexList .subentry-list').scrollTop=29;
 const before=capture(h);
 event(h,'beforeprint');event(h,'beforeprint');
 assert(contentDetails(h).every(d=>d.open),label+' prints every matching group and subtopic');
 assert.deepEqual(printedData(h),before.data,label+' neither adds unrelated results nor alters links');
 if(!immediate){await h.settle();assert.deepEqual(h.qa.state(),before.state,label+' queued print toggles do not mutate state');}
 event(h,'afterprint');event(h,'afterprint');await h.settle();
 assertRestored(h,before,label);
}
(async()=>{
 const h=await harness();
 try{
  assert(h.w.GnammaPrint,'Actual shared print module loaded');
  assert(contentDetails(h).some(d=>!d.open),'Default subject browser includes collapsed content');
  const group=h.$('#indexList .subject-group');group.open=true;
  group.querySelector('.index-record').open=true;await h.settle();
  await cycle(h,'By subject print/cancel');
  await cycle(h,'Immediate queued-toggle cancellation',true);
  await h.click('[data-subject-view="az"]');await h.input('#indexFacet','people','change');await h.input('#indexFilter','ghazali');
  await h.click('[data-index-expand="none"]');
  assert.equal(h.d.querySelectorAll('#indexList .index-record').length,1);
  await cycle(h,'Filtered A–Z print/cancel');
  await h.click('[data-subject-view="subjects"]');await h.click('[data-index-question="error"]');await h.input('#indexFilter','sin');await h.click('[data-index-expand="none"]');
  assert.equal(h.qa.state().indexQuestion,'error');
  await cycle(h,'Filtered question print/cancel');
  event(h,'beforeprint');h.qa.navigate('reader','81');await h.settle();
  const reader=h.qa.state(),position=h.w.scrollY;
  event(h,'afterprint');await h.settle();
  assert.deepEqual(h.qa.state(),reader,'An old print snapshot never reopens a departed index');assert.equal(h.w.scrollY,position);
  console.log('PASS: actual shared print + subject browser; complete matching disclosures, exact data/subset, nested before/after, immediate queued toggles, cancellation, filters/questions/preferences, reference state, focus and scroll, and route departure.');
 }finally{h.close();}
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
