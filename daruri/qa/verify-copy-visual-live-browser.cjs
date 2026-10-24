'use strict';
/* Browser evidence for live Copy scope and compact Visuals appearance.
   Localhost only; all selections are synthetic, never personal data. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const root=path.resolve(__dirname,'../..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.woff2':'font/woff2','.ttf':'font/ttf','.svg':'image/svg+xml'};
const reports=[],failures=[];
const server=http.createServer((req,res)=>{
 let p;try{p=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch(_){res.writeHead(400);res.end();return;}
 const real=path.resolve(root,'.'+p);
 if(!real.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(real)&&fs.statSync(real).isDirectory()?path.join(real,'index.html'):real;
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
async function exercise(browser,engine,origin,width){
 const ctx=await browser.newContext({viewport:{width,height:844},isMobile:width<=768,hasTouch:width<=768,serviceWorkers:'block',reducedMotion:'reduce'});
 await ctx.addInitScript(()=>localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'11',lang:'english',focusLevel:0,vowels:false})));
 const page=await ctx.newPage(),id=engine+'-'+width;page.setDefaultTimeout(14000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(origin+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#readerDock:not([hidden])').waitFor();
  // Open the *options*, not the quick-copy action.
  await page.locator('#readerCopyOptions').click();
  const menu=page.locator('#gn-copy-menu:not([hidden])');await menu.waitFor();
  const head=menu.locator('.gn-copy-menu-head small');
  await page.waitForFunction(()=>document.querySelector('#gn-copy-menu:not([hidden]) .gn-copy-menu-head small')?.textContent?.includes('¶1'));
  const before=await head.textContent();
  await page.locator('#reader .passage-grid[data-segment="1"]').first().evaluate(el=>{
   el.scrollIntoView({block:'start',behavior:'instant'});
   window.scrollBy({top:-70,behavior:'instant'});
   window.dispatchEvent(new Event('scroll'));
  });
  await page.waitForFunction(()=>document.querySelector('#gn-copy-menu:not([hidden]) .gn-copy-menu-head small')?.textContent?.includes('¶2'),null,{timeout:12000});
  const after=await head.textContent();
  assert.notEqual(before,after,'Unselected menu heading must follow scroll');
  await menu.locator('[data-gn-menu="text"]').click();
  const sheet=page.locator('.gn-copy-sheet');
  await sheet.waitFor();
  assert(await sheet.locator('input[name="scope"][value="paragraph"]').isChecked(),'Menu chose stale section-wide scope rather than visible paragraph');
  assert.equal(await sheet.locator('select[name="start"]').inputValue(),'1','Menu copied stale paragraph despite new heading');
  await sheet.locator('[data-gn-copy-close]').first().click();
  // Freeze a real text selection from paragraph 1; do NOT follow scroll.
  await page.locator('#reader .passage-grid[data-segment="0"]').first().evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
  await page.evaluate(()=>{
   const root=document.querySelector('#reader .passage-grid[data-segment="0"] .passage-en');
   const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
   let node;while((node=walker.nextNode())&&node.textContent.trim().length<9){}
   if(!node)throw Error('No English text node to select');
   const match=node.textContent.match(/[A-Za-z]{5,}/);
   if(!match)throw Error('No English word to select');
   const range=document.createRange();range.setStart(node,match.index);range.setEnd(node,match.index+match[0].length);
   const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);document.dispatchEvent(new Event('selectionchange'));
  });
  await page.locator('#readerCopyOptions').click();
  await menu.waitFor();
  await page.waitForFunction(()=>!!document.querySelector('#gn-copy-menu [data-gn-menu="selected"]'));
  const frozen=await head.textContent();
  await page.locator('#reader .passage-grid[data-segment="1"]').first().evaluate(el=>{
   el.scrollIntoView({block:'start',behavior:'instant'});
   window.scrollBy({top:-70,behavior:'instant'});
   window.dispatchEvent(new Event('scroll'));
  });
  await page.waitForTimeout(450);
  assert.equal(await head.textContent(),frozen,'Selected words changed paragraph when reader scrolled');
  await menu.locator('[data-gn-menu="selected"]').click();
  await sheet.waitFor();
  assert(await sheet.locator('input[name="scope"][value="selected"]').isChecked(),'Selection should retain exact selected scope');
  await sheet.locator('[data-gn-copy-close]').first().click();
  await page.locator('#settingsBtn').click();
  const visual=page.locator('#settingsOverlay:not([hidden])');
  await visual.waitFor();
  const appearance=visual.locator('#gn-visuals-appearance');
  await appearance.waitFor({state:'visible'});
  const choices=await appearance.locator('button').evaluateAll(nodes=>nodes.map(n=>({text:n.textContent.trim(),aria:n.getAttribute('aria-label')||'',pressed:n.getAttribute('aria-pressed')})));
  assert(choices.length>=1,'Visuals has no accessible appearance action');
  assert((await appearance.textContent()).trim()||choices.some(x=>x.aria),'Appearance must be discoverable without adding a topbar icon');
  assert.equal(errors.length,0,'Runtime errors: '+errors.join(';'));
  const result={id,before,after,frozen,appearance:choices};reports.push(result);console.log('PASS '+JSON.stringify(result));
 }catch(e){const d={id,error:String(e.stack||e).slice(0,1900)};failures.push(d);console.error('FAIL '+JSON.stringify(d));}
 finally{await ctx.close();}
}
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 try{for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
  const b=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
  try{for(const width of [320,390,768,1280])await exercise(b,name,'http://127.0.0.1:'+server.address().port,width)}
  finally{await b.close()}
 }}finally{
  server.close();const folder=path.join(__dirname,'copy-visual-artifacts');
  fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(path.join(folder,'report.json'),JSON.stringify({reports,failures},null,2));
  console.log('COPY-VISUAL-SUMMARY '+JSON.stringify({passed:reports.length,failed:failures.length}));
 }
 if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exitCode=1;server.close()});
