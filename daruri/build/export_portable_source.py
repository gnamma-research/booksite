#!/usr/bin/env python3
"""Portable, deterministic source-text archive for Gnamma al-Daruri.

This exporter is an output of the CURRENT canonical reader JSON embedded in
edition-r3-20261020.js. HTML, TEI, JSONL and TXT come from the same source;
there is no PDF extraction, OCR, guessed transcription or page-number inference.

It never includes personal Reading Desk notes, private highlights/bookmarks,
cookies, login data or browser storage. The ZIP is safe to publish only after
editorial rights/provenance and user permission have been checked separately.

Compatibility: TXT and deliberately simple HTML are intended to be easy
inputs to the legacy Shamela import screen. This script does NOT claim a
certified Shamela v4 .bok or MDB/SQLite database export.
"""
from __future__ import annotations

import argparse
import hashlib
from html import escape
import json
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

ROOT=Path(__file__).resolve().parents[1]
BUILD=ROOT/"build"
sys.path.insert(0,str(BUILD))
from build_editions import read_book  # noqa: E402

TEI="http://www.tei-c.org/ns/1.0"
XML="http://www.w3.org/XML/1998/namespace"
ET.register_namespace("",TEI)

VERSION="gnamma-daruri-portable-source-v1"
TITLE_AR="الضَّرُورِيُّ فِي أُصُولِ الْفِقْهِ"
TITLE_EN="Al-Ḍarūrī fī Uṣūl al-Fiqh"
AUTHOR_AR="أبو الوليد ابن رشد"
AUTHOR_EN="Abū al-Walīd Ibn Rushd"

def sha(data:bytes)->str:
    return hashlib.sha256(data).hexdigest()

def canonical_json(obj):
    return (json.dumps(obj,ensure_ascii=False,sort_keys=True,indent=2)+"\n").encode("utf-8")

def is_authorial(section):
    return isinstance(section.get("id"),int) and 1<=section["id"]<=258

def index_book(book):
    sections=[s for s in book["sections"] if is_authorial(s)]
    if [s["id"] for s in sections]!=list(range(1,259)):
        raise ValueError("Canonical Daruri R001..R258 sections missing or reordered")
    if sum(len(s.get("segments",[])) for s in sections)!=414:
        raise ValueError("Canonical Daruri 414 parallel passages changed")
    for s in sections:
        if not isinstance(s.get("title"),str):
            raise ValueError("Missing editorial section label")
        for idx,segment in enumerate(s["segments"]):
            for language in ("ar","vocalized","en"):
                if not isinstance(segment.get(language),str) or not segment[language].strip():
                    raise ValueError(f"Missing complete {language} source: R{s['id']}/{idx}")
    if sum(bool(s.get("headingAr")) for s in sections)!=46:
        raise ValueError("Canonical 46 recorded Arabic source headings have changed")
    notes=book.get("notes",[])
    if isinstance(notes,dict): notes=list(notes.values())
    if not isinstance(notes,list) or len(notes)!=625:
        raise ValueError(f"Main text/source-note inventory changed: {len(notes) if isinstance(notes,list) else 'invalid'}")
    by_id={str(n.get("id")):n for n in notes}
    if len(by_id)!=len(notes):
        raise ValueError("Duplicate canonical scholarly note IDs")
    for section in sections:
        for note_id in section.get("noteIds",[]):
            if str(note_id) not in by_id:
                raise ValueError("Canonical passage refers to missing original note: "+str(note_id))
    return sections,notes,by_id

def post_authorial(book):
    """Keep the distinct colophon, if present, separate from Ibn Rushd."""
    return [s for s in book["sections"] if not is_authorial(s)]

def note_id(raw):
    """XML IDs must be NCNames; use stable SHA of original unrestricted ID."""
    return "note-"+sha(str(raw).encode("utf-8"))[:18]

