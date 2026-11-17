# Nihayat4 recovery and cumulative handoff — 10 November 2026

## Outcome

The continuation's substantial later work survives. Recovery found three distinct states: the published Stage VIII edition; a remotely saved, unfinished Stage IX reader checkpoint; and later local translation, comparison and reader changes that had not been committed. The latter were recovered from the failed chat's workspace and preserved separately from the public release.

Use [NIHAYAT_START_HERE.md](../NIHAYAT_START_HERE.md) and [nihayat4-current-state.json](nihayat4-current-state.json) for every restart. The state file identifies the precise preservation commit. This handoff supersedes the earlier instruction to begin Muẓaffar at M-V-02 and the earlier report that 135 Nihāya comparisons remain. It does not erase the source decisions in older handoffs.

## 1. What the continuation added

| Measure | Original chat: Stage VII | Published continuation: Stage VIII | Recovered later continuation: Stage IX |
| --- | ---: | ---: | ---: |
| Muẓaffar working bilingual units | 78 | 101 | **140** |
| Book V units | 0 | 1 | **40** |
| Combined Muẓaffar, Bidāya and Nihāya units | 325 | 348 | **387** |
| Nihāya complete local bilingual readings | 86/136 | 136/136 | **136/136** |
| Complete external-comparison records | 0/136 | 1/136 | **84/136** |
| External comparisons incorporated in canonical Nihāya | 0 | 1 | **1; 83 reports await integration** |
| Reviewed conceptual links | Not established here | Not established here | **34** |
| Shared study-index terms | Not established here | Not established here | **147** |

Thus the continuation added **62 Muẓaffar units**, **50 local Nihāya readings**, and **84 external-comparison records** beyond the end of the original Stage VII chat. Of the translation increase, 23 units were published in Stage VIII and 39 later units were recovered locally. If comparing instead with Stage V's earlier 62-unit/74-review baseline, the increases are 78 Muẓaffar units and 62 local Nihāya readings.

External-comparison records are recovered prior AI-assisted work with source evidence. The recovery checked file integrity and coverage bookkeeping; it did not freshly reread all 83 scholarly comparisons. Incorporated corrections, full manuscript collation and independent human certification are separate measures.

## 2. Source-controlled and published checkpoints

