'use strict';
// Run: node daruri/qa/verify-personal-export-safety.js
// Tests Reading Desk -> personal-PDF compatibility without touching user storage.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..'),js=fs.readFileSync(path.join(base,'personal-export.js'),'utf8');
const html=fs.readFileSync(path.join(base,'personal-export.html'),'utf8');
const sw=fs.readFileSync(path.join(base,'sw.js'),'utf8');
const bundle=fs.readFileSync(path.join(base,'download-bundle.js'),'utf8');
const editionManifest=JSON.parse(fs.readFileSync(path.join(base,'pdf-editions-manifest.json'),'utf8'));

new vm.Script(js,{filename:'personal-export.js'});
const window={},events=[];
const sandbox={window,document:{readyState:'loading',addEventListener:(name)=>events.push(name)},
 localStorage:{getItem(){return null}},location:{href:'https://example.org/daruri/personal-export.html'},
 URL,console};
vm.runInNewContext(js,sandbox,{filename:'personal-export.js'});
const model=window.GnammaPersonalExportModel;
assert(model,'pure export model not exposed');
let passed=0;
function test(name,check){check();passed++;console.log('PASS '+name);}
const many=Array.from({length:3005},(_,i)=>({id:'book-'+i,kind:'section',title:'Passage '+i,target:{kind:'section',section:String(i+1)},created:1000+i}));
const huge='Arabic عربي <> & '+('N'.repeat(118000))+' FINAL WORD';
const note={id:'dup',kind:'note',body:huge,title:'Long observation',target:null,created:12345,dateSource:'recorded'};
const another={id:'dup',kind:'note',body:'A second independently selectable note',title:'Second',target:{kind:'paragraph',section:'1',segment:0}};
const archive={id:'archived',kind:'future-version',title:'Unresolved old record',body:'Historic observation must be included',target:null};
const primitive='an old primitive record';
const backup={format:'gnamma-reading-desk',version:1,items:[...many,note,another,archive,primitive],futureEnvelope:'no server'};
const records=model.normalizeDesk(backup);
test('all legacy records retained beyond former 3000-item limit',()=>assert.equal(records.length,backup.items.length));
test('full long annotation survives normalization, including trailing words',()=>assert.equal(records[3005].body,huge));
test('duplicate old IDs receive distinct local selection keys',()=>assert.notEqual(records[3005].id,records[3006].id));
test('original record IDs remain available without changing saved data',()=>{
 assert.equal(records[3005].originalId,'dup');assert.equal(records[3006].originalId,'dup');
 assert.equal(backup.items[3005].id,'dup');
});
test('free-standing notes are eligible under personal notes',()=>assert(model.available(records,{personal:true,bookmarks:false}).some(r=>r.id==='dup')));
test('unknown old records are eligible under archived bookmarks',()=>{
 const items=model.available(records,{personal:false,bookmarks:true});
 assert(items.some(r=>r.originalId==='archived'&&r.body.includes('Historic')));
 assert(items.some(r=>r.archivedValue===primitive));
});
test('selection order respects dates or source without overwriting the collection',()=>{
 const rows=[{id:'b',created:200,target:{section:'20',segment:0}},{id:'a',created:100,target:{section:'1',segment:0}}];
 assert.equal(model.orderItems(rows,'created')[0].id,'a');
 assert.equal(model.orderItems(rows,'newest')[0].id,'b');
 assert.equal(model.orderItems(rows,'source')[0].id,'a');
});
test('unknown dates never masquerade as verified creation times',()=>assert(model.dateLine(records[3006]).includes('not recorded reliably')));
test('PDF links require a verified page map',()=>{
 assert.equal(model.verifiedPage('191',{section_pages:{'191':17}},100),16);
 assert.equal(model.verifiedPage('missing',{section_pages:{'191':17}},100),-1);
 assert.equal(model.verifiedPage('191',{section_pages:{'191':101}},100),-1);
});
test('long note content cannot be emitted as shortened PDF comments only',()=>{
 assert(model.requiresAppendix([records[3005]],{annotations:true,appendix:false,dates:true}));
 assert(!model.requiresAppendix([records[3005]],{annotations:true,appendix:true,dates:true}));
});
test('long selected phrases also require complete notes appendix',()=>{
 const quoted=[{kind:'note',body:'brief',target:{quote:'q'.repeat(2000)}}];
 assert(model.requiresAppendix(quoted,{annotations:true,appendix:false,dates:false}));
});
test('short notes cannot escape without endnote links in the new exporter',()=>{
 assert(js.includes("if(!p.appendix)throw Error"));
 assert(js.includes('const missingAppendix=has&&!p.appendix'));
});
test('no notes is the explicit default',()=>assert(/name="pe-mode" value="none" checked/.test(html)));
test('full notes appendix is enabled by default',()=>assert(/id="pe-appendix" checked/.test(html)));
test('PDF page mapper never guesses exact quotation coordinates',()=>{
 assert(js.includes('P1, P2...'));
 assert(js.includes("if(!p.appendix)throw Error("));
});
test('verified metadata agrees with every published PDF edition',()=>{
 const editions=Object.entries(editionManifest.files||{});
 assert.equal(editions.length,5);
 for(const [filename,edition] of editions){
  const metadata=JSON.parse(fs.readFileSync(path.join(base,'build/release',filename+'.metadata.json'),'utf8'));
  assert.equal(metadata.filename,filename);
  assert.equal(metadata.sha256,edition.sha256);
  assert.equal(metadata.pages,edition.pages);
  const pages=Object.values(metadata.section_pages||{}).map(Number);
  assert(pages.length>=200);
  assert(pages.every(p=>Number.isInteger(p)&&p>=1&&p<=edition.pages),'unsafe source-to-PDF page location');
 }
});
test('exporter v3 links, offline worker and downloadable package agree',()=>{
 assert(html.includes('personal-export.js?v=20261022-bookmark-audit1'));
 assert(sw.includes('personal-export.js?v=20261022-bookmark-audit1'));
 assert(sw.includes('personal-export.js?v=2'),'existing installations lost previous v2 asset');
 assert(sw.includes('personal-export.js?v=two-tabs-20261022'),'inline Editions exporter is missing from PWA cache');
 assert(bundle.includes('personal-export.js?v=20261022-bookmark-audit1'),'offline bundle must carry the current inline exporter');
 assert(sw.includes('personal-export.js?v=1'),'existing offline installations lost their previous export asset');
});
test('the picker bounds rendered rows and explains hidden search results',()=>{
 assert(js.includes('visible.slice(0,displayLimit)'));
 assert(js.includes('narrow the search to display other items'));
});
console.log('PASS '+passed+' personal-export preservation, privacy and annotation safety checks');
