'use strict';
/* Fault injection: one actively-used REQUIRED script fails while the reading
 * HTML and optional resources are available. A NEW worker must not delete
 * working old caches and claim complete offline readiness in this condition.
 * Localhost fixture only; no production traffic or personal notes. */
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(__dirname,'cache-audit-artifacts');
fs.mkdirSync(OUT,{recursive:true});
const SW=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');
const CACHE=(SW.match(/const NAME="([^"]+)"/)||[])[1];
const REQUIRED='reading-mode-controls.js';
if(!CACHE)throw Error('Cannot read worker cache name');
const requests=[];
const server=http.createServer((req,res)=>{
 let url;try{url=new URL(req.url,'http://local')}catch(_){res.writeHead(400);res.end();return;}
 const asset=url.pathname.split('/').pop();
 requests.push({path:url.pathname,status:asset===REQUIRED?404:200});
 if(asset===REQUIRED){res.writeHead(404,{'cache-control':'no-store'});res.end();return;}
 let content='',type='text/plain';
 if(url.pathname==='/daruri/'||asset==='index.html'){
  type='text/html';
  content='<html><body><h1>Offline fault fixture</h1>'+
   '<script src="reading-mode-controls.js?v=20261025-audit-cache1"></script>'+
   '<script>navigator.serviceWorker.register("sw.js?v=20261025-audit-cache1")</script></body></html>';
 }else if(asset==='sw.js'){type='text/javascript';content=SW;}
 else if(/\.js$/.test(asset)){type='text/javascript';content='/* isolated core */';}
 else if(/\.css$/.test(asset)){type='text/css';content='/* local CSS */';}
 else if(/\.html$/.test(asset)){type='text/html';content='<p>Fallback</p>';}
 else if(/\.json$/.test(asset)){type='application/json';content='{}';}
 else if(/\.svg$/.test(asset)){type='image/svg+xml';content='<svg xmlns="http://www.w3.org/2000/svg"/>';}
 else if(/\.(?:pdf|ttf|woff2|webp|png)$/.test(asset)){
  res.writeHead(404,{'cache-control':'no-store'});res.end();return;
 }else content='okay';
 res.writeHead(200,{'content-type':type,'cache-control':'no-store'});res.end(content);
});
(async()=>{
 await new Promise(res=>server.listen(0,'127.0.0.1',res));
 let result={cache:CACHE,missing:REQUIRED};
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const ctx=await browser.newContext({serviceWorkers:'allow'});
 try{
  const page=await ctx.newPage(),origin='http://127.0.0.1:'+server.address().port;
  await page.goto(origin+'/daruri/',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForTimeout(12000);
  const observed=await page.evaluate(async()=>{
   const reg=await navigator.serviceWorker.getRegistration();
   const cacheNames=await caches.keys();
   const cache=await caches.open(cacheNames[0]||'__none__');
   const entries=(await cache.keys()).map(r=>new URL(r.url).pathname);
   return {active:reg?.active?.scriptURL||null,installing:reg?.installing?.scriptURL||null,
    waiting:reg?.waiting?.scriptURL||null,cacheNames,entries:entries.length,
    missingAssetCached:entries.some(p=>p.endsWith('/reading-mode-controls.js'))};
  });
  result={...result,...observed,requests:requests.length,critical404s:requests.filter(x=>x.status===404).length};
  console.log('OFFLINE CORE FAULT '+JSON.stringify(result));
  // A fresh worker advertising offline availability despite an uncached
  // required script is not a complete, recoverable installation.
  if(observed.active&&observed.cacheNames.includes(CACHE)&&!observed.missingAssetCached)
   throw Error('Unsafe service-worker activation: the critical reading-mode-controls.js failed, but new cache became active');
  console.log('PASS: incomplete core release did not activate');
 }catch(e){result.failure=String(e.stack||e).slice(0,1500);process.exitCode=1;console.error('FAIL OFFLINE CORE '+result.failure);}
 finally{
  await ctx.close();await browser.close();server.close();
  fs.writeFileSync(path.join(OUT,'incomplete-core-install.json'),JSON.stringify(result,null,2));
 }
})().catch(e=>{server.close();console.error(e.stack||e);process.exitCode=1;});
