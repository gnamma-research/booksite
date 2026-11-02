/* Tahdhīb terminology desk — introductory editorial glossary, never source words. */
(function(){'use strict';
const lexical=window.GNAMMA_TAHDHIB_GLOSSARY,reader=window.GnammaTahdhibReader;
const corpus=window.GNAMMA_CRITICAL_CORPUS;
if(!lexical||!reader||!corpus)return;
const key='gnamma-tahdhib-glossary-v1-'+(reader.isDivision?'logic':'kalam');
const $=q=>document.querySelector(q);
const el=(tag,cls,value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=value;return x};
const norm=lexical.norm;
const glossary=lexical.terms.slice();
const occurrences=glossary.map(term=>{
 const needle=norm(term.ar),ids=[];
 for(const unit of corpus.units){
  if(norm(unit.ar).includes(needle))ids.push(unit);
 }
 return ids;
});
let overlay=null,lastTrigger=null;
function hide(){if(!overlay)return;overlay.hidden=true;lastTrigger?.focus?.();lastTrigger=null;}
function init(){
 const toolbar=$('#gn-experience-controls');if(!toolbar)return;
 const button=el('button','toolbar-icon gn-terms-button','Terms');
 button.type='button';button.title='Scholarly terminology and source locations';
 button.setAttribute('aria-label','Open the Tahdhīb terminology desk');
 button.addEventListener('click',()=>show(button));
 toolbar.append(button);
 overlay=el('div','gn-terms-overlay');overlay.id='gn-terms-overlay';overlay.hidden=true;
 overlay.addEventListener('click',e=>{if(e.target===overlay)hide()});
 document.body.append(overlay);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)hide()});
}
function show(trigger){
 lastTrigger=trigger||document.activeElement;
 const panel=el('section','gn-terms-sheet');panel.setAttribute('role','dialog');
 panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','gn-terms-title');
 const head=el('div','gn-terms-head'),title=el('h2',null,'Tahdhīb terminology');
 title.id='gn-terms-title';
 const close=el('button','gn-terms-close','×');close.type='button';close.title='Close glossary';
 close.setAttribute('aria-label','Close glossary');close.addEventListener('click',hide);
 head.append(title,close);
 const explanation=el('p','gn-terms-warning','Introductory editorial definitions, not quotations from Taftāzānī or a historically collated technical dictionary. The term locations refer to the current source text.');
 const field=el('label','gn-terms-search');field.append(el('span',null,'Find Arabic or English terminology'));
 const input=el('input');input.type='search';input.id='gn-terms-query';input.autocomplete='off';
 input.placeholder='e.g. ماهية · necessity · syllogism';field.append(input);
 const status=el('p','gn-terms-count'),list=el('div','gn-terms-list');
 list.setAttribute('aria-label','Terminology entries');
 function draw(){
  list.replaceChildren();
  const q=norm(input.value).trim();
  const indexes=glossary.map((t,i)=>({t,i})).filter(x=>!q||norm(x.t.ar+' '+x.t.en+' '+x.t.explanation).includes(q));
  status.textContent=indexes.length+' entries · '+corpus.units.length+' aligned source units searchable';
  for(const {t,i} of indexes){
   const row=el('article','gn-terms-entry');
   const top=el('div','gn-terms-term-row'),arabic=el('h3','gn-terms-ar',t.ar);arabic.lang='ar';arabic.dir='rtl';
   const english=el('strong','gn-terms-en',t.en);top.append(arabic,english);
   row.append(top,el('p','gn-terms-gloss',t.explanation));
   if(occurrences[i].length){
    const locations=el('div','gn-terms-occurrences');
    locations.append(el('span','gn-terms-occurs-label',occurrences[i].length+' text location'+(occurrences[i].length===1?'':'s')+': '));
    for(const u of occurrences[i].slice(0,14)){
     const b=el('button','gn-terms-source-link',u.id);
     b.type='button';b.title='Read '+u.id+' in its original context';
     b.addEventListener('click',()=>{
      hide();
      // Preserve currently selected study, flow, language and vocalization.
      reader.go(u.page,'u-'+u.id.replace(/[^a-zA-Z0-9-]/g,'-'));
     });
     locations.append(b);
    }
    if(occurrences[i].length>14)locations.append(el('span','gn-terms-more','+'+(occurrences[i].length-14)+' more · use main search'));
    row.append(locations);
   }else row.append(el('p','gn-terms-unseen','No literal match in the current edition (this may be a related technical term).'));
   list.append(row);
  }
  if(!indexes.length)list.append(el('p','gn-terms-empty','No matching entry; try the full Arabic/English text search.'));
 }
 input.addEventListener('input',draw);
 const footer=el('p','gn-terms-footer','Source terms and technical definitions are deliberately separate editorial layers. This glossary is not a critical-edition witness.');
 panel.append(head,explanation,field,status,list,footer);overlay.replaceChildren(panel);overlay.hidden=false;
 draw();input.focus();
}
init();
window.GnammaTahdhibTerms={open:show,close:hide,size:glossary.length,coverage:occurrences.filter(a=>a.length).length};
})();