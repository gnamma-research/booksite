#!/usr/bin/env node
'use strict';
/* True-browser geometry check for the single-row Scholar's Compact toolbar.
   Tests the real Daruri reader in Chromium and mobile WebKit at 320/375/390px.
   It does not modify source text, notes or stored reader data. */
const assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path'), http=require('node:http');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const SHOTS=process.env.DARURI_TOOLBAR_SHOTS||path.join(__dirname,'toolbar-screenshots');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=http.createServer((request,response)=>{
 const name=decodeURIComponent((request.url||'/').split('?')[0]);
 const target=path.resolve(ROOT,'.'+name);
 if(!target.startsWith(ROOT+path.sep)){response.writeHead(403).end();return;}
 const file=fs.existsSync(target)&&fs.statSync(target).isDirectory()?path.join(target,'index.html'):target;
 if(!fs.existsSync(file)){response.writeHead(404).end();return;}
 response.writeHead(200,{'content-type':MIME[path.extname(file)]||'application/octet-stream'});
 fs.createReadStream(file).pipe(response);
});
const ids=['menuBtn','focusToolbar','readerSaveAction','readerCopyAction','readerShareAction','searchBtn','settingsBtn'];
async function verify(engine,name,base,width){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
 try{
  const context=await browser.newContext({viewport:{width,height:844},isMobile:width<=620,hasTouch:width<=620,reducedMotion:'reduce'});
  const page=await context.newPage();
  const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
  await page.goto(base+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:90000});
  await page.locator('body.reader-enhanced #readingControls:not([hidden])').waitFor({timeout:35000});
  await page.locator('#readerShareAction').waitFor({state:'visible',timeout:20000});
  const data=await page.evaluate(ids=>{
   const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,cy:(r.top+r.bottom)/2}};
   const bar=document.getElementById('readingControls');
   const inner=bar.querySelector('.reading-controls-inner');
   const elements=Object.fromEntries(ids.map(id=>{
    const el=document.getElementById(id);return [id,{...rect(el),visible:!!(el.offsetWidth&&el.offsetHeight),hidden:el.hidden,display:getComputedStyle(el).display,aria:el.getAttribute('aria-label')}];
   }));
   const ar=document.querySelector('#persistentLanguages [data-language-toggle="arabic"]');
   const en=document.querySelector('#persistentLanguages [data-language-toggle="english"]');
   const blocks=[...ids.map(id=>elements[id]),rect(ar),rect(en)];
   return {
    width:inner.clientWidth,
    windowWidth:inner.ownerDocument.documentElement.clientWidth,
    toolbar:rect(bar),inner:rect(inner),
    computedDisplay:getComputedStyle(inner).display,
    readButton:!!document.getElementById('gnTopRead'),
    helpButton:!!document.getElementById('gnTopHelp'),
    sidebarHelp:!!document.querySelector('#leftNav .primary-nav [data-route="help"]'),
    title:document.querySelector('#leftNav .gn-sidebar-book-title cite')?.textContent.trim(),
    focusParent:document.getElementById('focusToolbar').parentElement?.className,
    language:[rect(ar),rect(en)],
    elements,blocks,
    tileBackground:getComputedStyle(document.getElementById('menuBtn')).backgroundImage.slice(0,35)
   };
  },ids);
  const label=name+' '+width+'px';
  assert.equal(data.computedDisplay,'flex',label+' toolbar is not one flex row');
  assert.ok(data.toolbar.height<=60,label+' toolbar taller than 60px: '+JSON.stringify(data));
  assert.ok(data.inner.height<=60,label+' controls still occupy multiple rows: '+JSON.stringify(data));
  assert.ok(data.blocks.every(r=>Math.abs(r.cy-data.blocks[0].cy)<=7),label+' controls not vertically aligned: '+JSON.stringify(data.blocks));
  assert.ok(data.blocks.every(r=>r.left>=-1&&r.right<=width+1),label+' controls clipped/overflow: '+JSON.stringify(data.blocks));
  assert.ok(ids.every(id=>data.elements[id].visible),label+' an essential tool is hidden: '+JSON.stringify(data.elements));
  assert.ok(data.elements.menuBtn.width>=40,label+' medallion touch width too small');
  assert.ok(data.blocks.every(r=>r.height>=40),label+' buttons have insufficient vertical touch height');
  assert.equal(data.readButton,false,label+' redundant Read button');
  assert.equal(data.helpButton,false,label+' redundant Help button');
  assert.equal(data.sidebarHelp,true,label+' Help missing from Contents');
  assert.equal(data.title,'الضروري',label+' incorrect Contents title');
  assert.ok(data.focusParent.includes('reader-language-and-actions'),label+' Focus not alongside languages');
  assert.ok(data.tileBackground.includes('data:image/png'),label+' approved circular medallion is missing');
  fs.mkdirSync(SHOTS,{recursive:true});
  await page.screenshot({path:path.join(SHOTS,name+'-'+width+'.png'),fullPage:false});
  if(width<=620){
   await page.locator('#focusToolbar').click();
   assert.equal(await page.locator('#focusToolbar').getAttribute('aria-pressed'),'true',label+' Focus click failed');
   await page.locator('#focusToolbar').click();
   assert.equal(await page.locator('#focusToolbar').getAttribute('aria-pressed'),'false',label+' return from Focus failed');
   await page.locator('#menuBtn').click();
   assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'true',label+' tile did not open Contents');
   assert.equal((await page.locator('#leftNav .gn-sidebar-book-title cite').innerText()).trim(),'الضروري',label+' pane heading changed');
  }
  assert.deepEqual(pageErrors,[],label+' unexpected script errors');
  console.log('PASS '+label+' Scholar Compact row, seven icon actions, AR/EN, Share, Focus, Contents');
  await context.close();
 }finally{await browser.close();}
}
server.listen(0,'127.0.0.1',async()=>{
 const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const [engine,name] of [[chromium,'chromium'],[webkit,'webkit']]){
   for(const width of [320,375,390,768,1280])await verify(engine,name,base,width);
  }
  console.log('PASS true-browser toolbar geometry / interaction on both engines');
 }catch(error){console.error(error);process.exitCode=1;}finally{server.close();}
});
