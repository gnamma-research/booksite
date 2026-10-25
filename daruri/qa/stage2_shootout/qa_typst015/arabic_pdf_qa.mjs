#!/usr/bin/env node
/* Typst 0.15.1 alternative WASM Arabic ToUnicode/PDF semantics proof.
 * This package is @jsfi/typst-wasm 0.1.0 (not the baseline typst-wasm 1.0).
 * Entire compilation happens locally through WASM, without print/dialog.
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {Compiler,initSync,version} from '@jsfi/typst-wasm';

const root=path.resolve(import.meta.dirname,'../../../..');
const output=process.env.QA_OUT||'/tmp/daruri-typst-015-arabic';
await mkdir(output,{recursive:true});
const started=performance.now();
const wasm=await readFile(new URL(import.meta.resolve('@jsfi/typst-wasm/typst_wasm_bg.wasm')));
initSync({module:wasm});
const compiler=new Compiler();
const fontNames=[
 'NotoNaskhArabic-Regular.ttf',
 'NotoNaskhArabic-Bold.ttf',
 'NotoSerif-Regular.ttf',
 'NotoSerif-Bold.ttf',
 'NotoSans-Regular.ttf'
];
for(const name of fontNames){
 const fontPath=path.join(root,'daruri','build','fonts',name);
 const added=compiler.addFont(await readFile(fontPath));
 console.log('GNAMMA_TYPOST_015_FONT',JSON.stringify({name,faces:added}));
}
const arabicTitle='الضَّرُورِيُّ فِي أُصُولِ الْفِقْهِ';
const arabicTerm='إِبَاحَة';
const arabicSentence='هي الإذن بإتيان الفعل كيف شاء الفاعل.';
const english='Permission to perform the act as the agent wishes.';
const sample=[
 '#set page(paper: "a4",margin: 20mm)',
 '#set text(font: "Noto Serif",size:11pt)',
 '#set par(leading:0.8em)',
 '= Al-Ḍarūrī fī Uṣūl al-Fiqh',
 '#text(font:"Noto Naskh Arabic",lang:"ar",dir:rtl,size:24pt)['+arabicTitle+']',
 '== Historical dictionary · ibāḥa',
 '#text(font:"Noto Naskh Arabic",lang:"ar",dir:rtl,size:18pt)['+arabicTerm+']',
 '#text(font:"Noto Naskh Arabic",lang:"ar",dir:rtl,size:15pt)['+arabicSentence+']',
 '#text(lang:"en",size:11pt)['+english+']',
 '== Source quotation',
 '#text(font:"Noto Naskh Arabic",lang:"ar",dir:rtl,size:14pt)[وَأَمَّا النَّظَرُ فِي أَلْفَاظِهِ فَمِنْهَا حَقِيقَةٌ وَمَجَازٌ]',
 '#link(<term>)[Go to term]',
 '#heading(level:2)[Term target] <term>',
].join('\n\n');
compiler.addFile('/main.typ',new TextEncoder().encode(sample));
compiler.setMain('/main.typ');
const result=compiler.compilePdf();
const diagnostics=(result.diagnostics||[]).map(d=>({
 severity:d.severity,message:d.message,path:d.path,line:d.line}));
console.log('GNAMMA_TYPST_015_DIAGNOSTICS',JSON.stringify(diagnostics).slice(0,2500));
if(!result.pdf)throw Error('Typst 0.15.1 WASM micro compile failed: '+JSON.stringify(diagnostics));
const name=path.join(output,'daruri-typst-0151-real-Arabic-Noto-fonts.pdf');
await writeFile(name,result.pdf);
const report={
 compiler_package:'@jsfi/typst-wasm@0.1.0',
 engine_version:version(),pdf_bytes:result.pdf.length,
 wasm_bytes:wasm.length,
 compiled_pdf_as_client_side_compatible_WASM:true,
 source_code:sample,
 arabic_title_expected:arabicTitle,
 arabic_term_expected:arabicTerm,
 arabic_sentence_expected:arabicSentence,
 english_expected:english,
 output_pdf:name,
 diagnostics,
 elapsed_ms:Math.round(performance.now()-started)};
await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log('GNAMMA_TYPST_015_ARABIC_PDF_RESULT',JSON.stringify({
 compiler:report.compiler_package,version:version(),
 wasm_bytes:wasm.length,pdf_bytes:result.pdf.length,elapsed_ms:report.elapsed_ms}));
