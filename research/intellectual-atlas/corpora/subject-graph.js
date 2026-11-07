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
  '<svg data-gnv-svg role="group" xmlns="http://www.w3.org/2000/svg" width="'+Math.round(w*model.zoom)+
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
function focus(mobile){
 const g=model.group||"works",a=model.author?authorities.find(x=>x.id===model.author):null;
 const pool=a?recordsFor(g).filter(b=>findAuthority(b,a)):recordsFor(g);
 const ordered=mix(pool,pool.length);
 const per=mobile?20:32,totalPages=Math.max(1,Math.ceil(pool.length/per));
 model.page=Math.max(1,Math.min(totalPages,model.page));
 const shown=ordered.slice((model.page-1)*per,model.page*per);
 const featured=a?[]:historical(g),cols=mobile?2:4;
 const headRows=Math.ceil(featured.length/(mobile?2:4));
 const start=mobile?245+headRows*88:160+headRows*83;
 const width=mobile?420:1460,height=Math.max(440,start+Math.ceil(shown.length/cols)*(mobile?109:99)+75);
 const rootX=mobile?210:118,rootY=mobile?52:height/2,hubX=mobile?210:357,hubY=mobile?139:height/2;
 let paths=edge(rootX,rootY,hubX,hubY);
 let nodes=node("home","",names[genre]||genre,"Back to subject graph",rootX,rootY,mobile?190:196,67);
 nodes+=node("group",g,a?.name||category(g),pool.length.toLocaleString()+" cited work records",
   hubX,hubY,mobile?223:235,78);
 for(let j=0;j<featured.length;j++){
  const scholar=featured[j],x=mobile?(j%2?315:105):(255+(j%4)*318);
  const y=(mobile?242:126)+Math.floor(j/(mobile?2:4))*(mobile?88:83);
  const n=pool.filter(b=>findAuthority(b,scholar)).length;
  paths+=edge(hubX,hubY,x,y);
  nodes+=node("jurist",scholar.id,scholar.name,"d. "+scholar.death_ah+" AH · "+n+" cited records",
   x,y,mobile?189:234,69);
 }
 const pos=new Map();
 for(let j=0;j<shown.length;j++){
  const r=shown[j],x=mobile?(j%2?315:105):(570+(j%cols)*265);
  const y=start+Math.floor(j/cols)*(mobile?109:99);
  paths+=edge(hubX,hubY,x,y);
  nodes+=node("book",r.id,r.title,sourceStamp(r),x,y,mobile?189:230,74);
  if(r.readerId)pos.set(r.readerId,{x,y});
 }
 let documented=0;
 for(const relation of reader?.relationships||[]){
  const a=pos.get(relation.source),b=pos.get(relation.target);
  if(!a||!b)continue;
  paths+=edge(a.x,a.y+18,b.x,b.y-18,true,relation.source_url);documented++;
 }
 return {picture:svg(paths+nodes,width,height,"Interactive diagram with individual named books and jurists"),
   pages:totalPages,count:pool.length,bookNodes:shown.length,jurists:featured.length,documented};
}
function citation(r){
 const u=url(r.url);
 return u?'<a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+
   esc(r.sourceType==="alreq"?"Original manuscript catalogue entry":"OpenITI digital-version metadata")+'</a>':
   'Source URL unavailable';
}
function detail(){
 const b=cached.find(x=>x.id===model.book),a=authorities.find(x=>x.id===model.book);
 if(!b&&!a)return '<aside class="gnv-detail" data-gnv-detail hidden></aside>';
 let result="";
 if(a){
  const status={
   individual_jurist:"Individual early jurist; a separate school is not presumed",
   personal_circle:"Personal circle or historically attributed legal line",
   historical_nonfour_school:"Named non-four legal tradition",
   founding_eponym:"Early eponym; later doctrinal school formed after his lifetime"};
  result='<p class="gnv-type">Historical juristic authority</p><h3>'+esc(a.name)+'</h3>'+
   '<p dir="rtl" lang="ar">'+esc(a.arabic)+'</p><dl><dt>Death</dt><dd>'+a.death_ah+' AH</dd>'+
   '<dt>School status</dt><dd>'+esc(status[a.status]||a.status)+'</dd></dl><p>'+esc(a.description)+'</p>'+
   '<p class="gnv-citation">'+(a.evidence_urls||[]).map((u,i)=>url(u)?
     '<a href="'+esc(url(u))+'" target="_blank" rel="noopener noreferrer">Historical source '+(i+1)+'</a>':"").join(" · ")+'</p>'+
   '<p class="gnv-qualification">An individual jurist need not have founded a durable institutional madhhab. No unattested book is inserted.</p>';
 }else{
  result='<p class="gnv-type">Individual bibliographic work</p><h3 dir="rtl" lang="ar">'+esc(b.title)+'</h3>'+
   '<p>'+esc(b.author||"Author unknown")+'</p><dl>'+
   '<dt>Dating</dt><dd>'+esc(b.death?"Author d. "+b.death+" AH; not date of composition":"Unplaced (author dating unavailable)")+'</dd>'+
   '<dt>Disciplines</dt><dd>'+esc(b.genres.join(", "))+'</dd>'+
   '<dt>School(s)</dt><dd>'+esc(b.schools.map(x=>schools[x]||x).join(", ")||"Unassigned")+'</dd>'+
   '<dt>School evidence</dt><dd>'+esc(b.schoolEvidence||"Not independently established")+'</dd>'+
   '<dt>Textual routes</dt><dd>'+esc(b.lines.map(category).join(" · ")||"Not established")+'</dd>'+
   '<dt>Record</dt><dd>'+esc(sourceStamp(b))+'</dd></dl>'+
   '<p>'+esc(b.sourceNote||"")+'</p>'+
   (b.manuscripts?'<p>Catalogue reports '+b.manuscripts+' manuscript entries, not independently checked.</p>':"")+
   '<p class="gnv-citation">'+citation(b)+'</p>'+
   '<p class="gnv-qualification">Dashed graph branches show bibliographic classification, not a documented teacher, commentary or jurisprudential influence.</p>';
 }
 return '<aside class="gnv-detail" data-gnv-detail role="region" aria-label="Book or jurist source evidence">'+
   '<div class="gnv-detail-head"><strong>Node details &amp; citations</strong>'+
   '<button type="button" data-gnv-close aria-label="Close details">×</button></div>'+result+'</aside>';
}
function saveHash(){
 const q=new URLSearchParams(location.hash.slice(1));
 for(const [key,value]of [["gn_group",model.group],["gn_author",model.author],["gn_work",model.book],
   ["gn_source",model.source],["gn_page",model.page>1?String(model.page):""],
   ["gn_zoom",model.zoom!==1?String(model.zoom):""]]){
  if(!value||value==="all")q.delete(key);else q.set(key,value);
 }
 const hash="#"+q.toString();
 if(location.hash!==hash)try{history.replaceState(null,"",hash)}catch{location.hash=hash}
}
function readHash(){
 const p=new URLSearchParams(location.hash.slice(1));
 model.group=p.get("gn_group")||"";model.author=p.get("gn_author")||"";
 model.book=p.get("gn_work")||"";
 model.source=sourceIds.includes(p.get("gn_source"))?p.get("gn_source"):"all";
 model.page=Math.max(1,Number(p.get("gn_page"))||1);
 model.zoom=Math.max(.65,Math.min(1.5,Number(p.get("gn_zoom"))||1));
}
function render(args,api){
 cached=api.records;reader=api.reader;
 genre=gen(args);
 const key=genre+"|"+args.science+"|"+args.tab+"|"+args.school;
 if(!model.scope){readHash();model.scope=key;}
 else if(model.scope!==key){const previousScience=model.scope.split("|")[1];model.scope=key;model.group="";model.author="";model.book="";model.page=1;if(previousScience!==args.science)model.source="all";}
 if(!authorities.length&&!earlyFetch&&!loadError){
  earlyFetch=fetch("corpora/early-jurists.json").then(r=>{
   if(!r.ok)throw Error("Historical authority source HTTP "+r.status);return r.json();
  }).then(j=>{
   if(!Array.isArray(j.authorities))throw Error("Bad authority schema");authorities=j.authorities;
  }).catch(e=>{loadError=String(e)}).finally(()=>{
   earlyFetch=null;if(context?.args?.isActive())render(context.args,context.api);
  });
 }
 context={args,api};
 // A provider with no records for a newly chosen science must not turn the
 // subject map into an empty diagram. Fall back to all cited sources.
 if(model.source!=="all"&&!cached.some(r=>r.genres.includes(genre)&&
   (model.source==="reader"?r.pinned:r.sourceType===model.source)))model.source="all";
 filtered=cached.filter(r=>r.genres.includes(genre)&&
   (model.source==="all"||model.source==="reader"&&r.pinned||r.sourceType===model.source)&&
   (!args.search||r.search.includes(norm(args.search)))&&
   (!["fiqh","usul"].includes(genre)||args.school==="all"||
     ["hanafi","maliki","shafii","hanbali"].includes(args.school)&&r.schools.includes(args.school)||
     args.school==="early"&&early(r)||args.school==="named_other"&&other(r)||
     args.school==="unassigned"&&!r.schools.some(x=>["hanafi","maliki","shafii","hanbali"].includes(x))));
 groups=buildGroups();
 if(!model.group&&["fiqh","usul"].includes(genre)&&args.school!=="all")model.group=args.school;
 if(model.group&&!groups.some(x=>x.key===model.group)&&model.group!=="works"){
   model.group="";model.author="";model.page=1;
 }
 const mobile=window.matchMedia?.("(max-width:700px)")?.matches||false;
 const visual=model.group?focus(mobile):{picture:overview(mobile),pages:1,bookNodes:0};
 const title='<div class="ia-main-head"><div><h2>'+esc(names[genre]||genre)+' · Interactive work graph</h2>'+
   '<span class="ia-small">'+filtered.length.toLocaleString()+' bibliographic records · '+
   authorities.length+' historically registered early jurists · counted records are not fully deduplicated works</span></div>'+
   '<div class="ia-actions"><button type="button" data-action="open-explore">Other subjects</button>'+
   '<button type="button" data-action="show-all-mapped">Historical atlas</button></div></div>';
 const tabs='<div class="gnv-tabs" role="group" aria-label="Subject subfields">'+
   (args.tabs||[]).map(([k,v])=>'<button type="button" data-source-tab="'+esc(k)+
   '" aria-pressed="'+(args.tab===k)+'">'+esc(v)+'</button>').join("")+'</div>';
 const schoolTabs=["fiqh","usul"].includes(genre)?'<div class="gnv-tabs gnv-schools" role="group" aria-label="Historic madhhab / juristic circles">'+
   [["all","All"],["hanafi","Ḥanafī"],["maliki","Mālikī"],["shafii","Shāfiʿī"],["hanbali","Ḥanbalī"],
    ["early","Early jurists"],["named_other","Other schools"],["unassigned","Unassigned"]]
   .map(([k,v])=>'<button type="button" data-source-madhhab="'+k+
   '" aria-pressed="'+(args.school===k)+'">'+v+'</button>').join("")+'</div>':"";
 const evidence='<label class="gnv-evidence-select">Sources <select data-gnv-evidence>'+
   [["all","All cited records"],["openiti","OpenITI metadata"],["alreq","Manuscript catalogue"],["reader","Pinned GNAMMA"]]
   .map(([k,v])=>'<option value="'+k+'"'+(model.source===k?" selected":"")+'>'+v+'</option>').join("")+'</select></label>';
 const zoom='<div class="gnv-zoom" role="group" aria-label="Graph zoom controls">'+
  '<button type="button" data-gnv-zoom="-1" aria-label="Zoom out">−</button>'+
  '<span>'+Math.round(model.zoom*100)+'%</span>'+
  '<button type="button" data-gnv-zoom="1" aria-label="Zoom in">+</button>'+
  '<button type="button" data-gnv-zoom="0" aria-label="Reset zoom">Fit</button></div>';
 const back=model.group?'<button type="button" data-gnv-back>‹ '+(model.author?"Back to juristic circles":"Show full subject graph")+'</button>':"";
 const pager=model.group?'<div class="gnv-pager"><button type="button" data-gnv-page="-1"'+
  (model.page<=1?" disabled":"")+'>‹ Previous graph</button><span>Page '+model.page+' / '+visual.pages+
  '</span><button type="button" data-gnv-page="1"'+(model.page>=visual.pages?" disabled":"")+
  '>Next graph ›</button></div>':"";
 const caution=["fiqh","usul"].includes(genre)?
  "Personal legal circles and named non-four schools are distinct from the later four established Sunni madhhabs; no modern Salafi madhhab is inserted.":
  ["nahw","sarf","balagha"].includes(genre)?
  "Overlapping grammar and rhetorical branches are provisional, and must not be mistaken for verified commentary or influence relations.":
  "Only book-authority records are mapped. Report variants, isnāds and passage-level interpretive connections have not been collated.";
 const image='<section class="gnv-picture" aria-label="Real interactive subject-book SVG graph">'+
   '<div class="gnv-legend"><span><i class="gnv-key-class"></i>Classification</span>'+
   '<span><i class="gnv-key-verified"></i>Documented relation</span>'+
   '<span><i class="gnv-key-jurist"></i>Early jurist / non-four circle</span></div>'+
   '<p class="gnv-caution">'+esc(caution)+'</p><div class="gnv-layout">'+visual.picture+detail()+'</div>'+
   '<p class="gnv-hint">Every title shown is a selectable node on the diagram. Select a group to drill into more book nodes; use zoom and swipe or scroll inside the graph. Individual citations open in the side panel, not a book list.</p>'+
   '<p class="gnv-credit">Source registers: <a href="https://app.alreq.com/ar/Categories" target="_blank" rel="noopener noreferrer">Alreq</a> and <a href="https://openiti.org/" target="_blank" rel="noopener noreferrer">OpenITI</a>. Dashed classification edges are NOT historical transmissions.</p></section>';
 root.querySelector("[data-main]").innerHTML=title+tabs+schoolTabs+
   '<div class="gnv-toolbar">'+back+evidence+zoom+'</div>'+pager+image;
 args.onCounts(filtered.length,0);lastGraph.mode=model.group?"focus":"overview";
 lastGraph.svg=root.querySelectorAll("[data-gnv-svg]").length;
 lastGraph.books=root.querySelectorAll(".gnv-book").length;lastGraph.groups=groups.length;
 saveHash();
}
function redraw(){
 if(!context)return;
 render(context.args,context.api);
 const v=root.querySelector("[data-gnv-canvas]");if(v){v.scrollTop=0;v.scrollLeft=0;}
}
function selectBook(id){
 model.book=id;
 const old=root.querySelector("[data-gnv-detail]");
 if(old){
  const shell=document.createElement("div");shell.innerHTML=detail();
  old.replaceWith(shell.firstElementChild);
 }
 root.querySelectorAll(".gnv-picked").forEach(x=>x.classList.remove("gnv-picked"));
 root.querySelectorAll(".gnv-node").forEach(x=>{
  if((x.getAttribute("data-gnv-book")||x.getAttribute("data-gnv-jurist"))===id)x.classList.add("gnv-picked");
 });
 saveHash();
 if(model.book&&window.matchMedia?.("(max-width:700px)")?.matches)
   root.querySelector("[data-gnv-detail]")?.scrollIntoView({block:"nearest"});
}
root.addEventListener("click",event=>{
 const x=event.target.closest("[data-gnv-group],[data-gnv-jurist],[data-gnv-book],[data-gnv-home],[data-gnv-back],[data-gnv-page],[data-gnv-close],[data-gnv-zoom]");
 if(!x||!root.contains(x))return;
 event.preventDefault();
 if(x.hasAttribute("data-gnv-home")){
   model.group="";model.author="";model.book="";model.page=1;redraw();
 }else if(x.hasAttribute("data-gnv-group")){
   model.group=x.getAttribute("data-gnv-group");
   model.author="";model.book="";model.page=1;redraw();
 }else if(x.hasAttribute("data-gnv-jurist")){
   const id=x.getAttribute("data-gnv-jurist");
   if(model.group==="early"||model.group==="named_other"){
    model.author=id;model.page=1;model.book=id;redraw();
   }else selectBook(id);
 }else if(x.hasAttribute("data-gnv-book"))selectBook(x.getAttribute("data-gnv-book"));
 else if(x.hasAttribute("data-gnv-close"))selectBook("");
 else if(x.hasAttribute("data-gnv-back")){
   if(model.author){model.author="";model.book="";}
   else{model.group="";model.book="";}
   model.page=1;redraw();
 }else if(x.hasAttribute("data-gnv-page")){
   model.page+=Number(x.getAttribute("data-gnv-page"))||0;model.book="";redraw();
 }else if(x.hasAttribute("data-gnv-zoom")){
   const step=Number(x.getAttribute("data-gnv-zoom"))||0;
   model.zoom=step===0?1:Math.max(.65,Math.min(1.5,Math.round((model.zoom+step*.15)*100)/100));
   const image=root.querySelector("[data-gnv-svg]");
   if(image){const b=image.viewBox.baseVal;image.setAttribute("width",Math.round(b.width*model.zoom));
    image.setAttribute("height",Math.round(b.height*model.zoom));}
   root.querySelector(".gnv-zoom span").textContent=Math.round(model.zoom*100)+"%";
   saveHash();
 }
});
root.addEventListener("change",event=>{
 const x=event.target.closest("[data-gnv-evidence]");
 if(!x)return;
 model.source=x.value;model.group="";model.author="";model.book="";model.page=1;redraw();
});
root.addEventListener("keydown",event=>{
 const x=event.target.closest("[data-gnv-group],[data-gnv-jurist],[data-gnv-book],[data-gnv-home]");
 if(!x||!["Enter"," "].includes(event.key))return;
 event.preventDefault();x.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true}));
});
window.addEventListener("popstate",()=>{readHash();if(context?.args?.isActive())redraw()});
window.GNAtlasGraph={render,debug:()=>({mode:lastGraph.mode,bookNodes:lastGraph.books,
 groups:lastGraph.groups,svg:lastGraph.svg,genre,group:model.group,
 authority:model.author,selected:model.book,records:filtered.length,
 jurists:authorities.length,page:model.page,zoom:model.zoom,loadError})};
})();
