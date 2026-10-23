#!/usr/bin/env node
'use strict';
/* End-to-end actual browser generated 414 original Arabic source paragraphs, NONRELEASE.
 * Neither Chromium/WebKit print-to-PDF nor any pre-rendered PDF page is used.
 */
const {spawn}=require('node:child_process');
const {chromium,webkit}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ENGINE=process.env.GNAMMA_FULL_BROWSER||'chromium';
const OUT=process.env.GNAMMA_FULL_OUTPUT||('/tmp/gnamma-full-arabic-'+ENGINE);
if(!['chromium','webkit'].includes(ENGINE))throw Error('Invalid browser engine');
const URL='http://127.0.0.1:8977/daruri/browser-html-pdf/vector-full-arabic.html';
const sleep=n=>new Promise(resolve=>setTimeout(resolve,n));
const requests=[],errors=[];
let server,browser,context;
(async()=>{
 try{
  fs.mkdirSync(OUT,{recursive:true});
  server=spawn('npm',['run','dev'],{cwd:__dirname,stdio:'ignore'});
  let started=false;
  for(let i=0;i<80;i++){
   try{const r=await fetch(URL);if(r.ok){started=true;break}}catch{}
   await sleep(500);
  }
  if(!started)throw Error('Same-origin HTML/Vite source fixture not served');
  browser=await (ENGINE==='webkit'?webkit:chromium).launch({headless:true});
  context=await browser.newContext({viewport:{width:1000,height:740},
   acceptDownloads:true,serviceWorkers:'block'});
  const page=await context.newPage();
  page.on('request',r=>requests.push({url:r.url(),method:r.method()}));
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  const dl=page.waitForEvent('download',{timeout:240000});
  await page.locator('#make').click();
  const download=await Promise.race([
   dl,
   page.waitForFunction(()=>window.__gnammaVectorStatus?.phase==='failed',null,
     {timeout:230000}).then(async()=>{throw Error('Full-original-Arabic stage failed: '+
       JSON.stringify(await page.evaluate(()=>window.__gnammaVectorStatus)))})
  ]);
  const status=await page.evaluate(()=>window.__gnammaVectorStatus);
  assert.equal(status.phase,'done',JSON.stringify(status));
  assert.equal(status.source_paragraphs,414);
  assert.equal(status.source_line_count>=414,true);
  assert.equal(status.pages,Math.ceil(status.source_line_count/12));
  assert.equal(status.one_exact_unicode_cid_per_line,true);
  assert.equal(status.vector_math_brackets_drawn,24,'Twenty-four authentic mathematical brackets must be painted');
  assert.equal(status.vector_math_left,12);
  assert.equal(status.vector_math_right,12);
  assert.equal(status.full_authorial_arabic_word_content_represented,true);
  assert.equal(status.original_published_pdf_inputs,0);
  assert.equal(status.publication_approved,false);
  assert.equal(status.full_authorial_english_translations_represented,false);
  const output=path.join(OUT,'daruri-vector-full-original-arabic-NONRELEASE.pdf');
  await download.saveAs(output);
  const data=fs.readFileSync(output);
  assert.equal(data.subarray(0,5).toString('ascii'),'%PDF-');
  assert.equal(data.length,status.bytes);
  const bad=requests.filter(r=>r.method!=='GET'||!r.url.startsWith('http://127.0.0.1:8977/')||
   /\.pdf(\?|$)/.test(r.url));
  assert.deepEqual(bad,[], 'Offsite upload or existing PDF page used');
  assert.deepEqual(errors,[], 'Browser script console errors');
  fs.writeFileSync(path.join(OUT,'browser-evidence.json'),JSON.stringify({
   engine:ENGINE,...status,external_requests:bad,
   no_CDP_print_no_OS_print:true,complete_original_arabic_paragraphs:true,
   published_edition_certified:false
  },null,2));
  console.log('GNAMMA_FULL_ARABIC_VECTOR_BROWSER',JSON.stringify({
   browser:ENGINE,pages:status.pages,complete_source_paragraphs:414,bytes:data.length,
   from_real_dom:true,pdf_vector:true,source_sha256:status.source_sha256,
   font_sha256:status.font_sha256,publication_approved:false
  }));
 }catch(error){
  fs.mkdirSync(OUT,{recursive:true});
  fs.writeFileSync(path.join(OUT,'failure.json'),JSON.stringify({
   error:String(error?.stack||error),engine:ENGINE,requests,errors},null,2));
  console.error('GNAMMA_FULL_ARABIC_VECTOR_FAILURE',error);
  process.exitCode=2;
 }finally{
  await context?.close().catch(()=>{});
  await browser?.close().catch(()=>{});
  server?.kill();
 }
})();