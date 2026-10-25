#!/usr/bin/env node
/* pdfmake-RTL on REAL Gnamma Arabic + English, Q-source, historical entry.
 * Isolated engine prospect: browser-capable PDF content model but NOT CSS clone.
 * Test Unicode extraction and legal layout before any full converter investment.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const pdfmake=require('pdfmake-rtl');

const root=path.resolve(__dirname,'../../../..');
const out=process.env.QA_OUT||'/tmp/gnamma-pdfmake-rtl';
fs.mkdirSync(out,{recursive:true});
try{
  const Roboto=require('pdfmake-rtl/fonts/Roboto');
  pdfmake.addFonts(Roboto);
  const Cairo=require('pdfmake-rtl/fonts/Cairo');
  pdfmake.addFonts(Cairo);
}catch(e){console.log('GNAMMA_PDFMAKE_DEFAULT_FONT_WARNING',String(e));}
pdfmake.addFonts({
 Naskh:{
  normal:path.join(root,'daruri/build/fonts/NotoNaskhArabic-Regular.ttf'),
  bold:path.join(root,'daruri/build/fonts/NotoNaskhArabic-Bold.ttf')
 },
 NotoSerif:{
  normal:path.join(root,'daruri/build/fonts/NotoSerif-Regular.ttf'),
  bold:path.join(root,'daruri/build/fonts/NotoSerif-Bold.ttf')
 }
});
const title='الضَّرُورِيُّ فِي أُصُولِ الْفِقْهِ';
const dictionaryArabic='هي الإذن بإتيان الفعل كيف شاء الفاعل.';
const english='Permission to perform the act as the agent wishes.';
const content=[
 {text:'Al-Ḍarūrī fī Uṣūl al-Fiqh',style:'h1',id:'title'},
 {text:title,style:'arabicTitle',font:'Naskh',rtl:true},
 {text:'Scholarly section §1 · Opening discussion',style:'heading',id:'section-1'},
 {columns:[
  {width:'50%',text:'To proceed, after praising God, who teaches articulate expression and makes inquiry obligatory.',style:'body'},
  {width:'50%',text:'وبعد حمد الله الذي علّم البيان، وجعل النظر والاستدلال واجبين.',style:'arabicBody',font:'Naskh',rtl:true}
 ],columnGap:16,margin:[0,5,0,10]},
 {text:[{text:'Q1. ',bold:true},{text:'Cf. Qurʾān, al-Raḥmān 55:4.',link:'https://quran.com/55/4',color:'#1d4160'}],
   margin:[0,5,0,15],font:'NotoSerif'},
 {text:'Historical dictionary · ibāḥa',style:'heading',id:'dict-term-1'},
 {text:'إِبَاحَة',font:'Naskh',rtl:true,fontSize:20},
 {columns:[
  {text:english,font:'NotoSerif'},
  {text:dictionaryArabic,font:'Naskh',rtl:true,fontSize:14}
 ],columnGap:12,margin:[0,6,0,10]},
 {text:[
   {text:'Back to §1',linkToDestination:'section-1'},
   {text:' · Source note',link:'https://quran.com/55/4'}
  ],font:'NotoSerif'},
 {text:'Dictionary table',style:'heading'},
 {table:{widths:['*','*'],body:[
   [{text:'English',bold:true},{text:'Arabic',bold:true}],
   [{text:english,font:'NotoSerif'},{text:dictionaryArabic,font:'Naskh',rtl:true}]
 ]},layout:'lightHorizontalLines'},
];
const definition={
 pageSize:'A4',pageMargins:[45,60,45,55],
 info:{title:'Gnamma Darūrī / real bilingual Scholarly micro',author:'Ibn Rushd'},
 content,defaultStyle:{font:'NotoSerif',fontSize:11},
 styles:{
 h1:{font:'NotoSerif',fontSize:20,bold:true,margin:[0,0,0,7]},
 heading:{font:'NotoSerif',fontSize:15,bold:true,margin:[0,12,0,7]},
 arabicTitle:{font:'Naskh',fontSize:24,alignment:'right',margin:[0,0,0,15]},
 arabicBody:{font:'Naskh',fontSize:16,alignment:'right'},
 body:{font:'NotoSerif',fontSize:11,lineHeight:1.3}
 },
 header:()=>({text:'GNAMMA RESEARCH · bilingual Scholarly test',fontSize:7,margin:[45,26,45,0]}),
 footer:(current,count)=>({text:current+' / '+count,fontSize:8,alignment:'center',margin:[0,0,0,20]})
};
(async()=>{
 const t=Date.now();
 const doc=pdfmake.createPdf(definition);
 let bytes;
 try{bytes=await doc.getBuffer();}
 catch(e){
   console.log('GNAMMA_PDFMAKE_GETBUFFER_FALLBACK',String(e));
   await doc.write(path.join(out,'daruri-pdfmake-rtl-scholarship.pdf'));
   bytes=fs.readFileSync(path.join(out,'daruri-pdfmake-rtl-scholarship.pdf'));
 }
 if(!Buffer.isBuffer(bytes))bytes=Buffer.from(bytes);
 if(bytes.subarray(0,5).toString()!=='%PDF-')
   throw Error('pdfmake-rtl did not produce a valid PDF byte header');
 const dest=path.join(out,'daruri-pdfmake-rtl-scholarship.pdf');
 fs.writeFileSync(dest,bytes);
 const result={engine:'pdfmake-rtl 2.1.2',bytes:bytes.length,
   source_title:title,source_definition:dictionaryArabic,
   english_definition:english,elapsed_ms:Date.now()-t,
   browser_capable_library:true,
   actual_browser_executed:false,
   html_to_pdf_converter_built:false,
   css_paged_media_compatibility:false};
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2));
 console.log('GNAMMA_PDFMAKE_RTL_REAL_SOURCE_MICRO',JSON.stringify(result));
})().catch(err=>{console.error('GNAMMA_PDFMAKE_RTL_FAILED',err?.stack||err);process.exitCode=2});
