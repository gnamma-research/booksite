#!/usr/bin/env node
'use strict';
/* Real-browser navigation trail / Help smoke test (Chromium + mobile WebKit). */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent((req.url||'/').split('?')[0]);
 const file=path.resolve(ROOT,'.'+name);
 if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}
 const dest=fs.existsSync(file)&&fs.statSync(file).isDirectory()?path.join(file,'index.html'):file;
 if(!fs.existsSync(dest)){res.writeHead(404).end();return;}
 res.writeHead(200,{'content-type':MIME[path.extname(dest)]||'application/octet-stream'});
 fs.createReadStream(dest).pipe(res);
});
async function exercise(engine,name,host){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,acceptDownloads:true,reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(host+'/daruri/#section=115',{waitUntil:'domcontentloaded',timeout:90000});
  await page.locator('#readerDock:not([hidden])').waitFor({timeout:25000});
  await page.locator('#dockSection').waitFor();
  assert.equal((await page.locator('#dockSection').innerText()).trim(),'§115');
  await page.evaluate(()=>window.scrollTo({top:160,behavior:'instant'}));
  await page.waitForTimeout(100);
  const priorY=await page.evaluate(()=>window.scrollY);
  await page.locator('#openJump').click();
  await page.locator('#jumpSearch').waitFor();
  // iOS WebKit can keep focus on the opening button instead of focusing the
  // sheet's close button; either is safe so long as search never summons IME.
  const pickerFocus=await page.evaluate(()=>document.activeElement?.id);
  assert.ok(['jumpClose','openJump'].includes(pickerFocus),
    'Opening section picker must not auto-focus keyboard search; focus='+pickerFocus);
  await page.locator('#jumpSearch').fill('abrogating recitation');
  await page.locator('#jumpResults [data-section="121"]').waitFor();
  await page.locator('#jumpResults [data-section="121"]').click();
  await page.waitForFunction(()=>document.querySelector('#dockSection')?.textContent==='§121',null,{timeout:15000});
  const back=page.locator('#gn-reading-history-float [data-history-nav="back"]');
  await back.waitFor({timeout:10000});
  const geometry=await page.evaluate(()=>{
   const bar=document.querySelector('#readerDock')?.getBoundingClientRect();
   const floater=document.querySelector('#gn-reading-history-float')?.getBoundingClientRect();
   return {barTop:bar?.top,chipBottom:floater?.bottom};
  });
  assert.ok(geometry.chipBottom<=geometry.barTop+5,'Return chip overlaps persistent dock: '+JSON.stringify(geometry));
  await back.click();
  await page.waitForFunction(()=>document.querySelector('#dockSection')?.textContent==='§115',null,{timeout:15000});
  await page.waitForTimeout(450);
  const backY=await page.evaluate(()=>window.scrollY);
  assert.ok(Math.abs(backY-priorY)<140,'Back failed to restore reading scroll: '+priorY+' → '+backY);
  await page.locator('#gn-reading-history-float [data-history-nav="forward"]').click();
  await page.waitForFunction(()=>document.querySelector('#dockSection')?.textContent==='§121',null,{timeout:15000});
  await page.locator('#openJump').click();
  await page.locator('#jumpRecent').waitFor();
  await page.locator('#jumpRecent > summary').click();
  assert.ok(await page.locator('#jumpRecentList [data-history-visit]').count()>=2,'Recent locations missing');
  assert.ok((await page.locator('#jumpRecentList').innerText()).includes('§115'),'Previous source not in Recent');
  await page.locator('#jumpRecentList [data-history-visit]').filter({hasText:'§115'}).first().click();
  await page.waitForFunction(()=>document.querySelector('#dockSection')?.textContent==='§115',null,{timeout:15000});
  await page.goto(host+'/daruri/#contents',{waitUntil:'domcontentloaded'});
  await page.locator('#contentsFilter').fill('118');
  assert.ok(await page.locator('.gn-contents-editorial-results [data-section="118"]').count(),'Source-first contents search must also find an editorial title');
  await page.goto(host+'/daruri/#home',{waitUntil:'domcontentloaded'});
  assert.ok(await page.locator('#homeEditorialSources').count(),'Editorial method missing from homepage');
  await page.locator('[data-route="help"]').last().click();
  await page.locator('.gn-history-help').waitFor();
  assert.ok((await page.locator('.gn-history-help').innerText()).includes('Recent locations'));
  await page.goto(host+'/daruri/#bookmarks',{waitUntil:'domcontentloaded'});
  await page.locator('.gn-rd-page').waitFor();
  await page.locator('.gn-rd-manage-menu > summary').click();
  await page.locator('[data-rd="backup-transfer"]').click();
  await page.locator('[data-transfer="download"]').waitFor();
  const [download]=await Promise.all([page.waitForEvent('download',{timeout:12000}),page.locator('[data-transfer="download"]').click()]);
  const disk=await download.path(),data=JSON.parse(fs.readFileSync(disk,'utf8'));
  assert.ok(data.readingNavigation?.entries?.length>=2,'Personal JSON backup missing reading trail');
  assert.ok(Array.isArray(data.items),'Reading Desk collection not preserved');
  const another=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const imported=await another.newPage();
  try{
   await imported.goto(host+'/daruri/#section=62',{waitUntil:'domcontentloaded',timeout:90000});
   await imported.locator('#readerDock:not([hidden])').waitFor();
   await imported.goto(host+'/daruri/#bookmarks',{waitUntil:'domcontentloaded'});
   await imported.locator('.gn-rd-page').waitFor();
   await imported.locator('.gn-rd-manage-menu > summary').click();
   await imported.locator('[data-rd="backup-transfer"]').click();
   await imported.locator('[data-transfer="choose-file"]').click();
   await imported.locator('input[type="file"][aria-label="Choose Gnamma Reading Desk backup"]').setInputFiles({name:'private.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
   await imported.locator('[data-transfer-choice="history"]').waitFor({timeout:12000});
   await imported.locator('[data-transfer="restore"]').click();
   await imported.waitForFunction(()=>window.GnammaReadingHistory?.exportData()?.recent?.length>=2,null,{timeout:9000});
   const device=await imported.evaluate(()=>({
    current:JSON.parse(localStorage.getItem('daruri-reader-v2')||'{}').n,
    trail:window.GnammaReadingHistory.exportData()
   }));
   assert.equal(device.current,'62','Import overwrote current device position');
   assert.equal(device.trail.cursor,-1,'Import replaced current trail cursor');
   assert.ok(device.trail.recent.some(x=>x.section==='115'),'Imported previous position not retained');
  }finally{await another.close();}
  assert.deepEqual(errors.filter(x=>/GnammaReadingHistory|GnammaNavigationBridge|SyntaxError/i.test(x)),[],'History errors');
  console.log('PASS '+name+': section search, floating Back/Forward, exact return, recent list, contents, Help, safe JSON backup/import');
 }finally{await context.close();await browser.close();}
}
server.listen(0,'127.0.0.1',async()=>{
 const host='http://127.0.0.1:'+server.address().port;
 try{await exercise(chromium,'chromium',host);await exercise(webkit,'webkit',host);}
 catch(e){console.error(e.stack);process.exitCode=1;}
 finally{server.close();}
});
