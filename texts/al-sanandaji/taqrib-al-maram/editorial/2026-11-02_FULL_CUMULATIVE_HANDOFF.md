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
