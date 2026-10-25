#!/usr/bin/env python3
"""QA: three-section dictionary, chronology, per-source full entries, desktop/mobile."""
import os
from pathlib import Path
from urllib.parse import quote
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('DARURI_QA_BASE', 'http://127.0.0.1:8123/daruri/')
ARTIFACTS = Path('/tmp/gnamma-full-dictionary-browser')
ARTIFACTS.mkdir(exist_ok=True, parents=True)


def source_integrity(host):
    expect(host.locator('.gn-ds-source')).to_have_count(2)
    expect(host.locator('.gn-ds-overview')).to_contain_text('2 attributed sources')
    expect(host.locator('.gn-ds-overview')).to_contain_text('1 complete article')
    expect(host.locator('.gn-ds-overview')).to_contain_text('1 selected short extract')
    fayyumi = host.locator('[data-gn-ds-source="F"]')
    munawi = host.locator('[data-gn-ds-source="M"]')
    expect(fayyumi.locator('.gn-ds-author')).to_contain_text('al-Fayyūmī')
    expect(munawi.locator('.gn-ds-author')).to_contain_text('al-Munāwī')
    expect(fayyumi.locator('.gn-ds-date')).to_contain_text('After Ibn Rushd')
    expect(munawi.locator('.gn-ds-date')).to_contain_text('After Ibn Rushd')
    assert fayyumi.locator('.gn-ds-extract').count() == 0
    assert munawi.locator('.gn-ds-full').count() == 0
    expect(munawi.locator('.gn-ds-extract')).to_contain_text('الأمر')
    assert fayyumi.locator('.gn-ds-preview .gn-ds-ar').count() == 1
    assert fayyumi.locator('.gn-ds-preview .gn-ds-en').count() == 1
    full = fayyumi.locator('.gn-ds-full')
    assert full.get_attribute('open') is None
    full.locator(':scope > summary').click()
    expect(full.locator('.gn-ds-full-body .gn-ds-ar')).to_have_count(1)
    assert 'utterance' in full.inner_text().lower()
    assert full.locator('.gn-ds-link').count() >= 1
    full.locator(':scope > summary').click()
    expect(full).not_to_have_attribute('open', '')
    assert host.locator('.gn-fd-toggle').count() == 0


def standalone(browser, width, height, label):
    page = browser.new_page(viewport={'width':width,'height':height})
    errors = []
    page.on('pageerror', lambda err:errors.append(str(err)))
    page.goto(BASE+'dictionary.html#view=all&term='+quote('ṣīgha'),
              wait_until='domcontentloaded')
    card=page.locator('#lexArticle .lex-card')
    card.wait_for(timeout=15000)
    expect(card).to_have_class('lex-card gn-ds-three-sections')
    assert card.locator('.dict-view-tabs').count() == 0
    assert card.locator('[data-dict-panel="meaning"]').is_visible()
    assert card.locator('[data-dict-panel="sources"]').is_visible()
    assert card.locator('[data-dict-panel="occurrences"]').is_visible()
    source_integrity(card.locator('[data-dict-panel="sources"]'))
    if width<600:
        size=card.evaluate('(e)=>({width:e.clientWidth,scroll:e.scrollWidth})')
        assert size['scroll']<=size['width']+12,size
    page.screenshot(path=str(ARTIFACTS/('unified-dictionary-'+label+'.png')),full_page=False)
    assert not any('dictionary' in e.lower() for e in errors),errors
    page.close()


def reader(browser,width,height,label):
    page=browser.new_page(viewport={'width':width,'height':height})
    errors=[]
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.goto(BASE+'index.html#glossary',wait_until='domcontentloaded')
    word=page.locator('#mainContent .glossary-card').filter(
        has=page.locator('h2',has_text='ṣīgha')).first
    word.wait_for(timeout=30000)
    word.locator('button.dictionary-entry-button').click()
    expect(page.locator('#infoOverlay')).to_be_visible()
    popup=page.locator('#detailContent')
    expect(popup.locator('#detailTitle')).to_have_text('ṣīgha')
    assert popup.locator('.lex-full-link,.lex-tabbar,#gnw-dictionary-search').count()==0
    expect(popup.locator('#lex-meaning .micro-label')).to_have_text('MEANING IN THE ḌARŪRĪ')
    expect(popup.locator('#lex-author h3')).to_have_text('Usage in the Ḍarūrī')
    expect(popup.locator('#lex-author .lex-authorial')).to_have_count(2)
    source_integrity(popup.locator('#lex-sources'))
    concordance=popup.locator('#lex-author .gn-fd-verified-forms')
    expect(concordance.locator(':scope > summary')).to_contain_text(
        '63 matching Arabic spellings across 37 sections')
    assert popup.locator('[data-gnw-search="morph-root"]').count()==0
    assert not any('dictionary' in e.lower() for e in errors),errors
    page.screenshot(path=str(ARTIFACTS/('unified-popup-'+label+'.png')),full_page=False)
    page.close()


def scholarly(browser):
    page=browser.new_page(viewport={'width':1280,'height':900})
    page.goto(BASE+'dictionary.html#view=all&term='+quote('ṣināʿa'),
              wait_until='domcontentloaded')
    card=page.locator('#lexArticle .lex-card')
    expect(card.locator('.gn-ds-source')).to_have_count(2)
    jurjani=card.locator('[data-gn-ds-source="J"]')
    expect(jurjani.locator('.gn-ds-date')).to_contain_text('After Ibn Rushd')
    full=jurjani.locator('.gn-ds-full')
    full.locator(':scope > summary').click()
    expect(full.locator('.gn-ds-note')).to_contain_text('ars and prudentia')
    page.close()


if __name__=='__main__':
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        standalone(browser,1365,850,'desktop')
        standalone(browser,390,844,'mobile')
        reader(browser,1365,900,'desktop')
        reader(browser,390,844,'mobile')
        scholarly(browser)
        browser.close()
    print('PASS: Unified three-section dictionary, per-source bilingual expansion, before/after chronology, accurate provenance and mobile layout.')
