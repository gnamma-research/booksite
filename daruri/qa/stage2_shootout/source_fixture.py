#!/usr/bin/env python3
"""Ground a bounded engine shootout in Daruri's canonical reader payload.

Never type sample Arabic by hand, read a PDF, or OCR the source. All seven
source checks use the SHA-pinned complete book and actual §65 note stress.
"""
import hashlib,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/"daruri"/"build"))
from build_editions import read_book

def main():
    source=ROOT/"daruri"/"edition-r3-20261020.js"
    book=read_book()
    sections=[s for s in book["sections"] if type(s.get("id")) is int and 1<=s["id"]<=258]
    assert [x["id"] for x in sections]==list(range(1,259))
    assert sum(len(s["segments"]) for s in sections)==414
    targets=[1,22,38,64,65,258]
    data={s["id"]:s for s in sections}
    sample=[]
    for sid in targets:
        s=data[sid]
        row=s["segments"][0]
        sample.append({
            "id":f"R{sid:03d}-P01","section":sid,
            "arabic":row["vocalized"],"arabic_unvowelled":row["ar"],"english":row["en"],
            "two_word":" ".join(row["vocalized"].split()[:2]),
            "first_word":row["vocalized"].split()[0]
        })
    stress="وَفِي أَلْفَاظِهِ"
    assert stress in " ".join(p["vocalized"] for p in data[65]["segments"])
    all_rows=[
      {"id":f"R{s['id']:03d}-P{k+1:02d}", "section":s["id"],
        "arabic":p["vocalized"],"arabic_unvowelled":p["ar"],"english":p["en"]}
      for s in sections for k,p in enumerate(s["segments"])]
    output={"schema":"gnamma-stage2-compiler-comparison-v1",
       "source_sha256":hashlib.sha256(source.read_bytes()).hexdigest(),
       "paragraphs":414,"sections":258,"sample":sample,
       "stress_phrase":stress,"all_source":all_rows,"test_note":"Synthetic same-page marker for native PDF acceptance, not an authorial note"}
    out=Path(sys.argv[1]);out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(output,ensure_ascii=False,indent=1)+"\n","utf8")
    print("STAGE2_CANONICAL_SOURCE",output["source_sha256"],
          "six_tests",len(sample),"all",len(all_rows),"out",str(out))
if __name__=="__main__":main()
