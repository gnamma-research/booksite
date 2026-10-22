#!/usr/bin/env python3
"""Publish checksum-bound personal section maps and conservative source-word maps
for the twelve exact Daruri A4 base PDFs.

An English/Arabic source segment is mapped only when the entire normalized
canonical segment has a UNIQUE, token-boundary-aligned match in PDF-extracted
words inside its certified section bounds. Native word rectangles are used,
never inferred. Unmatched/cross-ordered text is omitted and safely falls back
to the section pin in the browser. The 120 apparatus PDFs retain these exact
source pages/words, as verified by audit_word_geometry.py.
"""
from __future__ import annotations
from pathlib import Path
from collections import defaultdict, Counter
import hashlib, json, re, unicodedata, argparse
import fitz

ROOT=Path(__file__).resolve().parents[1]
ED=ROOT/"editions"
OUT=ED/"maps"
SOURCE=ROOT/"edition-r3-20261020.js"
MATCH=re.search(r'textContent\s*=\s*("(?:[^"\\]|\\.)*")\s*;',SOURCE.read_text(encoding="utf8"),re.S)
if not MATCH:raise RuntimeError("Missing canonical 258-section source payload")
BOOK=json.loads(json.loads(MATCH.group(1)))
SECTIONS={str(s["id"]):s for s in BOOK["sections"] if str(s.get("id","")).isdigit()}
assert len(SECTIONS)==258

def digest(raw:bytes)->str:return hashlib.sha256(raw).hexdigest()
def clean(s:str)->str:
    s=unicodedata.normalize("NFKD",str(s)).casefold()
    # Preserve only letters and numbers, like browser sourceMatch(). Diacritics
    # are deliberately ignored for matching, never for the saved literal token.
    return "".join(ch for ch in s if unicodedata.category(ch)[0] in "LN" and
                   unicodedata.category(ch)!="Mn")
def languages(language):
    if language=="english":return [("en","en")]
    if language=="arabic":return [("ar","ar")]
    if language=="arabic-vowelled":return [("vocalized","ar")]
    if language=="bilingual":return [("en","en"),("vocalized","ar")]
    if language=="bilingual-unvowelled":return [("en","en"),("ar","ar")]
    raise ValueError(language)
def appropriate(word,lang):
    if lang=="en":return bool(re.search(r"[A-Za-zÀ-ž0-9]",word))
    return bool(re.search(r"[\u0600-\u08FF0-9]",word))
def position(raw):
    page=raw.get("page")
    xy=raw.get("to")
    if not isinstance(page,int) or xy is None:raise ValueError("No exact named destination")
    x,y=(float(xy[0]),float(xy[1])) if isinstance(xy,(list,tuple)) else (float(xy.x),float(xy.y))
    return {"page":page+1,"x":round(x,2),"y":round(y,2)}
def tokens_in_section(all_words,n,anchors,lang):
    start=anchors[f"section-{n}"]
    end=anchors.get(f"section-{n+1}")
    first=start["page"]; last=end["page"] if end else len(all_words)
    if last<first:raise ValueError("Non-monotonic section page order")
    result=[]
    for number in range(first,last+1):
        if number>len(all_words):break
        for w in all_words[number-1]:
            x0,y0,x1,y1,token,*_=w
            if number==first and y1 < start["y"]-3:continue
            if end and number==last and y0 >= end["y"]-1:continue
            if not appropriate(token,lang):continue
            if not x0<x1 or not y0<y1:continue
            result.append([token,number,round(x0,2),round(y0,2),round(x1,2),round(y1,2)])
    return result
def mapped_segment(candidate,source):
    target=clean(source)
    if len(target)<12:return None
    ranges=[];joined=""
    for w in candidate:
        token=clean(w[0])
        if not token:continue
        start=len(joined);joined+=token
        ranges.append((start,len(joined),w))
    if not joined:return None
    matches=[];i=0
    while (pos:=joined.find(target,i))!=-1:
        end=pos+len(target)
        spans=[(lo,hi,w) for lo,hi,w in ranges if hi>pos and lo<end]
        # Disallow word fragments: source words must match whole PDF tokens.
        if spans and spans[0][0]==pos and spans[-1][1]==end:
            words=[w for _,_,w in spans]
            if clean("".join(w[0] for w in words))==target:
                matches.append(words)
        i=pos+1
        if len(matches)>1:break
    return matches[0] if len(matches)==1 else None

