'use strict';
/* Contract for the self-contained HTML reader ZIP and complete PDF archive. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const script=read('download-bundle.js');
const index=read('index.html');
const selector=read('editions-selector.js');
const events=[];
const doc={baseURI:'https://example.org/booksite/daruri/',
  addEventListener:(event,fn)=>events.push(event),
  querySelectorAll:()=>[]};
const window={};
vm.runInNewContext(script,{window,document:doc,location:{protocol:'https:'},
  URL,TextEncoder,Uint8Array,Uint32Array,DataView,Blob,Date,setTimeout,
  console,Map,Set},{filename:'download-bundle.js'});
const model=window.GnammaOfflineBundle;
assert(model&&typeof model.sourceFiles==='function');
assert(events.includes('click'),'Must support dynamically rendered offline links');
const html=model.sourceFiles('html'),full=model.sourceFiles('full');
assert(html.files.length>40,'Offline HTML reader needs accompanying assets');
assert.equal(html.pdfNames.length,0,'HTML-only must not include published PDFs');
assert(!html.files.some(([name])=>/\.pdf$/i.test(name)),'HTML-only ZIP contains PDF files');
assert(full.pdfNames.length>=12,'Complete package retains original PDF collection');
for(const [kind,manifest] of [['html',html],['full',full]]){
  const names=new Set();
  for(const [name,source]of manifest.files){
    assert(!names.has(name),kind+' ZIP has duplicated entry '+name);
    names.add(name);
    assert(fs.existsSync(path.join(root,'..',name)),
      kind+' ZIP references missing file '+name+' ('+source+')');
  }
}
assert(index.includes('data-route="editions"'),'Downloads is in the primary navigation');
assert(index.includes('>Downloads</button>'),'Downloads has a clear label');
assert(!index.includes('id="downloadsMenu"')&&!index.includes('id="fb-downloads-menu"'),
  'Duplicate sidebar PDF-download lists were not removed');
for(const type of ['book','guide','offline','source'])
  assert(selector.includes('data-es-download-type="'+type+'"'),'Missing choice '+type);
assert(selector.includes('data-daruri-bundle="html"'));
assert(selector.includes('data-es-action="download"')&&selector.includes('Download PDF'));
assert(selector.includes('Download Study Guide (PDF)'),'Separate learning companion available');
assert(!selector.includes('gn-es-study-guide'),'Study Guide PDF must not look like selected PDF');
console.log('PASS: complete HTML-only reader, no missing sources, no duplicate filenames, PDF archive preserved, one download destination');
