#!/usr/bin/env python3
"""Publish separate Arabic Tahdhīb PDFs from *unreviewed* machine vowels.

- NEVER overwrites authorial data.js, English, or original PDF editions.
- Verifies each overlay unit has exactly the same unvowelled source letters.
- Source hash + model overlay hash + PDF SHA-256 in a separate manifest.
- Original printed page numbers remain *locators*, not fabricated headings.
- Contains an obvious warning on every page: vowel marks are unreviewed.
"""
from __future__ import annotations
import argparse
import hashlib
import html
import json
from pathlib import Path
import re
import unicodedata
from pypdf import PdfReader
from weasyprint import HTML

DIA=set(chr(i) for i in range(0x64b,0x660))
DIA.update(chr(i) for i in range(0x6d6,0x6ee))
DIA.add(chr(0x670))

def strip(s: str)->str:
    return ''.join(c for c in unicodedata.normalize('NFC',s) if c not in DIA)

def load(path:Path,var:str):
    raw=path.read_bytes()
    text=raw.decode('utf-8').strip()
    prefix='window.'+var+'='
    if not text.startswith(prefix):raise RuntimeError(f'Unexpected JS corpus header: {path}')
    return json.loads(text[len(prefix):].rstrip(';\n ')),raw

def markup(corpus, overlay, source_sha:str)->str:
    src=html.escape
    font=Path('/usr/share/fonts/opentype/fonts-hosny-amiri/Amiri-Regular.ttf')
    if not font.is_file():font=Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
    css="""
@font-face{font-family:AmiriLocal;src:url('FONT') format('truetype')}
@page{size:A4;margin:20mm 17mm 18mm;
 @top-center{content:'GNAMMA · AUTOMATIC VOWELS — NOT SCHOLARLY VERIFIED';font:8pt sans-serif;color:#755}
 @bottom-center{content:counter(page);font:9pt sans-serif;color:#755}
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;color:#222;background:#fff}
body{font:17pt/1.95 AmiriLocal,'DejaVu Sans',serif;direction:rtl;text-align:right}
h1{font:27pt/1.55 AmiriLocal,serif;margin:0 0 12pt}
.cover{direction:ltr;text-align:center;margin:26mm 0 18mm;border-bottom:1pt solid #baa;padding-bottom:12mm;break-after:page}
.cover h1{direction:rtl;text-align:center}
.en{font:11pt/1.65 'DejaVu Sans',sans-serif;text-align:center;direction:ltr}
.warning{font:10pt/1.55 'DejaVu Sans',sans-serif;color:#813f2a;text-align:center;direction:ltr;
 padding:10pt 8pt;border-top:1pt solid #dfb;border-bottom:1pt solid #dfb;margin:16pt 0}
.source{font:9pt/1.4 'DejaVu Sans',sans-serif;color:#777;margin:8pt 0 5pt;direction:ltr;text-align:left}
h2{font:20pt/1.7 AmiriLocal,serif;margin:18pt 0 9pt;break-after:avoid}
.passage{font:17pt/2.0 AmiriLocal,serif;text-align:justify;direction:rtl;unicode-bidi:plaintext;margin:0 0 12pt}
.unit{display:inline;white-space:normal}
.page-label{display:inline-block;direction:ltr;font:8pt/1.2 sans-serif;color:#777;white-space:nowrap;vertical-align:super;padding:0 3pt}
.footer-note{font:9pt/1.7 'DejaVu Sans',sans-serif;direction:ltr;text-align:left;color:#777}
""".replace('FONT',font.as_uri())
    is_logic=len(corpus['units'])==19
    work='Logic' if is_logic else 'Kalām'
    lines=['<!doctype html><html lang="ar"><head><meta charset="utf-8"><style>',css,
           '</style></head><body><section class="cover">',
           '<h1>'+src(corpus.get('title_ar','تهذيب المنطق والكلام'))+'</h1>',
           '<p class="en"><b>Tahdhīb · '+work+' · Arabic with unreviewed computer-generated vowels</b></p>',
           '<p class="warning">AUTOMATIC VOWEL MARKS, NOT PROOFREAD. '
           'Grammar, inflection, proper names and technical terms may be incorrect. '
           'NOT a manuscript-collated critical Arabic edition.</p>',
           '<p class="en">Unvowelled base: Cairo 1330 AH / 1912 CE. '
           'Each source consonant and punctuation mark is retained.</p>',
           '<p class="en">Model: '+src(overlay.get('model','unknown'))+' · '
           'Source SHA-256: '+src(source_sha[:24])+'…</p></section>']
    current=[]
    last_page=None
    def flush():
        nonlocal current
        if not current:return
        lines.append('<p class="passage">'+' '.join(current)+'</p>')
        current=[]
    for u in corpus['units']:
        ar=overlay['units'][u['id']]
        p=u['page']
        title=(len(ar)<150 and re.match(r'^\s*(?:الباب|الفصل|فصل|المقصد)(?:\s|[.:،])',strip(ar)))
        if is_logic:
            flush()
            lines.append('<div class="source">EDITORIAL LOGIC DIVISION '+src(str(p))+
                         ' · Cairo pp. '+src(str(u.get('source_location') or '3–14'))+'</div>')
        elif p!=last_page:
            # Page designator remains only a locator, not an authorial break.
            current.append('<span class="page-label">Cairo p. '+src(str(p))+'</span>')
        if title:
            flush()
            lines.append('<h2>'+src(ar)+'</h2>')
        else:
            current.append('<span class="unit" id="'+src(u['id'])+'">'+src(ar)+'</span>')
        last_page=p
        # Avoid monolithic paragraphs spanning many printed pages while
        # retaining fluent text and its exact inherited punctuation.
        if sum(len(v) for v in current)>1600:flush()
    flush()
    lines.append('<p class="footer-note">Vowelled layer: unreviewed computational aid. '
                 'For source criticism cite the canonical bilingual/unvowelled working edition, '
                 'not this candidate tashkīl.</p></body></html>')
    return ''.join(lines)

