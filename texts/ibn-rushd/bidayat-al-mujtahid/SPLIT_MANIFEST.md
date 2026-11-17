# Bidāyat al-Mujtahid — edition split and content audit

**Date:** 2026-10-26. **Status:** Working public editorial previews, not completed text editions.

## Canonical routes

- Work gateway: `texts/ibn-rushd/bidayat-al-mujtahid/`
- Edition I — Law and Legal Reasoning: `law/`
- Edition II — Law and Human Life: `human-life/`

These are two separate HTML readers. Each also has a dedicated 25-case recovery page at `law/casebook/` or `human-life/casebook/`. Shared legal research is preserved in both; Edition I's casebook excludes all twelve separate formation-hypothesis blocks, while Edition II retains them. The original separately archived 25-case research edition remains unchanged under Gnamma Research. Switching editions navigates to the other edition, preserving the selected sample case and reader route.

## Migrated from the earlier combined public preview

| Content family | Edition I | Edition II |
| --- | --- | --- |
| Three introductory illustrative legal topics (intention/purification, dower/waiver, deposit/trust) | All three legal records | All three legal records, including the wider analysis |
| Text panel and language/focus controls | Yes; **Bidāya primary text still pending import** | Yes; same explicit source limitation |
| Legal-method and evidence relation cards | Both | Both |
| al-Ghazālī’s `al-Mustaṣfā` and Ibn Rushd’s `al-Ḍarūrī` methodological comparisons | Yes | Yes |
| Ibn Khaldūn and Aristotle/Aquinas conceptual relation cards | No | Yes |
| Historical concept/dictionary demonstrations | Six legal/method terms | All eight including `tawfīq` and `ʿumrān` |
| Research workspace chapters previously in `assets/gnamma-studies-data.js` | Four methodological chapters, without explicitly extended formation layers | All five chapters and their layers |
| Earlier Bidāya orientation notes from `assets/gnamma-preview-data.js` | Both, with strictly legal lenses | Both, with extended layers |
| Study routes | Legal disagreement | All four, including acts, common life, and spiritual horizon |
| Law-to-life relationship map, formation tabs and vertical horizon | Not included | Included |
| Sources/editorial method and coverage inventory | Legal scope | Legal and interdisciplinary scope |
| Recovered provisional alternative-uṣūl casebook: 25 case records, four countertests, 15 methodological articles, 28 reader applications, 115 source records | Full retained legal discussions at `law/casebook/`; formation fields removed | Same legal records at `human-life/casebook/`, plus 12 formation-hypothesis cards |
| Original 310-group/279-K-position canonical Revision16 analysis | **Unavailable**, not substituted | **Unavailable**, not substituted |
| Local notes and dictionary/citation panels | Preserved | Preserved |

All original source code and older pages remain recoverable through the Git history. The independent `research/usul-law-rushd/` research URL is retained for backward compatibility, but the relevant material is now integrated in the two editions.

## Strict scholarly limitation

This is an **extraction and separation of what was actually in the public prototype and research workspace**. It is not a claim that the entire `Bidāya` has been translated/ingested or that the canonical Revision16 corpus of 310 working groups and 279 K-position propositions was published. The three displayed legal cases are existing editorial topic records, not authenticated full juristic disputations; all source gaps remain visible.

The 57-book mapping, 72 editorial divisions, 854 recovered headings and 542 older reader addresses are distinct research measures, not counts of completed public analyses. Further migration requires retrieval of the actual canonical material, consistent section IDs, text/source verification, and source-controlled scholarly review.

## Maintenance

New legal case prose must be merged first into the shared legal case record before rendering both editions. New life/virtue/Khaldūnian/Thomistic/tawfīq links belong only in Edition II and must declare their historical or editorial relation type. Never reintroduce CSS-only edition switching, fabricate absent source words, or treat the law-to-life interpretation as a juristic operative `ʿilla`.

## 26 October recovery update

The repository now also preserves the earlier source-controlled qawānīn research dossier at `research/usul-law-rushd/qawanin/` and a non-destructive original-source packaging script at `research/usul-law-rushd/recovery/`. All nine main navigation, source/archive and edition pages passed a static internal-link existence check against the current repository tree (zero missing internal link targets); inline reader JavaScript parsed successfully. This is **not** physical mobile testing or confirmation that Pages deployed.

The original canonical masters are still outside this repository. Do not call the two editions a completed Revision16 restoration. They remain research previews until the original sources can be recovered and every distinct record class is parity-checked.
