/* Commentary main text: Taqrīb al-Marām, vol. I, printed pp. 8–11 (scan pp. 21–24).
   The larger running text is distinguished from the separate glosses beneath rules.
   The first and final paragraphs carry over between pages. */
(()=>{
"use strict";
const source="Taqrīb al-Marām · volume I, printed";
const items=[
{
  id:"S.021",title:"Theology begins with knowledge, inquiry and evidence",
  arabic:"الكلام عامة بمباحث العلم والنظر والدليل، لأن تحصيل العقائد بطريق النظر والاستدلال والرد على منكري حصول العلم مطلقا أو استفادته من النظر مطلقا أو في الإلهيات خاصة متوقف على ذلك. وبدأ بها رعاية للقاعدة في كل علم لتكون مقدمة الشروع، فقال: «الكلام هو العلم بالعقائد»، وهي الأحكام التي يتعلق الغرض بمجرد اعتقادها بالقلب، وأما التي يتعلق الغرض بعملها وإن كان",
  english:"Kalām opens with the general discussions of knowledge, rational consideration and proof. This is because acquiring doctrines through investigation and inference depends on them, as does answering those who deny that knowledge is attained at all, or deny that it can be derived from inquiry, either in general or specifically in divine matters. He begins with these discussions as the preliminary to the science, in keeping with the customary order of the sciences. He therefore says, ‘Kalām is knowledge of doctrines.’ These are judgments whose object is simply that they be assented to in the heart. As for judgments whose object is performance, even though assent to them may also be intended—",
  citation:"I:8 · PDF p. 21 · running commentary",
  insights:["The division between theology and jurisprudence is drawn primarily by the purpose of the judgment: believing a doctrine versus performing a ruling. The underlying truths need not occupy mutually exclusive subject matters."]
},
{
 id:"S.022",title:"Doctrinal assent and the qualification ‘religious’",
 arabic:"الاعتقاد فيها أيضا مقصودا فالعلم بها علم الفقه. والمراد بالعقائد «الدينية» المنسوبة إلى دين نبينا محمد صلى الله عليه وسلم، سواء بطريق الشريعة أو الحقيقة، وسواء كانت من الدين في الواقع ككلام أهل الحق أم لا ككلام الفرق المبتدعة الضالة، كذا في شرح المقاصد. فإذا كان المراد من العلم مطلق التصديق سواء طابق الواقع أم لا ليشمل إدراك الظني فلا يصح قوله «عن الأدلة اليقينية» أي المكتسب",
 english:"—the science dealing with them is jurisprudence. By ‘religious’ doctrines he means doctrines ascribed to the religion of our Prophet Muḥammad, whether by reference to revealed law or to the truth of the matter, and whether they truly belong to the religion, as do the teachings of those he calls the people of truth, or are merely professed as religious, as with the teachings of the sects he regards as erroneous. A corresponding explanation is found in the Sharḥ al-Maqāṣid. If ‘knowledge’ is taken to mean assent without qualification—whether it corresponds to reality or not, thereby including merely supposed or mistaken cognition—the further qualification ‘from conclusive proofs,’ that is, knowledge acquired—",
 citation:"I:9 · PDF p. 22 · running commentary",
 insights:["Calling an assertion ‘religious’ identifies the kind of issue under dispute; it does not imply that all doctrines advanced by disputants are true. The narrower meaning of ʿilm as certainty creates a deliberate tension with the broader meaning of taṣdīq as assent."]
},
{
 id:"S.023",title:"Why certain proof belongs in the definition",
 arabic:"ذلك العلم عن الأدلة على أن المراد منه العلم اليقيني، لأن الدليل اليقيني ما يفيد اليقين، إلا أن يقال المراد بالأدلة اليقينية بزعم المستدل. ثم إنهم اعتبروا في أدلتها اليقين لأنه لا عبرة بالظن في الاعتقادات خلافا للعمليات. تخرج عن التعريف علم الله وعلم الرسول بالاعتقادات وكذا اعتقاد المقلد، ويدخل",
 english:"—from those proofs, on the supposition that the intended knowledge is certain knowledge. For a conclusive proof is one that produces certainty. It may instead be said that the proofs are conclusive in the estimation of the person adducing them. Certainty is required in the proofs of doctrine because conjecture is not sufficient in doctrinal matters, in contrast to practical matters. Excluded from the formal definition are God's knowledge and the Messenger's knowledge of the doctrines, as well as the assent of a mere imitator; included, however—",
 citation:"I:10 · PDF p. 23 · running commentary",
 insights:["The exclusion concerns a technical definition of knowledge acquired from demonstrations: it does not deny that God or the Prophet knows the truths in question. The ‘proofs according to the investigator’ qualification also raises the distinction between genuine certainty and a person's claim to possess it."]
},
{
 id:"S.024",title:"Early knowledge and the subject of kalām",
 arabic:"علم الصحابة وإن لم يستدلوا في ذلك الزمان بالكلام كما أن علمهم بالعمليات فقه وإن لم يسموه به. «وموضوعه المعلوم من حيث يتعلق بذلك».",
 english:"—is the knowledge of the Companions, even though at that time they did not argue by means of the technical discipline later called kalām; similarly, their knowledge of practical matters was jurisprudence even though they did not call it by that name. [Al-Taftāzānī continues:] ‘Its subject is the knowable insofar as it bears upon that purpose.’",
 citation:"I:11 · PDF p. 24 · running commentary",
 insights:["The existence of a body of demonstrative practice is distinguished from the later stabilization of its disciplinary name. The term al-maʿlūm identifies what can be an object of knowledge, not only things already established to exist."]
}
];
const book=window.GNAMMA_BOOK;
if(book?.id==="taqrib"){
 const existing=new Set(book.units.map(u=>u.id));
 for(const x of items)if(!existing.has(x.id)){
   book.units.push({id:x.id,title:x.title,arabic:x.arabic,english:x.english,notes:x.insights.map(text=>({type:"Explanation",text})),link:"../../al-taftazani/tahdhib-al-kalam/#u-I-01",linkLabel:"Read the corresponding Tahdhīb passage"});
 }
}
const layer=window.GNAMMA_SANANDAJI_LAYER;
if(layer){const target=(layer.units??={});const group=(target["I.01"]??=[]);const seen=new Set(group.map(x=>x.id));for(const x of items)if(!seen.has(x.id))group.push(x);}
})();