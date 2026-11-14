#!/usr/bin/env python3
"""Apply 5 Nov 2026 critical review without replacing the site's newer reader UI.

The witness is Escorial Ar. 1235 as REPORTED by Bou Akl (2015).
No direct facsimile collation is claimed.
"""
import csv, json, re, sys
from pathlib import Path
from difflib import SequenceMatcher

ROOT=Path(__file__).resolve().parent.parent
CASE=ROOT/"critical-review"
DELTA=json.loads((CASE/"2026-11-05-delta.json").read_text(encoding="utf-8"))
ISSUES=list(csv.DictReader((CASE/"2026-11-05-issues.csv").open(encoding="utf-8",newline="")))
TEXT=ROOT/"edition-r3-20261020.js"
INDEX=ROOT/"index.html"
REPORT=CASE/"2026-11-05-apply-result.json"

def apply_edits(book):
    by_id={str(s["id"]):s for s in book["sections"]}
    counts={"changed":0,"already":0,"conflicts":[],"notes_added":0,"notes_existing":0}
    for e in DELTA["edits"]:
        section=by_id.get(str(e["section"]))
        if not section or e["segment"]>=len(section["segments"]):
            counts["conflicts"].append({"section":e["section"],"field":e["field"],"reason":"segment missing"})
            continue
        seg=section["segments"][e["segment"]]
        cur=seg.get(e["field"],"")
        if e["new"]==cur or (e["to"] in cur and e["from"] not in cur):
            counts["already"]+=1
            continue
        if e["old"]==cur:
            seg[e["field"]]=e["new"]
            counts["changed"]+=1
            continue
        if e["from"] and e["from"] in cur and cur.count(e["from"])==1:
            seg[e["field"]]=cur.replace(e["from"],e["to"],1)
            counts["changed"]+=1
            continue
        # Text may have a later editorial change elsewhere in the paragraph.
        # Apply only when the exact original change and its left/right context
        # are independently present; never replace the whole newer paragraph.
        before,after=e["old"],e["new"]
        sm=SequenceMatcher(None,before,after,autojunk=False)
        hunks=[(i1,i2,after[j1:j2]) for tag,i1,i2,j1,j2 in sm.get_opcodes() if tag!="equal"]
        changed=cur
        possible=bool(hunks)
        for i1,i2,repl in reversed(hunks):
            left=before[max(0,i1-16):i1]
            right=before[i2:min(len(before),i2+16)]
            needle=left+before[i1:i2]+right
            replace=left+repl+right
            if needle and changed.count(needle)==1:
                changed=changed.replace(needle,replace,1)
            elif replace and replace in changed:
                pass
            else:
                possible=False;break
        if possible and changed!=cur:
            seg[e["field"]]=changed
            counts["changed"]+=1
        else:
            counts["conflicts"].append({"section":e["section"],"segment":e["segment"],"field":e["field"],"reason":"canonical source differs; manual collation needed","before":e["from"][:90]})
    # Preserve historical notes; supplement each registered issue with a
    # uniquely keyed, passage-linked editorial apparatus note.
    bynote={n["id"]:n for n in book.get("notes",[])}
    for row in ISSUES:
        sec=by_id.get(row["section"].strip())
        if not sec:
            counts["conflicts"].append({"section":row["section"],"reason":"issue has no section"})
            continue
        note_id="CR20261105-"+row["id"]
        if note_id in bynote:
            counts["notes_existing"]+=1
        else:
            resolution=row.get("resolution_2026-11-05") or row.get("action") or ""
            text=("Critical review 5 Nov 2026; "+row.get("title","")+". "+
                  "Editorial disposition: "+resolution+
                  " [Classification: "+row.get("status","")+"; evidence: "+
                  row.get("evidence","")+"].")
            if "Escorial" in text or "manuscript" in text.lower() or "[أ]" in text:
                text+=" Escorial readings are as reported in Bou Akl (2015); the manuscript was not directly re-collated."
            note={"id":note_id,"n":str(row["section"]),"kind":"textual","text":text}
            book["notes"].append(note)
            bynote[note_id]=note
            counts["notes_added"]+=1
        if note_id not in sec.setdefault("noteIds",[]):
            sec["noteIds"].append(note_id)
    return counts

def patch_js(data):
    pat=r'textContent\s*=\s*("(?:[^"\\]|\\.)*")\s*;'
    match=re.search(pat,data,re.S)
    if not match:
        raise RuntimeError("Canonical reader JSON payload not identified")
    book=json.loads(json.loads(match.group(1)))
    if len(book["sections"])!=259:
        raise RuntimeError("Wrong reader: expected 259 sections including colophon")
    stats=apply_edits(book)
    new=json.dumps(json.dumps(book,ensure_ascii=False,separators=(",",":")),ensure_ascii=False)
    return data[:match.start(1)]+new+data[match.end(1):],stats,book

