#!/usr/bin/env python3
"""Browser QA: complete dictionary source distinction, accurate counts, and safe actions."""
import os
from pathlib import Path
from urllib.parse import quote
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('DARURI_QA_BASE', 'http://127.0.0.1:8123/daruri/')
ARTIFACTS = Path('/tmp/gnamma-full-dictionary-browser')
ARTIFACTS.mkdir(exist_ok=True, parents=True)


def check_standalone(browser, width, height, label):
    page = browser.new_page(viewport={'width': width, 'height': height})
    errors = []
    page.on('pageerror', lambda err: errors.append(str(err)))
    page.goto(BASE + 'dictionary.html#view=all&term=' + quote('ṣināʿa'),
              wait_until='domcontentloaded')
    entry = page.locator('#lexArticle .lex-card')
    entry.wait_for(timeout=15000)
    meaning = entry.locator('[data-dict-panel="meaning"]')
    assert 'not the manufacture of divine law' in meaning.inner_text()
    full = entry.locator('[data-dict-panel="sources"] > details.gn-fd-toggle')
    full.wait_for(timeout=12000)
    assert meaning.locator('.gn-fd-toggle').count() == 0, 'No duplicate full-text expander'
    expect(entry.locator('[data-gn-fd-full-count]')).to_contain_text('1 complete selected historical article')
    assert full.get_attribute('open') is None
    full.locator(':scope > summary').click()
    full.locator('.gn-fd-article').first.wait_for(timeout=15000)
    assert full.locator('.gn-fd-ar').count() >= 1
    assert full.locator('.gn-fd-en').count() >= 1
    assert 'al-Jurjānī' in full.inner_text()
    assert 'Editorial explanation' in full.inner_text()
    assert 'ars and prudentia' in full.inner_text()
    assert full.locator('a[target="_blank"]').count() > 0
    assert not any('full-dictionary' in error.lower() for error in errors), errors
    if width < 600:
        size = full.evaluate('(e)=>({width:e.clientWidth,scroll:e.scrollWidth})')
        assert size['scroll'] <= size['width'] + 12, size
    page.screenshot(path=str(ARTIFACTS / ('dictionary-' + label + '.png')), full_page=False)
    full.locator(':scope > summary').click()
    expect(full.locator(':scope > summary')).to_contain_text('Show complete article')
    page.close()


def check_glossary(browser):
    page = browser.new_page(viewport={'width': 1200, 'height': 850})
    errors = []
    page.on('pageerror', lambda err: errors.append(str(err)))
    page.goto(BASE + 'index.html#glossary', wait_until='domcontentloaded')
    page.locator('#mainContent .glossary-card').first.wait_for(timeout=30000)
    card = page.locator('#mainContent .glossary-card').filter(
        has=page.locator('h2', has_text='ṣināʿa')).first
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


def check_sigha_popup(browser, width, height, label):
    page = browser.new_page(viewport={'width':width, 'height':height})
    errors = []
    page.on('pageerror', lambda err:errors.append(str(err)))
    page.goto(BASE + 'index.html#glossary', wait_until='domcontentloaded')
    word = page.locator('#mainContent .glossary-card').filter(
        has=page.locator('h2', has_text='ṣīgha')).first
    word.wait_for(timeout=30000)
    word.locator('button.dictionary-entry-button').click()
    popup = page.locator('#detailContent')
    expect(page.locator('#infoOverlay')).to_be_visible()
    expect(popup.locator('#detailTitle')).to_have_text('ṣīgha')
    assert popup.locator('.lex-full-link').count() == 0, 'Redundant historical-sources modal must disappear'
    assert popup.locator('#gnw-dictionary-search').count() == 0, 'Misleading duplicate action panel must disappear'
    assert popup.locator('[data-gnw-search="morph-lemma"],[data-gnw-search="morph-root"]').count() == 0
    expect(popup.locator('[data-lexjump="lex-sources"]')).to_contain_text('1 complete article')
    expect(popup.locator('[data-lexjump="lex-sources"]')).to_contain_text('1 short extract')
    expect(popup.locator('[data-lexjump="lex-author"]')).to_contain_text('2 examples')
    expect(popup.locator('#lex-sources .gn-fd-specific')).to_contain_text('command')
    assert popup.locator('#lex-author .lex-authorial').count() == 2
    short = popup.locator('#lex-sources .dictionary-source').first
    assert 'al-Munāwī' in short.inner_text()
    assert 'الأمر' in short.inner_text()
    full = popup.locator('#lex-sources > details.gn-fd-toggle')
    full.wait_for(timeout=10000)
    expect(full.locator(':scope > summary')).to_contain_text('al-Fayyūmī')
    assert popup.locator('#lex-sources .gn-fd-toggle').count() == 1
    full.locator(':scope > summary').click()
    full.locator('.gn-fd-article').first.wait_for(timeout=12000)
    assert 'al-Fayyūmī' in full.inner_text()
    assert 'صوغ' in full.inner_text()
    assert 'the form of the utterance' in full.inner_text().lower() or \
           'the ṣīgha of the utterance' in full.inner_text().lower()
    expect(popup.locator('a.gn-fd-page-link')).to_contain_text('full-page dictionary')
    assert not any('full-dictionary' in e.lower() for e in errors), errors
    morph = popup.locator('#lex-author .gn-fd-morph-actions')
    morph.wait_for(timeout=20000)
    expect(morph).to_contain_text('63 indexed occurrences in 37 sections')
    assert morph.locator('[data-gn-fd-morph="morph-root"]').count() == 0, 'No distinct indexed root relative'
    forms = morph.locator('[data-gn-fd-morph="morph-lemma"]')
    expect(forms).to_have_count(1)
    page.screenshot(path=str(ARTIFACTS / ('popup-sigha-' + label + '.png')), full_page=False)
    forms.click()
    page.wait_for_function("window.GnammaUnifiedSearch?.getState?.().mode === 'morph-lemma'", timeout=12000)
    found = page.evaluate("""() => {
      const result=window.GnammaUnifiedSearch.query('صيغة',
        {mode:'morph-lemma',scope:'work',facet:'text'});
      return {paragraphs:result.total,
        occurrences:result.results.reduce((n,r)=>n+(r.matched?.occurrences?.length||0),0),
        sections:new Set(result.results.map(r=>r.section)).size};
    }""")
    assert found['paragraphs'] == 46, found
    assert found['occurrences'] == 63, found
    assert found['sections'] == 37, found
    page.close()


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        check_standalone(browser, 1365, 850, 'desktop')
        check_standalone(browser, 390, 844, 'mobile')
        check_glossary(browser)
        check_sigha_popup(browser, 1365, 900, 'desktop')
        check_sigha_popup(browser, 390, 844, 'mobile')
        browser.close()
    print('PASS: Source distinction, correct full/short counts, accessible expansion, no dead morphology controls, desktop and mobile dictionary views.')
