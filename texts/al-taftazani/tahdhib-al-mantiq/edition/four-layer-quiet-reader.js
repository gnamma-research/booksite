/* GNAMMA Tahdhīb: source-layer-integrated quiet reader. Public H layer
 * retains already-published English and brief Arabic lemmas, not private
 * fully reconstructed printed Arabic. Matn/Yazdī remain native reader. */
(()=>{'use strict';
const $=(sel,root=document)=>root.querySelector(sel);
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n;};
const NS='gnamma:tahdhib:hnotes:v2';
const sections=[
 ['H-PREFACE','Preface glosses','L.01'],
 ['H-INTRO','Introduction to logic','L.02'],
 ['H-DALALA','Signification','L.03'],
 ['H-MAFAHIM','Universals and concepts','L.04'],
 ['H-DEFINITION','Definition','L.09'],
 ['H-PROPOSITIONS','Propositions and modalities','L.10'],
 ['H-CONDITIONAL','Conditional propositions','L.12'],
 ['H-CONTRADICTION','Contradiction','L.13'],
 ['H-CONVERSION','Simple conversion','L.14'],
 ['H-CONTRAPOSITION','Contraposition','L.15'],
 ['H-SYLLOGISM','Syllogism','L.16'],
 ['H-INDUCTION','Induction and analogy','L.18'],
 ['H-ARTS','Five arts','L.18'],
 ['H-SCIENCES','Parts of sciences','L.19']];
const sectionLabel=Object.fromEntries(sections.map(x=>[x[0],x[1]]));
const txtOf=s=>String(s||'');
const nonModern=x=>!(txtOf(x.status||x.translationStatus).toLowerCase().includes('modern') || txtOf(x.status||x.translationStatus).toLowerCase().includes('reference_only'));
const app={records:null,filtered:[],section:'all',query:'',index:0,showReferences:false,open:false,busy:false,loadError:false};
let previousFocus;
const quiet=$('#main')||$('.main');
if(quiet){
  const editorial=[...quiet.querySelectorAll('section.source-note')];
  if(editorial.length){
    const details=el('details','gn-quiet-about');const sum=el('summary',null,'About the edition, sources and editorial apparatus');
    details.append(sum);const content=el('div','gn-quiet-about-body');editorial.forEach(n=>content.append(n));details.append(content);
    editorial[0].parentNode?.insertBefore(details,quiet.querySelector('.subtitle')?.nextSibling||quiet.firstChild);
  }
  const foot=$('.foot',quiet);if(foot){const d=el('details','gn-quiet-footer');d.append(el('summary',null,'Editorial notes'));d.append(foot.cloneNode(true));foot.replaceWith(d);}
}
const panel=el('aside','gn-h-panel');panel.id='gn-h-panel';panel.hidden=true;panel.setAttribute('aria-label','Later glosses alongside the main text');
const header=el('header','gn-h-head');
const hbox=el('div');hbox.append(el('strong',null,'حواشي الحاشية'));hbox.append(el('small',null,'Later glosses · same-page companion reading'));header.append(hbox);
const close=el('button','gn-h-close','×');close.type='button';close.setAttribute('aria-label','Close later glosses');header.append(close);panel.append(header);
const controls=el('div','gn-h-controls');
const tabs=el('div','gn-h-tabs');
const allTab=el('button','gn-h-tab','All historical sections'), refTab=el('button','gn-h-tab','Including modern references');
for(const b of [allTab,refTab])b.type='button';tabs.append(allTab,refTab);controls.append(tabs);
const section=el('select','gn-h-select');section.setAttribute('aria-label','Historical gloss section');
section.append(new Option('All 14 sections','all'));
sections.forEach(x=>section.append(new Option(x[1],x[0])));controls.append(section);
const search=el('input','gn-h-search');search.type='search';search.placeholder='Search English, Arabic lemma, note ID or Qum page';search.setAttribute('aria-label','Search later glosses');controls.append(search);
const counter=el('div','gn-h-counter','Select the ḥawāshī to load the historical public draft.');controls.append(counter);panel.append(controls);
const scroller=el('div','gn-h-scroll');scroller.tabIndex=0;panel.append(scroller);
const footer=el('footer','gn-h-foot');const prev=el('button','gn-h-page','← Previous'),next=el('button','gn-h-page','Next →'),page=el('span','gn-h-page-label','');for(const b of [prev,next])b.type='button';footer.append(prev,page,next);panel.append(footer);
document.body.append(panel);
const button=el('button','gn-h-trigger','حواشي');button.type='button';button.title='Read historical later glosses alongside the main text';
button.setAttribute('aria-controls','gn-h-panel');button.setAttribute('aria-expanded','false');
const place=$('.gn-logic-centre')||$('.toolbar')||$('.site-head')||document.body;
place.append(button);
const makeSource=(url,label)=>{if(typeof url!=='string'||!/^https:\/\/(ablibrary\.net|archive\.org|sites\.dlib\.nyu\.edu)\//i.test(url))return null;const a=el('a',null,label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a};
function notes(){const q=app.query.trim().toLocaleLowerCase();return (app.records||[]).filter(r=>(app.showReferences||nonModern(r)) &&(app.section==='all'||r.sectionId===app.section) &&
 (!q||[r.id,r.noteNumber,r.localNoteNumber,r.pages?.join(' '),r.english,r.arabicLemma,sectionLabel[r.sectionId]].some(v=>txtOf(v).toLocaleLowerCase().includes(q))));}
function render(){
 app.filtered=notes();
 const start=Math.min(Math.max(app.index,0),Math.max(0,Math.ceil(app.filtered.length/12)-1))*12;
 app.index=Math.floor(start/12);
 scroller.replaceChildren();counter.textContent=app.records?app.filtered.length+' matches · '+app.records.length+' numbered positions (English-first public source)':'Loading';
 allTab.setAttribute('aria-pressed',String(!app.showReferences));refTab.setAttribute('aria-pressed',String(app.showReferences));
 if(!app.filtered.length){scroller.append(el('p','gn-h-empty','No matching entries. Try another phrase or section.'))}
 app.filtered.slice(start,start+12).forEach(r=>{
   const card=el('article','gn-h-entry');card.id='gn-h-'+r.id;card.dataset.hId=r.id;
   const top=el('div','gn-h-entry-top');top.append(el('span','gn-h-entry-id',r.id));top.append(el('span',null,sectionLabel[r.sectionId]||r.sectionId||''));
   card.append(top);
   const lem=txtOf(r.arabicLemma||'').trim();
   if(lem){const ar=el('p','gn-h-lemma',lem);ar.lang='ar';ar.dir='rtl';card.append(ar)}
   const eng=el('div','gn-h-english');txtOf(r.english).split(/\n\s*\n/).filter(Boolean).forEach(p=>eng.append(el('p',null,p)));card.append(eng);
   const meta=el('div','gn-h-entry-bottom');meta.append(el('span',null, 'Qum '+(r.pages?.join('–')||'—')));
   const link=makeSource(r.sourceUrls?.[0],'Original Arabic source');if(link)meta.append(link);
   const save=el('button','gn-h-save','☆ Save');save.type='button';const key=NS+':'+r.id;
   try{if(localStorage.getItem(key)==='1')save.textContent='★ Saved'}catch(e){}
   save.addEventListener('click',()=>{try{if(localStorage.getItem(key)==='1'){localStorage.removeItem(key);save.textContent='☆ Save'}else{localStorage.setItem(key,'1');save.textContent='★ Saved'}}catch(e){}});
   meta.append(save);card.append(meta);scroller.append(card);
 });
 prev.disabled=app.index===0;next.disabled=start+12>=app.filtered.length;
 page.textContent=(app.filtered.length?app.index+1:0)+' / '+Math.ceil(app.filtered.length/12);
}
async function load(){
 if(app.records||app.busy)return;
 app.busy=true;scroller.replaceChildren(el('p','gn-h-empty','Loading public historic glosses…'));
 try{
   const r=await fetch('hawashi-effective-stage114.json',{cache:'force-cache'});
   if(!r.ok)throw Error('HTTP '+r.status);
   const data=await r.json();
   if(!Array.isArray(data.records)||data.records.length!==1090)throw Error('Unexpected corpus shape');
   app.records=data.records;render();
 }catch(error){
  app.loadError=true;
  scroller.replaceChildren();const p=el('p','gn-h-empty','The historic gloss data could not be loaded here.');scroller.append(p);
  const a=el('a',null,'Open the standalone historical gloss reader');a.href='hawashi-numbered-notes.html';scroller.append(a);
 }finally{app.busy=false}
}
function open(){
 previousFocus=document.activeElement;panel.hidden=false;app.open=true;document.body.classList.add('gn-h-open');button.setAttribute('aria-expanded','true');
 const qs=new URLSearchParams(location.search),target=qs.get('h-section');
 if(target&&sections.some(s=>s[0]===target)){app.section=target;section.value=target}
 load();search.focus({preventScroll:true});
}
function shut(){panel.hidden=true;app.open=false;document.body.classList.remove('gn-h-open');button.setAttribute('aria-expanded','false');previousFocus?.focus?.({preventScroll:true});}
button.onclick=()=>app.open?shut():open();close.onclick=shut;
document.addEventListener('keydown',e=>{if(app.open&&e.key==='Escape')shut();});
search.addEventListener('input',()=>{app.query=search.value;app.index=0;render()});
section.addEventListener('change',()=>{app.section=section.value;app.index=0;render()});
allTab.onclick=()=>{app.showReferences=false;app.index=0;render()};
refTab.onclick=()=>{app.showReferences=true;app.index=0;render()};
prev.onclick=()=>{app.index=Math.max(0,app.index-1);render();scroller.scrollTop=0};
next.onclick=()=>{app.index++;render();scroller.scrollTop=0};
function expose(){return {open,close:shut,goTo(id){if(!app.records){open();return}const i=app.records.findIndex(x=>x.id===id);if(i<0)return;app.section='all';section.value='all';app.query='';search.value='';app.showReferences=true;const idx=notes().findIndex(x=>x.id===id);app.index=Math.floor(idx/12);render();open();},counts:()=>({loaded:app.records?.length||0,visible:app.filtered.length})}}
window.GnammaTahdhibFourLayers=Object.freeze(expose());
})();