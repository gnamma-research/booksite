# Darūrī contents, subject index and PDF structure audit

Prepared 20 October 2026 against `6d7025a00bd3bd7161d317bfc1ae9fbaae088e9e`.

**Status: audit and redesign recommendation, not an implemented site or PDF release.** The current request asks for a deep investigation and suggested subject groupings. This record lets parallel work reuse the findings without confusing a proposal with published behavior. The current compact menus, fonts, page styles, print packets and citation release remain the release baseline.

## Recommendation

Use the book's four parts and recorded Arabic headings as the primary contents structure. Offer the 258 editorial section titles as an optional detailed layer within that structure. Present the academic index as a subject index with **By subject**, **A–Z** and one shared search. Place it before the dictionary in navigation and in reference matter that contains both tools.

The three aids have distinct purposes:

- Contents: where a discussion occurs in the book's unfolding argument.
- Subject index: where a concept, problem, argument, person or example is treated across the book.
- Dictionary: what a technical expression means, including its lexical history where available.

Do not label the 258 editorial numbered units as Ibn Rushd's chapters. Do not claim that all rubrics printed in the Arabic edition have independently established authorial or manuscript provenance.

## Evidence and limits

The audit compared the current reader data and rendering code, the conservative hierarchy in `ORIGINAL_HEADINGS.md`, the main-text prose at structural boundaries, all five current PDF bookmark trees, their printed contents and representative rendered pages. Primary Arabic text was cross-checked against the online transcription of Jamāl al-Dīn al-ʿAlawī's 1994 edition at <https://usul.ai/ar/t/daruri-fi-usul-fiqh>.

There are **46 recorded heading-bearing main-text sections**: 14 in Part I, 18 in II, 9 in III and 5 in IV. On the distinction between generic/ordinal headings and headings that name a substantive topic, 18 are generic/ordinal and 28 descriptive. These include parts, subdivisions, chapters, questions, sources, transmission levels and numbered discussions; they are not 46 uniform chapters. The unheaded opening and later colophon are separate.

The website preserves all 46 Arabic rubrics and their English translations. Its original-contents view already has a correct nested data structure, but displays it using always-expanded sections and lists. Its editorial view uses collapsible details. The user's complaint therefore concerns a real interaction and presentation defect, not missing source headings.

### Three distinct kinds of label

1. **Recorded heading:** `headingAr` and its existing `headingEn` translation.
2. **Topic or division announced in prose:** a useful caption supported by a passage such as §5, §10 or §100, but not another independently recorded rubric.
3. **Editorial reading title:** `section.title` and the present descriptive part labels.

Keep these distinctions visible without burdening every row with an essay. Explain them once in the contents introduction, use a restrained secondary style for explanatory captions, and retain the original wording.

## The four parts

| Reader range | Recorded Arabic part heading | Topic supported by the prose |
| --- | --- | --- |
| §§1–9 | No separately recorded heading | Opening discussion; “Introduction” is a navigation label. |
| §§10–61 | القول في الجزء الأول من هذا الكتاب | Inquiry into rulings. Section 10 announces definition, divisions, constituent elements and what manifests a ruling. |
| §§62–147 | القول في الجزء الثاني من هذا الكتاب | Sources of rulings. Section 62 enumerates the Book, Sunna, consensus and rational evidence concerning original negation. |
| §§148–229 | القول في الجزء الثالث من المختصر | Proofs used to derive rulings and how they are employed. The eight recorded numbered discussions cover wording, meaning, commands/prohibitions, analogy, approval and action. |
| §§230–258 | القول في الجزء الرابع | The independent jurist and juristic inquiry. Section 230 announces three chapters: ijtihād, taqlīd and weighing evidence. |

Section 5 expressly announces the fourfold plan; section 7 describes following al-Ghazālī's ordering. This is evidence within this text for its deliberate structure. It does not require a general historical claim that all classical readers always navigated books in one way.

### Descriptive headings already available

Examples include causes manifesting rulings (§55); validity and nullity (§56); performance, make-up and repetition (§57); original requirement and concession (§60); acting on solitary reports (§81); transmitter conditions (§83); criticism and accreditation (§94); abrogation (§115); consensus (§130); commands and prohibitions (§197); analogy (§210); ijtihād (§231); and taqlīd (§249).

Part III's eight discussions begin at §§151, 164, 191, 193, 197, 210, 227 and 228. Part IV's three principal chapters begin at §§231, 249 and 256. These are immediately useful navigation landmarks.

### Boundaries an implementation must preserve

