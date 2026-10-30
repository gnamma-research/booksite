# Gnamma Intellectual Atlas — comprehensive UI QA

**Current atlas research corpus:** 386 scholarly/context entries, 362 evidence-qualified
relationships, 359 specialist bibliographic source records and 72 historical
references. It contains 20 textual commentary/translation families,
17 intellectual/reception classifications (including qualified overlays),
10 regional context routes and five explicit scholarly-network bands.
Political and textual coincidence is **not** asserted to be intellectual
influence.

## Automated browser matrix

The workflow `.github/workflows/atlas-exhaustive-ui-ci.yml` runs
`verify_exhaustive_ui_browser.py` against the actual local web application
in **six** configurations:

| Browser engine | Screen | Coverage |
| --- | --- | --- |
| Chromium | 1440 × 900 | Full control matrix |
| Chromium | 390 × 844 | Full matrix on phone portrait |
| Chromium | 844 × 390 | Full selectors and actions on landscape |
| WebKit | 1440 × 900 | Full control matrix |
| WebKit | 390 × 844 | Full matrix on phone portrait |
| WebKit | 844 × 390 | Full selectors and actions on landscape |

Unlike code-inspection smoke tests, this browser test **activates** controls
and verifies state and rendered content after each action. It exercises:

- Every **20** textual family option in the drop-down, and all **20** corresponding
  exploration buttons; roots, memberships, range, evidence status and reset.
- Every **17** tradition button, all 17 tradition checkboxes, including
  non-exclusive Neoplatonic, Ashʿarī and Māturīdī reception overlays.
- Every **10** regional option and, on full matrices, all ten regional
  summary buttons; meaningful results and cross-filter behavior.
- Each **13** relationship checkbox in both directions.
- All four main views; six evidence sub-tabs; catalogue pagination;
  text, author, relation, history and source-detail navigation.
- Search suggestions and no-match feedback, Enter and Escape actions, a search
  across earlier restrictive filters, and opening a record from an SVG card.
- Date presets, manual valid and invalid input, Whole atlas, zoom,
  earlier/later, clickable century clusters, keyboard navigation, the in-chart
  All years button where visible and source-dossier shortcuts.
- Historical layer visibility (states, events, school networks), contexts,
  evidence qualifications, link mode, density and neighborhood depth.
- Deep-link reloads, standalone regional/source links and malformed year links.
- Explicit empty intersections and a reset that preserves the historical window.
- Light/dark colors, invalid SVG coordinates, duplicate DOM ids and horizontal
  page overflow.

The original `verify_atlas_browser.py` retains scroll-height/long-details
coverage, and `verify_continuous_scrub_browser.py` tests repeated pointer and
real Chromium mobile touch movements **during** a drag, with no release jump.

## Bugs verified by expanded test cases

- Reversed or blank manual year intervals silently changed the chart rather
  than reporting invalid input.
- An out-of-range deep-link pair could invert the date axis; a standalone
  region/source hash was ignored.
- Search could open a scholarly work while incompatible tradition filters
  kept that same selected work off the timeline.
- Ordinary SVG book/century clicks were swallowed because pointer capture
  happened at pointer-down, not after a drag was established.
- Whole atlas did not consistently reset all secondary historical/qualified
  layers, even when its name implied a comprehensive reset.
- An intersection of filters producing no records needed an explanation and
  a way to clear restrictive dimensions without losing the current era.

## Reproduction commands

From the repository root, with Python Playwright, Chromium and WebKit installed:

```sh
python -m http.server 8123
python research/intellectual-atlas/tests/verify_atlas_browser.py
python research/intellectual-atlas/tests/verify_continuous_scrub_browser.py
python research/intellectual-atlas/tests/verify_exhaustive_ui_browser.py --browser chromium --width 1440 --height 900 --full
python research/intellectual-atlas/tests/verify_exhaustive_ui_browser.py --browser webkit --width 390 --height 844 --full
```

CI keeps per-viewport JSON outcome files, failure screenshots and current UI
screenshots as downloadable workflow artifacts. Running the canonical
`build.py` first guarantees that the embedded HTML and source JSON agree.

## Remaining manual device and accessibility checks

Browser-automated success is strong regression evidence, **not an exhaustive
proof** of user experience on every operating system. A physical iPhone Safari
test should still confirm finger inertia, browser navigation chrome behavior,
VoiceOver reading order, touch-target comfort and long-menu interaction.
Actual desktop trackpads, macOS Safari and user-selected text scaling should
also be checked on their native devices before a formal accessibility
certification. Automated tests neither prove every historical source
interpretation nor substitute for a scholarly citation review.
