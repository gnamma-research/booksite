'use strict';
/* Real browser Reading Desk regression. No personal data leaves localhost.
 * Chromium models Android-style touch; Linux WebKit approximates iPhone Safari.
 * Native iOS menus, keyboard, VoiceOver and physical printing remain separate QA.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const {chromium, webkit} = require('playwright');

const ROOT = path.resolve(__dirname, '../..');
const HOST = 'http://127.0.0.1:8879';
const ART = path.join(ROOT, 'daruri/qa/reading-desk-browser-artifacts');
fs.mkdirSync(ART, {recursive:true});
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const created = Date.UTC(2026, 9, 21, 7, 30);
const endMark = 'COMPLETE END OF NOTE — محفوظ';
const items = [
  {id:'attached',kind:'note',target:{kind:'paragraph',section:'1',segment:0,lang:'en'},
   title:'Attached study observation',body:'Private research note. <script>do not execute</script>',
   created,updated:created,modified:0,dateSource:'recorded',deleted:0},
  {id:'archived',kind:'note',target:{kind:'paragraph',section:'999',segment:0,lang:'en'},
   title:'Archived observation',body:'Beginning '+('x'.repeat(35000))+endMark,
   created,updated:created,modified:0,dateSource:'recorded',deleted:0,
   extra:{legacyField:'must remain'}},
  {id:'saved-section',kind:'section',target:{kind:'section',section:'1'},
   title:'First section bookmark',body:'',created,updated:created,modified:0,dateSource:'recorded',deleted:0},
  {id:'legacy',kind:'note',target:null,standalone:true,title:'Undated historical note',
   body:'Previous date was not recorded',created:0,updated:created,modified:0,
   dateSource:'legacy-unknown',deleted:0},
  {id:'future',kind:'new-future-kind',target:{kind:'unrecognized-anchor',ref:'future'},
   title:'Future format entry',body:'Opaque metadata must survive',created,updated:created,
   dateSource:'recorded',deleted:0,opaque:{schema:7}}
];
const check = (condition, message) => assert.ok(condition, message);

async function exercise(engine, width, touch) {
  const browser = await engine.launch({headless:true, ...(engine === chromium ? {args:['--no-sandbox']} : {})});
  const context = await browser.newContext({
    viewport:{width, height:844},isMobile:touch,hasTouch:touch,
    deviceScaleFactor:touch?2:1,acceptDownloads:true,reducedMotion:'reduce'
  });
  await context.addInitScript(({saved}) => {
    if (!localStorage.getItem('gnamma-reading-desk-v1')) {
      localStorage.setItem('gnamma-reading-desk-v1',JSON.stringify({
        format:'gnamma-reading-desk',version:1,releaseQA:{preserve:true},items:saved
      }));
    }
  }, {saved:items});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error.message)));
  const id = (engine===webkit?'webkit':'chromium')+'-'+width;
  try {
    await page.goto(HOST+'/daruri/#bookmarks',{waitUntil:'domcontentloaded',timeout:90000});
    await page.locator('.gn-rd-page').waitFor({timeout:90000});
    check(await page.locator('.gn-rd-card-open').count()===5,
      id+': lost a saved item during initialization');
    check(await page.locator('.gn-rd-unresolved-status').count()>=1,
      id+': archival source warning missing');
    const opened = page.locator('.gn-rd-card-open[data-id="archived"]');
    await opened.click();
    if(touch){
      await page.locator('.gn-rd-mobile-detail-open').waitFor();
      check(!(await page.locator('#gn-rd-cards').isVisible()),
        id+': item list remains visible beside mobile details');
      check(await page.locator('#gn-rd-detail').isVisible(),
        id+': saved item details are hidden on mobile');
      check(await page.locator('#gn-rd-detail .gn-rd-mobile-back:visible').count()===1,
        id+': mobile detail must have exactly one visible Reading Desk back control');
    } else {
      check(await page.locator('#gn-rd-cards').isVisible(),
        id+': desktop list must remain visible beside details');
      check(await page.locator('#gn-rd-detail .gn-rd-mobile-back:visible').count()===0,
        id+': mobile-only back control exposed on desktop');
    }
    check((await page.locator('#gn-rd-detail').innerText()).includes(endMark),
      id+': long imported note was clipped in real DOM');
    check((await page.locator('#gn-rd-detail').innerText()).includes('Original source unavailable'),
      id+': archival note silently treated as an ordinary source');

    await page.locator('#gn-rd-detail [data-rd="print"]').click();
    await page.locator('#gn-rd-print-root').waitFor();
    check((await page.locator('#gn-rd-print-sheet-body').innerText()).includes(endMark),
      id+': print preview truncated the saved note');
    await page.locator('#gn-rd-print-root [data-rd="close-print"]').click();
    check(await page.locator('#gn-rd-print-root').count()===0,
      id+': print preview could not close');

    await page.locator('#gn-rd-detail [data-rd="relink"]').click();
    await page.locator('#gn-rd-relink-shade').waitFor();
    check((await page.locator('#gn-rd-relink-shade').innerText()).includes('previous source reference'),
      id+': source relinking did not disclose provenance');
    await page.locator('[data-rd="relink-close"]').click();
    check(await page.locator('#gn-rd-relink-shade').count()===0,
      id+': relink Cancel failed');

    if(touch) {
      await page.locator('#gn-rd-detail [data-rd="detail-back"]').click();
      check(await page.locator('#gn-rd-cards').isVisible(),
        id+': returning from mobile detail did not restore list');
      check(!(await page.locator('#gn-rd-detail').isVisible()),
        id+': inline detail remained visible after mobile Back');
    }

    await page.locator('#gn-rd-query').fill('Undated historical');
    check(await page.locator('.gn-rd-card-open').count()===1,
      id+': searching old notes is incorrect');
    await page.locator('#gn-rd-query').fill('');

    const second = await context.newPage();
    await second.goto(HOST+'/daruri/#bookmarks',{waitUntil:'domcontentloaded',timeout:90000});
    await second.locator('.gn-rd-page').waitFor({timeout:90000});
    await page.locator('[data-rd="new-note"]').click();
    await page.locator('#gn-rd-editor-shade').waitFor();
    await page.locator('#gn-rd-note-title').fill('Browser QA new note');
    await page.locator('#gn-rd-note-body').fill('Saved in an actual '+id+' browser session');
    await page.locator('[data-rd="save-note"]').click();
    check(await page.locator('#gn-rd-editor-shade').count()===0,
      id+': save note did not close the editor');
    const stored=JSON.parse(await page.evaluate(
      () => localStorage.getItem('gnamma-reading-desk-v1')));
    check(stored.items.length===6 &&
      stored.items.some(it=>it.id==='archived' && it.body.endsWith(endMark)) &&
      stored.items.find(it=>it.id==='future')?.opaque?.schema===7 &&
      stored.releaseQA?.preserve===true,
      id+': saved a note but damaged old or future-format records');
    await second.locator('[data-rd="refresh-storage"]').waitFor({timeout:10000});
    await second.locator('[data-rd="refresh-storage"]').click();
    check(await second.locator('.gn-rd-card-open').count()===6,
      id+': other tab did not recover updated saved data');
    await second.close();

    // A same-URL page.goto can be a hash-only navigation. Reload explicitly.
    await page.reload({waitUntil:'domcontentloaded',timeout:90000});
    await page.locator('.gn-rd-page').waitFor({timeout:90000});
    const reloadCards=await page.locator('.gn-rd-card-open').count();
    const reloadStored=await page.evaluate(() => {
      try{return JSON.parse(localStorage.getItem('gnamma-reading-desk-v1')).items.map(it=>it.id);}
      catch(e){return 'unreadable '+String(e);}
    });
    console.log('RELOAD '+id+' cards='+reloadCards+' storage='+JSON.stringify(reloadStored)+
      ' route='+await page.evaluate(() => location.hash));
    check(reloadCards===6,
      id+': data did not survive a full page reload; cards='+reloadCards);
    await page.locator('.gn-rd-card-open[data-id="saved-section"]').click();
    await page.locator('#gn-rd-detail [data-rd="open"]').click();
    await page.locator('.gn-rd-return [data-rd="return"]').waitFor({timeout:25000});
    await page.locator('.gn-rd-return [data-rd="return"]').click();
    await page.locator('.gn-rd-page').waitFor({timeout:25000});
    const position = async () => page.evaluate(() => {
      const page=document.querySelector('.gn-rd-page');
      const detail=document.querySelector('.gn-rd-mobile-detail-open #gn-rd-detail');
      const bar=document.querySelector('.gn-rd-hero');
      return {scrollY, height:innerHeight, pageTop:page?.getBoundingClientRect().top,
        detailTop:detail?.getBoundingClientRect().top,
        heroTop:bar?.getBoundingClientRect().top};
    });
    const earlyPosition=await position();
    await page.waitForTimeout(600); // Allow scroll-restoration animation frames to complete.
    const settledPosition=await position();
    console.log('RETURN VIEWPORT '+id+' initial='+JSON.stringify(earlyPosition)+
      ' settled='+JSON.stringify(settledPosition));
    if(touch) {
      check(settledPosition.detailTop!==undefined &&
        settledPosition.detailTop<settledPosition.height*0.8,
        id+': selected mobile detail displaced below viewport after returning from source: '+
          JSON.stringify(settledPosition));
      check(settledPosition.pageTop<settledPosition.height*0.6,
        id+': entire Reading Desk displaced below the phone viewport: '+
          JSON.stringify(settledPosition));
    }

    const widthInfo=await page.evaluate(() => {
      const desk=document.querySelector('.gn-rd-page');
      const r=desk?.getBoundingClientRect();
      return {windowWidth:innerWidth,
        pageOverflow:document.documentElement.scrollWidth-innerWidth,
        deskOverflow:r?Math.max(0,r.right-innerWidth):null};
    });
    check(widthInfo.pageOverflow<=3 && widthInfo.deskOverflow<=3,
      id+': horizontal overflow '+JSON.stringify(widthInfo));
    if(touch) {
      await page.screenshot({path:path.join(ART,id+'.png')});
    }
    const deskErrors=errors.filter(s=>/gn-rd|GnammaReadingDesk|reading-desk/i.test(s));
    assert.deepEqual(deskErrors,[],id+': Reading Desk page errors');
    console.log('PASS '+id+': archival notes, long text, responsive list/detail, relink, print, search, edit, cross-tab, reload, source returns, layout.');
  }catch(error) {
    await page.screenshot({path:path.join(ART,id+'-FAIL.png')}).catch(()=>{});
    throw error;
  }finally {
    await context.close();await browser.close();
  }
}
async function main() {
  const server=spawn('python3',['-m','http.server','8879','--bind','127.0.0.1'],
    {cwd:ROOT,stdio:'ignore'});
  try {
    await sleep(1600);
    await exercise(chromium,1200,false);
    await exercise(chromium,390,true);
    await exercise(webkit,390,true);
  }finally {server.kill();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});