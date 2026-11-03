import {chromium} from 'playwright';
const origin=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8765/';
const browser=await chromium.launch({headless:true});
const assert=(value,message)=>{if(!value)throw Error(message)};
const routes={
  kalam:'texts/al-taftazani/tahdhib-al-kalam/edition/?legacy-controls=1',
  logic:'texts/al-taftazani/tahdhib-al-mantiq/edition/?legacy-controls=1'
};
const failures=[];
async function check(kind,size){
 const ctx=await browser.newContext({viewport:size,reducedMotion:'reduce'});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 const url=new URL(routes[kind],origin).href;
 await page.goto(url,{waitUntil:'networkidle',timeout:60000});
 const counts=kind==='kalam'?1044:19;
 assert(await page.locator('body[data-reading-style="flow"]').count()===1,kind+' must default to flowing view');
 assert(await page.locator('#flow-passages:not([hidden])').count()===1,'flow surface missing');
 assert(await page.locator('#passages[hidden]').count()===1,'study cards should not be shown behind flowing text');
 const semantic=page.locator('#flow-passages .gn-flow-unit,#flow-passages .gn-source-heading [data-clause-id]');
 assert(await semantic.count()===counts*2,
        'flow lost a clause or duplicates it: '+await semantic.count());
 assert(await page.locator('#flow-passages .clause').count()===0,'flow still contains boxed clauses');
 assert(await page.locator('#flow-passages .gn-flow-section').count()>0,'flow has no sections');
 assert(await page.evaluate(() => getComputedStyle(document.querySelector('.gn-flow-section')).borderTopWidth)==='0px',
        'immersive prose should not have a clause border');
 assert(await page.locator('#flow-passages .flow-page-ref[data-flow-side="en"]').count() ===
    (kind==='kalam'?113:19),'every page or division must keep a discreet locator');
 // Editorial glossary: independently sourced technical aids, not authorial matn.
 assert(await page.locator('.gn-terms-button').count()===1,'terminology access is missing');
 await page.locator('.gn-terms-button').click();
 assert(await page.locator('#gn-terms-overlay:not([hidden]) .gn-terms-entry').count()>=30,'editorial glossary entries missing');
 await page.locator('#gn-terms-query').fill('necessity');
 assert(await page.locator('#gn-terms-overlay .gn-terms-entry').count()>0,'English term search not functioning');
 await page.locator('#gn-terms-query').fill('العلم');
 assert(await page.locator('#gn-terms-overlay .gn-terms-source-link').count()>0,'glossary term source link missing');
 await page.locator('.gn-terms-close').click();
 assert(await page.locator('#gn-terms-overlay[hidden]').count()===1,'glossary close failed');
 if(kind==='kalam'){
  // Study keeps both editorial continuation markers; Flow visually joins them.
  const a=await page.locator('#flow-u-KAL-015-07-ar').textContent();
  const b=await page.locator('#flow-u-KAL-016-01-ar').textContent();
  assert(!/\.\.\.\s*$/.test(a)&&!/^\s*\.\.\./.test(b),'paired source-page ellipses still disrupt flowing Arabic');
  const sa=await page.locator('#u-KAL-015-07 .arabic').textContent();
  const sb=await page.locator('#u-KAL-016-01 .arabic').textContent();
  assert(sa.includes('...')&&sb.includes('...'),'source-critical Study text lost its continuation markers');
 }
 // Bilingual source-linked thematic index is editorial and independent of the authorial headings.
 assert(await page.locator('.gn-subject-button').count()===1,'subject index button missing');
 await page.locator('.gn-subject-button').click();
 assert(await page.locator('#gn-subject-overlay:not([hidden]) .gn-subject-entry').count()>=10,'subject index topics missing');
 await page.locator('#gn-subject-query').fill(kind==='kalam'?'Imamate':'syllogism');
 assert(await page.locator('#gn-subject-overlay .gn-subject-entry').count()>0,'subject index filtering failed');
 const firstTopic=page.locator('#gn-subject-overlay .gn-subject-entry').first();
 await firstTopic.locator('summary').click();
 assert(await firstTopic.locator('.gn-subject-locator').count()>0,'subject index must link to source units');
 await page.locator('.gn-subject-close').click();
 assert(await page.locator('#gn-subject-overlay[hidden]').count()===1,'subject index did not close');
 await page.locator('[data-view="ar"]').click();
 assert(await page.locator('#flow-passages[data-view="ar"]').count()===1,'flow Arabic-only display not active');
 const first=kind==='kalam'?'u-KAL-015-04':'u-L-01';
 const source=await page.locator('#'+first+' .arabic p').textContent();
 await page.locator('[data-vowel-mode="assisted"]').click();
 const assisted=await page.locator('#flow-'+first+'-ar').textContent();
 assert(assisted!==source,kind+' assisted Arabic must actually add vowels');
 const deaccent=x=>x.normalize('NFD').replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/g,'').normalize('NFC');
 assert(deaccent(assisted)===deaccent(source),'assist must not change source letters');
 assert(await page.locator('#gn-vowelling-status:not([hidden])').count()===1,'partial voice disclaimer missing');
 const machineReady=await page.evaluate(()=>window.GnammaTahdhibExperience?.getPrefs().machineAvailable);
 assert(machineReady,'Full machine vowel overlay unavailable despite successful source-hash generation');
 await page.locator('[data-vowel-mode="machine"]').click();
 const computer=await page.locator('#flow-'+first+'-ar').textContent();
 assert(deaccent(computer)===deaccent(source),'Machine overlay changed canonical source letters');
 assert(await page.locator('body[data-vocalization="machine"]').count()===1,'Machine reading mode not enabled');
 await page.locator('[data-vowel-mode="assisted"]').click();

 await page.locator('details.gn-type-options summary').click();
 await page.locator('#gn-ar-font').selectOption('scheherazade');
 assert(await page.locator('html[data-arabic-font="scheherazade"]').count()===1,'Arabic font control failed');
 await page.locator('#gn-en-font').selectOption('sans');
 assert(await page.locator('html[data-english-font="sans"]').count()===1,'English font control failed');
 await page.locator('details.gn-type-options summary').click();
 await page.locator('[data-reader-mode="immersive"]').click();
 assert(await page.locator('body[data-reading-style="immersive"]').count()===1,'immersive style missing');
 assert(await page.locator('body[data-focus="3"]').count()===1,'immersive should remove chrome');
 assert(await page.locator('#flow-passages .clause').count()===0,'immersive still has clause boxes');
 const pref=await page.evaluate(()=>window.GnammaTahdhibExperience?.getPrefs());
 assert(pref?.mode==='immersive'&&pref?.vocalization==='assisted','prefs API or persistence incorrect');
 // Activate bilingual columns; English and Arabic stay independently switchable.
 await page.locator('[data-view="both"]').click();
 assert(await page.locator('#flow-passages[data-view="both"]').count()===1,'parallel flow unavailable');
 const firstSpan=page.locator('#flow-'+first);
 // Compatibility QA exposes the legacy toolbar; dispatch the clause action without its test-only overlay intercept.
 await firstSpan.evaluate(node=>node.click());
 assert(await page.locator('#gn-inline-toolbar:not([hidden])').count()===1,'flow citation/bookmark actions missing');
 await page.locator('#gn-inline-toolbar button').filter({hasText:'Notes & variants'}).click();
 assert(await page.locator('#gn-notes-overlay:not([hidden])').count()===1,'reading notes modal missing');
 await page.locator('#gn-note-text').fill('My scholarly reading observation.');
 await page.locator('.gn-note-editor button').click();
 assert(await page.evaluate(id=>JSON.parse(localStorage.getItem('gnamma-tahdhib-private-notes-v1-'+id))?.[id==='kalam'?'KAL-015.04':'L.01']?.body,kind)==='My scholarly reading observation.','notes not locally saved');
 assert(await page.locator('#flow-'+first+'.gn-has-note').count()===1,'saved note not marked on flowing text');
 await page.locator('[data-reader-mode="study"]').click();
 assert(await page.locator('#passages:not([hidden]) .clause').count()===counts,'study apparatus disappeared');
 assert(await page.locator('#flow-passages[hidden]').count()===1,'flow surface not hidden in study');
 assert(await page.evaluate(()=>!!window.GnammaTahdhibTrail),'Reading history controller missing');
 const current=await page.evaluate(()=>window.GnammaTahdhibReader.getState().page);
 await page.locator('#dock-next').click();
 const nextPage=await page.evaluate(()=>window.GnammaTahdhibReader.getState().page);
 assert(nextPage===current+1,'Dock navigation did not advance the reader');
 const trail=await page.evaluate(()=>window.GnammaTahdhibTrail.snapshot());
 assert(trail.back.length>0,'Back reading history was not recorded');
 await page.locator('.gn-trail-controls button[aria-label="Back to previous reading location"]').click();
 assert(await page.evaluate(()=>window.GnammaTahdhibReader.getState().page)===current,'Back reading history navigation failed');
 await page.locator('#export').click();
 await page.locator('.gn-machine-pdf').waitFor({state:'visible',timeout:15000});
 assert((await page.locator('.gn-machine-pdf').getAttribute('href')).includes('vocalization/'),'Published machine-vowelled PDF link missing');
 await page.locator('#export-close').click();

 const target=kind==='kalam'?'KAL-077.03':'L.17';
 const issue=await page.evaluate((id)=>window.GNAMMA_CRITICAL_CORPUS.open_issues.some(x=>x.ids.includes(id)),target);
 assert(issue,'textual uncertainty lost during feature migration');
 const overflow=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
 assert(overflow.scroll<=overflow.client+3,'horizontal overflow '+JSON.stringify(overflow));
 assert(!errors.length,'runtime error(s): '+errors.join(' | '));
 console.log('PASS',kind,size.width+'x'+size.height,'flow, vocalization, fonts, notes, source boundaries');
 await ctx.close();
}
try{
 for(const kind of ['kalam','logic']){
   for(const size of [{width:1440,height:900},{width:390,height:844}]){
    try{await check(kind,size)}catch(e){failures.push(kind+' '+size.width+' '+e.message)}
   }
 }
}finally{await browser.close()}
if(failures.length){failures.forEach(x=>console.error('FAIL',x));process.exit(1)}
console.log('PASS all Tahdhīb experience checks');
