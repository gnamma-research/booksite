# Daruri PDF source-reference build

This build uses the current `edition-r3-20261020.js` reader payload as its authoritative text. It produces the scholarly bilingual, study bilingual, English, Arabic and fully vowelled Arabic PDFs. All five editions have a compact contents list based on the 46 recorded headings. The scholarly bilingual, study bilingual and English editions also contain a clearly labelled editorial guide to all 258 reading units; the Arabic editions do not. Full editorial section descriptions are confined to that guide and its separate bookmark branch, while recorded rubrics govern the reading text. The separate colophon, applications, indexes and complete selected historical dictionary articles are retained.

## Citation policy

- Qur’an references appear in all five editions. The reading editions use numbered page footnotes; the study edition shares that sequence with its translation and interpretive notes.
- The scholarly edition retains its existing local apparatus and adds separately labelled Qur’an source and Hadith source notes.
- Hadith and Companion-report source notes appear only in the scholarly PDF. Qualified parallels and unresolved identifications retain their explicit limitations.
- Arabic and English Qur’an quotations share a reference in the bilingual editions. Repeated references on a new page repeat the note using the same number.
- Full historical dictionary articles, translations, existing article notes and new source notes remain in the scholarly back matter. Shared articles are printed once and cross-linked.

The data files retain exact quotation anchors, source URLs, identification qualifications and the 22 narrowly specified changes that separate source locators from existing mixed notes. They preserve the original note IDs and explanatory content.

## Website Notes cards

The reader uses the same 50 Qur’an and 33 hadith source records already present in `edition-r3-20261020.js`. `sections[].noteIds` is the authoritative association with a passage; legacy `note.n` values are not reliable ownership keys. The Notes link counts all displayed records once by ID. Its card shows main-text sources first, separately scoped Bidāya application sources next, and the other notes afterwards. Source qualifications remain verbatim.

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

## Source structure and compact contents

The source parent map is the prose-aware hierarchy documented in `qa/ORIGINAL_HEADINGS.md`. A custom PDF outline uses the exact section-anchor coordinates; source parts and subdivisions are primary, the later colophon is separate, and editorial reading titles form a separately identified branch only in editions with English. Arabic editions use Arabic source headings in their outline. Guide subheads no longer compete with main divisions.

The two contents lists use compact two-column typography. The first translates the recorded headings in English-containing editions; the Arabic editions print the Arabic rubrics. The second contains all numbered editorial titles with an explicit attribution. Original parts and detailed reading titles are different finding aids to the same preserved text.

The subject index precedes the dictionary. A compact subject-group guide uses the same `subject-index-data.json` taxonomy as the website; its example links lead to alphabetical entries or, in the basic study index, directly to passages. All PDF text is black with white backgrounds and fine rules. Existing source-note inclusion rules remain unchanged.

Metadata records the source and editorial contents page ranges, validates 46 source-outline entries and 258 editorial entries where applicable, and preserves all259 exact section destinations for website remapping.


## Editions & Printing catalog — 21 October 2026

The dedicated #editions route is organised in the approved order: (1) Reading & Printing, (2) Study, (3) Reference. It is available from the left navigation, Home, and the existing Downloads menus. Those five original PDF links remain available with their existing destinations; the no-JavaScript fallback provides the same ordered tiers and published file links.

Reading & Printing now has a browser-side A4 configurator: language (English, Arabic, bilingual), one/two columns (parallel or stacked for bilingual), vowel marks, comfortable/balanced/compact margin presets, no/essential notes, full text/major part/lesson/section range. The preview is generated from the current canonical text, not a placeholder. Print / Save as PDF uses the browser's own print dialog and does not upload text or user data. The desktop and mobile layout responds to current reader palettes. The full source remains unabridged for selected complete sections.

Study provides the published fixed bilingual study PDF, the companion study guide, and a separate custom Study print configuration with selected translation, interpretation and source notes. Reference stays a fixed link to the scholarly PDF and is intentionally not customisable.

