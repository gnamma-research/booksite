# Nihāyat–Muẓaffar: start here

**Current continuation: 11 November 2026 (Asia/Riyadh).** Stage X has resumed from the recovered Stage IX files. Draft PR **289** saves the reader fixes and three new source comparisons. The last published edition is Stage VIII. Read the state file’s `current` section before the historical `recovered` section.

## Read first

1. Read [current state](https://github.com/gnamma-research/booksite/blob/nihayat4-stage10-20261111/texts/al-tabatabai/audits/nihayat4-current-state.json).
2. Open the saved branch **`nihayat4-stage10-20261111`** in **`gnamma-research/booksite`**. Verify its current commit and the content checkpoint named in that state file. Preserve newer work; never reset a branch to an old handoff.
3. Run `node texts/al-tabatabai/tools/audit-hikma.mjs` in that checkout. The old recovery-only guard checks historical Stage IX bytes: never reset intentional newer work to make that old manifest pass. Read the detailed [recovery handoff](https://github.com/gnamma-research/booksite/blob/nihayat4-stage10-20261111/texts/al-tabatabai/audits/nihayat4-recovery-2026-11-10.md) only as needed.

Do not recursively reload the failed chats or every older handoff. Inspect only the report, unit and source pages needed for the current task. Old handoffs remain historical evidence.

## Current saved state

| Measure | Recovered | Qualification |
| --- | ---: | --- |
| Muẓaffar bilingual working units | **140** | Includes **40 Book V units, M-V-01–40**. The 39 new units cover all 798 registered source blocks on displayed pp.200–270. |
| Bidāya / Nihāya working units | **111 / 136** | Combined corpus **387** units. |
| Nihāya local Arabic–English review | **136/136** | Completed against the stored base. |
| Nihāya external-comparison records | **87/136** | Prior IX.9, 83 recovered reports, and new V.5–7; **49** comparisons remain. |
| External findings incorporated into Nihāya | **1/136** | The 83 recovered reports and 3 new comparisons are being reconciled for integration. |
| Conceptual links / dictionary terms | **34 / 147** | Recovered reader work; final browser verification and release remain pending. |
| Latest published PDFs | **9, Stage VIII** | Published Muẓaffar has 101 units. These PDFs do not include the recovered 140-unit draft. |

**Never restart Muẓaffar at M-V-02:** that work survives. Review the saved Book V draft, then begin Book VI at Rafed displayed p.276 (title p.274); earlier omissions also remain.

## Next work

1. Reconcile the **83 saved Nihāya comparison reports** with the adopted-decision ledger; incorporate warranted Arabic, English and apparatus changes without erasing earlier readings. Reports are in `audits/recovery-stage9-2026-11-10/`. Their original hashes match the unchanged Nihāya source.
2. Complete the **49 remaining comparisons**: VI.7–21, VII.1–9, VIII.1–11, XII.11–24. The first remaining ID is **N-VI-07**. V.5–7 are already recorded in `audits/nihaya-external-stage10-new.json`.
3. Review the new Muẓaffar English and nine print-supported decisions. Preserve the four unresolved Book V problems and earlier formula/chart gaps. Then continue Book VI.
4. Validate the recovered shared menus, contents/headings, continuous reading, dictionary, conceptual links, notes, printing and downloads. The raw-Markdown quotation-test failure was already fixed locally and is included in this recovery. The latest 51-check regression and 30-check study-tools suites still need an exact-revision run.
5. Rebuild all nine PDFs, compare manifests and live files, and publish the integrated release. Do not infer publication from a saved branch or generated file.

The requested reading experience follows Darūrī: consistent menus and options, authorial/editorial headings, language choices, continuous reading, all editions available together, and selective philosophical connections with explicit reasons. Automatic word occurrences must remain distinct from reviewed conceptual links.

## Evidence and checkpoint rule

[Recovered research archive](https://chatgpt.com/library?file_id=libfile_673bcb72029c8191b429614aadc64ff1&account_id=personal): **770 files**, including sources, scans, reports and scripts. Open it only when source evidence is needed. The state file records its size and SHA-256. Historical paths beginning `/workspace/scratch/5f05ed215428/` map to the archive's relative folder tree.

Save after each completed unit or coherent batch; keep working across batches. Record separately: drafted, reviewed, incorporated, committed remotely, and published. Update counts from actual IDs and evidence. A failed turn can still have saved work: inspect before retrying. Never claim manuscript collation, independent human certification or a whole-work percentage without its evidence and denominator.

## Paste into a fresh chat

Continue the Nihāyat–Muẓaffar project from `texts/al-tabatabai/NIHAYAT_START_HERE.md` in `gnamma-research/booksite`. Read its current-state file first and use the saved Stage X branch. Preserve the recovered 140 Muẓaffar units, 83 additional Nihāya comparison reports and 34 conceptual links. Start by incorporating the recovered and new comparison reports; 49 comparisons remain. Do not retranslate M-V-02–40 or reload the failed conversations. Save a cumulative checkpoint before reporting progress, and keep drafting, review, integration and publication separate.
