/* GNAMMA Farghānī introduction reader, Stage XVIII.
 * No text generation, source substitution, or silent modification of the translation.
 * Search indexes paragraph text in the static 128-page working English article. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const article = $("document");
  if (!article) return;
  const pages = [...article.querySelectorAll("section.b2007-page")];
  if (pages.length !== 128) {
    console.error("Farghānī reader: unexpected page count", pages.length);
    return;
  }
  const sections = pages.map((node, i) => ({
    page: i + 18,
    node,
    title: node.querySelector("h3")?.textContent || "Page " + (i+18),
    paras: [...node.querySelectorAll("p")]
  }));
  const last = sections.at(-1)?.page || 145;
  const foundations = [
    {name:"Foundation I · Essence and divine names",start:18,end:69},
    {name:"Foundation II · Spirits",start:70,end:78},
    {name:"Foundation III · Cosmos and Adam",start:79,end:101},
    {name:"Foundation IV · Human reality and return",start:102,end:143},
    {name:"Concluding preface",start:144,end:145}
  ];
  const storageKey = "gnamma-farghani-introduction-reading-v2";
  function readStored() { try { return JSON.parse(localStorage.getItem(storageKey) || "{}") || {}; } catch (_) { return {}; } }
  const saved = readStored();
  const preferences = {
    scale: typeof saved.scale==="number" && Number.isFinite(saved.scale) ? Math.max(.85,Math.min(1.5,saved.scale)) : 1,
    theme: ["parchment","horizon","night"].includes(saved.theme) ? saved.theme : "parchment",
    wide: saved.wide === true,
    markers: saved.markers === true,
    bookmarks: Array.isArray(saved.bookmarks) ? [...new Set(saved.bookmarks.filter(n=>Number.isInteger(n)&&n>=18&&n<=145))] : [],
    lastPage: Number.isInteger(saved.lastPage)&&saved.lastPage>=18&&saved.lastPage<=145 ? saved.lastPage : 18
  };
  let current = 18, activeDialog = "", timer, ticking = false;
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motion = prefersReducedMotion ? "auto" : "smooth";
  const safeText = (tag, cls, label) => {
    const n = document.createElement(tag);
    if(cls)n.className=cls;
    if(label!==undefined)n.textContent=label;
    return n;
  };
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch (_) { /* Reader also works without storage. */ }
  }
  function toast(message) {
    const node=$("fr-toast");if(!node)return;
    node.textContent=message;node.classList.add("visible");
    clearTimeout(timer);timer=setTimeout(()=>node.classList.remove("visible"),2500);
  }
  function applyPreferences() {
    document.documentElement.dataset.theme=preferences.theme;
    document.documentElement.style.setProperty("--fr-scale",String(preferences.scale));
    document.body.classList.toggle("fr-wide",preferences.wide);
    document.body.classList.toggle("reader-clean",!preferences.markers);
    $("fr-theme").textContent="Theme: "+({parchment:"Paper",horizon:"Mist",night:"Night"})[preferences.theme];
    $("fr-wide").setAttribute("aria-pressed",String(preferences.wide));
    $("fr-markers").setAttribute("aria-pressed",String(preferences.markers));
    $("fr-markers").textContent=preferences.markers?"Hide page labels":"Page labels";
    $("fr-font-down").disabled=preferences.scale<=.85;
    $("fr-font-up").disabled=preferences.scale>=1.5;
    $("fr-font-down").title="Smaller text, current scale "+Math.round(preferences.scale*100)+"%";
    $("fr-font-up").title="Larger text, current scale "+Math.round(preferences.scale*100)+"%";
    persist();
  }
  function markCurrent(page, remember=true) {
    current=Math.min(last,Math.max(18,page));
    if(remember)preferences.lastPage=current;
    $("fr-current").textContent="p. "+current+" / "+last;
    $("fr-current").setAttribute("aria-label","Beirut 2007 printed page "+current+" of "+last);
    $("fr-prev").disabled=current<=18;
    $("fr-next").disabled=current>=last;
    $("fr-save").textContent=preferences.bookmarks.includes(current)?"★ Saved":"☆ Save";
    $("fr-save").setAttribute("aria-pressed",String(preferences.bookmarks.includes(current)));
    persist();
  }
  function progress() {
    // Track the position through the introduction, excluding the editorial apparatus.
    const start=article.getBoundingClientRect().top+scrollY;
    const end=start+article.offsetHeight;
    const value=end<=start?0:Math.max(0,Math.min(100,100*(scrollY+innerHeight*.35-start)/(end-start)));
    const bar=$("fr-progress-fill"),track=$("fr-progress-track");
    bar.style.width=value.toFixed(2)+"%";
    track.setAttribute("aria-valuenow",String(Math.round(value)));
    const y=innerHeight*.32;
    let candidate=18;
    for(const s of sections) {if(s.node.getBoundingClientRect().top<=y)candidate=s.page;else break;}
    if(candidate!==current)markCurrent(candidate);
  }
  function requestProgress() {
    if(!ticking){ticking=true;requestAnimationFrame(()=>{ticking=false;progress();});}
  }
  function closePanel() {
    const d=$("fr-panel");
    if(d.open)d.close();
    activeDialog="";
  }
  function panel(title,type) {
    activeDialog=type;
    $("fr-panel-title").textContent=title;
    const body=$("fr-panel-body");
    body.replaceChildren();
    const d=$("fr-panel");
    if(!d.open)d.showModal();
    return body;
  }
  function jump(page, target) {
    closePanel();
    const s=sections[page-18];if(!s)return;
    history.replaceState(null,"","#b2007-p"+page);
    const n=target||s.node;
    n.scrollIntoView({behavior:motion,block:target?"center":"start"});
    for(const x of pages)x.classList.remove("fr-target");
    s.node.classList.add("fr-target");
    markCurrent(page);
    // Target styling stays while navigating; never changes the content.
    requestProgress();
  }
  function resultButton(title,desc,onClick) {
    const b=safeText("button","fr-result");
    b.type="button";
    b.append(safeText("b",null,title));
    if(desc)b.append(safeText("small",null,desc));
    b.addEventListener("click",onClick);
    return b;
  }
  function input(label,placeholder) {
    const n=safeText("input","fr-input");
    n.type="search";n.placeholder=placeholder;n.setAttribute("aria-label",label);
    n.autocapitalize="off";n.autocomplete="off";return n;
  }
  function openContents() {
    const body=panel("Contents · four foundations","contents");
    const field=input("Filter the table of contents","Find a heading or page number…");
    const results=safeText("div");
    const help=safeText("p","fr-help","Jump to any of the 128 printed page labels. Page headings are navigation aids, not authorial divisions.");
    body.append(field,help,results);
    const render=()=>{
      results.replaceChildren();const q=field.value.toLocaleLowerCase().trim();
      let total=0;
      for(const f of foundations){
        const group=sections.filter(s=>s.page>=f.start&&s.page<=f.end&&(!q||s.title.toLocaleLowerCase().includes(q)||String(s.page).includes(q)||f.name.toLocaleLowerCase().includes(q)));
        if(!group.length)continue;
        results.append(safeText("h3","fr-foundation",f.name));
        const grid=safeText("div","fr-pages");
        for(const s of group){grid.append(resultButton("p. "+s.page,s.title.replace(/^B2007 p\.\s*\d+\s*·\s*/,""),()=>jump(s.page)));total++;}
        results.append(grid);
      }
      if(!total)results.append(safeText("p","fr-help","No matching printed-page headings."));
    };
    field.addEventListener("input",render);render();field.focus();
  }
  const searchData=sections.map(s=>({page:s.page,title:s.title,paragraphs:s.paras.map(node=>({node,text:node.textContent||""}))}));
  function normalize(t) {
    return String(t||"").normalize("NFKD").replace(/[\u0300-\u036f\u064b-\u065f]/g,"").toLocaleLowerCase();
  }
  function snippet(text,index,span) {
    const start=Math.max(0,index-65),end=Math.min(text.length,index+span+95);
    return (start?"…":"")+text.slice(start,end).replace(/\s+/g," ")+(end<text.length?"…":"");
  }
  function openSearch() {
    const body=panel("Search · complete English introduction","search");
    const field=input("Search the full translated introduction","Search for a word or phrase…");
    const hint=safeText("p","fr-help","Searches all 128 English page units; it does not search the separate Arabic excerpts or editorial notes.");
    const results=safeText("div","fr-results");
    body.append(field,hint,results);
    const render=()=>{
      const query=field.value.trim();results.replaceChildren();
      if(query.length<2){results.append(safeText("p","fr-help","Enter at least two characters to search."));return;}
      const q=normalize(query),matches=[];
      for(const p of searchData){
        for(const para of p.paragraphs){
          const index=normalize(para.text).indexOf(q);
          if(index>=0){matches.push({page:p.page,node:para.node,text:para.text,index});break;}
        }
      }
      hint.textContent=matches.length+" matching page"+(matches.length===1?"":"s")+" · showing up to 60";
      for(const x of matches.slice(0,60))results.append(resultButton("Beirut p. "+x.page,snippet(x.text,x.index,query.length),()=>jump(x.page,x.node)));
      if(!matches.length)results.append(safeText("p","fr-help","No matching passage found in the English working draft."));
    };
    field.addEventListener("input",render);render();field.focus();
  }
  function openBookmarks() {
    const body=panel("Saved reading places","bookmarks");
    const help=safeText("p","fr-help","Saved only in this browser. Bookmarks and your last page are not sent to a server.");
    body.append(help);
    body.append(resultButton("Resume at p. "+preferences.lastPage,"Last page reached in the introduction",()=>jump(preferences.lastPage)));
    for(const n of [...preferences.bookmarks].sort((a,b)=>a-b))
      body.append(resultButton("★ Beirut p. "+n,sections[n-18].title,()=>jump(n)));
    if(!preferences.bookmarks.length)body.append(safeText("p","fr-help","No saved pages yet. Select “Save” in the bottom reading bar."));
  }
  function openSources() {
    const body=panel("Source and textual apparatus · p. "+current,"sources");
    body.append(safeText("p","fr-help","The running English is a working translation. These links and notes provide the exact supplied source provenance; some later-page links lead to a derivative transcription, not a photographed printing."));
    const li=$("apparatus-p"+current);
    const div=safeText("div","fr-source-details");
    if(li){const clone=li.cloneNode(true);clone.removeAttribute("id");div.append(clone);}
    else div.append(safeText("p",null,"No source entry for this page."));
    const checking=safeText("a",null,"See selected bilingual source checks for page "+current);
    checking.href="critical-edition.html?page="+current;div.append(checking);
    body.append(div);
    const choose=safeText("button","fr-result");
    choose.type="button";choose.textContent="Browse sources for another page";
    choose.addEventListener("click",openContents);
    body.append(choose);
  }
  async function copyCitation() {
    const title="Saʿīd al-Dīn al-Farghānī, Muntahā al-madārik, introduction, Beirut 2007 printed p. "+current+" (GNAMMA working English translation)";
    const url=new URL("continuous-translation.html#b2007-p"+current,location.href).href;
    const cite=title+". "+url;
    try {
      if(!navigator.clipboard?.writeText)throw new Error("No clipboard");
      await navigator.clipboard.writeText(cite);
      toast("Citation copied · p. "+current);
    } catch (_) { window.prompt("Copy citation",cite); }
  }
  function savePage() {
    if(preferences.bookmarks.includes(current))preferences.bookmarks=preferences.bookmarks.filter(n=>n!==current);
    else preferences.bookmarks.push(current);
    toast(preferences.bookmarks.includes(current)?"Saved p. "+current:"Removed p. "+current);
    markCurrent(current);
  }
  function focus(on) {
    document.body.classList.toggle("fr-focus",on);
    $("fr-focus").setAttribute("aria-pressed",String(on));
    if(on){closePanel();toast("Focus reading · Esc to exit");}
    requestProgress();
  }
  $("fr-contents-open").addEventListener("click",openContents);
  $("fr-search-open").addEventListener("click",openSearch);
  $("fr-bookmarks-open").addEventListener("click",openBookmarks);
  $("fr-source-open").addEventListener("click",openSources);
  $("fr-close").addEventListener("click",closePanel);
  $("fr-panel").addEventListener("close",()=>{activeDialog="";});
  $("fr-font-down").addEventListener("click",()=>{preferences.scale=Math.max(.85,Math.round((preferences.scale-.05)*100)/100);applyPreferences();requestProgress();});
  $("fr-font-up").addEventListener("click",()=>{preferences.scale=Math.min(1.5,Math.round((preferences.scale+.05)*100)/100);applyPreferences();requestProgress();});
  $("fr-theme").addEventListener("click",()=>{const all=["parchment","horizon","night"];preferences.theme=all[(all.indexOf(preferences.theme)+1)%all.length];applyPreferences();});
  $("fr-wide").addEventListener("click",()=>{preferences.wide=!preferences.wide;applyPreferences();requestProgress();});
  $("fr-markers").addEventListener("click",()=>{preferences.markers=!preferences.markers;applyPreferences();requestProgress();});
  $("fr-focus").addEventListener("click",()=>focus(!document.body.classList.contains("fr-focus")));
  $("fr-exit-focus").addEventListener("click",()=>focus(false));
  $("fr-print").addEventListener("click",()=>window.print());
  $("fr-prev").addEventListener("click",()=>jump(current-1));
  $("fr-next").addEventListener("click",()=>jump(current+1));
  $("fr-save").addEventListener("click",savePage);
  $("fr-copy").addEventListener("click",copyCitation);
  addEventListener("scroll",requestProgress,{passive:true});
  addEventListener("resize",requestProgress,{passive:true});
  addEventListener("hashchange",()=>{const match=location.hash.match(/^#b2007-p(\d+)$/);if(match)markCurrent(Number(match[1]));requestProgress();});
  document.addEventListener("keydown",ev=>{
    if(ev.key==="Escape" && document.body.classList.contains("fr-focus")){focus(false);return;}
    if($("fr-panel").open)return;
    const active=document.activeElement;
    if(active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName))return;
    if(ev.key==="/"||((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==="k")){ev.preventDefault();openSearch();}
    if(ev.altKey && ev.key==="ArrowRight"){ev.preventDefault();jump(Math.min(last,current+1));}
    if(ev.altKey && ev.key==="ArrowLeft"){ev.preventDefault();jump(Math.max(18,current-1));}
  });
  document.documentElement.classList.add("fr-ready");
  applyPreferences();
  requestProgress();
  // Initial direct page anchor is respected. Returning visitors are offered Resume, never auto-scrolled.
  const hashMatch=location.hash.match(/^#b2007-p(\d+)$/);
  if(hashMatch)markCurrent(Number(hashMatch[1]));
  else markCurrent(18,false);
})();
