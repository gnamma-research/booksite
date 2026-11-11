# Qawtaw 7 — complete source-backed integration and remaining critical questions

**11 November 2026 — Qawāʿid al-Tawḥīd / Tamhīd al-Qawāʿid**  
Repository: gnamma-research/booksite; project root: texts/al-turka/qawaid-al-tawhid/.

## Scope and results

Qawtaw 5 already translated all **61 surviving ancestral matn units** and **110 commentary units**, and recorded an electronic A/N Arabic–English comparison across **5,520 punctuation-derived segments**. Those numbers were measures of source-sequence coverage, not proof of text accuracy or manuscript completeness.

Qawtaw 6 reviewed **57 problem groups**, comparing the electronic A/N readings with **H2014**, the typeset medieval quotation passages in Kamāl al-Ḥaydarī's two-volume *Sharḥ Tamhīd al-Qawāʿid* (Baghdad, 2014). The results were 42 source-supported working readings, one interpretive resolution, ten partial resolutions, three unresolved readings, and one unrecovered ancestral lacuna.

Qawtaw 7 integrates that evidence into the canonical GNAMMA reader without deleting the original source. **53 targeted Arabic substitutions/deletions** produce a new **readingArabic** field in **42 of the 171 units**; **16 English phrase corrections** are made where the printed evidence changes the translation. Every one of the 57 original flags is represented in an attached source comparison with a printed volume/page anchor and a separate status. All 171 original A/N Arabic unit strings remain **unchanged**. Full first-pass electronic comparison remains available as a historical record.

The new HTML, bilingual Markdown and PDFs display readingArabic when present, falling back to the inherited Arabic otherwise. All edits appear in collapsed witness/editorial notes, not as prefatory prose inserted into the continuous medieval text. Primary source quotation cards retain original A wording for traceability. This is a **source-supported working reading edition, not a critical manuscript edition**.

## Principal supported changes

- **QT-056 (H2014 II:539):** restore *illā* (إلّا) in «فلا يجوز إلّا بالنسبة إلى المرتاضين»: qualified permission, not absolute prohibition. The earlier negative without the exception remains in A.
- **SH-058 (II:560):** choose *sahar* (السهر), wakefulness, over electronic *sahw* (السهو), lapses of attention, and *al-ḥaraka al-intiqāliyya* (الحركة الانتقالية) rather than *al-infiʿāliyya*. The previous A-faithful English must be revised accordingly.
- **SH-048 (II:425):** «تعقّلاً غيبياً», unseen intellection, in the objection, not «عينياً تفصيلياً». Do not conflate that objection with the later differentiated-knowledge answer.
- **SH-054 (II:511):** restore the complete printed sentence contrasting the higher faculty with intellectual apprehension of the remaining objects.
- **SH-040 (II:305):** *al-nahy* (النهي), prohibition, contrasted with command; not electronic *al-nasī*.
- **QT-024/025/030 and SH-009:** correct incidentality, identity and unrestricted existence where the electronic terms changed the ontological argument.
- **SH-002:** H2014 also reads «ببطلان مسألة التوحيد». Retain the difficult negation; do NOT repair it by conjecture.
- **SH-049:** the apparent duplication is retained in H2014. Do NOT automatically delete a potentially doubly qualified construction.
- **SH-061-A (H2014 II:598):** choose «أفعاله وأحواله» (“actions and states”) as the preferred printed reading. A's «أقفاله وأحواله» (“locks and states”) and reported «إقباله» remain documented. This is an adopted reading, not a claim of original archetypal certainty.
- **SH-061-E/F:** preferred H2014 source allows the shorter deficiency argument and corrects *ṭalab wa-sulūk* (الطلب والسلوك); nevertheless the logic comparison's «غير المتسقة المنتظمة» remains grammatically strained.

## Remaining unresolved by evidence

**Ten partial cases** retain local uncertainties (for instance modal/causal syntax, SH-055's pronouns, and several reported alternatives). **Three unclosed groups** remain QT-061, SH-011, and SH-053. The **reported substantial lost ancestor wording at QT-059 remains missing**; the surviving quoted clause ends «وأما الثاني فلما بيّنّاه في كتبنا المعمولة في صناعة الحكمة». The descendant's SH-059 explanation cannot be transposed into the grandfather's text.

No original manuscript folio was independently collated and no stemma established. H2014 is a modern *printed selected quotation witness*, not proof of manuscript originality. The separately edited Qawāʿid in Majīd Hādīzādeh, *Nuṣūṣ wa-Rasāʾil min Turāth Iṣfahān al-ʿIlmī al-Khālid*, IV:37–72 remains a bibliographically confirmed lead, but its pages were not obtained in this pass. Do not claim QT-059 was restored from it.

## Reproducibility and important files

- qa/qawtaw6-comparator-dossier.html — full 57-record source-linked comparator as recovered in Qawtaw 6.
- qa/qawtaw7_patchmap.py — exact, unit-scoped, one-to-one before/after pairs.
- qa/qawtaw7_apply.py — reproducible, strict source-preserving patcher, first on canonical modules and then on commentary draft records.
- qa/qawtaw7_presentation.py — opt-in preferred reading in website, standalone reader, Markdown and PDFs, while preserving the source layer.
- qa/qawtaw7-witness-register.json — every original flag, preferred attestation, original electronic excerpt, comparator page, interpretation and edit.
- qa/qawtaw7-edit-report.json — arithmetic and source change report.
- data/units.js — original Arabic and preferred variant fields; source is not overwritten.
- data/parallel-matn.md — original electronic Arabic; **data/parallel-matn-reading.md** — the source-supported reading.
- data/commentary-*.js, data/commentary-corpus.json, data/parallel-commentary.md, data/commentary-english.md — cumulative revised commentary and exports.
- downloads/Tamhid_Complete_Commentary_Reading_Edition.html — self-contained bilingual sharḥ reader (external links need internet).
- pdf/manifest.json and five edition PDFs — updated Arabic and English readings with checksums.

## Publication protocol

1. Run qawtaw7_apply.py on a pinned repository branch, asserting all Arabic replacement spans occur exactly once in their specified units.
2. Run qawtaw7_presentation.py; rebuild with qa/finalize-reading-edition.py and qa/generate-clause-ledger.mjs (the historical 5,520 A/N clause index should remain valid).
3. Check source-level identity: each unit['arabic'] unchanged; its optional readingArabic is different only at supported, recorded words. Confirm 57 registered records and zero manuscript witnesses.
4. Run real mobile-width browser tests and inspect corrected paragraphs, at least QT-056, SH-048, SH-058 and SH-061-A, in Arabic/English and focus modes. Browser emulation does not constitute a physical Safari acceptance test.
5. Regenerate five searchable PDFs, validate actual page counts and SHA-256s, and inspect selected rendered pages for Arabic shaping and note separation.
6. Merge successful branch, verify actual public GitHub Pages HTML/JSON/PDF bytes (do not infer deployment from commit). Ensure following automatic workflows have not reverted preferred readings.
7. Future genuine critical work is independent manuscript comparison, especially of the three remaining unresolved readings and the QT-059 lost text.

**Never report 57 of 57 as “textually solved”. All 57 cases are accounted for and the attested corrections integrated, but 14 remain open in whole or in part.**
