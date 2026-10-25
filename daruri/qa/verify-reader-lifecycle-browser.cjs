'use strict';
/* Real-browser Daruri safety checks against localhost only.
 * Proves no stale personal-PDF initializer and source-correct, focus-stable Word Context.
 * Never opens production, never modifies actual reader's saved data. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const TYPE={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml',
 '.woff2':'font/woff2','.ttf':'font/ttf','.png':'image/png','.webp':'image/webp','.pdf':'application/pdf'};
const server=http.createServer((req,res)=>{
 let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch(_){res.writeHead(400);res.end();return;}
 const local=path.resolve(ROOT,'.'+name);
 if(!local.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(local)&&fs.statSync(local).isDirectory()?path.join(local,'index.html'):local;
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'content-type':TYPE[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
 fs.createReadStream(file).pipe(res);
});
const results=[],failures=[];
async function run(browser,engine,origin){
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,
  serviceWorkers:'block',reducedMotion:'reduce'});
 await ctx.addInitScript(()=>localStorage.setItem('daruri-reader-v2',
  JSON.stringify({n:'11',lang:'arabic',vowels:true,focusLevel:0})));
 try{
  for(const outcome of ['rejected','resolved']){
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   try{
    await page.goto(origin+'/daruri/#editions',{waitUntil:'domcontentloaded',timeout:65000});
    await page.waitForFunction(()=>window.GnammaPersonalExportInline?.ready&&
      !!document.getElementById('pe-form'),null,{timeout:40000});
    const state=await page.evaluate(async mode=>{
      const form=document.getElementById('pe-form');
      const original=window.fetch;
      let finish;
      window.fetch=(url,...rest)=>{
       if(String(url).includes('pdf-editions-manifest.json'))
        return new Promise((resolve,reject)=>{
          finish=mode==='rejected'?()=>reject(new Error('synthetic manifest failure')):
            ()=>resolve({ok:true,json:async()=>({files:{'daruri.pdf':{sha256:'a'.repeat(64),pages:243}},default_pdf:'daruri.pdf'})});
        });
       return original.call(window,url,...rest);
      };
      const run=window.GnammaPersonalExportInline.remount();
      if(typeof finish!=='function')throw Error('Did not intercept personal exporter manifest');
      form.remove();
      finish();
      let thrown='';
      try{await run}catch(error){thrown=String(error.message||error);}
      window.fetch=original;
      return {detached:!form.isConnected,thrown};
    },outcome);
    assert(state.detached,'The stale form was not detached');
    assert.equal(state.thrown,'','Stale personal-PDF initializer rejected: '+state.thrown);
    await page.waitForTimeout(120);
    assert.deepEqual(errors,[],'Unhandled personal-export errors');
    results.push({engine,case:'personal-'+outcome,ok:true});
    console.log('PASS '+engine+' personal-'+outcome);
   }finally{await page.close();}
  }
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(origin+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:65000});
   await page.waitForFunction(()=>window.GnammaReaderModes?.setMode&&window.GnammaWordContext?.openWord,
    null,{timeout:35000});
   await page.evaluate(()=>window.GnammaReaderModes.setMode('continuous'));
   await page.waitForFunction(()=>!!document.querySelector('#gn-continuous-11 .passage-grid'),
    null,{timeout:20000});
   const state=await page.evaluate(async()=>{
    const engine=window.GnammaMorphology;
    if(engine){await engine.loadLexicon();await engine.ensure('daruri');}
    const grid=document.querySelector('#gn-continuous-11 .passage-grid');
    const anchor=grid?.querySelector('.passage-ar');
    const word=(anchor?.textContent||'').match(/[\u0621-\u064a]{3,}/u)?.[0];
    if(!word)throw Error('Cannot select a real Arabic word from §11');
    // Deliberately stale URL without hashchange: the visible passage is §11.
    history.replaceState(null,'','#section=10');
    window.GnammaWordContext.openWord(word,anchor,grid,anchor);
    const card=document.querySelector('#gnamma-word-context .gnw-card');
    const closeBefore=card?.querySelector('[data-gnw-close]');
    const body=card?.querySelector('.gnw-body');
    if(!closeBefore||!body)throw Error('Word Context did not open');
    const target=body.querySelector('[data-gnw-search="literal"]');
    target?.focus({preventScroll:true});
    const focusBefore=document.activeElement===target;
    const header=card.querySelector('.gnw-header small')?.textContent||'';
    const expanded=[...body.querySelectorAll('details')];
    if(expanded.length)expanded[0].open=true;
    const scrollBefore=body.scrollTop;
    const updated=await new Promise(resolve=>{
      let done=false;const observer=new MutationObserver(()=>{
        if(done)return;done=true;observer.disconnect();resolve(true);
      });
      observer.observe(card,{childList:true,subtree:true});
      setTimeout(()=>{if(!done){done=true;observer.disconnect();resolve(false);}},11000);
    });
    const closeAfter=card.querySelector('[data-gnw-close]');
    const active=document.activeElement;
    return {header,word,updated,focusBefore,
      closeStable:closeBefore===closeAfter,focusedAction:active?.getAttribute('data-gnw-search')||'',
      scrollBefore,scrollAfter:body.scrollTop,opened:expanded.length?
        !![...body.querySelectorAll('details')][0]?.open:null};
   });
   assert.match(state.header,/§11/,'Word Context attributed visible §11 to URL §10');
   assert(state.updated,'Morphology refresh did not occur; focus test inconclusive');
   assert(state.focusBefore,'Could not focus in-card Word Context action');
   assert(state.closeStable,'Async lexical refresh replaced the focused modal header');
   assert.equal(state.focusedAction,'literal','Async lexical refresh lost keyboard focus');
   if(state.opened!==null)assert(state.opened,'Async lexical refresh collapsed reader-opened detail');
   assert.deepEqual(errors,[],'Unhandled Word Context errors');
   results.push({engine,case:'continuous-word-context',ok:true,details:state});
   console.log('PASS '+engine+' §11 source despite stale §10 hash; modal focus/header/details retained');
  }finally{await page.close();}
 }finally{await ctx.close();}
}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const origin='http://127.0.0.1:'+server.address().port;
  for(const [engine,api] of [['chromium',chromium],['webkit',webkit]]){
   const browser=await api.launch({headless:true,...(engine==='chromium'?{args:['--no-sandbox']}:{})});
   try{await run(browser,engine,origin);}
   catch(e){const reason=String(e.stack||e).slice(0,2500);failures.push({engine,reason});console.error('FAIL '+engine+' '+reason);}
   finally{await browser.close();}
  }
 }finally{
  server.close();
  const dest=path.join(__dirname,'audit-lifecycle-results');
  fs.mkdirSync(dest,{recursive:true});
  fs.writeFileSync(path.join(dest,'report.json'),JSON.stringify({results,failures},null,2));
  console.log('LIFECYCLE SUMMARY '+JSON.stringify({passed:results.length,failed:failures.length,failures}));
 }
 if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e.stack||e);server.close();process.exitCode=1;});
