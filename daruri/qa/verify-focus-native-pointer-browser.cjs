'use strict';
/* Comparative real coordinate-touch regression for WebKit Contents scroll jump.
   Never changes reader data or makes requests outside localhost. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(__dirname,'focus-native-pointer-artifacts');fs.mkdirSync(OUT,{recursive:true});
const TYPES={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch(_){res.writeHead(400);res.end();return;}
 const local=path.resolve(ROOT,'.'+pathname);
 if(!local.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(local)&&fs.statSync(local).isDirectory()?path.join(local,'index.html'):local;
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':TYPES[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
 fs.createReadStream(file).pipe(res);
});
const records=[],bad=[];
async function exercise(engine,name,base,w,mode){
 const context=await engine.newContext({viewport:{width:w,height:w===320?568:844},isMobile:w<=768,hasTouch:w<=768,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(level=>localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'11',lang:'parallel',focusLevel:level,focusApparatus:false})),mode);
 const page=await context.newPage(),errors=[];page.setDefaultTimeout(9000);page.on('pageerror',e=>errors.push(e.message));
 const id=name+'-'+w+'-focus'+mode;
 try{
  await page.goto(base+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#readerDock:not([hidden])').waitFor({timeout:30000});
  const state=await page.evaluate(()=>{
   const root=document.getElementById('readingControls').getBoundingClientRect();
   const keys=['menuBtn','focusToolbar','readerSaveAction','readerCopyAction','readerShareAction','searchBtn','settingsBtn'];
   const all=keys.map(k=>({id:k,el:document.getElementById(k)}));
   document.querySelectorAll('#persistentLanguages>button').forEach((el,i)=>all.push({id:'language-'+i,el}));
   const controls=all.map(({id,el})=>{const r=el?.getBoundingClientRect(),css=el&&getComputedStyle(el);return {id,visible:!!r?.width&&!!r?.height&&css?.display!=='none'&&css?.visibility!=='hidden',x:r?.left||0,right:r?.right||0,top:r?.top||0,bottom:r?.bottom||0,height:r?.height||0,width:r?.width||0};});
   return{viewport:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,bar:{top:root.top,bottom:root.bottom,height:root.height},focus:document.body.classList.contains('focus-mode'),controls};
  });
  assert.equal(state.controls.length,9,'Nine controls expected');
  assert.equal(state.focus,mode>0,'Saved Focus level should be respected');
  assert(state.controls.every(c=>c.visible),'Invisible control: '+JSON.stringify(state));
  assert(state.controls.every(c=>c.x>=-1&&c.right<=state.viewport+1),'Horizontally clipped control: '+JSON.stringify(state));
  assert(state.scrollWidth<=state.viewport+2,'Horizontal page overflow: '+JSON.stringify(state));
  if(w<=620){
   assert(state.bar.height>=44&&state.bar.height<=57,'Not a single compact row: '+JSON.stringify(state));
   assert(state.controls.every(c=>c.top>=state.bar.top-2&&c.bottom<=state.bar.bottom+2),'Not inside compact row: '+JSON.stringify(state));
   const ordered=[...state.controls].sort((a,b)=>a.x-b.x);
   assert(ordered.every((c,i)=>!i||c.x>=ordered[i-1].right-1),'Toolbar controls collide: '+JSON.stringify(state));
  }
  if(w===320&&mode===1)await page.screenshot({path:path.join(OUT,id+'.png'),fullPage:false});
  if(mode>0&&w>768){
   const nav=await page.locator('#leftNav').boundingBox();
   assert(!nav||!nav.width||nav.x+nav.width<=0,'Contents must not overlay desktop Focus text before opening');
  }
  // Exercise a real location within the full continuous document, not its
  // initial DOM starting paragraph. The source section should survive Home.
  if(mode===3){
   const passage=page.locator('#gn-continuous-11 .passage-grid[data-segment="0"]').first();
   await passage.waitFor({state:'visible'});
   await passage.evaluate(el=>{
    window.scrollTo({top:window.scrollY+el.getBoundingClientRect().top-150,behavior:'instant'});
    window.dispatchEvent(new Event('scroll'));
   });
   await page.waitForFunction(()=>document.getElementById('dockSection')?.textContent?.trim()==='§11',null,{timeout:12000});
  }
  const departure=await page.evaluate(()=>({hash:location.hash,dock:document.getElementById('dockSection')?.textContent?.trim(),active:document.body.className,scrollY:window.scrollY}));
  if(mode===3)console.log('BEFORE '+id+' '+JSON.stringify(departure));
  if(mode===3)await page.evaluate(()=>{
    const menu=document.getElementById('menuBtn');
    window.__continuousExitTrace=[];
    for(const type of ['pointerdown','click'])menu.addEventListener(type,()=>{
      window.__continuousExitTrace.push({type,y:scrollY,hash:location.hash,n:window.GnammaCopyContext?.state?.n,dock:document.getElementById('dockSection')?.textContent?.trim(),mode:document.body.className,rect:menu.getBoundingClientRect().top});
    },{capture:true});
  });
  const home=page.locator('#leftNav [data-route="home"]');
  if(mode>0){
   // Unlike locator.click(), coordinate tap/click does not pre-scroll a
   // sticky/fixed toolbar into the viewport before dispatching pointerdown.
   const box=await page.locator('#menuBtn').boundingBox();
   if(!box)throw Error('Contents launcher has no hit rectangle');
   const x=box.x+box.width/2,y=box.y+box.height/2;
   if(w<=768)await page.touchscreen.tap(x,y);
   else await page.mouse.click(x,y);
   if(mode===3)console.log('EXIT TRACE '+id+' '+JSON.stringify(await page.evaluate(()=>({
     sequence:window.__continuousExitTrace,after:{y:scrollY,hash:location.hash,n:window.GnammaCopyContext?.state?.n,dock:document.getElementById('dockSection')?.textContent?.trim(),mode:document.body.className}
   }))));
   await home.waitFor({state:'visible',timeout:3500}).catch(async e=>{const diag=await page.evaluate(()=>({body:document.body.className,hash:location.hash,menu:{expanded:document.getElementById('menuBtn')?.getAttribute('aria-expanded'),rect:document.getElementById('menuBtn')?.getBoundingClientRect().toJSON()},left:{hidden:document.getElementById('leftNav')?.hidden,style:getComputedStyle(document.getElementById('leftNav')).cssText,rect:document.getElementById('leftNav')?.getBoundingClientRect().toJSON()},home:{rect:document.querySelector('#leftNav [data-route="home"]')?.getBoundingClientRect().toJSON()},topHome:{rect:document.getElementById('gnTopHome')?.getBoundingClientRect().toJSON()}}));throw Error('Contents click did not reveal Home: '+JSON.stringify(diag));});
   assert(await home.isVisible(),'Contents navigation destination not visible');
   // Contents must be an ordinary navigation context, not a Focus overlay.
   assert(await home.isVisible(),'Contents must reveal navigable Home in Focus');
  }else if(!(await home.isVisible())){await page.locator('#menuBtn').click();await home.waitFor({state:'visible'});}
  await home.click();
  await page.locator('#mainContent .gnamma-home').waitFor();
  const topRead=page.locator('#gnTopRead');
  assert(await topRead.isVisible(),'No explicit Read/Resume action from Home');
  await topRead.click();
  await page.locator('#readerDock:not([hidden])').waitFor();
  await page.waitForFunction(()=>document.getElementById('dockSection')?.textContent?.trim()==='§11',null,{timeout:12000}).catch(()=>{});
  const returned=await page.evaluate(()=>({hash:location.hash,section:document.getElementById('dockSection')?.textContent?.trim(),mode:document.body.className}));
  assert.equal(returned.section,'§11','Read lost section: '+JSON.stringify(returned));
  assert.equal(errors.length,0,'Runtime exceptions: '+errors.join('; '));
  records.push({id,result:'pass',size:state.bar.height,controls:state.controls.map(c=>({id:c.id,width:c.width}))});
  console.log('PASS '+id+' nine controls, no clipping, navigation, exact resume');
 }catch(e){const details=String(e.stack||e).slice(0,3500);bad.push({id,details});console.log('FAIL '+id+' '+details);}
 finally{await context.close();}
}
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const url='http://127.0.0.1:'+server.address().port;
 try{
  for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
   const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
   try{for(const w of [320,350,375,390,430,620,768,1280])for(const mode of [0,1,3])await exercise(browser,name,url,w,mode);}
   finally{await browser.close();}
  }
 }finally{
  server.close();
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({baseline:process.env.GITHUB_SHA||'local',runs:records,failures:bad},null,2));
  console.log('FIX-SUMMARY '+JSON.stringify({passed:records.length,failed:bad.length,failures:bad.map(x=>({id:x.id,detail:x.details.slice(0,160)}))}));
 }
 if(bad.length)process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exitCode=1;server.close()});
