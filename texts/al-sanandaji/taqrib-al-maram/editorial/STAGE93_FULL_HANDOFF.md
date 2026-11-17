# Sanandajī · Taqrīb al-Marām · Volume I — Stage 93 full continuation handoff

**17 November 2026 · cumulative working edition, not a finished critical edition.**

## Canonical and precedence

1. **Primary witness:** Būlāq 1318 AH, source file `Original_Bulaq_1318_AH_Taqrib_al_Maram_scan.pdf`, SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`, 632 PDF leaves. Printed Volume I p = physical PDF p+13 (1-based). Original image directory `source_images/I001.png`–`I280.png`; all 280 SHA-256 values agree with `SOURCE_IMAGE_SHA256.json`.
2. **Base corpus:** Stage92's 1,401 source-linked records, reproduced unchanged as `Stage92_Cumulative_1401_Records.json`. Its previous patches and snapshots are preserved in this archive. All new Stage93 readings are attached only to records that had no typed Arabic; no completed prior source passage was replaced.
3. **Current cumulative corpus:** `Stage93_Cumulative_1401_Records.json` (and compact `FULL_CUMULATIVE_STAGE93.json`). `stage93-source-delta.js` applies after the inherited Stage85–92 overlays. This archive includes both the source-linked reader and its original HTML/CSS/JS; `stage93-corpus-ci.cjs` enforces 1,401 stable IDs and no false completeness claims.
4. **New translations:** `Stage93_Bounded_AR_EN_Readings.md`, 12 selected bounded Arabic–English readings on I:27–30, 32, 34–35, 37. Eleven lower commentary and one upper commentary record. I:30 includes a sustained lower argument about the circularity of using a revealed command to prove the duty to reason. I:34 corrects **القدم** (pre-eternity) rather than العدم (nonexistence). All omitted clauses are explicitly signalled; these are NOT 12 whole translated pages.

## Strict count — independently grounded source-presence accounting

- **280** original numbered printed positions in Volume I; **279** body pages with *some* bilingual working material; this is not full transcription.
- **1,401** cumulative source-linked IDs preserved; **1,244** with any typed Arabic; **156** *genuine* printed-source records without any typed Arabic: **127** lower, **29** upper. There is also **one** hidden retired synthetic editorial entry, retained for provenance.
- **0/279** pages accepted as gap-free all-register Arabic, literal English, and independent second proof. Manuscript collation **not performed** and is not required for a Būlāq single-copy scholarly reading edition.
- Numerous already Arabic-bearing records still include truncated Arabic or an interpretive rather than complete English. Record presence cannot be used as a percentage of literal text complete.

## Exact next continuation pointer

The first active Arabic-blank source record in printed order is **`I007.lower.02` (p. I:7, physical combined PDF p. 20)**, on whether a preliminary definition of kalām can precede the inquiries on which the science rests. Then **`I012.lower.02` (I:12, physical p. 25)** on the knowable and impossible. Then `I015.upper.02`, `I016.lower.02`, and `I017.lower.01` / `.02`. Continue in printed order or prioritize long lower glosses where they are legible. In the region just revised, `I027.lower.04`, `I028.lower.02` / `.03`, and `I029.upper.01` still lack typed Arabic; do not mistake Stage93's selected records for the whole page.

**For each next record:** inspect its Būlāq page image; trace the exact start/end and authorial stream; transcribe complete Arabic when legible, translate every objection, reply and qualification, save uncertainties rather than invent them, and only change a record after checking its stable ID is not already source-transcribed. Add to cumulative data, keep the old English in `stageNN_prior_working_overview`, rebuild the blank-source queue, validate QA, and preserve every earlier stage in the recovery archive. A whole printed page only advances beyond 0 after all upper, ruled and lower text has been independently proofed against the same copytext.

## Reader and publication policy

Keep the clean, study-first *Taqrīb* reader under `texts/al-sanandaji/taqrib-al-maram/` with stage history out of visible reading flow, lower/ruled notes optional, deep links and bookmarks stable. Do not combine it with *Tahdhīb al-Kalām* until **both** volumes of Sanandajī have complete literal translation and proof. Retain the `tahdhib-parallels.js` data file as an inactive editorial concordance. If publishing, update the manuscript-neutral status in `editorial/CURRENT_PROJECT_STATUS.md` and the book manifest; do not display 'Volume I complete'.

## Files and quality checks

- `Stage93_Manifest.json` records SHA-256, Git blob SHA-1 and byte count of every recovered file. It can be compared against the prior Stage92 snapshot without deletion.
- `Stage93_Remaining_Arabic_Queue.csv`: 156 active missing-Arabic source records, precise IDs, pages and layers.
- `Stage93_Browser_QA.json`: Chromium checks at 390px, 768px and 1400px; 1,401 records, 1,244 Arabic-bearing; Arabic text searchable; clicking a search hit unfolds its lower commentary; no JS errors/overflow.
- `stage93-corpus-ci.cjs`: strict no-duplicate/no-false-proof regression script. Run `node stage93-corpus-ci.cjs` from this archive.
- `Stage93_Cumulative_1401_Records.json` and `FULL_CUMULATIVE_STAGE93.json`: preserved canonical bilingual working corpus. Neither is a complete scholarly translation.

**Resume from this checkpoint, not an older stage.** Do not repeat completed or already transcribed clauses, and do not count editorial inventory or long English summaries as translated source text.