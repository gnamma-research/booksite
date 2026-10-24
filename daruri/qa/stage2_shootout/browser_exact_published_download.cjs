#!/usr/bin/env node
/* Prove that an ordinary browser can DOWNLOAD the current signed published PDF
 * byte-for-byte from the static site; this is delivery, NOT HTML retypesetting.
 * Does not access personal notes or upload data.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../../..');
const ENGINE=process.env.BENCH_BROWSER||'chromium';
const OUT=process.env.BENCH_OUT||'/tmp/daruri-exact-pdf';
const ORIGIN='http://127.0.0.1:8992';
const WAIT=ms=>new Promise(r=>setTimeout(r,ms));
const sha=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
let child,browser,context;
(async()=>{
 try{
  fs.mkdirSync(OUT,{recursive:true});
  const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'daruri/pdf-editions-manifest.json')));
  const expected=manifest.files['daruri.pdf'];
  const official=fs.readFileSync(path.join(ROOT,'daruri/daruri.pdf'));
  assert.equal(sha(official),expected.sha256,'Published artifact must match manifest');
  child=spawn('python',['-m','http.server','8992','--bind','127.0.0.1'],
              {cwd:ROOT,stdio:'ignore'});
  let ready=false;
  for(let i=0;i<70;i++){try{
    if((await fetch(ORIGIN+'/daruri/pdf-editions-manifest.json')).ok){
      ready=true;break;
    }
   }catch{}await WAIT(150)}
  if(!ready)throw Error('Static same-origin server not ready');
  browser=await (ENGINE==='webkit'?webkit:chromium).launch({headless:true});
  context=await browser.newContext({acceptDownloads:true,serviceWorkers:'block'});
  const page=await context.newPage();
  // Use a real visible button in a normal HTML document; Chromium/WebKit
  // render raw JSON with an invisible body, so Playwright could not click
  // a dynamically added anchor in the earlier harness.
  await page.goto(ORIGIN+'/daruri/qa/stage2_shootout/verified-pdf-download.html',
                  {waitUntil:'domcontentloaded'});
  const downloadPromise=page.waitForEvent('download',{timeout:60000});
  await page.locator('#download-verified-approved').click();
  const down=await downloadPromise;
  const prepared=await page.evaluate(()=>window.__gnammaVerifiedDownload);
  if(prepared?.phase!=='done')throw Error('Browser verification failed: '+JSON.stringify(prepared));
  const destination=path.join(OUT,'daruri-approved-byte-identical.pdf');
  await down.saveAs(destination);
  const obtained=fs.readFileSync(destination);
  assert.deepEqual(obtained,official,'Downloaded PDF bytes must match signed original');
  assert.equal(prepared.sha256,expected.sha256);
  assert.equal(prepared.bytes,official.length);
  // Deliberately send a WRONG digest to the very same UI; it must fail
  // before creating an attachment or triggering ANY download event.
  const negative=await context.newPage();
  await negative.goto(ORIGIN+'/daruri/qa/stage2_shootout/verified-pdf-download.html',
                      {waitUntil:'domcontentloaded'});
  let unexpectedDownload=false;
  negative.on('download',()=>{unexpectedDownload=true});
  await negative.route('**/daruri/pdf-editions-manifest.json',route=>route.fulfill({
    status:200,contentType:'application/json',
    body:JSON.stringify({files:{'daruri.pdf':{
      sha256:'0'.repeat(64),size_bytes:official.length}}})}));
  await negative.locator('#download-verified-approved').click();
  await negative.waitForFunction(()=>['done','failed'].includes(
     window.__gnammaVerifiedDownload?.phase),null,{timeout:15000});
  const negativeResult=await negative.evaluate(()=>window.__gnammaVerifiedDownload);
  assert.equal(negativeResult.phase,'failed','Wrong signed hash must fail closed');
  assert.match(negativeResult.error,/SHA-256 mismatch/);
  await negative.waitForTimeout(400);
  assert.equal(unexpectedDownload,false,'Corrupt manifest triggered unsafe download');
  await negative.close();
  const report={browser:ENGINE,published_pdf_sha256:expected.sha256,
    downloaded_pdf_sha256:sha(obtained),
    byte_identical_to_published_original:true,pages:expected.pages,
    bytes:obtained.length,verified_before_download:true,
    generated_from_original_HTML_in_browser:false,
    no_server_side_runtime_pdf_renderer:true,
    no_personal_notes_or_data:true,
    corrupted_manifest_refused_before_download:true,
    physical_iphone_or_android_tested:false};
  fs.writeFileSync(path.join(OUT,'exact-download-report.json'),
                   JSON.stringify(report,null,2)+'\n');
  console.log('GNAMMA_APPROVED_EXACT_BROWSER_DOWNLOAD',JSON.stringify(report));
 }catch(e){console.error('GNAMMA_EXACT_BROWSER_DOWNLOAD_FAIL',e?.stack||e);process.exitCode=2}
 finally{await context?.close().catch(()=>{});await browser?.close().catch(()=>{});child?.kill()}
})();
