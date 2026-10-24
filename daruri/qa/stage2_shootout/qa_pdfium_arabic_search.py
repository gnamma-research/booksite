#!/usr/bin/env python3
"""Research-only native PDFium search QA for original 258 Daruri Arabic section openings.

Usage:
  python qa_pdfium_arabic_search.py original.html computed.pdf report.json

Read-only. The only input PDF is a browser-generated output under test;
the canonical author's text comes exclusively from source-derived HTML.
Optional diagnostic, not an acceptance test; exact tashkeel search is deprioritized.
"""
from __future__ import annotations
import hashlib, json, re, sys, unicodedata
from pathlib import Path
from bs4 import BeautifulSoup
import fitz
import pypdfium2 as pdfium


def unvowelled(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFC", s)
                   if unicodedata.category(c) != "Mn" and c != "\u0640")


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("Need full original HTML, computed PDF, output JSON")
    source, pdf, output = (Path(v) for v in sys.argv[1:])
    html = BeautifulSoup(source.read_text("utf8"), "lxml")
    openings = {}
    for element in html.select("p.source-segment.arabic[data-segment-index='0']"):
        section = element.get("data-section-id", "")
        if not section.isdigit():
            continue  # Original two post-script layout segments do not have section numbers.
        words = [x for x in element.get_text(" ", strip=True).split()
                 if re.search(r"[\u0621-\u064a]", x)]
        if len(words) < 2:
            raise AssertionError("Section has insufficient original Arabic words")
        if int(section) in openings:
            raise AssertionError("Duplicate original section opening")
        openings[int(section)] = words[:2]
    if set(openings) != set(range(1, 259)):
        raise AssertionError("Need all 258 original section-opening source texts")

    with fitz.open(pdf) as reader:
        names = reader.resolve_names()
        sections = {n: names.get("section-" + str(n)) for n in openings}
        missing = [n for n, dest in sections.items() if not dest]
        if missing:
            raise AssertionError("Cannot assess actual destination pages; missing IDs: " +
                                 repr(missing[:12]))
        page_count = len(reader)

    namesearch = {
        "first_word_vowelled": lambda w: w[0],
        "first_word_without_diacritics": lambda w: unvowelled(w[0]),
        "first_two_words_vowelled": lambda w: " ".join(w),
        "first_two_words_without_diacritics": lambda w: unvowelled(" ".join(w)),
    }
    counts = {key: 0 for key in namesearch}
    failures = []
    browser_pdf = pdfium.PdfDocument(str(pdf))
    try:
        for no, words in sorted(openings.items()):
            queries = {key: func(words) for key, func in namesearch.items()}
            hits = {key: False for key in queries}
            first = sections[no]["page"]
            for pi in range(first, min(first + 2, page_count)):
                p = browser_pdf[pi]
                t = p.get_textpage()
                try:
                    for key, query in queries.items():
                        if not hits[key] and t.search(query).get_next() is not None:
                            hits[key] = True
                finally:
                    t.close()
                    p.close()
            for key, hit in hits.items():
                counts[key] += int(hit)
            if not hits["first_word_without_diacritics"] and len(failures) < 12:
                failures.append({"section": no, "pdf_page": first + 1,
                                 "source_first_word": queries["first_word_without_diacritics"]})
    finally:
        browser_pdf.close()

    report = {
        "schema": "gnamma-paged-original-arabic-pdfium-native-source-word-search-v1",
        "research_only": True,
        "pdf_generated_from_existing_pdf": False,
        "canonical_html_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "tested_browser_pdf_sha256": hashlib.sha256(pdf.read_bytes()).hexdigest(),
        "source_sections": len(openings),
        "physical_pdf_pages": page_count,
        "search_region": "actual named section page plus immediately following page",
        "native_reader": "PDFium through pypdfium2 PdfTextPage.search()",
        "counts": counts,
        "search_failures_sample": failures,
        "optional_arabic_search_diagnostic_pass":
            all(x == len(openings) for x in counts.values()),
        "exact_copy_highlight_and_iphone_verified": False,
        "publication_approved": False
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", "utf8")
    print("GNAMMA_NATIVE_PDFIUM_ARABIC_SEARCH_QA", json.dumps(report, ensure_ascii=False), flush=True)
    if not report["optional_arabic_search_diagnostic_pass"]:
        print("::warning::Optional exact Arabic native-search diagnostic did not match; this is not a release blocker.", flush=True)


if __name__ == "__main__":
    main()
