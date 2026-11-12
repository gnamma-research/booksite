#!/usr/bin/env python3
"""Build Stage117 lossless full historical H corpus with 5 additional photo readings."""
from pathlib import Path
import hashlib,json,re
P=Path("texts/al-taftazani/tahdhib-al-mantiq/edition")
sh=lambda b:hashlib.sha256(b).hexdigest()
prev=P/"batches/hawashi-all-sections-cumulative-stage116.md"
out=P/"batches/hawashi-all-sections-cumulative-stage117.md"
prior=json.loads((P/"STAGE116_CUMULATIVE_FILE_INTEGRITY.json").read_text())
base=prev.read_bytes()
assert sh(base)==prior["outputSHA256"]
assert len(base)==prior["outputByteCount"]
assert len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",base.decode("utf-8")))==1090
add_paths=[
("Five additional Q309 historical Arabic-English examples",P/"STAGE117_Q309_FIVE_MORE_EXAMPLES.md"),
("Stage117 cumulative continuity handoff",P/"HANDOFF_LATEST.md")
]
append="\n\n---\n\n# Stage117 editorial appendices · five historical Q309 examples\n\n"
records=[]
for title,path in add_paths:
    b=path.read_bytes()
    records.append({"title":title,"file":str(path),"bytes":len(b),"sha256":sh(b)})
    append+="\n\n---\n\n## "+title+"\n\n"+b.decode("utf-8")+"\n"
combined=base+append.encode("utf-8")
assert combined.startswith(base)
assert len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",combined.decode("utf-8")))==1090
out.write_bytes(combined)
manifest={
 "stage":117,"date":"2026-11-12","historicalHRecordsPreserved":1090,
 "priorStage":116,"priorPath":str(prev),"priorBytes":len(base),
 "priorSHA256":sh(base),"fullOutputPath":str(out),"fullOutputBytes":len(combined),
 "fullOutputSHA256":sh(combined),"priorBytePrefixPreserved":True,
 "newWorkingQ309BilingualExamples":5,"previousWorkingQ309BilingualExamples":2,
 "cumulativeWorkingQ309Examples":7,"remainingQ309Examples":5,
 "untouchedOriginalFirstPassEnglishRecords":1029,"untouchedTableAffectedStatuses":4,
 "untouchedModernReferenceOnly":57,"newWholeSourcePagesCertified":0,
 "newManuscriptCriticalVariants":0,"newFullModal46HistoricalProofs":0,
 "appendices":records
}
(P/"STAGE117_CUMULATIVE_FILE_INTEGRITY.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
print("Stage117 generated",json.dumps({k:manifest[k] for k in ("historicalHRecordsPreserved","priorBytes","fullOutputBytes","fullOutputSHA256","cumulativeWorkingQ309Examples")}))
