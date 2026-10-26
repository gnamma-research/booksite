#!/usr/bin/env node
'use strict';
/* Narrow-height mobile landscape dock QA. Exercises Chromium and WebKit with
   real pointer hit-testing and synthetic, locally stored saved references. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml',
 '.woff2':'font/woff2','.ttf':'font/ttf','.webp':'image/webp','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const request=decodeURIComponent((req.url||'/').split('?')[0]);
 const filename=path.resolve(ROOT,'.'+request);
 if(!filename.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}
 const file=fs.existsSync(filename)&&fs.statSync(filename).isDirectory()?
  path.join(filename,'index.html'):filename;
 if(!fs.existsSync(file)){res.writeHead(404).end();return;}
 res.writeHead(200,{'content-type':MIME[path.extname(file)]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
const items=[
 {id:'landscape-section',kind:'section',target:{kind:'section',section:'11'},created:100,updated:100,deleted:0},
 {id:'landscape-paragraph',kind:'paragraph',target:{kind:'paragraph',section:'11',segment:0,lang:'en'},created:101,updated:101,deleted:0},
 {id:'landscape-note',kind:'note',target:{kind:'paragraph',section:'11',segment:0,lang:'en'},title:'QA saved note',body:'Test only',created:102,updated:102,deleted:0}
];
const sizes=[[667,375],[812,375],[844,390],[932,430],[1024,480]];
const controls=['#readerPrevious','#openJump','#readerNext','#readerDock .gn-dock-summary'];
function fail(message,details){assert.fail(message+': '+JSON.stringify(details));}
async function geometry(page){
 return page.evaluate((selectors)=>{
  const dock=document.getElementById('readerDock');
  const box=node=>{if(!node)return null;const r=node.getBoundingClientRect();
   return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
  const dockBox=box(dock);
  const controls=Object.fromEntries(selectors.map(sel=>{
   const el=document.querySelector(sel),rect=box(el);
   const style=el?getComputedStyle(el):null;
   const x=rect?rect.x+rect.width/2:0,y=rect?rect.y+rect.height/2:0;
   const top=document.elementFromPoint(x,y);
   const hittable=!!(top && (top===el||el?.contains(top)));
   return [sel,{rect,display:style?.display,hidden:el?.hidden||false,hittable}];
  }));
  const center=document.querySelector('#readerDock .gn-dock-center');
  const saved=document.querySelector('#readerDock .gn-dock-private-status');
  const summary=document.querySelector('#readerDock .gn-dock-summary');
  const savedSymbols=summary?.querySelector('.gn-dock-summary-symbols');
  return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,
   matched:matchMedia('(orientation:landscape) and (max-height:560px) and (pointer:coarse)').matches,
   dock:dockBox,center:box(center),saved:box(saved),controls,
   savedTotal:summary?.dataset.gnTotal,
   savedSymbolsDisplay:savedSymbols?getComputedStyle(savedSymbols).display:null,
   bottomGap:innerHeight-dockBox.bottom,
   bottomPadding:getComputedStyle(document.querySelector('.main-region')).paddingBottom,
   focus:document.body.classList.contains('focus-mode')};
 },controls);
}
async function run(engine,name,origin){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
 const context=await browser.newContext({
  viewport:{width:844,height:390},screen:{width:844,height:390},
  isMobile:true,hasTouch:true,deviceScaleFactor:2,reducedMotion:'reduce'
 });
 await context.addInitScript(({items})=>{
  localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'11',lang:'english',focusLevel:0}));
  localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify({format:'gnamma-reading-desk',version:1,items}));
 },{items});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(origin+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:90000});
  await page.locator('#readerDock:not([hidden])').waitFor({state:'visible',timeout:40000});
  await page.locator('#readerDock .gn-dock-summary').waitFor({state:'visible',timeout:30000});
  const reports=[];
  for(const [width,height] of sizes){
   await page.setViewportSize({width,height});
   await page.waitForTimeout(100);
   const data=await geometry(page);
   assert(data.matched,name+' '+width+' landscape mobile query did not match');
   if(data.dock.height>55||data.dock.height<48)
    fail(name+' '+width+' dock must remain a compact 52px high',data);
   assert(data.dock.x>=-1&&data.dock.right<=width+1&&
    data.dock.y>=-1&&data.dock.bottom<=height,
    name+' '+width+' dock clipped: '+JSON.stringify(data.dock));
   assert(data.bottomGap>=3&&data.bottomGap<=50,
    name+' '+width+' dock too far above/below screen: '+JSON.stringify(data));
   assert(data.center.height<=45,name+' '+width+' section and saved icons stacked: '+JSON.stringify(data));
   assert.equal(data.savedTotal,'3',name+' '+width+' lost three locally saved records');
   assert.equal(data.savedSymbolsDisplay,'none',name+' '+width+' saved category badges wrapping inside landscape dock');
   assert(data.saved?.height>=43&&data.saved.height<=45,name+' '+width+' saved status too tall: '+JSON.stringify(data));
   assert(data.scrollWidth<=width+4,name+' '+width+' horizontal document overflow: '+JSON.stringify(data));
   for(const selector of controls){
    const target=data.controls[selector];
    assert(target?.rect&&target.display!=='none'&&!target.hidden,
     name+' '+width+' missing '+selector+': '+JSON.stringify(target));
    const rect=target.rect;
    assert(rect.height>=43&&rect.height<=46&&rect.width>=32,
     name+' '+width+' touch target wrong size '+selector+': '+JSON.stringify(rect));
    assert(rect.x>=data.dock.x-1&&rect.right<=data.dock.right+1&&
     rect.y>=data.dock.y-1&&rect.bottom<=data.dock.bottom+1,
     name+' '+width+' touch target outside dock '+selector+': '+JSON.stringify(rect));
    assert(target.hittable,name+' '+width+' covered control '+selector+': '+JSON.stringify(data));
   }
   reports.push({size:width+'x'+height,dockHeight:+data.dock.height.toFixed(2),
    bottomGap:+data.bottomGap.toFixed(2),savedWidth:data.saved?.width});
   if(width===844)await page.screenshot({path:'/tmp/gnamma-landscape-dock-'+name+'.png'});
  }
  // Both popups must still be operable by actual touch with the compact dock.
  await page.setViewportSize({width:844,height:390});
  const saved=page.locator('#readerDock .gn-dock-summary');
  const r=await saved.boundingBox();
  await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);
  await page.locator('.gn-dock-saved-sheet').waitFor({state:'visible',timeout:10000});
  await page.locator('.gn-dock-sheet-close').click();
  await page.locator('.gn-dock-saved-sheet').waitFor({state:'detached',timeout:10000});
  const jump=await page.locator('#openJump').boundingBox();
  await page.touchscreen.tap(jump.x+jump.width/2,jump.y+jump.height/2);
  await page.locator('#jumpOverlay:not([hidden])').waitFor({state:'visible',timeout:10000});
  await page.locator('#jumpClose').click();
  await page.locator('#jumpOverlay').waitFor({state:'hidden',timeout:10000});
  // Portrait uses its own screen + viewport orientation. Playwright mobile
  // WebKit keeps screen=landscape when setViewportSize() alone is called,
  // so the latter is not a valid simulation of a physical phone rotation.
  const portraitContext=await browser.newContext({
   viewport:{width:390,height:844},screen:{width:390,height:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:2,reducedMotion:'reduce'
  });
  try{
   await portraitContext.addInitScript(({items})=>{
    localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'11',lang:'english',focusLevel:0}));
    localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify({format:'gnamma-reading-desk',version:1,items}));
   },{items});
   const portraitPage=await portraitContext.newPage();
   await portraitPage.goto(origin+'/daruri/#section=11',
    {waitUntil:'domcontentloaded',timeout:90000});
   await portraitPage.locator('#readerDock:not([hidden])').waitFor({state:'visible',timeout:30000});
   await portraitPage.locator('#readerDock .gn-dock-summary').waitFor({state:'visible',timeout:30000});
   const portrait=await geometry(portraitPage);
   assert(!portrait.matched,name+' portrait incorrectly uses the landscape query');
   assert(portrait.dock.height>=60&&portrait.dock.height<=88,
    name+' portrait dock was inadvertently changed: '+JSON.stringify(portrait));
   assert(portrait.scrollWidth<=392,name+' portrait document overflows: '+JSON.stringify(portrait));
   for(const sel of controls){
    const target=portrait.controls[sel];
    assert(target.rect&&target.hittable,name+' portrait control inaccessible '+sel);
   }
   await portraitPage.screenshot({path:'/tmp/gnamma-portrait-dock-'+name+'.png'});
  }finally{await portraitContext.close();}
  assert(!errors.length,name+' runtime exceptions: '+JSON.stringify(errors));
  console.log('PASS '+name+' landscape dimensions '+JSON.stringify(reports)+
   '; saved sheet, section picker and portrait layout');
 }finally{await context.close();await browser.close();}
}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 try{await run(chromium,'chromium',origin);await run(webkit,'webkit',origin);}
 finally{await new Promise(resolve=>server.close(resolve));}
 console.log('PASS all mobile landscape dock browser cases');
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
