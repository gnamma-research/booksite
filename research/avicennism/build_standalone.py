"""Build the exact single-file NAMA reader preserving literal JavaScript.

Run: python research/avicennism/build_standalone.py
Validate only: python research/avicennism/build_standalone.py --check

Unlike JavaScript String.replace with a string replacement, Python's literal
str.replace does not interpret '$$' and corrupt the JavaScript '$$' selector.
"""
from __future__ import annotations
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parent
ASSETS=["corpus-primary.js","corpus-analysis.js","reader-foundation.js",
        "reader-pages.js","reader-extras.js","reader.js"]

def build()->str:
    page=(ROOT/"index.html").read_text(encoding="utf-8")
    css=(ROOT/"reader.css").read_text(encoding="utf-8")
    assert '<link rel="stylesheet" href="reader.css">' in page
    page=page.replace('<link rel="stylesheet" href="reader.css">',"<style>\n"+css+"\n</style>",1)
    for file in ASSETS:
        tag=f'<script src="{file}" defer></script>'
        assert tag in page, f"Missing script reference {file}"
        js=(ROOT/file).read_text(encoding="utf-8")
        page=page.replace(tag,"<script>\n"+js.replace("</script","<\\/script")+"\n</script>",1)
    assert page.count("<script>")==len(ASSETS)
    assert "const D=V.data,$=V.$,$$=V.$$;" in page
    assert "window.AVICENNIAN_CORPUS=" in page
    assert len(page.encode("utf-8"))>400000
    return page

if __name__=="__main__":
    html=build()
    out=ROOT/"standalone.html"
    if "--check" in sys.argv:
        assert out.read_text(encoding="utf-8")==html, "Standalone drifted from canonical source"
        print("Standalone matches all six scripts byte-for-byte")
    else:
        out.write_text(html,encoding="utf-8")
        print(f"Built {out}, {out.stat().st_size} bytes")
