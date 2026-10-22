/* Gnamma unified scholarly search v1. Browser-local personal index; no data leaves this device.
   Retains the previous Daruri search as a no-script / failed-enhancement fallback. */
(function () {
'use strict';
const CONFIG = {version:'20261022-scholarly1', source:'al-Ḍarūrī', pageSize:40, quickSize:6,
  moreUrl:'../texts/al-ghazali/al-mustasfa/data/gnamma-search-index.json'};
const $ = (s,p=document) => p.querySelector(s);
const $$ = (s,p=document) => Array.from(p.querySelectorAll(s));
const base = $('#editionData'), dictionaryBase = $('#dictionaryData'), searchTrigger = $('#searchBtn');
if (!base || !dictionaryBase || !searchTrigger) return;
let BOOK, DICTIONARY;
try {BOOK=JSON.parse(base.textContent);DICTIONARY=JSON.parse(dictionaryBase.textContent);}
catch(err){console.warn('Gnamma search: source data unavailable',err);return;}
const STUDY = window.DARURI_STUDY_DATA || {};
const LOCAL_KEY = 'gnamma-reading-desk-v1';
const TYPES = [
  ['text','Text','book-open'],['note','Editorial notes','notebook-pen'],
  ['source','Source references','file-text'],['dictionary','Dictionary','book-a'],
  ['concept','Concept index','layers'],['application','Bidāya','scale'],
  ['study','Study guide','graduation-cap'],['personal','My notes','notebook'],
  ['highlight','My highlights','highlighter'],['bookmark','My bookmarks','bookmark'],
  ['other','Other Gnamma texts','library']
];
const HTML_ENT = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
const esc = x => String(x==null?'':x).replace(/[&<>"']/g,c=>HTML_ENT[c]);
const xml = x => esc(x).replace(/'/g,'&#39;');
function fold(value) {
 return String(value==null?'':value).toLowerCase().normalize('NFD')
   .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u06d6-\u06ed]/g,'')
   .replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي')
   .replace(/[ʿʾ‘’ʻ'\u0060]/g,'').replace(/ـ/g,'')
   .replace(/\s+/g,' ').trim();
}
const hasArabic=s=>/[\u0600-\u06ff]/.test(String(s||''));
function foldMapped(raw){
 const chars=[],offsets=[]; let i=0;
 for(const ch of String(raw||'')){
  const start=i; i+=ch.length;
  // fold() trims individual characters. Preserve whitespace here so offsets
  // correspond to the same normalized text used for matching.
  const f=/\s/u.test(ch)?' ':fold(ch);
  for(const c of f){
   if(c===' '&&chars.at(-1)===' '){offsets[offsets.length-1][1]=i;continue;}
   chars.push(c);offsets.push([start,i]);
  }
 }
 while(chars[0]===' '){chars.shift();offsets.shift();}
 while(chars.at(-1)===' '){chars.pop();offsets.pop();}
 return {norm:chars.join(''),offsets:offsets};
}
function boundary(norm,start,len,stem){
 const prev=start?norm[start-1]:'',next=norm[start+len]||'';
 const latin=/[a-z0-9]/,word=/[\p{L}\p{N}]/u;
 if(stem)return true;
 const left=!prev||!word.test(prev),right=!next||!word.test(next);
 if(left&&right)return true;
 // Arabic definite article, conjunctions and attached short particles are lexical expansions,
 // not exact whole-word matches.
 return false;
}
function offsetsOf(raw,term,whole,stem){
 const f=fold(raw),t=fold(term);if(!t)return null;
 let from=0;
 while(from<=f.length-t.length){
  const i=f.indexOf(t,from);
  if(i<0)return null;
  if(!whole||boundary(f,i,t.length,stem))return {at:i,end:i+t.length,term:term};
  from=i+1;
 }
 return null;
}
function arExpanded(text,term){
 const t=fold(term);
 if(!hasArabic(term)||t.length<2)return null;
 // Only well-defined clitics; do not perform unchecked Arabic root matching.
 const clitics=['ال','وال','فال','بال','كال','لل','و','ف','ب','ل','ك'];
 for(const clitic of clitics){
  const m=offsetsOf(text,clitic+t,true,false);if(m)return {at:m.at,end:m.end,term:clitic+term};
 }
 return null;
}
function snippet(raw,match,rtl){
 const txt=String(raw||'').replace(/\s+/g,' ').trim();
 if(!txt)return '';
 const value=foldMapped(txt),query=fold(match&&match.term||'');
 let at=query?value.norm.indexOf(query):-1;
 if(at<0&&match&&match.at!=null)at=match.at;
 if(at<0)return '<span>'+esc(txt.slice(0,235))+(txt.length>235?'…':'')+'</span>';
 // Find source offsets without assuming normalized Arabic string length equals original length.
 const lo=value.offsets[Math.max(0,at)]?.[0]||0;
 const hi=value.offsets[Math.min(value.offsets.length-1,at+query.length-1)]?.[1]||Math.min(txt.length,lo+query.length);
 const beg=Math.max(0,lo-75),end=Math.min(txt.length,hi+125);
 return (beg?'…':'')+esc(txt.slice(beg,lo))+'<mark>'+esc(txt.slice(lo,hi))+'</mark>'+esc(txt.slice(hi,end))+(end<txt.length?'…':'');
}
const registry = [
 {id:'qiyas',ar:'قياس',en:['qiyās','qiyas','qeyas','qiyaas','kiyas','analogy'],definition:'Analogy and syllogistic reasoning'},
 {id:'ijtihad',ar:'اجتهاد',en:['ijtihād','ijtihad','ijtehad','ijtehaad','ijtahad','ijtihaad','juristic reasoning','independent legal reasoning'],definition:'Independent juristic effort'},
 {id:'taqlid',ar:'تقليد',en:['taqlīd','taqlid','taklid','takleed','following authority'],definition:'Following an authoritative judgement'},
 {id:'tawatur',ar:'تواتر',en:['tawātur','tawatur','tawaatur','mass transmission'],definition:'Mass or recurrent transmission'},
 {id:'ijma',ar:'إجماع',en:['ijmāʿ','ijma','ijmaa','ejma','consensus'],definition:'Juristic consensus'},
 {id:'naskh',ar:'نسخ',en:['naskh','abrogation'],definition:'Abrogation'},
 {id:'illah',ar:'علة',en:['ʿilla','illa','illah','3illa','legal cause'],definition:'Effective cause'},
 {id:'hukm',ar:'حكم',en:['ḥukm','hukm','hokm','hokum','ruling','legal judgement'],definition:'Legal judgement'},
 {id:'amr',ar:'أمر',en:['amr','command'],definition:'Command'},
 {id:'nahy',ar:'نهي',en:['nahy','prohibition'],definition:'Prohibition'},
 {id:'dalala',ar:'دلالة',en:['dalāla','dalala','indication'],definition:'Indication'},
 {id:'zann',ar:'ظن',en:['ẓann','zann','probability'],definition:'Probability'},
 {id:'maslaha',ar:'مصلحة',en:['maṣlaḥa','maslaha','maslahah','masleha','benefit','welfare'],definition:'Benefit'},
 {id:'taklif',ar:'تكليف',en:['taklīf','taklif','legal responsibility'],definition:'Responsibility'},
 {id:'usul',ar:'أصول الفقه',en:['uṣūl al-fiqh','usul al-fiqh','usool al-fiqh','usul','usool','osool','legal theory'],definition:'Legal theory'},
 {id:'sunna',ar:'سنة',en:['Sunna','Sunnah','sunah','suna','prophetic tradition'],definition:'Prophetic practice and precedent'},
 {id:'sharia',ar:'شريعة',en:['sharīʿa','sharia','shariah','shareeah'],definition:'Revealed law'},
 {id:'ilm',ar:'علم',en:['ʿilm','ilm','3ilm','knowledge'],definition:'Knowledge'},
 {id:'fiqh',ar:'فقه',en:['fiqh','fikh','jurisprudence'],definition:'Jurisprudence'},
 {id:'hadith',ar:'حديث',en:['ḥadīth','hadith','hadeeth','hadees','hadis'],definition:'Prophetic report'}
];
// Ordinary scholarly romanization: accept doubled vowels and common Latin chat forms.
 // This is intentionally a *terminology* lookup key, not a general fuzzy search across
 // every word of the book: it cannot silently turn distinct Arabic words into one.
function romanKey(word){
 const value=fold(word);
 if(hasArabic(value)||!/^[a-z0-9 -]+$/.test(value))return value;
 return value.replace(/3(?=[a-z])/g,'').replace(/2(?=[a-z])/g,'')
  .replace(/7(?=[a-z])/g,'h').replace(/[- ]+/g,'')
  .replace(/aa/g,'a').replace(/ee|ii/g,'i').replace(/oo|ou|uu/g,'u');
}
function lookupGroup(word){
 const norm=fold(word);
 if(!norm||hasArabic(norm))return aliases.get(norm)||null;
 const key=romanKey(norm);
 return aliases.get(norm)||aliases.get(key)||
   // The definite article is acceptable as a query spelling, not a
   // general substring rule over every literary word.
   (key.startsWith('al')&&key.length>4?aliases.get(key.slice(2)):null)||null;
}
const aliases=new Map();
function aliasGroup(words,label,provenance){
 const entries=[...new Set(words.map(fold).filter(x=>x&&x.length>1))];
 if(entries.length>22)return; // avoid runaway synonym groups
 for(const term of entries){
  const keys=[term];
  if(!hasArabic(term))keys.push(romanKey(term));
  for(const key of new Set(keys)){
   const old=aliases.get(key);
   if(!old||old.words.length<entries.length)aliases.set(key,{words:entries,label:label||'',provenance:provenance||'Curated terminology'});
  }
 }
}
registry.forEach(t=>aliasGroup([t.ar,...t.en],t.definition,'Curated bilingual concept registry'));
for(const term of BOOK.glossary||[]){
 const dict=DICTIONARY.terms?.[term.term]||{};
 aliasGroup([term.term,term.ar,...(dict.aliasesAr||[]),...(dict.aliasesEn||[])],term.term,'Verified edition glossary');
}
function termSuggestions(raw){
 const text=romanKey(raw);
 if(!text||hasArabic(text)||text.length<2||text.length>16||!/^[a-z0-9]+$/.test(text))return [];
 const matches=[],seen=new Set();
 const catalog=[
  ...registry.map(t=>({label:t.en[0],arabic:t.ar,words:[...t.en,t.ar]})),
  ...(BOOK.glossary||[]).map(t=>({label:t.term,arabic:t.ar,words:[t.term,t.ar,...(DICTIONARY.terms?.[t.term]?.aliasesEn||[])]}))
 ];
 for(const item of catalog){
  const words=item.words.map(romanKey).filter(w=>/^[a-z]+$/.test(w));
  if(!words.some(w=>w.startsWith(text)))continue;
  const normalized=romanKey(item.label);
  if(seen.has(normalized))continue;seen.add(normalized);
  matches.push({query:item.label,label:item.label,arabic:item.arabic});
 }
 return matches.sort((a,b)=>romanKey(a.label).length-romanKey(b.label).length).slice(0,7);
}
let baseItems=[],otherItems=[],personalItems=[],allResults=[],visibleCount=0,lastRequest=0,fetching=false,otherLoaded=false,failedOther='';
function entry(row){
 const result=Object.assign({id:'',work:'daruri',type:'text',subtype:'',title:'',section:'',segment:null,body:'',ar:'',en:'',field:'',locator:'',privacy:'public',tag:'',kind:'',related:[],url:''},row);
 result.fields=[['title',result.title],['en',result.en],['ar',result.ar],['body',result.body],['locator',result.locator]]
  .filter(p=>p[1]).map(p=>({kind:p[0],raw:String(p[1]),norm:fold(p[1])}));
 return result;
}
function buildCore(){
 const out=[],src=DICTIONARY.sources||{};
 for(const s of BOOK.sections||[]){
  const sec=String(s.id),head=s.title||'Section',loc=sec==='colophon'?'Colophon':'§'+sec;
  out.push(entry({type:'text',id:'heading:'+sec,section:sec,segment:-1,
   title:head,ar:s.headingAr||'',en:s.headingEn||'',locator:loc,
   subtype:'Section heading',body:[s.headingVocalized,s.tags?.join(' '),s.pages?.join(' ')].filter(Boolean).join(' · ')}));
  for(let i=0;i<(s.segments||[]).length;i++){
   const p=s.segments[i];
   out.push(entry({type:'text',id:'passage:'+sec+':'+i,section:sec,segment:i,
    title:head,locator:loc+' · ¶'+(i+1),subtype:'Authorial text',
    en:p.en||'',ar:p.ar||p.vocalized||'',body:'',related:s.tags||[]}));
  }
 }
 for(const n of BOOK.notes||[]){
  const isSource=['quran-source','hadith-source'].includes(n.kind);
  const links=[...(n.references||[]).map(r=>r.label_en||r.label_ar||r.reference||''),
   ...(n.source_references||[]).map(r=>r.reference||r.label_en||'')].join(' · ');
  out.push(entry({type:isSource?'source':'note',id:n.id,section:String(n.n||n.section_id||''),
    subtype:n.kindLabel||n.kind,title:(n.kindLabel||n.kind)+' · '+n.id,
    locator:(n.n?'§'+n.n+' · ':'')+n.id,body:[n.text,n.textAr,links,n.sourceLabel].filter(Boolean).join(' · ')}));
 }
 for(const g of BOOK.glossary||[]){
  out.push(entry({type:'dictionary',id:g.term,title:g.term,ar:g.ar,
   subtype:'Technical definition',en:g.definition,locator:(g.sections||[]).map(n=>'§'+n).slice(0,8).join(', ')}));
 }
 for(const [term,cfg] of Object.entries(DICTIONARY.terms||{})){
  for(const key of cfg.sources||[]){
   const source=src[key];if(!source)continue;
   out.push(entry({type:'dictionary',id:'historical:'+term+':'+key,title:term,
    subtype:'Historical source · '+(source.author||source.work||'Dictionary'),ar:source.quote||source.ar||'',
    en:source.translation||source.en||'',body:[source.author,source.work,source.comment,source.source].filter(Boolean).join(' · '),
    locator:term,tag:'historical',url:'dictionary.html#view=all&term='+encodeURIComponent(term)}));
  }
 }
 for(const [i,idx] of (BOOK.index||[]).entries()){
  out.push(entry({type:'concept',id:'concept:'+i,title:idx.term,subtype:'Subject heading',
   locator:'Subject index',body:(idx.sub||[]).map(s=>s.label).join(' · ')}));
  for(let j=0;j<(idx.sub||[]).length;j++){
   const sub=idx.sub[j];
   out.push(entry({type:'concept',id:'sub:'+i+':'+j,title:idx.term,
    subtype:'Subtopic',locator:idx.term,body:sub.label,
    related:(sub.sections||[]).map(String)}));
  }
 }
 for(const a of BOOK.apps||[]){
  out.push(entry({type:'application',id:a.id,title:a.title,section:String(a.n||''),
   subtype:'Comparative legal case',locator:[a.id,a.book,a.locator].filter(Boolean).join(' · '),body:a.text||''}));
 }
 for(const l of STUDY.lessons||[]){
  const studyParts=[l.title,l.summary,l.description,l.content,l.explanation,
   JSON.stringify(l.questions||[]),JSON.stringify(l.checks||[]),JSON.stringify(l.tasks||[])]
   .filter(Boolean).map(String);
  out.push(entry({type:'study',id:l.id,title:'Q'+l.number+' · '+l.title,
   subtype:'Lesson',locator:(l.sections||[]).map(s=>'§'+s).join(', '),body:studyParts.join(' · ')}));
 }
 return out;
}
baseItems=buildCore();
function readPersonal(){
 let saved;try{saved=JSON.parse(localStorage.getItem(LOCAL_KEY)||'{}');}catch(_){return [];}
 if(!Array.isArray(saved?.items))return [];
 return saved.items.filter(x=>x&&typeof x==='object'&&!x.deleted).map(p=>{
  const t=p.target||{},kind=p.kind,ty=kind==='note'?'personal':kind==='quote'?'highlight':'bookmark';
  const section=String(t.section||''),
   title=p.title||(kind==='note'?'Personal note':kind==='quote'?'Highlighted text':'Bookmark');
  const body=[p.body,t.quote,t.term,t.app,t.noteId,t.sub,t.lesson].filter(Boolean).join(' · ');
  const sectionInfo=(BOOK.sections||[]).find(s=>String(s.id)===section);
  const quoted=t.quote||'';
  // Saved quotations and metadata are indexed; ordinary bookmarks do not impersonate occurrences.
  return entry({type:ty,id:String(p.id||''),section,segment:t.segment==null?null:Number(t.segment),
   subtype:kind==='note'?'Personal note':kind==='quote'?'Highlight':'Bookmark',
   title,body:body||(sectionInfo?.title||''),locator:section?'§'+section:'',
   ar:hasArabic(quoted)?quoted:'',en:hasArabic(quoted)?'':quoted,privacy:'private',
   kind,tag:t.kind||'',related:[],created:p.created,updated:p.updated});
 });
}
function direct(q){
 const query=String(q||'').trim();
 let m=query.match(/^(?:§|section\s*|sec(?:tion)?\s*#?\s*)(\d{1,3})$/i);
 if(m){const id=String(Number(m[1]));return (BOOK.sections||[]).some(s=>String(s.id)===id)?{kind:'section',id:id}:null;}
 m=query.match(/^([A-Z][A-Z0-9_-]{1,35})$/i);
 if(!m)return null;
 const note=(BOOK.notes||[]).find(n=>n.id.toLowerCase()===query.toLowerCase());
 if(note)return {kind:'note',id:note.id};
 const app=(BOOK.apps||[]).find(a=>a.id.toLowerCase()===query.toLowerCase());
 if(app)return {kind:'application',id:app.id};
 if(/^Q\d{1,3}$/i.test(query)){const lesson=(STUDY.lessons||[]).find(l=>'Q'+l.number===query.toUpperCase());if(lesson)return {kind:'study',id:lesson.id};}
 return null;
}
function queryPlan(q,mode){
 const phrase=(q[0]==='"'&&q[q.length-1]==='"')||(q[0]==='“'&&q[q.length-1]==='”');
 const raw=phrase?q.slice(1,-1).trim():q.trim(),norm=fold(raw);
 if(!norm)return {raw,norm,need:[],direct:null,phrase};
 const group=mode==='literal'?null:lookupGroup(norm);
 // Exact words remain the only source of literal search; variants are distinguishable.
 const extras=group?group.words.filter(x=>x!==norm).slice(0,16):[];
 return {raw,norm,need:phrase||group?[[norm,...extras]]:norm.split(/\s+/).filter(Boolean).map(w=>[w]),
         direct:direct(raw),phrase,group};
}
function matchOne(raw,word,mode,strict){
 let m=offsetsOf(raw,word,true,false);
 if(m)return {match:m,expanded:false,reason:'Literal occurrence'};
 if(mode!=='literal'&&!strict){
  m=arExpanded(raw,word);
  if(m)return {match:m,expanded:true,reason:'Arabic attached form'};
 }
 return null;
}
function findMatch(rec,plan,mode){
 const candidateFields=rec.fields.filter(f=>f.kind!=='locator'&&
    !(rec.type==='text'&&rec.subtype==='Authorial text'&&f.kind==='title'));
 const hits=[];
 for(const alternatives of plan.need){
  let best=null;
  for(const f of candidateFields){
   for(let i=0;i<alternatives.length;i++){
    let candidate=matchOne(f.raw,alternatives[i],mode,plan.phrase);
    if(!candidate&&plan.phrase)candidate=offsetsOf(f.raw,alternatives[i],false,false);
    if(!candidate)continue;
    const rel=i===0?(candidate.expanded?'clitic':'literal'):'terminology';
    const hit={field:f.kind,raw:f.raw,term:candidate.match?.term||candidate.term,
      match:candidate.match||candidate,relation:rel,reason:rel==='terminology'?
      'Bilingual terminology · '+(plan.group?.provenance||'verified glossary'):
       rel==='clitic'?'Arabic grammatical form':'Literal wording'};
    const priority=(rel==='literal'?50:rel==='clitic'?36:28)+(f.kind==='title'?15:f.kind==='ar'||f.kind==='en'?12:0);
    if(!best||priority>best.priority)best={...hit,priority};
   }
  }
  if(!best)return null;
  hits.push(best);
 }
 if(!hits.length)return null;
 hits.sort((a,b)=>b.priority-a.priority);
 return hits[0];
}
// Proximity is positional *within one field* (language/paragraph) only.
// Window N counts intervening tokens; it never matches Arabic against English.
function nearParameters(query,options){
 const opts=options||{};
 const raw=String(query||'').trim();
 let left=raw,right=String(opts.nearTerm||'').trim();
 let maxGap=Math.max(0,Math.min(50,Math.round(Number(opts.nearGap) || 0)));
 let ordered=!!opts.nearOrdered,syntax=false;
 const inline=raw.match(/^(.+?)\s+(NEAR|BEFORE)\/(\d{1,2})\s+(.+)$/i);
 if(inline){
  left=inline[1].trim();right=inline[4].trim();
  maxGap=Math.min(50,Number(inline[3]));ordered=inline[2].toUpperCase()==='BEFORE';
  syntax=true;
 }else if(!right){
  // Convenient shorthand in proximity mode: two terms separated by a space.
  // Longer phrases should use the dedicated second-term field.
  const simple=raw.match(/^([^\s]+)\s+([^\s]+)$/u);
  if(simple){left=simple[1];right=simple[2];}
 }
 return {left,right,maxGap,ordered,syntax};
}
function findProximity(rec,leftPlan,rightPlan,options){
 const engine=window.GnammaProximity;
 if(!engine||rec.type==='text'&&rec.subtype!=='Authorial text')return null;
 const a=leftPlan.need.flat(),b=rightPlan.need.flat();
 if(!a.length||!b.length)return null;
 // Never fuse an English translation, Arabic original and editorial metadata
 // to invent a proximity relationship that the source itself does not have.
 const fields=rec.fields.filter(f=>['en','ar','body','title'].includes(f.kind)&&
   !(rec.type==='text'&&f.kind==='title')&&
   !(rec.type==='other'&&['Selected bilingual passage','Arabic witness'].includes(rec.subtype)&&f.kind==='title'));
 let best=null;
 for(const f of fields){
  if(!a.some(t=>f.norm.includes(fold(t)))||!b.some(t=>f.norm.includes(fold(t))))continue;
  // Prose assembled with editorial " · " separators is not one passage.
  const chunks=f.kind==='body'?f.raw.split(/\s+·\s+/u):[f.raw];
  for(const raw of chunks){
   if(!a.some(t=>fold(raw).includes(fold(t)))||!b.some(t=>fold(raw).includes(fold(t))))continue;
   const hit=engine.find(raw,a,b,{maxGap:options.maxGap,ordered:options.ordered,normalize:fold});
   if(!hit)continue;
   const priority=90-hit.gap*2+(f.kind==='ar'||f.kind==='en'?20:0);
   if(!best||priority>best.priority){
    best={field:f.kind,raw,relation:'proximity',gap:hit.gap,maxGap:options.maxGap,
      ordered:options.ordered,nearA:hit.a,nearB:hit.b,
      leftQuery:options.left,rightQuery:options.right,
      match:{term:hit.a.matched,at:hit.a.offsetStart,end:hit.a.offsetEnd},
      priority,reason:'Within '+hit.gap+' intervening word'+(hit.gap===1?'':'s')+
       (options.ordered?' · in order':' · either order')+
       ' · same '+(f.kind==='ar'?'Arabic':f.kind==='en'?'English':f.kind==='title'?'title':'annotation')+' field (curated equivalents included)'};
   }
  }
 }
 return best;
}
function publicConcepts(plan,existing){
 if(!plan.norm)return [];
 const concepts=[],seen=new Set(existing.map(r=>r.work+':'+r.id));
 const alternatives=plan.need.flat().filter(Boolean);
 const applicable=(BOOK.index||[]).filter(idx=>
  alternatives.some(a=>offsetsOf(idx.term,a,true,false))||
  (plan.group&&plan.group.words.some(a=>offsetsOf(idx.term,a,true,false))));
 let added=0;
 for(const idx of applicable){
  for(const sub of idx.sub||[]){
   for(const section of sub.sections||[]){
    const sec=String(section),key='concept-link:'+idx.term+':'+sec+':'+sub.label;
    if(seen.has('daruri:'+key))continue;
    const original=BOOK.sections.find(s=>String(s.id)===sec);
    if(!original)continue;
    concepts.push({...entry({type:'concept',id:key,title:original.title,
     subtype:'Related passage · indexed',section:sec,locator:'§'+sec+' · '+idx.term,
     body:sub.label,tag:'subject-parallel'}),score:11,
     matched:{field:'body',raw:sub.label,term:plan.raw,relation:'concept',
       reason:'Subject-index relationship; not necessarily a literal occurrence'}});
    seen.add('daruri:'+key);
    if(++added>450)return concepts;
   }
  }
 }
 return concepts;
}

/* A scholarly Boolean group is a set of individually identified fields, not
 * a concatenation of Arabic, English and editorial material. Broader scopes
 * combine records of the same provenance, language and textual status only.
 */
const GN_TOKEN_CACHE=new WeakMap();
const GN_PARTS=new Map((BOOK.sections||[]).map(s=>[String(s.id),String(s.part)]));
function gnScholarlyGroups(records,scope){
 const groups=new Map(),tokenCache=GN_TOKEN_CACHE;
 for(const rec of records){
  const section=String(rec.section||rec.id);
  const part=rec.work==='daruri'?(GN_PARTS.get(section)||section):section;
  const band=rec.type==='text'?(rec.subtype==='Authorial text'?'authorial':'editorial heading'):rec.type;
  for(const field of rec.fields){
   if(field.kind==='locator')continue;
   if(rec.type==='text'&&rec.subtype==='Authorial text'&&field.kind==='title')continue;
   if(rec.type==='other'&&['Selected bilingual passage','Arabic witness'].includes(rec.subtype)&&field.kind==='title')continue;
   // Avoid treating separately authored metadata fragments as one quotation.
   const chunks=field.kind==='body'?field.raw.split(/\s+·\s+/u):[field.raw];
   for(let i=0;i<chunks.length;i++){
    if(!chunks[i]?.trim())continue;
    const type=field.kind==='ar'?'ar':field.kind==='en'?'en':field.kind;
    const unit=scope==='passage'?rec.id+':'+type+':'+i:
      scope==='section'?section:scope==='part'?part:rec.work;
    const key=[rec.work,rec.privacy,band,type,unit].join('\u001f');
    if(!groups.has(key))groups.set(key,{key,work:rec.work,section,part,type,band,records:[],scope,entries:[]});
    const group=groups.get(key),chunk=chunks[i];
    const owner=chunks.length===1?field:
      ((field._gnChunks||=(chunks.map(x=>({raw:x,kind:field.kind}))))[i]);
    group.records.push(rec);
    group.entries.push({
     rec,kind:field.kind,raw:chunk,
     tokens(original,normalize){
      const mode=original?'o':'n';
      let cache=tokenCache.get(owner);
      if(!cache){cache={};tokenCache.set(owner,cache);}
      if(!cache[mode])cache[mode]=window.GnammaScholarly.tokenize(chunk,normalize,original);
      return cache[mode];
     }
    });
   }
  }
 }
 return [...groups.values()];
}
function gnScholarlySearch(q,opts,corpus){
 const engine=window.GnammaScholarly,original=opts.orthography==='original';
 const normalize=original?x=>String(x??'').toLowerCase().normalize('NFC'):fold;
 if(!engine)return {results:[],facets:{all:0},total:0,error:'The scholarly search engine did not load.'};
 const parsed=engine.parse(q,normalize);
 if(!parsed.ast)return {results:[],facets:{all:0},total:0,error:parsed.error,
  position:parsed.position,plan:{scholarly:true,explain:''}};
 const aliasProvider=(value)=>{
  const group=lookupGroup(value);
  return group?.words?.slice(0,18)||[];
 };
 const scope=['passage','section','part','work'].includes(opts.booleanScope)?opts.booleanScope:'passage';
 const groups=gnScholarlyGroups(corpus,scope),results=[];
 for(const group of groups){
  const outcome=engine.evaluate(parsed.ast,group.entries,{normalize,original,aliasProvider});
  if(!outcome.ok)continue;
  const evidence=outcome.hits.filter(h=>h.kind!=='metadata');
  const preferred=evidence[0]||outcome.hits[0];
  if(!preferred)continue;
  const rec=preferred.entry.rec;
  const distinct=new Map();
  for(const hit of evidence){
   const loc=hit.entry.rec.locator||hit.entry.rec.section||hit.entry.rec.id,
     key=hit.entry.rec.id+'|'+hit.entry.kind;
   if(!distinct.has(key))distinct.set(key,{
    id:hit.entry.rec.id,work:hit.entry.rec.work,type:hit.entry.rec.type,
    section:hit.entry.rec.section,segment:hit.entry.rec.segment,
    locator:loc,field:hit.entry.kind,term:hit.term,kind:hit.kind,
    source:hit.entry.rec.title
   });
  }
  const locations=[...distinct.values()].slice(0,12);
  const matchKinds=[...new Set(evidence.map(x=>x.kind))];
  const scopeName=scope==='passage'?'same passage':scope==='section'?'same section':
   scope==='part'?'same editorial part':'same work';
  let note='Scholarly pattern · '+scopeName;
  if(locations.length>1)note+=' · '+locations.length+' evidenced locations';
  if(matchKinds.some(x=>x==='pattern'||x==='fuzzy'))note+=' · '+matchKinds.filter(x=>x==='pattern'||x==='fuzzy').join(' + ');
  const matched={
   field:preferred.entry.kind,raw:preferred.entry.raw,relation:'scholarly',
   scope,kind:preferred.kind,term:preferred.term,
   match:{term:preferred.term,at:0}, // snippet locates the exact retrieved surface form
   evidence:outcome.hits.slice(0,12).map(h=>({
    raw:h.entry.raw,field:h.entry.kind,term:h.term,kind:h.kind,
    recId:h.entry.rec.id,locator:h.entry.rec.locator,section:h.entry.rec.section
   })),
   locations,reason:note,
   expression:engine.explain(parsed.ast)
  };
  const score=70+Math.min(30,evidence.reduce((n,h)=>n+(h.score||0),0))+
    (rec.type==='text'&&rec.subtype==='Authorial text'?18:0);
  results.push({...rec,matched,score,scholarlyGroup:group.key,scopeLabel:scopeName});
 }
 if(opts.sort==='source')results.sort((a,b)=>a.work.localeCompare(b.work)||
  (Number(a.section)||0)-(Number(b.section)||0)||a.id.localeCompare(b.id));
 else if(opts.sort==='alpha')results.sort((a,b)=>a.title.localeCompare(b.title,undefined,{sensitivity:'base'}));
 else if(opts.sort==='recent')results.sort((a,b)=>(b.updated||0)-(a.updated||0)||b.score-a.score);
 else results.sort((a,b)=>b.score-a.score||(Number(a.section)||0)-(Number(b.section)||0));
 const facets=facetCounts(results),
  filtered=opts.facet==='all'?results:opts.facet==='mine'?results.filter(r=>r.privacy==='private'):
  results.filter(r=>r.type===opts.facet);
 return {results:filtered,facets,total:results.length,
  plan:{scholarly:true,ast:parsed.ast,explain:engine.explain(parsed.ast)},
  scope,original,error:null};
}

function searchRecords(q,options){
 const opts=Object.assign({scope:'work',mode:'terms',sort:'relevance',facet:'all',owner:'all',
   nearTerm:'',nearGap:5,nearOrdered:false},options||{});
 const isNear=opts.mode==='proximity'||/^.+\s+(?:NEAR|BEFORE)\/\d{1,2}\s+.+$/i.test(String(q||''));
 const near=isNear?nearParameters(q,opts):null;
 const first=isNear?queryPlan(near.left,'terms'):null;
 const second=isNear?queryPlan(near.right,'terms'):null;
 const plan=isNear?{...first,near}:queryPlan(q,opts.mode);
 if(opts.mode==='scholarly'){
  const corpus=baseItems.concat(opts.scope==='library'?otherItems:[],readPersonal());
  return gnScholarlySearch(q,opts,corpus);
 }
 if(!plan.norm||isNear&&!second.norm)return {results:[],facets:{all:0},plan,total:0,missingNear:Boolean(isNear&&!second.norm)};
 const corpus=baseItems.concat(opts.scope==='library'?otherItems:[],readPersonal());
 let hits=[];
 if(plan.direct&&!isNear){
  const dst=plan.direct;
  const chosen=corpus.find(r=>dst.kind==='section'&&r.work==='daruri'&&r.id==='heading:'+dst.id
    ||dst.kind==='note'&&r.id===dst.id
    ||dst.kind==='application'&&r.id===dst.id
    ||dst.kind==='study'&&r.id===dst.id);
  if(chosen)hits.push({...chosen,score:10000,matched:{field:'title',raw:chosen.title,term:q,
   relation:'reference',reason:'Direct reference · '+q}});
  return {results:hits,facets:facetCounts(hits),plan,total:hits.length,direct:true};
 }
 for(const rec of corpus){
  const match=isNear?findProximity(rec,first,second,near):findMatch(rec,plan,opts.mode);
  if(!match)continue;
  const score=match.priority+(rec.type==='text'?12:rec.type==='personal'||rec.type==='highlight'?10:
    rec.type==='dictionary'?8:rec.type==='concept'?6:3)+
   (rec.work==='daruri'?3:0)+(rec.subtype==='Section heading'?7:0);
  hits.push({...rec,score,matched:match});
 }
 if(opts.mode==='concepts'){
  hits.push(...publicConcepts(plan,hits));
  // Cross-work concepts are derived exclusively from published textual and glossary evidence.
  for(const rec of (opts.scope==='library'?otherItems:[])){
   if(rec.type!=='other'||rec.subtype!=='Technical term')continue;
   const words=plan.need.flat();if(!words.some(w=>[rec.title,rec.ar,rec.en].some(t=>offsetsOf(t,w,true,false))))continue;
   if(hits.some(h=>h.work===rec.work&&h.id===rec.id))continue;
   hits.push({...rec,score:13,matched:{field:'title',raw:rec.title,term:plan.raw,
       relation:'concept',reason:'Terminology in a separate Gnamma work'}});
  }
 }
 const seen=new Set();hits=hits.filter(r=>{const k=r.work+':'+r.type+':'+r.id;if(seen.has(k))return false;seen.add(k);return true;});
 if(opts.sort==='source')hits.sort((a,b)=>(a.work===b.work?0:(a.work==='daruri'?-1:1))||
    (Number(a.section)||0)-(Number(b.section)||0)||String(a.id).localeCompare(String(b.id)));
 else if(opts.sort==='alpha')hits.sort((a,b)=>a.title.localeCompare(b.title,undefined,{sensitivity:'base'}));
 else if(opts.sort==='recent')hits.sort((a,b)=>(b.updated||0)-(a.updated||0)||b.score-a.score);
 else hits.sort((a,b)=>b.score-a.score||(Number(a.section)||0)-(Number(b.section)||0));
 const facets=facetCounts(hits),filtered=opts.facet==='all'?hits:opts.facet==='mine'?hits.filter(r=>r.privacy==='private'):hits.filter(r=>r.type===opts.facet);
 return {results:filtered,facets,plan,total:hits.length,direct:false};
}
function facetCounts(rows){const f={all:rows.length,mine:0};for(const r of rows){f[r.type]=(f[r.type]||0)+1;if(r.privacy==='private')f.mine++;}return f;}
function otherIndex(obj,arabic){
 if(!obj||obj.schema!=='gnamma-search-v1'||!Array.isArray(obj.records))throw Error('Unexpected library index version');
 if(!arabic||arabic.schema!=='gnamma-mustasfa-arabic-v1'||!Array.isArray(arabic.pages))throw Error('Unexpected al-Mustaṣfā Arabic witness');
 const rows=obj.records.map(r=>entry({...r,work:'mustasfa',privacy:'public'}));
 // Load the already-published Arabic witness, rather than storing 3,000 duplicated
 // paragraphs in a second JSON index. Each entry preserves its source-page ID.
 for(const page of arabic.pages){
  const section=String(page.id),title=page.headings?.slice(0,2).join(' · ')||section;
  for(let i=0;i<(page.paragraphs||[]).length;i++){
   rows.push(entry({id:'arabic:'+section+':'+i,work:'mustasfa',type:'other',
    subtype:'Arabic witness',section,segment:i,locator:section,title,
    ar:page.paragraphs[i],en:'',body:'',tag:'arabic-untranslated',
    url:'../texts/al-ghazali/al-mustasfa/#arabic='+encodeURIComponent(section)}));
  }
 }
 return rows;
}
async function loadOther(){
 if(otherLoaded||fetching)return;
 fetching=true;failedOther='';rerender();
 try{
  const indexUrl=new URL(CONFIG.moreUrl,location.href);
  const [response,corpusResponse]=await Promise.all([
   fetch(indexUrl.href,{credentials:'omit'}),
   fetch(new URL('../arabic/full-arabic-pages.json',location.href).href,{credentials:'omit'})
  ]);
  if(!response.ok||!corpusResponse.ok)throw Error('HTTP '+response.status+'/'+corpusResponse.status);
  const [data,arabic]=await Promise.all([response.json(),corpusResponse.json()]);
  otherItems=otherIndex(data,arabic);
  for(const item of otherItems){
   if(item.subtype==='Technical term')aliasGroup([item.title,item.ar,item.en],item.title,'Published al-Mustaṣfā glossary');
  }
  otherLoaded=true;
 }catch(e){failedOther='The al-Mustaṣfā sources could not be loaded. Darūrī results remain available.';console.warn('Gnamma search cross-work index',e);}
 finally{fetching=false;rerender();}
}
function ensureLoaded(){if(ui.scope==='library'&&!otherLoaded&&!fetching&&!failedOther)void loadOther();}
function labelFor(type){return TYPES.find(t=>t[0]===type)?.[1]||type;}
function icon(type){const path={
  text:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z',
  note:'M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-5-5H8Zm2 9h6m-6 4h6',
  personal:'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4L16.5 3.5Z',
  concept:'M12 2l9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5m-18 5 9 5 9-5',
  highlight:'m4 16 8 6 7-7-8-8-7 7Zm7-9 2-2 8 8-2 2',
  bookmark:'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z',
  other:'M3 5h18M4 5v14h16V5M8 9h8m-8 4h8',
  dictionary:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z'
 }[type]||'M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-5-5H8Zm2 9h6m-6 4h6';
 return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.65"><path d="'+path+'"/></svg>';
}
const ui={opened:false,expanded:false,query:'',facet:'all',mode:'terms',scope:'work',
  sort:'relevance',display:'results',showFilters:false,page:CONFIG.pageSize,results:[],facets:{},
  before:null,request:0,scroll:0,entryHash:'',entryScroll:0,pendingReturn:null,
  nearTerm:'',nearGap:5,nearOrdered:false,booleanScope:'passage',
  orthography:'normalized',builderOpen:false,savedOpen:false,builderError:'',
  builderRows:[{join:'AND',kind:'word',text:'',field:'all'},
               {join:'AND',kind:'word',text:'',field:'all'}],
  queryError:'',queryExplanation:''};
let host=null,inputTimer=0,renderNonce=0,lastStatus='';
function filterButton(id,text,selected,extra){
 return '<button type="button" class="gns-chip'+(selected?' gns-current':'')+'" data-gns-'+extra+'="'+xml(id)+'" aria-pressed="'+selected+'">'+esc(text)+'</button>';
}
function scopeSelector(){
 return '<label class="gns-setting"><span>Works</span><select id="gns-scope" aria-label="Search scope">' +
  '<option value="work"'+(ui.scope==='work'?' selected':'')+'>Darūrī</option>'+
  '<option value="library"'+(ui.scope==='library'?' selected':'')+'>Gnamma Library</option></select></label>';
}
function modeSelector(){
 return '<label class="gns-setting"><span>Match</span><select id="gns-mode" aria-label="Search mode">'+
  [['literal','Exact words'],['terms','Words + terms'],['proximity','Proximity'],['scholarly','Scholarly patterns'],['concepts','Conceptual links']].map(x=>
  '<option value="'+x[0]+'"'+(ui.mode===x[0]?' selected':'')+'>'+x[1]+'</option>').join('')+'</select></label>';
}
function proximityControls(){
 if(ui.mode!=='proximity')return '';
 return '<div class="gns-near-options" role="group" aria-label="Proximity search settings">'+
   '<label class="gns-setting gns-near-term"><span>Second term</span>'+
    '<input id="gns-near-term" type="search" dir="auto" autocomplete="off" spellcheck="false" '+
     'placeholder="e.g. illa or علة" aria-label="Second term for proximity search" value="'+xml(ui.nearTerm)+'"></label>'+
   '<label class="gns-setting gns-near-gap"><span>Intervening words</span><select id="gns-near-gap" aria-label="Maximum words between terms">'+
    [0,1,3,5,10,20,50].map(n=>'<option value="'+n+'"'+(ui.nearGap===n?' selected':'')+'>'+n+'</option>').join('')+
   '</select></label>'+
   '<label class="gns-near-order"><input id="gns-near-order" type="checkbox"'+(ui.nearOrdered?' checked':'')+
    '> Keep word order</label>'+
   '<span class="gns-near-help">Both terms must occur in the same passage and language. 0 means adjacent; 5 permits up to five words between them.</span>'+
   '</div>';
}

function gnSettingOption(id,name,value,current){
 return '<option value="'+xml(id)+'"'+(value===current?' selected':'')+'>'+esc(name)+'</option>';
}
function gnBuilderRow(row,index){
 const join=index?'<select data-gns-builder-join="'+index+'" aria-label="Condition '+(index+1)+' logic">'+
  [['AND','and'],['OR','or'],['AND NOT','and not']].map(([id,name])=>gnSettingOption(id,name,id,row.join)).join('')+
  '</select>':'<span class="gns-builder-first">Find</span>';
 const kinds=[['word','Term'],['phrase','Exact phrase'],['prefix','Begins with'],['pattern','Letter pattern'],
  ['fuzzy1','Within 1 letter'],['fuzzy2','Within 2 letters']];
 return '<div class="gns-builder-row" data-gns-builder-row="'+index+'">'+join+
   '<select data-gns-builder-kind="'+index+'" aria-label="Condition '+(index+1)+' matching">'+
     kinds.map(([id,name])=>gnSettingOption(id,name,id,row.kind)).join('')+'</select>'+
   '<input type="text" data-gns-builder-text="'+index+'" value="'+xml(row.text)+'" '+
    'placeholder="'+(row.kind==='pattern'?'e.g. مس[ؤئ]ول':'Term or phrase')+'" '+
    'aria-label="Condition '+(index+1)+' search term" dir="auto" autocomplete="off"/>'+
   '<select data-gns-builder-field="'+index+'" aria-label="Condition '+(index+1)+' language">'+
    [['all','Any field'],['ar','Arabic'],['en','English']].map(([id,name])=>gnSettingOption(id,name,id,row.field)).join('')+'</select>'+
   (index?'<button type="button" class="gns-builder-remove" data-gns-remove-row="'+index+'" aria-label="Remove condition '+(index+1)+'">×</button>':'<span></span>')+
  '</div>';
}
const GN_SAVED_SEARCHES='gnamma-scholarly-saved-searches-v1';
function gnLoadSaved(){
 try{
  const records=JSON.parse(localStorage.getItem(GN_SAVED_SEARCHES)||'[]');
  if(!Array.isArray(records))return [];
  return records.slice(0,30).filter(r=>r&&typeof r.query==='string'&&r.query.length<=350);
 }catch(_){return [];}
}
function gnSaveCurrent(){
 if(!ui.query.trim())return;
 const text=$('#gns-save-name',host)?.value?.trim().slice(0,80)||ui.query.slice(0,60);
 const list=gnLoadSaved(),record={id:Date.now()+'-'+Math.round(Math.random()*10000),
  name:text,query:ui.query,mode:ui.mode,scope:ui.scope,facet:ui.facet,
  sort:ui.sort,booleanScope:ui.booleanScope,orthography:ui.orthography,
  nearTerm:ui.nearTerm,nearGap:ui.nearGap,nearOrdered:ui.nearOrdered,
  created:Date.now()};
 list.unshift(record);
 try{localStorage.setItem(GN_SAVED_SEARCHES,JSON.stringify(list.slice(0,30)));ui.savedOpen=true;rerender(false);}
 catch(_){ui.queryError='Browser storage is unavailable; the search was not saved.';rerender(false);}
}
function gnLoadSavedQuery(index){
 const record=gnLoadSaved()[index];if(!record)return;
 const keys=['query','mode','scope','facet','sort','booleanScope','orthography','nearTerm','nearGap','nearOrdered','booleanScope','orthography'];
 for(const key of keys)if(Object.hasOwn(record,key))ui[key]=record[key];
 ui.expanded=true;ui.savedOpen=true;ui.page=CONFIG.pageSize;ui.pendingReturn=null;
 rerender();
}
function gnSavedPanel(){
 const rows=gnLoadSaved();
 return '<details class="gns-saved" data-gns-details="saved"'+(ui.savedOpen?' open':'')+'>'+
  '<summary>Saved searches'+(rows.length?' ('+rows.length+')':'')+'</summary>'+
  '<div class="gns-saved-content">'+
   '<p>Saved only in this browser. No search query or private notes are uploaded.</p>'+
   '<div class="gns-save-controls"><input id="gns-save-name" type="text" maxlength="80" placeholder="Optional search title" '+
    'aria-label="Title for saved search"/><button type="button" data-gns-save="1">Save current search</button></div>'+
    (rows.length?'<div class="gns-saved-list">'+rows.map((r,i)=>
     '<div class="gns-saved-item"><button data-gns-load="'+i+'" title="'+xml(r.query)+'">'+
      esc(r.name||r.query)+'</button><button data-gns-delete="'+i+'" aria-label="Delete saved search '+esc(r.name||'')+'">×</button></div>'
     ).join('')+'</div>':'<p>No saved searches on this device.</p>')+'</div></details>';
}
function scholarlyControls(){
 if(ui.mode!=='scholarly')return '';
 const b=window.GnammaScholarly;
 let preview='',builderError=ui.builderError||'';
 try{preview=b?.safeBuilder(ui.builderRows)||'';}catch(e){builderError=e.message;}
 return '<section class="gns-scholarly" aria-label="Scholarly pattern search controls">'+
  '<div class="gns-scholarly-settings">'+
   '<label class="gns-setting">Conditions within<select id="gns-boolean-scope" aria-label="Boolean search scope">'+
    [['passage','One passage'],['section','One section'],['part','One editorial part'],['work','One work']].map(([id,name])=>gnSettingOption(id,name,id,ui.booleanScope)).join('')+
   '</select></label>'+
   '<label class="gns-setting">Spelling<select id="gns-orthography" aria-label="Orthographic matching">'+
    [['normalized','Normalized (ignore vowel marks)'],['original','As encoded (retain written marks)']].map(([id,name])=>gnSettingOption(id,name,id,ui.orthography)).join('')+
   '</select></label>'+
   '<div class="gns-pattern-examples"><span>Try:</span>'+
   ['qiyas AND (illa OR sabab)','اجته*','مس[ؤئ]ول','اجتهاد~1'].map(q=>
     '<button type="button" data-gns-pattern-example="'+xml(q)+'">'+esc(q)+'</button>').join('')+'</div>'+
  '</div>'+
  '<details class="gns-builder" data-gns-details="builder"'+(ui.builderOpen?' open':'')+'>'+
   '<summary>Build a search without writing operators</summary>'+
   '<div class="gns-builder-inner">'+
    ui.builderRows.map((row,i)=>gnBuilderRow(row,i)).join('')+
    '<div class="gns-builder-actions">'+
     '<button type="button" data-gns-add-row="1"'+(ui.builderRows.length>=8?' disabled':'')+'>+ Add condition</button>'+
     '<button type="button" class="gns-builder-apply" data-gns-apply-builder="1">Use these conditions</button></div>'+
    '<div class="gns-builder-preview" aria-live="polite"><strong>Query preview:</strong> <code id="gns-builder-preview">'+
     esc(preview||'Add a term to build a query')+'</code>'+
     (builderError?'<span class="gns-builder-error" role="alert">'+esc(builderError)+'</span>':'')+'</div>'+
   '</div></details>'+
   (ui.query?'<div class="gns-explanation" aria-live="polite">'+
    (ui.queryError?'<strong class="gns-error">Check query: '+esc(ui.queryError)+'</strong>':
      '<strong>Your search means:</strong> '+esc(ui.queryExplanation||'Search the selected scope'))+
    (ui.queryError?'':'<small> · '+esc(ui.booleanScope==='passage'?'One field in one passage':
      ui.booleanScope==='section'?'Same section, with Arabic and English kept separate':
      ui.booleanScope==='part'?'Same editorial part, within one language and source type':
      'Same work, within one language and source type')+
      ' · '+(ui.orthography==='original'?'As encoded in this edition':'Normalized spelling')+'</small>')+
    '</div>':'')+
   gnSavedPanel()+
  '</section>';
}
function filterPanel(){
 const hasResult=ui.results.length||ui.query;
 const typeSelect='<label class="gns-setting gns-source-select"><span>Source type</span><select id="gns-type" aria-label="Filter content type">'+
    [['all','All sources'],...TYPES.map(x=>[x[0],x[1]])].map(x=>'<option value="'+x[0]+'"'+(ui.facet===x[0]?' selected':'')+'>'+esc(x[1])+'</option>').join('')+'</select></label>';
 return '<div class="gns-tools"  '+(!ui.expanded&&!ui.showFilters?'hidden':'')+'>'+
   typeSelect+scopeSelector()+modeSelector()+
   '<label class="gns-setting"><span>Order</span><select id="gns-sort" aria-label="Sort search results">'+
   [['relevance','Relevance'],['source','Source order'],['alpha','A–Z'],['recent','Recently saved']].map(x=>
     '<option value="'+x[0]+'"'+(ui.sort===x[0]?' selected':'')+'>'+x[1]+'</option>').join('')+'</select></label>'+
   '<label class="gns-setting"><span>View</span><select id="gns-display" aria-label="Results display">'+
     '<option value="results"'+(ui.display==='results'?' selected':'')+'>Results</option>'+
     '<option value="concordance"'+(ui.display==='concordance'?' selected':'')+'>Concordance</option>'+
   '</select></label></div>'+proximityControls()+scholarlyControls();
}
function resultControls(){
 const count=ui.resultCount||0;
 const suggested=termSuggestions(ui.query).filter(t=>romanKey(t.label)!==romanKey(ui.query));
 const hint=suggested.length&&(!count||romanKey(ui.query).length<=3)?
  '<div class="gns-suggestions"><span>Possible terms</span>'+
   suggested.map(t=>'<button type="button" data-gns-example="'+xml(t.query)+'">'+esc(t.label)+
    (t.arabic?' <span lang="ar" dir="rtl">'+esc(t.arabic)+'</span>':'')+'</button>').join('')+'</div>':'';

 if(ui.mode==='proximity'&&ui.query&&!nearParameters(ui.query,ui).right){
  return '<div class="gns-intro"><h3>Find words near one another</h3>'+
   '<p>Enter a second term above. Results are ranked by the number of <strong>intervening words</strong>, and must appear in one language and one passage.</p>'+
   '<p>For example, search <strong>ijtihad</strong> near <strong>taqlid</strong>, or type <code>ijtihad NEAR/5 taqlid</code> in the main field.</p></div>';
 }
 if(!ui.query)return '<div class="gns-intro"><h3>Search the edition and your research</h3>'+
  '<p>Arabic and English passages, editorial notes, source citations, historical dictionaries, concepts, legal applications and your own saved work.</p>'+
  '<p>Try <button data-gns-example="qiyas">qiyas</button>, <button data-gns-example="ijtihad">ijtihad</button>, '+
  '<button data-gns-example="§120">§120</button> or <button data-gns-example="N001">N001</button>.</p>'+
  '<small>Private annotations never leave your browser. Open Research search for full filters and concordance.</small></div>';
 const status=fetching?' · loading al-Mustaṣfā…':failedOther&&ui.scope==='library'?' · other work unavailable':'';
 const msg=ui.facetsCount?.all===undefined?count:ui.facetsCount.all;
 return '<div class="gns-results-top"><span role="status" aria-live="polite"><strong>'+count.toLocaleString()+
  '</strong> results'+(ui.facet!=='all'?' · '+esc(labelFor(ui.facet)):msg!==count?' from '+msg.toLocaleString()+' matching records':'')+status+
  '</span>'+(ui.expanded?'<button type="button" data-gns-download="csv" title="Export visible search results as CSV">Export CSV ↓</button>':'')+'</div>'+
  (failedOther&&ui.scope==='library'?'<p class="gns-warning" role="alert">'+esc(failedOther)+
  ' <button data-gns-retry="1">Retry</button></p>':'')+
  (ui.scope==='library'&&!otherLoaded&&fetching?'<p class="gns-wait">Loading other published works; the results will update automatically.</p>':'')+hint;
}
function getTypeIcon(t){return icon(t==='personal'?'personal':t==='highlight'?'highlight':t==='note'||t==='source'?'note':t);}
function proximitySnippet(raw,hit){
 const text=String(raw||'').replace(/\s+/g,' ').trim(),mapped=foldMapped(text);
 if(!mapped.offsets.length)return esc(text.slice(0,250));
 const range=(span)=>{
  const first=mapped.offsets[span.offsetStart],last=mapped.offsets[span.offsetEnd-1];
  return first&&last?[first[0],last[1]]:null;
 };
 const ra=range(hit.nearA),rb=range(hit.nearB);
 if(!ra||!rb)return snippet(text,{term:hit.nearA?.matched||''});
 const spans=[{start:ra[0],end:ra[1],name:'one'},{start:rb[0],end:rb[1],name:'two'}]
    .sort((a,b)=>a.start-b.start);
 const first=Math.max(0,spans[0].start-65),last=Math.min(text.length,spans[1].end+90);
 let out=first?'…':'',cursor=first;
 for(const span of spans){
  out+=esc(text.slice(cursor,span.start));
  out+='<mark class="gns-near-'+span.name+'">'+esc(text.slice(span.start,span.end))+'</mark>';
  cursor=span.end;
 }
 return out+esc(text.slice(cursor,last))+(last<text.length?'…':'');
}

function gnScholarlySnippet(raw,matched){
 const text=String(raw||'').replace(/\s+/g,' ').trim(),mapped=foldMapped(text);
 if(!mapped.offsets.length)return esc(text.slice(0,250));
 const evidence=(matched.evidence||[]).filter(e=>e.raw===matched.raw&&e.field===matched.field).slice(0,5);
 const terms=[...new Set(evidence.map(e=>fold(e.term)).filter(Boolean))],norm=mapped.norm;
 const spans=[];
 for(const term of terms){
  let at=norm.indexOf(term);
  if(at<0)continue;
  const a=mapped.offsets[at],b=mapped.offsets[Math.min(mapped.offsets.length-1,at+term.length-1)];
  if(a&&b)spans.push({start:a[0],end:b[1]});
 }
 if(!spans.length)return snippet(text,{term:matched.term||''});
 spans.sort((a,b)=>a.start-b.start);
 const lo=Math.max(0,spans[0].start-65),hi=Math.min(text.length,spans.at(-1).end+95);
 let output=lo?'…':'',cursor=lo;
 for(const m of spans){
  if(m.start<cursor)continue;
  output+=esc(text.slice(cursor,m.start))+'<mark>'+esc(text.slice(m.start,m.end))+'</mark>';
  cursor=m.end;
 }
 return output+esc(text.slice(cursor,hi))+(hi<text.length?'…':'');
}

function markupResult(r,i,kwic=false){
 const loc=r.locator||'',priv=r.privacy==='private',work=r.work==='mustasfa'?'al-Mustaṣfā':'al-Ḍarūrī';
 const source=r.subtype?labelFor(r.type)+' · '+r.subtype:labelFor(r.type);
 const reason=r.matched?.reason||'';
 const text=r.matched?.raw||r.en||r.ar||r.body||r.title||'';
 const context=r.matched?.relation==='proximity'?
  proximitySnippet(text,r.matched):r.matched?.relation==='scholarly'?
  gnScholarlySnippet(text,r.matched):
  snippet(text,r.matched?.match||{term:r.matched?.term||ui.query},hasArabic(text));
 const title=r.type==='text'&&r.subtype==='Authorial text'?r.title:r.title;
 const heading=(r.type==='text'||r.type==='source'||r.type==='note'?loc:'');
 const rowLabel=esc(work)+' · '+esc(source)+(heading?' · '+esc(heading):'');
 let tags='<span class="gns-type-mark">'+getTypeIcon(r.type)+'</span>';
 if(priv)tags+='<span class="gns-private" title="Only on this device">Private</span>';
 if(r.work==='mustasfa'&&r.tag==='arabic-untranslated')tags+='<span class="gns-scope-label">Arabic witness · untranslated</span>';
 if(r.matched?.relation==='concept')tags+='<span class="gns-scope-label">Concept relation</span>';
 if(r.matched?.relation==='terminology')tags+='<span class="gns-scope-label">Linked term</span>';
 if(r.matched?.relation==='proximity')tags+='<span class="gns-scope-label">Proximity · '+r.matched.gap+' words between</span>';
 if(r.matched?.relation==='scholarly')tags+='<span class="gns-scope-label">Scholarly · '+esc(r.matched.scope||'passage')+'</span>';
 if(kwic){
  const side=(r.matched?.field==='ar'||(hasArabic(text)&&r.matched?.field!=='en'));
  return '<button type="button" class="gns-result gns-kwic" data-gns-result="'+i+'">'+
   '<span class="gns-kwic-loc">'+esc(work)+' · '+esc(loc)+'</span>'+
   '<span class="gns-kwic-text" '+(side?'dir="rtl" lang="ar"':'dir="auto"')+'>'+context+'</span>'+
   '<span class="gns-kwic-type">'+esc(r.subtype)+'</span></button>';
 }
 const main='<button type="button" class="gns-result" data-gns-result="'+i+'">'+
  '<span class="gns-row-meta">'+tags+'<span>'+rowLabel+'</span></span>'+
  '<strong class="gns-row-title">'+esc(title)+'</strong>'+
  '<span class="gns-row-excerpt" '+(hasArabic(text)?'dir="rtl" lang="ar"':'dir="auto"')+'>'+context+'</span>'+
  ((r.matched?.relation&&r.matched.relation!=='literal')?'<small class="gns-reason">'+esc(reason)+'</small>':'')+
  '</button>';
 const evidence=r.matched?.relation==='scholarly'&&r.matched.locations?.length>1?
  '<div class="gns-linked-evidence"><span>Supporting locations:</span>'+
   r.matched.locations.slice(0,8).map((e,j)=>
    '<button type="button" data-gns-evidence-result="'+i+'" data-gns-evidence-index="'+j+
    '" aria-label="Open supporting location '+xml(e.locator)+'">'+esc(e.locator||e.source||e.id)+'</button>').join('')+
   (r.matched.locations.length>8?'<small>+'+(r.matched.locations.length-8)+' further</small>':'')+
   '</div>':'';
 return evidence?'<div class="gns-group-result">'+main+evidence+'</div>':main;
}
function renderResultList(){
 let filtered=ui.results;
 if(ui.display==='concordance')filtered=filtered.filter(r=>r.type==='text'||r.type==='other'&&r.subtype==='Arabic witness');
 const limit=ui.expanded?ui.page:CONFIG.quickSize;
 const shown=filtered.slice(0,limit);
 if(!shown.length)return ui.query?'<div class="gns-empty">No results in this category. Try another spelling, a different search mode, or All sources.</div>':'';
 let html='<div class="gns-rows'+(ui.display==='concordance'?' gns-concordance':'')+'" aria-label="Search results">'+
 shown.map((r,i)=>markupResult(r,ui.results.indexOf(r),ui.display==='concordance')).join('')+'</div>';
 if(filtered.length>shown.length){
  if(ui.expanded)html+='<button class="gns-more" data-gns-more="1">Show next '+Math.min(CONFIG.pageSize,filtered.length-shown.length)+' of '+filtered.length.toLocaleString()+' →</button>';
  else html+='<button class="gns-more" data-gns-expand="1">View all '+filtered.length.toLocaleString()+' results →</button>';
 }
 if(!ui.expanded&&filtered.length<=shown.length&&ui.query)html+='<button class="gns-more gns-full-search" data-gns-expand="1">Open Research search →</button>';
 return html;
}
function facetSidebar(){
 if(!ui.expanded)return '';
 const f=ui.facetsCount||{};
 const row=(type,label)=>'<button type="button" class="gns-facet'+(ui.facet===type?' gns-current':'')+
  '" data-gns-facet="'+type+'" aria-pressed="'+(ui.facet===type)+'"><span>'+esc(label)+'</span><small>'+(f[type]||0).toLocaleString()+'</small></button>';
 return '<nav class="gns-sidebar" aria-label="Filter search source">'+
   '<span class="gns-overline">SOURCES</span>'+row('all','All sources')+
   TYPES.map(t=>row(t[0],t[1])).join('')+
   '<div class="gns-aside-info">Source citations, terms and editorial comparisons are distinguished from the authorial text. Private notes are only searched on this device.</div></nav>';
}
function markup(){
 const tabs=filterButton('all','All',ui.facet==='all','quick')+
  filterButton('text','Text',ui.facet==='text','quick')+
  filterButton('mine','Mine',ui.facet==='mine'||['personal','highlight','bookmark'].includes(ui.facet),'quick');
 return '<div class="gns-backdrop" data-gns-close="1"></div>'+
  '<section class="gns-dialog'+(ui.expanded?' gns-expanded':'')+'" role="dialog" aria-modal="true" aria-labelledby="gns-title">'+
   '<header class="gns-header">'+
   '<h2 id="gns-title" class="gns-sr-only">Search Gnamma texts and annotations</h2>'+
   '<label class="gns-searchbox"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10.5" cy="10.5" r="6"/><path d="m15.5 15.5 5 5"/></svg><input id="gns-query" type="search" inputmode="search" autocomplete="off" spellcheck="false" dir="auto" placeholder="'+(ui.mode==='proximity'?'First term, e.g. qiyas':'Search text, concepts, notes…')+'" aria-label="Search Arabic, English and annotations" value="'+xml(ui.query)+'"/></label>'+
   '<button class="gns-icon-button" data-gns-toggle-filters="1" aria-label="Search options" aria-expanded="'+(ui.showFilters||ui.expanded)+'" title="Search options">'+
     '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 7h16M7 12h10M10 17h4"/><circle cx="15" cy="7" r="2" fill="currentColor"/></svg></button>'+
   '<button class="gns-icon-button" data-gns-close="1" aria-label="Close search" title="Close search">×</button></header>'+
   '<div class="gns-switchbar"><div role="group" aria-label="Main search categories" class="gns-main-tabs">'+tabs+'</div>'+
   '<button type="button" class="gns-toggle-size" data-gns-expand="'+(ui.expanded?'0':'1')+'">'+(ui.expanded?'Quick Find':'Research search')+
   ' <span aria-hidden="true">'+(ui.expanded?'↙':'↗')+'</span></button></div>'+
   filterPanel()+
   '<div class="gns-workspace">'+facetSidebar()+
   '<div class="gns-listpane" id="gns-listpane" tabindex="-1">'+resultControls()+renderResultList()+'</div></div>'+
   '<footer class="gns-foot"><span>Gnamma · scholarly search</span><span>Esc to close'+(ui.expanded?' · ↑↓ to navigate':' · Enter to open')+'</span></footer>'+
  '</section>';
}
function rerender(keepFocus=true){
 if(!ui.opened||!host)return;
 const previousFocus=document.activeElement?.id||'';
 const focus=['gns-query','gns-near-term'].includes(previousFocus);
 let selection;try{if(focus)selection=document.activeElement.selectionStart;}catch(_){}
 let oldScroll=$('#gns-listpane',host)?.scrollTop||0;
 const all=searchRecords(ui.query,ui);
 ui.results=all.results;ui.resultCount=all.results.length;ui.facetsCount=all.facets;ui.direct=all.direct;
 ui.queryError=all.error||'';ui.queryExplanation=all.plan?.explain||'';
 if(ui.facet==='mine'){ui.results=ui.results.filter(r=>r.privacy==='private');ui.resultCount=ui.results.length;}
 host.innerHTML=markup();
 if(keepFocus||focus){
  const field=$('#'+(focus?previousFocus:'gns-query'),host)||$('#gns-query',host);
  field?.focus({preventScroll:true});
  if(selection!=null)try{field.setSelectionRange(selection,selection);}catch(_){}
 }
 const pane=$('#gns-listpane',host);
 if(pane){
  if(ui.pendingReturn){
   pane.scrollTop=ui.pendingReturn.scroll;
   if(!fetching&&!(ui.scope==='library'&&!otherLoaded&&!failedOther)){
    const index=Math.max(0,ui.pendingReturn.at||0);
    const result=pane.querySelector('[data-gns-result="'+index+'"]');
    if(result){result.focus({preventScroll:true});}
    ui.pendingReturn=null;
   }
  }else pane.scrollTop=oldScroll;
 }
}
function open(restoring=false){
 ui.before=document.activeElement;ui.opened=true;
 if(!restoring){
  // The single magnifier remains a quiet Quick Find, even if the reader
  // last used a more complex research query. A Return link restores it.
  ui.expanded=false;ui.facet='all';ui.showFilters=false;ui.page=CONFIG.pageSize;
  ui.mode='terms';ui.nearTerm='';ui.nearGap=5;ui.nearOrdered=false;
  ui.booleanScope='passage';ui.orthography='normalized';
  ui.entryHash=location.hash;ui.entryScroll=window.scrollY;ui.pendingReturn=null;
 }
 if(!host){host=document.createElement('div');host.id='gn-unified-search';host.className='gns-root';document.body.append(host);}
 host.hidden=false;document.body.classList.add('gns-open');
 rerender();
 ensureLoaded();
}
function close(){
 if(!ui.opened)return;
 ui.opened=false;document.body.classList.remove('gns-open');if(host){host.innerHTML='';host.hidden=true;}
 if(ui.before&&ui.before.isConnected)try{ui.before.focus({preventScroll:true});}catch(_){}
}
function restoreResults(){
 const origin=window.GnammaSearchReturn?.read();
 if(!origin)return false;
 // Restore the source reading location so closing search returns to that place.
 const targetHash=origin.from?.hash||'';
 const currentHash=location.hash||'';
 if(currentHash!==targetHash){
  history.replaceState(null,'',location.pathname+location.search+targetHash);
  window.dispatchEvent(new Event('hashchange'));
 }
 const popup=document.querySelector('#infoOverlay:not([hidden])');
 popup?.querySelector('#detailClose')?.click();
 const keys=['query','facet','scope','mode','sort','display','expanded','showFilters','page','nearTerm','nearGap','nearOrdered','booleanScope','orthography'];
 for(const key of keys)if(Object.hasOwn(origin.state,key))ui[key]=origin.state[key];
 ui.entryHash=targetHash;ui.entryScroll=Number(origin.from?.y)||0;
 ui.pendingReturn={scroll:Math.max(0,Number(origin.state.listScroll)||0),
  at:Number(origin.selected?.at)||0};
 open(true);
 requestAnimationFrame(()=>{try{window.scrollTo({top:ui.entryScroll,behavior:'instant'});}catch(_){}});
 return true;
}
function fakeClick(data,value){
 const btn=document.createElement('button');btn.type='button';btn.setAttribute('data-'+data,String(value));
 btn.hidden=true;document.body.append(btn);btn.click();btn.remove();
}
function openPersonal(record){
 close();
 location.hash='#bookmarks';
 let count=0;
 const trySelect=()=>{
  const item=Array.from(document.querySelectorAll('#mainContent [data-rd="select"][data-id]')).find(el=>el.dataset.id===record.id);
  if(item){item.click();item.scrollIntoView({block:'center',behavior:'smooth'});return;}
  if(++count<10)setTimeout(trySelect,65);
 };
 setTimeout(trySelect,90);
}
function captureSearchOrigin(r){
 const scroll=$('#gns-listpane',host)?.scrollTop||0;
 const state={query:ui.query,facet:ui.facet,scope:ui.scope,mode:ui.mode,
  sort:ui.sort,display:ui.display,expanded:ui.expanded,showFilters:ui.showFilters,
  nearTerm:ui.nearTerm,nearGap:ui.nearGap,nearOrdered:ui.nearOrdered,
  booleanScope:ui.booleanScope,orthography:ui.orthography,
  page:ui.page,listScroll:scroll};
 const from={hash:ui.entryHash,y:ui.entryScroll};
 return window.GnammaSearchReturn?.capture({state,from,selected:{
  id:r.id,work:r.work,type:r.type,at:ui.results.indexOf(r)}}) || false;
}
function clearProximityHighlights(){
 try{
  CSS.highlights?.delete('gns-proximity-a');
  CSS.highlights?.delete('gns-proximity-b');
 }catch(_){}
}
function highlightProximityAtSource(rec){
 const hit=rec.matched;
 if(!hit||hit.relation!=='proximity'||rec.work!=='daruri'||
    !['en','ar'].includes(hit.field)||!window.GnammaProximity)return;
 const section=String(rec.section),segment=rec.segment;
 const grid=(document.getElementById('gn-continuous-'+section)?.querySelector('.passage-grid[data-segment="'+segment+'"]'))||
   document.querySelector('#reader .passage-grid[data-segment="'+segment+'"]');
 if(!grid)return;
 const root=grid.querySelector(hit.field==='ar'?'.passage-ar':'.passage-en');
 if(!root)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
  acceptNode:node=>node.nodeValue&&node.nodeValue.length&&
   !node.parentElement?.closest('.note-ref-symbol,.source-note-marker,.gns-source-badge')?
   NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT
 });
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 if(!nodes.length)return;
 const text=nodes.map(n=>n.nodeValue).join('');
 const left=queryPlan(hit.leftQuery,'terms').need.flat(),right=queryPlan(hit.rightQuery,'terms').need.flat();
 const matched=window.GnammaProximity.find(text,left,right,{
  normalize:fold,maxGap:hit.maxGap,ordered:hit.ordered
 });
 if(!matched)return;
 clearProximityHighlights();
 if(!window.CSS?.highlights||typeof window.Highlight==='undefined')return;
 const mapped=foldMapped(text).offsets;
 const atOffset=n=>{
  let remaining=Math.max(0,Number(n)||0);
  for(const node of nodes){
   if(remaining<=node.nodeValue.length)return [node,remaining];
   remaining-=node.nodeValue.length;
  }
  return [nodes.at(-1),nodes.at(-1).nodeValue.length];
 };
 const spanRange=span=>{
  const a=mapped[span.offsetStart],b=mapped[span.offsetEnd-1];
  if(!a||!b)return null;
  const start=atOffset(a[0]),end=atOffset(b[1]),range=document.createRange();
  try{range.setStart(...start);range.setEnd(...end);return range;}
  catch(_){return null;}
 };
 const ra=spanRange(matched.a),rb=spanRange(matched.b);
 if(ra)CSS.highlights.set('gns-proximity-a',new Highlight(ra));
 if(rb)CSS.highlights.set('gns-proximity-b',new Highlight(rb));
 // Scroll to the actual neighbourhood, not merely the section heading.
 try{grid.scrollIntoView({block:'center',behavior:'smooth'});}catch(_){}
}
function openRecord(r,originResult=null){
 if(!r)return;
 clearProximityHighlights();
 captureSearchOrigin(originResult||r);
 const hit=r.matched;
 if(r.privacy==='private'){openPersonal(r);return;}
 if(r.work==='mustasfa'){
  close();
  const url=r.url||('../texts/al-ghazali/al-mustasfa/'+
   (r.subtype==='Arabic witness'?'#arabic='+encodeURIComponent(r.locator):'#read='+encodeURIComponent(r.section)));
  location.href=url;return;
 }
 if(r.type==='note'||r.type==='source'){close();fakeClick('note-target',r.id);return;}
 if(r.type==='application'){close();fakeClick('app',r.id);return;}
 if(r.type==='dictionary'){
  if(r.tag==='historical'&&r.url){
   // Dictionary page understands these existing return-point keys.
   const hash=location.hash||'',fragment=hash.replace(/^#/,''),
     route=fragment.startsWith('section=')?'reader':fragment.split('?')[0]||'reader';
   let saved={};try{saved=JSON.parse(localStorage.getItem('daruri-reader-v2')||'{}');}catch(_){}
   const section=new URLSearchParams(fragment).get('section')||String(saved.n||'1'),
     point={section,y:window.scrollY,anchor:{segment:'0',top:145},hit:null};
   try{
    sessionStorage.setItem('daruri-return-location',JSON.stringify({point,created:Date.now()}));
    sessionStorage.setItem('daruri-dictionary-open-origin',JSON.stringify({
     created:Date.now(),route,hash,point,y:window.scrollY}));
   }catch(_){}
   close();location.href=r.url;return;
  }
  close();fakeClick('term',r.id);return;
 }
 if(r.type==='concept'&&!r.section){
  close();fakeClick('index-topic',r.title);return;
 }
 if(r.type==='study'){
  close();fakeClick('sg-open',r.id);return;
 }
 if((r.type==='text'||r.type==='concept')&&r.section){
  close();
  const term=hit?.term||ui.query;
  const isExact=(hit?.relation==='literal'||hit?.relation==='clitic'||hit?.relation==='terminology'||hit?.relation==='proximity');
  const button=document.createElement('button');button.hidden=true;button.dataset.section=r.section;
  if(isExact&&r.subtype!=='Section heading'&&r.type==='text')
   button.dataset.searchQuery=hit?.relation==='proximity'?hit.nearA.matched:term;
  document.body.append(button);button.click();button.remove();
  if(r.segment!=null&&r.segment>=0){
   const section=String(r.section),segment=r.segment;
   setTimeout(()=>{
    const grid=document.querySelector('#gn-continuous-'+CSS.escape(section)+' .passage-grid[data-segment="'+segment+'"]')||
      document.querySelector('#reader .passage-grid[data-segment="'+segment+'"]');
    if(grid)grid.scrollIntoView({block:'center',behavior:'smooth'});
    if(hit?.relation==='proximity')highlightProximityAtSource(r);
   },130);
  }
 }
}
function downloadCSV(){
 if(!ui.results.length)return;
 const keys=['work','type','subtype','locator','title','matchingField','matchKind','matchedText','excerpt','privacy'];
 const quote=v=>'"'+String(v==null?'':v).replace(/"/g,'""').replace(/\r?\n/g,' ')+'"';
 const rows=[keys.join(',')];
 for(const r of ui.results){
  const v=[r.work,r.type,r.subtype,r.locator,r.title,r.matched?.field,
    r.matched?.relation,r.matched?.term,
    r.matched?.raw?String(r.matched.raw).slice(0,600):r.body.slice(0,600),r.privacy];
  rows.push(v.map(quote).join(','));
 }
 const blob=new Blob(['\uFEFF'+rows.join('\r\n')],{type:'text/csv;charset=utf-8'});
 const uri=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=uri;a.download='gnamma-search-'+new Date().toISOString().slice(0,10)+'.csv';a.click();
 setTimeout(()=>URL.revokeObjectURL(uri),600);
}
function change(field,value){
 if(!['facet','scope','mode','sort','display'].includes(field))return;
 ui[field]=value;ui.pendingReturn=null;if(field==='scope'){failedOther='';ensureLoaded();}
 ui.page=CONFIG.pageSize;rerender(false);
}
document.addEventListener('click',event=>{
 const button=event.target.closest('#searchBtn');
 if(!button)return;
 event.preventDefault();event.stopImmediatePropagation();
 if(ui.opened)close();else open();
},true);
window.addEventListener('keydown',event=>{
 const key=event.key,cmd=event.metaKey||event.ctrlKey;
 const t=event.target,editable=t?.matches?.('input,textarea,select,[contenteditable="true"]');
 if((cmd&&key.toLowerCase()==='k')||(key==='/'&&!editable&&!event.altKey&&!cmd)){
  event.preventDefault();event.stopImmediatePropagation();
  if(!ui.opened)open();else $('#gns-query',host)?.focus({preventScroll:true});
  return;
 }
 if(!ui.opened)return;
 if(key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();}
},true);
document.addEventListener('click',event=>{
 if(!ui.opened||!host||!host.contains(event.target))return;
 const target=event.target.closest('[data-gns-close],[data-gns-expand],[data-gns-toggle-filters],'+
 '[data-gns-quick],[data-gns-facet],[data-gns-result],[data-gns-more],[data-gns-example],'+
 '[data-gns-retry],[data-gns-download],[data-gns-pattern-example],'+
 '[data-gns-add-row],[data-gns-remove-row],[data-gns-apply-builder],'+
 '[data-gns-save],[data-gns-load],[data-gns-delete],'+
 '[data-gns-evidence-result]');
 if(!target)return;
 event.preventDefault();event.stopPropagation();
 if(target.hasAttribute('data-gns-close')){close();return;}
 if(target.hasAttribute('data-gns-expand')){ui.expanded=target.dataset.gnsExpand==='1';ui.page=CONFIG.pageSize;rerender();return;}
 if(target.hasAttribute('data-gns-toggle-filters')){ui.showFilters=!ui.showFilters;rerender();return;}
 if(target.hasAttribute('data-gns-quick')){change('facet',target.dataset.gnsQuick);return;}
 if(target.hasAttribute('data-gns-facet')){change('facet',target.dataset.gnsFacet);return;}
 if(target.hasAttribute('data-gns-more')){ui.page+=CONFIG.pageSize;rerender(false);return;}
 if(target.hasAttribute('data-gns-evidence-result')){
  const source=ui.results[Number(target.dataset.gnsEvidenceResult)];
  const location=source?.matched?.locations?.[Number(target.dataset.gnsEvidenceIndex)];
  if(!source||!location)return;
  const rec=(location.work==='mustasfa'?otherItems:baseItems).find(x=>
    x.id===location.id&&x.work===location.work&&x.type===location.type);
  if(rec){
   const resolved={...rec,matched:{relation:'scholarly',field:location.field,
    raw:rec[location.field]||rec.body||rec.ar||rec.en,
    term:location.term,evidence:[],scope:'passage',
    reason:'Supporting evidence for the broader Boolean search'}};
   openRecord(resolved,source);
  }else openRecord(source);
  return;
 }
 if(target.hasAttribute('data-gns-result')){
  const r=ui.results[Number(target.dataset.gnsResult)];openRecord(r);return;
 }
 if(target.hasAttribute('data-gns-pattern-example')){
  ui.query=target.dataset.gnsPatternExample;ui.mode='scholarly';ui.facet='all';
  ui.page=CONFIG.pageSize;rerender();return;
 }
 if(target.hasAttribute('data-gns-add-row')){
  if(ui.builderRows.length>=8)return;
  ui.builderRows.push({join:'AND',kind:'word',text:'',field:'all'});
  ui.builderOpen=true;rerender(false);return;
 }
 if(target.hasAttribute('data-gns-remove-row')){
  const i=Number(target.dataset.gnsRemoveRow);
  if(i>0&&i<ui.builderRows.length)ui.builderRows.splice(i,1);
  ui.builderOpen=true;rerender(false);return;
 }
 if(target.hasAttribute('data-gns-apply-builder')){
  let source='';
  try{source=window.GnammaScholarly?.safeBuilder(ui.builderRows)||'';ui.builderError='';}
  catch(e){ui.builderError=e.message;ui.builderOpen=true;rerender(false);return;}
  if(!source){ui.builderOpen=true;ui.builderError='Add at least one condition to the builder.';rerender(false);return;}
  const parsed=window.GnammaScholarly.parse(source,ui.orthography==='original'?x=>String(x??'').toLowerCase().normalize('NFC'):fold);
  if(parsed.error){ui.builderError=parsed.error;ui.builderOpen=true;rerender(false);return;}
  ui.query=source;ui.mode='scholarly';ui.expanded=true;ui.builderOpen=true;ui.page=CONFIG.pageSize;
  ui.pendingReturn=null;rerender();return;
 }
 if(target.hasAttribute('data-gns-save')){gnSaveCurrent();return;}
 if(target.hasAttribute('data-gns-load')){gnLoadSavedQuery(Number(target.dataset.gnsLoad));return;}
 if(target.hasAttribute('data-gns-delete')){
  const i=Number(target.dataset.gnsDelete),items=gnLoadSaved();
  if(i>=0&&i<items.length)items.splice(i,1);
  try{localStorage.setItem(GN_SAVED_SEARCHES,JSON.stringify(items));}catch(_){}
  ui.savedOpen=true;rerender(false);return;
 }
 if(target.hasAttribute('data-gns-example')){
  ui.query=target.dataset.gnsExample;ui.facet='all';ui.page=CONFIG.pageSize;rerender();return;
 }
 if(target.hasAttribute('data-gns-retry')){failedOther='';ensureLoaded();return;}
 if(target.hasAttribute('data-gns-download')){
  if(ui.results.some(r=>r.privacy==='private')&&
   !confirm('This CSV will include matching private notes or highlights. Save it only where you intend to keep private research. Continue?'))return;
  downloadCSV();
 }
},true);
document.addEventListener('input',event=>{
 if(!ui.opened||!host)return;
 if(event.target?.dataset?.gnsBuilderText!==undefined){
  const i=Number(event.target.dataset.gnsBuilderText);
  if(ui.builderRows[i])ui.builderRows[i].text=event.target.value;
  const preview=$('#gns-builder-preview',host);
  try{
   if(preview)preview.textContent=window.GnammaScholarly?.safeBuilder(ui.builderRows)||'Add a term to build a query';
   ui.builderError='';
  }catch(e){if(preview)preview.textContent='Invalid condition: '+e.message;ui.builderError=e.message;}
  return;
 }
 if(!['gns-query','gns-near-term'].includes(event.target?.id))return;
 if(event.target.id==='gns-near-term')ui.nearTerm=event.target.value;
 else{
  ui.query=event.target.value;
  if(ui.mode==='terms'&&(/\b(?:AND|OR|NOT)\b/i.test(ui.query)&&/\s/u.test(ui.query)||
     /[{}|]/u.test(ui.query)||/[\p{L}\p{N}](?:[*?]|~[12])(?:\s|$)/u.test(ui.query)||
     /\[[\p{L}\p{N}]{1,12}\]/u.test(ui.query))){
    ui.mode='scholarly';ui.expanded=true;
  }
  const inline=ui.query.match(/^(.+?)\s+(NEAR|BEFORE)\/(\d{1,2})\s+(.+)$/i);
  if(inline){
   ui.query=inline[1].trim();ui.nearTerm=inline[4].trim();
   ui.nearGap=Math.min(50,Number(inline[3]));
   ui.nearOrdered=inline[2].toUpperCase()==='BEFORE';
   ui.mode='proximity';
  }
 }
 ui.page=CONFIG.pageSize;ui.pendingReturn=null;
 clearTimeout(inputTimer);inputTimer=setTimeout(()=>rerender(true),65);
},true);
document.addEventListener('change',event=>{
 if(!ui.opened||!host)return;
 const target=event.target;
 if(target.id==='gns-type')change('facet',target.value);
 if(target.id==='gns-scope')change('scope',target.value);
 if(target.id==='gns-mode')change('mode',target.value);
 if(target.id==='gns-sort')change('sort',target.value);
 if(target.id==='gns-display')change('display',target.value);
 if(target.id==='gns-near-gap'){ui.nearGap=Number(target.value)||0;ui.pendingReturn=null;rerender(false);}
 if(target.id==='gns-near-order'){ui.nearOrdered=target.checked;ui.pendingReturn=null;rerender(false);}
 if(target.id==='gns-boolean-scope'){ui.booleanScope=target.value;ui.pendingReturn=null;rerender(false);}
 if(target.id==='gns-orthography'){ui.orthography=target.value;ui.pendingReturn=null;rerender(false);}
 if(target.dataset?.gnsBuilderJoin!==undefined||target.dataset?.gnsBuilderKind!==undefined||
    target.dataset?.gnsBuilderField!==undefined){
  const key=target.dataset.gnsBuilderJoin!==undefined?'join':
    target.dataset.gnsBuilderKind!==undefined?'kind':'field';
  const index=Number(target.dataset.gnsBuilderJoin??target.dataset.gnsBuilderKind??target.dataset.gnsBuilderField);
  if(ui.builderRows[index])ui.builderRows[index][key]=target.value;
  ui.builderError='';ui.builderOpen=true;rerender(false);
 }
},true);
document.addEventListener('keydown',event=>{
 if(!ui.opened||!host||!host.contains(event.target))return;
 if(event.key==='Tab'){
  const focusable=$$('button:not(:disabled), input, select, a[href]',host).filter(n=>n.offsetParent!==null);
  const first=focusable[0],last=focusable.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
 }
 if((event.key==='ArrowDown'||event.key==='ArrowUp')&&event.target.tagName!=='SELECT'){
  const rows=$$('[data-gns-result]',host);
  if(!rows.length)return;
  const focused=rows.indexOf(document.activeElement);
  const direction=event.key==='ArrowDown'?1:-1;
  const index=focused<0?(direction===1?0:rows.length-1):(focused+direction+rows.length)%rows.length;
  event.preventDefault();rows[index]?.focus();
 }
 if(event.key==='Enter'&&event.target?.id==='gns-query'){
  event.preventDefault();openRecord(ui.results[0]);
 }
},true);
document.addEventListener('toggle',event=>{
 if(!ui.opened||!host||!host.contains(event.target))return;
 if(event.target?.dataset?.gnsDetails==='builder')ui.builderOpen=event.target.open;
 if(event.target?.dataset?.gnsDetails==='saved')ui.savedOpen=event.target.open;
},true);
window.addEventListener('storage',event=>{
 if(event.key===LOCAL_KEY&&ui.opened)rerender(false);
});
window.GnammaUnifiedSearch={
 version:CONFIG.version,
 open,close,restoreResults,fold,romanKey,direct,query:searchRecords,
 getEntries:()=>({core:baseItems.length,other:otherItems.length,personal:readPersonal().length}),
 getState:()=>({query:ui.query,facet:ui.facet,scope:ui.scope,mode:ui.mode,
  nearTerm:ui.nearTerm,nearGap:ui.nearGap,nearOrdered:ui.nearOrdered,
  booleanScope:ui.booleanScope,orthography:ui.orthography,queryError:ui.queryError,
  expanded:ui.expanded,results:ui.results.length}),
 loadLibrary:loadOther
};
if(location.hash==='#gns-results'&&window.GnammaSearchReturn?.read()){
 // Source route initializes before this module. Reopen after its first layout.
 setTimeout(()=>restoreResults(),0);
}
})();
