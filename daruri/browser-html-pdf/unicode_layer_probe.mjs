/* RESEARCH-ONLY experiment: in-browser Unicode semantic text, NOT releasable.
 *
 * The current Vivliostyle DOM->PDF writer emits glyph runs whose original
 * Arabic can be visible yet unsearchable. This micro A/B uses pdf-lib's fontkit
 * to emit original Unicode as an invisible character-encoded text run near
 * the corresponding HTML paragraph, without a PDF server or OS print dialog.
 *
 * It is intentionally a diagnosis, NOT an approved fix: underlying visible
 * Arabic may remain separately extractable, producing duplicate clipboard
 * text; correct native search geometry and real Study note placement must be
 * certified before any release. Default HTML->PDF output is unchanged.
 *
 * We only process at most 11 canonical excerpt paragraphs. Never add a blanket
 * hidden copy of the complete book or mislabel this as publication-safe.
 */
import {
  PDFDocument, beginText, endText, showText, setFontAndSize,
  setTextMatrix, setTextRenderingMode, TextRenderingMode,
} from '@pdfme/pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const FONT='/daruri/build/fonts/NotoNaskhArabic-Regular.ttf';

export async function experimentUnicodeLayer(pdfBytes,paginatedWindow,fixture) {
  const before=new Uint8Array(pdfBytes);
  const document=await PDFDocument.load(before,{updateMetadata:false});
  document.registerFontkit(fontkit);
  const request=await fetch(FONT,{cache:'force-cache',credentials:'same-origin'});
  if(!request.ok)throw Error('Cannot access canonical Noto font for Unicode QA: '+request.status);
  const font=await document.embedFont(new Uint8Array(await request.arrayBuffer()),{subset:false});
  const source=new Map();
  for(const sec of fixture.sample_sections)for(const seg of sec.segments){
    source.set(seg.id,seg.arabic);
  }
  if(source.size!==11)throw Error('This deliberate small Unicode A/B must use 11 source paragraphs');
  const pageNodes=[...paginatedWindow.document.querySelectorAll('[data-vivliostyle-page-container]')];
  if(!pageNodes.length)throw Error('No paginated HTML pages');
  const entries=[],seen=new Set();
  for(let pageNumber=0;pageNumber<pageNodes.length;pageNumber++){
    const frame=pageNodes[pageNumber],bounds=frame.getBoundingClientRect();
    for(const pair of frame.querySelectorAll('.parallel[id]')){
      const id=pair.id,paragraph=pair.querySelector('p.ar');
      if(!source.has(id)||!paragraph||seen.has(id))continue;
      const text=source.get(id),words=text.trim().split(/\s+/);
      if(words.length<2)throw Error('Canonical authorial Arabic source too short: '+id);
      const phrase=words.slice(0,2).join(' ');
      const rect=paragraph.getBoundingClientRect();
      if(!rect.width||!rect.height)continue;
      const page=document.getPage(pageNumber);
      const fontSize=13;
      const pt=0.75;
      const x=Math.max(0,(rect.left-bounds.left)*pt);
      const y=Math.max(0,(bounds.bottom-rect.top)*pt-fontSize*1.5);
      if(x>page.getWidth()||y>page.getHeight())throw Error('DOM source position outside PDF: '+id);
      // Register exactly one font in the PDF page resource dictionary.
      // 3 Tr is PDF's invisible text rendering mode, NOT opacity=0.
      page.setFont(font);
      page.pushOperators(
        beginText(),
        setFontAndSize(font.name,fontSize),
        setTextRenderingMode(TextRenderingMode.Invisible),
        setTextMatrix(1,0,0,1,x,y),
        showText(font.encodeText(phrase)),
        endText()
      );
      seen.add(id);
      entries.push({id,phrase,page:pageNumber+1,x:Math.round(x*100)/100,
        y:Math.round(y*100)/100,first_two_only:true});
    }
  }
  if(entries.length<10)throw Error('Only '+entries.length+' of 11 original source segments were positioned');
  const after=await document.save({useObjectStreams:false});
  return {bytes:new Uint8Array(after),evidence:{
    research_kind:'UNICODE_TEXT_LAYER_DIAGNOSTIC_ONLY',
    release_approved:false,source_segments:source.size,overlays:entries,
    underlying_visible_bad_unicode_suppressed:false,
    native_correct_search_not_assumed:true,source_pdf_inputs:0
  }};
}
