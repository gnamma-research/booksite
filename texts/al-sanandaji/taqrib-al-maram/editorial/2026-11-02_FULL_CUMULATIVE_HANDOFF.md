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
