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
assert len(primary["records"])==22
assert sum(r["kind"]=="primary" for r in primary["records"])==6
assert sum(r["kind"]=="late" for r in primary["records"])==15
assert sum(r["kind"]=="mediated" for r in primary["records"])==1
assert len(extra["analysis"])==10
assert len(extra["themes"])==20
assert len(extra["debates"])==10
assert len(primary["unresolved"])>=11
allrecords=primary["records"]+extra["analysis"]
ids=[r["id"] for r in allrecords]
assert len(ids)==len(set(ids))==32
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
assert p.scripts==["corpus-primary.js","corpus-analysis.js","argument-apparatus.js","reader-foundation.js","reader-pages.js","reader-extras.js","reader-context.js","reader-scope.js","reader.js"]
assert "reader.css" in p.links
assert all((ROOT/s).is_file() for s in p.scripts)
assert {"menu","ar","en","focus","bookmark","share","search","settings"}.issubset(set(p.actions))
assert all(x in p.ids for x in ["navigation","main","pager","panel","notice","scrim"])
assert (ROOT/"NAMA_INTEGRATION.md").is_file()
assert (ROOT/"README.md").is_file()

html=STAND.read_text(encoding="utf-8")
assert html.startswith("<!doctype html>")
assert "corpus-primary.js" not in html or '<script src="corpus-primary.js"' not in html
assert html.count("<script>")==9
assert "Late Avicennism" in html
assert len(html)>540000
assert all(p in html for p in ['"kind":"mediated"','"id":"av-ix5"','"id":"lah-active"','"id":"lah-making"','"id":"lah-unity"','"id":"ch10"'])
assert "window.AVICENNIAN_APPARATUS=" in html
assert "shared-exact-page-partial" in html
assert "post-asfar" in html
assert "iframe" not in html.lower()
assert "<link rel=\"stylesheet\"" not in html

# Stage 7: complete source context, historical-coverage honesty and explicit links.
context=json.loads((ROOT/"argument-context.json").read_text(encoding="utf-8"))
links=json.loads((ROOT/"argument-links.json").read_text(encoding="utf-8"))
history=json.loads((ROOT/"tradition-coverage.json").read_text(encoding="utf-8"))
assert len(context["records"])==22
assert set(context["records"])=={r["id"] for r in primary["records"]}
assert len(history["families"])>=16
assert len(links["debates"])==10
assert len(links["domainEvidence"])==20
assert len(history["references"])>=10
# Source context and comparative mappings must resolve to ACTUAL existing argument
# sections, rather than silently matching another keyword-similar paragraph.
def source_sections(md:str)->list[str]:
    import re
    lines=md.splitlines()
    sections=[]
    title="Edition and source status"
    acc=[]
    def push():
        if any(v.strip() for v in acc) or not sections:
            sections.append(title)
    for line in lines:
        match=re.match(r"^##\s+(.+)",line)
        if match:
            push()
            title=match.group(1)
            acc=[]
        elif not re.match(r"^# [^#]",line):
            acc.append(line)
    push()
    return sections

known_by_id={r["id"]:r for r in allrecords}
source_heading={r["id"]:source_sections(r["md"]) for r in allrecords}
for uid,entry in context["records"].items():
    assert uid in known_by_id, f"Unknown historical source {uid}"
    for idx in entry["sections"]:
        assert isinstance(idx,int) and 0<=idx<len(source_heading[uid]),(
            uid,idx,len(source_heading[uid]))
for qid,d in links["debates"].items():
    for step in d["sequence"]:
        rid,idx=step["recordId"],step["section"]
        assert isinstance(idx,int) and 0<=idx<len(source_heading[rid]),(
            qid,rid,idx,source_heading[rid])
for did,group in links["domainEvidence"].items():
    for item in group["direct"]+group["comparative"]:
        rid,idx=item["recordId"],item["section"]
        assert isinstance(idx,int) and 0<=idx<len(source_heading[rid]),(
            did,rid,idx,source_heading[rid])
assert source_heading["lah-eman-cont"][2].startswith("[p. 294]")
assert source_heading["lah-eman-cont"][5].startswith("[p. 297]")
assert source_heading["lah-element"][2].startswith("II.")
# The two previously omitted units MUST be in the embedded corpus as full
# contextual source documents, not empty pointers or external citations.
for uid,word in [("lah-making","apricot"),("lah-unity","natural universal"),("lah-eman-cont","Suhraward"),("lah-element","mixture")]:
    assert len(known_by_id[uid]["md"])>8500
    assert word.lower() in known_by_id[uid]["md"].lower()

assert sum(not f["recordIds"] for f in history["families"])>=5
assert [q for q in context["workSequence"][0]]==[
  "lah-making","lah-unity","lah-eman","lah-eman-cont","lah-element",
  "lah-active","lah-temporal","lah-divine"
]
assert context["protocol"]["noAutoKeywordPassages"] is True
assert "function defaultSection(" not in (ROOT/"reader-pages.js").read_text(encoding="utf-8")
assert "V.snip(excerpt" not in (ROOT/"reader-context.js").read_text(encoding="utf-8")
assert "Read the whole available argument" in (ROOT/"reader-context.js").read_text(encoding="utf-8")
assert "sourceContext(r)" in (ROOT/"reader-context.js").read_text(encoding="utf-8")
for record in primary["records"]:
    data=context["records"][record["id"]]
    for key in ("part","locator","question","immediatePrior","base","objections","reply",
                "continuation","extent","confidence","sourceVoice","missing","sections"):
        assert data.get(key), f"Missing contextual {key} for {record['id']}"
    assert data["sections"], f"No context sections for {record['id']}"
    assert record["sourceUrl"].startswith("http")
for name,dossier in links["debates"].items():
    assert len(dossier["sequence"])>=3
    assert dossier["question"] and dossier["scope"] and dossier["status"]
    for source in dossier["sequence"]:
        assert source["recordId"] in ids,(name,source["recordId"])
        assert isinstance(source["section"],int) and source["section"]>=0
        assert all(source.get(k) for k in ("role","relation","claim","why"))
for domain,info in links["domainEvidence"].items():
    assert domain in {d["id"] for d in extra["themes"]}
    assert info["gap"]
    for item in info["direct"]+info["comparative"]:
        assert item["recordId"] in ids
        assert item["section"]>=0
assert any(not v["direct"] for v in links["domainEvidence"].values())
assert any(r["kind"]=="mediated" for r in primary["records"])
assert "argument-apparatus.js" in HTML.read_text(encoding="utf-8")
assert "reader-context.js" in HTML.read_text(encoding="utf-8")
assert "reader-scope.js" in HTML.read_text(encoding="utf-8")
assert (ROOT/"build_apparatus.py").is_file()
assert (ROOT/"tradition-coverage.json").is_file()
assert (ROOT/"TAJRID_DEDUP_AND_POST_ASFAR_SCOPE.json").is_file()
assert (ROOT/"POST_ASFAR_DISTINCTIVE_DOSSIERS.json").is_file()

print(json.dumps({
    "status":"STATIC PASS; no claim of primary manuscript collation",
    "historical_records":len(primary["records"]),
    "analytical_chapters":len(extra["analysis"]),
    "topics":len(extra["themes"]),
    "comparative_debates":len(extra["debates"]),
    "unresolved_witnesses":len(primary["unresolved"]),
    "standalone_bytes":STAND.stat().st_size
},ensure_ascii=False,indent=2))
