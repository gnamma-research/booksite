(()=>{"use strict";
const work=document.body.dataset.work,record=window.GNAMMA_PREVIEW_DATA?.[work],lexicon=window.GNAMMA_PREVIEW_LEXICON||[];
const $=id=>document.getElementById(id);
if(!record)return;
let section=0,selected=new Set(),all=true,tools="citations",historyScroll=0,expanded=false;
const workPaths={daruri:"../ibn-rushd/al-daruri/",bidaya:"../ibn-rushd/bidayat-al-mujtahid/",ajiba:"../ibn-ajiba/al-bahr-al-madid/",mawaqif:"../al-jurjani/sharh-al-mawaqif/"};
const storeKey="gnamma:notes:"+work;

// Bidāya uses two editorial scopes over the same excerpts, source anchors and private notes.
// These are reading aids, not new authorial claims or legal determinations.
const bidayaOnly=work==="bidaya";
const bidayaLifeTags=new Set(["Formation","Law in life","Virtue and habituation","Social institutions","Divine enabling","Philosophical prudence","Higher ends"]);
const bidayaLegalIntroductions=[
  "The legal inquiry begins with the reported positions, the relevant wording and evidence, and the principles explaining why the jurists diverge. This is an editorial orientation, not a quotation from Ibn Rushd. Specific school attributions await the source-controlled dossier import.",
  "A legal determination requires distinguishing the general rules of inquiry from their operation in a particular case. Validity, obligation, prohibition, cause, condition and discharge must not be collapsed into one judgment. This is an editorial research orientation, not an authorial passage."
];
const bidayaExtraLayers=[
  {"Disagreement":"Editorial method: compare the actual legal question, competing positions, reliable source attributions and the earliest premise at which the arguments diverge.",
   "Legal effects":"Distinguish obligatory or forbidden conduct from validity, efficacy, enforceability and discharge; a forbidden act need not have a single uniform legal consequence.",
   "Uncertainty":"Identify whether disagreement concerns evidence, interpretation, operative cause, scope or facts; distinguish justified probable reasoning (ẓann) from guesswork.",
   "Law in life":"Additional inquiry: how the same ruling is actually lived by agents with different intentions and circumstances; no moral inference automatically supplies an operative legal ʿilla.",
   "Virtue and habituation":"Editorial comparison: what habits might faithful or distorted legal practice cultivate, and what evidence would substantiate that connection?",
   "Social institutions":"Comparative questions from Ibn Khaldūn: how might crafts, customary cooperation and institutions mediate the effect of applied law? No direct historical dependence is claimed.",
   "Divine enabling":"Theological comparison: how might tawfīq and divine guidance bear on carrying out a known good? This does not change the juristic evidence for a ruling."},
  {"Proof and application":"Apply a stated rule to exact facts; retain competing proof-lines, exceptions and possible defeaters rather than reducing disagreement to slogans.",
   "Legal causation":"A technical legal cause (ʿilla) is not interchangeable with the wisdom (ḥikma), beneficial outcome or moral attraction of a practice.",
   "Legal judgment":"Preserve distinctions between finding a rule, applying it, and judging whether a person's particular performance satisfies it.",
   "Law in life":"How does an authoritative rule enter action, intention and repeated practice? Record agency and circumstances before assessing effects.",
   "Philosophical prudence":"Comparative inquiry into Aristotelian/Thomistic prudentia and Ibn Rushd's trained juristic inquiry; analogy is not equivalence or an assertion of transmission.",
   "Higher ends":"Explore ends, virtue and revealed guidance with explicit sourcing; do not assume an inferred higher good can replace an operative textual proof.",
   "Social institutions":"Compare the conditions of legal practice in households, markets and political community with Ibn Khaldūn's account of crafts and ʿumrān."}
];
let bidayaEdition=bidayaOnly?(new URLSearchParams(location.search).get("edition")||safeGet("gnamma:bidaya:edition")||"law"):"law";
if(bidayaEdition!=="life")bidayaEdition="law";
function bidayaSync(){
 if(!bidayaOnly)return;
 document.body.dataset.edition=bidayaEdition;
 $("p-edition-law").setAttribute("aria-pressed",String(bidayaEdition==="law"));
 $("p-edition-life").setAttribute("aria-pressed",String(bidayaEdition==="life"));
 $("p-work-title").textContent="Bidāyat al-Mujtahid";
 $("p-book-title").textContent=bidayaEdition==="law"?"Law and Legal Reasoning":"Law and Human Life";
 $("p-edition-summary").textContent=bidayaEdition==="law"
  ?"Edition I · Positions, legal proofs, qawānīn, interpretation and legal effects. Virtue, spiritual formation and social-philosophy comparisons are excluded."
  :"Edition II · All the legal inquiry, with distinctly attributed editorial perspectives on virtue, human action, Ibn Khaldūn, prudence and tawfīq.";
 document.title="Bidāyat al-Mujtahid · "+(bidayaEdition==="law"?"Law and Legal Reasoning":"Law and Human Life")+" | Gnamma";
 const heading=document.querySelector(".p-embed h2");if(heading)heading.textContent=bidayaEdition==="law"?"Legal lines of inquiry":"Legal and human-life inquiries";
}
function bidayaSwitch(value){
 if(!bidayaOnly || (value!=="law" && value!=="life"))return;
 const scroller=$("p-center"),y=scroller.scrollTop;
 bidayaEdition=value;safeSet("gnamma:bidaya:edition",value);bidayaSync();
 $("p-english").textContent=value==="law"?(bidayaLegalIntroductions[section]||record.sections[section].english):record.sections[section].english;
 selected=new Set();all=true;renderLenses();
 const url=new URL(location.href);url.searchParams.set("edition",value);
 history.replaceState(null,"",url.pathname+url.search+url.hash);scroller.scrollTop=y;
}
function bindBidayaEditions(){
 if(!bidayaOnly)return;
 $("p-edition-law").addEventListener("click",()=>bidayaSwitch("law"));
 $("p-edition-life").addEventListener("click",()=>bidayaSwitch("life"));
 bidayaSync();
}

function safeSet(k,v){try{localStorage.setItem(k,v)}catch{}}
function safeGet(k){try{return localStorage.getItem(k)||""}catch{return""}}
function node(tag,props={},text){const el=document.createElement(tag);for(const [key,value] of Object.entries(props)){if(key==="className")el.className=value;else if(key==="dataset")Object.assign(el.dataset,value);else if(key==="dir")el.dir=value;else el.setAttribute(key,value)}if(text!==undefined)el.textContent=text;return el}
function setup(){document.title=record.title+" | Gnamma Texts";$("p-work-title").textContent=record.title;$("p-work-author").textContent=record.author;$("p-book-title").textContent=record.subtitle;$("p-work-status").textContent=record.status;if(bidayaOnly)bindBidayaEditions();const nav=$("p-contents");record.sections.forEach((s,i)=>{const btn=node("button",{className:"p-section-item"});btn.append(node("i",{},String(i+1).padStart(2,"0")),node("span",{},s.title));btn.addEventListener("click",()=>setSection(i));nav.append(btn)});$("p-prev").addEventListener("click",()=>setSection(Math.max(0,section-1)));$("p-next").addEventListener("click",()=>setSection(Math.min(record.sections.length-1,section+1)));$("p-mode").addEventListener("click",()=>{expanded=!expanded;$("p-layout").classList.toggle("p-full",expanded);$("p-mode").setAttribute("aria-pressed",String(expanded));$("p-mode").textContent=expanded?"◱ Half view":"⛶ Full view"});document.querySelectorAll("[data-tool]").forEach(b=>b.addEventListener("click",()=>showTool(b.dataset.tool)));$("p-close").addEventListener("click",()=>{$("p-ref").hidden=true;$("p-rail").hidden=false});$("p-back").addEventListener("click",()=>{const origin=safeGet("gnamma:related:return");if(origin){try{const r=JSON.parse(origin);if(r.to===work){safeSet("gnamma:related:return","");location.href=r.from;return}}catch{}}location.href="../../../texts/"});const hash=location.hash.match(/part-(\d+)/);setSection(hash?Math.min(record.sections.length-1,+hash[1]):0);const saved=safeGet("gnamma:related:position");if(saved){try{const s=JSON.parse(saved);if(s.work===work){setSection(s.section);$("p-center").scrollTop=s.scroll;safeSet("gnamma:related:position","")}}catch{}}}
function setSection(i){section=i;selected=new Set();all=true;let s=record.sections[i];$("p-section-title").textContent=s.title;$("p-ar").textContent=s.arabic||"";$("p-ar").hidden=!s.arabic;$("p-english").textContent=bidayaOnly&&bidayaEdition==="law"?(bidayaLegalIntroductions[i]||s.english):s.english;$("p-citation").textContent=s.citation;const pct=Math.round((i+1)/record.sections.length*100);$("p-progress").style.width=pct+"%";$("p-progress-label").textContent=pct+"% of shown excerpts";document.querySelectorAll(".p-section-item").forEach((b,j)=>b.classList.toggle("active",j===i));history.replaceState(null,"","#part-"+i);renderLenses();$("p-center").scrollTop=0;$("p-prev").disabled=i===0;$("p-next").disabled=i===record.sections.length-1}
function renderLenses(){const s=record.sections[section],filters=$("p-layer-filters"),body=$("p-layers");filters.replaceChildren();body.replaceChildren();const allBtn=node("button",{"aria-pressed":String(all)},"All");allBtn.addEventListener("click",()=>{all=true;selected.clear();renderLenses()});filters.append(allBtn);Object.entries(bidayaOnly?{...(s.lenses||{}),...(bidayaExtraLayers[section]||{})}:(s.lenses||{})).filter(([k])=>!bidayaOnly||bidayaEdition==="life"||!bidayaLifeTags.has(k)).forEach(([k,v])=>{const button=node("button",{"aria-pressed":String(all||selected.has(k))},k);button.addEventListener("click",()=>{if(all){all=false;selected=new Set()}selected.has(k)?selected.delete(k):selected.add(k);renderLenses()});filters.append(button);if(all||selected.has(k)){const p=node("section",{className:"p-layer"});p.append(node("h3",{},k),node("p",{},v));body.append(p)}})}
function showTool(name){tools=name;const ref=$("p-ref"),inner=$("p-ref-body");ref.hidden=false;$("p-rail").hidden=true;$("p-ref-heading").textContent=({citations:"Citation and source",dictionary:"Technical dictionary",related:"Related works",notes:"My reading notes"})[name]||name;inner.replaceChildren();
if(name==="citations"){inner.append(node("p",{},record.sections[section].citation),node("p",{className:"p-muted"},"This source record is attached to the current excerpt. Editorial text is never presented as Ibn Rushd's or another author’s quotation."));}
if(name==="dictionary"){const search=node("input",{type:"search",placeholder:"Arabic, English or Latin term","aria-label":"Look up technical term"});inner.append(search);const results=node("div");inner.append(results);function filter(){results.replaceChildren();lexicon.filter(o=>(o.ar+" "+o.term+" "+o.en+" "+o.lat).toLocaleLowerCase().includes(search.value.toLocaleLowerCase())).slice(0,15).forEach(o=>{const x=node("div",{className:"p-ref-row"});x.append(node("h3",{lang:"ar",dir:"rtl"},o.ar),node("strong",{},o.term+" — "+o.en),node("p",{},o.lat),node("small",{},o.note));results.append(x)})}search.addEventListener("input",filter);filter()}
if(name==="related"){inner.append(node("p",{className:"p-muted"},"Open a related work. You can return to this excerpt afterwards."));const urls={daruri:"../al-daruri/",bidaya:"../bidayat-al-mujtahid/",ajiba:"../../ibn-ajiba/al-bahr-al-madid/",mawaqif:"../../al-jurjani/sharh-al-mawaqif/"};for(const [id,r] of Object.entries(window.GNAMMA_PREVIEW_DATA)){if(id===work)continue;const b=node("button",{className:"p-ref-row"},r.title);b.addEventListener("click",()=>{safeSet("gnamma:related:position",JSON.stringify({work,section,scroll:$("p-center").scrollTop}));safeSet("gnamma:related:return",JSON.stringify({from:location.href,to:id}));let target=({daruri:"../../../texts/ibn-rushd/al-daruri/",bidaya:"../../../texts/ibn-rushd/bidayat-al-mujtahid/",ajiba:"../../../texts/ibn-ajiba/al-bahr-al-madid/",mawaqif:"../../../texts/al-jurjani/sharh-al-mawaqif/"})[id];location.href=target});inner.append(b)}const ret=safeGet("gnamma:related:return");if(ret){try{const v=JSON.parse(ret);if(v.to===work){const b=node("button",{className:"p-ref-row"},"← Return to previous work");b.onclick=()=>location.href=v.from;inner.prepend(b)}}catch{}}}
if(name==="notes"){const area=node("textarea",{rows:"7","aria-label":"Private notes",placeholder:"Working notes on this excerpt"});area.value=safeGet(storeKey+":"+section);inner.append(area);const b=node("button",{className:"p-ref-row"},"Save privately in this browser");b.onclick=()=>{safeSet(storeKey+":"+section,area.value);b.textContent="Saved in this browser"};inner.append(b)}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup);else setup();
})();