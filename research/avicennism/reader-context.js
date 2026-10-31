(function(){'use strict';
const V=window.AVR, A=window.AVICENNIAN_APPARATUS;
if(!V||!A||!A.context||!A.links)return;
const P=V.pages,D=V.data,$=V.$,E=V.esc,H=V.head,I=V.icon;
const contexts=A.context.records, debateCards=A.links.debates, domainEvidence=A.links.domainEvidence;
const family=A.context.tradition.families, references=A.context.tradition.references;
function cell(title,text){return '<div class="argument-context-cell"><div class="eyebrow">'+E(title)+'</div><p>'+E(text||'Not yet established from the source.')+'</p></div>';}
function statusText(k){return A.context.protocol.statusCodes[k]||k||'Source not fully collated';}
function sourceContext(r){
  const c=contexts[r.id];
  if(!c)return '<div class="critical-notice"><strong>Editorial comparison:</strong> This document is a modern analytical chapter. Its embedded primary passages must be separately checked; it is not a historical matn or sharḥ.</div>';
  return '<section class="argument-context-panel" aria-labelledby="context-heading">'+
    '<div class="argument-context-header"><div><div class="eyebrow">Source context · not keyword-derived</div><h2 id="context-heading">What is being answered here?</h2></div><span class="status-pill">'+E(statusText(c.confidence))+'</span></div>'+
    '<p><strong>Exact location:</strong> '+E(c.part)+'. '+E(c.locator)+'</p>'+
    '<div class="argument-context-grid">'+
      cell('The preceding question',c.immediatePrior)+
      cell('Question under discussion',c.question)+
      cell('Thesis or lemma',c.base)+
      cell('Objection or target position',c.objections)+
      cell('Reply or argument',c.reply)+
      cell('Where the discussion goes next',c.continuation)+
    '</div>'+
    '<p class="source-context-line"><strong>Whose voice?</strong> '+E(c.sourceVoice)+
    ' · <strong>Extent:</strong> '+E(c.extent)+'</p>'+
    '<p class="source-context-line"><strong>Still required:</strong> '+E(c.missing)+'</p>'+
  '</section>';
}
function sourceContextButton(r){
  return '<a class="button" href="#full/'+E(r.id)+'">'+I('book')+' Read the whole available argument</a>';
}
function sourceLine(r){
  const c=contexts[r.id];
  return '<div class="reading-meta"><span>'+E(r.author)+'</span><span>'+E(c?c.part:r.work)+'</span><span>'+E(c?c.locator:r.locus||'')+'</span></div>';
}
P.full=function(id){
  const r=V.byId.get(id);
  if(!r){P.missing('Source record unavailable');return;}
  const chapters=V.sections(r),c=contexts[id];
  const header=V.crumb([['Library','#contents'],[r.title,'']])+
    '<div class="section-header"><div><div class="eyebrow">'+E(r.author)+' · '+E(r.locus||'')+'</div><h1>'+E(r.title)+'</h1><p class="muted">'+E(r.work)+'</p></div>'+V.badge(r)+'</div>'+
    '<p class="critical-notice"><strong>Full available argument:</strong> the text below presents every section of the working edition in its original sequence, without a short-excerpt character cutoff. It is <em>not</em> a claim that every historical-language sentence has been transcribed or that variants were independently collated.</p>'+
    sourceContext(r)+V.citeLinks(r);
  const toc='<nav class="full-unit-toc" aria-label="Contents of this source"><div class="eyebrow">This text in sequence</div><ol>'+
    chapters.map(x=>'<li><a href="#full-unit-'+x.index+'">'+E(x.title)+'</a></li>').join('')+'</ol></nav>';
  const text=chapters.map(x=>
    '<section class="full-unit-section" id="full-unit-'+x.index+'">'+
      '<h2>'+E(x.title)+'</h2>'+
      '<div class="text-columns"><div class="translation-side"><div class="column-label">Working English / editorial argument</div><div class="content-block">'+(x.body?V.md(x.body):'<p>No text in this section.</p>')+'</div></div>'+
      '<div class="source-side"><div class="column-label">'+E(r.lang==='fa'?'Persian':r.lang==='la'?'Latin':'Arabic')+' · excerpts only</div>'+V.original(r,x)+'</div></div>'+
      '<div class="section-tools"><a href="'+V.sectionLink(r,x.index)+'">Open section '+(x.index+1)+' with navigation →</a></div>'+
    '</section>').join('');
  const prev=V.records[V.records.findIndex(q=>q.id===id)-1],next=V.records[V.records.findIndex(q=>q.id===id)+1];
  $('#main').innerHTML=header+toc+'<article class="full-source-reading">'+text+'</article>'+
    '<div class="pager-inline"><a href="'+(prev?'#full/'+prev.id:'#contents')+'">← '+E(prev?prev.title:'Catalogue')+'</a>'+
    '<a href="'+(next?'#full/'+next.id:'#contents')+'">'+E(next?next.title:'Catalogue')+' →</a></div>';
  $('#pager').hidden=true;
};
const _text=P.text;
P.text=function(id,num){
  if(num===undefined){P.full(id);return;}
  _text(id,num);
  const r=V.byId.get(id),layout=$('.document-layout'),meta=$('.reading-meta');
  if(!r||!layout||!meta)return;
  meta.insertAdjacentHTML('beforebegin',sourceContext(r)+'<div class="source-context-tools">'+sourceContextButton(r)+'</div>');
  const src=$('.section-header');
  if(src&&contexts[id])src.insertAdjacentHTML('afterend','<p class="editorial-label">'+E(contexts[id].part)+' · '+E(contexts[id].locator)+'</p>');
};
const _home=P.home;
P.home=function(){
  return _home().replace('20 philosophical domains','20 philosophical domains')+
    '<section class="argument-context-panel"><div class="eyebrow">Historical coverage audit</div><h2>Not the whole tradition yet</h2><p>The historical catalogue now maps '+family.length+' identifiable transmission families. Many lack direct translated primary-source units. The reader separates sources actually translated from bibliographical leads and scholarship; it does not equate a topic list with a complete philosophical tradition.</p><p><a class="button primary" href="#tradition">View historical transmission and gaps →</a></p></section>';
};
const _contents=P.contents;
P.contents=function(type){
  _contents(type);
  const main=$('#main');
  if(main)main.insertAdjacentHTML('afterbegin','<p class="critical-notice"><strong>Coverage warning:</strong> the listed records are text units, not a complete inventory of all later Avicennian authors or editions. <a href="#tradition">Consult the historical map</a> before making a whole-tradition claim. Each text opens in its full available sequence.</p>');
};
const _recordLink=V.recordLink;
V.recordLink=function(r){
  return _recordLink(r).replace('href="#text/'+r.id+'"','href="#full/'+r.id+'"');
};
function stepsHtml(d){
  const stages=d.sequence||[];
  return '<ol class="argument-stages">'+stages.map((s,i)=>{
    const r=V.byId.get(s.recordId),sec=r?V.sections(r)[s.section]:null;
    return '<li><div class="argument-step-label"><span class="eyebrow">Move '+(i+1)+' · '+E(s.role)+'</span>'+
      (r?'<a href="'+V.sectionLink(r,s.section)+'">'+E(r.author)+' — '+E(sec?.title||r.title)+'</a>':'<span>Source not found</span>')+
      '</div><p><strong>'+E(s.claim)+'</strong></p><p>'+E(s.why)+'</p>'+
      '<p class="small">Relationship: '+E(s.relation.replace(/-/g,' '))+'</p></li>';
  }).join('')+'</ol>';
}
function cardSelect(d,selected,side){
  return '<label>'+E(side)+' argument<select id="compare-'+side.toLowerCase()+'">'+d.sequence.map((s,i)=>{
    const r=V.byId.get(s.recordId);
    return '<option value="'+i+'"'+(i===selected?' selected':'')+'>'+E((r?r.author:'Unlocated')+' — '+s.role)+'</option>';
  }).join('')+'</select></label>';
}
function fullCompareCard(s,side){
  const r=V.byId.get(s.recordId);
  if(!r)return '<div class="compare-work">Source record missing</div>';
  const sec=V.sections(r)[s.section];
  if(!sec)return '<div class="compare-work">Explicit source section has not been verified. Do not guess another using keyword matching.</div>';
  const c=contexts[r.id];
  return '<article class="compare-work"><div class="eyebrow">'+E(side)+' · '+E(s.role)+'</div>'+
    '<h3>'+E(r.author)+'</h3><p>'+E(r.work)+' · '+E(c?c.part:r.locus)+'</p>'+
    V.badge(r)+'<h4>'+E(sec.title)+'</h4>'+
    '<p class="compare-claim"><strong>What this actually says:</strong> '+E(s.claim)+'</p>'+
    '<p class="small">'+E(s.why)+'</p>'+
    '<p class="source-context-line"><strong>Original question:</strong> '+E(c?c.question:'An editorial synthesis, not a distinct historical lemma.')+'</p>'+
    '<p class="source-context-line"><strong>Answering:</strong> '+E(c?c.objections:'The linked primary passages, rather than a direct historical opponent.')+'</p>'+
    '<div class="column-label">Complete selected argumentative section · no truncation</div>'+
    '<div class="compare-full-text">'+(sec.body?V.md(sec.body):'<p>No text in this source section.</p>')+'</div>'+
    '<div class="column-label">Original-language anchors actually transcribed</div>'+
    V.original(r,sec)+
    '<div class="source-links"><a href="#full/'+r.id+'">Read entire working unit →</a>'+V.extLink(V.sourceLinks(r)[0],'Original source')+'</div>'+
    '<details class="section-notes"><summary>Provenance and missing evidence</summary><p>'+E(c?c.extent:r.coverage)+'</p><p>'+E(c?c.missing:'Independent primary verification needed.')+'</p></details>'+
  '</article>';
}
P.compare=function(id,params){
  const d=debateCards[id];
  if(!d){$('#main').innerHTML=P.compareList();return;}
  const n=d.sequence.length;
  let left=params.has('left')?Number(params.get('left')):0;
  let right=params.has('right')?Number(params.get('right')):1;
  if(!Number.isInteger(left)||left<0||left>=n)left=0;
  if(!Number.isInteger(right)||right<0||right>=n)right=Math.min(1,n-1);
  $('#main').innerHTML=V.crumb([['Comparative questions','#compare'],[d.question,'']])+
    H('Argument dossier',d.question,d.scope)+
    '<div class="critical-notice"><strong>Direct historical reply or editorial comparison?</strong> Every step below states its evidential relationship. A common term never by itself establishes that one philosopher was answering another.</div>'+
    '<section class="argument-chain-panel"><h2>What question is being answered, and by whom?</h2>'+
    '<p>Read the entire chain before extracting the concluding claim. <strong>Extent:</strong> '+E(d.status)+'</p>'+stepsHtml(d)+'</section>'+
    '<div class="section-head"><h2>Compare the complete selected argument sections</h2></div>'+
    '<div class="filter-fields">'+cardSelect(d,left,'Left')+cardSelect(d,right,'Right')+
    '<button type="button" id="context-swap">Swap sides</button></div>'+
    '<div class="compare-layout">'+fullCompareCard(d.sequence[left],'Left')+fullCompareCard(d.sequence[right],'Right')+'</div>'+
    '<div class="argument-context-panel"><h2>Documented relations, not keyword similarities</h2>'+
    (d.links||[]).map(l=>'<div class="explicit-edge"><strong>'+E(l.kind.replace(/-/g,' '))+'</strong><p>'+E(l.explanation)+'</p></div>').join('')+
    '<p class="small">Open each original edition to check whether a later author is quoting, paraphrasing or responding. The current working translation is not a full diplomatic collation.</p></div>';
  $('#pager').hidden=true;
  $('#compare-left').addEventListener('change',e=>{location.hash=V.href('compare/'+id,{left:Number(e.target.value),right});});
  $('#compare-right').addEventListener('change',e=>{location.hash=V.href('compare/'+id,{left,right:Number(e.target.value)});});
  $('#context-swap').addEventListener('click',()=>{location.hash=V.href('compare/'+id,{left:right,right:left});});
};
P.compareList=function(){
  return H('Argument-by-argument sourcebook','Ten explicitly anchored questions','No section is selected by keyword similarity; each argument has a stated source, context, objection, response and relationship.')+
    '<div class="critical-notice"><strong>Reading principle:</strong> a claim and the criticism it answers must be kept together. Similar subject matter across traditions is labelled as comparative, not as an invented historical reply.</div>'+
    '<div class="toc-grid">'+D.debates.map(x=>{
      const d=debateCards[x.id];return '<a class="toc-card" href="#compare/'+x.id+'"><div class="eyebrow">'+E(d?d.status:'Not collated')+'</div><h3>'+E(x.question)+'</h3><p>'+E(d?d.scope:x.summary)+'</p><div class="card-foot">'+(d?d.sequence.length:0)+' identified source moves →</div></a>';
    }).join('')+'</div>';
};
function evidRows(list){
 return (list||[]).map(x=>{
  const r=V.byId.get(x.recordId),sec=r?V.sections(r)[x.section]:null;
  return '<div class="document-row"><div><div class="eyebrow">'+E(x.level)+'</div>'+
   '<h3>'+(r?E(r.author)+' — '+E(sec?sec.title:r.title):'Unverified source link')+'</h3>'+
   '<p>'+E(x.reason)+'</p></div>'+
   (r&&sec?'<a href="'+V.sectionLink(r,x.section)+'">Read argument →</a>':'<span>Not located</span>')+'</div>';
 }).join('');
}
P.domain=function(id){
 const t=D.themes.find(q=>q.id===id),info=domainEvidence[id];
 if(!t||!info){$('#main').innerHTML=P.domainMap();return;}
 $('#main').innerHTML=V.crumb([['Twenty domains','#domains'],[t.title,'']])+
 H('Domain '+t.num+' of 20',t.title,t.summary)+
 '<div class="critical-notice"><strong>What is actually established?</strong> Sources below are linked by an identified claim or argument, not keywords in a title. A comparative chapter is clearly separated from a directly sourced passage.</div>'+
 '<div class="section-head"><h2>Direct passages relevant to this question</h2></div>'+
 (info.direct.length?evidRows(info.direct):'<p class="empty-state">No direct, context-complete primary unit in this edition for the stated question.</p>')+
 '<div class="section-head"><h2>Editorial comparative context</h2></div>'+
 (info.comparative.length?evidRows(info.comparative):'<p class="empty-state">No separate analysis yet.</p>')+
 '<div class="argument-context-panel"><h2>What remains unproved or unedited</h2><p>'+E(info.gap)+'</p></div>'+
 '<p><a class="button" href="#domains">← All twenty domains</a> <a class="button" href="#tradition">Historical transmission map</a></p>';
 $('#pager').hidden=true;
};
P.domainMap=function(){
 const n=Object.values(domainEvidence).filter(v=>!v.direct.length).length;
 return H('Systematic map','Twenty domains of research','This is a map of questions and existing evidence, not a claim that all twenty domains have exhaustive primary editions.')+
 '<div class="critical-notice"><strong>Evidence audit:</strong> '+n+' domains presently have no directly contextualized primary passage in this corpus. All domains show the relevant evidence and what remains unedited.</div>'+
 '<div class="domain-grid">'+D.themes.map(t=>{
 const v=domainEvidence[t.id],ct=v?.direct.length||0;
 return '<a class="domain-card" href="#domain/'+t.id+'"><div class="eyebrow">'+String(t.num).padStart(2,'0')+' · '+(ct?ct+' direct segments':'No direct segment')+'</div>'+
 '<h3>'+E(t.title)+'</h3><p>'+E(t.summary)+'</p><div class="card-foot">'+(v?.comparative.length||0)+' comparative aids · inspect →</div></a>';
 }).join('')+'</div>';
};
P.tradition=function(){
 const stages=family.length,uncovered=family.filter(f=>!f.recordIds.length).length;
 $('#main').innerHTML=H('Historical breadth','The later Avicennian transmission','The historical scope includes reception, criticism and hybrid developments; it cannot be exhausted by eleven late translation fascicles.')+
 '<div class="statline"><div><strong>'+stages+'</strong><span>historical streams mapped</span></div>'+
 '<div><strong>'+uncovered+'</strong><span>without any primary reading unit</span></div>'+
 '<div><strong>'+references.length+'</strong><span>scholarly source leads</span></div></div>'+
 '<div class="critical-notice"><strong>No total-coverage claim:</strong> the catalogue distinguishes translated/partial material from streams with no direct primary passage. The traditions overlap in authors and texts; they are research routes, not an assertion of sixteen mutually exclusive historical schools.</div>'+
 '<div class="filter-fields"><label>Filter historical families<input id="family-search" type="search" placeholder="Ottoman, Indian, logic, Qajar, Shiraz…"></label></div>'+
 '<div id="family-results">'+family.map((f,i)=>familyCard(f,i)).join('')+'</div>'+
 '<div class="section-head"><h2>Basis for the coverage audit</h2></div>'+
 '<div class="witness-grid">'+references.map(ref=>'<div class="witness-entry"><h3>'+E(ref.title)+'</h3><p>'+E(ref.use)+'</p>'+V.extLink(ref.url,'Bibliography / scholarly source')+'</div>').join('')+'</div>';
 $('#pager').hidden=true;
 const input=$('#family-search');
 input.addEventListener('input',e=>{
  const q=V.norm(e.target.value);$('#family-results').innerHTML=family.filter(f=>!q||V.norm([f.title,f.period,f.languages,f.works.join(' ')].join(' ')).includes(q)).map((f,i)=>familyCard(f,i)).join('')||'<p class="empty-state">No matching historical stream.</p>';
 });
};
function familyCard(f,i){
 const refs=f.referenceIds.map(id=>references.find(r=>r.id===id)).filter(Boolean);
 return '<section class="tradition-family" id="family-'+E(f.id)+'"><div class="eyebrow">Historical stream '+String(i+1).padStart(2,'0')+' · '+E(f.period)+' · '+E(f.languages)+'</div>'+
 '<h2>'+E(f.title)+'</h2><p class="small">Textual status: '+E(f.status.replace(/-/g,' '))+'</p>'+
 '<div class="tradition-cols"><div><h3>Named works / witnesses to follow</h3><ul>'+f.works.map(w=>'<li>'+E(w)+'</li>').join('')+'</ul></div>'+
 '<div><h3>What must be reconstructed</h3><p>'+E(f.task)+'</p><h3>Currently available source units</h3>'+
 (f.recordIds.length?'<ul>'+f.recordIds.map(id=>{let r=V.byId.get(id);return r?'<li><a href="#full/'+r.id+'">'+E(r.title)+'</a> · '+E(r.coverage)+'</li>':'';}).join('')+'</ul>':'<p class="empty-state">No direct source unit currently edited from this stream.</p>')+
 '<div class="source-links">'+refs.map(x=>V.extLink(x.url,x.title)).join('')+'</div></div></div></section>';
}
P.contextMethod=function(){
 $('#main').innerHTML=H('Editing protocol','What makes a passage publishable?','A principle requires a demonstrable answer to an identified question in the historical text.')+
 '<div class="argument-context-panel"><h2>Minimum unit</h2><ol>'+
 A.context.protocol.minimumCompleteArgument.map(t=>'<li>'+E(t)+'</li>').join('')+
 '</ol><p>When any item is missing, the reader must label the unit as an excerpt, context reconstruction, mediated report or incomplete witness.</p></div>'+
 '<div class="argument-context-panel"><h2>Source grades</h2>'+
 Object.entries(A.context.protocol.statusCodes).map(([key,val])=>'<div class="explicit-edge"><strong>'+E(key)+'</strong><p>'+E(val)+'</p></div>').join('')+
 '</div><p><a href="#tradition">Browse the historical gaps</a> · <a href="#compare">See a complete argument comparison</a></p>';
 $('#pager').hidden=true;
};
window.AVR.context=A;
})();