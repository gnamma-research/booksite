# START HERE — Full recoverable Sharḥ al-Maqāṣid + independent Maqāṣid continuity (7 November 2026)

## Why this checkpoint exists
Prior chats repeatedly lost the completed **30 October 2026 C1 matn translation** and the **4 November 2026 851-record Sharḥ cumulative reader** and regenerated already existing passages. This repository branch preserves both canonical masters in reconstructable form, with variants unchanged.

**Read the globally published protocol first:** [docs/TRANSLATION_CONTINUITY_PROTOCOL.md](../../../../docs/TRANSLATION_CONTINUITY_PROTOCOL.md).

## Source-of-truth files

1. **Complete C1 independent matn:** [MAQASID_MATN_C1_2026-10-30.md](./MAQASID_MATN_C1_2026-10-30.md) (5,346 lines, canonical original text preserved; the work's introduction, six divisions and colophon are present, circa 87,404 words of original translation by the historical report).
2. **Complete recovered Sharḥ cumulative reader:** [sharh_v5/MANIFEST.json](./sharh_v5/MANIFEST.json): all 851 unit records in seventeen JSON parts, 235 notes, 81 apparatus records, glossary, terminal appendix and HTML reader shell. The 851 units carry mixed grades; 364 have attached Arabic.
3. **Independent matn reader index:** [../../maqasid/reader-data/MANIFEST.json](../../maqasid/reader-data/MANIFEST.json), 379 reading positions (5 preface, 47 I, 327 printed leaf units for II–VI), all cross-referenced to C1.
4. **Full matn structural audit:** [../../maqasid/reader-data/C1_FULL_STRUCTURAL_AUDIT.json](../../maqasid/reader-data/C1_FULL_STRUCTURAL_AUDIT.json): expected printed source slots matched; linguistic verification not inferred.
5. **Sharḥ pair integrity audit:** [sharh_v5/2026-11-07_PAIR_INTEGRITY_AUDIT.json](./sharh_v5/2026-11-07_PAIR_INTEGRITY_AUDIT.json): source pairing, original labels and per-record fingerprints. 179,853 attached Arabic characters, **not** 10.81% of unique close-checked whole-source coverage because source-slice overlap and historical segmentation have not been proved.
6. **Matn stage corrections:** [../../maqasid/editorial/2026-11-07_C1_SECOND_PASS_EVIDENCE.json](../../maqasid/editorial/2026-11-07_C1_SECOND_PASS_EVIDENCE.json): one bounded lemma corrected and two Arabic cross-witness excerpts checked (not complete printed leaves).
7. **Sharḥ stage close-review revisions:** [../editorial/2026-11-07_CLOSE_REVIEW_SM40_001_009.json](../editorial/2026-11-07_CLOSE_REVIEW_SM40_001_009.json): nine entire electronic-source units, 3,486 Arabic characters, revised English; originals retained.
8. **Staged reader:** [../../maqasid/index.html](../../maqasid/index.html) and adjacent reader.css / reader.js; source-graded matn/Sharḥ navigation, search, modes, theme, bookmarks and export. Catalogue entry staged in texts/index.html and texts/manifest.json **on this branch only**.

## What is actually completed and what is NOT

- C1 independent matn **English first pass complete**. Original matn spans all six divisions through printed p.777. Comprehensive sentence-by-sentence comparison against 2019 YEK Arabic images, bilingual Arabic transcription, independent proofreading and definitive certification **remain incomplete**. Nothing in the 2026-11-07 automated audit upgrades their grade.
- Sharḥ reader **851 units preserved, not 851 certified close translations**. Historical audit: 487 units lack attached Arabic; 538 inherited master offsets previously mislabeled as Arabic are actually English draft offsets.
- Latest Sharḥ new close review 9 units = 3,486 Arabic characters / 1,663,485 whole source = **0.21%** of source. This is not the requested stage target of 10–20%, and the next stage must expand substantially.
- All 17 source JSON parts and both reader shells exist on this branch. No material in the recovered 851-unit master has been intentionally discarded.
- Earlier Stage 7–20 **retranslations of the matn** (Nov 6) exist in Library / earlier ChatGPT deliverables. They duplicate C1's source pages and need **diff/collation**; they are not evidence of newly translated source spans. These historical variant ZIPs are **not yet embedded** into this branch. Therefore **the branch is complete for the recovered canonical C1 and Sharḥ V5 masters, but is not an archive of every old intermediate ZIP.**
- NAMA and GNAMMA must not be conflated. The actual connected writable site repository is GNAMMA; the NAMA website's distinct publishing target has not been verified. **No live NAMA deployment is claimed.**

## Exact next work
**Sharḥ**: continue close-review after `SM40-009` at `SM40-010`, in sequence, and then systematically audit/translate commentary Divisions I–V with original Arabic source attached. Work in contiguous 10–20% original-Arabic source stages, using stage start/end offsets and explicit source denominator; do NOT count note-writing or English-only copy.

**Matn**: retain complete C1 as the primary translation and progressively verify each Arabic clause against the YEK 2019 printed pages. The next unresolved source span after bounded first-lemma checking is the complete continuation of the Introduction and I, before working through II–VI. Record corrections over C1 rather than retranslating it from scratch.

## Immutable handoff requirement
Every new stage should preserve the entire earlier master corpus in GitHub history, update the canonical manifests, append delta translations with exact source spans and metadata, and not suppress variants. User-facing export must either physically include all corpus data or identify the GitHub branch as the **authoritative distributed full recovery**. A status-only ZIP must never be misrepresented as an offline corpus.

## Independent original source identifiers
- Matn: Turkish Yazma Eserler Kurumu, 2019 (Kaylı et al.), Arabic base and Turkish translation, printed pp. 89–777. https://ekitap.yek.gov.tr/Uploads/ProductsFiles/_129.%20MAKASID.pdf
- Sharḥ: JK001157 OpenITI electronic text based on 1981 print, and Ottoman print 1305 AH. https://usul.ai/ar/t/sharh-maqasid/5
