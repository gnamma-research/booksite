# Darūrī release coordination — 20 October 2026

The user has asked the current Darūrī chats to coordinate site and PDF updates. Use the latest `master` as the shared publication source; make narrow changes and never replace the reader from an older handoff ZIP.

## Active work

- **Study guide:** published 28 questions × Basic (Foundations), Intermediate (Close Reading), and Advanced (Research), arranged into eight teaching units. Source: `daruri/study/lessons-*.json`. Runtime: `study-guide-data.js`, `study-guide.js`, and `study-guide.css`, integrated into the existing `index.html`. The separate 85-page `daruri-study-guide.pdf` companion is built from these same lessons. This companion is distinct from the bilingual reading edition `daruri-study.pdf`.
- **Contents and reading PDFs:** both website views and all five reading PDFs are corrected in the contents-clarity release recorded below. The reference original-heading list is on pp. 260–261; its editorial contents remain on pp. 3–6.
- **Existing five PDFs:** the currently published baseline is the daruri4 full-headwords release in `pdf-editions-manifest.json`. Keep the large bilingual `daruri.pdf` as the default target for text links; retain study bilingual, English, Arabic, and fully vowelled Arabic downloads. Any workstream may update these PDFs when its task requires it; publish replacements with their matching metadata and section destinations, preserving unrelated concurrent work.

## Integration contract

1. Fetch latest `master` immediately before publishing. Reapply focused edits on top of any newer contents/PDF changes; do not force push.
2. If the reference PDF changes, remap all static and dynamic `pdfPage` destinations by stable reader section IDs, including heading popups. A uniform page offset is insufficient.
3. Study lesson links use `#study?topic=<stable-id>&level=basic|intermediate|advanced`; reader section anchors remain stable as `#section=<number>`.
4. The study companion must be generated from the shared lesson JSON so website and PDF explanations, tasks and feedback agree. Keep authorial text, editorial explanations, reported positions and research assignments distinct.
5. Update the download ZIP file list, PDF metadata and service worker assets together. Preserve newer PDF cache-busting versions when merging cache changes.
6. Run the existing heading, language and focus checks plus new guide checks, then verify the actual GitHub Pages URLs and PDF downloads.

## Publication status

This release includes all 28 questions at all three levels and an 85-page companion built from the same JSON sources. Publication is independent of the separate contents/PDF work. Existing five reading PDFs are retained with their verified checksums and section destinations. Initial implementation baseline: `9071d49a584e807b7000a7446843d4da2e9aa92b`; merged the coordination note from `6a2fd23` before publication.

Validation: all 84 lesson renders, 28 assigned-reading sequences and returns, feedback/scroll restoration, level-specific progress, filter/search navigation, print/share behavior, reader preferences, and malformed/direct URLs; existing heading, language and focus checks; all 258 reference-PDF destinations; full PDF content/link/bookmark verification and rendered layout review. Guide companion build provenance is in `study/companion-metadata.json`.

The other chats’ original-versus-editorial contents changes were not yet committed at integration time. Those future releases should preserve the study runtime files and companion, and use the shared source files when updating the guide.

## Contents integration update

The contents integration was published in `27213bbeeb8f4a04a29f1862261b938721a48688`. This documentation update adds [CURRENT_RELEASE.md](CURRENT_RELEASE.md) as the detailed release record and [qa/ORIGINAL_HEADINGS.md](qa/ORIGINAL_HEADINGS.md) as the evidence for the 46-heading source hierarchy. It separates that hierarchy from all 258 editorial section titles in both reader modes, retains ancestors when filtering, and preserves reading returns and toggle focus. The published study-guide release `e5e44918994cfa568553f3af6fbc68b045417a9c`—84 lesson versions and its 85-page companion—is retained.

This integration does **not** claim completion of the separately requested PDF contents regeneration: the five reading PDFs remain the verified daruri4 baseline in the manifest. All workstreams may update reader or PDF content where their task requires it; these records coordinate merges and do not freeze files. Before publishing revised PDFs, fetch the latest source, preserve concurrent guide/reader work, and release the new PDFs with section-based physical-page maps, manifest, download package and matching cache URLs.

### Contents and five reading PDFs — completed in this release

The contents/PDF chat integrated the published study guide (`e5e4491`) and the other upload chat’s original-heading hierarchy (`27213bb`). Both implementations are retained. The website now explicitly says “Two contents lists, one text”, labels the tabs “Original headings · 46” and “Editorial section titles · 258”, and remembers the selected view. The source-heading hierarchy and contextual return behavior remain intact.

All five reading PDFs are corrected and included in this release. The reference is now 261 pages: a restored 46-heading contents list is appended on pp. 260–261 and linked from the front; the existing detailed contents on pp. 3–6 are explicitly editorial. Short lists in every edition are labelled as overviews. The other four page counts remain 129/98/81/92. Every existing body page address is preserved; no section remapping is needed. The manifest records exact revised checksums and sizes, the five PDF cache versions are updated together, and the offline bundle still includes all five plus the separate study-guide companion.

Verification: 6,823 existing PDF links and 1,693 bookmarks retain their exact destinations; 646 unchanged pages have identical extracted text; all 15 changed/new pages were rendered and inspected. All new internal links are valid. Heading, language, focus, and 84-lesson study-guide integration checks pass. The reproducible PDF patcher and audit are in `qa/clarify_pdf_contents_20261020.py` and `qa/pdf-contents-audit-20261020.json`. Future citation or other PDF edits should start from these revised bytes and retain the contents additions; consult the manifest instead of an older ZIP.
