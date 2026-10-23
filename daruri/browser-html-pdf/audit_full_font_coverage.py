#!/usr/bin/env python3
"""Source-to-font glyph-coverage preflight for full original Daruri Arabic.
Research only; report every code point, never delete unsupported text.
"""
from pathlib import Path
from collections import defaultdict,Counter
import sys,json,unicodedata
from fontTools.ttLib import TTFont
HERE=Path(__file__).resolve().parent
ROOT=HERE.parent
sys.path.insert(0,str(ROOT/"build"))
from build_editions import read_book

def cmap(path):
    f=TTFont(path,lazy=True)
    try:
        return set(f.getBestCmap() or {})
    finally:
        f.close()

def main():
    book=read_book()
    sections=[s for s in book['sections'] if isinstance(s.get('id'),int) and 1<=s['id']<=258]
    corpus=[(s['id'],v['vocalized']) for s in sections for v in s['segments']]
    assert len(corpus)==414
    p=ROOT/"build/fonts"
    fonts={
      "Naskh":cmap(p/"NotoNaskhArabic-Regular.ttf"),
      "Serif":cmap(p/"NotoSerif-Regular.ttf"),
      "Sans":cmap(p/"NotoSans-Regular.ttf")
    }
    missing=defaultdict(list)
    counts=Counter()
    for sid,line in corpus:
        for ch in line:
            cp=ord(ch)
            counts[cp]+=1
            if not ch.isspace() and not any(cp in glyphs for glyphs in fonts.values()):
                missing[cp].append(sid)
    out=[]
    for cp,num in counts.most_common():
        if chr(cp).isspace():continue
        supported=[key for key,val in fonts.items() if cp in val]
        if "Naskh" not in supported or not supported:
            out.append({"cp":"U+%04X"%cp,"char":chr(cp),
               "unicode_name":unicodedata.name(chr(cp),"UNKNOWN"),
               "count":num,"supported_fonts":supported,
               "example_sections":list(dict.fromkeys(missing[cp]))[:5]})
    report={"canonical_segments":414,"source_codepoints":len(counts),
      "not_in_naskh":sum("Naskh" not in d['supported_fonts'] for d in out),
      "unsupported_across_three_fonts":len(missing),
      "missing":out}
    print("DARURI_FULL_SOURCE_FONT_COVERAGE",json.dumps(report,ensure_ascii=False))
    if missing:
        print("GLYPHS_NEED_NEW_FALLBACK",len(missing))
        return 2
    print("GLYPH_PRECHECK_PASSED_WITH_FALLBACKS")
    return 0

if __name__=="__main__":
    raise SystemExit(main())