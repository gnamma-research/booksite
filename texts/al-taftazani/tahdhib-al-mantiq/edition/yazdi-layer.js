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
function make(unit,scope){
 const entries=groups.get(unit)||[];
 const box=n('section','gn-yazdi-layer');box.dataset.yazdiUnit=unit;box.setAttribute('aria-label','Mullā al-Yazdī commentary for '+unit);
 const head=n('header','gn-yazdi-head');head.append(n('h3',null,'Mullā al-Yazdī · Commentary'),n('small',null,entries.length+' translated passages'));box.append(head);
 for(const part of entries){
  const item=n('article','gn-yazdi-excerpt');item.dataset.yazdiId=part.id;
  item.id='gn-yazdi-'+scope+'-'+part.id.replace(/[^a-zA-Z0-9-]/g,'-');
  const eyebrow=n('div','gn-yazdi-locator','al-Yazdī · p. '+part.page+' · '+part.title);
  const content=n('div','gn-yazdi-pair');
  const en=n('p','gn-yazdi-en',part.english);en.lang='en';
  const ar=n('p','gn-yazdi-ar',part.arabic);ar.lang='ar';ar.dir='rtl';
  content.append(en,ar);
  item.append(eyebrow,content);
  const source=n('a','gn-yazdi-source','Arabic source · p. '+part.page);source.href=part.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';
  item.append(source);
  if(part.secondPrint?.sourceUrl){
   const print=n('a','gn-yazdi-source gn-yazdi-second-print','I13 · printed p. '+part.secondPrint.printedPage);
   print.href=part.secondPrint.sourceUrl;print.target='_blank';print.rel='noopener noreferrer';
   print.title='Gujarat 1434/2013 print (main commentary), compared digitally; photographic verification pending';
   item.append(print);
  }
  if(part.witnessComparison){
   const v=part.witnessComparison;
   const details=n('details','gn-yazdi-variant');
   const summary=n('summary',null,'Printed comparison · Q / I13 p. '+v.printedPage+(v.status==='candidate-variant'?' · reading differs':' · agreement'));
   details.append(summary);
   const table=n('div','gn-yazdi-variant-readings');
   for(const [siglum,value] of [['Q · Qum',v.qReading],['I13 · Gujarat',v.iReading]]){
    const line=n('div','gn-yazdi-variant-row'),lab=n('strong',null,siglum),arabic=n('p',null,value);
    arabic.lang='ar';arabic.dir='rtl';line.append(lab,arabic);table.append(line);
   }
   details.append(table,n('p','gn-yazdi-variant-note',v.note));
   details.append(n('p','gn-yazdi-variant-status','Comparison of digital printed transcriptions only; neither an independently collated manuscript variant nor proof of authorial priority.'));
   const iLink=n('a','gn-yazdi-source','Open the I13 printed text');
   iLink.href=v.sourceUrl;iLink.target='_blank';iLink.rel='noopener noreferrer';details.append(iLink);
   item.append(details);
  }
  box.append(item)
 }
 return box
}
function mountFlow(){
 const root=document.getElementById('flow-passages');if(!root)return;
 for(const unit of groups.keys()){
  const span=document.getElementById('flow-'+idFor(unit));
  const sec=span?.closest('.gn-flow-section');
  if(!sec||sec.nextElementSibling?.dataset?.yazdiUnit===unit)continue;
  sec.insertAdjacentElement('afterend',make(unit,'flow'))
 }
}
function mountStudy(){
 for(const unit of groups.keys()){
  const article=document.getElementById(idFor(unit));
  if(article&&!article.querySelector('.gn-yazdi-layer'))article.append(make(unit,'study'))
 }
}
function mount(){mountFlow();mountStudy();document.body.dataset.yazdi=state.enabled?'on':'off'}
function enabled(){return state.enabled}
function setEnabled(v){
 state.enabled=Boolean(v);try{localStorage.setItem(KEY,state.enabled?'on':'off')}catch{}
 mount();document.dispatchEvent(new CustomEvent('gnamma-tahdhib-yazdi',{detail:{enabled:state.enabled}}));return state.enabled
}
function goTo(id){
 const part=data.entries.find(e=>e.id===id);if(!part)return false;
 setEnabled(true);ex.setMode('flow');
 reader.go(Number(part.unit.slice(2)),'u-'+part.unit.replace(/[^a-zA-Z0-9-]/g,'-'));
 const scroll=()=>{
  const target=document.getElementById('gn-yazdi-flow-'+part.id.replace(/[^a-zA-Z0-9-]/g,'-'));
  target?.scrollIntoView({block:'center',behavior:'smooth'});
 };
 requestAnimationFrame(()=>requestAnimationFrame(scroll));
 return true;
}
document.addEventListener('gnamma-tahdhib-flow-built',mountFlow);
document.addEventListener('gnamma-tahdhib-render',mount); // Render has already replaced source cards; mount now to avoid a WebKit frame race.
document.addEventListener('gnamma-tahdhib-view',mount);
mount();
window.GnammaYazdiLayer=Object.freeze({enabled,setEnabled,mount,goTo,entryCount:data.entries.length,units:[...groups.keys()],complete:false});
})();