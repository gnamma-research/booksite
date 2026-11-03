/* Tahdhīb source-linked thematic concordance.
 * Editorial keywords and locators, not an authorial index, historical dictionary,
 * or morphological engine. No text is modified. */
(function(){'use strict';
const book=window.GNAMMA_CRITICAL_CORPUS,api=window.GnammaTahdhibReader;
if(!book||!api)return;
const isLogic=api.isDivision;
const $=s=>document.querySelector(s);
const mk=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
const norm=s=>String(s||'').toLocaleLowerCase().normalize('NFD')
 .replace(/[\u064b-\u065f\u0670\u0640\u06d6-\u06ed]/g,'').normalize('NFC');
const groups=isLogic?[
 {name:'Foundations of logic · مبادئ المنطق',topics:[
  ['Conception and assent','التصور والتصديق',['التصور','التصديق','تصوري','تصديقي']],
  ['Expression and signification','دلالة الألفاظ',['الدلالة','دلالة اللفظ','مطابقة','تضمن','التزام']],
  ['Terms and composition','المفرد والمركب',['المفرد','المركب','اللفظ']],
  ['Universal and particular','الكلي والجزئي',['الكلي','الجزئي','الكليات']],
  ['The five universals','الكليات الخمس',['الجنس','النوع','الفصل','الخاصة','العرض العام']],
  ['Definition and description','الحد والرسم',['الحد','الرسم','المعرف']],
 ]},
 {name:'Judgement and inference · التصديقات والقياس',topics:[
  ['Categorical propositions','القضايا الحملية',['الحملية','الموضوع','المحمول']],
  ['Conditional propositions','القضايا الشرطية',['الشرطية','المتصلة','المنفصلة']],
  ['Modal judgement','جهات القضايا',['الضرورية','المشروطة','العرفية','الممكنة','الجهة']],
  ['Contradiction and opposition','التناقض',['التناقض','النقيض','التضاد']],
  ['Conversion and contraposition','العكس',['العكس المستوي','عكس النقيض','تنعكس']],
  ['Syllogism and figures','القياس والأشكال',['القياس','الشكل الأول','الشكل الثاني','الشكل الثالث','الشكل الرابع']],
  ['Induction and analogy','الاستقراء والتمثيل',['الاستقراء','التمثيل']],
  ['Demonstration and certainty','البرهان واليقين',['البرهان','اليقين','القطعيات','الضروريات']],
  ['Demonstrative sciences','أجزاء العلوم',['أجزاء العلوم','مبادئ','موضوعات']],
 ]}
]:[
 {name:'Knowledge and metaphysics · العلم والأمور العامة',topics:[
  ['Nature of knowledge','العلم والمعرفة',['العلم','المعرفة','الإدراك']],
  ['Rational inquiry and proof','النظر والدليل',['النظر','الدليل','الأمارة']],
  ['Assent, doubt, and certainty','التصديق واليقين',['التصديق','الشك','اليقين']],
  ['Existence and nonexistence','الوجود والعدم',['الوجود','المعدوم','العدم']],
  ['Quiddity and identity','الماهية والهوية',['الماهية','ماهية','التعين','الهوية']],
  ['Necessity, possibility and impossibility','الوجوب والإمكان والامتناع',['الوجوب','الإمكان','الامتناع']],
  ['Unity and multiplicity','الوحدة والكثرة',['الوحدة','الكثرة','التعدد']],
  ['Causality','العلة والمعلول',['العلة','المعلول','المؤثر','التسلسل']],
 ]},
 {name:'Natural philosophy · الأجسام والأعراض',topics:[
  ['Substance and accidents','الجوهر والعرض',['الجوهر','العرض','الأعراض']],
  ['Body, atom and extension','الجسم والجزء',['الجسم','الجزء','الحيز','الانقسام']],
  ['Space, place and void','المكان والخلاء',['المكان','الخلاء','المتمكن']],
  ['Time, movement and rest','الزمان والحركة',['الزمان','الوقت','الحركة','السكون']],
  ['Soul and perception','النفس والإدراك',['النفس','النفس الناطقة','الإدراك','الحواس']],
  ['Angels and jinn','الملائكة والجن',['الملائكة','الجن','الشياطين']],
 ]},
 {name:'Divinity and revelation · الإلهيات والنبوات',topics:[
  ['The Necessary Being','واجب الوجود',['الواجب','الصانع','واجب الوجود']],
  ['Divine essence and transcendence','ذات الله والتنزيه',['الذات','التنزيه','المخالفة','الصفات السلبية']],
  ['Divine knowledge','علم الله',['العلم القديم','علمه تعالى','العلام','المعلومات']],
  ['Divine power and will','القدرة والإرادة',['القدرة','الإرادة','الاختيار','التكوين']],
  ['Divine speech','الكلام الإلهي',['كلام الله','الكلام النفسي','القرآن']],
  ['Divine vision','رؤية الله',['الرؤية','رؤية الله','الأبصار']],
  ['Prophecy and messengers','النبوة والرسالة',['النبوة','النبي','الرسل','الرسول']],
  ['Miracles and evidence','المعجزات',['المعجزة','المعجزات','خرق العادة']],
  ['Law and abrogation','النسخ والشريعة',['النسخ','الشريعة','الشرع']],
 ]},
 {name:'Human destiny and community · السمعيات والإمامة',topics:[
  ['Resurrection and afterlife','المعاد والآخرة',['المعاد','الإعادة','الآخرة','البعث']],
  ['Reward and punishment','الثواب والعقاب',['الثواب','العقاب','الجنة','النار']],
  ['Faith and Islam','الإيمان والإسلام',['الإيمان','الإسلام','التصديق']],
  ['Repentance and obligations','التوبة والتكليف',['التوبة','الواجبات','التكليف']],
  ['Imamate and legitimacy','الإمامة والخلافة',['الإمامة','الإمام','الخلافة','الخليفة']],
  ['Companions and succession','الصحابة والخلفاء',['أبو بكر','عمر','علي','الصحابة']],
 ]}
];
const entries=groups.map(group=>({name:group.name,topics:group.topics.map(([en,ar,keys])=>{
 const phrases=keys.map(norm),hits=book.units.filter(u=>{
  const text=norm(u.ar)+' '+norm(u.en);
  return phrases.some(k=>k.length>2&&text.includes(k));
 });
 return {en,ar,keys,hits};
})}));
let overlay=null,returnFocus=null;
function label(u){return (isLogic?'Logic L':'Cairo p. ')+u.page+' · '+u.id}
function close(){if(overlay){overlay.hidden=true;returnFocus?.focus?.();returnFocus=null;}}
function open(trigger){
 if(!overlay)return;
 returnFocus=trigger||document.activeElement;
 overlay.replaceChildren();
 const sheet=mk('section','gn-subject-sheet');sheet.setAttribute('role','dialog');
 sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-labelledby','gn-subject-title');
 const head=mk('div','gn-subject-head');
 const title=mk('h2',null,'Tahdhīb · Subject index');title.id='gn-subject-title';
 const closer=mk('button','gn-subject-close','×');closer.title='Close subject index';closer.setAttribute('aria-label','Close subject index');closer.addEventListener('click',close);
 head.append(title,closer);
 const caveat=mk('p','gn-subject-warning','Provisional editorial keyword index. Matches are drawn from the exact Arabic–English working corpus; they are not authorial divisions, a grammar-checked morphology index, or theological judgements.');
 const row=mk('label','gn-subject-search');row.append(mk('span',null,'Find subject · English or Arabic'));
 const input=mk('input');input.type='search';input.id='gn-subject-query';
 input.placeholder='e.g. الإمامة · syllogism · essence';row.append(input);
 const results=mk('div','gn-subject-results');
 function draw(){
  results.replaceChildren();const q=norm(input.value.trim());
  let total=0;
  for(const group of entries){
   const topics=group.topics.filter(t=>!q||norm(t.en+' '+t.ar+' '+t.keys.join(' ')).includes(q));
   if(!topics.length)continue;
   results.append(mk('h3','gn-subject-group-title',group.name));
   for(const t of topics){
    total++;
    const item=mk('details','gn-subject-entry');
    const summary=mk('summary','gn-subject-topic');
    const main=mk('span','gn-subject-topic-text'),strong=mk('strong',null,t.en),ar=mk('span','gn-subject-ar',t.ar);
    ar.lang='ar';ar.dir='rtl';main.append(strong,ar);
    summary.append(main,mk('small',null,t.hits.length+' clauses'));
    item.append(summary);
    const body=mk('div','gn-subject-matches');
    if(!t.hits.length)body.append(mk('p','gn-subject-empty','No literal keyword matches. A related concept may still appear under another term.'));
    for(const u of t.hits.slice(0,55)){
     const button=mk('button','gn-subject-locator');
     button.type='button';button.title='Open source context for '+u.id;
     const citation=mk('span','gn-subject-source',label(u));
     const excerpt=mk('span','gn-subject-excerpt',u.en.slice(0,140));
     button.append(citation,excerpt);
     button.addEventListener('click',()=>{close();api.go(u.page,'u-'+u.id.replace(/[^a-zA-Z0-9-]/g,'-'))});
     body.append(button);
    }
    if(t.hits.length>55)body.append(mk('p','gn-subject-more','Showing 55 source-linked matches; use main search for all '+t.hits.length+' clauses.'));
    item.append(body);results.append(item);
   }
  }
  if(!total)results.append(mk('p','gn-subject-empty','No topic matches this term. Use the full text search for a literal Arabic or English occurrence.'));
 }
 input.addEventListener('input',draw);
 sheet.append(head,caveat,row,results);
 overlay.append(sheet);overlay.hidden=false;draw();input.focus();
}
function init(){
 const toolbar=$('#gn-experience-controls');if(!toolbar)return;
 const b=mk('button','toolbar-icon gn-subject-button','Topics');b.type='button';b.title='Open a source-linked thematic index';
 b.addEventListener('click',()=>open(b));toolbar.append(b);
 overlay=mk('div','gn-subject-overlay');overlay.id='gn-subject-overlay';overlay.hidden=true;
 overlay.addEventListener('click',e=>{if(e.target===overlay)close()});document.body.append(overlay);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)close()});
}
init();
window.GnammaTahdhibSubjectIndex={open,close,groups:entries,topicCount:entries.reduce((n,g)=>n+g.topics.length,0)};
})();