'use strict';
/* Real mouse down/drag/up in the bilingual Daruri reader.
 * Confirm visible highlight pixels, not just invisible Selection.toString().
 * Run only on localhost with disposable browser state. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright'),{PNG}=require('pngjs');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(__dirname,'selection-drag-artifacts');
fs.mkdirSync(OUT,{recursive:true});
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml',
 '.woff2':'font/woff2','.ttf':'font/ttf','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 let p;try{p=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch(_){res.writeHead(400);res.end();return;}
 const local=path.resolve(ROOT,'.'+p);if(!local.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(local)&&fs.statSync(local).isDirectory()?path.join(local,'index.html'):local;
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'content-type':MIME[path.extname(file)]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
function diffPNG(a,b){
 const x=PNG.sync.read(a),y=PNG.sync.read(b);
 assert.equal(x.width,y.width);assert.equal(x.height,y.height);
 let changed=0,strong=0;
 for(let k=0;k<x.data.length;k+=4){
  const d=Math.max(Math.abs(x.data[k]-y.data[k]),
   Math.abs(x.data[k+1]-y.data[k+1]),Math.abs(x.data[k+2]-y.data[k+2]));
  if(d>15)changed++;if(d>45)strong++;
 }
 return {pixels:x.width*x.height,changed,strong,ratio:changed/(x.width*x.height)};
}
const outcomes=[],issues=[];
async function inspect(engine,name,url,language){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
 const ctx=await browser.newContext({viewport:{width:1280,height:860},serviceWorkers:'block',
  reducedMotion:'reduce'});
 await ctx.addInitScript(()=>localStorage.setItem('daruri-reader-v2',
  JSON.stringify({n:'11',lang:'parallel',vowels:false,focusLevel:0})));
 const page=await ctx.newPage();
 const id=name+'-'+language;
 try{
  await page.goto(url+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:65000});
  await page.locator('#readerDock:not([hidden])').waitFor();
  const langClass=language==='ar'?'passage-ar':'passage-en';
  const side=page.locator('#reader .passage-grid[data-segment="0"] .'+langClass+':visible').first();
  await side.waitFor();
  await side.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
  const pos=await page.evaluate(sideClass=>{
   const side=document.querySelector('#reader .passage-grid[data-segment="0"] .'+sideClass);
   window.getSelection()?.removeAllRanges();
   const walk=document.createTreeWalker(side,NodeFilter.SHOW_TEXT);
   let node,match;
   while((node=walk.nextNode())){
    if(node.parentElement?.closest('sup,button,[aria-hidden="true"]'))continue;
    match=sideClass==='passage-en'?node.textContent.match(/[A-Za-z][A-Za-z ,.\-;:'’()]{34,}/u):
      node.textContent.match(/[\u0621-\u064a][\u0621-\u065f\s،]{20,}/u);
    if(match)break;
   }
   if(!node||!match)throw Error('Could not find drag-capable '+sideClass+' segment');
   const prefix=match.index,start=prefix+2,end=prefix+Math.min(21,match[0].length-2);
   const single=index=>{
    const r=document.createRange();r.setStart(node,index);r.setEnd(node,index+1);
    const box=r.getBoundingClientRect();
    return {x:box.x+box.width/2,y:box.y+box.height/2,top:box.top,bottom:box.bottom};
   };
   const a=single(start),b=single(end);
   if(Math.abs(a.top-b.top)>5)throw Error('Selected characters wrap across lines; choose another phrase');
   const left=Math.max(0,Math.floor(Math.min(a.x,b.x)-16));
   const right=Math.min(innerWidth,Math.ceil(Math.max(a.x,b.x)+16));
   const top=Math.max(0,Math.floor(Math.min(a.top,b.top)-3));
   const bottom=Math.min(innerHeight,Math.ceil(Math.max(a.bottom,b.bottom)+3));
   const pseudo=getComputedStyle(side,'::selection');
   return {a,b,clip:{x:left,y:top,width:right-left,height:bottom-top},
    bg:pseudo.backgroundColor};
  },langClass);
  assert(pos.clip.width>30&&pos.clip.height>10,'Drag region not meaningful');
  const before=await page.screenshot({clip:pos.clip});
  await page.mouse.move(pos.a.x,pos.a.y);
  await page.mouse.down();
  await page.mouse.move(pos.b.x,pos.b.y,{steps:15});
  await page.mouse.up();
  const selection=await page.evaluate(()=>window.getSelection()?.toString()||'');
  const after=await page.screenshot({clip:pos.clip});
  const pixels=diffPNG(before,after);
  assert(selection.trim().length>=3,'Mouse drag selected no readable characters');
  assert(pixels.changed>pixels.pixels*.06,
   'Selection copied but lacked visible highlight: '+JSON.stringify(pixels));
  assert.equal(await page.locator('#gnamma-word-context:visible').count(),0,
   'Ordinary dragging unexpectedly opened a Word Context dialog');
  await page.locator('#gn-rd-selection-bar:not([hidden])').waitFor();
  const out={id,selected:selection.slice(0,70),highlight:pixels,color:pos.bg};
  outcomes.push(out);
  console.log('PASS '+JSON.stringify(out));
  await page.screenshot({path:path.join(OUT,id+'.png'),fullPage:false});
 }catch(e){const detail=String(e.stack||e).slice(0,2500);issues.push({id,detail});console.error('FAIL '+id+' '+detail);}
 finally{await ctx.close();await browser.close();}
}
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 try{
  const base='http://127.0.0.1:'+server.address().port;
  for(const [name,engine] of [['chromium',chromium],['webkit',webkit]])
   for(const language of ['en','ar'])await inspect(engine,name,base,language);
 }finally{
  server.close();
  fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify({outcomes,issues},null,2));
  console.log('DRAG VISIBILITY SUMMARY '+JSON.stringify({passed:outcomes.length,failed:issues.length,issues:issues.map(x=>({id:x.id,why:x.detail.slice(0,180)}))}));
 }
 if(issues.length)process.exitCode=1;
})().catch(e=>{console.error(e.stack||e);server.close();process.exitCode=1;});
