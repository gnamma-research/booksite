#!/usr/bin/env python3
"""Tahdhib Stage121: preserve all prior full H translation and append new source evidence."""
from pathlib import Path
from hashlib import sha256
import json, re
P=Path("texts/al-taftazani/tahdhib-al-mantiq/edition")
prev=P/"batches/hawashi-all-sections-cumulative-stage120.md"
out=P/"batches/hawashi-all-sections-cumulative-stage121.md"
manifest=P/"STAGE121_CUMULATIVE_FILE_INTEGRITY.json"
def digest(data):return sha256(data).hexdigest()
priorManifest=json.loads((P/"STAGE120_CUMULATIVE_FILE_INTEGRITY.json").read_text())
old=prev.read_bytes()
assert len(old)==priorManifest["newBytes"] and digest(old)==priorManifest["newSHA256"],"Previous verified master altered"
assert len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",old.decode("utf-8")))==1090
appendFiles=[
 ("Ten final Q258 source readings and their grades","STAGE121_Q258_TEN_LAST_LOCATOR_READINGS.json"),
 ("Twenty additional Q294 directed source glyphs","STAGE121_Q294_TWENTY_SOURCE_DIRECTIONS.json"),
 ("Stage121 source-photo audit and next exact tasks","STAGE121_PHOTOGRAPHIC_CELL_AUDIT.md"),
 ("Stage121 cumulative handoff","HANDOFF_LATEST.md"),
]
addition="\n\n---\n\n# Stage121 independent scholarly apparatus (not authorial prose)\n"
files=[]
for label,name in appendFiles:
    b=(P/name).read_bytes()
    files.append({"title":label,"path":str(P/name),"bytes":len(b),"sha256":digest(b)})
    addition+="\n\n---\n\n## "+label+"\n\n"
    addition+=(chr(96)*3+"json\n"+b.decode("utf-8")+"\n"+chr(96)*3+"\n") if name.endswith(".json") else (b.decode("utf-8")+"\n")
new=old+addition.encode("utf-8")
assert new.startswith(old)
assert len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",new.decode("utf-8")))==1090
out.parent.mkdir(parents=True,exist_ok=True)
out.write_bytes(new)
j={
 "stage":121,"date":"2026-11-12","status":"working H later-gloss source-photo research; full critical edition not yet certified",
 "originalHistoricalHNotes":1090,"originalFirstPassEnglish":1029,"inheritedTableAffected":4,"inheritedModernReferences":57,
 "priorFullCumulative":str(prev),"priorFullBytes":len(old),"priorFullSHA256":digest(old),
 "currentFullCumulative":str(out),"currentBytes":len(new),"currentSHA256":digest(new),"priorBytePrefixUnchanged":True,
 "Q258PreviousSelected":39,"Q258NewSelected":10,"Q258AllSelected":49,
 "Q258CrossReferenceOnlyFullShortCellReadings":11,
 "Q258FullSubstantiveCellsStillOpen":38,"Q258NewPartialNegativeJudgments":3,
 "Q294PreviousIndividualGlyphs":27,"Q294NewDirections":20,"Q294IndividualGlyphsCumulative":47,
 "Q294RemainingIndividualGlyphs":58,"Q294NewUpperBroader":10,"Q294NewLowerBroader":10,
 "Q294AllQualifiedSourceSymbolsCertified":0,
 "newWholeHistoricalHPrintedPagesCertified":0,"newOriginalTOrYManuscriptVariants":0,"newHistoricalModal46StrongProofs":0,
 "appendices":files,
}
manifest.write_text(json.dumps(j,ensure_ascii=False,indent=2)+"\n")
print(json.dumps({"stage":121,"previousBytes":len(old),"newBytes":len(new),"sourceSHA256":digest(new),"Q258sourcePositions":49,"Q294glyphs":47,"historicalHnotesUnchanged":1090},ensure_ascii=False))
