/* Unified dictionary dossier: meaning, attributed sources, authorial usage.
   Independent short extracts are NEVER represented as excerpts of unrelated full articles. */
(()=>{
'use strict';
if(window.GnammaDictionaryDossier)return;
window.GnammaDictionaryDossier={version:'20261028-compact1'};
const base=document.currentScript?.src||new URL('dictionary-dossier.js',document.baseURI).href;
const fullURL=new URL('full-dictionary-data.js?v=20261025-sinaa1',base).href;
const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const el=(tag,cls='',value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n};
const put=(p,tag,cls,value)=>{const n=el(tag,cls,value);p.append(n);return n};
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/\s/g,'').toLowerCase();
function authorID(name){
 const n=norm(name).replace(/[ʿʾʻ’]/g,'').replace(/ā/g,'a').replace(/ī/g,'i').replace(/ū/g,'u').replace(/ṭ/g,'t').replace(/ẓ/g,'z');
 for(const [word,id] of [['jurj','J'],['munaw','M'],['tahan','K'],['raghib','R'],['mutarr','U'],['suyut','S'],['manzur','L'],['fayyum','F']])
  if(n.includes(word))return id;
 return null;
}
const parsedSourceData=new Map();
function json(id){
 if(parsedSourceData.has(id))return parsedSourceData.get(id);
 try{const data=JSON.parse(document.getElementById(id)?.textContent||'null');parsedSourceData.set(id,data);return data}
 catch(_){return null}
}
function excerpts(term){
 const d=json('dictionaryData');
 if(d?.terms?.[term])return(d.terms[term].sources||[]).map(id=>d.sources?.[id]).filter(Boolean);
 return (json('dictionaryEntries')||[]).find(x=>x.term===term)?.sources||[];
}
function unique(rows){
 const seen=new Set();return rows.filter(s=>{
  const key=[norm(s.author),norm(s.work),norm(s.entry),norm(s.quote)].join('|');
  if(seen.has(key))return false;seen.add(key);return true;
 });
}
let pending=null,scheduled=false;
function load(){
 if(window.GnammaFullDictionaryData)return Promise.resolve(window.GnammaFullDictionaryData);
 if(!pending)pending=new Promise((resolve,reject)=>{
  const s=el('script');s.async=true;s.src=fullURL;
  s.onload=()=>resolve(window.GnammaFullDictionaryData);
  s.onerror=()=>reject(Error('Complete historical lexicon could not be loaded'));
  document.head.append(s);
 }).then(data=>{
  if(data?.schema_version!==1||data.terms?.length!==153||data.articles?.length!==157)
   throw Error('Historical lexicon inventory failed verification');
  return data;
 }).catch(e=>{pending=null;throw e});
 return pending;
}
function groupsFor(term,full){
 const groups=new Map(),articleMap=new Map((full?.articles||[]).map(a=>[a.id,a]));
 function get(id,author,work,meta){
  const key=id||'other:'+norm(author)+'|'+norm(work);
  if(!groups.has(key))groups.set(key,{key,author,work,meta,short:[],articles:[]});
  const g=groups.get(key),source=full?.sources?.[id];
  if(source){g.author=source.author;g.work=source.work;g.meta=source}
  return g;
 }
 for(const s of unique(excerpts(term))){
  const id=authorID(s.author),canonical=full?.sources?.[id];
  get(id,canonical?.author||s.author,canonical?.work||s.work,
   canonical||{date:s.sourceDate,chronology:s.chronology}).short.push(s);
 }
 for(const rel of full?.terms?.find(t=>t.term===term)?.articles||[]){
  const article=articleMap.get(rel.id),source=full.sources?.[article?.source];
  if(!article||!source)continue;
  const g=get(article.source,source.author,source.work,source);
  if(!g.articles.some(x=>x.article.id===article.id))
   g.articles.push({article,relation:rel.relation||''});
 }
 const rank=g=>g.meta?.chronology==='E'?0:g.meta?.chronology==='L'?1:g.meta?.chronology==='M'?2:3;
 return [...groups.values()].sort((a,b)=>rank(a)-rank(b)||a.author.localeCompare(b.author,'en'));
}
function external(parent,label,url){
 if(!/^https:\/\//i.test(String(url||'')))return;
 const a=put(parent,'a','gn-ds-link',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';
}
function dating(group){
 const date=group.meta?.date||group.short[0]?.sourceDate||'Date not established';
 let era=group.meta?.chronology==='E'?'Before Ibn Rushd':
  group.meta?.chronology==='L'?'After Ibn Rushd':
  group.meta?.chronology==='M'?'Modern reference':'Date uncertain';
 if(/muṭarrizī|mutarrizi/i.test(group.author))era='Near-contemporary · died after Ibn Rushd';
 if(/rāghib|raghib/i.test(group.author))era='Before Ibn Rushd · dating disputed';
 return {era,date};
}
function preview(value,limit){
 const chars=Array.from(String(value||'').trim());
 return chars.length<=limit?chars.join(''):chars.slice(0,limit).join('')+'…';
}
function parallel(parent,ar,en,cls=''){
 const wrap=put(parent,'div','gn-ds-parallel '+cls);
 const a=put(wrap,'blockquote','gn-ds-ar',ar||'Arabic text unavailable');a.lang='ar';a.dir='rtl';
 const b=put(wrap,'p','gn-ds-en',en||'English translation unavailable');b.lang='en';b.dir='ltr';
 return wrap;
}

function fullArticle(parent,article,source,full){
 put(parent,'p','gn-ds-biblio',(article.pages||'')+(source?.date?' · '+source.date:''));
 for(const pair of article.paragraphs||[])parallel(parent,pair.ar,pair.en);
 if(article.note){
  const note=put(parent,'aside','gn-ds-note');
  put(note,'strong','','Editorial explanation · not part of the historical text');
  put(note,'p','',article.note);
 }
 for(const note of full.notesByArticle?.[article.id]||[]){
  const aside=put(parent,'aside','gn-ds-note');
  put(aside,'strong','','Scholarly note · '+note.id);
  put(aside,'p','',note.text);
  for(const ref of note.source_references||[])external(aside,ref.reference||'Source',ref.url);
 }
 const foot=put(parent,'p','gn-ds-provenance');
 external(foot,'Original Arabic dictionary witness',article.url);
 if(source?.bibliography||source?.source_status){
  const d=put(parent,'details','gn-ds-edition');
  put(d,'summary','','Edition and provenance');
  if(source.bibliography)put(d,'p','',source.bibliography);
  if(source.source_status)put(d,'p','',source.source_status);
 }
}
function sourceCard(g,full){
 const card=el('article','gn-ds-source');card.dataset.gnDsSource=g.key;
 const header=put(card,'header','gn-ds-source-head');
 put(header,'h4','gn-ds-author',g.author);
 put(header,'p','gn-ds-work',g.work);
 if(g.short.some(x=>/usul_source/.test(x.kind||'')))
  put(header,'p','gn-ds-source-kind','Uṣūl treatise · contextual evidence, not a dictionary');
 else if(g.short.some(x=>/encyclopaedia|encyclopedia/.test(x.kind||'')))
  put(header,'p','gn-ds-source-kind','Juristic encyclopaedia');
 const when=dating(g);
 put(header,'p','gn-ds-date',when.era+' · '+when.date);
 if(when.era.startsWith('After')||when.era.startsWith('Modern'))
  put(header,'p','gn-ds-caution','Comparative source; not evidence that Ibn Rushd knew this later formulation.');
 for(const row of g.articles){
  const article=row.article,block=put(card,'section','gn-ds-headword');
  const title=put(block,'h5','gn-ds-lemma','Complete article available · ');
  const ar=put(title,'bdi','',article.headword);ar.lang='ar';ar.dir='rtl';
  if(row.relation&&row.relation!=='exact headword')
   put(block,'p','gn-ds-relation','Relationship to this term: '+row.relation);
  const first=article.paragraphs?.[0];
  const alreadyQuoted=g.short.some(s=>norm(s.entry)===norm(article.headword)&&
   (article.paragraphs||[]).some(p=>norm(p.ar).includes(norm(s.quote))));
  if(first&&!alreadyQuoted){
   put(block,'p','gn-ds-small','Preview of the complete historical article');
   parallel(block,preview(first.ar,260),preview(first.en,350),'gn-ds-preview');
  }
  const disclosure=put(block,'details','gn-ds-full');
  disclosure.dataset.gnDsArticle=article.id;
  put(disclosure,'summary','gn-ds-full-summary','Read complete article · '+article.headword);
  disclosure.addEventListener('toggle',()=>{
   if(!disclosure.open||disclosure.dataset.ready==='1')return;
   const body=put(disclosure,'div','gn-ds-full-body');
   fullArticle(body,article,full.sources?.[article.source],full);
   disclosure.dataset.ready='1';
  });
 }
 for(const s of g.short){
  const block=put(card,'section','gn-ds-extract');
  const title=put(block,'h5','gn-ds-extract-title','Selected quotation · ');
  const ar=put(title,'bdi','',s.entry||'');ar.lang='ar';ar.dir='rtl';
  put(block,'p','gn-ds-small',
   'Independent short extract. It is not necessarily an abridgement of any complete article above.');
  parallel(block,s.quote,s.translation);
  if(s.comment)put(block,'p','gn-ds-context',s.comment);
  const refs=put(block,'p','gn-ds-provenance');
  external(refs,'View original Arabic entry',s.url);
  if(s.verification){
   const details=put(block,'details','gn-ds-edition');
   put(details,'summary','','Source verification');
   put(details,'p','',s.verification);
  }
 }
 // Preserve every source paragraph and note; keep the first view compact.
 const fold=el('details','gn-ds-source-disclosure');
 const label=put(fold,'summary','gn-ds-source-summary');
 const title=put(label,'span','gn-ds-source-label',g.author);
 put(label,'span','gn-ds-source-meta',g.work+' · '+when.era+' · '+when.date);
 put(label,'span','gn-ds-source-count',g.articles.length+' full · '+g.short.length+' short');
 const content=el('div','gn-ds-source-content');
 while(card.firstChild)content.append(card.firstChild);
 fold.append(content);card.append(fold);
 return card;
}
function renderSources(host,term,full,mode){
 const groups=groupsFor(term,full);
 host.replaceChildren();
 put(host,'h3','gn-ds-heading','Historical dictionary entries');
 const articles=groups.reduce((n,g)=>n+g.articles.length,0);
 const quotes=groups.reduce((n,g)=>n+g.short.length,0);
 put(host,'p','gn-ds-overview',groups.length+' attributed '+(groups.length===1?'source':'sources')+
  ' · '+articles+' complete '+(articles===1?'article':'articles')+
  ' · '+quotes+' selected short '+(quotes===1?'extract':'extracts'));
 const guide=put(host,'details','gn-ds-guidance');
 put(guide,'summary','','About the evidence');
 put(guide,'p','gn-ds-help',
  'Each dictionary is dated relative to Ibn Rushd (d. 595 AH / 1198 CE). Arabic and English extracts are visible below. Expand the complete article within its own source. Independent quotations are not automatically summaries of that article.');
 const controls=put(host,'div','gn-ds-tools');
 const expand=put(controls,'button','gn-ds-expand-all','Expand sources');expand.type='button';
 expand.addEventListener('click',()=>{
  const sources=[...host.querySelectorAll('.gn-ds-source-disclosure')];
  const opening=sources.some(node=>!node.open);
  for(const source of sources)source.open=opening;
  expand.textContent=opening?'Collapse sources':'Expand sources';
 });
 if(!groups.length)put(host,'p','gn-ds-empty','No historical dictionary source is available for this term.');
 for(const g of groups)host.append(sourceCard(g,full));
 host.dataset.gnDossierReady=term;
 if(mode==='standalone'){
  const meta=host.closest('.lex-card')?.querySelector('.entry-meta');
  if(meta){
   meta.replaceChildren();
   put(meta,'span','',groups.length+' attributed sources');
   put(meta,'span','',articles+' complete '+(articles===1?'article':'articles'));
   put(meta,'span','',quotes+' short '+(quotes===1?'extract':'extracts'));
  }
 }
}

function popupNavigation(term){
 const body=$('#detailContent');if(!body)return;
 const previous=body.querySelector('.gn-ds-popup-nav');
 if(previous?.dataset.gnDsTerm===term)return;
 previous?.remove();
 const nav=el('nav','gn-ds-popup-nav');nav.dataset.gnDsTerm=term;
 nav.setAttribute('aria-label','Jump within dictionary entry');
 for(const [id,title] of [['lex-meaning','Meaning'],['lex-sources','Sources'],['lex-author','In the text']]){
  const button=put(nav,'button','gn-ds-jump',title);
  button.type='button';button.dataset.gnDsJump=id;
 }
 const full=put(nav,'a','gn-ds-fullpage','Full page');
 full.href='dictionary.html#term='+encodeURIComponent(term);
 full.dataset.dictionaryAtlas=term;
 full.setAttribute('aria-label','Open the full-page dictionary entry, keeping return to reading');
 const header=body.querySelector('.lex-header');
 if(header)header.after(nav);else body.prepend(nav);
}
function jumpInsidePopup(id){
 const body=$('#detailContent'),destination=document.getElementById(id);
 if(!body||!destination||!body.contains(destination))return;
 const top=body.scrollTop+destination.getBoundingClientRect().top-body.getBoundingClientRect().top-62;
 body.scrollTo({top:Math.max(0,top),behavior:'instant'});
}
function upgrade(host,term,mode){
 if(!host||!term||host.dataset.gnDossierTerm===term)return;
 host.dataset.gnDossierTerm=term;
 host.dataset.gnDossierReady='';
 if(mode==='popup'){
  const body=$('#detailContent');
  body?.querySelector(':scope > .lex-full-link')?.remove();
  body?.querySelector(':scope > .lex-tabbar')?.remove();
  body?.querySelector(':scope > .gn-fd-page-link')?.remove();
  body?.querySelector(':scope > #gnw-dictionary-search')?.remove();
  const meaning=$('#lex-meaning',body),usage=$('#lex-author',body);
  const heading=meaning?.querySelector('.micro-label');
  if(heading)heading.textContent='MEANING IN THE ḌARŪRĪ';
  const h=usage?.querySelector('h3');
  if(h)h.textContent='Usage in the Ḍarūrī';
  if(h&&!usage.querySelector('.gn-ds-usage-note'))
   h.insertAdjacentElement('afterend',el('p','gn-ds-usage-note',
    'Selected illustrative passages from Ibn Rushd, not an exhaustive count of every inflected occurrence.'));
  if(usage)window.GnammaFullDictionaryContext?.enhanceUsage?.(usage,term);
  popupNavigation(term);
 }else{
  const card=host.closest('.lex-card');
  if(card){
   card.classList.add('gn-ds-three-sections');
   card.querySelector('.dict-view-tabs')?.remove();
   const meaning=card.querySelector('[data-dict-panel="meaning"] h2');
   if(meaning)meaning.textContent='Meaning in the Ḍarūrī';
   const usage=card.querySelector('[data-dict-panel="occurrences"] h2');
   if(usage)usage.textContent='Usage in the Ḍarūrī';
  }
 }
 host.replaceChildren(el('p','gn-ds-loading','Loading historical source entries…'));
 const show=full=>{
  if(host.isConnected&&host.dataset.gnDossierTerm===term)renderSources(host,term,full,mode);
 };
 load().then(show).catch(error=>{
  if(!host.isConnected||host.dataset.gnDossierTerm!==term)return;
  show(null);
  const warning=el('p','gn-ds-error','Complete historical articles could not be loaded; the short extracts remain visible.');
  host.prepend(warning);
  const retry=el('button','gn-ds-retry','Retry complete articles');retry.type='button';
  retry.addEventListener('click',()=>{delete host.dataset.gnDossierTerm;upgrade(host,term,mode)});
  warning.insertAdjacentElement('afterend',retry);
  console.warn('Dictionary dossier:',error);
 });
}
function sync(){
 const overlay=$('#infoOverlay'),body=$('#detailContent');
 const dictionary=!!(overlay&&!overlay.hidden&&body&&/DICTIONARY|LEXICAL|GLOSSARY/i.test($('#detailEyebrow')?.textContent||''));
 overlay?.classList.toggle('gn-ds-dictionary-open',dictionary);
 if(dictionary){
  const term=$('#detailTitle',body)?.textContent?.trim();
  if(term)upgrade($('#lex-sources',body),term,'popup');
 }
 const card=$('#lexArticle .lex-card');
 if(card){
  const term=$('.lex-title',card)?.textContent?.trim();
  if(term)upgrade($('[data-dict-panel="sources"]',card),term,'standalone');
 }
 // Quick-glossary cards link to this single full study card; no floating
 // "complete article" expander detached from its dictionary source.
 for(const toggle of $$('#mainContent .glossary-card > .gn-fd-toggle'))toggle.remove();
}
function schedule(){
 if(scheduled)return;
 scheduled=true;
 queueMicrotask(()=>{scheduled=false;sync()});
}
function styles(){
 const st=el('style');st.id='gnamma-dictionary-dossier-css';
 st.textContent=[
 '.gn-ds-three-sections [data-dict-panel]{display:block!important}',
 '.gn-ds-three-sections .dict-view-tabs{display:none!important}',
 '.gn-ds-heading{font:600 20px/1.45 Georgia,serif;margin:0 0 9px}',
 '.gn-ds-overview,.gn-ds-help,.gn-ds-usage-note{font:12px/1.55 system-ui,sans-serif;opacity:.86;margin:6px 0 12px}',
 '.gn-ds-source{border:1px solid var(--line,var(--border,#ccc));border-radius:10px;padding:14px;margin:12px 0;background:var(--paper,var(--card,transparent));color:var(--ink,inherit);min-width:0}',
 '.gn-ds-source-head{border-bottom:1px solid var(--line,var(--border,#ccc));padding-bottom:10px;margin-bottom:10px}',
 '.gn-ds-author{font:600 18px/1.4 Georgia,serif;margin:0 0 3px}',
 '.gn-ds-work{font:13px/1.55 Georgia,serif;margin:0 0 5px}',
 '.gn-ds-date{font:600 12px/1.5 system-ui,sans-serif;color:var(--accent,inherit);margin:4px 0}',
 '.gn-ds-source-kind{font:600 11px/1.5 system-ui,sans-serif;opacity:.8;margin:4px 0}',
 '.gn-ds-caution,.gn-ds-small,.gn-ds-relation{font:12px/1.55 system-ui,sans-serif;opacity:.82;margin:6px 0}',
 '.gn-ds-headword,.gn-ds-extract{margin:12px 0;padding:9px 0;border-bottom:1px dotted var(--line,var(--border,#ccc))}',
 '.gn-ds-lemma,.gn-ds-extract-title{font:600 14px/1.5 system-ui,sans-serif;margin:0 0 6px}',
 '.gn-ds-lemma bdi,.gn-ds-extract-title bdi{font:21px/1.5 var(--arabic,"Noto Naskh Arabic",serif)}',
 '.gn-ds-parallel{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;padding:8px 0;min-width:0}',
 '.gn-ds-ar{font:20px/1.85 var(--arabic,"Noto Naskh Arabic",serif)!important;text-align:right;margin:0;white-space:pre-wrap;overflow-wrap:anywhere}',
 '.gn-ds-en{font:14px/1.65 Georgia,serif!important;margin:0;white-space:pre-wrap;overflow-wrap:anywhere}',
 '.gn-ds-full{margin:10px 0;border:1px solid var(--line,var(--border,#ccc));border-radius:8px;overflow:hidden}',
 '.gn-ds-full-summary{cursor:pointer;list-style:none;padding:11px 13px;font:600 13px/1.5 system-ui,sans-serif;color:var(--accent,inherit);min-height:44px}',
 '.gn-ds-full-summary::-webkit-details-marker{display:none}.gn-ds-full-summary::before{content:"›";margin-inline-end:8px;font-size:19px}',
 '.gn-ds-full[open]>.gn-ds-full-summary::before{content:"⌄"}',
 '.gn-ds-full-body{padding:11px 13px;border-top:1px solid var(--line,var(--border,#ccc));min-width:0}',
 '.gn-ds-biblio,.gn-ds-provenance,.gn-ds-context{font:12px/1.6 system-ui,sans-serif;margin:9px 0;overflow-wrap:anywhere}',
 '.gn-ds-context{opacity:.86}.gn-ds-note{padding:10px 12px;margin:10px 0;border-inline-start:3px solid var(--accent,#668);background:var(--nav,var(--paper,transparent));font:12px/1.6 system-ui,sans-serif}',
 '.gn-ds-link{display:inline-block;color:var(--accent,inherit);text-decoration:underline;text-underline-offset:2px;margin-inline-end:12px}',
 '.gn-ds-edition{font:12px/1.6 system-ui,sans-serif}.gn-ds-edition summary{cursor:pointer;color:var(--accent,inherit);padding:8px 0}',
 '.gn-ds-loading,.gn-ds-error{font:13px/1.55 system-ui,sans-serif}.gn-ds-retry{min-height:42px}',
 '@media(max-width:660px){.gn-ds-source{padding:12px}.gn-ds-parallel{grid-template-columns:minmax(0,1fr);gap:8px}.gn-ds-ar{font-size:21px!important}}',

 /* Minimal dictionary: one modal scroll area and source disclosures, without altering any evidence. */
 '#infoOverlay.gn-ds-dictionary-open .detail-dialog{display:flex;flex-direction:column;box-sizing:border-box;overflow:hidden;padding:0!important;width:min(760px,calc(100vw - 18px));max-height:calc(100dvh - 18px)}',
 '#infoOverlay.gn-ds-dictionary-open .detail-top{box-sizing:border-box;position:relative;flex:0 0 auto;min-height:50px;padding:8px 18px;background:var(--surface);border-bottom:1px solid var(--line)}',
 '#infoOverlay.gn-ds-dictionary-open #detailContent{box-sizing:border-box;min-width:0;min-height:0;flex:1 1 auto;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-gutter:stable;padding:12px clamp(14px,3vw,25px) 22px}',
 '#infoOverlay.gn-ds-dictionary-open .lex-header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:3px 15px}',
 '#infoOverlay.gn-ds-dictionary-open .lex-header h2{margin:0;font-size:clamp(23px,3vw,29px)}',
 '#infoOverlay.gn-ds-dictionary-open .lex-header .arabic-detail{font-size:clamp(23px,3vw,28px);margin:0}',
 '#infoOverlay.gn-ds-dictionary-open .gn-ds-popup-nav{position:sticky;top:-12px;z-index:5;display:flex;gap:5px;align-items:stretch;margin:10px 0 12px;padding:7px 0;border-bottom:1px solid var(--line);background:var(--surface)}',
 '#infoOverlay.gn-ds-dictionary-open .gn-ds-jump,#infoOverlay.gn-ds-dictionary-open .gn-ds-fullpage{box-sizing:border-box;display:flex;align-items:center;justify-content:center;min-width:0;min-height:42px;padding:6px 9px;border:1px solid var(--border);border-radius:7px;font:600 12px/1.3 var(--sans,system-ui);white-space:nowrap;text-decoration:none;background:var(--paper);color:var(--text);cursor:pointer}',
 '#infoOverlay.gn-ds-dictionary-open .gn-ds-fullpage{margin-inline-start:auto;color:var(--accent)}',
 '.gn-ds-source{padding:0!important;overflow:hidden;background:var(--paper,var(--surface));border:1px solid var(--line,var(--border))}',
 '.gn-ds-source-summary{cursor:pointer;list-style:none;display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:8px;align-items:center;padding:11px 13px 11px 32px;min-height:56px;position:relative;box-sizing:border-box;color:var(--text,var(--ink,inherit))}',
 '.gn-ds-source-summary::-webkit-details-marker{display:none}.gn-ds-source-summary::marker{content:""}',
 '.gn-ds-source-summary::before{content:"›";position:absolute;inset-inline-start:12px;top:50%;transform:translateY(-50%);font:600 22px/1 var(--sans,system-ui);color:var(--accent)}',
 '.gn-ds-source-disclosure[open]>.gn-ds-source-summary{background:var(--accent-soft,var(--surface-alt));border-bottom:1px solid var(--line,var(--border))}',
 '.gn-ds-source-disclosure[open]>.gn-ds-source-summary::before{transform:translateY(-50%) rotate(90deg)}',
 '.gn-ds-source-label{font:600 16px/1.3 var(--serif,Georgia,serif);grid-column:1;min-width:0}',
 '.gn-ds-source-meta{font:12px/1.5 var(--sans,system-ui);color:var(--text-soft,var(--muted,inherit));grid-column:1;overflow-wrap:anywhere}',
 '.gn-ds-source-count{font:600 11px/1.4 var(--sans,system-ui);color:var(--text-soft,var(--muted,inherit));white-space:nowrap;grid-column:2;grid-row:1/3}',
 '.gn-ds-source-content{padding:2px 13px 14px;min-width:0}.gn-ds-source-content>.gn-ds-source-head{margin:10px 0 0}',
 '.gn-ds-heading{font:600 18px/1.3 var(--serif,Georgia,serif);margin:7px 0}',
 '.gn-ds-overview{font:12px/1.5 var(--sans,system-ui)!important;color:var(--text-soft,var(--muted,inherit))!important;margin:4px 0 7px!important}',
 '.gn-ds-tools{display:flex;justify-content:flex-end;margin:4px 0}',
 '.gn-ds-expand-all{min-height:38px;border:1px solid var(--border);border-radius:7px;background:var(--paper);color:var(--text);font:600 12px/1.3 var(--sans,system-ui);padding:6px 10px;cursor:pointer}',
 '.gn-ds-guidance{font:12px/1.55 var(--sans,system-ui);color:var(--text-soft,var(--muted,inherit))}.gn-ds-guidance>summary{cursor:pointer;min-height:34px;display:flex;align-items:center;color:var(--accent)}',
 '.gn-ds-guidance .gn-ds-help{font:12px/1.55 var(--sans,system-ui)!important;margin:3px 0 8px!important}',
 '.gn-ds-source-summary:focus-visible,.gn-ds-full-summary:focus-visible,.gn-ds-guidance>summary:focus-visible,.gn-ds-expand-all:focus-visible,.gn-ds-jump:focus-visible,.gn-ds-fullpage:focus-visible{outline:2px solid var(--accent);outline-offset:2px}',
 '@media(max-width:600px){#infoOverlay.gn-ds-dictionary-open .detail-dialog{max-height:calc(100dvh - 12px)}#infoOverlay.gn-ds-dictionary-open .detail-top{padding:7px 11px}#infoOverlay.gn-ds-dictionary-open #detailContent{padding:9px 12px calc(14px + env(safe-area-inset-bottom,0px))}#infoOverlay.gn-ds-dictionary-open .gn-ds-popup-nav{top:-9px;gap:4px}#infoOverlay.gn-ds-dictionary-open .gn-ds-jump,#infoOverlay.gn-ds-dictionary-open .gn-ds-fullpage{font-size:11px;padding:6px 7px}.gn-ds-source-count{font-size:10px}}',
 '@media(max-width:360px){#infoOverlay.gn-ds-dictionary-open .gn-ds-popup-nav{display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}#infoOverlay.gn-ds-dictionary-open .gn-ds-jump,#infoOverlay.gn-ds-dictionary-open .gn-ds-fullpage{font-size:10px;white-space:normal;text-align:center}}',
 '@media print{.gn-ds-full:not([open]){display:none}.gn-ds-source{break-inside:avoid-page}}'
 ].join('\n');
 document.head.append(st);
}
function start(){
 document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-gn-ds-jump]');
  if(!button||!button.closest('#infoOverlay.gn-ds-dictionary-open'))return;
  event.preventDefault();jumpInsidePopup(button.dataset.gnDsJump);
 });
 styles();sync();
 const observer=new MutationObserver(schedule);
 for(const sel of ['#detailContent','#lexArticle','#mainContent']){
  const node=$(sel);if(node)observer.observe(node,{subtree:true,childList:true});
 }
 const overlay=$('#infoOverlay');
 if(overlay)observer.observe(overlay,{attributes:true,attributeFilter:['hidden','class','style']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
