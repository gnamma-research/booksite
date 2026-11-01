/* Taqrīb al-Marām reading desk · 2026-11-02
   Independent project: Sanandajī sharḥ + attributed / unattributed margins.
   Do NOT merge Tahdhīb matn into this dataset; separately cited lemmata only. */
(()=>{"use strict";
const book=window.GNAMMA_BOOK;
if(!book || book.id!=="taqrib")return;
const $=id=>document.getElementById(id);
const main=$("readings"),toc=$("toc"),search=$("search"),count=$("count");
const state={lang:"both",order:"en-first",mode:"continuous",scope:"all",layers:{sharh:true,matn:false,wasim:true,margins:false,editorial:false},focus:0};
const K="gnamma:taqrib:reader:v1";
function retrieve(){try{const x=JSON.parse(localStorage.getItem(K)||"null");if(x){if(["both","en","ar"].includes(x.lang))state.lang=x.lang;if(["en-first","ar-first"].includes(x.order))state.order=x.order;if(["continuous","focus"].includes(x.mode))state.mode=x.mode;if(["all","selection","page-draft"].includes(x.scope))state.scope=x.scope;for(const k of Object.keys(state.layers))if(typeof x.layers?.[k]==="boolean")state.layers[k]=x.layers[k];}}catch(e){}}
function save(){try{localStorage.setItem(K,JSON.stringify(state))}catch(e){}}
const el=(tag,cls,str)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(str!==undefined)n.textContent=str;return n;};
function cite(u){return u.citation || u.statusText || (u.page?"Taqrīb al-Marām, vol. "+(u.volume||"I")+", printed p. "+u.page+" · facsimile PDF p. "+u.pdf:"Source location not yet certified");}
function pageOf(u){if(Number.isInteger(u.page))return u.page;const s=[u.citation,u.statusText,u.id].filter(Boolean).join(" ");const m=s.match(/\bI\s*:\s*(\d{1,3})\b/);if(m)return +m[1];const n=s.match(/(?:printed\s+pp?\.?\s*)(\d{1,3})/i);return n?+n[1]:9999;}
function kind(u){return u.category==="page-draft"?"page-draft":"selection"}
function sourceRecords(){return (book.units||[]).map((u,i)=>({...u,page:pageOf(u),category:kind(u),_index:i}));}
let records=sourceRecords();
function parsePageDrafts(markdown){const chunks=markdown.split(/(?=^### I:\d+\s*·\s*Arabic scan p\.)/m),out=[];
 for(const chunk of chunks){const h=chunk.match(/^### I:(\d+)\s*·\s*Arabic scan p\.\s*(\d+)/);if(!h)continue;
  const p=+h[1],pdf=+h[2];const rest=chunk.slice(h[0].length);
  const en=rest.split(/\n\*\*Explanation:\*\*/)[0].trim().replace(/\n\s*\n/g,"\n\n").replace(/\s*\n\s*/g," ");
  if(!en)continue;const note=(rest.match(/\*\*Explanation:\*\*([\s\S]*?)$/)||[])[1]||"";
  out.push({id:"P1."+String(p).padStart(3,"0"),title:"Working page rendering · I:"+p,
   page:p,pdf,arabic:"",english:en,category:"page-draft",quality:"interpretive-page-draft",
   citation:"Taqrīb al-Marām I:"+p+" · scan PDF p. "+pdf+" · recovered Stage 31 English page-level interpretive draft",
   notes:[{type:"Method",text:"This is an existing compressed interpretive page draft, NOT a complete clause-for-clause translation. The Arabic page has not been fully transcribed."},...(note?[{type:"Explanation",text:note.trim()}]:[])]});}
 return out;
}
function safeText(u){return [u.id,u.title,u.arabic,u.english,cite(u),...(u.notes||[]).map(n=>n.text),...(u.layers?.margins||[]).map(x=>(x.arabic||"")+" "+(x.english||"")),...(u.layers?.wasim||[]).map(x=>(x.arabic||"")+" "+(x.english||"")),(u.layers?.matn?.arabic||""),(u.layers?.matn?.english||"")].join(" ").toLocaleLowerCase();}
function order(){const pos=u=>(u.volume==="II"?1000:0)+u.page;return records.slice().sort((a,b)=>pos(a)-pos(b) || (a.category==="selection"?-1:1)-(b.category==="selection"?-1:1) || a._index-b._index);}
function eligible(){const q=search.value.trim().toLocaleLowerCase();return order().filter(u=>(state.scope==="all"||u.category===state.scope)&&(!q||safeText(u).includes(q)));}
function controlSync(){document.querySelectorAll("[data-lang]").forEach(b=>b.setAttribute("aria-pressed",String(state.lang===b.dataset.lang)));
 document.querySelectorAll("[data-layer]").forEach(b=>b.setAttribute("aria-pressed",String(state.layers[b.dataset.layer])));
 document.querySelectorAll("[data-scope]").forEach(b=>b.setAttribute("aria-pressed",String(state.scope===b.dataset.scope)));
 document.querySelectorAll("[data-mode]").forEach(b=>b.setAttribute("aria-pressed",String(state.mode===b.dataset.mode)));
 const swap=$("taqrib-swap");if(swap){swap.textContent=state.order==="en-first"?"English left · Arabic right":"Arabic left · English right";swap.setAttribute("aria-pressed",String(state.order==="ar-first"));}
 const th=$("theme");if(th){const dark=document.documentElement.dataset.theme==="dark";th.textContent=dark?"Light appearance":"Dark appearance";th.setAttribute("aria-pressed",String(dark));}
 }
function bilingual(ar,en,placeholder){const box=el("div","reading");
 const a=el("div","arabic"),e=el("div","english");a.lang="ar";a.dir="rtl";e.lang="en";
 a.append(el("p",!ar?"missing-text":"",ar||"النص العربي لهذه الصفحة لم يُنسخ بعد."));
 e.append(el("p",!en?"missing-text":"",en||placeholder||"English translation not yet available."));
 box.append(e,a);return box;}
function layerBlock(title,subtitle,ar,en,cls){const block=el("section","layer-block "+(cls||""));
 const head=el("div","layer-head");head.append(el("strong","",title),el("small","",subtitle||""));block.append(head,bilingual(ar,en));return block;}
function article(u){const card=el("article","unit taqrib-unit");card.id="u-"+u.id.replaceAll(".","-");
 const head=el("header","taqrib-unit-heading");head.append(el("span","unit-id",u.id),el("h3","",u.title));head.append(el("p","unit-status",cite(u)));card.append(head);
 if(u.category==="page-draft"){head.append(el("p","quality-flag","Page-level English working draft; not a continuous verified translation"));}
 else head.append(el("p","quality-flag",u.quality==="first-pass-image"?"New image-inspected interpretive first pass; not a literal complete-page edition":u.quality==="source-matched-wasim"?"Wasīm fragment · print image + independent attribution · not critical certification":"Selected source excerpt; omissions may remain"));
 const layers=u.layers||{};let shown=0;
 if(state.layers.matn&&layers.matn){card.append(layerBlock("Quoted Tahdhīb lemma","Embedded quotation only — NOT the independent Tahdhīb edition",layers.matn.arabic,layers.matn.english,"matn-layer"));shown++;}
 if(state.layers.sharh && (u.arabic||u.english)){card.append(layerBlock("Sanandajī · sharḥ",u.sharhCitation || (u.category==="page-draft"?(u.quality==="first-pass-image"?"Image-inspected partial page account; NOT a continuous translation":"Recovered English interpretive page draft; Arabic not fully transcribed"):"Running commentary / identifiable selected passage"),u.arabic,u.english,"sharh-layer"));shown++;}
 if(state.layers.wasim && Array.isArray(layers.wasim) && layers.wasim.length){for(const n of layers.wasim){card.append(layerBlock("Wasīm · Ḥāshiyat al-Muḥākamāt","Independent attribution documented · "+(n.citation||cite(u)),n.arabic,n.english,"wasim-layer"));shown++;}}
 if(state.layers.margins && Array.isArray(layers.margins) && layers.margins.length){for(const n of layers.margins){card.append(layerBlock("Printed lower-register gloss · AUTHOR UNCONFIRMED",n.kind||"First-pass editorial guide; no claim of Wasīm authorship",n.arabic,n.english,"margin-layer"));shown++;}}
 if(!shown)card.append(el("p","empty-layer","No text in the currently enabled layers on this page. Turn on the sharḥ or another available layer."));
 if(state.layers.editorial&&(u.notes||[]).length){const details=el("details","editorial-notes");const sum=el("summary","", "Editorial and explanatory notes ("+u.notes.length+")");const list=el("ol");for(const note of u.notes){const li=el("li");li.append(el("strong","",note.type+" · "),document.createTextNode(note.text));list.append(li)}details.append(sum,list);card.append(details);}
 const foot=el("div","taqrib-card-foot");const citation=el("small","",cite(u));foot.append(citation);const copy=el("button","copy-cite","Copy citation");copy.type="button";copy.addEventListener("click",()=>{const s=((u.layers?.wasim?.length && !u.english)?"Muḥammad Wasīm al-Kurdistānī, Ḥāshiyat al-Muḥākamāt":"Taqrīb al-Marām + associated commentary layers")+", "+cite(u)+", Gnamma working reader (accessed "+new Date().toISOString().slice(0,10)+").";if(navigator.clipboard?.writeText){navigator.clipboard.writeText(s).then(()=>{copy.textContent="Copied"}).catch(()=>{copy.textContent="Copy unavailable"})}else copy.textContent="Copy unavailable";});foot.append(copy);card.append(foot);
 return card;}
function render(){const selected=eligible();state.focus=Math.max(0,Math.min(state.focus,selected.length-1));main.replaceChildren();toc.replaceChildren();
 const shown=state.mode==="focus"?selected.slice(state.focus,state.focus+1):selected;
 let last="";
 for(const u of shown){const group=u.page<9999?(u.volume==="II"?"II":"I")+" · Printed "+(u.volume==="II"?"gloss/commentary":"commentary")+" / p. "+(Math.floor((u.page-1)/25)*25+1)+"–"+(Math.floor((u.page-1)/25)*25+25):"Unlocated selections";
 if(group!==last){last=group;main.append(el("h2","chapter",group));}main.append(article(u));}
 // Contents follows all eligible passages, not only the focused item.
 for(let i=0;i<selected.length;i++){const u=selected[i],li=el("li"),a=el("a","",u.id+" · "+(u.page<9999?(u.volume==="II"?"II:":"I:")+u.page+" · ":"")+u.title);a.href="#u-"+u.id.replaceAll(".","-");a.addEventListener("click",ev=>{if(state.mode==="focus"){ev.preventDefault();state.focus=i;render()}toc.classList.remove("open")});li.append(a);toc.append(li)}
 if(!selected.length)main.append(el("p","", "No passages match these filters."));
 main.className="lang-"+state.lang;main.dataset.order=state.order;
 const c=selected.length;count.textContent=c+" records · 153/615 numbered pages have SOME preliminary English (24.88% page-presence only; NOT text translated) · Wasīm: 1 source-matched fragment; total unit count not yet established · critically complete pages: 0";
 const nav=$("taqrib-navigation");if(nav){nav.hidden=state.mode!=="focus";$("taqrib-position").textContent=selected.length?(state.focus+1)+" / "+selected.length:"0 / 0";$("taqrib-prev").disabled=state.focus===0;$("taqrib-next").disabled=state.focus>=selected.length-1;}
 controlSync();}
function bind(){search.addEventListener("input",()=>{state.focus=0;render()});$("toc-toggle").addEventListener("click",()=>{const open=toc.classList.toggle("open");$("toc-toggle").setAttribute("aria-expanded",String(open));});
 document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>{state.lang=b.dataset.lang;save();render()}));
 document.querySelectorAll("[data-layer]").forEach(b=>b.addEventListener("click",()=>{state.layers[b.dataset.layer]=!state.layers[b.dataset.layer];save();render()}));
 document.querySelectorAll("[data-scope]").forEach(b=>b.addEventListener("click",()=>{state.scope=b.dataset.scope;state.focus=0;save();render()}));
 document.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>{state.mode=b.dataset.mode;state.focus=0;save();render()}));
 $("taqrib-swap").addEventListener("click",()=>{state.order=state.order==="en-first"?"ar-first":"en-first";save();render()});
 $("taqrib-prev").addEventListener("click",()=>{state.focus=Math.max(0,state.focus-1);render();$("readings").scrollIntoView({block:"start"})});
 $("taqrib-next").addEventListener("click",()=>{state.focus=Math.min(eligible().length-1,state.focus+1);render();$("readings").scrollIntoView({block:"start"})});
 const theme=$("theme");theme.addEventListener("click",()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==="dark"?"light":"dark";try{localStorage.setItem("gnamma:taqrib:dark",document.documentElement.dataset.theme)}catch(e){}controlSync()});
 try{document.documentElement.dataset.theme=localStorage.getItem("gnamma:taqrib:dark")||"light"}catch(e){}
}
retrieve();bind();render();
fetch("editorial/2026-10-31_recovered_I13-I62_english_working.md").then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.text()}).then(md=>{
 const pages=parsePageDrafts(md);records.push(...pages);render();
 const status=$("taqrib-import-status");if(status)status.textContent="Recovered English working pages loaded: "+pages.length+" (I:13–62). Arabic transcription and full critical collation remain pending.";
}).catch(e=>{const status=$("taqrib-import-status");if(status)status.textContent="Existing page-draft file could not load ("+e.message+"); the checked selections remain readable.";});
if(location.hash){const id=decodeURIComponent(location.hash.slice(1));requestAnimationFrame(()=>{if(id.startsWith("u-"))document.getElementById(id)?.scrollIntoView()})}
})();