/* Ordinary browser HTML -> Typst WASM -> original complete source PDF.
 * Everything runs on device. No source PDF, CI renderer, remote PDF service,
 * print dialog or user-provided secrets.
 */
import {createTypstCompiler} from 'typst-wasm';
import {createWebWorker} from 'typst-wasm/worker/browser';
import workerUrl from 'typst-wasm/worker/web-worker?worker&url';
import coreUrl from 'typst-wasm/engine/engine.core.wasm?url';
import core2Url from 'typst-wasm/engine/engine.core2.wasm?url';
import core3Url from 'typst-wasm/engine/engine.core3.wasm?url';
import mathUrl from '@typst-wasm/fonts/NewCMMath-Regular.otf?url';
import {makeTypstFromCanonicalHtml} from './ultimate_html_to_typst.mjs';

const status=document.getElementById('status'),button=document.getElementById('generate');
function set(phase,message,stats={}){status.textContent=message;
 window.__gnammaUltimateTypst={phase,message,...stats};}
set('ready','Ready for full canonical Scholarly source.');
async function bytes(url){
 const response=await fetch(url,{credentials:'same-origin'});
 if(!response.ok)throw Error('Missing original local data/font '+url+' status '+response.status);
 return new Uint8Array(await response.arrayBuffer());
}
function hex(bytes){return Array.from(bytes).map(x=>x.toString(16).padStart(2,'0')).join('')}
async function run(){
 button.disabled=true;let compiler;
 try{
  const origin='/daruri/qa/stage2_shootout/runtime_ultimate/';
  const start=performance.now();
  set('reading','Validating complete original Scholarly HTML, notes and links...');
  const [sourceBytes,meta]=await Promise.all([
   bytes(origin+'scholarly.source.txt'),
   fetch(origin+'scholarly.source.json').then(r=>r.ok?r.json():Promise.reject(Error('No original source manifest')))
  ]);
  if(meta.edition!=='scholarly'||meta.historical_dictionary_articles!==157||
     meta.historical_dictionary_terms!==153||meta.total_original_notes!==625||
     meta.authorial_source_paragraphs!==414||meta.named_authorial_destinations!==258)
   throw Error('Canonical complete scholarly source contract not satisfied');
  const observed=hex(new Uint8Array(await crypto.subtle.digest('SHA-256',sourceBytes)));
  if(observed!==meta.html_sha256)throw Error('Source HTML SHA-256 mismatch');
  const html=new TextDecoder().decode(sourceBytes);
  const began=performance.now();
  const converted=makeTypstFromCanonicalHtml(html,meta);
  const conversion=performance.now()-began;
  if(converted.metrics.emitted_target_labels!==2856||
     converted.metrics.generated_source_links<meta.all_internal_reference_links+meta.all_external_links||
     converted.metrics.typst_lexicon_grid_rows!==283||
     converted.metrics.typst_bilingual_grid_rows<414)
   throw Error('Conversion unexpectedly dropped dictionary text, original citations or source paragraphs: '+JSON.stringify(converted.metrics));
  set('initializing','Loading local Typst WASM and manuscript fonts...');
  // JSPI is the documented non-worker backend. Validate whether it avoids
  // SharedArrayBuffer / COOP+COEP on plain GitHub Pages static hosting.
  // Explicit mode isolates this experiment from the proven worker backend.
  compiler=await createTypstCompiler({backend:'jspi',
    coreModules:{
     'engine.core.wasm':WebAssembly.compileStreaming(fetch(coreUrl)),
     'engine.core2.wasm':WebAssembly.compileStreaming(fetch(core2Url)),
     'engine.core3.wasm':WebAssembly.compileStreaming(fetch(core3Url))
    }
  });
  for(const file of ['NotoNaskhArabic-Regular.ttf','NotoSerif-Regular.ttf','NotoSans-Regular.ttf'])
   await compiler.addFonts(await bytes('/daruri/build/fonts/'+file));
  await compiler.addFonts(await bytes(mathUrl));
  await compiler.addSource('main.typ',converted.source);
  set('compiling','Typesetting original 625 notes and 157 dictionary articles in this browser...');
  const beganCompile=performance.now();
  const result=await compiler.compile({main:'main.typ',format:'pdf'});
  const output=result.output instanceof Uint8Array?result.output:new Uint8Array(result.output);
  if(output.length<250000||String.fromCharCode(...output.slice(0,5))!=='%PDF-')
   throw Error('Full source-to-PDF did not produce valid bytes');
  const name='daruri-scholarly-625-notes-browser-typst-NONRELEASE.pdf';
  const url=URL.createObjectURL(new Blob([output],{type:'application/pdf'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download=name;
  document.body.append(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),25000);
  set('done','Original Scholarly PDF generated on-device. Not yet release certified.',{
   bytes:output.length,compilation_ms:Math.round(performance.now()-beganCompile),
   conversion_ms:Math.round(conversion),
   total_from_html_ms:Math.round(performance.now()-start),
   source_sha256:meta.source_sha256,
   original_html_sha256:meta.html_sha256,
   source_details:converted.metrics,
   final_typst_chars:converted.source.length,
   first_party_local_resources_only:true,
   prebuilt_pdf_input:false,used_print_dialog:false,
   browser_heap_bytes:performance.memory?.usedJSHeapSize??null,
   publication_approved:false
  });
 }catch(e){set('failed',String(e?.stack||e),{error:String(e)});
   console.error('GNAMMA_ULTIMATE_TYPST_ERROR',e);
 }finally{await compiler?.dispose().catch(()=>{});button.disabled=false;}
}
button.addEventListener('click',()=>void run());
