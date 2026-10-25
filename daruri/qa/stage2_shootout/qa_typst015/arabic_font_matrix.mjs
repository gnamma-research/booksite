/* Does Arabic ToUnicode corruption vary by Open Font? Typst WASM 0.15.1.
 * Naskh is canonical Gnamma; alternatives only isolated research samples.
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {Compiler,initSync} from '@jsfi/typst-wasm';
const here=path.dirname(new URL(import.meta.url).pathname);
const root=path.resolve(here,'../../../..');
const stage2=path.resolve(here,'..');
const out=process.env.QA_OUT||'/tmp/gnamma-typst-arabic-font-matrix';
await mkdir(out,{recursive:true});
initSync({module:await readFile(new URL(import.meta.resolve('@jsfi/typst-wasm/typst_wasm_bg.wasm')))});
const compiler=new Compiler();
for(const [font,p] of [
 ['Noto Naskh Arabic',path.join(root,'daruri/build/fonts/NotoNaskhArabic-Regular.ttf')],
 ['Noto Serif',path.join(root,'daruri/build/fonts/NotoSerif-Regular.ttf')],
 ['Noto Sans Arabic',path.join(stage2,'node_modules/vivliostyle-pdf/public/fonts/NotoSansArabic-Regular.ttf')],
 ['DejaVu Sans',path.join(stage2,'node_modules/vivliostyle-pdf/public/fonts/DejaVuSans.ttf')]
]){
 try{
  const n=compiler.addFont(await readFile(p));
  console.log('GNAMMA_ARABIC_FONT_REGISTERED',JSON.stringify({font,added:n}));
 }catch(error){
  throw Error('Arabic font '+font+' could not be installed: '+String(error));
 }
}
const cases=[
 ['naskh_tashkil','Noto Naskh Arabic','الضَّرُورِيُّ فِي أُصُولِ الْفِقْهِ'],
 ['naskh_plain','Noto Naskh Arabic','الضروري في أصول الفقه'],
 ['sans_tashkil','Noto Sans Arabic','الضَّرُورِيُّ فِي أُصُولِ الْفِقْهِ'],
 ['sans_plain','Noto Sans Arabic','الضروري في أصول الفقه'],
 ['dejavu_tashkil','DejaVu Sans','الضَّرُورِيُّ فِي أُصُولِ الْفِقْهِ'],
 ['dejavu_plain','DejaVu Sans','الضروري في أصول الفقه']
];
const report=[];
for(const [name,font,text] of cases){
 const source=[
  '#set page(paper:"a4",margin:20mm)',
  '#set text(font:"Noto Serif",size:10pt)',
  'Arabic font probe: '+name,
  '#text(font:'+JSON.stringify(font)+',lang:"ar",dir:rtl,size:22pt)['+text+']',
  '#text[Term definition cross-ref: #link(<id-1>)[link]]',
  '#heading(level:2)[Dictionary] <id-1>'
 ].join('\n\n');
 compiler.addFile('/main.typ',new TextEncoder().encode(source));
 compiler.setMain('/main.typ');
 const result=compiler.compilePdf();
 if(!result.pdf)throw Error(name+' compiler failed '+JSON.stringify(result.diagnostics));
 await writeFile(path.join(out,name+'.pdf'),result.pdf);
 report.push({name,font,expected_arabic:text,output_pdf:name+'.pdf',
  pdf_bytes:result.pdf.length,diagnostics:result.diagnostics||[]});
}
await writeFile(path.join(out,'source-cases.json'),JSON.stringify(report,null,2)+'\n');
console.log('GNAMMA_ARABIC_FONT_PDF_MATRIX',JSON.stringify(report.map(({name,font,pdf_bytes})=>({name,font,pdf_bytes}))));
