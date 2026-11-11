#!/usr/bin/env python3
"""Tahdhīb Stage111 reproducible scholarly source/reader/handoff audit.
Checks THREE independent historical numbering sequences; first-pass translations
do not imply complete Arabic text, photographic witnesses or complete printed pages.
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]/"texts/al-taftazani/tahdhib-al-mantiq/edition"

def js(name):
    s=(ROOT/name).read_text(encoding="utf-8")
    assert "window.GNAMMA_" in s,name
    return json.loads(s[s.index("window.GNAMMA_"):].split("=",1)[1].strip().removesuffix(";"))

def inspect():
    base=js("hawashi-numbered-notes-stage104.js")
    patch=js("hawashi-numbered-notes-stage105.js")
    pref_names=[f"hawashi-numbered-notes-stage106{x}.js" for x in "abcd"]
    pref_names += [f"hawashi-numbered-notes-stage107{x}.js" for x in "abcdef"]
    pref_names += [f"hawashi-numbered-notes-stage108{x}.js" for x in "ab"]
    pref_names += ["hawashi-numbered-notes-stage109a.js"]
    pref_batches=[js(p) for p in pref_names]
    assert [len(b["notes"]) for b in pref_batches]==[7,10,6,9,10,10,10,10,8,7,6,10,14]
    pre={x["id"]:x for x in base["entries"]}
    assert [x["noteNumber"] for x in patch["overrides"]]==[2,8,9,12,15]
    for x in patch["overrides"]:
        assert pre[x["id"]]["status"]=="partial_translation"
        pre[x["id"]]=x
    for x in patch["appends"]:
        assert x["id"] not in pre,x["id"]
        pre[x["id"]]=x
    for b in pref_batches:
        for x in b["notes"]:
            assert x["id"] not in pre,x["id"]
            pre[x["id"]]=x
    pref=sorted(pre.values(),key=lambda x:x["noteNumber"])
    assert [x["id"] for x in pref]==[f"HWN-{i:03}" for i in range(1,141)]
    pref_complete=[x["noteNumber"] for x in pref if x["status"]=="complete_searchable_note"]
    pref_partial=[x["noteNumber"] for x in pref if x["status"]=="partial_translation"]
    pref_ar=[x["noteNumber"] for x in pref if x.get("arabicFullText")]
    assert len(pref_complete)==136 and pref_partial==[1,25,82,90]
    assert pref_ar==list(range(24,76))+[114,115]
    assert [x["noteNumber"] for x in pref if x.get("unnumberedFollowing")]==[47,48,71,86,90,112]
    assert all(x["scanCertified"] is False for x in pref)
    assert base["fullPrintedPagesTranslated"]==0 and base["photoCollated"] is False
    assert patch["fullPageTranslationsAdded"]==0
    intro_names=[f"hawashi-introduction-notes-stage110{x}.js" for x in "abcd"]+[
      f"hawashi-introduction-notes-stage111{x}.js" for x in "ab"]
    intro_batches=[js(p) for p in intro_names]
    assert [len(b["records"]) for b in intro_batches]==[10,9,15,15,15,18]
    intro=[x for b in intro_batches for x in b["records"]]
    dal=js("hawashi-signification-notes-stage111a.js")["records"]
    def group(items,tag,size,beg,end,completeCount,partialExpected,unnumberedExpected):
        assert len(items)==size
        assert [x["id"] for x in items]==[f"HWN-{tag}-{i:03}" for i in range(1,size+1)]
        assert [x["localNoteNumber"] for x in items]==list(range(1,size+1))
        complete=[x["localNoteNumber"] for x in items if x["status"]=="complete_searchable_note"]
        partial=[x["localNoteNumber"] for x in items if x["status"]=="partial_translation"]
        assert len(complete)==completeCount and partial==partialExpected,partial
        assert [x["localNoteNumber"] for x in items if x.get("unnumberedFollowing")]==unnumberedExpected
        for n in items:
            assert n["sectionId"]=="H-"+tag,n["id"]
            assert n["scanCertified"] is False and n["fullPrintedPageTranslated"] is False,n["id"]
            assert n["arabicSourceStatus"]=="short_lemma_only" and not n.get("arabicFullText"),n["id"]
            assert n["pages"] and len(n["pages"])==len(n["sourceUrls"]),n["id"]
            assert min(n["pages"])>=beg and max(n["pages"])<=end,n["id"]
            assert all(n.get(k) for k in ["id","speaker","arabicLemma","english","editorial","status"]),n["id"]
            assert n["sourceUrls"]==[f"https://ablibrary.net/book_content/b/12170/{p}?lang=ar" for p in n["pages"]],n["id"]
            assert len(n["english"].split())>4,n["id"]
            if n.get("unnumberedFollowing"):
                u=n["unnumberedFollowing"]
                assert all(u.get(k) for k in ("speaker","ar","en")),n["id"]
        return complete,partial
    intro_full,intro_part=group(intro,"INTRO",82,165,187,66,
       [2,7,10,19,20,23,30,42,50,58,64,68,71,73,75,77],[18,29,73])
    dal_full,dal_part=group(dal,"DALALA",20,188,191,14,[1,12,13,14,15,18],[])
    allIDs=[x["id"] for x in pref+intro+dal]
    assert len(allIDs)==242 and len(set(allIDs))==242
    p=js("progress-data.js")
    assert p["stage"]=="111" and p["updated"]=="2026-11-09"
    assert [int(x["id"]) for x in p["stages"]]==list(range(102,112))
    for stage in p["stages"]:
        assert stage["files"] and all((ROOT/f).is_file() for f in stage["files"]),stage["id"]
        if stage.get("report"):assert (ROOT/stage["report"]).is_file(),stage["id"]
    assert p["noteLedger"]["fullyTranslatedFirstPass"]==pref_complete
    assert p["noteLedger"]["partiallyTranslated"]==pref_partial
    assert p["noteLedger"]["arabicFullSearchableNotes"]==pref_ar
    assert p["introLedger"]["indexedNotes"]==82
    assert p["introLedger"]["completedEnglish"]==intro_full
    assert p["introLedger"]["partiallyTranslated"]==intro_part
    assert p["introLedger"]["sectionClosedAtPrintedPage"]==187
    assert p["introLedger"]["unnumberedFollowingRendered"]==[18,29,73]
    assert p["dalalaLedger"]["indexedNotes"]==20
    assert p["dalalaLedger"]["completedEnglish"]==dal_full
    assert p["dalalaLedger"]["partiallyTranslated"]==dal_part
    assert p["dalalaLedger"]["nextLocalNote"]==21
    assert p["dalalaLedger"]["nextSourcePages"]==[191,192]
    total=p["overallLaterGlossNoteLedger"]
    assert total["indexedNotes"]==242 and total["completeEnglish"]==216
    assert total["partialEnglish"]==26 and total["fullDigitalArabic"]==54
    assert total["arabicLocatorsOnly"]==188 and total["unnumberedFollowing"]==9
    assert total["distinctSections"]==["H-PREFACE","H-INTRO","H-DALALA"]
    assert total["noGlobalHistoricalNoteNumbering"] is True
    assert total["fullHPrintedPagesCertified"]==0
    target={
      "logic-matn":(19,19),"yazdi-first-pass":(110,110),"yazdi-photo":(0,110),
      "later-sampled":(52,274),"later-full":(0,274),"opening-notes":(136,140),
      "numbered-arabic":(54,140),"intro-notes":(66,82),"intro-arabic":(0,82),
      "dalala-notes":(14,20),"dalala-arabic":(0,20),
      "historical-classes":(46,46),"historical-proofs":(0,46)}
    metrics={m["id"]:(m["current"],m["total"]) for m in p["metrics"]}
    assert metrics==target,(metrics,target)
    assert p["baseline"]["laterGlossPages"]==274
    assert p["baseline"]["laterSampledPages"]==52
    rels=["HANDOFF_LATEST.md","progress.html","hawashi-numbered-notes.html",
          "stages/STAGE111_INTRODUCTION_AND_SIGNIFICATION.md",
          "batches/hawashi-all-sections-cumulative-stage111.md",
          "batches/hawashi-preface-numbered-cumulative-hwn001-140.md",
          "batches/hawashi-introduction-numbered-cumulative-intro001-082.md",
          "batches/hawashi-signification-numbered-cumulative-dal001-020.md",
          "batches/hawashi-all-sections-cumulative-stage110.md",
          "batches/yazdi-main-batch-01-q7-66.md","batches/yazdi-main-batch-02-q67-123.md"]
    assert all((ROOT/f).is_file() for f in rels)
    combined=(ROOT/"batches/hawashi-all-sections-cumulative-stage111.md").read_text(encoding="utf-8")
    assert len(combined)>405000
    assert sum(line.startswith("## Note ") and line.removeprefix("## Note ").split(" ",1)[0].isdigit() for line in combined.splitlines())==140  # exclude two "Note index" headings
    assert combined.count("## Introduction note ")==82
    assert combined.count("## Signification note ")==20
    assert "HWN-INTRO-001" in combined and "HWN-DALALA-001" in combined
    assert "## Note 141 —" not in combined and "## Introduction note 83" not in combined
    assert combined.count("UNNUMBERED")>=9
    handoff=(ROOT/"HANDOFF_LATEST.md").read_text(encoding="utf-8")
    for term in ["Stage111","Stage112","136/140","54/140","66/82","0/82","14/20",
                 "0/20","0/274","0/110","HWN-DALALA-021"]:
        assert term in handoff,term
    reader=(ROOT/"hawashi-numbered-notes.html").read_text(encoding="utf-8")
    for f in intro_names+["hawashi-signification-notes-stage111a.js"]:
        assert f in reader,f
    assert "H-DALALA" in reader and "section-select" in reader
    dash=(ROOT/"progress.html").read_text(encoding="utf-8")
    assert "progress-data.js?v=20261109-111" in dash and "dalala-state" in dash
    old=sum((js("hawashi-q"+x+"-data.js")["entries"] for x in ("125-139","140-154","155-178")),[])
    assert [n["page"] for n in old]==list(range(125,179))
    assert sum(x["type"]=="selection" for x in old)==52
    assert all(x["fullPageTranslated"] is False and x["photoCollated"] is False for x in old)
    print("PASS Tahdhīb Stage111: three local numbered H sections 140+82+20=242; 216 complete first-pass English and 26 partial; 54 digital Arabic full texts, 188 locators, 9 separate unnumbered, 13 honest metrics and no invented certified pages")

if __name__=="__main__":
    inspect()
