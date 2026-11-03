# Taqrīb al-Marām + Ḥāshiyat al-Muḥākamāt — cumulative handoff
**Edition checkpoint:** 2 November 2026 · Layered Reader Release 01
**Independent of:** al-Taftāzānī's Tahdhīb matn translation (separate chat/workstream). Do not overwrite or silently merge with that text.

## 1. Exact source and image/print pagination
- User-supplied `taqribmaram.pdf`: **632 scanned physical PDF pages, no selectable text**.
- The scan is a reproduction of a Cairo printed two-volume book (the reproduced title pages show 1318 and 1319 AH); the cited reproduction is identified in prior notes as al-Maktaba al-Azhariyya li-l-Turāth, 1433/2012. Keep original and reproduction dates distinct.
- Volume I printed p. **n** = PDF p. **n+13** for the new and inherited I:8–90 range. E.g. I:81 = PDF 94; I:90 = PDF 103.
- Volume II printed p.117 = physical PDF **412**, directly image inspected.
- The upper large type is running Sanandajī commentary with embedded Taftāzānī lemmata. The smaller text below rules is marginal apparatus. **Typographic location alone never proves that any note is by Muḥammad Wasīm**.

## 2. Previously existing material — preserved, not retranslated
- Existing selection objects in `data.js`, `maintext-opening.js`, and `continuous-I08-I12.js`.
- `editorial/2026-10-31_recovered_I13-I62_english_working.md`: **50 consecutive existing printed pages I:13–62** of abbreviated interpretive English; not continuous word-for-word translation. These are dynamically loaded into the reader with their `P1.013`–`P1.062` stable IDs; the archival Markdown is not overwritten.
- `continuous-I63-I72.js` and `continuous-I73-I80.js`: previous page-based English working passages, some with short Arabic anchors rather than complete Arabic.
- Earlier four Sanandajī selections from his *different* `Risāla fī Muhimmāt Masāʾil al-Iʿtiqād` remain outside the Taqrīb running-text coverage and have **not** been counted.
- The other chat's Tahdhīb translation and clause ledger are **untouched**.

## 3. New text entered this release
- `firstpass-I81-I90.js` and `editorial/2026-11-02_firstpass_I81-I90.md`: **10 new, individually inspected printed pages**, volume I:81–90 (PDF pp.94–103). Each receives an English **interpretive first-pass page account** and a short photographed Arabic anchor. **NOT** complete main-text translations; no invented continuous Arabic transcripts. `P1.081`–`P1.090`.
- **Five** selective lower-register first-pass explanatory notes attached to I:81, 84, 85, 86 and 88, all marked `author unassigned`; these are not complete gloss translations.
- `wasim-II117.js` and `editorial/2026-11-02_wasim_II117_source_match.md`: one approximately 45-word Arabic text passage and a new 98-word English first-pass translation, from **printed II:117 / PDF 412, lower register**. Explicit Wasīm attribution is corroborated by a separately published quotation (Waleed Ibn al-Salah, 20 April 2022), `https://drwaleedbinalsalah.com/2-الأدلة-العقلية-على-امتناع-حلول-الحوا/`. This is a **source-matched, attributed provisional excerpt**, not a completed or critically certified page.

## 4. Reader architecture and deployed components
`index.html` now includes `reader-layered.css` and `reader-layered.js`, without editing shared reader assets used by other works.
- Language buttons: Arabic/English side-by-side, English only, Arabic only.
- Two-column ordering switch; mobile stacks cleanly.
- Independent layers: **Sanandajī sharḥ**, **separately identified embedded Tahdhīb lemmata**, **independently attributed Wasīm ḥāshiya**, **unassigned smaller-print margins**, **modern editorial notes**. Do not silently show any unassigned note under Wasīm's name.
- Continuous / focused one-passage reading; contents search, Arabic/English filtering, page-draft versus excerpt scope, light/dark, citation copying, saved preferences and print styles.
- The pre-existing 50-page English draft is read directly from its archive Markdown, not retranslated or duplicated as an incompatible manuscript.
- Arabic-only view explicitly says when an Arabic page transcription is missing; it does not fabricate a parallel Arabic column.

## 5. Cumulative coverage and completion (as of this release)
**English page-level *some-coverage* proxy:** I:8–90 (inclusive) = **83 distinct printed pages**, i.e. **83/632 = 13.13%** of the 632-page *physical scan* as a deliberately conservative comparison denominator. This says only that the page has some English: the majority of its source words have **not** yet been audited against an English translation. It is **not** a completed-text percentage or an estimate that 13.13% of words are translated.
**Critical certification:** **0 complete printed pages / 632 = 0%**. 
**Wasīm:** one independently attributed, image-matched excerpt on II:117; there is no established denominator of individual glosses, so **no Wasīm percentage can yet be honestly computed**.
**Main-text literal clause-complete translation:** 0 fully validated pages. Selected excerpts and interpretive page guides are clearly marked separately.
**New in this release:** 10 page accounts, five unassigned margin summaries, one Wasīm excerpt. This release adds no previously translated pages again.

## 6. Mandatory multi-pass critical editing
1. **Fast coverage:** proceed page by page from **I:91 onward**, systematically recording main-text and marginal presence, brief English rendering, Arabic anchors, print/PDF mapping and uncertainty. No silent claims of verbatim completeness.
2. **First full-text pass:** replace each abbreviated account with continuous Arabic transcription and clause-by-clause English for the entire upper commentary and every lower-register note. Preserve lemma boundaries, quoted interlocutors, objections and replies, and glossary terms.
3. **Independent check:** a second full read of every page, recording omissions, wrong negations, speaker attribution, logical particles, missing lower-register lines, page joins and formulas.
4. **Edition collation:** compare the scanned two-volume source with the 1900–1901 edition and any independently sourced print/manuscript witnesses. Add variant apparatus and explicit editorial decisions.
5. **Critical translation review:** refine exact Arabic/English alignment, technical terminological consistency, source references, provenance, and comparison with Sharḥ al-Maqāṣid and other texts.
6. **Publication QA:** test desktop/mobile portrait/landscape, keyboard, accessibility, dark theme, language direction/column order and print; retain earlier states and publish cumulative handoff.
Only after the standalone Sanandajī+Wasīm stream **and** the separately developed Tahdhīb matn are truly critically definitive should the reader be merged into a three-author-layer aligned edition.

## 7. Next checkpoint
- Begin I:91–100 with both the Sanandajī running text and every identifiable lower-register note.
- Audit the five new unattributed marginal notes before any assignment to Wasīm.
- Establish a **gloss-specific denominator** by enumerating marginal units and incipits across both volumes.
- For each release, report **(a) pages with some first pass, (b) full literal English pages, (c) independently checked pages, (d) critically certified pages, (e) gloss units identified/translated/verified**. These denominators must never be conflated.

## 8. Reproducibility and QA
- Repo `gnamma-research/booksite`; directory `texts/al-sanandaji/taqrib-al-maram/`.
- Static validation during this release found **50** distinct I:13–62 archive entries, **10** new I:81–90 records, **one** Wasīm II:117 record, **no** JavaScript parse error, and **no** missing required DOM ID in the changed HTML.
- The manuscript PDF has **no embedded text**, so full literal translation requires further **manual visual** transcription and independent review.


---

## 9. Stage 02 cumulative continuation (2 November 2026; supersedes earlier numeric checkpoint)

- **New source-facing first-pass page accounts:** volume I **91–100** (physical PDF **104–113**); ten numbered entries `P1.091`–`P1.100` in `firstpass-I91-I100.js` and `editorial/2026-11-02_firstpass_I91-I100.md`. These are individually inspected **abbreviated interpretive summaries**, not whole-page literal translations.
- **Cumulative first-pass some-coverage denominator:** printed I:8–100 inclusive = **93 pages with some English among 632 PDF page images = 14.72%** of scanned-page counts, **not** completion of Arabic words / ḥāshiya notes / full translation. The preexisting I:13–62 fifty-page English draft is reused, not retranslated. The Stage 01 value 83/632 = 13.13% is retained above only as the *earlier checkpoint*.
- **Critically certified complete pages:** **0/632 = 0%**. **Wasīm:** one separate image-matched and independently attributed excerpt II:117, with no established denominator for the gloss corpus. Upper-register and lower-register omissions still require a full new pass.
- **UI:** index now loads `firstpass-I91-I100.js`; toggle for embedded matn lemmata is populated with three source-identified snippets in `embedded-matn-lemmas.js`. Everything remains independent from the Tahdhīb primary translation and the shared Darūrī/Mawāqif components.
- **Testing:** dynamic original archive contains exactly 50 numbered I:13–62 sections; 20 new page-level source units are now available I:81–100; one Wasīm layer, five+ unattributed margin summaries; all JavaScript files compile and the reader DOM references are present.
- **Immediate next source interval:** I:101–110, continuing to enumerate lower-register interventions separately while retaining provisional attribution. Word-for-word source-checking and independent critical review are later passes; no 'definitive' labels before their completion.

---

## 10. Stage 03 — paired same-page witnesses and 50-page mechanical ledger (2 November 2026)

**Source confirmation:** The facsimile's own combined title leaf (physical PDF p.4) names *Taqrīb al-Marām* by al-Sanandajī, *Ḥāshiyat al-Muḥākamāt* by Muḥammad Wasīm al-Kurdistānī, **and other scattered marginal notes by additional scholars**. Therefore the ḥāshiya must be translated from the **same PDF**, but not every lower-register remark can be attributed automatically to Wasīm. The three typographic levels can contain distinct editorial voices.

**New paired II:117 record:** `wasim-II117.js` now aligns three separate elements **on the same printed page**: (1) a selected Sanandajī running-text excerpt; (2) the embedded lemma «ويجب زوال ضده»; and (3) the independently attributed Wasīm gloss on *taʾaththur* (being affected by origination). Toggle behavior is layer-specific; the selected main excerpt contains explicit ellipses and is not a full-page translation. See `editorial/2026-11-02_wasim_II117_source_match.md`.

**New first-50-page segment ledger:** `editorial/2026-11-02_I81-I130_50page_layer_coverage.csv` and companion README. This separates Sanandajī working account, full Arabic transcript, all lower-register texts, positive Wasīm attribution, and critical certification for each of **50 printed pages**. The requested segment I:81–130 currently has **20/50 = 40%** of pages with **some abbreviated English first-pass account**, and **0/50 = 0%** fully translated with every gloss. Do **not** describe 40% as translated.

**Global some-English proxy:** I:8–100 = **93/632 = 14.72%** of scan image count with at least some provisional Sanandajī English. This is only a page-presence measure; no reliable word-count completion percentage can currently be asserted. **Critical certification: 0%** of scanned pages. **Wasīm completion:** cannot be quantified without enumerating all his note-units.

**New marginal snippets:** Four additional lower-register extracts, I:94, 96, 98, 100, beyond the five earlier new first-pass marginal guides, making **nine partial unassigned note records** across I:81–100. Each is an explicitly selected excerpt, and some still require literal reading correction. They remain separate from the independently attributed Wasīm II:117.

**QA:** All 10 referenced JavaScript files compile without parse errors, the HTML contains three language buttons and five layer switches, no duplicate DOM IDs, and all 50 recovered I:13–62 headings are present. These are static checks; full real-device interaction, accessibility and print-preview browser QA remains to be performed before declaring a definitive release. The active GitHub feature branch is `feature/taqrib-layered-reader-2026-11-02`.

**Immediate continuation:** I:101–110 (upper commentary and lower notes together), while creating individual gloss IDs/incipits for Wasīm and explicitly unidentified additional notes. No changes to the Tahdhīb matn branch. Neither stream should be merged into the eventual three-layer critical edition before both achieve full text and verified attribution.


---

## 11. Stage 04 — substantive next source batch I:101–130 (2 November 2026)

**Authoritative predecessor:** Stage 03 above. Stage 04 does **not** redo I:8–100, the earlier I:13–62 fifty-page draft, the distinct `Risāla fī Muhimmāt Masāʾil al-Iʿtiqād`, or the independently developed Tahdhīb matn.

- **Source witness:** the same photographed 632-page printed two-volume `taqribmaram.pdf`. Printed vol. I **pp.101–130** = **physical PDF pp.114–143** (30 images inspected). Original pagination and note-rule geometry maintained.
- **New source-facing JS:** `firstpass-I101-I115.js` and `firstpass-I116-I130.js`, stable IDs `P1.101`–`P1.130`. Together they contain 30 argued English page-level preliminary renderings, each with a short Arabic selected anchor, source locator and warning that **a full literal translation is NOT supplied**.
- **New complete portable textual handoff for these readings:** `editorial/2026-11-02_FIRSTPASS_I101-I130.md`; *complete here means all 30 of these provisional working records, not completeness of the Arabic source.* This has page-by-page English and short Arabic anchors, with 13 new lower-register selected notes flagged **unassigned**; not one is automatically Wasīm.
- **One particularly important reading:** p.104 describes **two extrinsic necessities** flanking contingent existence, `وجود الممكن محفوف بوجوبين`, not two antecedent or subsequent nonexistences. I:106 specifies that choice is part of the complete cause, `وهذا لا ينافي الاختيار لأن الاختيار من تمام العلة`. Log the distinction in any future clause verification.
- **Theological transition:** I:109 opens the *qidam/huduth* discussion, I:114–117 differentiates temporal from other forms of precedence, I:118–123 treats unity, plurality and genuine union, and I:124–130 distinguishes conceptual from extramental differentiation in the divine-attribute debate.
- **50-page target I:81–130:** **50/50 printed pages have SOME abbreviated English working account** (100% *page-presence*, not translation). `editorial/2026-11-02_I81-I130_50page_layer_coverage.csv` now marks all 50 as image-inspected, **0** fully transcribed Arabic, **0** complete literal sharḥ translations, **0** pages with all ḥāshiya notes translated, **0** critically certified. There are **22 partial unassigned lower-register anchor records** across I:81–130 (9 predecessor + 13 new), but they are not the full marginal layer.
- **Workstream boundary:** one positively attributed Wasīm excerpt II:117 remains as before. No trustworthy Wasīm corpus denominator yet exists, so no % of his ḥāshiya is claimed.

## 12. Stage 05 — extend into the chapter on opposition and four causes, I:131–140

- **Further source images inspected:** printed vol. I **pp.131–140**, physical scan **pp.144–153** (10 pages).
- **New files:** `firstpass-I131-I140.js` and `editorial/2026-11-02_FIRSTPASS_I131-I140.md`. Stable IDs `P1.131`–`P1.140`; these are again **abbreviated first readings, not complete translations**. The lower margin is not translated completely.
- **Argument transitions:** psychological/essential attributes and non-identity I:131–132; *taḍādd* and the criterion 'in one subject and one respect' I:133–135; the four divisions of opposition—contradiction, contrariety, privation/possession, correlatives—I:136–137; new `فصل في العلة والمعلول` I:138; material and formal causes I:139; efficient/final causes and conditions I:140.
- **Cumulative new images in Stages 04–05:** **40** consecutive printed pages I:101–140. They extend, but do not replace, existing I:8–100 material.
- **Global SOME-English page-presence proxy:** **I:8–140 = 133 printed main-text pages**, or **133/632 physical scanned image pages = 21.04%**. This is explicitly a heterogeneous *proxy*, not the percentage of Arabic words or of either author's complete text translated.
- **Complete dual-layer page critical certification:** **0/632 = 0%**, no change. Total Wasīm-note translation percentage remains uncomputed. Selections, summaries, literal complete translation and independent verification are different statuses.
- **Reader:** NAMA URL `https://gnamma-research.github.io/booksite/texts/al-sanandaji/taqrib-al-maram/` now loads all three newly added JS files; preserves language and layer toggles, two-column ordering, full/focus reading, original static archives and separate author attribution. No Tahdhīb text data modified.

### Required next-stage protocol

