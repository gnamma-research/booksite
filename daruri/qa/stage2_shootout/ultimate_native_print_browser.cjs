#!/usr/bin/env node
/* Ordinary-browser NATIVE HTML/CSS Print edition research. No Paged.js, Typst,
 * Vivliostyle, prebuilt PDF or server PDF. Site uses window.print() only.
 * Playwright page.pdf() is confined to Chromium CI *quality inspection*.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {spawn,execFileSync}=require('node:child_process');
const {chromium,webkit}=require('playwright');
const HERE=__dirname,ROOT=path.resolve(HERE,'../../..');
const EDITION=process.env.NATIVE_EDITION||'scholarly';
const BROWSER=process.env.NATIVE_BROWSER||'chromium';
const OUT=process.env.NATIVE_OUT||'/tmp/gnamma-native-print';
const ORIGIN='http://127.0.0.1:8991';
if(!['scholarly','english','arabic-vowelled'].includes(EDITION))throw Error('Unknown original edition');
if(!['chromium','webkit'].includes(BROWSER))throw Error('Unknown browser');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let browser,context,server,poller,chromePssPeak=0,chromeRssPeak=0,chromeProcesses=0;
const events=[],consoleErrors=[],network=[];
const stats={schema:'gnamma-native-HTML-print-original-full-edition-v1',edition:EDITION,browser:BROWSER,
 source_input:'canonical Gnamma HTML; no PDF input',server_pdf_generated:false,
 includes_paginating_library:false,requires_special_COOP:false,publication_approved:false};
function samplePss(){
 if(BROWSER!=='chromium')return;
 try{
  const rows=execFileSync('ps',['-eo','pid=,rss=,args='],{encoding:'utf8',timeout:4000}).split('\n');
  let pss=0,rss=0,num=0;
  for(const row of rows){
   const m=row.match(/^\s*(\d+)\s+(\d+)\s+(.+)$/);
   if(!m||!/chrome-headless-shell|chrome-linux|chromium-linux|HeadlessChrome/.test(m[3])||/ps -eo/.test(m[3]))continue;
   rss+=Number(m[2]);num++;
   try{
     const text=fs.readFileSync('/proc/'+m[1]+'/smaps_rollup','utf8');
     const mm=text.match(/^Pss:\s*(\d+)\s+kB/m);
     pss+=mm?Number(mm[1]):Number(m[2]);
   }catch{pss+=Number(m[2]);}
  }
  chromePssPeak=Math.max(chromePssPeak,pss);
  chromeRssPeak=Math.max(chromeRssPeak,rss);
  chromeProcesses=Math.max(chromeProcesses,num);
 }catch{}
}
async function run(){
 fs.mkdirSync(OUT,{recursive:true});
 const src=path.join(HERE,'runtime_ultimate',EDITION+'.html');
 const metadata=JSON.parse(fs.readFileSync(path.join(HERE,'runtime_ultimate',EDITION+'.source.json'),'utf8'));
 const html=fs.readFileSync(src);
 if(metadata.input_is_pdf||!metadata.source_validation_ok||
    metadata.authorial_source_paragraphs!==414||metadata.named_authorial_destinations!==258)
   throw Error('Original source validation failed');
 stats.source_sha256=metadata.source_sha256;
 stats.html_bytes=html.length;
 stats.scholar_notes=metadata.total_original_notes;
 stats.historical_articles=metadata.historical_dictionary_articles;
 stats.requested_internal_links=metadata.all_internal_reference_links;
 server=spawn('python',['-m','http.server','8991','--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
 let up=false;
 const url=ORIGIN+'/daruri/qa/stage2_shootout/runtime_ultimate/'+EDITION+'.html';
 for(let i=0;i<110;i++){
  try{if((await fetch(url)).ok){up=true;break}}catch{}
  await sleep(280);
 }
 if(!up)throw Error('Local static browser file server unavailable');
 browser=await (BROWSER==='chromium'?chromium:webkit).launch({headless:true});
 context=await browser.newContext({viewport:{width:1200,height:870},serviceWorkers:'block'});
 const page=await context.newPage();
 page.on('pageerror',e=>consoleErrors.push('pageerror: '+String(e)));
 page.on('console',e=>{if(e.type()==='error')consoleErrors.push('console: '+e.text())});
 page.on('request',r=>network.push({url:r.url(),method:r.method()}));
 const start=performance.now();
 poller=setInterval(samplePss,250);samplePss();
 await page.goto(url,{waitUntil:'load'});
 const timeLoaded=performance.now();
 await page.emulateMedia({media:'print'});
 await page.evaluate(()=>document.fonts.ready);
 const afterFonts=performance.now();
 const pageInfo=await page.evaluate(()=>{
   const sect=[...document.querySelectorAll('.text-section')];
   const articles=[...document.querySelectorAll('.lexicon .lex-article')];
   const notes=[...document.querySelectorAll('.main-text .apparatus-note')];
   const rows=[...document.querySelectorAll('.source-segment')];
   const coords=sect.slice(0,3).map(s=>({
    section:s.getAttribute('data-section-id'),
    width:Math.round(s.getBoundingClientRect().width),
    height:Math.round(s.getBoundingClientRect().height)}));
   return {rendered_sections:sect.length,source_paragraphs:rows.length,
     original_scholarly_notes:notes.length,historical_articles:articles.length,
     historical_terms:document.querySelectorAll('.lexicon .lex-term').length,
     document_scrollHeight:document.documentElement.scrollHeight,
     visual_viewport_width:document.documentElement.clientWidth,
     sample_sections:coords,fonts_status:document.fonts.status,
     fontFaces:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),
     crossOriginIsolated,css_supports_browser_footnote:CSS.supports('float','footnote'),
     html_main_language:document.querySelector('.main-text')?.getAttribute('data-edition'),
     all_original_section_ids:[...Array(258)].every((_,i)=>document.getElementById('section-'+(i+1))),
     original_links:document.querySelectorAll('a[href^="#"]').length};
 });
 Object.assign(stats,pageInfo,{navigation_load_ms:Math.round(timeLoaded-start),
    fonts_ready_ms:Math.round(afterFonts-start)});
 if(!pageInfo.all_original_section_ids||pageInfo.source_paragraphs<414)throw Error('Original source not rendered completely');
 if(EDITION==='scholarly'&& (pageInfo.historical_articles!==157||pageInfo.original_scholarly_notes!==625))
   throw Error('Original complete 157/625 scholarly apparatus missing');
 let pdfTime=null;
 if(BROWSER==='chromium'){
  const pdfAt=performance.now();
  const binary=await page.pdf({preferCSSPageSize:true,printBackground:true,timeout:210000});
  pdfTime=Math.round(performance.now()-pdfAt);
  if(binary.subarray(0,5).toString('ascii')!=='%PDF-'||binary.length<50000)
   throw Error('Browser did not print actual PDF bytes');
  const file=path.join(OUT,'daruri-'+EDITION+'-native-print-QAONLY.pdf');
  fs.writeFileSync(file,binary);
  stats.ci_only_native_pdf_bytes=binary.length;
  stats.ci_only_pdf_path=file;
 }
 stats.chromium_native_pdf_print_ms=pdfTime;
 stats.total_browser_html_to_result_ms=Math.round(performance.now()-start);
 samplePss();
 stats.peak_chromium_pss_kib=chromePssPeak;
 stats.peak_chromium_rss_kib=chromeRssPeak;
 stats.peak_chromium_process_count=chromeProcesses;
 stats.used_special_COOP=pageInfo.crossOriginIsolated;
 stats.external_pdf_or_upload_requests=network.filter(r=>r.method!=='GET'||!r.url.startsWith(ORIGIN)||/\.pdf(?:\?|$)/i.test(r.url));
 stats.network_requests=network.length;
 stats.console_errors=consoleErrors.slice(0,12);
 if(stats.used_special_COOP||stats.external_pdf_or_upload_requests.length)throw Error('Not a plain static local print');
 fs.writeFileSync(path.join(OUT,'native-browser-report.json'),JSON.stringify(stats,null,2)+'\n');
 console.log('GNAMMA_NATIVE_BROWSER_BOOK',JSON.stringify(stats));
}
(async()=>{
 try{await run()}catch(e){stats.error=String(e?.stack||e);
 fs.mkdirSync(OUT,{recursive:true});
 fs.writeFileSync(path.join(OUT,'failure.json'),JSON.stringify(stats,null,2)+'\n');
 console.error('GNAMMA_NATIVE_BROWSER_FAILURE',stats.error);
 process.exitCode=2;
 }finally{
 clearInterval(poller);
 await context?.close().catch(()=>{});
 await browser?.close().catch(()=>{});
 server?.kill();
 }
})();