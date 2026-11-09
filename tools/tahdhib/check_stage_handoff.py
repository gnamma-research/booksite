#!/usr/bin/env python3
"""Stage111 cumulative Tahdhīb source and crash-recovery integrity.
Enforces three independent historical local note sequences, separate status
for working English, full searchable Arabic, and photo/printed-page certification.
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]/"texts/al-taftazani/tahdhib-al-mantiq/edition"

def read(name):
    s=(ROOT/name).read_text(encoding="utf-8")
    assert "window.GNAMMA_" in s, name
    return json.loads(s[s.index("window.GNAMMA_"):].split("=",1)[1].strip().removesuffix(";"))

def records_for(stage_and_files):
    return [read(n) for n in stage_and_files]

def ensure_sources(rows, low, high, section, prefix):
    assert len({r["id"] for r in rows})==len(rows)
    for i,r in enumerate(rows,1):
        assert r["id"]==f"{prefix}{i:03}",(section,i,r["id"])
        assert (r.get("sectionId") or "H-PREFACE")==section,r["id"]
        assert r.get("scanCertified") is False,r["id"]
        assert r["pages"] and set(r["pages"])<=set(range(low,high+1)),r["id"]
        assert len(r["sourceUrls"])==len(r["pages"]),r["id"]
        assert all(r.get(x) for x in ("speaker","arabicLemma","english","editorial","status")),r["id"]
        for page,url in zip(r["pages"],r["sourceUrls"]):
            assert url in (f"https://ablibrary.net/book_content/b/12170/{page}",
                           f"https://ablibrary.net/book_content/b/12170/{page}?lang=ar"),r["id"]
        assert r["status"] in ("complete_searchable_note","partial_translation"),r["id"]

def audit():
    base=read("hawashi-numbered-notes-stage104.js")
    revision=read("hawashi-numbered-notes-stage105.js")
    early=[f"hawashi-numbered-notes-stage106{x}.js" for x in "abcd"]
    early += [f"hawashi-numbered-notes-stage107{x}.js" for x in "abcdef"]
    early += [f"hawashi-numbered-notes-stage108{x}.js" for x in "ab"]
    early += ["hawashi-numbered-notes-stage109a.js"]
    assert [len(b["notes"]) for b in records_for(early)]==[7,10,6,9,10,10,10,10,8,7,6,10,14]
    pref={n["id"]:n for n in base["entries"]}
    assert [n["noteNumber"] for n in revision["overrides"]]==[2,8,9,12,15]
    assert [n["noteNumber"] for n in revision["appends"]]==[19,20,21,22,23]
    for n in revision["overrides"]:
        assert n["id"] in pref and pref[n["id"]]["status"]=="partial_translation"
        pref[n["id"]]=n
    for n in revision["appends"]:
        assert n["id"] not in pref
        pref[n["id"]]=n
    for b in records_for(early):
        for n in b["notes"]:
            assert n["id"] not in pref,n["id"]
            pref[n["id"]]=n
    preface=sorted(pref.values(),key=lambda n:n["noteNumber"])
    assert [n["noteNumber"] for n in preface]==list(range(1,141))
    ensure_sources(preface,127,164,"H-PREFACE","HWN-")
    preface_full=[n["noteNumber"] for n in preface if n["status"]=="complete_searchable_note"]
    preface_part=[n["noteNumber"] for n in preface if n["status"]=="partial_translation"]
    preface_ar=[n["noteNumber"] for n in preface if n.get("arabicFullText")]
    preface_un=[n["noteNumber"] for n in preface if n.get("unnumberedFollowing")]
    assert len(preface_full)==136 and preface_part==[1,25,82,90]
    assert preface_ar==list(range(24,76))+[114,115]
    assert preface_un==[47,48,71,86,90,112]

    introfiles=[f"hawashi-introduction-notes-stage110{x}.js" for x in "abcd"]+[
        "hawashi-introduction-notes-stage111a.js","hawashi-introduction-notes-stage111b.js"]
    introduction_batches=records_for(introfiles)
    assert [len(b["records"]) for b in introduction_batches]==[10,9,15,15,15,18]
    assert all(b["sectionId"]=="H-INTRO" for b in introduction_batches)
    intro=[n for b in introduction_batches for n in b["records"]]
    assert [n["localNoteNumber"] for n in intro]==list(range(1,83))
    ensure_sources(intro,165,187,"H-INTRO","HWN-INTRO-")
    intro_full=[n["localNoteNumber"] for n in intro if n["status"]=="complete_searchable_note"]
    intro_part=[n["localNoteNumber"] for n in intro if n["status"]=="partial_translation"]
    assert len(intro_full)==66
    assert intro_part==[2,7,10,19,20,23,30,42,50,58,64,68,71,73,75,77]
    assert not any(n.get("arabicFullText") for n in intro)
    assert [n["localNoteNumber"] for n in intro if n.get("unnumberedFollowing")]==[18,29,73]
    assert all(n.get("arabicSourceStatus")=="short_lemma_only" for n in intro)
    assert all(n["fullPrintedPageTranslated"] is False for n in intro)
    assert intro[-1]["localNoteNumber"]==82 and intro[-1]["pages"]==[187]

    dalfile="hawashi-signification-notes-stage111a.js"
    db=read(dalfile)
    assert db["stage"]==111 and db["sectionId"]=="H-DALALA" and len(db["records"])==20
    dal=db["records"]
    assert [n["localNoteNumber"] for n in dal]==list(range(1,21))
    ensure_sources(dal,188,191,"H-DALALA","HWN-DALALA-")
    dal_full=[n["localNoteNumber"] for n in dal if n["status"]=="complete_searchable_note"]
    dal_part=[n["localNoteNumber"] for n in dal if n["status"]=="partial_translation"]
    assert len(dal_full)==14 and dal_part==[1,12,13,14,15,18]
    assert not any(n.get("arabicFullText") or n.get("unnumberedFollowing") for n in dal)
    assert all(n["fullPrintedPageTranslated"] is False for n in dal)
    assert dal[0]["pages"]==[188] and dal[-1]["pages"]==[191]

    allnotes=preface+intro+dal
    assert len(allnotes)==242 and len({n["id"] for n in allnotes})==242
    assert sum(n["status"]=="complete_searchable_note" for n in allnotes)==216
    assert sum(n["status"]=="partial_translation" for n in allnotes)==26
    assert sum(bool(n.get("arabicFullText")) for n in allnotes)==54
    assert sum(bool(n.get("unnumberedFollowing")) for n in allnotes)==9
    assert all(n["scanCertified"] is False for n in allnotes)
    assert base["fullPrintedPagesTranslated"]==0 and base["photoCollated"] is False
    assert revision["fullPageTranslationsAdded"]==0

    p=read("progress-data.js")
    assert p["stage"]=="111" and p["updated"]=="2026-11-09"
    assert p["noteLedger"]["fullyTranslatedFirstPass"]==preface_full
    assert p["noteLedger"]["partiallyTranslated"]==preface_part
    assert p["noteLedger"]["arabicFullSearchableNotes"]==preface_ar
    assert p["introLedger"]["indexedNotes"]==82 and p["introLedger"]["completedEnglish"]==intro_full
    assert p["introLedger"]["partiallyTranslated"]==intro_part
    assert p["introLedger"]["sectionClosedAtPrintedPage"]==187
    assert p["introLedger"]["unnumberedFollowingRendered"]==[18,29,73]
    assert p["introLedger"]["fullDigitizedArabicNotes"]==[]
    assert p["dalalaLedger"]["indexedNotes"]==20
    assert p["dalalaLedger"]["completedEnglish"]==dal_full
    assert p["dalalaLedger"]["partiallyTranslated"]==dal_part
    assert p["dalalaLedger"]["nextLocalNote"]==21
    assert p["dalalaLedger"]["nextSourcePages"]==[191,192]
    assert p["noteLedger"]["nextSection"]["stableFirstId"]=="HWN-DALALA-001"
    assert p["noteLedger"]["nextSection"]["notesIndexed"]==20
    combined=p["overallLaterGlossNoteLedger"]
    assert (combined["indexedNotes"],combined["completeEnglish"],combined["partialEnglish"],
            combined["fullDigitalArabic"],combined["arabicLocatorsOnly"],combined["unnumberedFollowing"])==(242,216,26,54,188,9)
    assert combined["distinctSections"]==["H-PREFACE","H-INTRO","H-DALALA"]
    assert combined["noGlobalHistoricalNoteNumbering"] is True
    assert combined["fullHPrintedPagesCertified"]==0
    assert [int(s["id"]) for s in p["stages"]]==list(range(102,112))
    for s in p["stages"]:
        assert s["files"] and all((ROOT/f).is_file() for f in s["files"]),s["id"]
        if s.get("report"):assert (ROOT/s["report"]).is_file(),s["report"]
    m={x["id"]:(x["current"],x["total"]) for x in p["metrics"]}
    expected={"logic-matn":(19,19),"yazdi-first-pass":(110,110),"yazdi-photo":(0,110),
      "later-sampled":(52,274),"later-full":(0,274),"opening-notes":(136,140),
      "numbered-arabic":(54,140),"intro-notes":(66,82),"intro-arabic":(0,82),
      "dalala-notes":(14,20),"dalala-arabic":(0,20),
      "historical-classes":(46,46),"historical-proofs":(0,46)}
    assert m==expected,(m,expected)
    assert p["baseline"]["laterGlossPages"]==274
    for file in ["HANDOFF_LATEST.md","progress.html","hawashi-numbered-notes.html",
        "stages/STAGE111_INTRODUCTION_AND_SIGNIFICATION.md",
        "batches/hawashi-preface-numbered-cumulative-hwn001-140.md",
        "batches/hawashi-introduction-numbered-cumulative-intro001-082.md",
        "batches/hawashi-signification-numbered-cumulative-dal001-020.md",
        "batches/hawashi-all-sections-cumulative-stage111.md",
        "batches/yazdi-main-batch-01-q7-66.md","batches/yazdi-main-batch-02-q67-123.md"]:
        assert (ROOT/file).is_file(),file
    handoff=(ROOT/"HANDOFF_LATEST.md").read_text(encoding="utf-8")
    for key in ("Stage 111","Stage112","136/140","54/140","66/82","0/82","14/20","0/20",
                "0/274","0/110","HWN-DALALA-021"):
        assert key in handoff,key
    reader=(ROOT/"hawashi-numbered-notes.html").read_text(encoding="utf-8")
    for f in introfiles+[dalfile]:
        assert f in reader,f
    assert all(x in reader for x in ("H-PREFACE","H-INTRO","H-DALALA","section-select"))
    dashboard=(ROOT/"progress.html").read_text(encoding="utf-8")
    assert "progress-data.js?v=20261109-111" in dashboard
    assert "dalala-state" in dashboard
    preMD=(ROOT/"batches/hawashi-preface-numbered-cumulative-hwn001-140.md").read_text()
    introMD=(ROOT/"batches/hawashi-introduction-numbered-cumulative-intro001-082.md").read_text()
    dalMD=(ROOT/"batches/hawashi-signification-numbered-cumulative-dal001-020.md").read_text()
    combinedMD=(ROOT/"batches/hawashi-all-sections-cumulative-stage111.md").read_text()
    assert preMD.count("## Note ")==140
    assert introMD.count("## Introduction note ")==82
    assert dalMD.count("## Signification note ")==20
    assert sum(line.startswith("## Note ") and line.removeprefix("## Note ").split(" ",1)[0].isdigit() for line in combinedMD.splitlines())==140
    assert combinedMD.count("## Introduction note ")==82
    assert combinedMD.count("## Signification note ")==20
    assert sum(line.startswith("### ") and "UNNUMBERED" in line for line in combinedMD.splitlines())==9
    assert len(combinedMD)>400000
    assert all(x in combinedMD for x in ("HWN-001","HWN-INTRO-001","HWN-DALALA-001","HWN-DALALA-020"))
    assert "## Note 141 —" not in combinedMD and "## Introduction note 83 —" not in combinedMD
    prior=sum((read("hawashi-q"+x+"-data.js")["entries"] for x in ("125-139","140-154","155-178")),[])
    assert [n["page"] for n in prior]==list(range(125,179))
    assert sum(n["type"]=="selection" for n in prior)==52
    assert all(n["fullPageTranslated"] is False and n["photoCollated"] is False for n in prior)
    print("PASS Stage111: three independent numbering sequences, 242 source notes/216 English complete/26 partial, 54 digital-Arabic notes, 9 separate unnumbered glosses, 13 independent bars, zero falsely certified pages")

if __name__=="__main__":
    audit()
