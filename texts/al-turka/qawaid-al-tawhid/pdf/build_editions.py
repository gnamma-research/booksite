#!/usr/bin/env python3
"""Build five actual Gnamma Qawāʿid/Tamhīd PDFs from versioned translated source.
Every edition lists only content it actually contains. No speculative full-vowelled Arabic.
"""
import json, re, hashlib, html, pathlib, sys
from collections import defaultdict
from weasyprint import HTML, CSS
from pypdf import PdfReader

ROOT=pathlib.Path(__file__).resolve().parent.parent
PDF=ROOT/'pdf'
PDF.mkdir(exist_ok=True)
def load_js(path):
    s=(ROOT/path).read_text(encoding='utf8')
    m=re.search(r'=\s*(\{.*\})\s*;\s*$',s,re.S)
    if not m:raise ValueError("Not a JSON object assigned to window: "+str(path))
    return json.loads(m.group(1))
MATN=load_js('data/units.js')['units']
CORPUS=json.loads((ROOT/'data/commentary-corpus.json').read_text(encoding='utf8'))['units']
TERMS=load_js('data/linked-lexicon.js')['terms']
REFS=load_js('data/primary-reference-register.js')['items']
assert len(MATN)==61 and len(CORPUS)==110 and len(TERMS)==82
INTRO=[x for x in CORPUS if x.get('part')=='introduction']
OTHERS=[x for x in CORPUS if x.get('part')!='introduction']
BY_QT=defaultdict(list)
for c in OTHERS:
    if not c.get('matnId'):raise ValueError("Unlinked main commentary "+c.get('id',''))
    BY_QT[c['matnId']].append(c)
assert sum(map(len,BY_QT.values()))==70
K=lambda s:html.escape(str(s or ''),quote=True)
def inline(t):return K(t).replace('\n\n','</p><p>').replace('\n','<br>')
def pair(ar,en,kind):
    if kind=='english':return '<div class="en-text" lang="en"><p>'+inline(en)+'</p></div>'
    if kind=='arabic':return '<div class="ar-text" lang="ar" dir="rtl"><p>'+inline(ar)+'</p></div>'
    # source and translation are complete unabridged passages. Stacked to allow
    # long Arabic and English paragraphs to break naturally over A4 pages.
    return '<div class="text-parallel"><div class="ar-text" lang="ar" dir="rtl"><p>'+inline(ar)+'</p></div><div class="en-text" lang="en"><p>'+inline(en)+'</p></div></div>'

def gloss(complete=False):
    out=['<section class="appendix"><h1>Technical dictionary</h1><p class="muted">A reference guide to the terms used in the treatise and commentary.</p>']
    for group in sorted(set(t['category'] for t in TERMS)):
        out.append('<h2>'+K(group)+'</h2>')
        for t in TERMS:
            if t['category']!=group:continue
            if not complete and t['id'] not in {'existence','unrestricted','necessary','possibility','quiddity','determination','gradation','consideration','fixed-entities','manifestation','divine-names','perfect-human','intellect','intuition','unveiling','demonstration','senses','causality','nafsa'}:continue
            out.append('<div class="glossary-entry"><strong>'+K(t['en'])+'</strong> <span class="ar-inline" lang="ar" dir="rtl">'+K(t['ar'])+'</span><p>'+K(t['definition'])+'</p></div>')
    return ''.join(out)+'</section>'

