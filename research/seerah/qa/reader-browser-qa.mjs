import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chromium,webkit} from 'playwright';

const which=process.env.GNAMMA_BROWSER||'chromium';
const browserType=which==='webkit'?webkit:chromium;
const reportDir=process.env.GNAMMA_REPORT_DIR||'/tmp/seerah-browser-qa';
mkdirSync(reportDir,{recursive:true});
const browser=await browserType.launch({headless:true});
const report={date:new Date().toISOString(),browser:which,checks:[],screenshots:[],errors:[]};
const url=process.env.GNAMMA_URL||'http://127.0.0.1:8765/research/seerah/read.html';

async function run(width,height,label){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url+'#ch-13',{waitUntil:'load'});
 await page.locator('article.chapter').first().waitFor();
 assert.equal(await page.locator('article.chapter').count(),46);
 assert.equal(await page.locator('section.matn').count(),46);
 assert.equal(await page.locator('section.sharh').count(),46);
 const text=await page.locator('article#ch-13 .sharh').textContent();
 assert.ok(text.includes('crying child')||text.includes('child')||text.includes('mother'));
 const sourceCount=await page.locator('article#ch-13 a[href^="https://"]').count();
 assert.ok(sourceCount>=5,'New scholarly links missing in Chapter 13');
 await page.locator('button[data-mode="matn"]').click();
 assert.ok(await page.locator('body').evaluate(e=>e.classList.contains('mode-matn')));
 assert.equal(await page.locator('button[data-mode="matn"]').getAttribute('aria-pressed'),'true');
 await page.locator('button[data-mode="both"]').click();
 assert.ok(!await page.locator('body').evaluate(e=>e.classList.contains('mode-matn')));
 assert.equal(await page.locator('button[data-mode="both"]').getAttribute('aria-pressed'),'true');
 await page.locator('#figure-toggle').click();
 assert.ok(await page.locator('body').evaluate(e=>e.classList.contains('hide-figures')));
 await page.locator('#figure-toggle').click();
 assert.ok(!await page.locator('body').evaluate(e=>e.classList.contains('hide-figures')));
 const bookmark=page.locator('[data-bookmark="ch-13"]').first();
 await bookmark.click();
 assert.equal(await bookmark.getAttribute('aria-pressed'),'true');
 await page.locator('#nav-toggle').click();
 assert.equal(await page.locator('#nav-toggle').getAttribute('aria-expanded'),'true');
 const search=page.locator('#chapter-search');
 await search.fill('Khadījah');
 assert.ok((await page.locator('[data-chapter-link]:visible').count())>=1);
 await search.fill('');
 await page.locator('#nav-close').click();
 assert.equal(await page.locator('#nav-toggle').getAttribute('aria-expanded'),'false');
 await page.goto(url+'#ch-44',{waitUntil:'load'});
 const anchor=page.locator('#ch-44');
 assert.ok(await anchor.count()===1);
 assert.ok((await anchor.textContent()).includes('Privy Council'));
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 report.checks.push({viewport:label,width,height,chapters:46,sourceLinksChapter13:sourceCount,bookmarks:true,nav:true,modes:true,figures:true,deepLink44:true,overflow});
 if(width<=390)assert.ok(overflow<=40,'Mobile horizontal overflow: '+overflow+'px');
 const screen=reportDir+'/seerah-'+which+'-'+label+'.png';
 await page.screenshot({path:screen,fullPage:false});
 report.screenshots.push(screen);
 report.errors.push(...errors);
 await context.close();
}
try{
 await run(390,844,'mobile');
 await run(1280,800,'desktop');
 assert.equal(report.errors.length,0,'Uncaught browser page errors: '+report.errors.join(' | '));
 const atlas=await browser.newPage();
 await atlas.goto(url.replace('read.html','atlas.html'),{waitUntil:'load'});
 for(const id of ['timeline','arabia','community','authority','law','spiritual','monsoon'])assert.equal(await atlas.locator('#figure-'+id).count(),1);
 await atlas.goto(url.replace('read.html','dossiers.html'),{waitUntil:'load'});
 for(let i=1;i<=9;i++)assert.equal(await atlas.locator('#dossier-'+i).count(),1);
 await atlas.close();
 report.status='PASS';
}catch(e){report.status='FAIL';report.errors.push(String(e));}
finally{
 writeFileSync(reportDir+'/report.json',JSON.stringify(report,null,2));
 await browser.close();
}
if(report.status!=='PASS'){console.error(report);process.exit(1);}
console.log('PASS Sīrah 1.6 '+which+' mobile/desktop reading modes, navigation, search, bookmarks, figures, source links, deep link and atlas/dossiers');
