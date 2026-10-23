'use strict';
/* Browser regression for other reader popups: search, preferences, reference,
 * Reading Desk, word context and backup. Run after Playwright is installed. */
const assert=require('node:assert/strict');
const path=require('node:path');
const {spawn}=require('node:child_process');
const {chromium,webkit}=require('playwright');
const HOST='http://127.0.0.1:8892';
const ROOT=path.resolve(__dirname,'../..');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function ready(server){
 for(let i=0;i<90;i++){
  if(server.exitCode!==null)throw Error('Test server exited');
  try{if((await fetch(HOST+'/daruri/')).ok)return;}catch(_){}
  await delay(150);
 }
 throw Error('Test server not ready');
}
async function check(engine,width,touch){
 const label=(engine===webkit?'WebKit':'Chromium')+' '+width;
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 const context=await browser.newContext({viewport:{width,height:844},isMobile:touch,hasTouch:touch,reducedMotion:'reduce'});
 const page=await context.newPage();
 try{
  await page.goto(HOST+'/daruri/#section=31',{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>document.querySelector('#reader .passage-grid')&&window.GnammaReaderScrollLock,{timeout:35000});
  await page.evaluate(()=>window.scrollTo({top:700,behavior:'instant'}));
  await delay(100);
  const before=await page.evaluate(()=>window.scrollY);
  async function verifyOpen(selector,description){
   await page.locator(selector).waitFor({timeout:25000});
   const state=await page.evaluate(()=>{
    const b=document.body,r=document.documentElement;
    return{fixed:getComputedStyle(b).position==='fixed',root:r.style.overflow,top:b.style.top,active:window.GnammaReaderScrollLock.active()};
   });
   assert(state.fixed&&state.root==='hidden'&&state.active,label+' '+description+': background scroll was not locked');
   return state;
  }
  async function verifyClosed(description){
   await page.waitForFunction(()=>!window.GnammaReaderScrollLock.active(),null,{timeout:10000});
   const restored=await page.evaluate(()=>({position:document.body.style.position,overflow:document.documentElement.style.overflow,y:window.scrollY}));
   assert(restored.position===''&&restored.overflow==='',label+' '+description+': lock not released');
   assert(Math.abs(restored.y-before)<4,label+' '+description+': lost reading position');
  }
  await page.evaluate(()=>showOverlay('settingsOverlay'));
  await verifyOpen('#settingsOverlay:not([hidden]) [role="dialog"]','settings');
  await page.evaluate(()=>closeOverlay('settingsOverlay'));
  await verifyClosed('settings');
  await page.evaluate(()=>showOverlay('infoOverlay'));
  const initial=await verifyOpen('#infoOverlay:not([hidden]) [role="dialog"]','reference');
  // Nested scholar note must not unlock the underlying reference dialog.
  await page.evaluate(()=>gnShowLayer('Editorial note','<article class="gn-layer-note"><h3>Source note</h3><p>Context</p></article>','notes'));
  await verifyOpen('#gn-scholar-layer [role="dialog"]','nested source');
  await page.locator('#gn-scholar-layer [data-gn-close]').last().click();
  const nested=await page.evaluate(()=>({active:window.GnammaReaderScrollLock.active(),position:document.body.style.position,top:document.body.style.top}));
  assert(nested.active&&nested.position==='fixed'&&nested.top===initial.top,label+': returning to reference unlocked the book');
  await page.evaluate(()=>closeOverlay('infoOverlay'));
  await verifyClosed('nested scholarly note');
  await page.waitForFunction(()=>!!window.GnammaUnifiedSearch,{timeout:30000});
  await page.evaluate(()=>window.GnammaUnifiedSearch.open());
  await verifyOpen('#gn-unified-search:not([hidden]) [role="dialog"]','research search');
  await page.evaluate(()=>window.GnammaUnifiedSearch.close());
  await verifyClosed('research search');
  const noteEditor=page.locator('[data-rd="section-note"]').first();
  await noteEditor.waitFor({timeout:30000});
  await noteEditor.click();
  await verifyOpen('#gn-rd-editor-shade [role="dialog"]','Reading Desk editor');
  await page.locator('#gn-rd-editor-shade [data-rd="close-editor"]').click();
  await verifyClosed('Reading Desk editor');
  await page.waitForFunction(()=>!!window.GnammaBackupTransfer,{timeout:30000});
  await page.evaluate(()=>window.GnammaBackupTransfer.open());
  await verifyOpen('#gn-transfer-shade [role="dialog"]','backup transfer');
  await page.locator('#gn-transfer-shade [data-transfer="close"]').click();
  await verifyClosed('backup transfer');
  await page.waitForFunction(()=>!!window.GnammaWordContext,{timeout:30000});
  await page.evaluate(()=>{
    const grid=document.querySelector('#reader .passage-grid'),ar=grid?.querySelector('.passage-ar');
    window.GnammaWordContext.openWord('القياس',ar,grid,ar);
  });
  await verifyOpen('#gnamma-word-context[role="dialog"]:not([hidden])','word context');
  await page.evaluate(()=>window.GnammaWordContext.close());
  await verifyClosed('word context');
  await page.evaluate(()=>showOverlay('jumpOverlay'));
  await verifyOpen('#jumpOverlay:not([hidden]) [role="dialog"]','section picker');
  await page.evaluate(()=>closeOverlay('jumpOverlay'));
  await verifyClosed('section picker');
  // Computed layout checks on actual temporary Reading Desk dialog surfaces.
  const layout=await page.evaluate(()=>{
   const ids=[['editor','gn-rd-editor-shade','gn-rd-editor'],['relink','gn-rd-relink-shade','gn-rd-relink']];
   return ids.map(([name,shadeClass,contentClass])=>{
    const shade=document.createElement('div');shade.className=shadeClass;
    const content=document.createElement('section');content.className=contentClass;
    content.innerHTML='<h3>Test note</h3><div style="height:1500px">Long content</div>';
    shade.append(content);document.body.append(shade);
    const item={name,outer:getComputedStyle(shade).overflowY,inner:getComputedStyle(content).overflowY};
    shade.remove();return item;
   });
  });
  for(const x of layout){
   assert(!['auto','scroll'].includes(x.outer),label+': '+x.name+' shade has a second independent scrollbar');
   assert(['auto','scroll'].includes(x.inner),label+': '+x.name+' does not scroll inside the dialog');
  }
  if(touch){
   const item=await page.evaluate(()=>{
    const panel=document.createElement('aside');panel.className='gn-rd-inline-panel';
    const top=document.createElement('header');top.textContent='Saved items';
    const content=document.createElement('div');content.className='gn-rd-inline-items';
    content.innerHTML='<div style="height:1800px">Saved notes</div>';
    panel.append(top,content);document.body.append(panel);
    const result={parent:getComputedStyle(panel).overflowY,items:getComputedStyle(content).overflowY};
    panel.remove();return result;
   });
   assert(item.parent==='hidden'&&item.items==='auto',label+': mobile saved-items panel retained nested scrollbars');
  }
  console.log('PASS '+label+': one popup scroller, locked background and returned reading position across 7 dialog families');
 }finally{await context.close();await browser.close();}
}
async function main(){
 const server=spawn('python3',['-m','http.server','8892','--bind','127.0.0.1','--directory',ROOT],{stdio:'ignore'});
 try{await ready(server);await check(chromium,1180,false);await check(chromium,390,true);await check(webkit,390,true);}
 finally{server.kill('SIGTERM');}
}
main().catch(err=>{console.error(err);process.exitCode=1;});
