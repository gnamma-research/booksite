# Full-stage handoff — Farghānī, Muntahā al-madārik
**Stage 2026-11-08 · GNAMMA / Texts / ʿIrfān and metaphysics**

## Current project identity and exact state

The full requested deliverable is **a critical Arabic–English edition of the entire four-foundation authorial introduction to Muntahā al-madārik**. Its approximate 107-page extent refers to the **I1876 Istanbul first-volume printing**; the modern Beirut B2007 pagination differs. **Do not state a percentage complete.** The total length in Beirut pagination and a source-character denominator are not established.

**Completed at this stage:**
- Public reading shell (on GitHub master, publication pending Pages checks) with 32 source-linked original Arabic–English excerpts, toggleable editorial notes and Guénon–Schuon comparisons, search, local bookmarks and display controls.
- An original twelve-part *editorial scholarly critical introduction*, at `../critical-introduction.html` with source `CRITICAL_INTRODUCTION.md`, not misrepresented as translation of Farghānī.
- Original *consecutive-order* **English translation drafts of B2007 pp. 18–34**, 17 printed pages, in `../continuous-translation.html` and master `WORKING_TRANSLATION_18_34.md`. Earlier component files `OPENING_TRANSLATION_18_23.md`, `CONTINUATION_TRANSLATION_24_29.md` and `CONTINUATION_TRANSLATION_30_34.md` remain separately preserved for revisions. These are not independently line-checked or manuscript-collated.
- Witness register `WITNESS_REGISTER.json`: I1876 print, B2007 digital edition, Y706 early manuscript catalogue, Q2011 edition. It contains 1 *transcription correction* (F007) and 2 unresolved printed reading flags (p.33 and p.34). There are **zero** actual comparative manuscript variants.
- Complete GNAMMA catalogue entry in `texts/manifest.json`, directly beside *Qawāʿid al-Tawḥīd*. Comparative analysis and glossary are distinct sources.

## Canonical source files, never overwrite with abbreviated summaries

The repository files identified by `STAGE_MANIFEST.json` constitute the full current working corpus. That JSON records exact Git blob SHAs, Unicode character counts and byte lengths for the 16 current source, reader and apparatus files, as well as an exact next-source marker. It is the recovery starting point for a new chat.

- Canonical current working translation: `WORKING_TRANSLATION_18_34.md`.
- Canonical bilingual extracted clauses: `../data/units.js`, **32**, F001–F032.
- Critical essay: `CRITICAL_INTRODUCTION.md`.
- Source register and flags: `WITNESS_REGISTER.json`.
- Full status and pending-gaps: `STATUS.md`.
- Interpretive layer: `COMPARISON.md`; terminological register `GLOSSARY.md`.
- HTML readers: `../index.html`, `../continuous-translation.html`, `../critical-introduction.html`.
- Reader scripts: `../reader.js`, `../reader.css`; existing shared Qawāʿid shell.
- Separate stage drafts: `OPENING_TRANSLATION_18_23.md`, `CONTINUATION_TRANSLATION_24_29.md`, `CONTINUATION_TRANSLATION_30_34.md`.

This is **NOT FULLY CUMULATIVE** in the sense of possessing the entirety of the authorial Arabic source, the historical image witnesses, or a finished English translation. All extant stage artefacts are preserved in GitHub, with external sources identified. A standalone bundled ZIP and a verified manuscript facsimile have not been created.

## Next EXACT translation boundary

Last English translated draft ends with B2007 p.34, `فسمى جميع هذه الأسماء هذا` (“Thus all these names designate this—”). Continue from B2007 **p.35**:

`التعين الثاني النفسي المذكور، ولهذا التعين وما تعين به وفيه من التجلي الثاني الذي هو ظاهر الوجود ...`

Source: https://ablibrary.net/book_content/b/9606/35?lang=ar

Do not begin again at p.18 and call it new work. Revisit p.18–34 only for recorded source corrections and Arabic/English clause collation. **Output-first stages:** add substantial consecutive authorial text and new translation, not only more plans/essay.

## Source-critical gates

1. Identify the exact concluding line of the 4th foundation in B2007, complete the B2007↔I1876 page concordance; record actual source characters and a non-invented denominator.
2. Collate actual facsimile images for Istanbul I1876, early manuscript Süleymaniye Yeni Camii 706 and another independent witness if available. Existing catalogue descriptions do not count as inspected variants.
3. Establish continuous Arabic copy-text with corrected headings and actual authorial divisions, and align all Arabic/English paragraph and clause IDs.
4. Assess Qurʾānic citations, hadith source statuses (including the “hidden treasure” report, seven inward depths and “first created light”), and original Ibn al-Fāriḍ text.
5. Keep Farghānī authorial content apart from editorial critical essay and the Guénon/Schuon comparative note layer.
6. Only when complete, produce print/PDF derivative, critical apparatus, bibliographic register, and manuscript audit.

## Preservation and project tracker
- Repository: https://github.com/gnamma-research/booksite
- GitHub issue: https://github.com/gnamma-research/booksite/issues/245
- Directory: https://github.com/gnamma-research/booksite/tree/master/texts/al-farghani/muntaha-al-madarik
- Live GNAMMA GitHub Pages target is documented in the root README, but **deployment of this stage has not been verified**; avoid claiming the live site already displays every file.

## Validation constraints
- HTML pages and all backing files have been fetched back via GitHub to establish their exact presence; the 17-page translation is an English draft, not independently audited.
- All file paths and blob hashes are in `STAGE_MANIFEST.json`. The source content has not been manuscript-inspected, so no critical variant sigla should be added.
- This handoff meets continuity by preserving the available current corpus and explicit gaps, not by pretending the incomplete project is complete.
