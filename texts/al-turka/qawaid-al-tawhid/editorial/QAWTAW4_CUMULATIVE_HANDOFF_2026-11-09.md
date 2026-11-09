# Qawtaw4 — cumulative scholarly and publication handoff (9 November 2026)

## Control facts

**Works:** Abū Ḥāmid Turka, *Qawāʿid al-Tawḥīd* (ancestral `QT` matn); Ṣāʾin al-Dīn Ibn Turka, *Tamhīd al-Qawāʿid* (descendant `SH` commentary).

**Repository:** `gnamma-research/booksite`; project root `texts/al-turka/qawaid-al-tawhid/`.

**Textual state:** 61/61 surviving ancestral lemma units and 110/110 consulted commentary units possess bilingual working translations. Commentary consists of 40 introductory, 64 main, and six closing units. Four embedded ancestral bridging quotations are separately attributed. This is **not** a manuscript-critical edition; **zero** independently collated manuscript witnesses and no new photographic collations in Qawtaw4. The substantial reported ancestral lacuna at QT-059 remains explicitly **deferred**, not repaired by doctrinal reconstruction.

**Progress against the canonical 171-unit electronic Arabic corpus:**

| Measure | Pre-Qawtaw4 | Qawtaw4 increment | Cumulative |
| --- | ---: | ---: | ---: |
| Manually compared Arabic punctuation segments | 1,574 | **187** | **1,761 / 5,520** |
| Working Arabic–English units with individual manual comparison | 75 | **11** | **86 / 171** |
| Ancestral matn units compared | 50 | **11** | **61 / 61** |
| Commentary units compared | 25 | 0 | **25 / 110** |
| Uncompared Arabic punctuation segments | 3,946 | −187 | **3,759** |
| Unreviewed commentary units | 85 | 0 | **85** |

**Important:** “Compared” means a human editorial comparison of the present normalized Arabic string against its English sentence group, not certified original manuscript readings. Some compared groups are expressly marked `unresolved-reading`, and no status here certifies every syntactic or paleographical detail. The earlier auxiliary `qa/clause-map-matn.jsonl` yields 201 snippets for QT-051–061; the current canonical `data/units.js` yields **187** actual Arabic punctuation clauses. The new count was validated directly against the canonical `qa/generate-clause-ledger.mjs` splitter, not taken from the stale auxiliary mapping.

## Corrections actually entered in canonical data

1. **QT-056, A pp.252–255:** English now translates the previously omitted injunctions `فتأمّل ذلك` and `فاعرف ذلك`. It also restores explicit reference to `أخلاق المخانيث والشهوات والنسوان`, while clearly attributing this historically disparaging wording to the medieval author rather than adopting it as editorial judgement. Canonical `data/units.js` and the readable `data/parallel-matn.md` were both updated.
2. **QT-060, A p.267:** source `فلحق به من الحق الغضب` was omitted in English; it now reads that the wrath of the Real overtakes the disputant. The final English clause again mentions divine devising and wrath. **Crucial crux:** the accessible digital print A has `فيتقن ... من لطفه واستعد به من مكره وغضبه`, whereas the previously adopted normalized Arabic in the reader has conjectural `فليتقِ ... وليستعذ`. Do **not** report that the conjectural Arabic has been independently witnessed. The English is interpretative and the crux remains open.
3. **QT-061, A p.270:** `شيخ مكمّل` is an active participle: a guide who brings another toward perfection; the previous `perfected spiritual teacher` misleadingly suggested passive `مكمَّل`. Corrected in canonical matn and readable Markdown. The explicit guide exception remains.
4. **SH-061-A, A p.274:** the parallel `إمام مكمّل` is now translated as a perfecting guide, with an explanatory note, in the closing commentary source module. Unresolved `أقفاله / إقباله / أفعاله` remain recorded.
5. Corrected the *parallel matn* bibliography's outdated statement that the examined Arabic transcription ended at printed p.207: quotations extend **48–270** (source-scoped, not proof that an independent ancestral manuscript is complete).

## Human alignment and textual cruxes

All 187 punctuation-derived Arabic clauses of **QT-051–QT-061** now have manual English-range decisions stored as append-only new `units` records in `qa/clause-review-adjudications-2026-11-09.json`. Each clause number occurs exactly once. Many Arabic clauses may properly point to the same English sentence. The machine alignment in `qa/clause-map-matn.jsonl` is **not** used to certify equivalence.

