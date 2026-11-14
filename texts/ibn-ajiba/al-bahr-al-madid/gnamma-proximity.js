/* Positional Gnamma search engine.
   A distance of N means at most N *intervening words*, not N characters.
   Words never cross a record field, language, or paragraph boundary. */
(function(global){
'use strict';
const WORDS=/[\p{L}\p{N}]+/gu;
const PREFIXES=['ال','وال','فال','بال','كال','لل','و','ف','ب','ل','ك'];
function wordTokens(str,normalize){
 const folded=normalize(String(str||''));
 return [...folded.matchAll(WORDS)].map(x=>({
  word:x[0], start:x.index, end:x.index+x[0].length
 }));
}
function makeVariants(values,normalize){
 const seen=new Set(),out=[];
 for(const variant of values||[]){
  const parts=wordTokens(variant,normalize).map(x=>x.word);
  if(!parts.length)continue;
  const key=parts.join('\u001f');if(seen.has(key))continue;seen.add(key);
  out.push(parts);
 }
 return out;
}
function equivalentToken(actual,expected){
 if(actual===expected)return true;
 if(!/[\u0600-\u06ff]/.test(expected)||expected.length<2)return false;
 return PREFIXES.some(prefix=>actual===prefix+expected);
}
function occurrences(tokens,patterns){
 const result=[];
 for(let i=0;i<tokens.length;i++){
  for(let j=0;j<patterns.length;j++){
   const words=patterns[j],end=i+words.length;
   if(end>tokens.length)continue;
   if(!words.every((w,offset)=>equivalentToken(tokens[i+offset].word,w)))continue;
   result.push({
    start:i,end:end-1,offsetStart:tokens[i].start,offsetEnd:tokens[end-1].end,
    matched:tokens.slice(i,end).map(x=>x.word).join(' '),
    variant:j
   });
  }
 }
 return result;
}
function distance(a,b,ordered){
 if(a.end<b.start)return b.start-a.end-1;
 if(ordered||b.end>=a.start)return null;
 return a.start-b.end-1;
}
function find(raw,leftAlternatives,rightAlternatives,opts){
 const options=opts||{};
 const norm=options.normalize;
 if(typeof norm!=='function')throw Error('Proximity search requires a normalizer');
 const words=wordTokens(raw,norm);
 if(words.length<2)return null;
 const left=occurrences(words,makeVariants(leftAlternatives,norm));
 if(!left.length)return null;
 const right=occurrences(words,makeVariants(rightAlternatives,norm));
 if(!right.length)return null;
 const max=Math.max(0,Math.min(50,Math.trunc(Number(options.maxGap)||0)));
 const ordered=!!options.ordered;
 let best=null;
 for(const a of left){
  for(const b of right){
   const gap=distance(a,b,ordered);
   if(gap==null||gap>max)continue;
   // A smaller distance is preferable; when equal, prefer literal forms.
   const rating=gap*100+a.variant*4+b.variant*4;
   if(!best||rating<best.rating){
    best={a,b,gap,rating,ordered,first:a.start<=b.start?'a':'b',
     wordCount:words.length};
   }
  }
 }
 return best;
}
global.GnammaProximity=Object.freeze({find,tokenize:wordTokens,makeVariants});
})(window);
