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
  await page.goto(ORIGIN+'/daruri/pdf-editions-manifest.json',
                  {waitUntil:'domcontentloaded'});
  const prepared=await page.evaluate(async()=>{
   const m=await (await fetch('/daruri/pdf-editions-manifest.json')).json();
   const expected=m.files['daruri.pdf'].sha256;
   const response=await fetch('/daruri/daruri.pdf',{credentials:'same-origin'});
   if(!response.ok)throw Error('Failed to fetch canonical PDF '+response.status);
   const data=await response.arrayBuffer();
   const hex=[...new Uint8Array(await crypto.subtle.digest('SHA-256',data))]
      .map(x=>x.toString(16).padStart(2,'0')).join('');
   if(hex!==expected)throw Error('Fail closed: approved PDF digest mismatch');
   const a=document.createElement('a');
   a.download='daruri-approved-byte-identical.pdf';
   a.id='download-verified-approved';
   a.href=URL.createObjectURL(new Blob([data],{type:'application/pdf'}));
   document.body.append(a);
   return {sha256:hex,bytes:data.byteLength,source:'same-origin static signed PDF',
     pdf_generated_in_browser:false,published_sha256:expected};
  });
  const got=page.waitForEvent('download',{timeout:60000});
  await page.locator('#download-verified-approved').click();
  const down=await got;
  const destination=path.join(OUT,'daruri-approved-byte-identical.pdf');
  await down.saveAs(destination);
  const obtained=fs.readFileSync(destination);
  assert.deepEqual(obtained,official,'Downloaded browser PDF bytes must match signed original');
  assert.equal(prepared.sha256,expected.sha256);
  assert.equal(prepared.bytes,official.length);
  const report={browser:ENGINE,published_pdf_sha256:expected.sha256,
    downloaded_pdf_sha256:sha(obtained),
    byte_identical_to_published_original:true,pages:expected.pages,
    bytes:obtained.length,verified_before_download:true,
    generated_from_original_HTML_in_browser:false,
    no_server_side_runtime_pdf_renderer:true,
    no_personal_notes_or_data:true,
    physical_iphone_or_android_tested:false};
  fs.writeFileSync(path.join(OUT,'exact-download-report.json'),
                   JSON.stringify(report,null,2)+'\n');
  console.log('GNAMMA_APPROVED_EXACT_BROWSER_DOWNLOAD',JSON.stringify(report));
 }catch(e){console.error('GNAMMA_EXACT_BROWSER_DOWNLOAD_FAIL',e?.stack||e);process.exitCode=2}
 finally{await context?.close().catch(()=>{});await browser?.close().catch(()=>{});child?.kill()}
})();
