# Darūrī — pure browser HTML → PDF acceptance experiment

**Status: exploratory; NEVER a production PDF source and NEVER a reason to delete the approved PDFs.**

## What this tests

An actual webpage, with **no privileged browser DevTools/CDP API, no server-side PDF generation, no pretypeset PDF input, and no browser Print/Save dialog**, obtains the real canonical data (`edition-r3-20261020.js`) through a small same-origin fixture, shapes/paginates the Arabic/English HTML/CSS using Vivliostyle inside the user's browser, and emits an actual vector PDF Blob using `vivliostyle-pdf` / `@pdfme/pdf-lib`. The downloaded PDF is then independently reopened using MuPDF to measure what readers can search and copy.

The fixture has both six representative source units and **all 258 authorial reading units / 414 bilingual passages**. It deliberately inserts one *synthetic, clearly identified* raised footnote call into **§65:1 «وَفِي أَلْفَاظِهِ»** to reproduce the difficult note interruption. That synthetic note is **not** merged into the authoritative book. More complete Study tests must use all actual canonical notes and their placement policies, not this smoke fixture.

No user personal notes, Reading Desk data, uploads or external PDF service are consulted. The browser PDF output is never made an edition on the live site.

## Repeat the experiment

On a separate CI branch:
```sh
python daruri/browser-html-pdf/build_fixture.py --out daruri/browser-html-pdf/fixture.json
npm install --prefix daruri/browser-html-pdf --no-package-lock
npm run build --prefix daruri/browser-html-pdf
# launch Vite through the documented npm dev script; use browser controls
```

CI builds the fixture from the repo's canonical Python reader parser (stdlib only), starts the normal Vite static server, opens Chromium/WebKit through Playwright *only to click the site's ordinary Generate PDF button and save the resulting download*, and then calls `verify_native.py`. Playwright never calls its own `page.pdf()`/Chromium `printToPDF` mechanism. PDF source text, link destinations, font bytes and note bodies never leave the user device during generation.

## Release acceptance: all conditions, not selected green metrics

* **Text correctness:** 414/414 complete authorial Arabic paragraphs in correct reading order, 414/414 English paragraphs, full diacritic-bearing and insensitive query tests, and exact 2-/4-word native search with aligned highlights and clean clipboard content. Test text/geometry under native macOS/iOS PDFKit, Adobe Acrobat, Android PDFium, PDF.js, Poppler, MuPDF. Must NOT inject a second invisible, selectable paragraph which produces duplicate/corrupt text.
* **Source-note interruption:** §65:1 exact phrase remains searchable and copied correctly across the raised footnote marker; its distinct reference label and return link remain functional.
* **Study edition:** the full set of actual Study translation/interpretation/Qurʾān note bodies, 176 known call checks and 119 checked printed note occurrences, with correct numbering and same-page call/body placement; the synthetic note in the fixture is NOT sufficient.
* **Publication geometry:** pixel/word/page/bookmark equality to approved A4 versions or an explicitly reviewed new typesetting version, no clipped fragments, original recorded rubrics distinct from editorial titles, 258 section source anchors, all scholarly apparatus and citations.
* **Native file download:** full book and excerpts must produce a nonempty, tagged/structured, searchable PDF Blob in ordinary Chromium/WebKit, with real iOS and Android device tests, cancellation, bounded memory, no external services and no unsafe reuse of stale profiles.
* **Code rights:** `vivliostyle-pdf` is LGPL; its `@vivliostyle/print`/Vivliostyle core dependency is AGPL-3.0; the PDF writer `@pdfme/pdf-lib` is MIT. Before publication, assess AGPL/GPL obligations, bundled fonts and frontend integration with the Gnamma site, rather than treating a successful demo as permission to redistribute without review.

Fail-closed: this research proof must not be wired to the current Editions download button while any strict source or note acceptance gate fails. The already-passing **HTML → WeasyPrint → 12 reusable sources + 15 packets → browser pdf-lib composition** is a separate, reliable fallback and should not be removed to pursue this more ambitious fully browser-only option.

References:
* https://github.com/vivliostyle/vivliostyle-pdf — browser PDF emitter and its documented limitations, including approximate baselines
* https://docs.vivliostyle.org/en/reference/api/ — Vivliostyle browser CSS typesetter/print API
* https://github.com/gnamma-research/booksite/issues/44 — original Arabic Unicode/footnote publication gate
* https://github.com/gnamma-research/booksite/issues/50 — cross-workstream coordination and static fallback policy
