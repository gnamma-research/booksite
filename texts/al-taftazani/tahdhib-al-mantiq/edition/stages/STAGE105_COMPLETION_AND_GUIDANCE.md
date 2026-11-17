# Stage 105 — complete five long Q127–134 glosses; extend source reading to note 23 on Q135

**9 November 2026 · distinct secondary H layer, not Y / T · source status: searchable Qum print; not photo-certified.**

## Stage actual output

**New English first-pass translation written in this stage:** ~3,323 whitespace-separated words; five earlier incomplete notes (2, 8, 9, 12, 15) have materially expanded English translations reflecting all visible numbered-note argumentative clauses, and five new notes (19–23) have first-pass complete English. The prior data and English *are not overwritten*: [Stage104 original](../hawashi-numbered-notes-stage104.js) is preserved and the [Stage105 changes](../hawashi-numbered-notes-stage105.js) contain an explicit `overrides[]` / `appends[]` manifest. The latest [numbered-note reader](../hawashi-numbered-notes.html) merges those versions by stable `HWN-###` ID so that earlier draft history is recoverable.

**Cumulative counted state after Stage105:** **22 / 23** numbered opening glosses have complete first-pass English *of the digitally visible historical note*. **Note 1** remains partial because later inserted quotations in the opening source have not been separately collated or fully translated. This percentage is scoped **only** to notes **1–23** in **Q127–135**, not to H's hundreds of later glosses. **0 / 274** substantive later-gloss printed pages has a complete certified Arabic–English transcription; **0/110** principal Y printed positions are independently photo/manuscript certified. Historic modal classification remains **46/46**, historical modal-result certification **0/46**.

## Five larger notes genuinely finished in first pass

| Note | Printed source | Previously missing material now accounted for |
|---:|---|---|
| **2** | [Q127](https://ablibrary.net/book_content/b/12170/127), [Q128](https://ablibrary.net/book_content/b/12170/128) | Nominal sentence vs verbal clause; al-Zamakhsharī's two kinds of advancement; Taftāzānī's examples and alternate aḥmadu-derivation |
| **8** | [Q128](https://ablibrary.net/book_content/b/12170/128), [Q129](https://ablibrary.net/book_content/b/12170/129) | Kufan/Basran coordination distinction; full reported polemic over ʿalā versus proper name ʿAlī, poetic analogy and alternative transmitted reading; claims attributed to speaker rather than authenticated |
| **9** | [Q129](https://ablibrary.net/book_content/b/12170/129), [Q130](https://ablibrary.net/book_content/b/12170/130), [Q131](https://ablibrary.net/book_content/b/12170/131) | Two paradoxes of beginning, self-grounding and scope restriction, three senses of “beginning,” all nine paired possibilities, author's objection to arbitrary exclusion of relative-relative, contextual reversed order, and two dispreferred replies |
| **12** | [Q131](https://ablibrary.net/book_content/b/12170/131), [Q132](https://ablibrary.net/book_content/b/12170/132) | Voluntary ḥamd vs wider madḥ, al-Zamakhsharī, Taftāzānī's implicit “beautiful act,” praise of God's eternal attributes, and two replies; later al-Ṭabāṭabāʾī excerpt kept outside this numbered note |
| **15** | [Q133](https://ablibrary.net/book_content/b/12170/133), [Q134](https://ablibrary.net/book_content/b/12170/134) | Divine name derivation and al-Jawharī's counterview; proper name vs universal necessary-existence concept; tahlīl argument; limits of conceiving divine essence; Qurʾānic predication of “one” and alternative meanings |

**All five remain uncollated first-pass English**. The edition does not claim secondary witness variants nor verify every hadith's authenticity.

## Five entirely new first-pass note translations

Notes **19, 20, 21, 22 and 23**, all printed [Q135](https://ablibrary.net/book_content/b/12170/135), now have standalone source-linked English:
- **19:** generic vs exhaustive force of the definite article in al-ḥamd;
- **20:** predication with a descriptive aspect indicating an explanatory cause, e.g. honour the scholar *because* of learning;
- **21:** conjecture of the glossator that the earlier commentator regards a subtle explanation as his own contribution;
- **22:** two meanings of guidance—showing what leads and successfully leading—plus opposing Qurʾānic counterexamples and differing argument frames;
- **23:** capacity to convey someone toward the goal distinct from accomplished delivery.

The next note **24**, beginning on Q135, is *not* claimed as translated or counted in the opening 23-note cohort. It contains the debate over explanatory `أي` (apposition vs coordination), strengthened by pronoun-construction arguments and Ibn Hishām's criticism of al-Zamakhsharī. The following notes through Q140 belong to subsequent stages.

## Stage durability / no double counting

1. Immutable [Stage104 report](STAGE104_TRANSLATION_AND_PROGRESS.md) and [Stage104 first-pass note file](../hawashi-numbered-notes-stage104.js) remain intact. Stage105 only adds the overlay file, never overwrites historical translations.
2. [`progress-data.js`](../progress-data.js) now records Stage105, preserved preceding 102–104, current 22/23 first-pass note cohort, and unchanged conservative worldwide denominators.
3. [`HANDOFF_LATEST.md`](../HANDOFF_LATEST.md) gives the newest exact restart sequence. Stage106 should begin with note **1's late additions** and then note **24** from Q135, continuing across Q136 and beyond.
4. Keep the original main Taftāzānī **19** logic divisions, separate **1,044** kalām clauses, full working **110-position** Yazdī main ḥāshiya, 52 earlier H page excerpts, and all 46 source-typed modal cases as *different* completion metrics.
5. If a source note includes end-of-page cliffhangers, translate by historical **numbered note**, carrying the text into the next printed page. Give author signatures, printed page links, and explicitly retained late twentieth-century quotations distinct contributors.

## Required repeatable tests and release check
- Update `tools/tahdhib/check_stage_handoff.py` for overlays, resulting note IDs `HWN-001` … `HWN-023`, **22 complete, 1 partial**, eight bars, stage sequence 102/103/104/105; check duplicates/revision declarations and `scanCertified:false`.
- Update `tools/tahdhib/handoff_reader_qa.mjs` for Chromium/WebKit desktop/mobile: 23 cards, 22-complete/1-partial filters, search HWN-022, 8 metrics and 4 stage cards.
- Retain all previous Tahdhīb logical core, source and reader regressions. Merge only after verification passes. A repository merge is not independent manuscript certification.

## Safe restart prompt after a chat failure

> Continue Tahdhīb Stage106 in `gnamma-research/booksite` from latest merged master. Read `texts/al-taftazani/tahdhib-al-mantiq/edition/HANDOFF_LATEST.md`, `progress-data.js`, stage104/stage105 reports, both `hawashi-numbered-notes-stage104.js` and `hawashi-numbered-notes-stage105.js`. Stage105 completed 22 of the first 23 notes, leaving only note 1 partial. Finish source-layer separation and translation of note 1; continue note 24 onward from Q135–136 with complete numbered-note English and short Arabic page locators; retain exact attribution and no photo-certification claims. Append immutable stage106 source files, update cumulative reader/progress/handoff, check all CI before merge.
