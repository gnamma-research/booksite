#!/usr/bin/env node
/* Full source HTML -> browser typesetting -> optional test-only PDF.
 *
 * Production candidate: self-hosted Paged.js / Vivliostyle, no external
 * PDF renderer. Only CI uses Playwright page.pdf() to inspect the exact
 * resulting browser Print/Save view; this is NOT a one-click Blob proof.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {spawn,execFileSync}=require('node:child_process');
const {chromium,webkit}=require('playwright');
const HERE=__dirname,ROOT=path.resolve(HERE,'../../..');
const MODE=process.env.BENCH_EDITION||'scholarly';
const ENGINE=process.env.BENCH_ENGINE||'paged';
const BROWSER=process.env.BENCH_BROWSER||'chromium';
const OUT=process.env.BENCH_OUT||('/tmp/daruri-ultimate-'+ENGINE+'-'+MODE);
if(!['scholarly','english','arabic-vowelled'].includes(MODE))throw Error('Bad edition');
if(!['paged','vivliostyle'].includes(ENGINE))throw Error('Bad engine');
const prefix='/daruri/qa/stage2_shootout/';
const origin='http://127.0.0.1:8991';
const src=path.join(HERE,'runtime_ultimate',MODE+'.html');
const report={schema:'gnamma-ultimate-browser-html-pdf-v1',engine:ENGINE,mode:MODE,browser:BROWSER,
 pdf_computed_from_existing_source_pdf:false,server_pdf_renderer_used:false,
 publication_approved:false,source:'original canonical HTML from scholarly publisher'};
let child,browser,ctx,page;
const captured=[],errors=[],sizes={};
const sleep=n=>new Promise(r=>setTimeout(r,n));
let peakChromiumKiB=0,peakNodeKiB=0,peakPssKiB=0,peakProcessCount=0;
function recordResources(){
 try{
  const ps=execFileSync('ps',['-eo','pid=,rss=,args='],{encoding:'utf8',timeout:5000});
  let chromium=0,node=0,pssTotal=0,processes=0;
  for(const line of ps.split('\n')){
   const match=line.match(/^\s*(\d+)\s+(\d+)\s+(.+)$/);if(!match)continue;
   const pid=Number(match[1]),rss=Number(match[2]),name=match[3];
   if(/chrome-headless-shell|HeadlessChrome|chromium-linux|chrome-linux/.test(name) &&
      !/ps -eo/.test(name)){
      chromium+=rss;processes++;
      // Linux PSS allocates shared mapped pages proportionally to each process,
      // unlike summing RSS which double-counts Chromium's shared libraries.
      try{
       const mem=fs.readFileSync('/proc/'+pid+'/smaps_rollup','utf8');
       const result=mem.match(/^Pss:\s*(\d+)\s*kB/m);
       pssTotal+=result?Number(result[1]):rss;
      }catch{pssTotal+=rss}
   }
   if(/node .*ultimate_browser\.cjs/.test(name))node+=rss;
  }
  peakChromiumKiB=Math.max(peakChromiumKiB,chromium);
  peakNodeKiB=Math.max(peakNodeKiB,node);
  peakPssKiB=Math.max(peakPssKiB,pssTotal);
  peakProcessCount=Math.max(peakProcessCount,processes);
 }catch{}
}
async function go(){
 fs.mkdirSync(OUT,{recursive:true});
 if(!fs.existsSync(src))throw Error('No authoritative HTML source to paginate');
 const source=fs.readFileSync(src,'utf8');
 report.html_bytes=Buffer.byteLength(source);
 if(!source.includes('section-258')||!source.includes('source-segment')||
    (MODE==='scholarly' && !source.includes('lexicon-introduction')))
   throw Error('Full original HTML missing scholarly text or lexicon');
 const srcmeta=JSON.parse(fs.readFileSync(path.join(HERE,'runtime_ultimate',MODE+'.source.json'),'utf8'));
 if(!srcmeta.source_validation_ok||srcmeta.authorial_source_paragraphs!==414||
    srcmeta.named_authorial_destinations!==258)
   throw Error('Source is not the validated original publication');
 Object.assign(report,{original_source_sha256:srcmeta.source_sha256,
  reference_terms:srcmeta.historical_dictionary_terms,
  reference_articles:srcmeta.historical_dictionary_articles,
  source_link_count:srcmeta.all_internal_reference_links,
  source_html_sha256:srcmeta.html_sha256,
  full_reference_apparatus_html_bytes:srcmeta.reference_apparatus_html_bytes});
 let route=prefix+'runtime_ultimate/'+MODE+'.html';
 if(ENGINE==='paged'){
  const injected='<script>'+
   'window.__gnammaUltimate={status:"started",start:performance.now()};'+
   'window.PagedConfig={auto:true,after:(flow)=>{window.__gnammaUltimate={'+
   'status:"done",page_count:flow.total,layout_ms:Math.round(performance.now()-window.__gnammaUltimate.start)}}};'+
   'window.addEventListener("error",(e)=>{window.__gnammaUltimate.error=String(e.message)})'+
   '</script><script defer src="'+prefix+'node_modules/pagedjs/dist/paged.polyfill.js"></script>';
  fs.writeFileSync(path.join(HERE,'runtime_ultimate',MODE+'-paged.html'),
   source.replace('</head>',injected+'</head>'));
  route=prefix+'runtime_ultimate/'+MODE+'-paged.html';
 }
 const started=Date.now();
 child=ENGINE==='paged'?
   spawn('npm',['run','dev'],{cwd:HERE,stdio:'ignore'}):
   spawn('python',['-m','http.server','8991','--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
 let ok=false;
 for(let i=0;i<130;i++){try{const r=await fetch(origin+route);if(r.ok){ok=true;break}}catch{}await sleep(220)}
 if(!ok)throw Error('Static asset server failed to deliver original source');
 browser=await (BROWSER==='webkit'?webkit:chromium).launch({headless:true});
 ctx=await browser.newContext({viewport:{width:1320,height:880},
  serviceWorkers:'block',deviceScaleFactor:1});
 page=await ctx.newPage();
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('request',r=>captured.push({url:r.url(),method:r.method()}));
 page.on('response',async r=>{
   const u=new URL(r.url());
   if(u.origin===origin){
    const headers=r.headers();
    sizes[u.pathname]={status:r.status(),content_length:Number(headers['content-length']||0),
      content_encoding:headers['content-encoding']||'identity',
      content_type:headers['content-type']||'unknown'};
   }
 });
 const ticker=setInterval(recordResources,450);recordResources();
 try{
  const t=performance.now();
  if(ENGINE==='paged'){
   await page.goto(origin+route,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.__gnammaUltimate?.status==='done'||
          window.__gnammaUltimate?.error,null,{timeout:330000});
   const m=await page.evaluate(()=>{
    const pages=[...document.querySelectorAll('.pagedjs_page')];
    const notes=pages.flatMap((p,i)=>[...p.querySelectorAll('.pagedjs_footnote_area .footnote')]
      .map(f=>({page:i+1,id:f.dataset.noteId||''})));
    const call=pages.flatMap((p,i)=>[...p.querySelectorAll('.pagedjs_page_content sup.footnote-call,.pagedjs_page_content sup.quran-marker')]
      .map(a=>({page:i+1,id:a.dataset.noteId||''})));
    const nPages=new Map();
    for(const note of notes){if(!nPages.has(note.id))nPages.set(note.id,[]);
      nPages.get(note.id).push(note.page)}
    const wrong=call.filter(c=>nPages.has(c.id)&&!nPages.get(c.id).includes(c.page));
    const missing=call.filter(c=>!nPages.has(c.id));
    return {status:window.__gnammaUltimate,
     physical_pages:pages.length,
     rendered_source_segments:document.querySelectorAll('.pagedjs_page .source-segment').length,
     rendered_dictionary_articles:document.querySelectorAll('.pagedjs_page .lex-article').length,
     rendered_dictionary_terms:document.querySelectorAll('.pagedjs_page .lex-term').length,
     physical_page_footnotes:notes.length,
     note_call_elements:call.length,cross_page_note_calls:wrong.length,
     note_calls_with_no_printed_body:missing.length,
     wrong_note_sample:wrong.slice(0,10),
     page_js_heap_bytes:performance.memory?.usedJSHeapSize??null,
     device_memory_gb:navigator.deviceMemory??null,
     resource_transfer_report:performance.getEntriesByType('resource').map(x=>({
       name:x.name.replace(location.origin,''),
       encoded:x.encodedBodySize,transfer:x.transferSize,decoded:x.decodedBodySize}))
    };
   });
   Object.assign(report,m);
   if(m.status.error||m.physical_pages<10)throw Error('Full original browser HTML pagination failed');
   if(m.rendered_source_segments<414)throw Error('Rendered source incomplete: '+m.rendered_source_segments);
   if(MODE==='scholarly'&&m.rendered_dictionary_articles<155)
     throw Error('Scholarly dictionary articles missing from HTML pagination');
   if(BROWSER==='chromium'){
    const pdf=await page.pdf({preferCSSPageSize:true,printBackground:true,
     tagged:true,outline:true,timeout:150000});
    if(pdf.length<50000||pdf.subarray(0,5).toString('ascii')!=='%PDF-')
     throw Error('No real browser print PDF');
    const filename=path.join(OUT,'daruri-'+MODE+'-paged-PRINT-QAONLY.pdf');
    fs.writeFileSync(filename,pdf);
    report.output_pdf_bytes=pdf.length;
    report.output_pdf=filename;
    report.output_was_ci_only_browser_print=true;
   }
  }else{
   const lib=path.join(HERE,'runtime_ultimate','viewer');
   if(!fs.existsSync(lib))throw Error('Unbundled self-hosted Vivliostyle Viewer');
   const url=origin+prefix+'runtime_ultimate/viewer/index.html#src='+
       origin+route+'&bookMode=false&renderAllPages=true&spread=false';
   await page.goto(url,{waitUntil:'domcontentloaded'});
   const result=await page.waitForFunction(()=>{
     const docs=[document,...Array.from(document.querySelectorAll('iframe')).map(f=>f.contentDocument).filter(Boolean)];
     const n=docs.reduce((a,d)=>a+d.querySelectorAll('.source-segment').length,0);
     const d=docs.reduce((a,d)=>a+d.querySelectorAll('.lex-article').length,0);
     return n>50?{loaded_segments:n,loaded_dictionary_articles:d}:false;
   },null,{timeout:245000});
   Object.assign(report,await result.jsonValue());
   report.view_is_real_source=Boolean(report.loaded_segments>50);
  }
  report.browser_page_load_to_output_ms=Math.round(performance.now()-t);
 }finally{clearInterval(ticker);recordResources()}
 report.estimated_peak_headless_chromium_rss_kib=peakChromiumKiB;
 report.estimated_peak_chromium_proportional_pss_kib=peakPssKiB;
 report.peak_chromium_processes_observed=peakProcessCount;
 report.memory_method='Linux /proc/PID/smaps_rollup Pss proportional memory; desktop browser only';
 report.estimated_peak_benchmark_node_rss_kib=peakNodeKiB;
 report.all_local_response_headers=sizes;
 report.actual_network_requests=captured.length;
 report.external_or_mutating_network_requests=captured.filter(r=>r.method!=='GET'||!r.url.startsWith(origin));
 report.page_errors=errors;
 report.total_runner_elapsed_ms=Date.now()-started;
 if(report.external_or_mutating_network_requests.length)throw Error('External/upload request detected');
 fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log('GNAMMA_ULTIMATE_BROWSER_BENCH',JSON.stringify(report).slice(0,13500));
}
(async()=>{try{await go()}catch(e){
 report.failure=String(e?.stack||e);fs.mkdirSync(OUT,{recursive:true});
 fs.writeFileSync(path.join(OUT,'failure.json'),JSON.stringify(report,null,2)+'\n');
 console.error('GNAMMA_ULTIMATE_BROWSER_FAILURE',report.failure);process.exitCode=2;
}finally{await ctx?.close().catch(()=>{});await browser?.close().catch(()=>{});child?.kill()}})();
