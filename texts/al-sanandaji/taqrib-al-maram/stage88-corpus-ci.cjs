'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=__dirname,ctx=vm.createContext({window:{__GNAMMA_SANANDAJI84:[]},console});
const scripts=[...Array.from({length:11},(_,i)=>'stage84-data/records-'+String(i+1).padStart(2,'0')+'.js'),'stage85-source-delta.js','stage86-source-delta.js','stage87-source-delta.js','stage88-source-delta.js'];
const selected=['I008.lower.02','I009.lower.01','I010.lower.01','I011.lower.02','I017.upper.03','I018.upper.02','I018.lower.01','I019.upper.02','I022.upper.02'];
for(const f of scripts)vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),ctx,{filename:f,timeout:15000});
const data=ctx.window.__GNAMMA_SANANDAJI84,byId=new Map(data.map(x=>[x.id,x]));
assert.equal(data.length,1401);assert.equal(byId.size,1401);
assert.equal(data.filter(x=>String(x.arabic||'').trim()).length,1187);
assert.equal(data.filter(x=>!String(x.arabic||'').trim()).length,214);
assert.equal(data.filter(x=>!String(x.arabic||'').trim()&&!x.reader_hide).length,213);
assert.equal(data.filter(x=>x.stage88_source_note).length,9);
assert.equal(new Set(data.filter(x=>x.arabic&&x.page>1).map(x=>x.page)).size,279);
assert.equal(data.filter(x=>x.reader_hide).length,1);
assert.equal(byId.get('I007.ruled.01').reader_hide,true);
assert(!data.some(x=>x.full_diplomatic_arabic===true||x.all_printed_clauses_literally_translated===true||x.independent_second_proof===true));
for(const id of selected){const x=byId.get(id);assert(x);assert(x.arabic.length>30||id==='I019.upper.02');assert(x.english.length>50);assert(x.stage88_prior_working_overview.length>60);assert(!x.reader_hide);assert(x.full_diplomatic_arabic===false);assert(x.independent_second_proof===false)}
for(const file of ['index.html','stage84-reader.html']){const html=fs.readFileSync(path.join(dir,file),'utf8');let previous=-1;for(const f of scripts.concat('reader.js')){const at=html.indexOf('src="'+f+'"');assert(at>previous,'Script order: '+f);previous=at}assert(!html.includes('sanandaji-project-progress'))}
const reader=fs.readFileSync(path.join(dir,'reader.js'),'utf8');assert(reader.includes('if(r.reader_hide)continue'));assert(reader.includes('!r.reader_hide&&match'));
console.log('Stage88 PASS: 1,401 stable records, 1,187 with selected Arabic, 213 genuine records without Arabic, 9 bounded new Arabic-English readings, zero certified complete pages.');