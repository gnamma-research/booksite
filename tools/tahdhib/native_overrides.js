/* Work-specific content adapters inside the unchanged Daruri reader closure.
 * No source prose or scholarly witness is borrowed from Daruri. */
function arabicCitation(s){
 const page=(s.pages||[]).join('–');
 return {short:'Cairo 1912',page,long:'Cairo 1330/1912, printed '+(s.pages.length>1?'pp. ':'p. ')+page,
 title:'Original printed-page reference, not a manuscript certification or generated PDF page.'};
}
function renderHome(){
 $('#mainContent').innerHTML=panelHead('GNAMMA · AL-TAFTĀZĀNĪ',BOOK.info.title,
  '<span lang="ar" dir="rtl">'+esc(CFG.title_ar)+'</span>')+
 '<article class="home-intro"><p>'+esc(BOOK.info.author)+'</p><p>'+esc(BOOK.info.notice)+'</p>'+
 '<div class="button-row"><button class="action-btn primary" data-section="'+esc(state.n)+'">Continue reading</button><button class="action-btn" data-route="contents">Contents</button><button class="action-btn" data-route="editions">Editions &amp; downloads</button></div>'+
 '<h2>Text and apparatus</h2><p>'+esc(CFG.unitCount)+' stable Arabic–English passages. Printed readings, translation notes and unresolved variants remain separate from your private annotations.</p>'+
 '<p>Reading modes, Visuals, bookmarks, paragraph notes, selection highlights, Reading Desk, Bin and backup controls use the actual Darūrī reader implementation. This change does not certify the underlying text as a definitive critical edition.</p>'+
 '<details id="homeEditorialSources"><summary>Edition, sources and method</summary><p>'+esc(BOOK.info.edition)+'</p><p>'+esc(BOOK.info.vocalization)+'</p><p>'+esc(BOOK.info.editorialStatus)+'</p>'+
 '<a href="'+esc(CFG.statusHref)+'">Source-critical record</a> · <a href="source-reader.html">Page-aligned source and variant reader</a> · <a href="'+esc(CFG.sibling)+'">Companion Tahdhīb volume</a></details></article>';
}
function renderStudy(){
 $('#mainContent').innerHTML=panelHead('READING GUIDE','Study the text','An editorial route through this book. This is not the Darūrī legal study course.')+
 '<p class="micro-desc">Read the Arabic and translation, open the attached notes, and distinguish the author’s assertions from views he reports. The source apparatus remains available in the page-aligned reader.</p>'+
 '<div class="study-path">'+BOOK.parts.map(p=>'<article class="study-card"><h2>'+esc(p.label)+'</h2><p>'+esc(p.desc||p.caption)+'</p><button class="action-btn" data-section="'+p.start+'">Read this part</button></article>').join('')+'</div>';
}
function renderContents(){
 const original=state.contentsMode==='original';
 $('#mainContent').innerHTML=panelHead('NAVIGATE THE WORK','Contents','Original headings and editorial reading divisions are labelled separately.')+
 '<div class="panel-controls"><div class="segmented" role="group" aria-label="Table of contents type"><button data-contents-mode="original" aria-pressed="'+original+'">Book structure</button><button data-contents-mode="editorial" aria-pressed="'+!original+'">Editorial section titles</button></div><label class="filter-input"><input id="contentsFilter" aria-label="Filter contents" placeholder="Find a heading, printed page or passage…" value="'+esc(state.contentsQuery)+'"></label></div>'+
 '<p class="micro-desc">Cairo 1912 page numbers and the permanent Tahdhīb clause identifiers are retained. Part boundaries follow the recorded chapter beginnings; a printed page can contain the end of the preceding chapter.</p><div id="contentsResults" aria-live="polite"></div><div id="contentsList"></div>';
 updateContentsList();updateReturnBar();
}
function updateContentsList(){
 const q=state.contentsQuery.trim(),original=state.contentsMode==='original';let total=0;
 const html=BOOK.parts.map(p=>{
  const rows=BOOK.sections.filter(s=>s.part===p.id&&(!q||contains([s.title,s.headingAr,s.headingEn,...s.pages,...s.segments.map(x=>x.unitId)].join(' '),q)));
  if(!rows.length)return '';total+=rows.length;
  return '<details class="part-block" data-contents-part="'+p.id+'" '+(q||state.contentsOpen[p.id]?'open':'')+'><summary><strong>'+esc(p.label)+'</strong><small> '+rows.length+' reading divisions</small></summary><div class="contents-list">'+rows.map(s=>
   '<div class="contents-row"><span class="contents-n">'+esc(sectionRef(s.id))+'</span><button data-section="'+s.id+'">'+esc(original?(s.headingEn||s.title):s.title)+(original&&s.headingAr?'<span class="toc-original-ar" lang="ar" dir="rtl">'+esc(s.headingAr)+'</span>':'')+'</button><span class="pages">'+(s.headingAr?'Original heading':'Editorial locator')+'</span></div>').join('')+'</div></details>';
 }).join('');
 $('#contentsList').innerHTML=html||'<p>No matching headings or passages.</p>';$('#contentsResults').textContent=q?total+' matching divisions':'';
}
function renderGlossary(){
 $('#mainContent').innerHTML=panelHead('TECHNICAL LANGUAGE','Dictionary · Reading definitions',
  BOOK.glossary.length+' editorial definitions linked to this text. These are not quotations from historical lexicons and have not been certified as a complete historical dictionary.')+
 `<div class="panel-controls"><label class="filter-input">${icon('search')}<input id="glossaryFilter" placeholder="Search Arabic or English terminology…" aria-label="Filter dictionary entries" autocomplete="off" value="${esc(state.glossaryQuery)}"></label><span class="filter-count" id="glossaryCount"></span></div><div id="glossaryList"></div>`;
 updateGlossaryList();
}
function renderApplications(){
 $('#mainContent').innerHTML=panelHead('TEXTUAL CONTEXT','Commentary and source apparatus','The authorial matn, later commentary and marginal glosses must not be conflated.')+
 '<div class="button-row"><a class="action-btn" href="source-reader.html">Page-aligned source apparatus</a><a class="action-btn" href="../../../al-sanandaji/taqrib-al-maram/">Separate Sanandajī commentary</a><a class="action-btn" href="'+esc(CFG.statusHref)+'">Textual status</a></div>';
}
function explainEditorialHeading(){
 const s=sections.get(String(state.n));if(!s)return;
 $('#detailEyebrow').textContent='HEADING · SOURCE & LOCATION';
 $('#detailContent').innerHTML='<h2 id="detailTitle">'+esc(s.title)+'</h2><p>'+esc(s.headingAr?'The following heading is recorded in the Arabic text.':'This reading title is an editorial locator, not an authorial heading.')+'</p>'+
 (s.headingAr?'<blockquote lang="ar" dir="rtl">'+esc(s.headingAr)+'</blockquote><p>'+esc(s.headingEn)+'</p>':'')+
 '<p>'+esc(arabicCitation(s).long)+'</p><p>Permanent passages: '+esc(s.segments.map(x=>x.unitId).join(', '))+'</p><p>'+esc(BOOK.info.editorialStatus)+'</p>'+
 '<a href="source-reader.html#page='+s.originalPage+'">Inspect source notes and variants</a> · <button class="action-btn" data-route="editions">Editions &amp; downloads</button>';
 showOverlay('infoOverlay');
}
function cite(n){const s=sections.get(String(n));if(!s)return;copyText(BOOK.info.author+', '+BOOK.info.title+', Cairo 1330/1912, '+origPage(s)+'; '+s.segments.map(x=>x.unitId).join(', ')+' (Gnamma source-qualified working edition). '+location.href.split('#')[0]+'#section='+s.id);}
function renderHelp(){
 $('#mainContent').innerHTML=panelHead('READER HELP','Help','The same reading controls and annotation workflow as Darūrī, with this book’s own sources.')+
 '<article class="gn-history-help"><h2>Reading modes</h2><p>Use the reading-mode icon to select normal reading, focused reading, or the complete continuous book. Continuous mode includes every passage without Next-page clicks. The language controls switch Arabic, English or parallel text; Visuals controls fonts, size, layout and colours.</p><h2>Saving and returning</h2><p>Use the bookmark ribbon for sections or paragraphs. Select text for a word-range highlight. Reading Desk contains Bookmarks, Highlights, My notes and Bin; Manage provides backup import/export. Data is isolated for this book and remains in this browser unless you deliberately export it.</p><h2>Sources</h2><p>'+esc(BOOK.info.editorialStatus)+'</p><p>Copy includes the permanent Tahdhīb passage IDs and Cairo printed-page references. Printed pages are not generated PDF pages. Original marks can be shown or hidden; automatic vowels remain a separately labelled learning aid.</p><p><a href="source-reader.html">Inspect source-aligned text and variants</a> · <a href="'+esc(CFG.statusHref)+'">Editorial record</a></p></article>';
}
function renderIndex(){
 $('#mainContent').innerHTML=panelHead('SUBJECT ACCESS','Index of concepts and questions',BOOK.index.length+' editorial keyword headings linked to this book. Literal matches are navigational aids, not an authorial subject index or a complete thematic analysis.')+`<div class="panel-controls"><label class="filter-input">${icon('search')}<input id="indexFilter" placeholder="Filter concepts or Arabic terms…" aria-label="Filter academic index" value="${esc(state.indexQuery)}"></label><span id="indexCount" class="filter-count"></span></div><div id="indexList"></div><div id="indexRedirects"></div>`;
 updateIndexList();
}
