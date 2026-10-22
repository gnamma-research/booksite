#!/usr/bin/env python3
"""Experimental HTML-first (NO prebuilt-PDF inputs) Daruri book typesetting.

Build real Arabic/English Reading and Study source PDFs from the canonical
edition-r3 reader data + HTML/CSS + pinned WeasyPrint/Pango fonts. The first
three proofs never feed any pre-existing source/appendix PDF to the renderer:
published PDF files are opened *only afterwards* for independent QA comparison.

A fourth, separate experiment puts the glossary HTML in the same document as
a complete Reading book and performs a single WeasyPrint paged render. It is
explicitly not yet the approved 120-profile publication engine. No output is
saved to the repo, no original PDFs or notes are changed.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import resource
import sys
import time

import fitz
from weasyprint import HTML

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "build"
sys.path.insert(0, str(BUILD))
sys.path.insert(0, str(ROOT / "qa"))

import build_editions     # noqa: E402
import print_editions     # noqa: E402
import publish_editions   # noqa: E402
from build_apparatus_variants import render_component  # noqa: E402
from verify_dynamic_apparatus_links import equivalent_links  # noqa: E402

PROFILES = {
    "reading-bilingual": ("reading", "bilingual", "reading/daruri-reading-bilingual-titles-off.pdf"),
    "reading-english": ("reading", "english", "reading/daruri-reading-english-titles-off.pdf"),
    "study-bilingual": ("study", "bilingual", "study/daruri-study-bilingual-titles-off.pdf"),
}
ONE_PASS_GOLD = "apparatus/daruri-reading-bilingual-glossary.pdf"
PAGE_SIZE = (595.276, 841.89)


def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def canonical_source_sha() -> str:
    return sha(ROOT / "edition-r3-20261020.js")


def structural_snapshot(pdf_path: Path) -> dict:
    with fitz.open(pdf_path) as pdf:
        names = pdf.resolve_names()
        source_sections = [f"section-{n}" for n in range(1, 259)]
        anchors = sum(item in names for item in source_sections)
        out_of_bounds = []
        invalid_links = []
        for n, page in enumerate(pdf):
            for link in page.get_links():
                if (link.get("kind") == fitz.LINK_GOTO and
                    (not isinstance(link.get("page"), int) or
                     not 0 <= link["page"] < len(pdf))):
                    if len(invalid_links) < 6:
                        invalid_links.append(n + 1)
            for block in page.get_text("blocks"):
                if len(block) < 5 or not isinstance(block[4], str) or not block[4].strip():
                    continue
                x0, y0, x1, y1 = block[:4]
                if min(x0, y0) < -1 or x1 > page.rect.width + 1 or y1 > page.rect.height + 1:
                    if len(out_of_bounds) < 6:
                        out_of_bounds.append(n + 1)
        return {
            "pages": len(pdf),
            "source_section_names": anchors,
            "named_destinations": len(names),
            "out_of_bounds_sample": out_of_bounds,
            "invalid_internal_link_pages": invalid_links,
            "toc_items": len(pdf.get_toc()),
            "sha256": sha(pdf_path),
            "bytes": pdf_path.stat().st_size,
        }


def compare_with_approved(candidate: Path, approved: Path) -> dict:
    if not approved.is_file():
        return {"baseline_available": False, "issues": ["Approved PDF unavailable"]}
    with fitz.open(candidate) as new, fitz.open(approved) as gold:
        pages = min(len(new), len(gold))
        pixel = text = words = 0
        error_pages = []
        links_differ = []
        for i in range(pages):
            a, b = gold[i], new[i]
            if a.rect == b.rect and a.get_pixmap(alpha=False).samples == b.get_pixmap(alpha=False).samples:
                pixel += 1
            elif len(error_pages) < 12:
                error_pages.append(i + 1)
            if a.get_text() == b.get_text():
                text += 1
            def geom(page):
                return [(w[4], *[round(v, 2) for v in w[:4]]) for w in
                        page.get_text("words", sort=False)]
            if geom(a) == geom(b):
                words += 1
            bad, _, _ = equivalent_links(a.get_links(), b.get_links())
            if bad and len(links_differ) < 12:
                links_differ.append({"page": i + 1, "reason": bad[:1]})
        sections = [
            a for a in range(1, 259)
            if gold.resolve_names().get(f"section-{a}") ==
               new.resolve_names().get(f"section-{a}")
        ]
        return {
            "baseline_available": True,
            "approved_pages": len(gold),
            "generated_pages": len(new),
            "page_count_equal": len(new) == len(gold),
            "pixel_equal_pages": pixel,
            "text_equal_pages": text,
            "word_geometry_equal_pages": words,
            "toc_equal": gold.get_toc() == new.get_toc(),
            "source_section_destinations_equal": len(sections),
            "first_changed_raster_pages": error_pages,
            "first_changed_hyperlink_pages": links_differ,
            "approved_sha256": sha(approved),
            "bytes_identical": sha(approved) == sha(candidate),
        }


def build_source(tier: str, language: str, output: Path, html: Path) -> dict:
    if tier == "reading":
        raw = output.with_name("raw-" + output.name)
        reading = print_editions.build(
            language, range(1, 259), "full", "Complete reading text",
            raw, editorial_titles=False, html_source=html
        )
        source = publish_editions.finalize(
            raw, output, print_editions.BOOK["sections"],
            tier, language, False
        )
        if reading["paragraphs"] != 414 or source["notes"] != "none":
            raise ValueError("Reading body lost authorial passages or gained publisher notes")
        raw.unlink()
        return {
            "source_kind": "complete HTML from canonical reader data",
            "authorial_segments": reading["paragraphs"],
            "source_sections": len(reading["sections"]),
            "notes": "none",
            "annotation_plan_validated": "not applicable for Reading"
        }
    if tier == "study":
        location = html.parent / "study-full-html-stage"
        meta = build_editions.build("study", location, editorial_titles=False)
        raw = location / meta["filename"]
        captured = location / (meta["filename"] + ".html")
        if not captured.exists():
            raise ValueError("Canonical full Study HTML was not emitted")
        html.write_bytes(captured.read_bytes())
        source = publish_editions.finalize(
            raw, output, print_editions.BOOK["sections"],
            "study", "bilingual", False
        )
        if not meta["main_text_validation"]["ok"] or not meta["footnote_pagination"]["ok"]:
            raise ValueError("True Study note-calls and bodies failed their pagination validator")
        if source["notes"] != "selected":
            raise ValueError("Study tier lost selected publisher-note policy")
        return {
            "source_kind": "complete Study HTML from canonical reader and editorial note data",
            "authorial_segments": 414,
            "source_sections": 258,
            "notes": source["notes"],
            "quran_source_records": meta["source_notes"]["quran"],
            "hadith_source_records": meta["source_notes"]["hadith"],
            "footnote_pagination": meta["footnote_pagination"],
            "repeated_note_anchors": meta["repeated_footnotes"],
            "forced_note_breaks": meta["forced_footnote_breaks"],
        }
    raise ValueError(f"Not an approved experiment tier: {tier}")


APPENDIX_CSS = r"""
/* Experimental SINGLE-PASS HTML pipeline: body + glossary rendered together.
   Do not inject the old apparatus stylesheet's global html/body rules,
   which would accidentally reflow the approved original Reading text. */
