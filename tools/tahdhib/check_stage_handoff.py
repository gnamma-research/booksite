#!/usr/bin/env python3
"""Stage112 Tahdhīb scholarly source evidence audit.
Four separately numbered H series; selected English is not complete original Arabic,
a numbered gloss is not a whole printed page and a searchable text is not a manuscript scan.
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]/"texts/al-taftazani/tahdhib-al-mantiq/edition"

def source(name):
    s=(ROOT/name).read_text(encoding="utf-8")
    assert "window.GNAMMA_" in s,name
    return json.loads(s[s.index("window.GNAMMA_"):].split("=",1)[1].strip().removesuffix(";"))

def check_group(items,section,prefix,count,startpage,endpage,completeCount,partialNums,extraNums,fullArabicNums):
    assert len(items)==count
    assert [n["id"] for n in items]==[f"{prefix}{i:03}" for i in range(1,count+1)],section
    assert [n["localNoteNumber"] for n in items]==list(range(1,count+1))
    complete=[n["localNoteNumber"] for n in items if n["status"]=="complete_searchable_note"]
    partial=[n["localNoteNumber"] for n in items if n["status"]=="partial_translation"]
    arabic=[n["localNoteNumber"] for n in items if n.get("arabicFullText")]
    unnumbered=[n["localNoteNumber"] for n in items if n.get("unnumberedFollowing")]
    assert len(complete)==completeCount and partial==partialNums,(section,complete,partial)
    assert arabic==fullArabicNums and unnumbered==extraNums,(section,arabic,unnumbered)
    for n in items:
        assert n["sectionId"]==section and n.get("scanCertified") is False,n["id"]
        assert n.get("fullPrintedPageTranslated") is False,n["id"]
        assert n["pages"] and len(n["pages"])==len(n["sourceUrls"]),n["id"]
        assert min(n["pages"])>=startpage and max(n["pages"])<=endpage,n["id"]
        assert all(n.get(k) for k in ("id","arabicLemma","english","speaker","editorial","status")),n["id"]
        assert len(n["english"].split())>4,n["id"]
        assert n["sourceUrls"]==[f"https://ablibrary.net/book_content/b/12170/{pg}?lang=ar" for pg in n["pages"]],n["id"]
        if n.get("arabicFullText"):assert n["arabicSourceStatus"]=="searchable_Qum_diplomatic_first_pass",n["id"]
        else:assert n["arabicSourceStatus"]=="short_lemma_only",n["id"]
        if n.get("unnumberedFollowing"):
            u=n["unnumberedFollowing"]
            assert all(u.get(k) for k in ("speaker","ar","en")),n["id"]
    return complete,partial,arabic,unnumbered

def audit():
    a=source("hawashi-numbered-notes-stage104.js")
    b=source("hawashi-numbered-notes-stage105.js")
    prefiles=[f"hawashi-numbered-notes-stage106{x}.js" for x in "abcd"]+[
      f"hawashi-numbered-notes-stage107{x}.js" for x in "abcdef"]+[
      f"hawashi-numbered-notes-stage108{x}.js" for x in "ab"]+["hawashi-numbered-notes-stage109a.js"]
    pref={n["id"]:n for n in a["entries"]}
    assert [n["noteNumber"] for n in b["overrides"]]==[2,8,9,12,15]
    for n in b["overrides"]:
        assert pref[n["id"]]["status"]=="partial_translation"
        pref[n["id"]]=n
    for n in b["appends"]:
        assert n["id"] not in pref
        pref[n["id"]]=n
    for name in prefiles:
        for n in source(name)["notes"]:
            assert n["id"] not in pref,n["id"]
            pref[n["id"]]=n
    prefitems=sorted(pref.values(),key=lambda n:n["noteNumber"])
    assert [n["id"] for n in prefitems]==[f"HWN-{i:03}" for i in range(1,141)]
    prefFull=[n["noteNumber"] for n in prefitems if n["status"]=="complete_searchable_note"]
    prefPart=[n["noteNumber"] for n in prefitems if n["status"]=="partial_translation"]
    prefAr=[n["noteNumber"] for n in prefitems if n.get("arabicFullText")]
    prefExtra=[n["noteNumber"] for n in prefitems if n.get("unnumberedFollowing")]
    assert len(prefFull)==136 and prefPart==[1,25,82,90]
    assert prefAr==list(range(24,76))+[114,115] and prefExtra==[47,48,71,86,90,112]
    assert all(n["scanCertified"] is False for n in prefitems)
    assert a["fullPrintedPagesTranslated"]==0 and a["photoCollated"] is False
    assert b["fullPageTranslationsAdded"]==0
    introfiles=[f"hawashi-introduction-notes-stage110{x}.js" for x in "abcd"]+[
      f"hawashi-introduction-notes-stage111{x}.js" for x in "ab"]
    intro=[n for f in introfiles for n in source(f)["records"]]
    iFull,iPart,iAr,iExtra=check_group(intro,"H-INTRO","HWN-INTRO-",82,165,187,66,
       [2,7,10,19,20,23,30,42,50,58,64,68,71,73,75,77],[18,29,73],[])
    dalfiles=["hawashi-signification-notes-stage111a.js"]+[
      f"hawashi-signification-notes-stage112{x}.js" for x in "abcd"]
    dal=[n for f in dalfiles for n in source(f)["records"]]
    dFull,dPart,dAr,dExtra=check_group(dal,"H-DALALA","HWN-DALALA-",91,188,215,59,
       [1,12,13,14,15,18,21,22,25,27,28,32,33,37,38,40,50,54,57,60,63,64,68,69,72,73,74,76,83,86,88,89],[74],[])
    maf=source("hawashi-concepts-notes-stage112a.js")["records"]
    mFull,mPart,mAr,mExtra=check_group(maf,"H-MAFAHIM","HWN-MAFAHIM-",11,216,221,5,
        [2,4,5,6,9,10],[],[])
    allids=[n["id"] for n in prefitems+intro+dal+maf]
    assert len(allids)==324 and len(set(allids))==324
    p=source("progress-data.js")
    assert p["stage"]=="112" and p["updated"]=="2026-11-09"
    assert [int(s["id"]) for s in p["stages"]]==list(range(102,113))
    for stage in p["stages"]:
        assert stage["files"] and all((ROOT/f).is_file() for f in stage["files"]),stage["id"]
        if stage.get("report"):assert (ROOT/stage["report"]).is_file(),stage["id"]
    assert p["noteLedger"]["fullyTranslatedFirstPass"]==prefFull
    assert p["noteLedger"]["partiallyTranslated"]==prefPart
    assert p["noteLedger"]["arabicFullSearchableNotes"]==prefAr
    assert p["introLedger"]["completedEnglish"]==iFull and p["introLedger"]["partiallyTranslated"]==iPart
    assert p["dalalaLedger"]["completedEnglish"]==dFull and p["dalalaLedger"]["partiallyTranslated"]==dPart
    assert p["dalalaLedger"]["sectionClosedAtPrintedPage"]==215
    assert p["dalalaLedger"]["unnumberedFollowingRendered"]==[74]
    assert p["mafahimLedger"]["completedEnglish"]==mFull and p["mafahimLedger"]["partiallyTranslated"]==mPart
    assert p["mafahimLedger"]["nextLocalNote"]==12 and p["mafahimLedger"]["nextSourcePage"]==221
    assert p["noteLedger"]["nextSection"]["stableFirstId"]=="HWN-MAFAHIM-001"
    t=p["overallLaterGlossNoteLedger"]
    assert t["indexedNotes"]==324 and t["completeEnglish"]==266 and t["partialEnglish"]==58
    assert t["fullDigitalArabic"]==54 and t["arabicLocatorsOnly"]==270
    assert t["unnumberedFollowing"]==10
    assert t["distinctSections"]==["H-PREFACE","H-INTRO","H-DALALA","H-MAFAHIM"]
    assert t["noGlobalHistoricalNoteNumbering"] is True and t["fullHPrintedPagesCertified"]==0
    metrics={m["id"]:(m["current"],m["total"]) for m in p["metrics"]}
    target={
      "logic-matn":(19,19),"yazdi-first-pass":(110,110),"yazdi-photo":(0,110),
      "later-sampled":(52,274),"later-full":(0,274),"opening-notes":(136,140),
      "numbered-arabic":(54,140),"intro-notes":(66,82),"intro-arabic":(0,82),
      "dalala-notes":(59,91),"dalala-arabic":(0,91),
      "mafahim-notes":(5,11),"mafahim-arabic":(0,11),
      "historical-classes":(46,46),"historical-proofs":(0,46)}
    assert metrics==target,(metrics,target)
    assert p["baseline"]["laterGlossPages"]==274
    for path in [
      "HANDOFF_LATEST.md","progress.html","hawashi-numbered-notes.html",
      "stages/STAGE112_SIGNIFICATION_AND_CONCEPTS.md",
      "batches/hawashi-signification-numbered-cumulative-dal001-091.md",
      "batches/hawashi-concepts-numbered-cumulative-maf001-011.md",
      "batches/hawashi-all-sections-cumulative-stage112.md",
      "batches/hawashi-all-sections-cumulative-stage111.md",
      "batches/hawashi-preface-numbered-cumulative-hwn001-140.md",
      "batches/hawashi-introduction-numbered-cumulative-intro001-082.md"]:
       assert (ROOT/path).is_file(),path
    complete=(ROOT/"batches/hawashi-all-sections-cumulative-stage112.md").read_text(encoding="utf-8")
    assert len(complete)>510000
    assert complete.count("## Note ")==140
    assert complete.count("## Introduction note ")==82
    assert complete.count("## Signification note ")==91
    assert complete.count("## Concepts note ")==11
    assert "HWN-MAFAHIM-001" in complete and "HWN-DALALA-091" in complete
    assert "## Signification note 92" not in complete
    handoff=(ROOT/"HANDOFF_LATEST.md").read_text(encoding="utf-8")
    for term in ["Stage112","Stage113","136/140","54/140","66/82","0/82",
                 "59/91","0/91","5/11","0/11","0/274","0/110","HWN-MAFAHIM-012"]:
       assert term in handoff,term
    reader=(ROOT/"hawashi-numbered-notes.html").read_text(encoding="utf-8")
    for f in dalfiles+["hawashi-concepts-notes-stage112a.js"]:
       assert f in reader,f
    assert all(x in reader for x in ["H-PREFACE","H-INTRO","H-DALALA","H-MAFAHIM","section-select"])
    page=(ROOT/"progress.html").read_text(encoding="utf-8")
    assert "progress-data.js?v=20261109-112" in page and "mafahim-state" in page
    old=sum((source("hawashi-q"+x+"-data.js")["entries"] for x in ("125-139","140-154","155-178")),[])
    assert [x["page"] for x in old]==list(range(125,179))
    assert sum(x["type"]=="selection" for x in old)==52
    assert all(x["fullPageTranslated"] is False and x["photoCollated"] is False for x in old)
    print("PASS Stage112 4 historical H numbering systems, 324 unique notes, 266 English complete first-pass, 58 partial, 54 full digital Arabic, 270 locators, 10 unnumbered, 15 independent goals and zero fabricated certified pages")

if __name__=="__main__":
    audit()
