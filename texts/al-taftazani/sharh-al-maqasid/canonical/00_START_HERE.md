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
8. **Next Sharḥ close review R7:** [../editorial/2026-11-07_CLOSE_REVIEW_SM41_001_018.json](../editorial/2026-11-07_CLOSE_REVIEW_SM41_001_018.json): 18 existing Arabic-English records, 9,095 source Arabic characters, new interpretive correction to *luṭf* in `SM41-013`; name and variant uncertainties explicitly logged.
9. **Sharḥ close review R8:** [../editorial/2026-11-07_CLOSE_REVIEW_SM42_001_018.json](../editorial/2026-11-07_CLOSE_REVIEW_SM42_001_018.json): 18 existing source-attached records, 9,119 Arabic characters, refined modality of ʿiṣma/capacity in `SM42-014`.
10. **Further matn second pass:** [../../maqasid/editorial/2026-11-07_C1_SECOND_PASS_MI02_MI07.json](../../maqasid/editorial/2026-11-07_C1_SECOND_PASS_MI02_MI07.json): six bounded original Arabic excerpt alignments; two local English refinements. The 6 November Stage7 Arabic text-layer witness is preserved in the Library cumulative stage archive; it does not replace YEK photographic collation.
11. **Staged reader:** [../../maqasid/index.html](../../maqasid/index.html) and adjacent reader.css / reader.js; source-graded matn/Sharḥ navigation, search, modes, theme, bookmarks and export. Catalogue entry staged in texts/index.html and texts/manifest.json **on this branch only**.

## What is actually completed and what is NOT

- C1 independent matn **English first pass complete**. Original matn spans all six divisions through printed p.777. Comprehensive sentence-by-sentence comparison against 2019 YEK Arabic images, bilingual Arabic transcription, independent proofreading and definitive certification **remain incomplete**. Nothing in the 2026-11-07 automated audit upgrades their grade.
- Sharḥ reader **851 units preserved, not 851 certified close translations**. Historical audit: 487 units lack attached Arabic; 538 inherited master offsets previously mislabeled as Arabic are actually English draft offsets.
- R6–R8 electronic excerpt close reviews: 45 existing source-attached units (9 + 18 + 18) = **21,700 Arabic characters** revisited / 1,663,485 whole-source denominator = **1.304%**. These were existing English-Arabic pairs, **not 21,700 newly translated source characters**. New unpaired source translated in these reviews = 0. This is still below the requested 10–20% source-stage goal; no source-image/sentence certification was claimed.
- Independent matn second-pass excerpts: `M-I-01` and `M-I-02–07` = **7 bounded entries**, with the latter six using 1,263 Arabic characters from an existing source-text-layer extraction of YEK 2019 printed pp.93,95; **not** a complete printed-page audit or certification.
- All 17 source JSON parts and both reader shells exist on this branch. No material in the recovered 851-unit master has been intentionally discarded.
- Earlier Stage 7–20 **retranslations of the matn** (Nov 6) exist in Library / earlier ChatGPT deliverables. They duplicate C1's source pages and need **diff/collation**; they are not evidence of newly translated source spans. These historical variant ZIPs are **not yet embedded** into this branch. Therefore **the branch is complete for the recovered canonical C1 and Sharḥ V5 masters, but is not an archive of every old intermediate ZIP.**
- NAMA and GNAMMA must not be conflated. The actual connected writable site repository is GNAMMA; the NAMA website's distinct publishing target has not been verified. **No live NAMA deployment is claimed.**

## Exact next work
**Sharḥ**: continue source-close review after `SM42-018` at the verified next record `SM43-001`, in sequence, and then systematically audit/translate commentary Divisions I–V with original Arabic source attached. Work in contiguous 10–20% original-Arabic source stages, using stage start/end offsets and explicit source denominator; do NOT count note-writing or English-only copy.

**Matn**: retain complete C1 as the primary translation and progressively verify each Arabic clause against the YEK 2019 printed pages. The next source-alignment position after the seven bounded Introduction/I excerpt checks is `M-I-08`, from Chapter Two (knowledge) in printed 2019 p.97, before working through II–VI. Record corrections over C1 rather than retranslating it from scratch.

## Immutable handoff requirement
Every new stage should preserve the entire earlier master corpus in GitHub history, update the canonical manifests, append delta translations with exact source spans and metadata, and not suppress variants. User-facing export must either physically include all corpus data or identify the GitHub branch as the **authoritative distributed full recovery**. A status-only ZIP must never be misrepresented as an offline corpus.

## Independent original source identifiers
- Matn: Turkish Yazma Eserler Kurumu, 2019 (Kaylı et al.), Arabic base and Turkish translation, printed pp. 89–777. https://ekitap.yek.gov.tr/Uploads/ProductsFiles/_129.%20MAKASID.pdf
- Sharḥ: JK001157 OpenITI electronic text based on 1981 print, and Ottoman print 1305 AH. https://usul.ai/ar/t/sharh-maqasid/5

## 7 November 2026 — R8 current integrity checkpoint

The 851 inherited Sharḥ units, 235 notes, 81 apparatus records, glossary, and original cumulative reader shell remain unchanged in `sharh_v5/` and its manifest. The R6, R7 and R8 overlays are **additive** JSON in `../editorial/`, applied by `../../maqasid/reader.js` at display time; the original English fields in the canonical 17-part JSONs are not overwritten. The independent matn C1 master is unchanged and its revisions are overlay-only. The reader page states limits and does not claim public NAMA deployment. Check `docs/TRANSLATION_CONTINUITY_PROTOCOL.md` before work. Next actual records are `SM43-001` and matn `M-I-08`.

**Outstanding:** obtain and align real Arabic source slices for 487 inherited commentary records with no Arabic attached; word-for-word certify the entire matn from printed YEK pages; collate source facsimiles where available; annotate conflicting printed readings without silent normalization; source-level commentary translation of as-yet unrendered Arabic. **Not yet completed:** user-requested 10–20% new-source translation stage, complete critical edition, live site deployment. Offline companion packages that omit any of the seventeen canonical Sharḥ JSON parts must explicitly say NOT PHYSICALLY FULL CORPUS.
