# Daruri original-heading hierarchy: implementation evidence

Prepared 20 October 2026 from the current local reader data in
`daruri/edition-r3-20261020.js`. This is an implementation note, not a new
collation or a claim that every printed rubric is authorial.

## Scope and source fields

Use `headingAr` as the presence test; use `headingVocalized` only for the optional
editorial vowel marks and `headingEn` for the existing English translation.
Do not substitute `title`, which is an editorial descriptive title.

The main text has 46 heading-bearing records: Part I 14, Part II 18, Part III 9,
Part IV 5. All 258 main-text sections have an editorial `title`. The later
`colophon` adds one record but must remain outside the authorial-text hierarchy.
The data has no existing parent/depth field. The parent mapping below is a
conservative navigation arrangement justified by explicit headings and textual
announcements. It does not reconstruct missing printed headings.

## Parent mapping

```js
const gnOriginalHeadingParent = {
  10: null,
  11: 10, 17: 10, 18: 17, 23: 17, 26: 17, 28: 17, 32: 17,
  36: 10, 54: 10, 55: 54, 56: 54, 57: 54, 60: 54,
  62: null,
  63: 62, 66: 62, 81: 66, 83: 66, 94: 66,
  95: 94, 96: 94, 97: 94, 98: 94,
  101: 66, 102: 66, 103: 66, 104: 66, 105: 66,
  115: 62, 130: 62, 141: 62,
  148: null,
  151: 148, 164: 148, 191: 148, 193: 148,
  197: 148, 210: 148, 227: 148, 228: 148,
  230: null,
  231: 230, 249: 230, 252: 249, 256: 230
};
```

Every key is an existing main-text section with a nonempty `headingAr`.
All child links point forward within their parent's part. The four roots are
the headings that explicitly name Parts I-IV. Section order must remain the
text's order; do not sort by translated heading or by modern subject.

## Evidence for the nesting

| Parent and children | Evidence in existing reader text |
| --- | --- |
| Part I, 10 -> 11, 17, 36, 54 | Section 10 states that this part has four divisions: definition, divisions, elements, and manifestation of a ruling. The children name the first, second, third and fourth sections. |
| 17 -> 18, 23, 26, 28, 32 | Section 17 announces the divisions and definitions of rulings and the questions attaching to them. Sections 18 and 23 carry generic `فصل`; 26, 28 and 32 are the second, third and fourth questions. Section 24 explicitly moves from definitions to the remaining general questions; those questions should therefore not be nested within the last generic chapter at 23. |
| 54 -> 55, 56, 57, 60 | Section 54 explicitly says that the fourth section consists of four chapters. These four headings are explicitly numbered first through fourth. |
| Part II, 62 -> 63, 66, 130, 141 | Section 62 names four sources. Their four corresponding headings are preserved. |
| 66 -> 81, 83, 94 | The Sunna source begins at 66. Section 80 announces the topics of acting on solitary reports, transmitter conditions, criticism/accreditation, and modes of transmission. Sections 81, 83 and 94 name the first three chapters. |
| 94 -> 95, 96, 97, 98 | Section 94 explicitly says that the criticism/accreditation chapter has four sections. Those sections are numbered first through fourth in their preserved headings. |
| Part III, 148 -> 151, 164, 191, 193, 197, 210, 227, 228 | These eight preserved headings are explicitly numbered 1-8 within Part III. Retain them as siblings and preserve their original wording. |
| Part IV, 230 -> 231, 249, 256 | Section 230 explicitly announces three chapters: independent inquiry, following authority, and weighing evidence. These three corresponding chapter headings are preserved. |

## Important boundary cases

**Abrogation, section 115:** Its parent is Part II (62), not the Sunna (66).
Section 114 explicitly concludes the second source and then says that both
first and second sources are subject to abrogation. This discussion therefore
stands alongside the source divisions, between the Sunna and consensus. A
nearest-previous-heading algorithm would misclassify it.

**Transmission levels, sections 101-105:** Section 100 introduces five levels
of transmission in prose but has no `headingAr`. The five named level headings
are kept under the Sunna source (66). They are not children of the fourth
criticism/accreditation subsection (98). Do not manufacture an original
"Fourth Chapter" or convert the editorial title of section 100 into a source
heading. If a grouping caption is useful, label it explicitly as editorial and
refer to the introduction in section 100.

**Generic chapter, section 252:** Keep it under the second Part IV chapter
(following authority, 249). Sections 252-254 continue the classification of
followers and jurists. Section 255 concludes this subject explicitly; section
256 then begins the third Part IV chapter. Treating 252 as a fourth major
chapter would contradict the three-chapter announcement at 230.

**Opening text, sections 1-9:** No distinct `headingAr` is stored. An access
link called "Opening text" can be provided, marked as a navigation label.
Do not create an original Arabic heading from the editorial `Introduction`.

**First question, section 25:** Its prose says "The first question", but it has
no separate stored heading. Do not manufacture a matching heading merely to
complete the numbering before the preserved second question at 26.

**Colophon:** Render separately as a later manuscript record. Its stored
caption is not proof of an authorial heading by Ibn Rushd.

## Terminology and validation limits

Prefer "Arabic edition headings" to an unqualified claim of manuscript or
authorial headings. The existing record establishes printed headings and
translations, not manuscript provenance. Keep editorial topic explanations
visibly secondary and identified as editorial. Generic headings such as
`فصل`, mixed numeral styles, and current English heading translations should
not be silently rewritten by a navigation fix.

Validate: 46 mapped main-text records; four roots; no cycles or missing parents;
all mapped records have Arabic headings; all source links still target their
original section IDs. Search results must retain ancestors for context and
must not promote matching descendants into invented top-level divisions.
