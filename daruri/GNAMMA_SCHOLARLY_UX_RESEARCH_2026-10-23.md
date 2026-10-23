# Gnamma as a scholarly cognitive workspace: research foundations, audit and evaluation protocol

**Date:** 23 October 2026  
**Evidence state:** literature review and repository inspection, *not* observed user testing.  
**Baseline:** Darūrī master at 97ef9f76 (23 October); check latest master before implementation.  
**Scope:** text reading, scholarly notes and sources, bilingual correspondence, research search, Reading Desk, navigation, preservation and downloads, especially mobile.  
**Implementation boundary:** This document changes no product UI, canonical Arabic, translations, notes, user data, PDFs or source packages. Recommendations are hypotheses until tested. Existing active pull requests have their own owners.

## 1. The work, not the website

The meaningful unit of usability is an **end-to-end scholarly task**. A reader may encounter an Arabic passage; compare its English translation; inspect the source Hadith, Quran or editorial note; follow a primary collection; reassess the interpretation; collect a quotation; compare another occurrence; annotate; cite; and return to the original passage. A tool with individually attractive screens can still make this sequence unreasonably expensive.

**Primary product hypothesis:** Gnamma should reduce interruption, remembering, re-finding, copying and loss-of-evidence costs enough to make rigorous digital scholarship preferable for some research tasks, while retaining the advantages of paper when paper is genuinely better.

This is more demanding than “fewer clicks,” “minimal design,” or “progressive disclosure.” It entails high task effectiveness, low overhead, epistemic correctness, durable user ownership, and the ability to resume an unfinished thought. ISO 9241-11 defines usability relative to specified users, tasks and context—not as an inherent property of software.

The strongest historical warning against assuming screens beat books comes from O’Hara and Sellen’s CHI 1997 comparison: paper supported rapid navigation, flexible spatial arrangement and annotation during reading. That study used 1990s software and hardware; it supplies a work-analysis hypothesis, **not** evidence that present-day Gnamma cannot do better. We should deliberately compare its tasks against contemporary paper, desktop and phone workflows.

The likely user groups differ in needs: (a) trained Arabic readers and researchers, (b) English-dominant academics working with parallel Arabic, (c) advanced students learning research methods, (d) occasional readers, and (e) researchers with accessibility or mobile-only constraints. Do not assume one layout is optimal for all, or that novice-friendly controls can replace advanced research capabilities.

## 2. Research lenses and what each contributes

These are complementary frameworks, not a catalogue to implement indiscriminately.

| Research tradition | Strong insight | Gnamma design implication | Important trade-off |
| --- | --- | --- | --- |
| Activity theory and cognitive task analysis (Kaptelinin/Nardi; Pirolli/Card) | The activity's goal, community, tools and constraints matter more than a particular interface element | Design around compare–verify–interpret–annotate–cite–resume, including switching between works | An expert's goal may be radically different from a casual reader's |
| Bates's berrypicking | Queries and information needs evolve during the inquiry | Preserve search trails, saved results and easy return to previous evidence, not only the latest search term | Histories can themselves create clutter or privacy risk |
| Marchionini's exploratory search | Lookup, learning and investigation are different search tasks | Keep simple word lookup fast; allow inspectable root/lemma, KWIC, filters and comparison only when needed | Powerful query controls can obscure reading if displayed by default |
| Pirolli and Card's information foraging | Readers infer where value lies from navigation cues (information scent) and weigh information against effort | A Hadith report's linked collection heading is more informative than several “Open source” buttons | Hiding verification too deeply weakens scholarly trust |
| Pirolli/Card sensemaking and Kirsh's external cognition | Persistent external representations help people organise and test interpretations | Reading Desk may evolve from a storage bin into a working evidence collection with source-backed comparisons and uncertainty | Introducing an evidence board before a demonstrated need risks feature overload |
| Cognitive Dimensions (Green/Blackwell) | Viscosity, hidden dependencies, visibility and premature commitment expose friction in complex tools | Audit how many repeated actions are needed to change language, reopen notes, revise a quote, or switch edition without losing position | Making one action easier may increase another's complexity |
| Goal memory and interruption/resumption (Altmann/Trafton) | Suspended goals need context cues to be reliably resumed | Back to exact passage, section/paragraph/language and scroll restoration; clear distinctions between current vs imported reading location | Restoring automatically can overwrite a user's chosen reading place |
| Cognitive-load research (Skulmowski) | Unnecessary interface operations compete with the cognitive demands of learning | Keep original reading unobstructed; compress redundant note metadata and show detailed sources on request | Over-compression can hide essential distinctions |
| Active reading (Tashman/Edwards) and Semantic Reader | Research reading involves annotation, spatial orientation, comparison, extraction and synthesis—not passive scrolling | Design annotations and reference navigation as reading companions, not detached chores | Automatically adding overlays may interrupt reading |
| Epistemic uncertainty in digital humanities | A useful interface cannot erase ambiguity merely to appear certain | Distinguish authorial source, editorial translation, possible allusion, exact citation, editorial morphology and unverified attribution | Too many warning paragraphs can obscure the underlying text |
| Inclusive design (W3C WCAG 2.2 and WAI-ARIA) | Usability varies with ability, assistive technology and interaction modality | Ensure dialog focus/return, keyboard and screen-reader labels, RTL/LTR isolation, touch targets and focus visibility | Mechanical ARIA compliance does not prove successful research use |
| ISO 9241-11/210 human-centred evaluation | Evaluate effectiveness, efficiency, satisfaction and context with actual users throughout iteration | Measure whole tasks, confidence and preservation errors rather than button counts alone | A dashboard of metrics without realistic tasks is misleading |

