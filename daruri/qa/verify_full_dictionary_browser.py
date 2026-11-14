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
    expect(fayyumi.locator(':scope > .gn-ds-source-disclosure')).not_to_have_attribute('open','')
    expect(host.locator('.gn-ds-source-disclosure')).to_have_count(2)
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
    fayyumi.locator(':scope > .gn-ds-source-disclosure > summary').click()
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
    assert page.locator('#infoOverlay.gn-ds-dictionary-open').count()==1
    sizes=popup.evaluate('''el=>({ownScroll:getComputedStyle(el).overflowY,dialogScroll:getComputedStyle(el.closest(".detail-dialog")).overflowY,overflow:el.scrollWidth-el.clientWidth})''')
    assert sizes['ownScroll']=='auto' and sizes['dialogScroll']=='hidden' and sizes['overflow']<=4, sizes
    expect(popup.locator('#lex-meaning .micro-label')).to_have_text('MEANING IN THE ḌARŪRĪ')
    expect(popup.locator('#lex-author h3')).to_have_text('Usage in the Ḍarūrī')
    expect(popup.locator('#lex-author .lex-authorial')).to_have_count(2)
    nav=popup.locator('.gn-ds-popup-nav')
    expect(nav.locator('[data-gn-ds-jump]')).to_have_count(3)
    expect(nav.locator('[data-dictionary-atlas]')).to_have_attribute('href','dictionary.html#term='+quote('ṣīgha'))
    popup.locator('.gn-ds-expand-all').click()
    assert popup.locator('#lex-sources .gn-ds-source-disclosure[open]').count()==2
    popup.locator('.gn-ds-expand-all').click()
    assert popup.locator('#lex-sources .gn-ds-source-disclosure[open]').count()==0
    source_integrity(popup.locator('#lex-sources'))
    popup.locator('.gn-ds-popup-nav [data-gn-ds-jump="lex-author"]').click()
    assert popup.evaluate('(e)=>e.scrollTop')>0
    popup.locator('.gn-ds-popup-nav [data-gn-ds-jump="lex-meaning"]').click()
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
    jurjani.locator(':scope > .gn-ds-source-disclosure > summary').click()
    full=jurjani.locator('.gn-ds-full')
    full.locator(':scope > summary').click()
    expect(full.locator('.gn-ds-note')).to_contain_text('ars and prudentia')
    page.close()



