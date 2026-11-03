/* Content-only adaptation inside the original Daruri application closure. */
const TH=window.TAHDHIB_CONFIG;
// Migrate old private records before creating the native desk, never overwriting a present store.
(function(){const key=TH.namespace+'-gnamma-reading-desk-v1';
 try{if(localStorage.getItem(key)!==null)return;
  const get=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return {}}};
  const old=get('gnamma-tahdhib-reader-v2-'+(TH.kind==='logic'?'division':'kalam'));
  const legacy=get('gnamma-tahdhib-private-notes-v1-'+TH.kind);const items=[];
  function add(id,kind,body=''){
   const p=TH.map[id];if(!p)return;
   const target={kind:kind==='note'?'paragraph':kind,section:p.section,segment:p.segment,lang:'en'};
   if(kind==='quote')Object.assign(target,{quote:sections.get(p.section).segments[p.segment].en,offset:0,prefix:'',suffix:''});
   items.push({id:'legacy-'+TH.kind+'-'+id+'-'+kind,kind,target,title:id,body,created:0,updated:Date.now(),modified:0,dateSource:'legacy-unknown',deleted:0,standalone:false,sourceUnitId:id});
  }
  for(const id of Array.isArray(old.bookmarks)?old.bookmarks:[])add(id,'paragraph');
  for(const [id,n] of Object.entries(legacy)){if(n?.body)add(id,'note',String(n.body));if(n?.highlight)add(id,'quote');}
  localStorage.setItem(key,JSON.stringify({format:'gnamma-reading-desk',version:1,work:TH.namespace,items}));
 }catch(e){console.warn('Older personal data left untouched:',e);}
})();
arabicCitation=function(s){const short='Cairo 1912 · '+(TH.kind==='logic'?'editorial division '+s.sourcePage:origPage(s));return {short,long:BOOK.info.edition+' '+short};};
renderReaderHeading=function(s,level='h1'){
 if(state.focusLevel===3)return '<p class="th-source-locator">'+esc(sectionRef(s.id))+'</p>';
 return '<'+level+' class="paired-heading"><span class="editorial-heading">'+esc(s.title)+'</span></'+level+'><p class="th-source-locator">'+esc(sectionRef(s.id))+' · editorial navigation label</p>';
};
renderHome=function(){
 $('#mainContent').innerHTML='<div class="gnamma-home">'+panelHead('AL-TAFTĀZĀNĪ',TH.title,'<span lang="ar" dir="rtl">'+esc(TH.arabicTitle)+'</span>')+
 '<p>'+esc(BOOK.info.subtitle)+'</p><div class="home-actions"><button class="action-btn primary" data-section="'+esc(state.n)+'">Continue reading</button><button class="action-btn" data-route="contents">Contents</button><button class="action-btn" data-route="editions">Editions & downloads</button></div><section class="home-block"><h3>Editorial status</h3><p>'+esc(TH.notice)+'</p><p>This is not a definitive manuscript-critical edition. Source text, explanatory commentary and personal notes remain separate.</p><a href="previous-reader.html">Previous source-aligned reader</a> · <a href="'+esc(TH.other)+'">Companion Tahdhīb volume</a></section></div>';
};
renderAbout=renderHome;
renderContents=function(){
 $('#mainContent').innerHTML=panelHead('CONTENTS',TH.title,'Navigate by '+(TH.kind==='logic'?'editorial division':'printed source page')+'. Reading mode controls whether text is paged or continuous.')+
 '<div class="contents-list">'+BOOK.parts.map(p=>'<details class="th-contents-part" open><summary>'+esc(p.label)+'</summary><div class="jump-list">'+BOOK.sections.filter(s=>s.part===p.id).map(s=>'<button type="button" data-section="'+s.id+'">'+esc(sectionRef(s.id))+' · '+esc(s.title)+'</button>').join('')+'</div></details>').join('')+'</div>';
};
renderStudy=function(){
 const sec=sections.get(String(state.n));
 $('#mainContent').innerHTML=panelHead('STUDY & SOURCE NOTES',sectionRef(sec.id),TH.notice)+
 '<div class="button-row"><button class="action-btn" data-section="'+sec.id+'">Return to text</button><a class="action-btn" href="previous-reader.html#page='+sec.sourcePage+'">Page-aligned source apparatus</a></div>'+
 '<div class="notes-list">'+gnSectionNotes(sec).map(n=>'<article class="note-row" id="note-'+esc(n.id)+'"><h3>'+esc(n.kindLabel||n.kind)+'</h3><p>'+esc(n.text)+'</p></article>').join('')+'</div>';
};
renderApplications=function(){
 $('#mainContent').innerHTML=panelHead('COMMENTARY',TH.title,'Commentary is a separate work, not part of al-Taftāzānī’s source text.')+
 '<div class="button-row"><a class="action-btn" href="'+esc(TH.commentary)+'">Open commentary / earlier annotated edition</a><a class="action-btn" href="'+esc(TH.other)+'">Open companion volume</a></div>';
};
renderHelp=function(){
 $('#mainContent').innerHTML=panelHead('HELP','Reading and study','The controls and Reading Desk are adapted from the actual Darūrī reader.')+
 '<section class="home-block"><h2>Continuous and immersive reading</h2><p>The four-corner button opens the original Reading / Focus / Continuous menu. Continuous renders the whole book in one scrolling document. The separate toolbar-visibility button hides the chrome; its restore button remains available.</p><h2>Saved work</h2><p>Use the ribbon icon to save a section or paragraph. Select words to highlight them or write a note. The Reading Desk has filters, editing, a recoverable Bin and JSON backup/import. Each book has a separate storage namespace; older saved Tahdhīb records are copied, never deleted.</p><h2>Sources</h2><p>'+esc(TH.notice)+'</p><p>Arabic vowel visibility only changes presentation. The canonical source and PDF bytes are unchanged.</p><a href="previous-reader.html">Previous source apparatus</a> · <a href="../../../shared/tahdhib-native/build-manifest.json">Build and integrity manifest</a></section>';
};
explainEditorialHeading=function(){
 const s=sections.get(String(state.n));$('#detailEyebrow').textContent='SOURCE & LOCATION';
 $('#detailContent').innerHTML='<h2 id="detailTitle">'+esc(sectionRef(s.id))+'</h2><p>'+esc(BOOK.info.edition)+'</p><p>'+esc(TH.notice)+'</p><p>Navigation titles are editorial. Printed page numbers are not PDF page indices.</p><a href="previous-reader.html#page='+s.sourcePage+'">Inspect original page-aligned apparatus</a>';showOverlay('infoOverlay');
};
cite=function(n){const s=sections.get(String(n));if(s)copyText('al-Taftāzānī, '+TH.title+', '+sectionRef(n)+' (Gnamma working edition). '+sectionPermalink(n));};
const thOldTerm=showTermDetail;
showTermDetail=function(term){thOldTerm(term);const host=$('#detailContent');if(host&&!host.querySelector('.th-dictionary-status'))host.insertAdjacentHTML('afterbegin','<p class="th-dictionary-status">Editorial terminology aid · not a historical dictionary quotation.</p>');};
sendToDictionary=function(q){state.glossaryQuery=String(q||'');navigate('glossary');};
window.GnammaEditions={render:async function(host){
 host.innerHTML=panelHead('EDITIONS & DOWNLOADS',TH.title,'Source-qualified PDFs; source text is unchanged by the reader migration.')+'<p id="th-pdf-status" role="status">Checking publication manifest…</p><div class="gn-editions" id="th-pdf-list"></div><div class="button-row"><a class="action-btn" href="data.js" download>Structured source corpus</a><a class="action-btn" href="previous-reader.html">Previous reading and export tools</a></div>';
 try{
  const res=await fetch('pdfs/edition_manifest.json',{cache:'no-store'});if(!res.ok)throw Error('Publication manifest unavailable');const m=await res.json();
  if(m.source_sha256!==TH.source_sha256||m.unit_count!==TH.unit_count)throw Error('PDF/source revision mismatch');
  const input=await fetch('data.js',{cache:'no-store'});if(!input.ok)throw Error('Current source unavailable');
  const digest=await crypto.subtle.digest('SHA-256',await input.arrayBuffer());
  if([...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')!==TH.source_sha256)throw Error('Current source changed; rebuild the reader');
  const list=host.querySelector('#th-pdf-list');if(!list)return;
  for(const f of m.files||[]){if(!/^pdfs\/[\w-]+\.pdf$/.test(f.href||''))continue;
   list.insertAdjacentHTML('beforeend','<article class="list-card"><h2>'+esc(({bilingual:'Arabic–English',arabic:'Arabic',english:'English'})[f.purpose]||f.purpose)+'</h2><p>'+f.a4_pages+' pages · working edition</p><a class="action-btn" href="'+esc(f.href)+'" target="_blank" rel="noopener">Read PDF</a> <a class="action-btn" href="'+esc(f.href)+'" download>Download PDF</a></article>');}
  host.querySelector('#th-pdf-status').textContent='Publication manifest matches this source revision. This checksum is not a certificate of manuscript-critical accuracy.';
 }catch(e){const s=host.querySelector('#th-pdf-status');if(s)s.textContent='Verified PDFs unavailable: '+e.message+'. Use the previous source-aligned reader.';}
}};
