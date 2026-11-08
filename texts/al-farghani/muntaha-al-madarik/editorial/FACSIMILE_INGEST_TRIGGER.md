# Farghānī I1876 source scan acquisition trigger · 9 November 2026

This is an **explicit, reproducible one-off request** to retrieve images from the Princeton/NYU public-domain scan of the 1293/1876 *Muntahā al-madārik* volume I using the project's workflow.

- IIIF manifest: https://sites.dlib.nyu.edu/viewer/api/presentation/books/princeton_aco000264/manifest.json
- Low-res fallback: https://mc.dlib.nyu.edu/files/books/princeton_aco000264/princeton_aco000264_lo.pdf
- Script: tools/farghani_iiif_ingest.py
- Workflow: .github/workflows/farghani-historical-facsimile-ingest.yml

**Evidence policy**: acquisition is not textual collation. Record scan index, canvas label, image URL and SHA. Do not promote image count or OCR output to any “established variant” until inspected at the actual reading. Distinguish I1876 page numbers from PDF/image indexes and from modern B2007 page numbers. If the source is inaccessible, the workflow logs and saved report establish the access failure, not a conjectured reading.

## Retry 2 — PDF fallback rendering fix

The initial source capture verified that the NYU IIIF manifest has 368 canvases and the 37.30 MB PDF was downloadable on the runner, but the runner lacked the previous poppler command. The script now uses PyMuPDF directly to render the downloaded 1876 facsimile. Do not equate image capture with independently verified readings.
