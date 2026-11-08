# Farghānī · Muntahā al-madārik — cumulative handoff archive

This is the **stable archive index** for the GNAMMA Farghānī source-critical translation project.

## Current canonical stage

**Stage P84 — 8 November 2026:**

- [Full cumulative handoff (complete text and apparatus in one Markdown file)](FULL_CUMULATIVE_P84.md)
- [67-page cumulative working English master](WORKING_TRANSLATION_18_84.md)
- [Machine-readable page/provenance manifest](STAGE_MANIFEST_P84.json)
- [Stage verification and exact continuation instructions](STAGE_HANDOFF_P84.md)
- [Source/witness register](WITNESS_REGISTER.json)
- [Critical introduction](CRITICAL_INTRODUCTION.md)
- [Comparative glossary and study](COMPARISON.md)

**Added in this stage:** 50 modern Beirut (B2007) printed pages, pp.35–84 inclusive, as English *working translation*. **Cumulative:** 67 consecutively numbered source pages, pp.18–84. The bilingual selected-excerpt layer is 32 units from pp.18–34 and is not a full parallel Arabic edition.

**Next untranslated locus:** B2007 p.85, opening `وعالم الغيب والمعاني، ولكن من حيث تفصيل تلك البرزخية لا من حيث إجمالها`, continuing the third aspect of the Footstool. [Primary Arabic p.85](https://ablibrary.net/book_content/b/9606/85?lang=ar). Do not restart or retranslate pp.18–84 except when recording actual corrections.

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
