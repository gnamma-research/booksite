/* Independent Typst WASM; compile in a Node worker, not a browser. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createTypstCompiler} from 'typst-wasm';
import {createWorkerThread} from 'typst-wasm/worker/node';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../..');
const out=process.env.STAGE2_OUTPUT || path.resolve(here,'_out');
const mode=process.env.STAGE2_CORPUS==='full'?'full':'six';
function escapeTypst(s){return String(s??'').replace(/([\\#*_@$[\]<>])/g,'\\$1')}
const workerUri=new URL(import.meta.resolve('typst-wasm/worker/worker-thread'));
const engineFiles=['engine.core.wasm','engine.core2.wasm','engine.core3.wasm'];
const coreModules={};
for(const file of engineFiles){
  const uri=new URL(import.meta.resolve('typst-wasm/engine/'+file));
  coreModules[file]=WebAssembly.compile(await readFile(uri));
}
const source=JSON.parse(await readFile(process.env.STAGE2_FIXTURE||path.resolve(out,'source.json'),'utf8'));
if(source.paragraphs!==414||source.sections!==258||source.sample.length!==6)
 throw Error('Incompatible original Daruri source');
const lines=[
  '#set page(paper: "a4", margin: (top: 18mm, bottom: 18mm, left: 17mm, right: 17mm))',
  '#set text(font: "Noto Serif", size: 10pt, lang: "en")',
  '#set par(leading: 0.7em)',
  '= Daruri source: independent Typst WASM PDF test',
  'This is a nonrelease engine experiment based on the canonical Gnamma source.',
  '#outline()','#pagebreak()'
];
const rows=mode==='full'?source.all_source:source.sample;
for(let index=0;index<rows.length;index++){
 const row=rows[index];
 if(mode==='full'&&index&&index%50===0)lines.push('#pagebreak()');
 lines.push('== Original '+row.id+' <item-'+index+'>');
 lines.push('#text(font: "Noto Naskh Arabic", lang: "ar", dir: rtl, size: 13pt)['+escapeTypst(row.arabic)+']');
 lines.push('#v(4pt)');
 lines.push('#text(font: "Noto Serif", lang: "en", dir: ltr, size: 9pt)['+escapeTypst(row.english)+']');
 if(row.section===65&&index<150){
  lines.push('#text(font: "Noto Naskh Arabic", lang: "ar", dir: rtl)['+escapeTypst(source.stress_phrase)+']#footnote['+escapeTypst(source.test_note)+']');
 }
 lines.push('');
}
lines.push('#link(<item-0>)[Return to first source]');
await mkdir(out,{recursive:true});
const typ=lines.join('\n');
await writeFile(path.join(out,'source.typ'),typ,'utf8');
const compiler=await createTypstCompiler({
 backend:'worker',coreModules,worker:()=>createWorkerThread(workerUri)
});
const start=performance.now();
try{
 const fontDir=path.resolve(root,'daruri/build/fonts');
 for(const f of ['NotoNaskhArabic-Regular.ttf','NotoSerif-Regular.ttf','NotoSans-Regular.ttf'])
  await compiler.addFonts(new Uint8Array(await readFile(path.join(fontDir,f))));
 await compiler.addFonts(new Uint8Array(await readFile(
  new URL(import.meta.resolve('@typst-wasm/fonts/NewCMMath-Regular.otf')))));
 await compiler.addSource('main.typ',typ);
 const compiled=await compiler.compile({main:'main.typ',format:'pdf'});
 if(!compiled.output?.length||String.fromCharCode(...compiled.output.slice(0,5))!=='%PDF-')
   throw Error('Typst worker did not emit PDF bytes');
 await writeFile(path.join(out,'typst-wasm-'+mode+'.pdf'),compiled.output);
 const stats={engine:'typst-wasm@1.0.0',backend:'node-worker-WASM',mode,
  source_sha256:source.source_sha256,bytes:compiled.output.length,
  ms:Math.round(performance.now()-start),source_records:rows.length,
  no_prebuilt_pdf_input:true,browser_pdf_proven:false,publication_approved:false};
 await writeFile(path.join(out,'typst-node.json'),JSON.stringify(stats,null,2));
 console.log('STAGE2_TYPST_WASM_PDF',JSON.stringify(stats));
}catch(e){console.error('STAGE2_TYPST_WASM_ERROR',e?.stack||String(e));process.exitCode=2;}
finally{await compiler.dispose();}
