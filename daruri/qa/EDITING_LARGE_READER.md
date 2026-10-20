# Editing the large Darūrī reader through the GitHub connector

The canonical page is `daruri/index.html` on the default branch. It includes the reader, no-JavaScript fallback, inlined editorial/dictionary JSON, styles and scripts. **Do not recreate this file from a PDF or an earlier copy.**

## GitHub connector workaround

The GitHub repository Contents API is unreliable for returning files above ~1 MB; its metadata may be returned with an empty `content`, even when a line range is requested. This is an API/connector response issue, **not an iOS versus desktop limitation**.

Use this sequence in normal Chat mode:

1. Read `daruri/index.html` with GitHub `fetch_file` to obtain the *current blob SHA*. Its content may be empty; the SHA is usable.
2. Call GitHub `fetch_blob(repository_full_name="gnamma-research/booksite", blob_sha=<SHA>)`. The Git blob route returned the complete ~4 MB HTML on 2026-10-19.
3. Make small, exact-match changes to that complete string *in memory*; require unambiguous match counts. Do not output the entire file in chat.
4. Confirm that the complete `dictionaryData` + `editionData` + runtime script tail remains byte-for-byte identical for presentation-only edits, and that static and enhanced reader controls are preserved.
5. Call GitHub `update_file` with the **original fetched blob SHA** and the complete replacement HTML. A conflict indicates concurrent updates; re-fetch before retrying. Never force overwrite a newer revision.
6. Increment the cache version in `daruri/sw.js` for a UI release and re-fetch the new blob to run static structural/syntax checks.

This sequence succeeded on 19 October 2026. The UI change was committed in `4ad9f152f84232b37bee4b81445116880290c059` and the cache refresh in `1ea36cf88e4236ca775d30db72915911c709da58`.

## Release checks

- `editionData.sections.length === 259`, including the separate copyist's note, and `editionData.stats.passages === 416`.
- 259 static reading section anchors, intact glossary/index apparatus, all numbered dock elements.
- Valid inline reader JS syntax (parsing the final script).
- `node daruri/qa/verify-heading-contract.js` and `node daruri/qa/verify-language-cycle.js` when a local checkout/runner is available.
- Test mobile and desktop rendering, as source checks alone do not establish visual-browser correctness.

The five sidebar PDF links are live: `daruri.pdf` (259-page bilingual reference), `daruri-study.pdf` (129-page bilingual study), `daruri-english.pdf` (98 pages), `daruri-arabic.pdf` (81 pages), and `daruri-arabic-vowelled.pdf` (92 pages). The reference PDF is the daruri4 full-headwords release of 20 October 2026 and remains the destination for text links. `pdf-editions-manifest.json` records the exact source filenames, SHA-256 checksums, sizes, and page counts. Do not reintroduce pending-upload labels. The 304 contents links and 259 heading popups, plus every dynamic `sections[].pdfPage`, use physical pages from this reference PDF. When replacing it, remap by stable section ID using the PDF bookmarks: an old page may contain sections that move to different new pages, so a global old-page offset is unsafe. Keep both five-link download panels, the offline bundle defaults, and the service worker cache in sync.

The large scholarly payloads are now loaded by `edition-r3-20261020.js` and `dictionary-r3-20261020.js`. The initial `{}` in the inline data elements is intentional; use `qa/load-book.js` for source-only tests, or read the populated element after the browser loads the external scripts. Never replace those placeholders with an old corpus.

Reference returns preserve filters, expanded entries, nested scroll positions and keyboard focus. The standalone dictionary also preserves its selected term, display tab and source filter; its same-site links use the reader’s source-aware navigation. The Contents launcher remains usable in Normal mode and hidden in Focus 1–3. The retired right Context pane must stay retired.

## Longer-term maintenance option

Extract CSS and JavaScript, then scholarly data, into source-controlled modules *only after* checksum verification and regression tests. That may reduce editor friction and improve caching, but is not a prerequisite for GitHub updates. Preserve the fully functional no-JavaScript fallback.
