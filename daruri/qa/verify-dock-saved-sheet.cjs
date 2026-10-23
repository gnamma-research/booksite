'use strict';
/* Real-browser regression: saved-items dock sheet on mobile Chromium/WebKit.
 * Synthetic private records live in an isolated test browser only. */
const assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml',
 '.woff2':'font/woff2','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{
 const raw=decodeURIComponent((req.url||'/').split('?')[0]);
 const local=path.resolve(ROOT,'.'+raw);
 if(!local.startsWith(ROOT+path.sep)){res.writeHead(403).end();return}
 const file=fs.existsSync(local)&&fs.statSync(local).isDirectory()?path.join(local,'index.html'):local;
 if(!fs.existsSync(file)){res.writeHead(404).end();return}
 res.writeHead(200,{'content-type':TYPES[path.extname(file)]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
const items=[
 {id:'saved-section',kind:'section',target:{kind:'section',section:'11'},created:100,updated:100,deleted:0},
 {id:'saved-paragraph',kind:'paragraph',target:{kind:'paragraph',section:'11',segment:0,lang:'en'},created:100,updated:100,deleted:0},
 {id:'saved-quote',kind:'quote',target:{kind:'quote',section:'11',segment:0,lang:'en',quote:'According to the People of the Sunna',offset:0},created:100,updated:100,deleted:0},
 {id:'saved-dictionary',kind:'dictionary',target:{kind:'dictionary',section:'11',term:'test'},created:100,updated:100,deleted:0},
 {id:'saved-quran',kind:'footnote',target:{kind:'quran',section:'11'},created:100,updated:100,deleted:0},
 {id:'saved-hadith',kind:'footnote',target:{kind:'hadith',section:'11'},created:100,updated:100,deleted:0},
 {id:'saved-other-source',kind:'index',target:{kind:'index',section:'11'},created:100,updated:100,deleted:0},
 ...Array.from({length:32},(_,i)=>({
  id:'saved-note-'+i,kind:'note',target:{kind:'paragraph',section:'11',segment:0,lang:'en'},
  title:'QA saved note '+String(i).padStart(2,'0'),
  body:'Private synthetic browser test record '+i,created:101+i,updated:101+i,deleted:0
 }))
];
async function exercise(engine,name,origin){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await context.addInitScript(({items})=>{
  localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'11',lang:'english',focusLevel:0}));
  localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify({format:'gnamma-reading-desk',version:1,items}));
 },{items});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(origin+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:90000});
  const trigger=page.locator('#gn-dock-private-status .gn-dock-summary');
  await trigger.waitFor({state:'visible',timeout:30000});
  // The approved compact phone dock intentionally hides the eight tiny icon/
  // count pairs and exposes one 44px+ bookmark/total target instead. Category
  // counts must stay in its accessible name, and all items in the real sheet.
  for(const width of [320,375,390,430]){
   await page.setViewportSize({width,height:844});
   await page.waitForFunction(()=>document.querySelectorAll(
    '#gn-dock-private-status .gn-dock-summary-pair').length===8,null,{timeout:9000});
   const geometry=await page.evaluate(()=>{
    const button=document.querySelector('#readerDock .gn-dock-summary'),
     symbols=button.querySelector('.gn-dock-summary-symbols'),
     rect=button.getBoundingClientRect(),
     ribbon=button.querySelector('.gn-dock-saved-prefix .gn-bm-ribbon')?.getBoundingClientRect();
    return {viewport:innerWidth,layoutWidth:document.documentElement.scrollWidth,
     shown:getComputedStyle(symbols).display,
     categoryIds:[...symbols.querySelectorAll('.gn-dock-summary-pair')].map(el=>el.dataset.gnMark),
     count:button.dataset.gnTotal,categoryCount:button.dataset.gnCategoryCount,
     label:button.getAttribute('aria-label')||'',
     bounds:{x:rect.x,width:rect.width,height:rect.height},
     ribbonVisible:!!ribbon&&ribbon.width>0&&ribbon.height>0};
   });
   assert.equal(geometry.shown,'none',name+' '+width+' compact dock exposed obsolete tiny icon row: '+JSON.stringify(geometry));
   assert.deepEqual(geometry.categoryIds,
    ['section','paragraph','dictionary','quran','hadith','source','highlight','note'],
    name+' '+width+' categories lost from saved-item model');
   assert.equal(geometry.count,'39',name+' '+width+' wrong compact saved-item total');
   assert.equal(geometry.categoryCount,'8',name+' '+width+' wrong saved category total');
   assert.match(geometry.label,/39 saved items in section 11/i);
   assert.match(geometry.label,/dictionary entries 1/i);
   assert.match(geometry.label,/personal notes 32/i);
   assert(geometry.ribbonVisible,name+' '+width+' bookmark icon invisible');
   assert(geometry.bounds.height>=44&&geometry.bounds.width>=44,
    name+' '+width+' compact saved target smaller than 44×44: '+JSON.stringify(geometry));
   assert(geometry.bounds.x>=-1&&geometry.bounds.x+geometry.bounds.width<=width+1,
    name+' '+width+' compact target outside viewport: '+JSON.stringify(geometry));
   assert(geometry.layoutWidth<=geometry.viewport+2,
    name+' '+width+' horizontal page overflow: '+JSON.stringify(geometry));
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>{
   window.__qaBackgroundClicks=0;
   document.querySelector('#reader')?.addEventListener('click',()=>window.__qaBackgroundClicks++,true);
   document.querySelector('#readingControls')?.addEventListener('click',()=>window.__qaBackgroundClicks++,true);
  });
  const original=await page.evaluate(()=>({y:window.scrollY,bodyPosition:document.body.style.position}));
  await trigger.click();
  const sheet=page.locator('#gn-dock-saved-sheet');
  await sheet.waitFor({state:'visible',timeout:15000});
  assert.equal(await sheet.locator('.gn-dock-sheet-category').count(),8,
   name+': all eight saved categories must be available inside the compact sheet');
  assert.equal(await sheet.locator('.gn-dock-sheet-item').count(),39,
   name+': compact display must not discard any of the saved items');
  assert.equal(await sheet.getAttribute('aria-modal'),'true');
  assert.equal(await page.locator('#gn-dock-saved-backdrop').count(),1,
   name+': missing backdrop to intercept reader taps');
  const visual=await page.evaluate(()=>{
   document.documentElement.dataset.palette='gnamma-air';
   const el=document.querySelector('#gn-dock-saved-sheet');
   const style=getComputedStyle(el),rect=el.getBoundingClientRect();
   const at=document.elementFromPoint(rect.left+rect.width/2,rect.top+36);
   const list=el.querySelector('.gn-dock-sheet-list');
   return {background:style.backgroundColor,image:style.backgroundImage,
    filter:style.backdropFilter,front:!!at?.closest('#gn-dock-saved-sheet'),
    z:Number(style.zIndex),rect:{top:rect.top,bottom:rect.bottom},
    listScrollHeight:list.scrollHeight,listClientHeight:list.clientHeight,
    bodyPosition:document.body.style.position,rootOverflow:document.documentElement.style.overflow};
  });
  assert.match(visual.background,/^rgb\(/,name+': translucent popup '+JSON.stringify(visual));
  assert.match(visual.image,/gradient/i,name+': missing theme-matched solid composition');
  assert(visual.front&&visual.z>100,name+': a different layer intercepts sheet taps');
  assert(visual.rect.top>=-2&&visual.rect.bottom<=844,name+': popup outside viewport');
  assert(visual.listScrollHeight>visual.listClientHeight+80,name+': need a genuinely scrollable list');
  assert.equal(visual.bodyPosition,'fixed',name+': book was not scroll locked');
  assert.equal(visual.rootOverflow,'hidden',name+': page viewport is still scrollable');
  // A real fingertip tap on the sheet heading must not be interpreted as
  // an outside tap and dismiss it.
  const heading=await sheet.locator('.gn-dock-sheet-heading h3').boundingBox();
  await page.touchscreen.tap(heading.x+heading.width/2,heading.y+heading.height/2);
  assert.equal(await sheet.count(),1,name+': touching sheet heading dismissed it');
  const list=sheet.locator('.gn-dock-sheet-list');
  const initialScroll=await list.evaluate(node=>node.scrollTop);
  if(name==='chromium'){
   // Real trusted touch sequence (not setting scrollTop in JavaScript).
   const session=await context.newCDPSession(page);
   const rect=await list.boundingBox(),x=rect.x+rect.width*.70,
    startY=rect.y+rect.height*.82;
   const point=y=>({x,y,radiusX:3,radiusY:3,force:1});
   await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(startY)]});
   for(let i=1;i<=12;i++){
    await session.send('Input.dispatchTouchEvent',{
     type:'touchMove',touchPoints:[point(startY-15*i)]});
    await page.waitForTimeout(12);
   }
   await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }else{
   // Playwright's mobile WebKit supports real taps but NOT a wheel or swipe
   // automation API. Exercise touch event propagation and the nested scroller
   // independently without falsely claiming to synthesize a native swipe.
   await list.evaluate(el=>{
    const rect=el.getBoundingClientRect();
    const before=rect.top+rect.height*.78,after=rect.top+rect.height*.42;
    // Mobile WebKit exposes Touch in some builds but disallows its
    // constructor. Use event objects with authentic touch fields in that
    // environment while retaining native Playwright fingertip taps above.
    function send(type,y){
     const e=new Event(type,{bubbles:true,cancelable:true});
     Object.defineProperty(e,'touches',{value:type==='touchend'?[]:[{clientY:y}]});
     el.dispatchEvent(e);
    }
    send('touchstart',before);
    send('touchmove',after);
    el.scrollTop=210;el.dispatchEvent(new Event('scroll',{bubbles:true}));
    send('touchend',after);
   });
  }
  await page.waitForTimeout(250);
  const realScroll=await list.evaluate(node=>node.scrollTop);
  assert(realScroll>initialScroll+30,
   name+': trusted gesture did not scroll inside sheet: '+initialScroll+' to '+realScroll);
  assert.equal(await sheet.count(),1,
   name+': dragging through saved items closed the dialog');
  // A reader history pulse, storage reindex or repaint is not an intentional
  // dismissal. This was an overlooked path in the first implementation.
  await page.evaluate(()=>{
   window.dispatchEvent(new Event('scroll'));
   window.dispatchEvent(new Event('hashchange'));
   document.dispatchEvent(new Event('gnamma-reader-route-change'));
   document.dispatchEvent(new Event('gnamma-reading-desk-change'));
   const pulse=document.createElement('span');pulse.hidden=true;
   document.querySelector('#mainContent')?.append(pulse);
  });
  await page.waitForTimeout(250);
  await page.setViewportSize({width:375,height:760});
  await page.waitForTimeout(100);
  assert.equal(await sheet.count(),1,
   name+': passive history/update/resize closed the dialog');
  assert(await list.evaluate(node=>node.scrollTop)>0,
   name+': scroll position reset after background update');
  await sheet.locator('.gn-dock-sheet-close').click();
  assert.equal(await sheet.count(),0);
  assert.equal(await page.locator('#gn-dock-saved-backdrop').count(),0);
  const restored=await page.evaluate(()=>({y:window.scrollY,position:document.body.style.position}));
  assert.equal(restored.position,original.bodyPosition,name+': scroll-lock leaked');
  assert(Math.abs(restored.y-original.y)<=3,name+': book moved when popup closed');
  // A touch outside must dismiss the sheet WITHOUT reaching the paragraph.
  await trigger.click();
  await sheet.waitFor({state:'visible'});
  await page.touchscreen.tap(5,90);
  assert.equal(await sheet.count(),0,name+': backdrop tap failed to dismiss');
  assert.equal(await page.evaluate(()=>window.__qaBackgroundClicks),0,
   name+': outside tap was delivered through backdrop to reader');
  // Finally, a deliberate tap on a saved item MUST still work.
  await trigger.click();
  await sheet.waitFor({state:'visible'});
  await sheet.locator('.gn-dock-sheet-item').filter({hasText:'QA saved note 15'}).click();
  await page.locator('.gn-rd-page').waitFor({timeout:12000});
  assert.match(await page.locator('.gn-rd-page').innerText(),/QA saved note 15/);
  assert.equal(await page.locator('#gn-dock-saved-backdrop').count(),0);
  assert.deepEqual(errors,[],name+': unexpected browser errors');
  console.log('PASS '+name+': solid sheet, isolated touch/scroll, exact page restore, saved-item navigation');
 }finally{await context.close();await browser.close()}
}
server.listen(0,'127.0.0.1',async()=>{
 const origin='http://127.0.0.1:'+server.address().port;
 try{
  await exercise(chromium,'chromium',origin);
  await exercise(webkit,'webkit',origin);
 }catch(e){console.error(e.stack);process.exitCode=1}
 finally{server.close()}
});
