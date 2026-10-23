#!/usr/bin/env node
'use strict';
/* Real browser acceptance of 120 design-aware, source-preserving PDF choices.
 * Uses synthetic private Reading Desk notes and a local HTTP test server.
 * All real approved PDFs, source maps and original note bodies are read-only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {spawn}=require('node:child_process');
const ROOT=path.resolve(__dirname,'../..');
const {chromium,webkit}=require(path.join(ROOT,'daruri/qa/node_modules/playwright'));
const browserId=process.env.GNAMMA_BROWSER||'chromium';
const port=browserId==='webkit'?8902:8901;
const origin='http://127.0.0.1:'+port;
const address=origin+'/daruri/dynamic-editions.html';
const events=[],errors=[],leaks=[],requestedStaticVariants=[];
const specialToken='SYNTHETIC_PRIVATE_PDF_DESIGN_TOKEN_DO_NOT_TRANSMIT';
const note={format:'gnamma-reading-desk',version:1,items:[{
 id:'design-only-test-note',kind:'note',title:'Synthetic title',
 body:specialToken,target:null,standalone:true,
 created:1,updated:1,dateSource:'recorded',deleted:0
}]};
let web,server,ctx,page;
async function record(name,fn){
 try{const data=await fn();events.push({name,ok:true,detail:data??null});console.log('DESIGN_BROWSER_PASS',name);}
 catch(e){events.push({name,ok:false,error:String(e.stack||e)});console.error('DESIGN_BROWSER_FAIL',name,String(e));}
}
async function waitReady(){
 await page.waitForFunction(()=>{
  const sel=document.querySelector('#gn-dyn-profile');
  return sel?.options.length===120 &&
   !document.querySelector('#gn-dyn-make')?.disabled &&
   document.querySelector('#gn-dyn-other-links')?.querySelectorAll('a')?.length===5;
 },null,{timeout:90000});
}
async function publish(profile,expectedPages){
 await page.locator('#gn-dyn-profile').selectOption(profile);
 assert.match(await page.locator('#gn-dyn-design-spec').innerText(),/Original design: /);
 await page.locator('#gn-dyn-make').click();
 await page.waitForFunction(()=>
   /Verified \d+ pages/.test(document.querySelector('#gn-dyn-status')?.textContent||''),
  null,{timeout:90000});
 assert.equal(await page.locator('#gn-dyn-download').isVisible(),true);
 const details=await page.evaluate(async()=>{
  const a=document.getElementById('gn-dyn-download');
  const bytes=new Uint8Array(await (await fetch(a.href)).arrayBuffer());
  const doc=await window.PDFLib.PDFDocument.load(bytes,{updateMetadata:false});
  return {name:a.download,pageCount:doc.getPageCount(),
    pdfMagic:String.fromCharCode(...bytes.slice(0,5)),bytes:bytes.length};
 });
 assert.equal(details.pdfMagic,'%PDF-');
 assert.equal(details.pageCount,expectedPages);
 assert(details.bytes>25000);
 const count=await page.locator('#gn-dyn-profile option').count();
 assert.equal(count,120,'Generating a PDF must not change the approved choices');
 return details;
}
(async()=>{
 try{
  server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',ROOT],{stdio:'ignore'});
  await new Promise(resolve=>setTimeout(resolve,1000));
  const kind=browserId==='webkit'?webkit:chromium;
  web=await kind.launch(browserId==='chromium'&&process.env.GNAMMA_CHROME_CHANNEL?
   {channel:process.env.GNAMMA_CHROME_CHANNEL,headless:true}:{headless:true});
  ctx=await web.newContext({viewport:{width:390,height:844},isMobile:true,
   hasTouch:true,deviceScaleFactor:2,serviceWorkers:'block'});
  page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{
   // The public source-ZIP HEAD request is same-origin and carries no personal data.
   if(r.url().startsWith('http')&&
      (!r.url().startsWith(origin)||!['GET','HEAD'].includes(r.method())))
     leaks.push({url:r.url(),method:r.method()});
  });
  await page.addInitScript(value=>localStorage.setItem('gnamma-reading-desk-v1',value),JSON.stringify(note));
  // Stage 1 proof: act as though all 120 large, prebuilt apparatus PDFs
  // were removed from hosting. An approved composition must NEVER fetch one.
  await page.route('**/editions/apparatus/*.pdf',route=>{
    requestedStaticVariants.push(route.request().url());
    return route.fulfill({status:404,contentType:'text/plain',body:'Not deployed in Stage 1'});
  });
  await page.goto(address,{waitUntil:'domcontentloaded',timeout:90000});
  await waitReady();
  await record('exact signed source design registry and 120 options',async()=>{
    const groups=await page.locator('#gn-dyn-profile optgroup').count();
    const choices=await page.locator('#gn-dyn-profile option').count();
    const approved=await page.locator('#gn-dyn-other-links a').count();
    assert.equal(groups,8);assert.equal(choices,120);assert.equal(approved,5);
    const hrefs=await page.locator('#gn-dyn-other-links a').evaluateAll(a=>a.map(x=>x.href));
    assert.equal(new Set(hrefs).size,5);
    assert(hrefs.every(x=>x.startsWith(origin+'/daruri/daruri-')||
       x.startsWith(origin+'/daruri/daruri.pdf?')));
    return {groups,choices,other_canonical_formats:approved};
  });
  await record('bilingual Reading PDF generated with original design preserved',async()=>
    publish('apparatus/daruri-reading-bilingual-glossary.pdf',86));
  await record('English-only Reading PDF generated without bilingual reflow',async()=>
    publish('apparatus/daruri-reading-english-index-concordance.pdf',68));
  await record('bilingual Study PDF generated with its original footnotes',async()=>
    publish('apparatus/daruri-study-bilingual-glossary-index-concordance-applications-titles-on.pdf',185));
  await record('complete variant PDF files are not required for browser generation',async()=>{
    assert.deepEqual(requestedStaticVariants,[],
      'The generator fetched a complete prebuilt edition instead of assembling one');
    return {three_created_profiles:3,existing_120_pdf_files_available_on_server:false};
  });
  await record('deep link retains the exact selected generator profile',async()=>{
    const requested='apparatus/daruri-reading-english-index-concordance.pdf';
    await page.goto(address+'?profile='+encodeURIComponent(requested),{waitUntil:'domcontentloaded'});
    await waitReady();
    assert.equal(await page.locator('#gn-dyn-profile').inputValue(),requested);
    return {requested};
  });
  await record('unapproved profile deep link fails closed instead of substituting an edition',async()=>{
    await page.goto(address+'?profile='+encodeURIComponent('apparatus/imaginary.pdf'),{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelector('#gn-dyn-status')?.dataset.error==='true',null,{timeout:30000});
    assert.match(await page.locator('#gn-dyn-status').innerText(),/not in the signed|not approved|requested/i);
    assert(await page.locator('#gn-dyn-make').isDisabled());
    assert.equal(await page.locator('#gn-dyn-download').isVisible(),false);
    await page.goto(address,{waitUntil:'domcontentloaded'});
    await waitReady();
  });
  await record('main Editions control actually creates selected apparatus PDF on-device',async()=>{
    await page.goto(origin+'/daruri/#editions',{waitUntil:'domcontentloaded',timeout:90000});
    const ui=page.locator('.gn-es');
    await ui.waitFor({timeout:90000});
    await page.waitForFunction(()=>
      window.GnammaEditions?.__getPublicationSelection?.().resolution==='ready',
      null,{timeout:90000});
    await ui.locator('[data-es-custom]').click();
    await ui.locator('[data-es-include="glossary"]').click();
    const launch=ui.locator('[data-es-stage1-create]');
    assert.equal(await launch.isVisible(),true);
    assert.equal(await ui.locator('[data-es-action="open"]').isVisible(),false);
    assert.equal(await ui.locator('[data-es-action="download"]').isVisible(),false);
    assert.match(await launch.getAttribute('href'),/profile=apparatus%2Fdaruri-reading-bilingual-glossary\.pdf/);
    assert.match(await launch.getAttribute('href'),/autostart=plain/);
    await launch.click();
    await page.waitForURL(/dynamic-editions\.html\?profile=/,{timeout:90000});
    await page.waitForFunction(()=>
      /Verified \d+ pages/.test(document.querySelector('#gn-dyn-status')?.textContent||''),
      null,{timeout:90000});
    assert.equal(await page.locator('#gn-dyn-profile').inputValue(),
      'apparatus/daruri-reading-bilingual-glossary.pdf');
    const pdf=await page.evaluate(async()=>{
      const a=document.getElementById('gn-dyn-download');
      const bytes=await(await fetch(a.href)).arrayBuffer();
      return {magic:new TextDecoder().decode(bytes.slice(0,5)),
        pages:(await PDFLib.PDFDocument.load(bytes)).getPageCount()};
    });
    assert.equal(pdf.magic,'%PDF-');
    assert.equal(pdf.pages,86);
    assert.deepEqual(requestedStaticVariants,[],
      'The real Editions workflow must not retrieve any prebuilt apparatus edition');
    await page.goto(address,{waitUntil:'domcontentloaded'});
    await waitReady();
    return pdf;
  });
  await record('source design metadata follows the selected print specification',async()=>{
    await page.locator('#gn-dyn-profile').selectOption(
     'apparatus/daruri-reading-bilingual-unvowelled-glossary.pdf');
    assert.match(await page.locator('#gn-dyn-design-spec').innerText(),/Arabic unvowelled/);
    assert.equal(await page.locator('#gn-dyn-download').isVisible(),false);
    await page.locator('#gn-dyn-profile').selectOption(
     'apparatus/daruri-study-bilingual-glossary.pdf');
    assert.match(await page.locator('#gn-dyn-design-spec').innerText(),/Study · selected notes/);
    assert.equal(await page.locator('#gn-dyn-download').getAttribute('href'),null);
  });
  await record('all personal notes remain device-local',async()=>{
    assert.equal(await page.evaluate(()=>localStorage.getItem('gnamma-reading-desk-v1')),
      JSON.stringify(note));
    assert.deepEqual(errors,[]);
    assert.deepEqual(leaks,[]);
  });
  await record('tampered signed source layout fails closed',async()=>{
    await page.route('**/editions/manifest.json',async route=>{
      const r=await route.fetch();
      const j=JSON.parse(await r.text());
      j.files[0].sha256='0'.repeat(64);
      await route.fulfill({response:r,body:JSON.stringify(j),contentType:'application/json'});
    });
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelector('#gn-dyn-status')?.dataset.error==='true',
      null,{timeout:30000});
    assert.match(await page.locator('#gn-dyn-status').innerText(),/Cannot initialize|match|changed/i);
    assert(await page.locator('#gn-dyn-make').isDisabled());
    assert.equal(await page.locator('#gn-dyn-download').isVisible(),false);
    await page.unroute('**/editions/manifest.json');
  });
 }catch(e){events.push({name:'suite fatal',ok:false,error:String(e.stack||e)});console.error(e);}
 finally{
  const file=path.resolve(process.env.GNAMMA_REPORT_DIR||'/tmp/daruri-design-browser-'+browserId);
  fs.mkdirSync(file,{recursive:true});
  const summary={engine:browserId,expected_compositions:120,source_designs:12,
   canonical_other_designs:5,tests:events,errors,leaks,static_pdf_fetches:requestedStaticVariants,
   passed:events.filter(e=>e.ok).length,failed:events.filter(e=>!e.ok).length,
   original_pdf_bytes_modified:false,release_approved:false};
  fs.writeFileSync(path.join(file,'design-browser-report.json'),JSON.stringify(summary,null,2)+'\n');
  await ctx?.close().catch(()=>{});
  await web?.close().catch(()=>{});
  server?.kill();
  console.log('DESIGN_BROWSER_FINAL',JSON.stringify({engine:browserId,passed:summary.passed,failed:summary.failed}));
  if(summary.failed)process.exitCode=2;
 }
})();
