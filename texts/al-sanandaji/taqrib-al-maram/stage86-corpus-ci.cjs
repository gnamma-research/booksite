'use strict';
/* Sanandaji Volume I Stage86: strictly validates source-linked record presence,
   updates, page navigation and no false critical-completion claims.
   Page presence never equals full translation or independent proof. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const dir=__dirname;const context=vm.createContext({window:{__GNAMMA_SANANDAJI84:[]},console});
const files=[...Array.from({length:11},(_,i)=>'stage84-data/records-'+String(i+1).padStart(2,'0')+'.js'),'stage85-source-delta.js','stage86-source-delta.js'];
for(const file of files){vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),context,{filename:file,timeout:10000});}
const a=context.window.__GNAMMA_SANANDAJI84;
const idSet=new Set(a.map(r=>r.id));
assert.equal(a.length,1401,'Cumulative working record count');
assert.equal(idSet.size,1401,'No duplicate record IDs');
assert.equal(a.filter(r=>r.arabic&&r.arabic.trim()).length,1171,'Records with any typed Arabic');
assert.equal(new Set(a.filter(r=>r.arabic&&r.arabic.trim()).map(r=>r.page)).size,279,'All body page positions have some Arabic');
assert.equal(new Set(a.filter(r=>r.english&&r.english.trim()).map(r=>r.page)).size,279,'All body pages have some English');
const stage86=a.filter(r=>r.stage86_source_note);
assert.equal(stage86.length,45,'Precisely 45 new selected source readings');
assert.equal(new Set(stage86.map(r=>r.page)).size,29,'29 formerly anchor-only printed leaves have source-based excerpts');
for(const r of stage86){assert(r.stage86_prior_english_analytic_draft?.length>40,'Previous overview must be retained '+r.id);assert(r.arabic?.length>4 && r.english?.length>10,'Bilingual source text '+r.id);assert.equal(r.independent_second_proof,false);assert.equal(r.all_printed_clauses_literally_translated,false);}
assert.equal(a.filter(r=>r.independent_second_proof||r.all_printed_clauses_literally_translated||r.full_diplomatic_arabic).length,0,'No false all-register certification');
const pages=Array.from({length:279},(_,i)=>i+2);
for(const p of pages)assert(a.some(r=>r.page===p&&r.arabic?.trim()),'Missing Arabic at printed page '+p);
assert.equal(a.find(r=>r.id==='I049.upper.01').arabic.includes('صورته'),true,'I49 source-reading fixed');
assert.equal(a.find(r=>r.id==='I078.upper.01').arabic.includes('تعين الشيء'),true,'I78 source-reading fixed');
for(const name of ['index.html','stage84-reader.html']){
 const html=fs.readFileSync(path.join(dir,name),'utf8');
 let prev=0;
 for(const f of files.concat('reader.js')){const at=html.indexOf('src="'+f+'"');assert(at>prev,'Missing/misordered script '+f+' in '+name);prev=at;}
 assert(!html.includes('sanandaji-project-progress'),'No editorial counters on the reader screen');
 assert(!html.includes('tahdhib-parallels.js'),'Do not prematurely merge the two works');
}
console.log('Sanandaji Stage86 PASS: 1,401 records, 1,171 with some Arabic, all 279 body pages with Arabic excerpts, 45 new bounded units on 29 pages, 0 completed critical pages.');