# Farghānī — Stage XVII reader-cleanup and cumulative recovery handoff
**11 November 2026 | GNAMMA master | next stage: source-image verification**.

## Exact inherited edition and grades
- Work: Saʿīd al-Dīn al-Farghānī's *Muntahā al-madārik*, authorial four-foundation introduction, B2007 pp18–143, plus separate *tatimmat al-dībāja* pp144–145. This is not the subsequent verse commentary.
- English working draft: **128/128 consecutive source-page labels**, full only **in working-English page scope**; independently line-proofread complete printed pages **0**.
- Selected bilingual clause review: **559**, comprising **283** against digitized modern edited Beirut Arabic and **276** against a derivative modern forum retranscription; **not** a continuous source-checked Arabic text.
- Actual photographed original 1876 Istanbul PRINT: **15 bounded selected comparisons**, across 14 original printed-page labels; 7 differences with online edited/derivative text, 8 bounded agreements. These are comparisons with a **historical print**, not medieval manuscript readings.
- Independently collated medieval manuscript folios: **0**; authenticated manuscript variants: **0**. The *Tāʾiyya* poem commentary remains a separate untranslated scope.
- Inherited critical findings, not new in XVII: B2007 digital p52 `سم الحكيم` against I1876 printed p32 `اسم الحكم`, edited English provisional “the Judge”; digital p48 `بسبحاب` against older photographed `بسبحات`; p38 `القابل` agrees across photographed print and online modern text.

## New work actually performed in Stage XVII
1. Inspected the full GNAMMA `continuous-translation.html` and its 128 page sections, reader switches, old links and recent Stage XVI publication state.
2. Removed **128 source-link paragraphs** and **67 editorial, critical, and page-boundary paragraphs** from the continuous translation article. Preserved each item in a collapsed, separate **Scholarly apparatus** (128 page-linked entries).
3. Repaired malformed inline HTML at p34 and moved that paragraph's textual-uncertainty gloss into the apparatus, yielding **68 editorial note entries** in total. The provisional Arabic reading *al-ʿamaliyya* has **not** been adjudicated.
4. Preserved every printed-page anchor `#b2007-p18` … `#b2007-p145`. Default is uninterrupted reading with page headings visually unobtrusive; the reader has a **Show printed-page headings** control; the outline remains accessible.
5. Moved the translation-status text on the continuous page into an optional `<details>`; shortened the landing page and collapsed its source-grading explanation. Optional notes now default **off** in the excerpt reader and critical clause review, preserving user-initiated visibility for saved excerpt-reader preferences.
6. Fixed stale landing-page links and the old “ten” photo-comparison sentence; the current invariant remains **15**, not ten.
7. Archived all eleven existing bilingual JS data modules in `editorial/ALL_CRITICAL_DATASETS_017.md` without altering them.
8. Created `editorial/FULL_CUMULATIVE_READER_017.md` (~2.4 MB) containing the entire existing 128-page English draft, all 559 selected bilingual records, source grades, historical photographic-print apparatus, all critical JS modules, current reader source and source-code SHA pins. It does **not** embed scanned JPEGs or every separate scholarly PDF and is therefore a complete **text and reader-source recovery bundle**, not a fully offline facsimile package.

## Structural checks performed
- 128 original page sections; 128 revised sections and 128 unique targets; no pages removed.
- 128 source hyperlinks present in the new apparatus; 67 original inline notes and one revised p34 textual issue there.
- English source translation not regenerated; the only authored prose intervention is a format-preserving repair to the malformed p34 sentence and relocation of its source caution.
- Existing 559 bilingual records, their source provenance, critical data modules, and print-collation numeric totals have **not** been recomputed or inflated.
- GitHub commits recorded for page, index, JS note defaults and full cumulative archive. GitHub Pages **live deployment not assumed** from repository commit; verify deployment run and rendered live endpoint separately.

