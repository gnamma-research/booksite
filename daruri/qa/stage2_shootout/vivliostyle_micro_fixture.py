#!/usr/bin/env python3
"""Create a real-source micro-edition for first-pass Vivliostyle PDF engine tests.

Not a synthetic placeholder. Original CSS, real selected text, real Arabic,
note objects and two complete historical articles are preserved verbatim.
Source is the vetted FULL latest-source Scholarly HTML generated upstream.
"""
import sys
from pathlib import Path
from bs4 import BeautifulSoup

def build(source,out):
    html=BeautifulSoup(Path(source).read_text("utf8"),"html.parser")
    main=html.select_one("main.main-text")
    assert main is not None
    for section in list(main.select("section.text-section")):
        if section.get("data-section-id") not in {"1","2","66"}:
            section.decompose()
    # Keep early and unrelated middle sections to reveal Arabic/English,
    # note callouts, header, column and RTL behavior.
    for part in list(html.body.find_all(recursive=False)):
        cls=part.get("class") or []
        if "contents" in cls or "guide" in cls or "page-start" in cls:
            part.decompose()
    lex=html.select_one("section.lexicon")
    assert lex is not None
    keep_dossiers=set()
    for e in lex.select("section.lex-term"):
        if len(keep_dossiers)<2:
            keep_dossiers.add(e.get("id",""))
        else:e.decompose()
    keep_articles=set()
    for e in lex.select("article.lex-article"):
        if len(keep_articles)<2:keep_articles.add(e.get("id",""))
        else:e.decompose()
    for li in lex.select(".lex-directory-list li")[2:]:li.decompose()
    out=Path(out);out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(str(html),"utf8")
    stats={"input_bytes":Path(source).stat().st_size,"output_bytes":out.stat().st_size,
           "source_sections":[s.get("data-section-id") for s in html.select("section.text-section")],
           "source_notes":len(html.select(".apparatus-note")),
           "source_terms":len(html.select(".lex-term")),
           "source_articles":len(html.select(".lex-article")),
           "bilingual_rows":len(html.select("table.parallel-text tr")),
           "arabic_title":html.select_one(".cover .arabic-title").get_text(strip=True)}
    print("GNAMMA_VIVLIOSTYLE_MICRO_SOURCE",stats,flush=True)
    assert stats["source_notes"]>3 and stats["source_terms"]==2 and stats["source_articles"]==2
if __name__=="__main__":
    if len(sys.argv)!=3:raise SystemExit("micro_fixture.py full_scholarly.html output.html")
    build(*sys.argv[1:])
