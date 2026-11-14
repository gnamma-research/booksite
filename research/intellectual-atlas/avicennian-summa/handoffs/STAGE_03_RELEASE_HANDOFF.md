# GNAMMA · Cumulative handoff — STAGE 3: TEN-CHAPTER READER RELEASE
**Date:** 2026-10-30 · **State:** release candidate; browser/PDF/offline validation and merge evidence must be recorded in GitHub checks. **CUMULATIVE**: all nine earlier chapters, new tenth, source catalogue, Atlas, and stage checkpoints are preserved.

## 1. What the user asked and what has actually been built
The research goal is to reconstruct **the entire strongest post-Avicennian philosophical system** in dialogue with Ibn Sīnā, Rāzī, Ṭūsī, later *Tajrīd*, *Mawāqif* and *Maqāṣid* commentaries, Ṣadrā, Lāhījī, Narāqī, Khwānsārī, Jilwa, the Indian tradition and Aristotelian–Thomistic metaphysics. That includes *all twenty domains*, not merely the Giver of Forms or regress.

This release is a **ten-chapter bilingual working edition with source-critical philosophical comparisons**, not a complete critical translation of all those works. A successful web deployment establishes the site's availability, not completion of all source collation.

## 2. Direct recovery locations
- Repository: https://github.com/gnamma-research/booksite
- Summa overview: `research/intellectual-atlas/avicennian-summa/index.html`
- Chapter catalogue: `research/intellectual-atlas/avicennian-summa/chapters/index.html`
- **Reader**: `research/intellectual-atlas/avicennian-summa/chapters/reader.html#ch01` through `#ch10`
- Each chapter: `research/intellectual-atlas/avicennian-summa/chapters/NN-*.md`
- Source register: `research/intellectual-atlas/avicennian-summa/SOURCE_REGISTER.md`
- Twenty-domain evidence audit: `research/intellectual-atlas/avicennian-summa/SYSTEMATIC_FINDINGS_AND_EVIDENCE_AUDIT.md`
- Original corpus: `research/intellectual-atlas/downloads/intellectual-atlas-data.json` (386 records / 362 relationships / 359 scholarly sources / 20 families)
- Release build: `research/intellectual-atlas/build.py` + `build_release.py`
- Validation: `research/intellectual-atlas/tests/verify_summa_edition.py` + `verify_summa_reader_browser.py`; Atlas workflows in `.github/workflows/`.

## 3. Cumulative milestones
- **Stage 1** → [Corpus/source audit](STAGE_01_CORPUS_AUDIT.md): identified and preserved all nine original substantial chapters and their evidence status; directly reconfirmed selected primary online passages.
- **Stage 2** → [Tenth chapter and integration](STAGE_02_TEN_CHAPTER_EDITION.md): created chapter 10 on preservation and mediation and integrated it into the reader's actual chapter navigation.
- **Stage 3 (this file)** → upgraded the tests and offline release to **ten**, updated source register, GNAMMA front page and final current handoff. Site deployment to be checked externally.

## 4. Every substantive chapter and its status
| ID | File | Primary locus | Status |
|---|---|---|---|
| 01 | `01-mental-existence-and-quiddity.md` | Lāhījī *Shawāriq* I:50–52 | One complete bounded p.52 argument; other passages selective |
| 02 | `02-making-and-causal-explanation.md` | Lāhījī I:158–161; embedded *Maqāṣid/Mawāqif* | Objections, replies and adjudication substantially translated; quoted authors not independently collated |
| 03 | `03-substantial-motion-dispute.md` | Lāhījī I:53, Ṣadrā *Asfār* IV:85–87, al-Ḥillī | Direct arguments and rebuttal units; not original historical exchange between Lāhījī and Ṣadrā |
| 04 | `04-intellect-soul-and-identity.md` | Ibn Sīnā *Nafs* V.5; Ṣadrā; Aquinas | Selected lemmata and argument analysis, not complete *Nafs* |
| 05 | `05-four-causes-form-bestowal.md` | *Shifāʾ Ilāhiyyāt* VI.1, IX.5; Aquinas *De potentia* III.8 | Bounded definitions unit; selective exchange |
| 06 | `06-divine-agency-necessity-and-plurality.md` | *Shifāʾ Ilāhiyyāt* IX.1, IX.4; Aquinas III.16 | Selected source arguments and edition notes |
| 07 | `07-unity-plurality-and-divine-knowledge.md` | Narāqī *Jāmiʿ* II:165–167 | Bounded critique + reported mystic view |
| 08 | `08-universals-quiddity-nafs-al-amr.md` | *Shifāʾ Ilāhiyyāt* V.1 | Two translated bounded units, later *nafs al-amr* not comprehensively extracted |
| 09 | `09-mawaqif-maqasid-hylomorphism-mental-existence.md` | *Mawāqif* VII:34–35,45; *Sharḥ al-Maqāṣid* 78–79 | Selected layered kalām arguments; gloss attributions incomplete |
| 10 | `10-conservation-first-cause-and-secondary-agency.md` | Ibn Sīnā VI.1 pp.260–262, VI.2 p.264; Narāqī I:38–42; Aquinas *ST* I.104 | **Complete comparative argument chapter** with selected short Arabic/Latin lemmas; not unabridged translation of entire historical chapters |

