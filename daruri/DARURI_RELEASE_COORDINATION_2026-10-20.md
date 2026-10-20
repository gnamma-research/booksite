# Darūrī release coordination — 20 October 2026

The user has asked the current Darūrī chats to coordinate site and PDF updates. Use the latest `master` as the shared publication source; make narrow changes and never replace the reader from an older handoff ZIP.

## Active work

- **Study guide:** implementing 28 questions × Basic (Foundations), Intermediate (Close Reading), and Advanced (Research), arranged into eight teaching units. Source: `daruri/study/lessons-*.json`. Runtime: `study-guide-data.js`, `study-guide.js`, and `study-guide.css`, integrated into the existing `index.html`. A separate `daruri-study-guide.pdf` companion will be built from these same lessons. This companion is distinct from the bilingual reading edition `daruri-study.pdf`.
- **Contents and PDF work in other current chats:** preserve the distinction between the original printed headings and the editorial section titles. Recent chat context describes a 46-heading original view versus 258 editorial sections, and restoration of a separate original-heading list in the reference PDF. Check actual repository state before claiming those pending changes are published.
- **Existing five PDFs:** the currently published baseline is the daruri4 full-headwords release in `pdf-editions-manifest.json`. Keep the large bilingual `daruri.pdf` as the default target for text links; retain study bilingual, English, Arabic, and fully vowelled Arabic downloads. Study-guide work must not overwrite these binary PDFs.

## Integration contract

1. Fetch latest `master` immediately before publishing. Reapply focused edits on top of any newer contents/PDF changes; do not force push.
2. If the reference PDF changes, remap all static and dynamic `pdfPage` destinations by stable reader section IDs, including heading popups. A uniform page offset is insufficient.
3. Study lesson links use `#study?topic=<stable-id>&level=basic|intermediate|advanced`; reader section anchors remain stable as `#section=<number>`.
4. The study companion must be generated from the shared lesson JSON so website and PDF explanations, tasks and feedback agree. Keep authorial text, editorial explanations, reported positions and research assignments distinct.
5. Update the download ZIP file list, PDF metadata and service worker assets together. Preserve newer PDF cache-busting versions when merging cache changes.
6. Run the existing heading, language and focus checks plus new guide checks, then verify the actual GitHub Pages URLs and PDF downloads.

## Publication status

Coordination note published before the guide release. The guide implementation and companion are in progress; this note is not a claim that those files are already live. Initial implementation baseline: `9071d49a584e807b7000a7446843d4da2e9aa92b`. The release completion update will record tested guide scope and PDF status.
