#!/usr/bin/env python3
"""NONRELEASE audit of font coverage for every original Daruri Arabic passage.

Read the same canonical 258-section/414-passage fixture used by the full
browser-only PDF experiment. Diagnose missing *painted* glyphs separately
from source Unicode semantics. Never alter source, normalize away editorial
brackets, or declare a PDF verified based on glyph coverage alone.
"""
from __future__ import annotations

import argparse
from collections import Counter
import json
from pathlib import Path
import re
import unicodedata
from fontTools.ttLib import TTFont

FONTS = {
    "arabic_primary": "NotoNaskhArabic-Regular.ttf",
    "sans_fallback": "NotoSans-Regular.ttf",
    "serif_fallback": "NotoSerif-Regular.ttf",
}
SOURCE_SCHEMA = "daruri-real-source-browser-pdf-stress-v1"


def canonical(text: str) -> str:
    return re.sub(r"\s+", " ", str(text).strip())


def cmap(path: Path) -> set[int]:
    with TTFont(str(path), lazy=True) as font:
        mapping = font.getBestCmap()
        if not mapping:
            raise ValueError(f"No Unicode cmap in {path}")
        return {int(cp) for cp, name in mapping.items() if name != ".notdef"}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--fixture", type=Path, required=True)
    ap.add_argument("--font-root", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    args = ap.parse_args()
    fixture = json.loads(args.fixture.read_text(encoding="utf-8"))
    sections = fixture.get("full_sections", [])
    if (fixture.get("schema") != SOURCE_SCHEMA or
        fixture.get("authorial_sections") != 258 or
        fixture.get("authorial_passages") != 414 or
        len(sections) != 258):
        raise ValueError("Source fixture is not the canonical 258/414 edition")
    coverage = {name: cmap(args.font_root / file) for name, file in FONTS.items()}
    occurrences: Counter[int] = Counter()
    first: dict[int, list[dict]] = {}
    ids: set[str] = set()
    paragraphs = 0
    for section in sections:
        for seg in section.get("segments", []):
            ref = str(seg.get("id", ""))
            if not ref or ref in ids:
                raise ValueError("Duplicate/empty original paragraph ID")
            ids.add(ref)
            paragraphs += 1
            phrase = canonical(seg.get("arabic", ""))
            if not phrase or not any("\u0600" <= ch <= "\u06ff" for ch in phrase):
                raise ValueError(f"Missing Arabic original in {ref}")
            for ch in phrase:
                cp = ord(ch)
                occurrences[cp] += 1
                if len(first.setdefault(cp, [])) < 3:
                    loc = {"id": ref, "section": section["id"]}
                    if loc not in first[cp]:
                        first[cp].append(loc)
    if paragraphs != 414 or len(ids) != 414:
        raise ValueError(f"Expected 414 original Arabic passages, got {paragraphs}")
    by_cp = []
    for cp in sorted(occurrences):
        char = chr(cp)
        category = unicodedata.category(char)
        # Format and control characters are not painted; they remain part
        # of the exact source/ToUnicode contract and are audited distinctly.
        painted = category not in ("Cf", "Cc", "Zl", "Zp")
        supported = [name for name, chars in coverage.items() if cp in chars]
        primary = "arabic_primary" in supported
        by_cp.append({
            "codepoint": f"U+{cp:04X}",
            "char": char,
            "unicode_name": unicodedata.name(char, "<unnamed>"),
            "category": category,
            "occurrences": occurrences[cp],
            "painted": painted,
            "arabic_primary": primary,
            "fallback_fonts": [x for x in supported if x != "arabic_primary"],
            "missing_in_all_bundled_fonts": painted and not supported,
            "sample_passages": first[cp],
        })
    missing = [r for r in by_cp if r["painted"] and not r["arabic_primary"]]
    unhandled = [r for r in missing if r["missing_in_all_bundled_fonts"]]
    fallback = [r for r in missing if not r["missing_in_all_bundled_fonts"]]
    summary = {
        "original_sections": 258,
        "original_passages": 414,
        "unique_source_codepoints": len(by_cp),
        "painted_codepoints_missing_primary": len(missing),
        "covered_by_a_bundled_fallback": len(fallback),
        "missing_in_every_bundled_font": len(unhandled),
        "format_or_control_codepoints": sum(not x["painted"] for x in by_cp),
    }
    report = {
        "schema": "gnamma-full-source-font-glyph-coverage-audit-v1",
        "nonrelease": True,
        "source_sha256": fixture["source_sha256"],
        "fonts": FONTS,
        "summary": summary,
        "primary_missing": missing,
        "all_uncovered": unhandled,
        "per_codepoint": by_cp,
        "source_unicode_unmodified": True,
        "verified_output_pdf": False,
        "warning": (
            "Coverage does not verify HarfBuzz shaping, glyph outline position, "
            "per-word selection, Unicode PDF extraction, bilingual layout, "
            "footnotes, links, or mobile/production use."
        ),
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n",
                        encoding="utf-8")
    print("GNAMMA_FULL_ORIGINAL_ARABIC_GLYPH_AUDIT",
          json.dumps(summary, ensure_ascii=False), flush=True)
    for rec in missing:
        print("GLYPH_GAP", rec["codepoint"], rec["char"], rec["unicode_name"],
              "count", rec["occurrences"], "fallback", rec["fallback_fonts"],
              "source", rec["sample_passages"][:2], flush=True)
    # Missing glyphs are evidence, not a reason to fail an audit. This
    # diagnostic deliberately leaves the PDF renderer unchanged.
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
