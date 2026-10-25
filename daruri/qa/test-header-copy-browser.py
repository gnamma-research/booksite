#!/usr/bin/env python3
"""Real-rendered Darūrī header and Copy split-button regression (Chromium/WebKit).
Run from the repository root after Playwright browsers are installed.
No production data, preferences or PDF artefacts are modified.
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
import base64
import io
import re
import sys
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
SITE=ROOT/'daruri'
URL=None  # Set to localhost HTTP server in __main__, not file:// (WebKit CORS)
SIZES=[320,375,390,768,860,1280]

def check_mosaic():
    css=(SITE/'headerless-navigation.css').read_text()
    png=base64.b64decode(re.search(r'data:image/png;base64,([A-Za-z0-9+/=]+)',css).group(1))
    im=Image.open(io.BytesIO(png)).convert('RGBA')
    magenta=[p for p in im.getdata() if p[0]==255 and p[1]==0 and p[2]==255]
    assert not any(p[3]!=0 for p in magenta), 'Visible magenta transparency key in tile'
    print('PASS tile: magenta transparent, retained artwork', im.size)

def visible_loc(page, selector):
    page.locator(selector).first.wait_for(state='visible',timeout=30000)
    box=page.locator(selector).first.bounding_box()
    assert box and box['width']>0, (selector,box)
    return box

def not_overlapping(a,b,label):
    assert b['x']>=a['x']+a['width']+1, (label,a,b)
    assert abs((a['y']+a['height']/2)-(b['y']+b['height']/2))<=4, (label,a,b)

def run_case(browser, engine, width):
    mobile=width<=430
    ctx=browser.new_context(viewport={'width':width,'height':850},device_scale_factor=2,is_mobile=mobile,has_touch=mobile)
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(URL+'#home',wait_until='load',timeout=90000)
    page.wait_for_function("document.body.classList.contains('reader-enhanced')",timeout=50000)
    logo=visible_loc(page,'#menuBtn.gn-top-tile')
    home=visible_loc(page,'#gnTopHome')
    read=visible_loc(page,'#gnTopRead')
    not_overlapping(logo,home,'mosaic / Home')
    not_overlapping(home,read,'Home / Read')
    assert not page.locator('#globalViewLabel').is_visible(), 'Duplicate Home caption'
    assert page.locator('#gnTopRead svg path').count(), 'Read needs its distinct arrow icon'
    assert page.locator('#gnTopHome svg path').count(), 'Home needs its own icon'

    page.goto(URL+'#section=64',wait_until='load',timeout=90000)
    page.wait_for_function("document.body.classList.contains('reading-active') && document.querySelector('#readerCopyOptions') !== null",timeout=50000)
    assert not page.locator('#gnTopRead').is_visible(), 'Redundant Read in reading mode'
    if width<=620:
        assert not page.locator('#gnTopHome').is_visible(), 'Mobile toolbar must stay compact'
        visible_loc(page,'#gnReaderMobileHome')
    else:
        visible_loc(page,'#gnTopHome')
        assert not page.locator('#gnReaderMobileHome').is_visible()
    parent=visible_loc(page,'.gn-copy-wrapper')
    primary=visible_loc(page,'#readerCopyAction')
    arrow=visible_loc(page,'#readerCopyOptions')
    assert abs(primary['x']+primary['width']-arrow['x'])<=2, ('Detached copy arrow',primary,arrow)
    assert abs(primary['y']-arrow['y'])<=3 and abs(primary['height']-arrow['height'])<=3, ('Vertical misalignment',primary,arrow)
    assert parent['x']<=primary['x']+1 and parent['x']+parent['width']>=arrow['x']+arrow['width']-1, 'Copy is not one split control'
    assert page.locator('#readerCopyAction svg').count()>0 and page.locator('#focusToolbar svg').count()>0
    assert page.locator('#readerCopyOptions').get_attribute('aria-label')=='Copy options'
    page.locator('#readerCopyOptions').click()
    page.locator('.gn-copy-menu').wait_for(state='visible')
    menu=page.locator('.gn-copy-menu').bounding_box()
    assert menu['x']>=-2 and menu['x']+menu['width']<=width+2, ('Menu out of viewport',width,menu)
    # Each menu choice has its own silhouette, not the old ▧ / ▤ / ▥ glyphs.
    icons={}
    for kind in ('text','notes','research'):
        item=page.locator('[data-gn-menu="'+kind+'"]')
        glyph=item.locator('[data-gn-icon="'+kind+'"]')
        assert glyph.count()==1 and glyph.get_attribute('aria-hidden')=='true', (engine,width,kind,'accessible label missing')
        size=glyph.bounding_box()
        assert size and abs(size['width']-22)<=1 and abs(size['height']-22)<=1, (engine,width,kind,size)
        icons[kind]=glyph.inner_html()
    assert len(set(icons.values()))==3, ('Icons are duplicates',icons)
    assert page.locator('[data-gn-menu="text"] .gn-copy-type-mark').inner_text()=='Aa'
    assert page.locator('[data-gn-menu="notes"] .gn-copy-symbol path').count()==3
    assert page.locator('[data-gn-menu="notes"] .gn-copy-symbol rect').count()==0, 'Notes must be a speech bubble, not another box'
    assert page.locator('[data-gn-menu="research"] .gn-copy-symbol rect').count()==1
    assert page.locator('[data-gn-menu="research"] .gn-copy-symbol path').count()>=3
    # Markup alone doesn't establish visual distinction. Compare the rendered
    # 22px icon tiles in the current browser, including mobile WebKit.
    bitmaps={}
    for kind in ('text','notes','research'):
        image_bytes=page.locator('[data-gn-icon="'+kind+'"]').screenshot()
        bitmaps[kind]=Image.open(io.BytesIO(image_bytes)).convert('RGB').resize((44,44))
    for i,kind in enumerate(bitmaps):
        for other in list(bitmaps)[i+1:]:
            differences=sum(
                1 for p,q in zip(bitmaps[kind].getdata(),bitmaps[other].getdata())
                if max(abs(p[c]-q[c]) for c in range(3))>=45
            )
            assert differences>=100, (engine,width,'Copy icons visually too similar',kind,other,differences)

    assert not page.locator('[data-gn-menu="selected"]').count(), 'Selected text shown with no selection'
    if width in (390,1280) and engine=='chromium':
        page.screenshot(path=str(Path('/tmp')/f'daruri-copy-icons-{engine}-{width}.png'))
    for kind in ('text','notes','research'):
        if kind!='text':
            page.locator('#readerCopyOptions').click()
            page.locator('.gn-copy-menu').wait_for(state='visible')
        page.locator('[data-gn-menu="'+kind+'"]').click()
        page.locator('.gn-copy-sheet').wait_for(state='visible')
        page.locator('[data-gn-copy-close]').first.click()
    # At desktop widths the Contents pane starts open; the first click
    # therefore CLOSES it. On phones the first click OPENS it.
    # Test the state transition, not a hard-coded initial open state.
    before=page.locator('#menuBtn.gn-top-tile').get_attribute('aria-expanded')
    page.locator('#menuBtn.gn-top-tile').click()
    after=page.locator('#menuBtn.gn-top-tile').get_attribute('aria-expanded')
    assert before in ('true','false') and after in ('true','false') and before!=after, ('Contents did not toggle',width,before,after)
    if after=='true':
        assert page.locator('#leftNav').is_visible(), ('Open Contents hidden',width)
    else:
        assert not page.locator('#leftNav').is_visible(), ('Closed Contents remains visible',width)
    docw=page.evaluate('document.documentElement.scrollWidth')
    assert docw<=width+6, ('Document overflows screen',width,docw)
    if width in (390,1280):
        # Immersive modes cannot strand a reader behind hidden navigation.
        page.evaluate("window.GnammaReaderModes.setMode('focus')")
        visible_loc(page,'#gnReaderEscape')
        assert not page.locator('#menuBtn').is_visible(), 'Immersive mode should suppress Contents'
        page.locator('#gnExitFocus').click()
        page.wait_for_function("!document.body.classList.contains('focus-mode')")
        visible_loc(page,'#menuBtn.gn-top-tile')
        assert page.evaluate("location.hash")=='#section=64', 'Exiting focus must not change section'
        page.evaluate("window.GnammaReaderModes.setMode('focus')")
        page.keyboard.press('Escape')
        page.wait_for_function("!document.body.classList.contains('focus-mode')")
        page.evaluate("window.GnammaReaderModes.setMode('continuous')")
        visible_loc(page,'#gnReaderEscape')
        page.locator('#gnFocusHome').click()
        page.wait_for_function("location.hash==='#home' && !document.body.classList.contains('reading-active')")
        visible_loc(page,'#gnTopHome')
    else:
        # Return Home with one action, never by going through the Contents pane.
        direct='#gnReaderMobileHome' if width<=620 else '#gnTopHome'
        page.locator(direct).click()
        page.wait_for_function("location.hash==='#home' && !document.body.classList.contains('reading-active')")
    assert not errors, (engine,width,errors[:4])
    if width in (320,390,860,1280) and engine=='chromium':
        page.screenshot(path=str(Path('/tmp')/f'daruri-header-{engine}-{width}.png'))
    print('PASS',engine,width,'Copy split px',round(primary['width']),'+',round(arrow['width']),'scrollWidth',docw)
    ctx.close()

if __name__=='__main__':
    check_mosaic()
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self,*args):
            pass
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(SITE)))
    Thread(target=server.serve_forever,daemon=True).start()
    URL=f'http://127.0.0.1:{server.server_address[1]}/index.html'
    try:
        with sync_playwright() as p:
            for name in ('chromium','webkit'):
                target=getattr(p,name)
                if name=='chromium':
                    browser=target.launch(headless=True,args=['--no-sandbox'])
                else:
                    browser=target.launch(headless=True)
                for width in SIZES:
                    run_case(browser,name,width)
                browser.close()
    finally:
        server.shutdown()
        server.server_close()
    print('PASS all Darūrī header/Copy browser cases')