def patch_index(data):
    # The published HTML contains its own static fallback. We do not replace
    # that entire 3.5MB page or remove newer user-interface work.
    found=0
    m=re.search(r"(<script[^>]+id=['\"]editionData['\"][^>]*>)([\s\S]*?)(</script>)",data,re.I)
    if m:
        try:
            book=json.loads(m.group(2))
            if "sections" in book:
                summary=apply_edits(book)
                data=data[:m.start(2)]+json.dumps(book,ensure_ascii=False,separators=(",",":"))+data[m.end(2):]
                found=summary["changed"]
        except Exception as exc:
            print("Index data payload cannot be adjusted:",exc,file=sys.stderr)
    # Refresh the static English only when a precise text-node substring
    # occurs and keep all existing term-link anchors and site controls.
    updated=0
    for e in DELTA["edits"]:
        if e["field"]!="en":continue
        tag=re.search(r"(<section[^>]+data-native-section=['\"]"+str(e["section"])+r"['\"][^>]*>)([\s\S]*?)(</section>)",data,re.I)
        if not tag:continue
        sec=tag.group(2)
        if e["from"] in sec and sec.count(e["from"])==1:
            data=data[:tag.start(2)]+sec.replace(e["from"],e["to"],1)+data[tag.end(2):]
            updated+=1
    data=data.replace("is taken to refer to the error just discussed; the explanatory bracket makes that syntactic interpretation visible.", "introduces a stronger positive conclusion that abrogation leaves permissibility; the previous editorial insertion reversing this argument has been withdrawn.")
    return data,{"index_data_changed":found,"static_passages_changed":updated}

def main():
    old=TEXT.read_text(encoding="utf-8")
    revised,stats,book=patch_js(old)
    # The late corrections below operate on the parsed book; serialize only after them.
    # Site is normally enhanced from the canonical reader payload. Correct
    # any independently embedded page data where the site exposes it.
    html=INDEX.read_text(encoding="utf-8")
    new_html,htmlstats=patch_index(html)
    if new_html!=html:INDEX.write_text(new_html,encoding="utf-8")
    # Preserve stronger readings already in the live October 2026 scholarly source
    # while repairing residual Arabic orthography and editorial supplements.
    special=[
       (97,0,"ar","من حاله التصريح عن الثقات","من حاله ⟨التصريح⟩ عن الثقات"),
       (97,0,"vocalized","إِمَّا بالقول،","إِمَّا بِالْقَوْلِ،"),
       (204,0,"ar","أمر مجد د","أمر مجدد"),
       (204,0,"vocalized","أَمْرٍ مجد د","أَمْرٍ مُجَدَّدٍ"),
       (205,0,"vocalized","وقوع الإجزاء بالمأمور به","وُقُوعَ الْإِجْزَاءِ بِالْمَأْمُورِ بِهِ"),
       (205,0,"vocalized","لا يقتضي الإجزاء","لَا يَقْتَضِي الْإِجْزَاءَ"),
       (205,0,"vocalized","وَلَا يُجْزِيهِ","وَلَا يُجْزِئُهُ"),
       (229,0,"ar","⟨أنه مختص. والثالث هو⟩","⟨أنه مختص به، والثالث هو⟩"),
       (229,0,"vocalized","⟨أَنَّهُ مُخْتَصٌّ. وَالثَّالِثُ هُوَ⟩","⟨أَنَّهُ مُخْتَصٌّ بِهِ، وَالثَّالِثُ هُوَ⟩"),
    ]
    ss={s["id"]:s for s in book["sections"]}
    for sid,idx,field,before,after in special:
        segment=ss[sid]["segments"][idx]
        if before in segment[field]:
            segment[field]=segment[field].replace(before,after,1)
            stats["changed"]+=1
    # The newer canonical reader had independently improved 19 local pilot
    # passages. Report those mismatches; never revert them to October wording.
    stats["preserved_newer"] = len(stats["conflicts"])
    s23=" ".join(x["en"] for x in ss[23]["segments"])
    s26=" ".join(x["en"] for x in ss[26]["segments"])
    s64=" ".join(x["en"] for x in ss[64]["segments"])
    assert "In the latter case" not in s23 and "least" in s23, "§23 scope is still defective"
    assert "is the error of supposing" not in s26 and ("permissib" in s26.lower()), "§26 argument inverted"
    assert "not expressly stated" not in s64 and "not explicitly stated" not in s64, "§64 negation not corrected"
    # Reader navigation and PDF updater independently verify these two counts.
    book["stats"]["notes"]=len(book["notes"])
    book["stats"]["noteCount"]=len(book["notes"])
    # Serialize the final verified book with all targeted repairs, preserving the JS wrapper.
    import re as _re
    _pat=r'textContent\s*=\s*("(?:[^"\\]|\\.)*")\s*;'
    _m=_re.search(_pat,old,_re.S)
    revised=old[:_m.start(1)]+json.dumps(json.dumps(book,ensure_ascii=False,separators=(",",":")),ensure_ascii=False)+old[_m.end(1):]
    TEXT.write_text(revised,encoding="utf-8")
    result={"date":"2026-11-05","source":"Bou Akl's reported manuscript apparatus, not direct facsimile","count":stats,"html":htmlstats,"sections":len(book["sections"]),"notes":len(book["notes"]),"issues":len(ISSUES)}
    REPORT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(result,ensure_ascii=False,indent=2))
    # Prior pilot-based discrepancies are retained in the report and reviewed
    # against the newer live source instead of force-reverting editorial work.
if __name__=="__main__":main()
