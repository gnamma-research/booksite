# Sanandajī Stage 79 — exact progress receipt and handoff

**Checkpoint:** 13 November 2026. **Witness:** original Būlāq printed two-volume scan `taqribmaram(2).pdf`, SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`.

## What actually changed

- **I:73 (entirely marginal commentary):** the five original units have been replaced with a connected visual-source Arabic transcription **attempt** spanning the whole printed leaf and a fuller, correspondingly segmented English translation. Ambiguous words and syntactic joins remain flagged. This does not pass the strict gap-free, independently proofed page gate. It is not the principal sharḥ and its individual author is **unassigned**.
- **I:88 lower unit 01:** corrected **`لأن عدمه ضروري`**, “because its nonexistence is necessary,” where the earlier text incorrectly said **`لا أن عدمه ضروري`**, “not that its nonexistence is necessary.” This negation error reverses the logical example. Only this passage is source-corrected; the rest of the leaf retains its previous working status.
- **Exactly six** stable IDs changed; the remaining **1,394** records are unchanged. All earlier records and the original witness are preserved; the delta JSON records exact prior and revised versions.
- Total original working records remain **1,400**, not 1,406. Typed Arabic reading records increase from **1,055 to 1,060**, while selected-anchor-only entries decrease **345 to 340**. These are records already in the dataset, not all printed sentences.
- **No new body page is independently certified complete.** The source proof ledger continues to mark 0/279 for full gap-free/independent translation proof and 0/279 for manuscript collation.
- Original PDF images I:73 and I:88 were extracted to a separate facsimile and **pixel-compared** with the source. Rendering/integrity confirms image identity, not textual correctness.

## Reader and QA

`Sanandaji_VolI_Updated_Working_Reader.html` preserves all 280 indexed original pages, their source image paths and the existing UI. Local Chromium checks at 390px mobile and 1400px desktop confirmed page-73 and page-88 selection, six changed records, image rendering when supplied with exact local image bytes, no script exceptions and no horizontal overflow. Actual `file://`/localhost navigation was blocked by the test host, so end-to-end deployed URL behaviour is **not** claimed. `images/I001.png` to `I280.png` must remain beside the HTML in the extracted ZIP.

## Existing work and true remaining backlog

The 279 printed body pages have preliminary English, but numerous passages across the entire volume are still paraphrased, untranscribed or unproofed. In particular 77 earlier printed positions I:2–78 had only short Arabic anchors before this stage; I:73 now has a continuous **provisional** Arabic attempt but still remains uncertain. No progress percentage computed from page cards or record counts is a faithful percentage of actual Arabic words translated.

Continue literal source-based translation of the remaining ḥāshiya and separate ruled notes, plus page-by-page Arabic/English proof, independently attributed source layers, resolution of uncertain words, and collation with real independent witnesses when available. Do not publish the working edition as *definitive*. Volume II work follows the agreed Volume I completion gate.

## Next textual targets

1. **I:88 lower continuation I:87–89:** independently verify the two senses of general possibility and the wording of `I088.lower.02–05`, including the first contested connective and exact logical inference. 
2. **I:73:** recheck the marked terms (especially the predicate of the composite and `للمقولية`), with I:72 and I:74 adjacent pages open; record a second visual proof, not just image integrity.
3. **I:2–78** remains the highest-volume Arabic transcription backlog; prioritize marginal-only I:112 and I:222 for full review among pages I:79–280.

## Files

- `I073_complete_visible_source_firstpass.md`: new continuous Arabic–English draft of I:73, with uncertainties.
- `I088_verified_negation_correction.md`: focused proof of the causal reading on I:88.
- `stage79_exact_six_record_delta.json`: exact old and new records for audit.
- `source_aligned_working_records_stage79.json`: entire updated 1,400-unit dataset.
- `Sanandaji_VolI_Updated_Working_Reader.html` plus images: entire offline reader.
- `strict_page_proof_ledger_stage79.csv`: updated typed-record count, with strict full-page certifications unchanged.
- `I073_I088_Original_Arabic_Facsimiles.pdf`: unchanged original source pages for both corrected loci.
- `QA_390_I088.png`, `QA_1400_I088.png`: local browser screenshots of the review page.