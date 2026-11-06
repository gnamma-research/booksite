/* Logic only: bilingual editorial technical index with printed Yazdī locators.
 * These definitions are not authorial quotations and are not a manuscript collation. */
(function(){
'use strict';
const prior=window.GNAMMA_TAHDHIB_GLOSSARY;
if(!prior||!window.GNAMMA_CRITICAL_CORPUS||window.GNAMMA_CRITICAL_CORPUS.work!=='Tahdhīb al-Manṭiq')return;
const extra=[
  {
    "ar": "الاستقراء",
    "en": "Induction",
    "explanation": "Inference from judgments about particulars to a general judgment. Al-Yazdī rejects a definition limited to surveying cases, because the survey is an operation rather than a propositional argument.",
    "page": 105,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/105",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "التمثيل",
    "en": "Analogical inference",
    "explanation": "Inference from an established ruling in an original case to a new case through a relevant shared characteristic. Distinguished from the mere operation of likening.",
    "page": 107,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/107",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "الدوران",
    "en": "Concomitance / covariation",
    "explanation": "Presence and absence of a ruling tracking an attribute. In the uṣūl-informed analogy example this is offered as evidence for a causal relation, not a purely formal entailment.",
    "page": 107,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/107",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "الترديد",
    "en": "Eliminative consideration",
    "explanation": "A procedure for establishing the operative attribute of a ruling by considering and excluding candidate explanations; do not equate this without qualification with modern scientific controlled experimentation.",
    "page": 107,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/107",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "الأصل",
    "en": "Original case",
    "explanation": "The source case in analogical argument for which the ruling has already been established.",
    "page": 107,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/107",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "الفرع",
    "en": "New case",
    "explanation": "The target case in analogy to which a ruling is extended if the causal attribute is present.",
    "page": 107,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/107",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "العلة",
    "en": "Explanatory cause",
    "explanation": "The operative attribute claimed to account for a ruling. The premise asserting its causal status is specifically contested in analogy.",
    "page": 107,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/107",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "الحكم",
    "en": "Judgment / ruling",
    "explanation": "In the logical treatment of analogy, the predication or legal ruling transferred from original to new case; distinguish this from judgment as assent.",
    "page": 107,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/107",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "الاقتراني",
    "en": "Conjunctive syllogism",
    "explanation": "An argument whose conclusion is not already present in substance and form as a component of a premise.",
    "page": 86,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/86",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "الاستثنائي",
    "en": "Exceptive syllogism",
    "explanation": "An inference that includes a conditional or disjunction and an explicit exception or assertion/denial of one component.",
    "page": 102,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/102",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "قياس الخلف",
    "en": "Reductio ad absurdum",
    "explanation": "A proof that establishes a conclusion through invalidating its contradictory, analyzable into more than one syllogistic step.",
    "page": 104,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/104",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "مانعة الجمع",
    "en": "Mutual exclusion of truth",
    "explanation": "A disjunction whose two alternatives cannot both be true, though they may both be false.",
    "page": 104,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/104",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "مانعة الخلو",
    "en": "Mutual exclusion of falsity",
    "explanation": "A disjunction whose two alternatives cannot both be false, though they may both be true.",
    "page": 104,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/104",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "العكس المستوي",
    "en": "Simple conversion",
    "explanation": "Exchanging the two propositional terms while preserving truth and quality, subject to quantifier and modal restrictions.",
    "page": 74,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/74",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "عكس النقيض",
    "en": "Contraposition",
    "explanation": "Conversion involving contradictory terms; the earlier and later logicians’ conventions differ in which term is retained and whether quality is reversed.",
    "page": 81,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/81",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "المادة",
    "en": "Matter of an argument",
    "explanation": "The epistemic type of premises on which a syllogistic discourse relies, as distinguished from its form or figure.",
    "page": 110,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/110",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "الصورة",
    "en": "Formal arrangement",
    "explanation": "The structural arrangement of a syllogistic argument, considered apart from the epistemic quality of its premises.",
    "page": 86,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/86",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "التخييل",
    "en": "Imaginative presentation",
    "explanation": "An effect on the imagination rather than assent; used to characterize the poetic art.",
    "page": 110,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/110",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "الخطابة",
    "en": "Rhetoric",
    "explanation": "Argument principally producing probable or conjectural assent in al-Yazdī’s classification of the five arts.",
    "page": 110,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/110",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "الشعر",
    "en": "Poetry",
    "explanation": "The logical art whose matter principally produces imaginative effect, not necessarily assertoric conviction.",
    "page": 110,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/110",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "الجدل",
    "en": "Dialectic",
    "explanation": "Reasoning resting on generally conceded or opponent-admitted premises rather than exclusively on demonstratively certain premises.",
    "page": 110,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/110",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "المغالطة",
    "en": "Fallacious argument",
    "explanation": "Argument using misleading premises or defective epistemic material; distinguished from demonstration and from merely improbable rhetoric.",
    "page": 110,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/110",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "السفسطة",
    "en": "Sophistical disputation",
    "explanation": "Yazdī’s name for fallacious reasoning directed against a philosopher or sage.",
    "page": 110,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/110",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "المشاغبة",
    "en": "Contentious disputation",
    "explanation": "Yazdī’s term for fallacious contention directed against a non-philosopher.",
    "page": 110,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/110",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "الأعراض الذاتية",
    "en": "Proper attributes of a subject",
    "explanation": "Properties investigated by a science in virtue of its formal subject; not simply any accidental property.",
    "page": 114,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/114",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "المبادئ التصورية",
    "en": "Conceptual principles",
    "explanation": "Terms and accounts supplying conception of the concepts in a science’s questions.",
    "page": 114,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/114",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "المبادئ التصديقية",
    "en": "Propositional principles",
    "explanation": "Assented-to premises used in proofs of the propositions sought in a science.",
    "page": 114,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/114",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "المسائل",
    "en": "Questions / investigated propositions",
    "explanation": "The propositions investigated in a science, mostly theoretical but sometimes needing explication even when self-evident.",
    "page": 114,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/114",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  },
  {
    "ar": "بالبرهان",
    "en": "By demonstration — reported variant",
    "explanation": "A phrase al-Yazdī reports from some copies and judges a scribal addition, while also offering ways to construe it. Not yet verified by identifying manuscript witnesses.",
    "page": 114,
    "sourceUrl": "https://najafdesertlibrary.com/book/الحاشيه-على-تهذيب-المنطق-للتفتازاني/v/1/p/114",
    "sourceLayer": "al-Yazdī working print; not independently manuscript-collated"
  }
];
const seen=new Set(prior.terms.map(t=>prior.norm(t.ar)));
const terms=prior.terms.slice();
for(const term of extra){if(!seen.has(prior.norm(term.ar))){terms.push(term);seen.add(prior.norm(term.ar))}}
window.GNAMMA_TAHDHIB_GLOSSARY=Object.freeze({...prior,terms,version:'logic-plus-yazdi-context-v2',historicallyCollated:false});
})();
