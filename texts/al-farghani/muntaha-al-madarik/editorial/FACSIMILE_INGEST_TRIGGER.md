# Farghānī I1876 source scan acquisition trigger · 9 November 2026

This is an **explicit, reproducible one-off request** to retrieve images from the Princeton/NYU public-domain scan of the 1293/1876 *Muntahā al-madārik* volume I using the project's workflow.

- IIIF manifest: https://sites.dlib.nyu.edu/viewer/api/presentation/books/princeton_aco000264/manifest.json
- Low-res fallback: https://mc.dlib.nyu.edu/files/books/princeton_aco000264/princeton_aco000264_lo.pdf
- Script: tools/farghani_iiif_ingest.py
- Workflow: .github/workflows/farghani-historical-facsimile-ingest.yml

**Evidence policy**: acquisition is not textual collation. Record scan index, canvas label, image URL and SHA. Do not promote image count or OCR output to any “established variant” until inspected at the actual reading. Distinguish I1876 page numbers from PDF/image indexes and from modern B2007 page numbers. If the source is inaccessible, the workflow logs and saved report establish the access failure, not a conjectured reading.

## Retry 2 — PDF fallback rendering fix

The initial source capture verified that the NYU IIIF manifest has 368 canvases and the 37.30 MB PDF was downloadable on the runner, but the runner lacked the previous poppler command. The script now uses PyMuPDF directly to render the downloaded 1876 facsimile. Do not equate image capture with independently verified readings.

## Retry after PDF renderer repair

The first workflow run parsed 368 IIIF canvases but downloaded no individual images because the IIIF response uses an unexpected structure; its PDF fallback successfully fetched the full low-resolution file but failed at `pdfinfo` (not installed). The corrected pipeline now uses PyMuPDF for PDF page rendering. This trigger requests a new **finite** one-off attempt. Any scans are **uncollated** until visually examined; no claim of definitive edition is allowed on download success alone.

## Archival retry after successful image render

The 1876 PDF image rendering was confirmed successful in run 42536981050, yielding 59 scan JPEGs and 3 contact sheets. Its branch push was rejected because other commits arrived during image generation. The revised workflow now rebases and retries. Re-run acquisition once to preserve the photographed witnesses in GNAMMA's canonical repository. Source comparisons I1876 p.5/6/7 are documented in I1876_COLLATION_001.md; no manuscript claims.
