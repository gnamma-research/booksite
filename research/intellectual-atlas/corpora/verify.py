#!/usr/bin/env python3
"""Offline integrity and structural QA for the Gnamma OpenITI source tranche.

Run: python research/intellectual-atlas/corpora/verify.py
No network is required. This verifies registry provenance, local byte-identical
mirrors and bibliography-backed work relations, NOT historical textual accuracy.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
REGISTRY = ROOT / "registry.json"
EXPECTED_SOURCE = "OpenITI/RELEASE"
MIRROR_IDS = {
    "nawawi_arbain", "ibn_malik_alfiyya", "ibn_arabi_fusus",
    "shafii_risala", "jurjani_asrar",
}
EXPECTED_PAIRS = {
    ("muslim_sahih", "nawawi_sharh_muslim"),
    ("ibn_malik_alfiyya", "ibn_aqil_sharh_alfiyya"),
    ("sakkaki_miftah", "qazwini_talkhis"),
    ("qazwini_talkhis", "qazwini_idah"),
    ("qazwini_talkhis", "taftazani_mukhtasar"),
}


def git_blob_sha(raw: bytes) -> str:
    header = b"blob " + str(len(raw)).encode("ascii") + b"\0"
    return hashlib.sha1(header + raw).hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def main() -> int:
    data = json.loads(REGISTRY.read_text(encoding="utf-8"))
    commit = data.get("source_commit", "")
    require(data.get("source_repository") == EXPECTED_SOURCE,
            "Source repository identity changed")
    require(re.fullmatch(r"[0-9a-f]{40}", commit) is not None,
            "Source commit is not a pinned Git SHA")
    require(data.get("license") == "CC BY-NC-SA 4.0",
            "License attribution missing or altered")
    books = data.get("books", [])
    require(isinstance(books, list) and len(books) == 30,
            f"Expected 30 source-attested works, found {len(books)}")
    ids = [book["id"] for book in books]
    require(len(set(ids)) == len(ids), "Repeated canonical book ID")
    by_id = {book["id"]: book for book in books}
    mirrors = set()

    for book in books:
        bid = book["id"]
        require(bool(book.get("title") and book.get("title_ar") and book.get("author")),
                f"{bid}: no verified name or author")
        require(isinstance(book.get("disciplines"), list) and bool(book["disciplines"]),
                f"{bid}: no discipline(s) documented")
        v = book["openiti"]
        version, work = v["version_uri"], v["book_uri"]
        require(version.startswith(work + "."),
                f"{bid}: version does not belong to recorded work")
        author = version.split(".", 1)[0]
        expected_path = f"data/{author}/{work}/{version}"
        expected_url = f"https://raw.githubusercontent.com/{EXPECTED_SOURCE}/{commit}/{expected_path}"
        expected_page = f"https://github.com/{EXPECTED_SOURCE}/blob/{commit}/{expected_path}"
        require(v.get("source_url") == expected_url,
                f"{bid}: source URL is not pinned or diverges from work URI")
        require(v.get("source_page") == expected_page,
                f"{bid}: GitHub source page mismatch")
        require(re.fullmatch("[0-9a-f]{40}", v.get("blob_sha", "")) is not None,
                f"{bid}: invalid object SHA")
        require(isinstance(v.get("size_bytes"), int) and v["size_bytes"] > 1024,
                f"{bid}: source file size missing")
        require(v.get("metadata_url", "").startswith(
            f"https://github.com/{EXPECTED_SOURCE}/blob/{commit}/data/{author}/{work}/"),
            f"{bid}: version annotation is not pinned")
        require(v.get("work_metadata", "").startswith(
            f"https://github.com/{EXPECTED_SOURCE}/blob/{commit}/data/{author}/{work}/"),
            f"{bid}: work authority is not pinned")
        require(v.get("quality_note"), f"{bid}: missing edition quality note")
        proof = book.get("verification", {})
        require(proof.get("file_exists") is True and proof.get("version_metadata_reviewed") is True,
                f"{bid}: version identity or metadata not checked")
        require(proof.get("content_collated_against_print") is False and
                proof.get("critical_edition") is False,
                f"{bid}: unverified critical edition claim")
        local = book.get("local_text")
        if local is None:
            continue
        p = Path(local)
        require(not p.is_absolute() and ".." not in p.parts and p.parts[0] == "data",
                f"{bid}: local text path escapes source corpus")
        file = ROOT / p
        require(file.is_file(), f"{bid}: missing mirrored source file")
        raw = file.read_bytes()
        require(len(raw) == v["size_bytes"],
                f"{bid}: mirrored bytes differ in size from OpenITI source")
        require(git_blob_sha(raw) == v["blob_sha"],
                f"{bid}: mirrored Git blob SHA differs from OpenITI source")
        text = raw.decode("utf-8-sig")
        require("######OpenITI#" in text and re.search("[\u0621-\u064a]", text),
                f"{bid}: no recognisable Arabic OpenITI source")
        mirrors.add(bid)
    require(mirrors == MIRROR_IDS, f"Local mirrors changed unexpectedly: {mirrors ^ MIRROR_IDS}")

    relationships = data.get("relationships", [])
    require(len(relationships) == 5, "Missing independently sourced work-to-work relations")
    edges = set()
    for relation in relationships:
        pair = relation["source"], relation["target"]
        require(pair[0] in by_id and pair[1] in by_id,
                f"Unresolvable bibliographical relation: {pair}")
        require(pair not in edges, f"Duplicate relationship: {pair}")
        edges.add(pair)
        require(relation.get("type") in {"commentary", "abridgment", "author_expansion"},
                f"Unknown textual relation type in {pair}")
        require(len(relation.get("evidence", "")) >= 35 and relation.get("confidence"),
                f"Missing relation evidence in {pair}")
        parsed = urlparse(relation.get("source_url", ""))
        require(parsed.scheme == "https" and parsed.hostname is not None,
                f"Invalid external bibliographical authority URL in {pair}")
    require(edges == EXPECTED_PAIRS, "Five sourced text-family relations were altered")

    verification = data.get("mirror_integrity", {})
    require(set(verification.get("byte_matched_ids", [])) == MIRROR_IDS,
            "Integrity declaration and actual files disagree")
    result = {
        "status": "PASS", "source_commit": commit, "registered_versions": len(books),
        "mirrored_byte_matched": len(mirrors), "pinned_remote": len(books) - len(mirrors),
        "source_backed_work_relations": len(relationships),
        "print_manuscript_collation_performed_here": 0,
        "all_corpora_complete": False,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ValueError, OSError, UnicodeError, json.JSONDecodeError, KeyError, IndexError) as error:
        print(f"GNAMMA corpus QA failed: {error}", file=sys.stderr)
        raise SystemExit(1)
