/* Real browser-only (Chromium + WebKit) Study note typesetting.
 * Compiles canonical, independently verified source to a user-downloadable
 * PDF Blob without any server-side PDF, CDP print or pre-existing PDF bytes.
 */
import {createTypstCompiler} from 'typst-wasm';
import {createWebWorker} from 'typst-wasm/worker/browser';
import workerUrl from 'typst-wasm/worker/web-worker?worker&url';
import coreUrl from 'typst-wasm/engine/engine.core.wasm?url';
import core2Url from 'typst-wasm/engine/engine.core2.wasm?url';
import core3Url from 'typst-wasm/engine/engine.core3.wasm?url';
import mathUrl from '@typst-wasm/fonts/NewCMMath-Regular.otf?url';

const button=document.getElementById('generate');
const status=document.getElementById('status');
function set(phase,message,more={}){
 status.textContent=message;
 window.__daruriRealStudyBrowser={phase,message,...more};
}
set('ready','Ready. Original Study source required.');
async function bytes(url){
 const r=await fetch(url,{cache:'force-cache',credentials:'same-origin'});
 if(!r.ok)throw Error('Missing same-origin original source or font '+url+' '+r.status);
 return new Uint8Array(await r.arrayBuffer());
}
async function compile(){
 let compiler;
 button.disabled=true;
 try{
  const origin='/daruri/qa/stage2_shootout/runtime_study/';
  set('loading','Fetching checked 414 original Arabic-English source paragraphs and all Study notes...');
  const [source,meta]=await Promise.all([
   fetch(origin+'study_source.typ',{credentials:'same-origin',cache:'no-store'}).then(r=>r.ok?r.text():Promise.reject(Error('Missing source.typ'))),
   fetch(origin+'study_typst_source_evidence.json',{credentials:'same-origin'}).then(r=>r.ok?r.json():Promise.reject(Error('Missing study evidence')))
  ]);
  if(meta.original_authorial_passages!==414||
     meta.original_note_bodies!==meta.typst_footnote_body_declarations||
     meta.original_note_bodies<100||
     meta.fully_vowelled_original_arabic!==true||
     !source.includes('<daruri-065>'))
    throw Error('Real Study content integrity did not pass before browser typesetting');
  set('initializing','Loading local WebAssembly compiler and original Arabic fonts...');
  compiler=await createTypstCompiler({
   backend:'worker',
   worker:()=>createWebWorker(workerUrl),
   coreModules:{
    'engine.core.wasm':WebAssembly.compileStreaming(fetch(coreUrl)),
    'engine.core2.wasm':WebAssembly.compileStreaming(fetch(core2Url)),
    'engine.core3.wasm':WebAssembly.compileStreaming(fetch(core3Url))
   }
  });
  const fontroot='/daruri/build/fonts/';
  for(const f of ['NotoNaskhArabic-Regular.ttf','NotoSerif-Regular.ttf','NotoSans-Regular.ttf'])
   await compiler.addFonts(await bytes(fontroot+f));
  await compiler.addFonts(await bytes(origin+'Amiri-Regular.ttf'));
  await compiler.addFonts(await bytes(mathUrl));
  await compiler.addSource('main.typ',source);
  set('compiling','Typesetting full real Study footnotes as a vector A4 PDF on this device...');
  const begin=performance.now();
  const pdf=await compiler.compile({main:'main.typ',format:'pdf'});
  const output=pdf.output instanceof Uint8Array?pdf.output:new Uint8Array(pdf.output);
  if(output.length<50000||String.fromCharCode(...output.slice(0,5))!=='%PDF-')
   throw Error('No complete real PDF returned by WASM');
  const uri=URL.createObjectURL(new Blob([output],{type:'application/pdf'}));
  const a=document.createElement('a');
  a.download='daruri-study-browser-414-real-notes-NONRELEASE.pdf';a.href=uri;
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(uri),20000);
  set('done','Real Study PDF generated inside the browser; not yet publication approved.',{
   compiled_bytes:output.length,
   compiler_ms:Math.round(performance.now()-begin),
   source_sha256:meta.original_source_sha256,
   source_note_bodies:meta.original_note_bodies,
   original_note_calls:meta.original_note_calls,
   original_authorial_passages:meta.original_authorial_passages,
   browser_pdf_bytes_not_received_from_server:true,
   used_print_dialog:false,
   javascript_heap_bytes:performance.memory?.usedJSHeapSize??null,
   release_approved:false
  });
 }catch(e){
  set('failed',String(e?.stack||e),{error:String(e)});
  console.error('DARURI_STUDY_BROWSER_COMPILER_ERROR',e);
 }finally{
  await compiler?.dispose().catch(()=>{});
  button.disabled=false;
 }
}
button.addEventListener('click',()=>void compile());
