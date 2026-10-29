/* Gnamma scholarly Tajrid reader. No external JS dependencies or account sync. */
(()=>{'use strict';
const doc=window.TAJRID_DATA; if(!doc || !Array.isArray(doc.passages)) throw Error('Tajrid corpus missing');
const passages=doc.passages;const byId=new Map(passages.map((p,i)=>[p.id,i]));const bookByNumber=new Map(passages.map(p=>[p.id,p]));
const el=id=>document.getElementById(id);let savedError=false;
const defaults={i:0,language:'both',layout:'dual',scope:'chapter',font:17,theme:'paper',focus:0};
let state={...defaults};try{const v=JSON.parse(localStorage.getItem('gnamma_tajrid_preferences_v1')||'null');if(v && typeof v==='object')state={...defaults,...v};}catch(e){}
let desk=[];let deskUnsafe=false;
try{const data=JSON.parse(localStorage.getItem('gnamma_tajrid_desk_v1')||'[]');if(!Array.isArray(data))throw Error('Unexpected Reading Desk format');desk=data;}catch(e){deskUnsafe=true;}
const glossary=new Map(doc.glossary.map((v,i)=>[v.ar,i]));const modes=['paper','dark','sepia','contrast'];
const hide=(node)=>node.classList.add('visually-hidden');
function toast(s){el('sectionCount').textContent=s;}
function persist(){try{localStorage.setItem('gnamma_tajrid_preferences_v1',JSON.stringify(state));}catch(e){toast('Preferences could not be saved');}}
function persistDesk(next){if(deskUnsafe){alert('Saved notes are unreadable. Import a good backup; no changes have been written.');return false;}try{localStorage.setItem('gnamma_tajrid_desk_v1',JSON.stringify(next));desk=next;return true;}catch(e){alert('Cannot save: browser storage is unavailable. Export your existing notes first.');return false;}}
function normalize(s){return (s||'').normalize('NFKC').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u2066-\u2069]/g,'').toLocaleLowerCase();}
function node(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
function showDlg(title){el('dialogTitle').textContent=title;el('dialogBody').replaceChildren();if(!el('mainDialog').open)el('mainDialog').showModal();}
function line(parent,s){parent.appendChild(node('p','muted',s));}
function btn(parent,cls,text,onClick){const b=node('button',cls,text);b.type='button';b.addEventListener('click',onClick);parent.appendChild(b);return b;}
function openTerm(term){const t=doc.glossary.find(x=>x.ar===term || x.latin===term);if(!t)return;showDlg('Terminology · '+t.ar);const body=el('dialogBody');body.appendChild(node('h3','',t.ar+'  ·  '+t.latin));body.appendChild(node('p','',t.definition));line(body,'Lexical context: terms are defined from the edition’s technical glossary. Distinguish context-specific senses; this is not a complete historical dictionary.');}
function fillText(parent,text,english){
 const p=node('p',english?'eng':'arabic');if(!english){p.lang='ar';p.dir='rtl';}
 const parts=String(text||'').split(/(\[[\u0600-\u06ff\s]+\])/g);
 for(const part of parts){const m=part.match(/^\[([\u0600-\u06ff\s]+)\]$/);if(m && glossary.has(m[1].trim())){const b=node('button','term',part);b.title='Open technical entry';b.addEventListener('click',()=>openTerm(m[1].trim()));p.appendChild(b);}else p.appendChild(document.createTextNode(part));}
 parent.appendChild(p);
}
function unitElement(p,idx){const section=node('section','unit');section.id='p-'+p.id;section.dataset.id=p.id;
 const head=node('div','unit-head');head.appendChild(node('span','unit-number','§'+p.id));const actions=node('div','unit-actions');
 btn(actions,'','✎ Note',()=>openSave(p.id));btn(actions,'','⌁ Link',()=>{const u=location.href.split('#')[0]+'#p-'+p.id;navigator.clipboard?.writeText(u).then(()=>toast('Passage link copied')).catch(()=>toast(u));});head.appendChild(actions);section.appendChild(head);
 const body=node('div','unit-body');fillText(body,p.english,true);fillText(body,p.arabic,false);section.appendChild(body);
 if(Array.isArray(p.notes)&&p.notes.length){const notes=node('details','notes');const summary=node('summary','❧  Explanatory notes ('+p.notes.length+')');notes.appendChild(summary);const ol=node('ol');for(const n of p.notes){const li=node('li','',n.text);ol.appendChild(li);}notes.appendChild(ol);section.appendChild(notes);}
 return section;
}
function recalcButtons(){
 const p=passages[state.i];el('partName').textContent=p.division;el('chapterName').textContent=p.chapter;
 el('sectionCount').textContent='§'+p.id+' of 836 · '+(state.scope==='continuous'?'Continuous':state.scope==='chapter'?'Chapter':'Unit');
 el('prevBtn').disabled=state.i===0;el('nextBtn').disabled=state.i===passages.length-1;el('prevNum').textContent=passages[Math.max(0,state.i-1)].id;el('nextNum').textContent=passages[Math.min(passages.length-1,state.i+1)].id;
 el('dockPlace').textContent='§'+p.id+' · '+p.chapter.replace(/^Chapter\s*/, 'Ch. ');}
function paint(){
 const i=Math.min(Math.max(0,Number(state.i)||0),passages.length-1);state.i=i;document.body.dataset.theme=state.theme;document.body.dataset.language=state.language;document.body.dataset.layout=state.layout;document.body.dataset.focus=String(state.focus);
 document.documentElement.style.setProperty('--fs',state.font+'px');el('arabicBtn').setAttribute('aria-pressed',String(state.language==='both'||state.language==='ar'));el('englishBtn').setAttribute('aria-pressed',String(state.language==='both'||state.language==='en'));
 el('layoutSelect').value=state.layout;el('scopeSelect').value=state.scope;
 const selected=passages[i];const subset=(state.scope==='continuous'||state.focus===3)?passages:(state.scope==='chapter'?passages.filter(p=>p.chapter===selected.chapter && p.division===selected.division):[selected]);
 const fragment=document.createDocumentFragment();for(const p of subset)fragment.appendChild(unitElement(p,byId.get(p.id)));
 el('reader').replaceChildren(fragment);recalcButtons();persist();
 const target=el('p-'+selected.id);if(target){target.scrollIntoView({behavior:'auto',block:'start'});}
}
function jump(v){const i=typeof v==='number'?v:byId.get(String(v).replace(/^§/,''));if(i===undefined||i<0||i>=passages.length)return;state.i=i;history.replaceState(null,'','#p-'+passages[i].id);paint();}
function showContents(){showDlg('Contents & navigation');const body=el('dialogBody');const select=node('select');select.style.width='100%';select.style.padding='10px';
 const chapters=[];let last='';for(const p of passages){const key=p.division+'|'+p.chapter;if(key!==last){chapters.push({key,title:p.division+' · '+p.chapter,id:p.id});last=key;}}
 for(const ch of chapters){const opt=node('option','',ch.title);opt.value=ch.id;select.appendChild(opt);}select.addEventListener('change',()=>{el('mainDialog').close();jump(select.value);});body.appendChild(select);
 const inp=node('input');inp.inputMode='text';inp.placeholder='Jump to unit (§ number, e.g. 124)';body.appendChild(inp);btn(body,'primary','Go to §',()=>{el('mainDialog').close();jump(inp.value.trim());});
 for(const ch of chapters){btn(body,'toc-item',ch.title,()=>{el('mainDialog').close();jump(ch.id);});}}
function showSearch(){showDlg('Search the complete text');const body=el('dialogBody');const inp=node('input');inp.placeholder='Arabic, English, or § number';body.appendChild(inp);const output=node('div');body.appendChild(output);
 const run=()=>{output.replaceChildren();const q=normalize(inp.value.trim());if(q.length<2)return;let found=0;for(const p of passages){const raw=normalize(p.english+' '+p.arabic+' '+p.id);if(raw.includes(q)){if(found++>=70)break;const excerpt=p.english.replace(/\s+/g,' ').slice(0,135);btn(output,'search-result','§'+p.id+' · '+excerpt,()=>{el('mainDialog').close();jump(p.id);});}}if(!found)line(output,'No matches in the loaded edition.');if(found>=70)line(output,'Showing first 70 matches; refine your search.');};inp.addEventListener('input',run);inp.focus();}
function showGlossary(){showDlg('Technical dictionary');const body=el('dialogBody');const inp=node('input');inp.placeholder='Search Arabic, transliteration, or explanation';body.appendChild(inp);const out=node('div');body.appendChild(out);const build=()=>{out.replaceChildren();const term=normalize(inp.value);for(const g of doc.glossary){if(term&&!normalize(g.ar+' '+g.latin+' '+g.definition).includes(term))continue;btn(out,'gloss-row',g.ar+' · '+g.latin+'  —  '+g.definition.slice(0,155),()=>openTerm(g.ar));}};inp.addEventListener('input',build);build();}
function openSave(id){const p=bookByNumber.get(id);if(!p)return;el('savedPassage').value='§'+id;const selection=window.getSelection()?.toString()||'';el('savedQuote').value=selection.slice(0,5000);el('savedNote').value='';el('saveDialog').showModal();}
function showDesk(){showDlg('Reading Desk · private notes');const body=el('dialogBody');line(body,deskUnsafe?'WARNING: saved data has an unreadable format. Export raw data from browser storage before changing it.':'Your notes and bookmarks stay in this browser; there is no cloud sync. Export backups regularly.');
 btn(body,'primary','Export JSON backup',()=>{const out={schema:'gnamma-tajrid-desk-v1',records:desk,exported_at:new Date().toISOString()};downloadText('tajrid-reading-desk.json',JSON.stringify(out,null,2),'application/json');});
 const upload=node('input');upload.type='file';upload.accept='.json,application/json';body.appendChild(upload);upload.onchange=async()=>{const file=upload.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());if(data.schema!=='gnamma-tajrid-desk-v1'||!Array.isArray(data.records))throw Error('Not a recognized backup');if(!confirm('Import '+data.records.length+' records? Existing notes will be replaced only after a successful write.'))return;const wasUnsafe=deskUnsafe;deskUnsafe=false;if(persistDesk(data.records)){showDesk();}else{deskUnsafe=wasUnsafe;}}catch(e){alert('Import failed: '+e.message);}};
 if(!desk.length)line(body,'No saved notes yet. Select words and press ☆, or use ✎ Note beside a passage.');
 for(const item of desk){const wrap=node('div','desk-item');wrap.appendChild(node('strong','',item.passage+' · '+(item.note||'Unlabelled note').slice(0,65)));wrap.appendChild(node('p','muted',(item.quote||'').slice(0,260)));btn(wrap,'','Open source',()=>{el('mainDialog').close();jump(item.passage.replace('§',''));});btn(wrap,'','Delete',()=>{if(confirm('Delete this note?')){if(persistDesk(desk.filter(x=>x!==item)))showDesk();}});body.appendChild(wrap);}}
