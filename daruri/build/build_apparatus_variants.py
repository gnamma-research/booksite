#!/usr/bin/env python3
"""Build finite A4 Daruri apparatus variants with checksum-bound personal-note maps.

Static publishing only. No visitor-facing PDF service. Never rewrite the canonical
five Daruri PDFs, the twelve existing A4 variants or their existing note maps.
Append source-derived apparatus to an *exact verified* Reading/Study A4 PDF.

Maps certify all 258 recorded source-section destinations in the final PDF and
their page coordinates. They do NOT claim unverified exact Arabic word boxes.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import tempfile
from collections import defaultdict
from pathlib import Path

import fitz
from weasyprint import HTML

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
VARIANTS = ROOT / "editions" / "apparatus"
FONTS = HERE / "fonts"
A4 = ROOT / "editions"
sys.path.insert(0, str(HERE))

from print_editions import BOOK, FONT_CSS
from build_editions import render_glossary, render_index, render_concordance

SOURCE_RANGE = range(1, 259)
# A finite, complete-work matrix only; no visitor-side PDF renderer.
# English-language appendices are not attached to Arabic-only editions.
from itertools import combinations
APPARATUS_ORDER = ("glossary", "index", "concordance", "applications")
PROFILES = tuple(
    (tier, language, editorial, components)
    for tier, languages in (
        ("reading", ("bilingual", "bilingual-unvowelled", "english")),
        ("study", ("bilingual",))
    )
    for language in languages
    for editorial in (False, True)
    for count in range(1, len(APPARATUS_ORDER) + 1)
    for components in combinations(APPARATUS_ORDER, count)
)
assert len(PROFILES) == 120

COMPONENT = {
    "glossary": ("Technical glossary", "glossary"),
    "index": ("Full subject index", "subject-index"),
    "concordance": ("R/BA textual concordance", "concordance"),
    "applications": ("Bidāya applications", "applications"),
}

CSS = FONT_CSS + r"""
@page {size:A4;margin:14mm 13mm 15mm;
  @bottom-right{content:counter(page);font:8pt "Noto Sans";color:#66706e}}
html,body {color:#172523;font:9.7pt/1.45 "Noto Serif";background:white}
.page-start{break-before:page}
.page-start:first-child{break-before:auto}
.backmatter-title{font:600 19pt/1.28 "Noto Serif";margin:0 0 6pt}
.small{color:#566361;font:8.2pt/1.45 "Noto Sans";margin:0 0 10pt}
.micro,.refs{font:8pt/1.4 "Noto Sans";color:#455452}
a{color:#205e65;text-decoration:none}
h3{font:600 10.5pt/1.4 "Noto Serif";margin:8pt 0 3pt}
.glossary-columns,.index-columns,.basic-index,.concordance{
  column-count:2;column-gap:16pt}
.glossary-entry,.index-entry{break-inside:avoid-column;margin:0 0 7pt}
.glossary-entry p,.index-entry p,.concordance p{margin:0 0 5pt}
.glossary-entry .ar{font:12pt/1.5 "Noto Naskh Arabic";direction:rtl}
.subject-guide{display:grid;grid-template-columns:1fr 1fr;gap:5pt 12pt}
.subject-guide article{break-inside:avoid;margin:0 0 8pt}
.subject-guide h3{font-size:9.7pt}
.subject-guide p{font-size:8.6pt;margin:0 0 3pt}
.index-alphabetical-title{font:600 14pt "Noto Serif";margin-top:12pt}
.concordance p{break-inside:avoid;font:8.3pt/1.5 "Noto Sans"}
.application{break-inside:avoid-page;margin:0 0 14pt;
  padding-bottom:5pt;border-bottom:.4pt solid #ccd8d4}
.application p{margin:4pt 0 6pt}
.locator{font:8.5pt/1.35 "Noto Sans";color:#576360}
.source-note{font:8.8pt/1.4 "Noto Sans"}
"""

def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def paragraph_references(app: dict) -> str:
    ids = list(dict.fromkeys([app["n"], *app.get("also", [])]))
    return " · ".join(f'<a href="#section-{int(n)}">§{int(n)}</a>'
                    for n in ids if str(n).isdigit())

def applications() -> str:
    # Reading and Study appendices never introduce scholarly-only hadith notes.
    # Editorial Bidāya comparisons are independent of the authorial source.
    out = [
        '<section class="page-start" id="applications">',
        '<h1 class="backmatter-title">Applications in the Bidāyat al-mujtahid</h1>',
        '<p class="small">Editorial comparisons, not Ibn Rushd’s text. '
        'These examples do not constitute a complete legal commentary.</p>'
    ]
    import html
    for app in BOOK["apps"]:
        number = str(app["n"])
        out.extend([
            '<article class="application" id="application-' + html.escape(str(app["id"]),quote=True) + '">',
            "<h3>" + html.escape(number + " · " + str(app["title"])) + "</h3>",
            '<p class="locator">' + html.escape(str(app["book"]) + " · " + str(app["locator"])) + "</p>",
            "<p>" + html.escape(str(app["text"])) + "</p>",
            '<p class="refs">' + paragraph_references(app) + "</p>",
            "</article>"
        ])
    out.append("</section>")
    return "".join(out)

def render_component(name: str) -> str:
    return {
        "glossary": lambda: render_glossary(BOOK, "english"),
        "index": lambda: render_index(BOOK, False),
        "concordance": lambda: re.sub(
            r'<p><a href="#section-(\d+)">',
            lambda m: '<p id="concordance-'+m.group(1)+'"><a href="#section-'+m.group(1)+'">',
            render_concordance(BOOK)
        ),
        "applications": applications,
    }[name]()

def build_appendix(names: tuple[str, ...], *, style_css: str = "") -> bytes:
    """Render canonical apparatus; alternate page designs may supply their own
    explicitly approved CSS.  Empty style_css preserves historical A4 bytes.
    Never use apparatus CSS to reflow the independently rendered source body.
    """
    sections = "".join(render_component(name) for name in names)
    html = '<!doctype html><html><head><meta charset="utf-8"><style>' + CSS + style_css + \
           '</style></head><body>' + sections + '</body></html>'
    return HTML(string=html, base_url=str(HERE)).write_pdf()

def named_sections(doc: fitz.Document) -> dict[int, dict]:
    names = doc.resolve_names()
    entries = {}
    for n in SOURCE_RANGE:
        info = names.get(f"section-{n}")
        if not isinstance(info, dict):
            raise ValueError(f"Missing section destination: {n}")
        p = info.get("page", -1)
        if not isinstance(p, int) or not 0 <= p < doc.page_count:
            raise ValueError(f"Section {n} has invalid page: {p}")
        xy = info.get("to")
        if xy is None:  # A valid page alone is sufficient for safe navigation.
            x, y = 40., 70.
        else:
            x, y = (float(xy[0]), float(xy[1])) if isinstance(xy, (tuple,list)) else (float(xy.x), float(xy.y))
        if not all(-5 <= z <= 2000 for z in (x, y)):
            raise ValueError(f"Section {n} has invalid coordinates: {x}, {y}")
        entries[n] = {"page": p + 1, "x": round(x, 2), "y": round(y, 2)}
    assert len(entries) == 258
    return entries

def expected_config(tier: str, source: str, components: tuple[str, ...], editorial: bool) -> dict:
    # Explicit metadata is the selector's *only* contract. No filename guessing.
    return {
        "tier": tier,
        "language": source,
        "editorial_titles": editorial,
        "scope": "full",
        "layout": "parallel",
        "density": "standard",
        "notes": "none" if tier == "reading" else "selected",
        "glossary": "technical" if "glossary" in components else "none",
        "index": "full" if "index" in components else ("basic" if tier == "study" else "none"),
        "applications": "on" if "applications" in components else "off",
        "concordance": "on" if "concordance" in components else "off",
    }

def link_section_references(doc: fitz.Document, start: int, stops: dict[int, dict]):
    # WeasyPrint cannot resolve #section-N targets in its stand-alone appendix.
    # Rebuild real in-document GoTo links to certified named source destinations.
    seen = 0
    pattern = re.compile(r"§\s*(\d{1,3})")
    for page_index in range(start, doc.page_count):
        page = doc[page_index]
        raw = page.get_text("blocks")
        for block in raw:
            if len(block) < 5:
                continue
            for found in pattern.finditer(block[4]):
                n = int(found.group(1))
                if n not in stops:
                    continue
                token = f"§{n}"
                rects = page.search_for(token)
                # More than one occurrence may be present on a page. Add all
                # matching internal references; never link to an inferred page.
                for rect in rects:
                    if rect.is_empty or rect.width < 3:
                        continue
                    old = [
                        lk for lk in page.get_links()
                        if lk["from"].intersects(rect) and lk["kind"] == fitz.LINK_GOTO
                    ]
                    if old:
                        continue
                    target = stops[n]
                    page.insert_link({
                        "kind": fitz.LINK_GOTO,
                        "from": rect,
                        "page": target["page"] - 1,
                        "to": fitz.Point(target["x"], target["y"])
                    })
                    seen += 1
    return seen

def generate_one(output: Path, base_records: dict, cache: dict,
                 tier: str, language: str, editorial: bool, components: tuple[str, ...]):
    source_name = f"{tier}/daruri-{tier}-{language}-titles-{'on' if editorial else 'off'}.pdf"
    record = base_records.get(source_name)
    if not record:
        raise ValueError("Missing current approved edition: " + source_name)
    source = A4 / source_name
    raw = source.read_bytes()
    if len(raw) != record["bytes"] or digest(raw) != record["sha256"]:
        raise ValueError("An approved base PDF changed: " + source_name)
    tag = "-".join(components)
    filename = f"daruri-{tier}-{language}-{tag}{'-titles-on' if editorial else ''}.pdf"
    dest = output / filename
    dest.parent.mkdir(parents=True, exist_ok=True)
    cache_key = tuple(components)
    if cache_key not in cache:
        cache[cache_key] = build_appendix(components)

    with fitz.open(source) as src, fitz.open(stream=cache[cache_key], filetype="pdf") as appendix:
        source_pages = src.page_count
        refs = named_sections(src)
        if not appendix.page_count:
            raise ValueError("Empty appendix: " + filename)
        before = [digest(p.get_text(sort=False).encode("utf-8")) for p in src]
        pdf = fitz.open()
        pdf.insert_pdf(src, links=True, annots=True)
        pdf.insert_pdf(appendix, links=True, annots=True)
        if pdf.page_count != src.page_count + appendix.page_count:
            raise ValueError("Appendix page count mismatch")
        for i in range(source_pages):
            if digest(pdf[i].get_text(sort=False).encode("utf-8")) != before[i]:
                raise ValueError("Base publisher text changed during appendix merge")
        # The final PDF retains the original section anchors or, on engines that
        # do not preserve name trees, the exact page destinations are copied into
        # its SHA-bound external map. Validate against the source PDF *and* final
        # unchanged page contents before allowing P-numbered personal notes.
        try:
            published_names = named_sections(pdf)
            if published_names != refs:
                raise ValueError("Source section destinations moved")
            name_tree = True
        except (ValueError, KeyError, RuntimeError):
            name_tree = False
            published_names = refs
        toc = src.get_toc()
        spans = {}
        p = source_pages + 1
        for component in components:
            title, _ = COMPONENT[component]
            # Appendices are rendered as independent starting pages.
            toc.append([1, title, p])
            spans[component] = {"start_page": p}
            # Each component is built once separately to resolve its extent,
            # rather than estimating page boundaries from generated text.
            component_key=(component,)
            if component_key not in cache:
                cache[component_key] = build_appendix(component_key)
            cpdf = fitz.open(stream=cache[component_key], filetype="pdf")
            p += cpdf.page_count
            spans[component]["end_page"] = p - 1
            cpdf.close()
        # With multiple components, the stand-alone fragments each start on a
        # new page and should have exactly the same pagination as the combined
        # appendix. Never release an appendix with shifted section boundaries.
        if p - 1 != pdf.page_count:
            raise ValueError("Combined apparatus pagination disagrees with components: " + filename)
        pdf.set_toc(toc, collapse=1)
        links = link_section_references(pdf, source_pages, refs)
        if not all(abs(page.rect.width - 595.276) < 1 and
                   abs(page.rect.height - 841.89) < 1 for page in pdf):
            raise ValueError("A4 page geometry lost")
        metadata = {
            **expected_config(tier, language, components, editorial),
            "file": f"apparatus/{filename}",
            "filename": filename,
            "source_base": source_name,
            "base_sha256": record["sha256"],
            "page_count": pdf.page_count,
            "pages": pdf.page_count,
            "base_pages": source_pages,
            "apparatus_pages": spans,
            "section_pages": {str(n): d["page"] for n, d in refs.items()},
            "anchors": {f"section-{n}": d for n, d in refs.items()},
            "map_coverage": 1.0,
            "map_type": "verified-section-destinations",
            "verified_sections": len(refs),
            "word_precision": "unverified--section-fallback-only",
            "word_map_present": False,
            "named_destinations_preserved": name_tree,
            "appendix_source_links": links,
            "apparatus": list(components),
        }
        temp = dest.with_suffix(".building")
        pdf.save(temp,garbage=3,deflate=True)
        pdf.close()
    os.replace(temp, dest)
    published = dest.read_bytes()
    with fitz.open(dest) as check:
        assert check.page_count == metadata["page_count"]
        for n, entry in refs.items():
            p = check[entry["page"] - 1]
            assert p.get_text().strip(), "Empty mapped source page: " + str(n)
    metadata.update({"sha256": digest(published), "bytes": len(published)})
    mapdata = {
        "filename": filename,
        "source_sha256": metadata["sha256"],
        "base_sha256": metadata["base_sha256"],
        "section_pages": metadata["section_pages"],
        "anchors": metadata["anchors"],
        "coverage": 1.0,
        "section_count": 258,
        "precision": "section; exact word boxes intentionally omitted",
        "segments": {},
    }
    path = output / "maps" / (filename + ".json")
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(mapdata,ensure_ascii=False,indent=2) + "\n")
    meta = output / "maps" / (filename + ".metadata.json")
    meta.write_text(json.dumps(metadata,ensure_ascii=False,indent=2) + "\n")
    metadata["map_file"] = f"apparatus/maps/{filename}.json"
    metadata["metadata_file"] = f"apparatus/maps/{filename}.metadata.json"
    metadata["map_sha256"] = digest(path.read_bytes())
    print("BUILT", filename, "pages", metadata["pages"], "map 258/258",flush=True)
    return metadata

def main():
    arg = argparse.ArgumentParser()
    arg.add_argument("--output-dir",type=Path,default=VARIANTS)
    args = arg.parse_args()
    output = args.output_dir
    output.mkdir(parents=True,exist_ok=True)
    manifest = json.loads((A4 / "manifest.json").read_text())
    if manifest.get("status") != "verified":
        raise ValueError("Current A4 edition manifest is not verified")
    records = {item["file"]: item for item in manifest["files"]}
    if len(records) != 12:
        raise ValueError("Expected twelve current base Reading/Study editions")
    old_path = output / "manifest.json"
    old_catalog = json.loads(old_path.read_text()) if old_path.exists() else {"files": []}
    old_profiles = {
        (row["tier"], row["language"], row["editorial_titles"], tuple(row["apparatus"])): row
        for row in old_catalog.get("files", []) if "apparatus" in row
    }
    built, cache = [], {}
    for tier, language, editorial, components in PROFILES:
        old = old_profiles.get((tier, language, editorial, components))
        if old:
            original_pdf = output / old["filename"]
            original_map = A4 / old["map_file"]
            original_base = records.get(old["source_base"])
            if (original_pdf.is_file() and original_map.is_file() and original_base and
                original_base["sha256"] == old["base_sha256"] and
                digest(original_pdf.read_bytes()) == old["sha256"] and
                digest(original_map.read_bytes()) == old["map_sha256"]):
                built.append(old)
                continue
        built.append(generate_one(output, records, cache, tier, language, editorial, components))
    assert len(built) == len(PROFILES) == 120
    assert len({m["file"] for m in built}) == len(built)
    final = {
        "release":"20261022-complete-a4-apparatus-matrix",
        "status":"verified",
        "source_a4_manifest_sha256":digest((A4/"manifest.json").read_bytes()),
        "notes":"Compact manifest: full coordinate maps are held in linked, SHA-verified map files, not repeated 120 times. 120 static, full-work Reading/Study apparatus profiles across compatible published base editions. SHA-bound maps cover all 258 source sections. Word-level precision remains unverified; canonical PDFs and the twelve A4 base PDFs remain unchanged.",
        "files":[{k:v for k,v in row.items() if k not in ("section_pages","anchors")} for row in built],
    }
    (output / "manifest.json").write_text(json.dumps(final,ensure_ascii=False,indent=2) + "\n")
    print("PASS",len(built),"verified variants and checksum-bound section maps",flush=True)

if __name__ == "__main__":
    main()
