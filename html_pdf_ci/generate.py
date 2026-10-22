#!/usr/bin/env python3
"""Isolated HTML/CSS book-pagination fixture from the existing Daruri reader.
Not a published edition; this tool only reads daruri/index.html.
"""
from pathlib import Path
import re, json, html, sys
ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parent
source=(ROOT/"daruri/index.html").read_text(encoding="utf-8")
match=re.search(r'<script\b[^>]*\bid=["\x27]editionData["\x27][^>]*>(.*?)</script>',source,re.S|re.I)
if not match: raise RuntimeError("editionData embedded JSON not found; no fixture created")
book=json.loads(match.group(1))
ids=[1,2,11,29,45,76,110,111,121,161,163,185,191,203,218,229,239,241,258]
indexed={int(s["id"]):s for s in book["sections"] if str(s.get("id","")).isdigit()}
notes={str(n["id"]):n for n in book["notes"]}
def e(s):return html.escape(str(s or ""),quote=True)
css=r'''
@font-face {font-family:Amiri;src:url("../daruri/fonts/amiri-regular.woff2") format("woff2")}
@font-face {font-family:Serif4;src:url("../daruri/fonts/source-serif-4-normal.woff2") format("woff2")}
@page {
 size:A4;margin:19mm 17mm 21mm 17mm;
 @top-left {content:string(chapter);font:8pt Serif4,serif;color:#53625f}
 @top-right {content:"GNAMMA  /  DARURI";font:8pt Serif4,serif;color:#53625f}
 @bottom-center {content:counter(page);font:9pt Serif4,serif;color:#53625f}
 @footnote {border-top:.5pt solid #8faaa3;padding-top:4pt;margin-top:5pt}
}
@page :first {@top-left{content:none}@top-right{content:none}}
@page :left {margin-left:22mm;margin-right:15mm}
@page :right {margin-right:22mm;margin-left:15mm}
html,body{margin:0;padding:0;color:#263632;background:#fff;font:10.5pt/1.46 Serif4,Georgia,serif}
h1,h2,h3{font-weight:600;break-after:avoid}
.cover{text-align:center;padding-top:50mm;break-after:page}
.cover h1{font-size:26pt;line-height:1.15;margin:25mm 0 8mm}
.small{font-size:9pt;text-transform:uppercase;letter-spacing:.16em;color:#58766f}
.cover .ar{font-size:23pt}
.toc{break-after:page}
.toc h1{font-size:18pt}
.toc li{margin:3pt 0;break-inside:avoid}
.toc a:after{content:leader('.') target-counter(attr(href url),page)}
h2{font-size:15pt;line-height:1.27;border-bottom:.4pt solid #92aba2;padding:0 0 4pt;margin:15pt 0 8pt;string-set:chapter content()}
p{margin:0 0 6pt;orphans:3;widows:3}
.pair{border-bottom:.3pt solid #d9e2dc;padding-bottom:8pt;margin-bottom:11pt;break-inside:auto}
.pair.parallel{display:grid;grid-template-columns:1fr 1fr;gap:13pt}
.pair.parallel .ar{grid-column:2;grid-row:1}
.pair.parallel .en{grid-column:1;grid-row:1}
.ar{font:13pt/1.75 Amiri,serif;direction:rtl;text-align:right;unicode-bidi:plaintext}
.en{font:10.5pt/1.45 Serif4,Georgia,serif}
.footnote{float:footnote;font:8pt/1.28 Serif4,serif;color:#293735;footnote-policy:auto}
.footnote::footnote-call{content:counter(footnote);vertical-align:super;font-size:7pt}
.footnote::footnote-marker{content:counter(footnote) ". "}
.appendix{break-before:page}
a{color:#24675b;text-decoration:none}
.entry{break-inside:avoid;margin:0 0 6pt}
@media screen {body{margin:24px auto;max-width:800px}}
'''
def build(layout,selector):
    sections=[indexed[i] for i in ids if i in indexed] if selector=="dense" else [indexed[i] for i in sorted(indexed) if 1<=i<=258]
    a=[f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Daruri {selector} {layout}</title><style>{css}</style></head><body>']
    a+=['<header class="cover"><p class="small">Gnamma · Scholarly Texts</p><h1>al-Ḍarūrī fī Uṣūl al-Fiqh</h1><p class="ar" lang="ar" dir="rtl">الضروري في أصول الفقه</p><p>Arabic and English · experimental publication</p><p class="small">Not an authorized final edition</p></header>']
    a+=['<nav class="toc"><h1>Contents · المحتويات</h1><ol>']
    for i,s in enumerate(sections[:24]):
        a.append(f'<li><a href="#section-{i}">§{e(s["id"])} · {e(s.get("title","")[:65])}</a></li>')
    a.append('</ol></nav>')
    total_notes=0
    for i,s in enumerate(sections):
        a.append(f'<section class="chapter" id="section-{i}"><h2>§{e(s["id"])} · {e(s.get("title",""))}</h2>')
        section_notes=[notes[k] for k in s.get("noteIds",[]) if k in notes]
        for k,seg in enumerate(s.get("segments",[])):
            a.append(f'<div class="pair {layout}"><p class="ar" lang="ar" dir="rtl">{e(seg.get("vocalized") or seg.get("ar"))}</p><p class="en" lang="en" dir="ltr">{e(seg.get("en"))}')
            if k==0:
                for note in section_notes:
                    total_notes+=1
                    a.append(f'<span class="footnote" id="note-{i}-{total_notes}"><b>[{e(note["id"])}]</b> {e(note.get("text"))}</span>')
            a.append('</p></div>')
        a.append('</section>')
    a.append('<section class="appendix"><h2>Glossary · المعجم</h2>')
    for x in book.get("glossary",[])[:25]:
        a.append('<p class="entry"><b>'+e(x.get("term") or x.get("headword"))+'</b> — '+e(x.get("definition") or x.get("meaning"))+'</p>')
    a.append('<h2>Source index</h2><p>See <a href="#section-0">§1</a> and the online Gnamma reader.</p></section></body></html>')
    name=f'{selector}_{layout}'
    (OUT/f'{name}.html').write_text(''.join(a),encoding='utf-8')
    return {"fixture":name,"sections":len(sections),"footnotes":total_notes}
meta=[build(mode,scope) for scope in ["dense","full"] for mode in ["parallel","stacked"]]
(OUT/"expected.json").write_text(json.dumps(meta,indent=2))
print(json.dumps(meta))
