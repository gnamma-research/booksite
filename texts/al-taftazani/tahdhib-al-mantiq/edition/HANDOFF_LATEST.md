# Tahdhīb Stage122 — recovered digital Arabic for every H note; Q258 errata and source-to-English integrity audit

**12 November 2026.** This is a substantial full **digital source recovery**, *not* a completed, independently manuscript-collated or fully English-verified critical edition. The original historical corpus and all old handoffs are unchanged.

## Exact inherited corpus

- `T` = Taftāzānī original logic matn, `Y` = al-Yazdī principal commentary, `H` = later mixed-author historical glosses, and modern editorial excerpts constitute a separate rights/attribution layer.
- Canonical historical H-first-pass English is unchanged: **1,090** separately historically numbered source positions, **14** local numbering sequences, **1,029** English first-pass renderings, **four** translated-visible-prose but table-incomplete entries, **57** modern editorial reference-only entries. Final substantive H gloss: `H-SCIENCES-086/Q395`.
- [Stage121 full English master](batches/hawashi-all-sections-cumulative-stage121.md), [canonical source-records JSON](hawashi-effective-stage114.json), [Stage121 original handoff](HANDOFF_STAGE121.md) and all earlier handoffs remain untouched. No retranslation from old obsolete pointer such as Concepts36.

## New source recovery and verified checksum counts

- **274/274 archived HTML source pages** have their expected retrieval SHA256 verified. The HTML cache includes Q127–Q400; 1,090 substantive H notes run through Q395, with closing blank/contents pages after.
- **1,090/1,090 Arabic numbered note boundaries and Arabic word counts** correspond to Stage114 independently saved `Source_Census.json`; no numbered historical note had to be invented.
- **1,079/1,090 recovered Arabic unit-text SHA256 values** exactly match the old digital Arabic census. **Eleven** matching-length but mismatching hashes remain under source-normalization/wording review; [full list](STAGE122_ARABIC_SOURCE_RECOVERY_AND_CRITICAL_STATUS.md).
- This makes a **full offline bilingual Arabic–English research sidecar** possible. The original public H corpus had full digital Arabic inside only 79 note records. The new complete Arabic belongs to the **rights-sensitive private offline archive** and is NOT re-published wholesale in this public repository; modern al-Karmī and other edited quotations require an explicit separate permissions/attribution review. User download: `Tahdhib_Stage122_Full_Cumulative_Recovery.zip` delivered within this conversation; public GitHub stores the source integrity and correction data, not the full private source cache.
- **24** source-to-English length-ratio diagnostic candidates (Arabic words >=40 and English/Arabic ratio below 0.5) identified **after excluding the 57 modern reference-only units**. Ratios are triage, not proof of mistranslation. Direct source comparisons confirm substantial abridgement in e.g. `HWN-048` and `HWN-DALALA-084`; the user recovery ZIP includes expanded working two-speaker English draft repairs and a separately attributed modern paraphrase of `HWN-DALALA-078`. No historic English field is silently replaced.

## Six additional fuller historical-note translations and source hash gap register

[Six expanded working historical gloss translations](STAGE122_SIX_EXPANDED_HISTORICAL_NOTES.md) cover the entire recovered historical note argument at `HWN-DALALA-067`, `HWN-CONVERSION-008`, `HWN-CONVERSION-021`, `HWN-CONTRAPOSITION-019`, `HWN-MAFAHIM-011` and `HWN-INTRO-081`, with original speaker attribution retained. Their six note digests match the old census; [per-note provenance](STAGE122_SIX_NOTES_PROVENANCE.json) confirms the original IDs and old English lengths. None was independently photo/manuscript-certified and none replaces the canonical historical English.

The [eleven-source-hash discrepancy ledger](STAGE122_ELEVEN_SOURCE_HASH_GAP_LEDGER.json) preserves expected/recovered digests and source locators. Five units cross printed page boundaries; six do not. The Stage114 embedded Arabic snippet for `HWN-037` omits two speaker labels that are present in the newly recovered source; this observation is a reason to audit attribution, not proof of the cause of its census SHA mismatch.

**Editorial distinction for the four original printed tables:** Q258, Q294, Q300 and Q309 all have photographed source tables, but their completion, transcription and translation grades are tracked separately. Recovery of the original tables does not certify their English translations.

