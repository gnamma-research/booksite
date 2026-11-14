/* Source corpus proof-gates: typed phrase != full page certification. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const home=__dirname,ctx=vm.createContext({window:{__GNAMMA_SANANDAJI84:[]},console});
const files=[...Array.from({length:11},(_,i)=>'stage84-data/records-'+String(i+1).padStart(2,'0')+'.js'),'stage85-source-delta.js','stage86-source-delta.js','stage87-source-delta.js'];
for(const file of files)vm.runInContext(fs.readFileSync(path.join(home,file),'utf8'),ctx,{filename:file,timeout:15000});
const all=ctx.window.__GNAMMA_SANANDAJI84,byId=new Map(all.map(r=>[r.id,r]));
assert.equal(all.length,1401);assert.equal(byId.size,1401);
const typed=all.filter(r=>r.arabic&&r.arabic.trim()),untyped=all.filter(r=>!(r.arabic&&r.arabic.trim()));
assert.equal(typed.length,1178,'seven formerly empty records now contain source-located Arabic');
assert.equal(untyped.length,223,'223 blank records incl one ghost editorial paraphrase');
assert.equal(untyped.filter(r=>r.reader_hide).length,1,'one non-source explanatory entry hidden');
assert.equal(new Set(typed.map(r=>r.page)).size,279,'all body leaves contain some typed Arabic');
assert.equal(all.filter(r=>r.stage87_source_note).length,10,'10 revised source selections');
assert.equal(all.filter(r=>r.reader_hide).length,1,'no unwanted hidden source streams');
assert.equal(byId.get('I007.ruled.01').reader_hide,true,'false independent gloss suppressed');
assert(byId.get('I007.upper.01').arabic.includes('منها ما يراد تقديمه في كل علم'),'actual printed upper line preserved');
assert(byId.get('I006.lower.01').arabic.includes('إضافة الدال إلى المدلول'),'critical lower marginal argument now transcribed');
assert(byId.get('I016.upper.01').arabic.includes('الاعتقاد إما جازم'),'actual kalam knowledge division entered');
assert(byId.get('I017.ruled.01').arabic.includes('المسافة اللازمة'),'motion of the soul gloss entered');
assert(!all.some(r=>r.full_diplomatic_arabic===true||r.all_printed_clauses_literally_translated===true||r.independent_second_proof===true),'no false certification');
for(const filename of ['index.html','stage84-reader.html']){
 const html=fs.readFileSync(path.join(home,filename),'utf8');let pos=-1;
 for(const f of files.concat('reader.js')){let next=html.indexOf('src="'+f+'"');assert(next>pos,'correct ordering '+f);pos=next}
 assert(!html.includes('sanandaji-project-progress'),'clean study reader without visible editorial counters');
}
const reader=fs.readFileSync(path.join(home,'reader.js'),'utf8');assert(reader.includes('if(r.reader_hide)continue'),'hidden historical ghost excluded');assert(reader.includes('!r.reader_hide&&match'),'ghost excluded from results');
console.log('Stage87 PASS: 1401 stable records, 1178 with some typed Arabic, 223 without incl one retired synthetic note, 10 revised passages, all 279 body leaves with some text, 0 critically complete pages.');