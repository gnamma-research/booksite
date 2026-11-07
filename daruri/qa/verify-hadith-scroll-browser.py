#!/usr/bin/env python3
"""Hadith scholarly-note scrolling: only the enclosing modal may scroll.

Run with a local Python HTTP server at port 8132 from repository root and
Playwright Chromium/WebKit installed. This tests actual report expansion.
"""
from __future__ import annotations
import os
from playwright.sync_api import sync_playwright, expect

BASE=os.environ.get('DARURI_QA_BASE','http://127.0.0.1:8132/daruri/')

def exercise(engine, label, mobile):
    browser=engine.launch(headless=True,**({'args':['--no-sandbox']} if label.startswith('chromium') else {}))
    context=browser.new_context(viewport={'width':390 if mobile else 1280,'height':844 if mobile else 900},
                                is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    try:
        page.goto(BASE+'index.html#section=31',wait_until='domcontentloaded',timeout=90000)
        page.locator('#reader .passage-grid').first.wait_for(timeout=45000)
        button=page.locator('#reader [data-gn-notes-open]').first
        button.wait_for(timeout=20000)
        button.click()
        layer=page.locator('#gn-scholar-layer')
        expect(layer).to_be_visible(timeout=20000)
        entry=layer.locator('.gn-note-entry[data-note-id="HAD-R031"]')
        expect(entry).to_be_attached(timeout=20000)
        detail=entry.locator('details.gn-hadith-context').first
        expect(detail).to_be_attached(timeout=20000)
        detail.locator(':scope > summary').click()
        page.wait_for_function(
            "() => document.querySelector('.gn-note-entry[data-note-id=\"HAD-R031\"] details.gn-hadith-context')?.dataset.ready === '1'",
            timeout=60000)
        inner=detail.locator('.gn-hadith-context-body')
        outer=layer.locator('.gn-layer-scroll')
        metrics=page.evaluate("""() => {
          const layer=document.querySelector('#gn-scholar-layer'),
                outer=layer.querySelector('.gn-layer-scroll'),
                inner=layer.querySelector('.gn-note-entry[data-note-id="HAD-R031"] .gn-hadith-context-body'),
                sheet=layer.querySelector('.gn-layer-sheet'),top=layer.querySelector('.gn-layer-top');
          const style=getComputedStyle(inner),os=getComputedStyle(outer);
          return {innerOverflow:style.overflowY,maxHeight:style.maxHeight,
           innerHeight:inner.clientHeight,innerScroll:inner.scrollHeight,
           outerHeight:outer.clientHeight,outerScroll:outer.scrollHeight,
           outerOverflow:os.overflowY,sheetHeight:sheet.getBoundingClientRect().height,
           headerHeight:top.getBoundingClientRect().height,
           reportCount:inner.querySelectorAll('.gn-hadith-report').length};
        }""")
        assert metrics['reportCount']>=2,(label,metrics)
        assert metrics['innerOverflow']=='visible',(label,metrics)
        assert metrics['maxHeight']=='none',(label,metrics)
        assert metrics['innerScroll']<=metrics['innerHeight']+3,(label,metrics)
        assert metrics['outerOverflow']=='auto',(label,metrics)
        assert metrics['outerScroll']>metrics['outerHeight']+20,(label,metrics)
        assert metrics['sheetHeight']<=(844 if mobile else 900),(label,metrics)
        assert metrics['headerHeight']>25,(label,metrics)
        page.evaluate("() => { const x=document.querySelector('#gn-scholar-layer .gn-layer-scroll');x.scrollTop=x.scrollHeight; }")
        bottom=outer.evaluate('(x)=>({position:x.scrollTop,max:x.scrollHeight-x.clientHeight})')
        assert bottom['max']>80 and bottom['position']>=bottom['max']-3,(label,bottom)
        page.evaluate("() => { document.querySelector('#gn-scholar-layer .gn-layer-scroll').scrollTop=0; }")
        assert outer.evaluate('(x)=>x.scrollTop')<=2,(label,'Could not scroll back to note header')
        detail.locator(':scope > summary').click()
        expect(detail).not_to_have_attribute('open','')
        assert inner.evaluate('(x)=>getComputedStyle(x).overflowY')=='visible'
        layer.locator('.gn-layer-top button').click()
        expect(layer).to_have_count(0)
        assert not any('hadith' in message.lower() and 'error' in message.lower() for message in errors),(label,errors)
        print('PASS',label,'single scroll container; expanded and collapsed reports; top and bottom reachable')
    finally:
        context.close()
        browser.close()

if __name__=='__main__':
    with sync_playwright() as p:
        for engine,label,mobile in [(p.chromium,'chromium desktop',False),
                                    (p.chromium,'chromium mobile',True),
                                    (p.webkit,'webkit iPhone viewport',True)]:
            exercise(engine,label,mobile)
