'use strict';
/* Browser-only keyboard, focus and reader-responsiveness QA, no actual user data.
 * 320/390/768 widths x three reading modes x Chromium/WebKit.
 * Distinguish viewport-based evidence from simulated CSS zoom diagnostics. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(__dirname,'keyboard-zoom-artifacts');
fs.mkdirSync(OUT,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.webp':'image/webp','.png':'image/png'};
const server=http.createServer((req,res)=>{
 let name;try{name=decodeURIComponent(new URL(req.url,'http://local').pathname)}catch(_){res.writeHead(400);res.end();return;}
 const local=path.resolve(ROOT,'.'+name);if(!local.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(local)&&fs.statSync(local).isDirectory()?path.join(local,'index.html'):local;
 if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
 fs.createReadStream(file).pipe(res);
});
const good=[],bad=[],diagnostics=[];
async function exercise(browser,engine,url,width,mode){
 const id=engine+'-'+width+'-mode'+mode;
 const context=await browser.newContext({viewport:{width,height:width===320?700:width===390?844:1000},isMobile:width<=390,hasTouch:width<=390,serviceWorkers:'block',reducedMotion:'reduce',locale:'en-GB'});
 await context.addInitScript(m=>localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'11',lang:'parallel',focusLevel:m,vowels:false})),mode);
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.setDefaultTimeout(12000);
 try{
  await page.goto(url+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#readerDock:not([hidden])').waitFor({timeout:30000});
  if(mode===3){
   // Position a real §11 paragraph after the Continuous layout settles.
   await page.locator('#gn-continuous-11 .passage-grid[data-segment="0"]').first().waitFor({state:'visible'});
   await page.evaluate(async()=>{
    const grid=document.querySelector('#gn-continuous-11 .passage-grid[data-segment="0"]');
    for(let attempt=0;attempt<4;attempt++){
     window.scrollTo({top:window.scrollY+grid.getBoundingClientRect().top-140,behavior:'instant'});
     await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
    }
    window.dispatchEvent(new Event('scroll'));
   });
   await page.waitForFunction(()=>document.getElementById('dockSection')?.textContent?.trim()==='§11',null,{timeout:12000});
  }
  const start=await page.evaluate(()=>({
   dock:document.getElementById('dockSection')?.textContent?.trim(),
   reader:document.body.className,head:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth
  }));
  assert.equal(start.dock,'§11','Initial saved section mismatch');
  assert(start.head<=start.viewport+2,'Reader has initial horizontal overflow');
  // Programmatic focus is performed with preventScroll, matching keyboard
  // focus but not Playwright's auto-scrolling locator click.
  await page.locator('#menuBtn').evaluate(el=>el.focus({preventScroll:true}));
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>{
   const btn=document.getElementById('menuBtn'),nav=document.getElementById('leftNav');
   const box=nav?.getBoundingClientRect();
   return btn?.getAttribute('aria-expanded')==='true'&&box?.width>0&&box?.right>0;
  },null,{timeout:12000});
  const open=await page.evaluate(()=>({
   aria:document.getElementById('menuBtn')?.getAttribute('aria-expanded'),
   drawer:document.getElementById('leftNav')?.getBoundingClientRect().toJSON(),
   role:document.getElementById('leftNav')?.getAttribute('role'),
   focused:document.activeElement?.id,section:document.getElementById('dockSection')?.textContent?.trim()
  }));
  assert.equal(open.aria,'true','Keyboard Enter did not open Contents');
  assert(open.drawer.width>0&&open.drawer.right>0,'Contents drawer not visible after Enter');
  if(width<=390)assert.equal(open.role,'dialog','Mobile drawer not modal');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>document.getElementById('menuBtn')?.getAttribute('aria-expanded')==='false',null,{timeout:10000});
  const closed=await page.evaluate(()=>({
   focus:document.activeElement?.id,aria:document.getElementById('menuBtn')?.getAttribute('aria-expanded'),
   locked:document.body.style.overflow,section:document.getElementById('dockSection')?.textContent?.trim()
  }));
  assert.equal(closed.focus,'menuBtn','Escape did not restore the keyboard opener');
  assert.equal(closed.section,'§11','Contents keyboard round trip changed the reading section');
  // Accessibility of Appearance modal with Tab/Escape.
  await page.locator('#settingsBtn').evaluate(el=>el.focus({preventScroll:true}));
  await page.keyboard.press('Enter');
  await page.locator('#settingsOverlay:not([hidden])').waitFor({timeout:8000});
  const modal=await page.evaluate(()=>({
   role:document.getElementById('settingsOverlay')?.getAttribute('role'),
   focused:document.activeElement?.id,
   dark:!!document.querySelector('#gn-visuals-appearance [data-theme-choice="dark"]')
  }));
  assert(modal.dark,'Appearance controls missing in Visuals');
  await page.keyboard.press('Escape');
  await page.locator('#settingsOverlay:not([hidden])').waitFor({state:'hidden',timeout:8000});
  const focus=await page.evaluate(()=>document.activeElement?.id);
  assert.equal(focus,'settingsBtn','Visuals Escape lost its opener focus');
  assert.deepEqual(errors,[],'Page errors');
  const result={id,start,open,closed,modal,focus};
  good.push(result);console.log('PASS KEYBOARD '+id);
  // Diagnostic only: CSS zoom is not equivalent to true browser/OS zoom.
  if(mode===0&&width===390){
   for(const scale of [1,2,4]){
    const geom=await page.evaluate(multiplier=>{
     document.documentElement.style.zoom=String(multiplier);
     const viewport=document.documentElement.clientWidth,scrollWidth=document.documentElement.scrollWidth;
     const el=document.getElementById('menuBtn'),rect=el?.getBoundingClientRect();
     return {scale:multiplier,viewport,scrollWidth,menuVisible:!!rect?.width&&rect.right<=innerWidth+2,
      layoutWidth:document.getElementById('mainContent')?.getBoundingClientRect().width};
    },scale);
    diagnostics.push({id,zoom:geom});
    console.log('ZOOM-DIAGNOSTIC '+id+' '+JSON.stringify(geom));
   }
  }
 }catch(error){const message=String(error.stack||error).slice(0,3000);bad.push({id,message});console.error('FAIL KEYBOARD '+id+' '+message);}
 finally{await context.close();}
}
(async()=>{
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 try{
  const url='http://127.0.0.1:'+server.address().port;
  for(const [name,api] of [['chromium',chromium],['webkit',webkit]]){
   const browser=await api.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
   try{for(const width of [320,390,768])for(const mode of [0,1,3])await exercise(browser,name,url,width,mode);}
   finally{await browser.close();}
  }
 }finally{
  server.close();
  fs.writeFileSync(path.join(OUT,'keyboard-zoom-report.json'),JSON.stringify({good,bad,diagnostics},null,2));
  console.log('KEYBOARD-AUDIT '+JSON.stringify({passed:good.length,failed:bad.length,diagnosticZooms:diagnostics.length,failures:bad.map(x=>({id:x.id,reason:x.message.slice(0,280)}))}));
 }
 if(bad.length)process.exitCode=1;
})().catch(e=>{server.close();console.error(e.stack||e);process.exitCode=1;});