Continue source-image inspection and *abbreviated initial orientation* at **I:141–160**, then the remaining two volumes, keeping source layers separate. In parallel—or immediately after broad coverage—undertake a genuine **Pass 1 full transcription/full English** by clause in each register, plus **Pass 2 independent visual proof**, **Pass 3 witness collation**, **Pass 4 argument, terminology and author-identification review**. Do not permit earlier 'first-pass page account' entries to masquerade as complete authored text. Pay special attention to negations, changes of interlocutor (qāla/qīla/uʿturiḍa), modal and causal particles, embedded Taftāzānī lemmata, and where a lower-register note crosses the page boundary.

### Source and numerical reproducibility

- Master source `taqribmaram.pdf`, 632 physical scanned leaves; edition reproduction date and original 1318–1319 AH title information retained separately.
- For all new volume I intervals, pdf_page = printed_page + 13; independently re-check after a bound-volume transition.
- **Cumulative new JS:** `firstpass-I101-I115.js`, `firstpass-I116-I130.js`, `firstpass-I131-I140.js`; no older JS rewritten.
- **New MD:** `editorial/2026-11-02_FIRSTPASS_I101-I130.md` and `editorial/2026-11-02_FIRSTPASS_I131-I140.md`.
- **Next:** I:141, image PDF p.154, no completion claim.


### Four direct-language translation specimens added after Stage 05

`source-selected-I106-I140.js` and `editorial/2026-11-02_DIRECT_ARABIC_ENGLISH_EXCERPTS.md` now preserve **four continuous selected upper-register Arabic–English translations**, not merely page-topic summaries: I:106 on choice in complete causality; I:125 on separability in intellect versus external being; I:139 on formal/material causes; I:140 on causes of quiddity versus existence. First-pass Arabic readings were inspected at physical source PDF pp.119, 138, 152 and 153. No second-witness collation is claimed, and **0 complete pages** remains correct. The NAMA reader loads these four as additional source selections alongside, not replacing, their original page-level first-pass guides. Lower-register notes on these pages remain incompletely translated and are not assigned automatically to Wasīm.

---

## 13. Stage 06 — full source-page crosswalk and continuation I:141–160 (2 November 2026)

### A. Source text and pagination correction

The source scan is **632 physical PDF images**, but the combined *numbered main text* consists of **volume I pp.1–280 and volume II pp.1–335 = 615 numbered pages**. Source image p.14 is printed I:1, source image p.293 is I:280, p.294–295 are the volume I index, p.296 is printed II:1, and p.630 is II:335. Other image positions are preliminary/cover leaves. Source layout has been checked at the volume boundary and at both ends. Earlier percentages computed over 632 image leaves were simply **image-page presence proxies**, not the percentage of the printed two-volume text translated.

Authorial layers remain **(a)** al-Taftāzānī lemmata embedded in the commentary, **(b)** Sanandajī upper running sharḥ, **(c)** Muḥammad Wasīm al-Kurdistānī's attributable *Ḥāshiyat al-Muḥākamāt*, and **(d)** miscellaneous lower-register notes that the title page expressly ascribes to additional writers. Do not convert all text below the rule into Wasīm without positive attribution. His II:117 fragment is still the only individually corroborated material in the dedicated Wasīm layer.

### B. New source-reading contribution

- **I:141–160 / physical PDF pp.154–173:** twenty additional source-image inspected, meaning-oriented English page accounts with limited Arabic anchors. JS `firstpass-I141-I160.js`; cumulative Markdown `editorial/2026-11-02_FIRSTPASS_I141-I160_AND_DIRECT_CLAUSES.md`.
- **Six new manually transcribed short Arabic–English selections** on printed I:141, 142, 150, 156, 157 and 158, saved as `source-selected-I141-I158.js` and in the Markdown. These are **real selected clauses**, not complete-page translations or critical diplomatic transcriptions.
- Argument order of new pages: complete versus incomplete causes; effect's necessity when the efficient cause and its conditions are complete; whether a numerically one effect demands one cause; the philosophers' thesis about what can proceed from the absolutely One; the agency/receptivity distinction; finite bodily powers; proof against circular causation and regress through the totality of contingent beings.
- Principal upper text on I:157–159 occupies very little page area, while small-type marginal disputation fills most of the page. Hence **translation of the principal commentary alone is not a valid measure of the combined Sanandajī–Wasīm work's completion**.

### C. Cumulative material preserved, not retranslated

- Existing 50-page English interpretive draft I:13–62 and its original Markdown archive.
- I:63–80 previous partial working accounts.
- I:81–140 prior source-image first readings and direct selected quotations.
- Wasīm II:117 source-matched provisional passage with separately indicated selected Sanandajī context.
- Independent Tahdhīb matn work in the other chat remains untouched. No three-layer merger has been attempted.

### D. Honest quantitative report

| Metric | Status |
|---|---|
| Entire numbered combined source **located/indexed** | **615/615 = 100% source pagination**, NOT translated |
| Vol. I pages represented by **some** preliminary English | **I:8–160 = 153 pages** |
| Page-presence fraction relative to both printed volumes | **153/615 = 24.88%**, NOT translation completeness |
| Individually positively identified Wasīm note examples | **One located excerpt on II:117**, no reliable denominator for all his note-units |
| Complete, line-by-line dual-register English for each printed page | **0/615 formally certified as complete** |
| Independently source-collated and critically definitive pages | **0/615 = 0%** |

Do not infer from 24.88% that 24.88% of original Arabic words has been translated. In several previous records, selected quotations and general meaning notes omit most of the page, and all of its lower apparatus.

### E. Source registry, website and downloads

- **Source atlas:** `texts/al-sanandaji/taqrib-al-maram/source-atlas.html`, with client-side volume/status filtering and exact PDF position.
- **Complete 615-row CSV:** `editorial/2026-11-02_COMPLETE_615_PRINTED_PAGE_SOURCE_REGISTER.csv`.
- **New reader layers:** `firstpass-I141-I160.js`, `source-selected-I141-I158.js`.
- **New manuscript:** `editorial/2026-11-02_FIRSTPASS_I141-I160_AND_DIRECT_CLAUSES.md`.
- **Original facsimile packet:** I:141–160 image pages may be distributed in the separate local source PDF; it must not be mistaken for the translation.
- **Public NAMA route:** `https://gnamma-research.github.io/booksite/texts/al-sanandaji/taqrib-al-maram/`. Real deployment and device-browser QA are not yet checked in this stage; static source and syntax checks are separate from a claim of live release success.

### F. Mandatory continuation

A complete first translation pass means **every clause** of the upper Sanandajī prose and **every separately attributed marginal annotation** in both volumes. The current rapid reading pass has **not** achieved that standard. The next image interval is **I:161–180 (PDF pp.174–193)**. It must preserve interruption of arguments at page boundaries, explicit Arabic speaker indicators, lemma boundaries, marginal incipits, and honest status of any uncertainty. After broad source coverage, execute the full literal pass, independent second reading, witnesses and variant collation, and final critical revision. No merger into the independent Tahdhīb matn before both projects are genuinely critically definitive.


---

## 14. Stage 07 — I:161–200, integrated source-reading and first direct excerpts (2 November 2026)

**Canonical source:** previously uploaded two-volume combined facsimile `taqribmaram.pdf`, 632 scanned image pages (no embedded digital text). Original printing numbered text pages: I:1–280 and II:1–335 = **615 printed pages**. For all new pages in this stage: printed I:p = PDF physical p+13. The 40 originals inspected are images **174–213**, supplied separately as an unchanged 40-page Arabic facsimile extract. A searchable OCR has not been taken as a verified Arabic witness.

### A. Content and original page sequence

- **I:161–164:** *burhān al-taṭbīq* and the comparison of purportedly endless series of causes and effects; problem of numerical excess, correspondence and the difference between an imagined comparison and actual dependence.
- **I:165–166:** matter, form and recipient; the distinction between agent and receptive subject, and the interpretation of contingent secondary efficacy as customary conjunction.
- **I:167:** **الباب الثالث في الأعراض** (the third major division: accidents) — exact book boundary is preserved.
- **I:168–170:** categories of accidents (nine highest categories by inductive enumeration), sensible and relational descriptions, individuality and the alleged possibility of one accident existing in two substrates.
- **I:171–178:** whether an accident can migrate between bearers; persistence, ceasing-to-be, renewed states, and arguments for or against the continued existence of accidents.
- **I:179:** **فصل في بيان الكم** (quantity) — second chapter boundary preserved.
- **I:180–183:** discrete quantity, number, continuous magnitude, line, surface, body and the difference between actual versus possible division.
- **I:184–192:** time, its successive parts and their apparent absence at the present; temporal precedence without a second time; time as a measure of motion and objections to its independent existence.
- **I:193:** **فصل في المكان** (place) — exact new section marker.
- **I:194–200:** rival analyses of place as surrounding surface, measurable extension, or void; body-to-body contact and displacement of air/water; the water-in-a-tube example.

### B. New source-facing files and exact completion level

The following are new and have no overlapping original unit IDs with earlier I:8–160 material:

1. `firstpass-I161-I170.js`, `firstpass-I171-I180.js`, and `firstpass-I181-I200.js`: **40 newly source-inspected printed pages** with stable IDs `P1.161` to `P1.200`. These contain **meaning-oriented first readings** of the upper argument, with short Arabic anchors where safely recoverable, **NOT complete literal translations**. Some pages have many lines of untranslated printed commentary or marginal disputation.
2. `source-selected-I161-I180.js` and `source-selected-I181-I200.js`: **22 short selected Arabic–English translations from the upper printed register**, plus **six short translated lower-register fragments** whose individual authorship remains **UNASSIGNED**. Exact authorial allocation of embedded lemmata also awaits line collation.
3. `editorial/2026-11-02_STAGE07_I161-I200_SOURCE_AND_TRANSLATION.md`: the entire new source-facing dossier, generated from the five JS sources above. Includes all 40 English page readings, their short Arabic anchors, all 22 direct bilingual selections and all six lower-register excerpts. **This is a complete record of the provisional new work, not a complete translation of the forty source pages.**
4. `editorial/2026-11-02_STAGE07_I161-I200_LAYER_LEDGER.csv`: one row per printed page with separate counts for upper direct extracts, unassigned lower excerpts, complete transcription, Wasīm-specific attribution, critical review and translation completeness. Every row explicitly remains incomplete.
5. `editorial/2026-11-02_COMPLETE_615_PRINTED_PAGE_SOURCE_REGISTER.csv`: existing full 615-page crosswalk was updated for I:161–200, retaining all other records. No previously translated page was retranslated.
6. `index.html`, `reader-layered.js`, and `source-atlas.js`: load and display the new records using the existing NAMA dual-column and author-layer controls. The source atlas and the reader now use the same printed-page coverage checkpoint.

### C. Important factual correction to the previous fast pass

Immediately before entering Stage 07, directly checking I:165, I:169 and I:170 identified errors in earlier *selected Arabic anchors* and in the provisional summary of I:169. I:169 enumerates **nine categories of accidents**, not a discussion primarily enumerating divine attributes. The earlier JS has been corrected with an explicit GitHub commit; the register treats those as correction-only, not new translated material. This is why first-pass page summaries must not be certified merely from topical resemblance or OCR.

### D. Coverage with honest denominators (supersedes Stage 06)

| Measure | Stage 07 status |
| --- | --- |
| Full source pagination indexed | **615/615 = 100%**, a bibliographic locator achievement, NOT translated text |
| Volume I with **some** preliminary English (I:8–200) | **193 distinct printed pages**, 193/615 = **31.38% page presence** |
| New pages with first-pass *interpretive guide* | **40** (I:161–200) |
| New selected direct upper-register excerpts | **22** (short passages) |
| New translated but **author-unassigned** lower-register excerpts | **6** (short passages) |
| Newly positively attributed Wasīm glosses | **0**; the preceding source-matched fragment II:117 remains |
| Independently critically certified **complete page** with all sharḥ and all marginal commentary | **0/615 = 0%** |

The **31.38%** value is deliberately labelled *pages with some provisional English*, not the fraction of original Arabic words translated. It is not a quantitative measure of either the full Sanandajī sharḥ or Wasīm's ḥāshiya. No reliable Wasīm-specific denominator of individual marginal notes has yet been established.

### E. Multi-pass execution protocol

- **Pass 0 (rapid):** broad direct source-image reading; cite printed page and register main versus marginal layers; publish an interpretive guide without claiming completeness. Continue I:201–220 next (physical PDF images 214–233), then the remainder of volume I and volume II.
- **Pass 1 (full-text):** manually transcribe each and every Arabic clause in the larger Sanandajī text and lower annotations, preserve all connective particles and nested objections; translate every clause, including substantial marginal passages, with stable IDs and source joins. Every printed page must have a text coverage check.
- **Pass 2 (independent verification):** second separate facsimile reading; log illegible letters, negation/affirmation, speaker attribution, omitted marginal lines, pagination transitions, and translation reversals.
- **Pass 3 (witness collation):** compare the original Cairo printing and reproduction with independent accessible witnesses; maintain manuscript or print variant records and source provenance.
- **Pass 4 (critical interpretation):** check terminology, *qāla/aqūlu/uʿturiḍa* speakers, the philosophical argument, quoted authors, and precise distinction between Wasīm's *Muḥākamāt* and miscellaneous third-party ḥawāshī.
- **Pass 5 (publication QA):** Arabic–English print/PDF parity, mobile/desktop layout, all controls, keyboard access, gloss toggles, source citations, duplication and checksum audits. Only full completion + specialist approval warrants the label 'critically definitive'.

**Merge policy remains:** the independent al-Taftāzānī *Tahdhīb* project is not edited, overwritten or integrated as the canonical matn until both the Sanandajī–Wasīm stream and the separate matn stream meet their own critical publication gates. Embedded matn lemmata may still be shown in the independent Taqrīb reader as clearly marked quotations.

### F. Next exact handoff checkpoint

**Printed I:201**, source PDF **physical p.214**, continuing the discussions of place and void. The next release must provide separate statistics for (1) new pages inspected, (2) first-pass orientations, (3) actual Arabic words transcribed and directly translated, (4) complete text coverage, (5) named Wasīm note units, (6) unattributed marginal notes, and (7) critically certified pages. Maintain a cumulative and non-destructive handoff each time.


---

## 15. Stage 08 — further source-first continuation I:201–220 (2 November 2026)

The **same** supplied 632-page source-image PDF is the witness. This new set is 20 numbered printed pages I:201–220 = scanned physical PDF pages **214–233**. Every source image was inspected in sequence. The marginal apparatus remains part of the same combined print but is not silently attributed to Wasīm.

### Source and argument sequence

- I:201 opens the classification of *kayf* as accident with respect to the divisibility and relational predication characteristic of other kinds.
- I:202–205 develops the sensible qualities, heat/cold, elemental properties and natural tendencies.
- I:206–211 considers visible qualities, colour, light, theories of whiteness and blackness, rays and the conditions of visual perception.
- I:212–216 concerns sound, hearing, the physical production of sound and its relation to letters, speech and articulation.
- I:217–220 moves into the other tangible qualities, psychical dispositions, the animal faculties, knowledge/power/will, and *rūḥ*.
- These are editorial **meaning-oriented first readings**, not a claim that the Arabic main text or all lower-register notes have been completely translated.

### New files and direct translation

- `firstpass-I201-I220.js`: **20** new printed-page English preliminary reading records, with short source-image Arabic anchors and complete source locators. Stable IDs `P1.201`–`P1.220`.
- `source-selected-I201-I220.js`: **ten** short upper-register direct Arabic–English selections, one further translated **lower-register excerpt** (sound external to sensation, I:212) with **unverified individual author**.
- `editorial/2026-11-02_STAGE08_I201-I220_SOURCE_AND_TRANSLATION.md`: source-facing Markdown generated from those two JS files, keeping the same text content as the reader.
- `editorial/2026-11-02_STAGE08_I201-I220_LAYER_LEDGER.csv`: precise source-page and text-layer incompleteness record for I:201–220.
- `editorial/2026-11-02_COMPLETE_615_PRINTED_PAGE_SOURCE_REGISTER.csv`: source index updated on exactly 20 original rows and all other rows preserved.
- `index.html`, `reader-layered.js` and `source-atlas.js`: display the I:201–220 corpus and new page-presence metric.

