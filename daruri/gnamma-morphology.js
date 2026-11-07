/* Gnamma morphology: indexed, source-linked Arabic concordance.
 * Model-free browser reader. Morphological analysis is prepared OFFLINE; labels
 * and confidence are kept with each occurrence and are never silently upgraded.
 * Private Reading Desk material is not sent to this module or uploaded.
 */
(function(global){
'use strict';
const SCHEMA='gnamma-morph-v1',POST_SCHEMA='gnamma-morph-postings-v2',
 DETAIL_SCHEMA='gnamma-morph-detail-v2',VERSION='20261025-sigha-forms1';
const data=new Map(),pending=new Map(),errors=new Map(),listeners=new Set();
let lexicon=null,lexiconPromise=null,notice='';
const AR=/[\u0621-\u064a]/u;
function fold(s){
 return String(s??'').toLowerCase().normalize('NFD')
 .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g,'')
 .replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي')
 .replace(/[ʿʾ‘’ʻ']/g,'').trim();
}
function roman(s){
 return String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .replace(/[ʿʾ‘’ʻ']/g,'').replace(/3/g,'').replace(/7/g,'h')
 .replace(/[-_\s]/g,'').replace(/aa/g,'a').replace(/ee|ii/g,'i').replace(/oo|uu/g,'u');
}
function roots(s){
 const value=roman(s);
 const out={
  ktb:'كتب',ilm:'علم',alm:'علم',fqh:'فقه',hkm:'حكم',qys:'قيس',qis:'قيس',
  jhd:'جهد',jhdh:'جهد',qld:'قلد',jma:'جمع',jml:'جمع',nskh:'نسخ',nsx:'نسخ',
  all:'علل',lll:'علل',sbb:'سبب',dll:'دلل',brhn:'برهن',
  nzr:'نظر',zhn:'ظنن',zann:'ظنن',yqn:'يقن',asl:'اصل',fr:'فرع',
  shr:'شرع',wjb:'وجب',frd:'فرض',amr:'امر',nhy:'نهي',lfz:'لفظ',
  mny:'عني',khs:'خصص',amm:'عمم',zhr:'ظهر',btn:'بطن',
  sns:'سنن',hdth:'حدث',nss:'نصص',khbr:'خبر',qwl:'قول',ql:'قول',
  aml:'عمل',aql:'عقل',hqq:'حقق',sdq:'صدق',jhl:'جهل'
 };
 return out[value]||null;
}
function tokenize(raw){
 const re=/[\p{L}\p{M}]+/gu,out=[];let m;
 while((m=re.exec(String(raw||'')))!==null){
  if(AR.test(m[0]))out.push({word:m[0],start:m.index,end:re.lastIndex});
 }
 return out;
}
function sourceLabel(s){
 return s==='contextual-bert'?'Contextual MSA model suggestion (not scholarly checked)':
 s==='curated-root-hint'?'Root inferred from curated headword (unverified)':
 s==='contextual-alternative'?'Alternative MSA model analysis (not searched)':
 s==='contextual-backoff'?'Unknown word; automated fallback (not searched)':
 s==='reviewed'?'Scholarly reviewed':
 s==='curated-context'?'Context-sensitive editorial rule':
 s==='curated'?'Curated forms (not context-disambiguated)':
 s==='ambiguous'?'Ambiguous; multiple analyses possible':'Unknown analysis';
}
function alert(){for(const fn of listeners)try{fn()}catch(e){console.warn('Gnamma morphology listener',e)}}
function whenUpdated(fn){listeners.add(fn);return ()=>listeners.delete(fn)}
async function loadLexicon(){
 if(lexicon)return lexicon;
 if(!lexiconPromise)lexiconPromise=fetch('morph-lexicon.json?v='+VERSION,{credentials:'omit'})
  .then(r=>{if(!r.ok)throw Error('lexicon HTTP '+r.status);return r.json()})
  .then(obj=>{
   if(obj.schema!=='gnamma-morph-lexicon-v1'||!Array.isArray(obj.entries))throw Error('Invalid morphology lexicon');
   lexicon=obj.entries.map((x,i)=>({...x,index:i,normalized:fold(x.lemma),rootNorm:fold(x.root),
    romanKeys:(x.roman||[]).map(roman),formKeys:(x.forms||[]).map(fold)}));
   alert();
   return lexicon;
  }).catch(e=>{lexiconPromise=null;notice=e.message;alert();throw e});
 return lexiconPromise;
}
function candidates(value,lex){
 const raw=fold(value),rk=roman(value);
 const explicit=roots(value);
 const exactRoot=lex.some(x=>x.rootNorm===raw)&&raw.length>=3?raw:null;
 const asLemma=lex.filter(x=>x.normalized===raw||
  x.romanKeys.includes(rk)||x.formKeys.includes(raw));
 const root=explicit||exactRoot||null;
 const homographs=[...new Map(asLemma.map(x=>[x.normalized+'|'+x.rootNorm,x])).values()];
 return {raw,root,lemmas:homographs,
  hasArabic:AR.test(String(value||'')),hasKnown:!!(root||homographs.length)};
}
async function recognize(text){
 const l=await loadLexicon();
 return candidates(text,l);
}
function buildCompactIndex(raw){
 if(raw?.schema!==POST_SCHEMA||!['daruri','mustasfa'].includes(raw.work)||
    !Array.isArray(raw.ids)||!Number.isInteger(raw.shardSize)||
    raw.shardSize<1||raw.shardSize>256||
    raw.detailPrefix!=='morph-'+raw.work+'-details-v2/')
  throw Error('Invalid compact contextual morphology index');
 const idToOrdinal=new Map(),byLemma=new Map(),byRoot=new Map(),byForm=new Map();
 for(let i=0;i<raw.ids.length;i++){
  if(typeof raw.ids[i]!=='string'||idToOrdinal.has(raw.ids[i]))throw Error('Invalid source index IDs');
  idToOrdinal.set(raw.ids[i],i);
 }
 for(const [field,destination] of [[raw.l,byLemma],[raw.r,byRoot]]){
  if(!field||typeof field!=='object'||Array.isArray(field))throw Error('Missing compact postings');
  for(const [key,posts] of Object.entries(field)){
   if(!key||!Array.isArray(posts))continue;
   const rows=[];
   for(const p of posts){
    if(!Array.isArray(p)||p.length<2||!Number.isInteger(p[0])||
      !Number.isInteger(p[1])||p[0]<0||p[0]>=raw.ids.length||p[1]<0)
      throw Error('Invalid compact source token coordinate');
    rows.push({id:raw.ids[p[0]],position:p[1],surface:'',
      lemma:destination===byLemma?key:'',root:destination===byRoot?key:'',
      pos:'',source:p[2]===1?'reviewed':p[2]===2?'curated-root-hint':'contextual-bert',
      work:raw.work,confidence:p[2]===1?'reviewed':p[2]===2?'provisional':'automated'});
   }
   destination.set(fold(key),rows);
  }
 }
 if(raw.f&&typeof raw.f==='object'){
  for(const [form,keys] of Object.entries(raw.f)){
   if(!keys||typeof keys!=='object')continue;
   const lemmas=Array.isArray(keys.l)?keys.l:[],roots=Array.isArray(keys.r)?keys.r:[];
   byForm.set(fold(form),[
     ...lemmas.map(lemma=>({lemma,root:'',source:'contextual-bert'})),
     ...roots.map(root=>({lemma:'',root,source:'contextual-bert'}))
   ]);
  }
 }
 return {work:raw.work,byLemma,byRoot,byForm,byId:new Map(),
  contextual:true,compact:true,annotated:raw.summary?.searchableOccurrences||0,
  provenance:raw.annotator||'contextual MSA model, not reviewed',
  coverage:'Contextual candidate search: unreviewed Classical Arabic; details load on demand',
  idToOrdinal,shardSize:raw.shardSize,detailPrefix:raw.detailPrefix,
  detailCache:new Map(),detailPending:new Map()};
}
function buildIndex(raw){
 if(raw?.schema===POST_SCHEMA)return buildCompactIndex(raw);
 if(raw?.schema!==SCHEMA||!Array.isArray(raw.records))throw Error('Invalid morphological index schema');
 const byLemma=new Map(),byRoot=new Map(),byForm=new Map(),byId=new Map();
 let annotated=0,ambiguous=0;
 for(const row of raw.records){
  if(!row||typeof row.id!=='string'||!Array.isArray(row.a))continue;
  byId.set(row.id,row);
  for(const a of row.a){
   if(!Array.isArray(a)||a.length<6)continue;
   const [position,surface,lemma,root,pos,source,lexId,features]=a;
   if(!Number.isInteger(position)||position<0||typeof surface!=='string'||typeof lemma!=='string')continue;
   const hit={id:row.id,position,surface,lemma,root,pos,source,
    lexId:typeof lexId==='string'?lexId:'',
    features:features&&typeof features==='object'&&!Array.isArray(features)?features:{},
    work:raw.work,confidence:source==='reviewed'?'reviewed':source==='contextual-bert'?'automated':'provisional'};
   if(source==='ambiguous')ambiguous++;
   annotated++;
   // Alternative-ranked analyses belong to the word inspector, never to search postings.
   const searchable=source!=='contextual-alternative'&&source!=='contextual-backoff';
   const postings=[[byForm,fold(surface)]];
   if(searchable)postings.push([byLemma,fold(lemma)],[byRoot,fold(root)]);
   for(const [map,key] of postings){
    if(!key)continue;const bucket=map.get(key)||[];bucket.push(hit);map.set(key,bucket);
   }
  }
 }
 return {work:raw.work,byLemma,byRoot,byForm,byId,annotated,ambiguous,
  provenance:raw.annotator||'unspecified',coverage:raw.coverage||'',contextual:!!raw.contextual};
}
async function ensure(work){
 if(data.has(work))return data.get(work);
 if(errors.has(work))throw Error(errors.get(work));
 if(pending.has(work))return pending.get(work);
 const fallback=work==='mustasfa'?'morph-mustasfa-v1.json':'morph-daruri-v1.json';
 // The optional v2 index is activated ONLY by an explicit release flag.
 // Candidate files in GitHub Actions are never loaded by public readers.
 const candidate='morph-'+work+'-search-v2.json';
 const path=global.GnammaContextualMorphAssets?.[work]===candidate?candidate:fallback;
 const promise=fetch(path+'?v='+VERSION,{credentials:'omit'})
  .then(r=>{if(!r.ok)throw Error('morphology index HTTP '+r.status);return r.json()})
  .then(raw=>{if(raw.work!==work)throw Error('Morphology index work mismatch');
    const index=buildIndex(raw);data.set(work,index);pending.delete(work);errors.delete(work);alert();return index;
  }).catch(e=>{pending.delete(work);errors.set(work,e.message);notice=e.message;alert();throw e});
 pending.set(work,promise);return promise;
}
function status(work){return {loaded:data.has(work),loading:pending.has(work),failed:errors.get(work)||'',message:notice,
 provenance:data.get(work)?.provenance||'',coverage:data.get(work)?.coverage||''}}
async function ensureDetail(work,id){
 const index=await ensure(work);
 if(!index.compact)return index;
 const ordinal=index.idToOrdinal.get(id);
 if(!Number.isInteger(ordinal))return null;
 const shard=Math.floor(ordinal/index.shardSize);
 if(index.detailCache.has(shard)){
  const loaded=index.detailCache.get(shard);
  index.detailCache.delete(shard);
  index.detailCache.set(shard,loaded);
  return loaded;
 }
 if(index.detailPending.has(shard))return index.detailPending.get(shard);
 const path=index.detailPrefix+String(shard).padStart(4,'0')+'.json';
 const promise=fetch(path+'?v='+VERSION,{credentials:'omit'})
  .then(r=>{if(!r.ok)throw Error('Word-detail shard HTTP '+r.status);return r.json()})
  .then(raw=>{
   if(raw.schema!==DETAIL_SCHEMA||raw.work!==work||raw.shard!==shard||
    !Array.isArray(raw.records))throw Error('Malformed word-detail shard');
   const min=shard*index.shardSize,max=Math.min(index.idToOrdinal.size,min+index.shardSize);
   for(const row of raw.records){
    const i=index.idToOrdinal.get(row?.id);
    if(!Number.isInteger(i)||i<min||i>=max)throw Error('Word-detail shard source mismatch');
   }
   const local=buildIndex({schema:SCHEMA,work,records:raw.records,
    annotator:index.provenance,contextual:true});
   index.detailCache.set(shard,local);
   if(index.detailCache.size>4)index.detailCache.delete(index.detailCache.keys().next().value);
   index.detailPending.delete(shard);
   return local;
  }).catch(error=>{index.detailPending.delete(shard);throw error});
 index.detailPending.set(shard,promise);
 return promise;
}
function lookup(token,work,opts={}){
 const index=data.get(work);
 if(!index)return [];
 const key=fold(token);
 let arr=[];
 if(index.compact){
  const ordinal=index.idToOrdinal.get(opts.id);
  if(!Number.isInteger(ordinal))return [];
  const local=index.detailCache.get(Math.floor(ordinal/index.shardSize));
  if(!local)return [];
  arr=local.byForm.get(key)||[];
 }else arr=index.byForm.get(key)||[];
 if(!opts.id)return arr.slice(0,20);
 return arr.filter(h=>h.id===opts.id&&(opts.position==null||h.position===opts.position)).slice(0,16);
}
function disambiguate(word,neighbours=[],work,id=null,position=null){
 const found=lookup(word,work,{id,position});
 if(found.length){
  const positions=new Set(found.map(x=>x.position));
  const curatedReview=found.filter(x=>x.source==='reviewed');
  const ranked=found.filter(x=>x.source==='contextual-bert');
  const primary=curatedReview.length===1?curatedReview[0]:
   ranked.length===1?ranked[0]:null;
  if(id&&position==null&&positions.size>1){
   const candidates=[...new Map(found.filter(x=>x.source!=='contextual-alternative')
    .map(x=>[x.lemma+'|'+x.pos+'|'+(x.lexId||''),x])).values()];
   return {best:null,alternatives:candidates,certainty:'occurrence-unlocated'};
  }
  if(primary){
   const alternatives=found.filter(x=>x!==primary&&x.source==='contextual-alternative');
   return {best:primary,alternatives,
    certainty:primary.source==='reviewed'?'reviewed':'automated'};
  }
  const distinct=[...new Map(found.filter(x=>x.source!=='contextual-alternative')
   .map(x=>[x.lemma+'|'+x.pos+'|'+(x.lexId||''),x])).values()];
  return {best:distinct.length===1?distinct[0]:null,
   alternatives:distinct.length===1?[]:distinct,
   certainty:distinct.length===1?distinct[0].confidence:'ambiguous'};
 }
 const matches=(lexicon||[]).filter(x=>x.formKeys.includes(fold(word)));
 if(matches.length===1){
  const x=matches[0];return {best:{surface:word,lemma:x.lemma,root:x.root,pos:x.pos,source:'curated'},
  alternatives:[],certainty:'provisional'};
 }
 if(matches.length>1){
  const prev=fold(neighbours[0]||''),next=fold(neighbours[1]||'');
  const katabaVerb=matches.find(x=>fold(x.lemma)==='كتب'&&x.pos==='verb');
  const kutubNoun=matches.find(x=>fold(x.lemma)==='كتاب'&&x.pos==='noun');
  const choose=katabaVerb&&kutubNoun&&(prev==='قد'||prev==='لم'||prev==='لن'||next==='الدرس'?katabaVerb:
    next==='القديمة'||next==='الجديدة'||prev==='هذه'?kutubNoun:null);
  if(choose)return {best:{surface:word,lemma:choose.lemma,root:choose.root,
    pos:choose.pos,source:'curated-context'},alternatives:matches.filter(x=>x!==choose),
    certainty:'provisional'};
  return {best:null,alternatives:matches,certainty:'ambiguous'};
 }
 return {best:null,alternatives:[],certainty:'not-analysed'};
}
/** Attested surface spellings for a lemma; not guesses generated from a root.
 * An unusual spelling means its normalized spelling does not simply contain
 * the headword. It may be a broken plural, inflection or other grammatical
 * variation; no unreviewed grammatical claim is made from this heuristic. */
function formsFor(query,work='daruri',limit=6){
 if(!lexicon||!data.has(work))return [];
 const opts=candidates(query,lexicon),index=data.get(work);
 const keys=new Set(opts.lemmas.map(x=>x.normalized));
 if(!keys.size&&opts.hasArabic){
  for(const h of index.byForm.get(opts.raw)||[]){
   if(h.source==='ambiguous'||h.source==='contextual-alternative')continue;
   if(h.lemma)keys.add(fold(h.lemma));
  }
 }
 const found=new Map();
 // Among genuinely attested forms, favor recognized dictionary spellings over
 // rare prefixed tokens. The query is never expanded by guessing from roots.
 const canonicalForms=new Map(opts.lemmas.map(x=>[x.normalized,new Set(x.formKeys||[])]));
 for(const key of keys)for(const hit of index.byLemma.get(key)||[]){
  if(!hit.surface||hit.source==='ambiguous')continue;
  const form=fold(hit.surface);
  if(!form)continue;
  let row=found.get(form);
  if(!row){row={form:hit.surface,count:0,lemma:key,
    unusual:!form.includes(key),canonical:!!canonicalForms.get(key)?.has(form),
    source:hit.source};found.set(form,row)}
  row.count++;
 }
 return [...found.values()]
  .sort((a,b)=>Number(b.unusual)-Number(a.unusual)||
    Number(b.canonical)-Number(a.canonical)||
    Number(a.form.startsWith('ال'))-Number(b.form.startsWith('ال'))||
    a.form.length-b.form.length||b.count-a.count||
    a.form.localeCompare(b.form,'ar'))
  .slice(0,Math.max(0,Math.min(20,limit)));
}
function find(query,mode,corpus){
 if(!lexicon)return {ready:!!notice,items:[],message:notice?'Morphology dictionary unavailable: '+notice:'Loading root and lemma register'};
 const q=candidates(query,lexicon),kind=mode==='morph-root'?'root':'lemma';
 const workSet=new Set(corpus.filter(x=>x.work==='mustasfa'||x.work==='daruri').map(x=>x.work));
 for(const work of workSet)if(!data.has(work)){
  if(errors.has(work))return {ready:true,items:[],message:'Morphology for '+work+' is unavailable: '+errors.get(work)};
  ensure(work).catch(()=>{});
  return {ready:false,items:[],message:'Loading morphology for '+work};
 }
 const keys=kind==='root'?[q.root,...q.lemmas.map(x=>x.rootNorm)].filter(Boolean):
  q.lemmas.map(x=>x.normalized);
 if(kind==='root'&&!keys.length&&q.hasArabic&&q.raw.length===3)keys.push(q.raw);
 // Let a selected/typed inflected form resolve through actual occurrence
 // analyses. Exclude speculative and alternative-ranked analyses.
 let formAmbiguity=0;
 if(q.hasArabic&&!keys.length){
  const hypotheses=new Set();
  for(const work of workSet){
   const index=data.get(work);
   for(const h of index?.byForm.get(q.raw)||[]){
    if(['ambiguous','contextual-alternative','contextual-backoff'].includes(h.source))continue;
    const value=kind==='root'?fold(h.root):fold(h.lemma);
    if(value)hypotheses.add(value);
   }
  }
  for(const key of hypotheses)keys.push(key);
  formAmbiguity=hypotheses.size;
 }
 const groups=new Map(),recById=new Map(corpus.map(r=>[r.work+'\0'+r.id,r]));
 for(const work of workSet){
  const index=data.get(work),map=kind==='root'?index.byRoot:index.byLemma;
  if(!index)continue;
  for(const key of new Set(keys)){
   for(const h of map.get(key)||[]){
    const rec=recById.get(h.work+'\0'+h.id);if(!rec)continue;
    if(!h.surface&&index.compact){
     const sourceTokens=tokenize(rec.ar||'');
     const foundToken=sourceTokens[h.position];
     if(!foundToken)continue;
     h.surface=foundToken.word;
    }
    if(!h.surface)continue;
    const uncertain=h.source==='ambiguous';
    if(uncertain&&kind==='lemma')continue;
    const entryKey=rec.work+'\0'+rec.id;
    let entry=groups.get(entryKey);
    if(!entry){entry={rec,hits:[],seen:new Set()};groups.set(entryKey,entry)}
    const signature=h.position+'|'+fold(h.surface)+'|'+h.source;
    if(entry.seen.has(signature))continue;
    entry.seen.add(signature);
    entry.hits.push(h);
   }
  }
 }
 const items=[...groups.values()].map(({rec,hits})=>{
  // A paragraph can contain both القياس and its broken plural أقيسة.
  // Never collapse the hit list to its earliest ordinary spelling.
  const lemmaKey=kind==='lemma'?(q.lemmas[0]?.normalized||keys[0]||''):'';
  const isUnusual=h=>kind==='lemma'&&lemmaKey&&
   !fold(h.surface).includes(lemmaKey);
  const isQueryForm=h=>q.hasArabic&&fold(h.surface)===q.raw;
  hits.sort((a,b)=>Number(isQueryForm(b))-Number(isQueryForm(a))||
    Number(isUnusual(b))-Number(isUnusual(a))||
    Number(a.position||0)-Number(b.position||0));
  const h=hits[0],unusual=isUnusual(h),uncertain=h.source==='ambiguous';
  const forms=[...new Map(hits.map(hit=>[fold(hit.surface),hit.surface])).values()];
  const match={at:-1,term:h.surface};
  const family=kind==='root'?(h.root||keys[0]):(h.lemma||keys[0]);
  const reason=(kind==='root'?'Shared Arabic root ':'Same Arabic lemma ')+
   family+' · '+sourceLabel(h.source);
  return {...rec,score:(uncertain?16:65)+(h.source==='reviewed'?20:
   h.source==='contextual-bert'?12:0)+(unusual?30:0),
   matched:{field:'ar',raw:rec.ar,match,term:h.surface,relation:'morphology',
    root:h.root||'',lemma:h.lemma||family,pos:h.pos,source:h.source,
    forms,occurrences:hits.map(x=>({position:x.position,term:x.surface,
     lemma:x.lemma,root:x.root,source:x.source})),unusual,
    reason}};
 });
 const explanation=formAmbiguity>1?'This spelling has '+formAmbiguity+
  ' possible dictionary analyses across occurrences. Results may cover several headwords; inspect the individual words.':
  keys.length?'':'No indexed lemma or root mapping for this spelling yet. Try ordinary word search.';
 return {ready:true,items,mode:kind,keys:[...new Set(keys)],candidate:q,message:explanation};
}
const api={version:VERSION,fold,roman,roots,tokenize,sourceLabel,recognize,loadLexicon,ensure,ensureDetail,status,find,formsFor,lookup,disambiguate,whenUpdated,getLexicon:()=>lexicon||[]};
global.GnammaMorphology=Object.freeze(api);
loadLexicon().catch(()=>{});
})(window);
