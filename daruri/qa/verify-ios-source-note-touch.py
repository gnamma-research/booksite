#!/usr/bin/env python3
"""Cross-engine touch and keyboard regression for Daruri source-note links.

Linux WebKit emulates Safari rendering/events; it cannot display iOS-native
long-press preview sheets. Native long-press remains a device acceptance test.
"""
from __future__ import annotations
import http.server
import json
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
DARURI = ROOT / 'daruri'
REPORT = DARURI / 'qa' / 'source-note-touch-results'
REPORT.mkdir(exist_ok=True, parents=True)
HTML = """<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font:16px/1.5 system-ui;margin:12px}.gn-unified-notes{padding:12px;border:1px solid #ddd}</style>
</head><body><h1>Daruri §38 · Notes</h1><main class="gn-unified-notes">
<article class="gn-note-entry" data-note-id="QUR-R038-Q001"><p>Direct quotation from al-Nisāʾ.</p>
<span class="source-note-links">Sources: <a href="https://quran.com/4/43">al-Nisāʾ 4:43</a></span></article>
<article class="gn-note-entry" data-note-id="QUR-R001-Q049"><p>Possible verbal echo, not a quotation.</p>
<span class="source-note-links"><a href="https://quran.com/55/4">al-Raḥmān 55:4</a></span></article>
<article class="gn-note-entry" data-note-id="QUR-R001-Q050"><p>Possible verbal echo, not a quotation.</p>
<span class="source-note-links"><a href="https://quran.com/6/149">al-Anʿām 6:149</a></span></article>
<article class="gn-note-entry" data-note-id="QUR-R082-Q007"><p>Direct quotation from al-Tawbah.</p>
<span class="source-note-links"><a href="https://quran.com/9/122">https://quran.com/9/122</a></span></article>
<article class="gn-note-entry" data-note-id="QUR-R045-Q002"><p>Direct quotation from al-Baqarah.</p>
<span class="source-note-links"><a href="https://quran.com/2/286">al-Baqarah 2:286</a></span></article>
<article class="gn-note-entry" data-note-id="HAD-R002"><p>Hadith source.</p>
<span class="source-note-links"><a href="https://sunnah.com/bukhari:185">https://sunnah.com/bukhari:185</a></span></article>
</main></body></html>"""

class QuietHTTP(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, *args):
        pass

def exercise(engine, browser, width, mobile):
    ctx = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=mobile,
                              has_touch=mobile, device_scale_factor=1)
    page = ctx.new_page()
    page.set_content(HTML)
    page.add_style_tag(path=str(DARURI / 'source-note-ui.css'))
    page.add_script_tag(path=str(DARURI / 'source-note-ui.js'))
    page.wait_for_function("document.documentElement.dataset.gnSourceNotesRevision === '20261021-section1-qparallels1'")
    links = page.locator('a.gn-source-icon-link')
    assert links.count() == 6
    verses = page.locator('.gn-verse-source-excerpt')
    assert verses.count() == 3
    assert 'possible verbal allusion' in page.locator('[data-note-id="QUR-R001-Q049"] .gn-verse-source-excerpt').inner_text()
    assert 'not a quotation' in page.locator('[data-note-id="QUR-R001-Q050"] .gn-verse-source-excerpt').inner_text()
    assert page.locator('a[href="https://quran.com/33/40"]').count() == 0
    assert '﴿' in verses.first.inner_text() and '﴾' in verses.first.inner_text()
    assert 'https:' not in page.locator('.gn-unified-notes').inner_text()
    link = links.first
    assert link.get_attribute('href') == 'https://quran.com/4/43'
    assert link.get_attribute('target') == '_blank'
    assert 'noopener' in link.get_attribute('rel')
    dimensions = link.evaluate("e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,touch:getComputedStyle(e).touchAction,callout:getComputedStyle(e).getPropertyValue('-webkit-touch-callout')})")
    assert dimensions['width'] >= (44 if mobile else 34), dimensions
    assert dimensions['height'] >= (44 if mobile else 34), dimensions
    assert dimensions['touch'] == 'manipulation', dimensions
    assert dimensions['callout'] != 'none', dimensions
    assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
    assert link.evaluate("e => e.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}))")
    tip = page.locator('#gn-source-url-tooltip')
    if mobile:
        link.evaluate("e => e.dispatchEvent(new PointerEvent('pointerenter',{bubbles:true,pointerType:'touch'}))")
        assert tip.count() == 0 or not tip.is_visible()
        link.evaluate("e => e.dispatchEvent(new Event('touchstart',{bubbles:true,cancelable:true}))")
        link.focus()
        assert tip.count() == 0 or not tip.is_visible(), 'touch focus showed desktop tooltip'
        link.blur()
        page.keyboard.press('Tab')
        link.focus()
        assert tip.is_visible(), 'keyboard focus lost URL tooltip'
        page.keyboard.press('Escape')
        assert not tip.is_visible()
    else:
        link.hover()
        assert tip.is_visible() and tip.inner_text() == 'https://quran.com/4/43'
        page.keyboard.press('Escape')
        assert not tip.is_visible()
    dynamic = page.evaluate("""() => {
      const a = document.createElement('article');
      a.className='gn-note-entry'; a.dataset.noteId='QUR-R038-Q001';
      a.innerHTML='<p>Second note instance</p><span class="source-note-links"><a href="https://quran.com/4/43">Verse</a></span>';
      document.body.appendChild(a);return a.id||'added';
    }""")
    page.wait_for_function("document.querySelectorAll('a.gn-source-icon-link').length === 7")
    assert page.locator('.gn-verse-source-excerpt').count() == 4, 'dynamic popup not enhanced'
    page.screenshot(path=str(REPORT / f'{engine}-{width}.png'), full_page=True)
    ctx.close()
    return {'engine':engine,'width':width,'touch':mobile,'target_px':dimensions['width'],
            'native_callout_css':dimensions['callout'],'external_uri':True,
            'touch_focus_hidden':mobile,'keyboard_focus':True,'no_horizontal_overflow':True,
            'verified_quotes':1,'possible_verbal_comparisons':2,'dynamic_note_updates':True,'contextmenu_not_cancelled':True}

