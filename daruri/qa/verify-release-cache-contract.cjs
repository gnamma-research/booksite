'use strict';
/* Audit only: compare changed reader assets and release cache keys against
 * immutable UX integration baseline. Never alter real PDF or reader data. */
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path'),cp=require('node:child_process');
const base='6e0580e482a55ffea272771da6c4f08f248ce139';
const root=path.resolve(__dirname,'..');
const changed=['gnamma-word-context.js','personal-export.js','reading-desk.css','compact-menu.css'];
const entrypoints=['index.html','dictionary.html','personal-export.html','dynamic-editions.html'];
const old=file=>cp.execFileSync('git',['show',base+':daruri/'+file],{encoding:'utf8',maxBuffer:12000000});
const now=file=>fs.readFileSync(path.join(root,file),'utf8');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,16);
const esc=s=>s.replace(/[.*+?^$()|[\]{}]/g,'\\$&');
function refs(txt,name){
 const re=new RegExp('(?:src|href)\\s*=\\s*["\\x27]([^"\\x27]*'+esc(name)+'(?:\\?[^"\\x27]*)?)["\\x27]','gi');
 return [...txt.matchAll(re)].map(x=>x[1]);
}
const urlVersions=(txt,name)=>[...txt.matchAll(new RegExp(esc(name)+'\\?v=([A-Za-z0-9_.-]+)','g'))].map(x=>x[1]);
const swName=txt=>(txt.match(/const NAME=["']([^"']+)/)||[])[1]||null;
const swRegistration=txt=>(txt.match(/serviceWorker\.register\(['"]([^'"]+)/)||[])[1]||null;
const findings=[];
const beforeSW=old('sw.js'),afterSW=now('sw.js'),beforeIndex=old('index.html'),afterIndex=now('index.html');
const report={
 baseline:base,assets:[],serviceWorker:{
  oldCache:swName(beforeSW),newCache:swName(afterSW),
  oldRegistration:swRegistration(beforeIndex),newRegistration:swRegistration(afterIndex),
  oldSha:hash(beforeSW),newSha:hash(afterSW)
 },entrypoints:{}
};
for(const file of entrypoints){
 const before=old(file),after=now(file);
 report.entrypoints[file]={oldSha:hash(before),newSha:hash(after)};
}
for(const file of changed){
 const previous=old(file),current=now(file);
 const active=previous!==current;
 const resource={name:file,changed:active,oldSha:hash(previous),newSha:hash(current),
  entrypoints:{},cacheVersions:{previous:urlVersions(beforeSW,file),current:urlVersions(afterSW,file)}};
 for(const entry of entrypoints){
  const before=old(entry),after=now(entry),oldRefs=refs(before,file),newRefs=refs(after,file);
  if(oldRefs.length||newRefs.length)resource.entrypoints[entry]={old:oldRefs,new:newRefs};
 }
 report.assets.push(resource);
 if(!active)continue;
 if(!Object.values(resource.entrypoints).some(x=>JSON.stringify(x.old)!==JSON.stringify(x.new)))
  findings.push(file+': changed bytes but HTML entrypoints still use the previous asset URL');
 if(swName(beforeSW)===swName(afterSW))
  findings.push(file+': changed bytes but the service-worker cache name is unchanged');
 if(JSON.stringify(resource.cacheVersions.previous)===JSON.stringify(resource.cacheVersions.current))
  findings.push(file+': service worker still precaches the previous resource URLs');
}
if(swRegistration(beforeIndex)===swRegistration(afterIndex))
 findings.push('index.html registers exactly the previous service-worker URL');
if(beforeSW===afterSW)
 findings.push('Service-worker script bytes are identical: unchanged worker will not reinstall to refresh offline assets');
report.findings=[...new Set(findings)];
const dest=path.join(__dirname,'cache-audit-artifacts');
fs.mkdirSync(dest,{recursive:true});
fs.writeFileSync(path.join(dest,'release-cache-contract.json'),JSON.stringify(report,null,2));
console.log('CACHE CONTRACT '+JSON.stringify({
 baseline:base,changed:report.assets.filter(x=>x.changed).map(x=>x.name),
 cache:report.serviceWorker,findings:report.findings},null,2));
if(report.findings.length)process.exitCode=1;
