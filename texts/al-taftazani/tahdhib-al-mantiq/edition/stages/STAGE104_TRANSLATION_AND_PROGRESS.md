# Stage 104 — cumulative numbered-note translation and durable progress architecture

**Date:** 2026-11-09 · **Project:** Saʿd al-Dīn al-Taftāzānī's *Tahdhīb al-Manṭiq* (T); al-Yazdī's principal ḥāshiya (Y); separately written glosses upon it (H). **Editorial condition:** first-pass transcription/translation; no new manuscript collation.

## Stage inputs and exact scope

Main source (printed Qum, searchable text): [Q127](https://ablibrary.net/book_content/b/12170/127), [Q128](https://ablibrary.net/book_content/b/12170/128), [Q129](https://ablibrary.net/book_content/b/12170/129), [Q130](https://ablibrary.net/book_content/b/12170/130), [Q131](https://ablibrary.net/book_content/b/12170/131), [Q132](https://ablibrary.net/book_content/b/12170/132), [Q133](https://ablibrary.net/book_content/b/12170/133), [Q134](https://ablibrary.net/book_content/b/12170/134). This source is **H**, not the original authorial Y text. Each record keeps exact printed-page references and only a short Arabic locator lemma; the source prose is not yet entirely independently re-transcribed.

After the preexisting 52 source-page selections, this stage creates the first **numbered-note** translation layer. Eighteen notes 1–18 have individual English fields and verified page ranges. English output is over 2,000 working words; that is not a claim of 2,000 words of fully complete translation, since six notes remain partial.

## Exact per-note statuses

| Note | Qum printed pages | Current status | Textual issue / voice |
|---:|---|---|---|
| 1 | 127 | **PARTIAL** | Opening basmala, spelling, syntax, ism etymology; later bracketed references to Muṭahharī and al-Ṣāfī must be separately attributed and translated |
| 2 | 127–128 | **PARTIAL** | ḥamd nominality, precedence and al-Zamakhsharī; Mirzā Muḥammad ʿAlī |
| 3 | 128 | **COMPLETE first-pass** | Alternative attachment of adverbial phrase; Mirzā Muḥammad ʿAlī |
| 4 | 128 | **COMPLETE first-pass** | Verbal-noun formation of basmala; Muḥammad ʿAlī |
| 5 | 128 | **COMPLETE first-pass** | Accusative purpose; khayr/akhyar morphology |
| 6 | 128 | **COMPLETE first-pass** | Quoted *al-Taqrīb* on basmala/ḥamdala |
| 7 | 128 | **COMPLETE first-pass** | Reported starting-formulas; authenticity still not checked |
| 8 | 128–129 | **PARTIAL** | Kufan/Basran co-ordination and a long sectarian transmitted polemic; preserve as glossator's voice |
| 9 | 129–131 | **PARTIAL** | Recursion paradox, absolute/relative/customary beginning, nine readings; long connected argument |
| 10 | 131 | **COMPLETE first-pass** | ʿAbd al-Raḥīm's lexical comment on thanāʾ |
| 11 | 131 | **COMPLETE first-pass** | Qualified meaning of “beautiful”; Mirzā Muḥammad ʿAlī |
| 12 | 131–132 | **PARTIAL** | Voluntary action, ḥamd/madḥ, eternal divine attributes; modern al-Ṭabāṭabāʾī excerpt in Q132 is a separate editorial insertion |
| 13 | 132 | **COMPLETE first-pass** | Quoted *al-Taqrīb* on a commendable act that is not a blessing |
| 14 | 133 | **COMPLETE first-pass** | Proper name and original road-marker meaning; ʿAbd al-Raḥīm |
| 15 | 133–134 | **PARTIAL** | Long divine-name derivation, necessity, tawḥīd, language and knowledge of God |
| 16 | 134 | **COMPLETE first-pass** | Distinct senses and grammatical gender of dhāt |
| 17 | 134 | **COMPLETE first-pass** | Necessary-through-self and necessary-through-another |
| 18 | 134 | **COMPLETE first-pass** | Proper-name associations and metaphorical deployment |

**Tally:** 12 complete first-pass *numbered notes* + 6 partial numbered notes; **0 completely translated printed H pages and 0 photographically certified printed H pages**. Modern insertions in Q127/Q132/Q134 are still outside the complete-note score and must have explicit source layers.

## New files, canonical progress and reading surfaces

- [Note corpus](../hawashi-numbered-notes-stage104.js): `window.GNAMMA_TAHDHIB_HAWASHI_NOTES` with stable IDs `HWN-001` … `HWN-018`, status, source URLs, attribution, English and noncertification flags. The actual root-relative path is `../hawashi-numbered-notes-stage104.js`; when reading this Markdown from the `stages/` directory it resolves to the file one level above.
- [Numbered-note reader](../hawashi-numbered-notes.html): searchable by note number, voice and text, filters complete vs partial, displays source links and visible uncertainty.
- [Machine-readable progress ledger](../progress-data.js): eight independently grounded numerator/denominator metrics and current-stage note IDs.
- [Progress bar dashboard](../progress.html): mobile-friendly visible bars and exact metric definitions.
- [Newest consolidated recovery handoff](../HANDOFF_LATEST.md).
- Earlier source selections remain in [Q125–178 reader](../hawashi-q125-178.html) and are **not** replaced by the new note translations.
- Earlier cumulative al-Yazdī source as two batches: [Q7–66](../batches/yazdi-main-batch-01-q7-66.md) and [Q67–123](../batches/yazdi-main-batch-02-q67-123.md), unchanged.

## Non-negotiable quality controls

1. Do not count Qum page as complete merely because one numbered gloss there is complete. An entire printed page may carry several notes, later insertions, or a note extending to another page.
2. Do not call a digitally searchable page “photograph-collated”; Arabic lemma is a locator and not the full Arabic text. Independent witnesses have not been examined here.
3. Do not silently incorporate any H speaker into al-Yazdī (Y) or Taftāzānī (T). Later cited al-Ṭabāṭabāʾī and Muṭahharī are later than al-Yazdī.
4. First-pass note completeness is editorial English **of the visible numbered note**, not certified fidelity to original photographic columns or named-speaker signatures. Each requires a second bilingual literal audit.
5. In the note corpus, no record may have `scanCertified:true`; page-level `fullPrintedPagesTranslated` remains zero.
6. At every later stage create a **new immutable `stages/STAGE###_*.md`** and separate added/updated note data, update `HANDOFF_LATEST.md`, `progress-data.js`, the stage index and tests, then merge only if CI passes.

## Immediate Stage 105 target

Finish existing **six** partial notes: 1, 2, 8, 9, 12 and 15; translate them from their entire Arabic numbered-note boundaries and mark complete **only after** every visible sentence and any citation is accounted for. Then begin note 19 on Q135, observing whether the Q134 unnumbered quotation attributed to Muḥammad al-Karmī continues across the page seam. Beyond that proceed note-by-note, not by arbitrary 50-page labels.

For the separate **Y** critical-edition task, acquire image-confirmed manuscripts from [Stage103 witness inventory](../STAGE103_WITNESS_CANDIDATES_AND_LAYER_IDENTITIES.md), especially Q37 and Q108 equivalents; do not convert catalogue records into textual variants. For the logical task, 46/46 historical fourth-figure combinations remain classified but zero certified with full medieval modal semantics.

## Restart command for a new chat

> Continue GNAMMA Tahdhīb from `gnamma-research/booksite` default `master`: read `texts/al-taftazani/tahdhib-al-mantiq/edition/HANDOFF_LATEST.md`, `progress-data.js`, `stages/STAGE104_TRANSLATION_AND_PROGRESS.md`, and `hawashi-numbered-notes-stage104.js`. Work only on the six incomplete notes and thereafter subsequent numbered notes, with exact Arabic source links, literal English coverage and signature distinctions; commit immutable stage report plus cumulative progress/handoff; verify tests. Never inflate excerpt counts into complete translated pages.
