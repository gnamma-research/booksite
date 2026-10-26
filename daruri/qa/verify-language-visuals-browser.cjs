'use strict';
/* Daruri AR/EN responsiveness and Visuals appearance regression.
   Browser fixtures run locally; reader preferences remain in the browser. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json',
 '.woff2':'font/woff2','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{
 const raw=decodeURIComponent((req.url||'/').split('?')[0]);
 const local=path.resolve(ROOT,'.'+raw);
 if(!local.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(local)&&fs.statSync(local).isDirectory()?
  path.join(local,'index.html'):local;
 if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'content-type':TYPES[path.extname(file)]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});

async function exercise(engine,label,origin,width){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 const context=await browser.newContext({
  viewport:{width,height:844},isMobile:width<600,hasTouch:width<600,
  reducedMotion:'no-preference'
 });
 await context.addInitScript(()=>{
  localStorage.setItem('daruri-reader-v2',JSON.stringify({
   n:'11',lang:'parallel',vowels:false,focusMode:false,focusLevel:0,
   showHeader:true,showNotes:true,showTerms:true,theme:'system'
  }));
 });
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto(origin+'/daruri/index.html#section=11',
    {waitUntil:'domcontentloaded',timeout:90000});
  await page.locator('#reader .passage-grid').first().waitFor({state:'attached',timeout:40000});
  await page.locator('body.reader-enhanced').waitFor({state:'attached',timeout:30000});

  // Appearance is a visible, keyboard-operable Visuals setting, not another
  // top-toolbar control. The palette is unaffected by changing light/dark.
  assert.equal(await page.locator('#themeBtn:visible').count(),0,
    'The obsolete toolbar appearance button is still visible');
  await page.locator('#settingsBtn').click();
  await page.locator('#settingsOverlay:not([hidden]) #settingsTheme').waitFor({state:'visible'});
  assert.equal(await page.locator('#settingsTheme [data-theme-choice]').count(),3);
  assert.equal(await page.locator('.gn-appearance-row .gn-appearance-label').innerText(),'Appearance');
  const palette=await page.locator('html').getAttribute('data-palette');
  for(const mode of ['dark','light','system']){
   await page.locator('#settingsTheme [data-theme-choice="'+mode+'"]').click();
   assert.equal(await page.locator('#settingsTheme [data-theme-choice="'+mode+'"]').getAttribute('aria-pressed'),'true');
   const stored=JSON.parse(await page.evaluate(()=>localStorage.getItem('daruri-reader-v2')));
   assert.equal(stored.theme,mode,label+': appearance was not saved');
   assert.equal(await page.locator('html').getAttribute('data-palette'),palette,
     label+': appearance changed the separately selected palette');
  }
  await page.locator('#settingsClose').click();
  await page.locator('#settingsOverlay').waitFor({state:'hidden'});

  const observations=[];
  for(const mode of ['reading','focus','continuous']){
   await page.evaluate(mode=>window.GnammaReaderModes.setMode(mode),mode);
   await page.waitForFunction(mode=>window.GnammaReaderModes.currentMode()===mode,mode);
   if(mode==='continuous'){
    await page.waitForFunction(()=>document.querySelectorAll('#reader .gn-continuous-section').length===259);
   }
   const measured=await page.evaluate(()=>{
    const capsule=document.querySelector('#persistentLanguages');
    const ar=capsule.querySelector('[data-language-toggle="arabic"]');
    const en=capsule.querySelector('[data-language-toggle="english"]');
    const grid=document.querySelector('#reader .passage-grid');
    const arNode=grid.querySelector('.passage-ar');
    const enNode=grid.querySelector('.passage-en');
    const original={ar:arNode.innerHTML,en:enNode.innerHTML};
    const before=performance.now();
    en.click(); // parallel -> Arabic only
    const enOff=(en.getAttribute('aria-pressed')==='false'&&!en.classList.contains('active')
      &&document.querySelector('#reader').classList.contains('mode-arabic'));
    const unchanged=arNode.innerHTML===original.ar&&enNode.innerHTML===original.en;
    const sameEn=capsule.querySelector('[data-language-toggle="english"]')===en;
    const offColour=getComputedStyle(en).backgroundColor;
    const activeColour=getComputedStyle(ar).backgroundColor;
    const transition=getComputedStyle(ar).transitionDuration;
    const elapsed=performance.now()-before;
    en.click(); // Arabic only -> parallel
    const restored=(en.getAttribute('aria-pressed')==='true'&&en.classList.contains('active')
      &&document.querySelector('#reader').classList.contains('mode-parallel'));
    ar.click(); // plain -> vowelled
    const vowelled=ar.dataset.arabicState==='vowelled'&&ar.classList.contains('active');
    ar.click(); // vowelled -> English-only
    const hidden=ar.dataset.arabicState==='off'&&ar.getAttribute('aria-pressed')==='false';
    ar.click(); // English-only -> parallel plain
    const plain=ar.dataset.arabicState==='plain'&&ar.getAttribute('aria-pressed')==='true';
    return {enOff,unchanged,sameEn,restored,vowelled,hidden,plain,
      colourDiffers:offColour!==activeColour,transition,elapsed};
   });
   observations.push({mode,...measured});
   for(const [key,value] of Object.entries(measured)){
    if(['enOff','unchanged','sameEn','restored','vowelled','hidden','plain','colourDiffers'].includes(key))
      assert.equal(value,true,label+' '+mode+': '+key+' failed '+JSON.stringify(measured));
   }
   assert.equal(measured.transition,'0s',label+' '+mode+': language-button colours still animate');
   assert.ok(measured.elapsed<650,label+' '+mode+': simple English toggle blocks for '+measured.elapsed.toFixed(0)+' ms');

   if(mode==='continuous'){
    // Continuous section navigation used to replace language buttons, which
    // reset their transitions and lost the pressed state during scrolling.
    const scrolled=await page.evaluate(async()=>{
      const en=document.querySelector('#persistentLanguages [data-language-toggle="english"]');
      document.getElementById('gn-continuous-80').scrollIntoView({block:'start',behavior:'instant'});
      dispatchEvent(new Event('scroll'));
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      return {stable:en===document.querySelector('#persistentLanguages [data-language-toggle="english"]'),
        pressed:en.getAttribute('aria-pressed'),classActive:en.classList.contains('active')};
    });
    assert(scrolled.stable&&scrolled.pressed==='true'&&scrolled.classActive,
      label+': scrolling Continuous replaced/invalidated a language button: '+JSON.stringify(scrolled));
    const amended=await page.evaluate(()=>{
      const ar=document.querySelector('#persistentLanguages [data-language-toggle="arabic"]');
      ar.click(); // plain -> vowelled (deferred book text)
      return {active:ar.classList.contains('active'),marked:ar.dataset.arabicState==='vowelled',
        same:ar===document.querySelector('#persistentLanguages [data-language-toggle="arabic"]')};
    });
    assert(amended.active&&amended.marked&&amended.same,
      label+': Continuous vowel state did not update immediately');
    await page.waitForFunction(()=>{
      const node=document.querySelector('#gn-continuous-80 .passage-ar[data-ar-seg="0"]');
      return node&&/[\u064b-\u065f]/.test(node.textContent);
    },null,{timeout:15000});
   }
  }
  assert(!errors.some(x=>/forEach is not a function|GnammaReaderModes|applyReadingState|syncLanguageButtons/i.test(x)),
    label+': runtime errors '+JSON.stringify(errors));
  console.log('PASS '+label+': immediate AR/EN colours, retained nodes, Continuous vowel redraw, Appearance in Visuals; '
    +JSON.stringify(observations.map(x=>({mode:x.mode,elapsedMs:Math.round(x.elapsed)}))));
 }finally{await context.close();await browser.close();}
}
server.listen(0,'127.0.0.1',async()=>{
 const origin='http://127.0.0.1:'+server.address().port;
 try{
  await exercise(chromium,'Chromium desktop',origin,1280);
  await exercise(webkit,'WebKit iPhone',origin,390);
 }catch(error){
  console.error(error.stack||error);process.exitCode=1;
 }finally{server.close();}
});
