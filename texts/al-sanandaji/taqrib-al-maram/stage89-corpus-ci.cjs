
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const dir=__dirname,ctx=vm.createContext({window:{__GNAMMA_SANANDAJI84:[]},console});
const scripts=[...Array.from({length:11},(_,i)=>'stage84-data/records-'+String(i+1).padStart(2,'0')+'.js'),'stage85-source-delta.js','stage86-source-delta.js','stage87-source-delta.js','stage88-source-delta.js','stage89-source-delta.js'];
for(const f of scripts)vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),ctx,{filename:f,timeout:20000});
const data=ctx.window.__GNAMMA_SANANDAJI84,byId=new Map(data.map(r=>[r.id,r]));
assert.equal(data.length,1401);assert.equal(byId.size,1401);
assert.equal(data.filter(r=>String(r.arabic||'').trim()).length,1197);
assert.equal(data.filter(r=>!String(r.arabic||'').trim()&&!r.reader_hide).length,203);
assert.equal(data.filter(r=>r.reader_hide).length,1);
assert.equal(new Set(data.filter(r=>r.page>1&&String(r.arabic||'').trim()).map(r=>r.page)).size,279);
assert.equal(data.filter(r=>r.stage89_source_note).length,10);
for(const id of ["I010.upper.02", "I010.lower.02", "I010.lower.03", "I011.lower.01", "I013.lower.02", "I013.lower.03", "I015.lower.01", "I016.lower.01", "I019.lower.01", "I019.lower.02"]){const r=byId.get(id);assert(r);assert(r.stage89_prior_working_overview);assert(!r.full_diplomatic_arabic);assert(!r.all_printed_clauses_literally_translated);assert(!r.independent_second_proof);assert(!r.textual_witness_collation);assert(r.english.includes('…'));}
for(const f of ['index.html','stage84-reader.html']){const s=fs.readFileSync(path.join(dir,f),'utf8');let prev=-1;for(const g of scripts.concat('reader.js')){const at=s.indexOf('src="'+g+'"');assert(at>prev,'Script order failure '+f+' '+g);prev=at;}assert(!s.includes('sanandaji-project-progress'))}
console.log('Stage89 PASS: 1401 stable IDs, 1197 records with some Arabic, 203 source records without typed Arabic, 10 bounded source excerpts, 0 independently certified complete pages.');