/* Reading interface. Source records remain immutable in the Stage 84 data modules. */
(()=>{'use strict';
const DATA=window.__GNAMMA_SANANDAJI84||[];
const $=id=>document.getElementById(id);
const MAP=new Map(), IDMAP=new Map();
for(const r of DATA){if(!MAP.has(r.page))MAP.set(r.page,[]);MAP.get(r.page).push(r);IDMAP.set(r.id,r)}
const ORDER={upper:1,wasim:2,ruled:3,lower:4,lower_continuation:4,sidenote:5,corrector:6,paratext:7};
for(const group of MAP.values())group.sort((a,b)=>(ORDER[a.layer]||9)-(ORDER[b.layer]||9));
const oldKey='gnamma-sanandaji-vol1-ux-v2',key='gnamma-taqrib-reader-v1';
let stored={};try{stored=JSON.parse(localStorage.getItem(key)||'null')||{};if(!Object.keys(stored).length){const old=JSON.parse(localStorage.getItem(oldKey)||'null')||{};stored={last:old.last,bookmarks:old.bookmarks,notes:old.notes,appearance:old.theme}}}catch{}
const state={page:2,mode:'read',lang:'both',appearance:'light',font:19,arabicSize:27,leading:1.78,margins:false,bookmarks:[],notes:{},...stored};
const query=new URLSearchParams(location.search);let page=Number(query.get('p')||state.last||2);page=Number.isFinite(page)?Math.max(1,Math.min(280,Math.trunc(page))):2;
let lastFocus=null,flowEnd=page;
const save=()=>{state.last=page;try{localStorage.setItem(key,JSON.stringify(state))}catch{}};
const E=(tag,cls,value)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined&&value!==null)el.textContent=String(value);return el};
const btn=(value,onClick,cls='')=>{const x=E('button',cls,value);x.type='button';x.addEventListener('click',onClick);return x};
const row=(...children)=>{const x=E('div','row');for(const child of children)x.append(child);return x};
const iconLabel={upper:'Commentary',wasim:'Muḥammad Wasīm',lower:'Marginal commentary',lower_continuation:'Marginal commentary',ruled:'Ruled gloss',sidenote:'Marginal note',corrector:'Printed correction',paratext:'Printed text'};
const norm=s=>String(s??'').toLocaleLowerCase().normalize('NFKC').replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ').trim();
const weakStem=s=>norm(s).replace(/(^|\s)(وال|فال|بال|كال|ال|و|ف|ب|ك|ل)(?=[ء-ي]{3,})/g,'$1');
const arabic=r=>String(r.arabic||'');
const isMain=r=>r.layer==='upper';
const readableArabic=r=>!!arabic(r);
const singleLine=s=>String(s||'').replace(/\s+/g,' ').trim();
const tagKey=id=>'passage-'+id.replace(/[^\w-]/g,'-');
const currentLoc=()=>new URL(location.href);
const link=r=>{const u=currentLoc();u.searchParams.set('p',r.page);u.searchParams.set('unit',r.id);return u.toString()};
const citation=r=>`ʿAbd al-Qādir al-Sanandajī, Taqrīb al-Marām fī Sharḥ Tahdhīb al-Kalām, vol. I, p. ${r.page} (Būlāq, 1318 AH). Working English rendering; consult the printed source for textual verification.`;
function copy(value,control){try{if(navigator.clipboard?.writeText){navigator.clipboard.writeText(value).then(()=>{if(control){const s=control.textContent;control.textContent='Copied';setTimeout(()=>control.textContent=s,1300)}});return}}catch{}
 const t=E('textarea');t.value=value;t.style.cssText='position:fixed;top:30%;left:8%;width:84%;z-index:250;padding:14px';document.body.append(t);t.select();try{document.execCommand('copy')}catch{}t.remove()}
