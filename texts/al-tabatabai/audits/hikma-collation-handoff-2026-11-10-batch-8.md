# GNAMMA Ḥikma — Stage VIII cumulative handoff (10 November 2026)

**Repository:** `gnamma-research/booksite`. **Edition status:** working Arabic transcription and English translation, with explicitly graded textual decisions; no specialist-certified critical edition is claimed. **Publication checkpoint:** remote reader CI, final PDF verification, and publication remain **PENDING**. Record the verified commit, PR, merge SHA, workflow runs, and PDF manifest below when those steps finish.

This stage continues the saved [Stage VII handoff](hikma-collation-handoff-2026-11-10-batch-7.md), which links the earlier stages. Preserve that evidence chain. The present handoff supersedes Stage VII's cumulative counts, its unresolved status for the Nihāya IX.9 cross-reference, its Muẓaffar continuation boundaries, and its former description of the Carney comparator. Earlier source limitations remain in force unless an exact new check is identified here.

## Cumulative coverage and review grades

| Work or review grade | Current count | What the count establishes |
| --- | ---: | --- |
| Muẓaffar, *al-Manṭiq* | **101** paired working units | Introduction 11; Book I 11; Book II 17; Book III 14; Book IV **47**; Book V **1**; Book VI **0**. Selections and continuous new spans do not establish complete six-book coverage. |
| Ṭabāṭabāʾī, *Bidāyat al-Ḥikma* | **111/111** paired working units | The introduction and all 110 numbered chapters have working Arabic–English text. This is not an independent scholarly collation of the whole work. |
| Ṭabāṭabāʾī, *Nihāyat al-Ḥikma* | **136/136** paired working units | Full authorial reader coverage, retaining the working-edition qualification. |
| Aggregate paired working units | **348 = 101 + 111 + 136** | A count of stored authorial reading units, not printed pages, original books completed, or certified translations. |
| Nihāya complete local bilingual readings | **136/136** | The **50** units remaining after Stage VII have now been read in full against their stored Arabic. No local whole-unit reading remains outstanding. |
| Nihāya complete independent external chapter comparisons | **1/136** | **IX.9 alone** has a complete comparison with the early printed facsimile and a complete reading of the later edited digital chapter. **135 units** still require this grade of external comparison. |
| Nihāya partial later-print checks | **13** recorded targets | Nine inherited plus VI.5, IX.11, IX.12, and X.2 in this stage. These remain phrase-level checks, separate from the full IX.9 comparison. |
| Independent specialist certification | **0** | No external human specialist sign-off is documented for any unit. |

The [cross-book review register](cross-book-review-register-2026-11-07.json), [Nihāya triage register](nihaya-english-collation-triage-2026-11-09.json), and [Muẓaffar authorial map](../muzaffar-al-mantiq/data/authorial-map.json) are the machine-readable records. A false whole-work `independentArabicCollation` flag must not erase IX.9's separate complete-chapter evidence; conversely, that one chapter must not be generalized to the other 135 units.

## Muẓaffar: 23 new original Arabic–English units

The continuation adds **22 Book IV units, M-C-26–M-C-47**, and **one Book V preface, M-V-01**. It reads the continuous authorial prose and exercises at Rafed **displayed pp.162–195**, followed by the Book V preface at **displayed pp.198–199**. The [continuation report](muzaffar-continuation-stage8-2026-11-10.json) records the exact boundaries, per-unit source links and text hashes, and measured text totals. The text is in [book.json](../muzaffar-al-mantiq/data/book.json).

**Stable-ID correction:** the Book V opening is **M-V-01**. **M-D-01** already belongs to the older Book III definition passage, “What is a defining account?” It must retain that meaning and must never be reused for Book V. The next new unit is **M-V-02**.

| New unit(s) | Rafed displayed page(s) | Authorial coverage |
| --- | --- | --- |
| M-C-26 | 162 | Why relations between propositions are needed; the opening of Book IV chapter II |
| M-C-27–M-C-29 | 163–167 | Contradiction, the force of “in itself,” the eight unities and unity of predication, and differences in quantity, quality, and modality |
| M-C-30 | 167–169 | Subalternation, contrariety, subcontrariety, and the source square of opposition |
| M-C-31–M-C-34 | 170–174 | Simple conversion, affirmative and universal-negative proofs, and the failure of a general converse for particular negatives and disjunctives |
| M-C-35–M-C-39 | 175–183 | Both forms of contraposition; universal-negative, particular-negative, and universal-affirmative proofs; failure for the particular affirmative |
| M-C-40 | 184 | All authorial exercises on consequence, conversion, and juristic contraposition |
| M-C-41–M-C-43 | 185–189 | Predicate complementation/obversion, its four proofs, complemented predicates, and all seven exercises |
| M-C-44–M-C-45 | 190–192 | Complementing both terms and the subject; universal cases and the failure of generally valid particular transforms |
| M-C-46 | 193 | The complete digital relation-table contents in Arabic and an explicitly editorial English alignment |
| M-C-47 | 194–195 | The final logical axiom of immediate transformation and the author's concluding examples |
| M-V-01 | 198–199 | The aim of argument, self-evident starting points, and syllogism, analogy, and induction as the three methods of inference |

