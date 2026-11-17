# START HERE — Mahāʾimī / Qūnawī, Stage 13

**Checkpoint: 11 November 2026.** Fresh continuation branch: recovery/mahaimi-stage13-20261111, created from current master while preserving other projects. The Mahāʾimī source was recovered from mahaimi-complete-edition at bc97d46b4052855884fe48c95780cfb2d80ed46b. Older Stage09 packages and review/mahaimi-stage12-complete-draft are superseded.

## Read these small files first

1. [Current ledger](../data/coverage-stage13.json).
2. [Edition status](EDITION_STATUS.md).
3. [Stage13 audit](STAGE13_RECOVERY_AND_QA.md).
4. [Review index](review-stage13/review-index.json), only when page-specific evidence is needed.

Process large files on disk and inspect bounded page ranges. Do not print the full corpus, embedded reader, repository tree or prior conversation into a continuation. Read the current remote branch and master before deciding what remains; verify publication separately from file existence. These recovery practices do not diagnose or guarantee a fix for ChatGPT app crashes.

## Exact cumulative position

| Workstream | State |
|---|---|
| Commentary Arabic and English working coverage | 222/222 printed pages, pp.11–232 |
| Qūnawī appendix Arabic and English working coverage | 33/33, pp.235–267 |
| Canonical structure | 254 units; 444 nonempty Arabic–English pairs |
| Commentary English-versus-Arabic review | 222/222 pages; 57 newly reviewed in Stage13 |
| Stage13 corrections | 85 English pair corrections, 30 editorial notes, 3 heading corrections |
| Documented commentary scan comparison | 98/222, including seven recovered prior records; zero new scan comparisons in Stage13 |
| Appendix scan inspection | 33/33 recorded in Stage12 |
| Shared-wording concordance | 158 links, represented reciprocally |
| Independent manuscript collation | 0 |

All available text has working bilingual coverage. Several source readings remain unresolved. P.43 passage 1 retains a marked synopsis of a damaged argument rather than a secure clause-by-clause reconstruction. The p.232 ending breaks off in the acquired printing. Do not invent a continuation or replace it with Qūnawī’s separate ending. Printed pp.113–114 are absent from the acquired scan but present in the electronic transcription.

## Authoritative files and rebuilding

Canonical corpus: data/parallel.json. Reader template: reader-shell.html; assets: reader.js and reader.css. Generated index.html embeds the corpus, ledger, CSS and JavaScript. The bibliography, glossary, prior apparatus and historical drafts remain in the project.

From repository root:

    python tools/build_mahaimi_exports.py
    python tools/build_mahaimi_reader.py
    python tools/build_mahaimi_downloads.py --format all
    python tests/test_mahaimi_stage10.py
    node tests/qunawi_reader_qa.js

The PDF builder requires weasyprint, markdown, Pango and an Arabic font such as Noto Naskh Arabic. The retained Stage10 test filename checks the newest ledger, current exports and PDF digests. Update the single Mahāʾimī entry in texts/manifest.json and its catalogue description without overwriting other projects.

## Remaining scholarly work

1. Compare the remaining 124 commentary pages against images; obtain replacement images for missing pp.113–114. Keep electronic review distinct from photographed print comparison.
2. Resolve the flagged defective clauses and p.43 synopsis using print and independent witnesses; rerun alignment after source-text corrections.
3. Acquire and collate the Āshtiyānī edition and relevant manuscript images, including Leiden Or.5675. Neither is counted as collated.
4. Establish witness relationships before adopting emendations or calling the result a manuscript-critical edition.

For publication state, inspect current master and its GitHub Pages deployment. A saved branch or successful corpus test alone does not establish a public-reader update.
