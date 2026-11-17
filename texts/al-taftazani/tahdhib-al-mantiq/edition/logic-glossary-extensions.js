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
const supplementary=[
  {
    "ar": "الإذعان",
    "en": "Assent as acceptance",
    "explanation": "A judgemental accepting of a predicative relation; al-Yazdī distinguishes it from merely conceiving the relation, and reports disagreement over whether its accompanying term-conceptions enter its essence.",
    "page": 15,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/15?lang=ar",
    "sourceLayer": "al-Yazdī main commentary in Q; India 2013 printed comparator, no manuscript certification"
  },
  {
    "ar": "النسبة الخبرية",
    "en": "Assertoric relation",
    "explanation": "The positive or negative propositional relation treated as the object of judgment by the earlier philosophers in the discussion of the proposition’s three constituents.",
    "page": 15,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/15?lang=ar",
    "sourceLayer": "al-Yazdī main commentary in Q; India 2013 printed comparator, no manuscript certification"
  },
  {
    "ar": "النسبة التقييدية",
    "en": "Restrictive or attributive relation",
    "explanation": "A subordinate, non-assertoric relation between terms; in the debated later analysis, its occurrence or non-occurrence constitutes a further propositional element.",
    "page": 15,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/15?lang=ar",
    "sourceLayer": "al-Yazdī main commentary in Q; India 2013 printed comparator, no manuscript certification"
  },
  {
    "ar": "الاكتساب بالنظر",
    "en": "Acquisition through inquiry",
    "explanation": "A conception or assent reached through rational consideration rather than simply present without inquiry.",
    "page": 15,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/15?lang=ar",
    "sourceLayer": "al-Yazdī main commentary in Q; India 2013 printed comparator, no manuscript certification"
  },
  {
    "ar": "المعقول",
    "en": "The intelligible",
    "explanation": "What is attended to in rational inquiry; al-Yazdī explains why the term is preferred to the potentially ambiguous ‘known’.",
    "page": 16,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/16?lang=ar",
    "sourceLayer": "al-Yazdī main commentary in Q; India 2013 printed comparator, no manuscript certification"
  },
  {
    "ar": "القانون",
    "en": "Canon or general rule",
    "explanation": "A universal proposition governing applications to particular instances, such as a grammatical rule used to classify individual expressions.",
    "page": 17,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/17?lang=ar",
    "sourceLayer": "al-Yazdī main commentary in Q; India 2013 printed comparator, no manuscript certification"
  },
  {
    "ar": "المعلوم التصوري",
    "en": "Already-conceived item",
    "explanation": "A conception can serve as a defining account only under the aspect of leading to a previously ungrasped conception.",
    "page": 19,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/19?lang=ar",
    "sourceLayer": "al-Yazdī main commentary in Q; India 2013 printed comparator, no manuscript certification"
  },
  {
    "ar": "المعلوم التصديقي",
    "en": "Already-assented proposition",
    "explanation": "A known judgment may count as a proof when structured to lead to a new act of assent.",
    "page": 19,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/19?lang=ar",
    "sourceLayer": "al-Yazdī main commentary in Q; India 2013 printed comparator, no manuscript certification"
  },
  {
    "ar": "الكناية",
    "en": "Indirect indication",
    "explanation": "A mode of expression by which the twofold division is learned through implication from the explicitly stated distribution.",
    "page": 15,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/15?lang=ar",
    "sourceLayer": "al-Yazdī main commentary in Q; India 2013 printed comparator, no manuscript certification"
  },
  {
    "ar": "موضوع المنطق",
    "en": "Subject of logic",
    "explanation": "What logic investigates under the respect of its role in constructing defining accounts and proofs; not every known item without qualification.",
    "page": 18,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/18?lang=ar",
    "sourceLayer": "al-Yazdī main commentary in Q; India 2013 printed comparator, no manuscript certification"
  },
  {
    "ar": "الحجة",
    "en": "Argument or proof",
    "explanation": "An arrangement of known propositional items that leads to a previously unknown assent; in one etymological explanation its name relates to prevailing in disputation.",
    "page": 19,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/19?lang=ar",
    "sourceLayer": "al-Yazdī main commentary in Q; India 2013 printed comparator, no manuscript certification"
  }
];
const universals=[
  {
    "ar": "المفهوم",
    "en": "Concept",
    "explanation": "What is understood from an expression; the same item considered as intended is its maʿnā and as signified its madlūl.",
    "page": 30,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/30?lang=ar",
    "sourceLayer": "al-Yazdī main ḥāshiya Q30–37 working searchable text, photograph/manuscript unverified"
  },
  {
    "ar": "المدلول",
    "en": "Signified",
    "explanation": "What an expression signifies, considered under its relation to the signifying expression.",
    "page": 30,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/30?lang=ar",
    "sourceLayer": "al-Yazdī main ḥāshiya Q30–37 working searchable text, photograph/manuscript unverified"
  },
  {
    "ar": "فرض الصدق",
    "en": "Conceivable applicability",
    "explanation": "The intellect's allowance that a predicate could apply to multiple things; not mere imaginative supposition without logical consistency.",
    "page": 31,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/31?lang=ar",
    "sourceLayer": "al-Yazdī main ḥāshiya Q30–37 working searchable text, photograph/manuscript unverified"
  },
  {
    "ar": "الجزئي الحقيقي",
    "en": "Real particular",
    "explanation": "A concept whose extension cannot coherently be multiplied; distinct from the relatively narrower universal.",
    "page": 35,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/35?lang=ar",
    "sourceLayer": "al-Yazdī main ḥāshiya Q30–37 working searchable text, photograph/manuscript unverified"
  },
  {
    "ar": "الجزئي الإضافي",
    "en": "Relative particular",
    "explanation": "Something narrower relative to a more comprehensive concept; it may itself be universal, as human is to animal.",
    "page": 35,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/35?lang=ar",
    "sourceLayer": "al-Yazdī main ḥāshiya Q30–37 working searchable text, photograph/manuscript unverified"
  },
  {
    "ar": "التباين الكلي",
    "en": "Complete disjointness",
    "explanation": "Two concepts with no shared instances under a stipulated extensional interpretation.",
    "page": 32,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/32?lang=ar",
    "sourceLayer": "al-Yazdī main ḥāshiya Q30–37 working searchable text, photograph/manuscript unverified"
  },
  {
    "ar": "التباين الجزئي",
    "en": "Partial exclusion",
    "explanation": "Two concepts each having some instances outside the other's range; may cover disjointness or partial overlap in al-Yazdī's account.",
    "page": 34,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/34?lang=ar",
    "sourceLayer": "al-Yazdī main ḥāshiya Q30–37 working searchable text, photograph/manuscript unverified"
  },
  {
    "ar": "المساواة",
    "en": "Coextension",
    "explanation": "Two concepts universal-predicable of exactly the same subjects in both directions.",
    "page": 32,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/32?lang=ar",
    "sourceLayer": "al-Yazdī main ḥāshiya Q30–37 working searchable text, photograph/manuscript unverified"
  },
  {
    "ar": "العموم والخصوص مطلقا",
    "en": "Unrestricted inclusion",
    "explanation": "One concept is predicated of all instances of a narrower concept but not vice versa, as animal relative to human.",
    "page": 32,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/32?lang=ar",
    "sourceLayer": "al-Yazdī main ḥāshiya Q30–37 working searchable text, photograph/manuscript unverified"
  },
  {
    "ar": "العموم والخصوص من وجه",
    "en": "Partial overlap",
    "explanation": "Two concepts agree in some instances while each also applies beyond the other.",
    "page": 32,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/32?lang=ar",
    "sourceLayer": "al-Yazdī main ḥāshiya Q30–37 working searchable text, photograph/manuscript unverified"
  },
  {
    "ar": "النقيض",
    "en": "Complement / contradictory",
    "explanation": "In the discussion of the four universal relations, the complement of a concept (non-human), not merely the opposite truth value of a proposition.",
    "page": 33,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/33?lang=ar",
    "sourceLayer": "al-Yazdī main ḥāshiya Q30–37 working searchable text, photograph/manuscript unverified"
  },
  {
    "ar": "الجنس القريب",
    "en": "Proximate genus",
    "explanation": "The nearest genus answering the what-it-is question for a species and each nature directly sharing that genus.",
    "page": 37,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/37?lang=ar",
    "sourceLayer": "al-Yazdī main ḥāshiya Q30–37 working searchable text, photograph/manuscript unverified"
  },
  {
    "ar": "الجنس البعيد",
    "en": "Remote genus",
    "explanation": "A genus more distant than the nearest one; in the main commentary body is the illustrative case.",
    "page": 37,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/37?lang=ar",
    "sourceLayer": "al-Yazdī main ḥāshiya Q30–37 working searchable text, photograph/manuscript unverified"
  },
  {
    "ar": "العرض العام",
    "en": "Common accident",
    "explanation": "A nonessential predicable not restricted to individuals of one essential nature.",
    "page": 36,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/36?lang=ar",
    "sourceLayer": "al-Yazdī main ḥāshiya Q30–37 working searchable text, photograph/manuscript unverified"
  },
  {
    "ar": "الخاصة",
    "en": "Proper accident / property",
    "explanation": "A nonessential predicable restricted to one essential nature in the five-predicables classification.",
    "page": 36,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/36?lang=ar",
    "sourceLayer": "al-Yazdī main ḥāshiya Q30–37 working searchable text, photograph/manuscript unverified"
  },
  {
    "ar": "الجنس",
    "en": "Genus",
    "explanation": "An essential element common to distinct natures and predicable in answer to the what-it-is question.",
    "page": 36,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/36?lang=ar",
    "sourceLayer": "al-Yazdī main ḥāshiya Q30–37 working searchable text, photograph/manuscript unverified"
  }
];
const speciesTerms=[
  {
    "ar": "النوع الحقيقي",
    "en": "Real species",
    "explanation": "A universal predicated essentially of several individuals of the same quiddity; unlike relative species, it is individuated by the natures of its instances.",
    "page": 40,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/40?lang=ar",
    "sourceLayer": "Main al-Yazdī Qum searchable commentary pp39–47, not photographic or manuscript-collated"
  },
  {
    "ar": "النوع الإضافي",
    "en": "Relative species",
    "explanation": "A position subordinate to a higher genus; it may be a real species or a genus with another genus above it.",
    "page": 40,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/40?lang=ar",
    "sourceLayer": "Main al-Yazdī Qum searchable commentary pp39–47, not photographic or manuscript-collated"
  },
  {
    "ar": "الفصل القريب",
    "en": "Proximate differentia",
    "explanation": "The essential mark distinguishing a species from all others under its proximate genus.",
    "page": 43,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/43?lang=ar",
    "sourceLayer": "Main al-Yazdī Qum searchable commentary pp39–47, not photographic or manuscript-collated"
  },
  {
    "ar": "الفصل البعيد",
    "en": "Remote differentia",
    "explanation": "A differentiating essential characteristic at a less proximate genus, such as sensitive in the order of growing body.",
    "page": 43,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/43?lang=ar",
    "sourceLayer": "Main al-Yazdī Qum searchable commentary pp39–47, not photographic or manuscript-collated"
  },
  {
    "ar": "المقوم",
    "en": "Constitutive differentia",
    "explanation": "A differentia considered as a constituent of the essence it determines; a logical essential component, not necessarily a spatial part.",
    "page": 44,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/44?lang=ar",
    "sourceLayer": "Main al-Yazdī Qum searchable commentary pp39–47, not photographic or manuscript-collated"
  },
  {
    "ar": "المقسم",
    "en": "Divisive differentia",
    "explanation": "A differentia considered in relation to its genus, which it divides into groups with and without the feature.",
    "page": 44,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/44?lang=ar",
    "sourceLayer": "Main al-Yazdī Qum searchable commentary pp39–47, not photographic or manuscript-collated"
  },
  {
    "ar": "جنس الأجناس",
    "en": "Highest genus",
    "explanation": "The widest term in an ascending essential genus-series, having no higher genus above it, e.g. substance in the source's schema.",
    "page": 42,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/42?lang=ar",
    "sourceLayer": "Main al-Yazdī Qum searchable commentary pp39–47, not photographic or manuscript-collated"
  },
  {
    "ar": "نوع الأنواع",
    "en": "Lowest species",
    "explanation": "A species with no further species below it in the descending predicable series, e.g. human in the classical schema.",
    "page": 42,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/42?lang=ar",
    "sourceLayer": "Main al-Yazdī Qum searchable commentary pp39–47, not photographic or manuscript-collated"
  },
  {
    "ar": "لازم الماهية",
    "en": "Concomitant of quiddity",
    "explanation": "A property inseparable from the essential nature regardless of mental or external instantiation; e.g. the evenness of four.",
    "page": 47,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/47?lang=ar",
    "sourceLayer": "Main al-Yazdī Qum searchable commentary pp39–47, not photographic or manuscript-collated"
  },
  {
    "ar": "لازم الوجود الخارجي",
    "en": "Concomitant of external existence",
    "explanation": "A concomitant tied specifically to the subject's extramental actuality, e.g. the source's association of fire with burning.",
    "page": 47,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/47?lang=ar",
    "sourceLayer": "Main al-Yazdī Qum searchable commentary pp39–47, not photographic or manuscript-collated"
  },
  {
    "ar": "لازم الوجود الذهني",
    "en": "Concomitant of mental existence",
    "explanation": "A concomitant of the intellectual consideration of a nature, e.g. universality of the concept human.",
    "page": 47,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/47?lang=ar",
    "sourceLayer": "Main al-Yazdī Qum searchable commentary pp39–47, not photographic or manuscript-collated"
  },
  {
    "ar": "المعقول الثاني",
    "en": "Second intelligible",
    "explanation": "An attribute such as universality considered at the intellectual level; distinguished from the nature considered in itself.",
    "page": 47,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/47?lang=ar",
    "sourceLayer": "Main al-Yazdī Qum searchable commentary pp39–47, not photographic or manuscript-collated"
  },
  {
    "ar": "البين بالمعنى الأخص",
    "en": "Evident in the stricter sense",
    "explanation": "A concomitant conceived by conceiving the subject alone, as sight is implicated in blindness.",
    "page": 47,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/47?lang=ar",
    "sourceLayer": "Main al-Yazdī Qum searchable commentary pp39–47, not photographic or manuscript-collated"
  },
  {
    "ar": "البين بالمعنى الأعم",
    "en": "Evident in the broader sense",
    "explanation": "A concomitant whose necessity is assented to upon grasping subject, concomitant and their relation, e.g. the evenness of four.",
    "page": 47,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/47?lang=ar",
    "sourceLayer": "Main al-Yazdī Qum searchable commentary pp39–47, not photographic or manuscript-collated"
  },
  {
    "ar": "العرض المفارق",
    "en": "Separable accident",
    "explanation": "An accidental property whose separation from its subject is not impossible; it can be long-lasting or transient.",
    "page": 47,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/47?lang=ar",
    "sourceLayer": "Main al-Yazdī Qum searchable commentary pp39–47, not photographic or manuscript-collated"
  }
];
const logicalUniversalsAndPropositions=[
  {
    "ar": "الكلي المنطقي",
    "en": "Logical universal",
    "explanation": "The concept 'applicable to many without contradiction', itself an intellectual second intention; not a common nature existing as an individual object.",
    "page": 48,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/48?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "الكلي الطبيعي",
    "en": "Natural universal",
    "explanation": "The nature considered in itself (such as human qua human) to which universality is attributed in intellect; its external manner of existence is disputed.",
    "page": 49,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/49?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "الكلي العقلي",
    "en": "Intellectual universal",
    "explanation": "The compound of a nature and the attribution of universality, e.g. human-as-universal, present as such in the intellect.",
    "page": 49,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/49?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "وجود الطبيعي",
    "en": "Existence of the natural universal",
    "explanation": "The disputed claim that a common nature exists in individuals, not to be confused with the obviously existing individuals; al-Yazdī adds a reservation.",
    "page": 49,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/49?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "المعرِّف",
    "en": "Defining expression",
    "explanation": "What brings about conception of a definable thing through an essential or distinguishing account; normally should be coextensive and better known.",
    "page": 50,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/50?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "المعرَّف",
    "en": "Object to be defined",
    "explanation": "The definendum whose conception is sought, distinct from the defining expression; the original consonantal writing may be the same.",
    "page": 50,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/50?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "الحد التام",
    "en": "Complete essential definition",
    "explanation": "An essential account employing the proximate genus and appropriate proximate differentia.",
    "page": 50,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/50?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "الحد الناقص",
    "en": "Incomplete essential definition",
    "explanation": "An essential distinguishing account without the proximate genus, e.g. with the differentia alone or a remote genus.",
    "page": 50,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/50?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "الرسم التام",
    "en": "Complete descriptive definition",
    "explanation": "An account employing a property and the proximate genus rather than a strictly essential differentia alone.",
    "page": 50,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/50?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "الرسم الناقص",
    "en": "Incomplete descriptive definition",
    "explanation": "An accidental distinguishing account that does not contain the proximate genus.",
    "page": 50,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/50?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "التعريف اللفظي",
    "en": "Lexical explanation",
    "explanation": "An indication of which already-known meaning a word designates, not scientific acquisition of an entirely unknown essence.",
    "page": 51,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/51?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "القول المعقول",
    "en": "Mental proposition / mental composite",
    "explanation": "The conceptual composite to which the logical definition of proposition applies even without verbal utterance.",
    "page": 54,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/54?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "الرابطة",
    "en": "Copula / predicative relation",
    "explanation": "Strictly the predicative relation; by transferred naming also its verbal signifier in a spoken proposition.",
    "page": 56,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/56?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "الرابطة الزمانية",
    "en": "Temporal copula",
    "explanation": "A copula indicating a predicative relation situated in one of the three times.",
    "page": 56,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/56?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "الرابطة غير الزمانية",
    "en": "Nontemporal copula",
    "explanation": "A copula without time specification; the text reports al-Fārābī's account of Arabic huwa/hiya used for this purpose.",
    "page": 56,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/56?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "السور",
    "en": "Quantifier",
    "explanation": "A word specifying whether a categorical predication concerns every or some instances of the subject.",
    "page": 57,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/57?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "المهملة",
    "en": "Indefinite proposition",
    "explanation": "A categorical judgment without explicit quantity; classical treatment associates it with the particular under assumptions about instances.",
    "page": 58,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/58?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "القضية الخارجية",
    "en": "Externally actual categorical proposition",
    "explanation": "An affirmative categorical predication whose subject is considered among actual external instances.",
    "page": 58,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/58?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "القضية الحقيقية",
    "en": "Suppositional categorical proposition",
    "explanation": "A predication concerning everything that would qualify as a subject if externally existent, restricted in this account to possible individuals.",
    "page": 58,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/58?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  },
  {
    "ar": "القضية الذهنية",
    "en": "Mental categorical proposition",
    "explanation": "A predication of a concept as framed in the intellect, as in a judgement about the impossibility of an imagined partner to God.",
    "page": 58,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/58?lang=ar",
    "sourceLayer": "Qum printed main al-Yazdī commentary, searchable digital transcription; no independent photo/manuscript collation"
  }
];
/* Homographs can have distinct technical senses. In particular المعرف without
 * vowels can be muʿarrif (defining expression) or muʿarraf (definiendum).
 * Deduplicate by Arabic headword AND English sense, not vowelless Arabic alone. */
