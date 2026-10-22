#!/usr/bin/env python3
"""Merge ONLY eight pixel-certified Arabic source-word maps into the existing
12 A4 personal maps. Preserve every PDF and all other map records unchanged."""
from pathlib import Path
import json, hashlib
ROOT=Path(__file__).resolve().parents[1]
ED=ROOT/"editions"
SOURCE=ROOT/"qa"/"arabic-pango-probe"
def sha(b):return hashlib.sha256(b).hexdigest()
def main():
    catalog=ED/"maps"/"manifest.json"
    base=ED/"manifest.json"
    current=json.loads(catalog.read_text())
    originals=json.loads(base.read_text())
    assert current["status"]==originals["status"]=="verified"
    assert len(current["files"])==len(originals["files"])==12
    by_path={e["file"]:e for e in originals["files"]}
    expected={
        f"reading/daruri-reading-{mode}-titles-{suffix}.pdf"
        for mode in ("arabic","arabic-vowelled","bilingual","bilingual-unvowelled") for suffix in ("on","off")
    }
    proposals={}
    for filename in expected:
        source=SOURCE/(Path(filename).name+".wordmap.json")
        entry=json.loads(source.read_text())
        assert entry["file"]==filename
        assert entry["source_sha256"]==by_path[filename]["sha256"]
        assert entry["matched_segments"]==414 and entry["source_sections"]==258
        assert entry["pixel_parity"] is True
        assert entry["page_count"]==by_path[filename]["pages"]
        language=entry["language"]
        assert entry["language"]==language
        segments=entry["segments"]
        assert len(segments)==414
        for key,words in segments.items():
            assert key.endswith(":"+language) and len(words)>=1
            for word in words:
                assert len(word)==6 and isinstance(word[0],str)
                assert 1<=word[1]<=entry["page_count"]
                assert 0<=word[2]<word[4]<596 and 0<=word[3]<word[5]<843
        proposals[filename]=entry
    altered=[]
    for meta in current["files"]:
        name=meta["file"]
        if name not in proposals:continue
        proposal=proposals[name]
        approved=by_path[name]
        assert meta["sha256"]==approved["sha256"]==meta["base_sha256"]
        assert meta["verified_sections"]==258 and meta["map_coverage"]==1
        pdf=ED/name
        assert sha(pdf.read_bytes())==approved["sha256"]
        map_path=ED/meta["map_file"]
        info_path=ED/meta["metadata_file"]
        assert sha(map_path.read_bytes())==meta["map_sha256"]
        data=json.loads(map_path.read_text())
        info=json.loads(info_path.read_text())
        assert data["source_sha256"]==approved["sha256"]==info["sha256"]
        assert data["section_count"]==258 and len(data["anchors"])==258
        assert len(data["section_pages"])==258
        fields=proposal["segments"]
        for key,words in fields.items():
            existing=data["segments"].get(key)
            if existing is not None and existing!=words:
                raise RuntimeError("Existing Arabic word coordinates disagree; refusing overwrite: "+key)
            data["segments"][key]=words
        data["word_map_present"]=True
        data["word_map_coverage"][proposal["language"]]={"matched":414,"eligible":414}
        data["precision"]="Authoritative Arabic/Pango source-text word rectangles; 100% pixel parity to the published PDF. Ambiguous or multi-page selections fail closed."
        data["word_geometry_method"]="PangoLayout.index_to_pos on original unchanged TextBox"
        info["word_map_present"]=True
        info["word_map_coverage"][proposal["language"]]={"matched":414,"eligible":414}
        info["map_type"]="verified-source-Pango-word-geometry"
        serialized=json.dumps(data,ensure_ascii=False,separators=(",",":"))+"\n"
        map_path.write_text(serialized)
        info_path.write_text(json.dumps(info,ensure_ascii=False,separators=(",",":"))+"\n")
        meta["word_map_present"]=True
        meta["word_map_coverage"][proposal["language"]]={"matched":414,"eligible":414}
        meta["mapped_segments"]=len(data["segments"])
        meta["map_sha256"]=sha(serialized.encode())
        altered.append({"file":name,"words":sum(len(v) for v in fields.values()),"segments":len(fields)})
    assert len(altered)==8
    current["release"]="20261022-A4-Arabic-Pango-precise-word-maps"
    current["note"]="All twelve checksum-bound base maps preserved. Eight Arabic-bearing Reading editions have 414 source-linked Pango segments and pixel-identical published pages. Study PDF Arabic precision is not yet verified."
    catalog.write_text(json.dumps(current,ensure_ascii=False,indent=2)+"\n")
    print("PASS: Updated exact maps for eight Arabic-bearing Reading PDFs:",json.dumps(altered,ensure_ascii=False),flush=True)
if __name__=="__main__":main()
