#!/usr/bin/env node
'use strict';
/* Real standard website JavaScript generates a downloadable PDF Blob,
 * without browser print dialog or DevTools PDF privileges.
 * This is a FEATURE MICROPROOF (two real Arabic source phrases), NOT
 * a complete book renderer or a release candidate.
 */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const ROOT=path.resolve(__dirname,'../..');
const {chromium,webkit}=require(path.join(ROOT,'daruri/qa/node_modules/playwright'));
const kind=process.env.GN_BROWSER_ENGINE||'chromium';
const port=kind==='chromium'?8991:8992;
const out=path.resolve(process.env.GN_BROWSER_OUT||'/tmp/daruri-browser-blob-'+kind);
fs.mkdirSync(out,{recursive:true});
let server,browser,context,page;let sent=[],consoleErrors=[],pageErrors=[];
const summary={
 engine:kind,source:"two genuine Arabic phrases embedded as HTML text nodes",
 engine_role:"ordinary in-page JS calling pdf-lib with fontkit",
 browser_print_dialog_invoked:false, privileged_devtools_print_used:false,
 pdf_generated_by_screenshot:false, is_complete_html_renderer:false,
 release_approved:false
};
(async()=>{
 try{
   server=cp.spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',ROOT],{stdio:'ignore'});
   await new Promise(r=>setTimeout(r,800));
   browser=await (kind==='webkit'?webkit:chromium).launch({headless:true});
   context=await browser.newContext({acceptDownloads:true});
   page=await context.newPage();
   page.on('pageerror',e=>pageErrors.push(e.message));
   page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text())});
   page.on('request',req=>{if(!req.url().startsWith('http://127.0.0.1:'+port+'/'))sent.push({url:req.url(),method:req.method()});});
   await page.addInitScript(()=>{
      const print=window.print;
      window.print=function(...args){window.__gnPrintInvoked=true;return print.apply(this,args)};
      window.__gnPrintInvoked=false;
   });
   await page.goto('http://127.0.0.1:'+port+'/daruri/dynamic-pdf/browser-rtl-blob-demo.html',{waitUntil:'networkidle',timeout:60000});
   await page.waitForFunction(()=>!!window.fontkit && !!window.PDFLib?.PDFDocument,{timeout:30000});
   const start=performance.now();
   const downloadPending=page.waitForEvent('download',{timeout:90000});
   await page.locator('#create').click();
   const download=await downloadPending;
   const file=path.join(out,'daruri-browser-rtl-text-NONRELEASE.pdf');
   await download.saveAs(file);
   summary.create_pdf_ms=Math.round(performance.now()-start);
   summary.bytes=fs.statSync(file).size;
   summary.pdf_magic=fs.readFileSync(file).subarray(0,5).toString('latin1');
   summary.pdf_file=file;
   summary.print_was_invoked=await page.evaluate(()=>window.__gnPrintInvoked);
   summary.status=await page.locator('#status').innerText();
   summary.download_name=download.suggestedFilename();
   summary.off_origin_requests=sent;
   summary.page_errors=pageErrors;
   summary.browser_console_errors=consoleErrors;
   if(summary.pdf_magic!=='%PDF-' || summary.bytes<3000 || summary.print_was_invoked ||
      summary.off_origin_requests.length)throw Error('Browser PDF bytes failed local origin/print independence gate');
   summary.success=true;
 }catch(e){summary.success=false;summary.error=String(e.stack||e);process.exitCode=2;}
 finally{
   fs.writeFileSync(path.join(out,'browser-pdf-blob-proof.json'),JSON.stringify(summary,null,2)+'\n');
   console.log('BROWSER_PDF_BLOB_PROOF',JSON.stringify(summary));
   await context?.close().catch(()=>{});
   await browser?.close().catch(()=>{});
   server?.kill();
 }
})().catch(e=>{console.error(e);process.exitCode=2});
