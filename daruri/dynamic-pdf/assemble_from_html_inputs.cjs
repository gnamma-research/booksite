#!/usr/bin/env node
'use strict';
/* RESEARCH ONLY: Render a Daruri PDF using HTML/CSS as *all PDF page inputs*.
 *
 * 1. Fresh A4 Reading/Study body: canonical HTML + Pango + WeasyPrint
 * 2. Fresh selected scholarly apparatus packet: same HTML/Pango renderer
 * 3. Cryptographically prove page/text/word/link parity against separate
 *    approved test fixtures; never use those fixtures as renderer inputs
 * 4. Create NEW transient SHA-bound source, packet and per-profile link maps
 * 5. Invoke the existing SHA-validating pdf-lib generator unchanged.
 *
 * The 12+15+120 old PDFs/maps are read for comparison and migration only.
 * This is NOT a production site that can remove fixtures or distribute
 * uncertified Arabic Unicode source pages.
 */
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),daruri=path.join(root,'daruri');
const qa=path.join(daruri,'qa/node_modules/pdf-lib');
const lib=require(qa),composer=require('./core.js');
const approvedRoot=path.join(daruri,'editions');
const packetRoot=path.join(__dirname,'packets');
const originals=JSON.parse(fs.readFileSync(path.join(approvedRoot,'manifest.json'),'utf8'));
const variants=JSON.parse(fs.readFileSync(path.join(approvedRoot,'apparatus/manifest.json'),'utf8'));
const originalPackets=JSON.parse(fs.readFileSync(path.join(packetRoot,'manifest.json'),'utf8'));
const smokeNames=[
 'daruri-reading-bilingual-glossary.pdf',
 'daruri-reading-english-index-concordance.pdf',
 'daruri-study-bilingual-glossary-index-concordance-applications-titles-on.pdf'
];
const strict=(condition,message)=>{if(!condition)throw Error('HTML_ORIGIN_RELEASE_BLOCKER: '+message)};
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const asBytes=p=>fs.readFileSync(p);
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const tmp=path.resolve(process.env.GN_HTML_TMP||'/tmp/daruri-html-all-inputs');
const target=path.resolve(process.env.GN_HTML_OUTPUT||path.join(tmp,'generated'));
const mode=process.env.GN_HTML_MATRIX||'SMOKE';
const shards=Number(process.env.GN_HTML_SHARDS||1);
const shard=Number(process.env.GN_HTML_SHARD||0);
strict(Number.isInteger(shards)&&shards>=1&&Number.isInteger(shard)&&shard>=0&&shard<shards,
 'Invalid per-shard HTML release proof');
const chosen=mode==='ALL'?
 variants.files.filter((_,i)=>i%shards===shard):
 variants.files.filter(row=>smokeNames.includes(row.filename));
