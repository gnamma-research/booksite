/* Stage14 distinct source layers: selected kalam, takwin, ru'ya, divine acts and unassigned kasb gloss. */
(()=>{'use strict';const b=window.GNAMMA_BOOK;if(!b||b.id!=='taqrib')return;const present=new Set(b.units.map(u=>u.id));for(const u of [
  {
    "id": "A.II.141.01",
    "volume": "II",
    "page": 141,
    "pdf": 436,
    "category": "selection",
    "quality": "partially-aligned-upper-original",
    "title": "Eternal internal speech and its expression in audible/written language",
    "arabic": "هو ليس من جنس الأصوات والحروف بل ... قائمة بذاته تعالى ... كالأخرس ... والإشارة",
    "english": "It is not of the genus of sounds and letters, but rather … subsists in His essence, exalted is He. … As with a person incapable of speech … [it may also be indicated by] gestures.",
    "citation": "Taqrīb al-Marām II:141, PDF 436. Arabic photographed upper register. Ellipses explicitly mark omitted running text.",
    "layers": {
      "matn": {
        "arabic": "صفة أزلية ... منافية للسكوت والآفة ... يدل عليها بالعبارة والكتابة",
        "english": "An eternal attribute … incompatible with silence and an impediment [of speech] … indicated by expression and writing.",
        "citation": "Embedded parenthetical lemmata from the printed II:141. Separate original spans, NOT a continuous source sentence."
      }
    },
    "notes": [
      {
        "type": "Source",
        "text": "The text alternates Sanandajī's running explanation and typographically parenthesized lemmata. No entire-page coverage is claimed; the nonphonetic speech doctrine is reported in the current kalām controversy."
      },
      {
        "type": "Correction",
        "text": "The speech discussion runs through about II:148; II:149–150 also turn to baqāʾ and takwīn."
      }
    ]
  },
  {
    "id": "A.II.150.01",
    "volume": "II",
    "page": 150,
    "pdf": 445,
    "category": "selection",
    "quality": "continuous-selected-upper-original",
    "title": "The dispute over takwīn: an additional attribute or an intelligible relation",
    "arabic": "والحق أنه ليس صفة حقيقية كالعلم والإرادة بل هو معنى إضافي يعقل من تعلق المؤثر بالأثر",
    "english": "The correct view [in the argument being presented] is that it is not a real attribute like knowledge and will; rather, it is an intelligible relational meaning understood from the relation of the producer to the effect.",
    "citation": "Taqrīb al-Marām printed II:150 / PDF 445; selected upper original text photographed and directly read.",
    "layers": {
      "matn": {
        "arabic": "التكوين ... معنى إضافي يعقل من تعلق المؤثر بالأثر",
        "english": "Takwīn … a relational meaning apprehended from the producer's relation to the effect.",
        "citation": "Selected typographically parenthesized source lemmata II:150; omitted words marked."
      }
    },
    "notes": [
      {
        "type": "Status",
        "text": "A relatively continuous source quotation is translated, but its complete preceding and following disputation and long lower-register notes are not yet translated. Source variation and speaker attribution await another witness."
      }
    ]
  },
  {
    "id": "A.II.151.01",
    "volume": "II",
    "page": 151,
    "pdf": 446,
    "category": "selection",
    "quality": "partially-aligned-upper-original",
    "title": "The actual opening of divine vision: perception without direction or confrontation",
    "arabic": "من أهمها هل يمكن أن يرى وهل يمكن العلم بحقيقته ... أنه تعالى يصح أن يرى بمعنى حصول الحالة الإدراكية الحاصلة لنا ... التي نسميها الرؤية لكن ... لتنزهه تعالى عن ذلك",
    "english": "Among its chief questions are whether He can be seen and whether His reality can be known. … He, exalted is He, can be seen in the sense that there occurs the perceptual state we experience … which we call vision, but … He is exalted above those [spatial] conditions.",
    "citation": "Taqrīb al-Marām printed II:151 / PDF 446; upper source paragraph, actual section opening directly observed, ellipses preserve omitted lemmata.",
    "layers": {
      "matn": {
        "arabic": "فصل في أحواله ... والحق ... عند النظر إلى القمر ... من غير جهة ولا مقابلة",
        "english": "A section on His states/conditions … the correct position … when looking at the moon … without direction or being face to face.",
        "citation": "Four separated parenthesized printed lemmas II:151; this is NOT one continuous Arabic sentence."
      }
    },
    "notes": [
      {
        "type": "Source-level correction",
        "text": "The actual vision section begins at II:151, rather than II:154 as first inferred from the contact-sheet survey. II:149–150 treat subsistence and takwīn. Both the reader and handoff retain this correction."
      },
      {
        "type": "Boundary",
        "text": "Only the directly quoted words are translated. The long marginal response below the rule remains completely untranslated and without author attribution."
      }
    ]
  },
  {
    "id": "A.II.166.01",
    "volume": "II",
    "page": 166,
    "pdf": 461,
    "category": "selection",
    "quality": "source-aligned-heading-firstpass",
    "title": "The chapter of divine acts: creation of the acts of human beings and other animals",
    "arabic": "فصل في أفعاله ... بل جميع أفعال الحيوانات",
    "english": "A section on His acts … indeed, all the acts of animals.",
    "citation": "Taqrīb al-Marām printed II:166, source PDF image 461; source-checked chapter boundary and first explanatory words.",
    "layers": {
      "matn": {
        "arabic": "فصل في أفعاله ... موجد فعل العبد",
        "english": "A chapter on His acts … the creator of the servant's act.",
        "citation": "Fragments of the original parenthesized opening; the joining words have been omitted rather than reconstructed."
      }
    },
    "notes": [
      {
        "type": "Major original division",
        "text": "This chapter follows the vision controversy and opens the question of human acts. It is not a separate commentary text or a new canonical Tahdhīb translation."
      },
      {
        "type": "Not definitive",
        "text": "Printed word joins are compressed in this scan; only selected fragment boundaries are represented pending a second independent visual reading."
      }
    ]
  }
])if(!present.has(u.id))b.units.push(u);for(const g of [
  {
    "id": "G.II.177.01",
    "page": 177,
    "pdf": 472,
    "title": "Acquisition (kasb) does not itself require origination",
    "arabic": "والسر في ذلك هو أن الكسب هو أن يستفيد أحد شيئا لنفسه وهو لا يقتضي إيجاده بل يصح مع وجوده بغيره أيضا بخلاف الخلق فإنه إعطاء الوجود",
    "english": "The reason is that acquisition means someone obtaining something for himself; it does not require his producing its existence. Rather, acquisition remains possible when that thing is brought into existence by someone else. Creation, in contrast, is the conferral of existence.",
    "citation": "Original combined Taqrīb printed II:177, physical PDF 472, SMALL TYPE lower register below first horizontal divider, directly read 2 Nov 2026.",
    "kind": "Selected continuous lower-register translation, author UNASSIGNED; complete marginal note remains untranslated."
  }
]){const page=b.units.find(u=>u.id==='P2.'+String(g.page).padStart(3,'0'));if(!page)continue;page.layers=page.layers||{};page.layers.margins=page.layers.margins||[];if(!page.layers.margins.some(u=>u.id===g.id))page.layers.margins.push(g);}})();