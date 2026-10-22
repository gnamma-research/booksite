'use strict';
/* Published-English N-note alignment: source integrity + actual DOM browser UX.
 * Run: node daruri/qa/verify-english-publisher-notes.cjs
 * Requires playwright; Chromium and WebKit via CI. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const read=name=>fs.readFileSync(path.resolve(ROOT,'daruri',name),'utf8');
const alignment=JSON.parse(read('qa/ENGLISH_NOTE_ALIGNMENT.json'));
const book=require('./load-book.js')(read('index.html'));
const placements=new Map(book.sections.flatMap(s=>(s.noteIds||[])
  .filter(id=>/^N\d{3}$/.test(id)).map(id=>[id,String(s.id)])));
const ids=new Set(alignment.english_phrase_anchors.map(x=>x.note_id));
const nNotes=book.notes.filter(n=>/^N\d{3}$/.test(n.id));
assert.equal(nNotes.length,122,'Every N-series note is indexed');
assert.equal(alignment.english_phrase_anchors.length,133);
assert.equal(ids.size,118);
assert.equal(alignment.fallback_notes.length,4);
for(const row of alignment.english_phrase_anchors){
  const sec=book.sections.find(s=>String(s.id)===row.section);
  assert(sec, 'Section exists for '+row.note_id);
  assert.equal(placements.get(row.note_id),row.section, 'Note placement '+row.note_id);
  const text=sec.segments[row.segment]?.en;
  assert(text,'Segment exists for '+row.note_id);
  assert.equal(text.split(row.english).length-1,1,'Unique English phrase for '+row.note_id);
}
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.json':'application/json','.css':'text/css; charset=utf-8',
  '.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
  let pathname;
  try{pathname=decodeURIComponent((req.url||'/').split('?')[0]);}
  catch(_){res.writeHead(400);res.end();return;}
  const full=path.resolve(ROOT,'.'+pathname);
  if(!full.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
  const file=fs.existsSync(full)&&fs.statSync(full).isDirectory()?path.join(full,'index.html'):full;
  if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function exercise(engine,engineName,base){
 const browser=await engine.launch({headless:true,...(engineName==='chromium'?{args:['--no-sandbox']}:{})});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,
   reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(()=>{
   localStorage.setItem('daruri-reader-v2',JSON.stringify({n:'1',lang:'english',vowels:false,focusMode:false,showNotes:true}));
 });
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
   await page.goto(base+'/daruri/#section=1',{waitUntil:'domcontentloaded'});
   await page.locator('#reader .passage-en .gn-note-en-range').first().waitFor({timeout:25000});
   assert.equal(await page.locator('#reader .passage-ar').first().isVisible(),false,'Arabic hidden in English-only mode');
   const counts=await page.evaluate(()=>window.GnammaEnglishNoteQA);
   assert.deepEqual(counts,{mapped:133,notes:118},'Alignment index is available');
   const n1=page.locator('#reader .gn-note-en-range').first();
   assert.equal(await n1.getAttribute('role'),'button','English text is keyboard-accessible');
   await n1.click();
   await page.locator('#infoOverlay:not([hidden])').waitFor();
   assert.match(await page.locator('#detailTitle').innerText(),/N001.*§1/);
   assert.match(await page.locator('#detailContent .gn-note-en-scope').innerText(),/after praising God/);
   await page.locator('#detailContent [data-close-reference]').click();
   await page.locator('#infoOverlay[hidden]').waitFor();
   await page.goto(base+'/daruri/#section=2',{waitUntil:'domcontentloaded'});
   await page.locator('.gn-note-en-range').first().waitFor();
   await page.locator('.gn-note-en-ref[data-note-target="N003"]').click();
   await page.locator('#infoOverlay:not([hidden])').waitFor();
   assert.match(await page.locator('#detailTitle').innerText(),/N003.*§2/,'Corrected publisher note section');
   await page.goto(base+'/daruri/#section=224',{waitUntil:'domcontentloaded'});
   await page.locator('.gn-note-en-range').first().waitFor();
   const overlap=page.locator('.gn-note-en-range[data-gn-en-note-ids*="N107"]').first();
   await overlap.click();
   await page.locator('.gn-note-en-choice[role="dialog"]').waitFor();
   assert.equal(await page.locator('.gn-note-en-choice button').count(),2,'Overlapping notes have a chooser');
   await page.locator('.gn-note-en-choice button').filter({hasText:'N108'}).click();
   await page.locator('#infoOverlay:not([hidden])').waitFor();
   assert.match(await page.locator('#detailTitle').innerText(),/N108.*§224/);
   await page.goto(base+'/daruri/#section=39',{waitUntil:'domcontentloaded'});
   await page.locator('.gn-note-en-section-list').waitFor();
   const fallback=page.locator('.gn-note-en-section-ref[data-note-target="N017"]');
   assert.equal(await fallback.count(),1,'Genuinely section-scoped note not mislabelled as a phrase');
   await fallback.click();
   await page.locator('#infoOverlay:not([hidden])').waitFor();
   assert.match(await page.locator('#detailTitle').innerText(),/N017.*§39/);
   await page.goto(base+'/daruri/#section=11',{waitUntil:'domcontentloaded'});
   await page.locator('.gn-note-en-range').first().waitFor();
   assert.equal(await page.locator('.gn-note-en-range button,.gn-note-en-range a').count(),0,
     'Dictionary links are not nested inside note buttons');
   assert.ok(await page.locator('#reader .passage-en .inline-term').count()>0,'Dictionary terms retained');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert(overflow<=4, 'No new mobile horizontal overflow: '+overflow);
   assert.deepEqual(errors.filter(x=>/note|GnammaEnglish|Range|cannot read/i.test(x)),[],
     'No note runtime exceptions: '+errors.join('; '));
   console.log('PASS '+engineName+': English-only, precise notes, metadata repair, overlap chooser, section fallback, dictionary and mobile layout.');
 }finally{await context.close();await browser.close();}
}
server.listen(0,'127.0.0.1',async()=>{
 const origin='http://127.0.0.1:'+server.address().port;
 try{await exercise(chromium,'chromium',origin);await exercise(webkit,'webkit',origin);}
 catch(e){console.error(e.stack);process.exitCode=1;}
 finally{server.close();}
});
