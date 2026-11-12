#!/usr/bin/env python3
"""Qawtaw18 check: current dispositions must reconcile exactly with older snapshots.

No claim of newly discovered medieval witness or independent specialist accuracy.
Read-only and stdlib-only, suitable for CI on a checked-out repository.
"""
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parent.parent

def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf8"))

def assigned(path):
    s = (ROOT / path).read_text(encoding="utf8")
    m = re.search(r"window\.GNAMMA_[A-Z0-9_]+\s*=\s*", s)
    assert m, path
    val, _ = json.JSONDecoder().raw_decode(s[m.end():].lstrip())
    return val

historical = load("qa/qawtaw5-unresolved-register.json")
witness = load("qa/qawtaw7-witness-register.json")["records"]
latest = load("qa/qawtaw10-final-status.json")["records"]
current = load("qa/qawtaw18-current-dispositions.json")
assert len(historical) == len(witness) == len(current["records"]) == 57
assert [x["id"] for x in historical] == [x["unit"] for x in witness]
assert [x["unit"] for x in witness] == [x["unit"] for x in current["records"]]
latest_by_id = {x["id"]: x for x in latest}
old_residual = {x["unit"] for x in witness if x["status"] not in ("supported-reading", "resolved-interpretation")}
assert len(old_residual) == len(latest_by_id) == 14
assert set(latest_by_id) == old_residual, "Qawtaw8-10 fourteen must be exactly the Qawtaw7 fourteen"
counts = {}
open_groups = []
for old, new in zip(witness, current["records"]):
    if old["status"] == "supported-reading":
        expected = "supported-working-reading"
    elif old["status"] == "resolved-interpretation":
        expected = "resolved-interpretation"
    else:
        expected = latest_by_id[old["unit"]]["currentStatus"]
    assert new["originalReviewStatus"] == old["status"], old["unit"]
    assert new["currentWorkingStatus"] == expected, old["unit"]
    assert not new["hasIndependentMedievalWitness"], old["unit"]
    counts[expected] = counts.get(expected, 0) + 1
    if expected in ("unresolved-negative", "unrecovered-lacuna"):
        open_groups.append(old["unit"])
assert counts == current["statusHistogram"]
assert sorted(open_groups) == ["QT-059", "SH-002"]
assert sum(counts.values()) == 57
assert 57 - len(open_groups) == 55
assert current["integrity"]["groupsWithWorkingInterpretationOrPreferredReading"] == 55
assert current["integrity"]["independentMedievalWitnessesCollated"] == 0
matn = assigned("data/units.js")["units"]
sharh = load("data/commentary-corpus.json")["units"]
assert len(matn) == 61 and len(sharh) == 110
assert "القطع ببطلان مسألة التوحيد" in next(x for x in sharh if x["id"] == "SH-002")["arabic"]
assert "وما قيل" in next(x for x in matn if x["id"] == "QT-059")["arabic"]
assert current["integrity"]["totalBilingualUnits"] == len(matn) + len(sharh) == 171
audit = (ROOT / "editorial/QAWTAW18_CURRENT_CRITICAL_DISPOSITION_2026-11-13.md").read_text(encoding="utf8")
assert "55" in audit and "37–73" in audit
assert "**exactly the same**" in audit
for html in ("index.html","commentary.html"):
    page = (ROOT / html).read_text(encoding="utf8")
    assert 'href="editorial/QAWTAW18_CURRENT_CRITICAL_DISPOSITION_2026-11-13.md"' in page
manifest = load("pdf/manifest.json")
release = load("qa/qawtaw16-final-acceptance.json")
assert len(manifest["files"]) == len(release["PDFs"]) == 5
for a, b in zip(manifest["files"], release["PDFs"]):
    p = ROOT / "pdf" / a["filename"]
    raw = p.read_bytes()
    assert a["filename"] == b["filename"]
    assert len(raw) == b["bytes"] == a["size_bytes"]
    assert hashlib.sha256(raw).hexdigest() == a["sha256"] == b["sha256"]
    assert a["pages"] == b["pages"]
print("Qawtaw18 PASS: 55 settled working groups, 2 source-critical, 171 bilingual units, five PDFs byte-matched.")
