/* Qawtaw17: verified published PDF + browser-local personal appendix.
 * Reuses Daruri's pinned pdf-lib/fontkit/fonts; never sends saved work to a server.
 * Exact main-PDF source content and links are preserved by loading the checked
 * published PDF. New personal material is added as clearly labelled end pages,
 * not falsely presented as publisher annotations or exact source-page overlays.
 */
(function(){
'use strict';
const BASE='../../../daruri/vendor/';
const $=s=>document.querySelector(s);
let libraryPromise=null,fontsPromise=null;
function status(message){
 const node=$('#qaw-desk-pdf-status');if(node)node.textContent=String(message||'');
}
async function script(name,check){
 if(check())return;
 await new Promise((resolve,reject)=>{
  const node=document.createElement('script');
  node.src=new URL(BASE+name,location.href).href;node.crossOrigin='anonymous';
  const handle=setTimeout(()=>{node.remove();reject(Error('Local PDF dependency did not load.'));},18000);
  node.onload=()=>{clearTimeout(handle);resolve();};
  node.onerror=()=>{clearTimeout(handle);node.remove();reject(Error('Local PDF dependency unavailable.'));};
  document.head.append(node);
 });
 if(!check())throw Error('Local PDF dependency did not initialize.');
}
async function dependencies(){
 if(!libraryPromise)libraryPromise=(async()=>{
  await script('pdf-lib-1.17.1.min.js',()=>!!window.PDFLib?.PDFDocument);
  await script('fontkit-1.1.1.umd.min.js',()=>!!window.fontkit);
 })().catch(e=>{libraryPromise=null;throw e;});
 return libraryPromise;
}
async function checkedBytes(path,checksum){
 const response=await fetch(path,{cache:'no-store'});
 if(!response.ok)throw Error('Published PDF unavailable (HTTP '+response.status+').');
 const bytes=await response.arrayBuffer();
 if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('Published PDF header invalid.');
 if(!window.crypto?.subtle)throw Error('Secure SHA-256 verification is not available in this browser.');
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 const hex=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hex!==checksum)throw Error('PDF source checksum mismatch. No personal copy was produced.');
 return bytes;
}
async function fonts(doc){
 doc.registerFontkit(window.fontkit);
 const names=['NotoSerif-Regular.ttf','NotoNaskhArabic-Regular.ttf'];
 const bytes=await Promise.all(names.map(async name=>{
  const response=await fetch(new URL(BASE+name,location.href));
  if(!response.ok)throw Error('Bundled Unicode font unavailable: '+name);
  return response.arrayBuffer();
 }));
 const [en,ar]=await Promise.all(bytes.map(x=>doc.embedFont(x,{subset:true})));
 return {en,ar};
}
function charWidth(font,text,size){
 return font.widthOfTextAtSize(text,size);
}
function choose(text,fonts){return /[\u0600-\u08ff]/u.test(String(text))?fonts.ar:fonts.en;}
function wrap(text,font,size,max){
 const lines=[],paragraphs=String(text||'').split(/\r?\n/u);
 for(const para of paragraphs){
  if(!para.trim()){lines.push('');continue;}
  const words=para.split(/\s+/u);let current='';
  for(const word of words){
   const next=current?current+' '+word:word;
   if(charWidth(font,next,size)<=max){current=next;continue;}
   if(current){lines.push(current);current='';}
   if(charWidth(font,word,size)<=max){current=word;continue;}
   let piece='';
   for(const ch of word){
    if(charWidth(font,piece+ch,size)>max){
     if(!piece)throw Error('Cannot render an unsupported personal note character.');
     lines.push(piece);piece=ch;
    }else piece+=ch;
   }
   current=piece;
  }
  if(current)lines.push(current);
 }
 return lines;
}
async function create(rows,file){
 const items=rows.filter(x=>!x.deleted&&x.target?.id);
 if(!items.length)throw Error('Save a bookmark, quote or personal note before creating a personal PDF.');
 if(items.length>500)throw Error('Select a smaller collection (at most 500 entries).');
 status('Verifying the original published PDF checksum…');
 const response=await fetch('pdf/manifest.json',{cache:'no-store'});
 if(!response.ok)throw Error('Verified PDF manifest unavailable.');
 const manifest=await response.json();
 const source=(manifest.files||[]).find(x=>x.filename===file);
 if(!source||!source.sha256||!/^qawaid-[\w-]+\.pdf$/.test(file))throw Error('Selected PDF is not in the published manifest.');
 const bytes=await checkedBytes('pdf/'+file,source.sha256);
 status('Preparing local PDF rendering tools…');
 await dependencies();
 const pdf=await window.PDFLib.PDFDocument.load(bytes,{updateMetadata:false});
 const originals=pdf.getPageCount();
 if(originals!==source.pages)throw Error('The original PDF page count does not match its manifest.');
 const font=await fonts(pdf);
 const rgb=window.PDFLib.rgb;
 const A4=[595.28,841.89],L=49,R=49,W=A4[0]-L-R;
 let page=null,y=0,printed=0;
 function fresh(){
  page=pdf.addPage(A4);printed++;
  y=A4[1]-53;
  page.drawText('GNAMMA  /  QAWĀʿID AND TAMHĪD  /  PRIVATE APPENDIX',{
    x:L,y,font:font.en,size:9,color:rgb(.24,.39,.42)});
  y-=25;
  page.drawLine({start:{x:L,y},end:{x:A4[0]-R,y},thickness:.8,color:rgb(.68,.72,.7)});
  y-=29;
 }
 function block(text,settings={}){
  if(!page)fresh();
  const size=settings.size||11,arabic=/[\u0600-\u08ff]/u.test(String(text)),type=choose(text,font);
  const spacing=arabic?Math.max(21,size*1.7):Math.max(17,size*1.5);
  const lines=wrap(text,type,size,W);
  for(const str of lines){
   if(y<65)fresh();
   if(str){
    const width=charWidth(type,str,size),px=arabic?Math.max(L,A4[0]-R-width):L;
    page.drawText(str,{x:px,y,size,font:type,color:settings.color||rgb(.1,.18,.2)});
   }
   y-=spacing;
  }
  y-=(settings.after??6);
 }
 fresh();
 block('My personal reading collection',{size:22,after:16});
 block('Reader-created annotations. The original source PDF is unchanged; these entries are appended as private pages, not medieval text, publisher notes or exact in-PDF source-word overlays.',{size:11,after:12});
 block('Base edition: '+source.title+'  |  '+source.pages+' original pages',{size:11,after:16});
 for(const [i,item] of items.entries()){
  if(y<145)fresh();
  block(String(i+1)+'. '+String(item.title||item.kind),{size:14,after:2});
  block(String(item.target.id)+'  ·  '+String(item.kind)+'  ·  '+String(item.created||'Earlier bookmark'),{size:9,after:6});
  if(item.quote)block(String(item.quote).slice(0,12000),{size:item.lang==='ar'?13:11,after:8});
  if(item.body)block(String(item.body).slice(0,30000),{size:11,after:9});
  y-=9;
 }
 pdf.setTitle('Qawāʿid / Tamhīd — '+source.title+' with personal appendix');
 pdf.setSubject('Reader-created personal annotations grouped by source ID; medieval and editorial texts are unchanged.');
 pdf.setCreator('Gnamma Research — local browser export');
 status('Finalizing the PDF with '+printed+' personal appendix page(s)…');
 const output=await pdf.save({useObjectStreams:true});
 if(!output?.length)throw Error('Personal PDF generation produced no bytes.');
 const blob=new Blob([output],{type:'application/pdf'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='qawaid-personal-'+file;
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);
 status('Personal PDF created locally: '+source.pages+' original pages and '+printed+' appended private pages. No upload was made.');
 return {originalPages:originals,appendixPages:printed,items:items.length,bytes:output.length};
}
window.GnammaQawaidPersonalPDF=Object.freeze({create});
})();
