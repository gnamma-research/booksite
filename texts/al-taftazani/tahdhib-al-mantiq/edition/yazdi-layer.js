/* Source-checked translated selections from Mullā ʿAbd Allāh al-Yazdī.
   No invented continuation: panels exist only at units with translated Arabic.
   Source archive and translation layer are separate from Taftāzānī's matn. */
(function(){
'use strict';
const data=window.GNAMMA_YAZDI_LAYER,reader=window.GnammaTahdhibReader,ex=window.GnammaTahdhibExperience;
if(!data||!reader||!ex||!reader.isDivision)return;
const KEY='gnamma-tahdhib-yazdi-v1';
const state={enabled:false};
try{state.enabled=localStorage.getItem(KEY)==='on'}catch{}
const groups=new Map();
for(const part of data.entries){if(!groups.has(part.unit))groups.set(part.unit,[]);groups.get(part.unit).push(part)}
const idFor=id=>'u-'+id.replace(/[^a-zA-Z0-9-]/g,'-');
function n(tag,cls,value){const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e}
function make(unit){
 const entries=groups.get(unit)||[];
 const box=n('section','gn-yazdi-layer');box.dataset.yazdiUnit=unit;box.setAttribute('aria-label','Mullā al-Yazdī commentary for '+unit);
 const head=n('header','gn-yazdi-head');head.append(n('h3',null,'Mullā al-Yazdī · Commentary'),n('small',null,entries.length+' translated passages'));box.append(head);
 for(const part of entries){
  const item=n('article','gn-yazdi-excerpt');item.dataset.yazdiId=part.id;
  const eyebrow=n('div','gn-yazdi-locator','al-Yazdī · p. '+part.page+' · '+part.title);
  const content=n('div','gn-yazdi-pair');
  const en=n('p','gn-yazdi-en',part.english);en.lang='en';
  const ar=n('p','gn-yazdi-ar',part.arabic);ar.lang='ar';ar.dir='rtl';
  content.append(en,ar);
  item.append(eyebrow,content);
  const source=n('a','gn-yazdi-source','Arabic source · p. '+part.page);source.href=part.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';
  item.append(source);box.append(item)
 }
 return box
}
function mountFlow(){
 const root=document.getElementById('flow-passages');if(!root)return;
 for(const unit of groups.keys()){
  const span=document.getElementById('flow-'+idFor(unit));
  const sec=span?.closest('.gn-flow-section');
  if(!sec||sec.nextElementSibling?.dataset?.yazdiUnit===unit)continue;
  sec.insertAdjacentElement('afterend',make(unit))
 }
}
function mountStudy(){
 for(const unit of groups.keys()){
  const article=document.getElementById(idFor(unit));
  if(article&&!article.querySelector('.gn-yazdi-layer'))article.append(make(unit))
 }
}
function mount(){mountFlow();mountStudy();document.body.dataset.yazdi=state.enabled?'on':'off'}
function enabled(){return state.enabled}
function setEnabled(v){
 state.enabled=Boolean(v);try{localStorage.setItem(KEY,state.enabled?'on':'off')}catch{}
 mount();document.dispatchEvent(new CustomEvent('gnamma-tahdhib-yazdi',{detail:{enabled:state.enabled}}));return state.enabled
}
document.addEventListener('gnamma-tahdhib-flow-built',mountFlow);
document.addEventListener('gnamma-tahdhib-render',mount); // Render has already replaced source cards; mount now to avoid a WebKit frame race.
document.addEventListener('gnamma-tahdhib-view',mount);
mount();
window.GnammaYazdiLayer=Object.freeze({enabled,setEnabled,mount,entryCount:data.entries.length,units:[...groups.keys()],complete:false});
})();