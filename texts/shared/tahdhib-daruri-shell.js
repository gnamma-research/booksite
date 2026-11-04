/* Identical reader navigation for Tahdhīb al-Kalām and al-Manṭiq.
   Inspired by the current Darūrī navigation; reuses its real bookmark icon API.
   Text, witnesses, stable IDs and PDF hashes remain owned by edition/data.js. */
(function(){
'use strict';
const api=window.GnammaTahdhibReader,ex=window.GnammaTahdhibExperience,book=window.GNAMMA_CRITICAL_CORPUS;
if(!api||!ex||!book)return;
const isLogic=api.isDivision,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const shapes={
 contents:"<path d=\"M5 4v16M5 7h5M5 13h5M5 19h5M12 7h8M12 13h8M12 19h8\"/>",
 read:"<path d=\"M12 5.5C8 3.5 5 4.2 3 5.5v13c2.5-1.3 6-1.6 9 .3 3-1.9 6.5-1.6 9-.3v-13c-2-1.3-5-2-9 0ZM12 5.5v13.3\"></path>",
 study:"<path d=\"m2 8 10-5 10 5-10 5L2 8Z\"/><path d=\"M6 11v5c3.5 2.5 8.5 2.5 12 0v-5M22 8v8\"/>",
 note:"<path d=\"M5 3h14v18H5zM9 8h7M9 12h7M9 16h4\"></path>",
 visuals:"<path d=\"M4 7h16M4 17h16M9 4v6M15 14v6\"></path>",
 pdf:"<path d=\"M6.5 4H19a1.5 1.5 0 0 1 1.5 1.5V20H8.5a2 2 0 0 1-2-2V4Z\"/><path d=\"M6.5 7H4.75A1.75 1.75 0 0 0 3 8.75V18a2 2 0 0 0 2 2h3.5M10 9h7M10 13h7M10 17h5\"/>",
 help:"<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 11v6M12 7h.01\"></path>",
 search:"<circle cx=\"10.8\" cy=\"10.8\" r=\"6.3\"></circle><path d=\"m16 16 4.5 4.5\"></path>",
 close:"<path d=\"m5 5 14 14M19 5 5 19\"></path>",
 dictionary:"<path d=\"M6 3h14v18H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3ZM6 3v18M10 16l2.5-7 2.5 7M11 14h3\"/>",
 index:"<circle cx=\"6\" cy=\"6\" r=\"2\"/><circle cx=\"18\" cy=\"7\" r=\"2\"/><circle cx=\"8\" cy=\"18\" r=\"2\"/><path d=\"M8 6.2h8M7 8l1 8M16.7 9l-7 7\"/>",
 immersive:'<path d="M8 3H4v5M16 3h4v5M4 16v5h4M20 16v5h-4"/>'
};
shapes.layers=shapes.read; // The same open-book glyph used for Daruri's reading apparatus
shapes.books='<path d="M5 3h11l3 3v15H5V3ZM16 3v4h3M8 10h7M8 13h5M8 17h4"/><path d="m15 16 4-4 2 2-4 4-3 1z"/>';
function icon(kind){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');s.setAttribute('fill','none');s.setAttribute('stroke','currentColor');s.setAttribute('stroke-width','1.75');s.setAttribute('stroke-linecap','round');s.setAttribute('stroke-linejoin','round');s.innerHTML=shapes[kind]||shapes.help;return s}
function el(tag,cls,value){const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n}
function btn(label,kind,fn){const b=el('button','gn-daruri-action');b.type='button';b.title=label;b.setAttribute('aria-label',label);
 if(kind==='saved'&&window.GnammaBookmarkUI){const s=el('span','gn-daruri-bookmark');s.innerHTML=window.GnammaBookmarkUI.icon({saved:true});b.append(s)}
 else b.append(icon(kind));
 b.append(el('span','gn-daruri-text',label));b.addEventListener('click',fn);return b}
function click(selector){const b=$(selector);if(b)b.click()}
function setMode(mode){ex.setMode(mode);if(mode==='study'&&api.getState().scope!=='page')click('[data-scope="page"]');sync()}
function contents(){const panel=$('#contents');if(panel){panel.classList.add('shown');$('#open-contents')?.setAttribute('aria-expanded','true');$('#search')?.focus()}}
function search(){contents()}
function pdfs(){click('#export')}
const bar=el('nav','gn-daruri-toolbar');bar.id='gn-daruri-toolbar';bar.setAttribute('aria-label','Reading toolbar');
const first=el('div','gn-daruri-tools'),second=el('div','gn-daruri-tools gn-daruri-tools-end');
bar.append(first,second);
first.append(btn('Books','books',booksPanel),btn('Contents','contents',contents),btn('Read','read',()=>setMode('flow')),btn('Study','study',()=>setMode('study')),btn('Immersive','immersive',()=>setMode('immersive')));
second.append(btn('Search','search',search));
const languages=el('div','gn-daruri-languages');languages.setAttribute('role','group');languages.setAttribute('aria-label','Reading language');
for(const [v,label] of [['ar','ع'],['en','EN'],['both','ع/EN']]){const b=el('button',null,label);b.type='button';b.dataset.gnLang=v;b.title=v==='ar'?'Arabic only':v==='en'?'English only':'Arabic and English';b.setAttribute('aria-label',b.title);b.addEventListener('click',()=>{const x=$('[data-view="'+v+'"]');x?.click();sync()});languages.append(b)}
second.append(languages);
const vowel=btn('Arabic vowels','read',()=>{const p=ex.getPrefs(),next=p.vocalization==='original'?'assisted':'original';click('[data-vowel-mode="'+next+'"]');sync()});
vowel.id='gn-daruri-vowels';vowel.querySelector('svg').replaceWith(el('span','gn-daruri-vowel-letter','حَ'));second.append(vowel);
second.append(btn('Saved','saved',savedPanel),btn('Layers','layers',layersPanel),btn('Notes','note',()=>click('#gn-notebook-button')),btn('Dictionary','dictionary',()=>window.GnammaTahdhibTerms?.open()),btn('Subject index','index',()=>window.GnammaTahdhibSubjectIndex?.open()),btn('Visuals','visuals',visualsPanel),btn('Editions','pdf',pdfs),btn('Help','help',helpPanel));
const overlay=el('div','gn-daruri-overlay');overlay.id='gn-daruri-overlay';overlay.hidden=true;
const sheet=el('section','gn-daruri-sheet');sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-labelledby','gn-daruri-title');overlay.append(sheet);
let lastFocus=null;
function close(){overlay.hidden=true;sheet.replaceChildren();lastFocus?.focus?.();lastFocus=null}
function open(title,render){lastFocus=document.activeElement;sheet.replaceChildren();
 const head=el('div','gn-daruri-sheet-head'),h=el('h2',null,title);h.id='gn-daruri-title';head.append(h,btn('Close','close',close));sheet.append(head);
 const body=el('div','gn-daruri-sheet-body');sheet.append(body);render(body);overlay.hidden=false;head.querySelector('button').focus()}
overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden){e.preventDefault();close()}});
function setting(root,label,hint){const wrap=el('div','gn-daruri-setting');wrap.append(el('label',null,label));if(hint)wrap.append(el('small',null,hint));root.append(wrap);return wrap}
function select(root,label,choices,current,fn){const wrap=setting(root,label),s=el('select');s.setAttribute('aria-label',label);
 for(const [v,title] of choices){const o=el('option',null,title);o.value=v;s.append(o)}
 s.value=current;s.addEventListener('change',()=>fn(s.value));wrap.append(s);return s}
