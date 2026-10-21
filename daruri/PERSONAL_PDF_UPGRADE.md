# Personal PDF export v3 — searchable notes and verified source highlights

The published Darūrī PDFs remain unchanged. The default No notes option opens
the original PDF and does not include personal data. All processing of personal
notes takes place locally in the browser without accounts or a database.

## Improved capabilities

The appendix retains an Arabic-safe visual rendering and adds an embedded
Unicode PDF text layer using locally hosted, licensed Noto Serif and
Noto Naskh Arabic fonts. This enables standard PDF text extraction, search
and copying of English, Arabic and accented French. The original book pages
retain their published text, contents and outlines.

Each of five PDF editions has its own checksum-bound word-position map under
daruri/personal-anchor-maps/. These were regenerated from the actual WeasyPrint
layout and compared to published section anchors. Every map achieved greater
than 99% segment coverage. Only unique matches use native PDF Highlight
annotations with precise QuadPoints and a Unicode popup. Ambiguous matches,
cross-page spans, missing map data or shifted layouts do not produce a guessed
highlight; the verified section-level comment and printable appendix remain.

## Compatibility and limitations

Automated browser QA covers desktop Chromium, mobile WebKit (iOS-style),
and Android-style mobile Chromium. It verifies true source highlights, real
English/Arabic/French text extraction from generated PDF pages, navigation,
print output, no-notes defaults and no third-party requests.

Some native mobile PDF viewers expose annotations and invisible text layers
differently. The website cannot control whether their search field, copied text
selection, annotation popups or highlights are accessible. The visibly
rendered appendix is always printable and legible. Slight selection geometry
differences may occur with mixed right-to-left and left-to-right text. Tests
are browser simulations, not physical-device certification.

Exact highlights are restricted to unique, single-page matches with
verified coordinates; otherwise a section-level note is used. This prevents
incorrect highlights. The Reading Desk JSON backup should be preserved to
transfer/edit notes between devices; exported PDFs are snapshots.

## Rebuild and audit

Install pinned requirements from daruri/build/requirements.txt and run:

  python daruri/build/build_personal_anchor_maps.py --publish

Only regenerate maps against their exact published PDF hashes; never borrow
coordinates from another edition.

Persistent CI: .github/workflows/personal-semantic-pdf.yml
Matcher/anchor checks: daruri/qa/verify-personal-pdf-upgrade.cjs
Browser QA: daruri/qa/verify-semantic-personal-pdf.cjs

The five original published PDF files have not been modified.
