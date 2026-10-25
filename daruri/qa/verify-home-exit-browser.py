#!/usr/bin/env python3
"""Daruri navigation acceptance: one Contents control, no floating Home,
quiet Focus, full Reading toolbar and unclipped mobile paragraph locators.
Tests the real static app in Chromium/WebKit; does not touch production.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
WIDTHS = (320, 375, 390, 620, 860, 1280)
FULL_ACTIONS = (
    '#menuBtn.gn-top-tile', '#focusToolbar', '#readerSaveAction',
    '#readerCopyAction', '#readerCopyOptions', '#readerShareAction',
    '#searchBtn', '#settingsBtn'
)

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def visible_box(page, selector, width, label='control'):
    locator = page.locator(selector).first
    locator.wait_for(state='visible', timeout=30000)
    rect = locator.bounding_box()
    assert rect and rect['width'] >= 18 and rect['height'] >= 32, (label, selector, rect)
    assert rect['x'] >= -1 and rect['x'] + rect['width'] <= width + 1, (
        label, selector, width, rect)
    return rect

def route(page, url, hash_value):
    page.goto(url + hash_value, wait_until='load', timeout=90000)
    page.wait_for_function("document.body.classList.contains('reader-enhanced')", timeout=50000)

def assert_no_floating_home(page):
    for selector in ('#gnReaderMobileHome', '#gnReaderEscape'):
        assert not page.locator(selector).is_visible(), selector + ' must never float over text'

def mode_icon(page):
    path = page.locator('#focusToolbar svg path').first
    path.wait_for(state='attached', timeout=10000)
    assert path.get_attribute('d') == 'M9 3H4v5M15 3h5v5M4 16v5h5M20 16v5h-5', (
        'Focus/Reading mode must have four corners, not a book')

def open_contents_from_focus(page, width, name):
    visible_box(page, '#menuBtn.gn-top-tile', width, name + ' Contents')
    page.locator('#menuBtn.gn-top-tile').click()
    page.wait_for_function("!document.body.classList.contains('focus-mode')", timeout=10000)
    page.wait_for_function(
        "document.querySelector('#menuBtn').getAttribute('aria-expanded')==='true'",
        timeout=10000)
    assert page.locator('#leftNav').is_visible(), name + ' Contents not visible'

def case(browser, engine, width, url):
    phone = width <= 620
    ctx = browser.new_context(viewport={'width': width, 'height': 850},
                              device_scale_factor=1, is_mobile=phone, has_touch=phone)
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    route(page, url, '#home')
    mosaic = visible_box(page, '#menuBtn.gn-top-tile', width)
    read = visible_box(page, '#gnTopRead', width)
    assert mosaic['x'] + mosaic['width'] <= read['x'], 'Contents and Read overlap'
    assert not page.locator('#gnTopHome').is_visible(), 'No Home-on-Home button'
    assert_no_floating_home(page)
    assert 'M12 5.5' in page.locator('#gnTopRead svg path').first.get_attribute('d')

    # Normal Reading keeps all actions, including both halves of Copy and
    # the settings/Visuals action, within the physical viewport.
    route(page, url, '#section=64')
    page.wait_for_function(
        "document.body.classList.contains('reading-active') && window.GnammaReaderModes")
    for selector in FULL_ACTIONS:
        visible_box(page, selector, width, 'Reading')
    mode_icon(page)
    assert not page.locator('#gnTopHome').is_visible(), 'No persistent Home in Reading'
    assert not page.locator('#gnTopRead').is_visible(), 'No redundant Read in Reading'
    assert_no_floating_home(page)

    if phone:
        number = page.locator('#reader .gn-paragraph-number').first
        number.wait_for(state='visible', timeout=15000)
        rect = number.bounding_box()
        assert rect and rect['x'] >= -1 and rect['x'] + rect['width'] <= width + 1, (
            'Ordinary paragraph marker clipped', width, rect)
        assert page.evaluate('document.documentElement.scrollWidth') <= width + 2, (
            'Horizontal document overflow', width)

    # The only Focus toolbar actions are Contents, AR/EN and mode selection.
    page.evaluate("window.GnammaReaderModes.setMode('focus')")
    page.wait_for_function("document.body.classList.contains('focus-mode')")
    visible_box(page, '#menuBtn.gn-top-tile', width, 'Focus Contents')
    visible_box(page, '#focusToolbar', width, 'Focus mode selector')
    for selector in ('#readerSaveAction', '#readerShareAction', '#searchBtn',
                     '#settingsBtn', '.gn-copy-wrapper'):
        assert not page.locator(selector).is_visible(), ('Focus should be quiet', selector)
    mode_icon(page)
    assert_no_floating_home(page)
    open_contents_from_focus(page, width, 'Focus')

    # Mobile Contents uses a backdrop; desktop Contents is a sidebar.
    # Close by the actually visible control, never force-click through an overlay.
    if page.locator('#drawerShade').is_visible():
        # The shade extends underneath the side panel in WebKit. A locator
        # centre-click could hit a nav row, not the visible outside strip.
        nav = page.locator('#leftNav').bounding_box()
        screen = page.viewport_size['width']
        if nav and nav['x'] + nav['width'] < screen - 7:
            page.mouse.click(screen - 4, 300)
        elif nav and nav['x'] > 7:
            page.mouse.click(4, 300)
        else:
            page.keyboard.press('Escape')
    else:
        page.locator('#menuBtn.gn-top-tile').click()
    page.wait_for_function(
        "document.querySelector('#menuBtn').getAttribute('aria-expanded')==='false'",
        timeout=10000)
    # Home remains one deliberate step away in the reading-mode chooser.
    page.locator('#focusToolbar').click()
    page.locator('#gn-reading-mode-picker').wait_for(state='visible')
    page.locator('#gn-mode-go-home').click()
    page.wait_for_function("location.hash==='#home'", timeout=10000)
    assert not page.locator('#gnTopHome').is_visible()

    route(page, url, '#section=64')
    page.wait_for_function("document.body.classList.contains('reading-active')")
    page.evaluate("window.GnammaReaderModes.setMode('continuous')")
    page.wait_for_function("document.body.classList.contains('focus-level-3')", timeout=10000)
    mode_icon(page)
    assert_no_floating_home(page)
    open_contents_from_focus(page, width, 'Continuous')

    # One global Contents opener must remain on non-reading reference routes.
    for destination in ('#index', '#glossary', '#study'):
        route(page, url, destination)
        visible_box(page, '#menuBtn.gn-top-tile', width, destination)
        visible_box(page, '#gnTopRead', width, destination + ' return to reading')
        assert_no_floating_home(page)
    assert not errors, (engine, width, errors[:5])
    if engine == 'chromium':
        page.screenshot(path=f'/tmp/daruri-nav-home-{width}.png')
    print('PASS', engine, width, 'Home/Reading/Focus/Continuous/reference menus')
    ctx.close()

if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 0),
                                 partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_address[1]}/index.html'
    try:
        with sync_playwright() as p:
            for engine in ('chromium', 'webkit'):
                browser = getattr(p, engine).launch(
                    headless=True, args=['--no-sandbox'] if engine == 'chromium' else [])
                for width in WIDTHS:
                    case(browser, engine, width, url)
                browser.close()
    finally:
        server.shutdown()
        server.server_close()
    print('PASS 12 browser/width navigation cases')
