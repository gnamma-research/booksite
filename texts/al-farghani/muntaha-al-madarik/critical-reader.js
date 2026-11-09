/* GNAMMA critical clause viewer — local data only, no network.
 * Source grades distinguish modern Beirut text, photographed 1876 print, and still-unexamined manuscripts.
 */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const sources=[window.FARGHANI_CRITICAL_PASS_001,window.FARGHANI_CRITICAL_PASS_002,window.FARGHANI_CRITICAL_PASS_003,window.FARGHANI_CRITICAL_PASS_004,window.FARGHANI_CRITICAL_PASS_005].filter(Boolean);
const rows=sources.flatMap(s=>s.records||[]);
let lang="both",notes=true;
function el(tag,className,text) {
 const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;
}
function open(source){const a=el("a",null,"Source · B2007 p."+source.page);a.href=source.source_url;a.target="_blank";a.rel="noopener noreferrer";return a;}
function clause(x){
const item=el("article","audit-clause");item.id=x.id;item.dataset.disposition=x.disposition;
const meta=el("h3");meta.append(el("span",null,x.id),el("span","audit-flag",x.disposition==="crux"?"Needs witness":x.disposition==="corrected"?"Recorded correction":x.disposition==="revise"?"Translation revised":x.disposition==="annotate"?"Source note":"Checked source"));meta.append(open(x));item.append(meta);
const pair=el("div","audit-text"),ar=el("p","ar",x.ar),en=el("p","en",x.en);ar.lang="ar";ar.dir="rtl";pair.append(ar,en);item.append(pair);
if(x.historical_print){const w=x.historical_print;const hist=el("aside","audit-witness");hist.append(el("strong",null,"Historical print I1876 p."+w.printed_page+" · PDF scan "+w.scan_index+" · "+(w.status==="historical-print-difference"?"Different reading":"Agreement")));const ar=el("p","ar",w.reading);ar.lang="ar";ar.dir="rtl";hist.append(ar,el("p",null,w.note));const link=el("a",null,"Original facsimile PDF");link.href=w.source_pdf;link.target="_blank";link.rel="noopener noreferrer";hist.append(link);if(x.edited_ar && x.edited_ar!==x.ar){const lab=el("p","audit-edited-label","Provisional edited Arabic:");lab.style.fontSize="11px";lab.style.fontWeight="600";const corrected=el("p","ar",x.edited_ar);corrected.lang="ar";corrected.dir="rtl";hist.append(lab,corrected);}
const found=String(w.scan_index||"").match(/[0-9]+/g)||[];
for(const scan of found){const photo=el("a",null," · Inspect photographed scan "+scan);photo.href=(w.hires?"facsimile-I1876-hires":"facsimile-I1876")+"/images/scan_"+String(scan).padStart(4,"0")+".jpg";photo.target="_blank";photo.rel="noopener noreferrer";hist.append(photo);}
if(found.length){const d=el("details","audit-photo-details"),summ=el("summary",null,"Show the photographed historical printing");d.append(summ);for(const scan of found){const a=el("a");a.href=(w.hires?"facsimile-I1876-hires":"facsimile-I1876")+"/images/scan_"+String(scan).padStart(4,"0")+".jpg";a.target="_blank";a.rel="noopener noreferrer";const img=el("img");img.src=a.href;img.loading="lazy";img.decoding="async";img.alt="I1876 historical printing, PDF scan "+scan;img.style.cssText="display:block;width:100%;max-width:550px;height:auto;margin:8px auto";a.append(img);d.append(a);}hist.append(d);}item.append(hist);}
const note=el("aside","audit-note");note.append(el("strong",null,"Editorial decision: "),document.createTextNode(x.critical_note));item.append(note);
return item;
}
function render(){
const page=$("page-select").value,disp=$("filter-select").value,q=$("query").value.trim().toLocaleLowerCase();
const filtered=rows.filter(x=>(page==="all"||String(x.page)===page)&&(disp==="all"||x.disposition===disp||disp==="revise"&&x.disposition==="corrected"||disp==="print"&&!!x.historical_print)&&(!q||[x.ar,x.en,x.critical_note,x.id].some(v=>v.toLocaleLowerCase().includes(q))));
const list=$("clauses");list.replaceChildren();let last=null;let group=null;
for(const x of filtered){if(last!==x.page){group=el("section","source-section");group.id="p"+x.page;const title=el("h2",null,"Beirut printed page "+x.page);title.append(el("small",null,x.page>=24?" · selected checked spans (not full-page collation)":" · modern printed digital source checked"));group.append(title);list.append(group);last=x.page;}group.append(clause(x))}
$("empty").style.display=filtered.length?"none":"block";
document.body.dataset.language=lang;document.body.dataset.showNotes=String(notes);
$("count").textContent=String(rows.length);$("pages").textContent=String([...new Set(rows.map(x=>x.page))].length);$("cruces").textContent=String(rows.filter(x=>x.disposition==="crux").length);
$("notes-button").setAttribute("aria-pressed",String(notes));$("lang-button").textContent=({both:"AR + EN",ar:"Arabic only",en:"English only"})[lang];
}
$("page-select").addEventListener("change",render);$("filter-select").addEventListener("change",render);$("query").addEventListener("input",render);
$("lang-button").addEventListener("click",()=>{lang=lang==="both"?"ar":lang==="ar"?"en":"both";render()});
$("notes-button").addEventListener("click",()=>{notes=!notes;render()});
render();
if(location.hash){const match=rows.find(x=>"#"+x.id===location.hash);if(match){$("page-select").value=String(match.page);render();document.getElementById(match.id)?.scrollIntoView({block:"start"});}}
})();