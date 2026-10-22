# Darūrī — Hadith/Qurʾān source notes: editorial and UI audit (23 October 2026)

## What is fixed in the reader branch

- All **33 canonical Hadith notes** have **46 independently checked, unique Arabic phrase anchors** in the authored text. The inline **H** marker opens the *same* unified source-note dialog as the Qurʾānic **Q** marker and returns focus to the exact marker. Links are available from Arabic reading and the existing section-end Notes list.
- The 50 Qurʾān notes now lead with a *small, exact excerpt* of the associated **Tanzil Uthmānī āyah** in Arabic, surrounded by Qurʾānic brackets, with the stable Q/note ID visually subordinate rather than absent. A verse is not promoted from *possible allusion* to authorial quotation.
- Four explicit, subject-matched Qurʾān → Hadith relations are linked inside their relevant Qurʾān cards. They are **not** an automatic attachment of every Hadith in the same section: §64 seven aḥruf and the basmala are distinct cases; §119 sacrificial meat versus the other Qurʾānic example is distinct.
- Hadith notes first show their relevant collections as compact source links, no repeated heading/collection/methodology narrative. Expanding displays the full original Arabic isnād and matn, a complete newly composed English translation, narrator, book/chapter, and **pre-modern assessments only where securely attributable**. Individual variants are kept separate and identified by their transmitters and issues. The earlier source-note data/IDs/links and 137 PDF editions are not rewritten.
- Source superscripts are plain text **Q/Q1** or **H** without an adjacent ornamental external-link icon; source links inside notes remain ordinary accessible hyperlinks, and all styles inherit dark/light/Andalusian CSS tokens.

## Independent text review and limitations

The existing 47 source records use well-vocalised Arabic originals from their collections: an audit of 6,405 Arabic tokens in the 46 source shards found 608 without any vowel mark, overwhelmingly the repetitive formula `صلى الله عليه وسلم` and a few invocations. The original source files are preserved byte-for-byte. Presentation applies the conservative vocalised spelling `صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ` and standard invocations for `رَضِيَ اللَّهُ عَنْهُ/عَنْهَا/عَنْهُمَا`; it does not fabricate vocalisation for an uncertain isnād or different recension. The 47th Muslim 1297 text is likewise preserved. Comprehensive critical collation of every transmitter name and vowel across printed witnesses remains a separate scholarly verification task.

**Traditional judgments, not modern grades.** Visible source cards intentionally **ignore `report.grades`** imported from scraped metadata, which can contain assessments attributed to al-Albānī, Darussalam or other modern graders. For selected instances they display only statements traceable to classical authorities: e.g. Ibn Ḥajar, *Bulūgh al-Marām* no. 73 cites al-Tirmidhī and Ibn Ḥibbān on the report of Busra bt. Ṣafwān (Abū Dāwūd 181); al-Tirmidhī’s explicit `isnād not connected` on 1328; and the competing `marfūʿ/mawqūf` versions of Ḥafṣa’s fasting-intention report recorded by Abū Dāwūd 2454. Do not infer an assessment where there is none.

Secondary **evidence indexes**, not automatic endorsements: Ibn Ḥajar's *Bulūgh al-Marām* and *al-Talkhīṣ al-Ḥabīr*, Ibn Daqīq al-ʿĪd's *al-Ilmām bi-Aḥādīth al-Aḥkām*, al-Zaylaʿī's *Naṣb al-Rāya*, and al-Bayhaqī's *al-Sunan al-Kubrā*. Nūr al-Dīn ʿItr's *Iʿlām al-Anām: Sharḥ Bulūgh al-Marām min Aḥādīth al-Aḥkām* (Dār al-Farfūr, 4 vols., 1419/1998) is itself modern but can guide one to **actual pre-modern authorities** and conflicting routes; its personal modern grades are not presented as pre-modern judgments. Stronger/canonical collections are listed first **only when they actually contain the pertinent report**; no substitution based solely on collection prestige.

## Corrective follow-up still requiring scholarly sign-off

1. Independently collate all 47 full Arabic texts and AI-assisted English translations against printed editions, beyond the current unique-anchor and data integrity checks.
2. Compare *each* legal evidence case to classical aḥkām compilations, cross-reference transmitter variants in the original collections, and source each classical grade precisely. Only vetted comparisons should be published as new notes.
3. Review all 46 inline Arabic markers at true desktop and iPhone dimensions, especially collisions with dictionary, editorial and Q markers.
4. Ensure the no-JS fallback’s Hadith notes receive equivalent inline H markers in a separate static HTML build, rather than modifying the 259-section reference corpus by hand.

## QA acceptance

- 33 Hadith note IDs, 46 unique anchors, non-overlap and no inserted H inside authorial words.
- Inline H and Q share a single modal, preserve URL, scroll position and restore focus after closing.
- Only exactly identified related source collection records appear within Quran notes; Q-to-H relations are attached to passages, not merely to the same section.
- 47 original Arabic / 47 English local report IDs, full source names, no modern grades in visible source-card HTML, full diacritics in displayed formulae and correct mobile overflow.
- Preserve original 625 scholarly notes, 50 Qurʾān citations, 33 Hadith notes, 542 other apparatus items, printed PDFs and independently generated ZIP/offline exports.
