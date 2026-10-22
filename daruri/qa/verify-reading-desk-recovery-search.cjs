'use strict';
/* Regression QA for mobile detail/list recovery, keyboard notes, and rapid search.
 * All data is synthetic, used on a loopback local server only.
 * Run: node daruri/qa/verify-reading-desk-recovery-search.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const relative=decodeURIComponent((req.url||'/').split('?')[0]);
 const resolved=path.resolve(ROOT,'.'+relative);
 if(!resolved.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(resolved)&&fs.statSync(resolved).isDirectory()?path.join(resolved,'index.html'):resolved;
 if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'content-type':MIME[path.extname(file)]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
const KEY='gnamma-reading-desk-v1';
const seed=[
 {id:'qa-personal-note',kind:'note',target:{kind:'paragraph',section:'1',segment:0,lang:'en'},title:'Navigation audit note',body:'Original private synthetic annotation',created:1761000000000,updated:1761000000000,dateSource:'recorded',deleted:0},
 {id:'qa-section',kind:'section',target:{kind:'section',section:'2'},created:1761000001000,updated:1761000001000,dateSource:'recorded',deleted:0},
 {id:'qa-quote',kind:'quote',target:{kind:'quote',section:'1',segment:0,lang:'en',quote:'according to our purpose'},created:1761000002000,updated:1761000002000,dateSource:'recorded',deleted:0}
];
const snapshot=async page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'{}'),KEY);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function mobileRecovery(browser,origin,name,mobile){
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1250,height:820},isMobile:mobile,hasTouch:mobile});
 await context.addInitScript(({key,data})=>{
  if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify({format:'gnamma-reading-desk',version:1,items:data}));
 },{key:KEY,data:seed});
 const page=await context.newPage();page.setDefaultTimeout(9000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(origin+'/daruri/#bookmarks',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('.gn-rd-page').waitFor();
  const row=()=>page.locator('.gn-rd-card').filter({hasText:'Navigation audit note'});
  await row().locator('[data-rd=select]').click();
  if(mobile)assert.equal(await page.locator('.gn-rd-mobile-detail-open').count(),1);
  await page.locator('#gn-rd-detail .gn-rd-item-more summary').click();
  await page.locator('#gn-rd-detail [data-rd=trash]').click();
  assert.equal((await snapshot(page)).items.find(x=>x.id==='qa-personal-note').deleted>0,true);
  // The selected note is now outside the active collection. NEVER leave only
  // an invisible list and a blank detail, especially on mobile.
  assert.equal(await page.locator('.gn-rd-mobile-detail-open').count(),0,'Deleted item trapped the mobile detail view');
  assert.equal(await page.locator('.gn-rd-cards').isVisible(),true,'Saved-item list was hidden after removing detail');
  assert.equal(await page.locator('.gn-rd-card').count(),2);
  await page.locator('[data-rd=undo]').click();
  assert.equal((await snapshot(page)).items.find(x=>x.id==='qa-personal-note').deleted,0);
  await row().locator('[data-rd=select]').click();
  await page.locator('#gn-rd-detail .gn-rd-item-more summary').click();
  await page.locator('#gn-rd-detail [data-rd=trash]').click();
  assert.equal(await page.locator('.gn-rd-mobile-detail-open').count(),0);
  await page.locator('.gn-rd-manage-menu summary').click();
  await page.locator('[data-rd=filter][data-value=bin]').click();
  await row().locator('[data-rd=select]').click();
  await page.locator('#gn-rd-detail [data-rd=restore]').click();
  assert.equal((await snapshot(page)).items.find(x=>x.id==='qa-personal-note').deleted,0);
  assert.equal(await page.locator('.gn-rd-mobile-detail-open').count(),0,'Restoring selected item trapped Bin detail view');
  const binReturn=page.locator('.gn-rd-scoped [data-value=all]');
  assert.equal(await binReturn.isVisible(),true,'No way to exit Bin after restoring the last item');
  await binReturn.click();
  assert.equal(await row().count(),1);
  assert.equal((await snapshot(page)).items.length,3,'Restore changed record count');
  assert.deepEqual(errors,[],'Reader JavaScript runtime errors');
  console.log('PASS '+name+' selected-item removal, Undo, Bin restoration, list recovery and user-data preservation');
 }finally{await context.close();}
}
async function fastSearch(browser,origin,name,mobile){
 const data=Array.from({length:1700},(_,i)=>({
  id:'qa-search-'+i,kind:'note',target:{kind:'section',section:String(i%230+1)},
  title:i===1600?'Arabic مصطلح unique research note':'Scholar note '+i,
  body:i===1600?'unique QA phrase connected to uṣūl':'Generic legal analysis '+i,
  created:1761000000000+i,updated:1761000000000+i,dateSource:'recorded',deleted:0
 }));
 const c=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},hasTouch:mobile,isMobile:mobile});
 await c.addInitScript(({data,key})=>{
  if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify({format:'gnamma-reading-desk',version:1,items:data}));
 },{data,key:KEY});
 const p=await c.newPage();p.setDefaultTimeout(12000);
 try{
  await p.goto(origin+'/daruri/#bookmarks',{waitUntil:'domcontentloaded',timeout:60000});
  await p.locator('.gn-rd-card').first().waitFor();
  const input=p.locator('#gn-rd-query');
  await input.click();const before=Date.now();
  await p.keyboard.type('مصطلح',{delay:0});
  const keystrokeTime=Date.now()-before;
  assert.equal(await input.inputValue(),'مصطلح','Lost Arabic search characters');
  await p.waitForFunction(()=>document.querySelectorAll('.gn-rd-card').length===1,null,{timeout:3000});
  const result=await p.locator('.gn-rd-card').first().innerText();
  assert(result.includes('مصطلح'),'Search did not find intended Arabic note');
  assert.equal(await p.evaluate(()=>document.activeElement?.id),'gn-rd-query','Search input lost keyboard focus');
  await input.fill('xyz123-no-such-item');
  await p.waitForFunction(()=>document.querySelectorAll('.gn-rd-card').length===0,null,{timeout:3000});
  await input.fill('');
  await p.waitForFunction(()=>document.querySelectorAll('.gn-rd-card').length===1700,null,{timeout:4000});
  assert.equal((await snapshot(p)).items.length,1700,'Filtering touched the stored collection');
  console.log('PASS '+name+' Arabic query, focus, empty-state, clearing and storage; entry='+keystrokeTime+'ms');
 }finally{await c.close();}
}
async function keyboardEditor(browser,origin,name){
 const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await c.addInitScript(({key,data})=>{if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify({format:'gnamma-reading-desk',version:1,items:data}));},{key:KEY,data:seed});
 const p=await c.newPage();
 try{
  await p.goto(origin+'/daruri/#bookmarks',{waitUntil:'domcontentloaded'});
  const newNote=p.locator('[data-rd=new-note]');await newNote.focus();await p.keyboard.press('Enter');
  assert.equal(await p.locator('#gn-rd-editor-shade [role=dialog]').count(),1);
  assert.equal(await p.evaluate(()=>document.activeElement.id),'gn-rd-note-body');
  await p.keyboard.press('Escape');
  assert.equal(await p.locator('#gn-rd-editor-shade').count(),0);
  assert.equal(await p.evaluate(()=>document.activeElement?.dataset.rd),'new-note');
  console.log('PASS '+name+' keyboard note editor Escape and focus restoration');
 }finally{await c.close();}
}
async function main(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 try{
  await testBrowser(chromium,'Chromium',origin);
  await testBrowser(webkit,'WebKit',origin);
 }finally{await new Promise(resolve=>server.close(resolve));}
}
async function testBrowser(engine,name,origin){
 const browser=await engine.launch({headless:true,...(name==='Chromium'?{args:['--no-sandbox']}:{})});
 try{
  await mobileRecovery(browser,origin,name+' desktop',false);
  await mobileRecovery(browser,origin,name+' mobile',true);
  await fastSearch(browser,origin,name+' mobile',true);
  await keyboardEditor(browser,origin,name+' mobile');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e.stack);process.exitCode=1});
