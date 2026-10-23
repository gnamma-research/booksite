'use strict';
/* Actual Chromium and WebKit scroll regression for Daruri scholarly note popups.
 * Exercises an expanded two-report Hadith, iPhone-sized panels, backdrop and
 * reader position restoration. Run from repository root after Playwright install. */
const assert=require('node:assert/strict');
const path=require('node:path');
const {spawn}=require('node:child_process');
const {chromium,webkit}=require('playwright');
const HOST='http://127.0.0.1:8891';
const ROOT=path.resolve(__dirname,'../..');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function ready(server){
 for(let i=0;i<80;i++){
  if(server.exitCode!==null)throw Error('Local HTTP server exited');
  try{const response=await fetch(HOST+'/daruri/');if(response.ok)return;}catch(_){}
  await sleep(150);
 }
 throw Error('Local reader HTTP server did not become available');
}
async function check(engine,width,touch){
 const name=(engine===webkit?'webkit':'chromium')+'-'+width;
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 const context=await browser.newContext({
  viewport:{width,height:844},isMobile:touch,hasTouch:touch,
  deviceScaleFactor:touch?2:1,reducedMotion:'reduce'
 });
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',error=>errors.push(String(error.message)));
 try{
  await page.goto(HOST+'/daruri/#section=31',{waitUntil:'domcontentloaded',timeout:90000});
  const marker=page.locator('.gn-hadith-inline-marker[data-gn-hadith-inline="HAD-R031"]').first();
  await marker.waitFor({timeout:40000});
  await marker.scrollIntoViewIfNeeded();
  await marker.focus();
  const readingY=await page.evaluate(()=>window.scrollY);
  await marker.click();
  await page.locator('#gn-scholar-layer [role="dialog"]').waitFor();
  const initial=await page.evaluate(()=>{
   const scroll=document.querySelector('#gn-scholar-layer .gn-layer-scroll');
   const jump=document.querySelector('#gn-scholar-layer [data-gn-summary-jump]');
   return {
    fixed:getComputedStyle(document.body).position==='fixed',
    rootLocked:document.documentElement.style.overflow==='hidden',
    jumpHidden:jump?.hidden,
    scroller:!!scroll,scrollOverflow:scroll?getComputedStyle(scroll).overflowY:null,
    initialBodyTop:document.body.style.top
   };
  });
  assert(initial.fixed&&initial.rootLocked,name+': the reader remains scrollable behind the note');
  assert.equal(initial.jumpHidden,true,name+': Summary shortcut must not clutter opening view');
  assert(initial.scroller&&initial.scrollOverflow==='auto',name+': missing sole popup scroll pane');
  await page.locator('#gn-scholar-layer .gn-hadith-context-toggle').first().click();
  await page.locator('#gn-scholar-layer [data-hadith-report]').first().waitFor({timeout:30000});
  const inspected=await page.evaluate(()=>{
   const pane=document.querySelector('#gn-scholar-layer .gn-layer-scroll');
   const inner=document.querySelector('#gn-scholar-layer .gn-hadith-context-body');
   const nested=[...pane.querySelectorAll('*')].filter(el=>{
    const overflow=getComputedStyle(el).overflowY;
    return (overflow==='auto'||overflow==='scroll')&&el.scrollHeight>el.clientHeight+5;
   });
   return {innerOverflow:getComputedStyle(inner).overflowY,
    innerMaxHeight:getComputedStyle(inner).maxHeight,
    nested:nested.map(el=>el.className||el.tagName),
    scrollHeight:pane.scrollHeight,clientHeight:pane.clientHeight,
    reportCount:document.querySelectorAll('#gn-scholar-layer [data-hadith-report]').length};
  });
  assert.equal(inspected.reportCount,2,name+': expected two source transmissions');
  assert.equal(inspected.innerMaxHeight,'none',name+': expanded Hadith retained its 55vh/65vh scroll limit');
  assert(!['auto','scroll'].includes(inspected.innerOverflow),name+': a nested Hadith scrollbar remains');
  assert.deepEqual(inspected.nested,[],name+': more than one independent popup scrollbar');
  assert(inspected.scrollHeight>inspected.clientHeight+100,name+': test did not reach a scrollable long note');
  await page.evaluate(()=>{
   const pane=document.querySelector('#gn-scholar-layer .gn-layer-scroll');
   pane.scrollTop=pane.scrollHeight;
   pane.dispatchEvent(new Event('scroll'));
  });
  await page.waitForFunction(()=>!document.querySelector('[data-gn-summary-jump]').hidden,null,{timeout:5000});
  assert.equal(await page.evaluate(()=>document.body.style.top),initial.initialBodyTop,
   name+': expanding/scanning a note moved the background book');
  await page.locator('[data-gn-summary-jump]').click();
  await page.waitForFunction(()=>document.querySelector('#gn-scholar-layer .gn-layer-scroll').scrollTop<=2,{timeout:5000});
  assert.equal(await page.locator('[data-gn-summary-jump]').isVisible(),false,
   name+': Summary shortcut should vanish when the summary is reached');
  if(!touch){
   await page.mouse.move(7,7);await page.mouse.wheel(0,650);
   assert.equal(await page.evaluate(()=>document.body.style.top),initial.initialBodyTop,
    name+': wheel on the backdrop scrolled the underlying book');
  }
  await page.locator('#gn-scholar-layer .gn-layer-top [data-gn-close]').click();
  await page.waitForFunction(expected=>Math.abs(window.scrollY-expected)<3,readingY,{timeout:5000});
  const restored=await page.evaluate(()=>({
   open:!!document.querySelector('#gn-scholar-layer'),
   position:document.body.style.position,
   rootOverflow:document.documentElement.style.overflow,
   focusIsMarker:document.activeElement?.matches('.gn-hadith-inline-marker')
  }));
  assert(!restored.open&&restored.position===''&&restored.rootOverflow==='',
   name+': Notes close did not restore normal reader scrolling');
  assert(restored.focusIsMarker,name+': focus did not return to the invoking H marker');
  assert.deepEqual(errors,[],name+': uncaught browser errors '+errors.join('; '));
  console.log('PASS '+name+': one scroll pane, hidden background, jump to summary, restored book position and focus');
 }finally{await context.close();await browser.close();}
}
async function main(){
 const server=spawn('python3',['-m','http.server','8891','--bind','127.0.0.1','--directory',ROOT],{stdio:'ignore'});
 server.on('error',error=>console.error('HTTP server failed:',error));
 try{
  await ready(server);
  await check(chromium,1180,false);
  await check(chromium,390,true);
  await check(webkit,390,true);
  await check(webkit,320,true);
 }finally{server.kill('SIGTERM');}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
