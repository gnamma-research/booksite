#!/usr/bin/env python3
"""Real Chromium acceptance, separate from synthetic DOM and manuscript collation."""
from pathlib import Path
from urllib.parse import unquote,urlsplit
from playwright.sync_api import sync_playwright
import json,mimetypes

BASE=Path(__file__).resolve().parent.parent
ROOT=BASE.parents[2]
PREFIX='/texts/al-turka/qawaid-al-tawhid/'
REPORT=BASE/'qa/commentary-browser-acceptance.json'
checks=[]
def ck(label,condition):
    if not condition: raise AssertionError(label)
    checks.append(label)
def serve(route):
    path=unquote(urlsplit(route.request.url).path)
    if path.startswith(PREFIX):
        fp=BASE/(path[len(PREFIX):] or 'index.html')
    elif path.startswith('/assets/'):
        fp=ROOT/path[1:]
    else:
        return route.fulfill(status=404,body='Resource outside test scope')
    if not fp.is_file():return route.fulfill(status=404,body='Not found')
    return route.fulfill(status=200,body=fp.read_bytes(),content_type=mimetypes.guess_type(str(fp))[0] or 'application/octet-stream')
with sync_playwright() as playwright:
    browser=playwright.chromium.launch(headless=True)
    context=browser.new_context(viewport={'width':390,'height':844},accept_downloads=True,reduced_motion='reduce')
    context.route('https://gnamma.test/**',serve)
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    try:
        page.goto('https://gnamma.test'+PREFIX+'commentary.html',wait_until='networkidle',timeout=45000)
        ck('live source parses and renders introductory section',page.locator('#reading-list .reading-block').count()==1 and 'SH-INTRO-001' in page.locator('#reading-list').inner_text())
        ck('all 110 units available in loaded corpus',page.evaluate('window.GNAMMA_TAMHID_CORPUS.units.length')==110)
        ck('both Arabic and English present',page.locator('#reading-list .ar').count()==1 and page.locator('#reading-list .en').count()==1)
        page.locator('#lang-en').click()
        ck('English toggles off',page.locator('body').get_attribute('data-language')=='ar')
        page.locator('#lang-en').click()
        page.locator('#lang-ar').click()
        ck('Arabic toggles off independently',page.locator('body').get_attribute('data-language')=='en')
        page.locator('#lang-en').click()
        ck('at least one language remains visible',page.locator('body').get_attribute('data-language')=='en')
        page.locator('#lang-ar').click()
        page.locator('#next').click()
        ck('next controls navigate sections','SH-INTRO-002' in page.locator('#location-title').inner_text())
        page.locator('#menu-button').click()
        ck('contents include all 110 sections',page.locator('#sheet-content [data-jump]').count()==110)
        page.locator('#sheet-close').click()
        page.locator('#search-button').click()
        page.locator('#commentary-query').fill('existence')
        ck('full-text search returns linked results',page.locator('#commentary-results [data-jump]').count()>5)
        page.locator('#sheet-close').click()
        page.locator('#save-button').click()
        ck('bookmark persisted locally',bool(page.evaluate("JSON.parse(localStorage.getItem('gnamma:tamhid:commentary:v1')).bookmarks.length")))
        page.locator('#continuous-reading').click()
        ck('continuous mode renders every commentary unit',page.locator('#reading-list .reading-block').count()==110)
        ck('conclusion follows main commentary',page.evaluate("() => [...document.querySelectorAll('.reading-block')].slice(-6).map(e=>e.id).includes('SH-061-B')"))
        page.locator('#focus-recover').click()
        ck('reading controls can leave continuous mode',page.locator('body').get_attribute('data-focus')=='0')
        with page.expect_download() as task:
            page.locator('#export-text').click()
        ck('complete commentary exports under accurate filename',task.value.suggested_filename=='Tamhid_Complete_Commentary_AR_EN.md')
        for width in [320,390,768,1280]:
            page.set_viewport_size({'width':width,'height':844})
            ck('no horizontal overflow at '+str(width),page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'))
        ck('no JavaScript page errors',not errors)
        page.set_viewport_size({'width':390,'height':844})
        page.screenshot(path=str(BASE/'qa/commentary-mobile-proof.png'),full_page=False)
        # Test separately delivered, fully embedded HTML rather than just the linked-page scripts.
        page2=context.new_page();secondErrors=[];page2.on('pageerror',lambda e:secondErrors.append(str(e)))
        page2.goto('https://gnamma.test'+PREFIX+'downloads/Tamhid_Complete_Commentary_Reading_Edition.html',wait_until='domcontentloaded',timeout=45000)
        page2.wait_for_selector('#reading-list .reading-block',timeout=30000)
        ck('self-contained HTML executes both embedded script blocks',page2.evaluate('window.GNAMMA_TAMHID_CORPUS.units.length')==110)
        ck('self-contained HTML renders source Arabic',len(page2.locator('#reading-list .ar').inner_text())>100)
        ck('no standalone HTML page errors',not secondErrors)
        page2.screenshot(path=str(BASE/'qa/commentary-single-file-proof.png'),full_page=False)
        # The canonical ledger records comparison, not manuscript certification.
        ledger=json.loads((BASE/'qa/clause-ledger.json').read_text())
        summary=ledger['summary'];total=summary['totalArabicPunctuationClauses']
        reviewed=summary['individuallyComparedArabicPunctuationClauses']
        sahw=next(a for u in ledger['units'] if u['id']=='SH-058' for a in u['arabicClauses'] if 'السهو' in a['text'])
        anchor='SH-058-C'+str(sahw['n']).zfill(3)
        page3=context.new_page();reviewErrors=[]
        page3.on('pageerror',lambda e:reviewErrors.append(str(e)))
        page3.goto('https://gnamma.test'+PREFIX+'clause-review.html#'+anchor,
                   wait_until='networkidle',timeout=45000)
        page3.wait_for_function("n => document.querySelector('#n-all')?.textContent === n",arg=f'{total:,}',timeout=30000)
        ck('canonical review indexes all Arabic segments',page3.locator('#n-all').inner_text()==f'{total:,}')
        ck('comparison and pending counts match the actual ledger',int(page3.locator('#n-reviewed').inner_text().replace(',',''))==reviewed and int(page3.locator('#n-pending').inner_text().replace(',',''))==total-reviewed)
        ck('all 171 source units represented',int(page3.locator('#n-units').inner_text())==171)
        ck('deep-link opens SH-058 in the correct section',page3.locator('#unit').input_value()=='SH-058')
        ck('sahw source reading and its uncertainty are visible','السهو' in page3.locator('#'+anchor+' .arabic').inner_text() and 'unresolved-reading' in page3.locator('#'+anchor+' .status').inner_text())
        page3.locator('#filter').select_option('unresolved')
        ck('unresolved filter retains source problems',page3.locator('.passage').count()>0 and page3.locator('.passage .status.pending').count()>0)
        page3.locator('#unit').select_option('SH-037')
        page3.locator('#filter').select_option('pending')
        ck('completed comparison has no falsely pending passages',page3.locator('.passage').count()==0)
        page3.locator('#filter').select_option('all')
        ck('previously unreviewed commentary now has recorded correspondences',page3.locator('.passage').count()>0 and page3.locator('.passage .note').count()==page3.locator('.passage').count())
        for width in [320,390,768]:
            page3.set_viewport_size({'width':width,'height':844})
            ck('clause reader has no horizontal overflow '+str(width),page3.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'))
        ck('clause reader has no JavaScript page errors',not reviewErrors)
        page3.screenshot(path=str(BASE/'qa/clause-review-mobile-proof.png'),full_page=False)

        outcome={'passed':True,'checks':checks,'count':len(checks),'browser':'headless Chromium','viewportWidths':[320,390,768,1280],'realIOSSafariTested':False,'manuscriptCollationTested':False}
    except Exception as e:
        page.screenshot(path=str(BASE/'qa/commentary-browser-error.png'),full_page=False)
        outcome={'passed':False,'checks':checks,'count':len(checks),'error':str(e),'pageErrors':errors,'realIOSSafariTested':False}
        REPORT.write_text(json.dumps(outcome,ensure_ascii=False,indent=2)+'\n')
        raise
    finally:
        browser.close()
REPORT.write_text(json.dumps(outcome,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(outcome,ensure_ascii=False,indent=2))
