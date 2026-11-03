# Tahdhīb — Stage 102 full continuation / verification handoff

**Date:** 3 November 2026. **Repository:** `gnamma-research/booksite`. **Purpose:** preserve the exact current source-critical, formal-proof and Darūrī-style reader work without confusing working improvements with a definitive multi-witness edition.

## I. Controlling source and current limits

1. **Saʿd al-Dīn al-Taftāzānī, Tahdhīb al-Manṭiq wa-l-Kalām.** Controlling source is Cairo, Maṭbaʿat al-Saʿāda, 1330 AH/1912 CE, physical printed pp. 3–14 (logic) and 15–127 (kalām). The canonical NAMA corpora under the two `edition/data.js` files remain source-of-truth, not the reader's generated flow HTML or the machine-vowel overlays.
2. **Logic:** 19 stable Arabic/English editorial divisions (not physical printed pages), ten independently labelled comparisons with a distinct *printed* matn. Stage97 has source-typed the **46** exceptional fourth-figure combinations (VI 12, VII 22, VIII 12), with types as in Ibn Mubārakshāh/Street's tables; Stage100 explicitly detects four IEO antecedent non-vacuity gaps in one-world/two-time model. These are historical tables and model diagnostics, not a 46-case full semantics certification.
3. **Kalām:** 1,044 stable paired clauses over 113 Cairo printed pages. 112/113 main-text pages have recorded single-Cairo-print source checks. **Printed p. 77**, at KAL-077.03, retains an unsettled initial graphic group before «على كل كلام». Attempts at enlarged photographic inspection do not supply an independent 995 AH manuscript folio-line reading, so no arbitrary smooth conjecture replaces it.
4. **Independent witness** still missing at exact disputed loci: al-Azhar 995 AH 2468/96067 manuscript is digitized; Princeton Garrett 4139Y's kalām extent is unverified in available folio evidence; 2017 Dār al-Ḍiyāʾ edition is bibliographically established but its actual critical-text page is not yet read. Do not claim final multi-witness collation from those metadata records.
5. **Sanandajī and Wasīm:** separate source-facing commentary workstream; never merge with the authorial bilingual corpus.

## II. The independent proof achieved and what it does NOT entail

- Lean 4 file: [`tools/tahdhib/independent_temporal_proofs.lean`](../../tools/tahdhib/independent_temporal_proofs.lean).
- The GH workflow `tahdhib-lean-proof.yml`, pinned to Lean 4.24.0, **passed** (run 41551305876, commit `f8e58ebb5b6b31bd1c31bac0170026e902d8eb1a`).
- Constructively, without assumed finite domains, formal proofs establish the **same-individual** special negative conversion and ordinary temporal negative conclusions of exceptional fourth-figure moods VI, VII, VIII, under explicitly written universal-bridge and descriptive-particular assumptions. This is independent of old 512/625/6561 finite enumerations.
- **This is NOT a proof of the full historical necessity operators or all 46 typed modal conclusion strengths.** Exact historic `L,A,LD1,AD1,LD2,AD2` distinctions, `X2/XD2` result types, existential import, description and actual/mental/external subject realms still need primary-source semantics and real modal proofs.

## III. Darūrī-inspired reader and website features implemented

Both live readers share the same source-preserving experience scripts and typography, with separate settings and annotation storage per book:

- **Study:** original two-language clause cards, source statuses, independent printed variants, critical notes and stable citations.
- **Flow (default):** connected, **unboxed** editorial prose; original section starts separated; 18 paired transcriber page-break ellipses suppressed only visually, never rewritten in the canonical Arabic/English. Soft numbered printed-page or editorial-division locators.
- **Immersive:** same flow with chrome and distractions removed, while original paragraph and chapter separation stays visible.
- Independent **Parallel / Arabic / English** display; responsive mobile stacking, typography scaling, Arabic Amiri/Scheherazade/Noto and English literary serif/Source Sans/Lexend, light/dark/sepia, search, a persistent page dock, stable `#page=N` and `#u-ID` anchors.
- Private local clause **bookmarks, full-clause highlights, notes** with JSON backup/import; Back/Forward/Recent trail in browser-only storage.
- **Terms** panel: 33 introductory editorial definitions linked to source text clauses. It is not the full source-collated historical dictionary found in Darūrī.
- **Two separate assisted Arabic vocalization layers:** partial constrained learner vowels (small manually reviewed examples and term-level hints) and a model-generated, **UNREVIEWED** candidate for all 1,044 kalām + 19 logic units. An exact normalized-letter invariant forbids source consonant changes.
- **Eight PDF editions in the repository:** six canonical bilingual/Arabic/English working PDFs + two separate model-vowelled Arabic candidate PDFs (**59-page kalām** and **8-page logic**) with source SHA-256, overlay SHA-256, PDF checksum and emphatic automatic/unreviewed notices. Neither main source nor six canonical PDFs were overwritten. A separate six-phrase opening-logic grammatical correction ledger has now been introduced; the latest regeneration workflow should be checked before reporting those corrected candidate artifacts as published.

## IV. Source integrity and QA status

1. Canonical `data.js` Arabic/English and clause identifiers were **not modified** by presentation or vocalization controls. The new standalone candidate overlays are published as separate files and verified by manuscript-independent *source-letter* checks.
2. Old Study-mode Playwright source regression (desktop 1440×900, mobile portrait 390×844, landscape 844×390) passed on a prior commit after a short-landscape toolbar fix. The new Flow-mode test then exposed a popover auto-scroll dismissal and a `heads is not iterable` scroll-tracker bug. Both were corrected; **do not report the latest combined CI green until its final GitHub run reaches completed/success**.
3. The reader CI uses a concurrency group to cancel obsolete jobs and prioritize the latest source. Verify both `logical-core` and `reader-chromium` jobs at the **final** SHA; verify screenshots if available. Pending/queued jobs are not success.
4. The original model-vowel generation and two-PDF publication workflows completed successfully, with manifests checked; the newest six-rule re-generation job needs its own success confirmation.
5. The Lean 4 theorem workflow **passed** as specified above, which is independent of the UI checks.

## V. Remaining work before any *definitive* label

1. Secure the actual al-Azhar or other independent manuscript **folio and line** at Cairo p.77 KAL-077.03 and at representative variants across both parts. Compare readings, record sigla/apparatus and justify choice. An isolated print photo is not manuscript collation.
2. Verify the 2017 scholarly edition’s physical pages; do not import text from bibliographic descriptions.
3. Fully prove the **historical** modal typology (all 46 distinct conclusion strengths) from primary definitions, rather than the present partial temporal and Lean results.
4. Human-review every predicted vowel/case-ending across 1,063 source units against original context and an independent edition. The two machine PDFs are **learning aids**, not an academically definitive vowelled copy.
5. Darūrī parity still needs substantial specialized features: morphological search, a proper multi-layer historical terminology dictionary, editorial subject index, word-range highlights and personal-annotation PDF composer. Avoid falsely labelling those as already implemented.

## Repo navigation

- [Kalām reader](tahdhib-al-kalam/edition/)
- [Logic reader](tahdhib-al-mantiq/edition/)
- [Formal proof boundaries](tahdhib-al-mantiq/edition/STAGE101_DOMAIN_INDEPENDENT_PROOF_BOUNDARIES.md)
- [Stage100 non-vacuity audit](tahdhib-al-mantiq/edition/STAGE100_MODAL_NONVACUITY_AND_INDEPENDENT_WITNESS_STATUS.md)
- [Reader parity audit](TAHDHIB_DARURI_READER_PARITY_2026-11-03.md)
- [Kalām editorial status](tahdhib-al-kalam/edition/EDITORIAL_STATUS.md)
- [Logic modal 46-case register](tahdhib-al-mantiq/edition/STAGE97_46_MODAL_MIXES_CRITICAL_DOSSIER.md)

**Truthful certification line:** Continuous bilingual authorial working edition and source-preserving Darūrī-like reader: substantially implemented. Lean arbitrary-domain *temporal* proofs: verified. Fully vocalized grammatically checked copy, full Darūrī apparatus parity, independently collated definitive manuscript edition, and complete historical modal-strength proofs: **not yet established**.
