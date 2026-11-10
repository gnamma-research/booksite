# GNAMMA Ḥikma — Stage VII cumulative handoff (10 November 2026)

**Repo:** `gnamma-research/booksite`. **Working branch:** `hikma-stage7-dual-track-20261110`. **Inherited full evidence:** [Stage VI](hikma-collation-handoff-2026-11-10-batch-6.md) → [V](hikma-collation-handoff-2026-11-09-batch-5.md) → [IV](hikma-collation-handoff-2026-11-09-batch-4.md). Preserve these older stage-specific decisions and source records. **Status remains a working edition, NOT a critically definitive or specialist-certified one.**

## Exact cumulative status (not interchangeable measures)

| Work / grade | Cumulative | Meaning and limitations |
| --- | ---: | --- |
| al-Muẓaffar, *al-Manṭiq* | **78 selected original Arabic + working English units** | 11 Intro; 11 Book I; 17 Book II; 14 Book III; **25 Book IV**; Books V–VI **zero**. Full original six books not translated. Figures and some exercises are still absent. |
| Ṭabāṭabāʾī, *Bidāyat al-Ḥikma* | **111/111** paired working authorial units | Complete working Arabic–English reader; not independent whole-work scholarly collation |
| Ṭabāṭabāʾī, *Nihāyat al-Ḥikma* | **136/136** paired working authorial units | Full authorial reader coverage, but working transcription and translation |
| *Nihāya* complete local unit-by-unit reading checks | **86/136 = 63.24%** | Six new reviews. **50** whole-unit local bilingual checks remain. This status compares to *stored* 1417 printed-digital Arabic, not independently to 1404 or 1428 |
| *Nihāya* 1428 secondary edited print-digital partial checks | **9 target passages** | **Four** new VI.1, VI.2, VI.9, VI.10. A local excerpt check is neither full independent chapter collation nor manuscript certification |
| *Nihāya* **independent complete** second witness collations | **0/136** | No whole-chapter complete external print/manuscript collations recorded. Preserve separate evidence grades |
| Certified independent specialist review | **0** | No external chapter-by-chapter critical edition sign-off |
| Aggregate source-paired **working units** | **325** = 78+111+136 | Not a count of printed pages or a proof of translated entirety |

## New original Muẓaffar Book IV readings — M-C-15 through M-C-25

All content appended to `../muzaffar-al-mantiq/data/book.json` with primary Arabic, newly rendered working English, source locators and editorial caveats. **Printed pp.148–159, selected passages**, not an exhaustive facsimile of every chart, note or exercise.

| ID | 1402 printed pages | Consecutive content |
| --- | --- | --- |
| `M-C-15` | 148–149 | Compound modal form, explicit proposition and opposite-quality implied component, keeping quantity; 'not always' vs 'not necessarily' |
| `M-C-16` | 149 | Two conditional/customary special compounds, intrinsic vs title-conditioned necessity and permanence |
| `M-C-17` | 150 | Actuality without necessity vs actuality without permanence; source example contains a polarity anomaly, **not silently repaired** |
| `M-C-18` | 151 | Conditional actuality with nonpermanence; special two-sided possibility vs one-sided general possibility |
| `M-C-19` | 152 | All seven numbered authorial modal exercises (summary chart image not transcribed) |
| `M-C-20` | 153–154 | *Luzūmiyya* vs *ittifāqiyya*: explanatory necessity vs repeated accidental conjunction, with original water/teacher examples |
| `M-C-21` | 154–155 | Intrinsic vs incidental exclusion; *ḥaqīqiyya* exclusive-and-exhaustive disjunction, including negated form |
| `M-C-22` | 155–156 | *Māniʿat al-jamʿ*: at most one true vs *māniʿat al-khulūw*: at least one true; original scientific/theological examples, negation scope |
| `M-C-23` | 156–157 | Nested/mixed conditional antecedents/consequents and multi-branch disjunctions |
| `M-C-24` | 157–158 | *Munḥarifāt*: displaced quantified categoricals, conditional syntax, three original worked applications |
| `M-C-25` | 159 | Four authorial end-of-chapter exercises, including five lettered subparts; graphic schema not copied |

**Source gradation:** Verified against the digitally presented 1402 AH Dār al-Taʿāruf author's text at `https://lib.rafed.net/view.php?b_id=1604&page=154&type=c_fbook`, and selected parallel passages of the separately digitally presented 1421 AH edition (`https://ablibrary.net/book_content/b/4628/177?lang=ar` and adjacent pages through p.186). Both are digital *text presentations*, **not a second manuscript or independently collated facsimile**. The independent NYU/Princeton 1968 scanned print `https://sites.dlib.nyu.edu/viewer/books/princeton_aco000780/1` remains **uncollated**. The p.152 and p.159 printed summary diagrams were images, not completely transcribed. Explicitly retain the M-K-08 symbolic formula conjecture and normalized M-K-14 as unsettled. The M-C-17 source juxtaposition of negative and affirmative human-breathing example persists in both sampled print-digital texts and remains **unresolved**, not a verified alternative reading.

**Next precise original authorial locus:** Book IV second chapter on **judgments of propositions / contradiction** from **printed p.160** onward. Use `M-C-26`, read continuous original Arabic (authorial prose and exercises) sequentially through remaining Book IV up to p.198, Book V pp.199–276 and Book VI pp.277–455; avoid fabricated source and artificial percentage-of-chapters progress.

