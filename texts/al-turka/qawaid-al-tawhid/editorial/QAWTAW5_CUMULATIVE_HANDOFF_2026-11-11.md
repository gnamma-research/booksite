# Qawtaw 5 — cumulative completion handoff

**11 November 2026.** Project: Abū Ḥāmid Turka’s *Qawāʿid al-Tawḥīd* and Ṣāʾin al-Dīn Ibn Turka’s *Tamhīd al-Qawāʿid*. Repository: `gnamma-research/booksite`; root: `texts/al-turka/qawaid-al-tawhid/`.

## Completed scope

The working translation of the consulted electronic source sequence was already complete. Qawtaw 5 completes the previously unfinished Arabic–English comparative pass. It adds **85 commentary units and 3,759 Arabic punctuation-derived segments** to the inherited **86 units and 1,761 segments**, giving **171/171 units and 5,520/5,520 segments with recorded comparison**. The corpus comprises 61 surviving ancestral matn units and 110 commentary units (40 introduction, 64 main including four bridge explanations, six conclusion). Four embedded ancestral bridge quotations retain separate attribution.

These are **model-assisted editorial comparisons**, not independent human specialist certifications. The word “manual” in inherited field names is a compatibility label, not evidence of a human reviewer. Every new Arabic segment has an individually prepared English-range decision and specific interpretive note; none is certified merely by automatic proportional alignment, hashes, length ratios or the existence of a translation. Some punctuation segments are quotation ellipses or short fragments rather than complete syntactic clauses.

| Track | State |
|---|---:|
| Surviving matn translated | 61/61 units |
| Consulted commentary translated | 110/110 units |
| Cumulative working-text comparison | 171/171 units |
| Arabic punctuation-segment comparison | 5,520/5,520 |
| Previously unreviewed segments remaining | 0 |
| Wording replacements in this release | 36 |
| Recorded unresolved/source-crux groups | 57 |
| Arabic segments within those groups | 218 |
| Independent manuscripts collated | 0 |
| QT-059 missing ancestral text | Deferred; not reconstructed |

A completed comparison pass is **not a declaration that every reading is secure**. The 57 groups comprise 55 `unresolved-reading` groups and two `corrected-with-source-crux` groups, including inherited decisions. Other notes also qualify interpretation. The register is a practical list of flagged problems, not an exhaustive stemmatic apparatus.

## Principal corrections

**SH-002:** the retained Arabic says certainty that the doctrine of unity is *invalid*. The earlier English silently reversed that negative to fit the surrounding objection. It now preserves “invalid [sic]”; the apparent contradiction remains in the note, not silently repaired in Arabic.

**SH-009:** corrected the direction of constitution in `مقوما له`: the question concerns what attaches later constituting its prior subject, not the prior subject constituting it. Also corrected `حصولها لتلك الطبيعة` so the shares occur to the fixed nature rather than participate in that nature’s occurrence.

**SH-013:** `واحدا من جميع الجهات` now means “one in every respect”, not “necessary in every respect”. The distinction is philosophically material.

**SH-041:** the recipient supplies an influence shaping the manifested form; the old English reversed this into the recipient receiving that influence. Quotation boundaries remain distinct.

**SH-010, SH-036, SH-039-B, SH-041, SH-051:** preserve the derivative predicate “walker”; the displayed work-title *al-Ḥikma al-Manīʿa*; the technical term *tawqīfī* with contextual qualification; and “sages devoted to divine wisdom” rather than falsely suggesting that the sages are deified.

Other changes restore omitted causal/qualifying phrases, the “and thus impossible” conclusion, the displayed `الأصول القويمة`, bodily faculties’ auxiliaries, authorial injunctions and explicit invocations. The [complete before/after correction log](QAWTAW5_CORRECTIONS_2026-11-11.md) and [structured corrections](../qa/qawtaw5-corrections.json) give every change.

**All Arabic is preserved.** The 61-unit matn source and its parallel Markdown are byte-protected during this release. No conjectural Arabic restoration is silently introduced. Existing Qawtaw 4 corrections, including the literal QT-056 negative and distinction between active *mukammil* and passive *mukammal*, remain in force.

## Source and authorial-layer discipline

