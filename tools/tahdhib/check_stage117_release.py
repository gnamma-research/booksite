#!/usr/bin/env python3
"""Stage117 limited source-graded Q309 publication QA; no false text certification."""
from pathlib import Path
import re,json,hashlib
P=Path("texts/al-taftazani/tahdhib-al-mantiq/edition")
def rd(n):return (P/n).read_bytes()
def sha(b):return hashlib.sha256(b).hexdigest()
p=json.loads(rd("STAGE116_CUMULATIVE_FILE_INTEGRITY.json"))
j=json.loads(rd("STAGE117_CUMULATIVE_FILE_INTEGRITY.json"))
source=rd("batches/hawashi-all-sections-cumulative-stage116.md")
full=rd("batches/hawashi-all-sections-cumulative-stage117.md")
assert sha(source)==j["priorSHA256"]==p["outputSHA256"]
assert len(source)==j["priorBytes"]==p["outputByteCount"]
assert full.startswith(source)
assert sha(full)==j["fullOutputSHA256"]
assert len(full)==j["fullOutputBytes"]
assert len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",full.decode()))==1090
assert j["priorBytePrefixPreserved"] is True
assert (j["previousWorkingQ309BilingualExamples"],j["newWorkingQ309BilingualExamples"],j["cumulativeWorkingQ309Examples"],j["remainingQ309Examples"])==(2,5,7,5)
assert j["newWholeSourcePagesCertified"]==0
assert j["newManuscriptCriticalVariants"]==0
assert j["newFullModal46HistoricalProofs"]==0
assert not (P/"source-table-excerpts/excerpts").exists()
memo=rd("STAGE117_Q309_FIVE_MORE_EXAMPLES.md").decode()
assert memo.count("| Connected ")==4
assert memo.count("| Disjunctive ")==1
assert "Connected 8/9" in memo and "Disjunctive 6/6" in memo
assert "STAGE117_Q309_FIVE_MORE_EXAMPLES.md" in rd("HANDOFF_LATEST.md").decode()
for item in j["appendices"]:
   b=Path(item["file"]).read_bytes()
   assert sha(b)==item["sha256"] and len(b)==item["bytes"]
print("PASS: unchanged Stage116 bytes, all 1090 original notes, 5 added Q309 working examples, 7/12 total, source grades preserved")
