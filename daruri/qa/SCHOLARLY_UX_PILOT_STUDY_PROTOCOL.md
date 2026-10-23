# Gnamma scholarly workflow usability study: pilot protocol and evidence rubric

**Status:** reusable research instrument; no participants recruited, no study conducted, no empirical effectiveness claims.
**Date:** 23 October 2026.
**Companion:** [GNAMMA_SCHOLARLY_UX_RESEARCH_2026-10-23.md](../GNAMMA_SCHOLARLY_UX_RESEARCH_2026-10-23.md), coordination [issue #94](https://github.com/gnamma-research/booksite/issues/94). 
**Deployment/test distinction:** automated H/Q/N/browser journeys in [PR #98](https://github.com/gnamma-research/booksite/pull/98) catch implementation regressions but are **not** observations of real scholarly behaviour.

## A. The real research question

Does Gnamma allow a scholar to **complete a trustworthy chain of inquiry** with less avoidable interaction burden than their ordinary paper/book/browser workflow, without losing nuance, provenance, evidence, privacy or intellectual control?

A satisfactory test must examine both **the quality of scholarship** (correct source identification and justified interpretation) and **the cost of interacting with the application** (navigation, re-finding, UI choices, formatting, interruption and recovery). Do not conflate slow intellectual reasoning with UI failure; do not confuse quick but wrong answers with success.

Prior research motivates, but does not establish, predictions for this application: Bates on evolving searches; Kuhlthau on exploration and uncertainty; Pirolli/Card on information scent; Russell/Stefik/Pirolli/Card on external sensemaking representations; Hutchins and Kirsh on cognition distributed across artifacts; Green/Blackwell on viscosity/dependencies; Adler et al., Tashman/Edwards and Semantic Reader on active reading; W3C accessibility and internationalisation on Arabic/English correctness. See the companion review for primary references.

## B. Recruitment and setting

### Pilot and wider qualitative work

- **Pilot:** six people, ideally two Arabic-dominant researchers, two English-dominant readers who consult Arabic, and two advanced students. Use the pilot to discover misunderstandings, rewrite task wording and check timings.
- **Follow-on:** roughly 12–18 varied *qualitative* sessions across languages and devices. This sample is for discovery, not population-wide percentages or statistical significance.
- Include users unfamiliar with the reader. A developer and the person who designed a feature cannot stand in for them.
- Use **actual iPhone Safari/VoiceOver** for part of accessibility testing, in addition to desktop keyboard and screen-reader testing. Linux WebKit and synthetic Playwright tests are not a substitute for a real iPhone.
- Observe normal paper/book/browsing practices first. Ask participants to demonstrate a question they would genuinely research rather than merely asking what features they want.

**Record** participant code only, language expertise, task familiarity, display/OS/browser, input modality, font-scale setting, time spent learning the app, and whether any external books/sites/tools were needed. Never infer academic expertise from job title alone.

### Session outline: approximately 60–75 minutes

1. Consent and privacy; agree which screens, if any, can be recorded (5 min).
2. Natural workflow: "Show me how you normally pursue an unresolved textual question" with paper/book/browser materials (7–10 min).
3. Neutral orientation: show that Gnamma is a bilingual source reader; do **not** teach participants where relevant controls are (3 min).
4. Three or four randomly ordered task cards from section C, one at a time (30–40 min). Record screen actions and verbal reasoning, but allow silent reading.
5. Interruption/resumption probe, optionally after one task (5 min).
6. Post-task reflections, comparison against normal workflow, exit questions (8–12 min).

Schedule one short follow-up diary/check-in after 3–7 days where practical: when did the participant choose paper, another website, or Gnamma, and why?

## C. Task cards (give only the participant-facing prompt)

These tasks are intentionally framed as **scholarly aims, not button instructions**. The answer keys below are for investigators, not participants. Use matched but distinct texts when counterbalancing paper and digital conditions.

### A. Locate, verify and return (§31; source chain)

**Participant prompt:** "In the discussion around §31, distinguish the reports about prayer in a bathhouse and in places where camels rest. Establish their collection references from original records, and then return to the passage you were reading."

**Researcher-only expected evidence:** Two separate citations: Ṣaḥīḥ Muslim 360a and Sunan Abī Dāwūd 492. The asserted valley-related attribution remains unresolved in the apparatus; do not reward participants who silently treat it as verified. The collection name in the expanded heading should be one precise external link; no duplicated "Open source" row.

**Observe:** first relevant passage reached; correct distinction among reports; source clicks vs unused bibliography; whether participants understand expanded Arabic/English transmission; ability to regain exactly the origin section, passage, language, and on-page position; focus returning to the H marker for keyboard users.

### B. Evidence within evidence (§64; Qurʾān → related Hadith)

**Participant prompt:** "Find the discussion of the division of sūras and the basmala, inspect the relevant Qurʾānic evidence, and identify which transmitted report is associated with it. Explain whether this is the same question as the seven aḥruf."

**Researcher-only expected evidence:** Scoped related Hadith for QUR-R064-Q005 links to Sunan Abī Dāwūd 788. The seven-aḥruf topic is conceptually distinct. Neither a Quran–Hadith association nor opening an online edition by itself establishes the report's authenticity.

**Observe:** conflating several reports in one section; source-note legibility; nested disclosure cost; distinct explanatory scope; recovery to original reading.

### C. Search as a developing question (e.g. qiyās/ʿilla)

**Participant prompt:** "Find two passages relevant to how qiyās is discussed. Use the resources you consider appropriate to distinguish the occurrence of a word from related word forms or related concepts. Save what you will need to resume this investigation tomorrow."

**Researcher-only criterion:** Literal tokens, lemma families, roots, and editorially indexed legal concepts have different epistemic meanings. Do not assign a fabricated Arabic word or falsely claim that root membership proves terminological equivalence. Inspect the origin/provenance of morphological analyses and any uncertain alternatives.

**Observe:** query reformulation, result scent, filter confusion, search-to-text and return costs, retained settings, false positives, whether results support comparison, and whether saved evidence remains intelligible after an interruption.

### D. Bilingual evidence, notes, and preservation

**Participant prompt:** "Save a comment about one paragraph where Arabic and English are both helpful. Later return to the original wording, export your saved work, and restore it in a fresh browser profile without accidentally replacing the place you were reading there."

**Researcher-only criterion:** Stable section/paragraph coordinates should survive a language change. An Arabic phrase does not acquire a fake exact English word-span merely because the paragraphs are aligned. A legitimate fallback says "corresponding paragraph" or "section-level scope." Backup import must preserve existing records and not silently displace the current reading position.

**Observe:** duplicated notes, mismatched targets, import preview comprehension, old schema/unknown-item preservation, clarity of current vs imported place, loss of unsaved changes.

### E. The four fundamentally different downloadable artifacts

**Participant prompt:** "Identify which download would give you a regular book PDF, a teaching guide, a self-contained offline reader, and reusable scholarly source data. Obtain one and explain why it is the right one."

**Researcher-only criterion:** Book PDF, Study Guide PDF, offline HTML reader, and canonical research-source ZIP are different artifacts. A prebuilt PDF has different actions from a locally generated personal PDF. Test actual View/Download behaviour on the target device, especially iOS.

**Observe:** wrong-artifact selections, extra PDF-setting steps before discovering the four categories, confusion over file names, recovery after browser viewer handoff, and whether participants know where the file went.

### F. Interruption and resumption

**Participant prompt:** "You have been following a source note, then checking another passage and making an annotation. We will pause. Resume the inquiry as you left it and explain what question you were pursuing."

**Researcher-only criterion:** Returning to *some* section is not enough. Test exact section/paragraph, language, note or search-result state, any working hypothesis, and whether the person can reconstruct the suspended goal. Do not automatically overwrite a newer location with an imported one.

## D. Conditions and experimental safeguards

A paper-vs-Gnamma comparison should compare **equivalent intellectual goals and source access**, not a printed excerpt without references against a fully indexed digital corpus. Counterbalance tasks and order, e.g. use A/C for digital and matched B/D tasks for paper in half the sample, reversing order in the other half. Record device, prior familiarity and book availability. Do not treat any time difference as causally established if task difficulty or source availability was not balanced.

Avoid providing a tutorial that says "tap H", "use Reading Desk", "choose Word forms", or "press Search"; that contaminates discoverability measurement. Help only after documenting the point of failure; record assistance separately. Use ordinary neutral prompts: "What were you expecting here?" and "What information would you need next?"

Do not turn usability sessions into exams on fiqh or Arabic. Academic subject experts should later judge the accuracy of evidence/citations **blind to device and condition** when possible.

## E. Observation and measurement codebook

Separate **observed action** from **investigator inference**, **participant explanation**, and **system truth**. A participant's confidently spoken claim is not necessarily a correct citation.

| Measure | Operational definition | Why it matters |
| --- | --- | --- |
| Evidence outcome | Correct / partially correct / wrong / not attempted, according to the researcher-only key | Fast but wrong scholarly outcomes are failures |
| Citation accuracy | Exact collection identity, report number and actual source destination | Prevents false provenance |
| Qualification accuracy | Properly distinguishes unresolved, editorially inferred, source-attested and authorial claims | Avoids false confidence |
| Interaction time | Time explicitly spent manipulating/re-finding UI, separate from silent/source reasoning | Measures avoidable interface overhead |
| Return-to-context | Reinstated same section, paragraph, language and usable focus; count corrections/attempts | Tests continuity of thought |
| Source transition count | Open/close/jump/search/filter and repeated steps needed along a complete journey | Detects navigation churn |
| Interface error and recovery | Mis-tap, modal trap, wrong source, lost filter, damaged note; record whether and how recovered | A reversible error is not the same as lost research |
| Cognitive effort | Neutral post-task ease rating (1–7) plus self-reported interruption/confusion points | Captures subjective burden, not scholarly correctness |
| Confidence calibration | Participant's reported confidence compared with independent source correctness | A fluent but wrong answer must not appear successful |
| Off-platform transfer | When and why a participant chooses paper, a friend, a database or another app | Identifies real ecosystem/affordance gaps |
| Data preservation | Number of records/targets retained in backup/import and correct reading-place behaviour | Zero silent loss required |

**Coding hints:** NAV (lost place), SRC (wrong or ambiguous source), BIL (false or missing bilingual scope), ORI (cannot see what to do), ERR (error/recovery), MOD (overlay/focus issue), SRT (search reformulation or return), DAT (saved-work integrity), TRU (misread epistemic status), EXT (left platform), PER (latency/jank). Multiple codes may apply.

**Source accuracy rubric, per evidence item:** 
- 0 = wrong collection/subject or invented source;
- 1 = relevant but incomplete or missing necessary qualification;
- 2 = correct source and context with honest qualifications.

**Task outcome rubric:** 0 = not completed or materially wrong; 1 = completed with consequential assistance/missing evidence; 2 = independently completed with defensible evidence. Keep raw observations and citations; the rubric alone discards useful nuance.

**After each task:** Ask (without coaching) "How easy or difficult was that task?" on a 1–7 scale, "Which part interrupted your thinking?", and "What would you have done with a book or another website?" If using standardized SUS, UEQ-S, SEQ or NASA-TLX, use the authentic instrument and its scoring guidance, not an improvised scale with a borrowed name.

## F. Research ethics and artifact management

- Use **synthetic study notes** in throwaway browser profiles; never experiment on a participant's real Gnamma Reading Desk.
- Consent explicitly before recording screens, voice, transcripts or precise searches; default to observation notes without automated collection.
- Never upload private annotations, academic investigations, OAuth tokens, notes backups, or browser history to telemetry for convenience.
- Assign participant codes and store any recordings separately with a retention/deletion policy; do not put participant data in public GitHub.
- Keep GitHub public artifacts to *protocols, mock/synthetic fixtures, and aggregated, appropriately consented findings*.
- If a source/citation is disputed, flag it as a scholarly-content issue; a UI test cannot adjudicate a primary-source variant.
- WCAG 2.2 review should include actual keyboard, screen reader, large font, focus visibility, hit targets, bidi text and iOS. Automated accessibility checks do not replace assistive-technology sessions.

## G. Decision gates after the pilot

For each proposed change, document: the failed scholarly task, what was observed, how often *in this particular study*, what the intended correction is, risks to epistemic accuracy and offline behaviour, and a specific retest. Preserve a minimal reading surface; advanced analytical tools may be powerful without being permanently visible.

A promising redesign is one that improves **defensible evidence and recoverability**, with less avoidable interface effort. Reject design proposals supported only by visual preference, "modern-looking" controls, feature count, number of clicks in a synthetic script, or time spent on screen.

Report findings as qualitative observations until a quantitatively sized, appropriately controlled study supports stronger estimates. See [issue #94](https://github.com/gnamma-research/booksite/issues/94) for the coordinating task backlog.

## H. Sample results write-up (fill only after sessions)

**Task and device:** [code / task / physical or browser condition]  
**Baseline familiarity:** [unfamiliar / known reader / experienced academic reader]  
**Observed path:** [exact sequence of source and UI actions, with screenshots or timestamps if consented]  
**Evidence and correctness:** [correct citations and important qualifications / independent adjudication]  
**Avoidable interface friction:** [codes, examples, recovery]  
**Participant's own description:** [clearly attributed, short quote with consent]  
**Severity:** [blocker / major / minor / preference, with rationale]  
**Hypothesized redesign:** [minimal intervention]  
**Retest and falsification criterion:** [what would show the change was not an improvement]  
**Uncertainty:** [device confound, small sample, ambiguous attribution, test setup]  

**Reading list:** Bates (1989); Kuhlthau (1999/2025); Pirolli & Card (1999, 2005); Russell et al. (1993); Green & Blackwell (1998); Hutchins (1995); Adler et al. (1998); Tashman & Edwards (2011); Lo et al., Semantic Reader (2023); W3C WCAG 2.2 and internationalization guidance. Full bibliographic URLs and scope limits are in the companion research review.
