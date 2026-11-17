'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const here=__dirname,ctx=vm.createContext({window:{__GNAMMA_SANANDAJI84:[]},console});
const sources=[...Array.from({length:11},(_,i)=>'stage84-data/records-'+String(i+1).padStart(2,'0')+'.js'),'stage85-source-delta.js','stage86-source-delta.js','stage87-source-delta.js','stage88-source-delta.js','stage89-source-delta.js','stage90-source-delta.js'];
for(const f of sources)vm.runInContext(fs.readFileSync(path.join(here,f),'utf8'),ctx,{filename:f,timeout:20000});
const rs=ctx.window.__GNAMMA_SANANDAJI84,ids=new Set(rs.map(x=>x.id));
assert.equal(rs.length,1401);assert.equal(ids.size,1401);
assert.equal(rs.filter(x=>String(x.arabic||'').trim()).length,1207);
assert.equal(rs.filter(x=>!String(x.arabic||'').trim()&&!x.reader_hide).length,193);
assert.equal(rs.filter(x=>x.reader_hide).length,1);
assert.equal(new Set(rs.filter(x=>x.page>1&&String(x.arabic||'').trim()).map(x=>x.page)).size,279);
const changed=rs.filter(x=>x.stage90_source_note);
assert.equal(changed.length,10);assert.equal(changed.filter(x=>x.layer==='lower').length,8);assert.equal(changed.filter(x=>x.layer==='ruled').length,2);
for(const r of changed){assert(r.arabic.length>35 && r.english.length>35);assert(r.stage90_prior_working_overview?.length>0);assert(!r.full_diplomatic_arabic);assert(!r.all_printed_clauses_literally_translated);assert(!r.independent_second_proof);assert(!r.textual_witness_collation);}
for(const f of ['index.html','stage84-reader.html']){const s=fs.readFileSync(path.join(here,f),'utf8');let prev=-1;for(const part of sources.concat('reader.js')){const at=s.indexOf('src="'+part+'"');assert(at>prev,'Bad script order: '+part+' in '+f);prev=at;}assert(!s.includes('sanandaji-project-progress'))}
console.log('Stage90 PASS: 1401 stable source IDs; 1207 some Arabic, 193 active blank; 10 new bounded notes; 0 complete pages.');