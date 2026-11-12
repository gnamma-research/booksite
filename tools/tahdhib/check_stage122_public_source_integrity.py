#!/usr/bin/env python3
"""Stage122: verify source-integrity PUBLIC metadata and reader correction overlay.
Does not distribute archived digital Arabic pages or certify translation quality.
"""
from pathlib import Path
from hashlib import sha256
import json,re
P=Path("texts/al-taftazani/tahdhib-al-mantiq/edition")
def load(n):return json.loads((P/n).read_text())
md=(P/"STAGE122_ARABIC_SOURCE_RECOVERY_AND_CRITICAL_STATUS.md").read_text()
reader=(P/"STAGE121_SOURCE_READER.html").read_text()
main=(P/"index.html").read_text()
handoff=(P/"HANDOFF_LATEST.md").read_text()
status=(P/"STAGE122_SOURCE_RECOVERY_STATUS.html").read_text()
err=load("STAGE122_Q258_SOURCE_PHOTO_ERRATA.json")
assert err["stage"]==122 and len(err["corrections"])==2
d={x["cell"]:x for x in err["corrections"]}
assert set(d)=={"Q258-R01-C01","Q258-R01-C07"}
assert d["Q258-R01-C01"]["priorArabic"]=="غير صحيح"
assert d["Q258-R01-C01"]["correctedArabic"]=="من البسائط الصحيحة المعتبرة"
assert d["Q258-R01-C07"]["correctedArabic"]=="غير صحيح للخصوص"
assert err["sourceStatus"]["priorStageHistoricalRecordsModified"]==0
assert "STAGE122_Q258_SOURCE_PHOTO_ERRATA.json" in reader
assert "correction.correctedArabic" in reader and "correction.correctedEnglish" in reader
assert "STAGE122_SOURCE_RECOVERY_STATUS.html" in main
assert all(s in status for s in ("1,090 / 1,090","274 / 274","1,079 / 1,090"))
assert "Eleven" in status or "eleven" in status or "11" in status
assert all(s in md for s in ("1,090","1,079","274","24","57"))
assert "1,079" in status and "11" in status
assert all(s in handoff for s in ("Stage114","1,090","tables"))
assert "rights-sensitive" in handoff and "private" in handoff
assert "NOT" in md and "manuscript" in md
assert "HWN-DALALA-084" in md and "HWN-048" in md
six=(P/"STAGE122_SIX_EXPANDED_HISTORICAL_NOTES.md").read_text()
for note in ("HWN-DALALA-067","HWN-CONVERSION-008","HWN-CONVERSION-021","HWN-CONTRAPOSITION-019","HWN-MAFAHIM-011","HWN-INTRO-081"):
    assert note in six
assert "source-grade" in six.lower() or "source" in six.lower()
two=(P/"STAGE122_TWO_FURTHER_SIGNIFICATION_GLOSSES.md").read_text()
for note in ("HWN-DALALA-039","HWN-DALALA-081"):
    assert note in two
assert "247b2e6e8d5fb67c3dd48df5cd3fcf12df7aecae7c76aa874fe0e4547e9f29d2" in two
assert "d430197f8cd11509e163512de8a30938cfa8f4bf73e74b49b6d4d98bb2d589ca" in two
sixSource=load("STAGE122_SIX_NOTES_PROVENANCE.json")
assert len(sixSource["notes"])==6 and sixSource["counts"]["matchedOldSourceSHA256"]==6
assert len({x["id"] for x in sixSource["notes"]})==6
gaps=load("STAGE122_ELEVEN_SOURCE_HASH_GAP_LEDGER.json")
assert gaps["notesTotal"]==1090 and gaps["matchedHistoricalSHA256"]==1079
assert gaps["differingUnitHashes"]==11 and len(gaps["unitSHA256Comparisons"])==11
assert gaps["onePageUnits"]==6 and gaps["multiPageUnits"]==5
assert all(x["wordCountMatches"] for x in gaps["unitSHA256Comparisons"])
assert "STAGE122_TWO_FURTHER_SIGNIFICATION_GLOSSES.md" in main

# inherited full H master SHA is verified against prior published manifest
manifest=load("STAGE121_CUMULATIVE_FILE_INTEGRITY.json")
src=(P/"batches/hawashi-all-sections-cumulative-stage121.md").read_bytes()
assert sha256(src).hexdigest()==manifest["currentSHA256"]
assert len(src)==manifest["currentBytes"]
assert len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",src.decode("utf8")))==1090
assert manifest["inheritedTableAffected"]==4
assert manifest["inheritedModernReferences"]==57
assert not (P/"STAGE122_FULL_ARABIC_SOURCE.json").exists()
print(json.dumps({"pass":True,"historicNotes":1090,"publicPhotoCorrections":2,
"archivedDigitalPagesInPublicRelease":False,
"fullHCorpusSHA256":sha256(src).hexdigest(),
"exactDigitalUnitSourceHashes":1079,
"unresolvedSourceHashes":11,
"newWholePagesManuscriptCertified":0},indent=2))