def source_row(s,idx,seg):
    return {
        "section_id":int(s["id"]),
        "reference":"R"+str(s["id"]).zfill(3),
        "paragraph_index":idx,
        "paragraph_id":f"R{int(s['id']):03d}-P{idx+1:02d}",
        "recorded_heading_ar":s.get("headingAr") or "",
        "recorded_heading_en":s.get("headingEn") or "",
        "editorial_title_en":s.get("title") or "",
        "part_id":s.get("part"),
        "arabic_unvowelled":seg["ar"],
        "arabic_vowelled_editorial":seg["vocalized"],
        "english_translation_editorial":seg["en"],
        "section_note_ids":[str(n) for n in s.get("noteIds",[])],
        "printed_reference_metadata":{
            "pages":s.get("pages",[]),
            "bouAkl":s.get("bouAkl",{})
        }
    }

def source_rows(sections):
    return [source_row(s,i,seg) for s in sections for i,seg in enumerate(s["segments"])]

CSS="""
:root {color-scheme:light;font:16px/1.65 system-ui,Arial,sans-serif}
body {max-width:1060px;margin:auto;padding:1.3rem;background:#fff;color:#182320}
h1,h2,h3 {line-height:1.3}
a {color:#235d63}
.provenance {border-inline-start:3px solid #aaa;padding:.6rem 1rem;background:#f5f5f3}
.unit {margin:2rem 0;break-inside:auto}
.editorial {color:#56615a;font-size:.9rem}
.recorded {font-size:1.04rem;font-weight:600}
.parallel {display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
.parallel p {margin:.5rem 0 1rem;break-inside:avoid}
.english {direction:ltr;text-align:left;unicode-bidi:isolate}
.arabic {direction:rtl;text-align:right;unicode-bidi:isolate;
font-family:"Noto Naskh Arabic","Amiri",serif;font-size:1.25rem;line-height:1.9}
.notes {border-block-start:1px solid #ccc;margin-top:2rem;padding-top:1rem}
.notes article {margin:.8rem 0}
.source-note-label {font-weight:bold}
@media(max-width:650px){.parallel{grid-template-columns:1fr}.arabic{order:-1}}
@media print{@page{size:A4;margin:15mm 14mm}body{max-width:none;padding:0}}
""".strip()

def html_intro(subtitle,arabic=False):
    direction=' dir="rtl" lang="ar"' if arabic else ' lang="en"'
    return ('<!doctype html><html'+direction+'><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1">'
            '<meta name="generator" content="'+VERSION+'">'
            '<title>'+escape(TITLE_AR if arabic else TITLE_EN)+' · '+escape(subtitle)+'</title>'
            '<style>'+CSS+'</style></head><body><header><h1>'+
            escape(TITLE_AR if arabic else TITLE_EN)+'</h1><p>'+
            escape(AUTHOR_AR if arabic else AUTHOR_EN)+'</p>'
            '<p class="provenance">This is a portable, editorial digital source '
            'exported from the canonical Gnamma reader data. R-numbering, '
            'English translation and vocalization are editorial. Recorded Arabic '
            'headings are explicitly distinguished from editorial section titles. '
            'This is not a new manuscript collation.</p></header>')

