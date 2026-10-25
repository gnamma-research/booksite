'use strict';
/* WebKit scoped service-worker installation cost matrix.
 * Vary authored SW CORE/OPTIONAL list sizes to diagnose actual installation
 * blocking, keeping original install/fetch logic and cache policy intact.
 * Nonrelease local fixture; no real PDFs, notes or production load. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm');
const {webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(__dirname,'cache-audit-artifacts');
fs.mkdirSync(OUT,{recursive:true});
const SOURCE=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');
const m=SOURCE.match(/^const NAME="([^"]+)";const CORE=(\[[^\n]*?\]);const OPTIONAL=(\[[^\n]*?\]);/m);
if(!m)throw Error('Cannot isolate source service worker authored CORE and OPTIONAL arrays');
const allCore=vm.runInNewContext(m[2]),allOptional=vm.runInNewContext(m[3]);
const cases=[
 {id:'tiny',core:2,optional:0},
 {id:'small',core:25,optional:0},
 {id:'full-no-optional',core:allCore.length,optional:0},
 {id:'full-with-optional',core:allCore.length,optional:allOptional.length}
];
let activeCase=cases[0],queries=[];
function worker(){
 const core=allCore.slice(0,activeCase.core),optional=allOptional.slice(0,activeCase.optional);
 const before=m[0];
 const modified='const NAME="daruri-qa-webkit-'+activeCase.id+'";const CORE='+JSON.stringify(core)+
  ';const OPTIONAL='+JSON.stringify(optional)+';';
 return SOURCE.replace(before,modified);
}
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost'),p=u.pathname,asset=p.split('/').pop();
 queries.push({id:activeCase.id,p});
 let type='text/plain',body='';
 if(p==='/daruri/'||asset==='index.html'){
  type='text/html';
  body='<html><head><meta charset="utf-8"></head><body><h1>Gnamma offline install '+activeCase.id+'</h1>'+
   '<script>navigator.serviceWorker.register("sw.js?v='+activeCase.id+'").catch(e=>document.body.dataset.registrationError=String(e))</script>'+
   '</body></html>';
 }else if(asset==='sw.js'){type='text/javascript';body=worker();}
 else if(/\.js$/.test(asset)){type='text/javascript';body='/* synthetic JS */';}
 else if(/\.css$/.test(asset)){type='text/css';body='/* synthetic CSS */';}
 else if(/\.html$/.test(asset)){type='text/html';body='<p>available</p>';}
 else if(/\.json$/.test(asset)||asset==='manifest.webmanifest'){type='application/json';body='{}';}
 else if(/\.svg$/.test(asset)){type='image/svg+xml';body='<svg xmlns="http://www.w3.org/2000/svg"/>';}
 else if(/\.(?:pdf|ttf|woff2|png|webp|zip)$/.test(asset)){
  res.writeHead(404,{'cache-control':'no-store'});res.end();return;
 }else body='OK';
 res.writeHead(200,{'content-type':type,'cache-control':'no-store','content-length':Buffer.byteLength(body)});res.end(body);
});
const result=[];
async function run(config,origin){
 activeCase=config;
 const browser=await webkit.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'allow'});
 const page=await ctx.newPage(),started=Date.now();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let timedOut=false;
 try{
  await page.goto(origin+'/daruri/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(async()=>{
   const r=await navigator.serviceWorker.getRegistration();
   return r?.active?.state==='activated';
  },null,{timeout:28000}).catch(()=>{timedOut=true});
  const snapshot=await page.evaluate(async()=>{
   const r=await navigator.serviceWorker.getRegistration();
   return {active:r?.active?.state||null,installing:r?.installing?.state||null,
    waiting:r?.waiting?.state||null,controller:!!navigator.serviceWorker.controller,
    caches:await caches.keys(),registrationError:document.body.dataset.registrationError||''};
  });
  const record={case:config.id,core:config.core,optional:config.optional,
   ms:Date.now()-started,timedOut,requests:queries.filter(q=>q.id===config.id).length,
   ...snapshot,errors};
  result.push(record);
  console.log('SW INSTALL MATRIX '+JSON.stringify(record));
 }finally{await ctx.close();await browser.close();}
}
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 try{
  const origin='http://127.0.0.1:'+server.address().port;
  for(const config of cases)await run(config,origin);
 }finally{
  server.close();
  fs.writeFileSync(path.join(OUT,'webkit-offline-install-matrix.json'),JSON.stringify(result,null,2));
  console.log('SW MATRIX SUMMARY '+JSON.stringify({cases:result.length,active:result.filter(x=>x.active==='activated').map(x=>x.case),
   blocked:result.filter(x=>x.active!=='activated').map(x=>x.case)}));
 }
 // This is a diagnostic matrix; archive failures, but don't mask material
 // installation failures behind a false successful overall workflow.
 if(result.length!==cases.length||result.some(x=>x.active!=='activated'))process.exitCode=1;
})().catch(e=>{server.close();console.error(e.stack||e);process.exitCode=1;});
