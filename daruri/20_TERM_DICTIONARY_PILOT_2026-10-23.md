# Twenty-term technical dictionary / morphology pilot
23 October 2026 · PR #77 · **experimental, no live-reader publication**

The experiment used the full CAMeL BERT-MSA generated candidate indexes for Ibn Rushd's
Darūrī and al-Ghazālī's al-Mustaṣfā, Gnamma's 155-entry sourced terminology register,
the original Arabic source-token coordinates, and strict clitic/hamza checks.

Run: [GitHub Actions #39894075104](https://github.com/gnamma-research/booksite/actions/runs/39894075104).
Artifacts: [20-term comparison and source-linked shadow root proposals](https://github.com/gnamma-research/booksite/actions/runs/39894075104/artifacts/12476306038).
The artifact contains four documents:
`20-terms-report.md`, `20-terms-comparison.csv`,
`20-terms-shadow-root-proposals.csv`, and `20-terms-results.json`.

## Trial results

**Twenty headwords; 6,527 word occurrences (727 Darūrī, 5,800 al-Mustaṣfā).**

| Term | Darūrī hits | al-Mustaṣfā hits | Missing roots; safe shadow proposals |
|---|---:|---:|---:|
| قياس | 56 | 547 | 603 |
| علة | 14 | 645 | 0 |
| حكم | 123 | 1,169 | 0 |
| أصل | 44 | 472 | 516 |
| فرع | 1 | 87 | 0 |
| واجب | 33 | 200 | 233 |
| عام | 35 | 111 | 45 |
| خاص | 20 | 70 | 0 |
| نص | 31 | 339 | 0 |
| دلالة | 10 | 135 | 0 |
| ظاهر | 49 | 130 | 0 |
| إجماع | 63 | 431 | 0 |
| اجتهاد | 27 | 298 | 0 |
| استحسان | 1 | 21 | 0 |
| استصحاب | 7 | 10 | 0 |
| نسخ | 47 | 288 | 0 |
| نهي | 38 | 180 | 218 |
| شرع | 76 | 362 | 0 |
| خطاب | 31 | 127 | 0 |
| بيان | 21 | 178 | 199 |
| **Total** | **727** | **5,800** | **1,814** |

The original model had a dictionary-compatible root for another **4,696**
matched occurrences. It had no primary analysis for **17**. There were also
**104 occurrences with a mismatch between model lemma and the registered
dictionary headword**, requiring separate review.

The 1,814 provisional root proposals are *source-linked shadow records*, **not
1,814 verified model errors**. Their source-word coordinates, model lemmas,
originally blank roots, suggested roots and source IDs are retained. The model,
public indexes and historical witness were not rewritten.

## Examples

- `بالقياس` at `passage:6:1`, word 43: model lemma `قِياس`, root blank;
  technical register `قياس`, root `قيس`. Suggested root `قيس` for
  lexical/morphological adjudication. The cited dictionaries in this example
  are later than Ibn Rushd, so they attest later lexical discussion, not his
  exact intent.
- `علة`: the model usually assigns noun `عِلّة` and root `علل` already.
  The real problem is an ordinary-language gloss (“illness” etc.) rather than
  the jurisprudential **effective cause**; adding the root changes nothing.
- `حكم`, `إجماع`, `اجتهاد`: in the matched occurrences the proposed roots
  are generally already present. Technical definitions improve explanations
  and conceptual sense linking, not necessarily the lemma search.
- `استصحاب`: all seventeen matched occurrences lacked a primary model
  analysis in this pilot; a specialist dictionary cannot repair a missing
  morphological candidate by simply changing the root.
- Outside the 20-item technical sample, systematic issues remain in
  `بعض`, `بعد`, `الأمر`, `الشارع`, `تتبين`, `إن`. In particular,
  `الأمر` is frequently misanalysed as the differently vocalised
  `أَمَرّ`; normal search folding must not be confused with reliable
  lemma identity.

## Finding

**Worth continuing for root completeness**. The sourced lexicon can recover
substantial missing morphological search information without in-browser model
weights, especially for `قياس`, `أصل`, `واجب`, `نهي` and `بيان`.

**Not sufficient for passage-level meaning or scholarly release**. Technical
word senses need contextual disambiguation, earlier/authored evidence where
available, and human review. Missing lexical candidates, homographs, hamza
seats and incorrect clitic boundaries require an improved analyzer/candidate
ranker, not dictionary-root replacement.

## Release position and mobile interface

- The PR's **Word forms** option is a lemma search, including irregular broken
  plurals supported by the index; **Related words** is a separate root search.
  Indexed model alternatives are not counted as certain matches.
- Full contextual indexes are generated and compacted privately. The full AI
  output remains **opt-in staging** until source-linked gold validation.
- Mobile Research Search has separate **Results**, **Refine** and **Saved**
  screens; desktop controls sit beside results. On applying a mobile builder
  query, its controls disappear to give the results full available height.
- No model weight, unreviewed analysis or private user note was uploaded
  into the live website. The draft feature branch remains separate from master.

## Technical *meaning* cross-check: why roots are only part of the solution

I also compared representative lexical glosses emitted by CAMeL with the
separate, source-linked Gnamma scholarly glossary. These are actual model
glosses observed in the full two-work candidate indexes; the technical
definitions are editorial terminology information **not automatically
attributable to every occurrence**.

| Term | Model's lexical gloss (illustrative) | Gnamma's relevant scholarly sense | Lesson |
|---|---|---|---|
| قياس | analogy | Legal analogy or logical inference, depending on the argument | Root `قيس` is missing; technical sense still needs context |
| علة | illness; deficiency; defect | Effective ground of a legal ruling | Root already correct; ordinary dictionary sense can mislead |
| نص | text | Determinate/unambiguous indication in this discussion | A correct lemma need not yield a useful juristic gloss |
| اجتهاد | effort; independent thinking | Competent independent juristic inquiry | Generic gloss needs specialized meaning |
| استحسان | approval; achievement | Juristic preference under a recognized evidential warrant | Plain-language approval is inadequate |
| بيان | statement; declaration | Valid clarification of a meaning, including acts and context | Dictionary root can be added, but gloss also needs correction |
| استصحاب | *(no primary model analysis in 17 matched occurrences)* | Presumption of continuity | New candidate generation is needed, not a root override |
| نسخ | copy; transcribe; abrogate | Legal abrogation when relevant | The same written radicals also form different verbs and nouns; do not blindly force the glossary's noun into every verbal occurrence |

Other entries, including `حكم`, `إجماع`, `دلالة`, `عام`,
`خاص`, `واجب`, `ظاهر`, `شرع`, `خطاب`, `فرع` and
`أصل`, show similar differences in precision even when their primary
morphological analysis is compatible with the dictionary.

**Verdict:** A narrow source-linked root-proposal layer is immediately useful
as a staged search improvement. A broader dictionary-guided contextual
sense ranker could be valuable, but this experiment does not prove accuracy
gains for sense selection. It should be trained/evaluated on independently
reviewed word-in-passage examples. No such model is released here.
