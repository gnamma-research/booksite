/*
 * Browser regression for the Gnamma Hikma three-book reader.
 * Run with a local server rooted at the repository:
 *   python3 -m http.server 8767 --bind 127.0.0.1 &
 *   npm install --no-save --package-lock=false playwright@1.58.0
 *   node texts/al-tabatabai/tools/qa-browser.cjs
 * Focused square/table checks (no full-reader PDF smoke test):
 *   HIKMA_QA_SCOPE=logic node texts/al-tabatabai/tools/qa-browser.cjs
 */
'use strict';
const { chromium, webkit } = require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=process.env.HIKMA_QA_BASE||'http://127.0.0.1:8767/texts/al-tabatabai/';
const output=process.env.HIKMA_QA_OUTPUT||'hikma-qa-artifacts';
fs.mkdirSync(output,{recursive:true});
let count=0;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function ready(page){
  await page.locator('#reading-content article.passage').first().waitFor({state:'attached',timeout:35000});
  await page.waitForFunction(()=>document.querySelector('#reading-content article.passage .text-body p')?.textContent.trim().length>4);
  await page.locator('#study-dock').waitFor({state:'attached',timeout:35000});
}
async function check(label, fn){
  try{await fn();count++;console.log('PASS '+label)}
  catch(e){console.error('FAIL '+label+': '+e.stack);throw e}
}
const relationTable=[
  ['Contradictory','O(B,C)','E(B,C)','I(B,C)','A(B,C)'],
  ['Simple converse','I(C,B)','I(C,B)','E(C,B)','—'],
  ['Contrapositive retaining quality','A(¬C,¬B)','—','O(¬C,¬B)','O(¬C,¬B)'],
  ['Contrapositive changing quality','E(¬C,B)','—','I(¬C,B)','I(¬C,B)'],
  ['Predicate-complemented form','E(B,¬C)','O(B,¬C)','A(B,¬C)','I(B,¬C)'],
  ['Both terms complemented','I(¬B,¬C)','—','O(¬B,¬C)','—'],
  ['Subject-complemented form','O(¬B,C)','—','I(¬B,C)','—']
];
async function runLogic(browserType){
  const browser=await browserType.launch({headless:true});
  try{
    for(const mobile of [false,true]){
      for(const reader of ['combined','direct']){
        const context=await browser.newContext({
          viewport:mobile?{width:390,height:844}:{width:1365,height:900},
          isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'
        });
        try{
          const page=await context.newPage();
          const errors=[];
          page.on('pageerror',error=>errors.push(error.message));
          const label=browserType.name()+' '+reader+' '+(mobile?'mobile':'desktop');
          const url=base+(reader==='direct'?'muzaffar-al-mantiq/':'')+'#passage-M-C-30';
          await page.goto(url,{waitUntil:'domcontentloaded'});
          await ready(page);
          await check(label+' bilingual square of opposition',async()=>{
            for(const language of ['english','arabic']){
              const figure=page.locator('#passage-M-C-30 .'+language+'-panel .hikma-source-diagram');
              await figure.waitFor({state:'attached',timeout:35000});
              assert.equal(await figure.count(),1,'Duplicate square in '+language);
              const svg=figure.locator('svg');
              assert.equal(await svg.count(),1,'Missing SVG square in '+language);
              assert.ok(await svg.getAttribute('viewBox'),'Square needs a scalable viewBox');
              assert.ok((await svg.locator('title').textContent()).trim(),'Square has no accessible title');
              assert.ok((await svg.locator('desc').textContent()).trim(),'Square has no accessible description');
              assert.ok((await figure.locator('figcaption').textContent()).trim(),'Square has no caption');
              const nodes=await svg.locator('.hikma-diagram-node').evaluateAll(elements=>
                elements.map(element=>element.dataset.node).sort());
              assert.deepEqual(nodes,['A','E','I','O'],'Four quantified propositions must be represented');
              const pairs=await svg.locator('.hikma-diagram-relation').evaluateAll(elements=>
                elements.map(element=>[element.dataset.from,element.dataset.to].sort().join('-')).sort());
              assert.deepEqual(pairs,['A-E','A-I','A-O','E-I','E-O','I-O'],
                'Square must preserve all six authorial relationships');
            }
          });
          await check(label+' aligned relation table and complement signs',async()=>{
            const passage=page.locator('#passage-M-C-46');
            await passage.waitFor({state:'attached',timeout:35000});
            const table=passage.locator('.english-panel .hikma-table-scroll > table.hikma-text-table');
            assert.equal(await table.count(),1,'The relation table was not rendered as a table');
            const headers=await table.locator('thead th').allTextContents();
            assert.deepEqual(headers.map(text=>text.trim()),[
              'Relation','Universal affirmative A(B,C)','Particular affirmative I(B,C)',
              'Universal negative E(B,C)','Particular negative O(B,C)'
            ]);
            const rows=await table.locator('tbody tr').evaluateAll(elements=>elements.map(row=>
              [...row.querySelectorAll('th,td')].map(cell=>cell.textContent.trim())));
            assert.deepEqual(rows,relationTable,'A missing cell or complement sign changed the table');
            assert.ok(!(await passage.locator('.english-panel .text-body p').allTextContents())
              .some(text=>text.includes('| Relation |')),'Raw Markdown table leaked into prose');
            const text=await passage.textContent();
            assert.match(text,/reconstructs the intended alignment/i,'Editorial reconstruction must remain explicit');
            assert.match(text,/digital-source record|digital (?:table|source)/i,
              'The source reading must remain distinguishable from the editorial reconstruction');
          });
          await check(label+' figure and table containment',async()=>{
            for(const id of ['M-C-30','M-C-46']){
              await page.locator('#passage-'+id+' .english-panel').scrollIntoViewIfNeeded();
              const dimensions=await page.evaluate(()=>({
                viewport:innerWidth,document:document.documentElement.scrollWidth,
                body:document.body.scrollWidth
              }));
              assert.ok(dimensions.document<=dimensions.viewport+3 && dimensions.body<=dimensions.viewport+3,
                id+' causes horizontal page overflow: '+JSON.stringify(dimensions));
            }
            for(const svg of await page.locator('#passage-M-C-30 .hikma-source-diagram svg').all()){
              const bounds=await svg.evaluate(element=>({
                width:element.getBoundingClientRect().width,
                container:element.parentElement.getBoundingClientRect().width
              }));
              assert.ok(bounds.width>0 && bounds.width<=bounds.container+2,
                'Square exceeds its figure: '+JSON.stringify(bounds));
            }
            if(mobile){
              const scroll=page.locator('#passage-M-C-46 .english-panel .hikma-table-scroll');
              const dimensions=await scroll.evaluate(element=>({
                visible:element.clientWidth,content:element.scrollWidth,
                overflow:getComputedStyle(element).overflowX
              }));
              assert.ok(['auto','scroll'].includes(dimensions.overflow),
                'Wide table needs its own horizontal scrolling container');
              assert.ok(dimensions.visible>0 && dimensions.visible<=390,
                'Table container exceeds the mobile viewport');
              if(dimensions.content>dimensions.visible+1){
                await scroll.evaluate(element=>{element.scrollLeft=element.scrollWidth;});
                assert.ok(await scroll.evaluate(element=>element.scrollLeft>0),
                  'Last table columns cannot be reached on mobile');
                await scroll.evaluate(element=>{element.scrollLeft=0;});
              }
            }
            assert.deepEqual(errors,[],'Reader raised an uncaught JavaScript error');
          });
          await page.locator('#passage-M-C-46 .english-panel .hikma-table-scroll').scrollIntoViewIfNeeded();
          await page.screenshot({path:path.join(output,browserType.name()+'-'+reader+'-'+(mobile?'mobile':'desktop')+'-relations.png'),fullPage:false});
        }finally{await context.close()}
      }
    }
  }finally{await browser.close()}
}
async function run(browserType){
  const browser=await browserType.launch({headless:true});
  const errors=[];
  try{
    const ctx=await browser.newContext({viewport:{width:1365,height:900},reducedMotion:'reduce'});
    const page=await ctx.newPage();
    await ctx.clearCookies();
    page.on('pageerror',error=>errors.push(error.message));
    await check(browserType.name()+' three-book landing',async()=>{
      await page.goto(base,{waitUntil:'domcontentloaded'});
      await ready(page);
      assert.equal(await page.locator('#reading-view').inputValue(),'continuous');
      assert.equal(await page.evaluate(()=>document.documentElement.dataset.order),'arabic-first');
      assert.equal(await page.locator('body').getAttribute('data-book'),'combined');
      assert.ok((await page.locator('#reading-content article.passage').count())>=25);
      assert.ok((await page.locator('.hikma-part-tabs button').count())===3);
    });
    await check(browserType.name()+' authorial opening tabs',async()=>{
      await page.locator('[data-part-jump="passage-B-INTRO"]').click();
      await page.locator('#passage-B-INTRO').waitFor({state:'attached'});
      assert.match(await page.locator('#current-location').textContent(),/Bidāy/);
      await page.waitForFunction(() => document.querySelector('[data-part-jump="passage-B-INTRO"]')?.getAttribute('aria-current') === 'true');
      assert.equal(await page.locator('[data-part-jump="passage-B-INTRO"]').getAttribute('aria-current'),'true');
      await page.locator('[data-part-jump="passage-N-INTRO"]').click();
      await page.locator('#passage-N-INTRO').waitFor({state:'attached',timeout:35000});
      assert.match(await page.locator('#current-location').textContent(),/Nihāy/);
      await page.goBack();await page.locator('#passage-B-INTRO').waitFor({state:'attached'});
    });
    await check(browserType.name()+' Muẓaffar Book II universals bilingual coverage',async()=>{
      await page.locator('[data-part-jump="passage-M-P-01"]').click();
      const expectedArabic={
        'M-K-01':'الجزئي','M-K-02':'الجزئي','M-K-03':'الجزئي',
        'M-K-04':'المتواطئ','M-K-05':'المفهوم','M-K-06':'الحمل','M-K-07':'نسبة التباين'
      };
      for(const id of ['M-K-01','M-K-02','M-K-03','M-K-04','M-K-05','M-K-06','M-K-07']){
        const passage=page.locator('#passage-'+id);
        await passage.waitFor({state:'attached',timeout:35000});
        const text=await passage.textContent();
        assert.ok(text.includes(expectedArabic[id]),id+' expected original Arabic wording not rendered');
        assert.ok(text.length>500,id+' bilingual content too short');
      }
      assert.match(await page.locator('#passage-M-K-04').textContent(),/gradation|graded|mushakkik/i);
      assert.match(await page.locator('#passage-M-K-06').textContent(),/primary predication/i);
      assert.match(await page.locator('#passage-M-K-07').textContent(),/coextensiveness/i);
      for(let i=8;i<=17;i++){
        const id='M-K-'+String(i).padStart(2,'0');
        const passage=page.locator('#passage-'+id);
        await passage.waitFor({state:'attached',timeout:35000});
        const content=await passage.textContent();
        assert.ok(content.length>700,'new Book II unit unexpectedly short: '+id);
        assert.ok(await passage.locator('[lang="ar"]').count()>0,'new Book II Arabic missing: '+id);
      }
      assert.match(await page.locator('#passage-M-K-08').textContent(),/conjectur|not logically consistent/i);
      assert.match(await page.locator('#passage-M-K-14').textContent(),/normalized explanatory transcription/i);
    });
    await check(browserType.name()+' Muẓaffar added Book I original sequence',async()=>{
      await page.locator('[data-part-jump="passage-M-P-01"]').click();
      const labels={
        'M-L-05':'المشترك','M-L-06':'الترادف','M-L-07':'المتقابلان',
        'M-L-08':'النقيضين','M-L-09':'المفرد','M-L-10':'الإنشاء',
        'M-L-11':'الكلمة'
      };
      for(const [id,term] of Object.entries(labels)){
        const passage=page.locator('#passage-'+id);
        await passage.waitFor({state:'attached',timeout:35000});
        const content=await passage.textContent();
        assert.ok(content.includes(term),id+' original Arabic absent');
        assert.ok(content.length>700,id+' original bilingual section absent');
      }
      assert.match(await page.locator('#passage-M-L-11').textContent(),/particle|adāh/i);
    });
    await check(browserType.name()+' no duplicated Nihāya emendation footnotes',async()=>{
      await page.locator('[data-part-jump="passage-N-INTRO"]').click();
      for(const id of ['N-I-02','N-II-02','N-VI-03','N-VI-15','N-VI-16']){
        const passage=page.locator('#passage-'+id);
        await passage.waitFor({state:'attached',timeout:35000});
        const texts=await passage.locator('.footnote').allTextContents();
        const copies=texts.filter(text=>/1428 AH/i.test(text));
        assert.equal(new Set(copies).size,copies.length,id+' should not duplicate an emendation note');
      }
      await page.locator('[data-part-jump="passage-B-INTRO"]').click();
      await page.locator('#passage-B-INTRO').waitFor({state:'attached'});
    });
    await check(browserType.name()+' Nihāya corrected VII.8 terminology and editorial apparatus',async()=>{
      await page.locator('[data-part-jump="passage-N-INTRO"]').click();
      const note=page.locator('#passage-N-VII-08');
      await note.waitFor({state:'attached',timeout:35000});
      assert.match(await note.textContent(),/correspond necessarily/i);
      const scorpion=page.locator('#passage-N-VII-07');
      assert.match(await scorpion.textContent(),/scorpion.*sight|scorpion.*blindness/i);
    });
    await check(browserType.name()+' Nihāya XI and VI term-scope corrections',async()=>{
      await page.locator('[data-part-jump="passage-N-INTRO"]').click();
      const intellect=page.locator('#passage-N-XI-PRE');
      await intellect.waitFor({state:'attached',timeout:35000});
      assert.match(await intellect.textContent(),/“intellect” \(al-ʿaql\)/);
      const position=page.locator('#passage-N-VI-19');
      assert.match(await position.textContent(),/imaginal form divested of quantity/i);
      const agent=page.locator('#passage-N-VIII-10');
      const rendered=await agent.locator('.arabic-panel .text-body').textContent();
      assert.ok(rendered.includes('المشهور'),'Missing corrected Arabic');
      assert.ok(!rendered.includes('االمشهور'),'Duplicated alif returned');
    });
    await check(browserType.name()+' bilingual control, focus and chapter navigation',async()=>{
      await page.locator('button[data-language="english"]').click();
      assert.equal(await page.evaluate(()=>document.documentElement.dataset.language),'english');
      await page.locator('#reading-view').selectOption('focus');
      assert.equal(await page.locator('#reading-view').inputValue(),'focus');
      const before=await page.locator('#current-location').textContent();
      await page.locator('#next-chapter').click();
      const after=await page.locator('#current-location').textContent();
      assert.notEqual(before,after);
      await page.locator('button[data-language="bilingual"]').click();
    });
    await check(browserType.name()+' cross-book search and glossary',async()=>{
      const field=page.locator('#book-search');
      await field.fill('الموجود');
      await page.waitForTimeout(350);
      assert.ok((await page.locator('#reading-content article.passage').count())>0);
      assert.ok((await page.locator('#search-summary').textContent()).includes('matching'));
      await page.locator('#clear-filters').click();
      await page.locator('#glossary-open').click();
      assert.equal(await page.locator('#study-dictionary').evaluate(el=>el.open),true);
      await page.locator('#study-dictionary-search').fill('quiddity');
      assert.ok((await page.locator('#study-dictionary-list .dictionary-sense').count())>0);
      await page.locator('#study-dictionary').getByRole('button',{name:'Close Dictionary · معجم',exact:true}).click();
    });
    await check(browserType.name()+' local bookmarks and notes',async()=>{
      await page.locator('[data-part-jump="passage-M-P-01"]').click();
      await page.locator('#passage-M-P-01').waitFor({state:'attached'});
      const passage=page.locator('#passage-M-P-01');
      await passage.locator('[data-bookmark]').click();
      assert.equal(await passage.locator('[data-bookmark]').getAttribute('aria-pressed'),'true');
      await passage.locator('[data-note]').click();
      await page.locator('#note-text').fill('A regression-test note');
      await page.locator('#note-form button[type="submit"]').click();
      assert.ok((await page.locator('#saved-count').textContent()).trim()==='1');
      await page.reload();await ready(page);
      assert.equal(await page.locator('#passage-M-P-01 [data-bookmark]').getAttribute('aria-pressed'),'true');
      assert.ok((await page.locator('#saved-count').textContent()).trim()==='1');
    });
    await check(browserType.name()+' print layout switch',async()=>{
      await page.evaluate(()=>{window.print=()=>{window.__pdfTriggered=document.body.dataset.pdfMode;};});
      await page.locator('#pdf-print').click();
      assert.equal(await page.locator('#pdf-layout-dialog').evaluate(el=>el.open),true);
      await page.locator('#pdf-layout-dialog input[value="reference"]').check();
      await page.locator('#pdf-confirm').click();
      assert.equal(await page.evaluate(()=>window.__pdfTriggered),'reference');
      assert.ok(await page.locator('body').getAttribute('data-pdf-mode')==='reference');
      await page.evaluate(()=>{window.dispatchEvent(new Event('afterprint'));});
      assert.equal(await page.locator('body').getAttribute('data-pdf-mode'),null);
    });
    if(browserType.name()==='chromium'){
      await check('A4 study PDF generation',async()=>{
        await page.locator('#pdf-print').click();
        await page.locator('#pdf-layout-dialog input[value="study"]').check();
        await page.locator('#pdf-confirm').click();
        const pdf=await page.pdf({format:'A4',printBackground:true,displayHeaderFooter:true,
          headerTemplate:'<span></span>',
          footerTemplate:'<div style="font:8px Georgia;text-align:center;width:100%;color:#888"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
          margin:{top:'16mm',bottom:'18mm',left:'15mm',right:'15mm'}});
        assert.ok(pdf.length>25000,'PDF too small');
        fs.writeFileSync(path.join(output,'muzaffar-study-A4-smoke.pdf'),pdf);
        await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
      });
    }
    await page.screenshot({path:path.join(output,browserType.name()+'-desktop.png'),fullPage:false});
    const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,reducedMotion:'reduce'});
    const phone=await mobile.newPage();phone.on('pageerror',error=>errors.push(error.message));
    await check(browserType.name()+' portrait mobile controls',async()=>{
      await phone.goto(base,{waitUntil:'domcontentloaded'});
      await ready(phone);
      const width=await phone.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
      assert.ok(width.scroll<=width.width+3,'Horizontal overflow: '+JSON.stringify(width));
      await phone.locator('#contents-toggle').click();
      assert.equal(await phone.locator('#contents-toggle').getAttribute('aria-expanded'),'true');
      assert.equal(await phone.locator('body').evaluate(e=>e.classList.contains('contents-open')),true);
      await phone.locator('#contents-close').click();
      await phone.locator('[data-part-jump="passage-B-INTRO"]').click();
      await phone.locator('#passage-B-INTRO').waitFor({state:'attached'});
    });
    await phone.screenshot({path:path.join(output,browserType.name()+'-phone.png'),fullPage:false});
    await check(browserType.name()+' no uncaught JavaScript errors',async()=>{assert.deepEqual(errors,[])});
    await mobile.close();await ctx.close();
  }finally{await browser.close()}
}
(async()=>{
  for(const type of [chromium,webkit]){
    if(process.env.HIKMA_QA_BROWSER && process.env.HIKMA_QA_BROWSER!==type.name())continue;
    if(process.env.HIKMA_QA_SCOPE!=='logic')await run(type);
    await runLogic(type);
  }
  console.log('All '+count+' checks passed');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
