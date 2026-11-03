/* Gnamma · Qawāʿid / Tamhīd reader · Darūrī-family controls · 2026-11-03 */
(function(){
"use strict";
const matn=window.GNAMMA_QAWAID_MATN;
const sharh=window.GNAMMA_TAMHID_SHARH;
const root=document.documentElement,body=document.body,reading=document.getElementById("reading-list");
if(!matn || !Array.isArray(matn.units) || !matn.units.length){
  reading.textContent="Matn data unavailable. Open the bilingual source file from the footer.";return;
}
const units=matn.units,comments=Array.isArray(sharh?.units)?sharh.units:[];
const byMatn=new Map();
for(const c of comments){if(!byMatn.has(c.matnId))byMatn.set(c.matnId,[]);byMatn.get(c.matnId).push(c);}
const $=(id)=>document.getElementById(id);
const esc=(s)=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeUrl=(s)=>/^https:\/\//i.test(String(s||""))?esc(s):"#";
const key="gnamma:qawaid:reading:v2";
const saved=(()=>{try{return JSON.parse(localStorage.getItem(key)||"{}")||{}}catch{return {}}})();
const deepMatch=(window.location.hash||"").match(/QT-(\d{3})/);
const deepIndex=deepMatch?units.findIndex(u=>u.id==="QT-"+deepMatch[1]):-1;
const state={
 index:deepIndex>=0?deepIndex:Math.max(0,Math.min(units.length-1,Number(saved.index)||0)),
 layer:["matn","paired","sharh"].includes(saved.layer)?saved.layer:"matn",
 ar:saved.ar!==false,en:saved.en!==false,
 focus:[0,1,2,3].includes(saved.focus)?saved.focus:0,
 theme:["parchment","horizon","night"].includes(saved.theme)?saved.theme:"parchment",
 landscape:saved.landscape===true,
 notes:saved.notes===true,
 font:Math.max(.82,Math.min(1.45,Number(saved.font)||1)),
 leading:Math.max(1.55,Math.min(2.15,Number(saved.leading)||1.8)),
 width:Math.max(560,Math.min(1300,Number(saved.width)||960)),
 bookmarks:Array.isArray(saved.bookmarks)?saved.bookmarks.filter(v=>units.some(u=>u.id===v)):[],
 personal:saved.personal && typeof saved.personal==="object" && !Array.isArray(saved.personal)?saved.personal:{}
};
if(!state.ar&&!state.en)state.en=true;
let activeSheet="",searchValue="",scrollUpdating=false;
const label=(id)=>units.find(u=>u.id===id)?.title||id;
function persist(){
 const payload={...state,personal:state.personal};
 try{localStorage.setItem(key,JSON.stringify(payload));return true}catch{toast("Browser storage is unavailable; your changes will not persist.");return false}
}
function toast(msg){const t=$("toast");t.textContent=msg;t.style.display="block";clearTimeout(toast.id);toast.id=setTimeout(()=>t.style.display="none",2600)}
function apply(){
 root.dataset.theme=state.theme;
 body.dataset.mode=state.layer;
 body.dataset.focus=String(state.focus);
 body.dataset.language=state.ar&&state.en?"both":state.ar?"ar":"en";
 body.dataset.showNotes=String(state.notes);
 body.dataset.background=state.landscape?"landscape":"native";
 root.style.setProperty("--scale",String(state.font));root.style.setProperty("--leading",String(state.leading));root.style.setProperty("--reading-width",state.width+"px");
 $("lang-ar").setAttribute("aria-pressed",String(state.ar));
 $("lang-en").setAttribute("aria-pressed",String(state.en));
 for(const b of document.querySelectorAll("[data-layer]"))b.setAttribute("aria-pressed",String(b.dataset.layer===state.layer));
 $("focus-label").textContent=["Normal","Focus 1","Focus 2","Continuous"][state.focus];
 const bookmarked=state.bookmarks.includes(units[state.index].id);
 $("save-button").setAttribute("aria-pressed",String(bookmarked));
 $("save-button").setAttribute("aria-label",bookmarked?"Remove saved bookmark":"Save this passage");
 $("theme-button").title="Theme: "+state.theme+". Tap for next";
 const fg=state.layer==="matn"?"Matn":state.layer==="sharh"?"Sharḥ":"Matn + sharḥ";
 $("reading-status").textContent=fg+" · "+units.length+" matn · "+comments.length+" commentary excerpts";
}
function updateDock(){
 const u=units[state.index],prev=units[state.index-1],next=units[state.index+1];
 $("location-title").textContent=u.id+" · "+u.title;
 $("location-source").textContent="Āshtiyānī pp. "+u.pages.join("–")+" · "+(state.layer==="sharh"?"Commentary":state.layer==="paired"?"Together":"Matn");
 $("prev").disabled=!prev;$("next").disabled=!next;
 $("prev-num").textContent=prev?prev.id.replace("QT-",""):"—";
 $("next-num").textContent=next?next.id.replace("QT-",""):"—";
 $("save-button").setAttribute("aria-pressed",String(state.bookmarks.includes(u.id)));
}
function notesMarkup(arr,title){
 if(!arr||!arr.length)return "";
 return '<details class="source-notes"><summary>'+esc(title||"Editorial notes")+' ('+arr.length+')</summary><ul>'+arr.map(s=>'<li>'+esc(s)+'</li>').join("")+'</ul></details>';
}
function textPair(ar,en){
 return '<div class="text-pair"><div class="ar" lang="ar" dir="rtl"><span class="text-label">Arabic source</span>'+esc(ar)+'</div><div class="en" lang="en"><span class="text-label">English translation</span>'+esc(en)+'</div></div>';
}
function renderCommentary(c){
 const variants=(c.variants||[]).map(v=>"Reading: "+v.base+" / "+v.alternatives.join(" / ")+" ("+v.status+")");
 return '<section class="commentary-entry" id="'+esc(c.id)+'">'+
 '<div class="section-meta"><span class="small-pill">SHARḤ · '+esc(c.id)+'</span><span>Printed p. '+esc(c.page)+'</span><a href="'+safeUrl(c.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Arabic source</a></div>'+
 '<h4>'+esc(c.section)+'</h4>'+textPair(c.arabic,c.english)+notesMarkup([...(c.notes||[]),...variants],"Commentary translation notes")+
 '</section>';
}
function renderUnit(u,index,continuous){
 const related=byMatn.get(u.id)||[];
 const matnLayer=state.layer!=="sharh";
 const commentaryLayer=state.layer!=="matn";
 const heading='<div class="section-meta"><span>'+esc(u.id)+'</span><span>ORIGINAL MATN</span><a href="'+safeUrl(u.url)+'" target="_blank" rel="noopener noreferrer">Āshtiyānī p. '+esc(u.pages[0])+'</a>'+(related.length?'<span class="small-pill">'+related.length+' sharḥ excerpt'+(related.length===1?"":"s")+'</span>':"")+'</div>';
 const notes=matnLayer?notesMarkup([...(u.notes||[]),...(u.variants||[]).map(v=>v.lemma+" / "+v.other+": "+v.remark)],"Matn notes and readings"):"";
 const matnHtml=matnLayer?'<div class="matn-body"><h3>'+esc(u.title)+'</h3>'+textPair(u.arabic,u.english)+'</div>':"";
 const commHtml=commentaryLayer?(related.length?'<div class="commentary-list">'+related.map(renderCommentary).join("")+'</div>':
   (!continuous?'<div class="untranslated"><h3>Commentary reserved</h3><p>The commentary for '+esc(u.id)+' has not yet been source-checked and translated. Its place is reserved here; no reconstructed Arabic is displayed.</p><button class="text-btn" type="button" data-go-verified="yes">Open the first translated sharḥ passages (QT-061)</button></div>':"")):"";
 const actions=!continuous?'<div class="inline-actions">'+
 '<button class="text-btn" type="button" data-save="'+esc(u.id)+'">'+(state.bookmarks.includes(u.id)?"Remove bookmark":"Save passage")+'</button>'+
 (state.layer==="matn"?'<button class="text-btn" type="button" data-open-commentary="'+esc(u.id)+'">Read linked commentary</button>':"")+
 '<button class="text-btn" type="button" data-copy="'+esc(u.id)+'">Copy section link</button></div>':"";
 return '<article class="reading-block" id="'+esc(u.id)+'" data-unit-index="'+index+'" aria-label="'+esc(u.id)+'">'+heading+matnHtml+notes+commHtml+actions+'</article>';
}
function render(){
 apply();
 const u=units[state.index];
 if(state.focus===3){
   const displayed=(state.layer==="sharh"?units.filter(x=>byMatn.has(x.id)):units);
   reading.innerHTML='<div class="stage-header"><h2>Continuous reading</h2></div>'+displayed.map(x=>renderUnit(x,units.indexOf(x),true)).join("");
   if(!displayed.length)reading.innerHTML='<p class="layer-note">No verified commentary text has been loaded yet.</p>';
 }else{
   const stage='<header class="stage-header"><div><span class="stage-kicker">'+
       (state.layer==="sharh"?"COMMENTARY TRANSLATION":state.layer==="paired"?"MATN & COMMENTARY":"ORIGINAL TREATISE")+
       ' · '+esc(u.id)+'</span><h2>'+esc(u.title)+'</h2><span class="stage-source">Source pp. '+esc(u.pages.join("–"))+'</span></div></header>';
   const note=(state.layer==="sharh"?'<p class="layer-note"><strong>Separate authorial layer.</strong> The grandson’s commentary has '+comments.length+' verified English excerpts, presently at printed p.274. Untranslated locations remain clearly unfilled.</p>':
       state.layer==="paired"?'<p class="layer-note">The ancestral <em>matn</em> and the descendant’s <em>sharḥ</em> are distinct voices. Commentary appears beneath its corresponding matn only when a verified passage has been translated.</p>':"");
   reading.innerHTML=stage+note+renderUnit(u,state.index,false);
 }
 updateDock();
}
function go(i,{scroll=true,replaceHash=true}={}){
 if(!Number.isFinite(i))return;
 state.index=Math.max(0,Math.min(units.length-1,Math.round(i)));
 render();persist();
 if(replaceHash)history.replaceState(null,"","#"+units[state.index].id);
 if(scroll){
   const node=state.focus===3?$(units[state.index].id):$("reading");
   node?.scrollIntoView({behavior:"smooth",block:"start"});
 }
}
function chooseLayer(layer){if(!["matn","paired","sharh"].includes(layer))return;state.layer=layer;go(state.index,{scroll:false});}
function cycleFocus(){
 state.focus=(state.focus+1)%4;render();persist();
 if(state.focus===3)$(units[state.index].id)?.scrollIntoView({block:"start"});
 else $("reading")?.scrollIntoView({block:"start"});
}
function nextTheme(){state.theme=({parchment:"horizon",horizon:"night",night:"parchment"})[state.theme];apply();persist();}
function changeLanguage(lang){
 if(lang==="ar"){if(state.ar&& !state.en){toast("At least one language must remain visible.");return;}state.ar=!state.ar;}
 if(lang==="en"){if(state.en&& !state.ar){toast("At least one language must remain visible.");return;}state.en=!state.en;}
 apply();persist();
}
function toggleSave(id){
 const x=id||units[state.index].id,k=state.bookmarks.indexOf(x);
 if(k>=0)state.bookmarks.splice(k,1);else state.bookmarks.push(x);
 if(persist()){toast(k>=0?"Bookmark removed":"Passage saved");}apply();updateDock();
}
function openSheet(kind,title){
 activeSheet=kind;$("sheet-kicker").textContent="GNAMMA · "+(kind==="contents"?"PASSAGES":"READING DESK");
 $("sheet-title").textContent=title||({contents:"Contents",settings:"Display settings",search:"Search the edition",bookmarks:"Saved passages",notes:"My notes",reference:"Study & sources",about:"About this edition",help:"Reading controls"})[kind]||"Reader";
 $("sheet-content").innerHTML=sheetMarkup(kind);
 const sh=$("sheet");if(typeof sh.showModal==="function"&&!sh.open)sh.showModal();else sh.setAttribute("open","");
 if(kind==="search"){$("search-field")?.focus();searchResults();}
}
function closeSheet(){
 if($("sheet").open&&typeof $("sheet").close==="function")$("sheet").close();
 else $("sheet").removeAttribute("open");
 activeSheet="";
}
function sheetMarkup(kind){
 switch(kind){
 case "contents":
 return '<p class="help-copy">Select any of the 61 source-located matn units. A dot denotes a translated commentary passage.</p><div class="sheet-list">'+units.map((u,i)=>'<button type="button" data-jump="'+i+'">'+esc(u.id)+' · '+esc(u.title)+(byMatn.has(u.id)?" · ● sharḥ":"")+'<small>Printed pp. '+esc(u.pages.join("–"))+'</small></button>').join("")+'</div>';
 case "settings":
 return '<div class="sheet-row"><div><label for="setting-font">Text size</label><small>Arabic and English scale together</small></div><input id="setting-font" type="range" data-range="font" min=".82" max="1.45" step=".03" value="'+state.font+'"></div>'+
 '<div class="sheet-row"><div><label for="setting-leading">Line spacing</label><small>Continuous and section reading</small></div><input id="setting-leading" data-range="leading" type="range" min="1.55" max="2.15" step=".05" value="'+state.leading+'"></div>'+
 '<div class="sheet-row"><div><label for="setting-width">Text width</label><small>Reading measure on larger screens</small></div><input id="setting-width" data-range="width" type="range" min="560" max="1300" step="40" value="'+state.width+'"></div>'+
 '<div class="sheet-row"><div><label for="setting-theme">Theme</label><small>Parchment, horizon, night</small></div><select id="setting-theme" data-select="theme">'+["parchment","horizon","night"].map(x=>'<option value="'+x+'"'+(state.theme===x?" selected":"")+'>'+x+'</option>').join("")+'</select></div>'+
 '<div class="sheet-row"><div><label for="setting-notes">Edition notes</label><small>Show printed variants and editorial notes</small></div><input id="setting-notes" type="checkbox" data-check="notes" '+(state.notes?"checked":"")+'></div>'+
 '<div class="sheet-row"><div><label for="setting-landscape">Landscape backdrop</label><small>Gnamma study ambience</small></div><input id="setting-landscape" type="checkbox" data-check="landscape" '+(state.landscape?"checked":"")+'></div>'+
 '<p class="help-copy">Focus modes cycle Normal → Focus 1 (cleaner) → Focus 2 (hidden toolbar) → Continuous (all passages, flowing layout). Press the floating corner control to leave an immersive mode. Arabic is currently an unvowelled working text; this reader does not invent full tashkīl.</p>';
 case "search":
 return '<p class="help-copy">Search the ancestor’s Arabic and English, the translated commentary, and editorial annotations.</p><input id="search-field" class="sheet-input" type="search" aria-label="Search both Arabic and English" placeholder="Arabic, English, technical term…" value="'+esc(searchValue)+'"><div id="search-results" class="sheet-list"></div>';
 case "bookmarks":
 return '<p class="help-copy">Bookmarks are kept in this browser. Use Export in My notes for a local backup of notes and bookmarks.</p><div class="sheet-list">'+(state.bookmarks.length?state.bookmarks.map(id=>{let i=units.findIndex(u=>u.id===id);return '<button type="button" data-jump="'+i+'">'+esc(id)+' · '+esc(label(id))+'</button>'}).join(""):'<p>No passages saved yet.</p>')+'</div><button class="action-btn" type="button" data-open-sheet="notes">Open My notes and export</button>';
 case "notes":
 return '<p class="help-copy">Private notes are saved locally in this browser, independently of the published editorial apparatus.</p><label for="my-note">Note for '+esc(units[state.index].id)+'</label>'+
 '<textarea class="sheet-input" id="my-note" rows="5" placeholder="Your reading notes…">'+esc(state.personal[units[state.index].id]||"")+'</textarea>'+
 '<div class="book-actions"><button type="button" class="action-btn primary" data-command="save-note">Save note</button><button type="button" class="action-btn" data-command="export">Export my data</button><button type="button" class="action-btn" data-open-sheet="bookmarks">Bookmarks</button></div>'+
 '<div class="sheet-list">'+Object.keys(state.personal).filter(id=>state.personal[id]).map(id=>'<button type="button" data-jump="'+units.findIndex(u=>u.id===id)+'">'+esc(id)+' · '+esc(label(id))+'<small>'+esc(String(state.personal[id]).slice(0,130))+'</small></button>').join("")+'</div>';
 case "reference":
 return '<div class="help-copy"><h3>Reading, study and source records</h3><p>The ancestor’s 61 lemmata and their English translations are available; the descendant’s commentary is a separate incremental translation.</p>'+
 '<div class="sheet-list">'+
 '<a href="data/parallel-matn.md">Full bilingual matn <small>Source-located QT-001–QT-061</small></a>'+
 '<a href="editorial/COMMENTARY_TRANSLATION.md">Commentary translation <small>Two verified excerpts at p.274, editorial policy and next sequence</small></a>'+
 '<a href="editorial/CRITICAL_APPARATUS.md">Critical apparatus <small>Reported readings, conjectures and editorial decisions</small></a>'+
 '<a href="editorial/EDITORIAL_STATUS.md">Editorial status <small>Evidence limits and original versus commentary</small></a>'+
 '<a href="editorial/TECHNICAL_GLOSSARY.md">Avicennian–Akbarian glossary <small>Existence, determination, ḥads, discursive thought</small></a>'+
 '<a href="editorial/MANUSCRIPT_COLLATION_DOSSIER.md">Witness and manuscript dossier</a>'+
 '</div><p>QT-059 retains the surviving text, with a source omission noted. This does not block the working translation.</p></div>';
 case "about":
 return '<div class="help-copy"><h3>Two authors, two texts</h3><p><b>Matn:</b> Abū Ḥāmid Turka al-Iṣfahānī’s <em>Qawāʿid al-Tawḥīd</em>, reconstructed from the ancestor’s explicit quotations in the later <em>Tamhīd</em>.</p>'+
 '<p><b>Sharḥ:</b> Ṣāʾin al-Dīn ʿAlī Ibn Turka’s explanation, independently attributed and translated as a separate layer. The first source-checked excerpts are from the final Arabic page (p.274). The original’s closing formula is at p.270; Āshtiyānī’s separate editorial colophon is excluded from the commentator’s translation.</p><p>This is a working source-critical bilingual reader; full independent manuscript collation is not claimed.</p></div>';
 case "help":
 return '<div class="help-copy"><h3>Reading modes</h3><p><b>Matn</b> reads the ancestor, <b>Sharḥ</b> opens the grandson’s translation and its reserved locations, and <b>Together</b> places translated commentary beneath its associated lemma. All future commentary units use stable IDs.</p><p><b>Focus</b> cycles through progressively quieter displays, ending in a continuous scroll without cards. The bottom dock jumps between units. Search, bookmarks, and private notes are accessible from the top toolbar or contents.</p><p><b>Keyboard:</b> Left/Right arrows move to adjacent passages when not typing, and Escape dismisses open panels.</p></div>';
 default:
 return '<p class="help-copy">No panel is available.</p>';
 }
}
function searchResults(){
 const el=$("search-results");if(!el)return;
 const q=searchValue.trim().toLocaleLowerCase();
 if(!q){el.innerHTML='<p class="help-copy">Type a phrase or technical term to search.</p>';return;}
 const found=[];
 for(let i=0;i<units.length;i++){
  const u=units[i],related=byMatn.get(u.id)||[];
  const blob=[u.id,u.title,u.arabic,u.english,...(u.notes||[]),...related.flatMap(c=>[c.arabic,c.english,c.section,...(c.notes||[])])].join(" ").toLocaleLowerCase();
  if(blob.includes(q))found.push({u,i,hasCommentary:related.some(c=>[c.arabic,c.english,c.section].join(" ").toLocaleLowerCase().includes(q))});
 }
 el.innerHTML=found.length?found.slice(0,61).map(({u,i,hasCommentary})=>'<button type="button" data-jump="'+i+'">'+esc(u.id)+' · '+esc(u.title)+(hasCommentary?" · Sharḥ":"")+'<small>Printed pp. '+esc(u.pages.join("–"))+'</small></button>').join(""):'<p class="help-copy">No passage matches this query.</p>';
}
function copyLink(id){
 const url=window.location.href.split("#")[0]+"#"+id;
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(url).then(()=>toast("Section link copied"),()=>toast("Copy this link: "+url));}
 else toast("Section link: "+url);
}
function exportPersonal(){
 const payload={schema:"gnamma-qawaid-my-reading-v1",exportedAt:new Date().toISOString(),bookmarks:state.bookmarks,notes:state.personal};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="gnamma-qawaid-my-notes.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);toast("Exported notes and bookmarks");
}
document.addEventListener("click",(e)=>{
 const b=e.target.closest("button");if(!b)return;
 if(b.dataset.jumP!==undefined)return; // deliberate no-op for unsupported mixed-case attrs
 if(b.hasAttribute("data-jump")){const i=Number(b.dataset.jump);if(Number.isFinite(i)&&i>=0){closeSheet();go(i);}return;}
 if(b.dataset.layer)chooseLayer(b.dataset.layer);
 if(b.hasAttribute("data-save"))toggleSave(b.dataset.save);
 if(b.hasAttribute("data-open-commentary")){chooseLayer("paired");go(units.findIndex(u=>u.id===b.dataset.openCommentary));}
 if(b.hasAttribute("data-copy"))copyLink(b.dataset.copy);
 if(b.hasAttribute("data-go-verified")){chooseLayer("sharh");go(60);closeSheet();}
 if(b.dataset.openSheet)openSheet(b.dataset.openSheet);
 if(b.dataset.command==="save-note"){
  const text=$("my-note")?.value||"";if(text)state.personal[units[state.index].id]=text;else delete state.personal[units[state.index].id];
  if(persist())toast("Private note saved");
 }
 if(b.dataset.command==="export")exportPersonal();
});
$("menu-button").addEventListener("click",()=>openSheet("contents"));
$("location-button").addEventListener("click",()=>openSheet("contents"));
$("search-button").addEventListener("click",()=>openSheet("search"));
$("theme-button").addEventListener("click",nextTheme);
$("settings-button").addEventListener("click",()=>openSheet("settings"));
$("focus-button").addEventListener("click",cycleFocus);
$("focus-recover").addEventListener("click",cycleFocus);
$("lang-ar").addEventListener("click",()=>changeLanguage("ar"));
$("lang-en").addEventListener("click",()=>changeLanguage("en"));
$("save-button").addEventListener("click",()=>toggleSave());
$("prev").addEventListener("click",()=>go(state.index-1));
$("next").addEventListener("click",()=>go(state.index+1));
$("start-matn").addEventListener("click",()=>{chooseLayer("matn");go(0);});
$("start-sharh").addEventListener("click",()=>{chooseLayer("sharh");go(60);});
$("open-study").addEventListener("click",()=>openSheet("reference"));
$("sheet-close").addEventListener("click",closeSheet);
$("sheet").addEventListener("click",(e)=>{if(e.target===$("sheet"))closeSheet();});
$("sheet-content").addEventListener("input",(e)=>{
 const t=e.target;
 if(t.id==="search-field"){searchValue=t.value;searchResults();}
 if(t.dataset.range){state[t.dataset.range]=Number(t.value);apply();persist();}
});
$("sheet-content").addEventListener("change",(e)=>{
 const t=e.target;
 if(t.dataset.select){state[t.dataset.select]=t.value;apply();persist();}
 if(t.dataset.check){state[t.dataset.check]=t.checked;apply();persist();}
});
document.addEventListener("keydown",(e)=>{
 if(e.key==="Escape"&&$("sheet").open){closeSheet();return;}
 if(e.target.closest("input,textarea,select,[contenteditable='true']")||$("sheet").open)return;
 if(e.key==="ArrowLeft"){e.preventDefault();go(state.index-1);}
 if(e.key==="ArrowRight"){e.preventDefault();go(state.index+1);}
});
window.addEventListener("hashchange",()=>{
 const m=window.location.hash.match(/QT-(\d{3})/);
 if(!m)return;
 const i=units.findIndex(u=>u.id==="QT-"+m[1]);if(i>=0&&i!==state.index)go(i,{replaceHash:false});
});
window.addEventListener("scroll",()=>{
 if(state.focus!==3||scrollUpdating)return;
 scrollUpdating=true;requestAnimationFrame(()=>{
  scrollUpdating=false;
  const blocks=[...document.querySelectorAll("#reading-list .reading-block")];
  let best=null,bestDist=Infinity;
  for(const b of blocks){const box=b.getBoundingClientRect(),dist=Math.abs(box.top-110);if(box.bottom>100&&dist<bestDist){bestDist=dist;best=Number(b.dataset.unitIndex);}}
  if(best!==null&&best!==state.index){state.index=best;apply();updateDock();persist();}
 });
},{passive:true});
render();
})();
