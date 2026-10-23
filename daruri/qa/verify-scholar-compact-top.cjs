#!/usr/bin/env node
'use strict';
/* Scholar Compact top-row regression: real reader, narrow iPhones and desktop,
 * Chromium + WebKit, no external service and no personal reading data. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const requested=decodeURIComponent((req.url||'/').split('?')[0]);
 const file=path.resolve(ROOT,'.'+requested);
 if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return}
 const resolved=fs.existsSync(file)&&fs.statSync(file).isDirectory()?path.join(file,'index.html'):file;
 if(!fs.existsSync(resolved)){res.writeHead(404).end();return}
 res.writeHead(200,{'content-type':MIME[path.extname(resolved)]||'application/octet-stream'});
 fs.createReadStream(resolved).pipe(res);
});
async function exercise(engine,name,host){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
 try{
  for(const width of [320,375,390,1280]){
   const mobile=width!==1280;
   const context=await browser.newContext({viewport:{width,height:mobile?812:800},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
   await context.addInitScript(()=>localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'11',lang:'parallel',vowels:true,showHeader:true})));
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   try{
    await page.goto(host+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForSelector('body.reader-enhanced.reading-active #readerDock:not([hidden])',{timeout:25000});
    await page.waitForFunction(()=>document.querySelectorAll('#persistentLanguages [data-language-toggle]').length===2&&!!document.getElementById('gnNavShare'),null,{timeout:15000});
    const diagnostics=await page.evaluate(()=>{
     const names=['#menuBtn','#persistentLanguages [data-language-toggle="arabic"]','#persistentLanguages [data-language-toggle="english"]','#readerSaveAction','#readerCopyAction','#focusToolbar','#searchBtn','#settingsBtn'];
     const entries=names.map(sel=>{
       const el=document.querySelector(sel);
       const rect=el?.getBoundingClientRect();
       const style=el?getComputedStyle(el):null;
       return {sel,x:rect?.x,y:rect?.y,right:rect?.right,bottom:rect?.bottom,w:rect?.width,h:rect?.height,
           visible:!!el&&!!rect&&rect.width>0&&rect.height>0&&style.display!=='none'&&style.visibility!=='hidden'};
     });
     const bar=document.querySelector('#readingControls')?.getBoundingClientRect();
     const hiddenIds=['gnTopRead','themeBtn','readerShareAction'];
     const topHidden=Object.fromEntries(hiddenIds.map(id=>{
       const el=document.getElementById(id);
       return [id,!el||getComputedStyle(el).display==='none'];
     }));
     return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bar:{x:bar?.x,y:bar?.y,h:bar?.height,w:bar?.width},
       entries,topHidden,helpTop:!!document.querySelector('#gnTopHelp'),paneArabic:document.querySelector('#leftNav .gn-sidebar-book-title cite')?.textContent,
       hasSidebarHelp:!!document.querySelector('#leftNav [data-route="help"]'),
       hasSidebarShare:!!document.getElementById('gnNavShare')};
    });
    assert.equal(diagnostics.paneArabic,'الضروري',name+' work title '+width);
    assert.equal(diagnostics.helpTop,false,name+' unexpected extra top Help '+width);
    assert.equal(diagnostics.hasSidebarHelp,true,name+' missing Contents Help '+width);
    assert.equal(diagnostics.hasSidebarShare,true,name+' missing Contents Share '+width);
    assert.equal(diagnostics.topHidden.gnTopRead,true,name+' redundant Read still visible '+width);
    assert.equal(diagnostics.topHidden.themeBtn,true,name+' Theme still duplicates Visuals '+width);
    assert.ok(diagnostics.entries.every(x=>x.visible),name+' missing top action '+width+': '+JSON.stringify(diagnostics));
    if(mobile){
     assert.ok(diagnostics.bar.h<=58,name+' mobile toolbar has extra row '+width+': '+JSON.stringify(diagnostics));
     assert.equal(diagnostics.topHidden.readerShareAction,true,name+' Share still takes mobile top-row space '+width);
     assert.ok(diagnostics.scrollWidth<=width+2,name+' horizontal document overflow '+width+': '+JSON.stringify(diagnostics));
     const controls=diagnostics.entries;
     const minTop=Math.min(...controls.map(e=>e.y)),maxTop=Math.max(...controls.map(e=>e.y));
     assert.ok(maxTop-minTop<=6,name+' controls wrapped on '+width+': '+JSON.stringify(diagnostics));
     for(let i=0;i<controls.length-1;i++){
      assert.ok(controls[i].right<=controls[i+1].x+2,
         name+' controls overlap '+width+': '+JSON.stringify(diagnostics));
     }
     assert.ok(controls.every(x=>x.x>=-1&&x.right<=width+1),name+' top action clipped '+width+': '+JSON.stringify(diagnostics));
    }
    await page.locator('#focusToolbar').click();
    await page.locator('#gn-reading-mode-picker:not([hidden])').waitFor({state:'visible'});
    for(const key of ['reading','focus','continuous'])
      assert.equal(await page.locator('#gn-reading-mode-picker [data-gn-reader-mode="'+key+'"]').count(),1,
        name+' missing mode '+key+' '+width);
    await page.keyboard.press('Escape');
    await page.locator('#settingsBtn').click();
    await page.locator('#settingsOverlay:not([hidden])').waitFor({state:'visible',timeout:9000});
    await page.keyboard.press('Escape');
    if(mobile){
     await page.locator('#menuBtn').click();
     await page.locator('#leftNav #gnNavShare').waitFor({state:'visible',timeout:8000});
     await page.locator('#leftNav #gnNavShare').click();
     await page.locator('#shareOverlay:not([hidden])').waitFor({state:'visible',timeout:9000});
     await page.keyboard.press('Escape');
    }
    assert.equal(errors.filter(e=>/SyntaxError|gnNavShare|GnammaReadingModes/i.test(e)).length,0,
      name+' runtime error '+width+': '+errors.join('; '));
    console.log('PASS '+name+' Scholar Compact '+width+'px: one row, all main actions, Focus, Visuals, Contents share');
   }finally{await context.close()}
  }
 }finally{await browser.close()}
}

async function checkResizeWithSavedData(engine,name,host){
 const savedItems=[
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
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await context.addInitScript(({items})=>{
  localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'11',lang:'english',focusLevel:0}));
  localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify({format:'gnamma-reading-desk',version:1,items}));
 },{items:savedItems});
 try{
  const page=await context.newPage();
  await page.goto(host+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:90000});
  await page.locator('#gn-dock-private-status .gn-dock-summary').waitFor({state:'visible',timeout:25000});
  await page.setViewportSize({width:320,height:844});
  await page.waitForTimeout(150);
  const data=await page.evaluate(()=>{
   const overflow=[];
   for(const el of document.querySelectorAll('body *')){
    const st=getComputedStyle(el),r=el.getBoundingClientRect();
    if(st.display==='none'||st.visibility==='hidden'||r.width<=0||r.height<=0)continue;
    if(r.left>=0&&r.left<innerWidth&&r.right>innerWidth+2){
     overflow.push({tag:el.tagName,id:el.id,className:String(el.className).slice(0,90),
      left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),
      minWidth:st.minWidth,position:st.position,overflowX:st.overflowX});
    }
   }
   overflow.sort((a,b)=>b.right-a.right);
   return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,
    bodyWidth:document.body.scrollWidth,overflow:overflow.slice(0,24)};
  });
  console.log('RESIZE-DIAGNOSTIC '+name+': '+JSON.stringify(data));
  assert.ok(data.documentWidth<=322,name+' 390->320 resize overflow: '+JSON.stringify(data));
 }finally{await context.close();await browser.close()}
}

server.listen(0,'127.0.0.1',async()=>{
 const host='http://127.0.0.1:'+server.address().port;
 try{await exercise(chromium,'chromium',host);await exercise(webkit,'webkit',host);await checkResizeWithSavedData(chromium,'chromium',host);await checkResizeWithSavedData(webkit,'webkit',host)}
 catch(e){console.error(e.stack);process.exitCode=1}
 finally{server.close()}
});
