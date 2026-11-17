# Sanandajī · Taqrīb al-Marām · Volume I — Stage 96 continuation handoff

**17 November 2026. Latest authoritative working checkpoint.**

## Copytext and preservation

- Original Būlāq 1318 AH scan of 632 PDF leaves: SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`, inherited byte-for-byte.
- All **280** Volume I page images checked against `SOURCE_IMAGE_SHA256.json`, including I:18, 20 and 21. Physical PDF page (one-based) = printed page + 13.
- Stage95 and earlier working corpora, source images, source PDF, scripts, screenshots and previous editorial text retained unchanged in this recovery archive. No earlier transcribed source paragraph was overwritten.
- Current `Stage96_Cumulative_1401_Records.json`, `stage96-source-delta.js` (loaded after Stage95 before reader.js), and `Stage96_Bounded_AR_EN_Readings.md` give this revision.

## New image-checked bilingual readings, restricted to selected clauses

`I018.lower.02`, `I020.lower.01`, `I020.lower.02`, `I020.lower.03`, `I021.lower.01` — five previously Arabic-blank records; 1,401 stable IDs remain. All were entered as partial source passages, with omissions explicitly identified. Three-page set: printed I:18, I:20, I:21. I:19 already had Arabic-bearing records and was not repeated.

Source-critical corrections: I:20 lower.03 previously described the teacher's authority, which belongs to I:21. I:20 discusses different respects of a syllogism's subject and the question of conceiving divine realities. The old overview/title survive intact in `stage96_prior_working_overview` / `stage96_prior_working_title`; source-authored text shown in the reader is corrected. Distinguish unquantified (*muhmalah*) from universal propositions.

## Source-presence accounting — not completeness

- **1,401** source-linked record IDs, none deleted or duplicated.
- **1264** with some typed Arabic; **136** still genuinely without typed Arabic (**117** lower; **19** upper).
- **0/279** printed body pages passed full all-register Arabic–English collation and independent second proof. No manuscript collation has been performed or is required to call this a Būlāq single-copy working edition.
- New readings are source-image-checked first passes, not complete records or whole-page translations.

## Exact next point

**`I021.lower.02`** — printed Volume I **I:21**, original combined physical PDF **page 34**, **lower commentary**. Then `I022.lower.02` (I:22 / physical page 35), and `I025.lower.02` (I:25 / physical page 38), with already-typed but incomplete adjacent material still awaiting clause-exhaustive proof. Consult `Stage96_Remaining_Arabic_Queue.csv` for the complete ordered queue.

## Resume instructions

Inspect the source image, the preceding/next page, and the actual lower versus upper register. Transcribe every securely readable clause and translate it literally; preserve skipped phrases with ellipses. Never use an old interpretive overview as a quotation of source Arabic; keep old English in the `stageNN_prior_working_overview`. Preserve all prior IDs and overlay order. Keep commentary voice **unassigned** unless directly established. Run `node stage96-corpus-ci.cjs`, compare source scan/hash, review unresolved readings, then independently proof before certifying any full-page milestone. Keep the reader study-first without editorial stage counters or apparatus inside continuous/focus reading. Keep *Tahdhīb al-Kalām* independent; `tahdhib-parallels.js` remains an inactive scholarly concordance.

## Website and archive

The GitHub booksite reader loads overlays `stage85` through `stage96` in order, then `reader.js`, at `texts/al-sanandaji/taqrib-al-maram/`. `editorial/CURRENT_PROJECT_STATUS.md` gives administrative progress outside the reading flow. `Stage96_Browser_QA.json` records actual browser verification, including any environmental blocker. Archive PDF, page images and earlier revisions; never overwrite or discard them.