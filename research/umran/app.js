
(function(){
  const search=document.querySelector('[data-umran-search]');
  const sector=document.querySelector('[data-umran-sector]');
  if(search){
    const cards=[...document.querySelectorAll('[data-umran-item]')];
    const counter=document.querySelector('[data-umran-count]');
    const apply=()=>{
      const q=search.value.trim().toLocaleLowerCase();
      const cat=sector?sector.value:'all';
      let n=0;
      cards.forEach(el=>{
        const text=(el.getAttribute('data-search')||el.textContent).toLocaleLowerCase();
        const yes=(!q||text.includes(q))&&(cat==='all'||el.getAttribute('data-category')===cat);
        el.hidden=!yes;if(yes)n++;
      });
      if(counter)counter.textContent=n+' of '+cards.length+' profiles shown';
    };
    search.addEventListener('input',apply);if(sector)sector.addEventListener('change',apply);apply();
  }
  const form=document.querySelector('#pathfinder');
  if(form){
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const field=form.elements.namedItem('field')?.value||'open';
      const mode=form.elements.namedItem('mode')?.value||'open';
      const constraint=form.elements.namedItem('constraint')?.value||'';
      const note=form.elements.namedItem('note')?.value.trim()||'Not recorded';
      const options={
        knowledge:{name:'knowledge, teaching and intellectual formation',href:'needs.html#contemporary-curricula'},
        care:{name:'care, medicine and protection of vulnerable people',href:'needs.html#dependent-care'},
        technology:{name:'technology, information security and accountable AI',href:'needs.html#ai-safety'},
        infrastructure:{name:'water, sanitation and indispensable services',href:'needs.html#water-sanitation'},
        livelihood:{name:'food access, logistics and livelihoods',href:'needs.html#food-access'},
        open:{name:'the complete catalogue of communal functions',href:'needs.html'}
      };
      const selection=options[field]||options.open;
      const modes={perform:'direct practice',train:'education and preparation of others',enable:'institutional, financial or organisational support',explore:'training and evidence-gathering before commitment'};
      const limits={dependants:'Give existing responsibilities to dependants and household provision priority in assessing what is feasible.',training:'Consider preparatory study, supervised practice and a staged entry route.',mobility:'Look first at local and remotely accessible forms of contribution.',none:'Check actual financial, family, moral and educational constraints before acting.'};
      const output=document.querySelector('#pathfinder-result');
      const summary=document.querySelector('#pathfinder-summary');
      const link=document.querySelector('#pathfinder-next');
      summary.textContent='Begin by examining '+selection.name+'. Your preferred contribution mode is '+(modes[mode]||'open-ended exploration')+'. '+(limits[constraint]||'Assess your existing responsibilities first.')+' Your own note: '+note+'. Before treating a path as a communal duty, check the underlying juristic reasoning, the adequacy evidence for a particular place, and whether your contribution is actually useful. This is a planning aid, not a religious verdict.';
      link.href=selection.href;link.textContent='Explore the relevant need →';
      output.hidden=false;
      output.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
    });
  }
})();
