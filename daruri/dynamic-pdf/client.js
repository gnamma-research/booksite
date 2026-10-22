/* Gnamma local HTML/CSS publication - experimental front end.
 * All PDF bytes, map geometry and personal notes remain on the visitor's device.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const root=new URL('.',document.baseURI);
 const prefix='dynamic-pdf/packets/';
 let catalogue=null,payload=null,downloadURL=null,busy=false,ready=false;
 const loaded=new Map();
 const fail=m=>{throw Error(m)};
 const hex=s=>/^[0-9a-f]{64}$/.test(String(s||''));
 const title=row=>{
  const bits=[row.tier==='study'?'Study':'Reading',
    row.language==='bilingual-unvowelled'?'Arabic unvowelled / English':
    row.language==='bilingual'?'Arabic vowelled / English':'English'];
  if(row.editorial_titles)bits.push('Editorial titles');
  bits.push(row.apparatus.map(x=>x[0].toUpperCase()+x.slice(1)).join(' + '));
  return bits.join(' · ');
 };
 const status=(msg,error=false)=>{
  const out=$('gn-dyn-status');
  out.textContent=msg;out.setAttribute('data-error',error?'true':'false');
 };
 async function get(url){
  const full=new URL(url,root);
  if(full.origin!==location.origin)fail('Cross-origin publication assets are forbidden');
  const res=await fetch(full,{cache:'no-store',credentials:'same-origin'});
  if(!res.ok)fail('Publication asset unavailable: '+url+' (HTTP '+res.status+')');
  return new Uint8Array(await res.arrayBuffer());
 }
 async function checked(url,hash){
  if(!hex(hash))fail('No verified checksum for '+url);
  const bytes=await get(url);
  if(await window.GnammaDynamicPdf.digest(bytes)!==hash)
    fail('The stored publication checksum did not match '+url);
  return bytes;
 }
 const parse=b=>JSON.parse(new TextDecoder().decode(b));
 async function readManifest(file){
  const data=parse(await get(file));
  if(!data||typeof data!=='object')fail('Invalid publication manifest '+file);
  return data;
 }
 const selectOption=()=>catalogue?.apparatus.files.find(x=>x.file===$('gn-dyn-profile').value);
 async function init(){
  try{
   if(!window.GnammaDynamicPdf?.assemble||!window.PDFLib?.PDFDocument)
    fail('The local PDF publishing engine is not installed');
   status('Loading approved edition catalogue and exact layout maps…');
   const [base,apparatus,maps,packets]=await Promise.all([
    readManifest('editions/manifest.json'),
    readManifest('editions/apparatus/manifest.json'),
    readManifest('editions/maps/manifest.json'),
    readManifest(prefix+'manifest.json')
   ]);
   if(base.status!=='verified'||base.files?.length!==12||
      apparatus.status!=='verified'||apparatus.files?.length!==120||
      maps.status!=='verified'||maps.files?.length!==12||
      packets.packets?.length!==15||packets.profiles?.length!==120)
     fail('Publication manifests do not describe the certified 12+120 edition matrix');
   catalogue={base,apparatus,maps,packets};
   const opt=$('gn-dyn-profile');opt.replaceChildren();
   for(const row of apparatus.files){
    if(!hex(row.sha256)||!hex(row.base_sha256)||!Array.isArray(row.apparatus))continue;
    const node=document.createElement('option');
    node.value=row.file;node.textContent=title(row)+' · '+row.pages+' pages';
    opt.append(node);
   }
   if(opt.options.length!==120)fail('120 verified apparatus configurations were not available');
   opt.value='apparatus/daruri-reading-bilingual-glossary.pdf';
   ready=true;
   $('gn-dyn-make').disabled=false;
   $('gn-dyn-personal').disabled=false;
   status('120 certified configurations are available. Generation happens entirely in this browser.');
  }catch(e){status('Cannot initialize local PDF publishing: '+e.message,true);}
 }
 function clearOutput(){
  if(downloadURL){URL.revokeObjectURL(downloadURL);downloadURL=null;}
  $('gn-dyn-download').hidden=true;
  $('gn-dyn-personal-status').textContent='';
  payload=null;
 }
 async function generate(mode){
  if(busy||!ready)return;
  busy=true;clearOutput();$('gn-dyn-make').disabled=true;$('gn-dyn-personal').disabled=true;
  try{
   const selected=selectOption();if(!selected)fail('Select a certified edition');
   const {base,apparatus,maps,packets}=catalogue;
   const baseRecord=base.files.find(x=>x.file===selected.source_base);
   const baseMapRecord=maps.files.find(x=>x.file===selected.source_base);
   const profileRecord=packets.profiles.find(x=>x.profile===selected.file);
   const packetRecord=packets.packets.find(x=>x.file===profileRecord?.packet);
   if(!baseRecord||!baseMapRecord||!profileRecord||!packetRecord)
    fail('The requested profile is missing its approved source or packet');
   if(baseRecord.sha256!==selected.base_sha256||
      baseMapRecord.sha256!==baseRecord.sha256||
      profileRecord.profile_sha256!==selected.sha256)
     fail('The approved PDF and section maps do not agree');
   status('Verifying original publisher PDF and reusable HTML/CSS apparatus…');
   const paths={
    base:'editions/'+baseRecord.file,
    packet:prefix+packetRecord.file,
    pmap:prefix+packetRecord.map,
    profile:prefix+profileRecord.map,
    bmap:'editions/'+baseMapRecord.map_file
   };
   const [baseBytes,packetBytes,pmapBytes,profileBytes,bmapBytes]=await Promise.all([
    checked(paths.base,baseRecord.sha256),
    checked(paths.packet,packetRecord.sha256),
    checked(paths.pmap,packetRecord.map_sha256),
    checked(paths.profile,profileRecord.map_sha256),
    checked(paths.bmap,baseMapRecord.map_sha256)
   ]);
   const packetMap=parse(pmapBytes),profileMap=parse(profileBytes),baseMap=parse(bmapBytes);
   status('Assembling pages, bookmarks, exact source links and apparatus destinations…');
   const started=performance.now();
   const result=await window.GnammaDynamicPdf.assemble({
    lib:window.PDFLib,baseBytes,packetBytes,
    baseManifestRecord:baseRecord,packetManifestRecord:packetRecord,
    packetMap,baseMap,profile:selected,
    profileMap,profileMapRaw:profileBytes,profileMapRecord:profileRecord,
    baseMapSha:baseMapRecord.map_sha256,packetMapSha:packetRecord.map_sha256
   });
   if(result.pages!==selected.pages||Object.keys(result.map.section_pages||{}).length!==258)
    fail('Generated page count or source section map differs from the approved edition');
   const elapsed=((performance.now()-started)/1000).toFixed(2);
   const name=result.map.filename;
   const metadata={filename:name,sha256:result.sha256,pages:result.pages,
     section_pages:result.map.section_pages,anchors:result.map.anchors,
     base_sha256:result.map.base_sha256};
   payload={file:name,metadata,map:result.map,bytes:result.bytes,
     profile:selected,sourceBase:selected.source_base,
     arabic_form:selected.language==='bilingual-unvowelled'?'ar':'vocalized',
     title:title(selected)};
   const previewUrl=URL.createObjectURL(new Blob([result.bytes],{type:'application/pdf'}));
   downloadURL=previewUrl;
   const download=$('gn-dyn-download');
   download.href=previewUrl;download.download=name;download.hidden=false;
   status('Verified '+result.pages+' pages in '+elapsed+' seconds · '+
    Math.round(result.bytes.length/1024)+' KiB · '+
    result.linkCounts.sourceLinks+' apparatus-to-text links. Original pages are unchanged.');
   if(mode==='personal'){
    const bridge=window.GnammaPersonalExportInline;
    if(!bridge?.ready||!bridge.registerDynamicEdition)
      fail('Personal Reading Desk tools have not loaded; the plain PDF is still available.');
    await bridge.registerDynamicEdition(payload);
    bridge.setMode('all');
    $('gn-dyn-personal-status').textContent=
      'Edition registered locally. Choose your Reading Desk items and use Download personal PDF below.';
    $('pe-form')?.scrollIntoView({behavior:'smooth',block:'start'});
   }
  }catch(e){status('Publication not generated: '+(e?.message||String(e)),true);}
  finally{busy=false;$('gn-dyn-make').disabled=!ready;$('gn-dyn-personal').disabled=!ready;}
 }
 document.addEventListener('DOMContentLoaded',()=>{
  $('gn-dyn-make').addEventListener('click',()=>generate('plain'));
  $('gn-dyn-personal').addEventListener('click',()=>generate('personal'));
  $('gn-dyn-profile').addEventListener('change',()=>{clearOutput();status('Choose Generate to assemble the selected publication.');});
  init();
 });
})();
