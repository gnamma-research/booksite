/* Canonical, append-only-derived progress data. Do not count excerpts as full pages. */
window.GNAMMA_TAHDHIB_PROGRESS={
  "schema": "gnamma-tahdhib-cumulative-progress-v1",
  "updated": "2026-11-09",
  "stage": "104",
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
      "label": "Opening glosses · numbered-note first pass (Q127–134)",
      "current": 12,
      "total": 18,
      "unit": "numbered notes",
      "note": "Only notes 1–18, Q127–134. This local denominator must not be applied to all later ḥawāshī; 6 notes are partial."
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
    "range": "HWN-001–HWN-018",
    "fullyTranslatedFirstPass": [
      3,
      4,
      5,
      6,
      7,
      10,
      11,
      13,
      14,
      16,
      17,
      18
    ],
    "partiallyTranslated": [
      1,
      2,
      8,
      9,
      12,
      15
    ],
    "currentChapter": "Later glosses: prologue (Qum pp.127–134)",
    "sourcePhotographed": false,
    "sourceArabicTranscribedCompletely": false
  },
  "currentRelease": {
    "mainReader": "index.html",
    "notesReader": "hawashi-numbered-notes.html",
    "sampleReader": "hawashi-q125-178.html",
    "criticalDashboard": "critical-status.html",
    "latestHandoff": "HANDOFF_LATEST.md"
  },
  "stages": [
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
    }
  ]
};
