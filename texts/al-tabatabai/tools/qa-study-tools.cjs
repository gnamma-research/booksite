/* End-to-end semantic destinations and reading workflows, in two browser engines. */
'use strict';
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const base=process.env.HIKMA_QA_BASE||'http://127.0.0.1:8767/texts/al-tabatabai/';
const out=process.env.HIKMA_QA_OUTPUT||'hikma-qa-artifacts';fs.mkdirSync(out,{recursive:true});
const index=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/study-index.json'),'utf8'));
let checks=0;
async function check(label,fn){await fn();checks++;console.log('PASS '+label);}
async function ready(p){await p.locator('#study-dock').waitFor({state:'attached',timeout:45000});}
async function close(p,id){await p.locator(id+' .dialog-heading button').click();}
async function main(type){const browser=await type.launch({headless:true});try{
 const context=await browser.newContext({viewport:{width:1365,height:900},reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'#passage-M-P-04',{waitUntil:'domcontentloaded'});await ready(page);
 await check(type.name()+' exact semantic link and return',async()=>{
   const connection=index.links.find(l=>l.from.unit==='M-P-04'&&l.to.unit==='B-XI-01');assert.ok(connection);
   await page.locator('#passage-M-P-04 .cross-text-links summary').click();
   await page.locator('[data-link="'+connection.id+'"] a').click();
   await page.locator('#'+connection.to.paragraph).waitFor({state:'visible'});
   assert.equal(new URL(page.url()).hash,'#'+connection.to.paragraph);
   assert.ok((await page.locator('#'+connection.to.paragraph).textContent()).includes(connection.to.quote.replace(/\*\*/g,'').replace(/\*/g,'')));
   assert.match(await page.locator('#study-dock-location').textContent(),/Bidāya/);
   await page.locator('#study-return a').click();
   await page.locator('#passage-M-P-04').waitFor({state:'attached'});
   assert.match(page.url(),/M-P-04/);
 });
 await check(type.name()+' dictionary shows all books and correct mental-existence chapter',async()=>{
   await page.locator('#glossary-open').click();await page.locator('#study-dictionary-search').fill('Mental existence');
   const sense=page.locator('[data-term="mental-existence"]');await sense.locator('.dictionary-book').first().waitFor({state:'attached',timeout:30000});
   assert.equal(await sense.locator('.dictionary-book').count(),3);
   const formattedQuote=sense.locator('.dictionary-hit').filter({has:page.locator('a[href*="M-C-10"]')}).locator('blockquote');
   assert.ok(await formattedQuote.locator('strong').count()>0,'Reviewed quote emphasis must render as formatted text');
   assert.doesNotMatch(await formattedQuote.textContent(),/\*\*/);
   const n=sense.locator('.dictionary-book[data-book="N"]');assert.ok((await n.textContent()).includes('Nihāyat'));
   const hit=n.locator('a[href*="N-III-01"]').first();assert.ok(await hit.count());
   assert.match(await n.textContent(),/Automatic phrase matches|word occurrence/);
   await page.screenshot({path:path.join(out,type.name()+'-dictionary-all-books.png'),fullPage:false});
   await hit.click();assert.match(page.url(),/N-III-01/);assert.doesNotMatch(page.url(),/N-I-02/);
 });
 await check(type.name()+' sense distinction: circular definition versus causal circularity',async()=>{
   await page.locator('#glossary-open').click();await page.locator('#study-dictionary-search').fill('circular');
   assert.ok(await page.locator('.dictionary-sense').filter({hasText:'Causal circularity'}).count());
   assert.ok(await page.locator('.dictionary-sense').filter({hasText:/circularity/i}).count()>=2);
   await close(page,'#study-dictionary');
 });
 await check(type.name()+' original versus editorial contents and six Muzaffar books',async()=>{
   await page.locator('.study-nav').getByRole('button',{name:'Contents',exact:true}).click();
   await page.locator('#study-contents-book').selectOption('M');
   assert.equal(await page.locator('#study-contents-list .study-contents-part').count(),7);
   assert.match(await page.locator('#study-contents-list').textContent(),/not yet available|not yet translated|Translation not yet/);
   await page.locator('#study-contents-mode').selectOption('editorial');
   assert.ok((await page.locator('#study-contents-list .study-passage-link').count())>=101);
   await close(page,'#study-contents');
   assert.doesNotMatch(await page.locator('#toc').textContent(),/IntroductionIntroduction|Stage L:|Stage K:|Stage C:/);
 });
 await check(type.name()+' display persistence, six palettes and protected complement signs',async()=>{
   await page.goto(base+'muzaffar-al-mantiq/#passage-M-C-44');await ready(page);
   await page.locator('#study-display-open').click();
   assert.equal(await page.locator('#study-palette option').count(),6);
   await page.locator('#study-theme').selectOption('dark');await page.locator('#study-palette').selectOption('nasrid');
   await page.locator('#study-vowels').uncheck();await close(page,'#study-display');
   const ar=await page.locator('#passage-M-C-44 .arabic-panel .text-body').textContent();assert.ok(ar.includes('بَ'),'Complement mark must remain');assert.ok(ar.includes('حَ'),'C-complement mark must remain');
   await page.reload();await ready(page);assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');assert.equal(await page.locator('html').getAttribute('data-palette'),'nasrid');
   await page.screenshot({path:path.join(out,type.name()+'-display-dark.png'),fullPage:false});
 });
 await check(type.name()+' shared desk across individual and combined readers',async()=>{
   await page.locator('#passage-M-C-44 [data-bookmark]').click();await page.locator('#passage-M-C-44 [data-note]').click();
   await page.locator('#note-text').fill('Private cross-reader continuity check');await page.locator('#note-form button[type="submit"]').click();
   await page.goto(base+'#passage-M-C-44');await ready(page);
   assert.equal(await page.locator('#passage-M-C-44 [data-bookmark]').getAttribute('aria-pressed'),'true');
   await page.locator('.study-nav').getByRole('button',{name:'Reading Desk',exact:true}).click();
   assert.match(await page.locator('#study-desk-list').textContent(),/Private cross-reader continuity check/);
   const other=await context.newPage();
   try{
     await other.goto(base+'muzaffar-al-mantiq/#passage-M-C-44');await ready(other);
     await other.locator('#passage-M-C-44 [data-note]').click();
     await other.locator('#note-text').fill('Private cross-reader continuity check — updated in another tab');
     await other.locator('#note-form button[type="submit"]').click();
     await page.locator('#study-desk-list').getByText('Private cross-reader continuity check — updated in another tab',{exact:true}).waitFor({state:'visible'});
   }finally{await other.close();}
   await close(page,'#study-desk');
 });
 await check(type.name()+' paragraph copy has citation and opt-in personal note',async()=>{
   await page.locator('#passage-M-C-44 .english-panel .paragraph-action').first().click();
   const preview=await page.locator('#study-copy-preview').inputValue();assert.ok(preview.length>50);assert.match(preview,/para-M-C-44-en-/);assert.ok(!preview.includes('Private cross-reader'));
   await page.locator('#study-copy-notes').check();assert.match(await page.locator('#study-copy-preview').inputValue(),/Private cross-reader continuity check/);
   await close(page,'#study-copy-dialog');
 });
 await check(type.name()+' focus and continuous retain the selected location',async()=>{
   try {
     await page.waitForFunction(()=>window.HikmaReader.currentUnit()?.id==='M-C-44');
   } catch (error) {
     console.log('Reading location diagnostic '+JSON.stringify(await page.evaluate(()=>({
       current:window.HikmaReader.currentUnit()?.id,hash:location.hash,scrollY,
       view:document.getElementById('reading-view').value,
       toolbarBottom:document.getElementById('reading-toolbar').getBoundingClientRect().bottom,
       scrollPadding:getComputedStyle(document.documentElement).scrollPaddingTop,
       focused:document.activeElement?.outerHTML.slice(0,250),
       passages:['M-C-43','M-C-44','M-C-45'].map(id=>{const p=document.getElementById('passage-'+id),r=p?.getBoundingClientRect();return {id,top:r?.top,bottom:r?.bottom,margin:p&&getComputedStyle(p).scrollMarginTop};})
     }))));
     await page.screenshot({path:path.join(out,type.name()+'-reading-location-failure.png'),fullPage:false});
     throw error;
   }
   await page.locator('#reading-view').selectOption('quiet');assert.equal(await page.locator('.chapter-section').count(),1);assert.ok(!(await page.locator('#contents-panel').isVisible()));
   assert.match(page.url(),/passage-M-C-44$/,'Entering Focus must preserve the paragraph action’s reading section');
   await page.locator('#study-next').click();
   await page.locator('#study-dock-location').filter({hasText:/neither particular/}).waitFor({state:'visible'});
   assert.match(page.url(),/passage-M-C-45$/,'Next must advance exactly one reading section');
   assert.match(await page.locator('#study-dock-location').textContent(),/neither particular/);
   await page.keyboard.press('/');await page.locator('#book-search').waitFor({state:'visible'});
   assert.equal(await page.locator('#book-search').evaluate(n=>n===document.activeElement),true);
   await page.keyboard.press('Escape');assert.ok(!(await page.locator('#contents-panel').isVisible()));
   assert.equal(await page.locator('#reading-view').inputValue(),'quiet');
   await page.locator('#reading-view').selectOption('continuous');assert.ok(await page.locator('.chapter-section').count()>50);
   await page.waitForFunction(()=>window.HikmaReader.currentUnit()?.id==='M-C-45');
   assert.match(page.url(),/passage-M-C-45$/,'Continuous view must preserve the selected reading section');
   assert.equal(await page.locator('#contents-panel').evaluate(n=>n.inert),false);
 });
 await check(type.name()+' index exposes conceptual routes, not raw first matches',async()=>{
   await page.locator('#study-menu-open').click();await page.locator('#study-menu').getByRole('button',{name:'Subject index',exact:true}).click();
   await page.locator('#study-index-search').fill('mental existence');assert.ok(await page.locator('#study-index-list .subject-row').count()>0);
   await page.locator('#study-index-list .subject-row button').first().click();await page.locator('[data-term="mental-existence"] .dictionary-book').first().waitFor({state:'attached'});
   await close(page,'#study-dictionary');
 });
 await check(type.name()+' stable paragraph opens directly in individual reader',async()=>{
   const link=index.links.find(l=>l.to.unit==='N-III-01');await page.goto(base+'nihayat-al-hikma/#'+link.to.paragraph);await ready(page);
   await page.locator('#'+link.to.paragraph).waitFor({state:'visible'});assert.equal(await page.locator('#'+link.to.paragraph).getAttribute('data-paragraph'),'true');
 });
 await check(type.name()+' complete Muzaffar Book V and recovered classification',async()=>{
   await page.goto(base+'#passage-M-V-05');await ready(page);
   assert.equal(Object.keys(index.units).filter(id=>id.startsWith('M-V-')).length,40);
   assert.equal(await page.locator('#passage-M-V-05 .hikma-classification').count(),2);
   assert.match(await page.locator('#passage-M-V-05 .english-panel .hikma-classification').textContent(),/Syllogism[\s\S]*Conjunctive[\s\S]*Conditional/);
   await page.screenshot({path:path.join(out,type.name()+'-classification.png'),fullPage:false});
 });
 await check(type.name()+' print range and cancellation preserve reading choices',async()=>{
   await page.goto(base+'#passage-M-V-28');await ready(page);
   await page.locator('#reading-view').selectOption('quiet');
   assert.match(page.url(),/M-V-28/,'Changing the view must retain the selected subsection within its chapter');
   await page.evaluate(()=>{
     window.print=()=>{};
     const unit=window.HikmaReader.state.byUnit.get('M-V-28');
     unit.notes=[...(unit.notes||[]),{type:'Browser test fixture',arabic:'حاشية عربية للاختبار',text:'Authorial-note translation for browser testing.'}];
   });
   const before=page.url();await page.locator('#pdf-print').click();
   await page.locator('#pdf-scope').selectOption('range');await page.locator('#pdf-from').selectOption('M-V-27');await page.locator('#pdf-to').selectOption('M-V-29');
   await page.locator('input[name="pdf-mode"][value="reading"]').check();
   await page.locator('#pdf-language').selectOption('arabic');await page.locator('#pdf-confirm').click();
   assert.equal(await page.locator('.passage:not([data-pdf-exclude])').count(),3);
   assert.equal(await page.locator('body').getAttribute('data-pdf-language'),'arabic');
   assert.equal(await page.locator('.pdf-personal-note').count(),0);
   await page.emulateMedia({media:'print'});
   const authorialNote=page.locator('#passage-M-V-28 .authorial-bilingual-note').filter({hasText:'Browser test fixture'});
   assert.ok(await authorialNote.locator('.footnote-arabic').isVisible());
   assert.ok(!(await authorialNote.locator('.footnote-english').isVisible()));
   await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
   await page.emulateMedia({media:null});
   await page.waitForFunction(()=>window.HikmaReader.currentUnit()?.id==='M-V-28');
   assert.equal(await page.locator('#reading-view').inputValue(),'quiet');assert.equal(page.url(),before);
   assert.equal(await page.locator('[data-pdf-exclude]').count(),0);
 });
 await check(type.name()+' one downloads page exposes all books and nine editions',async()=>{
   await page.locator('#study-editions-open').click();await page.locator('#library .files li').last().waitFor({state:'attached',timeout:30000});
   assert.equal(await page.locator('#library .book').count(),3);assert.equal(await page.locator('#library .files li').count(),9);
   assert.equal(await page.locator('#library a[download]').count(),9);assert.equal(await page.locator('#library .file-actions a:not([download])').count(),9);
   assert.match(await page.locator('.back').textContent(),/reading position/);await page.screenshot({path:path.join(out,type.name()+'-editions.png'),fullPage:true});
   await page.locator('.back').click();await ready(page);assert.match(page.url(),/M-V-28/);
 });
 await check(type.name()+' no uncaught errors',async()=>assert.deepEqual(errors,[]));
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));
 await phone.goto(base+'#passage-M-P-04');await ready(phone);
 await check(type.name()+' mobile reading bar and menus remain usable',async()=>{
   const dim=await phone.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(dim.scroll<=dim.w+2,JSON.stringify(dim));
   assert.ok(await phone.locator('#study-menu-open').isVisible());assert.ok(await phone.locator('#study-copy').isVisible());
   await phone.locator('#study-menu-open').click();await phone.locator('#study-menu').getByRole('button',{name:'Dictionary · معجم',exact:true}).click();
   await phone.locator('#study-dictionary-search').fill('Mental existence');await phone.locator('[data-term="mental-existence"] .dictionary-book').first().waitFor({state:'attached'});
   await phone.screenshot({path:path.join(out,type.name()+'-phone-dictionary.png'),fullPage:false});
   await close(phone,'#study-dictionary');await phone.screenshot({path:path.join(out,type.name()+'-phone-reader.png'),fullPage:false});
   const bounds=await phone.locator('#study-dock').boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=392);
   await phone.locator('#reading-view').selectOption('quiet');await phone.locator('#contents-toggle').click();
   await phone.locator('#book-search').waitFor({state:'visible'});await phone.locator('#contents-close').click();
   assert.equal(await phone.locator('#reading-view').inputValue(),'quiet');
   assert.ok(!(await phone.locator('#contents-panel').isVisible()));
 });
 assert.deepEqual(errors,[]);
 await mobile.close();await context.close();
}finally{await browser.close();}}
(async()=>{for(const type of [chromium,webkit])await main(type);console.log('All '+checks+' study-tool checks passed');})().catch(e=>{console.error(e.stack);process.exitCode=1;});