function inline(container,s){const parts=String(s).split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g);for(const p of parts){if(p.startsWith('**')&&p.endsWith('**'))container.append(E('strong',null,p.slice(2,-2)));else if(p.startsWith('*')&&p.endsWith('*'))container.append(E('em',null,p.slice(1,-1)));else container.append(document.createTextNode(p))}}
function readerText(value){return String(value||'').replace(/\[([^\]\n]{8,250})\]/g,(whole,note)=>/(?:not transcrib|not entered|not rendered|untranslated|omitt|printed (?:qualification|continuation|reading)|continues? (?:at|on|from|in)|remaining (?:printed|source)|needs? (?:collation|checking)|unverified|uncertain source|words? (?:not|still) (?:read|entered))/i.test(note)?' […] ':whole)}
function textBody(container,s,cls){const node=E('div',cls);inline(node,readerText(s));container.append(node)}
function originalArabic(container,s,lemma){if(!lemma){container.textContent=s;return}for(const chunk of String(s).split(/(\([^()]{1,135}\))/g)){if(/^\([^()]{1,135}\)$/.test(chunk)){const el=E('span','lemma',chunk);el.title='Parenthesized lemma in the printed upper text';container.append(el)}else container.append(document.createTextNode(chunk))}}
function piece(r,section){const el=E('section','passage');el.id=tagKey(r.id);el.dataset.id=r.id;
 // One sober layer label, no record IDs, proof counters, internal stages or editorial headings.
 const kind=E('div','kind',iconLabel[r.layer]||'Commentary');el.append(kind);
 const pair=E('div','text-pair');const ar=arabic(r);
 if(state.lang!=='en'&&ar){const original=E('div','ar');original.lang='ar';original.dir='rtl';originalArabic(original,ar,r.layer==='upper'&&/Taftazani|Taftāzānī|Tahdhīb|lemma/i.test(r.attribution||''));pair.append(original)}
 if(state.lang==='ar'&&!ar){const missing=E('div','small-note','Arabic transcription is not yet available for this passage.');missing.style.display='block';pair.append(missing)}
 if(state.lang!=='ar'){textBody(pair,r.english||'','en')}
 el.append(pair);
 if(!ar&&state.lang==='both'&&state.mode==='parallel'){const notice=E('div','small-note','Arabic passage not yet transcribed');notice.style.display='block';el.append(notice)}
 const actions=E('div','passage-tools');actions.append(btn('Copy passage',function(){copy((ar?ar+'\n\n':'')+(r.english||''),this)}),btn('Copy citation',function(){copy(citation(r),this)}),btn('Link',function(){copy(link(r),this)}));el.append(actions);
 section.append(el);return el}
function margins(rows){const other=rows.filter(r=>!isMain(r));if(!other.length)return null;
 const block=E('details','marginal-block');block.open=!!state.margins;
 const top=E('summary');top.append(E('span',null,'Marginal commentary'));top.append(E('span','marginal-kind',other.length===1?'1 passage':other.length+' passages'));block.append(top);
 const content=E('div','marginal-content');for(const r of other)piece(r,content);block.append(content);return block}
function pageArticle(n,flow=false){const wrap=E('section',flow?'flow-section':'page-section');wrap.id='page-'+n;
 const head=E('div','page-intro');const title=E('h2',null,n===1?'Title leaf':'Volume I · Page '+n);head.append(title);
 if(!flow){const b=btn(state.bookmarks.includes(n)?'★ Saved':'☆ Save page',function(){toggleBookmark(n);b.textContent=state.bookmarks.includes(n)?'★ Saved':'☆ Save page';b.classList.toggle('saved',state.bookmarks.includes(n))},'page-save'+(state.bookmarks.includes(n)?' saved':''));head.append(b)}wrap.append(head);
 if(n===1){const p=E('div','end-text','تقريب المرام في شرح تهذيب الكلام');p.lang='ar';p.dir='rtl';wrap.append(p);wrap.append(E('p','', 'ʿAbd al-Qādir al-Sanandajī al-Kurdistānī. Būlāq, 1318 AH.'));return wrap}
 const rows=MAP.get(n)||[],upper=rows.filter(isMain);if(upper.length){for(const r of upper)piece(r,wrap)}
 else if(!rows.length){wrap.append(E('p','', 'No page text is available.'))}
 const marg=margins(rows);if(marg){if(!upper.length)marg.open=true;wrap.append(marg)}
 if(!flow){const foot=E('div','page-footer');foot.append(btn('← Previous',()=>go(n-1)));foot.append(btn('Contents',()=>show('Contents',contents),'page-toc'));foot.append(btn('Next →',()=>go(n+1)));wrap.append(foot)}
 return wrap}
