"""Create a complete portable NAMA reader ZIP with all offline modules and scholarly status.

Run from the repository root:
    python research/avicennism/build_portable.py
"""
from __future__ import annotations
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json

ROOT = Path(__file__).resolve().parent
NAME = "NAMA_Late_Avicennism_Reader_2026-10-31.zip"

FILES = [
    "index.html", "reader.css", "reader.js", "reader-foundation.js",
    "reader-pages.js", "reader-extras.js", "reader-context.js",
    "reader-scope.js", "corpus-primary.js", "corpus-analysis.js",
    "argument-apparatus.js", "argument-context.json", "argument-links.json",
    "tradition-coverage.json", "TAJRID_DEDUP_AND_POST_ASFAR_SCOPE.json",
    "POST_ASFAR_DISTINCTIVE_DOSSIERS.json", "TAJRID_NON_DUPLICATION_CROSSWALK.json", "build_standalone.py",
    "build_apparatus.py", "standalone.html", "NAMA_INTEGRATION.md", "README.md",
]
START = (
    "LATE AVICENNISM — NAMA-READY CONTEXTUAL READER\n\n"
    "Open late-avicennism/standalone.html for the complete one-file reader.\n"
    "For a website, place the modular late-avicennism directory at\n"
    "/research/late-avicennism/ and add its index.html to Research navigation.\n"
    "See NAMA_INTEGRATION.md for deployment and scholarly status.\n\n"
    "The separate NAMA site has NOT been modified by this archive build.\n"
    "Working English arguments and selected original-language anchors are\n"
    "not equivalent to a full manuscript-critical edition of late Avicennism.\n"
    "The separate Tajrid project owns its 30 canonical matn/sharh questions; the crosswalk links them without copying.\n"
)

def build() -> dict[str, object]:
    for name in FILES:
        if not (ROOT / name).is_file():
            raise FileNotFoundError(ROOT / name)

    destination = ROOT / NAME
    with ZipFile(destination, "w",compression=ZIP_DEFLATED, compresslevel=8) as archive:
        for name in FILES:
            archive.write(ROOT / name, "late-avicennism/" + name)
        archive.writestr("START_HERE.txt", START)

    with ZipFile(destination) as archive:
        assert archive.testzip() is None, "ZIP integrity check failed"
        expected = {"late-avicennism/" + x for x in FILES} | {"START_HERE.txt"}
        assert set(archive.namelist()) == expected, "Missing archive item"
        assert len(archive.read("late-avicennism/standalone.html")) > 540_000
        assert b"window.AVICENNIAN_APPARATUS=" in archive.read(
            "late-avicennism/standalone.html"
        )

    return {
        "archive": str(destination),
        "bytes": destination.stat().st_size,
        "files": len(FILES)+1,
        "integrity": "passed",
        "editorial_status": "working context edition; not full manuscripts",
    }

if __name__ == "__main__":
    print(json.dumps(build(), ensure_ascii=False, indent=2))