def smoke_full_site(browser, port, engine):
    ctx=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    page=ctx.new_page()
    page.goto(f'http://127.0.0.1:{port}/daruri/', wait_until='domcontentloaded',timeout=90000)
    page.wait_for_function("document.documentElement.dataset.gnSourceNotesRevision === '20261021-section1-qparallels1'",timeout=90000)
    # Source notes are rendered on demand by the current reader: the old
    # fallback article id may legitimately be absent until its note card opens.
    # Add a real dynamic note to the running site and test its active observer.
    page.evaluate("""() => {
      const note = document.createElement('article');
      note.id = 'qa-current-site-source-note';
      note.className = 'gn-note-entry';
      note.dataset.noteId = 'QUR-R038-Q001';
      note.innerHTML = '<p>Qurʾān al-Nisāʾ 4:43.</p><span class="source-note-links"><a href="https://quran.com/4/43">al-Nisāʾ 4:43</a></span>';
      document.body.appendChild(note);
    }""")
    page.wait_for_function("document.querySelector('#qa-current-site-source-note a.gn-source-icon-link') !== null",timeout=15000)
    link=page.locator('#qa-current-site-source-note a.gn-source-icon-link').first
    assert link.get_attribute('href')=='https://quran.com/4/43'
    assert page.locator('#qa-current-site-source-note .gn-verse-source-excerpt').count() == 1
    assert link.evaluate("e=>e.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}))")
    # On the actual reader route, both restored notes must open from §1.
    page.goto(f'http://127.0.0.1:{port}/daruri/#section=1', wait_until='domcontentloaded', timeout=90000)
    page.locator('#reader [data-gn-notes-open]').first.click(timeout=30000)
    for identifier in ('QUR-R001-Q049','QUR-R001-Q050'):
        quote=page.locator(f'.gn-note-entry[data-note-id="{identifier}"] .gn-verse-source-excerpt')
        assert quote.count()==1, f'Missing qualified source panel {identifier}'
        assert 'possible verbal allusion' in quote.inner_text()
        assert 'not a quotation' in quote.inner_text()
    assert page.locator('.gn-note-entry[data-note-id="QUR-R001-Q051"]').count()==0
    assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
    page.screenshot(path=str(REPORT / f'live-section1-{engine}-390.png'),full_page=True)
    ctx.close()
    return {'full_site_loaded':engine,'section1_two_qualified_parallels':True,
            'section1_33_40_withheld':True,'dynamic_source_link_present':True}

def main():
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),QuietHTTP)
    threading.Thread(target=server.serve_forever,daemon=True).start()
    out=[]
    try:
        with sync_playwright() as p:
            for name in ['webkit','chromium']:
                browser=getattr(p,name).launch(headless=True)
                try:
                    for width,mobile in [(1280,False),(390,True),(320,True)]:
                        out.append(exercise(name,browser,width,mobile))
                    out.append(smoke_full_site(browser,server.server_port,name))
                finally: browser.close()
    finally: server.shutdown()
    (REPORT/'results.json').write_text(json.dumps(out,indent=2,ensure_ascii=False))
    print(json.dumps(out,ensure_ascii=False,indent=2))
    print('PASS — WebKit and Chromium simulation; physical iOS context menu not testable by Playwright.')

if __name__=='__main__': main()