function downloadText(name,text,type='text/plain;charset=utf-8'){const b=new Blob([text],{type});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>URL.revokeObjectURL(a.href),800);a.remove();}
function showDownloads(){showDlg('Downloads & editions');const body=el('dialogBody');line(body,'Source-controlled working editions. The bilingual PDF has Arabic on the right; the English PDF contains the fuller explanatory apparatus. Files are included in the offline release bundle.');const list=node('div','downloads');body.appendChild(list);
 const assets=[['Complete bilingual PDF','Tusi_Tajrid_Complete_Bilingual_Translation.pdf'],['Annotated English PDF','Tusi_Tajrid_English_Annotated_Compact_Portrait.pdf'],['Bilingual editable Word','Tusi_Tajrid_Complete_Bilingual_Translation.docx'],['English editable Word','Tusi_Tajrid_English_Annotated_Compact_Portrait.docx']];
 for(const [title,file] of assets){const a=node('a','',title);a.href='downloads/'+file;a.download=file;const small=node('small','','Source file in this release package; GitHub Pages download requires the asset to be published.');a.appendChild(small);list.appendChild(a);}
 btn(body,'primary','Export English plain text',()=>downloadText('Tajrid_English.txt',passages.map(x=>'§'+x.id+' '+x.english).join('\n\n')));
 btn(body,'','Export Arabic plain text',()=>downloadText('Tajrid_Arabic.txt',passages.map(x=>'('+x.id+') '+x.arabic).join('\n\n')));
 line(body,'PDF and Word files are included in the downloads folder in this edition; retain those files when publishing the hosted reader.');}
