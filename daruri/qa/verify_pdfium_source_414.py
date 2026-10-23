#!/usr/bin/env python3
"""Read-only PDFium source Arabic search + *visible position* acceptance.

Accepts an original SHA-pinned PDF/Pango map and an experimental candidate.
Tests one uniquely grounded, adjacent pair of *actual Arabic words* from every
authorial segment (not punctuation-bearing annotation tokens). PDFium canonical
NFC equivalence is applied to each query because Unicode Arabic Shadda/Fatha
order is normalized by native PDFium search and text extraction.

This tests the native PDFium engine, not a physical Android app or accessibility.
Never modifies or overwrites any publication.
"""
import argparse
import hashlib
import json
import unicodedata
from pathlib import Path

import pypdfium2 as pdfium


def lexical(word):
    return bool(word) and all(unicodedata.category(c)[0] in ("L", "M") for c in word)


def unite(a, b):
    return (min(a[0], b[0]), min(a[1], b[1]),
            max(a[2], b[2]), max(a[3], b[3]))


def overlap(a, b):
    x0, y0 = max(a[0], b[0]), max(a[1], b[1])
    x1, y1 = min(a[2], b[2]), min(a[3], b[3])
    inter = max(0, x1 - x0) * max(0, y1 - y0)
    aa = max(0, a[2] - a[0]) * max(0, a[3] - a[1])
    bb = max(0, b[2] - b[0]) * max(0, b[3] - b[1])
    return inter / (aa + bb - inter) if aa + bb > inter else 0.0


def pairs(mapping):
    for key, words in mapping["segments"].items():
        if not key.endswith((":ar", ":vocalized")):
            continue
        page = int(words[0][1])
        same = [w for w in words if int(w[1]) == page]
        found = None
        for index in range(len(same) - 1):
            a, b = same[index:index + 2]
            if abs(a[3] - b[3]) < 0.05 and lexical(a[0]) and lexical(b[0]):
                found = (a, b)
                break
        if found is None:
            raise ValueError(f"No valid contiguous original Arabic source words: {key}")
        yield key, page, found


def test(source, candidate, mapping_file):
    manifest = json.loads(mapping_file.read_text("utf-8"))
    actual = hashlib.sha256(source.read_bytes()).hexdigest()
    if actual != manifest["source_sha256"]:
        raise ValueError("Original Pango coordinates have a different source PDF SHA")
    if manifest["section_count"] != 258:
        raise ValueError("Source lacks 258 unique named sections")
    entries = list(pairs(manifest))
    if len(entries) != 414:
        raise ValueError(f"Expected 414 original Arabic source segments, got {len(entries)}")
    pdf = pdfium.PdfDocument(candidate)
    cache = {}
    hit = aligned = 0
    positions = []
    failures = []
    for key, num, pair in entries:
        if not 1 <= num <= len(pdf):
            raise ValueError(f"Source passage outside PDF: {key}")
        if num not in cache:
            page = pdf[num - 1]
            cache[num] = page, page.get_textpage()
        page, text = cache[num]
        needle = unicodedata.normalize("NFC", pair[0][0] + " " + pair[1][0])
        native = text.search(needle)
        expected = (
            min(w[2] for w in pair),
            page.get_height() - max(w[5] for w in pair),
            max(w[4] for w in pair),
            page.get_height() - min(w[3] for w in pair),
        )
        found = False
        best = 0.0
        for _ in range(120):
            result = native.get_next()
            if result is None:
                break
            found = True
            start, count = result
            if start < 0 or count < 1:
                continue
            # PDFium's tight glyph boxes for invisible 3 Tr text can have
            # almost zero height. Its documented LOOSE char boxes reflect
            # the real line-height used by native PDFium selection.
            box = text.get_charbox(start, loose=True)
            for i in range(start + 1, start + count):
                box = unite(box, text.get_charbox(i, loose=True))
            best = max(best, overlap(expected, box))
        hit += found
        positions.append(best)
        aligned += best >= 0.6
        if best < 0.6 and len(failures) < 30:
            failures.append({
                "segment":key,"page":num,"query_nfc":needle,
                "found":found,"max_source_iou":round(best,4),
            })
    return {
        "engine":str(pdfium.version.PDFIUM_INFO),
        "source_sha256":actual,
        "candidate_sha256":hashlib.sha256(candidate.read_bytes()).hexdigest(),
        "segments":len(entries),
        "nfc_queries_found":hit,
        "source_aligned_iou_ge_0_6":aligned,
        "iou_min":round(min(positions),6),
        "iou_median":round(sorted(positions)[len(positions)//2],6),
        "first_failures":failures,
        "source_pdfs_untouched":True,
        "release_approved":False,
        "disclaimer":"PDFium core is not a real Android-device, Adobe Acrobat or Apple PDFKit acceptance test",
    }


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--source",required=True,type=Path)
    p.add_argument("--candidate",required=True,type=Path)
    p.add_argument("--map",required=True,type=Path)
    p.add_argument("--report",required=True,type=Path)
    p.add_argument("--strict",action="store_true")
    a=p.parse_args()
    report=test(a.source,a.candidate,a.map)
    a.report.parent.mkdir(parents=True,exist_ok=True)
    a.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("PDFIUM_ORIGINAL_414_QA",json.dumps(report,ensure_ascii=False),flush=True)
    if a.strict and (report["nfc_queries_found"]!=414 or
                     report["source_aligned_iou_ge_0_6"]!=414):
        raise SystemExit(1)


if __name__=="__main__":
    main()
