/* Single commentary corpus for the standalone reader and project metadata.
   Load after commentary.js, commentary-introduction-1..4.js and commentary-conclusion.js. */
(function(){
  'use strict';
  const N='https://ayatollahnekounam.com/2018/07/16/التمهید-فی-شرح-قواعد-التوحید-الطلیعه-و/';
  const L='https://traditionalhikma.com/wp-content/uploads/2015/08/Annotated-translation-from-Tamhi%CC%84d-al-Qawa%CC%84%CA%BEid-of-Ibn-Turkah-al-Is%CC%A3faha%CC%84ni%CC%84-by-Joseph-Lumbard.pdf';
  const intro=(window.GNAMMA_TAMHID_INTRO||[]).map((u,i)=>({...u,sequence:i+1,part:'introduction',kind:'sharh',matnId:null,sourceEdition:'N',sourceEditionLabel:'Nekounam edition',sourceUrl:N,sourceLocator:u.sourceLocator||('N, printed pp. '+u.pages.join('–')),ArabicSourceStatus:'medieval-authorial-text-in-online-printed-edition; modern-glosses-excluded',lumbardComparator:u.lumbardPages?{title:'Establishing the Principles',translator:'Joseph E. B. Lumbard',pages:u.lumbardPages,url:L,role:'comparison only; independent translation from Arabic'}:null}));
  const newlyTranslated=(window.GNAMMA_TAMHID_CONCLUSION||[]).map(u=>({...u,part:'conclusion',sourceEdition:'A',sourceEditionLabel:'Āshtiyānī edition',sourceLocator:'A, printed pp. '+u.pages.join('–'),ArabicSourceStatus:'online-printed-Arabic; later-editorial-footnotes-excluded'}));
  const prior=(window.GNAMMA_TAMHID_SHARH?.units||[]).filter(u=>['SH-061-A','SH-061-B'].includes(u.id)).map((u,i)=>({...u,sequence:5+i,part:'conclusion',pages:[u.page],sourceEdition:'A',sourceEditionLabel:'Āshtiyānī edition',sourceLocator:'A, printed p. '+u.page}));
  const conclusion=[...newlyTranslated,...prior].sort((a,b)=>a.sequence-b.sequence);
  const units=[...intro,...conclusion];
  const seen=new Set();
  for(const u of units){
    if(!u.id||seen.has(u.id)||!u.arabic?.trim()||!u.english?.trim())throw new Error('Invalid or duplicate commentary unit: '+u.id);
    seen.add(u.id);
  }
  window.GNAMMA_TAMHID_CORPUS={
    schema:'gnamma-tamhid-corpus-v2',updated:'2026-11-03',author:'Ṣāʾin al-Dīn ʿAlī Ibn Turka',title:'Tamhīd al-Qawāʿid',
    status:'partial-full-work-translation: introduction and concluding discussion translated; intervening commentary pending',
    coverage:{introductionUnits:intro.length,conclusionUnits:conclusion.length,totalTranslatedUnits:units.length,authorialIntroductionCompleteInConsultedOnlineSource:intro.length===40,closingCommentaryCompleteInConsultedOnlineSource:conclusion.length===6,wholeCommentaryComplete:false,fullWorkPercentage:null},
    sources:{N:{label:'Nekounam edition, Tehran, Ṣubḥ-i Fardā, 1393 SH',url:N,extent:'Online authorial opening, printed markers 19–42 and final continuation without a following visible page marker'},A:{label:'Āshtiyānī edition, digital Arabic transcription',url:'https://ablibrary.net/book_content/b/17638/466?lang=ar',extent:'Closing commentary, printed pp.270–274'},L:{label:'Lumbard, Establishing the Principles, Anthology of Philosophy in Persia IV, pp.464–479',url:L,role:'Interpretative and terminological comparator; not an Arabic witness or English copy-text'}},
    gap:{after:'SH-INTRO-040',before:'SH-061-C',description:'The intervening commentary on QT-001–QT-060 has not yet been continuously translated. The closing discussion is presented after this explicit gap, not as the next consecutive passage.'},
    translationPolicy:'Translate the complete medieval commentary from attested Arabic. Use Lumbard’s terminology where accurate; record significant departures. Do not reproduce his translation, fabricate missing Arabic, or import modern glosses into Ibn Turka’s prose.',
    units:units
  };
})();
