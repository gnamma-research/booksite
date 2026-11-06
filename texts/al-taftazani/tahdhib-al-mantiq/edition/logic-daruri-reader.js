/* Tahdhīb al-Manṭiq only: compact Darūrī navigation, editorial hierarchy and
   strict two-state matn / matn+Yazdī reading. Does not alter transmitted texts. */
(function(){
'use strict';
const reader=window.GnammaTahdhibReader,experience=window.GnammaTahdhibExperience;
const yazdi=window.GnammaYazdiLayer;
if(!reader?.isDivision||!experience||!yazdi)return;
const oldBar=document.getElementById('gn-daruri-toolbar'),workspace=document.querySelector('.workspace');
if(!oldBar||!workspace)return;
document.body.classList.add('gn-logic-parity');
const chapters=[
 ['Foundations · المبادئ','Prologue: the purpose of the two sciences','الخطبة: غاية تهذيب المنطق والكلام'],
 ['Foundations · المبادئ','Knowledge, assent and the need for logic','العلم والتصور والتصديق والحاجة إلى المنطق'],
 ['Expressions · الألفاظ','Signification, words and their classifications','الدلالات وتقسيم الألفاظ'],
 ['Conceptions · التصورات','Particulars, universals and possible instances','الجزئي والكلي وأقسام الأفراد'],
 ['Conceptions · التصورات','Four relations between universals','النسب الأربع بين الكليين'],
 ['Conceptions · التصورات','The five predicables: genus','الكليات الخمس: الجنس'],
 ['Conceptions · التصورات','Species, differentia, property and accident','النوع والفصل والخاصة والعرض العام'],
 ['Conceptions · التصورات','Logical, natural and intellectual universals','الكلي المنطقي والطبيعي والعقلي'],
 ['Conceptions · التصورات','Definition and description','الحد والرسم وشروط التعريف'],
 ['Propositions · القضايا','Categorical and quantified propositions','القضايا الحملية والسور'],
 ['Propositions · القضايا','Modal propositions: necessity, permanence and possibility','القضايا الموجهة والضرورة والدوام والإمكان'],
 ['Propositions · القضايا','Connected and disjunctive conditionals','القضايا الشرطية المتصلة والمنفصلة'],
 ['Inference · الاستدلال','Contradiction and opposition','التناقض وشروطه'],
 ['Inference · الاستدلال','Simple conversion','العكس المستوي'],
 ['Inference · الاستدلال','Contraposition: exchanging the contradictories','عكس النقيض'],
 ['Inference · الاستدلال','Categorical syllogism: terms, figures and moods','القياس الحملي والأشكال والضروب'],
 ['Inference · الاستدلال','Conditional and exceptive syllogisms','القياس الشرطي والاستثنائي'],
 ['Scientific method · منهج العلم','Induction, analogy and the five arts','الاستقراء والتمثيل والصناعات الخمس'],
 ['Scientific method · منهج العلم','The subject, principles and questions of a science','موضوعات العلوم ومبادئها ومسائلها']
];
const byId=new Map(chapters.map((x,i)=>['L.'+String(i+1).padStart(2,'0'),{id:'L.'+String(i+1).padStart(2,'0'),part:x[0],en:x[1],ar:x[2],editorial:true}]));
const make=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
const svg=d=>{const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');s.setAttribute('fill','none');s.setAttribute('stroke','currentColor');s.setAttribute('stroke-width','1.75');s.setAttribute('stroke-linecap','round');s.setAttribute('stroke-linejoin','round');s.innerHTML='<path d="'+d+'"/>';return s;};
const shapes={menu:'M4 7h16M4 12h16M4 17h16',book:'M12 5.5C8 3.5 5 4.2 3 5.5v13c2.5-1.3 6-1.6 9 .3 3-1.9 6.5-1.6 9-.3v-13c-2-1.3-5-2-9 0ZM12 5.5v13.3',search:'M16.5 16.5 21 21M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0',focus:'M8 3H4v5M16 3h4v5M4 16v5h4M20 16v5h-4',settings:'M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M11 15v6',close:'M5 5l14 14M19 5L5 19'};
function action(label,kind,handler,cls=''){
 const b=make('button','gn-logic-btn '+cls);b.type='button';b.title=label;b.setAttribute('aria-label',label);
 b.append(svg(shapes[kind]||shapes.book));b.addEventListener('click',handler);return b;
}
function legacy(label){
 const b=oldBar.querySelector('button[aria-label="'+label+'"]');if(b)b.click();
}
function setMode(m){experience.setMode(m);sync();}
const bar=make('nav','gn-logic-rail');bar.id='gn-logic-rail';bar.setAttribute('aria-label','Tahdhīb compact reading controls');
const left=make('div','gn-logic-group gn-logic-leading'),middle=make('div','gn-logic-group gn-logic-centre'),right=make('div','gn-logic-group gn-logic-trailing');
bar.append(left,middle,right);
const menuButton=action('Menu and contents','menu',()=>openSheet('menu'),'gn-logic-menu');left.append(menuButton);
const tile=make('a','gn-logic-tile');tile.href='../../../../';tile.setAttribute('aria-label','Gnamma library home');tile.title='Gnamma';left.append(tile);
const readButton=action('Read continuously','book',()=>setMode('flow'),'gn-logic-read');
readButton.append(make('span','gn-logic-read-label','Read'));middle.append(readButton);
const langGroup=make('div','gn-logic-lang');langGroup.setAttribute('role','group');langGroup.setAttribute('aria-label','Reading languages');
const arabic=make('button','gn-logic-lang-button','ع');arabic.type='button';arabic.title='Toggle Arabic';arabic.setAttribute('aria-label','Arabic');
const english=make('button','gn-logic-lang-button','EN');english.type='button';english.title='Toggle English';english.setAttribute('aria-label','English');
function toggleLanguage(which){
 const v=reader.getState().view;
 const target=which==='ar'?(v==='both'?'en':v==='en'?'both':'ar'):(v==='both'?'ar':v==='ar'?'both':'en');
 document.querySelector('[data-view="'+target+'"]')?.click();sync();
}
arabic.addEventListener('click',()=>toggleLanguage('ar'));english.addEventListener('click',()=>toggleLanguage('en'));
langGroup.append(arabic,english);middle.append(langGroup);
const layersButton=action('Text layers: Matn or Matn and commentary','book',()=>openSheet('layers'),'gn-logic-layer');
middle.append(layersButton);
right.append(action('Search text','search',()=>legacy('Search'),'gn-logic-search'));
const focusButton=action('Cycle reading focus','focus',()=>setMode(experience.getPrefs().mode==='immersive'?'flow':'immersive'),'gn-logic-focus');right.append(focusButton);
right.append(action('Display and reading settings','settings',()=>legacy('Visuals'),'gn-logic-settings'));
workspace.parentNode.insertBefore(bar,workspace);

/* One modal and one hierarchy. The second reading-layer state shows both
   authorial matn and available gloss passages; there is no sharh-only state. */
const scrim=make('div','gn-logic-scrim');scrim.id='gn-logic-scrim';scrim.hidden=true;
const sheet=make('section','gn-logic-sheet');sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');
sheet.setAttribute('aria-labelledby','gn-logic-sheet-title');scrim.append(sheet);document.body.append(scrim);
let returnFocus=null;
function closeSheet(){scrim.hidden=true;sheet.replaceChildren();returnFocus?.focus?.();returnFocus=null;}
function item(label,detail,handler){
 const b=make('button','gn-logic-menu-item');b.type='button';
 b.append(make('span','gn-logic-item-title',label));
 if(detail)b.append(make('small','gn-logic-item-detail',detail));
 b.addEventListener('click',()=>{closeSheet();handler()});
 return b;
}
function group(root,heading,items){
 const s=make('section','gn-logic-menu-group');s.append(make('h3',null,heading));
 for(const i of items)s.append(item(...i));root.append(s);
}
function openSheet(mode){
 returnFocus=document.activeElement;sheet.replaceChildren();
 const header=make('header','gn-logic-sheet-head');
 const h=make('h2',null,mode==='layers'?'Text to display':'Tahdhīb al-Manṭiq');
 h.id='gn-logic-sheet-title';header.append(h,action('Close','close',closeSheet));sheet.append(header);
 const body=make('div','gn-logic-sheet-body');sheet.append(body);
 if(mode==='layers'){
  body.append(make('p','gn-logic-layer-explainer','Choose one of two reading states. The second includes only the currently translated, source-linked passages of al-Yazdī; untranslated lines are not silently supplied.'));
  for(const [key,label,help] of [
   [false,'Matn','Al-Taftāzānī alone'],
   [true,'Matn + sharḥ','Al-Taftāzānī and available al-Yazdī gloss selections']]){
    const b=make('button','gn-logic-layer-choice');b.type='button';
    b.setAttribute('role','radio');b.setAttribute('aria-checked',String(yazdi.enabled()===key));
    b.append(make('span','gn-logic-choice-mark',yazdi.enabled()===key?'●':'○'));
    const info=make('span');info.append(make('strong',null,label),make('small',null,help));b.append(info);
    b.addEventListener('click',()=>{yazdi.setEnabled(key);closeSheet();sync()});body.append(b);
  }
  body.setAttribute('role','radiogroup');body.setAttribute('aria-label','Text layer choices');
 }else{
  group(body,'Navigate',[
   ['Contents','Editorial sections 1–19',()=>legacy('Contents')],
   ['Search','Arabic and English matn search',()=>legacy('Search')],
   ['Books','Gnamma · Logic, Kalām, Uṣūl',()=>legacy('Books')]
  ]);
  group(body,'Read',[
   ['Continuous reading','Uninterrupted complete matn',()=>setMode('flow')],
   ['Immersive reading','More space for the text',()=>setMode('immersive')],
   ['Study & variants','Witness notes and source-locator cards',()=>setMode('study')],
   ['Text layers','Matn / Matn + sharḥ',()=>openSheet('layers')]
  ]);
  group(body,'References & personal desk',[
   ['Dictionary','Editorial terms and commentary citations',()=>legacy('Dictionary')],
   ['Critical witnesses & coverage','Sources, variants, publication status',()=>{window.location.href='critical-status.html'}],
   ['Subject index','Source-linked thematic topics',()=>legacy('Subject index')],
   ['Saved & history','Bookmarks and reading positions',()=>legacy('Saved')],
   ['My notes','Private passage annotations',()=>legacy('Notes')],
   ['Editions & export','Available published PDFs and working text',()=>legacy('Editions')]
  ]);
  group(body,'Reader',[
   ['Display settings','Fonts, palette, layouts, size',()=>legacy('Visuals')],
   ['Help & editorial status','How to read and source qualifications',()=>legacy('Help')]
  ]);
 }
 scrim.hidden=false;sheet.querySelector('button')?.focus();
}
scrim.addEventListener('click',e=>{if(e.target===scrim)closeSheet()});
document.addEventListener('keydown',e=>{
 if(scrim.hidden)return;
 if(e.key==='Escape'){e.preventDefault();closeSheet();return}
 if(e.key==='Tab'){
  const nodes=[...sheet.querySelectorAll('button,a,input,select')].filter(x=>!x.disabled);
  const first=nodes[0],last=nodes.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 }
});
function headingNode(d){
 const wrap=make('header','gn-logic-editorial-header');wrap.dataset.editorialHeading='true';
 const kicker=make('div','gn-logic-part',d.part+' · '+d.id+' · Editorial guide');
 const h=make('h2','gn-logic-editorial-title');
 const en=make('span','gn-logic-editorial-en',d.en),ar=make('span','gn-logic-editorial-ar',d.ar);
 ar.lang='ar';ar.dir='rtl';h.append(en,ar);wrap.append(kicker,h);return wrap;
}
function renderHeadings(){
 document.querySelectorAll('#flow-passages .gn-flow-section').forEach(sec=>{
  const first=sec.querySelector('[data-clause-id]');if(!first)return;
  const d=byId.get(first.dataset.clauseId);if(!d)return;
  const old=sec.querySelector('.gn-editorial-title'),existing=sec.querySelector('.gn-logic-editorial-header');
  if(!existing){const h=headingNode(d);if(old)old.replaceWith(h);else sec.prepend(h)}
  else if(old)old.remove();
 });
 document.querySelectorAll('#passages .printed-page').forEach(sec=>{
  const id=byId.get('L.'+String(Number(sec.id.replace('page-',''))).padStart(2,'0'));
  if(!id)return;
  const h=sec.querySelector('.printed-heading h2');
  if(h)h.textContent=id.id+' · '+id.en;
  const container=sec.querySelector('.printed-heading');
  if(container&&!container.querySelector('.gn-logic-study-title')){
   const ar=make('span','gn-logic-study-title',id.ar);ar.lang='ar';ar.dir='rtl';container.querySelector('div')?.append(ar);
  }
 });
 const nav=document.getElementById('page-list');
 if(nav)nav.querySelectorAll('button,a').forEach(el=>{
  const hit=(el.textContent||'').match(/L(?:\.|\s*)0?(\d{1,2})/i);
  if(hit){const d=byId.get('L.'+String(Number(hit[1])).padStart(2,'0'));if(d)el.title=d.en+' · editorial title'}
 });
}
function sync(){
 const state=reader.getState(),mode=experience.getPrefs().mode;
 arabic.setAttribute('aria-pressed',String(state.view!=='en'));english.setAttribute('aria-pressed',String(state.view!=='ar'));
 layersButton.dataset.layer=yazdi.enabled()?'both':'matn';
 layersButton.title=yazdi.enabled()?'Matn + sharḥ':'Matn';
 layersButton.setAttribute('aria-pressed',String(yazdi.enabled()));
 readButton.setAttribute('aria-pressed',String(mode==='flow'));
 focusButton.setAttribute('aria-pressed',String(mode==='immersive'));
}
document.addEventListener('gnamma-tahdhib-flow-built',renderHeadings);
document.addEventListener('gnamma-tahdhib-render',()=>{renderHeadings();sync()});
document.addEventListener('gnamma-tahdhib-view',sync);
document.addEventListener('gnamma-tahdhib-yazdi',sync);
renderHeadings();sync();
window.GnammaLogicDaruri=Object.freeze({openMenu:()=>openSheet('menu'),openLayers:()=>openSheet('layers'),headings:byId,version:1});
})();
