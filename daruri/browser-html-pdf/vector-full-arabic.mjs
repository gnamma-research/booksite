/* RESEARCH ONLY: the original painted Arabic is vector outlines, NOT text.
 * Its sole searchable/copyable text is an exact logical CID-to-Unicode layer.
 * Unlike the previous overlay experiment, there is no second broken Arabic
 * text stream underneath. Eleven canonical phrases + one §65 note stress case.
 * This does not reconstruct the approved book, headings or Study notes.
 */
import {
  PDFDocument, StandardFonts, PDFName, PDFString, PDFNumber,
  PDFHexString, PDFOperator, rgb
} from '@pdfme/pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const FONT_URL='/daruri/build/fonts/NotoNaskhArabic-Regular.ttf';
const SOURCE_URL='/daruri/browser-html-pdf/fixture.json';
const pageElement=document.getElementById('vector-page');
const listElement=document.getElementById('vector-rows');
const statusElement=document.getElementById('qa-status');
const makeButton=document.getElementById('make');
const requestedOrder=new URL(location.href).searchParams.get('order');
const logicalOrder='phrase';
const emitStatus=(phase,message,other={})=>{
  statusElement.textContent=message;
  window.__gnammaVectorStatus={phase,message,logical_order:logicalOrder,...other};
};
const hex=bytes=>[...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
const digest=async data=>hex(await crypto.subtle.digest('SHA-256',data));
const linePhrase=seg=>String(seg.arabic).trim().split(/\s+/u).slice(0,2).join(' ');
const elt=(tag,className,text)=>{
  const node=document.createElement(tag);node.className=className;node.textContent=text;
  return node;
};

function authorialRows(fixture){
 if(fixture?.schema!=='daruri-real-source-browser-pdf-stress-v1'||
    fixture?.authorial_sections!==258||fixture?.authorial_passages!==414)
   throw Error('Untrusted source fixture: complete 258 section / 414 passage structure required');
 const rows=[],ids=new Set();
 for(const section of fixture.full_sections){
  for(const segment of section.segments){
   const source=String(segment.arabic||'').trim().replace(/\s+/gu,' ');
   const id=segment.id;
   if(!source||!source.match(/[\u0600-\u06FF]/u)||ids.has(id))
     throw Error('Original Arabic source text is missing or duplicated: '+id);
   ids.add(id);
   rows.push({id,source,section:section.id});
  }
 }
 if(rows.length!==414||ids.size!==414)
   throw Error('Full authorial Arabic passage count changed');
 return rows;
}

// Split only at real original word boundaries; no retranslation, discarded
// glyph or invented vowel. Keep a short (<128 Unicode scalar) ToUnicode
// mapping per PDF line and a reliable A4 text width. Full paragraph-level
// mapping and individual word highlights remain separate acceptance gates.
function splitOriginalIntoLines(text,kitFont,size){
 const maxWidth=365,maxScalars=110;
 const words=text.split(' ');
 const measure=s=>kitFont.layout(s,'arab',undefined,'rtl').positions.reduce(
   (sum,p)=>sum+p.xAdvance,0)*size/kitFont.unitsPerEm;
 const lines=[];
 let current='';
 for(const word of words){
  if(!word)throw Error('Empty word in canonical source');
  if(Array.from(word).length>maxScalars||measure(word)>maxWidth)
   throw Error('Canonical Arabic original contains an unbreakable word exceeding verified line width');
  const candidate=current?current+' '+word:word;
  if(current&&(Array.from(candidate).length>maxScalars||measure(candidate)>maxWidth)){
   lines.push(current);
   current=word;
  }else current=candidate;
 }
 if(current)lines.push(current);
 if(!lines.length||lines.join(' ')!==text)
  throw Error('Original authorial Arabic words were lost or changed during line wrapping');
 return lines;
}

function signedArabicFont(pdf,kit,fontBytes,phrases){
  // Same CIDFontType2 / CIDToGIDMap principle as Gnamma's tested personal
  // appendix exporter. A separate phrase-atomic A/B keeps all original
  // vowel marks together in a single ToUnicode mapping, while the glyphs
  // remain independently painted as vector paths (never duplicate text).
  const parsed=kit.create(fontBytes);
  const units=logicalOrder==='phrase'?[...new Set(phrases)]
    :[...new Set([...phrases.join('')])];
  if(units.length>=65534)throw Error('CID Unicode set too large');
  const codes=new Map(),gid=new Uint8Array((units.length+1)*2);
  for(let i=0;i<units.length;i++){
    const cp=units[i].codePointAt(0),glyph=parsed.glyphForCodePoint(cp);
    // A phrase is invisible in this semantic font. Its CIDToGIDMap may safely
    // point to the existing alef glyph when the first original character is
    // outside Naskh (notably U+27E8). The independent ToUnicode association
    // still records the exact entire original phrase.
    const semanticGlyph=glyph?.id?glyph:parsed.glyphForCodePoint(0x0627);
    if(!semanticGlyph?.id||cp>0xffff)
      throw Error('Cannot encode the original logical source at U+'+cp.toString(16));
    const cid=i+1;
    codes.set(units[i],cid);
    gid[cid*2]=semanticGlyph.id>>8;gid[cid*2+1]=semanticGlyph.id&255;
  }
  const fileRef=pdf.context.register(pdf.context.flateStream(fontBytes));
  const descriptor=pdf.context.register(pdf.context.obj({
    Type:PDFName.of('FontDescriptor'),FontName:PDFName.of('GnammaVectorOriginalCID'),
    Flags:4,FontBBox:[-400,-500,1600,1600],ItalicAngle:0,
    Ascent:1069,Descent:-634,CapHeight:1000,StemV:80,FontFile2:fileRef
  }));
  const gidRef=pdf.context.register(pdf.context.flateStream(gid));
  const descendant=pdf.context.register(pdf.context.obj({
    Type:PDFName.of('Font'),Subtype:PDFName.of('CIDFontType2'),
    BaseFont:PDFName.of('GnammaVectorOriginalCID'),
    CIDSystemInfo:pdf.context.obj({Registry:PDFString.of('Adobe'),
      Ordering:PDFString.of('Identity'),Supplement:0}),
    FontDescriptor:descriptor,DW:500,CIDToGIDMap:gidRef
  }));
  const lines=[
    '/CIDInit /ProcSet findresource begin','12 dict begin','begincmap',
    '/CIDSystemInfo << /Registry (Gnamma) /Ordering (ExactOriginal) /Supplement 0 >> def',
    '/CMapName /GnammaVectorUnicode def','/CMapType 2 def',
    '1 begincodespacerange','<0000> <FFFF>','endcodespacerange'
  ];
  for(let offset=0;offset<units.length;offset+=100){
    const slice=units.slice(offset,offset+100);
    lines.push(String(slice.length)+' beginbfchar');
    for(let k=0;k<slice.length;k++){
      const cid=(offset+k+1).toString(16).padStart(4,'0').toUpperCase();
      const original=Array.from(slice[k]).map(ch=>{
        const cp=ch.codePointAt(0);
        if(cp>0xffff)throw Error('Unexpected non-BMP character in the canonical Arabic micro-proof');
        return cp.toString(16).padStart(4,'0').toUpperCase();
      }).join('');
      if(original.length>512)throw Error('This phrase exceeds PDF ToUnicode entry limit');
      lines.push('<'+cid+'> <'+original+'>');
    }
    lines.push('endbfchar');
  }
  lines.push('endcmap','CMapName currentdict /CMap defineresource pop','end','end');
  const unicodeRef=pdf.context.register(pdf.context.flateStream(
    new TextEncoder().encode(lines.join('\n')+'\n')));
  const type0=pdf.context.register(pdf.context.obj({
    Type:PDFName.of('Font'),Subtype:PDFName.of('Type0'),
    BaseFont:PDFName.of('GnammaVectorOriginalCID'),
    Encoding:PDFName.of('Identity-H'),
    DescendantFonts:[descendant],ToUnicode:unicodeRef
  }));
  return {ref:type0,codes,parsed};
}

function drawSourceGlyphs(page,kitFont,phrase,x,y,size){
  // Paint original shaped Arabic only as PDF vector paths. The authorial
  // Unicode is written once in an entirely separate, invisible ToUnicode CID.
  // The canonical corpus contains exactly two unsupported punctuation marks:
  // U+27E8 (mathematical left angle bracket) and U+27E9 (right), 12 each.
  // Their mathematical-bracket outlines are constructed with vector strokes;
  // neither the visible glyph nor the semantic character may be silently lost.
  const shaped=kitFont.layout(phrase,'arab',undefined,'rtl');
  const factor=size/kitFont.unitsPerEm;
  const total=shaped.positions.reduce((sum,p)=>sum+p.xAdvance,0)*factor;
  let cursor=x,nonempty=0;
  const manualMathBrackets=[];
  for(let i=0;i<shaped.glyphs.length;i++){
    const glyph=shaped.glyphs[i],pos=shaped.positions[i];
    if(!glyph?.id){
      const unicodeCandidates=Array.isArray(glyph?.codePoints)?glyph.codePoints:[];
      const fromCluster=Number.isInteger(shaped.stringIndices?.[i])
        ?phrase.codePointAt(shaped.stringIndices[i]):undefined;
      // The fontkit .notdef glyph object is reused across missing symbols
      // and codePoints can identify the *first* absent character forever.
      // Source stringIndices, not glyph.codePoints, is authoritative here.
      const cp=(fromCluster===0x27e8||fromCluster===0x27e9)
        ?fromCluster:unicodeCandidates.find(ch=>ch===0x27e8||ch===0x27e9);
      if(cp!==0x27e8&&cp!==0x27e9)
        throw Error('Unresolved original visible font glyph U+'+
          (cp??0).toString(16).toUpperCase()+' in '+phrase.slice(0,55));
      const advance=Math.max(3.5,pos.xAdvance*factor),mid=cursor+pos.xOffset*factor+advance/2;
      const left=mid-Math.min(advance*.38,size*.24),right=mid+Math.min(advance*.38,size*.24);
      const top=y+size*.84,bottom=y-size*.30,half=(top+bottom)/2;
      const points=cp===0x27e8?[
        [{x:right,y:top},{x:left,y:half}],
        [{x:left,y:half},{x:right,y:bottom}]
      ]:[
        [{x:left,y:top},{x:right,y:half}],
        [{x:right,y:half},{x:left,y:bottom}]
      ];
      for(const [a,b] of points)
        page.drawLine({start:a,end:b,thickness:Math.max(.7,size*.057),
          color:rgb(.12,.19,.18)});
      manualMathBrackets.push(cp);
      nonempty++;
    }else{
      const path=glyph.path.toSVG();
      if(path&&path.length>2){
        page.drawSvgPath(path,{
          x:cursor+pos.xOffset*factor,y:y+pos.yOffset*factor,
          scale:factor,color:rgb(.12,.19,.18)
        });
        nonempty++;
      }
    }
    cursor+=pos.xAdvance*factor;
  }
  if(nonempty===0||!(total>3))throw Error('Arabic outline painting produced no visible geometry');
  return {drawn_glyphs:nonempty,advance_pt:total,manualMathBrackets};
}

function drawOnlyOriginalUnicode(page,font,phrase,x,y,size,visibleWidth){
  // PDFKit indexes reversed scalar order for Arabic shaped RTL; the forward
  // control is independently generated in CI, rather than assumed correct.
  // Preserve the source's base+harakat grapheme associations. Reversing
  // scalars alone moves the final diacritic to the start of each PDF word.
  // This third, genuinely different test compares source-grapheme reversal
  // against the earlier forward and scalar-reversed control PDFs.
  const sequenced=logicalOrder==='grapheme'
    ?Array.from(new Intl.Segmenter('ar',{granularity:'grapheme'}).segment(phrase),
      part=>part.segment).reverse().join('')
    :logicalOrder==='reverse'?Array.from(phrase).reverse().join(''):phrase;
  // A phrase-atomic ToUnicode CID prevents a native RTL extractor from
  // moving one word's final haraka to the beginning of another. This is
  // a research trade-off: per-word selection is not yet certified.
  const cps=logicalOrder==='phrase'?[phrase]:Array.from(sequenced);
  const encoded=cps.map(ch=>{
    const code=font.codes.get(ch);
    if(!code)throw Error('Unicode layer dropped scalar '+ch.codePointAt(0).toString(16));
    return code.toString(16).padStart(4,'0');
  }).join('');
  const nativeWidth=cps.length*size*.5;
  const hz=Math.min(logicalOrder==='phrase'?2500:150,
    Math.max(20,100*visibleWidth/nativeWidth));
  page.pushOperators(
    PDFOperator.of('BT'),
    PDFOperator.of('Tf',[PDFName.of('GNOriginal'),PDFNumber.of(size)]),
    PDFOperator.of('Tr',[PDFNumber.of(3)]),
    PDFOperator.of('Tz',[PDFNumber.of(hz)]),
    PDFOperator.of('Tm',[
      PDFNumber.of(1),PDFNumber.of(0),PDFNumber.of(0),PDFNumber.of(1),
      PDFNumber.of(x),PDFNumber.of(y)]),
    PDFOperator.of('Tj',[PDFHexString.of(encoded)]),
    PDFOperator.of('ET')
  );
  return {cid_count:cps.length,horizontal_scale_percent:hz};
}

async function generate(){
 makeButton.disabled=true;
 try{
  emitStatus('loading','Loading all 414 original Arabic paragraphs and the locally embedded font...');
  const [sr,fr]=await Promise.all([
   fetch(SOURCE_URL,{cache:'no-store',credentials:'same-origin'}),
   fetch(FONT_URL,{cache:'no-store',credentials:'same-origin'})
  ]);
  if(!sr.ok||!fr.ok)throw Error('Same-origin canonical source or Noto glyph font unavailable');
  const fixture=await sr.json(),fontBytes=new Uint8Array(await fr.arrayBuffer());
  const rows=authorialRows(fixture);
  const parsed=fontkit.create(fontBytes);
  const fontSize=23*.75;
  const sourceLines=[];
  for(const row of rows){
   const paragraphs=splitOriginalIntoLines(row.source,parsed,fontSize);
   for(let i=0;i<paragraphs.length;i++){
    const phrase=paragraphs[i];
    sourceLines.push({id:row.id,section:row.section,phrase,
     line:i+1,lines:paragraphs.length,
     unique_line_id:row.id+'-L'+String(i+1).padStart(3,'0')});
   }
  }
  if(sourceLines.length<414||new Set(sourceLines.map(x=>x.id)).size!==414)
   throw Error('Not all original paragraphs were retained in browser line breaking');
  document.querySelectorAll('[data-vector-generated="true"]').forEach(x=>x.remove());
  const chunks=[];
  // Each A4 body uses twelve 62px single-line rows, leaving a real margin for
  // headers, original passage identities, and a future apparatus design.
  for(let i=0;i<sourceLines.length;i+=12){
   const page=i===0?pageElement:pageElement.cloneNode(true);
   if(i){
    page.removeAttribute('id');page.dataset.vectorGenerated='true';
    document.body.append(page);
   }
   const container=page.querySelector('.vector-rows');
   if(!container)throw Error('Lost HTML source-page layout');
   container.replaceChildren();
   const spans=[];
   for(const record of sourceLines.slice(i,i+12)){
    const rowElement=elt('div','row','');
    rowElement.dataset.id=record.unique_line_id;
    const span=elt('span','phrase',record.phrase);
    rowElement.append(span);
    container.append(rowElement);
    spans.push({record,span});
   }
   chunks.push({page,spans});
  }
  await document.fonts.load('23px "Noto Naskh Arabic"','وَفِي أَلْفَاظِهِ');
  await document.fonts.ready;
  if(!document.fonts.check('23px "Noto Naskh Arabic"'))
   throw Error('Original Arabic Noto font not used in the DOM');
  emitStatus('drawing','Painting '+sourceLines.length+' original Arabic lines as vector glyph outlines...');
  const pdf=await PDFDocument.create();
  pdf.setTitle('Daruri complete original Arabic paragraphs - original-source vector Unicode test, nonrelease');
  const english=await pdf.embedFont(StandardFonts.Helvetica);
  const signed=signedArabicFont(pdf,fontkit,fontBytes,sourceLines.map(x=>x.phrase));
  const recorded=[];
  for(let pageNumber=0;pageNumber<chunks.length;pageNumber++){
   const {page:domPage,spans}=chunks[pageNumber];
   const bounds=domPage.getBoundingClientRect();
   const pdfPage=pdf.addPage([595.28,841.89]);
   pdfPage.node.setFontDictionary(PDFName.of('GNOriginal'),signed.ref);
   pdfPage.drawText('GNAMMA | ALL ORIGINAL ARABIC PASSAGES | NONRELEASE VECTOR QA',
    {x:35,y:815,size:8.5,font:english});
   for(const {record,span} of spans){
    const rect=span.getBoundingClientRect();
    if(!rect.width||!rect.height)throw Error('HTML text did not layout: '+record.unique_line_id);
    const layout=signed.parsed.layout(record.phrase,'arab',undefined,'rtl');
    const advance=layout.positions.reduce((sum,p)=>sum+p.xAdvance,0)*
      fontSize/signed.parsed.unitsPerEm;
    const right=(rect.right-bounds.left)*.75;
    const x=right-advance;
    const y=pdfPage.getHeight()-(rect.top-bounds.top)*.75-fontSize*1.05;
    if(x<25||right>pdfPage.getWidth()-8||y<48||y>pdfPage.getHeight()-30)
     throw Error('Full original source line exceeds verified A4 geometry '+JSON.stringify(
       {id:record.unique_line_id,x,right,y}));
    // The source identifier appears only at the beginning of each paragraph.
    if(record.line===1)
      pdfPage.drawText(record.id,{x:35,y:y+4.5,size:7.8,font:english});
    const visual=drawSourceGlyphs(pdfPage,signed.parsed,record.phrase,x,y,fontSize);
    const semantic=drawOnlyOriginalUnicode(pdfPage,signed,record.phrase,x,y,fontSize,advance);
    recorded.push({...record,page:pageNumber+1,x,y,width:advance,height:fontSize*1.5,
      ...visual,...semantic});
   }
   if((pageNumber+1)%25===0){
    emitStatus('drawing','All original Arabic paragraphs: '+recorded.length+'/'+sourceLines.length+
      ' vector lines, '+(pageNumber+1)+' pages');
   }
  }
  if(recorded.length!==sourceLines.length||
     pdf.getPageCount()!==Math.ceil(sourceLines.length/12))
   throw Error('Original source line/PDF page count mismatch');
  const mathematicalFallbackCount=recorded.reduce(
    (sum,row)=>sum+row.manualMathBrackets.length,0);
  const leftAngleBrackets=recorded.reduce(
    (sum,row)=>sum+row.manualMathBrackets.filter(cp=>cp===0x27e8).length,0);
  const rightAngleBrackets=recorded.reduce(
    (sum,row)=>sum+row.manualMathBrackets.filter(cp=>cp===0x27e9).length,0);
  if(leftAngleBrackets!==12||rightAngleBrackets!==12)
    throw Error('Original source angle-bracket vectors not preserved 12+12: '+
      leftAngleBrackets+'+'+rightAngleBrackets);
  const expected=rows.map(x=>x.source).join('\n');
  const originalHash=await digest(new TextEncoder().encode(expected));
  const bytes=new Uint8Array(await pdf.save({useObjectStreams:false}));
  if(String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')
   throw Error('No browser-generated original Arabic PDF bytes');
  const filename='daruri-vector-full-original-arabic-NONRELEASE.pdf';
  const link=document.createElement('a'),href=URL.createObjectURL(
    new Blob([bytes],{type:'application/pdf'}));
  link.href=href;link.download=filename;document.body.append(link);
  link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(href),60000);
  window.__gnammaVectorPdfBytes=bytes;
  emitStatus('done','Rendered 414 complete original Arabic paragraphs into '+pdf.getPageCount()+
   ' vector pages. Research text QA and edition apparatus remain separate.',{
    source_sha256:fixture.source_sha256,
    font_sha256:await digest(fontBytes),
    original_arabic_text_sha256:originalHash,
    source_paragraphs:rows.length,source_line_count:sourceLines.length,
    vector_math_brackets_drawn:mathematicalFallbackCount,
    vector_math_left: leftAngleBrackets, vector_math_right:rightAngleBrackets,
    pages:pdf.getPageCount(),bytes:bytes.length,
    source_lines:recorded,
    full_authorial_arabic_word_content_represented:true,
    full_authorial_english_translations_represented:false,
    actual_publisher_study_notes_represented:false,
    exact_original_page_layout_certified:false,
    one_exact_unicode_cid_per_line:true,
    word_level_selection_certified:false,
    original_published_pdf_inputs:0,server_pdf_generation:false,
    printed_pdf_dialog:false,production_approved:false
   });
 }catch(error){
  emitStatus('failed',String(error?.stack||error),{error:String(error)});
  console.error('GNAMMA_VECTOR_FULL_ARABIC_FAILURE',error);
 }finally{makeButton.disabled=false;}
}
makeButton.addEventListener('click',()=>void generate());
window.__gnammaVectorStatus={phase:'ready',logical_order:logicalOrder};