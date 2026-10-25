#!/usr/bin/env node
/* Real external-source-free browser test: HTML/CSS → Vivliostyle → PDF Blob.
 * Independent of blessed WeasyPrint PDF. Not Chrome Print/Save.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {spawn,execFileSync}=require('node:child_process');
const {chromium,webkit}=require('playwright');
const HERE=__dirname,ROOT=path.resolve(HERE,'../../..');
const source=process.env.BENCH_SOURCE||'vivliostyle-micro';
const which=process.env.BENCH_BROWSER||'chromium';
const out=process.env.BENCH_OUT||('/tmp/gnamma-vivliostyle-'+source+'-'+which);
const url='http://127.0.0.1:8991/daruri/qa/stage2_shootout/vivliostyle_pdf_browser.html?source='+encodeURIComponent(source);
const sleep=x=>new Promise(r=>setTimeout(r,x));
let child,browser,context;
const consoleMessages=[],network=[],resourceErrors=[];
let peakApproxKiB=0;
function sampleMemory(){
 try{
  const lines=execFileSync('ps',['-eo','rss,args'],{encoding:'utf8',timeout:5000}).split('\n');
  const total=lines.reduce((acc,l)=>{
   const m=l.match(/^\s*(\d+)\s+(.+)$/);
   return m&&/chrome-headless-shell|HeadlessChrome|chromium-linux|chrome-linux/.test(m[2])&&!m[2].includes('ps -eo')
     ? acc+Number(m[1]):acc
  },0);
  peakApproxKiB=Math.max(peakApproxKiB,total);
 }catch{}
}
(async()=>{
 let sampler;
 try{
  fs.mkdirSync(out,{recursive:true});
  const sourceFile=path.join(HERE,'runtime_ultimate',source+'.source.txt');
  if(!fs.existsSync(sourceFile))throw Error('Missing actual original HTML: '+sourceFile);
  child=spawn('npm',['run','dev'],{cwd:HERE,stdio:'ignore'});
  let available=false;
  for(let i=0;i<160;i++){try{if((await fetch(url)).ok){available=true;break}}catch{}await sleep(250)}
  if(!available)throw Error('Vite browser bench not ready');
  browser=await (which==='webkit'?webkit:chromium).launch({headless:true});
  context=await browser.newContext({viewport:{width:1280,height:840},acceptDownloads:true,serviceWorkers:'block'});
  const page=await context.newPage();
  page.on('console',m=>{if(m.type()==='error')consoleMessages.push(m.text().slice(0,1300))});
  page.on('pageerror',e=>consoleMessages.push(String(e).slice(0,1400)));
  page.on('request',r=>network.push({method:r.method(),url:r.url()}));
  page.on('requestfailed',r=>resourceErrors.push({url:r.url(),error:r.failure()?.errorText}));
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:180000});
  await page.locator('#generate').waitFor({timeout:180000});
  sampler=setInterval(sampleMemory,1200);
  const downloadWait=page.waitForEvent('download',{timeout:780000}).catch(()=>null);
  await page.locator('#generate').click();
  const ended=await page.waitForFunction(()=>{
    const x=window.__gnammaVivliostylePdf;
    return x?.phase==='done'||x?.phase==='failed'?x:null;
  },null,{timeout:775000});
  const state=await ended.jsonValue();
  if(state.phase==='failed')throw Error('Vivliostyle PDF emitter failed: '+JSON.stringify(state.error)+' messages='+JSON.stringify(state.messages||[]));
  const download=await downloadWait;
  if(!download)throw Error('Success state but browser did not generate any real PDF download');
  const file=path.join(out,'daruri-'+source+'-vivliostyle-pdf-NONRELEASE.pdf');
  await download.saveAs(file);
  const bytes=fs.readFileSync(file);
  assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
  assert.equal(bytes.length,state.pdf_bytes);
  assert.ok(!network.some(x=>x.method!=='GET'||(!x.url.startsWith('http://127.0.0.1:8991/')&&!x.url.startsWith('blob:'))),
    'An external server or data upload was contacted: '+JSON.stringify(network.slice(-30)));
  const report={engine:'vivliostyle-pdf@0.3.3; @vivliostyle/print CSS pagination',
    browser:which,scope:source,success:true,
    direct_pdf_blob:true,print_dialog:false,no_prebuilt_pdf:true,
    output_pdf_bytes:bytes.length,output_pdf:file,
    source_bytes:fs.statSync(sourceFile).size,
    engine_state:state,errors:consoleMessages.slice(-50),
    resources_failed:resourceErrors.slice(-40),
    approximate_aggregate_chromium_rss_kib:peakApproxKiB,
    requests:network.length,external_requests:network.filter(x=>!x.url.startsWith('http://127.0.0.1:8991/')&&!x.url.startsWith('blob:')),
    released_to_public:false};
  fs.writeFileSync(path.join(out,'vivliostyle-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log('GNAMMA_VIVLIOSTYLE_BROWSER_PDF_RESULT',JSON.stringify({
    browser:which,scope:source,bytes:bytes.length,pages_unknown_until_independent_PDF_audit:true,
    engine_state:state,console_errors:consoleMessages.slice(-8),
    resource_errors:resourceErrors.slice(-12),peak_rss_kib:peakApproxKiB
  }));
 }catch(error){
  const report={scope:source,browser:which,error:String(error?.stack||error),
   console_errors:consoleMessages.slice(-60),
   resource_errors:resourceErrors.slice(-60),
   recent_network:network.slice(-40),peak_rss_kib:peakApproxKiB};
  fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(path.join(out,'vivliostyle-failure.json'),JSON.stringify(report,null,2)+'\n');
  console.error('GNAMMA_VIVLIOSTYLE_BROWSER_PDF_FAILURE',report.error);
  process.exitCode=2;
 }finally{
  clearInterval(sampler);
  await context?.close().catch(()=>{});
  await browser?.close().catch(()=>{});
  child?.kill();
 }
})();
