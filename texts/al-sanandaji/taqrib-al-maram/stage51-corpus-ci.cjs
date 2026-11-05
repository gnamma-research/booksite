'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const dir=__dirname;
const scripts=['data.js','stage51-cumulative-II015-II054.js','stage51-cumulative-II055-II114.js','stage51-cumulative-II115-II164.js','stage51-cumulative-II165-II214.js','stage51-cumulative-II215-II247.js','stage51-cumulative-II248-II280.js','stage51-cumulative-II281-II297.js','stage51-cumulative-II298-II314.js','stage51-wasim-preface.js','stage48-source-revisions-II035-II044.js','stage50-source-checked-working-readings.js','stage50-mixture-continuation-II053-II054.js'];
const ctx=vm.createContext({window:{GNAMMA_BOOK:{id:'taqrib',units:[]}}});
for(const file of scripts){const source=fs.readFileSync(path.join(dir,file),'utf8');vm.runInContext(source,ctx,{filename:file,timeout:10000});}
const book=ctx.window.GNAMMA_BOOK;
const pages=book.units.filter(u=>u.volume==='II'&&u.page>=15&&u.page<=314&&u.id==='P2.'+String(u.page).padStart(3,'0'));
assert.equal(pages.length,300,'Exactly 300 stable original-page cards');
assert.equal(new Set(pages.map(u=>u.page)).size,300,'No duplicate original pages');
assert.equal(pages.filter(u=>u.quality==='attempted-full-upper-unproofed').length,100,'100 attempted upper drafts');
const originals=pages.filter(u=>u.page>=281&&u.page<=314);
const joined=originals.flatMap(u=>u.layers?.margins||[]).filter(n=>n.kind?.includes('joined_individual_note'));
assert.equal(joined.length,97,'97 joined note records');
assert.equal(new Set(joined.map(n=>n.id)).size,97,'Unique note IDs');
const spans=pages.flatMap(u=>u.layers?.margins||[]).filter(n=>n.kind?.includes('lower_page_span'));
assert.equal(spans.length,66,'66 lower-page spans');
assert.equal(book.units.filter(u=>u.id?.startsWith('ST51.WASIM.PREFACE.I')).length,4,'Four Wasim authorial-preface sections');
for(const u of pages){assert.equal(u.pdf,u.page+295,'Printed/physical source offset '+u.page);assert.equal(typeof u.english,'string');assert(u.english.length>0);}
assert(pages.find(u=>u.page===41).english.includes('lenticular'),'Corrected sphericity source reading at II:41');
assert(pages.find(u=>u.page===49).english.includes('mountains'),'II:49 newer source reading loaded');
assert(pages.find(u=>u.page===54).english.includes('relative'),'II:54 newer mixture passage loaded');
const firstCount=pages.reduce((n,u)=>n+(u.layers?.margins?.length||0),0);
for(const file of scripts.slice(1))vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),ctx,{filename:file,timeout:10000});
const after=book.units.filter(u=>u.volume==='II'&&u.page>=15&&u.page<=314&&u.id==='P2.'+String(u.page).padStart(3,'0'));
assert.equal(after.length,300,'Idempotent source imports');
assert.equal(after.reduce((n,u)=>n+(u.layers?.margins?.length||0),0),firstCount,'No duplicated glosses after reload');
for(const f of ['index.html','cumulative.html']){const html=fs.readFileSync(path.join(dir,f),'utf8');const ids=scripts.slice(1).map(x=>html.indexOf('src="'+x+'"'));assert(ids.every((k,i)=>k>=0&&(i===0||k>ids[i-1])),'Correct chronological script order in '+f);}
console.log('Sanandajī Stage51 PASS: 300 page units, 100 attempted full-span upper drafts, 200 provisional, 66 lower page spans, 97 joined notes, 4 Wasīm preface leaves, no duplicated margins.');
