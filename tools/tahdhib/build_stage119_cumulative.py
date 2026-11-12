#!/usr/bin/env python3
"""Tahdhib Stage119: lossless cumulative H translation plus all subsequent apparatus.

NEVER mutate historic 1,090-note first-pass translation or silently certify
full print/manuscript collation merely because photographed cells are available.
"""
from pathlib import Path
from hashlib import sha256
import json,re
P=Path("texts/al-taftazani/tahdhib-al-mantiq/edition")
basepath=P/"batches/hawashi-all-sections-cumulative-stage117.md"
out=P/"batches/hawashi-all-sections-cumulative-stage119.md"
manifest=P/"STAGE119_CUMULATIVE_FILE_INTEGRITY.json"
def digest(b):return sha256(b).hexdigest()
base=basepath.read_bytes()
assert len(base)==1181516 and digest(base)=="36a8fb25ba0fc1d7f1f29c8c612efb09bef9993531763582ef8f1327713d517a"
assert len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",base.decode("utf-8")))==1090
docs=[
 ("Stage118 full source-cell research status","STAGE118_SOURCE_CELL_RESEARCH.md"),
 ("Stage118 Q258 49-cell source phrase register","STAGE118_Q258_49_DEFINITION_SOURCE_PHRASES.json"),
 ("Stage118 Q294 105-cell relation family register","STAGE118_Q294_105_SOURCE_SYMBOL_FAMILIES.json"),
 ("Stage118 Q259 counting note","STAGE118_Q259_ARITHMETIC_AND_SCOPE.md"),
 ("Stage119 15-cell Q309 comparative source edition","STAGE119_Q309_COMPARATIVE_WORKING_READINGS.md"),
 ("Stage119 machine-readable historical Q309 comparisons","STAGE119_Q309_COMPARATIVE_WORKING_READINGS.json"),
 ("Stage119 full cumulative handoff","HANDOFF_LATEST.md"),
]
text="\n\n---\n\n# Editorial appendices · Tahdhīb Stage119\n\n"
records=[]
for label,name in docs:
 b=(P/name).read_bytes()
 records.append({"title":label,"path":str(P/name),"bytes":len(b),"sha256":digest(b)})
 text+="\n---\n\n## "+label+"\n\n"
 if name.endswith(".json"):
  text+="```json\n"+b.decode("utf-8")+"\n```\n"
 else:text+=b.decode("utf-8")+"\n"
combined=base+text.encode("utf-8")
assert combined.startswith(base)
assert len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",combined.decode("utf-8")))==1090
out.parent.mkdir(parents=True,exist_ok=True)
out.write_bytes(combined)
data={
 "stage":119,"date":"2026-11-12","grade":"working-source-edition; independent critical collation pending",
 "canonicalHistoricHSource":"Stage114 1090-record corpus, retained in Stage117 full prefix",
 "priorFullPath":str(basepath),"priorFullBytes":len(base),"priorFullSHA256":digest(base),
 "outputPath":str(out),"outputBytes":len(combined),"outputSHA256":digest(combined),
 "previousFullSourceBytePrefixPreserved":True,
 "historicalHNotesUnchanged":1090,"englishFirstPassFieldsUnchanged":1029,
 "tableAffectedNotesUnchanged":4,"modernReferenceOnlyUnchanged":57,
 "Q309Positions":15,"Q309WorkedDrafts":12,"Q309PrintedInstructions":3,
 "Q309Provisional":4,"Q309WitnessDiscrepancies":2,
 "Q258SelectedPhrasesUnchanged":24,"Q258FullyCertifiedCells":0,
 "Q294ProvisionalFamiliesUnchanged":105,"Q294DirectionCertifiedCells":0,
 "newlyCertifiedWholeHPrintedPages":0,"newAuthorialManuscriptVariants":0,
 "newHistoricallyValidModal46Proofs":0,"appendices":records
}
manifest.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
print(json.dumps({"pass":True,"historicalNotes":1090,"fullBytes":len(combined),"fullSHA256":digest(combined),"Q309workingDrafts":12},ensure_ascii=False))
