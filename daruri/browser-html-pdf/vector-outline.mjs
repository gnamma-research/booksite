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
const logicalOrder=new URL(location.href).searchParams.get('order')==='forward'?'forward':'reverse';
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
    throw Error('The canonical 258-section / 414-passage source fixture is missing');
  const rows=[];
  for(const section of fixture.sample_sections){
    for(const segment of section.segments){
      const phrase=linePhrase(segment);
      if(!phrase.includes(' ')||!phrase.match(/[\u0600-\u06FF]/u))
        throw Error('Not a complete Arabic source phrase: '+segment.id);
      rows.push({id:segment.id,phrase,stress:false});
    }
  }
  if(rows.length!==11||fixture.stress_phrase!=='وَفِي أَلْفَاظِهِ')
    throw Error('Canonical eleven/§65 stress fixture changed');
  rows.push({id:'R065-INLINE-N65',phrase:fixture.stress_phrase,stress:true});
  return rows;
}

function signedArabicFont(pdf,kit,fontBytes,phrases){
  // Same CIDFontType2 / CIDToGIDMap principle as Gnamma's tested personal
  // appendix exporter. Every Unicode scalar gets one unique CID; glyph
  // presentation substitutions are deliberately NOT used for searching.
  const parsed=kit.create(fontBytes);
  const scalars=[...new Set([...phrases.join('')])];
  if(scalars.length>=65534)throw Error('CID Unicode set too large');
  const codes=new Map(),gid=new Uint8Array((scalars.length+1)*2);
  for(let i=0;i<scalars.length;i++){
    const cp=scalars[i].codePointAt(0),glyph=parsed.glyphForCodePoint(cp);
    if(!glyph?.id||cp>0xffff)throw Error('Missing original Arabic scalar U+'+cp.toString(16));
    const cid=i+1;
    codes.set(scalars[i],cid);
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
  for(let offset=0;offset<scalars.length;offset+=100){
    const slice=scalars.slice(offset,offset+100);
    lines.push(String(slice.length)+' beginbfchar');
    for(let k=0;k<slice.length;k++){
      const cid=(offset+k+1).toString(16).padStart(4,'0').toUpperCase();
      const scalar=scalars[offset+k].codePointAt(0).toString(16).padStart(4,'0').toUpperCase();
      lines.push('<'+cid+'> <'+scalar+'>');
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
  const cps=Array.from(logicalOrder==='reverse'?Array.from(phrase).reverse().join(''):phrase);
  const encoded=cps.map(ch=>{
    const code=font.codes.get(ch);
    if(!code)throw Error('Unicode layer dropped scalar '+ch.codePointAt(0).toString(16));
    return code.toString(16).padStart(4,'0');
  }).join('');
  const nativeWidth=cps.length*size*.5;
  const hz=Math.min(150,Math.max(20,100*visibleWidth/nativeWidth));
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
    emitStatus('loading','Loading canonical source and locally published font...');
    const [sourceReq,fontReq]=await Promise.all([
      fetch(SOURCE_URL,{cache:'no-store',credentials:'same-origin'}),
      fetch(FONT_URL,{cache:'no-store',credentials:'same-origin'})
    ]);
    if(!sourceReq.ok||!fontReq.ok)throw Error('Local source or font unavailable');
    const fixture=await sourceReq.json(),fontBytes=new Uint8Array(await fontReq.arrayBuffer());
    const rows=authorialRows(fixture);
    listElement.replaceChildren();
    for(const row of rows){
      const div=elt('div','row','');div.dataset.id=row.id;
      div.append(elt('span','phrase',row.phrase));listElement.append(div);
    }
    await document.fonts.load('23px "Noto Naskh Arabic"','وَفِي أَلْفَاظِهِ');
    await document.fonts.ready;
    if(!document.fonts.check('23px "Noto Naskh Arabic"'))throw Error('Source font failed to load in actual DOM');
    const pdf=await PDFDocument.create();
    pdf.setTitle('Daruri exact Unicode/vector outline feasibility — nonrelease');
    const page=pdf.addPage([595.28,841.89]);
    const english=await pdf.embedFont(StandardFonts.Helvetica);
    page.drawText('GNAMMA | DOM-derived Arabic semantic/vector proof | NOT AN EDITION',
      {x:35,y:815,size:9,font:english});
    const signed=signedArabicFont(pdf,fontkit,fontBytes,rows.map(r=>r.phrase));
    page.node.setFontDictionary(PDFName.of('GNOriginal'),signed.ref);
    const bounds=pageElement.getBoundingClientRect();
    const positions=[];
    for(const row of rows){
      const span=listElement.querySelector('[data-id="'+row.id+'"] .phrase');
      if(!span)throw Error('Lost DOM source span '+row.id);
      const rect=span.getBoundingClientRect();
      if(!rect.width||!rect.height)throw Error('Unlaid source DOM span '+row.id);
      const fontSize=23*.75;
      const layout=signed.parsed.layout(row.phrase,'arab',undefined,'rtl');
      const advance=layout.positions.reduce((s,p)=>s+p.xAdvance,0)*fontSize/signed.parsed.unitsPerEm;
      const right=(rect.right-bounds.left)*.75;
      const x=right-advance;
      const y=page.getHeight()-(rect.top-bounds.top)*.75-fontSize*1.05;
      if(x<15||right>page.getWidth()-10||y<60||y>page.getHeight()-30)
        throw Error('DOM-to-PDF coordinates out of bounds '+row.id+' '+JSON.stringify({x,y,right}));
      page.drawText(row.id,{x:38,y:y+4.5,size:8,font:english});
      const glyphs=drawSourceGlyphs(page,signed.parsed,row.phrase,x,y,fontSize);
      const semantic=drawOnlyOriginalUnicode(page,signed,row.phrase,x,y,fontSize,advance);
      if(row.stress){
        page.drawText('N65',{x:right+4,y:y+11,size:6.5,font:english});
      }
      positions.push({id:row.id,phrase:row.phrase,x,y,width:advance,
        height:fontSize*1.5,rect_px:[rect.left-bounds.left,rect.top-bounds.top,
        rect.right-bounds.left,rect.bottom-bounds.top],...glyphs,...semantic});
    }
    page.drawText('N65. Same-page synthetic footnote for source word interruption (NOT a published note).',
      {x:40,y:68,size:9,font:english});
    const bytes=new Uint8Array(await pdf.save({useObjectStreams:false}));
    if(String.fromCharCode(...bytes.subarray(0,5))!=='%PDF-')
      throw Error('No genuine PDF');
    const output='daruri-vector-outline-'+logicalOrder+'-NONRELEASE.pdf';
    const href=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
    const link=document.createElement('a');link.href=href;link.download=output;
    document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(href),60000);
    const report={
      phase:'done',mode:'12-source-phrase-outline-proof',order:logicalOrder,
      input_source_sha256:fixture.source_sha256,font_sha256:await digest(fontBytes),
      target_phrases:positions,bytes:bytes.length,
      input_original_prebuilt_pdfs:0,html_dom_measured:true,
      drawn_source_as_pdf_glyph_paths:true,source_arabic_text_ops_only_in_one_exact_CID_layer:true,
      personal_notes_used:false,printed_synthetic_note_only:true,
      generated_in_normal_browser:true,no_print_dialog:true,no_server_pdf:true,
      mobile_device_certified:false,full_414_passages_certified:false,
      publication_approved:false
    };
    window.__gnammaVectorPdfBytes=bytes;
    emitStatus('done','Generated '+bytes.length+' PDF bytes from DOM/font paths. Native QA still required.',report);
  }catch(error){
    emitStatus('failed',String(error?.stack||error),{error:String(error)});
    console.error('GNAMMA_VECTOR_PROBE_FAILURE',error);
  }finally{makeButton.disabled=false}
}
makeButton.addEventListener('click',()=>void generate());
window.__gnammaVectorStatus={phase:'ready',logical_order:logicalOrder};