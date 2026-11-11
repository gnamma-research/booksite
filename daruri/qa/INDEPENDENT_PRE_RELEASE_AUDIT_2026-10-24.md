# Darūrī pre-release independent audit — 24 October 2026

**Baseline:** master cf2cfb78adce23c0fa1d43b5497b8aae75b73659.
**Status:** RELEASE NO-GO pending navigation and accessibility repair. All user source material, existing published PDFs, saved personal data, and experimental Stage-2 browser PDF output must remain untouched.

## Evidence and branches

- [QA-only draft PR #167](https://github.com/gnamma-research/booksite/pull/167): independent Chromium/WebKit cross-browser tests; screenshots and machine-readable reports in GitHub Actions artifacts.
- [Failed baseline run 40099776404](https://github.com/gnamma-research/booksite/actions/runs/40099776404), corroborated by [expanded mode run 40100238127](https://github.com/gnamma-research/booksite/actions/runs/40100238127).
- [Unmerged targeted CSS fix candidate PR #169](https://github.com/gnamma-research/booksite/pull/169): current-master Focus Contents and mobile toolbar controls, with 48 end-to-end browser scenarios and artifact capture. Requires green CI and review.
- [Broader unmerged UX PR #148](https://github.com/gnamma-research/booksite/pull/148) passed Chromium and WebKit on its **own divergent head**, run 40036279263. Reconcile with latest Copy/icon changes before integration. Older PR #145 failed WebKit 320px. Do not merge stale overlapping patches directly.

## Independently reproduced defects

| Priority | Problem | Evidence | Exit criterion |
| --- | --- | --- | --- |
| P0 | Contents opener hidden by Focus-specific CSS | Saved Focus 1 gave the existing button zero width/height in both engines at 320, 350, 375, 390, 430, 620, 768, 1024 and 1440px. Expanded suite independently reproduces on Focus 2 and Continuous. | All modes offer a visible, accessible Contents launcher, usable route selection, correct return to the reader |
| P1 | Narrow mobile toolbar clipped | In normal Reading, Visuals/Settings button extends beyond 320px and 390px viewports in Chromium and WebKit even when overall document scrollWidth fits. | No hidden, clipped or overlapping controls in any phone orientation or 200–400% zoom |
| P1 | Insufficient contrast | axe-core WCAG scans report seven serious failures on the 390px reading view in both browser engines. Ratios: active Arabic control 4.34:1; paragraph links 2.81:1; Terms and Concepts metadata 3.92:1; dock paragraph reference 4.34:1, where 4.5:1 applies. | Correct actual colors/ratios in every theme without sacrificing active states or legibility |
| P2 | Excessive precache redundancy | Static audit of service worker CORE: 186 URL entries, 119 unique file paths, ~18.73 MB raw summed sizes vs ~12.29 MB distinct raw files; ~6.44 MB represented twice under versioned URLs. | Preserve exact offline URL matches while deduplicating obsolete versioned resources and verifying cache updates |
| Investigation | Offline first-controlled reload | The initial browser simulated network loss before verifying page control; after adding control wait, service-worker registration/activation failed to complete within 75s in the localhost test. This is not yet a demonstrated deployment defect. | Instrument registration/install errors and compare ordinary site offline behaviour with a clean browser profile |
 
Source HTML alone is ~3.55MB raw; current edition script ~1.45MB raw and dictionary script ~443kB raw. These are repository file sizes, not measured live compressed transfer values. The 172.8MB aggregate local server traffic for first suite covers **dozens of new browser contexts**, NOT one user visit.

## Passed bounded tests

- Current master reading page loads in Chromium and WebKit at nine widths; no page-wide horizontal overflow found, even though individual controls are clipped.
- Real JavaScript-disabled browser rendering produces readable fallback text and 6,159 matching internal link destinations. Direct no-JS navigation to section 11 rendered a visibly sized, text-filled section in both Chromium and WebKit.
- With font requests denied and Arabic locale, Arabic script and main controls still render; with storage API blocked, reading UI still renders.
- Search term qiyas → search result → reading → return preserves query in both engines.
- Eighty synthetic rapid local input events did not trigger watchdog failure; injected image-onerror markup did not execute as code.
- Invalid section/paragraph hashes did not blank the reader. Initial loads produced no unhandled page exceptions.
- Existing CI additionally covers scholarly H/Q/N evidence, Reading Desk data safety, stable paragraph links, modes, book hierarchy and published editions, but is not comprehensive release certification.

These passes do not demonstrate production DDoS protection, normal-speed network performance, every fallback link's usability, download load limits, real-device rendering, or WCAG certification.

## Full QA execution and acceptance plan

| Phase | Required coverage | Gate |
| --- | --- | --- |
| 1. Baseline/source integrity | Exact Git SHA; master vs open PRs; sections, 416 source paragraph identifiers, linked notes, 12 signed PDF bases, saved user state | No content or identifier regressions |
| 2. Navigation graph | Home, Contents, reader, Focus/Continuous, Search/result/return, Dictionary, Index, Study, Bidāya, visual panel, Reading Desk, Downloads, all dialogs and Help. Reload/Back/Forward/invalid URL and precise anchor return | No trapped or lost journey; logical keyboard focus restoration |
| 3. Icons and UI consistency | Icon semantics, stroke/optical size, hit-target area, selected/hover/focus states, all languages, light/dark themes and actual screenshot inspection | Controls consistently discoverable, nonduplicated and nonoverlapping |
| 4. Minimal content | Trim redundant instructions and duplicated UI labels page by page while preserving edition provenance, source qualifications, status and destructive-action descriptions | First-time usability trials with no unnecessary tutorial text |
| 5. Responsive + assistive | 280–2560px, portrait/landscape, text enlargement, zoom 200/400%, keyboard, VoiceOver/TalkBack/NVDA, touch, Arabic RTL and mixed bidi | All primary workflows accessible; appropriate contrast and reduced motion |
| 6. Restrictive browsers | JavaScript/clipboard/storage/fonts disabled; locale mismatch, older WebKit/Firefox, ad blockers, no/corrupt cache, failed service worker, network drops, interrupted PDFs and ZIPs | Clearly recoverable readable output; no silent data loss |
| 7. Real performance | Cold/warm mobile speed, total compressed bytes/requests, font costs, LCP, CLS, INP, search p50/p95, long-session memory, ZIP/PDF cancellation and large-notes load | Budgets based on measured actual pages; no unbounded CPU/memory spikes |
| 8. Abuse and privacy | Bounded local rapid searches, repeated download clicks, concurrent fetches/ZIPs, long malicious queries, XSS, quota errors, stale tabs, CSP, hosting limits; do not load-test public production | Local concurrency protections and independently verified hosting/CDN controls |
| 9. Fix/regress | P0 blocked navigation first, P1 contrast and clipping next, then other UX/performance. Run changed and untouched established CI on final candidate SHA, with screenshot/evidence review | Green across changed features and preserved scholarly data |
| 10. Independent final verification | Actual iOS Safari, Android Chromium, accessibility screen readers, offline installs, real network and signed PDF artifacts | Exact-sha published release gate only after all critical checks pass |

### Strict release policy

Do not treat existing green workflows as proof of exhaustive quality: their asserted paths missed the hidden Contents launcher. Do not treat raw sizes as bandwidth statistics. Do not run a DDoS attack on the live site. Test candidates and Stage-2 PDF experiments are **not** published until explicitly reviewed and integrated, and no personal note data may be used in external probes.

This document records the initial active audit, not a claim that all stages above have already been completed.
