/* Shared Daruri mode picker, bound to this reader. */
(function(){'use strict';
let modeAPI=null,modePicker=null,modeOpener=null;
function closeModePicker(restoreFocus=false){
 if(!modePicker||modePicker.hidden)return;
 modePicker.hidden=true;
 if(restoreFocus&&modeOpener?.isConnected)modeOpener.focus({preventScroll:true});
 modeOpener?.setAttribute('aria-expanded','false');
}
function updateModePicker(){
 if(!modePicker||!modeAPI)return;
 const current=modeAPI.getMode();
 modePicker.querySelectorAll('[data-gn-reader-mode]').forEach(button=>
  button.setAttribute('aria-checked',String(button.dataset.gnReaderMode===current)));
 const checkbox=modePicker.querySelector('#gn-focus-apparatus-choice');
 if(checkbox)checkbox.checked=modeAPI.getApparatus();
}
function ensureModePicker(){
 if(modePicker)return modePicker;
 const picker=document.createElement('div');
 picker.id='gn-reading-mode-picker';picker.className='gn-reading-mode-picker';
 picker.setAttribute('role','dialog');picker.setAttribute('aria-label','Select reading mode');
 picker.hidden=true;
 picker.innerHTML='<div class="gn-mode-heading">Reading mode</div>'+
  '<div role="radiogroup" aria-label="Reading mode choices">'+
  '<button type="button" class="gn-mode-choice" role="radio" data-gn-reader-mode="reading"><span>Reading<small>Section and scholarly apparatus</small></span></button>'+
  '<button type="button" class="gn-mode-choice" role="radio" data-gn-reader-mode="focus"><span>Focus<small>One section, fewer distractions</small></span></button>'+
  '<button type="button" class="gn-mode-choice" role="radio" data-gn-reader-mode="continuous"><span>Continuous<small>Scroll through the whole text</small></span></button></div>'+
  '<label class="gn-mode-apparatus"><input type="checkbox" id="gn-focus-apparatus-choice"><span>In Focus, show apparatus below the text</span></label>'+
  '<div class="gn-mode-destinations"><button type="button" id="gn-mode-go-home" aria-label="Return to Home">Home</button></div>';
 document.body.append(picker);
 picker.addEventListener('click',event=>{
  const choice=event.target.closest('[data-gn-reader-mode]');if(!choice)return;
  event.preventDefault();modeAPI?.setMode(choice.dataset.gnReaderMode);closeModePicker(); 
 });
 picker.querySelector('#gn-mode-go-home')?.addEventListener('click',()=>{
  closeModePicker();
  const modes=window.GnammaReaderModes;
  if(modes?.setMode)modes.setMode('reading');
  const home=document.getElementById('gnTopHome');
  if(home)home.click();
  else location.hash='#home';
 });
 picker.querySelector('#gn-focus-apparatus-choice')?.addEventListener('change',event=>{
  modeAPI?.setApparatus(event.target.checked);updateModePicker();
 });
 document.addEventListener('pointerdown',event=>{
  if(picker.hidden)return;
  if(picker.contains(event.target)||event.target.closest('[data-focus-toggle]'))return;
  closeModePicker();
 });
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!picker.hidden){event.preventDefault();closeModePicker(true);}
 });
 modePicker=picker;return modePicker;
}
function attachModes(api){modeAPI=api;return {close:closeModePicker};}
function openModeMenu(opener){
 if(!modeAPI)return;
 const picker=ensureModePicker();
 if(!picker.hidden){closeModePicker(true);return;}
 modeOpener=opener?.closest?.('[data-focus-toggle]')||document.getElementById('focusToolbar');
 updateModePicker();picker.hidden=false;
 const rect=modeOpener?.getBoundingClientRect()||{left:10,right:56,bottom:56,top:10};
 const width=picker.offsetWidth||300,height=picker.offsetHeight||255;
 const left=Math.max(10,Math.min(window.innerWidth-width-10,rect.right-width/2));
 const below=rect.bottom+8;
 const top=below+height<window.innerHeight-10?below:Math.max(10,rect.top-height-8);
 picker.style.left=left+'px';picker.style.top=top+'px';
 modeOpener?.setAttribute('aria-expanded','true');
 picker.querySelector('[aria-checked="true"]')?.focus({preventScroll:true});
}
window.BahrModeMenu={attachModes,openModeMenu,closeModePicker};
})();