Both Reading and Study have the optional 'Include editorial section titles' checkbox. Source headings are always present and are never labelled editorial. The reading preset defaults to OFF; study defaults to ON. Existing editorial descriptions are English only in the canonical reader data; when enabled in an Arabic-only printout, the titles remain visibly labelled English editorial descriptions rather than being presented as authorial Arabic headings.

Browser assets: editions.js and editions.css, version 20261021-editions1. Their versions must remain matched in index.html and sw.js. Both are included in download-bundle.js. The PDF build source, build/print_editions.py, supports optional --editorial-titles on/off. Its default is OFF, to keep the A4 compact editions minimal. qa/verify-editions-configurator.js tests route integration and title/format selection using all 258 authorial sections / 414 bilingual passage pairs.

The original published scholarly and bilingual-study PDF binaries have not been silently replaced, because the owner requested review of page designs first. Source generation for bilingual PDFs has been adjusted toward English-left/Arabic-right. The published legacy file page maps and the scholarly reference PDF URLs remain intact pending approved replacement and revalidation. Do not conflate the interactive browser Save as PDF option with a downloadable pre-built PDF for every option.

## Language preservation in Arabic-text editions

An Arabic main text does not require Arabic-only annotations. An editorial or
scholarly note selected for a Study or Reference edition retains any genuinely
original English, French or Arabic wording. Do not silently translate, delete,
or label original-language quotations as though they were editorial translations.
The language of a note is separate from the language of the body text; render
English/French notes left-to-right (with the correct `lang` attribute), Arabic
notes right-to-left, and mixed quotations using explicit direction isolation.

Use `original_note_language` and `original_note_text` **only for verified
original-language note wording**; these two fields take priority when present.
For newly prepared editorial prose stored in `text`, the optional
`text_language` field identifies its actual language (default English).
The ordinary `text_en` and `text_ar` fields are editorial language variants,
not by themselves proof of an original author's language. Merely citing an
English/French source does not make an English summary a French quotation.
No original French note wording should be fabricated where only an English
paraphrase survives.

The very compact **Reading & Printing** PDFs remain apparatus-free apart from
explicitly permitted essential reference information. This preservation rule
governs notes **if and when an edition includes them**, particularly future
Arabic-text Study variants. It does not imply that every optional note must be
added to the compact edition. Personal Reading Desk notes are independent user
data, and are not silently inserted into distributed PDFs.

The main-text PDF renderer selects the actual note language for text and page
layout independently of its requested display language; Arabic Qur'an source
notes supplied in Arabic remain in Arabic, whereas an English editorial note
included in an Arabic-text study PDF remains English.


## Source-note link and muṣḥaf typography (21 October 2026)

The main reader loads `source-reference-data.js`, which now boots the separately
maintained `source-note-ui.js` and `source-note-ui.css`. The URL remains an
ordinary HTTPS anchor with its original destination, new-tab behavior, keyboard
focus, and native iOS long-press. Its *visible* text is a compact external-arrow
control beside the source label. Desktop hover and keyboard focus disclose the
full URL in a viewport-clamped tooltip. No database, login, or external UI service
is used. The no-JavaScript fallback retains its legible source names and links.

The reader and PDFs show two verified Qurʾānic verse excerpts in §1 solely as
**comparisons** (Q049 / 55:4 and Q050 / 6:149), explicitly marked **possible verbal
allusions, not quotations by Ibn Rushd**. §38 / 4:43 remains a direct authorial
quotation. Text was checked against Quran.com. No phrase is silently presented
as Ibn Rushd’s quotation, and no authorial Arabic or translation is modified. No authorial text or translation was changed.