def subject():
    import unicodedata
    def normalize(text):
        text=unicodedata.normalize('NFD',str(text or '')).lower()
        return ''.join(ch for ch in text if not unicodedata.combining(ch)).replace('ٱ','ا').replace('أ','ا').replace('إ','ا')
    original=[*MATN,*CORPUS]
    out=['<section class="appendix"><h1>Subject index</h1><p class="muted">Passage identifiers are live links in this PDF. Select a linked passage to inspect the full original and commentary.</p>']
    for group in sorted(set(t['category'] for t in TERMS)):
        out.append('<h2>'+K(group)+'</h2>')
        for t in TERMS:
            if t['category']!=group:continue
            ar=normalize(t['ar'])
            en=t['en'].split('/')[0].lower().strip()
            aliases=[normalize(a) for a in t['aliases'] if len(a)>5]
            hits=[]
            for u in original:
                text=normalize(u.get('arabic','')+' '+u.get('english',''))
                if (ar in text or (len(en)>=6 and en in text) or any(a in text for a in aliases)):
                    hits.append(u['id'])
                    if len(hits)>=7:break
            anchors=' · '.join('<a href="#'+K(uid)+'">'+K(uid)+'</a>' for uid in hits)
            out.append('<div class="index-entry"><strong>'+K(t['en'])+'</strong> <span class="ar-inline" lang="ar">'+K(t['ar'])+'</span><p>'+anchors+'</p></div>')
    return ''.join(out)+'</section>'

def source_appendix():
    out=['<section class="appendix"><h1>Cited sources</h1>']
    texts={x['id']:x for x in [*MATN,*CORPUS]}
    for r in REFS:
        out.append('<div class="reference-entry"><h2>'+K(r['title'])+'</h2><p>'+K(r['source'])+'</p>')
        quote=r.get('arabic') or ''
        if not quote and r.get('quoteFrom'):
            u=texts.get(r['quoteFrom'])
            if u:
                candidates=[x.strip() for x in re.findall(r'«([^»]{28,12000})»',u['arabic'])]
                ix=int(r.get('quoteIndex',0))
                quote=candidates[ix] if ix<len(candidates) else next((x for x in candidates if len(x)>100),'')
        if quote:out.append('<blockquote class="ar-text" dir="rtl" lang="ar">'+K(quote)+'</blockquote>')
        if r.get('english'):out.append('<p>'+K(r['english'])+'</p>')
        if r.get('note'):out.append('<p>'+K(r['note'])+'</p>')
        out.append('<p class="muted">'+K(r['status'].replace('-',' '))+' · '+K(r.get('sourceUrl',''))+'</p></div>')
    return ''.join(out)+'</section>'

def notes(u,mode):
    if mode=='none':return ''
    ns=u.get('notes') or []
    if mode=='selected':ns=ns[:1]
    if not ns:return ''
    return '<aside class="text-notes"><b>Notes</b><ol>'+''.join('<li>'+K(s)+'</li>' for s in ns)+'</ol></aside>'

