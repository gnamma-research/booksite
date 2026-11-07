#!/usr/bin/env python3
"""Package the original local Bidāya Revision16 research source WITHOUT modifying it.

This is a source-recovery tool, not a converter, publisher or a replacement for the
canonical 310-group/279-position corpus. It does not access the internet.
"""
import argparse
import hashlib
import io
import json
import sys
import zipfile
from pathlib import Path

REQUIRED = (
    "output/master-reader.html",
    "output/master-framework-and-commentary.md",
    "output/bidaya-primary-census.json",
)
OPTIONAL_ANCHORS = (
    "output/scripture-source-library.html",
    "research/text-source-register.json",
)
SOURCE_DIRS = ("output", "research", "data", "assets", "src", "scripts", "sources")
EXTENSIONS = {
    ".html", ".htm", ".json", ".jsonl", ".md", ".txt", ".csv", ".tsv",
    ".xml", ".yaml", ".yml", ".js", ".mjs", ".css", ".py", ".svg", ".tex"
}
PRIVATE_NAMES = (".env", "token", "secret", "password", "credential", "private_key", "id_rsa", ".pem")
SKIP_DIRS = {".git", "__pycache__", "node_modules", ".venv", "venv", "build-cache",
             "tmp", "temp", "cache", ".next", ".DS_Store"}
EXPECTED = {
    "english_arrangement_books": 57,
    "editorial_divisions": 72,
    "recoverable_headings": 854,
    "english_ocr_headings": 839,
    "arabic_funeral_headings": 15,
    "representative_working_groups": 310,
    "K_position_propositions": 279,
    "stable_reader_section_addresses": 542,
}

def sha256(data):
    return hashlib.sha256(data).hexdigest()

def find_project(explicit=None):
    if explicit:
        return Path(explicit).expanduser().resolve()
    parent = Path.home() / ".codex" / ".chatgpt-projects"
    if not parent.is_dir():
        raise FileNotFoundError(f"Project directory not found: {parent}")
    candidates = [p for p in parent.iterdir() if p.is_dir()
                  and (p / REQUIRED[0]).is_file()]
    if len(candidates) == 1:
        return candidates[0]
    if not candidates:
        raise FileNotFoundError("No ChatGPT project directory contains " + REQUIRED[0])
    raise RuntimeError("Multiple possible Bidāya projects:\n" +
                       "\n".join(f"  {p}" for p in candidates) +
                       "\nUse --root to choose the correct project.")

def selected_files(project):
    for directory in SOURCE_DIRS:
        folder = project / directory
        if not folder.is_dir():
            continue
        for file in sorted(folder.rglob("*")):
            if not file.is_file() or file.is_symlink():
                continue
            relative = file.relative_to(project)
            if any(part in SKIP_DIRS or part.startswith(".") for part in relative.parts):
                continue
            if file.suffix.lower() not in EXTENSIONS:
                continue
            low = file.name.lower()
            if any(t in low for t in PRIVATE_NAMES):
                continue
            yield relative, file

def run():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--root", help="Original project root (normally auto-discovered)")
    ap.add_argument("--output", default=str(Path.home() / "Desktop" /
                    "Bidaya_Revision16_Original_Source_Bundle.zip"))
    ap.add_argument("--max-file-mb", type=int, default=100)
    ap.add_argument("--max-total-mb", type=int, default=500)
    ap.add_argument("--audit-only", action="store_true",
                    help="List source files and check availability without creating a ZIP")
    args = ap.parse_args()
    try:
        project = find_project(args.root)
    except (FileNotFoundError, RuntimeError) as err:
        print(f"ERROR: {err}", file=sys.stderr)
        return 2
    missing = [p for p in REQUIRED if not (project / p).is_file()]
    if missing:
        print("ERROR: cannot claim canonical recovery; missing required originals:",
              file=sys.stderr)
        for p in missing:
            print("  " + str(project / p), file=sys.stderr)
        return 3
    per_limit = args.max_file_mb * 1024**2
    total_limit = args.max_total_mb * 1024**2
    manifest = {
        "package_status": "original-files-collected; counts and textual fidelity require parity audit",
        "original_source_root_label": project.name,
        "required_original_files": list(REQUIRED),
        "optional_original_files_present":
            {p: (project/p).is_file() for p in OPTIONAL_ANCHORS},
        "prior_research_counts_NOT_VERIFIED_BY_THIS_TOOL": EXPECTED,
        "files": [],
        "skipped": [],
    }
    payloads = []
    total = 0
    for rel, file in selected_files(project):
        size = file.stat().st_size
        if size > per_limit or size + total > total_limit:
            manifest["skipped"].append({"path":rel.as_posix(), "size_bytes":size,
                                        "reason":"configured size limit"})
            continue
        data = file.read_bytes()
        total += len(data)
        record = {"path":rel.as_posix(), "size_bytes":len(data), "sha256":sha256(data)}
        manifest["files"].append(record)
        payloads.append((rel.as_posix(), data))
    collected = {p for p,_ in payloads}
    if not set(REQUIRED).issubset(collected):
        print("ERROR: one or more required original sources were excluded from the package.",
              file=sys.stderr)
        return 4
    manifest["file_count"] = len(payloads)
    manifest["total_uncompressed_bytes"] = total
    manifest["all_required_present"] = True
    print(f"Found {len(payloads)} scholarly source files ({total:,} bytes).")
    for p in REQUIRED:
        print("  PRESENT " + p)
    for p in OPTIONAL_ANCHORS:
        print(("  PRESENT " if (project / p).is_file() else "  MISSING ") + p)
    if manifest["skipped"]:
        print(f"Warning: {len(manifest['skipped'])} source files skipped (listed in manifest).")
    if args.audit_only:
        return 0
    destination = Path(args.output).expanduser().resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    readme = (
        "BIDĀYA REVISION16 — ORIGINAL SOURCE RECOVERY\n\n"
        "This archive is made directly from the original local project files.\n"
        "It does NOT claim the expected 542/310/279 record counts have been verified.\n"
        "Review MANIFEST.json and preserve all original stable IDs.\n"
        "It is intended for PRIVATE transfer and source-controlled scholarly import.\n"
        "Do not publish copyrighted reference books or other material indiscriminately.\n"
        "Originals have not been altered.\n"
    )
    with zipfile.ZipFile(destination, "w", compression=zipfile.ZIP_DEFLATED,
                         compresslevel=6, allowZip64=True) as z:
        z.writestr("RECOVERY_README.txt", readme)
        z.writestr("MANIFEST.json",
                   json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
        for rel,data in payloads:
            z.writestr("original/" + rel, data)
    with zipfile.ZipFile(destination) as z:
        assert z.testzip() is None
        assert len(z.namelist()) == len(payloads) + 2
    print(f"CREATED {destination} ({destination.stat().st_size:,} bytes)")
    print("This bundle is NOT a complete public edition until the 542/310/279 parity audit passes.")
    return 0

if __name__ == "__main__":
    sys.exit(run())