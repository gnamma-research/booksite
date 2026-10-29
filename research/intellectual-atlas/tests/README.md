# Intellectual Atlas revision 6 — checks and expected results

This atlas is *selective*, and chronological context must not become unverified
historical or doctrinal influence. The canonical dataset is
`downloads/intellectual-atlas-data.json`; the same JSON must be embedded in
`index.html`.

## Static invariants

- 331 scholarly and contextual entries; 312 evidence-qualified relationships.
- 317 bibliography entries plus 72 historical references.
- 49 political period records (48 plotted; the ceremonial Cairo Abbasid record
  remains catalogued but excluded) and 36 events.
- All 12 commentary-family roots/members exist, relationship endpoints resolve,
  IDs are unique, historical ranges are ordered, and 1540–1555 is distinguished
  as a *Mughal gap in rule over Delhi*, not a blank 15-year stretch of time.
- Three dated ancient context bands and ten new ancient bridge records retain
  source references and dating qualifications.
- Regenerated HTML JSON and canonical JSON have exact data parity.

## Browser checks

CI runs Chromium and WebKit browser tests `verify_atlas_browser.py` in four Chromium viewport sizes and two additional WebKit sizes:
1440 × 900, 1024 × 768, 390 × 844 (portrait) and 844 × 390 (landscape).
It checks that an oversized timeline vertically scrolls inside the diagram,
that ordinary vertical wheel motion does not unexpectedly pan time,
that horizontal gestures do pan time, and that desktop evidence details
have constrained independent scrolling. It exercises overlapping South Asian
context/Tahdhīb route filters, the 12 textual-family buttons, and Jurjānī's
two different book-centred routes (Mawāqif vs Tajrīd), as well as the source-rich
ancient periods and the explicitly dashed Mughal interval.

Keyboard arrow navigation and dark-mode canvas rendering are tested. CI stores
viewport screenshots for review; passing smoke tests does not replace manual
VoiceOver, TalkBack, iPhone Safari and trackpad gesture review.

## Manual release checklist

- [ ] Desktop trackpad two-finger vertical scroll moves the long panel, not time.
- [ ] Horizontal trackpad scroll (or Shift + wheel) pans years left/right.
- [ ] Drag with mouse, touch horizontal swipe, mini navigator and zoom work.
- [ ] Touch vertical scroll works inside diagram and does not trap the page.
- [ ] At diagram bottom, continued scrolling moves into following page content.
- [ ] Long detail pane can scroll independently on desktop; mobile detail opens
      above diagram and remains reachable by ordinary page scrolling.
- [ ] Open route → linked text → commentary evidence → back, at each breakpoint.
- [ ] Open direct links with `#view=timeline&text_family=tajrid&region=...`.
- [ ] Inspect fonts, contrast and focus indicator in light and dark appearances.
- [ ] Reconcile generated downloadable PDF/ZIP before calling them revision 6.

## Safari-compatible engine verification

WebKit automation is added to exercise the same independent scrolling and
layer-navigation logic on desktop and iPhone-sized viewports. This does not
prove physical iOS Safari touch momentum behavior, which remains an explicit
manual-device acceptance test.
