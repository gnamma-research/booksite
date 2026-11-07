'use strict';
/* Browser acceptance for the section-local saved-reference navigator.
   Requires Playwright Chromium and WebKit, supplied by Reading Desk browser CI. */
const assert=require('node:assert/strict');
const path=require('node:path');
const {spawn}=require('node:child_process');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..'),URL='http://127.0.0.1:8894/daruri/#section=195';
const now=Date.UTC(2026,9,23,6),term='mafhūm';
const source=(id,kind,target,origins=[])=>({
 id,kind,target,origins,title:'',body:'',created:now,updated:now,
 modified:0,dateSource:'recorded',deleted:0,standalone:false
});
const examples=[
 source('sec195','section',{kind:'section',section:'195'}),
 source('para195','paragraph',{kind:'paragraph',section:'195',segment:0,lang:'en'}),
 source('dictionary195','dictionary',{kind:'dictionary',term},[{section:'195',segment:0}]),
 source('quran195-1','footnote',{kind:'footnote',section:'195',noteId:'QUR-R195-Q035'}),
 source('quran195-2','footnote',{kind:'footnote',section:'195',noteId:'QUR-R195-Q036'}),
 source('hadith195','footnote',{kind:'footnote',section:'195',noteId:'HAD-R195'}),
 {...source('note195','note',{kind:'paragraph',section:'195',segment:0,lang:'en'}),
  body:'Research question about §195',title:'Research question about §195'},
 // A previously saved dictionary with no known reading origin remains intact
 // in Reading Desk but must not be incorrectly assigned to this section.
 source('legacy-unlocated','dictionary',{kind:'dictionary',term:'ghāya'})
];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const probe=async page=>page.waitForFunction(()=>{
 const dock=document.querySelector('#readerDock');
 const status=document.querySelector('#gn-dock-private-status');
 return dock&&!dock.hidden&&status&&!status.hidden&&
  status.querySelector('button')&&
  (status.querySelector('button').getAttribute('aria-label')||'').includes('195');
},{timeout:35000});
async function exercise(engine,mobile,width=390){
 const browser=await engine.launch({headless:true,
  ...(engine===chromium?{args:['--no-sandbox']}: {})});
 const device=mobile?'mobile '+width+'px':'desktop',name=(engine===webkit?'WebKit':'Chromium')+' '+device;
 const context=await browser.newContext({viewport:{width:mobile?width:1180,height:mobile?844:850},
  isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
 await context.addInitScript(items=>{
  localStorage.setItem('gnamma-reading-desk-v1',
   JSON.stringify({format:'gnamma-reading-desk',version:1,items}));
 },examples);
 const page=await context.newPage(),errors=[];
 page.on('pageerror',err=>errors.push(err.message));
 try{
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  await probe(page);
  const items=page.locator('#readerDock .gn-dock-private-status');
  assert.equal((await items.locator('.gn-dock-saved-prefix').innerText()).trim(),'',
    name+': the checked bookmark must replace the redundant Saved word');
  assert.equal(await items.locator('.gn-dock-saved-prefix .gn-bm-ribbon').count(),1,
    name+': checked bookmark icon must identify personal saved categories');
  assert.match(await items.getAttribute('aria-label'),/personal saved items/i);
  assert.equal(await items.locator('[data-gn-mark="section"]').count(),1,
    name+': section category must remain visible in the bookmark navigator');
  if(mobile){
   const summary=items.locator('.gn-dock-summary');
   await summary.waitFor();
   const target=await summary.boundingBox();
   assert.ok(target&&target.height>=44&&target.width>=44,
     name+': mobile saved-items target must be at least 44 × 44 CSS pixels, got '+JSON.stringify(target));
   assert.ok(target.x>=-1&&target.x+target.width<=width+1,
     name+': saved-items target must fit inside the mobile viewport');
   assert.match(await summary.getAttribute('aria-label'),/7 saved items in section 195/);
   // Exercise one genuine mobile tap, rather than click()-only activation.
   const touchTarget=await summary.boundingBox();
   await page.touchscreen.tap(touchTarget.x+touchTarget.width/2,
    touchTarget.y+touchTarget.height/2);
   const popup=page.locator('#gn-dock-saved-sheet');
   await popup.waitFor();
   const sheetRect=await popup.boundingBox();
   assert.ok(sheetRect&&sheetRect.x>=-1&&sheetRect.x+sheetRect.width<=width+1&&sheetRect.y>=-1,
     name+': saved-item sheet must stay inside the mobile viewport');
   const originalReaderScroll=await page.evaluate(()=>window.scrollY);
   await popup.locator('.gn-dock-sheet-item').last().scrollIntoViewIfNeeded();
   assert.ok(Math.abs((await page.evaluate(()=>window.scrollY))-originalReaderScroll)<2,
     name+': scrolling the saved-item list must not scroll the underlying reader');
   assert.equal((await popup.locator('.gn-dock-sheet-heading h3').innerText()).trim(),
    'Your saved items in §195',name+': popup heading must name saved items');
   assert.equal(await popup.locator('.gn-dock-sheet-item').count(),7,
    name+': actual saved-item list should contain seven entries');
   assert.ok(await popup.getByText('Research question about §195').count());
   assert.ok(await popup.getByText(term).count());
   await popup.locator('.gn-dock-sheet-close').click();
   assert.equal(await page.locator('#gn-dock-saved-sheet').count(),0);
   await summary.click();
   await popup.locator('.gn-dock-sheet-item').filter({hasText:term}).click();
   await page.locator('#detailTitle').waitFor({timeout:20000});
   assert.match(await page.locator('#detailTitle').innerText(),/mafhūm/i,
    name+': a dictionary bookmark must open the dictionary entry');
   await page.locator('#detailContent [data-rd="attach-bookmark"]').waitFor();
   assert.equal(await page.locator('#detailContent [data-rd="attach-bookmark"]').count(),1,
    name+': expanded lexical entry lost its bookmark action');
   assert.equal(await page.locator('#gn-dock-saved-sheet').count(),0);
  }else{
   assert.equal(await items.locator('[data-gn-mark="dictionary"] .gn-dock-count').innerText(),'1');
   assert.equal(await items.locator('[data-gn-mark="section"] .gn-dock-count').innerText(),'1');
   assert.equal(await items.locator('[data-gn-mark="quran"] .gn-dock-count').innerText(),'2');
   assert.equal(await items.locator('[data-gn-mark="hadith"] .gn-dock-count').innerText(),'1');
   await items.locator('[data-gn-mark="quran"]').click();
   await page.locator('#gn-dock-saved-sheet').waitFor();
   assert.equal(await page.locator('#gn-dock-saved-sheet .gn-dock-sheet-item').count(),2);
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('#gn-dock-saved-sheet').count(),0);
   await items.locator('[data-gn-mark="dictionary"]').click();
   // The compact sheet also opens for one record; select that actual item.
   const dictionarySheet=page.locator('#gn-dock-saved-sheet');
   await dictionarySheet.waitFor({state:'visible'});
   assert.equal(await dictionarySheet.locator('.gn-dock-sheet-item').count(),1);
   await dictionarySheet.locator('.gn-dock-sheet-item').click();
   await page.locator('#detailTitle').waitFor();
   assert.match(await page.locator('#detailTitle').innerText(),/mafhūm/i);
  }
  assert.ok(!errors.some(e=>/not a function|undefined is not|Cannot read properties/.test(e)),
   name+': application errors: '+errors.join('; '));
  console.log('PASS '+name+' contextual saved items and direct navigation');
 }finally{await browser.close();}
}
(async()=>{
 const server=spawn('python3',['-m','http.server','8894','--bind','127.0.0.1'],{
  cwd:ROOT,stdio:'ignore'});
 try{
  await sleep(1350);
  for(const engine of [chromium,webkit]){
   await exercise(engine,false);
   for(const width of [320,375,390])await exercise(engine,true,width);
  }
 }finally{server.kill('SIGTERM');}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
