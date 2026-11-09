(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const STORE='gnamma-misbah-v1:', read=(k,f)=>{try{const v=localStorage.getItem(STORE+k);return v===null?f:JSON.parse(v)}catch{return f}}, write=(k,v)=>{try{localStorage.setItem(STORE+k,JSON.stringify(v))}catch{}};
const st={entries:[],section:null,view:read('view','both'),mode:read('mode','read'),focus:read('focus',0),theme:read('theme','light'),palette:read('palette','gnamma'),font:read('font',17),arabic:read('arabic',26),bookmarks:read('bookmarks',{}),highlights:read('highlights',{}),notes:read('notes',{}),meta:null,shownPanel:null};
const el=(name,cls,txt)=>{const x=document.createElement(name);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x};
function entry(){return st.entries.find(e=>e.id===st.section)||st.entries[0]}
function index(){return st.entries.findIndex(e=>e.id===st.section)}
function saveUI(){write('view',st.view);write('mode',st.mode);write('focus',st.focus);write('theme',st.theme);write('palette',st.palette);write('font',st.font);write('arabic',st.arabic)}
function notify(text){const old=$('#reader-notice');if(old)old.remove();const n=el('div',null,text);n.id='reader-notice';n.setAttribute('role','status');Object.assign(n.style,{position:'fixed',zIndex:80,bottom:'82px',left:'50%',transform:'translateX(-50%)',background:'var(--paper)',border:'1px solid var(--line)',borderRadius:'9px',padding:'7px 18px',font:'12px system-ui',boxShadow:'0 6px 20px #0002'});document.body.appendChild(n);setTimeout(()=>n.remove(),2300)}
function setView(v){st.view=v;saveUI();render()}
function setMode(v){st.mode=v;saveUI();render()}
function setFocus(v){st.focus=(v+4)%4;saveUI();render()}
function applyVisual(){document.body.classList.toggle('dark',st.theme==='dark');document.body.dataset.palette=st.palette;document.body.dataset.view=st.view;document.body.dataset.mode=st.mode;document.body.dataset.focus=String(st.focus);document.documentElement.style.setProperty('--font',st.font+'px');document.documentElement.style.setProperty('--arabic',st.arabic+'px');$('#focus-level').textContent=String(st.focus);$$('[data-tab]').forEach(b=>b.classList.toggle('chosen',b.dataset.tab===st.mode));$$('[data-lang]').forEach(b=>b.classList.toggle('chosen',b.dataset.lang===st.view))}
function render(){const e=entry();if(!e)return;applyVisual();st.section=e.id;$('#section-name').textContent='§'+e.id;$('#location').textContent='Khvājavī pp. '+e.pageStart+(e.pageEnd!==e.pageStart?'–'+e.pageEnd:'');const article=$('#entry');article.replaceChildren();const grid=el('div','passage-grid');const ar=el('div','arabic');ar.dir='rtl';ar.lang='ar';ar.append(el('p',null,e.arabic));const en=el('div','english');en.lang='en';en.append(el('p',null,e.english));grid.append(ar,en);article.append(grid);
const apparatus=$('#entry-notes');apparatus.hidden=st.mode==='read';const nd=$('#note-body');nd.replaceChildren();nd.append(el('p',null,e.notes||'No separate editor note for this unit. The source is the OpenITI transcription aligned to Khvājavī pagination.'));nd.append(el('p','muted','Grade: '+(e.grade||'working translation; critical collation outstanding')));$('#research-pane').hidden=st.mode!=='research';
$('#bookmark').setAttribute('aria-pressed',st.bookmarks[e.id]?'true':'false');$('#prev').disabled=index()===0;$('#next').disabled=index()===st.entries.length-1;document.body.classList.toggle('highlighted',Boolean(st.highlights[e.id]));$('#readmode small').textContent=st.mode==='read'?'Read':st.mode==='study'?'Study':'Research';document.title='§'+e.id+' · Miṣbāḥ al-Uns · GNAMMA';history.replaceState(null,'','?section='+encodeURIComponent(e.id));write('last',e.id)}
function navigate(delta){const i=index()+delta;if(i>=0&&i<st.entries.length){st.section=st.entries[i].id;render();window.scrollTo({top:0,behavior:'instant'});closePanel()}}
function choose(id){if(!st.entries.some(e=>e.id===id))return;st.section=id;render();window.scrollTo({top:0,behavior:'instant'});closePanel()}
function addRow(parent,text,fn,active){const b=el('button','navrow'+(active?' active':''),text);b.type='button';b.addEventListener('click',fn);parent.append(b);return b}
function appendLabel(parent,text){parent.append(el('p','group',text))}
function addQuick(parent,title,fn){const b=el('button','quick',title);b.type='button';b.addEventListener('click',fn);parent.append(b);return b}
const esc=s=>String(s??'');
function contentMenu(root){appendLabel(root,'Sections — imported working range');for(const e of st.entries)addRow(root,'§'+e.id+'  ·  pp. '+e.pageStart+(e.pageEnd!==e.pageStart?'–'+e.pageEnd:''),()=>choose(e.id),e.id===st.section);appendLabel(root,'Not yet in reader');root.append(el('p','notehelp','§§1.1–4.537 remain in the earlier master; this is an incomplete reader import, not a gap in the reported earlier translation.'))}
function searchMenu(root,onlyTerm){const input=el('input');input.type='search';input.placeholder=onlyTerm?'Search Arabic/English terminology':'Search '+st.entries.length+' translated passages';root.append(input);const result=el('div');root.append(result);function redraw(){result.replaceChildren();const q=input.value.trim().toLowerCase();const matches=st.entries.filter(e=>!q||[e.arabic,e.english,e.id,e.notes].join(' ').toLowerCase().includes(q));result.append(el('p','notehelp',matches.length+' matching passages'));matches.forEach(e=>{const example=e.english.replace(/\s+/g,' ').slice(0,105);addRow(result,'§'+e.id+' · '+example+'…',()=>choose(e.id))})}input.addEventListener('input',redraw);redraw();setTimeout(()=>input.focus(),50)}
function appearanceMenu(root){appendLabel(root,'Language');[['both','Arabic + English'],['ar','Arabic only'],['en','English only']].forEach(([v,n])=>addQuick(root,(st.view===v?'✓ ':'')+n,()=>{setView(v);openPanel('appearance')}));
appendLabel(root,'Reading modes');['read','study','research'].forEach(v=>addQuick(root,(st.mode===v?'✓ ':'')+v,()=>{setMode(v);openPanel('appearance')}));
appendLabel(root,'Focus (Darūrī 0–3)');for(let i=0;i<=3;i++)addQuick(root,(st.focus===i?'✓ ':'')+i,()=>{setFocus(i);openPanel('appearance')});
appendLabel(root,'Type size');const s=el('input');s.type='range';s.min=13;s.max=23;s.value=st.font;s.setAttribute('aria-label','English type size');s.addEventListener('input',()=>{st.font=+s.value;saveUI();applyVisual()});root.append(s);
const sa=el('input');sa.type='range';sa.min=20;sa.max=38;sa.value=st.arabic;sa.setAttribute('aria-label','Arabic type size');sa.addEventListener('input',()=>{st.arabic=+sa.value;saveUI();applyVisual()});root.append(sa);
appendLabel(root,'Appearance');addQuick(root,'Light',()=>{st.theme='light';saveUI();applyVisual();openPanel('appearance')});addQuick(root,'Dark',()=>{st.theme='dark';saveUI();applyVisual();openPanel('appearance')});
appendLabel(root,'Darūrī colour palettes');for(const v of ['gnamma','almohad','cordoba','nasrid','zellij'])addQuick(root,(st.palette===v?'✓ ':'')+v,()=>{st.palette=v;saveUI();applyVisual();openPanel('appearance')})}
function apparatusMenu(root){const e=entry();appendLabel(root,'Critical source notes · §'+e.id);root.append(el('p',null,e.notes||'No standalone apparatus note for this passage.'));root.append(el('p','notehelp',esc(e.grade)));addQuick(root,'Open full Study view',()=>{setMode('study');closePanel()});addQuick(root,'Open Research view',()=>{setMode('research');closePanel()});}
function deskMenu(root){const e=entry();appendLabel(root,'Reading Desk · §'+e.id);addQuick(root,st.bookmarks[e.id]?'Remove bookmark':'Bookmark section',()=>{bookmark();openPanel('desk')});addQuick(root,st.highlights[e.id]?'Remove highlight':'Highlight section',()=>{st.highlights[e.id]=!st.highlights[e.id];write('highlights',st.highlights);render();openPanel('desk')});appendLabel(root,'Your note (stored in this browser)');const area=el('textarea');area.value=st.notes[e.id]||'';area.placeholder='Your note for this passage';area.addEventListener('input',()=>{st.notes[e.id]=area.value;write('notes',st.notes)});root.append(area);appendLabel(root,'Saved bookmarks');const keys=Object.keys(st.bookmarks).filter(k=>st.bookmarks[k]);if(!keys.length)root.append(el('p','notehelp','No bookmarks yet'));for(const id of keys)addRow(root,'§'+id,()=>choose(id),id===st.section);addQuick(root,'Copy section',()=>copyText('§'+e.id+'\n'+e.arabic+'\n\n'+e.english));addQuick(root,'Print section',()=>window.print());root.append(el('p','notehelp','Bookmarks and notes are stored locally in your browser and are not automatically shared or backed up.'))}
function dictionaryMenu(root){appendLabel(root,'Technical lexicon · quick guide');const defs=[
['تعيّن · taʿayyun','determination or entification; a particularised mode of reality, not automatically a separate existence'],
['الأعيان الثابتة · al-aʿyān al-thābita','fixed entities; determinate objects of divine knowledge'],
['شهود · shuhūd','witnessing or direct contemplative apprehension'],
['التجلّي · tajallī','self-disclosure; the mode in which reality manifests'],
['المجلى / المظهر · majlā / maẓhar','site or locus of disclosure/manifestation'],
['أحدية الجمع · aḥadiyyat al-jamʿ','oneness of gathering, as distinct from multiplicity of determinations'],
['القرب · qurb','nearness; the text distinguishes that of supererogatory and obligatory works'],
['الكثرة / الوحدة · kathra / waḥda','multiplicity / unity; do not equate conceptual difference with ontological separateness'],
['الاسم والمسمى · ism / musammā','Name and Named; two considerations whose distinctness/identity is disputed'],
['المرآة · mirʾā','mirror, used for the reciprocal directions of manifestation']
];for(const [term,definition] of defs){const p=el('p');const strong=el('strong',null,term);p.append(strong,document.createTextNode(' — '+definition));root.append(p)}appendLabel(root,'Full terminology search');addQuick(root,'Search entries',()=>openPanel('search'))}
function editionMenu(root){appendLabel(root,'Source');root.append(el('p',null,'Muḥammad Khvājavī’s edition of Fanārī’s commentary on Qūnawī, Tehran, 1416 AH / 1374 SH; later printing 1430 AH.'));root.append(el('p',null,'Arabic electronic source: OpenITI 0834IbnHamzaFanari.MisbahUns.Shia004692-ara1, fixed revision e2715c62fb458ce3ddc43b962cd55677cdd7bc35, blob 7dc10e1d6db58ff524d05e820139dc1aa4ef8a07.'));root.append(el('p',null,'No claim of manuscript or complete printed-image collation. Fanārī’s voice, sources he quotes, and editor’s observations are labelled in the handoff.'));const a=el('a',null,'Open source and progress handoff');a.href='HANDOFF.md';root.append(a)}
function menuMenu(root){appendLabel(root,'GNAMMA reader');for(const [name,fn] of [
['Home',()=>location.href='../../../'],['Books',()=>location.href='../../'],['Read',()=>{setMode('read');closePanel()}],['Study',()=>{setMode('study');closePanel()}],['Research',()=>{setMode('research');closePanel()}],['Dictionary',()=>openPanel('dictionary')],['Indices',()=>openPanel('indices')],['Editions',()=>openPanel('editions')],['Search',()=>openPanel('search')],['Reading Desk',()=>openPanel('desk')],['Visuals / Appearance',()=>openPanel('appearance')]
])addRow(root,name,fn);
root.append(el('p','notehelp','This is a GNAMMA staging reader. It does not imply that the distinct NAMA website has been updated.'))}
function openPanel(type){st.shownPanel=type;const d=$('#drawer'),root=$('#drawer-body');root.replaceChildren();$('#drawer-title').textContent=({contents:'Contents',search:'Search',appearance:'Appearance',apparatus:'Reading apparatus',desk:'Reading Desk',menu:'Menu',dictionary:'Dictionary',indices:'Indices',editions:'Editions'}[type]||type);d.hidden=false;d.setAttribute('aria-hidden','false');$('#scrim').hidden=false;if(type==='contents')contentMenu(root);if(type==='search'||type==='indices')searchMenu(root,type==='indices');if(type==='appearance')appearanceMenu(root);if(type==='apparatus')apparatusMenu(root);if(type==='desk')deskMenu(root);if(type==='menu')menuMenu(root);if(type==='dictionary')dictionaryMenu(root);if(type==='editions')editionMenu(root)}
function closePanel(){st.shownPanel=null;$('#drawer').hidden=true;$('#drawer').setAttribute('aria-hidden','true');$('#scrim').hidden=true}
function bookmark(){let e=entry();st.bookmarks[e.id]=!st.bookmarks[e.id];write('bookmarks',st.bookmarks);render();notify(st.bookmarks[e.id]?'Bookmark saved':'Bookmark removed')}
function copyText(s){if(navigator.clipboard?.writeText){navigator.clipboard.writeText(s).then(()=>notify('Copied')).catch(()=>notify('Copy unavailable'))}else{notify('Clipboard unavailable in this browser')}}
function copyLink(){const link=location.href;copyText(link)}
function bind(){$$('[data-panel]').forEach(b=>b.addEventListener('click',()=>openPanel(b.dataset.panel)));$$('[data-lang]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.lang)));$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.tab)));
$('#drawer-close').addEventListener('click',closePanel);$('#scrim').addEventListener('click',closePanel);$('#focus').addEventListener('click',()=>setFocus(st.focus+1));$('#bookmark').addEventListener('click',bookmark);$('#copy-link').addEventListener('click',copyLink);$('#prev').addEventListener('click',()=>navigate(-1));$('#next').addEventListener('click',()=>navigate(1));$('#readmode').addEventListener('click',()=>{if(st.focus===3){setFocus(0);notify('Normal reading restored')}else setMode(st.mode==='read'?'study':'read')});window.addEventListener('keydown',ev=>{const active=document.activeElement?.tagName;if(['INPUT','TEXTAREA'].includes(active))return;if(ev.key==='Escape'){if(st.shownPanel)closePanel();else setFocus(0)}else if(!st.shownPanel&&ev.key==='ArrowRight')navigate(-1);else if(!st.shownPanel&&ev.key==='ArrowLeft')navigate(1);else if(!st.shownPanel&&ev.key.toLowerCase()==='f')setFocus(st.focus+1)})}
function setProgress(){const m=st.meta||{};const start=m.source?.sourceStartPage??3,end=m.translationProgress?.lastCompletePrintedPage??445,total=m.source?.totalSourcePages??720,next=m.translationProgress?.nextSection??'4.578';const count=end-start+1,percent=count/total*100;$('#percentage').textContent=percent.toFixed(2)+'%';$('#progress-fill').style.width=percent+'%';$('.meter').setAttribute('aria-valuenow',String(count));$('#progress-label').textContent=count+' / '+total+' printed pages · through p. '+end+' · next §'+next;$('#import-label').textContent='Reader import: '+st.entries.length+' aligned passages (§'+st.entries[0].id+'–§'+st.entries.at(-1).id+'). Earlier translated sections through §4.537 are not yet imported into this interface.'}
async function load(){
 bind();
 try{
  let meta,groups;
  if(Array.isArray(window.MISBAH_EMBEDDED) && window.MISBAH_EMBEDDED.length>=2){
   meta=window.MISBAH_EMBEDDED.at(-1);
   groups=window.MISBAH_EMBEDDED.slice(0,-1);
  }else{
   const readJSON=async p=>{const r=await fetch(p,{cache:'no-store'});if(!r.ok)throw Error('Cannot load '+p+' ('+r.status+')');return r.json()};
   meta=await readJSON('MANIFEST.json');
   if(!Array.isArray(meta.readerImport?.files)||!meta.readerImport.files.length)throw Error('Manifest has no reader files');
   groups=await Promise.all(meta.readerImport.files.map(readJSON));
  }
  const all=groups.flatMap(d=>d.entries||[]);
  all.sort((a,b)=>a.number-b.number);
  for(let i=1;i<all.length;i++)if(all[i].number!==all[i-1].number+1)throw Error('Missing section between '+all[i-1].id+' and '+all[i].id);
  const cfg=meta.readerImport||{};
  if(all.length!==cfg.units||all[0]?.id!==cfg.firstSection||all.at(-1)?.id!==cfg.lastSection)
   throw Error('Reader manifest mismatch: '+all.length+' sections, final '+all.at(-1)?.id);
  if(groups.some(g=>g.sourceBlob!=='7dc10e1d6db58ff524d05e820139dc1aa4ef8a07'))
   throw Error('Arabic source revision mismatch');
  st.entries=all;st.meta=meta;
  const requested=new URLSearchParams(location.search).get('section');
  const prior=read('last','');
  st.section=all.some(e=>e.id===requested)?requested:(all.some(e=>e.id===prior)?prior:all[0].id);
  setProgress();render();
 }catch(err){
  $('#section-name').textContent='Reader data could not load';
  $('#entry').textContent='Source alignment failed: '+err.message;
  $('#progress-label').textContent='Progress cannot be verified; consult MANIFEST.json.';
  console.error(err);
 }
}
load();
})();