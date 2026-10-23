#!/usr/bin/env node
'use strict';
/* Two genuinely distinct questions must not be conflated:
 *
 * A. Can the BROWSER PRINT ENGINE typeset Daruri HTML? Chromium Page.printToPDF
 *    is invoked by trusted Playwright test automation, not by website JS.
 * B. Can an ordinary WEBSITE request PDF bytes without a print dialog?
 *    window.print() has no return value; Playwright's page.pdf() is not a web API.
 *
 * Only the resulting PDF's pages/Unicode/notes are judged by independent
 * readers. Fonts are embedded in HTML as DATA URLs, no pretypeset PDF input.
 */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),{pathToFileURL}=require('node:url');
const ROOT=path.resolve(__dirname,'../..');
const {chromium,webkit}=require(path.join(ROOT,'daruri/qa/node_modules/playwright'));
const index=Number(process.env.GN_BROWSER_HTML_INDEX||0);
const which=process.env.GN_BROWSER_ENGINE||'chromium';
const OUT=path.resolve(process.env.GN_BROWSER_HTML_OUT||'/tmp/daruri-html-browser-print');
if(![0,10].includes(index)||!['chromium','webkit'].includes(which))throw Error('Only approved bilingual A4 Reading/Study and two real browser engines');
fs.mkdirSync(OUT,{recursive:true});
function py(...args){
 const r=cp.spawnSync('python',args,{cwd:ROOT,stdio:'inherit'});
 if(r.status!==0)throw Error('Canonical A4 HTML export or QA failed: '+args[0]);
}
let browser;
const report={
 release_approved:false,
 source_from_canonical_HTML:true,
 prebuilt_PDF_used_for_print_input:false,
 browser_renderer:which,
 source_index:index,
 privileged_browser_print_API_not_available_to_ordinary_website_JS:true,
 browser_print_dialog_retains_user_control:true
};
(async()=>{
 try{
   const sourceOut=path.join(OUT,'canonical');
   py('daruri/dynamic-pdf/html_first_all12.py','--index',String(index),'--out',sourceOut,'--strict');
   const files=fs.readdirSync(sourceOut);
   const raw=files.find(x=>x.endsWith('.pdf.html'));
   if(!raw)throw Error('Canonical renderer did not emit source HTML for this edition');
   const rawHtml=path.join(sourceOut,raw);
   const browserHtml=path.join(OUT,'browser-A4-complete.html');
   py('daruri/dynamic-pdf/browser_html_fixture.py','--source',rawHtml,'--output',browserHtml);
   const lib=which==='chromium'?chromium:webkit;
   browser=await lib.launch({headless:true});
   const page=await browser.newPage({viewport:{width:1170,height:900},deviceScaleFactor:1});
   const sourceUrl=pathToFileURL(browserHtml).href;
   const tLoad=performance.now();
   await page.goto(sourceUrl,{waitUntil:'load',timeout:90000});
   await page.evaluate(()=>document.fonts.ready);
   report.html_load_ms=Math.round(performance.now()-tLoad);
   report.css_features=await page.evaluate(()=>({
      print_window_function:typeof window.print==='function',
      native_float_footnote:CSS.supports('float','footnote'),
      page_size_rule_detected:[...document.styleSheets].some(s=>{
        try{return [...s.cssRules].some(x=>x.cssText?.includes('@page'))}catch{return false}
      }),
      paragraph_nodes:document.querySelectorAll('p').length,
      physical_footnote_nodes:document.querySelectorAll('.footnote').length,
      font_faces_loaded:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),
      original_section_destinations:[...Array(258)].filter((_,i)=>document.getElementById('section-'+(i+1))).length,
      has_original_arabic_phrase:document.body.textContent.includes('وَفِي أَلْفَاظِهِ')
   }));
   const status=report.css_features;
   if(status.original_section_destinations!==258)throw Error('Browser cannot see 258 original Daruri HTML source anchors');
   if(!status.print_window_function)throw Error('Web browser lacks print support');
   if(which==='chromium'){
      const start=performance.now();
      // Privileged Chrome print backend. Ordinary browser page JavaScript
      // cannot call this, even though the engine itself runs locally.
      const bytes=await page.pdf({preferCSSPageSize:true,
         printBackground:true,tagged:true,outline:true,scale:1,
         displayHeaderFooter:false,timeout:180000});
      report.print_pdf_ms=Math.round(performance.now()-start);
      report.byte_length=bytes.length;
      report.pdf_magic=bytes.subarray(0,5).toString('latin1');
      if(report.pdf_magic!=='%PDF-')throw Error('Chromium produced no valid PDF bytes');
      report.pdf_file=path.join(OUT,'chromium-browser-generated-NONRELEASE.pdf');
      fs.writeFileSync(report.pdf_file,bytes);
      report.ordinary_page_JS_could_receive_the_same_pdf_bytes_via_standard_print_API=false;
   }else {
      // WebKit page.pdf() is not supported by Playwright. Its true browser
      // print dialog must be driven by the user; do not claim bytes generated.
      try{
       await page.pdf();
       report.webkit_page_pdf_unexpectedly_available=true;
      }catch(e){
       report.webkit_page_pdf_unexpectedly_available=false;
       report.webkit_print_limitation=String(e.message||e).slice(0,240);
      }
   }
   report.success=true;
 }catch(e){report.success=false;report.error=String(e.stack||e);process.exitCode=2;}
 finally{
   fs.writeFileSync(path.join(OUT,'browser-print-research.json'),JSON.stringify(report,null,2)+'\n');
   console.log('DARURI_BROWSER_HTML_PRINT_PROOF',JSON.stringify(report));
   await browser?.close().catch(()=>{});
 }
})().catch(e=>{console.error(e);process.exitCode=2});