def html_text(sections,notes,by_id,view="parallel",later=None):
    bilingual=view=="parallel"
    arabic_only=view in ("arabic","vowelled")
    lines=[html_intro("parallel text" if bilingual else view,arabic=arabic_only)]
    for s in sections:
        sid=f"R{s['id']:03d}"
        lines.append(f'<section class="unit" id="{sid}">')
        lines.append(f'<h2 class="editorial">{sid} · {escape(s["title"])}</h2>')
        if s.get("headingAr"):
            lines.append('<h3 class="recorded arabic" lang="ar" dir="rtl" '
                         'data-provenance="recorded-Arabic-rubric">'+
                         escape(s["headingAr"])+'</h3>')
            if bilingual and s.get("headingEn"):
                lines.append('<p class="recorded english" data-provenance="editorial-translation-of-rubric">'+
                             escape(str(s["headingEn"]))+'</p>')
        for i,seg in enumerate(s["segments"]):
            pid=f"{sid}-P{i+1:02d}"
            if bilingual:
                lines.append(f'<div class="parallel" id="{pid}">')
                lines.append(f'<p class="english" lang="en" dir="ltr" id="{pid}-en">'+
                             escape(seg["en"])+'</p>')
                lines.append(f'<p class="arabic" lang="ar" dir="rtl" id="{pid}-ar">'+
                             escape(seg["vocalized"])+'</p></div>')
            elif view=="english":
                lines.append(f'<p id="{pid}" lang="en" dir="ltr">'+escape(seg["en"])+'</p>')
            else:
                field="vocalized" if view=="vowelled" else "ar"
                lines.append(f'<p id="{pid}" class="arabic" lang="ar" dir="rtl">'+
                             escape(seg[field])+'</p>')
        attached=[by_id[str(n)] for n in s.get("noteIds",[]) if str(n) in by_id]
        if attached and bilingual:
            lines.append('<div class="notes"><h3>Editorial and source notes</h3>')
            for note in attached:
                note_text=note.get("original_note_text")
                note_lang=note.get("original_note_language")
                if not note_text:
                    note_text=note.get("text_en") or note.get("text") or note.get("text_ar") or ""
                    note_lang=("ar" if not (note.get("text_en") or note.get("text")) else
                               note.get("text_language","en"))
                lang="ar" if note_lang=="ar" else ("fr" if note_lang=="fr" else "en")
                lines.append('<article id="'+note_id(note["id"])+'" lang="'+lang+'" dir="'+
                             ('rtl' if lang=="ar" else 'ltr')+'"><span class="source-note-label">'+
                             escape(str(note["id"]))+' · '+escape(str(note.get("kind","note")))+
                             '</span> '+escape(str(note_text))+'</article>')
            lines.append('</div>')
        lines.append('</section>')
    for col in later or []:
        if str(col.get("id"))!="colophon":
            raise ValueError("Unknown non-authorial passage in canonical export")
        lines.append('<section id="colophon" data-source-role="later-copyist">'
                     '<h2>Later copyist’s colophon and ownership notice — '
                     'separate from Ibn Rushd’s text</h2>')
        if col.get("headingAr"):
            lines.append('<h3 lang="ar" dir="rtl" class="arabic">'+
                         escape(col["headingAr"])+'</h3>')
        for i,seg in enumerate(col.get("segments",[]),1):
            if bilingual:
                lines.append(f'<div class="parallel" id="colophon-P{i:02d}">'
                             f'<p class="english" lang="en" dir="ltr">'+escape(seg["en"])+'</p>'
                             f'<p class="arabic" lang="ar" dir="rtl">'+escape(seg["vocalized"])+'</p></div>')
            else:
                field="en" if view=="english" else "vocalized" if view=="vowelled" else "ar"
                lang="en" if field=="en" else "ar"
                lines.append(f'<p id="colophon-P{i:02d}" lang="{lang}" dir="'+
                             ('ltr' if lang=="en" else 'rtl')+'">'+escape(seg[field])+'</p>')
        lines.append("</section>")
    lines.append('<footer><p>Source identifiers and all original note metadata are '
                 'also preserved in daruri-source.json and daruri-passages.jsonl.</p></footer>'
                 '</body></html>')
    return "\n".join(lines).encode("utf-8")

def shamela_txt(sections,field,later=None):
    """Legacy-import-friendly UTF-8. No arbitrary source text modifications."""
    lines=[TITLE_AR,AUTHOR_AR,"",
           "تنبيه تحريري: ترقيم R من وضع هذه الطبعة، وليس من عناوين المؤلف.",
           "التشكيل - إن وجد - إضافة تحريرية.", ""]
    for s in sections:
        if s.get("headingAr"):
            lines.append(str(s["headingAr"]))
            lines.append("")
        lines.append(f"[R{s['id']:03d}]")
        lines.extend(seg[field] for seg in s["segments"])
        lines.append("")
    for col in later or []:
        if str(col.get("id"))!="colophon":
            raise ValueError("Unexpected later-source passage")
        lines.extend(["خاتمة الناسخ وقيد الملكية",
                      "تنبيه: هذا النص من قيد ناسخ لاحق، وليس من متن ابن رشد.", "[COL]"])
        lines.extend(seg[field] for seg in col["segments"])
        lines.append("")
    return ("\n".join(lines).rstrip()+"\n").encode("utf-8")

