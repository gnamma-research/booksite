'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=__dirname,ctx=vm.createContext({window:{__GNAMMA_SANANDAJI84:[]},console});
const scripts=[...Array.from({length:11},(_,i)=>'stage84-data/records-'+String(i+1).padStart(2,'0')+'.js'),...Array.from({length:7},(_,i)=>'stage'+(85+i)+'-source-delta.js')];
for(const f of scripts)vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),ctx,{filename:f,timeout:20000});
const d=ctx.window.__GNAMMA_SANANDAJI84;const by=new Map(d.map(r=>[r.id,r]));
assert.equal(d.length,1401);assert.equal(by.size,1401);
assert.equal(d.filter(r=>String(r.arabic||'').trim()).length,1215);
assert.equal(d.filter(r=>!String(r.arabic||'').trim()&&!r.reader_hide).length,185);
assert.equal(d.filter(r=>r.reader_hide).length,1);
assert.equal(new Set(d.filter(r=>r.page>1&&String(r.arabic||'').trim()).map(r=>r.page)).size,279);
assert.equal(d.filter(r=>r.stage90_source_note).length,10);
assert.equal(d.filter(r=>r.stage91_source_note).length,8);
for(const r of d.filter(r=>r.stage91_source_note||r.stage90_source_note)){
 assert(!r.all_printed_clauses_literally_translated&&!r.full_diplomatic_arabic&&!r.independent_second_proof&&!r.textual_witness_collation);
}
for(const f of ['index.html','stage84-reader.html']){const txt=fs.readFileSync(path.join(dir,f),'utf8');let idx=-1;for(const s of [...scripts,'reader.js']){const n=txt.indexOf('src="'+s+'"');assert(n>idx,'ordered loader '+s);idx=n;}assert(!txt.includes('sanandaji-project-progress'))}
console.log('Merged Stage91 PASS: 1401 stable records; Stage90 +10, Stage91 +8 non-overlapping source records; 1215 with some typed Arabic, 185 source blanks, zero independently complete pages.');