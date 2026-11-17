# Sanandajī · Taqrīb al-Marām · Stage 104 FULL TWO-VOLUME CUMULATIVE HANDOFF

**17 November 2026 · Regular Chat · Volume I Stage103 →104.** This document is the **whole project** handoff, not merely the latest four excerpts. Include it, its referenced assets and the receipts/deficits in every future stage. The separate Taftāzānī *Tahdhīb al-Kalām* project is NOT merged or overwritten.

## 1. Canonical scope and source witnesses

- Project: Sanandajī's *Taqrīb al-Marām* in two printed volumes, with embedded Taftāzānī *Tahdhīb al-Kalām* lemmas, unassigned lower annotations, and positively identified Wasīm prefatory text where supported. Distinguish matn, Sanandajī, Wasīm, other marginal voices; do not attribute by proximity alone.
- The Būlāq 1318 AH primary **combined 632-page scan**, SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`, is present as `Volume_I/Original_Bulaq_1318_AH_Taqrib_al_Maram_scan.pdf` and supplies **BOTH volumes**. Source is an image-only single witness, NOT manuscript-collated.
- Printed Volume I p maps to one-based physical PDF p+13 (I:1–280). Printed Volume II p maps to physical p+295 (II:1–335). Total numbered source positions = **615**; printed Volume I body positions tracked = 279. No index or translation output page is counted as a further original source position.
- All **280** Volume I source PNG hashes match `Volume_I/SOURCE_IMAGE_SHA256.json`. Full primary PDF hash confirmed.

## 2. Cumulative Volume I master and Stage104 changes

- `Volume_I/Stage104_Cumulative_1401_Records.json` is the canonical complete current **working record set**, and `Volume_I/FULL_CUMULATIVE_STAGE104.json` its compact copy. `Volume_I/Volume_I_FULL_CUMULATIVE_BILINGUAL_WORKING_MASTER_Stage104.md` is the full readable cumulative export (not merely the new stage).
- Retains all **1,401** stable IDs (**1,400 active** and one hidden retired synthetic editorial entry), Stage84 reader shards, Stage85–103 source overlays, all earlier Stage snapshots, original PDF/images, source crops, editorial and proof registers, and all previous translations/variants. Historical Stage103 versions of the two reader entrypoints are preserved at `Volume_I/historical_reader_entrypoints/Stage103/`.
- New bounded source-checked records: ``I040.lower.01`, `I040.lower.02`, `I041.lower.01`, `I041.lower.02``; older English, title, anchors, status and source image are saved in each `stage104_prior_working_*`. No unrelated source record changed.
- Arabic-bearing records **1,289**; genuinely Arabic-empty active records **111** (**96 lower**, **15 upper**). Presence of Arabic is NOT full transcription; these latest records have substantive omitted clauses.
- Source joins: prior `I039.lower.02` ends **«فلا يفيد المدعى أعني مغايرة»**; new I040.lower.01 begins **«الماهية لبداهة الانتزاع فليتأمل جدا»**. New I040.lower.02 ends **«فإن الماهية والوجود وإن كانا»**; I041.lower.01 begins **«متغايرين بالمفهوم والاعتبار»**. I041.lower.02 stops after **«وبديهة العقل»**; I042 lower continues **«حاكمة بوجوب تقدمها عليه بالوجود»**. Do NOT repeat already translated previous page clauses. These joins require independent second proof.
- The **ambiguous connective immediately preceding «فإنه حينئذ» at I026.lower.02** remains open. Every other older variant, difficult authorial assignment, clause-level correction and absence is preserved, not silently resolved.
- Source/reader integrity: the complete 1,401-record Node regression passed; `Stage104_Open_Proof_Obligations.csv` retains all **1,400** records, the inherited columns/values, and appends Stage104 annotations. All **615** original positions remain uncertified for complete independent all-register proof.

## 3. Cumulative Volume II state and actually received masters

Five **original** historical Library artifacts have been recovered with binary SHA-256 receipts in `Volume_II/`:

1. `STAGE38_FULL_CURRENT_STATE_HANDOFF.md` — cumulative source-critical and prior-stage handoffs.
2. `Taqrib_Stage38_Source_Corrected_Arabic_Facsimile_English_Reader_II215_II314.html` — corrected standalone 100-position Arabic-image/English reader (II:215–314).
3. `Taqrib_Stage38_Corrected_Cumulative_English_Draft_II215_II314.pdf` — earlier Stage38 corrected 100-position English working export.
4. `Taqrib_Stage36_English_Working_Edition_II215-II314.pdf` — earlier working export, kept as a variant rather than replacing Stage38.
5. `Taqrib_Stages32-34_Bilingual_Reader_II281-II314.html` — earlier bilingual reader, kept as a historical version.

From the **actual Stage38 self-contained HTML bytes**, we additionally recovered `VolumeII_Stage38_RENDERER_DERIVED_100_Position_Cumulative_Working_Master.json` and its Markdown parallel master: **100** cards covering original II:215–314, **163** visible lower commentary sections (the Stage37 handoff distinguished **66** lower PAGE drafts from **97** separately assembled notes), separate Wasīm prefatory extract, and **100** embedded historical source images decoded and hashed. These are *renderer-derived* exports, **not** replacements for missing canonical Stage38 JSON.

The historical Stage38 documentation describes **100/100 attempted full-visible-span main English first-pass drafts** for II:215–314, NOT full Arabic transcription, complete marginal translation, authorship attribution or independent philological proof. The latest remote GitHub contains multiple Stage51 Volume II files; their verified blob SHA-1/byte sizes are in `REMOTE_VOLUME_II_GIT_BLOB_REFERENCE_REGISTER.json` but **their bytes were not imported**. Reconciling Stage38 local and Stage51 remote is a future obligation.

**Unreceived originals:** `MISSING_OR_UNRECEIVED_PROJECT_MATERIAL_STAGE104.csv` explicitly lists Stage38 canonical revised JSON, 97-notes and Wasīm JSON, source-control and correction files, and unreceived GitHub Volume II modules. The **full Volume II historical asset denominator is unknown**. Never label this a complete migration receipt of every Volume II master. Do not merge with *Tahdhīb*.

## 4. Project-wide quantitative progress (verified denominators only)

# Stage104 project-wide evidence-based progress bars

**TRANSLATION — full literal Arabic–English, every register, BOTH volumes:**
`░░░░░░░░░░░░░░░░░░░░░░░░` **0 / 615 original printed positions — 0.0% verified complete.**

**Volume I Arabic presence only (NOT translation completion):**
`██████████████████████░░` **1,289 / 1,400 active source records — 92.1% contain at least some typed Arabic.** Many are partial.

**Volume II limited first-pass main English, II:215–314 (NOT all-register completion):**
`████████████████████████` **100 / 100 positions in this fixed historical interval — 100.0% first-pass main draft presence.** These are the extracted main cards in the Stage38 reader, and do not cover the rest of Volume II.

**PROOFREADING / SOURCE COLLATION — independent complete all-register pages:**
`░░░░░░░░░░░░░░░░░░░░░░░░` **0 / 615 — 0.0% independently second-proofed.** The four Stage104 requested records were visually checked as *bounded excerpts*: `4/4 (100% of requested first-pass sample)`, not full pages. Manuscript collation: 0 accepted independent additional witnesses; total eligible witness denominator unknown.

**MIGRATION RECEIPT — Volume I predecessor bytes accounted for:**
`████████████████████████` **556 / 556 Stage103 assets — 100.0% accounted for.** 554 unchanged byte-for-byte; the two intentionally updated reader entrypoints have their exact historical originals retained.

**MIGRATION RECEIPT — Volume II:** **5 verified original Library artifacts** recovered plus 100 reader-embedded source images; the total historical Volume II asset denominator is **UNKNOWN**, therefore no project-wide percentage is asserted. Missing canonical JSON, control sheets and current remote modules remain separately enumerated.


## 5. Source-critical apparatus, manuscript status and inherited obligations

- Volume I: `Volume_I/Stage104_Open_Proof_Obligations.csv`, `Stage104_Remaining_Arabic_Queue.csv` and *all* earlier Stage records contain source anchors, old variants, attributed and unassigned streams, and omissions. Independent source-to-English second proof **0/279** body pages. Unresolved I026 lower connective retained.
- Volume II: Stage38 full handoff records critical page joins, historical II215–216 negative lemma, II223–230 miracles/ṣarfa work, 66 lower page spans requiring segmentation, 97 retained notes, and Wasīm prefatory authorship. The II117 Wasīm quotation and later individual attribution are still open. Independent full-page source proof **0**. Native Stage38 source-control files not all received.
- **Collation policy:** This is an honestly labelled **single-witness Būlāq working edition**; no claim of a manuscript-established critical edition or independent second-witness collation. Separate independent proof must check every Arabic clause, printed source layer, English rendering, attribution and uncertain variant.
- Do not use page indexing, a summary, a shortened Arabic anchor, source-image existence or a generated PDF as a surrogate for a full translation.

## 6. Reader/export and publication status

- Volume I reader `Volume_I/index.html` and `Volume_I/stage84-reader.html` load Stage84 source shards and all Stage85–104 deltas, with Stage104 before `reader.js`. `reader.css`, `reader.js`, earlier pages/snapshots and editor notes retained. Source-critical progress and stage labels remain **outside continuous reading and focus mode**.
- Volume II is recovered as its **separate** source-embedded Stage38 reader and historical Stage32–34 reader. Its current remote Stage51 reader modules are referenced but not overwritten, materialized or conflated.
- *Tahdhīb al-Kalām* remains an entirely separate project and reader; `tahdhib-parallels.js` is inactive, a concordance only.
- Successful GitHub commit = repository state, **NOT** demonstrated live publication. The current stage has passed Node/JSON/source integrity; local browser visual interaction and live-site QA remain separately open unless actual tests are run and recorded.

## 7. Exact next frontiers, per volume

**Volume I Stage104 → next:** first truly Arabic-blank active record **`I042.lower.01`**, printed I:42, physical combined PDF p55. Check I041.lower.02 closing «وبديهة العقل» against the start of I042 lower «حاكمة بوجوب تقدمها عليه بالوجود» without repeating it. Then `I042.lower.02` and the next blank ID from `Stage104_Remaining_Arabic_Queue.csv`.

**Volume II:** source-critical cross-check of the latest remote Stage51 overlays against the recovered Stage38 corrected II:215–314 master, starting at II:223–230 (miracles and ṣarfa) per Stage38 handoff. Do not redo II:215–222 already source-checked except boundary audit; do not claim Stage51 is the same version or lose prior repairs. Complete/segment every lower gloss and reconcile manuscript/print variants as scope permits.

## 8. Mandatory EVERY-FUTURE-STAGE archive gates

1. Receive **every prior Volume I source and translation master**, 1,401 IDs and all stage snapshots, source images, proof registers, variants, corrected reader exports; receive ALL currently accessible Volume II masters/source assets with exact SHA receipts, and list any unreceived ones. Do not silently narrow the project to the newest increment.
2. Confirm two-volume source-pagination and source PDF hash, unchanged source images, no replacement of already translated Arabic and English, and byte-level preservation of prior versions.
3. For each new source record, compare the physical printed page image and both adjoining source boundaries, clearly identify matn/Sanandajī/ruled/Wasīm/unassigned lower voice, translate only verified clauses and mark every omitted clause. Never claim full-page completion from selections.
4. Run the cumulative corpus validation and a distinct **migration receipt**; independent second proof, complete literal translation and asset receipt are **separate gates**.
5. Write a new **FULL two-volume cumulative handoff**, complete all-volume master/asset manifest, absence inventory, source/original/proof/variant registers, reader/export locations and exact per-volume next point. Preserve original ZIPs rather than relabeling a derived archive as an old archive.
6. Show **labelled progress bars for translation, independent proofreading/source collation and migration receipt** in each stage response and saved handoff. Numerators must be verified, denominators explicit; unknown denominators labelled UNKNOWN and no percentage invented. Track first-pass Arabic presence and drafted page positions only in separate qualified bars.
7. Preserve the archive gate: do **not** archive/delete previous chat or publish/merge incompatible versions until full cumulative receipt, archive hashes, reader QA and historical preservation are explicitly verified. Remain regular Chat.