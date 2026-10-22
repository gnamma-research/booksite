#!/usr/bin/env node
'use strict';
/* Read-only browser integration smoke: dynamic PDF → private P-note PDF.
   Test-only HTML injection, no published site changes. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process');
const root=path.resolve(process.env.GNAMMA_SITE_ROOT||path.resolve(__dirname,'../..'));
const modules=path.join(root,'daruri/qa/node_modules');
const {chromium,webkit}=require(path.join(modules,'playwright'));
const {PDFDocument,PDFName,PDFArray}=require(path.join(modules,'pdf-lib'));
const destination=require(path.join(root,'daruri/qa/native-phone/resolve-pdf-link.cjs'));
const engine=process.env.GNAMMA_BROWSER||'chromium';
if(!['chromium','webkit'].includes(engine))throw Error('Unsupported browser '+engine);
const host='http://127.0.0.1:8778';
const output=path.resolve(process.env.GNAMMA_DYNAMIC_BROWSER_OUTPUT||path.join(os.tmpdir(),'gnamma-dynamic-'+engine+'.pdf'));
const server=spawn('python3',['-m','http.server','8778','--bind','127.0.0.1','--directory',root],{stdio:'ignore'});
const sleep=t=>new Promise(r=>setTimeout(r,t));

const snippet=[
'<div id="gn-dyn-qa">',
'<p id="gn-dyn-status" aria-live="polite">Initializing</p>',
'<label>Dynamic edition <select id="gn-dyn-profile"></select></label>',
'<button id="gn-dyn-make" disabled type="button">Generate plain</button>',
'<button id="gn-dyn-personal" disabled type="button">Create personal PDF</button>',
'<a id="gn-dyn-download" hidden download>Download generated</a>',
'<div id="gn-dyn-personal-status"></div></div>',
'<script defer src="vendor/pdf-lib-1.17.1.min.js"></script>',
'<script defer src="dynamic-pdf/core.js"></script>',
'<script defer src="dynamic-pdf/client.js"></script>'
].join('\n');
const desk={format:'gnamma-reading-desk',version:1,items:[
 {id:'dynamic-note',kind:'note',title:'My verified dynamic annotation',
  body:'Private marker QQ-7744 — بالعربية علم وأصول.',
  target:{kind:'quote',section:'1',segment:0,lang:'en',quote:'knowledge'},
  created:Date.UTC(2026,9,22),updated:Date.UTC(2026,9,22),dateSource:'recorded',deleted:0},
 {id:'standalone',kind:'note',title:'Standalone original',
  body:'A private note without a source anchor, never silently deleted.',
  target:null,standalone:true,created:0,updated:1,dateSource:'legacy-unknown',deleted:0}
]};
function links(pdf,begin,end){
 const rows=[];
 for(let i=begin;i<end;i++){
  const node=pdf.getPage(i).node;
  if(!node.get(PDFName.of('Annots')))continue;
  const annotations=node.lookup(PDFName.of('Annots'),PDFArray);
  for(let j=0;j<annotations.size();j++){
   const item=pdf.context.lookup(annotations.get(j));
   const subtype=String(item.lookup(PDFName.of('Subtype')));
   assert.notEqual(subtype,'/Text','No personal popup annotations permitted');
   if(subtype!=='/Link')continue;
   const to=destination(pdf,item);
   if(to instanceof PDFArray)rows.push({source:i,ref:String(to.get(0))});
  }
 }
 return rows;
}
async function main(){
 let browser;
 try{
  await sleep(1300);
  browser=await {chromium,webkit}[engine].launch({headless:true});
  const page=await browser.newPage({acceptDownloads:true,viewport:{width:390,height:844},
    isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const unexpected=[],errors=[];
  page.on('request',r=>{
   if(r.url().startsWith('http')&&(!r.url().startsWith(host)||r.method()!=='GET'))
    unexpected.push({url:r.url(),method:r.method()});
  });
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(value=>localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify(value)),desk);
  await page.route(host+'/daruri/personal-export.html',async route=>{
   const response=await route.fetch();
   const html=await response.text();
   assert(html.includes('</body>'),'Injection point absent');
   await route.fulfill({response,body:html.replace('</body>',snippet+'</body>')});
  });
  await page.goto(host+'/daruri/personal-export.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>(
   window.GnammaDynamicPdf?.assemble&&
   window.GnammaPersonalExportInline?.registerDynamicEdition&&
   document.querySelector('#gn-dyn-profile')?.options.length===120&&
   document.querySelector('#pe-edition')?.options.length>=137
  ),null,{timeout:120000});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+4),
    'Mobile viewport overflow at 390 px');
  assert.match(await page.locator('#pe-generate').innerText(),/Open unchanged PDF/);
  await page.locator('#gn-dyn-profile')
    .selectOption('apparatus/daruri-reading-bilingual-glossary.pdf');
  const started=Date.now();
  await page.locator('#gn-dyn-personal').click();
  await page.waitForFunction(()=>(
   document.querySelector('#pe-edition')?.value.startsWith('generated-')&&
   /Verified \d+ pages/.test(document.querySelector('#gn-dyn-status')?.textContent||'')
  ),null,{timeout:240000});
  const chosen=await page.locator('#pe-edition').inputValue();
  assert.match(chosen,/^generated-[a-f0-9]{16}\.pdf$/);
  assert.match(await page.locator('#gn-dyn-status').innerText(),/86 pages/);
  assert.equal(await page.locator('input[name=pe-mode]:checked').inputValue(),'all');
  assert.match(await page.locator('#pe-count').innerText(),/2 qualifying items/);
  const dlEvent=page.waitForEvent('download',{timeout:240000});
  await page.locator('#pe-generate').click();
  const file=await dlEvent;
  fs.mkdirSync(path.dirname(output),{recursive:true});
  await file.saveAs(output);
  const warning=await page.locator('#pe-alert').innerText();
  assert(!/export failed|publication not generated/i.test(warning),warning);
  const pdf=await PDFDocument.load(fs.readFileSync(output));
  const basePages=86;
  assert(pdf.getPageCount()>basePages,'No personal pages in dynamic PDF');
  const appendixRefs=new Set(Array.from({length:pdf.getPageCount()-basePages},(_,i)=>
    String(pdf.getPage(basePages+i).ref)));
  const baseRefs=new Set(Array.from({length:basePages},(_,i)=>
    String(pdf.getPage(i).ref)));
  const forward=links(pdf,0,basePages),back=links(pdf,basePages,pdf.getPageCount());
  assert(forward.some(x=>appendixRefs.has(x.ref)),'Missing P marker → appendix');
  assert(back.some(x=>baseRefs.has(x.ref)),'Missing personal appendix → source link');
  assert.deepEqual(unexpected,[],'Private notes must not cause remote requests');
  assert.deepEqual(errors,[],'Unhandled browser errors');
  assert.equal(await page.evaluate(()=>
    JSON.parse(localStorage.getItem('gnamma-reading-desk-v1')).items.length),2,
    'Personal notes unexpectedly mutated');
  const info={browser:engine,result:'PASS',personal_pages:pdf.getPageCount(),
    published_body_pages:basePages,forward_links:forward.length,return_links:back.length,
    elapsed_ms:Date.now()-started,pdf_file:output,no_third_party_requests:true};
  fs.writeFileSync(output+'.json',JSON.stringify(info,null,2));
  console.log('DYNAMIC_PERSONAL_BROWSER_PASS',JSON.stringify(info));
 }finally{if(browser)await browser.close();server.kill();}
}
main().catch(e=>{console.error(e);server.kill();process.exitCode=1;});
