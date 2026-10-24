'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..'),MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.ttf':'font/ttf','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname),p=path.resolve(ROOT,'.'+name);
 if(!p.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(p)&&fs.statSync(p).isDirectory()?path.join(p,'index.html'):p;
 if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',MIME[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
const errors=[];
async function test(engine,name,origin,width){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
 const ctx=await browser.newContext({viewport:{width,height:844},isMobile:width<700,hasTouch:width<700,serviceWorkers:'block'});
 await ctx.addInitScript(()=>localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'11',lang:'arabic',focusLevel:0,vowels:true})));
 try{
  const page=await ctx.newPage();page.setDefaultTimeout(10000);
  await page.goto(origin+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#readerDock:not([hidden])').waitFor({timeout:25000});
  let text=page.locator('#reader .passage-grid .passage-ar:visible').first();
  if(!(await text.count())){
    const arabic=page.locator('#persistentLanguages [data-language-toggle="arabic"]');
    if(await arabic.isVisible())await arabic.click();
  }
  text=page.locator('#reader .passage-grid .passage-ar:visible').first();
  await text.waitFor();
  await text.click({position:{x:35,y:25}});
  assert.equal(await page.locator('#gnamma-word-context:visible').count(),0,'ordinary tap opened Word Context');
  await page.evaluate(()=>{
   const node=[...document.querySelectorAll('#reader .passage-grid .passage-ar')].find(el=>el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden');
   const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
   let textNode;
   while((textNode=walker.nextNode())){if(/[\u0621-\u064a]{3}/.test(textNode.textContent))break;}
   if(!textNode)throw Error('Arabic text missing');
   const m=textNode.textContent.match(/[\u0621-\u064a][\u0621-\u065f]*/);
   if(!m)throw Error('Arabic word missing');
   const range=document.createRange();range.setStart(textNode,m.index);range.setEnd(textNode,m.index+m[0].length);
   const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);
   document.dispatchEvent(new Event('selectionchange'));
   window.dispatchEvent(new Event('mouseup'));
  });
  const bar=page.locator('#gn-rd-selection-bar');
  await bar.waitFor({state:'visible',timeout:12000}).catch(async()=>{throw Error('Selection bar absent: '+JSON.stringify(await page.evaluate(()=>({selection:window.getSelection()?.toString(),bar:document.querySelector('#gn-rd-selection-bar')?.outerHTML?.slice(0,450),reader:document.body.className,desk:!!window.GnammaReadingDesk,word:!!window.GnammaWordContext}))));});
  const action=bar.locator('[data-rd="selection-word-context"]');
  await action.waitFor({state:'visible'});
  assert.equal(await page.locator('#gnamma-word-context:visible').count(),0,'selection alone opened Word Context');
  await action.click();
  await page.locator('#gnamma-word-context:visible').waitFor();
  await page.keyboard.press('Escape');
  await page.locator('#gnamma-word-context:visible').waitFor({state:'hidden'});
  console.log('PASS '+name+' '+width+' plain tap inert, selection menu icon opens/closes Word Context');
 }catch(e){errors.push({engine:name,width,message:String(e.stack||e).slice(0,1500)});console.log('FAIL '+name+' '+width+' '+e);}
 finally{await ctx.close();await browser.close();}
}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
try{for(const [name,b] of [['chromium',chromium],['webkit',webkit]])for(const width of [320,390,768])await test(b,name,url,width);}
finally{server.close();console.log('SELECTION SUMMARY '+JSON.stringify(errors));}
if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
