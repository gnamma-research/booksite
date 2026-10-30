# GNAMMA · Avicennian Summa cumulative handoff — STAGE 2
**Snapshot:** 2026-10-30 · Phase: tenth chapter integrated in the GNAMMA bilingual reader · **CUMULATIVE**: this document covers stages 1 and 2 and names *every chapter*, editorial limitations, source locators, repository paths and remaining tasks.

## Project identity
- Repository: `gnamma-research/booksite`.
- Development branch: `research/avicennian-critical-arguments-2026-10-30`.
- Web prefix: `research/intellectual-atlas/avicennian-summa/`.
- Summa landing `index.html`; chapter catalogue `chapters/index.html`; full self-contained reader `chapters/reader.html`.
- Sources: `SOURCE_REGISTER.md`; older historical summa `COMPREHENSIVE_SYSTEM.md` and `SYSTEMATIC_FINDINGS_AND_EVIDENCE_AUDIT.md`.
- First checkpoint: [STAGE 1 — corpus audit](STAGE_01_CORPUS_AUDIT.md) (still retained). This document is self-contained if earlier handoffs are unavailable.

## Full accumulated corpus
1. `chapters/01-mental-existence-and-quiddity.md` — Lāhījī *Shawāriq* I:50–52 and Aquinas; complete bounded fifth question, selective other arguments.
2. `chapters/02-making-and-causal-explanation.md` — Lāhījī I:158–161 and embedded *Maqāṣid/Mawāqif* attributions; central objection–reply sequence, not independently collated against every quoted work.
3. `chapters/03-substantial-motion-dispute.md` — Lāhījī I:53, Ṣadrā *Asfār* IV:85–87 and al-Ḥillī; directly compared differing identity criteria, not a claim Ṣadrā answered Lāhījī personally.
4. `chapters/04-intellect-soul-and-identity.md` — Ibn Sīnā *Nafs* V.5, Ṣadrā, Aquinas; excerpts with exact source separation.
5. `chapters/05-four-causes-form-bestowal.md` — *Shifāʾ Ilāhiyyāt* VI.1, IX.5, Aquinas *De potentia* III.8; full bounded definitions passage, selected generation exchange.
6. `chapters/06-divine-agency-necessity-and-plurality.md` — Ibn Sīnā IX.1, IX.4; Aquinas *De potentia* III.16; no elision of free choice vs conditional necessity.
7. `chapters/07-unity-plurality-and-divine-knowledge.md` — Narāqī *Jāmiʿ* II:165–167; distinguish Narāqī's own qualified interpretation from mystical propositions he reports.
8. `chapters/08-universals-quiddity-nafs-al-amr.md` — *Shifāʾ Ilāhiyyāt* V.1; philosophical *nafs al-amr* beyond the passage still research only.
9. `chapters/09-mawaqif-maqasid-hylomorphism-mental-existence.md` — layered *Mawāqif* VII:34–35,45; *Sharḥ al-Maqāṣid* 78–79; incomplete separation of printed marginal glosses.
10. **NEW** `chapters/10-conservation-first-cause-and-secondary-agency.md` — Ibn Sīnā *Ilāhiyyāt* VI.1 pp.260–262 and VI.2 p.264; Narāqī I:38–42; Aquinas *ST* I q.104 aa.1–3. Full **analytic comparison**, selected Arabic/Latin lemmata; not continuous full translation of the underlying chapters.

Additional extant work, not replaced: `primary-translation-causation.md`, `causal-dependence.html`, `four-causes-and-forms-research.md`, `PRIMARY_TEXT_CROSSWALK_01.md`, `AT_AVICENNIAN_FINDINGS_1.md`, `COMPREHENSIVE_SYSTEM.md`, `SYSTEMATIC_FINDINGS_AND_EVIDENCE_AUDIT.md`.

## Stage 2 finding: this changes the historical interpretation

**Ibn Sīnā himself** in [*Ilāhiyyāt* VI.1, pp.261–262](https://books.rafed.net/view/1128/page/261) rejects the thesis that an effect requires a cause only to originate; the relevant passage **precedes** the printed heading of VI.2, which begins at [p.264](https://books.rafed.net/view/1128/page/264). Narāqī develops and defends this already-Avicennian doctrine.

**Aquinas** in [*ST* I q.104 a.2](https://www.corpusthomisticum.org/sth1103.html) expressly admits **created intermediary conserving causes** subordinated to the principal conservation by God. The unqualified opposition “Avicenna has mediating causes, Aquinas does not” is **retracted**. The remaining differences include:
- the function of separate intellects in substantial generation and intellectual actualisation;
- whether God's simplicity necessitates this specific cosmos or leaves a freely chosen order;
- how particular essences receive actuality while remaining distinct;
- the status of substantial motion and identity.

**Aquinas's builder analogy** belongs to his broader distinction between a cause of becoming (*fieri*) and a cause of being (*esse*). Ibn Sīnā's VI.2 likewise separates preparatory efficient action from the sustaining cause. Parallel **structure** is demonstrated; precise causal **allocation** is not identical without further evidence.

## The exact argument sequence

Universal and quiddity (08) → mental being/objectivity (01) → the nature of *jaʿl* (02) → intrinsic form and natural generation (05) → identity through movement (03) → soul and intellectual actualisation (04) → modal contingent dependence (10) → the First's action and cosmic mediation (06) → divine knowledge and finite plurality (07), with post-classical kalām's counterarguments (09) crossing the earlier steps.

The reader's **numeric** chapter order is historic production order; this conceptual dependency order is what the summa should use for sustained study. An argument map must preserve both.

## Philological and historical safeguards
- One web transcription is **not** a collated manuscript witness.
- A printed edition's variant sigla are *reported edition readings*, not user-inspected manuscripts.
- Ibn Sīnā VI.1 and VI.2 must be separately cited; VI.2 begins at p.264 in the checked printing.
- Aquinas q.104 a.1 addresses universal divine conservation, while a.2 explicitly permits subsidiary conserving causes; **both** are required for a fair comparison.
- “The creator and a created intermediate cause both conserve” does not mean their causation is equivocal or competitive.
- *Taḥqīq al-ḥaraka fī l-jawhar* / reported *Ithbāt al-ḥaraka al-jawhariyya* by Jilwa requires direct textual verification; prior “Jilwa uniformly rejects substantial motion” claim is unsafe.
- A bibliography of Khayrābādī's 1904 printing is not a full translation of that work.
- No concluding AT system can be inferred solely from convergence on conservation.

## Stage 2 release implementation
- New `ch10` article inserted in `chapters/reader.html`; it preserves the entire new Markdown argument as rendered HTML, with Arabic direction and source citations.
- Chapter index and main summa landing link to `reader.html#ch10`.
- Existing 9 chapters and 20-domain research texts remain unmodified.
- Formal tests and offline ZIP integration are **stage 3**, not yet a successful completed check at the time of this snapshot.

## Next stage
1. Add chapter ten to the static and browser QA expectations and offline-release file list.
2. Make source register, reader and publication index point at the **current** handoff.
3. Generate final current handoff with full file inventory and test outcomes, preserve all prior stage files in the offline release.
4. Verify site/reader on desktop and mobile; publish only if checks pass. Do not confuse successful UI checks with philological certification.
5. Reconcile PR #207's older Narāqī source branch **without silently replacing** the version now used in the summa.

## Restart instructions
Read `HANDOFF_CURRENT.md` (once stage 3 finishes), then this file and the ten Markdown chapters. Compare the current Git tree with the source register before committing. Every subsequent stage must retain complete prior content, its evidence status, and the exact files added since the previous checkpoint.
