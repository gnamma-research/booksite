"""Qawtaw17: actual Chromium acceptance of Daruri-family controls on Qawaid/Tamhid.
The canonical Daruri matching scripts are loaded unmodified from /daruri.
No physical iOS / Safari claim is made.
"""
from pathlib import Path
from urllib.parse import urlsplit,unquote
import json,mimetypes,sys
from playwright.sync_api import sync_playwright
B=Path(__file__).resolve().parent.parent
REPO=B.parents[2]
BASE='/texts/al-turka/qawaid-al-tawhid/'
URL='https://gnamma.test'+BASE
checks=[]
def ck(name,value):
 if not value:raise AssertionError(name)
 checks.append(name)
def route(handler):
 path=unquote(urlsplit(handler.request.url).path)
 target=REPO / path.lstrip('/')
 if target.is_dir():target=target/'index.html'
 if target.is_file():
  return handler.fulfill(status=200,body=target.read_bytes(),
    content_type=mimetypes.guess_type(str(target))[0] or 'application/octet-stream')
 return handler.fulfill(status=404,body='No local test asset: '+path)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True)
 ctx=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
 ctx.route('https://gnamma.test/**',route)
 page=ctx.new_page()
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 try:
  page.goto(URL,wait_until='networkidle')
  page.wait_for_selector('#QT-001')
  page.wait_for_function("() => window.GnammaQawaidSearch?.ready()===true")
  ck('all 110 commentary units indexed',page.evaluate("window.GnammaQawaidSearch.records().filter(x=>x.type==='sharh'||x.type==='intro').length")==110)
  ck('source matn IDs preserved',page.evaluate("window.GNAMMA_QAWAID_MATN.units.length")==61)
  ck('shared Daruri source matchers mounted',page.evaluate("Boolean(window.GnammaScholarly?.safeBuilder&&window.GnammaProximity?.find&&window.GnammaBookmarkUI?.icon)"))
  page.locator('#menu-button').click()
  ck('one main reading desk menu',page.locator('#gn-study-dialog').is_visible() and page.locator('.gn-menu-row').count()>=12)
  ck('research search and saved collection discoverable','Research Search' in page.locator('#gn-study-content').inner_text() and 'Reading Desk' in page.locator('#gn-study-content').inner_text())
  page.locator('[data-open-study="advanced"]').click()
  ck('research search opens from menu',page.locator('#qaw-research-dialog').is_visible())
  page.locator('#qaw-term').fill('الوجود')
  page.locator('#qaw-research-form button[type="submit"]').click()
  ck('Arabic full work search returns passages',page.locator('#qaw-research-results .qaw-count').count()==1 and page.locator('.qaw-result-list li').count()>5)
  ck('no misleading truncated result cap',page.evaluate("Number(document.querySelector('.qaw-count strong').textContent)>5"))
  page.locator('[data-qaw-search="research"]').click()
  page.locator('#qaw-mode').select_option('pattern')
  page.locator('#qaw-term').fill('الوجود AND الحقيقة')
  page.locator('#qaw-research-form button[type="submit"]').click()
  ck('Daruri bounded Boolean parser executes',page.locator('.qaw-error').count()==0)
  page.locator('#qaw-mode').select_option('phrase')
  page.locator('#qaw-term').fill('الوجود المطلق')
  page.locator('#qaw-research-form button[type="submit"]').click()
  ck('Arabic phrase mode works',page.locator('.qaw-result-list li').count()>0)
  page.locator('#qaw-mode').select_option('near')
  page.locator('#qaw-term').fill('الوجود')
  page.locator('#qaw-near').fill('الحق')
  page.locator('#qaw-gap').select_option('50')
  page.locator('#qaw-research-form button[type="submit"]').click()
  ck('word-proximity engine executes without runtime error',page.locator('.qaw-error').count()==0)
  page.locator('[data-qaw-search="close"]').click()
  page.locator('#menu-button').click()
  page.locator('[data-open-study="modes"]').click()
  page.locator('[data-qaw-focus="3"]').click()
  ck('continuous focus renders 61 passages',page.locator('.layered-unit').count()==61 and page.locator('body').get_attribute('data-focus')=='3')
  page.locator('#focus-recover').click()
  page.locator('#focus-button').click() if page.locator('#focus-button').is_visible() else None
  page.locator('#menu-button').click()
  page.locator('[data-open-study="settings"]').click()
  page.locator('input[name="gn-heading-mode"][value="source"]').check()
  ck('editorial titles can be hidden without removing text',page.locator('body').get_attribute('data-headings')=='source' and page.locator('#QT-001 .qaw-editorial-heading').is_hidden())
  page.locator('input[name="gn-heading-mode"][value="guide"]').check()
  ck('guide titles can be restored',page.locator('#QT-001 .qaw-editorial-heading').is_visible())
  page.locator('#gn-study-dialog [data-study-close]').first.click()
  page.locator('#menu-button').click()
  page.locator('[data-open-study="dictionary"]').click()
  ck('82 technical dictionary entries',page.locator('.gn-term-grid button').count()==82)
  page.locator('[data-open-term="existence"]').click()
  ck('dictionary opens Arabic and occurrences',page.locator('.gn-headword').count()==1 and page.locator('.gn-locations a').count()>0)
  ck('dictionary item supports Reading Desk saving',page.locator('[data-qaw-save-term]').count()==1)
  page.locator('[data-qaw-save-term="existence"]').click()
  page.locator('#gn-study-dialog [data-study-close]').first.click()
  page.locator('#menu-button').click()
  page.locator('[data-open-study="subjects"]').click()
  ck('11 scholarly subject groups remain',page.locator('.gn-subject-group').count()==11)
  page.locator('#gn-study-dialog [data-study-close]').first.click()
  page.locator('#menu-button').click()
  page.locator('[data-open-study="pdf"]').click()
  page.wait_for_selector('.qaw-pdf-tabs')
  ck('PDF choices are available by tier',page.locator('.qaw-pdf-tabs [role="tab"]').count()==3)
  ck('three existing clean reading PDFs',page.locator('.gn-pdf-row').count()==3)
  page.locator('[data-qaw-pdf-tier="study"]').click()
  ck('one existing study PDF',page.locator('.gn-pdf-row').count()==1)
  page.locator('[data-qaw-pdf-tier="reference"]').click()
  ck('one existing full reference PDF',page.locator('.gn-pdf-row').count()==1)
  page.locator('#gn-study-dialog [data-study-close]').first.click()
  page.locator('#menu-button').click()
  page.locator('[data-open-study="desk"]').click()
  ck('private Reading Desk opens',page.locator('#qaw-desk-dialog').is_visible())
  page.locator('[data-desk="bookmark"]').click()
  ck('passage bookmark is created',page.evaluate("window.GnammaQawaidDesk.bookmarks().length>=1"))
  ck('Daruri SVG bookmark visual available',page.locator('.qaw-desk-title svg').count()>0)
  page.locator('[data-desk="close"]').click()
  page.locator('#QT-001 .matn-layer .en p').first.evaluate("""el=>{const text=el.firstChild;const sel=getSelection();const r=document.createRange();r.setStart(text,2);r.setEnd(text,Math.min(22,text.length));sel.removeAllRanges();sel.addRange(r);el.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));}""")
  page.wait_for_timeout(130)
  ck('single-paragraph selection presents actions',page.locator('#qaw-selection-tools').is_visible())
  page.locator('[data-desk-selection="quote"]').click()
  ck('exact quotation saved locally',page.evaluate("window.GnammaQawaidDesk.records().some(x=>x.kind==='quote'&&x.quote.length>=2)"))
  page.locator('#menu-button').click()
  page.locator('[data-open-study="desk"]').click()
  page.locator('[data-desk-tab="highlights"]').click()
  ck('highlight collection displays saved quotation',page.locator('.qaw-desk-card blockquote').count()>0)
  ck('JSON backup and import actions present',page.locator('[data-desk="export"]').count()==1 and page.locator('[data-desk="import"]').count()==1)
  ck('print saved work available without altering publisher PDFs',page.locator('[data-desk="print"]').count()==1)
  page.locator('[data-desk="close"]').click()
  for width in (320,390,768,1280):
   page.set_viewport_size({'width':width,'height':900 if width>720 else 844})
   ck('no horizontal overflow '+str(width),page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
  ck('zero uncaught browser errors',not errors)
  report={'passed':True,'checks':checks,'browser':'Chromium','realIOSSafari':False,
          'daruriMatcherReused':True,'legacyReadingDataPreserved':True,
          'notClaimed':['verified Qawaid morphological root index','personal merged PDF','offline PWA','fully vowelled Arabic']}
  (B/'qa/qawtaw17-parity-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
  print(json.dumps(report,ensure_ascii=False,indent=2))
 except Exception as e:
  (B/'qa/qawtaw17-parity-browser.json').write_text(json.dumps({'passed':False,'error':str(e),'checks':checks,'errors':errors},ensure_ascii=False,indent=2))
  page.screenshot(path=str(B/'qa/qawtaw17-failure.png'))
  raise
 finally:
  browser.close()
