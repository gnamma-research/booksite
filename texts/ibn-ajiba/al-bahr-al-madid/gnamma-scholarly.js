/*
 * Gnamma Scholarly Pattern Search (GSP v1).
 * Fixed, bounded grammar and deterministic token matching. No eval, and no
 * RegExp constructed from user strings. Witness metadata is never invented.
 * This module has no network, disk or Reading Desk write operations.
 */
(function(global){
'use strict';
const LIMIT={chars:350,tokens:48,depth:9,term:48,pattern:36,wildcards:2,alternatives:16,fuzzy:2};
const PREFIXES=['ال','وال','فال','بال','كال','لل','و','ف','ب','ل','ك'];
const TOKEN_RX=/[\p{L}\p{N}]+/gu,ORIGINAL_RX=/[\p{L}\p{N}\p{M}]+/gu;
const UCODE=/[\p{L}\p{N}]/u;
const fields=new Set(['ar','en','title','body','type','kind']);
const NONASCII=/[\u0600-\u06ff]/u;
const dictionary={
 and:'and',or:'or',not:'not',near:'near',before:'before',
 term:'word',phrase:'phrase',group:'group'
};
const normOriginal=x=>String(x||'').toLowerCase().normalize('NFC');
function fail(message,position=0){const err=new Error(message);err.position=position;throw err;}
function lex(input){
 const q=String(input||'');
 if(q.length>LIMIT.chars)fail('Keep the search below '+LIMIT.chars+' characters.');
 const parts=[];let i=0;
 while(i<q.length){
  const ch=q[i];
  if(/\s/u.test(ch)){i++;continue;}
  if('(){}|'.includes(ch)){
   parts.push({type:ch,raw:ch,at:i});i++;continue;
  }
  if(ch==='"'||ch==='“'){
   const start=i,closing=ch==='“'?'”':'"';i++;let body='';
   while(i<q.length&&q[i]!==closing){
    if(q[i]==='\\'&&i+1<q.length&&(q[i+1]===closing||q[i+1]==='\\'))i++;
    body+=q[i++];if(body.length>110)fail('Quoted phrases must be under 110 characters.',start);
   }
   if(i>=q.length)fail('Close the quoted phrase with '+closing+'.',start);
   i++;
   if(!body.trim())fail('Quoted phrases cannot be empty.',start);
   parts.push({type:'phrase',raw:body,at:start});continue;
  }
  const start=i;let word='',inClass=false;
  while(i<q.length&&!/\s/u.test(q[i])){
   const c=q[i];
   if(c==='['){if(inClass)fail('Nested letter sets are not supported.',i);inClass=true;}
   else if(c===']'){if(!inClass)fail('Unexpected ] in spelling pattern.',i);inClass=false;}
   else if(!inClass&&('(){}|"“'.includes(c)))break;
   word+=c;i++;
   if(word.length>LIMIT.term+12)fail('Individual search words are too long.',start);
  }
  if(inClass)fail('Close the letter set with ].',start);
  if(!word)fail('Unexpected search character.',i);
  const uc=word.toUpperCase();
  if(['AND','OR','NOT'].includes(uc))parts.push({type:uc.toLowerCase(),raw:word,at:start});
  else if(/^(NEAR|BEFORE)\/(\d{1,2})$/i.test(word)){
   const m=word.match(/^(NEAR|BEFORE)\/(\d{1,2})$/i),gap=Number(m[2]);
   if(gap>50)fail('Proximity must be 0–50 intervening words.',start);
   parts.push({type:m[1].toLowerCase(),gap,raw:word,at:start});
  }
  else parts.push({type:'word',raw:word,at:start});
  if(parts.length>LIMIT.tokens)fail('The query has too many terms or operators.');
 }
 return parts;
}
function parseWord(raw,at,normalize){
 let field='all',rest=raw;
 const m=raw.match(/^([a-z]+):(.*)$/i);
 if(m&&fields.has(m[1].toLowerCase())){
  field=m[1].toLowerCase();rest=m[2];
  if(!rest)fail('Write a word after '+field+':, or use '+field+':"exact phrase".',at);
 }
 if(!rest||rest==='*'||rest==='?')fail('A wildcard needs actual letters around it.',at);
 const fuzzy=rest.match(/^(.+)~([12])$/u);
 let distance=0;if(fuzzy){rest=fuzzy[1];distance=Number(fuzzy[2]);}
 if(rest.includes('~'))fail('Approximate spelling uses word~1 or word~2.',at);
 if(rest.length>LIMIT.term)fail('Pattern word is too long.',at);
 const hasPatterns=/[*?\[]/u.test(rest);
 if(distance&&hasPatterns)fail('Do not combine fuzzy (~) and wildcard patterns in one word.',at);
 const pat=hasPatterns?patternParts(rest,normalize,at):null;
 const original=normalize(rest);
 if(distance&&(Array.from(original).length<4||Array.from(original).length>24))
  fail('Approximate spelling requires a word of 4–24 letters.',at);
 if(!pat&&![...original].some(c=>UCODE.test(c)))fail('Search words must contain letters or numbers.',at);
 return {type:'term',raw:rest,field,distance,pattern:pat,at};
}
function patternParts(raw,normalize,at){
 const items=[],chars=Array.from(raw);let wild=0;
 for(let i=0;i<chars.length;i++){
  const c=chars[i];
  if(c==='*'||c==='?'){
   wild++;items.push({kind:c==='*'?'star':'one'});continue;
  }
  if(c==='['){
   let closing=i+1;while(closing<chars.length&&chars[closing]!==']')closing++;
   if(closing===chars.length)fail('Close the letter set with ].',at);
   const content=chars.slice(i+1,closing);
   if(!content.length||content.length>12||content.some(x=>!UCODE.test(x)))
     fail('Letter sets need 1–12 literal letters, e.g. [ؤئ].',at);
   items.push({kind:'set',values:[...new Set(content.map(normalize))]});
   i=closing;continue;
  }
  if(!UCODE.test(c)&&!/\p{M}/u.test(c))fail('Use only letters, ?, *, or [letters] in word patterns.',at);
  const value=normalize(c);
  for(const letter of Array.from(value))items.push({kind:'letter',value:letter});
 }
 if(wild>LIMIT.wildcards)fail('Use at most two wildcard characters per word.',at);
 if(items.length>LIMIT.pattern)fail('The spelling pattern is too long.',at);
 return items;
}
function glob(items,token){
 const chars=Array.from(token);
 if(chars.length>72)return false;
 const memo=new Map();
 function run(pi,ci){
  const id=pi+':'+ci;if(memo.has(id))return memo.get(id);
  if(pi===items.length)return ci===chars.length;
  const item=items[pi];let ok=false;
  if(item.kind==='star'){
   ok=run(pi+1,ci)||(ci<chars.length&&run(pi,ci+1));
  }else if(ci<chars.length){
   if(item.kind==='one')ok=run(pi+1,ci+1);
   else if(item.kind==='letter')ok=item.value===chars[ci]&&run(pi+1,ci+1);
   else if(item.kind==='set')ok=item.values.includes(chars[ci])&&run(pi+1,ci+1);
  }
  memo.set(id,ok);return ok;
 }
 return run(0,0);
}
function boundedDistance(a,b,max){
 const left=Array.from(a),right=Array.from(b);
 if(Math.abs(left.length-right.length)>max||left.length>32||right.length>32)return max+1;
 let prev=Array.from({length:right.length+1},(_,i)=>i);
 for(let i=1;i<=left.length;i++){
  const curr=new Array(right.length+1).fill(max+1);curr[0]=i;
  let rowMin=curr[0];
  for(let j=1;j<=right.length;j++){
   curr[j]=Math.min(prev[j]+1,curr[j-1]+1,prev[j-1]+(left[i-1]===right[j-1]?0:1));
   if(curr[j]<rowMin)rowMin=curr[j];
  }
  if(rowMin>max)return max+1;
  prev=curr;
 }
 return prev[right.length];
}
function parse(input,normalize=x=>String(x||'')){
 let tokens;try{tokens=lex(input);}catch(e){return {ast:null,error:e.message,position:e.position??0,positive:0};}
 let pos=0,depth=0,termCount=0;
 function peek(){return tokens[pos];}
 function consume(expected){const t=peek();if(!t||expected&&t.type!==expected)
    fail(expected?'Expected '+expected+'.':'Expected a search term.',t?.at??input.length);
   pos++;return t;}
 function primary(){
  const t=peek();if(!t)fail('The query ends before a complete condition.',input.length);
  if(t.type==='('||t.type==='{'){
   if(++depth>LIMIT.depth)fail('The expression has too many nested groups.',t.at);
   consume();const result=orExpr();consume(t.type==='('?')':'}');depth--;
   return result;
  }
  if(t.type==='phrase'){consume();termCount++;return {type:'phrase',raw:t.raw,field:'all',at:t.at};}
  if(t.type==='word'){
   consume();
   // A field qualifier is allowed before either a word or a quotation.
   if(/^(ar|en|title|body|type|kind):$/i.test(t.raw)){
    const field=t.raw.slice(0,-1).toLowerCase(),next=peek();
    if(!next||!['word','phrase'].includes(next.type))fail('Add a word or quoted phrase after '+field+':.',t.at);
    const result=primary();
    if(!['phrase','term'].includes(result.type))fail('Field qualifiers apply to one word or phrase.',t.at);
    result.field=field;return result;
   }
   termCount++;return parseWord(t.raw,t.at,normalize);
  }
  fail('Expected a word, quoted phrase, or grouped expression.',t.at);
 }
 function unary(){if(peek()?.type==='not'){const t=consume();return {type:'not',child:unary(),at:t.at};}return primary();}
 function near(){
  let left=unary();
  while(['near','before'].includes(peek()?.type)){
   const t=consume();const right=unary();
   if(left.type==='not'||right.type==='not')fail('NOT cannot be used as one side of proximity.',t.at);
   left={type:'near',left,right,gap:t.gap,ordered:t.type==='before',at:t.at};
  }
  return left;
 }
 function andExpr(){
  let left=near();
  while(pos<tokens.length){
   const t=peek();
   if(['or',')','}','|'].includes(t.type))break;
   if(t.type==='and'){consume();left={type:'and',left,right:near(),at:t.at};continue;}
   // "qiyas NOT taqlid" is a readable abbreviation of "qiyas AND NOT taqlid".
   if(['word','phrase','(','{','not'].includes(t.type)){
    left={type:'and',left,right:near(),at:t.at};continue;
   }
   fail('Unexpected operator '+t.raw+'.',t.at);
  }
  return left;
 }
 function orExpr(){
  let left=andExpr();
  while(['or','|'].includes(peek()?.type)){
   const t=consume();left={type:'or',left,right:andExpr(),at:t.at};
  }
  return left;
 }
 if(!tokens.length)return {ast:null,error:'Enter a search expression.',positive:0};
 try{
  const ast=orExpr();
  if(pos!==tokens.length)fail('Unmatched bracket or unexpected character.',peek().at);
  if(termCount>24)fail('Use no more than 24 searched terms.');
  const hasPositive=(n,neg=false)=>{
   if(n.type==='not')return hasPositive(n.child,!neg);
   if(n.type==='and'||n.type==='or'||n.type==='near')
    return hasPositive(n.left,neg)||hasPositive(n.right,neg);
   return !neg;
  };
  if(!hasPositive(ast))fail('Add a positive term; NOT on its own cannot return a meaningful scholarly concordance.');
  return {ast,error:null,positive:termCount};
 }catch(e){return {ast:null,error:e.message,position:e.position??0,positive:0};}
}
function tokenize(raw,normalize,original=false){
 const value=normalize(String(raw||'')),rx=original?ORIGINAL_RX:TOKEN_RX;
 return [...value.matchAll(rx)].map((m,i)=>({word:m[0],start:i,end:i,at:m.index,after:m.index+m[0].length}));
}
function equivalents(term,normalize,aliasProvider,original){
 const raw=normalize(term),list=[raw];
 if(!original&&typeof aliasProvider==='function'){
  const extras=aliasProvider(term)||[];
  for(const alt of extras){
   if(list.length>=LIMIT.alternatives)break;
   const v=normalize(alt);if(v&&!list.includes(v))list.push(v);
  }
 }
 return list.map((s,i)=>({text:s,parts:tokenize(s,x=>x,original).map(x=>x.word),variant:i}))
  .filter(x=>x.parts.length>0);
}
function matchSequence(words,expect,start,clitics=false){
 if(start+expect.length>words.length)return false;
 for(let j=0;j<expect.length;j++){
  if(words[start+j].word===expect[j])continue;
  if(clitics&&expect.length===1&&NONASCII.test(expect[j])&&
    PREFIXES.some(prefix=>words[start+j].word===prefix+expect[j]))continue;
  return false;
 }
 return true;
}
function allMatches(atom,entry,env){
 const out=[],original=!!env.original,normalize=env.normalize;
 if(atom.field!=='all'&&atom.field!==entry.kind&&atom.field!=='type'&&atom.field!=='kind')return out;
 if(atom.field==='type'||atom.field==='kind'){
  const expected=normalize(atom.raw),
   actual=normalize(atom.field==='type'?entry.rec.type:(entry.rec.subtype||''));
  if(atom.field==='type'?expected===actual:actual.includes(expected))
   return [{entry,start:0,end:0,kind:'metadata',term:atom.raw,score:12}];
  return out;
 }
 // Cheap, source-faithful substring check first. Most entries do not contain
 // the requested term; skip tokenization for those entirely.
 if(atom.type==='phrase'&&!normalize(entry.raw).includes(normalize(atom.raw)))return out;
 if(atom.type==='term'&&!atom.distance&&!atom.pattern){
  const candidates=equivalents(atom.raw,normalize,env.aliasProvider,original);
  if(!candidates.some(v=>normalize(entry.raw).includes(v.text)))return out;
 }
 if(atom.type==='term'&&atom.pattern){
  const prefix=atom.raw.split(/[*?\[]/u)[0];
  if(Array.from(prefix).length>=2&&!normalize(entry.raw).includes(normalize(prefix)))return out;
 }
 const words=entry.tokens(original,normalize);
 if(!words.length)return out;
 if(atom.type==='phrase'){
  const seq=tokenize(atom.raw,normalize,original).map(x=>x.word);
  for(let i=0;i<=words.length-seq.length&&out.length<12;i++){
   if(matchSequence(words,seq,i,false))
    out.push({entry,start:i,end:i+seq.length-1,kind:'phrase',term:atom.raw,score:10});
  }
  return out;
 }
 const candidates=atom.pattern||atom.distance?[{text:atom.raw,parts:[normalize(atom.raw)],variant:0}]:
  equivalents(atom.raw,normalize,env.aliasProvider,original);
 for(let i=0;i<words.length&&out.length<20;i++){
  const token=words[i].word;
  if(atom.pattern){
   // Compiled only from allowed pattern symbols, never native dynamic RegExp.
   const pattern=atom.pattern;
   if(glob(pattern,token))out.push({entry,start:i,end:i,kind:'pattern',term:token,score:6});
   continue;
  }
  if(atom.distance){
   const diff=boundedDistance(token,normalize(atom.raw),atom.distance);
   if(diff<=atom.distance)out.push({entry,start:i,end:i,kind:diff?'fuzzy':'exact',
     distance:diff,term:token,score:10-diff*3});
   continue;
  }
  for(const alternative of candidates){
   if(!matchSequence(words,alternative.parts,i,!original))continue;
   const count=alternative.parts.length,exact=alternative.variant===0&&
     words[i].word===alternative.parts[0]&&count===1;
   out.push({entry,start:i,end:i+count-1,kind:exact?'literal':'variant',
     term:words.slice(i,i+count).map(x=>x.word).join(' '),score:exact?10:7});
   break;
  }
 }
 return out;
}
function combine(a,b){
 return {ok:a.ok&&b.ok,hits:a.ok&&b.ok?[...a.hits,...b.hits].slice(0,12):[]};
}
function choose(a,b){
 if(!a.ok)return b;
 if(!b.ok)return a;
 return {ok:true,hits:[...a.hits,...b.hits].slice(0,12)};
}
function evaluate(ast,entries,opts){
 const env={normalize:opts.normalize,original:!!opts.original,aliasProvider:opts.aliasProvider};
 const leaves=new Map();
 function evalNode(node){
  switch(node.type){
   case 'term':case 'phrase':{
    if(!leaves.has(node)){
     const matches=[];
     for(const entry of entries){
      matches.push(...allMatches(node,entry,env));
      if(matches.length>=45)break;
     }
     leaves.set(node,matches);
    }
    const m=leaves.get(node);return {ok:!!m.length,hits:m.slice(0,10)};
   }
   case 'not':{
    const r=evalNode(node.child);return {ok:!r.ok,hits:[]};
   }
   case 'and':return combine(evalNode(node.left),evalNode(node.right));
   case 'or':return choose(evalNode(node.left),evalNode(node.right));
   case 'near':{
    const a=evalNode(node.left),b=evalNode(node.right);
    if(!a.ok||!b.ok)return {ok:false,hits:[]};
    let best=null;
    for(const x of a.hits){
     for(const y of b.hits){
      if(x.entry!==y.entry||x.kind==='metadata'||y.kind==='metadata')continue;
      let gap=null;
      if(x.end<y.start)gap=y.start-x.end-1;
      else if(!node.ordered&&y.end<x.start)gap=x.start-y.end-1;
      if(gap==null||gap>node.gap)continue;
      if(!best||gap<best.gap)best={gap,x,y};
     }
    }
    return best?{ok:true,hits:[best.x,best.y],gap:best.gap,ordered:node.ordered}:{ok:false,hits:[]};
   }
  }
  return {ok:false,hits:[]};
 }
 return evalNode(ast);
}
function explain(ast){
 if(!ast)return '';
 switch(ast.type){
  case 'term':{
   const scope=ast.field==='all'?'':ast.field+' field: ';
   if(ast.distance)return scope+'a word like "'+ast.raw+'" with at most '+ast.distance+' changed letter'+(ast.distance===1?'':'s');
   if(ast.pattern)return scope+'words matching the bounded spelling pattern "'+ast.raw+'"';
   return scope+'the term "'+ast.raw+'"';
  }
  case 'phrase':return (ast.field==='all'?'':ast.field+' field: ')+'the consecutive words "'+ast.raw+'"';
  case 'not':return 'excluding '+explain(ast.child);
  case 'and':return '('+explain(ast.left)+' AND '+explain(ast.right)+')';
  case 'or':return '('+explain(ast.left)+' OR '+explain(ast.right)+')';
  case 'near':return '('+explain(ast.left)+' '+(ast.ordered?'BEFORE':'NEAR')+
    ' '+explain(ast.right)+' with at most '+ast.gap+' intervening words)';
 }
 return '';
}
function safeBuilder(rows){
 const values=(rows||[]).filter(r=>String(r.text||'').trim());
 if(!values.length)return '';
 if(values.length>8)throw Error('The builder supports up to eight conditions.');
 const terms=values.map((r,i)=>{
  let text=String(r.text).trim(),kind=r.kind||'word';
  if(text.length>LIMIT.term)throw Error('Condition '+(i+1)+' exceeds the word limit.');
  if(kind==='phrase')text='"'+text.replace(/"/g,'')+'"';
  else if(kind==='prefix'){
   if(!/^[\p{L}\p{N}\p{M}ʿʾ‘’'-]+$/u.test(text.replace(/\*+$/u,''))||/\s/u.test(text))
    throw Error('Prefix conditions need one word without punctuation.');
   text=text.replace(/\*+$/u,'')+'*';
  }else if(kind==='fuzzy1'||kind==='fuzzy2'){
   text=text.replace(/~[12]$/u,'');
   if(!/^[\p{L}\p{N}\p{M}ʿʾ‘’'-]+$/u.test(text))throw Error('Fuzzy conditions need one complete word.');
   text+='~'+kind.slice(-1);
  }else if(kind==='pattern'){
   if(!/^[\p{L}\p{N}\p{M}\[\]?*]+$/u.test(text)||/\s/u.test(text))
    throw Error('Spelling patterns permit only letters, ?, *, and [letter sets].');
  }else if(kind==='word'){
   if(!/^[\p{L}\p{N}\p{M}\sʿʾ‘’'-]+$/u.test(text))
    throw Error('Ordinary word conditions cannot contain query operators. Use the main search box or Pattern mode.');
   if(/\s/u.test(text))text='"'+text+'"';
  }else throw Error('Unknown search-builder condition.');
  const field=['ar','en'].includes(r.field)?r.field+':':'';
  return {term:field+text,join:r.join};
 });
 let expr=terms[0].term;
 for(const t of terms.slice(1)){
  const join=['AND','OR','AND NOT'].includes(t.join)?t.join:'AND';
  expr='('+expr+' '+join+' '+t.term+')';
 }
 return expr;
}
global.GnammaScholarly=Object.freeze({
 parse,lex,glob,patternParts,boundedDistance,tokenize,evaluate,explain,safeBuilder,limits:LIMIT
});
})(window);
