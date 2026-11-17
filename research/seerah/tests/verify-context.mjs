import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const people=JSON.parse(read('data/people.json'));
const subjects=JSON.parse(read('data/subjects.json'));
const places=JSON.parse(read('data/places.json'));
const chron=JSON.parse(read('data/chronology.json'));
const reader=read('read.html'),landing=read('index.html'),peopleHTML=read('people.html'),geoHTML=read('geography.html'),chronHTML=read('chronology.html');
assert.equal(people.entries.length,90);
assert.equal(people.groups.length,5);
assert.equal(subjects.entries.length,49);
assert.equal(subjects.groups.length,5);
assert.equal(places.entries.length,26);
assert.equal(chron.events.length,42);
assert.equal(chron.eras.length,3);
assert.equal((reader.match(/<article class="chapter"/g)||[]).length,46);
const knownPeople=new Set(people.entries.map(p=>p.id));
let personRefs=0,subjectRefs=0;
for(const p of people.entries){
 assert.ok(p.id&&p.name&&p.role&&p.bio.length>30,'Incomplete profile '+p.id);
 assert.ok(people.groups.some(g=>g.id===p.group),'Unknown group '+p.id);
 for(const related of p.relations)assert.ok(knownPeople.has(related),'Missing relationship '+p.id+' '+related);
 for(const a of p.appearances){
  assert.ok(reader.includes('id="'+a.anchor+'"'),'Person anchor missing '+p.id+' '+a.anchor);
  assert.ok(a.chapter>=1&&a.chapter<=46);
  assert.ok(['matn','sharh'].includes(a.layer));
  personRefs++;
 }
}
const idset=new Set(subjects.entries.map(x=>x.id));
assert.equal(idset.size,subjects.entries.length);
for(const term of subjects.entries){
 assert.ok(term.meaning&&term.meaning.length>18,'Incomplete subject '+term.id);
 assert.ok(subjects.groups.some(g=>g.id===term.group),'Unknown subject group '+term.id);
 for(const a of term.appearances){
  assert.ok(reader.includes('id="'+a.anchor+'"'),'Subject anchor missing '+term.id+' '+a.anchor);
  subjectRefs++;
 }
}
assert.ok(personRefs>=200);
assert.ok(subjectRefs>=300);
const placesGroup=new Set(places.groups.map(x=>x.id));
for(const p of places.entries){
 assert.ok(p.lat>=-90&&p.lat<=90&&p.lng>=-180&&p.lng<=180,'Coordinates out of range '+p.id);
 assert.ok(p.country&&p.precision&&p.context&&p.chapters.length,'Geographical metadata missing '+p.id);
 assert.ok(p.groups.every(g=>placesGroup.has(g)),'Unknown region '+p.id);
 assert.ok(p.chapters.every(ch=>ch>=1&&ch<=46));
}
for(const e of chron.events){
 const domain=chron.visualization.domains[e.era];
 assert.ok(domain&&Number.isFinite(e.plotYear),'Not plotted '+e.id);
 assert.ok(e.plotYear>=domain[0]&&e.plotYear<=domain[1],'Outside scale '+e.id);
 if(e.plotEndYear!==undefined)assert.ok(e.plotEndYear>=e.plotYear&&e.plotEndYear<=domain[1],'Invalid range '+e.id);
 assert.ok(e.date&&e.title&&e.description,'Incomplete event '+e.id);
}
for(const file of ['people.html','geography.html','chronology.html','subjects.html'])assert.ok(landing.includes('href="'+file+'"'),'Landing missing '+file);
for(const file of ['people.html','geography.html','chronology.html','subjects.html'])assert.ok(read(file).includes('assets/companion-return.js'),'No return navigation '+file);
assert.ok(read('assets/reader-context.js').includes('addChapterCast(data)'));
assert.ok(read('assets/reader-context.js').includes('then(addChapterPlaces)'));
assert.ok(read('assets/geography.js').includes("url.searchParams.get('place')"));
assert.ok(read('assets/context.css').includes('.chapter-cast'));
assert.ok(peopleHTML.includes('id="person-search"'));
assert.ok(geoHTML.includes('leaflet@1.9.4')&&read('assets/geography.js').includes('https://tile.openstreetmap.org/{z}/{x}/{y}.png'),'Real map tiles not configured');
assert.ok(geoHTML.includes('openstreetmap.org/copyright'),'OSM copyright attribution missing');
assert.ok(chronHTML.includes('id="chrono-chart"')&&read('assets/chronology.js').includes('linear calendar-year scale'),'Proportional timeline absent');
console.log('PASS Sīrah context: 90 profiles / five circles, '+personRefs+' person anchors, 49 subjects / '+subjectRefs+' references, 26 real-map places and 42 linear-scale dated events');
