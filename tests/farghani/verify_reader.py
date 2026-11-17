#!/usr/bin/env python3
"""GNAMMA Farghānī introduction reader — deterministic text, UI, and provenance QA.
Reads local checked-out files only; never silently rewrites a translated sentence.
"""
from __future__ import annotations
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re
from html import unescape
import sys

ROOT = Path(__file__).resolve().parents[2]
BOOK = ROOT / "texts/al-farghani/muntaha-al-madarik"
FILES = [
    "continuous-translation.html", "critical-introduction.html",
    "full-reader.css", "full-reader.js",
    "critical-edition.html", "critical-reader.js",
    "reader.css", "reader.js", "index.html", "extracts.html", "parallel-introduction.html",
    "handoffs.html", "data/units.js",
]
VOID = {"area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"}
FAILED = []
WARNINGS = []

def check(ok, msg):
    if not ok: FAILED.append(msg)

class Validator(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack=[]
        self.ids=[]
        self.hrefs=[]
        self.srcs=[]
        self.errors=[]
    def handle_starttag(self, tag, attrs):
        props=dict(attrs)
        if props.get("id"): self.ids.append(props["id"])
        if props.get("href"): self.hrefs.append(props["href"])
        if props.get("src"): self.srcs.append(props["src"])
        if tag not in VOID: self.stack.append(tag)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.stack and self.stack[-1]==tag:self.stack.pop()
    def handle_endtag(self, tag):
        if tag in VOID: return
        if not self.stack or self.stack[-1]!=tag:
            self.errors.append(f"unbalanced closing </{tag}> after {self.stack[-4:]}")
            if tag in self.stack:
                while self.stack and self.stack[-1]!=tag:self.stack.pop()
                if self.stack:self.stack.pop()
        else:self.stack.pop()

htmls={}
for filename in FILES:
    path=BOOK/filename
    check(path.is_file(),f"Missing expected file: {filename}")
    if not path.is_file(): continue
    if filename.endswith(".html"):
        txt=path.read_text(encoding="utf-8")
        validator=Validator()
        validator.feed(txt)
        validator.close()
        htmls[filename]=(txt,validator)
        check(not validator.errors,f"{filename}: malformed closing tags: {validator.errors[:7]}")
        check(not validator.stack,f"{filename}: unclosed tag stack: {validator.stack[-10:]}")
        duplicates=[k for k,v in Counter(validator.ids).items() if v>1]
        check(not duplicates,f"{filename}: duplicate IDs {duplicates[:20]}")
        # Local asset + anchor integrity, with no network requests.
        for link in validator.hrefs+validator.srcs:
            if not link or link.startswith(("https:","http:","mailto:","tel:","data:","javascript:")): continue
            u=urlsplit(link)
            if u.path.startswith("//"): continue
            resolved=path.parent/(unquote(u.path) or path.name)
            if u.path.endswith("/"):resolved=resolved/"index.html"
            resolved=resolved.resolve()
            if not resolved.exists():
                FAILED.append(f"{filename}: broken internal link {link} -> {resolved.relative_to(ROOT) if resolved.is_relative_to(ROOT) else resolved}")
            if (not u.path or resolved==path.resolve()) and u.fragment:
                check(u.fragment in validator.ids,f"{filename}: broken same-page fragment #{u.fragment}")

home,_=htmls.get("index.html",("",None))
check("Complete English working translation of the introduction" in home,"Book homepage must clearly state complete working translation")
check('href="continuous-translation.html"' in home and 'href="parallel-introduction.html"' in home,
      "Book homepage must offer full English and full page-aligned Arabic-English readers")
check('href="extracts.html"' in home,"Partial research extracts need a separate destination")
check("four foundations" in home.lower() and "pp. 144–145" in home,
      "Book homepage must distinguish authorial scope and concluding preface")
essay,_=htmls.get("critical-introduction.html",("",None))
if essay:
    check("has not been fully transcribed or translated" not in essay,
          "Stale incomplete-translation statement still appears in editorial study")

# Reviewed digital footnote boundaries are not authorial Arabic.
arabic_source = json.loads((BOOK/"data/intro-arabic-b2007-digital.json").read_text(encoding="utf-8"))
arabic_pages = arabic_source.get("pages", [])
check(len(arabic_pages)==128, "Arabic digital source lost printed page coverage")
reviewed = [20,21,23,25,29,47,48,67,83,87,112,115,118,128,130,136]
assert_page = {p["page"]:p for p in arabic_pages}
parallel, _ = htmls.get("parallel-introduction.html", ("",None))
for n in reviewed:
    p=assert_page[n]
    check(p.get("editorial_split_method")=="reviewed-digital-footer-note-separation",
          f"p{n}: modern editorial footer not classified")
    check(p["raw_ar"]==p["reading_ar"]+" "+p["editorial_notes"],
          f"p{n}: source text not reversibly preserved")
    check(not p.get("possible_unseparated_note", True), f"p{n}: stale unseparated note warning")
    match=re.search(rf'<section id="p{n}" class="pr-page"[\s\S]*?<div class="pr-ar" lang="ar" dir="rtl"><p>([\s\S]*?)</p></div>', parallel)
    check(bool(match) and unescape(match.group(1))==p["reading_ar"],f"p{n}: bilingual reading is not the purified Arabic")
    section=re.search(rf'<section id="p{n}" class="pr-page"([\s\S]*?)</section>',parallel)
    check(bool(section) and "pr-editorial-notes" in section.group(1) and
          unescape(p["editorial_notes"])[:25] in unescape(section.group(1)),
          f"p{n}: source note lost from separate apparatus")
p26=assert_page[26]
check(p26["reading_ar"]==p26["raw_ar"] and not p26["editorial_notes"] and
      p26["footnote_review"]["status"]=="false-positive-verse-number",
      "p26 Quranic verse number was inappropriately moved to editorial apparatus")
check(not re.search(r"\(\s*1\s*\)\s*(?:رواه مسلم|أورده الحكيم|هذا الأثر لم أجده|أورده المناوي|عزاه السيوطي|كذا بالأصل|فذلك حسابه)",
                    " ".join(p["reading_ar"] for p in arabic_pages)),
      "Arabic reading still contains bibliographic text that belongs to editor footnotes")
source_audit=json.loads((BOOK/"editorial/INTRO_SOURCE_AUDIT_019.json").read_text(encoding="utf-8"))
check(source_audit["pages_with_possible_unseparated_notes"]==0,
      "Old flagged digital source notes remain without adjudication")
check(set(source_audit["editorial_footer_reconciliation"]["editorNotePagesCorrected"])==set(reviewed),
      "Editorial reconciliation register differs from the reviewed page set")
check(source_audit["pages_with_explicit_editorial_notes"]==sum(bool(p["editorial_notes"]) for p in arabic_pages),
      "Reported modern-note count differs from the source")
# Future live-source regeneration must reproduce the reviewed p20 split, even
# though the modern editorial notes occupy most of its flattened raw page.
builder_path=ROOT/"tools/farghani/build_intro_parallel.py"
builder=builder_path.read_text(encoding="utf-8")
try:
    compile(builder,str(builder_path),"exec")
except SyntaxError as exc:
    FAILED.append(f"Source regeneration script is not Python syntax: {exc}")
check("if m.start()>len(raw)*.30" in builder,
      "Reviewed digital footer splitter still rejects the long p20 modern note")
check("if m.start()>len(raw)*.45" in builder,
      "Unreviewed footer heuristic lost its conservative 45% guard")
for n in reviewed:
    p=assert_page[n]
    check(len(p["reading_ar"]) > len(p["raw_ar"])*.30,
          f"p{n}: reviewed footer falls outside the authenticated 30%-guard")


main,v=htmls.get("continuous-translation.html",("",None))
pages=re.findall(r'<section class="b2007-page"[^>]+id="b2007-p(\d+)"',main)
check([int(p) for p in pages]==list(range(18,146)),"Full English page headings are missing, reordered or duplicated")
check(all(f'id="apparatus-p{p}"' in main for p in range(18,146)),"Scholarly source apparatus lacks a p18–145 entry")
check(sum('data-part-start="' in m for m in re.findall(r'<section class="b2007-page"[^>]+>',main))==5,"Must have exactly five foundation/preface section markers")
ptext=re.search(r'<article id="document">([\s\S]*?)</article>',main)
check(bool(ptext),"Full English reading article missing")
if ptext:
    full=ptext.group(1)
    pcount=len(re.findall(r"<p(?:\s[^>]*)?>",full))
    check(pcount>=850,f"Unexpectedly few translated paragraphs: {pcount}")
    check(len(full)>=300_000,"Working English body shortened unexpectedly")
    check(not re.search(r"<p>\[(?:Continuing|Continuation)",full),"Editorial continuation labels remain in reading flow")
    check("**prophethood" not in full and "istiwāʾ***" not in full,"Literal Markdown artifacts remain in reading text")
    check(not re.search(r"\*<em>|</em>\*|\*\*[^*]{0,240}\*\*|aḥadiyya\*\)",full), "Malformed Markdown/HTML emphasis or literal asterisks remain in the authorial prose")
    check("the rank of Divinity</em> (<em>martabat al-ulūhiyya</em>)" in full,"p34 Divinity styling regression")
    check("<em>wāḥidiyya</em>" in full and "<em>aḥadiyya</em>" in full,"p21 oneness/unicity emphasis regression")
    check("<em>Cloud-like Presence</em>" in full,"p34 photographed-print correction missing")

    check("Source remains provisional; historical-print" not in full,"Editorial/progress note leaked into reading text")
    check("Modern source notes, including a corrupt word" not in full,"Editorial/source note leaked into reading text")
    check(not re.search(r"<p>\s*<a[^>]+>\s*(Read Arabic|Arabic source)",full),"Standalone source links leaked back into reading text")
    check("الحضرة العمائية" in main and "Cloud-like Presence" in full,"Already photographed p34 lemma not retained")
check("70 optional notes" in main,"Apparatus summary count not updated")
required_controls=("fr-contents-open","fr-search-open","fr-bookmarks-open","fr-source-open","fr-font-down","fr-font-up","fr-theme","fr-wide","fr-markers","fr-focus","fr-copy","fr-print","fr-prev","fr-next","fr-save","fr-current","fr-progress-fill","fr-panel","fr-panel-title","fr-panel-body","fr-close","fr-exit-focus")
for c in required_controls:
    check(f'id="{c}"' in main,f"Missing interactive control #{c}")
check('defer src="full-reader.js"' in main and 'href="full-reader.css"' in main,"Main reader CSS/JS not loaded")
check('<main id="fr-main">' in main,"Main landmark missing")
check('lang="ar" dir="rtl"' in main,"No RTL Arabic title marked")
check('aria-valuenow="0"' in main,"Reading progress accessibility missing")

# Selected critical checks are counted from the eleven actual authoritative datasets,
# not from a frozen prose status summary.
source_files=sorted((BOOK/"data").glob("critical-pass-*.js"))
check(len(source_files)==11,f"Expected eleven selected critical data sets, found {len(source_files)}")
rows=[]
for file in source_files:
    text=file.read_text(encoding="utf-8")
    found=re.search(r"window\.\w+\s*=\s*(\{[\s\S]*\})\s*;\s*$",text)
    check(bool(found),f"Cannot parse dataset object from {file.name}")
    if found:
        try: object_=json.loads(found.group(1))
        except Exception as ex:
            FAILED.append(f"Invalid JSON data in {file.name}: {ex}"); continue
        rows+=object_.get("records",[])
check(len(rows)==560,f"Critical dataset count changed unexpectedly: {len(rows)} !=560")
check(len({r.get('id') for r in rows})==len(rows),"Duplicate selected critical clause ID")
check(set(r.get("page") for r in rows)==set(range(18,146)),"Some Beirut printed page labels lack any selected critical clause")
check(sum(not str(r.get("source_grade","")).startswith("secondary-") for r in rows)==284,"Edited-digitized clause count changed from 284")
check(sum(str(r.get("source_grade","")).startswith("secondary-") for r in rows)==276,"Derivative-grade clause count changed from 276")
check(all(r.get("ar") and r.get("en") and r.get("source_url") for r in rows),"Arabic, English or source URL missing from critical clause")

# Check the full set of Stage XX source-page repairs, including retention of prior provenance.
repaired={"CR008-006":(71,70),"CR008-032":(75,74),"CR009-016":(83,82),"CR009-045":(92,91),"CR009-046":(92,91),"CR009-071":(100,99),"CR009-072":(101,100),"CR010-007":(105,104),"CR010-031":(117,116),"CR010-045":(124,123),"CR011-025":(138,137),"CR011-026":(138,137)}
lookup={r["id"]:r for r in rows}
for clause_id,(prior,target) in repaired.items():
    r=lookup.get(clause_id,{})
    check(r.get("page")==target and str(r.get("source_page_marker"))==str(target),
          f"{clause_id}: B2007 digital source-page correction lost")
    check(r.get("source_page_correction",{}).get("original_record_page")==prior,
          f"{clause_id}: original derivative-page provenance lost")
    check(r.get("digital_control_url")==f"https://ablibrary.net/book_content/b/9606/{target}?lang=ar",
          f"{clause_id}: corrected direct B2007 digital link lost")
    check(bool(r.get("derivative_source_url")),f"{clause_id}: original derivative source link lost")
check(lookup.get("CR011-044",{}).get("page")==138,"New direct B2007 p138 source check lost")

# Stage XXII: verify exact digital Arabic clause coverage independently, not just selected excerpts.
full_proofs=[
    BOOK/"editorial/CONTINUOUS_PROOF_P18_20_022.json",
    BOOK/"editorial/CONTINUOUS_PROOF_P21_23_022.json",
]
proof_units=[]
full_pages=[]
for proof_file in full_proofs:
    proof=json.loads(proof_file.read_text(encoding="utf-8"))
    proof_units.extend(proof.get("units",[]))
    full_pages.extend(proof.get("page_reports",[]))
check([x.get("page") for x in full_pages]==list(range(18,24)),
      "Stage XXII continuous page audit must cover 18–23, once each")
check(len(proof_units)==76,"Stage XXII 76 full-sequence Arabic–English clause units lost")

# Stage XXIV: verify cumulative 292 source-ordered bilingual units and physical witness limits.
stage24=json.loads((BOOK/"editorial/CUMULATIVE_CONTINUOUS_PROOF_18_36_024.json").read_text(encoding="utf-8"))
reviewed24=stage24.get("units",[])
expected24={29:17,30:16,31:21,32:18,33:17,34:17,35:17,36:17}
check(len(reviewed24)==292 and len({u["id"] for u in reviewed24})==292,
      "Stage XXIV cumulative clause count/IDs must be 292")
check([p["page"] for p in stage24["page_coverage"]]==list(range(18,37)),
      "Stage XXIV must preserve exactly B2007 pp18–36")
for n in range(18,37):
    source=assert_page[n]["reading_ar"]
    clauses=[u for u in reviewed24 if u["page"]==n]
    check("".join(u["arabic_exact"] for u in clauses)==source,
          f"Stage XXIV B2007 p{n} missing/differing digitized source clause")
    check(all(source[u["offset_start"]:u["offset_end"]]==u["arabic_exact"] and
              bool(u.get("english_review")) for u in clauses),
          f"Stage XXIV B2007 p{n} corrupted source offsets or empty English")
check(all(len([u for u in reviewed24 if u["page"]==n])==m for n,m in expected24.items()),
      "Stage XXIV new eight-page clause counts changed")
check(not any(u.get("manuscript_checked",False) for u in reviewed24),
      "Stage XXIV must not claim examined medieval manuscripts")
latest24=json.loads((BOOK/"editorial/STAGE_MANIFEST_CONTINUOUS_024.json").read_text(encoding="utf-8"))
check(latest24.get("contiguous_reviewed_units")==292 and latest24.get("newly_reviewed_units")==140,
      "Stage XXIV manifest count inconsistent")
check(latest24.get("next_page")==37 and "واسم المريد" in latest24.get("next_exact_arabic",""),
      "Stage XXIV exact p37 continuation lost")
master24=(BOOK/"editorial/WORKING_TRANSLATION_18_145.md").read_text(encoding="utf-8")
full24=(BOOK/"editorial/FULL_CUMULATIVE_ENGLISH_PROOF_024.md").read_text(encoding="utf-8")
master_break="## Complete, preserved working English translation of the introduction (B2007 pp18–145)\n\n"
check(master_break in full24,
      "Stage XXIV full cumulative English master boundary missing")
if master_break in full24:
    check(full24.split(master_break,1)[1].strip()==master24.strip(),
          "Stage XXIV full English master snapshot differs from working source")
check((BOOK/"editorial/FULL_CUMULATIVE_ARABIC_SOURCE_024.md").is_file() and
      (BOOK/"editorial/FULL_CUMULATIVE_SELECTED_AND_PRINT_024.md").is_file(),
      "Stage XXIV full Arabic/selected critical archive aliases missing")

# Stage XXIII cumulative, proof-of-preservation and source fidelity (not physical witness verification).
latest=json.loads((BOOK/"editorial/CUMULATIVE_CONTINUOUS_PROOF_18_28_023.json").read_text(encoding="utf-8"))
check(latest.get("source_contiguous_clauses")==152 or len(latest.get("units",[]))==152,
      "Stage XXIII cumulative clause count must be 152")
check(latest.get("source_contiguous_pages")==11,
      "Stage XXIII must preserve eleven consecutive digital source pages")
check([p["page"] for p in latest.get("page_coverage",[])]==list(range(18,29)),
      "Stage XXIII source pages must cover exactly Beirut pp18–28")
all_units=latest["units"]
for n in range(18,29):
    a=assert_page[n]["reading_ar"]
    us=[u for u in all_units if u["page"]==n]
    check("".join(u["arabic_exact"] for u in us)==a,
          f"B2007 p{n}: changed or dropped a clause in cumulative Stage XXIII proof")
    check(all(a[u["offset_start"]:u["offset_end"]]==u["arabic_exact"] for u in us),
          f"B2007 p{n}: source offset mismatch")
    check(all(u.get("english_review") for u in us),f"B2007 p{n}: empty reviewed English")
check(len(all_units)==152 and len({u["id"] for u in all_units})==152,
      "Stage XXIII source proof unit identifiers missing/duplicated")
check(all(not u.get("manuscript_checked",False) for u in all_units),
      "Stage XXIII incorrectly claims manuscript inspection")
stage23=json.loads((BOOK/"editorial/STAGE_MANIFEST_CONTINUOUS_023.json").read_text(encoding="utf-8"))
check(stage23.get("cumulative_units")==152 and stage23.get("new_units")==76,
      "Stage XXIII declared scope mismatches cumulative source")
check("for the seventh inward degree belongs particularly to the Prophet" in
      htmls.get("continuous-translation.html",("",None))[0],
      "Page 28 seventh-degree pronoun remains misleading")
check("and as the properties of endurance and permanence attached to some" in
      htmls.get("continuous-translation.html",("",None))[0] and
      "<p>meanings of <em>shaʾn</em>" in htmls.get("continuous-translation.html",("",None))[0],
      "Page 23–24 joined sentence not synchronized")

proof_counts={p:sum(1 for x in proof_units if x.get("page")==p) for p in range(18,24)}
check(proof_counts=={18:9,19:14,20:8,21:15,22:14,23:16},
      f"Stage XXII unit boundaries changed: {proof_counts}")
for p in range(18,24):
    page=assert_page[p]
    segments=[x for x in proof_units if x.get("page")==p]
    original=page["reading_ar"]
    check("".join(x["arabic_exact"] for x in segments)==original,
          f"B2007 p{p}: full sequential digital Arabic clause coverage is not byte-for-byte")
    check(all(x.get("english_review") and x.get("source_end_offset")>x.get("source_start_offset",-1) for x in segments),
          f"B2007 p{p}: English review or exact Arabic segment offsets missing")
    check(all(original[x["source_start_offset"]:x["source_end_offset"]]==x["arabic_exact"] for x in segments),
          f"B2007 p{p}: corrupt exact source offsets in proof registry")
    check(all(not x.get("manuscript_checked",False) for x in segments),
          f"B2007 p{p}: claimed independent MS verification without source")
check("When we consider them through their manifestations, forms and effects, we find some" in
      htmls.get("continuous-translation.html",("",None))[0],
      "Stage XXII p22 first-person source correction missing in continuous reader")
check("Baʿlabakk and Maʿdīkarib" in htmls.get("continuous-translation.html",("",None))[0],
      "Stage XXII compound-name examples missing from English reader")
check("within the scope of the first determination and first self-disclosure" in
      htmls.get("parallel-introduction.html",("",None))[0],
      "Stage XXII p19 interpretation missing in bilingual reader")


# Stage XXI: all former source-location flags are classified; this is NOT continuous translation proof.
parity21=json.loads((BOOK/"editorial/SOURCE_PARITY_RECONCILIATION_021.json").read_text(encoding="utf-8"))
check(parity21.get("total_selected_records")==560,"Stage XXI selected clause register mismatch")
check(parity21.get("flagged_records_classified")==37,"Stage XXI reconciliation incomplete")
check(parity21.get("unclassified_location_flags")==0,"Stage XXI unclassified selected quotations remain")
check(parity21.get("newly_revised_source_excerpt_count")==20,"Stage XXI source quotation corrections lost")
check(parity21.get("newly_revised_english_excerpt_count")==6,"Stage XXI English excerpt corrections lost")
check(len(parity21.get("resolutions",[]))==37,"Stage XXI item provenance register missing")
revised21=[r for r in rows if r.get("source_parity_resolution_type")=="literal-quotation-repaired-to-digitized-B2007"]
check(len(revised21)==20,"Stage XXI corrected source excerpts no longer exactly 20")
check(all(r.get("source_excerpt_before_reconciliation") and r.get("digital_control_url") for r in revised21),
      "Stage XXI previous Arabic excerpt or modern control link is lost")
check(lookup.get("CR002-023",{}).get("ar","").startswith("نظرنا"),
      "B2007 p22 first-person plural نظرنا correction lost")
check(len([r for r in rows if r.get("digital_page_span") and r.get("source_parity_resolution_type")=="continuous-quote-across-B2007-printed-page-boundary"])==4,
      "Stage XXI four continuous page-spanning quotations lost")



critical,_=htmls.get("critical-edition.html",("",None))
check('critical-reader.js' in critical,"Critical clause viewer script not loaded")
check('id="clauses"' in critical,"Critical clause holder missing")
check('id="page-select"' in critical and 'id="query"' in critical,"Critical filters not present")

manifest=json.loads((ROOT/"texts/manifest.json").read_text(encoding="utf-8"))
book=next((x for x in manifest.get("texts",[]) if x.get("id")=="farghani-muntaha-al-madarik"),None)
check(bool(book),"Central catalogue lost Farghānī")
if book:
    check(book.get("working_english_draft_printed_pages_count")==128,"Catalogue wrongly states English draft scope")
    check(book.get("critical_pass_source_checked_clause_count")==560,"Catalogue incorrectly claims count of source-reviewed excerpts")
    check(book.get("historical_print_bounded_comparisons")==15,"Catalogue historic printed-locus count differs")

print(json.dumps({
    "main_english_source_page_labels":len(pages),
    "english_translation_paragraphs":len(re.findall(r"<p(?:\s[^>]*)?>",ptext.group(1))) if ptext else 0,
    "selected_critical_loci":len(rows),
    "critical_source_page_span":"18–145",
    "full_independently_collated_pages":0,
    "medieval_manuscript_variants_verified":0,
    "files_checked":len(FILES),
    "warnings":WARNINGS,
    "failures":FAILED[:80]
},indent=2,ensure_ascii=False))
sys.exit(1 if FAILED else 0)
