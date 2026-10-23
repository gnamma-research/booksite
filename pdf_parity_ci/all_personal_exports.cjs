#!/usr/bin/env node
'use strict';
/* Synthetic personal-note PDF per physically published source or canonical design.
   Stage1: the 120 scholarly apparatus PDFs are composed locally and covered
   independently by the exact 120-profile composer/parity and browser P-note suites. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {pathToFileURL}=require('node:url');
const {spawn,spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const {chromium}=require(path.join(root,'daruri/qa/node_modules/playwright'));
const shard=Number(process.env.SHARD||'0'),shards=Number(process.env.SHARDS||'3');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'daruri/pdf-editions-manifest.json')));
const a4=JSON.parse(fs.readFileSync(path.join(root,'daruri/editions/manifest.json')));
const extra=JSON.parse(fs.readFileSync(path.join(root,'daruri/editions/apparatus/manifest.json')));
const all=[
  ...Object.keys(manifest.files),
  ...a4.files.map(x=>'editions/'+x.file)
];
if(all.length!==17||new Set(all).size!==17)throw Error('Expected 5 canonical plus 12 distinct, directly published source PDFs.');
if(extra.files.length!==120||new Set(extra.files.map(x=>x.file)).size!==120)
  throw Error('The Stage1 120 approved apparatus recipes are missing or duplicated.');
const selected=all.filter((v,i)=>i%shards===shard);
const normalize=s=>String(s||'').normalize('NFKD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]/gu,'').toLowerCase();
let pdfjsModule=null;
async function verifyArabicUsingPdfJs(pdfpath,startPage){
  if(!pdfjsModule)pdfjsModule=await import(pathToFileURL(path.join(root,'daruri/qa/node_modules/pdfjs-dist/legacy/build/pdf.mjs')).href);
  const data=new Uint8Array(fs.readFileSync(pdfpath));
  const doc=await pdfjsModule.getDocument({data,disableFontFace:true,useSystemFonts:false}).promise;
  let text='';
  try{
    for(let page=startPage+1;page<=doc.numPages;page++){
      const p=await doc.getPage(page),content=await p.getTextContent();
      text+=content.items.map(x=>x.str||'').join(' ')+'\n';
    }
  }finally{await doc.destroy()}
  const normalized=normalize(text);
  return {mixedArabicWord:normalized.includes(normalize('التحليل')),
    ArabicPhrase:normalized.includes(normalize('مقدمة العلوم الدقيقة')),
    EnglishSentinel:normalized.includes(normalize('CI-PRIVATE-PERSONAL-NOTE')),
    illegalControls:[...text].filter(c=>c.codePointAt(0)<32&&!['\n','\r','\t'].includes(c)).length
  };
}
const seed={format:'gnamma-reading-desk',version:1,items:[
 {id:'production-parity-note',kind:'note',title:'Research observation',body:'CI-PRIVATE-PERSONAL-NOTE: Arabic التحليل · Study reflection on lawful reasoning.',
  target:{kind:'section',section:'1'},created:Date.UTC(2026,9,22),modified:0,updated:Date.UTC(2026,9,22),dateSource:'recorded',deleted:0},
 {id:'production-parity-arabic-phrase',kind:'note',title:'Arabic phrasing',body:'مقدمة العلوم الدقيقة بين الحقيقة والأصول.',
  target:{kind:'section',section:'2'},created:Date.UTC(2026,9,22)+1,modified:0,updated:Date.UTC(2026,9,22)+1,dateSource:'recorded',deleted:0},
 {id:'production-parity-bookmark',kind:'section',title:'Source §191',target:{kind:'section',section:'191'},
  created:Date.UTC(2026,9,22),updated:Date.UTC(2026,9,22),dateSource:'recorded',deleted:0}
]};
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gnamma-personal-matrix-'));
const reports=path.join(root,'pdf_parity_ci','matrix_reports');
fs.mkdirSync(reports,{recursive:true});
const server=spawn('python3',['-m','http.server',String(8870+shard),'--bind','127.0.0.1'],
  {cwd:root,stdio:'ignore'});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 await delay(1200);
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 let page=null;const results=[];const allErrors=[];
 try{
  async function newPage(){
   if(page)await page.close();
   page=await browser.newPage({acceptDownloads:true,viewport:{width:1280,height:900}});
   page.on('pageerror',e=>allErrors.push(String(e)));
   await page.addInitScript(value=>{
     localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify(value));
   },seed);
   await page.goto('http://127.0.0.1:'+(8870+shard)+'/daruri/personal-export.html',{waitUntil:'networkidle'});
   await page.locator('input[name="pe-mode"][value="all"]').check();
   await page.locator('#pe-bookmarks').check();
   await page.locator('#pe-annotations').check();
   await page.locator('#pe-appendix').check();
   const opt=await page.locator('#pe-edition option').count();
   if(opt!==17)throw Error('Expected 17 independently published base/canonical choices, got '+opt);
  }
  await newPage();
  for(let i=0;i<selected.length;i++){
   const name=selected[i],since=Date.now(),output=path.join(dir,'personal-'+shard+'-'+i+'.pdf');
   let result={file:name,shard};let dl=null;
   try{
    if(i&&i%8===0)await newPage();
    await page.locator('#pe-edition').selectOption(name);
    const button=page.locator('#pe-generate');
    if(await button.isDisabled())throw Error('Generator unexpectedly disabled: '+await page.locator('#pe-count').innerText());
    const promise=page.waitForEvent('download',{timeout:180000});
    await button.click();
    dl=await promise;
    await dl.saveAs(output);
    const alerted=await page.locator('#pe-alert').innerText();
    if(/export failed|error/i.test(alerted))throw Error('UI error: '+alerted.slice(0,500));
    const check=spawnSync('python3',
      [path.join(root,'pdf_parity_ci/audit_personal_pdf.py'),path.join(root,'daruri',name),output],
      {encoding:'utf8',timeout:120000,maxBuffer:20*1024*1024});
    if(!check.stdout?.trim())throw Error('No PDF audit output: '+String(check.stderr).slice(-500));
    const audit=JSON.parse(check.stdout.trim().split('\n').at(-1));
    // Every edition must retain English and *both* mixed/Arabic-only source
    // notes with accurate text extraction, not just visually rendered Arabic.
    audit.pdfjs_checks=await verifyArabicUsingPdfJs(output,audit.published_pages);
    if(!audit.pdfjs_checks.mixedArabicWord||!audit.pdfjs_checks.ArabicPhrase||
       !audit.pdfjs_checks.EnglishSentinel||audit.pdfjs_checks.illegalControls){
      audit.problems.push('pdfjs-appendix-search-layer-failed');
      audit.pass=false;
    }
    result={...result,...audit,elapsed_seconds:+((Date.now()-since)/1000).toFixed(2),byte_count:fs.statSync(output).size};
    if(!audit.pass)result.pass=false;
   }catch(e){
    result.pass=false;result.problems=[...(result.problems||[]),String(e).slice(0,1400)];
    result.elapsed_seconds=+((Date.now()-since)/1000).toFixed(2);
   }finally{
    if(fs.existsSync(output))fs.unlinkSync(output);
    if(dl)await dl.delete().catch(()=>{});
   }
   results.push(result);
   console.log((result.pass?'PASS':'FAIL')+' '+(i+1)+'/'+selected.length+' '+name+' '+result.elapsed_seconds+'s'+(!result.pass?' '+JSON.stringify(result.problems):''));
   if(i%8===0)fs.writeFileSync(path.join(reports,'shard-'+shard+'.json'),JSON.stringify({shard,shards,expected:selected.length,results,errors:allErrors},null,2));
  }
 }finally{
  await browser.close();
  server.kill('SIGTERM');
  fs.writeFileSync(path.join(reports,'shard-'+shard+'.json'),JSON.stringify({shard,shards,expected:selected.length,passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,results,errors:allErrors},null,2));
  fs.rmSync(dir,{recursive:true,force:true});
 }
 const failures=results.filter(x=>!x.pass);
 if(failures.length)throw Error(failures.length+'/'+results.length+' published edition personal exports failed inspection.');
 if(allErrors.length)throw Error('Browser JavaScript errors: '+allErrors.slice(0,3));
})().catch(e=>{console.error(e);server.kill('SIGTERM');process.exitCode=1;});
