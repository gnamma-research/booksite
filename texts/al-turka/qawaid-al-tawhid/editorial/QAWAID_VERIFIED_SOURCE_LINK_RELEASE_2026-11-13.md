# Qawāʿid / Tamhīd — verified source links and quiet reference cards

**13 November 2026 · Approved reference-linking implementation.** Applies to the bilingual integrated *Qawāʿid al-Tawḥīd* reader and the independently read *Tamhīd* commentary. **This is a presentation and scholarly citation-index release, not a revision to the critical source text, a new translation, or a manuscript collation.**

## What is published

The existing eighteen source cards have a separate, explicit evidence register in `qawaid-citation-policy.js`. It classifies **twelve cards eligible for exact inline references** (eight Qurʾānic passages, the poetic words of Labīd in a source-attested hadith context, and three quotations reproduced within the *Tamhīd*) and **six contextual comparison or attribution cards**. The distinction is not a claim that every eligible citation occurs in every unit assigned to it: a mark appears **only when the specified Arabic phrase really matches a text node in that exact attributed section**. No fuzzy semantic or doctrinal match is converted to a source citation.

| Group | Examples | Reader behaviour |
|---|---|---|
| Qurʾān (8 registered source cards) | 8:17, 24:40, 17:44, 16:40, 112:3–4, 28:30, 6:59, 3:117 | Exact Arabic phrase `inlineAnchors` matched in its registered commentary unit. Source card carries whole registered verse, English, precise reference and existing `quran.com` destination. |
| Poetic line with hadith context (1) | Labīd’s `ألا كل شيء ما خلا الله باطل` | The *poetry* is cited in Ibn Turka. The hadith card provides its separate Bukhārī/Muslim context; never implies the commentator quoted the isnād. |
| Direct quotations preserved in *Tamhīd* (3) | *Fuṣūṣ al-Ḥikam*, *Inshāʾ al-Dawāʾir*, *al-Ḥikma al-Rashīdiyya* | Show a marker only at the provenance register’s existing bounded Arabic quotation/verified opening. Source card explicitly states that this is a quotation *as reproduced in Tamhīd*, not a critical text of the other author’s independent work. |
| Independent comparisons (3) | Ibn Sīnā’s *Shifāʾ*, al-Ṭūsī’s *Ishārāt* commentary, al-Ḥillī’s explanation of *Tajrīd* | Existing verified comparative excerpts stay in **Parallels & reports**—not in the running text as if quoted verbatim by Ibn Turka. |
| Other reported references (3) | *al-Iʿtimād al-Kabīr*, *Theology of Aristotle*, “Hidden Treasure” | Separate source-grade labels, with the last explicitly **unverified** as a hadith attribution. No misleading inline verification mark. |

### Exact-span coverage acceptance

A complete source-unit browser pass registered **12/12 eligible cards** with at least one genuine inline match, and **13/14** individual assigned unit relationships with an inserted marker. The remaining assigned relationship, Qurʾān 24:40 at **SH-060**, did not contain the precise registered Arabic words. It remains a correctly classified source reference without an invented marker; the same Qurʾānic card **does** have an exact mark in SH-022.

The one formerly missed Qurʾānic marker (112:3–4 in SH-017) was resolved by an explicit **matching override** for the transmitted separated conjunction `لَمْ يَلِدْ وَ لَمْ يُولَدْ`, not by emending a source word, assuming an additional quotation, or modifying the original or English translation.

## Reading behaviour

**Normal (Focus 0):** one small, discreet gold `✧` marker, inserted immediately **after** the exact Arabic expression. The marker is a CSS-generated pictogram on an empty, accessible button: the source words remain plain text and are not replaced, split into hyperlink text, or altered in the canonical data. Tapping opens an accessible source card with its evidence grade, Arabic first, existing English/synopsis properly labelled, source/witness link and return to reading.

**Focus 1, Focus 2, Continuous and print:** the citation markers are absent. Automatic legacy “Sources” and “Terms” ribbons in section headings are hidden to keep immersion uncluttered. The source cards and full scholarly notes remain accessible through **Reading desk → Citations & sources**, **Parallels & reports**, the existing dictionary, and the scholarly PDF/reference pages. Reading options, text layers, bookmarks and personal notes remain intact.

**Standalone *Tamhīd*:** the reference module supplies the same source marks and an independently accessible lightweight citation card and optional two-group reference index. Closing a card restores the reading focus. The integrated reader continues to use its existing GNAMMA scholarly source-card dialog.

**Source URLs:** existing checked public HTTPS links are reused unchanged. If a link points to Ibn Turka’s *Tamhīd* as a **quotation witness**, the UI says so; it does **not** pretend to open the independently edited *Fuṣūṣ*, *Rashīdiyya* or other original. A GNAMMA book’s home page is not a valid substitute for an exact cited passage anchor.

## Critical data and privacy invariants

- Canonical **61 original and 110 commentary** Arabic and English units are **unchanged**; no word added to the historical source or to the published PDFs.
- Existing **18 source cards**, **82 dictionary entries**, subject index, existing edition/download links and local annotations are retained.
- Citation-grade mapping is explicitly reviewable (not inferred from similar phrasing), and the existing source locator cards remain the single source of evidence.
- No source data is transmitted to a backend to annotate; the module runs on the published client-side text. Personal notes remain local and outside the reference data.
- No independently source-verified **exact GNAMMA cross-book target** is presently registered. Such a target is not invented. The existing *Tajrīd* project landing page is **not** offered as an exact passage citation, and a partial or unverified translation of a cited work is not automatically linked as its original.
- *Qawtaw19*’s two historical textual questions remain correctly labelled in the separate critical apparatus. They are not silently “fixed” by changing a source link.

## Reproducible acceptance

The branch workflow `.github/workflows/qawaid-verified-citation-qa.yml` checks JavaScript syntax, actual source-grade counts, exact Qurʾān/Labīd/*Fuṣūṣ* anchors, source-card evidence language, return-to-reading, normal/focus/continuous display, absence of inline editorial banners, independent commentary support, source-index separation, and viewport widths **320, 390, 768 and 1280 px**. It also reruns the pre-existing study/UI, layered Arabic/English integrity and commentary-browser test suites.

**Important:** tested responsive Chromium/WebKit emulation should not be called a physical iPhone Safari visual certification. This acceptance does not establish that an exhaustive register of *every* possible scriptural or scholarly allusion in the 171-unit work has been completed; unverified candidates must remain in the editorial source audit rather than receive synthetic citations.
