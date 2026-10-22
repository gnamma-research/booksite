/* Gnamma morphology, context precedence and typing performance QA.
 * Run: node daruri/qa/verify-morphology.cjs
 * Uses isolated Playwright profile, never the reader's private storage.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=(()=>{try{return require('playwright')}catch(_){return require('/usr/local/lib/node_modules/playwright')}})();
const ROOT=path.resolve(__dirname,'../..');
let server,pass=0;
async function test(name,fn){await fn();pass++;console.log('PASS '+name)}
(async()=>{
 const daruri=JSON.parse(fs.readFileSync(path.join(ROOT,'daruri/morph-daruri-v1.json'),'utf8'));
 const mustasfa=JSON.parse(fs.readFileSync(path.join(ROOT,'daruri/morph-mustasfa-v1.json'),'utf8'));
 const lex=JSON.parse(fs.readFileSync(path.join(ROOT,'daruri/morph-lexicon.json'),'utf8'));
 await test('indexed records preserve provenance and exact source IDs',async()=>{
  assert.equal(daruri.schema,'gnamma-morph-v1');assert.equal(mustasfa.schema,'gnamma-morph-v1');
  assert.ok(daruri.records.length>350&&mustasfa.records.length>2500);
  assert.ok(lex.entries.length>=50);
  assert.ok(daruri.records.every(r=>/^passage:\d+:\d+$/.test(r.id)));
  assert.ok(mustasfa.records.every(r=>/^arabic:V\d+P\d+:\d+$/.test(r.id)));
  assert.ok(daruri.records.some(r=>r.a.some(x=>x[3]==='جهد')));
  assert.ok(daruri.records.flatMap(r=>r.a).some(a=>a[5]==='ambiguous'),'uncertainty should not be hidden');
 });
 const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
 server=http.createServer((req,res)=>{
  const clean=decodeURIComponent((req.url||'/').split('?')[0]);
  const filename=path.resolve(ROOT,'.'+clean);
  if(!filename.startsWith(ROOT+path.sep)){res.writeHead(403).end();return}
  const file=fs.existsSync(filename)&&fs.statSync(filename).isDirectory()?path.join(filename,'index.html'):filename;
  if(!fs.existsSync(file)){res.writeHead(404).end();return}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const url='http://127.0.0.1:'+server.address().port+'/daruri/';
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const ctx=await browser.newContext({viewport:{width:1280,height:800}});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'load',timeout:45000});
  await page.waitForFunction(()=>window.GnammaUnifiedSearch&&window.GnammaMorphology&&window.GnammaWordContext);
  await test('transliteration, lemma and root are independently resolved',async()=>{
   const v=await page.evaluate(async()=>{
    const m=window.GnammaMorphology;
    await Promise.all([m.loadLexicon(),m.ensure('daruri')]);
    const term=await m.recognize('qiyās'),root=await m.recognize('jhd');
    return {term:term.lemmas.map(x=>x.lemma),root:root.root,
     lemma:window.GnammaUnifiedSearch.query('qiyas',{mode:'morph-lemma'}).total,
     derived:window.GnammaUnifiedSearch.query('jhd',{mode:'morph-root'}).total};
   });
   assert.ok(v.term.includes('قياس'));assert.equal(v.root,'جهد');
   assert.ok(v.lemma>0,'Lemma should find actual passages');
   assert.ok(v.derived>0,'Transliterated root should find actual passages');
  });
  await test('typing never destroys and rebuilds the active input',async()=>{
   await page.locator('#searchBtn').click();
   const e=await page.evaluate(()=>{
    const el=document.querySelector('#gns-query');window.__testSearchInput=el;return !!el;
   });
   assert.ok(e);
   const query=page.locator('#gns-query');
   await query.fill('ijti');await page.waitForTimeout(55);
   await query.fill('ijtihad');await page.waitForTimeout(300);
   const same=await page.evaluate(()=>document.querySelector('#gns-query')===window.__testSearchInput);
   assert.equal(same,true);
   assert.equal(await query.inputValue(),'ijtihad');
  });
  await test('morphology choice is discoverable near Arabic results',async()=>{
   await page.locator('#gns-query').fill('qiyās');await page.waitForTimeout(320);
   assert.ok(await page.locator('[data-gns-morph-pick="morph-lemma"]').count());
   await page.locator('[data-gns-morph-pick="morph-lemma"]').click();
   await page.waitForFunction(()=>window.GnammaUnifiedSearch.getState().mode==='morph-lemma');
   const out=await page.locator('.gns-results-top').innerText();
   assert.match(out,/result/);
   await page.locator('[data-gns-close="1"]').last().click();
  });
  await test('word context keeps dictionary and search actions separate',async()=>{
   const output=await page.evaluate(async()=>{
    const node=document.querySelector('.passage-grid .passage-ar');
    await window.GnammaWordContext.openWord('العلم',node,node.closest('.passage-grid'),node);
    const hub=document.querySelector('#gnamma-word-context');
    return {visible:!!hub&&!hub.hidden,lemma:hub?.querySelector('[data-gnw-search="morph-lemma"]')?.textContent,
      actions:[...hub?.querySelectorAll('[data-gnw-search]')||[]].map(x=>x.dataset.gnwSearch),
      heading:hub?.querySelector('h2')?.textContent};
   });
   assert.equal(output.visible,true);assert.equal(output.heading,'العلم');
   assert.ok(output.actions.includes('literal'));
   await page.locator('[data-gnw-close]').first().click();
  });
  await test('dictionary term still opens its own dictionary rather than word inspector',async()=>{
   const linked=page.locator('.inline-term[data-term]').first();
   if(!(await linked.count()))throw Error('Missing original dictionary term');
   await linked.click();await page.waitForTimeout(80);
   assert.equal(await page.locator('#infoOverlay').evaluate(x=>x.hidden),false);
   assert.match(await page.locator('#detailEyebrow').innerText(),/DICTIONARY/i);
   assert.ok(await page.locator('#gnw-dictionary-search [data-gnw-search="terms"]').count());
   assert.equal(await page.locator('#gnamma-word-context:not([hidden])').count(),0);
   await page.locator('#detailClose').click();
  });
  await test('all events leave private Reading Desk storage untouched',async()=>{
   const before=await page.evaluate(()=>localStorage.getItem('gnamma-reading-desk-v1'));
   await page.evaluate(async()=>{
    const el=document.querySelector('.passage-grid .passage-ar');
    await window.GnammaWordContext.openWord('الاجتهاد',el,el.closest('.passage-grid'),el);
    window.GnammaWordContext.close();
   });
   const after=await page.evaluate(()=>localStorage.getItem('gnamma-reading-desk-v1'));
   assert.equal(after,before);
  });
  await test('no browser script errors in desktop reader',async()=>assert.deepEqual(errors,[]));
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await mobile.goto(url,{waitUntil:'load',timeout:45000});
  await mobile.locator('#searchBtn').click();
  await test('new controls remain within 390px mobile viewport',async()=>{
   await mobile.locator('#gns-query').fill('قياس');await mobile.waitForTimeout(320);
   const dim=await mobile.evaluate(()=>{
    const r=document.querySelector('.gns-dialog').getBoundingClientRect();
    return [r.width,innerWidth,document.documentElement.scrollWidth];
   });
   assert.ok(Math.abs(dim[0]-dim[1])<3,JSON.stringify(dim));
   assert.ok(dim[2]<=dim[1]+3,JSON.stringify(dim));
  });
 }finally{
  await browser.close();await new Promise(r=>server.close(r));
 }
 console.log('Morphology and context checks: '+pass+' passed');
})().catch(e=>{console.error(e.stack||e);server?.close();process.exit(1)});
