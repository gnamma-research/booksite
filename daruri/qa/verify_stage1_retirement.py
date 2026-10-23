#!/usr/bin/env python3
"""Stage 1 retirement gate: fail if a full variant survives or a signed input is lost.

The original 120 completed PDFs are preserved separately in the named archival
Git branch. This gate checks the *deployed-file* input set, without rebuilding
those historical 120 comparisons or relying on removed binaries.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent

def load(path: str):
    return json.loads((ROOT / path).read_text("utf-8"))

def file_bytes(path: str, expected: str) -> None:
    target = (ROOT / path).resolve()
    if not target.is_relative_to(ROOT.resolve()):
        raise AssertionError("unsafe publication path: " + path)
    assert target.is_file(), "Missing Stage 1 input: " + path
    data = target.read_bytes()
    actual = hashlib.sha256(data).hexdigest()
    assert actual == expected, "Bad SHA256 for " + path
    if path.endswith(".pdf"):
        assert data.startswith(b"%PDF-"), "Not a PDF: " + path

retire = load("dynamic-pdf/RETIRE_120.json")
bases = load("editions/manifest.json")
base_maps = load("editions/maps/manifest.json")
variants = load("editions/apparatus/manifest.json")
packets = load("dynamic-pdf/packets/manifest.json")
canonical = load("pdf-editions-manifest.json")["files"]

assert retire["schema"] == "gnamma-daruri-stage1-retirement-v1"
assert retire["status"] == "isolated-retirement-qa-not-published"
assert retire["archival_rollback_branch"] == "archive/daruri-stage1-pre-retirement-20261023"
assert bases["status"] == variants["status"] == base_maps["status"] == "verified"
assert len(bases["files"]) == len(base_maps["files"]) == 12
assert len(packets["packets"]) == 15
assert len(packets["profiles"]) == len(variants["files"]) == 120
assert len(canonical) == 5
assert hashlib.sha256((ROOT/"editions/manifest.json").read_bytes()).hexdigest() == packets["base_manifest_sha256"]

by_base = {r["file"]: r for r in bases["files"]}
by_base_map = {r["file"]: r for r in base_maps["files"]}
assert len(by_base) == len(by_base_map) == 12

for name, base in by_base.items():
    mapped = by_base_map[name]
    assert mapped["base_sha256"] == mapped["sha256"] == base["sha256"]
    assert mapped["verified_sections"] == 258
    file_bytes("editions/" + name, base["sha256"])
    file_bytes("editions/" + mapped["map_file"], mapped["map_sha256"])

by_packet = {p["file"]: p for p in packets["packets"]}
by_profile = {p["profile"]: p for p in packets["profiles"]}
assert len(by_packet) == 15 and len(by_profile) == 120
for name, p in by_packet.items():
    file_bytes("dynamic-pdf/packets/" + name, p["sha256"])
    file_bytes("dynamic-pdf/packets/" + p["map"], p["map_sha256"])

removed = set()
for row in variants["files"]:
    path = "editions/" + row["file"]
    assert row["file"].startswith("apparatus/") and row["file"].endswith(".pdf")
    assert not (ROOT / path).exists(), "Redundant prebuilt PDF still present: " + path
    removed.add(path)
    profile = by_profile[row["file"]]
    assert row["source_base"] in by_base
    assert profile["base"] == row["source_base"]
    assert row["base_sha256"] == by_base[row["source_base"]]["sha256"]
    assert profile["profile_sha256"] == row["sha256"]
    assert profile["packet"] in by_packet
    assert profile["packet_sha256"] == by_packet[profile["packet"]]["sha256"]
    file_bytes("dynamic-pdf/packets/" + profile["map"], profile["map_sha256"])
assert len(removed) == 120, "A signed variant was missing from the inventory"

for file, record in canonical.items():
    file_bytes(file, record["sha256"])

reader = (ROOT / "editions-selector.js").read_text("utf-8")
client = (ROOT / "dynamic-pdf/client.js").read_text("utf-8")
assert "data-es-stage1-create" in reader
assert "dynamic-editions.html?" in reader
assert "assembleOffThread" in client
assert "restoreExactPublishedEdition" in client
assert all(("editions/" + row["file"]) not in reader for row in variants["files"])

print(json.dumps({
    "STAGE1_RETIREMENT_QA": "PASS",
    "removed_prebuilt_variant_pdfs": len(removed),
    "source_pdfs_verified": len(bases["files"]),
    "packet_pdfs_verified": len(by_packet),
    "link_maps_sha256_verified": len(by_profile),
    "separate_canonical_verified": len(canonical),
    "archived_rollback": retire["archival_rollback_branch"],
    "production_release_approved": False
}, sort_keys=True))
