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
  set('loading','Reading original canonical text...');
  const rr=await fetch('/daruri/qa/stage2_shootout/source.json',{cache:'no-store',credentials:'same-origin'});
  if(!rr.ok)throw Error('Canonical fixture unavailable: '+rr.status);
  const source=await rr.json();
  if(source.schema!=='gnamma-stage2-compiler-comparison-v1'||source.paragraphs!==414||source.sample.length!==6)
   throw Error('The full 414-passage source and six tests do not match canonical schema');
  const lines=[
   '#set page(paper: "a4",margin: 17mm)',
   '#set text(font: "Noto Serif", size: 10pt)',
   '= Daruri browser-only Typst WASM source experiment',
   '#outline()','#pagebreak()'
  ];
  for(let i=0;i<source.sample.length;i++){
   const r=source.sample[i];
   lines.push('== Original '+r.id+' <a-'+i+'>');
   lines.push('#text(font: "Noto Naskh Arabic",lang:"ar",dir:rtl,size:13pt)['+esc(r.arabic)+']');
   lines.push('#text(font: "Noto Serif",lang:"en",dir:ltr)['+esc(r.english)+']');
   if(r.section===65)lines.push('#text(font:"Noto Naskh Arabic",lang:"ar",dir:rtl)['+
      esc(source.stress_phrase)+']#footnote['+esc(source.test_note)+']');
  }
  lines.push('#link(<a-0>)[Return to first original source]');
  set('initializing','Loading local WASM worker and Noto fonts...');
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
  await compiler.addFonts(await loadBytes(mathUrl));
  await compiler.addSource('main.typ',lines.join('\n'));
  set('compiling','Writing actual vector PDF inside this browser...');
  const started=performance.now();
  const result=await compiler.compile({main:'main.typ',format:'pdf'});
  const bytes=result.output instanceof Uint8Array?result.output:new Uint8Array(result.output);
  if(String.fromCharCode(...bytes.slice(0,5))!=='%PDF-'||bytes.length<10000)
   throw Error('No real local PDF created');
  const uri=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  const a=document.createElement('a');a.download='typst-browser-daruri-NONRELEASE.pdf';a.href=uri;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(uri),20000);
  set('done','WASM generated a real PDF locally. Native Arabic search is NOT YET approved.',{
   bytes:bytes.length,elapsed_ms:Math.round(performance.now()-started),
   source_sha256:source.source_sha256,real_browser_generated_pdf:true,
   no_external_pdf_or_renderer:true,publication_approved:false
  });
 }catch(e){set('failed',String(e?.stack||e),{error:String(e)});console.error('TYPOGRAPHY_BROWSER_FAILURE',e);}
 finally{await compiler?.dispose().catch(()=>{});button.disabled=false;}
}
button.addEventListener('click',()=>void compile());