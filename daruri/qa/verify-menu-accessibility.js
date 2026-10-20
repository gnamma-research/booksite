#!/usr/bin/env node
/** Focused modal/drawer behavior checks; no browser or external dependencies.
 * node daruri/qa/verify-menu-accessibility.js [reader-html]
 * Runs the reader's actual functions against a small DOM with its shell topology.
 * Browser rendering, native screen readers and touch-device geometry remain separate checks.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const file=process.argv[2]||path.resolve(__dirname,'..','index.html');
const html=fs.readFileSync(file,'utf8');
const source=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
new vm.Script(source,{filename:file});
function expressionAt(start){
  for(let end=source.indexOf('}',start);end>=0;end=source.indexOf('}',end+1)){
    const candidate=source.slice(start,end+1);
    try{new vm.Script('('+candidate+')');return candidate;}catch(_){/* continue until the parser accepts the complete expression */}
  }
  throw Error('Incomplete function expression at '+start);
}
function fn(name){
  const matches=[...source.matchAll(new RegExp('function '+name+'\\s*\\(','g'))];
  assert.ok(matches.length,'Missing runtime function '+name);
  return expressionAt(matches.at(-1).index);
}
function handler(marker){
  const at=source.indexOf(marker);assert.ok(at>=0,'Missing event handler '+marker);
  const start=source.lastIndexOf('e=>{',at);assert.ok(start>=0);
  return expressionAt(start);
}
const functions=['syncModalBackground','usableFocusTarget','modalFocusTargets','restoreModalFocus','openDrawer','closeDrawer','showOverlay','closeOverlay','closeOverlays'].map(fn).join('\n');
const tabHandler=handler("const overlay=$$('.overlay:not([hidden])').at(-1);");
const escapeHandler=handler('const mod=e.metaKey||e.ctrlKey;');

