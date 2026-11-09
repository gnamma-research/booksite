#!/usr/bin/env python3
"""Stage110 cumulative Tahdhīb H source and handoff verification.
Two historically local note sequences, unchanged previous corpora, distinct
first-pass English, digital Arabic, whole-print-page and photographic cert grades.
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]/"texts/al-taftazani/tahdhib-al-mantiq/edition"

def load(name):
    s=(ROOT/name).read_text(encoding="utf-8")
    assert "window.GNAMMA_" in s,name
    return json.loads(s[s.index("window.GNAMMA_"):].split("=",1)[1].strip().removesuffix(";"))

def check():
    base=load("hawashi-numbered-notes-stage104.js")
    patch=load("hawashi-numbered-notes-stage105.js")
    files=[f"hawashi-numbered-notes-stage106{x}.js" for x in "abcd"]
    files += [f"hawashi-numbered-notes-stage107{x}.js" for x in "abcdef"]
    files += [f"hawashi-numbered-notes-stage108{x}.js" for x in "ab"]
    files += ["hawashi-numbered-notes-stage109a.js"]
    old_batches=[load(f) for f in files]
    assert [len(b["notes"]) for b in old_batches]==[7,10,6,9,10,10,10,10,8,7,6,10,14]
    assert [n["noteNumber"] for n in base["entries"]]==list(range(1,19))
    assert [n["noteNumber"] for n in patch["overrides"]]==[2,8,9,12,15]
    assert [n["noteNumber"] for n in patch["appends"]]==[19,20,21,22,23]
    pref={n["id"]:n for n in base["entries"]}
    for n in patch["overrides"]:
        assert n["id"] in pref and pref[n["id"]]["status"]=="partial_translation"
        pref[n["id"]]=n
    for n in patch["appends"]:
        assert n["id"] not in pref,n["id"]
        pref[n["id"]]=n
    for batch in old_batches:
        for n in batch["notes"]:
            assert n["id"] not in pref,n["id"]
            pref[n["id"]]=n
    preface=sorted(pref.values(),key=lambda n:n["noteNumber"])
    assert len(preface)==140
    assert [n["id"] for n in preface]==[f"HWN-{i:03}" for i in range(1,141)]
    pref_full=[n["noteNumber"] for n in preface if n["status"]=="complete_searchable_note"]
    pref_part=[n["noteNumber"] for n in preface if n["status"]=="partial_translation"]
    pref_ar=[n["noteNumber"] for n in preface if n.get("arabicFullText")]
    assert len(pref_full)==136 and pref_part==[1,25,82,90]
    assert pref_ar==list(range(24,76))+[114,115]
    assert [n["noteNumber"] for n in preface if n.get("unnumberedFollowing")]==[47,48,71,86,90,112]
    assert not any("HWN-INTRO" in n["id"] for n in preface)
    assert all(n.get("scanCertified") is False for n in preface)
    assert base["photoCollated"] is False and base["fullPrintedPagesTranslated"]==0
    assert patch["fullPageTranslationsAdded"]==0

    intro_files=[f"hawashi-introduction-notes-stage110{x}.js" for x in "abcd"]
    intro_batches=[load(f) for f in intro_files]
    assert [len(b["records"]) for b in intro_batches]==[10,9,15,15]
    assert all(b["sectionId"]=="H-INTRO" and b["stage"]==110 for b in intro_batches)
    intro=[n for b in intro_batches for n in b["records"]]
    assert len(intro)==49
    assert [n["localNoteNumber"] for n in intro]==list(range(1,50))
    assert [n["id"] for n in intro]==[f"HWN-INTRO-{i:03}" for i in range(1,50)]
    assert len({n["id"] for n in intro})==49
    assert set(pref).isdisjoint(n["id"] for n in intro)
    intro_full=[n["localNoteNumber"] for n in intro if n["status"]=="complete_searchable_note"]
    intro_part=[n["localNoteNumber"] for n in intro if n["status"]=="partial_translation"]
    assert len(intro_full)==41 and intro_part==[2,7,10,19,20,23,30,42]
    assert not any(n.get("arabicFullText") for n in intro)
    assert [n["localNoteNumber"] for n in intro if n.get("unnumberedFollowing")]==[18,29]
    assert all(n["sectionId"]=="H-INTRO" and n["arabicSourceStatus"]=="short_lemma_only" for n in intro)
    assert all(n["fullPrintedPageTranslated"] is False and n["scanCertified"] is False for n in intro)
    for n in intro:
        assert n["pages"] and len(n["pages"])==len(n["sourceUrls"]),n["id"]
        assert set(n["pages"])<=set(range(165,179)),n["id"]
        assert all(n.get(k) for k in ["id","speaker","arabicLemma","english","editorial","status"]),n["id"]
        assert len(n["english"].split())>4,n["id"]
        assert n["sourceUrls"]==[f"https://ablibrary.net/book_content/b/12170/{p}?lang=ar" for p in n["pages"]],n["id"]
        if n.get("unnumberedFollowing"):
            u=n["unnumberedFollowing"]
            assert u.get("speaker") and u.get("ar") and u.get("en")
            assert "Karm" in u["speaker"] or "الكرمي" in u["speaker"] or "al-Karm" in u["speaker"]
    p=load("progress-data.js")
    assert p["stage"]=="110" and p["updated"]=="2026-11-09"
    assert p["noteLedger"]["range"]=="H-PREFACE: HWN-001–HWN-140"
    assert p["noteLedger"]["fullyTranslatedFirstPass"]==pref_full
    assert p["noteLedger"]["partiallyTranslated"]==pref_part
    assert p["noteLedger"]["arabicFullSearchableNotes"]==pref_ar
    assert p["noteLedger"]["sourcePhotographed"] is False
    new=p["introLedger"]
    assert new["sectionId"]=="H-INTRO" and new["indexedNotes"]==49
    assert new["completedEnglish"]==intro_full and new["partiallyTranslated"]==intro_part
    assert new["fullDigitizedArabicNotes"]==[]
    assert new["unnumberedFollowingRendered"]==[18,29]
    assert new["nextLocalNote"]==50 and new["nextSourcePage"]==178 and new["needNextPage"]==179
    assert new["sourcePhotographed"] is False and new["fullPrintedPagesCertified"]==0
    next_section=p["noteLedger"]["nextSection"]
    assert next_section["id"]=="H-INTRO" and next_section["stableFirstId"]=="HWN-INTRO-001"
    assert next_section["notesIndexed"]==49 and next_section["notesTranslated"]==41
    assert [int(s["id"]) for s in p["stages"]]==list(range(102,111))
    for stage in p["stages"]:
        assert stage["files"] and all((ROOT/f).is_file() for f in stage["files"]),stage["id"]
        if stage.get("report"):assert (ROOT/stage["report"]).is_file(),stage["report"]
    m={q["id"]:(q["current"],q["total"]) for q in p["metrics"]}
    required={
      "logic-matn":(19,19),"yazdi-first-pass":(110,110),"yazdi-photo":(0,110),
      "later-sampled":(52,274),"later-full":(0,274),"opening-notes":(136,140),
      "numbered-arabic":(54,140),"intro-notes":(41,49),"intro-arabic":(0,49),
      "historical-classes":(46,46),"historical-proofs":(0,46)}
    assert m==required,(m,required)
    assert p["baseline"]["laterGlossPages"]==274 and p["baseline"]["laterSampledPages"]==52

    for file in [
      "HANDOFF_LATEST.md","progress.html","hawashi-numbered-notes.html",
      "stages/STAGE110_INTRODUCTION_NUMBERING_AND_NOTES.md",
      "batches/hawashi-introduction-numbered-cumulative-intro001-049.md",
      "batches/hawashi-preface-numbered-cumulative-hwn001-140.md",
      "batches/hawashi-all-sections-cumulative-stage110.md",
      "batches/yazdi-main-batch-01-q7-66.md","batches/yazdi-main-batch-02-q67-123.md"]:
        assert (ROOT/file).is_file(),file
    intro_md=(ROOT/"batches/hawashi-introduction-numbered-cumulative-intro001-049.md").read_text(encoding="utf-8")
    assert intro_md.count("## Introduction note ")==49
    assert intro_md.count("### Separately quoted UNNUMBERED later addition")==2
    combined=(ROOT/"batches/hawashi-all-sections-cumulative-stage110.md").read_text(encoding="utf-8")
    assert len(combined)>320000 and combined.count("## Introduction note ")==49
    assert combined.count("## Note ")==140
    assert "HWN-INTRO-001" in combined and "HWN-001" in combined
    assert "HWN-141" not in combined
    handoff=(ROOT/"HANDOFF_LATEST.md").read_text(encoding="utf-8")
    for token in ("Stage110","Stage111","136/140","54/140","41/49","0/49","0/274","0/110","HWN-INTRO-050"):
        assert token in handoff,token
    reader=(ROOT/"hawashi-numbered-notes.html").read_text(encoding="utf-8")
    for f in intro_files:
        assert f in reader,f
    assert "section-select" in reader and "H-INTRO" in reader and "H-PREFACE" in reader
    dash=(ROOT/"progress.html").read_text(encoding="utf-8")
    assert "progress-data.js?v=20261109-110" in dash and "intro-state" in dash
    prior=sum((load("hawashi-q"+x+"-data.js")["entries"] for x in ("125-139","140-154","155-178")),[])
    assert [n["page"] for n in prior]==list(range(125,179))
    assert sum(n["type"]=="selection" for n in prior)==52
    assert all(n["fullPageTranslated"] is False and n["photoCollated"] is False for n in prior)
    print("PASS Stage110: H-PREFACE 140 (136/4, 54 full digital Arabic) and H-INTRO 49 (41/8, 0 full Arabic), 189 unique note IDs, 8 unnumbered, 11 honest bars, 9 stage reports; 0 fabricated page/manuscript certifications")

if __name__=="__main__":
    check()
