# Stage 13 clean rebuild from Stage 11

**11 November 2026.** Rebuild branch: `rebuild/mahaimi-from-stage11-20261111`.

## Exact starting points

The rebuild starts from the working production commit `2378a11a6c2e93e71b74518d9352d23fc3a9577b`, whose Mahāʾimī reader was Stage 11 and whose navigation already includes the restored Mahāʾimī menu entry. No Stage 12/13 branch merge was used. The corrected source text and supporting editorial files were recovered selectively from `9ae479aebe9e4fbd6eac81506dd4a9929c2eed70` and the reader and text downloads regenerated on the production base.

The canonical Arabic and English remain byte-identical to that recovered Stage 13 corpus: SHA-256 `b6767ba2831ba88946385da3f7119af9f8294a82751bb306271893f7f0e5861f`. No completed translation was restarted, and no new translation or image-comparison pages are claimed for this rebuild.

## Failures identified and retained checks

The initial Qūnawī compatibility check attempted `mah.sections.map(...)` after the canonical Mahāʾimī data became a top-level array. The corrected check accepts either supported container shape, requires a real array, and still validates every target ID and printed-page reference.

The initial Mahāʾimī integrity check compared the new corpus with inherited Stage 11 catalogue metadata while still expecting Stage 12. The corrected check compares the current ledger with the current catalogue and actual corpus count. Coverage, source limitations, embedded reader equality, links and PDF digests remain required. No validation gate is disabled.

Both issues had already been repaired in the last saved recovery commit. This rebuild retains those repairs while establishing a fresh release from the Stage 11 production base. Historical failed runs are not evidence that the final saved text or final checks remained broken.

## Cumulative package and continuation

The reader now links visibly to the [full cumulative handoff and stage archive](../handoffs.html). The ZIP preserves the complete bilingual text, structured corpus, all available editorial and historical records, reader sources, three PDFs and the relevant build/check files. The accompanying manifest records file bytes, SHA-256 and Git blob identifiers, exact source commits and the next unrecorded print-comparison locus. The Markdown contains the entire bilingual text and available textual/editorial archive, not a progress summary.

All 222 commentary pages and all 33 appendix pages have working Arabic and English. The inherited review ledgers cover 222 distinct commentary pages. Documented commentary scan comparison remains 98/222; appendix image inspection remains 33/33. Independent manuscript collation remains zero. The next unrecorded commentary image comparison is printed p.22. Source uncertainties at p.43, missing scan pp.113–114 and the unfinished p.232 ending remain recorded.

## PDF release inspection

The English (312 pages), bilingual (564) and Arabic (294) PDFs were retained byte-for-byte because their canonical source is unchanged. All three match their recorded lengths and SHA-256 digests, contain all 254 canonical unit identifiers, and yield no replacement characters in extraction.

Sixteen Poppler-rendered samples were inspected: English pp.1,4,156,307,312; bilingual pp.1,4,282,559,564; Arabic pp.1,4,137,147,289,294. No material clipping, paragraph/footer overlap or Arabic-shaping defect was observed in those samples. This is sampled layout inspection and file-integrity verification, not independent certification of every translated clause.

## Reproduction

From the repository root:

```sh
python tools/build_mahaimi_exports.py
python tools/build_mahaimi_reader.py
python tools/build_mahaimi_handoff.py
node --check texts/al-mahaimi/mashra-al-khusus/reader.js
python tests/test_mahaimi_stage10.py
node tests/qunawi_reader_qa.js
```

The last cross-reader check also uses the separate Qūnawī project in this repository. The ZIP includes the complete Mahāʾimī project and its Qūnawī appendix; it does not duplicate that separate project's complete research corpus. External primary-source scans are linked in the source register and are not republished as project downloads. Public deployment must be verified separately at the reader URL; a successful local build or branch check is not itself a deployment claim.
