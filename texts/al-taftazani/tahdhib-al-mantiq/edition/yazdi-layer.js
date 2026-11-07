/* Source-checked translated selections from Mullā ʿAbd Allāh al-Yazdī.
   No invented continuation: panels exist only at units with translated Arabic.
   Source archive and translation layer are separate from Taftāzānī's matn. */
(function(){
'use strict';
const data=window.GNAMMA_YAZDI_LAYER,reader=window.GnammaTahdhibReader,ex=window.GnammaTahdhibExperience;
if(!data||!reader||!ex||!reader.isDivision)return;
const KEY='gnamma-tahdhib-yazdi-v1';
const state={enabled:false};
try{state.enabled=localStorage.getItem(KEY)==='on'}catch{}
const groups=new Map();
for(const part of data.entries){if(!groups.has(part.unit))groups.set(part.unit,[]);groups.get(part.unit).push(part)}
const idFor=id=>'u-'+id.replace(/[^a-zA-Z0-9-]/g,'-');
function n(tag,cls,value){const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e}
function make(unit,scope){
 const entries=groups.get(unit)||[];
 const contiguous=unit==='L.03'?window.GNAMMA_YAZDI_CONTIGUOUS_L03:null;
 const allOtherContinuous=[
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q7_13?.blocks||[]).map(x=>({...x,unit:'L.01'})),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q14_19?.blocks||[]).map(x=>({...x,unit:'L.02'})),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_UNIVERSALS?.blocks||[]),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_L07?.sourceBlocks||[]),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q48_51?.blocks||[]),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q54_58?.sourceBlocks||[]),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q59_64?.blocks||[]),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q65_69?.blocks||[]),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q70_73?.blocks||[]),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q74_80?.blocks||[]),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q81_84?.blocks||[]),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q86_94?.blocks||[]),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q95_97?.blocks||[]),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q98_101?.blocks||[]),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q102_104?.blocks||[]),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q105_108?.blocks||[]),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q110_113?.blocks||[]),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q114_118?.blocks||[]),
  ...(window.GNAMMA_YAZDI_CONTIGUOUS_Q119_123?.blocks||[])
 ];
 const newContiguous=allOtherContinuous.filter(block=>block.unit===unit);
 const box=n('section','gn-yazdi-layer');box.dataset.yazdiUnit=unit;box.setAttribute('aria-label','Mullā al-Yazdī commentary for '+unit);
 const head=n('header','gn-yazdi-head');head.append(n('h3',null,'Mullā al-Yazdī · Commentary'),n('small',null,contiguous?'Qum pp.22–29 · continuous searchable main text; scan pending':newContiguous.length?'Qum pp.'+newContiguous[0].page+'–'+newContiguous.at(-1).page+' · '+newContiguous.length+' consecutive main-text segments; scan pending':entries.length+' translated passages'));box.append(head);
 if(contiguous){
  box.dataset.contiguousUnit=unit;
  const caveat=n('p','gn-yazdi-main-caveat','Full main ḥāshiya reading from the searchable Qum text, pp.22–29, not a diplomatic or manuscript-collated edition. Editorial English page seams preserve source boundaries; separately printed هامش is excluded.');
  box.append(caveat);
  for(const part of contiguous.sourcePages){
   const item=n('article','gn-yazdi-excerpt gn-yazdi-contiguous-page');
   item.dataset.yazdiId=part.id;item.dataset.qPage=part.page;
   item.id='gn-yazdi-'+scope+'-'+part.id;
   item.append(n('div','gn-yazdi-locator','al-Yazdī · Qum p. '+part.page+' · '+part.title));
   const content=n('div','gn-yazdi-pair');
   const en=n('p','gn-yazdi-en',part.en);en.lang='en';
   const ar=n('p','gn-yazdi-ar',part.ar);ar.lang='ar';ar.dir='rtl';
   content.append(en,ar);item.append(content);
   const source=n('a','gn-yazdi-source','Source Q · p. '+part.page);
   source.href=part.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';item.append(source);
   if(part.flags?.includes('textual-crux-Q24')){
    const issue=n('details','gn-yazdi-variant gn-yazdi-critical-crux');
    issue.append(n('summary',null,'Textual problem · Q p.24 · implication without inclusion'));
    issue.append(n('p','gn-yazdi-variant-note','The Qum searchable text reads «ولا لازم ذهني» although implication requires a concomitant. Two other searchable printed main-text versions give «له لازم». The base has NOT been silently emended.'));
    if(part.comparisons?.length){
     const readings=n('div','gn-yazdi-variant-readings');
     for(const v of part.comparisons){
      const row=n('div','gn-yazdi-variant-row'),who=n('strong',null,v.siglum);
      const t=n('p',null,v.reading);t.lang='ar';t.dir='rtl';row.append(who,t);
      const a=n('a','gn-yazdi-source','Check source');a.href=v.sourceUrl;a.target='_blank';a.rel='noopener noreferrer';row.append(a);
      readings.append(row);
     }
     issue.append(readings);
    }
    issue.append(n('p','gn-yazdi-variant-status','Digital printed-text comparison only. The 2013 Gujarat and Karachi source photographs and independent manuscript readings remain unverified. Other printed marginal voices are not attributed to al-Yazdī.'));
    item.append(issue);
   }
   if(part.notes?.length){
    const note=n('details','gn-yazdi-source-notes');note.append(n('summary',null,'Textual and translation notes'));
    for(const t of part.notes)note.append(n('p',null,t));item.append(note);
   }
   box.append(item);
  }
  const editorial=n('p','gn-yazdi-main-caveat','Previously translated selected L.03 quotations remain in the source register but are not repeated here. Page-seam boundaries in this reading correspond to Qum printed pages, not to authorial paragraph headings.');
  box.append(editorial);
  return box;
 }
 if(newContiguous.length){
  box.dataset.contiguousUnit=unit;
  box.dataset.contiguousWitness='Qum searchable pp.'+newContiguous[0].page+'–'+newContiguous.at(-1).page;
  const interval=newContiguous[0].page+'–'+newContiguous.at(-1).page;
  const note=unit==='L.01'?'Q7–13 is the principal preface, excluding independently attributed marginal notes.':
    unit==='L.02'?'Q14–19 covers conception, assent and the formal subject of logic; Q20 lacks main text and Q21 is a heading only.':
    unit==='L.07'?'Qum page 38 is printed marginalia, excluded from al-Yazdī’s main text.':
    unit==='L.08'||unit==='L.09'?'Qum p.52 is blank and p.53 is a matn heading only; neither contains translated sharḥ.':
    unit==='L.10'?'Qum p.55 has only a short main-text continuation; its longer هامش is another writer’s commentary. The explanation continues onto p.59.':
    unit==='L.11'?'This section distinguishes necessary, permanent, general possible and composite modalities. The final Q64 sentence crosses the L11/L12 printed boundary. Other authors’ هامش notes are excluded.':
    unit==='L.12'?'Q65 begins by closing the preceding modal argument, then distinguishes connected and disjunctive conditionals. Q69 completes this main-source section; the separate هامش is excluded.':
    unit==='L.13'?'Q70–73 defines contradiction and works through compound modal opposites with correct quantifier scope. The Q73 page is only a short continuation.':
    unit==='L.14'?'Q74–80 covers simple conversion, reductio, the Farabian/Avicennan readings of possible subjects, and al-Yazdī’s reservation. Printed هامش by later commentators is excluded.':
    unit==='L.15'?'Q81–84 contrasts earlier and later contraposition and completes two witness proofs. Q85 is a matn heading for syllogism, not al-Yazdī’s commentary.':
    unit==='L.16'?'Q86–101 now gives a consecutive reading of categorical syllogistic figures; p85 was a heading, and archived Q86/Q98 snippets are not duplicated. Main source runs through the modal incompatibility proof at p101.':
    unit==='L.17'?'Q102–104 covers conditional conjunction, exceptive inference and reductio. Printed p103 crosses an editorial topic break and has two nonoverlapping source blocks.':
    unit==='L.18'?'Q105–108 and Q110–113 cover induction, analogy and the five logical arts; printed p109 has only the next authorial heading. Main text resumes at p110.':
    unit==='L.19'?'Q114–123 concludes the main ḥāshiya with the parts and methods of the sciences. The p123 printed completion notice is separately attributed, never presented as the commentator’s own prose.':
    'Printed pages 31 and 35 are split at the editorial subject boundary, without repeating words.';
  box.append(n('p','gn-yazdi-main-caveat','Consecutive Arabic–English main ḥāshiya, Qum printed pp.'+interval+'. '+note+' Normalized searchable text, not yet photographically or manuscript-collated.'));
  for(const part of newContiguous){
   const item=n('article','gn-yazdi-excerpt gn-yazdi-contiguous-page');
   item.id='gn-yazdi-'+scope+'-'+part.id;
   item.dataset.yazdiId=part.id;item.dataset.qPage=part.page;item.dataset.qPart=part.part||'all';
   const withinPage=part.part&&part.part!=='all'?' · '+part.part:'';
   item.append(n('div','gn-yazdi-locator','al-Yazdī · Qum p. '+part.page+withinPage+' · '+part.title));
   const pair=n('div','gn-yazdi-pair');
   const en=n('p','gn-yazdi-en',part.en);en.lang='en';
   const ar=n('p','gn-yazdi-ar',part.ar);ar.lang='ar';ar.dir='rtl';
   pair.append(en,ar);item.append(pair);
   const link=n('a','gn-yazdi-source','Source Q · p. '+part.page);
   link.href=part.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';item.append(link);
   if(part.notes?.length){
    const detail=n('details','gn-yazdi-source-notes');
    detail.append(n('summary',null,'Text and translation notes'));
    for(const note of part.notes)detail.append(n('p',null,note));
    item.append(detail);
   }
   if(part.seam==='p37-later-continuation-unverified'){
    const issue=n('details','gn-yazdi-variant gn-yazdi-critical-crux');
    issue.append(n('summary',null,'Unresolved printed-page boundary · Qum p.37'));
    issue.append(n('p','gn-yazdi-variant-note','The searchable page places a possible continuation after the header هامش. The present text stops before the uncertain boundary. Photographic comparison is required before attributing that continuation to al-Yazdī.'));
    item.append(issue);
   }
   box.append(item);
  }
  if(unit==='L.19'&&window.GNAMMA_YAZDI_CONTIGUOUS_Q119_123?.colophon){
   const c=window.GNAMMA_YAZDI_CONTIGUOUS_Q119_123.colophon;
   const note=n('details','gn-yazdi-source-notes gn-yazdi-colophon');
   note.append(n('summary',null,'Printed completion notice · not by al-Yazdī'));
   const ar=n('p','gn-yazdi-ar',c.text);ar.lang='ar';ar.dir='rtl';
   const en=n('p','gn-yazdi-en',c.english);en.lang='en';
   note.append(ar,en,n('p','gn-yazdi-main-caveat',c.attribution));
   const link=n('a','gn-yazdi-source','Qum printed source · p.123');
   link.href=c.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';note.append(link);
   box.append(note);
  }
  // Retain archived excerpt cards ONLY where no source-page text is present:
  // in the now contiguous 86–123 stretch, earlier selections are all subsumed.
  const laterArchive=entries.filter(p=>!newContiguous.some(x=>x.page===p.page));
  if(laterArchive.length){
   const remainder=n('div','gn-yazdi-archive-remainder');
   remainder.append(n('p','gn-yazdi-main-caveat','Additional previously translated source excerpts not covered by a full page transcription. They are marked as selections, not a continuous source text.'));
   for(const part of laterArchive){
    const item=n('article','gn-yazdi-excerpt gn-yazdi-selected');
    item.id='gn-yazdi-'+scope+'-'+part.id.replace(/[^a-zA-Z0-9-]/g,'-');item.dataset.yazdiId=part.id;
    item.append(n('div','gn-yazdi-locator','al-Yazdī · Qum p. '+part.page+' · '+part.title+' · selected excerpt'));
    const pair=n('div','gn-yazdi-pair');
    const en=n('p','gn-yazdi-en',part.english);en.lang='en';
    const ar=n('p','gn-yazdi-ar',part.arabic);ar.lang='ar';ar.dir='rtl';
    pair.append(en,ar);item.append(pair);
    const link=n('a','gn-yazdi-source','Arabic source · p. '+part.page);
    link.href=part.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';item.append(link);
    remainder.append(item);
   }
   box.append(remainder);
  }
  box.append(n('p','gn-yazdi-main-caveat',newContiguous.length+' consecutive source blocks displayed instead of overlapping selected excerpts. Previously translated selections remain in the 177-item archival register for provenance. This text is a first-pass translation of the searchable principal ḥāshiya; photographic and independent manuscript collation remain outstanding.'));
  return box;
 }
 for(const part of entries){
  const item=n('article','gn-yazdi-excerpt');item.dataset.yazdiId=part.id;
  item.id='gn-yazdi-'+scope+'-'+part.id.replace(/[^a-zA-Z0-9-]/g,'-');
  const eyebrow=n('div','gn-yazdi-locator','al-Yazdī · p. '+part.page+' · '+part.title);
  const content=n('div','gn-yazdi-pair');
  const en=n('p','gn-yazdi-en',part.english);en.lang='en';
  const ar=n('p','gn-yazdi-ar',part.arabic);ar.lang='ar';ar.dir='rtl';
  content.append(en,ar);
  item.append(eyebrow,content);
  const source=n('a','gn-yazdi-source','Arabic source · p. '+part.page);source.href=part.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';
  item.append(source);
  if(part.secondPrint?.sourceUrl){
   const print=n('a','gn-yazdi-source gn-yazdi-second-print','I13 · printed p. '+part.secondPrint.printedPage);
   print.href=part.secondPrint.sourceUrl;print.target='_blank';print.rel='noopener noreferrer';
   print.title='Gujarat 1434/2013 print (main commentary), compared digitally; photographic verification pending';
   item.append(print);
  }
  if(part.witnessComparison){
   const v=part.witnessComparison;
   const details=n('details','gn-yazdi-variant');
   const summary=n('summary',null,'Printed comparison · Q / I13 p. '+v.printedPage+(v.status==='candidate-variant'?' · reading differs':' · agreement'));
   details.append(summary);
   const table=n('div','gn-yazdi-variant-readings');
   for(const [siglum,value] of [['Q · Qum',v.qReading],['I13 · Gujarat',v.iReading]]){
    const line=n('div','gn-yazdi-variant-row'),lab=n('strong',null,siglum),arabic=n('p',null,value);
    arabic.lang='ar';arabic.dir='rtl';line.append(lab,arabic);table.append(line);
   }
   details.append(table,n('p','gn-yazdi-variant-note',v.note));
   details.append(n('p','gn-yazdi-variant-status','Comparison of digital printed transcriptions only; neither an independently collated manuscript variant nor proof of authorial priority.'));
   const iLink=n('a','gn-yazdi-source','Open the I13 printed text');
   iLink.href=v.sourceUrl;iLink.target='_blank';iLink.rel='noopener noreferrer';details.append(iLink);
   item.append(details);
  }
  box.append(item)
 }
 return box
}
function mountFlow(){
 const root=document.getElementById('flow-passages');if(!root)return;
 for(const unit of groups.keys()){
  const span=document.getElementById('flow-'+idFor(unit));
  const sec=span?.closest('.gn-flow-section');
  if(!sec||sec.nextElementSibling?.dataset?.yazdiUnit===unit)continue;
  sec.insertAdjacentElement('afterend',make(unit,'flow'))
 }
}
function mountStudy(){
 for(const unit of groups.keys()){
  const article=document.getElementById(idFor(unit));
  if(article&&!article.querySelector('.gn-yazdi-layer'))article.append(make(unit,'study'))
 }
}
function mount(){mountFlow();mountStudy();document.body.dataset.yazdi=state.enabled?'on':'off'}
function enabled(){return state.enabled}
function setEnabled(v){
 state.enabled=Boolean(v);try{localStorage.setItem(KEY,state.enabled?'on':'off')}catch{}
 mount();document.dispatchEvent(new CustomEvent('gnamma-tahdhib-yazdi',{detail:{enabled:state.enabled}}));return state.enabled
}
function goTo(id){
 const preface=window.GNAMMA_YAZDI_CONTIGUOUS_Q7_13;
 const introduction=window.GNAMMA_YAZDI_CONTIGUOUS_Q14_19;
 const continuous=window.GNAMMA_YAZDI_CONTIGUOUS_L03;
 const wider=window.GNAMMA_YAZDI_CONTIGUOUS_UNIVERSALS;
 const newer=window.GNAMMA_YAZDI_CONTIGUOUS_L07;
 const concept=window.GNAMMA_YAZDI_CONTIGUOUS_Q48_51;
 const propositions=window.GNAMMA_YAZDI_CONTIGUOUS_Q54_58;
 const modal=window.GNAMMA_YAZDI_CONTIGUOUS_Q59_64;
 const conditional=window.GNAMMA_YAZDI_CONTIGUOUS_Q65_69;
 const contradiction=window.GNAMMA_YAZDI_CONTIGUOUS_Q70_73;
 const conversion=window.GNAMMA_YAZDI_CONTIGUOUS_Q74_80;
 const contraposition=window.GNAMMA_YAZDI_CONTIGUOUS_Q81_84;
 const syllogism=window.GNAMMA_YAZDI_CONTIGUOUS_Q86_94;
 const thirdFourth=window.GNAMMA_YAZDI_CONTIGUOUS_Q95_97;
 const figureGeneral=window.GNAMMA_YAZDI_CONTIGUOUS_Q98_101;
 const conditionalInfer=window.GNAMMA_YAZDI_CONTIGUOUS_Q102_104;
 const analogy=window.GNAMMA_YAZDI_CONTIGUOUS_Q105_108;
 const fiveArts=window.GNAMMA_YAZDI_CONTIGUOUS_Q110_113;
 const scienceParts=window.GNAMMA_YAZDI_CONTIGUOUS_Q114_118;
 const scienceFinal=window.GNAMMA_YAZDI_CONTIGUOUS_Q119_123;
 const all=[...(preface?.blocks||[]).map(x=>({...x,unit:'L.01'})),...(introduction?.blocks||[]).map(x=>({...x,unit:'L.02'})),...(wider?.blocks||[]),...(newer?.sourceBlocks||[]),...(concept?.blocks||[]),...(propositions?.sourceBlocks||[]),...(modal?.blocks||[]),...(conditional?.blocks||[]),...(contradiction?.blocks||[]),...(conversion?.blocks||[]),...(contraposition?.blocks||[]),...(syllogism?.blocks||[]),...(thirdFourth?.blocks||[]),...(figureGeneral?.blocks||[]),...(conditionalInfer?.blocks||[]),...(analogy?.blocks||[]),...(fiveArts?.blocks||[]),...(scienceParts?.blocks||[]),...(scienceFinal?.blocks||[])];
 const part=data.entries.find(e=>e.id===id)||(continuous?.sourcePages.find(e=>e.id===id)??null)||all.find(e=>e.id===id)||null;
 if(!part)return false;
 setEnabled(true);ex.setMode('flow');
 reader.go(Number((part.unit||'L.03').slice(2)),'u-'+(part.unit||'L.03').replace(/[^a-zA-Z0-9-]/g,'-'));
 const scroll=()=>{
  let targetId=part.id.replace(/[^a-zA-Z0-9-]/g,'-');
  if(part.unit==='L.03'||part.id.startsWith('YZC-'))targetId='YZC-'+part.page;
  else if(['L.01','L.02','L.04','L.05','L.06','L.07','L.08','L.09','L.10','L.11','L.12','L.13','L.14','L.15','L.16','L.17','L.18','L.19'].includes(part.unit||'')){
   // An archival excerpt ID navigates to its source page when that excerpt has been
   // subsumed by a continuous passage. Nothing is silently retranslated twice.
   const target=all.find(b=>b.unit===part.unit&&b.page===part.page);
   if(target)targetId=target.id;
  }
  const target=document.getElementById('gn-yazdi-flow-'+targetId);
  target?.scrollIntoView({block:'center',behavior:'smooth'});
 };
 requestAnimationFrame(()=>requestAnimationFrame(scroll));
 return true;
}
document.addEventListener('gnamma-tahdhib-flow-built',mountFlow);
document.addEventListener('gnamma-tahdhib-render',mount); // Render has already replaced source cards; mount now to avoid a WebKit frame race.
document.addEventListener('gnamma-tahdhib-view',mount);
mount();
window.GnammaYazdiLayer=Object.freeze({enabled,setEnabled,mount,goTo,entryCount:data.entries.length,prefacePages:window.GNAMMA_YAZDI_CONTIGUOUS_Q7_13?.blocks.length||0,logicIntroPages:window.GNAMMA_YAZDI_CONTIGUOUS_Q14_19?.blocks.length||0,continuousPages:window.GNAMMA_YAZDI_CONTIGUOUS_L03?.sourcePages.length||0,additionalContinuousPages:[...new Set(window.GNAMMA_YAZDI_CONTIGUOUS_UNIVERSALS?.blocks.map(b=>b.page)||[])].length,additionalContinuousBlocks:window.GNAMMA_YAZDI_CONTIGUOUS_UNIVERSALS?.blocks.length||0,speciesContinuousPages:window.GNAMMA_YAZDI_CONTIGUOUS_L07?.sourceBlocks.length||0,logicalUniversalPages:window.GNAMMA_YAZDI_CONTIGUOUS_Q48_51?.blocks.filter(x=>x.unit==='L.08').length||0,definitionPages:window.GNAMMA_YAZDI_CONTIGUOUS_Q48_51?.blocks.filter(x=>x.unit==='L.09').length||0,propositionPages:window.GNAMMA_YAZDI_CONTIGUOUS_Q54_58?.sourceBlocks.length||0,modalPages:window.GNAMMA_YAZDI_CONTIGUOUS_Q59_64?.blocks.length||0,conditionalPages:window.GNAMMA_YAZDI_CONTIGUOUS_Q65_69?.blocks.length||0,contradictionPages:window.GNAMMA_YAZDI_CONTIGUOUS_Q70_73?.blocks.length||0,conversionPages:window.GNAMMA_YAZDI_CONTIGUOUS_Q74_80?.blocks.length||0,contrapositionPages:window.GNAMMA_YAZDI_CONTIGUOUS_Q81_84?.blocks.length||0,syllogismPages:window.GNAMMA_YAZDI_CONTIGUOUS_Q86_94?.blocks.length||0,syllogismContinuationPages:(window.GNAMMA_YAZDI_CONTIGUOUS_Q95_97?.blocks.length||0)+(window.GNAMMA_YAZDI_CONTIGUOUS_Q98_101?.blocks.length||0),conditionalInferenceBlocks:window.GNAMMA_YAZDI_CONTIGUOUS_Q102_104?.blocks.length||0,inductionAndArtsPages:(window.GNAMMA_YAZDI_CONTIGUOUS_Q105_108?.blocks.length||0)+(window.GNAMMA_YAZDI_CONTIGUOUS_Q110_113?.blocks.length||0),scienceFinalPages:(window.GNAMMA_YAZDI_CONTIGUOUS_Q114_118?.blocks.length||0)+(window.GNAMMA_YAZDI_CONTIGUOUS_Q119_123?.blocks.length||0),units:[...groups.keys()],complete:false});
})();