#!/usr/bin/env node
'use strict';
/* Native browser-only vector PDF export proof with no server PDF endpoint.
 * The Node runner clicks an ordinary web page and captures the browser's
 * downloaded Blob; it NEVER calls Playwright page.pdf()/CDP printToPDF.
 */
const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const {chromium,webkit}=require('./node_modules/playwright');
const repo=path.resolve(__dirname,'../..');
const kind=process.env.GN_BROWSER||'chromium';
const mode=process.env.GN_PDF_SCENARIO||'excerpt';
const port=Number(process.env.GN_BROWSER_PORT||8904);
const targetDir=process.env.GN_PDF_OUT||'/tmp/daruri-browser-native-pdf';
const outputPdf=path.join(targetDir,'daruri-'+kind+'-'+mode+'-NONRELEASE.pdf');
const outputLog=path.join(targetDir,'browser-'+kind+'-'+mode+'-evidence.json');
const host='http://127.0.0.1:'+port;
const viewer=host+'/daruri/qa/browser_pdf_vector_probe.html';
const onConsole=[],requests=[],fatal=[];
let browser=null,ctx=null,server=null;
function delay(n){return new Promise(r=>setTimeout(r,n))}
async function main(){
 const engine=kind==='webkit'?webkit:chromium;
 assert(['webkit','chromium'].includes(kind));
 assert(['excerpt','english-full','bilingual-full'].includes(mode));
 fs.mkdirSync(targetDir,{recursive:true});
 server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',repo],{stdio:'ignore'});
 await delay(1000);
 browser=await engine.launch({headless:true});
 ctx=await browser.newContext({viewport:{width:980,height:900},acceptDownloads:true,serviceWorkers:'block'});
 const page=await ctx.newPage();
 page.setDefaultTimeout(30000);
 page.on('pageerror',e=>fatal.push(String(e)));
 page.on('console',m=>{if(m.type()==='error')onConsole.push(m.text().slice(0,900))});
 page.on('request',r=>requests.push({url:r.url(),method:r.method()}));
 await page.goto(viewer,{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForFunction(()=>document.querySelector('#status')?.textContent.startsWith('Ready:'),null,{timeout:45000});
 await page.selectOption('#scenario',mode);
 const downloadPromise=page.waitForEvent('download',{timeout:180000}).catch(()=>null);
 await page.click('#make');
 await page.waitForFunction(()=>['done','error'].includes(window.__pdfProof?.state),null,{timeout:180000});
 const status=await page.evaluate(()=>window.__pdfProof);
 const result={
   status,mode,engine:kind,origin:host,
   pageErrors:fatal,consoleErrors:onConsole,
   requests:requests.map(x=>({path:x.url.replace(host,''),method:x.method})),
   externalNetworkRequests:requests.filter(x=>!x.url.startsWith(host)),
   prebuiltPdfRequests:requests.filter(x=>/\.pdf(?:\?|$)/i.test(x.url)),
   generatedWithoutPrintDialog:true,
   playwrightPagePdfNotUsed:true,
   previewOriginalSourceHtmlOnly:true,
   artifact:outputPdf,releaseApproved:false,
 };
 if(status?.state==='done'){
   const download=await downloadPromise;
   assert(download,'The web page did not trigger a real browser file download');
   await download.saveAs(outputPdf);
   const pdf=fs.readFileSync(outputPdf);
   assert.equal(pdf.subarray(0,5).toString('ascii'),'%PDF-');
   result.bytes=pdf.length;
   assert.equal(status.bytes,pdf.length);
 }else result.error=status?.error??'Unknown browser error';
 fs.writeFileSync(outputLog,JSON.stringify(result,null,2)+'\n');
 console.log('TRUE_BROWSER_PDF_RESULT',JSON.stringify({
   engine:kind,mode,state:status?.state,bytes:result.bytes||0,
   milliseconds:status?.milliseconds,jsHeapChange:
     status?.memBefore==null?null:(status.memAfter-status.memBefore),
   external_requests:result.externalNetworkRequests.length,
   prebuilt_pdf_requests:result.prebuiltPdfRequests.length,
   page_errors:fatal.length,
   error:status?.error?.slice(0,1800)||null,
   consoleErrors:onConsole.slice(0,4),
   log_file:outputLog
 }));
 if(status?.state!=='done'||fatal.length||result.externalNetworkRequests.length||
    result.prebuiltPdfRequests.length){
   process.exitCode=2;
 }
}
main().catch(e=>{
 console.error('TRUE_BROWSER_PDF_FATAL',e?.stack||String(e));
 fs.mkdirSync(targetDir,{recursive:true});
 fs.writeFileSync(outputLog,JSON.stringify({engine:kind,mode,fatal:String(e?.stack||e),releaseApproved:false},null,2));
 process.exitCode=2;
}).finally(async()=>{
 try{await ctx?.close()}catch{}
 try{await browser?.close()}catch{}
 try{server?.kill()}catch{}
});
