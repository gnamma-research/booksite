/* GNAMMA Farghani XIX: static page-aligned Arabic–English working reader.
 * All Arabic and English page text is authored into the HTML by the source audit
 * build; this JS never generates, translates or silently rewrites source text. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const pages=[...document.querySelectorAll(".pr-page")];
if(pages.length!==128){console.error("Farghani parallel: expected 128 pages",pages.length);return;}
const buttons=[...document.querySelectorAll("[data-lang]")];
const K="gnamma-farghani-introduction-parallel-v1";
const read=()=>{try{return JSON.parse(localStorage.getItem(K)||"{}")||{}}catch(_){return {}}};
const saved=read();
let lang=["both","ar","en"].includes(saved.lang)?saved.lang:"both";
let theme=["parchment","horizon","night"].includes(saved.theme)?saved.theme:"parchment";
let size=Number.isFinite(saved.size)?Math.min(1.5,Math.max(.8,saved.size)):1;
let showNotes=saved.showNotes===true;
const persist=()=>{try{localStorage.setItem(K,JSON.stringify({lang,theme,size,showNotes}))}catch(_){}};
function apply(){
  document.body.dataset.language=lang;
  document.documentElement.dataset.theme=theme;
  document.documentElement.style.setProperty("--pr-size",String(size));
  document.body.classList.toggle("pr-show-notes",showNotes);
  buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.lang===lang)));
  $("pr-notes-toggle").setAttribute("aria-pressed",String(showNotes));
  $("pr-notes-toggle").textContent=showNotes?"Hide source notes":"Show source notes";
  $("pr-size-minus").disabled=size<=.8;
  $("pr-size-plus").disabled=size>=1.5;
  persist();
}
for(const b of buttons)b.addEventListener("click",()=>{lang=b.dataset.lang;apply()});
$("pr-notes-toggle").addEventListener("click",()=>{
  showNotes=!showNotes;document.querySelectorAll(".pr-apparatus").forEach(n=>n.open=false);apply();
});
$("pr-size-minus").addEventListener("click",()=>{size=Math.max(.8,Math.round((size-.05)*100)/100);apply()});
$("pr-size-plus").addEventListener("click",()=>{size=Math.min(1.5,Math.round((size+.05)*100)/100);apply()});
$("pr-theme").addEventListener("click",()=>{const choices=["parchment","horizon","night"];theme=choices[(choices.indexOf(theme)+1)%choices.length];apply()});
$("pr-print").addEventListener("click",()=>window.print());
const dialog=$("pr-dialog"),body=$("pr-dialog-content");
$("pr-close").addEventListener("click",()=>dialog.close());
function node(tag,cls,txt){
 const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;
}
function open(title){$("pr-dialog-title").textContent=title;body.replaceChildren();if(!dialog.open)dialog.showModal()}
function go(page){
 dialog.close();const n=document.getElementById("p"+page);if(!n)return;
 location.hash="p"+page;n.scrollIntoView({behavior:"instant",block:"start"});
}
function addResult(results,p,excerpt,language){
 const b=node("button");
 b.type="button";
 b.append(node("strong",null,"Beirut p. "+p));
 const small=node("small",language==="ar"?"Arabic digital source":"English working translation");
 b.append(small);
 if(excerpt){const s=node("div",language==="ar"?"pr-ar-snippet":null,excerpt);if(language==="ar"){s.lang="ar";s.dir="rtl"}b.append(s)}
 b.addEventListener("click",()=>go(p));results.append(b);
}
const index=pages.map(x=>({
 page:Number(x.dataset.page),
 ar:x.querySelector(".pr-ar")?.textContent||"",
 en:x.querySelector(".pr-en")?.textContent||"",
 title:x.querySelector(".pr-page-title")?.textContent||""
}));
const normalize=s=>s.normalize("NFKD").replace(/[\u0300-\u036f\u064b-\u065f]/g,"").toLocaleLowerCase();
function excerpt(text,loc,len){
 return (loc>56?"…":"")+text.slice(Math.max(0,loc-56),Math.min(text.length,loc+len+110)).replace(/\s+/g," ")+(loc+len+110<text.length?"…":"");
}
function searchView(){
 open("Search all Arabic and English introductory pages");
 const input=node("input");input.type="search";input.placeholder="Search a word or phrase in Arabic or English…";input.setAttribute("aria-label","Search full Arabic and English introduction");
 const hint=node("p",null,"Searches all 128 digitized Arabic and working English printed-page units; results link to pages, not exact sentence pairs.");
 hint.style.cssText="font:12px/1.6 system-ui;color:var(--muted)";
 const results=node("div","pr-matches");body.append(input,hint,results);
 let active=0;
 const run=()=>{
  const q=normalize(input.value.trim());results.replaceChildren();
  if(q.length<2){hint.textContent="Enter at least two characters to search.";return;}
  let found=0;
  for(const row of index){
    const a=normalize(row.ar),e=normalize(row.en);
    const ai=a.indexOf(q),ei=e.indexOf(q);
    if(ai>=0){addResult(results,row.page,excerpt(row.ar,ai,q.length),"ar");found++;}
    if(ei>=0){addResult(results,row.page,excerpt(row.en,ei,q.length),"en");found++;}
    if(found>=90)break;
  }
  hint.textContent=found+" displayed result"+(found===1?"":"s")+" (maximum 90); page labels are not clause-level alignment.";
  if(!found)results.append(node("p",null,"No matching passage."));
 };
 input.addEventListener("input",run);run();input.focus();
}
function contentsView(){
 open("Contents · four foundations and concluding preface");
 const input=node("input");input.type="search";input.placeholder="Find a printed page or heading…";input.setAttribute("aria-label","Find a page");
 const result=node("div","pr-matches");body.append(input,result);
 const sections=[
 [18,69,"I · Essence and divine names"],
 [70,78,"II · Spirits"],
 [79,101,"III · Cosmos and Adam"],
 [102,143,"IV · Human reality and return"],
 [144,145,"Concluding preface"]
 ];
 const run=()=>{
  result.replaceChildren();const q=input.value.trim().toLocaleLowerCase();
  for(const [a,b,title] of sections){
    const matching=index.filter(x=>x.page>=a&&x.page<=b&&(!q||String(x.page).includes(q)||title.toLocaleLowerCase().includes(q)||x.title.toLocaleLowerCase().includes(q)));
    if(!matching.length)continue;
    result.append(node("h3","pr-foundation",title));
    for(const row of matching)addResult(result,row.page,row.title.replace(/^\s*B2007\s*[·.]\s*p\.\s*\d+/,"").trim(),"en");
  }
 };
 input.addEventListener("input",run);run();input.focus();
}
$("pr-search-open").addEventListener("click",searchView);
$("pr-contents").addEventListener("click",contentsView);
document.addEventListener("keydown",ev=>{
 if(ev.key==="Escape"&&dialog.open){dialog.close();return}
 if(dialog.open)return;
 if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName||""))return;
 if(ev.key==="/"||((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==="k")){ev.preventDefault();searchView()}
});
apply();
/* Source notes stay collapsed until opened individually. */
})();
