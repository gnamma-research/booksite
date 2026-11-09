# GNAMMA Tahdhīb logic — LATEST CUMULATIVE HANDOFF
**As of 2026-11-09 · current stage 104 · SAFE RESTART DOCUMENT**

**This file is overwritten/updated at each stage, while prior stage reports and source translations are NEVER overwritten or silently discarded.** The durable copy lives in [gnamma-research/booksite](https://github.com/gnamma-research/booksite), default `master`. All paths below are relative to `texts/al-taftazani/tahdhib-al-mantiq/edition/`.

## Read these files FIRST after any chat fails

1. **This `HANDOFF_LATEST.md`**: canonical current-state narrative; if a last-stage PR is open, check it and the actual `master` before proceeding.
2. [`progress-data.js`](progress-data.js): **canonical machine-readable figures**, denominators, stage list, completion statuses.
3. [`stages/STAGE104_TRANSLATION_AND_PROGRESS.md`](stages/STAGE104_TRANSLATION_AND_PROGRESS.md): immutable newest stage report; all 18 page-by-page note statuses and source links.
4. [`hawashi-numbered-notes-stage104.js`](hawashi-numbered-notes-stage104.js): cumulative numbered-note first-pass English (about **2,028 English words**, 18 numbered records); 12 complete first-pass, 6 partial.
5. [`hawashi-numbered-notes.html`](hawashi-numbered-notes.html) and [`progress.html`](progress.html): mobile reading and **eight live progress bars** from `progress-data.js`.
6. [`YAZDI_TWO_BATCH_RELEASE_2026-11-07.md`](YAZDI_TWO_BATCH_RELEASE_2026-11-07.md), [`STAGE103_WITNESS_CANDIDATES_AND_LAYER_IDENTITIES.md`](STAGE103_WITNESS_CANDIDATES_AND_LAYER_IDENTITIES.md), [`STAGE101_DOMAIN_INDEPENDENT_PROOF_BOUNDARIES.md`](STAGE101_DOMAIN_INDEPENDENT_PROOF_BOUNDARIES.md): distinct main commentary, manuscript candidates and logic-proofs workstreams.
7. [`hawashi-q125-178.html`](hawashi-q125-178.html): earlier **SELECTED** Arabic lemmata/English page argument notes, 52 substantive Q127–178 pages (Q125 heading, Q126 blank); NOT the cumulative complete-note corpus.

## Canonical state: what exists vs what does NOT

| Workstream | Actual completed object | Denominator and outstanding work |
|---|---|---|
| **T: Taftāzānī matn, logic** | 19/19 editorial divisions have working bilingual translation | 19 divisions; separate manuscript certification outstanding. Do not mistake the matched printed divisions for an established text-critical recension |
| **Y: al-Yazdī principal commentary** | 110/110 substantive Qum printed positions Q7–123 (113 bilingual blocks) translated from searchable Qum print, as two cumulative Markdown batches | 0/110 fully photographed/multi-witness certified. Seven non-principal/structural positions Q20,21,38,52,53,85,109 excluded from denominator |
| **H: later glosses page excerpts** | 52/274 substantive printed positions Q127–178 have selected lemmata plus short argument accounts | Q179–400 (222 positions) not yet source-sampled at comparable level |
| **H: complete PRINTED-page translation** | **0/274** after Stage104 | Notes span pages; short excerpts or fully translated numbered notes do NOT make a page complete |
| **H: opening numbered notes, Q127–134** | **12/18 numbered notes complete first pass**. Another 6 have explicitly PARTIAL English | Notes 1,2,8,9,12,15 need exact source-complete translation; entire historical H may contain hundreds more notes (total presently unknown) |
| **Y collation** | Candidate bibliography, separate source families T/Y/H, explicit crux register | No photographed new manuscript comparison; 0/110 independently certified Y printed positions |
| **Formal modal interpretation** | 46/46 exceptional fourth-figure combinations historically categorized; Stage101 proves selected temporal shadows under explicit assumptions | **0/46 full classical modal results independently proved**, because the semantics of each modal compound and existential scope are not fully reconstructed |
| **GNAMMA readers** | Main two states Matn / Matn + sharḥ; later sampled-gloss reader; new cumulative numbered-note reader; progress dashboard | CSS/mobile browser checks and exports are not substitutes for scholarly proofreading |

**Do not add the two progress percentages for Y (100% working first pass; 0% photo-collated) and call the main work complete.** They measure different objectives. Likewise **12/18** is a bounded prologue-note metric, never the whole H-corpus metric. The later `H` layer contains text published centuries after Y, including separately quoted modern authors; identify these separately.

## Stage 104 NEW WORK, recorded 2026-11-09

- Read Qum digital source printed positions **127–134** and mapped **note numbers 1–18** with correct multipage extents (2: 127–128; 8: 128–129; 9: 129–131; 12: 131–132; 15: 133–134).
- Created 12 first-pass complete short-note English translations of nos. **3, 4, 5, 6, 7, 10, 11, 13, 14, 16, 17, 18**. These are first-pass coverage of digitally visible numbered-note content, **not photographed certainties or independently verified authorship**.
- Created substantial partial English for 6 longer notes: **1, 2, 8, 9, 12, 15**, visibly incomplete with editorial notices. Unnumbered 20th-century citations on Q127/Q132/Q134 are not silently assigned to earlier scholars.
- Wrote [`hawashi-numbered-notes-stage104.js`](hawashi-numbered-notes-stage104.js), [`hawashi-numbered-notes.html`](hawashi-numbered-notes.html), [`progress-data.js`](progress-data.js), [`progress.html`](progress.html), and the immutable [stage report](stages/STAGE104_TRANSLATION_AND_PROGRESS.md). Expected browser QA in PR and stage-specific invariants before merge.
- **Zero additional full later-gloss printed pages** and **zero new certified manuscript readings**. This is an exact accountable status, not an inflated fifty-page claim.

## Six active workstreams and ordered instructions to the next assistant

**A. Later-Ḥawāshī complete translation (primary):** begin with numbered notes **1,2,8,9,12,15** in the same Q127–134 source and finish those against *whole* printed source paragraphs. Use web URLs `https://ablibrary.net/book_content/b/12170/127` etc **without `?lang=ar` if the web fetch returns an internal error**. Validate end of each `(n)` at the next `(n+1)` or the explicit author signature; any late inserted material must be separately attributed. Progress each completed *note*, not page. Then proceed note **19+** starting Q135, handling split sentences/notes and footnotes; do not jump straight to Q179 merely because samples exist to Q178. Print complete-page progress only when every substantive segment (including modern appended material or explicitly marked exclusions) is accounted for.

**B. Verified Arabic column transcription:** source original Arabic for each note from photographed Qum pages; link every sentence of English to its source lemma/line and stage status. Current stage only stores short Arabic locators, not complete Arabic. Do not label stage104 a full facing-page Arabic–English edition.

**C. Original Y principal commentary collation:** get images of authentic al-Yazdī manuscripts from the Stage103 witness register. Priority Q24, Q37, Q95–101, Q108, Q114, Q117, Q123; verify source-family identity from incipit/explicit first. Distinguish Tehran and Gujarat PRINT comparisons from actual manuscript variants; never silently emend.

**D. Logical formal proofs:** full classical semantics for all 46 exceptional fourth-figure modal combinations, including actual vs description-relative necessity, subject existence, same-individual lā-dawām and all quantifier scopes. Stage101 proves only specified weaker conditional temporal consequences, not 46 independent medieval theorems.

**E. Editorial reader and export:** retain ONLY two primary main-reader text states. Show later notes as one companion via the References menu. Update CSS/JS for mobile, hide/inspect supporting apparatus, generate PDF from corrected canonical Arabic/English only, always preserving source links.

**F. Stage durability and source QA:** at EVERY stage:
1. Add an **immutable** `stages/STAGE###_<topic>.md` with what actual text was translated, provenance, precise note IDs / Qum pages, unresolved cruxes, numeric delta, source links, and an exact restart command.
2. Append new cumulative note records or well-defined amendments in an additional `hawashi-numbered-notes-stage###.js` or carefully updated canonical aggregation. Do not erase a prior source translation or overwrite historical English without retaining evidence of revision.
3. Update canonical `progress-data.js` (one new stage entry; distinct metrics), update **this file**, the progress dashboard and note reader as appropriate.
4. Run `python tools/tahdhib/verify_logic_core.py`, `python tools/tahdhib/check_stage_handoff.py` and the existing Tahdhīb GitHub CI (Chromium and WebKit).
5. Merge only upon passing checks. Record exact PR/commit in the next handoff, including any drafts/failed tests and no claim of successful deployment beyond a merged repo.

## Minimal prompt for a future new chat

**"Continue Stage 105 of GNAMMA Tahdhīb from the latest merged master of `gnamma-research/booksite`. First read `texts/al-taftazani/tahdhib-al-mantiq/edition/HANDOFF_LATEST.md`, `progress-data.js`, `stages/STAGE104_TRANSLATION_AND_PROGRESS.md`, and `hawashi-numbered-notes-stage104.js`. Finish notes 1,2,8,9,12,15 from Q127–134; translate subsequent complete numbered notes. Write new stage file, cumulative update, eight recalculated progress bars, and QA; preserve source-specific author and scan status. Do not substitute samples for complete pages or invent manuscript variants."**

## Source and trust boundaries

- Main Qum searchable print: [Q127](https://ablibrary.net/book_content/b/12170/127), etc. Source-site book-level 'Yazdī' authorship label is **not** each H note's author.
- Main principal commentary source: [two-batch ledger](YAZDI_TWO_BATCH_RELEASE_2026-11-07.md); first pass only.
- Independently located manuscript leads: [Stage103 witness census](STAGE103_WITNESS_CANDIDATES_AND_LAYER_IDENTITIES.md); no new certified variants.
- Historical modal theory: [Stage101 proof boundary](STAGE101_DOMAIN_INDEPENDENT_PROOF_BOUNDARIES.md), distinct from numerical finite-model exercises.
- Later H printed pages Q127–400 inclusive = **274** (400 - 127 + 1). Early Q125 heading and Q126 blank are not H prose pages. Q127–178 inclusive = **52**; Q179–400 inclusive = **222**.
- Authorship confidence is per signed gloss and historically separate late interpolations, not assigned mechanically by volume catalogue.

**Carry forward this exact state. Never claim future/background processing or silently regenerate progress.**
