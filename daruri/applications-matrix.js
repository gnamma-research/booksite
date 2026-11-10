/* Daruri-only overview of existing Bidāya application links.
 * No source prose, links, saved data or PDF content is rewritten.
 * Topic columns are editorial groupings; ticks do not assert agreement.
 */
(function(root){
'use strict';
const doc=root.document;
const VERSION='20261110-matrix1';
const GROUPS=[
 {id:'rulings',label:'Obligation & prohibition',start:10,end:35},
 {id:'capacity',label:'Intention & capacity',start:36,end:53},
 {id:'validity',label:'Validity & concessions',start:54,end:61},
 {id:'proof',label:'Revelation & proof',start:62,end:147},
 {id:'meaning',label:'Meaning & wording',start:148,end:196},
 {id:'commands',label:'Commands & prohibitions',start:197,end:209},
 {id:'analogy',label:'Analogy & causes',start:210,end:226},
 {id:'conduct',label:'Prophetic conduct',start:227,end:229},
 {id:'judgement',label:'Juristic judgement',start:230,end:258}
];
// Concise labels drawn from the existing application titles/locators.
const LABELS={B01:'Legal status of marriage',B02:'Extent of head-wiping',B03:'Proposing over another proposal',B04:'Zakāt on a child’s property',B05:'Intention in ablution',B06:'Coerced divorce',B07:'Release from interdiction',B08:'Contract by a remoter guardian',B09:'A traveller’s fast',B10:'Reciting the basmala',B11:'Guardianship when the father is absent',B12:'Ablution after touching women',B13:'Minimum dower',B14:'Sales-session option',B15:'Guardianship as a marriage condition',B16:'Timing of pilgrimage',B17:'Completing ʿumra',B18:'Divorce during menstruation',B19:'Recipient of foetal compensation',B20:'Zakāt on jewellery',B21:'Divorce during fatal illness',B22:'Ribā in foodstuffs',B23:'Minimum dower and theft threshold',B24:'Triple divorce after mutual imprecation',B25:'Mistaken qibla',B26:'A physician’s mistake',B27:'Cupping while fasting',B28:'Deferred animal barter'};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function recordedRefs(app,sections){
 const ids=[app.n,...(app.also||[])];
 // Match the exact explicit-reference syntax used by gnLinkAppRefs.
 for(const match of String(app.text||'').matchAll(/§{1,2}\s*\d+(?:(?:\s*,\s*(?:and\s+)?|\s*[–—-]\s*|\s+and\s+)\d+)*/g)){
  ids.push(...match[0].match(/\d+/g).map(Number));
 }
 return [...new Set(ids.map(Number))].filter(n=>sections.has(String(n))).sort((a,b)=>a-b);
}
function createModel(book){
 const sections=new Map(book.sections.map(s=>[String(s.id),s]));
 const rows=book.apps.map(app=>({id:app.id,label:LABELS[app.id]||app.title,app,refs:recordedRefs(app,sections)}));
 // A future source reference outside the current topic boundaries remains
 // visible rather than disappearing from the matrix.
 const groups=GROUPS.map(g=>({...g}));
 if(rows.some(r=>r.refs.some(n=>!groups.some(g=>n>=g.start&&n<=g.end))))groups.push({id:'other',label:'Other linked principles',start:0,end:Infinity});
 const forGroup=(row,group)=>row.refs.filter(n=>group.id==='other'?!GROUPS.some(g=>n>=g.start&&n<=g.end):n>=group.start&&n<=group.end);
 return {rows,sections,groups,forGroup};
}
function install(book){
 if(root.GnammaApplicationMatrix.installed)return;
 const main=doc.getElementById('mainContent');if(!main||!book?.apps||!book?.sections)return;
 const model=createModel(book),byId=new Map(model.rows.map(r=>[r.id,r]));
 let expanded=false,opened=true,selected=null,scrollLeft=0,lastIds='',queued=false;
 function matrix(){return doc.getElementById('gn-app-matrix');}
 function paper(){
  const box=matrix();if(!box)return;
  const candidates=[main.querySelector('.list-card'),main,doc.body,doc.documentElement].filter(Boolean);
  let background='';
  for(const el of candidates){const c=root.getComputedStyle(el).backgroundColor;if(c&&c!=='transparent'&&!/rgba\([^)]*,\s*0\s*\)/.test(c)){background=c;break;}}
  if(!background){const c=root.getComputedStyle(main).color.match(/\d+/g)||[];background=Number(c[0])>150?'#20252b':'#ffffff';}
  box.style.setProperty('--am-paper',background);
 }
 function visibleRows(){
  return [...main.querySelectorAll('#applicationList [id^="listapp-"]')].map(el=>byId.get(el.id.slice(8))).filter(Boolean);
 }
 function selectedRefs(){const row=selected&&byId.get(selected.id),group=selected&&model.groups.find(g=>g.id===selected.group);return row&&group?{row,group,refs:model.forGroup(row,group)}:null;}
 function detail(){
  const box=matrix(),panel=box?.querySelector('.am-detail');if(!panel)return;
  box.querySelectorAll('.am-tick').forEach(button=>button.setAttribute('aria-expanded',String(Boolean(selected&&button.dataset.amId===selected.id&&button.dataset.amGroup===selected.group))));
  const data=selectedRefs();
  if(!data){panel.hidden=true;panel.innerHTML='';panel.removeAttribute('data-gn-application');return;}
  const {row,group,refs}=data;
  panel.dataset.gnApplication=row.id;panel.dataset.gnAppSurface='inline';
  panel.innerHTML='<h3 id="am-detail-title">'+esc(row.label)+' · '+esc(group.label)+'</h3><p class="am-help">'+esc(row.app.relation||'Recorded editorial parallel')+'. These links reproduce the existing application note.</p><ul>'+refs.map(n=>'<li><a id="am-ref-'+esc(row.id)+'-'+n+'" href="#section='+n+'" data-gn-app-section="'+n+'" aria-label="Read Darūrī §'+n+': '+esc(model.sections.get(String(n)).title)+'">§'+n+' · '+esc(model.sections.get(String(n)).title)+'</a></li>').join('')+'</ul><button type="button" class="am-close" data-am-close>Close linked principles</button>';
  panel.hidden=false;
 }
 function render(rows){
  const box=matrix();if(!box)return;
  const shown=expanded?rows:rows.slice(0,8);
  if(selected&&!shown.some(r=>r.id===selected.id))selected=null;
  box.innerHTML='<summary>Applications at a glance <span class="am-count">('+rows.length+')</span></summary><p class="am-help">Tap a case to find its explanation below; tap a tick for the exact Darūrī principles. The columns are editorial topic groups.</p><div class="am-scroll" tabindex="0" role="region" aria-label="Application and principle matrix; scroll horizontally for more columns"><table><caption class="am-sr">Existing Bidāya applications and their recorded Darūrī links</caption><thead><tr><th scope="col">Bidāya application</th>'+model.groups.map(g=>'<th scope="col" title="Darūrī §§'+g.start+'–'+g.end+'">'+esc(g.label)+'</th>').join('')+'</tr></thead><tbody>'+shown.map(row=>'<tr data-am-row="'+esc(row.id)+'"><th scope="row"><a class="am-case" href="#application='+esc(row.id)+'" data-am-case="'+esc(row.id)+'" title="'+esc(row.app.title)+'">'+esc(row.label)+'</a><span class="am-meta">'+esc(row.id)+' · '+esc(row.app.book)+'</span></th>'+model.groups.map(group=>{const refs=model.forGroup(row,group);return '<td>'+(!refs.length?'<span class="am-sr">No recorded link</span>':'<button type="button" class="am-tick" id="am-tick-'+esc(row.id)+'-'+esc(group.id)+'" data-am-id="'+esc(row.id)+'" data-am-group="'+esc(group.id)+'" aria-expanded="false" aria-controls="am-detail" title="'+esc(refs.map(n=>'§'+n+' · '+model.sections.get(String(n)).title).join('; '))+'"><span aria-hidden="true">✓</span><span class="am-sr">'+esc(row.label)+' — '+esc(group.label)+': '+refs.map(n=>'§'+n).join(', ')+'</span></button>')+'</td>';}).join('')+'</tr>').join('')+'</tbody></table></div>'+(!rows.length?'<p class="am-help">No applications match the current filters.</p>':'')+'<div class="am-controls"><span>'+(rows.length?'Showing '+shown.length+' of '+rows.length+' applications':'')+'</span>'+(rows.length>8?'<button class="am-more" type="button" data-am-more aria-expanded="'+expanded+'">'+(expanded?'Show fewer applications':'Show all '+rows.length+' applications')+'</button>':'')+'</div><p class="am-legend">✓ = a connection recorded in this reader, not necessarily agreement. An empty cell means no connection is recorded here. Scroll the table sideways to see every principle group.</p><section id="am-detail" class="am-detail" aria-labelledby="am-detail-title" hidden></section>';
  box.open=opened;
  const scroller=box.querySelector('.am-scroll');scroller.scrollLeft=scrollLeft;scroller.addEventListener('scroll',()=>{scrollLeft=scroller.scrollLeft;},{passive:true});
  detail();paper();
 }
 function handle(event){
  const box=matrix(),target=event.target.closest?.('[data-am-case],[data-am-id],[data-am-more],[data-am-close]');
  if(!target||!box?.contains(target))return;
  if(target.tagName==='A'&&(event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey))return;
  event.preventDefault();
  if(target.dataset.amCase){
   const card=doc.getElementById('listapp-'+target.dataset.amCase);
   if(card){card.scrollIntoView({block:'start',behavior:'instant'});const focus=card.querySelector('[data-app]');focus?.focus({preventScroll:true});}
  }else if(target.hasAttribute('data-am-more')){
   expanded=!expanded;render(visibleRows());box.querySelector('[data-am-more]')?.focus({preventScroll:true});
  }else if(target.hasAttribute('data-am-close')){
   const previous=selected;selected=null;detail();if(previous)doc.getElementById('am-tick-'+previous.id+'-'+previous.group)?.focus({preventScroll:true});
  }else{
   const same=selected&&selected.id===target.dataset.amId&&selected.group===target.dataset.amGroup;
   selected=same?null:{id:target.dataset.amId,group:target.dataset.amGroup};detail();
   if(selected)box.querySelector('.am-detail').scrollIntoView({block:'nearest',behavior:'instant'});
  }
 }
 function sync(){
  queued=false;
  const list=doc.getElementById('applicationList');if(!list||!main.contains(list)){lastIds='';return;}
  const rows=visibleRows(),signature=rows.map(r=>r.id).join('|');let box=matrix();
  if(!box){
   box=doc.createElement('details');box.id='gn-app-matrix';box.open=opened;list.before(box);
   box.addEventListener('click',handle);box.addEventListener('toggle',()=>{opened=box.open;});
   render(rows);lastIds=signature;
  }else if(signature!==lastIds){lastIds=signature;render(rows);}
 }
 function schedule(){if(!queued){queued=true;root.requestAnimationFrame(sync);}}
 const observer=new root.MutationObserver(records=>{if(records.some(record=>!record.target.closest?.('#gn-app-matrix')))schedule();});
 observer.observe(main,{childList:true,subtree:true});
 const theme=new root.MutationObserver(paper);theme.observe(doc.documentElement,{attributes:true});theme.observe(doc.body,{attributes:true});
 root.addEventListener('hashchange',schedule);root.addEventListener('resize',paper,{passive:true});
 root.GnammaApplicationMatrix.installed=true;
 root.GnammaApplicationMatrix.model=model;
 sync();
}
root.GnammaApplicationMatrix={version:VERSION,groups:GROUPS,createModel,install,installed:false};
function boot(){
 const data=doc.getElementById('editionData');if(!data?.textContent)return;
 try{install(JSON.parse(data.textContent));}catch(error){console.warn('Daruri applications overview unavailable:',error.message);}
}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(window);
