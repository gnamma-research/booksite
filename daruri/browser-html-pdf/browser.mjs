/* NONRELEASE. All source and PDF page generation runs in an ordinary browser.
 * The PDF writer is vivliostyle-pdf / @pdfme/pdf-lib; no print dialog/CDP.
 */
import {printHTML,emitPdfFromVivliostyleWindow} from 'vivliostyle-pdf';
const el=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const status=(value,detail={})=>{el('status').textContent=value;window.__daruriQA={...(window.__daruriQA||{}),...detail,status:value};};
const FONT=new URL('/daruri/build/fonts/',location.origin).href;
function htmlFor(fixture,mode){
 if(fixture.schema!=='daruri-real-source-browser-pdf-stress-v1'||fixture.authorial_passages!==414||fixture.authorial_sections!==258)throw Error('The source fixture is not canonical');
 const sections=mode==='full'?fixture.full_sections:fixture.sample_sections;
 const count=sections.reduce((a,s)=>a+s.segments.length,0);
 if(mode==='full'&&(sections.length!==258||count!==414))throw Error('Entire 258-section book source incomplete');
 if(mode==='excerpt'&&sections.length!==6)throw Error('Six test sections required');
 const blocks=[];let placed=false;
 for(const sec of sections){
  blocks.push('<section class="reading-unit" id="section-'+sec.id+'">');
  if(sec.recorded_arabic_heading)blocks.push('<h2 lang="ar" dir="rtl" class="ar-heading">'+esc(sec.recorded_arabic_heading)+'</h2>');
  if(sec.recorded_english_heading)blocks.push('<h2 class="en-heading">'+esc(sec.recorded_english_heading)+'</h2>');
  blocks.push('<h3 class="unit-ref">R'+String(sec.id).padStart(3,'0')+'</h3>');
  for(const seg of sec.segments){
   let ar=esc(seg.arabic),inThisSegment=false;
   if(sec.id===65&&!placed&&ar.includes(esc(fixture.stress_phrase))){
    ar=ar.replace(esc(fixture.stress_phrase),esc('وَفِي')+'<sup class="note-call"><a id="experimental-note-call" href="#experimental-note">N65</a></sup> '+esc('أَلْفَاظِهِ'));
    placed=true;inThisSegment=true;
   }
   blocks.push('<div class="parallel" id="'+esc(seg.id)+'"><p class="en" lang="en" dir="ltr">'+esc(seg.english)+'</p><p class="ar" lang="ar" dir="rtl">'+ar+'</p></div>');
   if(inThisSegment)blocks.push('<span class="source-footnote" lang="en" id="experimental-note"><span class="note-label">N65.</span> '+esc(fixture.stress_note_text)+'</span>');
  }
  blocks.push('</section>');
 }
 if(!placed)throw Error('The source §65 footnote-interrupted stress phrase was not generated');
 const css=[
  '@font-face{font-family:"Noto Naskh Arabic";src:url("'+FONT+'NotoNaskhArabic-Regular.ttf") format("truetype")}',
  '@font-face{font-family:"Noto Serif";src:url("'+FONT+'NotoSerif-Regular.ttf") format("truetype")}',
  '@font-face{font-family:"Noto Sans";src:url("'+FONT+'NotoSans-Regular.ttf") format("truetype")}',
  '@page{size:A4;margin:14mm 13mm 15mm;@bottom-right{content:counter(page);font:8pt "Noto Sans"}}',
  'html,body{margin:0;padding:0;font:9.8pt/1.42 "Noto Serif";color:#172523}',
  'h1,h2,h3{break-after:avoid} h1{font:600 17pt/1.3 "Noto Serif";margin:0 0 7mm}',
  '.subtitle{font:8pt/1.4 "Noto Sans";margin-bottom:9mm}',
  '.reading-unit{break-inside:auto;margin:0 0 5mm}',
  '.ar-heading{font:600 13pt/1.5 "Noto Naskh Arabic";text-align:right;margin:2mm 0 1mm}',
  '.en-heading{font:600 10.5pt/1.4 "Noto Serif";margin:2mm 0 1mm}',
  '.unit-ref{font:7pt/1.3 "Noto Sans";color:#67736c;margin:2mm 0 1mm}',
  '.parallel{display:grid;grid-template-columns:1fr 1fr;column-gap:5mm;break-inside:auto;margin:0 0 2mm}',
  '.parallel .en{font:9.6pt/1.39 "Noto Serif";direction:ltr;text-align:left;padding:0 4mm 0 0;margin:0}',
  '.parallel .ar{font:13pt/1.6 "Noto Naskh Arabic";direction:rtl;text-align:right;margin:0;padding-left:4mm}',
  '.note-call{font:7pt "Noto Sans";vertical-align:super;line-height:0;unicode-bidi:isolate}',
  '.note-call a{color:#205e65}',
  '.source-footnote{float:footnote;footnote-display:block;font:8pt/1.34 "Noto Sans"}',
  '.source-footnote::footnote-call{content:none}.source-footnote::footnote-marker{content:none}',
  '.note-label{font-weight:700}'
 ].join('\n');
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Daruri real-source browser-only PDF feasibility</title><meta name="author" content="Gnamma Research; nonrelease experiment"><style>'+css+'</style></head><body><h1>Al-Daruri browser-generated PDF experiment</h1><p class="subtitle">Real canonical source. N65 is synthetic note placement, not a published note.</p>'+blocks.join('')+'</body></html>';
}
async function render(mode){
 if(!['excerpt','full'].includes(mode))throw Error('Unrecognised experiment mode');
 el('make').disabled=true;window.__daruriQAPdfBytes=null;
 const started=performance.now(),memoryBefore=performance.memory?.usedJSHeapSize??null;
 let targetWindow=null,timer;
 try{
  status('Loading canonical text from this origin…',{phase:'loading',mode});
  const req=await fetch('/daruri/browser-html-pdf/fixture.json',{credentials:'same-origin',cache:'no-store'});
  if(!req.ok)throw Error('Canonical fixture unavailable: '+req.status);
  const fixture=await req.json(),sourceHtml=htmlFor(fixture,mode);
  status('Paginating real Arabic and English HTML entirely in browser…',{phase:'paginating',mode});
  const promise=new Promise((resolve,reject)=>{
   try{
    const work=printHTML(sourceHtml,{
     title:'Daruri browser-only PDF proof',hideIframe:true,removeIframe:false,
     errorCallback:message=>{reject(Error('Vivliostyle pagination failed: '+String(message)));},
     printCallback:w=>{
     targetWindow=w;status('Inspecting completed paginated HTML in iframe…',{phase:'page-inspection',mode});
     (async()=>{
      // This selector is exactly what the installed emitter backend requires.
      // Measure real paginator output, not an assumed print-ready state.
      let found=0;
      for(let tick=0;tick<75;tick++){
       found=w.document.querySelectorAll('[data-vivliostyle-page-container]').length;
       if(found)break;
       await new Promise(done=>setTimeout(done,200));
      }
      const domState={
       pageContainers:found,
       readyState:w.document.readyState,
       iframeCount:w.document.querySelectorAll('iframe').length,
       divCount:w.document.querySelectorAll('div').length
      };
      window.__daruriQA={...(window.__daruriQA||{}),paginated_dom:domState};
      if(!found)throw Error('Vivliostyle callback exposed no PDF page containers: '+JSON.stringify(domState));
      status('Writing vector PDF bytes locally…',{phase:'writing',mode,paginated_pages:found});
      const taggedPdfUa=new URL(location.href).searchParams.get('ua')==='1';
      const forceFontFaces=new URL(location.href).searchParams.get('forcefaces')==='1';
      const facesBefore=Array.from(w.document.styleSheets).flatMap(sheet=>{
       try{return Array.from(sheet.cssRules).filter(rule=>rule instanceof w.CSSFontFaceRule).map(rule=>
        ({family:rule.style.getPropertyValue('font-family'),src:rule.style.getPropertyValue('src')?.slice(0,140)}));
       }catch{return[]}
      });
      const checkBefore=w.document.fonts.check('13px "Noto Naskh Arabic"');
      if(forceFontFaces){
       // The paginator may clone only its page containers into the callback
       // document. Explicitly expose exactly the SAME local Noto font faces
       // to the DOM→PDF emitter; don't alter any measured page geometry.
       const recovered=w.document.createElement('style');
       recovered.dataset.daruriQaFontRebind='true';
       recovered.textContent=[
         '@font-face{font-family:"Noto Naskh Arabic";src:url("'+FONT+'NotoNaskhArabic-Regular.ttf") format("truetype")}',
         '@font-face{font-family:"Noto Serif";src:url("'+FONT+'NotoSerif-Regular.ttf") format("truetype")}',
         '@font-face{font-family:"Noto Sans";src:url("'+FONT+'NotoSans-Regular.ttf") format("truetype")}',
       ].join('\n');
       w.document.head.append(recovered);
       await w.document.fonts.load('13px "Noto Naskh Arabic"');
       await w.document.fonts.ready;
      }
      const facesAfter=Array.from(w.document.styleSheets).flatMap(sheet=>{
       try{return Array.from(sheet.cssRules).filter(rule=>rule instanceof w.CSSFontFaceRule).map(rule=>
        ({family:rule.style.getPropertyValue('font-family'),src:rule.style.getPropertyValue('src')?.slice(0,140)}));
       }catch{return[]}
      });
      window.__daruriQA={...(window.__daruriQA||{}),font_diagnostics:{
        force_fallback_recovery:forceFontFaces,
        faces_before:facesBefore.slice(0,12),faces_after:facesAfter.slice(0,12),
        noto_check_before:checkBefore,
        noto_check_after:w.document.fonts.check('13px "Noto Naskh Arabic"'),
      }};
      const bytes=await emitPdfFromVivliostyleWindow(w,{
       baseUrl:new URL('/daruri/browser-html-pdf/runtime/',location.origin).href,
       sourceHtml,metadata:{title:'Daruri browser HTML-PDF research',author:'Gnamma Research',
         language:'ar'},
       ...(taggedPdfUa?{pdfOptions:{pdfUa:2}}:{}),
       onProgress:message=>{window.__daruriQA={...(window.__daruriQA||{}),progress:String(message).slice(0,100)};}
      });
      resolve(bytes);
     })().catch(reject);
     }});
    if(work&&typeof work.catch==='function')work.catch(reject);
   }catch(error){reject(error)}
  });
  const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Browser PDF export exceeded 180 seconds')),180000);});
  const value=await Promise.race([promise,deadline]);
  const bytes=value instanceof Uint8Array?value:new Uint8Array(value);
  if(String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')throw Error('No browser-generated PDF header');
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  const a=document.createElement('a');a.download='daruri-browser-only-'+mode+'-NONRELEASE.pdf';a.href=url;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  window.__daruriQAPdfBytes=bytes;
  const qa={phase:'done',mode,bytes:bytes.length,elapsed_ms:Math.round(performance.now()-started),
    memory_before:memoryBefore,memory_after:performance.memory?.usedJSHeapSize??null,
    source_sha256:fixture.source_sha256,authorial_sections:258,authorial_passages:414,
    engine:'vivliostyle-pdf@0.3.3; @pdfme/pdf-lib',
    tagged_pdfua:new URL(location.href).searchParams.get('ua')==='1',
    verified_font_face_recovery:new URL(location.href).searchParams.get('forcefaces')==='1',
    no_server_pdf_generation:true,
    no_print_dialog:true,no_cdp_print_to_pdf:true,no_prebuilt_pdf_inputs:true,not_release_approved:true};
  status('PDF generated entirely in this browser. Native Arabic and footnote QA still required.',qa);
  return qa;
 }catch(error){status('Browser PDF failed: '+String(error?.message||error),{phase:'failed',error:String(error),mode});throw error;}
 finally{clearTimeout(timer);try{targetWindow?.frameElement?.remove()}catch{}el('make').disabled=false}
}
el('make').addEventListener('click',()=>{void render(el('mode').value).catch(e=>console.error('Daruri browser-PDF research failure',e));});
window.__daruriRunExperiment=render;
window.__daruriQA={phase:'ready'};