def tei_export(sections,notes,later=None):
    """Parallel TEI P5 source/translation, stable canonical correspondence.

    Arabic unvowelled is source witness; vowelled Arabic and English are
    explicitly editorial. Notes retain their original IDs via n attributes.
    """
    def e(parent,name,attrs=None,text=None):
        out=ET.SubElement(parent,f"{{{TEI}}}{name}",attrs or {})
        if text is not None:out.text=str(text)
        return out
    root=ET.Element(f"{{{TEI}}}TEI",{"version":"5.0"})
    hdr=e(root,"teiHeader")
    desc=e(hdr,"fileDesc")
    titleStmt=e(desc,"titleStmt")
    e(titleStmt,"title",text=TITLE_EN)
    e(titleStmt,"author",text=AUTHOR_EN)
    e(titleStmt,"respStmt")
    publ=e(desc,"publicationStmt")
    e(publ,"p",text="Gnamma Research portable scholarly source. Editorial translation and vocalization are derived digital work.")
    source=e(desc,"sourceDesc")
    e(source,"p",text="Based on the canonical Gnamma reader source data, using the 1994 Arabic printed edition with comparison to the 2015 Bou Akl edition. The Escorial manuscript was not independently collated for this edition.")
    profile=e(hdr,"profileDesc")
    langs=e(profile,"langUsage")
    e(langs,"language",{"ident":"ar"},text="Arabic")
    e(langs,"language",{"ident":"en"},text="English")
    booktext=e(root,"text")
    group=e(booktext,"group")
    for kind,lang,field,idtag in [
        ("source-unvowelled","ar","ar","s"),
        ("editorially-vowelled","ar","vocalized","v"),
        ("editorial-translation","en","en","e")
    ]:
        t=e(group,"text",{"type":kind,f"{{{XML}}}lang":lang})
        body=e(t,"body")
        for s in sections:
            sec=f"r{s['id']:03d}"
            div=e(body,"div",{
                "type":"reading-unit",
                "n":str(s["id"]),
                f"{{{XML}}}id":f"{idtag}-{sec}",
                "corresp":" ".join(f"#{j}-{sec}" for j in ("s","v","e") if j!=idtag)
            })
            if s.get("headingAr"):
                e(div,"head",{"type":"recorded-rubric" if field!="en" else "editorial-translation-of-recorded-rubric"},
                  s.get("headingAr") if field!="en" else s.get("headingEn") or "")
            e(div,"head",{"type":"editorial-section-title",f"{{{XML}}}lang":"en"},s["title"])
            for index,seg in enumerate(s["segments"],1):
                tag=f"{sec}-p{index:02d}"
                e(div,"p",{
                    f"{{{XML}}}id":f"{idtag}-{tag}",
                    "corresp":" ".join(f"#{j}-{tag}" for j in ("s","v","e") if j!=idtag)
                },seg[field])
            if kind=="source-unvowelled":
                for ident in s.get("noteIds",[]):
                    e(div,"ptr",{"type":"source-editorial-note",
                                 "target":"#"+note_id(ident)})
        for col in later or []:
            if str(col.get("id"))!="colophon":
                raise ValueError("Unrecognized separate later-source unit")
            div=e(body,"div",{
                "type":"later-copyist-colophon",
                f"{{{XML}}}id":f"{idtag}-colophon",
                "resp":"later-copyist",
            })
            e(div,"head",{"type":"recorded-rubric"},col.get("headingAr") or col.get("title") or "")
            for index,seg in enumerate(col["segments"],1):
                e(div,"p",{f"{{{XML}}}id":f"{idtag}-colophon-p{index:02d}"},seg[field])
    back=e(booktext,"back")
    div=e(back,"div",{"type":"scholarly-and-source-notes"})
    for item in notes:
        body=str(item.get("original_note_text") or item.get("text_en") or
                 item.get("text") or item.get("text_ar") or "")
        lang=item.get("original_note_language") or item.get("text_language") or "en"
        attrs={f"{{{XML}}}id":note_id(item["id"]),
               "n":str(item["id"]),
               "type":str(item.get("kind","editorial")),
               f"{{{XML}}}lang":lang if lang in ("ar","en","fr") else "en"}
        e(div,"note",attrs,body)
    return ET.tostring(root,encoding="utf-8",xml_declaration=True)

