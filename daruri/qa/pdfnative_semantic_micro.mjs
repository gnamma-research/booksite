#!/usr/bin/env node
/**
 * Isolated SECOND-WRITER research, not the Gnamma HTML print engine:
 * Can pdfnative@1.8.0 preserve original vowelled Arabic Unicode in search?
 *
 * Node execution first, before trying in actual browser. It is a semantic
 * PDF-engine A/B test, NOT a proof that pdfnative renders HTML/CSS.
 * Uses no PDF as an input, and none of the site's personal notes.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  buildDocumentPDFBytes,registerFont,loadFontData
} from 'pdfnative';
const ROOT=path.resolve(import.meta.dirname,'..');
const FIXTURE=path.join(ROOT,'browser-html-pdf/fixture.json');
const TARGET=path.resolve(process.env.GN_NATIVE_DIR||'/tmp/daruri-pdfnative-qa');
fs.mkdirSync(TARGET,{recursive:true});
const source=JSON.parse(fs.readFileSync(FIXTURE,'utf8'));
if(source.authorial_passages!==414||source.authorial_sections!==258)
 throw Error('Canonical source inventory differs');
registerFont('ar',()=>import('pdfnative/fonts/noto-arabic-data.js'));
const font=await loadFontData('ar');
if(!font)throw Error('pdfnative Noto Arabic font module unavailable');
const sections=source.sample_sections;
const expected=sections.flatMap(s=>s.segments.map(p=>p.arabic));
if(expected.length!==11)throw Error('Expected 11 canonical excerpt passages, got '+expected.length);
const english=sections.flatMap(s=>s.segments.map(p=>p.english));
const caseMap=[
 {id:'arabic-untagged',tagged:undefined},
 {id:'arabic-pdfa2u',tagged:'pdfa2u'},
 {id:'mixed-pdfa2u',tagged:'pdfa2u',mixed:true}
];
for(const option of caseMap){
 const blocks=[{type:'heading',text:'Daruri source Unicode engineering A/B',level:1}];
 for(const section of sections){
  blocks.push({type:'heading',text:'R'+String(section.id).padStart(3,'0'),level:2});
  for(const entry of section.segments){
   if(option.mixed)blocks.push({type:'paragraph',text:entry.english});
   blocks.push({type:'paragraph',text:entry.arabic});
   if(section.id===65 && entry===section.segments[0])
    blocks.push({type:'paragraph',text:'N65. Synthetic footnote-body stress only; original authorial text unchanged.'});
  }
 }
 const params={
  title:'Daruri PdfNative Arabic-encoding research — NONRELEASE',
  blocks,
  fontEntries:[{fontData:font,fontRef:'/F3',lang:'ar'}],
 };
 const start=performance.now();
 const layout=option.tagged?{tagged:option.tagged}:{};
 const raw=buildDocumentPDFBytes(params,layout);
 const bytes=raw instanceof Uint8Array?raw:new Uint8Array(raw);
 if(String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')
  throw Error(option.id+' native writer failed');
 const file=path.join(TARGET,option.id+'.pdf');
 fs.writeFileSync(file,bytes);
 const report={
  engine:'pdfnative@1.8.0',
  mode:option.id,
  source_sha256:source.source_sha256,
  created_pdf_sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
  bytes:bytes.length,
  authorial_segments:expected.length,
  render_ms:Math.round(performance.now()-start),
  no_canonical_PDF_render_inputs:true,
  pdf_created_directly_from_structured_text_NOT_CSS_HTML:true,
  native_search_and_copy_not_yet_certified:true
 };
 fs.writeFileSync(path.join(TARGET,option.id+'.json'),JSON.stringify(report,null,2));
 console.log('PDFNATIVE_SEMANTIC_CREATED',JSON.stringify(report));
}
