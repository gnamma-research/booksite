#!/usr/bin/env node
/* Actual browser HTML pagination for original Daruri Study main text.
 * page.pdf() is ONLY a CI-inspection analogue of a user's Print/Save action;
 * production must use browser UI, never server-rendered PDFs.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {spawn}=require('node:child_process');
const {chromium,webkit}=require('playwright');
const HERE=__dirname,OUTPUT=process.env.STAGE2_OUTPUT||'/tmp/study-html-browser';
const ENGINE=process.env.STAGE2_HTML_ENGINE||'paged';
const SCOPE=process.env.STAGE2_HTML_SCOPE||'stress';
const WHICH=process.env.STAGE2_BROWSER||'chromium';
const BASE='http://127.0.0.1:8991';
const RUNTIME=path.join(HERE,'runtime_study');
const errors=[],requests=[];
const report={engine:ENGINE,browser:WHICH,scope:SCOPE,production_approved:false,
 ci_only_pdf_writer:'headless-Chromium-print-for-native-QA-not-production',
 browser_local_pagination:true};
const sleep=t=>new Promise(r=>setTimeout(r,t));
let server,browser,context;
async function run(){
 fs.mkdirSync(OUTPUT,{recursive:true});
 const doc=path.join(RUNTIME,'study_'+SCOPE+'.html');
 const original=fs.readFileSync(doc,'utf8');
 if(!original.includes('edition-study')||!original.includes('footnote english'))
   throw Error('Source is not the actual canonical Study HTML');
 report.input_html_bytes=Buffer.byteLength(original);
 report.original_note_bodies=(original.match(/class="footnote (?:english|arabic)"/g)||[]).length;
 let route='/daruri/qa/stage2_shootout/runtime_study/study_'+SCOPE+'.html';
 if(ENGINE==='paged'){
   const script='<script>window.__daruriPaged={state:"loading",start:performance.now()};'+
    'window.PagedConfig={auto:true,after:function(flow){window.__daruriPaged={state:"done",'+
    'pages:flow.total,ms:Math.round(performance.now()-window.__daruriPaged.start)}}};'+
    'window.addEventListener("error",function(e){window.__daruriPaged.error=String(e.message)})</script>'+
    '<script defer src="/daruri/qa/stage2_shootout/node_modules/pagedjs/dist/paged.polyfill.js"></script>';
   const name='study_'+SCOPE+'_paged.html';
   fs.writeFileSync(path.join(RUNTIME,name),original.replace('</head>',script+'</head>'),'utf8');
   route='/daruri/qa/stage2_shootout/runtime_study/'+name;
 }
 server=ENGINE==='vivliostyle'?
   spawn('python',['-m','http.server','8991','--bind','127.0.0.1'],{
    cwd:path.resolve(HERE,'../../..'),stdio:'ignore'}):
   spawn('npm',['run','dev'],{cwd:HERE,stdio:'ignore'});
 let ready=false;
 for(let n=0;n<130;n++){
  try{if((await fetch(BASE+route)).ok){ready=true;break}}catch{}
  await sleep(300);
 }
 if(!ready)throw Error('Local static browser asset delivery failed');
 browser=await (WHICH==='webkit'?webkit:chromium).launch({headless:true});
 context=await browser.newContext({viewport:{width:1280,height:840},serviceWorkers:'block'});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('request',r=>requests.push({url:r.url(),method:r.method()}));
 const start=performance.now();
 if(ENGINE==='paged'){
  await page.goto(BASE+route,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__daruriPaged?.state==='done'||window.__daruriPaged?.error,
    null,{timeout:230000});
  const m=await page.evaluate(()=>{
   const pages=[...document.querySelectorAll('.pagedjs_page')];
   const notes=pages.flatMap((page,i)=>{
    const box=page.getBoundingClientRect();
    return [...page.querySelectorAll('.footnote')].map(foot=>{
      const b=foot.getBoundingClientRect();
      return {page:i+1,relY:(b.top-box.top)/box.height,
       relEnd:(b.bottom-box.top)/box.height,height:b.height}
    });
   });
   return {state:window.__daruriPaged,page_count:pages.length,
    footnote_body_elements:notes.length,
    notes_in_bottom_third:notes.filter(n=>n.relY>=.67&&n.relEnd<=1.02).length,
    first_notes:notes.slice(0,8),
    original_source_segments:document.querySelectorAll('.pagedjs_page .source-segment').length,
    javascript_heap_bytes:performance.memory?.usedJSHeapSize??null};
  });
  Object.assign(report,m);
  if(m.state.error||m.page_count<1||m.footnote_body_elements<1)
    throw Error('Paged.js paginated HTML lost note content or failed: '+JSON.stringify(m.state));
  await page.screenshot({path:path.join(OUTPUT,'paged-browser.png'),animations:'disabled'});
  if(WHICH==='chromium'){
   const pdf=await page.pdf({preferCSSPageSize:true,printBackground:true,timeout:60000});
   fs.writeFileSync(path.join(OUTPUT,'paged-study-'+SCOPE+'-QAONLY.pdf'),pdf);
   report.ci_print_pdf_bytes=pdf.length;
  }
 }else if(ENGINE==='vivliostyle'){
  const sub='runtime_study/viewer/';
  const files=['vivliostyle-viewer.html','index.html'];
  const name=files.find(f=>fs.existsSync(path.join(HERE,sub,f)));
  if(!name)throw Error('Self-hosted official Vivliostyle Viewer HTML unavailable');
  const target=BASE+route;
  const url=BASE+'/daruri/qa/stage2_shootout/'+sub+name+
    '#src='+encodeURIComponent(target)+'&bookMode=false&renderAllPages=true&spread=false';
  await page.goto(url,{waitUntil:'domcontentloaded'});
  let m;
  for(let n=0;n<130;n++){
    m=await page.evaluate(()=>{
      const docs=[document,...[...document.querySelectorAll('iframe')].flatMap(f=>{
       try{return f.contentDocument?[f.contentDocument]:[]}catch{return[]}
      })];
      return {frame_count:docs.length,
       source_fragments:docs.reduce((a,d)=>a+d.querySelectorAll('.source-segment').length,0),
       body_notes:docs.reduce((a,d)=>a+d.querySelectorAll('.footnote').length,0),
       page_fragments:docs.reduce((a,d)=>a+d.querySelectorAll('.vivliostyle-page-container,.vivliostyle-page').length,0),
       preview:docs.map(d=>(d.body?.innerText||'').slice(0,175)).slice(0,3)
      };
    });
    if(m.source_fragments>5){Object.assign(report,m);break}
    if(n===129){Object.assign(report,m);throw Error('Vivliostyle did not render the original Study document in an accessible viewer')}
    await sleep(750);
  }
  await page.screenshot({path:path.join(OUTPUT,'vivliostyle-browser.png'),animations:'disabled'});
 }else throw Error('Unsupported engine '+ENGINE);
 report.elapsed_ms=Math.round(performance.now()-start);
 report.network_requests=requests.length;
 report.external_requests=requests.filter(r=>r.method!=='GET'||!r.url.startsWith(BASE)).slice(0,15);
 report.errors=errors.slice(0,15);
 if(report.external_requests.length)throw Error('External PDF/upload/CDN request detected');
 fs.writeFileSync(path.join(OUTPUT,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log('DARURI_HTML_BROWSER_RESULT',JSON.stringify(report));
}
(async()=>{try{await run()}catch(e){
 report.error=String(e?.stack||e);fs.mkdirSync(OUTPUT,{recursive:true});
 fs.writeFileSync(path.join(OUTPUT,'failure.json'),JSON.stringify({...report,errors},null,2));
 console.error('DARURI_HTML_BROWSER_FAILURE',report.error);process.exitCode=2;
}finally{await context?.close().catch(()=>{});await browser?.close().catch(()=>{});server?.kill()}})();
