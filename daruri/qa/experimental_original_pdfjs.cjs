#!/usr/bin/env node
/* Experimental, read-only PDF.js original-source Arabic Unicode coverage.
   Supports candidate PDFs from PR #49. Does NOT certify native PDFKit/PDFium.
*/
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
if(process.argv.length<5)throw Error('usage: node experimental_original_pdfjs.cjs file.pdf map.json pdfjs-dist-root');
const [file,mapPath,root]=process.argv.slice(2);
const mod=await import(pathToFileURL(path.resolve(root,'node_modules/pdfjs-dist/legacy/build/pdf.mjs')).href);
const pdf=await mod.getDocument({data:new Uint8Array(fs.readFileSync(file)),disableFontFace:true,useSystemFonts:false}).promise;
const mapped=JSON.parse(fs.readFileSync(mapPath,'utf8'));
const clean=s=>String(s||'').normalize('NFKD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]/gu,'').toLowerCase();
const pageText=[''];
for(let i=1;i<=pdf.numPages;i++){
  const page=await pdf.getPage(i),content=await page.getTextContent();
  pageText.push(clean(content.items.map(x=>x.str||'').join(' ')));
}
let total=0,matched=0;
const failures=[];
for(const [key,words] of Object.entries(mapped.segments)){
  if(!/:(ar|vocalized)$/.test(key)||words.length<3)continue;
  const firstPage=words[0][1];
  const phrase=words.filter(x=>x[1]===firstPage).slice(0,5).map(x=>x[0]);
  if(phrase.length<3)continue;
  total++;
  if(pageText[firstPage]?.includes(clean(phrase.join(''))))matched++;
  else failures.push(key);
}
const firstKey=Object.keys(mapped.segments).find(x=>/:(ar|vocalized)$/.test(x));
const firstWords=mapped.segments[firstKey].slice(0,2).map(x=>x[0]);
const report={engine:'pdfjs-dist',pages:pdf.numPages,segments_probed:total,matched,failed:failures.length,
  first_failed:failures.slice(0,20),first_phrase:firstWords.join(' '),
  first_phrase_normalized_found:pageText[mapped.segments[firstKey][0][1]].includes(clean(firstWords.join(''))),
  prototype_only:true};
console.log(JSON.stringify(report,null,2));
await pdf.destroy();
if(process.env.GN_STRICT_PDFJS==='1'&&!report.first_phrase_normalized_found)process.exitCode=1;
