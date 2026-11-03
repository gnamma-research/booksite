/* Tahdhīb reading history: private browser-local place trail.
 * Explicit link/search/dock jumps count as navigations, normal scroll does not.
 * Keeps distinct page/division and clause locations without editing source.
 */
(function(){'use strict';
const api=window.GnammaTahdhibReader,book=window.GNAMMA_CRITICAL_CORPUS;
if(!api||!book)return;
const isLogic=api.isDivision;
const storageKey='gnamma-tahdhib-recent-v1-'+(isLogic?'logic':'kalam');
const allPages=new Set(book.units.map(x=>x.page));
const unitIds=new Set(book.units.map(x=>'u-'+x.id.replace(/[^a-zA-Z0-9-]/g,'-')));
const $=selector=>document.querySelector(selector);
function load(){try{return JSON.parse(localStorage.getItem(storageKey)||'{}')}catch{return {}}}
function good(x){return x&&Number.isInteger(x.page)&&allPages.has(x.page)&&
                 (x.target===null||typeof x.target==='string'&&unitIds.has(x.target))}
const previous=load();
const state={
 back:Array.isArray(previous.back)?previous.back.filter(good).slice(-100):[],
 forward:Array.isArray(previous.forward)?previous.forward.filter(good).slice(-100):[],
 current:{page:api.getState().page,target:null},
 recent:Array.isArray(previous.recent)?previous.recent.filter(good).slice(0,60):[]
};
let ignore=false;
const same=(a,b)=>a&&b&&a.page===b.page&&a.target===b.target;
const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{}};
function ref(p){
 const base=isLogic?'L'+String(p.page).padStart(2,'0'):'Cairo p. '+p.page;
 return base+(p.target?' · '+p.target.replace(/^u-/,'').replaceAll('-', '.'):'');
}
function addRecent(item){
 state.recent=[item,...state.recent.filter(x=>!same(x,item))].slice(0,60);
}
let backButton,forwardButton,details,list;
function render(){
 if(!backButton)return;
 backButton.disabled=state.back.length===0;
 forwardButton.disabled=state.forward.length===0;
 backButton.title=state.back.length?'Back to '+ref(state.back.at(-1)):'No previous reading location';
 forwardButton.title=state.forward.length?'Forward to '+ref(state.forward.at(-1)):'No next reading location';
 if(list){
  list.replaceChildren();
  for(const [index,location] of state.recent.slice(0,25).entries()){
   const b=document.createElement('button');b.type='button';b.className='gn-trail-item';
   b.textContent=ref(location);b.dataset.trailIndex=index;
   b.title='Return to '+ref(location);
   b.addEventListener('click',()=>visit(location));
   list.append(b);
  }
  if(!state.recent.length){
   const p=document.createElement('p');p.className='gn-trail-empty';p.textContent='No saved reading locations yet.';list.append(p);
  }
 }
}
function navigate(point){
 ignore=true;
 try{api.go(point.page,point.target||undefined)}
 finally{ignore=false}
 render();save();
}
function move(direction){
 const source=direction==='back'?state.back:state.forward;
 const dest=source.pop();
 if(!dest)return;
 const reverse=direction==='back'?state.forward:state.back;
 reverse.push(state.current);
 state.current=dest;
 addRecent(dest);
 navigate(dest);
}
function visit(dest){
 if(!good(dest)||same(dest,state.current)){details.open=false;return}
 state.back.push(state.current);state.back=state.back.slice(-100);
 state.forward=[];
 state.current=dest;addRecent(dest);
 details.open=false;
 navigate(dest);
}
function attach(){
 const toolbar=$('#gn-experience-controls');if(!toolbar)return;
 const wrap=document.createElement('div');wrap.className='gn-trail-controls';
 backButton=document.createElement('button');backButton.type='button';
 backButton.className='toolbar-icon';backButton.textContent='↶ Back';backButton.setAttribute('aria-label','Back to previous reading location');
 backButton.addEventListener('click',()=>move('back'));
 forwardButton=document.createElement('button');forwardButton.type='button';
 forwardButton.className='toolbar-icon';forwardButton.textContent='Forward ↷';forwardButton.setAttribute('aria-label','Forward to next reading location');
 forwardButton.addEventListener('click',()=>move('forward'));
 details=document.createElement('details');details.className='gn-trail-picker';
 const summary=document.createElement('summary');summary.textContent='Recent';
 const panel=document.createElement('section');panel.className='gn-trail-sheet';
 const title=document.createElement('strong');title.textContent='Recent reading locations';
 list=document.createElement('div');list.className='gn-trail-list';
 const clear=document.createElement('button');clear.type='button';clear.className='gn-trail-clear';clear.textContent='Clear recent history';
 clear.addEventListener('click',()=>{state.back=[];state.forward=[];state.recent=[];save();render();details.open=false});
 panel.append(title,list,clear);details.append(summary,panel);
 wrap.append(backButton,forwardButton,details);toolbar.append(wrap);
 document.addEventListener('click',event=>{
  if(details.open&&!details.contains(event.target))details.open=false;
 });
 render();
}
document.addEventListener('gnamma-tahdhib-navigate',event=>{
 if(ignore)return;
 const data=event.detail||{};
 const p={page:Number(data.toPage),target:typeof data.target==='string'?data.target:null};
 if(!good(p)||same(p,state.current))return;
 state.back.push(state.current);
 state.back=state.back.slice(-100);
 state.forward=[];
 state.current=p;
 addRecent(p);
 save();render();
});
attach();
window.GnammaTahdhibTrail={
 back:()=>move('back'),forward:()=>move('forward'),visit,
 snapshot:()=>JSON.parse(JSON.stringify(state)),clear:()=>{state.back=[];state.forward=[];state.recent=[];save();render()}
};
})();