def readme():
    return ("""Daruri — portable digital source archive
========================================
This is NOT the offline Gnamma reader ZIP. It is the machine-readable source
from which HTML, PDF and future digital editions can be typeset.

The authoritative release data lives in the canonical reader payload.
- daruri-source.json: complete unmodified canonical book object, including
  scholarly notes, term metadata, applications and source relationships.
- daruri-passages.jsonl: 414 aligned original Arabic, editorial vowelled
  Arabic and English translation passages with permanent R/paragraph IDs.
- daruri-parallel.html: a standalone, offline, semantic HTML reading file.
- daruri-arabic.html, daruri-arabic-vowelled.html, daruri-english.html.
- daruri.tei.xml: research-oriented TEI P5 parallel text and note mapping.
- shamela-import-arabic.txt: straightforward UTF-8 Arabic text.
- shamela-import-vowelled.txt: Arabic with editorial vocalization.
- shamela-import-arabic.html: simple Arabic-only HTML, for legacy import.
- daruri-notes.json: all 625 canonical scholarly/source note records.
- scholarly-data/full-headwords.json: 153 historical term dossiers and
  157 selected full historical dictionary articles.
- scholarly-data/{quran,hadith,backmatter}-source-notes.json: original full
  source reference records, qualifications, references and withheld candidates.
- daruri-colophon.json: the later copyist’s TWO separate paragraphs.
  Colophon material also appears clearly separated in HTML, TEI and TXT.
- manifest.json: file checksums, counts and provenance.

Source numbering:
- R001–R258 are Gnamma editorial reading-unit references, not Ibn Rushd's
  own numbered chapter headings.
- The source has 46 recorded Arabic headings, which are distinguished from
  the 258 descriptive English editorial section labels.
- Arabic vocalization and English translation are editorial.
- The later copyist's colophon is separate from Ibn Rushd's 258 units.
- This archive is an editorial work; do not describe it as a manuscript
  diplomatic transcription or an independently established original text.

Shamela:
The older official Shamela import instructions document TXT and HTML
imports. These files are import-ready *candidates* for its legacy importer;
actual Shamela v4/Windows version compatibility is NOT independently
certified here. A .bok file is a native application/database exchange
format and must NOT be created by renaming TXT or HTML.
Use Shamela's Services > Import Files and test a copy in your version.
Plain TXT will not preserve the full rich bilingual scholarly apparatus.
The JSON and TEI documents are the authoritative archival exports.

Offline:
Open the standalone HTML files directly; no web server, sign-in or network
is required. No personal Reading Desk notes, private highlights, cookies,
account data or passwords are present.

Rights:
The medieval authorial text, modern editorial collation, English translation,
modern edition comparisons, historical lexicon quotations and other apparatus
may have different rights/provenance. Public reuse or republication requires
the project's stated licence and source permissions; this export does not
create a blanket licence.

Checksum:
Use manifest.json to confirm ZIP entries have not been corrupted or changed.
""").encode("utf-8")

def deterministic_zip(dest,files):
    with ZipFile(dest,"w",compression=ZIP_DEFLATED,compresslevel=8) as zipf:
        for filename,contents in sorted(files.items()):
            info=ZipInfo(filename,date_time=(2020,1,1,0,0,0))
            info.compress_type=ZIP_DEFLATED
            info.external_attr=0o644 << 16
            zipf.writestr(info,contents,compress_type=ZIP_DEFLATED,compresslevel=8)