class ClassList{
  constructor(value=''){this.items=new Set(value.split(/\s+/).filter(Boolean));}
  add(...names){names.forEach(n=>this.items.add(n));}
  remove(...names){names.forEach(n=>this.items.delete(n));}
  contains(name){return this.items.has(name);}
  toggle(name,on=!this.items.has(name)){on?this.items.add(name):this.items.delete(name);return on;}
}
function simple(el,selector){
  const excluded=[...selector.matchAll(/:not\(([^()]*)\)/g)].map(m=>m[1]);
  selector=selector.replace(/:not\([^()]*\)/g,'');
  if(excluded.some(s=>simple(el,s)))return false;
  const attributes=[...selector.matchAll(/\[([^\]=]+)(?:=["']?([^\]"']*)["']?)?\]/g)];
  selector=selector.replace(/\[[^\]]+\]/g,'');
  for(const [,name,value] of attributes)if(!el.hasAttribute(name)||(value!==undefined&&el.getAttribute(name)!==value))return false;
  const id=selector.match(/#([\w-]+)/)?.[1];if(id&&el.id!==id)return false;
  for(const [,name]of selector.matchAll(/\.([\w-]+)/g))if(!el.classList.contains(name))return false;
  const tag=selector.match(/^[\w-]+/)?.[0];return !tag||el.tagName===tag.toUpperCase();
}
function matches(el,selector){return selector.split(',').some(s=>simple(el,s.trim()));}
function fixture(mobile=true){
  const queue=[],focused=[];
  const state={drawerOpen:false,route:'study',n:'49'};
  const document={activeElement:null};
  class Element{
    constructor(tag,id,classes=''){
      this.tagName=tag.toUpperCase();this.id=id;this.classList=new ClassList(classes);this.attrs={};
      this.children=[];this.parentElement=null;this.hidden=false;this.disabled=false;this.inert=false;
      this.isConnected=true;this.style={overflow:''};this.textContent='';
      this.tabIndex=['BUTTON','INPUT','SELECT','TEXTAREA','SUMMARY','A'].includes(this.tagName)?0:-1;
      if(tag==='a')this.attrs.href='#study';
    }
    append(...children){for(const child of children){child.parentElement=this;this.children.push(child);}return this;}
    descendants(){return this.children.flatMap(e=>[e,...e.descendants()]);}
    hasAttribute(name){return name==='inert'?this.inert:name==='hidden'?this.hidden:name==='disabled'?this.disabled:Object.hasOwn(this.attrs,name);}
    getAttribute(name){return this.hasAttribute(name)?String(this.attrs[name]??''):null;}
    setAttribute(name,value){this.attrs[name]=String(value);if(name==='tabindex')this.tabIndex=Number(value);}
    removeAttribute(name){delete this.attrs[name];}
    querySelectorAll(selector){return this.descendants().filter(e=>matches(e,selector));}
    querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
    closest(selector){for(let el=this;el;el=el.parentElement)if(matches(el,selector))return el;return null;}
    contains(other){return other===this||this.descendants().includes(other);}
    getClientRects(){
      for(let el=this;el;el=el.parentElement){if(el.hidden)return [];if(el.id==='leftNav'&&context.mobile&&!state.drawerOpen)return [];}
      return [{width:38,height:38}];
    }
    focus(options){if(this.isConnected&&!this.disabled&&!this.closest('[inert]')&&this.getClientRects().length){document.activeElement=this;focused.push({id:this.id,options});}}
  }
  const elements={};const el=(tag,id,classes='')=>elements[id]=new Element(tag,id,classes);
  const body=el('body','body');document.body=body;
  const topbar=el('header','topbar','topbar'),toolbar=el('div','readingControls');
  const menu=el('button','menuBtn'),search=el('button','searchBtn');toolbar.append(menu,search);
  const shell=el('div','shell','page-shell'),nav=el('aside','leftNav'),main=el('main','mainContent');main.setAttribute('tabindex','-1');
  const close=el('button','closeNav'),navLink=el('a','navStudy'),last=el('button','navLast'),disabled=el('button','navDisabled'),hidden=el('button','navHidden');
  disabled.disabled=true;hidden.hidden=true;nav.append(close,navLink,last,disabled,hidden);main.append(el('button','contentButton'));shell.append(nav,main);
  const bottom=el('div','bottomNav','bottom-nav'),dock=el('nav','readerDock'),recovery=el('div','hiddenHeaderRecovery');recovery.append(el('button','restoreHeader'));
  const shade=el('div','drawerShade');shade.hidden=true;
  const overlay=el('div','searchOverlay','overlay');overlay.hidden=true;overlay.append(el('input','globalSearch'),el('button','searchClose'));
  const settings=el('div','settingsOverlay','overlay');settings.hidden=true;settings.append(el('button','settingsClose'));
  body.append(topbar,toolbar,shell,bottom,dock,recovery,shade,overlay,settings);
  document.querySelectorAll=s=>body.querySelectorAll(s);document.querySelector=s=>body.querySelector(s);document.getElementById=id=>elements[id]||null;
  const context={mobile,state,document,window:{},console,overlayReturnFocus:null,drawerReturnFocus:null,
    $:s=>document.querySelector(s),$$:s=>document.querySelectorAll(s),compactNavigation:()=>context.mobile,
    requestAnimationFrame:fn=>queue.push(fn),getComputedStyle:el=>({visibility:el.visibility||'visible'}),readerReturn:{section:'49'},sectionRef:n=>'§'+n,captureReaderReturn(){},
  };
  vm.createContext(context);vm.runInContext(functions+'\nconst tabHandler='+tabHandler+';\nconst escapeHandler='+escapeHandler+';',context);
  menu.focus();
  return {context,state,document,elements,focused,
    call(code){return vm.runInContext(code,context);},
    flush(){while(queue.length)queue.shift()();},
    key(key,shiftKey=false){context.event={key,shiftKey,prevented:false,preventDefault(){this.prevented=true;}};vm.runInContext((key==='Escape'?'escapeHandler':'tabHandler')+'(event)',context);return context.event;},
  };
}
let groups=0;
function test(name,work){try{work();groups++;}catch(error){error.message=name+': '+error.message;throw error;}}
const chrome=['topbar','readingControls','bottomNav','readerDock','hiddenHeaderRecovery','mainContent'];
test('Compact drawer is a modal surface with reachable close',()=>{
  const f=fixture();f.call('openDrawer()');f.flush();
  assert.equal(f.document.activeElement.id,'closeNav');assert.equal(f.elements.leftNav.getAttribute('role'),'dialog');assert.equal(f.elements.leftNav.getAttribute('aria-modal'),'true');
  for(const id of chrome)assert.equal(f.elements[id].inert,true,id+' must be inert');
  assert.equal(f.elements.shell.inert,false);assert.equal(f.elements.leftNav.inert,false);assert.equal(f.document.body.style.overflow,'hidden');
  assert.equal(f.elements.menuBtn.getAttribute('aria-expanded'),'true');
});
test('Drawer Tab wraps, excludes hidden/disabled controls and catches stray focus',()=>{
  const f=fixture();f.call('openDrawer()');f.flush();
  let e=f.key('Tab',true);assert.equal(e.prevented,true);assert.equal(f.document.activeElement.id,'navLast');
  e=f.key('Tab');assert.equal(e.prevented,true);assert.equal(f.document.activeElement.id,'closeNav');
  f.document.activeElement=f.elements.contentButton;e=f.key('Tab');assert.equal(e.prevented,true);assert.equal(f.document.activeElement.id,'closeNav');
  f.document.activeElement=f.elements.contentButton;e=f.key('Tab',true);assert.equal(e.prevented,true);assert.equal(f.document.activeElement.id,'navLast');
  f.elements.navStudy.focus();e=f.key('Tab');assert.equal(e.prevented,false,'Interior native tab order is preserved');
});
test('Escape restores the opener and background after mobile navigation',()=>{
  const f=fixture();f.call('openDrawer()');f.flush();f.key('Escape');
  assert.equal(f.state.drawerOpen,false);assert.equal(f.document.activeElement.id,'menuBtn');
  for(const id of chrome)assert.equal(f.elements[id].inert,false,id+' restored');
  assert.equal(f.elements.leftNav.getAttribute('aria-modal'),null);assert.equal(f.elements.leftNav.getAttribute('role'),null);assert.equal(f.document.body.style.overflow,'');
});
test('Route navigation can focus main without changing the reading scroll',()=>{
  const f=fixture();f.call('openDrawer()');f.flush();f.call("closeDrawer({focusTarget:$('#mainContent')})");
  assert.equal(f.document.activeElement.id,'mainContent');assert.equal(f.focused.at(-1).options.preventScroll,true);
});
test('Drawer-to-overlay transition returns to original menu opener',()=>{
  const f=fixture();f.call('openDrawer()');f.flush();f.elements.navStudy.focus();f.call("showOverlay('searchOverlay')");f.flush();
  assert.equal(f.state.drawerOpen,false);assert.equal(f.document.activeElement.id,'globalSearch');assert.equal(f.elements.shell.inert,true);
  assert.equal(f.elements.hiddenHeaderRecovery.inert,true);assert.equal(f.document.body.style.overflow,'hidden');
  f.call("closeOverlay('searchOverlay')");assert.equal(f.document.activeElement.id,'menuBtn');assert.equal(f.elements.shell.inert,false);
});
test('Closing a drawer cannot unlock an active overlay',()=>{
  const f=fixture();f.elements.searchBtn.focus();f.call("showOverlay('searchOverlay')");f.flush();f.call('closeDrawer()');
  assert.equal(f.document.activeElement.id,'globalSearch');assert.equal(f.document.body.style.overflow,'hidden');
  for(const id of chrome)assert.equal(f.elements[id].inert,true);assert.equal(f.elements.shell.inert,true);
  assert.equal(f.document.body.classList.contains('overlay-open'),true);
  f.key('Tab',true);assert.equal(f.document.activeElement.id,'searchClose');f.key('Tab');assert.equal(f.document.activeElement.id,'globalSearch');
  f.key('Escape');assert.equal(f.document.activeElement.id,'searchBtn');assert.equal(f.elements.hiddenHeaderRecovery.inert,false);
});
test('Desktop navigation is not modal and resize cancels stale focus',()=>{
  const desktop=fixture(false);desktop.call('openDrawer()');desktop.flush();
  assert.equal(desktop.state.drawerOpen,false);assert.equal(desktop.elements.leftNav.getAttribute('aria-modal'),null);assert.equal(desktop.elements.mainContent.inert,false);assert.equal(desktop.key('Tab').prevented,false);
  const f=fixture();f.call('openDrawer()');f.context.mobile=false;f.call('closeDrawer({restoreFocus:false})');f.flush();
  assert.equal(f.document.activeElement.id,'menuBtn');assert.equal(f.elements.mainContent.inert,false);assert.equal(f.document.body.style.overflow,'');
});
test('Queued drawer focus cannot steal focus from a newly opened overlay',()=>{
  const f=fixture();f.call('openDrawer()');f.call("showOverlay('settingsOverlay')");f.flush();
  assert.equal(f.document.activeElement.id,'settingsClose');assert.equal(f.elements.shell.inert,true);
});
test('Disconnected openers fall back to reachable controls',()=>{
  const f=fixture();f.elements.searchBtn.focus();f.call("showOverlay('searchOverlay')");f.flush();f.elements.searchBtn.isConnected=false;f.call('closeOverlays()');
  assert.equal(f.document.activeElement.id,'menuBtn');
});
test('A nonfocusable body opener returns to Menu',()=>{
  const f=fixture();f.document.activeElement=f.document.body;f.call('openDrawer()');f.flush();f.call('closeDrawer()');
  assert.equal(f.document.activeElement.id,'menuBtn');
});
test('Recovery controls sit beneath modal surfaces',()=>{
  const rule=html.match(/#hiddenHeaderRecovery\s*\{([^}]+)\}/)?.[1]||'';
  assert.match(rule,/z-index:\s*59\s*!important/);
});
console.log('PASS: '+groups+' menu accessibility behavior groups; compact drawer focus, Tab containment, modal background, overlay transitions, route focus, Escape, resize and recovery stacking. Native device rendering remains a separate check.');
