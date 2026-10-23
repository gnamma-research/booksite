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

assert(selector.includes('data-es-action="download"'),'Direct published PDF download exists');
assert(selector.includes("download.href=open.getAttribute('href')"),'PDF download uses selected View PDF URL');
assert(selector.includes('data-es-action="download"'),'User chooses final PDF download');
assert(selector.includes('download.hidden=!showPublic||viewOnly'),
  'Downloads must stay hidden for personal/unavailable PDFs and Apple preview devices');
assert(selector.includes("open.classList.toggle('gn-es-action-primary',viewOnly)"),
  'Apple touch PDFs must have one prominent View PDF action');
assert(selector.includes("viewOnly?'View PDF':'View in browser'"),
  'Desktop preview must be explicitly labelled View in browser');
assert(selector.includes('data-es-ios-save-help'),
  'iPhone/iPad must explain Share → Save to Files');
assert(selector.includes("navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1"),
  'iPad desktop-style user agents must get preview-first UI');

const policyStart=selector.indexOf('  const APPLE_PDF_PREVIEW=(()=>{');
const policyEnd=selector.indexOf("  const NAV=['reading','reference'];",policyStart);
assert(policyStart>0&&policyEnd>policyStart,'Device-aware PDF policy is present');
const getPreviewDevice=(userAgent,platform='',maxTouchPoints=0)=>{
  const context={navigator:{userAgent,platform,maxTouchPoints}};
  vm.runInNewContext(selector.slice(policyStart,policyEnd)+
    '\nthis.applePreview=APPLE_PDF_PREVIEW;',context);
  return context.applePreview;
};
assert.equal(getPreviewDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X)'),true);
assert.equal(getPreviewDevice('Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X)'),true);
assert.equal(getPreviewDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'MacIntel',5),true,
  'iPad reporting a desktop-class user agent still previews only');
assert.equal(getPreviewDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X)','MacIntel',0),false);
assert.equal(getPreviewDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64)','Win32',0),false);
assert.equal(getPreviewDevice('Mozilla/5.0 (Linux; Android 15; Pixel)','Linux armv8l',5),false,
  'Do not assume Android always lacks a useful native download');

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

const sourceRelease=JSON.parse(get('source-archive-manifest.json'));
const legacyEditions=get('editions.js');
assert.equal(sourceRelease.schema,'gnamma-daruri-source-archive-v1');
assert.equal(sourceRelease.file,'source/Daruri_Portable_Scholarly_Source.zip');
assert(['withheld','published'].includes(sourceRelease.status),'Release manifest status must be explicit');
assert(!legacyEditions.includes('<h3>Study PDF</h3>') &&
       !legacyEditions.includes('<h3>Study Guide</h3>'),
  'Legacy fallback must not resurrect unrelated download cards');
assert(selector.includes('data-es-source hidden') && selector.includes('data-es-download-type="source"'),'Research ZIP separately selectable');
assert(selector.includes('data-es-download-type="guide"'),'Study Guide separately selectable');
assert(styles.includes('@container (min-width:725px)'),'Responsive desktop rail specified');
assert(!bundle.includes('Daruri_Portable_Scholarly_Source.zip'),
  'Offline website bundle must not impersonate the scholarly source ZIP');

const gateStart=selector.indexOf('  const SOURCE_ARCHIVE_PATH=');
const gateEnd=selector.indexOf('  function mount(main){',gateStart);
assert(gateStart>0&&gateEnd>gateStart,'Extract the exact source-release gate from Editions');
const sourceGate=selector.slice(gateStart,gateEnd)+
  '\nthis.check=approvedSourceRelease;this.show=showApprovedSourceDownload;';

function sourceFixture(meta,head={type:'application/zip',length:1818169,ok:true}){
  const link={href:'',download:''},label={textContent:''},hash={textContent:''};
  const panel={hidden:true,querySelector:key=>({
    '[data-es-source-download]':link,
    '[data-es-source-metadata]':label,
    '[data-es-source-hash]':hash
  })[key]};
  const view={isConnected:true,querySelector:key=>key==='[data-es-source]'?panel:null};
  let heads=0;
  const context={
    URL,root:view,location:{origin:'https://example.org'},
    document:{baseURI:'https://example.org/booksite/daruri/'},
    fetch:async (url,options={})=>{
      if(options.method==='HEAD'){
        heads++;
        return {ok:head.ok,url:String(url),headers:{get:name=>
          name==='content-type'?head.type:name==='content-length'?
            String(head.length):null}};
      }
      return {ok:true,json:async()=>meta};
    }
  };
  vm.runInNewContext(sourceGate,context);
  return {view,panel,link,label,hash,context,get heads(){return heads;}};
}

const candidate={...sourceRelease,status:'published',
  rights_review:'approved',editorial_review:'approved',
  version:'daruri-2026-10-23',source_commit:'a'.repeat(40),
  sha256:'b'.repeat(64),size_bytes:1818169};
(async()=>{
  const unpublished=sourceFixture({...candidate,status:'withheld'});
  await unpublished.context.show(unpublished.view);
  assert.equal(unpublished.panel.hidden,true,'Withheld ZIP must not create a visible action');
  assert.equal(unpublished.heads,0,'Do not fetch withheld source artifacts');
  for(const disallowed of [
    {status:'withheld'},{rights_review:'pending'},{editorial_review:'pending'},
    {file:'https://example.org/foreign.zip'},{sha256:'not-a-checksum'},
    {size_bytes:null}
  ]){
    const fixture=sourceFixture({...candidate,...disallowed});
    await fixture.context.show(fixture.view);
    assert.equal(fixture.panel.hidden,true,'Invalid publication gate exposed source ZIP');
    assert.equal(fixture.heads,0,'Invalid publication gate must not fetch ZIP');
  }
  for(const badHead of [
    {type:'text/html',length:1818169,ok:true},
    {type:'application/zip',length:42,ok:true},
    {type:'application/zip',length:1818169,ok:false}
  ]){
    const fixture=sourceFixture(candidate,badHead);
    await fixture.context.show(fixture.view);
    assert.equal(fixture.panel.hidden,true,'Bad hosted resource must be invisible');
  }
  const available=sourceFixture(candidate);
  await available.context.show(available.view);
  assert.equal(available.panel.hidden,false,'Approved and hosted source ZIP must become available');
  assert.match(available.link.href,/source\/Daruri_Portable_Scholarly_Source\.zip\?v=bbbbbbbbbbbb$/);
  assert.equal(available.link.download,'Daruri_Portable_Scholarly_Source.zip');
  assert.equal(available.hash.textContent,candidate.sha256);
  assert.match(available.label.textContent,/source commit a{12}/);
  console.log('PASS: source ZIP release gate, content-type/length checks, clean fallback and separate offline bundle.');
})().catch(error=>{console.error(error);process.exitCode=1;});

console.log('PASS: direct PDF, four download purposes, source archive, study-guide separation,'
  +' offline HTML dependency closure, privacy and single downloads destination');
