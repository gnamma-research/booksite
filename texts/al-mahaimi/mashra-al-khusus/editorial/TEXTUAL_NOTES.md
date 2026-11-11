# Textual notes for the complete working edition

## What has been established

The running Arabic and English cover al-Mahāʾimī’s commentary, printed pp.11–232, and Qūnawī’s separately printed original, pp.235–267. The copytext is the 2008 edition prepared by Aḥmad Farīd al-Mazīdī, published in Beirut by Dār al-Kutub al-ʿIlmiyya. Its electronic transcription and a scan of the printing have both been consulted. The current [coverage ledger](../data/coverage-stage12.json) distinguishes text coverage, translation review and documented image comparison.

The scan and the electronic transcription represent the same modern edition. Agreement between them can resolve a transcription error; it does not supply independent manuscript attestation. Likewise, the original text printed at the back of the same volume is useful for internal comparison, but does not by itself establish which reading is authorial.

## The final commentary sentence

Printed p.232 ends its final explanatory sentence with **فإذا ظهرت آثار الوجود بشرط** and then supplies an end formula. The acquired print image therefore confirms that the interruption is present in the modern printing itself. It is not merely an online extraction failure. The reason for the earlier loss or interruption remains unknown.

The edition leaves this sentence unfinished. It does not complete it from the independently arranged Qūnawī appendix, from doctrinal expectations, or from a conjectural paraphrase. The end formula is recorded without assigning its authorship conclusively to al-Mahāʾimī, an earlier copyist, or an editor.

The final lemma and its explanation also require separate treatment:

| Location | Reading in the consulted printing | Treatment |
|---|---|---|
| Commentary p.230, beginning of Text Twenty-Two | توجب | Retained in the quoted commentary lemma |
| Appendix p.267, corresponding opening | يوجب | Retained in Arabic; the difficult opening construction is marked in English |
| Commentary p.232, quoted lemma | الظهور في الوجود | Rendered as manifestation “in existence” |
| Commentary p.232, ensuing explanation; appendix p.267 | الظهور للوجود | Rendered as manifestation “belonging to existence” |

The reading بموجب reported in later reception material is not silently substituted into either printed passage. These are internal or reception comparisons, not a completed manuscript apparatus.

## Scan pagination and the two absent leaves

The PDF has 269 images. Its image numbering is not a constant offset from printed pagination. For the commentary, printed pp.11–112 correspond to zero-based Archive leaves 11–112. After printed p.112 the acquired scan proceeds directly to printed p.115. Printed pp.113–114 are absent from that scan, although both occur in the electronic transcription and remain available in this edition.

From printed p.115 onward, the zero-based Archive leaf is the printed number minus two. Thus commentary p.232 is PDF page 231, and appendix p.267 is PDF page 266. The [page map](../data/print-page-map-stage12.json) records each source page explicitly, including the two absent images. Absence of an image is not reported as absence of the corresponding text.

## Separating medieval text from modern editorial notes

Electronic page extraction had sometimes joined the continuation of a modern footnote to the next page’s medieval running text. Inspection of the printed rule and page layout resolves several such cases. Examples include commentary pp.19, 211, 215, 224 and 226. Those note continuations are excluded from the authorial Arabic and are not translated as al-Mahāʾimī’s prose. Conversely, the last authorial line on p.210 had been lost from the extracted body; the scan restores it before the continuation on p.211.

These repairs affect attribution, not merely appearance. A useful edition must distinguish Qūnawī’s lemma, al-Mahāʾimī’s explanation, an authority quoted by the commentator, and the modern editor’s apparatus. English speaker labels and topical headings remain editorial aids. They are not additional words attributed to the medieval authors.

## Selected translation and reading decisions

| Location | Issue | Decision |
|---|---|---|
| Commentary p.11 | Several grammatically difficult phrases also occur in the print | Preserve the source and mark the difficulty; do not classify every awkward reading as an OCR error |
| Commentary p.12 | العقل الملكي in the sequence of intellects | Render contextually as the dispositional intellect, with the technical interpretation documented |
| Commentary p.15 | Active and passive forms of the unvowelled mūjid/mūjad | Distinguish the producer from what is produced, while recording the problematic printed variant |
| Commentary p.150 | The commentator explicitly identifies المظهر as an active participle | Render “manifester,” rather than the different noun “locus of manifestation” |
| Commentary p.157 | Direction of knowing through the Real; the force of اتحاد | Restore the direction of the Arabic construction and the explicit claim of union |
| Commentary p.172 | Vessel and water analogy | Preserve which term the commentator identifies with each side of the analogy |
| Commentary pp.176–177 | The new text begins on p.176; the lemma and commentary use a difficult contrast | Restore the printed boundary and retain the printed tension instead of silently harmonizing it |
| Commentary p.182 | Digital فلك الروح against printed الملك الروح | Follow the inspected print, with the change recorded in the review file |
| Commentary p.210 | Digital العلماء against printed العماء | Restore the printed word in the discussion of the cloud |
| Commentary p.221 | Qurʾānic reference to the testing of those who strive and endure | Correct the English locator to 47:31 and document the source’s reference error |
| Commentary p.230 | Digital تجابيها against printed تجليها | Follow the print |
| Commentary p.231 | Words omitted at the start of the electronic page | Restore the printed continuation; do not silently emend the difficult repeated “existence” later on the page |
| Appendix p.236 | Repeated في نفسه | Retain and mark the repetition |
| Appendix p.252 | “The best of forgivers” | Correct the English Qurʾānic locator to 7:155; preserve the Arabic quotation |
| Appendix p.259 | Uncertain place names in a reported visionary account | Transliterate and mark uncertainty, without supplying guessed locations |
| Appendix p.263 | Difficult phrase concerning composition | Mark the difficulty rather than make an unrecorded Arabic emendation |

The detailed review files preserve the affected passages and reasons for changes. This table highlights consequential examples; it is not an exhaustive list of every correction.

## The appended discourse in Qūnawī’s text

At appendix p.260 the modern editor explains that a following discourse was an appended text in the exemplar from which he copied. The current reader preserves its transmitted placement and records that fact. The layout of the 2008 appendix is not presented as a separately established authorial ordering. The modern editor’s note is summarized in the apparatus, rather than inserted into Qūnawī’s running prose.

The separate appendix’s final colophon is retained on p.267. It does not repair the incomplete final clause of al-Mahāʾimī’s commentary on p.232.

## Cross-references and further critical work

The concordance identifies shared Arabic wording between the original and commentary. Its current threshold is at least twelve consecutive normalized Arabic words. Diacritics and a small set of orthographic variations are normalized for matching; the displayed Arabic is not normalized by this procedure. Links are textual parallels, not claims that every word of one passage corresponds exactly to every word of the other.

No manuscript images have been collated for this release. Leiden Or.5675 and the Āshtiyānī edition remain independent comparison targets, with their acquisition status recorded in the source register. Until those witnesses are examined, the edition’s full text coverage should not be confused with a completed manuscript-critical establishment of the work.

## Primary source access

- [2008 printed scan, Internet Archive](https://archive.org/details/machra3-khosous)
- [Public electronic transcription of the same edition](https://docs.google.com/document/d/10rMWtE9yNKWGhXq8jXBiSUeWYfDNPrb5gho2-g1xoCg/edit)
- [Page-by-page source map](../data/print-page-map-stage12.json)
- [Review index](review-stage12/review-index.json)
- [Exact coverage ledger](../data/coverage-stage12.json)
