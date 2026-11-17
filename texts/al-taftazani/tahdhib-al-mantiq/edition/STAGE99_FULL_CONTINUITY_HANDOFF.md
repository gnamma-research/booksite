# Tahdhīb — Stage 99 consolidated handoff (2 November 2026)

This records what was actually completed during the Stage97/98 continuation of al-Taftāzānī’s *Tahdhīb al-Manṭiq wa-l-Kalām*. The repositories and clause IDs take priority over obsolete earlier stage drafts. **Completion** means a complete working bilingual translation and complete 46-case modal *source classification*, not a definitive 995-AH-manuscript-critical edition.

## Canonical edition and boundaries

- Repo: `gnamma-research/booksite` (default `master`).
- Logic bilingual reader: `texts/al-taftazani/tahdhib-al-mantiq/edition/` — **19** editorial divisions, Cairo printed pp.3–14, stable units L.01–L.19. New Stage97 dossier `STAGE97_46_MODAL_MIXES_CRITICAL_DOSSIER.md`.
- Kalām bilingual reader: `texts/al-taftazani/tahdhib-al-kalam/edition/` — **1,044** stable clauses KAL-015.01 ... KAL-127..., Cairo printed pp.15–127, **113 pages represented**.
- Cairo printed page review: **112 of 113** original kalām printed pages source-checked. One unresolved *printed character* at **KAL-077.03**, Cairo **p.77**. Two formerly flagged readings have been repaired directly in Cairo p.100 and p.124 during Stage98.
- The work on *al-Sanandajī Taqrīb al-Marām* + *Wasīm Ḥāshiyat al-Muḥākamāt* remains **a different** source-facing jointly developed translation workstream. This Stage99 file does not duplicate its pages or falsely count commentary as Taftāzānī’s matn.

## Precisely what Stage97 newly completed

1. **All 46 historically admissible special fourth-figure modal mixes** have case IDs, modal class of both premises, quantity/quality, conversion step, reduced figure, source-typed modal conclusion, and source locator in `stage97_fourth_figure_46_typed_mixes.csv` and machine-readable JSON.
2. **Sixth mood** AOO: 12 cases. Converting special negative minor O(LD2/AD2) to O(AD2) and reducing to figure II yields **4 O(A)** and **8 O(AD1)** under Street's table (adapted from Ibn Mubārakshāh).
3. **Seventh mood** OAO: 22 cases. Converting special negative major O(LD2/AD2) to O(AD2) and reducing to figure III yields **12 O(XD2)** and **10 O(X2)**. `XD2` nonperpetual absolute continuing is *not* `AD2` special customary.
4. **Eighth mood** IEO: 12 cases. The special E **minor is universal**, with one of six admissible particular affirmative I major classes. Reduce to figure I and convert the specifically qualified negative particular result to yield **12 O(AD2)**.
5. Existing Stage96 finite-time probe for mood VIII was retained (6,561 profiles, 128 complete antecedents, zero failures). Added independent Stage97 multi-person finite-time probes for mood VI/VII (6,561 profiles each; 376 fully meeting their bounded premises and zero ordinary negative-conclusion failures each, with 456 weakened-negative and 200 weakened-bridge countermodels for each). All finite tests are precisely **temporal shadows**, not formal independent proofs of historical modal necessity.
6. The source-typed 46-case register and VI/VII verifier were added to the NAMA GitHub CI, and L.16 scholarly notes updated **without changing the 1912 Arabic**.

Sources: Tony Street, *Najm al-Dīn al-Kātibī's al-Risālah al-Shamsiyyah* (NYU Press 2024), §104 p.253 and Appendix Tables 1,3,4 pp.305–307 (source provenance p.303); Özpilavcı–Öztop (2019), edited early *Sharḥ al-Mawāḍiʿ al-Mushkila*, p.89. Sources are to be identified as *earlier logical text and later commentary*, never a second Taftāzānī manuscript.

## Precisely what Stage98 newly corrected in the Arabic and translation