CSS_TEXT="""
@page {
 size:A4;
 margin:21mm 19mm 20mm;
 @top-left{content:"GNAMMA · QAWĀʿID AL-TAWḤĪD";font:9px "DejaVu Sans";color:#5f6b69}
 @top-right{content:string(chapter);font:9px "DejaVu Sans";color:#5f6b69}
 @bottom-center{content:counter(page);font:9px "DejaVu Sans";color:#5f6b69}
}
@page :first{@top-left{content:none}@top-right{content:none}@bottom-center{content:none}}
html,body{font-family:"DejaVu Serif",serif;color:#293a40;font-size:10.5pt;line-height:1.62;overflow-wrap:anywhere}
body{margin:0}
h1,h2,h3{font-family:"DejaVu Sans",sans-serif;line-height:1.35}
h1{font-size:21pt;font-weight:500;margin:10mm 0 3mm;bookmark-level:1}
h2{font-size:14pt;font-weight:500;margin:9mm 0 3mm;bookmark-level:2}
h3{font-size:11pt;margin:7mm 0 2mm;bookmark-level:3}
p{margin:0 0 3.3mm}
.cover{break-after:page;min-height:236mm;padding-top:50mm}
.cover h1{font-family:"DejaVu Serif";font-size:35pt;color:#285462;line-height:1.15}
.cover .ar-title{font-family:"Noto Naskh Arabic","DejaVu Sans",serif;font-size:30pt;direction:rtl;text-align:right;color:#285462;margin:10mm 0 15mm}
.cover .subtitle{font-size:14pt;color:#546b71;margin-top:9mm}
.cover .authors{color:#38474a;font-size:11pt;margin-top:24mm}
.cover .type{font-family:"DejaVu Sans";font-size:9pt;letter-spacing:.2em;color:#6e8a88;text-transform:uppercase}
.cover .bottom{font:9pt "DejaVu Sans";color:#65736e;margin-top:43mm}
.toc{break-after:page}.toc a{display:block;padding:2mm 0;color:#365868;text-decoration:none;border-bottom:1px solid #e7eae7}
.section{break-before:page}.section:first-child{break-before:auto}
.section-title{string-set:chapter content();font-size:18pt;margin:0 0 4mm}
.unit{margin:7mm 0 10mm;break-inside:auto}
.unit h2{font-size:12pt;border-bottom:1px solid #d5dedb;padding-bottom:2mm;break-after:avoid}
.unit h3{font-size:11pt;color:#315568;break-after:avoid}
.label{font:8pt "DejaVu Sans";color:#607b7c;text-transform:uppercase;letter-spacing:.1em;margin:2mm 0}
.matn{border-left:2.5pt solid #2a6673;padding-left:5mm;margin:3mm 0 5mm;break-inside:auto}
.commentary{margin:5mm 0 7mm;padding-top:3mm;border-top:.5pt solid #d6dfdc}
.ar-text{font-family:"Noto Naskh Arabic","DejaVu Sans",serif;font-size:15pt;line-height:1.95;text-align:right;direction:rtl;unicode-bidi:plaintext;overflow-wrap:anywhere}
.ar-text p{margin:2mm 0 5mm}.en-text{font-family:"DejaVu Serif",serif;line-height:1.62;font-size:10.4pt}.en-text p{margin:2mm 0 4mm}
.text-parallel .ar-text{margin-bottom:5mm;padding-bottom:3mm;border-bottom:.5pt solid #e3e7e5}
.muted{font:9pt "DejaVu Sans",sans-serif;color:#687b7d}
.text-notes{font:8.1pt/1.55 "DejaVu Sans",sans-serif;color:#526365;margin:4mm 0 6mm;break-inside:auto}
.text-notes li{margin:1mm 0}.text-notes ol{padding-left:6mm;margin:2mm 0}
.appendix{break-before:page}.appendix h2{font-size:13pt;border-bottom:.5pt solid #d4dbd8;padding-bottom:2mm}
.glossary-entry{break-inside:avoid;margin:4mm 0}
.index-entry{margin:3mm 0;break-inside:avoid}.index-entry p{font-size:8pt;margin:1mm 0 3mm}.index-entry a{color:#315568;text-decoration:none}.glossary-entry strong{font:700 10pt "DejaVu Sans";color:#285462}
.ar-inline{font-family:"Noto Naskh Arabic","DejaVu Sans";font-size:14pt;margin-left:3mm}
.glossary-entry p{font-size:9.3pt;margin:1mm 0}
.reference-entry{break-inside:avoid;border-bottom:.5pt solid #ddd;margin-bottom:4mm}
.reference-entry blockquote{background:#f4f6f4;margin:4mm 0;padding:4mm}
"""

