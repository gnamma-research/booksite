# Gnamma Research — visual identity and reading backgrounds

## Shared visual identity
- **Symbol:** a single, irregular Australian rock waterhole rendered in terracotta, ivory and deep blue. No topographic rings, gradients or gimmicky cartography.
- **Wordmark:** understated lowercase **gnamma** in a warm editorial serif with generously spaced *RESEARCH* beneath it.
- **Colours:** rock / terracotta `#A85D3F`, pool `#255969`, warm ivory `#FBF9F4`, ink `#302C29`.
- **Ambience:** an actual natural gnamma among bare mountains; silence, looking, resting, serving the community, rather than luxury or technology marketing.
- **Homepage and collection pages:** scenic background by default; imagery occupies most of the viewport; copy is sparse; icon navigation exposes labels on hover and focus.
- **Reader:** its own scholarly content remains paramount. Reader backgrounds offer a persistent choice between *Native book appearance* and *Gnamma landscape*. This is per-book and remains in the same browser.
- **Scholarly interface:** citations, related-text return trails, independent reading lenses, dictionary and progress tools belong to the reader; visual branding must never replace or fabricate the underlying evidence.
- **Arabic and Latin:** fonts and language markup must retain correct directionality and diacritics.

## Hosted assets
- `assets/gnamma-mark.svg`: primary rock-pool symbol.
- `assets/gnamma-landscape.webp`: compressed scenic photograph when present.
- `assets/gnamma-scene.svg`: lightweight fallback landscape with no external dependencies.
- `assets/gnamma-ambient.css`: shared homepage and catalogue ambience.
- `assets/gnamma-book-backgrounds.css`, `assets/gnamma-book-backgrounds.js`: book-level native / scenic control.

## Editorial distinctions
The *al-Mustaṣfā* reader has full Arabic and selected English, not full English translation. Other work-specific pages may be orientation previews until the source editions are imported. Never publish invented quotations, invented dictionary citations, or claims that an unfinished edition is definitive.

## Publishing
The GitHub Pages site is served at `https://gnamma-research.github.io/booksite/`. Keep links relative to the repository root so it works as a project site. Avoid any Higgsfield dependency or AI-generative runtime in the website.

**Landscape disclosure.** The background is an illustrative generated rendering inspired by natural gnamma waterholes. It is not documentary photography of a named place. The site should never imply that the scene depicts a verified geographic location.

## Catalogue and reader architecture — October 2026

The homepage and all collection selection screens are scenery-first; main navigation is a right-side vertical high-contrast icon rail with its label displayed unobtrusively to the left on hover and keyboard focus. The homepage has no promotional copy or modal. Selecting a section opens a plain numbered index, without redundant definitions of Essays or Research.

**Books** are work-specific: each original edition retains its own native reader, editorial notes, references and typography. Background selection belongs to the existing moon/appearance control, not a second floating button. The full Daruri, Ibn Ajiba and Mawaqif editions still need importing; labelled previews must never masquerade as them.

**Essays** are compact written arguments and summaries of research, with appropriate citations and cross-references. **Research** is a multi-source, layered workspace in which textual witnesses, dictionaries, citations and commentary can be compared. Both use the fuller scholarly apparatus with a reversible reading path.

The approved high-resolution source landscape is stored in `assets/gnamma-landscape.webp` with an SVG fallback. The logo SVG is a traced version of the approved single organic rock-pool mark. The landscape is illustrative rather than geographic documentary evidence.
