# Sanandajī · Taqrīb al-Marām · Volume I — Stage 99 full continuation handoff

**17 November 2026. Cumulative, single-witness working edition; NOT a completed critical translation.**

## Copytext, precedence, and preservation

- Original: Būlāq 1318 AH combined image-only PDF, 632 physical pages, SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`. Printed Volume I page + 13 = one-based physical PDF page. Preserve all 280 images and `SOURCE_IMAGE_SHA256.json`.
- Exact inherited base: `Sanandaji_VolI_Stage98_Full_Source_Recovery.zip`; no prior source text overwritten or removed. The Stage99 cumulative corpus is `Stage99_Cumulative_1401_Records.json`. All previous cumulative snapshot files, Stage85–98 overlays, research notes and original source PDF remain in the recovery archive.
- Source patches: `stage99-source-delta.js` applies **after** Stage98 and **before** `reader.js`; it fills four formerly Arabic-empty records only. Their prior English overviews, titles and anchors are recoverable as `stage99_prior_working_*`. The independent *Tahdhīb* reader and inactive cross-reference concordance remain unchanged.

## Four newly source-checked, bounded passages

1. `I027.upper.01`: upper-page closure **«لوجوده (واجب)»**; this completes the sentence begun in `I026.upper.01`. **Do not translate the earlier leaf a second time.**
2. `I027.lower.04`: source-based lower note distinguishes the two alleged senses of the premise that an act's obligation implies obligatory prerequisites; the phrase before “its prerequisite” remains uncertain and is marked `[...]`.
3. `I028.lower.02`: lower note argues that imposing a duty **without the necessary prerequisite existing** differs from imposing it **without expressly imposing a separate duty to procure the prerequisite**. Neither `I028.lower.01` nor its Arabic was repeated.
4. `I028.lower.03`: lower note treats the meaning of **مقدور**, then the recipient of a command to acquire knowledge. A compact intervening objection has not been securely transcribed and remains omitted.

**Do not claim any one of these to be a full-page or full-record diplomatic edition**; the full print contains additional upper and lower clauses and passages still represented by overviews. Lower authorial voices remain unassigned.

## Auditable counts and quality limits

- **1,401** stable source records; **1,273** with some typed Arabic; **127** genuinely source Arabic-empty (**110 lower**, **17 upper**) and **one retired synthetic hidden record**.
- **0/279** printed body pages independently proofed across all textual registers. Independent manuscript collation has not been performed; none is implied by these bounded readings.
- Prior difficult reading `I026.lower.02` (negative/connective before **فإنه حينئذ**) is still unresolved. The Stage99 lower readings on I:27–28 also require complete second proof and review of their omitted portions.

## Exact next continuation

First genuinely Arabic-empty record: **`I031.lower.01` (printed I:31, combined PDF physical page 44)**. Then `I032.lower.01` and `I032.lower.02`, following `Stage99_Remaining_Arabic_Queue.csv`. Before adding Arabic verify image, register, exact start and end, and check that the target ID has no previous transcribed Arabic. Do not reintroduce already-translated I:27–28 passages as new material.

## Reader and file policy

- Keep study-first Arabic–English reader, optional lower/ruled notes, accurate deep links/bookmarks, search, reader settings and focus mode. Editorial status belongs on the homepage/notes, not the continuous text.
- Preserve original source PDF and images in the **full recovery ZIP**; the **study ZIP** carries the compact complete web reader plus current cumulative JSON.
- Run `node stage99-corpus-ci.cjs` and review `Stage99_Browser_QA.json` for actual browser QA rather than assuming live deployment.

## Executed Stage99 integrity and interface checks

- Stage98 baseline `node stage98-corpus-ci.cjs` passed unchanged. Stage99 `node stage99-corpus-ci.cjs` passed: 1,401 stable IDs, precisely four formerly Arabic-empty source records filled, all other transcribed Arabic, English and titles unchanged, 1,273 Arabic-bearing records, 127 genuine Arabic blanks. Source PDF and all 280 original source-image SHA-256 hashes match.
- The **reconstructed in-memory reader**, at 390px, 768px and 1400px, showed the upper completion I:27 and selected lower clauses I:27–28, with no JavaScript errors or horizontal overflow. Arabic search and focus mode passed. The marginal notes were **opened programmatically for inspection**; a native summary click could not be confirmed, and the publicly deployed website was **not** tested. These limitations are preserved in `Stage99_Browser_QA.json`.
- `Stage99_Open_Proof_Obligations.csv` enumerates **all 1,400 active source records**. Arabic presence and completion are separate fields; it does not mark a record as fully proofed from snippets alone. It supplements (does not replace) every earlier proof queue and the remaining Arabic-blank queue.
- Continue to independently inspect the preceding I:26–27 join and the already known I026.lower.02 ambiguous connective before **فإنه حينئذ**. Do not silently repair either in a later editorial pass.