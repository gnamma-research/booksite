'use strict';
/* End-to-end Reading Desk toolbar and PDF export. Use a local server and synthetic
 * notes only. Chromium desktop/touch plus touch WebKit approximate browser behavior.
 * Physical iOS Safari, native print dialogs and Android hardware require separate QA.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process'),{chromium,webkit}=require('playwright');
const {PDFDocument}=require('pdf-lib');
const pdfjsPromise=import('pdfjs-dist/legacy/build/pdf.mjs');
const ROOT=path.resolve(__dirname,'../..'),HOST='http://127.0.0.1:8878';
const ART=path.join(ROOT,'daruri/qa/reading-desk-pdf-artifacts');
fs.mkdirSync(ART,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const at=Date.UTC(2026,9,21,8,0);
const longEnd='SURVIVES THE END — محفوظ';
const items=[
 {id:'brief',kind:'note',title:'Usul comparison',body:'The exact quotation should remain searchable. محفوظ',
  target:{kind:'paragraph',section:'1',segment:0,lang:'en'},
  created:at,updated:at,modified:0,dateSource:'recorded',deleted:0},
 {id:'archival',kind:'note',title:'Unattached research note',body:'Archival note. '+('word '.repeat(350))+longEnd,
  target:null,standalone:true,created:at,updated:at,dateSource:'recorded',deleted:0},
 {id:'section',kind:'section',target:{kind:'section',section:'1'},title:'Beginning',body:'',
  created:at,updated:at,dateSource:'recorded',deleted:0}
];
async function extractText(pdfBytes){
 const pdfjs=await pdfjsPromise;
 const task=pdfjs.getDocument({data:new Uint8Array(pdfBytes),useSystemFonts:true,disableFontFace:true});
 const pdf=await task.promise;let all='';
 for(let i=1;i<=pdf.numPages;i++){
  const page=await pdf.getPage(i),content=await page.getTextContent();
  all+=content.items.map(x=>x.str||'').join(' ')+'\n';
 }
 await task.destroy();return all;
}
async function run(engine,width,touch){
 const name=(engine===webkit?'webkit':'chromium')+'-'+width;
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}: {})});
 const context=await browser.newContext({viewport:{width,height:844},isMobile:touch,hasTouch:touch,
  deviceScaleFactor:touch?2:1,acceptDownloads:true,reducedMotion:'reduce'});
 await context.addInitScript(seed=>{
  window.__nativePrintInvocations=0;
  window.print=()=>{window.__nativePrintInvocations++;};
  localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify({
   format:'gnamma-reading-desk',version:1,items:seed,privatePreservation:'must remain'
  }));
 },items);
 const page=await context.newPage(),errors=[],outsideWrites=[];
 page.on('pageerror',e=>errors.push(String(e.message)));
 page.on('request',r=>{if(r.method()!=='GET'&&!r.url().startsWith(HOST))outsideWrites.push(r.url());});
 try{
  await page.goto(HOST+'/daruri/#bookmarks',{waitUntil:'domcontentloaded',timeout:90000});
  await page.locator('.gn-rd-page').waitFor({timeout:90000});
  await page.screenshot({path:path.join(ART,name+'-toolbar.png'),fullPage:true});
  assert.equal(await page.locator('.gn-rd-card-open').count(),3,name+' saved rows');
  assert.equal(await page.locator('.gn-rd-toolbar [data-rd="personal-pdf"]').count(),0,
   'Do not link Editions personal PDF exporter from Reading Desk');
  assert.equal(await page.locator('#gn-rd-source, #gn-rd-sort, .gn-rd-tools-menu').count(),0,
   'No redundant dropdowns in the redesigned Reading Desk');
  assert.equal(await page.locator('.gn-rd-controls [data-rd="source-filter"]').count(),7);
  assert.equal(await page.locator('.gn-rd-controls [data-rd="sort-filter"]').count(),5);
  assert.equal(await page.locator('.gn-rd-tabs [aria-pressed=true]').count(),1);
  await page.locator('[data-rd="source-filter"][data-value="dictionary"]').click();
  assert.match(await page.locator('.gn-rd-count').innerText(),/0 saved items/);
  await page.locator('[data-rd="source-filter"][data-value="all"]').click();
  await page.locator('[data-rd="sort-filter"][data-value="source"]').click();
  assert.equal(await page.locator('[data-rd="sort-filter"][data-value="source"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-rd="sort-filter"][data-value="created-desc"]').click();
  await page.locator('.gn-rd-toolbar [data-rd="print-list"]').click();
  await page.locator('#gn-rd-print-root').waitFor();
  assert.equal(await page.locator('#gn-rd-print-sheet-body article').count(),3);
  assert.equal(await page.locator('#gn-rd-print-root [data-rd="download-pdf"]').count(),1);
  assert.equal(await page.locator('#gn-rd-print-root [data-rd="print-now"]').count(),1);
  assert.equal(await page.locator('#gn-rd-print-root select').count(),0);
  await page.screenshot({path:path.join(ART,name+'-print-options.png'),fullPage:false});
  await page.locator('[data-rd="print-toggle"][data-key="arabic"]').click();
  assert.equal(await page.locator('#gn-rd-print-sheet-body .gn-rd-print-ar').count(),0);
  await page.locator('[data-rd="print-toggle"][data-key="arabic"]').click();
  assert(await page.locator('#gn-rd-print-sheet-body .gn-rd-print-ar').count()>0);
  await page.locator('#gn-rd-print-root [data-rd="print-now"]').click();
  assert.equal(await page.evaluate(()=>window.__nativePrintInvocations),1,
   name+': Print must actually invoke window.print() from the button');
  if(engine===chromium&&!touch){
   const printable=await page.pdf({format:'A4',printBackground:true});
   const printdoc=await PDFDocument.load(printable);
   assert(printdoc.getPageCount()>=1);
   const nativeText=await extractText(printable);
   assert(nativeText.includes('Usul comparison')&&nativeText.includes('SURVIVES THE END'),
    'Native print/PDF output must contain personal notes, not only options');
  }
  const downloadPromise=page.waitForEvent('download',{timeout:120000});
  await page.locator('#gn-rd-print-root [data-rd="download-pdf"]').click();
  const download=await downloadPromise,output=path.join(ART,name+'.pdf');
  await download.saveAs(output);
  const bytes=fs.readFileSync(output),pdf=await PDFDocument.load(bytes);
  assert(pdf.getPageCount()>=1&&bytes.length>7000,'A non-empty standalone PDF must be generated');
  const searchable=await extractText(bytes);
  assert(searchable.includes('Usul comparison'),'PDF searchable title lost');
  assert(searchable.includes('The exact quotation'),'PDF searchable personal note lost');
  assert(searchable.includes('SURVIVES THE END'),'PDF note ending lost');
  assert(/محفوظ/.test(searchable),'Arabic Unicode notes were not preserved in PDF');
  assert(await page.locator('#gn-rd-pdf-result').isVisible(),'Reusable PDF download link missing');
  assert.match(await page.locator('#gn-rd-pdf-message').innerText(),/PDF ready/);
  await page.locator('[data-rd="print-toggle"][data-key="dates"]').click();
  assert(!await page.locator('#gn-rd-pdf-result').isVisible(),
   'Changing an option must invalidate the stale generated file');
  await page.locator('#gn-rd-print-root [data-rd="close-print"]').click();
  assert.equal(await page.locator('#gn-rd-print-root').count(),0);
  // Individual item printing must be scoped and must never include unrelated private notes.
  await page.locator('.gn-rd-card-open[data-id="brief"]').click();
  await page.locator('#gn-rd-detail [data-rd="print"]').click();
  assert.equal(await page.locator('#gn-rd-print-sheet-body article').count(),1);
  assert(!(await page.locator('#gn-rd-print-sheet-body').innerText()).includes('Unattached research note'));
  await page.locator('#gn-rd-print-root [data-rd="close-print"]').click();
  const stored=JSON.parse(await page.evaluate(()=>localStorage.getItem('gnamma-reading-desk-v1')));
  assert.equal(stored.privatePreservation,'must remain');
  assert.equal(stored.items.length,3);
  assert.equal(outsideWrites.length,0,'No personal note text may be sent to outside services');
  const dimensions=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth}));
  assert(dimensions.overflow<=3,name+' horizontal overflow: '+JSON.stringify(dimensions));
  if(touch)await page.screenshot({path:path.join(ART,name+'.png'),fullPage:true});
  assert.equal(errors.length,0,name+' uncaught JavaScript: '+errors.join('; '));
  console.log('PASS '+name+': icon filters, option toggles, true local Unicode PDF, print action, scope, note privacy and geometry. '+bytes.length+' bytes '+pdf.getPageCount()+' pages.');
 }catch(error){await page.screenshot({path:path.join(ART,name+'-FAIL.png')}).catch(()=>{});throw error;}
 finally{await context.close();await browser.close();}
}
async function main(){
 const server=spawn('python3',['-m','http.server','8878','--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
 try{await pause(1600);await run(chromium,1200,false);await run(chromium,390,true);await run(webkit,390,true);}
 finally{server.kill();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});