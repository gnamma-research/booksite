# Sanandajī · *Taqrīb al-Marām* · Volume I — Stage 100 complete recovery handoff

**17 November 2026. Single Būlāq 1318 AH witness, source-backed but neither gap-free nor second-proofed.**

## Canonical source and unmodified predecessors

- Source: `Original_Bulaq_1318_AH_Taqrib_al_Maram_scan.pdf`, 632 physical PDF pages, SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`.
- One-based combined physical PDF leaf = printed Volume I page + 13. `source_images/I001.png`–`I280.png` and `SOURCE_IMAGE_SHA256.json` are unchanged and individually hash-verified.
- Exact inherited base: Stage99. All Stage91–99 cumulative snapshots and Stage85–99 patches remain in this archive. `Stage99_Cumulative_1401_Records.json` and `stage99-source-delta.js` are **not modified**.
- Current canonical cumulative records: `Stage100_Cumulative_1401_Records.json`, `FULL_CUMULATIVE_STAGE100.json`. New patch: `stage100-source-delta.js` loads after Stage99 and before reader.js. Exactly three formerly empty Arabic fields filled; old English, titles, anchors and reading status preserved under `stage100_prior_working_*` for each changed ID.

## New source-checked material

1. `I031.lower.01` (printed 31, physical 44). Refusal to inquire until inquiry is obligatory, then the answer that the binding force of a command **in itself** is not the same as one's **knowledge of its binding force**. Source ending **هو العلم** is an unfinished grammatical unit.
2. `I032.lower.01` (printed 32, physical 45). Completes previous sentence **بالوجوب لا الوجوب في نفس الأمر**. The earlier objection is denied. The later objection asks whether preceding ignorance of the sought proposition might then be first in obligatory order; response: ignorance itself is not under an agent's power or will. Hard middle connectives are omitted, not silently reconstructed.
3. `I032.lower.02` (printed 32, physical 45). The rational preconditions for trusting transmitted evidence: truthfulness of the transmitter, Creator, sending the Prophet, signification of the miracle. Ends **في العقل دون [...]** and continues on I:33, which remains untranslated here. Do not duplicate the continuation in this stage.

These are **bounded literal translations**, not full-record diplomatic transcription. The textual distinction among upper, ruled and lower registers is preserved. Attributions remain individually unassigned where the witness does not securely identify a speaker.

## Exact checked counts

- **1,401** stable source-linked IDs, with **1,276** bearing some typed Arabic; **124** genuinely Arabic-blank records (**107 lower**, **17 upper**) and **one** hidden retired synthetic non-source record.
- **0/279** printed body pages independently all-register proofed. No full manuscript collation performed. Previously typed Arabic does not imply a complete page.
- `Stage100_Open_Proof_Obligations.csv` retains all **1,400** active source records and inherited obligations; the three revisions remain not independently proofed.
- `Stage100_Remaining_Arabic_Queue.csv` preserves all still source-blank records after removing these exact three.
- The uncertain connective before **فإنه حينئذ** in `I026.lower.02` remains unresolved, as do the omitted I:27–28 and earlier passage clauses.

## Precise next continuation

**`I033.lower.01`**, Volume I printed p. **33**, combined PDF physical page **46**, lower commentary. First check its printed opening against the incomplete I:32 phrase **في العقل دون**; finish the sentence only there, without retranslating I:32. Then move to **`I036.lower.01`** and **`I036.lower.02`** (the intervening I:34–35 have earlier partial Arabic that still need clause-level proofreading but are not genuinely Arabic-empty).

## Reader and QA

- Clean separate *Taqrīb* reader with Arabic/English search and optional lower notes; editorial state and development stages do not interrupt continuous or focus reading. Keep the separate *Tahdhīb al-Kalām* reader and inactive parallel concordance unchanged until full volumes are proofed.
- Source, corpus and overlay checks are in `stage100-corpus-ci.cjs`. `Stage100_Browser_QA.json` documents the actual renderer test performed and any limitations (do not imply a live deployment if it was not visited).
- Full recovery ZIP must include all predecessor data, original scan, source images and Stage100 snapshot; compact study ZIP should include only the self-contained reader and cumulative data, **not** the large original scan.