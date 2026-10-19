(()=>{"use strict";
const tag=document.currentScript,book=tag?.dataset.book||location.pathname,key="gnamma:background:"+book;
const saved=()=>{try{return localStorage.getItem(key)==="gnamma"?"gnamma":"native"}catch{return"native"}};
const set=(value)=>{document.documentElement.dataset.gnBg=value;try{localStorage.setItem(key,value)}catch{};const menu=document.getElementById("gn-appearance-menu");if(menu)menu.querySelectorAll("[data-appearance]").forEach(x=>{x.setAttribute("aria-checked",String(x.dataset.appearance===value))})};
set(saved());
function init(){
const target=document.getElementById("p-mode");if(!target)return;
const btn=document.createElement("button");btn.id="gn-appearance-toggle";btn.type="button";btn.textContent="◐";btn.title="Reading appearance";btn.setAttribute("aria-label","Reading appearance");btn.setAttribute("aria-expanded","false");target.before(btn);
const menu=document.createElement("div");menu.id="gn-appearance-menu";menu.hidden=true;menu.setAttribute("role","group");menu.setAttribute("aria-label","Reading background");
menu.innerHTML='<div class="gn-appearance-head">Reading appearance</div><button type="button" data-appearance="native" role="radio">Native book theme</button><button type="button" data-appearance="gnamma" role="radio">Gnamma landscape</button>';
document.body.appendChild(menu);
const close=()=>{menu.hidden=true;btn.setAttribute("aria-expanded","false")};
btn.addEventListener("click",()=>{menu.hidden=!menu.hidden;btn.setAttribute("aria-expanded",String(!menu.hidden));set(saved())});
menu.querySelectorAll("[data-appearance]").forEach(x=>x.addEventListener("click",()=>{set(x.dataset.appearance);close()}));
document.addEventListener("pointerdown",e=>{if(!menu.contains(e.target)&&e.target!==btn)close()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();