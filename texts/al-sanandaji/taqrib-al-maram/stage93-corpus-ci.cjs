'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=__dirname;const ctx=vm.createContext({window:{__GNAMMA_SANANDAJI84:[]},console});
const shards=Array.from({length:11},(_,i)=>'stage84-data/records-'+String(i+1).padStart(2,'0')+'.js');
const patches=Array.from({length:9},(_,i)=>'stage'+(85+i)+'-source-delta.js');
for(const file of [...shards,...patches])vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),ctx,{filename:file,timeout:20000});
const records=ctx.window.__GNAMMA_SANANDAJI84;
assert.equal(records.length,1401,'No source records lost');
assert.equal(new Set(records.map(r=>r.id)).size,1401,'No duplicate stable IDs');
const hasArabic=r=>!!String(r.arabic||'').trim();
assert.equal(records.filter(hasArabic).length,1244,'Arabic-bearing records exact');
assert.equal(records.filter(r=>!hasArabic(r)&&!r.reader_hide).length,156,'Genuine Arabic-blank source count');
assert.equal(records.filter(r=>r.reader_hide).length,1,'One hidden non-source legacy entry');
assert.equal(new Set(records.filter(r=>r.page>1&&hasArabic(r)).map(r=>r.page)).size,279,'Some Arabic on each 279 body pages');
const changed=records.filter(r=>r.stage93_source_note);
assert.equal(changed.length,12,'Exactly 12 selected new stage records');
assert.equal(changed.filter(r=>r.layer==='lower').length,11,'Eleven lower source records');
assert.equal(changed.filter(r=>r.layer==='upper').length,1,'One upper source record');
for(const r of changed){
 const meta=r.stage93_source_note;
 assert.equal(meta.printed_page,r.page,r.id);
 assert.equal(meta.combined_pdf_physical_page,r.page+13,r.id);
 assert.equal(meta.layer,r.layer,r.id);
 assert(meta.page_image_sha256.length===64);
 assert(r.stage93_prior_working_overview && r.stage93_prior_working_overview.length>20);
 assert(r.arabic.includes('[…]')&&r.english.includes('[…]'),'Selected omissions must remain visible: '+r.id);
 assert.equal(r.full_diplomatic_arabic,false);assert.equal(r.all_printed_clauses_literally_translated,false);
 assert.equal(r.independent_second_proof,false);assert.equal(r.textual_witness_collation,false);
}
for(const file of ['index.html','stage84-reader.html']){
 const html=fs.readFileSync(path.join(dir,file),'utf8');let last=-1;
 for(const fileName of [...shards,...patches,'reader.js']){
  const off=html.indexOf('src="'+fileName+'"'); assert(off>last,'Script load order of '+fileName+' in '+file);last=off;
 }
 assert(!html.includes('sanandaji-project-progress'),'No editorial stage UI banner');
}
const met=JSON.parse(fs.readFileSync(path.join(dir,'editorial/STAGE93_METRICS.json')));
assert.equal(met.genuine_records_without_typed_arabic,156);
assert.equal(met.all_register_critically_completed_pages,0);
console.log('Stage93 PASS: 1401 preserved IDs; 1244 records with Arabic; 156 genuine source blanks; 12 bounded source corrections; zero certified pages; correct reader ordering.');