### Stage 07 + 08 combined, this turn

- **60** newly image-inspected numbered printed pages: I:161–220, source PDF physical pages **174–233**. None duplicates the previous I:8–160 material.
- **60** numbered page-level preliminary English accounts, not complete literal translation.
- **32** selected upper-register Arabic–English translations, each **short**.
- **Seven** selected lower-register excerpts translated, but **unassigned** to a named marginal commentator until further source evidence.
- Existing **one independently attributed Wasīm II:117** passage unchanged; Wasīm unit-denominator still unknown. Do not describe seven unidentified marginal passages as seven Wasīm translations.

### Cumulative quantitative state — replace older denominators

| Measure | Updated Stage 08 |
|---|---|
| Numbered printed pages source-indexed | **615/615 = 100% source navigation** |
| Pages with at least some provisional English upper argument | **I:8–220 = 213 distinct printed pages** |
| Page-presence percentage of both numbered volumes | **213/615 = 34.63%** (NOT fraction of source text translated) |
| Pages with entire main and all marginal registers literally translated and certified | **0/615 = 0%** |
| New authenticated Wasīm notes in these 60 pages | **0** |
| New unattributed lower-register translated excerpts | **7** |
| Next original page to inspect | **I:221 / physical PDF p.234** |

**Critical caveat:** full source word and note coverage remains unsolved even for many earlier pages with English. The high page-presence figure measures the geographic breadth of the initial scholarly reading, not the achievement of a finished translation. A source text with 90% of a page omitted cannot be considered a translated page.

### Specific corrections and quality gates

1. The source-checked I:208 Arabic anchor was reduced to the securely visible phrase `مخالطة الضوء للأجسام الشفافة` after rejecting a doubtful introductory verb. The revision is recorded in the GitHub history rather than concealing the correction.
2. In the transition from I:200 to I:201 do **not** treat the later section as merely a continued dispute about void. The printed text shifts into **quality and sensible properties**.
3. The order of the major category discussion must be retained: I:167 accidents, I:179 quantity, I:201 quality, before subsequent categories.
4. The full Wasīm and other marginal-note corpus must be enumerated by independent note IDs, incipits, source volume/page, and author attribution before a valid Hashiya translation percentage can be stated.
5. Continue the preliminary direct-image pass at I:221–240, **then** the rest of the print. Later passes must produce full Arabic transcription, clause-complete dual-layer English, independent text proof, edition collation and specialist critical review, replacing provisional summaries rather than falsely certifying them.

**The independent al-Taftāzānī Tahdhīb matn in the other chat has not been modified** and remains excluded from a premature definitive three-layer merger.


---

## 16. Stage 09 — mental existence, cognition, assent, will and power (2 November 2026)

**Authorial and project boundaries remain unchanged.** The combined 632-image two-volume PDF contains Sanandajī's *Taqrīb al-Marām*, Muḥammad Wasīm al-Kurdistānī's *Ḥāshiyat al-Muḥākamāt*, embedded lemmata from al-Taftāzānī and additional marginal notes by other authors. This project translates the **Sanandajī and Wasīm layers together** but keeps them *separate from the independent Tahdhīb matn project*, and cannot attribute a given note to Wasīm merely because it is below the dividing line.

### A. Exact source and significant textual correction

- **New source segment:** original printed **volume I:221–240**, source PDF physical pages **234–253** (20 pages). All twenty original image pages were individually inspected, not only the generated contact sheets. The PDF has no embedded machine-readable text.
- **Critical layout fact:** printed **I:222 / physical PDF p.235** has **no new Sanandajī upper-register paragraph**. The entire page is a continuation of the previous small-print marginal discussion. Therefore it is recorded as `marginal_continuation_only_no_upper` in the canonical 615-page register and shown by default with no sharḥ paragraph. Enabling the **Unattributed marginalia** layer displays the short translated fragment there. It must not be credited to Sanandajī or automatically to Wasīm.
- The source images have mixed upper/lower layouts: e.g., I:225 and I:233 have only a few lines of upper text above long marginal discussions. Do not pretend that translating the upper few lines completes the page. Other pages may have running text through most of their area; visual attribution depends on actual layout, not a rigid page-height threshold.

### B. Philosophical sequence preserved

- **I:221–226:** apprehension (idrāk), knowledge by presence (*ʿilm ḥuḍūrī*), form/image in mental existence, competing accounts of cognitive correspondence, and the proposal that cognition is a mere relation between knower and known.
- **I:222:** full-page marginal continuation debates mental representation; its opening reports two schools known as **ahl al-ḥaqīqa** and **ahl al-shabaḥ**. The translator must not flatten these positions into the same one.
- **I:227–229:** four kinds of apprehension: *iḥsās*, *takhayyul*, *tawahhum*, *taʿaqqul*; distinction of individual sensible form from abstract intelligible content, then certainty and assent.
- **I:230–233:** simple/compound ignorance, acquired and immediate knowledge, possibility of changing cognitive status, and whether created knowledge multiplies when its objects multiply.
- **I:234–240:** where knowledge is located, will (*irāda*), appetite and aversion, rival theological accounts of will, capacity/power (*qudra*), and obligation beyond capability (*taklīf bimā lā yuṭāq*).

### C. New files and translation counts, carefully qualified

1. `firstpass-I221-I240.js` contains **20 page-specific brief argument synopses or, in I:222, a marginal-only page locator**, with source-image positions and explicit `layout` and `quality` metadata. These are *not continuous source translations*, and short Arabic anchors are not full transcriptions.
2. `source-selected-I221-I240.js` contains **16 short source-based Arabic–English translations from the upper printed text** and **three short marginal excerpts**, all individually UNASSIGNED pending independent authorship attribution. Some upper text may be quoted Taftāzānī lemmata; that split also requires later source-proof.
3. `editorial/2026-11-02_STAGE09_I221-I240_SOURCE_AND_TRANSLATION.md` was generated from the two JS sources. It preserves all twenty page records and the exact 19 short direct translated selections, avoiding independently rewritten but divergent English.
4. `editorial/2026-11-02_STAGE09_I221-I240_LAYER_LEDGER.csv` records one original page per row, whether any upper/main text is present, number of short translated segments, unknown marginal authorship and remaining literal/critical work.
5. `editorial/2026-11-02_COMPLETE_615_PRINTED_PAGE_SOURCE_REGISTER.csv` updates **exactly twenty** records, including the special marginal-only I:222 status, leaving the 595 other numbered page records unchanged.
6. NAMA `index.html` adds the two JS records; `reader-layered.js` and `source-atlas.js` report the revised page presence and explicitly handle I:222 as lower-register-only.

### D. Cumulative metrics (Stage 09; do not confuse denominators)

| Metric | Current verified status |
|---|---|
| Numbered printed source-page locator entries | **615/615 = 100% indexed**, NOT translated |
| Pages in continuous I:8–240 interval **with some English** | **233/615 = 37.89%** *page-presence proxy*, not translated words |
| Of those 233, pages with any upper-running-text account | **232** (I:222 is marginal-only) |
| New short upper-register direct translations | **16** short selections (NOT full pages) |
| New short lower-register direct translations, individual author unassigned | **3** |
| New fully verified Wasīm glosses | **0**, separate pre-existing II:117 source match unchanged |
| Entire upper commentary + every lower marginal note, complete, verified and critically certified | **0/615 = 0%** |

A full source-English word alignment and complete count of **Wasīm's actual marginal units** have still not been established. Therefore a reliable percentage of *the text translated*—rather than the number of pages represented by at least some provisional English—**cannot yet be reported**.

### E. Required continuation and multistage critical method

- Next **rapid source-image** interval **I:241–260 / PDF physical pp.254–273**, respecting marginal-only leaves, source registers, authorial flags and uncertain readings. No prior already translated material should be redone.
- **Pass 1** must be a complete clause-by-clause transcription and English translation of both all upper-running Sanandajī prose and all marginal ḥāshiya from original images, with numbered incipits and the author of each note when demonstrated. Do not equate the brief Pass 0 guides with a completed first translation pass.
- **Pass 2:** independent visual Arabic verification of every word, especially negations, modal particles, reported opponent/reply formulas, and page-boundary continuations.
- **Pass 3:** collate another print or manuscript witness and record genuine variants without silently normalizing.
- **Pass 4:** argumentative and terminological scholarly revision, including individual gloss authorship. Check the theory of mental existence against the detailed sources rather than substituting generic epistemology.
- **Pass 5:** mobile, desktop, print/PDF bilingual alignment QA, reader controls, citation copying and preservation tests. Only fully complete and checked work may be labelled definitive.

**No merge** with the independent Tahdhīb matn translation until both standalone streams are critically definitive. The new GitHub changes affect only `texts/al-sanandaji/taqrib-al-maram/` in `gnamma-research/booksite`.


---

## 17. Stage 09B — I:241–260, continued rapid direct-image reading (2 November 2026)

**Authoritative predecessor:** Stage 09 §16 above. The earlier source text and direct translations remain unchanged. This stage adds twenty consecutive printed pages **I:241–260**, physical PDF **254–273**, from the same combined Sanandajī–Wasīm facsimile. Each image was inspected; no automated OCR has been treated as source-certified Arabic.

### New content and argumentative sequence

- **I:241–243:** disputes about human power (*qudra*) and whether ability is simultaneous with, precedes, or is prevented from issuing in action; disagreements between Muʿtazilī and Ashʿarī accounts.
- **I:244–249:** kinds of quality and oppositions, pleasure and pain, intellect versus sensation, health and illness, colours, surface, figure, angles and preparedness as qualities.
- **I:250:** exact new chapter boundary **«فصل في الأين»**. This initiates the category of spatial occupancy or "where", not a continuation of sensory quality.
- **I:251–253:** a body's occupancy of a spatial region, movement into another, and related accounts of motion and rest; several pages have very short upper discussion and extended marginal debate.
- **I:254–260:** *akwān* of motion, rest, conjunction and separation, numerical unity of a particular spatial state, successive occupancies, philosophical gradual transition from potentiality to actuality, the temporal instant, intermediate motion between origin and destination, and the four categories of change in place, posture, magnitude and quality.

### New committed files

- `firstpass-I241-I260.js` — **20 new page-specific argument guides** and short Arabic anchors; status intentionally **interpretive first reading, NOT whole-page English**.
- `source-selected-I241-I260.js` — **15 short selected upper-register Arabic–English translations**, containing only visibly read words from the source. Individual embedded matn lemmata need later author-level collation.
- `editorial/2026-11-02_STAGE09B_I241-I260_SOURCE_AND_TRANSLATION.md` — synchronized Markdown generated from the new JS records. Contains 20 guides and 15 short translations, not complete source coverage.
- `editorial/2026-11-02_STAGE09B_I241-I260_LAYER_LEDGER.csv` — twenty page-level records preserving their uncompleted upper, lower and Wasīm layers.
- `editorial/2026-11-02_COMPLETE_615_PRINTED_PAGE_SOURCE_REGISTER.csv` — the previous complete 615-page register has been updated for **exactly twenty** new I:241–260 rows, with the marginal-only I:222 exception retained.
- `index.html`, `reader-layered.js` and `source-atlas.js` — NAMA reader, full page atlas, and public site now recognize both Stage09A and Stage09B.

### Stage 09A+B combined and revised cumulative totals

| Measure | Stage 09B checkpoint |
|---|---|
| Source pages newly image-inspected this turn | **40 consecutive original pages, I:221–260** (PDF 234–273) |
| New page-identified English first-reading records | **40**, of which I:222 is lower-only |
| New short direct upper-register Arabic–English selections | **31** (16 in A + 15 in B) |
| New short translated lower-register selections of unverified individual authorship | **3** (all in A; **0** in B) |
| NEW independently authenticated Wasīm notes | **0** (previous II:117 attribution remains) |
| Source index completeness | **615/615 original numbered printed pages indexed, 100% bibliographic** |
| Pages having **some** English in I:8–260 | **253 of 615 = 41.14% page presence**, NOT the portion of text translated |
| Of those 253 pages, with any preliminary upper text account | **252** (I:222 marginal-only) |
| Complete, independently verified upper running commentary AND every lower marginal note | **0/615 = 0%** |

Do not claim that 41.14% of the two-volume work is translated; it means only that a corresponding printed-page record contains at least some English guidance or direct selected text. For many pages the actual Arabic running text and extensive marginal prose remain mostly untranscribed. A meaningful **Wasīm-specific translation percentage requires locating and attributing all of his individual notes**, not merely counting printed pages.

### Next checkpoint and critical policy

Next interval: **printed I:261–280 / original facsimile physical PDF images 274–293**, which completes **volume I**. Thereafter PDF images **294–295** carry index material and **volume II printed p.1 is physical PDF image 296**. Retain the precise page-map change across the transition, and do not apply the +13 offset to volume II.

Repeat the same *rapid argument-based source survey* across the unexamined source, but keep its status lower than a full translation. Later complete the whole main commentary and marginal ḥāshiya in a **literal Pass 1**, perform independent source-by-source sentence verification (Pass 2), variant collation and author-identity checks (Pass 3), philosophical/terminological review (Pass 4), and bilingual NAMA/PDF publication QA (Pass 5). No integration into the separately translated al-Taftāzānī *Tahdhīb* matn until both independent streams are truly critically definitive.


---

## 18. Stage 10 — volume I concluded; volume II substantive start, II:2–20 (2 November 2026)

### A. Scope and source control

Source is the **same 632-image scanned combined *Taqrīb al-Marām* / *Ḥāshiyat al-Muḥākamāt*** supplied by the user and previously used throughout. Each photographed page has been visually inspected for this stage; ordinary PDF extraction returns no selectable Arabic. **Nothing already translated on I:8–260 or II:117 has been retranslated.** Changes are limited to the Sanandajī/Wasīm standalone NAMA reader directory; the independently translated al-Taftāzānī *Tahdhīb* matn remains untouched.

- **Volume I printed I:261–280 = PDF physical 274–293:** 20 new preliminary English argument accounts, 16 direct short Arabic–English excerpts from selected upper text, and **one short lower-register annotation** with author **UNASSIGNED**.
- **PDF 294–295:** two original volume-I index pages. These are not new translation pages.
- **Volume II's initial leaf, II:1 / PDF 296:** a part-title and introductory provenance/attribution notice. **Not counted as a translated running-commentary paragraph**; it remains mapped as title/paratext.
- **Volume II, first substantive II:2–10 = PDF 297–305:** nine new preliminary page accounts and eight selected direct upper Arabic–English excerpts.
- **Volume II II:11–20 = PDF 306–315:** ten further preliminary page accounts, three selected direct Arabic–English excerpts.
- All PDFs use original facsimile images, not substituted OCR; a source packet `Taqrib_Stage10_I261-I280_and_II1-II20_Original_Facsimile.pdf` (42 contiguous image pages 274–315) is created as an external download.

### B. Argumentative landmarks and critical divisions

**Volume I, motion (I:261–274):** distinction between growth/withering, rarefaction/condensation, and sensory alteration; intrinsic versus accidental motion, natural/violent/voluntary motion; numerical, specific and generic identity of a movement; whether ascending and descending are opposed motions; division by time, fast/slow comparisons, and whether a moment of rest intervenes when a body reverses direction. I:274 tests two movements in one moving body, especially a person or object aboard a moving vessel.

**Volume I, relation and other accidents (I:275–280):** **فصل في الإضافة** begins I:275. It discusses reciprocal reference, fatherhood/sonship, greater/lesser, categories of relatives, relation's extramental or intellectual status and its grounding in actual subjects. By I:279 the text turns to **الوضع** (posture) and, at I:280, **الملك** (having/possession), **أن يفعل** (acting) and **أن ينفعل** (being acted upon). This is the close of the previous division on accidents.

