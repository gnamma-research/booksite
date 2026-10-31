(function(){'use strict';
const V=window.AVR,A=window.AVICENNIAN_APPARATUS;if(!V||!V.pages||!A||!A.afterAsfar||!A.tajrid)return;
const P=V.pages,D=V.data,E=V.esc,H=V.head,I=V.icon,$=V.$;
const dossiers=A.afterAsfar.dossiers,boundary=A.tajrid,overlaps=new Map(boundary.records.map(r=>[r.id,r]));
function gradeLabel(s){return ({'direct-contextual-source':'Direct bounded original','direct-contextual-section':'Direct bounded original','direct-contextual-with-reported-voices':'Direct text; some speakers reported','partially-established-two-direct-works':'Two different original works','direct-plus-mediated':'Direct and mediated','direct-bounded-segments':'Bounded original arguments','analytical-only-gap':'Primary gap — analytical only','bibliographical-not-primary':'Bibliographical lead only','direct-plus-mediated-large-gap':'Large unresolved witness gap','bibliographical-plus-one-primary-excerpt':'One bounded excerpt; wider gap','research-gap-with-anchors':'Comparative hypothesis; primary gap'})[s]||s.replace(/-/g,' ');}
function localEvidence(x){
 const r=V.byId.get(x.recordId);if(!r)return '<div class="source-warning">Referenced record unavailable.</div>';
 const ss=V.sections(r),s=ss[x.section];const loc=s?V.sectionLink(r,s.index):'#full/'+r.id;
 const match=overlaps.get(r.id),owner=match?.otherProjectLink;
 return '<div class="distinctive-evidence"><div class="eyebrow">'+E(x.relation)+' · '+E(x.locator)+'</div><h4><a href="'+loc+'">'+E(r.author)+' — '+E(s?s.title:r.title)+'</a></h4>'+
 '<p>'+E(x.claim)+'</p><div class="distinctive-source-links"><a href="#full/'+r.id+'">Full available working argument →</a>'+
 (r.sourceUrl?V.extLink(r.sourceUrl,'Source edition'):'')+
 (owner?V.extLink(owner,'Tajrīd sourcebook (shared text)'):'')+'</div></div>';
}
function dossierCard(c,n){
 const unique=c.sources.filter(x=>!["lah-shaw","taft-mental"].includes(x.recordId)).length;
 return '<article id="dossier-'+E(c.id)+'" class="distinctive-dossier">'+
 '<div class="eyebrow">Post-Tajrīd / post-Asfār development '+String(n+1).padStart(2,'0')+' · '+E(c.phase)+'</div>'+
 '<h2>'+E(c.title)+'</h2><p class="lead">'+E(c.thesis)+'</p>'+
 '<p><span class="status-pill '+(unique?'direct':'mediated')+'">'+E(gradeLabel(c.status))+'</span></p>'+
 '<div class="distinctive-columns"><section><h3>What the earlier problem was</h3><p>'+E(c.before)+'</p><h3>What changes in the later argument</h3><p>'+E(c.change)+'</p></section>'+
 '<section><h3>What belongs in this project</h3><p>'+E(c.unique)+'</p><h3>What stays in the Tajrīd project</h3><p>'+E(c.tajrid)+'</p></section></div>'+
 '<div class="section-head"><h3>Identified source passages and their actual role</h3></div>'+
 (c.sources.length?c.sources.map(localEvidence).join(''):'<p class="source-warning">No independent contextual primary passage from this historical tradition has yet been edited here. Bibliography is not a primary translation.</p>')+
 '<details class="section-notes" open><summary>What has NOT been established</summary><p>'+E(c.gap)+'</p></details>'+
 '</article>';
}
P.afterAsfar=function(){
 const direct=dossiers.filter(c=>c.sources.length).length;
 $('#main').innerHTML=H('Distinctive research · after Ṣadrā and the Tajrīd commentaries','What actually changed?','Twelve focused problems trace the preservation, transformation, rejection or unresolved status of Avicennian concepts in later independent works. This page does not duplicate the Tajrīd matn–sharḥ collation.')+
 '<div class="critical-notice"><strong>Chronology:</strong> post-Tajrīd begins after Ṭūsī’s thirteenth-century text; the later Safavid and post-Ṣadrian cases require particular attention to Ṣadrā’s Asfār in the seventeenth century. Some Lāhījī texts are contemporary with parts of the Sadrian tradition, not necessarily written strictly after every section of the Asfār.</div>'+
 '<div class="statline"><div><strong>'+dossiers.length+'</strong><span>distinctive questions</span></div><div><strong>'+direct+'</strong><span>with some direct evidence</span></div><div><strong>'+dossiers.filter(x=>!x.sources.length).length+'</strong><span>without direct source units</span></div></div>'+
 '<div class="section-head"><h2>Navigate the arguments</h2><a href="#tajrid-overlap">Division from Tajrīd →</a></div>'+
 '<nav class="toc-grid" aria-label="Post-Asfār dossiers">'+dossiers.map((c,i)=>'<a class="toc-card" href="#post-asfar/'+E(c.id)+'"><div class="eyebrow">'+String(i+1).padStart(2,'0')+' · '+E(gradeLabel(c.status))+'</div><h3>'+E(c.title)+'</h3><p>'+E(c.thesis)+'</p></a>').join('')+'</nav>'+
 '<div class="critical-notice"><strong>Evidence protocol:</strong> Every source is located to an actual historical argument and marked direct, editorial, mediated or missing. The conclusion is not inferred solely from a term matching the question title.</div>';
 $('#pager').hidden=true;
};
P.dossier=function(id){
 const c=dossiers.find(x=>x.id===id);if(!c){P.afterAsfar();return;}
 const idx=dossiers.findIndex(x=>x.id===id);
 $('#main').innerHTML=V.crumb([['What changed?','#post-asfar'],[c.title,'']])+dossierCard(c,idx)+
 '<div class="pager-inline"><a href="'+(idx>0?'#post-asfar/'+dossiers[idx-1].id:'#post-asfar')+'">← '+E(idx>0?dossiers[idx-1].title:'All dossiers')+'</a>'+
 '<a href="'+(idx<dossiers.length-1?'#post-asfar/'+dossiers[idx+1].id:'#post-asfar')+'">'+E(idx<dossiers.length-1?dossiers[idx+1].title:'All dossiers')+' →</a></div>';
 $('#pager').hidden=true;
};
const overlapTitle={ 'shared-exact-page-partial':'Overlapping printed pages', 'same-work-distinct-locus':'Same work; different historical locus', 'same-work-witness-uncertain':'Same work; edition equivalence not established' };
P.tajridOverlap=function(){
 const t=boundary.otherProject,rs=boundary.records,exact=rs.filter(x=>x.handling==="shared-exact-page-partial");
 $('#main').innerHTML=H('Cross-project source discipline','Tajrīd and Late Avicennism: two research programmes','Use the sourcebook of Ṭūsī and his commentaries as an authoritative critical cross-reference. Continue here only where a later independent philosophical argument is recovered.')+
 '<div class="statline"><div><strong>'+t.distinct_source_records+'</strong><span>Tajrīd record entries</span></div><div><strong>'+t.inherited_tusi_units+'</strong><span>inherited Ṭūsī units</span></div><div><strong>'+t.named_contextual_works+'</strong><span>named/contextual works</span></div><div><strong>'+exact.length+'</strong><span>verified page-level overlaps</span></div></div>'+
 '<div class="critical-notice"><strong>Counting warning:</strong> the 224 Tajrīd records do not mean 224 completely checked full passages. The overlap test requires work, edition-equivalent locus and argumentative unit—not merely the same author or keyword.</div>'+
 '<div class="actions">'+V.extLink(t.reader,'Open Tajrīd reader')+' <a class="button" href="#post-asfar">Post-Asfār transformations →</a></div>'+
 '<div class="section-head"><h2>What must be linked rather than retranslated?</h2></div>'+
 rs.filter(x=>['shared-exact-page-partial','same-work-distinct-locus','same-work-witness-uncertain'].includes(x.handling)).map(r=>'<div class="witness-entry"><div class="eyebrow">'+E(overlapTitle[r.handling])+'</div><h3>'+E(r.author)+' · '+E(r.locus)+'</h3>'+
 '<p>'+E(r.relation)+'</p><p><strong>Editorial action:</strong> '+E(r.editorialRule)+'</p>'+
 '<p class="small">Tajrīd source IDs: '+E((r.otherProjectRecordIds||[]).join(', ')||'Not established')+'</p>'+
 '<div class="source-links"><a href="#full/'+E(r.id)+'">Late Avicennism context →</a> '+(r.otherProjectLink?V.extLink(r.otherProjectLink,'Tajrīd sourcebook'):'')+'</div></div>').join('')+
 '<div class="section-head"><h2>Distinctive later works</h2></div>'+
 rs.filter(x=>x.handling==='primary-distinct'||x.handling==='independent-later-work').map(r=>'<p class="scope-row"><a href="#full/'+E(r.id)+'">'+E(r.author)+' — '+E(r.locus)+'</a> · <span class="small">'+E(r.editorialRule)+'</span></p>').join('')+
 '<div class="argument-context-panel"><h2>Division of labour</h2><ol>'+boundary.transferRules.map(x=>'<li>'+E(x)+'</li>').join('')+'</ol></div>';
 $('#pager').hidden=true;
};
const _sourceContext=P.full;
P.full=function(id){
 _sourceContext(id);
 const ov=overlaps.get(id);
 if(!ov||!ov.otherProjectLink)return;
 const box=$('.section-header');
 if(box)box.insertAdjacentHTML('afterend','<div class="critical-notice"><strong>Cross-project ownership:</strong> '+E(ov.relation)+' <strong>Do not count this as a new independent Tajrīd witness.</strong> '+V.extLink(ov.otherProjectLink,'Open existing Tajrīd sourcebook')+' · <a href="#tajrid-overlap">See exact overlap record</a>.</div>');
};
const _text=P.text;
P.text=function(id,n){
 _text(id,n);
 const ov=overlaps.get(id);if(!ov||!ov.otherProjectLink)return;
 const section=$('.section-header');
 if(section)section.insertAdjacentHTML('afterend','<p class="critical-notice">Shared source warning: '+E(ov.relation)+' '+V.extLink(ov.otherProjectLink,'See Tajrīd critical sourcebook')+'</p>');
};
const _home=P.home;
P.home=function(){
 return _home()+
 '<div class="section-head"><h2>Distinct from the Tajrīd project</h2></div>'+
 '<div class="tiles"><a class="tile" href="#post-asfar"><div class="eyebrow">Research focus</div><h3>What changed after the Asfār?</h3><p>Twelve carefully differentiated problems with direct evidence and explicit source gaps.</p></a>'+
 '<a class="tile" href="#tajrid-overlap"><div class="eyebrow">Cross-project integrity</div><h3>Reuse Tajrīd, do not duplicate it</h3><p>See two page-level overlaps, differences of locus and the division of translation ownership.</p></a></div>';
};
window.AVR.scope={dossiers,boundary};
})();