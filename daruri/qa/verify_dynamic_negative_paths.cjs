#!/usr/bin/env node
'use strict';
/* Daruri dynamic PDF independent negative-path acceptance.
 * Browser tests read a PINNED experimental branch in a separate checkout.
 * Never modify baseline PDFs, masters, annotations, or a real Reading Desk.
 * This script tests missing/stale/corrupt assets, user note ceilings, offline
 * recovery, post-error state, and simulated memory exhaustion.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {spawn}=require('node:child_process');
const root=path.resolve(process.env.GNAMMA_SITE_ROOT||path.resolve(__dirname,'../..'));
const nodeModules=path.join(root,'daruri/qa/node_modules');
const {chromium,webkit}=require(path.join(nodeModules,'playwright'));
const engine=process.env.GNAMMA_BROWSER||'chromium';
if(!['chromium','webkit'].includes(engine))throw Error('Invalid browser engine');
const port=engine==='webkit'?8832:8831;
const host='http://127.0.0.1:'+port;
const source=host+'/daruri/dynamic-editions.html';
const output=path.resolve(process.env.GNAMMA_REPORT_DIR||'/tmp/daruri-dynamic-safety-'+engine);
fs.mkdirSync(output,{recursive:true});
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',root],{stdio:'ignore'});
const delay=n=>new Promise(r=>setTimeout(r,n));
const timeout=90000;
const items=()=>[
 {id:'n1',kind:'note',title:'Test-only source note',body:'PRIVATE_TOKEN_DO_NOT_UPLOAD',
  target:{kind:'quote',section:'1',segment:0,lang:'en',quote:'knowledge'},
  created:1,updated:1,dateSource:'recorded',deleted:0},
 {id:'n2',kind:'note',title:'Standalone source note',body:'Arabic العربية and French français',
  target:null,standalone:true,created:2,updated:2,dateSource:'recorded',deleted:0}
];
const desk=rows=>({format:'gnamma-reading-desk',version:1,items:rows||items()});
const cases=[];
let browser;
const add=(name,pass,details='',severity='hard')=>{
 const row={name,status:pass?'PASS':'FAIL',severity,details};
 cases.push(row);
 console.log('SAFETY_CASE',JSON.stringify(row));
};
const findPaths={
 packetPdf:'**/dynamic-pdf/packets/gnamma-apparatus-glossary.pdf',
 packetMap:'**/dynamic-pdf/packets/gnamma-apparatus-glossary.pdf.json',
 profileMap:'**/dynamic-pdf/packets/profiles/daruri-reading-bilingual-glossary.pdf.links.json',
 basePdf:'**/editions/reading/daruri-reading-bilingual-titles-off.pdf',
 baseMap:'**/editions/maps/daruri-reading-bilingual-titles-off.pdf.json',
 baseManifest:'**/editions/manifest.json',
 packetManifest:'**/dynamic-pdf/packets/manifest.json'
};
async function setup(rows,router) {
 const ctx=await browser.newContext({
  viewport:{width:390,height:844},isMobile:true,hasTouch:true,
  deviceScaleFactor:2,serviceWorkers:'block',acceptDownloads:true
 });
 const page=await ctx.newPage();
 const out={errors:[],outsiders:[],ctx,page,initial:JSON.stringify(desk(rows))};
 page.on('pageerror',e=>out.errors.push(e.message));
 page.on('request',r=>{
  if(r.url().startsWith('http')&&(!r.url().startsWith(host)||r.method()!=='GET'))
    out.outsiders.push({url:r.url(),method:r.method()});
 });
 await page.addInitScript(raw=>localStorage.setItem('gnamma-reading-desk-v1',raw),out.initial);
 if(router)await router(page);
 await page.goto(source,{waitUntil:'domcontentloaded',timeout});
 return out;
}
async function ready(s) {
 await s.page.waitForFunction(()=>
  document.querySelector('#gn-dyn-profile')?.options.length===120&&
  !document.querySelector('#gn-dyn-make')?.disabled&&
  window.GnammaPersonalExportInline?.ready,
  null,{timeout});
}
async function unchanged(s){
 assert.equal(await s.page.evaluate(()=>localStorage.getItem('gnamma-reading-desk-v1')),s.initial);
 assert.deepEqual(s.errors,[],'Unhandled browser error');
 assert.deepEqual(s.outsiders,[],'Private client must make no cross-origin or POST requests');
}
async function fallback(s){
 const href=await s.page.locator('#pe-clean').getAttribute('href');
 assert(href&&(/daruri\.pdf$/i.test(href)||href.startsWith('blob:')),
  'No unchanged PDF access or explicitly composed document link');
 const link=await s.page.locator('a[href*="index.html#editions"]').count();
 assert(link>=1,'Cannot return to main Editions selector');
}
async function generationFailure(s,expect){
 await s.page.locator('#gn-dyn-make').click();
 await s.page.waitForFunction(()=>
  document.getElementById('gn-dyn-status')?.dataset.error==='true',
  null,{timeout});
 const status=await s.page.locator('#gn-dyn-status').innerText();
 assert.match(status,expect,status);
 assert(await s.page.locator('#gn-dyn-download').evaluate(el=>el.hidden),'Failed build did not clear the download link state');
 assert(await s.page.locator('#gn-dyn-make').isEnabled(),'Build button not restored after failure');
 await fallback(s);
 await unchanged(s);
 return status;
}
async function withCase(name,run) {
 let s=null;
 try{const result=await run(x=>s=x);add(name,true,result||'Passed');}
 catch(err){add(name,false,String(err.stack||err).slice(0,1800));}
 finally{if(s)await s.ctx.close().catch(()=>{});}
}
const tamper=pattern=>async page=>{
 await page.route(pattern,async route=>{
  const original=await route.fetch();
  const bytes=Buffer.from(await original.body());
  const changed=Buffer.concat([bytes,Buffer.from([0x20])]);
  await route.fulfill({response:original,body:changed});
 });
};
const unavailable=(pattern,status=503)=>async page=>{
 await page.route(pattern,route=>route.fulfill({status,
  contentType:'text/plain',body:'Simulated publication asset outage'}));
};
async function run(){
 browser=await (engine==='chromium'?chromium:webkit).launch(
  engine==='chromium'&&process.env.GNAMMA_CHROME_CHANNEL?
   {headless:true,channel:process.env.GNAMMA_CHROME_CHANNEL}:
   {headless:true});
 await withCase('empty download control must not be visible',async set=>{
  const s=await setup(null);set(s);await ready(s);
  const anchor=s.page.locator('#gn-dyn-download');
  const hiddenAttribute=await anchor.evaluate(el=>el.hidden);
  const visible=await anchor.isVisible();
  const href=await anchor.getAttribute('href');
  assert(hiddenAttribute===true,'The unopened PDF download is not marked hidden');
  assert(!visible,
    'UI BLOCKER: visible Download generated PDF control with no generated PDF; a CSS display rule overrides the hidden attribute (href='+href+')');
  await unchanged(s);
  return 'Download link is truly invisible until a valid PDF exists';
 });
 await withCase('manifest outage: clean fallback survives',async set=>{
  const s=await setup(null,unavailable(findPaths.packetManifest));set(s);
  await s.page.waitForFunction(()=>
   document.querySelector('#gn-dyn-status')?.dataset.error==='true',null,{timeout});
  assert.match(await s.page.locator('#gn-dyn-status').innerText(),
   /Cannot initialize.*(unavailable|503)/i);
  assert(await s.page.locator('#gn-dyn-make').isDisabled());
  assert(await s.page.locator('#pe-generate').isEnabled(),
   'Unchanged source PDF control disabled by dynamic init failure');
  await fallback(s);await unchanged(s);
  return 'Failed closed at manifest, unchanged PDF action remains available';
 });
 const failures=[
  ['missing published base PDF',findPaths.basePdf,unavailable(findPaths.basePdf),/unavailable.*503/i],
  ['missing reusable apparatus PDF',findPaths.packetPdf,unavailable(findPaths.packetPdf),/unavailable.*503/i],
  ['missing packet link map',findPaths.packetMap,unavailable(findPaths.packetMap),/unavailable.*503/i],
  ['SHA tampering in reusable packet PDF',findPaths.packetPdf,tamper(findPaths.packetPdf),/checksum|SHA|did not match/i],
  ['SHA tampering in verified source base PDF',findPaths.basePdf,tamper(findPaths.basePdf),/checksum|SHA|did not match/i],
  ['SHA tampering in source section map',findPaths.baseMap,tamper(findPaths.baseMap),/checksum|SHA|did not match/i],
  ['SHA tampering in apparatus link map',findPaths.profileMap,tamper(findPaths.profileMap),/checksum|SHA|did not match/i]
 ];
 for(const [name,pattern,intercept,expected] of failures){
  await withCase(name,async set=>{
   const s=await setup(null,intercept);set(s);await ready(s);
   const status=await generationFailure(s,expected);
   return status.slice(0,160);
  });
 }
 await withCase('stale manifest/source revision disagreement',async set=>{
  const s=await setup(null,async page=>{
   await page.route(findPaths.baseManifest,async route=>{
    const response=await route.fetch();
    const json=JSON.parse(await response.text());
    const entry=json.files.find(e=>e.file==='reading/daruri-reading-bilingual-titles-off.pdf');
    assert(entry,'Expected approved base manifest layout');
    entry.sha256='f'.repeat(64);
    await route.fulfill({response,contentType:'application/json',body:JSON.stringify(json)});
   });
  });
  set(s);await ready(s);
  const text=await generationFailure(s,/source PDF|do not agree|SHA|checksum/i);
  return 'Old manifest rejected: '+text.slice(0,130);
 });
 await withCase('simulated memory exhaustion restores functionality',async set=>{
  const s=await setup(null);set(s);await ready(s);
  await s.page.evaluate(()=>{
   window.GnammaDynamicPdf.assemble=async()=>{throw Error('Simulated out-of-memory failure');};
  });
  const status=await generationFailure(s,/Simulated out-of-memory failure/);
  return status.slice(0,130);
 });
 await withCase('offline fetch fails closed and reconnect can recover',async set=>{
  const s=await setup(null);set(s);await ready(s);
  await s.ctx.setOffline(true);
  const message=await generationFailure(s,/fetch|network|unavailable|Failed/i);
  await s.ctx.setOffline(false);
  await s.page.locator('#gn-dyn-make').click();
  await s.page.waitForFunction(()=>/Verified \d+ pages/.test(
   document.getElementById('gn-dyn-status')?.textContent||''),null,{timeout});
  assert(await s.page.locator('#gn-dyn-download').isVisible());
  await unchanged(s);
  return 'Offline did not emit a broken PDF; reconnect retry succeeded ('+message.slice(0,90)+')';
 });
 await withCase('501 personal items rejected before PDF build',async set=>{
  const many=Array.from({length:501},(_,i)=>({
   ...items()[0],id:'note-'+i,title:'Personal item '+i,
   target:{kind:'section',section:String(i%258+1)}
  }));
  const s=await setup(many);set(s);await ready(s);
  await s.page.locator('input[name="pe-mode"][value="all"]').check();
  assert(await s.page.locator('#pe-generate').isDisabled(),'501 notes were not blocked');
  assert.match(await s.page.locator('#pe-count').innerText(),/Too many.*500/i);
  await unchanged(s);
  return '501 qualifying items rejected (500 maximum), data unchanged';
 });
 await withCase('overlong personal text rejected before PDF build',async set=>{
  const large=[{...items()[0],body:'Q'.repeat(230001)}];
  const s=await setup(large);set(s);await ready(s);
  await s.page.locator('input[name="pe-mode"][value="all"]').check();
  await s.page.locator('#pe-generate').click();
  await s.page.locator('#pe-alert').waitFor({state:'visible',timeout});
  const message=await s.page.locator('#pe-alert').innerText();
  assert.match(message,/Too much text|Choose fewer notes/);
  assert(await s.page.locator('#pe-result').isHidden(),'Oversize note emitted private PDF');
  await unchanged(s);
  return '230001-character personal note stopped by export size ceiling';
 });
 await withCase('hung asset has a recovery path; report missing cancel control',async set=>{
  let start,resolveStart,release;
  const started=new Promise(r=>resolveStart=r),gate=new Promise(r=>release=r);
  const s=await setup(null,async page=>{
   await page.route(findPaths.packetPdf,async route=>{
    resolveStart();
    await gate;
    await route.fulfill({status:503,body:'User simulated interruption'});
   });
  });
  set(s);await ready(s);
  await s.page.locator('#gn-dyn-make').click();
  await Promise.race([started,delay(20000).then(()=>{throw Error('Hanging route not reached');})]);
  assert(await s.page.locator('#gn-dyn-make').isDisabled());
  assert(await s.page.locator('#gn-dyn-personal').isDisabled());
  const cancel=await s.page.locator('[id*="cancel" i],[aria-label*="cancel" i]').count();
  const still=await s.page.locator('#gn-dyn-status').innerText();
  await delay(1300);
  const after=await s.page.locator('#gn-dyn-status').innerText();
  release();
  await s.page.waitForFunction(()=>document.querySelector('#gn-dyn-status')?.dataset.error==='true',
   null,{timeout});
  assert(await s.page.locator('#gn-dyn-make').isEnabled());
  await unchanged(s);
  if(!cancel&&still===after){
   return 'OPERATIONAL BLOCKER: No Cancel/AbortController or asset-fetch timeout; buttons remain locked until external network resolves';
  }
  return 'Pending transfer could be cancelled or timed out';
 });
 await withCase('old private PDF is not silently substituted after a failed new selection',async set=>{
  let rejectNext=false;
  const s=await setup(null,async page=>{
   await page.route('**/dynamic-pdf/packets/gnamma-apparatus-index-concordance.pdf',route=>
    rejectNext?route.fulfill({status:503,body:'Selected new packet unavailable'}):route.continue());
  });
  set(s);await ready(s);
  await s.page.locator('#gn-dyn-personal').click();
  await s.page.waitForFunction(()=>
   document.getElementById('pe-edition')?.value.startsWith('generated-'),
   null,{timeout});
  const original=await s.page.locator('#pe-edition').inputValue();
  await s.page.locator('#gn-dyn-profile').selectOption(
   'apparatus/daruri-reading-english-index-concordance.pdf');
  rejectNext=true;
  await generationFailure(s,/unavailable.*503/i);
  const after=await s.page.locator('#pe-edition').inputValue();
  assert.notEqual(after,original,
    'OPERATIONAL BLOCKER: exporter silently retains previous generated edition after user selected a different profile and the new generation failed');
  return 'Previously generated personal base not confused with failed new selection';
 });
 const bad=cases.filter(c=>c.status==='FAIL'),known=cases.filter(c=>c.details.startsWith('OPERATIONAL BLOCKER'));
 const report={
  title:'Daruri on-demand PDF independent failure-path tests',
  source_commit:'2dfc1e716f36e6cee32c6a45705917a6acf8d43c',
  engine,viewport:'390x844',read_only:true,
  total:cases.length,passed:cases.length-bad.length,failed:bad.length,
  observed_blockers:known.length,results:cases
 };
 fs.writeFileSync(path.join(output,'negative-path-report.json'),
  JSON.stringify(report,null,2)+'\n');
 console.log('SAFETY_FINAL',JSON.stringify({engine,total:report.total,
   passed:report.passed,failed:report.failed,known_blockers:report.observed_blockers}));
 if(bad.length)process.exitCode=2;
}
(async()=>{try{await delay(1300);await run();}
 catch(err){console.error('SAFETY_FATAL',err);process.exitCode=2;}
 finally{await browser?.close().catch(()=>{});server.kill();}})();
