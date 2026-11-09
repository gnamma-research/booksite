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
let ctx=null,argsNow=null,apiNow=null,last={},lastUI={},genre="",works=[],reader=null,jurists=[],juristError="",juristRequest=null,lanes=[],filtered=[];
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
 "<p>"+sourceLink(w)+"</p><button type='button' data-action='explore-source-selected'>Open work-centred sources &amp; reception</button><p class='dn-caveat'>Classification and proximity on this timeline do not establish a textual or doctrinal relation.</p></aside>";
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
function timeTicks(width){
 const span=S.to-S.from;
 const step=[20,25,50,75,100,150,200,250,400,500].find(x=>span/x<=(width<500?6:10))||500;
 const out=[];for(let y=Math.ceil(S.from/step)*step;y<=S.to;y+=step)out.push(y);
 return out;
}
function overviewCell(lane,first,last,count,x,y,w){
 return "<g role='button' tabindex='0' data-dn-cluster='"+esc(lane+"|"+first+"|"+last)+"'"+
  " aria-label='"+esc(count+" dated works in "+groupLabel(lane)+" during approximately "+first+"–"+last+" CE")+
  "'><title>Zoom to "+count+" works from c. "+first+" to "+last+" CE</title>"+
  "<rect class='ia-overview-card' x='"+x+"' y='"+y+"' width='"+w+"' height='62' rx='5'/>"+
  "<text class='ia-cluster-label' x='"+(x+9)+"' y='"+(y+22)+"'>"+count+" source records</text>"+
  "<text class='ia-cluster-sub' x='"+(x+9)+"' y='"+(y+41)+"'>c. "+first+"–"+last+" CE</text>"+
  "<text class='ia-cluster-sub' x='"+(x+9)+"' y='"+(y+55)+"'>Select to examine books</text></g>";
}
function historicAuthorities(lane){
 if(!IS_LEGAL(genre))return [];
 if(lane==="early")return jurists.filter(a=>a.death_ah<=300);
 if(lane==="named_other")return jurists.filter(a=>["personal_circle","historical_nonfour_school"].includes(a.status));
 return [];
}
function svgTimeline(width){
 const W=Math.max(310,width||800),left=W<530?16:28,right=W<530?12:20;
 const plot=Math.max(80,W-left-right),span=S.to-S.from,overview=span>(W<530?225:330);
 const scale=y=>left+(y-S.from)/span*plot,clip=v=>Math.max(left,Math.min(W-right,v));
 const keys=lanes.filter(k=>!S.lane||k===S.lane);
 const ticks=timeTicks(W),tickY=56;
 const grid=ticks.map(y=>{
  const x=clip(scale(y));
  return "<line class='ia-grid' x1='"+x+"' y1='"+tickY+"' x2='"+x+"' y2='DATA_BOTTOM'/>"+
   "<text class='ia-axis' text-anchor='middle' x='"+x+"' y='35'>"+y+"</text>";
 }).join("");
 let y=79,body="",maxPage=1,positions=new Map(),visibleWorks=0,visibleClusters=0,undatedTotal=0;
 const cardWidth=W<500?148:190,cardHeight=68,bucketYears=Math.max(25,Math.ceil((span/(W<530?5:10))/25)*25);
 for(const lane of keys){
  const data=filtered.filter(w=>belongs(w,lane));
  const dated=data.filter(w=>{
   const d=period(w);return d!==null&&d>=S.from&&d<=S.to;
  });
  const undated=data.filter(w=>period(w)===null);
  const figures=historicAuthorities(lane).filter(a=>{
    const d=ce(a.death_ah);return d>=S.from&&d<=S.to;
  });
  undatedTotal+=undated.length;
  if(!dated.length&&!undated.length&&!figures.length)continue;
  const top=y;
  let items=[];
  if(overview){
   const bins=new Map();
   for(const r of dated){
    const b=Math.floor(period(r)/bucketYears)*bucketYears;
    if(!bins.has(b))bins.set(b,[]);
    bins.get(b).push(r);
   }
   items=[...bins.entries()].map(([start,rows])=>({
      type:"cluster",start,end:start+bucketYears-1,rows,
      date:start+bucketYears/2
    }));
  }else{
   const sorted=dated.slice().sort((a,b)=>period(a)-period(b)||a.title.localeCompare(b.title,"ar"));
   const perPage=W<530?24:38;
   maxPage=Math.max(maxPage,Math.ceil(sorted.length/perPage));
   items=sorted.slice((S.page-1)*perPage,S.page*perPage).map(r=>({type:"work",work:r,date:period(r)}));
  }
  for(const a of figures)items.push({type:"jurist",authority:a,date:ce(a.death_ah)});
  items.sort((a,b)=>a.date-b.date||a.type.localeCompare(b.type));
  const rowEnd=[],placed=[];
  for(const item of items){
   const x=clip(scale(item.date));
   const bx=Math.max(left,Math.min(W-right-cardWidth,x+8));
   let row=0;while(row<rowEnd.length&&rowEnd[row]+8>bx)row++;
   rowEnd[row]=bx+cardWidth;
   placed.push({item,x,bx,row});
  }
  const laneHeight=Math.max(102,49+rowEnd.length*83);
  body+="<rect class='dn-lane-background' x='"+left+"' y='"+top+"' width='"+plot+"' height='"+laneHeight+"' rx='4'/>"+
    "<g role='button' tabindex='0' data-dn-lane='"+esc(lane)+"' aria-label='Focus "+esc(groupLabel(lane))+" lane'>"+
    "<text class='dn-lane-name' x='"+(left+5)+"' y='"+(top+20)+"'>"+esc(groupLabel(lane))+
    " · "+dated.length+" dated</text></g>";
  for(const z of placed){
   const {item,x,bx,row}=z,by=top+35+row*83,markerY=by-12;
   body+="<path class='ia-date-glyph ia-date-open' d='M"+x+","+(markerY-5)+" l5,5 -5,5 -5,-5 Z'/>"+
    "<line class='ia-date-stem' x1='"+x+"' x2='"+(bx+8)+"' y1='"+markerY+"' y2='"+(by+8)+"'/>";
   if(item.type==="cluster"){
    body+=overviewCell(lane,item.start,item.end,item.rows.length,bx,by,cardWidth);
    visibleClusters++;
   }else if(item.type==="jurist"){
    body+=scholarButton(item.authority,bx,by,cardWidth);
   }else{
    body+=recordButton(item.work,bx,by,cardWidth,cardHeight);
    positions.set(item.work.id,{x:bx+cardWidth*.5,y:by+cardHeight*.5});
    visibleWorks++;
   }
  }
  if(undated.length){
   body+="<g role='button' tabindex='0' data-dn-undated='"+esc(lane)+"' aria-label='Inspect "+
       undated.length+" undated catalogue records for "+esc(groupLabel(lane))+"'>"+
    "<rect class='dn-undated-chip' x='"+(left+4)+"' y='"+(top+laneHeight-31)+"' width='"+Math.min(plot-8,215)+"' height='25' rx='5'/>"+
    "<text class='dn-undated-label' x='"+(left+11)+"' y='"+(top+laneHeight-14)+"'>"+
    undated.length+" unplaced records · inspect</text></g>";
  }
  y+=laneHeight+13;
 }
 if(y<100)y=190;
 const relationLines=[];
 for(const edge of edges()){
  const a=positions.get(edge.from),b=positions.get(edge.to);
  if(!a||!b)continue;
  const d="M"+a.x+","+a.y+" Q"+((a.x+b.x)/2)+","+((a.y+b.y)/2-38)+" "+b.x+","+b.y;
  relationLines.push("<g role='button' tabindex='0' data-dn-edge='"+esc(edge.id)+
    "' aria-label='Documented relation: "+esc(edge.label)+"'>"+
    "<title>"+esc(edge.label)+"</title><path class='dn-documented-arrow' d='"+d+
    "' marker-end='url(#dn-arrow)'/></g>");
 }
 const axis="<line class='ia-time-axis' x1='"+left+"' x2='"+(W-right)+"' y1='"+tickY+"' y2='"+tickY+"'/>"+
  "<text class='dn-axis-label' x='"+left+"' y='13'>COMMON YEAR AXIS · approximately CE</text>";
 const empty=visibleWorks+visibleClusters===0?
  "<text class='ia-axis' x='"+(left+10)+"' y='"+(tickY+47)+"'>No dated work markers in this window; inspect the unplaced catalogue.</text>":"";
 const defs="<defs><marker id='dn-arrow' viewBox='0 0 10 10' refX='9' refY='5' markerWidth='5' markerHeight='5' orient='auto'><path d='M1 1 L9 5 L1 9Z'/></marker></defs>";
 const totalHeight=Math.max(215,y+12);
 const svg="<svg data-dn-timeline-svg xmlns='http://www.w3.org/2000/svg' role='group' aria-label='"+
  esc((TITLES[genre]||genre)+" chronological work atlas with individual book markers and zoomable era clusters")+
  "' width='"+W+"' height='"+totalHeight+"' viewBox='0 0 "+W+" "+totalHeight+"'>"+
  defs+grid.replaceAll("DATA_BOTTOM",String(totalHeight-20))+axis+relationLines.join("")+body+empty+"</svg>";
 last={timeline:true,bookMarkers:visibleWorks,clusters:visibleClusters,lanes:keys.length,undated:undatedTotal,maxPage,
   view:overview?"era clusters":"individual work markers"};
 return svg;
}
function undatedDiagram(width){
 const W=Math.max(315,width||600),left=12,right=12;
 const key=S.lane||lanes.find(k=>filtered.some(w=>belongs(w,k)&&period(w)===null));
 if(!key)return "<p class='dn-note'>No undated records in this selection.</p>";
 const relevant=filtered.filter(w=>belongs(w,key)&&period(w)===null);
 const per=W<520?20:32,totalPages=Math.max(1,Math.ceil(relevant.length/per));
 S.page=Math.min(Math.max(S.page,1),totalPages);
 const listed=relevant.slice((S.page-1)*per,S.page*per);
 const cols=W<520?2:3,cellW=W<520?(W-30)/2:(W-40)/3,stepY=94;
 const H=Math.max(250,115+Math.ceil(listed.length/cols)*stepY);
 let paths="",nodes="";
 const mid=W/2;
 nodes+="<rect class='dn-unplaced-root' x='"+(mid-100)+"' y='12' width='200' height='56' rx='10'/>"+
  "<text class='dn-unplaced-title' x='"+mid+"' y='33' text-anchor='middle'>"+esc(groupLabel(key))+"</text>"+
  "<text class='dn-unplaced-small' x='"+mid+"' y='52' text-anchor='middle'>"+relevant.length+" records without dates</text>";
 for(let j=0;j<listed.length;j++){
  const x=left+(j%cols)*(cellW+5),y=102+Math.floor(j/cols)*stepY,rec=listed[j];
  paths+="<path class='dn-catalogue-branch' d='M"+mid+",68 Q"+(x+cellW/2)+","+(y-24)+" "+(x+cellW/2)+","+y+"'/>";
  nodes+=recordButton(rec,x,y,cellW,69);
 }
 const svg="<svg data-dn-undated-svg xmlns='http://www.w3.org/2000/svg' role='group' aria-label='Unplaced works, no chronological position' width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"'>"+
   paths+nodes+"</svg>";
 last={timeline:true,unplaced:true,bookMarkers:listed.length,undated:relevant.length,maxPage:totalPages,lanes:1};
 return svg;
}
const CORE_WORDS={
 fiqh:["الموطأ","المدونة","الأم","المبسوط","مختصر القدوري","الهداية","بداية المبتدي",
  "المغني","المهذب","منهاج الطالبين","الكافي","الرسالة","روضة","بدائع الصنائع","التلقين","الاستذكار","الشرح الكبير"],
 usul:["الرسالة","الأصول","المستصفى","المحصول","البرهان","المعتمد","الإحكام","الورقات",
  "تقويم الأدلة","روضة الناظر","جمع الجوامع","كشف الأسرار","اللمع","الموافقات","أصول السرخسي","التحرير"],
 nahw:["الكتاب","المقتضب","المفصل","الألفية","الآجرومية","قطر الندى","المغني","الخصائص",
  "شرح المفصل","اللمع","الإنصاف","الكافية","أوضح المسالك","تسهيل الفوائد"],
 sarf:["الشافية","التصريف","المنصف","الممتع","الاشتقاق","الصرف","المقصود"],
 balagha:["دلائل الإعجاز","أسرار البلاغة","مفتاح العلوم","تلخيص المفتاح","المطول",
  "مختصر المعاني","الإيضاح","المثل السائر","البديع","البيان والتبيين","الصناعتين"],
 hadith:["صحيح البخاري","صحيح مسلم","الموطأ","السنن","الترمذي","شرح صحيح مسلم","فتح الباري"],
 tafsir:["جامع البيان","الكشاف","مفاتيح الغيب","البحر المحيط","التحرير والتنوير",
  "تفسير القرطبي","المحرر الوجيز","روح المعاني"],
 tasawwuf:["الفصوص","فصوص الحكم","الفتوحات","الرسالة القشيرية","لطائف الإشارات","إحياء علوم الدين"],
 lugha:["لسان العرب","مقاييس اللغة","تاج العروس","الصحاح","القاموس المحيط","العين"]
};
function majorScore(w){
 let n=w.sourceType==="openiti"?18:0;
 if(w.pinned)n+=110;
 if(period(w)!==null)n+=18;
 if(w.sourceType==="alreq")n+=w.manuscripts?Math.min(12,Math.log2(w.manuscripts+1)*2):0;
 const title=norm(w.title),roman=norm(w.roman);
 for(const key of CORE_WORDS[genre]||[])if(title.includes(norm(key))||roman.includes(norm(key)))n+=65;
 if(w.readerId&&edges().some(e=>e.from===w.id||e.to===w.id))n+=115;
 if(w.death&&w.death<500)n+=Math.max(0,25-w.death/35);
 return n;
}
function selectMajor(pool,cap=13){
 const candidates=pool.slice().sort((a,b)=>majorScore(b)-majorScore(a)||
  (a.death||99999)-(b.death||99999)||a.title.localeCompare(b.title,"ar"));
 const result=[],authors=new Map();
 for(const w of candidates){
  const key=w.authorKey||norm(w.author),count=authors.get(key)||0;
  if(count>=3&&!edges().some(e=>e.from===w.id||e.to===w.id))continue;
  result.push(w);authors.set(key,count+1);
  if(result.length>=cap)break;
 }
 return result.sort((a,b)=>(a.death||99999)-(b.death||99999)||a.title.localeCompare(b.title,"ar"));
}
function additionalEdges(){
 // Recorded only if the actual source work URIs are present in OpenITI
 // and the book-to-book relation is explicitly described in the cited edition.
 // Based on al-Marghinani edition analysis; school membership alone never qualifies.
 const rules=[
  {id:"FIQH_QUDURI_BIDAYA",from:["Quduri","Mukhtasar"],to:["Marghinani","Bidayat"],
   label:"Source incorporated in al-Bidāya",url:"https://www.islam.museum/en/work/bidayat-al-mubtadi/"},
  {id:"FIQH_SHAYBANI_BIDAYA",from:["MuhammadShaybani","JamicSaghir"],to:["Marghinani","Bidayat"],
   label:"Source incorporated in al-Bidāya",url:"https://www.islam.museum/en/work/bidayat-al-mubtadi/"},
  {id:"FIQH_BIDAYA_HIDAYA",from:["Marghinani","Bidayat"],to:["Marghinani","Hidaya"],
   label:"Authorial commentary on al-Bidāya",url:"https://islam.museum/en/work/al-hidayah-marghinani/"}
 ];
 const find=parts=>works.find(w=>w.sourceType==="openiti"&&parts.every(p=>
   norm(w.id).includes(norm(p))||norm(w.title).includes(norm(p))));
 return rules.map(rule=>{
  const from=find(rule.from),to=find(rule.to);
  return from&&to?{id:rule.id,from:from.id,to:to.id,label:rule.label,
    description:"Documented bibliographical relation described in an edition-based source entry.",url:rule.url,type:"verified bibliographical dependency"}:null;
 }).filter(Boolean);
}
function allVerifiedEdges(){return edges().concat(additionalEdges());}
function renderVertical(width){
 const W=Math.max(330,width||900);
 const keys=lanes.filter(k=>!S.lane||S.lane===k);
 const colW=248,left=78,hdr=92,nodeH=66,step=94;
 const totalW=Math.max(W,left+keys.length*colW+26);
 const selected=new Map(),positions=new Map();
 let maxRows=0;
 for(const key of keys){
  let priority=byLane(key);
  const chosen=selectMajor(priority,18);
  selected.set(key,chosen);maxRows=Math.max(maxRows,chosen.length);
 }
 const h=Math.max(360,hdr+maxRows*step+85);
 let lines="",nodes="",headers="";
 const palette=["#3e7192","#8d673c","#4d7c59","#84688c","#b17f4e","#657d93","#766f88"];
 keys.forEach((key,col)=>{
   const x=left+col*colW,axis=x+112,chosen=selected.get(key)||[],color=palette[col%palette.length];
   headers+="<text class='dn-synopsis-head' x='"+(x+6)+"' y='31'>"+esc(fit(groupLabel(key),27))+"</text>"+
    "<text class='dn-synopsis-sub' x='"+(x+6)+"' y='48'>"+chosen.length+" highlighted works · source cited</text>";
   lines+="<line class='dn-synopsis-lane' x1='"+axis+"' x2='"+axis+"' y1='70' y2='"+(h-32)+"'/>";
   chosen.forEach((w,i)=>{
     const y=hdr+i*step,workX=x+4,width=220;
     const sub=w.death?"author d. "+w.death+" AH · c. "+period(w)+" CE":"Undated · no invented date";
     nodes+="<g role='button' tabindex='0' data-dn-work='"+esc(w.id)+
       "' aria-label='"+esc(w.title+"; "+sub)+"'><title>"+esc(w.title+" by "+w.author)+"</title>"+
       "<rect class='dn-synopsis-node"+(w.id===S.book?" dn-selected":"")+"' x='"+workX+"' y='"+y+
       "' width='"+width+"' height='"+nodeH+"' rx='8' style='--ia-series:"+color+"'/><rect x='"+workX+
       "' y='"+y+"' width='4' height='"+nodeH+"' fill='"+color+"'/>"+
       "<text class='ia-node-title' x='"+(workX+10)+"' y='"+(y+21)+"'>"+esc(fit(w.title,27))+"</text>"+
       "<text class='ia-node-sub' x='"+(workX+10)+"' y='"+(y+39)+"'>"+esc(fit(w.author,25))+"</text>"+
       "<text class='ia-node-date' x='"+(workX+10)+"' y='"+(y+56)+"'>"+esc(fit(sub,34))+"</text></g>";
     positions.set(w.id,{x:workX+width*.5,y:y+nodeH*.5});
   });
 });
 // An arrow appears only when BOTH highlighted texts are joined in the
 // separately attested bibliographic relationship register.
 let verified=0;
 for(const rel of allVerifiedEdges()){
  const a=positions.get(rel.from),b=positions.get(rel.to);if(!a||!b)continue;
  verified++;
  const bend=Math.max(12,Math.min(75,Math.abs(b.y-a.y)*.22));
  const d="M"+a.x+","+(a.y+22)+" C"+(a.x+38)+","+(a.y+38)+" "+(b.x-38)+","+(b.y-bend)+" "+b.x+","+(b.y-22);
  lines+="<g role='button' tabindex='0' data-dn-edge='"+esc(rel.id)+"' aria-label='"+
    esc(rel.label)+"'><title>"+esc(rel.label)+" · select the evidentiary source</title>"+
    "<path class='dn-verified-relation' d='"+d+"' marker-end='url(#dn-arrow)'/></g>";
 }
 let scholars="";
 // Early Fiqh tradition: position the named historical authorities
 // independently, NOT as fictitious authorial texts.
 if(IS_LEGAL(genre)&&(keys.includes("early")||keys.includes("named_other"))){
  const list=jurists.filter(a=>keys.includes("early")&&a.death_ah<=300||
    keys.includes("named_other")&&["personal_circle","historical_nonfour_school"].includes(a.status)).slice(0,16);
  // Only names not already recoverable as surviving books are added to the
  // top region; their undated text record count is not inferred.
  scholars="<text class='dn-synopsis-authority-note' x='15' y='"+(h-12)+"'>"+
   esc(list.length+" named early juridical authorities are available in the dated atlas; their followers and works are not invented.")+"</text>";
 }
 const defs="<defs><marker id='dn-arrow' viewBox='0 0 10 10' refX='9' refY='5' markerWidth='6' markerHeight='6' orient='auto'><path d='M1 1 L9 5 L1 9 Z' fill='#aa7f2c'/></marker></defs>";
 const picture="<svg data-dn-summary-svg xmlns='http://www.w3.org/2000/svg' role='group' width='"+totalW+"' height='"+h+
  "' viewBox='0 0 "+totalW+" "+h+"' aria-label='Principal texts from early to late within each school; only documented textual relations have arrows'>"+
   defs+headers+lines+nodes+scholars+"</svg>";
 last={summary:true,highlights:positions.size,documentedEdges:verified,lanes:keys.length};
 return picture;
}
function chronologyControls(){
 const span=S.to-S.from,center=Math.round((S.to+S.from)/2);
 const min=Math.round(DATE_MIN+span/2),max=Math.round(DATE_MAX-span/2);
 return "<div class='dn-time-controls'><div class='dn-travel'>"+
  "<span>"+DATE_MIN+" CE</span><input type='range' min='"+min+"' max='"+Math.max(min,max)+"' step='5' value='"+
  Math.max(min,Math.min(max,center))+"' data-dn-scrub aria-label='Move focus period on shared timeline'/>"+
  "<span>"+DATE_MAX+" CE</span></div>"+
  "<div class='dn-time-actions' role='group' aria-label='Navigate the subject timeline'>"+
  "<button type='button' data-dn-pan='-1'>← Earlier</button>"+
  "<button type='button' data-dn-zoom='0.55'>+ Zoom</button>"+
  "<button type='button' data-dn-zoom='1.8'>− Zoom</button>"+
  "<button type='button' data-dn-pan='1'>Later →</button>"+
  "<button type='button' data-dn-all-years>All years</button></div>"+
  "<div class='dn-window'>"+
  "<label>From <input type='number' min='"+DATE_MIN+"' max='"+DATE_MAX+"' data-dn-from value='"+S.from+"'/></label>"+
  "<label>To <input type='number' min='"+DATE_MIN+"' max='"+DATE_MAX+"' data-dn-to value='"+S.to+"'/></label>"+
  "<button type='button' data-dn-apply>Apply</button>"+
  "<span class='dn-period-caption'>"+S.from+"–"+S.to+" CE · "+span+" years in view</span></div></div>";
}
function pager(){
 if(S.mode!=="timeline")return "";
 const more=last.maxPage||1;
 if(more<=1)return "";
 return "<div class='dn-pages'><button type='button' data-dn-page='-1'"+(S.page<=1?" disabled":"")+">Previous dated / undated nodes</button>"+
   "<span>Visual page "+S.page+" / "+more+"</span>"+
   "<button type='button' data-dn-page='1'"+(S.page>=more?" disabled":"")+">Next map page</button></div>";
}
function render(args,api){
 argsNow=args;apiNow=api;ctx={args,api};works=api.records;reader=api.reader;genre=getGenre(args);
 if(!jurists.length&&!juristRequest&&!juristError)loadJurists();
 const scope=genre+"|"+args.science+"|"+args.tab+"|"+args.school;
 if(!S.scope){readHash();S.scope=scope;}
 else if(S.scope!==scope){
  const previousScience=S.scope.split("|")[1];S.scope=scope;
  reset(true); // Each discipline/subfield must begin in the familiar chronological atlas.
  if(previousScience!==args.science)S.source="all";
  S.from=630;S.to=1920;
 }
 filtered=works.filter(w=>{
  if(!w.genres.includes(genre))return false;
  if(S.source==="reader"&&!w.pinned)return false;
  if(!["all","reader"].includes(S.source)&&w.sourceType!==S.source)return false;
  if(args.search&&!norm(w.search||[w.title,w.author].join(" ")).includes(norm(args.search)))return false;
  if(IS_LEGAL(genre)&&args.school!=="all")return belongs(w,args.school);
  return true;
 });
 lanes=laneKeys().filter(k=>byLane(k).length||historicAuthorities(k).length);
 if(S.lane&&!lanes.includes(S.lane))S.lane="";
 const datedCount=filtered.filter(w=>period(w)!==null).length;
 const unplacedCount=filtered.length-datedCount;
 const title="<div class='ia-main-head'><div><h2>"+esc(TITLES[genre]||genre)+
  " · "+(S.mode==="timeline"?"Historical work atlas":"Principal texts · vertical synopsis")+"</h2>"+
  "<span class='ia-small'>"+filtered.length.toLocaleString()+" source-specific records · "+datedCount+
  " dated by author death · "+unplacedCount+" unplaced · "+jurists.length+" early jurists in the historical register</span></div>"+
  "<div class='ia-actions'><button type='button' data-action='open-explore'>Other subjects</button>"+
  "<button type='button' data-action='show-all-mapped'>Complete atlas</button></div></div>";
 const note=IS_LEGAL(genre)?
  "Individual jurists, personal circles, the four later madhhabs and other classical schools are different historical categories. Modern Salafi identity is not treated as a fifth classical school.":
  "Linguistic and textual lineage groupings overlap. Mere chronological proximity, membership or title similarity is NOT evidence of textual dependence.";
 const body="<section class='dn-research' aria-label='Interactive GNAMMA-style disciplinary atlas'>"+
  "<p class='dn-caveat'>"+esc(note)+" All years are approximate CE equivalents of source-author death years, never the dates when the books were written.</p>"+
  (S.mode==="timeline"?chronologyControls()+
   "<div class='dn-navigational'>"+(S.undated?"<button type='button' data-dn-undated-back>← Return to dated historical atlas</button>":"")+
   (S.lane?"<button type='button' data-dn-lane=''>All school / textual lanes</button>":"")+"</div>":"")+
  "<div class='dn-composite'>"+
   "<div class='dn-map ia-chart' data-dn-map role='region' tabindex='0' aria-label='Scroll to explore the "+
    (S.mode==="timeline"?"common dated historical work atlas":"vertical principal-texts summary")+
    " diagram'></div>"+detailHTML()+"</div>"+
  "<p class='dn-legend'><span>◇ Approximate author-death marker</span><span>▤ Source-classified work</span>"+
  "<span>— Text family / chronology does not establish influence</span>"+
  "<span>→ Independently documented textual relationship</span></p>"+
  "<p class='dn-brief'>"+(S.mode==="timeline"?
    "Select an era cluster to zoom into its individual books. Select a work for its bibliographic citation. Undated manuscripts remain explicitly unplaced, not pushed onto the year axis.":
    "A selective vertical overview of major authors and texts, arranged from earlier to later within each tradition. Faint vertical tracks mean shared classification; arrows occur only for evidenced relations.")+"</p>"+
  "<p class='dn-source-note'>The map uses original <a target='_blank' rel='noopener noreferrer' href='https://openiti.org/'>OpenITI</a> and "+
  "<a target='_blank' rel='noopener noreferrer' href='https://app.alreq.com/ar/Categories'>Alreq</a> bibliographic records. Their cross-catalogue duplicates are not yet reconciled.</p>"+
  "</section>";
 const main=args.root.querySelector("[data-main]");
 main.innerHTML=title+controls(args)+body;
 const map=main.querySelector("[data-dn-map]");
 const width=Math.max(320,Math.floor(map.clientWidth||map.getBoundingClientRect().width||850));
 if(S.mode==="summary"){
  map.innerHTML=renderVertical(width);map.classList.add("dn-summary-map");map.classList.remove("dn-timeline-map");
 }else{
  map.classList.add("dn-timeline-map");map.classList.remove("dn-summary-map");
  map.innerHTML=S.undated?undatedDiagram(width):svgTimeline(width);
  if((last.maxPage||1)>1)map.insertAdjacentHTML("afterend",pager());
 }
 args.onCounts(filtered.length,edges().filter(e=>filtered.some(x=>x.id===e.from)&&filtered.some(x=>x.id===e.to)).length);
 saveHash();
 lastUI={mode:S.mode,genre,lanes:lanes.length,dated:datedCount,unplaced:unplacedCount};
}
function refresh(){if(argsNow?.isActive())render(argsNow,apiNow);}
function selectedWork(id,relation=false){
 if(relation){S.edge=id;S.book="";}
 else{S.book=id;S.edge="";}
 const existing=host.querySelector(".dn-detail");
 if(!existing)return refresh();
 const wrapper=document.createElement("div");wrapper.innerHTML=detailHTML();
 existing.replaceWith(wrapper.firstElementChild);
 host.querySelectorAll("[data-dn-work]").forEach(el=>el.classList.toggle("dn-picked",el.getAttribute("data-dn-work")===S.book));
 saveHash();
 if(S.book&&window.matchMedia?.("(max-width:700px)")?.matches)
   host.querySelector(".dn-detail")?.scrollIntoView({block:"nearest"});
}
function onClick(event){
 const el=event.target.closest(
 "[data-dn-work],[data-dn-scholar],[data-dn-edge],[data-dn-cluster],[data-dn-undated],"+
 "[data-dn-lane],[data-dn-mode],[data-dn-pan],[data-dn-zoom],[data-dn-page],"+
 "[data-dn-all-years],[data-dn-reset],[data-dn-apply],[data-dn-undated-back],[data-dn-close]");
 if(!el||!host.contains(el))return;
 event.preventDefault();
 if(el.hasAttribute("data-dn-work")){selectedWork(el.getAttribute("data-dn-work"));return;}
 if(el.hasAttribute("data-dn-scholar")){selectedWork("jurist:"+el.getAttribute("data-dn-scholar"));return;}
 if(el.hasAttribute("data-dn-edge")){selectedWork(el.getAttribute("data-dn-edge"),true);return;}
 if(el.hasAttribute("data-dn-close")){selectedWork("");return;}
 if(el.hasAttribute("data-dn-mode")){S.mode=el.getAttribute("data-dn-mode");S.book="";S.edge="";S.page=1;refresh();return;}
 if(el.hasAttribute("data-dn-cluster")){
  const [lane,startText,endText]=el.getAttribute("data-dn-cluster").split("|");
  const start=Number(startText),end=Number(endText);
  S.lane=lane;
  // The overview must drill to individual dated books, including on narrow
  // touch screens where a 250-year cluster would still be 'overview' mode.
  const members=byLane(lane).filter(w=>period(w)!==null&&period(w)>=start&&period(w)<=end)
    .sort((a,b)=>period(a)-period(b));
  const anchor=members.length?period(members[Math.floor((members.length-1)/2)]):(start+end)/2;
  const target=Math.min(window.innerWidth<530?180:260,Math.max(70,end-start+40));
  years(anchor-target/2,anchor+target/2);refresh();return;
 }
 if(el.hasAttribute("data-dn-lane")){
  S.lane=el.getAttribute("data-dn-lane");S.page=1;S.undated=false;refresh();return;
 }
 if(el.hasAttribute("data-dn-undated")){
  S.lane=el.getAttribute("data-dn-undated");S.undated=true;S.page=1;refresh();return;
 }
 if(el.hasAttribute("data-dn-undated-back")){S.undated=false;S.page=1;refresh();return;}
 if(el.hasAttribute("data-dn-all-years")){S.from=DATE_MIN;S.to=DATE_MAX;S.page=1;refresh();return;}
 if(el.hasAttribute("data-dn-reset")){reset(false);S.from=630;S.to=1920;refresh();return;}
 if(el.hasAttribute("data-dn-pan")){shift(Number(el.getAttribute("data-dn-pan"))*.48);refresh();return;}
 if(el.hasAttribute("data-dn-zoom")){zoom(Number(el.getAttribute("data-dn-zoom")));refresh();return;}
 if(el.hasAttribute("data-dn-page")){S.page+=Number(el.getAttribute("data-dn-page"));refresh();return;}
 if(el.hasAttribute("data-dn-apply")){
  const start=Number(host.querySelector("[data-dn-from]")?.value),end=Number(host.querySelector("[data-dn-to]")?.value);
  if(Number.isFinite(start)&&Number.isFinite(end)&&end>start){years(start,end);refresh();}
  return;
 }
}
function onChange(event){
 if(event.target.matches("[data-dn-source]")){
  S.source=event.target.value;reset(true);refresh();return;
 }
 if(event.target.matches("[data-dn-scrub]")){
  const c=Number(event.target.value),span=S.to-S.from;years(c-span/2,c+span/2);refresh();
 }
}
let pointer=null;
function down(event){
 const chart=event.target.closest(".dn-timeline-map");
 if(!chart||event.target.closest("[data-dn-work],[data-dn-cluster],[data-dn-undated],[data-dn-scholar],[data-dn-edge],[data-dn-lane]"))return;
 pointer={x:event.clientX,from:S.from,to:S.to};
}
function up(event){
 if(!pointer)return;
 const old=pointer;pointer=null;
 const dx=event.clientX-old.x;
 if(Math.abs(dx)<30||S.mode!=="timeline"||S.undated)return;
 const chart=host.querySelector(".dn-timeline-map"),w=chart?.clientWidth||600;
 const shiftYears=-dx/w*(old.to-old.from);
 years(old.from+shiftYears,old.to+shiftYears);refresh();
}
let resizeTimer;
host.addEventListener("click",onClick);
host.addEventListener("change",onChange);
host.addEventListener("pointerdown",down);
host.addEventListener("pointerup",up);
host.addEventListener("keydown",event=>{
 const el=event.target.closest("[data-dn-work],[data-dn-scholar],[data-dn-edge],[data-dn-cluster],[data-dn-undated],[data-dn-lane]");
 if(el&&["Enter"," "].includes(event.key)){
  event.preventDefault();el.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true}));return;
 }
 if(event.target.closest(".dn-timeline-map")&&event.key==="ArrowRight"){event.preventDefault();shift(.13);refresh();}
 if(event.target.closest(".dn-timeline-map")&&event.key==="ArrowLeft"){event.preventDefault();shift(-.13);refresh();}
});
window.addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(refresh,220);});
window.addEventListener("popstate",()=>{readHash();refresh();});
window.GNDisciplineAtlas={render,debug:()=>({genre,mode:S.mode,from:S.from,to:S.to,lane:S.lane,undated:S.undated,
 records:filtered.length,dated:filtered.filter(x=>period(x)!==null).length,
 unplaced:filtered.filter(x=>period(x)===null).length,
 page:S.page,svg:host.querySelectorAll("[data-dn-map] svg").length,
 source:S.source,selected:S.book,schools:lanes.length,jurists:jurists.length})};
})();

