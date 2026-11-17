/* Source-linked discovery, separate from critically verified reader texts. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),N=String;
const state={science:"fiqh",school:"all",lineage:"all",provenance:"all",sort:"earliest",q:"",page:1};
const schoolNames={hanafi:"Ḥanafī",maliki:"Mālikī",shafii:"Shāfiʿī",hanbali:"Ḥanbalī",comparative:"Comparative"};
let books=[],errors=[];
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;}
const norm=x=>String(x||"").normalize("NFKD").replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g,"").replace(/[أإآ]/g,"ا").toLowerCase();
function loadHash(){
 const p=new URLSearchParams(location.hash.slice(1));
 for(const k of ["science","school","lineage","provenance","sort","q"])if(p.has(k))state[k]=p.get(k);
 if(!["fiqh","usul","nahw","sarf","balagha","lugha","all"].includes(state.science))state.science="fiqh";
 if(!["all","hanafi","maliki","shafii","hanbali","unassigned"].includes(state.school))state.school="all";
 if(!["all","gnamma","openiti","manuscript"].includes(state.provenance))state.provenance="all";
 if(!["earliest","alpha","manuscripts"].includes(state.sort))state.sort="earliest";
 state.page=Math.max(1,Math.min(999,parseInt(p.get("page"),10)||1));
 for(const k of ["science","school","provenance","sort","q"])$(k).value=state[k];
}
function saveHash(){
 const p=new URLSearchParams();
 for(const k of ["science","school","lineage","provenance","sort","q"]){
  const v=state[k];if(v&&(k==="science"||!["all","earliest"].includes(v)))p.set(k,v);
 }
 if(state.page>1)p.set("page",String(state.page));
 const h="#"+p.toString();
 if(location.hash!==h){try{history.replaceState(null,"",h)}catch{location.hash=h}}
}
function sourceUrl(b){
 if(b.type==="gnamma"&&/^index\.html#book=/.test(b.url))return b.url;
 try{const u=new URL(b.url);if(u.protocol!=="https:")return "";
 if(b.type==="openiti"&&(u.hostname!=="github.com"||!u.pathname.startsWith("/OpenITI/RELEASE/")))return "";
 if(b.type==="manuscript"&&u.hostname!=="app.alreq.com")return "";
 return u.href;}catch{return ""}
}
function setLineages(){
 const list=$("lineage"),current=state.lineage,found=new Set();
 for(const b of books)if(state.science==="all"||b.genres.includes(state.science))for(const s of b.lineages)found.add(s);
 list.replaceChildren(new Option("All lines and unassigned","all"));
 for(const s of [...found].sort())list.add(new Option(s.replace(/^grammar:/,"Grammar: ").replace(/^balagha:/,"Balāgha: ").replace(/_/g," "),s));
 state.lineage=found.has(current)?current:"all";list.value=state.lineage;
 $("school-wrap").hidden=!["fiqh","usul","all"].includes(state.science);
 $("lineage-wrap").hidden=!["nahw","sarf","balagha"].includes(state.science);
}
function matches(b){
 if(state.science!=="all"&&!b.genres.includes(state.science))return false;
 if(["fiqh","usul","all"].includes(state.science)&&state.school!=="all"){
   if(state.school==="unassigned"){if(b.school&&b.school!=="comparative")return false;}
   else if(b.school!==state.school)return false;
 }
 if(state.provenance!=="all"&&b.type!==state.provenance)return false;
 if(state.lineage!=="all"&&["nahw","sarf","balagha"].includes(state.science)&&!b.lineages.includes(state.lineage))return false;
 return !state.q||norm([b.title,b.roman,b.author,b.uri,b.school,...b.genres].join(" ")).includes(norm(state.q));
}
function makeCard(b){
 const card=el("article","work"),h=el("h3","ar",b.title);h.lang="ar";h.dir="rtl";card.append(h);
 const tags=el("div","meta");
 tags.append(el("span","pill"+(b.type==="gnamma"?" available":""),{gnamma:"GNAMMA reader",openiti:"OpenITI metadata",manuscript:"Manuscript catalogue"}[b.type]));
 if(b.school)tags.append(el("span","pill",schoolNames[b.school]||b.school));
 card.append(tags,el("p","author",b.author||"Author unrecorded"));
 if(b.death)card.append(el("p","small","Author d. "+b.death+" AH · not the work's composition date"));
 if(b.roman&&norm(b.roman)!==norm(b.title))card.append(el("p","roman",b.roman));
 card.append(el("p","small",b.description));
 if(b.caution)card.append(el("p","warning",b.caution));
 if(b.schoolEvidence&&b.type!=="gnamma")card.append(el("p","small","School label evidence: "+b.schoolEvidence));
 if(b.lineages.length)card.append(el("p","small","Provisional research routes: "+b.lineages.join(" · ").replace(/_/g," ")));
 const url=sourceUrl(b);
 if(url){
   const a=el("a","source-link",b.type==="gnamma"?"Open in GNAMMA reader":b.type==="openiti"?"Open indexed digital version":"Original manuscript catalogue");
   a.href=url;if(b.type!=="gnamma"){a.target="_blank";a.rel="noopener noreferrer";}card.append(a);
 }
 return card;
}
function render(){
 const subset=books.filter(matches);
 subset.sort((a,b)=>state.sort==="alpha"?a.title.localeCompare(b.title,"ar"):
 state.sort==="manuscripts"?(b.manuscripts-a.manuscripts)||a.title.localeCompare(b.title,"ar"):
 (a.death||99999)-(b.death||99999)||a.title.localeCompare(b.title,"ar"));
 const pages=Math.max(1,Math.ceil(subset.length/40));state.page=Math.min(state.page,pages);
 const fragment=document.createDocumentFragment();
 for(const b of subset.slice((state.page-1)*40,state.page*40))fragment.append(makeCard(b));
 $("books").replaceChildren(fragment);$("empty").hidden=!!subset.length;
 $("pagination").hidden=subset.length<=40;$("pages").textContent="Page "+state.page+" of "+pages;
 $("previous").disabled=state.page===1;$("next").disabled=state.page===pages;
 const count={gnamma:0,openiti:0,manuscript:0};for(const b of subset)count[b.type]++;
 $("stats").textContent=subset.length.toLocaleString()+" matching records · "+count.gnamma+
 " GNAMMA reader entries · "+count.openiti+" OpenITI candidate works · "+
 count.manuscript+" manuscript-only catalogue records"+
 (errors.length?" · Partial load problem: "+errors.join("; "):"");
 saveHash();
}
function change(k,v){state[k]=v;state.page=1;if(k==="science")setLineages();render();}
async function initialize(){
 const src=["registry.json","expanded-bibliography.json","manuscript-shortlist.json"];
 const [existing,oi,ms]=await Promise.all(src.map(path=>fetch(path).then(r=>r.ok?r.json():Promise.reject(Error(path+" HTTP "+r.status))).catch(e=>{errors.push(String(e));return null;})));
 const pinned=(existing?.books||[]).map(b=>({type:"gnamma",uri:b.openiti?.book_uri||"",title:b.title_ar||b.title,roman:b.title,author:b.author,death:Number(b.death_ah)||0,
 genres:b.disciplines||[],school:b.madhhab||"",schoolEvidence:"",lineages:[],url:"index.html#book="+encodeURIComponent(b.id),
 description:b.local_text?"GNAMMA-hosted text, byte-matched to original.":"Identified version in GNAMMA's source reader.",
 caution:b.openiti?.quality_note||"",manuscripts:0}));
 const known=new Set(pinned.map(x=>x.uri));
 const indexed=(oi?.works||[]).filter(w=>!known.has(w.book_uri)).map(w=>({type:"openiti",uri:w.book_uri,title:w.title_ar||w.title_lat,roman:w.title_lat,
 author:w.author_ar||w.author_lat,death:Number(w.death_ah)||0,genres:w.genres||[],school:w.school||"",schoolEvidence:w.school_evidence||"",
 lineages:w.lineages||[],url:w.source_url,
 description:"Primary-version metadata; Arabic content has not been independently verified by GNAMMA.",
 caution:w.ocr_warning?"Uncorrected OCR flagged by source metadata.":"",manuscripts:0}));
 const manuscripts=(ms?.works||[]).map(w=>({type:"manuscript",uri:w.id,title:w.title_ar,roman:"",author:w.author_ar,death:0,
 genres:w.genres||[],school:w.school||"",schoolEvidence:w.school_evidence||"",lineages:w.lineages||[],url:w.catalogue_url,
 description:"Original public catalogue reports "+w.reported_manuscripts+" manuscript entry/entries, not independently checked.",
 caution:"Bibliographic record only; no full text or scan acquired.",manuscripts:Number(w.reported_manuscripts)||0}));
 books=[...pinned,...indexed,...manuscripts];
 if(!books.length){$("stats").textContent="Could not load the bibliographic registers.";return;}
 setLineages();render();
}
for(const id of ["science","school","lineage","provenance","sort"])$(id).addEventListener("change",e=>change(id,e.target.value));
$("q").addEventListener("input",e=>change("q",e.target.value));
$("clear").addEventListener("click",()=>{
 Object.assign(state,{science:"fiqh",school:"all",lineage:"all",provenance:"all",sort:"earliest",q:"",page:1});
 for(const k of ["science","school","provenance","sort","q"])$(k).value=state[k];
 setLineages();render();
});
$("previous").addEventListener("click",()=>{if(state.page>1){state.page--;render();$("results").scrollIntoView({block:"start"});}});
$("next").addEventListener("click",()=>{state.page++;render();$("results").scrollIntoView({block:"start"});});
window.addEventListener("popstate",()=>{loadHash();setLineages();render();});
window.addEventListener("hashchange",()=>{loadHash();setLineages();render();});
loadHash();initialize();
})();
