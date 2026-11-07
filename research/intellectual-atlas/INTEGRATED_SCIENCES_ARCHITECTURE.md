# Toward a unified atlas of the Islamic sciences
Gnamma Research · design specification · 7 November 2026

**Status:** proposed architecture, NOT an imported or verified fiqh/hadith corpus. This document is a design handoff. Its examples must not be published as historical dependency edges without textual evidence.

## 1. Governing principle

Build one source-audited, multi-layer knowledge graph under the existing **Texts in Time** atlas, not one undifferentiated chronology of famous scholars. A text's date, a school affiliation, a pupil–teacher connection, a formal commentary, an explicit citation, an objection, and an interpretation of a hadith are **different claims**. Every edge must say precisely which claim is being made and what supports it.

The existing philosophical/kalām/logic map and its named textual-family routes should remain intact. New disciplinary views should draw from the same entities and links, not copy or flatten them. An individual text may belong to several sciences; an individual question may cross sciences.

### Orthogonal axes
- **Time and place:** composition/redaction/attestation/printing with distinct dating status, political and scholarly geographies (not proof of influence).
- **Disciplines:** philosophy, logic, kalām, Qurʾānic exegesis, ḥadīth, uṣūl al-fiqh, fiqh, Arabic language, taṣawwuf, intellectual history; *multiple labels* permitted.
- **Works and passage families:** root text, its recensions, commentary/gloss chains, abridgements, disputations, translations, and manuscript witnesses.
- **Questions and arguments:** issues, theses, evidence, counterarguments, replies, adjudications, the precise passage where each is expressed.
- **Schools and communities of practice:** legal madhhabs, kalām affiliations, philosophical receptions, hadith transmission circles, regional study networks—non-identical and historically mutable.

## 2. Shared ontology and identity rules

| Entity | Identity / editorial requirement |
|---|---|
| Person | Authority record with names, aliases, dates and ambiguity; distinguish homonyms (especially the two Rāzīs). |
| Work | Stable authored-work ID; separate conceptual work from manuscripts, versions and modern editions. |
| Work witness / edition | Manuscript shelfmark, folio, date of copying, published edition, page or numbering scheme, provenance. |
| Passage | Stable internal ID plus source-specific locator; optional aligned Arabic and English; editorial verification state. |
| Question / issue | A reusable conceptual or legal issue independent of an author, school or book. |
| Proposition / argument | A precisely attributed thesis, objection, reply, proof, counterproof or qualification attached to a passage. |
| Legal position | Issue, ruling, author and school attribution, historical scope, conditions, evidence and authority status; a school is not assigned one timeless opinion. |
| Hadith occurrence | An occurrence of a reported tradition in a particular collection/edition/book/chapter, not a supposedly universal number. |
| Matn variant / report cluster | Reconstructed relationship among wordings; grouping is explicitly editorial and revisable, not a claim that wording is identical. |
| Isnāḍ / transmission link | Ordered transmission assertions, variant chains and their individual provenance; distinguish narrated transmission from literary quotation. |
| Narrator / critic / appraisal | Person record and context-specific reliability evaluations, each attributed to its source or critic. |
| Qurʾānic passage | Sūrah/verse locator and, when relevant, reading (qirāʾa), syntax and interpretive analysis. |
| Tradition / institution | Historical organization, madhhab, teaching community or research current, with qualified affiliation and geography. |

**Never conflate:** an author's position with a school's later relied-upon position; two attestations of the same ḥadīth with a single editorially normalized report; a manuscript copy date with authorship; an isnād link with a modern scholarly citation; a repeated argument with an established historical borrowing.

## 3. Evidence-typed edges

Recommended edge families:

