/* Tahdhīb introductory glossary.
 * These glosses are reader aids, not diplomatic Arabic or quotations
 * from al-Taftāzānī. Unlike Darūrī's historical lexicon, this compact
 * project-specific index has not been collated against a technical dictionary.
 */
(function(global){'use strict';
const terms=[
 ['العلم','Knowledge','A cognition; its strict definition and its varieties are contested in the source.'],
 ['المعلوم','The knowable','Whatever can be known; may include what is not externally existent, depending on the argument.'],
 ['التصور','Conception','An apprehension not by itself an assertion of a proposition.'],
 ['التصديق','Assent','Affirmation or denial of a predicative relation.'],
 ['النظر','Rational inquiry','Discursive consideration directed toward acquiring knowledge.'],
 ['الدليل','Proof or evidence','That by considering which a judgement may be reached.'],
 ['الحد','Definition','A formula specifying what a thing is; the technical conditions vary with context.'],
 ['البرهان','Demonstration','Syllogistic proof aimed at certain knowledge.'],
 ['القياس','Syllogism','A structured discourse from whose premises a conclusion follows.'],
 ['المقدمة','Premise','A proposition forming part of a syllogism.'],
 ['القضية','Proposition','A judgement admitting truth or falsity.'],
 ['العكس','Conversion','Exchange of the subject and predicate, subject to quantity and modal restrictions.'],
 ['التناقض','Contradiction','Opposition between propositions differing in truth conditions so that exactly one holds.'],
 ['الضرورة','Necessity','A modal specification; distinguish absolute from description-conditioned necessity.'],
 ['الدوام','Permanence','Continuance of predication; may concern the existence of the subject or the duration of a description.'],
 ['المشروطة','Conditional necessity','Necessity specified as holding while a subject bears its relevant description.'],
 ['العرفية','Customary permanence','Predication lasting as long as the subject bears its title, not necessarily for its entire existence.'],
 ['الإمكان','Possibility','A modality distinguished from actuality and from necessity or its denial.'],
 ['الوجود','Existence','Predication of being; mental, external and metaphysical senses must be distinguished.'],
 ['الماهية','Quiddity','What a thing is; not simply interchangeable with its existence.'],
 ['الواجب','Necessary being','That whose existence cannot fail; in theological contexts often the Necessary in itself.'],
 ['الممكن','Possible being','That whose essence does not of itself necessitate its existence.'],
 ['الجَوْهَر','Substance','That which subsists not in a subject, in the technical categorial sense.'],
 ['العَرَض','Accident','An item whose being is in a subject rather than self-subsistent.'],
 ['الحدوث','Origination','Coming to exist after not existing; related to temporal and causal debates.'],
 ['القدم','Eternity / beginninglessness','Being without temporal beginning; distinguish from necessity.'],
 ['العلة','Cause','That upon which an effect depends in a specified causal respect.'],
 ['المعلول','Effect','That whose existence depends on a cause.'],
 ['الإرادة','Will','The attribute or act of specification; a locus of disagreement in kalām.'],
 ['القدرة','Power','Capacity to act; divine and created power must be distinguished.'],
 ['التكليف','Religious responsibility','A normative charge or obligation attributed to an accountable agent.'],
 ['الإيمان','Faith','Assent and associated modalities of profession and acts debated in kalām.'],
 ['الإمامة','Imamate','Communal religious-political leadership and its disputed conditions.']
].map(([ar,en,explanation])=>({ar,en,explanation}));
const norm=s=>String(s||'').toLocaleLowerCase().normalize('NFD').replace(/[\u064b-\u065f\u0670\u0640\u06d6-\u06ed]/g,'').normalize('NFC');
global.GNAMMA_TAHDHIB_GLOSSARY=Object.freeze({terms,norm,version:'working-introductory-v1',historicallyCollated:false});
})(window);