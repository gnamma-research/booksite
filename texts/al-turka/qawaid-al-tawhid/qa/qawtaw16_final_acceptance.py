#!/usr/bin/env python3
"""Qawtaw16 final source-scoped publication acceptance (not specialist certification).

Run after the Qawtaw5 ledger regeneration and five-PDF build.
Does not emend the historical text, fabricate missing folios or equate
model-assisted comparison with independent human validation.
"""
from __future__ import annotations
import collections
import datetime
import hashlib
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))
def assigned(path):
    s = (ROOT / path).read_text(encoding="utf-8")
    m = re.search(r"window\.GNAMMA_[A-Z0-9_]+\s*=\s*", s)
    assert m, "Expected canonical window assignment: " + path
    value, _ = json.JSONDecoder().raw_decode(s[m.end():].lstrip())
    return value
def sha(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()
def need(ok, why):
    if not ok: raise AssertionError(why)

matn = assigned("data/units.js")["units"]
corpus = load("data/commentary-corpus.json")["units"]
units = matn + corpus
ledger = load("qa/clause-ledger.json")
summary = ledger["summary"]
review = load("qa/clause-review-adjudications-2026-11-09.json")
fourteen = load("qa/qawtaw10-final-status.json")
source_access = load("qa/qawtaw14-source-access.json")
terms = assigned("data/linked-lexicon.js")["terms"]
references = assigned("data/primary-reference-register.js")["items"]
manifest = load("pdf/manifest.json")
ids = [u["id"] for u in units]
need(len(matn) == 61 and len(corpus) == 110 and len(units) == 171, "Expected 61+110=171 units")
need(len(ids) == len(set(ids)), "Duplicate canonical unit IDs")
need([u["id"] for u in matn] == [f"QT-{i:03d}" for i in range(1, 62)], "Missing/out-of-order original lemma")
need([u["id"] for u in corpus[:40]] == [f"SH-INTRO-{i:03d}" for i in range(1,41)], "Introduction sequence changed")
need(len([x for x in corpus if x.get("part")=="introduction"]) == 40, "Introduction count drift")
need(len([x for x in corpus if x.get("part")=="main"]) == 64, "Main commentary count drift")
need(len([x for x in corpus if x.get("part")=="conclusion"]) == 6, "Conclusion count drift")
need(len([x for x in corpus if x.get("precedingMatn")]) == 4, "Additional ancestral quotations drift")
need({x["matnId"] for x in corpus if x.get("matnId")} == {x["id"] for x in matn}, "Unlinked matn")
need(len(terms)==82 and len(references)==18, "Dictionary or source-card count drift")
bad = []
placeholder = re.compile(r"(?i)\b(?:TODO|TBD|placeholder|lorem ipsum|translation forthcoming|awaiting translation)\b")
for u in units:
    for k in ("arabic","english"):
        s = u.get(k,"")
        if not isinstance(s,str) or not s.strip() or placeholder.search(s) or "\ufffd" in s:
            bad.append(u["id"]+" "+k)
    if u.get("matnId") and u["matnId"] not in ids: bad.append(u["id"]+" broken matnId")
need(not bad, "Empty/placeholding/broken units: "+repr(bad[:20]))

need(summary["totalBilingualUnits"] == 171, "Ledger unit count drift")
need(summary["totalArabicPunctuationClauses"] == 5520, "Ledger segment count drift")
need(summary["NOTIndividuallyComparedArabicClauses"] == 0, "Uncompared source segments")
need(summary["independentManuscriptsCollated"] == 0, "Falsely claims independent manuscript work")
need(summary["independentHumanCertification"] is False, "False human certification")
need(len(ledger["units"]) == 171, "Ledger inventory lost units")
ledger_by_id = {u["id"]:u for u in ledger["units"]}
need(set(ledger_by_id) == set(ids), "Ledger/corpus IDs diverge")
status_counts=collections.Counter()
status_units=set()
for u in units:
    ld=ledger_by_id[u["id"]]
    need(ld["arabicSha256"] == sha(u["arabic"]), "Ledger Arabic hash mismatch "+u["id"])
    need(ld["englishSha256"] == sha(u["english"]), "Ledger English hash mismatch "+u["id"])
    for c in ld["arabicClauses"]:
        status = c["review"]["status"]
        status_counts[status]+=1
        if status in ("unresolved-reading","corrected-with-source-crux"):
            status_units.add(u["id"])
need(sum(status_counts.values()) == 5520, "Segment-status histogram drift")
need(dict(status_counts) == summary["statuses"], "Segment-status counts diverged")
need(sum(status_counts[k] for k in ("unresolved-reading","corrected-with-source-crux")) == 218,"Unresolved historical review flags count drift")
need(len(status_units) == 47, "Flagged unit inventory drift")
need(summary["unresolvedOrSourceCruxGroups"] == 57, "Review-group tally drift")
need("बीमारी" not in json.dumps(review,ensure_ascii=False), "Uncorrected stray Hindi editorial note")
need("बीमारी" not in json.dumps(ledger,ensure_ascii=False), "Uncorrected stray Hindi ledger note")

need(fourteen["totalCases"]==14 and fourteen["semanticOrReadingResolved"]==12, "Fourteen-case status drift")
need(fourteen["unresolvedNegative"]==1 and fourteen["unrecoveredAncestralLacuna"]==1,"Two named historical cruxes misreported")
need(fourteen["independentManuscriptsCollated"]==0,"Invented early independent manuscript")
need(source_access["status"]["newHistoricalTargetPagesInspected"]==0,"Source-access register conflicts with actual evidence")
sh=next(x for x in corpus if x["id"]=="SH-002")
qt=next(x for x in matn if x["id"]=="QT-059")
need("القطع ببطلان مسألة التوحيد" in sh["arabic"],"SH-002 Arabic negation emended without witness")
need("invalid" in sh["english"].lower(), "SH-002 English lost literal disputed negative")
need("وما قيل" in qt["arabic"] and "وأمّا الثاني" in qt["arabic"], "QT-059 extant boundary lost")
need(any("lacuna" in str(x).lower() for x in qt.get("notes",[])),"QT-059 reported omission not documented")
sh58=next(x for x in corpus if x["id"]=="SH-058")
need("sleep and wakefulness" in sh58["english"], "H2014 preferred SH-058 wakefulness reading lost")
need("السهو" in sh58["arabic"], "SH-058 A-source sahw overwritten")
need(any("H2014" in str(x) and "السهر" in str(x) for x in sh58.get("notes",[])), "SH-058 modern printed sahr variant not attributed")

need(len(manifest["files"])==5,"Wrong PDF count")
need(manifest["revision"]=="2026-11-12-qawtaw16-source-scoped-reading","PDF manifest revision not updated")
from pypdf import PdfReader
pdfs=[]
for row in manifest["files"]:
    path=ROOT/"pdf"/row["filename"]
    need(path.exists(),"PDF missing: "+row["filename"])
    bs=path.read_bytes()
    need(bs.startswith(b"%PDF-") and len(bs)==row["size_bytes"],"PDF signature/size mismatch: "+row["filename"])
    need(hashlib.sha256(bs).hexdigest()==row["sha256"],"PDF checksum mismatch: "+row["filename"])
    pdf=PdfReader(path)
    need(len(pdf.pages)==row["pages"] and len(pdf.pages)>90,"PDF page count mismatch: "+row["filename"])
    need((pdf.pages[1].extract_text() or "").strip(),"PDF has no searchable text: "+row["filename"])
    ann=sum(len(p.get("/Annots",[])) for p in pdf.pages)
    if row["group"] in ("study","reference"): need(ann>20,"PDF internal links missing: "+row["filename"])
    pdfs.append({"filename":row["filename"],"pages":row["pages"],"bytes":len(bs),"sha256":row["sha256"],"linkAnnotations":ann})

report={
  "schema":"gnamma-qawtaw16-final-source-scoped-acceptance-v1",
  "date":"2026-11-12",
  "passed":True,
  "claim":"Release-ready scholarly working and reading edition of all consulted extant source material; NOT a completed independently manuscript-collated critical edition.",
  "sourceScope":{
    "originalMatnUnits":61,"commentaryIntroUnits":40,"commentaryMainUnits":64,
    "commentaryConcludingUnits":6,"totalBilingualUnits":171,
    "comparedArabicPunctuationSegments":5520,"sourceManuscriptsIndependentlyCollated":0,
    "independentlyHumanCertified":False},
  "legacyApparatusInventory":{
    "sourceFlaggedSegmentCount":218,"sourceFlaggedGroups":57,
    "sourceFlaggedUnits":47,
    "status":"Original Qawtaw5 flag inventory preserved for consultation; it must not be conflated with the fourteen separately adjudicated cases. Some legacy flags were subsequently interpreted through later printed comparisons."},
  "selectedFourteenCases":{"workingReadingSettled":12,"unresolvedHistoricalNegative":1,"reportedLostAncestralText":1},
  "outstandingHistoricalQuestions":{
    "SH-002":"Retain transmitted ببطالن. Conjectural بحقيّة is not attested at the disputed location by an inspected independent early witness.",
    "QT-059":"Existing source paragraph translated. Additional original authorial words reported missing cannot be supplied from grandson commentary.",
    "imprint1315versus1316":"Bibliographic identities of historic prints have conflicting catalogue reports; no title pages or colophons of those objects inspected in Qawtaw16."},
  "releaseTests":{
    "noMissingOrPlaceholderUnits":True,"canonicalIdsAndLinksComplete":True,
    "allCanonicalUnitHashesMatchLedger":True,"reviewHistogramMatches":True,
    "notesScriptContaminationRemoved":True,"originalArabicNegationPreserved":True,
    "lostTextNotInvented":True,"dictionaryEntries":82,"primaryReferenceCards":18},
  "PDFs":pdfs,
  "semanticCaution":"Automated checks, source-overlap comparisons and editorial notes do not establish independently certified Arabic-to-English accuracy for every passage.",
  "OCRCaution":"Existing modern printed comparison pages can be inspected visually; re-OCR of already transcribed or modern PDFs cannot recover an absent ancestral folio. No new historical scan of the disputed words obtained."
}
out=ROOT/"qa"/"qawtaw16-final-acceptance.json"
out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"passed":True,"units":171,"segments":5520,"legacyFlagGroups":57,"flaggedUnits":47,"pdfs":len(pdfs)},ensure_ascii=False))
