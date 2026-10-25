'use strict';
/* Cross-section Copy consistency: visible context follows scroll, actual selections stay pinned.
 * Test local static files only, never the public site or personal reader records. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
 '.woff2':'font/woff2','.ttf':'font/ttf','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{
 let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch(_){res.writeHead(400);res.end();return;}
 const resolved=path.resolve(ROOT,'.'+url);
 if(!resolved.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(resolved)&&fs.statSync(resolved).isDirectory()?path.join(resolved,'index.html'):resolved;
 if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'content-type':MIME[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
 fs.createReadStream(file).pipe(res);
});
const checks=[],failures=[];
async function inspect(engine,name,origin,width){
 const context=await engine.newContext({viewport:{width,height:844},isMobile:width<700,hasTouch:width<700,serviceWorkers:'block',reducedMotion:'reduce'});
 await context.addInitScript(()=>localStorage.setItem('daruri-reader-v2',
  JSON.stringify({n:'11',lang:'english',focusLevel:0,vowels:false})));
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const id=name+'-'+width;
 try{
  await page.goto(origin+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:65000});
  await page.waitForFunction(()=>window.GnammaReaderModes?.setMode&&window.GnammaCopyLinks,
   null,{timeout:35000});
  await page.evaluate(()=>window.GnammaReaderModes.setMode('continuous'));
  const scroller=async section=>page.evaluate(async id=>{
   const grid=document.querySelector('#gn-continuous-'+id+' .passage-grid[data-segment="0"]');
   if(!grid)throw Error('Missing continuous §'+id+' paragraph');
   // Continuous-mode CSS and dock observers can adjust the initial position
   // across animation frames. Settle on the real paragraph hitbox, not the hash.
   for(let tries=0;tries<4;tries++){
    const box=grid.getBoundingClientRect();
    const dest=Math.max(0,window.scrollY+box.top-140);
    window.scrollTo({top:dest,behavior:'instant'});
    await new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
   }
   window.dispatchEvent(new Event('scroll'));
   const box=grid.getBoundingClientRect();
   return {section:id,top:box.top,bottom:box.bottom,scrollY:scrollY,
    current:window.GnammaCopyContext?.state?.n};
  },section);
  // Use the actual viewport button coordinates. Locator-based clicks can
  // auto-scroll a sticky toolbar before dispatching pointerdown in WebKit.
  const tapOptions=async()=>{
   const box=await page.locator('#readerCopyOptions').boundingBox();
   if(!box)throw Error('Copy options has no visible hitbox');
   const x=box.x+box.width/2,y=box.y+box.height/2;
   if(width<700)await page.touchscreen.tap(x,y);
   else await page.mouse.click(x,y);
  };
  await tapOptions();
  const menu=page.locator('#gn-copy-menu:not([hidden])'),label=menu.locator('.gn-copy-menu-head small');
  await menu.waitFor();
  const start=await page.evaluate(()=>({
   label:document.querySelector('#gn-copy-menu .gn-copy-menu-head small')?.textContent||'',
   hash:location.hash,section:window.GnammaCopyContext?.state?.n,scrollY:scrollY
  }));
  const arrived11=await scroller(11);
  console.log('COPY INITIAL '+id+' '+JSON.stringify({start,arrived11}));
  await page.waitForFunction(()=>document.querySelector('#gn-copy-menu:not([hidden]) .gn-copy-menu-head small')?.textContent?.includes('§11'),null,{timeout:12000});
  const before=await label.textContent();
  const arrived12=await scroller(12);
  console.log('COPY AFTER '+id+' '+JSON.stringify(arrived12));
  await page.waitForFunction(()=>document.querySelector('#gn-copy-menu:not([hidden]) .gn-copy-menu-head small')?.textContent?.includes('§12'),null,{timeout:15000});
  const after=await label.textContent();
  assert.notEqual(after,before,'Copy heading did not track the new section');
  await menu.locator('[data-gn-menu="text"]').click();
  const sheet=page.locator('.gn-copy-sheet');await sheet.waitFor();
  const preview=(await sheet.locator('#gn-copy-preview').textContent()).trim();
  assert(preview.includes('§12'),'Copy preview is from the stale section: '+preview);
  assert(await sheet.locator('input[name="scope"][value="paragraph"]').isChecked(),'Current paragraph scope missing');
  await sheet.locator('[data-gn-copy-close]').first().click();
  await scroller(11);
  const word=await page.evaluate(()=>{
   const el=document.querySelector('#gn-continuous-11 .passage-grid[data-segment="0"] .passage-en');
   if(!el)throw Error('No actual English paragraph in §11');
   const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
   let node,match;while((node=walker.nextNode())){match=node.textContent.match(/[A-Za-z]{5,}/);if(match)break;}
   if(!match)throw Error('No English word in §11 to select');
   const r=document.createRange();r.setStart(node,match.index);r.setEnd(node,match.index+match[0].length);
   const s=window.getSelection();s.removeAllRanges();s.addRange(r);
   document.dispatchEvent(new Event('selectionchange'));
   return match[0];
  });
  await tapOptions();await menu.waitFor();
  await page.waitForFunction(()=>!!document.querySelector('#gn-copy-menu:not([hidden]) [data-gn-menu="selected"]'));
  const pinned=await label.textContent();
  assert(pinned.includes('§11'),'Actual selected word did not pin §11');
  await scroller(12);
  await page.waitForTimeout(400);
  assert.equal(await label.textContent(),pinned,'Selected text target moved with reader');
  await menu.locator('[data-gn-menu="selected"]').click();
  await sheet.waitFor();
  assert(await sheet.locator('input[name="scope"][value="selected"]').isChecked(),'Selected text was expanded to a paragraph');
  await sheet.locator('[data-gn-copy-close]').first().click();
  assert.deepEqual(errors,[],'Page errors during Copy: '+errors.join(';'));
  checks.push({id,before,after,preview,pinned,word});
  console.log('PASS '+id+' §11→§12 live subject and §11 selected-word freeze');
 }catch(e){const reason=String(e.stack||e).slice(0,2300);failures.push({id,reason});console.error('FAIL '+id+' '+reason);}
 finally{await context.close();}
}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const url='http://127.0.0.1:'+server.address().port;
  for(const [name,api] of [['chromium',chromium],['webkit',webkit]]){
   const browser=await api.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
   try{for(const width of [390,1280])await inspect(browser,name,url,width);}finally{await browser.close();}
  }
 }finally{
  server.close();
  const dest=path.join(__dirname,'copy-cross-section-results');
  fs.mkdirSync(dest,{recursive:true});
  fs.writeFileSync(path.join(dest,'report.json'),JSON.stringify({checks,failures},null,2));
  console.log('COPY CROSS SECTION '+JSON.stringify({passed:checks.length,failed:failures.length}));
 }
 if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e.stack||e);server.close();process.exitCode=1;});
