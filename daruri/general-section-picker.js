/* Gnamma book-independent section picker.
   Navigation-only: no Reading Desk or bookmark shortcuts.
   Optional BOOK.navigationTree (or BOOK.tocTree) supports arbitrary nesting.
   Each node: {number,title,kind,children:[...],sectionId?}.
   If no tree is supplied, parts/sections provide a two-level fallback. */
(function (root) {
  'use strict';
  var INITIAL_LIMIT=120, PAGE_SIZE=120;
  var esc=function (value) {
    return String(value==null?'':value).replace(/[&<>"']/g,function (ch) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  };
  var digits=function (s) {
    return s.replace(/[٠-٩]/g,function (c) { return String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)); })
            .replace(/[۰-۹]/g,function (c) { return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)); });
  };
  var normalise=function (value) {
    return digits(String(value==null?'':value).normalize('NFKC').toLocaleLowerCase())
      .replace(/[\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g,'')
      .replace(/[أإآٱ]/g,'ا').trim();
  };
  function fallback(book) {
    var all=Array.isArray(book.sections)?book.sections:[];
    var groups=Array.isArray(book.parts)?book.parts:[];
    var tree=groups.map(function (p) {
      var label=String(p.label||'Part '+p.id), split=label.indexOf('·');
      var number=split<0?label:label.slice(0,split).trim();
      var title=split<0?String(p.title||p.caption||p.topic||''):label.slice(split+1).trim();
      return {
        kind:'part',number:number,title:title,subtitle:p.caption||'',
        children:all.filter(function(s){return s.id!=='colophon'&&String(s.part)===String(p.id);})
          .map(function(s){
            var authorial=!!s.headingAr;
            return {
              kind:'section',number:'§'+s.id,
              title:(authorial&&s.headingEn)||s.title||'Untitled section',
              arabic:s.headingAr||'',
              subtitle:authorial&&s.headingEn&&s.title!==s.headingEn?'Editorial topic: '+s.title:
                       authorial?'Recorded heading':'Editorial section title',
              sectionId:String(s.id),source:s
            };
          })
      };
    });
    var orphan=all.filter(function(s){
      return s.id!=='colophon'&&!groups.some(function(p){return String(p.id)===String(s.part);});
    });
    if(orphan.length)tree.push({
      kind:'part',number:'Other sections',title:'',
      children:orphan.map(function(s){
        return {kind:'section',number:'§'+s.id,title:s.title||s.headingEn||'Untitled section',
          arabic:s.headingAr||'',sectionId:String(s.id),source:s};
      })
    });
    var col=all.find(function(s){return String(s.id)==='colophon';});
    if(col)tree.push({kind:'section',number:'Colophon',title:col.title||'Later manuscript record',
      arabic:col.headingAr||'',sectionId:'colophon',source:col});
    return tree;
  }
  function buildModel(book) {
    var tree=Array.isArray(book.navigationTree)&&book.navigationTree.length?book.navigationTree:
      Array.isArray(book.tocTree)&&book.tocTree.length?book.tocTree:fallback(book);
    var byId=new Map(),bySection=new Map(),flat=[];
    function make(raw,parent,index) {
      var uid=(parent?parent.uid+'.':'n')+index;
      var rawChildren=Array.isArray(raw.children)?raw.children:Array.isArray(raw.items)?raw.items:[];
      var sectionId=raw.sectionId!=null?raw.sectionId:
        raw.section!=null?raw.section:(raw.kind==='section'?raw.id:null);
      var node={
        uid:uid,parent:parent||null,kind:String(raw.kind||'division'),
        number:String(raw.number==null?(raw.label||''):raw.number),
        title:String(raw.title||raw.name||raw.headingEn||''),
        subtitle:String(raw.subtitle||raw.description||''),
        arabic:String(raw.arabic||raw.headingAr||''),
        sectionId:sectionId==null?null:String(sectionId),source:raw.source||raw,
        children:[]
      };
      byId.set(uid,node);flat.push(node);
      if(node.sectionId&&!bySection.has(node.sectionId))bySection.set(node.sectionId,node);
      node.children=rawChildren.map(function(child,i){return make(child,node,i);});
      node.search=normalise([
        node.number,node.title,node.subtitle,node.arabic,
        ...(Array.isArray(node.source.tags)?node.source.tags:[])
      ].join(' '));
      return node;
    }
    var roots=tree.map(function(n,i){return make(n,null,i);});
    return {roots:roots,byId:byId,bySection:bySection,flat:flat};
  }
  function install(context) {
    var doc=root.document,book=context.book,model=buildModel(book);
    var overlay=doc.getElementById('jumpOverlay'),dialog=overlay&&overlay.querySelector('.jump-dialog');
    var parts=doc.getElementById('jumpParts'),list=doc.getElementById('jumpResults');
    var count=doc.getElementById('jumpResultCount'),input=doc.getElementById('jumpSearch');
    var recent=doc.getElementById('jumpRecent');
    if(!dialog||!parts||!list||!input||!count)return null;
    var crumbs=doc.createElement('nav');
    crumbs.id='gnPickerBreadcrumbs';crumbs.className='gn-picker-breadcrumbs';
    crumbs.setAttribute('aria-label','Book location');
    parts.parentNode.insertBefore(crumbs,parts);
    var footer=doc.createElement('div');
    footer.className='gn-picker-footer';
    footer.innerHTML='<button type="button" data-picker-full-contents>'+
      '<span aria-hidden="true">☷</span> View full book contents <span aria-hidden="true">↗</span></button>';
    dialog.appendChild(footer);
    // Keep the existing Recent + Back/Forward controls and their event listeners.
    // Recent is a navigation-history area, not a bookmarks/Reading Desk link.
    if(recent)dialog.insertBefore(recent,footer);
    var folder=null,shown=INITIAL_LIMIT,lastQuery='';
    function chain(node) {
      var out=[];for(var cur=node;cur;cur=cur.parent)out.unshift(cur);return out;
    }
    function currentFolder() {
      var leaf=model.bySection.get(String(context.current()));
      return leaf?(leaf.children.length?leaf:leaf.parent):null;
    }
    function pathLabel(node) {
      return [node.number,node.title].filter(Boolean).join(' · ');
    }
    function renderCrumbs() {
      var path=chain(folder);
      var html='<button type="button" class="gn-picker-crumb" data-picker-root>All parts</button>';
      path.forEach(function(node,index){
        html+='<span class="gn-picker-divider" aria-hidden="true">›</span>'+
          '<button type="button" class="gn-picker-crumb'+(index===path.length-1?' current':'')+
          '" data-picker-path="'+esc(node.uid)+'"'+(index===path.length-1?' aria-current="location"':'')+
          '>'+esc(pathLabel(node))+'</button>';
      });
      crumbs.innerHTML=html;
    }
    function renderParts() {
      var navigable=model.roots.filter(function(n){return n.children.length;});
      var quick=model.roots.length<=6&&navigable.length>0;
      parts.hidden=!quick||!folder||!!input.value.trim();
      if(parts.hidden){parts.innerHTML='';return;}
      parts.setAttribute('aria-label','Quick part choices');
      parts.innerHTML=navigable.map(function(node){
        var active=chain(folder).some(function(x){return x.uid===node.uid;});
        return '<button type="button" class="gn-picker-part'+(active?' current':'')+
          '" data-picker-path="'+esc(node.uid)+'" aria-pressed="'+active+'">'+
          '<span>'+esc(node.number)+'</span>'+
          (node.title?'<small>'+esc(node.title)+'</small>':'')+'</button>';
      }).join('');
    }
    function itemPath(node) {
      return chain(node.parent).map(pathLabel).join(' › ');
    }
    function pageLabel(node) {
      if(node.sectionId==null)return '';
      var source=node.source||{};
      var page;
      try {page=context.originalPage&&context.originalPage(source);}catch(_e){}
      if(!page&&source.pages!=null)page=Array.isArray(source.pages)?source.pages.join(', '):source.pages;
      return page?'Arabic ed. '+String(page):'';
    }
    function row(node,globalSearch) {
      var inCurrent=!!node.sectionId&&node.sectionId===String(context.current());
      var isFolder=node.children.length>0||(!node.sectionId&&node.kind!=='section');
      var meta=globalSearch?itemPath(node):node.subtitle;
      var pg=pageLabel(node);
      if(pg)meta+=(meta?' · ':'')+pg;
      var attribute=isFolder?'data-picker-open="'+esc(node.uid)+'"':
        'data-section="'+esc(node.sectionId||'')+'"';
      var html='<div class="gn-picker-row-wrap'+(inCurrent?' is-current':'')+'">'+
        '<button type="button" class="gn-picker-row" '+attribute+
        (inCurrent?' aria-current="location"':'')+'>'+
        '<span class="gn-picker-number">'+esc(node.number||'—')+'</span>'+
        '<span class="gn-picker-entry"><strong>'+esc(node.title||node.number||'Untitled')+'</strong>'+
        (node.arabic?'<span class="gn-picker-arabic" lang="ar" dir="rtl">'+esc(node.arabic)+'</span>':'')+
        (meta?'<small>'+esc(meta)+'</small>':'')+'</span>'+
        '<span class="gn-picker-arrow" aria-hidden="true">'+(isFolder?'›':'↗')+'</span></button>';
      if(isFolder&&node.sectionId){
        html+='<button type="button" class="gn-picker-read-intro" data-section="'+esc(node.sectionId)+'">Read</button>';
      }
      return html+'</div>';
    }
    function render() {
      renderCrumbs();renderParts();
      var q=normalise(input.value),isSearch=!!q;
      if(q!==lastQuery){shown=INITIAL_LIMIT;lastQuery=q;}
      var all=isSearch?model.flat.filter(function(node){
        return node.search.includes(q);
      }):folder?folder.children:model.roots;
      if(isSearch){
        all.sort(function(a,b){
          var aa=normalise(a.number).replace(/^§/,'')===q?0:
            normalise(a.title).startsWith(q)?1:a.search.startsWith(q)?2:3;
          var bb=normalise(b.number).replace(/^§/,'')===q?0:
            normalise(b.title).startsWith(q)?1:b.search.startsWith(q)?2:3;
          return aa-bb;
        });
      }
      count.textContent=(isSearch?'Search results · ':'')+all.length+
        ' '+(all.length===1?'entry':'entries')+(all.length>shown?' · showing first '+shown:'');
      var top=list.scrollTop;
      list.innerHTML=all.slice(0,shown).map(function(node){return row(node,isSearch);}).join('')+
        (all.length>shown?'<button type="button" class="gn-picker-more" data-picker-more>Show next '+
          Math.min(PAGE_SIZE,all.length-shown)+' entries</button>':'')+
        (!all.length?'<p class="gn-picker-empty">No matching titles or sections. Try another term.</p>':'');
      list.scrollTop=top;
      // Keep the currently selected section visible when the picker first opens.
    }
    function browse(node) {
      folder=node||null;shown=INITIAL_LIMIT;input.value='';lastQuery='';
      list.scrollTop=0;render();
    }
    function open() {
      // Retire the legacy miscellany of site links from this navigation-only popup.
      dialog.querySelectorAll('.gn-reader-jump-sites').forEach(function(node){node.remove();});
      folder=currentFolder();shown=INITIAL_LIMIT;lastQuery='';
      input.value='';list.scrollTop=0;
      render();
      if(!folder)return;
      root.requestAnimationFrame(function(){
        var selected=list.querySelector('.is-current');
        if(!selected)return;
        var relative=selected.offsetTop-list.offsetTop;
        list.scrollTop=Math.max(0,relative-list.clientHeight/3);
      });
    }
    overlay.addEventListener('click',function(e){
      var button=e.target.closest('[data-picker-root],[data-picker-path],[data-picker-open],[data-picker-more],[data-picker-full-contents]');
      if(!button||!overlay.contains(button))return;
      e.preventDefault();e.stopImmediatePropagation();
      if(button.hasAttribute('data-picker-full-contents')){
        if(typeof context.openFullContents==='function')context.openFullContents();
        return;
      }
      if(button.hasAttribute('data-picker-more')){
        shown+=PAGE_SIZE;render();return;
      }
      if(button.hasAttribute('data-picker-root')){browse(null);return;}
      browse(model.byId.get(button.dataset.pickerPath||button.dataset.pickerOpen));
    },true);
    input.addEventListener('input',function(e){
      if(overlay.hidden)return;
      e.stopImmediatePropagation();
      list.scrollTop=0;render();
    },true);
    input.addEventListener('keydown',function(e){
      if(e.key!=='Enter'||overlay.hidden)return;
      var first=list.querySelector('[data-section],[data-picker-open]');
      if(!first)return;
      e.preventDefault();e.stopImmediatePropagation();first.click();
    },true);
    return {open:open,model:model};
  }
  root.GnammaSectionPicker={install:install,buildModel:buildModel};
})(typeof window==='undefined'?this:window);
