/* Gnamma Backup & Transfer.
 * Deliberate, user-initiated exports and imports only. No background uploads.
 * This is separate from the private Reading Desk's local data store.
 */
(function(){
'use strict';
const FORMAT='gnamma-reading-desk', VERSION=1, MAX_BYTES=12*1024*1024;
const PLACE_KEY='gnamma-restored-reading-place-v1';
const PROGRESS_KEY='gnamma-current-reading-progress-v1';
const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.file';
const DRIVE_FOLDER='Gnamma Backups';
const ALLOWED_PREFS={
 lang:['parallel','english','arabic'],theme:['system','light','dark'],
 palette:['almohad','cordoba','nasrid','zellij','gnamma','gnamma-air'],
 arabicFont:['amiri','scheherazade','noto'],
 englishFont:['original','source-serif','literata'],pageStyle:['quiet','book','structured'],
 parallelArabicSide:['left','right'],stackedArabicOrder:['top','bottom']
};
let ctx=null,root=null,returnFocus=null,imported=null,sourceTitle='',fileInput=null;
let gisReady=null,tokenClient=null,accessToken='',tokenExpiry=0,googleReady=false,busy=false;
const $=sel=>document.querySelector(sel);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readJSON(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch(_){return null;}}
function writeJSON(key,value){localStorage.setItem(key,JSON.stringify(value));}
function validLocation(value){
 if(!value||typeof value!=='object')return null;
 if(value.work&&value.work!=='daruri')return null;
 const section=String(value.section||'');
 if(!/^[0-9]{1,4}$/.test(section)||!ctx?.sections.has(section))return null;
 const raw=value.segment;
 const max=ctx.sections.get(section)?.segments?.length||0;
 let segment=null;
 if(raw!==null&&raw!==undefined&&raw!==''){
  const n=Number(raw);if(Number.isInteger(n)&&n>=0&&n<max)segment=n;
 }
 return {work:'daruri',section,segment,at:Number(value.at)||Date.now()};
}
function labelLocation(place){
 if(!place)return 'No saved place';
 return '§'+place.section+(place.segment!==null&&place.segment!==undefined?' · paragraph '+(place.segment+1):'');
}
function currentAnchor(){
 const y=innerHeight*.38;
 const grids=[...document.querySelectorAll('#reader .passage-grid')].filter(el=>{
  const rect=el.getBoundingClientRect();
  return rect.height>0&&rect.bottom>90&&rect.top<innerHeight;
 });
 if(!grids.length)return null;
 grids.sort((a,b)=>Math.abs(a.getBoundingClientRect().top-y)-Math.abs(b.getBoundingClientRect().top-y));
 const grid=grids[0],section=grid.closest('[data-reading-section]')?.dataset.readingSection||ctx.state.n;
 return validLocation({section,segment:grid.dataset.segment,at:Date.now()});
}
function snapshotLocation(){
 if(ctx.state.route==='reader'){
  const active=currentAnchor();
  if(active)return active;
 }
 const last=readJSON(PROGRESS_KEY);
 if(last&&String(last.section)===String(ctx.state.n)){
  const saved=validLocation(last);if(saved)return saved;
 }
 return validLocation({section:ctx.state.n,segment:null,at:Date.now()});
}
function saveProgress(){
 if(ctx?.state?.route!=='reader'||root)return;
 const place=currentAnchor()||validLocation({section:ctx.state.n,at:Date.now()});
 if(place){try{writeJSON(PROGRESS_KEY,place);}catch(_){}}
}
function snapshotAppearance(){
 const prefs=readJSON('daruri-reader-v2')||{};
 const result={};
 for(const [key,options] of Object.entries(ALLOWED_PREFS)){
  const value=ctx.state[key]??prefs[key];
  if(options.includes(value))result[key]=value;
 }
 result.vowels=ctx.state.vowels!==false;
 const font=Number(ctx.state.fontScale||prefs.fontScale);
 if(Number.isFinite(font)&&font>=.6&&font<=2.5)result.fontScale=font;
 return result;
}
function validAppearance(value){
 const result={};if(!value||typeof value!=='object')return result;
 for(const [key,options] of Object.entries(ALLOWED_PREFS)){
  if(options.includes(value[key]))result[key]=value[key];
 }
 if(typeof value.vowels==='boolean')result.vowels=value.vowels;
 if(Number.isFinite(Number(value.fontScale))&&Number(value.fontScale)>=.6&&Number(value.fontScale)<=2.5)
  result.fontScale=Number(value.fontScale);
 return result;
}
function createBackup(){
 const data=JSON.parse(ctx.rd.backup());
 if(data.format!==FORMAT||data.version!==VERSION||!Array.isArray(data.items))
  throw Error('Reading Desk data is unavailable. Download the original recovery data instead.');
 data.gnammaBackup={
  schema:1,createdAt:new Date().toISOString(),origin:'Darūrī reader',
  readingPlace:snapshotLocation(),appearance:snapshotAppearance()
 };
 return data;
}
function backupFilename(){
 return 'Gnamma-Daruri-'+new Date().toISOString().replace(/[.:]/g,'-').slice(0,19)+'.json';
}
function fileBlob(){const data=JSON.stringify(createBackup(),null,2);return {data,name:backupFilename(),size:new Blob([data]).size};}
function configClientId(){
 return String(window.GnammaDriveConfig?.clientId||'').trim();
}
function clientConfigured(){return /^[\w-]+\.apps\.googleusercontent\.com$/.test(configClientId());}
function setNotice(message,error=false){
 const el=root?.querySelector('#gn-transfer-notice');if(!el)return;
 el.textContent=message||'';el.hidden=!message;el.classList.toggle('is-error',Boolean(error));
}
function buttonsBusy(value){
 busy=Boolean(value);
 root?.querySelectorAll('button[data-transfer]').forEach(btn=>{if(btn.dataset.transfer!=='close')btn.disabled=busy;});
}
function dialogShell(){
 const overlay=document.createElement('div');
 overlay.className='gn-transfer-shade';overlay.id='gn-transfer-shade';
 overlay.innerHTML='<section class="gn-transfer-dialog" role="dialog" aria-modal="true" aria-labelledby="gn-transfer-heading" tabindex="-1">'+
  '<header class="gn-transfer-header"><div><p>PRIVATE READING DATA</p><h2 id="gn-transfer-heading">Backup &amp; Transfer</h2></div>'+
  '<button type="button" data-transfer="close" class="gn-transfer-close" aria-label="Close Backup & Transfer">×</button></header>'+
  '<div id="gn-transfer-content" class="gn-transfer-content"></div>'+
  '<p id="gn-transfer-notice" class="gn-transfer-notice" role="status" aria-live="polite" hidden></p>'+
  '</section>';
 return overlay;
}
function open(){
 if(root){root.querySelector('.gn-transfer-dialog')?.focus();return;}
 returnFocus=document.activeElement;root=dialogShell();document.body.append(root);
 document.body.classList.add('gn-transfer-open');renderHome();
 root.querySelector('.gn-transfer-dialog')?.focus({preventScroll:true});
 if(clientConfigured())void loadGoogleLibrary();
}
function close(){
 if(!root)return;
 const el=root;root=null;imported=null;busy=false;el.remove();
 document.body.classList.remove('gn-transfer-open');
 const closedMenu=returnFocus?.closest?.('details:not([open])');
 const target=closedMenu?.querySelector('summary')||returnFocus;
 if(target?.isConnected&&target.getClientRects().length)target.focus({preventScroll:true});
 else document.querySelector('.gn-rd-manage-menu summary')?.focus({preventScroll:true});
 returnFocus=null;
}
function header(text){const title=$('#gn-transfer-heading');if(title)title.textContent=text;}
function restored(){const state=readJSON(PLACE_KEY);return {restored:validLocation(state?.restored),previous:validLocation(state?.previous)};}
function renderHome(){
 if(!root)return;header('Backup & Transfer');const content=root.querySelector('#gn-transfer-content');
 const place=snapshotLocation(),state=restored(),configured=clientConfigured();
 content.innerHTML=
  '<p class="gn-transfer-lead">Your bookmarks and notes save automatically <strong>on this device</strong>. Backups are created only when you choose.</p>'+
  '<div class="gn-transfer-current"><span>Current reading place</span><strong>'+esc(labelLocation(place))+'</strong></div>'+
  (state.restored?'<section class="gn-transfer-place"><div><small>READING PLACE FROM A BACKUP</small><strong>'+esc(labelLocation(state.restored))+'</strong></div>'+
   '<button type="button" data-transfer="resume">Resume there</button><button type="button" data-transfer="forget-restored">Dismiss</button></section>':'')+
  (state.previous?'<div class="gn-transfer-return"><span>Previous reading place: '+esc(labelLocation(state.previous))+'</span><button type="button" data-transfer="return-previous">Return</button></div>':'')+
  '<section class="gn-transfer-options" aria-label="Backup file actions">'+
   '<h3>Backup file</h3>'+
   '<button type="button" data-transfer="download"><span>Download complete backup</span><small>Bookmarks, highlights, notes and reading place</small></button>'+
   '<button type="button" data-transfer="share"><span>Share complete backup</span><small>Use Files, AirDrop or another sharing app</small></button>'+
   '<button type="button" data-transfer="choose-file"><span>Import a backup file</span><small>Review the contents before merging</small></button>'+
   '</section>'+
  '<section class="gn-transfer-options" aria-label="Google Drive actions">'+
   '<h3>Google Drive</h3>'+
   (configured?
    '<button type="button" data-transfer="google-save"><span>Back up to Google Drive</span><small>Create a dated copy in your own Drive</small></button>'+
    '<button type="button" data-transfer="google-list"><span>Restore from Google Drive</span><small>Select a backup to review</small></button>':
    '<p class="gn-transfer-muted">Google Drive transfer is not enabled on this website yet. File backup and import work without Google.</p>')+
   '</section>'+
  '<p class="gn-transfer-footnote">This is a manual transfer, not continuous synchronisation. Older Reading Desk JSON backups can still be imported.</p>';
 if(configured&&!googleReady)setNotice('Preparing Google Drive connection…');
 else setNotice('');
}
function classify(r){return r?.kind==='note'?'notes':r?.kind==='quote'?'highlights':'bookmarks';}
function validateBackup(data){
 if(data?.format!==FORMAT||data.version!==VERSION||!Array.isArray(data.items))
  throw Error('This is not a supported Gnamma Reading Desk backup.');
 if(data.items.length>20000)throw Error('The backup has more than 20,000 items.');
 let counts={notes:0,bookmarks:0,highlights:0};
 for(const row of data.items)counts[classify(row)]++;
 const place=validLocation(data?.gnammaBackup?.readingPlace||data?.reading?.location);
 const appearance=validAppearance(data?.gnammaBackup?.appearance||data?.reading?.appearance);
 return {counts,place,appearance};
}
async function reviewFile(file){
 if(!file)return;
 if(file.size>MAX_BYTES){setNotice('File exceeds the 12 MB import limit. Nothing has changed.',true);return;}
 try{
  const data=JSON.parse(await file.text());
  review(data,file.name);
 }catch(e){setNotice('Cannot read that backup: '+String(e.message).slice(0,140),true);}
}
function review(data,label){
 if(!root)open();
 try{
  const info=validateBackup(data);
  imported={data,info};sourceTitle=String(label||'Backup').slice(0,160);
  renderPreview();
 }catch(e){setNotice(String(e.message).slice(0,160),true);}
}
function renderPreview(){
 if(!root||!imported)return;
 header('Restore a backup');const {counts,place,appearance}=imported.info;
 const content=root.querySelector('#gn-transfer-content');
 const appearanceAvailable=Object.keys(appearance).length>0;
 content.innerHTML=
  '<p class="gn-transfer-lead">Review <strong>'+esc(sourceTitle)+'</strong> before restoring. Existing saved material is kept; the current reading place will not change.</p>'+
  '<div class="gn-transfer-stats"><span><strong>'+counts.bookmarks+'</strong> bookmarks</span><span><strong>'+counts.highlights+'</strong> highlights</span><span><strong>'+counts.notes+'</strong> notes</span></div>'+
  '<fieldset class="gn-transfer-choices"><legend>Choose what to restore</legend>'+
   '<label><input type="checkbox" data-transfer-choice="bookmarks" checked> Bookmarks and source references</label>'+
   '<label><input type="checkbox" data-transfer-choice="highlights" checked> Highlights</label>'+
   '<label><input type="checkbox" data-transfer-choice="notes" checked> Personal notes</label>'+
   (place?'<label><input type="checkbox" data-transfer-choice="place" checked> Offer reading place '+esc(labelLocation(place))+' after restoring</label>':
    '<p class="gn-transfer-muted">This backup does not contain a reading place.</p>')+
   (appearanceAvailable?'<label><input type="checkbox" data-transfer-choice="appearance"> Appearance and language preferences (this device)</label>':'')+
  '</fieldset>'+
  '<p class="gn-transfer-warning">Notes are merged, not replaced. Conflicting versions are retained where needed. Importing a saved reading place does not move the current reader.</p>'+
  '<div class="gn-transfer-actions"><button type="button" data-transfer="home">Cancel</button><button type="button" class="gn-transfer-primary" data-transfer="restore">Restore selected</button></div>';
 setNotice('');
}
function picked(){
 const value=id=>Boolean(root?.querySelector('[data-transfer-choice="'+id+'"]')?.checked);
 return {bookmarks:value('bookmarks'),highlights:value('highlights'),notes:value('notes'),place:value('place'),appearance:value('appearance')};
}
function restoreSelection(){
 if(!imported||busy)return;
 const choice=picked(),{data,info}=imported;
 if(!Object.values(choice).some(Boolean)){setNotice('Select at least one type of information.',true);return;}
 const devicePlace=snapshotLocation();
 let report;
 try{report=ctx.rd.importParsed(data,choice);}
 catch(e){setNotice('Restoration was not saved: '+String(e.message).slice(0,130),true);return;}
 const warnings=[];
 let savedPlace=null;
 if(choice.place&&info.place){
  try{writeJSON(PLACE_KEY,{restored:info.place,previous:restored().previous});savedPlace=info.place;}
  catch(_){warnings.push('The reading-place suggestion could not be stored.');}
 }
 if(choice.appearance){
  try{
   Object.assign(ctx.state,info.appearance);
   ctx.savePrefs();ctx.applyPrefs();
  }catch(_){warnings.push('Some appearance preferences could not be applied.');}
 }
 renderReceipt(report,devicePlace,savedPlace);
 if(warnings.length)setNotice('Notes were merged, but '+warnings.join(' '),true);
}
function renderReceipt(result,devicePlace,backupPlace){
 imported=null;header('Backup restored');
 const content=root.querySelector('#gn-transfer-content');
 content.innerHTML='<div class="gn-transfer-success"><strong>Reading data restored</strong>'+
  '<p>'+result.changes+' saved items merged. Existing and newer information was preserved.</p></div>'+
  '<dl class="gn-transfer-compare"><dt>Current device reading place</dt><dd>'+esc(labelLocation(devicePlace))+' — unchanged</dd>'+
   '<dt>Backup reading place</dt><dd>'+esc(labelLocation(backupPlace))+'</dd></dl>'+
  (backupPlace?
   '<div class="gn-transfer-actions"><button type="button" data-transfer="not-now">Not now</button>'+
    '<button type="button" class="gn-transfer-primary" data-transfer="resume">Resume at '+esc(labelLocation(backupPlace))+'</button></div>':
   '<div class="gn-transfer-actions"><button type="button" data-transfer="close">Done</button></div>');
 setNotice('');
}
async function share(){
 try{
  const data=fileBlob();
  // Exports must never be blocked by the importer's safety limit.
  // The user can keep the complete JSON even if this version cannot re-import it.
  const file=typeof File==='function'?new File([data.data],data.name,{type:'application/json'}):null;
  if(file&&navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
   try{await navigator.share({files:[file],title:'Gnamma reading backup'});
    setNotice('Backup shared using your device.');return;}
   catch(e){if(e?.name==='AbortError')return;}
  }
  ctx.rd.downloadBackup(data.data,data.name);
  setNotice('File sharing is unavailable here. A JSON backup was prepared for download.');
 }catch(e){setNotice('Could not share the backup: '+String(e.message).slice(0,130),true);}
}
function chooseFile(){
 if(!fileInput){
  fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='.json,application/json';
  fileInput.hidden=true;fileInput.setAttribute('aria-label','Choose Gnamma Reading Desk backup');
  fileInput.addEventListener('change',()=>{const chosen=fileInput.files?.[0];fileInput.value='';if(chosen)void reviewFile(chosen);});
  document.body.append(fileInput);
 }
 fileInput.click();
}
function download(){
 try{
  const file=fileBlob();
  ctx.rd.downloadBackup(file.data,file.name);
  setNotice(file.size>MAX_BYTES?
   'Complete backup downloaded. This reader can import files up to 12 MB.':
   'Backup prepared for download. Keep the JSON file somewhere safe.');
 }catch(e){setNotice('Unable to create a backup: '+String(e.message).slice(0,135),true);}
}
function resume(place,which){
 if(!place)return;
 const current=snapshotLocation();
 try{
  if(which==='restored'){
   writeJSON(PLACE_KEY,{restored:place,previous:current,at:Date.now()});
  }else if(which==='previous'){
   const data=readJSON(PLACE_KEY)||{};
   writeJSON(PLACE_KEY,{restored:data.restored||null,previous:current,at:Date.now()});
  }
 }catch(e){setNotice('Cannot preserve the previous reading place; resume cancelled.',true);return;}
 close();
 ctx.goSection(place.section);
 if(place.segment!==null){
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const sectionRoot=document.querySelector('#gn-continuous-'+CSS.escape(place.section))||$('#reader');
   const grid=sectionRoot?.querySelector('.passage-grid[data-segment="'+place.segment+'"]');
   if(grid)grid.scrollIntoView({block:'center',behavior:'instant'});
  }));
 }
}
function forgetRestored(){
 const old=readJSON(PLACE_KEY)||{};
 try{writeJSON(PLACE_KEY,{previous:old.previous||null});renderHome();}
 catch(_){setNotice('Could not update your local reading-place suggestion.',true);}
}
function renderDriveFiles(rows){
 if(!root)return;
 header('Restore from Google Drive');
 const items=rows.slice(0,40).map(row=>
  '<button type="button" class="gn-transfer-drive-file" data-transfer="google-fetch" data-file-id="'+esc(row.id)+'">'+
  '<strong>'+esc(row.name)+'</strong><small>'+esc(row.createdTime?new Date(row.createdTime).toLocaleString():'Saved backup')+'</small></button>').join('');
 root.querySelector('#gn-transfer-content').innerHTML='<p class="gn-transfer-lead">Choose a dated backup from your own Google Drive. Nothing is imported until you review and confirm.</p>'+
  (items||'<p class="gn-transfer-muted">No Gnamma backups found in this account.</p>')+
  '<div class="gn-transfer-actions"><button data-transfer="home" type="button">Back</button></div>';
 setNotice('');
}
function loadGoogleLibrary(){
 if(window.google?.accounts?.oauth2){googleReady=true;return Promise.resolve();}
 if(gisReady)return gisReady;
 gisReady=new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src='https://accounts.google.com/gsi/client';script.async=true;
  script.onload=()=>{if(!window.google?.accounts?.oauth2)return reject(Error('Google authorisation did not load'));googleReady=true;resolve();};
  script.onerror=()=>reject(Error('Google sign-in could not load. Try again when online.'));
  document.head.append(script);
 }).then(()=>{if(root)setNotice('');},err=>{if(root)setNotice(err.message,true);throw err;});
 // A Google connection is optional: failed script loads must not disrupt the reader.
 gisReady.catch(()=>{gisReady=null;});
 return gisReady;
}
function authorize(){
 if(accessToken&&Date.now()<tokenExpiry-60000)return Promise.resolve(accessToken);
 if(!window.google?.accounts?.oauth2)throw Error('Google connection is still preparing. Try again.');
 if(!clientConfigured())throw Error('Google Drive has not been configured for this website.');
 return new Promise((resolve,reject)=>{
  if(!tokenClient){
   tokenClient=window.google.accounts.oauth2.initTokenClient({
    client_id:configClientId(),scope:DRIVE_SCOPE,
    callback:response=>{
     if(response?.error){reject(Error('Google authorisation was declined: '+response.error));return;}
     if(!response?.access_token){reject(Error('No Google authorisation was returned'));return;}
     accessToken=response.access_token;tokenExpiry=Date.now()+Math.max(60,Number(response.expires_in)||3300)*1000;
     resolve(accessToken);
    },
    error_callback:e=>reject(Error(e?.type==='popup_closed'?'Google sign-in was cancelled':'Google sign-in could not start'))
   });
  }else{
   tokenClient.callback=response=>{
    if(response?.error||!response?.access_token){reject(Error('Google authorisation was not completed'));return;}
    accessToken=response.access_token;tokenExpiry=Date.now()+Math.max(60,Number(response.expires_in)||3300)*1000;
    resolve(accessToken);
   };
  }
  tokenClient.requestAccessToken({prompt:''});
 });
}
async function driveRequest(path,init={}){
 const res=await fetch(path,{
  ...init,
  headers:{Authorization:'Bearer '+accessToken,...(init.headers||{})}
 });
 if(!res.ok){
  if(res.status===401){accessToken='';tokenExpiry=0;throw Error('Google authorisation expired. Choose the action again to reconnect.');}
  let detail='';try{const body=await res.json();detail=body.error?.message||'';}catch(_){}
  throw Error('Google Drive error ('+res.status+')'+(detail?': '+detail.slice(0,120):''));
 }
 return res;
}
async function findFolder(createIfAbsent=false){
 const q="name = '"+DRIVE_FOLDER+"' and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
 const url='https://www.googleapis.com/drive/v3/files?'+new URLSearchParams({q,fields:'files(id,name),nextPageToken',pageSize:'100'});
 const data=await (await driveRequest(url)).json();
 if(data.files?.length)return data.files[0].id;
 if(!createIfAbsent)return null;
 const created=await driveRequest('https://www.googleapis.com/drive/v3/files?fields=id,name',{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({name:DRIVE_FOLDER,mimeType:'application/vnd.google-apps.folder',appProperties:{gnamma:'backup-folder'}})
 });
 return (await created.json()).id;
}
async function googleSave(){
 if(busy)return;
 let tokenPromise;
 try{tokenPromise=authorize();}catch(e){setNotice(e.message,true);return;}
 buttonsBusy(true);setNotice('Connecting to Google Drive…');
 try{
  await tokenPromise;
  const file=fileBlob();
  if(file.size>5*1024*1024)throw Error('This backup is too large for the direct Google upload. Download the JSON file instead.');
  const folder=await findFolder(true);
  const boundary='gnamma_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9);
  const head='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+
   JSON.stringify({name:file.name,mimeType:'application/json',parents:[folder],appProperties:{gnamma:'daruri-backup'}})+
   '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n';
  const body=new Blob([head,file.data,'\r\n--'+boundary+'--\r\n'],{type:'multipart/related; boundary='+boundary});
  const result=await driveRequest('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime',{
   method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body
  });
  const created=await result.json();
  setNotice('Google Drive backup created: '+String(created.name||file.name));
 }catch(e){setNotice(e.message,true);}
 finally{buttonsBusy(false);}
}
async function googleList(){
 if(busy)return;
 let tokenPromise;
 try{tokenPromise=authorize();}catch(e){setNotice(e.message,true);return;}
 buttonsBusy(true);setNotice('Opening your Gnamma backups…');
 try{
  await tokenPromise;
  const folder=await findFolder();
  if(!folder){renderDriveFiles([]);return;}
  const q="'"+folder+"' in parents and trashed = false";
  const url='https://www.googleapis.com/drive/v3/files?'+new URLSearchParams({
   q,fields:'nextPageToken,files(id,name,createdTime,size,mimeType)',orderBy:'createdTime desc',pageSize:'100'
  });
  const data=await (await driveRequest(url)).json();
  renderDriveFiles((data.files||[]).filter(x=>/^Gnamma-Daruri-.*\.json$/.test(x.name)));
 }catch(e){setNotice(e.message,true);}
 finally{buttonsBusy(false);}
}
async function googleFetch(id){
 if(busy)return;
 if(!/^[A-Za-z0-9_-]{5,200}$/.test(id)){setNotice('Invalid backup file identifier.',true);return;}
 let tokenPromise;
 try{tokenPromise=authorize();}catch(e){setNotice(e.message,true);return;}
 buttonsBusy(true);setNotice('Retrieving the selected backup…');
 try{
  await tokenPromise;
  const res=await driveRequest('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(id)+'?alt=media');
  const raw=await res.text();
  if(new Blob([raw]).size>MAX_BYTES)throw Error('Backup is too large (12 MB import limit).');
  review(JSON.parse(raw),'Google Drive backup');
 }catch(e){setNotice('Could not load that Google Drive backup: '+e.message,true);}
 finally{buttonsBusy(false);}
}
function onClick(event){
 if(!root)return;
 const btn=event.target.closest('[data-transfer]');
 if(!btn||!root.contains(btn))return;
 event.preventDefault();event.stopPropagation();
 const action=btn.dataset.transfer;
 if(action==='close'||action==='not-now'){close();return;}
 if(busy)return;
 if(action==='home'){imported=null;renderHome();return;}
 if(action==='download'){download();return;}
 if(action==='share'){void share();return;}
 if(action==='choose-file'){chooseFile();return;}
 if(action==='restore'){restoreSelection();return;}
 if(action==='resume'){resume(restored().restored,'restored');return;}
 if(action==='return-previous'){resume(restored().previous,'previous');return;}
 if(action==='forget-restored'){forgetRestored();return;}
 if(action==='google-save'){void googleSave();return;}
 if(action==='google-list'){void googleList();return;}
 if(action==='google-fetch'){void googleFetch(btn.dataset.fileId);return;}
}
function onKey(event){
 if(!root)return;
 if(event.key==='Escape'){
  event.preventDefault();event.stopImmediatePropagation();close();return;
 }
 if(event.key!=='Tab')return;
 const focusables=[...root.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href]')]
  .filter(e=>e.getClientRects().length&&!e.hidden);
 if(!focusables.length)return;
 const first=focusables[0],last=focusables.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 else if(!root.contains(document.activeElement)){event.preventDefault();first.focus();}
}
let scrollTimer=0;
function init(context){
 ctx=context;
 document.addEventListener('click',onClick,true);
 document.addEventListener('keydown',onKey,true);
 document.addEventListener('change',e=>{
  const input=e.target;
  if(input?.id==='gn-transfer-file'&&input.files?.length)void reviewFile(input.files[0]);
 });
 window.addEventListener('scroll',()=>{
  clearTimeout(scrollTimer);scrollTimer=setTimeout(saveProgress,450);
 },{passive:true});
 window.addEventListener('hashchange',()=>setTimeout(saveProgress,450));
 setTimeout(saveProgress,600);
 return {open,reviewFile,createBackup,snapshotLocation};
}
window.GnammaBackupTransfer={create:init,open,reviewFile,createBackup,validLocation};
})();
