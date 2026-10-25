/* Arabic PDF copy diagnostics for Typst 0.15.1. Separate single-page PDFs
 * identify whether tashkīl or the Naskh font's shaping triggers duplication.
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {Compiler,initSync} from '@jsfi/typst-wasm';

const root=path.resolve(import.meta.dirname,'../../../..');
const out=process.env.QA_OUT||'/tmp/daruri-arabic-variants';
await mkdir(out,{recursive:true});
initSync({module:await readFile(new URL(import.meta.resolve('@jsfi/typst-wasm/typst_wasm_bg.wasm')))});
const compiler=new Compiler();
for(const f of ['NotoNaskhArabic-Regular.ttf','NotoNaskhArabic-Bold.ttf',
                'NotoSerif-Regular.ttf']){
 const bytes=await readFile(path.join(root,'daruri/build/fonts',f));
 compiler.addFont(bytes);
}
const cases={
 fully_vowelled_title:'الضَّرُورِيُّ فِي أُصُولِ الْفِقْهِ',
 unvowelled_title:'الضروري في أصول الفقه',
 unvowelled_short:'الكتاب',
 vowelled_short:'الْكِتَابُ',
 legal_definition:'هي الإذن بإتيان الفعل كيف شاء الفاعل.'
};
const reports=[];
for(const [name,arabic] of Object.entries(cases)){
 const sample=[
 '#set page(paper:"a4",margin:20mm)',
 '#set text(font:"Noto Serif",size:12pt)',
 'Test '+name,
 '#text(font:"Noto Naskh Arabic",lang:"ar",dir:rtl,size:25pt)['+arabic+']'
 ].join('\n\n');
 compiler.addFile('/main.typ',new TextEncoder().encode(sample));
 compiler.setMain('/main.typ');
 const result=compiler.compilePdf();
 if(!result.pdf)throw Error(name+' compile failed '+JSON.stringify(result.diagnostics));
 const file=path.join(out,name+'.pdf');
 await writeFile(file,result.pdf);
 reports.push({name,source:arabic,output:file,bytes:result.pdf.length,
  diagnostics:result.diagnostics||[]});
}
await writeFile(path.join(out,'source-cases.json'),JSON.stringify(reports,null,2));
console.log('GNAMMA_TYPST_015_ARABIC_VARIANT_OUTPUT',JSON.stringify(reports.map(x=>({
 name:x.name,bytes:x.bytes,source:x.source}))));
