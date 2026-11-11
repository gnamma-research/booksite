#!/usr/bin/env python3
"""Read a bounded Nihayat restart summary without replaying recovery work.

By default only the current-state and comparison-register JSON files are read.
No network, browser, PDF, historical report, source body or subprocess is opened.
The optional --check-text additionally checks the three current book JSON files.
This command never writes files or invokes another verification command.
"""

import argparse
import hashlib
import json
import re
from pathlib import Path


HIKMA = Path(__file__).resolve().parents[1]
ACTIVE_BRANCH = "nihayat-active"
BOOKS = {
    "muzaffar-al-mantiq": "muzaffar",
    "bidayat-al-hikma": "bidaya",
    "nihayat-al-hikma": "nihaya",
}
STAGES = {name: i for i, name in enumerate(
    ("I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"), 1)}


def read_object(path, problems):
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(value, dict):
            raise ValueError("top-level JSON must be an object")
        return value
    except (OSError, UnicodeError, ValueError) as exc:
        problems.append(f"Cannot read {path.name}: {str(exc)[:120]}. Restore this checkpoint file; do not reset source text.")
        return {}


def object_field(parent, name, problems):
    value = parent.get(name)
    if isinstance(value, dict):
        return value
    problems.append(f"Missing or invalid object: {name}.")
    return {}


def valid_count(value):
    return type(value) is int and value >= 0


def unit_order(identifier):
    if identifier == "N-INTRO":
        return (0, 0)
    match = re.fullmatch(r"N-([IVX]+)-(PRE|[0-9]{2})", identifier)
    if match and match[1] in STAGES:
        return (STAGES[match[1]], 0 if match[2] == "PRE" else int(match[2]))
    return None


def check_text_files(root, counts, rows, problems):
    for slug in BOOKS:
        book = read_object(root / slug / "data/book.json", problems)
        units = book.get("units")
        if not isinstance(units, list) or any(not isinstance(u, dict) for u in units):
            problems.append(f"Missing or invalid unit list: {slug}.")
            continue
        identifiers = [u.get("id") for u in units]
        if any(not isinstance(i, str) for i in identifiers):
            problems.append(f"Invalid unit identifier: {slug}.")
            continue
        if len(identifiers) != counts.get(slug) or len(set(identifiers)) != len(identifiers):
            problems.append(f"Actual unit count or unique IDs disagree with current state: {slug}.")
        if any(not isinstance(u.get(field), str) or not u[field].strip()
               for u in units for field in ("arabic", "english")):
            problems.append(f"Missing bilingual text: {slug}.")
        if slug == "muzaffar-al-mantiq":
            if not {f"M-V-{i:02d}" for i in range(1, 41)} <= set(identifiers):
                problems.append("Recovered Muzaffar Book V is incomplete; preserve and reconcile saved work.")
        if slug != "nihayat-al-hikma":
            continue
        if identifiers != [r.get("unitID") for r in rows]:
            problems.append("Register IDs/order disagree with the actual Nihaya book.")
        by_id = {u["id"]: u for u in units}
        for row in rows:
            if row.get("findingsIncorporated") is not True:
                continue
            unit = by_id.get(row.get("unitID"), {})
            for field, hash_key in (("arabic", "currentArabicSha256"), ("english", "currentEnglishSha256")):
                body = unit.get(field)
                if not isinstance(body, str) or hashlib.sha256(body.encode("utf-8")).hexdigest() != row.get(hash_key):
                    problems.append(f"Integrated {field} hash differs: {row.get('unitID')}. Reconcile before editing; never overwrite newer text.")


