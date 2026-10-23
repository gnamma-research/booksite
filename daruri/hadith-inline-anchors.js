
/* Hadith references within the reading text. Exact Arabic and English phrases
   are individually verified against edition-r3-20261020.js. An H is an
   editorial source marker, not a claim that Ibn Rushd quotes the full report. */
(()=>{
'use strict';
if(window.__gnHadithInlineInstalled)return;
window.__gnHadithInlineInstalled=true;
const ANCHORS=[["31",0,"في الوادي والحمام وأعطان الإبل","a valley, a bathhouse, or camels' resting places"],["49",2,"نهيت عن قتل المصلين","I have been forbidden to kill those who pray"],["64",0,"الأحرف السبعة المشهورة","the seven well-known aḥruf"],["64",2,"بأمر رسول الله","by the command of God's Messenger"],["82",1,"نضر الله امرأ سمع مقالتي","May God make radiant one who hears my words"],["82",2,"لا تزال طائفة من أمتي","A group of my community will continue"],["88",0,"رد عمر رضي الله عنه خبر فاطمة بنت قيس","ʿUmar's rejection—may God be pleased with him—of Fāṭima bt. Qays's report"],["89",0,"شهادة الأعرابي في رؤية الهلال","accepted a Bedouin's testimony that he had seen the crescent"],["112",0,"كحديث مس الذكر","the report concerning touching the penis"],["118",0,"فرضت أولا ركعتين ثم زيد فيها","two cycles were originally prescribed and further cycles were then added"],["119",0,"كنسخ ادخار لحوم الأضاحي","the abrogation concerning storing sacrificial meat"],["120",0,"تحريم الخمر ونكاح المتعة","prohibiting wine and temporary marriage"],["120",0,"ونسخ صوم عاشوراء بإيجاب رمضان","replacing the fast of ʿĀshūrāʾ with the obligation to fast Ramaḍān"],["121",1,"لا وصية لوارث","No bequest for an heir"],["121",2,"آية الرجم","the stoning verse"],["123",0,"بتحول أهل مسجد قباء إلى الكعبة","the people of the mosque at Qubāʾ turned toward the Kaʿba"],["124",1,"لا وصية لوارث","No bequest for an heir"],["124",1,"قد جعل الله لهن سبيلا","God has now appointed a way for them"],["126",1,"أجتهد رأيي عند عدم النص","I exercise my judgement"],["129",0,"كنت نهيتكم عن كذا فافعلوه","I used to forbid you such-and-such; now do it"],["131",2,"لا تجتمع أمتي على الخطأ","My community does not agree upon error"],["131",2,"لم يكن الله ليجمع أمتي على الخطأ","God would not bring my community into agreement upon error"],["131",2,"يد الله مع الجماعة","God’s hand is with the congregation"],["135",0,"لن تجتمع أمتي على الضلال","My community will not agree upon misguidance"],["171",0,"أيما امرأة نكحت بغير إذن وليها","Any woman who marries without her guardian’s permission"],["171",0,"فلها المهر","She is entitled to the dower"],["172",0,"لا صيام لمن لم يبيت الصيام","There is no fasting for someone who has not resolved upon the fast during the night"],["173",0,"فيما سقت السماء العشر وفيما سقي بالنضح نصف العشر","On what the sky waters, a tenth; on what is irrigated by drawing water, half a tenth"],["176",0,"خلق الله الماء طهورا لا ينجسه شيء","God created water as purifying; nothing renders it impure"],["189",0,"لا نكاح إلا بشاهدين","There is no marriage without two witnesses,’"],["189",0,"لا نكاح إلا بشاهدي عدل","There is no marriage without two witnesses of probity"],["191",3,"أدوا الخائط والمخيط","Hand over the thread and the needle"],["191",3,"دخول المسجد بريح الثوم","entering the mosque smelling of garlic"],["191",3,"الشرب بآنية الفضة","drinking from silver vessels"],["191",3,"بيع البر بالبر","wheat exchanged for wheat"],["194",1,"لا صيام لمن لم يبيت الصيام","There is no fast for one who has not resolved upon the fast overnight"],["194",1,"من أدرك ركعة من الصلاة فقد أدرك الصلاة","Whoever has caught one cycle of the prayer has caught the prayer"],["195",0,"في سائمة الغنم الزكاة","Zakāt is due on grazing sheep"],["195",1,"إنما الولاء لمن أعتق","The rights of clientage belong only to the emancipator"],["212",0,"إنها ليست بنجس لأنها من الطوافين عليكم أو الطوافات","[The cat] is not impure, because it is among those that circulate around you, male or female"],["212",1,"الشرب في آنية الفضة","drinking from silver vessels"],["215",0,"أدوا الخائط والمخيط","Hand over the thread and the needle"],["216",0,"من أعتق شركا له في عبد قوم عليه الباقي","Whoever emancipates his share in a slave must have the remainder assessed against him"],["218",1,"لا تبيعوا البر بالبر الأربعة المعلومة إلا هاء بهاء","Do not sell wheat for wheat—the four known commodities—except hand to hand"],["228",0,"صلوا كما رأيتموني أصلي","Pray as you have seen me pray"],["228",0,"وخذوا عني مناسككم","take your pilgrimage rites from me"],["229",1,"لخلعهم نعالهم في الصلاة لما خلع","removing their sandals in prayer when he removed his"],["229",1,"وتوقفهم عن الحلق عام الحديبية حتى حلق","refraining from shaving in the year of al-Ḥudaybiyya until he shaved"],["243",1,"رفع عن أمتي الخطأ والنسيان","Error and forgetfulness have been lifted from my community"],["246",1,"الغسل من الماء","ritual bathing because of the emission of fluid"],["246",1,"الغسل من التقاء الختانين","bathing because of the meeting of the circumcised parts"]];
const TASHKIL=/[\u064b-\u065f\u0670\u0640\u06d6-\u06ed]/;
const rowsBySection=new Map();
for(const [section,segment,arabic,english] of ANCHORS){
  if(!rowsBySection.has(section))rowsBySection.set(section,new Map());
  const groups=rowsBySection.get(section);
  if(!groups.has(segment))groups.set(segment,[]);
  groups.get(segment).push({arabic,english,id:'HAD-R'+section.padStart(3,'0')});
}
const hideSelectors='.note-ref-symbol,.gn-hadith-inline-marker,.gn-note-en-section-list,[aria-hidden="true"]';
function textIndex(root){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
    acceptNode(node){
      return node.parentElement?.closest(hideSelectors)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;
    }
  });
  let text='',node;const nodes=[];
  while((node=walker.nextNode())){
    if(!node.data)continue;
    nodes.push({node,start:text.length,end:text.length+node.length});
    text+=node.data;
  }
  return {text,nodes};
}
function marker(id,key){
  const a=document.createElement('a');
  a.className='note-ref-symbol gn-hadith-inline-marker';
  a.href='#notes';
  a.dataset.gnHadithInline=id;
  a.dataset.gnHadithKey=key;
  // The normal Notes route sets this marker as the focus return target.
  a.dataset.gnNotesOpen='';
  a.textContent='H';
  a.dir='ltr';
  a.title='Hadith source note '+id;
  a.setAttribute('aria-label','Open Hadith source note '+id);
  a.setAttribute('aria-haspopup','dialog');
  return a;
}
function insertNear(root,phrase,id,key,arabic){
  const {text,nodes}=textIndex(root);
  let search=text,needle=phrase,offsets=null;
  if(arabic){
    offsets=[];
    search='';
    for(let p=0;p<text.length;p++){
      if(TASHKIL.test(text[p]))continue;
      offsets.push(p);search+=text[p];
    }
    needle=[...phrase].filter(ch=>!TASHKIL.test(ch)).join('');
  }
  const at=search.indexOf(needle);
  if(at<0||search.indexOf(needle,at+needle.length)>=0)return false;
  let end=arabic?offsets[at+needle.length-1]+1:at+needle.length;
  if(arabic)while(end<text.length&&TASHKIL.test(text[end]))end++;
  const last=nodes.find(n=>n.start<end&&n.end>=end);
  if(!last||!last.node.isConnected)return false;
  const a=marker(id,key);
  // Keep dictionary, existing N-anchors and other links semantically independent.
  const interactive=last.node.parentElement?.closest(
    'a[href],button,[role="button"],[contenteditable="true"]');
  if(interactive){
    interactive.after(a);
  }else{
    const r=document.createRange();
    r.setStart(last.node,end-last.start);
    r.collapse(true);
    r.insertNode(a);
  }
  return true;
}
function activeSection(row,reader){
  const node=row.closest('[data-reading-section]');
  if(node?.dataset.readingSection)return String(node.dataset.readingSection);
  const text=reader.querySelector('.gn-section-number-ar-only')?.textContent||'';
  if(/colophon/i.test(text))return 'colophon';
  const m=text.match(/§\s*(\d+)/);
  if(m)return String(Number(m[1]));
  const found=location.hash.match(/(?:^#|&)section=([^&]+)/);
  if(found)try{return decodeURIComponent(found[1]);}catch(e){return found[1];}
  return null;
}
let scheduled=false;
function scan(){
  scheduled=false;
  const main=document.getElementById('mainContent');
  const reader=main?.querySelector('.reader');
  if(!reader)return;
  const grids=[...reader.querySelectorAll('.passage-grid')];
  for(let i=0;i<grids.length;i++){
    const row=grids[i],section=activeSection(row,reader);
    const segment=Number(row.dataset.segment??i);
    const items=rowsBySection.get(section)?.get(segment);
    if(!items?.length)continue;
    for(let j=0;j<items.length;j++){
      const record=items[j];
      for(const [cls,lang,phrase] of [
        ['.passage-ar','ar',record.arabic],
        ['.passage-en','en',record.english]
      ]){
        const root=row.querySelector(cls);
        if(!root)continue;
        const key=section+'-'+segment+'-'+j+'-'+lang;
        if(root.querySelector('[data-gn-hadith-key="'+key+'"]'))continue;
        insertNear(root,phrase,record.id,key,lang==='ar');
      }
    }
  }
}
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(scan);
}
function onMarkerClick(event){
  const target=event.target;
  if(!(target instanceof Element))return;
  const ref=target.closest('.gn-hadith-inline-marker');
  if(!ref)return;
  // The existing [data-gn-notes-open] click listener opens the section's Notes
  // card; move focus to this precise Hadith note after that listener runs.
  requestAnimationFrame(()=>{
    const layer=document.getElementById('gn-scholar-layer');
    const note=layer?.querySelector(
      '.gn-note-entry[data-note-id="'+ref.dataset.gnHadithInline+'"]');
    if(!note)return;
    note.tabIndex=-1;
    note.classList.add('gn-hadith-inline-selected');
    note.scrollIntoView({block:'nearest',behavior:'instant'});
    note.focus({preventScroll:true});
  });
}
function start(){
  const main=document.getElementById('mainContent');
  if(!main)return;
  new MutationObserver(schedule).observe(main,{childList:true,subtree:true});
  document.addEventListener('click',onMarkerClick);
  document.addEventListener('gnamma-reader-route-change',schedule);
  window.GnammaHadithInlineQA={notes:rowsBySection.size,anchors:ANCHORS.length};
  schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
