/* Editorial subject browsing over the unchanged scholarly index. */
(function(global){
 'use strict';
 const prefKey='daruri-subject-index-view-v1';
 const allowedViews=new Set(['subjects','az']);
 const data=global.DARURI_SUBJECT_INDEX;
 if(!data)return;
 const groups=data.groups,facets=data.facets||[],questions=data.questions||[];
 const byTerm=new Map();
 let context=null;
 function remembered(){try{return JSON.parse(localStorage.getItem(prefKey)||'{}')}catch(e){return {}}}
 function remember(state){try{localStorage.setItem(prefKey,JSON.stringify({view:state.indexView,facet:state.indexFacet}))}catch(e){}}
 function initialize(ctx){
  context=ctx;
  const state=ctx.state,pref=remembered();
  if(!allowedViews.has(state.indexView))state.indexView=allowedViews.has(pref.view)?pref.view:'subjects';
  if(!['all',...facets.map(f=>f.id)].includes(state.indexFacet))state.indexFacet=['all',...facets.map(f=>f.id)].includes(pref.facet)?pref.facet:'all';
  if(!questions.some(q=>q.id===state.indexQuestion))state.indexQuestion='';
  if(!state.indexOpen||typeof state.indexOpen!=='object'||Array.isArray(state.indexOpen))state.indexOpen={};
  ctx.book.index.forEach((e,i)=>byTerm.set(e.term,i));
 }
 function render(ctx){
  initialize(ctx);
  const {esc,icon,panelHead,state}=ctx;
  return panelHead('SUBJECT INDEX','Concepts, questions and examples','Browse connected subjects or use the alphabetical index to find a particular entry.')+
   `<div id="indexExplorer"><div class="panel-controls subject-index-controls"><div class="subject-index-views" role="group" aria-label="Index view"><button type="button" class="action-btn" data-subject-view="subjects" aria-pressed="${state.indexView==='subjects'}">By subject</button><button type="button" class="action-btn" data-subject-view="az" aria-pressed="${state.indexView==='az'}">A–Z</button></div><label class="filter-input">${icon('search')}<input id="indexFilter" placeholder="Search subjects, subtopics, Arabic terms…" aria-label="Search subject index" autocomplete="off" value="${esc(state.indexQuery||'')}"></label><label class="subject-index-facet">Browse <select id="indexFacet" aria-label="Index entry type"><option value="all">All entries</option>${facets.map(f=>`<option value="${f.id}" ${state.indexFacet===f.id?'selected':''}>${esc(f.title)}</option>`).join('')}</select></label></div><p class="micro-desc">The subject groups and indexed descriptions are editorial reading aids. A heading may belong to several subjects; its linked passages and subtopics are the same in both views.</p><details class="subject-index-questions"><summary>Explore a question</summary><div class="subject-question-list">${questions.map(q=>`<button type="button" data-index-question="${q.id}">${esc(q.title)}</button>`).join('')}</div></details><div class="subject-index-status"><span id="indexCount" class="filter-count" aria-live="polite"></span><span class="subject-disclosure-controls"><button type="button" data-index-expand="all">Expand all</button><button type="button" data-index-expand="none">Collapse all</button></span></div><div id="indexQuestionStatus"></div><div id="indexList"></div><div id="indexRedirects"></div></div>`;
 }
 function sorted(entries){return entries.slice().sort((a,b)=>a.term.localeCompare(b.term,'en',{sensitivity:'base',ignorePunctuation:true,numeric:true}));}
 function update(ctx){
  initialize(ctx);
  const root=document.getElementById('indexExplorer');if(!root)return;
  const {state,contains,esc,sectionButton}=ctx,q=String(state.indexQuery||'').trim();
  // A jump from the reader or a cross-reference must not be hidden by a previous facet/question.
  if(state.indexFocusPending){state.indexFacet='all';state.indexQuestion='';}
  const facet=facets.find(f=>f.id===state.indexFacet);
  const question=questions.find(x=>x.id===state.indexQuestion);
  const allowed=facet?new Set(facet.terms):null,questionTerms=question?new Set(question.terms):null;
  const alias=term=>Object.entries(ctx.redirects||{}).filter(([,target])=>target===term).map(([a])=>a).join(' ');
  const headingMatches=e=>contains(e.term,q)||contains((ctx.synonyms||{})[e.term]||'',q)||contains(alias(e.term),q);
  const groupMatches=new Set(q?groups.filter(g=>contains(g.title,q)||contains(g.description,q)).map(g=>g.id):[]);
  const topicTerms=new Set(groups.filter(g=>groupMatches.has(g.id)).flatMap(g=>g.terms));
  const entries=sorted(ctx.book.index.filter(e=>(!allowed||allowed.has(e.term))&&(!questionTerms||questionTerms.has(e.term))&&(!q||headingMatches(e)||topicTerms.has(e.term)||e.sub.some(s=>contains(s.label,q)))));
  const focused=state.indexFocus;
  let targetAssigned=false;
  function record(e,scope){
   const key=`${scope}:term-${byTerm.get(e.term)}`;
   const sub=q&&!headingMatches(e)&&!topicTerms.has(e.term)?e.sub.filter(s=>contains(s.label,q)):e.sub;
   const focusHere=focused?.term===e.term;
   const isOpen=!!q||!!question||focusHere||state.indexOpen[key]===true;
   return `<details class="index-record" data-index-open-key="${key}" ${isOpen?'open':''}><summary>${esc(e.term)}<span class="badge">${sub.length} ${sub.length===1?'topic':'topics'}</span></summary><div class="subentry-list">${sub.map(s=>{
    const targeted=focusHere&&(!focused.sub||focused.sub===s.label),hasId=targeted&&!targetAssigned;
    if(hasId)targetAssigned=true;
    return `<div class="subentry-row ${targeted?'index-targeted-row':''}" ${hasId?'id="indexTargetRow"':''}><span class="subentry-title">${esc(s.label)}</span><span class="jump-list">${s.sections.map(n=>sectionButton(n)).join('')}</span></div>`;
   }).join('')}</div></details>`;
  }
  function group(g,subset){
   const key='group:'+g.id;
   const isOpen=!!q||!!question||subset.some(e=>focused?.term===e.term)||state.indexOpen[key]===true;
   return `<details class="subject-group" data-index-open-key="${key}" ${isOpen?'open':''}><summary><span class="subject-group-title">${esc(g.title)}</span><span class="badge">${subset.length} ${subset.length===1?'heading':'headings'}</span><span class="subject-group-description">${esc(g.description)}</span></summary><div class="subject-group-body">${subset.map(e=>record(e,g.id)).join('')}</div></details>`;
  }
  const list=document.getElementById('indexList');
  if(!entries.length)list.innerHTML='<div class="empty-state">No entries match. Try another spelling, clear the search, or choose All entries.</div>';
  else if(state.indexView==='az')list.innerHTML=entries.map(e=>record(e,'az')).join('');
  else{
   const covered=new Set();
   list.innerHTML=groups.map(g=>{
    const terms=new Set(g.terms),subset=entries.filter(e=>terms.has(e.term));
    subset.forEach(e=>covered.add(e.term));
    return subset.length?group(g,subset):'';
   }).join('');
   const additional=entries.filter(e=>!covered.has(e.term));
   if(additional.length){const edition=facets.find(f=>f.id==='edition');list.innerHTML+=group(edition||{id:'other',title:'Additional entries',description:''},additional);}
  }
  root.querySelectorAll('[data-subject-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.subjectView===state.indexView)));
  const facetSelect=document.getElementById('indexFacet');if(facetSelect)facetSelect.value=state.indexFacet;
  document.getElementById('indexCount').textContent=`${entries.length} ${entries.length===1?'heading':'headings'}${state.indexView==='subjects'?' · Shared entries may appear in several subjects':''}`;
  document.getElementById('indexQuestionStatus').innerHTML=question?`<p class="subject-question-active"><strong>${esc(question.title)}</strong> <button type="button" data-index-clear-question>Show all questions and entries</button></p>`:'';
  if(ctx.renderRedirects)ctx.renderRedirects();
  bind(root);
  if(state.indexFocusPending){state.indexFocusPending=false;requestAnimationFrame(()=>document.getElementById('indexTargetRow')?.scrollIntoView({block:'center',behavior:'instant'}));}
 }
 function bind(root){
  if(root.dataset.subjectBound)return;
  root.dataset.subjectBound='true';
  root.addEventListener('click',event=>{
   const button=event.target.closest('button');if(!button||!root.contains(button)||!context)return;
   const {state}=context;
   if(button.dataset.indexTopic){state.indexFacet='all';state.indexQuestion='';}
   else if(button.dataset.subjectView){state.indexView=button.dataset.subjectView;remember(state);update(context);}
   else if(button.hasAttribute('data-index-question')){state.indexQuestion=button.dataset.indexQuestion;state.indexQuery='';state.indexFocus=null;state.indexFacet='all';document.getElementById('indexFilter').value='';update(context);}
   else if(button.hasAttribute('data-index-clear-question')){state.indexQuestion='';update(context);}
   else if(button.hasAttribute('data-index-expand')){const open=button.dataset.indexExpand==='all';root.querySelectorAll('#indexList details').forEach(d=>{d.open=open;state.indexOpen[d.dataset.indexOpenKey]=open;});}
  });
  root.addEventListener('change',event=>{if(event.target.id==='indexFacet'&&context){context.state.indexFacet=event.target.value;context.state.indexQuestion='';context.state.indexFocus=null;remember(context.state);update(context);}});
  root.addEventListener('toggle',event=>{
   const el=event.target;if(!el.isConnected||!el.dataset.indexOpenKey||!context)return;
   if(!context.state.indexQuery&&!context.state.indexQuestion)context.state.indexOpen[el.dataset.indexOpenKey]=el.open;
  },true);
 }
 global.DaruriSubjectIndex={render,update,data};
})(window);
