(() => {
"use strict";
const script=document.currentScript || document.querySelector('script[src$="gnamma-bottom.js"]');
if(!script)return;
const root=new URL("../",script.src);
const sections=["home","texts","essays","research","about"];
const paths={home:"",texts:"texts/",essays:"essays/",research:"research/",about:"about/"};
const glyphs={
home:'<path d="M3 10L12 3L21 10V21H15V14H9V21H3Z"/>',
texts:'<path d="M12 5C9 3 5 2 2 3V20C6 19 9.5 20 12 22C15 20 18 19 22 20V3C18 2 15 3 12 5Z"/><path d="M12 5V22"/>',
essays:'<path d="M6 3H18V21H6Z"/><path d="M9 8H15M9 12H15M9 16H13"/>',
research:'<path d="M12 3L4 9L12 15L20 9L12 3Z"/><path d="M3 15L12 21L21 15"/>',
about:'<path d="M12 3.5c-1.6 2.1-2.5 3.7-2.5 5a2.5 2.5 0 0 0 5 0c0-1.3-.9-2.9-2.5-5Z"/><ellipse cx="12" cy="16" rx="6.3" ry="2.25"/><path d="M3.5 19.5c2.35-1.35 5.2-2 8.5-2s6.15.65 8.5 2"/>'
};
const content={
texts:[
 {heading:"Uṣūl al-fiqh",items:[
 {name:"al-Mustaṣfā min ʿIlm al-Uṣūl",href:"texts/al-ghazali/al-mustasfa/"},
 {name:"al-Ḍarūrī fī Uṣūl al-Fiqh",href:"daruri/"}
 ]},
 {heading:"Tafsīr",items:[{name:"al-Baḥr al-Madīd",href:"texts/ibn-ajiba/al-bahr-al-madid/"}]},
 {heading:"Kalām",items:[{name:"Sharḥ al-Mawāqif",href:"texts/al-jurjani/sharh-al-mawaqif/"}]}
],
essays:[],
research:[{items:[
 {name:"Bidāyat al-Mujtahid · Edition I: Law and Legal Reasoning",href:"research/bidaya/law/"},
 {name:"Texts in Time · Islamic Intellectual Atlas",href:"research/intellectual-atlas/"}
]}],
about:[{items:[
 {name:"Purpose & approach",href:"about/purpose/"},
 {name:"Sources & editorial method",href:"docs/source-and-licenses.html"}
]}]
};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const href=slug=>new URL(slug,root).href;
function route(){
 let raw=decodeURIComponent(location.pathname);
 if(!raw.startsWith(root.pathname))return null;
 raw=raw.slice(root.pathname.length).replace(/^\/+|\/+$/g,"");
 return raw===""?"home":(sections.includes(raw)?raw:null);
}
const landing=route()!==null;
const relative=location.pathname.startsWith(root.pathname)?location.pathname.slice(root.pathname.length):"";
const ancestor=relative.split("/")[0];
let current=landing?route():(sections.includes(ancestor)?ancestor:"home");
const isAboutPage=route()==="about";
let open=landing&&current!=="home"&&!isAboutPage;
function make(tag,cls,value){
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(value!==undefined)n.textContent=value;
 return n;
}
const dock=make("nav","gn-bottom-dock");
dock.setAttribute("aria-label","Main navigation");
const panel=make("section","gn-bottom-panel");
panel.id="gn-bottom-panel";
panel.tabIndex=-1;
panel.setAttribute("aria-label","Selected section");
panel.hidden=true;
const links=new Map();
sections.forEach(section=>{
 const a=document.createElement("a");
 a.href=href(paths[section]);
 a.dataset.section=section;
 a.setAttribute("aria-label",cap(section));
 a.setAttribute("aria-controls","gn-bottom-panel");
 a.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+glyphs[section]+"</svg>";
 a.addEventListener("click",event=>{
  if(!landing||section==="about"||isAboutPage)return;
  event.preventDefault();
  if(section==="home" || (current===section&&open)){
    navigate("home");
  }else navigate(section);
 });
 links.set(section,a);dock.appendChild(a);
});
function render(section){
 panel.replaceChildren();
 panel.setAttribute("aria-label",cap(section)+" selection");
 const heading=make("h2","gn-bottom-title",cap(section));
 panel.appendChild(heading);
 const groups=content[section]||[];
 groups.forEach(group=>{
  const grouped=Boolean(group.heading);
  const outer=make("div",grouped?"gn-bottom-group":"gn-bottom-plain");
  let ul;
  if(grouped){
   outer.appendChild(make("h3","gn-bottom-group-title",group.heading));
   ul=make("ul");
   outer.appendChild(ul);
  }else{
   ul=make("ul","gn-bottom-plain");
   outer.appendChild(ul);
  }
  group.items.forEach((item,i)=>{
   const li=make("li");
   const a=make("a","gn-bottom-item");
   a.href=href(item.href);
   const marker=make("span",grouped?"gn-bottom-marker":"gn-bottom-index",grouped?"":String(i+1).padStart(2,"0"));
   marker.setAttribute("aria-hidden","true");
   a.appendChild(marker);
   a.appendChild(make("span","gn-bottom-item-label",item.name));
   li.appendChild(a);ul.appendChild(li);
  });
  panel.appendChild(outer);
 });
}
function sync(){
 links.forEach((a,s)=>{
  const active=s===current;
  if(active)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");
  a.setAttribute("aria-expanded",String(s===current&&open));
 });
 panel.hidden=!open;
 if(open)render(current);
}
function navigate(next,push=true){
 current=next;open=next!=="home";
 if(push){const target=href(paths[next]);if(location.href!==target)history.pushState({gnammaSection:next},"",target);}
 sync();
}
document.body.append(dock,panel);
document.body.classList.add("gn-bottom-ready");
if(landing)document.body.classList.add("gn-bottom-landing");
sync();
window.addEventListener("popstate",()=>{
 if(!landing)return;
 current=route()||"home";
 open=current!=="home";
 sync();
});
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&open&&landing)navigate("home");
});
document.addEventListener("pointerdown",e=>{
 if(!open||!landing)return;
 if(!dock.contains(e.target)&&!panel.contains(e.target))navigate("home");
});
})();
