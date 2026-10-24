'use strict';
/* Secondary independent Daruri QA: all modes, real cached offline, static fallback. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(__dirname,'audit-artifacts');fs.mkdirSync(OUT,{recursive:true});
const results=[],failures=[];
const TYPE={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.png':'image/png','.webp':'image/webp','.pdf':'application/pdf'};
const server=http.createServer((req,res)=>{
 let p;try{p=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch(_){res.writeHead(400);res.end();return;}
 const loc=path.resolve(ROOT,'.'+p);
 if(!loc.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(loc)&&fs.statSync(loc).isDirectory()?path.join(loc,'index.html'):loc;
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 const n=fs.statSync(file).size;res.writeHead(200,{'content-type':TYPE[path.extname(file)]||'application/octet-stream','content-length':n,'cache-control':'no-store'});
 fs.createReadStream(file).pipe(res);
});
async function check(name,fn,severity='P1'){
 try{const x=await fn();results.push({name,ok:true,details:x});console.log('PASS '+name+' '+JSON.stringify(x).slice(0,1500));}
 catch(e){const detail=String(e.stack||e).slice(0,2800);failures.push({name,severity,detail});console.log('FAIL '+name+' '+detail);}
}
async function modes(browser,name,origin,width,level){
 const ctx=await browser.newContext({viewport:{width,height:width===320?568:844},isMobile:width<=768,hasTouch:width<=768,reducedMotion:'reduce',serviceWorkers:'block'});
 await ctx.addInitScript(level=>{localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'11',lang:'parallel',focusLevel:level,focusApparatus:false}))},level);
 const page=await ctx.newPage();page.setDefaultTimeout(10000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(origin+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#readerDock:not([hidden])').waitFor({timeout:24000});
  const g=await page.evaluate(()=>{
   const w=document.documentElement.clientWidth,toolbar=document.getElementById('readingControls')?.getBoundingClientRect();
   const buttons=['menuBtn','focusToolbar','readerSaveAction','readerCopyAction','readerShareAction','searchBtn','settingsBtn'];
   const boxes=buttons.map(id=>{const el=document.getElementById(id),r=el?.getBoundingClientRect(),svg=el?.querySelector('svg'),sr=svg?.getBoundingClientRect();return {id,visible:!!r?.width&&!!r?.height,rect:[r?.left,r?.right,r?.top,r?.bottom],size:[r?.width,r?.height],svgSize:[sr?.width||0,sr?.height||0],aria:el?.getAttribute('aria-label')||el?.title||''};});
   return{w,scrollWidth:document.documentElement.scrollWidth,barHeight:toolbar?.height,focus:document.body.classList.contains('focus-mode'),focusLevel:document.body.className.match(/focus-level-\d/)?.[0],boxes};
  });
  results.push({name:'geometry-'+name+'-'+width+'-mode'+level,details:g,ok:true});
  const problems=[];
  if(g.focus!==(level>0))problems.push('Focus state does not match saved mode');
  for(const b of g.boxes)if(!b.visible)problems.push(b.id+' hidden');
  for(const b of g.boxes)if(b.visible&&(b.rect[0]<-1||b.rect[1]>g.w+1))problems.push(b.id+' clipped');
  if(g.scrollWidth>g.w+2)problems.push('horizontal overflow '+g.scrollWidth);
  if(errors.length)problems.push('JavaScript errors '+errors.join('; '));
  if(problems.length)throw Error(JSON.stringify({problems,g}).slice(0,3400));
  if(level===0){
   await page.locator('#menuBtn').click();
   await page.locator('#leftNav [data-route="home"]').waitFor({state:'visible'});
   await page.locator('#leftNav [data-route="home"]').click();
   await page.locator('#mainContent .gnamma-home').waitFor();
   if(await page.locator('#gnTopRead').isVisible()){
    await page.locator('#gnTopRead').click();
    await page.locator('#readerDock:not([hidden])').waitFor();
   }
  }
  if(name==='chromium'&&width===320&&level===0)await page.screenshot({path:path.join(OUT,'ordinary-chromium-320.png')});
  return {mode:level,toolbar:g.barHeight,controls:g.boxes.map(x=>({id:x.id,w:x.size[0],icon:x.svgSize}))};
 }finally{await ctx.close();}
}
async function noJSNative(browser,name,origin){
 const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:568},serviceWorkers:'block'});
 try{
  const page=await ctx.newPage();
  await page.goto(origin+'/daruri/',{waitUntil:'domcontentloaded'});
  const x=await page.evaluate(()=>{
   const links=[...document.querySelectorAll('a[href^="#"]')].map(a=>({href:a.getAttribute('href'),text:a.textContent.trim().slice(0,35),hasTarget:!!document.getElementById(decodeURIComponent(a.hash.substring(1)))}));
   return{links:links.length,targetable:links.filter(x=>x.hasTarget).length,bodyChars:document.body.innerText.trim().length,examples:links.slice(0,12)};
  });
  if(x.targetable<10)throw Error('Native fallback does not have ten valid internal targets: '+JSON.stringify(x));
  return x;
 }finally{await ctx.close();}
}
async function offline(origin){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'allow'});
 let phase='initial';
 try{
  const page=await ctx.newPage();
  await page.goto(origin+'/daruri/',{waitUntil:'domcontentloaded',timeout:90000});
  await page.locator('body.reader-enhanced').waitFor({timeout:30000});
  phase='install';
  await page.waitForFunction(async()=>{if(!('serviceWorker' in navigator))return false;return !!(await navigator.serviceWorker.getRegistration())?.active},{timeout:75000});
  const cached=await page.evaluate(async()=>{const keys=await caches.keys(),all=await Promise.all(keys.map(async k=>({name:k,count:(await (await caches.open(k)).keys()).length})));return all;});
  phase='offline reload';
  await ctx.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.locator('#readerDock:not([hidden])').waitFor({timeout:20000});
  const body=await page.locator('body').innerText();
  if(body.length<500)throw Error('No offline readable source');
  await page.screenshot({path:path.join(OUT,'offline-chromium-390.png'),fullPage:false});
  return {phase:'complete',caches:cached,bodyChars:body.length};
 }catch(e){throw Error(phase+': '+e.message);}
 finally{await ctx.close();await browser.close();}
}
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const origin='http://127.0.0.1:'+server.address().port;
 try{
  for(const [engine,browserType] of [['chromium',chromium],['webkit',webkit]]){
   const browser=await browserType.launch({headless:true,...(engine==='chromium'?{args:['--no-sandbox']}:{})});
   try{
    for(const w of [320,390,768,1280])for(const level of [0,2,3])await check(engine+'-'+w+'-mode'+level,()=>modes(browser,engine,origin,w,level));
    await check(engine+'-noJS-native-links',()=>noJSNative(browser,engine,origin));
   }finally{await browser.close();}
  }
  await check('chromium-actual-offline-service-worker',()=>offline(origin),'P1');
 }finally{
  server.close();
  fs.writeFileSync(path.join(OUT,'mode-offline-report.json'),JSON.stringify({results,failures},null,2));
  console.log('MODE-OFFLINE-SUMMARY '+JSON.stringify({pass:results.filter(x=>x.ok).length,fail:failures.length,issues:failures.map(x=>({name:x.name,detail:x.detail.slice(0,250)}))}));
 }
 if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exitCode=1;server.close()});
