/* Darūrī-style, exact-phrase primary-source anchors in the matn/sharḥ.
   Only identified quoted Arabic is linked. Paraphrases remain in the source list.
   Marking never rewrites any source words or creates a new translation. */
(function(){
'use strict';
const references=(window.GNAMMA_QAWAID_REFERENCES?.items||[]).filter(r=>r.inlineAnchors?.length);
const reading=document.getElementById('reading-list');
if(!reading||!references.length)return;
const MARKS=/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g;
function foldedWithPositions(str){
 let out='',starts=[],ends=[];
 for(let i=0;i<str.length;){
  const c=String.fromCodePoint(str.codePointAt(i)),start=i; i+=c.length;
  const f=c.normalize('NFD').replace(MARKS,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').toLowerCase();
  for(let j=0;j<f.length;j++){out+=f[j];starts.push(start);ends.push(i);}
 }
 return {text:out,starts,ends};
}
function wrap(node,phrase,source){
 const original=node.nodeValue;if(!original||original.length<phrase.length)return false;
 const mapped=foldedWithPositions(original),wanted=foldedWithPositions(phrase).text;
 if(!wanted||wanted.length<5)return false;
 const position=mapped.text.indexOf(wanted);if(position<0)return false;
 const a=mapped.starts[position],b=mapped.ends[position+wanted.length-1];
 if(a<0||b>original.length||b<=a)return false;
 const fragment=document.createDocumentFragment();
 fragment.appendChild(document.createTextNode(original.slice(0,a)));
 const button=document.createElement('button');
 button.type='button';button.className='gn-source-inline';button.dataset.openSource=source.id;
 button.textContent=original.slice(a,b);button.setAttribute('aria-label','Read source: '+source.title);
 button.title=source.title;fragment.appendChild(button);
 fragment.appendChild(document.createTextNode(original.slice(b)));
 node.replaceWith(fragment);return true;
}
function annotate(){
 for(const r of references){
  for(const id of r.units||[]){
   const section=document.getElementById(id);if(!section||!reading.contains(section))continue;
   for(const phrase of r.inlineAnchors){
    if(section.querySelector('.gn-source-inline[data-open-source="'+r.id+'"]'))break;
    for(const p of section.querySelectorAll('.ar p')){
     let linked=false;
     for(const node of [...p.childNodes])if(node.nodeType===Node.TEXT_NODE&&wrap(node,phrase,r)){linked=true;break;}
     if(linked)break;
    }
   }
  }
 }
}
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;annotate()});}
const observer=new MutationObserver(schedule);
observer.observe(reading,{childList:true});
schedule();
})();