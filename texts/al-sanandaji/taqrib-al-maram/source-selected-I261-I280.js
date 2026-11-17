/* Stage 10: selected original Arabic and English; not full-page translation. */
(()=>{"use strict";const b=window.GNAMMA_BOOK;if(!b||b.id!=="taqrib")return;
const seen=new Set(b.units.map(u=>u.id));for(const u of [
  {
    "id": "L.I.261.300",
    "page": 261,
    "volume": "I",
    "pdf": 274,
    "category": "selection",
    "quality": "direct-source-firstpass",
    "title": "Rarefaction without adding another body",
    "arabic": "والتخلخل وهو ازدياد حجم الجسم من غير أن ينضم جسم آخر إليه",
    "english": "Rarefaction is the increase of a body's volume without another body joining it.",
    "citation": "Taqrīb al-Marām I:261; facsimile image 274, selected upper-register wording checked visually 2 Nov 2026",
    "notes": [
      {
        "type": "Critical status",
        "text": "Only these selected Arabic words are translated. Original authorship of embedded Tahdhīb lemmata, full surrounding passage and marginal annotations require checking before any full-page certification."
      }
    ],
    "layers": {}
  },
  {
    "id": "L.I.261.301",
    "page": 261,
    "volume": "I",
    "pdf": 274,
    "category": "selection",
    "quality": "direct-source-firstpass",
    "title": "Condensation as the opposite",
    "arabic": "والتكاثف وهو ضد التخلخل",
    "english": "Condensation is the opposite of rarefaction.",
    "citation": "Taqrīb al-Marām I:261; facsimile image 274, selected upper-register wording checked visually 2 Nov 2026",
    "notes": [
      {
        "type": "Critical status",
        "text": "Only these selected Arabic words are translated. Original authorship of embedded Tahdhīb lemmata, full surrounding passage and marginal annotations require checking before any full-page certification."
      }
    ],
    "layers": {}
  },
  {
    "id": "L.I.263.302",
    "page": 263,
    "volume": "I",
    "pdf": 276,
    "category": "selection",
    "quality": "direct-source-firstpass",
    "title": "Motion by itself",
    "arabic": "وتكون الحركة بالذات",
    "english": "Motion may belong [to a thing] in itself.",
    "citation": "Taqrīb al-Marām I:263; facsimile image 276, selected upper-register wording checked visually 2 Nov 2026",
    "notes": [
      {
        "type": "Critical status",
        "text": "Only these selected Arabic words are translated. Original authorship of embedded Tahdhīb lemmata, full surrounding passage and marginal annotations require checking before any full-page certification."
      }
    ],
    "layers": {}
  },
  {
    "id": "L.I.263.303",
    "page": 263,
    "volume": "I",
    "pdf": 276,
    "category": "selection",
    "quality": "direct-source-firstpass",
    "title": "Motion incidentally",
    "arabic": "وتكون أيضا بالعرض",
    "english": "It may also belong [to something] incidentally.",
    "citation": "Taqrīb al-Marām I:263; facsimile image 276, selected upper-register wording checked visually 2 Nov 2026",
    "notes": [
      {
        "type": "Critical status",
        "text": "Only these selected Arabic words are translated. Original authorship of embedded Tahdhīb lemmata, full surrounding passage and marginal annotations require checking before any full-page certification."
      }
    ],
    "layers": {}
  },
  {
    "id": "L.I.265.304",
    "page": 265,
    "volume": "I",
    "pdf": 278,
    "category": "selection",
    "quality": "direct-source-firstpass",
    "title": "Differences between motions",
    "arabic": "ثم اعلم أن اختلاف الحركات قد يكون بالماهية وقد يكون بالعوارض",
    "english": "Know that movements may differ in quiddity or may differ through accidental features.",
    "citation": "Taqrīb al-Marām I:265; facsimile image 278, selected upper-register wording checked visually 2 Nov 2026",
    "notes": [
      {
        "type": "Critical status",
        "text": "Only these selected Arabic words are translated. Original authorship of embedded Tahdhīb lemmata, full surrounding passage and marginal annotations require checking before any full-page certification."
      }
    ],
    "layers": {}
  },
  {
    "id": "L.I.266.305",
    "page": 266,
    "volume": "I",
    "pdf": 279,
    "category": "selection",
    "quality": "direct-source-firstpass",
    "title": "Numerical unity of motion",
    "arabic": "وحدتها الشخصية",
    "english": "Its numerical or individual unity.",
    "citation": "Taqrīb al-Marām I:266; facsimile image 279, selected upper-register wording checked visually 2 Nov 2026",
    "notes": [
      {
        "type": "Critical status",
        "text": "Only these selected Arabic words are translated. Original authorship of embedded Tahdhīb lemmata, full surrounding passage and marginal annotations require checking before any full-page certification."
      }
    ],
    "layers": {}
  },
  {
    "id": "L.I.268.306",
    "page": 268,
    "volume": "I",
    "pdf": 281,
    "category": "selection",
    "quality": "direct-source-firstpass",
    "title": "Ascent and descent",
    "arabic": "والصعود عكس الهبوط",
    "english": "Ascent is the opposite of descent.",
    "citation": "Taqrīb al-Marām I:268; facsimile image 281, selected upper-register wording checked visually 2 Nov 2026",
    "notes": [
      {
        "type": "Critical status",
        "text": "Only these selected Arabic words are translated. Original authorship of embedded Tahdhīb lemmata, full surrounding passage and marginal annotations require checking before any full-page certification."
      }
    ],
    "layers": {}
  },
  {
    "id": "L.I.268.307",
    "page": 268,
    "volume": "I",
    "pdf": 281,
    "category": "selection",
    "quality": "direct-source-firstpass",
    "title": "Temporal division of motion",
    "arabic": "وانقسامها بانقسام الزمان",
    "english": "Its division in accordance with the division of time.",
    "citation": "Taqrīb al-Marām I:268; facsimile image 281, selected upper-register wording checked visually 2 Nov 2026",
    "notes": [
      {
        "type": "Critical status",
        "text": "Only these selected Arabic words are translated. Original authorship of embedded Tahdhīb lemmata, full surrounding passage and marginal annotations require checking before any full-page certification."
      }
    ],
    "layers": {}
  },
  {
    "id": "L.I.274.308",
    "page": 274,
    "volume": "I",
    "pdf": 287,
    "category": "selection",
    "quality": "direct-source-firstpass",
    "title": "Two movements in one or different directions",
    "arabic": "فقد يتحرك الجسم حركتين إلى جهة واحدة وقد يتحرك إلى جهتين أو جهات مختلفة",
    "english": "A body may undergo two movements in the same direction, or move toward two or several different directions.",
    "citation": "Taqrīb al-Marām I:274; facsimile image 287, selected upper-register wording checked visually 2 Nov 2026",
    "notes": [
      {
        "type": "Critical status",
        "text": "Only these selected Arabic words are translated. Original authorship of embedded Tahdhīb lemmata, full surrounding passage and marginal annotations require checking before any full-page certification."
      }
    ],
    "layers": {}
  },
  {
    "id": "L.I.274.309",
    "page": 274,
    "volume": "I",
    "pdf": 287,
    "category": "selection",
    "quality": "direct-source-firstpass",
    "title": "Movement aboard a moving ship",
    "arabic": "كالمتحرك في سفينة إلى الجهة التي تتحرك إليها السفينة",
    "english": "As with something moving in a ship toward the direction in which the ship is moving.",
    "citation": "Taqrīb al-Marām I:274; facsimile image 287, selected upper-register wording checked visually 2 Nov 2026",
    "notes": [
      {
        "type": "Critical status",
        "text": "Only these selected Arabic words are translated. Original authorship of embedded Tahdhīb lemmata, full surrounding passage and marginal annotations require checking before any full-page certification."
      }
    ],
    "layers": {}
  },
  {
    "id": "L.I.275.310",
    "page": 275,
    "volume": "I",
    "pdf": 288,
    "category": "selection",
    "quality": "direct-source-firstpass",
    "title": "The chapter on relation",
    "arabic": "فصل في الإضافة",
    "english": "A chapter on relation.",
    "citation": "Taqrīb al-Marām I:275; facsimile image 288, selected upper-register wording checked visually 2 Nov 2026",
    "notes": [
      {
        "type": "Critical status",
        "text": "Only these selected Arabic words are translated. Original authorship of embedded Tahdhīb lemmata, full surrounding passage and marginal annotations require checking before any full-page certification."
      }
    ],
    "layers": {}
  },
  {
    "id": "L.I.275.311",
    "page": 275,
    "volume": "I",
    "pdf": 288,
    "category": "selection",
    "quality": "direct-source-firstpass",
    "title": "Relation defined by its reciprocity",
    "arabic": "وهي النسبة المنعكسة",
    "english": "It is a reciprocal reference or ratio.",
    "citation": "Taqrīb al-Marām I:275; facsimile image 288, selected upper-register wording checked visually 2 Nov 2026",
    "notes": [
      {
        "type": "Critical status",
        "text": "Only these selected Arabic words are translated. Original authorship of embedded Tahdhīb lemmata, full surrounding passage and marginal annotations require checking before any full-page certification."
      }
    ],
    "layers": {}
  },
  {
    "id": "L.I.276.312",
    "page": 276,
    "volume": "I",
    "pdf": 289,
    "category": "selection",
    "quality": "direct-source-firstpass",
    "title": "The reciprocal act of comparison",
    "arabic": "والانعكاس",
    "english": "Reciprocity.",
    "citation": "Taqrīb al-Marām I:276; facsimile image 289, selected upper-register wording checked visually 2 Nov 2026",
    "notes": [
      {
        "type": "Critical status",
        "text": "Only these selected Arabic words are translated. Original authorship of embedded Tahdhīb lemmata, full surrounding passage and marginal annotations require checking before any full-page certification."
      }
    ],
    "layers": {}
  },
  {
    "id": "L.I.277.313",
    "page": 277,
    "volume": "I",
    "pdf": 290,
    "category": "selection",
    "quality": "direct-source-firstpass",
    "title": "Examples of relatives in different categories",
    "arabic": "والجوهر كالأب والكم كالأقل والكيف كالأحر",
    "english": "Substance, as in the case of a father; quantity, as in the lesser; quality, as in the hotter.",
    "citation": "Taqrīb al-Marām I:277; facsimile image 290, selected upper-register wording checked visually 2 Nov 2026",
    "notes": [
      {
        "type": "Critical status",
        "text": "Only these selected Arabic words are translated. Original authorship of embedded Tahdhīb lemmata, full surrounding passage and marginal annotations require checking before any full-page certification."
      }
    ],
    "layers": {}
  },
  {
    "id": "L.I.279.314",
    "page": 279,
    "volume": "I",
    "pdf": 292,
    "category": "selection",
    "quality": "direct-source-firstpass",
    "title": "The category of posture",
    "arabic": "والوضع هو كون الجسم بحيث تكون لأجزائه نسبة فيما بينها",
    "english": "Posture is a body's being such that its parts have relations among themselves.",
    "citation": "Taqrīb al-Marām I:279; facsimile image 292, selected upper-register wording checked visually 2 Nov 2026",
    "notes": [
      {
        "type": "Critical status",
        "text": "Only these selected Arabic words are translated. Original authorship of embedded Tahdhīb lemmata, full surrounding passage and marginal annotations require checking before any full-page certification."
      }
    ],
    "layers": {}
  },
  {
    "id": "L.I.280.315",
    "page": 280,
    "volume": "I",
    "pdf": 293,
    "category": "selection",
    "quality": "direct-source-firstpass",
    "title": "The category of having or possession",
    "arabic": "والملك هو نسبة الجسم إلى حاصره",
    "english": "Having or possession is the body's relation to what encloses it.",
    "citation": "Taqrīb al-Marām I:280; facsimile image 293, selected upper-register wording checked visually 2 Nov 2026",
    "notes": [
      {
        "type": "Critical status",
        "text": "Only these selected Arabic words are translated. Original authorship of embedded Tahdhīb lemmata, full surrounding passage and marginal annotations require checking before any full-page certification."
      }
    ],
    "layers": {}
  }
])if(!seen.has(u.id))b.units.push(u);
for(const n of [
  {
    "p": 261,
    "title": "Why 'in all dimensions' is a restriction",
    "ar": "قوله في جميع أقطاره احتراز من السمن",
    "en": "His words 'in all its dimensions' exclude fattening.",
    "status": "Lower-register short lemma-explanation; individual author unverified."
  }
]){const u=b.units.find(x=>x.id==="P1."+String(n.p).padStart(3,"0"));if(!u)continue;u.layers=u.layers||{};u.layers.margins=u.layers.margins||[];u.layers.margins.push({id:"G.I."+n.p+".300",arabic:n.ar,english:n.en,kind:n.status,citation:"Taqrīb I:"+n.p+" lower register, author unassigned"});}
})();