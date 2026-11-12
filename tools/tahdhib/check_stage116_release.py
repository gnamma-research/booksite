#!/usr/bin/env python3
"""Stage116 source-evidence integrity and zero-false-certification checks."""
from pathlib import Path
from hashlib import sha256
import json,re
P=Path("texts/al-taftazani/tahdhib-al-mantiq/edition")
def j(name):return json.loads((P/name).read_text())
def sha(b):return sha256(b).hexdigest()
a=j("STAGE116_EVIDENCE_AND_GAP_LEDGER.json")
q=a["tables"]["Q309"]
expected_connected=["C/C","C/D","C/K","K/C","D/C","K/K","K/D","D/K","D/D"]
expected_disj=["C/C","C/K","C/D","K/K","D/K","D/D"]
assert q["connected_source_order"]==expected_connected,(q["connected_source_order"],expected_connected)
assert q["disjunctive_source_order"]==expected_disj
assert set(q["sourceExampleOmissionsWithinConnected"])=={"C/C","K/K","D/D"}
assert len(expected_connected)+len(expected_disj)==15
m=a["tables"]["Q300"]
s="".join(m["printed_status_codes"])
assert len(s)==32
assert {x:s.count(x) for x in "RUX"}=={"R":7,"U":16,"X":9}
assert a["tables"]["Q258"]["positions"]==49
assert a["tables"]["Q294"]["positions"]==105
assert a["tables"]["Q309"]["positions"]==15
assert sum(a["tables"][k]["positions"] for k in ("Q258","Q294","Q300","Q309"))==201
assert a["newWholePrintedPagesCertified"]==0 and a["newManuscriptCriticalVariants"]==0
assert a["modal46"]["newFullHistoricalModalProofsCertified"]==0
print("Source matrix classifications + Q309 true source order: PASS")
phot=j("source-table-excerpts/PRINT_IMAGE_MANIFEST_STAGE116.json")
assert len(phot["images"])==4
assert {x["printedPage"] for x in phot["images"]}=={258,294,300,309}
for x in phot["images"]:
    p=Path(x["publicationPath"]); assert p.is_file(),p
    b=p.read_bytes()
    assert b[:8]==b"\x89PNG\r\n\x1a\n"
    assert len(b)==x["bytes"] and sha(b)==x["sha256"],p
    assert a["tables"][f'Q{x["printedPage"]}']["file"]==str(p.relative_to(P))
print("Four cropped original source images + hashes: PASS")
r=(P/"STAGE116_PHOTOGRAPHIC_TABLE_READER.html").read_text()
start=r.index("<h3>Nine connected"); mid=r.index("<h3>Six disjunctive"); end=r.index("</table></div></div>",mid)
rx=r"<td><code>((?:C|K|D)/(?:C|K|D))</code></td>"
assert re.findall(rx,r[start:mid])==expected_connected
assert re.findall(rx,r[mid:end])==expected_disj
assert all(a["tables"][f"Q{x}"]["file"] in r for x in (258,294,300,309))
assert "HANDOFF_LATEST.md" in r
print("Reader labels, source order and photo URL consistency: PASS")
base=(P/"batches/hawashi-all-sections-cumulative-stage114.md").read_bytes()
full=(P/"batches/hawashi-all-sections-cumulative-stage116.md").read_bytes()
integrity=j("STAGE116_CUMULATIVE_FILE_INTEGRITY.json")
assert full.startswith(base)
assert sha(base)==integrity["canonicalSourceSHA256"]
assert sha(full)==integrity["outputSHA256"]
assert len(full)==integrity["outputByteCount"]
assert len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",full.decode()))==1090
for x in integrity["appended"]:
    t=Path(x["path"]).read_bytes()
    assert sha(t)==x["originalSHA256"],x["path"]
print("All 1090 original note headings and immutable source prefix: PASS")
print("Appended source audit SHA256 + full corpus integrity: PASS")
