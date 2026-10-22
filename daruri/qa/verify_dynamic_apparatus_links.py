#!/usr/bin/env python3
"""Independent exact-link and complete PDF parity gate.

Compares dynamic Daruri PDFs with the *unchanged published* 120 apparatus PDFs.
Uses a bipartite minimum-distance bijection, never decimal rounding to equate
two PDF link rectangles. Any different target page, link kind, URI, multiplicity,
or coordinate error over the strict sub-pixel tolerance fails. Also certifies
all source pages, text/word geometry, rendered pixels, outlines and 258 anchors.

This script reads existing PDFs only; it never modifies user files.
"""
from __future__ import annotations

import argparse
import collections
import hashlib
import json
from pathlib import Path

import fitz
import numpy as np
from scipy.optimize import linear_sum_assignment

EPS = 0.002  # PDF points. Measured generator jitter < 0.00055 pt.
MAX_EXAMPLES = 8


def sha_file(path: Path) -> str:
    hashobj = hashlib.sha256()
    with path.open("rb") as stream:
        for buf in iter(lambda: stream.read(1024 * 1024), b""):
            hashobj.update(buf)
    return hashobj.hexdigest()


def point(value):
    if value is None:
        return None
    return np.asarray((float(value[0]), float(value[1])), dtype=np.float64)


def anchor_match(a, b, epsilon=EPS):
    if a.get("page") != b.get("page"):
        return False
    ax, bx = point(a.get("to")), point(b.get("to"))
    return (ax is None and bx is None) or (
        ax is not None and bx is not None and
        bool(np.max(np.abs(ax - bx)) <= epsilon)
    )


def group_id(link: dict):
    # Target page and URI are semantic. Never use numeric rounding to match.
    return (link.get("kind"), link.get("page"),
            link.get("uri"), link.get("to") is None)


def vector(link: dict):
    rect = list(link["from"])
    coords = list(link["to"]) if link.get("to") is not None else [0, 0]
    return np.asarray(rect + coords, dtype=np.float64)


def equivalent_links(approved, generated, epsilon=EPS):
    """Minimum-cost link multiset bijection, grouped by exact semantic target.

    No greedy matching: repeated locators, rectangles and duplicate annotations
    can otherwise give false matches or failures depending on enumeration order.
    """
    errors = []
    a = collections.defaultdict(list)
    b = collections.defaultdict(list)
    for item in approved:
        a[group_id(item)].append(item)
    for item in generated:
        b[group_id(item)].append(item)
    if set(a) != set(b):
        errors.append({
            "reason": "different link kinds, target pages, URIs, or destinations",
            "only_approved": [str(x) for x in (a.keys() - b.keys())][:MAX_EXAMPLES],
            "only_generated": [str(x) for x in (b.keys() - a.keys())][:MAX_EXAMPLES],
        })
        return errors, 0, None
    matched = 0
    worst = 0.0
    for key in a:
        orig, copy = a[key], b[key]
        if len(orig) != len(copy):
            errors.append({"reason": "link multiplicity differs",
                           "semantic_target": str(key),
                           "published": len(orig), "generated": len(copy)})
            continue
        if not orig:
            continue
        left = np.stack([vector(x) for x in orig])
        right = np.stack([vector(x) for x in copy])
        # Optimize closest overall match to handle duplicates and shifted order.
        diffs = np.abs(left[:, None, :] - right[None, :, :])
        cost = np.max(diffs, axis=2)
        i0, i1 = linear_sum_assignment(cost)
        chosen = cost[i0, i1]
        matched += len(i0)
        if len(chosen):
            worst = max(worst, float(np.max(chosen)))
        failures = np.where(chosen > epsilon)[0]
        for idx in failures[:max(0, MAX_EXAMPLES-len(errors))]:
            x, y = int(i0[idx]), int(i1[idx])
            errors.append({
                "reason": "coordinate difference exceeds tolerance",
                "semantic_target": str(key),
                "maximum_delta_pt": round(float(chosen[idx]), 7),
                "approved": list(map(float, left[x])),
                "generated": list(map(float, right[y])),
            })
        if len(errors) >= MAX_EXAMPLES:
            break
    return errors, matched, worst


