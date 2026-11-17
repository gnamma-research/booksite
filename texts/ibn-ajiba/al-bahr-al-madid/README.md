# The Immense Ocean · Volume I

Complete Arabic–English web reader for Ibn ʿAjība’s al-Baḥr al-Madīd, prepared for `texts/ibn-ajiba/al-bahr-al-madid/` in the Gnamma library.

The canonical import contains 389 complete source units, 1,565 English segments, 209 current translator annotations, 241 Cairo notes, 48 report dossiers, 352 source occurrences, 37 critical questions and the full recovered indices. `edition-manifest.json` records the download hashes and editorial scope. The four PDFs are unchanged files from the recovered Revision XIX package.

The app is static: `index.html`, `style.css`, `core.js`, and `app.js`. `data/catalog.js` supplies lightweight navigation; the remaining data scripts load on demand. The 39 passage chunks preserve the recovered XXIII canonical records without textual changes. Do not edit source wording as part of interface changes. The Arabic and English are paired at passage level, without a claim of verified paragraph-by-paragraph alignment.

No experimental or newly added vowelling layer is loaded. Source marks may be hidden as a display preference. Shared dictionary excerpts retain their source attributions; occurrence anchors are specific to this volume.

Reading Desk storage is browser-local and uses the `gnamma-bahr-vol1-` prefix. Backup imports merge rather than replace, preserve original dates, and retain conflicting notes separately. Personal annotations target the web text, not unverified PDF coordinates.

`offline-reader.zip` includes the complete standalone reader, reference data, static fallback pages and licensed fonts. PDF editions remain separate online downloads. `sw.js` supports optional full-reader caching; update its version when publishing changed assets. No build framework or package installation is required to serve the website.

The site uses its own scoped assets and service worker. Do not replace or modify the parallel `daruri/` project when updating this reader.
