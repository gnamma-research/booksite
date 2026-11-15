'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=__dirname, ctx=vm.createContext({window:{__GNAMMA_SANANDAJI84:[]},console});
const scripts=[...Array.from({length:11},(_,i)=>'stage84-data/records-'+String(i+1).padStart(2,'0')+'.js'),...Array.from({length:8},(_,i)=>'stage'+(85+i)+'-source-delta.js')];
for(const s of scripts)vm.runInContext(fs.readFileSync(path.join(dir,s),'utf8'),ctx,{filename:s,timeout:20000});
const d=ctx.window.__GNAMMA_SANANDAJI84, ids=new Set(d.map(r=>r.id));
assert.equal(d.length,1401,'Corpus must contain exactly 1401 records');
assert.equal(ids.size,1401,'Stable IDs must be unique');
assert.equal(d.filter(r=>String(r.arabic||'').trim()).length,1232);
assert.equal(d.filter(r=>!String(r.arabic||'').trim()&&!r.reader_hide).length,168);
assert.equal(d.filter(r=>r.reader_hide).length,1);
assert.equal(new Set(d.filter(r=>r.page>1&&String(r.arabic||'').trim()).map(r=>r.page)).size,279);
const changed=d.filter(r=>r.stage92_source_note);
assert.equal(changed.length,17);
assert.equal(changed.filter(r=>r.stage92_source_note.scope.includes('entire')).length,9);
assert.equal(changed.filter(r=>r.layer==='ruled').length,15);
assert.equal(changed.filter(r=>r.layer==='lower').length,2);
for(const r of changed){
 assert.equal(typeof r.stage92_prior_working_overview,'string');
 assert.equal(r.stage92_source_note.printed_page,r.page);
 assert(r.arabic&&r.english&&!r.full_diplomatic_arabic&&!r.all_printed_clauses_literally_translated&&!r.independent_second_proof&&!r.textual_witness_collation,r.id);
}
for(const filename of ['index.html','stage84-reader.html']){
 const html=fs.readFileSync(path.join(dir,filename),'utf8');let last=-1;
 for(const source of [...scripts,'reader.js']){let ix=html.indexOf('src="'+source+'"');assert(ix>last,'Wrong source order '+source);last=ix;}
 assert(!html.includes('sanandaji-project-progress'));
}
console.log('Stage92 PASS: 1401 stable records, 1232 with some Arabic, 168 genuine source blanks, 15 ruled excerpts (9 complete-band first-pass), 2 lower excerpts, 0 independently certified pages.');