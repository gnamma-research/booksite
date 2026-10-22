#!/usr/bin/env python3
"""Fail-closed release audit of every apparatus PDF and its personal-note map."""
from __future__ import annotations
import hashlib, json, argparse
from itertools import combinations
from pathlib import Path
import fitz

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"editions"
APP=BASE/"apparatus"

def sha(path:Path)->str:return hashlib.sha256(path.read_bytes()).hexdigest()

def verify(root:Path=APP):
    manifest=json.loads((root/"manifest.json").read_text())
    assert manifest["status"]=="verified"
    assert len(manifest["files"])==120
    assert manifest["source_a4_manifest_sha256"]==sha(BASE/"manifest.json")
    originals=json.loads((BASE/"manifest.json").read_text())
    originals={row["file"]:row for row in originals["files"]}
    expected={
        (tier, language, editorial, components)
        for tier, languages in (
            ("reading", ("bilingual", "bilingual-unvowelled", "english")),
            ("study", ("bilingual",))
        )
        for language in languages for editorial in (False, True)
        for count in range(1,5)
        for components in combinations(("glossary","index","concordance","applications"), count)
    }
    assert len(expected)==120
    observed=set()
    seen=set()
    for f in manifest["files"]:
        key=(f["tier"], f["language"], f["editorial_titles"], tuple(f["apparatus"]))
        assert key in expected and key not in observed, "Missing, duplicated or unsupported profile: "+repr(key)
        observed.add(key)
        suffix="on" if f["editorial_titles"] else "off"
        assert f["source_base"] == (
            f'{f["tier"]}/daruri-{f["tier"]}-{f["language"]}-titles-{suffix}.pdf'
        )
        assert f["scope"]=="full" and f["layout"]=="parallel" and f["density"]=="standard"
        assert f["notes"]==("selected" if f["tier"]=="study" else "none")
        name=Path(f["file"]).name
        assert f["file"]=="apparatus/"+name and name not in seen
        seen.add(name)
        pdf_file=root/name
        assert pdf_file.exists() and sha(pdf_file)==f["sha256"]
        assert pdf_file.stat().st_size==f["bytes"]
        source=BASE/f["source_base"]
        base=originals[f["source_base"]]
        assert sha(source)==base["sha256"]==f["base_sha256"]
        map_file=root/"maps"/(name+".json")
        metadata_file=root/"maps"/(name+".metadata.json")
        assert map_file.exists() and metadata_file.exists()
        assert sha(map_file)==f["map_sha256"]
        data=json.loads(map_file.read_text())
        meta=json.loads(metadata_file.read_text())
        assert data["source_sha256"]==f["sha256"]==meta["sha256"]
        assert data["base_sha256"]==base["sha256"]==meta["base_sha256"]
        assert data["coverage"]==1 and len(data["section_pages"])==258
        assert len(data["anchors"])==258
        assert meta["verified_sections"]==258 and meta["word_map_present"] is False
        assert meta["map_type"]=="verified-section-destinations"
        assert meta["map_coverage"]==1.0
        positions=data.get("entry_positions",{})
        if "glossary" in f["apparatus"]:
            assert len(positions.get("terms",{}))>=153,"Glossary entry map incomplete"
        if "index" in f["apparatus"]:
            assert len(positions.get("terms",{}))>=151,"Index entry map incomplete"
        if "applications" in f["apparatus"]:
            assert len(positions.get("applications",{}))==28,"Bidāya application map incomplete"
        if "concordance" in f["apparatus"]:
            assert len(positions.get("concordance",{}))==258,"R/BA concordance map incomplete"
        assert data["entry_count"]==f["mapped_entries"]
        for family,items in positions.items():
            for label,dest in items.items():
                assert dest["page"]>f["base_pages"] and dest["page"]<=f["pages"],(family,label)
                assert 0<=dest["x"]<=596 and 0<=dest["y"]<=842,(family,label)
        with fitz.open(source) as basepdf,fitz.open(pdf_file) as combined:
            assert len(combined)==f["pages"]==meta["pages"]
            assert all(abs(p.rect.width-595.276)<1 and abs(p.rect.height-841.89)<1 for p in combined)
            assert len(basepdf)==f["base_pages"]==meta["base_pages"]
            assert len(combined)>len(basepdf)
            for i in range(len(basepdf)):
                assert hashlib.sha256(basepdf[i].get_text(sort=False).encode()).digest()==hashlib.sha256(combined[i].get_text(sort=False).encode()).digest(),(name,i+1)
            for n in range(1,259):
                dest=data["anchors"][f"section-{n}"]
                page=dest["page"]
                assert 1<=page<=len(basepdf)
                assert dest==meta["anchors"][f"section-{n}"]
                assert data["section_pages"][str(n)]==page
                assert combined[page-1].get_text().strip()
            for p in combined:
                for link in p.get_links():
                    if link.get("kind")==fitz.LINK_GOTO:
                        assert 0<=link["page"]<len(combined)
            for component,bounds in f["apparatus_pages"].items():
                assert component in ("glossary","index","concordance","applications")
                assert bounds["start_page"]>len(basepdf)
                assert len(basepdf)<bounds["end_page"]<=len(combined)
                assert combined[bounds["start_page"]-1].get_text().strip()
            # Retain both original and additional PDF table-of-contents entries.
            toc=combined.get_toc()
            assert len(toc)>=base["bookmarks"]+len(f["apparatus"])
            assert all(row[2]>=1 and row[2]<=len(combined) for row in toc)
        print("PASS",name,"pages",f["pages"],"hash",f["sha256"][:12],"258/258 verified source destinations",flush=True)
    assert observed==expected, "Every finite combination must have a verified PDF"
    print("PASS: verified 120 apparatus variants, 258 checksum-bound source destinations each and unchanged base PDF text",flush=True)

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--root",type=Path,default=APP)
    args=parser.parse_args()
    verify(args.root)
