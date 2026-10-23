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
   throw Error('The canonical Arabic/English source fixture is invalid');
 const rows=[],ids=new Set();
 for(const section of fixture.full_sections){
  for(const segment of section.segments){
   const phrase=linePhrase(segment);
   if(!phrase||!phrase.match(/[\u0600-\u06FF]/u)||ids.has(segment.id))
     throw Error('Missing or duplicate Arabic authorial passage '+segment.id);
   rows.push({id:segment.id,phrase,section:section.id});
   ids.add(segment.id);
  }
 }
 if(rows.length!==414||ids.size!==414)
   throw Error('Source coverage lost: '+rows.length+' /414');
 return rows;
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
    if(!glyph?.id||cp>0xffff)throw Error('Missing original Arabic scalar U+'+cp.toString(16));
    const cid=i+1;
    codes.set(units[i],cid);
    gid[cid*2]=glyph.id>>8;gid[cid*2+1]=glyph.id&255;
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
  // Native fontkit HarfBuzz layout preserves shaping and vowel positioning.
  // These are genuine PDF vector path operators, NOT a raster screenshot
  // and NOT a corrupted text-show (Tj/TJ) instruction.
  const shaped=kitFont.layout(phrase,'arab',undefined,'rtl');
  const factor=size/kitFont.unitsPerEm;
  const total=shaped.positions.reduce((s,p)=>s+p.xAdvance,0)*factor;
  let cursor=x;
  let nonempty=0;
  for(let i=0;i<shaped.glyphs.length;i++){
    const glyph=shaped.glyphs[i],pos=shaped.positions[i];
    const path=glyph.path.toSVG();
    if(path && path.length>2){
      page.drawSvgPath(path,{
        x:cursor+pos.xOffset*factor,
        y:y+pos.yOffset*factor,
        scale:factor,
        color:rgb(.12,.19,.18)
      });
      nonempty++;
    }
    cursor+=pos.xAdvance*factor;
  }
  if(nonempty===0||!(total>3))throw Error('Arabic outline painting is empty');
  return {drawn_glyphs:nonempty,advance_pt:total};
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
  emitStatus('loading','Reading all 414 canonical Arabic source passages from local HTML fixture...');
  const [sourceReq,fontReq]=await Promise.all([
   fetch(SOURCE_URL,{cache:'no-store',credentials:'same-origin'}),
   fetch(FONT_URL,{cache:'no-store',credentials:'same-origin'})
  ]);
  if(!sourceReq.ok||!fontReq.ok)throw Error('Source or Arabic font unavailable on local origin');
  const fixture=await sourceReq.json();
  const fontBytes=new Uint8Array(await fontReq.arrayBuffer());
  const rows=authorialRows(fixture);
  document.querySelectorAll('[data-vector-generated="true"]').forEach(x=>x.remove());
  const pages=[];
  for(let first=0;first<rows.length;first+=12){
   const domPage=first===0?pageElement:pageElement.cloneNode(true);
   if(first){
    domPage.removeAttribute('id');
    domPage.dataset.vectorGenerated='true';
    document.body.append(domPage);
   }
   const target=domPage.querySelector('.vector-rows');
   if(!target)throw Error('Missing offscreen HTML page for source layout');
   target.replaceChildren();
   const spans=[];
   for(const row of rows.slice(first,first+12)){
    const div=elt('div','row','');
    div.dataset.id=row.id;
    const span=elt('span','phrase',row.phrase);
    div.append(span);
    target.append(div);
    spans.push({row,span});
   }
   pages.push({domPage,spans});
  }
  await document.fonts.load('23px "Noto Naskh Arabic"','وَفِي أَلْفَاظِهِ');
  await document.fonts.ready;
  if(!document.fonts.check('23px "Noto Naskh Arabic"'))
   throw Error('Native source Noto font is not available to the original HTML DOM');
  emitStatus('drawing','Outlining glyphs with the original browser word geometry...');
  const pdf=await PDFDocument.create();
  pdf.setTitle('Daruri 414 original source openings, vector Unicode QA, not published');
  const english=await pdf.embedFont(StandardFonts.Helvetica);
  const signed=signedArabicFont(pdf,fontkit,fontBytes,rows.map(row=>row.phrase));
  const positions=[];
  for(let pageNumber=0;pageNumber<pages.length;pageNumber++){
   const {domPage,spans}=pages[pageNumber];
   const bounds=domPage.getBoundingClientRect();
   const page=pdf.addPage([595.28,841.89]);
   page.node.setFontDictionary(PDFName.of('GNOriginal'),signed.ref);
   page.drawText('GNAMMA | 414 ORIGINAL SOURCE OPENINGS | NONRELEASE QA',
    {x:35,y:815,size:9,font:english});
   for(const {row,span} of spans){
    const rect=span.getBoundingClientRect();
    if(!rect.width||!rect.height)throw Error('Unlaid source HTML span '+row.id);
    const fontSize=23*.75;
    const layout=signed.parsed.layout(row.phrase,'arab',undefined,'rtl');
    const advance=layout.positions.reduce((sum,p)=>sum+p.xAdvance,0)*
      fontSize/signed.parsed.unitsPerEm;
    const right=(rect.right-bounds.left)*.75;
    const x=right-advance;
    const y=page.getHeight()-(rect.top-bounds.top)*.75-fontSize*1.05;
    if(x<15||right>page.getWidth()-10||y<50||y>page.getHeight()-30)
     throw Error('Source phrase outside A4 body: '+row.id);
    page.drawText(row.id,{x:270,y:y+4.5,size:8,font:english});
    const visible=drawSourceGlyphs(page,signed.parsed,row.phrase,x,y,fontSize);
    const text=drawOnlyOriginalUnicode(page,signed,row.phrase,x,y,fontSize,advance);
    positions.push({id:row.id,section:row.section,phrase:row.phrase,
     page:pageNumber+1,x,y,width:advance,height:fontSize*1.5,
     ...visible,...text});
   }
   if((pageNumber+1)%5===0){
    emitStatus('drawing','Authorial opening phrases '+positions.length+'/414; PDF page '+(pageNumber+1));
   }
  }
  if(positions.length!==414||pdf.getPageCount()!==Math.ceil(414/12))
   throw Error('The original Arabic opening phrase coverage is incomplete');
  const bytes=new Uint8Array(await pdf.save({useObjectStreams:false}));
  if(String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')
   throw Error('The browser did not produce PDF bytes');
  const filename='daruri-vector-original-414-openings-NONRELEASE.pdf';
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  const a=document.createElement('a');
  a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
  window.__gnammaVectorPdfBytes=bytes;
  emitStatus('done','Original 414 phrase openings rendered locally across '+pdf.getPageCount()+' pages.',{
   source_sha256:fixture.source_sha256,font_sha256:await digest(fontBytes),
   bytes:bytes.length,pdf_pages:pdf.getPageCount(),
   authorial_sections:258,authorial_segments:414,original_opening_positions:positions,
   single_exact_unicode_cid_per_opening:true,glyph_outlines_not_raster:true,
   original_published_pdf_inputs:0,full_authorial_paragraphs_represented:false,
   complete_study_footnotes:false,individual_word_selection_certified:false,
   page_layout_equivalent_to_published_books:false,publication_approved:false
  });
 }catch(error){
  emitStatus('failed',String(error?.stack||error),{error:String(error)});
  console.error('GNAMMA_VECTOR_ALL_OPENINGS_FAILURE',error);
 }finally{makeButton.disabled=false;}
}
makeButton.addEventListener('click',()=>void generate());
window.__gnammaVectorStatus={phase:'ready',logical_order:logicalOrder};