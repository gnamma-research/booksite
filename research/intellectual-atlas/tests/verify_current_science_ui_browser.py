"""Regression checks for the CURRENT atlas Explore and source-map UI.

Run with the repository served at http://127.0.0.1:8123/ (no build substitution).
Tests real Chromium/WebKit interactions, not just DOM string assertions.
"""
import argparse
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

URL = os.getenv("GN_ATLAS_URL", "http://127.0.0.1:8123/research/intellectual-atlas/")
OUT = Path(os.getenv("GN_ATLAS_QA_OUT", "/tmp/gnamma-atlas-exhaustive"))
OUT.mkdir(parents=True, exist_ok=True)


def require(condition, message):
    if not condition:
        raise AssertionError(message)


async def state(page):
    return await page.evaluate("""() => {
      const root = document.querySelector('#kalam-timeline-app-v3'), a = root.atlasTest;
      return {
        view: a.state.view, science: a.state.sourceScience,
        tab: a.state.sourceTab, madhhab: a.state.sourceMadhhab,
        family: a.state.textFamily, hash: location.hash,
        nodes: a.data.nodes.length, edges: a.data.edges.length,
        families: a.data.textual_families.length,
        sourceCards: root.querySelectorAll('.ia-source-node').length,
        sourceArrows: root.querySelectorAll('.ia-source-edge').length,
        mainHeading: root.querySelector('[data-main] h2')?.textContent || '',
        sourceText: root.querySelector('[data-main]')?.textContent || '',
        noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth+3,
        duplicateIds: (() => {const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
          return ids.length - new Set(ids).size})(),
      };
    }""")


async def choose_science(page, science):
    await page.locator('[data-action="open-explore"]').first.click()
    await page.locator(f'[data-explore-science="{science}"]').click()
    if science in ("fiqh", "hadith", "tafsir", "arabic"):
        await page.wait_for_function("""() => document.querySelectorAll('.ia-source-node').length > 0""",
                                     timeout=20000)
        require(await page.locator('[data-explore-overlay]').is_hidden(),
                f"Explore stayed open after selecting {science}")


