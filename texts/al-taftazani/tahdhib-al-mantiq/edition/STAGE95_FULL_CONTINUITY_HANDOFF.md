# Tahdhīb — Stage 95 full continuity handoff

**Date:** 2 November 2026. **Single source of truth:** the two NAMA corpora in this repository; do not retranslate or replace completed clauses from earlier Tahdiv/Tahdhīb stages.

## Project boundaries

1. **Authorial Taftāzānī matn**: *Tahdhīb al-Manṭiq* (19 bilingual editorial divisions, original Cairo 1330/1912 pp.3–14) and *Tahdhīb al-Kalām* (1,044 bilingual clauses, original Cairo pp.15–127), each controlled against the same printed base. **Ten** documented *printed-text* comparison records in logic; none is by itself an independently collated manuscript variant.
2. **Separate independent commentary project:** al-Sanandajī's *Taqrīb al-Marām* together with Wasīm al-Kurdistānī's *Ḥāshiyat al-Muḥākamāt*. Keep its own witnesses, printed pages, separate translations and commentary-layer attribution. Quoting al-Yazdī or Shamsiyya commentators as *interpretative comparanda* does not merge that workstream.
3. **No false manuscript certification:** al-Azhar 995 AH and Princeton Garrett 4139Y are located but have no secure folio-and-line collation for the remaining problematic Tahdhīb Kalām words. The 2017 scholarly printing has no recorded text used in our apparatus unless actually inspected.

## Completed source-correction stages

- **Stage 78:** retracted falsely imputed Cairo L16 «الموجبة الكلية» (the longer version belongs to the alternate print), repaired L13 and documented original logic-page concordance.
- **Stage 79:** fixed 512-model nonmodal core tester (previously 343 empty-excluding models), with four explicit existential exceptions. No historical modal claim.
- **Stage 80:** Cairo p.39 Kalām exact original printed «طبيعة غير قارة», «لما مر», «مقدار أسرعها»; tally 109/113.
- **Stage 81:** p.80 «فمنها القدرة لاستناد الحوادث إليه تعالى وفاقا» restored; p.124 «وهم راكعون للعطف» partly restored with nearby syntax explicitly unresolved; tally 110/113.
- **Stages 82–85:** detailed direct Cairo L10–L13 original printing corrections including «وكل منها», «بتنافي نسبتين», «لعلاقة», the governing modal lām, actual subject existence, and removal of explanatory modal phrases absent from Cairo source.
- **Stages 86–87:** restored short Cairo L15 contraposition ending (do not insert «بالافتراض. فتأمل» from another printed matn); repaired four Cairo L17 phrases; maintained a visible issue about the mixed-premise connector. **Ten printed comparisons**, not manuscripts.
- **Stages 88–90:** interpreted «يلزم لذاته» via al-Yazdī's equality-chain example; eight fourth-figure commentary modes, 512-set validity boundaries; Cairo p.12 repaired «مع ضرورية» and «وكليتهما ... موجبة جزئية إن لم يكن بسلب».
- **Stages 91–92:** located al-Kātibī's *Shamsiyya* §§95–104 as a technical antecedent, then the earlier 2019 edited *Sharḥ al-Mawāḍiʿ* probably by al-Kātibī, which attributes additional moods to his teacher al-Abharī and offers **six** expanded conditions. **RETRACTED** the premature idea that `المنعكسة السوالب` means an actually negative major; it means a class **whose negative counterpart converts**. Preserve «الكبرى».
- **Stage 93:** reconstructed special negative simple conversion and special affirmative contraposition as finite-time *one-witness temporal shadows*: **125** life histories, **18** complete antecedents each, zero failures; six explicit assumption-ablation countermodel sets. Under 729 three-term histories, mode6 (42) and mode7 (54) conditional shadows work, but mode8 is underconstrained (**30/66** countermodels) without the additional major-class rule.
- **Stage 94:** proved with **625** two-person/two-time profiles that `lā-dawām` must be attributed to the **same individual** in each particular compound witness: splitting witnesses yields **140** countermodels for each special-conversion form. This is an analytic counterpart to the source's `لكن في الجزئية بالنسبة إلى كل فرد` and al-Yazdī's `d` argument, not a complete historical L13 interpretation.
- **Stage 95:** crosswalked **15** explicitly named Cairo L11 modes (8 simple + 7 compound) against al-Kātibī's **13** customary types (6 universally negative-convertible + 7 other). Cairo separately names two absolute temporal components LT1/LX1, which are components rather than members of the standard Shamsiyya thirteen. The six are L/A/LD1/AD1/LD2/AD2; only LD2/AD2 license the **particular-negative** exceptions. Do **not** confuse these additional components with al-Rāzī's different two types excluded from his independent 15-species scheme.

