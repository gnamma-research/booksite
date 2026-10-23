# Darūrī: 12 verified source designs → 120 locally generated apparatus editions

**State: experimental, opt-in. Do not delete approved publications or move this branch directly onto the live site.**

## The actual composition algorithm

Each published A4 source PDF retains its exact visible text, original footnotes,
Arabic/English column arrangement, part headings, publisher notes, and source
navigation. The browser merges the **signed bytes of that particular source** with
one independently typeset **signed HTML/CSS scholarly-apparatus packet**.
Finally, the generator creates hyperlinks and bookmarks using a **signed,
edition-specific** link map. User Reading Desk annotations are optionally appended
as a separate searchable **P-numbered** personal endnote layer entirely on-device.

The twelve source PDFs include different real book designs (language, vowel marks,
recorded/editorial headings, Study note arrangements). **Eight** currently have
approval to receive scholarly appendices:

| Existing source family | Headings | Source PDFs | Approved apparatus variants |
|---|---|---:|---:|
| Reading: bilingual vowelled | recorded/editorial | 2 | 30 |
| Reading: bilingual unvowelled | recorded/editorial | 2 | 30 |
| Reading: English-only | recorded/editorial | 2 | 30 |
| Study: bilingual with page-bottom footnotes | recorded/editorial | 2 | 30 |
| Reading: Arabic-only unvowelled | recorded/editorial | 2 | 0 (no verified English appendix) |
| Reading: Arabic-only vowelled | recorded/editorial | 2 | 0 (no verified English appendix) |
| **Total** | | **12** | **120** |

Each eligible body source has **15** nonempty combinations of **four** reusable
apparatus components: glossary, index, concordance and Bidāya applications.
The corpus, apparatus articles and source-note content are from the canonical
Gnamma publication, *not* from a fresh AI translation or user-provided text.

The five canonical PDFs in the approved manifest, including the differently
typeset Scholarly/Reference edition, are separately listed in the design UI.
They are **not** falsely described as derivable by changing a checkbox on an
incompatible A4 source. These remain directly downloadable.

### “Exactly” means publication-equivalent, not the same bytes

The generated PDF has the same page count, identical pixels on every page,
word-order extraction and word coordinates, original named sections, editorial
bookmarks and the **same meaning, destinations and geometry of every approved
apparatus hyperlink**, with sub-0.002 pt allowable floating serialization noise.
PDF object numbering, metadata, compression, SHA-256 and some base-source
hyperlink instances can differ. A checksum difference is **not** evidence of
visual divergence. The independent test checks the original source PDF's full
source-link set, allowing preservation of source links lost by an earlier
published PDF merging process.

Authoritative tests:
- `daruri/qa/verify_dynamic_apparatus_links.py`: imported directly from the
  formerly passing independent six-shard test, not the deprecated one-decimal
  precision comparator
- `daruri/dynamic-pdf/test_parity.py`: one parity gate used by both experiment
  workflows (no contradictory QA standards)
- `daruri/dynamic-pdf/test_design_catalog.cjs`: every approved source+packet
  SHA/design/publisher-note correspondence; rejects fake layout transformations
- `daruri/qa/verify_dynamic_design_browser.cjs`: browser proves actual generated
  Reading/English/Study PDFs, all 120 options and five separately approved designs

## Release scope: existing A4 editions only

The active generator supports exactly the **twelve currently verified A4
source PDFs**, the **fifteen canonical scholarly apparatus packets**, and the
**120 previously approved combinations**. The catalogue does not accept a
different paper size, typography style, layout or unknown set of source notes.
It preserves the genuine differences among Reading/Study, Arabic/English
presentation, editorial titles and publisher footnotes.

A separately typeset canonical edition is shown as an existing direct PDF,
not presented as if it could be recreated with an unrelated source and packet.
All unapproved experimental print-layout templates and workflows have been
excluded from this development branch to avoid diversion from the 120-edition
release target. The current task is **A4 composition and source-search
certification**, not development of a new typesetting system.

The assembler checks page dimensions on **every source and appendix page**.
It rejects mismatched paper sizes and incorrect source-plus-packet page counts,
rather than silently resizing pages. No reflow or custom print-style injection
is permitted.

## Native Arabic search is an independent release gate

The **original approved Arabic source PDFs** still require their production
Unicode repairs before a final switch. The experimental 414/414 PyMuPDF/PDFium/
macOS PDFKit results on some profiles cannot be transferred to a new design's
SHA. The difficult scholarly §65 inline-source-note case and bilingual Poppler
reading order still require a single accepted cross-viewer solution. Further
real iOS, Android and Adobe Acrobat checks are necessary. The confirmed separate
P-note appendix Unicode fix is not evidence the original Ibn Rushd pages are
correctly searchable.

## Phased release and rollback

Do **not** delete the 120 approved static PDFs from GitHub or hosting yet.
Publish this generator only after the final exact SHA passes the 120-profile
parity test, note policy, Arabic/English original-source search, personal
annotation, cancellation/privacy and genuine-device gates. Initially keep the
old direct links accessible as a rollback fallback. After a controlled deployment,
reproduce and test all 120 profile downloads **without those files being on the
network** in a staging environment, with no silent wrong-edition fallback,
before proposing any static-file removal.

The 120 current static apparatus PDFs total ~145.4 MB. The reusable 12 source
PDFs total ~9.4 MB, the 15 default packet PDFs ~1.68 MB, and the 120 signed
profile link maps ~15 MB. Size savings are real even though the twelve distinct
body layouts remain pretypeset. This avoids ever storing a large static PDF
for every possible *apparatus combination*, not every genuinely distinct book
typography.
