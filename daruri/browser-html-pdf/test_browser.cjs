#!/usr/bin/env node
'use strict';
/* Independent real-browser integration test, no Playwright PDF export.
 * The generated PDF is downloaded via an ordinary click on a webpage.
 * Fail if any private content or PDF bytes are sent to third-party hosts.
 */
const {spawn}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const URL='http://127.0.0.1:8977/daruri/browser-html-pdf/index.html';
const MODE=process.env.DARURI_BROWSER_MODE||'excerpt';
const ENGINE=process.env.DARURI_BROWSER_ENGINE||'chromium';
const OUTPUT=path.resolve(process.env.DARURI_BROWSER_OUTPUT||'/tmp/daruri-real-browser-vivliostyle');
const browserType=ENGINE==='webkit'?webkit:chromium;
let child,browser,context,page;
const errors=[],requests=[];
function say(...args){console.log('DARURI_BROWSER_TEST',...args)}
async function ready(){
 for(let tries=0;tries<75;tries++){
  try{const r=await fetch(URL);if(r.ok)return}catch{}
  await new Promise(r=>setTimeout(r,500));
 }
 throw Error('Vite source-only test server never started');
}
(async()=>{
 try{
  fs.mkdirSync(OUTPUT,{recursive:true});
  child=spawn('npm',['run','dev'],{
   cwd:__dirname,env:{...process.env,NO_COLOR:'1'},stdio:'ignore'
  });
  await ready();
  browser=await browserType.launch({headless:true});
  context=await browser.newContext({viewport:{width:1100,height:780},acceptDownloads:true,
    javaScriptEnabled:true,serviceWorkers:'block'});
  page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
  page.on('request',request=>{requests.push({
    url:request.url().slice(0,300),method:request.method()
  })});
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>Boolean(window.__daruriRunExperiment),null,{timeout:90000});
  await page.locator('#mode').selectOption(MODE);
  const dl=page.waitForEvent('download',{timeout:195000});
  await page.locator('#make').click();
  const heartbeat=setInterval(async()=>{
    try{
      const phase=await page.evaluate(()=>window.__daruriQA);
      say('LIVE_PHASE',JSON.stringify({
        engine:ENGINE,mode:MODE,phase:phase?.phase,
        status:String(phase?.status||'').slice(0,160),
        progress:String(phase?.progress||'').slice(0,160)
      }));
    }catch{}
  },10000);
  let download;
  try{
    download=await Promise.race([
      dl,
      page.waitForFunction(()=>window.__daruriQA?.phase==='failed',
        null,{timeout:185000}).then(async()=>{
        const failed=await page.evaluate(()=>window.__daruriQA);
        throw Error('Browser typesetter reported an error before download: '+JSON.stringify(failed));
      })
    ]);
  }finally{clearInterval(heartbeat)}
  await page.waitForFunction(()=>{
   const s=window.__daruriQA?.phase;
   return s==='done'||s==='failed';
  },null,{timeout:180000});
  const status=await page.evaluate(()=>window.__daruriQA);
  assert.equal(status.phase,'done','Browser engine failed or timed out: '+JSON.stringify(status));
  assert.equal(download.suggestedFilename(),'daruri-browser-only-'+MODE+'-NONRELEASE.pdf');
  const pdf=path.join(OUTPUT,download.suggestedFilename());
  await download.saveAs(pdf);
  assert.equal(fs.readFileSync(pdf).subarray(0,5).toString(),'%PDF-');
  assert(fs.statSync(pdf).size>20000);
  assert.equal(status.bytes,fs.statSync(pdf).size);
  assert.equal(status.no_browser_print_dialog,true);
  assert.equal(status.no_cdp_print_to_pdf,true);
  assert.equal(status.no_server_pdf_generation,true);
  const external=requests.filter(r=>r.url.startsWith('https:')||
    (r.url.startsWith('http:')&&!r.url.startsWith('http://127.0.0.1:8977')));
  assert.equal(external.length,0,'External resource request: '+JSON.stringify(external));
  assert.equal(requests.filter(r=>/\.pdf(\?|$)/.test(r.url)).length,0,
    'Prebuilt PDF was fetched during browser generation');
  assert.equal(requests.filter(r=>r.method!=='GET').length,0,'Non-GET browser network request');
  if(errors.length)throw Error('Browser console errors: '+JSON.stringify(errors));
  const report={
   engine:ENGINE,mode:MODE,status,downloaded_pdf:pdf,
   bytes:fs.statSync(pdf).size,
   page_pdf_api_used:false,webpage_generated_pdf_without_print_dialog:true,
   external_requests:external,prebuilt_pdf_requests:[],
   original_pdf_search_release_gate:'NOT_YET_CERTIFIED',
   notes:true,footnote_same_page:'CHECK_IN_NATIVE_QA',
   requests:requests.slice(0,60),browser_errors:errors,
   production_approved:false
  };
  fs.writeFileSync(path.join(OUTPUT,'browser-evidence.json'),JSON.stringify(report,null,2));
  say('PASS',JSON.stringify({engine:ENGINE,mode:MODE,bytes:report.bytes,
   duration_ms:status.elapsed_ms,request_count:requests.length}));
 }catch(e){errors.push(String(e.stack||e));console.error('DARURI_BROWSER_TEST_FATAL',e);process.exitCode=2;
  fs.mkdirSync(OUTPUT,{recursive:true});
  fs.writeFileSync(path.join(OUTPUT,'browser-evidence.json'),JSON.stringify({
   engine:ENGINE,mode:MODE,errors,requests,production_approved:false
  },null,2));
 }finally{
  await context?.close().catch(()=>{});
  await browser?.close().catch(()=>{});
  child?.kill();
 }
})();
