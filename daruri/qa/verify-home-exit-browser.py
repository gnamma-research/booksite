#!/usr/bin/env python3
"""Focused Gnamma Daruri Home/reading/focus navigation regression in real browsers."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
WIDTHS = (375, 860, 1280)

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def box(page, selector):
    el=page.locator(selector).first
    el.wait_for(state='visible',timeout=30000)
    rect=el.bounding_box()
    assert rect and rect['width']>=28 and rect['height']>=28, (selector,rect)
    return rect

def assert_gap(a,b,label):
    assert b['x'] >= a['x']+a['width'], (label,a,b)
    assert abs((a['y']+a['height']/2)-(b['y']+b['height']/2))<=5,(label,a,b)

def case(browser,engine,width,url):
    phone=width<=620
    ctx=browser.new_context(viewport={'width':width,'height':850},device_scale_factor=1,
                            is_mobile=phone,has_touch=phone)
    page=ctx.new_page()
    page.goto(url+'#home',wait_until='load',timeout=90000)
    page.wait_for_function("document.body.classList.contains('reader-enhanced')")
    logo=box(page,'#menuBtn.gn-top-tile')
    home=box(page,'#gnTopHome')
    read=box(page,'#gnTopRead')
    assert_gap(logo,home,'mosaic and Home overlap')
    assert_gap(home,read,'Home and Read overlap')
    assert 'M12 5.5' in page.locator('#gnTopRead svg path').first.get_attribute('d'), 'Read must display the open-book symbol'
    assert not page.locator('#globalViewLabel').is_visible(), 'Duplicate Home caption'
    if width>=941:
        # The labels must be entirely inside their own buttons.
        for sel in ('#gnTopHome','#gnTopRead'):
            target=box(page,sel)
            label=box(page,sel+' span')
            assert label['x']>=target['x'] and label['x']+label['width']<=target['x']+target['width'],(sel,target,label)
    if engine=='chromium':
        page.screenshot(path=f'/tmp/daruri-nav-home-{width}.png')
    page.goto(url+'#section=64',wait_until='load',timeout=90000)
    page.wait_for_function("document.body.classList.contains('reading-active')")
    direct='#gnReaderMobileHome' if phone else '#gnTopHome'
    box(page,direct)
    assert not page.locator('#gnTopRead').is_visible(), 'Read is redundant within reader'
    # Home never requires opening the Contents drawer.
    page.locator(direct).click()
    page.wait_for_function("location.hash==='#home'")
    page.goto(url+'#section=64',wait_until='load',timeout=90000)
    page.wait_for_function("document.body.classList.contains('reading-active') && window.GnammaReaderModes")
    # The reading-mode selector must NEVER become the same open-book icon as Read.
    def verify_mode_trigger(expected):
        icon=page.locator('#focusToolbar svg[data-gn-reading-mode-trigger] path')
        icon.wait_for(state='attached',timeout=10000)
        assert icon.get_attribute('d')=='M9 3H4v5M15 3h5v5M4 16v5h5M20 16v5h-5', (
            engine,width,expected,'reading mode icon is not four corners')
        assert page.locator('#focusToolbar svg use').count()==0, (
            engine,width,expected,'old dynamic book icon is still used')
    verify_mode_trigger('reading')
    page.evaluate("window.GnammaReaderModes.setMode('focus')")
    page.wait_for_function("document.body.classList.contains('focus-mode')")
    verify_mode_trigger('focus')
    box(page,'#gnExitFocus')
    box(page,'#gnFocusHome')
    page.locator('#gnExitFocus').click()
    page.wait_for_function("!document.body.classList.contains('focus-mode')")
    assert page.evaluate("location.hash")=='#section=64','Exit must preserve section'
    page.evaluate("window.GnammaReaderModes.setMode('focus')")
    page.wait_for_function("document.body.classList.contains('focus-mode')")
    page.keyboard.press('Escape')
    page.wait_for_function("!document.body.classList.contains('focus-mode')")
    page.evaluate("window.GnammaReaderModes.setMode('continuous')")
    page.wait_for_function("document.body.classList.contains('focus-level-3')")
    verify_mode_trigger('continuous')
    box(page,'#gnReaderEscape')
    page.locator('#gnFocusHome').click()
    page.wait_for_function("location.hash==='#home' && !document.body.classList.contains('reading-active')")
    print('PASS',engine,width,'header, direct Home, Exit Focus, Escape, Continuous Home')
    ctx.close()

if __name__=='__main__':
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    url=f'http://127.0.0.1:{server.server_address[1]}/index.html'
    try:
        with sync_playwright() as p:
            for engine in ('chromium','webkit'):
                browser=getattr(p,engine).launch(headless=True,args=['--no-sandbox'] if engine=='chromium' else [])
                for width in WIDTHS:
                    case(browser,engine,width,url)
                browser.close()
    finally:
        server.shutdown()
        server.server_close()
    print('PASS all Home/Focus navigation browser cases')
