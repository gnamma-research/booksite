/* Historical lexicon comparator, reusing the verified al-Jurjānī articles in the
   Darūrī dictionary. The source is marked as a comparison, not silently treated
   as Ibn Turka's own definition. Loaded only when a relevant term is opened. */
(function(){
'use strict';
const PAIRS={
 intellect:'ʿaql',
 'divine-knowledge':'ʿilm',
 demonstration:'dalīl',
 causality:'ʿilla',
 'essential-accident':'ḥaqīqa',
 'science-subject':'ʿilm',
 'first-principles':'dalīl',
 'conception':'ḥadd',
 'mental-existence':'ʿilm'
};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ROOT='../../../daruri/full-dictionary-data.js';
let pending;
function load(){
 if(window.GnammaFullDictionaryData)return Promise.resolve(window.GnammaFullDictionaryData);
 if(pending)return pending;
 pending=new Promise((res,rej)=>{
  const s=document.createElement('script');s.src=ROOT;s.async=true;
  s.onload=()=>window.GnammaFullDictionaryData?res(window.GnammaFullDictionaryData):rej(Error('No historical lexicon data'));
  s.onerror=()=>rej(Error('The historical dictionary could not be loaded.'));
  document.head.appendChild(s);
 }).catch(e=>{pending=null;throw e});
 return pending;
}
async function attach(id){
 const term=PAIRS[id];if(!term)return;
 const box=document.querySelector('#gn-study-content');if(!box)return;
 const slot=document.createElement('section');slot.className='gn-historical-source';slot.dataset.historicalId=id;
 slot.innerHTML='<h3>Historical dictionary</h3><p>Opening al-Jurjānī’s terminology…</p>';
 box.appendChild(slot);
 try{
  const db=await load();
  if(!slot.isConnected||!document.querySelector('#gn-study-dialog')?.open)return;
  const x=db.terms.find(t=>t.term===term),related=x?.articles||[];
  const a=related.map(rel=>db.articles.find(z=>z.id===rel.id)).filter(z=>z&&z.source==='J');
  if(!a.length){slot.remove();return;}
  slot.innerHTML='<h3>Historical lexicon · al-Jurjānī</h3><p class="gn-help">Comparative definitions from <em>Kitāb al-Taʿrīfāt</em>. The same word may have a legal, logical or metaphysical use; the quotation does not automatically determine Ibn Turka’s meaning.</p>'+a.map(y=>
   '<div class="gn-historical-entry"><strong lang="ar" dir="rtl">'+esc(y.headword)+'</strong><small>'+esc(y.pages||'Historical entry')+'</small>'+
   (y.paragraphs||[]).map(p=>'<blockquote class="gn-source-ar" lang="ar" dir="rtl">'+esc(p.ar)+'</blockquote><p>'+esc(p.en)+'</p>').join('')+
   '<a target="_blank" rel="noopener noreferrer" href="'+esc(y.url||'https://shamela.ws/book/7312')+'">Historical Arabic dictionary source</a></div>').join('');
 }catch{slot.innerHTML='<h3>Historical dictionary</h3><p class="gn-help">This historical source is unavailable here. The contextual definition above remains usable.</p><a href="../../../daruri/dictionary.html">Open the historical dictionary</a>';}
}
window.GnammaQawaidHistorical={attach};
})();