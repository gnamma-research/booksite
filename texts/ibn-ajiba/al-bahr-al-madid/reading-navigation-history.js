/* Daruri: independent, browser-local scholarly reading trail.
   Navigation history is not a bookmark or a personal annotation. */
(function(root){
'use strict';
const FORMAT='gnamma-reading-navigation', VERSION=1, BOOK='ibn-ajiba-bahr-vol1';
const KEY='gnamma-bahr-vol1-navigation-v1', LIMIT=50, RECENT_LIMIT=90;
function create(options){
 const opts=options||{}, storage=opts.storage||root.localStorage;
 const valid=opts.validSection||function(section){return /^\d{1,3}$/.test(section)||section==='colophon';};
 const now=opts.now||Date.now;
 let onChange=opts.onChange||function(){}, malformed=false, writable=true;
 const asNumber=(value,max)=>Math.max(0,Math.min(max,Number.isFinite(Number(value))?Number(value):0));
 const copyPoint=value=>{
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  const section=String(value.section||'');
  if(section.length>24||!valid(section))return null;
  let anchor=null;
  if(value.anchor&&typeof value.anchor==='object'){
   const segment=String(value.anchor.segment??'');
   if(/^\d{1,4}$/.test(segment))anchor={segment,top:Math.max(-2000,Math.min(2000,Number(value.anchor.top)||0))};
  }
  return {section,y:asNumber(value.y,10000000),anchor,at:asNumber(value.at||now(),4102444800000)};
 };
 const data={format:FORMAT,version:VERSION,book:BOOK,entries:[],cursor:-1,recent:[]};
 try{
  const raw=storage.getItem(KEY);
  if(raw){
   const payload=JSON.parse(raw);
   if(!payload||payload.format!==FORMAT||payload.version!==VERSION||payload.book!==BOOK||
     !Array.isArray(payload.entries)||!Array.isArray(payload.recent))throw Error('Unrecognised reading history');
   data.entries=payload.entries.slice(-LIMIT).map(copyPoint).filter(Boolean);
   data.cursor=Number.isInteger(payload.cursor)?Math.max(-1,Math.min(data.entries.length-1,payload.cursor)):-1;
   data.recent=payload.recent.slice(-RECENT_LIMIT).map(copyPoint).filter(Boolean);
  }
 }catch(_){malformed=true;writable=false;}
 const key=point=>point.section+'|'+(point.anchor?.segment??'')+'|'+Math.floor(point.y/160);
 const recentList=()=>{
  const out=[],seen=new Set();
  for(const p of [...data.entries,...data.recent].sort((a,b)=>b.at-a.at)){
   if(seen.has(key(p)))continue;seen.add(key(p));out.push({...p,anchor:p.anchor?{...p.anchor}:null});
   if(out.length>=RECENT_LIMIT)break;
  }
  return out;
 };
 function save(){
  if(!writable)return false;
  try{
   storage.setItem(KEY,JSON.stringify(data));
   onChange();return true;
  }catch(_){writable=false;onChange();return false;}
 }
 function current(){return data.cursor<0?null:data.entries[data.cursor]||null;}
 function replaceCurrent(point){
  const p=copyPoint(point),old=current();
  if(p&&old&&old.section===p.section)data.entries[data.cursor]=p;
 }
 function trim(){
  if(data.entries.length>LIMIT){const excess=data.entries.length-LIMIT;data.entries.splice(0,excess);data.cursor-=excess;}
  data.cursor=Math.max(-1,Math.min(data.cursor,data.entries.length-1));
 }
 function record(from,to){
  const source=copyPoint(from),target=copyPoint(to);
  if(!source||!target)return false;
  if(source.section===target.section&&key(source)===key(target))return false;
  const old=current();
  if(old&&old.section===source.section)replaceCurrent(source);
  else {
   data.entries=data.entries.slice(0,data.cursor+1);
   data.entries.push(source);data.cursor=data.entries.length-1;
  }
  data.entries.splice(data.cursor+1);
  data.entries.push(target);data.cursor=data.entries.length-1;trim();save();
  return true;
 }
 function move(step,at){
  const targetIndex=data.cursor+step;
  if(targetIndex<0||targetIndex>=data.entries.length)return null;
  replaceCurrent(at);
  data.cursor=targetIndex;save();
  return {...data.entries[data.cursor],anchor:data.entries[data.cursor].anchor?{...data.entries[data.cursor].anchor}:null};
 }
 function recentVisit(index,at){
  const recent=recentList(),p=recent[index];
  if(!p)return null;
  if(at)record(at,p);
  return p;
 }
 function exportData(){
  return {format:FORMAT,version:VERSION,book:BOOK,exported:new Date(now()).toISOString(),
   entries:data.entries.map(p=>({...p,anchor:p.anchor?{...p.anchor}:null})),cursor:data.cursor,
   recent:data.recent.map(p=>({...p,anchor:p.anchor?{...p.anchor}:null}))};
 }
 // Imported history becomes RECENT LOCATIONS only. It never replaces the current
 // device's trail, cursor, section or viewport.
 function importData(payload){
  if(!payload||payload.format!==FORMAT||payload.version!==VERSION||payload.book!==BOOK||
     !Array.isArray(payload.entries)||!Array.isArray(payload.recent))return 0;
  const before=new Set(recentList().map(key));
  const candidates=[...payload.entries.slice(-LIMIT),...payload.recent.slice(-RECENT_LIMIT)].map(copyPoint).filter(Boolean);
  data.recent=[...data.recent,...candidates].sort((a,b)=>b.at-a.at);
  const seen=new Set();
  data.recent=data.recent.filter(p=>{const k=key(p);if(seen.has(k))return false;seen.add(k);return true;}).slice(0,RECENT_LIMIT);
  const added=recentList().filter(p=>!before.has(key(p))).length;
  if(added)save();
  return added;
 }
 function clear(){data.entries=[];data.cursor=-1;data.recent=[];save();}
 function observe(callback){onChange=typeof callback==='function'?callback:function(){};}
 return {
  record,back:at=>move(-1,at),forward:at=>move(1,at),recentVisit,
  previous:()=>data.cursor>0?data.entries[data.cursor-1]:null,
  next:()=>data.cursor>=0&&data.cursor<data.entries.length-1?data.entries[data.cursor+1]:null,
  current,recentList,exportData,importData,clear,observe,
  status:()=>({length:data.entries.length,cursor:data.cursor,malformed,writable})
 };
}
root.GnammaNavigationHistory={create,format:FORMAT,version:VERSION};
})(typeof window==='undefined'?globalThis:window);
