const {chromium,webkit}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const root=path.resolve(process.env.BAHR_DIR||path.join(__dirname,'../site'));
const url=process.env.BAHR_URL||'http://127.0.0.1:8766/';
const out=process.env.BAHR_QA_OUTPUT||'qa-artifacts';
fs.mkdirSync(out,{recursive:true});
const ctx={};ctx.window=ctx;vm.createContext(ctx);
const load=k=>{vm.runInContext(fs.readFileSync(path.join(root,'data',k+'.js'),'utf8'),ctx);return ctx.BAHR_DATA[k];};
const catalog=load('catalog'),meta=load('edition');
const records=meta.chunks.flatMap(load);
const checks=[];
function pass(name){checks.push(name);console.log('PASS '+name);}
(async()=>{
 assert.equal(records.length,389);
 for(const f of meta.downloads){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f.path))).digest('hex'),f.sha256);}
 pass('All edition downloads retain their source hashes');
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>{errors.push(String(e));console.error('BROWSER ERROR',String(e));});
 page.on('response',r=>{if(r.url().startsWith(url)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
 const go=async route=>{await page.goto(url+'#/'+route);await page.waitForFunction(()=>!document.querySelector('.loading'));};
 const overflow=async name=>{const detail=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,items:[...document.querySelectorAll('body *')].filter(n=>{const b=n.getBoundingClientRect();return b.width&&b.right>innerWidth+1}).slice(0,12).map(n=>({tag:n.tagName,id:n.id,class:n.className,width:n.getBoundingClientRect().width,right:n.getBoundingClientRect().right}))}));if(detail.scroll>detail.width+1){console.error(name,JSON.stringify(detail));await page.screenshot({path:path.join(out,'overflow.png')});}assert(detail.scroll<=detail.width+1,name+' horizontal overflow');};
 await go('home');await page.locator('.chapter').first().waitFor();
 assert.equal(await page.locator('.chapter').count(),4);
 await page.screenshot({path:path.join(out,'home-desktop.png')});
 pass('Home has all four surahs');
 for(const r of records){
  await go('read/'+r.id);await page.locator('#unit-'+r.id).waitFor();
  const actual=await page.locator('.ar-column p').allTextContents();
  assert.deepEqual(actual,r.ar.split('\n').filter(s=>s.trim()));
  assert.equal(await page.locator('.en-column section').count(),r.segments.length);
 }
 pass('All 389 passages render with complete source Arabic and all English segments');
 await page.locator('[data-action="contents"]').last().click();
 assert.equal(await page.locator('.toc-link').count(),389);
 await page.locator('#contents-query').fill('2:255');
 assert(await page.locator('.toc-link').count()>0);
 await page.locator('#sheet-close').click();
 pass('Contents includes every passage and filters by verse');
 await go('read/preface');
 await page.evaluate(()=>BahrReader.setPrefs({tier:'study'}));
 await page.locator('[data-action="passage-notes"]').click();
 await page.locator('#sheet[open]').waitFor();
 assert((await page.locator('#sheet-body').innerText()).includes('Translator annotations'));
 await page.locator('#sheet-close').click();
 assert(await page.locator('#unit-preface').isVisible());
 pass('Passage apparatus opens and returns to the text');
 const routes=[['notes','note','id'],['reports','report','id'],['sources','source','note_id']];
 for(const [key,route,field] of routes){
  for(const item of load(key)){
   await go(route+'/'+item[field]);await page.locator('#sheet[open]').waitFor();
   const body=await page.locator('#sheet-body').innerText();
   assert(!/not found|No current annotation matches/.test(body),route+' '+item[field]);
  }
  pass('Every '+key+' route opens ('+ctx.BAHR_DATA[key].length+')');
 }
 for(const route of ['study','indices','dictionary','research','editions','desk','about']){
  await go(route);assert(!(await page.locator('main').innerText()).includes('Unable to open'));
 }
 await go('dictionary');await page.locator('.dictionary-card').first().click();
 await page.locator('#sheet[open]').waitFor();
 assert((await page.locator('#sheet-body').innerText()).includes('Historical source excerpts'));
 const occurrence=page.locator('#sheet-body a[href^="#/read/"]').first();
 const target=await occurrence.getAttribute('href');await occurrence.click();
 await page.waitForFunction(h=>location.hash===h,target);
 const anchor=new URLSearchParams(target.split('?')[1]).get('at');
 await page.locator('[id="'+anchor+'"]').waitFor();
 pass('Dictionary occurrence returns to its exact text anchor');
 await go('search');await page.locator('#search-query').fill('mercy');await page.locator('#search-form button').click();
 await page.waitForFunction(()=>document.querySelector('#search-results .result-count'));
 assert(await page.locator('#search-results .result').count()>0);pass('Full-edition search returns results');
 await go('read/preface');await page.locator('[data-action="save"]').first().click();
 await page.locator('#annotation-text').fill('Browser verification note');await page.locator('#annotation-form button[type="submit"]').click();
 await go('desk');assert((await page.locator('#desk-items').innerText()).includes('Browser verification note'));
 await page.reload();assert((await page.locator('#desk-items').innerText()).includes('Browser verification note'));
 pass('Reading Desk saves notes and preserves them across reload');
 await go('read/preface');await page.locator('[data-language="ar"]').click();
 assert(!await page.locator('.ar-column').isVisible());assert(await page.locator('.en-column').isVisible());
 await page.locator('[data-language="en"]').click();assert(await page.locator('.en-column').isVisible());
 await page.locator('[data-language="ar"]').click();await page.locator('[data-language="ar"]').click();
 pass('Language controls always retain at least one visible language');

 const viewports=[{width:1440,height:1000},{width:390,height:844},{width:844,height:390},{width:320,height:568}];
 for(const viewport of viewports){
  await page.setViewportSize(viewport);
  for(const palette of ['almohad','cordoba','nasrid','zellij','gnamma','gnamma-air']){
   for(const theme of ['light','dark']){
    await go('read/preface');await page.locator('#settingsBtn').click();
    await page.locator('button[data-palette="'+palette+'"]').click();
    await page.locator('[data-theme-choice="'+theme+'"]').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
    assert.equal(await page.locator('html').getAttribute('data-palette'),palette);
    await overflow('Visuals '+viewport.width+' '+palette+' '+theme);
    assert(await page.locator('#sheet .gn-visual-row').count()>=8);
    await page.locator('#sheet-close').click();await overflow('reader');
    const controls=await page.locator('#topbar button:visible').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return {x:b.x,right:b.right,w:b.width,h:b.height};}));
    assert(controls.every(b=>b.x>=-1&&b.right<=viewport.width+1&&b.w>=28&&b.h>=40),'Toolbar fits '+viewport.width);
    const colour=await page.locator('#readerSaveAction').evaluate(el=>({button:getComputedStyle(el).color,icon:getComputedStyle(el.querySelector('svg')).stroke}));
    assert.equal(colour.button,colour.icon);
   }
  }
  await page.locator('#menuBtn').click();
  assert(await page.locator('#leftNav').isVisible());
  assert.deepEqual(await page.locator('#leftNav .nav-item span').allTextContents(),['Read','Contents','Reading Desk','Subject index','Dictionary · معجم','Scholarly research','Guided study','Editions & downloads','Help & guide']);
  const boxes=await page.locator('#leftNav .nav-item svg').evaluateAll(els=>els.map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height,x:el.getBoundingClientRect().x})));
  assert(boxes.every(b=>b.w===18&&b.h===18&&b.x===boxes[0].x));
  await page.locator('[data-ui="menu-close"]').click();
  await page.screenshot({path:path.join(out,'parity-'+viewport.width+'.png')});
  for(const route of ['home','study','indices','dictionary','research','editions']){await go(route);await overflow(route+' '+viewport.width);}
 }
 pass('Six palettes in Light/Dark; all menu icons and toolbar controls fit four viewport sizes');
 await page.setViewportSize({width:390,height:844});await go('read/preface');
 await page.locator('#settingsBtn').click();
 for(const style of ['book','structured','quiet']){await page.locator('[data-page-style-choice="'+style+'"]').click();assert.equal(await page.locator('html').getAttribute('data-page-style'),style);}
 for(const font of ['amiri','scheherazade','noto']){await page.locator('[data-arabic-font-choice="'+font+'"]').click();await page.waitForFunction(f=>document.documentElement.dataset.arabicFont===f,font);}
 for(const font of ['original','source-serif','literata']){await page.locator('[data-english-font-choice="'+font+'"]').click();await page.waitForFunction(f=>document.documentElement.dataset.englishFont===f,font);}
 await page.locator('#largerType').click();assert.equal(await page.locator('#fontSizeLabel').textContent(),'105%');
 await page.locator('[data-stacked-order="bottom"]').click();
 await page.locator('#sheet-close').click();
 const order=await page.locator('.ar-column').evaluate(el=>getComputedStyle(el).order);assert.equal(order,'1');
 await page.reload();await page.locator('#unit-preface').waitFor();
 assert.equal(await page.locator('html').getAttribute('data-english-font'),'literata');
 pass('Page styles, six fonts, text size and independent mobile order persist');
 await page.locator('[data-ui="copy-menu"]').click();assert.equal(await page.locator('[data-copy-kind]').count(),5);await page.locator('#sheet-close').click();
 await page.locator('[data-ui="share"]').click();assert.equal(await page.locator('[name="share-content"]').count(),6);await page.locator('#sheet-close').click();
 await page.locator('#readerSaveAction').click();await go('read/fatiha_1');await page.locator('#readerSaveAction').click();
 assert.equal(await page.locator('#readerSaveAction').getAttribute('aria-pressed'),'true');
 await page.locator('#saved-counts button').first().click();assert((await page.locator('#sheet-body').innerText()).includes('Manage in Reading Desk'));await page.locator('#sheet-close').click();
 pass('Copy/share menus, immediate section bookmarks and saved-item dock work');
 await page.locator('#focusToolbar').click();await page.locator('[data-mode="focus"]').click();
 assert(await page.locator('#menuBtn').isVisible());assert(!await page.locator('#settingsBtn').isVisible());
 await page.locator('#focusToolbar').click();await page.locator('#focus-apparatus').check();await page.locator('[data-mode="continuous"]').click();
 await page.waitForFunction(()=>document.querySelectorAll('.passage').length===389,null,{timeout:90000});
 assert(await page.locator('#unit-'+catalog[catalog.length-1].id).count());
 await overflow('continuous');
 await page.locator('#focusToolbar').click();await page.locator('[data-mode="reading"]').click();
 await page.waitForFunction(()=>document.querySelectorAll('.passage').length===1);
 pass('Reading, Focus and complete Continuous modes work and can be exited');

 await page.setViewportSize({width:1440,height:1000});
 await go('read/preface');await page.locator('#searchBtn').click();
 await page.locator('#gns-query').fill('mercy');
 await page.waitForFunction(()=>window.GnammaUnifiedSearch?.getState().results>0);
 assert((await page.locator('.gns-toggle-size').innerText()).includes('Research search'));
 await page.locator('.gns-toggle-size[data-gns-expand="1"]').click();
 assert.equal(await page.locator('#gns-mode option').count(),7);
 await page.locator('#gns-mode').selectOption('scholarly');
 await page.locator('#gns-query').fill('mercy AND NOT punishment');
 await page.waitForFunction(()=>window.GnammaUnifiedSearch.getState().query==='mercy AND NOT punishment'&&window.GnammaUnifiedSearch.getState().results>0);
 const advanced=await page.evaluate(()=>window.GnammaUnifiedSearch.query('mercy AND NOT punishment',{mode:'scholarly'}));
 assert(!advanced.error);assert(advanced.results.length>0);
 const proximity=await page.evaluate(()=>window.GnammaUnifiedSearch.query('mercy',{mode:'proximity',nearTerm:'God',nearGap:10}));
 assert(proximity.results.length>0);
 await page.evaluate(()=>GnammaMorphology.ensure('bahr'));
 const morph=await page.evaluate(()=>GnammaUnifiedSearch.query('ilm',{mode:'morph-lemma'}));
 assert(morph.results.length>0);assert(morph.results.every(x=>x.work==='bahr'&&x.anchor));
 const roots=await page.evaluate(()=>GnammaUnifiedSearch.query('علم',{mode:'morph-root'}));assert(roots.results.length>0);
 const targetResult=await page.evaluate(()=>{const x=GnammaUnifiedSearch.query('mercy',{mode:'terms'}).results.find(x=>x.type==='text');return {section:x.section,anchor:x.anchor};});
 await page.locator('#gns-mode').selectOption('terms');await page.locator('#gns-query').fill('mercy');
 await page.waitForFunction(()=>GnammaUnifiedSearch.getState().query==='mercy'&&GnammaUnifiedSearch.getState().results>0);
 await page.locator('[data-gns-details="extra"]').evaluate(el=>el.open=true);await page.locator('#gns-display').selectOption('concordance');
 assert(await page.locator('.gns-concordance').count());
 await page.locator('[data-gns-close]').last().click();
 pass('Daruri Quick Find, Research, all seven modes, proximity, concordance and partial curated morphology work');
 await go('editions');
 assert.deepEqual(await page.locator('#download-types strong').allTextContents(),['Book PDF','Study Guide','Offline reader','Research files']);
 assert.equal(await page.locator('.edition-card').count(),4);
 for(const purpose of ['guide','offline','source','book']){await page.locator('[data-download-type="'+purpose+'"]').click();assert(await page.locator('#download-'+purpose).isVisible());}
 await page.locator('[data-print-tier="study"]').click();await page.locator('#print-custom').evaluate(el=>el.open=true);
 await page.locator('#print-start').selectOption('0');await page.locator('#print-end').selectOption('0');
 await page.locator('[data-print-option="index"]').uncheck();
 await page.locator('[data-feature="prepare-book"]').click();
 await page.locator('#bahr-print-frame').waitFor();
 const frame=page.frameLocator('#bahr-print-frame');
 await frame.locator('.print-unit').waitFor();
 assert.equal(await frame.locator('.print-unit').count(),1);
 assert.equal(await frame.locator('.ar-column p').count(),records[0].ar.split('\n').length);
 await page.locator('[data-feature="close-print"]').click();
 await go('desk');await page.locator('.desk-manage summary').click();await page.locator('[data-feature="transfer"]').click();
 assert(await page.locator('#gn-transfer-shade').isVisible());
 const backup=await page.evaluate(()=>GnammaBackupTransfer.createBackup());
 assert.equal(backup.work,'ibn-ajiba-bahr-vol1');assert(backup.gnammaBackup.readingPlace);assert(backup.gnammaBackup.appearance.palette);
 const count=backup.items.length;
 await page.evaluate(async b=>{b.items.push({id:'qa-restore',type:'note',r:'preface',anchor:'unit-preface',lang:'en',quote:'',note:'Selectively restored',createdAt:'2024-01-02T03:04:05Z',updatedAt:'2024-01-02T03:04:05Z',archived:false});await GnammaBackupTransfer.reviewFile(new File([JSON.stringify(b)],'test.json',{type:'application/json'}));},backup);
 await page.locator('[data-transfer="restore"]').click();
 assert((await page.locator('#gn-transfer-content').innerText()).includes('Reading data restored'));
 assert.equal(await page.evaluate(()=>BahrReader.desk.length),count+1);
 assert.equal(await page.evaluate(()=>BahrReader.desk.find(x=>x.id==='qa-restore').createdAt),'2024-01-02T03:04:05Z');
 await page.locator('[data-transfer="not-now"]').click();
 await page.evaluate(()=>BahrReader.readingDesk());
 await page.locator('#desk-query').fill('Selectively restored');assert.equal(await page.locator('.desk-card:visible').count(),1);
 await page.locator('#desk-query').fill('');await page.locator('#desk-sort').selectOption('created-asc');
 pass('Four download purposes, customized print preview, selective backup restore, dates and Reading Desk filtering work');

 await page.evaluate(()=>BahrReader.closeSheet());
 await go('dictionary');await page.locator('.dictionary-card').first().click();
 await page.locator('[data-feature="save-reference"]').click();await page.locator('#sheet-close').click();
 await go('desk');await page.locator('#desk-source').selectOption('dictionary');
 assert.equal(await page.locator('.desk-card:visible').count(),1);
 await page.locator('a[data-saved-reference]').click();await page.locator('#sheet[open]').waitFor();
 assert((await page.locator('#sheet-kicker').textContent()).includes('HISTORICAL DICTIONARY'));
 await page.locator('#sheet-close').click();
 const refBackup=await page.evaluate(()=>JSON.parse(BahrReader.backup()));
 assert(refBackup.items.some(x=>x.reference?.kind==='dictionary'));
 const preserved=await page.evaluate(b=>BahrCore.validateDesk(b).filter(x=>x.reference).length,refBackup);
 assert(preserved>0);
 await go('read/preface');await page.evaluate(()=>BahrFeatures.prepareSearch());
 const inspected=await page.evaluate(()=>{
  const p=document.querySelector('.ar-column [data-anchor]');
  const quote=p.textContent.trim();
  return GnammaWordContext.openSelectedQuote({r:'preface',anchor:p.id,lang:'ar',quote});
 });
 assert(inspected);await page.locator('#gnamma-word-context').waitFor();
 assert((await page.locator('#gnamma-word-context').innerText()).includes('Word in this passage'));
 await page.locator('.gnw-card [data-gnw-close]').click();
 await page.locator('#location-button').click();
 await page.locator('.toc-surah').nth(1).locator('summary').click();await page.locator('.toc-link').nth(1).click();await page.locator('#unit-'+catalog[1].id).waitFor();
 await page.locator('#location-button').click();assert(await page.locator('#reading-history').count());
 assert((await page.evaluate(()=>BahrFeatures.history.exportData())).entries.length>=2);
 await page.locator('#sheet-close').click();
 pass('Saved source references survive backups; source reopening, explicit Word Context and recent reading locations work');

 assert.deepEqual(errors,[]);pass('No uncaught browser errors or failed reader requests');

 await page.setViewportSize({width:390,height:844});await go('read/preface');await page.screenshot({path:path.join(out,'reader-phone.png')});
 const reference=await context.newPage();await reference.setViewportSize({width:390,height:844});
 await reference.goto(new URL('../../../daruri/#section=1',url).href);
 await reference.locator('#reader').waitFor({timeout:60000});
 await reference.screenshot({path:path.join(out,'daruri-phone.png')});await reference.close();
 await context.close();
 const offlineContext=await browser.newContext();const offlinePage=await offlineContext.newPage();
 await offlinePage.goto(url+'#/editions');await offlinePage.locator('[data-download-type="offline"]').waitFor();
 await offlinePage.evaluate(()=>navigator.serviceWorker.ready);await offlinePage.locator('[data-download-type="offline"]').click();await offlinePage.locator('[data-action="offline"]').click();
 await offlinePage.waitForFunction(()=>document.querySelector('#offline-status')?.textContent.includes('complete reader is saved'),{},{timeout:120000});
 await offlineContext.setOffline(true);await offlinePage.goto(url+'#/read/'+catalog[catalog.length-1].id);
 await offlinePage.locator('#unit-'+catalog[catalog.length-1].id).waitFor();
 pass('Offline cache opens the final passage without network access');

 await browser.close();
 const safari=await webkit.launch({headless:true});
 const sc=await safari.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 const sp=await sc.newPage(),se=[];sp.on('pageerror',e=>se.push(String(e)));
 await sp.goto(url+'#/read/preface');await sp.locator('#unit-preface').waitFor();
 await sp.locator('#settingsBtn').click();await sp.locator('[data-theme-choice="dark"]').click();
 await sp.locator('#sheet-close').click();await sp.locator('#menuBtn').click();
 await sp.locator('[data-ui="menu-close"]').click();
 await sp.locator('#focusToolbar').click();await sp.locator('[data-mode="focus"]').click();
 await sp.locator('#focusToolbar').click();await sp.locator('[data-mode="reading"]').click();
 assert.deepEqual(se,[]);assert(await sp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await sp.screenshot({path:path.join(out,'webkit-phone.png')});await safari.close();
 pass('WebKit phone opens Visuals, navigation and reading modes without runtime errors');

 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:checks.length,checks,passages:389,annotations:209,reports:48,sources:352},null,2));
})().catch(e=>{console.error(e);process.exit(1);});
