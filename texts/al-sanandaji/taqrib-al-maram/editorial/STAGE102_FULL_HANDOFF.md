# Sanandajī · *Taqrīb al-Marām* · Volume I — Stage 102 full cumulative handoff

**17 November 2026 · Regular Chat continuation from verified Stage101.** Single Būlāq 1318 AH witness, *not* a complete critically established text.

## Source precedence and no-loss preservation

- Primary copytext `Original_Bulaq_1318_AH_Taqrib_al_Maram_scan.pdf`: 632 PDF leaves; SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`. Printed I:p maps to combined PDF physical page p+13. All 280 `source_images/I001.png`–`I280.png` agree with the unchanged `SOURCE_IMAGE_SHA256.json` ledger.
- This Stage102 cumulative archive contains **all Stage101 files and earlier stages** byte-for-byte, except the two HTML entrypoints, which now append only `stage102-source-delta.js` after Stage101 and before `reader.js`. The sole source-record changes are `I036.upper.01, I038.lower.01, I038.lower.02`.
- `Stage102_Cumulative_1401_Records.json` and `FULL_CUMULATIVE_STAGE102.json` are current; previous snapshots and source deltas remain intact. `stage102-source-delta.js` refuses to replace previously Arabic-bearing records.
- The prior English, titles, Arabic locating anchors, source aliases and statuses for the three changed IDs are copied to `stage102_prior_working_*`. No previous explanatory English was treated as source-verified Arabic.
- The clean *Taqrīb* reader remains under `texts/al-sanandaji/taqrib-al-maram/`; `tahdhib-parallels.js` is inactive. The separate *Tahdhīb* reader remains unchanged.

## Stage102 passages and exact boundaries

1. `I036.upper.01` — printed p36 / PDF p49. First word «الأمر» completes the ending «في نفس» of I035.upper.01, which is **not** retranslated. The source passage distinguishes the self-evidence of a judgement in itself from explicitly knowing the self-evidence of each constituent; children who are incapable of acquired inference illustrate the difference. Stop before I036.upper.02 at «(والتعريف)»; that Arabic-bearing next record is **not** altered. A short connective before the lexical transition is omitted.
2. `I038.lower.01` — printed p38 / PDF p51. A merely homonymous use of "existence" differs from a shared meaning; certainty about the common predicate can accompany uncertainty about particular instances. The subsequent objection from quiddity and individuation is selectively quoted, and its compact transition is not fully read. The response that unrestricted quiddity and individuation also have common universal meanings ends with «فلا نقض». Stop before the next lower note.
3. `I038.lower.02` — same printed leaf. Opening lemma «(قوله ما اتصف بالوجود)» asks which particular meaning of existence is predicated; the last Arabic on p38 is «بأحد المعاني». The objection continues onto I039; no I039 clause has been added or duplicated.

See `Stage102_Bounded_AR_EN_Readings.md` for paired source excerpts and their explicit omissions. These selected spans are **not** full record/page transcriptions and have not had independent second proof.

## Strict completeness and obligations

- **1,401** stable IDs; **1,400** active and one hidden retired synthetic entry. **1,282** now have *some* typed Arabic; **118** genuine printed-source records remain Arabic-empty (**102 lower**, **16 upper**).
- **0/279** complete all-register independently second-proofed pages. All **1,400** source records retain open full-Arabic/English/voice/second-proof obligations, including the unresolved connective in `I026.lower.02` preceding **فإنه حينئذ** and all prior textual variants.
- `Stage102_Remaining_Arabic_Queue.csv` contains exactly 118 blank-source records. `Stage102_Open_Proof_Obligations.csv` inherits every existing field/obligation and adds Stage102 status for the three selected records without marking them complete.
- Manuscript collation has not been performed and is not required for the labelled single-witness working edition; no manuscript-critical completeness is claimed.

## Exact next continuation point

**`I038.upper.01` — printed Volume I p38, physical combined PDF p51.** This is the upper stream and must be kept distinct from the newly revised two lower notes on the same leaf. Compare its sentence continuity against the already Arabic-bearing I037.upper and the next upper record, without duplicating earlier translation. Then proceed to **`I039.lower.01`**, **`I039.lower.02`**; check the opening of I039 against the unresolved I038.lower.02 sentence before translating those records.

## Reader, release and scholarly safeguards

The Stage102 overlay must load after Stage101 in both reader entrypoints, before `reader.js`. Keep stage labels and proof annotations outside reading/continuous/focus surfaces. Check mobile/tablet/desktop HTML layout, search, direct passage links, and marginal toggles; distinguish local reconstructed testing from a live deployed-site test. Preserve *Taqrīb* and *Tahdhīb* as separate readers until both commentary volumes have complete literal translation and independent proof. A GitHub commit alone establishes only repository changes, not verified live deployment.

## Stage102 verification outcome (recorded)

`node stage102-corpus-ci.cjs` **passes** the 1,401-record unchanged-source comparison, new source presence, exact overlay load order, original PDF and 280 source-image SHA-256 checks, proof-obligation count and next-record queue. A separate Chromium `file://` attempt returned `ERR_BLOCKED_BY_ADMINISTRATOR`; an in-memory rendering test timed out, so responsive presentation, marginal clicking, Arabic search and focus mode have **not** passed new Stage102 browser acceptance. No live-site QA has been claimed. See `Stage102_Browser_QA.json`.