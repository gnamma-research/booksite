# Atlas comprehensive UI audit — 30 October 2026

## Scope and execution

Run `python research/intellectual-atlas/tests/verify_exhaustive_ui.py` from
the repo root with a static local HTTP server on port 8123. Its CI workflow,
`.github/workflows/atlas-exhaustive-ui-qa.yml`, runs real Playwright Chromium
and WebKit interactions and uploads an `exhaustive-report.json` with
failure screenshots. The exact source used is also archived in CI.

The matrix checks the behavior, state, and visual availability of:

- All four top tabs; all six editorial audit sub-tabs.
- All 18 named textual-family entries and each corresponding exploration
  button, all 17 selectable intellectual currents, and all 10 region routes.
- All 17 tradition checkbox filters, 13 textual-relationship filters, six
  layers/scope checkboxes, and density, connection-visibility and neighborhood
  depth options.
- Date presets, BCE and CE input validation, all-years reset, zoom/pan,
  keyboard Home/End and arrow keys, and chart vs overview scrollability.
- Record selection, associated-source buttons, share URL, two-way evidence
  navigation, the relationship register and catalogue pagination.
- Search suggestions, opening by Enter, empty searches, incompatible
  triple-dimension selections, and recovery using the empty-state reset button.
- Hash links, reload, browser Back and preservation of hidden historical
  layers and catalogue page number.
- Research dossier, current PDF, canonical JSON, offline ZIP and links.
- Responsive layouts and color-scheme smoke in Chromium desktop/portrait/
  landscape and WebKit desktop/portrait.

## Known methodological boundaries

This is an **exhaustive per-control and representative pairwise interaction
audit**, not exhaustive enumeration of all combinations of 17 binary filters,
13 relation-type filters and multiple selectors. A complete Cartesian product
would be prohibitively large and would mostly repeat intentionally empty
filters. For each control, test the user action and resulting application
state; for combinations test representative cross-classification sets and
conflicting filters.

Mobile Chromium and emulated WebKit do not replace human verification of
kinetic finger scrolling, selection latency and VoiceOver in physical Safari.
The existing `verify_continuous_scrub_browser.py` specifically checks live
finger drag, no jump upon release and the all-years overview. The previous
`verify_atlas_browser.py` covers dedicated scrolling/source provenance cases.
These should continue running as well.

Tests of local download links confirm the local file is served successfully;
they do not independently confirm external third-party source availability.
The audit does not adjudicate the 375-record scholarly corpus or its evidence.

## Release gate

The comprehensive CI suite and existing browser tests must be green before
merging. Review any failure screenshot and JSON test name. Re-run against the
exact merged master commit, and perform a physical iPhone Safari interaction
pass before describing native iOS touch as fully verified.
