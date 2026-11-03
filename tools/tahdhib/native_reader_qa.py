#!/usr/bin/env python3
"""Actual-browser source identity and private-data regression for native Tahdhib."""
import json, os, pathlib, sys
from playwright.sync_api import sync_playwright
BASE=os.getenv('TAHDHIB_QA_BASE','http://127.0.0.1:8765/').rstrip('/')+'/'
OUT=pathlib.Path(os.getenv('TAHDHIB_QA_OUT','qa/tahdhib-native'));OUT.mkdir(parents=True,exist_ok=True)
results=[]
def expect(c,msg):
 if not c:raise AssertionError(msg)
def check(browser,engine,kind,width,height):
 ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce',has_touch=width<900)
 page=ctx.new_page();page.set_default_timeout(12000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 path='texts/al-taftazani/tahdhib-al-'+('kalam' if kind=='kalam' else 'mantiq')+'/edition/'
 key=f'{engine}-{kind}-{width}'
 def mode(value):
  page.locator('#focusToolbar').click();page.locator(f'[data-gn-reader-mode="{value}"]').click()
 def desk():
  if not page.locator('#leftNav').is_visible():page.locator('#menuBtn').click()
  page.locator('#leftNav [data-route="bookmarks"]').click()
 try:
  page.goto(BASE+path,wait_until='networkidle',timeout=60000)
  page.wait_for_function('window.TahdhibNative && window.GnammaReaderModes')
  count=1044 if kind=='kalam' else 19
  expect(page.evaluate('GnammaReaderModes.currentMode()')=='continuous','Not default continuous')
  expect(page.locator('#reader .passage-grid').count()==count,'Missing source paragraphs')
  expect(page.evaluate('TahdhibNative.book.info.id===TAHDHIB_CONFIG.namespace'),'Wrong book identity')
  identity=page.evaluate("""async()=>{const s=await(await fetch('data.js')).text();const c=JSON.parse(s.slice(s.indexOf('=')+1).trim().replace(/;$/,''));const r=TahdhibNative.book.sections.flatMap(s=>s.segments);return c.units.length===r.length&&c.units.every((u,i)=>u.id===r[i].unitId&&u.ar===r[i].ar&&u.en===r[i].en)}""")
  expect(identity,'Source Arabic/English changed')
  expect(page.locator('#reader [data-unit-id]').count()==count,'Stable IDs not attached')
  page.locator('#reader .passage-grid').last.scroll_into_view_if_needed();page.wait_for_timeout(100)
  expect(page.evaluate('scrollY')>400,'Cannot scroll to book end')
  page.locator('#reader .passage-grid').first.scroll_into_view_if_needed()
  page.screenshot(path=str(OUT/(key+'-continuous.png')))
  mode('reading');expect(page.evaluate('GnammaReaderModes.currentMode()')=='reading','Mode choice failed')
  page.locator('#settingsBtn').click();expect(page.locator('#settingsOverlay').is_visible(),'Visuals inaccessible')
  page.locator('[data-arabic-font-choice="scheherazade"]').click()
  page.locator('[data-english-font-choice="literata"]').click()
  page.locator('[data-palette="nasrid"]').last.click()
  expect(page.locator('html').get_attribute('data-palette')=='nasrid','Palette choice failed')
  page.locator('#settingsClose').click()
  page.locator('#readerSaveAction').click()
  expect(page.evaluate('TahdhibNative.rd.records().some(r=>r.kind==="section"&&!r.deleted)'),'Bookmark not saved')
  desk();page.locator('[data-rd="new-note"]').click()
  page.locator('#gn-rd-note-title').fill('Native QA note');page.locator('#gn-rd-note-body').fill('Private observation, preserved exactly.')
  page.locator('[data-rd="save-note"]').click()
  expect(page.evaluate('TahdhibNative.rd.records().some(r=>r.kind==="note"&&r.body==="Private observation, preserved exactly.")'),'Note not saved')
  payload=page.evaluate('JSON.parse(TahdhibNative.rd.backup())')
  expect(payload.get('work')=='tahdhib-native-'+kind,'Unnamespaced backup')
  rejected=page.evaluate("""()=>{const d=JSON.parse(TahdhibNative.rd.backup());d.work='other-book';try{TahdhibNative.rd.importParsed(d);return false}catch{return true}}""")
  expect(rejected,'Foreign-book backup imported')
  page.locator('.gn-rd-manage-menu summary').click();page.locator('[data-rd="backup-transfer"]').click()
  expect(page.locator('#gn-transfer-shade').is_visible(),'Backup & Transfer does not open')
  page.locator('[data-transfer="close"]').click()
  page.locator('.gn-rd-card-open').filter(has_text='Native QA note').click()
  page.locator('.gn-rd-item-more summary').click();page.locator('[data-rd="trash"]').click()
  expect(page.evaluate('TahdhibNative.rd.records().some(r=>r.title==="Native QA note"&&!!r.deleted)'),'Bin did not preserve note')
  page.locator('.gn-rd-manage-menu summary').click();page.locator('[data-rd="filter"][data-value="bin"]').click()
  page.locator('.gn-rd-card-open').filter(has_text='Native QA note').click();page.locator('[data-rd="restore"]').click()
  expect(page.evaluate('TahdhibNative.rd.records().some(r=>r.title==="Native QA note"&&!r.deleted)'),'Restore failed')
  page.screenshot(path=str(OUT/(key+'-desk.png')))
  page.evaluate("TahdhibNative.renderRoute('editions')")
  page.wait_for_function("document.querySelector('#th-pdf-status')?.textContent.includes('matches this source')")
  links=page.locator('#th-pdf-list a[target="_blank"]').evaluate_all('(els)=>els.map(e=>e.getAttribute("href"))')
  expect(len(links)==3 and all('tahdhib-'+kind+'-' in h for h in links),'Wrong published PDF destinations')
  id='KAL-077.03' if kind=='kalam' else 'L.16'
  page.goto(BASE+path+'#u-'+id.replace('.','-'),wait_until='networkidle')
  expect(page.locator('#u-'+id.replace('.','-')).count()==1,'Legacy exact citation lost')
  expect(page.evaluate('TahdhibNative.rd.records().some(r=>r.title==="Native QA note"&&!r.deleted)'),'Notes lost on reload')
  other=ctx.new_page();other.goto(BASE+'texts/al-taftazani/tahdhib-al-'+('mantiq' if kind=='kalam' else 'kalam')+'/edition/',wait_until='networkidle')
  expect(not other.evaluate('TahdhibNative.rd.records().some(r=>r.title==="Native QA note")'),'Cross-book storage leakage');other.close()
  overflow=page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
  expect(overflow<=3,f'Horizontal overflow {overflow}px')
  expect(not errors,'Runtime errors: '+' | '.join(errors))
  results.append({'case':key,'passed':True,'source_units':count});print('PASS',key,flush=True)
 except Exception as e:
  page.screenshot(path=str(OUT/('FAIL-'+key+'.png')))
  results.append({'case':key,'passed':False,'error':str(e),'runtime_errors':errors});print('FAIL',key,str(e),flush=True)
 finally:ctx.close()
with sync_playwright() as p:
 for engine in ['chromium','webkit']:
  browser=getattr(p,engine).launch(headless=True)
  try:
   for kind in ['kalam','logic']:
    for w,h in [(1440,900),(390,844),(844,390)]:check(browser,engine,kind,w,h)
  finally:browser.close()
(OUT/'results.json').write_text(json.dumps({'base':BASE,'cases':results},indent=2))
if any(not r['passed'] for r in results):sys.exit(1)
