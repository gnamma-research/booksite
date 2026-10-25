#!/usr/bin/env python3
"""Real-browser regression: source-aligned English Arabic dictionary links.

Run in a checkout with a local server:
  python -m http.server 8124
  DARURI_QA_BASE=http://127.0.0.1:8124/daruri/ python daruri/qa/verify_bilingual_lexicon_browser.py
"""
import json
import os
from playwright.sync_api import sync_playwright, expect

BASE=os.environ.get('DARURI_QA_BASE','http://127.0.0.1:8124/daruri/')

CHECK_PASSAGES=r"""() => {
 const edition=JSON.parse(document.querySelector('#editionData').textContent);
 const match=location.hash.match(/section=(\d+|colophon)/);
 const sec=edition.sections.find(x=>String(x.id)===String(match?.[1]||'1'));
 if(!sec)throw Error('No edition source section');
 const grids=[...document.querySelectorAll('#reader .passage-grid')];
 return grids.map((g,i)=>{
   const en=g.querySelector('.passage-en'),ar=g.querySelector('.passage-ar');
   const arLinks=[...ar.querySelectorAll('.inline-term[data-term]')].map(x=>x.dataset.term);
   const enLinks=[...en.querySelectorAll('.gn-en-lex-term[data-term]')].map(x=>x.dataset.term);
   const clean=en.cloneNode(true);
   clean.querySelectorAll('.gn-en-lex-parenthesis,.gn-en-lex-tail,.note-ref-symbol,.gn-note-en-section-list').forEach(x=>x.remove());
   const appended=en.querySelectorAll('.gn-en-lex-tail').length;
   const annotated=[...en.querySelectorAll('.gn-en-lex-term')].every(b=>
      b.tagName==='BUTTON'&&b.getAttribute('lang')==='ar'&&b.getAttribute('dir')==='rtl');
   const duplicate=enLinks.filter((x,j)=>enLinks.indexOf(x)!==j);
   const source=sec.segments[i].en,cleaned=clean.textContent;
   let mismatch=0;while(mismatch<source.length&&source[mismatch]===cleaned[mismatch])mismatch++;
   return {
    i,actual_ar:arLinks,actual_en:enLinks,
    missing:arLinks.filter(x=>!enLinks.includes(x)),
    unexpected:enLinks.filter(x=>!arLinks.includes(x)),
    duplicate,annotated,appended,
    clean_match:cleaned===source,
    mismatch,expected_context:source.slice(Math.max(0,mismatch-100),mismatch+150),
    actual_context:cleaned.slice(Math.max(0,mismatch-100),mismatch+200),
    html_excerpt:clean.innerHTML.slice(Math.max(0,mismatch-250),mismatch+500),
    clean_len:clean.textContent.length,
    original_len:sec.segments[i].en.length
   };
 });
}"""

def check_section(page,number):
    page.goto(BASE+'index.html#section='+str(number),wait_until='domcontentloaded',timeout=90000)
    expect(page.locator('#reader .passage-grid').first).to_be_attached(timeout=50000)
    data=page.evaluate(CHECK_PASSAGES)
    assert data,'No aligned paragraphs in section '+str(number)
    total=0
    for item in data:
        detail=f'§{number} segment {item["i"]}: {json.dumps(item,ensure_ascii=False)}'
        # Uncertain matches stay unmarked rather than being listed at the end.
        assert not item['appended'],f'No trailing keyword list is permitted: {detail}'
        assert not item['unexpected'],f'English invented a dictionary link: {detail}'
        assert not item['duplicate'],f'Duplicate English dictionary key: {detail}'
        assert item['annotated'],f'Incorrect language/key in English link: {detail}'
        assert item['clean_match'],f'Translation modified: {detail}'
        total+=len(item['actual_en'])
    assert total>0,f'No linked terms for section {number}'
    return total

def clickable_same_dictionary(page):
    en=page.locator('#reader .passage-en .gn-en-lex-term').first
    expect(en).to_be_attached()
    term=en.get_attribute('data-term')
    assert term
    # In a narrow viewport English may start disabled, so use an English-only
    # reader mode by the UI's actual language toggle.
    if not en.is_visible():
        en_toggle=page.locator('[data-language-toggle="english"]').first
        assert en_toggle.count(), 'Missing reader English toggle on mobile'
        en_toggle.click()
        en.wait_for(state='visible',timeout=25000)
    en.scroll_into_view_if_needed()
    en.click()
    expect(page.locator('#infoOverlay')).to_be_visible(timeout=25000)
    expect(page.locator('#detailTitle')).to_have_text(term)
    page.locator('#detailClose').click()
    expect(page.locator('#infoOverlay')).to_be_hidden()
    # The same lexical key is present in the original-language column.
    assert page.locator('.passage-ar .inline-term[data-term]').evaluate_all(
      '(links,term)=>links.some(x=>x.dataset.term===term)',term)
    return term

def run(browser,viewport,label):
    context=browser.new_context(viewport=viewport,reduced_motion='reduce')
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    try:
        # Private reader settings must not interfere with the lexical contract.
        page.add_init_script("""
          localStorage.setItem('daruri-reader-v2',
            JSON.stringify({showTerms:true,showNotes:true,focusMode:false,focusLevel:0,lang:'parallel'}));
        """)
        counts={}
        for section in [1,2,7,11,57,169,216,258]:
            counts[section]=check_section(page,section)
        term=clickable_same_dictionary(page)
        assert not any('bilingual-lexicon' in x.lower() or
                       'range' in x.lower() for x in errors),f'{label}: {errors}'
        print(f'PASS {label}: {sum(counts.values())} identical Arabic/English '
              f'dictionary keys across {len(counts)} sampled sections; '
              f'English translation unchanged; opened {term!r} dictionary.')
    finally:
        context.close()

if __name__=='__main__':
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
        run(browser,{'width':1320,'height':900},'desktop')
        run(browser,{'width':390,'height':844},'mobile')
        browser.close()
