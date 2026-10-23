#!/usr/bin/env python3
"""Publish precise Arabic Study base maps and independent Reference Pango
sidecar only after pixel-identical published PDF reconstruction and 414 source
segment agreement. Never rewrite PDFs or the legacy Reference annotations.
"""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[1]
ED=ROOT/"editions"
OUT=ROOT/"qa"/"study-reference-pango-report"
SIDE=ROOT/"personal-source-pango-maps"
def sha(b):return hashlib.sha256(b).hexdigest()
def load(name):return json.loads((OUT/name).read_text())
def main():
    bas=json.loads((ED/"manifest.json").read_text())
    manifest_path=ED/"maps"/"manifest.json"
    maps=json.loads(manifest_path.read_text())
    canonical=json.loads((ROOT/"pdf-editions-manifest.json").read_text())
    assert bas["status"]==maps["status"]=="verified"
    assert len(bas["files"])==len(maps["files"])==12
    approved={x["file"]:x for x in bas["files"]}
    changed=[]
    for title in ("off","on"):
        word=load("study"+("-editorial" if title=="on" else "")+".words.json")
        rel=f"study/daruri-study-bilingual-titles-{title}.pdf"
        assert word["file"]=="editions/"+rel
        assert word["pixel_parity"] and word["source_segments"]==414
        assert word["page_count"]==approved[rel]["pages"]
        assert word["sha256"]==approved[rel]["sha256"]==sha((ED/rel).read_bytes())
        row=next(r for r in maps["files"] if r["file"]==rel)
        assert row["sha256"]==word["sha256"]==row["base_sha256"]
        old=ED/row["map_file"]; metadata=ED/row["metadata_file"]
        assert sha(old.read_bytes())==row["map_sha256"]
        data=json.loads(old.read_text());meta=json.loads(metadata.read_text())
        assert data["source_sha256"]==word["sha256"]==meta["sha256"]
        assert data["section_count"]==258 and len(data["section_pages"])==258
        assert len(word["segments"])==414
        for key,words in word["segments"].items():
            assert key.endswith(":vocalized") and words
            if key in data["segments"] and data["segments"][key]!=words:
                raise RuntimeError("Previous Arabic Study mapping differs "+key)
            for v in words:
                assert len(v)==6 and 1<=v[1]<=word["page_count"]
                assert 0<=v[2]<v[4]<=596 and 0<=v[3]<v[5]<=843
            data["segments"][key]=words
        data["word_map_present"]=True
        data["word_map_coverage"]["vocalized"]={"matched":414,"eligible":414}
        data["word_geometry_method"]="PangoLayout original p TextBox, excluded publisher <a> note-call glyphs"
        data["precision"]="Authorial Arabic Pango word coordinates independently pixel-matched to published Study PDF. Ambiguous/multipage selections fail closed."
        meta["word_map_present"]=True
        meta["word_map_coverage"]["vocalized"]={"matched":414,"eligible":414}
        meta["map_type"]="verified-source-Pango-study-Arabic"
        serialized=json.dumps(data,ensure_ascii=False,separators=(",",":"))+"\n"
        old.write_text(serialized)
        metadata.write_text(json.dumps(meta,ensure_ascii=False,separators=(",",":"))+"\n")
        row["mapped_segments"]=len(data["segments"])
        row["word_map_present"]=True
        row["word_map_coverage"]["vocalized"]={"matched":414,"eligible":414}
        row["map_sha256"]=sha(serialized.encode())
        changed.append({"file":rel,"Arabic_segments":414,"Arabic_words":word["word_count"]})
    maps["release"]="20261022-Daruri-study-reference-Arabic-Pango"
    maps["note"]="All 12 approved Reading/Study source maps retained. Eight Reading and two bilingual Study editions have Arabic Pango source-word geometry with pixel-identical published pages; canonical Reference uses an independent certified sidecar map. The English word maps are preserved."
    manifest_path.write_text(json.dumps(maps,ensure_ascii=False,indent=2)+"\n")
    record=load("reference.words.json")
    source=ROOT/"daruri.pdf"
    assert record["file"]=="daruri.pdf"
    assert record["sha256"]==canonical["files"]["daruri.pdf"]["sha256"]==sha(source.read_bytes())
    assert record["page_count"]==canonical["files"]["daruri.pdf"]["pages"]==243
    assert record["source_segments"]==len(record["segments"])==414
    assert record["pixel_parity"] is True
    SIDE.mkdir(exist_ok=True)
    data={"file":"daruri.pdf","source_sha256":record["sha256"],
        "language":"vocalized","word_map_present":True,
        "section_count":258,"coverage":1.0,
        "word_map_coverage":{"vocalized":{"matched":414,"eligible":414}},
        "word_geometry_method":"PangoLayout original Arabic p TextBox excluding publisher note markers",
        "segments":record["segments"]}
    encoded=json.dumps(data,ensure_ascii=False,separators=(",",":"))+"\n"
    filename=SIDE/"daruri.pdf.json"
    filename.write_text(encoded)
    spec={"status":"verified","release":"20261022-reference-Pango-Arabic",
          "files":[{"file":"daruri.pdf","source_sha256":record["sha256"],
                    "map_file":"daruri.pdf.json","map_sha256":sha(encoded.encode()),
                    "word_map_present":True,"source_sections":258,
                    "matched_segments":414,"word_count":record["word_count"],
                    "pixel_identical_pages":243}]}
    (SIDE/"manifest.json").write_text(json.dumps(spec,ensure_ascii=False,indent=2)+"\n")
    print("PASS published 2 Study Pango word maps and 1 checksum-bound canonical Reference sidecar",
          json.dumps(changed),flush=True)
if __name__=="__main__":main()
