# Tahdhīb Stage119 — Q309 complete working example coverage with two source disagreements

**12 November 2026 · Working scholarly edition. This handoff documents new source-facing translation and corrections, not a complete critical edition.**

**Source register clarification:** Four recovered source tables (Q258, Q294, Q300 and Q309) remain distinct from the historical continuous reading text. Stage119 addresses Q309 worked examples and selected Q294 relation marks, without claiming the other tables are fully transcribed.

## Inherited cumulative corpus and no-retranslation rule

- T = al-Taftāzānī's original `Tahdhīb al-Manṭiq` matn, Y = al-Yazdī principal commentary, H = later mixed-author ḥawāshī, and modern text references = a separate voice. Preserve these.
- **Stage114 historical H corpus unchanged:** 1,090 source-numbered positions across 14 separate local note sequences, 1,029 first-pass English renderings, 4 table-affected notes and 57 modern reference-only entries. Historical prose ends at H-SCIENCES-086, Q395. There is **no new forward section** to translate after Q395.
- The full prior [Stage117 cumulative Markdown](batches/hawashi-all-sections-cumulative-stage117.md) and [Stage118 source-cell register](STAGE118_SOURCE_CELL_RESEARCH.md) remain unchanged. [Immutable Stage118 handoff](HANDOFF_STAGE118.md) retains the earlier stage's exact limits. All Stage114–Stage117 handoffs survive as historical snapshots.
- Existing Stage118 Q258: 49 original definitional positions, **24 selected photographed phrase glosses**, **zero fully certified cell-by-cell English translations**. Existing Stage118 Q294: 105 positions, **61 provisional inclusion, 33 overlap, 11 disjointness broad families**, while exact direction and modal qualifiers are still an **open textual task**. Stage119 has **not** promoted any of those statuses.

## Additional Stage119 Q294 original-code verification

[Nineteen exact photographed relation glyph readings](STAGE119_Q294_NINETEEN_DIRECT_GLYPHS.md) now identify **14** source marks `من` (overlap) and **5** source marks `ين` (disjointness) with exact historical row/column coordinates, beyond the inherited broad family census. [Machine-readable exact-symbol index](STAGE119_Q294_NINETEEN_DIRECT_GLYPHS.json) preserves photographic provenance and individual grades. **86** Q294 source symbols remain without individual exact transcription (including all 61 inclusion-family symbols with possible `فم/حم` directions and `ط/ف` qualifiers). No modal entailment is thereby proved.

## New substantive Stage119 Q309 output

[Complete fifteen-position bilingual comparative record](STAGE119_Q309_COMPARATIVE_WORKING_READINGS.md) · [machine-readable per-cell readings and source grades](STAGE119_Q309_COMPARATIVE_WORKING_READINGS.json) · [separate user-facing reader](STAGE119_Q309_PARALLEL_READER.html).

The photographed Q309 table comprises 15 classified types: **9 connected** and **6 disjunctive**. Three source rows themselves give the instruction `ذكر ما لا يخفى`; the other **12/12 now have working Arabic plus English renderings** in the comparative register. This means *draft coverage of the original worked-example positions*, **not** twelve independently certified diplomatic translations. **Four** readings (K08, D02, D04, D05) still carry significant phrase-boundary or lexical uncertainties; **two** (K02, D06) have witness-level wording disagreements. These were not quietly invented or flattened to one reading.

Two material source disagreements:
1. At K02 (connected C/D), H printed `متصفًا بالنطق` versus derivative Shamela `مستلزمًا للنطق`. Keep both strings and verify the exact original letterforms before normalising.
2. At D06 (disjunctive D/D), H1405/H1433 photographed printings appear to have `زوجًا أو كسرًا` in the second alternative; the Shamela digitisation has `لا زوجًا ولا فردًا`. The previous Stage118 rendering *'neither even nor odd'* must not be attributed unqualified to the two photographed prints. The variant is recorded openly, not treated as an authorial emendation.

Additional earlier example omissions corrected at the working level include the historical `دائمًا` quantifier in D03 and K07. Preserving source form matters because the table illustrates **nested types of propositions**, not formal validity of each example's entailment.

## Source and authenticity limits

- Primary print H1405 Q309: <https://archive.org/download/lis_fa12/lis_fa1208.pdf>, zero-based PDF index 310; SHA256 `696c7b2e2884414f34d90203326f7b07f72e207849080e5069aadd0f12bb5759`.
- Comparison print H1433 Q309: <https://archive.org/download/lis_fa12/lis_fa1209.pdf>, zero-based index 309; SHA256 `c119de2073dee4610e99a35cd01bd075841cc0e4dfaef7a9473b950dd250c70d`.
- Derivative digital comparator: <https://shamela.org/gen/042fb96f81e9c1897008a735c3383ee5_gen.pdf>, table in the §5.3.5 neighbourhood (extracted lines 4250–4283). **Not** a new manuscript witness, and cannot silently supersede H1405/H1433.
- [Bounded original photographic source excerpt](source-table-excerpts/print1405_Q309_table_excerpt.png) and [SHA256 provenance](source-table-excerpts/PRINT_IMAGE_MANIFEST_STAGE116.json) remain unchanged.
- **New whole H pages Arabic–English source-certified: zero; new authorial manuscript variants: zero; new independent historical full-modality proofs for the separate 46 figure-IV syllogisms: zero.** A Q309 source-table comparison is not such a proof.

## Full publication and exact future work

Stage119 creates [full cumulative Stage119 historical H text and apparatus](batches/hawashi-all-sections-cumulative-stage119.md) from Stage117 full original bytes plus the preserved Stage118 and new Stage119 source dossiers; [checksum manifest](STAGE119_CUMULATIVE_FILE_INTEGRITY.json) is generated by the release builder. This does **not** overwrite source wording or relabel existing 1,090 records. If the generator or package isn't yet present/verified, describe this path as pending rather than claiming complete release.

**Next tasks:** final check K02 and D06 witness readings letter-by-letter; complete the four provisional Q309 cases; transcribe *all* 49 Q258 multi-line Arabic definitions with full literal English; complete the **86** Q294 source symbols not individually transcribed (and verify the existing 19 against a second print), including `فم/حم` directional and `ط/ف` conditions; conduct complete H/Y Arabic clause alignment; collate independent genuine manuscripts; solve the separate 46 historical-strength modal consequence problems with proofs or countermodels.

The photograph and digital text have been checked for finite locators, but neither a citation nor a checksum establishes the accuracy of a full critical edition. **Never restart an old translation gap pointer such as Concepts36.**
