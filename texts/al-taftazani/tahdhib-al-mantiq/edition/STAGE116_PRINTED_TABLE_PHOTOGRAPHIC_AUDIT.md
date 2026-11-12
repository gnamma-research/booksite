# Tahdhīb Stage 116 — photographed-source table audit and precise verification limits

**12 November 2026 · Research edition, source-photographic witness recovery.** This **supersedes the missing-table access status in Stage115**, without overwriting the 1,090 original Stage114 translation records. It is a source edition *audit*, not a new authorial translation or independently manuscript-certified critical text.

## Original print copies and reproducible source location

Two publicly accessible Ḥāshiya print scans, cited as separate **printed editions/impressions** (not independent medieval manuscripts):

| Siglum | Source original | SHA256 of downloaded PDF | Zero-based PDF image index | Inspected printed pages |
|---|---|---|---|---|
| H-1405 | [Internet Archive lis_fa1208.pdf](https://archive.org/download/lis_fa12/lis_fa1208.pdf) | `696c7b2e2884414f34d90203326f7b07f72e207849080e5069aadd0f12bb5759` | printed page + 1 | 258, 294, 300, 309, 387 |
| H-1433 | [Internet Archive lis_fa1209.pdf](https://archive.org/download/lis_fa12/lis_fa1209.pdf) | `c119de2073dee4610e99a35cd01bd075841cc0e4dfaef7a9473b950dd250c70d` | printed page | 258, 294, 300, 309, 387 |

The scan offsets were checked against visible printed folio numerals, not guessed from URL numbers. Each scanned excerpt is SHA256 registered in [the photographic manifest](source-table-excerpts/PRINT_IMAGE_MANIFEST_STAGE116.json). The original PDFs total approximately 13.9MB and 15.0MB; only four **small bounded page excerpts** from H-1405 are hosted here, rather than either complete edition. The [Stage116 source recovery program](../../../../tools/tahdhib/stage116_recover_print_scans.py) and a documented GitHub Actions run created and hashed them. The second H-1433 printed witness was visually inspected independently for the same target locations.

## Q258 — the 49-case definitional-element matrix

**Source:** [Q258 digital prose](https://ablibrary.net/book_content/b/12170/258?lang=ar) · [original printed table excerpt](source-table-excerpts/print1405_Q258_table_excerpt.png).

The full **7×7** table is visibly present in both photographed printings, contrary to its absence from the digital site's text extraction. The original ordered headers/row classes include **النوع، الجنس القريب، الجنس البعيد، الفصل القريب، الفصل البعيد، العرض العام، الخاصة** (species; proximate and remote genus; proximate and remote differentia; common accident; proprium). The table contains **49 individual written verdicts/explanations**, not merely a 49-cell empty template, and several entries are substantial, not reducible without loss to a binary yes/no flag.

**Verification grade:** the diagram, all seven headings and structural 49 positions are source-photographically located; **full 49-cell diplomatic Arabic transcription and English rendering are pending**. In particular we do not substitute the combinatorial prose Q259 for the table's internal judgements.

The *original* Q259 arithmetical problems remain recorded without source emendation, especially the printed `450 × 120 = 5,400` vs the true product `54,000`. Earlier source-derived "56" triples and "140" quadruples should not be passed off as conventional subset counts `C(7,3)` or `C(7,4)`.

## Q294 — the triangular modal-proposition comparison

**Source:** [Q293 explanatory text](https://ablibrary.net/book_content/b/12170/293?lang=ar) · [original Q294 triangular table](source-table-excerpts/print1405_Q294_table_excerpt.png).

Both printings contain the **15-form triangular table**: every distinct pair of the fifteen kinds is compared once, hence `C(15,2)=105` filled comparison cells, **not 225 separate ordered pairs**. The fifteen headings (source order) are: الضرورية المطلقة؛ المشروطة العامة؛ الوقتية المطلقة؛ المنتشرة المطلقة؛ الدائمة المطلقة؛ العرفية العامة؛ المطلقة العامة؛ الممكنة العامة؛ المشروطة الخاصة؛ الوقتية؛ المنتشرة؛ العرفية الخاصة؛ الوجودية اللاضرورية؛ الوجودية اللادائمة؛ الممكنة الخاصة.

The digital prose specifies these *historical* symbols: `مط` for unrestricted inclusion (العموم والخصوص مطلقاً), `من` for intersecting overlap (العموم والخصوص من وجه), `ين` for disjointness (التباين الكلي); `ط` for description-conditioned qualified forms and `ف` for during the description's time. `فم` denotes the **upper** proposition is more general than the lower, `حم` the reverse. This lexical register is source-grounded in Q293 and prevents anachronistic substitution of modern Boolean labels.

**Verification grade:** all 105 *physical* entries located and both printings visibly agree on broad structure; complete individually checked transcription of their shorthand and direction has **not** been performed. No claim of 105 proved modal entailments.

## Q300 — all 32 compound-modal classifications verified photographically

**Source:** [Q300 numbered gloss](https://ablibrary.net/book_content/b/12170/300?lang=ar) · [original printed matrix](source-table-excerpts/print1405_Q300_table_excerpt.png).

All **32** printed intersections were compared to the Stage115 prose-derived result, across the photographed scans. For columns in the print's right-to-left order **اللاضرورة الذاتية / اللاضرورة الوصفية / اللادوام الذاتي / اللادوام الوصفي** the eight rows yield:

| Original simple proposition | Four statuses, in the column order above |
|---|---|
| الضرورية المطلقة | XXXX |
| المشروطة العامة | UXRX |
| الوقتية المطلقة | UURU |
| المنتشرة المطلقة | UURU |
| الدائمة المطلقة | UUXX |
| العرفية العامة | UURX |
| المطلقة العامة | RURU |
| الممكنة العامة | RUUU |

`R` = صحيح معتبر (valid recognised); `U` = صحيح غير معتبر (valid unrecognised); `X` = غير صحيح (invalid). **7 R, 16 U, 9 X.** The printed graphic also contains row/column headings, yielding the source's **45 drawn cells** overall. This is a confirmed **printed table transcription of the classification symbols**, *not* a formal proof of their semantic validity in all models. Interpretive Q298–299 modern *al-Taqrīb* material remains a different voice from historical H121.

## Q309 — all fifteen printed conditional types located; three deliberately omitted example cells

**Source:** [Q308–310 prose](https://ablibrary.net/book_content/b/12170/308?lang=ar) · [photographed example table](source-table-excerpts/print1405_Q309_table_excerpt.png).

The source *order* of the nine connected types is:
`C/C, C/D, C/K, K/C, D/C, K/K, K/D, D/K, D/D`;
the six disjunctive types are:
`C/C, C/K, C/D, K/K, D/K, D/D`.
Here `C` = حملية, `K` = متصلة, `D` = منفصلة; connected slash notation is ordered **antecedent/consequent**, disjunctive slash notation is an **unordered pairing**. Note the source's connected list puts `D/C` before `K/K`, unlike the abstract algorithmic ordering in the Stage115 JSON; both have the same nine members.

**Important correction:** the cells for the connected `C/C`, `K/K`, and `D/D` are not lost: they themselves read **ذكر ما لا يخفى** (“to supply what is obvious”) rather than giving a long example. Two of the twelve printed Arabic examples now have source-read Arabic–English renderings in [the Q309 micro-edition](STAGE116_Q309_TWO_EXAMPLES_PHOTO_TRANSLATED.md). The remaining ten still require diplomatic transcription and line-by-line English translation.

## Q387 — no diagram on either inspected page

The digital source's `هكذا` at H-SCIENCES-029/Q387 led Stage114/115 to suspect a missing graphic. Both photographed printed Q387 pages contain the prose account of two right angles but **no accompanying drawn diagram on that page**. The supposed digital **figure gap** is therefore **closed as a false-positive**; no diagram is invented and no other page is excluded from investigation.

## Source-to-English alignment, independent of photo-table recovery

Five spot-checked historical note loci now have a [narrow clause audit](STAGE116_CLAUSE_ALIGNMENT.md) with verbatim digital Arabic, the inherited English counterpart and narrowly bounded judgements. **Not** a whole-page or whole-note certification. The other 1,085 positions remain at their inherited grade.

## The 46 historical fourth-figure modal cases: a separate obligation

The photographed Q300 grid classifies *32 compound modal proposition types*, **not** the *46 exceptional syllogistic mixtures* in [Stage97](STAGE97_46_MODAL_MIXES_CRITICAL_DOSSIER.md). Stage97 already enumerates 12+22+12 source-typed mood mixes. [Stage101](STAGE101_DOMAIN_INDEPENDENT_PROOF_BOUNDARIES.md) proves conditional temporal shadows across **arbitrary** domains but expressly does **not** establish their medieval necessity-strength types. [Stage100](STAGE100_MODAL_NONVACUITY_AND_INDEPENDENT_WITNESS_STATUS.md) identifies four mood-VIII antecedent combinations unsatisfiable in one interpretive model. Stage116 adds **no certified all-world modal proof and no independent manuscript readings**. Source-and-proof gates remain precisely registered in [Stage116 modal dossier](STAGE116_MODAL_PROOF_OBLIGATIONS.md).

## Preservation, next step, and reader placement

The source-photographed table excerpts and interpretive commentary belong in a **separate selectable scholarly apparatus**, not inside the continuous Arabic–English reading text. [View the Stage116 photographic reader](STAGE116_PHOTOGRAPHIC_TABLE_READER.html); [full cumulative handoff](HANDOFF_LATEST.md); [unchanged 1,090-note H reader](hawashi-numbered-notes.html); [historical Stage115 handoff](HANDOFF_STAGE115.md).

**Next exact tasks:** manually transcribe and collate Q258’s 49 substantive judgments, Q294’s 105 historical relation codes with directional qualifiers, Q309’s 12 explicit examples; verify those clauses against an independent source; conduct whole-unit Arabic–English literal collation across 1,090 notes; resolve original modal semantics by proof or countermodel; obtain independent *authorial* manuscripts for actual textual variants. No new H whole page or Y manuscript position is certified.
