'use strict';
/* Read-only geometry sampling at deliberately narrow 280/300px and published
 * 320px minimum; also wide 2560px. No devices or user storage modified. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(__dirname,'extra-width-audit');
fs.mkdirSync(OUT,{recursive:true});
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 let name;try{name=decodeURIComponent(new URL(req.url,'http://local').pathname)}catch(_){res.writeHead(400);res.end();return;}
 const p=path.resolve(ROOT,'.'+name);
 if(!p.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(p)&&fs.statSync(p).isDirectory()?path.join(p,'index.html'):p;
 if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'content-type':MIME[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
 fs.createReadStream(file).pipe(res);
});
const rows=[],errors=[];
async function inspect(browser,name,origin,width,mode){
 const ctx=await browser.newContext({viewport:{width,height:width<=320?700:930},isMobile:width<=390,hasTouch:width<=390,serviceWorkers:'block',reducedMotion:'reduce'});
 await ctx.addInitScript(m=>localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'11',lang:'parallel',focusLevel:m})),mode);
 const page=await ctx.newPage(),id=name+'-'+width+'-'+mode;
 try{
  await page.goto(origin+'/daruri/#section=11',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#readerDock:not([hidden])').waitFor({timeout:24000});
  const geom=await page.evaluate(()=>{
   const ids=['menuBtn','focusToolbar','readerSaveAction','readerCopyAction','readerShareAction','searchBtn','settingsBtn'];
   const nodes=ids.map(id=>({id,el:document.getElementById(id)}));
   document.querySelectorAll('#persistentLanguages>button').forEach((el,i)=>nodes.push({id:'lang'+i,el}));
   const right=document.documentElement.clientWidth;
   const mapped=nodes.map(({id,el})=>{
    const r=el?.getBoundingClientRect();
    if(!r)return {id,missing:true};
    const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
    return {id,x:Math.round(r.left),right:Math.round(r.right),y:Math.round(r.top),
      width:Math.round(r.width),height:Math.round(r.height),clipped:r.left<-1||r.right>right+1,
      touchable:!!hit&&(hit===el||el.contains(hit))};
   });
   const valid=mapped.filter(x=>!x.missing).sort((a,b)=>a.x-b.x);
   return {viewport:right,docWidth:document.documentElement.scrollWidth,
    controls:mapped,overlap:valid.some((x,i)=>i>0&&x.x<valid[i-1].right-1),
    barHeight:document.getElementById('readingControls')?.getBoundingClientRect()?.height||0,
    missing:mapped.filter(x=>x.missing).map(x=>x.id),
    clipped:mapped.filter(x=>x.clipped).map(x=>x.id),
    obstructed:mapped.filter(x=>!x.missing&&!x.touchable).map(x=>x.id)};
  });
  rows.push({id,...geom});
  console.log('WIDTH-AUDIT '+JSON.stringify({id,viewport:geom.viewport,docWidth:geom.docWidth,
    barHeight:geom.barHeight,overlap:geom.overlap,missing:geom.missing,clipped:geom.clipped,obstructed:geom.obstructed}));
  // 320px is the explicit release minimum; 280/300 are optional stress cases.
  if(width>=320&&(geom.docWidth>geom.viewport+2||geom.missing.length||geom.overlap||geom.clipped.length||geom.obstructed.length))
   errors.push({id,geom});
 }catch(e){errors.push({id,error:String(e.stack||e).slice(0,1700)});console.error('FAIL WIDTH '+id+' '+e);}
 finally{await ctx.close();}
}
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 try{
  const url='http://127.0.0.1:'+server.address().port;
  for(const [name,api] of [['chromium',chromium],['webkit',webkit]]){
   const browser=await api.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
   try{for(const width of [280,300,320,2560])for(const mode of [0,1])await inspect(browser,name,url,width,mode);}
   finally{await browser.close();}
  }
 }finally{
  server.close();
  fs.writeFileSync(path.join(OUT,'geometry.json'),JSON.stringify({rows,errors},null,2));
  console.log('EXTRA WIDTH SUMMARY '+JSON.stringify({cases:rows.length,requiredFailures:errors.length,
   optionalBelow320:rows.filter(x=>x.viewport<320&&(x.clipped.length||x.overlap||x.obstructed.length)).map(x=>x.id)}));
 }
 if(errors.length)process.exitCode=1;
})().catch(e=>{server.close();console.error(e.stack||e);process.exitCode=1;});
