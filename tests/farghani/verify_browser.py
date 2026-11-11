#!/usr/bin/env python3
"""Interactive GNAMMA Farghānī reader QA across Chromium + Safari/WebKit."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os, json, sys

BASE=os.environ.get("FARGHANI_READER_BASE","http://127.0.0.1:8819/texts/al-farghani/muntaha-al-madarik/")
ART=Path(os.environ.get("FARGHANI_QA_OUTPUT","qa-artifacts/farghani"))
ART.mkdir(parents=True,exist_ok=True)
reports=[]

def assert_no_hscroll(page,tag):
    d=page.evaluate("({full:document.documentElement.scrollWidth,viewport:innerWidth})")
    assert d["full"]<=d["viewport"]+2,f"{tag}: horizontal overflow {d}"

def run_browser(p,engine,browser_name):
    for is_mobile in (False, True):
        label=browser_name+("-phone" if is_mobile else "-desktop")
        context=p.browser_type if False else None
        browser=getattr(p,browser_name).launch(headless=True)
        opts={"viewport":{"width":390,"height":844},"device_scale_factor":2,"is_mobile":True,"has_touch":True} if is_mobile else {"viewport":{"width":1440,"height":900},"device_scale_factor":1}
        if browser_name=="webkit" and is_mobile:
            opts["is_mobile"]=True
        ctx=browser.new_context(**opts)
        page=ctx.new_page()
        errors=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        page.goto(BASE+"continuous-translation.html",wait_until="domcontentloaded",timeout=60000)
        page.wait_for_selector("html.fr-ready")
        assert page.locator("#document section.b2007-page").count()==128,f"{label}: source pages"
        assert page.locator('#scholarly-apparatus li[id^="apparatus-p"]').count()==128,f"{label}: apparatus pages"
        assert page.locator("#document section[data-part-start]").count()==5,f"{label}: foundation starts"
        assert page.locator('#document [id="b2007-p34"]').count()==1,f"{label}: printed p34"
        assert "Cloud-like Presence" in page.locator('#b2007-p34').inner_text()
        assert_no_hscroll(page,label+" open")
        assert page.locator("body").evaluate("(n)=>n.classList.contains('reader-clean')"),f"{label}: page-number labels not unobtrusive"
        page.locator("#fr-contents-open").click()
        assert page.locator("#fr-panel").evaluate("(n)=>n.open")
        page.locator(".fr-dialog-body .fr-input").fill("p. 70")
        # Result searching page number may also match printed page title text.
        page.locator(".fr-dialog-body .fr-result").filter(has_text="p. 70").first.click()
        page.wait_for_timeout(600)
        assert page.evaluate("location.hash")=="#b2007-p70",f"{label}: contents direct link"
        assert "70" in page.locator("#fr-current").inner_text(),f"{label}: progress page not correct"
        page.locator("#fr-save").click()
        assert page.locator("#fr-save").get_attribute("aria-pressed")=="true"
        page.locator("#fr-source-open").click()
        assert page.locator("#fr-panel-body").get_by_text("Beirut p.70").count()>=1
        assert page.locator('#fr-panel-body a[href*="critical-edition.html?page=70"]').count()==1
        page.locator("#fr-close").click()
        assert page.locator("#fr-panel").evaluate("(n)=>!n.open")
        page.locator("#fr-search-open").click()
        field=page.locator("#fr-panel-body .fr-input")
        field.fill("Knowledge")
        page.wait_for_timeout(200)
        assert page.locator("#fr-panel-body .fr-result").count()>=1,f"{label}: full text search"
        page.locator("#fr-panel-body .fr-result").first.click()
        assert page.evaluate("location.hash").startswith("#b2007-p"),f"{label}: search jump"
        page.wait_for_timeout(500)
        page.locator("#fr-font-up").click()
        scale=page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--fr-scale').trim()")
        assert float(scale)>1,f"{label}: type scaling"
        page.locator("#fr-theme").click()
        assert page.evaluate("document.documentElement.dataset.theme")=="horizon",f"{label}: theme control"
        page.locator("#fr-theme").click()
        assert page.evaluate("document.documentElement.dataset.theme")=="night",f"{label}: dark theme"
        page.locator("#fr-focus").click()
        assert page.locator("body").evaluate("(n)=>n.classList.contains('fr-focus')")
        assert page.locator("#fr-exit-focus").is_visible()
        page.locator("#fr-exit-focus").click()
        assert not page.locator("body").evaluate("(n)=>n.classList.contains('fr-focus')")
        page.locator("#fr-bookmarks-open").click()
        assert page.locator("#fr-panel-body").get_by_text("★ Beirut p. 70").count()==1,f"{label}: saved pages"
        page.locator("#fr-close").click()
        page.reload(wait_until="domcontentloaded")
        page.wait_for_selector("html.fr-ready")
        assert page.evaluate("document.documentElement.dataset.theme")=="night",f"{label}: prefs not retained"
        page.locator("#fr-bookmarks-open").click()
        assert page.locator("#fr-panel-body").get_by_text("★ Beirut p. 70").count()==1,f"{label}: bookmarks lost on refresh"
        page.locator("#fr-close").click()
        page.emulate_media(media="print")
        assert page.locator('#b2007-p18 h3').evaluate("(n)=>getComputedStyle(n).position")!="absolute",f"{label}: printed page labels not shown"
        page.emulate_media(media="screen")
        assert_no_hscroll(page,label+" final")
        assert not errors,f"{label}: JavaScript page errors {errors[:5]}"
        page.screenshot(path=str(ART/(label+".png")),full_page=False)
        # Extract reader must acknowledge partial Arabic coverage without conflating it with full English.
        page.goto(BASE,wait_until="domcontentloaded")
        assert page.locator("#reading-list .reading-block").count()>=1,f"{label}: source extract reader missing"
        assert not errors,f"{label}: reader errors {errors[:5]}"
        # 559 selected records must stay usable in page-filtered critical viewer.
        page.goto(BASE+"critical-edition.html?page=52",wait_until="domcontentloaded",timeout=60000)
        page.wait_for_selector(".audit-clause")
        assert page.locator("#count").inner_text().strip()=="559",f"{label}: critical record total"
        page.locator("#page-select").select_option("52")
        assert page.locator("#clauses .audit-clause").count()>0,f"{label}: p52 missing"
        assert page.locator('.audit-clause[data-disposition="corrected"]').count()>=0
        assert not errors,f"{label}: critical reader errors {errors[:5]}"
        assert_no_hscroll(page,label+" critical")
        page.screenshot(path=str(ART/(label+"-critical.png")),full_page=False)
        reports.append({"browser":browser_name,"mobile":is_mobile,"pages":128,"notes":70,"critical_records":559,"status":"pass"})
        ctx.close()
        browser.close()

with sync_playwright() as p:
    browsers=os.environ.get("FARGHANI_BROWSERS","chromium,webkit").split(",")
    for b in browsers:
        run_browser(p,b,b)

print(json.dumps(reports,indent=2))
(ART/"report.json").write_text(json.dumps(reports,indent=2)+"\n",encoding="utf-8")
