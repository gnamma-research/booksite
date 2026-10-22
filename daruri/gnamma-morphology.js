/* Gnamma morphology: indexed, source-linked Arabic concordance.
 * Model-free browser reader. Morphological analysis is prepared OFFLINE; labels
 * and confidence are kept with each occurrence and are never silently upgraded.
 * Private Reading Desk material is not sent to this module or uploaded.
 */
(function(global){
'use strict';
const SCHEMA='gnamma-morph-v1',VERSION='20261022-morph1';
const data=new Map(),pending=new Map(),listeners=new Set();
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
 return s==='contextual-bert'?'Contextual model (automated; unverified)':
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
function buildIndex(raw){
 if(raw?.schema!==SCHEMA||!Array.isArray(raw.records))throw Error('Invalid morphological index schema');
 const byLemma=new Map(),byRoot=new Map(),byForm=new Map(),byId=new Map();
 let annotated=0,ambiguous=0;
 for(const row of raw.records){
  if(!row||typeof row.id!=='string'||!Array.isArray(row.a))continue;
  byId.set(row.id,row);
  for(const a of row.a){
   if(!Array.isArray(a)||a.length<6)continue;
   const [position,surface,lemma,root,pos,source]=a;
   if(!Number.isInteger(position)||position<0||typeof surface!=='string'||typeof lemma!=='string')continue;
   const hit={id:row.id,position,surface,lemma,root,pos,source,work:raw.work,confidence:source==='reviewed'?'reviewed':source==='contextual-bert'?'automated':'provisional'};
   if(source==='ambiguous')ambiguous++;
   annotated++;
   for(const [map,key] of [[byLemma,fold(lemma)],[byRoot,fold(root)],[byForm,fold(surface)]]){
    if(!key)continue;const bucket=map.get(key)||[];bucket.push(hit);map.set(key,bucket);
   }
  }
 }
 return {work:raw.work,byLemma,byRoot,byForm,byId,annotated,ambiguous,
  provenance:raw.annotator||'unspecified',coverage:raw.coverage||'',contextual:!!raw.contextual};
}
async function ensure(work){
 if(data.has(work))return data.get(work);
 if(pending.has(work))return pending.get(work);
 const path=work==='mustasfa'?'morph-mustasfa-v1.json':'morph-daruri-v1.json';
 const promise=fetch(path+'?v='+VERSION,{credentials:'omit'})
  .then(r=>{if(!r.ok)throw Error('morphology index HTTP '+r.status);return r.json()})
  .then(raw=>{if(raw.work!==work)throw Error('Morphology index work mismatch');
    const index=buildIndex(raw);data.set(work,index);pending.delete(work);alert();return index;
  }).catch(e=>{pending.delete(work);notice=e.message;alert();throw e});
 pending.set(work,promise);return promise;
}
function status(work){return {loaded:data.has(work),loading:pending.has(work),message:notice,
 provenance:data.get(work)?.provenance||'',coverage:data.get(work)?.coverage||''}}
function lookup(token,work,opts={}){
 const index=data.get(work);
 if(!index)return [];
 const key=fold(token);
 const arr=index.byForm.get(key)||[];
 if(!opts.id)return arr.slice(0,20);
 return arr.filter(h=>h.id===opts.id&&(opts.position==null||h.position===opts.position)).slice(0,16);
}
function disambiguate(word,neighbours=[],work,id=null,position=null){
 const found=lookup(word,work,{id,position});
 if(found.length===1)return {best:found[0],alternatives:[],certainty:found[0].confidence};
 if(found.length>1){
  const distinct=[...new Map(found.map(x=>[x.lemma+'|'+x.pos,x])).values()];
  return {best:distinct.length===1?distinct[0]:null,
   alternatives:distinct,certainty:distinct.length===1?'provisional':'ambiguous'};
 }
 const matches=(lexicon||[]).filter(x=>x.formKeys.includes(fold(word)));
 if(matches.length===1){
  const x=matches[0];return {best:{surface:word,lemma:x.lemma,root:x.root,pos:x.pos,source:'curated'},
  alternatives:[],certainty:'provisional'};
 }
 if(matches.length>1){
  // Only well-defined contextual cues; never claim a general Arabic parser.
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
function find(query,mode,corpus){
 if(!lexicon)return {ready:false,items:[],message:'Loading root and lemma register'};
 const q=candidates(query,lexicon),kind=mode==='morph-root'?'root':'lemma';
 const workSet=new Set(corpus.filter(x=>x.work==='mustasfa'||x.work==='daruri').map(x=>x.work));
 for(const work of workSet)if(!data.has(work)){ensure(work).catch(()=>{});return {ready:false,items:[],message:'Loading morphology for '+work}};
 const keys=kind==='root'?[q.root,...q.lemmas.map(x=>x.rootNorm)].filter(Boolean):
  q.lemmas.map(x=>x.normalized);
 if(kind==='lemma'&&!keys.length&&q.hasArabic)keys.push(q.raw);
 if(kind==='root'&&!keys.length&&q.hasArabic&&q.raw.length===3)keys.push(q.raw);
 const matches=new Map(),recById=new Map(corpus.map(r=>[r.work+'\0'+r.id,r]));
 for(const work of workSet){
  const index=data.get(work),map=kind==='root'?index.byRoot:index.byLemma;
  if(!index)continue;
  for(const key of new Set(keys)){
   for(const h of map.get(key)||[]){
    const rec=recById.get(h.work+'\0'+h.id);if(!rec)continue;
    const entryKey=rec.work+'\0'+rec.id;
    const uncertain=h.source==='ambiguous';
    if(uncertain&&kind==='lemma')continue; // no speculative lemma assignment
    if(!matches.has(entryKey)||!uncertain&&matches.get(entryKey).source==='ambiguous')
      matches.set(entryKey,{rec,h,source:h.source,uncertain});
   }
  }
 }
 const items=[...matches.values()].map(({rec,h,uncertain})=>{
  const match={at:-1,term:h.surface};
  const reason=(kind==='root'?'Shared Arabic root ':'Same Arabic lemma ')+
   (kind==='root'?h.root:h.lemma)+' · '+sourceLabel(h.source);
  return {...rec,score:(uncertain?16:65)+(h.source==='reviewed'?20:h.source==='contextual-bert'?12:0),
   matched:{field:'ar',raw:rec.ar,match,term:h.surface,relation:'morphology',
    root:h.root,lemma:h.lemma,pos:h.pos,source:h.source,reason}};
 });
 return {ready:true,items,mode:kind,keys:[...new Set(keys)],candidate:q,message:keys.length?'':'No verified lemma or root mapping for this input'};
}
const api={version:VERSION,fold,roman,roots,tokenize,sourceLabel,recognize,loadLexicon,ensure,status,find,lookup,disambiguate,whenUpdated,getLexicon:()=>lexicon||[]};
global.GnammaMorphology=Object.freeze(api);
loadLexicon().catch(()=>{});
})(window);
