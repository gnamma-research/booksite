'use strict';
/* Daruri end-to-end route and interaction graph. A regular static localhost
 * server, no user data, no production requests, no layout proxies. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.png':'image/png','.webp':'image/webp'};
const outcomes=[],issues=[];
const server=http.createServer((req,res)=>{
 let raw;try{raw=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch(_){res.writeHead(400);res.end();return;}
 const local=path.resolve(ROOT,'.'+raw);
 if(!local.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(local)&&fs.statSync(local).isDirectory()?path.join(local,'index.html'):local;
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'content-type':MIME[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
 fs.createReadStream(file).pipe(res);
});
const routes=['home','contents','study','editions','index','applications','glossary','bookmarks','about','help'];
async function testBrowser(engine,name,origin,width){
 const isMobile=width<840;
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
 const ctx=await browser.newContext({viewport:{width,height:width<500?844:900},isMobile,hasTouch:isMobile,serviceWorkers:'block',reducedMotion:'reduce'});
 const page=await ctx.newPage(),errs=[];
 page.setDefaultTimeout(16000);page.on('pageerror',e=>errs.push(e.message));
 const label=name+'-'+width;
 try{
  await page.goto(origin+'/daruri/#home',{waitUntil:'domcontentloaded',timeout:70000});
  await page.locator('body.reader-enhanced').waitFor();
  const results=[];
  for(const route of routes){
   await page.evaluate(r=>{location.hash='#'+r;},route);
   await page.waitForFunction(r=>window.GnammaCopyContext?.state?.route===r,route,{timeout:16000});
   await page.waitForFunction(()=>document.getElementById('mainContent')?.innerText?.trim().length>40,null,{timeout:16000});
   const data=await page.evaluate(()=>{
    const content=document.getElementById('mainContent'),txt=content?.innerText.trim()||'';
    return{state:window.GnammaCopyContext?.state?.route||'',textCharacters:txt.length,scrollWidth:document.documentElement.scrollWidth,viewportWidth:document.documentElement.clientWidth,heading:content?.querySelector('h1,h2')?.textContent.trim().slice(0,100)||''};
   });
   assert.equal(data.state,route,'Navigation state mismatch on '+route);
   assert(data.textCharacters>40,'Empty '+route+' surface');
   assert(data.scrollWidth<=data.viewportWidth+2,'Horizontal overflow on '+route+' '+JSON.stringify(data));
   results.push({route,chars:data.textCharacters,heading:data.heading});
  }
  await page.goto(origin+'/daruri/#home',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.GnammaCopyContext?.state?.route==='home');
  const openContents=page.locator('#mainContent [data-route="contents"]').first();
  await openContents.click();
  await page.waitForFunction(()=>window.GnammaCopyContext?.state?.route==='contents');
  await page.goBack({waitUntil:'domcontentloaded'}).catch(()=>{});
  await page.waitForFunction(()=>window.GnammaCopyContext?.state?.route==='home');
  await page.goForward({waitUntil:'domcontentloaded'}).catch(()=>{});
  await page.waitForFunction(()=>window.GnammaCopyContext?.state?.route==='contents');
  await page.goto(origin+'/daruri/#section=11',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.GnammaCopyContext?.state?.route==='reader');
  await page.locator('#readerDock:not([hidden])').waitFor();
  await page.locator('#settingsBtn').click();
  await page.locator('#settingsOverlay:not([hidden])').waitFor();
  const appearance=page.locator('#gn-visuals-appearance');
  assert.equal(await appearance.count(),1,'Multiple appearance groups');
  const actions=await appearance.locator('button[data-theme-choice]').evaluateAll(nodes=>nodes.map(n=>n.dataset.themeChoice));
  assert.deepEqual(actions,['system','light','dark'],'Visuals mode choices');
  await appearance.locator('[data-theme-choice="dark"]').click();
  await page.locator('#settingsClose').click();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#readerDock:not([hidden])').waitFor();
  const theme=await page.evaluate(()=>({state:window.GnammaCopyContext?.state?.theme,attr:document.documentElement.dataset.theme}));
  assert.equal(theme.state,'dark','Appearance preference was not persisted');
  assert(errs.length===0,'Unhandled page errors: '+errs.join(';'));
  const result={engine:name,width,routeResults:results,history:'pass',themePersistence:'pass'};
  outcomes.push(result);
  console.log('PASS '+label+' '+results.map(x=>x.route).join(',')+' Back/Forward + persisted theme');
 }catch(e){
  const problem={engine:name,width,message:String(e.stack||e).slice(0,1700)};
  issues.push(problem);console.error('FAIL '+JSON.stringify(problem));
 }finally{await ctx.close();await browser.close();}
}
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 try{
  const origin='http://127.0.0.1:'+server.address().port;
  for(const [name,engine] of [['chromium',chromium],['webkit',webkit]])
    for(const width of [320,390,768,1280])await testBrowser(engine,name,origin,width);
 }finally{
  server.close();
  const dir=path.join(__dirname,'route-audit-artifacts');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'graph.json'),JSON.stringify({outcomes,issues},null,2));
  console.log('ROUTE-GRAPH-SUMMARY '+JSON.stringify({passed:outcomes.length,failed:issues.length}));
 }
 if(issues.length)process.exitCode=1;
})().catch(e=>{console.error(e.stack||e);server.close();process.exitCode=1;});