def build(root:Path,slug:str):
    edition=root/slug/'edition'
    corpus,src=load(edition/'data.js','GNAMMA_CRITICAL_CORPUS')
    overlay,generated=load(edition/'machine-vowels.js','GNAMMA_TAHDHIB_MACHINE_VOWELS')
    units=corpus['units']
    if overlay.get('schema')!='gnamma-tahdhib-unverified-machine-vowels-v1':
        raise RuntimeError('No complete source-qualified machine vowels available')
    if overlay.get('source_sha256')!=hashlib.sha256(src).hexdigest():
        raise RuntimeError(f'STALE overlay (data.js changed): {slug}')
    if overlay.get('work')!=corpus['work'] or overlay.get('unit_count')!=len(units):
        raise RuntimeError('Overlay text identity mismatch')
    if set(overlay.get('units',{}))!={u['id'] for u in units}:
        raise RuntimeError('Unit count or IDs mismatch')
    for u in units:
        if strip(overlay['units'][u['id']])!=strip(u['ar']):
            raise RuntimeError(f'Unsafe source-letter mutation in {u["id"]}')
    dest=edition/'vocalization';dest.mkdir(parents=True,exist_ok=True)
    name='tahdhib-'+('logic' if len(units)==19 else 'kalam')+'-arabic-machine-unreviewed.pdf'
    target=dest/name
    HTML(string=markup(corpus,overlay,overlay['source_sha256']),base_url=str(dest)).write_pdf(target)
    pdf=PdfReader(str(target)); pages=len(pdf.pages)
    if pages<1 or target.stat().st_size<15000:
        raise RuntimeError(f'Incomplete generated PDF {target}')
    manifest={
      'schema':'gnamma-tahdhib-machine-vowels-pdf-v1',
      'status':'UNREVIEWED AUTOMATIC VOWELS — NOT A CRITICAL EDITION',
      'source_sha256':hashlib.sha256(src).hexdigest(),
      'machine_vowels_sha256':hashlib.sha256(generated).hexdigest(),
      'machine_vowels_model':overlay['model'],
      'unit_count':len(units),
      'vowelled_unit_count':overlay['changed_units'],
      'pdf_file':name,
      'pdf_sha256':hashlib.sha256(target.read_bytes()).hexdigest(),
      'pdf_bytes':target.stat().st_size,
      'pdf_pages':pages,
      'source_status':corpus['editorial_status'][:450],
      'original_arabic_unmodified':True,
      'original_six_canonical_pdfs_untouched':True
    }
    (dest/'edition_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('PASS',slug,manifest['unit_count'],'aligned units',pages,'A4 pages',target.stat().st_size,'bytes',flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--root',default='texts/al-taftazani')
    args=parser.parse_args()
    for slug in ('tahdhib-al-kalam','tahdhib-al-mantiq'):build(Path(args.root),slug)
