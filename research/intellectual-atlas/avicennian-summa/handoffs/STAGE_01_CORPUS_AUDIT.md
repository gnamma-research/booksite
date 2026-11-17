# GNAMMA · Avicennian Summa cumulative handoff — STAGE 1
**Snapshot:** 2026-10-30 · Phase: nine-chapter corpus audit and source verification · **CUMULATIVE** (contains repository state, prior work, and recovery plan).

> This is a documentary checkpoint, **not** a full critical edition and **not** a representation that all content is manuscript-collated. Future checkpoints must retain this historical baseline and append what has changed. No work is to be overwritten with a summary.

## 1. Location and base
- Repo: [gnamma-research/booksite](https://github.com/gnamma-research/booksite), branch `research/avicennian-critical-arguments-2026-10-30`.
- Reader: `research/intellectual-atlas/avicennian-summa/chapters/reader.html`.
- Chapter landing: `research/intellectual-atlas/avicennian-summa/chapters/index.html`.
- Summa landing: `research/intellectual-atlas/avicennian-summa/index.html`.
- Canonical Atlas data: `research/intellectual-atlas/downloads/intellectual-atlas-data.json` (386 work/context records; 362 relationships; 359 cited sources; 20 textual families).
- Build: `research/intellectual-atlas/build.py` and `build_release.py`; existing QA: `tests/verify_summa_edition.py`, `tests/verify_summa_reader_browser.py`, Atlas exhaustive UI, chronology and gesture checks.
- Related open work: PR #207 is a separate causation translation branch. Its status must be reconciled before merging new updates; do not overwrite its additional text. Its Narāqī arguments may be folded into an edition chapter after checking source.

## 2. All prior work retained (nine Markdown chapters)
| No. | File | Main primary materials | Status at audit |
|---|---|---|---|
| 01 | `01-mental-existence-and-quiddity.md` | Lāhījī *Shawāriq* I:50–52; Aquinas *ST* I.85.2 | One bounded complete p.52 unit; earlier pages selective, no manuscript witnesses |
| 02 | `02-making-and-causal-explanation.md` | *Shawāriq* I:158–161; reported Taftāzānī/Ījī/Jurjānī | Central objection–reply arguments; embedded attributions require independent source collation |
| 03 | `03-substantial-motion-dispute.md` | *Shawāriq* I:53; Ṣadrā *Asfār* IV:85–87; al-Ḥillī | Directly connected primary arguments; Ṣadrā response juxtaposed, not personally replying to Lāhījī |
| 04 | `04-intellect-soul-and-identity.md` | Ibn Sīnā *Nafs* V.5; Ṣadrā *Asfār* V:190; Aquinas *ST* | Selected authorial lemmata and comparison; editor-inserted Rāzī quotes kept distinct |
| 05 | `05-four-causes-form-bestowal.md` | Ibn Sīnā *Ilāhiyyāt* VI.1, IX.5; Aquinas *De potentia* III.8 | Complete bounded four-cause definition unit, selected form-bestowal and Thomistic exchanges |
| 06 | `06-divine-agency-necessity-and-plurality.md` | Ibn Sīnā *Ilāhiyyāt* IX.1, IX.4; Aquinas *De potentia* III.16 | Selective primary lemmata; causal necessity distinguished from divine choice |
| 07 | `07-unity-plurality-and-divine-knowledge.md` | Narāqī *Jāmiʿ* II:165–167 | Bounded critical response translated, reported mystic voice distinct; no manuscript variants |
| 08 | `08-universals-quiddity-nafs-al-amr.md` | Ibn Sīnā *Ilāhiyyāt* V.1 pp.195–196 | Two bounded units, late *nafs al-amr* discussions still under-sourced |
| 09 | `09-mawaqif-maqasid-hylomorphism-mental-existence.md` | Layered *Mawāqif* VII:34–35,45 and *Maqāṣid* 78–79 | Printed sources: textual strata (matn, sharḥ, ḥawāshī) not yet fully separated/collated |

**Additional legacy materials:** `primary-translation-causation.md`, `causal-dependence.html`, `AT_AVICENNIAN_FINDINGS_1.md`, `COMPREHENSIVE_SYSTEM.md`, `PRIMARY_TEXT_CROSSWALK_01.md`, `SYSTEMATIC_FINDINGS_AND_EVIDENCE_AUDIT.md`, `four-causes-and-forms-research.md`, and the 22-item `SOURCE_REGISTER.md`. These survive verbatim in the repository.

## 3. Source verification actually repeated during this audit
- [*Shawāriq* I:52](https://ablibrary.net/book_content/b/9309/52?lang=ar): the fifth question denying existence as an actually separate property joined to an already actual quiddity is present; the sixth question begins at the end of that page.
- [*Shawāriq* I:53](https://ablibrary.net/book_content/b/9309/53?lang=ar): persisting subject objection, objectors, replies and transition to seventh question present.
- [*Shawāriq* I:158–161](https://ablibrary.net/book_content/b/9309/159?lang=ar): *jaʿl* debate with reported *Maqāṣid*/*Mawāqif* sources and Lāhījī's reinterpretation present; page 161 begins in mid-sentence and continues into a different question, so boundaries must remain explicit.
- [Ṣadrā, *Asfār* IV:86](https://ablibrary.net/book_content/b/1606/86?lang=ar): continuous individual existence and only potentially infinite substantial determinations present; a later marginal gloss is interleaved, not to be assigned to Ṣadrā.
- [Ibn Sīnā, *Ilāhiyyāt* VI.2 p.261](https://books.rafed.net/view/1128/page/261): **direct and particularly important** primary argument against the claim that an effect needs its efficient cause only for its temporal origination. This is a basis for the next connected chapter, not a new doctrine invented by Narāqī.
- [Aquinas, *ST* I q.104 a.1–2](https://www.corpusthomisticum.org/sth1103.html): conservation, distinction of cause of becoming versus cause of being, builder example, and the distinction between immediate First Cause and created mediating causes.

## 4. Key established arguments (not inflated doctrinal claims)
1. A quiddity considered in itself should not be reified as an already actual essence waiting for existence to be adjoined; Lāhījī treats particular existence, not its universal concept, as causally produced.
2. An enduring-subject objection to substantial motion must be measured against Ṣadrā's one continuous individual existential course; different positions are not mere changes in vocabulary.
3. The Active Intellect's role in natural form-bestowal is **distinct** from its role in epistemic actualisation; both differ from God's universal conservation.
4. Divine conservation is already explicit in Ibn Sīnā, and the builder analogy is explicit in Aquinas. This enables a genuine three-way argument involving Narāqī rather than an anachronistic binary.
5. Narāqī's defence of causal and intellectual containment is not straightforward numerical identity of all finite existents with God.
6. Later philosophical kalām is a participant in metaphysical demonstration, not solely a reaction against falsafa.

## 5. Important uncertainties to preserve
- Distinguish the **base author's lemma**, a commentator's objection, a reported philosophical opponent, a marginal gloss and a modern edition's footnote.
- A printed edition's sigla are not a manuscript apparatus created by this project.
- There is **no single proven “latest complete Avicennian system”**; different later authors disagree.
- Jilwa must **not** automatically be described as denying substantial motion: the bibliographical title `Ithbāt al-ḥaraka al-jawhariyya` is recorded; its contents remain to inspect.
- The claim that late Peripatetics uniformly discarded the Giver of Forms is **unproved**.
- Strong *waḥdat al-wujūd*, *tashkīk*, and conceptual unity of being are distinct theses.
- The project has not obtained a complete set of Arabic/Persian manuscript witnesses across 20 domains.

## 6. Deliverable planned for STAGE 2
- Add a **complete analytic chapter** on necessary-being, conservation, and secondary causality grounded in direct Ibn Sīnā VI.2, Narāqī I:38–42 and Aquinas *ST* I q.104. Where English portions are selections, say so; never label the un-translated remainder “complete”.
- Connect the new chapter to the nine existing ones, preserve their content and update the self-contained reader.
- Add explicit quality-status metadata and continue the cumulative handoff.

## 7. Recovery protocol
Start with `HANDOFF_CURRENT.md`, then visit this exact stage file, examine `chapters/index.html` and `chapters/reader.html`, and consult the canonical source register. Use Git history of these paths as authoritative rather than memory or older PDF downloads. A future handoff must enumerate the actual new files and tests from that stage. **Never claim manuscript collation absent examined witnesses.**