Other original documents preserved: `primary-translation-causation.md`, `causal-dependence.html`, `COMPREHENSIVE_SYSTEM.md`, `AT_AVICENNIAN_FINDINGS_1.md`, `PRIMARY_TEXT_CROSSWALK_01.md`, `four-causes-and-forms-research.md`.

## 5. Cumulative philosophical conclusions
1. **Ontology:** Lāhījī resists treating existence as an *additional externally actual thing* adjoined to a prior actual quiddity, while still recognising particular existences. This is more subtle than simple essence/being slogans.
2. **Mental existence:** a cognitive content is substantial *as the represented nature* and an accidental quality *as an actually existing state of the knower*. Do not conflate these respects.
3. **Making:** Lāhījī's *jaʿl basīṭ* and the reported Taftāzānī–Ījī–Jurjānī objections separate the making of a contingent actual individual from the logically incoherent making of a quiddity *be itself*.
4. **Natural causes:** intrinsic forms and genuine natural dispositions exist in Ibn Sīnā, but the distinct role of the Active Intellect differs from Aquinas's account of natural generation.
5. **Motion:** Lāhījī's enduring subject objection is met by Ṣadrā's one continuous individual *existence*. These are substantive competing ontologies.
6. **Intellect:** the Active Intellect's role in abstraction need not be identical to the form-bestowing role in physical generation; human intellectual habits differ from acts of intellection.
7. **Conservation:** **Ibn Sīnā already teaches ongoing causal dependence** (*Ilāhiyyāt* VI.1), Narāqī elaborates the modal proof, and Aquinas distinguishes conservation from new temporal production.
8. **Mediated causes:** Aquinas *ST* I.104.2 expressly allows created causes **secondary conserving** effects while God principally conserves. The previous “Aquinas excludes intermediary conservation” interpretation is corrected.
9. **Freedom:** divine causal and ontological dependence does not settle whether this particular cosmic arrangement was necessary or freely specified.
10. **Unity:** Narāqī refuses an identification of all finite existents with the Necessary Existent while preserving causal and epistemic containment.
11. **Universals and truth:** Avicennan quiddity considered in itself must not be mistaken for a third realm of already subsisting non-existent essences; detailed *nafs al-amr* requires later source texts.
12. **Kalām:** post-classical theological argumentation is a positive source of distinctions in matter, form and cognition, not a merely anti-philosophical polemic.

## 6. Major *still unresolved* primary-text demands
- A complete late Peripatetic **natural philosophy** of Narāqī, Jilwa and Khayrābādī: especially whether the Giver of Forms persists in their mature account.
- Independent verification of Jilwa's reported *Ithbāt al-ḥaraka al-jawhariyya* and its actual thesis; **do not infer his position from the title**.
- Complete Rāzī–Ṭūsī–Quṭb al-Dīn objection/reply exchange across the relevant *Ishārāt* passages.
- Separate readings of *Mawāqif*, *Maqāṣid*, *Shawāriq*, and their different printed/manuscript commentarial layers.
- Full bilingual translations of the relevant *Shifāʾ*, *Nafs*, *Asfār*, Narāqī and Indian *Hadiyya* argument units (many present chapters translate bounded excerpts rather than complete treatises).
- Manuscript collation: edition sigla do not prove direct comparison of physical witnesses.
- Detailed analogical/univocal/metaphysical *wujūd* and *waḥdat al-wujūd* classifications across authors.
- Later logic, *nafs al-amr*, prophecy, eschatology, ethics and political theory remain at earlier development stages, despite the 20-domain research matrix.

## 7. Release and QA instructions
```sh
python research/intellectual-atlas/build.py
python research/intellectual-atlas/tests/verify_summa_edition.py
python research/intellectual-atlas/build_release.py
# optionally serve from repository root:
python -m http.server 8123
python research/intellectual-atlas/tests/verify_summa_reader_browser.py --browser chromium --width 390 --height 844
python research/intellectual-atlas/tests/verify_summa_reader_browser.py --browser webkit --width 1440 --height 900
```
Production CI: `.github/workflows/atlas-release-artifacts.yml` builds source-critical Atlas PDF, offline ZIP and verifies the new handoff files. Browser QA checks count, individual chapter routes, RTL, light/dark and overflow. **UI success does not certify the full philology.**

## 8. Continuity policy for the next stage
Every further stage MUST preserve the previous handoffs; update `HANDOFF_CURRENT.md` to the latest complete state; record **exact changed files, source witnesses, translation coverage, test results, branch/commit**, and unresolved assertions. Do not replace the actual manuscripts or prior chapter texts with abstract outlines. Prioritize **actual passage translation and collated variants** instead of merely growing a bibliography.

**Final interpretation of “complete”:** the ten-chapter GNAMMA *release deliverable* can be marked built and published once CI and Pages pass; the full twenty-domain multi-manuscript critical summa cannot honestly be marked complete.
