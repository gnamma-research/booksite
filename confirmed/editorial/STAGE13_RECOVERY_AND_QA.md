# Stage 13 recovery, review and release audit

**Date:** 11 November 2026. **Recovery branch:** recovery/mahaimi-stage13-20261111.

## Recovered baseline

The latest substantive source was mahaimi-complete-edition at bc97d46b4052855884fe48c95780cfb2d80ed46b. The new branch began from master at 05f28ed5bb62071d3c072683216dabee6e2ee99f and copied the Mahāʾimī subtree and its build tools while preserving other projects. Initial recovery commit: 2f9885f54083657465b7e0ac1c77a4eef191e784.

At recovery the public reader was Stage11, while the saved Stage12 source already contained all 255 source pages. Earlier Stage09 download packages therefore understated current completion. The fresh continuation reads small status files before processing bounded excerpts of the canonical corpus. The cause of the ChatGPT conversation crashes has not been established; no platform fix is claimed.

## Substantive continuation

All 57 outstanding commentary pages were reviewed against their supplied Arabic: 41–60, 94–105 and 125–149. Exact-old-text guards were verified before applying 85 English passage corrections. Thirty editorial notes and three heading corrections accompany them. There are still 254 units and 444 nonempty bilingual pairs. Every Arabic passage remains identical to the recovered canonical Arabic; no conjectural Arabic restoration was introduced.

The review repaired reversed implications and negations, omitted reasoning, paragraph alignment on pp.132–133, the distinction between the four kinds of praise and subdivisions of divine self-praise, the causal priority of attributes relative to acts, and consequential identity-language on pp.143 and149. The teacher attribution was reconciled with al-Mahāʾimī’s explicit naming of Ibn ʿArabī on p.139. The exact changes and reasons are in the three review reports and the cumulative review index.

A checked page is not necessarily a resolved textual problem. P.43 passage1 retains a marked synopsis of an unstable argument; other uncertain clauses are explicitly identified. They still require source comparison before a fully literal or critically established translation can be claimed.

## Reconciled progress

| Measure | Before | Stage13 |
|---|---:|---:|
| Commentary Arabic working coverage | 222/222 | 222/222 |
| Commentary English working coverage | 222/222 | 222/222 |
| Appendix Arabic and English working coverage | 33/33 | 33/33 |
| Commentary pages reviewed against Arabic | 165/222 | 222/222 |
| Documented commentary scan comparison | 91/222 in aggregate | 98/222 after recovering prior records |
| Appendix image inspection | 33/33 recorded | unchanged |
| Independent manuscripts collated | 0 | 0 |

The additional seven historical image checks are pp.21,23,26,27,33,35,40. The original Stage12 pp21-60_patch.json explicitly records positive image-inspection flags and PDF indices. Its immutable blob is 67962ec4e23804226160aff0576cfd803fcd00c8. This is an accounting correction, not new image examination during Stage13.

## Reader and release repairs

- The published text can now be generated directly from the latest corpus and ledger.
- Six reader progress cards distinguish text availability, translation review and print comparison.
- Fragment decoding tolerates malformed copied URLs.
- History state preserves work selection on Back, including return to a URL without a fragment; resetting settings reconciles the active passage.
- Search previews use normalized-to-original character offsets so Arabic diacritics and transliteration variants do not produce unrelated previews.
- The Qūnawī cross-reader test accepts the actual top-level corpus array and continues checking every target ID and printed page.
- All three previously missing PDF downloads are supplied, together with regenerated Markdown and JSON.
- The site catalogue and the single Mahāʾimī manifest entry reflect the current coverage.

## Recorded local verification

The cumulative integrity test passes: 254 unique units, 222 commentary pages, 33 appendix pages, 158 shared-wording links, no missing Arabic/English pair, preserved source limitations and unchanged ending. Embedded reader data equals the canonical corpus. JavaScript syntax passes. The separate Qūnawī corpus has 64 links into Mahāʾimī; all target IDs and printed-page locators remain valid.

All 254 unit IDs occur in every PDF. PDF text extraction found no replacement characters. The files are tied to the canonical corpus SHA-256 in downloads/pdf-build-manifest.json and checked by the repository integrity test.

| Download | PDF pages |
|---|---:|
| English | 312 |
| Arabic and English | 564 |
| Arabic | 294 |

Rendered cover and body samples were inspected for Arabic shaping, legibility, paragraph flow and clipping. A suspected overflow on Arabic PDF p.137 was checked geometrically: its final glyph box stays inside the body area with32pt clearance before the footer, and the sentence continues intact on the following page. No clipping or footer overlap was found.

The source corpus SHA-256 is b6767ba2831ba88946385da3f7119af9f8294a82751bb306271893f7f0e5861f. The final production commit and GitHub Pages workflow must be checked independently; branch persistence, local integrity and deployment are separate assertions.

## Remaining work

Complete image comparison for the remaining124 commentary pages; obtain replacements for the scan’s missing pp.113–114; investigate flagged defective readings and the p.43 synopsis; acquire and collate independent witnesses, including the Āshtiyānī edition and Leiden Or.5675; establish an apparatus with verified witness relationships. The incomplete p.232 commentary ending remains unreconstructed.
