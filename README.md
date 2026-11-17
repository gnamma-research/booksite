# Mahāʾimī / Qūnawī — confirmed Git recovery package (17 Nov 2026)

**THIS IS A NEW RECOVERY PACKAGE, NOT `MAHAIMI_STAGE13_FULL_CUMULATIVE.zip`, NOT A RECONSTRUCTION OF ITS 164 MEMBERS, AND NOT PROOF OF FULL HANDOFF RECEIPT.**

The files under `confirmed/` refer directly to original Git blobs in `gnamma-research/booksite`, source branch `recovery/mahaimi-stage13-20261111` at audited head `24e89e2b6f4ff7d9b73e24bad0cf556e6efa68f7`. Git blob hashes are listed in `CONFIRMED_BLOBS.json`. The Git tree keeps actual referenced file bytes recoverable by cloning/downloading this package branch; it is not merely an inventory of paths. Only file identities and digests actually established are claimed.

**Verified SHA-256 against `downloads/pdf-build-manifest.json`:**
- `confirmed/downloads/mahaimi-english.pdf`: 1,027,870 bytes, SHA-256 `625663059ad5eb15c62496103b5e9ce3bf2db26ee13672f866dc5424a9dbdebb` (match).
- `confirmed/downloads/mahaimi-arabic.pdf`: 821,735 bytes, SHA-256 `b4c433aa65701525236268932f3692eae3a712bdcb48b8734115a99c2cb7fde3` (match).
- These bytes were fetched encoded from GitHub, decoded and hashed. The bilingual PDF (manifest: 1,887,477 bytes; expected SHA-256 `8f72cbfa40b88386fb6bb8cb9e73e79405df1aab1c47ce9cd7800fdcfe82c221`) was located as Git blob `e6c78f82adc10cda1d53f2b604166c894e9ee62f` but the connector returned empty encoded payload. It is NOT included in the validated-binary subset and must not be called independently checked.

**Corpus/review:** Direct blob recovery of `parallel.json` succeeded; 254 unique units, 444 nonempty bilingual pairs, 222 commentary + 33 appendix pages. Full Stage13 review index parsed: 222 reviewed pages, 98 documented scan comparisons; full Stage12 index: 165 reviewed, 91 scan comparisons. Stage13 detailed reports: 85 English pair changes, 30 notes, 3 headings; not equivalent to the separately reported 157 total corrections (102 English, 14 Arabic, 41 notes), which has not been reconciled.

**Discrepancies to retain:** documented Git ledger **98/222** vs later unlocated ZIP report **148/222** (difference 50). Remaining respectively 124 or 72. Never assume the additional 50 pages have been checked; never redo them until later evidence is checked.

**Source assets:** `machra3-khosous.pdf` original print scan is reported by `SOURCES_STAGE12.md` at 9,738,668 bytes, SHA-256 `2e4b896446d82bbd877a8c0657e69976a25c366a2d97559194b7ed96c1749b0e`; electronic source text export is reported at 845,676 bytes SHA-256 `46b71616f72173d524163f2efcccb1e0f3fce97baf505b4087a3b3663be85e70`. Neither source binary was recovered and freshly hashed in this audit. The documented digests are *historical claims*, not new validation.

**Do not publish, overwrite, archive old chat, or restart translation.** Read `MISSING_MATERIALS.md` first and check newer archive evidence before starting scan comparison.