## New *Nihāya* local same-base complete textual reviews

Every following unit is now **local-bilingual-reading-checked** in `nihaya-english-collation-triage-2026-11-09.json`, with a separate source-grade and exact pages; **no English authorial-unit changes adopted** in this stage.

- `N-VI-01`, pp.111–114: ten mutually distinct highest genera, common being/thing/accident concepts vs genus; the author's rebuttals to reduced four/five category systems. Targeted 1428 revised vol.1 pp.148–152, **not full second collation**.
- `N-VI-02`, pp.114–117: defining substance and accident with the independent substrate condition, primary/common predication, substantial form outside genus, alternative proof for substantial genus. **Cross-text Bidāya VI.1–2**, plus later al-Zāriʿī vol.1 pp.153–155 editor note, specifically attached as `N1428-VI02-FORM-01` (not adopted). Compare Bidāya B-VI-01 and B-VI-02, which explicitly says a corporeal form is classed *incidentally* and qua differentia bi-sharṭ lā does not fall under the genus.
- `N-VI-09`, pp.139–141: continuous/discrete quantity, common boundary, numbers, line/surface/mathematical body, time. **1428 vol.1 p.186 n2 editorial critique** of author's treating the **middle segment** rather than its limit as a common boundary; the editor's `3+1+3` discrete-number counterexample is added as `N1428-VI09-BOUNDARY-01`, **not a variant nor an emendation**.
- `N-VI-10`, pp.141–144: number vs extension, no contrariety in quantity, more/less vs intensity, classical finite-dimensional/void/infinity arguments, six claims and counterargument. Targeted 1428 vol.1 pp.188–189 only.
- `N-VII-03`, pp.183–185: identity and diversity, primary/common predication and *ḥaml al-ḥaqīqa wa-l-raqīqa*, unity of attribute/attributive existence vs false identity of numerically distinct substances; local bilingual reading, no external witness.
- `N-VIII-14`, pp.244–246: prime/secondary matter, three arguments against reducing causes to matter, form as formal cause of *composite* vs co-cause of matter, higher form conserving earlier powers and unitive rather than additive composition; local bilingual reading, no external witness.

**Nine targeted digital 1428 checks** = 5 inherited + 4 in Stage VII. The 11 recorded `editorial-supplement.json` *criticalNotes* comprise inherited nine + two *editorial/analytical* source notes; **not eleven adopted emendations**. All eight historically adopted 1428 print-editor emendations remain separately attributed; do not treat as manuscript witness. The existing `N1417-IX09-REFERENCE-01` **«القسم الأول» → proposed «القسم الثاني»** issue remains **UNADOPTED**. Full independent original 1404 and later 1428 edition passage comparison needed to resolve that.

## Changed files and QA provenance

- `../muzaffar-al-mantiq/data/book.json`: **78** selected Arabic+working English; **25** Book IV, pp.148–159 added.
- `../muzaffar-al-mantiq/data/authorial-map.json`: 25 and 78; explicit nontranslated coverage.
- `../muzaffar-al-mantiq/contents.html`: current correct public display.
- `../nihayat-al-hikma/data/editorial-supplement.json`: **11** source-graded scholarly notes, two additional editor objections/dual-text comparisons with page citations, **without changing authorial Arabic/English**.
- `nihaya-english-collation-triage-2026-11-09.json`: **86** full local rereads and **9** targeted secondary printed-digital spot checks; source grade per row.
- `cross-book-review-register-2026-11-07.json`: **325** distinct reader IDs, annotations, source-hash provenance, 0 independent complete external collations/certified.
- `../tools/audit-hikma.mjs`: guard selected Muẓaffar count **78**, 25 Book IV IDs, 86 checked Nihāya, 9 graded print-digital spots, historical unadopted IX.9 crux, two new later-editor notes and zero false certification.

GitHub pipeline `.github/workflows/hikma-reader-qa.yml` should verify source/translation structure, syntax, iPhone/WebKit/Chromium browser behavior. After merge of **this Stage VII** work to `master`, separate PDF workflow `.github/workflows/hikma-a4-pdf-release.yml` regenerates **nine searchable A4 PDFs** and SHA256 catalog including the revised *Nihāya* supplement and 78 selected Muẓaffar units. **Do not claim PDF publication until the workflow succeeds and current `editions/manifest.json` has 78 and 136 and proper hashes.**

## Next actions

1. From `M-C-26`, translate Book IV **chapter 2** from original printed p160; then finish III other missing material, full V and VI. Count actual printed-page completeness separately, and transcribe figures and exercises.
2. For *Nihāya*, direct-review **50/136** remaining local units; then independently collate each of all 136 against 1404 early scanned and 1428 revised printed pages with exact variants/footnotes—not just statement-level spot checks.
3. Resolve old M-K-08, M-K-14, original modal exercises' chart, source polarity issue in M-C-17, IX.9 first/second-kind disputed base print.
4. Regenerate PDFs and inspect hashes, Arabic shaping, contents and actual selected text; retain all source witness grades and run CI before announcing completion.

**Status:** 325 bilingual working reading units, **86/136** same-base *Nihāya* local checks, 9 partial later-print spots, **0 complete independent** whole-unit second-witness collations and **0 specialist-certified units**. This scholarly edition remains unfinished.
