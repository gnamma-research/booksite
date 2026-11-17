# Stage 10 — Qūnawī/al-Mahāʾimī concordance: measured coverage and caution

**Date:** 9 November 2026. This register audits the independent online-transcription dataset now also rendered inside the al-Mahāʾimī GNAMMA reader. It does not promote online transcriptions to manuscript witnesses.

## Actual coverage

- **47** Arabic–English Qūnawī passages, about **8,147 Arabic whitespace-delimited words**, copied from the existing `sadr-al-din-al-qunawi/al-nusus/data/parallel.json` dataset without independently re-editing Arabic.
- **64** pre-existing contextual links to **61** distinct al-Mahāʾimī commentary page entries; every target ID exists in the current `al-mahaimi/.../data/parallel.json`.
- Those 64 links concern material labelled 1–5 and 8–11 in the existing independent-transcription dataset. This is **not** whole-work alignment.
- Arabic segmentation and printed-page indications attached to the forum passages are attributed to that online source, not asserted as independent checks of the 2008 appendix.
- Two authors and three textual layers remain separately identified: Qūnawī source excerpts from forum transcription, Qūnawī's online source proofs from the 2008 appendix (pp.235, 236, 267), and al-Mahāʾimī's commentary.

## Group-by-group register

| Forum dataset text label | Segments | Arabic words (approx.) | Recorded links | Alignment |
|---|---:|---:|---:|---|
| 1 | 3 | 351 | 8 | Contextual links in current data |
| 2 | 1 | 183 | 3 | Contextual links in current data |
| 3 | 3 | 236 | 7 | Contextual links in current data |
| 4 | 2 | 364 | 7 | Contextual links in current data |
| 5 | 1 | 134 | 3 | Contextual links in current data |
| 8 | 5 | 608 | 13 | Contextual links in current data |
| 9 | 2 | 310 | 5 | Contextual links in current data |
| 10 | 3 | 562 | 10 | Contextual links in current data |
| 11 | 3 | 411 | 8 | Contextual links in current data |
| 12 | 2 | 424 | 0 | Not yet aligned |
| 13 | 1 | 242 | 0 | Not yet aligned |
| 14 | 1 | 66 | 0 | Not yet aligned |
| 15 | 1 | 170 | 0 | Not yet aligned |
| 16 | 1 | 146 | 0 | Not yet aligned |
| 17 | 1 | 143 | 0 | Not yet aligned |
| 18 | 1 | 63 | 0 | Not yet aligned |
| 19 | 7 | 1,991 | 0 | Not yet aligned |
| 20 | 9 | 1,743 | 0 | Not yet aligned |

## Caveats about original text numbering

The independent online transcription uses text labels that do **not** yet have a source-checked one-to-one mapping to all 22 numbered `naṣṣ` sections in the printed commentary. In particular its passage `QUN-NU-019-C` identifies the treatment of affinity while Stage07's commentary section labels were constructed under Text Twenty. Likewise forum passages labelled Text Twenty contain sections about quiddity and existence whose position relative to the printed final Texts Twenty-One and Twenty-Two needs an explicit concordance.

**Do not** create additional links by equating numbers. Match quoted lemma text against the actual 2008 commentary and appendix, keeping internal source text and al-Mahāʾimī's interpretation separate. Whenever an alignment involves the independently edited Qūnawī text, record which printed edition and page supplied it.

## Next editorial passes

1. Map the unlinked Qūnawī text labels 12–20 to the **actual** commentary lemmata by Arabic phrase, then add links only for verified substantive correspondences.
2. Acquire/verify Arabic transcriptions of commentary pp.150–229 (80 missing pages); compare these with first-pass English, clause by clause.
3. Acquire and verify the printed 2008 appendix Arabic pp.237–266 (30 missing page proofs); the forum passages should not substitute for page-anchored source readings.
4. Obtain Āshtiyānī's 335-page edition and actual manuscript evidence. No critical reading should be asserted before this work.
5. Retain the explicit p.232 terminal-clause issue without supplying an invented completion.

Source files: [Qūnawī data](../../../../sadr-al-din-al-qunawi/al-nusus/data/parallel.json) and [Stage10 integrated parallel data](../data/parallel.json).
