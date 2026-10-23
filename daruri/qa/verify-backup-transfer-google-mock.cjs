const {chromium}=require('playwright'),assert=require('node:assert/strict');
const BASE=process.env.GNAMMA_QA_BASE_URL||'http://127.0.0.1:8898/daruri/';
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const ctx=await browser.newContext({viewport:{width:1200,height:830}});
await ctx.addInitScript(()=>{window.GnammaDriveConfig={clientId:'12345-qa.apps.googleusercontent.com'};localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'10',theme:'light'}));});
let uploads=0,stored=null,listing=0,requests=[];
await ctx.route('https://accounts.google.com/gsi/client',async route=>{
 await route.fulfill({status:200,contentType:'text/javascript',body:'window.google={accounts:{oauth2:{initTokenClient:function(c){return {callback:c.callback,requestAccessToken:function(){this.callback({access_token:"qa-fake-token",expires_in:3600});}}}}}};'});
});
await ctx.route('https://www.googleapis.com/**',async route=>{
 const request=route.request(),url=new URL(request.url()),path=url.pathname,method=request.method();
 requests.push({method,path,query:url.search,authorization:request.headers().authorization});
 const reply=(obj)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(obj),headers:{'Access-Control-Allow-Origin':'*'}});
 if(path==='/drive/v3/files'&&method==='GET'){
  if(url.searchParams.get('q').includes('Gnamma Backups')){
   return reply({files:listing?[{id:'folder-12345',name:'Gnamma Backups'}]:[]});
  }
  return reply({files:stored?[{id:'file-12345',name:'Gnamma-Daruri-2026-10-23T00-00-00.json',createdTime:'2026-10-23T00:00:00Z',size:String(stored.length)}]:[]});
 }
 if(path==='/drive/v3/files'&&method==='POST'){listing++;return reply({id:'folder-12345',name:'Gnamma Backups'});}
 if(path==='/upload/drive/v3/files'&&method==='POST'){
  const payload=request.postData();
  assert(payload.includes('Gnamma-Daruri')&&payload.includes('gnammaBackup'));
  const parts=payload.split('Content-Type: application/json; charset=UTF-8\r\n\r\n');
  const jsonString=parts[2]?.split('\r\n--gnamma_')[0];
  assert(jsonString,'missing backup MIME part');
  const parsed=JSON.parse(jsonString);assert.equal(parsed.gnammaBackup.readingPlace.section,'10');
  stored=jsonString;uploads++;return reply({id:'file-12345',name:'Gnamma-Daruri-2026-10-23T00-00-00.json',createdTime:'2026-10-23T00:00:00Z'});
 }
 if(path==='/drive/v3/files/file-12345'&&method==='GET'){
  return route.fulfill({status:200,contentType:'application/json',body:stored});
 }
 return route.fulfill({status:404,contentType:'application/json',body:JSON.stringify({error:{message:'Unmocked '+method+' '+path}})});
});
const p=await ctx.newPage();p.setDefaultTimeout(4000);
let errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(BASE+'#bookmarks',{waitUntil:'domcontentloaded'});await p.waitForTimeout(350);
await p.locator('.gn-rd-manage-menu summary').click();await p.locator('[data-rd=backup-transfer]').click();
await p.getByRole('button',{name:/Back up to Google Drive/}).waitFor();
await p.waitForFunction(()=>window.google?.accounts?.oauth2);
console.log('GOOGLE CONFIG PREPARED',await p.evaluate(()=>window.GnammaDriveConfig?.clientId));
await p.getByRole('button',{name:/Back up to Google Drive/}).click();
await p.getByText(/Google Drive backup created/).waitFor({timeout:5500});
console.log('UPLOAD',uploads,'requests',requests.length);
await p.getByRole('button',{name:/Restore from Google Drive/}).click();
await p.getByRole('button',{name:/Gnamma-Daruri-2026-10-23T00-00-00.json/}).waitFor({timeout:5000});
await p.locator('[data-transfer=google-fetch]').click();
await p.getByText('Choose what to restore').waitFor();
console.log('DOWNLOAD REVIEW',await p.locator('.gn-transfer-stats').innerText());
await p.locator('[data-transfer=restore]').click();
await p.getByText('Reading data restored').waitFor();
const state=await p.evaluate(()=>JSON.parse(localStorage.getItem('daruri-reader-v2')).n);
assert.equal(state,'10');assert.equal(uploads,1);
assert(requests.every(x=>x.authorization==='Bearer qa-fake-token'));
assert.equal(errors.length,0,errors.join(';'));
console.log('PASS Google Drive upload and restore mocked; no background access, location unchanged');
await ctx.close();await browser.close();
})().catch(e=>{console.error('FAIL',e.stack);process.exit(1)});