**Two further complete historical-note working translations:** [HWN-DALALA-039 and HWN-DALALA-081](STAGE122_TWO_FURTHER_SIGNIFICATION_GLOSSES.md) develop the definition of compound expressions (including intended part-signification and *taḍammun/muṭābaqa*) and the three conditions of lexical homonymy (multiple meanings, multiple assignments and original *waḍʿ*), with the competing analyses of *murtajal*. Both source-unit hashes match Stage114; neither English is a manuscript-certified reading. Together with [the preceding six historical expansions](STAGE122_SIX_EXPANDED_HISTORICAL_NOTES.md), Stage122 now adds **eight** fuller historical note translations without overwriting the old English.

## Q258 actual printed errors: apply correction overlay, preserve earlier snapshots

[Stage122 source-photo correction register](STAGE122_Q258_SOURCE_PHOTO_ERRATA.json) fixes:
1. `Q258-R01-C01` inherited Stage121 **غير صحيح** (“incorrect”) → photographed **من البسائط الصحيحة المعتبرة** (“one of the sound and accepted simple defining expressions”).
2. `Q258-R01-C07` inherited **غير صحيح** → photographed **غير صحيح للخصوص** (“incorrect because too specific”).

These are source-supported short readings at H1405 printed Q258 / PDF index259 (comparison print H1433 index258); they do **not** certify the other 47 original table cells. The previous **eleven** short `انظر` cross-reference count is **unchanged**, since R01C01 previously said `غير صحيح`, not `انظر`. [Stage121 source reader](STAGE121_SOURCE_READER.html) now displays the two corrections through a separate overlay without mutating old Stage121 JSON.

## Entire source critical status; no false certifications

- Q258: 49 positions each have at least a short photographed phrase from Stage121, but **38 substantive cells** remain incompletely diplomatically translated; the 11 short cross-reference instructions are not new definitions.
- Q294: 105 historic triangular modal comparisons, **47** core shorthand readings and **58** unresolved core codes, with full `فم/حم` direction and `ط/ف` subject-description/time conditions still requiring independent verification.
- Q309: twelve working bilingual examples, three intended `ذكر ما لا يخفى` source instructions, four provisional wordings and two print-vs-digital witness disagreements remain.
- Original H: **1,029 English first-pass fields are NOT line-/clause-verified** merely because their matching Arabic is now recoverable. No whole H printed page has been newly independently certified.
- Original Taftāzānī T and principal commentary Y: **zero** new independently documented authorial manuscript variants in this stage; digital later H printings do not substitute for manuscripts.
- Forty-six exceptional fourth-figure mixed modal syllogisms: source-typed labels and conditional temporal-shadow theorems previously exist; **zero** new historically warranted all-world modal-strength proofs or countermodels certified here.

## Exact reading links and restart task

[Research source-recovery dashboard](STAGE122_SOURCE_RECOVERY_STATUS.html) · [evidence and copyright-aware audit](STAGE122_ARABIC_SOURCE_RECOVERY_AND_CRITICAL_STATUS.md) · [Q258 photographic errata JSON](STAGE122_Q258_SOURCE_PHOTO_ERRATA.json) · [whole Stage121 cumulative historic H Markdown](batches/hawashi-all-sections-cumulative-stage121.md) · [old complete handoff](HANDOFF_STAGE121.md).

**Rights-aware full continuity:** The downloadable **user-private** Stage122 ZIP includes the unchanged entire prior Stage121 cumulative recovery ZIP, the original 274-page HTML source cache, the new complete Arabic+English numbered sidecar, an offline bilingual searchable reader, three source-aligned expanded working translations/paraphrases with speaker-level attribution, two photographed Q258 corrections, 11 hash discrepancies, 24 priority English checks, source extraction methods and SHA256SUMS. This public GNAMMA handoff is **NOT fully cumulative for the private copyrighted Arabic text**, by design. Never infer public publication from a committed research branch; inspect PR merge and subsequent Pages deployment.

**Next indispensable work:** recheck 11 word-length-matched SHA disagreements, repair truncated English first-pass passages (begin with 24 diagnostic candidates), carry out full source-facing H/Y line alignment; finish Q258/Q294/Q309 printed cell collation; independently verify original T/Y manuscripts; prove or countermodel all 46 historical modal syllogistic cases under historically defended semantics. Do not equate this recovery milestone with final critical-edition certification.
