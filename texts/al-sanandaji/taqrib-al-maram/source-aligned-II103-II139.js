/* Stage13 aligned short upper text and one author-UNASSIGNED marginal fragment. All previous Wasim II117 text remains unchanged. */
(()=>{'use strict';const b=window.GNAMMA_BOOK;if(!b||b.id!=='taqrib')return;const seen=new Set(b.units.map(x=>x.id));for(const u of [
  {
    "id": "A.II.103.01",
    "volume": "II",
    "page": 103,
    "pdf": 398,
    "category": "selection",
    "quality": "selected-heading-firstpass",
    "title": "Book Five begins: divine matters and the proofs",
    "arabic": "الباب الخامس في الإلهيات ... الفصل الأول في تقرير الأدلة",
    "english": "Book Five: On Divine Matters. … Chapter One: On Establishing the Proofs.",
    "citation": "Taqrīb al-Marām printed II:103, PDF 398, major printed chapter heading and first internal division; ellipsis denotes intervening printed words",
    "notes": [
      {
        "type": "Source boundary",
        "text": "Two separately located, noncontiguous printed headings. The first follows the conclusion of the angelology section. They are not a single continuous paragraph."
      }
    ],
    "layers": {}
  },
  {
    "id": "A.II.104.01",
    "volume": "II",
    "page": 104,
    "pdf": 399,
    "category": "selection",
    "quality": "source-aligned-matn-sharh-firstpass",
    "title": "The possible requires a cause preferring existence over nonexistence",
    "arabic": "علة لها مرجح وجودها على عدمها",
    "english": "A cause for them, by which their existence prevails over their nonexistence.",
    "citation": "Taqrīb al-Marām printed II:104, source PDF 399, Sanandajī's brief explanation following quoted lemma in larger upper register",
    "layers": {
      "matn": {
        "arabic": "لا بد للممكنات من",
        "english": "Possible beings necessarily require …",
        "citation": "Embedded typographic lemma fragment from the Tahdhīb at Taqrīb II:104, PDF 399. This is an incomplete quotation; it is not the canonical separate Tahdhīb edition."
      }
    },
    "notes": [
      {
        "type": "Textual status",
        "text": "The lemma ends in the middle of a sentence; Sanandajī supplies the explicit reference to a cause. These are separately segmented short extracts, not the full original argument."
      }
    ]
  },
  {
    "id": "A.II.105.01",
    "volume": "II",
    "page": 105,
    "pdf": 400,
    "category": "selection",
    "quality": "short-running-text-firstpass",
    "title": "Beginninglessness and necessary existence in the reported doctrine",
    "arabic": "وإثبات القدم عندهم إثبات الواجب إذ لم يقولوا بقدم شيء من الممكنات",
    "english": "For them, establishing beginninglessness is to establish a necessary existent, since they did not maintain that any contingent being was beginningless.",
    "citation": "Taqrīb al-Marām II:105, PDF 400, selected continuous larger-type running prose",
    "notes": [
      {
        "type": "Attribution",
        "text": "This sentence reports a particular position; the full source context and surrounding objections are essential before describing it as Sanandajī's own final judgment."
      }
    ],
    "layers": {}
  },
  {
    "id": "A.II.118.01",
    "volume": "II",
    "page": 118,
    "pdf": 413,
    "category": "selection",
    "quality": "direct-chapter-heading-firstpass",
    "title": "Affirmative attributes as distinct from change of the essence",
    "arabic": "فصل في الصفات الوجودية كالعلم والقدرة والإرادة وغير ذلك",
    "english": "A chapter on the existential attributes, such as knowledge, power, will and others.",
    "citation": "Taqrīb al-Marām II:118, PDF 413, original bold chapter heading immediately above the first dividing rule",
    "notes": [
      {
        "type": "Context",
        "text": "This chapter follows the discussion of divine change at II:117. The previously translated Wasīm lower-register excerpt at II:117 is intentionally not duplicated here."
      }
    ],
    "layers": {}
  },
  {
    "id": "A.II.139.01",
    "volume": "II",
    "page": 139,
    "pdf": 434,
    "category": "selection",
    "quality": "short-source-excerpts-firstpass",
    "title": "Life, hearing and sight in the divine-attribute discussion",
    "arabic": "ومنها الحياة ... والسمع والبصر",
    "english": "Among them is life … and hearing and sight.",
    "citation": "Taqrīb II:139, PDF 434; two NONCONTIGUOUS printed upper phrases separated by editorial ellipsis",
    "notes": [
      {
        "type": "Textual status",
        "text": "This is a two-phrase topical locator rather than a sentence-complete translation; do not infer the missing proof from the ellipsis."
      }
    ],
    "layers": {}
  }
])if(!seen.has(u.id))b.units.push(u);for(const n of [
  {
    "id": "G.II.118.601",
    "volume": "II",
    "page": 118,
    "pdf": 413,
    "arabic": "عدم خلو الواجب من الحادث يستلزم حدوثه",
    "english": "The Necessary Existent’s not being free of an originated thing would entail that He is originated.",
    "citation": "Combined printed Taqrīb II:118, PDF 413, LOWER REGISTER, first-pass selected substring; individual marginal author NOT VERIFIED",
    "kind": "Marginal fragment discussing a contested entailment; author unassigned, not independently confirmed as Wasīm"
  }
]){const page=b.units.find(u=>u.id==='P2.'+String(n.page).padStart(3,'0'));if(!page)continue;page.layers=page.layers||{};page.layers.margins=page.layers.margins||[];if(!page.layers.margins.some(x=>x.id===n.id))page.layers.margins.push(n)}})();