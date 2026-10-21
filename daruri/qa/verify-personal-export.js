'use strict';
/* Node-only regressions for safe personal export defaults and matching. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('personal-export.js'),helper=read('personal-pdf-enhancements.js'),html=read('personal-export.html'),
  editions=read('editions.js'),desk=read('reading-desk.js'),
  bundle=read('download-bundle.js'),sw=read('sw.js');
new Function(js);new Function(editions);new Function(desk);
assert.match(html,/name="pe-mode" value="none" checked/,'personal notes must be opt-in, NEVER default');
assert.match(editions,/personal:'none'/,'existing print editions must stay clean');
assert.match(js,/data\.version!==1/,'Reading Desk schema must be explicitly checked');
assert.match(js,/metadata\.sha256!==docData\.sha256/,'PDF page mapping must match exact revision');
assert.match(helper,/allocateMarginTop/,'P references must detect crowded page margins');
assert.match(js,/unmapped/,'missing page anchors must be reported');
assert.match(js,/noteTargets/,'all P references need personal appendix destinations');
assert.doesNotMatch(js,/Subtype:PDFName\.of\('Text'\)/,'private notes must not generate comment boxes');
assert.match(helper,/Subtype:PDFName\.of\('Link'\)/,'personal navigation must use non-comment PDF links');
assert.match(js,/docData\.sha256/,'verify edition checksum');
assert.match(js,/if\(!p\.appendix\)throw Error/,'P-marker navigation requires full private appendix');
assert.match(js,/P'\+\(i\+1\)/,'personal notes need a distinct P reference system');
assert.match(js,/link\.download=name/,'client-side download without upload');
assert.match(bundle,/personal-export\.html/,'offline bundle must include export screen');
assert.match(bundle,/personal-pdf-enhancements\.js/,'offline package must contain P-reference navigation code');
assert.match(sw,/personal-export\.js/,'service worker should include export app');
assert.doesNotMatch(desk,/data-rd="personal-pdf"/,'Reading Desk must not link to Editions personal PDF screen');
assert.match(desk,/data-rd="download-pdf"/,'Reading Desk has its own direct PDF download');
assert.match(editions,/href="personal-export\.html"/,'Editions export entry point');
const doc={readyState:'loading',addEventListener(){}};
const sandbox={window:{},document:doc,location:{href:'https://example.org/daruri/personal-export.html'},
  URL,Intl,Date,Math,Number,String,JSON,Array,RegExp,Map,Set};
vm.runInNewContext(js,sandbox,{filename:'personal-export.js'});
const m=sandbox.window.GnammaPersonalExportModel;
assert(m,'testable pure functions should be exposed without accessing personal data');
const entries=[
 {id:'a',kind:'note',target:{kind:'quote',section:'12',segment:0,quote:'Arabic'},body:'Arabic & English',created:5},
 {id:'b',kind:'note',target:null,body:'Free-standing note',created:10},
 {id:'c',kind:'quote',target:{kind:'quote',section:'8',segment:3,quote:'Saved words'},created:2},
 {id:'deleted',kind:'note',target:{section:'4'},body:'Delete',deleted:999}
];
assert.deepEqual(m.available(entries,{personal:true,bookmarks:false}).map(x=>x.id),['a','b']);
assert.deepEqual(m.available(entries,{personal:false,bookmarks:true}).map(x=>x.id),['c']);
assert.deepEqual(m.available(entries,{personal:false,bookmarks:false}).map(x=>x.id),[]);
assert.deepEqual(m.orderItems(entries.slice(0,3),'source').map(x=>x.id),['c','a','b']);
assert.deepEqual(m.orderItems(entries.slice(0,3),'created').map(x=>x.id),['c','a','b']);
assert.deepEqual(m.orderItems(entries.slice(0,3),'newest').map(x=>x.id),['b','a','c']);
assert.equal(m.verifiedPage('1',{section_pages:{1:8}},250),7);
assert.equal(m.verifiedPage('1',{section_pages:{1:8}},7),-1);
assert.equal(m.verifiedPage('not-a-number',{section_pages:{1:8}},250),-1);
assert.equal(m.verifiedPage('666',{section_pages:{666:999}},250),-1);
assert.equal(m.verifiedPage(null,null,250),-1);
assert.match(m.entryText(entries[0],0,false),/Arabic & English/);
assert.doesNotMatch(m.entryText(entries[0],0,false),/Saved/);
assert.equal(m.dateLine({dateSource:'legacy-unknown',created:12345}),'Original date not recorded reliably');
assert.match(m.dateLine({dateSource:'recorded',created:Date.UTC(2026,9,21)}),/Saved /);
console.log('PASS opt-out default, local-only architecture, schema, sorting, section safety, timestamps and export integration');