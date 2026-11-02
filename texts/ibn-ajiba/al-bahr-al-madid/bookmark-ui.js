/* One visual vocabulary for every Daruri bookmark target. */
(function(){
'use strict';
const ribbon='<path d="M6 3.5h12v17L12 16l-6 4.5Z"/>';
const plus='<path d="M12 8v5.3M9.35 10.65h5.3"/>';
const check='<path d="m9.35 10.65 2 2 3.7-4"/>';
function icon(options={}){
 const isSaved=Boolean(options.saved);
 const paragraph=options.kind==='paragraph';
 const svg='<svg class="gn-bm-ribbon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'+ribbon+(isSaved?check:plus)+'</svg>';
 return paragraph?'<span class="gn-bm-paragraph" aria-hidden="true">'+svg+'<span class="gn-bm-pilcrow">¶</span></span>':svg;
}
function actionLabel(target='reference',saved=false){
 const object=({section:'section',paragraph:'paragraph',quote:'highlight',footnote:'source note',dictionary:'dictionary entry',index:'subject index entry',application:'legal application',lesson:'study lesson'})[target]||target;
 return saved?'Remove '+object+' bookmark':'Bookmark '+object;
}
function noteIcon(){
 return '<svg class="gn-note-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3.6" y="3.5" width="16" height="17" rx="2"/><path d="M7 8h7M7 11h4"/><path d="m11.6 16.9 5.3-5.3 2 2-5.3 5.3-2.8.8zM15.9 12.6l2 2"/></svg>';
}
function highlightIcon(){
 return '<svg class="gn-highlight-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="m15 4 5 5M4 20l4-.5L20 7a3 3 0 0 0-4-4L4 15z"/></svg>';
}
window.GnammaBookmarkUI=Object.freeze({icon,actionLabel,highlightIcon,noteIcon});
})();
