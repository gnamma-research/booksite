#!/usr/bin/env node
/** Verify rendered Arabic-toggle states and actual outline clearance.
 * Run: node daruri/qa/verify-arabic-toggle-geometry.js [reader-html]
 * No font/network/browser dependency: SVG outlines are the deployed icon.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(process.argv[2]||path.resolve(__dirname,'..','index.html'),'utf8');
const renderer=html.match(/function languageButtons\(\) \{[\s\S]*?\n\}/)?.[0];
assert(renderer,'Missing language button renderer');
function render(lang,vowels){
  const markup=vm.runInNewContext(renderer+'\nlanguageButtons()',{state:{lang,vowels}});
  const button=markup.match(/<button\b[^>]*data-language-toggle="arabic"[\s\S]*?<\/button>/)?.[0];
  assert(button,'Missing Arabic button');
  const svg=button.match(/<svg\b[^>]*class="gn-arabic-cycle-glyph"[^>]*>[\s\S]*?<\/svg>/)?.[0];
  assert(svg,'Arabic glyph is a bounded SVG');
  assert.match(svg,/viewBox="0 0 24 24"/);assert.match(svg,/aria-hidden="true"/);assert.match(svg,/focusable="false"/);
  assert.doesNotMatch(svg,/<(?:text|use|image)\b|\btransform=/,'Glyph ink must not depend on font layout, external resources or unapplied transforms');
  const paths=[...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"[^>]*\/?\s*>/g)].map(m=>m[1]);
  assert(paths.length,'Outlined Arabic glyph must have visible paths');
  return {button,svg,paths};
}
const off=render('english',false),plain=render('parallel',false),vowelled=render('parallel',true),arabicOnly=render('arabic',true);
assert.match(off.button,/data-arabic-state="off"/);assert.match(off.button,/aria-pressed="false"/);
assert.match(plain.button,/data-arabic-state="plain"/);assert.match(plain.button,/aria-pressed="true"/);
assert.match(vowelled.button,/data-arabic-state="vowelled"/);assert.match(vowelled.button,/Arabic with tashkīl/);
assert.match(arabicOnly.button,/Remove tashkīl, keeping Arabic visible/);
assert.equal(off.paths.length,1);assert.equal(plain.paths.length,1);assert.equal(vowelled.paths.length,2);
assert.equal(off.paths[0],plain.paths[0]);assert.equal(plain.paths[0],vowelled.paths[0],'Adding fatḥa must not resize or shift ayn');
assert.deepEqual(vowelled.paths,arabicOnly.paths);
assert.notEqual(vowelled.paths[0],vowelled.paths[1],'Fatḥa is a distinct mark');

// These shipped outlines contain moves, straight lines and quadratic curves.
// Include quadratic derivative roots, not just endpoints or control boxes, so
// the containment check measures the actual ink extrema.
function bounds(d){
  const tokens=d.match(/[MLQHVZmlqhvz]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi)||[];
  assert.equal(tokens.join('').replace(/\s/g,''),d.replace(/[\s,]/g,''),'Unsupported path command');
  let i=0,command='',x=0,y=0,start=[0,0],box=[Infinity,Infinity,-Infinity,-Infinity];
  const add=(a,b)=>{box[0]=Math.min(box[0],a);box[1]=Math.min(box[1],b);box[2]=Math.max(box[2],a);box[3]=Math.max(box[3],b);};
  const number=()=>{const value=Number(tokens[i++]);assert(Number.isFinite(value),'Malformed outline coordinate');return value;};
  while(i<tokens.length){
    if(/^[a-z]$/i.test(tokens[i]))command=tokens[i++];
    assert(command,'Path starts with a drawing command');
    if(command==='Z'||command==='z'){[x,y]=start;add(x,y);command='';continue;}
    assert.equal(command,command.toUpperCase(),'Outline coordinates must be absolute');
    if(command==='M'||command==='L'){x=number();y=number();add(x,y);if(command==='M'){start=[x,y];command='L';}}
    else if(command==='H'){x=number();add(x,y);}
    else if(command==='V'){y=number();add(x,y);}
    else if(command==='Q'){
      const a=number(),b=number(),endX=number(),endY=number();add(x,y);add(endX,endY);
      for(const [p0,p1,p2]of [[x,a,endX],[y,b,endY]]){
        const denominator=p0-2*p1+p2,t=denominator?(p0-p1)/denominator:-1;
        if(t>0&&t<1){const u=1-t;add(u*u*x+2*u*t*a+t*t*endX,u*u*y+2*u*t*b+t*t*endY);}
      }
      x=endX;y=endY;
    }else throw Error('Unsupported outline command '+command);
  }
  assert(box.every(Number.isFinite));return box;
}
const baseBox=bounds(plain.paths[0]),markBox=bounds(vowelled.paths[1]);
const union=[Math.min(baseBox[0],markBox[0]),Math.min(baseBox[1],markBox[1]),Math.max(baseBox[2],markBox[2]),Math.max(baseBox[3],markBox[3])];
assert(markBox[3]<baseBox[1],'Fatḥa remains distinct above ayn');
assert(Math.abs((union[0]+union[2])/2-12)<0.001,'Union ink is horizontally centered');
assert(Math.abs((union[1]+union[3])/2-12)<0.001,'Vowelled ink is vertically centered');
assert(union[0]>=3-0.001&&union[1]>=3-0.001&&union[2]<=21.001&&union[3]<=21.001,'Outlined ink keeps viewBox padding');

const css=html.match(/#readingControls\s+#persistentLanguages\s+\[data-language-toggle="arabic"\]\s+\.gn-arabic-cycle-glyph\s*\{([^}]+)\}/)?.[1]?.replace(/\s+/g,'');
assert(css,'Missing dedicated Arabic glyph style');
function dimension(name){
  const match=css.match(new RegExp(name+':clamp\\(([\\d.]+)px,calc\\(var\\(--gn-compact-control\\)-([\\d.]+)px\\),([\\d.]+)px\\)!important'));
  assert(match,'Missing explicit responsive '+name);return match.slice(1).map(Number);
}
const width=dimension('width'),height=dimension('height');assert.deepEqual(width,height,'SVG stays square');
assert.match(css,/display:block!important/);assert.match(css,/flex:00auto!important/);
assert.match(css,/margin:0!important/);assert.match(css,/padding:0!important/);
assert.match(css,/fill:currentColor/);assert.match(css,/stroke:none/);
let minimum=Infinity;
for(let button=24;button<=38;button+=0.25){
  const size=Math.min(width[2],Math.max(width[0],button-width[1])),offset=(button-size)/2;
  for(const box of [baseBox,union]){
    const clearance=Math.min(offset+box[0]*size/24,offset+box[1]*size/24,button-offset-box[2]*size/24,button-offset-box[3]*size/24)-1;
    minimum=Math.min(minimum,clearance);
    assert(clearance>=4-0.001,'Arabic ink must clear the inside of a 1px border by at least 4px at button size '+button);
  }
}
console.log('PASS: hidden/plain/vowelled Arabic states; fixed ayn with distinct fatḥa; actual quadratic-outline containment; 24–38px buttons keep at least '+minimum.toFixed(3)+'px of ink clearance inside the border.');
