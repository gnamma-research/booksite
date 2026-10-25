#!/usr/bin/env python3
"""Exercise the real Daruri full dictionary UI in desktop and mobile Chromium."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('DARURI_QA_BASE', 'http://127.0.0.1:8123/daruri/')
ARTIFACTS = Path('/tmp/gnamma-full-dictionary-browser')
ARTIFACTS.mkdir(exist_ok=True, parents=True)


def check_dictionary(browser, width, height, label):
    page = browser.new_page(viewport={'width': width, 'height': height})
    errors = []
    page.on('pageerror', lambda err: errors.append(str(err)))
    page.goto(BASE + 'dictionary.html#view=meaning&term=' + '%E1%B9%A3in%C4%81%CA%BFa',
              wait_until='domcontentloaded')
    page.locator('#lexArticle .lex-card').wait_for(timeout=15000)
    meaning = page.locator('#lexArticle [data-dict-panel="meaning"]')
    assert 'not the manufacture of divine law' in meaning.inner_text()
    details = meaning.locator('details.gn-fd-toggle')
    details.wait_for(timeout=12000)
    assert details.get_attribute('open') is None
    details.locator(':scope > summary').click()
    details.locator('.gn-fd-article').first.wait_for(timeout=15000)
    assert details.locator('.gn-fd-ar').count() >= 1
    assert details.locator('.gn-fd-en').count() >= 1
    assert 'al-Jurjānī' in details.inner_text()
    assert 'Editorial explanation' in details.inner_text()
    assert 'ars and prudentia' in details.inner_text()
    assert details.locator('a[target="_blank"]').count() > 0
    assert not any('full-dictionary' in error.lower() for error in errors), errors
    if width < 600:
        size = details.evaluate('(e)=>({width:e.clientWidth,scroll:e.scrollWidth})')
        assert size['scroll'] <= size['width'] + 12, size
    page.screenshot(path=str(ARTIFACTS / ('dictionary-' + label + '.png')), full_page=False)
    details.locator(':scope > summary').click()
    assert details.get_attribute('open') is None
    assert 'Show full historical dictionary' in details.locator(':scope > summary').inner_text()
    page.close()


def check_reader(browser):
    page = browser.new_page(viewport={'width': 1200, 'height': 850})
    errors = []
    page.on('pageerror', lambda err: errors.append(str(err)))
    page.goto(BASE + 'index.html#glossary', wait_until='domcontentloaded')
    page.locator('#mainContent .glossary-card').first.wait_for(timeout=30000)
    card = page.locator('#mainContent .glossary-card').filter(has=page.locator('h2', has_text='ṣināʿa')).first
    card.wait_for(timeout=12000)
    assert 'not the manufacture of divine law' in card.inner_text()
    full = card.locator('details.gn-fd-toggle')
    full.wait_for(timeout=12000)
    full.locator(':scope > summary').click()
    full.locator('.gn-fd-article').first.wait_for(timeout=12000)
    assert 'al-Jurjānī' in full.inner_text()
    assert full.locator('.gn-fd-parallel').count() >= 1
    assert not any('full-dictionary' in e.lower() for e in errors), errors
    page.screenshot(path=str(ARTIFACTS / 'reader-glossary-desktop.png'), full_page=False)
    page.close()


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        check_dictionary(browser, 1365, 850, 'desktop')
        check_dictionary(browser, 390, 844, 'mobile')
        check_reader(browser)
        browser.close()
    print('PASS: Desktop/mobile standalone dictionary and reader glossary show complete historical entries, translations, citations and editorial note on demand.')
