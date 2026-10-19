(function(){"use strict";
var type=document.body.getAttribute("data-study")==="essay"?"essay":"research";
var data=window.GNAMMA_STUDIES&&window.GNAMMA_STUDIES[type],$=function(id){return document.getElementById(id)};
if(!data||!Array.isArray(data.chapters))return;
var index=0,chosen=new Set(),showAll=false,focused=false,compact=false,lastPanel="",currentScroll=0;
var shelf=type==="essay"?"Essays":"Research";
var key="gnamma:study:"+type;
function stored(k){try{return localStorage.getItem(k)}catch(e){return null}}
function remember(k,value){try{localStorage.setItem(k,String(value))}catch(e){}}
function el(tag,text,klass){var node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(klass)node.className=klass;return node}
function addButton(parent,label,fn,klass){var b=el("button",label,klass);b.type="button";b.addEventListener("click",fn);parent.appendChild(b);return b}
function label(t){$("st-label").textContent=t}
function toc(){
 var area=$("st-toc");area.replaceChildren();
 data.chapters.forEach(function(item,n){
  var btn=addButton(area,"",function(){change(n)},"");
  btn.append(el("span",String(n+1).padStart(2,"0"),"num"),el("span",item.title));
  btn.setAttribute("aria-current",n===index?"location":"false");btn.classList.toggle("active",n===index);
 });
}
function paragraphs(node,texts){
 (texts||[]).forEach(function(t,i){var p=el("p",t);node.appendChild(p);
  if(i===0&&(data.chapters[index].citations||[]).length){
    var note=el("sup");addButton(note,"[1]",function(){openPanel("citations")});
    p.append(note);
  }
 });
}
function layers(){
 var record=data.chapters[index],chips=$("st-layerchips"),container=$("st-layers");chips.replaceChildren();container.replaceChildren();
 (record.layers||[]).forEach(function(layer,j){
  var active=showAll||chosen.has(layer.tag);
  var b=addButton(chips,layer.tag,function(){if(showAll){showAll=false;chosen.clear()}if(chosen.has(layer.tag))chosen.delete(layer.tag);else chosen.add(layer.tag);layers()});
  b.setAttribute("aria-pressed",String(active));
  if(active){var card=el("section",undefined,"gn-work-layer");card.append(el("h3",layer.title),el("p",layer.text));container.appendChild(card)}
 });
 $("st-showall").textContent=showAll?"Hide layers":"All";
}
function change(n){
 index=Math.max(0,Math.min(data.chapters.length-1,n));var record=data.chapters[index];chosen.clear();showAll=false;
 $("st-title").textContent=data.title;$("st-status").textContent=data.status;
 $("st-chapter").textContent=record.title;$("st-workkind").textContent=shelf+" / "+String(index+1)+"/"+data.chapters.length;
 label(data.label);
 var text=$("st-body");text.replaceChildren();paragraphs(text,record.body);
 var primary=$("st-primary");primary.replaceChildren();
 if(record.source){
  var section=el("section",undefined,"gn-work-primary");
  if(record.source.ar)section.append(el("div",record.source.ar,"gn-primary-ar"));
  if(record.source.en)section.append(el("p",record.source.en,"gn-primary-en"));
  section.append(el("small",record.source.label||"","gn-primary-cite"));
  addButton(section,"View source citation",function(){openPanel("citations")});
  primary.append(section);
 }
 layers();toc();
 var pos=$("st-scroll");pos.scrollTop=0;
 $("st-prev").disabled=index===0;$("st-next").disabled=index>=data.chapters.length-1;
 remember(key,JSON.stringify({index:index,scroll:0}));
 showProgress();if(lastPanel)openPanel(lastPanel);
}
function showProgress(){
 var area=$("st-scroll"),extent=Math.max(1,area.scrollHeight-area.clientHeight),part=Math.max(0,Math.min(1,area.scrollTop/extent)),pct=Math.round(100*(index+part)/data.chapters.length);
 $("st-progress").style.width=pct+"%";$("st-progress-label").textContent=pct+"% read";
}
function openPanel(which){
 lastPanel=which;var panel=$("st-panel"),out=$("st-panel-body");out.replaceChildren();panel.hidden=false;
 $("st-panel-title").textContent={citations:"Citations and notes",dictionary:"Technical dictionary",related:"Related works",notes:"Personal notes"}[which]||"Reference";
 if(which==="citations"){
  var ci=data.chapters[index].citations||[];
  if(!ci.length)out.append(el("p","No verified bibliographic locator is available for this demonstration paragraph."));
  ci.forEach(function(c,n){out.append(el("p",String(n+1)+". "+c.detail));});
  out.append(el("p","Authorial text, translation, editorial reconstruction and source evidence are kept distinct.","ref-aux"));
 }
 if(which==="dictionary"){
  var input=el("input");input.type="search";input.placeholder="Arabic, Latin or English";input.setAttribute("aria-label","Look up a term");out.append(input);
  var list=el("div");out.append(list);
  function render(){
   list.replaceChildren();
   var terms=(window.GNAMMA_PREVIEW_LEXICON||[]).filter(function(t){return ((t.head||t.ar||"")+" "+(t.trans||t.term||"")+" "+(t.eng||t.en||"")+" "+(t.latin||t.lat||"")).toLowerCase().includes(input.value.toLowerCase())}).slice(0,25);
   if(!terms.length)list.append(el("p","No curated entry in this local glossary."));
   terms.forEach(function(t){
    var block=el("div",undefined,"ref-row");
    var a=el("h3",t.head||t.ar||"");a.dir="rtl";a.lang="ar";
    block.append(a,el("strong",(t.trans||t.term||"")+" — "+(t.eng||t.en||"")),el("p",t.latin||t.lat||""),el("p",t.note||""));
    list.append(block);
   });
  }input.addEventListener("input",render);render();
 }
 if(which==="related"){
  out.append(el("p","Open a source or adjacent study without losing this reading place.","ref-aux"));
  var links=[["Ibn Rushd — al-Ḍarūrī","../../texts/ibn-rushd/al-daruri/","Book reader · verified excerpt"],
  ["Bidāya–Ḍarūrī","../../texts/ibn-rushd/bidayat-al-mujtahid/","Book preview · research framework"],
  ["Ghazālī — al-Mustaṣfā","../../texts/al-ghazali/al-mustasfa/","Book reader · working edition"],
  ["Ibn ʿAjība — al-Baḥr al-Madīd","../../texts/ibn-ajiba/al-bahr-al-madid/","Book preview · full import pending"],
  ["Sharḥ al-Mawāqif","../../texts/al-jurjani/sharh-al-mawaqif/","Book preview · full import pending"],
  [type==="essay"?"Research · Uṣūl–Law–Rushd":"Essay · Ibn Rushd and method",type==="essay"?"../../research/usul-law-rushd/":"../../essays/ibn-rushd-method/","Cross-reference"]];
  links.forEach(function(l){
   var a=el("a",undefined,"ref-row");a.href=l[1];a.setAttribute("target","_blank");a.setAttribute("rel","noopener noreferrer");
   a.append(el("strong",l[0]),el("span",l[2]+" · opens in a new tab"));out.append(a);
  });
  out.append(el("p","Your current text remains open; return by closing the related tab.","ref-aux"));
 }
 if(which==="notes"){
  out.append(el("p","Private notes are stored in this browser only.","ref-aux"));
  var edit=el("textarea");edit.rows=6;edit.placeholder="Question, source, comparison, objection...";edit.value=stored(key+":note:"+index)||"";out.append(edit);
  var b=addButton(out,"Save note",function(){remember(key+":note:"+index,edit.value);b.textContent="Saved in this browser"},"note-save");
 }
}
function closePanel(){$("st-panel").hidden=true;lastPanel=""}
function init(){
 document.title=data.title+" | Gnamma Research";
 $("st-contents-btn").onclick=function(){$("st-contents").classList.toggle("closed");$("main").classList.toggle("contents-closed",$("st-contents").classList.contains("closed"))};
 $("st-prev").onclick=function(){change(index-1)};$("st-next").onclick=function(){change(index+1)};
 $("st-full").onclick=function(){focused=!focused;$("main").classList.toggle("is-focused",focused);$("st-full").setAttribute("aria-pressed",String(focused));showProgress()};
 $("st-small").onclick=function(){compact=!compact;$("main").classList.toggle("is-compact",compact);$("st-small").setAttribute("aria-pressed",String(compact));showProgress()};
 $("st-cites-btn").onclick=function(){openPanel("citations")};
 $("st-showall").onclick=function(){showAll=!showAll;chosen.clear();layers()};
 document.querySelectorAll("[data-study-tool]").forEach(function(b){b.onclick=function(){openPanel(b.getAttribute("data-study-tool"))}});
 $("st-panel-close").onclick=closePanel;
 $("st-scroll").addEventListener("scroll",function(){
  showProgress();remember(key,JSON.stringify({index:index,scroll:$("st-scroll").scrollTop}));
 },{passive:true});
 document.addEventListener("keydown",function(e){if(e.key==="Escape")closePanel()});
 var saved=stored(key),at=0,p=0;
 if(saved){try{var j=JSON.parse(saved);at=Number(j.index)||0;p=Number(j.scroll)||0}catch(e){}}
 change(at);if(p>0){requestAnimationFrame(function(){$("st-scroll").scrollTop=p;showProgress()})}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();