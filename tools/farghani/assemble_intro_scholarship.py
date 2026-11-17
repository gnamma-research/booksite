#!/usr/bin/env python3
"""Prepare attestations and a printable, documented provisional introductory edition.
Only already photographed 1876 PRINT readings, never invented manuscript variants.
"""
from __future__ import annotations
from pathlib import Path
from collections import defaultdict,Counter
from html import escape
from bs4 import BeautifulSoup
import csv,json,re,datetime,unicodedata
ROOT=Path(__file__).resolve().parents[2]
BOOK=ROOT/"texts/al-farghani/muntaha-al-madarik"
EDIT=BOOK/"editorial"
src=json.loads((BOOK/"data/intro-arabic-b2007-digital.json").read_text())
gloss=json.loads((EDIT/"GLOSSARY_WORKING_019.json").read_text())
audit=json.loads((EDIT/"INTRO_SOURCE_AUDIT_019.json").read_text())
coll=json.loads((EDIT/"I1876_COLLATION_CUMULATIVE_006.json").read_text())
plain=(BOOK/"parallel-introduction.html").read_text()
if len(src["pages"])!=128 or len(gloss["entries"])!=66 or len(coll["comparisons"])!=15:
  raise RuntimeError("Corpus/critical source counts changed; stop rather than silently overwrite.")
VOWELS=re.compile(r"[\u064b-\u065f\u0670\u0640]")
NONAR=re.compile(r"[^ء-ي0-9]+")
def norm(s):
 s=VOWELS.sub("",str(s)).translate(str.maketrans({"أ":"ا","إ":"ا","آ":"ا","ى":"ي","ؤ":"و","ئ":"ي","ة":"ه"}))
 return NONAR.sub(" ",s).strip()
pages={x["page"]:x for x in src["pages"]}
normalized={page:norm(x["raw_ar"]) for page,x in pages.items()}
comparisons_by_page=defaultdict(list)
for c in coll["comparisons"]:comparisons_by_page[c["b2007_page"]].append(c)
for entry in gloss["entries"]:
 query=norm(entry["arabic"]);hits=[page for page,text in normalized.items() if query in text] if query else []
 entry["attested_b2007_online_pages"]=hits
 entry["exact_digital_phrase_attested"]=bool(hits)
 entry["source_attestation_grade"]="exact normalized term in modern online edition, NOT collated print or MS"
glossary={"schema":"gnamma-farghani-introduction-glossary-attested-019","work":"Four foundations and concluding preface only",
 "attestation": "Term appearances identified by normalized substring within the B2007 online digital transcription. Not a manuscript-level gloss or check of translation accuracy.",
 "total_entries":len(gloss["entries"]),
 "entries_with_exact_digital_attestation":sum(e["exact_digital_phrase_attested"] for e in gloss["entries"]),
 "entries":gloss["entries"]}
(EDIT/"GLOSSARY_ATTESTED_019.json").write_text(json.dumps(glossary,ensure_ascii=False,indent=2)+"\n")
sections=defaultdict(list)
for e in gloss["entries"]: sections[e["category"]].append(e)
md=["# Farghānī · Contextual Arabic–English glossary, introduction only",
    "", "**Status:** 66 editorial candidate terms, page references checked against a modern online digitized transcription only. The glossary is not a manuscript collation and should not be treated as a dictionary of all Akbarian usage.",
    "", "All page numbers refer to the Beirut 2007 first volume's printed-page labels; the earlier 1876 printing has a different numbering.",
    ""]
for category,entries in sections.items():
 md.extend(["## "+category,"", "| Arabic | Transliteration | Contextual English | Editorial distinction | B2007 digital pages |", "|---|---|---|---|---|"])
 for e in entries:
  found=", ".join(str(p) for p in e["attested_b2007_online_pages"][:9])
  if len(e["attested_b2007_online_pages"])>9:found+=", …"
  if not found: found="Not confirmed by exact-string matching"
  note=e["editorial_distinction"].replace("|",";")
  md.append("| "+e["arabic"]+" | "+e["transliteration"]+" | "+e["english"].replace("|",";")+" | "+note+" | "+found+" |")
 md.append("")
md.extend(["## Method and limitations", "",
  "Page attestations are mechanically located and are not proof that a term has the proposed rendering at every occurrence. Unattested exact strings are retained as explicit editorial candidates, not silently passed as witnessed.",
  "The reader preserves Arabic from the modern web transcription and distinct earlier photographed 1876 print readings at fifteen bounded loci. No medieval manuscript readings have been authenticated.",
  ""])