**Do not blindly borrow ecological-interface-design principles from safety-critical control rooms.** Their concern with representing work-domain constraints is instructive; evidence from those environments does not establish improved scholarly reading without a suitable adaptation and test.

## 3. What repository inspection supports, and what it does not

This is a **source-based audit**, not a visual/ergonomic study with actual research participants.

- The live reader offers named Reading, Focus and Continuous modes; Arabic/English reader views and scholarly Q/H/N notes are integrated. Current Hadith work offers 33 source-note locations, 47 original collection reports, 51 bilingual phrase links (102 H markers), and expanded Arabic/English texts. The newly merged PR #92 places primary source URLs directly on expanded report headings, removes duplicate links from the collapsed note, and keeps genuinely separate classical references available within expansion.
- The existing English publisher-note work has an audited 118-note mapping with four section-level fallback cases; that does **not** prove exact word-level translation equivalence everywhere.
- The Reading Desk maintains browser-local private bookmarks, annotations and highlights and has documented data-preservation, recovery and return-to-source protections. A Backup & Transfer workspace supports deliberate import/export; do not introduce invisible continuous cloud syncing or overwrite the device's reading location.
- Scholarly search has Quick Find and Research Search, source filters, concordance and locally indexed personal content. The more ambitious contextual morphology, terminology QA and mobile simplification are still separately under review in PR #77; do not claim they have shipped based on that PR.
- Exact Back/Forward, recents and reading-location backup are separately being addressed in PR #90. Coordinate, do not independently rewrite its navigation state ownership.
- Browser-only HTML-to-PDF generation remains an isolated research effort (PR #84); do not use it as a justification for changing published editions or removing fixed PDFs.
- Static source links, full offline packaging and PDF downloads exist. Their availability is not evidence that the iPhone viewing/downloading flow is cognitively clear; past feedback identifies confusion between Book PDF, Study Guide, offline reader and scholarly source package.

**Observed engineering evidence:** source files and regression scripts establish specific behaviours, integrity checks and deployment status. **Missing evidence:** measured completion time, understanding, trust, accidental tap rates and longitudinal performance for real Arabic/English scholars; independent physical-device accessibility verification; a direct comparison against reading on paper.

Related ownership: PR #92 merged; PR #77 search/morphology in development; PR #90 reading navigation in development; PR #84 research-only PDF. Check current PR heads before editing shared files.

## 4. Journey-by-journey diagnostic

### Reading without interruption

**Test task:** Read fifteen minutes of a difficult Arabic/English passage; change between Reading/Focus/Continuous and a dictionary entry; resume. Record disturbances from toolbars, animations, floating actions, overlays and in-text labels. A reader should always be able to recognise where they are without having to manage the interface.

Proposed changes to test: suppress nonessential visible controls until invoked; reserve fixed screen areas for reading; let contextual tool actions disappear after use; use consistent source identifiers in the apparatus; maintain exact passage coordinates across mode switches. Do not hide frequently used navigation merely to achieve a visually empty screen.

### Verifying an Arabic Hadith note

**Test task:** From §31, identify an Arabic phrase, open its H note, read one corresponding Arabic/English source report, open the original collection record and return to the same phrase. Repeat in English-only reading and with the two related reports in §31.

The just-merged linked-heading design reduces redundant actions. Verify the behaviour with a keyboard, VoiceOver on iOS, a 320–390 px viewport, and a long transmission. The expanded heading must disclose its external destination, open without replacing the reading session, and never imply that opening a reference proves authenticity. A disputed or unidentified attribution must retain its qualification. Genuinely additional references (e.g., al-Ṭabarī on an associated Quran reading) must not be lost when primary links are deduplicated.

### Investigating a technical expression across the corpus

**Test task:** Starting with a word such as qiyās or ʿilla, find the term literally, inspect variants/lemma/root and their provenance, compare at least two relevant sections, open an index or dictionary article, save findings and return to the original search without losing filters.

The core distinction is epistemic: **literal occurrence is not a morphological analysis, and morphological relatedness is not equivalence of a juristic concept**. Label each operation accordingly, display why a hit matched, and avoid promoting machine alternatives into canonical search indexes without validated evaluation. Test the ratio of useful results to false positives and the user’s interpretation of the labels, not just the count of retrieved items.

### Building an argument rather than collecting scraps

**Test task:** Collect two passages supporting different interpretations, attach a source reference and a personal comment, compare them while preserving original citations, then export the evidence to continue in another device or document.

Current Reading Desk item storage is useful, but a researcher may need a **temporary working set** organised by a question, not just a flat list of bookmarks. Prototype this before implementing: one lightweight “working collection” that stores exact source locators, optional questions and citations without rewriting the canonical book. Compare it against ordinary Reading Desk cards in user testing. Avoid automatically generating arguments or unverified doctrinal categories.

### Switching languages and representations

**Test task:** From one source paragraph, inspect Arabic and the corresponding English passage, open the same publisher note, save a highlight, switch to English-only, then return.

Preserve passage-level correspondence even where exact phrase-level mapping is editorially indeterminate. Show uncertainty as a scope fallback, not a fabricated word-to-word alignment. Arabic script shaping, vocalisation, bidirectional punctuation, selection and focus positions are correctness requirements, not merely visual polish.

### Preservation, import, device change and recovery

**Test task:** Export saved notes, add new ones on device A, import an earlier backup on device B with its own active reading position, preview changes, restore selected categories and resume either location explicitly.

Success means zero silent deletion, zero accidental overwrite of current reading place, meaningful warnings about ambiguous or obsolete targets, repeatable imports and recoverable undo. Do not treat a green “import completed” banner as evidence of semantic data correctness. Test unknown schema fields, long Arabic quotations, duplicates, browser quotas and offline use.

### Downloading and continuing offline

**Test task:** On iPhone and desktop, obtain (1) Book PDF, (2) Study Guide, (3) offline HTML, and (4) scholarly source ZIP. Explain what each is without tutorial. Confirm the actual operating-system behaviour after tapping View or Download.

A screen that requires configuring PDF options before showing the four different objects fails at **information architecture** even if every control works. Keep the objects distinct and label actions according to platform reality. Avoid conflating a personal PDF that must be generated with a prebuilt file that is ready to download.

### Accessible use and resilience

Test keyboard-only Q/H/N popup navigation, focus restoration to the invoking symbol, escape/close, small screens with larger fonts, screen-reader announcements of Arabic and English passages, and offline fallback when external websites fail. WCAG 2.2 is a minimum technical standard, not the upper bound of a usable reading experience.

## 5. High-level decision rubric for every new feature

Before a new control, diagram, popup or feature enters the main reader, answer:

1. **Scholarly goal:** Which real reading/research task becomes more accurate or less effortful?
2. **Cognitive cost:** Does it remove remembering, re-finding or repeated configuration? Does it add distracting choices?
3. **Epistemic status:** Does it preserve original text, editorial interpretation, provenance and uncertainty?
4. **Continuity:** Does it preserve source location, language, query, evidence and a trustworthy return path?
5. **Error cost:** Can the action silently lose or misattribute user data or evidence? Is recovery clear?
6. **Inclusive access:** Does it work with touch, keyboard, assistive technology, bilingual typography and narrow screens?
7. **Performance and offline:** What is the real interaction latency and data footprint on mobile? What works without network?
8. **Evidence:** Which source, usability observation or test would falsify our claim that this is better?

Reject additions that cannot identify a specific task benefit. Prefer exploiting existing components over inventing a new toolbar or parallel modal system. Conversely, do not remove explanatory context that scholars need merely to make the interface look minimalist.

## 6. Research and evaluation plan

### Discovery (first, before broad redesign)

Conduct contextual interviews and screen-recorded research-task walkthroughs with at least four different expertise profiles. Use actual source questions and ask participants to demonstrate their current paper/book/notes/browser workflow. Capture the **complete journey**, including workarounds outside Gnamma. Start with six pilot sessions to refine tasks and instrumentation; then run approximately twelve to eighteen qualitative task sessions across Arabic-dominant academics, bilingual readers, advanced students and occasional readers. These numbers guide qualitative discovery, not statistical generalisation.

Collect a critical-incident diary from a subset over one or two weeks: occasions when the user abandoned Gnamma for paper or another site, switched devices, lost their place, doubted a citation, struggled to annotate or accidentally changed mode. Treat these as design evidence rather than simply dissatisfaction.

### Controlled comparison

Where practical, counterbalance two interface designs or Gnamma versus the participant’s normal reading workflow. Match the complexity of scholarly questions and vary their order. Measure exact evidence retrieved and accurately cited, completion without hints, task time distribution, number of unnecessary navigations, failure/recovery, return-to-passage accuracy, and subjective confidence/mental demand. Separate *confidence* from *correctness*: a fluent but false morphological explanation must score worse than a cautious source-based one.

Record median and high-tail time, not only averages. Do not set arbitrary “90% faster” or “five-click” goals before observing baseline distributions. Reasonable **provisional** acceptance candidates include zero silent data loss, no fabricated alignment or citation, unambiguous source-link destinations, and one obvious route back to the invoking passage. Qualitative notes matter as much as these metrics.

### Complementary inspections

- **Cognitive walkthrough:** can someone infer how to perform the task without prior product knowledge?
- **Heuristic inspection:** visibility of status, recognition versus recall, error prevention, consistency and user control; useful but insufficient.
- **Cognitive Dimensions audit:** repeated action cost (viscosity), hidden relations between notes and passages, premature decisions in Editions, and structural visibility of saved research.
- **Accessibility and modality audit:** W3C WCAG 2.2 + APG, real VoiceOver/TalkBack/desktop keyboard and RTL cases.
- **Performance audit:** input responsiveness, scroll stability, script/cache coherence, PDF download integrity, and memory pressure on iOS/WebKit.
- **Philological integrity gate:** exact source IDs, book/chapter locators, Arabic transmission variants, editorial provenance and fallback labels checked separately from UX.

Only opt-in recordings or anonymised aggregate data may leave a device. Do not collect private saved notes, user searches or scholarly annotations through automatic telemetry merely to acquire metrics.

### Proposed minimum scenario suite

| Scenario | Outcome that must be observed | Failure signature |
| --- | --- | --- |
| H-note from Arabic and English (§31) | Same exact report; primary source opens from heading; reader position recoverable | Wrong note; two source links per report; position lost |
| Q-note with associated Hadith (§64) | Only the related evidence shown in the scoped Quran note | Whole-section Hadith conflation |
| N-note with no defensible phrase anchor | Section-level fallback is labelled honestly | Fabricated exact English correspondence |
| Search literal vs lemma vs root | Distinct results with understandable matching reasons | Morphological speculation silently treated as concept equivalence |
| Three reading modes and browser back | Passage, language and research context remain intelligible | Reopens wrong section or loses unsaved work |
| Backup restore on different device | No overwrite of active place; selectable imported place | Silent data replacement |
| PDF/Study/Offline/Source choice | Correct artifact selected and downloaded or viewed | Study Guide confused with Study PDF |
| VoiceOver and touch at 390 px | H/Q/N links, close controls and focus return operable | Focus trapped or visually obscured |

## 7. Priorities, dependencies and coordination

**P0 — correctness and trust before novelty:** no source misattribution, no data loss, precise popup focus and source return, clearly honest source scopes, mobile regressions, offline version coherence. The recently merged Hadith note change is a representative small P0 improvement.

**P1 — research continuity:** reconcile existing PR #90 before adding another location/history model. Keep saved searches, filtered results, evidence and return paths intact. Finish understandable mobile search and inspectable morphology through PR #77; first demonstrate task improvement and appropriate error rates.

**P2 — external cognition:** pilot an optional question-focused working collection, compare-two-passages interaction and perhaps semantic SVG research diagrams. Require source links and human-reviewed interpretations; keep these tools out of the normal reading surface until called.

**P3 — long-term platform:** apply consistent designs across newly added texts, retaining original language/translation alignment, provenance and export portability. Longitudinal studies should ask whether Gnamma becomes part of a scholar’s routine, not whether a single demo looks impressive.

Ownership rules: do not independently modify the files owned by PR #77, PR #90 or the PDF research streams without reconciling with the integration owner. Before any UI merge, inspect current master and newer open PRs, rerun the relevant source/reading/mobile tests, and verify successful Pages publication. Review the resulting site with actual users; green CI is necessary but not sufficient.

## 8. References and their role

Primary research, selected because each addresses a different explanatory level:

1. **Bates (1989), Design of Browsing and Berrypicking Techniques** — changing search goals and browsing behaviour: https://pages.gseis.ucla.edu/faculty/bates/berrypicking.html
2. **Marchionini (2006), Exploratory Search: From Finding to Understanding** — search as inquiry: https://cacm.acm.org/research/exploratory-search/
3. **Pirolli & Card (1995), Information Foraging in Information Access Environments** — scent, cost and value of navigation: https://chi1995.acm.org/proceedings/papers/ppp_bdy.htm
4. **Pirolli & Card (2005), Sensemaking Process and Leverage Points** — evidence files and structuring hypotheses: https://andymatuschak.org/files/papers/Pirolli%2C%20Card%20-%202005%20-%20The%20sensemaking%20process%20and%20leverage%20points%20for%20analyst%20technology%20as.pdf
5. **Kirsh (2010), Thinking with External Representations** — objects of thought and external cognition: https://link.springer.com/article/10.1007/s00146-010-0272-8
6. **Green & Blackwell, Cognitive Dimensions tutorial** — viscosity, dependencies, premature commitment, visibility: https://www.cl.cam.ac.uk/~afb21/CognitiveDimensions/CDtutorial.pdf
7. **Altmann & Trafton (2002), Memory for Goals** — interference and recovering suspended intentions: https://onlinelibrary.wiley.com/doi/10.1207/s15516709cog2601_2
8. **Tashman & Edwards (2011), Active Reading and Its Discontents** — situations and tactics of real active readers: https://faculty.cc.gatech.edu/~keith/pubs/chi2011-active-reading.pdf
9. **Lo et al. (2023), Semantic Reader Project** — scholarly reading prototypes and documented usability studies: https://arxiv.org/abs/2303.14334
10. **Skulmowski (2022), Understanding Cognitive Load in Digital and Online Learning** — challenges of digital cognitive-load design: https://link.springer.com/article/10.1007/s10648-021-09624-7
11. **Clemmensen, Kaptelinin & Nardi (2016), Making HCI Theory Work: Activity Theory** — activity-oriented requirements and empirical analysis: https://www.tandfonline.com/doi/full/10.1080/0144929X.2016.1175507
12. **Panagiotidou et al. (2022), Communicating Uncertainty in Digital Humanities** — epistemic uncertainty and trust: https://discovery.ucl.ac.uk/id/eprint/10157203/1/Communicating_Uncertainty_in_Digital_Humanities_Visualization_Research.pdf
13. **ISO 9241-11:2018** — effectiveness, efficiency, satisfaction in context: https://committee.iso.org/standard/63500.html
14. **W3C, WCAG 2.2** — focus visibility, target size, accessibility and operability: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
15. **W3C, ARIA Authoring Practices Guide** — accessible disclosure and dialog patterns: https://www.w3.org/WAI/ARIA/apg/
16. **Nielsen Norman Group, Progressive Disclosure** — useful for secondary controls, but not a substitute for task design: https://www.nngroup.com/articles/progressive-disclosure/
17. **O’Hara & Sellen (1997), A Comparison of Reading Paper and On-Line Documents** — annotation, navigation and spatial layout advantages to test against modern digital workflows: https://www.microsoft.com/en-us/research/publication/a-comparison-of-reading-on-line-and-paper-documents/

**Evidence and inference rule:** cited research provides *design explanations* and hypotheses, not proof that a particular Gnamma change improves scholarship. Repository inspection supports what the code is intended to do. Actual performance and comprehension claims must come from defined observations on a specified user group and task.