def create_map(row):
    file=ED/row["file"]
    content=file.read_bytes()
    if digest(content)!=row["sha256"] or len(content)!=row["bytes"]:
        raise ValueError("Base edition checksum or byte length changed: "+row["file"])
    with fitz.open(file) as doc:
        names=doc.resolve_names()
        anchors={f"section-{i}":position(names[f"section-{i}"]) for i in range(1,259)}
        if any(i["page"]<1 or i["page"]>doc.page_count for i in anchors.values()):
            raise ValueError("Section destinations outside document")
        page_words=[page.get_text("words",sort=False) for page in doc]
        mapped={};candidate_counts=Counter()
        for n in range(1,259):
            section=SECTIONS[str(n)]
            for language,script in languages(row["language"]):
                candidate=tokens_in_section(page_words,n,anchors,script)
                for segment,source in enumerate(section["segments"]):
                    key=f"{n}:{segment}:{language}"
                    match=mapped_segment(candidate,source[language])
                    candidate_counts[language]+=1
                    if match:
                        # Revalidate each native word and page rectangle.
                        for w in match:
                            if w[1]<1 or w[1]>doc.page_count:raise ValueError("Bad page")
                            if not (0<=w[2]<w[4]<=doc[w[1]-1].rect.width+1
                                    and 0<=w[3]<w[5]<=doc[w[1]-1].rect.height+1):
                                raise ValueError("Bad native word geometry")
                        mapped[key]=match
        report={lang:{"matched":sum(k.endswith(":"+lang) for k in mapped),
                     "eligible":candidate_counts[lang]} for lang in candidate_counts}
        base=row["file"].split("/")[-1]
        fsha=row["sha256"]
        mapping={
            "filename":base,"source_sha256":fsha,"base_sha256":fsha,
            "section_count":258,"coverage":1.0,
            "anchors":anchors,"section_pages":{str(i):anchors[f"section-{i}"]["page"] for i in range(1,259)},
            "entry_positions":{"terms":{},"applications":{},"concordance":{}},
            "entry_count":0,
            "precision":"Certified exact full-segment source/PDF token matches only; all other selections fall back to section",
            "word_map_present":bool(mapped),"word_map_coverage":report,
            "segments":mapped
        }
        meta={
            "filename":base,"sha256":fsha,"base_sha256":fsha,
            "pages":doc.page_count,"section_pages":mapping["section_pages"],"anchors":anchors,
            "verified_sections":258,"map_coverage":1.0,
            "word_map_present":bool(mapped),"word_map_coverage":report,
            "map_type":"verified-base-section-destinations-and-conservative-word-matches"
        }
    stem=OUT/(base+".json")
    data=json.dumps(mapping,ensure_ascii=False,separators=(",",":"))+"\n"
    stem.write_text(data,encoding="utf8")
    (OUT/(base+".metadata.json")).write_text(json.dumps(meta,ensure_ascii=False,separators=(",",":"))+"\n")
    return {
        "file":row["file"],"sha256":fsha,"pages":row["pages"],
        "map_file":"maps/"+base+".json","metadata_file":"maps/"+base+".metadata.json",
        "map_sha256":digest(data.encode("utf8")),
        "source_base":row["file"],"base_sha256":fsha,
        "verified_sections":258,"map_coverage":1.0,
        "word_map_present":bool(mapped),"word_map_coverage":report,
        "mapped_segments":len(mapped)
    }
def main():
    arg=argparse.ArgumentParser()
    arg.add_argument("--check",action="store_true")
    args=arg.parse_args()
    OUT.mkdir(parents=True,exist_ok=True)
    master=json.loads((ED/"manifest.json").read_text())
    if master["status"]!="verified" or len(master["files"])!=12:
        raise ValueError("Expected twelve verified A4 bases")
    rows=[create_map(row) for row in master["files"]]
    output={"release":"20261022-base-personal-word-maps","status":"verified",
            "source_manifest_sha256":digest((ED/"manifest.json").read_bytes()),
            "note":"Per-edition checksum-bound section destinations and strictly matched word segments. Partial word coverage is expected and falls back to sections.",
            "files":rows}
    out=OUT/"manifest.json"
    encoded=json.dumps(output,ensure_ascii=False,indent=2)+"\n"
    if args.check:
        assert out.exists() and out.read_text(encoding="utf8")==encoded
    else:out.write_text(encoded,encoding="utf8")
    for row in rows:print("MAP",row["file"],"word segments",row["mapped_segments"],row["word_map_coverage"],flush=True)
    print("PASS: 12/12 base PDF maps, verified 258 section destinations and conservative source-word correspondence",flush=True)
if __name__=="__main__":main()
