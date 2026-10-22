#!/usr/bin/env python3
"""Visual release guard on an actual browser-generated Arabic personal PDF.

The approved PDF and original source text must be unchanged, except for
verified phrase highlight(s) and the P-number marker on its source page.
Report PDF size, annotated page visual proof, endnotes and any unexpected
altered source pixels. Never write back to the original published PDF.
"""
from pathlib import Path
import json,re,hashlib,unicodedata
import fitz
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"qa"/"arabic-visual-output";OUT.mkdir(exist_ok=True)
FIX=ROOT/"qa"/"phone-output"
PERSONAL=FIX/"personal-pdf-sample.pdf"
SOURCE=ROOT/"editions/reading/daruri-reading-arabic-vowelled-titles-off.pdf"
MAPPING=ROOT/"editions/maps/daruri-reading-arabic-vowelled-titles-off.pdf.json"
QUOTE="أما حد الحكم عند أهل السنة فهو عبارة عن خطاب الشرع"
def norm(s):
    s=unicodedata.normalize("NFKD",str(s)).casefold()
    return "".join(c for c in s if unicodedata.category(c)[0] in ("L","N") and c!="ـ")
def matching(words,phrase):
    text="";ranges=[]
    for w in words:
        t=norm(w[0]);start=len(text);text+=t
        ranges.append((start,len(text),w))
    key=norm(phrase)
    matches=[];p=0
    while (pos:=text.find(key,p))>=0:
        end=pos+len(key)
        got=[w for lo,hi,w in ranges if hi>pos and lo<end]
        if got and len(set(w[1] for w in got))==1:
            matches.append(got)
        p=pos+1
    if len(matches)!=1:raise ValueError("Ambiguous or unverified Arabic source quote")
    return matches[0]
def checksum(data):return hashlib.sha256(data).hexdigest()
mapping=json.loads(MAPPING.read_text())
base=json.loads((ROOT/"editions/manifest.json").read_text())
entry=next(v for v in base["files"] if v["file"]=="reading/daruri-reading-arabic-vowelled-titles-off.pdf")
assert checksum(SOURCE.read_bytes())==entry["sha256"]==mapping["source_sha256"]
words=mapping["segments"]["11:0:vocalized"]
hit=matching(words,QUOTE)
source_index=hit[0][1]-1
boxes=[fitz.Rect(*word[2:6]) for word in hit]
x_margin=55.0
def allowed(x,y):
    if x < x_margin:return True  # P reference label in outer left margin
    return any(b.x0-4<=x<=b.x1+4 and b.y0-4<=y<=b.y1+4 for b in boxes)
assert PERSONAL.exists() and PERSONAL.stat().st_size>200000
with fitz.open(SOURCE) as src,fitz.open(PERSONAL) as pdf:
    assert len(src)==entry["pages"]==37
    assert len(pdf)>len(src)
    assert 0<=source_index<len(src)
    modified=[];unexpected=0;changes=0
    for i in range(len(src)):
        before=src[i].get_pixmap(alpha=False)
        after=pdf[i].get_pixmap(alpha=False)
        assert before.width==after.width and before.height==after.height
        if before.samples==after.samples:continue
        modified.append(i)
        if i!=source_index:raise ValueError(f"Unrelated source page {i+1} changed")
        width,height=before.width,before.height
        p=before.samples;q=after.samples
        assert len(p)==len(q)==width*height*3
        for at in range(0,len(p),3):
            if p[at:at+3]==q[at:at+3]:continue
            changes+=1
            x=(at//3)%width;y=(at//3)//width
            if not allowed(x,y):unexpected+=1
    assert modified==[source_index],f"Expected one modified source page: {modified}"
    assert changes>60,f"Expected visible Arabic phrase+marker, observed {changes} different pixels"
    assert unexpected<=65,f"Unexpected changed source pixels outside verified word and margin boxes: {unexpected}"
    newlinks=[l for l in pdf[source_index].get_links()
              if l.get("kind")==fitz.LINK_GOTO and l.get("page",-1)>=len(src)]
    assert len(newlinks)>=2,f"Source missing P marker or phrase GoTo links: {len(newlinks)}"
    assert any(l["from"].x0<40 for l in newlinks),"No visible P margin link"
    assert any(l["from"].x0>=40 for l in newlinks),"No word-level Arabic link"
    note=pdf[len(src)]
    assert any(l.get("page",-1)==source_index for l in note.get_links()), "No return-to-source link from personal appendix"
    for i,name in ((source_index,"precise-arabic-source"),
                   (len(src),"linked-P1-appendix")):
        pdf[i].get_pixmap(matrix=fitz.Matrix(2,2),alpha=False).save(OUT/(name+".png"))
    src[source_index].get_pixmap(matrix=fitz.Matrix(2,2),alpha=False).save(OUT/"original-unchanged-Arabic-source.png")
    performance=json.loads((FIX/"arabic-performance.json").read_text())
    report={
        "source_pdf_sha256":entry["sha256"],"source_pages":len(src),
        "generated_pages":len(pdf),"generated_bytes":PERSONAL.stat().st_size,
        "source_highlight_page":source_index+1,"arabic_quote":QUOTE,
        "words_in_highlight":len(hit),"links_to_personal_appendix":len(newlinks),
        "source_pages_changed":len(modified),"changed_pixels":changes,
        "pixels_outside_allowed_marker_and_word_boxes":unexpected,
        "browser_performance":performance,
        "status":"PASS"
    }
    (OUT/"visual-perf-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print("PASS visual real Arabic PDF:",json.dumps(report,ensure_ascii=False),flush=True)
