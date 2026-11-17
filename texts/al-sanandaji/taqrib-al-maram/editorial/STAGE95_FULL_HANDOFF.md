# Sanandajī · Taqrīb al-Marām · Volume I — Stage 95 full checkpoint

**17 November 2026 | Recovered from the exact Stage 94 source archive.**

## Sources and precedence

- Primary source: Būlāq 1318 AH, unchanged 632-leaf original PDF; SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`.
- All 280 original printed Volume I page images are inherited unchanged and individually checksum-matched to `SOURCE_IMAGE_SHA256.json`.
- Stage 94 and earlier JSON, overlays, original prose, source images, PDF, and reader are preserved. `Stage95_Cumulative_1401_Records.json` is the latest source-linked corpus. `stage95-source-delta.js` is loaded **after** Stage94 and **before** `reader.js`.
- No manuscript collation has been done. This is a single-copy Būlāq-based reading text in progress, not a critically complete or independently proofed edition.

## New bounded bilingual passages

I012.lower.02, I015.upper.02, I016.lower.02, I017.lower.01, I017.lower.02. The new source readings focus on: the referents of theological predicates and pronominal language (I:12); a specific cognition versus an acquired conception of knowledge (I:15); modal versus chronological priority in reflexive knowledge (I:16); and the technical senses of knowledge and conditions of inquiry (I:17). The paired Arabic and English passages are in `Stage95_Bounded_AR_EN_Readings.md`.

The old English overview for each touched record survives unchanged in `stage95_prior_working_overview`. Only source-backed printed phrases were added to the reader. Omitted arguments are indicated; no new page is whole and there is no independent second proofreading. The lower source register's voice remains *unassigned* where attribution is not established.

## Strict current coverage figures

- **1,401** unique source-linked records; **1,259** have some typed Arabic, up from Stage94's 1,254.
- **141** genuine records have no Arabic yet (**122** lower, **19** upper), down from 146.
- **0/279** body pages independently accepted as full all-register Arabic + literal English + second proof.
- A record containing any Arabic is still **not** necessarily transcribed or translated in full; the newly entered five are *bounded, partial* passages.

## Exact next continuation point

**`I018.lower.02`** — printed Volume I **p. 18**, original combined physical PDF **leaf 31**. Proceed in printed order to **`I020.lower.01`, `I020.lower.02`, `I020.lower.03`, `I021.lower.01`**. First revisit any already Arabic-bearing but truncated records in these leaves while doing whole-page proofreading; do not re-enter translated source or replace earlier selections without documenting a correction.

## Steps for every new record

1. Inspect the original physical page image and locate exact record start/end, text register and speaker; verify against adjoining pages where the line runs across a break.
2. Transcribe Arabic **as printed** where legible; explicitly separate conjecture from secure reading and do not infer missing clauses from old English summaries.
3. Translate all transcribed objections, answers, examples, qualifications literally, tracking *taṣawwur*, *taṣdīq*, *ʿilm*, *maʿrifa*, *naẓar*, *maʿlūm*, *mawḍūʿ* with consistency.
4. Preserve the prior commentary under `stageNN_prior_working_overview`; keep partial/uncertain status flags and authorial-layer uncertainty.
5. Rebuild JSON and queue, run `node stage95-corpus-ci.cjs`; run browser smoke tests at 390/768/1400 px before claiming UI release.

## Publication policy

Reader: `texts/al-sanandaji/taqrib-al-maram/`. Do not show record IDs/stage numbers, editorial methodology, or progress counts in continuous or focus reading; leave these in `editorial/`. Preserve stable links, source page navigation, mobile margins, bilingual switch, search and bookmarks. **Do not merge with the Tahdhīb al-Kalām reader**, nor mark Volume I finished, before both Sanandajī volumes are fully source-transcribed, literally translated and independently proofed. Keep `tahdhib-parallels.js` as an inactive concordance.

A compact batch file is provided for transport; the full recovery archive is authoritative because it preserves every previous stage plus the original source PDF.

## Actual QA performed here

`stage95-corpus-ci.cjs` passed locally; all original source hashes checked. Browser automation was attempted against both `file://` and local HTTP, but this environment blocks such navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`, so browser/visual responsive acceptance has **not** been claimed. See `Stage95_Browser_QA.json` for the outstanding checks.