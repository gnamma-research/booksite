# Sanandajī — Stage 51 cumulative website import and fidelity report

**5 November 2026 · Current public working corpus: original Volume II, pp. 15–314.**

## What was imported

The current public site imports **300 original-page positions**, from the cumulative local Stage 45 data plus the later Stage 46–47 working passages, with Stage 48–50 source corrections given precedence. It is imported in eight numbered source-data modules rather than inflating page coverage through excerpts, scans or duplicated editorial notes. The existing source-selection cards and the independent Taftāzānī *Tahdhīb* text are retained.

The source document is a **632-physical-page, image-only** scan, SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`. Original printed Volume II page *p* corresponds to physical PDF page *p*+295. The complete two-volume numbered-page census is 280 pages in Volume I and 335 in Volume II (**615 original-page positions**); not all 615 have full translations.

The newly added page-at-a-time [cumulative reader](../cumulative.html) loads only the relevant original page, reducing memory and navigation overhead for mobile reading. An existing layered reading desk remains available at [the book's main page](../).

## Verified accounting

| Measure | Actual count | Qualification |
|---|---:|---|
| Original volume II positions imported | **300** | Printed II:15–314 |
| Attempted full-visible-span main-text English drafts | **100** | II:215–314; not independently proofread |
| Additional provisional upper English readings | **200** | II:15–214; many clauses still uncertain or omitted |
| Lower-page span drafts | **66** | II:215–280; not the same unit as individual notes |
| Individually joined lower-margin note records | **97** | II:281–314; joined across original leaves, writers generally UNASSIGNED |
| Additional selected lower excerpts | **10** | II:15–24; incomplete lower translations |
| Positively self-identified Wasīm prefatory stream | **4 original pages** | I:2–5, not counted as Sanandajī main text |
| Original pages independently critically certified | **0** | Neither sample testing nor presentation QA constitutes critical proof |

The working corpus contains approximately **55,185 words in the imported upper English fields** and **28,410 words in the included lower English fields**; this is a provisional working corpus, not unique certified translated words. Textual replacements are not to be added to earlier versions as though they were new translations.

## Source boundaries and corrections

Stage 38's source corrections to II:215–222 are retained, including the wording on II:216. Stage 48's source check of II:35–44 supersedes earlier topic guides: **II:41 concerns spherical form and objections using oval, lenticular, and polygonal shapes**. Stage 49's longer lower argument on II:34–38 distinguishes *kull* from *kullī*, and motion as *tawassuṭ* from *qaṭʿ*. Stage 50 adds the working main/marginal readings of II:49–52 and upper text on II:53–54 concerning mixture (*mizāj*).

Cross-page joins include II:34–38; II:48–49; II:49–50; II:50–51; II:52–54; II:54–55; II:114–115; II:214–215; and II:280–281. These are handled by the original page identifiers and editorial cautions, **not** falsely flattened into one author's continuous voice.

## Arabic text and authorship

- A short Arabic citation anchor is not a diplomatic Arabic transcription and must not be represented as one. Many original pages have no complete typed Arabic layer; the public repository does **not** redistribute the user's full page-image scan.
- The upper print combines quoted Taftāzānī lemmata with Sanandajī's commentary. Authorial segmentation remains incomplete.
- The lower print can contain distinct objections, ruled notes and glosses by several anonymous writers. These notes remain UNASSIGNED unless direct positive evidence establishes authorship. **Wasīm's preface I:2–5** is self-identified, but that does not license the attribution of the later lower pages to him.
- The old 601/615 English-guide-presence statistic is a location inventory, **not** source-word translation completion; the 300 imported page records are a distinct, source-defined measure.

## Quality checks and remaining philological work

The source hash, 300-page continuity, page-number mapping, import completeness, note deduplication, input schema and source flags were checked programmatically. The page-at-a-time reader was tested in Chromium at desktop (1440 px) and phone (390 px) sizes, including page jumps, search, Arabic/gloss controls, Wasīm's four-page preface, keyboard interaction, and layout overflow. This establishes technical presentation, not textual correctness.

**NOT completed:** Full 300-page Arabic-to-English line-by-line verification, complete lower-text transcription, full segmentation of II:215–280, multiple-witness critical readings, and author attribution of anonymous individual glosses. The list `115` selected source positions is additionally queued for closer checks based on simple textual heuristics; this is a triage queue, not evidence of error.

**Source and QA files:** `2026-11-05_STAGE51_COVERAGE.csv`, `2026-11-05_STAGE51_SOURCE_COVERAGE_QA.json`, and `2026-11-05_STAGE51_PRIORITY_REVIEW_QUEUE.json` in this editorial folder. All status flags retain independent critical certification = false.