function navigateUrl(unit){const u=new URL(location.href);u.searchParams.set('p',page);if(unit)u.searchParams.set('unit',unit);else u.searchParams.delete('unit');try{history.replaceState(null,'',u.toString())}catch{}}
function syncControls(){const n=$('pageNumber');n.value=String(page);$('previous').disabled=page<=1;$('next').disabled=page>=280;
 for(const x of document.querySelectorAll('[data-reading-mode]')){x.classList.toggle('active',x.dataset.readingMode===state.mode);x.setAttribute('aria-pressed',String(x.dataset.readingMode===state.mode))}
 $('langButton').textContent=state.lang==='both'?'ع / EN':state.lang==='ar'?'العربية':'English';
 document.body.dataset.mode=state.mode;document.body.dataset.interior=String(page>2);document.documentElement.dataset.appearance=state.appearance;
 document.documentElement.style.setProperty('--reading-size',Math.max(16,Math.min(28,Number(state.font)))+'px');document.documentElement.style.setProperty('--arabic-size',Math.max(20,Math.min(42,Number(state.arabicSize)))+'px');document.documentElement.style.setProperty('--leading',Math.max(1.4,Math.min(2.5,Number(state.leading))));
 $('focusControls').hidden=state.mode!=='focus';$('focusPrev').disabled=page<=1;$('focusNext').disabled=page>=280}
function render(){syncControls();const main=$('text');main.replaceChildren();if(state.mode==='flow'){flowEnd=page;extendFlow(7)}else{main.append(pageArticle(page))}save()}
function go(n,unit){if(!Number.isFinite(Number(n)))return;page=Math.max(1,Math.min(280,Math.trunc(Number(n))));navigateUrl(unit);if(state.mode==='flow'&&unit)state.mode='read';render();if(unit)requestAnimationFrame(()=>document.getElementById(tagKey(unit))?.scrollIntoView({behavior:'smooth',block:'center'}));else window.scrollTo({top:0,behavior:'instant'})}
function setMode(m){state.mode=m;render();window.scrollTo({top:0,behavior:'instant'})}
function extendFlow(num){const host=$('text');const start=flowEnd;for(let i=start;i<=Math.min(280,start+num-1);i++){host.append(pageArticle(i,true))}flowEnd=Math.min(281,start+num);
 const old=host.querySelector('.flow-more');if(old)old.remove();if(flowEnd<=280)host.append(btn('Continue reading',()=>extendFlow(7),'flow-more'));else host.append(E('p','end-text','End of Volume I'))}
function toggleBookmark(p){const a=new Set(state.bookmarks);a.has(p)?a.delete(p):a.add(p);state.bookmarks=[...a].sort((x,y)=>x-y);save()}
let restoreFocus=null;function show(title,draw){restoreFocus=document.activeElement;$('sheetTitle').textContent=title;const body=$('sheetBody');body.replaceChildren();draw(body);$('backdrop').hidden=false;$('closeSheet').focus();document.body.style.overflow='hidden'}
function close(){if($('backdrop').hidden)return;$('backdrop').hidden=true;document.body.style.overflow='';$('sheetBody').replaceChildren();restoreFocus?.focus?.();restoreFocus=null}
function section(root,title){const x=E('h3',null,title);root.append(x);return x}
function field(tag,props={}){const e=E(tag);for(const [k,v] of Object.entries(props))if(v!==null&&v!==undefined)e.setAttribute(k,v);return e}
function contents(root){const finder=field('input',{type:'search',placeholder:'Find a section or page','aria-label':'Filter contents'});root.append(finder);const list=E('div');root.append(list);
 const labels=[];for(let n=1;n<=280;n++){let r=(MAP.get(n)||[]).find(z=>z.layer==='upper'&&z.title);let name=String(r?.title||'').replace(/^The whole upper text on the leaf$/i,'');labels.push({page:n,title:name|| (n===1?'Title leaf':'')})}
 function draw(){list.replaceChildren();const q=norm(finder.value);const selected=labels.filter(r=>!q||norm(r.page+' '+r.title).includes(q));if(selected.length===0){list.append(E('p','', 'No matching sections.'));return}
 for(let i=0;i<selected.length;i++){const r=selected[i];const b=btn('',()=>{close();go(r.page)},'result');const label=r.title?`Page ${r.page} · ${r.title}`:`Page ${r.page}`;b.append(E('strong',null,label));list.append(b)} }
 finder.addEventListener('input',draw);draw();}
