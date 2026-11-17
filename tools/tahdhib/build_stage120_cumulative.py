#!/usr/bin/env python3
"""Stage120 source-first cumulative preservation; never alter original H translation."""
from pathlib import Path
from hashlib import sha256
import json,re
R=Path("texts/al-taftazani/tahdhib-al-mantiq/edition")
old=R/"batches/hawashi-all-sections-cumulative-stage119.md"
new=R/"batches/hawashi-all-sections-cumulative-stage120.md"
def digest(b):return sha256(b).hexdigest()
before=old.read_bytes()
prior=json.loads((R/"STAGE119_CUMULATIVE_FILE_INTEGRITY.json").read_text())
assert len(before)==prior["outputBytes"] and digest(before)==prior["outputSHA256"]
assert len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",before.decode()))==1090
items=[
("Stage120 photographed source audit","STAGE120_SOURCE_PHOTO_AUDIT.md"),
("Fifteen new Q258 source fragments","STAGE120_Q258_FIFTEEN_SOURCE_FRAGMENTS.json"),
("Eight Q294 source-direction signs","STAGE120_Q294_EIGHT_DIRECTIONAL_SYMBOLS.json"),
("Stage120 full cumulative handoff","HANDOFF_LATEST.md"),
]
append="\n\n---\n\n# Historical source edition · Stage120 separate apparatus\n"
files=[]
for label,name in items:
    data=(R/name).read_bytes()
    files.append({"name":name,"label":label,"bytes":len(data),"sha256":digest(data)})
    append+="\n\n---\n\n## "+label+"\n\n"
    if name.endswith(".json"):append+=chr(96)*3+"json\n"+data.decode()+"\n"+chr(96)*3+"\n"
    else:append+=data.decode()+"\n"
result=before+append.encode()
assert result.startswith(before)
assert len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",result.decode()))==1090
new.parent.mkdir(parents=True,exist_ok=True)
new.write_bytes(result)
manifest={
"stage":120,"date":"2026-11-12","grade":"working source-photographic excerpts, not full critical edition",
"originalHHistoricalNotes":1090,"originalEnglishFirstPass":1029,
"originalTableAffected":4,"modernReferenceOnly":57,
"priorStage":119,"priorCumulativeFile":str(old),
"priorBytes":len(before),"priorSHA256":digest(before),
"newFile":str(new),"newBytes":len(result),"newSHA256":digest(result),
"priorCorpusPreservedAsByteIdenticalPrefix":True,
"newQ258SelectedSourceFragments":15,"cumulativeQ258SelectedPhraseLoci":39,
"fullyCertifiedQ258Cells":0,
"newQ294FullDirectionalSourceSigns":8,
"cumulativeQ294IndividuallyReadGlyphs":27,
"remainingQ294NotIndividuallyRead":78,
"newWholePrintedHPagesCertified":0,"newIndependentManuscriptVariants":0,
"newHistoricallyStrongProofsFor46ModalMixes":0,
"appendices":files}
(R/"STAGE120_CUMULATIVE_FILE_INTEGRITY.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
print(json.dumps({"success":True,"whole_historical_H_records":1090,"new_bytes":len(result),"sha256":digest(result),"Q258":39,"Q294":27},ensure_ascii=False))
