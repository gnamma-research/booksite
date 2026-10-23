/* Reader-first navigation: replaces the separate masthead with a single,
 * theme-aware control rail. Reuses the selected Gnamma circular tile exactly;
 * the tile is embedded in headerless-navigation.css from the design handoff.
 * Existing reader controls keep their IDs, events and destinations. */
(function(){
 'use strict';
 function icon(shape){
  var paths={
   help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4.1 2.1c-1.1.7-1.6 1.1-1.6 2.4"/><circle cx="12" cy="17" r=".75" fill="currentColor" stroke="none"/>',
   book:'<path d="M12 5.5C8 3.5 5 4.2 3 5.5v13c2.5-1.3 6-1.6 9 .3 3-1.9 6.5-1.6 9-.3v-13c-2-1.3-5-2-9 0ZM12 5.5v13.3"/>'
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

  var tile=document.createElement('a');
  tile.id='gnTopTile';tile.className='gn-top-tile';
  tile.href='#home';tile.setAttribute('aria-label','Gnamma — Home');
  tile.title='Gnamma · Home';tile.setAttribute('data-gn-brand-tile','');
  leading.insertBefore(tile,leading.firstChild);

  var read=document.createElement('button');
  read.type='button';read.id='gnTopRead';read.className='gn-top-read';
  read.dataset.route='reader';read.setAttribute('aria-label','Read or resume the book');
  read.title='Read or resume';read.innerHTML=icon('book')+'<span>Read</span>';
  leading.appendChild(read);

  // Search/Display/Help are global actions, not part of the Focus group.
  // Move the existing controls without replacing their event-bound elements.
  focus.after(trailing);
  var focusButton=document.getElementById('focusToolbar');
  if(focusButton)trailing.insertBefore(focusButton,trailing.firstChild);
  trailing.setAttribute('aria-label','Focus, search, theme, display and help');

  var help=document.createElement('button');
  help.type='button';help.id='gnTopHelp';help.className='gn-top-help';
  help.dataset.route='help';help.title='Help and reader guide';
  help.setAttribute('aria-label','Help and reader guide');
  help.innerHTML=icon('help');trailing.appendChild(help);

  var sidebar=document.querySelector('#leftNav .primary-nav');
  if(sidebar&&!sidebar.querySelector('[data-route="help"]')){
   var helpNav=document.createElement('button');
   helpNav.type='button';helpNav.className='nav-item gn-nav-help';
   helpNav.dataset.route='help';helpNav.innerHTML=icon('help')+'<span>Help &amp; guide</span>';
   sidebar.appendChild(helpNav);
  }
  // Do not duplicate Help in the sidebar's small footer links.
  document.querySelectorAll('#leftNav .gn-nav-footer-links [data-route="help"]')
   .forEach(function(button){button.remove();});

  var title=document.querySelector('#leftNav .gn-sidebar-book-title');
  if(title){
   var cite=title.querySelector('cite');
   if(cite){cite.textContent='الضَّرُورِيُّ فِي أُصُولِ الْفِقْهِ';cite.setAttribute('lang','ar');cite.setAttribute('dir','rtl');}
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