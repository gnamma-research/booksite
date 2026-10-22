# Darūrī — Hadith source context, attribution and licensing

## Purpose / scope

This reader enhancement is **editorial apparatus**, not authorial text. It adds a compact chevron to existing scholarly Hadith notes (`HAD-R...`), followed on deliberate expansion by the **individual primary collection transmissions**. The current scholarly source map contains **33 note records in 33 sections, 55 primary collection citations referring to 47 distinct report identifiers**, plus a section (§189) whose precise source remains unidentified. These counts are release-gated by `qa/verify-hadith-context.js`.

The ordinary source note, original note IDs, quoted Ibn Rushd wording, footnotes, Reader Desk and printed/PDF editions are not replaced. No Hadith report is retroactively turned into an authorial quotation. Two cited collections are not asserted to carry identical text or isnād, nor is an unresolved attribution silently cured.

## Which source first?

Within the verified citations already recorded **for that note**:

1. Ṣaḥīḥ al-Bukhārī
2. Ṣaḥīḥ Muslim
3. The other referenced primary collections, with references to Abū Dāwūd, al-Nasāʾī, al-Tirmidhī and Ibn Mājah kept explicitly separate.

**Priority is not substitution.** A report in Bukhārī or Muslim only supersedes a lower-ranked source as the main *parallel* if it actually supplies the proposition/wording. If the collections transmit different incidents or legal arguments, both must remain visible and labelled. **The order is bibliographical rather than a blanket authenticity judgement** on each isnād or a rejection of named route-specific grades. Multiple scholarly grades are displayed with their respective graders where available, rather than assigned unqualified to the entire report family.

## Text, narrators, book and chapter metadata

The full Arabic primary-source transmission (including its isnād and any wording/collector's remarks in that reference record) is retained **source by source**. This is distinct from short excerpts quoted or paraphrased by Ibn Rushd. The Arabic files are locally packaged and pre-cached for offline reading; large reports begin collapsed to avoid swallowing a small phone screen.

Metadata fields are independent. Display the collection and report ID for every report; display the book/kitāb and chapter/bāb **only when checked against the specific collection entry**. The principal Companion or other reporting narrator is shown when independently resolved; the complete Arabic chain remains accessible even where the narrator label is not supplied. For Bukhārī, some chapter/narrator rows come from the Leeds/King Saud LK-Hadith-Corpus (its Bukhārī segmentation was reviewed by the corpus authors); selected source cards were additionally checked directly against Sunnah.com's collection and chapter headings. Do not use automatically segmented rows from a different numbering scheme without a verified crosswalk.

Sahih Muslim numbers with suffixes (`360a`, `977a`, etc.) must **not** be reduced to integers or looked up by the unrelated global sequence in fawazahmed0/hadith-api. Arabic for those reports has been matched to **the literal printed reference string** in the manuscript-like book JSON; `muslim:1297` was checked against the original source entry separately.

## English and reuse

Six initial reference cards have **new editorial English renderings** written for this reading project, plus additional verified Bukhārī cards. For the remaining reports, the existing scholarly source note provides the argument's context, while the card links to the complete published Arabic/English on Sunnah.com. These **must not be labelled full translations**. This preserves the original Arabic in the offline package but does not yet claim complete, independently checked English translation for every report.

Arabic source witness:
- [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api), pinned branch/version `1`; its repository uses the Unlicense. The actual individual Arabic complete text is stored in `hadith-context-arabic-*.js`.
- [CheeseWithSauce/HadithsJSONFormat](https://github.com/CheeseWithSauce/HadithsJSONFormat), its publicly available hadith collection JSON under an MIT project licence. The original, medieval Arabic text is public domain.
- [Sunnah.com](https://sunnah.com) links supply the public traceable numbering, separate chapter headings, collector's references, and the published translations. **Do not redistribute a complete modern third-party English translation merely because a GitHub scraper advertises an open-source licence.**
- [LK-Hadith-Corpus](https://github.com/ShathaTm/LK-Hadith-Corpus), Altammami, Atwell & Alsalka (2019), *The Arabic–English Parallel Corpus of Authentic Hadith*, cited for Bukhārī chapter segmentation and narrator indexing, subject to direct source checks.

## Fiqh / uṣūl cross-references

Ibn Ḥajar's *Bulūgh al-Marām min Adillat al-Aḥkām* is useful for quickly identifying and comparing **aḥkām** reports. Nūr al-Dīn ʿItr's *Iʿlām al-Anām: Sharḥ Bulūgh al-Marām* (Damascus, Dār al-Farfūr, four volumes, 1419/1998 edition) is useful for chain/wording criticism, fiqh derivation and cross-madhhab argument. These are **supplementary indexes/commentary, never replacement primary citations**. Ibn Rushd's text is an `uṣūl` treatise, so legal-example reports benefit most from aḥkām cross-checks; epistemic questions (khabar al-wāḥid, tawātur, etc.) require additional uṣūl and hadith-methodology contexts. No unverified secondary parallel has been added as an exact reference.

## QA / release gates

- 33 note IDs, all 47 distinct primary report IDs, no invented source for §189; preserve unresolved qualifications in §§31 and 88.
- Sort Bukhārī, Muslim before other cited collections but preserve distinct variants and cannot silently drop citations.
- 47/47 local full Arabic report assets valid with explicit provenance; chain retained and Islamic source/grade names not mixed.
- Matching Hadith context in both the inline source modal and end-of-section Notes, without overwriting Qurʾān context.
- Offline ZIP and service worker assets present, local `file://` loading (not fetch JSON), themed dark/light/Andalusian layout, keyboard and phone collapse/expand state.
- Original English **full translation coverage remains incomplete**, as declared above; no assumption of rights for third-party translations. Future editors can add independently translated/checked text under `englishOriginal`, with translator/verification credit.

No existing Qurʾānic notes, edition PDFs, or source data policies may be rewritten to enable this optional web-only feature.
