/* English-side, passage-aligned Arabic dictionary references.
 * Uses the Arabic reader's *rendered* clickable terms, never a separate
 * English-wide guess about which glossary entries are present.
 * This layer is editorial: the English translation itself is not rewritten.
 */
(function(root){
'use strict';
if(root.GnammaBilingualLexicon)return;

const EQUIVALENTS=root.GnammaEnglishLexiconAliases||{};

function escapedRegexp(value){
 let result='';
 for(const c of String(value))result+='\\^$.*+?()[]{}|'.includes(c)?'\\'+c:c;
 return result;
}
const LEFT='(?<![\\p{L}\\p{M}])',RIGHT='(?![\\p{L}\\p{M}])';
function possibleEnglishNames(term,entry,dict){
 const forms=[...(EQUIVALENTS[term]||'').split('|'),
   ...String(term).split(/\s*\/\s*/),...(dict?.terms?.[term]?.aliasesEn||[])];
 return [...new Set(forms.map(s=>String(s||'').trim()).filter(s=>s.length>=3&&s.length<=48&&s.split(/\s+/).length<=5))];
}
function textPoint(root,offset){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
  acceptNode:node=>node.parentElement?.closest('.note-ref-symbol,[data-gn-en-added]')
   ?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT
 });
 let node,total=0;
 while((node=walker.nextNode())){
  const end=total+node.data.length;
  if(offset<=end)return {node,at:offset-total};
  total=end;
 }
 return null;
}
function makeButton(term,surface){
 const button=document.createElement('button');
 button.type='button';
 button.className='inline-term term-ar gn-en-lex-term';
 button.dataset.term=term;
 button.setAttribute('lang','ar');
 button.setAttribute('dir','rtl');
 button.title='Open the same dictionary entry: '+term;
 button.setAttribute('aria-label','Arabic '+surface+' — open dictionary entry '+term);
 button.textContent=surface;
 return button;
}
function makeParenthesis(link){
 const span=document.createElement('span');
 span.className='gn-en-lex-parenthesis';
 span.dataset.gnEnAdded='true';
 span.append(document.createTextNode(' ('),makeButton(link.term,link.surface),document.createTextNode(')'));
 return span;
}
function annotate({rendered,source,arabicMarkup,enabled,matchArabicAndEnglish,terms,dictionaries}){
 if(!enabled||!arabicMarkup||!root.document)return rendered;
 const sourceText=String(source||'');
 const arabic=document.createElement('template');arabic.innerHTML=arabicMarkup;
 const items=new Map();
 for(const button of arabic.content.querySelectorAll('.inline-term[data-term]')){
  const term=button.dataset.term,surface=(button.textContent||'').trim();
  if(term&&surface&&!items.has(term))items.set(term,{term,surface,order:items.size});
 }
 if(!items.size)return rendered;
 const template=document.createElement('template');template.innerHTML=rendered;
 const lexical=new Map((terms||[]).map(t=>[t.term,t]));
 const used=[],events=[],handled=new Set();
 const intersects=(a,b)=>used.some(x=>a<x.end&&b>x.start);
 // If the translation already supplies Arabic, make THAT printed Arabic
 // clickable. Do not duplicate it after an English synonym.
 const originalMatches=(matchArabicAndEnglish?.(sourceText)||[])
  .filter(m=>m.arabic&&items.has(m.term))
  .sort((a,b)=>a.start-b.start||b.end-a.end);
 for(const m of originalMatches){
  if(handled.has(m.term)||intersects(m.start,m.end))continue;
  events.push({kind:'wrap',start:m.start,end:m.end,link:items.get(m.term)});
  used.push({start:m.start,end:m.end});handled.add(m.term);
 }
 const choices=[];
 for(const link of items.values()){
  if(handled.has(link.term))continue;
  for(const alias of possibleEnglishNames(link.term,lexical.get(link.term),dictionaries)){
   let regex;
   try{regex=new RegExp(LEFT+escapedRegexp(alias)+RIGHT,'giu');}catch(_){continue;}
   for(const match of sourceText.matchAll(regex)){
    const start=match.index,end=start+match[0].length;
    if(intersects(start,end))continue;
    const relative=(link.order+.5)/items.size;
    const proximity=Math.abs((start+end)/2/Math.max(1,sourceText.length)-relative);
    choices.push({link,start,end,
      score:Math.min(alias.length,40)*.032-proximity+(alias.includes(' ')?0.20:0)});
   }
  }
 }
 choices.sort((a,b)=>b.score-a.score||a.start-b.start||a.link.order-b.link.order);
 for(const c of choices){
  if(handled.has(c.link.term)||intersects(c.start,c.end))continue;
  events.push({kind:'insert',start:c.end,end:c.end,link:c.link});
  used.push({start:c.start,end:c.end});handled.add(c.link.term);
 }
 // Descending source offsets keep source-note markers and original text offsets
 // stable even when a preceding text node is split by a new button.
 events.sort((a,b)=>b.start-a.start||((a.kind==='wrap')?-1:1));
 const actuallyLinked=new Set();
 for(const event of events){
  const start=textPoint(template.content,event.start);
  if(!start)continue;
  try{
   const range=document.createRange();
   range.setStart(start.node,start.at);
   if(event.kind==='wrap'){
    const end=textPoint(template.content,event.end);
    if(!end||start.node!==end.node)continue;
    range.setEnd(end.node,end.at);
    const button=makeButton(event.link.term,range.toString());
    range.surroundContents(button);
   }else{
    range.collapse(true);
    const span=makeParenthesis(event.link);
    range.insertNode(span);
    // Keep a Qurʾān source note immediately beside the text it references.
    if(span.nextSibling?.classList?.contains('quran-source-ref'))span.nextSibling.after(span);
   }
   actuallyLinked.add(event.link.term);
  }catch(_){/* Do not add an ungrounded annotation. */}
 }
 // Unresolved translations are recorded in QA, never appended as an unrelated
 // end-of-paragraph keyword list or linked to an unverified English meaning.
 return template.innerHTML;
}
root.GnammaBilingualLexicon=Object.freeze({annotate,version:'20261025-inline-only2'});
})(window);
