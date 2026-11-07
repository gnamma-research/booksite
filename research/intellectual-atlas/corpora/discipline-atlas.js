/* GNAMMA disciplinary maps: same timeline-first visual grammar as the
   philosophy/kalām atlas, with a separate vertical overview of principal texts.
   Time markers are approximate CE equivalents of AUTHOR death years; do not
   imply a date of composition, historical influence, or manuscript attestation. */
(()=>{
"use strict";
const host=document.getElementById("kalam-timeline-app-v3");if(!host)return;
const esc=t=>String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const norm=t=>String(t??"").normalize("NFKD").replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g,"").replace(/[أإآ]/g,"ا").toLowerCase();
const fit=(t,n)=>String(t??"").length>n?String(t).slice(0,n-1)+"…":String(t??"");
const DATE_MIN=620,DATE_MAX=2040;
const ce=ah=>Math.round(622+(Number(ah)-1)*.970224);
const TITLES={fiqh:"Fiqh",usul:"Uṣūl al-fiqh",nahw:"Arabic grammar / naḥw",sarf:"Morphology / ṣarf",balagha:"Balāgha",lugha:"Lexicography",hadith:"Hadith",tafsir:"Tafsīr",tasawwuf:"Taṣawwuf"};
const SCHOOL={hanafi:"Ḥanafī",maliki:"Mālikī",shafii:"Shāfiʿī",hanbali:"Ḥanbalī",early:"Early juristic circles",named_other:"Named non-four schools",unassigned:"Other / not assigned"};
const GLOSS={
"grammar:basran":"Basran associations","grammar:kufan":"Kufan associations","grammar:baghdadi":"Baghdadi associations",
"grammar:andalusi_maghribi":"Andalusian / Maghribi","grammar:egyptian_syrian":"Egyptian / Syrian",
"grammar:later_commentarial":"Later commentarial","grammar:sibawayh":"Sībawayh family",
"grammar:alfiyya":"Alfiyya family","grammar:ajurrumiyya":"Ājurrūmiyya family",
"grammar:mufassal":"Mufaṣṣal family","grammar:kafiya_shafiya":"Kāfiya / Shāfiya family",
"grammar:egyptian_syntax":"Ibn Hishām commentary","grammar:early_disagreements":"Basran–Kufan debates",
"balagha:adab_badi":"Adab / badīʿ","balagha:nazm_ijaz":"Naẓm / iʿjāz",
"balagha:miftah_talkhis":"Miftāḥ / Talkhīṣ","balagha:andalusi_maghribi":"Andalusian / Maghribi rhetoric",
"balagha:later_didactic":"Later didactic tradition","balagha:badi_adab":"Literary criticism",
"balagha:maghribi_literary":"Maghribi rhetoric"};
const groupLabel=x=>SCHOOL[x]||GLOSS[x]||(x==="unassigned"?"Unassigned textual line":x==="books"?"Cited source books":x);
const IS_LEGAL=g=>g==="fiqh"||g==="usul";
const SOURCES=[["all","All cited records"],["openiti","OpenITI versions"],["alreq","Manuscript bibliography"],["reader","Pinned GNAMMA versions"]];
const S={mode:"timeline",from:630,to:1920,lane:"",undated:false,page:1,book:"",edge:"",source:"all",scope:""};
let ctx=null,genre="",works=[],reader=null,jurists=[],juristError="",juristRequest=null,lanes=[],filtered=[];
function period(work){return work.death&&Number(work.death)>0?ce(work.death):null;}
function getGenre(a){return a.science==="fiqh"?(a.tab==="method"?"usul":"fiqh"):a.science==="arabic"?a.tab:a.science;}
function matchedJurist(w,a){
 const key=String(w.authorKey||"").toLowerCase(),name=norm(w.author);
 if(!(a.author_uri_markers||[]).some(x=>key.includes(x.toLowerCase()))&&!(a.author_ar_markers||[]).some(x=>name.includes(norm(x))))return false;
 if(a.id==="zahiri"&&key.includes("ibnhazm"))return true;
 return !w.death||Math.abs(Number(w.death)-a.death_ah)<49;
}
function early(w){return w.death>0&&w.death<=300||jurists.some(a=>a.death_ah<=300&&matchedJurist(w,a));}
function nonFour(w){return jurists.some(a=>["personal_circle","historical_nonfour_school"].includes(a.status)&&matchedJurist(w,a));}
function belongs(w,key){
 if(IS_LEGAL(genre)){
  if(["hanafi","maliki","shafii","hanbali"].includes(key))return w.schools.includes(key);
  if(key==="early")return early(w);
  if(key==="named_other")return nonFour(w);
  if(key==="unassigned")return !w.schools.some(x=>["hanafi","maliki","shafii","hanbali"].includes(x));
  return false;
 }
 if(["hadith","tafsir","tasawwuf","lugha"].includes(genre))return key==="books";
 const prefix=genre==="balagha"?"balagha:":"grammar:";
 return key==="unassigned"?!w.lines.some(x=>x.startsWith(prefix)):w.lines.includes(key);
}
function laneKeys(){
 if(IS_LEGAL(genre))return ["hanafi","maliki","shafii","hanbali","early","named_other","unassigned"];
 if(["hadith","tafsir","tasawwuf","lugha"].includes(genre))return ["books"];
 const found=new Set();
 for(const r of filtered)for(const x of r.lines)if(x.startsWith(genre==="balagha"?"balagha:":"grammar:"))found.add(x);
 return [...found].sort((a,b)=>groupLabel(a).localeCompare(groupLabel(b))).concat("unassigned");
}
function byLane(key){return filtered.filter(r=>belongs(r,key));}
function sourceOf(w){return w.sourceType==="alreq"?"Manuscript catalogue":w.pinned?"Pinned GNAMMA":"OpenITI metadata";}
function validURL(value){try{const u=new URL(value);return u.protocol==="https:"?u.href:"";}catch{return "";}}
function sourceLink(w){
 const u=validURL(w.url);
 return u?"<a href='"+esc(u)+"' target='_blank' rel='noopener noreferrer'>"+(w.sourceType==="alreq"?"Original manuscript catalogue":"Original OpenITI work/version")+"</a>":"Source link unverified";
}
function edges(){
 const pinned=new Map(works.filter(x=>x.readerId).map(x=>[x.readerId,x]));
 return (reader?.relationships||[]).filter(e=>pinned.has(e.source)&&pinned.has(e.target)&&validURL(e.source_url)).map(e=>({
 id:e.id,from:pinned.get(e.source).id,to:pinned.get(e.target).id,label:e.label,description:e.evidence,url:e.source_url,type:e.type}));
}
function loadJurists(){
 if(jurists.length||juristRequest||juristError)return;
 juristRequest=fetch("corpora/early-jurists.json").then(r=>r.ok?r.json():Promise.reject(Error("Early-jurist register unavailable")))
 .then(j=>{if(!Array.isArray(j.authorities))throw Error("Bad early authority data");jurists=j.authorities;})
 .catch(e=>{juristError=String(e);}).finally(()=>{juristRequest=null;if(ctx?.args?.isActive())render(ctx.args,ctx.api);});
}
function reset(mode=true){S.lane="";S.book="";S.edge="";S.page=1;S.undated=false;if(mode)S.mode="timeline";}
function years(from,to){
 const span=Math.min(DATE_MAX-DATE_MIN,Math.max(60,to-from));
 S.from=Math.round(Math.max(DATE_MIN,Math.min(DATE_MAX-span,from)));S.to=Math.round(S.from+span);
 S.page=1;S.undated=false;
}
function zoom(factor){const middle=(S.from+S.to)/2,span=(S.to-S.from)*factor;years(middle-span/2,middle+span/2);}
function pan(distance){const delta=(S.to-S.from)*distance;years(S.from+delta,S.to+delta);}
function readHash(){
 const p=new URLSearchParams(location.hash.slice(1));
 S.mode=p.get("sa_mode")==="summary"?"summary":"timeline";
 S.from=Math.min(DATE_MAX-60,Math.max(DATE_MIN,parseInt(p.get("sa_from"),10)||630));
 S.to=Math.max(S.from+60,Math.min(DATE_MAX,parseInt(p.get("sa_to"),10)||1920));
 S.lane=p.get("sa_lane")||"";S.undated=p.get("sa_undated")==="1";
 S.book=p.get("sa_book")||"";S.edge=p.get("sa_edge")||"";
 S.page=Math.max(1,parseInt(p.get("sa_page"),10)||1);
 S.source=SOURCES.some(x=>x[0]===p.get("sa_source"))?p.get("sa_source"):"all";
}
function saveHash(){
 const p=new URLSearchParams(location.hash.slice(1));
 for(const [k,v]of [["sa_mode",S.mode==="summary"?"summary":""],["sa_from",S.from===630?"":String(S.from)],
 ["sa_to",S.to===1920?"":String(S.to)],["sa_lane",S.lane],["sa_undated",S.undated?"1":""],
 ["sa_book",S.book],["sa_edge",S.edge],["sa_page",S.page>1?String(S.page):""],
 ["sa_source",S.source==="all"?"":S.source]]){
  if(v)p.set(k,v);else p.delete(k);
 }
 const h="#"+p.toString();if(h!==location.hash)try{history.replaceState(null,"",h)}catch{location.hash=h}
}
function detailHTML(){
 const rel=edges().find(e=>e.id===S.edge);
 if(rel)return "<aside class='dn-detail' role='region' aria-label='Documented textual relation'>"+
  "<div class='dn-detail-head'><strong>Documented textual relationship</strong><button type='button' data-dn-close aria-label='Close evidence'>×</button></div>"+
  "<h3>"+esc(rel.label)+"</h3><p>"+esc(rel.description)+"</p>"+
  "<p><a href='"+esc(rel.url)+"' target='_blank' rel='noopener noreferrer'>Bibliographic evidence</a></p>"+
  "<p class='dn-caveat'>This arrow records only the independently documented relationship, not general agreement or influence.</p></aside>";
 const authority=jurists.find(a=>"jurist:"+a.id===S.book);
 if(authority)return "<aside class='dn-detail' role='region' aria-label='Historical jurist'>"+
  "<div class='dn-detail-head'><strong>Juristic authority</strong><button type='button' data-dn-close aria-label='Close details'>×</button></div>"+
  "<h3>"+esc(authority.name)+"</h3><p dir='rtl' lang='ar'>"+esc(authority.arabic)+"</p>"+
  "<p>"+esc(authority.description)+"</p><p>d. "+authority.death_ah+" AH (approximately "+ce(authority.death_ah)+" CE).</p>"+
  "<p>Classification: "+esc(authority.status.replaceAll("_"," "))+"</p>"+
  (authority.evidence_urls||[]).map((u,i)=>validURL(u)?
    "<p><a href='"+esc(u)+"' target='_blank' rel='noopener noreferrer'>Historical evidence "+(i+1)+"</a></p>":"").join("")+
  "<p class='dn-caveat'>A jurist, personal following and later doctrinal school are different historical units.</p></aside>";
 const w=works.find(x=>x.id===S.book);
 if(!w)return "<aside class='dn-detail' hidden></aside>";
 return "<aside class='dn-detail' role='region' aria-label='Bibliographic work evidence'>"+
 "<div class='dn-detail-head'><strong>Work / source evidence</strong><button type='button' data-dn-close aria-label='Close details'>×</button></div>"+
 "<h3 dir='rtl' lang='ar'>"+esc(w.title)+"</h3><p>"+esc(w.author||"Author not identified")+"</p>"+
 "<dl><dt>Date</dt><dd>"+esc(period(w)!==null?"Author d. "+w.death+" AH, c. "+period(w)+" CE. Not a composition date.":"Unplaced: no author date in this source.")+"</dd>"+
 "<dt>Disciplines</dt><dd>"+esc(w.genres.join(", "))+"</dd>"+
 "<dt>School(s)</dt><dd>"+esc(w.schools.map(groupLabel).join(", ")||"Unassigned")+"</dd>"+
 "<dt>Classification</dt><dd>"+esc(w.schoolEvidence||"Cataloguer attribution only")+"</dd>"+
 "<dt>Source tier</dt><dd>"+esc(sourceOf(w))+"</dd></dl>"+
 (w.sourceNote?"<p>"+esc(w.sourceNote)+"</p>":"")+
 "<p>"+sourceLink(w)+"</p><p class='dn-caveat'>Classification and proximity on this timeline do not establish a textual or doctrinal relation.</p></aside>";
}
function option(id,name,active){
 return "<option value='"+esc(id)+"'"+(id===active?" selected":"")+">"+esc(name)+"</option>";
}
function controls(args){
 const mode="<div class='dn-modes' role='group' aria-label='Disciplinary map mode'>"+
  "<button type='button' data-dn-mode='timeline' aria-pressed='"+(S.mode==="timeline")+"'>Full historical atlas</button>"+
  "<button type='button' data-dn-mode='summary' aria-pressed='"+(S.mode==="summary")+"'>Principal texts · vertical synopsis</button></div>";
 const tabs="<div class='dn-tabs' role='group' aria-label='Subfield'>"+
  (args.tabs||[]).map(([id,name])=>"<button type='button' data-source-tab='"+esc(id)+"' aria-pressed='"+(id===args.tab)+"'>"+esc(name)+"</button>").join("")+"</div>";
 const legalTabs=IS_LEGAL(genre)?"<div class='dn-tabs dn-schools' role='group' aria-label='School or juristic circle'>"+
  [["all","All"],["hanafi","Ḥanafī"],["maliki","Mālikī"],["shafii","Shāfiʿī"],["hanbali","Ḥanbalī"],
   ["early","Early jurists"],["named_other","Other schools"],["unassigned","Unassigned"]]
    .map(([id,title])=>"<button type='button' data-source-madhhab='"+id+"' aria-pressed='"+(args.school===id)+"'>"+title+"</button>").join("")+"</div>":"";
 const filters="<div class='dn-filter-line'><label>Evidence tier <select data-dn-source>"+
    SOURCES.map(([id,name])=>option(id,name,S.source)).join("")+"</select></label>"+
  "<button type='button' data-dn-reset>Show entire subject</button>"+
  (S.lane?"<button type='button' data-dn-lane=''>All school / lineage lanes</button>":"")+"</div>";
 return mode+tabs+legalTabs+filters;
}
function header(args){
 return "<div class='ia-main-head'><div><h2>"+esc(TITLES[genre]||args.title)+
  " · "+(S.mode==="timeline"?"Chronological atlas":"Vertical synopsis of principal texts")+"</h2>"+
  "<span class='ia-small'>"+filtered.length.toLocaleString()+" source-specific bibliographic records · "+
  jurists.length+" registered early legal authorities · same evidence rules as the main GNAMMA atlas</span></div>"+
  "<div class='ia-actions'><button type='button' data-action='open-explore'>Other subjects</button>"+
  "<button type='button' data-action='show-all-mapped'>Complete philosophical atlas</button></div></div>";
}
function recordButton(w,x,y,wide=180,boxH=66){
 const safeid=esc(w.id),selected=w.id===S.book;
 const c={hanafi:"#477da2",maliki:"#ac8258",shafii:"#5b9175",hanbali:"#9673a5",
 early:"#aa7b5c",named_other:"#b8896a",unassigned:"#7f929e"};
 const key=w.schools.find(x=>c[x])||"unassigned";
 return "<g role='button' tabindex='0' data-dn-work='"+safeid+"'"+
  " class='dn-work-anchor"+(selected?" dn-picked":"")+"' aria-label='"+esc(w.title+" by "+w.author+"; "+(w.death?"author d. "+w.death+" AH":"undated"))+"'>"+
  "<title>"+esc(w.title+" · "+w.author)+"</title>"+
  "<rect class='ia-work-box dn-work-rect' style='--ia-series:"+c[key]+"' x='"+x+"' y='"+y+"' width='"+wide+"' height='"+boxH+"' rx='5'/>"+
  "<rect x='"+x+"' y='"+y+"' width='3' height='"+boxH+"' fill='"+c[key]+"'/>"+
  "<text class='ia-node-title' x='"+(x+8)+"' y='"+(y+19)+"'>"+esc(fit(w.title,wide>180?27:21))+"</text>"+
  "<text class='ia-node-sub' x='"+(x+8)+"' y='"+(y+36)+"'>"+esc(fit(w.author,wide>180?26:20))+"</text>"+
  "<text class='ia-node-date' x='"+(x+8)+"' y='"+(y+54)+"'>"+
  esc(w.death?"Author d. "+w.death+" AH · c. "+period(w)+" CE":"Undated catalogue record")+"</text>"+
  "</g>";
}
function scholarButton(a,x,y,w=180){
 return "<g class='dn-scholar' role='button' tabindex='0' data-dn-scholar='"+esc(a.id)+
  "' aria-label='"+esc(a.name+"; early jurist; d. "+a.death_ah+" AH")+"'>"+
  "<title>"+esc(a.name+" · "+a.status)+"</title>"+
  "<rect x='"+x+"' y='"+y+"' width='"+w+"' height='52' rx='15'/>"+
  "<text class='ia-node-title' x='"+(x+8)+"' y='"+(y+20)+"'>"+esc(fit(a.name,w>180?25:20))+"</text>"+
  "<text class='ia-node-sub' x='"+(x+8)+"' y='"+(y+39)+"'>d. "+a.death_ah+" AH · "+esc(fit(a.status.replaceAll("_"," "),16))+"</text></g>";
}
window.GNDisciplineAtlas={render,debug:()=>({genre,mode:S.mode,from:S.from,to:S.to,lane:S.lane,undated:S.undated,
 records:filtered.length,dated:filtered.filter(x=>period(x)!==null).length,
 svg:host.querySelectorAll("[data-sa-map] svg").length,
 source:S.source,selected:S.book,schools:lanes.length,jurists:jurists.length})};
})();
