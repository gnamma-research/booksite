/* English-side, passage-aligned Arabic dictionary references.
 * Uses the Arabic reader's *rendered* clickable terms, never a separate
 * English-wide guess about which glossary entries are present.
 * This layer is editorial: the English translation itself is not rewritten.
 */
(function(root){
'use strict';
if(root.GnammaBilingualLexicon)return;

const EQUIVALENTS={
  "adāʾ":"performance|performing|within its time",
  "ʿadāla":"probity|uprightness|reliability",
  "ʿāmm":"general expression|general wording|general term|generality|general",
  "ʿaql":"intellect|reason",
  "ʿazīma / ʿazm":"original requirement|original obligation|unrelaxed rule",
  "aṣl":"original case|foundation|principle|source|sources|original",
  "bāṭil / buṭlān":"invalidity|invalid|void",
  "bayān":"clarification|explanation|explanatory",
  "barāʾa aṣliyya":"original freedom from liability|presumption of innocence",
  "burhān":"demonstration|demonstrative proof",
  "ḍamīr":"pronoun",
  "ḍarūrī":"necessary|necessity|indispensable",
  "ḍarūra":"necessity|necessary constraint|compulsion",
  "ḍidd":"contrary|opposite",
  "dalāla":"signification|indication|signifying",
  "dalīl":"proof|evidence|indication|argument|indicator",
  "farḍ":"obligation|obligatory|duty|obligatory requirement",
  "fasād":"invalidity|invalid|corruption|defect",
  "fiqh":"jurisprudence|juristic understanding|legal understanding|fiqh",
  "fiʿl":"act|action|performance",
  "furūʿ":"branches|particular cases|subordinate rulings",
  "ghalabat al-ẓann":"preponderance of probability|preponderant opinion|predominant probability",
  "ḥadd":"definition|limit|boundary",
  "ḥadīth":"prophetic tradition|tradition|prophetic report|hadith",
  "ḥākim":"lawgiver|one who judges|judge",
  "ḥaqīqa":"literal sense|proper meaning|literal usage|proper usage",
  "ḥarām":"forbidden|prohibited|prohibition",
  "ḥaraj":"difficulty|restriction|hardship",
  "ḥaṣr":"restriction|exclusive limitation|exclusive",
  "ḥiss":"sense perception|sensation|sense",
  "ḥujja":"argument|authoritative proof|proof|evidence",
  "ḥukm":"ruling|legal judgement|legal judgment|judgement|judgment|legal determination",
  "ḥusn / qubḥ":"goodness|badness|good|bad",
  "ʿibāda":"worship|devotional act|act of worship",
  "ibdāl / tabdīl":"substitution|substituting|replacement",
  "ibāḥa":"permission|permissibility|allowing",
  "idhn":"permission|authorization|leave",
  "ijāza":"authorization|permission to transmit|licence",
  "ijmāʿ":"consensus|agreement",
  "ijzāʾ":"sufficiency|discharge|fulfilment|fulfillment",
  "ijtihād":"independent juristic inquiry|independent legal reasoning|juristic inquiry|juristic effort|ijtihad",
  "ʿilla":"effective cause|effective ground|cause|ground|rationale",
  "ʿilm":"knowledge|science|discipline|cognition",
  "imkān":"possibility|capacity",
  "iqrār":"tacit approval|approval|acquiescence",
  "irāda":"will|volition|willing",
  "ishtirāk":"equivocation|equivocal",
  "istidlāl":"inference|inferred|reasoning|inferring",
  "istiḥsān":"juristic preference|preference|istihsan",
  "istiʿāra":"metaphor|borrowing|transfer",
  "istiṣḥāb":"presumption of continuity|continuity",
  "istiṣlāḥ":"welfare-oriented reasoning|welfare",
  "istiqrāʾ":"induction|inductive",
  "istithnāʾ":"exception|excepting",
  "jarḥ":"criticism|discrediting",
  "jins":"genus|kind|class",
  "juzʾī":"particular|individual case",
  "kalām":"theology|speech|kalam",
  "karāha":"dislike|disapproval",
  "kasb / iktisāb":"acquisition|acquired",
  "khabar":"report|reports|reported|transmitted account",
  "khabar al-wāḥid":"solitary report|single report",
  "khāṣṣ":"specific expression|particular expression|specific|restricted",
  "khaṭaʾ":"error|mistake|erroneous",
  "khiṭāb":"address|discourse|communication",
  "kināya":"indirect expression|allusion",
  "kullī":"universal|universality",
  "lafẓ":"wording|expression|word|verbal expression|verbal form",
  "mafhūm":"understood meaning|understood import|implication|meaning understood",
  "maḥkūm fīhi":"act addressed|matter judged|act in question",
  "maḥkūm ʿalayhi":"person addressed|addressee|person subject",
  "majāz":"figurative usage|metaphor|figurative",
  "makrūh":"disapproved|disliked|reprehensible",
  "maʿlūl":"effect|that which is explained",
  "maʿnā":"meaning|intelligible content|sense|relevant meaning|underlying meaning",
  "mandūb":"recommended|recommendation",
  "manṭūq":"explicitly expressed|expressed wording",
  "maqṣūd":"intended|intended meaning|purpose",
  "maʿqūl":"intelligible meaning|intelligible|rationally apprehended",
  "maṣlaḥa":"benefit|welfare|interest",
  "mashhūrāt":"widely accepted propositions|accepted opinions",
  "mithāl":"example|illustrative case|instance",
  "muʾawwal":"interpreted wording|interpreted",
  "mubāḥ":"permitted|permission|allowed",
  "mudrak":"source of knowledge|means of apprehension|means of knowing",
  "mujmal":"indeterminate wording|indeterminate|ambiguous|unclear",
  "mujtahid":"qualified jurist|jurist|legal reasoner|independent jurist|mujtahid",
  "mukallaf":"legally responsible person|responsible agent|person obligated|subject to legal responsibility",
  "mukhayyil":"plausible ground|plausible",
  "mulāʾim":"congruent|fitting|appropriate",
  "munāsib":"suitable|suitability|appropriate",
  "munāwala":"handing over|delivery of a writing",
  "muqaddima":"premise|introduction|introductory",
  "muqayyad":"qualified expression|qualified|restricted",
  "mursal":"disconnected report|mursal report",
  "musnad":"connected report|musnad",
  "mutawātir":"mass-transmitted|multiply transmitted|mutawatir",
  "muṭlaq":"unqualified expression|unqualified|absolute",
  "nadb":"recommendation|recommended|commendation",
  "nahy":"prohibition|prohibitive|forbidding",
  "naql":"transmission|transmitted|transfer|transferring",
  "naṣṣ":"unambiguous indication|unambiguous text|unambiguous|express text|explicit text|text",
  "naskh":"abrogation|abrogated|abrogating",
  "naẓar":"inquiry|investigation|examination|reflective consideration|consideration|investigating",
  "niyya":"intention|intent",
  "qaḍāʾ":"make-up performance|making up|perform outside its time",
  "qaṭʿī":"conclusive|certain|definitive",
  "qarīna":"contextual indication|contextual clue|context|circumstantial indication|circumstance",
  "qiyās":"analogy|analogies|analogical reasoning|syllogism|syllogistic",
  "qiyās al-shabah":"analogy of resemblance|resemblance analogy",
  "qurʾ":"menstrual period|purity period",
  "rāwī":"narrator|transmitter",
  "rukhṣa":"concession|relaxation",
  "sabab":"cause|occasion|ground|reason",
  "sabr wa-taqsīm":"testing and division|examination and division",
  "ṣaḥīḥ / ṣiḥḥa":"validity|valid|soundness|sound",
  "ṣalāḥ":"welfare|fitness|right ordering",
  "ṣīgha":"verbal form|formulation|word form|formula|form|forms",
  "ṣināʿa":"craft|disciplined art|discipline|art",
  "sharʿ":"revealed law|divine law|the law|revelation|law",
  "sharṭ":"condition|requirement|qualification",
  "shubha":"uncertainty|apparent likeness|doubt|semblance",
  "sibār":"method of examination|instrument of examination|examination method",
  "sunna":"sunna|sunnah|prophetic practice|prophetic teaching",
  "taʿāruḍ":"conflict of evidence|opposition|conflict",
  "taʿdīl":"attestation of probity|attestation|accreditation",
  "taklīf":"legal responsibility|imposition of duty|legal obligation",
  "takhṣīṣ":"specification|specifying|restriction",
  "tamthīl":"exemplification|example|comparison",
  "tanbīh":"indication|drawing attention|alerting",
  "taqlīd":"following authority|imitation|following another|reliance",
  "tarjīḥ":"preference|preferring|weighing|giving greater weight",
  "taṣdīq":"assent|affirmation|belief",
  "taṣwīb":"declaring correct|correctness|being correct",
  "taʾthīm":"attributing sin|sinfulness|blame",
  "taʾwīl":"interpretation|interpreting|figurative interpretation",
  "tawaqquf":"suspension of judgement|suspension|withholding judgment",
  "tawātur":"mass transmission|mass-transmission|multiple transmission",
  "tawqīf":"revealed instruction|withholding judgement",
  "ʿumūm":"generality|general scope|inclusion",
  "ʿumūm al-balwā":"widespread practical need|common need",
  "ʿurf":"established usage|convention|custom|usage",
  "uṣūl al-fiqh":"principles of jurisprudence|legal theory|usul al-fiqh|legal methodology",
  "wājib":"obligatory|obligation|required|duty",
  "waḍʿ":"assignment|institution|stipulation",
  "yaqīn":"certainty|certain",
  "ẓāhir":"apparent meaning|apparent|prima facie|manifest",
  "ẓann":"probable judgement|probability|probable|conjecture|opinion",
  "ziyāda":"addition|additional|added",
  "ṭaliba":"request|petition",
  "qānūn / qawānīn":"rules of inquiry|rule|canon|standard|law",
  "manṭiq":"logic|logical discipline"
};

function escapedRegexp(value){
 let result='';
 for(const c of String(value))result+='\\^$.*+?()[]{}|'.includes(c)?'\\'+c:c;
 return result;
}
const LEFT='(?<![\\p{L}\\p{M}])',RIGHT='(?![\\p{L}\\p{M}])';
function possibleEnglishNames(term,entry,dict){
 const forms=[...(EQUIVALENTS[term]||'').split('|'),
   ...String(term).split(/\s*\/\s*/),...(dict?.terms?.[term]?.aliasesEn||[])];
 // The first lexical gloss is often a translation equivalent. Do not use
 // long or explanatory clauses as if they were translations.
 const first=String(entry?.definition||'').split(/[:;.]/)[0];
 if(first.length<=88){
  forms.push(...first.split(/\s*,\s*|\s+or\s+|\s*\/\s*/).map(s=>s.replace(/^(?:a|an|the|or)\s+/i,'').trim()));
 }
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
  }catch(_){/* The unresolved term is retained in the visible tail below. */}
 }
 const remaining=[...items.values()].filter(link=>!actuallyLinked.has(link.term));
 if(remaining.length){
  const tail=document.createElement('span');tail.className='gn-en-lex-tail';
  tail.dataset.gnEnAdded='true';
  const label=document.createElement('span');label.className='gn-en-lex-tail-label';
  label.textContent='Arabic terms in this passage: ';
  tail.append(' ',label);
  remaining.forEach((link,i)=>{
   if(i)tail.append(' · ');
   tail.append('(',makeButton(link.term,link.surface),')');
  });
  template.content.append(tail);
 }
 return template.innerHTML;
}
root.GnammaBilingualLexicon=Object.freeze({annotate,version:'20261025-passages-1'});
})(window);