function searchPanel(root,preset=''){const search=field('input',{type:'search',placeholder:'Search Arabic or English text','aria-label':'Search text'});search.value=preset;root.append(search);
 const opts=E('div','row');const mode=E('select');for(const [v,label] of [['normalized','Flexible spelling'],['exact','Exact'],['stem','Approximate Arabic prefixes']]){const x=E('option',null,label);x.value=v;mode.append(x)}const part=E('select');for(const [v,label] of [['all','All passages'],['upper','Main commentary'],['lower','Marginal notes']]){const x=E('option',null,label);x.value=v;part.append(x)}opts.append(mode,part);root.append(opts);
 const count=E('p'),results=E('div');root.append(count,results);
 function match(r,q){if(part.value==='upper'&&r.layer!=='upper')return false;if(part.value==='lower'&&r.layer==='upper')return false;
 const a=r.arabic||r.arabic_anchors||'',b=r.english||'';if(mode.value==='exact')return (a+b).toLocaleLowerCase().includes(q.toLocaleLowerCase());const f=mode.value==='stem'?weakStem:norm;return f(a).includes(f(q))||f(b).includes(f(q))}
 function draw(){const q=search.value.trim();results.replaceChildren();if(q.length<2){count.textContent='Enter at least two characters.';return}const all=DATA.filter(r=>match(r,q));count.textContent=`${all.length} passages found`;for(const r of all.slice(0,70)){const phrase=singleLine(r.english||r.arabic||'');let hit=norm(phrase).indexOf(norm(q));const context=phrase.slice(Math.max(0,hit-35),Math.max(0,hit-35)+160);const b=btn('',()=>{close();go(r.page,r.id)},'result');b.append(E('strong',null,`Page ${r.page} · ${iconLabel[r.layer]||'Note'}`));b.append(E('span',null,context||singleLine(r.arabic).slice(0,160)));results.append(b)}if(all.length>70)root.append(E('small',null,'Showing first 70 passages. Refine search for more precise results.'))}
 [search,mode,part].forEach(e=>e.addEventListener('input',draw));draw();search.focus()}
function glossary(root){const TERMS=[['جوهر','Substance','The subject as distinct from an inhering accident.'],['عرض','Accident','What inheres in a subject.'],['وجود','Existence','Existence, understood within the specific argument.'],['عدم','Nonexistence','Absence or nonbeing.'],['ماهية','Quiddity','What a thing is; its essence or whatness.'],['قدم','Pre-eternity','Being without temporal beginning.'],['حدوث','Origination','Coming to be after nonexistence.'],['ممكن','Possible','Contingent or possible in itself.'],['واجب','Necessary','Necessary existence or necessity according to context.'],['العلة','Cause','That upon which an effect depends.'],['المعلول','Effect','What depends upon a cause.'],['الدور','Circularity','Circular dependency in proof.'],['التسلسل','Regress','An explanatory or causal chain.'],['النفس','Soul','Soul and its faculties.'],['الزمان','Time','Succession and temporality.'],['الحركة','Motion','Change or motion.'],['الخلاء','Void','Vacuum or empty space.'],['الكلام','Kalām','Theological inquiry.']];
 const inp=field('input',{type:'search',placeholder:'Find a term'});root.append(inp);const out=E('div');root.append(out);function draw(){out.replaceChildren();const q=norm(inp.value);for(const [ar,en,desc] of TERMS.filter(x=>!q||norm(x.join(' ')).includes(q))){const item=E('div','glossary-item');item.append(E('div','term',ar),E('strong',null,en),E('p',null,desc),btn('Find in the book',()=>show('Search',el=>searchPanel(el,ar))));out.append(item)}}inp.addEventListener('input',draw);draw()}
