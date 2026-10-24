#!/usr/bin/env python3
"""Derive complete Daruri Reading + Scholarly HTML strictly from canonical source.

The output is *HTML*, not WeasyPrint PDF. All book data and original note-
placement decisions come from existing production source/annotation functions.
Browser engines paginate the resulting HTML; no current twelve A4 PDFs or
apparatus packet PDF is opened, fetched, decoded or used as an input.
"""
from __future__ import annotations
from pathlib import Path
from bs4 import BeautifulSoup
import hashlib, json, sys, re

ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/"daruri"/"build"))
from build_editions import (
 read_book, DATA, cover, guide, detailed_contents, render_index,
 render_applications, render_concordance, render_glossary
)
from main_text import render_main,validate_main,MAIN_TEXT_CSS
from backmatter import render_lexicon,LEXICON_CSS

ORIGINAL_SHA="e233057d26772249b17b456d9c8aeaf8fd7d5c293c9875c32569d29bb3d9e22e"
EDITION_MODES={"scholarly", "english", "arabic-vowelled"}

def sha(x:bytes):return hashlib.sha256(x).hexdigest()
def source_test(doc:str,book,mode:str,q,h):
    check=validate_main(book,q,h,mode,doc)
    if not check["ok"]:
        raise AssertionError("Original source, Qur'an/Hadith note/ID validation failed: "+
                             json.dumps(check,ensure_ascii=False)[:3500])
    if check["authorial_section_count"]!=258 or check["authorial_source_segment_count"]!=414:
        raise AssertionError("Canonical 258 section/414 authorial source counts changed")
    return check

def make_html(edition,main,parts,styles,title):
    css=MAIN_TEXT_CSS+"\n"+LEXICON_CSS+"\n"+styles
    # CSS originally lives in daruri/build; publication HTML now lives in a
    # different static directory. Correct all original font URLs so no 404
    # responses or browser font-fallback artifacts can pollute benchmarks.
    css=css.replace('url("fonts/','url("/daruri/build/fonts/').replace("url('fonts/","url('/daruri/build/fonts/")
    # Named original local fonts. Fonts served over GitHub Pages as regular static files.
    css+="""
    @font-face {font-family: 'GnammaPDFAr';src:url('/daruri/build/fonts/NotoNaskhArabic-Regular.ttf')}
    @font-face {font-family: 'GnammaPDFLatin';src:url('/daruri/build/fonts/NotoSerif-Regular.ttf')}
    @page {size: A4; margin: 18mm 16mm}
    body {font-family:'GnammaPDFLatin',serif; color:#171717; background:white}
    .source-segment.arabic {font-family:'GnammaPDFAr',serif; direction:rtl}
    .source-segment.english {font-family:'GnammaPDFLatin',serif}
    .lex-note-ar,.lex-arabic,.ar {font-family:'GnammaPDFAr',serif}
    a {color:inherit}
    @media print {a {text-decoration:none}}
    """
    return ("<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'>"+
            "<title>"+title+"</title><style>"+css+"</style></head><body>"+
            "<!-- Original canonical Gnamma source, no PDF input. -->"+
            "".join(parts)+"</body></html>")

