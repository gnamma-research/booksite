'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'../..'),D=path.join(ROOT,'daruri');
const lib=require(path.join(D,'qa/node_modules/pdf-lib'));
const core=require('./core.js');
const BASE=path.join(D,'editions'),PACKETS=path.join(__dirname,'packets');
const baseManifest=JSON.parse(fs.readFileSync(path.join(BASE,'manifest.json')));
const manifest=JSON.parse(fs.readFileSync(path.join(PACKETS,'manifest.json')));
const apparatus=JSON.parse(fs.readFileSync(path.join(BASE,'apparatus/manifest.json')));
const cases=[
 'daruri-reading-bilingual-glossary.pdf',
 'daruri-reading-english-index-concordance.pdf',
 'daruri-study-bilingual-glossary-index-concordance-applications-titles-on.pdf'
];
const chosen=apparatus.files.filter(x=>cases.includes(x.filename));
if(chosen.length!==cases.length)throw Error('Named certified apparatus profiles absent');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
(async()=>{
 const records=[];
 const out=path.join(__dirname,'test-output');fs.mkdirSync(out,{recursive:true});
 for(const row of chosen){
  const components=row.apparatus.join('-'),base=baseManifest.files.find(b=>b.file===row.source_base);
  const packet=manifest.packets.find(a=>a.components.join('-')===components);
  if(!packet||!base)throw Error('No approved packet/base '+row.filename);
  const baseBytes=fs.readFileSync(path.join(BASE,row.source_base));
  const packetBytes=fs.readFileSync(path.join(PACKETS,packet.file));
  const baseMap=JSON.parse(fs.readFileSync(path.join(BASE,'maps',path.basename(row.source_base)+'.json')));
  const packetMap=JSON.parse(fs.readFileSync(path.join(PACKETS,packet.map)));
  const mapRecord=manifest.profiles.find(p=>p.profile===row.file);
  if(!mapRecord)throw Error('Approved source-link profile unavailable: '+row.filename);
  const profileMapRaw=fs.readFileSync(path.join(PACKETS,mapRecord.map));
  const profileMap=JSON.parse(profileMapRaw);
  const start=performance.now();
  const result=await core.assemble({
    lib,baseBytes,packetBytes,baseManifestRecord:base,packetManifestRecord:packet,
    baseMap,packetMap,profile:row,profileMap,profileMapRaw,profileMapRecord:mapRecord,
    baseMapSha:hash(fs.readFileSync(path.join(BASE,'maps',path.basename(row.source_base)+'.json'))),
    packetMapSha:hash(fs.readFileSync(path.join(PACKETS,packet.map)))
  });
  const dest=path.join(out,row.filename);
  fs.writeFileSync(dest,result.bytes);
  fs.writeFileSync(dest+'.json',JSON.stringify({profile:row.filename,expectedSha:row.sha256,
    expectedPages:row.pages,base:row.source_base,
    packet:packet.file,elapsed_ms:Math.round(performance.now()-start),
    generatedSha:result.sha256,links:result.linkCounts,pages:result.pages,map:result.map},null,2));
  records.push({file:row.filename,pages:result.pages,time_ms:Math.round(performance.now()-start),
    bytes:result.bytes.length,links:result.linkCounts,sha:result.sha256});
  console.log('ASSEMBLED',records.at(-1));
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(records,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