def inspect_checkpoint(root=HIKMA, check_text=False):
    """Return (small JSON-compatible result, exit status), without side effects."""
    root = Path(root)
    problems = []
    state = read_object(root / "audits/nihayat4-current-state.json", problems)
    register = read_object(root / "audits/nihaya-external-comparison-register.json", problems)
    current = object_field(state, "current", problems)
    preservation = object_field(state, "preservation", problems)
    next_work = object_field(state, "nextWork", problems)
    published = object_field(state, "published", problems)
    counts = object_field(current, "pairedUnitsByBook", problems)
    summary = object_field(register, "summary", problems)

    if preservation.get("branch") != ACTIVE_BRANCH:
        problems.append("Stale continuation branch: use the saved nihayat-active checkpoint; preserve this checkout before switching.")
    checkpoint = preservation.get("contentCommit")
    if not isinstance(checkpoint, str) or not re.fullmatch(r"[0-9a-fA-F]{40}", checkpoint):
        problems.append("Missing/invalid preservation.contentCommit: record the verified 40-character source commit before continuing.")
        checkpoint = None
    if set(counts) != set(BOOKS) or any(not valid_count(counts.get(slug)) for slug in BOOKS):
        problems.append("pairedUnitsByBook must contain nonnegative integer counts for all three books.")
    total_units = sum(counts.get(slug, 0) for slug in BOOKS if valid_count(counts.get(slug)))
    if not valid_count(current.get("combinedUnits")) or current.get("combinedUnits") != total_units:
        problems.append("combinedUnits does not equal the sum of the three current book counts.")

    raw_rows = register.get("units")
    rows = raw_rows if isinstance(raw_rows, list) and all(isinstance(r, dict) for r in raw_rows) else []
    if rows is not raw_rows:
        problems.append("Comparison register has no valid units list.")
    ids = [r.get("unitID") for r in rows]
    valid_ids = all(isinstance(i, str) and unit_order(i) is not None for i in ids)
    if not valid_ids:
        problems.append("Comparison register contains an invalid Nihaya unit ID.")
    elif len(set(ids)) != len(ids):
        problems.append("Comparison register contains duplicate unit IDs.")
    elif ids != sorted(ids, key=unit_order):
        problems.append("Comparison register is not in authorial unit order.")
    if len(rows) != counts.get("nihayat-al-hikma"):
        problems.append("Comparison-register size disagrees with the current Nihaya unit count.")
    if any(type(r.get(key)) is not bool for r in rows for key in ("comparisonComplete", "findingsIncorporated")):
        problems.append("Comparison and incorporation flags must be true/false for every unit.")
    if any(r.get("findingsIncorporated") is True and r.get("comparisonComplete") is not True for r in rows):
        problems.append("An incorporated unit has no completed external comparison.")
    compared = sum(r.get("comparisonComplete") is True for r in rows)
    incorporated = sum(r.get("findingsIncorporated") is True for r in rows)
    awaiting_incorporation = [r.get("unitID") for r in rows
                             if r.get("comparisonComplete") is True and r.get("findingsIncorporated") is not True]
    pending = [r.get("unitID") for r in rows if r.get("comparisonComplete") is not True]
    for key, value in (("total", len(rows)), ("compared", compared), ("incorporated", incorporated), ("remaining", len(pending))):
        if not valid_count(summary.get(key)) or summary.get(key) != value:
            problems.append(f"Stale register summary: {key}.")
    for key, value in (("nihayaExternalComparisonRecords", compared),
                       ("nihayaExternalComparisonsIntegrated", incorporated),
                       ("nihayaExternalComparisonsRemaining", len(pending))):
        if not valid_count(current.get(key)) or current.get(key) != value:
            problems.append(f"Stale current-state count: {key}.")
    queue = next_work.get("remainingExternalUnitIds")
    if not isinstance(queue, list) or any(not isinstance(i, str) for i in queue):
        problems.append("Remaining comparison queue must be a list of unit IDs.")
    else:
        if len(set(queue)) != len(queue):
            problems.append("Remaining comparison queue contains duplicate IDs.")
        if queue != pending:
            problems.append("Remaining queue differs from the register's ordered pending units; do not replay completed units.")
    next_id = pending[0] if pending and isinstance(pending[0], str) else None
    if next_work.get("firstNewExternalComparison") != next_id:
        problems.append("firstNewExternalComparison is not the first pending unit (or null when all are complete).")

    if check_text and valid_ids:
        check_text_files(root, counts, rows, problems)
    problems = list(dict.fromkeys(problems))
    next_task = None
    if not problems:
        if awaiting_incorporation:
            next_task = {
                "kind": "incorporate_saved_comparison",
                "unit": awaiting_incorporation[0],
                "action": "Incorporate the saved comparison before continuing new comparisons; save each completed unit or coherent batch.",
            }
        elif next_id:
            next_task = {
                "kind": "new_comparison",
                "unit": next_id,
                "action": "Continue from this unit; save each completed unit or coherent batch.",
            }
        else:
            next_task = {
                "kind": "review_and_release",
                "unit": None,
                "action": "No new comparisons remain; follow the saved review and release queue.",
            }
    result = {
        "status": "blocked" if problems else "ready",
        "scope": "State/register and current text/hash checks" if check_text else "State/register consistency only; source bodies not read",
        "branch": ACTIVE_BRANCH,
        "sourceCheckpoint": checkpoint,
        "workingUnits": {BOOKS[slug]: counts.get(slug) if valid_count(counts.get(slug)) else None for slug in BOOKS},
        "combinedUnits": total_units,
        "nihaya": {"total": len(rows), "compared": compared, "incorporated": incorporated,
                   "awaitingIncorporation": len(awaiting_incorporation), "remaining": len(pending)},
        "firstNewComparison": next_id,
        "nextTask": next_task,
        "publication": {
            "lastRecordedVerifiedStage": published.get("stage") if valid_count(published.get("stage")) else None,
            "recordedPdfCount": published.get("pdfCount") if valid_count(published.get("pdfCount")) else None,
            "qualification": "Recorded publication only, not a live check. A source checkpoint does not establish publication or scholarly certification.",
        },
        "problems": [p[:180] for p in problems[:6]],
        "problemCount": len(problems),
    }
    if problems:
        result["instruction"] = "Stop and reconcile the named checkpoint files. Preserve newer work; do not reset, replay completed batches, fetch automatically or run the old recovery guard."
    return result, 2 if problems else 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check-text", action="store_true", help="Explicitly read the three current book JSONs and verify unit counts and incorporated text hashes.")
    args = parser.parse_args()
    result, code = inspect_checkpoint(check_text=args.check_text)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
