# Gnamma Research · multi-book scholarly library

This is the **library repository**, not the al-Mustaṣfā-only project.

## Publishable folders

```
/                      Public library landing page
/texts/                Text catalogue, manifest.json
/texts/{author}/{work}/ Author/work-specific reader, data and editorial evidence
/arabic/               Shared Arabic transcription (legacy root retained)
/essays/               Essay collection; scaffold only
/research/             Research and dossiers; scaffold only
/docs/                 Collection-wide editorial policy
/assets/               Shared catalog stylesheet
```

Current working published item: [al-Ghazālī, al-Mustaṣfā](texts/al-ghazali/al-mustasfa/). Other named books are **migration candidates**, not uploaded publications.

No copyrighted Hammad dissertation PDFs are committed. The Arabic transcription is derived from OpenITI and remains under CC BY-NC-SA 4.0; see the source/licence notes.

### Add a book

1. Choose stable `author_slug/work_slug`; do not repurpose existing slugs.
2. Place a responsive `index.html` and `assets/` in `texts/{author}/{work}/`.
3. Put primary-source and translation content in `data/`, with edition identifiers.
4. Include `editorial/EDITORIAL_STATUS.md`, source registers, translator notes and quality gates.
5. Add a `texts/manifest.json` entry with a link **only when the reader exists**.
6. Check navigation (back to original locus), Unicode Arabic display, phone viewport, search, source citations and licences.

### Hosting

Use GitHub Pages from this repository's default branch `/ (root)` when Pages is activated in Settings → Pages. Deployment is separate from committing files; don't assume the website is live until GitHub Pages returns an active site.

## Mobile deployment status

The live Gnamma library is published via GitHub Pages at **https://gnamma-research.github.io/booksite/**; GitHub's Pages deployment workflow reported success on 19 October 2026. The al-Mustaṣfā reader is at **https://gnamma-research.github.io/booksite/texts/al-ghazali/al-mustasfa/**. Check Settings → Pages and the deployment history to confirm subsequent releases.

The download ZIP intentionally omits the full 1.8 MB Arabic corpus already committed under `arabic/full-arabic-pages.json`. Its reader falls back to that public GitHub source online if a local copy is missing. For a fully offline Arabic archive, add that file at the matching path.