- **KAL-100.02**, printed p.100: replaced unhelpful placeholder with Cairo print «ولدين موسى», preserving the two alleged Sabbath/perpetuity formulae as **reported objectors' claims**, not authenticated Moses/Torah quotations. Punctuation and the supply “[they invoke]” are editorial.
- **KAL-100.07**, p.100: corrected missing preposition `بـ` in «أو بحكمة البعثة».
- **KAL-124.06**, p.124: replaced bracketed uncertainty with actual Cairo print «وهم راكعون للعطف لا كصلاة اليهود أو خاضعون». Kept the sentence terse instead of importing full *Sharḥ al-Maqāṣid* V, p.271 wording.
- Rechecked the remaining printed main-text lines on original pp.100 and 124, establishing a **single-print page check only**; two-page gain **110 → 112**. This was entered into the canonical `data.js`, current editorial status and NAMA reader notes, with stable clause counts preserved.
- **KAL-077.03**, p.77 remains unresolved: the first word before «على كل كلام في كل باب» cannot be certified. Preserve the source issue flag rather than making a probable grammatical conjecture.

## What remains deliberately NOT done and must not be counted as completion

1. **Independently manuscript-collated Arabic Tahdhīb edition:** the 995 AH al-Azhar 41-image facsimile has been located and several spreads viewed, but its actual exact folio side and line readings for Cairo pp.77, 100, 124 have **not** been securely established. Same for Princeton Garrett 4139Y. The 2017 academic edition is not inspected. No independent manuscript variants were adopted or rejected. This remains an editorial requirement for a definitive critical edition.
2. **Exact full modal semantics:** although all 46 source cases are typed, no all-world necessity or description-relative modality theorem has been proved independently for all 46 under exactly historical meanings. The verification scripts do not claim this.
3. **Missing printed p.77 word:** one still-open source textual question remains before 113/113 *single-print* closure.
4. **Rendered publication artifacts — verified 2 November 2026:** the canonical six NAMA PDF variants were regenerated and published, with source-hash manifests. GitHub Actions run **41523701678** (`Tahdhib bilingual PDF editions`) completed **success**, and run **41523701599** (`Tahdhib actual reader and logic verification`) completed **success**, both triggered by the Stage97 status commit `25f26c307234f4b3f3e34047e3bde9bfed5fb2fd`. Both reader/browser and logic source regression jobs passed; the PDF manifest lists three PDFs for each work and the Stage98 112/113 kalām status. CI green and SHA hash attest reproducible *publication*, not historical fidelity or manuscript agreement.

## Current primary links

- Logic: https://gnamma-research.github.io/booksite/texts/al-taftazani/tahdhib-al-mantiq/edition/
- Kalām: https://gnamma-research.github.io/booksite/texts/al-taftazani/tahdhib-al-kalam/edition/
- Stage97: https://github.com/gnamma-research/booksite/blob/master/texts/al-taftazani/tahdhib-al-mantiq/edition/STAGE97_46_MODAL_MIXES_CRITICAL_DOSSIER.md
- Stage98: https://github.com/gnamma-research/booksite/blob/master/texts/al-taftazani/tahdhib-al-kalam/edition/STAGE98_CAIRO_P100_P124_AND_P77_AUDIT.md
- Status: https://github.com/gnamma-research/booksite/blob/master/texts/al-taftazani/tahdhib-al-kalam/edition/EDITORIAL_STATUS.md
- Al-Azhar facsimile: https://www.alukah.net/Manu/Files/Manuscript_6154/Makhtotah.pdf
- Street 2024: https://dhjhkxawhe8q4.cloudfront.net/library-of-arabic-literature-wp/assets/20240530034338/9781479827510_WEB-1.pdf

## Reproducibility in this packet

- `STAGE97_46_MIXES_CRITICAL_DOSSIER.md` — complete forty-six rows, historical sources and limits.
- `stage97_fourth_figure_46_typed_mixes.csv`, `.json` — 46 case rows and a frequency/role summary.
- `verify_fourth_figure_46_modal_types.py`, `verify_fourth_figure_modes6_7_temporal_shadow.py` — locally executed tests and regeneration.
- `stage97_modes6_7_temporal_shadow.json` — finite-time proof result and countermodels.
- `STAGE98_CAIRO_P100_P124_REVIEW_AND_P77_CRUX.md` — source-critical proof and remaining p.77.
- `cairo_p77_3x.png`, `cairo_p100_3x.png`, `cairo_p124_3x.png` — photos *of the 1912 print*, not independent manuscript scans.
- This `STAGE99_FULL_CONTINUITY_HANDOFF.md` — what was accomplished, what is a separate completion standard, and canonical links.