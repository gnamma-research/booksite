# Sanandajī, *Taqrīb al-Marām* — Stage 50 public reader integration

**Date:** 5 November 2026. **Status:** source-inspected, provisional scholarly translation; **not** a critically established edition.

## Primary source and reliability

The baseline primary witness is the user-supplied image-only two-volume scan `taqribmaram(2).pdf`, **632 physical PDF pages**, SHA-256 `4addd660de68794f9d64e062e3b25a2782497b3342eb4580218c3e07e8d12134`. For Volume II, printed p maps to physical PDF page **p+295**. The uploaded scan's original page images are **not redistributed in this public GitHub repository**; only short Arabic anchor phrases and provisional English translations are published here. The full printed Arabic should be checked against the reader's source page identifiers.

## What was actually integrated

The source-revision modules `stage48-source-revisions-II035-II044.js`, `stage50-source-checked-working-readings.js`, and `stage50-mixture-continuation-II053-II054.js` modify existing book-page records in place rather than counting old guides and new translations as two original pages. Stage48 is loaded first, allowing the newer Stage49 marginal interpretations to take precedence.

**Stage 48 corrections now recovered on the public site:** II:35–44 upper readings and selected lower-text excerpts for II:39–44. Crucially, II:41 has been corrected from a misplaced discussion of celestial poles to the printed sphericity argument and the oval, lenticular, and polygonal counterexamples. These are source-inspected working translations, not critical certifications.

**Stage 49 source-checked replacements retained:** II:34–38, lower marginal register (five page-span drafts), and II:45–48, mixed Taftāzānī/Sanandajī upper commentary (four page-span drafts). These nine page positions were already in the local 300-page Stage49 edition. The Stage49 PDF is the extraction source for this website module. The lower text contains independent objections and first-person proposals. It is **UNASSIGNED** to an individual historical writer unless separately authenticated.

**Stage 50 new source readings:** II:49–54. Upper readings at all four page positions and selected lower passages at II:49–52. Source subjects:

- **II:49:** mountain formation, differences of hardness, a choosing specifier, and earthquakes due to trapped underground vapours; marginal qualifications about natural causes.
- **II:50:** earthquakes, springs, hot water, the opening of the theory of mixture, and marginal cautions.
- **II:51:** mutual action of elemental powers and a marginal dispute over the relation between substantial forms and qualitative change.
- **II:52:** the resultant intermediate homogeneous quality (*mizāj*) and the dispute over its explanation.
- **II:53–54:** eight types of unbalanced temperament and the distinction between quantitative/absolute balance and the constitution appropriate to a species, individual or organ.

Stage 50 adds approximately **1,694 English words** across ten upper/lower register records (including a 429-word upper continuation on II:53–54). These are first-pass English renderings of source-based arguments, **not a full translation of all lower-register lines**. The Stage49 material adds/replaces approximately **2,855 English words** as previously reported; do not count replacements as additional unique progress.

## Critical accounting (different denominators)

| Measure | Number |
|---|---:|
| Original numbered book pages (two volumes) | approximately 615 |
| Upper main-text full-visible-span attempted drafts | 100 (II:215–314) |
| Additional original positions with provisional readings | 200 (II:15–214) |
| Positions represented in the 300-card offline cumulative edition | 300 |
| Independently critically certified full-source pages | **0** |
| Existing separate marginal-note units accurately attributable to Wasīm through new Stage50 evidence | **0** |
| Stage48 register-level source-corrected records restored | 16 (10 upper, 6 selected lower) |
| Stage49 register-level records integrated in the newer module | 9 |
| Stage50 register-level records integrated in the two newer modules | 10 |

The historical **601/615** presence figure on the previous site meant merely “some English guide or selected source phrase,” not translated original-page coverage, and is **not a measure of translation completeness**.

## Textual and interpretive cautions

1. The Stage49 English includes explanatory bracketed supplies and several unresolved small-type clauses. It is a significant improvement over earlier summaries but not independent philological proof.
2. The labels `MIXED upper` and `UNASSIGNED marginal` are not interchangeable. Taftāzānī's embedded propositions must eventually be bounded against a separately collated matn.
3. The Stage49 distinction between *kull* and *kullī*, and between motion by *tawassuṭ* and *qaṭʿ*, should not be blurred by smooth paraphrase.
4. Stage49 II:37–38 offers a positive response to the complete-cause dilemma by distinguishing real causal factors from a conceptually considered bearing upon the effect.
5. The Stage50 meteorology and theory of *mizāj* are rendered as **historical reported arguments**, not endorsed as current physical science.
6. Stage50 II:49–50 and II:50–51 cross page boundaries. Stage50 II:52 continues into II:53, and the resulting mixture discussion continues across II:54 into the next source leaf; no fictitious isolated conclusion was added.
7. Only short source anchors are typed as Arabic in the public reader. These do **not** constitute a diplomatic Arabic transcription. No part of the original facsimile has been placed in the public repository in this release.
8. The long marginal arguments across II:49–52 remain partially untranslated. The individual identities of those glossators are not established by typography or closing abbreviations.

## UI and data strategy

The site retains stable primary records `P2.034` etc. **Twenty-one unique original-page positions, II:34–54, have newly integrated focused source-checked or source-inspected work on the public reader; this does not mean that all 300 original positions of the separate offline cumulative edition have been imported.** Revised upper readings replace outdated guides on the same original page position, without double counting; lower excerpts become elements in the reader's independently selectable **Unattributed marginalia** layer. Earlier Git history and separate editorial documents are retained, and the original independent *Tahdhīb* project is not merged.

## Next critical work

Complete and collate remaining lower passages on II:45–54; source-check the previously provisional II:15–214 upper text; preserve a distinct Wasīm census and provenance ledger; and independently proof the 100 upper main-text drafts II:215–314 against the Arabic and a second witness where necessary. No count of independently certified original pages advances in this stage.