def make_edition(edition,book,q,h,bm,full):
    main=render_main(book,q,h,edition,show_editorial_titles=False)
    check=source_test(main,book,edition,q,h)
    parts=[cover(edition),guide(edition),detailed_contents(book,edition),main]
    if edition in ("scholarly","english"):
        parts.append(render_applications(book,edition,bm))
    if edition=="scholarly":
        parts.extend((render_index(book),render_lexicon(full,bm),render_concordance(book)))
    elif edition=="english":
        parts.extend((render_index(book),render_glossary(book,edition)))
    title={"scholarly":"Daruri full Scholarly Reference edition",
           "english":"Daruri complete English Reading edition",
           "arabic-vowelled":"Daruri complete vowelled Arabic Reading edition"}[edition]
    html=make_html(edition,main,parts,(ROOT/"daruri/build/styles.css").read_text("utf8"),title)
    parsed=BeautifulSoup(html,"html.parser")
    ids=[t.get("id") for t in parsed.select("[id]") if t.get("id")]
    dupes=[key for key in set(ids) if ids.count(key)>1]
    if dupes:raise AssertionError("Duplicate original publication IDs: "+repr(dupes[:15]))
    idset=set(ids)
    source_ids={f"section-{n}" for n in range(1,259)}
    missing=source_ids-idset
    if missing:raise AssertionError("Missing original section IDs: "+repr(sorted(missing)[:6]))
    refs=[a.get("href","")[1:] for a in parsed.select("a[href^='#']")]
    broken=set(refs)-idset
    if broken:raise AssertionError("Broken original link destinations: "+repr(sorted(broken)[:25]))
    source_html=parsed.select("main.main-text")
    if len(source_html)!=1:raise AssertionError("Authorial source not exactly once")
    text_nodes=parsed.select(".source-segment")
    expected=416*(2 if edition=="scholarly" else 1)
    if len(text_nodes)!=expected:
        raise AssertionError(f"Authorial paragraph rows {len(text_nodes)} vs {expected}")
    # All prose, references and links printed; Reference contains original HTML lexicon
    # with complete historic articles/terms and section-apparatus, not summary snippets.
    lex=parsed.select_one("#lexicon")
    if edition=="scholarly" and (lex is None or
       len(parsed.select(".lexicon .lex-article"))!=157):
        raise AssertionError("Scholarly reference lexicon unavailable")
    counts={"schema":"gnamma-source-html-ultimate-benchmark-v1",
      "source_sha256":ORIGINAL_SHA,"edition":edition,
      "input_is_pdf":False,"html_sha256":sha(html.encode("utf8")),
      "html_bytes":len(html.encode("utf8")),
      "source_segments":len(text_nodes),
      "authorial_section_count":258,"authorial_source_paragraphs":414,
      "named_authorial_destinations":len(source_ids&idset),
      "all_internal_reference_links":len(refs),
      "unique_internal_reference_targets":len(set(refs)),
      "all_external_links":len(parsed.select('a[href^="http"]')),
      "all_distinct_ids":len(idset),
      "total_original_notes":check.get("expected_note_count"),
      "original_notes_rendered":check.get("rendered_note_count"),
      "original_notes_quran":check.get("quran_note_count"),
      "original_note_call_markers":check.get("quran_marker_count"),
      "historical_dictionary_terms":len(full.get("terms",[])) if edition=="scholarly" else 0,
      "historical_dictionary_articles":len(full.get("articles",[])) if edition=="scholarly" else 0,
      "historical_dictionary_printed_articles":len(parsed.select(".lexicon .lex-article")) if edition=="scholarly" else 0,
      "source_validation_ok":bool(check["ok"]),
      "has_explicit_language_and_note_policy":True,
      "reference_apparatus_html_bytes":len(str(lex).encode("utf8")) if lex else 0,
      "generator":"canonical build_editions/main_text/backmatter HTML functions ONLY",
      "release_approved":False}
    return html,counts

def main():
    out=Path(sys.argv[1])
    out.mkdir(parents=True,exist_ok=True)
    original=(ROOT/"daruri/edition-r3-20261020.js").read_bytes()
    if sha(original)!=ORIGINAL_SHA:raise AssertionError("Canonical source SHA mismatch: need revalidate everything")
    book=read_book()
    q=json.loads((DATA/"quran-source-notes.json").read_text("utf8"))
    h=json.loads((DATA/"hadith-source-notes.json").read_text("utf8"))
    bm=json.loads((DATA/"backmatter-source-notes.json").read_text("utf8"))
    full=json.loads((DATA/"full-headwords.json").read_text("utf8"))
    if len(full.get("terms",[]))!=153 or len(full.get("articles",[]))!=157:
        raise AssertionError("Wrong scholarly lexicon; expected complete 153 terms, 157 articles")
    report=[]
    modes=sys.argv[2:] if len(sys.argv)>2 else ["arabic-vowelled","english","scholarly"]
    for mode in modes:
        if mode not in EDITION_MODES:raise AssertionError("Unsupported mode "+mode)
        html,counts=make_edition(mode,book,q,h,bm,full)
        (out/(mode+".html")).write_text(html,"utf8")
        report.append(counts)
        (out/(mode+".source.json")).write_text(json.dumps(counts,ensure_ascii=False,indent=2)+"\n","utf8")
        print("GNAMMA_FULL_SCHOLARLY_SOURCE",json.dumps(counts,ensure_ascii=False),flush=True)
    (out/"source_summary.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n","utf8")

if __name__=="__main__":main()