**Volume II, beginning of substances:** the major boundary **الباب الرابع في الجواهر** occurs on **II:2 / PDF 297**, not on the preceding title leaf. Theologians' **divisible body versus indivisible atom** is compared with philosophers' **body as substance capable of three mutually perpendicular dimensions**, and with the concepts of natural and mathematical body. II:6–17 treats actual versus possible divisions, contact and separation, atomist versus hylomorphic interpretations, and arguments based on geometry and motion. **II:18** opens **فصل في أحكام الجزء**, discussing whether an indivisible constituent can receive life and its accompanying qualities; II:19–20 tests arguments from a part lying across a contact joint.

### C. Files committed and what they actually contain

- `firstpass-I261-I280.js`, `firstpass-II002-II010.js`, `firstpass-II011-II020.js`: **39 image-checked substantive page-level interpretive FIRST-READING guides**, not continuous source English and not full Arabic transcripts.
- `source-selected-I261-I280.js`, `source-selected-II002-II010.js`, `source-selected-II011-II020.js`: **27 selected direct short Arabic–English excerpts** (16 + 8 + 3). These are *fragments only*.
- `editorial/2026-11-02_STAGE10_I261-I280_II002-II010_SOURCE_AND_TRANSLATION.md` and `editorial/2026-11-02_STAGE10B_II011-II020_SOURCE_AND_TRANSLATION.md`: synchronized English page guides, direct quotations and notes; each prints the individual source page and critical caveat.
- `editorial/2026-11-02_STAGE10_PAGE_AND_AUTHOR_LAYER_LEDGER.csv`: 40 rows for 20 I pages, one II title leaf, and 19 II substantive pages, with separate status for upper direct quotations, lower author-attribution and complete translation.
- `editorial/2026-11-02_COMPLETE_615_PRINTED_PAGE_SOURCE_REGISTER.csv` updated on exactly these **40 printed page positions**. Every other source row has been retained.
- NAMA `index.html`, `reader-layered.js` and `source-atlas.js` load the new work, preserve Arabic/English/both and distinct lemmata/sharḥ/Wasīm/unassigned-margin filters, and display updated source-page percentages.

### D. Honest cumulative completion — supersedes Stage 09B figures

| Measure | Stage 10 |
| --- | --- |
| All printed page positions in the two-volume crosswalk | **615/615 = 100% indexed**; this includes the II:1 title/notice position |
| Volume I containing at least some provisional English | I:8–280 = **273 positions**; I:222 is a marginal-only page |
| Volume II substantive pages containing some provisional English | II:2–20 = **19 pages** |
| Total page positions with *some preliminary English* | **292/615 = 47.48% page presence only**, NOT 47.48% of Arabic translated |
| New source-inspected substantive pages in Stage 10 | **39** (20 + 19); plus inspected II:1 title page and two index leaves |
| New short directly translated upper-register source excerpts | **27** selected passages |
| New identified direct lower-register excerpts | **one**, with authorship **UNASSIGNED** |
| New positively attributed Wasīm ḥāshiya excerpts | **none**; previously identified II:117 remains separate |
| Pages fully transcribed, translated in both registers and independently certified | **0/615 = 0%** |

**Do not call the 47.48% figure a translation-completion percentage.** Some English appears on many source pages but may cover a tiny fraction of their words, especially large marginal discussions. The actual denominator of **Wasīm's distinct note-units** is not yet known; no valid Wasīm percentage can be supplied.

### E. Next action and source-sensitive priorities

Next unprocessed source-first interval **II:21–40, PDF physical images 316–335**. The following correction and critical translation pass should prioritize **I:275–280 on relation**, **II:2–20 on substantial body and the indivisible atom**, and **all Wasīm/intervening marginal notes** before calling a page complete. For every page, retain photographed text, separate lemma IDs, commentator's running clauses, marginal-note incipits and exact attributed author; translate ALL clauses, not only selected snippets; check negatives, disputant voice and logical particles. Then conduct independent visual proof, witness collation, argumentative review, and PDF/website parity QA. The eventual three-author-layer merger with the independent *Tahdhīb* is still forbidden until both editions are critically definitive.


---

## 19. Stage 11 — printed volume II:21–60, source-image reading and separated lemmata (2 November 2026)

**Authoritative predecessor:** Stage 10 in this document. This continuation does not retranslate or overwrite previous I:8–280, II:2–20 or the independently attributed Wasīm II:117 source fragment; the independent *Tahdhīb* matn in the other chat is untouched.

### A. Original primary source and pagination

- The combined user-supplied facsimile `taqribmaram.pdf`, 632 physical image pages, contains the printed two-volume *Taqrīb al-Marām* with *Ḥāshiyat al-Muḥākamāt* and other marginalia. **Printed volume II pp.21–60 = physical PDF pp.316–355**. All 40 pages were inspected directly as images, with enlarged original views for selected Arabic text.
- The original **40-page unchanged facsimile extract**, `Taqrib_Stage11_II21-II60_Original_Facsimile.pdf`, contains precisely those physical PDF pages. This is a *source facsimile*, not a translated PDF.
- Main register (Sanandajī + quoted Taftāzānī lemmata) and small marginal register (Wasīm + other authors) are never automatically conflated. **No marginal note is assigned to Wasīm based on typography alone**.

### B. Original argument sequence — verified section landmarks

- **II:21** opens **فصل في أحكام الأجسام**, concerning the properties of bodies, the individuality of indivisible parts, and the dispute whether kinds of body differ by substantial forms or by accidents. The preceding atom argument concludes on the same page.
- **II:22–30** covers bodily commonality, specific nature, extension, magnitude, geometric shape and boundaries, the use of correspondence arguments, and the relation between actual and potential divisions. Large stretches of some pages are lower-register critical discussions, not continuous upper text.
- **II:31–38** returns to the proofs, objections and replies on the temporal origination of the world and bodies: being the substratum of originated accidents versus being a contingent product of a freely choosing agent, together with debates over endless succession and regress.
- **II:39** opens **فصل في تقسيم الجسم وبيان أقسامه على ما قالت الحكماء**, setting out the philosophers' natural body as simple or composite, with celestial and elemental simple kinds.
- **II:40–44** extends the historical celestial model, orientation and geometrical motion; do not treat these reports as current astronomy.
- **II:45–49** treats the four elements (fire, air, water, earth), their characteristic properties and associated historical accounts of atmospheric and terrestrial phenomena.
- **II:50** opens **فصل في المركبات التي لها مزاج**, concerning the elements' mixture, the production of a mean quality and the resulting compound temperament.
- **II:51–60** continues debates about qualitative interaction and temperamental balance before proceeding into organismal nutritive, growth and related capacities.

### C. What was added and what was NOT done

- New NAMA modules `firstpass-II021-II040.js` and `firstpass-II041-II060.js`: **40 source-image first-reading guides**, each with an exact printed/PDF locator, explicit textual-layer qualification, and a short Arabic anchor **only where confidently recovered**. **These are synopses, not word-for-word translations of whole pages**.
- `source-selected-II021-II060.js`: **17 selected short upper-register Arabic–English translations**, and **one selected lower-register marginal note on II:39 with author UNASSIGNED**.
- `source-aligned-II031-II039.js`: two additional *paired layer records* at II:31 and II:39, showing the typographically parenthesized quoted lemmata separately from Sanandajī's bridging interpretation. Ellipses explicitly mark omitted original words; no complete-page claim follows. The **matn toggle is based on embedded quotation only**, not a merger with the separately translated Tahdhīb text.
- `editorial/2026-11-02_STAGE11_II021-II060_SOURCE_AND_TRANSLATION.md`: the synchronized source-facing Markdown for the same pages and selected Arabic–English quotations, with the two additional aligned records.
- `editorial/2026-11-02_STAGE11_II021-II060_LAYER_LEDGER.csv`: 40 source-page rows, separate counts for short upper passages, paired matn/sharḥ excerpts, unassigned lower notes, and source-completeness/critical-certification flags.
- `editorial/2026-11-02_COMPLETE_615_PRINTED_PAGE_SOURCE_REGISTER.csv`: **exactly 40** existing II:21–60 entries updated; all other rows preserved. NAMA's `index.html`, `reader-layered.js`, and `source-atlas.js` updated correspondingly.

### D. New completion ledger, with honest denominators

| Metric | At end of Stage 11 |
|---|---|
| Entire printed 2-volume source bibliographically indexed | **615/615 numbered page positions = 100% source indexing** |
| Vol. I page positions with some provisional English | **I:8–280 = 273**, including marginal-only I:222 |
| Vol. II substantive page positions with some provisional English | **II:2–60 = 59**; title-only II:1 excluded |
| Combined page-presence proxy | **332/615 = 53.98%** of pages having at least some provisional English; **NOT 53.98% of original text translated** |
| New preliminary source-page guides | **40** (II:21–60), not complete translations |
| New directly translated short upper-register quotations | **17** |
| New paired matn/sharḥ partial alignments | **2**, II:31 and II:39 |
| New lower-register translated selections, author unverified | **1**, II:39 |
| New independently identified Wasīm note units | **0**; the earlier II:117 remains |
| Complete main + all lower-register text, independently verified and certified | **0/615** printed pages |

**Do not call the reader finished or half-translated.** The page-presence fraction is a locator-level metric; extensive untranslated prose remains even within source pages counted among the 332. The *word-level* first pass and a separately countable Wasīm gloss corpus have not been completed.

### E. Continuing the mandatory multi-pass strategy

1. **Pass 0 — broad first reading:** continue source-image first-reading from **II:61**, physical PDF **356**, without recycling earlier English as new translation. Record page boundaries, clauses confidently read and margin extent.
2. **Pass 1 — genuine full-text translation:** continuously transcribe ALL Sanandajī prose, all embedded lemmas, and **each and every lower-register gloss** as distinct identifiable units with Arabic and complete English, including long objection/reply chains.
3. **Pass 2 — source verification:** second independent reading of every Arabic word, especially negations, conditionals, modalities, speaker labels and continuations across page breaks.
4. **Pass 3 — print/manuscript comparison:** collation of independent edition witnesses, variant reading apparatus and author-level provenance of Wasīm versus additional marginal writers.
5. **Pass 4 — philosophical and theological review:** causality, substances, temporality, elements, `mizāj` and other scholastic concepts; correct mistranslations and reconstruct dialectical context without anachronism.
6. **Pass 5 — publication QA:** same canonical Markdown/JS/PDF text, reader layer toggles, Arabic/English/both, desktop and phone layout, bibliography, searchable page index, print and export checks.

**Three-layer merger with al-Taftāzānī** is deferred until the independent matn stream and this combined Sanandajī–Wasīm work reach full independently justified critical completion.


---

## 20. Stage 12 — faculties, rational soul and separate intellects (2 November 2026)

**Workstream:** Sanandajī’s *Taqrīb al-Marām* and the printed Wasīm *Ḥāshiyat al-Muḥākamāt* in the **same** independent source-facing translation project. The separate al-Taftāzānī *Tahdhīb* matn edition is **not modified**. Existing translations and excerpts are retained and not retranslated.

### Source access and exact boundaries

- **Primary facsimile:** user-uploaded `taqribmaram.pdf` (632 raster images of a two-volume printed work). The new source pages are **printed volume II:61–100 = PDF physical images 356–395**. All 40 pages were directly inspected, with enlarged source crops used for specific Arabic clauses. Raster text was not silently generated from faulty OCR.
- **II:61–63:** powers of vegetation and generation, formation of offspring and the question whether the generative function is one or several faculties.
- **II:64–73:** animal apprehension and movement, external sense faculties, opposed explanations of sight, *al-ḥiss al-mushtarak*, imagination, estimation, memory and the composing faculty. The lower register contains extensive interlocutor-specific objections, mostly untranslated.
- **II:74** opens **«مقالة في المجردات وفيها بحثان»** and the first investigation **«البحث الأول في النفس»**. This is a new major article within the printed book, not an arbitrary modern editorial title.
- **II:75–94:** rational human soul, bodily physiological spirit, perception of universals/particulars, arguments for and against locating intelligibles in bodily organs, and the alleged simplicity of an intellectual subject. Often the first printed lines are a short main-text transition followed by a much longer marginal critical discussion.
- **II:95** opens **«البحث الثاني من المقالة في العقل»** on proposed separate intellects and the philosophers’ rational-cosmological arguments.
- **II:96–100:** hierarchy of intellects, proposed intermediaries and causal plurality. These are typically *reported philosophical doctrines* and objections, not unqualified authorial endorsements.

### New committed source-facing objects

1. `firstpass-II061-II080.js` and `firstpass-II081_II100.js` contain **40 new first-reading page records** (`P2.061`–`P2.100`) with original source locators, only selected reliable Arabic anchors, and short English **argument synopses**. **These synopses do not translate the complete original page**.
2. `source-selected-II061-II100.js` contains **25 short directly translated source-Arabic fragments** from the upper printed register and **two short lower-register excerpts whose individual authorship is UNASSIGNED**. The lower excerpts are not falsely labelled Wasīm and are not entire ḥāshiya units.
3. `source-aligned-II064-II095.js` contains **three explicit source-level alignments** (II:64, II:74, II:95), identifying parenthesized matn lemmata where visible and distinguishing them from Sanandajī’s bridging explanation or new heading. Ellipses indicate omitted source words. It does not merge or overwrite the separately translated Tahdhīb matn.
4. `editorial/2026-11-02_STAGE12_II061_II100_SOURCE_AND_TRANSLATION.md` is the cumulative Stage 12 Markdown dossier generated from these reader objects, containing the full 40-page English first-reading account and the actual short Arabic–English translations, with independent textual status flags.
5. `editorial/2026-11-02_STAGE12_II061_II100_LAYER_LEDGER.csv` is a forty-row source-witness ledger separating selected translation counts, unassigned margins, paired alignment, full-text completeness and critical verification.
6. `editorial/2026-11-02_COMPLETE_615_PRINTED_PAGE_SOURCE_REGISTER.csv` has been updated on exactly 40 existing `II:61`–`II:100` rows, without modifying other source positions.
7. NAMA `index.html`, `reader-layered.js` and `source-atlas.js` now expose Stage 12 with independently controllable Arabic, English, dual columns, Sanandajī running text, embedded lemmata, identified Wasīm excerpts and unattributed marginal notes. **The later three-layer definitive edition remains deferred.**

### Cumulative metrics — replace Stage 11 checkpoint without conflation

| Measure | Stage 12 checkpoint |
|---|---|
| All numbered printed page positions indexed | **615/615 = 100% bibliographic indexing**, NOT translated text |
| Volume I page positions with some provisional English | I:8–280 = **273**, including marginal-only I:222 |
| Volume II pages with some provisional English | II:2–100 = **99**; II:1 is a title/paratext leaf |
| Combined page-presence proxy | **372/615 = 60.49%**, NOT percentage of original Arabic words or complete arguments translated |
| New Stage 12 image-inspected source pages | **40** |
| New Stage 12 directly translated short upper excerpts | **25** |
| New lower-register short translated excerpts with authorship unverified | **2**, not credited to Wasīm |
| New independently corroborated Wasīm notes | **0**; the pre-existing matched II:117 fragment remains |
| Full main sharḥ + ALL lower notes continuously translated, independently verified and critically certified | **0/615 = 0%** |

A source page with a short Arabic anchor and a one-paragraph interpretive guide is **not a translated page**. The true percentage of Sanandajī’s Arabic words translated, and the fraction of Wasīm’s attributable note-units translated, **cannot be computed from the page-presence proxy**.

### Source method and immediate continuation

- Continue the first-reading survey at **II:101–120, PDF physical pages 396–415**. The already source-matched Wasīm II:117 passage must be **reused, not retranslated**. Register other notes on the same page under independently attributable voices or `unassigned`.
- At the next available full-text round, perform a **real complete Pass 1**, not another outline: write every clause of the Sanandajī running text and each lower-register note in separate Arabic and English witnesses, with original printed page and nested objection/reply sequence. Treat the source text, not OCR or editorial paraphrase, as authoritative.
- Conduct independent second reading and letter-by-letter proof of Arabic, collation of additional printed or manuscript witnesses, separate identification of Wasīm’s notes, and a philosophical review of faculties, universals, soul, intellect and causality. Then execute bilingual HTML/MD/PDF parity and accessibility tests.
- No modification of the independent al-Taftāzānī matn branch and no canonical three-layer merger until the distinct projects are critically definitive.


