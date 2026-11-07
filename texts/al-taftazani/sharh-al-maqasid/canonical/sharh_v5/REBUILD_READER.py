#!/usr/bin/env python3
"""Rebuild the recovered 4 Nov 2026 Sharh al-Maqasid HTML reader from
its archived original shell and all seventeen lossless structured parts.

Run from any directory after checking out the research branch:
  python texts/al-taftazani/sharh-al-maqasid/canonical/sharh_v5/REBUILD_READER.py
No network, third-party packages, or NLP calls required.
"""
from pathlib import Path
import json, sys

ROOT=Path(__file__).resolve().parent
def read(p):
    return (ROOT/p).read_text(encoding="utf-8")
def jread(p):
    return json.loads(read(p))
manifest=jread("MANIFEST.json")
parts=manifest["unit_parts"]
assert len(parts)==17, "Missing a Sharh unit part"
units=[]
for spec in parts:
    path=spec["path"]
    data=jread(path)
    assert len(data)==spec["count"], f"Wrong length for {path}"
    assert data[0]["id"]==spec["first"] and data[-1]["id"]==spec["last"], path
    units.extend(data)
assert len(units)==851, f"Expected 851 records; found {len(units)}"
assert len({u["id"] for u in units})==851, "Duplicate unit IDs"
notes=jread("notes.json")
apparatus=jread("apparatus.json")
assert len(notes)==235 and len(apparatus)==81, "Missing notes/apparatus"
payload=dict(units=units,notes=notes,apparatus=apparatus,
    glossary=jread("glossary.json"),
    terminal_matn_appendix=jread("terminal_matn_appendix.json"))
# Match the original meaning and data shape; JSON whitespace/escaping may
# differ from the historical source file and is not claimed byte-identical.
new_html=read("reader_before_data.htmlfrag")
new_html+=json.dumps(payload,ensure_ascii=False,separators=(",",":"))
new_html+=read("reader_after_data.htmlfrag")
output=ROOT/"RECONSTRUCTED_CUMULATIVE_SHARH_READER.html"
output.write_text(new_html,encoding="utf-8")
print(f"Rebuilt {output.name}: {len(units)} units, {len(notes)} notes, {len(apparatus)} apparatus; {len(new_html)} characters")
