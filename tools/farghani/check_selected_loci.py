#!/usr/bin/env python3
"""Audit 559 selected Arabic excerpts against complete 128 B2007-digitized pages.
Find exact matches on nearby pages; NEVER auto-migrate the citation from a
derivative transcription without preserving its previous provenance.
"""
from pathlib import Path
from collections import defaultdict, Counter
import json,re
ROOT=Path(__file__).resolve().parents[2]
BOOK=ROOT/"texts/al-farghani/muntaha-al-madarik"
EDIT=BOOK/"editorial"
data=json.loads((BOOK/"data/intro-arabic-b2007-digital.json").read_text())
source_audit=json.loads((EDIT/"INTRO_SOURCE_AUDIT_019.json").read_text())
VOWELS=re.compile(r"[\u064b-\u065f\u0670\u0640]")
NONAR=re.compile(r"[^ء-ي0-9]+")
def norm(s):
  s=VOWELS.sub("",str(s)).translate(str.maketrans({"أ":"ا","إ":"ا","آ":"ا","ى":"ي","ؤ":"و","ئ":"ي","ة":"ه"}))
  return NONAR.sub(" ",s).strip()
pages={x["page"]:norm(x["raw_ar"]) for x in data["pages"]}
records=[]
for f in sorted((BOOK/"data").glob("critical-pass-*.js")):
  txt=f.read_text()
  match=re.search(r"window\.\w+\s*=\s*(\{[\s\S]*\})\s*;\s*$",txt)
  if not match:raise ValueError(f"Unreadable critical JS {f.name}")
  records+=json.loads(match.group(1)).get("records",[])
if len(records)!=559:raise AssertionError(len(records))
unmatched=[]
for rec in records:
  page=rec["page"];frag=norm(rec["ar"])
  if frag in pages[page]:continue
  exact=[p for p,t in pages.items() if frag in t]
  nearby=[p for p in exact if abs(p-page)<=2]
  if len(exact)==1 and nearby:
    category="unique-exact-neighbor-page-candidate"
  elif exact:
    category="exact-elsewhere-ambiguous-or-distant"
  else:
    category="no-full-excerpt-exact-digital-match"
  words=frag.split()
  def matchfraction(p):
    w=set(pages[p].split())
    return round(sum(x in w for x in words)/max(1,len(words)),3)
  adjacent_overlap={str(p):matchfraction(p) for p in range(max(18,page-2),min(145,page+2)+1)}
  unchanged_source=rec["ar"]
  unmatched.append({
    "id":rec["id"],"record_page":page,"source_grade":rec.get("grade"),
    "arabic_fragment":unchanged_source,
    "exact_match_pages":exact,
    "category":category,
    "adjacent_page_word_membership":adjacent_overlap,
    "recommended_action":"Human confirm B2007 page boundary and context; do not auto-overwrite the previous citation."
  })
counts=Counter(x["category"] for x in unmatched)
out={
 "schema":"gnamma-farghani-intro-selected-source-parity-v1",
 "record_count":len(records),"normalized_exact_source_match_count":len(records)-len(unmatched),
 "flagged_records":len(unmatched),
 "categories":dict(counts),
 "auto_relocated_records":0,
 "scope":"Online B2007 edited digitized Arabic only; historical 1876 print and MS remain separate",
 "instructions":"An exact match in an adjacent B2007 source page is evidence of possible page misassignment, but requires editorial confirmation. The old derivative-source grade must be preserved.",
 "loci":unmatched
}
(EDIT/"SELECTED_EXCERPT_SOURCE_PARITY_019.json").write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n")
lines=["# Farghānī · Source-page integrity of 559 selected bilingual excerpts","",
  f"**Digital copy-text check:** {len(records)-len(unmatched)} exact normalized excerpt matches, {len(unmatched)} flagged. This is NOT linguistic verification of translation accuracy.",
  "","**No page labels were silently reassigned.** A unique neighboring-page match is evidence for editorial review, not manuscript collating.",
  "","| Clause | Prior B2007 page | Candidate exact digital pages | Category | Excerpt to inspect |","|---|---:|---|---|---|"]
for x in unmatched:
  snippet=" ".join(x["arabic_fragment"].split()[:18]).replace("|",";")
  pages_s=", ".join(str(p) for p in x["exact_match_pages"]) or "No exact match"
  lines.append(f"| {x['id']} | {x['record_page']} | {pages_s} | {x['category']} | {snippet} |")
lines+=["","## Priority review order","",
 "1. Unique neighboring-page exact-match candidates: compare printed page boundaries and migrate the citation only after an editorial check retaining the old source identifier.",
 "2. Cases with very low same-page word membership: determine whether the derivative source assigned the wrong printed page, paraphrased a span, or contains an independent transcription discrepancy.",
 "3. Partial spelling, punctuation, and formulaic disagreements: collate against the photographed source rather than silently normalizing.",
 "","## Method","",
 "Strip Arabic vocalization, normalize common alif/ya/hamza variants and punctuation, compare the full selected excerpt against the complete modern online B2007 page text. False negatives can arise from split lines and editorial paraphrase; false positives from repeated formulae.",
 "","**Not inspected:** physical 2007 paper at all loci or any independent medieval manuscript. No main poem commentary is included.",
 ]
(EDIT/"SELECTED_EXCERPT_SOURCE_PARITY_019.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
print(json.dumps({"exact":out["normalized_exact_source_match_count"],"flagged":out["flagged_records"],"categories":out["categories"],"unique_neighbor":[{k:v for k,v in x.items() if k in ('id','record_page','exact_match_pages')} for x in unmatched if x["category"]=="unique-exact-neighbor-page-candidate"]},ensure_ascii=False,indent=2))
