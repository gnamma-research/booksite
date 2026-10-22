#!/usr/bin/env python3
"""Read-only audit of native PDF Arabic and English Unicode extractability.

It matches a normalized five-word prefix from each of 414 authorial source
segments against PDF-extracted Unicode. The metric is necessary but not
sufficient for native viewer search, copying, highlighting or RTL correctness.
Do not modify any PDF. A --require-arabic run intentionally fails until fixed.
"""
from pathlib import Path
import argparse
import json
import re
import unicodedata

import fitz

CASES = (
    ("canonical_ref_arabic", "daruri.pdf", "ar", "ar"),
    ("canonical_ref_english", "daruri.pdf", "en", "en"),
    ("canonical_arabic", "daruri-arabic.pdf", "ar", "ar"),
    ("canonical_vowelled", "daruri-arabic-vowelled.pdf", "ar", "vocalized"),
    ("a4_reading_arabic", "editions/reading/daruri-reading-bilingual-titles-off.pdf", "ar", "vocalized"),
    ("a4_reading_english", "editions/reading/daruri-reading-bilingual-titles-off.pdf", "en", "en"),
    ("a4_study_arabic", "editions/study/daruri-study-bilingual-titles-on.pdf", "ar", "vocalized"),
)

def norm(s, language):
    s = unicodedata.normalize("NFKC", s)
    if language == "ar":
        s = "".join(c for c in s if unicodedata.category(c) != "Mn" and c != "ـ")
        s = re.sub("[إأٱآ]", "ا", s).replace("ى", "ي")
        s = re.sub(r"[^ء-ي\s]", " ", s)
    else:
        s = s.casefold().replace("’", "'").replace("‘", "'")
        s = re.sub(r"[^a-z0-9\s']", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def audit(root):
    source = (root / "edition-r3-20261020.js").read_text(encoding="utf8")
    match = re.search(r'textContent\s*=\s*("(?:[^"\\]|\\.)*")\s*;', source, re.S)
    if not match:
        raise ValueError("Canonical 414-segment source data missing")
    book = json.loads(json.loads(match.group(1)))
    segments = [(int(s["id"]), seg) for s in book["sections"]
                if str(s["id"]).isdigit() and 1 <= int(s["id"]) <= 258
                for seg in s["segments"]]
    if len(segments) != 414:
        raise ValueError("Source segment count changed: " + str(len(segments)))
    rows = []
    for name, relpath, language, field in CASES:
        with fitz.open(root / relpath) as pdf:
            native = " ".join(norm(page.get_text(sort=False), language) for page in pdf)
            ok = 0
            failed = []
            for section, segment in segments:
                prefix = " ".join(norm(segment[field], language).split()[:5])
                if prefix and prefix in native:
                    ok += 1
                elif len(failed) < 4:
                    failed.append({"section": section, "prefix": prefix})
            rows.append({"edition": name, "pages": len(pdf), "matched": ok,
                         "total": len(segments), "rate": round(ok / len(segments) * 100, 2),
                         "first_misses": failed, "language": language})
    return rows

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    ap.add_argument("--json-out", type=Path)
    ap.add_argument("--require-arabic", action="store_true")
    args = ap.parse_args()
    results = audit(args.root)
    payload = json.dumps(results, indent=2, ensure_ascii=False) + "\n"
    print(payload)
    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(payload, encoding="utf8")
    if args.require_arabic and any(x["rate"] < 95 for x in results if x["language"] == "ar"):
        raise SystemExit("FAIL: native Arabic book-text extraction remains unreliable")
