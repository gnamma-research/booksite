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
import sys

ROOT = Path(__file__).resolve().parents[2]
BOOK = ROOT / "texts/al-farghani/muntaha-al-madarik"
FILES = [
    "continuous-translation.html",
    "full-reader.css", "full-reader.js",
    "critical-edition.html", "critical-reader.js",
    "reader.css", "reader.js", "index.html",
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
check(len(rows)==559,f"Critical dataset count changed unexpectedly: {len(rows)} !=559")
check(len({r.get('id') for r in rows})==len(rows),"Duplicate selected critical clause ID")
check(set(r.get("page") for r in rows)==set(range(18,146)),"Some Beirut printed page labels lack any selected critical clause")
check(sum(r.get("page",0)<=60 for r in rows)==283,"Edited-digitized clause count changed from 283")
check(sum(r.get("page",0)>=61 for r in rows)==276,"Derivative-grade clause count changed from 276")
check(all(r.get("ar") and r.get("en") and r.get("source_url") for r in rows),"Arabic, English or source URL missing from critical clause")

critical,_=htmls.get("critical-edition.html",("",None))
check('critical-reader.js' in critical,"Critical clause viewer script not loaded")
check('id="clauses"' in critical,"Critical clause holder missing")
check('id="page-select"' in critical and 'id="query"' in critical,"Critical filters not present")

manifest=json.loads((ROOT/"texts/manifest.json").read_text(encoding="utf-8"))
book=next((x for x in manifest.get("texts",[]) if x.get("id")=="farghani-muntaha-al-madarik"),None)
check(bool(book),"Central catalogue lost Farghānī")
if book:
    check(book.get("working_english_draft_printed_pages_count")==128,"Catalogue wrongly states English draft scope")
    check(book.get("critical_pass_source_checked_clause_count")==559,"Catalogue incorrectly claims count of source-reviewed excerpts")
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