The handoff between M-C-36 and M-C-37 occurs **within displayed p.178**: M-C-36 ends the second universal-negative proof; M-C-37 starts at **برهان عكس السالبة الجزئية**. Page overlap here records a continuous boundary, not duplicated authorial prose.

### Verified displayed pagination

The page number in a requested web URL may return a twenty-page HTML block. Use the numbered `pgNNN` page containers, not the URL index alone. The following boundaries have been directly verified in that displayed text:

| Original book | Title page | First prose | Last authorial material / closing notice |
| --- | ---: | ---: | --- |
| IV, propositions and their properties | **124** | **126** | Final prose **195** |
| V, inference | **196** | **198** | Final exercises **269**; closing notice **270** |
| VI, the five argumentative arts | **274** | **276** | The inherited endpoint 455 was not newly verified in this stage |

Sources: [Book IV title and opening](https://lib.rafed.net/view.php?b_id=1604&page=124&type=c_fbook), [Book IV conclusion](https://lib.rafed.net/view.php?b_id=1604&page=195&type=c_fbook), [Book V title](https://lib.rafed.net/view.php?b_id=1604&page=196&type=c_fbook), [Book V final exercises and notice](https://lib.rafed.net/view.php?b_id=1604&page=269&type=c_fbook), and [Book VI title and opening](https://lib.rafed.net/view.php?b_id=1604&page=274&type=c_fbook). These are verified **Rafed displayed labels**, not an assertion that all editions share those physical folios.

The inherited M-C-25 locator is corrected from p.159 to **displayed p.160**. The old proposed Book IV/V/VI ranges ending at 198, beginning at 199, and beginning at 277 respectively are superseded by the verified boundaries above. Books IV and V have intervening title/blank pages; do not invent missing authorial prose to fill them.

### Figures, table, and targeted 1968 evidence

M-C-30 includes a visual transcription of the [source square at displayed p.169](https://lib.rafed.net/Books/1604_almanteq/images/image014.gif), with a structured `sourceDiagram`. Its positions are A upper right, E upper left, I lower right, and O lower left. The shared reader/PDF renderer draws all six relations from those data and retains readable prose transcriptions. English and Arabic figure captions identify the displayed source page.

The [targeted 1968 comparison report](muzaffar-1968-targeted-comparison-2026-11-10.json) records a limited independent check of the Princeton/NYU printed scan:

- **Canvas 225, printed p.221:** the table confirms the intended alignment and the missing C-complement in the universal-affirmative predicate-obversion cell. The corresponding both-terms-complemented cell still omits that sign in the scan. **One C-complement therefore remains conjecturally supplied in the English table.** Do not report both digital sign defects as resolved by the facsimile.
- **Canvas 227, printed p.223:** the scan supplies the **÷4** equation and reads **يحب** in all three relevant positions. The English follows this evidence as “loves,” and identifies the recovered division notation.
- **Canvas 226, printed p.222 inferred from sequence:** the folio is not visibly printed. The scan retains the **في النقض** difficulty; this check does not resolve it.

These are **targeted printed-page comparisons**, not a full external collation of Muẓaffar or of all new units. The [1968 institutional viewer](https://sites.dlib.nyu.edu/viewer/books/princeton_aco000780/225) is an independent printed facsimile; Rafed's separately presented later digital text repeating a damaged formula is not independent facsimile confirmation. Preserve all unresolved formula notes, including the distinction between a retained source reading and an English conjectural reconstruction.

The new chapter-II span does **not** fill earlier omissions in Book IV. The older modal summary-chart and end-of-chapter graphic gaps remain, as do earlier selection gaps, M-K-08's symbolic difficulty, the normalized explanatory treatment of M-K-14, and M-C-17's polarity anomaly. No complete Book IV facsimile edition is claimed merely because the new continuation reaches its final prose.

### Carney comparator correction

The user-provided **75-page Carney English PDF extends through Book V**, with sampled final substantive pages on **induction and analogy**. The earlier metadata saying that it ended before Book III was false and has been corrected in the [Muẓaffar source metadata](../muzaffar-al-mantiq/data/book.json). It remains a partial comparator whose complete continuous coverage is not established. The new English in this project is independently rendered from the Arabic; the comparator is not republished.

## Nihāya: all 136 local readings completed

The [Stage VIII local review report](nihaya-local-review-stage8-2026-11-10.json) contains **50 passage-specific whole-unit findings**, with stored Arabic/English hashes and proposed corrections, completing the **86 + 50 = 136** local readings. These reviews examine negation, argumentative scope, objections and replies, referents, and attributed philosophical positions. An absence of proposed changes records the outcome of a reading; it is not automatic certification.

**Same-base review and external collation remain separate.** A local review compares the English with the Arabic stored in this edition. It cannot by itself establish that the stored Arabic is the best witness, verify an Asfār or Shifāʾ quotation against that work, or authenticate an author's historical attribution.

### IX.9: one complete external chapter comparison

The [IX.9 external-collation report](nihaya-ix9-external-collation-2026-11-10.json) records the entire chapter and its start/end boundaries across:

- The **1404 Qum printed facsimile**, printed pp.210–212, NYU canvases **214–216**, directly visually inspected: [viewer beginning at canvas 214](https://sites.dlib.nyu.edu/viewer/books/princeton_aco000637/214).
- The **1417 Qum digital base**, pp.265–266: [Rafed base](https://lib.rafed.net/view.php?b_id=1642&page=265&type=c_fbook).
- The **1428 al-Zāriʿī edited digital text**, vol.2 pp.107–110, including the attached editorial notes: [later edition](https://lib.rafed.net/view.php?b_id=3109&page=107&type=c_fbook).

The old “first kind / second kind” crux is now resolved **as an attributed adoption of the later editor's correction**. The early print retains “first”; it does not independently attest “second.” The complete comparison also supports the reported subject-predicate wording and potentiality-pronoun decisions. The 1428 witness was read as a digital presentation, not a scanned page; no manuscript was consulted. Quoted or paraphrased Asfār material has not thereby received an independent source collation.

### Six new textual decisions; exact cumulative accounting

Use the [adopted textual-decision ledger](nihaya-adopted-textual-decisions-2026-11-10.json). The current cumulative total is **13 textual decisions**, comprising **12 explicitly attributed later-editor emendations** and **one attested but unfootnoted later-edition reading at X.2**. Those decisions require **14 literal Arabic string replacements**: the inherited VI.16 relation-predicate decision has two replacements. The two spacing repairs below are counted separately. Stage VII's loose “eight emendations” wording must not be carried forward as eight independent semantic decisions.

| Unit | Retained record of earlier reading → adopted reading | Evidence and grade |
| --- | --- | --- |
| N-IX-09 | **كما في القسم الأوّل → كما في القسم الثاني** | 1404 p.211 and 1417 p.265 retain the first reading; 1428 vol.2 p.108 n.4 explicitly corrects it. |
| N-IX-09 | **هي الموضوع بعينه ما تعاقبت → هي بعينها موضوع ما تعاقبت** | Explicit later-editor correction, 1428 vol.2 p.108 n.3; early p.211 compared. |
| N-IX-09 | **قوّةً لقوّته → قوّةً لقوّتها** | Explicit later-editor correction, 1428 vol.2 p.109 n.2; early p.212 compared. |
| N-IX-11 | **أيّ حركة كانت → أيّة حركة كانت** | Explicit grammatical correction, 1428 vol.2 p.115 n.2; 1404 p.215, canvas 219, checked at this phrase only. |
| N-VI-05 | **بإضافة المرتبة العالية → بإفاضة المرتبة العالية** | Explicit correction from addition to bestowal, 1428 vol.1 p.171 n.1; 1404 p.102, canvas 106, and 1417 p.129 retain the earlier word. |
| N-X-02 | **عدم التوقّف → عدم المتوقّف** | The 1428 vol.2 pp.136–137 main text has the dependent-entity reading. **No dedicated note identifies this variant.** The 1404 p.228, canvas 232, and 1417 p.284 retain non-dependence. |

The [VI.5/X.2 targeted-witness report](nihaya-targeted-variants-2026-11-10.json) records the exact pages, images, digital page containers, and source hashes. Do not misattribute X.2's nearby footnote 3 to this change; it glosses a different claim. The separate nearby **المقتضي / المتقضّي** correction and **باختلاط / باختلاف** difference are not additional adopted changes in this stage.

The **two spacing repairs**, both in IX.9, are **الحدّو قوّةُ → الحدّ وقوّةُ** and **لا حقة → لاحقة**. They repair word separation and are not additional philosophical emendations. The [editorial supplement](../nihayat-al-hikma/data/editorial-supplement.json) now contains **18 critical notes**; a note count is not an emendation count. Commentary, recorded difficulties, and adopted variants remain separately identified.

### Four English changes

| Unit | Adopted change | Reason and grade |
| --- | --- | --- |
| N-INTRO | “Existence is necessary in some instances and contingent in others.” | Same-base clarification: the Arabic divides existence by kind; it does not describe temporal alternation. |
| N-XI-02 | “In this predication, the cause is predicated of the effect insofar as the effect is sustained by the cause.” | Same-base clarification of the direction of predication and the qualifying dependence. |
| N-IX-09 | “This occurs not by stripping off and putting on, as in the second kind, but by putting on after putting on.” | English follows the explicitly disclosed Arabic cross-reference correction. |
| N-X-02 | “The nonexistence of what depends is included at the level of that upon which it depends.” | English follows the attested later-edition Arabic reading; it is not presented as a mistranslation of the retained earlier wording. |

Thus **two** changes clarify the same stored base, and **two** follow disclosed Arabic adoption. VI.5's existing English already said “bestowal,” so correcting and documenting its Arabic alignment creates no fifth English change. Obsolete notes saying that the old VI.16 “to a son” or X.2 “non-dependence” reading remains adopted have been removed; the actual earlier readings remain available in the critical apparatus.

## Reader and PDF implementation

The shared [rich-text renderer](../assets/hikma-rich-text.js) and [stylesheet](../assets/hikma-rich-text.css) serve the individual readers, combined reader, and [A4 builder](../tools/build-pdfs.cjs). They render the source square and the aligned English table from escaped data. Table cells have semantic headers, and the mobile table scrolls within its own container. Print study layouts stack the two languages for the table passage so that its five columns use the page width. Source transcription and editorial qualification remain in the prose; inline footnote markers still attach to the final prose paragraph when a figure follows it.

Local structural checks passed for the four-node/six-relation bilingual SVG, the five-column/seven-row table, complement signs, escaped hostile strings, malformed-row retention, ordinary prose/emphasis, and the three PDF HTML modes. JavaScript syntax and whitespace checks passed. These are **not** claims of final rendered-page or published-PDF verification.

The reader workflow checks Chromium/WebKit, direct and combined readers, and mobile containment. The PDF workflow watches both shared helper files and includes them in its stale-build publication guard. All **nine** A4 editions must be regenerated from the final committed source; verify manifest source and supplement hashes, selectable text, Arabic shaping, table/diagram legibility, and the 101/111/136 source counts before claiming publication.

| Release evidence | Status / record to complete |
| --- | --- |
| Source commit / working branch | **PENDING — record verified identifiers** |
| PR and merge SHA | **PENDING** |
| Reader CI run and artifact review | **PENDING remote verification** |
| Nine-PDF build, checksums, and rendered-page inspection | **PENDING** |
| Published reader and current PDF manifest | **PENDING** |

## Next precise work

1. Continue original Muẓaffar with **M-V-02**, the **definition of syllogism at Rafed displayed p.200**: [next source locus](https://lib.rafed.net/view.php?b_id=1604&page=200&type=c_fbook). M-V-01 already contains the complete preface through p.199. Read the remaining Book V prose and exercises consecutively, then Book VI; do not infer completeness from mapped headings.
2. Return to earlier Muẓaffar omissions and image gaps. Preserve the unresolved both-terms table complement, the retained **في النقض** issue, M-C-17's polarity problem, M-K-08's formula, and M-K-14's normalization until exact evidence supports a recorded decision.
3. For Nihāya, undertake complete external comparisons for the remaining **135 units**. Preserve the distinction between early facsimile, later edited digital print, internal conjecture, and manuscript evidence. Separately check quoted source works and seek independent specialist review.
4. Finish the pending remote reader and PDF verification, attach the release evidence above, and reconcile all current manifests and registers before announcing publication.

**Cumulative checkpoint:** 348 paired working units; 136/136 complete local Nihāya readings; one complete external Nihāya chapter comparison; zero specialist certifications. Muẓaffar now reaches the end of Book IV's new continuous chapter-II span and the Book V preface, with earlier gaps and the remaining original work still outstanding.

### Initial release infrastructure repair

The first exact-head Hikma workflow, [run 42843182825](https://github.com/gnamma-research/booksite/actions/runs/42843182825), passed the source audit and JavaScript syntax checks but stopped before browser tests: `ubuntu-latest` resolved to Ubuntu 26.04, which the pinned Playwright 1.58.0 installer does not support. Both Hikma workflows are therefore pinned to `ubuntu-24.04`; source content is unchanged by this repair. A later successful run must be recorded before claiming browser or PDF verification.
