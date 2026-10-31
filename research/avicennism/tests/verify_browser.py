"""Browser smoke tests for the portable Late Avicennism critical reader.

Start a local HTTP server on port 8123 in the repository root before running.
Optionally: --browser webkit or --browser chromium.
"""
from __future__ import annotations
import argparse
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
BASE="http://127.0.0.1:8123/research/avicennism/"
async def run(browser_name="chromium",width=1440,height=900):
    async with async_playwright() as playwright:
        browser=await getattr(playwright,browser_name).launch(headless=True)
        page=await browser.new_page(viewport={"width":width,"height":height})
        errors=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        await page.goto(BASE,wait_until="load",timeout=60000)
        await page.wait_for_function("()=>document.querySelector('#main')?.getAttribute('aria-busy')==='false'")
        assert "Late Avicennism" in await page.title()
        assert await page.locator("#main h1").count()>0
        await page.goto(BASE+"#contents",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelectorAll('.document-row').length>=32")
        assert await page.locator(".document-row").count()==32
        await page.locator("#doc-filter").fill("Lāhījī")
        assert 0<await page.locator(".document-row").count()<32
        await page.locator("#doc-filter").fill("")
        await page.goto(BASE+"#text/lah-active/1",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelector('.reading h2')!==null")
        assert await page.locator(".source-side .source-quote").count()>0
        assert await page.locator(".translation-side .content-block").count()==1
        assert await page.locator(".document-menu a").count()>=3
        await page.locator("header [data-action='ar']").click()
        assert await page.evaluate("document.body.classList.contains('lang-ar-off')")
        await page.locator("header [data-action='ar']").click()
        assert not await page.evaluate("document.body.classList.contains('lang-ar-off')")
        await page.goto(BASE+"#compare/giver",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelectorAll('.compare-work').length===2")
        assert await page.locator(".compare-work").count()==2
        await page.locator("#compare-left").select_option("3")
        await page.wait_for_function("()=>document.querySelector('#compare-left')?.value==='3'")
        assert await page.locator(".argument-stages li").count()>=5
        assert len(await page.locator(".compare-full-text").first.inner_text())>400
        # Full source should contain all available sections, not a clipped snippet.
        await page.goto(BASE+"#full/lah-element",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelectorAll('.full-unit-section').length>=4")
        assert await page.locator(".full-unit-section").count()>=4
        assert await page.locator(".argument-context-grid .argument-context-cell").count()==6
        assert "What is being answered here?" in await page.locator(".argument-context-panel").first.inner_text()
        await page.locator(".toc-jump").last.click()
        assert await page.evaluate("document.documentElement.scrollTop")>0
        # Historical map must expose absent source families rather than claim completeness.
        await page.goto(BASE+"#tradition",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelectorAll('.tradition-family').length>=16")
        assert await page.locator(".tradition-family").count()==16
        assert await page.get_by_text("No direct source unit currently edited from this stream.").count()>=5
        await page.goto(BASE+"#domain/providence",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelector('#main')?.textContent.includes('No direct')")
        assert "No direct" in await page.locator("#main").inner_text()
        await page.goto(BASE+"#method",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelector('#main')?.textContent.includes('Minimum unit')")
        await page.goto(BASE+"#full/lah-making",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelectorAll('.full-unit-section').length>=8")
        assert "Page 282" in await page.locator("#main").inner_text()
        await page.goto(BASE+"#full/lah-unity",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelectorAll('.full-unit-section').length>=9")
        await page.goto(BASE+"#post-asfar",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelectorAll('.toc-card').length>=12")
        await page.goto(BASE+"#post-asfar/01-making",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelectorAll('.distinctive-evidence').length>=4")
        await page.goto(BASE+"#tajrid-overlap",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelector('#main')?.textContent.includes('NEW05')")
        await page.goto(BASE+"#compare/making",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelectorAll('.compare-full-text').length===2")
        assert len(await page.locator(".compare-full-text").first.inner_text())>300
        await page.goto(BASE+"#search?q=tenth%20intellect",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelector('#result-count')?.textContent.includes('matching')")
        assert await page.locator(".result-item").count()>0
        await page.goto(BASE+"#domain/forms",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelectorAll('.document-row').length>=2")
        await page.goto(BASE+"#witnesses",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelectorAll('.witness-entry').length>=11")
        assert await page.locator(".witness-entry").count()>=11
        await page.goto(BASE+"#text/av-vi1/1",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelector('.translation-side')!==null")
        await page.locator("header [data-action='bookmark']").click()
        await page.locator(".section-tools [data-action='note']").click()
        await page.locator("#note-field").fill("Verify source wording against the edition.")
        await page.locator("[data-action='save-note']").click()
        await page.goto(BASE+"#desk",wait_until="domcontentloaded")
        await page.wait_for_function("()=>document.querySelector('.doc-annotation')!==null")
        assert "Verify source wording" in await page.locator(".doc-annotation").first.inner_text()
        await page.reload(wait_until="domcontentloaded")
        assert "Verify source wording" in await page.locator(".doc-annotation").first.inner_text()
        await page.locator("header [data-action='settings']").click()
        await page.locator("select[data-pref='theme']").select_option("dark")
        assert await page.evaluate("document.documentElement.style.colorScheme")== "dark"
        await page.locator("#panel .dialoghead [data-action='close-panel']").click()
        await page.locator("header [data-action='focus']").click()
        assert await page.evaluate("document.body.classList.contains('focusmode')")
        await page.locator("header [data-action='focus']").click()
        assert not await page.evaluate("document.body.classList.contains('focusmode')")
        # Test mobile and landscape dimensions after all interactions.
        for w,h in ((390,844),(844,390),(1440,900)):
            await page.set_viewport_size({"width":w,"height":h})
            await page.goto(BASE+"#text/av-ix5/2",wait_until="domcontentloaded")
            await page.wait_for_function("()=>document.querySelector('.text-columns')!==null")
            overflow=await page.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
            assert overflow<=5, f"Horizontal overflow {overflow}px at {w}x{h}"
        # Offline standalone mode should not make any external requests.
        offline=await browser.new_page(viewport={"width":390,"height":844})
        offline_errors=[]
        offline.on("pageerror",lambda e:offline_errors.append(str(e)))
        await offline.goto((ROOT/"standalone.html").resolve().as_uri(),wait_until="load")
        await offline.wait_for_function("()=>document.querySelector('#main')?.getAttribute('aria-busy')==='false'")
        assert "Late Avicennism" in await offline.title()
        await offline.goto((ROOT/"standalone.html").resolve().as_uri()+"#compare/giver")
        await offline.wait_for_function("()=>document.querySelectorAll('.compare-work').length===2")
        assert not errors, "Browser JavaScript errors: "+str(errors)
        assert not offline_errors,"Offline JavaScript errors: "+str(offline_errors)
        result={"browser":browser_name,"main_viewport":[width,height],"mobile_portrait":True,"landscape":True,"source_anchors":True,"compare":True,"search":True,"local_notes":True,"dark_theme":True,"standalone_offline":True,"page_errors":0}
        await browser.close()
        print(json.dumps(result,ensure_ascii=False))

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--browser",choices=["chromium","webkit"],default="chromium")
    ap.add_argument("--width",type=int,default=1440)
    ap.add_argument("--height",type=int,default=900)
    args=ap.parse_args()
    asyncio.run(run(args.browser,args.width,args.height))
