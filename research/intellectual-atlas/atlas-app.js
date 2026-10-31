
  (()=>{
    'use strict';
    const root=document.getElementById('kalam-timeline-app-v3');
    if(!root||root.dataset.ready)return;root.dataset.ready='true';
    const D=JSON.parse(root.querySelector('[data-atlas]').textContent);
    const readerRoute=new URLSearchParams(location.hash.slice(1)).get('reader')||'';
    const safeReader=readerRoute.length<=4000&&/^(home|contents|sources|books|collation|ghiyath|map|help|downloads|desk|matn|(?:source|book|matn)\/[A-Za-z0-9_-]+|debate\/[0-9]{2}(?:\/(?:argument|sources|compare|matn))?)(?:\?[A-Za-z0-9%=&+._~-]*)?$/.test(readerRoute)?readerRoute:'';
    if(safeReader){root.classList.add('ia-from-reader');root.querySelector('.gn-atlas-introduction')?.removeAttribute('open');const banner=document.createElement('div');banner.className='ia-reader-return';const a=document.createElement('a');a.href='../tajrid/#'+safeReader;a.textContent='← Return to Tajrīd reading';banner.append(a);const p=document.createElement('span');p.textContent='The selected book is highlighted. Relationships retain their evidence and uncertainty labels.';banner.append(p);root.prepend(banner)}
    // Textual-family views are book-centred curated subsets, not confessional schools.
    const textualFamilies=Array.isArray(D.textual_families)?D.textual_families:[];
    const textualById=new Map(textualFamilies.map(f=>[f.id,f]));
    const textualMembers=new Map(textualFamilies.map(f=>[f.id,new Set(f.member_ids)]));
    const N=new Map(D.nodes.map(n=>[n.id,n])),E=new Map(D.edges.map(e=>[e.id,e]));
    const history=D.history||{periods:[],rulers:[],events:[],sources:[]};
    const sourceList=[...D.sources,...(history.sources||[])];
    const S=new Map(sourceList.map(s=>[s.id,s]));
    const historical=[...(history.periods||[]).filter(h=>h.id!=='HEP05'),...(history.events||[]),...(history.networks||[])];
    const H=new Map(historical.map(h=>[h.id,h]));
    const families={neoplatonic:['NEO','Greek Neoplatonism and later reception','#79559b','#c9a6e7'],ashari:['ASH','Ashʿarī (audited sample)','#076d7d','#92c8d0'],maturidi:['MAT','Māturīdī (audited sample)','#797523','#d5cc78'],ancient:['GRC','Greek / late antique','#5b6372','#a9b0c0'],translation:['TRN','Translation / adaptation','#846119','#dfbd74'],christian:['CHR','Christian authored works','#843a80','#d7a2cf'],jewish:['JUD','Jewish Arabic thought','#825740','#d0b09c'],falsafa:['FAL','Arabic Aristotelian','#14728c','#8dcbdd'],avicennan:['AVI','Avicennan reception','#006cb0','#79bcef'],ishraqi:['ISH','Illuminationist reception','#a35300','#f0b56b'],akbarian:['AKB','Akbarian reception','#b02a70','#f0a1c7'],mutazili:['MUT','Muʿtazilī networks','#a12e3c','#ed9ea8'],sunni:['SUN','Sunni kalām','#087751','#7bceb0'],imami:['IMM','Imami kalām / synthesis','#51439d','#b5a8e9'],sadrian:['SAD','Ṣadrian reception','#637b00','#c2d981'],critical:['CRT','Distinct Iranian critics','#475d6a','#a8c0ce'],context:['CTX','Context / claimed lineage','#627078','#b9c3c9']};
    const rels={component:['P','Constituent section (not influence)'],commentary:['C','Commentary'],gloss:['G','Gloss'],translation_adaptation:['T','Translation / adaptation'],textual_use:['U','Use / reworking'],author_reference:['A','Author reference'],critique:['X','Critical engagement'],reported_doctrine:['R','Reported teaching'],reported_source:['S','Source testimony'],exchange:['E','Exchange'],broad_influence:['B','Broader connection'],hypothesis:['?','Hypothesis'],claimed_lineage:['L','Claimed lineage']};
    const weak=new Set(['qualified','proposed','contested','proposed specific channel','claimed ancestry']);
    const highlights=new Set(['pythagoras_anchor','plato_timaeus','aristotle_metaphysics','plotinus_enneads','proclus_elements','sergius_categories','arabic_theology','arabic_pure_good','kindi_first','farabi_madina','avicenna_shifa','avicenna_isharat','ghazali_tahafut','razi_mabahith','razi_nihaya','razi_muhassal','razi_matalib','tusi_isharat','tusi_tajrid','iji_mawaqif','taftazani_maqasid','jurjani_mawaqif','suhrawardi_ishraq','shahrazuri_ishraq','qutb_ishraq','ibnarabi_fusus','ibnarabi_futuhat','qunawi_miftah','qaysari_fusus','jami_durra','haydar_jami_asrar','dawwani_zawra','sanusi_umm','nasafi_tabsira','abdjabbar_mughni','saadya_amanat','yahya_adi_tawhid','damad_qabasat','sadra_asfar','lahiji_shawariq','naraqi_shifa','jilveh_shifa','kumijani_nur','sabzawari_manzuma','tabatabai_bidaya','tabatabai_nihaya','mutahhari_shifa','nabulusi_anwar','bahr_mathnawi','jawadi_rahiq','abdqadir_mawaqif']);
    const preferredWords=['Shifāʾ','al-Ishārāt','Mawāqif','al-Durra al-fākhira','Fuṣūṣ al-ḥikam','al-Futūḥāt','Miftāḥ ghayb','Nūr al-fuʾād','al-Mughni','al-Mughnī','al-Tawḥīd','Tabṣirat','Kitāb al-Amānāt','al-Manẓūma'];
    for(const n of D.nodes)if(preferredWords.some(w=>n.title===w||n.title.startsWith(w)))highlights.add(n.id);
    if(D.nodes.some(n=>n.featured)){highlights.clear();for(const n of D.nodes)if(n.featured)highlights.add(n.id)}else for(const f of Object.keys(families)){const list=D.nodes.filter(n=>n.tradition===f);if(!list.some(n=>highlights.has(n.id))&&list.length)highlights.add(list[Math.floor(list.length/2)].id)}
    // Regional descriptions can overlap. These filters never assert an influence arrow.
    const regionNetworks=[
      ['greek','Greek and late antique',/greek|athens|alexandria|constantinople|rome|mediterranean|samos|ephesus|elea|acraga/i],
      ['baghdad','Baghdad and Iraq',/baghdad|basra|iraq|kufa|mesopotamia|hilla|najaf/i],
      ['khurasan','Khurasan and eastern Iran',/khurasan|khorasan|herat|nishapur|mashhad|balkh|rayy|hamadan|quhistan/i],
      ['transoxiana','Transoxiana and Central Asia',/transox|samarqand|samarkand|khwarazm|central asia|bukhara/i],
      ['ottoman','Ottoman Anatolia and Syria',/ottoman|istanbul|anatolia|konya|bursa|diyarbak|damascus|syria|aleppo|iznik/i],
      ['iran','Iranian philosophical centres',/iran|isfahan|shiraz|qom|tehran|tabriz|safavid|qajar|kashan|qazvin|sabzavar/i],
      ['southasia','South Asian networks',/mughal|india|indian|south asia|allahabad|lucknow|farangi|gujarat|hyderabad|kabul/i],
      ['farangi','Farangi Mahall',/farangi/i],
      ['egypt','Egypt and al-Azhar',/egypt|cairo|azhar/i],
      ['maghrib','Maghrib and al-Andalus',/maghrib|andalus|morocc|alger|africa/i]
    ];
    const matchesRegion=(n,id)=>!id||regionNetworks.some(([key,,pattern])=>key===id&&pattern.test(norm(n.region)));
    const state={view:'timeline',from:1075,to:1450,regionNetwork:'',density:'all',links:'focus',q:'',selected:null,detailType:null,detailId:null,families:new Set(Object.keys(families)),rels:new Set(Object.keys(rels)),politics:true,events:true,schools:true,contexts:true,qualified:true,focusOnly:false,depth:1,page:1,auditTab:'critical',textFamily:''};
    /* Full chronology is available by drag; no hidden selected-only subset on first load. */
    let visibleNodes=[],visibleEdges=[],locations=new Map(),lastWidth=0,resizeTimer,searchTimer,panStart=null;
    const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)];
    const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const norm=s=>String(s??'').normalize('NFKD').replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g,'').replace(/[ʿʾ’'`]/g,'').toLowerCase();
    const truncate=(s,n)=>{s=String(s??'');return s.length>n?s.slice(0,n-1)+'…':s};
    const measure=document.createElement('canvas').getContext('2d');function fit(s,width,size=12,weight=400){s=String(s??'');measure.font=weight+' '+size+'px '+getComputedStyle(root).fontFamily;if(measure.measureText(s).width<=width)return s;let lo=0,hi=s.length;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(measure.measureText(s.slice(0,mid)+'…').width<=width)lo=mid;else hi=mid-1}return s.slice(0,lo)+'…'}
    const year=y=>y<0?Math.abs(Math.round(y))+' BCE':Math.round(y)+' CE';
    const compactYear=y=>y<0?Math.abs(Math.round(y))+' BCE':Math.round(y);
    const family=n=>families[n.tradition]||families.context;
    const matchesTradition=(n,key)=>n.tradition===key||(n.intellectual_traditions||[]).includes(key);
    const color=n=>{const f=family(n);return `light-dark(${f[2]},${f[3]})`};
    const edgeCode=e=>e.id.replace(/^([FSIR])_e(\d+)$/,(_,a,b)=>a+'-'+b.padStart(2,'0'));
    const aliases=n=>/Ibn Sīnā|Avicenna/.test(n.author)?'avicenna ibn sina ابن سينا':/Rāzī/.test(n.author)?'razi الرازي':/Ṭūsī/.test(n.author)?'tusi الطوسي':/Ṣadrā/.test(n.author)?'mulla sadra ملا صدرا':/Ibn ʿArabī/.test(n.author)?'ibn arabi ابن عربي':'';
    const searchText=new Map(D.nodes.map(n=>[n.id,norm([n.title,n.title_ar,n.author,n.code,n.family,n.region,n.note,(n.intellectual_traditions||[]).join(' '),aliases(n)].join(' '))]));
    function temporal(n){
      if(n.temporal){const t=n.temporal;return {...t,anchor:Number.isFinite(+t.anchor)&&t.anchor!==null?+t.anchor:null,kind:t.kind||'unknown'}}
      const a=n.date_start,b=n.date_end,defined=x=>typeof x==='number'&&Number.isFinite(x);
      if(!defined(a)&&!defined(b))return {start:null,end:null,anchor:null,kind:'unplaced',label:n.date_label,note:n.date_note};
      if(!defined(a)&&defined(b))return {start:null,end:b,anchor:b,kind:'upper_bound',label:n.date_label,note:n.date_note};
      if(defined(a)&&!defined(b))return {start:a,end:null,anchor:a,kind:'lower_bound',label:n.date_label,note:n.date_note};
      return {start:a,end:b,anchor:a===b?a:(a+b)/2,kind:a===b?'exact':'range',label:n.date_label,note:n.date_note};
    }
    function inWindow(n){const t=temporal(n);if(t.anchor===null)return false;const a=t.start??t.anchor,b=t.end??t.anchor;return b>=state.from&&a<=state.to}
    function matches(n){return !state.q||searchText.get(n.id).includes(norm(state.q))}
    function allowedEdge(e){return state.rels.has(e.relation)&&(state.qualified||!weak.has(e.confidence))}
    function neighborhood(id,depth=1){const out=new Set(id?[id]:[]);for(let z=0;z<depth;z++){const before=new Set(out);for(const e of D.edges)if(allowedEdge(e)&&(before.has(e.source)||before.has(e.target))){out.add(e.source);out.add(e.target)}}return out}
    function filteredNodes(windowed=false){const near=neighborhood(state.selected,state.depth);return D.nodes.filter(n=>(!state.textFamily||textualMembers.get(state.textFamily)?.has(n.id))&&matchesRegion(n,state.regionNetwork)&&([n.tradition,...(n.intellectual_traditions||[])].some(k=>state.families.has(k)))&&(state.contexts||n.node_type==='work')&&matches(n)&&(!state.focusOnly||!state.selected||near.has(n.id))&&(!windowed||inWindow(n)))}
    function timelineNodes(){const all=filteredNodes(true),near=neighborhood(state.selected,state.depth);return all.filter(n=>state.density==='all'||state.q||highlights.has(n.id)||(state.from<600&&n.summary&&temporal(n).anchor<600)||near.has(n.id))}
    function sourceButtons(ids){return `<div class="ia-sources-inline">${(ids||[]).map(id=>`<button type="button" data-source="${esc(id)}">${esc(id)}</button>`).join('')}</div>`}
    function sourceHTML(ids){return [...new Set(ids||[])].map(id=>{const s=S.get(id);if(!s)return `<div class="ia-source">${esc(id)} · Source record unavailable</div>`;return `<div class="ia-source"><span class="ia-small">${esc(id)}${s.type?' · '+esc(s.type):''}</span><div>${esc(s.author||'')}</div>${s.url?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`:`<strong>${esc(s.title)}</strong>`}${s.locator?`<div>${esc(s.locator)}</div>`:''}${s.note?`<div class="ia-small">${esc(s.note)}</div>`:''}${s.accessed?`<div class="ia-small">Accessed ${esc(s.accessed)}</div>`:''}</div>`}).join('')}
    function setHash(replace=false){const p=new URLSearchParams({view:state.view,from:Math.round(state.from),to:Math.round(state.to),density:state.density,links:state.links});if(state.selected)p.set('work',state.selected);if(state.textFamily)p.set('text_family',state.textFamily);if(state.regionNetwork)p.set('region',state.regionNetwork);if(state.detailType==='edge')p.set('edge',state.detailId);if(state.detailType==='history')p.set('history',state.detailId);if(state.detailType==='source')p.set('source',state.detailId);if(state.detailType==='author')p.set('author',state.detailId);if(state.view==='audit')p.set('section',state.auditTab);if(state.q)p.set('q',state.q);if(state.focusOnly)p.set('focus','1');if(state.depth>1)p.set('depth',String(state.depth));if(state.families.size!==Object.keys(families).length)p.set('families',[...state.families].join(','));if(state.rels.size!==Object.keys(rels).length)p.set('rels',[...state.rels].join(','));if(!state.qualified)p.set('certain','1');if(!state.schools)p.set('networks','0');if(!state.politics)p.set('politics','0');if(!state.events)p.set('events','0');if(!state.contexts)p.set('contexts','0');if(state.view==='catalogue'&&state.page>1)p.set('page',String(state.page));if(safeReader)p.set('reader',safeReader);const hash='#'+p.toString();
      if(location.hash===hash)return;
      try{window.history[replace?'replaceState':'pushState'](null,'',hash)}
      catch{
        // Safari may rate-limit pushState/replaceState after many rapid filter
        // changes. Never leave copied/shareable state silently out of sync.
        // Hash-only navigation is safe on this static site; replace avoids
        // filling Back history for a transient filter state.
        try{
          if(replace)window.location.replace(location.pathname+location.search+hash);
          else window.location.hash=hash;
        }catch{}
      }}
    function readHash(){try{const p=new URLSearchParams(location.hash.slice(1));if(!['view','work','edge','history','text_family','region','source','author','section','q','families','rels','from','to','density','links','focus','depth','certain','networks','politics','events','contexts','page'].some(key=>p.has(key)))return;const v=p.get('view');if(['timeline','relations','catalogue','audit'].includes(v))state.view=v;const a=Number(p.get('from')),b=Number(p.get('to'));
      if(p.has('from')&&p.has('to')&&Number.isFinite(a)&&Number.isFinite(b)&&b>a){
        // Clamp an entire interval rather than clamping its endpoints
        // independently (which can produce an inverted timeline).
        const span=Math.min(historyLength,Math.max(20,b-a));
        const from=Math.max(historyMin,Math.min(historyMax-span,a));
        state.from=from;state.to=from+span;
      }
      state.density=p.get('density')==='highlights'?'highlights':'all';state.links=['focus','all','none'].includes(p.get('links'))?p.get('links'):'focus';state.selected=N.has(p.get('work'))?p.get('work'):null;state.detailType=state.selected?'work':null;state.detailId=state.selected;if(E.has(p.get('edge'))){state.detailType='edge';state.detailId=p.get('edge')}if(H.has(p.get('history'))){state.detailType='history';state.detailId=p.get('history')}if(S.has(p.get('source'))){state.detailType='source';state.detailId=p.get('source')}if(p.has('author')&&D.nodes.some(n=>n.author===p.get('author'))){state.detailType='author';state.detailId=p.get('author')}if(['critical','notes','relations','sources','prior','history'].includes(p.get('section')))state.auditTab=p.get('section');state.q=p.get('q')||'';state.focusOnly=p.get('focus')==='1';state.textFamily=textualById.has(p.get('text_family'))?p.get('text_family'):'';state.regionNetwork=regionNetworks.some(([key])=>key===p.get('region'))?p.get('region'):'';state.depth=[1,2,3,4].includes(+p.get('depth'))?+p.get('depth'):1;state.qualified=p.get('certain')!=='1';state.schools=p.get('networks')!=='0';state.politics=p.get('politics')!=='0';state.events=p.get('events')!=='0';state.contexts=p.get('contexts')!=='0';state.page=Number.isInteger(+p.get('page'))&&+p.get('page')>0?Math.min(1000,+p.get('page')):1;state.families=p.has('families')?new Set(p.get('families').split(',').filter(x=>families[x])):new Set(Object.keys(families));state.rels=p.has('rels')?new Set(p.get('rels').split(',').filter(x=>rels[x])):new Set(Object.keys(rels))}catch{}}
    function sync(){if(!state.selected)state.focusOnly=false;qa('[data-view]').forEach(b=>b.setAttribute('aria-selected',b.dataset.view===state.view));q('#ia-from-v3').value=Math.round(state.from);q('#ia-to-v3').value=Math.round(state.to);q('#ia-search-v3').value=state.q;const textControl=q('#ia-text-family-v3');if(textControl)textControl.value=state.textFamily;const regionSelect=q('#ia-region-network-v3');if(regionSelect)regionSelect.value=state.regionNetwork;const scope=q('[data-text-family-status]');if(scope){const f=textualById.get(state.textFamily);const total=f?f.member_ids.length:D.nodes.length;const matched=filteredNodes(false).length;scope.classList.toggle('ia-route-active',!!f);scope.innerHTML=f?'<strong>'+esc(f.label)+'</strong> · '+matched+' of '+total+' recorded members match the current tradition, region and search filters. '+esc(f.scope)+' <button type="button" data-action="clear-text-family" class="ia-clear-family">Return to all texts</button>':'Explore a named text and its commentary/gloss family without changing the intellectual-tradition colors. '+matched+' of '+D.nodes.length+' recorded entries match the active filters.';}qa('[data-control]').forEach(el=>{const key=el.dataset.control;if(el.type==='checkbox')el.checked=!!state[key];else el.value=state[key];if(key==='focusOnly'){el.disabled=!state.selected;el.title=state.selected?'Limit the chart to connections of the selected text':'Select a work before using neighborhood focus'}});qa('[data-family]').forEach(e=>e.checked=state.families.has(e.dataset.family));qa('[data-rel]').forEach(e=>e.checked=state.rels.has(e.dataset.rel));q('[data-timeline-controls]').hidden=state.view!=='timeline';q('[data-main]').setAttribute('aria-labelledby','ia-tab-'+state.view+'-v3')}
    function selectNode(id,center=false){if(!N.has(id))return;if(state.textFamily&&!textualMembers.get(state.textFamily)?.has(id))state.textFamily='';if(state.regionNetwork&&!matchesRegion(N.get(id),state.regionNetwork))state.regionNetwork='';
      const n=N.get(id);
      // Search and evidence links may jump outside active filters. Ensure the
      // selected record is actually present in the dated diagram.
      if(![n.tradition,...(n.intellectual_traditions||[])].some(k=>state.families.has(k)))state.families.add(n.tradition);
      if(n.node_type!=='work')state.contexts=true;
      if(center)state.q='';state.selected=id;state.detailType='work';state.detailId=id;state.page=1;if(center){const t=temporal(N.get(id));if(t.anchor!==null){const width=Math.min(280,state.to-state.from);state.from=Math.max(historyMin,Math.min(historyMax-width,t.anchor-width/2));state.to=state.from+width}}render();setHash();announce(N.get(id).title+' selected')}
    function selectEdge(id){if(!E.has(id))return;state.detailType='edge';state.detailId=id;renderSheet();setHash();announce('Evidence for '+edgeCode(E.get(id)))}
    function selectHistory(id){if(!H.has(id))return;state.detailType='history';state.detailId=id;render();setHash();announce(H.get(id).label+' selected')}
    function announce(s){q('[data-live]').textContent=s}
    function pack(items,xfn,wfn,gap=7){const ends=[];return items.slice().sort((a,b)=>xfn(a)-xfn(b)).map(item=>{const x=xfn(item),w=wfn(item);let row=ends.findIndex(end=>end+gap<=x);if(row<0)row=ends.length;ends[row]=x+w;return {item,x,w,row}})}
    function stepSize(span,width){const aim=width<450?4:width<700?6:9;const raw=span/aim;return [1,2,5,10,20,25,50,100,200,250,500,1000].find(s=>s>=raw)||1000}
    function ticks(from,to,width){const step=stepSize(to-from,width),out=[];for(let y=Math.ceil(from/step)*step;y<=to;y+=step)if(y!==0)out.push(y);return out}
    function svgText(x,y,txt,cls='',attrs=''){return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="${cls}" ${attrs}>${esc(txt)}</text>`}
    const historyMin=-600,historyMax=2026,historyLength=historyMax-historyMin;
    let lastFocusedSpan=375; // Remember the user's last practical zoom, even while 'Whole atlas' is selected.
    const allYearsInView=()=>state.to-state.from>=historyLength-.01;
    function focusFromWhole(anchor,fraction=.5){
      if(!allYearsInView())return false;
      const span=Math.max(160,Math.min(700,lastFocusedSpan));
      fraction=Math.max(0,Math.min(1,fraction));
      changeRange(anchor-span*fraction,anchor+span*(1-fraction),true);
      return true;
    }
    const densitySamples=Array.from({length:56},()=>0);
    for(const n of D.nodes){const a=temporal(n).anchor;if(a!==null&&a>=historyMin&&a<=historyMax){const index=Math.min(densitySamples.length-1,Math.max(0,Math.floor((a-historyMin)/historyLength*densitySamples.length)));densitySamples[index]++}}
    const histogramMax=Math.max(1,...densitySamples);
    function drawNavigator(){const rail=q('[data-history-rail]');if(!rail)return;
      const isWhole=allYearsInView();
      if(!isWhole)lastFocusedSpan=state.to-state.from;
      rail.dataset.fullRange=isWhole?'true':'false';
      rail.setAttribute('aria-valuenow',String(Math.round((state.from+state.to)/2)));
      rail.setAttribute('aria-valuetext',isWhole?
        `${year(historyMin)} to ${year(historyMax)}. All years in view; drag the six-dot handle to focus into a movable window.`:
        `${year(state.from)} to ${year(state.to)}. Drag the highlighted window to pan continuously.`);
      rail.setAttribute('title',isWhole?'All years visible: drag the six-dot handle to zoom into a movable window':
        `${year(state.from)} – ${year(state.to)} · drag the grip to move the view`);
      if(!rail.querySelector('.ia-travel-window')){
        const ticks=[0,500,1000,1500,2000].map(y=>`<i style="left:${(y-historyMin)/historyLength*100}%" title="${y} CE"></i>`).join('');
        rail.innerHTML=`<div class="ia-travel-histogram" aria-hidden="true">${densitySamples.map(n=>`<i style="height:${Math.max(3,Math.round(100*Math.sqrt(n/histogramMax)))}%"></i>`).join('')}</div><div class="ia-travel-ticks" aria-hidden="true">${ticks}</div><div class="ia-travel-window" aria-hidden="true"><span class="ia-travel-grip"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><circle cx="9" cy="5" r="1.4"/><circle cx="15" cy="5" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="19" r="1.4"/><circle cx="15" cy="19" r="1.4"/></svg></span></div>`;
      }
      const thumb=rail.querySelector('.ia-travel-window');
      thumb.style.left=`${(state.from-historyMin)/historyLength*100}%`;
      thumb.style.width=`${(state.to-state.from)/historyLength*100}%`;
    }
    // Never confuse a chart callout with the period a work existed. Broad bounds
    // are intervals of evidence, not durations of a book or its circulation.
    function dateMeaning(n,t){
      const kind=t.kind||'unknown',y=t.anchor===null?'unknown':year(t.anchor);
      if(t.stages?.length)return {short:'Phases · '+t.stages.map(st=>compactYear(st.end)).join(' / '),long:'Several separately attested writing, redaction or editing stages. The gaps do not imply continuous writing.'};
      if(/upper|terminus|before|death_bound/.test(kind))return {short:'By '+y+' · upper bound',long:'Latest possible date or attestation, often the author’s death; composition may be earlier.'};
      if(/lower|after/.test(kind))return {short:'After '+y+' · lower bound',long:'Earliest possible date, not a verified completion year.'};
      if(kind==='publication')return {short:'Printed/attested · '+y,long:'This dates an edition or publication witness, not necessarily the original work.'};
      if(kind==='unplaced'||kind==='undated'||t.anchor===null)return {short:'Undated — not plotted',long:'Insufficient evidence to position this entry on the calendar axis.'};
      if(kind==='exact')return {short:'Dated '+y,long:'A year-level textual date supported by the record; inspect its evidence for whether completion or another event is dated.'};
      if(kind==='approximate')return {short:'Approx. '+y,long:'Approximate year or estimate; not verified to a precise completion date.'};
      if(kind==='context')return {short:'Context / multiple stages',long:'An authorial or corpus activity envelope, not the duration of the book or a continuous composition interval.'};
      if(kind==='range')return {short:'Approx. dating window',long:'A possible composition or attestation window, not a period during which the book continuously existed or was being written.'};
      return {short:'Dated with qualifications',long:'The record has qualified date evidence; see the source and date note.'};
    }
    function cardTitleLines(t,width){const words=String(t).split(/\s+/),lines=[''];for(const word of words){const i=lines.length-1,tryText=lines[i]?(lines[i]+' '+word):word;measure.font='600 13px '+getComputedStyle(root).fontFamily;if(measure.measureText(tryText).width<width)lines[i]=tryText;else if(lines.length<2)lines.push(word);else lines[i]+=' '+word}return [fit(lines[0],width,13,600),fit(lines[1]||'',width,13,600)]}
    function drawTimeline(){
      const main=q('[data-main]');
      if(!q('[data-chart]'))main.innerHTML=`<div class="ia-main-head"><div><h2>Texts, empires and events</h2><span class="ia-small" data-range-caption></span></div><div class="ia-actions"><button type="button" data-action="pan-back" aria-label="Earlier period">← Earlier</button><button type="button" data-action="zoom-in" aria-label="Zoom into timeline">+ Zoom</button><button type="button" data-action="zoom-out" aria-label="Zoom out of timeline">− Zoom</button><button type="button" data-action="pan-forward" aria-label="Later period">Later →</button><button type="button" data-action="whole-atlas-chart" class="ia-chart-whole" aria-label="Show all historical years">All years</button></div></div><div class="ia-nav-overview"><span>600 BCE</span><div class="ia-travel-track" data-history-rail tabindex="0" role="slider" aria-label="Move the visible time window; drag its six-dot handle or use the arrow keys" aria-valuemin="-600" aria-valuemax="2026" aria-valuenow="1300" aria-orientation="horizontal"></div><span>2026</span><span class="ia-zoom-tag" data-scale-caption></span></div><div class="ia-chart" data-chart tabindex="0" role="region" aria-label="Continuously pan or zoom the timeline; book labels are connected to independent date marks"></div><details class="ia-timeline-help"><summary>How to use the timeline and understand dates</summary><div><p class="ia-travel-help">Drag the overview's <strong>six-dot handle</strong> to move continuously through history. When <strong>Whole atlas</strong> shows every year, dragging it first restores a movable zoomed window; tap elsewhere on the bar to jump to an era. Swipe/drag the diagram horizontally to pan; scroll vertically to read. Shift + wheel / horizontal trackpad pan; Ctrl/⌘ + wheel zooms. Keyboard: ← →, + −, Home, End.</p><p class="ia-date-guide"><strong>Work labels are not time spans.</strong> The small mark linked to each title is the date evidence: <strong>■</strong> an attested year, <strong>◆</strong> approximate position, <strong>◀</strong> latest possible date, <strong>⋯</strong> an uncertain window or separate stages. A book's label width has no chronological meaning.</p></div></details><div class="ia-legend"><span><b>■</b> attested year (small square)</span><span><b>⋯</b> uncertain window, NOT a duration</span><span><b>◀</b> latest bound (not completion)</span><span><b>◇</b> approximate or contextual</span><span><b>□</b> edition / publication witness</span><span><b>│</b> historical event</span><span><b>┄</b> interrupted territorial rule</span><span><b>▤</b> scholarly network (not a state)</span><span><b>→</b> textual relationship</span></div><div class="ia-family-legend" data-visible-families></div><p class="ia-bound-warning">Event rules share the texts’ calendar axis. Bounds retain their uncertainty; chronological overlap does not establish influence or patronage.</p><div data-unplaced></div>`;
      q('[data-range-caption]').textContent=`${year(state.from)} – ${year(state.to)} · ${D.nodes.length} entries in the complete atlas`;q('[data-scale-caption]').textContent=`${Math.round(state.to-state.from)} years in view`;drawNavigator();
      const chart=q('[data-chart]'),W=Math.max(280,Math.floor(chart.clientWidth||chart.getBoundingClientRect().width||900)),L=W<500?12:18,R=W<500?12:20,plotW=W-L-R;
      const x=value=>L+(value-state.from)/(state.to-state.from)*plotW,clamp=v=>Math.max(L,Math.min(W-R,v));
      const cfg=D.timeline_meta?.integrated_display||{},periodIds=cfg.period_ids?new Set(cfg.period_ids):null;
      const periodLabel=p=>cfg.period_labels?.[p.id]||({'HEP02':'Rāshidūn state','HEP03':'Umayyad state · Damascus','HEP04':'Abbasid authority · Iraq','HEP26':'Byzantine Empire'}[p.id])||p.label;
      const eventLabel=e=>({'HL_E01':'Baghdad captured','HL_E02':'Battle of Ankara','HL_E03':'Constantinople taken','HL_E04':'Safavid accession','HL_E05':'Battle of Chaldiran','HL_E06':'Ottoman Egypt','HL_E07':'First Panipat','HL_E08':'Capital to Isfahan','HL_E09':'Fall of Isfahan','HL_E10':'Nāder crowned','HEV15':'Greek–Arabic translation'}[e.id])||cfg.event_labels?.[e.id]||e.label;
      lastWidth=W;const content=[],nodeCards=[],pos=new Map(),years=ticks(state.from,state.to,plotW);
      const periods=state.politics?(history.periods||[]).filter(p=>p.id!=='HEP05'&&(!periodIds||periodIds.has(p.id))&&p.end>=state.from&&p.start<=state.to):[];
      const schoolNetworks=state.schools?(history.networks||[]).filter(p=>p.end>=state.from&&p.start<=state.to):[];
      let py=13;
      if(periods.length){
        content.push(svgText(L,py,'EMPIRES AND STATES','ia-axis'));py+=9;
        const arranged=pack(periods,p=>clamp(x(p.start)),p=>Math.max(6,clamp(x(p.end))-clamp(x(p.start))),4);
        let rows=0;
        for(const z of arranged){
          rows=Math.max(rows,z.row+1);const p=z.item,yy=py+z.row*24,active=state.detailType==='history'&&state.detailId===p.id;
          content.push(`<a href="#history=${esc(p.id)}" data-history="${esc(p.id)}" data-polity="1" aria-label="${esc(p.label+'; '+p.date_label)}" data-tooltip="${esc(p.label+' · '+p.date_label)}">`);
          for(const seg of p.segments||[[p.start,p.end]]){const a=Array.isArray(seg)?seg[0]:seg.start,b=Array.isArray(seg)?seg[1]:seg.end;if(b<state.from||a>state.to)continue;const sx=clamp(x(a)),ex=clamp(x(b));content.push(`<rect class="ia-polity ${active?'ia-polity-selected':''}" x="${sx}" y="${yy}" width="${Math.max(3,ex-sx)}" height="19" rx="2"/>`)}
          // A visible dashed bridge marks interrupted territorial rule, not missing years.
          if(p.segments?.length>1)for(let i=1;i<p.segments.length;i++){const a=p.segments[i-1],b=p.segments[i],end=Array.isArray(a)?a[1]:a.end,start=Array.isArray(b)?b[0]:b.start;if(start<=state.from||end>=state.to)continue;const sx=clamp(x(end)),ex=clamp(x(start));if(ex>sx)content.push(`<rect class="ia-polity-gap" x="${sx}" y="${yy}" width="${ex-sx}" height="19" rx="2"/>`)}
          if(p.end>state.to||p.open_end||p.end_is_chart_cutoff){const ex=clamp(x(p.end));content.push(`<path d="M ${ex-7} ${yy+4} l 6 5.5 -6 5.5" fill="none" stroke="var(--ia-muted)" stroke-width="1.4"/>`)}
          if(z.w>48)content.push(svgText(z.x+4,yy+13,fit(periodLabel(p),z.w-10,11),'ia-axis'));
          content.push('</a>');
        }
        py+=rows*24+5;
      }
      if(schoolNetworks.length){
        content.push(svgText(L,py+7,'SCHOLARLY NETWORKS · contextual, not political', 'ia-axis'));py+=17;
        const arranged=pack(schoolNetworks,p=>clamp(x(p.start)),p=>Math.max(5,clamp(x(p.end))-clamp(x(p.start))),5);
        let rows=0;
        for(const z of arranged){
          rows=Math.max(rows,z.row+1);const p=z.item,yy=py+z.row*24,active=state.detailType==='history'&&state.detailId===p.id;
          content.push(`<a href="#history=${esc(p.id)}" data-history="${esc(p.id)}" data-network="1" aria-label="${esc(p.label+'; '+p.date_label)}" data-tooltip="${esc(p.label+' · '+p.date_label)}"><rect class="ia-scholar-network ${active?'ia-scholar-network-selected':''}" x="${z.x}" y="${yy}" width="${Math.max(5,z.w)}" height="19" rx="3"/>${z.w>65?svgText(z.x+4,yy+13,fit(p.label,z.w-9,11,600),'ia-network-label'):''}</a>`);
        }
        py+=rows*24+6;
      }
      const axisY=py+21,fieldTop=axisY+23;
      content.push(`<line class="ia-time-axis" data-common-axis x1="${L}" x2="${W-R}" y1="${axisY}" y2="${axisY}"/>`);
      for(const yr of years){const xx=x(yr);content.push(`<line class="ia-time-axis" x1="${xx}" x2="${xx}" y1="${axisY-4}" y2="${axisY+4}"/>`);content.push(svgText(xx,axisY-9,compactYear(yr),'ia-axis',`text-anchor="${xx<L+25?'start':xx>W-45?'end':'middle'}"`))}
      const events=state.events?(history.events||[]).filter(e=>(e.end_year??e.year??e.start)>=state.from&&(e.year??e.start)<=state.to):[];
      const span=state.to-state.from,overviewMode=span>=(W<600?300:1050),deepMode=span<=240,mediumMode=span<=580,coreEvents=new Set(['HEV01','HEV02','HEV05','HEV06','HEV07','HEV08','HEV12','HEV15','HL_E01','HL_E03','HL_E04','HL_E06','HL_E07','HL_E08','HL_E09','HL_E12','HL_E14','HL_E18','HL_E20']);
      const labelEvents=events.filter(e=>span<=650||coreEvents.has(e.id)||e.id===state.detailId);
      visibleNodes=timelineNodes();
      // Label width and height are typographic only; never encode an edition's temporal duration.
      const cw=overviewMode?Math.min(W-25,158):deepMode?Math.min(W-25,202):mediumMode?Math.min(W-25,180):Math.min(W-25,164);
      const workH=deepMode?99:mediumMode?82:76,ew=W<500?116:146;
      const bucketSize=W<600?50:span>1850?125:100,buckets=new Map();
      if(overviewMode)for(const n of visibleNodes){const anchor=temporal(n).anchor;if(anchor===null)continue;const start=Math.floor(anchor/bucketSize)*bucketSize;if(!buckets.has(start))buckets.set(start,[]);buckets.get(start).push(n)}
      const cards=overviewMode?[...buckets].map(([start,items])=>({kind:'cluster',item:{start,end:start+bucketSize,items},anchor:start+bucketSize/2,w:cw})):visibleNodes.map(n=>({kind:'work',item:n,anchor:temporal(n).anchor,w:cw}));
      const evcards=labelEvents.map(e=>({kind:'event',item:e,anchor:((e.year??e.start)+(e.end_year??e.year??e.start))/2,w:ew}));
      const occupied=[];
      const merged=[...cards,...evcards].map(item=>({item,x:Math.min(W-R-item.w,Math.max(L,x(item.anchor)+7)),w:item.w,h:item.kind==='work'?workH:item.kind==='cluster'?75:50})).sort((a,b)=>a.x-b.x||a.item.anchor-b.item.anchor);
      let fieldHeight=0;
      for(const z of merged){let top=0;for(let limit=0;limit<merged.length+1;limit++){const hit=occupied.find(r=>z.x<r.x+r.w+9&&z.x+z.w+9>r.x&&top<r.y+r.h+6&&top+z.h+6>r.y);if(!hit)break;top=hit.y+hit.h+6}z.top=top;occupied.push({x:z.x,w:z.w,y:top,h:z.h});fieldHeight=Math.max(fieldHeight,top+z.h)}
      for(const z of merged){
        const a=z.item,ny=fieldTop+z.top,cardx=z.x;
        if(a.kind==='event'){
          const e=a.item,ex=clamp(x(e.year??e.start)),ranged=e.end_year!=null&&e.end_year>(e.year??e.start),active=state.detailType==='history'&&state.detailId===e.id;
          content.push(`<a href="#history=${esc(e.id)}" data-history="${esc(e.id)}" data-event-callout="1" aria-label="${esc(e.label+'; '+e.date_label)}" data-tooltip="${esc(e.label+' · '+e.date_label)}"><rect class="ia-event-label-bg" x="${cardx-3}" y="${ny+9}" width="${ew+3}" height="39"/><line class="ia-event-leader" x1="${ex}" x2="${cardx+1}" y1="${ny+23}" y2="${ny+23}"/><path class="ia-event" d="M ${cardx+1} ${ny+19} l 4 4 -4 4 -4 -4 Z"/>${svgText(cardx+10,ny+21,fit(eventLabel(e),ew-14,11,600),'ia-event-label')}${svgText(cardx+10,ny+38,fit(e.date_label||compactYear(e.year),ew-14,11),'ia-node-sub')}</a>`);
          continue;
        }
        if(a.kind==='cluster'){
          const b=a.item,topNames=Object.entries(b.items.reduce((m,n)=>(m[family(n)[0]]=(m[family(n)[0]]||0)+1,m),{})).sort((x,y)=>y[1]-x[1]).slice(0,3).map(x=>x[0]).join(' · ');
          content.push(`<a href="#" data-cluster="${b.start},${b.end}" aria-label="${b.items.length} texts from ${year(b.start)} through ${year(b.end)}. Zoom to examine individual works."><rect class="ia-overview-card" x="${cardx}" y="${ny+6}" width="${cw}" height="62" rx="5"/>${svgText(cardx+8,ny+23,`${b.items.length} texts · ${year(b.start)}`,'ia-cluster-label')}${svgText(cardx+8,ny+42,fit(topNames,cw-16,11),'ia-cluster-sub')}${svgText(cardx+8,ny+58,'Select to explore works','ia-cluster-sub')}</a>`);
          continue;
        }
        const n=a.item,t=temporal(n),px=clamp(x(t.anchor)),style=`--ia-series:${color(n)}`,selected=n.id===state.selected,cls=selected?'ia-selected-box':'ia-work-box';
        const kind=t.kind||'',dateNote=dateMeaning(n,t),markerY=ny+6;
        pos.set(n.id,{x:px,y:markerY,boxx:cardx,boxy:ny,boxw:cw});
        const dotted=(start,end)=>`<line class="ia-date-window" x1="${clamp(x(start))}" x2="${clamp(x(end))}" y1="${markerY}" y2="${markerY}"/>`;
        const dateRect=(at,fill=true)=>`<rect class="ia-date-glyph ${fill?'ia-date-certain':'ia-date-open'}" x="${clamp(x(at))-4.5}" y="${markerY-4.5}" width="9" height="9" rx="1.2"/>`;
        let mark='';
        if(t.stages?.length){mark=t.stages.filter(st=>st.end>=state.from&&st.start<=state.to).map(st=>`${dotted(st.start,st.end)}${dateRect(st.end,false)}`).join('')}
        else if(/upper|terminus|before|death_bound/.test(kind))mark=`<path class="ia-date-window" d="M ${Math.max(L,px-17)} ${markerY} L ${px} ${markerY}"/><path class="ia-date-glyph" d="M ${px} ${markerY-5} l -8 5 8 5 Z"/>`;
        else if(/lower|after/.test(kind))mark=`<path class="ia-date-window" d="M ${px} ${markerY} L ${Math.min(W-R,px+17)} ${markerY}"/><path class="ia-date-glyph" d="M ${px} ${markerY-5} l 8 5 -8 5 Z"/>`;
        else if(kind==='publication')mark=`<rect class="ia-date-glyph ia-date-open" x="${px-4.5}" y="${markerY-4.5}" width="9" height="9"/>`;
        else if(t.start!==null&&t.end!==null&&t.start!==t.end){mark=`${dotted(t.start,t.end)}${dateRect(t.anchor,false)}`}
        else if(n.node_type!=='work'||/context|approx/.test(kind))mark=`<path class="ia-date-glyph ia-date-open" d="M ${px} ${markerY-5} l 5 5 -5 5 -5 -5 Z"/>`;
        else mark=dateRect(t.anchor,true);
        const boxH=workH-18,lines=deepMode?cardTitleLines(n.title,cw-18):null;
        const titleHTML=deepMode?`${svgText(cardx+8,ny+29,lines[0],'ia-node-title')}${svgText(cardx+8,ny+43,lines[1],'ia-node-title')}`:svgText(cardx+8,ny+29,fit(n.title,cw-16,12,600),'ia-node-title');
        const dateBadge=fit(dateNote.short,cw-16,11);
        const infoHTML=deepMode?`${svgText(cardx+8,ny+59,fit(n.author,cw-16,11),'ia-node-sub')}${svgText(cardx+8,ny+78,dateBadge,'ia-node-date')}`:mediumMode?`${svgText(cardx+8,ny+46,fit(n.author,cw-16,11),'ia-node-sub')}${svgText(cardx+8,ny+64,dateBadge,'ia-node-date')}`:svgText(cardx+8,ny+48,dateBadge,'ia-node-date');
        nodeCards.push(`<a href="#work=${esc(n.id)}" data-work="${esc(n.id)}" data-date-kind="${esc(kind)}" style="${style}" aria-label="${esc(n.code+': '+n.title+'; '+n.author+'; '+n.date_label+'; '+dateNote.long)}" data-tooltip="${esc(n.title+' · '+n.date_label+' · '+dateNote.long)}">${mark}<line class="ia-date-stem" x1="${px}" x2="${Math.max(cardx+5,Math.min(cardx+cw-5,px))}" y1="${markerY}" y2="${ny+13}"/><rect class="${cls} ia-work-label" x="${cardx}" y="${ny+13}" width="${cw}" height="${boxH}" rx="5" ${n.node_type!=='work'?'stroke-dasharray="3 2"':''}/><rect x="${cardx}" y="${ny+13}" width="2" height="${boxH}" fill="var(--ia-series)"/>${titleHTML}${infoHTML}</a>`);
      }
      const fieldBottom=fieldTop+Math.max(70,fieldHeight)+7,h=fieldBottom+19;
      if(!visibleNodes.length)content.push(svgText(L,fieldTop+23,'No dated texts match this view.','ia-axis'));
      const back=[];
      const selectedHistory=state.detailType==='history'?H.get(state.detailId):null;
      if(selectedHistory&&selectedHistory.record_group==='periods'&&selectedHistory.id!=='HEP05'){
        for(const seg of selectedHistory.segments||[[selectedHistory.start,selectedHistory.end]]){const a=Array.isArray(seg)?seg[0]:seg.start,b=Array.isArray(seg)?seg[1]:seg.end;if(b<state.from||a>state.to)continue;const sx=clamp(x(a)),ex=clamp(x(b));back.push(`<rect class="ia-polity-span" data-selected-period-span x="${sx}" y="${axisY+1}" width="${Math.max(2,ex-sx)}" height="${fieldBottom-axisY}"/>`)}
      }
      const eventRules=[];
      for(const e of events){
        const ex=clamp(x(e.year??e.start)),ranged=e.end_year!=null&&e.end_year>(e.year??e.start),active=state.detailType==='history'&&state.detailId===e.id,ey=axisY+1;
        eventRules.push(`<a href="#history=${esc(e.id)}" data-history="${esc(e.id)}" data-event-rule="1" aria-label="${esc(e.label+'; '+e.date_label)}" data-tooltip="${esc(e.label+' · '+e.date_label)}">`);
        if(ranged){const end=clamp(x(e.end_year));eventRules.push(`<rect class="ia-event-interval ${active?'ia-event-interval-selected':''}" x="${ex}" y="${ey}" width="${Math.max(2,end-ex)}" height="${fieldBottom-ey}"/>`)}
        eventRules.push(`<line class="ia-event-rule ${active?'ia-event-rule-selected':''}" x1="${ex}" x2="${ex}" y1="${ey}" y2="${fieldBottom}"/><line class="ia-event-hit" x1="${ex}" x2="${ex}" y1="${ey}" y2="${fieldBottom}"/><path class="ia-event" d="M ${ex} ${axisY-3} l 4 4 -4 4 -4 -4 Z"/></a>`);
      }
      const ids=new Set(visibleNodes.map(n=>n.id)),near=neighborhood(state.selected,state.depth);
      visibleEdges=D.edges.filter(e=>allowedEdge(e)&&ids.has(e.source)&&ids.has(e.target)&&(state.links==='all'||state.links==='focus'&&state.selected&&(near.has(e.source)&&near.has(e.target))));
      if(overviewMode)visibleEdges=[];
      const paths=[];
      for(const e of visibleEdges){const a=pos.get(e.source),b=pos.get(e.target);if(!a||!b)continue;const sign=b.y>=a.y?1:-1,dx=Math.max(28,Math.min(95,Math.abs(b.x-a.x)*.3));const d=`M ${a.x} ${a.y} C ${a.x+dx} ${a.y+sign*24}, ${b.x-dx} ${b.y-sign*24}, ${b.x} ${b.y}`;const isWeak=weak.has(e.confidence)||['hypothesis','claimed_lineage','broad_influence','author_reference'].includes(e.relation),dash=isWeak?'2 4':e.relation==='textual_use'?'6 3':'';paths.push(`<a href="#edge=${esc(e.id)}" data-edge="${esc(e.id)}" aria-label="${esc(edgeCode(e)+': '+(rels[e.relation]||['',e.relation])[1]+'; '+N.get(e.source).title+' to '+N.get(e.target).title)}" data-tooltip="${esc(edgeCode(e)+' · '+(rels[e.relation]||['',e.relation])[1])}"><path class="ia-relation ${e.relation==='critique'?'ia-critique':''}" d="${d}" ${dash?`stroke-dasharray="${dash}"`:''} marker-end="url(#${e.relation==='critique'?(isWeak?'ia-arrow-xopen-v3':'ia-arrow-x-v3'):(isWeak?'ia-arrow-open-v3':'ia-arrow-v3')})" ${e.relation==='exchange'?'marker-start="url(#ia-arrow-v3)"':''}/><path class="ia-edge-hit" d="${d}"/></a>`)}
      const grid=years.map(yr=>`<line class="ia-grid" x1="${x(yr)}" x2="${x(yr)}" y1="${axisY}" y2="${fieldBottom}" opacity=".4"/>`).join('');
      chart.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" aria-label="Integrated chronology: empire bands above a common time axis; events extend as vertical rules among the works and textual connections" role="group" data-integrated-chart data-field-top="${fieldTop}" data-field-bottom="${fieldBottom}"><defs><marker id="ia-arrow-v3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9 Z" fill="var(--ia-link)"/></marker><marker id="ia-arrow-open-v3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="var(--ia-link)" stroke-width="1.6"/></marker><marker id="ia-arrow-x-v3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9 Z" fill="var(--ia-bad)"/></marker><marker id="ia-arrow-xopen-v3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="var(--ia-bad)" stroke-width="1.6"/></marker></defs><rect data-pan-surface x="0" y="0" width="${W}" height="${h}" fill="var(--ia-panel)"/>${back.join('')}${grid}${eventRules.join('')}${paths.join('')}${content.join('')}${nodeCards.join('')}</svg>`;
      locations=pos;
      q('[data-visible-families]').innerHTML=[...new Set(visibleNodes.map(n=>n.tradition))].map(f=>`<span><i class="ia-swatch" style="--ia-series:light-dark(${families[f][2]},${families[f][3]})"></i> ${esc(families[f][0]+' · '+families[f][1])}</span>`).join('');
      const unplaced=filteredNodes(false).filter(n=>temporal(n).anchor===null);
      const noMatch=filteredNodes(false).length===0;
      const emptyHTML=noMatch?`<div class="ia-empty ia-filter-empty" role="status"><h3>No texts match these combined filters</h3><p>Textual-family, tradition, regional and search filters are intersected. The current combination excludes every recorded work.</p><button type="button" data-action="reset-filters">Clear restrictive filters · keep these years</button></div>`:'';
      q('[data-unplaced]').innerHTML=emptyHTML+(unplaced.length?`<div class="ia-unplaced"><h3>Without a defensible calendar position</h3><p class="ia-small">These contextual entries remain available without inventing a date.</p>${unplaced.map(n=>`<button type="button" data-work="${esc(n.id)}">${esc(n.code+' · '+n.title)}</button>`).join('')}</div>`:'');
      updateCounts();
    }
    function relationRow(e,id){const other=N.get(e.source===id?e.target:e.source);return `<div class="ia-detail-row"><span class="ia-small">${esc(edgeCode(e))} · ${esc((rels[e.relation]||['',e.relation])[1])} · ${esc(e.confidence)}</span><button type="button" data-work="${esc(other.id)}" data-center="1">${esc(other.title)}</button><div class="ia-small">${esc(other.author)} · ${esc(other.date_label)}</div><button type="button" class="ia-inspect" data-edge="${esc(e.id)}">Read relationship evidence</button></div>`}
    function workSheet(n){const directRoutes=textualFamilies.filter(f=>f.member_ids.includes(n.id)),otherRoutes=textualFamilies.filter(f=>!directRoutes.includes(f)&&f.member_ids.some(id=>N.get(id)?.author===n.author));const routeMarkup=(directRoutes.length||otherRoutes.length)?'<section class="ia-work-routes"><h3>Explore commentary families</h3>'+directRoutes.map(f=>'<button type="button" data-text-route="'+esc(f.id)+'">'+esc(f.label)+'</button>').join('')+(otherRoutes.length?'<p class="ia-small">Other textual networks involving this author, not necessarily this same work</p>'+otherRoutes.map(f=>'<button type="button" data-text-route="'+esc(f.id)+'">'+esc(f.label)+'</button>').join(''):'')+'</section>':'';const classifications=(n.classification_evidence||[]).map(c=>'<div class="ia-detail-row"><strong>'+esc(families[c.id]?.[1]||c.id)+'</strong> · '+esc(c.status||'qualified')+sourceButtons(c.sources)+'</div>').join('');
      const incoming=D.edges.filter(e=>e.target===n.id),outgoing=D.edges.filter(e=>e.source===n.id),t=temporal(n);const extra=['affiliations','confession','tags','map_tags','not_a_work'].filter(k=>n[k]&&(Array.isArray(n[k])?n[k].length:true));return `<span class="ia-eyebrow">${esc(n.code)} · ${esc(family(n)[0])}</span><h2>${esc(n.title)}</h2>${n.title_ar?`<div class="ia-arabic" lang="ar">${esc(n.title_ar)}</div>`:''}<button type="button" class="ia-author" data-author="${esc(n.author)}">${esc(n.author)}</button><div class="ia-small">${esc(n.author_dates)}</div><div class="ia-badges"><span class="ia-badge">${esc(n.kind)}</span><span class="ia-badge">${esc(family(n)[1])}</span>${(n.map_tags||[]).map(t=>`<span class="ia-badge">${esc(t)}</span>`).join('')}</div>${n.tajrid_reader?`<section class="ia-reader-links"><h3>Tajrīd sourcebook</h3><a href="../tajrid/#book/${esc(n.id)}">${n.tajrid_reader.record_count?"Read "+n.tajrid_reader.record_count+" linked source records":"Open bibliographical context"} →</a><p class="ia-small">Containing witnesses and reported attributions are distinguished in the reader.</p></section>`:""}${routeMarkup}${classifications?'<details class="ia-classifications"><summary>Classification evidence and cautions</summary>'+classifications+'</details>':''}<dl><dt>Text date</dt><dd>${esc(n.date_label)}</dd><dt>Date status</dt><dd>${esc(n.date_status)}</dd><dt>Marker means</dt><dd><strong>${esc(dateMeaning(n,t).short)}</strong> — ${esc(dateMeaning(n,t).long)}</dd><dt>Region</dt><dd>${esc(n.region)}</dd><dt>Text family</dt><dd>${esc(n.family)}</dd>${n.size?`<dt>Edition / extent</dt><dd>${esc(n.size)}</dd>`:''}</dl>${n.note?`<p>${esc(n.note)}</p>`:''}<details open><summary>Date evidence &amp; plotting</summary><p class="ia-small">${esc(n.date_note||'No additional composition evidence is recorded.')}</p>${t.note&&t.note!==n.date_note?`<p class="ia-small">${esc(t.note)}</p>`:''}<p class="ia-small">Date symbol: ${esc(dateMeaning(n,t).short)}${t.anchor!==null?' · plotting position '+esc(year(t.anchor)):''}. ${esc(dateMeaning(n,t).long)} ${t.stages?.length?'Separate stages: '+esc(t.stages.map(st=>`${year(st.start)}–${year(st.end)} (${st.label})`).join('; ')):''}</p></details><div class="ia-actions" style="margin:12px 0"><button type="button" class="ia-primary" data-action="focus-selected">Trace connections</button><button type="button" data-action="center-selected">Center in time</button><button type="button" data-action="copy-link">Copy link</button></div><details ${incoming.length?'open':''}><summary>Sources and antecedents (${incoming.length})</summary>${incoming.map(e=>relationRow(e,n.id)).join('')||'<p class="ia-small">No incoming book-to-book relation is asserted in this register.</p>'}</details><details><summary>Later reception (${outgoing.length})</summary>${outgoing.map(e=>relationRow(e,n.id)).join('')||'<p class="ia-small">No outgoing relation is asserted in this register.</p>'}</details><details><summary>Bibliography (${(n.sources||[]).length})</summary>${sourceHTML(n.sources)}</details>${extra.length?`<details><summary>Additional catalogue fields</summary><dl>${extra.map(k=>`<dt>${esc(k.replaceAll('_',' '))}</dt><dd>${esc(Array.isArray(n[k])?n[k].join('; '):n[k])}</dd>`).join('')}</dl></details>`:''}${n.kind==='independent'?'<p class="ia-small">“Independent” identifies a standalone work, not freedom from sources or influence.</p>':''}`}
    function edgeSheet(e){const a=N.get(e.source),b=N.get(e.target);return `<span class="ia-eyebrow">${esc(edgeCode(e))} · Relationship evidence</span><h2>${esc((rels[e.relation]||['',e.relation])[1])}</h2><div class="ia-detail-row"><button type="button" data-work="${esc(a.id)}" data-center="1">${esc(a.title)}</button><div class="ia-small">${esc(a.author+' · '+a.date_label)}</div></div><p class="ia-small">↓ ${esc(e.label||'')}</p><div class="ia-detail-row"><button type="button" data-work="${esc(b.id)}" data-center="1">${esc(b.title)}</button><div class="ia-small">${esc(b.author+' · '+b.date_label)}</div></div><dl><dt>Confidence</dt><dd>${esc(e.confidence)}</dd><dt>Evidence type</dt><dd>${esc(e.evidence_kind||'See the cited source record')}</dd></dl><p>${esc(e.evidence)}</p><details open><summary>Sources</summary>${sourceHTML(e.sources)}</details><p class="ia-small">Relationship type and evidentiary strength are separate. Commentary, criticism, and citation do not establish complete doctrinal agreement.</p>`}
    function historySheet(h){return `<span class="ia-eyebrow">Historical context · ${esc(h.kind||'event')}</span><h2>${esc(h.label)}</h2><dl><dt>Date</dt><dd>${esc(h.date_label||year(h.year??h.start))}</dd><dt>Region</dt><dd>${esc(h.region||'')}</dd>${h.role?`<dt>Role</dt><dd>${esc(h.role)}</dd>`:''}${h.confidence?`<dt>Qualification</dt><dd>${esc(h.confidence)}</dd>`:''}</dl><p>${esc(h.note||'')}</p><details open><summary>Historical sources</summary>${sourceHTML(h.sources)}</details><p class="ia-small">Temporal overlap does not establish teaching, patronage, agreement, residence or intellectual influence. Scholarly networks are distinct from political states.</p>`}
    function renderSheet(){const sheet=q('[data-sheet]'),open=!!state.detailType;sheet.hidden=!open;q('.ia-layout').classList.toggle('ia-has-detail',open);if(!open){sheet.innerHTML='';return}let body='';if(state.detailType==='work'&&N.has(state.detailId))body=workSheet(N.get(state.detailId));else if(state.detailType==='edge'&&E.has(state.detailId))body=edgeSheet(E.get(state.detailId));else if(state.detailType==='history'&&H.has(state.detailId))body=historySheet(H.get(state.detailId));else if(state.detailType==='source')body=`<span class="ia-eyebrow">Bibliographical record</span>${sourceHTML([state.detailId])}`;else if(state.detailType==='author'){const ns=D.nodes.filter(n=>n.author===state.detailId);body=`<span class="ia-eyebrow">Author profile</span><h2>${esc(state.detailId)}</h2><p class="ia-small">${esc([...new Set(ns.map(n=>n.author_dates))].join(' / '))}</p><p>${ns.length} entries in this selection.</p>${ns.map(n=>`<div class="ia-detail-row"><button type="button" data-work="${esc(n.id)}" data-center="1">${esc(n.title)}</button><div class="ia-small">${esc(n.date_label+' · '+family(n)[1])}</div></div>`).join('')}`}sheet.innerHTML=`<div class="ia-sheet-top"><span class="ia-small">Record details</span><button type="button" data-action="close-detail" aria-label="Close record details">Close ×</button></div>${body}`}
    function networkCard(n,e,central=false){return `<div class="ia-network-card ${central?'ia-central':''}"><span class="ia-eyebrow">${esc(n.code+' · '+family(n)[0])}</span><button type="button" data-work="${esc(n.id)}">${esc(n.title)}</button><p>${esc(n.author)}</p><p>${esc(n.date_label)}</p>${e?`<p>${esc((rels[e.relation]||['',e.relation])[1])} · ${esc(e.confidence)}</p><button type="button" class="ia-inspect" data-edge="${esc(e.id)}">${esc(edgeCode(e))} · Inspect evidence</button>`:'<p>Selected text</p>'}</div>`}
    function drawRelations(){const id=state.selected||'jurjani_mawaqif',n=N.get(id)||D.nodes[0],incoming=D.edges.filter(e=>allowedEdge(e)&&e.target===n.id),outgoing=D.edges.filter(e=>allowedEdge(e)&&e.source===n.id);q('[data-main]').innerHTML=`<div class="ia-main-head"><div><h2>Sources and later reception</h2><span class="ia-small">One textual relationship at a time · ${esc(n.title)}</span></div><div class="ia-actions"><button type="button" data-work="${esc(n.id)}">Open selected record</button><button type="button" data-action="all-relations">All ${D.edges.length} relationships</button></div></div><div class="ia-reception"><section><h3>Sources / antecedents (${incoming.length})</h3>${incoming.map(e=>networkCard(N.get(e.source),e)).join('')||'<p class="ia-small">No incoming relationship is asserted here.</p>'}</section><section><h3>Selected work</h3>${networkCard(n,null,true)}<p class="ia-small">An arrow records the stated relation; it does not establish agreement or a complete genealogy.</p></section><section><h3>Later reception (${outgoing.length})</h3>${outgoing.map(e=>networkCard(N.get(e.target),e)).join('')||'<p class="ia-small">No outgoing relationship is asserted here.</p>'}</section></div>`;visibleNodes=[n,...incoming.map(e=>N.get(e.source)),...outgoing.map(e=>N.get(e.target))];visibleEdges=[...incoming,...outgoing];updateCounts()}
    function drawCatalogue(){const ns=filteredNodes(false).sort((a,b)=>(temporal(a).anchor??9999)-(temporal(b).anchor??9999)||a.code.localeCompare(b.code)),size=35,pages=Math.max(1,Math.ceil(ns.length/size));state.page=Math.min(state.page,pages);const rows=ns.slice((state.page-1)*size,state.page*size);q('[data-main]').innerHTML=`<div class="ia-main-head"><div><h2>Work catalogue</h2><span class="ia-small">${ns.length} matching entries · This view includes entries outside the timeline window.</span></div></div><div class="ia-table-wrap"><table><thead><tr><th>Work and author</th><th>Date as recorded</th><th>Reception family</th><th>Form / region</th></tr></thead><tbody>${rows.map(n=>`<tr><td><button type="button" class="ia-table-title" data-work="${esc(n.id)}">${esc(n.code+' · '+n.title)}</button><div class="ia-table-meta">${esc(n.author)} · ${esc(n.author_dates)}</div>${n.title_ar?`<div class="ia-table-meta" lang="ar">${esc(n.title_ar)}</div>`:''}</td><td>${esc(n.date_label)}<div class="ia-table-meta">${esc(n.date_status)}</div></td><td><span class="ia-swatch" style="--ia-series:${color(n)}"></span> ${esc(family(n)[0])}<div class="ia-table-meta">${esc(family(n)[1])}</div></td><td>${esc(n.kind)}<div class="ia-table-meta">${esc(n.region)}</div></td></tr>`).join('')}</tbody></table></div><div class="ia-pagination"><button type="button" data-action="previous-page" ${state.page===1?'disabled':''}>Previous</button><span>${state.page} / ${pages}</span><button type="button" data-action="next-page" ${state.page===pages?'disabled':''}>Next</button></div>`;visibleNodes=rows;visibleEdges=[];updateCounts()}
    function drawAudit(){let html='';const tab=state.auditTab;const tabs=[['critical','Critical audit'],['notes','Method & notes'],['relations','Relationship register'],['sources','Bibliography'],['history','Historical context'],['prior','Earlier arrows']];if(tab==='critical')html=(D.audit||[]).map(a=>`<article class="ia-audit-item"><h3>${esc(a.title||a.issue)}</h3><span class="ia-small">${esc(a.action||a.verdict||'')}</span><p>${esc(a.text||a.explanation||'')}</p>${sourceButtons(a.sources)}</article>`).join('');if(tab==='notes')html=[...(D.notes||[]),...(history.method_notes||[]).map((n,i)=>typeof n==='string'?{title:'Historical context '+(i+1),text:n}:n)].map(n=>`<article class="ia-audit-item"><h3>${esc(n.title||'Method note')}</h3><p>${esc(n.text||n.note||'')}</p>${sourceButtons(n.sources)}</article>`).join('');if(tab==='notes'&&(D.contextual_relations||[]).length)html+=`<h3 style="margin-top:22px">Author-level and contextual reception notes</h3>`+(D.contextual_relations||[]).map(c=>`<article class="ia-audit-item"><h4>${esc(c.source_author)} → ${esc(N.get(c.target_work)?.title||c.target_work)}</h4><p>${esc(c.evidence)}</p><span class="ia-small">${esc(c.relation)} · ${esc(c.confidence)}</span>${sourceButtons(c.sources)}</article>`).join('');if(tab==='sources')html=sourceHTML(sourceList.filter(s=>!state.q||norm([s.title,s.author,s.id,s.note].join(' ')).includes(norm(state.q))).map(s=>s.id));if(tab==='relations'){const es=D.edges.filter(e=>allowedEdge(e)&&(!state.q||norm([e.id,e.label,e.evidence,N.get(e.source).title,N.get(e.target).title].join(' ')).includes(norm(state.q))));html=`<p class="ia-small" style="margin-top:16px">${es.length} relationships shown; ${D.edges.length} retained in the register. Select an ID for evidence.</p><div class="ia-table-wrap"><table><thead><tr><th>ID / type</th><th>Source</th><th>Recipient</th><th>Evidence status</th></tr></thead><tbody>${es.map(e=>`<tr><td><button type="button" data-edge="${esc(e.id)}">${esc(edgeCode(e))}</button><div class="ia-table-meta">${esc((rels[e.relation]||['',e.relation])[1])}</div></td><td><button type="button" data-work="${esc(e.source)}">${esc(N.get(e.source).title)}</button></td><td><button type="button" data-work="${esc(e.target)}">${esc(N.get(e.target).title)}</button></td><td>${esc(e.confidence)}<div class="ia-table-meta">${esc(e.evidence_kind||'')}</div></td></tr>`).join('')}</tbody></table></div>`}if(tab==='history')html=`<p class="ia-small" style="margin-top:16px">${historical.length} sourced context records. Period overlap is not an influence claim.</p><div class="ia-table-wrap"><table><thead><tr><th>Political period or event</th><th>Dates and scope</th><th>Region / role</th></tr></thead><tbody>${historical.filter(h=>!state.q||norm([h.label,h.region,h.note,h.role].join(' ')).includes(norm(state.q))).map(h=>`<tr><td><button type="button" class="ia-table-title" data-history="${esc(h.id)}">${esc(h.label)}</button><div class="ia-table-meta">${esc(h.kind.replaceAll('_',' '))}</div></td><td>${esc(h.date_label)}<div class="ia-table-meta">${esc(h.confidence||'')}</div></td><td>${esc(h.region||'')}<div class="ia-table-meta">${esc(h.role||'')}</div></td></tr>`).join('')}</tbody></table></div>`;if(tab==='prior')html=(D.prior_edge_audit||[]).map(a=>`<article class="ia-audit-item"><h3>${esc(a.id)}</h3><p>${esc(N.get(a.source)?.title||a.source)} → ${esc(N.get(a.target)?.title||a.target)}</p><p>${esc(a.status)}</p>${E.has(a.id)?`<button type="button" data-edge="${esc(a.id)}">Current evidence</button>`:''}${sourceButtons(a.sources)}</article>`).join('');q('[data-main]').innerHTML=`<div class="ia-main-head"><div><h2>Evidence and editorial decisions</h2><span class="ia-small">Every relationship keeps its evidence, scope, confidence, and source references.</span></div></div><div class="ia-actions">${tabs.map(([key,label])=>`<button type="button" data-audit-tab="${key}" aria-pressed="${tab===key}">${label}</button>`).join('')}</div>${html}`;visibleNodes=[];visibleEdges=[];updateCounts()}
    function updateCounts(){const total=filteredNodes(false).length,windowCount=filteredNodes(true).length,route=textualById.get(state.textFamily);let s=state.view==='timeline'?(state.to-state.from>=(lastWidth<600?300:1050)?`<strong>${visibleNodes.length}</strong> works represented in clickable century groups · zoom to examine each text`:`<strong>${visibleNodes.length}</strong> individual entries visible · ${windowCount} match this period · ${visibleEdges.length} connections drawn`):state.view==='catalogue'?`<strong>${total}</strong> matching entries · ${D.nodes.length} retained`:state.view==='relations'?`<strong>${visibleEdges.length}</strong> relationships in this focus`:`<strong>${D.edges.length}</strong> relationship records · ${sourceList.length} source records`;if(state.selected&&state.view==='timeline'){const connected=D.edges.filter(e=>allowedEdge(e)&&(e.source===state.selected||e.target===state.selected));const onscreen=new Set(visibleEdges.map(e=>e.id));const omitted=connected.filter(e=>!onscreen.has(e.id)).length;if(omitted)s+=` · ${omitted} selected connections outside the current display`}if(route)s+=' · '+route.member_ids.length+' records in '+esc(route.label)+' family (selective)';q('[data-counts]').innerHTML=s;q('[data-footer-counts]').textContent=`${D.nodes.length} entries · ${D.edges.length} textual relationships · ${historical.length} historical records`}
    function render(){sync();renderSheet();if(state.view==='timeline')drawTimeline();else if(state.view==='relations')drawRelations();else if(state.view==='catalogue')drawCatalogue();else drawAudit()}
    function changeRange(a,b,replaceHistory=false){
      if(!Number.isFinite(a)||!Number.isFinite(b)){q('[data-range-error]').textContent='Enter valid years.';return}
      let span=Math.min(historyLength,Math.max(20,b-a)),from=a,to=a+span;
      if(from<historyMin){to+=historyMin-from;from=historyMin}
      if(to>historyMax){from-=to-historyMax;to=historyMax}
      if(from<historyMin)from=historyMin;
      q('[data-range-error]').textContent='';state.from=from;state.to=to;state.page=1;
      if(replaceHistory&&state.view==='timeline'&&q('[data-chart]')){sync();drawTimeline();setHash(true)}else{render();setHash()}
    }
    function shiftRange(delta,fast=false){
      if(allYearsInView()&&delta){
        focusFromWhole((historyMin+historyMax)/2);
        const span=state.to-state.from;
        changeRange(state.from+Math.sign(delta)*span*.18,state.to+Math.sign(delta)*span*.18,fast);
        return;
      }
      changeRange(state.from+delta,state.to+delta,fast)
    }
    function zoomAt(factor,fraction=.5,fast=false){fraction=Math.max(0,Math.min(1,fraction));const old=state.to-state.from,span=Math.min(historyLength,Math.max(20,old*factor)),anchor=state.from+old*fraction;changeRange(anchor-span*fraction,anchor+span*(1-fraction),fast)}
    function centerYear(y){const span=state.to-state.from;changeRange(y-span/2,y+span/2)}
    function chooseTextFamily(key){
      const route=textualById.get(key);
      state.textFamily=route?key:'';
      state.view='timeline';state.density='all';state.links=route?'all':'focus';
      state.focusOnly=false;state.q='';state.page=1;
      state.selected=route?route.root:null;state.detailType=null;state.detailId=null;
      // Do not silently discard independent tradition, regional or evidentiary filters.
      // Textual families are orthogonal to school affiliation and regional setting.
      if(!route){changeRange(historyMin,historyMax);announce('Showing all recorded texts and historical periods');return}
      const anchors=route.member_ids.map(id=>temporal(N.get(id)).anchor).filter(Number.isFinite);
      if(!anchors.length){render();setHash();return}
      const lo=Math.min(...anchors),hi=Math.max(...anchors),spread=hi-lo;
      const pad=Math.max(45,spread*.105);
      changeRange(Math.max(historyMin,lo-pad),Math.min(historyMax,hi+pad));
      announce(route.label+' selected: '+route.member_ids.length+' recorded texts and analytical entries');
    }
    function runAction(action){const span=state.to-state.from,mid=(state.from+state.to)/2;
      if(action==='clear-text-family'){chooseTextFamily('');return}
      if(action==='reset-filters'){
        state.textFamily='';state.regionNetwork='';state.q='';state.focusOnly=false;
        state.families=new Set(Object.keys(families));state.rels=new Set(Object.keys(rels));
        state.contexts=true;state.qualified=true;state.page=1;state.view='timeline';
        render();setHash();announce('All restrictive filters cleared; the same historical years remain in view.');
        return;
      }
      if(action==='tahdhib-route'){chooseTextFamily('tahdhib');return}if(action==='whole-atlas'||action==='whole-atlas-chart'){Object.assign(state,{view:'timeline',density:'all',q:'',selected:null,detailType:null,detailId:null,focusOnly:false,depth:1,textFamily:'',regionNetwork:'',politics:true,events:true,schools:true,contexts:true,qualified:true,links:'focus'});state.families=new Set(Object.keys(families));state.rels=new Set(Object.keys(rels));changeRange(-600,2026)}if(action==='apply-range'){
        const fromText=q('#ia-from-v3').value.trim(),toText=q('#ia-to-v3').value.trim();
        const from=Number(fromText),to=Number(toText);
        const msg=!fromText||!toText||!Number.isFinite(from)||!Number.isFinite(to)?
          'Enter both valid years (negative numbers mean BCE).':
          from>=to?'The ending year must be later than the starting year.':
          from<historyMin||to>historyMax?'Choose years between 600 BCE and 2026 CE.':
          to-from<20?'Select a range of at least 20 years.':'';
        if(msg){q('[data-range-error]').textContent=msg;announce(msg);return}
        changeRange(from,to);return;
      }if(action==='zoom-in')zoomAt(.6);if(action==='zoom-out')zoomAt(1.6);if(action==='pan-back')shiftRange(-span*.25);if(action==='pan-forward')shiftRange(span*.25);if(action==='close-detail'){state.detailType=null;state.detailId=null;render();setHash()}if(action==='focus-selected'&&state.selected){state.view='relations';render();setHash()}if(action==='center-selected'&&state.selected){const t=temporal(N.get(state.selected));if(t.anchor!==null){state.view='timeline';state.density='all';changeRange(t.anchor-180,t.anchor+180)}else announce('This contextual record has no defensible calendar position.')}if(action==='copy-link'){setHash(true);if(navigator.clipboard?.writeText)navigator.clipboard.writeText(location.href).then(()=>announce('Current view link copied')).catch(()=>announce('The address bar contains the current view link'));else announce('The address bar contains the current view link')}if(action==='all-relations'){state.view='audit';state.auditTab='relations';render();setHash()}if(action==='previous-page'){state.page=Math.max(1,state.page-1);render();setHash()}if(action==='next-page'){state.page++;render();setHash()}}
    const textualSelect=q('#ia-text-family-v3');
    if(textualSelect){
      const sections=[...new Set(textualFamilies.map(f=>f.section))];
      textualSelect.innerHTML='<option value="">All texts · no textual-family filter</option>'+sections.map(section=>'<optgroup label="'+esc(section)+'">'+textualFamilies.filter(f=>f.section===section).map(f=>'<option value="'+esc(f.id)+'">'+esc(f.label)+' ('+f.member_ids.length+' recorded)</option>').join('')+'</optgroup>').join('');
    }
    const regionLabel=document.createElement('label');
    regionLabel.className='ia-field ia-region-network-control';
    regionLabel.innerHTML='<span>Regional context</span> <select id="ia-region-network-v3" data-region-network aria-label="Filter by recorded regional context"><option value="">All regions</option>'+regionNetworks.map(([id,label])=>'<option value="'+esc(id)+'">'+esc(label)+'</option>').join('')+'</select>';
    q('.ia-secondary-controls > .ia-control-row')?.appendChild(regionLabel);
    const routeStatus=q('[data-text-family-status]');
    if(routeStatus){const explorer=document.createElement('details');explorer.className='ia-route-explorer';const sections=[...new Set(textualFamilies.map(f=>f.section))];explorer.innerHTML='<summary><span class="ia-desktop-label">Browse '+textualFamilies.length+' textual commentary and transmission families</span><span class="ia-mobile-label">Text families</span></summary><div class="ia-route-groups">'+sections.map(section=>'<section><h3>'+esc(section)+'</h3>'+textualFamilies.filter(f=>f.section===section).map(f=>'<button type="button" data-text-route="'+esc(f.id)+'"><strong>'+esc(f.label)+'</strong><small>'+f.member_ids.length+' recorded entries</small></button>').join('')+'</section>').join('')+'</div><p class="ia-small">Family membership, intellectual tradition and regional context are overlapping classifications; a commentary, adaptation or reception relation is not an identity of doctrine.</p>';const shortcuts=document.createElement('div');shortcuts.className='ia-explorer-shortcuts';routeStatus.insertAdjacentElement('afterend',shortcuts);shortcuts.appendChild(explorer);
      const currentRange=items=>{const dates=items.map(n=>temporal(n).anchor).filter(Number.isFinite);if(!dates.length)return 'Dates not established';return year(Math.min(...dates))+' – '+year(Math.max(...dates))};
      const traditionDrawer=document.createElement('details');
      traditionDrawer.className='ia-route-explorer ia-tradition-explorer';
      traditionDrawer.innerHTML='<summary><span class="ia-desktop-label">Explore intellectual and reception traditions</span><span class="ia-mobile-label">Traditions</span></summary><p class="ia-small ia-explorer-note">These are primary catalogue colours, not exclusive doctrinal allegiances. Ashʿarī and Māturīdī are selectively source-audited overlays, not exhaustive biographical labels. A commentary on another school’s text is a reception relationship, not authorial allegiance.</p><div class="ia-route-groups">'+Object.entries(families).map(([key,f])=>{const subset=D.nodes.filter(n=>matchesTradition(n,key));return '<button type="button" data-tradition-route="'+esc(key)+'"><strong><i class="ia-swatch" style="--ia-series:light-dark('+f[2]+','+f[3]+')"></i> '+esc(f[1])+'</strong><small>'+subset.length+' catalogue entries · '+esc(currentRange(subset))+'</small></button>'}).join('')+'</div>';
      shortcuts.insertBefore(traditionDrawer,explorer);
      const regionalDrawer=document.createElement('details');
      regionalDrawer.className='ia-route-explorer ia-region-explorer';
      regionalDrawer.innerHTML='<summary><span class="ia-desktop-label">Explore historical and regional scholarly networks</span><span class="ia-mobile-label">Regions</span></summary><p class="ia-small ia-explorer-note">These routes use regional descriptors already recorded in the catalogue. Counts are non-exclusive and do not prove direct contact, residence or transmission.</p><div class="ia-route-groups">'+regionNetworks.map(([key,label])=>{const subset=D.nodes.filter(n=>matchesRegion(n,key));return '<button type="button" data-region-route="'+esc(key)+'"><strong>'+esc(label)+'</strong><small>'+subset.length+' recorded entries · '+esc(currentRange(subset))+'</small></button>'}).join('')+'</div>';
      shortcuts.appendChild(regionalDrawer);
    }
    q('[data-family-filters]').innerHTML=Object.entries(families).map(([key,f])=>`<label class="ia-check"><input type="checkbox" data-family="${key}" checked><span class="ia-swatch" style="--ia-series:light-dark(${f[2]},${f[3]})"></span>${esc(f[0]+' · '+f[1])}</label>`).join('');
    q('[data-relation-filters]').innerHTML=Object.entries(rels).map(([key,r])=>`<label class="ia-check"><input type="checkbox" data-rel="${key}" checked>${esc(r[0]+' · '+r[1])}</label>`).join('');
    root.addEventListener('click',event=>{if(suppressNextClick){const onChart=!!event.target.closest('[data-chart]');suppressNextClick=false;if(onChart){event.preventDefault();return}}const el=event.target.closest('button,a');if(!el||!root.contains(el))return;if(el.dataset.traditionRoute){event.preventDefault();state.families=new Set([el.dataset.traditionRoute]);state.view='timeline';state.density='all';state.page=1;render();setHash();announce('Catalogue tradition selected: '+families[el.dataset.traditionRoute][1]);return}
    if(el.dataset.regionRoute){event.preventDefault();state.regionNetwork=el.dataset.regionRoute;state.view='timeline';state.density='all';state.page=1;render();setHash();announce('Regional context selected: '+regionNetworks.find(([id])=>id===el.dataset.regionRoute)?.[1]);return}
    if(el.dataset.textRoute){event.preventDefault();chooseTextFamily(el.dataset.textRoute);return}if(el.dataset.cluster){event.preventDefault();const [a,b]=el.dataset.cluster.split(',').map(Number);const mid=(a+b)/2,target=lastWidth<600?150:340;changeRange(mid-target/2,mid+target/2);return}if(el.dataset.work){event.preventDefault();q('[data-results],#ia-results-v3')?.setAttribute('hidden','');selectNode(el.dataset.work,el.dataset.center==='1');return}if(el.dataset.edge){event.preventDefault();selectEdge(el.dataset.edge);return}if(el.dataset.history){event.preventDefault();selectHistory(el.dataset.history);return}if(el.dataset.source){state.detailType='source';state.detailId=el.dataset.source;renderSheet();setHash();return}if(el.dataset.author){state.detailType='author';state.detailId=el.dataset.author;renderSheet();setHash();return}if(el.dataset.view){state.view=el.dataset.view;state.page=1;render();setHash();return}if(el.dataset.range){const [a,b]=el.dataset.range.split(',').map(Number);state.view='timeline';changeRange(a,b);return}if(el.dataset.auditTab){state.auditTab=el.dataset.auditTab;drawAudit();setHash();return}if(el.dataset.action)runAction(el.dataset.action)});
    q('.ia-nav').addEventListener('keydown',event=>{const tabs=qa('[data-view]'),i=tabs.indexOf(document.activeElement);if(i<0)return;let next=i;if(event.key==='ArrowRight')next=(i+1)%tabs.length;else if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();tabs[next].focus();tabs[next].click()});
    root.addEventListener('change',event=>{const el=event.target;if(el.hasAttribute('data-text-family')){chooseTextFamily(el.value);return}if(el.hasAttribute('data-region-network')){state.regionNetwork=regionNetworks.some(([id])=>id===el.value)?el.value:'';state.page=1;render();setHash(true);return}if(el.dataset.control){const key=el.dataset.control;state[key]=el.type==='checkbox'?el.checked:key==='depth'?+el.value:el.value;state.page=1;render();setHash(true)}if(el.dataset.family){el.checked?state.families.add(el.dataset.family):state.families.delete(el.dataset.family);state.page=1;render();setHash(true)}if(el.dataset.rel){el.checked?state.rels.add(el.dataset.rel):state.rels.delete(el.dataset.rel);render();setHash(true)}});
    q('#ia-search-v3').addEventListener('input',event=>{state.q=event.target.value;state.page=1;clearTimeout(searchTimer);searchTimer=setTimeout(()=>{const results=D.nodes.filter(matches).slice(0,8),box=q('#ia-results-v3');box.hidden=!state.q;if(state.q)box.innerHTML=results.map(n=>`<button type="button" data-work="${esc(n.id)}" data-center="1"><span>${esc(n.code+' · '+n.title)}</span><span class="ia-small">${esc(n.author+' · '+n.date_label)}</span></button>`).join('')||'<div class="ia-small" style="padding:10px">No title or author matches.</div>';if(state.view==='timeline')drawTimeline();else if(state.view==='catalogue')drawCatalogue();else if(state.view==='audit')drawAudit();setHash(true)},180)});
    q('#ia-search-v3').addEventListener('keydown',event=>{if(event.key==='Escape'){q('#ia-results-v3').hidden=true;event.target.blur()}if(event.key==='Enter'){const first=D.nodes.find(matches);if(state.q&&first){q('#ia-results-v3').hidden=true;selectNode(first.id,true)}}});
    // Continuous scrubbing, with a single authoritative [from,to] state.
    // The rail and viewport are stable capture surfaces even when their children repaint.
    let suppressNextClick=false,drag=null,miniDrag=null,liveFrame=0,pendingFrom=null,wheelPixels=0,wheelFrame=0,wheelCommitTimer=null;
    function panFrom(from){
      const span=state.to-state.from,next=Math.max(historyMin,Math.min(historyMax-span,from));
      if(Math.abs(next-state.from)<1e-6)return;
      state.from=next;state.to=next+span;state.page=1;
      if(state.view==='timeline'&&q('[data-chart]')){sync();drawTimeline()}
      else render();
    }
    function schedulePan(from){
      const span=state.to-state.from;
      pendingFrom=Math.max(historyMin,Math.min(historyMax-span,from));
      // Cheap visual feedback even if a large SVG needs longer than one frame to paint.
      const thumb=q('.ia-travel-window');if(thumb)thumb.style.left=((pendingFrom-historyMin)/historyLength*100)+'%';
      const rail=q('[data-history-rail]');if(rail)rail.setAttribute('aria-valuetext',year(pendingFrom)+' to '+year(pendingFrom+span));
      if(!liveFrame)liveFrame=requestAnimationFrame(()=>{liveFrame=0;const value=pendingFrom;pendingFrom=null;if(value!==null)panFrom(value)});
    }
    function flushPan(){
      if(liveFrame){cancelAnimationFrame(liveFrame);liveFrame=0}
      if(pendingFrom!==null){const value=pendingFrom;pendingFrom=null;panFrom(value)}
    }
    function finishGesture(target,changed){
      if(target)target.classList.remove('ia-dragging');
      flushPan();
      if(changed){setHash(true);suppressNextClick=true;setTimeout(()=>suppressNextClick=false,260)}
    }
    root.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      const rail=event.target.closest('[data-history-rail]');
      if(rail){
        const rect=rail.getBoundingClientRect(),thumb=rail.querySelector('.ia-travel-window');
        const t=thumb?.getBoundingClientRect();
        const full=allYearsInView();
        const handle=rail.querySelector('.ia-travel-grip')?.getBoundingClientRect();
        const nearHandle=!!handle&&event.clientX>=handle.left-16&&event.clientX<=handle.right+16;
        const insideWindow=!!t&&event.clientX>=t.left-16&&event.clientX<=t.right+16;
        // At 100% zoom the highlighted thumb fills the entire rail. Distinguish
        // the six-dot grip (drag to restore focus) from the rest (tap to seek).
        if(full&&!nearHandle){
          const anchor=historyMin+(event.clientX-rect.left)/rect.width*historyLength;
          focusFromWhole(anchor);
        }
        const mode=full?(nearHandle?'whole-grip':'seek'):(insideWindow?'move':'seek');
        miniDrag={pointer:event.pointerId,rail,rect,x:event.clientX,from:state.from,span:state.to-state.from,
          mode,moved:full&&!nearHandle};
        rail.setPointerCapture(event.pointerId);
        if(mode==='seek')schedulePan(historyMin+(event.clientX-rect.left)/rect.width*historyLength-miniDrag.span/2);
        return;
      }
      const chart=event.target.closest('[data-chart]');if(!chart||state.view!=='timeline')return;
      drag={pointer:event.pointerId,chart,x:event.clientX,y:event.clientY,from:state.from,span:state.to-state.from,moved:false,touch:event.pointerType==='touch'};
      // Do not capture an ordinary click. Capturing before a real drag retargets
      // the SVG <a> click to the chart and breaks work and century selection.
    });
    root.addEventListener('pointermove',event=>{
      if(miniDrag&&event.pointerId===miniDrag.pointer){
        const g=miniDrag,dx=event.clientX-g.x;
        if(g.mode==='whole-grip'){
          if(Math.abs(dx)<=4)return; // Just tapping the grip preserves Whole atlas.
          const yearAtGrip=historyMin+(g.x-g.rect.left)/g.rect.width*historyLength;
          focusFromWhole(yearAtGrip);
          g.from=state.from;g.span=state.to-state.from;g.mode='move';g.moved=true;
          g.rail.classList.add('ia-dragging');
        }
        if(Math.abs(dx)>2)g.moved=true;
        const value=g.mode==='move'?g.from+dx/g.rect.width*historyLength:
          historyMin+(event.clientX-g.rect.left)/g.rect.width*historyLength-g.span/2;
        schedulePan(value);
        return;
      }
      if(!drag||event.pointerId!==drag.pointer)return;
      const g=drag,dx=event.clientX-g.x,dy=event.clientY-g.y;
      if(g.touch&&!g.moved&&Math.abs(dy)>Math.abs(dx)*1.15)return; // native vertical scrolling
      if(!g.moved&&Math.abs(dx)>5&&(!g.touch||Math.abs(dx)>Math.abs(dy)*1.15)){
        g.moved=true;g.chart.classList.add('ia-dragging');
        // Capture only once panning is deliberate; click/tap targets remain intact.
        try{g.chart.setPointerCapture(event.pointerId)}catch{}
      }
      if(g.moved){
        if(event.cancelable)event.preventDefault();
        if(g.span>=historyLength-.01){
          const rect=g.chart.getBoundingClientRect();
          const fraction=Math.max(0,Math.min(1,(g.x-rect.left)/rect.width));
          focusFromWhole(historyMin+fraction*historyLength,fraction);
          g.from=state.from;g.span=state.to-state.from;
        }
        schedulePan(g.from-dx/Math.max(220,lastWidth-38)*g.span);
      }
    });
    root.addEventListener('pointerup',event=>{
      if(miniDrag&&event.pointerId===miniDrag.pointer){
        const g=miniDrag;miniDrag=null;
        if(g.mode==='whole-grip'&&!g.moved){finishGesture(g.rail,false);return}
        if(g.moved){const dx=event.clientX-g.x;const value=g.mode==='move'?g.from+dx/g.rect.width*historyLength:
          historyMin+(event.clientX-g.rect.left)/g.rect.width*historyLength-g.span/2;schedulePan(value)}
        finishGesture(g.rail,g.moved);return;
      }
      if(!drag||event.pointerId!==drag.pointer)return;
      const g=drag;drag=null;
      if(g.moved)schedulePan(g.from-(event.clientX-g.x)/Math.max(220,lastWidth-38)*g.span);
      finishGesture(g.chart,g.moved);
    });
    root.addEventListener('pointercancel',event=>{
      if(drag&&drag.pointer===event.pointerId){const g=drag;drag=null;finishGesture(g.chart,g.moved)}
      if(miniDrag&&miniDrag.pointer===event.pointerId){const g=miniDrag;miniDrag=null;finishGesture(g.rail,g.moved)}
    });
    root.addEventListener('wheel',event=>{
      const chart=event.target.closest('[data-chart]');if(!chart||state.view!=='timeline')return;
      const horizontal=Math.abs(event.deltaX)>Math.abs(event.deltaY)*1.12;
      if(!event.shiftKey&&!horizontal&&!event.ctrlKey&&!event.metaKey&&!event.altKey)return; // native vertical scroll
      event.preventDefault();
      const rect=chart.getBoundingClientRect(),fraction=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
      if(event.ctrlKey||event.metaKey||event.altKey){zoomAt(Math.exp(Math.max(-2,Math.min(2,event.deltaY/180))*.23),fraction,true);return}
      // A full-range horizontal wheel gesture cannot pan until a narrower
      // focus window exists; reuse the most recent browsing zoom.
      if(allYearsInView())focusFromWhole(historyMin+fraction*historyLength,fraction);
      const units=event.deltaMode===1?16:event.deltaMode===2?rect.width:1;
      wheelPixels+=(event.shiftKey?(Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY):event.deltaX)*units;
      if(!wheelFrame)wheelFrame=requestAnimationFrame(()=>{
        wheelFrame=0;const pixels=wheelPixels;wheelPixels=0;
        if(Math.abs(pixels)>.01)panFrom(state.from+pixels/Math.max(220,lastWidth-38)*(state.to-state.from));
      });
      clearTimeout(wheelCommitTimer);wheelCommitTimer=setTimeout(()=>{flushPan();setHash(true)},180);
    },{passive:false});
    root.addEventListener('keydown',event=>{
      if(!event.target.closest('[data-chart],[data-history-rail]'))return;
      const rail=!!event.target.closest('[data-history-rail]'),span=state.to-state.from;
      if(event.key==='ArrowLeft'){event.preventDefault();shiftRange(-(rail?span*.3:span*.15))}
      else if(event.key==='ArrowRight'){event.preventDefault();shiftRange(rail?span*.3:span*.15)}
      else if(['+','=','Add'].includes(event.key)){event.preventDefault();zoomAt(.6)}
      else if(['-','_','Subtract'].includes(event.key)){event.preventDefault();zoomAt(1.6)}
      else if(event.key==='Home'){event.preventDefault();changeRange(historyMin,historyMin+span)}
      else if(event.key==='End'){event.preventDefault();changeRange(historyMax-span,historyMax)}
      else if(event.key==='PageUp'){event.preventDefault();shiftRange(-span*.7)}
      else if(event.key==='PageDown'){event.preventDefault();shiftRange(span*.7)}
    });
    document.addEventListener('click',event=>{if(!event.target.closest('#kalam-timeline-app-v3 .ia-search'))q('#ia-results-v3').hidden=true});
    window.addEventListener('popstate',()=>{readHash();render()});window.addEventListener('hashchange',()=>{readHash();render()});
    if(window.ResizeObserver)new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const chart=q('[data-chart]');if(state.view==='timeline'&&chart&&Math.abs(chart.getBoundingClientRect().width-lastWidth)>3)drawTimeline()},100)}).observe(q('[data-main]'));
    // Preserve all research information while making the mobile first screen
    // about exploring the visualization, rather than reading a long preface.
    const compactLayout=window.matchMedia('(max-width:700px), (max-height:550px) and (pointer:coarse)');
    function configureLanding(){
      const compact=compactLayout.matches;
      for(const selector of ['.gn-atlas-introduction','.ia-secondary-controls']){
        const d=q(selector);if(d)d.open=!compact;
      }
      root.dataset.mobileReady='true';
    }
    configureLanding();
    if(compactLayout.addEventListener)compactLayout.addEventListener('change',configureLanding);
    readHash();render();
    if(safeReader)requestAnimationFrame(()=>q('.ia-layout').scrollIntoView({block:'start'}));
    root.atlasTest={data:D,state,render,selectNode,selectEdge,selectHistory,temporal,filteredNodes,timelineNodes,getVisible:()=>({nodes:visibleNodes.map(n=>n.id),edges:visibleEdges.map(e=>e.id)}),setView:v=>{state.view=v;render()},setRange:(a,b)=>changeRange(a,b),zoomAt,centerYear,shiftRange};
  })();
  

