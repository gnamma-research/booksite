# Qawāʿid / Tamhīd — second-pass reproducible audit

**7 November 2026.** This record distinguishes confirmed file/source integrity from a still-unfinished scholarly critical edition.

## Corpus checked

- **61** bilingual ancestral matn units and **110** bilingual descendant commentary units: 40 introduction, 64 main, 6 conclusion.
- All section identifiers, authorial layers, original-matn links, 18 primary-source cards and 82 technical dictionary records are checked automatically.
- All 64 preserved main-commentary SHA-256 source fingerprints are rechecked against the retained Arabic transcriptions.
- Electronic source pages A 48–270, with the corresponding normalized Arabic-fragment overlap score for each relevant unit; discrepancies are review cues, not licence to emend Arabic silently.
- Five published PDF files are checked byte-for-byte against their manifest hashes and for the PDF signature.

## Limits and decisions

The six final commentary units (A 270–274) were compared separately against the publicly accessible A source pages [270](https://ablibrary.net/book_content/b/17638/466?lang=ar), [271](https://ablibrary.net/book_content/b/17638/467?lang=ar), [272](https://ablibrary.net/book_content/b/17638/468?lang=ar), [273](https://ablibrary.net/book_content/b/17638/469?lang=ar), and [274](https://ablibrary.net/book_content/b/17638/470?lang=ar). The A 271–274 passages are **not** in the existing retained A_MAIN_095_270 source snapshot, so a machine match there would be spurious. The SH-061 texts carefully distinguish medieval commentary from Āshtiyānī's much later Persian and Arabic marginalia/colophon.

The introduction's N source and the 61 ancestral lemmata are not proven manuscript-collated. The 61-unit text retains the expressly editorial opening choice; QT-059's reported lost ancestral material is **deferred and not reconstructed**. Differences in the published electronic text remain apparatus questions.

The recovered SH-028 quotation from *al-Ḥikma al-Rashīdiyya* now has exact start and end anchors, so the source card shows a **bounded quotation** rather than falsely displaying the whole surrounding discussion. It does not claim independent collation of the ancestor's different book.

A successful content-inventory and PDF-hash audit **does not verify all Arabic–English clauses for theological, philosophical, or linguistic accuracy**. Such certification must remain open to specialist review and checked independent textual witnesses. No claim of a manuscript-based stemma or real-device iOS Safari visual inspection is made.

## Machine output

[Per-unit audit, source fingerprint checks, anomalies and PDF hashes](../qa/second-pass-corpus-audit.json)

**Audit outcome:** PASS for machine-verifiable integrity; 0 nonblocking length/source-review flags.
