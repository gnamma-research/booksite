# GNAMMA Tahdhīb — LATEST CUMULATIVE HANDOFF

**Stage 106 · 9 November 2026 · durable recovery entrypoint**

**Repository:** [gnamma-research/booksite](https://github.com/gnamma-research/booksite) (default `master`). Root directory: `texts/al-taftazani/tahdhib-al-mantiq/edition/`.

**Stage105 was merged** as [PR #254](https://github.com/gnamma-research/booksite/pull/254), commit `f8eb858213570234c85258cecd56db1ccc6ca29b`. Stage106 work is staged on `tahdhib-cumulative-stage106-20261109` until its PR merges. **Always inspect current PR/branch before assuming a change is deployed.** This handoff is cumulative; earlier `stages/STAGE###` and `hawashi-numbered-notes-stage###` source files remain immutable history.

## Read THESE files before doing any new work (in this exact order)

1. This **`HANDOFF_LATEST.md`** — unique current narrative for a failed or truncated chat.
2. **[`progress-data.js`](progress-data.js)**, machine-readable canonical progress with **NINE** independent metrics and append-only stage ledger 102–106.
3. **[`stages/STAGE106_NUMBERED_TRANSLATION.md`](stages/STAGE106_NUMBERED_TRANSLATION.md)**, immutable stage106 report, source links, exact additions, difficult notes and next passage.
4. **[`batches/hawashi-numbered-cumulative-hwn001-055.md`](batches/hawashi-numbered-cumulative-hwn001-055.md)** — self-contained **cumulative English for ALL 55 numbered notes**, full Arabic (digitally searchable and uncollated) for notes24–55, short Arabic *locators only* for notes1–23. **53 complete first-pass English notes, 2 partial (1 and 25).** Two unnumbered glosses are explicitly separate.
5. For real source data and revision history: [Stage104 `hawashi-numbered-notes-stage104.js`](hawashi-numbered-notes-stage104.js) (18 earlier notes), [Stage105 `hawashi-numbered-notes-stage105.js`](hawashi-numbered-notes-stage105.js) (five prior-note overrides and five new appends), and Stage106 [batch A](hawashi-numbered-notes-stage106a.js), [batch B](hawashi-numbered-notes-stage106b.js), [batch C](hawashi-numbered-notes-stage106c.js), [batch D](hawashi-numbered-notes-stage106d.js) (new notes24–55). **Do not double-count Stage105 revised notes as new note IDs.**
6. **[`hawashi-numbered-notes.html`](hawashi-numbered-notes.html)** — cumulative interactive bilingual note reader; [`progress.html`](progress.html) — nine independent bars and stage history.
7. Prior context: [Stage103 independent-witness inventory](STAGE103_WITNESS_CANDIDATES_AND_LAYER_IDENTITIES.md), [Stage101 classical-modal proof boundaries](STAGE101_DOMAIN_INDEPENDENT_PROOF_BOUNDARIES.md), [two-batch full working al-Yazdī source release](YAZDI_TWO_BATCH_RELEASE_2026-11-07.md), and [52-page older H excerpt companion](hawashi-q125-178.html). These each describe **different evidence grades**.

## Definitive counts AT THIS HANDOFF

| Separate research objective | Actual count | What it does and DOES NOT mean |
|---|---:|---|
| T: Taftāzānī original logic matn, bilingual editorial divisions | **19 / 19** | A complete first-pass working matn, not multi-manuscript-certified |
| Y: al-Yazdī principal logic commentary, translated substantive Qum pages Q7–123 | **110 / 110** | 113 working bilingual source blocks; excludes seven marginal-only/structural Qum positions; **not** independent photo collation |
| Y: principal commentary, photographic / independent manuscript-certified printed positions | **0 / 110** | Stage103 found candidates, not compared manuscript readings |
| H: later glosses, SHORT excerpt or source-linked analytical page sample | **52 / 274** | Sampled Q127–178 only; the remaining Q179–400 (222 printed positions) were not sampled equivalently |
| H: later glosses, COMPLETELY translated and photo-collated printed pages | **0 / 274** | Note translations do NOT equal complete pages, especially with unnumbered/modern insertions |
| H: numbered notes in current opening cohort Q127–144, English working first pass | **53 / 55** | Notes1/25 incomplete or textually ambiguous. **Local cohort metric only**, not all H note IDs in Q127–400 |
| H: numbered notes in cohort with FULL digitally searchable Arabic source transcribed | **32 / 55** | Notes24–55, including note25's suspicious `وق.` as actually printed. Notes1–23 still short Arabic locators only. **0 manuscript-photographed.** |
| 4th-figure exceptional historical modal combinations, source typed | **46 / 46** | A sourced taxonomy, not formal derivation under complete medieval modal truth-conditions |
| Full historical modal consequence proofs independently completed | **0 / 46** | Stage101 establishes selected *weaker temporal* results only |

**Do not convert 53 translated numbered H notes into 53 fully translated pages, or 32 source transcriptions into 32 critical printed-page certifications.** Original H later prose begins Q127; Q125 is a section heading and Q126 is blank. Q127–400 inclusive is 274 positions. Some are quotations from later writers; track actual physical note and signature, not the book-level blanket label naming Yazdī.

## What Stage106 actually added

- **32 new consecutive numbered H gloss records**, notes **24–55**, sourced from Qum pages **135–144**, with digitally searchable Arabic text and **5,135 newly translated English words** in numbered note fields (counts exclude two additional separately attributed unnumbered translated glosses).
- **31/32 new notes first-pass complete**. One is **partial**, HWN-025, because `ومن قال به «قطب الدين الشيرازي» ... وق.` has a referent and terminal abbreviation that cannot responsibly be certified from the searchable text. Stage104 note1 remains partial because Q127 carries separate later bracketed interpolations needing editorial separation.
- **Two additional unnumbered passages** after note47 (distinguishing `tawfīq`, `ʿiṣma`, `luṭf`) and after note48 (a quoted discussion of `ṣalāt` as supplication, mercy, forgiveness, and the fallacy of treating prevalent use of `ʿalā` as universal). Both are stored in `unnumberedFollowing`, are displayed separately and do not inflate the 55 numbered notes.
- Main intellectual subjects: `أي` as `ʿaṭf bayān` vs coordination; guidance as route disclosure vs delivery; Quranic lexical counterexamples; the three verb-governance patterns; `kināya` and direction of `lāzim/malzūm`; `dīn/milla/sharīʿa`; rhetorical `barāʿat al-istihlāl`; syntactic relation of `lanā` to `jaʿala/rafīq` and divine purposes; `ṣalāt`, necessity of a proper prayer; ranks of messengerhood and prophecy.
- New cumulative [Markdown batch](batches/hawashi-numbered-cumulative-hwn001-055.md): **55 source-linked numbered sections**, modern source-grade warnings, complete latest English for all, source Arabic as available, two unnumbered insertions distinct from the counted note list.
- GNAMMA note reader now merges six source files in order: Stage104, Stage105, Stage106a, b, c, d. Displays full Arabic when present (only 24–55); notes1–23 display locator with explicit warning. It must still retain the primary main reader's **exact two principal display states**, `Matn` and `Matn + sharḥ`.

## What is still genuinely unfinished (must not be masked)

**A. Full H translation.** This latest **53/55** is merely the opening tranche of **numbered** later glosses. Continue from note56 on printed Q144 through the entire remaining Qum volume Q400; page count does not equal note count and later notes may cross pages. Also revisit short excerpts Q127–178 to finish truly complete page transcription, noting unnumbered side discussions. Source text has **not** been fully translated page-for-page.

**B. Early H Arabic.** Reopen notes1–23 (Q127–135) and transcribe full Arabic of each numbered note rather than a 10–20 word locator, then align each English sentence with an actual Arabic segment. Confirm note1's modern intrusions independently, finish both incomplete notes1/25 if source permits. Arabic for notes24–55 is a searchable-print **working** transcription, still requiring facsimile proofing.

**C. Y main critical edition.** Principal Y Q7–123 is complete **working** Arabic–English, but **0/110** photographic/manuscript certifications. Locate authentic al-Yazdī manuscripts from Stage103 and verify family incipit, then document Q24, Q37 (possible missing authorial seam), Q95–101, Q108, Q114, Q117 and terminal Q123. Never use al-Azhar or Princeton Taftāzānī **T** witness automatically as Y witness.

**D. Historical modal logic.** Extend Stage101's conditional temporal theorems to real source-defined traditional modalities. Distinguish personal `lā-dawām`, referential vs description-relative predicates, existence conditions and authentic fourth-figure operations. The **46/46** source classes are not already **46 proofs**.

**E. Reader/export/publication.** Retain single text-source data and Darūrī-style compact menus, Arabic/English/Both and source/witness notes, fix attribution and validate on iPhone and desktop. Generate final bilingual PDFs only from verified canonical text, not unsourced synthetic Arabic.

## Source and attribution controls

- **T:** Taftāzānī original logic+kalām; *kalām 1,044* stable clauses untouched.
- **Y:** al-Yazdī's principal Arabic `ḥāshiya`, Qum Q7–123, authorial ending separate from later colophon.
- **H:** `ḥawāshī al-ḥāshiya`, Q127 onward, multiple authors and quotes. Subject-specific named voices include Mīrzā Muḥammad ʿAlī, Shaykh ʿAbd al-Raḥīm, al-Taqrīb, al-Jawharī, al-Rāghib, Quṭb al-Dīn al-Shīrāzī, reported al-Dawwānī, al-Sakkākī; not all are direct authors of the printed page.
- **Modern/late:** Qum printing embeds modern quotations not historically authored by Y or the earliest H speakers (al-Ṭabāṭabāʾī, Muṭahharī, al-Karmī); those need independent bibliographic status.
- Source URLs use `https://ablibrary.net/book_content/b/12170/PAGE?lang=ar`. Qum searchable HTML is **not** an independently checked manuscript photograph.

## Exact Stage107 restart steps (not background processing)

1. Open [Qum printed p.144](https://ablibrary.net/book_content/b/12170/144?lang=ar), verify note **56** beginning `قيل هو مصدر بمعنى اسم الفاعل` and extend through note 57, 58, 59, 60 across Q144–145; continue consecutive note IDs using Q145+ as available. Keep difficult pages rather than skipping.
2. Write `hawashi-numbered-notes-stage107.js` with new `notes[]` and `arabicFullText` where sourced; add other unnumbered H text in separate fields, never as fake numbered notes. Mark uncertain source/signature `partial_translation`.
3. Rebuild **the single cumulative markdown** with ALL notes 1–newest note, not merely newly added snippets; preserve original source stages. Update live JS reader to render Stage107 and search everything.
4. Add immutable `stages/STAGE107_*.md` with new note range, per-page list, genuinely complete/partial notes, English word-count, manuscript evidence grade, new unresolved cruxes and next note.
5. Update `progress-data.js` **all nine metrics** with source denominators; update `progress.html`, `HANDOFF_LATEST.md`, and both source/content/Playwright QA scripts and workflows.
6. Run `python tools/tahdhib/check_stage_handoff.py`, `python tools/tahdhib/verify_logic_core.py`, `node tools/tahdhib/handoff_reader_qa.mjs` (Chromium + WebKit) and the full existing `tahdhib-reader-ci.yml`. Merge PR only when green and provide URL; do not assert a site is deployed beyond the merged GitHub code.

### Minimal new-chat starter

> Continue Stage107 of GNAMMA Tahdhīb from latest merged `master`, repository `gnamma-research/booksite`. First read `texts/al-taftazani/tahdhib-al-mantiq/edition/HANDOFF_LATEST.md`, `progress-data.js`, `stages/STAGE106_NUMBERED_TRANSLATION.md`, `batches/hawashi-numbered-cumulative-hwn001-055.md`, and source files Stage104, Stage105, Stage106a–d. **Current actual progress: 55 numbered Q127–144 glosses, 53 first-pass complete English, notes1/25 partial, 32 complete digitally searchable Arabic transcriptions (uncollated), 0/274 full H printed pages, 0/110 Y manuscript-certified pages, 46/46 historical modal cases classified but 0/46 proved.** Continue source-numbered note56 onward from Q144, preserve unnumbered and speaker identities, update cumulative Markdown, nine bars, immutable stage107 handoff, and tests; merge after CI only.

**Prohibition:** never substitute unverified digital searchable Arabic or summaries for photographed manuscript readings, and never promise background work. This document preserves the actual completed state for the next synchronous chat.
