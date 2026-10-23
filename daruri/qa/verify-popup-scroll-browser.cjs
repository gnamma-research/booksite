'use strict';
// Native browser scroll-owner QA for scholarly notes and ordinary reader dialogs.
// The runner has no user accounts, bookmarks or personal data.
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {spawn}=require('node:child_process');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const HOST='http://127.0.0.1:8878';
const OUT=path.join(__dirname,'popup-scroll-artifacts');
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(ok=>setTimeout(ok,ms));
async function check(browserType,width,touch){
 const browser=await browserType.launch({headless:true,...(browserType===chromium?{args:['--no-sandbox']}:{})});
 const context=await browser.newContext({viewport:{width,height:844},isMobile:touch,hasTouch:touch,deviceScaleFactor:touch?2:1,reducedMotion:'reduce'});
 const page=await context.newPage(),label=(browserType===webkit?'webkit':'chromium')+'-'+width;
 const check= (ok,msg)=>assert.ok(ok,label+': '+msg);
 try{
  await page.goto(HOST+'/daruri/#section=31',{waitUntil:'domcontentloaded',timeout:90000});
  const h=page.locator('#reader .gn-hadith-inline-marker:visible').first();
  await h.waitFor({timeout:50000});await h.scrollIntoViewIfNeeded();
  const originalY=await page.evaluate(()=>scrollY);
  await h.click();
  const layer=page.locator('#gn-scholar-layer');
  await layer.waitFor({timeout:20000});
  const lock=await page.evaluate(()=>({
   style:document.body.style.position,
   top:document.body.style.top,html:getComputedStyle(document.documentElement).overflow,
   outer:getComputedStyle(document.querySelector('#gn-scholar-layer .gn-layer-scroll')).overflowY,
   locked:window.GnammaPopupScroll?.isLocked()
  }));
  check(lock.style==='fixed'&&Math.abs(parseFloat(lock.top)+originalY)<=2&&lock.html==='hidden'&&lock.locked,
   'Hadith modal failed to freeze its underlying reading position: '+JSON.stringify(lock));
  check(lock.outer==='auto','Scholar modal is not the sole parent scroll owner');
  await layer.locator('.gn-hadith-context-toggle').first().click();
  await layer.locator('.gn-hadith-return-summary').first().waitFor({timeout:30000});
  const scrollDetails=await page.evaluate(()=>{
   const detail=document.querySelector('#gn-scholar-layer .gn-hadith-context-body');
   const outer=document.querySelector('#gn-scholar-layer .gn-layer-scroll');
   outer.scrollTop=outer.scrollHeight;
   return {inner:getComputedStyle(detail).overflowY,maxHeight:getComputedStyle(detail).maxHeight,
    bottom:outer.scrollTop,scrollHeight:outer.scrollHeight,clientHeight:outer.clientHeight,
    bodyTop:document.body.style.top};
  });
  check(scrollDetails.inner==='visible'&&scrollDetails.maxHeight==='none',
    'Hadith disclosure has a second nested scrollbar: '+JSON.stringify(scrollDetails));
  check(scrollDetails.scrollHeight>scrollDetails.clientHeight,'Test note did not exercise scrolling');
  if(!touch){
   await page.mouse.move(4,350);await page.mouse.wheel(0,500);
   check(await page.evaluate(top=>document.body.style.top===top,scrollDetails.bodyTop),
     'Backdrop wheel moved the book beneath the note');
  }
  await layer.locator('.gn-hadith-return-summary').first().click();
  const returned=await page.evaluate(()=>{
   const scroller=document.querySelector('#gn-scholar-layer .gn-layer-scroll');
   const h=document.querySelector('#gn-scholar-layer .gn-note-entry h3');
   return {top:scroller.scrollTop,focus:document.activeElement===h};
  });
  check(returned.top<scrollDetails.bottom&&returned.focus,
   'Return-to-summary cannot recover first note heading: '+JSON.stringify(returned));
  await layer.locator('button[data-gn-close]').click();
  check(await layer.count()===0,'Scholar dialog did not close');
  const restored=await page.evaluate(()=>({y:scrollY,position:document.body.style.position,overflow:document.documentElement.style.overflow,locked:window.GnammaPopupScroll?.isLocked()}));
  check(Math.abs(restored.y-originalY)<=4&&!restored.locked&&restored.position==='',
   'Reader position or modal lock not restored: '+JSON.stringify({originalY,restored}));

  // The same sheet is used by the Notes list, Qur'an context, Bidāya applications
  // and historical dictionary source popups.
  await page.locator('#reader [data-gn-notes-open]:visible').first().click();
  await layer.waitFor();
  check(await page.evaluate(()=>document.body.style.position==='fixed'),
    'Section Notes has no background-scroll lock');
  await layer.locator('[data-gn-close]').last().click();

  await page.goto(HOST+'/daruri/#section=1',{waitUntil:'domcontentloaded',timeout:90000});
  const q=page.locator('#reader .quran-source-ref:visible').first();
  await q.waitFor({timeout:50000});await q.click();
  await layer.waitFor();
  check(await page.evaluate(()=>document.body.style.position==='fixed'),
    'Qurʾān source popup has no background-scroll lock');
  await layer.locator('.gn-quran-context-toggle').first().click();
  const qBody=layer.locator('.gn-quran-context-body').first();
  await qBody.waitFor();
  check(await qBody.evaluate(el=>getComputedStyle(el).overflowY!=='auto'),
    'Qurʾān disclosure acquired a second scrollbar');
  await layer.locator('button[data-gn-close]').click();
  check(await page.evaluate(()=>!window.GnammaPopupScroll.isLocked()),'Qurʾān popup left a stale lock');

  // Global search is a separate overlay implementation; it must use the same
  // viewport lock instead of allowing the book to move beneath it.
  await page.waitForFunction(()=>typeof window.GnammaUnifiedSearch?.open==='function',{timeout:30000});
  await page.evaluate(()=>window.GnammaUnifiedSearch.open());
  const search=page.locator('#gn-unified-search:not([hidden]) [role="dialog"]');
  await search.waitFor({timeout:15000});
  check(await page.evaluate(()=>document.body.style.position==='fixed'&&window.GnammaPopupScroll.isLocked()),
    'Unified research search allows scrolling behind its dialog');
  await page.evaluate(()=>window.GnammaUnifiedSearch.close());
  check(await page.evaluate(()=>!window.GnammaPopupScroll.isLocked()),
    'Unified research search did not release the reader after closing');

  console.log('PASS '+label+': single Hadith/Notes/Qurʾān scroll; background freeze; summary return; search lock; exact reading-position restoration');
 }catch(e){
  await page.screenshot({path:path.join(OUT,label+'-failed.png')}).catch(()=>{});
  throw e;
 }finally{await context.close();await browser.close();}
}
async function main(){
 const server=spawn('python3',['-m','http.server','8878','--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
 try{
  await sleep(1600);
  await check(chromium,1240,false);
  await check(chromium,390,true);
  await check(webkit,390,true);
 }finally{server.kill();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
