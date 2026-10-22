#!/usr/bin/env node
/**
 * Focused runtime regression checks for route-aware navigation.
 * Run: node daruri/qa/verify-global-navigation.js
 * No external packages. Executes the reader's actual chrome/return functions
 * against its actual toolbar markup using a small DOM fixture. This checks
 * state and hidden-ancestor behavior; rendered CSS sizes need browser QA.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
const appScriptStart=html.indexOf("<script>\n(() => {\n'use strict';\nconst BOOK");
assert.ok(appScriptStart>=0,'Embedded Daruri reader script not found');
const appScriptEnd=html.indexOf('</script>',appScriptStart);
assert.ok(appScriptEnd>appScriptStart,'Embedded reader script has no end tag');
const script=html.slice(appScriptStart+'<script>'.length,appScriptEnd);
new vm.Script(script, {filename:'daruri/index.html'});

// Let the JavaScript parser identify the complete function. A textual brace
// counter would mistake braces in template literals or comments for structure.
function extractFunction(pattern, last = false) {
  const matches = [...script.matchAll(pattern)];
  assert.ok(matches.length, 'Missing function: ' + pattern);
  const match = last ? matches.at(-1) : matches[0];
  const start = script.indexOf('function', match.index);
  for (let end = script.indexOf('}', start); end >= 0; end = script.indexOf('}', end + 1)) {
    const candidate = script.slice(start, end + 1);
    try {new vm.Script('(' + candidate + ')'); return candidate;} catch (_) { /* keep scanning */ }
  }
  throw new Error('Cannot extract function: ' + pattern);
}
const syncSource = extractFunction(/function syncReadingChrome\s*\(/g);
const cleanSource = extractFunction(/function applyCleanReader\s*\(/g, true);
const focusCleanSource = extractFunction(/applyCleanReader\s*=\s*function\s*\(/g, true);
const preferenceSource = extractFunction(/function readPreference\s*\(/g, true);
const returnSource = extractFunction(/function returnToReading\s*\(/g);

class Classes {
  constructor(value = '') {this.items = new Set(value.split(/\s+/).filter(Boolean));}
  add(...values) {for (const value of values) this.items.add(value);}
  remove(...values) {for (const value of values) this.items.delete(value);}
  contains(value) {return this.items.has(value);}
  toggle(value, force = !this.items.has(value)) {if (force) this.items.add(value); else this.items.delete(value); return force;}
}
class Element {
  constructor(tag = 'div', attrs = {}) {
    this.tagName = tag.toUpperCase(); this.attrs = {...attrs}; this.id = attrs.id || '';
    this.classList = new Classes(attrs.class); this.hidden = Object.hasOwn(attrs, 'hidden');
    this.children = []; this.parentElement = null; this.textContent = ''; this.innerHTML = '';
    this.dataset = Object.fromEntries(Object.entries(attrs).filter(([k]) => k.startsWith('data-')).map(([k,v]) => [k.slice(5).replace(/-([a-z])/g, (_,c) => c.toUpperCase()),v]));
    this.style = {values:{},setProperty(name,value){this.values[name]=value;},getPropertyValue(name){return this.values[name] || '';}};
  }
  setAttribute(name, value) {this.attrs[name] = String(value); if (name === 'hidden') this.hidden = true;}
  getAttribute(name) {return Object.hasOwn(this.attrs,name) ? this.attrs[name] : null;}
  removeAttribute(name) {delete this.attrs[name]; if (name === 'hidden') this.hidden = false;}
  hasAttribute(name) {return Object.hasOwn(this.attrs,name);}
  append(child) {child.parentElement = this; this.children.push(child);}
  descendants() {return this.children.flatMap(child => [child,...child.descendants()]);}
  querySelectorAll(selector) {return this.descendants().filter(element => matchesSelector(element, selector));}
  querySelector(selector) {return this.querySelectorAll(selector)[0] || null;}
  closest(selector) {for(let el=this;el;el=el.parentElement) if(matchesSelector(el,selector)) return el; return null;}
  getClientRects() {return visible(this) ? [{top:20,left:0,width:38,height:38}] : [];}
}
function matchesSimple(element, selector) {
  let requiredVisible = false;
  selector = selector.replace(/:not\(\[hidden\]\)/g, () => {requiredVisible=true; return '';});
  if(requiredVisible && element.hidden) return false;
  const attrs = [...selector.matchAll(/\[([^\]=]+)(?:=["']?([^\]"']*)["']?)?\]/g)];
  selector = selector.replace(/\[[^\]]+\]/g,'');
  for(const [,name,value] of attrs) if(!element.hasAttribute(name) || (value !== undefined && element.getAttribute(name)!==value)) return false;
  const id = selector.match(/#([\w-]+)/)?.[1];
  if(id && element.id!==id) return false;
  for(const [,name] of selector.matchAll(/\.([\w-]+)/g)) if(!element.classList.contains(name)) return false;
  const tag = selector.match(/^[a-z][\w-]*/i)?.[0];
  return !tag || element.tagName===tag.toUpperCase();
}
function matchesSelector(element, selector) {
  return selector.split(',').some(branch => {
    const parts = branch.trim().split(/\s+/);
    if(!matchesSimple(element,parts.pop())) return false;
    let ancestor=element.parentElement;
    while(parts.length) {
      const part=parts.pop();
      while(ancestor && !matchesSimple(ancestor,part)) ancestor=ancestor.parentElement;
      if(!ancestor) return false;
      ancestor=ancestor.parentElement;
    }
    return true;
  });
}
function visible(element) {for(let el=element;el;el=el.parentElement) if(el.hidden) return false; return true;}
function parseMarkup(markup, body) {
  const stack=[body], voidTags=new Set(['input','img','br','hr','meta','link','use','path','rect','circle','line','polyline']);
  for(const token of markup.matchAll(/<\/?([a-z][\w:-]*)\b([^>]*)>/gi)) {
    const [raw,tag,attributeText]=token;
    if(raw.startsWith('</')) {
      const at=stack.findLastIndex(el=>el.tagName===tag.toUpperCase());
      if(at>0) stack.length=at;
      continue;
    }
    const attrs={};
    for(const m of attributeText.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[m[1]]=m[2]??m[3]??m[4]??'';
    const element=new Element(tag,attrs); stack.at(-1).append(element);
    if(!voidTags.has(tag.toLowerCase()) && !raw.endsWith('/>')) stack.push(element);
  }
}
const appAt=html.indexOf('<div class="app-shell"');
assert.ok(appAt>0,'Enhanced reader shell missing');
const markup=html.slice(appAt,html.lastIndexOf('<script>')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
const routeNames={home:'Home',contents:'Contents',study:'Study guide',index:'Index',applications:'Bidāya applications',glossary:'Dictionary',bookmarks:'Saved sections',about:'About'};
const globals=['menuBtn','searchBtn','themeBtn','settingsBtn'];
const readerActions=['readerSaveAction','readerCopyAction','readerShareAction','focusToolbar'];

function fixture({route='reader',focusLevel=0,showHeader=true,mobile=false} = {}) {
  const body=new Element('body'), documentElement=new Element('html');
  documentElement.append(body); parseMarkup(markup,body);
  const document={body,documentElement,getElementById:id=>body.descendants().find(el=>el.id===id)||null,querySelector:selector=>body.querySelector(selector),querySelectorAll:selector=>body.querySelectorAll(selector)};
  const section={id:'137',title:'Test section',part:2};
  const state={route,n:'137',focusLevel,focusMode:focusLevel>0,showHeader,lang:'parallel',vowels:true,parallelOrder:'arabic-first',fontScale:1.1,theme:'dark',palette:'gnamma',showTerms:true,showConcepts:true,showNotes:true,showApplications:true,leftVisible:false,rightVisible:false,rightOpen:false,drawerOpen:false,indexQuery:'qiyās',studyLevel:'advanced',studyTopic:'purpose'};
  const queued=[],navigation=[],restored=[],readerReturn={section:'81',y:436,initialized:true,anchor:{segment:'2',top:128},hit:{term:'transmission',top:144}};
  const context={state,document,console,readerReturn,pendingReturn:{value:null},gnViewNames:routeNames,sectionOrder:['136','137','138'],sections:new Map([['136',{id:'136',title:'Previous',part:2}],['137',section],['138',{id:'138',title:'Next',part:2}]]),
    $:selector=>document.querySelector(selector),$$:selector=>document.querySelectorAll(selector),
    compactNavigation:()=>mobile,compactContext:()=>mobile,landscapePhone:()=>false,drawPalettes(){},
    closeReadingContextSheet(){const panel=document.getElementById('readingContextPanel');if(panel)panel.hidden=true;},renderReadingContextSheet(){},
    languageButtons:()=>'<button type="button" data-language-toggle="arabic">عَ</button><button type="button" data-language-toggle="english">EN</button>',
    getBookmarked:()=>false,partFor:()=>({label:'Part II'}),sectionRef:n=>'§'+n,
    closeOverlays(){},closeDrawer(){},requestAnimationFrame:fn=>queued.push(fn),
    restoreReadingPlace:place=>restored.push(JSON.parse(JSON.stringify(place))),
    navigate:(next,n)=>navigation.push({route:next,n}),
  };
  vm.createContext(context);
  vm.runInContext(syncSource+'\n'+cleanSource+'\n'+preferenceSource+'\nconst oldClean=applyCleanReader;\napplyCleanReader='+focusCleanSource+';\n'+returnSource,context);
  return {context,document,state,body,queued,navigation,restored,readerReturn,
    sync(){vm.runInContext('syncReadingChrome();applyCleanReader();',context);},
    get:id=>document.getElementById(id),
  };
}

let routeCases=0;
for(const mobile of [false,true]) for(const focusLevel of [0,1,2,3]) for(const showHeader of [true,false]) {
  const f=fixture({focusLevel,showHeader,mobile});
  const preferences=JSON.stringify({...f.state,route:undefined});
  f.sync();
  assert.equal(f.get('readerDock').hidden,false,'Dock available in reader');
  for(const id of readerActions) assert.equal(visible(f.get(id)),true,'Reader action present: '+id);
  for(const route of Object.keys(routeNames)) {
    f.state.route=route;
    f.sync();
    routeCases++;
    const label=route+' / focus '+focusLevel+' / header '+showHeader+' / '+(mobile?'mobile':'desktop');
    assert.equal(f.get('readingControls').hidden,false,'Global toolbar retained: '+label);
    for(const id of globals) assert.equal(visible(f.get(id)),true,'Global '+id+' has no hidden ancestor: '+label);
    assert.equal(f.get('readerDock').hidden,true,'Reader dock absent: '+label);
    for(const id of readerActions) assert.equal(visible(f.get(id)),false,'Reader-only action hidden: '+id+' / '+label);
    assert.equal(visible(f.get('persistentLanguages')),false,'Reading language controls hidden: '+label);
    assert.equal(f.body.classList.contains('reading-active'),false,'Reference route state: '+label);
    assert.equal(f.body.classList.contains('focus-mode'),false,'Saved Focus cannot hide reference menu: '+label);
    assert.equal(f.body.classList.contains('header-collapsed'),false,'Saved header preference cannot hide reference menu: '+label);
    for(const level of [1,2,3]) assert.equal(f.body.classList.contains('focus-level-'+level),false,'No reader-focus layout on references: '+label);
    assert.ok(parseFloat(f.document.documentElement.style.getPropertyValue('--header-height'))>0,'Reference masthead has a usable height: '+label);
    assert.equal(JSON.stringify({...f.state,route:undefined}),preferences,'Reference navigation preserves all reader preferences and filters: '+label);
  }
  f.state.route='reader'; f.sync();
  assert.equal(f.get('readerDock').hidden,false,'Dock restored after references');
  for(const id of readerActions) assert.equal(visible(f.get(id)),true,'Reader action restored: '+id);
  assert.equal(visible(f.get('persistentLanguages')),true,'Languages restored');
  assert.equal(f.body.classList.contains('focus-mode'),focusLevel>0,'Previous Focus mode restored');
  assert.equal(f.body.classList.contains('header-collapsed'),!showHeader,'Previous header preference restored');
  assert.equal(JSON.stringify({...f.state,route:undefined}),preferences,'Round trip preserves reader preferences');
}

// The return control must carry the saved passage and viewport offset, rather
// than treating a previously visited section as a fresh section navigation.
for(const route of Object.keys(routeNames)) {
  const f=fixture({route,focusLevel:3,showHeader:false});
  const prior=JSON.stringify(f.readerReturn), preferences=JSON.stringify(f.state);
  vm.runInContext('returnToReading()',f.context);
  assert.deepEqual(f.navigation,[{route:'reader',n:'81'}],'Return goes to saved reading section from '+route);
  assert.equal(JSON.stringify(f.context.pendingReturn.value),JSON.stringify({section:'81',y:436,anchor:{segment:'2',top:128},hit:{term:'transmission',top:144}}),'Return carries exact reading anchor from '+route);
  assert.equal(JSON.stringify(f.readerReturn),prior,'Return point not consumed prematurely');
  assert.equal(JSON.stringify(f.state),preferences,'Return does not change saved display choices');
}
const same=fixture({route:'reader'}); same.state.n='81';
vm.runInContext('returnToReading()',same.context);
same.queued.splice(0).forEach(fn=>fn());
assert.equal(same.navigation.length,0,'Same-section return does not navigate afresh');
assert.equal(same.restored[0]?.y,436,'Same-section return restores exact viewport offset');
assert.equal(same.restored[0]?.anchor.segment,'2','Same-section return restores the passage anchor');

console.log('PASS: '+routeCases+' reference-route cases across eight routes, four Focus levels, saved header visibility and desktop/mobile modes; global controls reachable, reader-only controls contextual, reader preferences retained on return; nine exact-reading-return cases. CSS layout remains a separate browser check.');