- Abrogation §115 is directly under Part II, not beneath Sunna: §114 concludes the second source and discusses abrogation of both the first and second sources.
- Transmission levels §§101–105 belong under Sunna. Section 100 introduces their grouping in prose. Do not nest them beneath the preceding criticism/accreditation subsection or invent a recorded “Fourth Chapter.”
- Generic chapter §252 is within taqlīd §249. Section 255 concludes that subject; §256 starts the third chapter announced by §230.
- Section 24 ends one discussion and introduces general questions. The first question is announced in §25's prose without a separately recorded rubric. Do not mechanically nest all later questions beneath the nearest preceding generic chapter.
- Preserve the actual order of Part III's eight headings even where its conceptual introduction enumerates ideas in a different order.
- Keep the later colophon outside the four-part authorial text.

The existing 46-entry parent map passed checks for complete coverage, four correct roots, missing parents, cycles, chronological order and cross-part edges. Reuse it. Combining every editorial section into this tree additionally requires prose-aware boundary records; a nearest-previous-heading algorithm is insufficient.

## Recommended website contents

Title: **Contents**.

Supporting text: **Follow the book's parts and chapters. Show editorial section titles for a more detailed guide.**

Use one common structural frame: Opening text; Part I; Part II; Part III; Part IV; later colophon. Start with the opening expanded and the four main parts collapsed for a first visit. When returning from a passage, restore the reader's previous state or open its relevant ancestry.

Each part summary should contain the part number, a concise topic caption grounded in the text and its range. Within it, preserve the Arabic rubric and English translation, then show recorded chapters and subdivisions at their appropriate depth. Generic headings such as فصل can have an explicitly editorial topic gloss.

Offer one control, **Show detailed section titles**, rather than framing two unrelated lists as two competing organizations. If implementation initially retains two modes, name them **Book structure** and **Detailed section titles**, retain the same parts in both, and remember the chosen mode.

Provide Expand all, Collapse all, accessible native disclosures, keyboard operation and search that reveals matching entries with their ancestors. Include the later colophon as a separate entry. Keep native fallback destinations and print all needed headings when printing contents.

## Subject index

The current index has **302 main entries and 1,011 subentries**, whereas the website dictionary has **153 term dossiers**. The index is already broader than vocabulary: it includes knowledge, probability, authorship and method, correctness and error, people, schools, examples and Bidāya applications. Its alphabetical rendering conceals this range.

### Suggested subject groups

These are an editorial browsing taxonomy, not replacement chapter divisions or a completed assignment of every entry. Entries may belong to several groups.

| Subject group | Examples of existing index entries | Questions it helps a reader pursue |
| --- | --- | --- |
| Purpose, method and knowledge | Authorship and method; Craft; Knowledge; Logic; Certainty; Probability | What is uṣūl for? What counts as knowledge or a sufficient reason to act? |
| Rulings, actions and responsibility | Judgement; Obligation; Permission; Legal responsibility; Capacity; Coercion; Validity | What makes an act obligatory? Who is responsible? Does prohibition affect validity? |
| Sources and legal authority | Qurʾān; Sunna; Consensus; Earlier revealed law; Original nonliability; Abrogation | What establishes a ruling? How do sources relate? When does a ruling cease? |
| Reports, transmission and reliability | Reports; Mass transmission; Solitary reports; Transmitters; Probity; Narrator criticism; Written transmission | When can a report be accepted? What does reliable transmission require? |
| Language, grammar and interpretation | Indication; Ambiguity; Interpretation; Generality; Commands; Pronouns; Ellipsis; Exception | How does wording signify? When may an apparent meaning be qualified or interpreted? |
| Inference, analogy and legal grounds | Analogy; Effective ground; Syllogism; Testing and division; Concomitance; Welfare reasoning | What warrants extending a ruling? How is an operative ground identified? |
| Juristic expertise, disagreement and error | Ijtihād; Mujtahid; Taqlīd; Correctness and error; Preference; Conflicting evidence; Culpability | Who may exercise judgement? Can a mistaken jurist be excused? How is evidence weighed? |
| Legal examples and applications | Purification; Prayer; Marriage; Divorce; Sales; Ribā; Homicide; Bidāya applications | How is a methodological distinction illustrated in a concrete dispute? |

Offer **People and schools** as a secondary browse filter rather than forcing those entries into one substantive subject. Existing entries include al-Ghazālī, Mālik, Abū Ḥanīfa, al-Shāfiʿī, the Muʿtazilites and Ẓāhirīs. A later scripture-reference view can use verified Qur’an/hadith source data; do not imply it already exists or equate note counts with unique scriptural passages.

Keep **By subject** as a suitable first-visit view, **A–Z** for exact lookup, and one search across headings, aliases and subentries. Remember the selected view. Cross-list shared concepts; for example, probability belongs with knowledge, reports and juristic judgement. Reuse the same entries and section links so corrections do not drift between parallel indexes.

