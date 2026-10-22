/* Gnamma HTML-first publication: SHA-pinned local PDF assembly.
 * Append a WeasyPrint-rendered apparatus packet to a byte-verified published
 * Reading/Study PDF. Original base page operators are NOT retypeset.
 * Publisher destination aliases, internal/external PDF annotations and
 * personal-note anchor map are preserved or reconstructed and certified.
 * Browser-only: no personal Reading Desk data touches any server.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.GnammaDynamicPdf=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const COMPONENT_NAMES={glossary:"Technical glossary",
   index:"Full subject index",concordance:"R/BA textual concordance",
   applications:"Bidāya applications"};
 const ORDER=["glossary","index","concordance","applications"];
 const fail=s=>{throw Error("Gnamma PDF integrity: "+s)};
 const hasOwn=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const bytes=src=>src instanceof Uint8Array?src:new Uint8Array(src);
 async function digest(input){
   const data=bytes(input);
   if(!globalThis.crypto?.subtle)fail("SHA-256 is unavailable in this browser");
   const hash=await globalThis.crypto.subtle.digest("SHA-256",data);
   return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');
 }
 function assertConfig(row,base,packet,packetMap,baseMap,profileMap){
  if(!row||!base||!packet||!packetMap||!baseMap||!profileMap)fail("missing verified PDF profile");
  if(!Array.isArray(row.apparatus)||!row.apparatus.length||
     row.apparatus.some(s=>!ORDER.includes(s)))fail("invalid apparatus selection");
  const expected=ORDER.filter(x=>row.apparatus.includes(x));
  if(expected.length!==row.apparatus.length||expected.some((x,i)=>x!==row.apparatus[i]))
    fail("apparatus components out of canonical order");
  if(expected.join('-')!==packet.components.join('-'))fail("packet components disagree with edition");
  if(!Array.isArray(packetMap.components)||packetMap.components.join('-')!==expected.join('-'))
    fail("packet map disagrees with PDF components");
  if(base.sha256!==row.base_sha256)fail("published source PDF digest does not match selected edition");
  if(row.source_base!==base.file)fail("wrong base edition");
  if(baseMap.source_sha256!==base.sha256||baseMap.base_sha256!==base.sha256)
    fail("source word map belongs to another PDF revision");
  if(packetMap.sha256!==packet.sha256||packetMap.pages!==packet.pages)
    fail("packet metadata does not match its declared PDF");
  if(profileMap.profile!==row.file||
     profileMap.approved_sha256!==row.sha256||
     profileMap.base_sha256!==base.sha256||
     profileMap.packet_sha256!==packet.sha256||
     profileMap.source_base!==row.source_base||
     profileMap.components.join('-')!==row.apparatus.join('-'))
    fail("approved link topology refers to another edition");
  if(baseMap.section_count!==258||Object.keys(baseMap.anchors||{}).filter(x=>/^section-\d+$/.test(x)).length!==258)
    fail("section map lacks original source destinations");
 }
 function annotation(doc,page,rect,action,pageHeight){
  const {PDFName,PDFArray}=doc._gnLib;
  if(!Array.isArray(rect)||rect.length!==4||rect.some(x=>!Number.isFinite(x)))
    fail("invalid source link rectangle");
  const [x0,y0,x1,y1]=rect;
  if(x0<0||y0<0||x1<=x0||y1<=y0||x1>page.getWidth()+1||y1>pageHeight+1)
    fail("out of bounds source link rectangle");
  // fitz uses top-left coordinates, PDF annotations use bottom-left.
  const ref=doc.context.register(doc.context.obj({
    Type:PDFName.of('Annot'),Subtype:PDFName.of('Link'),F:4,
    Rect:[x0,pageHeight-y1,x1,pageHeight-y0],Border:[0,0,0],A:action
  }));
  const key=PDFName.of('Annots');
  let existing=page.node.get(key)?page.node.lookup(key,PDFArray):null;
  if(!existing){existing=doc.context.obj([]);page.node.set(key,existing);}
  existing.push(ref);
 }
 function destination(doc,targetPoint,targetPage){
  const {PDFName,PDFNull}=doc._gnLib;
  const h=targetPage.getHeight();
  const x=targetPoint&&Number.isFinite(targetPoint[0])?targetPoint[0]:0;
  const y=targetPoint&&Number.isFinite(targetPoint[1])?targetPoint[1]:70;
  if(x<0||x>targetPage.getWidth()||y<0||y>h)fail("invalid destination coordinate");
  return doc.context.obj([targetPage.ref,PDFName.of("XYZ"),x,h-y,PDFNull]);
 }
 function gotoAction(doc,targetPage,topPoint){
  const {PDFName}=doc._gnLib;
  return doc.context.obj({Type:PDFName.of('Action'),
   S:PDFName.of('GoTo'),D:destination(doc,topPoint,targetPage)});
 }
 function appendBookmarks(doc,entries){
  if(!entries.length)return;
  const {PDFName,PDFHexString,PDFDict,PDFNumber}=doc._gnLib;
  const get=k=>PDFName.of(k);
  let rootRef=doc.catalog.get(get("Outlines"));
  if(!rootRef){
   rootRef=doc.context.register(doc.context.obj({Type:get("Outlines"),Count:0}));
   doc.catalog.set(get("Outlines"),rootRef);
  }
  const outline=doc.context.lookup(rootRef,PDFDict);
  if(!outline)fail("malformed publisher bookmark tree");
  let last=outline.get(get("Last"));
  let count=outline.lookup(get("Count"),PDFNumber)?.asNumber()||0;
  for(const entry of entries){
   if(entry.page<0||entry.page>=doc.getPageCount())fail("bookmark outside document");
   const attrs={Title:PDFHexString.fromText(entry.title),Parent:rootRef,
     Dest:destination(doc,entry.to,doc.getPage(entry.page))};
   if(last)attrs.Prev=last;
   const ref=doc.context.register(doc.context.obj(attrs));
   if(last){
    const obj=doc.context.lookup(last,PDFDict);
    if(!obj)fail("bookmark predecessor is invalid");
    obj.set(get("Next"),ref);
   }else outline.set(get("First"),ref);
   last=ref;
   count++;
  }
  outline.set(get("Last"),last);
  outline.set(get("Count"),PDFNumber.of(count));
 }
 async function assemble(opts){
  const {lib,baseBytes,packetBytes,baseManifestRecord,packetManifestRecord,packetMap,baseMap,profile,profileMap,profileMapRaw,profileMapRecord}=opts||{};
  if(!lib?.PDFDocument||!lib?.PDFName||!lib?.PDFNull)fail("missing trusted local pdf-lib");
  assertConfig(profile,baseManifestRecord,packetManifestRecord,packetMap,baseMap,profileMap);
  if(!profileMapRaw||!profileMapRecord||profileMapRecord.profile!==profile.file)
    fail("no SHA-bound published edition hyperlink manifest");
  if(await digest(profileMapRaw)!==profileMapRecord.map_sha256)
    fail("edition link map file did not match its SHA-256 manifest");
  if(profileMapRecord.profile_sha256!==profile.sha256||
     profileMapRecord.packet_sha256!==packetManifestRecord.sha256)
    fail("edition link-map manifest does not match these approved PDFs");
  const [baseSha,packetSha]=await Promise.all([digest(baseBytes),digest(packetBytes)]);
  if(baseSha!==baseManifestRecord.sha256)fail("original base PDF SHA-256 mismatch");
  if(packetSha!==packetManifestRecord.sha256)fail("apparatus packet SHA-256 mismatch");
  const packetDoc=await lib.PDFDocument.load(bytes(packetBytes),{updateMetadata:false});
  const result=await lib.PDFDocument.load(bytes(baseBytes),{updateMetadata:false});
  const baseCount=result.getPageCount(),components=packetManifestRecord.components;
  if(packetDoc.getPageCount()!==packetManifestRecord.pages)fail("packet pagination mismatch");
  if(Number(baseManifestRecord.pages)!==baseCount)fail("published base pagination mismatch");
  result._gnLib=lib;
  const imported=await result.copyPages(packetDoc,[...Array(packetDoc.getPageCount()).keys()]);
  for(const page of imported){
   // Links copied from a foreign PDF can refer to that PDF's old page objects;
   // rebuild from SHA-pinned packet geometries and verified source-page map.
   page.node.delete(lib.PDFName.of("Annots"));
   result.addPage(page);
  }
  const mapAnchor=section=>{
   const anchor=baseMap.anchors["section-"+section];
   if(!anchor||!Number.isInteger(anchor.page)||!Number.isFinite(anchor.y)
       ||anchor.page<1||anchor.page>baseCount)fail("source section has no verified page "+section);
   return anchor;
  };
  const stats={sourceLinks:0,packetLinks:0,externalLinks:0};
  const entry={};
  for(const [name,title] of Object.entries(COMPONENT_NAMES)){
    if(!components.includes(name))continue;
    const rootPoint=packetMap.roots?.[name];
    if(!rootPoint||!Number.isInteger(rootPoint.page)||
       rootPoint.page<0||rootPoint.page>=packetDoc.getPageCount())
       fail("missing component root "+name);
    entry[name]={page:baseCount+rootPoint.page+1,
      x:rootPoint.to?.[0]||0,y:rootPoint.to?.[1]||70};
  }
  // Derive all hyperlinks from packet text without inventing missing source maps.
  for(const row of profileMap.links_to_source||[]){
   if(!Number.isInteger(row.section)||!Number.isInteger(row.page)||row.page<0
      ||row.page>=packetDoc.getPageCount())fail("bad appendix source locator");
   const a=mapAnchor(row.section),target=result.getPage(a.page-1);
   const page=result.getPage(baseCount+row.page);
   annotation(result,page,row.rect,gotoAction(result,target,[a.x,a.y]),page.getHeight());
   stats.sourceLinks++;
  }
  for(const row of profileMap.packet_links||[]){
   const page=result.getPage(baseCount+row.page);
   if(row.kind==="goto"){
    if(!Number.isInteger(row.target)||row.target<0||row.target>=packetDoc.getPageCount())
       fail("invalid internal apparatus destination");
    const dest=result.getPage(baseCount+row.target);
    annotation(result,page,row.rect,gotoAction(result,dest,row.to),page.getHeight());
    stats.packetLinks++;
   }else if(row.kind==="uri"){
    if(typeof row.uri!=="string"||!/^https?:\/\//i.test(row.uri))fail("unsafe external apparatus URI");
    const action=result.context.obj({Type:lib.PDFName.of("Action"),
      S:lib.PDFName.of("URI"),URI:lib.PDFString.of(row.uri)});
    annotation(result,page,row.rect,action,page.getHeight());
    stats.externalLinks++;
   }else fail("unknown apparatus hyperlink type");
  }
  const bookmarks=components.map(component=>({title:COMPONENT_NAMES[component],
    page:entry[component].page-1,to:[entry[component].x,entry[component].y]}));
  appendBookmarks(result,bookmarks);
  result.setProducer("Gnamma local dynamic publication · verified HTML/CSS apparatus");
  const output=await result.save({useObjectStreams:false});
  const outputSha=await digest(output);
  const generatedMap={
    source_sha256:outputSha,base_sha256:baseSha,filename:"generated-"+outputSha.slice(0,16)+".pdf",
    dynamic:true,source_base:profile.source_base,section_count:258,coverage:baseMap.coverage,
    section_pages:Object.fromEntries(Array.from({length:258},(_,i)=>[
      String(i+1),mapAnchor(i+1).page])),
    anchors:{...baseMap.anchors,
      ...Object.fromEntries(Object.entries(entry).map(([k,v])=>[k,v]))},
    segments:baseMap.segments||{},precision:baseMap.precision||"section",
    entry_positions:profileMap.entry_positions||{},
    provenance:{base_sha256:baseSha,packet_sha256:packetSha,
      base_map_sha256:opts.baseMapSha||null,
      packet_map_sha256:opts.packetMapSha||null,
      approved_profile_sha256:profile.sha256,
      verified_profile_links_sha256:profileMapRecord.map_sha256}
  };
  return {bytes:output,sha256:outputSha,sections:258,pages:result.getPageCount(),
    basePages:baseCount,packetPages:packetDoc.getPageCount(),
    linkCounts:stats,map:generatedMap};
 }
 return {assemble,digest,order:ORDER,version:"1.0-preview"};
});
