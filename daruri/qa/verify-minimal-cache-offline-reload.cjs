'use strict';
/* Minimal cache-backed offline reload control for Chromium and WebKit.
 * Helps identify Playwright WebKit offline-mode errors separate from Gnamma SW. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const OUT=path.join(__dirname,'cache-audit-artifacts');fs.mkdirSync(OUT,{recursive:true});
const SW="const NAME='gnamma-qa-minimal-cache';"+
"self.addEventListener('install',e=>e.waitUntil(caches.open(NAME).then(c=>c.addAll(['./','index.html','demo.js'])).then(()=>self.skipWaiting())));"+
"self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));"+
"self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;"+
"e.respondWith(fetch(e.request).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||Response.error())))})";
const HTML='<html><head><meta charset="utf-8"></head><body><h1>Offline minimal cache</h1>'+
'<script src="demo.js"></script><script>navigator.serviceWorker.register("sw.js").catch(e=>{document.body.dataset.error=String(e)})</script></body></html>';
const server=http.createServer((req,res)=>{
 let p=new URL(req.url,'http://localhost').pathname,asset=p.split('/').pop(),type='text/plain',body='ok';
 if(p==='/daruri/'||asset==='index.html'){type='text/html';body=HTML;}
 else if(asset==='sw.js'){type='text/javascript';body=SW;}
 else if(asset==='demo.js'){type='text/javascript';body='window.__minimalOffline="ready";';}
 res.writeHead(200,{'content-type':type,'cache-control':'no-store'});res.end(body);
});
const results=[];
async function run(api,name,origin){
 const browser=await api.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'allow'});
 const page=await ctx.newPage();let state={engine:name},errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(origin+'/daruri/',{waitUntil:'domcontentloaded',timeout:25000});
  const until=Date.now()+18000;let worker;
  do{
   worker=await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();
    return {active:r?.active?.state||'',controller:!!navigator.serviceWorker.controller,caches:await caches.keys()};});
   if(worker.active==='activated')break;
   await page.waitForTimeout(200);
  }while(Date.now()<until);
  if(worker.active!=='activated')throw Error('Tiny cache worker did not install '+JSON.stringify(worker));
  await page.reload({waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:12000});
  state.online=await page.evaluate(()=>({asset:window.__minimalOffline,
   controller:!!navigator.serviceWorker.controller}));
  await ctx.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded',timeout:20000});
  state.offline=await page.evaluate(()=>({asset:window.__minimalOffline,
   controller:!!navigator.serviceWorker.controller,body:document.body.innerText.slice(0,80)}));
  if(state.offline.asset!=='ready')throw Error('Minimal offline cached JS failed to load');
  state.passed=true;
 }catch(e){state.failure=String(e.stack||e).slice(0,1700);state.passed=false;}
 finally{
  state.errors=errors;
  results.push(state);console.log('MINIMAL OFFLINE '+JSON.stringify(state));
  await ctx.close();await browser.close();
 }
}
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 try{
  const url='http://127.0.0.1:'+server.address().port;
  await run(chromium,'chromium',url);
  await run(webkit,'webkit',url);
 }finally{
  server.close();
  fs.writeFileSync(path.join(OUT,'minimal-cache-offline-reload.json'),JSON.stringify(results,null,2));
  console.log('MINIMAL OFFLINE SUMMARY '+JSON.stringify({engines:results.length,passes:results.filter(r=>r.passed).map(r=>r.engine),failures:results.filter(r=>!r.passed).map(r=>r.engine)}));
 }
 if(results.length!==2||results.some(r=>!r.passed))process.exitCode=1;
})().catch(e=>{server.close();console.error(e.stack||e);process.exitCode=1;});
