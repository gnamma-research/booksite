/* Standalone, browser-local Reading Desk PDF export.
 * Uses the same locally hosted Unicode PDF libraries as personal editions.
 * No personal note text is sent to a server; only libraries/fonts are fetched.
 * The native Print action remains available for full browser typographic fidelity.
 */
(() => {
 'use strict';
 const BASE=new URL('.',document.currentScript?.src||location.href);
 const A4={w:595.28,h:841.89,left:46,right:46,top:52,bottom:52};
 const MAX_PAGES=500,MAX_CHARS=750000;
 const loaded=new Map();
 function assetUrl(name){return new URL(name,BASE).href;}
 function loadScript(name,global){
  if(window[global])return Promise.resolve(window[global]);
  if(loaded.has(name))return loaded.get(name);
  const promise=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.async=true;script.src=assetUrl(name);
   const timeout=setTimeout(()=>{script.remove();reject(Error('The local PDF engine did not load. Try Print instead.'));},18000);
   script.onload=()=>{clearTimeout(timeout);window[global]?resolve(window[global]):reject(Error('The local PDF engine did not initialise.'));};
   script.onerror=()=>{clearTimeout(timeout);script.remove();reject(Error('PDF library unavailable offline. Reconnect once or use Print.'));};
   document.head.append(script);
  });
  loaded.set(name,promise);
  return promise;
 }
 async function fontsFor(pdf){
  const kit=await loadScript('vendor/fontkit-1.1.1.umd.min.js','fontkit');
  pdf.registerFontkit(kit);
  const names=['NotoSerif-Regular.ttf','NotoNaskhArabic-Regular.ttf'];
  const bytes=await Promise.all(names.map(async name=>{
   const response=await fetch(assetUrl('vendor/'+name),{credentials:'same-origin'});
   if(!response.ok)throw Error('Local Unicode font not available: '+name);
   return response.arrayBuffer();
  }));
  const [latin,arabic]=await Promise.all(bytes.map(bytes=>pdf.embedFont(bytes,{subset:false})));
  return {latin,arabic,latinCodes:new Set(latin.getCharacterSet()),arabicCodes:new Set(arabic.getCharacterSet()),missing:new Set()};
 }
 function canDraw(c,fontCodes){return fontCodes.has(c.codePointAt(0));}
 function runsOf(text,fonts,size){
  let run=null;const out=[];
  for(const char of String(text)){
   const cp=char.codePointAt(0);
   if(cp<32||cp===0x7f||cp>=0x200e&&cp<=0x200f||cp>=0x202a&&cp<=0x202e||cp>=0x2066&&cp<=0x2069)continue;
   const isArabic=/[\u0600-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF]/u.test(char);
   let font=isArabic?fonts.arabic:fonts.latin;
   if(!canDraw(char,isArabic?fonts.arabicCodes:fonts.latinCodes)){
    font=isArabic?fonts.latin:fonts.arabic;
    if(!canDraw(char,isArabic?fonts.latinCodes:fonts.arabicCodes)){
     if(!/\s/u.test(char))fonts.missing.add(char);
     font=fonts.latin;
    }
   }
   const value=canDraw(char,font===fonts.latin?fonts.latinCodes:fonts.arabicCodes)?char:'?';
   // The invisible search layer uses unshaped individual Arabic codepoints.
   // A shaped whole word exposes glyph IDs in display order, not the reader's
   // logical Unicode sequence. The visible text is drawn separately by Canvas.
   if(font===fonts.arabic&&/[\u0600-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF]/u.test(char)){
    run=null;out.push({font,text:value});continue;
   }
   if(run?.font===font)run.text+=value;
   else{run={font,text:value};out.push(run);}
  }
  return out.map(part=>({...part,width:part.font.widthOfTextAtSize(part.text,size)}));
 }
 function textWidth(value,fonts,size){
  return runsOf(value,fonts,size).reduce((sum,r)=>sum+r.width,0);
 }
 function wrapOne(paragraph,fonts,size,max){
  const lines=[],words=paragraph.match(/\S+|\s+/gu)||[],widths=new Map();
  const width=s=>{if(!widths.has(s))widths.set(s,textWidth(s,fonts,size));return widths.get(s);};
  let line='';
  function flush(){if(line){lines.push(line.trimEnd());line='';}}
  function appendLong(word){
   for(const char of Array.from(word)){
    if(line&&width(line+char)>max)flush();
    line+=char;
   }
  }
  for(const word of words){
   if(/^\s+$/u.test(word)){if(line&&!line.endsWith(' '))line+=' ';continue;}
   const candidate=line+word;
   if(width(candidate)<=max){line=candidate;continue;}
   if(line.trim())flush();
   if(width(word)<=max){line=word;continue;}
   appendLong(word);
  }
  flush();
  return lines.length?lines:[''];
 }
 function articleBlocks(root){
  const articles=[...root.querySelectorAll('#gn-rd-print-sheet-body > article')];
  const result=[];
  for(const article of articles){
   for(const node of article.children){
    const c=node.classList;
    if(node.tagName==='H2'){result.push({type:'section',text:node.textContent||''});continue;}
    if(c.contains('gn-rd-print-bilingual')){
     for(const side of node.children){
      result.push({type:'text',lang:side.getAttribute('lang')||'en',text:side.textContent||''});
     }
    }else if(c.contains('gn-rd-print-personal')){
     const head=node.querySelector('h3'),body=node.querySelector('p'),date=node.querySelector('small');
     if(head)result.push({type:'note-title',text:head.textContent||''});
     if(body)result.push({type:'note',text:body.textContent||''});
     if(date)result.push({type:'date',text:date.textContent||''});
    }else if(node.tagName==='BLOCKQUOTE'){
     result.push({type:'quote',lang:node.getAttribute('lang')||'en',text:node.textContent||''});
    }else if(c.contains('gn-rd-print-url')){
     result.push({type:'source',text:node.textContent||''});
    }else if(c.contains('gn-rd-print-unavailable')){
     result.push({type:'archive',text:node.textContent||''});
    }else if(node.textContent?.trim()){
     result.push({type:'text',text:node.textContent});
    }
   }
  }
  return result;
 }

 const ARABIC_GLYPH=/[\u0600-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u;
 const ARABIC_SPANS=/[\u0600-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/gu;
 // A blank Type3 font with explicit ToUnicode mappings is used only for
 // invisible Arabic search text; the visible typography stays Canvas-shaped.
 function makeArabicSearchFont(lib,pdf,blocks){
  const {PDFName}=lib,chars=[...new Set(blocks.flatMap(
   b=>Array.from(String(b.text||'')).filter(ch=>ARABIC_GLYPH.test(ch))
  ))];
  if(!chars.length)return null;
  if(chars.length>250)throw Error('Too many distinct Arabic characters; use Print or select fewer items.');
  const proc=pdf.context.register(pdf.context.flateStream(new TextEncoder().encode('0 0 d0\n')));
  const names={},diff=[1],map=new Map();
  chars.forEach((ch,i)=>{
   const id=i+1,name='g'+id;map.set(ch,id);names[name]=proc;diff.push(PDFName.of(name));
  });
  const cmap='/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n'+
   '/CIDSystemInfo << /Registry (Gnamma) /Ordering (ArabicUnicode) /Supplement 0 >> def\n'+
   '/CMapName /GnammaArabicUnicode def\n/CMapType 2 def\n'+
   '1 begincodespacerange\n<00> <FF>\nendcodespacerange\n'+
   chars.length+' beginbfchar\n'+
   chars.map((ch,i)=>'<'+(i+1).toString(16).padStart(2,'0')+'> <'+
     ch.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')+'>').join('\n')+
   '\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend\n';
  const table=pdf.context.register(pdf.context.flateStream(new TextEncoder().encode(cmap)));
  const face=pdf.context.obj({
   Type:PDFName.of('Font'),Subtype:PDFName.of('Type3'),
   Name:PDFName.of('GNUnicode'),FontBBox:[0,0,1000,1000],
   FontMatrix:[.001,0,0,.001,0,0],CharProcs:pdf.context.obj(names),
   Encoding:pdf.context.obj({Type:PDFName.of('Encoding'),Differences:diff}),
   FirstChar:1,LastChar:chars.length,Widths:chars.map(()=>500),
   Resources:pdf.context.obj({}),ToUnicode:table
  });
  return {ref:pdf.context.register(face),map};
 }
 function drawArabicSearch(lib,page,font,raw,x,y,size){
  if(!font||!raw)return;
  const {PDFName,PDFNumber,PDFOperator,PDFHexString}=lib;
  const bytes=Array.from(raw).reverse().map(ch=>{
   const code=font.map.get(ch);
   if(!code)throw Error('Arabic search text contained an unmapped character.');
   return code.toString(16).padStart(2,'0');
  }).join('');
  page.pushOperators(
   PDFOperator.of('BT'),
   PDFOperator.of('Tf',[PDFName.of('GNUnicode'),PDFNumber.of(size)]),
   PDFOperator.of('Tr',[PDFNumber.of(3)]),
   PDFOperator.of('Tm',[PDFNumber.of(1),PDFNumber.of(0),PDFNumber.of(0),PDFNumber.of(1),PDFNumber.of(x),PDFNumber.of(y)]),
   PDFOperator.of('Tj',[PDFHexString.of(bytes)]),
   PDFOperator.of('ET')
  );
 }
 async function displayFonts(){
  if(typeof FontFace!=='function')throw Error('Canvas Unicode fonts are unavailable in this browser; use Print.');
  const defs=[['GnammaDeskLatin','vendor/NotoSerif-Regular.ttf'],['GnammaDeskArabic','vendor/NotoNaskhArabic-Regular.ttf']];
  const found=await Promise.all(defs.map(async ([family,url])=>{
   const face=new FontFace(family,'url("'+assetUrl(url)+'")');
   const ready=await face.load();document.fonts.add(ready);return ready;
  }));
  await Promise.all([
   document.fonts.load('24px GnammaDeskLatin'),
   document.fonts.load('28px GnammaDeskArabic')
  ]);
  return found;
 }
 async function makePdf(printRoot){
  if(!printRoot||!printRoot.isConnected)throw Error('Open your Reading Desk print preview first.');
  const blocks=articleBlocks(printRoot);
  if(!blocks.length)throw Error('There is nothing to include in this PDF.');
  const total=blocks.reduce((sum,b)=>sum+b.text.length,0);
  if(total>MAX_CHARS)throw Error('The compilation is too large for this device. Print or select fewer items; no text has been discarded.');
  const lib=await loadScript('vendor/pdf-lib-1.17.1.min.js','PDFLib');
  await displayFonts();
  const pdf=await lib.PDFDocument.create();
  pdf.setTitle('Darūrī · Reading Desk');
  pdf.setSubject('Personal saved passages and reading notes');
  pdf.setProducer('Gnamma Research · local Reading Desk exporter');
  const fonts=await fontsFor(pdf),arabicFont=makeArabicSearchFont(lib,pdf,blocks),pages=[],SIZE=2,W=Math.round(A4.w*SIZE),H=Math.round(A4.h*SIZE);
  const pad=86,maxTextWidth=W-2*pad,maxY=H-105;
  let sheet=null,lineCount=0,textRuns=0;
  function freshSheet(){
   const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
   const c=canvas.getContext('2d',{alpha:false});
   if(!c)throw Error('Cannot render the Unicode PDF on this device. Use Print.');
   c.fillStyle='#fff';c.fillRect(0,0,W,H);
   sheet={canvas,c,y:94,lines:[]};
  }
  function fontFor(block){
   const s=String(block.text||'');
   const arabic=(s.match(/[\u0600-\u08ff]/g)||[]).length,latin=(s.match(/[A-Za-z]/g)||[]).length;
   const rtl=block.lang==='ar'||(arabic>latin*.65&&arabic>0);
   const kind=block.type;
   const size=kind==='section'?31:kind==='note-title'?25:
    kind==='source'||kind==='date'||kind==='archive'?17:rtl?28:22;
   const font=(rtl?'GnammaDeskArabic':'GnammaDeskLatin');
   const lineHeight=rtl?46:kind==='section'?46:kind==='note-title'?36:kind==='date'||kind==='source'?27:34;
   const top=kind==='section'?30:kind==='note-title'?16:8;
   const after=kind==='source'?29:kind==='section'?13:8;
   return {rtl,size,font,lineHeight,top,after};
  }
  function chunkWord(c,word,max){
   const pieces=[];let buf='';
   for(const ch of Array.from(word)){
    if(buf&&c.measureText(buf+ch).width>max){pieces.push(buf);buf='';}
    buf+=ch;
   }
   if(buf)pieces.push(buf);
   return pieces;
  }
  function wrap(c,text){
   const output=[],words=String(text).split(/\s+/u).filter(Boolean);let current='';
   for(const word of words){
    const bits=c.measureText(word).width>maxTextWidth?chunkWord(c,word,maxTextWidth):[word];
    for(const part of bits){
     const candidate=current?current+' '+part:part;
     if(current&&c.measureText(candidate).width>maxTextWidth){output.push(current);current=part;}
     else current=candidate;
    }
   }
   if(current)output.push(current);
   return output.length?output:[''];
  }
  async function flush(){
   if(!sheet)return;
   if(pages.length>=MAX_PAGES)throw Error('The generated PDF exceeds '+MAX_PAGES+' pages. Choose fewer items or use Print.');
   const c=sheet.c;c.save();c.font='17px GnammaDeskLatin';c.fillStyle='#555';c.direction='ltr';
   c.textAlign='left';c.fillText('GNAMMA · PERSONAL READING DESK',pad,H-52);
   c.textAlign='right';c.fillText(String(pages.length+1),W-pad,H-52);c.restore();
   const jpeg=await new Promise((resolve,reject)=>{
    sheet.canvas.toBlob(blob=>blob?blob.arrayBuffer().then(resolve,reject):reject(Error('Could not render the PDF page')),
     'image/jpeg',.94);
   });
   const img=await pdf.embedJpg(jpeg),page=pdf.addPage([A4.w,A4.h]);
   page.drawImage(img,{x:0,y:0,width:A4.w,height:A4.h});
   // The image page retains searchable, selectable Unicode underneath.
   // Arabic uses an exact ToUnicode CMap instead of FontKit ligature mapping.
   if(arabicFont)page.node.setFontDictionary(lib.PDFName.of('GNUnicode'),arabicFont.ref);
   for(const entry of sheet.lines){
    if(!entry.text.trim())continue;
    const size=Math.min(17,entry.size/SIZE),y=A4.h-entry.y/SIZE;
    const latinOnly=entry.text.replace(ARABIC_SPANS,'');
    const runs=runsOf(latinOnly,fonts,size);
    const width=runs.reduce((sum,r)=>sum+r.width,0);
    let x=entry.rtl?A4.w-pad/SIZE-width:pad/SIZE;
    for(const run of runs){if(run.text){
     page.drawText(run.text,{x,y,font:run.font,size,opacity:0});
     textRuns++;
    }x+=run.width;}
    if(arabicFont){
     const matches=[...entry.text.matchAll(ARABIC_SPANS)];
     for(let i=0;i<matches.length;i++){
      drawArabicSearch(lib,page,arabicFont,matches[i][0],pad/SIZE+(i%8)*12,y,size);
      textRuns++;
     }
    }
   }
   pages.push(page);sheet=null;
  }
  freshSheet();
  async function draw(block){
   const content=String(block.text||'').replace(/\r\n?/g,'\n');
   const f=fontFor(block),c=sheet.c;
   for(const part of content.split('\n')){
    c.font=f.size+'px '+f.font;
    const lines=part.trim()?wrap(c,part):[''];
    if(sheet.y+f.top+f.lineHeight>maxY){await flush();freshSheet();}
    sheet.y+=f.top;
    for(const text of lines){
     if(sheet.y+f.lineHeight>maxY){await flush();freshSheet();}
     c.save();c.fillStyle='#24312c';c.font=f.size+'px '+f.font;
     c.textBaseline='alphabetic';c.direction=f.rtl?'rtl':'ltr';
     c.textAlign=f.rtl?'right':'left';
     c.fillText(text,f.rtl?W-pad:pad,sheet.y);
     c.restore();
     sheet.lines.push({text,size:f.size,rtl:f.rtl,y:sheet.y});
     lineCount++;sheet.y+=f.lineHeight;
    }
   }
   sheet.y+=f.after;
  }
  await draw({type:'section',text:'DARURI / READING DESK'});
  await draw({type:'date',text:'Personal saved passages and notes'});
  for(const block of blocks)await draw(block);
  await flush();
  const bytes=await pdf.save({useObjectStreams:true});
  return {blob:new Blob([bytes],{type:'application/pdf'}),pages:pages.length,
   warnings:[...fonts.missing],textRuns,lineCount};
 }
 window.GnammaDeskPdf={makePdf,articleBlocks};
})();