(EDIT/"GLOSSARY_ATTESTED_019.md").write_text("\n".join(md),encoding="utf-8")
copytext_rows=[]
for p,x in pages.items():
 english_pages=re.findall(fr'<section id="p{p}" class="pr-page"[\s\S]*?<div class="pr-en" lang="en">([\s\S]*?)</div>\s*</div>',plain)
 if len(english_pages)!=1:raise RuntimeError(f"Cannot find English page {p} in parallel HTML")
 en_words=len(BeautifulSoup(english_pages[0],"html.parser").get_text(" ",strip=True).split())
 copytext_rows.append({
  "b2007_page":p,"online_arabic_words":x["arabic_words"],"online_arabic_chars":x["reading_chars"],"english_working_words":en_words,
  "english_to_arabic_word_ratio":round(en_words/max(x["arabic_words"],1),2),
  "editorial_note_auto_separated":bool(x["editorial_notes"]),
  "possible_remaining_editorial_note":bool(x["possible_unseparated_note"]),
  "selected_critical_loci":sum(rec["page"]==p for rec in audit["selected_excerpt_match_audit"]),
  "selected_critical_exact_normalized_matches":sum(rec["page"]==p and rec["exact_normalized_digital_match"] for rec in audit["selected_excerpt_match_audit"]),
  "photographed_1876_PRINT_bounded_loci":len(comparisons_by_page[p]),
  "print_variant_ids":";".join(z["id"] for z in comparisons_by_page[p])
 })
with (EDIT/"INTRO_PAGE_COVERAGE_019.csv").open("w",newline="",encoding="utf-8") as fh:
 w=csv.DictWriter(fh,fieldnames=list(copytext_rows[0].keys()));w.writeheader();w.writerows(copytext_rows)
apparatus=[];unconfirmed=[]
for c in coll["comparisons"]:
 p=c["b2007_page"]
 actual=norm(c["beirut_digital"]) in normalized[p]
 item={**c,"current_B2007_digital_phrase_exactly_located":actual,
 "note":"Historical 1876 printed reading inherited from earlier photographed-source research, not re-inspected as a new folio and not manuscript evidence."}
 apparatus.append(item)
 if not actual:unconfirmed.append(c["id"])
app_json={"schema":"gnamma-farghani-introduction-collation-audit-019",
 "existing_historical_print_loci":15,"new_photographed_print_loci_read_this_stage":0,
 "prior_PRINT_differences":7,"prior_PRINT_agreements":8,
 "current_digital_reference_phrase_hits":sum(x["current_B2007_digital_phrase_exactly_located"] for x in apparatus),
 "reference_phrases_not_located_exactly":unconfirmed,
 "manuscript_variants_verified":0,
 "scope":"B2007 digitized source strings checked against 15 inherited I1876 PRINT-to-digital comparisons; not a new complete historic page collation",
 "comparisons":apparatus}
(EDIT/"I1876_RECHECK_019.json").write_text(json.dumps(app_json,ensure_ascii=False,indent=2)+"\n")
lines=[
 "# Farghānī · Provisional source-critical apparatus, introduction pp18–145",
 "",
 "**Editorial grade:** digital authorial reading copy, English working translation, and selected historical PRINT collations only. **No manuscript witness, complete Arabic critical edition or independently peer-reviewed edition is claimed.**",
 "",
 f"**Coverage:** 128 page-labelled Arabic digital and English working pages; 559 graded selected Arabic–English checks; 15 inherited historical 1876 photographed PRINT comparisons (7 differences, 8 agreements).",
 "",
 f"The live digital transcription contains the exact normalized quoted B2007 reading in **{app_json['current_digital_reference_phrase_hits']} of 15** prior comparison records; missing literal strings should be inspected individually, and are not proof that the entire published comparison is wrong.",
 "",
 "| Locus | B2007 page | 1876 printed page | Online digital reading | Photographed 1876 print reading | Status |", "|---|---:|---:|---|---|---|"
]
for c in apparatus:
 lines.append(f"| {c['id']} | {c['b2007_page']} | {c['i1876_printed_page']} | {c['beirut_digital'].replace('|',';')} | {c['i1876_reading'].replace('|',';')} | {c['relationship']}; digital string {'found' if c['current_B2007_digital_phrase_exactly_located'] else 'not found verbatim'} |")
