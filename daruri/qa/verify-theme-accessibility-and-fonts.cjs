'use strict';
/* Reproducible local palette/appearance/WCAG and missing Arabic-font checks. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(__dirname,'audit-artifacts');
fs.mkdirSync(OUT,{recursive:true});
const TYPES={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname)}catch(_){res.writeHead(400);res.end();return;}
 const local=path.resolve(ROOT,'.'+pathname);
 if(!local.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(local)&&fs.statSync(local).isDirectory()?path.join(local,'index.html'):local;
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':TYPES[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
 fs.createReadStream(file).pipe(res);
});
const samples=[],failures=[];
const palettes=['almohad','cordoba','nasrid','zellij','gnamma','gnamma-air'];
const themes=['light','dark','system'];
async function exercise(engine,name,url){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
 await ctx.addInitScript(()=>localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'11',lang:'parallel',vowels:true,focusLevel:0})));
 try{
  const page=await ctx.newPage();page.setDefaultTimeout(13000);
  await page.goto(url+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#readerDock:not([hidden])').waitFor();
  await page.locator('#settingsBtn').click();await page.locator('#settingsOverlay:not([hidden])').waitFor();
  for(const theme of themes){
   for(const palette of palettes){
    const id=name+'-'+theme+'-'+palette;
    try{
     const tb=page.locator('#gn-visuals-appearance [data-theme-choice="'+theme+'"]');
     await tb.click();
     const pb=page.locator('#settingsOverlay [data-palette="'+palette+'"]').first();
     await pb.click();
     assert.equal(await tb.getAttribute('aria-pressed'),'true',id+' theme selection lost');
     assert.equal(await pb.getAttribute('aria-pressed'),'true',id+' palette selection lost');
     const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
     const issues=report.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length,examples:v.nodes.slice(0,4).map(x=>({target:x.target,summary:x.failureSummary?.slice(0,260)}))}));
     samples.push({engine:name,theme,palette,issues});
     if(issues.length)throw Error('WCAG '+JSON.stringify(issues).slice(0,1100));
     console.log('PASS theme-accessibility '+id);
    }catch(error){failures.push({id,reason:String(error.message||error).slice(0,1500)});console.error('FAIL theme-accessibility '+id+' '+error);}
   }
  }
  // A real omitted font must leave readable Arabic, not an English-only screenshot.
  await page.locator('#settingsClose').click();
  await page.locator('#settingsOverlay:not([hidden])').waitFor({state:'hidden'});
 }finally{await ctx.close();await browser.close();}
}
async function fallbackFonts(engine,name,url,locale,width){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
 const ctx=await browser.newContext({viewport:{width,height:844},isMobile:width<700,hasTouch:width<700,locale,serviceWorkers:'block',reducedMotion:'reduce'});
 await ctx.addInitScript(()=>localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'11',lang:'parallel',vowels:true,focusLevel:0})));
 await ctx.route(/\.(?:woff2?|ttf|otf)(?:\?|$)/i,r=>r.abort());
 const id=name+'-'+locale+'-'+width;
 try{
  const page=await ctx.newPage();
  await page.goto(url+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#readerDock:not([hidden])').waitFor();
  const state=await page.evaluate(()=>{
   const ar=document.querySelector('#reader .passage-ar');
   const en=document.querySelector('#reader .passage-en');
   const rect=ar?.getBoundingClientRect();
   return {arabic:ar?.innerText||'',englishLength:en?.innerText?.length||0,arabicDir:ar?.dir,arabicLang:ar?.lang,rectHeight:rect?.height||0,screenWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth};
  });
  assert(state.arabic.length>150&&/[\u0600-\u06ff]/.test(state.arabic),'Arabic text missing without downloadable fonts');
  assert(state.rectHeight>70&&state.arabicDir==='rtl'&&state.arabicLang==='ar','Arabic fallback not geometrically readable');
  assert(state.englishLength>150,'English parallel content vanished');
  assert(state.scrollWidth<=state.screenWidth+2,'Unexpected horizontal overflow');
  samples.push({engine:name,locale,width,fontsBlocked:true,arabicLength:state.arabic.length,englishLength:state.englishLength});
  console.log('PASS blocked-fonts '+id+' Arabic and English readable');
  await page.screenshot({path:path.join(OUT,'no-fonts-'+id+'.png'),fullPage:false});
 }catch(error){failures.push({id,reason:String(error.stack||error).slice(0,1500)});console.error('FAIL fonts '+id+' '+error);}
 finally{await ctx.close();await browser.close();}
}
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const origin='http://127.0.0.1:'+server.address().port;
 try{
  for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
   await exercise(engine,name,origin);
   for(const locale of ['ar-SA','en-GB'])for(const width of [320,390,768])await fallbackFonts(engine,name,origin,locale,width);
  }
 }finally{
  server.close();
  fs.writeFileSync(path.join(OUT,'theme-font-audit.json'),JSON.stringify({testedCommit:process.env.GITHUB_SHA||'local',samples,failures},null,2));
  console.log('THEME-FONT-SUMMARY '+JSON.stringify({themeScans:samples.filter(x=>x.theme).length,fonts:samples.filter(x=>x.fontsBlocked).length,failures:failures.length,first:failures.slice(0,5)}));
 }
 if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;server.close()});
