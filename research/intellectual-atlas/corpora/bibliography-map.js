/* GNAMMA source-backed bibliographic map, independent of the philosophical canonical graph.
   Cells express category membership and dates of AUTHORS, never textual dependencies. */
(()=>{
"use strict";
const root=document.getElementById("kalam-timeline-app-v3");if(!root)return;
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm=x=>String(x??"").normalize("NFKD").replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g,"").replace(/[أإآ]/g,"ا").toLowerCase();
const levels=[["all","All citations"],["alreq","Manuscript bibliography"],["openiti","OpenITI versions"],["reader","Previously pinned GNAMMA"]];
const schools=[["all","All madhhabs"],["hanafi","Ḥanafī"],["maliki","Mālikī"],["shafii","Shāfiʿī"],["hanbali","Ḥanbalī"]];
const periods=[["0","Before 300 AH",0,300],["300","300–499 AH",300,500],["500","500–699 AH",500,700],["700","700–899 AH",700,900],["900","900–1099 AH",900,1100],["1100","1100–1299 AH",1100,1300],["1300","1300–1499 AH",1300,1500],["1500","1500+ AH",1500,10000],["undated","Unplaced",null,null]];
const groups={
  fiqh:["hanafi","maliki","shafii","hanbali","other"],
  grammar:["grammar:basran","grammar:kufan","grammar:baghdadi","grammar:andalusi_maghribi","grammar:egyptian_syrian","grammar:later_commentarial","grammar:alfiyya","grammar:ajurrumiyya","grammar:sibawayh","grammar:mufassal","grammar:kafiya_shafiya","grammar:egyptian_syntax","grammar:early_disagreements","lineage_unmapped"],
  balagha:["balagha:adab_badi","balagha:nazm_ijaz","balagha:miftah_talkhis","balagha:andalusi_maghribi","balagha:later_didactic","balagha:badi_adab","balagha:maghribi_literary","lineage_unmapped"]
};
const labels={hanafi:"Ḥanafī",maliki:"Mālikī",shafii:"Shāfiʿī",hanbali:"Ḥanbalī",other:"Unassigned / comparative","lineage_unmapped":"Not assigned to a researched line"};
const label=x=>labels[x]||x.replace(/^grammar:/,"Grammar: ").replace(/^balagha:/,"Balāgha: ").replace(/_/g," ");
const PAGE=32;
let records=[],sourceReader=null,ready=false,promise=null,error="",last=null,activeGenre="",activeSchool="",initialExternal=true,state={tier:"all",line:"all",band:"all",period:"all",page:1,selected:""};
function safe(url,provider){
 try{const u=new URL(url);if(u.protocol!=="https:")return "";
 if(provider==="alreq"&&u.hostname==="app.alreq.com"&&u.pathname.startsWith("/ar/"))return u.href;
 if(provider==="openiti"&&u.hostname==="github.com"&&u.pathname.startsWith("/OpenITI/RELEASE/"))return u.href;
 }catch{}return "";
}
function genre(args){return args.science==="fiqh"?(args.tab==="method"?"usul":"fiqh"):args.science==="arabic"?args.tab:args.science;}
function period(death){if(!death)return "undated";const p=periods.find(p=>p[2]!==null&&death>=p[2]&&death<p[3]);return p?p[0]:"undated";}
function lineages(w,g){
 if(g==="fiqh"||g==="usul")return w.schools.filter(s=>schools.some(t=>t[0]===s&&s!=="all")).length?w.schools.filter(s=>schools.some(t=>t[0]===s&&s!=="all")):["other"];
 const prefix=g==="balagha"?"balagha:":"grammar:";
 const x=w.lines.filter(s=>s.startsWith(prefix));
 return x.length?[...new Set(x)]:["lineage_unmapped"];
}
function getRows(g){return g==="fiqh"||g==="usul"?groups.fiqh:g==="balagha"?groups.balagha:groups.grammar;}
function mapWork(w,id,sourceType,pinned=false){
 return {id,title:w.title||"",roman:w.roman||"",author:w.author||"",death:w.death||null,genres:w.genres||[],schools:w.schools||[],schoolEvidence:w.schoolEvidence||"",lines:w.lines||[],sourceType,pinned,url:w.url||"",authorKey:w.authorKey||"",readerId:w.readerId||"",sourceDetail:w.sourceDetail||"",sourceNote:w.sourceNote||"",warnings:w.warnings||"",manuscripts:w.manuscripts||0,search:norm([w.title,w.roman,w.author,id].join(" "))};
}
function build(reader,openiti,alreq){
 const pinned=new Map((reader.books||[]).map(b=>[b.openiti?.book_uri,b]).filter(x=>x[0]));
 const seen=new Set(),out=[];
 for(const w of openiti.works||[]){
  const link=safe(w.source_url,"openiti");if(!link)continue;
  const b=pinned.get(w.book_uri);seen.add(w.book_uri);
  out.push(mapWork({title:w.title_ar||w.title_lat,roman:w.title_lat,author:w.author_ar||w.author_lat,death:Number(w.death_ah),genres:[...new Set([...(w.genres||[]),...(b?.disciplines||[])])],schools:w.school?[w.school]:(b?.madhhab&&b.madhhab!=="comparative"?[b.madhhab]:[]),schoolEvidence:w.school_evidence,lines:w.lineages,authorKey:w.book_uri.split(".")[0],readerId:b?.id||"",url:link,sourceDetail:w.version_uri,sourceNote:"OpenITI primary-version metadata; not independently collated by GNAMMA.",warnings:w.ocr_warning?"Possible uncorrected OCR.":""},"oi:"+w.book_uri,"openiti",!!b));
 }
 for(const b of reader.books||[]){
  if(seen.has(b.openiti?.book_uri))continue;
  const link=safe(b.openiti?.source_page,"openiti");if(!link)continue;
  out.push(mapWork({title:b.title_ar||b.title,roman:b.title,author:b.author,death:Number(b.death_ah),genres:b.disciplines,schools:b.madhhab&&b.madhhab!=="comparative"?[b.madhhab]:[],schoolEvidence:"Pinned GNAMMA classification",authorKey:b.openiti?.book_uri?.split(".")[0]||"",readerId:b.id,url:link,sourceDetail:b.openiti?.version_uri,sourceNote:"Previously pinned GNAMMA source-reader work.",warnings:b.openiti?.quality_note},"read:"+b.id,"reader",true));
 }
 for(const w of alreq.works||[]){
  const link=safe(w.catalogue_url,"alreq");if(!link)continue;
  out.push(mapWork({title:w.title_ar,author:w.author_ar,genres:w.genres,schools:w.madhhabs,schoolEvidence:(w.school_evidence||[]).map(x=>x.basis+" ("+x.school+")").join("; "),lines:w.lineages,url:link,sourceDetail:w.categories?.join(", "),sourceNote:"Original Alreq manuscript bibliography; no full text, manuscript scan or independently established date.",manuscripts:Number(w.reported_manuscripts)||0},"alreq:"+w.id,"alreq"));
 }
 return out;
}
function load(){
 if(ready||promise)return;
 promise=Promise.all(["registry.json","expanded-bibliography.json","manuscript-full.json"].map(p=>fetch("corpora/"+p).then(r=>{if(!r.ok)throw Error(p+" HTTP "+r.status);return r.json();})))
 .then(([reader,oi,ms])=>{if(!reader.books||!oi.works||!ms.works)throw Error("Invalid catalogue structure");sourceReader=reader;records=build(reader,oi,ms);ready=true;error="";})
 .catch(e=>{error=String(e?.message||e);})
 .finally(()=>{promise=null;if(last&&last.isActive())render(last);});
}
function readHash(){
 const p=new URLSearchParams(location.hash.slice(1));
 state.tier=levels.some(x=>x[0]===p.get("bib_tier"))?p.get("bib_tier"):"all";
 state.line=p.get("bib_line")||"all";state.band=p.get("bib_band")||"all";
 state.period=periods.some(x=>x[0]===p.get("bib_period"))?p.get("bib_period"):"all";
 state.page=Math.max(1,Math.min(1000,Number(p.get("bib_page"))||1));
 state.selected=p.get("bib_work")||"";
}
function writeHash(){
 const p=new URLSearchParams(location.hash.slice(1));
 for(const [k,v] of [["bib_tier",state.tier],["bib_line",state.line],["bib_band",state.band],["bib_period",state.period],["bib_page",state.page>1?String(state.page):"all"],["bib_work",state.selected||"all"]]){
  if(!v||v==="all")p.delete(k);else p.set(k,v);
 }
 const h="#"+p.toString();if(location.hash!==h)try{history.replaceState(null,"",h)}catch{location.hash=h}
}
function option(k,v,active){return '<option value="'+esc(k)+'"'+(active===k?' selected':'')+'>'+esc(v)+'</option>';}
function cite(b){
 if(!b.url)return "";
 return '<a href="'+esc(b.url)+'" target="_blank" rel="noopener noreferrer">'+(b.sourceType==="alreq"?"Manuscript catalogue record":"OpenITI metadata/source record")+'</a>';
}
function detail(b){
 if(!b)return "";
 return '<section class="gnbib-detail"><div class="gnbib-detail-head"><strong>Cited bibliographic work</strong><button type="button" data-gnbib-close aria-label="Close citation detail">×</button></div>'+
  '<h3 dir="rtl" lang="ar">'+esc(b.title)+'</h3>'+
  '<p>'+esc(b.author)+'</p>'+
  '<dl><dt>Date</dt><dd>'+esc(b.death?"Author d. "+b.death+" AH; not composition date":"Undated catalogue record")+'</dd>'+
  '<dt>Fields</dt><dd>'+esc(b.genres.join(", "))+'</dd>'+
  '<dt>School</dt><dd>'+esc(b.schools.map(label).join(", ")||"Unassigned")+'</dd>'+
  '<dt>School attribution</dt><dd>'+esc(b.schoolEvidence||"No school evidence available")+'</dd>'+
  '<dt>Provisional lineages</dt><dd>'+esc(b.lines.map(label).join("; ")||"Not assigned")+'</dd>'+
  '<dt>Source</dt><dd>'+esc(b.sourceDetail||b.sourceType)+'</dd></dl>'+
  '<p>'+esc(b.sourceNote)+'</p>'+(b.warnings?'<p>'+esc(b.warnings)+'</p>':'')+
  (b.manuscripts?'<p>Original catalogue reports '+b.manuscripts+' manuscript entries; not independently collated.</p>':'')+
  '<p><strong>Bibliographic citation:</strong> '+cite(b)+'</p>'+
  '<p class="gnbib-muted">No commentary, influence, school doctrine or textual equivalence is inferred from this placement.</p></section>';
}
function chart(items,g){
 const rows=getRows(g),counts=new Map(),total=new Map();
 for(const b of items){
  for(const row of lineages(b,g)){
   if(!rows.includes(row))continue;
   const key=row+"|"+period(b.death);
   counts.set(key,(counts.get(key)||0)+1);
   total.set(row,(total.get(row)||0)+1);
  }
 }
 const max=Math.max(1,...counts.values());
 let html='<div class="gnbib-head">School / textual line</div>'+periods.map(p=>'<div class="gnbib-head">'+esc(p[1])+'</div>').join('');
 for(const row of rows){
  if(!total.has(row))continue;
  html+='<div class="gnbib-rowlabel">'+esc(label(row))+'<small>'+total.get(row)+' memberships</small></div>';
  for(const p of periods){
   const key=row+"|"+p[0],n=counts.get(key)||0;
   if(!n){html+='<span class="gnbib-cell gnbib-blank">·</span>';continue}
   const sz=Math.round(15+34*Math.sqrt(n/max));
   const on=state.band===row&&state.period===p[0];
   const tooltip=esc(label(row)+" · "+p[1]+" · "+n+" bibliographic records");
   html+='<button type="button" data-gnbib-cluster="'+esc(key)+'" class="gnbib-cell'+(on?' gnbib-current':'')+
      '" aria-label="'+tooltip+'" aria-pressed="'+on+'" title="'+tooltip+'">'+
      '<span class="gnbib-circle" style="height:'+sz+'px;width:'+sz+'px">'+n+'</span></button>';
  }
 }
 return '<section class="gnbib-map" aria-label="Interactive bibliography map"><p class="gnbib-muted">Each circle groups the listed source records. Dates mean author death, not composition. Unplaced records remain undated. Lines and source genres can overlap.</p>'+
   '<div class="gnbib-overflow" role="region" tabindex="0" aria-label="Scrollable works-by-school and historical-period map"><div class="gnbib-grid">'+html+'</div></div></section>';
}
function cards(list){
 return list.map(b=>'<article class="gnbib-card"><button type="button" data-gnbib-book="'+esc(b.id)+'" class="gnbib-book" aria-label="Inspect '+esc(b.title)+'">'+
 '<span dir="rtl" lang="ar">'+esc(b.title)+'</span><small>'+esc(b.author)+'</small></button>'+
 '<div class="gnbib-cardmeta">'+(b.death?'Author d. '+b.death+' AH':'Undated')+' · '+
 esc(b.sourceType==="alreq"?"Manuscript catalogue":b.pinned?"Pinned OpenITI":"OpenITI metadata")+
 (b.schools.length?' · '+esc(b.schools.map(label).join(", ")):'')+'</div>'+
 '<div class="gnbib-citation">'+cite(b)+'</div></article>').join('');
}
function render(args){
 last=args;const main=args.root.querySelector("[data-main]");if(!main)return;
 const g=genre(args);
 if(!ready){
   main.innerHTML='<div class="ia-main-head"><h2>'+esc(args.title)+' · Bibliography map</h2></div>'+
     '<div class="ia-empty">'+(error?'<p>Could not load work metadata: '+esc(error)+'</p><button type="button" data-gnbib-retry>Retry</button>':
     '<p>Loading source-linked work and manuscript bibliographies…</p>')+'</div>';
   args.onCounts(0,0);if(!promise&&!error)load();return;
 }
 if(window.GNDisciplineAtlas){return window.GNDisciplineAtlas.render(args,{records,reader:sourceReader});}
 if(initialExternal){
   initialExternal=false;activeGenre=g;activeSchool=args.school;
 }else if(activeGenre!==g||activeSchool!==args.school){
   // Switching legal school or discipline must not retain an incompatible
   // old bubble/period and falsely show an empty new bibliography.
   activeGenre=g;activeSchool=args.school;
   state.line="all";state.band="all";state.period="all";state.page=1;state.selected="";
 }
 const accepted=records.filter(b=>b.genres.includes(g)&&
   (args.school==="all"||!(g==="fiqh"||g==="usul")||b.schools.includes(args.school))&&
   (state.tier==="all"||state.tier==="reader"&&b.pinned||state.tier===b.sourceType)&&
   (!args.search||b.search.includes(norm(args.search))));
 const routes=new Set(accepted.flatMap(b=>b.lines));
 if(state.line!=="all"&&!routes.has(state.line))state.line="all";
 const overall=accepted.filter(b=>state.line==="all"||b.lines.includes(state.line));
 const listed=overall.filter(b=>(state.band==="all"||lineages(b,g).includes(state.band))&&
  (state.period==="all"||period(b.death)===state.period));
 listed.sort((a,b)=>(a.death||99999)-(b.death||99999)||a.title.localeCompare(b.title,"ar"));
 const pages=Math.max(1,Math.ceil(listed.length/PAGE));state.page=Math.min(state.page,pages);
 const typeCounts={alreq:0,openiti:0,pinned:0};
 overall.forEach(b=>{typeCounts[b.sourceType]=(typeCounts[b.sourceType]||0)+1;if(b.pinned)typeCounts.pinned++});
 const head='<div class="ia-main-head"><div><h2>'+esc(args.title)+' · Bibliographic map</h2><span class="ia-small">'+
 overall.length.toLocaleString()+' cited source records · '+typeCounts.alreq+' manuscript entries · '+
 typeCounts.openiti+' OpenITI versions · '+typeCounts.pinned+' pinned GNAMMA versions</span></div>'+
 '<div class="ia-actions"><button type="button" data-action="open-explore">Other sciences</button><button type="button" data-action="show-all-mapped">Historical atlas</button></div></div>';
 const subtabs='<div class="gnbib-tabs" role="group" aria-label="Choose subject within the science">'+
   (args.tabs||[]).map(([key,desc])=>'<button type="button" data-source-tab="'+esc(key)+
   '" aria-pressed="'+(args.tab===key)+'">'+esc(desc)+'</button>').join('')+'</div>';
 const buttons=(g==="fiqh"||g==="usul")?'<div class="gnbib-schools" role="group" aria-label="Legal school">'+
 schools.map(([k,v])=>'<button type="button" data-source-madhhab="'+k+'" aria-pressed="'+(args.school===k)+'">'+v+'</button>').join('')+'</div>':'';
 const controls='<div class="gnbib-controls"><label>Citation evidence<select data-gnbib-tier>'+
   levels.map(([a,b])=>option(a,b,state.tier)).join('')+'</select></label>'+
   (!(g==="fiqh"||g==="usul")?'<label>Research line<select data-gnbib-line>'+
     option("all","All / unassigned",state.line)+[...routes].sort().map(x=>option(x,label(x),state.line)).join('')+'</select></label>':'')+
   '<button type="button" data-gnbib-clear>Clear map focus</button></div>';
 const warning=g==="usul"?"Uṣūl school associations from author metadata remain provisional.":
  g==="fiqh"&&args.tab==="issues"?"This is a bibliography, not an extracted graph of legal questions and rulings.":
  ["nahw","sarf","balagha"].includes(g)?"Grammar/rhetoric groupings are overlapping research hints; a circle is not a commentary or transmission arrow.":"";
 const focus=(state.band!=="all"||state.period!=="all")?'<p class="gnbib-focus">Selected: '+esc(state.band==="all"?"All lines":label(state.band))+
   ' · '+esc(state.period==="all"?"All periods":periods.find(x=>x[0]===state.period)?.[1]||state.period)+
   ' <button type="button" data-gnbib-clear>Show all</button></p>':"";
 const selected=records.find(x=>x.id===state.selected);
 const pager='<div class="gnbib-pages"><button type="button" data-gnbib-page="-1"'+(state.page<=1?' disabled':'')+'>Previous</button>'+
   '<span>Page '+state.page+' of '+pages+'</span><button type="button" data-gnbib-page="1"'+(state.page>=pages?' disabled':'')+'>Next</button></div>';
 main.innerHTML=head+subtabs+buttons+controls+(warning?'<p class="gnbib-note">'+esc(warning)+'</p>':'')+
  focus+chart(overall,g)+detail(selected)+
  '<section class="gnbib-results"><h3>'+listed.length.toLocaleString()+' cited records in this map selection</h3>'+
  '<p class="gnbib-muted">The two catalogues can describe overlapping historical works; cross-catalogue identities are not assumed. Open any title for its individual citation.</p>'+
  '<div class="gnbib-cards">'+cards(listed.slice((state.page-1)*PAGE,state.page*PAGE))+'</div>'+pager+'</section>'+
  '<p class="gnbib-muted">Bibliographic provenance: <a target="_blank" rel="noopener noreferrer" href="https://kitab-project.org/explore/">OpenITI/KITAB</a> and <a target="_blank" rel="noopener noreferrer" href="https://app.alreq.com/ar/Categories">Alreq manuscript catalogue</a>. No inferred influence or legal-opinion links.</p>';
 args.onCounts(overall.length,0);writeHash();
}
root.addEventListener("change",ev=>{
 const x=ev.target.closest("[data-gnbib-tier],[data-gnbib-line]");if(!x)return;
 if(x.hasAttribute("data-gnbib-tier"))state.tier=x.value;else state.line=x.value;
 state.band="all";state.period="all";state.page=1;state.selected="";
 if(last)render(last);
});
root.addEventListener("click",ev=>{
 const x=ev.target.closest("[data-gnbib-cluster],[data-gnbib-book],[data-gnbib-clear],[data-gnbib-page],[data-gnbib-close],[data-gnbib-retry]");
 if(!x)return;ev.preventDefault();
 if(x.hasAttribute("data-gnbib-cluster")){
   const v=x.getAttribute("data-gnbib-cluster"),i=v.lastIndexOf("|"),a=v.slice(0,i),b=v.slice(i+1);
   if(state.band===a&&state.period===b){state.band="all";state.period="all"}
   else{state.band=a;state.period=b}
   state.page=1;state.selected="";
 }else if(x.hasAttribute("data-gnbib-book"))state.selected=x.getAttribute("data-gnbib-book");
 else if(x.hasAttribute("data-gnbib-page"))state.page+=Number(x.getAttribute("data-gnbib-page"))||0;
 else if(x.hasAttribute("data-gnbib-close"))state.selected="";
 else if(x.hasAttribute("data-gnbib-clear")){state.band="all";state.period="all";state.page=1;state.selected="";}
 else if(x.hasAttribute("data-gnbib-retry")){error="";load();return;}
 if(last)render(last);
 if(x.hasAttribute("data-gnbib-book"))root.querySelector(".gnbib-detail")?.scrollIntoView({block:"nearest"});
});
readHash();
window.GNAtlasBibliography={render,readHash,debug:()=>({ready,count:records.length,activeGenre,selected:state.selected,band:state.band,period:state.period,tier:state.tier})};
})();