The introduction follows the retained N electronic edition; main and concluding commentary follow retained Āshtiyānī A transcriptions. This pass checks those saved Arabic strings, not newly acquired manuscript photographs. Its source snapshot is pinned to project state inherited from repository commit `05f28ed5bb62071d3c072683216dabee6e2ee99f` and captured on the Qawtaw 5 branch.

Arguments of opponents remain distinct from replies. Nested quotations from the ancestor’s other books, Ibn ʿArabī, al-Ḥallāj and other authorities remain cited quotations inside the commentary, not independently collated editions of those works. Later modern Arabic/Persian editorial interventions are not promoted to medieval authorial prose.

QT-059’s reported substantial ancestral omission remains **unreconstructed**. SH-059 is the descendant’s surviving commentary and must not be substituted for missing ancestral wording. The project’s adopted opening formula and previous eclectic reading decisions are preserved, not retroactively declared manuscript consensus.

## Files that govern continuation

- `qa/qawtaw5-review.json`: complete new review of 85 units, with original Arabic/English fingerprints, exact ranges, findings, corrections and notes. Its canonical sorted-JSON SHA-256 is `ae75f9fdd3830e63cbbc4991a1b3e2cbb192c76066854537b72b1a335efb1754`.
- `qa/clause-review-adjudications-2026-11-09.json`: cumulative 171-unit decision set. Historical filename retained for compatibility; current metadata states 11 November and model-assisted scope.
- `qa/clause-ledger.json`: all 5,520 Arabic segments with recorded English correspondences and findings, generated from actual canonical source text.
- `qa/qawtaw5-summary.json`: exact current counts and status distribution.
- `qa/qawtaw5-unresolved-register.json`: 57 unresolved/source-crux groups, quoted Arabic, English and locators.
- `editorial/CLAUSE_REVIEW_COMPLETE_2026-11-11.md`: complete cumulative readable comparison report.
- `qa/qawtaw5-corrections.json` and `editorial/QAWTAW5_CORRECTIONS_2026-11-11.md`: 36 before/after replacements and reasons.
- `data/commentary-introduction-*.js`, `data/commentary-main-*.js`: canonical revised commentary modules. Matching `main-commentary-*.en.json` draft records are synchronized.
- `data/commentary-corpus.json`, `data/parallel-commentary.md`, `data/commentary-english.md`: regenerated cumulative text.
- `downloads/Tamhid_Complete_Commentary_Reading_Edition.html`: complete self-contained commentary reader. Its texts and controls are embedded; external reference links remain online.
- `pdf/manifest.json` plus five PDFs: regenerated reading/study/reference editions, with real page counts and SHA-256 hashes.
- `qa/qawtaw5-release-tests.json`: source, coverage and export-parity tests.
- `qa/qawtaw5-publication-evidence.json`: build/browser/PDF evidence written only after those checks succeed. Repository merge and live deployment must be checked separately.

## Reader changes

The clause-review page reads the **canonical cumulative ledger**, replacing the obsolete auxiliary machine-alignment JSONL files. It labels comparison honestly, exposes an unresolved-reading filter and does not display 100% comparison as a 100% accuracy score. Main and commentary readers link to the review and this handoff. Existing language controls, focus modes, search, bookmarks, source notes and authorial separation are retained.

## Reproducible release

1. Run `python qa/qawtaw5_release.py` to verify the reviewed-record checksum, apply exact/idempotent English changes, preserve Arabic, synchronize source drafts and merge decisions.
2. Run `python qa/finalize-reading-edition.py`, then `node qa/generate-clause-ledger.mjs`, then `python qa/qawtaw5_release.py --verify`.
3. Run the real Chromium reader and standalone tests. Browser emulation is not physical iOS Safari certification.
4. Run `python pdf/build_editions.py` only after the corpus is regenerated. Verify all five actual PDF binaries against their manifest, extract representative corrected English and inspect rendered pages.
5. Publish the reviewed branch without overwriting unrelated concurrent work. Verify the resulting commit and actual public reader assets before reporting a live deployment.

## What remains outside this completed pass

The next scholarly work is **resolving the explicitly registered readings through photographed printed pages and independent witnesses**, not repeating the previously unfinished 85-unit pass. Specialist human review remains valuable, particularly for negations, modal distinctions, the first determination, quoted authorities and technical naming. The wording of QT-059 cannot be recovered from conjectural doctrinal reconstruction. A definitive manuscript-critical edition and stemma remain unestablished; this release is a completely compared, source-based working translation with an explicit uncertainty register.