def responsive_icons_and_colours(browser, width, height, label):
    """Check the CURRENT Downloads interface (gn-es), not its hidden legacy gn-editions view."""
    page=browser.new_page(viewport={'width':width,'height':height}, reduced_motion='reduce')
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    try:
        page.goto(BASE+'index.html#editions',wait_until='domcontentloaded',timeout=60000)
        tabs=page.locator('#mainContent .gn-es .gn-es-download-type')
        expect(tabs).to_have_count(4,timeout=30000)
        expect(tabs.first).to_be_visible()
        expect(page.locator('#leftNav .primary-nav [data-route="editions"] svg.icon use')).to_have_attribute('href','#i-editions')
        assert page.locator('symbol#i-editions').count()==1
        seen={}
        for theme,palette in [('light','default'),('dark','default'),('light','almohad'),('dark','gnamma'),('dark','nasrid'),('light','zellij')]:
            page.evaluate('''({theme,palette})=>{
                document.documentElement.dataset.theme=theme;
                document.documentElement.dataset.palette=palette;
            }''',{'theme':theme,'palette':palette})
            metrics=page.evaluate('''()=>{
                const root=document.documentElement;
                const css=e=>getComputedStyle(e);
                const nav=[...document.querySelectorAll('#leftNav .primary-nav>.nav-item')];
                const editions=nav.find(e=>e.dataset.route==='editions');
                const editionIcon=editions.querySelector('svg.icon');
                const navIcons=nav.map(e=>{
                    const svg=e.querySelector('svg.icon');if(!svg)return null;
                    const style=css(svg),rect=svg.getBoundingClientRect(),parent=e.getBoundingClientRect();
                    return {route:e.dataset.route,w:parseFloat(style.width),h:parseFloat(style.height),
                        color:style.color,stroke:style.stroke,visible:rect.width>0,
                        delta:Math.abs(rect.top+rect.height/2-parent.top-parent.height/2)};
                }).filter(Boolean);
                const types=[...document.querySelectorAll('#mainContent .gn-es .gn-es-download-type')].map(btn=>{
                    const glyph=btn.querySelector('svg'),style=css(glyph),rect=glyph.getBoundingClientRect();
                    const parent=btn.getBoundingClientRect();
                    return {type:btn.dataset.esDownloadType,w:parseFloat(style.width),h:parseFloat(style.height),
                        stroke:glyph.getAttribute('stroke'),color:style.color,
                        buttonColor:css(btn).color,
                        selected:btn.getAttribute('aria-selected')==='true',
                        height:parent.height,delta:Math.abs(rect.top+rect.height/2-parent.top-parent.height/2)};
                });
                return {accent:css(root).getPropertyValue('--accent').trim(),
                    text:css(root).getPropertyValue('--text').trim(),
                    muted:css(root).getPropertyValue('--muted').trim(),
                    overflow:document.documentElement.scrollWidth-window.innerWidth,
                    navColor:css(editionIcon).color, navParent:css(editions).color,
                    navIcons, types};
            }''')
            seen[(theme,palette)]=metrics['accent']
            assert metrics['accent'] and metrics['text'] and metrics['muted'],(label,theme,palette,metrics)
            assert metrics['overflow']<=6,(label,theme,palette,'unexpected horizontal page overflow',metrics['overflow'])
            assert metrics['navColor']==metrics['navParent'],(label,theme,palette,'navigation icon fails to inherit palette',metrics)
            assert all(17<=item['w']<=19 and 17<=item['h']<=19 for item in metrics['navIcons']), (label,theme,palette,'navigation icon size',metrics['navIcons'])
            assert all(item['delta']<=3 for item in metrics['navIcons'] if item['visible']),(label,theme,palette,'navigation icon vertical misalignment',metrics['navIcons'])
            assert len(metrics['types'])==4,(label,theme,palette,'missing download types',metrics['types'])
            expected=18 if width<=450 else 21
            assert all(abs(item['w']-expected)<=1 and abs(item['h']-expected)<=1
                for item in metrics['types']),(label,theme,palette,'download icon sizes',metrics['types'])
            assert all(item['stroke']=='currentColor' and item['color'] not in ('transparent','rgba(0, 0, 0, 0)')
                for item in metrics['types']),(label,theme,palette,'SVG stroke or theme paint',metrics['types'])
            assert all(item['height']>=44 and item['delta']<=3 for item in metrics['types']),(label,theme,palette,'download icon vertical alignment',metrics['types'])
            assert all(item['color']==item['buttonColor'] for item in metrics['types'] if item['selected']), (label,theme,palette,'selected icon contrast does not match theme',metrics['types'])
            if theme=='dark' and palette=='gnamma':
                page.screenshot(path=str(ARTIFACTS/('icons-'+label+'-dark.png')),full_page=False)
            if theme=='light' and palette=='default':
                page.screenshot(path=str(ARTIFACTS/('icons-'+label+'-light.png')),full_page=False)
        assert len(set(seen.values()))>=3,(label,'palette colours did not change',seen)
        for kind in ('guide','offline','source','book'):
            tab=page.locator('#mainContent .gn-es [data-es-download-type="'+kind+'"]')
            tab.click(timeout=15000)
            expect(tab).to_have_attribute('aria-selected','true')
            expect(page.locator('#mainContent .gn-es [data-es-type-panel="'+kind+'"]')).to_be_visible()
        assert not any('edition' in err.lower() or 'dictionary' in err.lower() for err in errors),(label,errors)
    finally:
        page.close()

if __name__=='__main__':
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        standalone(browser,1365,850,'desktop')
        standalone(browser,390,844,'mobile')
        reader(browser,1365,900,'desktop')
        reader(browser,390,844,'mobile')
        reader(browser,844,390,'landscape')
        scholarly(browser)
        for width,height,label in [(1365,850,'desktop'),(390,844,'portrait'),(844,390,'landscape'),(768,1024,'tablet')]:
            responsive_icons_and_colours(browser,width,height,label)
        browser.close()
    print('PASS: Unified dictionary, compact expandable sources, preserved Arabic/English evidence, one-scroller navigation, responsive Editions/nav icons, palette colour inheritance across 4 viewports and 6 themes.')
