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
  await page.evaluate(()=>{
   window.__qaBackgroundClicks=0;
   document.querySelector('#reader')?.addEventListener('click',()=>window.__qaBackgroundClicks++,true);
   document.querySelector('#readingControls')?.addEventListener('click',()=>window.__qaBackgroundClicks++,true);
  });
  const original=await page.evaluate(()=>({y:window.scrollY,bodyPosition:document.body.style.position}));
  await trigger.click();
  const sheet=page.locator('#gn-dock-saved-sheet');
  await sheet.waitFor({state:'visible',timeout:15000});
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
  await sheet.locator('.gn-dock-sheet-heading h3').click();
  assert.equal(await sheet.count(),1,name+': touching sheet heading incorrectly dismissed it');
  const scrolled=await sheet.locator('.gn-dock-sheet-list').evaluate(node=>{
   node.scrollTop=210;node.dispatchEvent(new Event('scroll',{bubbles:true}));
   return node.scrollTop;
  });
  assert(scrolled>50,name+': the saved item list would not scroll');
  // Safari may issue window scroll/resize even when its inner modal owns touch.
  // Neither signal is permission to dismiss the user's open list.
  await page.evaluate(()=>window.dispatchEvent(new Event('scroll')));
  await page.setViewportSize({width:375,height:760});
  assert.equal(await sheet.count(),1,name+': window scroll/resize dismissed saved items');
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
