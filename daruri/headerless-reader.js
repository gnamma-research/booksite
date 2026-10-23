/* Headerless Daruri chrome: integrate the approved circular tile with the
 * *existing* drawer opener. All original button IDs and event handlers survive.
 * No new contents pane or second navigation toolbar is created. */
(() => {
  'use strict';
  const doc=document;
  const bar=doc.getElementById('readingControls');
  const inner=bar?.querySelector('.reading-controls-inner');
  const drawer=doc.getElementById('leftNav');
  const menu=doc.getElementById('menuBtn');
  if(!inner||!menu||!drawer)return;
  menu.setAttribute('aria-label','Open or close Contents and navigation');
  menu.setAttribute('title','Contents and navigation');
  menu.classList.add('gn-selected-tile-opener');

  // Book identity belongs in Contents rather than an extra masthead.
  const heading=drawer.querySelector('.nav-heading .gn-sidebar-book-title');
  if(heading) {
    heading.innerHTML='<span class="gn-work-title-ar" lang="ar" dir="rtl">الضروري</span>'+
      '<span class="gn-work-author">Ibn Rushd</span>';
    heading.setAttribute('aria-label','al-Ḍarūrī by Ibn Rushd');
  }
  const mainNav=drawer.querySelector('.primary-nav');
  if(mainNav&&!mainNav.querySelector('[data-route="help"]')) {
    const btn=doc.createElement('button');
    btn.type='button';btn.className='nav-item gn-nav-help';
    btn.dataset.route='help';
    btn.innerHTML='<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.65"/><path d="M9.7 9a2.5 2.5 0 0 1 4.8 1c0 1.8-2.5 2.1-2.5 4" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round"/><circle cx="12" cy="17.3" r=".85" fill="currentColor"/></svg><span>Help &amp; guide</span>';
    // First visible part of the drawer, rather than buried in its footer.
    const refDivider=mainNav.querySelector('.gn-nav-section-label');
    if(refDivider)mainNav.insertBefore(btn,refDivider);else mainNav.appendChild(btn);
  }
  // Remove only the duplicate footer Help text; Home remains in the footer.
  drawer.querySelector('.gn-nav-footer-links [data-route="help"]')?.remove();

  // Section actions retain their original IDs and click handlers.
  const slot=inner.querySelector('.reader-action-slot');
  if(slot&&!doc.getElementById('readerActionMenu')) {
    const actions=[...slot.querySelectorAll('.reader-action-item')];
    if(actions.length) {
      const details=doc.createElement('details');
      details.id='readerActionMenu';
      details.className='reader-action-menu gn-compact-actions';
      const trigger=doc.createElement('summary');
      trigger.className='gn-actions-trigger';
      trigger.setAttribute('aria-label','Section actions: bookmark, copy, share');
      trigger.setAttribute('title','Section actions');
      trigger.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>';
      const pop=doc.createElement('div');
      pop.className='reader-action-menu-pop gn-actions-pop';
      pop.setAttribute('role','group');
      pop.setAttribute('aria-label','Actions for this passage');
      for(const button of actions) {
        // Move, never clone: existing save/copy/share listeners still work.
        button.classList.add('gn-actions-option');
        pop.appendChild(button);
      }
      details.append(trigger,pop);
      slot.appendChild(details);
    }
  }

  // Read/Focus/Continuous remains the original mode selector.
  const mode=doc.getElementById('focusToolbar');
  if(mode&&!mode.querySelector('.gn-mode-text')) {
    const label=doc.createElement('span');
    label.className='gn-mode-text';
    mode.append(label);
    function syncModeLabel(){
      const aria=mode.getAttribute('aria-label')||'';
      const match=aria.match(/Reading mode:\s*(Reading|Focus|Continuous)/i);
      label.textContent=match?match[1]:'Reading';
      mode.classList.add('gn-mode-primary');
    }
    syncModeLabel();
    new MutationObserver(syncModeLabel).observe(mode,{attributes:true,attributeFilter:['aria-label']});
  }
  // Search, appearance and assistance are a separate trailing group.
  const trailing=inner.querySelector('.gn-reader-global-trailing');
  if(trailing) {
    trailing.setAttribute('aria-label','Search, appearance and help');
    inner.appendChild(trailing);
    if(!doc.getElementById('gnHeaderHelp')) {
      const help=doc.createElement('button');
      help.type='button';help.id='gnHeaderHelp';help.className='icon-btn gn-header-help';
      help.dataset.route='help';
      help.setAttribute('aria-label','Help & guide');
      help.setAttribute('title','Help & guide');
      help.innerHTML='<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 0 1 4.8 1c0 1.8-2.5 2.1-2.5 4"/><circle cx="12" cy="17.3" r=".8" fill="currentColor" stroke="none"/></svg>';
      trailing.appendChild(help);
    }
  }

  // The dedicated Help page already has useful text. Give each instruction an
  // icon matching its real control, without replacing or duplicating the text.
  const helpIcons=['#i-book','#i-jump','#i-search','#i-library','#i-notes','#i-sliders'];
  function decorateHelp(){
    const main=doc.getElementById('mainContent');
    if(!main||!main.querySelector('.gn-history-help'))return;
    const headings=main.querySelectorAll('.gn-history-help .gn-help-step h2');
    headings.forEach((h,i)=>{
      if(h.querySelector('.gn-help-icon'))return;
      const span=doc.createElement('span');span.className='gn-help-icon';
      const id=helpIcons[i]||'#i-book';
      span.innerHTML='<svg class="icon" aria-hidden="true"><use href="'+id+'"></use></svg>';
      h.prepend(span);
    });
  }
  const content=doc.getElementById('mainContent');
  if(content) {
    new MutationObserver(decorateHelp).observe(content,{childList:true});
    decorateHelp();
  }
})();
