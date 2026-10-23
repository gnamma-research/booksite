/* True client-only paged PDF using modern CSS paged-media + a vector emitter.
 * Input is canonical text and HTML, not PDF. No browser print dialog.
 * Experimental, never to be linked to public Editions until all QA passes.
 */
import {printHTML} from "@vivliostyle/print";
import {emitPdfFromWindow} from "pages-to-pdf";

// Source of the backend selectors: vivliostyle/vivliostyle-pdf@0.3.3.
// This is an experiment, not publication approval; AGPL/LGPL licence
// obligations must be reviewed before any production embedding.
const VIVLIOSTYLE_BACKEND={
 pageSelector:"[data-vivliostyle-page-container]",filterEmptyPages:true,
 unhidePagesSelector:"[data-vivliostyle-page-container]",
 internalLinkPrefix:/^viv-id-.*:0023/,
 scaleRunsToMeasuredWidth:true,handleHyphenation:true,
 artifactSelectors:["[data-vivliostyle-page-margin-box]"],
 wrapperSelectors:[
  "[data-vivliostyle-bleed-box]","[data-vivliostyle-page-box]",
  "[data-vivliostyle-page-area-container]","[data-vivliostyle-page-area]",
  "[data-vivliostyle-column]","[data-vivliostyle-original-tag]"
 ],
 footnoteSelectors:{
  item:"[data-viv-footnote-counter]",call:"[data-viv-footnote-call-owner]"
 },
 defaultCreator:"vivliostyle-pdf"
};
const $=id=>document.getElementById(id);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const css=[
'@font-face{font-family:"Noto Naskh Arabic";src:url("__BASE__/daruri/build/fonts/NotoNaskhArabic-Regular.ttf");font-weight:400}',
'@font-face{font-family:"Noto Serif";src:url("__BASE__/daruri/build/fonts/NotoSerif-Regular.ttf");font-weight:400}',
'@font-face{font-family:"Noto Sans";src:url("__BASE__/daruri/build/fonts/NotoSans-Regular.ttf");font-weight:400}',
'@page{size:A4;margin:15mm 13mm 17mm;@bottom-center{content:counter(page);font:8pt "Noto Sans"}',
'@footnote{border-top:0.5pt solid #98a6a2;padding-top:4pt;margin:0}}',
'html,body{font:10pt/1.43 "Noto Serif";color:#202d2a}',
'h1{font:18pt "Noto Serif";margin:0 0 6pt}',
'h2{font:11pt/1.3 "Noto Serif";margin:10pt 0 4pt;break-after:avoid}',
'section{margin:0 0 9pt}p{margin:0 0 5pt;orphans:2;widows:2}',
'.eng{font:9.5pt/1.4 "Noto Serif";direction:ltr;text-align:left}',
'.arb{font:13pt/1.65 "Noto Naskh Arabic";direction:rtl;text-align:right}',
'.recorded{font:13pt "Noto Naskh Arabic";direction:rtl;text-align:right}',
'.pair{display:table;table-layout:fixed;width:100%;border-collapse:collapse;margin:0 0 5pt}',
'.pairrow{display:table-row}.cell{display:table-cell;width:50%;vertical-align:top;padding:0 5pt}',
'.cell:first-child{border-right:.4pt solid #bbc8c3}',
'.fn{float:footnote;font:8pt/1.3 "Noto Sans";direction:ltr;text-align:left}',
'.fn::footnote-call{font:7pt "Noto Sans";vertical-align:super}',
'.fn::footnote-marker{font:7pt "Noto Sans"}',
'a{color:#246671;text-decoration:none}'
].join("\n");
let book=null;
window.__pdfProof={state:"idle",engine:"vivliostyle-print+pages-to-pdf"};
function bodyHtml(mode){
 if(mode==="hello"){
  return '<!doctype html><html lang="en"><head><meta charset="utf-8">'+
   '<title>One-page HTML/PDF emitter self-test</title><style>@page{size:A4;margin:15mm}body{font:15px Arial,sans-serif}</style></head>'+
   '<body><h1>Hello, selectable PDF</h1><p>One document paragraph, no footnotes or fonts.</p></body></html>';
 }
 if(mode==="arabic-mini"){
  return '<!doctype html><html lang="en"><head><meta charset="utf-8">'+
   '<title>Arabic HTML/PDF emitter self-test</title><style>'+
   css.replace(/__BASE__/g,location.origin)+'</style></head>'+
   '<body><h1>Arabic source extraction</h1><p class="arb" lang="ar" dir="rtl">وَفِي أَلْفَاظِهِ</p>'+
   '<p class="eng">One Arabic phrase and one English sentence.</p></body></html>';
 }
 const list=mode==="excerpt"?book.excerpt:book.complete,fragments=[];
 fragments.push('<header><h1>Al-Daruri — native browser paged-media test</h1>',
 '<p>Experimental. Arabic and translation come from the canonical Gnamma source.</p></header>');
 let interrupted=false;
 for(const sec of list){
  const id='R'+String(sec.id).padStart(3,'0');
  fragments.push('<section id="'+id+'"><h2>'+id+' · '+esc(sec.title)+'</h2>');
  if(sec.headingAr&&mode!=='english-full')
   fragments.push('<h3 class="recorded" lang="ar" dir="rtl">'+esc(sec.headingAr)+'</h3>');
  for(let i=0;i<sec.segments.length;i++){
   const seg=sec.segments[i],pid=id+'-P'+String(i+1).padStart(2,'0');
   if(mode==='english-full'){
    fragments.push('<p id="'+pid+'" class="eng" lang="en" dir="ltr">'+esc(seg.en)+'</p>');
   }else{
    let ar=esc(seg.vocalized);
    if(sec.id===65&&!interrupted&&seg.vocalized.includes(book.expected_fragments.arabic_exact)){
     const start=seg.vocalized.indexOf('وَفِي أَلْفَاظِهِ')+'وَفِي'.length;
     const note='<span class="fn" id="R065-footnote" lang="en" dir="ltr">'+
       'Editorial footnote stress sample; not part of the authorial Arabic text.</span>';
     ar=esc(seg.vocalized.slice(0,start))+note+esc(seg.vocalized.slice(start));
     interrupted=true;
    }
    fragments.push('<div id="'+pid+'" class="pair"><div class="pairrow">',
      '<div class="cell"><p class="eng" lang="en" dir="ltr">'+esc(seg.en)+'</p></div>',
      '<div class="cell"><p class="arb" lang="ar" dir="rtl">'+ar+'</p></div>',
      '</div></div>');
   }
  }
  fragments.push('</section>');
 }
 if(mode==='excerpt'&&!interrupted)throw Error('R065 source note anchor is missing');
 const src='<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Daruri browser paged PDF</title>'+
  '<style>'+css.replace(/__BASE__/g,location.origin)+'</style></head><body>'+
  fragments.join('')+'</body></html>';
 return src;
}
async function boot(){
 const r=await fetch('/daruri/qa/browser_pdf_canonical_fixture.json',{cache:'no-store'});
 if(!r.ok)throw Error('Missing canonical source fixture');
 book=await r.json();
 if(book.source_sections!==258||book.source_segments!==414||book.release_approved)
   throw Error('Noncanonical source input');
 $('status').textContent='Ready: '+book.source_sections+' source units';
}
$('make').addEventListener('click',async()=>{
 $('make').disabled=true;
 const mode=$('scenario').value,start=performance.now();
 window.__pdfProof={state:'building',mode,engine:'vivliostyle-print+pages-to-pdf'};
 $('status').textContent='Paginating HTML in browser...';
 try{
  if(!book)await boot();
  const html=bodyHtml(mode);
  const heapBefore=performance.memory?.usedJSHeapSize??null;
  const result=await new Promise((resolve,reject)=>{
   let settled=false,frame=null;
   try{
    printHTML(html,{
     title:'Daruri browser Vivliostyle '+mode,
     hideIframe:true,removeIframe:false,
     errorCallback:message=>{if(!settled){settled=true;reject(Error('Vivliostyle layout failed: '+message));}},
     printCallback:iframeWindow=>{
      frame=iframeWindow.frameElement;
      const ar=iframeWindow.document.querySelector('.arb,.arabic,.recorded');
      const ff=ar?iframeWindow.getComputedStyle(ar).fontFamily:null;
      const loadedFonts=[...iframeWindow.document.fonts].map(x=>({
       family:x.family,status:x.status,weight:x.weight
      })).slice(0,20);
      const diagnostics={
       computedArabicFont:ff,
       loadedFonts,
       fontAvailabilityNaskh:iframeWindow.document.fonts.check('13px "Noto Naskh Arabic"'),
       styleSheets:iframeWindow.document.styleSheets.length,
       absNaskhFont:'/daruri/build/fonts/NotoNaskhArabic-Regular.ttf'
      };
      window.__pdfProof.fontDiagnostics=diagnostics;
      console.info('DARURI_VIVLIO_FONTS',JSON.stringify(diagnostics));
      window.__pdfProof.stage='emitting';
      $('status').textContent='Pagination complete; writing selectable PDF bytes...';
      void (async()=>{
       try{
        const raw=await emitPdfFromWindow(iframeWindow,{
         backend:VIVLIOSTYLE_BACKEND,
         // pages-to-pdf's Noto/Libertinus fallback fonts, ICC and WOFF2
         // decoder are packaged under public/. They must be served as
         // same-origin assets, not assumed to exist at /fonts or a CDN.
         baseUrl:new URL('/daruri/qa/node_modules/pages-to-pdf/public/',location.origin).href,
         sourceHtml:html,
         metadata:{title:'Daruri browser-only research '+mode},
         onProgress:message=>{$('status').textContent=String(message||'Emitting PDF');}
        });
        if(!settled){settled=true;resolve(raw);}
       }catch(error){if(!settled){settled=true;reject(error);}}
       finally{frame?.remove()}
      })();
     }
    });
   }catch(err){if(!settled){settled=true;reject(err);frame?.remove()}}
  });
  const bytes=result instanceof Uint8Array?result:new Uint8Array(result);
  if(bytes.length<5000||String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')
   throw Error('Paged-media engine did not return PDF bytes');
  const u=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  const a=document.createElement('a');a.href=u;
  a.download='daruri-'+mode+'-paged-client-NONRELEASE.pdf';
  document.body.appendChild(a);a.click();a.remove();
  const fontDiagnostics=window.__pdfProof.fontDiagnostics||null;
  window.__pdfProof={state:'done',mode,engine:'vivliostyle-print+pages-to-pdf',
   fontDiagnostics,
   sourceHtmlBytes:new TextEncoder().encode(html).length,
   milliseconds:Math.round(performance.now()-start),bytes:bytes.length,
   memBefore:heapBefore,memAfter:performance.memory?.usedJSHeapSize??null,
   fullDocumentHtmlTypesetInBrowser:true,cssFootnotesEnabled:true};
  $('status').textContent='PDF generated in browser ('+Math.round((performance.now()-start)/1000)+'s)';
  setTimeout(()=>URL.revokeObjectURL(u),20000);
 }catch(e){
  window.__pdfProof={state:'error',mode,engine:'vivliostyle-print+pages-to-pdf',
   milliseconds:Math.round(performance.now()-start),error:String(e?.stack||e)};
  $('status').textContent='Failed: '+String(e?.message||e);
  console.error('DARURI_PAGED_BROWSER_PDF_ERROR',e);
 }finally{$('make').disabled=false}
});
boot().catch(e=>{$('status').textContent='Failed: '+String(e);window.__pdfProof={state:'error',error:String(e)}});
