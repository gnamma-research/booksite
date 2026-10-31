/* Consecutive running commentary: Taqrīb I:8–12, PDF pp. 21–25.
The underlying source distinguishes Sanandajī’s large-type text from later marginalia. */
(()=>{
"use strict";
const records=[{"id":"S.021","page":8,"pdf":21,"title":"Knowledge, inquiry and proof as the introduction to kalām","english":"The general discussion of kalām opens with knowledge, rational consideration and evidence. Acquiring doctrines by rational investigation and inference depends upon these subjects, as does answering those who deny that knowledge is obtained at all, or that inquiry yields knowledge either generally or in divine matters particularly. He begins with them in keeping with the rule that a discipline begins with what it requires as a preliminary. Hence the words, ‘Kalām is knowledge of doctrines’: doctrines are judgments whose intended end is that they simply be assented to in the heart. But judgments whose intended end is practical performance, even where assent to them is also intended—","note":"Kalām and jurisprudence are differentiated primarily by the end to which their respective inquiries are directed, not by the impossibility of either discipline making use of truths considered in the other."},{"id":"S.022","page":9,"pdf":22,"title":"The distinction from jurisprudence and the qualification ‘religious’","english":"—are studied in jurisprudence. By ‘religious’ he means doctrines ascribed to the religion of our Prophet Muḥammad, blessings and peace be upon him, whether considered through the revealed Law or the truth of reality, and whether truly part of the religion, as in what he calls the discourse of the people of truth, or only claimed to be so, as in the discourse of errant innovative sects. So it is stated in the Sharḥ al-Maqāṣid. But if ‘knowledge’ is taken to mean assent as such, whether it corresponds to reality or not, so that mistaken apprehension is included, his phrase ‘from certain proofs’—that is, [knowledge] acquired—","note":"The qualification ‘religious’ identifies the kind of doctrinal claim being examined. It does not imply that every claim represented as religious is true."},{"id":"S.023","page":10,"pdf":23,"title":"Conclusive evidence, certainty and imitation","english":"—does not by itself demonstrate that what is intended is certain knowledge, because a certain proof yields certainty, unless what is meant by certain proofs is ‘those held certain by the person adducing them’. They stipulate certainty for doctrinal proofs, since conjecture has no authority in matters of doctrine as it can in practical matters. By the definition so delimited, God’s knowledge of the doctrines and the Messenger’s knowledge of them are excluded, as is the belief of one who simply imitates. Included, however, is—","note":"This is a restriction on the technical definition of demonstratively acquired theological knowledge. It does not imply that God or the Prophet lacks the knowledge of doctrine."},{"id":"S.024","page":11,"pdf":24,"title":"The Companions and the subject of the science","english":"—the knowledge of the Companions, even though at that time their knowledge was not called kalām, just as their knowledge of practical matters was jurisprudence though it was not given that name. [Al-Taftāzānī says:] ‘Its subject is the knowable insofar as it relates to that [aim].’","note":"The historical existence of knowledge is distinguished from the subsequent technical naming of a discipline. The quoted matn wording has been independently confirmed from the Cairo 1912 original."},{"id":"S.025","page":12,"pdf":25,"title":"The knowable, including questions of nonexistence","english":"That is, insofar as it concerns religious doctrines. For the discipline investigates the world with respect to origination, unity and other such conditions; bodies and accidents, their origination, the composition of indivisible substances and their susceptibility to annihilation; and nonexistents in respect of nonbeing and the question of whether positing them is required to affirm the multiplicity and existence of God’s attributes. These and similar matters constitute grounds and proofs for the theological propositions at issue. The subject encompassing such investigations is therefore the knowable, which extends to both what exists and what does not exist. It might also be argued that ‘the knowable’—","arabic":"أي بالعقائد الدينية، لأنه يبحث فيه عن أحوال العالم من القدم والوحدة وغيرها، وعن أحوال الجسم والعرض والحدوث والتركيب من الجواهر الفردة وقبول الفناء ونحو ذلك، وعن أحوال المعدومات من الانتفاء وعدم الاحتياج إليها في اعتقاد كون صفاته تعالى متعددة موجودة، إلى غير ذلك مما هي عمدة المسألة ودليل لها، والشامل لموضوعات هذه المسائل هو المعلوم المتناول للموجود والمعدوم، وقد يقال المعلوم...","note":"The possible object of knowledge is wider than the class of existing things. That fact alone does not settle the separate question whether a nonexistent possesses independently established thinghood."}];
const book=window.GNAMMA_BOOK,layer=window.GNAMMA_SANANDAJI_LAYER;
if(book?.id==="taqrib"){
 for(const r of records){
  let u=book.units.find(u=>u.id===r.id);
  if(!u){
   u={id:r.id};
   const idx=Math.max(0,book.units.findIndex(z=>z.id==="S.00")+1);
   book.units.splice(idx,0,u);
  }
  Object.assign(u,{title:r.title,english:r.english,
   arabic:r.arabic||u.arabic||"",
   notes:[{type:"Explanation",text:r.note}],
   statusText:"Taqrīb al-Marām I:"+r.page+" · PDF p. "+r.pdf+" · main commentary",
   link:"../../al-taftazani/tahdhib-al-kalam/#u-I-01",
   linkLabel:"Read the corresponding Tahdhīb passage"});
 }
 const staged=book.units.filter(u=>/^S\.02[1-5]$/.test(u.id)).sort((a,b)=>parseInt(a.id.split(".")[1])-parseInt(b.id.split(".")[1]));
 for(let i=book.units.length-1;i>=0;i--)if(/^S\.02[1-5]$/.test(book.units[i].id))book.units.splice(i,1);
 book.units.splice(Math.max(0,book.units.findIndex(u=>u.id==="S.00")+1),0,...staged);
}
if(layer){
 const target=(layer.units??={})["I.01"]??=([]);
 for(const r of records){
  const existing=target.find(z=>z.id===r.id);
  const u={id:r.id,title:r.title,arabic:r.arabic||existing?.arabic||"",english:r.english,
     citation:"Taqrīb al-Marām I:"+r.page+" · PDF p. "+r.pdf+" · running commentary",
     insights:[r.note]};
  if(existing)Object.assign(existing,u);else target.push(u);
 }
 const staged=target.filter(u=>/^S\.02[1-5]$/.test(u.id)).sort((a,b)=>parseInt(a.id.split(".")[1])-parseInt(b.id.split(".")[1]));
 for(let i=target.length-1;i>=0;i--)if(/^S\.02[1-5]$/.test(target[i].id))target.splice(i,1);
 target.unshift(...staged);
}
})();
