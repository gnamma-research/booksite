# Darūrī · Qurʾānic context sources and scope

This file documents the optional, expandable Arabic/English Qurʾānic context in `quran-context-data.json`. This data is editorial apparatus, **not authorial text**. The reader retains the existing source notes, their IDs, the distinction between verified quotations and possible verbal parallels, and the original link to the full passage on Quran.com.

## Arabic text

Tanzil Quran Text (Uthmani, Version 1.1), Hafs, obtained via the [dotquran/corpus](https://github.com/dotquran/corpus) verse-numbered archive generated from Tanzil; no corrections, modernization, diacritic removal or editorial alterations have been applied to the verse strings. The corpus stores non-verse basmalas separately, so they are not wrongly counted as verse 1. Verse-text spelling is maintained verbatim.

Tanzil Quran Text  
Copyright (C) 2007–2021 Tanzil Project  
License: Creative Commons Attribution 3.0

This copy of the Quran text is carefully produced, highly verified and continuously monitored by a group of specialists in Tanzil Project.

**TERMS OF USE**
- Permission is granted to copy and distribute verbatim copies of this text, but **CHANGING IT IS NOT ALLOWED**.
- This Quran text can be used in any website or application, provided that its source (Tanzil Project) is clearly indicated, and a link is made to [tanzil.net](https://tanzil.net) to enable users to keep track of changes.
- This copyright notice shall be included in all verbatim copies of the text, and shall be reproduced appropriately in all files derived from or containing substantial portions of this text.

See [Tanzil text license](https://tanzil.net/docs/Text_License) and [updates](https://tanzil.net/updates/).

## English translation

Muhammad Marmaduke Pickthall, *The Meaning of the Glorious Koran* (1930), public-domain English translation. Verse-numbered machine-readable witness: [risan/quran-json, english_pickthall.json](https://github.com/risan/quran-json/blob/main/data/extra/english_pickthall.json). The displayed English is explicitly identified as Pickthall's **translation of the meanings**; it is not represented as Arabic scripture or as Ibn Rushd's own translation. Source wording is retained.

## Editorial display rules

- The base/source note remains compact. Only a deliberate expansion reveals complete verse text and its translation.
- Show the full cited verse or every verse in a cited range, plus **one verse before the range and one after**, where available within the *same sūrah*. Do not invent 0th verses or silently cross sūrah boundaries.
- For notes citing different sūrahs or non-adjacent passages, present distinct labelled ranges.
- Apply Qurʾānic brackets `﴿ … ﴾` to **Arabic scripture only**; do not wrap Ibn Rushd's words or Pickthall's English translation in Qurʾānic brackets.
- Highlight the referenced verse(s), but never imply that a **possible allusion** constitutes a verified verbatim quotation.
- All 50 cited-note IDs and 53 explicit references are generated from `build/data/quran-source-notes.json`. The context collection deduplicates 132 verse records.
- The data bundle is downloaded only when expanded; it is also pre-cached for offline use and included in the complete downloadable website/PDF ZIP.
- The reader does **not** substitute these context expansions for the full tafsīr or the authorial note apparatus.

If the canonical notes gain or lose a citation, rebuild the context data from verified source corpora and rerun `qa/verify-quran-context.js`; do not generate new Quran text or translations with an LLM.