### F. Stage 12 marginal witness inventory and portable excerpt PDF

- A separate `editorial/2026-11-02_STAGE12_II061_II100_MARGIN_WITNESS_INVENTORY.csv` now records the existence of lower-register commentary on each of forty original printed pages, the absence of full transcription/translation, and whether a selected source snippet is available. The two selected lower incipits are located at **II:62 and II:74**, but their author is **unassigned**. **Zero** new pages have been positively and independently identified as Wasīm.
- Source facsimile extraction: original physical PDF image pages **356–395**, kept as a forty-page unchanged scan, not mistakenly called a translated PDF.
- Working selected-translation PDF: **25** short upper-register and **two** short unassigned lower excerpts, with the same wording as the Stage 12 source-selected JS. Arabic shaping was reviewed in the rendered PDF. It deliberately excludes most source words and prominently labels this limitation.
- The canonical cumulative scientific handoff is this Markdown in GitHub. Portable files are checkpoint copies and must not supersede source or version control.


---

## 21. Stage 13 — original printed volume II:101–140 (2 November 2026)

### A. Scope and witness

The primary witness remains the *same combined Sanandajī + Wasīm printed PDF*, `taqribmaram.pdf`, 632 scanned physical images, original numbered volumes I:1–280 and II:1–335 (615 numbered page positions). This stage directly inspected **40 original printed pages, II:101–140, physical PDF images 396–435**. No defective OCR was substituted for source Arabic. Existing I:8–280, II:2–100 and the pre-existing Wasīm II:117 passage were retained, not retranslated.

Original layers: (1) quoted Taftāzānī lemmata embedded in the large upper text; (2) Sanandajī's running explanation; (3) positively identified Wasīm `Ḥāshiyat al-Muḥākamāt` excerpts; and (4) other or individually unidentified small-print marginal notes. The printed *Tahdhīb* matn being translated in the **other chat** is not modified or merged.

### B. Book architecture, arguments and exact printed transitions

- **II:101–102:** end of separate-intellect and celestial-soul treatment, followed by reported accounts of spirits, angels and jinn. Philosophers' identifications of angels with separate intellects are distinguished from the reported theological account of angels as subtle bodies.
- **II:103:** closes angelology and opens the original **«الباب الخامس في الإلهيات»** (*Book Five: Divine Matters*) and **«الفصل الأول في تقرير الأدلة»** (the first chapter setting out proofs). These are source headings, not editorial inventions.
- **II:104–116:** demonstration of necessary existence from the dependence of possible beings, circularity/regress objections, discussion of composition, divine unity and incorporeality, and related distinctions between sharing a conceptual predicate and sharing an ontological genus.
- **II:117:** source-image contextual guide to the impossibility of divine intrinsic change; the existing `W.II.117.01` Wasīm passage on **taʾaththur** is explicitly **reused by a link**. No duplicate new translation has been created.
- **II:118:** the original chapter **«فصل في الصفات الوجودية»**, on knowledge, power, will and other affirmative divine attributes.
- **II:119–138:** the status of divine attributes and the divine essence; the scope of power and knowledge; created objects of eternal knowledge and will, temporal determination, and the distinction between intrinsic divine change and external effects.
- **II:139–140:** affirmation of life, hearing, seeing and speech; scriptural and argumentative accounts and the distinction between divine and bodily sensory instruments.

### C. New source-facing files and precise translation claims

1. `firstpass-II101-II120.js` and `firstpass-II121-II140.js`: **40 distinct original-page first-reading guides**, stable `P2.101`–`P2.140`, each with printed and PDF page references. These are *interpretive argument summaries*, **NOT complete Arabic–English transcriptions**.
2. `source-selected-II101-II140.js`: **23 new short direct Arabic–English source selections** (a duplicate quotation from II:117 was deliberately removed rather than counting it again). Their total Arabic coverage remains only selected phrases; none completes a page.
3. `source-aligned-II103-II139.js`: five additional chapter-heading, matn-versus-sharḥ or source-voice records, including a split example at **II:104** and the existential-attributes heading at II:118. Overlapping source words are not counted twice.
4. One new lower-register selected phrase at **II:118** is placed in the **author-unassigned** marginalia layer, *not* in the positively attributed Wasīm layer. Its context is a contested entailment concerning divine freedom from originated qualities; the full surrounding printed note remains untranslated.
5. `editorial/2026-11-02_STAGE13_II101_II140_SOURCE_AND_TRANSLATION.md`: the same page-first readings, selected directly translated Arabic, layer alignments and re-use citation for Wasīm II:117, generated from the JS source records.
6. `editorial/2026-11-02_STAGE13_II101_II140_LAYER_LEDGER.csv`: 40 original printed-page rows distinguishing source-image inspection, new direct snippets, previously identified Wasīm material, unassigned lower snippets, and what is **not complete**.
7. `editorial/2026-11-02_STAGE13_II101_II140_MARGIN_WITNESS_INVENTORY.csv`: coarse record of lower-register text on 40 pages; neither the exact total number of discrete notes nor the author of each note has yet been established. No fabricated Wasīm denominator is supplied.
8. `editorial/2026-11-02_COMPLETE_615_PRINTED_PAGE_SOURCE_REGISTER.csv`: updated exactly the II:101–140 page positions; all earlier and later records preserved.
9. NAMA `index.html`, `reader-layered.js`, and `source-atlas.js`: load new source units, preserve English/Arabic/parallel and four distinct author/source layers, and allow the page-II:117 guide to jump to the existing source-matched Wasīm excerpt.

### D. Cumulative coverage — accurately described

| Measure | Stage 13 status |
|---|---|
| Source pages with accurate printed/PDF locators | **615/615 = 100% source indexing** |
| Volume I pages with SOME English | **I:8–280 = 273** (I:222 is marginal-only) |
| Volume II pages with SOME English | **II:2–140 = 139** (II:1 is a title/paratext leaf) |
| Page-position presence proxy | **412/615 = 66.99%** with *some preliminary English*, NOT the percentage of Arabic words translated |
| Newly inspected printed pages and new provisional guides | **40**, II:101–140 |
| New selected directly translated upper snippets | **23**; overlapping aligned quotes are not additional text coverage |
| New paired alignment/heading records | **5** |
| New lower-register translated short excerpt with author unverified | **1**, II:118 |
| Newly independently corroborated Wasīm units | **0**; existing II:117 remains source-matched and linked, not rewritten |
| **Complete, independent critically certified upper + ALL lower-register pages** | **0/615 = 0%** |

**This is NOT a two-thirds translation.** A selected Arabic phrase and English interpretive page summary often account for only a small fraction of the source, especially because lengthy lower marginal disputes remain untranslated. A true word-level or Wasīm-specific completion percentage is still not available.

### E. Next source and critical translation protocol

- **Next rapid source interval:** printed **II:141–160**, original PDF images **436–455**. Continue the existing running source and argument boundaries, not arbitrary excerpts presented as complete passages.
- **Pass 1 (true full translation):** translate **every** Sanandajī clause and **every** small-print gloss unit continuously from Arabic, with stable lemma/sharḥ/margin IDs and page-boundary joins. Properly number and positively identify Wasīm notes separately from other writers.
- **Pass 2 (source checking):** independently proofread the complete source Arabic and translation, particularly negation, conditional/temporal particles, reported opponents, changes of interlocutor and the exact status of impossibility/necessity.
- **Pass 3:** collate distinct independent printed/manuscript witnesses and document variants and emendations.
- **Pass 4:** review philosophical, theological, and terminological consistency, including necessity, mental relations, divine attributes and acts.
- **Pass 5:** test Arabic–English alignment, manuscript/printed page references, desktop/mobile and right-to-left UI, note toggles, citation export, source PDF parity and reader reproducibility.
- **Merge policy:** do not overwrite the separate al-Taftāzānī *Tahdhīb* project or perform a canonical three-layer critical merger before both projects are independently complete and critically definitive.


---

## 22. Stage 14 — printed volume II:141–180, speech, takwīn, vision and human agency (2 November 2026)

### A. Primary source and source-sensitive correction

Original *Taqrīb al-Marām* plus *Ḥāshiyat al-Muḥākamāt* continues to be read directly from the same scanned two-volume witness `taqribmaram.pdf`. Printed volume **II:141–180 = physical PDF images 436–475**. All forty original page images were rendered and visually inspected in their original upper and lower typography, not inferred from generic outlines or automatic OCR. The 40-page unchanged facsimile is preserved as a separate source PDF.

**Important correction to the initial Stage 14 reading:** the first contact-sheet review overextended the divine-speech discussion to approximately II:153 and placed the ruʾya discussion at II:154. Enlarged original-page inspection shows the actual order:

- **II:141–148:** *kalām nafsī* versus divine speech understood as audible letters, sounds, statements, commands, reports and linguistic signs; claims concerning eternal speech versus originated forms.
- **II:149–150:** a distinct discussion of *baqāʾ* (subsistence/persistence) and *takwīn* (bringing into existence), including whether production is a new real intrinsic divine attribute or an intelligible relation grounded in producer and effect.
- **II:151:** an explicit original new section, **«فصل في أحواله»**, introduces the question whether God can be seen and His reality known. The upper text discusses the possibility of vision **«من غير جهة ولا مقابلة»** (without direction or being face-to-face). **Divine vision begins at II:151, not II:154.**
- **II:152–165:** Moses' request to see God, the condition associated with the mountain, the force of `lan tarānī`, divine vision without spatial requirements, the differences among perception, comprehension and knowledge, and scriptural arguments.
- **II:166:** a second original chapter **«فصل في أفعاله»**, shifting to God's acts and the creation of the acts of the servants and other animals.
- **II:167–180:** divine will and creative power, human choice and agency, permission versus approval/command, the theory of *kasb* (acquisition), the objections attributed to the Muʿtazila from praise, blame and responsibility, and the relation between created human power and the actual existence of actions.

These are **source-located philosophical and theological argument maps**, not complete translations of the original pages. They should be revisited in the full literal passage round.

### B. New text and author-layer controls

1. `firstpass-II141-II160.js`, `firstpass-II161-II180.js`: **forty** page-identified first-reading guides `P2.141`–`P2.180`. Each has its printed and physical PDF position and only a selected short Arabic anchor; full running text and long lower marginalia remain untranscribed. Revised source classifications for II:149–153 are committed explicitly as corrections.
2. `source-selected-II141-II180.js`: **21** short directly translated source-Arabic upper phrases. These are not twenty-one completed paragraphs or distinct full pages; several also appear as partial words in the paired records below. Count overlap only once in word-level future coverage.
3. `source-aligned-II141-II177.js`: **four** partial source-aligned reading records at **II:141, II:150, II:151, II:166**. These distinguish printed parenthesized Tahdhīb lemmata from Sanandajī’s running explanation or a printed chapter heading, including a more substantial selected passage at II:151 on nonspatial vision. **Ellipses explicitly mark omitted source words.** These quoted lemmata do not modify or replace the independent al-Taftāzānī matn translation.
4. The same file has a newly translated **lower-register source excerpt at printed II:177 / physical PDF 472** on the difference between acquiring an act (*kasb*) and bringing it into existence. The source wording explains that acquisition can obtain when another agent supplies existence, whereas creation is the giving of existence. This is a materially useful translation of part of a longer printed marginal argument. The individual historical author is **UNASSIGNED**; it is not counted as an authenticated Wasīm excerpt.
5. `editorial/2026-11-02_STAGE14_II141_II180_SOURCE_AND_TRANSLATION.md`: canonical Stage 14 source-facing Markdown, generated directly from the reader records, containing all forty editorial guides, the twenty-one short translations, the four paired records and the lower *kasb* excerpt with explicit source caveats.
6. `editorial/2026-11-02_STAGE14_II141_II180_LAYER_LEDGER.csv`: a forty-row audit of image inspection, short upper excerpts, matn/sharḥ separation, lower-register excerpts, Wasīm authentication, and the still-incomplete critical stages.
7. `editorial/2026-11-02_STAGE14_II141_II180_MARGIN_WITNESS_INVENTORY.csv`: a distinct record for each source page with lower-print presence and unverified authorship; the new II:177 translated incipit is specifically recorded.
8. `editorial/2026-11-02_COMPLETE_615_PRINTED_PAGE_SOURCE_REGISTER.csv`: exactly forty `II:141`–`II:180` original page entries updated; no preceding source page status overwritten and the existing source-matched **Wasīm II:117** remains separate and unchanged.
9. NAMA `index.html`, `reader-layered.js`, `source-atlas.js` now load the new data with Arabic-only, English-only, dual-column, matn, Sanandajī sharḥ, positively attributed Wasīm, unidentified other marginalia and modern editorial-note controls intact.

### C. Current cumulative page-presence numbers — NOT translation completion

| Measure | Checkpoint |
| --- | --- |
| Full two-volume numbered original source pages indexed | **615/615 = 100% source navigation**, not translated |
| Volume I with some preliminary English | I:8–280 = **273**, including marginal-only I:222 |
| Volume II with some preliminary English | II:2–180 = **179**, excluding title-only II:1 |
| Total numbered printed page positions with **some** English | **452/615 = 73.50% page-presence proxy**, not proportion of source words translated |
| New stage pages inspected, with preliminary English guides | **40**, II:141–180 |
| Short direct upper source extracts | **21** new records; some source overlap with paired alignments |
| New paired matn/sharḥ source records | **4** (II:141, 150, 151, 166) |
| New translated lower-register excerpt of unverified author | **1** (II:177) |
| New independently verified Wasīm notes | **0**; the earlier II:117 passage remains source-matched |
| Full Arabic/English main sharḥ plus ALL marginalia translated, independently checked, critically certified | **0/615 = 0%** |

**Do not describe the book as 73.5% translated.** A page can count as having some English if it has merely an introductory summary, while most original Arabic and especially small-print historical marginal discussion is still absent. Genuine word-level translation coverage and the number of independently identifiable Wasīm notes have not yet been established.

### D. Next original pages and required editorial passes

**Next rapid direct-source interval: printed II:181–200, source PDF physical pages 476–495.** Continue preserving all source boundaries and a defensible account of the upper and small-print layers. Do not retranslate the existing Wasīm II:117 quotation, nor revisit the separate historical Sanandajī treatise excerpt from the earlier addendum as if it were new `Taqrīb` text.

**Full literal Pass 1** must eventually be distinguished rigorously from these Pass-0 reading guides: transcribe and translate every upper Sanandajī Arabic clause, every embedded al-Taftāzānī lemma and **every lower marginal note** with positive author attribution where possible and otherwise explicit uncertainty; preserve original pagination and continuations. **Pass 2** independently checks every Arabic particle, negation, speaker attribution, source line and English clause. **Pass 3** compares independent print/manuscript witnesses, logs variants and emendations. **Pass 4** studies the philosophical arguments and consistency of *kalām nafsī*, *takwīn*, *baqāʾ*, *ruʾya*, divine causality and *kasb*. **Pass 5** verifies Markdown, JS, PDF, Arabic fonts, dark theme, mobile layout and every reader control. Do not merge the separate Tahdhīb matn stream into a definitive three-layer edition before each stream is critically complete.


---

## 23. Stage 15A — clause-critical source repair, II:141–180 (2 November 2026)

**Exact scope:** the prior Stage 14 **source-inspected quotation records** at printed II:141, II:150, II:151, II:177 and II:178 were critically re-segmented and examined at the level of logical particles, translation and authorial voice. The original photographed PDF itself was **not newly available** during this stage, and no new Arabic is purported to have been read from physical pages II:181–200. This is substantive editorial analysis of previously recorded selections, **not** an extension of source-page coverage or a second-witness collation.