function sourceInfo(){showDlg('Edition and source status');const b=el('dialogBody');for(const s of [doc.editorial_note,'Arabic basis: Ṭūsī’s matn embedded in Ḥillī, Kashf al-murād, Āmulī edition. Selected textual checks against al-Jalālī’s standalone edition. No full manuscript collation.','The annotations are an edited working apparatus drawing on al-Ḥillī, not a translation of his entire commentary. Their interpretations can remain disputable.','Technical dictionary contains '+doc.glossary.length+' source-edition entries; clicking an Arabic bracketed term opens its entry.'])b.appendChild(node('p','',s));}
const h=location.hash.match(/^#p-(\d+[ab]?)$/);if(h && byId.has(h[1]))state.i=byId.get(h[1]);
el('contentsBtn').onclick=showContents;el('jumpBtn').onclick=showContents;el('searchBtn').onclick=showSearch;el('glossaryBtn').onclick=showGlossary;el('notesBtn').onclick=showDesk;el('downloadBtn').onclick=showDownloads;el('sourceBtn').onclick=sourceInfo;
el('prevBtn').onclick=()=>jump(state.i-1);el('nextBtn').onclick=()=>jump(state.i+1);
el('closeDialog').onclick=()=>el('mainDialog').close();el('closeSave').onclick=()=>el('saveDialog').close();
el('saveBtn').onclick=()=>openSave(passages[state.i].id);
el('commitSave').onclick=()=>{const item={id:'n-'+Date.now()+'-'+Math.random().toString(36).slice(2),passage:el('savedPassage').value,quote:el('savedQuote').value,note:el('savedNote').value,created_at:new Date().toISOString()};if(persistDesk([...desk,item])){el('saveDialog').close();toast('Saved to Reading Desk');}};
el('copyBtn').onclick=()=>navigator.clipboard?.writeText(location.href).then(()=>toast('Link copied'));
el('arabicBtn').onclick=()=>{state.language=state.language==='ar'?'both':state.language==='both'?'en':'both';paint();};
el('englishBtn').onclick=()=>{state.language=state.language==='en'?'both':state.language==='both'?'ar':'both';paint();};
el('layoutSelect').onchange=e=>{state.layout=e.target.value;paint();};el('scopeSelect').onchange=e=>{state.scope=e.target.value;state.focus=0;paint();};
el('increaseFont').onclick=()=>{state.font=Math.min(25,state.font+1);paint();};el('decreaseFont').onclick=()=>{state.font=Math.max(13,state.font-1);paint();};
el('themeBtn').onclick=()=>{state.theme=modes[(modes.indexOf(state.theme)+1)%modes.length];paint();};
el('restoreFocus').onclick=()=>{state.focus=0;state.scope='chapter';paint();};
el('focusBtn').onclick=()=>{state.focus=(state.focus+1)%4;paint();toast(['Normal view','Focus: notes retained','Focus: no notes','Focus: continuous'][state.focus]);};
window.addEventListener('hashchange',()=>{const h=location.hash.match(/^#p-(\d+[ab]?)$/);if(h)jump(h[1]);});
paint();
})();
