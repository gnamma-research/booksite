/* GNAMMA critical clause viewer — local data only, no network.
 * Status labels refer to a *single modern printed digital witness*, not manuscripts.
 */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const sources=[window.FARGHANI_CRITICAL_PASS_001,window.FARGHANI_CRITICAL_PASS_002,window.FARGHANI_CRITICAL_PASS_003].filter(Boolean);
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
const note=el("aside","audit-note");note.append(el("strong",null,"Editorial decision: "),document.createTextNode(x.critical_note));item.append(note);
return item;
}
function render(){
const page=$("page-select").value,disp=$("filter-select").value,q=$("query").value.trim().toLocaleLowerCase();
const filtered=rows.filter(x=>(page==="all"||String(x.page)===page)&&(disp==="all"||x.disposition===disp||disp==="revise"&&x.disposition==="corrected")&&(!q||[x.ar,x.en,x.critical_note,x.id].some(v=>v.toLocaleLowerCase().includes(q))));
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