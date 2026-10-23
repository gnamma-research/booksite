#!/usr/bin/env python3
"""Test sourced dictionary proposals, orthographic warnings and non-mutation.

No external NLP model, text downloads, private Reading Desk data or browser
state are required. These are source-link integrity tests, not gold accuracy.
"""
from __future__ import annotations
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
src = ROOT / "daruri/build/propose_dictionary_morphology.py"
spec = importlib.util.spec_from_file_location("proposals_test", src)
assert spec is not None and spec.loader is not None
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

dictionary = {
 "terms": {
   "qiyās": {
     "lemma": "قياس", "root": "قيس", "aliasesAr": [],
     "sources": ["early","later"],
     "attested": [{"section": "11", "arabic": "القياس ..."}]
   },
   "ʿilla": {
     "lemma": "علة", "root": "علل", "aliasesAr": ["علل"],
     "sources": ["later"], "attested": []
   }
 },
 "sources": {
   "early": {"author":"Earlier lexicographer", "work":"Classical source",
             "entry":"قياس", "url":"https://example.org/early","chronology":"E"},
   "later": {"author":"Later lexicographer", "work":"Comparative lexicon",
             "entry":"القياس","url":"https://example.org/later","chronology":"L"}
 }
}
mapping = module.sourced_lexicon(dictionary)
assert "القياس" in mapping
assert "بالعلة" in mapping
assert len(mapping["القياس"]) == 1
assert len(mapping["القياس"][0]["sources"]) == 2
assert mapping["القياس"][0]["chronology"] == {"E": 1, "L": 1}
text = "القياس إن بعض العلة"
index = {
 "schema":"gnamma-morph-v1", "work":"daruri",
 "contextual":True, "processedIds":["passage:11:0"],
 "records":[{"id":"passage:11:0","a":[
  [0,"القياس","قِياس","","noun","contextual-bert","قِياس",{"gloss":"analogy","diac":"القياس"}],
  [1,"إن","أَنَّ","","conj_sub","contextual-bert","أَنَّ",{"diac":"أَنَّ"}],
  [2,"بعض","عَضّ","عضض","noun","contextual-bert","عَضّ",{"prc1":"bi_prep","gloss":"biting"}],
  [3,"العلة","عِلَّة","علل","noun","contextual-bert","عِلَّة",{"gloss":"illness"}]
 ]}]
}
before = json.dumps(index, ensure_ascii=False, sort_keys=True)
rows, summary = module.propose(index, {"passage:11:0":text}, mapping)
assert json.dumps(index, ensure_ascii=False, sort_keys=True) == before
assert len(rows) == 4, rows
by_surface = {row["surface"]: row for row in rows}
qiyas = by_surface["القياس"]
assert "technical-lexicon-has-root-model-omits" in qiyas["review_flags"]
assert qiyas["suggested_roots_for_review"] == "قيس"
assert "author-attested-term-in-section" in qiyas["review_flags"]
assert qiyas["reviewed_root"] == "" and qiyas["reviewer"] == ""
evidence = json.loads(qiyas["source_evidence"])
assert {x["chronology"] for x in evidence} == {"E","L"}
assert "written-hamza-versus-model-diacritization" in by_surface["إن"]["review_flags"]
assert "suspect-partitive-clitic-analysis" in by_surface["بعض"]["review_flags"]
assert by_surface["العلة"]["review_flags"] == "technical-sense-evidence-available"
assert summary["candidate_occurrences"] == 4
assert summary["missing_model_analysis"] == 0
assert "بعض" not in mapping, "General Arabic error must not be falsely labelled sourced in a specialist dictionary"
invalid=json.loads(json.dumps(index,ensure_ascii=False))
invalid["records"][0]["a"][0][1]="المقايسة"
try:
 module.propose(invalid, {"passage:11:0":text}, mapping)
except ValueError as e:
 assert "Source text/token disagreement" in str(e)
else:
 raise AssertionError("Source/token drift was not rejected")
print("PASS: terminology sources and chronology, review-only roots, hamza and clitic guards, immutable candidates")