def build(edition,filename,title,group,lang,notesMode,appendix):
    cover=f"""<section class="cover"><div class="type">Gnamma Research · {K(group)} edition</div>
      <h1>Qawāʿid al-Tawḥīd<br>and Tamhīd al-Qawāʿid</h1>
      <div class="ar-title" lang="ar">قواعد التوحيد · التمهيد في شرح قواعد التوحيد</div>
      <p class="subtitle">{K(title)}</p>
      <p class="authors">Abū Ḥāmid Muḥammad Turka al-Iṣfahānī · original matn<br>
      Ṣāʾin al-Dīn ʿAlī Ibn Turka · commentary (early fifteenth century)</p>
      <p class="bottom">A bilingual research reader of divine unity, existence, knowledge and manifestation.</p></section>"""
    intro='<section class="toc"><h1>Contents</h1><a href="#intro">Commentator’s introduction</a><a href="#text">Original text and commentary</a>'
    if appendix: intro+='<a href="#gloss">Technical dictionary</a><a href="#subjects">Subject index</a>'
    if appendix=='full':intro+='<a href="#sources">Cited sources and quotations</a>'
    intro+='</section>'
    pieces=[cover,intro,'<section id="intro" class="section"><h1 class="section-title">Introduction to the commentary</h1><p class="muted">Ṣāʾin al-Dīn Ibn Turka</p>']
    for u in INTRO:
        pieces.append('<div class="unit" id="'+K(u['id'])+'"><h2>'+K(u.get('section'))+'</h2>'+pair(u['arabic'],u['english'],lang)+notes(u,notesMode)+'</div>')
    pieces.append('</section><section id="text" class="section"><h1 class="section-title">Matn and commentary</h1>')
    for u in MATN:
        pieces.append('<article class="unit" id="'+K(u['id'])+'"><h2>'+K(u['id']+' — '+u.get('title',''))+'</h2><div class="matn"><p class="label">Original matn · Abū Ḥāmid Turka</p>'+pair(u['arabic'],u['english'],lang)+notes(u,notesMode)+'</div>')
        for c in BY_QT[u['id']]:
            bridge=c.get('precedingMatn')
            if bridge:
                pieces.append('<div class="matn"><p class="label">Additional original quotation</p>'+pair(bridge.get('arabic',''),bridge.get('english',''),lang)+'</div>')
            pieces.append('<div class="commentary" id="'+K(c['id'])+'"><h3>'+K(c['id']+' — '+c.get('section',''))+'</h3><p class="label">Sharḥ · Ṣāʾin al-Dīn Ibn Turka</p>'+pair(c['arabic'],c['english'],lang)+notes(c,notesMode)+'</div>')
        pieces.append('</article>')
    pieces.append('</section>')
    if appendix:
        pieces.append('<div id="gloss">'+gloss(appendix=='full')+'</div>')
        pieces.append('<div id="subjects">'+subject()+'</div>')
    if appendix=='full':pieces.append('<div id="sources">'+source_appendix()+'</div>')
    body=''.join(pieces)
    HTML(string='<!doctype html><html><head><meta charset="utf-8"></head><body>'+body+'</body></html>',base_url=str(ROOT)).write_pdf(str(PDF/filename),stylesheets=[CSS(string=CSS_TEXT)])
    p=PDF/filename
    pdf=PdfReader(str(p))
    assert len(pdf.pages)>15,(filename,len(pdf.pages))
    return dict(filename=filename,title=title,group=group,language=lang,pages=len(pdf.pages),size_bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),description={'none':'Original and commentary, without explanatory notes','selected':'With selected notes and subject guide','full':'Complete source notes, glossary, index and references'}[notesMode],content={'matn':len(MATN),'commentary':len(CORPUS)},default=(edition=='reference'))
jobs=[
 ('bilingual','qawaid-bilingual-reading.pdf','Bilingual Reading','reading','both','none',None),
 ('english','qawaid-english-reading.pdf','English Reading','reading','english','none',None),
 ('arabic','qawaid-arabic-reading.pdf','Arabic Reading','reading','arabic','none',None),
 ('study','qawaid-bilingual-study.pdf','Bilingual Study','study','both','selected','basic'),
 ('reference','qawaid-bilingual-reference.pdf','Bilingual Reference','reference','both','full','full')
]
result=[]
for q in jobs:
    print('BUILD',q[1],flush=True)
    result.append(build(*q))
    print('DONE',q[1],result[-1]['pages'],flush=True)
manifest=dict(revision='2026-11-04',source='Gnamma translated Arabic/English matn and Tamhīd commentary, original edition N and Āshtiyānī edition A',format='A4, searchable Unicode text, source-based content',files=result,arabicVowelled=False,notOffered='A fully vowelled Arabic edition is not made from an unvowelled transcription.')
(PDF/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
print('MANIFEST',len(result),'editions')
