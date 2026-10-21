/* Darūrī Ask AI: optional third-party embed and user-controlled AI handoff.
   No API key, automatic prompts, response scraping, or cross-origin access. */
(function (global) {
'use strict';
if (global.DaruriAskAI) return;
const EMBED='https://free.ai/embed/chat/';
const PREF='gnamma-daruri-ask-ai-pref-v1', DRAFT='gnamma-daruri-ask-ai-draft-v1';
const LIMIT=60000;
let reader=null, overlay=null, opener=null, savedOverflow='', iframeLoaded=false;
const storedPrefs=read(localStorage,PREF,{});
let prefs={mode:storedPrefs?.mode==='own'?'own':'free',hideFree:storedPrefs?.hideFree===true};
let draft=read(sessionStorage,DRAFT,null);
let savedNotice='',connected=false;
function read(store,key,fallback){try{return JSON.parse(store.getItem(key))??fallback;}catch(_){return fallback;}}
function write(store,key,value){try{store.setItem(key,JSON.stringify(value));return true;}catch(_){return false;}}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function $ (sel){return overlay?.querySelector(sel)||null;}
function brief(s,n){const x=String(s||'');return x.length>n?x.slice(0,n)+'\n[Excerpt shortened for this question]':x;}
function chosenText(){
 const s=global.getSelection?.();if(!s||s.isCollapsed||!s.rangeCount)return null;
 const node=s.anchorNode?.nodeType===1?s.anchorNode:s.anchorNode?.parentElement;
 const side=node?.closest?.('.passage-ar,.passage-en');const grid=side?.closest?.('.passage-grid');
 if(!grid)return null;
 const value=s.toString().trim();if(!value||value.length>4500)return null;
 const section=String(grid.closest('[data-reading-section]')?.dataset.readingSection||reader?.state?.n||'');
 return {kind:'quote',section,segment:Number(grid.dataset.segment||0),lang:side.classList.contains('passage-ar')?'ar':'en',quote:value,offset:0};
}
function nonReadingLocus(){
 const state=reader?.state||{},book=reader?.book||{},route=state.route||'';
 if(route==='study'){
  const params=new URLSearchParams((global.location.hash||'').split('?').slice(1).join('?'));
  const id=params.get('topic')||state.studyTopic||'';
  const lesson=global.DARURI_STUDY_DATA?.lessons?.find(x=>x.id===id);
  if(lesson){
   const level=['basic','intermediate','advanced'].includes(params.get('level'))?params.get('level'):['basic','intermediate','advanced'].includes(state.studyLevel)?state.studyLevel:'basic';
   const summary=String(lesson.summary||lesson.levels?.[level]?.objective||'').slice(0,900);
   return {key:'lesson:'+id+':'+level,target:{kind:'lesson',lesson:id,level},ref:'Study guide · '+lesson.title,heading:lesson.title,arabic:'',english:'',supplement:summary};
  }
 }
 if(route==='glossary'){
  const term=String(state.glossaryQuery||'').trim(),item=book.glossary?.find(x=>x.term===term);
  if(item)return {key:'dictionary:'+term,target:{kind:'dictionary',term},ref:'Dictionary · '+term,heading:term,arabic:'',english:'',supplement:String(item.definition||'').slice(0,900)};
 }
 if(route==='index'){
  const term=String(state.indexFocus?.term||state.indexQuery||'').trim(),item=book.index?.find(x=>x.term===term);
  if(item)return {key:'index:'+term,target:{kind:'index',term},ref:'Concept index · '+term,heading:term,arabic:'',english:'',supplement:(item.sub||[]).map(x=>x.label).slice(0,15).join(' · ')};
 }
 return {key:'general',target:null,ref:'General inquiry',arabic:'',english:'',heading:'',supplement:''};
}
function locus(target){
 if(!reader||(!target&&reader.state?.route!=='reader'))return nonReadingLocus();
 const section=String(target?.section|| (reader.state?.route==='reader'?reader.state?.n:'')||'');
 const item=reader.sections?.get(section);
 if(!item)return {key:'general',target:null,ref:'General inquiry',arabic:'',english:'',heading:''};
 const isPara=target&&['paragraph','quote'].includes(target.kind)&&Number.isInteger(Number(target.segment))&&item.segments?.[Number(target.segment)];
 const seg=isPara?Number(target.segment):null;
 const t=target?(target.kind==='quote'?target:isPara?{kind:'paragraph',section,segment:seg,lang:target.lang==='ar'?'ar':'en'}:{kind:'section',section}):{kind:'section',section};
 const segments=seg!==null?[item.segments[seg]]:item.segments||[];
 const ar=segments.map(x=>x.ar||x.vocalized||'').filter(Boolean).join('\n');
 const en=segments.map(x=>x.en||'').filter(Boolean).join('\n');
 return {key:section+':'+(seg??'section')+':'+(target?.quote||''),target:t,ref:'§'+section+(seg!==null?' · passage '+(seg+1):''),heading:item.title||'',arabic:brief(target?.lang==='ar'&&target?.kind==='quote'?target.quote:ar,1900),english:brief(target?.lang==='en'&&target?.kind==='quote'?target.quote:en,1900)};
}
const QUESTIONS={explain:'Explain the argument carefully. Distinguish what Ibn Rushd states from any further interpretation.',translate:'Translate closely, identifying consequential Arabic grammar and technical vocabulary.',analyse:'Identify the claim, premises, inferential steps and any objections. Distinguish certainty from conjecture.',terms:'Explain the technical terms in their local context and distinguish plausible alternative meanings.'};
function prepare(loc,kind='explain'){
 const lines=[QUESTIONS[kind]||QUESTIONS.explain,(loc.arabic||loc.english)?'Use the supplied primary-text passage; do not invent quotations or citations. If uncertain, say so.':'Use the supplied editorial study context only as orientation, not as a verified primary-text quotation. If uncertain, say so.','Work: Ibn Rushd, al-Ḍarūrī fī uṣūl al-fiqh.',loc.ref+(loc.heading?' — '+loc.heading:'')];
 if(loc.arabic)lines.push('Arabic:\n'+loc.arabic);
 if(loc.english)lines.push('English translation:\n'+loc.english);
 if(loc.supplement)lines.push('Editorial reader context (not a primary-text quotation):\n'+loc.supplement);
 if(!loc.arabic&&!loc.english&&!loc.supplement)lines.push('No source passage attached. Ask for the exact text before offering claims about any particular section.');
 return lines.join('\n\n');
}
function fresh(loc){return {key:loc.key,target:loc.target,ref:loc.ref,kind:'explain',prompt:prepare(loc),answer:'',provider:'',comments:'',updated:Date.now()};}
function persist(){if(!overlay)return;draft.prompt=$('#gn-ai-prompt')?.value||draft.prompt;draft.answer=$('#gn-ai-answer')?.value||'';draft.comments=$('#gn-ai-comments')?.value||'';draft.provider=$('#gn-ai-provider')?.value||'';draft.updated=Date.now();if(!write(sessionStorage,DRAFT,draft))status('This browser cannot retain the draft. Copy it before leaving.');}
function status(message){const el=$('#gn-ai-status');if(el){el.textContent=message;el.hidden=!message;}}
function sourceLabel(){return draft?.ref||'No passage selected';}
function setMode(mode){
 if(!overlay)return;
 const free=!prefs.hideFree&&mode==='free';prefs.mode=free?'free':'own';write(localStorage,PREF,prefs);
 $('[data-ai-mode="free"]')?.classList.toggle('gn-ai-current',free);
 $('[data-ai-mode="own"]')?.classList.toggle('gn-ai-current',!free);
 $('[data-ai-mode="free"]')?.setAttribute('aria-selected',String(free));
 $('[data-ai-mode="own"]')?.setAttribute('aria-selected',String(!free));
 $('#gn-ai-free').hidden=!free;$('#gn-ai-own').hidden=free;
 $('#gn-ai-import-label').textContent=free?'Import Free.ai answer':'Import your AI answer';
 $('#gn-ai-free-tab').hidden=prefs.hideFree;$('#gn-ai-restore').hidden=!prefs.hideFree;
 if(free&&!iframeLoaded){const frame=$('#gn-ai-frame');frame.src=EMBED;iframeLoaded=true;}
}
function createModal(){
 const host=document.createElement('div');host.id='gn-ai-overlay';host.className='gn-ai-overlay';host.setAttribute('role','presentation');
 host.innerHTML=`<section class="gn-ai-dialog" role="dialog" aria-modal="true" aria-labelledby="gn-ai-title" tabindex="-1">
 <header class="gn-ai-head"><div><p class="gn-ai-overline">DARŪRĪ · READING TOOLS</p><h2 id="gn-ai-title">Ask AI</h2></div><button type="button" class="gn-ai-close" data-ai="close" aria-label="Close Ask AI">×</button></header>
 <div class="gn-ai-scroll">
 <p class="gn-ai-context">Source: <strong id="gn-ai-ref"></strong></p>
 <div class="gn-ai-tabs" role="tablist" aria-label="AI option"><button type="button" role="tab" data-ai-mode="free" id="gn-ai-free-tab">Embedded Free.ai</button><button type="button" role="tab" data-ai-mode="own">Use my AI</button></div>
 <label class="gn-ai-label" for="gn-ai-task">Question type</label><select id="gn-ai-task"><option value="explain">Explain</option><option value="translate">Translate</option><option value="analyse">Analyse argument</option><option value="terms">Technical terms</option></select>
 <label class="gn-ai-label" for="gn-ai-prompt">Prepared question <small>(editable)</small></label><textarea id="gn-ai-prompt" rows="5" spellcheck="true" dir="auto"></textarea>
 <div class="gn-ai-tools"><button type="button" data-ai="copy" class="gn-ai-main">Copy question</button><button type="button" data-ai="share">Share question…</button><button type="button" data-ai="reset">New question</button></div>
 <section id="gn-ai-free" aria-label="Embedded Free.ai"><p class="gn-ai-help">Paste your question into Free.ai. Copy its answer back to the field below. Darūrī cannot read this separate service automatically.</p><iframe id="gn-ai-frame" title="Free.ai embedded conversation" loading="lazy" allow="clipboard-write" referrerpolicy="strict-origin-when-cross-origin"></iframe><p class="gn-ai-help">Blank, unavailable or out of free credits? <a href="https://free.ai/embed/chat/" rel="noopener noreferrer" target="_blank">Open directly ↗</a> or switch to your own AI.</p><button type="button" data-ai="hide-free" class="gn-ai-subtle">Hide Free.ai on this device</button></section>
 <section id="gn-ai-own" hidden aria-label="Use your preferred AI"><p class="gn-ai-help">Copy or share the question above. Open the AI you already use, paste it, then return with the answer. Providers may require accounts or impose their own limits.</p><div class="gn-ai-links"><a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">ChatGPT ↗</a><a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer">Gemini ↗</a><a href="https://claude.ai/" target="_blank" rel="noopener noreferrer">Claude ↗</a><a href="https://duck.ai/" target="_blank" rel="noopener noreferrer">Duck.ai ↗</a></div><button type="button" data-ai="restore-free" id="gn-ai-restore">Show Free.ai again</button></section>
 <div class="gn-ai-import" id="gn-ai-import"><h3 id="gn-ai-import-label">Import AI answer</h3><label class="gn-ai-label" for="gn-ai-provider">Source/provider <small>(optional)</small></label><input id="gn-ai-provider" placeholder="e.g. ChatGPT, Gemini, Free.ai" autocomplete="off"/><label class="gn-ai-label" for="gn-ai-answer">Paste the AI response</label><textarea id="gn-ai-answer" rows="6" dir="auto" placeholder="Paste or type the response here. Nothing is saved automatically."></textarea><div class="gn-ai-tools"><button type="button" data-ai="paste">Paste from clipboard</button></div><label class="gn-ai-label" for="gn-ai-comments">Your own reflection <small>(optional)</small></label><textarea id="gn-ai-comments" rows="2" placeholder="Your assessment, correction or follow-up…" dir="auto"></textarea><p class="gn-ai-disclaimer">AI output is unverified. Review all translations and sources. Only text you deliberately paste and save enters your private Reading Desk.</p><div class="gn-ai-tools gn-ai-savebar"><button type="button" class="gn-ai-main" data-ai="save">Save as AI-assisted note</button><a href="#bookmarks" data-ai="desk" id="gn-ai-desk-link">Reading Desk ↗</a></div></div>
 <p class="gn-ai-status" id="gn-ai-status" role="status" aria-live="polite" hidden></p>
 </div></section>`;
 document.body.append(host);return host;
}
function updateFields(){
 $('#gn-ai-ref').textContent=sourceLabel();$('#gn-ai-task').value=draft.kind||'explain';
 $('#gn-ai-prompt').value=draft.prompt||'';$('#gn-ai-answer').value=draft.answer||'';
 $('#gn-ai-provider').value=draft.provider||'';$('#gn-ai-comments').value=draft.comments||'';
}
function open(target){
 const loc=locus(target||chosenText());
 if(!draft||!draft.key) draft=fresh(loc);
 else if(draft.key!==loc.key){
  if(draft.answer?.trim()&&!global.confirm('Your previous AI answer has not been saved. Start a new question for this passage?')){ /* retain draft */ }
  else draft=fresh(loc);
 }
 if(overlay){updateFields();setMode(prefs.mode);overlay.querySelector('.gn-ai-dialog')?.focus({preventScroll:true});return;}
 opener=document.activeElement;savedOverflow=document.body.style.overflow;
 overlay=createModal();document.body.classList.add('gn-ai-open');document.body.style.overflow='hidden';
 updateFields();setMode(prefs.mode);overlay.querySelector('.gn-ai-dialog')?.focus({preventScroll:true});
 status(savedNotice);savedNotice='';
}
function close(){if(!overlay)return;persist();overlay.remove();overlay=null;iframeLoaded=false;document.body.style.overflow=savedOverflow;document.body.classList.remove('gn-ai-open');if(opener?.isConnected)opener.focus({preventScroll:true});opener=null;}
async function copyQuestion(){const s=$('#gn-ai-prompt')?.value||'';try{await navigator.clipboard.writeText(s);status('Question copied. Paste it into the AI chat.');}catch(_){const f=$('#gn-ai-prompt');f.focus();f.select();status('Select and copy the highlighted question using your device controls.');}}
async function shareQuestion(){if(!navigator.share){copyQuestion();return;}try{await navigator.share({title:'Darūrī · Ask AI',text:$('#gn-ai-prompt').value});status('Question shared.');}catch(e){if(e?.name!=='AbortError')status('Sharing unavailable. Use Copy question instead.');}}
async function pasteAnswer(){const el=$('#gn-ai-answer');try{const value=await navigator.clipboard.readText();if(!value){status('Clipboard is empty. Use the normal Paste command.');return;}el.value=el.value?el.value+'\n\n'+value:value;persist();status('Answer imported. Review it before saving.');}catch(_){el.focus();status('Your browser may require the normal Paste command. Tap the answer field and paste.');}}
function save(){persist();const answer=draft.answer?.trim()||'';if(!answer){$('#gn-ai-answer').focus();status('Paste the answer before saving.');return;}
 const provider=(draft.provider?.trim()|| (prefs.mode==='free'?'Free.ai':'My AI (provider not specified)')).slice(0,180);
 const question=(draft.prompt||'').trim();const comments=(draft.comments||'').trim();
 const body=['AI-ASSISTED NOTE — imported answer, not independently verified','Provider: '+provider,'Source: '+sourceLabel(),'Question:\n'+question,'AI response:\n'+answer, ...(comments?['My reflection:\n'+comments]:[])].join('\n\n');
 if(body.length>LIMIT){status('This answer is too long for a single Reading Desk note ('+body.length+' characters). Copy it externally or shorten it; nothing has been erased.');return;}
 const result=reader?.desk?.saveAIAssistedNote?.({target:draft.target,title:'AI · '+sourceLabel()+' · '+(QUESTIONS[draft.kind]||QUESTIONS.explain).split('.')[0],body,provider,question});
 if(!result?.ok){status(result?.error||'Reading Desk saving is unavailable. The pasted answer is still here; copy or export it before leaving.');return;}
 const savedTarget=draft.target;draft=fresh(locus(savedTarget));try{sessionStorage.removeItem(DRAFT);}catch(_){}
 updateFields();status('Saved as an AI-assisted personal note. Open Reading Desk to review it.');
}
function refreshQuestion(){persist();const loc=locus(draft?.target);draft.kind=$('#gn-ai-task').value;draft.prompt=prepare(loc,draft.kind);$('#gn-ai-prompt').value=draft.prompt;persist();}
function reset(){persist();if(draft?.answer?.trim()&&!global.confirm('Discard the current unsaved answer and begin a new question?'))return;draft=fresh(locus(null));updateFields();persist();status('New question prepared.');}
function hideFree(hide){persist();prefs.hideFree=hide;prefs.mode=hide?'own':'free';write(localStorage,PREF,prefs);if(hide){const f=$('#gn-ai-frame');f.removeAttribute('src');iframeLoaded=false;}setMode(prefs.mode);status(hide?'Embedded Free.ai hidden on this device; your own AI and note import remain available.':'Free.ai restored.');}
function targetForButton(btn){if(btn.dataset.aiSection){const t={kind:'section',section:btn.dataset.aiSection};if(btn.hasAttribute('data-ai-segment'))return {kind:'paragraph',section:t.section,segment:Number(btn.dataset.aiSegment),lang:'en'};return t;}return null;}

const AI_ICON="<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M11 2.5l2.25 6.25L19.5 11l-6.25 2.25L11 19.5l-2.25-6.25L2.5 11l6.25-2.25zM19.2 16l.75 2.05L22 18.8l-2.05.75L19.2 21.6l-.75-2.05-2.05-.75 2.05-.75z\"/></svg>";
function syncToolbar(){
 let top=document.getElementById('readerAskAIAction');
 if(!top){
  top=document.getElementById('readerSaveAction');
  if(top){
   top.removeAttribute('data-bookmark');top.removeAttribute('aria-pressed');
   top.id='readerAskAIAction';top.dataset.aiLaunch='1';top.setAttribute('aria-haspopup','dialog');
   top.setAttribute('aria-label','Ask AI about selected text or this section');top.title='Ask AI';
   top.innerHTML=AI_ICON+'<span class="sr-only">Ask AI</span>';
   top.closest('.reader-action-slot')?.setAttribute('aria-label','Ask AI, copy and share');
   const copy=document.getElementById('readerCopyAction'),share=document.getElementById('readerShareAction');
   if(copy)copy.title='Copy section';if(share)share.title='Share section';
  }
 }
 let globalButton=document.getElementById('globalAskAIAction');
 if(!globalButton){
  const search=document.getElementById('searchBtn');
  if(search){
   globalButton=search.cloneNode(false);globalButton.id='globalAskAIAction';
   globalButton.className=search.className+' gn-ai-global-control';
   globalButton.removeAttribute('aria-expanded');globalButton.removeAttribute('aria-controls');
   globalButton.dataset.aiLaunch='1';globalButton.setAttribute('aria-haspopup','dialog');
   globalButton.setAttribute('aria-label','Ask AI about this page');globalButton.title='Ask AI';
   globalButton.innerHTML=AI_ICON;search.after(globalButton);
  }
 }
 if(globalButton)globalButton.hidden=reader?.state?.route==='reader';
 document.querySelector('#leftNav .gn-ai-nav')?.remove();
}
function inject(){syncToolbar();}
let scheduled=false;
function scheduleInject(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;inject();});}
function keydown(event){if(!overlay)return;
 if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();return;}
 if(event.key!=='Tab')return;
 const controls=[...overlay.querySelectorAll('button,a,input,textarea,select,[tabindex="0"]')].filter(e=>!e.disabled&&!e.hidden&&e.getClientRects().length);
 if(!controls.length)return;const first=controls[0],last=controls.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
}
function onClick(event){
 const launch=event.target.closest?.('[data-ai-launch]');if(launch){event.preventDefault();event.stopPropagation();const target=launch.dataset.aiSelection?(reader?.desk?.selectionTarget?.()||chosenText()):targetForButton(launch);if(launch.closest('#leftNav'))document.getElementById('closeNav')?.click();open(target);return;}
 if(!overlay)return;
 if(event.target===overlay){close();return;}
 const mode=event.target.closest?.('[data-ai-mode]');if(mode){persist();setMode(mode.dataset.aiMode);return;}
 const action=event.target.closest?.('[data-ai]')?.dataset.ai;
 if(!action)return;
 if(action==='close')close();else if(action==='copy')copyQuestion();else if(action==='share')shareQuestion();
 else if(action==='paste')pasteAnswer();else if(action==='save')save();else if(action==='reset')reset();
 else if(action==='hide-free')hideFree(true);else if(action==='restore-free')hideFree(false);
 else if(action==='desk')close();
}
function install(){document.addEventListener('click',onClick,true);document.addEventListener('keydown',keydown,true);
 document.addEventListener('input',event=>{if(overlay?.contains(event.target))persist();});
 document.addEventListener('change',event=>{if(event.target?.id==='gn-ai-task')refreshQuestion();});
 document.addEventListener('visibilitychange',()=>{if(overlay)persist();});
 // Text-selection icon is rendered by Reading Desk, without polling.
 const host=document.getElementById('mainContent');if(host)new MutationObserver(scheduleInject).observe(host,{childList:true,subtree:true});
 inject();}
function connect(data){reader=data;if(connected)return;connected=true;if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();global.addEventListener('hashchange',()=>{if(overlay)close();});}
global.DaruriAskAI={connect,open};
})(window);
