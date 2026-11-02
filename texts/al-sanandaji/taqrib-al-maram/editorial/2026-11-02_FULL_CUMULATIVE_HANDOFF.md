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
