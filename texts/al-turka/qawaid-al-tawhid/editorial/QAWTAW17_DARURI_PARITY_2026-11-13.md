# Qawtaw17 · Darūrī-family reader parity release · 13 November 2026

**Status:** functional Darūrī-family convergence for Qawāʿid al-Tawḥīd / Tamhīd al-Qawāʿid, **verified in headless Chromium** in [Qawtaw17 browser acceptance](https://github.com/gnamma-research/booksite/actions/runs/43312224771). This is a reader/UI release, not a new translation or manuscript-critical edition.

## Preserved texts and editorial layers

- Original **Qawāʿid**: 61 Arabic–English matn lemmata, author Abū Ḥāmid Turka.
- Ṣāʾin al-Dīn ʿAlī Ibn Turka's **Tamhīd**: 110 Arabic–English units (40 independent introductory + 64 main + six concluding); 70 linked main/conclusion sharḥ units, four separately attributed connecting ancestral quotations. The introduction is correctly separate.
- All **5,520** source-punctuation review segments, selected printed preferred Arabic variants, original A/N Arabic transcriptions, variant notes, English translations, and five Qawtaw16 PDFs preserved **without editorial changes**.
- Provenance guard CI checks exact six canonical Git blob hashes, and the source-status register still distinguishes the *reported ancestral lacuna QT-059* and the problematic *SH-002 negative*. None has been fabricated or silently harmonized.
- Running text is free of the long editorial/source notes; they remain in Reading Desk › Editorial & textual notes, comparison/research files and the Study/Reference PDF. Optional descriptive English passage headings are explicitly **modern editorial guide titles**, and can be hidden while preserving visible stable QT/SH numbers and textual content.

## Darūrī-family reader capabilities

| Feature | Qawtaw17 implementation | Verification/limit |
|---|---|---|
| Top toolbar | Contents, Search, Theme, Display; coherent line icons | Integrated markup/browser |
| Book-specific layers | Independent Matn and Sharḥ; stored preferences; no blank view | Existing linked-reader regression |
| Reading modes | Reading/Focus/Minimal/Continuous; focus dock recovery, stored location | Chromium; not a physical iPhone Safari test |
| Language | Arabic, English, or both; language and text layer controls independent | Chromium |
| Title modes | Modern editorial guide titles or source-only headings | Browser-visible toggle; no unverified claim of authentic original rubrics |
| Quick Find | Full Arabic/English/ID search of available text | Browser |
| Research Search | Darūrī's **same bounded parser** for exact terms, quoted phrases, Boolean groups, wildcards, approximate spelling; same proximity engine, filters, 40-result pages | Shared JS, browser QA |
| Scholarly search scope | 61 matn, 110 commentary, explanatory apparatus, technical dictionary and primary references, and private local items | 171 sources, 82 term headwords, 18 source cards; no cross-book corpus claimed |
| Search export & saved queries | CSV export; up to 30 browser-local saved search queries | Client-local |
| Subject index | Eleven thematic categories with term-to-text location links | Preserved 82-headword catalogue; not mislabeled a complete AI knowledge graph |
| Dictionary | 82 source-linked entries; Arabic text, English explanations, selective historical lexical context | Darūrī-like card UI; not the same number of entries or exhaustive external historical lexica |
| Source reference cards | 18 cards with source provenance and direct passage links | Existing source-card regression |
| Bookmarks and notes | Section bookmarks, paragraph/quote selections, highlights and private notes; edit/trash/restore, ordering and filters; JSON export/import | Browser-local; legacy Qawāʿid bookmarks and notes remain readable |
| PDF selector | Reading / Study / Reference, exactly five manifest-backed files | No invented vowelled Arabic |
| Personal PDF | Verify original PDF SHA-256, preserve its existing pages, append private quote/note pages locally with Darūrī's vetted pdf-lib/fontkit/font files | **Actual generated PDF download and pages verified**. Does **not** claim precise word-level overlays/links in publisher pages |
| Offline | Optional installable static reader, core texts, dictionary/reference scripts and published PDFs; personal data not cached in service worker | Source-asset inventory protected, browser/device-specific availability; not a claim of physical iOS Safari acceptance |
| Reader styling | Darūrī-family typography, neutral editorial overlays, menu icons and consistent bookmarked/note visual vocabulary | Some menu icons adapted rather than binary-exact copies of all Darūrī SVG assets |
| Research archive | Full bilingual sources, clause ledger, final audit and actual edition inventory | Available through Reading Desk › Research files |

## Why “exact parity” cannot truthfully mean identical data or claims

Darūrī has a **source-specific Arabic morphological index and historical dictionary** for its own corpus. There is **no independently checked comparable morphological-root/lemma index yet for Qawāʿid/Tamhīd**. Qawtaw17 provides the same safe pattern and proximity search machinery, plus a curated technical-term synonym expansion, but **does not pretend that heuristic rooting has been verified or display Darūrī's source-specific linguistic evidence as if it belonged to Ibn Turka**.

Similarly, Darūrī personal PDF output can use exact-word-to-page source geometry for approved PDFs. Qawtaw17 correctly preserves the printed PDF and appends personal pages (verified locally), but **does not forge source-word geometry or promise the exact same page-internal highlights**. Its existing scanned sources do not justify a fully vowelled Arabic release.

A physical iPhone/Safari visual pass and exhaustive accessibility/a11y review remain distinct from the actual Chromium regression suite. The **editorial authenticity** of the author's historical text is unaffected by these UI differences.

## QA evidence and release checks

**Chromium workflow**: [Qawtaw17 Darūrī feature parity and browser acceptance](https://github.com/gnamma-research/booksite/actions/runs/43312224771). Validates source hashes, syntax, 171-unit corpus, advanced search and source distinctions, reading modes, heading hide/show, 82-term dictionary, 11 topic groups, three PDF tabs with five exact files, personal note/quote saving, JSON backup controls, **real generation of a personal English PDF with original 138 pages plus personal appendix pages**, mobile width checks, and existing complete two-layer and scholarly study regressions.

**Source status**: [Qawtaw16 final critical research audit](QAWTAW16_SOURCE_SCOPED_FINAL_AUDIT_2026-11-12.md). This Qawtaw17 release changes interaction and metadata presentation only.

**Disposition**: publish as a **Darūrī-family feature-converged reader of the source-scoped complete translation**, with the explicit limitations above. Do not describe the Qawāʿid morphology corpus, historical manuscript lacuna, full vowelled Arabic, physical Safari acceptance, or exact publisher-PDF word overlays as independently achieved.
