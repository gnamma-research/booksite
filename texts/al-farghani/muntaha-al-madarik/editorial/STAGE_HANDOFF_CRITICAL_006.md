# Farghānī · *Muntahā al-madārik*: critical stage VI handoff

**9 November 2026 · exact resumption after historic-print comparative set 003.**

## Current edition boundary and preserved baseline

The author's four-uṣūl Arabic introduction (B2007 pp18–143) and its concluding *tatimmat al-dībāja* (pp144–145) have a **continuous working English draft** covering 128 printed Beirut pages. The draft is preserved in `WORKING_TRANSLATION_18_145.md` and the prior full cumulative archives (`FULL_CUMULATIVE_P145.md`, `FULL_CUMULATIVE_CRITICAL_003.md`, `_004.md`, `_005.md`). The later verse commentary on Ibn al-Fāriḍ's *Tāʾiyya* has **not** been translated as part of this introductory edition.

The modern Arabic-to-English clause-review layer contains **198 selected checked clauses** on B2007 pp18–36. Pages 24–36 are not exhaustively proofread. No full continuous critical Arabic base text is currently constituted.

## What was newly done in stage VI

Princeton/NYU's **I1876 volume I printed facsimile**, original low-res PDF SHA-256 `d2c73c571e869df040f263b5146a1f42ce33f691a9c4a556c1e6eb01f3bf8f87`, has now been directly inspected at **eight bounded textual comparison loci** on historical printed pp5,6,7,8,9,10,13,18 (PDF scans9,10,11,12,13,14,17,22). The complete data are in [I1876_COLLATION_CUMULATIVE_003.json](I1876_COLLATION_CUMULATIVE_003.json); the findings and close reading are in [I1876_COLLATION_STAGE_006.md](I1876_COLLATION_STAGE_006.md).

**Cumulative confirmed print-to-print results: four differences, four narrow agreements, zero examined manuscript folios.** The fourth difference established now: I1876 p13 `والتعيّن الأول المذكور` (masculine) versus B2007 p29 `والتعيّن الأول المذكورة` (feminine); adopt the earlier PRINT reading provisionally, preserve B2007 in apparatus. Two new narrow agreements were photographed: (1) I1876 pp8–9 confirms the difficult B2007 p23 `فلم تعلم ولم يحكم بشيء منها إلا بعد تعينها`; (2) I1876 p10 confirms the bounded directionality `حكم الغضب عارجا لا نازلا` corresponding to B2007 p25. Neither agreement settles the doctrinal/syntactic question.

Earlier confirmed print differences: I1876 p6 `الغائي` vs B2007 p19 `الغائب`; I1876 p6 `علميا ووجوديا` vs B2007 p19 `عمليا ووجوديا`; I1876 p18 `الحضرة العمائية` vs B2007 p34 `الحضرة العملية`. Earlier agreements: p5 `بطون المشتمل` and p7 `من حيث واحديتها`.

**Photographic files are permanently present** in `facsimile-I1876/images/scan_####.jpg`, with image source/derivative checksums in `facsimile-I1876/SOURCE_INGEST_MANIFEST.json`. The original 1876 scan set contains 368 pages; 59 selected pages were ingested, but only the eight bounded textual loci above have been visually compared and registered.

## Exact quality constraints

- The photos are of a historical PRINT, not a medieval manuscript.
- No unexamined text is labelled “verified”; eight sampled pages do not mean eight complete pages were collated.
- Manuscript candidates C1107, R670, K273, F3966 and Y706 are registered, not imaged or collated.
- B2007 p33 `في عون هذا` remains unresolved. Do not silently change `عون` to `عين`. Higher-resolution original print and at least two independent early manuscripts are needed.
- B2007 p23's apparent temporal knowledge assertion and p25's `على أنها غايات` syntax remain as written; eighteenth-/nineteenth-century printing agreement is not a rational-theological harmonization.
- Quoted Ibn al-Fāriḍ poem readings belong to the poet's own textual tradition; they are not automatically Farghānī manuscript variants.
- All prior cumulative English and historical editorial snapshots must be preserved; additions must be append-only or clearly versioned.

## Current canonical pointers

- [Full existing translated introduction and previous apparatus](FULL_CUMULATIVE_CRITICAL_005.md)
- [This stage's photographic close reading](I1876_COLLATION_STAGE_006.md)
- [Eight-locus machine-readable print collation](I1876_COLLATION_CUMULATIVE_003.json)
- [Current witness register](WITNESS_REGISTER.json)
- [Current 128-page source-quality ledger](CRITICAL_COVERAGE_REGISTER.json)
- [Current outstanding reading decisions](CRITICAL_LOCUS_REGISTER_004.json)
- [Critical bilingual source reader](../critical-edition.html)
- [GNAMMA book entry](../index.html)

## Next operation (not more preliminary summary)

1. Reinspect I1876 printed p16/scan20 and any high-res alternative for B2007 p33 `في عون هذا`. If undecidable, leave as a flagged crux.
2. Obtain and photograph **C1107** and **R670** relevant folio lines, plus **K273/F3966/Y706** where possible. Explicitly compare `المذكور`, `العمائية`, `الغائي`, `علميا`, and the two retained difficult clauses before making archetypal claims.
3. Extend systematic B2007 Arabic–English check beginning at **p37**; maintain 128-page bilingual completeness ledger. Source-page count, checked clauses, I1876 printed page, PDF scan index, manuscript folio and original Arabic must remain separately indexed.
4. Publish a reasoned copy-text selection with variant rationale **only once independent medieval witness family evidence is in hand**.
