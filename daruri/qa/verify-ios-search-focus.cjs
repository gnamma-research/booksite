/* iPhone-sized Chromium & WebKit smoke test. Native iOS keyboard UI is not emulated. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=(()=>{try{return require('playwright')}catch{return require('/usr/local/lib/node_modules/playwright')}})();
const ROOT=path.resolve(__dirname,'../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const p=path.resolve(ROOT,'.'+pathname);
  if(!p.startsWith(ROOT+path.sep)){res.writeHead(403).end();return}
  const file=fs.existsSync(p)&&fs.statSync(p).isDirectory()?path.join(p,'index.html'):p;
  if(!fs.existsSync(file)){res.writeHead(404).end();return}
  res.setHeader('Content-Type',MIME[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/daruri/';
 try{
  for(const [name,type] of [['Chromium',chromium],['WebKit',webkit]]){
   const browser=await type.launch({headless:true,...(name==='Chromium'?{args:['--no-sandbox']}:{})});
   try{
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url,{waitUntil:'load',timeout:60000});
    await page.waitForFunction(()=>!!window.GnammaUnifiedSearch,null,{timeout:20000});
    await page.locator('#searchBtn').click();
    assert.ok(await page.locator('#gns-query').isVisible());
    assert.notEqual(await page.evaluate(()=>document.activeElement?.id),'gns-query',
      name+': opening search should not automatically raise the keyboard');
    const query=page.locator('#gns-query');
    assert.equal(await query.getAttribute('autocorrect'),'off');
    assert.equal(await query.getAttribute('autocapitalize'),'off');
    await query.fill('dalil');
    await page.waitForFunction(()=>
      document.querySelector('.gns-morph-assist')?.textContent.includes('أدلة'),
      null,{timeout:15000});
    assert.equal(await page.evaluate(()=>document.activeElement?.id),'gns-query',
      name+': incremental search should preserve text-entry focus');
    await page.locator('[data-gns-morph-pick="morph-lemma"]').click();
    assert.equal(await page.evaluate(()=>window.GnammaUnifiedSearch.getState().mode),'morph-lemma');
    assert.notEqual(await page.evaluate(()=>document.activeElement?.id),'gns-query',
      name+': choosing Word forms should not re-activate keyboard');
    assert.ok(await page.locator('.gns-result').count()>0);
    await page.locator('#gns-query').fill('hukm');
    await page.waitForTimeout(350);
    const plural=await page.evaluate(()=>
      window.GnammaMorphology.formsFor('hukm','daruri',6)?.find(x=>x.unusual)?.form);
    assert.equal(plural,'أحكام');
    await page.locator('.gns-dialog [data-gns-close="1"]').click();
    assert.equal(await page.locator('.gns-dialog').count(),0);
    assert.deepEqual(errors,[],name+': no page script errors');
    console.log('PASS '+name+': mobile focus, plurals, autocorrect and results navigation');
    await context.close();
   }finally{await browser.close()}
  }
 }finally{await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
