/* Isolate the books; preserve old preferences and resolve stable citations. */
(function(){
 'use strict';const c=window.TAHDHIB_CONFIG,ns=c.namespace;
 const get=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
 const map=c.map,prefs=ns+'-prefs';
 try{
  if(localStorage.getItem(prefs)===null){
   const old=get('gnamma-tahdhib-reader-v2-'+(c.kind==='logic'?'division':'kalam'))||{};
   const experience=get('gnamma-tahdhib-experience-v1-'+c.kind)||{};
   const where=Object.values(map).find(x=>x.page===Number(old.page));
   localStorage.setItem(prefs,JSON.stringify({n:where?.section||'1',lang:({both:'parallel',en:'english',ar:'arabic'})[old.view]||'parallel',focusLevel:experience.mode==='study'?0:3,theme:['light','dark'].includes(old.theme)?old.theme:'system',fontScale:old.font||1,arabicFont:experience.arFont||'amiri',vowels:true}));
  }
 }catch(error){console.warn('Native reader migration did not alter older saved data:',error);}
 let hash='';try{hash=decodeURIComponent(location.hash.slice(1))}catch{}
 let loc=null;
 if(hash.startsWith('u-')){
  const id=Object.keys(map).find(id=>'u-'+id.replace(/[^a-zA-Z0-9-]/g,'-')===hash);loc=map[id];
 }else if(/^page=\d+$/.test(hash))loc=Object.values(map).find(x=>x.page===Number(hash.slice(5)));
 if(!hash){loc=get(ns+'-position')||{section:String(get(prefs)?.n||'1'),segment:0};}
 if(loc){c.initial=loc;try{history.replaceState(history.state,'','#section='+loc.section+'&paragraph='+loc.segment)}catch{}}
})();
