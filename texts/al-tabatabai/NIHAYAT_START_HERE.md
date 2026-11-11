> **Historical checkpoint — superseded for continuation.** Use the [canonical restart entry](https://github.com/gnamma-research/booksite/blob/master/NIHAYAT_START_HERE.md) and the `nihayat-active` branch. The older counts, commands and branch references below are retained as historical evidence and must not be used to restart current work. The verified Stage X source at `1a967009e52f36923362b3a96e67574491314942` survives in the canonical branch.

---

# Nihāyat–Muẓaffar: start here

**Current continuation: Stage X, 11 November 2026 (Asia/Riyadh).** All 83 recovered Nihāya comparison reports and nine fresh comparisons are incorporated. The working corpus contains 387 bilingual units. The current release is being validated in [PR 289](https://github.com/gnamma-research/booksite/pull/289); the last verified public PDFs remain Stage VIII until the state file records a newer publication receipt.

## Resume safely

1. Read [current state](https://github.com/gnamma-research/booksite/blob/nihayat4-stage10-20261111/texts/al-tabatabai/audits/nihayat4-current-state.json), especially `current`, `preservation`, `published` and `nextWork`. The `recovered` section is a historical Stage IX snapshot.
2. Open branch **`nihayat4-stage10-20261111`** in **`gnamma-research/booksite`**. Inspect the branch head and any newer work before changing files.
3. Run `python3 texts/al-tabatabai/tools/verify-current-checkpoint.py`, then `node texts/al-tabatabai/tools/audit-hikma.mjs`. A checkpoint mismatch calls for reconciliation, never a reset to older text. The old `verify-recovery-checkpoint.py` checks only the original Stage IX snapshot.
4. Read only the report, unit and source pages needed for the next task. Do not recursively load failed chats or every older handoff.

## Current working state

| Measure | Current | Qualification |
| --- | ---: | --- |
| Muẓaffar / Bidāya / Nihāya bilingual units | **140 / 111 / 136** | Combined **387**. Muẓaffar is still incomplete. |
| Muẓaffar Book V draft | **40/40 units** | M-V-01–40 survive. The recovered 39 new units account for 798 registered source blocks on displayed pp.200–270. Independent review remains. |
| Nihāya local Arabic–English review | **136/136** | Completed against the stored base. |
| Nihāya external comparisons incorporated | **93/136** | Prior IX.9 + 83 recovered reports + nine new reviews. **43 remain**. |
| Nihāya textual decisions | **73** | 74 literal replacements; 40 explicitly attributed later-editor changes and 16 unfootnoted later readings. Spelling and vocalization are counted separately. |
| Conceptual links / dictionary terms | **34 / 147** | Reviewed philosophical connections remain distinct from automatic word occurrences. |
| Reader fixes | **5** | Focus search, cross-tab Reading Desk, print-note language, subsection retention and dictionary quote emphasis. Exact-revision browser results are in the state and QA record. |

The [Stage X integration receipt](audits/nihaya-stage10-integration-receipt.json) records applied operations and unchanged alternatives. The [external comparison register](audits/nihaya-external-comparison-register.json) lists every completed and pending unit. The current textual ledger preserves all thirteen inherited decisions and records later source-attribution corrections.

## Next work

1. Complete the remaining Nihāya comparisons: **VI.10–21 (12), VII.1–9 (9), VIII.1–11 (11), XII.14–24 (11)**. First new unit: **N-VI-10**. V.5–7, VI.7–9 and XII.11–13 are already reviewed and incorporated.
2. Review Muẓaffar Book V and its nine print-supported English decisions. Preserve the four open issues at M-V-08, M-V-20, M-V-27 and M-V-30 and earlier formula, chart and exercise gaps. Begin new Book VI translation at Rafed displayed **p.276** (title p.274). **Do not retranslate M-V-02–40.**
3. Complete release validation: 51 retained browser checks, 30 study checks, nine regenerated PDFs, source hashes and sampled visual inspection. A saved branch or PDF artifact alone does not establish publication.

## Evidence and checkpoint discipline

[Recovered research archive](https://chatgpt.com/library?file_id=libfile_673bcb72029c8191b429614aadc64ff1&account_id=personal): 770 verified files. The state records its checksum and historical-path mapping. Original reports remain unchanged; fresh reports and reconciliation plans are separate. The early 1404 witness is a printed facsimile; the later 1428 witness is an edited digital presentation. No manuscript collation or independent human certification is claimed.

Save after each completed unit or coherent batch and keep working. The integration tool checks exact preimages, prior receipt hashes and duplicate IDs; it refuses to replay completed batches. Record drafting, review, incorporation, remote saving and publication separately. Derive counts from actual IDs; no whole-project percentage has a defensible denominator yet.

## Paste into a fresh chat

Continue the Nihāyat–Muẓaffar project from `texts/al-tabatabai/NIHAYAT_START_HERE.md` in `gnamma-research/booksite`. Read current state and run the current checkpoint guard. Preserve 140 Muẓaffar units, all 93 incorporated Nihāya comparisons and 34 conceptual links. First new comparison: N-VI-10; 43 remain. Do not repeat M-V-02–40, already incorporated reports or failed-chat recovery. Check the recorded publication status, save cumulative checkpoints and continue from the next unfinished item.