lines.extend(["","## Method","",
"An agreement/difference indicates a bounded photographic comparison between an earlier **printed** edition and the later digital text. It does not establish authorial stemma, physical paper B2007 reading or independent medieval manuscript variants.",
"Preserve the online digital text as diplomatic source evidence even where the 1876 reading is preferred provisionally. Do not silently substitute historical readings into the text.",
"","## What has and has not been checked","",
"All 128 online page numbers and Arabic/English parallel page labels are present; mechanically comparing 559 selected excerpts yielded 510 exact normalized matches and 49 flagged passages for deeper review. A normalized string match does not prove sentence-level translation quality or completeness.",
f"Modern editor’s footnotes are separated from authorial running text on {audit['pages_with_explicit_editorial_notes']} pages. The {len(audit.get('editorial_footer_reconciliation',{}).get('editorNotePagesCorrected',[]))} reviewed footer-note repairs and the cleared verse-number false positive are recorded in the audit. Automatic residual flags: {audit['pages_with_possible_unseparated_notes']}. This does not certify a fully collated edition.",
"","## Print and manuscript source locations","",
"- 1876 photographed printing, volume I: https://sites.dlib.nyu.edu/viewer/books/princeton_aco000264/1?embed=1&lang=en",
"- Online edited digital Beirut 2007 transcription: https://ablibrary.net/book_content/b/9606/18?lang=ar",
"- Publisher edition catalogue: https://www.al-ilmiyah.com/files/bookpage/9782745146120.html",
"- Full review queue: [INTRO_SOURCE_AUDIT_019.json](INTRO_SOURCE_AUDIT_019.json)",
"- Glossary with checked digital-page attestations: [GLOSSARY_ATTESTED_019.md](GLOSSARY_ATTESTED_019.md)",
"","## Remaining editorial qualifications","",
"Printed physical 2007 pages, unverified digital scribal/typographic anomalies and independent handwritten manuscript folios are still outstanding. Specialist peer review is required before this may be called a definitive critical edition.",
])
(EDIT/"SCHOLARLY_APPARATUS_019.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
# Construct static printer's typesetting master: not the live website.
soup=BeautifulSoup(plain,"html.parser")
main=soup.select_one("#pr-reading")
if main is None or len(main.select("section.pr-page"))!=128:
 raise RuntimeError("Can't verify 128 parallel printed sections")
apparatus_html="".join(f"<tr><td>{escape(c['id'])}</td><td>{c['b2007_page']}</td><td>{c['i1876_printed_page']}</td><td lang='ar' dir='rtl'>{escape(c['beirut_digital'])}</td><td lang='ar' dir='rtl'>{escape(c['i1876_reading'])}</td><td>{escape(c['relationship'])}</td></tr>" for c in apparatus)
gloss_html="".join(f"<tr><td lang='ar' dir='rtl'>{escape(e['arabic'])}</td><td>{escape(e['transliteration'])}</td><td>{escape(e['english'])}</td><td>{escape(e['editorial_distinction'])}</td><td>{', '.join(map(str,e['attested_b2007_online_pages'][:7])) or 'Unconfirmed exact phrase'}</td></tr>" for e in gloss["entries"])
front="""<section class="print-front">
<p class="overline">GNAMMA RESEARCH · PROVISIONAL INTRODUCTORY EDITION</p>
<h1>Saʿīd al-Dīn al-Farghānī</h1>
<h2>Muntahā al-madārik</h2>
<h3>The Four Foundations and Concluding Preface</h3>
<p class="ar-title" lang="ar" dir="rtl">منتهى المدارك في شرح تائية ابن الفارض</p>
<p>Page-aligned Arabic online transcription and English working translation, with contextual glossary and bounded print-comparison apparatus.</p>
<p class="edition-notice"><b>Scholarly status.</b> This is an annotated working reader, <b>not</b> a definitive constituted Arabic critical edition. Arabic is digitized from the modern Beirut edition, English is a working translation, fifteen historical-print comparisons are bounded, and no manuscript folios have been independently collated.</p>
<p>Beirut 2007 printed page references: 18–145. Four foundations end at 143; the supplementary preface occupies 144–145. The verse-by-verse poem commentary is excluded.</p>
<h3>Editorial method</h3><ol>
<li>Preserve and distinguish the online digital transcription and historical 1876 photographic-print readings.</li>
<li>Display Arabic–English correspondence at the <b>printed-page level</b>; no sentence-level parity is implied.</li>
<li>Separate modern editorial notes where identified, with uncertain residuals recorded in an audit register.</li>
<li>Show contextual terms with attestations only to the modern digital page text.</li>
<li>Do not promote source-critical comparisons into manuscript variant claims.</li>
</ol>
<p>References: Beirut first edition edited by ʿĀṣim Ibrāhīm al-Kayyālī (Dar al-Kutub al-ʿIlmiyya, ISBN 978-2-7451-4612-0); Istanbul 1293/1876 printing (Princeton/NYU Arabic Collections Online).</p>
</section>"""
appendix=f"""<section class="print-appendix"><h2>Appendix A · Fifteen photographic-print comparisons</h2>
<p>These are historical PRINT-to-digital comparisons; no medieval manuscript folios were examined. Seven differences, eight agreements. A discrepancy need not be a reading of the physical 2007 print.</p>
<table><thead><tr><th>Locus</th><th>B2007</th><th>I1876</th><th>Modern digitized Arabic</th><th>Historical printed Arabic</th><th>Relation</th></tr></thead><tbody>{apparatus_html}</tbody></table>
</section><section class="print-appendix"><h2>Appendix B · Contextual glossary (66 terms)</h2>
<p>Attestation page numbers are electronically located in the online digital transcription, not manuscript-collated. Context and semantic grade remain provisional.</p>
<table><thead><tr><th>Arabic</th><th>Transliteration</th><th>Working English</th><th>Editorial distinction</th><th>B2007 pages</th></tr></thead><tbody>{gloss_html}</tbody></table>
</section>
<section class="print-appendix"><h2>Appendix C · Editorial limitations and review tasks</h2>
<p>There are 49 selected Arabic excerpts not matching exactly after normalization against the online B2007 reading. These require scrutiny for abbreviation, transcription, formulaic variation, page mislocation or a genuine textual issue. Mere word overlap does not settle a variant.</p>
<p>The modern physical Beirut print has not been inspected at the p52 divine-name disagreement. The full 128-page working English remains to be verified clause by clause by a specialist. The independently collated manuscript count is zero.</p></section>"""
style="""<style>
@page{size:A4;margin:15mm 13mm}
body{font-family:Georgia,serif;color:#14232a;margin:0}
.print-front{break-after:page;padding-top:15mm;font:12pt/1.6 Georgia,serif}
.print-front h1{font:500 28pt Georgia,serif;margin:10mm 0 4mm}
.print-front h2{font:500 22pt Georgia,serif;margin:2mm 0}
.print-front h3{font:600 13pt Georgia,serif;margin-top:9mm}
.print-front .overline{font:700 8pt sans-serif;letter-spacing:.13em;color:#436772}
.print-front .ar-title{font:19pt/1.9 "Noto Naskh Arabic","Amiri","DejaVu Sans",serif;text-align:right}
.print-front .edition-notice{background:#edf1ef;padding:9pt;border-left:3pt solid #315b67}
.print-front li{margin-bottom:4mm}
.pr-page{break-before:page;break-inside:auto}
.pr-page:first-child{break-before:auto}
.pr-part{border-bottom:1px solid #93afb4;padding-bottom:6pt;color:#42606a;font:600 10pt sans-serif}
.pr-page-title{font:600 9pt sans-serif;padding-bottom:3mm;border-bottom:1px solid #b4c1c4;color:#315b67}
.pr-page-title small{font:400 8pt sans-serif;margin-left:6pt;color:#667}
.pr-text{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:9mm;align-items:start}
.pr-ar{font:11pt/1.8 "Noto Naskh Arabic","Amiri","DejaVu Sans",serif;direction:rtl;text-align:right;unicode-bidi:isolate}
.pr-en{font:9.5pt/1.62 Georgia,serif;text-align:left}
.pr-ar p,.pr-en p{margin:0 0 8pt}
.pr-en blockquote{padding:6pt;border-left:2px solid #315b67}
.pr-apparatus{display:none!important}
.print-appendix{break-before:page;page-break-before:always}
.print-appendix h2{font:500 20pt Georgia,serif;border-bottom:2px solid #315b67;padding-bottom:6pt}
.print-appendix p{font:10pt/1.55 Georgia,serif}
.print-appendix table{width:100%;border-collapse:collapse;table-layout:auto;font:8pt/1.4 Georgia,serif}
.print-appendix th{font:600 8pt sans-serif;background:#e6edec;border-bottom:1pt solid #6d878d}
.print-appendix td,.print-appendix th{border-bottom:1px solid #d8e1e1;padding:5pt 3pt;text-align:left;vertical-align:top;overflow-wrap:anywhere}
.print-appendix td[lang=ar]{font:10pt/1.7 "Noto Naskh Arabic","Amiri","DejaVu Sans",serif;text-align:right;direction:rtl}
.print-appendix tr{break-inside:avoid}
</style>"""
print_html='<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Farghani Introductory Scholarly Working Edition XIX</title>'+style+'</head><body>'+front+str(main)+appendix+'</body></html>'
(BOOK/"editorial/PRINT_SCHOLARLY_INTRO_019.html").write_text(print_html,encoding="utf-8")
print(json.dumps({"glossary_total":len(gloss["entries"]),"glossary_attested_exact":glossary["entries_with_exact_digital_attestation"],
 "historic_print_loci":15,"modern_reference_phrases_matched":app_json["current_digital_reference_phrase_hits"],
 "modern_reference_phrases_unmatched":unconfirmed,"page_audit_csv_rows":len(copytext_rows),
 "print_html_chars":len(print_html)},indent=2))
