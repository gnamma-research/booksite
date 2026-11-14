# Qawtaw 8 — cumulative adjudication and publication checkpoint

**11 November 2026.** **Completed and publicly verified**: 14 residual Qawāʿid/Tamhīd textual questions have documented editorial outcomes, along with revised source-linked readings, five regenerated PDFs and a searchable user-facing apparatus.

## Publication record

- **Merged source:** [PR #299](https://github.com/gnamma-research/booksite/pull/299), commit `b0e2b962483fc597ddb399aa18962063b16a34e9`. The verified Qawtaw 8 release was rebuilt from the then-current `master` to avoid overwriting the intervening Qawtaw 7 release. The first conflicting duplicate PR #297 was explicitly closed without merge.
- **Source/build verification:** [GitHub Actions 42971550485](https://github.com/gnamma-research/booksite/actions/runs/42971550485) succeeded: all 171 bilingual units, 5,520 original Arabic punctuation-segment anchors, unchanged original A/N source strings and H2014 preferred Arabic strings, 14-case mobile Chromium apparatus filters, 110-unit commentary reader, and five PDF binaries with manifest hashes.
- **Actual live verification:** [GitHub Actions 42971936590](https://github.com/gnamma-research/booksite/actions/runs/42971936590) succeeded. On attempt 2, **15 out of 15 actual public assets** returned HTTP 200 and byte-for-byte SHA-256 matched the committed release: matn, commentary, clause-review and 14-case reader pages; scholarly Markdown/JSON; compiled corpus and clause ledger; standalone HTML; manifest; all five PDFs. This is a separate hosted-delivery check, not merely a successful build.

## Scholarly outcomes

| Category | Count | Meaning |
|---|---:|---|
| Working reading settled | **10** | A defensible philological/editorial construction is adopted for reading, with original witnesses and alternatives retained |
| Transmitted crux genuinely open | **3** | Original wording **not** decisively established: **SH-002**, **QT-061**, **SH-061-F** |
| Reported ancestral lacuna unrecovered | **1** | **QT-059**; no invented text and no conflation with the descendant’s SH-059 commentary |
| **Total formerly residual cases** | **14** | Each has a searchable record and a scholarly disposition |

**No new independent manuscript was collated.** H2014 is a modern published comparator containing a medieval text, not proof of an additional manuscript. Neither a working interpretation nor a stable printed variant should be mislabeled as a manuscript-certified archetype. The original A/N Arabic and H2014-derived reading layer are preserved separately.

### The three open original-wording problems

1. **SH-002:** Both A and H2014 transmit `القطع ببطلان مسألة التوحيد`, despite tension with its immediate dialectical context. English preserves “invalid [sic]”. An unwitnessed negation/positive substitution is not authorized.
2. **QT-061** and **SH-061-F:** Both transmit logically awkward `غير المتسقة المنتظمة` (with spelling and local surrounding variations). The English explains logic’s organizational function; no word is silently dropped or added in Arabic. These two entries may represent a shared textual difficulty.

### The unrecovered ancestral text

**QT-059** preserves a surviving argument about bodily preparation and the effusion of knowledge but suffers a reported substantial omission in the original author's wording. A separate independently edited original *Qawāʿid* by Majīd Hādīzādeh is **bibliographically confirmed** in *Nuṣūṣ wa-Rasāʾil min Turāth Iṣfahān al-ʿIlmī al-Khālid*, vol. IV, pp. 37–72 (see [al-Khizāna bibliography item 301](https://bibliography.mk.iq/files/0080f66f58b21603.pdf) and [Imam Husayn bibliographic entry 2327](https://m.imamhussain.org/lib/15)); **actual edited pages were not acquired or compared**. Obtain them or a photographed independent original witness before claiming to restore the lacuna. Do not reconstruct from SH-059.

## Authoritative user-facing deliverables

- [Matn and together reader](../)
- [Complete commentary](../commentary.html)
- [Decision page — fourteen cases](../textual-decisions.html)
- [Full Markdown apparatus](QAWTAW8_FINAL_FOURTEEN_ADJUDICATIONS.md)
- [Structured decisions](../qa/qawtaw8-final14-dispositions.json)
- [Bilingual reading](../pdf/qawaid-bilingual-reading.pdf)
- [English reading](../pdf/qawaid-english-reading.pdf)
- [Arabic reading](../pdf/qawaid-arabic-reading.pdf)
- [Bilingual study](../pdf/qawaid-bilingual-study.pdf)
- [Bilingual reference](../pdf/qawaid-bilingual-reference.pdf)

The PDF builder uses the *separate preferred reading* `readingArabic` for commentary wherever it exists, rather than always falling back to the uncorrected A electronic Arabic. Source uncertainty remains visible in apparatus and detailed editions; the narrative reader has no intrusive status preface.

## Continuation boundary

**The 57-case print review, 14-case editorial adjudication, complete electronic-text comparative pass, output rebuild and public publication are finished.** What remains is **manuscript-level textual establishment**, specifically the three shared/transmitted cruxes and QT-059’s lost wording. These cannot honestly be labeled settled with the accessible witnesses. Next review should begin with an actual independent source, not reopen the completed electronic comparison or infer lost words from philosophical plausibility.