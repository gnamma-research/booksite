'use strict';
/* Current published-master selection and contextual-word UX release audit.
 * Localhost only; no user data, no external requests or production stress.
 * Independent of old draft PR #175/#180. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(__dirname,'selection-current-audit');
fs.mkdirSync(OUT,{recursive:true});
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml',
 '.woff2':'font/woff2','.ttf':'font/ttf','.png':'image/png','.webp':'image/webp',
 '.pdf':'application/pdf'};
const server=http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch(_){res.writeHead(400);res.end();return;}
 const resolved=path.resolve(ROOT,'.'+pathname);
 if(!resolved.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(resolved)&&fs.statSync(resolved).isDirectory()?path.join(resolved,'index.html'):resolved;
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'content-type':MIME[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
 fs.createReadStream(file).pipe(res);
});
const records=[],failures=[];
async function check(id,fn){
 try{const detail=await fn();records.push({id,ok:true,detail});console.log('PASS '+id+' '+JSON.stringify(detail||{}).slice(0,1000));}
 catch(e){const reason=String(e.stack||e).slice(0,2200);failures.push({id,reason});console.log('FAIL '+id+' '+reason);}
}
async function browserCases(api,engine,url,width){
 const desktop=width>=900,id=engine+'-'+width;
 const browser=await api.launch({headless:true,...(engine==='chromium'?{args:['--no-sandbox']}:{})});
 const ctx=await browser.newContext({viewport:{width,height:844},isMobile:!desktop,hasTouch:!desktop,
  serviceWorkers:'block',reducedMotion:'reduce'});
 await ctx.addInitScript(()=>localStorage.setItem('daruri-reader-v2',
  JSON.stringify({n:'11',lang:'parallel',focusLevel:0,vowels:false})));
 const page=await ctx.newPage(),pageErrors=[];
 page.on('pageerror',e=>pageErrors.push(String(e)));
 try{
  await page.goto(url+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:70000});
  await page.waitForFunction(()=>window.GnammaWordContext?.openSelectedQuote&&window.GnammaReadingDesk,
   null,{timeout:35000});
  await page.locator('#readerDock:not([hidden])').waitFor();
  const arabic=page.locator('#reader .passage-grid[data-segment="0"] .passage-ar:visible').first();
  await arabic.waitFor();
  await arabic.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
  await check(id+'-selection-style',async()=>{
   const colors=await page.evaluate(()=>{
    const ar=document.querySelector('#reader .passage-grid .passage-ar');
    const en=document.querySelector('#reader .passage-grid .passage-en');
    const arStyle=getComputedStyle(ar,'::selection');
    const enStyle=getComputedStyle(en,'::selection');
    return {ar:arStyle.backgroundColor,en:enStyle.backgroundColor,
      paper:getComputedStyle(ar).backgroundColor,
      userSelect:getComputedStyle(ar).userSelect,
      webkitUserSelect:getComputedStyle(ar).getPropertyValue('-webkit-user-select')};
   });
   assert(colors.ar!=='rgba(0, 0, 0, 0)'&&colors.ar!=='transparent','Arabic selection has no visible paint');
   assert(colors.en!=='rgba(0, 0, 0, 0)'&&colors.en!=='transparent','English selection has no visible paint');
   assert(colors.userSelect!=='none'&&colors.webkitUserSelect!=='none','Browser text selection was disabled');
   return colors;
  });
  await check(id+'-plain-tap-no-inspector',async()=>{
   await arabic.click({position:{x:35,y:25}});
   assert.equal(await page.locator('#gnamma-word-context:visible').count(),0);
   assert.equal(await page.locator('.gnw-reader-menu').count(),0);
   return {tap:'native text'};
  });
  const prepare=()=>page.evaluate(()=>{
   const side=document.querySelector('#reader .passage-grid[data-segment="0"] .passage-ar');
   if(!side)throw Error('No Arabic passage');
   const w=document.createTreeWalker(side,NodeFilter.SHOW_TEXT);
   let node,match;
   while((node=w.nextNode())){
    if(node.parentElement?.closest('sup,button,[aria-hidden="true"]'))continue;
    match=node.textContent.match(/[\u0621-\u064a][\u0621-\u065f]*/u);
    if(match&&match[0].length>=3)break;
   }
   if(!node||!match)throw Error('No selectable source word');
   const range=document.createRange();range.setStart(node,match.index);range.setEnd(node,match.index+match[0].length);
   const prefix=document.createRange();prefix.setStart(side,0);prefix.setEnd(node,match.index);
   const fragment=prefix.cloneContents();fragment.querySelectorAll('sup,.gn-rd-passage-tools').forEach(x=>x.remove());
   const offset=fragment.textContent.length;
   const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);
   document.dispatchEvent(new Event('selectionchange'));
   const word=sel.toString(),r=range.getBoundingClientRect();
   return {section:'11',segment:0,lang:'ar',quote:word,offset,
     point:{x:r.x+r.width/2,y:r.y+r.height/2}};
  });
  let chosen=null;
  await check(id+'-one-word-selected-toolbar',async()=>{
   chosen=await prepare();
   assert(chosen.quote,'Selected word empty');
   await page.locator('#gn-rd-selection-bar:not([hidden])').waitFor({timeout:10000});
   assert.equal(await page.locator('#gn-rd-selection-bar [data-rd="selection-word-context"]').count(),1);
   assert.equal(await page.locator('#gnamma-word-context:visible').count(),0);
   return {word:chosen.quote,offset:chosen.offset};
  });
  await check(id+'-toolbar-opens-inspector',async()=>{
   await page.locator('#gn-rd-selection-bar [data-rd="selection-word-context"]').click();
   await page.locator('#gnamma-word-context:visible').waitFor({timeout:9000});
   const heading=await page.locator('#gnamma-word-context .gnw-header small').textContent();
   assert(heading.includes('§11'),'Wrong source §: '+heading);
   await page.keyboard.press('Escape');
   await page.locator('#gnamma-word-context:visible').waitFor({state:'hidden'});
   return {heading};
  });
  await check(id+'-collapsed-selection-fallback',async()=>{
   if(!chosen)chosen=await prepare();
   const result=await page.evaluate(target=>{
    window.getSelection()?.removeAllRanges();
    return window.GnammaWordContext.openSelectedQuote(target);
   },chosen);
   assert.equal(result,true,'Saved selected word could not be restored after blur');
   await page.locator('#gnamma-word-context:visible').waitFor();
   const heading=await page.locator('#gnamma-word-context .gnw-header small').textContent();
   assert(heading.includes('§11'));
   await page.keyboard.press('Escape');
   return {opened:result};
  });
  await check(id+'-multiword-selection-no-word-context',async()=>{
   const quote=await page.evaluate(()=>{
    const side=document.querySelector('#reader .passage-grid[data-segment="0"] .passage-ar');
    const walker=document.createTreeWalker(side,NodeFilter.SHOW_TEXT);
    let node,match;
    while((node=walker.nextNode())){
     if(node.parentElement?.closest('sup,[aria-hidden="true"],button'))continue;
     match=node.textContent.match(/[\u0621-\u064a][\u0621-\u065f]*\s+[\u0621-\u064a][\u0621-\u065f]*/u);
     if(match)break;
    }
    if(!node||!match)throw Error('Could not find 2 adjacent Arabic words');
    const range=document.createRange();
    range.setStart(node,match.index);range.setEnd(node,match.index+match[0].length);
    window.getSelection().removeAllRanges();window.getSelection().addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
    return window.getSelection().toString();
   });
   await page.locator('#gn-rd-selection-bar:not([hidden])').waitFor();
   await page.waitForTimeout(300);
   assert.equal(await page.locator('#gn-rd-selection-bar [data-rd="selection-word-context"]').count(),0,
    'Multiword selection must not inspect the first word');
   assert.equal(await page.locator('#gn-rd-selection-bar [data-rd="selection-bookmark"]').count(),1);
   assert.equal(await page.locator('#gn-rd-selection-bar [data-rd="selection-note"]').count(),1);
   return {phrase:quote};
  });
  await check(id+'-lexicon-refresh-preserves-modal-focus',async()=>{
   const state=await page.evaluate(async t=>{
    const original=window.GnammaMorphology,grid=document.querySelector('#reader .passage-grid[data-segment="0"]');
    const side=grid.querySelector('.passage-ar');
    let revision=0;
    window.__resolveLexicon=null;window.__morphUpdated=false;
    window.GnammaMorphology={...original,
     loadLexicon:()=>new Promise(resolve=>{window.__resolveLexicon=resolve;}),
     disambiguate:(...args)=>{const result=original.disambiguate(...args);
      revision++;if(revision>=2)window.__morphUpdated=true;return result;}
    };
    window.getSelection()?.removeAllRanges();
    window.GnammaWordContext.openWord(t.quote,side,grid,side);
    const dialog=document.querySelector('#gnamma-word-context'),card=dialog?.querySelector('.gnw-card');
    const before=card?.querySelector('[data-gnw-close]'),body=card?.querySelector('.gnw-body');
    if(!before||!body||typeof window.__resolveLexicon!=='function')throw Error('Delayed lexical test not established');
    before.focus({preventScroll:true});
    body.scrollTop=Math.min(100,Math.max(0,body.scrollHeight-body.clientHeight));
    const oldTop=body.scrollTop;
    window.__resolveLexicon();
    const expiry=Date.now()+10000;
    while(!window.__morphUpdated&&Date.now()<expiry)
     await new Promise(resolve=>setTimeout(resolve,50));
    if(!window.__morphUpdated)throw Error('Lexical response did not arrive');
    await new Promise(resolve=>setTimeout(resolve,70));
    const after=card.querySelector('[data-gnw-close]');
    const report={sameHeaderButton:before===after,
      originalButtonStillInDOM:before.isConnected,
      focusedClose:document.activeElement===after,
      oldTop,newTop:card.querySelector('.gnw-body')?.scrollTop};
    window.GnammaMorphology=original;
    window.GnammaWordContext.close();
    return report;
   },chosen);
   assert(state.sameHeaderButton,'Async lexicon refresh removed original Close button');
   assert(state.originalButtonStillInDOM,'Original focused Close button was disconnected');
   assert(state.focusedClose,'Keyboard focus vanished after morphology update');
   assert(Math.abs(state.newTop-state.oldTop)<=3,'Word Context scroll position was reset');
   return state;
  });
  if(desktop){
   await check(id+'-right-click-without-selection',async()=>{
    const src=chosen||await prepare();
    await page.evaluate(()=>window.getSelection()?.removeAllRanges());
    await page.mouse.click(src.point.x,src.point.y,{button:'right'});
    const menu=page.locator('.gnw-reader-menu');
    await menu.waitFor({state:'visible',timeout:5000});
    assert.equal(await menu.locator('[data-gnw-open-menu]').count(),1);
    await menu.locator('[data-gnw-open-menu]').click();
    await page.locator('#gnamma-word-context:visible').waitFor();
    await page.keyboard.press('Escape');
    return {opened:'Word Context from context menu'};
   });
   await check(id+'-selected-word-right-click-has-copy-and-context',async()=>{
    await prepare();
    const p=chosen?.point;
    const ev=await page.evaluate(point=>{
      const el=document.elementFromPoint(point.x,point.y);
      const e=new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:point.x,clientY:point.y,button:2});
      el.dispatchEvent(e);
      return {prevented:e.defaultPrevented,selection:window.getSelection()?.toString()||'',
        custom:!!document.querySelector('.gnw-reader-menu')};
    },p);
    assert(ev.selection.trim(),'Selection lost before right-click');
    assert.equal(ev.prevented,true,'Selected Arabic word must show the explicit contextual menu');
    assert.equal(ev.custom,true,'Selected Arabic word context menu is missing');
    assert.equal(await page.locator('.gnw-reader-menu [data-gnw-copy-menu]').count(),1,
      'Contextual menu lost Copy selection');
    assert.equal(await page.locator('.gnw-reader-menu [data-gnw-open-menu]').count(),1,
      'Contextual menu lost Word Context');
    return ev;
   });
  }
  await check(id+'-no-page-exceptions',async()=>{assert.deepEqual(pageErrors,[]);return {errors:pageErrors.length};});
  await page.screenshot({path:path.join(OUT,id+'.png'),fullPage:false});
 }finally{await ctx.close();await browser.close();}
}
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 try{
  const base='http://127.0.0.1:'+server.address().port;
  for(const [engine,api] of [['chromium',chromium],['webkit',webkit]])
   for(const width of [390,1280])await browserCases(api,engine,base,width);
 }finally{
  server.close();
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({sha:process.env.GITHUB_SHA||'local',records,failures},null,2));
  console.log('CURRENT MASTER SELECTION SUMMARY '+JSON.stringify({passed:records.length,failed:failures.length,
   failures:failures.map(f=>({id:f.id,reason:f.reason.slice(0,240)}))}));
 }
 if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;server.close();});
