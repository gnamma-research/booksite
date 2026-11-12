# Tahdhīb Stage122 — complete digital Arabic source recovery, reliability and two photographed corrections

**12 November 2026. Full source recovery for private scholarly study; NOT a critically verified, wholly translated or manuscript-collated edition.**

## 1. Actual recoverable source improvement

The earlier Stage114 English-first H corpus listed **1,090 numbered positions** across **14 separately numbered historical sections**, with **1,029** English first-pass fields, **four** prose-rendered but table-incomplete entries and **57** modern-editorial references not fully translated in a separate rights-cleared scope.

Stage122 recovers the **digital Arabic body of every one of those 1,090 numbered notes** from the already archived Qum-page HTML, Q127–Q395. The 274 original archival HTML snapshots Q127–Q400 (including trailing contents pages) are verified against their retained SHA256 retrieval manifest. The recovered note boundaries/word counts match the independent Stage114 source census for **1,090/1,090** records. Independent note-level SHA256 comparison gives **1,079 exact matches**, leaving **11 word-count-matched but byte-different** reconstructions for investigation.

**This is not 1,090 Arabic source readings independently checked against photographic printed pages.** The cache is a digital transcription of a modern print; byte-equality proves reproducibility against the earlier digital census, not fidelity to the underlying original or to Taftāzānī's authorial words.

**Reproducible SHA ledger:** [all eleven expected and recovered digests](STAGE122_ELEVEN_SOURCE_HASH_GAP_LEDGER.json), together with the original page-cache ZIP digest. Five mismatching notes cross page boundaries; six are confined to one page. In `HWN-037`, the older embedded Arabic snippet omits the two separately signed speaker labels that are present in the recovered digital text. This is an attribution difference in an earlier embedded text, **not proof of why the independent census SHA differs**.

### Eleven still-unresolved unit SHA256 disagreements

| Note ID | Qum printed pages |
|---|---|
| HWN-008 | 128–129 |
| HWN-037 | 139 |
| HWN-084 | 149 |
| HWN-126 | 160 |
| HWN-INTRO-018 | 168–169 |
| HWN-DALALA-069 | 206–207 |
| HWN-MAFAHIM-042 | 226 |
| HWN-PROPOSITIONS-013 | 266–267 |
| HWN-SYLLOGISM-043 | 352 |
| HWN-SYLLOGISM-056 | 354–355 |
| HWN-SYLLOGISM-150 | 369 |

Their **word counts agree exactly** with the old census; do not label any of these a substantive textual variant without comparing page images and normalization. The raw page screenshots/HTML have not been altered or published anew.

### A methodological gap in the English-first edition

A source-to-translation length review identified **24** English notes with at least 40 Arabic source words and an English/Arabic word-count ratio below 0.5, excluding the separate 57 modern-reference-only items. This is a *triage* signal, not itself a proof of an inaccurate translation. Direct examination shows actual compression/omission in:
- H-PREFACE HWN-048, Q142: the old 52-word English rendered Muḥammad ʿAlī's Qurʾānic example, but omitted the separately signed ʿAbd al-Raḥīm's extended objections and replies on the word *ṣalāt*, homonymy, figuration and the Arabic preposition **ʿalā**.
- H-DALALA HWN-DALALA-084, Q213: the old 54-word English condensed a 323-word two-speaker Arabic text about scope of negation and the fivefold classification.
- H-DALALA HWN-DALALA-078, Q210–211: the old 54-word English covered the historical opening but not a long, separately quoted **modern** intervention of Muḥammad al-Karmī; this part must remain a separate rights/attribution scope, not automatically treated as historical H text.

A fuller two-speaker working English draft for HWN-048 and HWN-DALALA-084 and a **separate modern paraphrase** for the last example have been preserved in the user-provided **offline** Stage122 recovery archive. No inherited canonical translation is silently overwritten or falsely relabelled as clause-verified.

## 2. Two concrete photographic corrections at Q258

[Photo-sourced correction overlay](STAGE122_Q258_SOURCE_PHOTO_ERRATA.json) records:

| Table cell | Superseded Stage121 Arabic | H1405 printed reading | Updated English |
|---|---|---|---|
| R01C01 | غير صحيح | **من البسائط الصحيحة المعتبرة** | One of the sound and accepted simple defining expressions |
| R01C07 | غير صحيح | **غير صحيح للخصوص** | Incorrect, because too specific |

**R01C01 changes the earlier validity classification**, not merely the translation's style. The older Stage121 text for R01C01 was *غير صحيح*, not *انظر*: the earlier count of **eleven cross-reference-only** entries is therefore **unchanged**. These two photographed corrections do not certify the other 47 Q258 cells.

Source: photographed [H1405 Q258](https://archive.org/download/lis_fa12/lis_fa1208.pdf), zero-based PDF index259; comparison [H1433 Q258](https://archive.org/download/lis_fa12/lis_fa1209.pdf), index258. Both are printed H-gloss witnesses, not independent manuscripts of the T authorial text or principal Y commentary.

## 3. Publication and copyright boundary

The complete digital Arabic recovered for every note is retained inside the **user's downloadable offline research package** along with the original 274-page archive and the exact previous Stage121 cumulative archive. This public GNAMMA repository receives **source counts, hash and attribution information, scholarly corrections and reader links**, not wholesale re-publication of later editorial inserts that may remain rights-restricted. Do not confuse a private recovery archive with public deployment.

The continuous GNAMMA main reader remains the existing Stage121 edition; this Stage122 source-recovery dossier is an **optional scholarly apparatus**, not another preface inserted into the reading stream. A reproducible source-extraction script and raw source files remain in the offline cumulative ZIP, alongside each item's source URL.

## 4. Strict remaining obligations

1. **H English:** independently compare all 1,029 first-pass English passages clause by clause against the now recovered digital Arabic, preserving separate H speakers and 57 modern citations; correct abridgements and misunderstood logical objections.
2. **Q258/Q294/Q309:** complete all 38 substantive full defining-judgment cells; verify the 58 untranscribed Q294 glyph cores plus all 105 direction/description/time qualifications; close Q309's four provisional working examples and two source disagreements.
3. **Independent manuscripts:** verify authentic T and principal-Y witness readings rather than mistaking H printed pages for authorial variants.
4. **Forty-six exceptional syllogistic mixtures:** independently establish historically intended modal truth conditions and validity or concrete countermodels for the earlier source-typed fourth-figure cases. Finite/time shadow proofs are not full historical necessity-theorem certifications.
5. **Edition outcome:** maintain separate measures for source recovery, full translation, clause checks, photographed collation, and manuscript proof. Recovery is substantially advanced; a completed unabridged critical edition is not yet established.

**Immutable continuity:** the entire Stage121 corpus and handoff remain unchanged. Do not restart an obsolete translation pointer, invent numbered prose after the historic Q395 endpoint, or treat the 1,079 source-hash matches as 1,079 independently verified English translations.
