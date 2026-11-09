"""Smoke tests for the unified work explorer (local static HTTP server).

Usage: python -m http.server 8123 --directory <repo-root>
       python research/intellectual-atlas/tests/verify_work_explorer_browser.py

Requires Playwright with Chromium. This is an executable browser contract,
not a claim that all manuscript or citation data have been reconciled.
"""
import asyncio
import json
import os
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = os.getenv("GN_ATLAS_URL", "http://127.0.0.1:8123/research/intellectual-atlas/")
OUT = Path("/tmp/gnamma-work-explorer-qa")
OUT.mkdir(parents=True, exist_ok=True)


def check(ok, reason):
    if not ok:
        raise AssertionError(reason)


async def info(page):
    return await page.evaluate("""() => ({
        d: window.GNWorkExplorer?.debug() || null,
        view: document.querySelector('#kalam-timeline-app-v3')?.atlasTest?.state?.view,
        svg: document.querySelectorAll('.gnx-network-svg').length,
        shown: document.querySelectorAll('[data-gnx-focus]').length,
        evidence: document.querySelectorAll('[data-gnx-edge]').length,
        sourceLinks: [...document.querySelectorAll('.gnx-profile a[href]')].map(a => a.href),
        hasGeo: !!document.querySelector('.gnx-geography'),
        hasCoverage: !!document.querySelector('.gnx-coverage'),
        scrollOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        hash: location.hash
    })""")


async def test_desktop(page):
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    response = await page.goto(ROOT + "#view=explorer&gnx_work=c:ibnarabi_fusus",
                               wait_until="domcontentloaded", timeout=60000)
    check(response.status == 200, "Atlas did not load")
    await page.wait_for_function("() => window.GNWorkExplorer?.debug().canonical > 300", timeout=20000)
    await page.wait_for_function("() => window.GNWorkExplorer?.debug().ready", timeout=65000)
    d = await info(page)
    check(d["view"] == "explorer" and d["svg"] == 1, "Work explorer is not a first-class SVG atlas view")
    check(d["d"]["bibliographic"] >= 5000, "Unified bibliography was not loaded")
    check(d["d"]["auditedEdges"] >= 300, "Audited philosophical edges were lost")
    check(d["d"]["sourceEdges"] >= 5, "Pinned bibliographic edges were not imported")
    check(d["d"]["selected"] == "c:ibnarabi_fusus", "Canonical focus deep link failed")
    check(d["evidence"] > 0, "Documented edges are missing from graph")
    check(d["scrollOverflow"] <= 4, "Explorer makes the document horizontally overflow")
    # A work-centred graph must allow inspection of the exact edge.
    # Crossing arrows may overlap visually; keyboard operation must remain deterministic.
    await page.locator("[data-gnx-edge]").first.focus()
    await page.keyboard.press("Enter")
    check(await page.locator(".gnx-evidence").count() == 1,
          "Selecting edge did not expose relationship evidence")
    check("sources" in (await page.locator(".gnx-evidence").inner_text()).lower(),
          "Evidence detail lacks source citations")
    await page.locator("[data-gnx-close-edge]").click()

    # Family is a curated subset, not an edge invented from school membership.
    await page.locator(".gnx-advanced summary").click()
    await page.locator("[data-gnx-family]").select_option("fusus")
    d = await info(page)
    check(d["d"]["selected"] == "c:ibnarabi_fusus", "Text family did not focus its actual root")
    check(d["d"]["scope"] == "audited", "Text family not scoped to the audited dataset")
    check(d["d"]["graphNodes"] > 1, "Family lost all nodes")

    # Entire bibliographic domain remains searchable; it does not manufacture relationships.
    await page.locator("[data-gnx-family]").select_option("")
    await page.locator("[data-gnx-scope]").select_option("fiqh")
    await page.locator("[data-gnx-provenance]").select_option("alreq")
    d = await info(page)
    check(d["d"]["matched"] >= 1000, "The Alreq fiqh bibliography was omitted")
    await page.locator(".gnx-result").first.click()
    d = await info(page)
    check(d["d"]["selected"].startswith("b:alreq:"),
          "Bibliographic work did not keep source identity")
    check(d["d"]["graphEdges"] == 0,
          "Uncollated manuscript catalogue produced an unsupported textual arrow")
    check("Unplaced" in await page.locator(".gnx-profile").inner_text(),
          "Undated manuscript entry was assigned a fabricated date")

    # Export is scoped and carries provenance; no whole-corpus mislabeling.
    async with page.expect_download() as future:
        await page.locator("[data-gnx-export]").click()
    download = await future.value
    check(download.suggested_filename.endswith(".json"), "Graph export is not JSON")
    path = await download.path()
    obj = json.loads(Path(path).read_text())
    check(obj["schema"] == "gnamma.work-network/1", "Export schema version missing")
    check("disclaimer" in obj and obj["focus"] == d["d"]["selected"],
          "Export does not preserve focus and evidence caveats")

    # Geography is a regional-label index, not a false composition map.
    await page.locator('[data-gnx-mode="geography"]').click()
    d = await info(page)
    check(d["hasGeo"], "Geographic layer missing")
    check("not" in (await page.locator(".gnx-geography").inner_text()).lower(),
          "Uncertain geographic evidence is not qualified")
    await page.locator('[data-gnx-mode="coverage"]').click()
    check((await info(page))["hasCoverage"], "Corpus evidence/coverage panel missing")
    await page.screenshot(path=str(OUT / "work-explorer-desktop.png"), full_page=True)
    check(not errors, "Browser JavaScript errors: " + "; ".join(errors))


