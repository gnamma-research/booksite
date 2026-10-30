"""Static structural and source-evidence checks for GNAMMA late-commentator fascicles.

Run from repository root:
  python research/intellectual-atlas/tests/verify_late_commentators_edition.py

This checks delivery integrity and provenance only, NOT accuracy of
philological judgments, manuscript readings, or historical attributions.
"""
from __future__ import annotations
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re

BASE = Path(__file__).resolve().parents[1] / "avicennian-summa"
REPO = BASE.parents[2]
HTML = BASE / "late-commentators.html"
LEDGER = BASE / "LATE_WITNESS_REGISTER_2026_10_31.json"
LANDING = BASE / "index.html"
CATALOGUE = BASE / "chapters" / "index.html"
READER = BASE / "chapters" / "reader.html"
PRIMARY = BASE / "primary-translations.html"
BUILD = BASE.parent / "build_release.py"
HANDOFF = BASE / "handoffs" / "STAGE_05_LATE_COMMENTATORS.md"
REGISTER = BASE / "SOURCE_REGISTER.md"

class AuditParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids: list[str] = []
        self.articles: list[str] = []
        self.nav: list[str] = []
        self.rtl = 0
        self.all_links: list[str] = []
        self.filter_count = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str,str|None]]):
        a = dict(attrs)
        if a.get("id"):
            self.ids.append(a["id"])
        if tag == "article" and a.get("id","").startswith("late-"):
            self.articles.append(a["id"])
            if a.get("data-filter") is not None:
                self.filter_count += 1
        if tag == "a":
            href = a.get("href") or ""
            self.all_links.append(href)
            if href.startswith("#late-"):
                self.nav.append(href[1:])
        if a.get("dir") == "rtl":
            self.rtl += 1

html = HTML.read_text(encoding="utf-8")
assert html.lower().startswith("<!doctype html>"), "Missing HTML doctype"
assert html.strip().endswith("</html>"), "Reader truncated"
assert len(html) > 150000, "Edition appears truncated"
data = json.loads(LEDGER.read_text(encoding="utf-8"))
assert data["translated_fascicle_count"] == 11
fascicles = data["translated_fascicles"]
assert len(fascicles) == 11
assert len(data["unresolved_witnesses"]) >= 11
assert data["direct_source_work_count"] >= 8
assert len({f["id"] for f in fascicles}) == len(fascicles)
assert all(f["source_urls"] for f in fascicles)
assert all(f["source_access"] == "direct-searchable-edited-text" for f in fascicles)
assert all(not f["independent_collation"] for f in fascicles)
assert all(not f["original_manuscripts_inspected"] for f in fascicles)

p = AuditParser()
p.feed(html)
ids = [f"late-{i}" for i in range(1,12)]
assert p.articles == ids, f"Article order: {p.articles}"
assert len(set(p.ids)) == len(p.ids), "Duplicate ID in HTML"
assert p.nav == ids, f"TOC links mismatch: {p.nav}"
assert p.filter_count == 11, "Search filter metadata missing"
assert p.rtl >= 11, "Arabic/Persian source anchors missing RTL treatment"
assert "input.addEventListener('input',filter)" in html, "Search control not wired"
assert "initialScale" not in html, "Unexpected presentation regression"

release = BUILD.read_text(encoding="utf-8")
for f in fascicles:
    target = BASE / f["file"]
    assert target.is_file(), f"Missing translation: {f['file']}"
    text = target.read_text(encoding="utf-8")
    assert len(text) > 3000, f"Suspected truncated translation: {f['file']}"
    assert any(u in text for u in f["source_urls"]), f"Original URL missing from {f['file']}"
    assert re.search(r"[\u0600-\u06ff]",text), f"Original-language anchor missing: {f['file']}"
    assert f["file"] in html, f"Source Markdown link missing in reader: {f['file']}"
    assert f["file"] in release, f"Offline archive missing: {f['file']}"

assert "late-commentators.html" in release
assert "STAGE_05_LATE_COMMENTATORS.md" in release
assert "LATE_WITNESS_REGISTER_2026_10_31.json" in release
assert HANDOFF.is_file()
assert all("late-commentators.html" in x.read_text(encoding="utf-8") for x in (LANDING,CATALOGUE,READER,PRIMARY))
assert "Stage 05" in (BASE / "HANDOFF_CURRENT.md").read_text(encoding="utf-8") or "Stage 5" in (BASE / "HANDOFF_CURRENT.md").read_text(encoding="utf-8")
assert "Stage 05" in REGISTER.read_text(encoding="utf-8")

# Every relative Markdown link in these translated fascicles must name an
# existing local source, except fragment-only internal anchors.
relative_links: set[str] = set()
for f in fascicles:
    text=(BASE / f["file"]).read_text(encoding="utf-8")
    for u in re.findall(r"\]\(([^()\s]+)\)", text):
        if u.startswith(("https://","http://","#","mailto:")):
            continue
        relative_links.add(u)
for u in relative_links:
    target = (BASE / unquote(urlsplit(u).path)).resolve()
    assert target.is_file(), f"Broken local source cross-link: {u}"

print(json.dumps({
    "status":"static edition integration passed; not philological certification",
    "fascicles": len(fascicles),
    "direct_works":data["direct_source_work_count"],
    "unresolved_witnesses":len(data["unresolved_witnesses"]),
    "reader_bytes":len(html.encode("utf-8")),
    "right_to_left_blocks":p.rtl,
    "internal_links_verified":len(relative_links)
},ensure_ascii=False))
