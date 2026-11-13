# Qawtaw21 — expanded Qurʾān, hadith and Akbarian source concordance

**13 November 2026 — source-scoped scholarly linking release.** Supplement to the already completed Qawtaw19 edition and citation-linking system. All links are navigation and evidence apparatus, not Arabic critical-text emendations.

## What was actually examined

- **61/61 original authorial matn units** and **110/110 Tamhīd commentary units** (including the 40-unit prolegomenon) were scanned for explicit quotation marks, source-attribution formulae, named authors and works, direct Qurʾānic references and hadith language.
- The machine-generated review queue contains **99 flagged citation candidates in 42 distinct units**: 68 spans enclosed by quotation marks, 10 named-work matches, five named-author matches, 10 generic attribution phrases, five explicit divine-speech formulas and one expressly matched report formula. **These 99 are textual discovery hits, not 99 established independent references; quotation marks often enclose the author's own arguments or ironic terms.** The scan cannot exclude unmarked allusions.
- Existing cited sources were checked for identity and verse/hadith locator. The new primary-source cards reflect only a reviewed subset. Suspected parallels lacking a secure reference remain absent from the running text.

## Source cards: 18 baseline + 11 scholarly additions

The original 18 source cards remain unchanged in `data/primary-reference-register.js` so that [Qawtaw16 PDF and source acceptance](../qa/qawtaw16-final-acceptance.json) continues to match its source data. **Eleven new online-only cards** are a separately loaded `data/qawtaw21-source-extensions.js` file. Together, the **interactive reader has 29 source cards**. Additional references do not alter any of the five published PDF files, their manifest, the 82-term dictionary, or the source/translation ledger.

| New reference | Reader passage | Evidence and caution |
|---|---|---|
| Qurʾān 18:17, guided and unguided | SH-060 | Existing closing Quranic wording; whole verse and exact online source |
| Qurʾān 42:11, `ليس كمثله شيء` | SH-029 | Identified exact scriptural phrase; whole verse, not the author's metaphysical interpretation |
| Bukhārī 3197 / Muslim 1679, the revolution of time | SH-051 | Identifiable quotation with visible wording variants, not falsely represented as a verbatim copy of the canonical hadith |
| Ibn ʿArabī, *Inshāʾ al-Dawāʾir*, humanity's outer and inner copies | SH-039 | Named lengthy direct quotation; original-work text independently located, not manuscript collated |
| Ibn ʿArabī, *Fuṣūṣ al-Ḥikam*, mirror and reflexive vision | QT-041 | Quoted and critiqued in the ancestral matn; linked to the original's Adamic wisdom chapter |
| Ibn ʿArabī, *Fuṣūṣ al-Ḥikam*, `فلا تنظر العين إلا إليه` | SH-041 | Distinct direct line in the Hūdian wisdom; not confused with the nearby Ḥallāj quotation |
| Ibn ʿArabī, *Futūḥāt al-Makkiyya*, proportion of temporal to eternal | SH-041 | Named and delimited passage of chapter 3; variant wording noted |
| Ibn ʿArabī, *Futūḥāt al-Makkiyya*, four worlds and the human microcosm | SH-053 | Named and reproduced extended passage of chapter 6; historic cosmological model, not modern empirical claim |
| Muslim 2814, the Prophet's companion (*qarīn*) | SH-053 | Identified background report, **paraphrased** by Ibn Turka; not automatically given a false direct quotation marker |
| Statement attributed to ʿAlī on seeing the Lord | SH-041 | Later source attribution, not independently isnād-validated |
| Statement attributed to Jaʿfar al-Ṣādiq on gathering and distinction | SH-026 | Sufi maxim reproduced later, **independent chain unverified**, kept as attribution |

The existing Qurʾān 24:40 card now includes **SH-020** as a recorded citation candidate, alongside SH-022 and the formerly reported SH-060 relation. A reference card need not have an inline marker when the received Arabic cannot be matched exactly. The historical text is never rewritten to manufacture a match. (A short direct citation can appear where an attested source phrase itself matches the printed text.)

The `qawaid-citation-policy.js` register distinguishes **20 eligible direct citations** from **nine contextual comparison / attribution cards**. A record's eligibility does *not* automatically establish a marker in each listed section: a separate browser pass must locate an actual exact Arabic span. Only the **Normal** reading mode carries discreet marks. All three immersive states, print output and continuous reading are free of source marks and in-paragraph editorial remarks.

## Seven exact GNAMMA reading destinations

All seven links are **reviewed editorial conceptual comparisons**, **not proof of direct quotation, shared medieval textual dependence or a common manuscript reading**. They are presented in a separate **Reading desk → Across GNAMMA** panel; the independent Tamhīd commentary has the same options in its optional *References & parallels* index.

| From Qawāʿid/Tamhīd | Reader | Exact published destination | Comparison |
|---|---|---|---|
| SH-INTRO-011 | Qūnawī, *al-Nuṣūṣ* | QUN-NU-001-A | Nondetermination and whether being is predicated |
| SH-026 | Qūnawī, *al-Nuṣūṣ* | QUN-NU-020-A | Absolute unity and opposition |
| SH-029 | Qūnawī, *al-Nuṣūṣ* | QUN-NU-015-A | Essential and names-based perfection |
| SH-039 | Qūnawī, *al-Nuṣūṣ* | QUN-NU-019-C | Divine/human correspondence |
| SH-INTRO-030 | Qūnawī, *al-Nuṣūṣ* | QUN-NU-020-E | One existence and its determinations |
| QT-005 | Ṭūsī, *Tajrīd al-Iʿtiqād* | matn/4 | Existence as a common concept rather than a verbal equivocation |
| SH-015 | Ṭūsī, *Tajrīd al-Iʿtiqād* | matn/38 | Predication by gradation (*tashkīk*) and subjects of existence |

A Qūnawī reader change preserves the selected `#work=QUN-NU&passage=...` address on initial loading, so it actually functions as a deep link rather than silently returning to the book's home. Ṭūsī's sourcebook already supports exact `#matn/ID` routes. Target Arabic and indexed passage IDs were checked from the working source readers; neither system has been elevated to manuscript-established textual authority.

**No new invented `Fuṣūṣ` GNAMMA reader link** is offered when an exact GNAMMA textual passage ID is absent; a checked external source page is used instead. Likewise, Ibn Turka's direct quotation of Ibn ʿArabī's *Dawāʾir* must not be confused with a Qūnawī doctrinal parallel.

## Verification and preservation

- [Full candidate detection script](../qa/qawtaw21_discover_references.mjs) and [cross-reader source audit](../qa/qawtaw21_crosswork_audit.mjs) preserve the difference between detection and verification.
- [Qawtaw21 browser acceptance](../qa/test-qawtaw21-expanded-links.py) checks 29 online source cards, grade counts, all seven cross links, exact source-marked Arabic where available, mobile sizing, the Qūnawī and Tajrīd destination routes, and preservation of the author's source text.
- [Baseline Qawtaw16 acceptance](../qa/qawtaw16_final_acceptance.py) continues to test the **unmodified original 18-card source register**, the 171-unit corpus and five PDF bytes/hashes. The new online source layer never changes those accepted files.
- The underlying two Qawtaw19 text-critical exceptions (SH-002 and QT-059) remain source-limited as previously documented, not silently emended.

**Scope caveat:** A reviewer seeking an *exhaustive* catalogue of all intertextual influences should not mistake the 99 machine-flagged candidate strings, eleven reviewed additional source cards or seven explicit conceptual comparisons for a critical *total concordance* of every possible unmarked borrowing. Further review can use the retained audit queue without polluting the reader.
