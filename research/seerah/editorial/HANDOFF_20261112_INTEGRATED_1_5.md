# Sīrah cumulative handoff · 12 November 2026

## Current state

**Current edition:** 1.5.0 · integrated explanatory first pass · under review. Seven books, 46 matns, 46 paired shurūḥ, nine preserved source-critical dossiers and seven atlas figures.

**Canonical:** `research/seerah/data/chapters.json`. 
**Static reader:** `research/seerah/read.html`.
**Current full manuscript:** `research/seerah/editorial/current-edition-1.5.0-integrated.md`, approximately 57,774 words at this stage.
**New foundation:** `research/seerah/editorial/AKBARI_INTEGRAL_FRAMEWORK_20261112.md`.
**Earlier detailed research dossier:** `research/seerah/editorial/MUHAMMADAN_REALITY_MIRAJ_HIGHER_AND_EARTHLY_UMRAN_RESEARCH_20261111.md`.
**Public entry:** https://gnamma-research.github.io/booksite/research/seerah/

**Previous editions retained:**
- Original critical-stage source: `research/seerah/editorial/source-edition-1.4.md`
- Exact former 1.4.1 full manuscript: `research/seerah/editorial/current-edition-1.4.1.md`
- Archive of same: `research/seerah/editorial/archive-20261112-preintegrated-complete-manuscript-1.4.1.md`
- Snapshot of pre-integrated canonical data: `research/seerah/editorial/archive-20261112-preintegrated-chapters-1.4.1.json`

## Content completed in this handoff

Chapters 01–02 retain their previous deep source-led work, byte-preserved in canonical chapter data. Chapters 03–46 (all 44) now have substantively newly composed continuous matns, with additional integrated Akbarian-informed explanatory material at the beginning of their sharḥ and the previous historical evidence and discussion retained afterwards.

The first-pass rewrite added approximately 10,155 words of new matn and 13,735 words of new sharḥ analysis across chapters 03–46; prior sharḥ discussions totaling ~16,530 words were preserved, not deleted. The final totals changed slightly when editorial language was polished. The 10 new per-book staging files under `research/seerah/editorial/rewrite-20261112/` are:

- `book-I.json`: 03–06 (kingdom, learning disciplines, Christian communities, late-antique empires)
- `book-II.json`: 07–11 (Meccan protection, Khadījah, proclamation, Aksum, the Miʿrāj, ʿAqabah)
- `book-IIIa.json`: 12–15 (Madinan agreement, worship, Badr, Uḥud and Trench)
- `book-IIIb.json`: 16–19 (Ḥudaybiyyah, Khaybar, return to Makkah, Farewell Pilgrimage)
- `book-IV.json`: 20–25 (succession and non-prophetic authority, conquests, fiscal orders, civil war, Umayyads and Abbasids)
- `book-Va.json`: 26–29 (Baghdad, hadith transmission, fiqh, endowments)
- `book-Vb.json`: 30–33 (kalām and philosophy, Ghazālī and Rāzī, spiritual character formation, ṣuḥba and Sufi networks)
- `book-VIa.json`: 34–37 (Cairo and Damascus, Andalus, Persianate world, Mongols)
- `book-VIb.json`: 38–42 (Niger, maritime Malay world, Bengal, Ottoman, Safavid and Mughal)
- `book-VII.json`: 43–46 (economic change, colonial law, print and education, migration and digital technology)

The **continuing historical source notes** remain part of each chapter's existing sharḥ, not replaced by metaphysical speculation. The research framework is integrated as source-identified interpretation. New reader content is static and uses the pre-existing dual mode (matn / matn+sharḥ); no third commentary mode was introduced.

## Governing method

The Prophet ﷺ is the singular, divinely commissioned comprehensive exemplar in the received Qurʾān and Sunnah. Akbarian readings of the Muhammadan Reality, complete human and `maqām lā maqām` provide a specific, attributed metaphysical account of integrality—not an unquestioned doctrine of all schools. The Miʿrāj is discussed as ascent through differentiated stations **and return** to daily prayer and community. Bodies, truthful speech, care, justice, counsel, household acts, legal judgment and community protection belong within the embodied historical exemplar, not as insignificant remnants of an inaccessible transcendence.

