(async function(){
  'use strict';
  const $=id=>document.getElementById(id),root=new URL('.',document.baseURI);
  const fetchFile=async(name,type='json')=>{
    const url=new URL(name,root),r=await fetch(url,{cache:'no-cache'});
    if(!r.ok)throw Error('Missing publication asset: '+name+' (HTTP '+r.status+')');
    return type==='binary'?new Uint8Array(await r.arrayBuffer()):r.json();
  };
  const digest=window.GnammaDynamicPdf?.digest;
  if(!digest||!window.PDFLib){
    $('status').textContent='The local PDF processing libraries could not load.';
    return;
  }
  const state={profiles:new Map(),packets:new Map(),bases:new Map(),maps:new Map(),booked:new Map()};
  const packetName=p=>p.apparatus.join('-');
  const profileSelected=()=>state.profiles.get($('edition').value);
  let inProgress=false;
  try{
    const [catalog,packetManifest,baseManifest,baseMapManifest]=await Promise.all([
      fetchFile('../editions/apparatus/manifest.json'),
      fetchFile('packets/manifest.json'),
      fetchFile('../editions/manifest.json'),
      fetchFile('../editions/maps/manifest.json')
    ]);
    if(catalog.status!=='verified'||catalog.files?.length!==120||
       packetManifest.schema!==1||packetManifest.packets?.length!==15||
       packetManifest.profiles?.length!==120||
       baseManifest.status!=='verified'||baseManifest.files?.length!==12||
       baseMapManifest.status!=='verified'||baseMapManifest.files?.length!==12)
      throw Error('The published and reusable-packet manifests do not describe a complete verified release.');
    const baseRaw=await fetchFile('../editions/manifest.json','binary');
    if(await digest(baseRaw)!==packetManifest.base_manifest_sha256)
      throw Error('Reusable apparatus belongs to a different published base revision.');
    for(const x of packetManifest.packets)state.packets.set(x.components.join('-'),x);
    for(const x of baseManifest.files)state.bases.set(x.file,x);
    for(const x of baseMapManifest.files)state.maps.set(x.file,x);
    for(const x of packetManifest.profiles)state.booked.set(x.profile,x);
    for(const x of catalog.files)if(state.booked.has(x.file)&&state.bases.has(x.source_base))
      state.profiles.set(x.file,x);
    if(state.profiles.size!==120)throw Error('Cannot resolve every published combination from approved base assets.');
    const select=$('edition');select.replaceChildren();
    for(const [file,profile] of state.profiles){
      const o=document.createElement('option');o.value=file;
      o.textContent=(profile.tier==='study'?'Study':'Reading')+
        ' · '+profile.language+' · '+profile.apparatus.join(' + ')+
        ' · '+profile.pages+' pages'+(profile.editorial_titles?' · Editorial titles':'');
      select.append(o);
    }
    select.disabled=false;
    const onSelect=()=>{
      const p=profileSelected();if(!p)return;
      $('base').textContent=p.source_base;
      $('packet').textContent=p.apparatus.join(' + ');
      $('published').href='../editions/'+p.file+'?v='+p.sha256.slice(0,12);
      $('published').removeAttribute('aria-disabled');
      $('status').textContent='Ready: downloadable resources will be verified before PDF assembly.';
      $('make').disabled=!$('ack').checked||inProgress;
      $('result').hidden=true;
    };
    select.addEventListener('change',onSelect);
    $('ack').addEventListener('change',onSelect);
    onSelect();
  }catch(e){$('status').textContent='Published PDF fallback is available. Dynamic mode unavailable: '+String(e.message||e);return}
  $('make').addEventListener('click',async()=>{
    if(inProgress||!$('ack').checked)return;
    const row=profileSelected();if(!row)return;
    inProgress=true;$('make').disabled=true;$('progress').hidden=false;
    $('progress').value=0;$('result').hidden=true;
    const status=(message,value)=>{$('status').textContent=message;$('progress').value=value};
    const elapsed=performance.now();
    try{
      status('Loading the exact approved publisher PDF, packet and link maps…',12);
      const base=state.bases.get(row.source_base);
      const packet=state.packets.get(packetName(row));
      const mapRecord=state.maps.get(row.source_base);
      const profileMapRecord=state.booked.get(row.file);
      if(!base||!packet||!mapRecord||!profileMapRecord)
        throw Error('Missing a SHA-bound source map or a verified packet.');
      const [baseBytes,packetBytes,packetMapRaw,baseMapRaw,profileMapRaw]=await Promise.all([
        fetchFile('../editions/'+base.file,'binary'),
        fetchFile('packets/'+packet.file,'binary'),
        fetchFile('packets/'+packet.map,'binary'),
        fetchFile('../editions/'+mapRecord.map_file,'binary'),
        fetchFile('packets/'+profileMapRecord.map,'binary')
      ]);
      status('Validating original PDF and the signed-by-hash appendix geometry…',40);
      if(await digest(baseMapRaw)!==mapRecord.map_sha256||
         await digest(packetMapRaw)!==packet.map_sha256)
        throw Error('A source geometry or packet map failed SHA-256 validation.');
      status('Composing searchable PDF with interlinked notes and bookmarks…',61);
      const result=await window.GnammaDynamicPdf.assemble({
        lib:window.PDFLib,baseBytes,packetBytes,
        baseManifestRecord:base,packetManifestRecord:packet,
        baseMap:JSON.parse(new TextDecoder().decode(baseMapRaw)),
        packetMap:JSON.parse(new TextDecoder().decode(packetMapRaw)),
        profileMap:JSON.parse(new TextDecoder().decode(profileMapRaw)),
        profileMapRaw,profileMapRecord,profile:row,
        baseMapSha:mapRecord.map_sha256,packetMapSha:packet.map_sha256
      });
      if(result.pages!==row.pages||result.basePages!==base.pages||
         result.map.source_sha256!==result.sha256)
        throw Error('The generated PDF failed publication page-map certification.');
      status('PDF complete; verifying browser download…',94);
      const blob=new Blob([result.bytes],{type:'application/pdf'});
      const url=URL.createObjectURL(blob);
      const link=document.createElement('a');link.href=url;
      link.download=row.filename.replace(/\.pdf$/,'')+'-on-device.pdf';
      document.body.append(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),90000);
      status('Verified local PDF assembled. Publisher PDFs and your private notes are unchanged.',100);
      $('result').hidden=false;
      $('result').textContent=result.pages+' pages · '+Math.round(blob.size/1024)+' KiB · '+
        result.linkCounts.sourceLinks+' certified source links · SHA-256 '+
        result.sha256.slice(0,16)+'… · '+Math.round(performance.now()-elapsed)+' ms. '+
        'Use the approved published edition for personal notes until the integrated exporter is certified.';
    }catch(e){
      status('No PDF saved: '+String(e.message||e)+'. Original approved file is available above.',0);
    }finally{inProgress=false;$('make').disabled=!$('ack').checked;$('progress').hidden=true}
  });
})();
