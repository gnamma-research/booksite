"""Build source-context browser data from canonical scholarly JSON, without guessing links.

Run: python research/avicennism/build_apparatus.py
Verify drift: python research/avicennism/build_apparatus.py --check
"""
from __future__ import annotations
import json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent
context=json.loads((ROOT/"argument-context.json").read_text(encoding="utf-8"))
links=json.loads((ROOT/"argument-links.json").read_text(encoding="utf-8"))
assert len(context["tradition"]["families"])>=16
assert len(links["debates"])==10
assert len(links["domainEvidence"])==20
result="window.AVICENNIAN_APPARATUS="+json.dumps({"context":context,"links":links},ensure_ascii=False,separators=(",",":")).replace("<","\\u003c")+";\n"
out=ROOT/"argument-apparatus.js"
if "--check" in sys.argv:
    assert out.read_text(encoding="utf-8")==result,"Browser apparatus differs from context and source-link registers"
    print("Apparatus derived from exact source contexts and explicit links: PASS")
else:
    out.write_text(result,encoding="utf-8")
    print(f"Wrote {out} ({len(result)} Unicode characters)")
