# Tahdhīb Stage123 — eleven unresolved source SHA256 divergences: forensic recheck

**13 November 2026 · Digital-census comparison, not manuscript collation.** The entire original source archive contains 274 Qum-page HTML snapshots. The existing Stage122 recovery matched **all 1,090 source note boundaries and Arabic word counts**, but only **1,079** digital note SHA256 values. The eleven remaining unit differences below are not evidence of an ancient textual variant.

| Note | Qum printed page(s) | Type |
|---|---|---|
| HWN-008 | 128–129 | Across two pages |
| HWN-037 | 139 | Within one page |
| HWN-084 | 149 | Within one page |
| HWN-126 | 160 | Within one page |
| HWN-INTRO-018 | 168–169 | Across two pages |
| HWN-DALALA-069 | 206–207 | Across two pages |
| HWN-MAFAHIM-042 | 226 | Within one page |
| HWN-PROPOSITIONS-013 | 266–267 | Across two pages |
| HWN-SYLLOGISM-043 | 352 | Within one page |
| HWN-SYLLOGISM-056 | 354–355 | Across two pages |
| HWN-SYLLOGISM-150 | 369 | Within one page |

The existing source-gap register retains the **expected and recovered SHA256** and exact source URLs for every unit, and should be treated as the primary machine-readable record.

## What this investigation did and did not establish

We tested the actual recovered eleven Arabic strings against the old SHA256 under several standard transformations: ordinary newline-to-space conversion, newline removal, whitespace collapsing, NFC Unicode normalisation, trimming, extra trailing newline/space, simple punctuation-space standardisation and removal of selected speaker parentheticals. **None of those tests reproduces the archived expected SHA** for any of the eleven. This rules out only these simple proposed normalisations; a hash cannot disclose the missing original bytes.

Only **one** of the eleven, HWN-037, retains a separate older *embedded Arabic text* in the Stage114 publication corpus. The embedded text is **146 Arabic whitespace-separated words**; the digitally recovered source is **155** and contains separately signed attribution markers **(شيخ عبد الرحيم)** and **(ميرزا محمد على)** that the old embedded text omits. Neither the old embedded Arabic nor the recovered Arabic yields the expected census SHA256. This supports the existence of an earlier **attribution omission** in the embedded passage, not a proven difference between medieval manuscripts; it does not establish the cause of the census-hash mismatch.

The other ten cannot be repaired with a cryptographic hash alone because the exact original Stage114 extraction strings are not preserved in the surviving census; the 274 source snapshots and historical word counts survive.

## Required next source proof

Preserve all three distinct things: (1) the expected Stage114 digital SHA, (2) the Stage122 recovered digital Arabic, and (3) any independently photographed printed reading. For each unit, compare the 274 source-page HTML segments and independently inspect the printed relevant page(s), recording both exact excerpts, speakers and punctuation/normalisation. Do not declare a manuscript variant or certify a whole Arabic–English page merely from the presence of a source mismatch.

The historic 1,090-note H English remains unchanged; correcting speaker boundaries must never merge modern editorial paragraphs into older glossator speech.
