#!/usr/bin/env node
'use strict';
/* Browser-only DOM -> glyph-path PDF experiment. No screenshot/print/CDP.
 * This is a deliberate 12-source-phrase experiment, not a full edition.
 */
const {spawn}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const ROOT=__dirname;
const ORDER=process.env.GNAMMA_VECTOR_ORDER||'reverse';
const ENGINE=process.env.GNAMMA_VECTOR_BROWSER||'chromium';
if(!['forward','reverse','grapheme'].includes(ORDER)||!['chromium','webkit'].includes(ENGINE))
  throw Error('Unexpected browser or source direction');
const OUT=process.env.GNAMMA_VECTOR_OUTPUT||('/tmp/gnamma-vector-'+ENGINE+'-'+ORDER);
const URL='http://127.0.0.1:8977/daruri/browser-html-pdf/vector-outline.html?order='+ORDER;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let server,browser,context,page;
const requests=[],errors=[];
(async()=>{
 try{
  fs.mkdirSync(OUT,{recursive:true});
  server=spawn('npm',['run','dev'],{cwd:ROOT,stdio:'ignore',env:{...process.env,NO_COLOR:'1'}});
  let available=false;
  for(let i=0;i<80;i++){
   try{const res=await fetch(URL);if(res.ok){available=true;break}}catch{}
   await wait(400);
  }
  if(!available)throw Error('Local Vite HTML fixture unavailable');
  browser=await (ENGINE==='webkit'?webkit:chromium).launch({headless:true});
  context=await browser.newContext({viewport:{width:1050,height:780},
    acceptDownloads:true,serviceWorkers:'block'});
  page=await context.newPage();
  page.on('request',r=>requests.push({url:r.url(),method:r.method()}));
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  const downloadPromise=page.waitForEvent('download',{timeout:120000});
  await page.locator('#make').click();
  const download=await Promise.race([
   downloadPromise,
   page.waitForFunction(()=>window.__gnammaVectorStatus?.phase==='failed',null,
     {timeout:115000}).then(async()=>{throw Error('Vector probe failed: '+JSON.stringify(
       await page.evaluate(()=>window.__gnammaVectorStatus)))})
  ]);
  const report=await page.evaluate(()=>window.__gnammaVectorStatus);
  assert.equal(report.phase,'done',JSON.stringify(report));
  assert.equal(report.order,ORDER);
  assert.equal(report.target_phrases.length,12);
  assert.equal(report.html_dom_measured,true);
  assert.equal(report.drawn_source_as_pdf_glyph_paths,true);
  assert.equal(report.source_arabic_text_ops_only_in_one_exact_CID_layer,true);
  assert.equal(report.input_original_prebuilt_pdfs,0);
  assert.equal(report.no_print_dialog,true);
  assert.equal(report.no_server_pdf,true);
  assert.equal(report.publication_approved,false);
  const output=path.join(OUT,'daruri-vector-outline-'+ORDER+'-NONRELEASE.pdf');
  await download.saveAs(output);
  const data=fs.readFileSync(output);
  assert.equal(data.subarray(0,5).toString('ascii'),'%PDF-');
  assert.equal(data.length,report.bytes);
  assert(data.length>80000,'Full Noto outline/font vectors not embedded');
  const disallowed=requests.filter(r=>r.method!=='GET'||!r.url.startsWith('http://127.0.0.1:8977/')||
    /\.pdf(\?|$)/.test(r.url));
  assert.deepEqual(disallowed,[],'Network used a prebuilt PDF, external origin, or upload');
  assert.deepEqual(errors,[],'Browser emitted JavaScript console/page errors');
  fs.writeFileSync(path.join(OUT,'dom-evidence.json'),
    JSON.stringify({engine:ENGINE,order:ORDER,...report,
      requests:requests.slice(0,50),page_pdf_export_api_used:false},null,2));
  console.log('GNAMMA_VECTOR_BROWSER_PDF',JSON.stringify({
    browser:ENGINE,order:ORDER,bytes:data.length,visible_vector_paths:true,
    exactly_one_unicode_source_layer:true,canonical_sample_phrases:12,
    no_external_or_pdf_requests:true,publication_approved:false
  }));
 }catch(error){
  console.error('GNAMMA_VECTOR_BROWSER_FAILURE',String(error?.stack||error));
  fs.mkdirSync(OUT,{recursive:true});
  fs.writeFileSync(path.join(OUT,'failure.json'),JSON.stringify({
    error:String(error?.stack||error),engine:ENGINE,order:ORDER,
    requests,errors,publication_approved:false},null,2));
  process.exitCode=2;
 }finally{
  await context?.close().catch(()=>{});
  await browser?.close().catch(()=>{});
  server?.kill();
 }
})();