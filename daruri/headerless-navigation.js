/* Reader-first navigation: replaces the separate masthead with a single,
 * theme-aware control rail. Reuses the selected Gnamma circular tile exactly;
 * the tile is embedded in headerless-navigation.css from the design handoff.
 * Existing reader controls keep their IDs, events and destinations. */
(function(){
 'use strict';
 function icon(shape){
  var paths={
   help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4.1 2.1c-1.1.7-1.6 1.1-1.6 2.4"/><circle cx="12" cy="17" r=".75" fill="currentColor" stroke="none"/>',
   book:'<path d="M12 5.5C8 3.5 5 4.2 3 5.5v13c2.5-1.3 6-1.6 9 .3 3-1.9 6.5-1.6 9-.3v-13c-2-1.3-5-2-9 0ZM12 5.5v13.3"/>',
   home:'<path d="m3.5 10.5 8.5-7 8.5 7V20H4v-9.5M9 20v-6h6v6"/>',
  };
  return '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[shape]+'</svg>';
 }
 function install(){
  var toolbar=document.getElementById('readingControls');
  if(!toolbar||toolbar.dataset.gnHeaderlessReady)return;
  toolbar.dataset.gnHeaderlessReady='1';
  var inner=toolbar.querySelector('.reading-controls-inner');
  var leading=toolbar.querySelector('.gn-reader-global-leading');
  var focus=toolbar.querySelector('.reader-focus-controls');
  var trailing=toolbar.querySelector('.gn-reader-global-trailing');
  if(!inner||!leading||!focus||!trailing)return;

  // The selected circular tile IS the existing Contents/menu button.
  // Never create a second work/logo link beside the hamburger.
  var menu=document.getElementById('menuBtn');
  if(menu){
   menu.classList.add('gn-top-tile');
   menu.setAttribute('aria-label','Open or close Contents');
   menu.title='Contents';
  }

  // Home and Read are separate destinations, never loose text next to an icon.
  // Reading/Focus/Continuous keep the single mosaic Contents opener.
  var home=document.createElement('button');
  home.type='button';home.id='gnTopHome';home.className='gn-top-home';
  home.dataset.route='home';home.setAttribute('aria-label','Home');
  home.title='Home';home.innerHTML=icon('home')+'<span>Home</span>';
  leading.appendChild(home);

  var read=document.createElement('button');
  read.type='button';read.id='gnTopRead';read.className='gn-top-read';
  read.dataset.route='reader';read.setAttribute('aria-label','Read or resume the book');
  read.title='Read or resume';read.innerHTML=icon('book')+'<span>Read</span>';
  leading.appendChild(read);
  const syncTopDestinations=function(){
    const homeRoute=(location.hash||'#home').slice(1)==='home';
    document.body.classList.toggle('gn-home-route',homeRoute);
    home.classList.toggle('active',homeRoute);
    if(homeRoute)home.setAttribute('aria-current','page');
    else home.removeAttribute('aria-current');
  };
  syncTopDestinations();
  window.addEventListener('hashchange',syncTopDestinations);
  if(document.body.classList.contains('reading-active')){
   read.classList.add('active');read.setAttribute('aria-current','page');
  }
  // Clicking Read while already reading must not reset the paragraph/scroll position.
  read.addEventListener('click',function(event){
   if(document.body.classList.contains('reading-active')){
    event.preventDefault();event.stopPropagation();
   }
  });


  // The top reading-mode menu provides Home without a persistent floating
  // overlay. The reader's section and scroll position are not reset by merely
  // opening that menu.
  function exitImmersive(){
   var modes=window.GnammaReaderModes;
   if(modes&&typeof modes.setMode==='function')modes.setMode('reading');
  }

  document.addEventListener('keydown',function(event){
   if(event.key!=='Escape'||event.defaultPrevented)return;
   if(!document.body.classList.contains('reader-enhanced')||
      !document.body.classList.contains('reading-active')||
      !document.body.classList.contains('focus-mode'))return;
   // Escape closes a dialog first; only a second Escape leaves immersive mode.
   var dialogOpen=Array.from(document.querySelectorAll(
    'dialog[open],[role="dialog"]:not([hidden]),.overlay:not([hidden])'
   )).some(function(el){return el.getClientRects().length>0;});
   if(dialogOpen)return;
   if(document.activeElement?.closest?.('input,textarea,[contenteditable="true"]'))return;
   exitImmersive();
  });

  // Search/Display/Help are global actions, not part of the Focus group.
  // Move the existing controls without replacing their event-bound elements.
  focus.after(trailing);
  var focusButton=document.getElementById('focusToolbar');
  if(focusButton){
   // Put the actual Focus selector where the obsolete book was, immediately
   // after AR/EN and before Bookmark. It must remain visible without scrolling
   // through the long toolbar on a phone.
   var actions=document.querySelector('#readingControls .reader-action-slot');
   if(actions)actions.insertBefore(focusButton,actions.firstChild);
   else trailing.insertBefore(focusButton,trailing.firstChild);
   // The book-shaped apparatus control is NOT the mode selector. Explicitly
   // remove it instead of relying on contradictory legacy display rules.
   var obsolete=document.getElementById('apparatusToolbar');
   if(obsolete)obsolete.remove();
   focusButton.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H4v5M15 3h5v5M4 16v5h5M20 16v5h-5"/></svg>';
   focusButton.setAttribute('aria-label','Reading mode: Reading, Focus or Continuous');
   focusButton.title='Reading mode';
  }
  trailing.setAttribute('aria-label','Focus, search, theme, display and help');

  // Help is available in the Contents pane, not a permanent top button.

  var sidebar=document.querySelector('#leftNav .primary-nav');
  if(sidebar&&!sidebar.querySelector('[data-route="help"]')){
   var helpNav=document.createElement('button');
   helpNav.type='button';helpNav.className='nav-item gn-nav-help';
   helpNav.dataset.route='help';helpNav.innerHTML=icon('help')+'<span>Help &amp; guide</span>';
   sidebar.appendChild(helpNav);
  }
  // Share retains its existing top-toolbar button and delegated handler.
  // Do not duplicate Help in the sidebar's small footer links.
  document.querySelectorAll('#leftNav .gn-nav-footer-links [data-route="help"]')
   .forEach(function(button){button.remove();});

  var title=document.querySelector('#leftNav .gn-sidebar-book-title');
  if(title){
   var cite=title.querySelector('cite');
   if(cite){cite.textContent='الضروري';cite.setAttribute('lang','ar');cite.setAttribute('dir','rtl');}
   var divider=title.querySelector('.gn-sidebar-title-separator');
   if(divider)divider.remove();
   var author=title.querySelector('.gn-sidebar-title-author');
   if(author)author.textContent='Ibn Rushd';
  }
  function enhanceHelp(){
   var steps=document.querySelectorAll('#mainContent .gn-history-help .gn-help-step');
   if(!steps.length)return;
   var names=['book','history','search','bookmark','download','settings'];
   var svgPaths={
    history:'<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5M12 7v5l3 2"/>',
    search:'<circle cx="10.8" cy="10.8" r="6.2"/><path d="m15.5 15.5 5 5"/>',
    bookmark:'<path d="M6 3h12v18l-6-4-6 4z"/>',
    download:'<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
    settings:'<path d="M4 7h16M4 17h16M9 4v6M15 14v6"/>'
   };
   steps.forEach(function(step,i){
    var h=step.querySelector('h2');if(!h||h.querySelector('.gn-help-heading-icon'))return;
    var span=document.createElement('span');span.className='gn-help-heading-icon';
    span.innerHTML=names[i]==='book'?icon('book'):
     '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+svgPaths[names[i]]+'</svg>';
    h.prepend(span);
   });
  }
  var main=document.getElementById('mainContent');
  if(main){new MutationObserver(enhanceHelp).observe(main,{childList:true});enhanceHelp();}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
 else install();
})();