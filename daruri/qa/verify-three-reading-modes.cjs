'use strict';
/* Browser-level Daruri mode/dock smoke test. No personal notes leave localhost.
   Run: node daruri/qa/verify-three-reading-modes.cjs */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{
 const raw=decodeURIComponent((req.url||'/').split('?')[0]);
 const local=path.resolve(ROOT,'.'+raw);
 if(!local.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(local)&&fs.statSync(local).isDirectory()?path.join(local,'index.html'):local;
 if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'content-type':TYPES[path.extname(file)]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
const items=[
 {id:'s',kind:'section',target:{kind:'section',section:'11'},created:100,updated:100,deleted:0,dateSource:'recorded'},
 {id:'p',kind:'paragraph',target:{kind:'paragraph',section:'11',segment:0,lang:'en'},created:101,updated:101,deleted:0,dateSource:'recorded'},
 {id:'q',kind:'quote',target:{kind:'quote',section:'11',segment:0,lang:'en',quote:'According to the People of the Sunna',offset:0},created:102,updated:102,deleted:0,dateSource:'recorded'},
 {id:'n',kind:'note',target:{kind:'paragraph',section:'11',segment:0,lang:'en'},title:'Reader note',body:'A private thought.',created:103,updated:103,deleted:0,dateSource:'recorded'}
];
async function exercise(engine,name,origin){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await context.addInitScript(({items})=>{
  // Test-only observer: inspect the existing local collection without altering it.
  let readingDeskExport;
  Object.defineProperty(window,'GnammaReadingDesk',{configurable:true,get(){return readingDeskExport;},set(value){readingDeskExport=value;if(value?.create&&!value.__qaWrapped){const original=value.create;value.create=function(...args){const desk=original(...args);window.__qaDesk=desk;return desk;};value.__qaWrapped=true;}}});
  localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'11',lang:'english',focusLevel:1,focusApparatus:true}));
  localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify({format:'gnamma-reading-desk',version:1,items}));
 },{items});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(origin+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForSelector('#readerDock:not([hidden])',{timeout:20000});
  // Container queries may collapse the visible counters to a total; the individual
  // spans remain attached, and the full mobile summary remains tappable.
  await page.waitForSelector('#gn-dock-private-status .gn-dock-summary-pair',{state:'attached',timeout:20000});
  await page.locator('#gn-dock-private-status .gn-dock-summary').waitFor({state:'visible'});
  assert(await page.locator('body.focus-level-1').count(),'old Focus 1 preference not retained');
  assert.equal(await page.locator('#gn-dock-private-status .gn-dock-summary').count(),1,'mobile saved references must have one generous touch target');
  assert.equal(await page.locator('#gn-dock-private-status .gn-dock-summary-pair').count(),4,'section bookmark, paragraph bookmark, quotation and note each need an indicator');
  const counts=await page.locator('#gn-dock-private-status .gn-dock-count').allTextContents();
  assert.deepEqual(counts,['1','1','1','1'],'saved §, ¶, exact quotation and note need separate counts');
  assert.equal(await page.locator('#gn-dock-paragraph-ref').innerText(),'· ¶1','bottom dock must identify paragraph 1');
  assert.equal((await page.locator('#gn-dock-private-status [data-gn-mark="paragraph"] .gn-dock-code').textContent()).trim(),'¶','paragraph category must retain its distinct pilcrow below the shared saved-bookmark symbol');
  assert(await page.locator('#gn-dock-private-status [data-gn-mark="note"] svg rect').count()===1 &&
    await page.locator('#gn-dock-private-status [data-gn-mark="note"] svg path').count()>=2,
    'personal note icon must contain a page and inset pen');
  // Scroll from ¶1 (bookmarked/highlighted/noted) to ¶2 (no marks of its own).
  // The section-wide counters MUST remain visible, otherwise a reader browsing
  // within §11 wrongly sees zero marks despite saved material in paragraph 1.
  await page.locator('#reader .passage-grid[data-segment="1"]').first()
    .evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
  await page.waitForFunction(()=>document.querySelector('#gn-dock-paragraph-ref')?.textContent==='· ¶2',{timeout:8000});
  assert.equal(await page.locator('#gn-dock-private-status [data-gn-mark="section"]').count(),1,
    'section bookmark must persist as reader advances to paragraph 2');
  assert.equal(await page.locator('#gn-dock-private-status [data-gn-mark="paragraph"]').count(),1,
    'section-wide paragraph-bookmark count vanished while browsing paragraph 2');
  assert.equal(await page.locator('#gn-dock-private-status [data-gn-mark="highlight"]').count(),1,
    'section-wide highlight count vanished while browsing paragraph 2');
  assert.equal(await page.locator('#gn-dock-private-status [data-gn-mark="note"]').count(),1,
    'section-wide personal-note count vanished while browsing paragraph 2');
  assert.deepEqual(await page.locator('#gn-dock-private-status .gn-dock-count').allTextContents(),
    ['1','1','1','1'],'section totals changed when only the visible paragraph changed');
  assert.match(await page.locator('#gn-dock-private-status .gn-dock-summary').getAttribute('aria-label'),
    /4 saved items in section 11/,'compact touch indicator must identify section-wide saved totals');
  await page.locator('#reader .passage-grid[data-segment="0"]').first()
    .evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
  await page.waitForFunction(()=>document.querySelector('#gn-dock-paragraph-ref')?.textContent==='· ¶1',{timeout:8000});

  assert.equal(await page.locator('.reader .chapter-nav').isVisible(),false,'duplicate in-text navigation still visible');
  await page.locator('#focusToolbar').click();
  await page.locator('#gn-reading-mode-picker:not([hidden])').waitFor();
  assert.equal(await page.locator('#gn-focus-apparatus-choice').isChecked(),true,'legacy apparatus preference lost');
  await page.locator('[data-gn-reader-mode="reading"]').click();
  await page.locator('body.focus-mode').waitFor({state:'detached'});
  const paraButton=page.locator('#reader .gn-rd-passage-tools [data-rd="paragraph-bookmark"]').first();
  await paraButton.waitFor();
  assert((await paraButton.innerHTML()).includes('gn-bm-paragraph') && (await paraButton.innerHTML()).includes('¶'),
    'visible paragraph tool must be two symbols in one button');
  assert(!(await paraButton.innerHTML()).includes('Save paragraph'),'obsolete paragraph text label must be absent');
  assert.equal(await paraButton.getAttribute('aria-pressed'),'true','saved paragraph must retain pressed state');
  await page.locator('#focusToolbar').click();
  await page.locator('[data-gn-reader-mode="focus"]').click();
  assert(await page.locator('body.focus-level-1').count(),'Focus did not retain optional apparatus');
  await page.locator('#focusToolbar').click();
  await page.locator('#gn-focus-apparatus-choice').uncheck();
  await page.locator('body.focus-level-2').waitFor();
  assert.equal(await page.locator('.reader .gn-reading-aftertext').isVisible(),false,'text-only Focus still shows apparatus');
  await page.locator('[data-gn-reader-mode="continuous"]').click();
  await page.locator('body.focus-level-3').waitFor();
  assert.equal(await page.locator('#readerDock .reader-step:visible').count(),0,'Continuous should have no adjacent-section arrows');
  // Continuous is a scrollable whole book; re-centre the annotated passage
  // before testing the passage-specific status, not the inherited viewport.
  // Mode switching itself asynchronously restores the prior reading section.
  // Place ¶2 near the top of the reading viewport AFTER the new mode settles.
  await page.waitForTimeout(350);
  await page.locator('#gn-continuous-11 .passage-grid[data-segment="1"]').first().evaluate(el=>{
    window.scrollTo({top:window.scrollY+el.getBoundingClientRect().top-150,behavior:'instant'});
    window.dispatchEvent(new Event('scroll'));
  });
  // Section-wide counts must remain visible even on the unsaved ¶2.
  await page.waitForFunction(()=>document.querySelector('#dockSection')?.textContent?.trim()==='§11',null,{timeout:10000});
  await page.waitForFunction(()=>document.querySelectorAll('#gn-dock-private-status .gn-dock-summary-pair').length===4,null,{timeout:10000});
  assert.deepEqual(await page.locator('#gn-dock-private-status .gn-dock-count').allTextContents(),
    ['1','1','1','1'],'Continuous lost section-wide status while scanning paragraphs');
  await page.locator('#focusToolbar').click();
  await page.locator('[data-gn-reader-mode="reading"]').click();
  await page.locator('body.focus-level-3').waitFor({state:'detached'});
  // Continuous reading can leave us in a different paragraph/section.
  // Return to the exact saved passage before asserting passage-local counts.
  await page.goto(origin+'/daruri/#section=11',{waitUntil:'domcontentloaded'});
  await page.locator('#reader .passage-grid[data-segment="0"]').first().evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
  await page.waitForTimeout(200);
  const noteMark=page.locator('#gn-dock-private-status [data-gn-mark="note"]');
  const diagnostics=await page.evaluate(()=>({hash:location.hash,heading:document.querySelector('#dockSection')?.textContent,body:document.body.className,markup:document.querySelector('#gn-dock-private-status')?.innerHTML,position:document.querySelector('#reader .passage-grid[data-segment="0"]')?.getBoundingClientRect().top,firstBottom:document.querySelector('#reader .passage-grid[data-segment="0"]')?.getBoundingClientRect().bottom,toolbarBottom:document.querySelector('#readingControls')?.getBoundingClientRect().bottom,dockTop:document.querySelector('#readerDock')?.getBoundingClientRect().top,hit:(()=>{const top=Math.max(0,document.querySelector('#readingControls')?.getBoundingClientRect().bottom||0),end=document.querySelector('#readerDock')?.getBoundingClientRect().top,y=Math.round(Math.max(top+35,Math.min(end-38,top+(end-top)*.42))),el=document.elementFromPoint(window.innerWidth/2,y);return {y,hit:el?.tagName,cls:el?.className,grid:el?.closest?.('.passage-grid')?.dataset.segment};})(),noteSource:JSON.parse(localStorage.getItem('gnamma-reading-desk-v1')||'{}').items?.filter(x=>x.kind==='note'),deskItems:window.__qaDesk?.records()?.map(x=>({id:x.id,kind:x.kind,section:x.target?.section,segment:x.target?.segment,deleted:x.deleted})),hidden:document.querySelector('#gn-dock-private-status')?.hidden,scrollY:window.scrollY,reader:document.querySelector('#reader')?.innerText.slice(0,95)}));
  assert(await noteMark.count(),'Saved paragraph note missing from dock after returning to §11 paragraph 1: '+JSON.stringify(diagnostics)+' errors: '+errors.join('; '));
  // Mobile categories are noninteractive labels inside the single summary
  // button. Open that whole button rather than clicking a hidden category.
  await page.locator('#gn-dock-private-status .gn-dock-summary').click();
  await page.locator('#gn-dock-saved-sheet').waitFor();
  await page.locator('#gn-dock-saved-sheet .gn-dock-sheet-item').filter({hasText:'Reader note'}).click();
  await page.locator('.gn-rd-page').waitFor();
  assert(await page.locator('.gn-rd-page').innerText().then(x=>x.includes('Reader note')),'notes count not linked to Reading Desk');
  await page.locator('[data-rd="return-reading"]').first().click();
  await page.waitForSelector('#readerDock:not([hidden])');
  await page.goto(origin+'/daruri/#section=12',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(300);
  assert.equal(await page.locator('#gn-dock-private-status .gn-dock-summary-pair').count(),0,'zero-count icons must be hidden');
  assert.equal(await page.locator('#gn-dock-paragraph-ref').innerText(),'· ¶1','paragraph locator must remain when no notes are saved');
  assert.equal(errors.filter(e=>/GnammaReadingDock|reading.mode|ReadingDesk/i.test(e)).length,0,'runtime errors: '+errors.join('; '));
  console.log('PASS '+name+' mode switch, legacy apparatus, dock counts, Reading Desk return, zero-state and arrow removal');
 }finally{await context.close();await browser.close();}
}
server.listen(0,'127.0.0.1',async()=>{
 const origin='http://127.0.0.1:'+server.address().port;
 try{await exercise(chromium,'chromium',origin);await exercise(webkit,'webkit',origin);}
 catch(e){console.error(e.stack);process.exitCode=1;}
 finally{server.close();}
});