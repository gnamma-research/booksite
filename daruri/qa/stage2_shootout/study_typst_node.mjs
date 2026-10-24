/* This Node worker is an engine preflight, not the production renderer.
 * The same source.typ must subsequently compile inside a real browser.
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createTypstCompiler} from 'typst-wasm';
import {createWorkerThread} from 'typst-wasm/worker/node';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../..');
const out=process.env.STAGE2_OUTPUT||'/tmp/daruri-real-study';
const typ=await readFile(process.env.STAGE2_SOURCE||path.join(out,'study_source.typ'),'utf8');
if(!typ.includes('#footnote[')||!typ.includes('<daruri-065>')||!typ.includes('columns: (1fr, 1fr)'))
 throw Error('Missing original footnote, section and bilingual grid constructs');
const modules={};
for(const file of ['engine.core.wasm','engine.core2.wasm','engine.core3.wasm']){
 modules[file]=WebAssembly.compile(await readFile(new URL(import.meta.resolve('typst-wasm/engine/'+file))));
}
const wasmWorker=new URL(import.meta.resolve('typst-wasm/worker/worker-thread'));
const compiler=await createTypstCompiler({backend:'worker',coreModules:modules,
 worker:()=>createWorkerThread(wasmWorker)});
try{
 const fontDir=path.resolve(root,'daruri/build/fonts');
 for(const f of ['NotoNaskhArabic-Regular.ttf','NotoSerif-Regular.ttf','NotoSans-Regular.ttf'])
  await compiler.addFonts(new Uint8Array(await readFile(path.join(fontDir,f))));
 await compiler.addFonts(new Uint8Array(await readFile('/usr/share/fonts/opentype/fonts-hosny-amiri/Amiri-Regular.ttf')));
 await compiler.addFonts(new Uint8Array(await readFile(new URL(import.meta.resolve('@typst-wasm/fonts/NewCMMath-Regular.otf')))));
 await compiler.addSource('main.typ',typ);
 const begin=performance.now(),cpu=process.cpuUsage(),mem0=process.memoryUsage();
 const output=await compiler.compile({main:'main.typ',format:'pdf'});
 if(!output.output?.length||String.fromCharCode(...output.output.slice(0,5))!=='%PDF-')
   throw Error('Study compilation did not generate a genuine PDF header');
 await mkdir(out,{recursive:true});
 const target=path.join(out,'typst-real-study-NONRELEASE.pdf');
 await writeFile(target,output.output);
 const cpuDelta=process.cpuUsage(cpu);
 const results={engine:'typst-wasm@1.0.0',backend:'node-WebAssembly-only',
   source_typst_chars:typ.length,
   generated_pdf:target,bytes:output.output.length,
   compile_ms:Math.round(performance.now()-begin),
   cpu_user_ms:Math.round(cpuDelta.user/1000),
   cpu_system_ms:Math.round(cpuDelta.system/1000),
   rss_before:mem0.rss,rss_after:process.memoryUsage().rss,
   production_approved:false};
 await writeFile(path.join(out,'typst-study-compiler.json'),JSON.stringify(results,null,2)+'\n');
 console.log('DARURI_REAL_STUDY_TYPST_PDF',JSON.stringify(results));
}catch(e){console.error('DARURI_REAL_STUDY_TYPST_FAILED',String(e?.stack||e));process.exitCode=2}
finally{await compiler.dispose();}
