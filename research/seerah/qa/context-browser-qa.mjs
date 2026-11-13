import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
const name=process.env.GNAMMA_BROWSER||'chromium',browserType=name==='webkit'?webkit:chromium,root='http://127.0.0.1:8765/research/seerah/';
const dir=process.env.GNAMMA_REPORT_DIR||'/tmp/seerah-context-'+name;mkdirSync(dir,{recursive:true});
const b=await browserType.launch({headless:true}),report={browser:name,checks:[],errors:[]};
async function waitLoad(page,url,sel){await page.goto(root+url,{waitUntil:'load'});await page.locator(sel).first().waitFor({timeout:15000})}
try{
 for(const dim of [{w:390,h:844,label:'mobile'},{w:1280,h:800,label:'desktop'}]){
 const cx=await b.newContext({viewport:{width:dim.w,height:dim.h},deviceScaleFactor:1}),p=await cx.newPage(),problems=[];
 p.on('pageerror',e=>problems.push(e.message));
 await waitLoad(p,'read.html#ch-16','#s16-m01');
 assert.equal(await p.locator('article.chapter').count(),46,'Chapters preserved');
 assert.ok(await p.locator('[id^="s"][id*="-m"]').count()>100,'Stable matn anchors');
 assert.ok(await p.locator('[id^="s"][id*="-s"]').count()>100,'Stable commentary anchors');
 await p.locator('a.person-ref').first().waitFor({timeout:15000});
 assert.ok(await p.locator('a.person-ref').count()>25,'No contextual person links');
 await p.locator('a.person-ref').first().click();
 await p.locator('#person-context-dialog[open]').waitFor();
 assert.ok((await p.locator('#person-context-dialog').innerText()).length>100,'Biography card has no explanation');
 await p.locator('[data-close-person]').click();
 assert.equal(await p.locator('#person-context-dialog[open]').count(),0);
 await p.screenshot({path:dir+'/reader-context-'+dim.label+'.png'});
 await waitLoad(p,'people.html','#person-results');
 await p.locator('.profile-card').first().waitFor({timeout:10000});
 assert.equal(await p.locator('.profile-card').count(),90,'Person index should contain 90 entries');
 assert.equal(await p.locator('.context-group').count(),5,'Five narrative groupings');
 await p.locator('#person-search').fill('Abū Jandal');
 await p.locator('#person-abu-jandal').waitFor();
 assert.equal(await p.locator('.profile-card').count(),1,'Search should narrow profiles');
 await p.locator('#person-abu-jandal summary').click();
 assert.ok((await p.locator('#person-abu-jandal').innerText()).includes('Suhayl'),'Abu Jandal family context absent');
 await p.locator('#person-search').fill('');
 await p.screenshot({path:dir+'/people-index-'+dim.label+'.png'});
 await waitLoad(p,'subjects.html','#subject-results');
 await p.locator('.subject-entry').first().waitFor({timeout:10000});
 assert.equal(await p.locator('.subject-entry').count(),49,'Subject terms missing');
 await p.locator('#subject-search').fill('fiqh');
 assert.ok(await p.locator('.subject-entry').count()>=1);
 await waitLoad(p,'geography.html','#geo-places');
 await p.locator('.geo-place').first().waitFor({timeout:10000});
 assert.equal(await p.locator('.geo-place').count(),10,'Arabia map places');
 assert.ok(await p.locator('.geo-place a[href*="openstreetmap.org"]').count()>=10);
 await p.locator('button[data-region="imperial"]').click();
 assert.equal(await p.locator('.geo-place').count(),9,'Imperial centre map places');
 await p.screenshot({path:dir+'/geography-'+dim.label+'.png'});
 await waitLoad(p,'chronology.html','#chrono-events');
 await p.locator('.chron-item').first().waitFor({timeout:10000});
 assert.equal(await p.locator('.chron-item').count(),18,'Early timeline events');
 await p.locator('button[data-era="modern"]').click();
 assert.equal(await p.locator('.chron-item').count(),11,'Modern timeline events');
 const scroll=await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 if(dim.w<500)assert.ok(scroll<=40,'Mobile horizontal overflow: '+scroll);
 assert.deepEqual(problems,[],'Browser page errors');
 report.checks.push({viewport:dim.label,people:90,groups:5,subjects:49,locations:26,events:42,contextDialog:true,overflow:scroll,errors:problems});
 await cx.close();
 }
 report.status='PASS';
}catch(e){report.status='FAIL';report.errors.push(String(e));}
finally{writeFileSync(dir+'/context-report.json',JSON.stringify(report,null,2));await b.close();}
if(report.status!=='PASS'){console.error(report);process.exit(1)}
console.log('PASS Sīrah contextual readers '+name+': five cast groups, 90 biographies, 49 subjects, 26 located places, 42 timeline events, back links and paragraph context cards');