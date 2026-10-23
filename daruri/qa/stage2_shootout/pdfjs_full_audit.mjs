/* Independent PDF.js browser-reader text model audit of real Typst PDF.
 * This does not use PDFium/MuPDF/Poppler or modify the PDF.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdf=process.argv[2],src=process.argv[3],out=process.argv[4];
if(!pdf||!src||!out)throw Error('pdf, canonical source, report required');
const fixture=JSON.parse(await fs.readFile(src,'utf8'));
if(fixture.all_source?.length!==414)throw Error('Canonical source not complete');
const input=await fs.readFile(pdf);
const reader=getDocument({
  data:new Uint8Array(input),disableFontFace:true,
  useSystemFonts:false,isEvalSupported:false,
  standardFontDataUrl:null,verbosity:0
});
const doc=await reader.promise;
const pages=[],pText=[],links=[];
for(let n=1;n<=doc.numPages;n++){
  const page=await doc.getPage(n);
  const text=await page.getTextContent();
  const items=text.items.filter(x=>typeof x.str==='string');
  pages.push(items);
  pText.push(items.map(x=>x.str).join(' '));
  const annots=await page.getAnnotations({intent:'display'});
  links.push(annots.filter(x=>x.subtype==='Link').length);
}
const folding=s=>{
 return [...String(s).normalize('NFKD')].filter(
 c=> c>='\u0600'&&c<='\u08ff'&&/[^\p{M}\p{P}\p{S}\p{Z}\p{C}]/u.test(c)
 ).join('');
};
const checks=[],sc={exact2:0,arabic_letters2:0,arabic_letters5:0,
 arabic_letters10:0,arabic_letters20:0,found_source_headings:0};
for(const row of fixture.all_source){
  const marker='Original '+row.id;
  const locs=pText.flatMap((s,i)=>s.includes(marker)?[i]:[]);
  if(locs.length)sc.found_source_headings++;
  const near=[...new Set(locs.flatMap(k=>[k,Math.min(k+1,doc.numPages-1)]))];
  const words=row.arabic_unvowelled.split(/\s+/u);
  const got={id:row.id,found_source_heading:locs.length>0};
  for(const size of [2,5,10,20]){
    const q=words.slice(0,size).join(' ');
    const found=near.some(i=>folding(q)&&folding(pText[i]).includes(folding(q)));
    got['normalized'+size]=found;
    sc['arabic_letters'+size]+=Number(found);
    if(size===2){
      const literal=near.some(i=>pText[i].includes(q));
      got.exact2=literal;sc.exact2+=Number(literal);
    }
  }
  checks.push(got);
}
const report={
 schema:'gnamma-stage2-typst-pdfjs-native-fourth-reader-v1',
 pdf_input:pdf,source_sha256:fixture.source_sha256,
 pdf_pages:doc.numPages,metadata_outline_entries:(await doc.getOutline())?.length||0,
 link_annotations:links.reduce((s,x)=>s+x,0),
 counts:sc,results:checks,
 production_approved:false,
 exact_vowelled_arabic_proven:false,
 accurate_word_box_proven:false
};
await fs.mkdir(path.dirname(out),{recursive:true});
await fs.writeFile(out,JSON.stringify(report,null,2)+'\n');
console.log('STAGE2_PDFJS_FULL',JSON.stringify({
  pages:doc.numPages,links:report.link_annotations,counts:sc,publication_approved:false
}));
await reader.destroy();
