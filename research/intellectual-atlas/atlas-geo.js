(function GNAMMAGeoModule() {
"use strict";
const coast = "M992,286L980,273L959,289L988,347L964,372L950,378L953,368L912,342L906,374L937,405L940,438L898,382L894,315L887,308L866,320L865,293L844,266L816,270L754,323L751,366L732,383L700,320L695,270L679,282L663,270L676,264L652,257L644,243L606,248L571,242L565,230L542,234L503,205L494,213L518,250L525,241L522,254L545,255L564,237L565,252L590,270L552,312L460,347L454,314L389,223L392,212L386,226L373,209L370,198L386,197L400,172L401,153L331,155L339,152L321,132L379,112L443,117L443,106L405,86L426,70L393,76L392,85L405,85L384,93L372,85L381,79L353,77L330,109L344,120L293,124L292,137L305,143L294,148L298,157L286,153L283,142L298,143L281,141L269,114L220,82L209,85L211,94L260,127L247,125L241,145L237,128L182,93L139,102L95,154L67,160L57,150L40,152L38,104L99,101L103,77L74,60L101,59L96,50L112,53L159,21L191,20L180,0 M193,0L193,13L229,19L267,14L282,8L281,0 M229,0L213,0 M367,196L411,297L430,327L459,348L452,356L469,365L522,353L496,412L439,464 M187,464L192,423L183,410L160,414L143,395L52,413L12,389L0,368 M0,236L30,214L38,188L68,161L96,167L190,149L200,151L194,178L264,206L286,184L345,201L367,196 M992,459L983,439L992,435 M919,464L874,403L892,406L942,446L948,464 M112,42L66,48L93,34L69,33L91,21L88,8L71,9L76,0 M71,0L69,0 M89,0L126,28L112,42 M48,33L29,33L42,27L32,28L41,22L31,14L63,6L61,30L48,33 M754,400L754,369L767,392L754,400 M984,301L992,288 M992,301L984,301 M232,154L212,144L237,142L232,154 M180,136L177,120L186,118L189,134L180,136 M953,464L961,464 M507,133L515,125L486,91L506,75L535,72L538,85L514,93L534,106L535,120L541,111L550,120L534,126L544,153L506,147L507,133 M365,464L379,444L391,450L378,464 M604,90L590,101L577,89L606,74L604,90 M988,2L984,21L942,35L988,2 M706,77L746,75L716,75L705,88L706,77 M233,344L224,348L218,337L233,344 M309,443L291,431L266,436L243,464 M242,464L258,429L254,451L274,432L309,443 M959,368L948,348L952,355L960,349L958,329L938,301L959,328L959,368 M829,256L837,238L829,256 M669,222L655,232L653,257L655,232L669,222 M163,379L184,385L166,386L164,405L163,379 M498,0L505,4L497,0 M10,327L0,318 M0,316L10,327 M815,248L826,257L815,248 M464,175L487,192L464,175 M54,343L76,334L54,343 M87,315L102,312L87,315 M149,373L161,378L149,373 M42,355L50,346L42,355 M964,286L955,278L964,286 M491,72L496,77L491,72";
const S={layer:"both",century:"all",region:"all",quality:"all",city:"",selectedEvent:"",zoom:1,cx:504,cy:236,storyPage:0,showContext:false};
const names={work:"Work composition",author:"Author biography",context:"Regional association"};
const placeRegion={
 murcia:"al-Andalus",cordoba:"al-Andalus",marrakesh:"Maghrib",jaen:"al-Andalus",
 medina:"Hijaz",mecca:"Hijaz",baghdad:"Iraq",basra:"Iraq",kufa:"Iraq",
 damascus:"Syria",aleppo:"Syria",nawa:"Syria",cairo:"Egypt",
 tus:"Khurasan",nishapur:"Khurasan",bukhara:"Transoxiana",rayy:"Iran",isfahan:"Iran",hamadan:"Iran",
 herat:"Khurasan",konya:"Anatolia",shiraz:"Iran",kahak:"Iran",qom:"Iran",
 gorgan:"Iran",jurjaniyya:"Khwarazm",samarkand:"Transoxiana",amol:"Iran"
};
const regions=["all","al-Andalus","Maghrib","Hijaz","Egypt","Iraq","Syria","Anatolia","Iran","Khurasan","Transoxiana","Khwarazm"];
const q=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const yr=x=>x==null?"undated":x+" AH";
const century=x=>x==null?null:Math.floor((Number(x)-1)/100)+1;
const pointX=lon=>(lon+14)*8,pointY=lat=>(56-lat)*8;
const link=u=>{try{if(!u)return "";const v=new URL(u,location.href);return /^https?:$/.test(v.protocol)?v.href:""}catch{return ""}};
let atlas=null,records={events:[],places:[]},attached=false,root=null,expose={};
function setData(d){records={events:d?.events||[],places:d?.places||[]};}
function init(target,api){root=target;expose=api||{};if(attached)return;attached=true;
 root.addEventListener("click",event=>{
  const t=event.target.closest("[data-geo-layer],[data-geo-century],[data-geo-region],[data-geo-quality],[data-geo-city],[data-geo-event],[data-geo-zoom],[data-geo-pan],[data-geo-clear],[data-geo-context],[data-geo-work]");
  if(!t||!root.contains(t))return;
  event.preventDefault();
  if(t.hasAttribute("data-geo-layer"))S.layer=t.getAttribute("data-geo-layer");
  else if(t.hasAttribute("data-geo-century")){S.century=t.getAttribute("data-geo-century");S.city="";}
  else if(t.hasAttribute("data-geo-region")){S.region=t.getAttribute("data-geo-region");S.city="";}
  else if(t.hasAttribute("data-geo-quality"))S.quality=t.getAttribute("data-geo-quality");
  else if(t.hasAttribute("data-geo-city")){
   S.city=t.getAttribute("data-geo-city");S.selectedEvent="";
  }
  else if(t.hasAttribute("data-geo-event"))S.selectedEvent=t.getAttribute("data-geo-event");
  else if(t.hasAttribute("data-geo-zoom")){
   const fac=+t.getAttribute("data-geo-zoom")||1;S.zoom=Math.max(1,Math.min(4,S.zoom*fac));
  }
  else if(t.hasAttribute("data-geo-pan")){
   const [x,y]=t.getAttribute("data-geo-pan").split(",").map(Number);
   S.cx=Math.max(0,Math.min(1008,S.cx+x*1008/S.zoom*.15));S.cy=Math.max(0,Math.min(472,S.cy+y*472/S.zoom*.15));
  }
  else if(t.hasAttribute("data-geo-clear")){S.city="";S.selectedEvent="";S.zoom=1;S.cx=504;S.cy=236;S.century="all";S.region="all";}
  else if(t.hasAttribute("data-geo-context"))S.showContext=!S.showContext;
  else if(t.hasAttribute("data-geo-work")){const id=t.getAttribute("data-geo-work");expose.select?.(id);return;}
  if(S.city){const p=records.places.find(p=>p.id===S.city);if(p&&S.zoom>1){S.cx=pointX(p.lon);S.cy=pointY(p.lat);}}
  expose.refresh?.();
 });
 root.addEventListener("change",event=>{
  const t=event.target.closest("[data-geo-century-select],[data-geo-layer-select],[data-geo-region-select]");
  if(!t||!root.contains(t))return;
  if(t.hasAttribute("data-geo-century-select"))S.century=t.value;
  if(t.hasAttribute("data-geo-layer-select"))S.layer=t.value;
  if(t.hasAttribute("data-geo-region-select"))S.region=t.value;
  S.city="";expose.refresh?.();
 });
}
function findRelated(ev,works){
 const set=new Set();
 if(ev.work_id)set.add(ev.work_id);
 for(const n of works){
  if(ev.reader_ids?.includes(n.readerId))set.add(n.id);
  if(ev.canonical_authors?.includes(n.author)&&n.layer==="audited"&&n.kind==="work")set.add(n.id);
 }
 return [...set].filter(id=>works.some(n=>n.id===id));
}
function eventsFor(works,subject){
 const byId=new Map(works.map(n=>[n.id,n]));
 let all=records.events.map(ev=>{
  const ids=findRelated(ev,works).filter(id=>byId.has(id));
  return {...ev,related_ids:ids,subjectTags:[...new Set(ids.flatMap(id=>byId.get(id)?.subjects||[]))]};
 }).filter(ev=>ev.related_ids.length && (subject==="all"||ev.subjectTags.includes(subject)));
 if(S.showContext){
  const regs=records.places.filter(p=>p.id&&p.label);
  for(const n of works){
   if(!n.region||n.kind!=="work"||n.layer!=="audited")continue;
   if(subject!=="all"&&!n.subjects.includes(subject))continue;
   for(const p of regs){
    // Only literal place names, and never a school/nisba-derived geolocation.
    const key=p.label.replace(/\s*\(.+?\)/g,"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    if(!new RegExp("\\b"+key+"\\b","i").test(n.region||""))continue;
    all.push({id:"context:"+n.id+":"+p.id,entity:"context",kind:"regional_label",
     title:n.title,work_id:n.id,related_ids:[n.id],place:p.label,place_id:p.id,lat:p.lat,lon:p.lon,time_ah:null,
     status:"regional_association",note:"The audited work record lists this as regional context; no composition, residence, or manuscript provenance is asserted.",citation_url:""});
   }
  }
 }
 return all;
}
function eligible(works,subject){
 const all=eventsFor(works,subject);
 return all.filter(e=>(S.layer==="both"||e.entity===S.layer||e.entity==="context"&&S.showContext)
  &&(S.century==="all"||String(century(e.time_ah))===S.century)
  &&(S.region==="all"||placeRegion[e.place_id]===S.region)
  &&(S.quality==="all"||e.status==="documented"||e.status==="source_attested"));
}
function stats(works,subject){
 const all=eventsFor(works,subject);
 const linked=new Set(all.filter(e=>e.entity==="work").flatMap(e=>e.related_ids));
 const authors=new Set(all.filter(e=>e.entity==="author").map(e=>e.title));
 const ids=new Set(all.flatMap(e=>e.related_ids));
 const scoped=works.filter(n=>subject==="all"||n.subjects.includes(subject));
 return {eventCount:all.length,workEvents:all.filter(e=>e.entity==="work").length,
  authorEvents:all.filter(e=>e.entity==="author").length,locatedWorks:linked.size,
  associatedWorks:ids.size,authorNames:authors.size,
  unmapped:scoped.filter(n=>n.kind==="work"&&!ids.has(n.id)).length,records:scoped.length};
}
function centuryToolbar(items,view){
 const counts=new Map();
 items.forEach(e=>{let c=century(e.time_ah);if(c!=null)counts.set(c,(counts.get(c)||0)+1)});
 const centuries=[...counts.keys()].sort((a,b)=>a-b);
 const all='<button data-geo-century="all" aria-pressed="'+(S.century==="all")+'">All periods <small>'+items.length+'</small></button>';
 const buttons=centuries.map(c=>'<button data-geo-century="'+c+'" aria-pressed="'+(String(c)===S.century)+'">'+
 c+(c===1?"st":c===2?"nd":c===3?"rd":"th")+' c. AH <small>'+counts.get(c)+'</small></button>').join("");
 const select='<label>Century<select data-geo-century-select><option value="all">All dated periods</option>'+
 centuries.map(c=>'<option value="'+c+'"'+(String(c)===S.century?' selected':'')+'>'+c+'th c. AH ('+counts.get(c)+')</option>').join("")+'</select></label>';
 return '<div class="geo-periods" aria-label="Filter the map by historical century">'+all+buttons+'</div>'+
 '<div class="geo-mobile-century">'+select+'</div>';
}
function regionButtons(items){
 const cnt=new Map();
 items.forEach(e=>{const k=placeRegion[e.place_id]||"Other";cnt.set(k,(cnt.get(k)||0)+1)});
 return '<div class="geo-region-chips" aria-label="Select an historical region"><button data-geo-region="all" aria-pressed="'+(S.region==="all")+'">All regions</button>'+
 regions.filter(x=>x!=="all"&&cnt.has(x)).map(x=>'<button data-geo-region="'+q(x)+'" aria-pressed="'+(x===S.region)+'">'+q(x)+' <small>'+cnt.get(x)+'</small></button>').join("")+'</div>';
}
function controls(all,view){
 return '<div class="geo-compact-controls">'+
  '<div class="geo-layer-choice" role="group" aria-label="Map authors or texts">'+
   [["both","Authors + texts"],["author","Authors"],["work","Texts"]].map(([id,label])=>'<button data-geo-layer="'+id+'" aria-pressed="'+(S.layer===id)+'">'+label+'</button>').join("")+'</div>'+
  '<div class="geo-control-right"><button class="geo-quiet" data-geo-quality="'+(S.quality==="all"?"confirmed":"all")+'">'+(S.quality==="all"?"Include qualified":"Only documented")+'</button>'+
  '<button class="geo-quiet" data-geo-context aria-pressed="'+S.showContext+'" title="Show weaker regional labels separately">Regional labels '+(S.showContext?"on":"off")+'</button>'+
  '<button class="geo-quiet" data-geo-clear>Reset map</button></div></div>'+
  (view==="geography"?centuryToolbar(all,view):regionButtons(all));
}
function position(place,viewbox){
 const x=pointX(place.lon),y=pointY(place.lat);
 return [x,y];
}
function markerGroups(events){
 const by=new Map();
 for(const ev of events){
  if(!by.has(ev.place_id))by.set(ev.place_id,[]);
  by.get(ev.place_id).push(ev);
 }
 return [...by.entries()].map(([id,group])=>({id,events:group,place:records.places.find(p=>p.id===id)||group[0]}));
}
function svgMap(groups,view){
 const W=1008,H=472,w=W/S.zoom,h=H/S.zoom;
 const x=Math.max(0,Math.min(W-w,S.cx-w/2)),y=Math.max(0,Math.min(H-h,S.cy-h/2));
 const vb=[x,y,w,h].join(" ");
 const grid=[];
 for(let lon of [0,20,40,60,80,100]){
  const X=pointX(lon);grid.push('<line x1="'+X+'" y1="0" x2="'+X+'" y2="'+H+'" class="geo-gridline"/>'+
   '<text x="'+X+'" y="21" text-anchor="middle" class="geo-coordinate">'+lon+'°E</text>');
 }
 for(let lat of [10,20,30,40,50]){
  const Y=pointY(lat);grid.push('<line x1="0" y1="'+Y+'" x2="'+W+'" y2="'+Y+'" class="geo-gridline"/>'+
   '<text x="13" y="'+(Y-4)+'" class="geo-coordinate">'+lat+'°N</text>');
 }
 let label="";
 const cities=groups.map(gr=>{
  const p=gr.place,[px,py]=position(p);
  const n=gr.events.length,types=[...new Set(gr.events.map(e=>e.entity))];
  const onlyWork=types.length===1&&types[0]==="work";
  const onlyAuthor=types.length===1&&types[0]==="author";
  const clazz=onlyWork?"work":onlyAuthor?"author":"mixed";
  const radius=Math.min(18,7+Math.sqrt(n)*2.1);
  const highlight=S.city===gr.id;
  const mark=onlyWork?
   '<rect x="'+(px-radius/1.35)+'" y="'+(py-radius/1.35)+'" width="'+radius*1.48+'" height="'+radius*1.48+'" rx="2" class="geo-pin-square"/>':
   '<circle cx="'+px+'" cy="'+py+'" r="'+radius+'" class="geo-pin-circle"/>';
  const uniqueLinks=new Set(gr.events.flatMap(e=>e.related_ids));
  return '<g role="button" tabindex="0" data-geo-city="'+q(gr.id)+'" class="geo-marker '+clazz+(highlight?' selected':'')+'"'+
  ' aria-label="'+q(p.label+': '+gr.events.length+' evidenced locations, '+uniqueLinks.size+' linked source records')+'">'+
  '<circle cx="'+px+'" cy="'+py+'" r="'+(radius+9)+'" fill="transparent" stroke="transparent" stroke-width="2"/>'+
  mark+
  '<text x="'+px+'" y="'+(py+3)+'" text-anchor="middle" class="geo-pin-count">'+(n===1?"":n)+'</text>'+
  '<text x="'+px+'" y="'+(py-radius-7)+'" text-anchor="middle" class="geo-city-label">'+q(p.label.length>21?p.label.slice(0,20)+"…":p.label)+'</text>'+
  '<title>'+q(p.label+" · "+n+" evidenced events. Select for source list.")+'</title></g>';
 }).join("");
 const backdrop='<rect width="'+W+'" height="'+H+'" fill="var(--geo-water)"/>'+
  '<path d="'+coast+'" class="geo-coastline"/>';
 const controls='<div class="geo-map-buttons">'+
  '<button data-geo-zoom="1.5" aria-label="Zoom map in">+</button>'+
  '<button data-geo-zoom=".6666667" aria-label="Zoom map out">−</button>'+
  '<button data-geo-pan="-1,0" aria-label="Pan west">←</button>'+
  '<button data-geo-pan="1,0" aria-label="Pan east">→</button>'+
  '<button data-geo-pan="0,-1" aria-label="Pan north">↑</button>'+
  '<button data-geo-pan="0,1" aria-label="Pan south">↓</button></div>';
 return '<div class="geo-map-shell">'+controls+
 '<div class="geo-map-scroll" role="region" tabindex="0" aria-label="Geographical map of documented author and work locations">'+
 '<svg class="geo-real-map" data-geo-map width="100%" viewBox="'+vb+'" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Geographical map of historical scholarly locations">'+
 backdrop+grid.join("")+cities+'</svg></div>'+
 '<div class="geo-map-attribution">Cartographic outlines: GSHHS/Basemap low-resolution coastlines, simplified; modern geographic reference only. Pins are city centroids, not historic buildings.</div></div>';
}
function eventRow(ev,works){
 const place=records.places.find(p=>p.id===ev.place_id);
 const related=ev.related_ids.map(id=>works.find(n=>n.id===id)).filter(Boolean);
 const cite=link(ev.citation_url);
 return '<article class="geo-event '+q(ev.entity)+'"><div class="geo-event-head"><strong>'+q(ev.title)+'</strong>'+
 '<span>'+q(ev.entity==="work"?"TEXT":ev.entity==="author"?"AUTHOR":"REGION")+'</span></div>'+
 '<p>'+q((ev.kind||"location").replaceAll("_"," "))+' · '+q(ev.time_ah?yr(ev.time_ah):"date not assigned")+
 ' · '+q(ev.status.replaceAll("_"," "))+'</p>'+
 '<p>'+q(ev.note)+'</p>'+
 (cite?'<a href="'+q(cite)+'" target="_blank" rel="noopener noreferrer">Source &amp; evidence</a>':"")+
 '<div class="geo-linked-works">'+related.slice(0,5).map(n=>'<button data-geo-work="'+q(n.id)+'">'+q(n.title)+'</button>').join("")+
 (related.length>5?'<small>+'+(related.length-5)+' further linked records</small>':"")+'</div></article>';
}
function detailPanel(visible,works){
 const chosen=visible.filter(x=>x.place_id===S.city);
 const title=records.places.find(p=>p.id===S.city)?.label||"Select a place";
 const items=chosen.length?chosen.map(e=>eventRow(e,works)).join(""):
 '<p class="geo-empty">Select a city marker to inspect the related authors and texts, exact meaning of the location, and the supporting scholarship.</p>';
 return '<aside class="geo-city-sheet" aria-label="Sources and events at selected historical place">'+
 '<header><div><span class="geo-small-title">LOCATION DOSSIER</span><h3>'+q(title)+'</h3></div><span class="geo-place-count">'+chosen.length+' records</span></header>'+
 '<div class="geo-event-scroll">'+items+'</div></aside>';
}
function centuryNarrative(visible,all,works){
 const per=new Map();
 for(const e of all){const c=century(e.time_ah);if(c==null)continue;if(!per.has(c))per.set(c,[]);per.get(c).push(e);}
 const periods=[...per.entries()].sort((a,b)=>a[0]-b[0]);
 const cells=periods.map(([c,items])=>{
  const cities=[...new Set(items.map(e=>e.place))];
  const worksCount=items.filter(e=>e.entity==="work").length;
  const authorsCount=items.filter(e=>e.entity==="author").length;
  return '<button type="button" class="geo-century-card" data-geo-century="'+c+'">'+
   '<span class="geo-century-number">'+c+'<sup>th</sup></span>'+
   '<span class="geo-century-meta">'+authorsCount+' author events · '+worksCount+' textual events</span>'+
   '<strong>'+q(cities.slice(0,3).join(" · "))+'</strong>'+
   '<small>'+q(items.length>3?items.length+" source-linked place events":"Each location is source linked")+'</small></button>';
 }).join("");
 return '<section class="geo-chronicle"><div class="geo-section-heading"><h3>Centuries at a glance</h3>'+
 '<p>These counts describe documented location events in this research register—not all books produced in a century.</p></div>'+
 '<div class="geo-century-grid">'+cells+'</div></section>';
}
function regionalNarrative(all){
 const by=new Map();
 for(const e of all){
  const region=placeRegion[e.place_id]||"Other";
  if(!by.has(region))by.set(region,[]);
  by.get(region).push(e);
 }
 return '<section class="geo-chronicle"><div class="geo-section-heading"><h3>Historical regions</h3>'+
 '<p>Browse regions by documented work and author locations. “Unplaced” records are not assigned to convenient modern capitals.</p></div>'+
 '<div class="geo-region-grid">'+[...by.entries()].sort((a,b)=>b[1].length-a[1].length).map(([region,items])=>
  '<button data-geo-region="'+q(region)+'" class="geo-region-card">'+
   '<strong>'+q(region)+'</strong><span>'+items.length+' evidenced place events</span>'+
   '<small>'+q([...new Set(items.map(x=>x.place))].slice(0,4).join(" · "))+'</small></button>').join("")+'</div></section>';
}
function render(works,subject,view){
 const all=eventsFor(works,subject);
 const visible=eligible(works,subject);
 const groups=markerGroups(visible);
 const coverage=stats(works,subject);
 if(S.city&&!groups.some(g=>g.id===S.city))S.city="";
 const title=view==="regions"?"Regions of scholarship":"Geographical history of authors and texts";
 const headline='<div class="geo-header"><div><span class="geo-small-title">MAP · الخريطة</span>'+
 '<h2>'+title+'</h2><p>Follow where texts were composed and scholars lived, taught or died—only where those locations are independently documented.</p></div>'+
 '<div class="geo-stats"><span><strong>'+coverage.workEvents+'</strong> textual events</span>'+
 '<span><strong>'+coverage.authorNames+'</strong> mapped authors</span>'+
 '<span><strong>'+coverage.unmapped.toLocaleString()+'</strong> works unplaced</span></div></div>';
 const legend='<div class="geo-legend"><span><i class="geo-symbol author"></i> Author life / study</span>'+
 '<span><i class="geo-symbol work"></i> Text composition / revision</span>'+
 (S.showContext?'<span><i class="geo-symbol context"></i> Qualified regional label</span>':"")+
 '<span>Only '+coverage.associatedWorks+' source records have at least one associated geographical event; many bibliographic records remain unplaced.</span></div>';
 const narrative=view==="regions"?regionalNarrative(all):centuryNarrative(visible,all,works);
 return '<div class="geo-layout">'+headline+controls(all,view)+
 '<div class="geo-main-grid">'+svgMap(groups,view)+detailPanel(visible,works)+'</div>'+legend+narrative+
 '<p class="geo-method">Map evidence policy: an author’s birthplace, residence or death is <em>not</em> automatically the place of composition of that author’s books. The registered work events specify beginnings, completions and recensions separately. City coordinates locate modern reference points, not ancient buildings. The wider OpenITI and Alreq catalogues are not silently geocoded from titles or personal nisbas.</p></div>';
}
window.GNAMMAGeography={setData,init,render,debug:()=>({events:records.events.length,places:records.places.length,layer:S.layer,century:S.century,region:S.region,quality:S.quality,city:S.city,zoom:S.zoom,context:S.showContext})};
})();
