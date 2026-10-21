/* Historical dictionary integration for private, browser-local Reading Desk. */
(function(){
'use strict';
const KEY='gnamma-reading-desk-v1';
const $=s=>document.querySelector(s);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const term=()=>new URLSearchParams(location.hash.slice(1)).get('term')||'';
function read(){
 try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&x.format==='gnamma-reading-desk'&&x.version===1&&Array.isArray(x.items))return x;}catch(e){}
 return {format:'gnamma-reading-desk',version:1,items:[]};
}
function status(message){
 let el=$('#gn-rd-dictionary-status');if(!el)return;el.textContent=message;
}
function controls(){
 const card=$('#lexArticle .lex-card'),name=term();if(!card||!name)return;
 let bar=card.querySelector('.gn-rd-dictionary-actions');
 if(!bar){bar=document.createElement('div');bar.className='gn-rd-dictionary-actions';bar.innerHTML='<button type="button" data-rd-dictionary="bookmark">◇ Bookmark entry</button><button type="button" data-rd-dictionary="note">+ Add personal note</button><a href="index.html#bookmarks">Reading Desk ↗</a><small id="gn-rd-dictionary-status" role="status"></small>';card.querySelector('.lex-title')?.insertAdjacentElement('afterend',bar);}
 const saved=read().items.some(r=>r.kind==='dictionary'&&!r.deleted&&r.target?.term===name);
 const button=bar.querySelector('[data-rd-dictionary="bookmark"]');
 button.textContent=saved?'◇ Bookmarked':'◇ Bookmark entry';
 button.setAttribute('aria-pressed',String(saved));
 const back=(()=>{try{return JSON.parse(sessionStorage.getItem('gnamma-reading-desk-dictionary-return')||'null')}catch(e){return null}})();
 if(back&&Date.now()-back.created<86400000&&!bar.querySelector('[data-rd-dictionary="return"]')){
  const a=document.createElement('a');a.href='index.html#bookmarks';a.dataset.rdDictionary='return';a.textContent='← Back to Reading Desk';bar.prepend(a);
 }
}
function bookmark(){
 const name=term();if(!name)return;
 const data=read(),old=data.items.find(r=>r.kind==='dictionary'&&r.target?.term===name),now=Date.now();
 if(old){if(old.deleted){old.deleted=0;old.updated=now;status('Restored to Reading Desk.');}else{status('Already in Reading Desk.');} }
 else{
  data.items.unshift({id:typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'entry-'+now+'-'+Math.random().toString(36).slice(2),kind:'dictionary',target:{kind:'dictionary',term:name,historical:true},title:'',body:'',created:now,updated:now,modified:0,dateSource:'recorded',deleted:0,standalone:false});
  status('Bookmarked in Reading Desk.');
 }
 try{localStorage.setItem(KEY,JSON.stringify(data));}catch(_){status('Cannot save: browser storage is full or unavailable.');return;}
 controls();
}
let queued=false;
const root=$('#lexArticle');
if(root)new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;controls();});}).observe(root,{childList:true,subtree:false});
document.addEventListener('click',e=>{
 const el=e.target.closest?.('[data-rd-dictionary]');if(!el)return;
 const action=el.dataset.rdDictionary;if(action==='return'){
  try{sessionStorage.removeItem('gnamma-reading-desk-dictionary-return');}catch(_){}
  return;
 }
 e.preventDefault();
 if(action==='bookmark')bookmark();
 else if(action==='note'){
  try{sessionStorage.setItem('gnamma-reading-desk-intent',JSON.stringify({action:'note',target:{kind:'dictionary',term:term(),historical:true},created:Date.now()}));}catch(_){}
  location.href='index.html#glossary';
 }
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',controls,{once:true});else controls();
})();