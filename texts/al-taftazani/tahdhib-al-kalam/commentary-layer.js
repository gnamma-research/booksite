(()=>{"use strict";
const book=window.GNAMMA_BOOK,layer=window.GNAMMA_SANANDAJI_LAYER;
const toggle=document.querySelector("#commentary-toggle"),list=document.querySelector("#readings");
if(!book||!layer||!toggle||!list)return;
const content=layer.units||{};
let enabled=new URLSearchParams(location.search).get("layer")==="commentary";
const element=(tag,className,text)=>{const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e};
function currentId(node){return node.id.replace(/^u-/,"").replace(/^([A-Z]+)-/,"$1.")}
function addPassage(parent,p){
 const block=element("section","scholium");
 block.append(element("h4",null,p.title));
 const origin=(p.citation||"").replace(/^(Direct|Image-checked|Selective|Source-checked)[^·]*·\s*/i,"").trim();
 if(origin)block.append(element("div","scholium-source","Taqrīb al-Marām · "+origin));
 if(p.english)block.append(element("p","scholium-english",p.english));
 if(p.arabic){const arabic=element("p","scholium-arabic",p.arabic);arabic.dir="rtl";arabic.lang="ar";block.append(arabic);}
 for(const insight of p.insights||[]){if(/OCR|facsimile|direct image|collation|editorial process|unverified|page-image/i.test(insight))continue;block.append(element("p","scholium-explanation",insight))}
 const link=element("a","scholium-open","Open this passage in Taqrīb al-Marām");link.href="../../al-sanandaji/taqrib-al-maram/#u-"+p.id.replaceAll(".","-");block.append(link);
 parent.append(block);
}
function redraw(){
 toggle.setAttribute("aria-pressed",String(enabled));toggle.textContent=enabled?"Hide Sanandajī":"Sanandajī commentary";
 for(const article of list.querySelectorAll("article.unit")){
   article.querySelector(".commentary-extension")?.remove();
   if(!enabled)continue;
   const id=currentId(article),passages=content[id]||[];
   if(!passages.length)continue;
   const outer=element("section","commentary-extension");const heading=element("div","commentary-heading");
   heading.append(element("strong",null,"Taqrīb al-Marām"),element("span",null,passages.length+" linked translated "+(passages.length===1?"excerpt":"excerpts")));
   outer.append(heading);
   const details=element("details","commentary-details");
   details.open=passages.length===1;
   details.append(element("summary",null,"Read al-Sanandajī's explanation"));
   for(const p of passages)addPassage(details,p);
   outer.append(details);article.append(outer);
 }
}
toggle.addEventListener("click",()=>{
 enabled=!enabled;
 const url=new URL(location.href);enabled?url.searchParams.set("layer","commentary"):url.searchParams.delete("layer");
 history.replaceState(null,"",url.pathname+url.search+url.hash);redraw();
});
document.querySelector("#search")?.addEventListener("input",()=>requestAnimationFrame(redraw));
redraw();
})();
