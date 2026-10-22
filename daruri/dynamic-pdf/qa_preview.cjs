'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {spawn}=require('child_process'),{chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..'),port=8989,BASE='http://127.0.0.1:'+port;
const output=path.join(__dirname,'qa-outputs');fs.mkdirSync(output,{recursive:true});
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
const delay=n=>new Promise(r=>setTimeout(r,n));
(async()=>{
 await delay(1200);
 for(const [browserType,name,mobile] of [[chromium,'chromium-desktop',false],[webkit,'webkit-390px-proxy',true]]){
  const browser=await browserType.launch({headless:true,args:browserType===chromium?['--no-sandbox']:[]});
  try{
   const page=await browser.newPage({acceptDownloads:true,viewport:mobile?{width:390,height:844}:{width:1250,height:920},
     isMobile:mobile,hasTouch:mobile});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto(BASE+'/daruri/dynamic-pdf/preview.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>!document.getElementById('edition').disabled,{timeout:160000});
   assert.equal(await page.locator('#edition option').count(),120);
   await page.locator('#edition').selectOption('apparatus/daruri-reading-bilingual-glossary.pdf');
   await page.locator('#ack').check();
   if(mobile)assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Mobile viewport overflow');
   const promise=page.waitForEvent('download',{timeout:160000});
   await page.locator('#make').click();
   const dl=await promise;
   const dest=path.join(output,name+'.pdf');await dl.saveAs(dest);
   const message=await page.locator('#status').innerText();
   assert.match(message,/Verified local PDF assembled/);
   assert(!errors.length,'Browser exceptions: '+errors.join(';'));
   assert(fs.statSync(dest).size>500000,'PDF unusually small');
   await page.screenshot({path:path.join(output,name+'.png'),fullPage:true});
   fs.writeFileSync(path.join(output,name+'.json'),JSON.stringify({name,bytes:fs.statSync(dest).size,status:message},null,2));
   console.log('PASS',name,fs.statSync(dest).size,'bytes');
  }finally{await browser.close()}
 }
})().finally(()=>server.kill()).catch(e=>{console.error(e);process.exitCode=1});
