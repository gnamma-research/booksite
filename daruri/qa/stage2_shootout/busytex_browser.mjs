/* Nonrelease native browser BusyTeX WebAssembly proof. */
import {BusyTexRunner,XeLatex,LuaLatex} from 'texlyre-busytex';
const button=document.getElementById('start'),state=document.getElementById('status');
const selector=document.getElementById('engine');
function report(phase,message,extra={}){
 state.textContent=message;
 window.__busytexStage2={phase,message,engine:selector.value,...extra};
}
window.__busytexStage2={phase:'ready'};
function tex(s){
 return Array.from(String(s)).map(c=>({'\\':'\\textbackslash{}','#':'\\#','{':'\\{','}':'\\}',
 '$':'\\$','%':'\\%','&':'\\&','_':'\\_'}[c]||c)).join('');
}
async function generate(){
 button.disabled=true;
 let runner;
 try{
  report('loading','Loading original source fixture and bundled Arabic font...');
  const [sourceReq,fontReq]=await Promise.all([
   fetch('/daruri/qa/stage2_shootout/source.json',{cache:'no-store'}),
   fetch('/daruri/build/fonts/NotoNaskhArabic-Regular.ttf')
  ]);
  if(!sourceReq.ok||!fontReq.ok)throw Error('Missing canonical source or font on this static origin');
  const source=await sourceReq.json();
  if(source.schema!=='gnamma-stage2-compiler-comparison-v1'||source.sample.length!==6)
   throw Error('Canonical original Daruri fixture is not valid');
  const font=new Uint8Array(await fontReq.arrayBuffer());
  const parts=[
    '\\documentclass[a4paper,11pt]{article}',
    '\\usepackage[margin=19mm]{geometry}',
    '\\usepackage{fontspec}',
    '\\newfontfamily\\arabicfont[Path=./,Extension=.ttf,Script=Arabic]{NotoNaskhArabic-Regular}',
    '\\begin{document}',
    '\\section*{Gnamma Daruri real source, research only}'
  ];
  for(const row of source.sample){
   parts.push('\\subsection*{'+row.id+'}');
   if(selector.value==='xe')parts.push('{\\arabicfont\\TeXXeTstate=1\\beginR '+tex(row.arabic)+' \\endR\\par}');
   else parts.push('{\\arabicfont\\textdir TRT '+tex(row.arabic)+'\\par}');
   parts.push('\\par Original section '+row.section+'.');
  }
  parts.push('\\end{document}');
  const dir='/daruri/qa/stage2_shootout/runtime/busytex';
  runner=new BusyTexRunner({
   busytexBasePath:dir,verbose:false,
   preloadDataPackages:[dir+'/texlive-basic.js',dir+'/texlive-recommended.js']
  });
  report('initializing','Initializing BusyTeX WebAssembly and pinned TeX Live packages...');
  await runner.initialize(true);
  const compiler=selector.value==='xe'?new XeLatex(runner):new LuaLatex(runner);
  report('compiling','Typesetting original Arabic with '+selector.value+' WASM...');
  const start=performance.now();
  const result=await compiler.compile({
   input:parts.join('\n'),
   rerun:false,
   additionalFiles:[{path:'NotoNaskhArabic-Regular.ttf',content:font}]
  });
  if(!result.success||!result.pdf?.length)
   throw Error('Native BusyTeX '+selector.value+' failed: '+String(result.log).slice(-3200));
  const bytes=result.pdf instanceof Uint8Array?result.pdf:new Uint8Array(result.pdf);
  if(String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')throw Error('No genuine PDF header');
  const name='daruri-busytex-'+selector.value+'-browser-NONRELEASE.pdf';
  const blob=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  const a=document.createElement('a');a.download=name;a.href=blob;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(blob),25000);
  report('done','Normal browser generated a real BusyTeX PDF. Native Arabic is NOT certified.',{
   bytes:bytes.length,elapsed_ms:Math.round(performance.now()-start),
   source_sha256:source.source_sha256,
   real_browser_pdf:true,no_prebuilt_source_pdf:true,
   exitCode:result.exitCode,publication_approved:false
  });
 }catch(e){report('failed',String(e?.stack||e),{error:String(e)});console.error('DARURI_BUSYTEX_FAIL',e);}
 finally{runner?.terminate();button.disabled=false;}
}
button.addEventListener('click',()=>void generate());