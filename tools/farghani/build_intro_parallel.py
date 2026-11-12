#!/usr/bin/env python3
"""Capture Farghani's public-domain authorial Arabic from a 2007 online digital
transcription, keep modern editorial notes separate where safely identifiable,
and build a PAGE-ALIGNED (NOT clause-aligned) parallel draft reader.

Never call the output an independently collated Arabic critical edition.
See editorial source-candidate and historical-print evidence registers.
"""
from __future__ import annotations
from bs4 import BeautifulSoup
from pathlib import Path
from collections import Counter
from datetime import datetime,timezone
from html import escape
from hashlib import sha256
from difflib import SequenceMatcher
import json, os, re, sys, time, requests, unicodedata

ROOT=Path(__file__).resolve().parents[2]
BOOK=ROOT/"texts/al-farghani/muntaha-al-madarik"
OUT=BOOK/"data/intro-arabic-b2007-digital.json"
QA=BOOK/"editorial/INTRO_SOURCE_AUDIT_019.json"
HTML=BOOK/"parallel-introduction.html"
RAW=BOOK/"editorial/INTRO_ARABIC_DIGITAL_18_145_019.md"
START,END=18,145
session=requests.Session()
session.headers.update({"User-Agent":"Mozilla/5.0 (GNAMMA academic source study; noncommercial)", "Accept-Language":"ar,en;q=0.8"})
# Manually reviewed source-portal footnote boundaries. These are the first
# modern editor footnotes flattened after an authorial page fragment. Never
# strip in-text Quranic verse numbers or the author's own citation markers.
REVIEWED_FOOTNOTE_LEADS={
    20:"رواه مسلم في صحيحه", 21:"أورده الحكيم الترمذي",
    23:"هذا الأثر لم أجده", 25:"هذا الأثر لم أجده بلفظه",
    29:"أورد العجلوني", 47:"أورده المناوي",
    48:"عزاه السيوطي", 67:"الكيزان : جمع",
    83:"الإلّية : ربانية", 87:"كذا بالأصل وهي غير",
    112:"كذا بالأصل", 115:"هذا الخبر لم أجد",
    118:"فذلك حسابه", 128:"الشّمس والشّموس",
    130:"أورده العجلوني", 136:"أورده الإمام الجرجاني",
}
QURANIC_VERSE_ONLY={26}  # (7) immediately identifies Q 30:7, not an editorial footnote.
NOTE_START=re.compile(r"\(\s*([1-9])\s*\)\s*(?=(?:هذا الحديث|انظر|رواه|أخرجه|يشير إلى|سبق|حديث رقم|ذكره|قال المحقق|في النسخة|قال الحافظ|قال السيوطي|قال البيهقي|فقد أخرجه|هكذا|وهذا الحديث))")
ARABIC=re.compile(r"[\u0621-\u064a]")
VOWELS=re.compile(r"[\u064b-\u065f\u0670\u0640]")
NONAR=re.compile(r"[^ء-ي0-9]+")
def norm_ar(s):
    s=VOWELS.sub("",str(s))
    s=s.translate(str.maketrans({"أ":"ا","إ":"ا","آ":"ا","ى":"ي","ؤ":"و","ئ":"ي","ة":"ه"}))
    return NONAR.sub(" ",s).strip()
