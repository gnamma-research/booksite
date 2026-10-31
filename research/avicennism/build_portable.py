"""Package complete NAMA-ready Avicennism reader without distributing original books.

Run: python research/avicennism/build_portable.py
"""
from __future__ import annotations
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json

ROOT=Path(__file__).resolve().parent
NAME="NAMA_Late_Avicennism_Reader_2026-10-31.zip"
FILES=[
    "index.html","reader.css","reader.js","reader-foundation.js",
    "reader-pages.js","reader-extras.js","corpus-primary.js",
    "corpus-analysis.js","standalone.html","NAMA_INTEGRATION.md","README.md"
]
out=ROOT/NAME
for file in FILES:
    if not (ROOT/file).is_file():
        raise FileNotFoundError(ROOT/file)
with ZipFile(out,"w",compression=ZIP_DEFLATED,compresslevel=8) as z:
    for path in FILES:
        z.write(ROOT/path,"late-avicennism/"+path)
    z.writestr("START_HERE.txt",
               "LATE AVICENNISM: NAMA READY\n"
               "Open late-avicennism/standalone.html for the one-file reader,\n"
               "or late-avicennism/index.html when the modular files are alongside it.\n"
               "The NAMA website itself has not been deployed from this build.\n"
               "For deployment copy the folder to /research/late-avicennism/.\n"
               "See NAMA_INTEGRATION.md. The original Arabic/Persian is excerpted,\n"
               "not a complete critical edition of the historical corpus.\n")
with ZipFile(out) as z:
    assert z.testzip() is None
    assert set(z.namelist())=={"late-avicennism/"+n for n in FILES}|{"START_HERE.txt"}
    assert len(z.read("late-avicennism/standalone.html"))>400000
print(json.dumps({"archive":str(out),"size":out.stat().st_size,
                  "files":len(FILES)+1,"integrity":"passed"}))
