#!/usr/bin/env python3
"""Source-honest Mahāʾimī/Qūnawī Stage10 corpus consistency checks.

Run at repo root: python tests/test_mahaimi_stage10.py
No manuscript collation or printed-facsimile verification is claimed.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "texts/al-mahaimi/mashra-al-khusus"
DATA = json.loads((BASE / "data/parallel.json").read_text(encoding="utf-8"))
HTML = (BASE / "index.html").read_text(encoding="utf-8")
match = re.search(r'<script id="corpus-json" type="application/json">([\s\S]*?)</script>', HTML)
assert match is not None, "inline corpus script missing"
INLINE = json.loads(match.group(1))
assert INLINE == DATA, "main HTML corpus differs from data/parallel.json"
assert len(DATA) == 278, "unexpected Stage10 entry count"
ids = {e["id"] for e in DATA}
assert len(ids) == len(DATA), "duplicate entry ID"

commentary = [e for e in DATA if e.get("edition_layer") == "commentary"]
assert len(commentary) == 221
page_to_entry = {
    n: e
    for e in commentary
    for n in range(e["printed_pages"][0], e["printed_pages"][1] + 1)
}
assert set(page_to_entry) == set(range(11, 233)), "missing commentary English page"
arabic_pages = {
    n
    for n, e in page_to_entry.items()
    if any(pair.get("ar", "").strip() for pair in e["pairs"])
}
assert arabic_pages == set(range(11, 150)) | {230, 231, 232}
assert set(page_to_entry) - arabic_pages == set(range(150, 230)), "the missing-Arabic ledger changed"

forum = [e for e in DATA if e.get("edition_layer") == "qunawi_online_transcription"]
assert len(forum) == 47
assert all(e["pairs"][0].get("ar") and e["pairs"][0].get("en") for e in forum)
assert all(e.get("printed_pages") == [0, 0] and e.get("source_locator") for e in forum), "forum pages must not masquerade as verified 2008 pages"
links = [(e["id"], l["target_id"]) for e in forum for l in e.get("concordance_links", [])]
assert len(links) == 64, "changed original→commentary links"
assert all(to in ids for _, to in links)
assert len({to for _, to in links}) == 61
reverse = [(e["id"], l["target_id"]) for e in commentary for l in e.get("matn_links", [])]
assert len(reverse) == 64 and all(to in ids for _, to in reverse)
assert set((b, a) for a, b in links) == set(reverse), "non-reciprocal contextual links"

proofs = sorted(e["printed_pages"][0] for e in DATA if e.get("edition_layer") == "qunawi_original_proof")
assert proofs == [235, 236, 267]
assert len([e for e in DATA if e.get("edition_layer") == "qunawi_original"]) == 7
assert 'data-crossref' in HTML and 'qunawi_online_transcription' in HTML
manifest = json.loads((ROOT / "texts/manifest.json").read_text(encoding="utf-8"))
record = next(e for e in manifest["texts"] if e["id"] == "mahaimi-mashra-khusus")
assert record["cumulative_printed_pages_count"] == 222
assert record["commentary_arabic_imported_pages"] == 142
assert record["original_qn_online_excerpt_count"] == 47
assert record["manuscript_collation_completed_pages"] == 0
print("PASS: Stage10 coverage, source distinctions, manifest, concordance, and reader JSON")
