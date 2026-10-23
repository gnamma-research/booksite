const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const BASE=process.env.GNAMMA_QA_BASE_URL||'http://127.0.0.1:8898/daruri/';
const data={format:'gnamma-reading-desk',version:1,items:[
{id:'qa-bookmark-5',kind:'section',target:{kind:'section',section:'5'},created:1761000000000,updated:1761000000000,deleted:0,dateSource:'recorded'},
{id:'qa-personal-5',kind:'note',target:{kind:'paragraph',section:'5',segment:0,lang:'en'},title:'QA premise note',body:'This is a scholarly draft across devices.',created:1761000000000,updated:1761000000000,deleted:0,dateSource:'recorded'},
{id:'qa-highlight-5',kind:'quote',target:{kind:'quote',section:'5',segment:0,quote:'a text',lang:'en'},created:1761000000000,updated:1761000000000,deleted:0,dateSource:'recorded'},
{id:'qa-bin-7',kind:'section',target:{kind:'section',section:'7'},created:1761000000000,updated:1761000000000,deleted:1762000000000,dateSource:'recorded'}
]};
const results=[],logs=[];
const test=async(name,fn)=>{try{const x=await fn();results.push({name,result:'PASS'});console.log('PASS',name,x||'')}catch(e){results.push({name,result:'FAIL',reason:e.message.slice(0,600)});console.log('FAIL',name,e.message.slice(0,450));}};
(async()=>{
const b=await chromium.launch({headless:true,args:['--no-sandbox']});
const c=await b.newContext({viewport:{width:1200,height:850},acceptDownloads:true});
await c.addInitScript(({data})=>{
 localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify(data));
 localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'5',lang:'parallel',theme:'light',fontScale:1.15,palette:'zellij'}));
},{data});
const p=await c.newPage();p.setDefaultTimeout(3500);p.on('pageerror',e=>logs.push(e.message));
await p.goto(BASE+'#section=5',{waitUntil:'domcontentloaded',timeout:40000});
await p.waitForTimeout(200);
await test('Reading Desk Manage contains only compact transfer entry',async()=>{
 await p.goto(BASE+'#bookmarks',{waitUntil:'domcontentloaded'});
 await p.locator('.gn-rd-page').waitFor();
 await p.locator('.gn-rd-manage-menu summary').click();
 const menu=await p.locator('.gn-rd-manage-items').innerText();
 assert(menu.includes('Backup & Transfer'));
 assert(menu.includes('Export readable notes'));
 assert(menu.includes('Open Bin'));
 assert(!menu.includes('Import backup (.json)')&&!menu.includes('Download backup (.json)'));
 await p.locator('[data-rd=backup-transfer]').click();
 assert.equal(await p.locator('#gn-transfer-shade [role=dialog]').count(),1);
 const copy=await p.locator('#gn-transfer-content').innerText();
 assert(copy.includes('Current reading place')&&copy.includes('§5'));
 assert(copy.includes('Google Drive transfer is not enabled'));
});
let json;
await test('Backup exports existing Reading Desk data and reading metadata',async()=>{
 const download=p.waitForEvent('download');
 await p.locator('[data-transfer=download]').click();
 const d=await download;
 const save=require('node:path').join(require('node:os').tmpdir(),'qa-backup-transfer-export-'+process.pid+'.json');await d.saveAs(save);
 json=JSON.parse(fs.readFileSync(save,'utf8'));
 assert.equal(json.format,'gnamma-reading-desk');assert.equal(json.version,1);
 assert.equal(json.items.length,4);assert.equal(json.gnammaBackup.readingPlace.section,'5');
 assert.equal(json.gnammaBackup.appearance.palette,'zellij');
 assert(json.gnammaBackup.createdAt);
 return d.suggestedFilename();
});
await test('Transfer dialog Escape restores Manage focus',async()=>{
 await p.keyboard.press('Escape');
 assert.equal(await p.locator('#gn-transfer-shade').count(),0);
 assert.equal(await p.evaluate(()=>document.activeElement?.matches('.gn-rd-manage-menu summary')),true);
});
await c.close();
const target=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true});
await target.addInitScript(()=>{
 localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify({format:'gnamma-reading-desk',version:1,items:[{id:'existing-10',kind:'section',target:{kind:'section',section:'10'},created:1761000000000,updated:1761000000000,deleted:0,dateSource:'recorded'}]}));
 localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'10',theme:'dark',palette:'cordoba',lang:'english'}));
});
const q=await target.newPage();q.setDefaultTimeout(4500);q.on('pageerror',e=>logs.push(e.message));
await q.goto(BASE+'#bookmarks',{waitUntil:'domcontentloaded',timeout:40000});
await q.locator('.gn-rd-page').waitFor();
async function showModal(){
 const manage=q.locator('.gn-rd-manage-menu summary');
 await manage.click();await q.locator('[data-rd=backup-transfer]').click();await q.locator('#gn-transfer-shade').waitFor();
}
await test('Import file review exposes categories and defaults without modifying storage',async()=>{
 await showModal();
 await q.locator('[data-transfer=choose-file]').click();
 const input=q.locator('body > input[aria-label="Choose Gnamma Reading Desk backup"]');
 await input.setInputFiles({name:'QA-original.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(json))});
 await q.getByText('Choose what to restore').waitFor();
 assert.equal(await q.locator('[data-transfer-choice=bookmarks]').isChecked(),true);
 assert.equal(await q.locator('[data-transfer-choice=notes]').isChecked(),true);
 assert.equal(await q.locator('[data-transfer-choice=highlights]').isChecked(),true);
 assert.equal(await q.locator('[data-transfer-choice=place]').isChecked(),true);
 assert.equal(await q.locator('[data-transfer-choice=appearance]').isChecked(),false);
 const state=await q.evaluate(()=>JSON.parse(localStorage.getItem('daruri-reader-v2')));
 assert.equal(state.n,'10');assert.equal(state.theme,'dark');
 const desks=await q.evaluate(()=>JSON.parse(localStorage.getItem('gnamma-reading-desk-v1')).items);
 assert.equal(desks.length,1);
});
await test('Restore selected categories merges notes and preserves §10 without changing theme',async()=>{
 await q.locator('[data-transfer=restore]').click();
 await q.getByText('Reading data restored').waitFor();
 const read=await q.evaluate(()=>({
  reader:JSON.parse(localStorage.getItem('daruri-reader-v2')),
  place:JSON.parse(localStorage.getItem('gnamma-restored-reading-place-v1')),
  desk:JSON.parse(localStorage.getItem('gnamma-reading-desk-v1'))
 }));
 assert.equal(read.reader.n,'10');assert.equal(read.reader.theme,'dark');
 assert.equal(read.desk.items.length,5);
 assert.equal(read.place.restored.section,'5');
 assert.match(await q.locator('.gn-transfer-compare').innerText(),/§10[\s\S]*unchanged[\s\S]*§5/);
});
await test('Not now preserves existing section and keeps restore suggestion for later',async()=>{
 await q.locator('[data-transfer=not-now]').click();
 assert.equal(await q.locator('#gn-transfer-shade').count(),0);
 assert.equal((await q.evaluate(()=>JSON.parse(localStorage.getItem('daruri-reader-v2')))).n,'10');
 await showModal();
 assert.match(await q.locator('.gn-transfer-place').innerText(),/§5/);
});
await test('Explicit Resume navigates §5 and preserves §10 as return location',async()=>{
 await q.locator('[data-transfer=resume]').click();
 await q.waitForTimeout(280);
 assert(new URL(q.url()).hash.startsWith('#section=5'));
 assert.equal((await q.evaluate(()=>JSON.parse(localStorage.getItem('daruri-reader-v2')))).n,'5');
 const saved=await q.evaluate(()=>JSON.parse(localStorage.getItem('gnamma-restored-reading-place-v1')));
 assert.equal(saved.previous.section,'10');
});
await test('Return to previous §10 works and recovery metadata survives',async()=>{
 await q.goto(BASE+'#bookmarks',{waitUntil:'domcontentloaded'});await q.waitForTimeout(160);
 await showModal();
 assert.match(await q.locator('.gn-transfer-return').innerText(),/§10/);
 await q.locator('[data-transfer=return-previous]').click();await q.waitForTimeout(260);
 assert(new URL(q.url()).hash.startsWith('#section=10'));
});
await test('Selective restore of location only does not import notes',async()=>{
 await q.goto(BASE+'#bookmarks',{waitUntil:'domcontentloaded'});await q.waitForTimeout(150);await showModal();
 await q.locator('[data-transfer=choose-file]').click();
 await q.locator('body > input[aria-label="Choose Gnamma Reading Desk backup"]').setInputFiles({name:'Backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...json,items:[{...json.items[1],id:'not-imported-note'}]}))});
 await q.locator('[data-transfer-choice=notes]').uncheck();
 await q.locator('[data-transfer-choice=bookmarks]').uncheck();
 await q.locator('[data-transfer-choice=highlights]').uncheck();
 await q.locator('[data-transfer=restore]').click();
 const read=await q.evaluate(()=>JSON.parse(localStorage.getItem('gnamma-reading-desk-v1')).items);
 assert.equal(read.some(x=>x.id==='not-imported-note'),false);
 assert.equal((await q.evaluate(()=>JSON.parse(localStorage.getItem('daruri-reader-v2')))).n,'10');
});
await test('Legacy reading desk backup has no false restore location',async()=>{
 await q.locator('[data-transfer=not-now]').click();
 await showModal();await q.locator('[data-transfer=choose-file]').click();
 await q.locator('body > input[aria-label="Choose Gnamma Reading Desk backup"]').setInputFiles({name:'Legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
 await q.getByText('Choose what to restore').waitFor();
 const text=await q.locator('#gn-transfer-content').innerText();
 assert(text.includes('does not contain a reading place'));
 assert.equal(await q.locator('[data-transfer-choice=place]').count(),0);
});
await test('No browser JavaScript exceptions',async()=>{assert.equal(logs.length,0,JSON.stringify(logs.slice(0,4)))});
await target.close();await b.close();
console.log('RESULT',results.filter(x=>x.result==='PASS').length+'/'+results.length);
if(results.some(x=>x.result==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error('FATAL',e.stack);process.exitCode=2});
