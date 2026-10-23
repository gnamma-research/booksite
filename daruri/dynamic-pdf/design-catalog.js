/* Daruri publication design registry.
 *
 * One verified source PDF per genuinely distinct body design; a finite set
 * of reusable, separately typeset scholarly apparatus packets; and SHA-bound
 * edition-specific hyperlink maps produce the 120 approved combinations.
 *
 * Scope of this release is A4 ONLY: preserve the recorded differences in
 * Arabic/English, Reading/Study, editorial headings and publisher notes.
 * Other paper sizes and unapproved print styles are explicitly excluded.
 * Arbitrary CSS cannot be applied retrospectively to fixed PDF page operators.
 * Canonical Reference/Arabic/English editions remain available as other book
 * designs but are not offered as fake apparatus-generatable configurations.
 *
 * No data fetches, PDF changes, private notes or network calls occur here.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports)module.exports=api;
  if(root)root.GnammaPublicationDesigns=api;
})(typeof window!=='undefined'?window:(typeof self!=='undefined'?self:null),function(){
  'use strict';
  const COMPONENTS=['glossary','index','concordance','applications'];
  const CANONICAL=[
    'daruri.pdf','daruri-study.pdf','daruri-english.pdf',
    'daruri-arabic.pdf','daruri-arabic-vowelled.pdf'
  ];
  const fail=msg=>{throw Error('Gnamma verified design catalogue: '+msg);};
  const hash=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
  const exact=(a,b,what)=>{if(a!==b)fail(what+' does not match the approved source');};
  const names=components=>{
    if(!Array.isArray(components)||components.length===0 ||
       components.length>COMPONENTS.length)fail('Unsupported apparatus selection');
    const normalized=COMPONENTS.filter(x=>components.includes(x));
    if(normalized.length!==components.length||normalized.some((v,i)=>v!==components[i]))
      fail('Duplicated, unordered or unsupported scholarly component');
    return normalized;
  };
  const approvedA4=item=>{
    if(item?.design_style_id && item.design_style_id!=='gnamma-a4-v1')
      fail('Only existing approved A4 designs are in the current release');
    if(item?.paper_size && item.paper_size!=='A4')
      fail('Non-A4 source or appendix is outside the current release scope');
    return 'gnamma-a4-v1';
  };
  const designId=b=>{
    if(!/^(reading|study)$/.test(b.tier)||![
       'bilingual','bilingual-unvowelled','english','arabic','arabic-vowelled'
    ].includes(b.language)||typeof b.editorial_titles!=='boolean')
      fail('Source design has an invalid tier, language or heading option');
    approvedA4(b);
    return [b.tier,b.language,b.editorial_titles?'editorial':'recorded','a4'].join('.');
  };
  const label=b=>{
    const lang={
      bilingual:'Arabic vowelled + English, parallel',
      'bilingual-unvowelled':'Arabic unvowelled + English, parallel',
      english:'English only, single column',
      arabic:'Arabic unvowelled only, single column',
      'arabic-vowelled':'Arabic vowelled only, single column'
    }[b.language];
    return (b.tier==='study'?'Study · selected notes':'Reading · no publisher notes')
      +' · '+lang+' · '+(b.editorial_titles?'editorial guide titles':'recorded headings');
  };
  function build({base,apparatus,maps,packets,canonical}){
    if(base?.status!=='verified'||maps?.status!=='verified'||
       apparatus?.status!=='verified')fail('One or more approved manifests are unverified');
    if(!Array.isArray(base.files)||!Array.isArray(maps.files)||
       !Array.isArray(apparatus.files)||!Array.isArray(packets?.packets)||
       !Array.isArray(packets?.profiles))
      fail('Incomplete or malformed source/apparatus manifests');
    // Keep the certified release finite: exactly 12 existing A4 source PDFs,
    // 15 reusable apparatus packets and 120 signed composition profiles.
    if(base.files.length!==12||maps.files.length!==12||
       packets.packets.length!==15||apparatus.files.length!==120||
       packets.profiles.length!==120)
      fail('The 12-base / 120-composition certified release is incomplete');
    if(!hash(packets.base_manifest_sha256) ||
       !hash(maps.source_manifest_sha256) ||
       !hash(apparatus.source_a4_manifest_sha256) ||
       packets.base_manifest_sha256!==maps.source_manifest_sha256 ||
       packets.base_manifest_sha256!==apparatus.source_a4_manifest_sha256)
      fail('Canonical source manifest changed without regenerating all bindings');
    const bindings=new Map(maps.files.map(x=>[x.file,x]));
    const byBase=new Map();
    for(const b of base.files){
      if(byBase.has(b.file))fail('Duplicate source design: '+b.file);
      if(!hash(b.sha256)||!Number.isInteger(b.pages)||b.pages<1)
        fail('Incomplete source PDF identity: '+b.file);
      const map=bindings.get(b.file);
      if(!map||map.sha256!==b.sha256||map.base_sha256!==b.sha256||
         !hash(map.map_sha256)||map.verified_sections!==258)
        fail('Original source map missing or mismatched: '+b.file);
      if(b.notes!==(b.tier==='study'?'selected':'none'))
        fail('Publisher footnote policy differs from recorded source: '+b.file);
      const id=designId(b);
      const sty=approvedA4(b);
      const source={
        id,type:'certified-pdf-source',page_size:'A4',
        full_text:true,body_layout:b.language.startsWith('bilingual')?'parallel':'single',
        tier:b.tier,language:b.language,editorial_titles:b.editorial_titles,
        publisher_notes:b.notes,pdf:'editions/'+b.file,
        sha256:b.sha256,pages:b.pages,map:'editions/'+map.map_file,
        map_sha256:map.map_sha256,
        display:label(b),composable:false,approved_profiles:0,
        component_template:sty,
        requires_new_pango_map_on_relayout:true
      };
      if([...byBase.values()].some(x=>x.id===id))fail('Two sources claim the same design ID');
      byBase.set(b.file,source);
    }
    if(bindings.size!==byBase.size)fail('A map points to a nonexistent source design');
    const packetByComponents=new Map();
    for(const p of packets.packets){
      approvedA4(p);
      const key=names(p.components).join('-');
      if(packetByComponents.has(key)||!hash(p.sha256)||!hash(p.map_sha256)||
         !Number.isInteger(p.pages)||p.pages<1)
        fail('Missing, duplicate or unverified apparatus packet: '+key);
      packetByComponents.set(key,p);
    }
    // For four independently selectable apparatus components exactly 15
    // nonempty packets exist. Never create an appendix whose CSS/fonts are
    // incompatible with the selected source body and page size.
    for(let n=1;n<16;n++){
      const key=COMPONENTS.filter((_,i)=>n&(1<<i)).join('-');
      if(!packetByComponents.has(key))
        fail('Missing required reusable packet: '+key);
    }
    const profileMaps=new Map();
    for(const row of packets.profiles){
      if(!row.profile||profileMaps.has(row.profile)||!hash(row.map_sha256))
        fail('Duplicate or unsigned approved edition link map');
      profileMaps.set(row.profile,row);
    }
    const namesSeen=new Set(),options=[];
    for(const row of apparatus.files){
      if(namesSeen.has(row.file))fail('Duplicate edition configuration '+row.file);
      namesSeen.add(row.file);
      const b=byBase.get(row.source_base);
      if(!b||b.language!==row.language||b.tier!==row.tier||
         b.editorial_titles!==row.editorial_titles||
         b.publisher_notes!==row.notes||b.sha256!==row.base_sha256)
        fail('Requested design and approved source do not match '+row.file);
      approvedA4(row);
      if(row.layout!=='parallel'||row.density!=='standard'||row.scope!=='full')
        fail('Edition requires a different layout template: '+row.file);
      // Arabic-only source cannot acquire an English-only critical apparatus
      // simply through joining PDFs without explicit scholarly approval.
      if(row.language==='arabic'||row.language==='arabic-vowelled')
        fail('Arabic-only source cannot gain an unverified English appendix');
      const key=names(row.apparatus).join('-');
      const p=packetByComponents.get(key);
      const link=profileMaps.get(row.file);
      if(link)approvedA4(link);
      if(!p||!link||link.packet!==p.file||link.packet_sha256!==p.sha256||
         link.profile_sha256!==row.sha256||link.base!==row.source_base||
         link.profile!==row.file||!hash(row.sha256))
        fail('SHA-bound packet/link profile mismatch for '+row.file);
      b.composable=true;
      b.approved_profiles++;
      options.push({
        file:row.file,design_id:b.id,source_base:row.source_base,
        packet:p.file,packet_sha256:p.sha256,link_map:link.map,
        link_map_sha256:link.map_sha256,apparatus:[...row.apparatus],
        pages:row.pages,sha256:row.sha256,
        approved:true,display:label(b)+' · '+row.apparatus.join(' + ')
      });
    }
    if(options.length!==120)fail('Expected exactly 120 approved A4 compositions');
    // The approved A4 release has eight eligible source designs, each with
    // all 15 scholarly apparatus combinations. No other print formats.
    for(const design of byBase.values()){
      if(design.composable && design.approved_profiles!==15)
        fail('Incomplete 15-component pack family for '+design.id);
    }
    if(options.length!==[...byBase.values()].reduce((n,d)=>n+d.approved_profiles,0))
      fail('Edition-to-base ownership inconsistent');
    const fixed=[];
    if(canonical?.files){
      for(const file of CANONICAL){
        const e=canonical.files[file];
        if(!e||!hash(e.sha256)||!Number.isInteger(e.pages)||e.pages<1)
          fail('Different canonical book design is missing or unsigned: '+file);
        fixed.push({
          id:'canonical.'+file.slice(0,-4),
          type:'other-approved-book-design',composable:false,
          pdf:file,sha256:e.sha256,pages:e.pages,
          display:e.title||file,
          reason:'This separately typeset publication has no approved reusable packet and link-map profile.'
        });
      }
    }
    return {
      schema:1,mode:'source-pdf + reusable apparatus packet + exact per-edition link map',
      byte_identical:false,layout_presentation_exact:true,
      complete_baseline:byBase.size===12&&options.length===120,
      certified_source_designs:[...byBase.values()],
      approved_compositions:options,
      other_approved_designs:fixed,
      invariants:{
        section_destinations:258,
        generated_apparatus_uses_approved_edition_link_maps:true,
        native_arabic_search_requires_separate_release_gate:true,
        cross_design_relayout_requires_new_source_pdf:true,
        release_paper_size:'A4',
        alternative_paper_sizes_excluded:true,
        private_notes_uploaded:false,
        remove_static_fallbacks:false
      }
    };
  }
  return {build,designId,version:'1.1-a4-only'};
});
