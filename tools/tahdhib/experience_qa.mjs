import {chromium} from 'playwright';
const origin=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8765/';
const browser=await chromium.launch({headless:true});
const assert=(value,message)=>{if(!value)throw Error(message)};
const routes={
  kalam:'texts/al-taftazani/tahdhib-al-kalam/edition/',
  logic:'texts/al-taftazani/tahdhib-al-mantiq/edition/'
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
 assert(await page.locator('#flow-passages .gn-flow-unit').count()===counts*2,
        'flow lost a clause or duplicates it: '+await page.locator('#flow-passages .gn-flow-unit').count());
 assert(await page.locator('#flow-passages .clause').count()===0,'flow still contains boxed clauses');
 assert(await page.locator('#flow-passages .gn-flow-section').count()>0,'flow has no sections');
 assert(await page.evaluate(() => getComputedStyle(document.querySelector('.gn-flow-section')).borderTopWidth)==='0px',
        'immersive prose should not have a clause border');
 assert(await page.locator('#flow-passages .flow-page-ref[data-flow-side="en"]').count() ===
    (kind==='kalam'?113:19),'every page or division must keep a discreet locator');
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
 await firstSpan.click();
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
