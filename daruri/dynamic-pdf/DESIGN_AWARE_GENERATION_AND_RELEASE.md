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

## Why another typography needs another signed source design

A fixed PDF does **not** contain sufficient layout instructions to turn a
parallel A4 book into a correctly paginated single-column A5 or Letter edition.
In particular, its publisher footnotes, Arabic shaping, cross-page references
and Pango source rectangles must be regenerated; changing page size in the
PDF composer would silently break scholarly integrity.

To add a new **real** design such as `gnamma-a5-compact-v1`:

1. Add its canonical PDF text/pagination template (HTML/CSS and fonts) to the
   controlled source build. Render **one body-source PDF per distinct combination
   of layout, language, vocalisation, heading policy and publisher-note policy**.
   A different page size/line spacing requires a new source base.
2. Review page samples and footnotes. Run original 414 Arabic segment Unicode
   find/copy/highlight tests, all 258 source named anchors, English search and
   625 canonical explanatory/source-note record checks on this particular PDF.
3. Assign a new `design_style_id` and explicitly sign the new source PDF, the
   source section/Pango word map and its `paper_size`, `packet_layout`,
   `density` in `editions/manifest.json` and `editions/maps/manifest.json`.
4. Typeset a **matching new set of apparatus packets** from the same canonical
   HTML/CSS using the registered `design-styles.json` styles; proof with
   `render_design_packets.py --preview` first. A5 and US Letter prototypes are
   real WeasyPrint outputs but marked *template-only*, never released editions.
5. Build a new signed `packet-map` and **edition-specific source-link profile**
   from the actual new style source + packet pages (no copying A4 coordinates).
   The signed manifests must explicitly bind `design_style_id`.
6. Add the independently certified editions to the approved apparatus manifest.
   The design registry and PDF composer refuse them until paper size, hashes,
   source maps and packet/link-map styles all match.
7. Pass pixel/page/text/notes/link/personal-export and real-reader acceptance.
   Only then enable the corresponding new style in the Editions UI.

The dynamic composer validates media-box dimensions on **every** source and
apparatus page. It rejects incompatible page sizes and incorrect source+packet
page counts. This is a deliberate hard failure, not a fallback to a similar PDF.

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
