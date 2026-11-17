(()=>{'use strict';
const $=q=>document.querySelector(q);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data=null,active=new URL(location.href).searchParams.get('era')||'prophetic';
const domains={prophetic:[570,632,10],postprophetic:[632,1492,100],modern:[1498,2026,50]};
function link(ch){return '<a href="read.html#ch-'+String(ch).padStart(2,'0')+'">Chapter '+ch+'</a>'}
function precision(e){
 const p=e.displayPrecision||e.certainty||'';
 return p==='documented'?'dated record':p==='conventional'?'conventional dating':p==='disputed range'?'date disputed':p==='ongoing period'?'continuing development':p;
}
function chart(events){
 const domain=domains[active],min=domain[0],max=domain[1],step=domain[2],w=1440,h=264,left=70,right=1370,axis=216;
 const X=y=>left+(y-min)/(max-min)*(right-left),ticks=[];
 for(let y=Math.ceil(min/step)*step;y<=max;y+=step)ticks.push(y);
 const tickTags=ticks.map(y=>'<g><line x1="'+X(y).toFixed(2)+'" x2="'+X(y).toFixed(2)+'" y1="13" y2="'+axis+'" class="chrono-gridline"/><text x="'+X(y).toFixed(2)+'" y="239" class="chrono-tick" text-anchor="middle">'+y+'</text></g>').join('');
 const lanes=Array(6).fill(-1000),labels=[];
 const markers=events.filter(e=>Number.isFinite(e.plotYear)).map((e,index)=>{
   const x=Math.max(left,Math.min(right,X(e.plotYear))),extent=Number.isFinite(e.plotEndYear)?Math.max(x,X(e.plotEndYear)):x;
   let lane=lanes.findIndex(v=>x-v>38);if(lane<0)lane=lanes.indexOf(Math.min(...lanes));
   lanes[lane]=extent;
   const y=36+lane*29,n=index+1;
   const range=e.plotEndYear>e.plotYear;
   const line='<line x1="'+x.toFixed(2)+'" y1="'+(y+12)+'" x2="'+x.toFixed(2)+'" y2="'+axis+'" class="chrono-event-line"/>';
   const band=range?'<rect x="'+x.toFixed(2)+'" y="'+(y-7)+'" width="'+Math.max(2,extent-x).toFixed(2)+'" height="14" rx="7" class="'+(e.displayPrecision==='disputed range'?'chrono-uncertainty-band':'chrono-date-range')+'"/>':'';
   labels.push({id:e.id,n});
   return '<a class="chrono-event-marker" href="#event-'+esc(e.id)+'" aria-label="'+esc(n+'. '+e.title+', '+e.date)+'"><title>'+esc(e.title+' · '+e.date)+'</title>'+line+band+'<circle cx="'+x.toFixed(2)+'" cy="'+y+'" r="12.7" class="chrono-dot '+(e.displayPrecision==='documented'?'chrono-documented':'')+'"/><text x="'+x.toFixed(2)+'" y="'+(y+4)+'" class="chrono-dot-number" text-anchor="middle">'+n+'</text></a>'
 }).join('');
 const caption='<p class="context-help">The horizontal positions use a linear calendar-year scale. Numbers identify the events in the dated list. Dashed spans indicate uncertain periods; solid spans mark extended processes. Positions express the source dates and their stated uncertainty.</p>';
 const visual='<div class="chrono-scroll" role="region" tabindex="0" aria-label="Proportional historical timeline; scroll sideways for full date range"><svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Years '+min+' to '+max+' with '+labels.length+' dated historical events. Numbered markers link to dated explanations below."><title>Historical timeline, '+min+'–'+max+' CE</title><desc>Markers use a linear scale and link to the corresponding event descriptions. Some dates are approximate or disputed.</desc>'+tickTags+'<line x1="'+left+'" x2="'+right+'" y1="'+axis+'" y2="'+axis+'" class="chrono-axis"/>'+markers+'</svg></div>';
 $('#chrono-chart').innerHTML=visual+caption;
 return new Map(labels.map(x=>[x.id,x.n]));
}
function draw(){
 const group=data.eras.find(x=>x.id===active)||data.eras[0];
 $('#chrono-heading').textContent=group.name;
 $('#chrono-scope').textContent=group.scope+' · Dates are expressed according to the historical evidence and its precision.';
 document.querySelectorAll('[data-era]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.era===active)));
 const events=data.events.filter(e=>e.era===active).sort((a,b)=>a.plotYear-b.plotYear||String(a.date).localeCompare(String(b.date)));
 const keys=chart(events);
 $('#chrono-events').innerHTML='<div class="chron-list">'+events.map(e=>{
   const cls=e.displayPrecision==='documented'?'documented':'';
   const dateNote=e.plotEndYear?' · period or range':'';
   return '<article class="chron-item" id="event-'+esc(e.id)+'"><p class="chron-date"><span class="chron-num">'+(keys.get(e.id)||'')+'</span> '+esc(e.date)+' <span class="chron-precision '+cls+'">'+esc(precision(e)+dateNote)+'</span></p><h3>'+esc(e.title)+'</h3><p>'+esc(e.description)+'</p><div class="subject-links">'+e.chapters.map(link).join('')+'</div></article>';
 }).join('')+'</div>';
 const url=new URL(location.href);url.searchParams.set('era',active);history.replaceState(null,'',url.pathname+url.search+url.hash);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-era]');if(b&&data){active=b.dataset.era;draw();}});
fetch('data/chronology.json').then(r=>{if(!r.ok)throw Error('Date data unavailable');return r.json()}).then(d=>{
 data=d;if(!data.eras.some(g=>g.id===active))active='prophetic';draw();
 if(location.hash)document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({block:'start'});
}).catch(()=>{$('#chrono-chart').textContent='The historical timeline is unavailable. Please use the dated source list.';$('#chrono-events').innerHTML='<p><a href="data/chronology.json">Open dated reference data</a></p>';});
})();