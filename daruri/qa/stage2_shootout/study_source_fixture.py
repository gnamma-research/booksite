#!/usr/bin/env python3
"""Produce a real Daruri Study source/notes stress corpus for browser PDF engines.

The original WeasyPrint HTML *producer* is reused solely for canonical data,
Qur'an source-note anchors and editorial note content. No PDF, Python renderer,
raster image, Web service or precompiled page is an input to these fixtures.
"""
from __future__ import annotations
from bs4 import BeautifulSoup, NavigableString, Tag
import copy, hashlib, json, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/"daruri"/"build"))
from build_editions import read_book, DATA
from main_text import render_main,validate_main,MAIN_TEXT_CSS

def split_runs(node:Tag):
    pieces=[]
    for child in node.children:
        if isinstance(child,NavigableString):
            if str(child):pieces.append({"kind":"text","text":str(child)})
        elif isinstance(child,Tag):
            if child.name=="sup":
                link=child.find("a")
                if not link or not str(link.get("href","")).startswith("#"):
                    raise AssertionError("Original source marker has no internal note target")
                pieces.append({"kind":"call","label":link.get_text(), "href":link["href"][1:],
                   "call_id":link.get("id",""),
                   "note_id":child.get("data-note-id",link["href"][1:]),
                   "class":" ".join(child.get("class",[]))})
            else:
                # An unrecognized inline wrapper is not silently flattened: it
                # could hide original note-position semantics.
                raise AssertionError("Unrecognized authorial paragraph child: "+str(child)[:300])
    return pieces

