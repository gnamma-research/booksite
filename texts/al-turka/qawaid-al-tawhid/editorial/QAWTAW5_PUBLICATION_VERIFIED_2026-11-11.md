# Qawtaw 5 — release and public deployment verified

**11 November 2026, 01:54:23 UTC / 04:54:23 Arabia Standard Time.**

The completed working-text comparison and corrected reading editions were merged in [PR 293](https://github.com/gnamma-research/booksite/pull/293), commit `930096c779d1efdf741cb5e933ab94151b04b562`.

## Completed and checked

- **171/171 extant bilingual units**: 61 ancestral matn units and 110 commentary units.
- **5,520/5,520 recorded Arabic punctuation-derived segments** have model-assisted comparative decisions. This release adds the previously pending 85 commentary units / 3,759 segments.
- **36 English wording replacements**, documented in the [before/after correction log](QAWTAW5_CORRECTIONS_2026-11-11.md).
- **All Arabic source strings, the ancestral matn, retained raw source transcriptions and four ancestral bridge quotations are unchanged.**
- The compiled corpus, bilingual and English Markdown, self-contained reader and five PDF editions were regenerated and checked for corrected wording and source parity.
- Real headless Chromium tests passed for language visibility, navigation, full-text search, bookmarks, continuous reading, export, standalone HTML, mobile widths and the canonical comparison page. This does not constitute physical iOS Safari testing.
- The comparison page now reads the complete canonical ledger and exposes an unresolved-reading filter instead of the obsolete machine-alignment index.

[Successful build and browser/PDF checks](https://github.com/gnamma-research/booksite/actions/runs/42941606054).

## Actual public deployment

[The public verification run](https://github.com/gnamma-research/booksite/actions/runs/42942134015) fetched the actual GitHub Pages URLs and matched **12 public assets byte-for-byte** against the merged release: the main reader, commentary reader, comparison reader, compiled commentary JSON, complete clause ledger, PDF manifest, standalone HTML, and all five PDFs. All 12 returned HTTP 200 and the expected SHA-256 hashes. This verifies actual delivery, not merely a successful source commit or build.

[Matn and together reader](../) · [Complete commentary](../commentary.html) · [Comparison ledger](../clause-review.html) · [Self-contained commentary HTML](../downloads/Tamhid_Complete_Commentary_Reading_Edition.html).

| PDF | Pages | SHA-256 |
|---|---:|---|
| [Bilingual Reading](../pdf/qawaid-bilingual-reading.pdf) | 298 | `52cf5efeab8b1198aa6a09314cc889016bc8c4dabd06ae3492bb4d905bd0ab79` |
| [English Reading](../pdf/qawaid-english-reading.pdf) | 138 | `aa4a70d424551378ebb2afacf6aea063de637887d9466d542111c1b8d9290350` |
| [Arabic Reading](../pdf/qawaid-arabic-reading.pdf) | 173 | `3d3e00f4cd0774aae5a4de6e87165e6577fc07b6060369a8288b53b5b92d85c8` |
| [Bilingual Study](../pdf/qawaid-bilingual-study.pdf) | 322 | `064daa46ca63d714fe8008cad19ea5149654f871ae46b793744f33817abd379f` |
| [Bilingual Reference](../pdf/qawaid-bilingual-reference.pdf) | 362 | `ba30569676d3270951bf285651e21545e0b49ee46960e143688b44b17a0e49c6` |

Selected rendered Arabic–English reading, study and reference pages were visually inspected for text shaping, layout and clipping. The new edition-status notice appears on the contents page. Corrected passages were also located in extracted PDF text.

## Precise limits

A complete **comparison pass** is not a declaration that every transmitted reading is certain. **57 unresolved/source-crux groups, covering 218 punctuation segments**, remain explicitly registered. These figures are not an accuracy percentage. The [uncertainty register](../qa/qawtaw5-unresolved-register.json) contains source wording, English correspondence and reasons.

**No independent manuscript collation or human specialist certification is claimed.** The reported missing ancestral text at QT-059 remains deferred and unreconstructed. SH-059 cannot supply that missing ancestral wording by substitution. The completed release is a thoroughly compared source-based working translation, not a definitive stemmatic critical edition.

The branch-build evidence in `qa/qawtaw5-publication-evidence.json` correctly records that live delivery had not yet been checked at build time. This later checkpoint and successful public-verification run supply that separate confirmation.

[Full cumulative scholarly handoff](QAWTAW5_CUMULATIVE_HANDOFF_2026-11-11.md) · [Complete comparison report](CLAUSE_REVIEW_COMPLETE_2026-11-11.md).
