"""Static, offline and scholarly-integrity checks for Late Avicennism reader."""
from __future__ import annotations
from html.parser import HTMLParser
from pathlib import Path
import json
import re

ROOT=Path(__file__).resolve().parents[1]
P=ROOT/"corpus-primary.js"
A=ROOT/"corpus-analysis.js"
HTML=ROOT/"index.html"
STAND=ROOT/"standalone.html"

def read_json_js(path:Path,prefix:str,suffix:str):
    text=path.read_text(encoding="utf-8")
    assert text.startswith(prefix),f"Unexpected {path} prefix"
    assert text.rstrip().endswith(suffix),f"Unexpected {path} suffix"
    return json.loads(text[len(prefix):].rstrip()[:-len(suffix)])

primary=read_json_js(P,"window.AVICENNIAN_CORPUS=",";")
extra=read_json_js(A,"window.AVICENNIAN_CORPUS=window.AVICENNIAN_CORPUS||{};\nObject.assign(window.AVICENNIAN_CORPUS,",");")
assert len(primary["records"])==18
assert sum(r["kind"]=="primary" for r in primary["records"])==6
assert sum(r["kind"]=="late" for r in primary["records"])==11
assert sum(r["kind"]=="mediated" for r in primary["records"])==1
assert len(extra["analysis"])==10
assert len(extra["themes"])==20
assert len(extra["debates"])==10
assert len(primary["unresolved"])>=11
allrecords=primary["records"]+extra["analysis"]
ids=[r["id"] for r in allrecords]
assert len(ids)==len(set(ids))==28
assert all(len(r["md"])>2000 for r in allrecords)
assert all(r["sourceFile"] for r in allrecords)
assert all(not r["manuscriptCollated"] for r in allrecords)
assert all(r["sourceUrl"].startswith("http") for r in allrecords)
assert all(set(t["records"]).issubset(set(ids)) for t in extra["themes"])
assert all(set(t["records"]).issubset(set(ids)) for t in extra["debates"])
assert len(set(t["id"] for t in extra["themes"]))==20
assert len(set(t["id"] for t in extra["debates"]))==10

class Parse(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids=[]
        self.scripts=[]
        self.links=[]
        self.actions=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get("id"):self.ids.append(a["id"])
        if tag=="script":self.scripts.append(a.get("src"))
        if tag=="link":self.links.append(a.get("href"))
        if a.get("data-action"):self.actions.append(a["data-action"])

p=Parse();p.feed(HTML.read_text(encoding="utf-8"))
assert len(p.ids)==len(set(p.ids))
assert p.scripts==["corpus-primary.js","corpus-analysis.js","reader-foundation.js","reader-pages.js","reader-extras.js","reader.js"]
assert "reader.css" in p.links
assert all((ROOT/s).is_file() for s in p.scripts)
assert {"menu","ar","en","focus","bookmark","share","search","settings"}.issubset(set(p.actions))
assert all(x in p.ids for x in ["navigation","main","pager","panel","notice","scrim"])
assert (ROOT/"NAMA_INTEGRATION.md").is_file()
assert (ROOT/"README.md").is_file()

html=STAND.read_text(encoding="utf-8")
assert html.startswith("<!doctype html>")
assert "corpus-primary.js" not in html or '<script src="corpus-primary.js"' not in html
assert html.count("<script>")==6
assert "Late Avicennism" in html
assert len(html)>400000
assert all(p in html for p in ['"kind":"mediated"','"id":"av-ix5"','"id":"lah-active"','"id":"ch10"'])
assert "iframe" not in html.lower()
assert "<link rel=\"stylesheet\"" not in html
print(json.dumps({
    "status":"STATIC PASS; no claim of primary manuscript collation",
    "historical_records":len(primary["records"]),
    "analytical_chapters":len(extra["analysis"]),
    "topics":len(extra["themes"]),
    "comparative_debates":len(extra["debates"]),
    "unresolved_witnesses":len(primary["unresolved"]),
    "standalone_bytes":STAND.stat().st_size
},ensure_ascii=False,indent=2))
