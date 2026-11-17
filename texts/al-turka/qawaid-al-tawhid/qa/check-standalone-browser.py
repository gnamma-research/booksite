#!/usr/bin/env python3
"""Live browser regression for the self-contained Tamhīd commentary export.
Chromium/WebKit emulation is not physical-device iOS Safari certification.
"""
from __future__ import annotations
import argparse,json,re
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE=Path(__file__).resolve().parent.parent
DEFAULT=BASE/"downloads/Tamhid_Complete_Commentary_Reading_Edition.html"

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--file",type=Path,default=DEFAULT)
    ap.add_argument("--browsers",default="chromium,webkit")
    ap.add_argument("--screenshots",type=Path,default=BASE/"qa/standalone-browser")
    args=ap.parse_args()
    data=args.file.read_text(encoding="utf-8")
    assert data.count("<style>")==data.count("</style>")>=1,"Unbalanced style tags"
    assert data.count("<script>")==data.count("</script>")>=2,"Unbalanced inline scripts"
    assert data.find("</style>")<data.find("</head>")<data.find("<body"),"Styles swallowed HTML document"
    assert "GNAMMA_TAMHID_CORPUS" in data and "SH-061-B" in data,"Commentary corpus missing"
    args.screenshots.mkdir(parents=True,exist_ok=True)
    report={"file":str(args.file.name),"sizeBytes":args.file.stat().st_size,"browsers":{},"realIOSSafariTested":False}
    with sync_playwright() as play:
        for browser_name in [x.strip() for x in args.browsers.split(",") if x.strip()]:
            engine=getattr(play,browser_name)
            browser=engine.launch(headless=True,args=["--no-sandbox"] if browser_name=="chromium" else [])
            items=[]
            for width in (320,390,768,1280):
                page=browser.new_page(viewport={"width":width,"height":844},reduced_motion="reduce")
                errors=[]
                page.on("pageerror",lambda error: errors.append(str(error)))
                page.set_content(data,wait_until="load",timeout=30000)
                page.wait_for_timeout(120)
                title=page.locator("h1").count()==1
                first="SH-INTRO-001" in page.locator("#reading-list").inner_text()
                over=page.evaluate("document.documentElement.scrollWidth-window.innerWidth")
                assert title and first and over<=1 and not errors,(browser_name,width,title,first,over,errors)
                result={"width":width,"titleRendered":title,"firstSectionRendered":first,"horizontalOverflowPx":over,"pageErrors":errors}
                if width==390:
                    page.locator("#begin-reading").click(timeout=10000)
                    assert page.evaluate("location.hash")=="#SH-INTRO-001"
                    page.locator("#lang-en").click(timeout=10000)
                    assert page.locator("body").get_attribute("data-language")=="ar"
                    page.locator("#lang-en").click(timeout=10000)
                    assert page.locator("body").get_attribute("data-language")=="both"
                    page.locator("#menu-button").click(timeout=10000)
                    assert page.locator("#sheet").evaluate("(x)=>x.open")
                    page.locator("#sheet-close").click(timeout=10000)
                    page.locator("#next").click(timeout=10000)
                    assert page.evaluate("location.hash")=="#SH-INTRO-002"
                    result["navigationAndLanguageControls"]=True
                if width in (390,1280):
                    page.screenshot(path=str(args.screenshots/f"{browser_name}-{width}.png"),full_page=False)
                items.append(result)
                page.close()
            browser.close()
            report["browsers"][browser_name]=items
    (args.screenshots/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(report,ensure_ascii=False,indent=2))

if __name__=="__main__":
    main()
