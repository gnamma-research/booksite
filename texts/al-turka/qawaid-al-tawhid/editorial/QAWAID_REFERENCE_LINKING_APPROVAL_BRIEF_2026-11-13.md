# Qawāʿid / Tamhīd — reference and cross-reader linking proposal

**Decision requested, 13 November 2026. Proposal only. No new Qurʾānic, ḥadīth, *Fuṣūṣ* or other primary-work links will be introduced by this UI release until reviewed.**

## Reader priorities already being implemented

The original matn and Ṣāʾin al-Dīn's commentary are separate layers, visually distinct and independently selectable; the commentary has collapsible headings. Four familiar modes (Normal, Focus 1, Focus 2, Continuous), independently switchable Arabic/English, a single mobile-friendly control row, a stable numbered reading dock, source-scoped editorial metadata and the existing published five PDF profiles remain. The new geometric frontispiece and book-specific emblem are not the Darūrī mark.

The 82 headwords, subject index, 18 **existing** source reference cards, original notes, bookmark/annotation storage, PDF manifest and accepted 171 bilingual units are preserved. Existing verified inline source labels are not altered. The new search is purely local: normalized Arabic/English, quoted phrases, word/exact, within-unit proximity, KWIC, original/commentary part filters, curated lemma and root-family examples, dictionary/source-card facets, and private local notes. It does not claim full contextual Classical Arabic morphological disambiguation or semantic AI retrieval.

## Approval decision 1: What counts as a linkable source?

**Recommend three grades:**

1. **Explicit verified quotation or citation:** the medieval Arabic text actually names a work, quotes a passage or unmistakably cites a verse/hadith; match the source *and exact locator* against a reliable independently accessible Arabic text. These may gain an unobtrusive, tap-accessible source mark. Qurʾānic passages retain full Arabic original plus English and sūrah/āyah; hadith include named collection, chapter/number in identified edition and grading only from named authorities, not anonymous editorial inference. Other source cards show Arabic quotation, exact volume/page/section, bibliographic edition and accessible stable location.
2. **Strong but nonexplicit allusion:** keep in a separate optional **Parallels and possible allusions** panel, labelled *editorial interpretation*. Do not turn a similar Akbarian expression into a claim that Ibn Turka is quoting *Fuṣūṣ*.
3. **Provisional or unverified coincidence:** internal editorial worksheet only until checked. No inline mark. Never fabricate a canonical edition locator or a direct reader URL.

**Need your approval:** Should grade 2 allusions be surfaced in the optional apparatus, or kept entirely out until independently researched?

## Approval decision 2: The on-tap presentation

**Recommend:** a restrained gold or muted-blue superscript/source glyph immediately following an exact source phrase, visible only in Standard + optional Compact/Full apparatus. Tap opens **one lightweight source card** with Arabic text first, English second, exact citation, grade and a validated link. It must preserve a return-to-reading anchor and not reflow the paragraph.

- Focus 1: text unobstructed; marks optionally visible, explanatory card never in-flow
- Focus 2: no markers or editorial interruptions
- Focus 3 Continuous: no markers, cards, reference banners or footnotes by default
- The standard unexpanded reader keeps no paragraph-long footnote blocks; note content lives in the study/reference panel or scholarly PDF

**Need your approval:** On Normal view should the verified marks default to **off**, **minimal** (recommended), or **visible beside quotations only**?

## Approval decision 3: Internal vs external reader links

**Recommend:** destination hierarchy:
1. Same-work stable unit ID (`QT-...` / `SH-...`), with quotation highlight and return location
2. Another finished **GNAMMA/Nama** reader, but only where a stable verified exact passage/section anchor exists, not the home page of an unrelated work
3. Stable public digital edition / authoritative page viewer with a checked exact locator
4. If no reliable exact destination: bibliographic reference **without** a clickable destination

Every link card records **exact quote span, cited work, witness/edition, citation type, verified destination, match confidence, date checked, ownership/source rights and the earliest version in which it was added**. “Meaning is similar” is not sufficient. Never silently attribute a philosophical formulation to Ibn ʿArabī, Qūnawī, al-Qayṣarī or other works.

**Need your approval:** When GNAMMA has an unverified or partial translation of the cited work, show its Arabic reader alongside a qualified English/external source, or link only after a bilingual edition reaches a verified exact-coverage threshold?

## Approval decision 4: Notes, dictionary and subject graph

Existing **technical dictionary** and subject index remain menu-first and visually quiet. Possible extension after approval:
- In relevant passages, a small term-inspector action could show Arabic headword, English/Arabic definition, its recorded usage and verified equivalents, plus within-book concordance and related subjects.
- A subject graph could distinguish *source term / editorial concept / interpretive parallel* so the model never upgrades an interpretation to the author’s own doctrinal assertion.
- Cross-work connections could go from *Qawāʿid* to Ibn ʿArabī, Qūnawī, Sadrian metaphysics or other relevant works **only when separately reviewed**, keeping the distinction between text genealogy, conceptual analogy and intellectual history.

**Need your approval:** Prefer a two-tier term card (concise definition + “Study more”) rather than dense footnote popups? This is recommended for mobile.

## Agreed boundaries for this release

**Not implemented:** new citation links, source matches, Qurʾānic/hadith quotation insertions, external reader routing, new word-to-dictionary anchors, interpretive parallels, automatic allusion discovery, bi-directional conceptual graph edges, new PDF apparatus content, or background acquisition.

**Implemented independently:** mobile typography and layout, unique emblem/frontispiece, source-layer differentiation, existing reading modes, existing dictionary/index/PDF access and research search over already supplied materials. No Arabic or English canonical text has been modified, and no manuscript-critical claim has been changed.
