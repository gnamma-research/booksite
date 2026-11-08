# Farghānī · Muntahā al-madārik — cumulative handoff archive

This is the **stable archive index** for the GNAMMA Farghānī source-critical translation project.

## Latest canonical stage — P145 and critical checking pass 001 (9 November 2026)

- [**Complete current cumulative handoff, P145**](FULL_CUMULATIVE_P145.md): the 128-page English introductory draft; 80 source-checked Arabic–English clauses (B2007 pp18–23); critical audit, historical apparatus, comparison, glossary, witness and correction registers; prior handoffs and exact continuation
- [Entire authorial introduction + concluding preface — English working draft](WORKING_TRANSLATION_18_145.md), B2007 pp18–145; four foundations end at p143, *tatimmat al-dībāja* follows on pp144–145
- [New Arabic–English clause-based critical review](CRITICAL_TRANSLATION_18_23.md), 80 source-checked clauses with revised translations and five open cruxes
- [Critical pass analytical report](CRITICAL_AUDIT_STAGE_001.md) and [128-page source-quality coverage register](CRITICAL_COVERAGE_REGISTER.json)
- [P145 stage manifest with source file hashes](STAGE_MANIFEST_P145.json), [full handoff](STAGE_HANDOFF_P145.md), [browser clause reader](../critical-edition.html)
- [Current GNAMMA book page](../) and [public archive](../handoffs.html)

**Exact next authorial checking locus:** Beirut B2007 **p.24** (continuing from the last reviewed words of p23, `وصفة بقائها وثباتها اعتبارا لبعض`). The introductory translation is already drafted through p145; the verse commentary is separate. Every stage must preserve older source text and source-supported corrections, update the full cumulative archive and the GNAMMA site, and distinguish the critical-check grade from the merely translated-draft grade.

**True editorial standing:** English draft **complete in authorial introductory scope**; critical Arabic checking **6 of 128 Beirut pages** (80 clauses) against a single modern digitized edited text; historical print/manuscript collation **0**, manuscript variants **0**, and **no definitive constituted Arabic**. The 1876 printed introduction's 107-page extent is a distinct pagination, not the denominator of a completed percentage.


## Historical canonical stage — P134 (9 November 2026; retained)

- [**Full cumulative handoff — P134, including complete working-stage source and apparatus**](FULL_CUMULATIVE_P134.md)
- [117-page consecutive English working draft](WORKING_TRANSLATION_18_134.md) — modern Beirut B2007 pp.18–134
- [P134 machine-readable manifest](STAGE_MANIFEST_P134.json)
- [P134 source-critical handoff and exact restart](STAGE_HANDOFF_P134.md)
- [GNAMMA public handoff archive page](../handoffs.html)

**New this stage:** B2007 pp.85–134 inclusive (50 pages); **cumulative:** pp.18–134 (117 page-labelled sections), working English draft with original Arabic links, **not** manuscript-verified or a complete Arabic–English critical text. The bilingual excerpt reader still displays only the 32 previously source-linked selections from pp.18–34. The author's fourth foundation continues beyond p.134.

**Next untranslated original:** **B2007 p.135** at `والتقيّد وآثارهما والجامع لكلّيات تلك الخواص والآثار الحبّية ...`, source https://alshrefalm7sy.ahlamontada.com/t3214.


## Historical stage — P84 (preserved)

**Stage P84 — 8 November 2026 (historical):**

- [Full cumulative handoff (complete text and apparatus in one Markdown file)](FULL_CUMULATIVE_P84.md)
- [67-page cumulative working English master](WORKING_TRANSLATION_18_84.md)
- [Machine-readable page/provenance manifest](STAGE_MANIFEST_P84.json)
- [Stage verification and exact continuation instructions](STAGE_HANDOFF_P84.md)
- [Source/witness register](WITNESS_REGISTER.json)
- [Critical introduction](CRITICAL_INTRODUCTION.md)
- [Comparative glossary and study](COMPARISON.md)

**Added in this stage:** 50 modern Beirut (B2007) printed pages, pp.35–84 inclusive, as English *working translation*. **Cumulative:** 67 consecutively numbered source pages, pp.18–84. The bilingual selected-excerpt layer is 32 units from pp.18–34 and is not a full parallel Arabic edition.

**Historical next untranslated locus:** B2007 p.85, opening `وعالم الغيب والمعاني، ولكن من حيث تفصيل تلك البرزخية لا من حيث إجمالها`, continuing the third aspect of the Footstool. [Primary Arabic p.85](https://ablibrary.net/book_content/b/9606/85?lang=ar). Do not restart or retranslate pp.18–84 except when recording actual corrections.

## Earlier stage (retained)

**Stage P34 — 8 November 2026:** [Historical handoff](STAGE_HANDOFF.md) · [Historical source/provenance manifest](STAGE_MANIFEST.json) · [Cumulative 17-page draft](WORKING_TRANSLATION_18_34.md).

The original P34 material remains preserved; the P84 *full cumulative* archive includes its translation unchanged. Older handoff summaries remain older snapshots and are not overwritten with subsequent stage claims.

## Mandatory stage-close and site-publishing rules

At **every subsequent substantive translation stage**, without waiting for a separate reminder:

1. Read [GNAMMA's translation continuity protocol](../../../../docs/TRANSLATION_CONTINUITY_PROTOCOL.md), the **latest** stage manifest, and the **latest full cumulative handoff** before drafting. First recover and check existing work.
2. Continue from the exact next un-translated original passage. Preserve all earlier authorial Arabic and English, editorial notes, apparatus, correction history, comparison notes, source URLs, reader code, and older stage archives. Never silently substitute a summary.
3. Commit a **complete cumulative master** and a uniquely named **self-contained full handoff** such as `FULL_CUMULATIVE_PXXX.md`, containing the entire recoverable cumulative translation corpus and its available apparatus. Include original Arabic only where actually transcribed; leave untranscribed text explicitly marked missing. Preserve older files.
4. Commit a **machine-readable stage manifest** `STAGE_MANIFEST_PXXX.json` containing source witness, page/paragraph bounds, correct new vs cumulative counts, per-file SHA and size, zero-gap page audit, quality grade, true unresolved gaps, and exact next-source sentence. Do not invent denominators or report page count as verified source fidelity.
5. Update `STATUS.md`, `HANDOFFS.md`, the GNAMMA **Muntahā** landing page (`index.html`), the primary English reader (`continuous-translation.html`), `texts/index.html`, and `texts/manifest.json` to show the same verified scope and expose the **new handoff directly**. Update issue [#245](https://github.com/gnamma-research/booksite/issues/245) with the stage checkpoint.
6. Verify that every listed GitHub file exists, original previous-stage file SHAs remain unchanged where not explicitly revised, and each new source page has exactly one header and a usable source link. Separately check GitHub Pages deployment and state whether it succeeded; a successful commit alone does not prove live publication.
7. When files or sources are unavailable, label the handoff **NOT FULLY SOURCE-CUMULATIVE**, retain a precise gap register, and explicitly mark manuscript uncollated or English unverified. Do not claim completion of a critical edition from the existence of a handoff archive.

## Edition-status distinction

The term **full cumulative handoff** means *full preservation of the material currently in the GNAMMA research stage*, not that the **entire Farghānī introduction** has been translated or that its Arabic has been critically constituted. At P84, the source has not been collated with the 1876 printing or manuscript witnesses; there are **zero verified manuscript variants**. Avoid reporting progress as 67/107: those numbers refer to **different printed editions**.

## Direct web entry

The reader's [Handoff and archive page](../handoffs.html) points to this index and to the current full archive.