PDF source-note citation links retain their URI annotations. Raw long URLs are
visually suppressed in the PDF stylesheet, rather than deleted from the notes or
from the validator's underlying text. The scholarly apparatus displays two qualified Arabic comparison excerpts
and the distinct genuine §38 quotation in compact right-to-left boxes. Hadith
references still appear only in the scholarly PDF, as before. Printed PDFs
identify their source without relying on tooltips. Other fonts and colour themes
are not modified.

`qa/refresh_note_pdf_manifest.py` gates releases on all 259 section destinations,
actual source URI links, PDF outline counts, footnote pagination, source-preservation
validation, and a four-page maximum reflow bound per edition. The isolated
`.github/workflows/daruri-source-note-pdfs.yml` builds and checks all five from
the latest repository source, then commits *only* the PDFs and their manifest
to the source-note feature branch. Do not replace those five current PDFs with
a binary from the older 20 October handoff archive.

Browser smoke tests (local Chromium rendering, 21 October) covered 1280, 390
and 320-pixel layouts: icon links, desktop hover/keyboard tooltip, Escape,
accessible labels, 44-pixel mobile touch targets, unchanged URLs, no visible
raw URLs, no horizontal overflow and verified Arabic excerpt brackets.
Native Safari/iOS long-press and a deployed GitHub Pages build require separate
device-side confirmation; the real anchors have been preserved for that reason.

## Section 1 citation reassessment (21 October 2026)

On reviewing the opening Arabic and the precise canonical verses, the earlier
all-or-nothing removal of §1 references was too broad. Two references are restored,
clearly marked **possible verbal allusions** — not direct quotations, and without
any claim to prove Ibn Rushd consciously cited these verses:

- **QUR-R001-Q049:** `معلّم البيان` compared with Qurʾān 55:4 `علّمه البيان`.
- **QUR-R001-Q050:** `الحجج البالغة` (authorial plural) compared with Qurʾān
  6:149 `الحجة البالغة` (Qurʾānic singular).

**QUR-R001-Q051** (`خاتم الرسل` versus the verse’s `خاتم النبيين`, 33:40),
**QUR-R011-Q052** (29:45), and **QUR-R047-Q053** (12:53) remain withheld as
passage-level Qurʾānic references; their archival provenance is retained.

The common citation map now has **50** published Qurʾān entries (48 previously
retained plus these 2 qualified possible echoes), **33** hadith sources and
**3** withheld editorial hypotheses, retaining **542** original explanatory notes.
These classifications must be reproduced by the web reader, fixed PDFs, and
generated/print editions. The reader shows the authentic verse words in distinct
comparison panels with a plain warning about the limited attribution, rather
than falsely asserting direct quotation. Maintain all original Arabic, English,
vowelling, internal navigation, PDF bookmarks and personal-annotation maps.

Avoid publishing stale PDF binaries: source-note footnote numbering and exact PDF
page maps require regeneration and fresh validation before merged release.


## Approved full-text Qurʾānic contextual references · 21 October 2026

There are 61 main-text Qurʾānic references and 65 exact bilingual anchors. These preserve all 542 original explanatory notes and 33 hadith source notes. The literary echoes R1 (55:4, 6:149), R11 (29:45), and R47 (12:53) are plainly identified as possible allusions, not direct quotations. The formula R1 «خاتم الرسل» is not automatically sourced to Q33:40. Nine legal/contextual examples are now referenced with explicit relationship labels. In particular, R23 Q5:6 supplies the legal basis of head-wiping but does not settle the disputed minimum extent. R163 already has its cow narrative verses Q2:67–71 and needs no duplication.

The full historical dictionary retains its own attribution: seven newly qualified Qurʾānic lexical/legal source notes are placed under six complete historical source articles, in addition to the existing Q75:3–4 quotation. The old optional J-ghaya phrase «إلى الليل» is absent from the actual current article and cannot be anchored there; R195 already gives Q2:187. These additions must be released with all five canonical PDFs, two A4 study variants and exact hash-bound personal PDF maps; the eight apparatus-free A4 reading editions remain distinct.
