(()=>{"use strict";
const book=window.GNAMMA_KALAM_PAGES,source=window.GNAMMA_SANANDAJI_LAYER?.units||{};
if(!book?.pages?.length)return;
const $=id=>document.getElementById(id),pages=book.pages;
const found=location.hash.match(/^#p-(\d{1,3})$/);let current=found?Math.min(127,Math.max(15,+found[1])):15;
let commentary=false,explanatory=true;
const commentaryPages={"I.01":15,"I.02":15,"I.02a":16,"I.03":16,"I.06":17,"I.07":17,"II.01":17,"II.02":18,"II.03":18,"II.24":31,"IV.22":76,"V.20":93};
const byPage={};
for(const [key,items] of Object.entries(source)){const page=commentaryPages[key];if(!page)continue;(byPage[page]??=[]).push(...items);}
const make=(name,cls,txt)=>{const el=document.createElement(name);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el};
function rich(p,text){
 // Only allow bold and italic formatting. All other material becomes text, never HTML.
 const tokens=String(text).split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g);
 for(const v of tokens){if(v.startsWith("**")&&v.endsWith("**"))p.append(make("strong",null,v.slice(2,-2)));
 else if(v.startsWith("*")&&v.endsWith("*"))p.append(make("em",null,v.slice(1,-1)));
 else p.append(document.createTextNode(v));}
}
function listPages(){
 const query=$("page-search").value.toLocaleLowerCase().trim(),nav=$("page-list");nav.replaceChildren();let last="";
 const results=pages.filter(p=>!query||(p.title+" "+p.english+" "+p.page).toLocaleLowerCase().includes(query));
 for(const p of results){
  if(p.chapter!==last){last=p.chapter;nav.append(make("li","chapter-heading",last));}
  const li=make("li",p.page===current?"active":null);
  const link=make("a",null,"p. "+p.page+" · "+p.title);link.href="#p-"+p.page;
  link.addEventListener("click",e=>{e.preventDefault();current=p.page;draw();if(innerWidth<861)nav.classList.remove("open");});
  li.append(link);nav.append(li);
 }
 if(!results.length)nav.append(make("li",null,"No matching pages"));
 $("page-count").textContent=results.length+" / "+pages.length+" source pages";
}
function explanationPanel(p){
 const n=$("explanations");n.replaceChildren();n.hidden=!explanatory||!p.notes.length;
 if(n.hidden)return;
 n.append(make("h3",null,"Explanatory notes"));
 for(const note of p.notes){const box=make("section");box.append(make("strong",null,note.title),make("p",null,note.body));n.append(box);}
}
function commentaryPanel(p){
 const box=$("commentary-panel");box.replaceChildren();box.hidden=!commentary;
 if(!commentary)return;
 box.append(make("div","commentary-heading","Al-Sanandajī · Taqrīb al-Marām"));
 const a=byPage[p.page]||[];
 if(!a.length){box.append(make("p","scholium-explanation","No commentary extract has yet been aligned with this printed page."));
 const link=make("a","scholium-open","Read the separate Taqrīb translation");link.href="../../../al-sanandaji/taqrib-al-maram/";box.append(link);return;}
 for(const u of a){
  const el=make("section","scholium");el.append(make("h4",null,u.title));
  const src=(u.citation||"").replace(/^(Direct|Image-checked|Selective)[^·]*·\s*/i,"");if(src)el.append(make("div","scholium-source",src));
  if(u.english)el.append(make("p","scholium-english",u.english));
  if(u.arabic){const ar=make("p","scholium-arabic",u.arabic);ar.dir="rtl";ar.lang="ar";el.append(ar);}
  for(const note of u.insights||[]){if(/OCR|facsimile|collation|editorial|not yet|source-image/i.test(note))continue;el.append(make("p","scholium-explanation",note));}
  const link=make("a","scholium-open","Read context in Taqrīb");link.href="../../../al-sanandaji/taqrib-al-maram/#u-"+u.id.replaceAll(".","-");el.append(link);box.append(el);
 }
}
function draw(){
 const p=pages.find(x=>x.page===current);if(!p)return;
 $("page-id").textContent=p.chapter+" · 1912 page "+p.page;
 $("page-title").textContent=p.title;
 const target=$("translation");target.replaceChildren();
 for(const para of p.english.split(/\n\s*\n/).filter(Boolean)){const item=make("p");rich(item,para);target.append(item);}
 const url=book.sourcePdf+"#page="+p.page;$("arabic-link").href=url;$("citation").textContent="Tahdhīb al-Kalām · Cairo 1330/1912 · p. "+p.page;
 explanationPanel(p);commentaryPanel(p);
 $("previous").disabled=current===15;$("following").disabled=current===127;$("progress").textContent=(current-14)+" / 113";
 history.replaceState(null,"",location.pathname+location.search+"#p-"+current);
 listPages();
}
$("previous").addEventListener("click",()=>{current=Math.max(15,current-1);draw();window.scrollTo({top:0,behavior:"instant"})});
$("following").addEventListener("click",()=>{current=Math.min(127,current+1);draw();window.scrollTo({top:0,behavior:"instant"})});
$("page-search").addEventListener("input",listPages);
$("contents-toggle").addEventListener("click",()=>{const open=$("page-list").classList.toggle("open");$("contents-toggle").setAttribute("aria-expanded",String(open));});
$("commentary-mode").addEventListener("click",()=>{commentary=!commentary;$("commentary-mode").setAttribute("aria-pressed",String(commentary));$("commentary-mode").textContent=commentary?"Hide commentary":"Show commentary";commentaryPanel(pages.find(x=>x.page===current));});
$("explanation-mode").addEventListener("click",()=>{explanatory=!explanatory;$("explanation-mode").setAttribute("aria-pressed",String(explanatory));explanationPanel(pages.find(x=>x.page===current));});
$("appearance-mode").addEventListener("click",()=>{const dark=document.documentElement.dataset.theme==="dark";document.documentElement.dataset.theme=dark?"light":"dark";$("appearance-mode").setAttribute("aria-pressed",String(!dark));$("appearance-mode").textContent=dark?"Dark appearance":"Light appearance";});
window.addEventListener("hashchange",()=>{const m=location.hash.match(/^#p-(\d{1,3})$/);if(m){current=Math.min(127,Math.max(15,+m[1]));draw();}});
draw();
})();
