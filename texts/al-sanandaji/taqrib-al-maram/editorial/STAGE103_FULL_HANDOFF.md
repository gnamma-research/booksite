# Sanandajī · *Taqrīb al-Marām* · Volume I — Stage 103 complete cumulative handoff

**17 November 2026 · Regular Chat · resumed from Stage 102.** This is a Būlāq 1318 AH *single-witness working edition*, not a manuscript-collated critical text.

## Cumulative source provenance

- Original: `Original_Bulaq_1318_AH_Taqrib_al_Maram_scan.pdf`, 632-page facsimile, SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`. The printed I:p physical PDF page is p+13.
- All 280 unchanged numbered source images in `source_images/` verify against inherited `SOURCE_IMAGE_SHA256.json`.
- Every inherited Stage102 file is byte-identical **except** `index.html` and `stage84-reader.html`, where exactly one new `stage103-source-delta.js` include has been appended after Stage102 and before `reader.js`. All older source deltas, snapshots, variants, proof ledgers and provenance remain intact.
- This archive includes both `Stage103_Cumulative_1401_Records.json` and `FULL_CUMULATIVE_STAGE103.json`, plus preserved Stage102 and preceding snapshots. The new source patch refuses to overwrite Arabic-bearing records.
- For all three updated records, old titles, explanations, source pointers, Arabic anchors and statuses are preserved in `stage103_prior_working_*`. Every other source-linked record is unchanged; no duplicate translation of already completed neighbouring records.

## New source units and precise boundaries

1. `I038.upper.01` — printed I:38/PDF51, upper register. Continuation from already Arabic-bearing I037 upper remains a boundary; new selected clauses treat certainty about existence despite uncertainty about individual specification and the distinction between rational and verbal commonality. Stop before existing `I038.upper.02` (the third argument on exhaustive division). Do not repeat I037 or I038.upper.02.
2. `I039.lower.01` — printed I:39/PDF52, lower register. The opening **«لا على التعيين»** is the printed continuation of the prior `I038.lower.02` ending **«بأحد المعاني»**. The further gloss contrasts lack of a determinate verbal meaning with rational exhaustive division, then differentiates existence from quiddity **by concept** rather than automatically by external identity. No I038 text retranslated.
3. `I039.lower.02` — same p39 lower register, begins at the separate **«(قوله أي عن الماهية إلخ)»** gloss. Selected clauses distinguish denying a derived predicate from denying its principle; the issue is what sense of existence is being denied. The gloss ends mid-argument on p39 with **«فلا يفيد المدعى أعني مغايرة»**, to be checked against the next printed page, not completed conjecturally.

The manuscript image is the source of all newly quoted Arabic. Ellipses are substantive omissions; none of the records or printed pages is fully transcribed/translated. The print-register division into legacy `.01` and `.02` is editorial and requires independent second proof.

## Coverage and independent-proof obligations

- **1,401** stable IDs, 1,400 active + one hidden retired non-source. **1,285** have some Arabic; **115** genuine records still Arabic-empty (**100 lower**, **15 upper**).
- **0/279** complete all-register independent-proof pages. All **1,400** active records preserve their independent second proof, full Arabic, complete literal English and attribution requirements. The unresolved **`I026.lower.02` connective before «فإنه حينئذ»** remains expressly open, with all other variants unchanged.
- `Stage103_Open_Proof_Obligations.csv` keeps every inherited column/status and adds only Stage103 annotations. `Stage103_Remaining_Arabic_Queue.csv` has 115 untranscribed source records. No manuscript collation is claimed or required for the labelled single-witness working edition.

## Exact next continuation

**`I040.lower.01` — printed Volume I:40, physical PDF page 53**, then **`I040.lower.02`**; verify the p39–40 completion before entering source and keep the upper philosophical statement separate. Continue with `I041.lower.01` and `I041.lower.02` if securely legible. Recheck every uncertain connective against the scan without fabricating words or overwriting completed material.

## Reader separation and publication

- Reader scripts must load `stage103-source-delta.js` after Stage102 and before `reader.js`, with earlier sources unchanged. Maintain clean continuous and focus modes free of stage numbers and proof tables; place scholarly apparatus in the editorial handoff.
- Keep *Taqrīb al-Marām* and *Tahdhīb al-Kalām* in separate readers; `tahdhib-parallels.js` stays inactive.
- Site checks need separate independent testing. A GitHub commit verifies repository state only, not actual deployment.