# Texts in Time · Islamic Intellectual Atlas

A working research atlas published in Gnamma's Research collection. The
integrated chronology places empire/state periods, historical events and texts
on one calendar axis, retaining the source notes, dating qualifications and
evidence for textual relationships.

The revision contains 295 scholarly/context entries and 286 textual
relationships. The historical display has 45 political periods and 36 events;
individual ruler reigns are omitted. The older reign records remain in the
downloadable archival dataset.

## Files

- `index.html`: self-contained interactive atlas with Gnamma navigation.
- `site.css`: Gnamma-specific presentation around the atlas.
- `downloads/`: overview and reference PDFs, canonical JSON data, and the
  reviewed offline/source package.
- `publication.json`: edition counts and download checksums.
- `build.py`: generates the page from the reviewed package.

Run `python research/intellectual-atlas/build.py` from the repository root
after replacing the reviewed package or the matching PDF downloads. The
application's data, date interpretation and interaction source are contained in
the package. Keep PDF editions and dataset versions aligned.

All links are relative to this directory or the repository root, so the page
works under the GitHub Pages `/booksite/` prefix. The page needs no server-side
API, database, remote runtime, or third-party script.

## Editorial status

This is selective, revisable research, not a complete or definitive history.
Relation type and evidentiary confidence remain separate; political coexistence
does not establish influence. The source register contains references and
paraphrased notes rather than copies of complete third-party source texts.
Public downloads match the reviewed integrated revision of 28 October 2026.
