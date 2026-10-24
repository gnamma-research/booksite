/* Direct controls for the Daruri Visuals panel. The reader keeps ownership of
   persistence and layout state; this module presents the existing controls as
   icon/specimen buttons and reports the most recent choice in the panel header. */
(function(global){
  'use strict';
  const $=selector=>document.querySelector(selector);
  const $$=selector=>[...document.querySelectorAll(selector)];
  const styleLabels={quiet:'Quiet reading',book:'Book page',structured:'Structured page'};

  function open(){const panel=$('#settingsOverlay');return Boolean(panel&&!panel.hidden);}
  function clear(){
    const kind=$('#visualsInfoKind'),value=$('#visualsInfoValue');
    if(kind)kind.textContent='';
    if(value)value.textContent='';
  }
  function show(kind,value){
    if(!open())return;
    const k=$('#visualsInfoKind'),v=$('#visualsInfoValue');
    if(k)k.textContent=kind||'';
    if(v)v.textContent=value||'';
  }
  function press(attribute,value){
    $$('['+attribute+']').forEach(button=>{
      const active=button.dataset[attribute.replace(/^data-/,'').replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]===value;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
  }
  function sync(){
    const page=$('#pageStyleSelect'),arabic=$('#arabicFontChoice'),english=$('#englishFontChoice');
    if(page)press('data-page-style-choice',page.value);
    if(arabic)press('data-arabic-font-choice',arabic.value);
    if(english)press('data-english-font-choice',english.value);
  }
  function chooseSelect(id,value,kind,label){
    const select=$(id);
    if(!select)return;
    select.value=value;
    select.dispatchEvent(new Event('change',{bubbles:true}));
    sync();
    show(kind,label);
  }
  function installAppearance(){
    const panel=$('#settingsOverlay');
    const header=panel?.querySelector('.gn-visuals-header');
    if(!header||header.querySelector('#gn-visuals-appearance'))return;
    const row=document.createElement('div');
    row.id='gn-visuals-appearance';row.className='gn-visuals-appearance';
    // The reader already provides persistent System / Light / Dark buttons.
    // They were hidden in Visuals; move the *same live buttons*, not a second
    // theme state or a confusing cycle button in the crowded top toolbar.
    const existing=panel.querySelector('#settingsTheme')||panel.querySelector('.gn-colour-mode');
    if(existing){
      existing.hidden=false;
      existing.removeAttribute('aria-hidden');
      existing.classList.add('gn-colour-mode');
      existing.setAttribute('role','group');
      existing.setAttribute('aria-label','Appearance: system, light or dark');
      row.appendChild(existing);
    }else{
      // An older reader without an appearance registry retains a single
      // fallback instead of showing three inert controls.
      const button=document.createElement('button');
      button.type='button';button.className='gn-appearance-switch';
      button.textContent='Appearance';button.setAttribute('aria-label','Switch appearance');
      button.addEventListener('click',()=>document.getElementById('themeBtn')?.click());
      row.appendChild(button);
    }
    header.insertAdjacentElement('afterend',row);
  }
  function bind(){
    installAppearance();
    const overlay=$('#settingsOverlay');
    if(overlay){
      new MutationObserver(records=>{
        if(records.some(record=>record.attributeName==='hidden')&&!overlay.hidden){
          installAppearance();
          clear();
          requestAnimationFrame(sync);
        }
      }).observe(overlay,{attributes:true,attributeFilter:['hidden']});
    }
    document.addEventListener('click',event=>{
      const button=event.target.closest('button');
      if(!button)return;
      if(button.dataset.pageStyleChoice){
        chooseSelect('#pageStyleSelect',button.dataset.pageStyleChoice,'Page style',styleLabels[button.dataset.pageStyleChoice]||button.dataset.pageStyleChoice);
        return;
      }
      if(button.dataset.arabicFontChoice){
        chooseSelect('#arabicFontChoice',button.dataset.arabicFontChoice,'Arabic font',button.getAttribute('aria-label')||button.dataset.arabicFontChoice);
        return;
      }
      if(button.dataset.englishFontChoice){
        chooseSelect('#englishFontChoice',button.dataset.englishFontChoice,'English font',button.getAttribute('aria-label')||button.dataset.englishFontChoice);
        return;
      }
      if(button.id==='smallerType'||button.id==='largerType'){
        requestAnimationFrame(()=>show('Text size',$('#fontSizeLabel')?.textContent||''));
        return;
      }
      if(button.dataset.parallelSide){
        show('Page layout',button.dataset.parallelSide==='left'?'Arabic left':'Arabic right');
        return;
      }
      if(button.dataset.stackedOrder){
        show('Page layout',button.dataset.stackedOrder==='top'?'Arabic above':'Arabic below');
        return;
      }
      if(button.dataset.themeChoice){
        requestAnimationFrame(()=>show('Appearance',button.textContent.trim()));
        return;
      }
      if(button.dataset.palette){
        show('Palette',button.getAttribute('aria-label')||button.dataset.palette);
      }
    });
    sync();
  }
  global.DaruriVisuals=Object.freeze({sync,show,clear});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
  else bind();
})(window);