@page appendix {
  size: A4;
  margin: 14mm 13mm 15mm;
  @bottom-right { content: counter(page); font: 8pt "Noto Sans"; }
}
#gn-html-first-apparatus {
  page: appendix;
  break-before: page;
  font: 9.7pt/1.45 "Noto Serif";
  color: #172523;
}
#gn-html-first-apparatus .page-start {break-before: page}
#gn-html-first-apparatus .page-start:first-child {break-before: auto}
#gn-html-first-apparatus .backmatter-title {
  font: 600 19pt/1.28 "Noto Serif"; margin: 0 0 6pt;
}
#gn-html-first-apparatus .small {
  font: 8.2pt/1.45 "Noto Sans"; color: #566361; margin: 0 0 10pt;
}
#gn-html-first-apparatus .glossary-columns {
  column-count: 2; column-gap: 16pt;
}
#gn-html-first-apparatus .glossary-entry {
  break-inside: avoid-column; margin: 0 0 7pt;
}
#gn-html-first-apparatus .glossary-entry p {margin: 0 0 5pt}
#gn-html-first-apparatus .glossary-entry .ar {
  font: 12pt/1.5 "Noto Naskh Arabic"; direction: rtl; text-align: right;
}
/* These rules are part of the approved apparatus stylesheet. Without them,
   the source Reading h3 defaults produce a longer glossary (12 vs 10 pp). */
