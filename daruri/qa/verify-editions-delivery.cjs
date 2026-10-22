'use strict';
// Pure delivery-contract QA: no network, no personal browser data, no PDFs mutated.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const get=file=>fs.readFileSync(path.join(root,file),'utf8');
const selector=get('editions-selector.js');
const styles=get('editions-selector.css');
const bundle=get('download-bundle.js');
const menu=get('compact-menu.css');
const exportScript=get('personal-export.js');
const html=get('index.html');
const sw=get('sw.js');
for(const [name,code] of [['selector',selector],['bundler',bundle],['personal-export',exportScript]])
  assert.doesNotThrow(()=>new vm.Script(code,{filename:name+'.js'}));

assert(selector.includes('id="gn-es-prepare"'),'Real prepare action required');
assert(selector.includes('data-es-action="download"'),'User chooses final PDF download');
assert(selector.includes("crypto.subtle.digest('SHA-256'"),'Must verify actual PDF bytes');
assert(selector.includes("response.body?.getReader"),'Real network progress, not fabricated animation');
assert(selector.includes("preparation.controller.abort()"),'Obsolete requests must be cancelled');
assert(selector.includes("availability.hidden=result.status==='ready'"),
  'Do not show an availability banner when the file is available');
assert(!selector.includes('data-es-study-guide'),
  'Study Guide is a different teaching companion, not a chosen edition');
assert(selector.includes('data-daruri-bundle="html"'),'HTML offline package must be offered in Editions');
assert(selector.includes('data-daruri-bundle="full"'),'Optional PDFs remain downloadable');
assert(selector.includes('class="gn-es-spec-detail"'),'Selection details should be disclosed, not repeated prominently');
assert(styles.includes('.gn-es .gn-es-offline'),'Offline options should match the active palette');
assert(menu.includes('#downloadsMenu,#fb-downloads-menu{display:none!important}'),
  'Duplicate sidebar download menus should not be visible');
assert(exportScript.includes("if(!document.querySelector('.gn-es #pe-form'))"),
  'Embedded personal PDF should not download before the user chooses to');
assert(bundle.includes("document.addEventListener('click'"),
  'Offline button handlers must work after dynamically mounting Editions');
assert(bundle.includes('completed%5===0'),'Bundler progress counts actual retrieved files');

const start=bundle.indexOf("  function sourceFiles(mode='full') {");
const end=bundle.indexOf('  async function readFile(',start);
assert(start>0&&end>start,'Offline manifest generator must be isolated');
const sandbox={
  URL,root:new URL('https://example.org/booksite/daruri/'),
  document:{querySelectorAll:()=>[]}
};
vm.runInNewContext(bundle.slice(start,end)+
  "\nthis.results={html:sourceFiles('html'),full:sourceFiles('full')};",sandbox);
const manifests=sandbox.results;
const names=manifest=>manifest.files.map(item=>item[0]);
const htmlNames=names(manifests.html),fullNames=names(manifests.full);
assert(htmlNames.includes('daruri/index.html'));
assert(htmlNames.includes('daruri/dictionary.html'));
assert(htmlNames.includes('daruri/editions-selector.js'));
assert(!htmlNames.some(n=>/\.pdf(?:\.(?:metadata\.)?json)?$/i.test(n)),
  'HTML package must exclude all PDF files and mapping derivatives');
assert(fullNames.some(n=>n==='daruri/daruri.pdf'),'Full bundle includes scholarly PDF');
assert(fullNames.length>htmlNames.length,'HTML-only package should be smaller');

for(const [name,uri] of manifests.html.files){
 const relative=new URL(uri,'https://example.org/booksite/daruri/').pathname
   .replace(/^\/booksite\//,'');
 assert(!relative.includes('/../'),'No offline path traversal: '+name);
 assert(fs.existsSync(path.join(root,'..',relative)),
   'Missing offline HTML dependency '+name+' from '+uri);
}

assert(html.includes('editions-selector.js?v='),'Reader imports selector');
assert(sw.includes('editions-selector.js?v='),'Offline shell caches selector');
console.log('PASS: real PDF verification, honest progress, study-guide separation,'
  +' offline HTML dependency closure, privacy and single downloads destination');
