#!/usr/bin/env python3
"""Read-only real-PDF audit. No prebuilt PDF was used as a generator input."""
from __future__ import annotations
import hashlib,json,re,sys
from pathlib import Path
import fitz
pdf=Path(sys.argv[1])
source=json.loads(Path(sys.argv[2]).read_text("utf8"))
output=Path(sys.argv[3])
with fitz.open(pdf) as doc:
    names=doc.resolve_names()
    required=[f"section-{n}" for n in range(1,259)]
    missing=[name for name in required if name not in names]
    links=[link for page in doc for link in page.get_links()]
    broken=[x for x in links if x.get("kind")==fitz.LINK_GOTO and
        (not isinstance(x.get("page"),int) or x["page"]<0 or x["page"]>=len(doc))]
    a4bad=[i+1 for i,p in enumerate(doc)
        if abs(p.rect.width-595.276)>2 or abs(p.rect.height-841.89)>2]
    texts=[p.get_text() for p in doc]
    combined="\n".join(texts)
    arabic=sum("\u0600"<=c<="\u08ff" for c in combined)
    latin=sum(c.isascii() and c.isalpha() for c in combined)
    meta={"schema":"gnamma-full-source-native-pdf-qa-v1",
        "mode":source["edition"],
        "pdf_sha256":hashlib.sha256(pdf.read_bytes()).hexdigest(),
        "pages":len(doc),"bytes":pdf.stat().st_size,
        "pdf_links":len(links),"pdf_outlines":len(doc.get_toc()),
        "named_destinations":len(names),
        "source_section_destinations":258-len(missing),
        "missing_named_source_destinations":missing,
        "invalid_go_to_links":broken[:10],
        "non_A4_pages":a4bad[:10],
        "extracted_arabic_character_count":arabic,
        "extracted_latin_character_count":latin,
        "original_source_segments_expected":source["source_segments"],
        "source_sha256":source["source_sha256"],
        "scholarly_note_bodies_expected":source["total_original_notes"],
        "scholarly_dictionary_terms_expected":source["historical_dictionary_terms"],
        "scholarly_complete_articles_expected":source["historical_dictionary_articles"],
        "source_is_html_not_pdf":True,
        "fully_vowelled_exact_pdf_search_required":False,
        "production_approved":False}
    meta["basic_structural_gate"]=not bool(missing or broken or a4bad) and len(doc)>10 and len(links)>30
output.parent.mkdir(parents=True,exist_ok=True)
output.write_text(json.dumps(meta,ensure_ascii=False,indent=2)+"\n","utf8")
print("GNAMMA_ULTIMATE_NATIVE_PDF_AUDIT",json.dumps(meta,ensure_ascii=False),flush=True)
if not meta["basic_structural_gate"]:raise AssertionError("Browser export basic structure incomplete")