- New additive source-critical dossier: `editorial/2026-11-02_STAGE15_CLAUSE_CRITICAL_ADDENDUM_II141_II180.md`. It includes a series of clause-level analytical units, phrase comparisons and contextual warnings spread across five previously inspected printed pages, and formal reasoning focused on relational `takwīn`, nonspatial `ruʾya`, and the distinction `kasb`/ `khalq`. (The units are **editorial segmentation of inherited excerpts**, not an increment in unique Arabic words transcribed.)
- Reader translation correction: at II:141 `يدل عليها بالعبارة والكتابة والإشارة` is now “It is signified by verbal expression, writing, and gesture/sign,” rather than redundantly translating `الإشارة` as “indication” following `يدل`. The text of the original Arabic is unchanged.
- Caution at II:150: `معنى إضافي` may be rendered “relational meaning”, but cannot without its surrounding argument be conflated with a subjective illusion or automatically classified as a Thomistic real relation. Typographical speaker attribution requires another source inspection.
- The II:177 gloss beginning `والسر في ذلك` has been segmented into five full **selected-quotation clauses** with a revised literal English translation. Its individual writer is still **UNASSIGNED**, **not** independently identified as Muḥammad Wasīm. The gloss's logical point is that `kasb` does not *entail* independent `ījād`, whereas `khalq` signifies giving existence; no additional free-will theory is imported.
- Other crucial caution: II:151 source elisions prevent rebuilding the antecedent of `ذلك`; II:178 falling-vs-ascending examples must not be asserted as an authorial conclusion without the absent responses.
- **Unchanged numerical checkpoint:** 615/615 original numbered pages indexed; 452/615 have some preliminary English page presence; 0/615 independently certified complete main-plus-every-margin translations. One previous Wasīm source-matched excerpt at II:117, with no total gloss denominator. **No new page claimed translated in Stage 15A.**

**Next sequential original images still pending:** printed **II:181–200**, source PDF physical pages **476–495**. Full original images must be available to make actual new source claims. Do not create page-guide guesses or generic fabricated Arabic. The separate al-Taftāzānī `Tahdhīb` project remains entirely untouched.


---

## 24. Stage 15B — original source recovered; sequential printed II:181–200 (2 November 2026)

**The user re-uploaded the actual primary document as `taqribmaram(2).pdf`; direct independent inspection of the mounted binary established **632 PDF images**, despite a truncated interface-level preview showing only 400 pages.** It is a scanned two-volume edition with image-only Arabic; no text layer. Numbered original volumes are I:1–280 and II:1–335 (615 printed positions). The previously unavailable **printed II:181–200 = physical PDF pages 476–495** were rendered directly, and every original image was visually inspected in sequence. The source scan can now support genuinely source-dependent translation rather than generic anticipation.

### Newly confirmed source structure and content

- **II:181–191:** concluding and extending debates on divine creation of human actions, foreknowledge, human acquisition versus origination, motive, power and choice, divine decree versus its object, divine will versus moral approval, and the difference between commanding an action and willing its occurrence.
- **II:186** is especially significant for a continuous upper-register argument: `الكفر مقضي لا قضاء`, with `والرضا إنما يجب بالقضاء لا بالمقضي`; the reply then distinguishes `من حيث أنه مقضي` from `من حيث ذاته`. An extended translated selection is recorded in the Stage 15B source-translation addendum.
- **Printed II:192** opens the exact original **`فصل في الحسن والقبح`**, contrasting descriptive perfection/deficiency, correspondence with purpose and, centrally, moral desert of divine praise/blame and reward/punishment. The disagreement is not simply whether intellect knows any goodness whatsoever.
- **II:193–196:** continuation of rational moral judgements, including an unusually extensive **unattributed lower-register** argument about truth, falsehood, apparently self-referential statements and whether rational moral assessments are universal. This has been **located**, NOT fully transcribed, nor individually attributed to Wasīm.
- **Printed II:197** begins another source-original section **`فصل في التكليف بما لا يطاق`**, explicitly connecting the question to the prior `ḥusn wa-qubḥ` controversy. **II:197–200** develops impossibility, capacity, conceivability of commands, and the interpretation of scriptural constraints on obligation.

### New files, without overwriting predecessor translations

1. `firstpass-II181-II200.js` — **20** source-image first-reading records with `P2.181`–`P2.200` stable page identifiers, page-specific **interpretive guides**, brief directly read Arabic anchors and original physical source locators. **Not** continuous literal translations.
2. `source-selected-II181-II200.js` — **15** short upper-register, directly inspected Arabic-English source selections with stable `L.II.*` identifiers. Chapter headings are explicitly original. Embedded matn versus running sharḥ remains a source-typography attribution task.
3. `editorial/2026-11-02_STAGE15B_II181_II200_SOURCE_GUIDES.md` — same provisional page guides plus source boundary corrections.
4. `editorial/2026-11-02_STAGE15B_II181_II200_EXTENDED_SOURCE_TRANSLATIONS.md` — new **longer connected selected source passages**, especially at II:186 and II:192, with close bilingual translation and philosophical apparatus; short selected source text at II:197. These may overlap other short excerpts and **do not count as extra whole-page translations**.
5. `editorial/2026-11-02_STAGE15B_II181_II200_LAYER_LEDGER.csv` — twenty rows separating page guides, selected upper text, missing complete upper transcription, missing full main English, outstanding margins, positive Wasīm attribution and independent verification.
6. `editorial/2026-11-02_STAGE15B_II181_II200_MARGIN_WITNESS_INVENTORY.csv` — visible but still unenumerated small-print marginal texts of the twenty source pages. No new Wasīm unit falsely assigned by layout.
7. Canonical `editorial/2026-11-02_COMPLETE_615_PRINTED_PAGE_SOURCE_REGISTER.csv` — **exactly 20** printed II:181–200 rows changed to provisional English/source inspected; prior 595 rows left unchanged.
8. `index.html`, `source-atlas.js`, `reader-layered.js` — NAMA site now loads both new JS sources and reflects the revised truthful source-page-presence counter, preserving Arabic/English/both views, layer controls and original archived passages. No independent Tahdhīb matn files modified.

### Numerators and honest completion denominators

| Measure | Stage 15B |
|---|---|
| Original numbered printed positions bibliographically indexed | **615/615 = 100% indexing**, not translation |
| Volume I with some provisional English | I:8–280 = **273**, including marginal-only I:222 |
| Volume II with some provisional English | II:2–200 = **199**, title-only II:1 excluded |
| Numbered positions with some English | **472/615 = 76.75% page-presence only**, not Arabic words translated |
| New source-inspected and preliminary guided pages | **20**, II:181–200 |
| New short direct upper passages | **15**, not complete pages |
| Additional longer selected bilingual source passages | II:186, II:192, II:197 with possible overlap |
| New fully verified Wasīm glosses | **0**; prior II:117 remains independently source-located |
| Complete main text plus every margin, independently proofed and critically certified | **0/615 = 0%** |

This stage **does not** certify any complete printed page. Every long marginal discussion remains in the future full-text Pass 1, followed by independent Arabic proof, edition collation, technical commentary and author-specific attribution. The existing separate al-Taftāzānī `Tahdhīb al-Kalām` workstream has not been touched.

**Next direct-image interval:** **printed II:201–220 / physical PDF pages 496–515**, in the same 632-image source now mounted and available for source work. Full-text clause-by-clause main and margin translation should increasingly replace interpretive page guides, never be confused with them.


---

## 25. Stage 16 — source-first printed II:201–220: divine purposes, guidance, death, provision, divine names (2 November 2026)

### Source, exact page crosswalk and project separation

The user-reuploaded original complete two-volume, image-only `taqribmaram(2).pdf` was inspected at physical PDF pages **496–515**, corresponding to original **printed volume II:201–220**. All twenty original page images were directly viewed. The combined title and printing retain **615 numbered printed pages** (I:1–280, II:1–335) in **632 physical PDF images**. No default OCR reading has been substituted for the original Arabic. All source layers remain distinct: embedded al-Taftāzānī lemmata, Sanandajī's upper running `sharḥ`, positively identified Wasīm lower glosses, and notes by other / currently unknown writers. **No edits to the separately translated al-Taftāzānī Tahdhīb matn.**

An unchanged source-only facsimile packet, `Taqrib_Stage16_II201_II220_Original_Facsimile.pdf`, contains **20** original photographed images. It is emphatically **not** a bilingual translation of all those pages.

### Correct original intellectual architecture

1. **II:201** opens an original `فصل` on explaining God's acts by ends: `ذهبت المعتزلة إلى تعليل أفعاله تعالى بالأغراض والأشاعرة إلى عدمه`. Legal sanctions and expiations, prohibition of intoxicants and the evidentiary validity of `qiyās` appear as cases of purposive rationales. **II:202–203** ask whether such purposes are *necessary* or *universal* and distinguish benefit accruing to servants from any need of the Creator.
2. **II:204** begins a separate `فصل` about `hudā`, `iḍlāl`, `tawfīq`, `khidhlān`. **II:205–208** distinguish indication of the way, creation of the state or power of guidance, and different senses of calling God or creatures responsible for misguidance. **II:207–208** contain particularly long lower-register objections with only small upper passages.
3. **II:209** begins `فصل والأجل` about the appointed term of death, including `والمقتول ميت بأجله`. **II:210** concerns the murderer's culpable act and the meaning of transmitted reports of lifespan increase; divine knowledge and the actor's responsibility must not be conflated.
4. **II:211** contains TWO original divisions: first a `فصل` on `rizq` and the question whether unlawfully acquired nourishment can be provision; then a **second original `فصل` near the page's foot**, stating an apparent agreement that God does not do the reprehensible or omit the obligatory. **II:212–215** extend that into divine justice and alleged rational obligation to do the most beneficial for servants, reward, punishment and their duration. **II:214** is mainly **lower-register** commentary, not a full new Sanandajī page.
5. **II:216** opens the chapter on divine names. **II:216–220** investigate `ism`, `musammā`, `tasmiyah`, whether the name is the named, common reference versus different significations, and permissibility or propriety of names applied to God. Extended small-print philosophical objections remain outstanding.

### Substantive source-facing new files (non-destructive, no duplicated old pages)

- `firstpass-II201-II220.js`: 20 page-specific, original-image inspected English **meaning-oriented preliminary guides**, stable IDs `P2.201`–`P2.220`, exact original PDF positions, short Arabic anchors and candid noncompletion notices. **NOT twenty complete literal page translations.**
- `source-selected-II201-II220.js`: **23 short selected directly viewed Arabic-English upper-register expressions** with source IDs `L.II.*`. Quoted lemma versus Sanandajī voice not silently conflated.
- `source-aligned-II201-II216.js`: **5** additional original-section and partial embedded matn/running sharḥ alignment records at II:201, 204, 209, 211 and 216. Ellipses mark noncontiguous spans; words overlapping with the 23 short excerpts **are not new translated words**.
- `source-marginal-II202.js`: **one** short translated lower-register excerpt at II:202, `G.II.202.01`, explicitly **individual writer UNASSIGNED**. The full underlying marginal note is NOT translated and it is NOT credited automatically to Wasīm.
- `editorial/2026-11-02_STAGE16_II201_II220_SOURCE_GUIDES_AND_BILINGUAL_SELECTIONS.md`: the same canonical 20 guides, all 23 directly translated source expressions, five selected source alignments, the sole short marginal excerpt, source-critical caveats, page-source provenance and coverage ledger.
- `editorial/2026-11-02_STAGE16_II201_II220_EXTENDED_SELECTED_TRANSLATIONS.md`: additionally longer **connected but intentionally discontinuous selections** concerning divine purposes, guidance/misguidance, appointed death, provision and names. Explicit ellipses preserve omitted source words. **Not whole pages**, and not independently collation-certified.
- `editorial/2026-11-02_STAGE16_II201_II220_LAYER_LEDGER.csv`: twenty original-page rows, new source snippets per page, layer and completeness flags.
- `editorial/2026-11-02_STAGE16_II201_II220_MARGIN_WITNESS_INVENTORY.csv`: the lower register's appearance on each inspected page and its still-pending full note division, Arabic transcription, translation and author identification.
- `editorial/2026-11-02_COMPLETE_615_PRINTED_PAGE_SOURCE_REGISTER.csv`: **exactly 20 II:201–220 rows updated** as source-inspected with preliminary English, **all 595 other source positions preserved**.
- NAMA `index.html`, `reader-layered.js`, `source-atlas.js` updated to load the new documents and report only page-presence statistics. Prior source selections, user controls and separate authors remain intact.

### Measured result, not a false translation percentage

| Measure | Stage 16 checkpoint |
|---|---|
| Original numbered printed pages indexed | **615/615**, bibliographic mapping only |
| Volume I with any previous provisional English | **I:8–280 = 273**, including special marginal-only I:222 |
| Volume II with any provisional English | **II:2–220 = 219**, II:1 part-title excluded |
| Combined numbered positions with at least *some* English | **492/615 = 80.00% PAGE PRESENCE**, NOT percentage of source words or chapters translated |
| New source-image guides | **20**, II:201–220 |
| Directly translated short upper excerpts | **23**, selected fragments, not complete paragraphs/pages |
| Separate source-alignment records | **5**, some textual overlaps |
| Newly translated short lower marginal excerpts, writer unassigned | **1**, II:202 |
| Newly independently corroborated Wasīm gloss units | **0**, earlier source-matched II:117 retained |
| All original main + every marginal text fully translated and independently critically certified | **0/615** |

The source's long lower-register debates continue to contain most of the uncompleted text on various leaves. A meaningful Wasīm-specific completion percentage cannot be computed before **individually enumerating and positively attributing** all of his gloss units.

### Next handoff

**Next initial source interval:** printed **II:221–240**, original PDF images **516–535**. In addition, urgently undertake a genuinely complete **Pass 1** that transcribes and translates *every original Arabic clause* of both upper and lower registers, with original author-voice markers and page joins. Then conduct independent second-image reading, witness collation, technical logical/theological review and bilingual publication QA. Do not represent the existing short selections or interpretive page notes as a definitive exhaustive critical translation, and do not merge into the separately translated Tahdhīb matn project until both independent editions are genuinely complete.


---

## 26. Stage 17–18 — remainder of the original printed source located and critically divided (2 November 2026)

### A. Source and evidence level

The same user-reuploaded complete **632-image source PDF** was directly processed. Original printed volume II positions **221–335** correspond to physical PDF **516–630**; **115 original page images** were rendered and inspected (individual full-size checks for critical boundaries and contact-sheet review for all remaining leaves). An **original-source facsimile PDF** for II:221–260, one for II:261–314, and one for the distinct II:315–335 final / index / post-index section were saved as separate unchanged scanned source packets. The index page offsets were independently checked against the original photographed page numbers. **No OCR transcription was accepted as source-certified Arabic.**

This phase adds more **bibliographic and interpretive coverage**, NOT complete text translation. Many of these pages have only short source-heading quotation and an English topic-level guide. None of the newly examined lower marginal arguments has received a full Arabic transcription and complete English translation. No new marginal phrase was automatically assigned to Muḥammad Wasīm.

### B. Stage 17 — printed II:221–260 / original PDF 516–555

- **40** numbered source-position section-context guides: `firstpass-II221-II260.js`; IDs `P2.221`–`P2.260`.
- **12** short directly translated Arabic source excerpts: `source-selected-II221-II260.js`. They include original chapter titles and short selected propositions; they are not whole paragraphs/pages.
- Source facing combined Arabic/English and argument guide: `editorial/2026-11-02_STAGE17_II221_II260_SOURCE_GUIDES_AND_SELECTED_TRANSLATIONS.md`.
- Separate original-page and lower-register incomplete-source ledgers: `editorial/2026-11-02_STAGE17_II221_II260_LAYER_LEDGER.csv` and `..._MARGIN_INVENTORY.csv`.
- **Four key original printed transitions:** Book Six `الباب السادس في السمعيات` at **II:221**, original chapter on Muḥammad's prophethood **II:228**, conditions of prophethood **II:234**, and resurrection `فصل في المعاد` **II:240**. The newly mapped span covers miracles and the Qurʾānic challenge, prophetic protection, bodily resurrection and reconstitution.
- Precisely **40** positions II:221–260 marked as **preliminary context only** in the canonical 615-page register, leaving all older positions intact.

