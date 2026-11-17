#!/usr/bin/env python3
"""Read-only verification of the preserved Nihayat4 recovery checkpoint.

This checks file identity and progress accounting, not scholarly correctness.
Run on the recovery checkout before resuming. Intentional later content changes
require a new checkpoint manifest; never reset newer work to satisfy this file.
"""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HIKMA = ROOT / "texts/al-tabatabai"
AUDITS = HIKMA / "audits"


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def main():
    failures = []
    state = read_json(AUDITS / "nihayat4-current-state.json")
    manifest = read_json(AUDITS / "recovery-stage9-2026-11-10/repo-file-manifest.json")
    for entry in manifest["files"]:
        path = ROOT / entry["path"]
        if not path.is_file():
            failures.append("Missing: " + entry["path"])
            continue
        raw = path.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        git_hash = hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()
        if len(raw) != entry["bytes"] or digest != entry["sha256"] or git_hash != entry["gitBlobSha"]:
            failures.append("Changed since recovery: " + entry["path"])

    books = {}
    for slug, expected in state["recovered"]["pairedUnitsByBook"].items():
        book = read_json(HIKMA / slug / "data/book.json")
        ids = [unit["id"] for unit in book["units"]]
        books[slug] = book
        if len(ids) != expected or len(set(ids)) != expected:
            failures.append("Unit count or duplicate IDs: " + slug)

    muzaffar_ids = {u["id"] for u in books["muzaffar-al-mantiq"]["units"]}
    required_v = {f"M-V-{i:02d}" for i in range(1, 41)}
    if not required_v.issubset(muzaffar_ids):
        failures.append("Recovered Book V is incomplete in this checkout")

    summary = read_json(AUDITS / "recovery-stage9-2026-11-10/summary.json")
    new_ids = []
    for suffix in "abc":
        report = read_json(AUDITS / f"recovery-stage9-2026-11-10/nihaya-external-{suffix}.json")
        new_ids.extend(u["id"] for u in report["units"] if u.get("status") in {
            "complete", "complete-full-unit-external-comparison"
        })
    all_ids = {u["id"] for u in books["nihayat-al-hikma"]["units"]}
    completed = set(new_ids) | {"N-IX-09"}
    remaining = all_ids - completed
    if len(new_ids) != 83 or len(set(new_ids)) != 83 or "N-IX-09" in new_ids:
        failures.append("Recovered comparison report accounting differs from 83 unique new units")
    if completed != set(summary["completedUnitIds"]) or remaining != set(summary["remainingUnitIds"]):
        failures.append("Completed/remaining comparison IDs disagree with summary")
    if len(completed) != 84 or len(remaining) != 52:
        failures.append("External comparison totals disagree with recovery checkpoint")

    index = read_json(HIKMA / "data/study-index.json")
    if len(index["links"]) != 34 or len(index["terms"]) != 147 or len(index["units"]) != 387:
        failures.append("Study index is not the recovered 387-unit/34-link/147-term version")

    print(json.dumps({
        "status": "failed" if failures else "passed",
        "scope": "Recovery file identity and accounting; not scholarly recollation or publication",
        "filesChecked": len(manifest["files"]),
        "contentCheckpoint": state["preservation"]["contentCommit"],
        "pairedUnits": {key: len(value["units"]) for key, value in books.items()},
        "recoveredExternalReports": len(new_ids),
        "cumulativeExternalRecords": len(completed),
        "remainingExternalComparisons": len(remaining),
        "failures": failures,
    }, ensure_ascii=False, indent=2))
    return bool(failures)


if __name__ == "__main__":
    sys.exit(main())