def fetch(page):
    url=f"https://ablibrary.net/book_content/b/9606/{page}?lang=ar"
    errors=[]
    for attempt in range(4):
        try:
            resp=session.get(url,timeout=35)
            resp.raise_for_status()
            if len(resp.content)<6000:raise ValueError(f"Suspiciously short HTML {len(resp.content)}")
            soup=BeautifulSoup(resp.content,"html.parser")
            article=soup.select_one("#book-page-plain-text article")
            if article is None:raise ValueError("Missing authoritative #book-page-plain-text article selector")
            title=soup.title.get_text(" ",strip=True) if soup.title else ""
            if str(page) not in title or "منتهى المدارك" not in title:
                raise ValueError(f"Wrong book/page title: {title!r}")
            raw=" ".join(x.get_text(" ",strip=True) for x in article.find_all("p",recursive=False))
            raw=re.sub(r"\s+"," ",raw).strip()
            if len(raw)<300 or len(ARABIC.findall(raw))<200:
                raise ValueError(f"Empty/suspiciously non-Arabic page {page}: length {len(raw)}")
            # The online source sometimes flattens a distinct footer headed
            # هامش into the last authorial paragraph. Reviewed page-specific
            # anchors are deliberately stricter than generic footnote regexes.
            reviewed_lead=REVIEWED_FOOTNOTE_LEADS.get(page)
            if reviewed_lead:
                pattern=re.compile(r"\(\s*1\s*\)\s*"+re.escape(reviewed_lead))
                # A confirmed footer may start early when the editor's numbered notes
                # occupy most of the printed page (p20: ~65% of raw string).
                # Safety comes from the unique exact page-specific cue, not
                # a brittle 45%-from-end rule used for heuristic footnotes.
                candidates=[m for m in pattern.finditer(raw) if m.start()>len(raw)*.30]
                if len(candidates)!=1:
                    raise ValueError(f"p{page}: reviewed footer boundary changed in digitized source; do not silently rejoin editor notes")
                split=candidates[0].start()
                footnote_grade="reviewed-digital-footer-note-separation"
            else:
                candidates=[m for m in NOTE_START.finditer(raw) if m.start()>len(raw)*.45]
                split=min((m.start() for m in candidates),default=None)
                footnote_grade="heuristically-separated-modern-notes" if split is not None else "no-unambiguous-note-separator"
            main=raw[:split].strip() if split is not None else raw
            notes=raw[split:].strip() if split is not None else ""
            # Quranic verse number (7) on p26 is part of Farghānī's quotation.
            possible_notes=False if page in QURANIC_VERSE_ONLY or reviewed_lead else bool(re.search(r"\(\s*[1-9]\s*\)",main[-250:]))
            review=(dict(status="reviewed-digital-footer",boundary_lead=reviewed_lead,
                         source_pagination=page,raw_transcription_preserved=True)
                    if reviewed_lead else
                    dict(status="false-positive-verse-number",reference="Quran 30:7",
                         raw_transcription_preserved=True) if page in QURANIC_VERSE_ONLY else None)
            return {
              "page":page,"source_siglum":"B2007-digitized","source_grade":"modern-edited-digital-transcription-unverified-against-paper",
              "url":url,"retrieved_at_utc":datetime.now(timezone.utc).isoformat(),
              "source_sha256":sha256(raw.encode()).hexdigest(),
              "raw_ar":raw,"reading_ar":main,"editorial_notes":notes,
              "editorial_split_method":footnote_grade,"possible_unseparated_note":possible_notes,
              "raw_chars":len(raw),"reading_chars":len(main),"arabic_words":len(norm_ar(main).split()),
              "title_verified":title,
              **({"footnote_review":review} if review is not None else {})
            }
        except Exception as exc:
            errors.append(str(exc))
            time.sleep(min(5,1.4*(attempt+1)))
    raise RuntimeError(f"p{page}: unable to authenticate digital Arabic after 4 attempts: {errors}")
def collect_english():
    soup=BeautifulSoup((BOOK/"continuous-translation.html").read_text(encoding="utf-8"),"html.parser")
    sections=soup.select("#document > section.b2007-page")
    if len(sections)!=128:raise ValueError(f"English section count {len(sections)} !=128")
    english={}
    for page,sec in enumerate(sections,START):
        if sec.get("id")!=f"b2007-p{page}":raise ValueError(f"Page anchor order mismatch: {page}")
        english[page]={
         "title":sec.find("h3").get_text(" ",strip=True),
         "english_html":"".join(str(node) for node in sec.children if getattr(node,"name",None)!="h3"),
         "english_words":len(sec.get_text(" ",strip=True).split()),
         "english_paragraphs":len(sec.find_all("p"))
        }
    return english
def critical_records():
    data=[]
    for f in sorted((BOOK/"data").glob("critical-pass-*.js")):
        txt=f.read_text(encoding="utf-8")
        match=re.search(r"window\.\w+\s*=\s*(\{[\s\S]*\})\s*;\s*$",txt)
        if not match:raise ValueError(f"bad critical-data JS: {f}")
        data.extend(json.loads(match.group(1)).get("records",[]))
    if len(data)!=559:raise ValueError(f"Expected 559 selected records, got {len(data)}")
    return data
