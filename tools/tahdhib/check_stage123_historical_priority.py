#!/usr/bin/env python3
"""Tahdhib Stage123: no-retranslation/source-errata and honest certification checks."""
from pathlib import Path
import json, hashlib, re
P=Path("texts/al-taftazani/tahdhib-al-mantiq/edition")
read=lambda name:(P/name).read_text(encoding="utf-8")
load=lambda name:json.loads(read(name))
sha=lambda value:hashlib.sha256(value).hexdigest()
handoff=read("HANDOFF_LATEST.md")
audit=read("STAGE123_THIRTEEN_NOTE_ENGLISH_AUDIT.md")
for word in ("Stage114","1,090","tables","thirteen","HWN-112","HWN-INTRO-018","46"):
    assert word.lower() in (handoff+"\n"+audit).lower(),word
queue=['HWN-INTRO-018','HWN-112','HWN-CONVERSION-038','HWN-018',
       'HWN-MAFAHIM-069','HWN-DALALA-045','HWN-PROPOSITIONS-103',
       'HWN-CONTRAPOSITION-002','HWN-CONTRAPOSITION-007',
       'HWN-CONVERSION-002','HWN-PROPOSITIONS-083',
       'HWN-CONVERSION-025','HWN-CONVERSION-027']
assert len(queue)==13
assert all(name in audit for name in queue)
err=load("STAGE123_Q258_R02C01_PHOTO_ERRATUM.json")
assert len(err["corrections"])==1
a=err["corrections"][0]
assert a["cell"]=="Q258-R02-C01"
assert a["priorArabic"]=="غير صحيح" and a["correctedArabic"]=="انظر"
assert err["priorCrossReferenceOnlyCount"]==11
assert err["minimumSourceCrossReferenceCountAfterCorrection"]==12
assert err["recountPending"] is True
assert err["historicalCorpusRecordsMutated"]==0
reader=read("STAGE121_SOURCE_READER.html")
assert "STAGE123_Q258_R02C01_PHOTO_ERRATUM.json" in reader
assert "STAGE122_Q258_SOURCE_PHOTO_ERRATA.json" in reader
assert "[...errata.corrections,...stage123.corrections]" in reader
index=read("index.html")
assert "STAGE123_THIRTEEN_NOTE_ENGLISH_AUDIT.md" in index
assert "STAGE123_Q258_R02C01_PHOTO_ERRATUM.json" in index
assert "id=\"passages\"" in index
assert "STAGE123_ELEVEN_SOURCE_SHA_FORENSIC_AUDIT.md" in handoff
assert "HANDOFF_STAGE122.md" in handoff
assert (P/"HANDOFF_STAGE122.md").is_file()
# Confirm historical full source is unchanged at its current stored grade.
manifest=load("STAGE121_CUMULATIVE_FILE_INTEGRITY.json")
source=(P/"batches/hawashi-all-sections-cumulative-stage121.md").read_bytes()
assert sha(source)==manifest["currentSHA256"]
assert len(source)==manifest["currentBytes"]
assert len(re.findall(rb"(?m)^## HWN-[A-Z0-9-]+",source))==1090
assert manifest["inheritedTableAffected"]==4 and manifest["inheritedModernReferences"]==57
print(json.dumps({"passed":True,"historicalHNotesIntact":1090,
"EnglishPriorityQueueReviewed":13,"sourcePhotoCorrectionsNew":1,
"sourceHashDifferencesUnresolved":11,
"newWholePagesCertified":0,"newManuscriptVariantsCertified":0,
"newModal46StrongProofsCertified":0},indent=2))