async def test_roundtrip(page):
    await page.goto(ROOT + "#view=sources&science=fiqh&source_tab=texts&madhhab=all",
                    wait_until="domcontentloaded", timeout=60000)
    # The full subject atlas correctly groups a millennium into dated era clusters first.
    await page.wait_for_selector("[data-dn-cluster]", timeout=65000)
    await page.locator("[data-dn-cluster]").first.click()
    await page.wait_for_selector("[data-dn-work]", timeout=20000)
    await page.locator("[data-dn-work]").first.click()
    await page.locator('[data-action="explore-source-selected"]').click()
    d = await info(page)
    check(d["view"] == "explorer", "Timeline work could not open source/reception network")
    check(d["d"]["selected"].startswith("b:"), "Source work identity did not survive transition")
    current = d["hash"]
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_function("() => !!window.GNWorkExplorer?.debug().ready", timeout=65000)
    d2 = await info(page)
    check(d2["hash"] == current and d2["d"]["selected"] == d["d"]["selected"],
          "Source work permalink did not survive reload")
    await page.goto(ROOT + "#view=timeline&work=ibnarabi_fusus", wait_until="domcontentloaded")
    await page.wait_for_selector('[data-action="explore-selected"]', timeout=15000)
    await page.locator('[data-action="explore-selected"]').click()
    d3 = await info(page)
    check(d3["view"] == "explorer" and d3["d"]["selected"] == "c:ibnarabi_fusus",
          "Audited timeline work did not open the same canonical identity")


async def test_mobile(browser):
    page = await browser.new_page(viewport={"width": 390, "height": 844},
                                  is_mobile=True, has_touch=True)
    await page.goto(ROOT + "#view=explorer&gnx_work=c:tusi_tajrid",
                    wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_function("() => window.GNWorkExplorer?.debug().canonical > 300")
    d = await info(page)
    check(d["svg"] == 1, "Mobile explorer graph missing")
    check(d["scrollOverflow"] <= 4, "Mobile page overflow; graph must scroll internally")
    await page.screenshot(path=str(OUT / "work-explorer-mobile.png"), full_page=True)
    await page.close()


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1320, "height": 900}, accept_downloads=True)
        await test_desktop(page)
        await test_roundtrip(page)
        await test_mobile(browser)
        await browser.close()
    print("GNAMMA_WORK_EXPLORER_PASS")


if __name__ == "__main__":
    asyncio.run(main())
