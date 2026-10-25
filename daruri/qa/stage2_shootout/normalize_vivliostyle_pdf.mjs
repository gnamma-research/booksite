#!/usr/bin/env node
/* Research-only candidate: use the same browser-capable JS pdf-lib fork to
 * parse and re-serialize an existing malformed vivliostyle-pdf Uint8Array.
 * No native Ghostscript or server component in this candidate.
 */
import fs from 'node:fs';
import path from 'node:path';
import {PDFDocument} from '@pdfme/pdf-lib';
const input=process.argv[2];
const outDir=process.argv[3];
if(!input||!outDir)throw Error('normalize_vivliostyle_pdf.mjs input.pdf output-directory');
fs.mkdirSync(outDir,{recursive:true});
const data=new Uint8Array(fs.readFileSync(input));
for(const useObjectStreams of [false,true]){
 const name=useObjectStreams?'parsed-objectstreams.pdf':'parsed-classic-xref.pdf';
 try{
   const before=Date.now();
   const doc=await PDFDocument.load(data,{ignoreEncryption:false,
     updateMetadata:false,throwOnInvalidObject:false});
   const bytes=await doc.save({useObjectStreams,addDefaultPage:false,
     objectsPerTick:150,updateFieldAppearances:false});
   const target=path.join(outDir,name);
   fs.writeFileSync(target,bytes);
   console.log('GNAMMA_PDFME_PDF_LIB_REWRITE',JSON.stringify({
     output:target,input_bytes:data.length,output_bytes:bytes.length,
     useObjectStreams,pages:doc.getPageCount(),elapsed_ms:Date.now()-before
   }));
 }catch(error){
   console.error('GNAMMA_PDFME_REWRITE_FAILED',JSON.stringify({
     useObjectStreams,error:String(error?.stack||error).slice(0,3000)}));
 }
}