1. **Bibliographical:** authored_by, contains_passage, has_witness, version_of, translates, abridges, expands, comments_on, glosses, cross_references.
2. **Dialectical:** states_thesis, objects_to, replies_to, rebuts, agrees_with, qualifies, adjudicates_between, reuses_argument. The arrow must start/end at the appropriate work or passage; 'response to author X' is a *derived query*, not an unsupported universal claim.
3. **Hadith:** attests_occurrence, has_matn_variant, has_isnad, narrates_from, evaluates_report, quotes_report, accepts_as_proof, rejects_as_proof. The *evaluator* and evaluation rationale belong in the record, not in an unqualified binary authentic/inauthentic field.
4. **Fiqh and uṣūl:** addresses_issue, ascribes_opinion_to, states_school_position_in_context, adduces_quran, adduces_hadith, derives_using, disputes_ruling, applies_principle, engages_earlier_jurist, gives_fatwa.
5. **Intellectual and institutional:** studied_with, taught_at, cites_work, transmission_attested, reception_reported, chronology_only, speculative_parallel. These **must not** automatically turn into doctrinal influence.

Every edge stores:
- source_id / target_id and relation_type;
- cited primary locator if verified, and bibliographical references with stable identifiers;
- certainty: **passage-verified / explicit bibliography / specialist secondary / proposed / disputed**;
- the direction and precise scope of the claim;
- an editorial note giving contrary or alternative evidence where relevant;
- textual witness, edition and language where available;
- dates independently qualified by composition, redaction, copying, publication or terminus.

## 4. Hadith-specific network (do not flatten it)

For ḥadīth, provide distinct navigable layers:
- **Collection map:** al-Muwaṭṭaʾ, major musnads, sunan and ṣaḥīḥ collections, their recensions and commentaries; book/chapter/numbering systems are *edition-specific*.
- **Report map:** occurrences, matn variants, shared themes and cross-collection concordances; editorial clustering must retain differences in wording and context.
- **Isnād graph:** narrator-by-narrator chains with dates, locality, claim of encounter, modality of transmission, and authority/identification uncertainty. A narrator's name must resolve to an authority record before being merged.
- **Critical literature:** source-specific authenticity and narrator evaluations, causes of disagreement, text-critical and legal deployment of a report.
- **Legal/interpretive use:** the precise jurist, uṣūlī or commentator who adduces or rejects a specified occurrence/reading as evidence.

On screen, these are separate tabs or overlays rather than one visually unmanageable combined directed graph. Avoid projecting modern 'canonical' hadith numbering across manuscript or collection traditions.

## 5. Fiqh and school-specific network

Represent a school not as a single father-to-son chain or one node with one opinion but as overlapping **texts, transmissions, arguments, regions and eras**:
- Foundational reports and early legal teaching.
- School formation, differing students/recensions and geographically distinct transmissions.
- Authoritative root texts (mutūn), major shurūḥ, ḥawāshī, mukhtaṣarāt, and later tarjīḥ/iftāʾ strata.
- Issue-centred comparative juristic positions, with author/date/region and status of the attribution.
- Evidence and method: Qurʾānic language, hadith usage, ijmāʿ, analogical reasoning, istiḥsān, ʿamal, maṣlaḥa and other relevant principles; these may be disputed within traditions.

For example, a Mālikī text may be situated simultaneously within a Mālikī book lineage, the history of western Islamic law, a question such as masḥ al-raʾs, and particular hadith attestations. Those are distinct axes, not four separate copies of the work.

## 6. Start with two cross-science pilots

### Pilot A: Qurʾān 5:6 and the obligation to wipe the head
Create a **Question hub**: *What minimum wiping of the head fulfills the wuḍūʾ obligation?*

Link only **verified passages** for:
- the verse, its grammatical analysis and qirāʾāt as relevant;
- pertinent hadith occurrences and matn/isnād variants;
- the distinction between uṣūl discussions of linguistic minimum, obligatory measure and legal evidence;
- qualified Mālikī, Ḥanafī, Shāfiʿī, and Ḥanbalī juristic treatments;
- Ibn Rushd's *Bidāyat al-mujtahid* as an explicit comparative analysis of the causes of difference;
- any editorial cross-link to the *al-Ḍarūrī* reader with its exact section locator.

The example demonstrates the interface; **do not pre-assert a source-to-source citation before collating the passage**.

