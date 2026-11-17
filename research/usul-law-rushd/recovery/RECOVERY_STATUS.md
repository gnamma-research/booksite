# Bidāya canonical source-recovery status — 26 October 2026

## Important: current two editions are not the original complete research reader

The combined prototype, and the law/life editions derived from it, contain **three illustrative case-topic records**, not the canonical Revision16 representative reconstruction. The latter is a separate substantial research work. The UI prototype may not be used as a substitute for that source.

## Available and published in Gnamma Research

- `texts/ibn-rushd/bidayat-al-mujtahid/`: two-edition selection page; pages under `law/` and `human-life/` are distinct HTML views of the public *preview*.
- `research/usul-law-rushd/`: pre-existing preliminary method study, linked to the editions.
- `research/usul-law-rushd/alternative-usul/`: a separate provisional research archive **v0.1 + supplement v0.2**, consisting of 12 full case discussions, 13 further issue reviews, 4 countertests, 15 interpretive articles, 28 application addresses and 115 source records. This was recovered from `Bidaya_Alternative_Usul_Case_Register_v01.json` and `Bidaya_Alternative_Usul_Supplement_v02.md` in the project's existing Library. Its own metadata says **not integrated into Revision16** and references B-addresses, not K-position IDs.
- `research/usul-law-rushd/qawanin/`: an accessible *earlier* 19 October working copy of `Ibn_Rushd_Qawanin_Research_Dossier.md` (and a Markdown source file). A larger later expanded copy exists in Library but could not be read in full for this migration; the public page says this explicitly.

## Still missing and required for faithful canonical migration

Past project handoffs identify an original local work tree containing:

- `output/master-reader.html` — the comprehensive local interactive research reader.
- `output/master-framework-and-commentary.md` — the accompanying canonical methodological and analytical text.
- `output/bidaya-primary-census.json` — the extensive primary-book/heading census.
- The actual Revision16 proposition/dossier registers and the source-aligned text assets, which must be collected from that same work tree (do not invent filenames or addresses).

The local `/Users/.../.codex/.chatgpt-projects/.../output/` tree is **not** accessible from the current GitHub repository or Project Library. Do not claim it has been imported. The preceding materials were not found in the public repository's tracked tree, and title/content searches in the accessible Project Library did not locate these exact canonical master filenames.

## Distinct canonical counts (do not conflate)

- 57 numbered books of the supplied **English arrangement** mapped to Arabic spans and selected studies.
- 72 editorial divisions are a separate editorial navigation measure.
- 854 recoverable headings = 839 English OCR headings + 15 Arabic funeral headings.
- 310 detailed **working groups** represent the existing selected legal integration, not an every-rule reconstruction.
- 279 K-position propositions were preserved as a distinct research register.
- All 542 earlier *reader section addresses* were stable in the Revision16 handoff. These should not be replaced with the 28 application B-addresses from the alternative-uṣūl supplement.
- Coverage remains **representative throughout both Bidāya volumes, including worship**; the withdrawn 75% goal is not a target.

## Next source-controlled import (blocked on original master)

1. Obtain the actual canonical original `master-reader.html`, `master-framework-and-commentary.md`, `bidaya-primary-census.json`, and Revision16 register / source text assets from the local work tree.
2. Inventory and hash each original source; compare every 542 anchor, 310 group and 279 K-position, with an exception register for missing or duplicate items; verify 57 books, 72 editorial divisions and 854 headings without pretending these are the same unit.
3. Import a single common legal text and case substrate; Edition I renders law-only evidence, methodology and decisions; Edition II adds clearly attributed *separate* interpretations of virtue, agency, political life, tawfīq etc. The philosophical material must not generate new legal status or silently change a legal `ʿilla`.
4. Retain the former original site as an archived read-only checkpoint until the parity audit passes, and only then promote the editions from "research previews" to appropriately qualified scholarly readers.
5. Return the listing from Gnamma **Research** to **Texts** only on explicit direction from the project owner.

## Cross-repository coordination

The live repository is `gnamma-research/booksite` (branch `master`). Before every subsequent change, inspect the latest source and current `daruri/CURRENT_RELEASE.md` where relevant; other parallel workflows also update this repository. No full-Corpus publication may be asserted solely because the two edition links resolve.