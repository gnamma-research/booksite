
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
    // Source-based textual families may overlap: the same work ID is never duplicated.
    // A selected family can expose its critical/adjudicative links without an author-specific toolbar control.
    const criticalFamilyEdges=new Map(textualFamilies.map(f=>[f.id,D.edges.filter(e=>e.relation==='critique'&&f.member_ids.includes(e.source)&&f.member_ids.includes(e.target))]));
    const criticalFamilyMembers=new Map(textualFamilies.map(f=>[f.id,new Set([f.root,...(criticalFamilyEdges.get(f.id)||[]).flatMap(e=>[e.source,e.target])])]));
    const N=new Map(D.nodes.map(n=>[n.id,n])),E=new Map(D.edges.map(e=>[e.id,e]));
    // Directed response network, not a doctrinal school or a textual family.
    // Require an explicitly evidenced critical edge from a work by Fakhr al-Din;
    // Quṭb al-Dīn al-Rāzī is a distinct writer, not the author under study.
    const fakhrWorks=new Set(D.nodes.filter(n=>n.author==='Fakhr al-Dīn al-Rāzī').map(n=>n.id));
    const raziResponseEdges=D.edges.filter(e=>fakhrWorks.has(e.source)&&e.relation==='critique'&&e.evidence&&(e.sources||[]).length);
    const raziResponseEdgeIds=new Set(raziResponseEdges.map(e=>e.id));
    // Independently evidenced context only: Ishārāt base commentaries and
    // Ṭūsī's second input to Quṭb's adjudication. Not counted as replies to Rāzī.
    const raziContextEdgeIds=new Set(['F_e05','F_e06','F_e15'].filter(id=>E.has(id)));
    const raziRouteEdgeIds=new Set([...raziResponseEdgeIds,...raziContextEdgeIds]);
    const raziRouteMembers=new Set([...raziRouteEdgeIds].flatMap(id=>{const e=E.get(id);return e?[e.source,e.target]:[]}));
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
    const state={view:'timeline',from:1075,to:1450,regionNetwork:'',density:'all',links:'focus',q:'',selected:null,detailType:null,detailId:null,families:new Set(Object.keys(families)),rels:new Set(Object.keys(rels)),politics:true,events:true,schools:true,contexts:true,qualified:true,focusOnly:false,depth:1,page:1,auditTab:'critical',textFamily:'',familyCriticalOnly:false,responseRoute:'',sourceScience:'fiqh',sourceTab:'texts',sourceMadhhab:'all'};
    /* Full chronology is available by drag; no hidden selected-only subset on first load. */
    let visibleNodes=[],visibleEdges=[],locations=new Map(),lastWidth=0,resizeTimer,searchTimer,panStart=null;
    const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)];
    // Source maps are a second, explicitly separate evidence layer, not aliases
    // for the 404 canonical philosophical/kalām timeline records.
    const sourceScienceNames={fiqh:'Fiqh & uṣūl',hadith:'Hadith',tafsir:'Tafsīr',tasawwuf:'Taṣawwuf',arabic:'Arabic language sciences'};
    const sourceMapTabs={
      fiqh:[['texts','Legal texts'],['issues','Legal questions'],['method','Uṣūl method']],
      hadith:[['collections','Collections'],['reports','Reports'],['isnads','Isnāds'],['commentaries','Commentaries']],
      tafsir:[['passages','Passages'],['texts','Tafsīr texts'],['questions','Questions']],
      tasawwuf:[['texts','Text chronology']],
      arabic:[['nahw','Grammar'],['sarf','Morphology'],['balagha','Balāgha'],['lugha','Lexicography']]
    };
    let sourceRegistry=null,sourceRequest=null,sourceLoadError='',sourceShown=0,sourceLinks=0;
    function ensureSourceRegistry(){
      if(sourceRegistry||sourceRequest||sourceLoadError)return;
      sourceRequest=fetch('corpora/registry.json')
        .then(response=>{if(!response.ok)throw Error('Source register HTTP '+response.status);return response.json()})
        .then(reg=>{if(!Array.isArray(reg.books)||!Array.isArray(reg.relationships))throw Error('Unexpected source register format');sourceRegistry=reg;sourceLoadError='';})
        .catch(error=>{sourceLoadError=String(error?.message||error||'Source register unavailable')})
        .finally(()=>{sourceRequest=null;if(state.view==='sources')render()});
    }
    // Manuscript catalogues are a separate bibliographic layer. One public
    // shortlist is fetched lazily, without treating any catalogue work as
    // an acquired edition or a demonstrated commentary edge.
    let manuscriptShortlist=null,manuscriptRequest=null,manuscriptFailed=false;
    function ensureManuscriptShortlist(){
      if(manuscriptShortlist||manuscriptRequest||manuscriptFailed)return;
      manuscriptRequest=fetch('corpora/manuscript-shortlist.json')
        .then(r=>r.ok?r.json():Promise.reject(Error('Manuscript bibliography HTTP '+r.status)))
        .then(d=>{if(!Array.isArray(d.works))throw Error('Invalid manuscript shortlist');manuscriptShortlist=d;})
        .catch(()=>{manuscriptFailed=true})
        .finally(()=>{manuscriptRequest=null;if(state.view==='sources')render()});
    }
    function sourceResearchExpansion(science,tab,school){
      const genre=science==='fiqh'?(tab==='method'?'usul':'fiqh'):
        science==='arabic'?tab:science;
      const available=genre==='fiqh'||genre==='usul'||genre==='nahw'||genre==='sarf'||genre==='balagha';
      if(!available)return '';
      const code=genre==='fiqh'?'fiqh':genre==='usul'?'usul':genre;
      const query='#science='+encodeURIComponent(code)+
        ((code==='fiqh'||code==='usul')&&school!=='all'?'&school='+encodeURIComponent(school):'');
      const href='corpora/expansion.html'+query;
      if(!manuscriptShortlist){
        if(!manuscriptFailed)ensureManuscriptShortlist();
        return '<div class="ia-source-expansion"><strong>Expanded scholarly bibliography</strong>'+
          '<p>'+ (manuscriptFailed?'Manuscript catalogue unavailable in this view.':'Loading catalogue candidates…')+
          '</p><a href="'+esc(href)+'">Browse the expanded catalogue</a></div>';
      }
      const selected=manuscriptShortlist.works.filter(w=>w.genres?.includes(code)&&
        (school==='all'||!['fiqh','usul'].includes(code)||w.school===school));
      const examples=selected.slice(0,12).map(w=>
        '<a href="'+esc(w.catalogue_url)+'" target="_blank" rel="noopener noreferrer">'+
          '<span dir="rtl" lang="ar">'+esc(w.title_ar)+'</span>'+
          '<small>'+esc(truncate(w.author_ar||'',58))+' · manuscript catalogue</small></a>'
      ).join('');
      return '<section class="ia-source-expansion"><h3>'+selected.length+
        ' additional manuscript bibliography records for this selection</h3>'+
        '<p>Catalogue references only, not readable texts. Scholarly book/issue dependencies are not inferred. '+ 
        'A separate OpenITI catalogue offers further primary-version candidates.</p>'+
        '<div class="ia-source-expansion-grid">'+examples+'</div>'+
        '<a class="ia-expansion-all" href="'+esc(href)+'">Browse all candidate works and source evidence</a></section>';
    }
    function chooseScienceView(science,tab,madhhab){
      if(!sourceMapTabs[science])return;
      const tabs=sourceMapTabs[science],validTab=tabs.some(([id])=>id===tab)?tab:tabs[0][0];
      state.sourceScience=science;state.sourceTab=validTab;
      state.sourceMadhhab=['all','hanafi','maliki','shafii','hanbali','early','named_other','unassigned'].includes(madhhab)?madhhab:'all';
      activeScience=science;activeScienceTab=validTab;activeMadhhab=state.sourceMadhhab;
      state.view='sources';state.selected=null;state.detailType=null;state.detailId=null;
      state.textFamily='';state.familyCriticalOnly=false;state.responseRoute='';state.q='';
      state.page=1;q('.ia-secondary-controls').open=false;
      render();setHash();announce((sourceScienceNames[science]||science)+' source map selected');
    }
    // Adds a genuine view, rather than leaving the previous timeline in place.
    q('.ia-nav')?.insertAdjacentHTML('beforeend','<button type="button" role="tab" id="ia-tab-sources-v3" aria-controls="ia-main-v3" data-view="sources" aria-selected="false">Source maps</button>');
    q('[data-view-picker]')?.insertAdjacentHTML('beforeend','<option value="sources">Source maps</option>');
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
    function allowedEdge(e){return (!state.familyCriticalOnly||e.relation==='critique')&&(!state.responseRoute||raziRouteEdgeIds.has(e.id))&&state.rels.has(e.relation)&&(state.qualified||!weak.has(e.confidence))}
    function neighborhood(id,depth=1){const out=new Set(id?[id]:[]);for(let z=0;z<depth;z++){const before=new Set(out);for(const e of D.edges)if(allowedEdge(e)&&(before.has(e.source)||before.has(e.target))){out.add(e.source);out.add(e.target)}}return out}
    function filteredNodes(windowed=false){const near=neighborhood(state.selected,state.depth);return D.nodes.filter(n=>(!state.familyCriticalOnly||criticalFamilyMembers.get(state.textFamily)?.has(n.id))&&(!state.responseRoute||raziRouteMembers.has(n.id))&&(!state.textFamily||textualMembers.get(state.textFamily)?.has(n.id))&&matchesRegion(n,state.regionNetwork)&&([n.tradition,...(n.intellectual_traditions||[])].some(k=>state.families.has(k)))&&(state.contexts||n.node_type==='work')&&matches(n)&&(!state.focusOnly||!state.selected||near.has(n.id))&&(!windowed||inWindow(n)))}
    function timelineNodes(){const all=filteredNodes(true),near=neighborhood(state.selected,state.depth);return all.filter(n=>state.density==='all'||state.q||highlights.has(n.id)||(state.from<600&&n.summary&&temporal(n).anchor<600)||near.has(n.id))}
    function sourceButtons(ids){return `<div class="ia-sources-inline">${(ids||[]).map(id=>`<button type="button" data-source="${esc(id)}">${esc(id)}</button>`).join('')}</div>`}
    function sourceHTML(ids){return [...new Set(ids||[])].map(id=>{const s=S.get(id);if(!s)return `<div class="ia-source">${esc(id)} · Source record unavailable</div>`;return `<div class="ia-source"><span class="ia-small">${esc(id)}${s.type?' · '+esc(s.type):''}</span><div>${esc(s.author||'')}</div>${s.url?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`:`<strong>${esc(s.title)}</strong>`}${s.locator?`<div>${esc(s.locator)}</div>`:''}${s.note?`<div class="ia-small">${esc(s.note)}</div>`:''}${s.accessed?`<div class="ia-small">Accessed ${esc(s.accessed)}</div>`:''}</div>`}).join('')}
    function setHash(replace=false){const p=new URLSearchParams({view:state.view,from:Math.round(state.from),to:Math.round(state.to),density:state.density,links:state.links});if(state.selected)p.set('work',state.selected);if(state.textFamily)p.set('text_family',state.textFamily);if(state.familyCriticalOnly&&state.textFamily)p.set('critical','1');if(state.responseRoute)p.set('responses','razi');if(state.regionNetwork)p.set('region',state.regionNetwork);if(state.detailType==='edge')p.set('edge',state.detailId);if(state.detailType==='history')p.set('history',state.detailId);if(state.detailType==='source')p.set('source',state.detailId);if(state.detailType==='author')p.set('author',state.detailId);if(state.view==='audit')p.set('section',state.auditTab);if(state.q)p.set('q',state.q);if(state.focusOnly)p.set('focus','1');if(state.depth>1)p.set('depth',String(state.depth));if(state.families.size!==Object.keys(families).length)p.set('families',[...state.families].join(','));if(state.rels.size!==Object.keys(rels).length)p.set('rels',[...state.rels].join(','));if(!state.qualified)p.set('certain','1');if(!state.schools)p.set('networks','0');if(!state.politics)p.set('politics','0');if(!state.events)p.set('events','0');if(!state.contexts)p.set('contexts','0');if(state.view==='catalogue'&&state.page>1)p.set('page',String(state.page));if(safeReader)p.set('reader',safeReader);if(state.view==='sources'){p.set('science',state.sourceScience);p.set('source_tab',state.sourceTab);if(state.sourceScience==='fiqh')p.set('madhhab',state.sourceMadhhab)}if(state.view==='sources'){const extras=new URLSearchParams(location.hash.slice(1));for(const key of ['bib_tier','bib_line','bib_band','bib_period','bib_page','bib_work','gn_group','gn_author','gn_work','gn_source','gn_page','gn_zoom','sa_mode','sa_from','sa_to','sa_lane','sa_undated','sa_book','sa_edge','sa_page','sa_source','cs'])if(extras.has(key))p.set(key,extras.get(key))}const hash='#'+p.toString();
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
    function readHash(){try{const p=new URLSearchParams(location.hash.slice(1));if(!['view','work','edge','history','text_family','critical','responses','region','source','author','section','q','families','rels','from','to','density','links','focus','depth','certain','networks','politics','events','contexts','page','science','source_tab','madhhab'].some(key=>p.has(key)))return;const v=p.get('view');if(['timeline','network','relations','catalogue','audit','sources'].includes(v))state.view=v;if(state.view==='sources'){state.sourceScience=sourceMapTabs[p.get('science')]?p.get('science'):'fiqh';const tabs=sourceMapTabs[state.sourceScience];state.sourceTab=tabs.some(([id])=>id===p.get('source_tab'))?p.get('source_tab'):tabs[0][0];state.sourceMadhhab=['all','hanafi','maliki','shafii','hanbali','early','named_other','unassigned'].includes(p.get('madhhab'))?p.get('madhhab'):'all';activeScience=state.sourceScience;activeScienceTab=state.sourceTab;activeMadhhab=state.sourceMadhhab;}const a=Number(p.get('from')),b=Number(p.get('to'));
      if(p.has('from')&&p.has('to')&&Number.isFinite(a)&&Number.isFinite(b)&&b>a){
        // Clamp an entire interval rather than clamping its endpoints
        // independently (which can produce an inverted timeline).
        const span=Math.min(historyLength,Math.max(20,b-a));
        const from=Math.max(historyMin,Math.min(historyMax-span,a));
        state.from=from;state.to=from+span;
      }
      state.density=p.get('density')==='highlights'?'highlights':'all';state.links=['focus','all','none'].includes(p.get('links'))?p.get('links'):'focus';state.selected=N.has(p.get('work'))?p.get('work'):null;state.detailType=state.selected?'work':null;state.detailId=state.selected;if(E.has(p.get('edge'))){state.detailType='edge';state.detailId=p.get('edge')}if(H.has(p.get('history'))){state.detailType='history';state.detailId=p.get('history')}if(S.has(p.get('source'))){state.detailType='source';state.detailId=p.get('source')}if(p.has('author')&&D.nodes.some(n=>n.author===p.get('author'))){state.detailType='author';state.detailId=p.get('author')}if(['critical','notes','relations','sources','prior','history'].includes(p.get('section')))state.auditTab=p.get('section');state.q=p.get('q')||'';state.focusOnly=p.get('focus')==='1';state.textFamily=textualById.has(p.get('text_family'))?p.get('text_family'):'';state.familyCriticalOnly=!!state.textFamily&&p.get('critical')==='1';if(state.textFamily){if(!p.has('links'))state.links='all';if(!p.has('from')&&!p.has('to')){
          const f=textualById.get(state.textFamily),ids=state.familyCriticalOnly?[...(criticalFamilyMembers.get(state.textFamily)||[])]:f.member_ids;
          const years=ids.map(id=>N.has(id)?temporal(N.get(id)).anchor:null).filter(Number.isFinite);
          if(years.length){const lo=Math.min(...years),hi=Math.max(...years),pad=Math.max(35,(hi-lo)*.12),span=Math.min(historyLength,Math.max(20,hi-lo+2*pad));state.from=Math.max(historyMin,Math.min(historyMax-span,lo-pad));state.to=state.from+span;}
        }}state.responseRoute=p.get('responses')==='razi'?'razi':'';if(state.responseRoute){if(!p.has('links'))state.links='all';if(!p.has('from')&&!p.has('to')){const anchors=[...raziRouteMembers].map(id=>temporal(N.get(id)).anchor).filter(Number.isFinite);if(anchors.length){const low=Math.min(...anchors),high=Math.max(...anchors),pad=Math.max(35,(high-low)*.1);state.from=Math.max(historyMin,low-pad);state.to=Math.min(historyMax,high+pad)}}}state.regionNetwork=regionNetworks.some(([key])=>key===p.get('region'))?p.get('region'):'';state.depth=[1,2,3,4].includes(+p.get('depth'))?+p.get('depth'):1;state.qualified=p.get('certain')!=='1';state.schools=p.get('networks')!=='0';state.politics=p.get('politics')!=='0';state.events=p.get('events')!=='0';state.contexts=p.get('contexts')!=='0';state.page=Number.isInteger(+p.get('page'))&&+p.get('page')>0?Math.min(1000,+p.get('page')):1;state.families=p.has('families')?new Set(p.get('families').split(',').filter(x=>families[x])):new Set(Object.keys(families));state.rels=p.has('rels')?new Set(p.get('rels').split(',').filter(x=>rels[x])):new Set(Object.keys(rels));if(state.responseRoute){state.textFamily='';if(!p.has('links'))state.links='all';state.rels.add('critique');state.rels.add('commentary');state.contexts=true;state.qualified=true;if(state.selected&&!raziRouteMembers.has(state.selected))state.selected=null;if(!p.has('from')&&!p.has('to')){const years=[...raziRouteMembers].map(id=>temporal(N.get(id)).anchor).filter(Number.isFinite);if(years.length){const lo=Math.min(...years),hi=Math.max(...years),pad=Math.max(35,(hi-lo)*.1);state.from=Math.max(historyMin,lo-pad);state.to=Math.min(historyMax,hi+pad)}}}}catch{}}
    function sync(){if(!state.selected)state.focusOnly=false;qa('[data-view]').forEach(b=>b.setAttribute('aria-selected',b.dataset.view===state.view));const viewPicker=q('[data-view-picker]');if(viewPicker)viewPicker.value=state.view;const advanced=q('.ia-secondary-controls');const advancedToggle=q('[data-action="toggle-advanced"]');if(advanced&&advancedToggle)advancedToggle.setAttribute('aria-expanded',String(advanced.open));q('#ia-from-v3').value=Math.round(state.from);q('#ia-to-v3').value=Math.round(state.to);q('#ia-search-v3').value=state.q;const textControl=q('#ia-text-family-v3');if(textControl)textControl.value=state.textFamily;const regionSelect=q('#ia-region-network-v3');if(regionSelect)regionSelect.value=state.regionNetwork;const scope=q('[data-text-family-status]');if(scope){const f=textualById.get(state.textFamily);const total=f?f.member_ids.length:D.nodes.length;const matched=filteredNodes(false).length;scope.classList.toggle('ia-route-active',!!f||!!state.responseRoute);scope.innerHTML=f?'<strong>'+esc(f.label)+'</strong> · '+matched+' of '+total+' recorded members match the current tradition, region and search filters. '+esc(f.scope)+' <button type="button" data-action="clear-text-family" class="ia-clear-family">Return to all texts</button>':'Explore a named text and its commentary/gloss family without changing the intellectual-tradition colors. '+matched+' of '+D.nodes.length+' recorded entries match the active filters.';}if(state.responseRoute&&scope){scope.classList.add('ia-route-active');scope.innerHTML='<strong>Responses to Fakhr al-Dīn al-Rāzī</strong> · '+raziResponseEdges.length+' documented replies or adjudications, plus '+raziContextEdgeIds.size+' lighter context links. Quṭb al-Dīn is a different Rāzī; adjudication is not assumed to be rejection. Select <button type="button" class="ia-clear-family" data-action="show-razi-responses">Inspect response evidence</button> or <button type="button" class="ia-clear-family" data-action="clear-razi-responses">All texts</button>. This source-specific route is selective, not exhaustive.';}if(scope&&state.textFamily&&!state.responseRoute){      const critical=criticalFamilyEdges.get(state.textFamily)||[];      if(critical.length)scope.querySelector('strong')?.insertAdjacentHTML('afterend',' <label class="ia-family-critique-toggle" title="Show only evidenced critical engagements, replies and adjudications within this textual family"><input type="checkbox" data-family-critical '+(state.familyCriticalOnly?'checked':'')+'> Critical links ('+critical.length+')</label>');    }qa('[data-control]').forEach(el=>{const key=el.dataset.control;if(el.type==='checkbox')el.checked=!!state[key];else el.value=state[key];if(key==='focusOnly'){el.disabled=!state.selected;el.title=state.selected?'Limit the chart to connections of the selected text':'Select a work before using neighborhood focus'}});qa('[data-family]').forEach(e=>e.checked=state.families.has(e.dataset.family));qa('[data-rel]').forEach(e=>e.checked=state.rels.has(e.dataset.rel));q('[data-timeline-controls]').hidden=state.view!=='timeline';q('[data-main]').setAttribute('aria-labelledby','ia-tab-'+state.view+'-v3');if(state.view==='sources'&&scope){scope.classList.add('ia-route-active');scope.innerHTML='<strong>'+esc(sourceScienceNames[state.sourceScience])+' · historical work atlas</strong> · Explore a shared year-axis chronology of cited texts, or a separate vertical synopsis of major works. Approximate author-death dates are not composition dates. Only explicitly sourced textual relationships have arrows.'}}
    function selectNode(id,center=false){if(!N.has(id))return;if(state.responseRoute&&!raziRouteMembers.has(id))state.responseRoute='';if(state.textFamily&&!textualMembers.get(state.textFamily)?.has(id)){state.textFamily='';state.familyCriticalOnly=false}if(state.regionNetwork&&!matchesRegion(N.get(id),state.regionNetwork))state.regionNetwork='';
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
      if(window.GNCanonicalSynopsis?.enabled()){
        const selection=filteredNodes(false);
        window.GNCanonicalSynopsis.render({root,data:D,viewNodes:selection,selectedId:state.selected});
        visibleNodes=selection;visibleEdges=[];updateCounts();return;
      }
      if(!q('[data-chart]'))main.innerHTML=`<div class="ia-main-head"><div><h2>Texts, empires and events</h2><span class="ia-small" data-range-caption></span></div><div class="ia-actions"><button type="button" data-action="pan-back" aria-label="Earlier period">← Earlier</button><button type="button" data-action="zoom-in" aria-label="Zoom into timeline">+ Zoom</button><button type="button" data-action="zoom-out" aria-label="Zoom out of timeline">− Zoom</button><button type="button" data-action="pan-forward" aria-label="Later period">Later →</button><button type="button" data-action="canonical-summary" aria-label="Vertical synopsis of principal texts">Principal texts ↓</button><button type="button" data-action="whole-atlas-chart" class="ia-chart-whole" aria-label="Show all historical years">All years</button></div></div><div class="ia-nav-overview"><span>600 BCE</span><div class="ia-travel-track" data-history-rail tabindex="0" role="slider" aria-label="Move the visible time window; drag its six-dot handle or use the arrow keys" aria-valuemin="-600" aria-valuemax="2026" aria-valuenow="1300" aria-orientation="horizontal"></div><span>2026</span><span class="ia-zoom-tag" data-scale-caption></span></div><div class="ia-chart" data-chart tabindex="0" role="region" aria-label="Continuously pan or zoom the timeline; book labels are connected to independent date marks"></div><details class="ia-timeline-help"><summary>How to use the timeline and understand dates</summary><div><p class="ia-travel-help">Drag the overview's <strong>six-dot handle</strong> to move continuously through history. When <strong>Whole atlas</strong> shows every year, dragging it first restores a movable zoomed window; tap elsewhere on the bar to jump to an era. Swipe/drag the diagram horizontally to pan; scroll vertically to read. Shift + wheel / horizontal trackpad pan; Ctrl/⌘ + wheel zooms. Keyboard: ← →, + −, Home, End.</p><p class="ia-date-guide"><strong>Work labels are not time spans.</strong> The small mark linked to each title is the date evidence: <strong>■</strong> an attested year, <strong>◆</strong> approximate position, <strong>◀</strong> latest possible date, <strong>⋯</strong> an uncertain window or separate stages. A book's label width has no chronological meaning.</p></div></details><div class="ia-legend"><span><b>■</b> attested year (small square)</span><span><b>⋯</b> uncertain window, NOT a duration</span><span><b>◀</b> latest bound (not completion)</span><span><b>◇</b> approximate or contextual</span><span><b>□</b> edition / publication witness</span><span><b>│</b> historical event</span><span><b>┄</b> interrupted territorial rule</span><span><b>▤</b> scholarly network (not a state)</span><span><b>→</b> textual relationship</span></div><div class="ia-family-legend" data-visible-families></div><p class="ia-bound-warning">Event rules share the texts’ calendar axis. Bounds retain their uncertainty; chronological overlap does not establish influence or patronage.</p><div data-unplaced></div>`;
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
      const span=state.to-state.from,overviewMode=!state.responseRoute&&!state.familyCriticalOnly&&span>=(W<600?300:1050),deepMode=span<=240,mediumMode=span<=580,coreEvents=new Set(['HEV01','HEV02','HEV05','HEV06','HEV07','HEV08','HEV12','HEV15','HL_E01','HL_E03','HL_E04','HL_E06','HL_E07','HL_E08','HL_E09','HL_E12','HL_E14','HL_E18','HL_E20']);
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
      for(const e of visibleEdges){const a=pos.get(e.source),b=pos.get(e.target);if(!a||!b)continue;const sign=b.y>=a.y?1:-1,dx=Math.max(28,Math.min(95,Math.abs(b.x-a.x)*.3));const d=`M ${a.x} ${a.y} C ${a.x+dx} ${a.y+sign*24}, ${b.x-dx} ${b.y-sign*24}, ${b.x} ${b.y}`;const isWeak=weak.has(e.confidence)||['hypothesis','claimed_lineage','broad_influence','author_reference'].includes(e.relation),dash=isWeak?'2 4':e.relation==='textual_use'?'6 3':'';paths.push(`<a href="#edge=${esc(e.id)}" data-edge="${esc(e.id)}" aria-label="${esc((state.responseRoute&&raziContextEdgeIds.has(e.id)?'Context only · ':'')+edgeCode(e)+': '+(rels[e.relation]||['',e.relation])[1]+'; '+N.get(e.source).title+' to '+N.get(e.target).title)}" data-tooltip="${esc(edgeCode(e)+' · '+(rels[e.relation]||['',e.relation])[1])}"><path class="ia-relation ${e.relation==='critique'?'ia-critique':''} ${state.responseRoute?(raziResponseEdgeIds.has(e.id)?'ia-route-response':'ia-route-context'):''}" d="${d}" ${dash?`stroke-dasharray="${dash}"`:''} marker-end="url(#${e.relation==='critique'?(isWeak?'ia-arrow-xopen-v3':'ia-arrow-x-v3'):(isWeak?'ia-arrow-open-v3':'ia-arrow-v3')})" ${e.relation==='exchange'?'marker-start="url(#ia-arrow-v3)"':''}/><path class="ia-edge-hit" d="${d}"/></a>`)}
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

    function drawRaziRelations(){
      const es=raziResponseEdges.filter(allowedEdge);
      const cards=es.map(e=>{
        const a=N.get(e.source),b=N.get(e.target);
        return '<article class="ia-response-card"><span class="ia-eyebrow">'+esc(edgeCode(e))+' · '+esc(e.label||'Critical engagement')+'</span>'+
          '<h3><button type="button" data-work="'+esc(b.id)+'">'+esc(b.title)+'</button></h3>'+
          '<p class="ia-small">Response / adjudication by '+esc(b.author)+' · '+esc(b.date_label)+'</p>'+
          '<p>Engages <button type="button" data-work="'+esc(a.id)+'">'+esc(a.title)+'</button> by '+esc(a.author)+'.</p>'+
          '<p>'+esc(e.evidence)+'</p>'+
          '<div class="ia-small">'+esc(e.confidence)+' · '+esc(e.evidence_kind||'Evidence linked')+'</div>'+
          '<div class="ia-actions"><button type="button" data-edge="'+esc(e.id)+'">Inspect relation</button>'+sourceButtons(e.sources)+'</div></article>';
      }).join('');
      q('[data-main]').innerHTML='<div class="ia-main-head"><div><h2>Responses to Fakhr al-Dīn al-Rāzī</h2>'+
        '<span class="ia-small">'+es.length+' source-backed direct critical engagements or adjudications · distinct from commentary, borrowing or general influence</span></div>'+
        '<div class="ia-actions"><button type="button" data-action="razi-timeline">View on timeline</button><button type="button" data-action="clear-razi-responses">All texts</button></div></div>'+
        '<div class="ia-response-register">'+cards+'</div><p class="ia-small">The Ishārāt antecedent links to Avicenna and the second input to al-Muḥākamāt are contextual, not additional responses to Fakhr al-Dīn. The register is selective, not an exhaustive list of historical replies.</p>';
      visibleNodes=[...raziRouteMembers].map(id=>N.get(id)).filter(Boolean);visibleEdges=es;updateCounts();
    }

    // A real document-network layout, deliberately independent of chronological geometry.
    // Nodes and arrows are shared canonical records; opening a link shows its actual sources.
    function drawTextNetwork(){
      const route=textualById.get(state.textFamily);
      const center=state.selected&&N.has(state.selected)?state.selected:null;
      if(!route&&!center){
        q('[data-main]').innerHTML='<div class="ia-main-head"><div><h2>Text network</h2><span class="ia-small">Choose a named text family to see its commentary and response graph.</span></div></div>'+
          '<p class="ia-explore-note">The historical timeline is designed for chronology; this view arranges source-backed textual relationships as a connected diagram. It does not fabricate relations or manuscript dates.</p>'+
          '<button type="button" data-action="open-explore" class="ia-primary">Explore textual families</button>';
        visibleNodes=[];visibleEdges=[];updateCounts();return;
      }
      const rootId=route?route.root:center;
      const allIds=route?route.member_ids:[...neighborhood(center,1)];
      const ids=new Set(allIds.filter(id=>N.has(id)&&(!state.familyCriticalOnly||criticalFamilyMembers.get(state.textFamily)?.has(id))));
      ids.add(rootId);
      const nodes=[...ids].map(id=>N.get(id)).filter(Boolean);
      const edges=D.edges.filter(e=>ids.has(e.source)&&ids.has(e.target)&&allowedEdge(e));
      const byId=new Map(nodes.map(n=>[n.id,n]));
      const depth=new Map([[rootId,0]]);
      const queue=[rootId];
      for(let i=0;i<queue.length;i++){
        const current=queue[i],d=depth.get(current);
        if(d>=6)continue;
        for(const e of edges)if(e.source===current&&!depth.has(e.target)){depth.set(e.target,d+1);queue.push(e.target)}
      }
      // Unconnected or uncertain branches remain visible but are NOT given invented edges.
      for(const n of nodes)if(!depth.has(n.id))depth.set(n.id,1);
      const groups=[];
      for(const n of nodes){const d=depth.get(n.id);(groups[d]||(groups[d]=[])).push(n)}
      for(const g of groups)if(g)g.sort((a,b)=>(temporal(a).anchor??9999)-(temporal(b).anchor??9999)||a.title.localeCompare(b.title));
      const maxRows=Math.max(1,...groups.map(g=>(g||[]).length));
      const mobile=window.matchMedia('(max-width:700px)').matches;
      const cw=mobile?173:197,ch=mobile?70:72,gapX=mobile?70:90,gapY=mobile?14:17,pad=24;
      const width=Math.max(320,pad*2+groups.length*cw+(groups.length-1)*gapX);
      const height=Math.max(220,pad*2+maxRows*(ch+gapY)+18);
      const positions=new Map();
      groups.forEach((g,d)=>{if(!g)return;const offset=((maxRows-g.length)*(ch+gapY))/2;g.forEach((n,i)=>positions.set(n.id,{x:pad+d*(cw+gapX),y:pad+offset+i*(ch+gapY)}))});
      const kinds={commentary:'Commentary',critique:'Critical engagement',gloss:'Gloss',textual_use:'Textual use',translation_adaptation:'Adaptation',reported_source:'Source testimony'};
      const arrows=edges.map(e=>{
        const a=positions.get(e.source),b=positions.get(e.target);if(!a||!b)return '';
        const forward=b.x>a.x,dx=forward?Math.max(35,(b.x-(a.x+cw))/2):35;
        const sx=a.x+cw,sy=a.y+ch/2,tx=b.x,ty=b.y+ch/2;
        const d=forward?'M '+sx+' '+sy+' C '+(sx+dx)+' '+sy+', '+(tx-dx)+' '+ty+', '+tx+' '+ty:
          'M '+(a.x+cw/2)+' '+(a.y+ch)+' C '+(a.x+cw/2)+' '+(a.y+ch+27)+', '+(b.x+cw/2)+' '+(b.y-27)+', '+(b.x+cw/2)+' '+b.y;
        const weakEdge=weak.has(e.confidence)||e.relation==='hypothesis'||e.relation==='broad_influence';
        const cls='ia-network-edge'+(e.relation==='critique'?' ia-network-critique':'')+(weakEdge?' ia-network-weak':'');
        const label=(kinds[e.relation]||e.relation)+' · '+N.get(e.source).title+' → '+N.get(e.target).title+' · '+e.confidence;
        return '<a href="#edge='+esc(e.id)+'" data-edge="'+esc(e.id)+'" aria-label="'+esc(label)+'"><title>'+esc(label)+'</title>'+
          '<path class="'+cls+'" d="'+d+'" marker-end="url(#'+(e.relation==='critique'?'ia-nw-critique':'ia-nw-arrow')+')"/><path class="ia-network-edge-hit" d="'+d+'"/></a>';
      }).join('');
      const boxes=nodes.map(n=>{
        const p=positions.get(n.id),root=n.id===rootId,selected=n.id===state.selected;
        const label=n.title+' · '+n.author+' · '+n.date_label;
        return '<a href="#work='+esc(n.id)+'" data-work="'+esc(n.id)+'" class="ia-network-node'+(root?' is-root':'')+(selected?' is-selected':'')+'" aria-label="'+esc(label)+'"><title>'+esc(label)+'</title>'+
          '<rect x="'+p.x+'" y="'+p.y+'" width="'+cw+'" height="'+ch+'" rx="8"/>'+
          '<text x="'+(p.x+11)+'" y="'+(p.y+19)+'" font-weight="650">'+esc(truncate(n.title,mobile?25:30))+'</text>'+
          '<text class="ia-network-node-sub" x="'+(p.x+11)+'" y="'+(p.y+38)+'">'+esc(truncate(n.author,mobile?26:31))+'</text>'+
          '<text class="ia-network-node-sub" x="'+(p.x+11)+'" y="'+(p.y+56)+'">'+esc(truncate(n.date_label||'Undated',mobile?28:33))+'</text></a>';
      }).join('');
      const title=route?route.label:N.get(rootId).title;
      const caption=route?'Named textual family · shared canonical work IDs':'One-work neighborhood · select a family for an extended network';
      q('[data-main]').innerHTML=
        '<div class="ia-main-head"><div><h2>'+esc(title)+'</h2><span class="ia-small">'+esc(caption)+'</span></div>'+
        '<div class="ia-actions"><button type="button" data-view="timeline">Timeline</button><button type="button" data-action="open-explore">Other families</button></div></div>'+
        '<div class="ia-network-legend"><span><b></b> Textual relation</span><span class="is-critical"><b></b> Critique / adjudication</span><span class="is-uncertain"><b></b> Qualified evidence</span></div>'+
        '<div class="ia-network-scroll" tabindex="0" role="region" aria-label="Scrollable text and commentary relationship network">'+
        '<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'" role="group" aria-label="'+esc(title)+' textual network">'+
        '<defs><marker id="ia-nw-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9Z" fill="var(--ia-link)"/></marker>'+
        '<marker id="ia-nw-critique" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9Z" fill="var(--ia-bad)"/></marker></defs>'+
        arrows+boxes+'</svg></div>'+
        '<p class="ia-network-help">Swipe or scroll to follow the branches. Tap a work to inspect its record, or an arrow for dated and source-qualified relationship evidence. Layout position shows a textual route, never a composition date. '+(nodes.length-edges.length>1?'Some catalogue works lack a documented connection within this view.':'')+'</p>';
      visibleNodes=nodes;visibleEdges=edges;updateCounts();
    }

    // Corpus-facing graph: a real selectable map of pinned work authorities.
    // Grouping is bibliographical, not a historical transmission edge.
    function drawSourceMap(){
      const main=q('[data-main]'),science=state.sourceScience,isFiqh=science==='fiqh';
      if(window.GNAtlasBibliography&&sourceMapTabs[science]){
        window.GNAtlasBibliography.render({
          root,title:sourceScienceNames[science]||'Arabic sciences',
          science,tab:state.sourceTab,tabs:sourceMapTabs[science],school:state.sourceMadhhab,search:state.q,
          isActive:()=>state.view==='sources'&&state.sourceScience===science,
          onCounts:(n,e)=>{sourceShown=n;sourceLinks=e;visibleNodes=[];visibleEdges=[];updateCounts();}
        });
        return;
      }
      const heading=sourceScienceNames[science]||'Arabic source texts';
      const intro='<div class="ia-main-head"><div><h2>'+esc(heading)+' · Source map</h2>'+
        '<span class="ia-small">Source-backed work inventory, distinct from the philosophical/kalām chronology</span></div>'+
        '<div class="ia-actions"><button type="button" data-action="open-explore">Explore</button><button type="button" data-action="show-all-mapped">Historical atlas</button></div></div>';
      if(!sourceRegistry){
        sourceShown=0;sourceLinks=0;updateCounts();
        if(sourceLoadError){
          main.innerHTML=intro+'<div class="ia-empty" role="alert"><h3>Source map could not load</h3><p>'+esc(sourceLoadError)+'</p><button type="button" data-action="retry-source-map">Retry source register</button> <a href="corpora/">Open source library directly</a></div>';
        }else{
          main.innerHTML=intro+'<div class="ia-empty" role="status"><p>Loading the indexed Arabic source books…</p></div>';
          ensureSourceRegistry();
        }
        return;
      }
      const tabs=sourceMapTabs[science]||sourceMapTabs.fiqh;
      const tabsMarkup='<div class="ia-source-select" role="group" aria-label="Source map subsection">'+tabs.map(([id,label])=>
        '<button type="button" data-source-tab="'+esc(id)+'" aria-pressed="'+String(id===state.sourceTab)+'">'+esc(label)+'</button>').join('')+'</div>';
      const schools=[['all','All madhhabs'],['hanafi','Ḥanafī'],['maliki','Mālikī'],['shafii','Shāfiʿī'],['hanbali','Ḥanbalī']];
      const schoolMarkup=isFiqh?'<div class="ia-source-select" role="group" aria-label="Filter legal source map by madhhab">'+schools.map(([id,label])=>
        '<button type="button" data-source-madhhab="'+id+'" aria-pressed="'+String(id===state.sourceMadhhab)+'">'+esc(label)+'</button>').join('')+'</div>':'';
      const subtitle=state.sourceTab==='issues'&&isFiqh?'Legal issue and ruling nodes have not yet been collated; books below are research starting points, not representations of a madhhab’s settled opinions.':
        state.sourceTab==='method'&&isFiqh?'Only records tagged uṣūl are displayed. A book’s association with a legal school is not a proof of doctrinal agreement.':
        science==='hadith'&&['reports','isnads'].includes(state.sourceTab)?'Individual report variants and narrator-to-narrator chains are not imported. These are the available book authorities only.':
        science==='tafsir'&&state.sourceTab!=='texts'?'Passage-level and question-level tafsīr connections remain unverified; these are source books, not extracted interpretations.':
        'A card represents an identified OpenITI version, not a manuscript collation or an inferred commentary chain.';
      let books=sourceRegistry.books.filter(b=>{
        if(isFiqh)return b.disciplines.includes('fiqh')&&
          (state.sourceMadhhab==='all'||b.madhhab===state.sourceMadhhab)&&
          (state.sourceTab!=='method'||b.disciplines.includes('usul'));
        if(science==='arabic')return b.disciplines.includes(state.sourceTab);
        return b.disciplines.includes(science);
      }).filter(b=>!state.q||norm([b.title,b.title_ar,b.author,b.id].join(' ')).includes(norm(state.q)));
      books=books.sort((a,b)=>a.death_ah-b.death_ah||a.title.localeCompare(b.title));
      const schoolNames={hanafi:'Ḥanafī',maliki:'Mālikī',shafii:'Shāfiʿī',hanbali:'Ḥanbalī',comparative:'Comparative'};
      const schoolOrder=['hanafi','maliki','shafii','hanbali','comparative'];
      const groups=isFiqh?schoolOrder.map(k=>({key:k,label:schoolNames[k],books:books.filter(b=>b.madhhab===k)})).filter(g=>g.books.length):
        [{key:science,label:heading,books}];
      const w=192,h=76,gapX=26,gapY=17,edgePad=25,headH=54;
      const maxRows=Math.max(1,...groups.map(g=>g.books.length));
      const width=Math.max(344,edgePad*2+groups.length*w+Math.max(0,groups.length-1)*gapX);
      const height=Math.max(180,headH+maxRows*(h+gapY)+25);
      const positions=new Map(),svgTitles=[],svgCards=[];
      groups.forEach((g,j)=>{
        const x=edgePad+j*(w+gapX);
        svgTitles.push('<text class="ia-source-lane" x="'+x+'" y="25">'+esc(g.label)+' · '+g.books.length+'</text>');
        g.books.forEach((b,i)=>{
          const y=headH+i*(h+gapY);positions.set(b.id,{x,y});
          const url='corpora/#science='+encodeURIComponent(science==='arabic'?state.sourceTab:science)+
            (isFiqh&&state.sourceMadhhab!=='all'?'&madhhab='+encodeURIComponent(state.sourceMadhhab):'')+'&book='+encodeURIComponent(b.id);
          const label=b.title+' · '+b.author+' · d. '+b.death_ah+' AH · open Arabic source reader';
          svgCards.push('<a href="'+esc(url)+'" class="ia-network-node ia-source-node" aria-label="'+esc(label)+'"><title>'+esc(label)+'</title>'+
            '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8"/>'+
            '<text x="'+(x+10)+'" y="'+(y+22)+'" font-weight="650">'+esc(truncate(b.title,27))+'</text>'+
            '<text class="ia-network-node-sub" x="'+(x+10)+'" y="'+(y+41)+'">'+esc(truncate(b.author,28))+'</text>'+
            '<text class="ia-network-node-sub" x="'+(x+10)+'" y="'+(y+60)+'">d. '+b.death_ah+' AH · '+(b.local_text?'hosted':'pinned')+'</text></a>');
        });
      });
      const selectedIds=new Set(books.map(b=>b.id));
      const edges=sourceRegistry.relationships.filter(r=>selectedIds.has(r.source)&&selectedIds.has(r.target));
      const connectors=edges.map(e=>{
        const a=positions.get(e.source),b=positions.get(e.target);
        const x1=a.x+w/2,y1=a.y+h/2,x2=b.x+w/2,y2=b.y+h/2;
        const d='M '+x1+' '+y1+' C '+(x1+15)+' '+(y1+44)+', '+(x2-15)+' '+(y2-44)+', '+x2+' '+y2;
        return '<a href="'+esc(e.source_url)+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(e.label+' · bibliography evidence')+'"><title>'+esc(e.evidence)+'</title><path class="ia-source-edge" d="'+d+'"/><path d="'+d+'" stroke="transparent" stroke-width="13" fill="none"/></a>';
      }).join('');
      const svg='<div class="ia-network-scroll" tabindex="0" role="region" aria-label="'+esc(heading)+' books by historically qualified bibliography">'+
        '<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'" role="group" aria-label="'+esc(heading)+' source-book map">'+
        connectors+svgTitles.join('')+svgCards.join('')+'</svg></div>';
      const url='corpora/#science='+encodeURIComponent(science==='arabic'?state.sourceTab:science)+
        (isFiqh&&state.sourceMadhhab!=='all'?'&madhhab='+encodeURIComponent(state.sourceMadhhab):'');
      const inventory='<details class="ia-source-inventory"><summary>Work authorities &amp; provenance ('+books.length+')</summary><ul>'+
        books.map(b=>'<li><a href="'+esc(url)+'&book='+encodeURIComponent(b.id)+'">'+esc(b.title)+'</a> · '+esc(b.author)+' · d. '+b.death_ah+' AH'+
          (b.openiti.quality_note?' · digitization note: '+esc(truncate(b.openiti.quality_note,100)):'')+'</li>').join('')+'</ul></details>';
      const edgeInfo='<p class="ia-explore-note">'+edges.length+' bibliography-backed work-to-work relationships in this selection; '+(edges.length?'tap an arrow to inspect its bibliographic evidence.':'no historical dependence or commentary arrows are asserted.')+
        ' Dates shown are author death dates, not dated composition or transmission.</p>';
      main.innerHTML=intro+tabsMarkup+schoolMarkup+'<p class="ia-explore-note">'+esc(subtitle)+'</p>'+
        '<p class="ia-source-count">'+books.length+' source version'+(books.length===1?'':'s')+' · '+edges.length+' sourced connection'+(edges.length===1?'':'s')+'</p>'+
        (books.length?svg:'<div class="ia-empty"><p>No registered source books for this selection. This is a source-coverage gap, not evidence that this tradition lacks texts.</p></div>')+
        edgeInfo+inventory+sourceResearchExpansion(science,state.sourceTab,state.sourceMadhhab)+'<p class="ia-source-library-link"><a href="'+esc(url)+'">Open this selection in the searchable Arabic Source Library</a></p>';
      sourceShown=books.length;sourceLinks=edges.length;visibleNodes=[];visibleEdges=[];updateCounts();
    }

    function drawRelations(){if(state.responseRoute)return drawRaziRelations();const id=state.selected||'jurjani_mawaqif',n=N.get(id)||D.nodes[0],incoming=D.edges.filter(e=>allowedEdge(e)&&e.target===n.id),outgoing=D.edges.filter(e=>allowedEdge(e)&&e.source===n.id);q('[data-main]').innerHTML=`<div class="ia-main-head"><div><h2>Sources and later reception</h2><span class="ia-small">One textual relationship at a time · ${esc(n.title)}</span></div><div class="ia-actions"><button type="button" data-work="${esc(n.id)}">Open selected record</button><button type="button" data-action="all-relations">All ${D.edges.length} relationships</button></div></div><div class="ia-reception"><section><h3>Sources / antecedents (${incoming.length})</h3>${incoming.map(e=>networkCard(N.get(e.source),e)).join('')||'<p class="ia-small">No incoming relationship is asserted here.</p>'}</section><section><h3>Selected work</h3>${networkCard(n,null,true)}<p class="ia-small">An arrow records the stated relation; it does not establish agreement or a complete genealogy.</p></section><section><h3>Later reception (${outgoing.length})</h3>${outgoing.map(e=>networkCard(N.get(e.target),e)).join('')||'<p class="ia-small">No outgoing relationship is asserted here.</p>'}</section></div>`;visibleNodes=[n,...incoming.map(e=>N.get(e.source)),...outgoing.map(e=>N.get(e.target))];visibleEdges=[...incoming,...outgoing];updateCounts()}
    function drawCatalogue(){const ns=filteredNodes(false).sort((a,b)=>(temporal(a).anchor??9999)-(temporal(b).anchor??9999)||a.code.localeCompare(b.code)),size=35,pages=Math.max(1,Math.ceil(ns.length/size));state.page=Math.min(state.page,pages);const rows=ns.slice((state.page-1)*size,state.page*size);q('[data-main]').innerHTML=`<div class="ia-main-head"><div><h2>Work catalogue</h2><span class="ia-small">${ns.length} matching entries · This view includes entries outside the timeline window.</span></div></div><div class="ia-table-wrap"><table><thead><tr><th>Work and author</th><th>Date as recorded</th><th>Reception family</th><th>Form / region</th></tr></thead><tbody>${rows.map(n=>`<tr><td><button type="button" class="ia-table-title" data-work="${esc(n.id)}">${esc(n.code+' · '+n.title)}</button><div class="ia-table-meta">${esc(n.author)} · ${esc(n.author_dates)}</div>${n.title_ar?`<div class="ia-table-meta" lang="ar">${esc(n.title_ar)}</div>`:''}</td><td>${esc(n.date_label)}<div class="ia-table-meta">${esc(n.date_status)}</div></td><td><span class="ia-swatch" style="--ia-series:${color(n)}"></span> ${esc(family(n)[0])}<div class="ia-table-meta">${esc(family(n)[1])}</div></td><td>${esc(n.kind)}<div class="ia-table-meta">${esc(n.region)}</div></td></tr>`).join('')}</tbody></table></div><div class="ia-pagination"><button type="button" data-action="previous-page" ${state.page===1?'disabled':''}>Previous</button><span>${state.page} / ${pages}</span><button type="button" data-action="next-page" ${state.page===pages?'disabled':''}>Next</button></div>`;visibleNodes=rows;visibleEdges=[];updateCounts()}
    function drawAudit(){let html='';const tab=state.auditTab;const tabs=[['critical','Critical audit'],['notes','Method & notes'],['relations','Relationship register'],['sources','Bibliography'],['history','Historical context'],['prior','Earlier arrows']];if(tab==='critical')html=(D.audit||[]).map(a=>`<article class="ia-audit-item"><h3>${esc(a.title||a.issue)}</h3><span class="ia-small">${esc(a.action||a.verdict||'')}</span><p>${esc(a.text||a.explanation||'')}</p>${sourceButtons(a.sources)}</article>`).join('');if(tab==='notes')html=[...(D.notes||[]),...(history.method_notes||[]).map((n,i)=>typeof n==='string'?{title:'Historical context '+(i+1),text:n}:n)].map(n=>`<article class="ia-audit-item"><h3>${esc(n.title||'Method note')}</h3><p>${esc(n.text||n.note||'')}</p>${sourceButtons(n.sources)}</article>`).join('');if(tab==='notes'&&(D.contextual_relations||[]).length)html+=`<h3 style="margin-top:22px">Author-level and contextual reception notes</h3>`+(D.contextual_relations||[]).map(c=>`<article class="ia-audit-item"><h4>${esc(c.source_author)} → ${esc(N.get(c.target_work)?.title||c.target_work)}</h4><p>${esc(c.evidence)}</p><span class="ia-small">${esc(c.relation)} · ${esc(c.confidence)}</span>${sourceButtons(c.sources)}</article>`).join('');if(tab==='sources')html=sourceHTML(sourceList.filter(s=>!state.q||norm([s.title,s.author,s.id,s.note].join(' ')).includes(norm(state.q))).map(s=>s.id));if(tab==='relations'){const es=D.edges.filter(e=>allowedEdge(e)&&(!state.q||norm([e.id,e.label,e.evidence,N.get(e.source).title,N.get(e.target).title].join(' ')).includes(norm(state.q))));html=`<p class="ia-small" style="margin-top:16px">${es.length} relationships shown; ${D.edges.length} retained in the register. Select an ID for evidence.</p><div class="ia-table-wrap"><table><thead><tr><th>ID / type</th><th>Source</th><th>Recipient</th><th>Evidence status</th></tr></thead><tbody>${es.map(e=>`<tr><td><button type="button" data-edge="${esc(e.id)}">${esc(edgeCode(e))}</button><div class="ia-table-meta">${esc((rels[e.relation]||['',e.relation])[1])}</div></td><td><button type="button" data-work="${esc(e.source)}">${esc(N.get(e.source).title)}</button></td><td><button type="button" data-work="${esc(e.target)}">${esc(N.get(e.target).title)}</button></td><td>${esc(e.confidence)}<div class="ia-table-meta">${esc(e.evidence_kind||'')}</div></td></tr>`).join('')}</tbody></table></div>`}if(tab==='history')html=`<p class="ia-small" style="margin-top:16px">${historical.length} sourced context records. Period overlap is not an influence claim.</p><div class="ia-table-wrap"><table><thead><tr><th>Political period or event</th><th>Dates and scope</th><th>Region / role</th></tr></thead><tbody>${historical.filter(h=>!state.q||norm([h.label,h.region,h.note,h.role].join(' ')).includes(norm(state.q))).map(h=>`<tr><td><button type="button" class="ia-table-title" data-history="${esc(h.id)}">${esc(h.label)}</button><div class="ia-table-meta">${esc(h.kind.replaceAll('_',' '))}</div></td><td>${esc(h.date_label)}<div class="ia-table-meta">${esc(h.confidence||'')}</div></td><td>${esc(h.region||'')}<div class="ia-table-meta">${esc(h.role||'')}</div></td></tr>`).join('')}</tbody></table></div>`;if(tab==='prior')html=(D.prior_edge_audit||[]).map(a=>`<article class="ia-audit-item"><h3>${esc(a.id)}</h3><p>${esc(N.get(a.source)?.title||a.source)} → ${esc(N.get(a.target)?.title||a.target)}</p><p>${esc(a.status)}</p>${E.has(a.id)?`<button type="button" data-edge="${esc(a.id)}">Current evidence</button>`:''}${sourceButtons(a.sources)}</article>`).join('');q('[data-main]').innerHTML=`<div class="ia-main-head"><div><h2>Evidence and editorial decisions</h2><span class="ia-small">Every relationship keeps its evidence, scope, confidence, and source references.</span></div></div><div class="ia-actions">${tabs.map(([key,label])=>`<button type="button" data-audit-tab="${key}" aria-pressed="${tab===key}">${label}</button>`).join('')}</div>${html}`;visibleNodes=[];visibleEdges=[];updateCounts()}
    function updateCounts(){if(state.view==='sources'){q('[data-counts]').innerHTML='<strong>'+sourceShown+'</strong> cited work-level records in this bibliographic map · no inferred commentary or legal-opinion arrows';q('[data-footer-counts]').textContent=D.nodes.length+' established historical records · bibliographic source layer separate and fully cited';return}const total=filteredNodes(false).length,windowCount=filteredNodes(true).length,route=textualById.get(state.textFamily);let s=state.view==='timeline'?((!state.responseRoute&&state.to-state.from>=(lastWidth<600?300:1050))?`<strong>${visibleNodes.length}</strong> works represented in clickable century groups · zoom to examine each text`:`<strong>${visibleNodes.length}</strong> individual entries visible · ${windowCount} match this period · ${visibleEdges.length} connections drawn`):state.view==='network'?`<strong>${visibleNodes.length}</strong> network entries · ${visibleEdges.length} evidence-linked connections`:state.view==='catalogue'?`<strong>${total}</strong> matching entries · ${D.nodes.length} retained`:state.view==='relations'?`<strong>${visibleEdges.length}</strong> relationships in this focus`:`<strong>${D.edges.length}</strong> relationship records · ${sourceList.length} source records`;if(state.selected&&state.view==='timeline'){const connected=D.edges.filter(e=>allowedEdge(e)&&(e.source===state.selected||e.target===state.selected));const onscreen=new Set(visibleEdges.map(e=>e.id));const omitted=connected.filter(e=>!onscreen.has(e.id)).length;if(omitted)s+=` · ${omitted} selected connections outside the current display`}if(route)s+=' · '+route.member_ids.length+' records in '+esc(route.label)+' family (selective)';if(state.responseRoute)s+=' · '+raziResponseEdges.length+' sourced Rāzī response/adjudication links (plus context)';q('[data-counts]').innerHTML=s;q('[data-footer-counts]').textContent=`${D.nodes.length} entries · ${D.edges.length} textual relationships · ${historical.length} historical records`}
    function render(){root.classList.toggle('ia-source-mode',state.view==='sources');sync();if(state.view==='sources'){q('[data-sheet]').hidden=true;drawSourceMap();return}renderSheet();if(state.view==='timeline')drawTimeline();else if(state.view==='network')drawTextNetwork();else if(state.view==='relations')drawRelations();else if(state.view==='catalogue')drawCatalogue();else drawAudit()}
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

    function chooseRaziResponses(enabled=!state.responseRoute){
      state.responseRoute=enabled?'razi':'';
      state.textFamily='';state.regionNetwork='';state.q='';state.selected=null;
      state.detailType=null;state.detailId=null;state.focusOnly=false;state.page=1;
      state.view='timeline';state.density='all';
      if(!enabled){state.links='focus';changeRange(historyMin,historyMax);announce('Showing all recorded texts; Rāzī response route cleared');return}
      // A named investigative route must reveal all its members even after a
      // previous school, region or relation filter was narrowed.
      state.families=new Set(Object.keys(families));state.rels.add('critique');
      state.rels.add('commentary');state.qualified=true;state.contexts=true;state.links='all';
      const anchors=[...raziRouteMembers].map(id=>temporal(N.get(id)).anchor).filter(Number.isFinite);
      if(anchors.length){const lo=Math.min(...anchors),hi=Math.max(...anchors),pad=Math.max(35,(hi-lo)*.1);changeRange(lo-pad,hi+pad)}
      else{render();setHash()}
      announce('Showing '+raziResponseEdges.length+' sourced responses and adjudications to Fakhr al-Dīn al-Rāzī with contextual textual links');
    }
    function chooseTextFamily(key,requestedView='timeline'){state.responseRoute='';state.familyCriticalOnly=false;
      const route=textualById.get(key);
      state.textFamily=route?key:'';
      state.view=route?requestedView:'timeline';state.density='all';state.links=route?'all':'focus';
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
    function runAction(action){
      if(action==='open-explore'){openExplore();return}
      if(action==='canonical-summary'){window.GNCanonicalSynopsis?.toggle(true);render();setHash();return}
      if(action==='canonical-timeline'){window.GNCanonicalSynopsis?.toggle(false);render();setHash();return}
      if(action==='retry-source-map'){sourceLoadError='';sourceRequest=null;drawSourceMap();return}
      if(action==='close-explore'){closeExplore();return}
      if(action==='toggle-advanced'){const d=q('.ia-secondary-controls');if(d){d.open=!d.open;q('[data-action="toggle-advanced"]')?.setAttribute('aria-expanded',String(d.open))}return}
      if(action==='search-existing'){closeExplore();q('#ia-search-v3')?.focus();return}
      if(action==='open-about'){closeExplore();const d=q('.gn-atlas-introduction');if(d){d.open=true;d.scrollIntoView({block:'start',behavior:'smooth'})}return}
      if(action==='show-all-mapped'){closeExplore();window.GNCanonicalSynopsis?.toggle(false);state.view='timeline';state.selected=null;state.detailType=null;state.detailId=null;state.textFamily='';state.familyCriticalOnly=false;state.responseRoute='';state.q='';state.regionNetwork='';state.families=new Set(Object.keys(families));state.rels=new Set(Object.keys(rels));render();setHash();return}
      if(action==='razi-responses'){chooseRaziResponses();return}if(action==='clear-razi-responses'){chooseRaziResponses(false);return}if(action==='show-razi-responses'){state.view='relations';render();setHash();return}if(action==='razi-timeline'){state.view='timeline';render();setHash();return}const span=state.to-state.from,mid=(state.from+state.to)/2;
      if(action==='clear-text-family'){chooseTextFamily('');return}
      if(action==='reset-filters'){
        state.textFamily='';state.familyCriticalOnly=false;state.responseRoute='';state.regionNetwork='';state.q='';state.focusOnly=false;
        state.families=new Set(Object.keys(families));state.rels=new Set(Object.keys(rels));
        state.contexts=true;state.qualified=true;state.page=1;state.view='timeline';
        render();setHash();announce('All restrictive filters cleared; the same historical years remain in view.');
        return;
      }
      if(action==='tahdhib-route'){chooseTextFamily('tahdhib');return}if(action==='whole-atlas'||action==='whole-atlas-chart'){Object.assign(state,{view:'timeline',density:'all',q:'',selected:null,detailType:null,detailId:null,focusOnly:false,depth:1,textFamily:'',familyCriticalOnly:false,responseRoute:'',regionNetwork:'',politics:true,events:true,schools:true,contexts:true,qualified:true,links:'focus'});state.families=new Set(Object.keys(families));state.rels=new Set(Object.keys(rels));changeRange(-600,2026)}if(action==='apply-range'){
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
    // The former three always-present text/tradition/region drawers were replaced
    // with one on-demand Explore dialog. Advanced evidence/region filters remain below the gear.
    q('[data-family-filters]').innerHTML=Object.entries(families).map(([key,f])=>`<label class="ia-check"><input type="checkbox" data-family="${key}" checked><span class="ia-swatch" style="--ia-series:light-dark(${f[2]},${f[3]})"></span>${esc(f[0]+' · '+f[1])}</label>`).join('');
    q('[data-relation-filters]').innerHTML=Object.entries(rels).map(([key,r])=>`<label class="ia-check"><input type="checkbox" data-rel="${key}" checked>${esc(r[0]+' · '+r[1])}</label>`).join('');

    // One Explore drawer for disciplines, textual families, author records and planned corpora.
    // Only the 404 already verified atlas nodes are clickable as mapped works.
    const scienceChoices=[
      ['all','All mapped texts'],['philosophy','Philosophy, kalām & logic'],
      ['fiqh','Fiqh & uṣūl'],['hadith','Hadith'],
      ['tafsir','Tafsīr & Qurʾānic sciences'],['tasawwuf','Taṣawwuf'],
      ['arabic','Arabic language sciences']
    ];
    const scienceTabs={
      all:[['families','Text families'],['authors','Authors']],
      philosophy:[['families','Text families'],['authors','Authors'],['questions','Questions']],
      fiqh:[['texts','Legal texts'],['issues','Legal questions'],['method','Uṣūl method']],
      hadith:[['collections','Collections'],['reports','Reports'],['isnads','Isnāds'],['commentaries','Commentaries']],
      tafsir:[['passages','Passages'],['texts','Text families'],['questions','Questions']],
      tasawwuf:[['texts','Chronological source atlas']],
      arabic:[['nahw','Grammar · naḥw'],['sarf','Morphology · ṣarf'],['balagha','Balāgha'],['lugha','Lexicography']]
    };
    let activeScience='all',activeScienceTab='families',activeMadhhab='all',exploreReturnFocus=null;
    function closeExplore(){
      const dialog=q('[data-explore-overlay]');if(!dialog||dialog.hidden)return;
      dialog.hidden=true;
      if(exploreReturnFocus&&document.contains(exploreReturnFocus))exploreReturnFocus.focus();
    }
    function openExplore(){
      const dialog=q('[data-explore-overlay]');if(!dialog)return;
      exploreReturnFocus=document.activeElement;
      renderExplore();
      dialog.hidden=false;
      q('#ia-explore-panel')?.focus();
    }
    function exploreFamilyList(list){
      if(!list.length)return '<p class="ia-explore-note">No source-verified textual families are yet available in this part of the atlas.</p>';
      return '<div class="ia-explore-family-list">'+list.map(f=>
        '<button type="button" data-explore-family="'+esc(f.id)+'"><strong>'+esc(f.label)+'</strong><small>'+
        f.member_ids.length+' mapped entries · '+esc(f.section)+'</small></button>'
      ).join('')+'</div>';
    }
    function plannedList(label,note,examples){
      return '<div class="ia-explore-planned" role="note"><strong>'+esc(label)+'</strong>'+
        '<p>'+esc(note)+'</p>'+
        '<p class="ia-explore-note">The selected science opens as an interactive diagram of book nodes. Genre classifications are not historical commentary arrows; report-, passage- and issue-level relationships need further primary-source alignment.</p></div>';
    }
    function renderExplore(){
      const choices=q('[data-science-choices]'),body=q('[data-science-content]');
      if(!choices||!body)return;
      choices.innerHTML=scienceChoices.map(([id,name])=>
        '<button type="button" data-explore-science="'+id+'" aria-pressed="'+String(activeScience===id)+'">'+esc(name)+'</button>'
      ).join('');
      const tabs=scienceTabs[activeScience]||scienceTabs.all;
      if(!tabs.some(([id])=>id===activeScienceTab))activeScienceTab=tabs[0][0];
      let html='<h3 class="ia-explore-subtitle">Browse '+esc(scienceChoices.find(([id])=>id===activeScience)?.[1]||'')+'</h3>'+
        '<div class="ia-explore-grid">'+tabs.map(([id,label])=>
        '<button type="button" data-explore-tab="'+id+'" aria-pressed="'+String(activeScienceTab===id)+'">'+esc(label)+'</button>'
        ).join('')+'</div>';
      if(activeScience==='all'||activeScience==='philosophy'||activeScience==='tasawwuf'){
        if(activeScienceTab==='families'){
          const list=activeScience==='tasawwuf'?textualFamilies.filter(f=>f.id==='fusus'):
            activeScience==='philosophy'?textualFamilies.filter(f=>f.id!=='fusus'):textualFamilies;
          html+='<p class="ia-explore-note">One canonical record per book; works can belong to overlapping textual networks. Select a family to open its diagram.</p>'+exploreFamilyList(list);
          if(activeScience==='tasawwuf')html+=plannedList('Other taṣawwuf texts','The Fuṣūṣ commentary family is already mapped. Other Sufi source and commentary families need individual source verification before adding graph nodes.',['al-Futūḥāt al-Makkiyya','al-Baḥr al-Madīd']);
        }else if(activeScienceTab==='authors'){
          const tally=new Map();
          for(const n of D.nodes)if(n.author){tally.set(n.author,(tally.get(n.author)||0)+1)}
          const sorted=[...tally].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
          const special=['Fakhr al-Dīn al-Rāzī','Naṣīr al-Dīn al-Ṭūsī','Ibn Sīnā (Avicenna)'];
          const entries=[...new Map([...special.filter(x=>tally.has(x)).map(x=>[x,tally.get(x)]),...sorted.slice(0,16)]).entries()];
          html+='<p class="ia-explore-note">An author can participate in several textual families. Open their canonical catalogue record without duplicating works.</p>'+
            '<div class="ia-explore-family-list">'+entries.map(([name,count])=>
            '<button type="button" data-explore-author="'+esc(name)+'"><strong>'+esc(name)+'</strong><small>'+count+' catalogue entries</small></button>'
            ).join('')+'</div><button type="button" data-action="search-existing">Search all authors and titles</button>';
        }else html+='<p class="ia-explore-note">Work-level criticism and commentary edges are already source-linked. Detailed proposition-by-proposition argument maps require aligned primary passages and should not be fabricated from bibliographical links.</p>'+
          exploreFamilyList(textualFamilies.filter(f=>['isharat','muhassal','mawaqif','tajrid'].includes(f.id)));
      }else if(activeScience==='fiqh'){
        const schools=[['all','All madhhabs'],['hanafi','Ḥanafī'],['maliki','Mālikī'],['shafii','Shāfiʿī'],['hanbali','Ḥanbalī'],['early','Early jurists'],['named_other','Other schools'],['unassigned','Unassigned']];
        html+='<h4 class="ia-explore-subtitle">Madhhab</h4><div class="ia-explore-grid">'+schools.map(([id,name])=>
          '<button type="button" data-explore-madhhab="'+id+'" aria-pressed="'+String(activeMadhhab===id)+'">'+esc(name)+'</button>').join('')+'</div>';
        const samples={
          all:['School-specific mutūn, shurūḥ and ḥawāshī','Comparative legal questions across madhhabs'],
          hanafi:['Mukhtaṣar al-Qudūrī','al-Hidāya'],
          maliki:['al-Muwaṭṭaʾ (also a hadith collection)','al-Mudawwana','Mukhtaṣar Khalīl'],
          shafii:['al-Umm','Minhāj al-ṭālibīn'],
          hanbali:['al-Mughnī','Zād al-mustaqniʿ']
        };
        const context=activeMadhhab==='all'?'comparative madhhab research':'the selected madhhab';
        const note=activeScienceTab==='texts'?'Build attested matn–commentary–gloss families for '+context+'. Individual books may also connect to hadith or uṣūl.':
          activeScienceTab==='issues'?'Index exact legal questions, historically qualified rulings, cited Qurʾān and hadith evidence, and internal disagreements in '+context+'.':
          'Map dated uṣūl texts, principles of interpretation and their specifically documented legal applications in '+context+'.';
        html+='<p class="ia-explore-note">Selecting any madhhab immediately opens its interactive SVG graph of cited book nodes. The Early jurists and Other schools routes distinguish personal circles from later doctrinal schools. Specific legal-issue commentary arrows remain evidence-qualified.</p>';
      }else if(activeScience==='hadith'){
        const notes={
          collections:['Collection and recension authorities must be distinguished. Numbering is edition-specific.',['al-Muwaṭṭaʾ','Ṣaḥīḥ al-Bukhārī','Ṣaḥīḥ Muslim','Sunan Abī Dāwūd']],
          reports:['Map exact textual occurrences and variant matns, never collapse materially different wordings into one unqualified quotation.',['Matn concordances','Report clusters','Variant wording records']],
          isnads:['Create distinct narrator-to-narrator transmission routes, with identification and dating qualifications.',['Ordered isnād chains','Narrator authority records','Attributed critical evaluations']],
          commentaries:['Link exact report occurrences to their commentaries and dated juristic uses.',['Sharḥ transmission families','Juristic citation dossiers']]
        };
        const pair=notes[activeScienceTab]||notes.collections;
        html+=plannedList('Hadith '+activeScienceTab,pair[0],pair[1]);
      }else if(activeScience==='tafsir'){
        const notes={
          passages:['Navigate by exact sūrah, āyah, reading and grammatical or rhetorical issue.',['Qurʾān 5:6 and legal inference','Qurʾānic particles in tafsīr']],
          texts:['Build source-verified tafsīr commentary families, preserving their distinct methods.',['al-Ṭabarī’s Jāmiʿ al-bayān','al-Zamakhsharī’s al-Kashshāf','Ibn ʿAjība’s al-Baḥr al-madīd']],
          questions:['Connect tafsīr, Arabic grammar, balāgha, kalām and fiqh at verified passage loci.',['Lexical and grammatical debates','Doctrinal and legal exegesis']]
        };
        const pair=notes[activeScienceTab]||notes.passages;
        html+=plannedList('Tafsīr '+activeScienceTab,pair[0],pair[1]);
      }else if(activeScience==='arabic'){
        const notes={
          nahw:['Naḥw: syntax, governance, sentence structures, commentary and disagreement. Connect exact constructions to Qurʾānic and uṣūl argumentation.',['al-Ājurrūmiyya','Ibn Mālik’s Alfiyya','Ibn Hishām’s Mughnī al-Labīb']],
          sarf:['Ṣarf: derived forms, patterns, paradigms and morphology-based interpretation.',['al-Shāfiya','Major morphological commentaries']],
          balagha:['Balāgha: the distinct disciplines of ʿilm al-maʿānī, al-bayān and al-badīʿ; link rhetoric to tafsīr, kalām and legal interpretation.',['al-Sakkākī’s Miftāḥ al-ʿulūm','Talkhīṣ al-Miftāḥ','al-Taftāzānī’s al-Muṭawwal']],
          lugha:['Lexicography and semantic usage: historical lexica, meanings, contested terms and source-verified quotations.',['Lisān al-ʿArab','Maqāyīs al-lugha']]
        };
        const pair=notes[activeScienceTab]||notes.nahw;
        html+=plannedList('Passage-level Arabic sciences graph',pair[0],pair[1]);
      }
      // Curated OpenITI versions are available even when their issue-level historical
      // relationships have not yet entered the canonical 404-node intellectual map.
      const sourceScience=activeScience==='arabic'&&['nahw','sarf','balagha','lugha'].includes(activeScienceTab)?activeScienceTab:
        ['all','fiqh','hadith','tafsir','tasawwuf','philosophy'].includes(activeScience)?activeScience:'arabic';
      const sourceHash='#science='+encodeURIComponent(sourceScience)+(sourceScience==='fiqh'&&activeMadhhab!=='all'?'&madhhab='+encodeURIComponent(activeMadhhab):'');
      html+='<div class="ia-explore-library"><strong>Subject-first visual book graph</strong><p>Choose a science or branch above: the main map redraws as an interactive SVG of the actual books and historically qualified schools. Click book nodes for citations; a book list or Arabic reader is optional, not the default.</p><button type="button" data-explore-science="'+esc(activeScience)+'">Open selected interactive map</button> <a href="corpora/expansion.html#science='+encodeURIComponent(sourceScience==='arabic'?'nahw':sourceScience)+'">Separate bibliographic register</a></div>';
      if(activeScience!=='all')html+='<p class="ia-explore-note">A real graphical map is the primary exploration mode; documented textual relationships remain distinct from unverified categorical associations.</p>';
      html+='<div class="ia-explore-footer"><button type="button" data-action="show-all-mapped">Return to the mapped atlas</button> <button type="button" data-action="open-about">Research notes &amp; downloads</button> <a href="../../texts/">Published GNAMMA texts</a></div>';
      body.innerHTML=html;
    }
    root.addEventListener('click',event=>{if(suppressNextClick){const onChart=!!event.target.closest('[data-chart]');suppressNextClick=false;if(onChart){event.preventDefault();return}}const el=event.target.closest('button,a');if(!el||!root.contains(el))return;
      if(el.dataset.exploreScience){activeScience=el.dataset.exploreScience;activeScienceTab=scienceTabs[activeScience]?.[0]?.[0]||'families';renderExplore();if(sourceMapTabs[activeScience]){chooseScienceView(activeScience,activeScienceTab,activeMadhhab);closeExplore()}else if(activeScience==='tasawwuf'){chooseTextFamily('fusus','network');closeExplore()}else if(activeScience==='philosophy'){window.GNCanonicalSynopsis?.toggle(false);state.view='timeline';state.selected=null;state.textFamily='';state.q='';state.families=new Set(['ancient','neoplatonic','translation','falsafa','avicennan','ishraqi','sadrian','critical','christian','jewish']);render();setHash();closeExplore()}else if(activeScience==='all'){runAction('show-all-mapped')}return}
      if(el.dataset.exploreTab){activeScienceTab=el.dataset.exploreTab;renderExplore();if(sourceMapTabs[activeScience]){chooseScienceView(activeScience,activeScienceTab,activeMadhhab);closeExplore()}else if(activeScience==='tasawwuf'){chooseTextFamily('fusus','network');closeExplore()}else if(activeScience==='philosophy'){window.GNCanonicalSynopsis?.toggle(false);state.view='timeline';state.families=new Set(['ancient','neoplatonic','translation','falsafa','avicennan','ishraqi','sadrian','critical','christian','jewish']);state.q='';render();setHash();closeExplore()}return}
      if(el.dataset.exploreMadhhab){activeMadhhab=el.dataset.exploreMadhhab;renderExplore();chooseScienceView('fiqh',activeScienceTab,activeMadhhab);closeExplore();return}
      if(el.dataset.sourceMadhhab){event.preventDefault();chooseScienceView('fiqh',state.sourceTab,el.dataset.sourceMadhhab);return}if(el.dataset.sourceTab){event.preventDefault();chooseScienceView(state.sourceScience,el.dataset.sourceTab,state.sourceMadhhab);return}
       if(el.dataset.exploreFamily){event.preventDefault();chooseTextFamily(el.dataset.exploreFamily,'network');closeExplore();return}
      if(el.dataset.exploreAuthor){event.preventDefault();const author=el.dataset.exploreAuthor;state.textFamily='';state.familyCriticalOnly=false;state.responseRoute='';state.q=author;state.families=new Set(Object.keys(families));state.view='timeline';state.detailType='author';state.detailId=author;state.page=1;render();setHash();closeExplore();return}
      if(el.dataset.traditionRoute){event.preventDefault();state.families=new Set([el.dataset.traditionRoute]);state.view='timeline';state.density='all';state.page=1;render();setHash();announce('Catalogue tradition selected: '+families[el.dataset.traditionRoute][1]);return}
    if(el.dataset.regionRoute){event.preventDefault();state.regionNetwork=el.dataset.regionRoute;state.view='timeline';state.density='all';state.page=1;render();setHash();announce('Regional context selected: '+regionNetworks.find(([id])=>id===el.dataset.regionRoute)?.[1]);return}
    if(el.dataset.textRoute){event.preventDefault();chooseTextFamily(el.dataset.textRoute);return}if(el.dataset.cluster){event.preventDefault();const [a,b]=el.dataset.cluster.split(',').map(Number);const mid=(a+b)/2,target=lastWidth<600?150:340;changeRange(mid-target/2,mid+target/2);return}if(el.dataset.work){event.preventDefault();q('[data-results],#ia-results-v3')?.setAttribute('hidden','');selectNode(el.dataset.work,el.dataset.center==='1');return}if(el.dataset.edge){event.preventDefault();selectEdge(el.dataset.edge);return}if(el.dataset.history){event.preventDefault();selectHistory(el.dataset.history);return}if(el.dataset.source){state.detailType='source';state.detailId=el.dataset.source;renderSheet();setHash();return}if(el.dataset.author){state.detailType='author';state.detailId=el.dataset.author;renderSheet();setHash();return}if(el.dataset.view){state.view=el.dataset.view;state.page=1;render();setHash();return}if(el.dataset.range){const [a,b]=el.dataset.range.split(',').map(Number);state.view='timeline';changeRange(a,b);return}if(el.dataset.auditTab){state.auditTab=el.dataset.auditTab;drawAudit();setHash();return}if(el.dataset.action)runAction(el.dataset.action)});
    q('.ia-nav').addEventListener('keydown',event=>{const tabs=qa('.ia-nav [data-view]'),i=tabs.indexOf(document.activeElement);if(i<0)return;let next=i;if(event.key==='ArrowRight')next=(i+1)%tabs.length;else if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();tabs[next].focus();tabs[next].click()});
    root.addEventListener('change',event=>{const el=event.target;if(el.hasAttribute('data-family-critical')){state.familyCriticalOnly=!!state.textFamily&&el.checked;state.page=1;
       // A critical-replies subset may occupy only a century of a many-century family.
       // Fit the actual member dates rather than leaving the replies compressed or offscreen on phones.
       const route=textualById.get(state.textFamily);
       const ids=state.familyCriticalOnly?[...(criticalFamilyMembers.get(state.textFamily)||[])]:route?.member_ids||[];
       const years=ids.map(id=>N.has(id)?temporal(N.get(id)).anchor:null).filter(Number.isFinite);
       if(years.length){const lo=Math.min(...years),hi=Math.max(...years),pad=Math.max(35,(hi-lo)*.12),span=Math.min(historyLength,Math.max(20,hi-lo+2*pad));
         state.from=Math.max(historyMin,Math.min(historyMax-span,lo-pad));state.to=state.from+span;
       }
       render();setHash(true);q('[data-family-critical]')?.focus();return}if(el.hasAttribute('data-view-picker')){if(['timeline','network','relations','catalogue','audit','sources'].includes(el.value)){state.view=el.value;state.page=1;render();setHash()}return}if(el.hasAttribute('data-text-family')){chooseTextFamily(el.value);return}if(el.hasAttribute('data-region-network')){state.regionNetwork=regionNetworks.some(([id])=>id===el.value)?el.value:'';state.page=1;render();setHash(true);return}if(el.dataset.control){const key=el.dataset.control;state[key]=el.type==='checkbox'?el.checked:key==='depth'?+el.value:el.value;state.page=1;render();setHash(true)}if(el.dataset.family){el.checked?state.families.add(el.dataset.family):state.families.delete(el.dataset.family);state.page=1;render();setHash(true)}if(el.dataset.rel){el.checked?state.rels.add(el.dataset.rel):state.rels.delete(el.dataset.rel);render();setHash(true)}});
    q('#ia-search-v3').addEventListener('input',event=>{state.q=event.target.value;state.page=1;if(state.view==='sources'){q('#ia-results-v3').hidden=true;drawSourceMap();setHash(true);return}clearTimeout(searchTimer);searchTimer=setTimeout(()=>{const results=D.nodes.filter(matches).slice(0,8),box=q('#ia-results-v3');box.hidden=!state.q;if(state.q)box.innerHTML=results.map(n=>`<button type="button" data-work="${esc(n.id)}" data-center="1"><span>${esc(n.code+' · '+n.title)}</span><span class="ia-small">${esc(n.author+' · '+n.date_label)}</span></button>`).join('')||'<div class="ia-small" style="padding:10px">No title or author matches.</div>';if(state.view==='timeline')drawTimeline();else if(state.view==='catalogue')drawCatalogue();else if(state.view==='audit')drawAudit();setHash(true)},180)});
    q('#ia-search-v3').addEventListener('keydown',event=>{if(state.view==='sources'){if(event.key==='Escape'){q('#ia-results-v3').hidden=true;event.target.blur()}return}if(event.key==='Escape'){q('#ia-results-v3').hidden=true;event.target.blur()}if(event.key==='Enter'){const first=D.nodes.find(matches);if(state.q&&first){q('#ia-results-v3').hidden=true;selectNode(first.id,true)}}});
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
    document.addEventListener('keydown',event=>{
      const d=q('[data-explore-overlay]');if(!d||d.hidden)return;
      if(event.key==='Escape'){event.preventDefault();closeExplore();return}
      if(event.key!=='Tab')return;
      const targets=[...d.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled])')].filter(x=>x.getClientRects().length);
      if(!targets.length)return;
      const first=targets[0],last=targets[targets.length-1];
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===q('#ia-explore-panel'))){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    });
    document.addEventListener('click',event=>{if(!event.target.closest('#kalam-timeline-app-v3 .ia-search'))q('#ia-results-v3').hidden=true});
    window.addEventListener('popstate',()=>{readHash();render()});window.addEventListener('hashchange',()=>{readHash();render()});
    if(window.ResizeObserver)new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const chart=q('[data-chart]');if(state.view==='timeline'&&chart&&Math.abs(chart.getBoundingClientRect().width-lastWidth)>3)drawTimeline()},100)}).observe(q('[data-main]'));
    // Preserve all research information while making the mobile first screen
    // about exploring the visualization, rather than reading a long preface.
    const compactLayout=window.matchMedia('(max-width:700px), (max-height:550px) and (pointer:coarse)');
    function configureLanding(){
      // Research notes now follow the diagram. Never reopen bulky menus on resize.
      if(!root.dataset.mobileReady){for(const selector of ['.gn-atlas-introduction','.ia-secondary-controls']){const d=q(selector);if(d)d.open=false;}}
      root.dataset.mobileReady='true';
    }
    configureLanding();
    if(compactLayout.addEventListener)compactLayout.addEventListener('change',configureLanding);
    readHash();render();
    if(safeReader)requestAnimationFrame(()=>q('.ia-layout').scrollIntoView({block:'start'}));
    root.atlasTest={data:D,state,render,selectNode,selectEdge,selectHistory,temporal,filteredNodes,timelineNodes,getVisible:()=>({nodes:visibleNodes.map(n=>n.id),edges:visibleEdges.map(e=>e.id)}),setView:v=>{state.view=v;render()},setRange:(a,b)=>changeRange(a,b),zoomAt,centerYear,shiftRange};
  })();
  

