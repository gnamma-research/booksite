#!/usr/bin/env node
'use strict';
// Browser-only safety acceptance against the candidate checked out in this job.
// Never modifies publication source PDFs, maps, approved edition bytes or real notes.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {spawn}=require('node:child_process');
const root=path.resolve(process.env.GNAMMA_SITE_ROOT||path.resolve(__dirname,'../..'));
const {chromium,webkit}=require(path.join(root,'daruri/qa/node_modules/playwright'));
const engine=process.env.GNAMMA_BROWSER||'chromium';
const port=engine==='webkit'?8842:8841,base='http://127.0.0.1:'+port;
const browserType=engine==='webkit'?webkit:chromium;
const records=[
 {id:'n1',kind:'note',title:'Private synthetic note',body:'KEEP_PRIVATE_IN_BROWSER',
  target:{kind:'quote',section:'1',segment:0,lang:'en',quote:'knowledge'},
  created:1,updated:1,dateSource:'recorded',deleted:0},
 {id:'n2',kind:'note',title:'Standalone synthetic note',body:'Arabic العربية',
  target:null,standalone:true,created:2,updated:2,dateSource:'recorded',deleted:0}
];
const storage=JSON.stringify({format:'gnamma-reading-desk',version:1,items:records});
const logs=[];
let browser,server;
const check=async(name,fn)=>{
 try{const result=await fn();logs.push({name,passed:true,details:result||''});console.log('RELEASE_SAFETY',name,'PASS');}
 catch(e){logs.push({name,passed:false,error:String(e.stack||e)});console.error('RELEASE_SAFETY',name,'FAIL',String(e));}
};
const waitForReady=async(page)=>{
 await page.waitForFunction(()=>
 document.querySelector('#gn-dyn-profile')?.options.length===120&&
 !document.querySelector('#gn-dyn-make')?.disabled&&
 window.GnammaPersonalExportInline?.ready,null,{timeout:90000});
};
const latest=page=>page.locator('#gn-dyn-status').innerText();
(async()=>{
 try{
  server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',root],{stdio:'ignore'});
  await new Promise(resolve=>setTimeout(resolve,1200));
  browser=await browserType.launch(engine==='chromium'&&process.env.GNAMMA_CHROME_CHANNEL?
   {headless:true,channel:process.env.GNAMMA_CHROME_CHANNEL}:{headless:true});
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,
    deviceScaleFactor:2,acceptDownloads:true,serviceWorkers:'block'});
  const page=await ctx.newPage();
  const pageErrors=[],outbound=[];
  page.on('pageerror',e=>pageErrors.push(e.message));
  page.on('request',r=>{
   if(r.url().startsWith('http')&&(!r.url().startsWith(base)||r.method()!=='GET'))
    outbound.push({url:r.url(),method:r.method()});
  });
  await page.addInitScript(value=>localStorage.setItem('gnamma-reading-desk-v1',value),storage);
  await page.goto(base+'/daruri/dynamic-editions.html',{waitUntil:'domcontentloaded',timeout:90000});
  await waitForReady(page);
  const selected='apparatus/daruri-reading-bilingual-glossary.pdf';
  const other='apparatus/daruri-reading-english-index-concordance.pdf';
  const selectedBase='editions/reading/daruri-reading-bilingual-titles-off.pdf';
  const otherBase='editions/reading/daruri-reading-english-titles-off.pdf';
  await check('no empty/generated PDF can be opened',async()=>{
   assert.equal(await page.locator('#gn-dyn-download').isVisible(),false);
   assert.equal(await page.locator('#gn-dyn-download').getAttribute('href'),null);
   assert.equal(await page.locator('#gn-dyn-cancel').isVisible(),false);
   assert(await page.locator('#gn-dyn-profile').isEnabled());
  });
  await check('successful local personal edition is tied to the selected exact profile',async()=>{
   assert.equal(await page.locator('#gn-dyn-profile').inputValue(),selected);
   await page.locator('#gn-dyn-personal').click();
   await page.waitForFunction(()=>document.getElementById('pe-edition')?.value.startsWith('generated-'),null,{timeout:90000});
   assert(await page.locator('#gn-dyn-download').isVisible());
   assert.match(await latest(page),/Verified \d+ pages/);
   return await page.locator('#pe-edition').inputValue();
  });
  await check('changing profile invalidates the prior generated personal edition',async()=>{
   await page.locator('#gn-dyn-profile').selectOption(other);
   const expected=otherBase;
   assert.equal(await page.locator('#pe-edition').inputValue(),expected);
   assert(!await page.locator('#pe-edition option[value^="generated-"]').count());
   assert.equal(await page.locator('#gn-dyn-download').isVisible(),false);
   assert.equal(await page.locator('#gn-dyn-download').getAttribute('href'),null);
   assert.match(await page.locator('#pe-clean').getAttribute('href'),/daruri-reading-english-titles-off\.pdf$/);
   return expected;
  });
  await check('failed new profile cannot resurrect old generated edition',async()=>{
   await page.route('**/dynamic-pdf/packets/gnamma-apparatus-index-concordance.pdf',
    route=>route.fulfill({status:503,body:'Synthetic outage'}));
   await page.locator('#gn-dyn-make').click();
   await page.waitForFunction(()=>document.getElementById('gn-dyn-status')?.dataset.error==='true',null,{timeout:60000});
   assert.match(await latest(page),/503/);
   assert.equal(await page.locator('#pe-edition').inputValue(),otherBase);
   assert.equal(await page.locator('#gn-dyn-download').isVisible(),false);
   assert.equal(await page.locator('#gn-dyn-download').getAttribute('href'),null);
   assert(await page.locator('#gn-dyn-make').isEnabled());
   await page.unroute('**/dynamic-pdf/packets/gnamma-apparatus-index-concordance.pdf');
  });
  await check('cancel a never-ending asset fetch and suppress late stale publication',async()=>{
   await page.locator('#gn-dyn-profile').selectOption(selected);
   let started,release,notifyStart;
   const seen=new Promise(resolve=>{notifyStart=resolve;});
   const hold=new Promise(resolve=>{release=resolve;});
   const pattern='**/dynamic-pdf/packets/gnamma-apparatus-glossary.pdf';
   await page.route(pattern,async route=>{
    notifyStart();
    await hold;
    try{await route.fulfill({status:503,body:'Late old packet'});}catch(_){} 
   });
   await page.locator('#gn-dyn-make').click();
   await Promise.race([seen,new Promise((_,reject)=>setTimeout(()=>reject(Error('Never reached held packet')),30000))]);
   assert(await page.locator('#gn-dyn-cancel').isVisible());
   await page.locator('#gn-dyn-cancel').click();
   await page.waitForFunction(()=>!/disabled/.test(document.querySelector('#gn-dyn-make')?.outerHTML||''),
    null,{timeout:10000}).catch(()=>{});
   assert.match(await latest(page),/cancelled/i);
   assert(await page.locator('#gn-dyn-make').isEnabled());
   assert.equal(await page.locator('#gn-dyn-download').isVisible(),false);
   assert.equal(await page.locator('#pe-edition').inputValue(),selectedBase);
   release();
   await page.unroute(pattern);
   await new Promise(resolve=>setTimeout(resolve,700));
   assert.equal(await page.locator('#gn-dyn-download').isVisible(),false);
   assert(!await page.locator('#pe-edition').inputValue().then(s=>s.startsWith('generated-')));
   return 'Network abort, no stale PDF, immediate retry enabled';
  });
  await check('terminate a real CPU-busy PDF worker without freezing the page',async()=>{
   await page.evaluate(()=>{
    const NativeWorker=window.Worker;
    window.__gnNativeWorker=NativeWorker;
    window.Worker=function(){
     const busyCode='self.onmessage=function(){while(true){}};';
     const blob=new Blob([busyCode],{type:'application/javascript'});
     const url=URL.createObjectURL(blob);
     const worker=new NativeWorker(url);
     const originalTerminate=worker.terminate.bind(worker);
     worker.terminate=function(){originalTerminate();URL.revokeObjectURL(url);};
     return worker;
    };
   });
   try{
    await page.locator('#gn-dyn-make').click();
    await page.waitForFunction(()=>
     /Composing verified pages/.test(document.querySelector('#gn-dyn-status')?.textContent||''),
     null,{timeout:60000});
    await new Promise(resolve=>setTimeout(resolve,180));
    assert(await page.locator('#gn-dyn-cancel').isVisible());
    await page.locator('#gn-dyn-cancel').click();
    assert.match(await latest(page),/cancelled/i);
    assert(await page.locator('#gn-dyn-make').isEnabled());
    assert.equal(await page.locator('#gn-dyn-download').isVisible(),false);
    assert.equal(await page.locator('#pe-edition').inputValue(),selectedBase);
   }finally{
    await page.evaluate(()=>{window.Worker=window.__gnNativeWorker;delete window.__gnNativeWorker;});
   }
   return 'Dedicated CPU worker terminated; main UI remained responsive';
  });
  await check('cancelled asset retry produces the correct verified PDF',async()=>{
   await page.locator('#gn-dyn-make').click();
   await page.waitForFunction(()=>/Verified \d+ pages/.test(
    document.querySelector('#gn-dyn-status')?.textContent||''),null,{timeout:90000});
   assert.equal(await page.locator('#gn-dyn-download').isVisible(),true);
   assert.match(await page.locator('#gn-dyn-download').getAttribute('href'),/^blob:/);
   assert.equal(await page.locator('#pe-edition').inputValue(),selectedBase);
   return (await latest(page)).slice(0,140);
  });
  await check('synthetic Reading Desk and privacy preserved throughout',async()=>{
   assert.equal(await page.evaluate(()=>localStorage.getItem('gnamma-reading-desk-v1')),storage);
   assert.deepEqual(pageErrors,[]);
   assert.deepEqual(outbound,[]);
  });
  await ctx.close();
 }catch(e){
  logs.push({name:'suite fatal',passed:false,error:String(e.stack||e)});
  console.error(e);
 }finally{
  await browser?.close().catch(()=>{});
  server?.kill();
  const out=path.resolve(process.env.GNAMMA_REPORT_DIR||('/tmp/daruri-cancellation-'+engine));
  fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(path.join(out,'cancel-identity-report.json'),JSON.stringify({
   engine,source:'isolated integration branch',tests:logs,passed:logs.filter(x=>x.passed).length,
   failed:logs.filter(x=>!x.passed).length,release_approved:false
  },null,2)+'\n');
  console.log('RELEASE_SAFETY_FINAL',JSON.stringify({
   engine,passed:logs.filter(x=>x.passed).length,failed:logs.filter(x=>!x.passed).length
  }));
  if(logs.some(x=>!x.passed))process.exitCode=1;
 }
})();