def check_one(site: Path, dynamic: Path, config: dict, epsilon=EPS, images=True):
    name = dynamic.name
    gold = site / "editions" / "apparatus" / name
    base = site / "editions" / config["source_base"]
    report = {
        "filename": name, "expected_sha256": config["sha256"],
        "generated_path": str(dynamic), "approved_path": str(gold),
        "issues": [], "checked_appendix_links": 0,
        "maximum_appendix_link_delta_pt": 0.0,
        "pages_identical_pixels": 0, "pages_identical_text": 0,
        "pages_identical_word_geometry": 0,
    }
    issues = report["issues"]
    if sha_file(gold) != config["sha256"]:
        issues.append("approved apparatus bytes do not match signed manifest")
    if sha_file(base) != config["base_sha256"]:
        issues.append("approved base bytes do not match signed manifest")
    with fitz.open(gold) as approved, fitz.open(dynamic) as generated, fitz.open(base) as source:
        if len(approved) != len(generated) or len(source) > len(approved):
            issues.append(f"incorrect page count {len(approved)} vs {len(generated)}")
            return report
        report["pages"] = len(approved)
        report["base_pages"] = len(source)
        if approved.get_toc() != generated.get_toc():
            issues.append("bookmarks/textual ToC destinations differ")
        # Original 258 named source positions must be retained accurately,
        # even if the historical apparatus merges omitted named destinations.
        anchor_a = source.resolve_names()
        anchor_b = generated.resolve_names()
        if len([n for n in range(1, 259)
                if f"section-{n}" in anchor_a]) != 258:
            issues.append("published A4 source missing 258 named section anchors")
        bad_sections = []
        for i in range(1, 259):
            key = f"section-{i}"
            sa = anchor_a.get(key)
            sb = anchor_b.get(key)
            if sa is None or sb is None or not anchor_match(sa, sb, epsilon):
                bad_sections.append(i)
        report["source_anchors_verified"] = 258 - len(bad_sections)
        if bad_sections:
            issues.append(f"source named section anchors differ {bad_sections[:12]}")
        for n in range(len(approved)):
            orig = approved[n]
            new = generated[n]
            if orig.rect != new.rect:
                issues.append(f"PDF page {n+1} media box differs")
                continue
            if orig.get_text() == new.get_text():
                report["pages_identical_text"] += 1
            else:
                issues.append(f"PDF page {n+1} text layer changed")
            def word_geom(page):
                return [
                    (w[4], *(round(v, 2) for v in w[:4]))
                    for w in page.get_text("words", sort=False)
                ]
            if word_geom(orig) == word_geom(new):
                report["pages_identical_word_geometry"] += 1
            else:
                issues.append(f"PDF page {n+1} word coordinates changed")
            if images:
                a_image, b_image = orig.get_pixmap(), new.get_pixmap()
                if (a_image.width == b_image.width and
                    a_image.height == b_image.height and
                    a_image.samples == b_image.samples):
                    report["pages_identical_pixels"] += 1
                else:
                    issues.append(f"PDF page {n+1} bitmap changed")
            else:
                report["pages_identical_pixels"] = None
            for link in new.get_links():
                if link.get("kind") == fitz.LINK_GOTO and (
                    not isinstance(link.get("page"), int) or
                    not 0 <= link["page"] < len(generated)
                ):
                    issues.append(f"invalid GoTo destination page {n+1}")
            if n >= len(source):
                old_links, new_links = orig.get_links(), new.get_links()
                err, total, delta = equivalent_links(old_links, new_links, epsilon)
                report["checked_appendix_links"] += total
                report["maximum_appendix_link_delta_pt"] = max(
                    report["maximum_appendix_link_delta_pt"], delta or 0.0
                )
                for problem in err[:max(0, MAX_EXAMPLES-len(issues))]:
                    issues.append({"page": n+1, **problem})
            if len(issues) > 20:
                break
        report["approved_appendix_links"] = sum(
            len(approved[i].get_links()) for i in range(len(source), len(approved))
        )
        report["generated_appendix_links"] = sum(
            len(generated[i].get_links()) for i in range(len(source), len(generated))
        )
        # Dynamic export may preserve additional *source* annotations lost by
        # older PDF merges, but it must not remove any from published A4 base.
        base_bad = []
        base_count = 0
        for p in range(len(source)):
            aa = source[p].get_links()
            bb = generated[p].get_links()
            err, count, delta = equivalent_links(aa, bb, epsilon)
            base_count += count
            if err and len(base_bad) < MAX_EXAMPLES:
                base_bad.append({"page": p+1, "issues": err[:2]})
        report["approved_base_links_verified"] = base_count
        report["original_base_link_errors"] = base_bad
        if base_bad:
            issues.append(f"original published A4 source links changed on {len(base_bad)}+ pages")
    report["pass"] = not bool(issues)
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", type=Path, required=True)
    parser.add_argument("--generated", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--epsilon", type=float, default=EPS)
    parser.add_argument("--no-pixels", action="store_true")
    args = parser.parse_args()
    if not 0 < args.epsilon <= EPS:
        parser.error(f"epsilon must be in (0, {EPS}] PDF points")
    manifest = json.loads(
        (args.site / "editions/apparatus/manifest.json").read_text(encoding="utf-8")
    )
    rows = {entry["filename"]: entry for entry in manifest["files"]}
    files = sorted(args.generated.glob("**/daruri-*.pdf"))
    if not files:
        raise SystemExit("No generated PDF artifacts found; cannot certify empty test")
    if len({p.name for p in files}) != len(files):
        raise SystemExit("Duplicate generated PDF profiles across shards")
    results = []
    for idx, item in enumerate(files, 1):
        if item.name not in rows:
            raise SystemExit(f"Unrecognized generated profile: {item.name}")
        result = check_one(args.site, item, rows[item.name], args.epsilon,
                           images=not args.no_pixels)
        results.append(result)
        print("CERTIFY", idx, len(files), item.name,
              "PASS" if result.get("pass") else "FAIL",
              "verified links", result.get("checked_appendix_links"),
              "max_delta_pt", result.get("maximum_appendix_link_delta_pt"),
              "errors", result.get("issues", [])[:2], flush=True)
    summary = {
        "test": "exact PDF target-page + subpixel-geometry + visual parity",
        "tolerance_pt": args.epsilon, "evaluated": len(results),
        "passed": sum(bool(r.get("pass")) for r in results),
        "failed": sum(not r.get("pass") for r in results),
        "total_certified_appendix_links": sum(r.get("checked_appendix_links", 0)
                                            for r in results),
        "maximum_observed_link_delta_pt": max(
            (r.get("maximum_appendix_link_delta_pt", 0) for r in results),
            default=0.0),
        "profiles": results,
    }
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "exact-link-parity.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print("FINAL", summary["passed"], "/", summary["evaluated"],
          "certified", summary["total_certified_appendix_links"],
          "PDF appendix links", flush=True)
    return 0 if summary["failed"] == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