Repository: [gnamma-research/booksite](https://github.com/gnamma-research/booksite).

- Stage VII: `e2802ae84292c1ed8cfbf2f8e9f90ae1027abaa8`.
- Stage VIII source: `4a3d35ada523a513ebcd63a4861ef9afaab28ae4`.
- Stage VIII merge, [PR #286](https://github.com/gnamma-research/booksite/pull/286): `93353860a31e528d88a14e7125c99c7fdc97731a`.
- Final Stage VIII PDF publication: `73cb227ee1d2dd8ae57d32e8b73e3a9d438851dd`.
- Stage VIII verified handoff: `dff709b6c7031bcbc7f6ed55cf56dddea7b376e4`.
- Initial Stage IX reader checkpoint: `44fa9a086a17dfe446295f01d076b0dd6ef31959`, branch `nihayat4-stage9-20261110`, [draft PR #288](https://github.com/gnamma-research/booksite/pull/288).

The initial Stage IX draft contained 25 links, 131 terms and the existing 348 units. Its own PR description said that the new source comparisons and Book V translation were not yet in that checkpoint. It was not merged. The later local work recovered here extends it to 34 links, 147 terms and 387 units.

The [Stage VIII release-verification record](hikma-release-verification-2026-11-10-stage8.json) records 51 passing browser checks, nine matching PDFs, 23 sampled PDF-page inspections and 24 live-file hash matches. These historical checks do not validate the later Stage IX edits. The reader is at [the three-book reading room](https://gnamma-research.github.io/booksite/texts/al-tabatabai/).

## 3. Muẓaffar: complete working Book V draft recovered

The recovered `muzaffar-al-mantiq/data/book.json` contains **140 unique bilingual units**, including consecutive IDs **M-V-01–40**. Existing M-V-01 covers the Book V preface; new M-V-02–40 cover displayed **pp.200–270**, through the final exercises and closing notice.

Mechanical recovery checks established:

- **39/39** new units match the standalone delivery in every field.
- **798/798** registered source blocks are covered exactly once; none are missing, duplicated or extra.
- The new body text contains **17,441 English words** and **72,827 Arabic characters**.
- Arabic matches its reconstructed registered source blocks, apart from the explicitly bracketed recovered classification diagram in M-V-05.
- All five saved handoff checksums and 14 witness-image checksum references match.

The draft includes 19 productive categorical moods, seven figure exercises, 18 final exercises, nine print-supported English textual decisions, and a recovered bilingual classification figure. Full independent printed-text collation and full independent bilingual review remain outstanding.

Four Book V source problems remain explicitly unresolved:

| Unit | Displayed page | Issue and retained treatment |
| --- | ---: | --- |
| M-V-08 | 211 | Printed `بين وضع`; the contextual “same as” reconstruction is disclosed, not presented as an attested repair. |
| M-V-20 | 237 | The drowning example does not fit the specified conditional template; literal example retained with a note. |
| M-V-27 | 247 | Loose comparison with the syllogism of equality; interpretation identified. |
| M-V-30 | 251 | `لأن` makes the enthymeme example problematic; “because” retained and the mismatch flagged. |

Primary audit files: `muzaffar-book-v-continuation-2026-11-10.json`, `muzaffar-book-v-source-provenance-2026-11-10.json`, `muzaffar-book-v-source-decisions-2026-11-10.json`, and `muzaffar-book-v-link-review-2026-11-10.json` in this audits directory.

**Next translation:** review the recovered Book V draft, then Book VI, title displayed p.274 and first prose p.276. Earlier selected coverage in the Introduction and Books I–IV remains incomplete. Preserve the earlier M-K-08 formula problem, M-K-14 normalization, M-C-17 polarity anomaly, table-complement conjecture, missing charts, exercises and other source gaps.

## 4. Nihāya: 83 further comparisons recovered

The original reports are preserved byte-for-byte in [recovery-stage9-2026-11-10](recovery-stage9-2026-11-10/summary.json).

| Report | Completed records | Scope |
| --- | ---: | --- |
| `nihaya-external-a.json` | 23 | Introduction; I.1–5; II.1–3; III.1; IV introduction and IV.1–8; V.1–4 |
| `nihaya-external-b.json` | 53 | VIII.12–15; IX introduction and IX.1–14 except IX.9; X.1–8; XI introduction and XI.1–15; XII introduction and XII.1–10 |
| `nihaya-external-c.json` | 7 | VI introduction and VI.1–6 |
| New total | **83** | Unique completed IDs; no assignment placeholders counted |
| Prior IX.9 | **1** | Already incorporated in Stage VIII |
| Cumulative | **84/136 = 61.76%** | **52** genuinely remaining comparisons |

The reports compare the entire stored unit with the visually inspected **1404 printed facsimile** and the corresponding **1428 edited digital text**, including relevant notes. The later digital presentation is not a second manuscript or independently scanned witness.

All 83 stored Arabic/English hash pairs match the unchanged canonical Nihāya book, SHA-256 `d1dd963f7a22e2be4ccca4c73c3799a4be6f9b5e4a30415cfc6d12993d07a4fd`. All **210 distinct cited evidence files** exist and match their recorded hashes. The [integrity receipt](recovery-stage9-2026-11-10/integrity-receipt.json) records these checks. Pending, reassigned and merely downloaded items were excluded.

**Integration remains at one unit.** Reconcile the 83 recovered reports with the adopted-decision ledger, preserving prior readings and the distinction between later-editor emendations, attested variant readings, translation corrections and unresolved conjectures. Do not mark a correction incorporated merely because its report has been saved.

The remaining comparisons are exactly:

| Range | Units |
| --- | ---: |
| V.5–7 | 3 |
| VI.7–21 | 15 |
| VII.1–9 | 9 |
| VIII.1–11 | 11 |
| XII.11–24 | 14 |
| Total | **52** |

The complete ID list is in `recovery-stage9-2026-11-10/summary.json`. Start new comparisons at **N-V-05** after reconciling the recovered work.

## 5. Reader and download work recovered

The later files contain **34 explained conceptual links** and **147 shared dictionary terms**. They distinguish philosophical discussions, glossary entries and automatic word occurrences. Other saved work includes shared menus and display settings; original versus editorial contents; a common Reading Desk for notes/bookmarks; paragraph links with citations and return positions; mobile controls; continuous reading; selected/range printing; restoration after printing or cancellation; bilingual authorial footnotes; and a unified nine-edition download page.

The 82-file prepared upload batch and the working files match byte counts and Git blob hashes in **82/82 cases**. Thus the later changes were complete as a prepared file batch even though the branch did not yet contain them.

The older remote Stage IX QA run [42872942276](https://github.com/gnamma-research/booksite/actions/runs/42872942276) passed all 51 existing browser checks and failed its first new study-tool assertion. It compared rendered text with a raw Markdown quotation containing asterisks. The recovered local test already strips those markers and fixes a separate case-sensitive circularity assertion. **Do not reapply these fixes blindly.**

The latest structural audit passes for **140/111/136** paired units with no failures or warnings. A successful execution of the latest **51-check regression suite plus 30-check study-tools suite** has not been recovered; run both on the saved revision. Then perform the remaining usability inspection, rebuild all nine PDFs, and verify the final release and live files.

## 6. Durable evidence and restart procedure

[Nihayat4_Stage9_Recovered_Research_2026-11-10.zip](https://chatgpt.com/library?file_id=libfile_673bcb72029c8191b429614aadc64ff1&account_id=personal) preserves **770** research files outside the repository, including sources, scans, reports and scripts. Size: **418,504,494 bytes**. SHA-256: `8f5185e9c53be3f25a35b22bb7b0589a5dead218735be90871e2211b76c85fb9`.

The original workspace was `/workspace/scratch/5f05ed215428`; its read-only recovery copy is `/workspace/scratch/bfa9477bedba/recovered-nihayat4`. These local paths are provenance, not restart dependencies. The durable branch and archive are authoritative recovery locations. The archive retains a relative folder tree and a per-file manifest; remap historical absolute paths to the restored root without rewriting the original reports.

The short start file and machine-readable state distinguish published, remotely preserved and pending work. Read them before choosing the next task. Fetch only the current report/unit, not all transcripts, scans or historical handoffs. Save each completed unit or coherent batch, update the cumulative state and evidence, and continue working without waiting for another user prompt after each checkpoint.

This repairs a concrete continuity problem: the old handoff described Stage VIII while significant Stage IX work remained only in its working folder. It does **not** diagnose the ChatGPT conversation error or promise that a service/client error cannot recur. Official [ChatGPT troubleshooting guidance](https://help.openai.com/en/articles/7996703-troubleshooting-chatgpt-error-messages) recommends a fresh chat for long or stuck conversations and preserving diagnostic details if failures persist. The project can now restart from saved files without depending on reopening the failed conversation.
