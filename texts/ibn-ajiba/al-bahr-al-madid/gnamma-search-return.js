/* Gnamma Search Return: cross-page result navigation, same-origin session state.
   It never sends personal annotations or search queries to URLs or a server. */
(function(){
'use strict';
const KEY='gnamma-bahr-search-return-v2';
const MAX_AGE=12*60*60*1000;
const originalPath=new URL('./index.html',document.currentScript?.src||location.href);
const cssID='gns-return-style';
let observer=null;
function source(){
 try{
  const data=JSON.parse(sessionStorage.getItem(KEY)||'null');
  if(!data||data.version!==2||!data.created||Date.now()-data.created>MAX_AGE||
     data.created-Date.now()>60000||typeof data.state?.query!=='string'||
     data.state.query.length>500||typeof data.from?.hash!=='string')return null;
  return data;
 }catch(_){return null;}
}
function capture(data){
 if(!data||!data.state?.query)return false;
 const state={version:2,created:Date.now(),state:data.state,
  from:data.from||{hash:location.hash,y:window.scrollY},
  selected:data.selected||null};
 try{sessionStorage.setItem(KEY,JSON.stringify(state));}catch(_){return false;}
 show();
 return true;
}
function clear(){
 try{sessionStorage.removeItem(KEY);}catch(_){}
 document.getElementById('gns-return-bar')?.remove();
 const back=document.querySelector('#infoOverlay .reference-back-to-text[data-return-reading]');
 if(back&&back.dataset.gnsOriginalHtml){
  back.innerHTML=back.dataset.gnsOriginalHtml;
  delete back.dataset.gnsOriginalHtml;
  delete back.dataset.gnsReturn;
 }
}
function returnToResults(){
 if(!source())return false;
 const isReader=!!window.BahrReader;
 if(isReader&&typeof window.GnammaUnifiedSearch?.restoreResults==='function'){
  return window.GnammaUnifiedSearch.restoreResults();
 }
 location.href=originalPath.href+'#gns-results';
 return true;
}
function addStyle(){
 if(document.getElementById(cssID))return;
 const style=document.createElement('style');style.id=cssID;
 style.textContent=[
 '#gns-return-bar{position:fixed;z-index:44;right:clamp(10px,2vw,24px);bottom:calc(var(--bottom-height,72px) + 14px + env(safe-area-inset-bottom,0px));max-width:calc(100vw - 24px);display:flex;align-items:center;gap:2px;border:1px solid var(--border,var(--line,#dad3c8));border-radius:9px;background:var(--surface,#fffdf8);color:var(--text,#27342e);box-shadow:0 5px 22px #0002;font:600 12px/1.4 var(--sans,system-ui,sans-serif)}',
 '#gns-return-bar button{font:inherit;cursor:pointer;border:0;background:transparent;color:inherit;padding:11px 13px;border-radius:8px}',
 '#gns-return-bar button:first-child{min-width:0;text-align:left;display:flex;align-items:center;gap:7px}',
 '#gns-return-bar .gns-return-query{font-weight:450;color:var(--text-soft,#6a706a);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px;direction:auto}',
 '#gns-return-bar [data-gns-return-dismiss]{border-left:1px solid var(--line,#ded8cf);color:var(--text-soft,#6a706a);padding:11px 12px}',
 '#gns-return-bar button:focus-visible,[data-gns-return]:focus-visible{outline:2px solid var(--accent,#84614b);outline-offset:2px}',
 'body:has(#infoOverlay:not([hidden])) #gns-return-bar{visibility:hidden}',
 '@media(max-width:600px){#gns-return-bar{right:8px;left:8px;bottom:calc(var(--bottom-height,60px) + 9px + env(safe-area-inset-bottom,0px))}#gns-return-bar button:first-child{flex:1}#gns-return-bar .gns-return-query{max-width:30vw}}',
 '@media print{#gns-return-bar{display:none!important}}'
 ].join('\n');
 document.head.append(style);
}
function renderInReader(){
 const payload=source();if(!payload){document.getElementById('gns-return-bar')?.remove();return;}
 addStyle();
 let bar=document.getElementById('gns-return-bar');
 if(!bar){
  bar=document.createElement('nav');bar.id='gns-return-bar';
  bar.setAttribute('aria-label','Return to search results');
  bar.innerHTML='<button type="button" data-gns-return="1"><span aria-hidden="true">←</span><span>Back to search results</span><span class="gns-return-query"></span></button>'+
    '<button type="button" data-gns-return-dismiss="1" aria-label="Dismiss search return">×</button>';
  document.body.append(bar);
 }
 const lbl=bar.querySelector('.gns-return-query');if(lbl)lbl.textContent=payload.state.query;
 const noteBack=document.querySelector('#infoOverlay .reference-back-to-text[data-return-reading]');
 if(noteBack&&document.querySelector('#infoOverlay:not([hidden])')){
  if(!noteBack.dataset.gnsOriginalHtml)noteBack.dataset.gnsOriginalHtml=noteBack.innerHTML;
  noteBack.dataset.gnsReturn='1';
  // Avoid triggering the MutationObserver continuously on unchanged text.
  if(noteBack.textContent.trim()!=='← Back to search results')
   noteBack.textContent='← Back to search results';
 }
}
function renderDictionary(){
 const payload=source();if(!payload)return;
 addStyle();
 const back=document.querySelector('[data-reader-return]');
 if(back){
  back.dataset.gnsReturn='1';
  const span=back.querySelector('span');
  if(span)span.textContent='Back to search results';
  else back.textContent='← Back to search results';
 }
 // Keep the existing Back-to-reading mechanism for direct dictionary navigation,
 // but provide a separate ordinary reader route if the user chooses it.
}
function renderMustasfa(){renderInReader();}
function show(){
 if(!source())return;
 const path=location.pathname;
 if(path.endsWith('/dictionary.html'))renderDictionary();
 else if(path.includes('/al-mustasfa'))renderMustasfa();
 else renderInReader();
}
document.addEventListener('click',event=>{
 const back=event.target.closest('[data-gns-return]'),dismiss=event.target.closest('[data-gns-return-dismiss]');
 if(!back&&!dismiss)return;
 if(!source())return;
 event.preventDefault();event.stopImmediatePropagation();
 if(dismiss)clear();else returnToResults();
},true);
document.addEventListener('keydown',event=>{
 if(!source()||event.key!=='Escape')return;
 // Escape remains reserved for the reader's dialogs. The dismiss button is explicit.
},true);
function install(){
 show();
 const popup=document.getElementById('infoOverlay');
 if(popup){
  observer=new MutationObserver(()=>{if(source())renderInReader();});
  observer.observe(popup,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
 }
 window.addEventListener('pageshow',show);
}
window.GnammaSearchReturn={capture,read:source,clear,returnToResults,show,key:KEY};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