The later disciplines preserve **genuine but partial** knowledge and modes of inheritance (texts, law, acts, states, spiritual knowledge, companionship, reliable institutions). Their complementarity does not imply the abolition of specialist proof or the identification of law, ethics and the shaykh's experiential knowledge. Individual encounter → malaka → relational practice → institutional capacity → historically variable ʿumrān is a **research model**, not a mechanically necessary causal progression. Analyze rights, practices, ecological/economic conditions, authority and transmission independently of a metaphysical symbol.

Distinguish, for every claim:
1. Qurʾānic and authenticated Sunnah content;
2. transmitted historical variants and uncertainties;
3. juristic/doctrinal reasoning;
4. attributed Akbarian, early Sufi, or Traditionalist interpretation;
5. our own explanatory synthesis and causal hypothesis.

Do not equate Logos with Buddhi without specifying ontological viewpoint, or a saint with the unique prophetic office. Do not imply that an initiatic relationship is a prerequisite for all effective religious guidance or that every medieval mystical hadith is authenticated. Do not treat victims as necessary illustrations of providential harmony.

## Validation carried out

- 46 canonical chapter IDs unique and ordered.
- 46 static reader articles, 46 matn and 46 sharḥ sections.
- 46 corresponding numbered headings in the versioned manuscript.
- Full content token parity across canonical JSON, static HTML reader and complete current manuscript for both text layers, chapters 01–46.
- Chapters 01 and 02 exactly unchanged against pre-integrated archive; all 44 remaining matns actually changed; all 44 original historical sharḥ blocks retained as suffixes of their new sharḥ.
- Prior 1.4.1 manuscript restored and matches exact archived copy.
- All nine dossier IDs and seven atlas figure IDs present.
- Fourteen editor-directed/self-referential phrases found and corrected across canonical files; direct-prose regex scan passed afterwards.
- Public landing, reader edition notice and manuscript links updated to 1.5.0. The former planning revision-map has a notice that its old “not rewritten” statements are historically dated.
- The repository's `research/seerah/tests/verify.mjs` was updated for 1.5.0 and stronger preservation checks. Equivalent source-parity and editorial test logic ran successfully through connected repository content; **the Node test was not executed in a separate Node runtime**.
- GitHub connector confirms commits and file contents. **The external live Pages deployment was not independently accessible for visual verification**.

## Unfinished critical work (do not mark complete)

1. **One coherent sharḥ per chapter:** because the new Akbarian analysis was put before the older historical commentary, some chapters repeat transitions, source cautions and explanations. Consolidate in an editorial prose pass without deleting evidence.
2. **Report-level source review:** especially Chs 03–05, 07–11, 12, 15–20, 23–24, and regional chapters. Verify all Qurʾānic and hadith references and avoid conflating variant narrations.
3. **Akbarian source audit:** review Farghānī B2007 pp.103–116, Qūnawī Texts Four and Nineteen, Mahāʾimī MSH-055–058, Ibn Turka SH-039/050/051 and Ibn ʿArabī *Futūḥāt* 367 against Arabic and source edition; full al-Sulamī/Colby 56-item Miʿrāj collection remains unavailable for complete collation.
4. **First-pass brevity:** the new matns average only ~230 words and need deeper narrative evidence and more localized human encounters when a topic warrants it. Extensive expansions are especially justified for Chs 08, 11, 12–19, 27–33, 44–46.
5. **Independent specialist review:** history of early Sīrah, hadith, Qurʾānic interpretation, comparative Akbarian metaphysics and material history of the regional cases.
6. **Rendered deployment QA:** test mobile 320px/390px and desktop, both text modes, bookmarks, navigation and diagrams, plus external deployment status.

## Mandatory continuation protocol

Do not start from the 11 November “46 revisions pending” audit. Do not restart the first two chapters or retranslate completed passages in connected Akbarian projects. Start from the **1.5.0 canonical JSON and versioned manuscript**, read this handoff and framework, and use the 10 per-book rewrite files to understand the newly composed text. Preserve all 46 pairs and earlier editions. Any changes to a chapter must be synchronized in canonical JSON, static reader and versioned current manuscript. Run `node research/seerah/tests/verify.mjs` from the repository root in an environment with Node 20+ when available.

**Next bounded scholarly priority:** consolidate the duplicated sharḥ layers in Book II (Chapters 07–11) and Book III (12–19), then perform deep source audit and additional concrete Prophetic encounter studies, moving book by book through the remaining historical sections. Maintain a new cumulative handoff at every significant stage.
