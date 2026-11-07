/* GNAMMA Arabic corpus reader · Source provenance first, no silent textual conjecture.
   Source catalogue: registry.json. Raw versions pinned to OpenITI release Git commit.
   Exact source Git blob checks performed after download; they do not establish critical collation. */
(() => {
  "use strict";
  const $=id=>document.getElementById(id);
  let registry=null,visible=[],current=null,units=[],pageIndex=0,rawLoaded=false,loadSerial=0;
  const PAGE_SIZE=48,cache=new Map();
  const state={science:"all",madhhab:"all",search:"",book:""};
  const scientNames={fiqh:"Fiqh / uṣūl",usul:"Uṣūl",hadith:"Hadith",tafsir:"Tafsīr",tasawwuf:"Taṣawwuf",philosophy:"Philosophy",arabic:"Arabic sciences",nahw:"Naḥw",sarf:"Ṣarf",balagha:"Balāgha",lugha:"Lexicography"};
  const safe=(s)=>String(s??"");
  const norm=s=>safe(s).normalize("NFKD").replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g,"").toLowerCase();
  const size=n=>n>=1e6?(n/1e6).toFixed(1)+" MB":Math.round(n/1024)+" KB";
  const bookById=id=>registry?.books.find(b=>b.id===id);
  const setStatus=(message,error=false)=>{const el=$("reader-status");el.textContent=message;el.classList.toggle("is-bad",error)};
  const urlParams=()=>new URLSearchParams(location.hash.slice(1));
  function setHash(replace=false){
    const p=new URLSearchParams();
    if(state.book)p.set("book",state.book);
    if(state.science!=="all")p.set("science",state.science);
    if(state.madhhab!=="all")p.set("madhhab",state.madhhab);
    if(pageIndex&&rawLoaded)p.set("page",String(pageIndex+1));
    const hash="#"+p.toString();
    if(location.hash!==hash){try{history[replace?"replaceState":"pushState"](null,"",hash)}catch{location.hash=hash}}
  }
  function restoreHash(){
    const p=urlParams(),science=p.get("science"),madhhab=p.get("madhhab");
    if($("science").querySelector('option[value="'+science+'"]'))state.science=science;
    if($("madhhab").querySelector('option[value="'+madhhab+'"]'))state.madhhab=madhhab;
    state.book=bookById(p.get("book"))?.id||"";
    $("science").value=state.science;$("madhhab").value=state.madhhab;
    updateMadhhabVisibility();
    if(state.book){selectBook(state.book,false);const pg=Number(p.get("page"));if(Number.isInteger(pg)&&pg>0)window._corpusRequestedPage=pg-1}
    else{document.body.classList.remove("has-reading");$("reading").hidden=true;$("empty").hidden=false}
    renderCatalogue();
  }
  function updateMadhhabVisibility(){$("madhhab-wrap").hidden=state.science!=="fiqh";}
  function match(b){
    if(state.science!=="all"&&!b.disciplines.includes(state.science))return false;
    if(state.science==="fiqh"&&state.madhhab!=="all"&&b.madhhab!==state.madhhab)return false;
    if(!state.search)return true;
    return norm([b.title,b.title_ar,b.author,b.id,b.openiti.book_uri,b.openiti.version_uri,...b.disciplines].join(" ")).includes(norm(state.search));
  }
  function renderCatalogue(){
    visible=registry.books.filter(match).sort((a,b)=>a.death_ah-b.death_ah||a.title.localeCompare(b.title));
    const list=$("books");list.replaceChildren();
    const frag=document.createDocumentFragment();
    for(const b of visible){
      const btn=document.createElement("button");btn.type="button";btn.className="bookcard";btn.dataset.book=b.id;btn.setAttribute("aria-current",String(state.book===b.id));
      const title=document.createElement("strong");title.textContent=b.title;
      const arabic=document.createElement("span");arabic.className="ar";arabic.lang="ar";arabic.dir="rtl";arabic.textContent=b.title_ar;
      const sub=document.createElement("small");sub.textContent=b.author+" · d. "+b.death_ah+" AH";
      const chips=document.createElement("span");chips.className="tags";
      const status=document.createElement("i");status.textContent=b.local_text?"Byte-matched GNAMMA copy":"OpenITI source";
      if(b.local_text)status.classList.add("is-local");chips.append(status);
      if(/UNCORRECTED|REDUNDANT_PARTS|PAGINATION|RANDOM_CHARS|proof.reading/i.test(b.openiti.quality_note)){
        const warn=document.createElement("i");warn.className="is-ocr";warn.textContent="Quality caution";chips.append(warn);
      }
      btn.append(title,arabic,sub,chips);frag.append(btn);
    }
    list.append(frag);
    $("counts").textContent=visible.length+" of "+registry.books.length+" source-attested versions · "+
      registry.books.filter(b=>b.local_text).length+" complete source files hosted by GNAMMA · no claim of manuscript collation";
  }
  function link(anchor,url){anchor.href=url;anchor.target="_blank";anchor.rel="noopener noreferrer"}
  function selectBook(id,push=true){
    const b=bookById(id);if(!b)return;
    loadSerial++;
    current=b;state.book=id;rawLoaded=false;units=[];pageIndex=0;
    document.body.classList.add("has-reading");
    $("reading").hidden=false;$("empty").hidden=true;
    $("record-code").textContent=b.openiti.book_uri+" · OpenITI version: "+b.openiti.version_uri;
    $("title").textContent=b.title;$("title-ar").textContent=b.title_ar;
    $("author").textContent=b.author+" · died "+b.death_ah+" AH";
    const categories=$("categories");categories.replaceChildren();
    [...b.disciplines,...(b.madhhab?[b.madhhab+" madhhab"]:[])].forEach(x=>{
      const t=document.createElement("span");t.textContent=scientNames[x]||x;categories.append(t)
    });
    const prov=$("provenance");prov.replaceChildren();
    const items=[
      ["Text provenance",b.local_text?"GNAMMA complete source-file mirror; byte-identical to OpenITI blob":"Full text available from pinned OpenITI release (loaded on demand)"],
      ["Edition/version",b.openiti.version_uri],
      ["Source identity","Git SHA-1: "+b.openiti.blob_sha],
      ["Size and licensing",size(b.openiti.size_bytes)+" · CC BY-NC-SA 4.0 · attribution OpenITI"],
      ["OpenITI review warning",b.openiti.quality_note],
      ["Verification boundary","File identity is recorded; no new collations against manuscripts or printed editions have been performed."]
    ];
    for(const [k,value] of items){const div=document.createElement("div");const strong=document.createElement("strong");strong.textContent=k+": ";div.append(strong,document.createTextNode(value));prov.append(div)}
    link($("source"),b.openiti.source_page);link($("metadata"),b.openiti.metadata_url);
    $("text-controls").hidden=true;$("arabic-body").replaceChildren();
    $("load").disabled=false;$("load").textContent="Read this full digitized version";
    setStatus((b.openiti.size_bytes>6e6?"Large source ("+size(b.openiti.size_bytes)+"): load only when needed. ":"")+
      "Source text has not yet been downloaded in this session.");
    renderCatalogue();
    if(push)setHash();
    if(matchMedia("(max-width:790px)").matches)$("reader").scrollIntoView({block:"start"});
  }
  async function gitBlobHash(text){
    if(!crypto?.subtle||!window.TextEncoder)throw new Error("In-browser integrity checking unavailable");
    const encoder=new TextEncoder(),data=encoder.encode(text),prefix=encoder.encode("blob "+data.length+"\u0000"),bytes=new Uint8Array(prefix.length+data.length);
    bytes.set(prefix);bytes.set(data,prefix.length);
    const sha=await crypto.subtle.digest("SHA-1",bytes);
    return [...new Uint8Array(sha)].map(b=>b.toString(16).padStart(2,"0")).join("");
  }
  function parseSource(raw){
    const marker="#META#Header#End#";let at=raw.indexOf(marker);
    if(at>=0)raw=raw.slice(at+marker.length);
    // The original format is preserved in the downloadable file; this is only a reading view.
    const result=[];let paragraph="";
    const flush=()=>{const p=paragraph.trim();if(p)result.push({type:"p",text:p});paragraph=""};
    for(const line of raw.split(/\r?\n/)){
      let value=line.trim();if(!value||value.startsWith("#META#")||value.includes("######OpenITI#"))continue;
      if(/^###/.test(value)){
        flush();value=value.replace(/^###\s*\|+\s*/,"").replace(/^###\s*/,"");if(value)result.push({type:"h",text:value});continue;
      }
      const page=value.match(/^(?:#\s*)?(PageV\d+P\d+)/);
      if(page){flush();result.push({type:"page",text:page[1]});continue;}
      if(value.startsWith("# ")){flush();paragraph=value.slice(2);continue}
      if(value.startsWith("~~")){paragraph+=" "+value.slice(2).trim();continue}
      if(value.startsWith("#")){flush();paragraph=value.replace(/^#+\s*/,"");continue}
      paragraph+=" "+value;
    }
    flush();
    return result;
  }
  function renderPage(){
    const reader=$("arabic-body");reader.replaceChildren();
    const start=pageIndex*PAGE_SIZE,end=Math.min(units.length,start+PAGE_SIZE);
    if(!units.length){reader.textContent="No readable text blocks found in this version.";return}
    const find=$("find-in-text").value.trim(),frag=document.createDocumentFragment();
    for(const u of units.slice(start,end)){
      const el=document.createElement(u.type==="h"?"h3":u.type==="page"?"span":"p");
      if(u.type==="page"){el.className="src-page";el.textContent=u.text;el.dir="ltr"}
      else if(find){
        const idx=u.text.indexOf(find);
        if(idx>=0){el.append(document.createTextNode(u.text.slice(0,idx)));
          const mark=document.createElement("mark");mark.textContent=u.text.slice(idx,idx+find.length);el.append(mark,document.createTextNode(u.text.slice(idx+find.length)))}
        else el.textContent=u.text;
      }else el.textContent=u.text;
      frag.append(el);
    }
    reader.append(frag);
    $("page-count").textContent=(pageIndex+1)+" / "+Math.ceil(units.length/PAGE_SIZE);
    $("previous").disabled=pageIndex===0;
    $("next").disabled=end>=units.length;
    setStatus("Git blob identity verified · "+units.length+" source reading blocks · showing blocks "+(start+1)+"–"+end+". Source page markers, where present, are not automatically printed-edition references.");
    setHash(true);
  }
  async function loadText(){
    if(!current)return;
    const b=current,seq=++loadSerial;
    $("load").disabled=true;setStatus("Fetching Arabic text and checking source identity…");
    try{
      let raw=cache.get(b.id);
      if(!raw){
        const target=b.local_text?new URL(b.local_text,location.href).href:b.openiti.source_url;
        const response=await fetch(target,{cache:"force-cache"});
        if(!response.ok)throw new Error("Source could not be retrieved (HTTP "+response.status+")");
        raw=await response.text();
        if(seq!==loadSerial)return;
        if(!raw.includes("######OpenITI#")||!/[\u0621-\u064a]/.test(raw))throw new Error("The response is not the expected Arabic OpenITI text");
        const sha=await gitBlobHash(raw);
        if(sha!==b.openiti.blob_sha)throw new Error("Source integrity check failed: blob identity does not match the registered OpenITI version");
        cache.set(b.id,raw);if(cache.size>2)cache.delete(cache.keys().next().value);
      }
      if(seq!==loadSerial)return;
      units=parseSource(raw);pageIndex=Math.max(0,Math.min(Math.ceil(units.length/PAGE_SIZE)-1,window._corpusRequestedPage||0));
      window._corpusRequestedPage=0;
      rawLoaded=true;$("text-controls").hidden=false;
      $("load").textContent="Version verified ✓";
      renderPage();
    }catch(error){
      if(seq!==loadSerial)return;
      setStatus("Could not open and verify this source: "+error.message+". Use Original source to view the pinned OpenITI file.",true);
      $("load").disabled=false;$("load").textContent="Try loading again";
    }
  }
  function findNext(){
    if(!rawLoaded)return;
    const query=norm($("find-in-text").value.trim());
    if(!query){setStatus("Enter the Arabic word or source page marker to find.");return}
    const first=(pageIndex+1)*PAGE_SIZE;
    let found=-1;
    for(let i=first;i<units.length;i++){if(norm(units[i].text).includes(query)){found=i;break}}
    if(found<0){for(let i=0;i<first;i++){if(norm(units[i].text).includes(query)){found=i;break}}}
    if(found<0){setStatus("No match in the loaded source text. Try an unvocalized spelling.");return}
    pageIndex=Math.floor(found/PAGE_SIZE);renderPage();
    const mark=$("arabic-body").querySelector("mark");(mark||$("arabic-body")).scrollIntoView({block:"start",behavior:"smooth"});
  }
  async function copyCitation(){
    if(!current)return;
    const firstPage=rawLoaded?units.slice(pageIndex*PAGE_SIZE,(pageIndex+1)*PAGE_SIZE).find(x=>x.type==="page"):null;
    const cite=current.author+", "+current.title+". OpenITI "+current.openiti.version_uri+
      (firstPage?" · digital marker "+firstPage.text:"")+
      ". OpenITI/RELEASE commit "+registry.source_commit+", Git blob "+current.openiti.blob_sha+
      ". "+current.openiti.source_page+" (machine-readable witness; inspect original edition before critical quotation).";
    try{await navigator.clipboard.writeText(cite);setStatus("Source citation copied with exact OpenITI version and blob identifier.")}
    catch{setStatus(cite)}
  }
  function registerEvents(){
    $("science").addEventListener("change",e=>{state.science=e.target.value;if(state.science!=="fiqh")state.madhhab="all";$("madhhab").value=state.madhhab;updateMadhhabVisibility();renderCatalogue();setHash(true)});
    $("madhhab").addEventListener("change",e=>{state.madhhab=e.target.value;renderCatalogue();setHash(true)});
    $("search").addEventListener("input",e=>{state.search=e.target.value;renderCatalogue()});
    $("clear").addEventListener("click",()=>{state.search="";state.science="all";state.madhhab="all";$("search").value="";$("science").value="all";$("madhhab").value="all";updateMadhhabVisibility();renderCatalogue();setHash(true)});
    $("books").addEventListener("click",e=>{const b=e.target.closest("[data-book]");if(b)selectBook(b.dataset.book)});
    $("back").addEventListener("click",()=>{document.body.classList.remove("has-reading");$("catalogue").scrollIntoView({block:"start"})});
    $("load").addEventListener("click",loadText);
    $("previous").addEventListener("click",()=>{if(pageIndex>0){pageIndex--;renderPage();$("arabic-body").scrollIntoView({block:"start"})}});
    $("next").addEventListener("click",()=>{if((pageIndex+1)*PAGE_SIZE<units.length){pageIndex++;renderPage();$("arabic-body").scrollIntoView({block:"start"})}});
    $("find-next").addEventListener("click",findNext);
    $("find-in-text").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();findNext()}});
    $("copy-citation").addEventListener("click",copyCitation);
    window.addEventListener("popstate",restoreHash);
    window.addEventListener("hashchange",restoreHash);
  }
  async function boot(){
    registerEvents();
    try{
      const res=await fetch("registry.json",{cache:"no-cache"});
      if(!res.ok)throw new Error("HTTP "+res.status);
      registry=await res.json();
      if(!Array.isArray(registry.books)||!registry.books.length||new Set(registry.books.map(x=>x.id)).size!==registry.books.length)throw new Error("Malformed or duplicate corpus registration");
      restoreHash();
    }catch(e){
      $("counts").textContent="Corpus registry could not be loaded: "+e.message+". Open the source register on GitHub for the exact version list.";
    }
  }
  boot();
})();