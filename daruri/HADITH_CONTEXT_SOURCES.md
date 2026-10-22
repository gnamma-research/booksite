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

## Complete English renderings and reuse

The user-facing **unexpanded note stays concise**, with the existing scholarly source citation and a single chevron; this is the same disclosure principle as the Qurʾān context card. A user who expands it sees **the full Arabic report (including the isnād), and a complete newly written English translation of that Arabic record**, including transmitted dialogue, narrator qualifications, and any collector’s commentary that appears in the embedded record. The long al-Ḥudaybiyya report (`bukhari:2731`), al-Tirmidhī’s marriage transmission comparison (`tirmidhi:1102`), and the lengthy chain/fiqh notes are translated rather than summarised. The English text is loaded lazily only on expansion; all 47 primary report identifiers have their own English transmission.

These translations were newly composed for this project using AI assistance and reviewed for passage-level coverage, **not copied from the modern translated editions of Sunnah.com or open-source mirrors of their copyrighted texts**. They have **not undergone independent expert philological certification**. The UI labels them as complete editorial translations and retains the precise original Arabic with a direct reference link for checking. Do not describe a newly prepared translation as a critical edition, authenticated report, or authorised translation.

The original source-note English summary is not replaced and is *not* repeated as a substitute for the translation. If a local English shard is missing/corrupt, the popup explicitly says that full translation is unavailable and links to the primary collection rather than pretending that the shorter English synopsis is a full translation.

Source data provenance:
- [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api), pinned version `1`; the repository uses the Unlicense. Primary Arabic text is copied into source-bound local assets.
- [CheeseWithSauce/HadithsJSONFormat](https://github.com/CheeseWithSauce/HadithsJSONFormat), the source of eight specific Muslim letter-suffixed Arabic records, MIT-labelled repository. The remaining Muslim 1297 Arabic is separately sourced and cited.
- [Sunnah.com](https://sunnah.com) provides the stable report references and direct links, preserving letter suffixes and variant attributions.
- [LK-Hadith-Corpus](https://github.com/ShathaTm/LK-Hadith-Corpus), Altammami, Atwell & Alsalka (2019), for Bukhārī chapter segmentation and narrator indexing, independently checked where included.

## Fiqh / uṣūl cross-references

Ibn Ḥajar's *Bulūgh al-Marām min Adillat al-Aḥkām* is useful for quickly identifying and comparing **aḥkām** reports. Nūr al-Dīn ʿItr's *Iʿlām al-Anām: Sharḥ Bulūgh al-Marām* (Damascus, Dār al-Farfūr, four volumes, 1419/1998 edition) is useful for chain/wording criticism, fiqh derivation and cross-madhhab argument. These are **supplementary indexes/commentary, never replacement primary citations**. Ibn Rushd's text is an `uṣūl` treatise, so legal-example reports benefit most from aḥkām cross-checks; epistemic questions (khabar al-wāḥid, tawātur, etc.) require additional uṣūl and hadith-methodology contexts. No unverified secondary parallel has been added as an exact reference.

## QA / release gates

- 33 note IDs, all 47 distinct primary report IDs, no invented source for §189; preserve unresolved qualifications in §§31 and 88.
- Sort Bukhārī, Muslim before other cited collections but preserve distinct variants and cannot silently drop citations.
- 47/47 local full Arabic report assets valid with explicit provenance; chain retained and Islamic source/grade names not mixed.
- Matching Hadith context in both the inline source modal and end-of-section Notes, without overwriting Qurʾān context.
- Offline ZIP and service worker assets present, local `file://` loading (not fetch JSON), themed dark/light/Andalusian layout, keyboard and phone collapse/expand state.
- **47/47 complete original English transmissions** in ten offline shards (`hadith-context-english-*.js`), with source-specific isnād, event and collector commentary coverage. Human scholarly review remains a separate quality gate, not a condition silently represented as completed.

No existing Qurʾānic notes, edition PDFs, or source data policies have been rewritten to enable this optional web-only feature. Any future print use of these newly composed English renderings requires separate editorial review.