async def run(page):
    page_errors = []
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    page.on("console", lambda msg: page_errors.append(msg.text)
            if msg.type == "error" and "favicon" not in msg.text.lower() else None)
    resp = await page.goto(URL, wait_until="domcontentloaded", timeout=65000)
    require(resp is not None and resp.status == 200, "Atlas HTTP error")
    await page.wait_for_function("!!document.querySelector('#kalam-timeline-app-v3')?.atlasTest")
    initial = await state(page)
    require((initial["nodes"], initial["edges"], initial["families"]) == (404, 377, 21),
            f"Canonical atlas counts unexpected: {initial}")
    require(initial["view"] == "timeline", "Default timeline missing")
    require(await page.locator('[data-view="sources"]').count() == 1,
            "Sources must be a genuine labeled view, not an invisible internal mode")
    require(initial["duplicateIds"] == 0, "Duplicate DOM IDs")
    require(initial["noOverflow"], "Page horizontally overflows viewport")

    # Existing sourced philosophical network remains accessible.
    if await page.locator('[data-view="network"]').is_visible():
        await page.locator('[data-view="network"]').click()
    else:
        await page.locator('[data-view-picker]').select_option('network')
    require((await state(page))["view"] == "network", "Existing network tab broken")
    await choose_science(page, "fiqh")
    s = await state(page)
    require(s["view"] == "sources" and s["science"] == "fiqh", "Fiqh did not change the MAP")
    require(s["sourceCards"] == 10, f"Expected ten fiqh source cards, got {s['sourceCards']}")
    require("Fiqh" in s["mainHeading"], "Fiqh heading not visible in main map")
    require(s["sourceArrows"] == 0, "Invented fiqh commentary links!")
    require("no historical dependence or commentary arrows are asserted" in s["sourceText"],
            "Missing explicit relation-completeness boundary")
    require(await page.locator('[data-view="sources"]').get_attribute("aria-selected") == "true",
            "Source tab selection is not announced")
    require(await page.locator('[data-main]').get_attribute("aria-labelledby") == "ia-tab-sources-v3",
            "Source tab does not label its main content panel")

    # Each madhhab button must visibly alter source cards and accessibility state.
    cases = [("hanafi", 2, "al-Mabsūṭ"),
             ("maliki", 1, "al-Muwaṭṭaʾ"),
             ("shafii", 4, "al-Risāla"),
             ("hanbali", 2, "al-Mughnī"),
             ("all", 10, "Bidāyat al-mujtahid")]
    for school, n, title in cases:
        button = page.locator(f'[data-source-madhhab="{school}"]')
        await button.click()
        snapshot = await state(page)
        require(snapshot["madhhab"] == school, f"{school}: state not updated")
        require(snapshot["sourceCards"] == n, f"{school}: expected {n} legal books, got {snapshot['sourceCards']}")
        require(title in snapshot["sourceText"], f"{school}: expected book not shown")
        require(await button.get_attribute("aria-pressed") == "true", f"{school}: active state absent")
        require(snapshot["noOverflow"], f"{school}: horizontal body overflow")

    # Uṣūl view is actual source-filtered content, not a renamed placeholder.
    await page.locator('[data-source-tab="method"]').click()
    require((await state(page))["sourceCards"] == 4, "Uṣūl view should show four indexed sources")
    await page.locator('[data-source-madhhab="hanafi"]').click()
    s = await state(page)
    require(s["sourceCards"] == 1 and "Uṣūl al-Sarakhsī" in s["sourceText"],
            "Ḥanafī uṣūl filtering did not change visualized works")
    require("source_tab=method" in s["hash"] and "madhhab=hanafi" in s["hash"],
            "Source choices are not shareable")

    # Deep link survives refresh; formerly Fiqh was entirely menu-local.
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_function("""() => !!document.querySelector('.ia-source-node')""", timeout=20000)
    s = await state(page)
    require((s["view"], s["science"], s["tab"], s["madhhab"], s["sourceCards"])
            == ("sources", "fiqh", "method", "hanafi", 1),
            f"Fiqh deep link did not survive page reload: {s}")

    # In-map search has live feedback, as opposed to searching the OLD philosophy graph.
    await page.locator('[data-source-madhhab="all"]').click()
    await page.locator('[data-source-tab="texts"]').click()
    await page.locator('#ia-search-v3').fill("Sarakhsi")
    require((await state(page))["sourceCards"] == 2, "Source-map search still searches old atlas")
    await page.locator('#ia-search-v3').fill("")
    require((await state(page))["sourceCards"] == 10, "Source search clear did not restore cards")
    first = await page.locator('.ia-source-node').first.get_attribute("href")
    require("corpora/" in first and "book=" in first, "Source card does not open a real text")

    # Arabic sciences including balāgha use their own available source authorities.
    await choose_science(page, "arabic")
    require("Grammar" in (await state(page))["sourceText"], "Arabic grammar view absent")
    await page.locator('[data-source-tab="balagha"]').click()
    s = await state(page)
    require(s["science"] == "arabic" and s["tab"] == "balagha" and s["sourceCards"] > 0,
            "Balāgha view failed to load source works")
    require(s["sourceArrows"] > 0, "Already documented rhetoric text links not rendered")
    await choose_science(page, "hadith")
    require("Hadith" in (await state(page))["mainHeading"], "Hadith map absent")
    await page.locator('[data-source-tab="isnads"]').click()
    require("not imported" in (await state(page))["sourceText"],
            "Isnād view misleadingly implies attested transmission chains")
    await choose_science(page, "tafsir")
    require((await state(page))["sourceCards"] > 0, "Tafsīr sources not drawn")

    # Return to canonical atlas without mutating its bibliography or date chart.
    await page.locator('[data-main] [data-action="show-all-mapped"]').click()
    s = await state(page)
    require(s["view"] == "timeline" and s["nodes"] == 404, "Return to main atlas broken")
    require(s["duplicateIds"] == 0 and s["noOverflow"], "Layout/IDs damaged by view switches")
    require(not page_errors, f"Uncaught browser errors: {page_errors[:5]}")
    return {"status": "pass", "engine": page.context.browser.browser_type.name,
            "viewport": page.viewport_size, "fiqh_madhhabs_checked": len(cases),
            "atlas_works": 404, "source_works_fiqh": 10, "errors": page_errors}


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--browser", choices=["chromium", "webkit"], default="chromium")
    ap.add_argument("--width", type=int, default=390)
    ap.add_argument("--height", type=int, default=844)
    args = ap.parse_args()
    async with async_playwright() as p:
        engine = getattr(p, args.browser)
        browser = await engine.launch(headless=True,
                                      args=["--no-sandbox"] if args.browser == "chromium" else [])
        mobile = args.width <= 500 or args.height <= 500
        context = await browser.new_context(
            viewport={"width": args.width, "height": args.height},
            device_scale_factor=1, is_mobile=mobile, has_touch=mobile)
        page = await context.new_page()
        try:
            result = await run(page)
            print("PASS", json.dumps(result, ensure_ascii=False))
            (OUT / f"science_{args.browser}_{args.width}x{args.height}.json").write_text(
                json.dumps(result, ensure_ascii=False, indent=2), encoding="utf8")
            await page.screenshot(path=str(OUT/f"science_{args.browser}_{args.width}x{args.height}.png"))
        except Exception:
            await page.screenshot(path=str(OUT/f"science_failed_{args.browser}_{args.width}x{args.height}.png"))
            raise
        finally:
            await context.close()
            await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
