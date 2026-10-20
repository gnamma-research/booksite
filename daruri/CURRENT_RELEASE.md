# Darūrī — current release and coordination record

Updated 20 October 2026. Read the shared [active release coordination note](DARURI_RELEASE_COORDINATION_2026-10-20.md) alongside this record, [the PDF manifest](pdf-editions-manifest.json), and the latest `master` source when integrating parallel work. The dated 19 October handoffs are historical; their 170-page PDF references and superseded control descriptions do not describe this release.

Canonical repository: `gnamma-research/booksite`, branch `master`.

Canonical reader: [https://gnamma-research.github.io/booksite/daruri/](https://gnamma-research.github.io/booksite/daruri/).

## Verified publication base

The five-PDF release was published in `f7fe0c8460e7d70f141166fba277f9ed7d9bd7d5`. Commit `9071d49a584e807b7000a7446843d4da2e9aa92b` then versioned the changed PDF/data URLs for returning readers. Its GitHub Pages deployment completed successfully. The study guide was then published in `e5e44918994cfa568553f3af6fbc68b045417a9c`. The contents integration accompanying this record preserves that newer release; these historical commit references are not instructions to check out an older revision.

| Stable website filename | Edition | Current pages |
| --- | --- | ---: |
| `daruri.pdf` | Large bilingual reference, with full headwords | 259 |
| `daruri-study.pdf` | Bilingual study | 129 |
| `daruri-english.pdf` | English reading | 98 |
| `daruri-arabic.pdf` | Arabic reading | 81 |
| `daruri-arabic-vowelled.pdf` | Arabic fully vowelled | 92 |

`daruri.pdf` is the destination for reader text and heading-reference links. The other four editions are separate download choices. The manifest records exact source filenames, byte sizes, SHA-256 checksums, page counts and the default-for-text-links flag; update it with every PDF replacement. The current files come from the 20 October daruri4 release and its separate vowelled Arabic edition.

The separate `daruri-study-guide.pdf` companion is also published: **85 pages**, generated from the same **28 questions × three levels (84 lesson versions)** as the website guide. It is additional to the five reading editions above and does not replace `daruri-study.pdf`. Its checksum and size are recorded under `companions` in the PDF manifest; build provenance is in `study/companion-metadata.json`.

## Published contents update

Commit `27213bbeeb8f4a04a29f1862261b938721a48688` publishes the contents integration on top of the study-guide release. The two guides now expose different navigation structures in both the enhanced reader and the no-JavaScript fallback:

- **Original headings:** 46 main-text heading records from the Arabic edition, displayed in a conservative hierarchy. Preserve the recorded Arabic and existing English translations, including generic headings such as “Chapter.” The parent map and its textual evidence are documented in [qa/ORIGINAL_HEADINGS.md](qa/ORIGINAL_HEADINGS.md).
- **Editorial titles:** 258 descriptive titles, one for every numbered main-text section, grouped by the editor's topical part labels.
- The unheaded opening, §§1–9, has a separate access link explicitly marked as a navigation aid. Do not manufacture an original Arabic rubric for it.
- The copyist's colophon and ownership record remain separate from the main-text hierarchy. They add one entry to each guide.
- Original-heading filtering retains ancestors for context and searches displayed heading fields. Mode changes preserve the reading-return control and keyboard focus. Following a section and returning to Contents must retain the selected mode, query and place.

The existence of a heading in the Arabic edition is not by itself proof of its manuscript provenance or attribution to Ibn Rushd. Keep printed-source headings, editorial navigation labels and later manuscript records distinct.

## Parallel work and publication status

| Workstream | Recorded scope | Verified integration status at this audit |
| --- | --- | --- |
| “Check Daruri Text Ways” | Clarify the two contents systems in the PDFs as well as on the website; regenerate and upload the affected PDFs. | No finished replacement PDF artifact or publication commit was confirmed. The five files in the manifest remain the verified publication base. |
| “Study Guide Improvement Review” | Develop basic, intermediate and advanced study routes across the 28 study questions, and correct identified issues. | Published in `e5e44918994cfa568553f3af6fbc68b045417a9c`: all 84 lesson versions across 28 questions and an 85-page companion, with shared lesson sources and reader integration. Preserve these files and any subsequent guide fixes when merging contents/PDF work. |

These statuses come from recorded updates and repository inspection. They do not imply acknowledgement from another live chat. The shared coordination note was published at `6a2fd23ffcfd670c82a6b4e54b9a11186f4007f1`, followed by the study-guide release at `e5e44918994cfa568553f3af6fbc68b045417a9c`. This record incorporates the latter publication status, while the revised contents PDFs remain pending until their actual finished files and matching page maps are verified. Recheck current artifacts and `master` before integrating; this table is not evidence that work remains unfinished indefinitely.

All current workstreams remain authorized to update both PDFs and reader wherever their task requires it. This record is a merge guide, not a file lock or a freeze on later improvements.

## Merge and publication invariants

1. Fetch the latest `master` HEAD and relevant blobs immediately before preparing a publication. Apply surgical changes to that current source. Do not replace `daruri/index.html` with an older ZIP, PDF-derived reconstruction or stale handoff copy.
2. Preserve unrelated work, especially the study-guide runtime, `study/` lesson sources, `daruri-study-guide.pdf`, reader integration, themes, Arabic/English and vowel controls, focus modes, numbered dock, dictionary/context returns, scholarly text, notes, source labels and stable section anchors. The current corpus has 259 section records, including the separate colophon, and 416 aligned passages.
3. Publish related files in one commit/tree, using a compare-and-swap `expected_sha` check on the branch update with `force: false`. If HEAD changed, fetch it and merge the actual differences before retrying. Never force an older whole-file version over another chat's work.
4. Replace PDFs at the stable filenames above. Every reference-PDF replacement requires a fresh **section-ID to physical-PDF-page map**, derived from the new PDF's bookmarks or verified destinations. Do not apply a global page offset: sections that formerly shared a page can move to different pages.
5. Update all **306 static contents PDF links** and **259 static heading-popup PDF links**—565 static destinations in total—plus all **259 dynamic `sections[].pdfPage` values**. Update the displayed PDF page text and accessible labels with the destinations. Source-edition Arabic pagination is a separate reference system and must not be overwritten with Gnamma PDF page numbers.
6. Update the manifest's source filenames, byte sizes, SHA-256 checksums and page counts. Keep both five-link download panels, their edition descriptions/page counts, and the five main PDF entries in `download-bundle.js` consistent. Preserve the published study-guide companion/runtime assets, supplementary Bou Akl variant report and the rest of the offline package.
7. Version changed PDF/data/script URLs and align service-worker cache URLs with them. Increment the service-worker cache name for the release. Returning readers must receive the new page map together with its matching PDF.
8. Run the relevant checks described in [qa/EDITING_LARGE_READER.md](qa/EDITING_LARGE_READER.md), including heading, language and focus checks. Verify the deployed files and navigation, including both contents routes, filtered ancestor paths, return position, all five PDF downloads and the offline bundle. Distinguish source checks, browser checks and real-device checks in the release report.

When parallel work is incorporated, update this record with its actual artifact/checksum and publication status. Keep planned, implemented and deployed work distinguishable.