strict(chosen.length===(mode==='ALL'?20:3),'Truncated source edition test matrix');
const generatedBodies=new Map(),generatedPackets=new Map();
function run(...args){
 const r=cp.spawnSync('python',args,{stdio:'inherit',cwd:root,env:process.env});
 if(r.status!==0)throw Error('Canonical HTML/Pango typesetting or independent QA failed: '+args.slice(0,3).join(' '));
}
function ensureDir(dir){fs.mkdirSync(dir,{recursive:true});}
function generatedBody(row){
 if(generatedBodies.has(row.file))return generatedBodies.get(row.file);
 const index=originals.files.findIndex(x=>x.file===row.file);
 strict(index>=0,'Approved canonical source not registered');
 const container=path.join(tmp,'source',String(index));
 ensureDir(container);
 const file=path.join(container,path.basename(row.file));
 const map=path.join(container,'source-rebound.json');
 run(path.join(__dirname,'html_first_all12.py'),
   '--index',String(index),'--out',container,'--strict');
 run(path.join(__dirname,'bind_html_runtime_map.py'),
   '--approved-pdf',path.join(approvedRoot,row.file),
   '--approved-map',path.join(approvedRoot,'maps',path.basename(row.file)+'.json'),
   '--generated-pdf',file,'--runtime-map',map,
   '--approved-manifest',path.join(approvedRoot,'manifest.json'));
 const manifest={...row,sha256:hash(asBytes(file)),bytes:fs.statSync(file).size};
 const value={file,map,record:manifest,oldSha:row.sha256};
 generatedBodies.set(row.file,value);
 return value;
}
function generatedPacket(originalPacket){
 if(generatedPackets.has(originalPacket.file))return generatedPackets.get(originalPacket.file);
 const file=path.join(tmp,'packet',originalPacket.file);
 const map=path.join(tmp,'packet',originalPacket.map);
 ensureDir(path.dirname(file));
 run(path.join(__dirname,'render_html_runtime_packet.py'),
   '--components',...originalPacket.components,
   '--approved-pdf',path.join(packetRoot,originalPacket.file),
   '--approved-map',path.join(packetRoot,originalPacket.map),
   '--output-pdf',file,'--output-map',map);
 const record={
   ...originalPacket,sha256:hash(asBytes(file)),
   bytes:fs.statSync(file).size,map_sha256:hash(asBytes(map))
 };
 const value={file,map,record,oldSha:originalPacket.sha256};
 generatedPackets.set(originalPacket.file,value);
 return value;
}
(async()=>{
 ensureDir(target);
 const all=[],begin=performance.now();
 for(const row of chosen){
  const baseRow=originals.files.find(x=>x.file===row.source_base);
  const source=baseRow&&generatedBody(baseRow);
  const packetRow=originalPackets.packets.find(x=>
   x.components.join('-')===row.apparatus.join('-'));
  strict(source&&packetRow,'Missing original source or apparatus component recipe');
  const packet=generatedPacket(packetRow);
  const originalProfileRow=originalPackets.profiles.find(x=>x.profile===row.file);
  strict(originalProfileRow&&originalProfileRow.packet===packet.record.file,
   'Approved profile link map points to the wrong apparatus');
  const rawLink=read(path.join(packetRoot,originalProfileRow.map));
  strict(rawLink.base_sha256===source.oldSha,'Source link coordinates from a different approved source');
  strict(rawLink.packet_sha256===packet.oldSha,'Packet link coordinates from a different approved appendix');
  strict(rawLink.approved_sha256===row.sha256,'Old expected result SHA mismatches approved catalogue');
  const adaptedLink={
   ...rawLink,
   base_sha256:source.record.sha256,
   packet_sha256:packet.record.sha256,
   _html_origin_temporary_binding:{
    release_approved:false,canonical_source_from_html:true,
    source_html_pdf_sha256:source.record.sha256,
    packet_html_pdf_sha256:packet.record.sha256,
    verified_old_profile_sha256:row.sha256,
    immutable_expected_link_coordinates:true
   }
  };
  const linkBytes=Buffer.from(JSON.stringify(adaptedLink));
  const runtimeProfile={...originalProfileRow,
   packet_sha256:packet.record.sha256,
   map_sha256:hash(linkBytes)};
  const adaptedRow={...row,base_sha256:source.record.sha256};
  const baseBytes=asBytes(source.file),packetBytes=asBytes(packet.file);
  const baseMapRaw=asBytes(source.map),packetMapRaw=asBytes(packet.map);
  const start=performance.now();
  const result=await composer.assemble({
    lib,
    baseBytes,packetBytes,
    baseManifestRecord:source.record,
    packetManifestRecord:packet.record,
    packetMap:JSON.parse(packetMapRaw),
    baseMap:JSON.parse(baseMapRaw),
    profile:adaptedRow,
    profileMap:adaptedLink,
    profileMapRaw:linkBytes,
    profileMapRecord:runtimeProfile,
    baseMapSha:hash(baseMapRaw),packetMapSha:hash(packetMapRaw),
  });
  strict(result.pages===row.pages,'HTML source + HTML appendix changed total pagination');
  strict(result.sections===258,'Missing original authorial section anchors');
  const dest=path.join(target,row.filename);
  fs.writeFileSync(dest,result.bytes);
  const metadata={
    profile:row.filename,expectedSha:row.sha256,
    expectedPages:row.pages,base:row.source_base,
    packet:packet.record.file,pages:result.pages,
    links:result.linkCounts,generatedSha:result.sha256,
    map:result.map,
    html_source_sha256:source.record.sha256,
    html_packet_sha256:packet.record.sha256,
    rendering_inputs_prebuilt_PDFs:[],
    old_PDF_files_used_as_read_only_QA_reference_only:true,
    native_Arabic_search_full_release_gate_approved:false
  };
  fs.writeFileSync(dest+'.json',JSON.stringify(metadata,null,2));
  const rowReport={
   file:row.filename,pages:result.pages,
   bytes:result.bytes.length,html_source_sha256:source.record.sha256,
   html_packet_sha256:packet.record.sha256,
   elapsed_ms:Math.round(performance.now()-start),
   links:result.linkCounts,sha:result.sha256
  };
  all.push(rowReport);
  console.log('HTML_ORIGIN_COMPOSED',JSON.stringify(rowReport));
 }
 const report={
  renderer:'canonical HTML -> WeasyPrint -> SHA-mapped pdf-lib; no stored source/packet PDF composition inputs',
  source_pdf_inputs:[],apparatus_packet_pdf_inputs:[],
  approved_PDFs_used_read_only_for_strict_test_proofs:true,
  profiles:all,expected:chosen.length,shard,shards,
  unique_source_designs:generatedBodies.size,
  unique_source_packets:generatedPackets.size,
  milliseconds:Math.round(performance.now()-begin),
  release_approved:false
 };
 fs.writeFileSync(path.join(target,'results.json'),JSON.stringify(report,null,2));
 console.log('HTML_ORIGIN_FINAL',JSON.stringify({
  count:all.length,source_designs:generatedBodies.size,
  apparatus_packets:generatedPackets.size,
  seconds:Math.round(report.milliseconds/1000)
 }));
})().catch(e=>{console.error(e);process.exitCode=2;});
