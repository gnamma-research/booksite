'use strict';
/* Browser regression for Focus navigation, responsive controls, minimal Home. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{
 let raw;try{raw=decodeURIComponent((req.url||'/').split('?')[0])}catch(_){res.writeHead(400);res.end();return}
 const local=path.resolve(ROOT,'.'+raw);
 if(!local.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return}
 const file=fs.existsSync(local)&&fs.statSync(local).isDirectory()?path.join(local,'index.html'):local;
 if(!fs.existsSync(file)){res.writeHead(404);res.end();return}
 res.writeHead(200,{'content-type':TYPES[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
async function exercise(browser,name,origin,width,height){
 const mobile=width<=768,ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,serviceWorkers:'block',reducedMotion:'reduce'});
 await ctx.addInitScript(()=>localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'11',lang:'english',focusLevel:1,focusApparatus:true})));
 const page=await ctx.newPage();page.setDefaultTimeout(22000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(origin+'/daruri/#section=11',{waitUntil:'domcontentloaded'});
  await page.locator('#readerDock:not([hidden])').waitFor();
  await page.locator('body.reader-enhanced.reading-active.focus-mode').waitFor();
  const geom=await page.evaluate(()=>{
   const ids=['menuBtn','focusToolbar','readerSaveAction','readerCopyAction','readerShareAction','searchBtn','settingsBtn'];
   const langs=[...document.querySelectorAll('#persistentLanguages>button')];
   const boxes=[...ids.map(id=>({id,el:document.getElementById(id)})),...langs.map((el,i)=>({id:'language-'+i,el}))].map(({id,el})=>{
    const r=el?.getBoundingClientRect();return{id,x:r?.left??-1,right:r?.right??-1,y:r?.top??-1,bottom:r?.bottom??-1,width:r?.width??0,height:r?.height??0,visible:!!r?.width&&!!r?.height&&getComputedStyle(el).visibility!=='hidden'};
   });
   const r=document.getElementById('readingControls').getBoundingClientRect();
   return {screen:document.documentElement.clientWidth,bar:{top:r.top,bottom:r.bottom,height:r.height},boxes,readWidth:document.getElementById('gnTopRead')?.getBoundingClientRect().width||0};
  });
  const msg=name+' '+width+'x'+height+' '+JSON.stringify(geom);
  assert.equal(geom.boxes.length,9,'Lost control: '+msg);
  assert(geom.boxes.every(x=>x.visible),'Hidden control: '+msg);
  assert(geom.boxes.every(x=>x.x>=-1&&x.right<=geom.screen+1),'Clipped control: '+msg);
  if(width<=620){
   assert(geom.bar.height>=44&&geom.bar.height<=54,'Second toolbar row: '+msg);
   assert(geom.boxes.every(x=>x.y>=geom.bar.top-2&&x.bottom<=geom.bar.bottom+2),'Vertical toolbar overflow: '+msg);
   assert(geom.boxes.every(x=>x.height>=40),'Small toolbar target: '+msg);
   assert.equal(geom.readWidth,0,'Redundant Read inside reader');
   const sorted=[...geom.boxes].sort((a,b)=>a.x-b.x);
   assert(sorted.every((x,i)=>!i||x.x>=sorted[i-1].right-1),'Overlapping controls: '+msg);
  }
  await page.locator('#menuBtn').click();
  await page.locator('#leftNav [data-route="home"]').waitFor({state:'visible'});
  assert.equal(await page.locator('body.focus-mode').count(),0,'Contents did not exit Focus');
  assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'true','Contents not opened');
  await page.locator('#leftNav [data-route="home"]').click();
  const home=page.locator('#mainContent .gnamma-home');await home.waitFor();
  assert((await home.innerText()).trim().split(/\s+/).length<100,'Home too wordy');
  assert.equal(await home.locator('.home-actions .action-btn').count(),2,'Expected two prominent Home actions');
  assert.equal(await home.locator('#homeEditorialSources').evaluate(el=>el.open),false,'Sources should start collapsed');
  const gap=await page.evaluate(()=>{
   const a=document.getElementById('menuBtn')?.getBoundingClientRect(),b=document.getElementById('gnTopRead')?.getBoundingClientRect();
   return {gap:b?.left-a?.right,width:b?.width};
  });
  assert(gap.width>0&&gap.gap>=(width<=620?8:12),'Read/Contents gap too small: '+JSON.stringify(gap));
  await home.locator('[data-route="help"]').click();
  await page.locator('#mainContent .gn-history-help').waitFor();
  await page.locator('#menuBtn').click();
  await page.locator('#leftNav [data-route="home"]').click();
  await home.locator('#homeEditorialSources summary').click();
  assert(await home.locator('#homeEditorialSources').evaluate(el=>el.open),'Source detail not expandable');
  assert((await home.locator('#homeEditorialSources').innerText()).includes('al-ʿAlawī'),'Missing edition provenance');
  await home.locator('.home-actions .action-btn.primary').click();
  await page.locator('#readerDock:not([hidden])').waitFor();
  assert.equal((await page.locator('#dockSection').innerText()).trim(),'§11','Home return lost section');
  assert.equal(await page.locator('body.focus-mode').count(),0,'Home return should be ordinary Reading');
  assert.equal(await page.locator('#persistentLanguages>button.active').count(),1,'Language preference changed');
  assert.equal(errors.length,0,'Runtime errors: '+errors.join('; '));
  console.log('PASS '+name+' '+width+'x'+height+' Focus → Contents → Home → Help → sources → reading');
 }finally{await ctx.close()}
}
(async()=>{
 const html=fs.readFileSync(path.join(ROOT,'daruri/index.html'),'utf8');
 assert(html.includes('id="homeEditorialSources"')&&html.includes('id="fb-homeEditorialSources"'),'No-JS/enhanced Home discrepancy');
 assert(html.includes('Escorial MS 1235')&&html.includes('AI assistance'),'Source disclosure removed');
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 try{
  for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
   const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
   try{for(const w of [320,350,375,390,430,620,768,1280])await exercise(browser,name,origin,w,w===320?568:844)}
   finally{await browser.close()}
  }
 }finally{server.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;server.close()});