def generate(output_dir:Path,zipname="Daruri_Portable_Scholarly_Source.zip"):
    book=read_book()
    sections,notes,by_id=index_book(book)
    later=post_authorial(book)
    if len(later)!=1 or str(later[0].get("id"))!="colophon" or len(later[0].get("segments",[]))!=2:
        raise ValueError("The separate two-paragraph later-copyist colophon is incomplete")
    rows=source_rows(sections)
    external={
        "full-headwords.json":ROOT/"build/data/full-headwords.json",
        "quran-source-notes.json":ROOT/"build/data/quran-source-notes.json",
        "hadith-source-notes.json":ROOT/"build/data/hadith-source-notes.json",
        "backmatter-source-notes.json":ROOT/"build/data/backmatter-source-notes.json"
    }
    preserved={key:json.loads(path.read_text(encoding="utf-8"))
               for key,path in external.items()}
    if len(preserved["full-headwords.json"].get("terms",[]))!=153 or len(preserved["full-headwords.json"].get("articles",[]))!=157:
        raise ValueError("Critical historical lexicon inventory changed")
    if len(preserved["quran-source-notes.json"].get("notes",[]))!=50 or len(preserved["hadith-source-notes.json"].get("notes_by_section",{}))!=33:
        raise ValueError("Source-citation inventories changed")
    files={
        "daruri-source.json":canonical_json(book),
        "daruri-passages.jsonl":("".join(
            json.dumps(row,ensure_ascii=False,sort_keys=True)+"\n"
            for row in rows)).encode("utf-8"),
        "daruri-notes.json":canonical_json(notes),
        "daruri-colophon.json":canonical_json(later[0]),
        "daruri-parallel.html":html_text(sections,notes,by_id,"parallel",later),
        "daruri-arabic.html":html_text(sections,notes,by_id,"arabic",later),
        "daruri-arabic-vowelled.html":html_text(sections,notes,by_id,"vowelled",later),
        "daruri-english.html":html_text(sections,notes,by_id,"english",later),
        "shamela-import-arabic.html":html_text(sections,notes,by_id,"arabic",later),
        "shamela-import-arabic.txt":shamela_txt(sections,"ar",later),
        "shamela-import-vowelled.txt":shamela_txt(sections,"vocalized",later),
        "daruri.tei.xml":tei_export(sections,notes,later),
        "README.txt":readme()
    }
    for name,path in external.items():
        files["scholarly-data/"+name]=path.read_bytes()
    manifest={
        "schema":VERSION,
        "work_title":TITLE_EN,
        "author":AUTHOR_EN,
        "canonical_reader_source":"daruri/edition-r3-20261020.js",
        "canonical_reader_sha256":sha((ROOT/"edition-r3-20261020.js").read_bytes()),
        "source_authorial_sections":258,
        "authorial_parallel_segments":len(rows),
        "separate_later_copyist_colophon_segments":2,
        "recorded_arabic_headings":46,
        "canonical_note_records":len(notes),
        "part_count":len(book.get("parts",[])),
        "application_count":len(book.get("apps",[])),
        "historical_dictionary_terms":153,
        "historical_dictionary_articles":157,
        "quran_source_note_records":50,
        "hadith_source_note_sections":33,
        "source_is_authoritative_data_not_typeset_PDF":True,
        "english_translation_editorial":True,
        "arabic_vocalization_editorial":True,
        "legacy_shamela_txt_html_import_verified_in_app":False,
        "native_bok_database_export":False,
        "private_user_notes_included":False,
        "files":{name:{"sha256":sha(data),"bytes":len(data)}
                 for name,data in sorted(files.items())}
    }
    files["manifest.json"]=canonical_json(manifest)
    output_dir.mkdir(parents=True,exist_ok=True)
    zip_path=output_dir/zipname
    deterministic_zip(zip_path,files)
    (output_dir/"source-export-report.json").write_text(
        json.dumps({
            **{k:v for k,v in manifest.items() if k!="files"},
            "zip_filename":zipname,
            "zip_sha256":sha(zip_path.read_bytes()),
            "zip_bytes":zip_path.stat().st_size,
            "files":manifest["files"],
        },ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("DARURI_SOURCE_EXPORT",json.dumps({
        "zip":str(zip_path),"sha256":sha(zip_path.read_bytes()),
        "bytes":zip_path.stat().st_size,
        "sections":258,"parallel_passages":len(rows),
        "notes":len(notes),"files":len(files),"import_bok_supported":False,
    },ensure_ascii=False),flush=True)
    return zip_path,manifest

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--output-dir",type=Path,required=True)
    parser.add_argument("--zip-name",default="Daruri_Portable_Scholarly_Source.zip")
    opts=parser.parse_args()
    generate(opts.output_dir,opts.zip_name)
