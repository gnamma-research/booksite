#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium,webkit}=require('playwright');
const ENGINE=process.env.STAGE2_BROWSER||'chromium',OUT=process.env.STAGE2_OUTPUT||'/tmp/stage2-typst-browser';
if(!['chromium','webkit'].includes(ENGINE))throw Error('Not a selected native browser');
const URL='http://127.0.0.1:8991/daruri/qa/stage2_shootout/typst_browser.html';
const sleep=n=>new Promise(r=>setTimeout(r,n));
const requests=[],errors=[];
let child,browser,context;
(async()=>{
 try{
  fs.mkdirSync(OUT,{recursive:true});
  child=spawn('npm',['run','dev'],{cwd:__dirname,stdio:'ignore',env:process.env});
  let ready=false;
  for(let i=0;i<100;i++){
   try{const r=await fetch(URL);if(r.ok){ready=true;break}}catch{}
   await sleep(350);
  }
  if(!ready)throw Error('Vite WASM renderer server never started');
  browser=await (ENGINE==='webkit'?webkit:chromium).launch({headless:true});
  context=await browser.newContext({viewport:{width:1060,height:800},
   acceptDownloads:true,serviceWorkers:'block'});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',e=>{if(e.type()==='error')errors.push(e.text())});
  page.on('request',r=>requests.push({url:r.url(),method:r.method()}));
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  const isolated=await page.evaluate(()=>crossOriginIsolated);
  if(!isolated)throw Error('Browser worker requires crossOriginIsolated=true');
  const dl=page.waitForEvent('download',{timeout:240000});
  await page.locator('#run').click();
  const done=await Promise.race([
    dl,
    page.waitForFunction(()=>window.__stage2TypstBrowser?.phase==='failed',null,{timeout:235000})
     .then(async()=>{throw Error('Browser compilation failed: '+JSON.stringify(await page.evaluate(()=>window.__stage2TypstBrowser)))})
  ]);
  await page.waitForFunction(()=>window.__stage2TypstBrowser?.phase==='done',null,{timeout:15000});
  const state=await page.evaluate(()=>window.__stage2TypstBrowser);
  assert.equal(state.real_browser_generated_pdf,true);
  assert.equal(state.publication_approved,false);
  assert.equal(state.no_external_pdf_or_renderer,true);
  const output=path.join(OUT,'typst-browser-daruri-NONRELEASE.pdf');
  await done.saveAs(output);
  assert.equal(fs.readFileSync(output).subarray(0,5).toString('ascii'),'%PDF-');
  assert.equal(fs.statSync(output).size,state.bytes);
  const bad=requests.filter(r=>r.method!=='GET'||
   (r.url.startsWith('https://'))||
   (r.url.startsWith('http:')&&!r.url.startsWith('http://127.0.0.1:8991'))||
   /\.pdf(\?|$)/.test(r.url));
  assert.deepEqual(bad,[],'Forbidden pre-generated PDF/remote page/upload used');
  assert.deepEqual(errors,[],'JavaScript console errors during browser PDF generation');
  const report={engine:ENGINE,output,headless_browser_pdf_export_used:false,
    initial_cross_origin_isolated:isolated,status:state,
    external_and_prebuilt_pdf_requests:bad,bytes:state.bytes,errors,
    production_approved:false};
  fs.writeFileSync(path.join(OUT,'browser-evidence.json'),JSON.stringify(report,null,2));
  console.log('STAGE2_TYPST_BROWSER',JSON.stringify({engine:ENGINE,bytes:state.bytes,
    elapsed_ms:state.elapsed_ms,source_sha256:state.source_sha256,
    no_external_or_source_pdf_requests:true,production_approved:false}));
 }catch(e){errors.push(String(e?.stack||e));fs.mkdirSync(OUT,{recursive:true});
  fs.writeFileSync(path.join(OUT,'failure.json'),JSON.stringify({engine:ENGINE,errors,requests:requests.slice(0,100)},null,2));
  console.error('STAGE2_TYPST_BROWSER_ERROR',e);process.exitCode=2;
 }finally{await context?.close().catch(()=>{});await browser?.close().catch(()=>{});child?.kill();}
})();