def source_note_html(page,record):
    source_url=escape(record["url"],quote=True)
    return (f'<a href="{source_url}" target="_blank" rel="noopener noreferrer">'
       f'Digitized B2007 source p. {page}</a>')
def make_parallel_html(pages,en,comparisons):
    by_page={}
    for x in comparisons:by_page.setdefault(x["b2007_page"],[]).append(x)
    parts={18:"First foundation · Essence and divine names",70:"Second foundation · Spirits",
           79:"Third foundation · Cosmos and Adam",102:"Fourth foundation · Human reality and return",
           144:"Concluding preface"}
    pieces=[]
    for x in pages:
        n=x["page"];e=en[n]
        heading=(f'<p class="pr-part" role="heading" aria-level="2">{escape(parts[n])}</p>' if n in parts else "")
        counts=(f'{x["arabic_words"]} Arabic words · {e["english_words"]} English words')
        notes=(f'<p class="pr-editorial-notes"><b>Modern editor’s note (digitized):</b> '
          f'<span lang="ar" dir="rtl">{escape(x["editorial_notes"])}</span></p>' if x["editorial_notes"] else "")
        notice=('<p class="pr-caveat">A possible attached modern note remains unresolved on this source page; consult the original link.</p>'
                if x["possible_unseparated_note"] else "")
        historical=[]
        for c in by_page.get(n,[]):
            rel="Difference" if "difference" in c["relationship"] else "Agreement"
            historical.append('<div class="pr-variant">'
                f'<b>{escape(c["id"])} · I1876 printed p. {c["i1876_printed_page"]} · {rel}</b>'
                f'<p><small>Digitized B2007</small> <span lang="ar" dir="rtl">{escape(c["beirut_digital"])}</span></p>'
                f'<p><small>Photographed 1876 PRINT</small> <span lang="ar" dir="rtl">{escape(c["i1876_reading"])}</span></p>'
                f'<p>{escape(c["editorial_decision"])}</p></div>')
        variants="".join(historical)
        info=f'<details class="pr-apparatus"><summary>Source, historical-print readings &amp; page notes</summary><div class="pr-apparatus-body">'
        info+=f'<p>{source_note_html(n,x)} · page-aligned English, NOT sentence-aligned; the Arabic is a modern digital transcription, not a newly collated print.</p>'
        info+=notes+notice+variants+'</div></details>'
        pieces.append(f'<section id="p{n}" class="pr-page" data-page="{n}" data-book-page="b2007-p{n}">'
                      +heading+f'<h3 class="pr-page-title">B2007 · p. {n} <small>{escape(counts)}</small></h3>'
                      +'<div class="pr-text">'
                      +f'<div class="pr-ar" lang="ar" dir="rtl"><p>{escape(x["reading_ar"])}</p></div>'
                      +f'<div class="pr-en" lang="en">{e["english_html"]}</div>'
                      +'</div>'+info+'</section>')
    content="\n".join(pieces)
    html_doc='''<!doctype html><html lang="en" data-theme="parchment"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Page-aligned English and provisional digitized Arabic of Farghani's complete introduction, pp18-145; source grades and 1876 print readings preserved.">
<title>Farghānī · Introduction · Arabic and English · GNAMMA</title>
<link rel="icon" href="../../../assets/gnamma-mark.svg" type="image/svg+xml">
<link rel="stylesheet" href="../../al-turka/qawaid-al-tawhid/reader.css">
<link rel="stylesheet" href="parallel-reader.css"></head>
<body data-language="both">
<header class="pr-header"><a href="./">GNAMMA · Farghānī</a><nav><a href="continuous-translation.html">English reader</a><a href="critical-edition.html">Selected critical excerpts</a><a href="handoffs.html">Handoffs</a></nav></header>
<section class="pr-front"><p class="eyebrow">GNAMMA RESEARCH · INTRODUCTORY EDITION</p>
<h1>Muntahā al-madārik</h1><p lang="ar" dir="rtl" class="pr-ar-title">منتهى المدارك في شرح تائية ابن الفارض</p>
<p class="pr-subtitle">The four foundations and concluding preface · B2007 pp. 18–145 · provisional page-aligned Arabic–English edition</p>
<details><summary>Read about the evidence and alignment</summary><p>The English covers all 128 printed-page labels but is a working translation. The Arabic is the 2007 edition’s online digital transcription, with identifiable modern editorial notes separated where possible. Arabic and English are aligned by <strong>printed page only</strong>; their displayed paragraphs are <strong>not</strong> proof of clause-level correspondence. Fifteen selected phrases have previously been compared directly with photographed leaves of the 1876 Istanbul <em>printing</em>. No whole page has been independently line-collated against manuscripts.</p></details></section>
<div class="pr-tools" role="toolbar" aria-label="Bilingual reading tools">
<div role="group" aria-label="Displayed language"><button type="button" data-lang="both" aria-pressed="true">العربية + English</button><button type="button" data-lang="ar" aria-pressed="false">العربية</button><button type="button" data-lang="en" aria-pressed="false">English</button></div>
<button type="button" id="pr-search-open">Search both languages</button><button type="button" id="pr-contents">Contents</button><button type="button" id="pr-notes-toggle" aria-pressed="false">Show source notes</button><button type="button" id="pr-size-minus">A−</button><button type="button" id="pr-size-plus">A+</button><button type="button" id="pr-theme">Appearance</button><button type="button" id="pr-print">Print / PDF</button>
</div>
<main id="pr-reading">'''+content+'''</main>
<dialog id="pr-dialog" aria-label="Page contents and search"><div class="pr-dialog-heading"><h2 id="pr-dialog-title">Contents</h2><button type="button" id="pr-close">Close</button></div><div id="pr-dialog-content"></div></dialog>
<footer class="pr-footer"><a href="./">Book homepage</a> · <a href="editorial/INTRO_SOURCE_AUDIT_019.json">Per-page source audit</a> · <a href="editorial/I1876_COLLATION_CUMULATIVE_006.json">1876 print evidence</a> · <a href="editorial/GLOSSARY.md">Glossary</a></footer>
<script defer src="parallel-reader.js"></script></body></html>'''
    return html_doc