Priority remaining cruxes:
- **QT-051:** transmitted `وبصدر` versus expected `ويصدر`.
- **QT-052:** the duplicated/dislocated words after `ولا يجوز ...`; no manuscript-resolved syntax.
- **QT-053:** `هربت / هذّبت`, while the English describes disciplines of the lower faculties.
- **QT-054:** doubled middle-term passage; preserved, bracketed in English.
- **QT-055:** `بوجوب / بوجود`, `تقيّد / ويفيد`.
- **QT-056:** `فلا يجوز` contradicts what the therapy-of-opposites argument appears to require; **do not silently insert `إلّا` or change the negation**. Preserve historically situated physiological and polemical claims.
- **QT-058 vs SH-058:** ancestor has `السهر` (wakefulness); commentary source has `السهو` (inattention). They are distinct layers, not interchangeable.
- **QT-059:** *reported loss of ancestral text* persists; the descendant's commentary cannot be used as a source-perfect reconstruction.
- **QT-060:** A p.267 `فوقع / فأوقع`, `المفرفة / المغرقة`, `فيتقن / فليتقِ`, `واستعد / وليستعذ`. In A the closing imperative is particularly uncertain; do not overclaim.
- **QT-061:** A p.270 `غير المتّسقة المنتظمة` is syntactically difficult; final formal authorial ending precedes grandson's `أقول`.
- **SH-061-A/B:** A p.274 inherited commentary ends before Āshtiyānī's later editor's dated note; do not import modern material into authorial translation.

### Evidence directly rechecked this stage

- [Āshtiyānī A printed p.267](https://ablibrary.net/book_content/b/17638/463?lang=ar), with explicit divine wrath and actual digital closing verbs.
- [A p.270](https://ablibrary.net/book_content/b/17638/466?lang=ar), confirming `شيخ مكمّل`, original ending and following `أقول`.
- [A p.274](https://ablibrary.net/book_content/b/17638/470?lang=ar), confirming `إمام مكمّل`, the `أقفاله / إقباله / أفعاله` alternatives and the modern colophon boundary.
- Other reviewed passages use retained, earlier sourced A/N electronic transcriptions, not new photographic inspection.

## Publication integration and verification gates

- **Canonical matn:** `data/units.js`.
- **Canonical source module for SH-061-A/B:** `data/commentary.js`. Other sharḥ components remain unchanged.
- **Human adjudications:** `qa/clause-review-adjudications-2026-11-09.json`.
- **Reproducible inventory generator:** `qa/generate-clause-ledger.mjs`.
- **Readable extant matn:** `data/parallel-matn.md` (updated directly for text parity).
- **Derived commentary corpus, HTML, ledger and PDFs:** must be regenerated by project workflows; **do not describe as rebuilt or published until the merged-branch CI succeeds**.

Once merged to `master`, the existing `qawaid-clause-review-pass1.yml` should invoke `finalize-reading-edition.py` and `generate-clause-ledger.mjs`. The PDF release workflow `qawaid-pdf-release-v2.yml` should rebuild five editions after its own guard checks. These are intended downstream actions, **not** evidence of present successful deployment. Inspect Actions status, regenerated `qa/clause-ledger.json` summary, `data/commentary-corpus.json`, download HTML, and `pdf/manifest.json` SHA-256 values before announcing completion.

## Next work, in order

1. Validate the combined 1,761-clause adjudication file against the **actual canonical 171-unit corpus** in CI. Ensure no decision indexes exceed English sentence counts after the QT-056 revisions.
2. Confirm downstream HTML/PDF parity; perform mobile reader language, focus, search, bookmarking, and visible edition-note QA. Correct output only from the canonical source layer, then regenerate; do not patch HTML/PDF alone.
3. Advance human Arabic–English comparison through the **remaining 85 commentary units**; prioritize metaphysically sensitive SH-001–013, SH-016, SH-018–019, SH-022, SH-033–060 and any unreviewed introductory units. Track all negations, objection/reply changes, causal/epistemic modalities, and who speaks.
4. Separately collate photographic source pages and independent original manuscripts when available. Leave QT-059 deferred until an actual original-text witness supplies words. **Do not conflate digital transcription with independent palaeographic evidence.**
5. Keep this handoff updated after every subsequent chunk; report review progress, distinct from corpus translation coverage, manuscript collation, website deployment and PDFs.
