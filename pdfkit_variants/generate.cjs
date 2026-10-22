'use strict';
const fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const {chromium}=require(path.resolve(__dirname,'../daruri/qa/node_modules/playwright'));
const repo=path.resolve(__dirname,'..'),outfile=process.env.OUTPUT_PDF;
if(!outfile)throw Error('OUTPUT_PDF is required');
const host='http://127.0.0.1:8943';
const server=spawn('python3',['-m','http.server','8943','--bind','127.0.0.1'],{cwd:repo,stdio:'ignore'});
const seed={format:'gnamma-reading-desk',version:1,items:[
{id:'ar1',kind:'note',title:'Arabic note',body:'مقدمة العلوم الدقيقة بين الحقيقة والأصول؛ والتحليل. Des idées françaises.',
target:{kind:'quote',section:'1',segment:0,lang:'en',quote:'knowledge'},
created:Date.UTC(2026,9,22),updated:Date.UTC(2026,9,22),dateSource:'recorded',deleted:0},
{id:'ar2',kind:'note',title:'Arabic-only note',body:'والتحليل والبيان في أصول الفقه ونتائج الاجتهاد',
target:null,standalone:true,
created:Date.UTC(2026,9,22)+1,updated:Date.UTC(2026,9,22)+1,dateSource:'recorded',deleted:0}
]};
const delay=n=>new Promise(r=>setTimeout(r,n));
(async()=>{
 await delay(1000);
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const p=await browser.newPage({acceptDownloads:true});
  const errors=[];p.on('pageerror',e=>errors.push(String(e)));
  await p.addInitScript(data=>localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify(data)),seed);
  await p.goto(host+'/daruri/personal-export.html',{waitUntil:'networkidle'});
  await p.locator('input[name=pe-mode][value=all]').check();
  await p.locator('#pe-edition').selectOption('daruri.pdf');
  await p.locator('#pe-appendix').check();
  const promise=p.waitForEvent('download',{timeout:180000});
  await p.locator('#pe-generate').click();
  const dl=await promise;fs.mkdirSync(path.dirname(outfile),{recursive:true});
  await dl.saveAs(outfile);
  if(errors.length)throw Error(errors.join(' | '));
  console.log('GENERATED',outfile,'bytes',fs.statSync(outfile).size);
 }finally{await browser.close();server.kill();}
})().catch(e=>{console.error(e);server.kill();process.exitCode=1});