const modalConditionalTerms=[
  {
    "ar": "معدولة الموضوع",
    "en": "Infinite-negated subject",
    "explanation": "Negation incorporated within the subject term, not a denial of the whole predicative relation.",
    "page": 59,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/59?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "معدولة المحمول",
    "en": "Infinite-negated predicate",
    "explanation": "Negation incorporated within the predicate term while the quality of the assertion may remain affirmative.",
    "page": 59,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/59?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "محصلة",
    "en": "Simple-term proposition",
    "explanation": "A proposition whose subject and predicate do not contain negation as a term component.",
    "page": 59,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/59?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "مادة القضية",
    "en": "Matter of a proposition",
    "explanation": "The modal status—necessity, permanence, impossibility, etc.—actually obtaining for the relation independently of how the assertion describes it.",
    "page": 59,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/59?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "جهة القضية",
    "en": "Stated modality",
    "explanation": "The spoken or mentally represented characterization of the modal quality of a proposition; it may agree or disagree with its actual matter.",
    "page": 59,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/59?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "الموجهة",
    "en": "Modalized proposition",
    "explanation": "A proposition expressly specifying a modality of its affirmative or negative predicative relation.",
    "page": 59,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/59?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "الضرورية المطلقة",
    "en": "Unrestricted necessary proposition",
    "explanation": "Necessity of the relation as long as the subject exists as such, not restricted by a descriptive attribute or specified time.",
    "page": 60,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/60?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "المشروطة العامة",
    "en": "General description-conditioned necessity",
    "explanation": "Necessary predication while the subject bears a specified title/description; not necessarily throughout the subject's existence.",
    "page": 60,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/60?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "الوقتية المطلقة",
    "en": "Unrestricted time-specific necessity",
    "explanation": "Necessity obtaining at a specified time without an additional nonpermanence qualification.",
    "page": 60,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/60?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "المنتشرة المطلقة",
    "en": "Unrestricted dispersed-time necessity",
    "explanation": "Necessary predication at an unspecified time, without the additional nonpermanence qualification.",
    "page": 60,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/60?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "الدائمة المطلقة",
    "en": "Unrestricted permanence",
    "explanation": "A relation that does not in fact separate from the subject throughout its existence, without a claim that separation is intrinsically impossible.",
    "page": 60,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/60?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "العرفية العامة",
    "en": "General customary permanence",
    "explanation": "A relation persisting as long as the subject bears the named description, by ordinary usage.",
    "page": 60,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/60?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "المطلقة العامة",
    "en": "General actual proposition",
    "explanation": "An affirmative or negative relation obtaining actually at some time, without express necessity or permanence.",
    "page": 61,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/61?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "الممكنة العامة",
    "en": "General possible proposition",
    "explanation": "The necessity of the opposite relation is denied; this is not necessarily the bilateral openness of special possibility.",
    "page": 61,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/61?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "القضية المركبة",
    "en": "Composite modal proposition",
    "explanation": "One main affirmative or negative judgment qualified by an implicit opposing judgment, commonly using nonpermanence or nonnecessity.",
    "page": 61,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/61?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "اللادوام الذاتي",
    "en": "Intrinsic nonpermanence",
    "explanation": "Denial that the relation lasts for the whole existence of the subject; its contradictory obtains at some time.",
    "page": 62,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/62?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "المشروطة الخاصة",
    "en": "Special description-conditioned necessity",
    "explanation": "Necessity while the named description is present, together with nonpermanence over the subject's existence as such.",
    "page": 62,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/62?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "العرفية الخاصة",
    "en": "Special customary permanence",
    "explanation": "Description-conditioned permanence combined with intrinsic nonpermanence.",
    "page": 62,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/62?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "اللاضرورة الذاتية",
    "en": "Intrinsic nonnecessity",
    "explanation": "Denial that the relation is necessary throughout the subject's existence, implying possibility of its contrary.",
    "page": 62,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/62?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "الوجودية اللاضرورية",
    "en": "Existential nonnecessary proposition",
    "explanation": "General actual predication conjoined with denial of intrinsic necessity.",
    "page": 63,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/63?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "الوجودية اللادائمة",
    "en": "Existential nonpermanent proposition",
    "explanation": "General actual predication conjoined with denial of intrinsic permanence.",
    "page": 63,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/63?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "الممكنة الخاصة",
    "en": "Special possible proposition",
    "explanation": "Both the affirmed relation and its contrary are possible, composed of two differently qualified general-possibility judgments.",
    "page": 64,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/64?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "المركبات المعتبرة",
    "en": "Recognized composite modals",
    "explanation": "Seven named composite propositions accepted by this historical modal taxonomy, distinct from further coherent but unrecognized combinations.",
    "page": 64,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/64?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "اللزومية",
    "en": "Relationally necessary conditional",
    "explanation": "A connected conditional whose link between antecedent and consequent is grounded in a relation, rather than accidental conjunction.",
    "page": 65,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/65?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "الاتفاقية",
    "en": "Accidental conditional",
    "explanation": "A conditional connection or disjunctive opposition treated as dependent on the particular matter rather than a connection intrinsic to the alternatives.",
    "page": 65,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/65?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "مانعة الجمع",
    "en": "Truth-excluding disjunction",
    "explanation": "A disjunction in which the alternatives cannot both be true, though their being false together may be permitted or left unexamined.",
    "page": 67,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/67?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "مانعة الخلو",
    "en": "Falsity-excluding disjunction",
    "explanation": "A disjunction in which the alternatives cannot both be false; their simultaneous truth may be permitted or left unexamined.",
    "page": 67,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/67?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "المنفصلة الحقيقية",
    "en": "Genuine disjunction",
    "explanation": "A disjunction excluding both joint truth and joint falsity, as in the even/odd distinction in its traditional setting.",
    "page": 66,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/66?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "العنادية",
    "en": "Intrinsic opposition",
    "explanation": "The incompatibility of conditional alternatives arising from their meanings rather than the accidental matter of their application.",
    "page": 67,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/67?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "تقادير المقدم",
    "en": "Antecedent suppositions",
    "explanation": "The possible situations or assumptions under which a conditional antecedent is considered when determining the conditional's quantity.",
    "page": 68,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/68?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "سور الشرطية",
    "en": "Conditional quantifier",
    "explanation": "A word such as kullamā, qad yakūn or laysa al-batta that specifies how broadly the conditional connection is asserted or denied.",
    "page": 68,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/68?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  },
  {
    "ar": "طرفا الشرطية",
    "en": "Components of a conditional",
    "explanation": "Antecedent and consequent, each originally a categorical or conditional proposition before incorporation under a connective.",
    "page": 69,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/69?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī main Qum searchable شرح Q59–69; digital transcription only, page photography/manuscripts uncollated"
  }
];
const contradictionConversionTerms=[
  {
    "ar": "التناقض",
    "en": "Contradiction",
    "explanation": "Two propositions stand in contradiction when truth of either necessitates falsity of the other and falsity of either necessitates truth of the other.",
    "page": 70,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/70?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "الوحدات الثمان",
    "en": "Eight unities of contradiction",
    "explanation": "Identity of subject, predicate, place, condition, relation, part/whole, potency/act and time, as quoted in a Persian mnemonic.",
    "page": 71,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/71?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "نقيض صريح",
    "en": "Explicit contradictory",
    "explanation": "Direct removal of the assertion, contrasted with a proposition that only follows from that removal.",
    "page": 71,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/71?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "نقيض المركبة",
    "en": "Contradictory of a compound",
    "explanation": "An inclusive alternative of the negations of its component assertions; for a particular compound the alternatives apply to every instance.",
    "page": 72,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/72?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "منع الخلو",
    "en": "Exclusion of joint falsity",
    "explanation": "At least one of the two propositions must hold, while both may hold; used to negate a compound conjunction.",
    "page": 72,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/72?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "مرددة المحمول",
    "en": "Alternated predicate",
    "explanation": "A categorical proposition whose predicate is disjunctively presented for each individual, relevant to negation of a particular compound.",
    "page": 73,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/73?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "العكس المستوي",
    "en": "Simple conversion",
    "explanation": "Transposition of two terms while preserving inferential truth and affirmative/negative quality, with quantified and modal restrictions.",
    "page": 74,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/74?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "بقاء الصدق",
    "en": "Preservation of truth",
    "explanation": "If the original proposition is supposed true, its converted result must be true; actual truth of both is not required.",
    "page": 74,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/74?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "الصدق اللازم",
    "en": "Truth by necessary consequence",
    "explanation": "Validity of a conversion in virtue of the form, not merely coincidental truth in one subject matter.",
    "page": 75,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/75?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "دليل الخلف",
    "en": "Proof by reductio",
    "explanation": "Assume the proposed conversion false and combine its contradictory with the original to derive a self-negating or impossible conclusion.",
    "page": 76,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/76?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "الموضوع بالإمكان",
    "en": "Possibly instantiated subject",
    "explanation": "On the Farabian interpretation, a subject description can be predicated possibly rather than only of actual instantiations.",
    "page": 77,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/77?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "الموضوع بالفعل",
    "en": "Actually instantiated subject",
    "explanation": "On the Avicennan interpretation, actual applicability of a subject description is required; merely possible predication does not supply an actual converted subject.",
    "page": 78,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/78?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "انعكاس المجموع",
    "en": "Conversion of the compound as a whole",
    "explanation": "Whether a compound proposition converts cannot always be inferred from convertibility of each constituent taken alone; Yazdī adds a reservation.",
    "page": 79,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/79?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "دليل النقض",
    "en": "Counterexample",
    "explanation": "Exhibit a matter in which an original proposition is true but its proposed conversion false, defeating a universally asserted inference.",
    "page": 80,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/80?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "عكس النقيض",
    "en": "Contraposition",
    "explanation": "A transposition involving contradictory terms; older and later treatments differ in how terms and affirmative/negative quality are altered.",
    "page": 81,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/81?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "طريقة القدماء",
    "en": "Earlier method of contraposition",
    "explanation": "Interchange the contradictories of both original terms while preserving affirmative or negative quality.",
    "page": 81,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/81?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "طريقة المتأخرين",
    "en": "Later method of contraposition",
    "explanation": "Bring the contradictory of the second term into first position, retain the first term second and reverse affirmative/negative quality.",
    "page": 81,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/81?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "دليل الافتراض",
    "en": "Proof by assumed witness",
    "explanation": "Introduce a particular individual D and establish both aspects of a special modal conversion by tracking it across different descriptive intervals.",
    "page": 83,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/83?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "الوصف العنواني",
    "en": "Description under which the subject is considered",
    "explanation": "The defining subject-description whose presence may temporally condition a modal judgment.",
    "page": 83,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/83?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  },
  {
    "ar": "لا دوام العكس",
    "en": "Nonpermanence of the conversion",
    "explanation": "An additional condition in special modal conversions requiring a counter-time to the original relation.",
    "page": 83,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/83?lang=ar",
    "sourceLayer": "Mullā ʿAbd Allāh al-Yazdī Qum pp.70–84 main شرح; digital print transcribed, photos and manuscripts not collated"
  }
];
const syllogismTerms=[
  {
    "ar": "القياس",
    "en": "Syllogism",
    "explanation": "A structured composite of propositions whose necessary conclusion follows from that arrangement itself, not by adding an external premise.",
    "page": 86,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/86?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "القول المؤلف",
    "en": "Composed discourse",
    "explanation": "A meaningful ordered arrangement, not simply a plurality of expressions; it points to the formal constituent of an argument.",
    "page": 86,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/86?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "الجزء الصوري",
    "en": "Formal constituent",
    "explanation": "The inferential arrangement or figure of a proof, as distinct from the propositional matter it organizes.",
    "page": 86,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/86?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "لذاته",
    "en": "Through itself",
    "explanation": "The result follows by virtue of the premises' own arrangement rather than from an additional principle external to them.",
    "page": 87,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/87?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "قياس المساواة",
    "en": "Syllogism of equality",
    "explanation": "An inference from A=B and B=C to A=C requiring, in this source analysis, an explicit extra transitivity premise.",
    "page": 87,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/87?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "المقدمة الخارجية",
    "en": "External premise",
    "explanation": "A principle not included in the displayed premises but required for the conclusion to follow, excluding a strict intrinsic syllogism.",
    "page": 87,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/87?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "النتيجة",
    "en": "Conclusion",
    "explanation": "The proposition necessarily resulting from a properly organized syllogism.",
    "page": 87,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/87?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "الاقتراني",
    "en": "Conjunctive syllogism",
    "explanation": "An argument whose consequent material occurs in the premises but not in the complete form of the final conclusion.",
    "page": 87,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/87?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "الاستثنائي",
    "en": "Exceptive syllogism",
    "explanation": "An argument expressly containing the conclusion or its contradictory in a premise component introduced by an exceptive marker such as lākinn.",
    "page": 87,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/87?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "الأصغر",
    "en": "Minor term",
    "explanation": "The term that becomes subject of the conclusion in a categorical syllogism; typically narrower in extension.",
    "page": 88,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/88?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "الأكبر",
    "en": "Major term",
    "explanation": "The term that becomes predicate of the conclusion; typically wider in extension.",
    "page": 88,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/88?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "الأوسط",
    "en": "Middle term",
    "explanation": "The recurring term through which the two premises are linked and which is absent from the conclusion.",
    "page": 88,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/88?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "الشكل الأول",
    "en": "First syllogistic figure",
    "explanation": "The figure regarded as directly evident and used to establish productivity of the other figures.",
    "page": 89,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/89?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "فعلية الصغرى",
    "en": "Actuality of the minor premise",
    "explanation": "The requirement that the minor actually fall under the middle term before the major predicate is transmitted to it.",
    "page": 90,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/90?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "كلية الكبرى",
    "en": "Universality of the major premise",
    "explanation": "A condition of productive first-figure and second-figure syllogisms, preventing the reasoning from using only an unrelated subset of the middle.",
    "page": 90,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/90?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "اختلاف المقدمتين في الكيف",
    "en": "Opposite premise qualities",
    "explanation": "In the second figure one premise must affirm and the other deny; same-quality pairs can have conflicting results in different matters.",
    "page": 92,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/92?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "رد الشكل الثاني",
    "en": "Reduction of the second figure",
    "explanation": "The second figure is validated via reductio, conversion of its major, or conversion of minor and rearrangement, subject to mood restrictions.",
    "page": 94,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/94?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  },
  {
    "ar": "الشكل الثالث",
    "en": "Third syllogistic figure",
    "explanation": "A syllogistic figure where an actual affirmative minor and at least one universal premise are required for the shared middle to transmit predicates.",
    "page": 94,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/94?lang=ar",
    "sourceLayer": "Yazdī main شرح Qum 86–94, printed searchable transcription; not manuscript or photographic verified"
  }
];
const scienceAndMethodTerms=[
  {
    "ar": "الضابطة",
    "en": "General productivity criterion",
    "explanation": "A rule intended to encompass the conditions under which categorical syllogisms of the various figures produce a conclusion.",
    "page": 98,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/98?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "عموم موضوعية الأوسط",
    "en": "Universal subjecthood of the middle",
    "explanation": "One alternative in the general condition: the middle term serves as subject of a universal premise and is linked actually to the other extreme.",
    "page": 99,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/99?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "منافاة النسبتين",
    "en": "Modal incompatibility of two relations",
    "explanation": "For certain second-figure moods, the modal relations involving the shared middle must be unable to hold together under the same relevant respect.",
    "page": 100,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/100?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "تفردت به",
    "en": "Claim of an original investigation",
    "explanation": "Al-Yazdī describes the new formulation of modal second-figure incompatibility as his own contribution; historical priority remains to be investigated.",
    "page": 101,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/101?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "القياس الشرطي الاقتراني",
    "en": "Conditional conjunctive syllogism",
    "explanation": "A syllogism joining conditional and/or categorical components whose conclusion's form is produced rather than stated in a premise.",
    "page": 102,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/102?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "القياس الاستثنائي",
    "en": "Exceptive syllogism",
    "explanation": "An inference using a conditional or disjunction and a categorical exception that affirms or denies one of its parts.",
    "page": 103,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/103?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "رفع التالي",
    "en": "Denying the consequent",
    "explanation": "A productive exception for relation-grounded connected conditionals, entailing denial of antecedent; unlike affirming consequent.",
    "page": 103,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/103?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "وضع المقدم",
    "en": "Affirming the antecedent",
    "explanation": "A productive exception in connected conditionals, establishing the consequent from the antecedent.",
    "page": 103,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/103?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "السبر والتقسيم",
    "en": "Elimination of causal candidates",
    "explanation": "The legal-theoretic method of listing possible explanatory attributes and excluding alternatives to identify a cause.",
    "page": 108,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/108?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "الاستقراء التام",
    "en": "Complete induction",
    "explanation": "Examination of all relevant particulars, reducible to an exhaustive division and capable of certainty.",
    "page": 106,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/106?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "الاستقراء الناقص",
    "en": "Incomplete induction",
    "explanation": "Examination of some but not all particulars; cannot by itself necessitate an unrestricted universal conclusion.",
    "page": 106,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/106?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "واسطة في الإثبات",
    "en": "Middle as a cause of knowing",
    "explanation": "The syllogistic middle mediating assent to the conclusion, even when not an external cause of the relation known.",
    "page": 112,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/112?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "واسطة في الثبوت",
    "en": "Middle as a real cause",
    "explanation": "The middle that also explains why the predicative relation exists outside thought, central to demonstration of why.",
    "page": 112,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/112?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "البرهان اللمي",
    "en": "Demonstration of why",
    "explanation": "An inference whose middle both mediates knowledge and causes the relation in reality.",
    "page": 112,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/112?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "البرهان الإني",
    "en": "Demonstration that",
    "explanation": "An inference establishing that a fact obtains without identifying in its middle the extramental cause of the fact.",
    "page": 112,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/112?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "أجزاء العلوم",
    "en": "Components of a science",
    "explanation": "The subject, the propositions investigated, and the conceptual/propositional principles upon which investigation depends.",
    "page": 114,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/114?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "مبادئ تصورية",
    "en": "Conceptual principles",
    "explanation": "Definitions or accounts of the terms needed in the questions of a science.",
    "page": 114,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/114?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "مبادئ تصديقية",
    "en": "Propositional principles",
    "explanation": "Truth-claims used as premises of demonstrative syllogisms within a science.",
    "page": 114,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/114?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "أصول موضوعة",
    "en": "Postulates granted to a teacher",
    "explanation": "Premises provisionally accepted on confidence in instruction, as distinguished from the same premises received reluctantly as demanded concessions.",
    "page": 116,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/116?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "مصادرات",
    "en": "Premises demanded for argument",
    "explanation": "Borrowed premises accepted despite doubt or opposition; their status can vary with the student.",
    "page": 116,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/116?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "الأعراض الذاتية",
    "en": "Proper accidents",
    "explanation": "Predicate properties appropriate to the science's subject considered as what it is; their scope and mediation are disputed.",
    "page": 118,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/118?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "الرؤوس الثمانية",
    "en": "Eight preliminary headings",
    "explanation": "A discipline’s purpose, benefit, name, compiler, disciplinary kind, rank, division and educational methods.",
    "page": 119,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/119?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "الغرض والعلة الغائية",
    "en": "Intended final cause",
    "explanation": "A result that motivates an agent’s action, distinguished from benefits that happen to follow without motivating it.",
    "page": 119,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/119?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "الأنحاء التعليمية",
    "en": "General educational methods",
    "explanation": "Methods of dividing, analyzing, defining and demonstrating applicable across scientific disciplines.",
    "page": 121,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/121?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "التحليل",
    "en": "Analysis of an inference",
    "explanation": "Working backward through an existing argument to identify hidden premises, middle terms and syllogistic figure.",
    "page": 122,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/122?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "التقسيم",
    "en": "Construction by dividing/searching",
    "explanation": "Seeking a demonstrative arrangement from a proposed conclusion by discovering suitable middle terms and premiss relations.",
    "page": 122,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/122?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  },
  {
    "ar": "التحديد",
    "en": "Formulation of a definition",
    "explanation": "Separating essential from accidental predicates, finding genus/differentia or characteristic property and assembling an adequate defining account.",
    "page": 123,
    "sourceUrl": "https://ablibrary.net/book_content/b/12170/123?lang=ar",
    "sourceLayer": "Yazdī main Qum شرح 95–123: working digital transcription; physical photo and manuscript readings not certified"
  }
];
const lemmaKey=t=>prior.norm(t.ar)+' ⟐ '+t.en.toLocaleLowerCase();
const seen=new Set(prior.terms.map(lemmaKey));
const terms=prior.terms.slice();
for(const term of [...extra,...supplementary,...universals,...speciesTerms,...logicalUniversalsAndPropositions,...modalConditionalTerms,...contradictionConversionTerms,...syllogismTerms,...scienceAndMethodTerms]){
 const key=lemmaKey(term);
 if(!seen.has(key)){terms.push(term);seen.add(key)}
}
window.GNAMMA_TAHDHIB_GLOSSARY=Object.freeze({...prior,terms,version:'logic-plus-yazdi-science-v9',historicallyCollated:false});
})();