### C. Stage 18 — printed II:261–335 / original PDF 556–630

The original pages were examined by original-image survey with enlarged source checks at all central divisions. The resulting architecture is not continuous running commentary from II:261 through II:335 without interruption.

- **II:261:** reward as divine favour and punishment as justice.
- **II:264:** permanence of Paradise and the punishment of unbelievers, with cases of sinning Muslims.
- **II:270:** forgiveness and divine pardon, intercession and repentance.
- **II:275:** chapter on repentance, then commanding right and forbidding wrong.
- **II:282:** nature of `īmān` as `taṣdīq`, its relation to works and legal profession.
- **II:297:** `islām` and `īmān`, reciprocal inclusion and distinct meanings.
- **II:301:** the validity of adding a qualification or `istithnāʾ` to the assertion of belief.
- **II:302–314:** the majority position on the validity of a `muqallid`'s faith, inquiry and assent.
- **II:315:** printed closing colophon, including date **1319 AH** (source verified).
- **II:316–317:** printed commendations and poetic material with different named contributors. These are distinct documentary / paratextual registers.
- **II:318–320:** printed **contents index** for the preceding commentary, ending with the treatment of `īmān al-muqallid`. The index does not list the following imamate material.
- **II:321–335:** actual source text resumes **after** index under `فصل في الإمامة`. II:327 introduces `فصل الإمام الحق بعد رسول الله`, addressing the caliphal succession. II:335 ends with a closing prayer and separate editorial note. This proves a **post-index source sequence**, not the historical reason for its unusual printing/binding placement. Do not decide whether it is an authorial supplement, later editor's insert or rebinding without an independent witness.

**New Stage 18 files:**

- `firstpass-II261-II280.js`: 20 source-context page locators.
- `firstpass-II281-II314.js`: 34 further locators.
- `firstpass-II321-II335.js`: 15 explicitly **post-index** locators with unresolved authorial-placement note.
- `source-selected-II261-II314.js`: 12 original-source **short bilingual selections**, mostly printed section openings.
- `source-selected-II321-II335.js`: 5 separate short source selections from post-index imamate pages.
- `editorial/2026-11-02_STAGE18_II261_II335_FINAL_SOURCE_SURVEY_AND_SELECTED_TRANSLATIONS.md`: original section architecture, every new source-context record and short translations.
- `editorial/2026-11-02_STAGE18_EXTENDED_CRITICAL_TRANSLATIONS_II261_II335.md`: extended **selected connected original sentences**, close English and critical apparatus on divine grace, permanence, pardon, repentance, `taṣdīq`, Islam/faith, `īmān al-muqallid`, imamate; overlaps with short excerpts do not increase translated-word coverage.
- `editorial/2026-11-02_STAGE18_II261_II335_SECTION_PARATEXT_LEDGER.csv`, `..._MARGIN_AND_WITNESS_LEDGER.csv`: explicit original-source categories and incomplete lower-register status for **75** numbered positions (including six separate paratext leaves).
- Canonical `editorial/2026-11-02_COMPLETE_615_PRINTED_PAGE_SOURCE_REGISTER.csv` updated on exactly **75** II:261–335 positions: 54 continuing main-text section-context, six II:315–320 paratext, fifteen post-index imamate. Original I and all earlier II source rows remain intact.

### D. Completion measures with honest labels

| Measure | Stage 18 state |
|---|---|
| Numbered printed positions indexed in both volumes | **615/615**, 100% bibliography |
| Positions with any earlier English guide / selection | Volume I:8–280 **273**; volume II:2–314 **313**; post-index II:321–335 **15** |
| All positions with *some editorial English context or selected quotation* | **601/615 = 97.72%** page-position presence. **This does NOT mean 97.72% of the source text is translated.** Much material is at best section-level contextual guidance. |
| Deliberately excluded source positions | I:1–7 opening not yet translated; II:1 part-title; II:315–320 distinct colophon, endorsements, index |
| Newly source-located II:221–335 positions | 115 original pages, including six paratext leaves |
| New Stage 17 context guides | 40 |
| New Stage 18 context guides | 69 (54 ordinary + 15 post-index) |
| New directly translated short upper selections in Stages 17–18 | 12 + 17 = **29** short selections |
| Newly fully translated separately authenticated Wasīm note units | **0** (prior II:117 independently attributed selection preserved) |
| Full original upper and ALL margins translated, second-proofed, collated and critically certified | **0/615**, unchanged |

This is **full physical surveying and near-full page-position orientation**, not an exhaustive translation. Word-by-word translation of the Sanandajī sharḥ and full enumeration/translation of the lower marginal *Ḥāshiyat al-Muḥākamāt* must be treated as unfinished major scholarly work. No Wasīm denominator is yet responsibly calculable.

### E. Publication and workstream boundary

NAMA `index.html` adds the seven Stage 17/18 JS resources, links both major source dossiers and the extended source-critical translation, and updates truthful page-orientation counts. `reader-layered.js` and `source-atlas.js` show **601/615 English-locator presence** (not textual completion), with source-atlas exceptions for the colophon, other paratext, and post-index imamate section. The independently progressing al-Taftāzānī *Tahdhīb al-Kalām* workstream is NOT edited or merged. The source facsimile packets and original complete source scan remain available for genuine full-text Pass 1.

### F. Next substantive task (do not re-do Stage 17/18 source indexing)

Start complete upper and lower original Arabic transcription and clause-by-clause close English of one *continuous substantive stretch*, preferably printed **II:221–228** followed by its marginalia, then II:228–240 and onward. Separately enumerate every marginal note and positively identify Wasīm only where the actual printed note or independently collated witness establishes his authorship. Maintain source passage IDs, corrected Arabic word joins, logical particles, objections/replies, original page joins and second-pass audit. Complete the entirety of original II:1–335 and volume I without conflating original printed endorsements, contents and post-index imamate with normal running `sharḥ`. Only genuine full text + independently checked attribution + witness collation supports a critically complete release.


---

## 27. Stages 19–22: genuinely source-facing Book Six clauses and 1912 Cairo witness correction (3 November 2026)

**Source access:** The same user-uploaded complete 632-image Arabic `taqribmaram(2).pdf` is directly mounted and inspected (printed volume II:221–234 = physical PDF images **516–529**). The separate original `At-taftazaniSadAd-din1912_text.pdf` was also materialized and visually inspected for *printed* **pp.97, 98, 100**. The two sources must not be conflated: Sanandajī's larger upper register interleaves Taftāzānī parenthesized original lemmata with his own explanations, and a long smaller register includes Wasīm and other/historically uncertain gloss writers.

### Critical corrective collation — II:222, printed Cairo 1912 p.97

An originally unresolved source-lemma reading in Stage 19 (`⟦ومعارضته؟ / ومعاضدته؟⟧`) is now **resolved from two distinct physical print witnesses as `ومعاونته`**: *“and assisting it [reason].”* Sanandajī II:222 (source PDF 517) and the separate Cairo 1912 Taftāzānī printed p.97 agree. The neighbouring source lemma reads **`ورفع الاحتمال`**, “and removing uncertainty”; a distinct earlier *working bilingual Tahdhīb* archive had `ورفع الإشكال`, which is a working-transcription discrepancy **not yet established as a manuscript variant**. The corrected reading has been applied non-destructively to Stage 19's original `continuous-II221-II222-source-clauses.js`, the full Stage 19 Markdown and the Stage 19 audit ledger. **The separate independently developed Tahdhīb translation project is not edited here.**

### Stages 19 and 19B (retained from prior release, now critically corrected)

- **II:221–222:** 20 originally transcribed, clause-aligned upper units, original headings, base lemmata and Sanandajī explanations with the II:221→222 physical word join maintained. One longer **bounded first-pass lower-register marginal note** at II:222 analyzes **`wa` versus `aw`** in the prophet/messenger definition; its individual historical author remains **UNASSIGNED**, not positively Wasīm.
- **II:223–224:** 12 further direct source-clause records on a prophet's knowledge of divine commissioning and the definition of miracles as extraordinary events, challenge, absence of effective counter-performance, and divine creation of immediate knowledge. The II:223→224 physical sentence-join is preserved.
- Editorial full-dossier and register from Stage 19 remain available without duplicated or overwritten earlier historical excerpts.

### Stage 20 — original II:224–228, plus independent 1912 p.98

- `continuous-II224-II228-miracle-proof-clauses.js`: **25 further original short source-based bilingual clause units**, with `sourceLayer` tags for original **matn**, Sanandajī **sharḥ**, or authentic **heading**. Several phrases intentionally overlap the previous Stage 19/19B selection work and are **not distinct complete paragraphs**.
- A short **individual-author UNASSIGNED** marginal excerpt at **II:227** concerning the **three stages of the miracle's inferential proof**; it remains part of a longer incomplete small-type note.
- `editorial/2026-11-03_STAGE20_II224_II228_MIRACLE_WITNESS_COLLATION_AND_TRANSLATIONS.md`: 25 phrases, close English and critical discussion of the king's public threefold act as explicit affirmation, merely imagined alternative causes versus ordinary certainty, successful counter-performance, God as effective producer in the specified miraculous case, and avoidance of circular proof.
- Original Cairo 1912 Taftāzānī printed p.98 was independently image-inspected. It contains selected base matn on the same miracle definition, royal analogy, objections from possible hidden causes, customary certainty, and the necessity of avoiding circular appeal to a prophetic report. **This is a collation witness to embedded lemmata, not a merger with the independent Tahdhīb edition.**

### Stage 21 — II:229–230, the *ṣarfa* question and kinds of prophetic evidence

- `continuous-II229-II230-quran-and-sarfa-clauses.js`: **14** further short source-based bilingual upper-register selections with explicit matn versus sharḥ identity. The original distinguishes *intrinsic inimitability* of Arabic composition from the reported `ṣarfa` view, attributed by the **Sanandajī text** to al-Naẓẓām and some other scholastic groups. This reported attribution requires independent doxographic checking before being counted as al-Naẓẓām's own preserved formulation.
- A short **author-UNASSIGNED** lower-register selection **G.II.229.21.01** develops the *parts versus whole* objection: from the ability to produce constituent Qurʾānic expressions one cannot immediately infer the ability to match the entire composition; `حكم الجملة قد يخالف حكم الأجزاء`. **The complete note remains untranslated** and no historical author is fabricated.
- `editorial/2026-11-03_STAGE21_II229_II230_SARFA_QURAN_PROPHETIC_PROOF.md`: all 14 selected originals, close English, extended editorial analysis and that source-matched lower-register excerpt. Further distinctions from earlier prophetic narratives and prediction of events (Romans, spoils, host defeated) are recorded rather than flattened into the same argument as eloquence.

### Stage 22 — II:233–234, the conditions of prophethood

- `continuous-II233-II234-prophetic-conditions-clauses.js`: **15** further directly source-read short Arabic-English units from the Night Journey/Ascension and original `فصل من شرائط النبوة` at II:234. Separated al-Taftāzānī lemmata include the condition of intellectual completeness, strength of judgement, freedom from repellent characteristics, and the adopted account of prophetic protection. Sanandajī's explanatory additions, including the case of Jesus as a child, remain separately attributed.
- Cairo **1912 printed p.100 independently rendered and inspected**, corroborating the *original base-text sequence* on prophetic qualifications. This establishes that Sanandajī's explanatory `الفطنة` and other bridge words must not be miscredited to the quoted matn.
- `editorial/2026-11-03_STAGE22_II233_II234_PROPHETIC_CONDITIONS_SOURCE_TRANSLATIONS.md` records the primary source clauses, witness comparison and the limits of the philosophical/theological conclusions.

### New source verification ledger and web reader

- `editorial/2026-11-03_STAGE20_22_CLAUSE_AND_WITNESS_AUDIT.csv`: **54 new upper original-source selections** (25+14+15) and **2 short author-unassigned lower excerpts** (II:227 and II:229). Source IDs, Arabic, close English, original physical PDF page, source register and incomplete verification/status are distinct. Overlaps with prior Stage 19 passages and the same printed base text are not independent translated-word increments.
- NAMA `index.html` now links to all Stage 20–22 dossiers and loads all new JS. `reader-layered.js` already respects `sourceLayer` so selected Tahdhīb matn-only units do not get mislabelled as Sanandajī. Existing Arabic/English/both, matn, sharḥ, independently verified Wasīm and unattributed margin controls remain intact.

**Completion warning:** The prior **601/615 printed page-position English-context proxy** (97.72%) is **UNCHANGED**, not increased by overlapping clauses or by independent matn collation. Actual coverage of Arabic words and lower marginal note units is still much smaller. **0 whole printed pages** have been critically certified with every upper clause, all lower notes, independent second reading and print/manuscript variants. The named Wasīm gloss-unit denominator is still unknown. The page-respecting first-pass text now reaches selected source units at **II:234**, with many omitted intervening portions and entire lower notes still requiring substantial work.

**Next substantial original source interval:** II:235–239 (physical PDF images 530–534): continue the distinct positions concerning `ʿiṣma`, scope of prophetic actions before and after the mission, the legal force of transmitted reports and the boundary to the resurrection chapter at II:240. Priority remains *continuous complete upper and lower transcription and close English*, not further broad source-page topic surveys.


---

## 28. Stages 23–25 — direct-source correction and resurrection identity, from printed II:235 to II:260 (3 November 2026)

### Source and the crucial correction to the old first-reading map

The user-supplied **632-image** primary PDF was directly inspected for **26 consecutive original numbered printed pages**, II:235–260 = physical PDF **530–555**. Each page was rendered at high resolution and individually checked; a separate unchanged 26-page source facsimile was extracted and pixel-verified against the corresponding original source pages. Original scanned page numbers are authoritative.

**Critical Stage 17 error corrected:** The old broad source map overstated the length of the prophetic-conditions discussion. The original II:235–239 actually moves from reported numbers of prophets and angelic disobedience/protection to **angels versus prophets and human beings**, and **karāmāt of saints**, before the original resurrection chapter opens at II:240. Stages 23–25 revised `firstpass-II221-II260.js` on exactly 20 old source positions (II:235–239 and II:246–260), preserving all unrelated records. These are corrections to **source context**, not new translations of whole pages.

### Stage 23 — printed II:235–245 (source PDF 530–540)

New `continuous-II235-II240-prophets-angels-karamat-maad.js`: **33** direct bilingual short source selections, after second-review removal of 9 ambiguous or overreconstructed tentative snippets. The text covers 124,000 and 313 as reported prophet/messenger numbers, angelic protection, the status of Iblīs, different arguments for the rank of angels and humans, the *karāma* distinction from prophetic miracle, and the actual opening of resurrection at II:240.

New `continuous-II241-II245-restoration-identity-clauses.js`: **21** direct Arabic-English source short selections after removing 13 dubious or generic initial draft items. Core disputed phrases include `يجوز إعادة المعدوم`, `الإمكان الذاتي لا يزول بحسب الأوقات`, `لا يبقى فرق بين المبدأ والمعاد`, and the first/later occurrence distinction `والمعاد واقع ثانيا`. These distinguish restoring the identical annihilated subject from merely reassembling and revivifying surviving material.

New `upper-continuous-II242-restoration-vs-reassembly.js`: **one 38-word continuous upper-register original passage**, with close English and its source reference to the *Maqāṣid* and Qurʾān 36:79. The significantly longer lower-register discussion on that very same page is **not** complete; this **does not qualify as a fully translated page**. Words overlapping the 21 selected fragments are not counted twice.