def main():
    dest=Path(sys.argv[1]);dest.mkdir(parents=True,exist_ok=True)
    book=read_book()
    q=json.loads((DATA/"quran-source-notes.json").read_text("utf8"))
    h=json.loads((DATA/"hadith-source-notes.json").read_text("utf8"))
    raw=render_main(book,q,h,"study",show_editorial_titles=True)
    baseline=validate_main(book,q,h,"study",raw)
    if not baseline["ok"]:
        raise AssertionError("Canonical Study HTML failed its own source-and-note validation: "+
                             json.dumps(baseline,ensure_ascii=False)[:1000])
    soup=BeautifulSoup(raw,"html.parser")
    segments_by={(str(s["id"]),i):p for s in book["sections"] for i,p in enumerate(s["segments"])}
    rows=[];note_map={};notes_by_section={};called_ids=set();all_calls=[];dupes=[]
    for pair in soup.select(".parallel-pair"):
        english=pair.select_one("p.source-segment.english")
        arabic=pair.select_one("p.source-segment.arabic")
        if not (english and arabic):raise AssertionError("Missing bilingual pair")
        section=english.get("data-section-id")
        index=int(english.get("data-segment-index"))
        if arabic.get("data-section-id")!=section or int(arabic["data-segment-index"])!=index:
            raise AssertionError("Interleaved Arabic/English mismatch")
        orig=segments_by[(section,index)]
        en_runs=split_runs(english);ar_runs=split_runs(arabic)
        english_source="".join(r["text"] for r in en_runs if r["kind"]=="text")
        arabic_source="".join(r["text"] for r in ar_runs if r["kind"]=="text")
        if english_source!=orig["en"] or arabic_source!=orig["vocalized"]:
            raise AssertionError("Failed lossless original source: "+str((section,index)))
        note_list=[]
        for note in pair.select(".footnote-declarations span.footnote"):
            nid=note.get("data-note-id")
            if not nid:raise AssertionError("Unnamed original scholarly footnote")
            body=note.select_one(".note-prose")
            if body is None:raise AssertionError("Empty original note-prose wrapper")
            num=int(note["data-note-number"])
            title=note.select_one(".footnote-kind")
            row={"id":nid,"number":num,"language":note.get("lang","en"),
                "kind":title.get_text(strip=True) if title else "Qur'an source",
                "body":body.get_text(),
                "source_urls":[a["href"] for a in body.select("a[href^='http']")
                               if a.get("href")],
                "source_pair":f"{section}:{index}"}
            if nid in note_map:dupes.append(nid)
            else:note_map[nid]=row
            note_list.append(nid)
            notes_by_section[section]=notes_by_section.get(section,0)+1
        en_calls=[r for r in en_runs if r["kind"]=="call"]
        ar_calls=[r for r in ar_runs if r["kind"]=="call"]
        for call in en_calls+ar_calls:
            called_ids.add(call["href"].split("--repeat-")[0]);all_calls.append(call)
        rows.append({"id":f"R{int(section):03d}-P{index+1:02d}" if section.isdigit()
                    else "colophon-P"+str(index+1),
                     "section":section,"segment":index,"english":orig["en"],
                     "arabic":orig["vocalized"],"arabic_unvowelled":orig["ar"],
                     "en_runs":en_runs,"ar_runs":ar_runs,
                     "note_ids":note_list, "english_call_count":len(en_calls),
                     "arabic_call_count":len(ar_calls)})
    if dupes:raise AssertionError("Footnote declared twice: "+repr(dupes[:5]))
    authorial=[r for r in rows if r["section"].isdigit()]
    if len(authorial)!=414:raise AssertionError("Canonical 414 passages not present")
    expected=baseline["expected_note_count"]
    if expected!=len(note_map):
        raise AssertionError(f"Study actual bodies {len(note_map)} differ from expected {expected}")
    if set(note_map)!=called_ids:
        raise AssertionError("Actual declared original footnote IDs != referenced IDs: "+
                             repr((set(note_map)-called_ids,called_ids-set(note_map))))
    expected_nums=list(range(1,len(note_map)+1))
    got_nums=sorted(v["number"] for v in note_map.values())
    if got_nums!=expected_nums:
        raise AssertionError("Source Study note numbering is not continuous")
    sha=hashlib.sha256((ROOT/"daruri"/"edition-r3-20261020.js").read_bytes()).hexdigest()
    if sha!="e233057d26772249b17b456d9c8aeaf8fd7d5c293c9875c32569d29bb3d9e22e":
        raise AssertionError("Unreviewed original source SHA change")
    payload={"schema":"gnamma-study-real-notes-v1",
        "sha256":sha,"notes":sorted(note_map.values(),key=lambda n:n["number"]),
        "rows":rows,
        "source_verification":baseline,
        "statistics":{"authorial_sections":258,"authorial_passages":414,
                      "total_bilingual_pairs":len(rows),
                      "printed_note_bodies":len(note_map),
                      "original_note_calls":len(all_calls),
                      "english_note_calls":sum(r["english_call_count"] for r in rows),
                      "arabic_note_calls":sum(r["arabic_call_count"] for r in rows)}}
    (dest/"study_source.json").write_text(json.dumps(payload,ensure_ascii=False,indent=1)+"\n","utf8")
    original_css=MAIN_TEXT_CSS+"\n"+(ROOT/"daruri/build/styles.css").read_text("utf8")
    extra_css="""
      @font-face{font-family:'GnammaNaskh';src:url('/daruri/build/fonts/NotoNaskhArabic-Regular.ttf')}
      @font-face{font-family:'GnammaLatin';src:url('/daruri/build/fonts/NotoSerif-Regular.ttf')}
      @page{size:A4;margin:18mm 16mm;}
      body{background:white;color:#171717;font-family:'GnammaLatin',serif;font-size:10pt;line-height:1.42}
      .main-text .source-segment.arabic{font-family:'GnammaNaskh',serif;font-size:12.8pt;direction:rtl}
      .main-text .source-segment.english{font-family:'GnammaLatin',serif;font-size:9.6pt}
      .main-text .footnote{font-size:8pt}
      .text-section{margin-bottom:.8em}
      @media print{a{color:inherit;text-decoration:none}}
      """
    def html_page(content, title):
        return ('<!doctype html><html lang="en"><head><meta charset="utf-8">'+
          '<title>'+title+'</title><style>'+original_css+"\n"+extra_css+'</style></head>'+
          '<body><h1>'+title+'</h1><p>Original 414 bilingual passages, canonical Study notes; NONRELEASE test.</p>'+
          content+'</body></html>')
    (dest/"study_full.html").write_text(html_page(raw,"Daruri full Study footnote stress"),"utf8")
    # Export actual approved scholarly publication components (cover, original
    # contents, editorial contents and Study index) as HTML alone, without
    # calling WeasyPrint, using stable anchor IDs from original source.
    from build_editions import cover, guide, detailed_contents, render_index
    publication=cover("study")+guide("study")+detailed_contents(book,"study")+raw+render_index(book,True)
    publication_html=html_page(publication,"Daruri real complete Study with contents")
    (dest/"study_publication.html").write_text(publication_html,"utf8")
    publication_soup=BeautifulSoup(publication_html,"html.parser")
    ids={str(tag["id"]) for tag in publication_soup.select("[id]")}
    want={"section-"+str(i) for i in range(1,259)}
    anchors=[tag.get("href","")[1:] for tag in publication_soup.select("a[href^='#']")]
    if not want.issubset(ids):
        raise AssertionError("Missing original stable section anchor ID in full publication")
    if len(set(anchors)&want)<258:
        raise AssertionError("Original numbered contents guide fails to link all 258 sections")
    (dest/"publication_evidence.json").write_text(json.dumps({
        "publication_html_bytes":len(publication_html.encode("utf8")),
        "original_section_anchor_count":len(want&ids),
        "numbered_original_section_links":len(set(anchors)&want),
        "other_nav_links":len(anchors)-sum(a in want for a in anchors),
        "main_footnote_bodies":len(note_map),
        "main_authorial_pairs":len(authorial),
        "source_sha256":sha
    },ensure_ascii=False,indent=2)+"\\n","utf8")
    # Include §65 plus ten sections selected by *actual* highest note density.
    required={"1","65","258"}
    order=sorted(notes_by_section,key=lambda section:(-notes_by_section[section],int(section)))
    keep=required|set(order[:10])
    stress=copy.deepcopy(soup)
    for section_tag in stress.select(".text-section"):
        if section_tag.get("data-section-id") not in keep:section_tag.decompose()
    (dest/"study_stress.html").write_text(html_page(str(stress),"Daruri dense source footnote stress"),"utf8")
    info={**payload["statistics"],"selected_stress_sections":sorted(keep,key=int),
       "baseline_footnote_calls":baseline["quran_marker_count"],
       "baseline_expected_notes":baseline["expected_note_count"],
       "baseline_rendered_notes":baseline["rendered_note_count"],
       "study_source_html_sha256":hashlib.sha256(raw.encode()).hexdigest()}
    (dest/"fixture_evidence.json").write_text(json.dumps(info,ensure_ascii=False,indent=2)+"\n","utf8")
    print("DARURI_STUDY_REAL_SOURCE_FIXTURE",json.dumps(info,ensure_ascii=False),flush=True)
if __name__=="__main__":main()
