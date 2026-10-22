#!/usr/bin/env python3
"""Single authoritative strict parity entrypoint for experimental Daruri PDFs.

Imports the independently proven verifier introduced in merged PR #48.  Replaces
the obsolete round(x, 1) comparator, which rejected correct <0.001 pt links.
Source-page links inherited from the SHA-matched published base are allowed,
while all appendix links MUST match exact target/page/URI/multiplicity and
coordinate geometry within the fixed 0.002 pt release tolerance.

This never modifies canonical or generated PDFs. Matching the PDF *meaning,
pixels, text, geometry, section anchors and notes* does not mean byte identity.
"""
from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/"qa"))
from verify_dynamic_apparatus_links import check_one, EPS  # noqa: E402


def main():
    generated_root = Path(__file__).resolve().parent/"test-output"
    reference = json.loads((ROOT/"editions/apparatus/manifest.json").read_text("utf8"))
    if reference.get("status") != "verified" or len(reference.get("files", [])) != 120:
        raise ValueError("Approved static 120-edition catalogue is missing")
    approved = {r["filename"]:r for r in reference["files"]}
    all_profiles = set()
    passed = 0
    checked_links = 0
    failures = []
    subdirs = sorted(p for p in generated_root.iterdir() if p.is_dir()) if generated_root.exists() else []
    for output_dir in subdirs:
        files = sorted(output_dir.glob("daruri-*.pdf"))
        if not files:
            continue
        completed = output_dir/"results.json"
        if not completed.is_file():
            raise ValueError(f"Missing full generator job output: {output_dir}")
        result_rows = json.loads(completed.read_text("utf8"))
        count = result_rows.get("expected")
        if not isinstance(count,int) or count!=len(files):
            raise ValueError(f"Truncated or extra output for {output_dir}: {len(files)}/{count}")
        summaries=[]
        for candidate in files:
            if candidate.name not in approved:
                raise ValueError(f"Unexpected, unapproved design: {candidate.name}")
            if candidate.name in all_profiles:
                raise ValueError(f"Duplicate profile generated: {candidate.name}")
            all_profiles.add(candidate.name)
            result = check_one(ROOT, candidate, approved[candidate.name], images=True)
            result["generated_sha256_equals_prebuilt"] = (
                result["expected_sha256"] == result.get("generated_sha256")
            )
            summaries.append(result)
            passed += bool(result["pass"])
            checked_links += result.get("checked_appendix_links",0)
            if not result["pass"]:
                failures.append({"filename":candidate.name,"issues":result["issues"][:8]})
            print("APPARATUS_PARITY",candidate.name,
                  "PASS" if result["pass"] else "FAIL",
                  "links",result.get("checked_appendix_links",0),
                  "max_delta_pt",result.get("maximum_appendix_link_delta_pt"),
                  flush=True)
        (output_dir/"parity_results.json").write_text(
            json.dumps(summaries,ensure_ascii=False,indent=2)+"\n",encoding="utf8"
        )
    # In a CI job there must be either all 20 shard members or three designated
    # smoke profiles. Test outputs from several shards may coexist locally.
    n=len(all_profiles)
    if not n:
        raise ValueError("No PDF generated; an empty test must never report PASS")
    if n not in (3,20,120):
        raise ValueError(f"Unexpected incomplete release matrix: {n} PDFs")
    if n==120 and all_profiles != set(approved):
        raise ValueError("The 120 exact approved designs do not match the release manifest")
    print("STRICT_VISUAL_SEMANTIC_PARITY",json.dumps({
        "evaluated":n,"passed":passed,"failed":n-passed,
        "appendix_links":checked_links,"tolerance_pt":EPS,
        "source_links":"must match exact verified base; extra vs archived assembled PDFs permitted",
        "byte_identical_to_prebuilt":False,
        "failure_samples":failures[:6]
    },ensure_ascii=False),flush=True)
    return 0 if passed==n else 2


if __name__=="__main__":
    raise SystemExit(main())
