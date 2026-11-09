/* Canonical, source-graded cumulative Tahdhīb progress. Never count excerpts as whole pages. */
window.GNAMMA_TAHDHIB_PROGRESS={
  "schema": "gnamma-tahdhib-cumulative-progress-v1",
  "updated": "2026-11-09",
  "stage": "106",
  "baseline": {
    "logicMatnDivisions": 19,
    "kalamClauses": 1044,
    "yazdiPrincipalPrintedPositions": 110,
    "yazdiBilingualBlocks": 113,
    "laterGlossPages": 274,
    "laterGlossPrintedStart": 127,
    "laterGlossPrintedEnd": 400,
    "laterSampledPages": 52,
    "historicalFourthFigureCases": 46
  },
  "metrics": [
    {
      "id": "logic-matn",
      "label": "Taftāzānī logic matn · working translation",
      "current": 19,
      "total": 19,
      "unit": "editorial divisions",
      "note": "The 19 logic divisions have a working bilingual text; this bar does not mean manuscript certification."
    },
    {
      "id": "yazdi-first-pass",
      "label": "Al-Yazdī principal commentary · working English",
      "current": 110,
      "total": 110,
      "unit": "substantive Qum positions",
      "note": "Qum Q7–123, excluding 7 structural/marginal-only positions. 113 bilingual blocks. Searchable print; not photographically certified."
    },
    {
      "id": "yazdi-photo",
      "label": "Al-Yazdī principal commentary · photo/manuscript certification",
      "current": 0,
      "total": 110,
      "unit": "Qum source positions",
      "note": "Catalogued witness leads do NOT count as photographed collation."
    },
    {
      "id": "later-sampled",
      "label": "Later glosses · source-page excerpt coverage",
      "current": 52,
      "total": 274,
      "unit": "gloss pages",
      "note": "Q127–178 contain short selections only. 222 further positions (Q179–400) not yet indexed at this level."
    },
    {
      "id": "later-full",
      "label": "Later glosses · complete printed-page translation",
      "current": 0,
      "total": 274,
      "unit": "gloss pages",
      "note": "Numbered-note translation does NOT automatically complete any printed page; modern editorial quotations and page seams remain."
    },
    {
      "id": "opening-notes",
      "label": "Later-gloss numbered notes · working English (Q127–144)",
      "current": 53,
      "total": 55,
      "unit": "numbered notes",
      "note": "Local cohort only: notes 1–55, 53 first-pass complete, note1 and note25 partial. This is NOT the entire 274-page H corpus."
    },
    {
      "id": "numbered-arabic",
      "label": "Later-gloss numbered notes · searchable Arabic transcription",
      "current": 32,
      "total": 55,
      "unit": "notes",
      "note": "Notes 24–55 include full digitally searchable Arabic as currently available (one corrupted abbreviation remains). Notes 1–23 contain locator snippets only; no photograph or independent witness certified."
    },
    {
      "id": "historical-classes",
      "label": "Exceptional fourth-figure combinations · classified",
      "current": 46,
      "total": 46,
      "unit": "historical cases",
      "note": "Historical source-based classification. NOT independent proof of their full modal conclusion types."
    },
    {
      "id": "historical-proofs",
      "label": "Historical modal combinations · independently certified",
      "current": 0,
      "total": 46,
      "unit": "cases",
      "note": "Stage101 established temporal consequences under explicit weaker assumptions, not complete Avicennan modality/semantics."
    }
  ],
  "noteLedger": {
    "range": "HWN-001–HWN-055",
    "fullyTranslatedFirstPass": [
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55
    ],
    "partiallyTranslated": [
      1,
      25
    ],
    "currentChapter": "Later glosses: guidance, kināya, prologue and prophethood (Qum pp.127–144)",
    "sourcePhotographed": false,
    "sourceArabicTranscribedCompletely": false,
    "arabicFullSearchableNotes": [
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55
    ],
    "unnumberedFollowingRendered": [
      47,
      48
    ]
  },
  "currentRelease": {
    "mainReader": "index.html",
    "notesReader": "hawashi-numbered-notes.html",
    "sampleReader": "hawashi-q125-178.html",
    "criticalDashboard": "critical-status.html",
    "latestHandoff": "HANDOFF_LATEST.md",
    "cumulativeMarkdown": "batches/hawashi-numbered-cumulative-hwn001-055.md"
  },
  "stages": [
    {
      "id": "102",
      "date": "2026-11-09",
      "title": "Recovered 24 older partial gloss selections Q155–178",
      "sourcePages": "155–178",
      "fullNoteCount": 0,
      "partialNoteCount": 24,
      "certifiedPages": 0,
      "report": "STAGE102_HAWASHI_RECOVERY_AND_INSTRUMENTALITY.md",
      "files": [
        "hawashi-q155-178-data.js",
        "hawashi-q125-178.html"
      ]
    },
    {
      "id": "103",
      "date": "2026-11-09",
      "title": "Independent Y manuscript candidate census, no collation",
      "sourcePages": "not applicable",
      "fullNoteCount": 0,
      "partialNoteCount": 0,
      "certifiedPages": 0,
      "report": "STAGE103_WITNESS_CANDIDATES_AND_LAYER_IDENTITIES.md",
      "files": [
        "STAGE103_WITNESS_CANDIDATES_AND_LAYER_IDENTITIES.md"
      ]
    },
    {
      "id": "104",
      "date": "2026-11-09",
      "title": "Source-checked opening notes, cumulative progress architecture",
      "noteRange": "1–18",
      "fullNoteCount": 12,
      "partialNoteCount": 6,
      "sourcePages": "127–134",
      "certifiedPages": 0,
      "files": [
        "hawashi-numbered-notes-stage104.js",
        "hawashi-numbered-notes.html",
        "progress.html",
        "progress-data.js",
        "HANDOFF_LATEST.md",
        "stages/STAGE104_TRANSLATION_AND_PROGRESS.md"
      ]
    },
    {
      "id": "105",
      "date": "2026-11-09",
      "title": "Complete five long opening gloss notes and add notes 19–23",
      "sourcePages": "127–135",
      "fullNoteCount": 22,
      "partialNoteCount": 1,
      "certifiedPages": 0,
      "report": "stages/STAGE105_COMPLETION_AND_GUIDANCE.md",
      "files": [
        "hawashi-numbered-notes-stage105.js",
        "hawashi-numbered-notes.html",
        "progress.html",
        "progress-data.js",
        "HANDOFF_LATEST.md",
        "stages/STAGE105_COMPLETION_AND_GUIDANCE.md"
      ]
    },
    {
      "id": "106",
      "date": "2026-11-09",
      "title": "32 source-aligned numbered glosses 24–55; cumulative bilingual corpus and 9 progress bars",
      "sourcePages": "127–144",
      "noteRange": "1–55",
      "fullNoteCount": 53,
      "partialNoteCount": 2,
      "arabicNoteCount": 32,
      "certifiedPages": 0,
      "report": "stages/STAGE106_NUMBERED_TRANSLATION.md",
      "files": [
        "hawashi-numbered-notes-stage106a.js",
        "hawashi-numbered-notes-stage106b.js",
        "hawashi-numbered-notes-stage106c.js",
        "hawashi-numbered-notes-stage106d.js",
        "batches/hawashi-numbered-cumulative-hwn001-055.md",
        "hawashi-numbered-notes.html",
        "progress-data.js",
        "HANDOFF_LATEST.md",
        "stages/STAGE106_NUMBERED_TRANSLATION.md"
      ]
    }
  ]
};
