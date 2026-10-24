'use strict';
/* Independent Daruri audit: no production writes, bounded local browser tests. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const ROOT=path.resolve(__dirname,'../..');
const OUT=path.join(__dirname,'audit-artifacts');
fs.mkdirSync(OUT,{recursive:true});
const findings=[],measurements=[],a11y=[],requests={count:0,bytes:0,missing:[],byPath:{}};
const MIME={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.webp':'image/webp','.png':'image/png','.pdf':'application/pdf'};
function finding(id,severity,detail){const f={id,severity,detail:String(detail).slice(0,1800)};findings.push(f);console.log('FINDING '+JSON.stringify(f));}
async function check(id,severity,fn){
 try{const result=await fn(); console.log('CHECK '+id+' OK');return result;}
 catch(e){finding(id,severity,e.stack||e);return null;}
}
function requireCondition(c,msg){if(!c)throw Error(msg);}
const server=http.createServer((req,res)=>{
 let raw;try{raw=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch(e){res.writeHead(400);res.end();return;}
 if(raw==='/' )raw='/index.html';
 const loc=path.resolve(ROOT,'.'+raw);
 if(!loc.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(loc)&&fs.statSync(loc).isDirectory()?path.join(loc,'index.html'):loc;
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){requests.missing.push(raw);res.writeHead(404);res.end();return;}
 const n=fs.statSync(file).size; requests.count++; requests.bytes+=n;requests.byPath[raw]=(requests.byPath[raw]||0)+1;
 res.writeHead(200,{'Content-Type':MIME[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Content-Length':n,'Access-Control-Allow-Origin':'*'});
 if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
});
async function openReader(browser,engine,origin,opts={}){
 const width=opts.width||390,height=opts.height||844;
 const ctx=await browser.newContext({viewport:{width,height},isMobile:width<=768,hasTouch:width<=768,locale:opts.locale||'en-US',reducedMotion:'reduce',serviceWorkers:'block'});
 if(opts.focus)await ctx.addInitScript(()=>localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'11',lang:'parallel',focusLevel:1,focusApparatus:true})));
 if(opts.blockStorage)await ctx.addInitScript(()=>{for(const name of ['getItem','setItem','removeItem'])Storage.prototype[name]=()=>{throw new DOMException('Storage disabled','SecurityError')};});
 if(opts.noFonts)await ctx.route(/\.(woff2?|ttf|otf)(?:\?|$)/i,route=>route.abort());
 const page=await ctx.newPage();page.setDefaultTimeout(12500);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const start=Date.now();
 await page.goto(origin+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:60000});
 await page.locator('body.reader-enhanced').waitFor({timeout:30000});
 await page.locator('#readerDock:not([hidden])').waitFor({timeout:30000});
 return {ctx,page,errors,start,engine,width,height};
}
async function metrics(page){
 return await page.evaluate(()=>{
  const bar=document.getElementById('readingControls')?.getBoundingClientRect();
  const elements=['menuBtn','focusToolbar','readerSaveAction','readerCopyAction','readerShareAction','searchBtn','settingsBtn'].map(id=>({id,el:document.getElementById(id)}));
  document.querySelectorAll('#persistentLanguages>button').forEach((el,i)=>elements.push({id:'language-'+i,el}));
  const boxes=elements.map(({id,el})=>{const r=el?.getBoundingClientRect();const s=el&&getComputedStyle(el);return{id,x:r?.left??0,right:r?.right??0,y:r?.top??0,bottom:r?.bottom??0,w:r?.width??0,h:r?.height??0,shown:!!r?.width&&!!r?.height&&s?.visibility!=='hidden'&&s?.display!=='none',name:el?.getAttribute('aria-label')||el?.title||el?.innerText?.trim()||''};});
  const nav=performance.getEntriesByType('navigation')[0];
  const resources=performance.getEntriesByType('resource');
  const transfer=resources.reduce((s,x)=>s+(x.transferSize||0),0);
  return{width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,barHeight:bar?.height||0,barTop:bar?.top||0,barBottom:bar?.bottom||0,boxes,resourceCount:resources.length,reportedTransferBytes:transfer,domContentLoadedMs:Math.round(nav?.domContentLoadedEventEnd||0),loadedFonts:document.fonts?.size||0,language:document.documentElement.lang,dir:document.documentElement.dir,arabicGlyphs:(document.body.innerText.match(/[\u0600-\u06ff]/g)||[]).length};
 });
}
async function responsive(browser,engine,origin,width,height){
 let r;
 try {
  r=await check('load-'+engine+'-'+width,'P0',()=>openReader(browser,engine,origin,{width,height,focus:true}));
  if(!r)return;
  const m=await metrics(r.page);measurements.push({engine,width,height,loadMs:Date.now()-r.start,...m});
  const visible=m.boxes.filter(x=>x.shown);
  await check('toolbar-'+engine+'-'+width,'P1',async()=>{
   requireCondition(m.boxes.length===9,'Expected Contents, Focus, Save, Copy, Share, Search, Visuals and 2 languages: '+JSON.stringify(m.boxes));
   requireCondition(m.boxes.every(x=>x.shown),'Missing/hidden controls: '+JSON.stringify(m.boxes));
   const clipped=m.boxes.filter(x=>x.x< -1||x.right>m.width+1);
   requireCondition(!clipped.length,'Clipped controls: '+JSON.stringify({clipped,viewport:m.width,boxes:m.boxes}));
   requireCondition(m.boxes.every(x=>x.name.length>0),'Unlabelled controls: '+JSON.stringify(m.boxes.filter(x=>!x.name)));
   if(width<=620){
    requireCondition(m.barHeight>=44&&m.barHeight<=57,'Toolbar wrapped: height '+m.barHeight);
    requireCondition(m.boxes.every(x=>x.y>=m.barTop-2&&x.bottom<=m.barBottom+2),'Control outside toolbar');
    const sorted=[...visible].sort((a,b)=>a.x-b.x);
    requireCondition(sorted.every((x,i)=>!i||x.x>=sorted[i-1].right-1),'Overlapping controls: '+JSON.stringify(sorted));
   }
  });
  await check('page-overflow-'+engine+'-'+width,'P2',()=>{requireCondition(m.scrollWidth<=m.width+2,'Document overflow '+m.scrollWidth+' > '+m.width);});
  if([320,390,1440].includes(width))await r.page.screenshot({path:path.join(OUT,engine+'-'+width+'-focus.png'),fullPage:false});
  if([320,390,768,1440].includes(width))await check('journey-'+engine+'-'+width,'P1',async()=>{
   await r.page.locator('#menuBtn').click({timeout:8000});
   await r.page.locator('#leftNav [data-route="home"]').waitFor({state:'visible'});
   if(width<=620)requireCondition(await r.page.locator('#menuBtn').getAttribute('aria-expanded')==='true','Phone Contents opener did not expand');
   await r.page.locator('#leftNav [data-route="home"]').click();
   await r.page.locator('#mainContent .gnamma-home').waitFor();
   const homeText=(await r.page.locator('#mainContent .gnamma-home').innerText()).trim();
   requireCondition(homeText.length>35,'Home lacks readable content');
   await r.page.locator('#gnTopRead').click();
   await r.page.locator('#readerDock:not([hidden])').waitFor();
   const hash=await r.page.evaluate(()=>location.hash);
   requireCondition(/section=11/.test(hash),'Home return lost section: '+hash);
  });
  await check('script-errors-'+engine+'-'+width,'P1',()=>requireCondition(r.errors.length===0,'Page errors: '+r.errors.join('; ')));
 }finally{if(r?.ctx)await r.ctx.close();}
}
async function noJS(browser,engine,origin){
 const ctx=await browser.newContext({viewport:{width:320,height:568},javaScriptEnabled:false,serviceWorkers:'block'});
 try{
  const page=await ctx.newPage();
  await page.goto(origin+'/daruri/',{waitUntil:'domcontentloaded'});
  const d=await page.evaluate(()=>({bodyChars:document.body.innerText.trim().length,anchorCount:document.querySelectorAll('a[href^="#"]').length,links:[...document.querySelectorAll('a[href^="#"]')].slice(0,8).map(a=>({t:a.innerText.slice(0,45),href:a.getAttribute('href')})),arabic:document.body.innerText.includes('ال')}));measurements.push({engine,case:'noJS',...d});
  await check('noJS-'+engine,'P0',()=>{requireCondition(d.bodyChars>500,'No readable source without JavaScript: '+JSON.stringify(d));requireCondition(d.anchorCount>10,'No native internal reading links without JavaScript: '+JSON.stringify(d));});
  await page.screenshot({path:path.join(OUT,engine+'-no-js.png'),fullPage:false});
 }finally{await ctx.close();}
}
async function resilience(browser,engine,origin,opts){
 let r;
 try{
  r=await check('resilience-load-'+engine+'-'+opts.name,'P1',()=>openReader(browser,engine,origin,{...opts,width:390,height:844}));
  if(!r)return;
  const m=await metrics(r.page);measurements.push({engine,case:opts.name,...m,errors:r.errors});
  await check('resilience-'+engine+'-'+opts.name,'P1',()=>{requireCondition(m.arabicGlyphs>20,'Arabic text disappeared');requireCondition(m.boxes.filter(x=>x.shown).length>=7,'Essential controls missing');});
  await r.page.screenshot({path:path.join(OUT,engine+'-'+opts.name+'.png'),fullPage:false});
 }finally{if(r?.ctx)await r.ctx.close();}
}
async function advanced(browser,engine,origin){
 let r;
 try{
  r=await check('advanced-load-'+engine,'P0',()=>openReader(browser,engine,origin,{width:390,height:844}));
  if(!r)return;
  await check('search-journey-'+engine,'P1',async()=>{
   await r.page.locator('#searchBtn').click();
   const field=r.page.locator('#gns-query');await field.waitFor({state:'visible'});
   await field.fill('qiyas');
   await r.page.locator('.gns-result').first().waitFor({timeout:20000});
   await r.page.locator('.gns-result').first().click();
   await r.page.locator('#gns-return-bar [data-gns-return="1"]').waitFor();
   await r.page.locator('#gns-return-bar [data-gns-return="1"]').click();
   requireCondition(await field.inputValue()==='qiyas','Search term lost on return');
  });
  await check('search-burst-'+engine,'P2',async()=>{
   const field=r.page.locator('#gns-query');
   if(!(await field.isVisible()))await r.page.locator('#searchBtn').click();
   const start=Date.now();
   await field.evaluate(el=>{for(let i=0;i<80;i++){el.value=i%2?'qiyas':'عِلْم';el.dispatchEvent(new Event('input',{bubbles:true}));}});
   await r.page.waitForTimeout(900);
   const ms=Date.now()-start;measurements.push({engine,case:'80 rapid local search inputs',ms});
   requireCondition(ms<8000,'Search interaction locked up for '+ms+'ms');
  });
  await check('search-xss-'+engine,'P1',async()=>{
   const field=r.page.locator('#gns-query');
   await r.page.evaluate(()=>window.__auditInjected=false);
   await field.fill('<img src=x onerror="window.__auditInjected=true">');
   await r.page.waitForTimeout(600);
   requireCondition(!await r.page.evaluate(()=>window.__auditInjected),'Search input executed injected markup');
  });
  await check('invalid-url-'+engine,'P1',async()=>{
   await r.page.goto(origin+'/daruri/#section=999999&paragraph=999999',{waitUntil:'domcontentloaded'});
   await r.page.waitForTimeout(400);
   requireCondition((await r.page.locator('body').innerText()).length>200,'Invalid route blanked page');
  });
  await check('axe-'+engine,'P2',async()=>{
   await r.page.goto(origin+'/daruri/#section=11',{waitUntil:'domcontentloaded'});
   await r.page.locator('#readerDock:not([hidden])').waitFor();
   const result=await new AxeBuilder({page:r.page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
   a11y.push({engine,viewport:390,violations:result.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,count:v.nodes.length,targets:v.nodes.slice(0,7).map(n=>({target:n.target,failure:n.failureSummary?.slice(0,480)}))}))});
   console.log('AXE '+engine+' '+JSON.stringify(a11y.at(-1)).slice(0,7000));
  });
 }finally{if(r?.ctx)await r.ctx.close();}
}
(async()=>{
 await new Promise(res=>server.listen(0,'127.0.0.1',res));
 const origin='http://127.0.0.1:'+server.address().port;
 try{
  for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
   const browser=await type.launch({headless:true,...(engine==='chromium'?{args:['--no-sandbox']}:{})});
   try{
    for(const w of [320,350,375,390,430,620,768,1024,1440])await responsive(browser,engine,origin,w,w===320?568:(w===620?400:844));
    await noJS(browser,engine,origin);
    await resilience(browser,engine,origin,{name:'fonts-blocked-arabic-locale',locale:'ar-SA',noFonts:true});
    await resilience(browser,engine,origin,{name:'storage-disabled',blockStorage:true});
    await advanced(browser,engine,origin);
   }finally{await browser.close();}
  }
 }finally{
  server.close();
  const data={auditVersion:'2026-10-24-v1',testedCommit:process.env.GITHUB_SHA||'local',findings,measurements,a11y,requests:{count:requests.count,bytes:requests.bytes,missing:[...new Set(requests.missing)],topFiles:Object.entries(requests.byPath).sort((a,b)=>b[1]-a[1]).slice(0,20)}};
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(data,null,2));
  console.log('SUMMARY '+JSON.stringify({findings:findings.length,severe:findings.filter(x=>x.severity==='P0'||x.severity==='P1').length,a11y:a11y.map(x=>({engine:x.engine,violations:x.violations.length})),requests:data.requests}).slice(0,9000));
 }
 if(findings.some(x=>x.severity==='P0'||x.severity==='P1'))process.exitCode=1;
})().catch(e=>{finding('audit-harness','P0',e.stack||e);process.exitCode=1;server.close();});
