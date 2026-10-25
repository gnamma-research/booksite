/* Browser-only Vivliostyle → PDF emitter from REAL original Scholarly HTML.
 * Research. Never use the separately signed 243-page reference as input.
 * Unlike a browser print dialog, this must emit an original Uint8Array.
 */
import {emitPdfFromVivliostyleWindow, printHTML} from "vivliostyle-pdf";

const sourceName = new URLSearchParams(location.search).get('source')||'vivliostyle-micro';
const sourceUrl='/daruri/qa/stage2_shootout/runtime_ultimate/'+
  encodeURIComponent(sourceName)+'.source.txt';
const button=document.querySelector('#generate');
const status=document.querySelector('#status');
const started=performance.now();
const messages=[];
let startedClick=false;

function report(phase,message,additional={}){
  if(messages.length<140)messages.push({phase,ms:Math.round(performance.now()-started),message:String(message).slice(0,700)});
  window.__gnammaVivliostylePdf={
    phase,engine:'vivliostyle-pdf@0.3.3',source:sourceName,
    messages:messages.slice(-40),
    elapsed_ms:Math.round(performance.now()-started),...additional
  };
  status.textContent=messages.slice(-13).map(x=>x.ms+'ms ['+x.phase+'] '+x.message).join('\n');
}

function fail(error){
  const detail={name:String(error?.name||'Error'),
    message:String(error?.message||error),
    stack:String(error?.stack||'').slice(0,3000)};
  report('failed',detail.message,{error:detail});
  console.error('GNAMMA_VIVLIOSTYLE_PDF_FAILURE',detail);
  button.disabled=false;
}

report('ready','Waiting for user click');
button.addEventListener('click',async()=>{
  if(startedClick)return;
  startedClick=true;
  button.disabled=true;
  let frameElement=null;
  let markedUp='';
  try{
    report('loading','Retrieving canonical SOURCE HTML via same origin');
    const response=await fetch(sourceUrl,{cache:'no-store'});
    if(!response.ok)throw Error('Full Scholarly HTML unavailable HTTP '+response.status);
    markedUp=await response.text();
    // Vivliostyle loads source HTML via blob: and may resolve root-relative
    // @font-face URLs against that blob rather than the original site. Use
    // exact same-origin absolute URLs to preserve Noto Serif/Naskh Arabic
    // and avoid hiding font loss behind the emitter's fallback fonts.
    markedUp=markedUp.replaceAll('url("/daruri/build/fonts/',
       'url("'+location.origin+'/daruri/build/fonts/')
       .replaceAll("url('/daruri/build/fonts/",
       "url('"+location.origin+"/daruri/build/fonts/");
    if(!markedUp.includes('parallel-text')||!markedUp.includes('lex-article')||
       !markedUp.includes('Noto Naskh Arabic'))throw Error('Input missing genuine Scholarly Arabic/English/lexicon');
    if(/\.pdf(\?|$)/i.test(sourceUrl))throw Error('Forbidden pre-existing PDF input');
    const htmlBytes=new TextEncoder().encode(markedUp).byteLength;
    const originalHash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',
      new TextEncoder().encode(markedUp)))]
      .map(x=>x.toString(16).padStart(2,'0')).join('');
    report('paginating','Rendering full HTML/CSS with Vivliostyle: '+htmlBytes+' bytes');
    printHTML(markedUp,{
      title:'Gnamma Scholarly '+sourceName,
      hideIframe:true,
      removeIframe:false,
      errorCallback:message=>fail(Error('Vivliostyle paginator: '+String(message))),
      printCallback:win=>{
        frameElement=win.frameElement;
        void (async()=>{
          try{
            report('emitting','CSS paginated; emitting PDF page vectors and GoTo annotations');
            const before=performance.now();
            const bytes=await emitPdfFromVivliostyleWindow(win,{
              sourceHtml:markedUp,
              embedSourceHtml:false,
              metadata:{
                title:'Al-Ḍarūrī fī Uṣūl al-Fiqh — Gnamma Scholarly Study',
                author:'Abū al-Walīd Ibn Rushd',
                language:'en'
              },
              onProgress:msg=>{
                if(performance.now()-before>1200 &&
                   (!messages.length||messages[messages.length-1].message!==String(msg)))
                    report('emitting',String(msg))
              },
              printOptions:{
                rasterizeSvgs:false,
                cropMarks:false,
                trimBox:false,
                bleedBox:false
              }
            });
            if(!(bytes instanceof Uint8Array) || bytes.length<15000 ||
               String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')
                throw Error('The browser emitter did not return an actual PDF Uint8Array');
            const pdfHash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))]
                .map(x=>x.toString(16).padStart(2,'0')).join('');
            const uri=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
            const a=document.createElement('a');
            a.href=uri;
            a.download='daruri-'+sourceName+'-vivliostyle-pdf-NONRELEASE.pdf';
            a.hidden=true;
            document.body.append(a);
            a.click();
            a.remove();
            window.__gnammaVivliostylePdf={
              phase:'done',engine:'vivliostyle-pdf@0.3.3',
              pdf_bytes:bytes.length,pdf_sha256:pdfHash,
              source_html_bytes:htmlBytes,source_html_sha256:originalHash,
              full_HTML_source:true,prebuilt_PDF_input:false,
              browser_print_dialog:false,privileged_chrome_PDF_writer:false,
              pdf_bytes_from_client_Blob:true,
              generation_ms:Math.round(performance.now()-started),
              messages:messages.slice(-40)
            };
            report('done','PDF downloaded '+bytes.length+' bytes',window.__gnammaVivliostylePdf);
            setTimeout(()=>URL.revokeObjectURL(uri),90000);
          }catch(error){fail(error)}
          finally{try{frameElement?.remove()}catch{}}
        })();
      }
    });
  }catch(error){fail(error)}
});
