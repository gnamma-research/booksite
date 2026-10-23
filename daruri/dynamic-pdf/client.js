/* Gnamma local HTML/CSS publication - experimental front end.
 * All PDF bytes, map geometry and personal notes remain on the visitor's device.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const root=new URL('.',document.baseURI);
 const prefix='dynamic-pdf/packets/';
 let catalogue=null,payload=null,downloadURL=null,busy=false,ready=false;
 let activeController=null, generationId=0;
 let activeWorker=null, stopWorker=null;
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
 // Every publication asset has a finite deadline. A generation-level signal
 // cancels all parallel requests together without accepting partial documents.
 async function get(url,signal){
  const full=new URL(url,root);
  if(full.origin!==location.origin)fail('Cross-origin publication assets are forbidden');
  const local=new AbortController();
  let timedOut=false;
  const abort=()=>local.abort();
  if(signal?.aborted)fail('Generation was cancelled');
  signal?.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(()=>{timedOut=true;local.abort();},30000);
  try{
   const res=await fetch(full,{
    cache:'no-store',credentials:'same-origin',signal:local.signal
   });
   if(!res.ok)fail('Publication asset unavailable: '+url+' (HTTP '+res.status+')');
   return new Uint8Array(await res.arrayBuffer());
  }catch(error){
   if(timedOut)fail('Publication asset request timed out: '+url);
   if(signal?.aborted)fail('Generation was cancelled');
   throw error;
  }finally{
   clearTimeout(timer);
   signal?.removeEventListener('abort',abort);
  }
 }
 async function checked(url,hash,signal){
  if(!hex(hash))fail('No verified checksum for '+url);
  const bytes=await get(url,signal);
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
   if(!window.GnammaDynamicPdf?.assemble||!window.PDFLib?.PDFDocument||
      !window.GnammaPublicationDesigns?.build)
    fail('The verified local PDF generation and book-design registry are unavailable');
   status('Loading approved edition catalogue and exact layout maps…');
   const [base,apparatus,maps,packets,canonical]=await Promise.all([
    readManifest('editions/manifest.json'),
    readManifest('editions/apparatus/manifest.json'),
    readManifest('editions/maps/manifest.json'),
    readManifest(prefix+'manifest.json'),
    readManifest('pdf-editions-manifest.json')
   ]);
   if(base.status!=='verified'||base.files?.length!==12||
      apparatus.status!=='verified'||apparatus.files?.length!==120||
      maps.status!=='verified'||maps.files?.length!==12||
      packets.packets?.length!==15||packets.profiles?.length!==120)
     fail('Publication manifests do not describe the certified 12+120 edition matrix');
   // Source-page design is intrinsic to each SHA-bound base PDF. The other
   // five canonical formats remain available, not falsely "generated" using
   // an unrelated A4 apparatus or publisher-note layout.
   const designs=window.GnammaPublicationDesigns.build({base,apparatus,maps,packets,canonical});
   if(designs.approved_compositions.length!==apparatus.files.length)
    fail('An approved PDF is absent from the exact design registry');
   catalogue={base,apparatus,maps,packets,canonical,designs};
   const opt=$('gn-dyn-profile');opt.replaceChildren();
   const groups=new Map();
   for(const option of designs.approved_compositions){
    if(!hex(option.sha256)||!hex(option.packet_sha256)||!hex(option.link_map_sha256))continue;
    const design=designs.certified_source_designs.find(x=>x.id===option.design_id);
    if(!design)fail('A source design is not available for '+option.file);
    let group=groups.get(design.id);
    if(!group){
     group=document.createElement('optgroup');
     group.label=design.display;
     groups.set(design.id,group);
     opt.append(group);
    }
    const node=document.createElement('option');
    node.value=option.file;
    node.textContent=option.apparatus.join(' + ')+' · '+option.pages+' pages';
    group.append(node);
   }
   if(opt.options.length!==apparatus.files.length)
    fail('The signed design registry does not reproduce all approved apparatus editions');
   opt.value='apparatus/daruri-reading-bilingual-glossary.pdf';
   if(!opt.value)fail('The default source design has no approved apparatus binding');
   const other=$('gn-dyn-other-links');
   other.replaceChildren();
   for(const design of designs.other_approved_designs){
    // Signed canonical PDFs are separate book designs; they may be read and
    // downloaded but their pagination cannot be reinterpreted as another base.
    const link=document.createElement('a');
    link.href=new URL(design.pdf+'?v='+design.sha256.slice(0,12),root).href;
    link.textContent=design.display+' · '+design.pages+' pages';
    link.rel='noopener';
    link.target='_blank';
    other.append(link);
   }
   updateDesignDetails();
   ready=true;
   updateControls();
   status(catalogue.designs.approved_compositions.length+
    ' verified apparatus combinations from '+catalogue.designs.certified_source_designs.length+
    ' distinct source designs. Every PDF is assembled privately in this browser.');
  }catch(e){status('Cannot initialize local PDF publishing: '+e.message,true);}
 }
 function updateDesignDetails(){
  const item=selectOption();
  const summary=$('gn-dyn-design-spec');
  if(!summary)return;
  const reg=catalogue?.designs;
  const exact=reg?.approved_compositions.find(p=>p.file===item?.file);
  const design=reg?.certified_source_designs.find(b=>b.id===exact?.design_id);
  summary.textContent=design&&exact?
   'Original design: '+design.display+
   '. Source '+design.pages+' pages. Selected additions: '+
   exact.apparatus.join(', ')+'. Result '+exact.pages+
   ' pages. Original publisher footnotes and Arabic/English columns are retained.':
   'Choose a verified source design and apparatus combination.';
 }
 function clearOutput(){
  if(downloadURL){URL.revokeObjectURL(downloadURL);downloadURL=null;}
  const download=$('gn-dyn-download');
  download.hidden=true;
  download.removeAttribute('href');
  download.removeAttribute('download');
  $('gn-dyn-personal-status').textContent='';
  payload=null;
 }
 function updateControls(){
  $('gn-dyn-make').disabled=!ready||busy;
  $('gn-dyn-personal').disabled=!ready||busy;
  $('gn-dyn-cancel').hidden=!busy;
  $('gn-dyn-profile').disabled=!ready||busy;
 }
 function ensureCurrent(id){
  if(id!==generationId||activeController?.signal.aborted)
   fail('Generation was cancelled or the selected edition changed');
 }
 // A separate worker keeps the interface responsive during expensive PDF
 // composition. Cancel terminates the computation, not only the download.
 function assembleOffThread(id,options){
  return new Promise((resolve,reject)=>{
   if(typeof Worker==='undefined'){
    reject(Error('This browser cannot safely cancel local PDF assembly. Use the approved published PDF.'));
    return;
   }
   let worker;
   try{
    worker=new Worker('dynamic-pdf/assemble.worker.js?v=20261022-worker1',{type:'classic'});
   }catch(error){reject(Error('Local PDF worker unavailable: '+error.message));return;}
   let settled=false;
   let timeoutId;
   function finish(error,result){
    if(settled)return;
    settled=true;
    clearTimeout(timeoutId);
    worker.terminate();
    if(activeWorker===worker){activeWorker=null;stopWorker=null;}
    if(error)reject(error);
    else resolve(result);
   }
   activeWorker=worker;
   stopWorker=()=>finish(Error('PDF assembly cancelled'));
   timeoutId=setTimeout(()=>finish(Error('PDF assembly exceeded its 90-second deadline; try the approved PDF.')),90000);
   worker.onmessage=event=>{
    const message=event.data;
    if(message?.id!==id){finish(Error('Mismatched PDF assembly result'));return;}
    if(message.error){finish(Error(message.error));return;}
    if(!(message.result?.bytes instanceof Uint8Array))
     {finish(Error('PDF worker returned no document'));return;}
    finish(null,message.result);
   };
   worker.onerror=event=>{
    finish(Error('Local PDF worker failed: '+(event?.message||'unknown browser worker error')));
   };
   try{
    // Transfer, rather than duplicate, large PDF buffers between threads.
    // Authorial source content is never uploaded; only local bytes are moved.
    worker.postMessage({id,options},[
     options.baseBytes.buffer,
     options.packetBytes.buffer,
     options.profileMapRaw.buffer
    ]);
   }catch(error){finish(Error('Could not send verified PDFs to worker: '+error.message));}
  });
 }
 function restoreExactPublishedEdition(){
  const profile=selectOption();
  const bridge=window.GnammaPersonalExportInline;
  if(!bridge?.ready||!bridge.invalidateDynamicEdition)return false;
  const exact=profile?'editions/'+profile.file:'';
  const result=bridge.invalidateDynamicEdition(exact);
  $('gn-dyn-personal-status').textContent=result?
   'The unchanged published version of this exact selection remains available below.':
   'No verified fallback for this exact selection. Personal export is disabled.';
  return result;
 }
 function cancelGeneration(){
  if(!busy)return;
  ++generationId;
  activeController?.abort();
  stopWorker?.();
  activeController=null;
  busy=false;
  clearOutput();
  try{restoreExactPublishedEdition();}
  catch(error){status('Personal export is busy: '+error.message,true);updateControls();return;}
  updateControls();
  status('Generation cancelled. No new PDF was saved; the approved edition remains available.');
 }
 async function generate(mode){
  if(busy||!ready)return;
  const selected=selectOption();
  if(!selected){status('Select a verified edition first.',true);return;}
  // Any earlier generated edition is invalid for a new request until the
  // result passes every source/map/manifest check for this exact profile.
  let id=++generationId;
  busy=true;
  activeController=new AbortController();
  const signal=activeController.signal;
  clearOutput();
  try{
   restoreExactPublishedEdition();
   updateControls();
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
   status('Verifying the original PDF and reusable scholarly apparatus…');
   const paths={
    base:'editions/'+baseRecord.file,
    packet:prefix+packetRecord.file,
    pmap:prefix+packetRecord.map,
    profile:prefix+profileRecord.map,
    bmap:'editions/'+baseMapRecord.map_file
   };
   const [baseBytes,packetBytes,pmapBytes,profileBytes,bmapBytes]=await Promise.all([
    checked(paths.base,baseRecord.sha256,signal),
    checked(paths.packet,packetRecord.sha256,signal),
    checked(paths.pmap,packetRecord.map_sha256,signal),
    checked(paths.profile,profileRecord.map_sha256,signal),
    checked(paths.bmap,baseMapRecord.map_sha256,signal)
   ]);
   ensureCurrent(id);
   const packetMap=parse(pmapBytes),profileMap=parse(profileBytes),baseMap=parse(bmapBytes);
   status('Composing verified pages, bookmarks and exact apparatus links…');
   const started=performance.now();
   const result=await assembleOffThread(id,{
    baseBytes,packetBytes,
    baseManifestRecord:baseRecord,packetManifestRecord:packetRecord,
    packetMap,baseMap,profile:selected,
    profileMap,profileMapRaw:profileBytes,profileMapRecord:profileRecord,
    baseMapSha:baseMapRecord.map_sha256,packetMapSha:packetRecord.map_sha256
   });
   ensureCurrent(id);
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
   download.href=previewUrl;
   download.download=name;
   download.hidden=false;
   status('Verified '+result.pages+' pages in '+elapsed+' seconds · '+
    Math.round(result.bytes.length/1024)+' KiB · '+
    result.linkCounts.sourceLinks+' apparatus-to-text links. Original pages remain unchanged.');
   if(mode==='personal'){
    const bridge=window.GnammaPersonalExportInline;
    if(!bridge?.ready||!bridge.registerDynamicEdition)
     fail('Personal Reading Desk tools have not loaded; the plain PDF remains available.');
    await bridge.registerDynamicEdition(payload);
    if(id!==generationId){
     // A late digest/registration must not resurrect the wrong profile.
     restoreExactPublishedEdition();
     return;
    }
    bridge.setMode('all');
    $('gn-dyn-personal-status').textContent=
     'Edition registered locally. Choose your Reading Desk items and download the personal PDF below.';
    $('pe-form')?.scrollIntoView({behavior:'smooth',block:'start'});
   }
  }catch(error){
   if(id!==generationId)return;
   clearOutput();
   try{restoreExactPublishedEdition();}
   catch(ignore){/* A separate personal export stays protected from mutation. */}
   status('Publication not generated: '+(error?.message||String(error)),true);
  }finally{
   if(id===generationId){
    busy=false;
    activeController=null;
    updateControls();
   }
  }
 }
 document.addEventListener('DOMContentLoaded',()=>{
  $('gn-dyn-make').addEventListener('click',()=>generate('plain'));
  $('gn-dyn-personal').addEventListener('click',()=>generate('personal'));
  $('gn-dyn-cancel').addEventListener('click',cancelGeneration);
  $('gn-dyn-profile').addEventListener('change',()=>{
   // A different profile invalidates the previous local personal PDF.
   if(busy)cancelGeneration();
   else{
    ++generationId;
    clearOutput();
    try{restoreExactPublishedEdition();}
    catch(error){status('Cannot change while a personal export is active: '+error.message,true);return;}
   }
   updateDesignDetails();
   status('Ready: generate this exact design, or use its approved PDF below.');
  });
  window.addEventListener('pagehide',()=>{
   ++generationId;
   activeController?.abort();
   stopWorker?.();
   if(downloadURL)URL.revokeObjectURL(downloadURL);
  });
  updateControls();
  init();
 });
})();
