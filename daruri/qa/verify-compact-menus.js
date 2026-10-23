#!/usr/bin/env node
/** Compact menu structure and reading-style behavior. No external packages.
 * node daruri/qa/verify-compact-menus.js
 * Checks native controls, labels, navigation/disclosures, real style-module
 * behavior, reader persistence and shared reading anchors. CSS geometry and
 * real screen-reader/device behavior still require browser review.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const moduleCode=fs.readFileSync(path.join(root,'reading-styles.js'),'utf8');
const styles=fs.readFileSync(path.join(root,'reading-styles.css'),'utf8');
const menuCSS=fs.readFileSync(path.join(root,'compact-menu.css'),'utf8');
const scriptStart=html.indexOf("<script>\n(() => {\n'use strict';\nconst BOOK");
assert.ok(scriptStart>=0,'Main reader inline script not found');
const scriptEnd=html.indexOf('</script>',scriptStart);
assert.ok(scriptEnd>scriptStart,'Reader inline script is not closed');
const script=html.slice(scriptStart+'<script>'.length,scriptEnd);
new vm.Script(script,{filename:'index.html'});
new vm.Script(moduleCode,{filename:'reading-styles.js'});
let groups=0;
function test(name,work){try{work();groups++;}catch(error){error.message=name+': '+error.message;throw error;}}
const decode=s=>s.replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
class Element{
 constructor(tag,attrs={}){this.tag=tag;this.attrs=attrs;this.children=[];this.parent=null;this.parts=[];}
 all(){return [this,...this.children.flatMap(child=>child.all())];}
 hasClass(name){return (this.attrs.class||'').split(/\s+/).includes(name);}
 text(){return decode(this.parts.map(part=>typeof part==='string'?part:part.text()).join('')).replace(/\s+/g,' ').trim();}
 find(predicate){return this.all().find(predicate);}
}
function parse(markup){
 const base=new Element('root'),stack=[base],voids=new Set(['input','img','br','hr','meta','link','source','wbr','use','path','rect','circle','line','polyline']);
 markup=markup.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<!--[\s\S]*?-->/g,'');
 let position=0;
 for(const token of markup.matchAll(/<\/?([a-z][\w:-]*)\b([^>]*)>/gi)){
  stack.at(-1).parts.push(markup.slice(position,token.index));position=token.index+token[0].length;
  const [raw,tag,attributes]=token;
  if(raw.startsWith('</')){const at=stack.findLastIndex(node=>node.tag===tag);if(at>0)stack.length=at;continue;}
  const attrs={};for(const m of attributes.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))attrs[m[1]]=decode(m[2]??m[3]??m[4]??'');
  const node=new Element(tag,attrs);node.parent=stack.at(-1);node.parent.children.push(node);node.parent.parts.push(node);
  if(!voids.has(tag)&&!raw.endsWith('/>'))stack.push(node);
 }
 return base;
}
const appStart=html.indexOf('<div class="app-shell"');
assert.ok(appStart>0,'Enhanced application shell exists');
const enhanced=parse(html.slice(appStart,html.lastIndexOf('<script>')));
const fallbackStart=html.lastIndexOf('<',html.indexOf('id="fallbackReader"'));
const fallbackMain=html.lastIndexOf('<',html.indexOf('id="fallbackMain"'));
assert.ok(fallbackStart>=0&&fallbackMain>fallbackStart,'Native reader shell exists');
const fallback=parse(html.slice(fallbackStart,fallbackMain));
const nodes=[...enhanced.all(),...fallback.all()];
const byId=id=>{const found=nodes.filter(node=>node.attrs.id===id);assert.equal(found.length,1,'Unique control '+id);return found[0];};
const descendants=(node,predicate)=>node.all().slice(1).filter(predicate);
const options=node=>node.children.filter(child=>child.tag==='option');
const optionValues=node=>options(node).map(option=>option.attrs.value);
const withinClosedDetails=(node,until)=>{for(let p=node.parent;p&&p!==until;p=p.parent)if(p.tag==='details'&&!Object.hasOwn(p.attrs,'open'))return true;return false;};

test('reading-first Contents navigation preserves direct destinations and secondary pages',()=>{
 const nav=byId('leftNav').find(node=>node.hasClass('primary-nav'));
 const items=nav.children.filter(node=>Object.hasOwn(node.attrs,'data-route'));
 assert.deepEqual(items.map(node=>node.attrs['data-route']),['reader','contents','bookmarks','index','glossary','applications','study','editions']);
 const labels=['Read','Contents','Reading Desk','Subject index','Dictionary','Bidāya applications','Guided study','Editions & downloads'];
 items.forEach((node,i)=>{assert.equal(node.tag,'button');assert.equal(node.attrs.type,'button');assert.ok(node.text().startsWith(labels[i]));assert.ok(node.hasClass('nav-item'));assert.ok(!node.hasClass('primary'));});
 assert.deepEqual(items.map(node=>node.find(child=>child.tag==='use')?.attrs.href),['#i-book','#i-toc','#i-library','#i-subject','#i-dictionary','#i-balance','#i-study',undefined]);
 const headings=nav.children.filter(node=>node.hasClass('gn-nav-section-label')).map(node=>node.text());
 assert.deepEqual(headings,['Reference tools','Explore further']);
 const footer=byId('leftNav').find(node=>node.hasClass('gn-nav-footer-links'));
 assert.deepEqual(footer.children.filter(node=>Object.hasOwn(node.attrs,'data-route')).map(node=>node.attrs['data-route']),['home','help']);
 assert.ok(!nav.find(node=>node.attrs['data-route']==='home'));
 assert.ok(!nav.find(node=>node.attrs['data-route']==='about'));
});
test('Editions and downloads remain accessible without duplicate sidebar jump',()=>{
 assert.ok(!nodes.some(n=>['jumpToPartMenu','fb-jump-to-part','quickParts','downloadsMenu','fb-downloads-menu'].includes(n.attrs.id)));
 const nav=byId('leftNav').find(node=>node.hasClass('primary-nav'));
 assert.equal(nav.find(node=>node.attrs['data-route']==='editions').text(),'Editions & downloads');
 const fallbackNav=fallback.find(node=>node.hasClass('fb-left-panel'));
 assert.ok(fallbackNav.find(node=>node.tag==='a'&&node.attrs.href==='#editions'));
 assert.ok(fallbackNav.find(node=>node.tag==='a'&&node.attrs.href==='#contents'));
 assert.ok(fallbackNav.find(node=>node.tag==='a'&&node.attrs.href==='#help'));
 const staticMarkup=html.slice(0,appStart)
   .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')
   .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
 const staticIds=new Set([...staticMarkup.matchAll(/\bid=["']([^"']+)["']/g)].map(match=>decode(match[1])));
 descendants(fallbackNav,node=>node.tag==='a'&&node.attrs.href?.startsWith('#'))
  .forEach(link=>assert.ok(staticIds.has(decodeURIComponent(link.attrs.href.slice(1))),'Existing native destination '+link.attrs.href));
});
test('enhanced Visuals controls are direct while hidden selects preserve state contracts',()=>{
 const definitions=[['pageStyleSelect',['quiet','book','structured']],['fb-page-style-select',['quiet','book','structured']],['arabicFontChoice',['amiri','scheherazade','noto']],['fb-arabic-font-choice',['amiri','scheherazade','noto']],['englishFontChoice',['original','source-serif','literata']],['fb-english-font-choice',['original','source-serif','literata']]];
 for(const [id,values]of definitions){
  const node=byId(id);assert.equal(node.tag,'select');assert.deepEqual(optionValues(node),values);
  const selected=options(node).filter(option=>Object.hasOwn(option.attrs,'selected'));assert.ok(selected.length<=1);assert.equal((selected[0]||options(node)[0]).attrs.value,values[0]);
 }
 assert.equal(byId('settingsTitle').text(),'Visuals');
 const settings=byId('settingsOverlay');
 assert.equal(descendants(settings,node=>Object.hasOwn(node.attrs,'data-page-style-choice')).length,3);
 assert.equal(descendants(settings,node=>Object.hasOwn(node.attrs,'data-arabic-font-choice')).length,3);
 assert.equal(descendants(settings,node=>Object.hasOwn(node.attrs,'data-english-font-choice')).length,3);
 assert.ok(byId('pageStyleSelect').hasClass('gn-hidden-control'));
 assert.ok(byId('arabicFontChoice').hasClass('gn-hidden-control'));
 assert.ok(byId('englishFontChoice').hasClass('gn-hidden-control'));
 assert.deepEqual(options(byId('englishFontChoice')).map(node=>node.text()),['Original','Source Sans 3','Lexend']);
 assert.deepEqual(options(byId('fb-english-font-choice')).map(node=>node.text()),['Original','Source Sans 3','Lexend']);
});
test('layout and palette glyphs are named; duplicate theme mode is hidden from Visuals',()=>{
 const settings=byId('settingsOverlay');
 for(const [attribute,expected,active]of [['data-parallel-side',['left','right'],'right'],['data-stacked-order',['top','bottom'],'top']]){
  const buttons=descendants(settings,node=>Object.hasOwn(node.attrs,attribute));assert.deepEqual(buttons.map(button=>button.attrs[attribute]),expected);
  for(const button of buttons){assert.equal(button.tag,'button');assert.equal(button.attrs.type,'button');assert.ok(button.attrs['aria-label']?.includes('Arabic'));assert.ok(button.find(node=>node.hasClass('gn-layout-glyph')&&node.attrs['aria-hidden']==='true'));assert.equal(button.attrs['aria-pressed'],String(button.attrs[attribute]===active));assert.ok(!Object.hasOwn(button.attrs,'title'));}
 }
 for(const id of ['fb-arabic-left','fb-arabic-right','fb-arabic-top','fb-arabic-bottom']){const node=byId(id);assert.equal(node.tag,'input');assert.equal(node.attrs.type,'radio');assert.ok(node.attrs['aria-label']||node.parent.attrs['aria-label']||node.parent.text().includes('Arabic'),'Named native glyph '+id);}
 assert.ok(Object.hasOwn(byId('settingsTheme').attrs,'hidden'),'Duplicate theme mode remains only as hidden compatibility hook');
 assert.ok(!withinClosedDetails(byId('palettePicker'),settings));
 assert.ok(!withinClosedDetails(byId('smallerType'),settings));assert.ok(!withinClosedDetails(byId('largerType'),settings));
 assert.ok(settings.find(node=>node.attrs['aria-label']==='Colour palette'));
 assert.ok(settings.find(node=>node.attrs['aria-label']==='Page style'));
 assert.ok(!settings.find(node=>node.tag==='legend'&&node.text()==='Colours'));
 assert.ok(!settings.find(node=>node.tag==='summary'&&/preview text/i.test(node.text())));
});
test('fallback bindings and screen-only style scope retain independent layout/font contracts',()=>{
 for(const [id,values]of [['fb-arabic-font-choice',['amiri','scheherazade','noto']],['fb-english-font-choice',['original','source-serif','literata']]])for(const value of values)assert.ok(menuCSS.includes('#'+id+' option[value="'+value+'"]:checked'));
 assert.ok(styles.includes('#fb-page-style-select option[value="book"]:checked'));
 assert.ok(styles.includes('#fb-page-style-select option[value="structured"]:checked'));
 assert.match(styles,/@media screen\s*\{/);
 const declarations=styles.replace(/\/\*[\s\S]*?\*\//g,'');
 // NaMA's fallback return link is intentionally block-level so its rounded
 // frame encloses the entire link. This does not hide text or change ordering.
 const shapedReturn=declarations.replace(
  /(#fallbackReader:has\(#fb-pal-gnamma:checked,\s*#fb-pal-gnamma-air:checked\)\s*\.fb-quick-return\s*>\s*a\s*{)\s*display\s*:\s*block\s*;/g,'$1');
 assert.ok(!/(?:^|[;{])\s*(?:display|order|direction|grid-template-columns|font-family)\s*:/m.test(shapedReturn),
  'Page styles do not replace visibility, language order or typefaces');
 assert.ok(styles.includes('#fb-language-auto:checked'),'Book fallback includes responsive automatic bilingual mode');
 assert.match(menuCSS,/@media\s*\(max-width:\s*590px\)/);
 assert.match(menuCSS,/@media\s*\(max-width:\s*840px\)/);
});

function fixture({saved,rawSaved,getThrows=false,setThrows=false}={}){
 const listeners=new Set(),controls=[{id:'pageStyleSelect',value:''},{id:'fb-page-style-select',value:''}],attributes={'data-arabic-font':'amiri','data-english-font':'original','data-theme':'dark','data-reading-style':'quiet'};
 const writes=[],attributeWrites=[],frames=[];let layoutTop=300,scrollY=0;
 controls.forEach(control=>control.matches=selector=>selector.includes('#'+control.id));
 const storage={value:rawSaved!==undefined?rawSaved:saved===undefined?null:JSON.stringify(saved)};
 const documentElement={setAttribute(name,value){if(attributes[name]!==undefined&&attributes[name]!==value)layoutTop+=name==='data-reading-style'?50:name==='data-arabic-font'?100:0;attributes[name]=String(value);attributeWrites.push([name,String(value)]);}};
 const passage={isConnected:true,getBoundingClientRect:()=>({top:layoutTop-scrollY,bottom:layoutTop-scrollY+800})};
 const document={documentElement,querySelectorAll:selector=>selector==='.passage-grid'?[passage]:selector.includes('#pageStyleSelect')?controls:[],addEventListener(type,fn){assert.equal(type,'change');listeners.add(fn);},removeEventListener(type,fn){assert.equal(type,'change');listeners.delete(fn);}};
 const context=vm.createContext({window:{get scrollY(){return scrollY;},scrollBy:({top})=>{scrollY+=top;},scrollTo:({top})=>{scrollY=top;}},document,
  localStorage:{getItem(key){assert.equal(key,'daruri-reader-v2');if(getThrows)throw Error('privacy');return storage.value;},setItem(key,value){assert.equal(key,'daruri-reader-v2');if(setThrows)throw Error('privacy');storage.value=value;writes.push(JSON.parse(value));}},
  matchMedia:()=>({matches:false}),getComputedStyle:()=>({getPropertyValue:()=>70}),requestAnimationFrame:fn=>frames.push(fn)
 });
 vm.runInContext(moduleCode,context);
 return {context,api:context.window.DaruriReadingStyles,controls,attributes,attributeWrites,writes,storage,listeners,
  fire(index,value){const target=controls[index];target.value=value;for(const listener of listeners)listener({target});},
  flush(){frames.splice(0).forEach(fn=>fn());},top:()=>passage.getBoundingClientRect().top};
}
test('style module validates, synchronizes both selectors and has bounded side effects',()=>{
 const f=fixture();let preserved=0;const changes=[];assert.deepEqual(Array.from(f.api.choices),['quiet','book','structured']);
 for(const value of ['wrong','__proto__','constructor',null,42])assert.equal(f.api.normalise(value),'quiet');
 const controller=f.api.init({value:'wrong',preserve:work=>{preserved++;work();},onChange:value=>changes.push(value)});
 assert.equal(controller.get(),'quiet');assert.ok(f.controls.every(control=>control.value==='quiet'));assert.equal(changes.length,0);
 assert.equal(controller.set('book'),true);assert.equal(controller.get(),'book');assert.ok(f.controls.every(control=>control.value==='book'));assert.equal(preserved,1);assert.deepEqual(changes,['book']);
 controller.set('book');assert.equal(preserved,1);assert.equal(changes.length,1);
 assert.equal(controller.set('bad'),false);assert.equal(controller.get(),'book');assert.equal(preserved,1);
 assert.ok(f.attributeWrites.every(([name])=>name==='data-reading-style'));assert.equal(f.attributes['data-arabic-font'],'amiri');assert.equal(f.attributes['data-english-font'],'original');assert.equal(f.attributes['data-theme'],'dark');
 f.fire(1,'structured');assert.equal(controller.get(),'structured');assert.ok(f.controls.every(control=>control.value==='structured'));
});
test('reinitialization removes old handlers and destroy removes the active handler',()=>{
 const f=fixture(),oldChanges=[],newChanges=[];f.api.init({value:'book',onChange:value=>oldChanges.push(value)});const next=f.api.init({value:'quiet',onChange:value=>newChanges.push(value)});assert.equal(f.listeners.size,1);
 f.fire(0,'structured');assert.deepEqual(oldChanges,[]);assert.deepEqual(newChanges,['structured']);next.destroy();assert.equal(f.listeners.size,0);
});
function integrate(f){
 const prefixes=['function getSaved()','const saved=','const mobile=','const state=','state.parallelArabicSide=','state.stackedArabicOrder=','state.arabicFont=','state.englishFont=','state.pageStyle=','function save()'];
 const source=prefixes.map(prefix=>{const line=html.split('\n').find(line=>line.startsWith(prefix));assert.ok(line,'Reader source '+prefix);return line;}).join('\n');
 const marker='/* DARURI READING POSITION START */',end='/* DARURI READING POSITION END */';const at=html.indexOf(marker),until=html.indexOf(end,at);assert.ok(at>=0&&until>at);
 const init=html.split('\n').find(line=>line.startsWith('window.DaruriReadingStyles?.init('));assert.ok(init,'Reader initialization wiring');
 vm.runInContext(source+'\n'+html.slice(at,until+end.length)+'\nconst qaController='+init,f.context);
 f.state=()=>JSON.parse(vm.runInContext('JSON.stringify(state)',f.context));f.controller=vm.runInContext('qaController',f.context);
 return f;
}
test('reader defaults/restores style, preserves other settings and persists reloads',()=>{
 for(const value of ['quiet','book','structured','bad']){const f=integrate(fixture({saved:{pageStyle:value,arabicFont:'scheherazade',englishFont:'literata',theme:'dark',fontScale:1.15,parallelArabicSide:'left',stackedArabicOrder:'bottom'}}));assert.equal(f.state().pageStyle,value==='bad'?'quiet':value);assert.equal(f.controller.get(),f.state().pageStyle);assert.equal(f.writes.length,0);const before=f.state();f.controller.set(f.state().pageStyle==='book'?'structured':'book');const after=f.state();delete before.pageStyle;delete after.pageStyle;assert.deepEqual(after,before);assert.equal(f.writes.length,1);const next=integrate(fixture({rawSaved:f.storage.value}));assert.equal(next.state().pageStyle,f.state().pageStyle);assert.equal(next.state().arabicFont,'scheherazade');assert.equal(next.state().englishFont,'literata');}
 const empty=integrate(fixture());assert.equal(empty.state().pageStyle,'quiet');assert.equal(empty.state().arabicFont,'amiri');assert.equal(empty.state().englishFont,'original');
});
test('storage errors and malformed preferences still permit an in-session style change',()=>{
 for(const options of [{getThrows:true,setThrows:true},{rawSaved:'{'},{rawSaved:'null'}]){const f=integrate(fixture(options));assert.equal(f.state().pageStyle,'quiet');f.controller.set('structured');assert.equal(f.state().pageStyle,'structured');assert.equal(f.attributes['data-reading-style'],'structured');}
});
test('style and another reading change share the first visible-passage anchor',()=>{
 for(const styleFirst of [true,false]){const f=integrate(fixture()),top=f.top();const other=()=>vm.runInContext("preserveVisiblePassage(()=>document.documentElement.setAttribute('data-arabic-font','noto'))",f.context);if(styleFirst){f.controller.set('book');other();}else{other();f.controller.set('book');}f.flush();assert.equal(f.top(),top);f.controller.set('structured');f.flush();assert.equal(f.top(),top);}
});
console.log('PASS: '+groups+' compact-menu/style groups; direct routes, collapsed native navigation, reachable fallback links, named glyphs, native dropdowns, scoped style module, persistence, restricted storage and shared reading anchors. Visual/device behavior remains a separate browser check.');
