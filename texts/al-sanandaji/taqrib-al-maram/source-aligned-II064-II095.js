/* Stage12 source-aligned selection: explicit quoted matn vs Sanandaji commentary or heading. */
(()=>{'use strict';const b=window.GNAMMA_BOOK;if(!b||b.id!=='taqrib')return;const seen=new Set(b.units.map(u=>u.id));for(const u of [
  {
    "id": "A.II.064.01",
    "volume": "II",
    "page": 64,
    "pdf": 359,
    "category": "selection",
    "quality": "source-aligned-upper-selection",
    "title": "Animal cognitive and motive powers, with the explanatory distinction",
    "arabic": "قسمه إلى النفس الحيوانية والناطقة لتكون تلك القوى في الإنسان أكمل منها في سائر الحيوان",
    "english": "He divided this into the animal and rational soul, so that these faculties in the human being would be more complete than in the other animals.",
    "citation": "Taqrīb al-Marām II:64 / source PDF 359, running commentary above first dividing rule; first-pass selected clause",
    "layers": {
      "matn": {
        "arabic": "ويختص الحيوان بقوى نفسانية ... مدركة ومحركة",
        "english": "The animal is distinguished by psychic powers … powers of apprehension and motion.",
        "citation": "Embedded, typographically parenthesized Tahdhīb lemmata within Sanandajī II:64; editorial ellipsis separates distinct printed spans."
      }
    },
    "notes": [
      {
        "type": "Textual scope",
        "text": "Only a selected Sanandajī clause and two separated matn snippets have been transcribed. The remaining upper text and lower ḥāshiya are not translated; independently verify the source wording before publishing as critically definitive."
      }
    ]
  },
  {
    "id": "A.II.074.01",
    "volume": "II",
    "page": 74,
    "pdf": 369,
    "category": "selection",
    "quality": "source-aligned-upper-selection",
    "title": "Treatise-section on the immaterial beings: two investigations",
    "arabic": "مقالة في المجردات وفيها بحثان ... البحث الأول في النفس وقسمها إلى فلكية وإنسانية",
    "english": "A treatise-section on immaterial beings, containing two investigations. … The first investigation concerns the soul, divided into celestial and human souls.",
    "citation": "Taqrīb al-Marām II:74 / PDF 369; visible chapter heading and opening paragraphs above second horizontal divider; ellipsis denotes intervening words",
    "layers": {},
    "notes": [
      {
        "type": "Transition",
        "text": "This is a printed main-heading and a selected opening statement, not a full translation of the page. Marginal commentary below the divider is not attributed to Wasīm solely by layout."
      }
    ]
  },
  {
    "id": "A.II.095.01",
    "volume": "II",
    "page": 95,
    "pdf": 390,
    "category": "selection",
    "quality": "source-aligned-upper-selection",
    "title": "Second investigation: the proof for separate intellects",
    "arabic": "البحث الثاني من المقالة في العقل ... على وجود مباين للعلويات",
    "english": "The second investigation of the treatise-section is on intellect … concerning the existence of something distinct from the celestial beings.",
    "citation": "Taqrīb al-Marām II:95 / PDF 390, upper opening of new section; textual omission explicitly marked",
    "layers": {
      "matn": {
        "arabic": "لا يجوز أن يكون جسما فلكيا ولا يكون ...",
        "english": "It cannot be a celestial body, nor can it be …",
        "citation": "Selected, incomplete parenthetical argument on II:95. Deliberately not completed or attributed without full proof."
      }
    },
    "notes": [
      {
        "type": "Reported account",
        "text": "The section presents a reported philosophical argument for separate immaterial intellects; do not infer authorial endorsement without tracing objections and replies."
      },
      {
        "type": "Edition status",
        "text": "The phrase following 'nor can it be' remains untranscribed and untranslated rather than supplied conjecturally."
      }
    ]
  }
])if(!seen.has(u.id))b.units.push(u);})();