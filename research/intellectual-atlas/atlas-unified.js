(function GNAMMAUnifiedAtlas(){
"use strict";
const ROOT=document.getElementById("gn-atlas");if(!ROOT)return;
const SUBJECTS=[
 ["all","All sciences"],["intellectual","Philosophy & kalām"],["fiqh","Fiqh"],["usul","Uṣūl al-fiqh"],
 ["nahw","Naḥw"],["sarf","Ṣarf"],["balagha","Balāgha"],["lugha","Lexicography"],
 ["hadith","Hadith"],["tafsir","Tafsīr"],["tasawwuf","Taṣawwuf"]
];
const NAMES=Object.fromEntries(SUBJECTS);
const SCHOOLS={all:"All schools",hanafi:"Ḥanafī",maliki:"Mālikī",shafii:"Shāfiʿī",hanbali:"Ḥanbalī",early:"Early jurists",named_other:"Other historical schools",unassigned:"Unassigned"};
const FAMILY_NAMES={ancient:"Greek & late antique",neoplatonic:"Neoplatonism",translation:"Translation movements",
falsafa:"Falsafa",avicennan:"Avicennan",ishraqi:"Illuminationism",sadrian:"Ṣadrian",ashari:"Ashʿarī",maturidi:"Māturīdī",mutazili:"Muʿtazilī",sunni:"Sunni kalām",
imami:"Imāmī",akbarian:"Akbarian",christian:"Christian Arabic",jewish:"Jewish Arabic",critical:"Later critics",context:"Contexts"};
const PERIOD_MIN=-650,PERIOD_MAX=2050,MAX_SEARCH=250;
const GAZETTEER=[
 ["Baghdad",33.31,44.36,/\bbaghdad\b/i],["Basra",30.50,47.81,/\bbasra\b/i],["Kufa",32.03,44.40,/\bkufa\b/i],
 ["Cairo",30.04,31.24,/\bcairo\b/i],["Damascus",33.51,36.29,/\bdamascus\b/i],
 ["Aleppo",36.20,37.16,/\baleppo\b/i],["Istanbul",41.01,28.98,/\bistanbul\b/i],
 ["Konya",37.87,32.49,/\bkonya\b/i],["Isfahan",32.65,51.67,/\bisfahan\b/i],["Shiraz",29.60,52.53,/\bshiraz\b/i],
 ["Nishapur",36.21,58.80,/\bnishapur\b/i],["Herat",34.35,62.20,/\bherat\b/i],
 ["Bukhara",39.77,64.42,/\bbukhara\b/i],["Samarqand",39.65,66.96,/\bsamarqand|samarkand\b/i],
 ["Rayy",35.61,51.43,/\brayy\b/i],["Delhi",28.61,77.21,/\bdelhi\b/i],
 ["Lucknow",26.85,80.95,/\blucknow\b/i],["Tunis",36.81,10.18,/\btunis\b/i],
 ["Cordoba",37.89,-4.78,/\bcordoba|córdoba\b/i],["Mecca",21.42,39.83,/\bmecca|makkah\b/i],
 ["Medina",24.47,39.61,/\bmedina|madinah\b/i]
];
const TYPENAMES={commentary:"Commentary",gloss:"Gloss",component:"Constituent section",translation_adaptation:"Translation / adaptation",
textual_use:"Textual use",author_reference:"Author reference",critique:"Critical engagement",reported_doctrine:"Reported teaching",
reported_source:"Source testimony",exchange:"Scholarly exchange",broad_influence:"Qualified connection",hypothesis:"Hypothesis",
claimed_lineage:"Claimed lineage",abridgement:"Abridgement",translation:"Translation",other:"Relationship"};
const state={subject:"all",view:"geography",school:"all",search:"",source:"all",family:"",edgeType:"all",certainty:"all",
from:-600,to:2026,selected:"",evidence:"",cluster:"",clusterPage:1,bookPage:1,depth:1,quickLimit:8,region:"",searchOpen:false,advancedOpen:false};
const data={all:[],byId:new Map(),edges:[],in:new Map(),out:new Map(),families:[],sources:new Map(),history:[],
errors:[],counts:{audited:0,openiti:0,alreq:0,pinned:0,relations:0},licences:[],loadReady:false};
const renderCache={clusters:new Map(),workMap:new Map(),current:[],filtered:[],lanes:[],network:null};
const safe=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const normal=x=>String(x??"").normalize("NFKD").replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/[ʿʾ’'`]/g,"").toLowerCase();
const truncate=(x,n=30)=>Array.from(String(x??"")).length>n?Array.from(String(x??"")).slice(0,n-1).join("")+"…":String(x??"");
const ahce=y=>Number.isFinite(+y)&&+y>0?Math.round(622+(+y-1)*0.970224):null;
const validURL=x=>{if(!x||!String(x).trim())return "";try{const u=new URL(String(x),location.href);return ["http:","https:"].includes(u.protocol)?u.href:""}catch{return ""}};
const uniq=arr=>[...new Set((arr||[]).filter(Boolean))];
const fnum=n=>Number(n||0).toLocaleString();
function addWork(x){
 if(data.byId.has(x.id))return;
 x.subjects=uniq(x.subjects||[]);
 x.schools=uniq(x.schools||[]);
 x.lines=uniq(x.lines||[]);
 x.sourceIds=uniq(x.sourceIds||[]);
 x.year=x.year===null||x.year===undefined||!Number.isFinite(+x.year)?null:Number(x.year);
 x.kind=x.kind||"work";
 x.searchText=normal([x.title,x.arabic,x.author,x.id,x.family,x.tradition,x.region,(x.lines||[]).join(" "),x.roman].join(" "));
 data.byId.set(x.id,x);data.all.push(x);
}
function canonicalSubject(n){
 const tr=n.tradition||"";
 return tr==="akbarian"?"tasawwuf":"intellectual";
}
function loadCanonical(d){
 data.families=Array.isArray(d.textual_families)?d.textual_families:[];
 data.history=[...(d.history?.periods||[]),...(d.history?.events||[]),...(d.history?.networks||[])];
 for(const s of [...(d.sources||[]),...(d.history?.sources||[])])data.sources.set(s.id,s);
 for(const n of d.nodes||[]){
  addWork({id:"c:"+n.id,sourceId:n.id,title:n.title||"",arabic:n.title_ar||"",roman:n.title||"",author:n.author||"",
  authorDates:n.author_dates||"",subjects:uniq(["intellectual",...(canonicalSubject(n)==="tasawwuf"?["tasawwuf"]:[])]),schools:[],
  year:n.temporal?.anchor??null,yearKind:n.temporal?.kind||n.date_status||"qualified",dateLabel:n.date_label||"",
  dateNote:n.temporal?.note||n.date_note||"",kind:n.node_type||"work",tradition:n.tradition||"context",
  family:n.family||"",region:n.region||"",provenance:"audited",layer:"audited",sourceIds:n.sources||[],
  note:n.note||"",intro:n.summary||"",reader:n.tajrid_reader||null,pinned:false,lines:[],
  featured:!!n.featured,date_status:n.date_status||"",size:n.size||"",external:[],survival:"unrecorded"});
 }
 data.counts.audited=d.nodes?.length||0;
 for(const e of d.edges||[])addEdge({id:"c:"+e.id,from:"c:"+e.source,to:"c:"+e.target,type:e.relation,
  label:e.label||e.relation||"Textual relationship",confidence:e.confidence||"qualified",
  evidence:e.evidence||"",evidenceKind:e.evidence_kind||"Bibliographical research",sourceIds:e.sources||[],origin:"canonical"});
}
function addEdge(e){if(!data.byId.has(e.from)||!data.byId.has(e.to))return;data.edges.push(e)}
function loadMetadata(oi,ms,registry,early){
 const pinned=new Map((registry?.books||[]).filter(b=>b.openiti?.book_uri).map(b=>[b.openiti.book_uri,b]));
 const readerIndex=new Map(),bookURIs=new Set();
 const works=oi?.works||[];
 for(const w of works){
  const id="oi:"+w.book_uri;if(!w.book_uri)continue;
  const pin=pinned.get(w.book_uri);bookURIs.add(w.book_uri);
  const subjects=uniq([...(w.genres||[]),...(pin?.disciplines||[])]);
  const y=ahce(w.death_ah);
  addWork({id,sourceId:w.book_uri,title:w.title_lat||w.title_ar||w.book_uri,arabic:w.title_ar||"",
   roman:w.title_lat||"",author:w.author_lat||w.author_ar||"",authorDates:w.death_ah?"d. "+w.death_ah+" AH":"",
   subjects,schools:w.school?[w.school]:pin?.madhhab&&pin.madhhab!=="comparative"?[pin.madhhab]:[],
   year:y,yearKind:"author_death_proxy",dateLabel:w.death_ah?"Author d. "+w.death_ah+" AH, approx. "+y+" CE":"Undated",
   dateNote:"Approximate CE conversion of an author's death year, not a composition date.",kind:"work",
   tradition:"",family:"",region:"",provenance:"OpenITI",layer:"bibliographic",pinned:!!pin,readerId:pin?.id||"",
   sourceURL:w.source_url||pin?.openiti?.source_page||"",sourceIds:[],lines:w.lineages||[],
   note:"Original OpenITI work/version metadata; the text has not been collated by GNAMMA.",
   warning:w.ocr_warning?"Source text may include uncorrected OCR.":"",
   schoolEvidence:w.school_evidence||"",version:w.version_uri||"",survival:"digital-version"});
  if(pin)readerIndex.set(pin.id,id);
 }
 data.counts.openiti=works.length;
 for(const b of registry?.books||[]){
  if(readerIndex.has(b.id))continue;
  const id="pin:"+b.id;const y=ahce(b.death_ah);
  addWork({id,sourceId:b.id,title:b.title||b.title_ar||b.id,arabic:b.title_ar||"",roman:b.title||"",
   author:b.author||"",authorDates:b.death_ah?"d. "+b.death_ah+" AH":"",
   subjects:b.disciplines||[],schools:b.madhhab&&b.madhhab!=="comparative"?[b.madhhab]:[],
   year:y,yearKind:"author_death_proxy",dateLabel:b.death_ah?"Author d. "+b.death_ah+" AH, approx. "+y+" CE":"Undated",
   dateNote:"Approximate date based on author death, not a composition year.",kind:"work",tradition:"",
   family:"",region:"",provenance:"GNAMMA pinned",layer:"bibliographic",pinned:true,readerId:b.id,
   sourceURL:b.openiti?.source_page||"",lines:[],note:"Pinned source version; manuscript and edition collation not implied.",
   version:b.openiti?.version_uri||"",schoolEvidence:"Pinned GNAMMA classification"});
  readerIndex.set(b.id,id);
 }
 data.counts.pinned=registry?.books?.length||0;
 const msw=ms?.works||[];
 for(const w of msw){
  addWork({id:"alreq:"+w.id,sourceId:w.id,title:w.title_ar||w.id,arabic:w.title_ar||"",roman:"",
   author:w.author_ar||"",authorDates:"",subjects:w.genres||[],schools:w.madhhabs||[],
   year:null,yearKind:"unplaced",dateLabel:"Unplaced in time",dateNote:"Catalogue metadata does not establish a date.",
   kind:"work",tradition:"",family:"",region:"",provenance:"Alreq manuscript catalogue",
   layer:"bibliographic",pinned:false,sourceURL:w.catalogue_url||"",
   lines:w.lineages||[],schoolEvidence:(w.school_evidence||[]).map(z=>[z.basis,z.school].filter(Boolean).join(" · ")).join("; "),
   manuscripts:Number(w.reported_manuscripts)||0,version:(w.categories||[]).join("; "),
   note:"Catalogue entry, not an acquired or collated manuscript; identity with other catalogue records remains unresolved."});
 }
 data.counts.alreq=msw.length;
 for(const rel of registry?.relationships||[]){
  const from=readerIndex.get(rel.source),to=readerIndex.get(rel.target);
  if(!from||!to||!validURL(rel.source_url))continue;
  addEdge({id:"reader:"+rel.id,from,to,type:rel.type||"textual_use",label:rel.label||rel.type||"Recorded relation",
   confidence:"bibliographically attested",evidence:rel.evidence||"",evidenceKind:"Edition-based bibliographical source",
   sourceURL:rel.source_url,sourceIds:[],origin:"pinned"});
 }
 for(const a of early?.authorities||[]){
  const school=a.status==="historical_nonfour_school"?"named_other":"early";const y=ahce(a.death_ah);
  addWork({id:"jurist:"+a.id,sourceId:a.id,title:a.name,arabic:a.arabic||"",roman:a.name,author:a.name,
   authorDates:a.death_ah?"d. "+a.death_ah+" AH":"",subjects:["fiqh"],schools:[school],
   year:y,yearKind:"author_death_proxy",dateLabel:a.death_ah?"Jurist d. "+a.death_ah+" AH":"Date unavailable",
   dateNote:"Jurist's death, not a work's composition date.",kind:"person",tradition:"early legal authority",
   family:school,region:"",provenance:"Curated early-jurist register",layer:"context",
   sourceURL:(a.evidence_urls||[]).find(validURL)||early.source_url||"",lines:[],note:a.description||"",
   schoolEvidence:"Historical person or early circle, not a later institutional school."});
 }
 data.licences=uniq([registry?.license||"",oi?.license||"",ms?.license||""]);
}
function prepare(){
 data.in=new Map();data.out=new Map();
 for(const e of data.edges){
  if(!data.in.has(e.to))data.in.set(e.to,[]);
  if(!data.out.has(e.from))data.out.set(e.from,[]);
  data.in.get(e.to).push(e);data.out.get(e.from).push(e);
 }
 for(const n of data.all)n.degree=(data.in.get(n.id)?.length||0)+(data.out.get(n.id)?.length||0);
 data.counts.relations=data.edges.length;
 data.loadReady=true;
}
async function load(){
 const tasks=["embedded canonical atlas","corpora/expanded-bibliography.json","corpora/manuscript-full.json","corpora/registry.json","corpora/early-jurists.json","corpora/geo-events.json"];
 const r=await Promise.allSettled(tasks.map((p,i)=>i===0?Promise.resolve().then(()=>JSON.parse(document.querySelector("script[data-atlas]").textContent)):
 fetch(p).then(resp=>{if(!resp.ok)throw Error(p+" "+resp.status);return resp.json()})));
 if(r[0].status!=="fulfilled"){ROOT.innerHTML='<section class="loading"><h1>Atlas sources unavailable</h1><p>The audited historical dataset could not be loaded. <a href="corpora/">Open the bibliography</a> or reload the atlas.</p></section>';return;}
 const o=r.map((x,i)=>{if(x.status==="fulfilled")return x.value;data.errors.push(tasks[i]+": "+String(x.reason?.message||x.reason));return null;});
 loadCanonical(o[0]);loadMetadata(o[1],o[2],o[3],o[4]);prepare();window.GNAMMAGeography?.setData(o[5]||{events:[],places:[]});
 window.GNAMMAGeography?.init(ROOT,{refresh:()=>{writeHash();render();},select:id=>chooseWork(id,true)});
 readHash();
 if(!data.byId.has(state.selected))selectFeatured(false);
 render(true);
}
function initialSubject(subject){
 if(!NAMES[subject])return;
 state.subject=subject;
 state.school="all";state.family="";state.cluster="";state.region="";
 state.bookPage=1;state.clusterPage=1;state.search="";
 window.GNAMMAGeography?.resetScope?.();
 if(subject==="intellectual"){state.from=-600;state.to=2026}
 else {state.from=630;state.to=1920}
 selectFeatured(false);
}
function readHash(){
 const p=new URLSearchParams(location.hash.slice(1));
 const legacy=p.get("view");
 let subject=p.get("subject")||p.get("science")||"all";
 if(subject==="arabic")subject=p.get("source_tab")||"nahw";
 if(subject==="fiqh"&&p.get("source_tab")==="method")subject="usul";
 if(subject==="philosophy"||subject==="kalam")subject="intellectual";
 if(NAMES[subject])state.subject=subject;
 const view=p.get("mode")||legacy||"geography";
 state.view=({sources:"timeline",explorer:"network",relations:"network",audit:"catalogue",network:"network",
  principal:"principal",summary:"principal",map:"geography",chronology:"timeline",geography:"geography",regions:"regions",catalogue:"catalogue"})[view]||"geography";
 const selected=p.get("work_id")||p.get("gnx_work")||p.get("work")||"";
 state.selected=selected&&data.byId.has(selected)?selected:data.byId.has("c:"+selected)?"c:"+selected:"";
 state.family=p.get("family")||p.get("text_family")||p.get("gnx_family")||"";
 if(state.family){state.subject="intellectual";
   if(!state.selected){const f=data.families.find(f=>f.id===state.family);if(f&&data.byId.has("c:"+f.root))state.selected="c:"+f.root}
 }
 state.school=Object.hasOwn(SCHOOLS,p.get("school"))?p.get("school"):
  Object.hasOwn(SCHOOLS,p.get("madhhab"))?p.get("madhhab"):"all";
 state.search=(p.get("q")||p.get("gnx_q")||"").slice(0,140);
 state.source=["all","audited","OpenITI","Alreq manuscript catalogue","pinned"].includes(p.get("source_tier"))?p.get("source_tier"):"all";
 const from=Number(p.get("from")),to=Number(p.get("to"));
 if(p.has("from")&&p.has("to")&&Number.isFinite(from)&&Number.isFinite(to)&&to>from+9){
  state.from=Math.max(PERIOD_MIN,Math.min(PERIOD_MAX-10,from));
  state.to=Math.min(PERIOD_MAX,Math.max(state.from+10,to));
 }else if(state.subject!=="intellectual"&&state.subject!=="all"){state.from=630;state.to=1920}
 state.edgeType=["all","commentary","critique","textual_use","translation"].includes(p.get("edge_type"))?p.get("edge_type"):"all";
 state.certainty=p.get("certain")==="1"?"verified":"all";
 state.region=p.get("place")||"";
 state.cluster="";state.clusterPage=1;state.bookPage=1;state.quickLimit=8;state.evidence="";
 if(!state.selected)selectFeatured(false);
 window.GNAMMAGeography?.readHash();
}
function writeHash(push=false){
 const p=new URLSearchParams();
 p.set("view",state.view);p.set("subject",state.subject);
 if(state.selected)p.set("work_id",state.selected);
 if(state.school!=="all")p.set("school",state.school);
 if(state.search)p.set("q",state.search);
 if(state.family)p.set("family",state.family);
 if(state.source!=="all")p.set("source_tier",state.source);
 if(state.edgeType!=="all")p.set("edge_type",state.edgeType);
 if(state.certainty!=="all")p.set("certain","1");
 if(state.region)p.set("place",state.region);
 if(state.from!==-600||state.to!==2026){p.set("from",String(Math.round(state.from)));p.set("to",String(Math.round(state.to)))}
 const geo=window.GNAMMAGeography?.urlState?.()||{};
 for(const [k,v] of Object.entries(geo))if(v&&v!=="all"&&v!=="both"&&v!=="0")p.set(k,v);
 const hash="#"+p.toString();
 if(location.hash!==hash)try{history[push?"pushState":"replaceState"](null,"",hash)}catch{location.hash=hash}
}
function selectFeatured(write=true){
 const list=filtered(false);
 const focus=list.find(x=>x.pinned&&x.degree>0)||list.find(x=>x.layer==="audited"&&x.featured&&x.degree>0)||
 list.filter(x=>x.kind==="work"&&x.degree>0).sort((a,b)=>b.degree-a.degree)[0]||
 list.find(x=>x.kind==="work")||list[0];
 state.selected=focus?.id||"";state.evidence="";
 if(write)writeHash();
}
function filtered(considerSearch=true){
 const q=normal(state.search);
 const result=data.all.filter(n=>{
  if(state.subject!=="all"&&!n.subjects.includes(state.subject))return false;
  if(state.school!=="all"&&!n.schools.includes(state.school))return false;
  if(state.source==="audited"&&n.layer!=="audited")return false;
  if(state.source==="OpenITI"&&n.provenance!=="OpenITI")return false;
  if(state.source==="Alreq manuscript catalogue"&&n.provenance!=="Alreq manuscript catalogue")return false;
  if(state.source==="pinned"&&!n.pinned)return false;
  if(state.region&&!GAZETTEER.some(g=>g[0]===state.region&&g[3].test(n.region)))return false;
  if(state.family&&state.subject==="intellectual"){
   const family=data.families.find(f=>f.id===state.family);
   if(family&&!family.member_ids.includes(n.sourceId))return false;
  }
  if(considerSearch&&q&&!n.searchText.includes(q))return false;
  return true;
 });
 return result;
}
function relevantEdges(id,direction){
 const r=direction==="prior"?data.in.get(id)||[]:data.out.get(id)||[];
 return r.filter(e=>{
   if(state.edgeType!=="all"){
    const type=e.type||"";
    if(state.edgeType==="commentary"&&!["commentary","gloss"].includes(type))return false;
    if(state.edgeType==="critique"&&!["critique","hypothesis"].includes(type))return false;
    if(state.edgeType==="textual_use"&&!["textual_use","reported_source","reported_doctrine","author_reference","component"].includes(type))return false;
    if(state.edgeType==="translation"&&!["translation","translation_adaptation"].includes(type))return false;
   }
   if(state.certainty==="verified"&&/qualified|proposed|contested|hypothes|claimed|unverified/i.test(e.confidence||""))return false;
   if(state.family){
    const f=data.families.find(f=>f.id===state.family);
    if(f&&(!f.member_ids.includes(e.from.slice(2))||!f.member_ids.includes(e.to.slice(2))))return false;
   }
   return true;
 });
}
function chooseWork(id,moveToNetwork=false){
 if(!data.byId.has(id))return;
 state.selected=id;state.evidence="";state.searchOpen=false;state.cluster="";state.search="";
 if(moveToNetwork)state.view="network";
 const n=data.byId.get(id);
 if(state.subject!=="all"&&!n.subjects.includes(state.subject)){
  state.subject=n.subjects[0]||"all";state.school="all";state.family="";
 }
 if(state.school!=="all"&&!n.schools.includes(state.school))state.school="all";
 writeHash(true);render();
}
function sceneTitle(){
 return state.subject==="all"?"The whole corpus":NAMES[state.subject]||"Historical texts";
}
function subjectControls(){
 return '<label class="hanafi-science"><span>Explore science</span><select data-science aria-label="Choose a scholarly science">'+
 opts(SUBJECTS,state.subject)+'</select></label>';
}
function viewControls(){
 const names=[["geography","By century"],["regions","By region"],["network","Source network"],["timeline","Book timeline"],["principal","Principal texts"],["catalogue","Catalogue"]];
 return '<div class="viewtabs hanafi-tabs" role="tablist" aria-label="Explore historical sources">'+names.map(([v,title])=>
 '<button role="tab" type="button" data-view="'+v+'" aria-selected="'+(state.view===v)+'">'+title+'</button>').join("")+'</div>';
}
function opts(entries,current){
 return entries.map(([v,label])=>'<option value="'+safe(v)+'"'+(String(v)===String(current)?" selected":"")+'>'+safe(label)+'</option>').join("");
}
function toolsUI(){
 const yearsEnabled=state.view==="timeline"||state.view==="principal";
 const filters='<div class="subcontrols"><label class="filteritem">School / historical circle'+
 '<select data-school '+(!["fiqh","usul"].includes(state.subject)?"disabled":"")+'>'+
 opts(Object.entries(SCHOOLS),state.school)+'</select></label>'+
 '<label class="filteritem">Source register<select data-source>'+
 opts([["all","All source records"],["audited","Audited history"],["OpenITI","OpenITI metadata"],["Alreq manuscript catalogue","Manuscript catalogue"],["pinned","Pinned sources"]],state.source)+'</select></label>'+
 '<label class="filteritem">Textual family<select data-family '+(state.subject!=="intellectual"?"disabled":"")+'>'+
 opts([["","All research families"],...data.families.map(f=>[f.id,f.label])],state.family)+'</select></label>'+
 '<label class="filteritem">Relationship<select data-edge-type>'+
 opts([["all","All documented"],["commentary","Commentary / gloss"],["critique","Criticism"],["textual_use","Textual use"],["translation","Translation"]],state.edgeType)+'</select></label>'+
 '<label class="filteritem">Evidence<select data-certainty>'+opts([["all","Include qualified"],["verified","Hide provisional"]],state.certainty)+'</select></label>'+
 '<div class="year-controls"><button data-pan="-1" aria-label="Earlier years" '+(!yearsEnabled?"disabled":"")+'>←</button>'+
 '<button data-zoom="0.60" aria-label="Zoom in years" '+(!yearsEnabled?"disabled":"")+'>＋</button>'+
 '<button data-zoom="1.65" aria-label="Zoom out years" '+(!yearsEnabled?"disabled":"")+'>－</button>'+
 '<button data-pan="1" aria-label="Later years" '+(!yearsEnabled?"disabled":"")+'>→</button>'+
 '<label class="filteritem">From (−BCE / CE)<input data-year-from type="number" step="1" value="'+Math.round(state.from)+'" '+(!yearsEnabled?"disabled":"")+'></label>'+
 '<label class="filteritem">To (−BCE / CE)<input data-year-to type="number" step="1" value="'+Math.round(state.to)+'" '+(!yearsEnabled?"disabled":"")+'></label>'+
 '<button data-apply-years '+(!yearsEnabled?"disabled":"")+'>Apply</button><button data-reset-years '+(!yearsEnabled?"disabled":"")+'>All years</button></div></div>';
 const input='<div class="search-holder"><label for="gn-search">Find a work or scholar · Latin or Arabic</label>'+
 '<input id="gn-search" type="search" autocomplete="off" placeholder="Search title, author, or Arabic script…" value="'+safe(state.search)+'" aria-controls="gn-search-pop" aria-expanded="'+state.searchOpen+'">'+
 '<div class="search-pop" id="gn-search-pop" '+(!state.searchOpen?"hidden":"")+'>*</div></div>';
 return '<section class="control-shell hanafi-toolbar" aria-label="Atlas navigation">'+
 '<div class="primary-controls">'+subjectControls()+input+'</div>'+
 viewControls()+
 '<details class="atlas-advanced"'+(state.advancedOpen?' open':'')+'><summary>Advanced filters, evidence and date range</summary>'+
 filters+'<p class="filter-explanation">All sciences share these controls. Catalogue entries lacking dates or verified locations are never silently placed.</p></details>'+
 '</section>';
}
function hero(){
 const count=window.GNAMMAGeography?.debug?.()||{};
 return '<section class="hero hanafi-hero"><div class="eyebrow">MAP <span lang="ar" dir="rtl">الخريطة</span> · GNAMMA RESEARCH</div>'+
 '<h1>Where scholarship took shape</h1>'+
 '<p class="hero-desc">Explore authors, texts, places and centuries across the Islamic sciences. Follow a source to its commentary and examine the evidence behind every connection.</p>'+
 '<div class="hero-metrics"><span><strong>'+fnum(data.counts.audited)+'</strong><small>audited entries</small></span>'+
 '<span><strong>'+fnum(data.counts.openiti+data.counts.alreq)+'</strong><small>source catalogue records</small></span>'+
 '<span><strong>'+fnum(count.events||0)+'</strong><small>researched place events</small></span></div>'+
 '</section>';
}
function lanesFor(nodes){
 if(state.subject==="all")return SUBJECTS.filter(x=>x[0]!=="all").map(([id,label])=>({id,label,nodes:nodes.filter(n=>n.subjects.includes(id))})).filter(l=>l.nodes.length);
 if(["fiqh","usul"].includes(state.subject)){
  return Object.entries(SCHOOLS).filter(([k])=>k!=="all").map(([id,label])=>({
   id,label,nodes:nodes.filter(n=>n.schools.includes(id)||(id==="unassigned"&&(!n.schools.length||!n.schools.some(s=>SCHOOLS[s]))))
  })).filter(l=>l.nodes.length);
 }
 if(state.subject==="intellectual"){
  const used=new Set();
  const lanes=Object.entries(FAMILY_NAMES).map(([id,label])=>{
   const a=nodes.filter(n=>n.tradition===id);
   a.forEach(n=>used.add(n.id));return {id,label,nodes:a};
  }).filter(l=>l.nodes.length);
  const others=nodes.filter(n=>!used.has(n.id));if(others.length)lanes.push({id:"other",label:"Other intellectual works",nodes:others});
  return lanes;
 }
 if(state.subject==="nahw"||state.subject==="balagha"){
  const pref=state.subject==="nahw"?[
   ["grammar:basran","Basran grammar"],["grammar:kufan","Kufan grammar"],["grammar:baghdadi","Baghdad grammarians"],
   ["grammar:andalusi_maghribi","Andalusian / Maghribi"],["grammar:egyptian_syrian","Egyptian / Syrian"],
   ["grammar:later_commentarial","Later commentarial"]]:
   [["balagha:nazm_ijaz","Naẓm / iʿjāz"],["balagha:miftah_talkhis","Miftāḥ–Talkhīṣ line"],
    ["balagha:adab_badi","Adab / badīʿ"],["balagha:andalusi_maghribi","Andalusian / Maghribi"],
    ["balagha:later_didactic","Later didactic"]];
  const assigned=new Set();
  const lines=pref.map(([id,label])=>{const a=nodes.filter(n=>n.lines.includes(id));a.forEach(n=>assigned.add(n.id));return{id,label,nodes:a}}).filter(l=>l.nodes.length);
  const other=nodes.filter(n=>!assigned.has(n.id));if(other.length)lines.push({id:"unassigned",label:"Other / unassigned",nodes:other});
  return lines;
 }
 return [{id:state.subject,label:NAMES[state.subject],nodes}];
}
function yearLabel(y){return y<0?Math.abs(Math.round(y))+" BCE":Math.round(y)+" CE"}
function periodTicks(from,to,segments=9){
 const stepRaw=(to-from)/segments;
 const roundSteps=[10,20,25,50,100,150,200,250,500,1000];
 const step=roundSteps.find(v=>v>=stepRaw)||1000;
 const a=Math.ceil(from/step)*step;const ticks=[];
 for(let y=a;y<=to;y+=step)ticks.push(y);
 return ticks;
}
function clip(x,a,b){return Math.max(a,Math.min(b,x))}
function inWindow(n){return n.year!==null&&n.year>=state.from&&n.year<=state.to}
function viewTimeline(){
 const nodes=filtered();renderCache.filtered=nodes;
 const lanes=lanesFor(nodes);renderCache.lanes=lanes;renderCache.clusters=new Map();
 const W=1140,left=172,right=132,top=66,plotW=W-left-right;
 const stepYears=state.to-state.from;
 const scale=y=>left+(y-state.from)/stepYears*plotW;
 const binYears=stepYears>1600?240:stepYears>950?125:stepYears>500?70:stepYears>250?40:stepYears>120?20:stepYears>50?10:5;
 let body="",totalShown=0,y=top,gridEnd=0;
 const ticks=periodTicks(state.from,state.to,W<900?6:9);
 for(const lane of lanes){
  const dated=lane.nodes.filter(inWindow);
  const undated=lane.nodes.filter(n=>n.year===null);
  const groups=new Map();
  for(const n of dated){
   const key=Math.floor(n.year/binYears)*binYears;
   if(!groups.has(key))groups.set(key,[]);
   groups.get(key).push(n);
  }
  const clusterArr=[...groups.entries()].sort((a,b)=>a[0]-b[0]);
  const ends=[];let shapes="";
  for(const [start,items] of clusterArr){
   const center=items.reduce((s,n)=>s+n.year,0)/items.length;
   const x=clip(scale(center),left+32,W-right-35),wide=items.length===1?115:66;
   let row=ends.findIndex(end=>end+7<=x-wide/2);
   if(row===-1){row=ends.length;ends.push(0)}
   if(row>=4)row=3;
   ends[row]=Math.max(ends[row]||0,x+wide/2);
   const yy=y+25+row*38;totalShown++;
   if(items.length===1){
    const n=items[0],type=n.kind==="person"?"◈":"";
    shapes+='<g role="button" tabindex="0" data-select="'+safe(n.id)+'" aria-label="'+safe(n.title+'; '+n.dateLabel)+'">'+
      '<title>'+safe(n.title+" — "+n.author+" — "+n.dateLabel)+'</title>'+
      '<rect x="'+(x-wide/2)+'" y="'+yy+'" width="'+wide+'" height="31" rx="5" fill="var(--panel)" stroke="var(--line)" />'+
      '<circle cx="'+(x-wide/2+7)+'" cy="'+(yy+16)+'" r="2.8" fill="var(--accent)"/>'+
      '<text x="'+(x-wide/2+14)+'" y="'+(yy+12)+'" fill="currentColor" font-size="10" font-weight="600">'+safe(truncate(n.title,15))+'</text>'+
      '<text x="'+(x-wide/2+14)+'" y="'+(yy+24)+'" fill="var(--muted)" font-size="8.7">'+safe(type+yearLabel(n.year)+" · "+(n.layer==="audited"?"text":"catalogue"))+'</text></g>';
   }else{
    const key=lane.id+"@"+start;
    renderCache.clusters.set(key,items);
    shapes+='<g role="button" tabindex="0" data-cluster="'+safe(key)+'" aria-label="'+safe(items.length+' works around '+yearLabel(start)+' in '+lane.label)+'">'+
      '<title>'+safe(items.length+' dated records · '+lane.label+' · '+yearLabel(start)+' to '+yearLabel(start+binYears-1))+'</title>'+
      '<rect x="'+(x-wide/2)+'" y="'+yy+'" width="'+wide+'" height="31" rx="7" fill="var(--accentbg)" stroke="var(--accent)" stroke-opacity=".65"/>'+
      '<text x="'+x+'" y="'+(yy+14)+'" font-size="11" font-weight="650" text-anchor="middle" fill="var(--ink)">'+items.length+' texts</text>'+
      '<text x="'+x+'" y="'+(yy+25)+'" text-anchor="middle" font-size="8.5" fill="var(--muted)">'+safe(yearLabel(start))+'</text></g>';
   }
  }
  const height=Math.max(85,ends.length*38+31);
  body+='<line x1="0" x2="'+W+'" y1="'+(y+height)+'" y2="'+(y+height)+'" stroke="var(--line)" stroke-opacity=".7"/>'+
  '<text x="13" y="'+(y+31)+'" fill="var(--ink)" font-size="12" font-weight="650">'+safe(truncate(lane.label,22))+'</text>'+
  '<text x="13" y="'+(y+47)+'" fill="var(--muted)" font-size="10">'+lane.nodes.length.toLocaleString()+' source records</text>'+
  '<line x1="'+left+'" x2="'+(W-right)+'" y1="'+(y+height-6)+'" y2="'+(y+height-6)+'" stroke="var(--line)" stroke-opacity=".35"/>'+
  shapes;
  if(undated.length){
    const key="undated:"+lane.id;renderCache.clusters.set(key,undated);
    body+='<g role="button" tabindex="0" data-unplaced="'+safe(key)+'" aria-label="'+undated.length+' undated records in '+safe(lane.label)+'">'+
    '<rect x="'+(W-right+13)+'" y="'+(y+22)+'" width="'+(right-27)+'" height="32" rx="5" fill="var(--soft)" stroke="var(--muted)" stroke-dasharray="3 3" stroke-opacity=".6"/>'+
    '<text x="'+(W-right+18)+'" y="'+(y+35)+'" fill="var(--ink)" font-size="10" font-weight="650">'+fnum(undated.length)+' unplaced</text>'+
    '<text x="'+(W-right+18)+'" y="'+(y+47)+'" fill="var(--muted)" font-size="8.7">Browse records</text></g>';
  }
  y+=height;
 }
 gridEnd=Math.max(280,y+11);
 let grid='<rect width="'+W+'" height="'+gridEnd+'" fill="var(--panel)"/>';
 for(const t of ticks){
  const x=scale(t);grid+='<path d="M'+x+',43V'+gridEnd+'" stroke="var(--line)" stroke-opacity=".66"/>'+
  '<text x="'+x+'" y="28" fill="var(--muted)" text-anchor="middle" font-size="11">'+safe(yearLabel(t))+'</text>';
 }
 grid+='<path d="M'+left+',43H'+(W-right)+'" stroke="var(--muted)" stroke-width=".8"/>'+
 '<path d="M'+(W-right+5)+',43V'+gridEnd+'" stroke="var(--line)" stroke-dasharray="3 4"/>'+
 '<text x="'+(W-right+14)+'" y="27" fill="var(--muted)" font-size="10">Undated</text>';
 const svg='<div class="canvas-outer"><div class="canvas-scroll" role="region" tabindex="0" aria-label="Historical book map; scroll horizontally on small screens">'+
 '<svg data-unified-timeline width="'+W+'" height="'+gridEnd+'" viewBox="0 0 '+W+' '+gridEnd+'" role="group" aria-label="'+safe(sceneTitle())+' chronology with source record nodes">'+
 grid+body+'</svg></div></div>';
 const active=state.cluster&&renderCache.clusters.has(state.cluster)?renderClusterList(renderCache.clusters.get(state.cluster)):"";
 const countIn=nodes.filter(inWindow).length;
 const note='<div class="plot-note"><span class="legend"><i class="swatch date"></i> Dated work or jurist</span>'+
 '<span class="legend"><i class="swatch"></i> Time cluster: select to zoom / inspect</span>'+
 '<span class="legend"><i class="swatch undated"></i> Undated source records</span>'+
 '<span>Dates are explicitly qualified: author death ≠ composition.</span></div>';
 return {html:svg+active+note,title:"Historical map · "+sceneTitle(),sub:fnum(countIn)+" dated records in view · "+fnum(nodes.length-countIn)+" other source records · "+lanes.length+" historical lanes",shown:totalShown};
}
function renderClusterList(arr){
 const rows=arr.slice().sort((a,b)=>(a.year??99999)-(b.year??99999)||a.title.localeCompare(b.title));
 const page=Math.max(1,Math.min(state.clusterPage,Math.ceil(rows.length/24)));
 const dataPart=rows.slice((page-1)*24,page*24);
 return '<section aria-label="Records in the selected map cluster"><h3 class="unplaced-title">'+
 safe(state.cluster.startsWith("undated:")?"Undated work records":"Texts in the selected era")+' · '+fnum(rows.length)+'</h3>'+
 '<p class="source-summary">Browse source-linked works without losing the chronological map. Selecting one opens its historical and textual context.</p>'+
 '<div class="browse-grid">'+dataPart.map(bookButton).join("")+'</div>'+
 pagination(page,Math.ceil(rows.length/24),"cluster")+'</section>';
}
function bookButton(n){
 return '<button class="browse-card" type="button" data-select="'+safe(n.id)+'">'+
 '<strong>'+safe(truncate(n.title,65))+'</strong><small>'+safe(truncate(n.author,60))+' · '+safe(n.dateLabel||"Unknown date")+'</small></button>';
}
function pagination(page,max,type){
 if(max<=1)return "";
 return '<div class="pagination"><button data-page="'+type+':-1" '+(page<=1?"disabled":"")+'>Previous</button>'+
 '<span>Page '+page+' of '+max+'</span><button data-page="'+type+':1" '+(page>=max?"disabled":"")+'>Next</button></div>';
}
function viewCatalogue(){
 const list=filtered().slice().sort((a,b)=>(a.year??99999)-(b.year??99999)||a.title.localeCompare(b.title));
 const page=Math.max(1,Math.min(state.bookPage,Math.ceil(list.length/28)));state.bookPage=page;
 const chunk=list.slice((page-1)*28,page*28);
 return {html:'<div class="canvas-outer"><div class="browse-grid">'+chunk.map(bookButton).join("")+'</div>'+pagination(page,Math.ceil(list.length/28),"catalogue")+'</div>'+
  '<p class="plot-note">A catalogue entry records a work or witness in its source; matching titles are not automatically the same historical work.</p>',
 title:"Work catalogue · "+sceneTitle(),sub:fnum(list.length)+" source records matching the current filters"};
}
function linkRows(rel,previous){
 const id=previous?rel.from:rel.to;
 const n=data.byId.get(id);if(!n)return "";
 return '<article><button type="button" data-select="'+safe(n.id)+'">'+safe(truncate(n.title,62))+'</button>'+
 '<p>'+safe(n.author)+' · '+safe(TYPENAMES[rel.type]||rel.type||"Relationship")+' · '+safe(rel.confidence||"qualified")+'</p>'+
 '<button type="button" class="evidence-btn" data-evidence="'+safe(rel.id)+'">Inspect source evidence</button></article>';
}
function quickPicks(){
 const list=filtered(false).filter(n=>n.kind==="work"&&n.degree>0);
 list.sort((a,b)=>Number(b.pinned)-Number(a.pinned)||Number(b.featured)-Number(a.featured)||b.degree-a.degree);
 const unique=[];const seen=new Set();
 for(const n of list){if(seen.has(n.author))continue;seen.add(n.author);unique.push(n);if(unique.length>=7)break;}
 return '<div class="network-picks"><span>Quick picks</span>'+unique.map(n=>'<button type="button" data-select="'+safe(n.id)+'" title="'+safe(n.title)+'">'+safe(truncate(n.title,24))+'</button>').join("")+'</div>';
}
function networkSvg(n,prior,later){
 const W=1020,cardW=210,cardH=59,xs=[26,406,784],all=Math.max(prior.length,later.length,1),H=Math.max(280,86+all*75);
 const canvas=(x,y,a,extra="")=>'<g role="button" tabindex="0" data-select="'+safe(a.id)+'" aria-label="'+safe(a.title+" by "+a.author)+'">'+
  '<title>'+safe(a.title+" · "+a.author+" · "+a.dateLabel)+'</title>'+
  '<rect x="'+x+'" y="'+y+'" width="'+cardW+'" height="'+cardH+'" rx="7" fill="'+(extra?"var(--accentbg)":"var(--panel)")+'" stroke="'+(extra?"var(--accent)":"var(--line)")+'" stroke-width="'+(extra?2:1)+'"/>'+
  '<text x="'+(x+11)+'" y="'+(y+20)+'" fill="var(--ink)" font-size="12" font-weight="650">'+safe(truncate(a.title,28))+'</text>'+
  '<text x="'+(x+11)+'" y="'+(y+36)+'" fill="var(--muted)" font-size="10.5">'+safe(truncate(a.author,34))+'</text>'+
  '<text x="'+(x+11)+'" y="'+(y+50)+'" fill="var(--muted)" font-size="9.5">'+safe(truncate(a.dateLabel,34))+'</text></g>';
 let lines="",cards="";
 const cy=H/2-cardH/2;
 cards+=canvas(xs[1],cy,n,true);
 for(const [edges,index,direction] of [[prior,0,"prior"],[later,2,"later"]]){
  edges.forEach((e,i)=>{
   const a=data.byId.get(direction==="prior"?e.from:e.to);if(!a)return;
   const y=58+i*75;
   cards+=canvas(xs[index],y,a);
   let x1=direction==="prior"?xs[0]+cardW:xs[1]+cardW;
   let y1=direction==="prior"?y+cardH/2:cy+cardH/2;
   let x2=direction==="prior"?xs[1]:xs[2];
   let y2=direction==="prior"?cy+cardH/2:y+cardH/2;
   const bend=(x2-x1)*.46;
   lines+='<path d="M'+x1+','+y1+' C'+(x1+bend)+','+y1+' '+(x2-bend)+','+y2+' '+x2+','+y2+
   '" fill="none" stroke="'+(e.type==="critique"?"var(--warn)":"var(--accent)")+'" stroke-width="1.5" stroke-opacity=".66"'+
   (/qualified|proposed|hypothes|claimed/i.test(e.confidence||"")?' stroke-dasharray="4 4"':'')+' marker-end="url(#atlas-arrow)"/>';
  });
 }
 const headers='<g font-size="11" font-weight="650" fill="var(--muted)" text-anchor="middle"><text x="'+(xs[0]+cardW/2)+'" y="28">Rests on ('+prior.length+')</text>'+
 '<text x="'+(xs[1]+cardW/2)+'" y="28">Selected work</text><text x="'+(xs[2]+cardW/2)+'" y="28">Carried on by ('+later.length+')</text></g>';
 return '<div class="canvas-outer"><div class="canvas-scroll" tabindex="0" role="region" aria-label="Documented source-reception network">'+
 '<svg data-unified-network viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="group" aria-label="Work-centered directed bibliography network">'+
 '<defs><marker id="atlas-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1 L9 5 L1 9 Z" fill="var(--accent)"/></marker></defs>'+
 headers+lines+cards+'</svg></div></div>';
}
function viewNetwork(){
 const n=data.byId.get(state.selected)||filtered(false)[0];if(!n)return {html:'<div class="warning">No work is available in this selection.</div>',title:"Sources and reception",sub:"No recorded sources"};
 const prior=relevantEdges(n.id,"prior"),later=relevantEdges(n.id,"later"),limit=state.quickLimit;
 const first=prior.slice(0,limit),second=later.slice(0,limit);
 const labels=(edge,up)=>{const item=data.byId.get(up?edge.from:edge.to);return item?.title||"Unknown text"};
 const cards=(list,up)=>{
  if(!list.length)return '<div class="network-none">No documented '+(up?"antecedent":"later reception")+' in the current source register. This does not mean none existed.</div>';
  return '<div class="net-list">'+list.map(e=>{
   const other=data.byId.get(up?e.from:e.to);if(!other)return "";
   return '<div class="net-card" role="group"><button class="event-button" data-select="'+safe(other.id)+'"><strong>'+safe(other.title)+'</strong><small>'+safe(other.author+' · '+other.dateLabel)+'</small></button>'+
   '<span class="relation-label">'+safe(e.label||TYPENAMES[e.type]||"Recorded link")+'</span>'+
   '<button class="small-btn" type="button" data-evidence="'+safe(e.id)+'">Evidence</button></div>';
  }).join("")+'</div>'+((up?prior:later).length>limit?'<button class="network-more" data-more>Show further connected works ('+((up?prior:later).length-limit)+')</button>':"");
 };
 const graph=networkSvg(n,first,second);
 const extended='<div class="network-cols"><section class="network-col"><h3>Rests on · sources</h3>'+cards(first,true)+'</section>'+
 '<section class="network-col root-col"><h3>Selected text</h3><div class="network-root"><span class="eyebrow">'+safe(n.provenance)+'</span>'+
 '<h3>'+safe(n.title)+'</h3>'+(n.arabic?'<div dir="rtl" class="record-ar" lang="ar">'+safe(n.arabic)+'</div>':"")+
 '<p>'+safe(n.author)+' · '+safe(n.dateLabel)+'</p>'+
 '<div class="relation-path"><span>'+prior.length+' incoming</span><span>'+later.length+' outgoing</span><span>'+safe(n.kind)+'</span></div></div>'+
 '<p class="source-summary">Only evidenced relationships are shown. A missing arrow records an evidentiary gap, not historical isolation.</p></section>'+
 '<section class="network-col"><h3>Carried on by · reception</h3>'+cards(second,false)+'</section></div>';
 return {html:quickPicks()+'<div class="network-wrap">'+graph+'</div>'+extended+
  (state.evidence?evidencePanel(data.edges.find(x=>x.id===state.evidence)):"")+
  '<p class="net-cites">Select any book to recenter the graph. Each “Evidence” control identifies the source, relationship type and its qualifications; mere membership in a school creates no arrow.</p>',
  title:"Source network · "+truncate(n.title,50),sub:fnum(prior.length)+" antecedents · "+fnum(later.length)+" later relationships, drawn from documented records"};
}
function topWorks(list,count=14){
 return list.slice().sort((a,b)=>{
  const sa=(a.degree||0)*11+(a.pinned?55:0)+(a.featured?35:0)+(a.year!==null?12:0);
  const sb=(b.degree||0)*11+(b.pinned?55:0)+(b.featured?35:0)+(b.year!==null?12:0);
  return sb-sa||(a.year??99999)-(b.year??99999);
 }).slice(0,count).sort((a,b)=>(a.year??99999)-(b.year??99999));
}
function viewPrincipal(){
 const nodes=filtered().filter(n=>n.kind==="work");
 let lanes=[],title="Principal texts · "+sceneTitle(),caveat="";
 if(state.subject==="intellectual"&&state.family){
  const fam=data.families.find(f=>f.id===state.family);
  if(fam)lanes=[{id:fam.id,label:fam.label,nodes:fam.member_ids.map(id=>data.byId.get("c:"+id)).filter(Boolean)}];
 }
 if(!lanes.length){
  lanes=lanesFor(nodes).map(x=>({...x,nodes:topWorks(x.nodes.filter(n=>n.kind==="work"),16)})).filter(x=>x.nodes.length);
  caveat="The vertical synopsis is selective, not the complete source corpus. For sciences without critically curated principal-text lists, this is an explicitly provisional citation-based selection; it does not establish a canonical curriculum.";
 }
 const W=Math.max(1040,150+lanes.length*228),maxRows=Math.max(3,...lanes.map(x=>x.nodes.length));
 const H=102+maxRows*76+34;
 let grid="",nodesSvg="",arrows="",positions=new Map();
 const colors=["#50807f","#9d8063","#6f7892","#8e7391","#899458"];
 lanes.forEach((l,j)=>{
  const x=90+j*228,axis=x+95;
  grid+='<text x="'+x+'" y="27" font-size="11" fill="var(--ink)" font-weight="650">'+safe(truncate(l.label,25))+'</text>'+
   '<text x="'+x+'" y="41" font-size="9" fill="var(--muted)">'+l.nodes.length+' selected texts</text>'+
   '<path d="M'+axis+',60V'+(H-28)+'" stroke="var(--line)" stroke-width="2"/>';
  l.nodes.forEach((n,i)=>{
   const y=69+i*76;positions.set(n.id,{x:x,y});
   nodesSvg+='<g role="button" tabindex="0" data-select="'+safe(n.id)+'" aria-label="'+safe(n.title)+'">'+
     '<rect x="'+x+'" y="'+y+'" width="199" height="58" rx="6" fill="var(--panel)" stroke="var(--line)"/>'+
     '<path d="M'+x+','+y+'v58" stroke="'+colors[j%colors.length]+'" stroke-width="4"/>'+
     '<text x="'+(x+9)+'" y="'+(y+16)+'" fill="var(--ink)" font-size="11" font-weight="650">'+safe(truncate(n.title,27))+'</text>'+
     '<text x="'+(x+9)+'" y="'+(y+32)+'" fill="var(--muted)" font-size="10">'+safe(truncate(n.author,29))+'</text>'+
     '<text x="'+(x+9)+'" y="'+(y+47)+'" fill="var(--muted)" font-size="9.6">'+safe(truncate(n.dateLabel,29))+'</text></g>';
  });
 });
 for(const e of data.edges){
  const a=positions.get(e.from),b=positions.get(e.to);if(!a||!b)continue;
  const ax=a.x+195,ay=a.y+30,bx=b.x+5,by=b.y+30;
  if(ax===bx||a.x===b.x){
   arrows+='<path d="M'+(a.x+101)+','+(a.y+58)+' Q'+(a.x+213)+','+((a.y+b.y)/2+30)+' '+(b.x+101)+','+(b.y-2)+
    '" stroke="var(--accent)" stroke-width="1.2" fill="none" stroke-dasharray="3 2"/>';
  }else{
   arrows+='<path d="M'+ax+','+ay+' Q'+((ax+bx)/2)+','+((ay+by)/2)+' '+bx+','+by+'" fill="none" stroke="var(--accent)" stroke-width="1.1"/>';
  }
 }
 const svg='<div class="canvas-outer"><div class="canvas-scroll" tabindex="0" role="region" aria-label="Vertically arranged selected principal texts">'+
 '<svg data-unified-principal width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="Principal works by school or textual tradition">'+
 '<rect width="'+W+'" height="'+H+'" fill="var(--panel)"/>'+grid+arrows+nodesSvg+'</svg></div></div>';
 return {html:svg+'<p class="plot-note">'+safe(caveat||"This is a researched textual family. Arrows require a documented work-to-work relation. Vertical guides indicate grouping, not transmission.")+'</p>',
 title,sub:lanes.length+" intellectual lineages · "+lanes.reduce((n,l)=>n+l.nodes.length,0)+" visible principal-work records"};
}
function viewGeography(){
 const audited=filtered().filter(n=>n.layer==="audited"&&n.region);
 const coords=GAZETTEER.map(g=>({name:g[0],lat:g[1],lon:g[2],count:audited.filter(n=>g[3].test(n.region)).length})).filter(x=>x.count);
 const W=1050,H=455,px=lon=>70+(lon+16)/128*910,py=lat=>45+(58-lat)/47*355;
 let picture='<rect width="'+W+'" height="'+H+'" fill="var(--panel)"/>';
 for(const lon of [0,20,40,60,80,100]){
  const x=px(lon);
  picture+='<path d="M'+x+',30V417" stroke="var(--line)" stroke-dasharray="3 4"/>'+
  '<text x="'+x+'" y="438" fill="var(--muted)" text-anchor="middle" font-size="10">'+lon+'°E</text>';
 }
 for(const lat of [20,30,40,50]){
  const y=py(lat);picture+='<path d="M52,'+y+'H997" stroke="var(--line)" stroke-dasharray="3 4"/>'+
  '<text x="13" y="'+y+'" fill="var(--muted)" font-size="10">'+lat+'°</text>';
 }
 for(const c of coords){
  const x=px(c.lon),y=py(c.lat),r=Math.max(6,Math.min(18,Math.sqrt(c.count)*2.8));
  picture+='<g role="button" tabindex="0" data-place="'+safe(c.name)+'" aria-label="'+safe(c.name+' '+c.count+' regional context mentions')+'">'+
   '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="var(--accent)" fill-opacity=".42" stroke="var(--accent)" stroke-width="1.2"/>'+
   '<text x="'+x+'" y="'+(y-r-6)+'" text-anchor="middle" fill="var(--ink)" font-size="11">'+safe(c.name)+'</text>'+
   '<title>'+safe(c.name+" · "+c.count+" regional-context mentions")+'</title></g>';
 }
 return {html:'<div class="canvas-outer"><div class="canvas-scroll" role="region" tabindex="0" aria-label="Index of places named in the audited source records">'+
 '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="Indexed historical places, not manuscript movements">'+picture+'</svg></div></div>'+
 '<p class="plot-note">Geographical projection is a gazetteer-backed index of region labels recorded in the audited corpus. These circles do not assert places of composition, study routes or manuscript provenance.</p>'+
 '<div class="network-picks"><span>Regional contexts</span>'+coords.map(c=>'<button type="button" data-place="'+safe(c.name)+'">'+safe(c.name)+' ('+c.count+')</button>').join("")+'</div>',
 title:"Regional index · "+sceneTitle(),sub:fnum(coords.reduce((a,c)=>a+c.count,0))+" named-place occurrences in the source-labelled audit corpus; not a complete historical GIS"};
}
function sourceCards(n){
 const evid=n.sourceIds.map(id=>data.sources.get(id)).filter(Boolean);
 const anchors=evid.map(s=>(validURL(s.url)?'<a class="citation-link" href="'+safe(validURL(s.url))+'" target="_blank" rel="noopener noreferrer">'+safe(s.title||s.id)+'</a>':'<p>'+safe(s.title||s.id)+'</p>')+
  (s.locator?'<p class="source-summary">'+safe(s.locator)+'</p>':"")).join("");
 const own=validURL(n.sourceURL)?'<a class="citation-link" href="'+safe(validURL(n.sourceURL))+'" target="_blank" rel="noopener noreferrer">Open original '+safe(n.provenance)+' record</a>':"";
 return anchors+own||'<p class="source-summary">No clickable source record is available in this selection.</p>';
}
function recordPanel(){
 const n=data.byId.get(state.selected);
 if(!n)return '<div class="side-empty">Select a work from the historical map, search, or source network to see its dates, sources, provenance and recorded reception.</div>';
 const typ=n.kind==="person"?"Historical jurist / authority":n.kind!=="work"?"Historical context":"Textual work";
 const incoming=data.in.get(n.id)||[],outgoing=data.out.get(n.id)||[];
 const caution=n.layer==="bibliographic"?"This is a source-linked catalogue record. It has not been reconciled with other catalogues or checked against manuscripts. No intellectual relationship follows from school classification or chronological proximity.":
 n.kind==="person"?"A person's institutional school and authored works must be established separately; no artificial book relations are drawn.":
 "The wording and certainty of each textual relationship are controlled by its cited evidence. Absence from this register does not mean historical isolation.";
 const sources=sourceCards(n);
 return '<h3 class="record-title">'+safe(n.title)+'</h3>'+
 (n.arabic?'<div class="record-ar" dir="rtl" lang="ar">'+safe(n.arabic)+'</div>':"")+
 '<p class="record-author">'+safe(n.author||"Author not identified")+'</p>'+
 '<div class="record-labels"><span>'+safe(typ)+'</span><span>'+safe(n.provenance)+'</span>'+
 (n.schools||[]).map(s=>'<span>'+safe(SCHOOLS[s]||s)+'</span>').join("")+'</div>'+
 '<dl class="record-dl"><dt>Chronology</dt><dd>'+safe(n.dateLabel||"Unplaced")+'</dd>'+
 '<dt>Date means</dt><dd>'+safe(n.dateNote||n.yearKind||"Date not independently established")+'</dd>'+
 '<dt>Subject(s)</dt><dd>'+safe(n.subjects.map(s=>NAMES[s]||s).join(", "))+'</dd>'+
 (n.region?'<dt>Region label</dt><dd>'+safe(n.region)+'</dd>':"")+
 (n.schoolEvidence?'<dt>Classification</dt><dd>'+safe(n.schoolEvidence)+'</dd>':"")+
 (n.version?'<dt>Source version</dt><dd>'+safe(truncate(n.version,80))+'</dd>':"")+'</dl>'+
 (n.note?'<p class="record-text">'+safe(n.note)+'</p>':"")+
 (n.warning?'<p class="caution">'+safe(n.warning)+'</p>':"")+
 (n.manuscripts?'<p class="record-text">Catalogue mentions '+n.manuscripts+' manuscript records; not individually verified by this atlas.</p>':"")+
 '<p class="caution">'+safe(caution)+'</p>'+
 '<div class="record-actions"><button type="button" data-show-network="'+safe(n.id)+'">View sources &amp; reception</button>'+
 '<button type="button" data-copy>Copy link</button>'+
 (n.reader?'<a href="../tajrid/#book/'+encodeURIComponent(n.sourceId)+'">Tajrīd reader</a>':"")+'</div>'+
 '<details class="side-details" open><summary>Earlier sources ('+incoming.length+')</summary>'+
 (incoming.map(e=>linkRows(e,true)).join("")||'<p class="source-summary">No incoming relation is recorded.</p>')+'</details>'+
 '<details class="side-details"><summary>Later reception ('+outgoing.length+')</summary>'+
 (outgoing.map(e=>linkRows(e,false)).join("")||'<p class="source-summary">No outgoing relation is recorded.</p>')+'</details>'+
 '<details class="side-details" open><summary>Bibliography &amp; source provenance</summary>'+sources+'</details>';
}
function evidencePanel(e){
 if(!e)return "";
 const src=data.byId.get(e.from),tgt=data.byId.get(e.to);
 const citation=uniq(e.sourceIds||[]).map(id=>data.sources.get(id)).filter(Boolean);
 let refs=citation.map(s=>'<p><strong>'+safe(s.title||s.id)+'</strong>'+
 (s.locator?' · '+safe(s.locator):'')+
 (validURL(s.url)?' · <a href="'+safe(validURL(s.url))+'" target="_blank" rel="noopener noreferrer">Inspect source</a>':'')+'</p>').join("");
 if(validURL(e.sourceURL))refs+='<p><a href="'+safe(validURL(e.sourceURL))+'" target="_blank" rel="noopener noreferrer">Bibliographic evidence</a></p>';
 return '<section class="evidence-inline" role="region" aria-label="Relationship evidence"><button type="button" data-close-evidence>Close</button>'+
 '<h3>Why this arrow exists</h3><p><strong>'+safe(src?.title)+' → '+safe(tgt?.title)+'</strong></p>'+
 '<p>'+safe(e.label||TYPENAMES[e.type]||e.type)+'</p>'+
 '<p>Type: '+safe(TYPENAMES[e.type]||e.type)+' · Status: '+safe(e.confidence||"Not graded")+
 ' · Evidence: '+safe(e.evidenceKind||"Source statement")+'</p>'+
 '<p>'+safe(e.evidence||"The register points to an external bibliography; no passage collation is claimed.")+'</p>'+
 '<div class="source-evidence">'+(refs||'<p>The source entry has no independently clickable URL.</p>')+'</div>'+
 '<p class="source-summary">An arrow never implies complete doctrinal agreement or an unverified transmission chain.</p></section>';
}
function plotView(){
 if(state.view==="geography"||state.view==="regions"){
  const markup=window.GNAMMAGeography?.render(filtered(false),state.subject,state.view)||
    '<div class="warning">Geographical evidence module unavailable; consult the documented source catalogue.</div>';
  return '<section class="plot plot-geography" aria-label="Geographical atlas of authors and texts">'+markup+'</section>';
 }
 let v;
 if(state.view==="timeline")v=viewTimeline();
 else if(state.view==="network")v=viewNetwork();
 else if(state.view==="principal")v=viewPrincipal();
 else v=viewCatalogue();
 return '<section class="plot" aria-label="Maps and textual networks"><header class="plot-head"><div><h2>'+safe(v.title)+'</h2>'+
 '<p>'+safe(v.sub||"")+'</p></div><div class="plot-actions">'+
 (state.family?'<button data-clear-family>Clear textual family</button>':"")+
 '<button data-reset>Reset subject filters</button></div></header>'+v.html+
 (data.errors.length?'<p class="warning">A source register is unavailable: '+safe(data.errors.join("; "))+'. The audited records remain accessible.</p>':"")+'</section>';
}
function searchResults(q){
 const words=normal(q);if(!words)return [];
 return data.all.filter(n=>n.searchText.includes(words))
  .sort((a,b)=>{const la=normal(a.title),lb=normal(b.title);
   const sa=(la.startsWith(words)?100:0)+(a.pinned?30:0)+(a.layer==="audited"?25:0)+(a.degree||0);
   const sb=(lb.startsWith(words)?100:0)+(b.pinned?30:0)+(b.layer==="audited"?25:0)+(b.degree||0);
   return sb-sa||la.localeCompare(lb);
  }).slice(0,MAX_SEARCH);
}
function fillSearch(){
 const pop=ROOT.querySelector("#gn-search-pop");if(!pop)return;
 if(!state.searchOpen||!state.search.trim()){pop.hidden=true;pop.textContent="";return}
 const results=searchResults(state.search).slice(0,12);
 pop.hidden=false;
 pop.innerHTML=results.map(n=>'<button type="button" data-search-select="'+safe(n.id)+'">'+
 '<strong>'+safe(truncate(n.title,64))+'</strong><small>'+safe(truncate(n.author,48))+' · '+safe(n.provenance)+'</small></button>').join("")||
 '<p class="source-summary">No matching title in the indexed registers.</p>';
}
function render(first=false){
 if(!data.loadReady)return;
 if(!data.byId.has(state.selected))selectFeatured(false);
 const geographic=state.view==="geography"||state.view==="regions";
 ROOT.innerHTML=hero()+toolsUI()+
 '<div class="workplace'+(geographic?' geo-mode':'')+'">'+plotView()+
 (geographic?'':'<aside class="sidebar" aria-label="Work and evidence details"><div class="side-head"><h2>Selected work · evidence</h2>'+
 '<button type="button" data-close-side>Clear focus</button></div><div class="side-content">'+recordPanel()+'</div></aside>')+'</div>';
 fillSearch();
 if(first)writeHash(false);
}
function changeRange(a,b){
 if(!Number.isFinite(a)||!Number.isFinite(b)||b<=a+9)return;
 const span=clip(b-a,12,PERIOD_MAX-PERIOD_MIN);
 state.from=clip(a,PERIOD_MIN,PERIOD_MAX-span);state.to=state.from+span;
 state.cluster="";state.clusterPage=1;
 writeHash();render();
}
function onClick(e){
 const el=e.target.closest("button,[role=button]");if(!el||!ROOT.contains(el))return;
 const summary=e.target.closest(".atlas-advanced summary");if(summary){state.advancedOpen=!state.advancedOpen;return;}
 if(el.hasAttribute("data-subject")){
  initialSubject(el.getAttribute("data-subject"));writeHash(true);render();return;
 }
 if(el.hasAttribute("data-view")){
  state.view=el.getAttribute("data-view");state.cluster="";state.evidence="";
  writeHash(true);render();return;
 }
 if(el.hasAttribute("data-select")||el.hasAttribute("data-search-select")){
  chooseWork(el.getAttribute("data-select")||el.getAttribute("data-search-select"),el.hasAttribute("data-search-select"));return;
 }
 if(el.hasAttribute("data-show-network")){chooseWork(el.getAttribute("data-show-network"),true);return}
 if(el.hasAttribute("data-cluster")){
  const key=el.getAttribute("data-cluster");
  const items=renderCache.clusters.get(key);if(!items?.length)return;
  const a=Math.min(...items.map(x=>x.year)),b=Math.max(...items.map(x=>x.year));
  if(state.to-state.from>130){changeRange(a-45,b+45);return}
  state.cluster=key;state.clusterPage=1;render();return;
 }
 if(el.hasAttribute("data-unplaced")){state.cluster=el.getAttribute("data-unplaced");state.clusterPage=1;render();return}
 if(el.hasAttribute("data-page")){
  const [kind,delta]=el.getAttribute("data-page").split(":");
  if(kind==="catalogue")state.bookPage=Math.max(1,state.bookPage+Number(delta));
  else state.clusterPage=Math.max(1,state.clusterPage+Number(delta));
  render();return;
 }
 if(el.hasAttribute("data-zoom")){
  const fac=Number(el.getAttribute("data-zoom")),mid=(state.from+state.to)/2,span=(state.to-state.from)*fac;
  changeRange(mid-span/2,mid+span/2);return;
 }
 if(el.hasAttribute("data-pan")){
  const shift=(state.to-state.from)*.23*Number(el.getAttribute("data-pan"));
  changeRange(state.from+shift,state.to+shift);return;
 }
 if(el.hasAttribute("data-reset-years")){state.from=state.subject==="intellectual"||state.subject==="all"?-600:630;state.to=state.subject==="intellectual"||state.subject==="all"?2026:1920;state.cluster="";writeHash();render();return}
 if(el.hasAttribute("data-apply-years")){
  const a=Number(ROOT.querySelector("[data-year-from]")?.value),b=Number(ROOT.querySelector("[data-year-to]")?.value);
  if(b>a+9)changeRange(a,b);else ROOT.querySelector("[data-year-to]")?.setCustomValidity("End year must be at least ten years after the start");return;
 }
 if(el.hasAttribute("data-clear-family")){state.family="";writeHash();render();return}
 if(el.hasAttribute("data-reset")){state.school="all";state.family="";state.source="all";state.edgeType="all";state.certainty="all";state.search="";state.region="";state.cluster="";state.bookPage=1;writeHash();render();return}
 if(el.hasAttribute("data-evidence")){state.evidence=el.getAttribute("data-evidence");render();return}
 if(el.hasAttribute("data-close-evidence")){state.evidence="";render();return}
 if(el.hasAttribute("data-more")){state.quickLimit+=8;render();return}
 if(el.hasAttribute("data-place")){state.region=el.getAttribute("data-place");state.view="catalogue";state.bookPage=1;writeHash();render();return}
 if(el.hasAttribute("data-copy")){writeHash();if(navigator.clipboard?.writeText)navigator.clipboard.writeText(location.href);return}
 if(el.hasAttribute("data-close-side")){state.selected="";state.evidence="";writeHash();render();return}
}
function onChange(e){
 const t=e.target;if(!ROOT.contains(t))return;
 if(t.hasAttribute("data-science")){initialSubject(t.value);writeHash(true);render();return}
 const mapped={"data-school":"school","data-source":"source","data-family":"family","data-edge-type":"edgeType","data-certainty":"certainty"};
 for(const [attr,key] of Object.entries(mapped))if(t.hasAttribute(attr)){
  state[key]=t.value;state.cluster="";state.bookPage=1;state.clusterPage=1;
  if(key==="family"&&t.value){const f=data.families.find(f=>f.id===t.value);if(f&&data.byId.has("c:"+f.root))state.selected="c:"+f.root;state.source="all";state.school="all";}
  if(key==="school"&&t.value!=="all"&&state.selected&&!data.byId.get(state.selected)?.schools.includes(t.value))selectFeatured(false);
  writeHash();render();return;
 }
 // Do not rebuild the DOM on blur from a search-result click:
 // the resulting 'change' event precedes the suggestion's 'click' event.
}
let pendingSearch=null;
function onInput(e){
 const t=e.target;if(t.id!=="gn-search")return;
 const value=t.value.slice(0,140);state.search=value;state.searchOpen=!!value.trim();
 clearTimeout(pendingSearch);
 pendingSearch=setTimeout(()=>{
  if(!t.isConnected)return;
  fillSearch();
  // Search across entire corpus; choosing a suggestion navigates to its work.
 },130);
}
ROOT.addEventListener("click",onClick);
ROOT.addEventListener("change",onChange);
ROOT.addEventListener("input",onInput);
ROOT.addEventListener("keydown",e=>{
 const el=e.target.closest("[role=button]");
 if(el&&["Enter"," "].includes(e.key)){e.preventDefault();if(typeof el.click==="function")el.click();else el.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true}));}
 if(e.key==="Escape"){state.searchOpen=false;fillSearch()}
 if(e.key==="Enter"&&e.target?.id==="gn-search"&&state.search.trim()){
  const results=searchResults(state.search);
  if(results.length)chooseWork(results[0].id,true);
 }
});
window.addEventListener("popstate",()=>{if(!data.loadReady)return;readHash();render()});
window.addEventListener("hashchange",()=>{if(!data.loadReady)return;readHash();render()});
window.GNAtlasUnified={debug:()=>({ready:data.loadReady,subject:state.subject,view:state.view,selected:state.selected,
 total:data.all.length,edges:data.edges.length,counts:data.counts,lanes:renderCache.lanes.length,
 currentMatches:filtered().length,errors:data.errors.slice()}),
 select:id=>chooseWork(id,true)};
load().catch(err=>{ROOT.innerHTML='<section class="loading"><h1>Atlas could not initialize</h1><p>'+safe(err?.message||err)+'</p><p><a href="corpora/expansion.html">Open the source bibliography</a></p></section>'});
})();
