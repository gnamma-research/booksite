'use strict';
/* Control: is service-worker controller acquisition available in Playwright
 * WebKit/Chromium with a tiny, valid worker at this localhost origin? */
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium,webkit}=require('playwright');
const OUT=path.join(__dirname,'cache-audit-artifacts');fs.mkdirSync(OUT,{recursive:true});
const script="self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));"+
"self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));"+
"self.addEventListener('fetch',e=>{if(e.request.method==='GET')e.respondWith(fetch(e.request))});";
const html='<!doctype html><html><body><h1>Minimal service worker proof</h1><script>'+
'navigator.serviceWorker.register("sw.js").catch(e=>document.body.dataset.swError=String(e))'+
'</script></body></html>';
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://local'),worker=url.pathname.endsWith('/sw.js');
 res.writeHead(200,{'content-type':worker?'text/javascript':'text/html','cache-control':'no-store'});
 res.end(worker?script:html);
});
const records=[];
async function probe(api,name,origin){
 const browser=await api.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
 const context=await browser.newContext({serviceWorkers:'allow',viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/daruri/',{waitUntil:'domcontentloaded',timeout:25000});
  await page.waitForFunction(()=>navigator.serviceWorker.getRegistration().then(r=>r?.active?.state==='activated'),null,{timeout:20000}).catch(()=>{});
  await page.goto(origin+'/daruri/?reload=1',{waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:20000}).catch(()=>{});
  const state=await page.evaluate(async()=>{
   const r=await navigator.serviceWorker.getRegistration();
   return {supported:'serviceWorker' in navigator,secure:isSecureContext,
    active:r?.active?.state||null,activeURL:r?.active?.scriptURL||null,
    installing:r?.installing?.state||null,controller:!!navigator.serviceWorker.controller,
    script:navigator.serviceWorker.controller?.scriptURL||null,
    registrationError:document.body.dataset.swError||''};
  });
  records.push({engine:name,...state,errors});
  console.log('MINIMAL SW '+JSON.stringify(records.at(-1)));
 }finally{await context.close();await browser.close();}
}
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 try{
  const base='http://127.0.0.1:'+server.address().port;
  await probe(chromium,'chromium',base);
  await probe(webkit,'webkit',base);
 }finally{
  server.close();
  fs.writeFileSync(path.join(OUT,'minimal-worker-control.json'),JSON.stringify(records,null,2));
  console.log('MINIMAL SW SUMMARY '+JSON.stringify({engines:records.length,controlled:records.filter(x=>x.controller).map(x=>x.engine)}));
 }
 if(records.length!==2||records.some(x=>!x.controller))process.exitCode=1;
})().catch(e=>{server.close();console.error(e.stack||e);process.exitCode=1;});
