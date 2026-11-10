# START HERE — al-Mahāʾimī / Qūnawī recovery

Recovery checked: 10 November 2026.

## Latest verified saved work

**Continue from branch `mahaimi-complete-edition`, verified at commit `bc97d46b4052855884fe48c95780cfb2d80ed46b`.**

Repository: `gnamma-research/booksite`.
Project directory: `texts/al-mahaimi/mashra-al-khusus/`.

The earlier restart correction, `210361465d86f25f59e51e7584b8bf0eaf8dbcd8`, pointed to Stage 11 on `master`. Subsequent Stage 12 work was saved on the separate branch above. At this recovery check, that branch contained one commit beyond the earlier restart correction; its edition changes had not been merged to `master`. This file is a recovery pointer, not a merge or a declaration of publication.

Read these pinned files first:

1. [Stage 12 coverage ledger](https://github.com/gnamma-research/booksite/blob/bc97d46b4052855884fe48c95780cfb2d80ed46b/texts/al-mahaimi/mashra-al-khusus/data/coverage-stage12.json).
2. [Stage 12 page review index](https://github.com/gnamma-research/booksite/blob/bc97d46b4052855884fe48c95780cfb2d80ed46b/texts/al-mahaimi/mashra-al-khusus/editorial/review-stage12/review-index.json).
3. [Stage 12 source record](https://github.com/gnamma-research/booksite/blob/bc97d46b4052855884fe48c95780cfb2d80ed46b/texts/al-mahaimi/mashra-al-khusus/editorial/SOURCES_STAGE12.md).
4. [Stage 12 edition status](https://github.com/gnamma-research/booksite/blob/bc97d46b4052855884fe48c95780cfb2d80ed46b/texts/al-mahaimi/mashra-al-khusus/editorial/EDITION_STATUS.md).

The [branch handoff](https://github.com/gnamma-research/booksite/blob/bc97d46b4052855884fe48c95780cfb2d80ed46b/texts/al-mahaimi/mashra-al-khusus/editorial/HANDOFF.md) is useful but its figure of **151 reviewed commentary pages is stale**. The saved ledger and review index both record **165**. Do not substitute a later conversational claim of completion for committed evidence.

## Recovery verification

The canonical JSON at the pinned commit was fetched and parsed during recovery. These checks confirm text presence and recorded review status, not the accuracy of every translation.

| Measure | Verified saved state |
|---|---|
| Canonical reading units | 254 unique entries; 444 Arabic–English pairs, with both fields nonempty in every pair |
| Commentary | All printed pp.11–232: 222 pages in 221 entries; pp.18–19 share one unit |
| Separate Qūnawī appendix | All printed pp.235–267: 33 pages in 33 entries |
| Commentary review recorded | 165/222 pages; ledger and review index agree |
| Commentary review pending | 57 pages: **41–60, 94–105, 125–149** |
| Commentary scan comparison recorded | 91 pages |
| Independent manuscript collation | 0; no critical-edition certification |
| Merge, PDFs, browser checks, live publication | Not established by this recovery; inspect actual files and outcomes before claiming completion |

Stage 11's missing-Arabic counts describe the older main-branch snapshot. Do not apply them to the Stage 12 branch or restart the English translation at p.150.

## Next bounded work

1. Inspect the current remote head of `mahaimi-complete-edition` for a later saved commit before editing; preserve newer work if present.
2. Use the Stage 12 corpus, ledger and review index together. Recover any later saved review patches before repeating review.
3. Begin with one small pending span, such as printed pp.41–45; verify the source and existing review records, apply justified corrections, update the review ledger and index, and save a checkpoint before expanding the scope.
4. Complete the remaining review, then verify the cumulative downloads and reader. Merge and publication need their own verified outcomes.

Process the full corpus as data and print only bounded excerpts or summaries. During this recovery, the ordinary file read returned a blob SHA but empty content for `data/parallel.json`; fetching that exact Git blob succeeded. An empty transport payload is not evidence that the corpus file is empty.

## Conversation-error boundary

The user reports another ChatGPT conversation error after using the earlier corrected guide. **The underlying application/backend cause remains unconfirmed.** A stale branch pointer explains incorrect recovery state; it does not establish why ChatGPT failed.

The recovery operations in this session successfully read the commits, checkpoint files and full corpus. Preserve the exact error screenshot, affected conversation URL, selected model, and failure time with timezone if the error recurs. Do not repeatedly retry a full restart or represent a handoff edit as a platform-error repair.

## Historical checkpoint

[Stage 11 restart guide at 2103614](https://github.com/gnamma-research/booksite/blob/210361465d86f25f59e51e7584b8bf0eaf8dbcd8/texts/al-mahaimi/mashra-al-khusus/editorial/HANDOFF.md).

The older `review/mahaimi-stage12-complete-draft` branch was behind `master` at this check; its name does not identify the latest saved work.
