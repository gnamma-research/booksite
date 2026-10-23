/* Isolated normal-browser Typst WASM PDF proof. Absolutely no prebuilt PDF. */
import {createTypstCompiler} from 'typst-wasm';
import {createWebWorker} from 'typst-wasm/worker/browser';
import workerUrl from 'typst-wasm/worker/web-worker?worker&url';
import coreUrl from 'typst-wasm/engine/engine.core.wasm?url';
import core2Url from 'typst-wasm/engine/engine.core2.wasm?url';
import core3Url from 'typst-wasm/engine/engine.core3.wasm?url';
import mathUrl from '@typst-wasm/fonts/NewCMMath-Regular.otf?url';

const button=document.getElementById('run'),status=document.getElementById('status');
const esc=s=>String(s??'').replace(/([\\#*_@$[\]<>])/g,'\\$1');
const set=(phase,message,detail={})=>{
 status.textContent=message;
 window.__stage2TypstBrowser={phase,message,...detail};
};
window.__stage2TypstBrowser={phase:'ready'};
async function loadBytes(url){
 const response=await fetch(url,{credentials:'same-origin',cache:'force-cache'});
 if(!response.ok)throw Error('Missing local original source/font: '+url+' '+response.status);
 return new Uint8Array(await response.arrayBuffer());
}
async function compile(){
 button.disabled=true;let compiler;
 try{
  set('loading','Reading 414 canonical Arabic and English original passages...');
  const rr=await fetch('/daruri/qa/stage2_shootout/source.json',{cache:'no-store',credentials:'same-origin'});
  if(!rr.ok)throw Error('Canonical source fixture unavailable: '+rr.status);
  const source=await rr.json();
  if(source.schema!=='gnamma-stage2-compiler-comparison-v1'||
     source.paragraphs!==414||source.all_source.length!==414)
    throw Error('Original full-book source signature or count changed');
  const lines=[
   '#set page(paper: "a4", margin: (top: 18mm, bottom: 18mm, left: 17mm, right: 17mm))',
   '#set text(font: "Noto Serif", size: 10pt, lang: "en")',
   '#set par(leading: 0.7em)',
   '= Daruri entire bilingual source: Typst normal browser experiment',
   '#outline()','#pagebreak()'
  ];
  for(let i=0;i<source.all_source.length;i++){
   const row=source.all_source[i];
   if(i&&i%50===0)lines.push('#pagebreak()');
   lines.push('== Original '+row.id+' <item-'+i+'>');
   lines.push('#text(font: "Amiri", lang: "ar", dir: rtl, size: 13pt)['+
     esc(row.arabic_unvowelled)+']');
   lines.push('#v(4pt)');
   lines.push('#text(font: "Noto Serif",lang:"en",dir:ltr,size:9pt)['+
     esc(row.english)+']');
   if(row.section===65&&i<150)lines.push(
     '#text(font: "Amiri",lang:"ar",dir:rtl)['+esc(source.stress_phrase)+']#footnote['+
     esc(source.test_note)+']');
   lines.push('');
  }
  lines.push('#link(<item-0>)[Return to first source]');
  set('initializing','Loading actual Typst WASM and original local fonts...');
  const coreModules={
    'engine.core.wasm':WebAssembly.compileStreaming(fetch(coreUrl)),
    'engine.core2.wasm':WebAssembly.compileStreaming(fetch(core2Url)),
    'engine.core3.wasm':WebAssembly.compileStreaming(fetch(core3Url))
  };
  compiler=await createTypstCompiler({
    backend:'worker',worker:()=>createWebWorker(workerUrl),coreModules
  });
  const root='/daruri/build/fonts/';
  for(const file of ['NotoNaskhArabic-Regular.ttf','NotoSerif-Regular.ttf','NotoSans-Regular.ttf'])
   await compiler.addFonts(await loadBytes(root+file));
  await compiler.addFonts(await loadBytes('/daruri/qa/stage2_shootout/runtime/Amiri-Regular.ttf'));
  await compiler.addFonts(await loadBytes(mathUrl));
  await compiler.addSource('main.typ',lines.join('\n'));
  set('compiling','Typesetting complete 414 original bilingual paragraphs as vector PDF...');
  const started=performance.now();
  const result=await compiler.compile({main:'main.typ',format:'pdf'});
  const bytes=result.output instanceof Uint8Array?result.output:new Uint8Array(result.output);
  if(String.fromCharCode(...bytes.slice(0,5))!=='%PDF-'||bytes.length<300000)
    throw Error('No complete 414-source real PDF generated');
  const uri=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  const a=document.createElement('a');
  a.download='typst-browser-full-414-amiri-NONRELEASE.pdf';a.href=uri;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(uri),30000);
  set('done','Full bilingual Typst PDF generated in this browser. Unvowelled Arabic only; NOT publication approved.',{
   bytes:bytes.length,elapsed_ms:Math.round(performance.now()-started),
   authorial_passages:414,source_sha256:source.source_sha256,
   plain_arabic:true,original_english:true,
   real_browser_generated_pdf:true,no_external_pdf_or_renderer:true,
   original_vowelled_arabic_preserved:false,publication_approved:false
  });
 }catch(e){set('failed',String(e?.stack||e),{error:String(e)});console.error('TYPOGRAPHY_FULL_BROWSER_FAILURE',e);}
 finally{await compiler?.dispose().catch(()=>{});button.disabled=false;}
}
button.addEventListener('click',()=>void compile());