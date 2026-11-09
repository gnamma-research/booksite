(function GNWorkExplorerModule() {
"use strict";
const host = document.getElementById("kalam-timeline-app-v3");
if (!host) return;
const esc = x => String(x ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm = x => String(x ?? "").normalize("NFKD").replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, "").replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").toLowerCase();
const trim = (x,n=27) => Array.from(String(x??"")).length>n?Array.from(String(x)).slice(0,n-1).join("")+"…":String(x??"");
const years = ah => Number.isFinite(+ah) && +ah>0 ? Math.round(622+(+ah-1)*0.970224) : null;
const goodURL = u => {try {const x=new URL(String(u),location.href);return ["https:","http:"].includes(x.protocol)?x.href:"";} catch {return ""}};
const SCHOOLS={hanafi:"Ḥanafī",maliki:"Mālikī",shafii:"Shāfiʿī",hanbali:"Ḥanbalī",early:"Early jurists",named_other:"Other historical schools",unassigned:"Unassigned"};
const FIELDS={all:"Every science",audited:"Philosophy, kalām & intellectual history",fiqh:"Fiqh",usul:"Uṣūl al-fiqh",nahw:"Naḥw / grammar",sarf:"Ṣarf / morphology",balagha:"Balāgha",lugha:"Lexicography",hadith:"Hadith",tafsir:"Tafsīr",tasawwuf:"Taṣawwuf"};
const RELS={component:"Constituent section",commentary:"Commentary",gloss:"Gloss",translation_adaptation:"Translation / adaptation",textual_use:"Textual use",author_reference:"Author reference",critique:"Critical engagement",reported_doctrine:"Reported teaching",reported_source:"Source testimony",exchange:"Exchange",broad_influence:"Broader connection",hypothesis:"Hypothesis",claimed_lineage:"Claimed lineage",abridgement:"Abridgement",summary:"Summary",translation:"Translation"};
const GAZETTEER=[
 ["Baghdad",33.31,44.36,/\bbaghdad\b/i],["Basra",30.50,47.81,/\bbasra\b/i],["Cairo",30.04,31.24,/\bcairo\b/i],
 ["Damascus",33.51,36.29,/\bdamascus\b/i],["Aleppo",36.20,37.16,/\baleppo\b/i],["Istanbul",41.01,28.98,/\bistanbul\b/i],
 ["Konya",37.87,32.49,/\bkonya\b/i],["Isfahan",32.65,51.67,/\bisfahan\b/i],["Shiraz",29.60,52.53,/\bshiraz\b/i],
 ["Nishapur",36.21,58.80,/\bnishapur\b/i],["Herat",34.35,62.20,/\bherat\b/i],["Bukhara",39.77,64.42,/\bbukhara\b/i],
 ["Samarqand",39.65,66.96,/\bsamarqand|samarkand\b/i],["Merv",37.66,62.19,/\bmerv\b/i],
 ["Delhi",28.61,77.21,/\bdelhi\b/i],["Lucknow",26.85,80.95,/\blucknow\b/i],
 ["Cordoba",37.89,-4.78,/\bcordoba|córdoba\b/i],["Tunis",36.81,10.18,/\btunis\b/i],
 ["Mecca",21.42,39.83,/\bmecca|makkah\b/i],["Medina",24.47,39.61,/\bmedina|madinah\b/i]
];
const model={source:null,canonicalBuilt:false,catalogueBuilt:false,all:[],nodes:new Map(),edges:[],edgeById:new Map(),incoming:new Map(),outgoing:new Map(),sources:new Map(),families:[],stats:{canonical:0,bibliographic:0,auditedEdges:0,sourceEdges:0},error:"",loading:false};
const state={scope:"all",school:"all",provenance:"all",family:"",work:"",edge:"",search:"",kind:"all",direction:"both",quality:"all",hops:1,mode:"network",page:1,place:"",perPage:20};
let lastArgs=null,initHash=false,searchTimer=null,shownNodes=[],shownEdges=[],lastResults=0;
const sourcesFor = (edge) => (edge.sourceIds||[]).map(id=>model.sources.get(id)).filter(Boolean).concat(edge.sourceUrl?[{title:edge.sourceLabel||"Bibliographical evidence",url:edge.sourceUrl}]:[]);
const join = (arr)=>[...new Set((arr||[]).filter(Boolean))].join(", ");
function resetIndexes() {
 model.nodes=new Map(model.all.map(n=>[n.id,n]));
 model.edgeById=new Map(model.edges.map(e=>[e.id,e]));
 model.incoming=new Map();model.outgoing=new Map();
 for(const e of model.edges) {
   if(!model.nodes.has(e.from)||!model.nodes.has(e.to))continue;
   if(!model.outgoing.has(e.from))model.outgoing.set(e.from,[]);
   if(!model.incoming.has(e.to))model.incoming.set(e.to,[]);
   model.outgoing.get(e.from).push(e);model.incoming.get(e.to).push(e);
 }
 for(const n of model.all)n.degree=(model.incoming.get(n.id)||[]).length+(model.outgoing.get(n.id)||[]).length;
}
function canonical(D) {
 if(model.canonicalBuilt)return;
 model.source=D;
 model.families=Array.isArray(D.textual_families)?D.textual_families:[];
 const sourceRecords=[...(D.sources||[]),...(D.history?.sources||[])];
 sourceRecords.forEach(s=>model.sources.set(s.id,s));
 const nodes=(D.nodes||[]).filter(n=>(n.node_type||"work")==="work"&&!n.not_a_work&&n.title).map(n=>({
  id:"c:"+n.id,originId:n.id,layer:"audited",title:n.title,arabic:n.title_ar||"",author:n.author||"",authorDates:n.author_dates||"",
  dateLabel:n.date_label||"Chronology not established",dateStatus:n.date_status||"",year:n.temporal?.anchor!=null&&Number.isFinite(+n.temporal.anchor)?+n.temporal.anchor:null,
  region:n.region||"",schools:[],genres:["audited"],provenance:"audited",sourceIds:n.sources||[],sourceUrl:"",
  description:n.note||n.summary||"",status:n.kind||"work",family:n.family||"",readerId:"",search:norm([n.id,n.title,n.title_ar,n.author,n.region,n.family].join(" "))
 }));
 const good=new Set(nodes.map(n=>n.id));
 const edges=(D.edges||[]).filter(e=>good.has("c:"+e.source)&&good.has("c:"+e.target)).map(e=>({
   id:"c:"+e.id,from:"c:"+e.source,to:"c:"+e.target,type:e.relation||"other",
   label:e.label||RELS[e.relation]||e.relation||"Documented relation",
   confidence:e.confidence||"Source-qualified",evidence:e.evidence||"",evidenceKind:e.evidence_kind||"",
   sourceIds:e.sources||[],sourceUrl:"",layer:"audited"
 }));
 model.all.push(...nodes);model.edges.push(...edges);model.stats.canonical=nodes.length;model.stats.auditedEdges=edges.length;
 model.canonicalBuilt=true;resetIndexes();
 if(!state.work || !model.nodes.has(state.work) && !state.work.startsWith("b:")) {
  const preferred=["c:ibnarabi_fusus","c:tusi_tajrid","c:avicenna_isharat","c:taftazani_tahdhib"];
  state.work=preferred.find(id=>model.nodes.has(id))||nodes.find(n=>n.degree>0)?.id||nodes[0]?.id||"";
 }
}
function bibliographic(payload) {
 if(model.catalogueBuilt || !payload?.ready)return;
 const records=payload.records||[], reader=payload.reader||{books:[],relationships:[]};
 const mapped=records.map(w=>({
  id:"b:"+w.id,originId:w.id,layer:"bibliographic",title:w.roman||w.title,arabic:/[\u0600-\u06ff]/.test(w.title)?w.title:"",
  author:w.author||"",authorDates:w.death?"d. "+w.death+" AH":"",dateLabel:w.death?"Author d. "+w.death+" AH; c. "+years(w.death)+" CE":"Undated bibliography",
  dateStatus:w.death?"Approximate CE equivalent of author's death; NOT composition date":"Unplaced; no historical date asserted",
  year:years(w.death),deathAH:w.death||null,region:"",schools:w.schools||[],genres:w.genres||[],
  provenance:w.sourceType||"bibliographic",sourceIds:[],sourceUrl:w.url||"",sourceLabel:w.sourceDetail||w.sourceType||"",
  description:[w.sourceNote,w.warnings].filter(Boolean).join(" "),status:w.sourceType||"bibliography",
  family:join(w.lines),readerId:w.readerId||"",pinned:!!w.pinned,
  schoolEvidence:w.schoolEvidence||"",manuscripts:w.manuscripts||0,
  search:norm([w.title,w.roman,w.author,w.id,(w.genres||[]).join(" ")].join(" "))
 }));
 const byReader=new Map(mapped.filter(n=>n.readerId).map(n=>[n.readerId,n]));
 const good=new Set(mapped.map(n=>n.id));
 const links=(reader.relationships||[]).map(e=>{
  const a=byReader.get(e.source),b=byReader.get(e.target);
  if(!a||!b||!good.has(a.id)||!good.has(b.id))return null;
  return {id:"r:"+e.id,from:a.id,to:b.id,type:e.type||"textual_use",
   label:e.label||e.type||"Documented relationship",confidence:e.confidence||"Bibliographically attested",
   evidence:e.evidence||"",evidenceKind:"External bibliographical reference",
   sourceIds:[],sourceUrl:goodURL(e.source_url),sourceLabel:"Pinned reader relationship source",layer:"pinned"};
 }).filter(Boolean);
 model.all.push(...mapped);model.edges.push(...links);
 model.stats.bibliographic=mapped.length;model.stats.sourceEdges=links.length;
 model.catalogueBuilt=true;model.error="";resetIndexes();
}
function ensureCatalogue() {
 if(model.catalogueBuilt||model.loading)return;
 const bridge=window.GNAtlasBibliography;
 if(!bridge?.getData || !bridge?.ensureLoad){model.error="Shared bibliography service is unavailable";return;}
 const payload=bridge.getData();
 if(payload?.ready){bibliographic(payload);return;}
 if(payload?.error){model.error=payload.error;return;}
 model.loading=true;
 Promise.resolve(bridge.ensureLoad()).then(()=>{
  const fresh=bridge.getData();
  if(fresh?.ready)bibliographic(fresh);
  else model.error=fresh?.error||"Bibliographic source register unavailable";
 }).catch(err=>model.error=String(err?.message||err))
 .finally(()=>{model.loading=false;if(lastArgs?.isActive())render(lastArgs)});
}
function readHash() {
 const p=new URLSearchParams(location.hash.slice(1));
 state.scope=Object.hasOwn(FIELDS,p.get("gnx_scope"))?p.get("gnx_scope"):"all";
 state.school=Object.hasOwn(SCHOOLS,p.get("gnx_school"))?p.get("gnx_school"):"all";
 state.provenance=["all","audited","openiti","alreq","reader"].includes(p.get("gnx_provenance"))?p.get("gnx_provenance"):"all";
 state.family=p.get("gnx_family")||"";
 state.work=p.get("gnx_work")||"";
 state.edge=p.get("gnx_edge")||"";
 state.search=(p.get("gnx_q")||"").slice(0,140);
 state.kind=["all","commentary","critique","translation","use","other"].includes(p.get("gnx_kind"))?p.get("gnx_kind"):"all";
 state.direction=["both","prior","later"].includes(p.get("gnx_direction"))?p.get("gnx_direction"):"both";
 state.quality=p.get("gnx_quality")==="strong"?"strong":"all";
 state.hops=p.get("gnx_hops")==="2"?2:1;
 state.mode=["network","geography","coverage"].includes(p.get("gnx_mode"))?p.get("gnx_mode"):"network";
 state.page=Math.max(1,Math.min(500,Number(p.get("gnx_page"))||1));
 state.place=p.get("gnx_place")||"";
}
function writeHash(push=false) {
 const p=new URLSearchParams(location.hash.slice(1));
 p.set("view","explorer");
 const pairs={gnx_scope:state.scope,gnx_school:state.school,gnx_provenance:state.provenance,gnx_family:state.family,
  gnx_work:state.work,gnx_edge:state.edge,gnx_q:state.search,gnx_kind:state.kind,
  gnx_direction:state.direction,gnx_quality:state.quality,gnx_hops:String(state.hops),
  gnx_mode:state.mode,gnx_page:String(state.page),gnx_place:state.place};
 for(const [k,v] of Object.entries(pairs))if(!v || v==="all" || v==="network" || v==="both" || v==="1" && (k==="gnx_hops"||k==="gnx_page"))p.delete(k);else p.set(k,v);
 const h="#"+p.toString();
 if(location.hash!==h)try{history[push?"pushState":"replaceState"](null,"",h)}catch{location.hash=h;}
}
function typeFamily(e) {
 const t=norm(e.type||"")+" "+norm(e.label||"");
 if(/commentary|gloss|sharh|ḥāshiya|hashiya|hasiya|ta.liq/.test(t))return "commentary";
 if(/critique|response|adjudicat|refut|objection/.test(t))return "critique";
 if(/translat|adapt/.test(t))return "translation";
 if(/textual|reported|citation|reference|source|use|abridge|summary|component|broad_influence/.test(t))return "use";
 return "other";
}
function isWeak(e){return /qualified|proposed|contested|hypothesi|claimed|unverified|uncertain/i.test(e.confidence+" "+e.type);}
function allowed(e) {
 if(state.kind!=="all" && typeFamily(e)!==state.kind)return false;
 if(state.quality==="strong"&&isWeak(e))return false;
 if(state.family){
  const f=model.families.find(f=>f.id===state.family);
  if(f && (!f.member_ids.includes(e.from.slice(2))||!f.member_ids.includes(e.to.slice(2))))return false;
 }
 return true;
}
function inScope(n) {
 if(state.scope==="audited"&&n.layer!=="audited")return false;
 if(state.scope!=="all"&&state.scope!=="audited"&&!n.genres.includes(state.scope))return false;
 if(state.school!=="all"&&!n.schools.includes(state.school))return false;
 if(state.provenance==="audited"&&n.layer!=="audited")return false;
 if(state.provenance==="reader"&&!n.pinned)return false;
 if(["openiti","alreq"].includes(state.provenance)&&n.provenance!==state.provenance)return false;
 if(state.place) {const g=GAZETTEER.find(p=>p[0]===state.place);if(!g||!g[3].test(n.region||""))return false;}
 if(state.search&&!n.search.includes(norm(state.search)))return false;
 if(state.family){const f=model.families.find(f=>f.id===state.family);if(f && (n.layer!=="audited"||!f.member_ids.includes(n.originId)))return false;}
 return true;
}
function results() {
 const list=model.all.filter(inScope);
 list.sort((a,b)=> {
  if(state.search){const nq=norm(state.search);const aa=a.search.startsWith(nq)?-1:0,bb=b.search.startsWith(nq)?-1:0;if(aa!==bb)return aa-bb;}
  if(a.year!==b.year)return (a.year??9999)-(b.year??9999);
  return (a.title||"").localeCompare(b.title||"");
 });
 return list;
}
function opts(obj,current){return Object.entries(obj).map(([k,v])=>'<option value="'+esc(k)+'"'+(current===k?' selected':'')+'>'+esc(v)+'</option>').join("");}
function nodeName(n){return n?.title||n?.arabic||"Unidentified work";}
function sheet(n) {
 if(!n)return "";
 const found=(model.incoming.get(n.id)||[]).length+(model.outgoing.get(n.id)||[]).length;
 const works= n.layer==="audited" && n.family?'<p>'+esc(n.family)+'</p>':"";
 const evidence=(n.sourceIds||[]).map(id=>model.sources.get(id)).filter(Boolean);
 const ext=goodURL(n.sourceUrl);
 const sources=evidence.map(s=>goodURL(s.url)?'<a href="'+esc(goodURL(s.url))+'" target="_blank" rel="noopener noreferrer">'+esc(s.title||s.id)+'</a>':'<span>'+esc(s.title||s.id)+'</span>').join(" · ");
 const route=n.layer==="audited" && n.originId ?'#view=timeline&work='+encodeURIComponent(n.originId):"";
 const reader=n.layer==="audited" && model.source?.nodes?.find(a=>a.id===n.originId)?.tajrid_reader ? '../tajrid/#book/'+encodeURIComponent(n.originId):"";
 return '<section class="gnx-profile" aria-label="Selected work profile">'+
  '<div class="gnx-profile-top"><div><span class="gnx-kicker">'+(n.layer==="audited"?"Audited historical entry":"Source-linked bibliographic record")+'</span><h3>'+esc(nodeName(n))+'</h3>'+
  (n.arabic?'<div dir="rtl" lang="ar" class="gnx-arabic">'+esc(n.arabic)+'</div>':"")+
  '<p>'+esc(n.author||"Author not identified")+' · '+esc(n.dateLabel)+'</p></div><button data-gnx-copy type="button" title="Copy a link to this work">Copy link</button></div>'+
  '<p class="gnx-caveat">'+esc(n.dateStatus||"Composition date not established")+'</p>'+
  (n.schools.length?'<p>Catalogue school association: '+esc(n.schools.map(s=>SCHOOLS[s]||s).join(", "))+'</p>':"")+
  (n.schoolEvidence?'<p class="gnx-caveat">School evidence: '+esc(n.schoolEvidence)+'</p>':"")+
  (n.region?'<p>Recorded regional context: '+esc(n.region)+' (not a proven place of composition)</p>':"")+
  (works||"")+
  (n.description?'<p>'+esc(n.description)+'</p>':"")+
  '<p class="gnx-small">'+found+' recorded direct relationships in the present registers; zero means none is recorded, not that none existed.</p>'+
  (n.manuscripts?'<p class="gnx-small">Catalogue reports '+n.manuscripts+' manuscript records; these witnesses have not been collated here.</p>':"")+
  '<div class="gnx-actions">'+(route?'<a href="'+esc(route)+'">Historical timeline</a>':"")+
   (reader?'<a href="'+esc(reader)+'">Tajrīd reader</a>':"")+
   (ext?'<a href="'+esc(ext)+'" target="_blank" rel="noopener noreferrer">'+(n.provenance==="alreq"?"Manuscript catalogue":"Original source record")+'</a>':"")+
   (sources?'<span class="gnx-sources">Sources: '+sources+'</span>':"")+'</div></section>';
}
function edgeDetail(e) {
 if(!e)return "";
 const n1=model.nodes.get(e.from),n2=model.nodes.get(e.to);
 const ss=sourcesFor(e);
 return '<section class="gnx-evidence" aria-label="Relationship evidence"><div class="gnx-profile-top"><h3>Relationship evidence</h3><button type="button" data-gnx-close-edge>Close</button></div>'+
 '<p><strong>'+esc(nodeName(n1))+'</strong> → <strong>'+esc(nodeName(n2))+'</strong></p>'+
 '<p>'+esc(e.label||RELS[e.type]||e.type)+'</p>'+
 '<dl><dt>Relationship type</dt><dd>'+esc(RELS[e.type]||e.type)+'</dd><dt>Evidence status</dt><dd>'+esc(e.confidence||"Not graded")+'</dd>'+
 '<dt>Evidence kind</dt><dd>'+esc(e.evidenceKind||e.layer||"Bibliographical source")+'</dd></dl>'+
 '<p>'+esc(e.evidence||"See individual bibliography.")+'</p>'+
 (ss.length?'<div class="gnx-citations"><strong>Evidence sources</strong>'+
 ss.map(s=>goodURL(s.url)?'<p><a href="'+esc(goodURL(s.url))+'" target="_blank" rel="noopener noreferrer">'+esc(s.title||"Citation")+'</a> '+esc(s.locator||"")+'</p>':
 '<p>'+esc(s.title||s.id||"Source reference")+' '+esc(s.locator||"")+'</p>').join("")+'</div>':'<p>No independently clickable source was recorded.</p>')+
 '<p class="gnx-caveat">This relation does not establish total doctrinal agreement, manuscript collation or an unrecorded transmission chain.</p></section>';
}
function selectNetwork() {
 const center=model.nodes.get(state.work);
 if(!center)return {columns:[],edges:[],hidden:0,allIds:new Set()};
 const columns=new Map([[0,[center]]]),seen=new Set([center.id]),groups=[new Set([center.id])];
 let hidden=0;
 const perLayer=11;
 for(let d=1;d<=state.hops;d++){
  const prev=groups[d-1];
  const next=new Set();
  for(const sign of [-1,1]) {
   if(sign<0&&state.direction==="later"||sign>0&&state.direction==="prior")continue;
   let candidates=new Map();
   const current=d===1?prev:new Set((columns.get(sign*(d-1))||[]).map(x=>x.id));
   for(const id of current){
    const links=sign<0?(model.incoming.get(id)||[]):(model.outgoing.get(id)||[]);
    for(const e of links) {
     if(!allowed(e))continue;
     const neighbor=sign<0?e.from:e.to;
     if(seen.has(neighbor))continue;
     const n=model.nodes.get(neighbor);
     if(!n)continue;
     // Do not infer an undocumented link between canonical and bibliographic layers.
     candidates.set(neighbor,n);
    }
   }
   let arranged=[...candidates.values()].sort((a,b)=>b.degree-a.degree||String(a.title).localeCompare(String(b.title)));
   hidden+=Math.max(0,arranged.length-perLayer);
   arranged=arranged.slice(0,perLayer);
   columns.set(sign*d,arranged);
   for(const n of arranged){seen.add(n.id);next.add(n.id);}
  }
  groups.push(next);
 }
 const ids=new Set([...columns.values()].flatMap(col=>col.map(n=>n.id)));
 const links=model.edges.filter(e=>ids.has(e.from)&&ids.has(e.to)&&allowed(e));
 return {columns,edges:links,hidden,allIds:ids};
}
function color(e){const t=typeFamily(e);return t==="critique"?"#a45e53":t==="commentary"?"#447f86":t==="translation"?"#8b75a9":t==="use"?"#9a8046":"#7f8890";}
function plotDiagram(network) {
 const center=model.nodes.get(state.work);if(!center)return '<div class="gnx-empty">Select a work to explore its textual relationships.</div>';
 const layers=[...network.columns.keys()].sort((a,b)=>a-b),per=238,nodeWidth=199,nodeHeight=61,step=79;
 const maxRows=Math.max(1,...[...network.columns.values()].map(a=>a.length)),height=Math.max(270,maxRows*step+78),width=Math.max(410,layers.length*per+8);
 const pos=new Map();
 let svgLines="",svgNodes="";
 for(let column=0;column<layers.length;column++){
  const d=layers[column],arr=network.columns.get(d)||[];
  const shift=Math.max(0,(maxRows-arr.length)*step/2);
  for(let i=0;i<arr.length;i++){
   const n=arr[i],x=16+per*column,y=47+shift+i*step;pos.set(n.id,{x,y});
   const status=n.layer==="audited"?"Audited":n.pinned?"Pinned source":n.provenance==="alreq"?"Manuscript catalogue":"OpenITI metadata";
   svgNodes+='<g role="button" tabindex="0" data-gnx-focus="'+esc(n.id)+'" aria-label="'+esc(nodeName(n)+' by '+n.author)+'">'+
   '<title>'+esc(nodeName(n)+" · "+n.author+" · "+n.dateLabel)+'</title>'+
   '<rect x="'+x+'" y="'+y+'" width="'+nodeWidth+'" height="'+nodeHeight+'" rx="7" fill="'+(n.id===state.work?"#437e85":"#7b92a0")+'" fill-opacity="'+(n.id===state.work?".18":".07")+'" stroke="'+(n.id===state.work?"#437e85":"#819198")+'" stroke-opacity=".7" stroke-width="'+(n.id===state.work?2:1)+'"/>'+
   '<text x="'+(x+9)+'" y="'+(y+17)+'" font-size="11.7" fill="currentColor" font-weight="600">'+esc(trim(nodeName(n),28))+'</text>'+
   '<text x="'+(x+9)+'" y="'+(y+33)+'" font-size="10.2" fill="currentColor" opacity=".78">'+esc(trim(n.author,29))+'</text>'+
   '<text x="'+(x+9)+'" y="'+(y+49)+'" font-size="9.7" fill="currentColor" opacity=".65">'+esc(trim(status+" · "+(n.dateLabel||""),33))+'</text></g>';
  }
 }
 for(const e of network.edges) {
  const a=pos.get(e.from),b=pos.get(e.to);if(!a||!b)continue;
  const right=b.x>a.x;
  const x1=right?a.x+nodeWidth:a.x+nodeWidth*.5,y1=right?a.y+nodeHeight*.5:a.y+nodeHeight;
  const x2=right?b.x:b.x+nodeWidth*.5,y2=right?b.y+nodeHeight*.5:b.y;
  const path=right?'M'+x1+','+y1+' C'+(x1+24)+','+y1+' '+(x2-24)+','+y2+' '+x2+','+y2:
    'M'+x1+','+y1+' C'+x1+','+(y1+30)+' '+x2+','+(y2-30)+' '+x2+','+y2;
  svgLines+='<g data-gnx-edge="'+esc(e.id)+'" role="button" tabindex="0" aria-label="'+esc(e.label)+'"><title>'+esc(e.label+" — "+e.confidence)+'</title>'+
   '<path d="'+path+'" fill="none" stroke="'+color(e)+'" stroke-width="1.7" '+(isWeak(e)?'stroke-dasharray="5 4"':'')+
   ' marker-end="url(#gnx-arrow)"/><path d="'+path+'" fill="none" stroke="transparent" stroke-width="17" pointer-events="stroke"/></g>';
 }
 const labels=layers.map((d,i)=>'<text x="'+(16+i*per+nodeWidth/2)+'" y="23" text-anchor="middle" font-size="10.5" fill="currentColor" opacity=".7">'+
   (d<0?"Antecedents · "+Math.abs(d):d>0?"Reception · "+d:"Selected work")+'</text>').join("");
 return '<div class="gnx-network-wrap" role="region" tabindex="0" aria-label="Scrollable directed work graph">'+
 '<svg class="gnx-network-svg" viewBox="0 0 '+width+' '+height+'" width="'+width+'" height="'+height+'" role="group" aria-label="Documented work-to-work graph">'+
 '<defs><marker id="gnx-arrow" viewBox="0 0 10 10" refX="8.7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1 L9 5 L1 9 Z" fill="#547f8d"/></marker></defs>'+
 labels+svgLines+svgNodes+'</svg></div>'+
 '<p class="gnx-small">'+network.allIds.size+' visible work records · '+network.edges.length+' documented links'+
 (network.hidden?' · '+network.hidden+' additional neighbors beyond this diagram’s per-column limit':'')+
 '. Arrows show documented textual relations, not school membership or chronological coexistence. Select an arrow to inspect its evidence.</p>';
}
function relationLists(n){
 if(!n)return "";
 const from=(model.incoming.get(n.id)||[]).filter(allowed),to=(model.outgoing.get(n.id)||[]).filter(allowed);
 function rows(edges,previous){
  return edges.slice(0,60).map(e=>{
   const peer=model.nodes.get(previous?e.from:e.to);
   return '<div class="gnx-relation"><button type="button" data-gnx-focus="'+esc(peer.id)+'">'+esc(trim(nodeName(peer),58))+'</button>'+
   '<small>'+esc(RELS[e.type]||e.type)+" · "+esc(e.confidence||"")+'</small>'+
   '<button type="button" class="gnx-evidence-button" data-gnx-edge="'+esc(e.id)+'">Evidence</button></div>';
  }).join("")+(edges.length>60?'<p class="gnx-small">+'+(edges.length-60)+' further relationships in register. Use the graph and filters to navigate.</p>':"");
 }
 return '<div class="gnx-relations"><section><h4>Sources / antecedents ('+from.length+')</h4>'+ (from.length?rows(from,true):'<p class="gnx-small">No incoming link is recorded in this dataset.</p>')+'</section>'+
 '<section><h4>Later reception ('+to.length+')</h4>'+ (to.length?rows(to,false):'<p class="gnx-small">No outgoing link is recorded in this dataset.</p>')+'</section></div>';
}
function geography(){
 const candidates=model.all.filter(n=>n.layer==="audited"&&n.region);
 const counts=GAZETTEER.map(g=>({city:g[0],lat:g[1],lon:g[2],records:candidates.filter(n=>g[3].test(n.region))})).filter(x=>x.records.length);
 const W=900,H=360,left=28,top=25,plotW=W-56,plotH=H-50;
 const px=lon=>left+(lon+15)/130*plotW,py=lat=>top+(56-lat)/48*plotH;
 let lines="";
 for(const lon of [0,20,40,60,80,100]){let x=px(lon);lines+='<path d="M'+x+' '+top+'V'+(H-top)+'" stroke="currentColor" stroke-opacity=".12"/><text x="'+x+'" y="'+(H-5)+'" font-size="10" fill="currentColor" opacity=".6" text-anchor="middle">'+lon+'°E</text>';}
 for(const lat of [20,30,40,50]){let y=py(lat);lines+='<path d="M'+left+' '+y+'H'+(W-left)+'" stroke="currentColor" stroke-opacity=".12"/><text x="8" y="'+y+'" font-size="10" fill="currentColor" opacity=".6">'+lat+'°</text>';}
 const pins=counts.map(p=>{
  const x=px(p.lon),y=py(p.lat),r=Math.max(5,Math.min(21,Math.sqrt(p.records.length)*3));
  return '<g role="button" tabindex="0" data-gnx-place="'+esc(p.city)+'" aria-label="'+esc(p.city+': '+p.records.length+' regional label matches')+'">'+
  '<title>'+esc(p.city+" · "+p.records.length+" records whose regional label names this city")+'</title>'+
  '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#4e7888" fill-opacity=".6" stroke="#235469" stroke-width="1.2"/>'+
  '<text x="'+x+'" y="'+(y-r-5)+'" text-anchor="middle" font-size="11.2" fill="currentColor">'+esc(p.city)+'</text></g>';
 }).join("");
 const places=counts.map(p=>'<button type="button" data-gnx-place="'+esc(p.city)+'" '+(state.place===p.city?'class="is-active"':'')+'>'+esc(p.city)+' <small>'+p.records.length+'</small></button>').join("");
 return '<section class="gnx-geography"><h3>Historical regional context index</h3>'+
 '<p class="gnx-small">Cities are positioned by a curated modern gazetteer. A dot counts literal mentions in the audited records’ regional descriptions. It does <strong>not</strong> identify where a work was composed, establish a journey, or plot manuscript provenance. Undated catalogue entries without geographic metadata remain unplaced.</p>'+
 '<div class="gnx-network-wrap" role="region" tabindex="0"><svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="Indexed historical centres, coordinates approximate"><rect width="'+W+'" height="'+H+'" fill="currentColor" fill-opacity=".02"/>'+lines+pins+'</svg></div>'+
 '<div class="gnx-place-buttons"><button type="button" data-gnx-place="">All centres</button>'+places+'</div></section>';
}
function coverage(){
 const total=model.all.length,orphan=model.all.filter(n=>!n.degree).length,dated=model.all.filter(n=>n.year!==null).length;
 const genres=Object.entries(FIELDS).filter(([k])=>!["all","audited"].includes(k)).map(([g,label])=>{
  const items=model.all.filter(n=>n.genres.includes(g)),e=model.edges.filter(x=>model.nodes.get(x.from)?.genres.includes(g) && model.nodes.get(x.to)?.genres.includes(g));
  return '<tr><td>'+esc(label)+'</td><td>'+items.length+'</td><td>'+e.length+'</td></tr>';
 }).join("");
 return '<section class="gnx-coverage"><h3>Corpus coverage and its limits</h3>'+
 '<div class="gnx-metrics"><div><strong>'+total.toLocaleString()+'</strong><span>Visible source records</span></div>'+
 '<div><strong>'+model.edges.length+'</strong><span>Recorded relationships</span></div>'+
 '<div><strong>'+orphan.toLocaleString()+'</strong><span>Without a recorded link</span></div>'+
 '<div><strong>'+dated.toLocaleString()+'</strong><span>Chronologically placed</span></div></div>'+
 '<p class="gnx-caveat">These are source records, not deduplicated historical works. Original OpenITI versions and Alreq manuscript-category records remain distinct until a documented identity reconciliation is performed. Unconnected works may have many historical relationships not recorded here.</p>'+
 '<table><thead><tr><th>Science</th><th>Catalogue records</th><th>Within-science documented edges</th></tr></thead><tbody>'+genres+'</tbody></table>'+
 '<p class="gnx-small">The 404-entry canonical intellectual atlas includes contextual entities; only work-type records are included in this explorer. Verified textual relationships form a small subset of the bibliographic universe. No systematic passage alignment or manuscript collation is implied.</p></section>';
}
function drawResults(list) {
 lastResults=list.length;
 const totalPages=Math.max(1,Math.ceil(list.length/state.perPage));state.page=Math.min(state.page,totalPages);
 const start=(state.page-1)*state.perPage;
 const items=list.slice(start,start+state.perPage);
 const rows=items.map(n=>'<button type="button" data-gnx-focus="'+esc(n.id)+'" class="gnx-result'+(state.work===n.id?' is-active':'')+'">'+
  '<strong>'+esc(trim(nodeName(n),58))+'</strong><span>'+esc(trim(n.author,38))+' · '+esc(n.layer==="audited"?"Audited":n.pinned?"OpenITI · pinned":n.provenance==="alreq"?"Manuscript catalogue":"OpenITI")+
  ' · '+esc(n.year??"Undated")+'</span></button>').join("");
 return '<section class="gnx-results"><div class="gnx-profile-top"><h3>Search and browse</h3><span class="gnx-small">'+list.length.toLocaleString()+' matching records</span></div>'+
 '<div class="gnx-result-list">'+(rows||'<p class="gnx-small">No matching record. Try a different science or remove a filter.</p>')+'</div>'+
 '<div class="gnx-pagination"><button type="button" data-gnx-page="-1" '+(state.page===1?'disabled':'')+'>Previous</button>'+
 '<span>'+state.page+' / '+totalPages+'</span><button type="button" data-gnx-page="1" '+(state.page>=totalPages?'disabled':'')+'>Next</button></div></section>';
}
function controls(){
 const fam={"":"All work families"};for(const f of model.families)fam[f.id]=f.label;
 return '<div class="gnx-controls"><div class="gnx-control-row">'+
 '<label>Search all records<input data-gnx-search type="search" autocomplete="off" placeholder="Arabic, transliteration, author, URI…" value="'+esc(state.search)+'"/></label>'+
 '<label>Science<select data-gnx-scope>'+opts(FIELDS,state.scope)+'</select></label>'+
 '<label>School<select data-gnx-school>'+opts({all:"All schools",...SCHOOLS},state.school)+'</select></label>'+
 '<label>Provenance<select data-gnx-provenance>'+opts({all:"All records",audited:"Audited history",openiti:"OpenITI metadata",alreq:"Manuscript bibliography",reader:"GNAMMA pinned"},state.provenance)+'</select></label></div>'+
 '<details class="gnx-advanced"><summary>Refine relationships, family and traversal depth</summary><div class="gnx-control-row">'+
 '<label>Textual family<select data-gnx-family>'+opts(fam,state.family)+'</select></label>'+
 '<label>Connections<select data-gnx-kind>'+opts({all:"All verified types",commentary:"Commentary & gloss",critique:"Criticism & response",translation:"Translation & adaptation",use:"Textual use & sources",other:"Other recorded"},state.kind)+'</select></label>'+
 '<label>Direction<select data-gnx-direction>'+opts({both:"Before and after",prior:"Sources only",later:"Reception only"},state.direction)+'</select></label>'+
 '<label>Depth<select data-gnx-hops>'+opts({"1":"One step","2":"Two steps"},String(state.hops))+'</select></label>'+
 '<label>Evidence<select data-gnx-quality>'+opts({all:"Include qualified",strong:"Hide provisional links"},state.quality)+'</select></label></div></details>'+
 '<div class="gnx-control-row gnx-quick"><button type="button" data-gnx-mode="network" aria-pressed="'+(state.mode==="network")+'">Work network</button>'+
 '<button type="button" data-gnx-mode="geography" aria-pressed="'+(state.mode==="geography")+'">Regional index</button>'+
 '<button type="button" data-gnx-mode="coverage" aria-pressed="'+(state.mode==="coverage")+'">Coverage & limits</button>'+
 '<button type="button" data-gnx-export>Export current network JSON</button><button type="button" data-gnx-clear>Reset</button></div></div>';
}
function render(args){
 lastArgs=args;if(!initHash){readHash();initHash=true;}
 canonical(args.data||{nodes:[],edges:[]});ensureCatalogue();
 if(!model.nodes.has(state.work)&&args.selected&&model.nodes.has("c:"+args.selected))state.work="c:"+args.selected;
 if(!model.nodes.has(state.work) && !(state.work.startsWith("b:")&&!model.catalogueBuilt))state.work=model.all.find(n=>n.degree>0)?.id||model.all[0]?.id||"";
 // A selected family always has a canonical root. No artificial edges to a family membership.
 const main=args.root.querySelector("[data-main]");if(!main)return;
 const list=results(),center=model.nodes.get(state.work);
 let network={columns:new Map(),edges:[],hidden:0,allIds:new Set()};
 if(state.mode==="network")network=selectNetwork();
 shownNodes=[...network.allIds].map(id=>model.nodes.get(id)).filter(Boolean);
 shownEdges=network.edges;
 const label=state.mode==="network"?"Documented sources and reception":state.mode==="geography"?"Historical centres":"Corpus coverage";
 const pre='<div class="gnx-header"><div><span class="gnx-kicker">GNAMMA · source-audited knowledge graph</span><h2>Work explorer</h2>'+
  '<p>One searchable catalogue, selective textual genealogies and claim-level evidence. The historical atlas remains a separate full-work timeline.</p></div>'+
  '<div class="gnx-pulse">'+model.stats.canonical+' audited works · '+model.stats.bibliographic.toLocaleString()+' bibliographic records · '+model.edges.length+' links</div></div>';
 const status=model.loading?'<p class="gnx-loading" role="status">Loading the complete source bibliography; the audited historical network is already usable…</p>':
   model.error?'<p class="gnx-caveat" role="status">The additional bibliography could not load: '+esc(model.error)+'. The curated historical records remain available. <button type="button" data-gnx-retry>Retry</button></p>':'';
 const mode=state.mode==="network"?'<section class="gnx-graph"><div class="gnx-profile-top"><h3>'+label+'</h3>'+
   '<span class="gnx-small">Source → dependent work · select a node or edge</span></div>'+
   plotDiagram(network)+sheet(center)+(state.edge?edgeDetail(model.edgeById.get(state.edge)):"")+
   relationLists(center)+'</section>':state.mode==="geography"?geography():coverage();
 main.innerHTML='<div class="gnx-layout">'+pre+status+controls()+'<div class="gnx-content">'+
 '<div class="gnx-main">'+mode+'</div>'+drawResults(list)+'</div>'+
 '<p class="gnx-caveat">Relationships are only those present in the audited source registers. Bibliographic school labels, title resemblance, regional overlap and author death dates never generate influence arrows. Every work is individually searchable even if no links have yet been researched.</p></div>';
 const count=args.root.querySelector("[data-counts]");if(count)count.textContent=shownNodes.length+" visible graph nodes · "+shownEdges.length+" source-linked edges · "+list.length+" matching work records";
}
function exportJSON(){
 const n=model.nodes.get(state.work);if(!n)return;
 const net=selectNetwork();
 const data={schema:"gnamma.work-network/1",created:new Date().toISOString(),scope:"Selected-work subgraph, not entire historical corpus",
  disclaimer:"Recorded bibliographical relations only. Catalogue matches are not reconciled work identities.",
  focus:state.work,nodes:[...net.allIds].map(id=>{const v=model.nodes.get(id);return {id:v.id,title:v.title,arabic:v.arabic,author:v.author,dateLabel:v.dateLabel,dateStatus:v.dateStatus,provenance:v.provenance,originId:v.originId,sourceUrl:v.sourceUrl}}),
  edges:net.edges.map(e=>({id:e.id,from:e.from,to:e.to,type:e.type,label:e.label,confidence:e.confidence,evidence:e.evidence,sources:sourcesFor(e)})),
  inputRevisions:{auditedDataset:"embedded current GNAMMA historical data",bibliography:"Source registers as published on this site"}};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="gnamma-work-network.json";a.click();
 setTimeout(()=>URL.revokeObjectURL(url),2500);
}
function copyLink() {
 writeHash(false);
 const url=location.href;
 if(navigator.clipboard?.writeText)navigator.clipboard.writeText(url).catch(()=>window.prompt("Copy permanent link:",url));
 else window.prompt("Copy permanent link:",url);
}
function updateControl(t){
 const k=t.getAttributeNames().find(name=>name.startsWith("data-gnx-"))?.slice(9)||"";
 if(k==="hops")state.hops=t.value==="2"?2:1;
 else if(k==="search")state.search=t.value.slice(0,140);
 else if(k==="kind")state.kind=t.value;
 else if(k==="scope"){state.scope=t.value;state.school="all";state.family="";}
 else if(k==="provenance")state.provenance=t.value;
 else if(k==="family"){state.family=t.value;state.scope=t.value?"audited":state.scope;
   const f=model.families.find(f=>f.id===t.value);if(f)state.work="c:"+f.root;}
 else if(k==="school")state.school=t.value;
 else if(k==="direction")state.direction=t.value;
 else if(k==="quality")state.quality=t.value;
 state.page=1;state.edge="";
 writeHash();if(lastArgs?.isActive())render(lastArgs);
}
host.addEventListener("change",e=>{
 const t=e.target.closest("[data-gnx-search],[data-gnx-scope],[data-gnx-school],[data-gnx-provenance],[data-gnx-family],[data-gnx-kind],[data-gnx-direction],[data-gnx-hops],[data-gnx-quality]");
 if(!t || !host.contains(t) || !lastArgs?.isActive())return;
 updateControl(t);
});
host.addEventListener("input",e=>{
 if(!e.target.matches("[data-gnx-search]")||!lastArgs?.isActive())return;
 const v=e.target.value;clearTimeout(searchTimer);
 searchTimer=setTimeout(()=>{
  if(!lastArgs?.isActive()||!e.target.isConnected)return;
  const position=e.target.selectionStart;state.search=v.slice(0,140);state.page=1;writeHash();render(lastArgs);
  const next=host.querySelector("[data-gnx-search]");if(next){next.focus();try{next.setSelectionRange(position,position)}catch{}}
 },190);
});
host.addEventListener("click",e=>{
 if(!lastArgs?.isActive())return;
 const t=e.target.closest("[data-gnx-focus],[data-gnx-edge],[data-gnx-page],[data-gnx-mode],[data-gnx-place],[data-gnx-copy],[data-gnx-export],[data-gnx-clear],[data-gnx-close-edge],[data-gnx-retry]");
 if(!t)return;e.preventDefault();
 if(t.hasAttribute("data-gnx-focus")){state.work=t.getAttribute("data-gnx-focus");state.edge="";state.mode="network";writeHash(true);}
 else if(t.hasAttribute("data-gnx-edge")){state.edge=t.getAttribute("data-gnx-edge");writeHash();}
 else if(t.hasAttribute("data-gnx-page")){state.page+=Number(t.getAttribute("data-gnx-page"))||0;writeHash();}
 else if(t.hasAttribute("data-gnx-mode")){state.mode=t.getAttribute("data-gnx-mode");state.edge="";writeHash();}
 else if(t.hasAttribute("data-gnx-place")){state.place=t.getAttribute("data-gnx-place");state.scope=state.place?"audited":state.scope;state.page=1;writeHash();}
 else if(t.hasAttribute("data-gnx-copy")){copyLink();return;}
 else if(t.hasAttribute("data-gnx-export")){exportJSON();return;}
 else if(t.hasAttribute("data-gnx-close-edge")){state.edge="";writeHash();}
 else if(t.hasAttribute("data-gnx-clear")){state.scope="all";state.school="all";state.provenance="all";state.family="";state.search="";state.kind="all";state.direction="both";state.quality="all";state.hops=1;state.page=1;state.place="";state.edge="";state.mode="network";writeHash();}
 else if(t.hasAttribute("data-gnx-retry")){model.error="";ensureCatalogue();return;}
 render(lastArgs);
});
host.addEventListener("keydown",e=>{
 const el=e.target.closest("[data-gnx-focus],[data-gnx-edge],[data-gnx-place]");
 if(el&&["Enter"," "].includes(e.key)&&lastArgs?.isActive()){e.preventDefault();el.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true}));}
});
window.addEventListener("popstate",()=>{
 if(!lastArgs?.isActive())return;readHash();render(lastArgs);
});
window.GNWorkExplorer={render,readHash,focus:(id)=>{state.work=String(id).startsWith("c:")||String(id).startsWith("b:")?String(id):"c:"+id;state.edge="";state.mode="network";state.search="";state.scope="all";state.family="";writeHash();},debug:()=>({ready:model.catalogueBuilt,loading:model.loading,error:model.error,
  canonical:model.stats.canonical,bibliographic:model.stats.bibliographic,auditedEdges:model.stats.auditedEdges,
  sourceEdges:model.stats.sourceEdges,totalNodes:model.all.length,totalEdges:model.edges.length,selected:state.work,
  mode:state.mode,scope:state.scope,matched:lastResults,graphNodes:shownNodes.length,graphEdges:shownEdges.length})};
})();