function resource(root,label,href){const a=el('a','gn-daruri-resource',label);a.href=href;root.append(a)}
function booksPanel(){open('Gnamma books',root=>{
 root.append(el('p','gn-daruri-description','Choose a book; your reading position and saved notes remain in each book.'));
 resource(root,'Uṣūl al-fiqh · al-Ḍarūrī','../../../../daruri/');
 resource(root,'Logic · Tahdhīb al-Manṭiq','../../tahdhib-al-mantiq/edition/');
 resource(root,'Kalām · Tahdhīb al-Kalām','../../tahdhib-al-kalam/edition/');
 resource(root,'All books','../../../../texts/');
})}
function layersPanel(){open('Reading apparatus & commentary',root=>{
 if(isLogic){
  const layer=window.GnammaYazdiLayer;
  const label=el('label','gn-yazdi-switch');
  const check=el('input');check.type='checkbox';check.setAttribute('aria-label','Show translated commentary by Mullā al-Yazdī');
  check.checked=layer?.enabled()||false;
  check.addEventListener('change',()=>{
   layer?.setEnabled(check.checked);
   const action=root.querySelector('[data-yazdi-jump]');if(action)action.disabled=!check.checked;
  });
  const copy=el('span');copy.append(el('strong',null,'Mullā ʿAbd Allāh al-Yazdī'));
  copy.append(el('small',null,'Show the available bilingual commentary passages alongside the logic text'));
  label.append(check,copy);root.append(label);
  root.append(el('p','gn-yazdi-note','The available translations cover L.02–L.06. Untranslated divisions remain plain text with no placeholder commentary.'));
  const to=btn('Go to first translated passage','contents',()=>{close();setMode('flow');api.go(2,'u-L-02')});
  to.dataset.yazdiJump='';to.disabled=!check.checked;root.append(to);
 } else {
  root.append(el('p','gn-daruri-description','The separate Sanandajī commentary remains a companion book.'));
  resource(root,'Read Taqrīb al-Marām','../../../al-sanandaji/taqrib-al-maram/');
 }
 root.append(el('p','gn-daruri-note','These layers are separate from al-Taftāzānī’s text and your personal Reading Desk notes.'));
})}
function visualsPanel(){open('Visuals',root=>{
 const pref=ex.getPrefs(),state=api.getState();
 select(root,'Reading mode',[['flow','Continuous reading'],['immersive','Immersive reading'],['study','Study · annotated passages']],pref.mode,setMode);
 select(root,'Page style',[['quiet','Quiet reading'],['book','Book page'],['structured','Structured page']],document.body.dataset.gnPageStyle||'quiet',v=>{document.body.dataset.gnPageStyle=v;try{localStorage.setItem('gnamma-tahdhib-page-style',v)}catch{}});
 select(root,'Arabic vowels',[['original','Original witness'],['assisted','Assisted · partial'],['machine',pref.machineAvailable?'Automatic · UNREVIEWED':'Automatic unavailable']],pref.vocalization,v=>{const b=$('[data-vowel-mode="'+v+'"]');if(b&&!b.disabled)b.click()});
 select(root,'Arabic font',[['amiri','Amiri'],['scheherazade','Scheherazade New'],['noto','Noto Naskh Arabic']],pref.arFont,v=>{const e=$('#gn-ar-font');if(e){e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}))}});
 select(root,'English font',[['literary','Literary serif'],['sans','Source Sans 3'],['accessible','Lexend']],pref.enFont,v=>{const e=$('#gn-en-font');if(e){e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}))}});
 select(root,'Appearance',[['light','Light'],['dark','Dark'],['sepia','Sepia']],state.theme,v=>{for(let i=0;i<3&&api.getState().theme!==v;i++)click('#theme')});
 select(root,'Colours',[['almohad','Almohad plaster'],['cordoba','Córdoba arches'],['nasrid','Nasrid mineral'],['zellij','Zellij green'],['gnamma','Gnamma landscape'],['gnamma-air','Gnamma · open landscape']],document.body.dataset.gnPalette||'almohad',v=>{document.body.dataset.gnPalette=v;try{localStorage.setItem('gnamma-tahdhib-palette',v)}catch{}});
 select(root,'Page layout',[['en-left','English left · Arabic right'],['ar-left','Arabic left · English right']],document.body.dataset.gnOrder||'en-left',v=>{document.body.dataset.gnOrder=v;try{localStorage.setItem('gnamma-tahdhib-order',v)}catch{}});
 const row=setting(root,'Text size');const group=el('div','gn-daruri-scale');group.append(btn('Smaller text','visuals',()=>click('#smaller')),btn('Larger text','visuals',()=>click('#larger')));row.append(group);
 const refs=setting(root,'Source-page locators');const check=el('input');check.type='checkbox';check.checked=pref.pageRefs;check.setAttribute('aria-label','Show source-page locators');check.addEventListener('change',()=>{const e=$('#gn-page-references');if(e){e.checked=check.checked;e.dispatchEvent(new Event('change',{bubbles:true}))}});refs.append(check);
 root.append(el('p','gn-daruri-caution','Automatic vowels are an unreviewed learning aid. They are not a grammatically or manuscript-verified text.'));
})}
function jump(u){if(!u)return;close();setMode('flow');api.go(u.page,'u-'+u.id.replace(/[^a-zA-Z0-9-]/g,'-'))}
function savedPanel(){open('Reading Desk · Saved',root=>{
 const marks=new Set(api.getBookmarked()),notes=ex.getNotes();
 const items=book.units.filter(u=>marks.has(u.id)||notes[u.id]?.highlight||notes[u.id]?.body);
 root.append(el('p','gn-daruri-description','Saved passages, highlights and notes are private to this browser and this book.'));
 if(!items.length)root.append(el('p','gn-daruri-empty','No saved passages yet. Select a clause in the text, then use its bookmark or note action.'));
 const list=el('div','gn-daruri-saved-list');root.append(list);
 for(const u of items){const button=el('button','gn-daruri-saved-item');button.type='button';button.append(el('strong',null,u.id));
 const parts=[];if(marks.has(u.id))parts.push('Bookmark');if(notes[u.id]?.highlight)parts.push('Highlight');if(notes[u.id]?.body)parts.push('Note');
 button.append(el('small',null,parts.join(' · ')));button.append(el('span',null,(u.en||u.ar||'').slice(0,130)));button.addEventListener('click',()=>jump(u));list.append(button)}
 const history=window.GnammaTahdhibTrail;
 if(history){
  const places=history.snapshot().recent||[];
  const title=el('h3',null,'Recent reading locations');root.append(title);
  const controls=el('div','gn-daruri-saved-actions');
  controls.append(btn('Back','contents',()=>{close();history.back()}),btn('Forward','contents',()=>{close();history.forward()}));root.append(controls);
  if(places.length){const recent=el('div','gn-daruri-saved-list');root.append(recent);
   for(const p of places.slice(0,20)){
    const b=el('button','gn-daruri-saved-item');b.type='button';
    b.append(el('strong',null,isLogic?'L'+String(p.page).padStart(2,'0'):'Cairo p. '+p.page));
    b.append(el('span',null,p.target||'Page beginning'));
    b.addEventListener('click',()=>{close();setMode('flow');history.visit(p)});recent.append(b);
   }
  }else root.append(el('p','gn-daruri-empty','Recent locations will appear here after you jump between passages.'));
 }
 const line=el('div','gn-daruri-saved-actions');line.append(btn('My notes','note',()=>{close();click('#gn-notebook-button')}));
 line.append(btn('Back','contents',()=>{close();contents()}));root.append(line);
})}
function helpPanel(){open('Reader help',root=>{
 root.append(el('h3',null,'Reading'));
 root.append(el('p',null,'Read scrolls continuously from beginning to end. Immersive uses the same complete uninterrupted text with less screen furniture. Study exposes the separate printed-page clauses and textual apparatus.'));
 root.append(el('h3',null,'Navigation and saved places'));
 root.append(el('p',null,'Contents and Search jump directly to locations without splitting the continuous reading surface. The bottom dock moves between divisions or printed pages. The ribbon bookmark icon is the same as in the Darūrī reader.'));
 root.append(el('h3',null,'Source integrity'));
 root.append(el('p',null,'Only the source Arabic and editorial English in this Tahdhīb edition are displayed; the reading shell does not change any source consonants, introduce interpolations, or claim manuscript collation.'));
 resource(root,'Current editorial status',isLogic?'LOGIC_AUDIT.md':'EDITORIAL_STATUS.md');
 resource(root,'Reader implementation comparison','../../TAHDHIB_DARURI_READER_PARITY_2026-11-03.md');
 resource(root,'Book overview','../');
 resource(root,'Gnamma Home','../../../../');
})}
function sync(){
 const m=ex.getPrefs().mode;$$('#gn-daruri-toolbar .gn-daruri-action').forEach(b=>{
  if(['Read','Study','Immersive'].includes(b.getAttribute('aria-label'))){
   const map={Read:'flow',Study:'study',Immersive:'immersive'};
   b.setAttribute('aria-pressed',String(map[b.getAttribute('aria-label')]===m));
  }
 });
 const v=api.getState().view;$$('[data-gn-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.gnLang===v)));
 vowel.setAttribute('aria-pressed',String(ex.getPrefs().vocalization!=='original'));
 const layers=bar.querySelector('[aria-label="Layers"]');if(layers)layers.setAttribute('aria-pressed',String(Boolean(window.GnammaYazdiLayer?.enabled())));
}
document.body.dataset.gnOrder=(()=>{try{return localStorage.getItem('gnamma-tahdhib-order')||'en-left'}catch{return'en-left'}})();
document.body.dataset.gnPageStyle=(()=>{try{return localStorage.getItem('gnamma-tahdhib-page-style')||'quiet'}catch{return'quiet'}})();
document.body.dataset.gnPalette=(()=>{try{return localStorage.getItem('gnamma-tahdhib-palette')||'almohad'}catch{return'almohad'}})();
const toolbar=$('.toolbar');toolbar?.parentNode.insertBefore(bar,toolbar);
for(const [selector,d] of [['#dock-prev','m15 5-7 7 7 7'],['#dock-next','m9 5 7 7-7 7']]){
 const b=$(selector);if(!b)continue;const s=document.createElementNS('http://www.w3.org/2000/svg','svg');
 s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');
 s.setAttribute('fill','none');s.setAttribute('stroke','currentColor');s.setAttribute('stroke-width','1.75');
 s.setAttribute('stroke-linecap','round');s.setAttribute('stroke-linejoin','round');
 const line=document.createElementNS('http://www.w3.org/2000/svg','path');line.setAttribute('d',d);s.append(line);
 for(const node of [...b.childNodes])if(node.nodeType===3)node.remove();
 b.prepend(s);
}
document.body.append(overlay);
document.addEventListener('gnamma-tahdhib-view',sync);
document.addEventListener('gnamma-tahdhib-render',sync);
document.addEventListener('gnamma-tahdhib-yazdi',sync);
sync();
window.GnammaTahdhibDaruriShell={close,openVisuals:visualsPanel,openSaved:savedPanel,version:1};
})();