## Recoverable assets
- Full text and reader snapshot: [FULL_CUMULATIVE_READER_017.md](FULL_CUMULATIVE_READER_017.md)
- All eleven preserved source-graded JS datasets: [ALL_CRITICAL_DATASETS_017.md](ALL_CRITICAL_DATASETS_017.md)
- Working English source: [WORKING_TRANSLATION_18_145.md](WORKING_TRANSLATION_18_145.md)
- Selected bilingual critical reader corpus: [CUMULATIVE_SELECTED_BILINGUAL_016.md](CUMULATIVE_SELECTED_BILINGUAL_016.md)
- Historical printed evidence: [I1876_COLLATION_CUMULATIVE_006.json](I1876_COLLATION_CUMULATIVE_006.json)
- Last substantive source research stage: [STAGE_HANDOFF_CRITICAL_016.md](STAGE_HANDOFF_CRITICAL_016.md)
- Continuous page: [../continuous-translation.html](../continuous-translation.html)
- Critical bilingual view: [../critical-edition.html](../critical-edition.html)

## Remaining tasks in strict order
1. **Acquire and visually inspect the actual physical Beirut 2007 page 52** and test `اسم الحكم` vs `سم الحكيم`. Online Beirut digital transcription is **not** the same as physical paper proof. Also inspect paper p38 and p48 and pp61–65 for derivative-source replacement.
2. A candidate of a 2007 scanned PDF is linked at `https://archive.org/download/lis_q115/lisanarb.com_q1508.pdf`; during this stage, downloading/opening failed. Do **not** count it as seen, collated, or authoritative until visually inspected.
3. Inspect independent handwritten witness images and metadata: Carullah 1107, Koca Ragıp Paşa 670, Kadızademehmed 273, then F3966 and Yeni Camii 706 when verifiable. Never register older print differences as manuscript variants.
4. Establish a printed-page/line and manuscript-folio concordance, produce continuous Arabic lemmas, and verify 128 working English pages line by line. Later verse commentary stays separate.
5. Keep the independent ongoing Persian `Mashāriq al-darārī` and `Manāhij` workstreams distinct; do not merge their page counts with the B2007 128-page introduction.

## Integrity: source SHA pins
| File | UTF-8 bytes | Git blob SHA |
|---|---:|---|
| `editorial/FULL_CUMULATIVE_READER_017.md` | 0 | `68863d6174ed78e9df360c559467074a6cd82b01` |
| `editorial/ALL_CRITICAL_DATASETS_017.md` | 632505 | `f58ccc256e1af619bf369f881819c4ec676d8480` |
| `editorial/WORKING_TRANSLATION_18_145.md` | 414212 | `b7d4acfda1681ad5e2d45f9db0e20730e0e27501` |
| `editorial/CUMULATIVE_SELECTED_BILINGUAL_016.md` | 601401 | `9edc9f4dbd054d0ceaf1b2ff7796caa1e46a12e5` |
| `editorial/I1876_COLLATION_CUMULATIVE_006.json` | 28517 | `b6bf3af187222867d3a8eddb55ab25a1c65f30a8` |
| `editorial/SOURCE_PROVENANCE_CRITICAL_016.json` | 2633 | `f21c4ec3d38bc76c870f65f8cbfb0e75677b6d36` |
| `continuous-translation.html` | 466170 | `991288fced87acce8be1a81b2d6ed92de8538f23` |
| `index.html` | 11841 | `1aacab76da4c22221e329b5dcd2c9ecd0efeaf36` |
| `critical-edition.html` | 16504 | `a8b2ae628f25ca5ec6ab12af775332e37a962c5f` |
| `critical-reader.js` | 5879 | `3366bfb1422b599265510a1268c08779e1abf65a` |
| `reader.js` | 13842 | `d1baa589a72fdb02f09bab288d06f0ba2ea6a6c0` |

**Exact restart:** start with an actual 2007 printed p52 photo, not another lower-grade derivative extract. Before a new stage, read this file, the Stage XVI critical handoff, the `FULL_CUMULATIVE_READER_017.md` snapshot, and the repository `docs/TRANSLATION_CONTINUITY_PROTOCOL.md`.