### Make subentries do the real work

A term-only card is insufficient. Under a subject, expose the indexed issue and its precise destinations. Existing examples include:

- Probability: different epistemic roles (§106); obligation to seek preponderance (§237); liability to mistake (§243); practical confidence (§250); recognition of preponderance (§257).
- Analogy: definition and original/derivative cases (§210); semantic extension rather than syllogism (§§212, 223); evidential force (§214); effective-ground methods (§220); limits of correlation (§222).
- Correctness and error: universal correctness (§237); objections (§238); rejection (§239); error versus sin (§242); nonculpable error (§243); determinate but fallibly known truth (§245).

Optional question routes such as **Can a jurist be wrong without being blameworthy?** should link to these established subentries. They are navigation aids, not a fourth set of lessons or unmarked claims about Ibn Rushd's conclusions.

An advanced edition/source-control filter can retain entries such as Manuscript voices outside the principal learning topics. The earlier print-note exclusions do not authorize deletion of scholarly index material.

## PDFs: actual state

Physical page numbers below refer to the current citation release.

| Edition | Pages | Printed original-heading contents | Current main-text bookmark structure |
| --- | ---: | --- | --- |
| Bilingual scholarly | 254 | Pages 4–5; 46 headings with indentation | Editorial parts, then editorial sections at one depth |
| Bilingual study | 139 | Absent; short part overview on page 3 | Same |
| English reading | 105 | Absent; short part overview on page 3 | Same |
| Arabic reading | 80 | Absent; Arabic part overview on page 3 | English editorial part and section labels |
| Fully vowelled Arabic | 76 | Absent; short overview on page 3 | English editorial part and section labels |

The scholarly editorial section contents occupy pages 6–10. Original rubrics appear in all five bodies, but they are rendered below the larger editorial section headings and do not generate PDF bookmarks. The later colophon is incorrectly nested beneath Part IV in all five outlines. Guide subheads also become top-level bookmarks. These are concrete corrections, not merely stylistic preferences.

In the scholarly PDF the historical dictionary begins on physical page 148 and the analytical index on 236. In the English PDF the glossary begins on 81 and the index on 90. Both should place the subject index first. Keep dictionary bibliographies and lexical source-control material with the dictionary and treat the concordance as a separate reference aid.

### Recommended PDF redesign

1. Give every reading edition a compact contents list of original parts and chapters near the front. Retain detailed editorial section contents where useful, especially in the scholarly edition.
2. Make recorded rubrics the visible structural headings in the body; render editorial reading titles as subordinate topic descriptions with their stable R/section numbers.
3. Derive the primary bookmark tree from the same validated source hierarchy. Retain all editorial section destinations in a separately labelled detailed branch when needed. Keep the colophon separate and guide subheads beneath the guide.
4. Use Arabic structural navigation in the Arabic editions, with translated editorial labels only where clearly identified and useful.
5. Group back matter under Reference tools and place the subject index before the dictionary. In print, a short subject-group guide can point into the retained A–Z index; duplicating all entries in two full lists would inflate the book.
6. Preserve the low-ink requirement: hierarchy through typography, spacing, fine black rules and indentation, with no filled panels or decorative graphics.

A bookmark-only correction can preserve pagination, but it does not fix the printed contents or body hierarchy. The complete redesign requires a coordinated rebuild. Recompute every website PDF destination by stable section ID; a global page offset is unsafe. Update the five PDFs, manifest, page maps, offline package and release record together and verify the resulting published bytes.

## Implementation locations and verification

- Website `index.html`: `renderContents`, `originalContentsRow`, `updateContentsList`, `renderIndex`, `updateIndexList`, primary nav order and return-state preservation.
- Shared structural evidence: `qa/ORIGINAL_HEADINGS.md` and `gnOriginalHeadingParent`.
- PDFs: `build/build_editions.py` (`PARENTS`, overview, detailed contents, back-matter order); `build/main_text.py` (source/editorial heading hierarchy); `build/styles.css` (bookmark levels and heading typography); `build/update_release.py` (destinations and manifest).
- Navigation order changes also update the compact-menu expected-order assertion.
- Add focused checks for disclosure/search ancestor visibility, restored return state, taxonomy coverage and cross-list deduplication, all 46 source heading destinations, all 258 editorial destinations, separate colophon and Arabic outline labels.
- Retain existing corpus, navigation, language, focus, source-note and all 84 lesson-print checks. Render representative long Arabic headings, contents pages, source transitions and reference tools before publication.

The study companion remains a distinct pedagogical document. Its lesson navigation and self-contained print packets should retain their own teaching sequence while linking to the common source structure.

