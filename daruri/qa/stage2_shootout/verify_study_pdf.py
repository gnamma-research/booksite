#!/usr/bin/env python3
"""Audit actual browser-compiler PDF output, not HTML preflight assertions."""
from __future__ import annotations
import hashlib,json,re,sys
from pathlib import Path
import fitz

pdf=Path(sys.argv[1]);source=json.loads(Path(sys.argv[2]).read_text("utf8"))
output=Path(sys.argv[3])
if source["schema"]!="gnamma-study-real-notes-v1":raise ValueError("Wrong source")
doc=fitz.open(pdf)
text_pages=[p.get_text(sort=False) for p in doc]
note_results=[]
for note in source["notes"]:
    original=note["body"]
    words=re.findall(r"[a-zA-Z]{3,}",original)
    q=" ".join(words[:3]) if len(words)>=3 else ""
    hits=[(n+1,len(page.search_for(q))) for n,page in enumerate(doc) if q and page.search_for(q)]
    note_results.append({"id":note["id"],"number":note["number"],"english_query":q,
                         "pages_with_note_snippet":[n for n,k in hits]})
sections=[r for r in source["rows"] if str(r["section"]).isdigit()]
english_results=[]
for row in sections:
    q=" ".join(row["english"].split()[:3])
    found=any(p.search_for(q) for p in doc if q)
    english_results.append(found)
geom_outside=[]
for n,p in enumerate(doc):
    for block in p.get_text("blocks"):
        x0,y0,x1,y1=block[:4]
        if x0 < -1 or y0 < -1 or x1>p.rect.width+1 or y1>p.rect.height+1:
            geom_outside.append({"page":n+1,"rect":[round(x,2) for x in (x0,y0,x1,y1)]})
metrics={
 "schema":"gnamma-stage2-real-study-notes-pdf-audit-v1",
 "pdf_file":str(pdf),"pdf_sha256":hashlib.sha256(pdf.read_bytes()).hexdigest(),
 "pdf_pages":len(doc),"pdf_size_bytes":pdf.stat().st_size,
 "expected_original_english_source_paragraphs":len(sections),
 "English_first_three_words_native_Find":sum(english_results),
 "expected_note_bodies":len(source["notes"]),
 "note_snippets_with_3_english_words_found":sum(bool(n["pages_with_note_snippet"]) for n in note_results),
 "notes_without_stable_English_snippet":[n["id"] for n in note_results if not n["pages_with_note_snippet"]],
 "notes_with_searchable_snippet":[n for n in note_results if n["pages_with_note_snippet"]][:8],
 "outline_entries":len(doc.get_toc()),"internal_and_external_links":sum(len(p.get_links()) for p in doc),
 "out_of_page_text_blocks":geom_outside[:15],"out_of_page_text_block_total":len(geom_outside),
 "first_source_english_visible":any("أما بعد" in t or "Praise" in t or "After" in t for t in text_pages[:3]),
 "browser_generation_proven":False,
 "study_footnotes_same_page_proven":False,
 "publication_approved":False
}
output.parent.mkdir(parents=True,exist_ok=True)
output.write_text(json.dumps(metrics,ensure_ascii=False,indent=2)+"\n","utf8")
print("DARURI_STUDY_ACTUAL_PDF_MEASURES",json.dumps({k:v for k,v in metrics.items() if k not in ("notes_with_searchable_snippet","out_of_page_text_blocks","notes_without_stable_English_snippet")},ensure_ascii=False))
if len(doc)<30:raise AssertionError("Far too few pages for actual Study text")
if len(doc.get_toc())<250:raise AssertionError("Missing 258 section headings in PDF")
if metrics["out_of_page_text_block_total"]>0:raise AssertionError("Text clipped beyond physical pages")