#gn-html-first-apparatus h3 {
  font: 600 10.5pt/1.4 "Noto Serif"; margin: 8pt 0 3pt;
}
#gn-html-first-apparatus .micro,
#gn-html-first-apparatus .refs {
  font: 8pt/1.4 "Noto Sans";color:#455452;
}
#gn-html-first-apparatus a {color: #205e65; text-decoration:none}
"""


def build_onepass(glossary_html: Path, output: Path) -> dict:
    complete = glossary_html.read_text(encoding="utf-8")
    if complete.count("</body>") != 1 or complete.count("</style>") != 1:
        raise ValueError("Expected exactly one canonical Reading HTML document")
    note_section = render_component("glossary")
    # Reuse the exact canonical Reading HTML, not pages extracted from any PDF.
    combined = complete.replace(
        "</style>", APPENDIX_CSS + "</style>", 1
    ).replace(
        "</body>", '<div id="gn-html-first-apparatus">' + note_section + "</div></body>", 1
    )
    html = output.with_suffix(".html")
    html.write_text(combined, encoding="utf-8")
    raw = output.with_suffix(".pdf")
    t0 = time.perf_counter()
    HTML(string=combined, base_url=BUILD.as_uri() + "/").write_pdf(raw)
    return {
        "source_kind": "single complete HTML book + scholarly glossary before PDF typesetting",
        "apparatus": ["glossary"],
        "html_sha256": sha(html),
        "html_bytes": html.stat().st_size,
        "render_seconds": round(time.perf_counter() - t0, 2),
        "footnote_policy": "Reading text contains no publisher study footnotes",
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--profile", choices=["all", *PROFILES, "singlepass-glossary"],
                        default="all")
    args = parser.parse_args()
    out = args.output_dir
    out.mkdir(parents=True, exist_ok=True)
    rows = []
    t_all = time.perf_counter()
    reading_html = None
    wanted = list(PROFILES) if args.profile == "all" else \
        ([args.profile] if args.profile in PROFILES else [])
    if args.profile == "singlepass-glossary":
        wanted = ["reading-bilingual"]
    for name in wanted:
        tier, language, goldfile = PROFILES[name]
        pdf = out / (name + ".pdf")
        html = out / (name + ".html")
        start = time.perf_counter()
        evidence = build_source(tier, language, pdf, html)
        if name == "reading-bilingual":
            reading_html = html
        actual = structural_snapshot(pdf)
        if actual["source_section_names"] != 258 or actual["invalid_internal_link_pages"]:
            raise ValueError("New HTML-first PDF omitted original destinations or links")
        if actual["out_of_bounds_sample"]:
            raise ValueError("New HTML-first PDF has clipped content")
        row = {
            "profile": name, "experiment": "HTML/CSS+WeasyPrint, no stored PDF input",
            "source_reader_sha256": canonical_source_sha(),
            "html_sha256": sha(html), "html_bytes": html.stat().st_size,
            "html_file": str(html), "pdf_file": str(pdf),
            "render_seconds": round(time.perf_counter() - start, 2),
            "rss_max_kib": resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,
            **evidence, "pdf": actual,
            "vs_approved": compare_with_approved(pdf, ROOT/"editions"/goldfile),
        }
        rows.append(row)
        print("HTML_FIRST_SOURCE_REPORT",
              json.dumps({k: v for k, v in row.items()
                          if k not in ("vs_approved", "footnote_pagination")},
                         ensure_ascii=False), flush=True)
    if (args.profile in ("all", "singlepass-glossary")) and reading_html:
        target = out / "reading-bilingual-glossary-singlepass"
        one = build_onepass(reading_html, target)
        pdf = target.with_suffix(".pdf")
        actual = structural_snapshot(pdf)
        row = {
            "profile": "singlepass-glossary",
            "experiment": "FULL book+appendix in ONE HTML document / ONE WeasyPrint pass",
            "source_reader_sha256": canonical_source_sha(),
            "pdf_file": str(pdf), "html_file": str(target.with_suffix(".html")),
            "rss_max_kib": resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,
            **one, "pdf": actual,
            "vs_approved": compare_with_approved(
                pdf, ROOT/"editions"/ONE_PASS_GOLD
            ),
        }
        rows.append(row)
        print("HTML_FIRST_SINGLEPASS",
              json.dumps({k: v for k, v in row.items() if k != "vs_approved"},
                         ensure_ascii=False), flush=True)
    result = {
        "scope": "A4-only Daruri HTML-origin PDF feasibility (NOT a publisher release)",
        "render_input_files": "canonical reader JSON embedded in JS, edition note JSON, local CSS and Noto fonts",
        "prebuilt_pdf_input_files": [],
        "approved_existing_pdfs_opened_only_for_A_B_comparison": True,
        "renderer": "Pinned WeasyPrint 68 + Pango/HarfBuzz",
        "duration_seconds": round(time.perf_counter()-t_all, 2),
        "rss_max_kib": resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,
        "results": rows,
        "release_approved": False,
        "missing_gates": [
            "All 120 single-pass typography/notes/link equivalence",
            "original authorial Arabic exact search, Unicode and copy cross-viewer",
            "browser-only print-to-blob feasibility and iOS downloadable file",
            "trusted backend versus offline client deployment/privacy",
            "all 258 section anchors/121 Study footnote calls across book",
        ],
    }
    (out/"html-first-report.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2)+"\n", encoding="utf-8"
    )
    print("HTML_FIRST_EXPERIMENT", json.dumps({
        "completed":len(rows),"duration_seconds":result["duration_seconds"],
        "results":[{
            "name":r["profile"],"pdf_pages":r["pdf"]["pages"],
            "approved_pages":r["vs_approved"].get("approved_pages"),
            "pixel_equal_pages":r["vs_approved"].get("pixel_equal_pages"),
            "source_anchors":r["pdf"]["source_section_names"],
            "render_seconds":r.get("render_seconds")
        } for r in rows]
    },ensure_ascii=False),flush=True)


if __name__=="__main__":
    main()
