#!/usr/bin/env python3
"""Regression for explicitly approved, occurrence-anchored morphology repairs."""
from __future__ import annotations
import importlib.util
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
path=ROOT/"daruri/build/apply_reviewed_morphology.py"
spec=importlib.util.spec_from_file_location("reviewed_morphology",path)
assert spec and spec.loader
import sys
sys.path.insert(0,str(path.parent))
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

raw={"schema":"gnamma-morph-v1","work":"daruri","contextual":True,
 "annotator":"synthetic MSA model","records":[{"id":"passage:11:0","a":[
  [0,"القياس","قِياس","","noun","contextual-bert","قِياس",{"rank":1,"gloss":"analogy"}],
  [0,"القياس","قِياس","","noun","contextual-alternative","قِياس",{"rank":2,"cas":"g"}],
  [1,"إن","أَنَّ","","conj_sub","contextual-bert","أَنَّ",{"rank":1,"diac":"أَنَّ"}]
 ]}]}
before=json.dumps(raw,ensure_ascii=False,sort_keys=True)
form={"work":"daruri","passage_id":"passage:11:0","token_position":"0",
 "surface":"القياس","reviewed_lemma":"قِياس","reviewed_root":"قيس",
 "reviewed_pos":"noun","reviewed_lexical_id":"قِياس",
 "judgement":"corrected","reviewer":"qualified-reviewer-test",
 "editor":"independent-editor-test","editor_approved":"yes",
 "review_notes":"Root reviewed against cited source evidence."}
reviewed,metadata=mod.apply(raw,{"passage:11:0":"القياس إن"},[form])
assert metadata["reviewed"]==1 and metadata["publicReleasePermitted"] is False
assert reviewed["classicalArabicValidated"] is False
assert reviewed["reviewedOccurrenceCount"]==1
assert json.dumps(raw,ensure_ascii=False,sort_keys=True)==before,"Input must remain unmodified"
analyses=reviewed["records"][0]["a"]
approved=[a for a in analyses if a[0]==0 and a[5]=="reviewed"]
assert len(approved)==1 and approved[0][3]=="قيس"
assert len([a for a in analyses if a[0]==0 and a[5]=="contextual-alternative"])==2
assert len([a for a in analyses if a[0]==1 and a[5]=="contextual-bert"])==1
unsigned,counts=mod.apply(raw,{"passage:11:0":"القياس إن"},[{**form,"editor_approved":""}])
assert counts["reviewed"]==0 and unsigned["records"]==raw["records"]
for bad,needle in [
 ({**form,"surface":"السنّة"},"source wording"),
 ({**form,"token_position":"5"},"outside source"),
 ({**form,"editor":""},"editorial sign-off"),
]:
 try:
  mod.apply(raw,{"passage:11:0":"القياس إن"},[bad])
 except ValueError as e:
  assert needle in str(e), str(e)
 else:
  raise AssertionError("Unsafe review accepted")
try:
 mod.apply(raw,{"passage:11:0":"القياس إن"},[form,form])
except ValueError as e:
 assert "Multiple different reviews" in str(e)
else:
 raise AssertionError("Duplicate approvals accepted")
print("PASS: approved source-token repairs preserve original model suggestions and never publish implicitly")