def audit_selected(pages,records):
    lookup={x["page"]:x for x in pages}
    out=[]
    for rec in records:
        p=rec.get("page")
        frag=norm_ar(rec.get("ar",""))
        text=norm_ar(lookup[p]["raw_ar"])
        exact=bool(frag) and frag in text
        # soft word-set check only prioritises review; it does NOT verify exact wording.
        words=frag.split()
        all_words=set(text.split())
        overlap=round(sum(w in all_words for w in words)/len(words),3) if words else 0
        out.append({"id":rec.get("id"),"page":p,"grade":rec.get("grade") or rec.get("source_grade"),
          "exact_normalized_digital_match":exact,"word_membership_fraction":overlap,
          "requires_manual_review":(not exact),"is_historical_print_checked":bool(rec.get("historical_print"))})
    return out
def main():
    english=collect_english()
    print("English page sections:",len(english), "English words:",sum(x["english_words"] for x in english.values()),flush=True)
    pages=[]
    for page in range(START,END+1):
        x=fetch(page);pages.append(x)
        if page%10==0 or page in (START,END):
            print(f"B2007-digitized p{page}: reading {x['reading_chars']} chars; notes {len(x['editorial_notes'])} chars; full pages {len(pages)}",flush=True)
        time.sleep(.2)
    if [x["page"] for x in pages]!=list(range(START,END+1)):raise ValueError("No complete 128-page Arabic sequence")
    if any(x["reading_chars"]<300 for x in pages):raise ValueError("Source page unexpectedly short")
    records=critical_records()
    coll=json.loads((BOOK/"editorial/I1876_COLLATION_CUMULATIVE_006.json").read_text(encoding="utf-8"))
    if len(coll["comparisons"])!=15:raise ValueError("Historical print comparison count changed")
    checked=audit_selected(pages,records)
    warnings=[]
    for x in pages:
        p=x["page"];e=english[p]
        ratio=e["english_words"]/x["arabic_words"] if x["arabic_words"] else 0
        if ratio<.7 or ratio>2.8:
            warnings.append({"page":p,"kind":"translation-length-risk-only","english_words":e["english_words"],
              "arabic_words":x["arabic_words"],"word_ratio":round(ratio,2)})
        if x["possible_unseparated_note"]:
            warnings.append({"page":p,"kind":"possible-editorial-note-mixed-in-digital-transcription"})
    OUT.parent.mkdir(parents=True,exist_ok=True)
    OUT.write_text(json.dumps({"schema":"gnamma-farghani-introduction-B2007-web-digital-v1",
       "work":"Muntaha al-madarik, introduction only", "primary_author_public_domain":True,
       "modern_editor_copyright_material_not_intentionally_included":True,
       "source_note":"B2007 online digitized text, NOT photographs of modern paper and NOT historical critical copytext",
       "source_site":"https://ablibrary.net/book_content/b/9606/18?lang=ar",
       "date_utc":datetime.now(timezone.utc).isoformat(),
       "page_span":[START,END],"page_count":len(pages),"pages":pages},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    QA.parent.mkdir(parents=True,exist_ok=True)
    QA.write_text(json.dumps({"schema":"gnamma-farghani-xix-english-arabic-source-audit-v1",
       "date_utc":datetime.now(timezone.utc).isoformat(),
       "arabic_digital_page_count":len(pages),
       "english_working_page_count":len(english),
       "arabic_digitized_word_total":sum(x["arabic_words"] for x in pages),
       "english_working_word_total":sum(e["english_words"] for e in english.values()),
       "pages_with_explicit_editorial_notes":sum(bool(x["editorial_notes"]) for x in pages),
       "pages_with_possible_unseparated_notes":sum(bool(x["possible_unseparated_note"]) for x in pages),
       "selected_critical_records":len(records),
       "exact_normalized_source_excerpt_matches":sum(x["exact_normalized_digital_match"] for x in checked),
       "selected_excerpt_match_audit":checked,
       "page_level_warning_queue":warnings,
       "editorial_footer_reconciliation":{
          "schema":"farghani-reviewed-trailing-modern-note-separation-v1",
          "date":datetime.now(timezone.utc).date().isoformat(),
          "targetedPages":len(REVIEWED_FOOTNOTE_LEADS)+len(QURANIC_VERSE_ONLY),
          "editorNotePagesCorrected":sorted(REVIEWED_FOOTNOTE_LEADS),
          "falsePositiveVerseNumberPages":sorted(QURANIC_VERSE_ONLY),
          "originalDigitalRawUnchanged":True,
          "noteTextPreservedInEditorialApparatus":True,
          "basis":"Manually reviewed digital footnote cues; online structural confirmation of pp.20,21,23,25,29; no independent printed-leaf collation",
          "limits":"No remaining automatic note flags does not prove manuscript verification or full-text proofreading."},
       "source_collation_grade":"modern digital source extraction and quantitative comparison, NOT a full line-by-line historic-print collation",
       "independent_manuscript_variants_verified":0,
       "full_print_pages_independently_line_collated":0},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    contents=["# Farghānī · digitized source copy, B2007 pp18–145",
      "Source: https://ablibrary.net/book_content/b/9606/18?lang=ar",
      "Public-domain medieval authorial text as retranscribed online from the modern Beirut edition; no physical Beirut print or manuscript folios collated. Distinct modern editor footnotes have been separated where identifiable, including 16 reviewed digital footer boundaries in November 2026. This is a *working reading copy*, NOT a definitive critical Arabic text.",
      ""]
    for x in pages:
        contents.extend([f"## B2007 printed p{x['page']}", "", x["reading_ar"], ""])
        if x["editorial_notes"]:contents.extend(["<details><summary>Modern edited-source note, excluded from continuous authorial reading</summary>",x["editorial_notes"],"</details>",""])
    RAW.write_text("\n".join(contents),encoding="utf-8")
    HTML.write_text(make_parallel_html(pages,english,coll["comparisons"]),encoding="utf-8")
    print(json.dumps({"status":"complete-digital-reading-copy-not-collated",
      "arabic_pages":len(pages),"arabic_words":sum(x["arabic_words"] for x in pages),
      "english_working_words":sum(x["english_words"] for x in english.values()),
      "modern_editor_notes_isolated":sum(bool(x["editorial_notes"]) for x in pages),
      "selected_exact_matches":sum(x["exact_normalized_digital_match"] for x in checked),
      "selected_record_total":len(checked),"warnings":len(warnings),
      "outputs":[str(x) for x in [OUT,QA,HTML,RAW]]},ensure_ascii=False,indent=2),flush=True)
if __name__=="__main__":main()