function saved(root){root.append(btn(state.bookmarks.includes(page)?'Remove current bookmark':'Bookmark this page',()=>{toggleBookmark(page);show('Saved pages & notes',saved)},'primary'));
 section(root,'My note on page '+page);const area=field('textarea',{placeholder:'Write your private notes here'});area.value=state.notes[page]||'';root.append(area,btn('Save note',()=>{state.notes[page]=area.value;save();show('Saved pages & notes',saved)},'primary'));
 section(root,'Bookmarked pages');if(!state.bookmarks.length)root.append(E('p',null,'No bookmarks yet.'));
 for(const p of state.bookmarks){root.append(btn('Page '+p,()=>{close();go(p)},'result'))}
 section(root,'Export');root.append(btn('Download notes as JSON',()=>{const blob=new Blob([JSON.stringify({book:'Taqrīb al-Marām, Volume I',bookmarks:state.bookmarks,notes:state.notes},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=E('a');a.href=url;a.download='Taqrib-al-Maram-Vol-I-notes.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}));root.append(E('p',null,'Notes are stored in your browser, not sent to a server.'))}
function settings(root){const appearance=E('div','row');section(root,'Appearance');for(const [value,label] of [['light','Light'],['sepia','Sepia'],['dark','Dark']])appearance.append(btn(label,()=>{state.appearance=value;syncControls();save()}));root.append(appearance);
 function range(label,value,min,max,step,fn){const r=E('div');const l=E('label',null,label+' · '+value),inp=field('input',{type:'range',min,max,step});inp.value=value;inp.style.width='100%';inp.addEventListener('input',()=>{l.textContent=label+' · '+inp.value;fn(Number(inp.value));syncControls();save()});r.append(l,inp);root.append(r)}
 section(root,'Typography');range('English size',state.font,16,28,1,x=>state.font=x);range('Arabic size',state.arabicSize,20,42,1,x=>state.arabicSize=x);range('Line spacing',state.leading,1.4,2.5,.05,x=>state.leading=x);
 section(root,'Reading');const cb=field('input',{type:'checkbox'});cb.checked=state.margins;cb.addEventListener('change',()=>{state.margins=cb.checked;render();save()});const opt=E('label','option-row');opt.append(cb,E('span',null,'Expand marginal commentary by default'));root.append(opt);
 root.append(E('div','divider'));root.append(btn('Print or save reading as PDF',()=>{close();window.print()}));
 section(root,'About this edition');root.append(E('p',null,'Text based on the Būlāq print of 1318 AH. The Arabic transcription and English rendering are incomplete in places; some passages are summaries. The source scan, full editorial notes, and the critical apparatus are held separately. The online reader should not be cited as a definitive critical edition.'));const href=E('a',null,'Edition information and source details');href.href='editorial/CURRENT_PROJECT_STATUS.md';root.append(href)}
function language(root){section(root,'Language');for(const [value,label] of [['both','Arabic and English'],['en','English only'],['ar','Arabic only']])root.append(btn(label,()=>{state.lang=value;close();render();save()},'result'))}
function tools(root){for(const [title,render] of [['Contents',contents],['Search',searchPanel],['Dictionary',glossary],['Saved pages & notes',saved],['Reading settings',settings],['Language',language]])root.append(btn(title,()=>show(title,render),'result'))}
$('previous').onclick=()=>go(page-1);$('next').onclick=()=>go(page+1);
$('pageNumber').addEventListener('change',e=>go(Number(e.target.value)));
for(const b of document.querySelectorAll('[data-reading-mode]'))b.onclick=()=>setMode(b.dataset.readingMode);
$('contentsButton').onclick=()=>show('Contents',contents);$('searchButton').onclick=()=>show('Search',searchPanel);$('notesButton').onclick=()=>show('Saved pages & notes',saved);$('settingsButton').onclick=()=>show('Reading settings',settings);$('langButton').onclick=()=>show('Language',language);$('toolsButton').onclick=()=>show('Reading tools',tools);$('exitFocus').onclick=()=>setMode('read');$('focusPrev').onclick=()=>go(page-1);$('focusNext').onclick=()=>go(page+1);$('closeSheet').onclick=close;
$('backdrop').addEventListener('click',e=>{if(e.target===$('backdrop'))close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('backdrop').hidden)close();else if(state.mode==='focus')setMode('read');return}if(e.target.closest('input,textarea,select,button,[contenteditable]')||!$('backdrop').hidden)return;if(e.key==='ArrowLeft')go(page-1);else if(e.key==='ArrowRight')go(page+1);else if(e.key==='/'){e.preventDefault();show('Search',searchPanel)}});
$('text').setAttribute('aria-live','off');render();const requested=query.get('unit');if(requested)requestAnimationFrame(()=>document.getElementById(tagKey(requested))?.scrollIntoView({block:'center'}));
})();