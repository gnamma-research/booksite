#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium,webkit}=require('playwright');
const root=path.resolve(__dirname,'..');
const base=process.env.DARURI_MATRIX_BASE||'http://127.0.0.1:8765/daruri/';
const results=[];
const out=path.join(root,'qa/applications-matrix-screenshots');fs.mkdirSync(out,{recursive:true});
async function run(engine,width,dark=false){
 const name=engine.name()+'-'+width+(dark?'-dark':'');
 const browser=await engine.launch({headless:true});
 const context=await browser.newContext({viewport:{width,height:900},colorScheme:dark?'dark':'light',serviceWorkers:'block'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let baselineErrors=[];
 try{
  await page.goto(base+'.applications-matrix-baseline.html#applications',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#applicationList [id^="listapp-"]');
  const before=await page.locator('#applicationList').innerText();
  baselineErrors=[...errors];errors.length=0;
  await page.goto(base+'#applications',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#gn-app-matrix tbody tr');
  assert.equal(await page.locator('#applicationList').innerText(),before,'case explanations and controls unchanged');
  assert.equal(await page.locator('#gn-app-matrix').count(),1,'one overview only');
  assert.equal(await page.locator('#gn-app-matrix tbody tr').count(),8,'compact eight-row initial view');
  assert.equal(await page.locator('#gn-app-matrix input[type=checkbox]').count(),0,'ticks are not completion checkboxes');
  const data=await page.evaluate(()=>{
   const api=window.GnammaApplicationMatrix,b=JSON.parse(document.getElementById('editionData').textContent);
   return {groups:api.model.groups,rows:api.model.rows.map(r=>({id:r.id,refs:r.refs,cells:api.model.groups.map(g=>api.model.forGroup(r,g))})),apps:b.apps.map(a=>({id:a.id,n:a.n,also:a.also,text:a.text}))};
  });
  assert.equal(data.rows.length,28);assert.equal(data.groups.length,9);
  for(const row of data.rows){
   const app=data.apps.find(a=>a.id===row.id);
   const expected=new Set([app.n,...app.also]);
   for(const m of app.text.matchAll(/§{1,2}\s*\d+(?:(?:\s*,\s*(?:and\s+)?|\s*[–—-]\s*|\s+and\s+)\d+)*/g))for(const n of m[0].match(/\d+/g))expected.add(Number(n));
   assert.deepEqual(row.refs,[...expected].sort((a,b)=>a-b),row.id+' exactly the recorded references');
   assert.deepEqual(row.cells.flat().sort((a,b)=>a-b),row.refs,row.id+' every reference placed once');
  }
  assert.deepEqual(data.rows.find(r=>r.id==='B02').refs,[23,165,205]);
  assert.deepEqual(data.rows.find(r=>r.id==='B01').refs,[18,146,197,200,217]);
  await page.locator('[data-am-more]').click();assert.equal(await page.locator('[data-am-row]').count(),28);
  const expectedTicks=data.rows.reduce((total,r)=>total+r.cells.filter(c=>c.length).length,0);
  assert.equal(await page.locator('.am-tick').count(),expectedTicks,'one tick per recorded application/topic connection');
  // Filter controls and matrix use exactly the same existing application set.
  await page.selectOption('#applicationBook','Divorce');
  await page.waitForFunction(()=>document.querySelectorAll('[data-am-row]').length===4);
  assert.deepEqual(await page.locator('[data-am-row]').evaluateAll(els=>els.map(e=>e.dataset.amRow)),['B06','B18','B21','B24']);
  await page.fill('#applicationFilter','zz-no-matching-application-zz');
  await page.waitForFunction(()=>document.querySelectorAll('[data-am-row]').length===0);
  await page.fill('#applicationFilter','');await page.selectOption('#applicationBook','All books');
  await page.waitForFunction(()=>document.querySelectorAll('[data-am-row]').length===28);
  // Existing contextual navigation must return to the matrix, not a new route.
  await page.locator('#am-tick-B02-rulings').click();
  assert.match(await page.locator('#am-detail').innerText(),/§23/);
  await page.locator('#am-ref-B02-23').click();
  await page.waitForFunction(()=>location.hash.startsWith('#section=23'));
  await page.locator('[data-gn-source-back]').click();
  await page.waitForSelector('#am-ref-B02-23');
  assert.equal(new URL(page.url()).hash,'#applications');
  assert.equal(await page.locator('[data-am-row]').count(),28,'expanded state restored');
  assert.equal(await page.locator('#am-tick-B02-rulings').getAttribute('aria-expanded'),'true','selected cell restored');
  await page.locator('[data-am-close]').click();assert.equal(await page.locator('#am-detail').isVisible(),false);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'am-tick-B02-rulings');
  // A row label focuses the original explanation without replacing it.
  await page.locator('[data-am-case="B03"]').click();
  assert.equal(await page.evaluate(()=>document.activeElement.closest('[id^="listapp-"]')?.id),'listapp-B03');
  assert.equal(await page.locator('#applicationList').innerText(),before);
  await page.locator('#gn-app-matrix').scrollIntoViewIfNeeded();
  const geometry=await page.evaluate(()=>{
   const sc=document.querySelector('.am-scroll'),th=document.querySelector('#gn-app-matrix tbody th');
   const first=th.getBoundingClientRect().left;sc.scrollLeft=300;const second=th.getBoundingClientRect().left;
   return {viewport:innerWidth,bodyWidth:document.documentElement.scrollWidth,scrollWidth:sc.scrollWidth,clientWidth:sc.clientWidth,sticky:getComputedStyle(th).position,first,second};
  });
  assert.equal(geometry.sticky,'sticky');assert.ok(Math.abs(geometry.first-geometry.second)<2,'application labels remain fixed during horizontal scrolling');
  assert.ok(geometry.bodyWidth<=width+2,'matrix causes no page-width overflow');
  assert.ok(geometry.scrollWidth>geometry.clientWidth,'principles scroll within their own table');
  await page.screenshot({path:path.join(out,name+'.png'),fullPage:false});
  await page.locator('[data-am-more]').click();assert.equal(await page.locator('[data-am-row]').count(),8);
  await page.locator('#gn-app-matrix > summary').click();assert.equal(await page.locator('.am-scroll').isVisible(),false);
  await page.locator('#gn-app-matrix > summary').click();
  await page.evaluate(()=>{location.hash='#section=23';});await page.waitForFunction(()=>!document.getElementById('applicationList'));
  assert.equal(await page.locator('#gn-app-matrix').count(),0,'overview is confined to application view');
  const introduced=errors.filter(e=>!baselineErrors.includes(e));assert.deepEqual(introduced,[],'no newly introduced browser exceptions');
  const report={browser:name,status:'passed',applications:28,columns:data.groups.length,ticks:expectedTicks,geometry,checks:['source-derived reference coverage','unchanged application prose','compact and expanded views','existing filters and empty results','tick detail links','contextual return','case-label jumps','sticky mobile labels','no outer overflow','keyboard focus restoration','collapse control','Daruri application-view scope'],baselineBrowserExceptions:baselineErrors};
  results.push(report);console.log('PASS',JSON.stringify(report));
 }catch(error){
  await page.screenshot({path:path.join(out,name+'-failure.png'),fullPage:false}).catch(()=>{});
  console.error('FAIL',name,error.stack,'BROWSER_ERRORS',errors);throw error;
 }finally{await context.close();await browser.close();}
}
(async()=>{
 await run(chromium,1280);await run(chromium,390);await run(webkit,390);await run(webkit,320,true);
 const report={version:'20261110-matrix1',status:'passed',testedAt:new Date().toISOString(),results,physicalDeviceTest:false};
 fs.writeFileSync(path.join(root,'qa/applications-matrix-browser-report.json'),JSON.stringify(report,null,2)+'\n');
 console.log('ALL MATRIX CHECKS PASSED');
})().catch(error=>{process.exitCode=1;});
