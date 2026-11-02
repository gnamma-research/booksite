# Tahdhīb al-Manṭiq wa-l-Kalām / Taqrīb al-Marām
## Stage 36 — full cumulative handoff, 31 October 2026

**Primary instruction, still active:** finish complete, uncondensed, critically checked Arabic–English editions of BOTH parts of al-Taftāzānī's Tahdhīb, using the printed ORIGINAL as base and the commentaries for interpretation. Only AFTER the entire matn is translated and proofed, translate al-Sanandajī's complete Taqrīb al-Marām in consecutive 100-printed-page increments. Maintain exact passage alignment and cumulative handoffs. Scholarly explanatory footnotes appear in the public reader; source uncertainties and production logs appear in separate editorial files.

### 1. Authoritative base and other witnesses

1. Al-Taftāzānī, *Matn al-Tahdhīb al-Manṭiq wa-l-Kalām*, Cairo, Maṭbaʿat al-Saʿāda, 1330 AH / 1912. **128 scanned PDF pages.** Logic: original printed pp. 3–14 (12 pages). Kalām: printed pp. 15–127 (113 pages). Source URL: https://archive.org/download/vahasah/At-taftazaniSadAd-din1912.pdf . This complete scan was USER-SUPPLIED earlier in this same conversation as \`At-taftazaniSadAd-din1912_text.pdf\`; do not request it again.
2. al-Sanandajī, *Taqrīb al-Marām fī Sharḥ Tahdhīb al-Kalām*, user-supplied \`taqribmaram(1).pdf\`, **632 PDF pages**, principally a running authorial sharḥ with small-type lower-register glosses and later marginal additions. Printed volume I, p. N aligns with PDF p. N+13 at least in the examined ranges, e.g. I:73 = PDF p. 86. Must always check page label against scan.
3. Logic commentaries: \`stmanteq.pdf\` (479 pages), *Juhd al-Muqill* (100 pages), al-Yazdī and al-Lakhnawī commentary traditions. These inform technical translation; do not silently substitute their additions for the concise Tahdhīb matn.
4. A 995-AH al-Azhar manuscript has been bibliographically identified. Its leaves have NOT been independently collated line by line, so the edition cannot yet be termed definitive manuscript-critically.

### 2. Complete cumulative texts preserved in GitHub — OPEN THESE FIRST

Repository: https://github.com/gnamma-research/booksite (default branch: master).

- **Entire logic, 19 consecutive Arabic–English divisions with explanatory notes:** [\`texts/al-taftazani/tahdhib-al-mantiq/2026-10-31_parallel_reading.md\`](../../tahdhib-al-mantiq/2026-10-31_parallel_reading.md).
- **Entire kalām in Cairo printed-page order, 113-page English first-pass reader:** [\`texts/al-taftazani/tahdhib-al-kalam/complete/2026-10-31_cumulative_113_page_reader.md\`](../complete/2026-10-31_cumulative_113_page_reader.md). This includes selected new uncondensed corrections, BUT its other pages still contain interpretive condensation; 113-page coverage is NOT 113-page literal verification.
- **All 83 existing bilingual kalām thematic editorial units:** [\`texts/al-taftazani/tahdhib-al-kalam/editorial/2026-10-31_cumulative_83_units.md\`](2026-10-31_cumulative_83_units.md). This preserves the Arabic lemma/transcription alongside English and individual explanatory notes; the thematic text cannot replace uninterrupted Cairo copy-text.
- **Taqrīb continuous 50-printed-page English WORKING draft I:13–62, recovered from Stage 31 PDF:** [\`texts/al-sanandaji/taqrib-al-maram/editorial/2026-10-31_recovered_I13-I62_english_working.md\`](../../../al-sanandaji/taqrib-al-maram/editorial/2026-10-31_recovered_I13-I62_english_working.md). Original PDF scan pp. 26–75. Paragraphs sometimes condense source; this is NOT a word-for-word completed commentary.
- **Taqrīb selected Arabic–English linked commentary loci through I:80, cumulative:** [\`texts/al-sanandaji/taqrib-al-maram/2026-10-31_parallel_selected_commentary.md\`](../../../al-sanandaji/taqrib-al-maram/2026-10-31_parallel_selected_commentary.md). Includes initial S.00 etc and S.063–S.080. These are selected excerpts NOT full authorial pages.
- **Full 125-source-page copy-text coverage matrix:** [\`2026-10-31_cumulative_125_page_source_audit.csv\`](2026-10-31_cumulative_125_page_source_audit.csv).
- **The designated next 100-page commentary range, source-only register, NOT translated:** [\`I:81–180\`](../../../al-sanandaji/taqrib-al-maram/editorial/2026-10-31_next_100_page_translation_ledger_I81-I180.csv).

Main readers:
- https://gnamma-research.github.io/booksite/texts/al-taftazani/tahdhib-al-mantiq/
- https://gnamma-research.github.io/booksite/texts/al-taftazani/tahdhib-al-kalam/
- https://gnamma-research.github.io/booksite/texts/al-taftazani/tahdhib-al-kalam/complete/
- https://gnamma-research.github.io/booksite/texts/al-sanandaji/taqrib-al-maram/

### 3. New source-critical changes in Stage 36 (actual progress, not projections)

**Logic:**
- Discovered that Gnamma logic unit L.11 had a truly **TRUNCATED ENGLISH TRANSLATION ending in the middle of a sentence**. Reconstructed the full original Cairo pp. 8–9 modal classification: eight simple modes, the restricted/specific modes, existential nonnecessary/nonpermanent and special possibility. Complete English now 327 words, with explained formal negations. Commit \`bf5d992df7d2755215cef21a83f86113993cfad6\`.
- Removed the expanded “governing rule for all four figures” sentence from the primary L.16 English: the Cairo source ends after the reductions of the fourth figure, and the extra rule belongs to a longer recension/commentary, not silently to this base.
- Re-ordered and normalized Cairo-based Arabic in L.10, L.12, L.15, L.17 and L.18: categorical and quantified propositions, conditional/disjunctive propositions, contraposition, conditional syllogisms, and syllogistic arts; commit \`d653eeec04c22a8b8e0f042af0d6a241ca360524\`.
- Created consolidated 19-unit parallel logic reading in one reusable document; commit \`63a40f543c6c891802a852f2b4d38681e9587acb\`.
- Preserve Cairo p. 13 \`والنظريات\` and alternative \`والفطريات\` from the al-Yazdī commentary tradition in the apparatus, not as silent substitution. Independent manuscript adjudication is still pending.

**Kalām:**
- Re-checked original Cairo images p. 26 onward and corrected the logical division between essential possibility, preponderance through an efficient determinant, and necessity accompanying a caused effect (p. 26, commit \`568ed7e2435b3bd867b5b066d0af231bb3f8c9ff\`).
- Rebuilt source-facing discussions: pre-eternity and temporal origination (p. 27), six kinds of priority and eight respects of unity (p. 28), and the extended senses of form, matter, end and customary causation, together with Chapter III opening (p. 35). Updated corresponding bilingual units II.20, II.21, II.22, II.26 (commit \`44c3433320c6b72f52a47714b9e05279bf159349\`) and full-page reader (commit \`65a013d2fd62aa68aee08921bc4ebc30ee810b60\`).
- Corrected the source continuation of the extended individuation sentence across Cairo pp. 22–23 and preserved the exact, complete informative-predication sentence from p. 20. Closed only these two inherited \`gap=true\` flags (II.08 and II.13), commit \`a7e86a8591261f6c36d01fb9745a1dc804fa7465\`.
- The number of remaining \`gap=true\` units is **38 out of 83**, but absence of an explicit gap flag is NOT independent certification of full literal completeness.
- Created the single-source complete 113-page English cumulative reader (commit \`6531eaad050e522c9238e83194b6fbe59d0cc68a\`), the 83-unit bilingual preserved edition (commit \`4ddb9841ad5782a02a2bf98319edf69ec49ece5b\`), and 125-page source status CSV (commit \`960b516c5993bf5b2560caa5852e16fc83e87b13\`).

**Taqrīb:**
- Because the user's instruction specifies finishing the ENTIRE uncondensed matn FIRST, no new 100-page commentary translation is claimed in Stage 36.
- Recovered earlier Stage 31 50-page interpretive commentary draft (I:13–62) as editable Markdown in GitHub (commit \`ffdc9473879c291268d2d24049e6dfd219da5057\`).
- Preserved the existing Arabic–English selected layers into a separate cumulative anthology (43 units from initial + I:63–80 selections), commit \`4d62763c47cbba879da5094b10fac131290d3dba\`.
- Created a transparent 100-printed-page **pending** register for I:81–180 (= corresponding PDF pp. 94–193 in the same printing, subject to printed-label confirmation). Commit \`e6e8943b12942e767bbca1b13e2f37a5dd7d8eed\`. Every row is explicitly marked NOT TRANSLATED; source scheduling is not counted as translation.

### 4. What remains before the user’s requested “definitive” designation

**Logic:** the complete printed-source working text now exists in Arabic and English, but every wording affecting modal inferential patterns and syllogistic conditions needs comparison against independent original witnesses, especially the alternative \`النظريات/الفطريات\`. No full manuscript collation yet; do not call manuscript-definitive.

**Kalām:** printed Cairo pp. 15–127 all have source images and page-aligned English, but many pages use compressed explanatory prose, have missing authorial connectors, or combine distinct objection and reply. The exact, FULL original Arabic main text must be separated from the long lower notes for EVERY page; each original sentence must correspond to English. The 83 thematic extracts are NOT equivalent to the contiguous 113-page matn. New selected direct checks do not by themselves establish all the intervening prose.

**Taqrīb:** I:8–12 principal commentary excerpts; I:13–62 first-pass page-aligned interpretive prose; I:63–72 source-selected principal translation; I:73–80 source-aligned selected prose; I:81–112 inspected analytical guide only; I:113–180 not yet directly translated. The 100-page request remains unfulfilled. The other 632-page printed source's volumes and lower marginal glosses likewise have no complete translation. **Do NOT claim the 100-page batch was translated just because a source register or analytical guide exists.**

### 5. Next exact sequence, no restarting and no further user uploads

1. Continue **Cairo kalām p. 29** onward, then pp. 36–127, without skipping and without counting a page until its first and last authorial sentence and all intermediate clauses are individually represented in English. Reconcile the earlier 134 checked loci with the actual full-page source. Source printed footnotes and ḥāshiya are NEVER al-Taftāzānī's primary matn.
2. Revisit p. 27 where the argument concerning the ancient effect of a free agent requires finer exact clause verification; if illegible compare the second 1912-derived witness or al-Sanandajī's quoted lemmata, not conjecture.
3. Audit every modal-inference form and the difficult fourth-figure language in the logic section against al-Yazdī, al-Lakhnawī, Juhd al-Muqill and independently readable manuscript leaves, keeping copy-text and variants separate.
4. **ONLY AFTER completion of the full primary Tahdhīb**, begin 100 consecutive *translated*, not merely inspected, printed pages of al-Sanandajī: I:81–180 (PDF 94–193). Maintain primary sharḥ, embedded Taftāzānī lemmata, al-Kurdistānī and other small-type glosses as separate attributed voices. Translate objections/replies in full.
5. Publish concise, reader-facing explanatory notes and linked Taqrīb commentary layers by matn ID. Editorial method, textual variants, source flags and work logs stay in the separate editorial apparatus.
6. Build final Arabic–English facing edition, English-only edition, glossary, sources, lemma index, bibliographic introduction and numerical source/translation parity test. “Definitive” requires the independent collation and page-level completeness checks to pass.

### 6. Previous archives to preserve, not supersede blindly

Earlier downloadable bundles already created in this same conversation include: \`Tahdhib_Stage31_FULL_Cumulative.zip\`, \`Tahdhib_Stage33_FULL_Cumulative.zip\`, \`Tahdhib_Stage35_FULL_Cumulative.zip\` and their stage-specific facsimiles. The current GitHub textual preservation does not re-upload the source PDFs, nor does it replace the exact page-image material or editable audit CSV in those archived bundles. Original files remain accessible as conversation attachments or Library references. Do not fabricate sandbox links from their filenames.

**Accuracy constraint:** page-level reading is NOT identical with full sentence-level translation; textual similarity to a commentary is NOT an established manuscript reading. Continue without requesting uploads already present.