## Source-facing research dossiers

- [Stage 92 six conditions / al-Abharī attribution](../../tahdhib-al-mantiq/edition/STAGE92_ABHARI_KATIBI_SIX_MODAL_CONDITIONS.md)
- [Stage 93 finite-time conversion and mode 8 gap](STAGE93_SPECIAL_MODAL_CONVERSION_FINITE_TIME_PROOFS.md)
- [Stage 94 same-witness quantified compound test](STAGE94_PARTICULAR_MODAL_SAME_WITNESS_SCOPE.md)
- [Stage 95 source crosswalk](STAGE95_FIFTEEN_THIRTEEN_MODAL_TYPE_CROSSWALK.md)
- [Cumulative logic editorial issue register](LOGIC_AUDIT.md)
- [Remaining Kalām issue register](../../tahdhib-al-kalam/edition/EDITORIAL_STATUS.md)

## Executable tests (all outputs are reproducible JSON)

- `tools/tahdhib/verify_logic_core.py` — traditional nonmodal A/E/I/O skeleton and 512 three-term assignments; + 64-case two-contraforms; + an unrelated 512 arbitrary-binary-relation transitivity test.
- `tools/tahdhib/verify_fourth_figure_scope.py` — eight later-commentary fourth-figure patterns, 512 assignments, three conditional reduction-bridge probes; historical modal conversion NOT presumed.
- `tools/tahdhib/verify_special_modal_temporal_shadow.py` — Stage93 125 and 729 enumerations and premise-ablation counterexamples.
- `tools/tahdhib/verify_special_modal_witness_scope.py` — Stage94 625 two-person scope models and 140 split-witness counterexamples.
- `tools/tahdhib/verify_modal_type_crosswalk.py` — Stage95 source/terminology consistency: 15 / 13 / 6 / 7 / 2; asserts Cairo L11, L14, L15 exact technical anchors.

The GitHub workflow `.github/workflows/tahdhib-reader-ci.yml` runs the scripts and headless browser tests; `.github/workflows/tahdhib-pdfs.yml` regenerates the six A4 source-qualified PDFs on canonical source changes. **Never report success based on queue state**: check the specific final workflow SHA, proof JSON, browser checks, output manifests and source SHA-256.

## Remaining hard research obligations

**Logic (historical, not merely Boolean):**
1. Reconstruct the temporal/necessity/description semantics of the six negative-convertible modal types, especially the two **special particular** types LD2 and AD2, with direct commentary clauses and page locators. The Stage93–94 tests are explicitly *weaker temporal shadows*, not proofs of necessity.
2. For figure-IV modes 6–8, prove the modal *type* of each resulting proposition, not just an O(S,P) truth-function. The 2019 six conditions on negative minor/major class must be kept distinct. Mode 8 currently exposes a concrete unlicensed step.
3. Recheck al-Yazdī's detailed `iftirāḍ` source pp.83–84 and the `Shamsiyyah` §§76/84 in Street's edition against the full author's definitions. Consider multi-person/modal-time semantics, distinguish `ḥaqīqiyya`, mental, external subject realms and actuality.
4. Source-check the remaining Cairo logic words at L14–L17, especially the visibly flagged L17 conditional-premise connector; distinguish original print from alternate printed matn. The manuscript variants remain unclaimed.

**Kalām:**
- **KAL-077.03:** opening words of the closing section; `KAL-077.10` unusual masculine `ذات الواجب مخالف` is already photographically confirmed, but that does not settle page77.
- **KAL-100.02:** exact attribution formula around the purported Mosaic Sabbath quotations.
- **KAL-124.06:** abbreviated syntax around `وهم راكعون`, Jewish prayer vs humility. *Sharḥ al-Maqāṣid* is an authorial conceptual parallel, not a Tahdhīb manuscript.
- The full single-print tally **remains 110/113 pages**. Do not inflate it from a note or a secondary quotation.

**Publication gates:** after the last source-note change, confirm the PDF edition manifest `source_sha256` matches the canonical `data.js` and that six PDFs plus actual browser and all 5 proof reports pass. Those are separate from critical textual certification.

## Editorial invariants

**Source Arabic ≠ translator bracket ≠ commentary interpretation ≠ modern proof shadow ≠ independent manuscript.** Keep stable clause IDs, original printed-page loci, bilingual text and issue labels. Present any historical conditional conclusion as provisional until its proof and source types are specified. Protect completed Sanandajī–Wasīm work from duplicate translation.
