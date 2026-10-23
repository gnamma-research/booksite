/* Gnamma contextual word hub. Multiple independent meanings may attach to
 * the same text span: lexical entry, editorial/source note, private annotation,
 * and temporary search highlight. Do not turn one into another.
 *
 * PRECEDENCE: explicitly interactive anchors keep their existing action;
 * a plain Arabic word opens this hub; text selections retain Reading Desk
 * actions plus an opt-in Explore action. Personal material never leaves localStorage.
 */
(()=>{
'use strict';
if(window.GnammaWordContext)return;
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const AR=/[\u0621-\u064a]/u,LETTER=/[\p{L}\p{M}]/u;
const PRIV='gnamma-reading-desk-v1',BOOK=(()=>{
 try{return JSON.parse($('#editionData')?.textContent||'null')}catch(e){return null}
})();
const morph=()=>window.GnammaMorphology||null;
let shade=null,selected=null,oldFocus=null,lastDictionary=null,rendering=false;
function locator(){
 const hit=location.hash.match(/(?:section=|section\/)(\d+)/);
 return hit?hit[1]:String($('#mainContent .reader [data-section-current]')?.dataset.sectionCurrent||'');
}
function readPrivate(section,segment,phrase){
 let info={marks:[],notes:[],bookmarks:[],highlights:[],dictionary:[]};
 try{
  const raw=JSON.parse(localStorage.getItem(PRIV)||'null');
  if(raw?.format!=='gnamma-reading-desk'||raw.version!==1||!Array.isArray(raw.items))return info;
  const fold=morph()?.fold||((x)=>String(x||'').toLowerCase());
  const w=fold(phrase||'');
  for(const item of raw.items){
   if(item?.deleted||!item?.target||!['note','section','paragraph','quote','dictionary'].includes(item.kind))continue;
   const t=item.target;
   if(String(t.section||'')!==String(section))continue;
   if(t.kind==='quote'&&Number(t.segment)!==Number(segment))continue;
   if(t.kind==='paragraph'&&Number(t.segment)!==Number(segment))continue;
   const exact=t.kind==='quote'&&w&&fold(t.quote||'').includes(w);
   const atParagraph=['quote','paragraph'].includes(t.kind);
   const group=item.kind==='note'?'notes':t.kind==='quote'?'highlights':'bookmarks';
   if(!atParagraph&&t.kind!=='section')continue;
   info[group].push({title:item.title||t.quote||'',kind:t.kind,exact:!!exact,scope:t.kind==='section'?'section':t.kind==='paragraph'?'paragraph':'selected words'});
  }
 }catch(e){info.error='Saved annotation collection cannot be read; it has not been changed.';}
 return info;
}
function getInPageDictionary(word,analysis){
 if(!BOOK?.glossary)return [];
 const fold=morph()?.fold||((s)=>String(s||'').toLowerCase());
 const keys=new Set([fold(word),fold(analysis?.best?.lemma)]);
 return BOOK.glossary.filter(item=>{
  const forms=String(item.ar||'').split(/[,،؛;\/]/u).map(fold);
  return forms.some(f=>f&&keys.has(f));
 }).slice(0,8);
}
function attachedNotes(section,segment,anchor){
 if(!BOOK?.notes||!BOOK?.sections)return {exact:[],section:[]};
 const sec=BOOK.sections.find(x=>String(x.id)===String(section));
 if(!sec)return {exact:[],section:[]};
 const ids=new Set(sec.noteIds||[]),all=BOOK.notes.filter(n=>ids.has(n.id));
 const target=anchor?.closest?.('[data-note-target]');
 const exact=target?all.filter(n=>n.id===target.dataset.noteTarget):[];
 // Passage or section notes are NOT claimed as evidence about one word.
 return {exact,section:all.filter(n=>!exact.includes(n)).slice(0,8)};
}
function noteKind(note){
 if(note.source_type==='quran'||note.kind==='quran-source')return 'Qurʾān source';
 if(note.source_type==='hadith'||note.kind==='hadith-source')return 'Hadith source';
 if(note.source_type==='application')return 'Bidāya application source';
 const label={
  textual:'Textual / variant note',
  grammar:'Grammar note',
  translation:'Translation / editor note',
  scholarship:'Scholarly apparatus note',
  interpretive:'Interpretive note',
  lexical:'Lexical note',
  crux:'Textual crux',
  quotation:'Quotation/source note'
 };
 return label[note.kind]||note.kindLabel||'Edition note (attribution unverified)';
}
function currentToken(node,index){
 const text=node?.textContent||'';
 if(!text)return null;
 let at=Math.min(text.length-1,Math.max(0,index||0));
 if(!LETTER.test(text[at]||'')&&at>0&&LETTER.test(text[at-1]||''))at--;
 if(!LETTER.test(text[at]||''))return null;
 let a=at,b=at+1;
 while(a>0&&LETTER.test(text[a-1]))a--;
 while(b<text.length&&LETTER.test(text[b]))b++;
 const word=text.slice(a,b);
 return AR.test(word)?word:null;
}
function passageOccurrence(word,grid,point,section,segment){
 const engine=morph(),content=grid?.querySelector('.passage-ar');
 if(!engine||!content||!point?.node||!content.contains(point.node))
  return {position:null,neighbours:[]};
 try{
  const range=document.createRange();
  range.setStart(content,0);
  range.setEnd(point.node,point.offset);
  const prefix=engine.tokenize(range.toString()).length;
  const tokens=engine.tokenize(content.textContent||'');
  const key=engine.fold(word);
  const published=BOOK?.sections?.find(x=>String(x.id)===String(section))
   ?.segments?.[segment];
  const sourceTokens=engine.tokenize(published?.ar||published?.vocalized||'');
  // A caret at the beginning of a word and a caret within it differ by one token.
  // Never apply a morphological analysis from a different occurrence.
  const position=[Math.max(0,prefix-1),prefix]
   .find(i=>tokens[i]&&engine.fold(tokens[i].word)===key);
  if(position===undefined||sourceTokens.length!==tokens.length||
    engine.fold(sourceTokens[position]?.word||'')!==key)
   return {position:null,neighbours:[]};
  return {position,neighbours:[tokens[position-1]?.word||'',tokens[position+1]?.word||'']};
 }catch(_){return {position:null,neighbours:[]};}
}
function atTap(e){
 const x=e.clientX,y=e.clientY;
 const pos=document.caretPositionFromPoint?.(x,y);
 const range=!pos?document.caretRangeFromPoint?.(x,y):null;
 return {node:pos?.offsetNode||range?.startContainer,
   offset:pos?.offset??range?.startOffset??0};
}
function findSelectedWord(){
 const sel=window.getSelection?.();if(!sel||sel.isCollapsed||!sel.rangeCount)return null;
 const text=sel.toString().trim().split(/\s+/)[0].replace(/[^\p{L}\p{M}]/gu,'');
 if(!AR.test(text))return null;
 const parent=(sel.anchorNode?.nodeType===1?sel.anchorNode:sel.anchorNode?.parentElement);
 const grid=parent?.closest?.('.passage-grid');
 return {word:text,anchor:parent,grid};
}
function actions(word,analysis){
 let lemma=analysis.best?.lemma||'',root=analysis.best?.root||'';
 if(!lemma&&!root){
  const available=morph()?.getLexicon()||[];
  const matches=available.filter(x=>(x.formKeys||[]).includes(morph()?.fold(word)||word));
  if(matches.length===1){lemma=matches[0].lemma;root=matches[0].root;}
 }
 return {lemma,root};
}
function search(word,mode,facet='text'){
 close();
 window.GnammaUnifiedSearch?.openWith?.(word,mode,facet);
}
function showByKind(list,heading,css=''){
 if(!list?.length)return '';
 return '<section class="gnw-block '+css+'"><h3>'+esc(heading)+'</h3>'+
  list.map(item=>'<p>'+esc(item)+'</p>').join('')+'</section>';
}
function grammarName(key,value){
 const mapping={
  pos:{noun:'Noun',verb:'Verb',adj:'Adjective',prep:'Preposition',part:'Particle',
    conj:'Conjunction',pron:'Pronoun',noun_prop:'Proper noun'},
  cas:{n:'Nominative',a:'Accusative',g:'Genitive',u:'Unspecified case'},
  asp:{p:'Perfect',i:'Imperfect',c:'Imperative'},
  vox:{a:'Active',p:'Passive'},mod:{i:'Indicative',j:'Jussive',s:'Subjunctive'},
  stt:{d:'Definite',i:'Indefinite',c:'Construct (iḍāfa)'},
  num:{s:'Singular',d:'Dual',p:'Plural'},gen:{m:'Masculine',f:'Feminine'},
  per:{'1':'First person','2':'Second person','3':'Third person'}
 };
 return mapping[key]?.[value]||String(value||'');
}
function detailedGrammar(best,alternatives){
 const f=best?.features||{};
 const primary=[['cas','Case'],['asp','Verb form'],['vox','Voice'],['mod','Mood'],
  ['stt','Definiteness'],['num','Number'],['gen','Gender'],['per','Person']]
  .filter(([key])=>f[key]&&f[key]!=='na');
 const bits=primary.map(([key,name])=>'<div><dt>'+esc(name)+'</dt><dd>'+esc(grammarName(key,f[key]))+'</dd></div>').join('');
 const split=f.d3seg?'<p><strong>Model segmentation:</strong> <bdi lang="ar" dir="rtl">'+esc(f.d3seg)+'</bdi></p>':'';
 const pattern=f.pattern?'<p><strong>Stem pattern:</strong> <bdi lang="ar" dir="rtl">'+esc(f.pattern)+'</bdi></p>':'';
 const gloss=f.gloss?'<p>Model lexicon gloss (not a verified passage translation): '+esc(f.gloss)+'</p>':'';
 const suggested=f.diac&&f.diac!==best.surface?'<p>Suggested vowels: <bdi lang="ar" dir="rtl">'+esc(f.diac)+'</bdi></p>':'';
 const details=(primary.length||split||pattern||gloss||suggested)?
  '<details class="gnw-grammar"><summary>More grammar</summary>'+
   (bits?'<dl>'+bits+'</dl>':'')+suggested+split+pattern+gloss+
   '<small>Automatic features are not independently checked against Classical Arabic or editorial variants.</small></details>':'';
 const variants=alternatives.length?
  '<details class="gnw-grammar"><summary>'+alternatives.length+' other possible '+(alternatives.length===1?'analysis':'analyses')+'</summary>'+
  '<ul>'+alternatives.slice(0,5).map(x=>'<li>'+
   '<bdi lang="ar" dir="rtl">'+esc(x.lemma)+'</bdi> · '+esc(grammarName('pos',x.pos))+
   (x.features?.cas?' · '+esc(grammarName('cas',x.features.cas)):'')+
   ' <button type="button" data-gnw-search="morph-lemma" data-gnw-value="'+esc(x.lemma)+'">Search word forms</button></li>').join('')+'</ul></details>':'';
 return details+variants;
}
function wordMarkup(ctx){
 const {word,analysis,terms,notes,privateInfo,section,segment,highlightType}=ctx;
 const best=analysis?.best,alts=analysis?.alternatives||[];
 const names=actions(word,analysis||{});
 const root=names.root,lemma=names.lemma;
 const analysisSection='<section class="gnw-block"><h3>Word in this passage</h3>'+
  (best?'<div class="gnw-morph-line"><span>Dictionary form</span> <bdi dir="rtl" lang="ar">'+esc(best.lemma)+'</bdi>'+
   (best.root?' · <span>Root</span> <bdi dir="rtl" lang="ar">'+esc(best.root)+'</bdi>':'')+
   (best.pos?' · '+esc(grammarName('pos',best.pos)):'')+'</div>'+
   '<small>'+esc(morph()?.sourceLabel(best.source)||'Provisional analysis')+
     (best.source==='curated'?' · Candidate headword, not a verified reading of the sentence.':'')+
    '</small>'+detailedGrammar(best,alts):
   alts.length?'<p>This form has several possible analyses in the current index. The reading of this occurrence is not established.</p>'+
    '<ul>'+alts.slice(0,5).map(x=>'<li><bdi lang="ar" dir="rtl">'+esc(x.lemma)+'</bdi> · '+esc(grammarName('pos',x.pos))+
     ' <button type="button" data-gnw-search="morph-lemma" data-gnw-value="'+esc(x.lemma)+'">Search word forms</button></li>').join('')+'</ul>':
    '<p>No dependable analysis is available here yet. Ordinary word search remains available.</p>')+
  '</section>';
 const dictionary=terms.length?
   '<section class="gnw-block gnw-dictionary"><h3>Dictionary / glossary</h3>'+
   terms.map(t=>'<p><button type="button" data-gnw-term="'+esc(t.term)+'">'+
    '<strong>'+esc(t.term)+'</strong> <bdi lang="ar" dir="rtl">'+esc(t.ar||'')+'</bdi></button>'+
    '<span>'+esc(t.definition||'')+'</span></p>').join('')+'</section>':'';
 const exact=notes.exact.map(n=>
  '<button data-gnw-note="'+esc(n.id)+'">'+esc(noteKind(n)+' · '+n.id)+'</button>').join('');
 const sectionNotes=notes.section.length?
  '<details class="gnw-subnotes"><summary>'+notes.section.length+' notes attached to this section (not necessarily this word)</summary>'+
   notes.section.map(n=>'<button type="button" data-gnw-note="'+esc(n.id)+'">'+
      esc(noteKind(n)+' · '+n.id)+'</button>').join('')+'</details>':'';
 const editorial=(exact||sectionNotes)?
   '<section class="gnw-block"><h3>Editorial / source apparatus</h3>'+
    (exact?'<p>Directly anchored to this wording</p>'+exact:'')+sectionNotes+'</section>':'';
 const privateCount=privateInfo.notes.length+privateInfo.bookmarks.length+privateInfo.highlights.length;
 const own=privateCount?'<section class="gnw-block"><h3>Your Reading Desk · private</h3>'+
   '<p>'+privateInfo.notes.length+' personal notes · '+privateInfo.bookmarks.length+
   ' bookmarks · '+privateInfo.highlights.length+' saved selections in this section or paragraph.</p>'+
   '<button type="button" data-gnw-desk="1">Open Reading Desk</button></section>':'';
 const provenance=highlightType?'<p class="gnw-origin">'+esc(highlightType)+'</p>':'';
 const fullActions='<section class="gnw-block gnw-actions"><h3>Explore occurrences</h3>'+
   '<div class="gnw-action-grid">'+
   '<button type="button" data-gnw-search="literal" data-gnw-value="'+esc(word)+'">Exact word</button>'+
   '<button type="button" data-gnw-search="terms" data-gnw-value="'+esc(word)+'">Ordinary search</button>'+
   (lemma?'<button type="button" data-gnw-search="morph-lemma" data-gnw-value="'+esc(lemma)+'">Other forms</button>':'')+
   (root?'<button type="button" data-gnw-search="morph-root" data-gnw-value="'+esc(root)+'">Root family</button>':'')+
   '</div></section>';
 return '<header class="gnw-header"><div><small>WORD CONTEXT · '+(section?'§'+esc(section)+' · ¶'+(segment+1):'CURRENT SELECTION')+'</small>'+
  '<h2 id="gnw-title" lang="ar" dir="rtl">'+esc(word)+'</h2></div><button type="button" data-gnw-close="1" aria-label="Close word context">×</button></header>'+
  '<div class="gnw-body">'+provenance+analysisSection+dictionary+editorial+own+fullActions+
  '<p class="gnw-footnote">A dictionary term, source note, personal annotation and search match are independent layers. Nothing is changed or saved by opening this panel.</p></div>';
}
async function openWord(word,anchor,grid,trigger=null,point=null){
 if(!AR.test(word)||!BOOK)return;
 const section=locator(),segment=Number(grid?.dataset.segment||0);
 const originalTarget=trigger||anchor;
 const hasSource=!!originalTarget?.closest?.('[data-note-target]');
 const noted=attachedNotes(section,segment,
   anchor?.closest?.('[data-note-target]')?anchor:hasSource?originalTarget:null);
 const highlightType=originalTarget?.closest?.('mark.search-hit')?'Temporary search highlight':
   originalTarget?.closest?.('[data-rd-quote],[data-rd-bookmark]')?'Saved reading annotation':null;
 const privateInfo=readPrivate(section,segment,word);
 const engine=morph(),occurrence=passageOccurrence(word,grid,point,section,segment);
 let analysis=engine?.disambiguate(word,occurrence.neighbours,'daruri',
   section?'passage:'+section+':'+segment:null,occurrence.position)||
   {best:null,alternatives:[],certainty:'unavailable'};
 const ctx={word,anchor,grid,section,segment,notes:noted,highlightType,privateInfo,analysis,
   terms:getInPageDictionary(word,analysis)};
 selected=ctx;
 oldFocus=document.activeElement;
 if(!shade){
  shade=document.createElement('div');shade.id='gnamma-word-context';shade.className='gnw-root';
  shade.setAttribute('role','dialog');shade.setAttribute('aria-modal','true');shade.setAttribute('aria-labelledby','gnw-title');
  document.body.append(shade);
 }
 rendering=true;
 shade.innerHTML='<div class="gnw-backdrop" data-gnw-close="1"></div><div class="gnw-card">'+wordMarkup(ctx)+'</div>';
 shade.hidden=false;rendering=false;
 $('button[data-gnw-close]',shade)?.focus({preventScroll:true});
 // Upgrade from a curated lexicon to the precomputed source-linked occurrence.
 engine?.loadLexicon().then(()=>engine.ensure('daruri')).then(async()=>{
   if(section&&engine.ensureDetail)await engine.ensureDetail('daruri',
     'passage:'+section+':'+segment);
  }).then(()=>{
   if(shade?.hidden||selected!==ctx)return;
   ctx.analysis=engine.disambiguate(word,occurrence.neighbours,'daruri',
     section?'passage:'+section+':'+segment:null,occurrence.position);
   ctx.terms=getInPageDictionary(word,ctx.analysis);
   const card=$('.gnw-card',shade);
   if(card)card.innerHTML=wordMarkup(ctx);
 }).catch(()=>{});
}
function close(){
 if(!shade||shade.hidden)return;
 shade.hidden=true;selected=null;
 try{oldFocus?.focus?.({preventScroll:true})}catch(_){}
}
function installDictionaryActions(){
 const popup=$('#infoOverlay'),container=$('#detailContent');
 if(!popup||popup.hidden||!container||$('#gnw-dictionary-search',container))return;
 if(!/(DICTIONARY|LEXICAL|GLOSSARY)/i.test($('#detailEyebrow')?.textContent||''))return;
 const t=lastDictionary?.term||container.querySelector('h2')?.textContent?.trim();
 if(!t)return;
 const button=document.createElement('div');
 button.id='gnw-dictionary-search';button.className='gnw-dictionary-actions';
 button.innerHTML='<p><strong>Explore this term</strong> · dictionary information remains above</p>'+
   '<button type="button" data-gnw-search="terms" data-gnw-value="'+esc(t)+'">Search text</button>'+
   '<button type="button" data-gnw-search="morph-lemma" data-gnw-value="'+esc(t)+'">Word forms</button>'+
   '<button type="button" data-gnw-search="morph-root" data-gnw-value="'+esc(t)+'">Root family</button>';
 container.append(button);
}
function augmentSelectionBar(){
 const bar=$('#gn-rd-selection-bar');
 if(!bar||bar.hidden||bar.querySelector('[data-gnw-selection]'))return;
 const selected=findSelectedWord();if(!selected)return;
 const b=document.createElement('button');b.type='button';b.dataset.gnwSelection='1';
 b.className='gn-rd-tool-icon gnw-select-word';b.textContent='Explore word';b.title='Dictionary, notes and root/lemma search';
 bar.append(b);
}
document.addEventListener('click',e=>{
 const btn=e.target?.closest?.('[data-gnw-close],[data-gnw-search],[data-gnw-term],[data-gnw-note],[data-gnw-desk],[data-gnw-selection]');
 if(btn){
  if(btn.hasAttribute('data-gnw-close')){e.preventDefault();close();return;}
  if(btn.hasAttribute('data-gnw-search')){
   e.preventDefault();const mode=btn.dataset.gnwSearch,term=btn.dataset.gnwValue||'';
   if(mode==='morph-root'||mode==='morph-lemma'){
    // For a glossary-only English label, consult its Arabic equivalent.
    const row=BOOK?.glossary?.find(t=>t.term===term);
    const lemma=row?.ar||term;
    search(lemma,mode);
   }else search(term,mode);
   return;
  }
  if(btn.hasAttribute('data-gnw-note')){
   e.preventDefault();const id=btn.dataset.gnwNote;close();
   const target=document.getElementById('note-'+id);
   if(target){target.open=true;target.scrollIntoView({block:'center',behavior:'smooth'});}
   else document.querySelector('[data-note-target="'+CSS.escape(id)+'"]')?.click();
   return;
  }
  if(btn.hasAttribute('data-gnw-term')){
   e.preventDefault();const term=btn.dataset.gnwTerm;close();
   const related=$('[data-term="'+CSS.escape(term)+'"]');
   related?.click();return;
  }
  if(btn.hasAttribute('data-gnw-desk')){e.preventDefault();close();$('[data-route=bookmarks]')?.click();return;}
  if(btn.hasAttribute('data-gnw-selection')){
   e.preventDefault();e.stopPropagation();const current=findSelectedWord();
   if(current)openWord(current.word,current.anchor,current.grid,e.target);
   return;
  }
 }
 const dict=e.target?.closest?.('[data-term]');
 if(dict){lastDictionary={term:dict.dataset.term};queueMicrotask(installDictionaryActions);return;}
 if(shade&&!shade.hidden)return;
 if(e.button!==0||e.detail===0)return;
 const content=e.target?.closest?.('#mainContent .passage-grid .passage-ar');
 if(!content)return;
 // Notes, source markers, dictionary links, saved-item controls and normal
 // text selection must retain their own established click semantics.
 if(e.target.closest('a,button,input,mark[data-rd],.note-anchored,[data-note-target],[data-rd]'))return;
 if(window.getSelection?.()?.toString().trim())return;
 const at=atTap(e),n=at.node;
 if(!n||!content.contains(n))return;
 const word=currentToken(n,at.offset);
 if(word)openWord(word,n.parentElement,content.closest('.passage-grid'),e.target,at);
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&shade&&!shade.hidden){e.preventDefault();close();}
 if(e.key==='Tab'&&shade&&!shade.hidden){
  const focus=$$('button:not([disabled]),a[href]',shade).filter(x=>x.getClientRects().length);
  if(!focus.length)return;
  if(e.shiftKey&&document.activeElement===focus[0]){e.preventDefault();focus.at(-1).focus();}
  else if(!e.shiftKey&&document.activeElement===focus.at(-1)){e.preventDefault();focus[0].focus();}
 }
});
document.addEventListener('selectionchange',()=>{
 // Existing Reading Desk toolbar is responsible for save actions. Do not
 // replace it; add an optional word exploration action when it appears.
 queueMicrotask(augmentSelectionBar);
});
new MutationObserver(()=>{
 if(!rendering)installDictionaryActions();
 augmentSelectionBar();
}).observe(document.body,{subtree:true,childList:true,attributes:false});
window.GnammaWordContext=Object.freeze({openWord,close,findSelectedWord,locateOccurrence:passageOccurrence});
})();
