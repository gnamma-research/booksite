#!/usr/bin/env node
/* Real client WebAssembly source-to-PDF: independent no-server PDF benchmark. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {spawn,execFileSync}=require('node:child_process');
const {chromium,webkit}=require('playwright');
const HERE=__dirname,ROOT=path.resolve(HERE,'../../..');
const ENGINE=process.env.BENCH_BROWSER||'chromium';
const OUTPUT=process.env.BENCH_OUT||'/tmp/gnamma-ultimate-browser-typst';
const ORIGIN='http://127.0.0.1:8991';
const URL=ORIGIN+'/daruri/qa/stage2_shootout/ultimate_typst_browser.html';
const sleep=t=>new Promise(r=>setTimeout(r,t));
const requests=[],responses={},errors=[];
let server,browser,context,timer,peakChromeKiB=0;
function memorySample(){
 try{const ps=execFileSync('ps',['-eo','rss,args'],{encoding:'utf8',timeout:5000});
  let found=0;
  for(const line of ps.split('\n')){
   const m=line.match(/^\s*(\d+)\s+(.+)$/);
   if(m && /chrome-headless-shell|HeadlessChrome|chromium-linux|chrome-linux/.test(m[2]) &&
      !/ps -eo/.test(m[2]))found+=Number(m[1]);
  }
  peakChromeKiB=Math.max(peakChromeKiB,found);
 }catch{}
}
(async()=>{
 try{
  fs.mkdirSync(OUTPUT,{recursive:true});
  server=spawn('npm',['run','dev'],{cwd:HERE,stdio:'ignore'});
  let ready=false;
  for(let i=0;i<100;i++){try{if((await fetch(URL)).ok){ready=true;break}}catch{}
   await sleep(300)}
  if(!ready)throw Error('Static compiler assets unavailable');
  browser=await (ENGINE==='webkit'?webkit:chromium).launch({headless:true});
  context=await browser.newContext({viewport:{width:1150,height:850},
    serviceWorkers:'block',acceptDownloads:true});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',e=>{if(e.type()==='error')errors.push(e.text())});
  page.on('request',r=>requests.push({url:r.url(),method:r.method()}));
  page.on('response',r=>{
   const h=r.headers();
   responses[r.url().replace(ORIGIN,'')]={
    status:r.status(),content_length:Number(h['content-length']||0),
    content_encoding:h['content-encoding']||'identity'};
  });
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  const isolated=await page.evaluate(()=>crossOriginIsolated);
  if(!isolated)throw Error('WASM web-worker COOP/COEP tests missing crossOriginIsolated');
  timer=setInterval(memorySample,500);
  memorySample();
  const waitPdf=page.waitForEvent('download',{timeout:460000});
  const waitFail=page.waitForFunction(()=>window.__gnammaUltimateTypst?.phase==='failed',
        null,{timeout:455000}).then(async()=>{throw Error(
       'Native WASM cannot compile complete Scholarly: '+JSON.stringify(
          await page.evaluate(()=>window.__gnammaUltimateTypst)))});
  await page.locator('#generate').click();
  const download=await Promise.race([waitPdf,waitFail]);
  await page.waitForFunction(()=>window.__gnammaUltimateTypst?.phase==='done',null,{timeout:20000});
  const result=await page.evaluate(()=>window.__gnammaUltimateTypst);
  assert.equal(result.prebuilt_pdf_input,false);
  assert.equal(result.used_print_dialog,false);
  assert.equal(result.source_details.historical_articles,157);
  assert.equal(result.source_details.original_notes,625);
  const p=path.join(OUTPUT,'daruri-scholarly-625-notes-browser-typst-NONRELEASE.pdf');
  await download.saveAs(p);
  assert.equal(fs.readFileSync(p).subarray(0,5).toString(),'%PDF-');
  assert.equal(fs.statSync(p).size,result.bytes);
  const forbidden=requests.filter(r=>r.method!=='GET'||!r.url.startsWith(ORIGIN)||/\.pdf(\?|$)/i.test(r.url));
  assert.deepEqual(forbidden,[],'No source PDF, remote renderer or nonlocal request allowed');
  const report={
   engine:'Typst WASM 1.0 browser from canonical full HTML',
   browser:ENGINE,
   success:true,source_edition:'scholarly',source_notes:625,
   complete_lexicon_articles:157,complete_glossary_terms:153,
   source_metadata:result.source_details,
   conversion_ms:result.conversion_ms,compilation_ms:result.compilation_ms,
   total_ms:result.total_from_html_ms,
   original_html_bytes:result.source_details.original_html_bytes,
   output_pdf_bytes:result.bytes,
   output_pdf:p,
   resource_responses:responses,
   approximate_peak_aggregate_chrome_rss_kib:peakChromeKiB,
   browser_heap_bytes:result.browser_heap_bytes,
   errors,forbidden_requests:forbidden,
   real_client_pdf_blob:true,
   production_approved:false
  };
  fs.writeFileSync(path.join(OUTPUT,'browser-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log('GNAMMA_ULTIMATE_TYPST_BROWSER_RESULT',JSON.stringify({
   browser:ENGINE,pdf_bytes:result.bytes,typst_chars:result.final_typst_chars,
   ms_conversion:report.conversion_ms,ms_compile:report.compilation_ms,
   total_ms:report.total_ms,source_details:report.source_metadata,
   aggregate_rss_kib:peakChromeKiB,requests:requests.length,
   no_external_requests:true,production_approved:false
  }));
 }catch(e){
  fs.mkdirSync(OUTPUT,{recursive:true});
  const info={browser:ENGINE,error:String(e?.stack||e),console_errors:errors,
   resources:responses,requests:requests.slice(-40),peak_rss_kib:peakChromeKiB};
  fs.writeFileSync(path.join(OUTPUT,'failure.json'),JSON.stringify(info,null,2));
  console.error('GNAMMA_ULTIMATE_TYPST_BROWSER_FAILURE',info.error);
  process.exitCode=2;
 }finally{clearInterval(timer);await context?.close().catch(()=>{});
  await browser?.close().catch(()=>{});server?.kill()}
})();
