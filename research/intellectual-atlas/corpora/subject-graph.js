/* GNAMMA subject-first scholarly SVG graphs.
 * Dotted connections mean CATEGORY MEMBERSHIP, never historical influence.
 * Independent documentary arrows, where present, carry individual evidence.
 */
(()=>{
"use strict";
const root=document.getElementById("kalam-timeline-app-v3");
if(!root)return;
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm=x=>String(x??"").normalize("NFKD").replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g,"").replace(/[أإآ]/g,"ا").toLowerCase();
const cut=(s,n)=>String(s??"").length>n?String(s).slice(0,n-1)+"…":String(s??"");
const names={fiqh:"Fiqh",usul:"Uṣūl al-fiqh",nahw:"Grammar / naḥw",sarf:"Morphology / ṣarf",balagha:"Balāgha",lugha:"Lexicography",hadith:"Hadith",tafsir:"Tafsīr"};
const schools={hanafi:"Ḥanafī",maliki:"Mālikī",shafii:"Shāfiʿī",hanbali:"Ḥanbalī",early:"Early jurists & circles",named_other:"Named other schools",unassigned:"Unassigned / other"};
const lines={
 "grammar:basran":"Basran associations","grammar:kufan":"Kufan associations","grammar:baghdadi":"Baghdadi associations",
 "grammar:andalusi_maghribi":"Andalusian–Maghribi","grammar:egyptian_syrian":"Egyptian–Syrian",
 "grammar:later_commentarial":"Later commentaries",
 "grammar:sibawayh":"Sībawayh family","grammar:alfiyya":"Alfiyya family",
 "grammar:ajurrumiyya":"Ājurrūmiyya family","grammar:mufassal":"Mufaṣṣal family",
 "grammar:kafiya_shafiya":"Kāfiya–Shāfiya family","grammar:egyptian_syntax":"Ibn Hishām / Egyptian",
 "grammar:early_disagreements":"Basran–Kufan discussion",
 "balagha:adab_badi":"Adab / badīʿ","balagha:nazm_ijaz":"Naẓm / iʿjāz",
 "balagha:miftah_talkhis":"Miftāḥ / Talkhīṣ","balagha:andalusi_maghribi":"Andalusian / Maghribi rhetoric",
 "balagha:later_didactic":"Later pedagogical rhetoric","balagha:badi_adab":"Badīʿ / literary criticism",
 "balagha:maghribi_literary":"Maghribi rhetoric","unmapped":"Not assigned to a line",
 "works":"Source-attested books"
};
const category=k=>schools[k]||lines[k]||k;
const law=["hanafi","maliki","shafii","hanbali","early","named_other","unassigned"];
const sourceIds=["all","openiti","alreq","reader"];
const model={scope:"",group:"",author:"",book:"",zoom:1,source:"all",page:1};
let cached=[],reader=null,context=null,genre="",groups=[],filtered=[],authorities=[],earlyFetch=null;
let lastGraph={mode:"",books:0,groups:0,svg:0},loadError="";
function url(x){
 try{const u=new URL(x);return u.protocol==="https:"?u.href:"";}catch{return "";}
}
function findAuthority(r,a){
 const key=String(r.authorKey||"").toLowerCase(),ar=norm(r.author||"");
 const byURI=(a.author_uri_markers||[]).some(x=>key.includes(String(x).toLowerCase()));
 const byArabic=(a.author_ar_markers||[]).some(x=>ar.includes(norm(x)));
 if(!byURI&&!byArabic)return false;
 if(a.id==="zahiri"&&key.includes("ibnhazm"))return true;
 return !r.death||Math.abs(r.death-a.death_ah)<=48;
}
function matches(r){return authorities.filter(a=>findAuthority(r,a));}
function early(r){return !!r.death&&r.death<=300||matches(r).some(a=>a.death_ah<=300);}
function other(r){return matches(r).some(a=>a.status==="personal_circle"||a.status==="historical_nonfour_school");}
function member(r,key){
 if(["fiqh","usul"].includes(genre)){
  if(["hanafi","maliki","shafii","hanbali"].includes(key))return r.schools.includes(key);
  if(key==="early")return early(r);
  if(key==="named_other")return other(r);
  if(key==="unassigned")return !r.schools.some(x=>["hanafi","maliki","shafii","hanbali"].includes(x));
  if(key.startsWith("jurist:"))return matches(r).some(a=>a.id===key.slice(7));
  return false;
 }
 if(key==="works")return true;
 const prefix=genre==="balagha"?"balagha:":"grammar:";
 if(key==="unmapped")return !r.lines.some(x=>x.startsWith(prefix));
 return r.lines.includes(key);
}
function gen(args){return args.science==="fiqh"?(args.tab==="method"?"usul":"fiqh"):args.science==="arabic"?args.tab:args.science;}
function buildGroups(){
 if(["fiqh","usul"].includes(genre))
  return law.map(k=>({key:k,title:category(k),n:filtered.filter(r=>member(r,k)).length}))
    .filter(x=>x.n||x.key==="early"||x.key==="named_other");
 if(["hadith","tafsir","lugha"].includes(genre))
  return [{key:"works",title:"Recorded source books",n:filtered.length}];
 const keys=new Set(["unmapped"]);
 for(const b of filtered)for(const k of b.lines)if(k.startsWith(genre==="balagha"?"balagha:":"grammar:"))keys.add(k);
 return [...keys].sort((a,b)=>category(a).localeCompare(category(b))).map(k=>({
   key:k,title:category(k),n:filtered.filter(r=>member(r,k)).length
 })).filter(x=>x.n);
}
function mix(rows,max){
 const result=[],seen=new Set();
 const buckets=[
  rows.filter(r=>r.pinned),
  rows.filter(r=>r.sourceType==="openiti"&&!r.pinned),
  rows.filter(r=>r.sourceType==="alreq")
 ];
 for(const a of buckets)a.sort((x,y)=>(x.death||99999)-(y.death||99999)||x.title.localeCompare(y.title,"ar"));
 for(let i=0;result.length<max;i++){
  let another=false;
  for(const b of buckets){
   if(i>=b.length)continue;another=true;
   if(!seen.has(b[i].id)){result.push(b[i]);seen.add(b[i].id);}
   if(result.length>=max)break;
  }
  if(!another)break;
 }
 return result;
}
const recordsFor=k=>filtered.filter(r=>member(r,k));
function node(type,key,text,sub,x,y,w=210,h=70){
 const attr=type==="group"?"data-gnv-group":type==="jurist"?"data-gnv-jurist":type==="book"?"data-gnv-book":"data-gnv-home";
 const selected=key===model.book?" gnv-picked":"";
 return '<g class="gnv-node gnv-'+type+selected+'" role="button" tabindex="0" '+attr+'="'+esc(key)+
  '" aria-label="'+esc(text+" · "+sub)+'"><title>'+esc(text+" · "+sub)+'</title>'+
  '<rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" rx="'+(type==="jurist"?28:12)+'"></rect>'+
  '<text x="'+x+'" y="'+(y-6)+'" text-anchor="middle" class="gnv-label">'+esc(cut(text,25))+'</text>'+
  '<text x="'+x+'" y="'+(y+14)+'" text-anchor="middle" class="gnv-sub">'+esc(cut(sub,31))+'</text></g>';
}
function edge(x1,y1,x2,y2,documented=false,u=""){
 const mid=(x1+x2)/2,curve='M'+x1+','+y1+' C'+mid+','+y1+' '+mid+','+y2+' '+x2+','+y2;
 const path='<path class="'+(documented?"gnv-evidence-edge":"gnv-category-edge")+
  '" d="'+curve+'"'+(documented?' marker-end="url(#gnv-arrow)"':'')+'></path>';
 return documented&&url(u)?'<a href="'+esc(url(u))+'" target="_blank" rel="noopener noreferrer" aria-label="Inspect documented textual relation">'+path+'</a>':path;
}
function svg(body,w,h,title){
 const defs='<defs><marker id="gnv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1 L9 5 L1 9Z"></path></marker></defs>';
 return '<div class="gnv-canvas" data-gnv-canvas role="region" tabindex="0" aria-label="'+esc(title)+'; scroll to navigate">'+
  '<svg data-gnv-svg role="img" xmlns="http://www.w3.org/2000/svg" width="'+Math.round(w*model.zoom)+
  '" height="'+Math.round(h*model.zoom)+'" viewBox="0 0 '+w+' '+h+'" aria-label="'+esc(title)+'">'+
  defs+body+'</svg></div>';
}
function sourceStamp(r){return r.sourceType==="alreq"?"Manuscript record":r.pinned?"Pinned GNAMMA":"OpenITI metadata";}
function historical(k){
 if(k==="early")return authorities.filter(a=>a.death_ah<=300);
 if(k==="named_other")return authorities.filter(a=>["personal_circle","historical_nonfour_school"].includes(a.status));
 return [];
}
function overview(mobile){
 const w=mobile?420:1370,spacing=mobile?292:178;
 const h=115+Math.max(1,groups.length)*spacing;
 const srcX=mobile?210:125,srcY=mobile?55:Math.round(h/2),groupX=mobile?210:385;
 let strokes="",nodes=node("home","",names[genre]||genre,"Select a visual node",srcX,srcY,mobile?190:205,66);
 for(let i=0;i<groups.length;i++){
   const gr=groups[i],y=105+i*spacing+(mobile?22:40);
   strokes+=edge(srcX,srcY,groupX,y);
   nodes+=node("group",gr.key,gr.title,gr.n.toLocaleString()+" source records",groupX,y,mobile?210:216,70);
   let samples=mix(recordsFor(gr.key),mobile?4:6);
   if(["early","named_other"].includes(gr.key)){
     const named=historical(gr.key);
     if(named.length)samples=named.slice(0,mobile?4:6).map(x=>({jurist:x}));
   }
   for(let j=0;j<samples.length;j++){
     const x=mobile?(j%2?315:105):(615+(j%3)*250);
     const yy=mobile?y+109+Math.floor(j/2)*83:y-39+Math.floor(j/3)*76;
     strokes+=edge(groupX,y,x,yy);
     const record=samples[j];
     if(record.jurist)nodes+=node("jurist",record.jurist.id,record.jurist.name,
       "d. "+record.jurist.death_ah+" AH",x,yy,mobile?187:225,69);
     else nodes+=node("book",record.id,record.title,sourceStamp(record),x,yy,mobile?188:228,71);
   }
 }
 lastGraph={mode:"overview",books:root.querySelectorAll(".gnv-book").length,groups:groups.length,svg:1};
 return svg(strokes+nodes,w,h,"Subject work graph with connected school and book nodes");
}
