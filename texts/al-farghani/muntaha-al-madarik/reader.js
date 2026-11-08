/* GNAMMA Farghānī — deliberately small, source-based reader.
 * No automatic text is manufactured. Only the verified FARGHANI_UNITS are displayed.
 */
(() => {
  "use strict";
  const units = Array.isArray(window.FARGHANI_UNITS) ? window.FARGHANI_UNITS : [];
  const $ = id => document.getElementById(id);
  const body = document.body;
  const root = document.documentElement;
  const storeKey = "gnamma-farghani-muntaha-v1";
  let current = Math.max(0, units.findIndex(u => "#" + u.id === location.hash));
  let bookmarks = [];
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(storeKey) || "{}") || {};
    bookmarks = Array.isArray(saved.bookmarks) ? saved.bookmarks.filter(x=>units.some(u=>u.id===x)) : [];
  } catch (_) { saved = {}; }
  const preferences = {
    language: ["ar","en","both"].includes(saved.language) ? saved.language : "both",
    notes: saved.notes !== false,
    compare: saved.compare === true,
    continuous: saved.continuous === true,
    theme: ["parchment","horizon","night"].includes(saved.theme) ? saved.theme : "parchment",
    focus: 0,
    scale: Number(saved.scale) >= .8 && Number(saved.scale) <= 1.5 ? Number(saved.scale) : 1
  };
  function persist() {
    try {
      localStorage.setItem(storeKey, JSON.stringify({
        bookmarks, language:preferences.language, notes:preferences.notes,
        compare:preferences.compare, continuous:preferences.continuous,
        theme:preferences.theme, scale:preferences.scale
      }));
    } catch (_) { /* Storage may be blocked in private mode. */ }
  }
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  function link(text,href,cls) {
    const a = el("a",cls,text);
    a.href=href;
    if (/^https?:/.test(href)) { a.target="_blank"; a.rel="noopener noreferrer"; }
    return a;
  }
  function apply() {
    root.dataset.theme=preferences.theme;
    root.style.setProperty("--scale", String(preferences.scale));
    body.dataset.language=preferences.language;
    body.dataset.showNotes=String(preferences.notes);
    body.dataset.compare=String(preferences.compare);
    body.dataset.continuous=String(preferences.continuous);
    body.dataset.focus=String(preferences.focus);
    $("lang-ar").setAttribute("aria-pressed", String(preferences.language !== "en"));
    $("lang-en").setAttribute("aria-pressed", String(preferences.language !== "ar"));
    $("notes-button").setAttribute("aria-pressed", String(preferences.notes));
    $("compare-button").setAttribute("aria-pressed", String(preferences.compare));
    $("continuous-button").setAttribute("aria-pressed", String(preferences.continuous));
    $("continuous-button").textContent=preferences.continuous ? "One extract" : "Continuous";
    $("focus-button").textContent=["Focus: normal","Focus: reading","Focus: deep"][preferences.focus];
  }
  function makeUnit(u) {
    const article=el("article","reading-block");
    article.id=u.id;
    const meta=el("div","section-meta");
    meta.append(el("span","small-pill",u.id),el("span",null,"Foundation I · p. "+u.page),el("span",null,u.topic));
    meta.append(link("Arabic source ↗",u.sourceUrl,"source-link"));
    article.append(meta,el("h3",null,u.title));
    const pair=el("div","text-pair");
    const ar=el("div","ar");
    ar.lang="ar"; ar.dir="rtl";
    const arLabel=el("span","text-label","Arabic · authorial extract");
    const arText=el("p",null,u.ar);
    arText.lang="ar"; arText.dir="rtl";
    ar.append(arLabel,arText);
    const en=el("div","en");
    en.lang="en";
    en.append(el("span","text-label","English · new working translation"),el("p",null,u.en));
    pair.append(ar,en);
    article.append(pair);
    article.append(el("p","extract-disclaimer","Selected matching clause, not a complete printed-page translation. Open the linked source for surrounding text."));
    const note=el("aside","research-note");
    note.append(el("strong",null,"Textual / conceptual note"),el("div",null,u.note));
    article.append(note);
    const comp=el("aside","comparison-note");
    comp.append(el("strong",null,"Comparative research question — not Farghānī’s text"),el("div",null,u.compare));
    article.append(comp);
    return article;
  }
  function setCurrent(index, scroll=true) {
    current=Math.min(Math.max(index,0),units.length-1);
    const u=units[current]; if(!u)return;
    if(location.hash!=="#"+u.id) history.replaceState(null,"","#"+u.id);
    render();
    if(scroll) $("reading").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function render() {
    apply();
    const list=$("reading-list");
    list.replaceChildren();
    if(!units.length) {
      list.append(el("p","untranslated","Source corpus is unavailable. Consult editorial/STATUS.md and the printed Arabic source."));
      return;
    }
    if(preferences.continuous) {
      const frag=document.createDocumentFragment();
      units.forEach(u=>frag.append(makeUnit(u)));
      list.append(frag);
    } else {
      list.append(makeUnit(units[current]));
    }
    const u=units[current];
    $("current-heading").textContent=preferences.continuous ? "Continuous extracts · Foundation I" : u.title;
    $("source-status").textContent=preferences.continuous ? units.length+" separate excerpts, not continuous page coverage" : "Source page "+u.page+" · independently translated selection";
    $("location-title").textContent=preferences.continuous ? "All "+units.length+" extracts" : u.id+" · "+u.title;
    $("location-source").textContent=preferences.continuous ? "Arabic and English" : "Page "+u.page+" · "+u.topic;
    $("prev").disabled=preferences.continuous||current<=0;
    $("next").disabled=preferences.continuous||current>=units.length-1;
    $("prev-label").textContent=current>0?units[current-1].id:"—";
    $("next-label").textContent=current<units.length-1?units[current+1].id:"—";
    $("bookmark-button").textContent=bookmarks.includes(u.id)?"★ Saved":"☆ Save";
    $("reading-status").textContent=(current+1)+"/"+units.length+" selections · not complete";
    persist();
  }
  function showToast(message) {
    const t=$("toast");
    t.textContent=message;
    t.classList.add("visible");
    clearTimeout(showToast.timer);
    showToast.timer=setTimeout(()=>t.classList.remove("visible"),1800);
  }
  function choose(u) { closeSheet(); preferences.continuous=false;setCurrent(units.indexOf(u)); }
  function closeSheet() {
    const s=$("sheet");
    if(s.open) s.close();
  }
  function openSheet(mode) {
    const sheet=$("sheet");
    $("sheet-title").textContent=mode==="contents"?"Contents":mode==="search"?"Search":mode==="settings"?"Reading settings":"Comparative guide";
    const place=$("sheet-content");
    place.replaceChildren();
    if(mode==="contents" || mode==="search") {
      const input=el("input","sheet-input");
      input.type="search";input.placeholder="Find Arabic, English, title, or page…";
      input.setAttribute("aria-label","Search text");
      place.append(input);
      const results=el("div","sheet-list");
      place.append(results);
      const fill=()=>{
        const q=input.value.trim().toLocaleLowerCase();
        results.replaceChildren();
        let shown=0;
        units.filter(u=>!q||[u.id,u.page,u.title,u.topic,u.ar,u.en,u.note].some(v=>String(v).toLocaleLowerCase().includes(q))).forEach(u=>{
          const row=el("div","sheet-result");
          const button=el("button",null,u.id+" · "+u.title);
          button.type="button";
          button.append(el("small",null,"p. "+u.page+" · "+u.topic+(bookmarks.includes(u.id)?" · ★ bookmarked":"")));
          if(u.id===units[current].id)button.classList.add("active");
          button.addEventListener("click",()=>choose(u));
          row.append(button);results.append(row);shown++;
        });
        if(!shown)results.append(el("p",null,"No matching extract. The un-translated rest of the book is not searchable here."));
      };
      input.addEventListener("input",fill);
      fill();
      sheet.showModal();
      if(mode==="search")input.focus();
      return;
    }
    if(mode==="settings") {
      const form=el("div");
      const addToggle=(text,key,fn)=>{
        const row=el("div","setting-row");
        const label=el("label");
        const cb=el("input");cb.type="checkbox";cb.checked=Boolean(preferences[key]);cb.addEventListener("change",()=>{preferences[key]=cb.checked;fn();render();});
        label.append(cb,document.createTextNode(" "+text));row.append(label);form.append(row);
      };
      addToggle("Show source and textual notes","notes",()=>{});
      addToggle("Show separate Guénon–Schuon comparisons","compare",()=>{});
      addToggle("Continuous scroll through all 32 selected extracts","continuous",()=>{});
      const scale=el("div","setting-row");
      scale.append(el("label",null,"Reading size "));
      const range=el("input");range.type="range";range.min=".8";range.max="1.5";range.step=".05";range.value=String(preferences.scale);
      range.addEventListener("input",()=>{preferences.scale=Number(range.value);apply();persist();});
      scale.append(range);form.append(scale);
      const status=el("div","setting-row");
      status.append(el("strong",null,"Editorial status"),el("p",null,"32 selected translation extracts across p. 18–32, with gaps; introduction not completed; no manuscript collation."));
      status.append(link("Detailed translation register","editorial/STATUS.md"));
      form.append(status);
      place.append(form);
    } else if(mode==="comparison") {
      const questions=[
        ["Beyond-Being and first determination","Do Farghānī's ranks correspond to Guénon's Beyond-Being and Being? The first determination is a barzakh of aḥadiyya and wāḥidiyya; it cannot simply be mapped by matching labels."],
        ["Absolute, Infinite, Perfect","Schuon's triad is comparable with Farghānī's essential and name-related perfections, but no source yet demonstrates their identity."],
        ["Unmanifestable possibility and fixed entities","The p. 23 concealed matters not yet determined at the second rank must be distinguished from intrinsically nonmanifestable possibilities."],
        ["Perfect Human and Muhammadan reality","Farghānī differentiates principial, cosmic, and Muhammadan comprehensiveness. An abstract 'Universal Man' may conceal the distinctions."],
        ["What is wujūd?","In p. 30–32, existence is linked to finding/presence at each rank; correspondence with Guénon's Existence has to be argued, not assumed."],
        ["Causation and created agency","Farghānī's 'giving by which realities find themselves' is not yet an articulated theory of intrinsic secondary causality."]
      ];
      place.append(el("p",null,"Research hypotheses, kept distinct from translated source."));
      for(const [title,desc] of questions){
        const details=el("details","setting-row");
        details.append(el("summary",null,title),el("p",null,desc));place.append(details);
      }
      place.append(link("Full comparative dossier","editorial/COMPARISON.md"));
    }
    sheet.showModal();
  }
  $("menu-button").addEventListener("click",()=>openSheet("contents"));
  $("location-button").addEventListener("click",()=>openSheet("contents"));
  $("search-button").addEventListener("click",()=>openSheet("search"));
  $("settings-button").addEventListener("click",()=>openSheet("settings"));
  $("sheet-close").addEventListener("click",closeSheet);
  $("prev").addEventListener("click",()=>setCurrent(current-1));
  $("next").addEventListener("click",()=>setCurrent(current+1));
  $("lang-ar").addEventListener("click",()=>{
    preferences.language=preferences.language==="both"?"en":"both";render();
  });
  $("lang-en").addEventListener("click",()=>{
    preferences.language=preferences.language==="both"?"ar":"both";render();
  });
  $("notes-button").addEventListener("click",()=>{preferences.notes=!preferences.notes;render();});
  $("compare-button").addEventListener("click",()=>{preferences.compare=!preferences.compare;render();});
  $("continuous-button").addEventListener("click",()=>{preferences.continuous=!preferences.continuous;render();});
  $("theme-button").addEventListener("click",()=>{
    const all=["parchment","horizon","night"];
    preferences.theme=all[(all.indexOf(preferences.theme)+1)%all.length];render();
  });
  $("focus-button").addEventListener("click",()=>{preferences.focus=(preferences.focus+1)%3;apply();});
  $("focus-recover").addEventListener("click",()=>{preferences.focus=0;apply();});
  $("bookmark-button").addEventListener("click",()=>{
    const id=units[current]?.id;
    if(!id)return;
    bookmarks=bookmarks.includes(id)?bookmarks.filter(x=>x!==id):[...bookmarks,id];
    render();showToast(bookmarks.includes(id)?"Bookmark saved on this device":"Bookmark removed");
  });
  $("start-button").addEventListener("click",()=>{preferences.continuous=false;render();$("reading").scrollIntoView({behavior:"smooth"});});
  $("read-all-button").addEventListener("click",()=>{preferences.continuous=true;render();$("reading").scrollIntoView({behavior:"smooth"});});
  $("open-compare").addEventListener("click",()=>openSheet("comparison"));
  window.addEventListener("hashchange",()=>{
    const index=units.findIndex(u=>location.hash==="#"+u.id);
    if(index>=0) {current=index;preferences.continuous=false;render();}
  });
  document.addEventListener("keydown",e=>{
    if($("sheet").open||e.target.matches("input,textarea,select"))return;
    if(e.key==="ArrowRight"&&!preferences.continuous&&current<units.length-1)setCurrent(current+1);
    if(e.key==="ArrowLeft"&&!preferences.continuous&&current>0)setCurrent(current-1);
  });
  render();
})();
