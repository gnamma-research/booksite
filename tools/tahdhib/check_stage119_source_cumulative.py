#!/usr/bin/env python3
"""Evidence-graded Stage119 source and cumulative archive integrity checks."""
from pathlib import Path
import json,hashlib,re
P=Path("texts/al-taftazani/tahdhib-al-mantiq/edition")
rd=lambda name:(P/name).read_bytes()
load=lambda name:json.loads(rd(name))
sha=lambda b:hashlib.sha256(b).hexdigest()
q=load("STAGE119_Q309_COMPARATIVE_WORKING_READINGS.json")
assert q["counts"]=={"all":15,"instructions":3,"worked":12,"provisional":4,"photoVariant":2}
rows=q["rows"]
assert len(rows)==15 and len({x["id"] for x in rows})==15
assert [x["form"] for x in rows[:9]]==q["historicalOrder"]["connected"]
assert [x["form"] for x in rows[9:]]==q["historicalOrder"]["disjunctive"]
assert sum(x["grade"]=="printed-instruction" for x in rows)==3
assert all(x["ar"] and x["en"] for x in rows)
assert {x["id"] for x in rows if x["grade"]=="printed-instruction"}=={"K01","K06","K09"}
assert [x["id"] for x in rows if x["grade"]=="provisional-photo-assisted-derivative"]==["K08","D02","D04","D05"]
assert {x["id"] for x in rows if x["grade"]=="photo-working-variant"}=={"K02","D06"}
assert "أو كسرًا" in rows[-1]["ar"],"Photo variant lost"
assert "لا زوجًا ولا فردًا" in q["critical_variants"][-1]["derivative"]
assert q["scope"]["stage114CorpusRecordsChanged"]==0
assert q["scope"]["wholeHPrintedPagesNewlyCertified"]==0
assert q["scope"]["actualHistoricalModal46ProofsNew"]==0
original=rd("batches/hawashi-all-sections-cumulative-stage117.md")
full=rd("batches/hawashi-all-sections-cumulative-stage119.md")
manifest=load("STAGE119_CUMULATIVE_FILE_INTEGRITY.json")
assert original[:70]==full[:70] and full.startswith(original)
assert sha(original)==manifest["priorFullSHA256"]
assert sha(full)==manifest["outputSHA256"] and len(full)==manifest["outputBytes"]
assert len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",full.decode()))==1090
assert manifest["Q309WorkedDrafts"]==12 and manifest["Q309WitnessDiscrepancies"]==2
assert manifest["Q258SelectedPhrasesUnchanged"]==24
assert manifest["Q294ProvisionalFamiliesUnchanged"]==105
q294=load("STAGE119_Q294_NINETEEN_DIRECT_GLYPHS.json")
assert q294["counts"]["selectedDirectSymbolWorkingReadings"]==19
assert len(q294["entries"])==19
assert sorted(x["arabic_source_glyph"] for x in q294["entries"]).count("من")==14
assert sorted(x["arabic_source_glyph"] for x in q294["entries"]).count("ين")==5
assert manifest["newlyCertifiedWholeHPrintedPages"]==0 and manifest["newHistoricallyValidModal46Proofs"]==0
for item in manifest["appendices"]:
 b=Path(item["path"]).read_bytes()
 assert sha(b)==item["sha256"] and len(b)==item["bytes"],item["path"]
assert "STAGE119_Q309_PARALLEL_READER.html" in rd("index.html").decode()
reader=rd("STAGE119_Q309_PARALLEL_READER.html").decode()
assert "STAGE119_Q309_COMPARATIVE_WORKING_READINGS.json" in reader
assert "STAGE119_Q309_COMPARATIVE_WORKING_READINGS.md" in reader
assert "source-table-excerpts/print1405_Q309_table_excerpt.png" in reader
print(json.dumps({"pass":True,"historicalHNotesUnchanged":1090,
 "Q309WorkingExamples":12,"Q309PrintedInstructions":3,
 "Q309Provisional":4,"Q309WitnessDisagreements":2,
 "priorHistoricCorpusSHA256":sha(original),
 "fullCumulativeSHA256":sha(full),
 "fullCumulativeBytes":len(full),
 "newWholePhotoCertifiedHpages":0,
 "historicalModal46ProofsAdded":0},ensure_ascii=False,indent=2))