### Pilot B: an objection/reply in the Ishārāt tradition
Start from one of the existing response edges to Fakhr al-Dīn al-Rāzī:
- Ibn Sīnā's relevant *Ishārāt* locus → al-Rāzī's explanatory criticism → al-Ṭūsī's exact reply → Quṭb al-Dīn's later adjudication, **where attested**.
- Retain the *work-level* sourced edges already recorded, but mark *passage-level reply links* as unavailable until the Arabic loci are identified and collated.
- Attach the philosophical subject (e.g., knowledge, causality, modality) to a shared **Question** entity that later may connect to a kalām or uṣūl question without asserting doctrinal identity.

## 7. Proposed reader and atlas interaction

Maintain the existing compact GNAMMA/Darūrī-style reader, rather than burying the diagram beneath controls.

**Navigation (compact, Darūrī-aligned):** retain GNAMMA’s existing global five-icon dock. On the atlas screen expose only **Search**, a compact **Science** multi-filter, and a **Lens** selector. Lens choices (Timeline, text family, question, school, report/isnād, legal comparison, argument response) are context-sensitive; place advanced date, evidence and school filters in one collapsible drawer. On phones, use a single bottom sheet for the selected record, not seven always-visible tabs. Hiding a science or layer never deletes records.

**Search paths:**
- Open a work → its commentary tree, passages, author, dated witnesses, related questions.
- Open a question → sources, hadith evidence, legal positions, arguments, replies, user-selectable school/science overlays.
- Open a hadith occurrence → exact Arabic/translation, collection locator, variants, isnād graph, juristic uses, scholarly evaluations.
- Open a madhhab → time-qualified legal texts and regional recensions; a comparative issue view rather than a timeless doctrinal summary.

**Relationship styling:** clear visual difference between verbatim quotation, commentary, reply, textual borrowing, transmission, uncertain proposed analogy and merely chronological coexistence. Every arrow opens its *evidence*; no arrow from a speculative semantic search without human review.

**Deep linking and exports:** preserve selection, question, science, school, edition, period and evidence filters in a stable URL. Support reversible backlinks to the precise reader locus. Export citation-rich JSON/CSV and a human-readable bibliography.

## 8. Data layout and incremental adoption

A scalable split without rewriting the existing atlas:

- Existing intellectual-atlas nodes and edges remain the **legacy-compatible public layer**.
- Separate validated source packages by corpus (works/authors, manuscript witnesses, Qurʾān, hadith, fiqh, logic/kalām, questions/arguments).
- A build-time authority and relation validator joins packages into one public graph with stable IDs and optional precomputed views.
- Derived analytical views (response maps, school-lineage maps, report concordances) are *queries* over the graph, not hard-coded duplicated copies.
- A lightweight compatibility adapter maps the current work-level IDs into the new ontology. Never break published backlinks.
- QA gates: no orphan nodes, no unresolvable sources or locators, no cycles *for an edge type asserted as chronological sequence*, no undated books silently given a composition year, no unsupported author identity merger, no school claim without source/status.

**Proposed content states:** bibliographical lead → source identified → work text imported → passage aligned → witness verified → critical collation completed → scholarly reviewed. The public reader must expose these states rather than silently treating all entries as completed editions.

## 9. Rollout order

1. **Preserve and test** the current Texts in Time site and the new Fakhr al-Dīn al-Rāzī response route, including mobile and shareable hashes.
2. **Build the schema and authority registry**, plus cross-science question and exact passage IDs. Do not enlarge the graph merely by adding generic author nodes.
3. **Deliver the two proof-of-concept hubs** above, integrating the existing *Bidāya–Ḍarūrī* and *Ishārāt* reader routes and source evidence.
4. **Import a small hadith collection sample** with manuscript/edition-aware numbering, matn variants, distinct isnād chains and documented juristic citations.
5. **Scale school-by-school** to root texts, legal method, major commentary layers and region/time-qualified opinions.
6. **Scale across tafsīr and taṣawwuf** with the same source and passage discipline; add editorial comparisons that preserve real methodological differences.

This is a programme for **connected reading and investigation**, not an automated harmonization of fundamentally distinct sciences. The strongest GNAMMA feature would be the ability to start with a single text or disputed proposition and trace all *evidenced* ways it enters the wider Islamic intellectual tradition.
