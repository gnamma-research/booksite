# Daruri PDF source-reference build

This build uses the current `edition-r3-20261020.js` reader payload as its authoritative text. It produces the scholarly bilingual, study bilingual, English, Arabic and fully vowelled Arabic PDFs. It retains the two scholarly contents routes, the separate colophon, the existing applications and indexes, and the complete selected historical dictionary articles.

## Citation policy

- Qur’an references appear in all five editions. The reading editions use numbered page footnotes; the study edition shares that sequence with its translation and interpretive notes.
- The scholarly edition retains its existing local apparatus and adds separately labelled Qur’an source and Hadith source notes.
- Hadith and Companion-report source notes appear only in the scholarly PDF. Qualified parallels and unresolved identifications retain their explicit limitations.
- Arabic and English Qur’an quotations share a reference in the bilingual editions. Repeated references on a new page repeat the note using the same number.
- Full historical dictionary articles, translations, existing article notes and new source notes remain in the scholarly back matter. Shared articles are printed once and cross-linked.

The data files retain exact quotation anchors, source URLs, identification qualifications and the 22 narrowly specified changes that separate source locators from existing mixed notes. They preserve the original note IDs and explanatory content.

## Website Notes cards

The reader uses the same 53 Qur’an and 33 hadith source records already present in `edition-r3-20261020.js`. `sections[].noteIds` is the authoritative association with a passage; legacy `note.n` values are not reliable ownership keys. The Notes link counts all displayed records once by ID. Its card shows main-text sources first, separately scoped Bidāya application sources next, and the other notes afterwards. Source qualifications remain verbatim.

Run `python daruri/build/build_source_reference_data.py` to refresh `source-reference-data.js` from the back-matter mappings; `--check` verifies that the export is current. The reader attaches the 12 application-source notes only to each application’s primary section and displays them in the application itself. The 13 dictionary source notes retain their full-article IDs in the export and PDF apparatus. Do not attach those notes to authorial passages or to website excerpts that omit the cited wording.

`qa/verify-reader-source-notes.js` exercises all 259 section routes, complete note bodies/links, counts, source-first presentation and return behavior. Keep the new data script in the HTML, service-worker core and browser download package. The release updater versions it alongside the other scholarly data assets.

## Build

Install `requirements.txt` in an isolated Python environment, with Pango and HarfBuzz available. The retained Noto font files and their SIL Open Font Licenses make font selection reproducible.

```sh
python daruri/build/build_editions.py --output-dir /tmp/daruri-pdfs
```

Use `--edition scholarly`, `study`, `english`, `arabic` or `arabic-vowelled` to rebuild one edition. The output includes each PDF, its source HTML, and metadata containing exact section destinations, source validation and checksums. PDF writes use a temporary file and replace the destination only after completion and internal-link checks.

The build checks every displayed source paragraph, heading and note against the authoritative data before rendering. The full-headword source is the 153-term, 157-article full-headwords release of 20 October 2026, retained as `data/full-headwords.json`. The basic study index preserves the previous edition’s 48 entries.

After the scholarly PDF is complete, export its standalone historical lexicon using the same output directory:

```sh
python daruri/build/export_lexicon.py --output-dir /tmp/daruri-pdfs
```

The exporter retains all 153 term dossiers, 157 complete articles, translations and source notes. Links within the lexicon remain local; occurrence links open the corresponding page of the current online scholarly PDF. It derives those destinations from the scholarly build metadata.

The separate three-level teaching companion uses `daruri/study/build-guide.py` and `daruri/study/build-guide-pdf.py`. Its two Qur’an quotations receive source notes from the shared lesson JSON, and its PDF generator checks that each footnote stays on the quotation page. This companion is separate from the bilingual study reading edition.

## Release

Fetch the latest `master` before publishing and preserve concurrent reader and study-guide changes. After all five PDFs pass layout review, install their bytes in `daruri/` and use `update_release.py` to remap static and dynamic PDF links by stable section IDs, update download metadata and cache versions, and preserve the separate 85-page study-guide companion.

Do not infer a page map from a constant offset. The scholarly PDF is the default reference target. Keep its metadata, all 565 static PDF destinations and all 259 dynamic section destinations together in the same release.

When the teaching companion has also changed, pass `--refresh-study-companion` to the release updater. This explicitly checks the installed companion against `daruri/study/companion-metadata.json`, refreshes its manifest identity and the changed guide asset URLs, and preserves newer print and stylesheet assets. Use the same flag for the final `--check`.