New `source-marginals-II241-II245.js`: **four** lower-register source records, all with historical individual writer **UNASSIGNED**, not credited to Wasīm:
- `G.II.241.23.01` is a near-complete bounded *short first note* beginning `(قوله من التجرد)`, explaining that a soul's return from corporeal separation does not make it immaterial in itself for the first time.
- `G.II.244.23.01` is a selected phrase distinguishing apprehension of a universal from knowledge of the *numerically particular restored individual*.
- `G.II.245.23.01` and `G.II.245.23.02` are short parts of a longer objection about first and later occurrence, far from a full marginal page.

Full Stage 23 source-facing dossier: `editorial/2026-11-03_STAGE23_II235_II245_CRITICAL_SOURCE_TRANSLATIONS.md`. It includes all 54 short bilingual source units (33+21), the 38-word continuous upper source, first-pass English, and a critical comparison of angelic/human merit, saintly wonders, reinstatement, composition and numerical identity. The original source PDF extraction for II:235–245 remains a facsimile, NOT a translated PDF.

### Stage 25 — printed II:246–260 (source PDF 541–555)

New `continuous-II246-II260-resurrection-objections-and-afterlife.js`: **34** new source-image selected Arabic-English units after a second-review removal of 10 uncertain or mispaginated tentative snippets. The physical page-crossing expression `فإن أكل` (II:248) → `إنسان إنسانا` (II:249) is retained under its distinct original locators rather than fabricated as one page sentence.

A critical sequence in II:248–251 is the **eater/eaten objection** to bodily reconstitution: original bodily constituents `الأجزاء الأصلية` versus surplus or acquired `الأجزاء الفاضلة`, and whether both individuals could claim the same matter in resurrection. This must be treated as an issue of **numerical identity**, not simply proof that God possesses creative power.

The later physical source continues into the created/prepared status of Paradise and the Fire, the distinction between this life's material processes and the hereafter, and at **II:256** an authentic original `فصل` on **grave interrogation and punishment**. II:257–259 discuss the Qurʾānic two deaths and two lives and the possibility of intermediate perception; II:260 moves toward reckoning, the scales and the bridge.

Full Stage 25 source-facing dossier: `editorial/2026-11-03_STAGE25_II246_II260_BODILY_IDENTITY_GRAVE_TRANSLATIONS.md`, with all short source selections, precise page locators and an analysis of the scriptural argument from Pharaoh's punishment before the Hour. **No new small-type marginal gloss from II:246–260 is fully or positively attributed.**

### Physical outputs, source audit and NAMA controls

- Source-only scanned originals for all 26 inspected printed pages combined in the 26-page PDF `Taqrib_Stages23-25_II235-II260_Original_Source.pdf` (physical source pp.530–555), visually and pixel verified against four sample pages of the user-uploaded original. It is NOT a translation.
- `editorial/2026-11-03_STAGE23_25_SOURCE_WORD_AND_MARGIN_AUDIT.csv`: **93 distinct record rows**: 88 directly translated upper **selected phrases**, 4 lower fragments with **unassigned** historical author, and 1 additional **continuous** upper 38-Arabic-word passage partially overlapping already selected text. All 93 records include source PDF page, original/English and honest incompleteness flags.
- NAMA `index.html` now loads all five Stage 23–25 JS resources (two Stage23 selection files, one continuous short upper record, one distinct lower-source file, and one Stage25 selection file) and links the two source-facing Markdown dossiers.
- The existing `reader-layered.js` respects original layer attribution via `sourceLayer` so matn-only quoted lemmas are not labelled as Sanandajī's running prose. The 615-page source atlas retains pagination for all source pages.
- The original 2012 reproduction is used for these source readings; the independently inspected Cairo 1912 Taftāzānī print from Stage 20 is *only* an independent base-lemma witness and is NOT overwritten or merged into the external Tahdhīb stream.

### Accurate completion counts — crucial distinction

| Counter | After Stage 25 |
|---|---|
| Original numbered two-volume pages bibliographically indexed | **615/615**, unchanged |
| Original numbered positions with *some prior English context or selected source phrase* | **601/615 = 97.72% page-location presence**, unchanged |
| NEW physical original images directly inspected at high resolution | **26**, II:235–260 |
| NEW direct short Arabic/English source selection records | **88** (many short, including repeated subject matter) |
| NEW continuous but still first-pass upper excerpt | **1**, 38 Arabic words at II:242 (overlaps selection records) |
| NEW individually distinct lower-source fragments, author not verified | **4**, II:241, II:244 and II:245; only the first is a provisionally bounded complete short note |
| Fully transcribed **ALL** upper and **ALL** margins, independently twice-proofed, attribution verified, critically collated original pages | **0/615**, unchanged |
| New positively identified Wasīm notes | **0**; the historical II:117 source-matched excerpt remains separate |

The work so far has **located essentially the whole printed corpus but has not translated the whole corpus**, nor does the page-position fraction measure the Arabic words translated. Extensive upper prose and an even larger total of small-type marginal discussion remain outstanding across both volumes. The Wasīm note denominator remains unenumerated, therefore **no responsible Wasīm percentage exists**.

### Continuation objective — do not return to superficial page summaries

Priority after this stage: **full Arabic and close English of every original clause and each separately numbered small-type marginal note** in an uninterrupted source stretch, with precise authorial attribution, source-page joins, independently proofed readings and print/manuscript variants. The next sequential page after newly selected original text is **II:261**, beginning a section on reward as divine grace and punishment as justice; earlier II:235–260 also require a true full upper-and-margins pass. Preserve the separate al-Taftāzānī `Tahdhīb` workstream and keep the post-index II:321–335 imamate continuation flagged as source placement still requiring collation.


---

## 29. Stage 26 — rewards, obligation and moral motivation (3 November 2026)
### Original source, accurately separated layers

- **Source:** user-uploaded complete image-only two-volume `taqribmaram(2).pdf` (632 physical PDF pages). Original numbered volume II:261–263 = physical PDF pages **556–558**. Each of those original page images was rendered at high resolution; the prior afterlife discussion ends at the start of II:261 and a **genuine printed `فصل`** on reward and punishment begins partway down that page.
- **Independent control witness:** the source-scanned **Cairo 1912 Taftāzānī `Tahdhīb` original printed pp.108–109**, confirmed against actual photographed printed page numerals, for the *embedded parenthetical matn only*. The earlier independent `Tahdhīb` translation stream was NOT edited or overwritten.
- **New source original JS:** `continuous-II261-II263-reward-grace-justice.js`: **23** close Arabic–English source clause selections. These have original physical locators, stable `SAN26` IDs, `sourceLayer` separation between **matn, sharḥ and original section header**, and scope notes. Their precision does NOT mean the entire Arabic of those printed pages has been transcribed or independently proofed.
- **Lower register:** 1 source-matched selected lower excerpt, `SAN26.G.II263.01`, distinguishing two replies to two different Muʿtazilī objections. Its specific historical writer is **UNASSIGNED**, not positively identified with Muḥammad Wasīm. The lower note's remaining original words and all other notes on these pages are still untranslated.
- **Stage-critical bilingual dossier:** `editorial/2026-11-03_STAGE26_II261_II263_REWARD_JUSTICE_SOURCE_TRANSLATION.md`, which also reproduces a provisional connected original-Cairo base-text reading across pp.108–109 and explains the logic of promise versus threat, fittingness versus legal entitlement, and actual motivational efficacy versus a supposed rational obligation.

### Argument map and translation distinctions

1. `الثواب فضل من الله والعقاب عدل منه`: reward is divine generosity, punishment divine justice; no automatically binding creaturely claim-right against God follows from good deeds.
2. `ومعنى وجوبهما أنه وعد أو أوعد ... على خلاف في الوعيد`: the text invokes divine fidelity to a **promise** and separately discusses whether a **threat of punishment** must be executed. Remission can be construed as mercy without simply falsifying the promise.
3. `ملاءمة إضافتهما ...`: the **appropriateness** of associating reward/punishment with actions does not itself make the benefit something owed to the servant as compensation for obeying.
4. `الطاعات وإن كثرت لا تفي بشكر بعض النعم`: obedience cannot adequately repay even some pre-existing gifts. The later test from conversion or apostasy targets the claim of irrevocable entitlement through a prior action.
5. Two reported Muʿtazilī objections must remain distinct: (a) without certain reward or punishment there is insufficient motivation; (b) imposing uncompensated burdens would be unjust. Replies include: mere *possibility of omission* does not nullify exhortation; *actual occurrence* of benefit can suffice without a further rational obligation.
6. The short, separately indexed **lower-register** II:263 dialectic itself criticizes collapsing these two replies. Its historical individual author remains unassigned.

### Web reader and visible progress reporting

- `index.html` now loads `continuous-II261-II263-reward-grace-justice.js`, links the stage source edition and links the complete **Stage 26 full handoff**.
- An **accessible two-bar progress component** was installed on the reader: indexed **615/615** versus **independently critically certified 0/615**. Its caption explicitly distinguishes this from the **601/615** page-presence proxy (some English guides / excerpts, not source words translated). Stage 26 did not increase the prior 601/615 count because these pages already had English context.

### Exact completion snapshot after Stage 26

| Measure | State |
|---|---|
| Original numbered printed positions indexed | **615/615** — 100% indexed |
| Original positions with any English contextual/selected content | **601/615** — 97.72% **page PRESENCE only** |
| Original whole pages with complete sharḥ + all marginal notes, positive authorship, independent double proof and critical collation | **0/615** — 0% certified |
| New directly source-read upper bilingual clause records, II:261–263 | **23**, selected, not complete pages |
| New source-selected lower gloss excerpts, individual author UNASSIGNED | **1**, incomplete longer note |
| Newly authenticated Wasīm gloss units | **0** |
| Definitive Arabic-source total word completion percentage | **Unknown**, cannot responsibly infer from page presence |
| New page-level independent critical certifications | **0** |

### Handoff continuation

Next **Stage 27** should cover original volume II:264 onward (physical PDF from **559**), beginning the authentic source `فصل لا خلاف في خلود من دخل الجنة`. It distinguishes perpetual residence of those admitted to Paradise, the everlasting punishment of unbelief, and **entry versus later departure** for sinful Muslims. Keep doctrinal positions as *reported school claims*, do not collapse a theological assertion about eternal abode into an assertion of when one enters it, and preserve all small-print `qawl` notes as separate, individually attributable or UNASSIGNED units. Produce a **new full cumulative handoff snapshot at the end of each stage** (not only a brief delta), and update master. Priority remains complete Arabic/English of every original clause, not accumulating pages with merely thematic summaries.

**Historical and tool limitation:** The project has physically located most source pages but the overwhelming majority of original upper prose and lower marginal commentary remains untranslated and uncollated. A completed critical edition cannot honestly be claimed until those have been done, and a full Wasīm denominator does not yet exist.


---

## 30. Stage 27 — Paradise, Hell, `khulūd`, pardon and ultimate entry (3 November 2026)

### Source images, independent base and authorial layers

- **Original witness:** user-uploaded scanned combined two-volume `taqribmaram(2).pdf`, printed volume II:264–268 = **physical PDF pages 559–563**, five original page images actually rendered and inspected.
- **Independent printed *matn* witness:** original Cairo **1912 *Tahdhīb* printed pp.109–110**, a control for the base lemmata only. Embedded quoted al-Taftāzānī parentheticals, Sanandajī running explanation, scripture and later individual lower marginal notes remain distinct.
- **New bilingual source JS:** `continuous-II264-II268-khulud-and-exit.js`, containing **30 short direct upper original Arabic–English units**, **1 continuous preliminary transcription and translation of the whole SHORT UPPER register of printed II:264** (overlaps the short units), and **2 separately situated, source-read extended lower excerpts** under individual writer **UNASSIGNED**. It never labels them Wasīm merely by lower typography.
- **New complete stage bilingual dossier:** `editorial/2026-11-03_STAGE27_II264_II268_KHULUD_PARDON_SOURCE_TRANSLATION.md`. It preserves all source words, close English, theological/language apparatus and original page citations.
- **Reader:** `index.html` now loads the JS, links the dossier and links `editorial/2026-11-03_STAGE27_FULL_HANDOFF.md`; its accessible **two progress bars remain 615/615 indexed and 0/615 fully critically certified**. The 601/615 page-orientation proxy remains unchanged.

### Critical source observations

1. At printed **II:264**, an authentic new `فصل` discusses permanent abode in Paradise and the Fire. The **complete short upper printed passage** (NOT the longer lower register) was provisionally transcribed and translated, carefully preserving that the children's status is described as `عند بعضهم` (“according to some”), a reported position rather than a universal editorial conclusion.
2. The lower `SAN27.G.II264.01` explains the precise choice of `من دخل الجنة` (“one who has **entered** Paradise”) rather than simply `المؤمن`: a sinful believer might first pass through punishment before admittance. **Eternal residence once admitted** does not entail **immediate entry**.
3. At **II:265–266**, keep the scholastic pronouns `فعندهم` (opposing reported position) versus `وعندنا`, and the possible alternatives `بل يعفى عنه` (may be pardoned) versus `أو يخرج من النار بعد حين` (or may eventually leave the Fire). None may be silently collapsed into another.
4. The argument draws upon a reward due **by divine promise** in the commentator's formulation and **by reason** on a reported competing view; it continues the original II:261–263 promise-versus-desert discussion. The hypothetical perpetual suffering after a single drink of wine following a lifetime of obedience tests proportionality rather than supplying a fixed legal calculation.
5. The lower `SAN27.G.II268.01` raises the explicit linguistic dispute whether `khulūd` is an unrestricted term for remaining while `taʾbīd` in `خالدين فيها أبداً` is a **restrictive** expression, not merely an **emphasis**. That is a source-reported hermeneutical possibility, not an automatically established interpretation of every scriptural instance.
6. The text's examples of grave sins, intentional murder, revealed warnings and reported Muʿtazilī doctrines must retain their rhetorical level as scriptural quotation, objection or doxographic claim. Do not certify their attribution to individual historical authors without other independent texts.

### Exact source and progress statistics

| Measure | After Stage 27 |
|---|---|
| Combined numbered source-page positions bibliographically indexed | **615/615** |
| Printed page positions with **some** English source orientation / short excerpt | **601/615** (97.72% **page-position presence only**, NOT fraction of text translated) |
| Whole printed pages having all main + every marginal note translated, independently proofed, historically attributed and critically collated | **0/615** (0.0%) |
| This stage's original source images directly reviewed | **5** (II:264–268) |
| This stage's short direct upper Arabic–English source records | **30** |
| This stage's continuous short UPPER printed passage (first-pass only, with many overlapping records) | **1** (II:264), **not a full printed page** |
| This stage's selected lower-register fragments with author UNASSIGNED | **2** (II:264, II:268); both larger surrounding lower texts remain incomplete |
| Newly positively identified Wasīm glosses | **0** |
| True whole-corpus Arabic-word and Wasīm-note completion fractions | **Unknown**, source corpus/author units not yet fully enumerated |

The previous Stage 26 full handoff remains an independently addressable complete snapshot; this **Stage 27 full handoff is another complete cumulative copy**, not merely a delta. Both historical snapshots and the current master have the exact latest original source and stage status at their respective dates.

### Required next work (Stage 28)

Directly inspect and translate printed original **II:269–274** (PDF **564–569**), beginning with the continuation of eschatological duration and progressing into the authentic original **`فصل` on divine forgiveness at II:270**. Preserve original page-crossing lemmas, distinguish the *aṣḥāb al-kabāʾir*, repentance, forgiveness and intercession, and separately identify each marginal `qawl`/objection. The next deliverables must include (a) actual source-language and English clauses, (b) individually attributed or **UNASSIGNED** marginal text, (c) honest source/critical progress and (d) a **full cumulative snapshot at the end of the stage**.

**Overall limitation:** all 615 printed positions are mapped but most original Arabic words in both volumes—particularly the ḥāshiya layers—are still **not** transcribed or translated. A definitive complete edition must not be claimed from a high orientation/page-presence number, and a Wasīm-specific percentage cannot yet be computed.
