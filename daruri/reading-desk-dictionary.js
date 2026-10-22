/* Historical dictionary integration: the same bookmark controls as the reader. */
(function(){
'use strict';
const KEY='gnamma-reading-desk-v1';
const UI=window.GnammaBookmarkUI;
if(!UI)throw Error('Bookmark controls must load before the dictionary');
const $=s=>document.querySelector(s);
const term=()=>new URLSearchParams(location.hash.slice(1)).get('term')||'';
function read(){
 let raw;
 try{raw=localStorage.getItem(KEY);}catch(_){return {raw:null,data:null};}
 if(raw===null)return {raw,data:{format:'gnamma-reading-desk',version:1,items:[]}};
 try{
  const data=JSON.parse(raw);
  if(data?.format==='gnamma-reading-desk'&&data.version===1&&Array.isArray(data.items))return {raw,data};
 }catch(_){}
 return {raw,data:null};
}
function status(message){
 const el=$('#gn-rd-dictionary-status');
 if(el)el.textContent=message;
}
function controls(){
 const card=$('#lexArticle .lex-card'),name=term();
 if(!card||!name)return;
 let bar=card.querySelector('.gn-rd-dictionary-actions');
 if(!bar){
  bar=document.createElement('div');bar.className='gn-rd-dictionary-actions';
  bar.innerHTML='<button type="button" data-rd-dictionary="bookmark"></button>'+
    '<a href="index.html#bookmarks" data-rd-dictionary="view" hidden>View in Reading Desk</a>'+
    '<button type="button" data-rd-dictionary="note">+ Add personal note</button>'+
    '<a href="index.html#bookmarks">Reading Desk ↗</a>'+
    '<small id="gn-rd-dictionary-status" role="status"></small>';
  card.querySelector('.lex-title')?.insertAdjacentElement('afterend',bar);
 }
 const snapshot=read();
 const saved=Boolean(snapshot.data?.items.some(r=>r.kind==='dictionary'&&!r.deleted&&r.target?.term===name));
 const button=bar.querySelector('[data-rd-dictionary="bookmark"]');
 button.innerHTML=UI.icon({saved})+'<span>'+(saved?'Remove bookmark':'Bookmark entry')+'</span>';
 button.setAttribute('aria-label',UI.actionLabel('dictionary',saved));
 button.setAttribute('aria-pressed',String(saved));
 button.disabled=!snapshot.data;
 bar.querySelector('[data-rd-dictionary="view"]').hidden=!saved;
 if(!snapshot.data)status('Existing Reading Desk data could not be read. Bookmark changes are blocked to protect your records.');
 const back=(()=>{try{return JSON.parse(sessionStorage.getItem('gnamma-reading-desk-dictionary-return')||'null')}catch(_){return null}})();
 if(back&&Date.now()-back.created<86400000&&!bar.querySelector('[data-rd-dictionary="return"]')){
  const a=document.createElement('a');a.href='index.html#bookmarks';a.dataset.rdDictionary='return';a.textContent='← Back to Reading Desk';bar.prepend(a);
 }
}
function toggleBookmark(){
 const name=term();
 if(!name)return;
 const snapshot=read();
 if(!snapshot.data){status('Cannot change bookmarks: existing Reading Desk data is unreadable. Export a backup from the reader.');return;}
 const data=snapshot.data,old=data.items.find(r=>r.kind==='dictionary'&&r.target?.term===name),now=Date.now();
 let message;
 if(old){
  if(!old.deleted){old.deleted=now;old.updated=now;message='Bookmark moved to Bin. Open Reading Desk to restore it.';}
  else{old.deleted=0;old.updated=now;message='Bookmark restored in Reading Desk.';}
 }else{
  data.items.unshift({id:typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'entry-'+now+'-'+Math.random().toString(36).slice(2),kind:'dictionary',target:{kind:'dictionary',term:name,historical:true},title:'',body:'',created:now,updated:now,modified:0,dateSource:'recorded',deleted:0,standalone:false});
  message='Dictionary entry bookmarked in Reading Desk.';
 }
 try{
  if(localStorage.getItem(KEY)!==snapshot.raw){status('Reading Desk changed in another tab. Reload the dictionary before saving.');return;}
  localStorage.setItem(KEY,JSON.stringify(data));
 }catch(_){status('Cannot save: browser storage is full or unavailable.');return;}
 controls();status(message);
}
let queued=false;
const root=$('#lexArticle');
if(root)new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;controls();});}).observe(root,{childList:true,subtree:false});
window.addEventListener('storage',e=>{if(e.key===KEY)controls();});
document.addEventListener('click',e=>{
 const el=e.target.closest?.('[data-rd-dictionary]');if(!el)return;
 const action=el.dataset.rdDictionary;
 if(action==='return'){
  try{sessionStorage.removeItem('gnamma-reading-desk-dictionary-return');}catch(_){}
  return;
 }
 if(action==='view')return;
 e.preventDefault();
 if(action==='bookmark')toggleBookmark();
 else if(action==='note'){
  try{sessionStorage.setItem('gnamma-reading-desk-intent',JSON.stringify({action:'note',target:{kind:'dictionary',term:term(),historical:true},created:Date.now()}));}catch(_){}
  location.href='index.html#glossary';
 }
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',controls,{once:true});else controls();
})();
