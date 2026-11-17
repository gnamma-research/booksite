(function installFigures(){
'use strict';
const S = (s)=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function svg(title,desc,body,w=720,h=340){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+S(title)+'"><title>'+S(title)+'</title><desc>'+S(desc)+'</desc>'+body+'</svg>';}
function rect(x,y,w,h,txt,sub){return '<rect class="node" x="'+x+'" y="'+y+'" rx="8" width="'+w+'" height="'+h+'"/><text x="'+(x+w/2)+'" y="'+(y+25)+'" font-size="14" font-weight="600" fill="currentColor" text-anchor="middle">'+S(txt)+'</text>'+(sub?'<text x="'+(x+w/2)+'" y="'+(y+45)+'" font-size="11" fill="currentColor" text-anchor="middle">'+S(sub)+'</text>':'');}
function edge(x1,y1,x2,y2,dashed){return '<path class="edge'+(dashed?' dashed':'')+'" d="M'+x1+','+y1+' L'+x2+','+y2+'"/><circle cx="'+x2+'" cy="'+y2+'" r="3.3" fill="#9d795b"/>';}
function timeline(){
const w=720,h=356, x=y=>110+(y+700)*.4;const events=[
[-550,-330,0,'Achaemenid Persia','#9d775b'],
[-500,-350,1,'Buddhist and Jain traditions','#697e69'],
[-480,-400,2,'Confucian teaching','#967878'],
[30,630,3,'Christian communities','#827c98'],
[224,651,0,'Sasanian rule','#aa8871'],
[550,622,4,'Late-antique Arabia','#8a7761'],
[610,632,5,'Prophetic mission','#3f756b']];
const labels=['Near East','South Asia','East Asia','Mediterranean','Arabia','Sīrah'];let body='<g stroke="#c4bdb3" stroke-width=".7">';
for(let i=0;i<=7;i++){const year=-700+i*200;body+='<line x1="'+x(year)+'" y1="34" x2="'+x(year)+'" y2="316"/><text x="'+x(year)+'" y="23" font-size="10" fill="currentColor" text-anchor="middle">'+(year<0?Math.abs(year)+' BCE':year+' CE')+'</text>';}
body+='</g>';labels.forEach((v,i)=>{body+='<text x="7" y="'+(62+i*46)+'" font-size="12" fill="currentColor">'+S(v)+'</text><line x1="110" y1="'+(66+i*46)+'" x2="689" y2="'+(66+i*46)+'" stroke="#d1c5b8"/>';});
events.forEach(e=>{let[a,b,row,label,col]=e;let y=50+row*46;body+='<rect x="'+x(a)+'" y="'+y+'" width="'+Math.max(x(b)-x(a),4)+'" height="16" rx="5" fill="'+col+'"><title>'+S(label)+' · '+a+'–'+b+'</title></rect>'; if(x(b)-x(a)>70)body+='<text x="'+(x(a)+5)+'" y="'+(y+12)+'" font-size="10" fill="#fff">'+S(label)+'</text>';});
return svg('World settings before and during the Prophetic mission','Parallel, selectively represented historical developments; spans are illustrative and not evidence of common causes.',body,w,h);}
function map(){
const x=lon=>55+(lon-30)/25*605, y=lat=>370-(lat-9)/27*320;
const points=[['Makkah',21.4225,39.8262,15,-9],['Madinah',24.467,39.60,13,-6],['Badr',23.78,38.78,-40,6],['Khaybar',25.69,39.29,12,-8],['Ṭāʾif',21.27,40.42,12,15],['Aksum',14.13,38.72,-38,-8],['Sanaʿa',15.37,44.19,12,1],['Jerusalem',31.77,35.23,8,14],['Damascus',33.51,36.29,9,-7]];
let s=''; for(let lo=30;lo<=55;lo+=5)s+='<line x1="'+x(lo)+'" x2="'+x(lo)+'" y1="35" y2="370" stroke="#d0c8bb" stroke-dasharray="3 5"/><text x="'+x(lo)+'" y="390" text-anchor="middle" fill="currentColor" font-size="10">'+lo+'°E</text>';
for(let la=10;la<=35;la+=5)s+='<line x1="55" x2="660" y1="'+y(la)+'" y2="'+y(la)+'" stroke="#d0c8bb" stroke-dasharray="3 5"/><text x="7" y="'+(y(la)+3)+'" fill="currentColor" font-size="10">'+la+'°N</text>';
const water=[[32.6,30],[35,27.7],[36.2,24],[37.4,20],[39.2,16.8],[42.5,12.8]];s+='<polyline points="'+water.map(p=>x(p[0])+','+y(p[1])).join(' ')+'" stroke="#719ba5" stroke-width="16" stroke-linecap="round" fill="none" opacity=".19"/><text x="'+x(36.2)+'" y="'+y(20)+'" fill="#4d8190" font-size="11">Red Sea</text>';
s+='<path d="M'+x(39.8)+' '+y(21.42)+' L'+x(39.6)+' '+y(24.46)+'" stroke="#9c6848" stroke-width="2" stroke-dasharray="5 5" fill="none"/>';
points.forEach(([name,lat,lon,dx,dy])=>{let X=x(lon),Y=y(lat);s+='<circle cx="'+X+'" cy="'+Y+'" r="4.8" fill="#406e63" stroke="#fff" stroke-width="1.5"><title>'+name+' · '+lat+'° N, '+lon+'° E (approx.)</title></circle><text x="'+(X+dx)+'" y="'+(Y+dy)+'" font-size="11" fill="currentColor">'+S(name)+'</text>';});
return svg('Arabia and its wider setting','Indicative geographic locations on a longitude–latitude grid. Dotted line connects cities, not a reconstructed Hijrah route.',s,720,410);}
function community(){
let s=rect(18,28,198,70,'Meccan believers','Recitation and protection')+rect(261,28,198,70,'Pledges at ʿAqabah','Alliance and invitation')+rect(504,28,198,70,'Madinan community','Worship and shared order');
s+=edge(216,63,261,63)+edge(459,63,504,63);
s+=rect(53,174,186,75,'Emigrants','Need support and safety')+rect(267,174,186,75,'Yathrib’s households','Farms, duties and alliances')+rect(481,174,186,75,'Written obligations','Compensation and defence');
s+=edge(603,98,603,174)+edge(239,212,267,212)+edge(453,212,481,212);
s+='<text x="360" y="305" font-size="12" text-anchor="middle" fill="currentColor">The agreements coordinate specified existing duties; they do not erase all clan distinctions.</text>';
return svg('From Meccan fellowship to Madinan public obligations','Religious commitment, existing tribal obligations, and negotiated collective responsibilities are related but not identical.',s,720,332);}
function law(){
let s=rect(16,30,203,78,'Teaching in communities','Reports and legal practice')+rect(259,30,203,78,'Students and recensions','Variation and comparison')+rect(502,30,203,78,'Juristic manuals','Rules and reasoning')+edge(219,69,259,69)+edge(462,69,502,69);
s+=rect(82,205,250,71,'Disputes and changing cases','Courts, families and commerce')+rect(406,205,250,71,'Schools and institutions','Scholars, texts, endowments');
s+=edge(605,108,535,205)+edge(406,240,332,240,true)+edge(198,205,132,108,true);
s+='<text x="360" y="319" text-anchor="middle" font-size="11" fill="currentColor">Feedback: new cases stimulate interpretation; later institutions transmit and scrutinize earlier teaching.</text>';
return svg('How legal learning was transmitted and organized','Schematic rather than one compulsory chronological sequence for all law schools.',s,720,341);}
function spiritual(){
let s=rect(13,90,150,77,'Revelation / instruction','Received and understood')+rect(195,90,150,77,'Practices','Prayer and conduct')+rect(377,90,150,77,'Stable dispositions','Sincerity and virtue')+rect(559,90,150,77,'Iḥsān','Worship and realization');
s+=edge(163,128,195,128)+edge(345,128,377,128)+edge(527,128,559,128);
s+='<text x="355" y="46" text-anchor="middle" font-size="14" fill="currentColor">An analytical model of formation, not a dated historical chain</text>';
s+='<path class="edge dashed" d="M640 170 C642 248,95 248,85 170" /><text x="365" y="268" text-anchor="middle" font-size="11" fill="currentColor">Continuing renewal: teaching, correction, remembrance, repentance</text>';
return svg('Spiritual and moral formation','Interpretive synthesis from Islamic ethical and spiritual traditions, not an exact taxonomy spoken by the first generation.',s,720,292);}
function monsoon(){
const x=lon=>60+(lon-30)/80*605, y=lat=>380-(lat+12)/41*330;
let s='';for(let lo=30;lo<=110;lo+=10)s+='<line x1="'+x(lo)+'" x2="'+x(lo)+'" y1="35" y2="380" stroke="#d5cbbd" stroke-dasharray="3 5"/><text x="'+x(lo)+'" y="398" font-size="10" text-anchor="middle" fill="currentColor">'+lo+'° E</text>';for(let la=-10;la<=25;la+=10)s+='<line x1="60" x2="665" y1="'+y(la)+'" y2="'+y(la)+'" stroke="#d5cbbd" stroke-dasharray="3 5"/><text x="5" y="'+(y(la)+3)+'" font-size="10" fill="currentColor">'+la+'°</text>';
const p=[['Aden',12.8,45.03,-18,-12],['Kilwa',-8.96,39.52,10,-10],['Muscat',23.58,58.4,10,-9],['Gujarat',22.3,72.6,-20,-11],['Malabar',11.25,75.78,9,8],['Melaka',2.19,102.25,-35,-10],['Pasai',5.2,97.15,-35,-11]];
const data=Object.fromEntries(p.map(z=>[z[0],[x(z[2]),y(z[1])]])); [['Aden','Kilwa'],['Aden','Muscat'],['Muscat','Gujarat'],['Gujarat','Malabar'],['Malabar','Melaka'],['Melaka','Pasai']].forEach(([a,b])=>{const u=data[a],v=data[b];s+='<path d="M'+u[0]+' '+u[1]+' L'+v[0]+' '+v[1]+'" stroke="#a77b55" stroke-width="2" stroke-dasharray="6 5" fill="none"/>';});
p.forEach(([n,lat,lon,dx,dy])=>{let X=x(lon),Y=y(lat);s+='<circle cx="'+X+'" cy="'+Y+'" r="5" fill="#39695c" stroke="white" stroke-width="1.5"><title>'+n+' · indicative city or region</title></circle><text x="'+(X+dx)+'" y="'+(Y+dy)+'" font-size="11" fill="currentColor">'+S(n)+'</text>';});
return svg('Nodes across the Indian Ocean and Malay world','Schematic network associations, not independently verified individual vessel itineraries, seasonal legs, or an assertion of uniform conversion.',s,720,424);}
function authority(){
let s=rect(244,18,232,75,'Prophetic authority','Revelation, teaching and judgment');
s+=rect(8,173,216,77,'Government','Caliphs, rulers and officials')+rect(252,173,216,77,'Transmission and law','Scholars, students, judges')+rect(496,173,216,77,'Spiritual instruction','Teachers and practitioners');
s+=edge(290,93,116,173)+edge(360,93,360,173)+edge(429,93,604,173);
s+='<text x="360" y="294" text-anchor="middle" font-size="12" fill="currentColor">Different Sunni and Shiʿi accounts assign and relate these authorities differently.</text>';
return svg('Forms of authority after the Prophet','Schematic analytic distinction; the traditions disagree over succession and authoritative interpretation.',s,720,317);}
const content={
timeline:{title:'World chronology',caption:'Parallel historical developments are not evidence of one common cause. Dates are indicative and some traditions have disputed chronologies.',make:timeline},
arabia:{title:'The Arabian setting',caption:'Approximate location points and schematic coastal cue; connecting line is not a reconstruction of the Hijrah itinerary.',make:map},
community:{title:'The formation of Madinah',caption:'Distinguishes older duties from collective obligations established through agreements and practice.',make:community},
authority:{title:'Authority and inheritance',caption:'The forms are analytical distinctions; Sunni and Shiʿi traditions relate them differently.',make:authority},
law:{title:'The transmission of legal knowledge',caption:'Actual paths varied among schools, recensions and regional institutions.',make:law},
spiritual:{title:'The formation of character',caption:'An interpretive synthesis informed by later ethical and spiritual authors, not a claim of direct first-century terminological continuity.',make:spiritual},
monsoon:{title:'Indian Ocean networks',caption:'Coordinate-based locations, with schematic links representing connected regions rather than specific voyages.',make:monsoon}
};
window.SeerahFigures={meta:Object.fromEntries(Object.entries(content).map(([k,v])=>[k,{title:v.title,caption:v.caption}])),render:(id)=>{const v=content[id];if(!v)return '<p>Diagram unavailable.</p>';return '<div class="figure-visual"><h3>'+S(v.title)+'</h3>'+v.make()+'<p class="caption">'+S(v.caption)+'</p></div>';},mount:(root=document)=>{root.querySelectorAll('[data-figure]').forEach(el=>{const id=el.getAttribute('data-figure');el.innerHTML=window.SeerahFigures.render(id);});}};
document.addEventListener('DOMContentLoaded',()=>window.SeerahFigures.mount());
})();