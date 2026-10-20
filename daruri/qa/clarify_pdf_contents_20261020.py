#!/usr/bin/env python3
"""Clarify original/editorial contents without moving any existing text page.

Run from the repository root with PyMuPDF installed. Originals are retained in
--backup-dir; reruns read those originals, making this correction reproducible.
"""
import argparse, hashlib, html, json, subprocess
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[2]
NAMES = ['daruri', 'daruri-study', 'daruri-english', 'daruri-arabic', 'daruri-arabic-vowelled']
BASELINES = {
    'daruri': 'fc82ca3d8ad742d7f19c26af66a21c052db1559f8218b98fe047131260494324',
    'daruri-study': '429dc9f436fd93e59b964d014c5e85132ee21111d510575473ef8953dc80f109',
    'daruri-english': '29db181b82000443ba6def47fa16cf52e835195dc530cee8df5b66ffbbb402de',
    'daruri-arabic': '8b115e51e70e1c618fe10363ecb366d06bdbdd7dcc02bf73a83487ae72bbcb6d',
    'daruri-arabic-vowelled': '2e488e07635760dddbb9388aa3c980e26af8aa1e66333048a8eeb5e21cbbb263',
}
SITE = 'https://gnamma-research.github.io/booksite/daruri/'
INK = (0.13, 0.20, 0.24)
CSS = '''
@font-face { font-family: DejaVu; src: url(DejaVuSans.ttf); }
body { font-family: sans-serif; font-size: 10pt; color: #23333d; margin: 0; line-height: 1.35; }
p { margin: 0 0 6pt 0; } h1,h2,h3 { margin: 0 0 7pt 0; font-weight: bold; }
h1 {font-size:21pt;} h2 {font-size:13pt;} h3 {font-size:11pt;}
.ar {font-family: DejaVu; direction:rtl; text-align:right;}
a {color:#176473; text-decoration:underline;} .muted {color:#58616a;}
.small {font-size:8.8pt;} .panel {padding:9pt 11pt;background:#f0f4f3;border-left:2pt solid #6f9697;}
'''
ARCHIVE = fitz.Archive('/usr/share/fonts/truetype/dejavu')

def put(page, rect, text, css='', min_scale=0.98):
    spare, scale = page.insert_htmlbox(fitz.Rect(rect), text, css=CSS+css, archive=ARCHIVE, scale_low=min_scale)
    if spare < 0 or scale < min_scale:
        raise ValueError(f'Content does not fit page {page.number+1}, rect={rect}: {spare}, {scale}')
    return scale

def replace(page, rect, text, css=''):
    page.add_redact_annot(fitz.Rect(rect), fill=(1,1,1))
    page.apply_redactions(images=0, graphics=0)
    put(page, rect, text, css)

def goto(page, rect, dest):
    page.insert_link({'kind':fitz.LINK_GOTO,'from':fitz.Rect(rect),'page':dest-1,'to':fitz.Point(45,35)})

def goto_text(page, text, dest, occurrence=0):
    found=page.search_for(text)
    if not found: raise ValueError('Missing clickable label: '+text)
    rect=found[occurrence]+(-1,-1,1,1)
    goto(page,rect,dest)

def text_hash(p):
    return hashlib.sha256(p.get_text().encode()).hexdigest()

def link_signature(link):
    return (link.get('kind'), tuple(round(v,3) for v in link['from']), link.get('page'),
            tuple(round(v,3) for v in link.get('to',[])), link.get('uri'), link.get('file'))

def original_appendix(doc, book):
    original = [s for s in book['sections'] if s.get('headingEn') and s['id']!='colophon']
    assert len(original)==46
    intro = book['sections'][0]
    col = next(s for s in book['sections'] if s['id']=='colophon')
    entries = [{'id':'1-9','pdfPage':intro['pdfPage'],'headingEn':'Opening introduction - no printed heading',
                'headingAr':'المقدمة - دون عنوان مطبوع','helper':True}] + original + [
               {'id':'Colophon','pdfPage':col['pdfPage'],'headingEn':"Later copyist's note - outside the authorial text",
                'headingAr':'خاتمة الناسخ - خارج نص المؤلف','helper':True}]
    start=len(doc)+1
    additions=[[1,'Original headings (46) - linked contents',start]]
    for idx in range(2):
        p=doc.new_page(width=595.276,height=841.89)
        put(p,(48,42,548,97),'<p class="small muted">TWO CONTENTS LISTS, ONE TEXT</p><h1>Original headings</h1>')
        put(p,(48,101,548,146),'<p class="small">46 headings recorded in the Arabic edition, with English translations. Repeated headings such as “Chapter” belong to different passages. The introduction and copyist\'s note below are separate navigation aids.</p>')
        put(p,(48,148,548,172),'<p class="small"><a href="'+SITE+'#contents">Website contents</a> &nbsp; | &nbsp; <span style="color:#176473">Editorial section titles: pp. 3-6</span></p>')
        goto_text(p,'Editorial section titles: pp. 3-6',3)
        for j,s in enumerate(entries[idx*24:(idx+1)*24]):
            y=177+j*24.6
            p.draw_line((48,y+23.5),(548,y+23.5),color=(.86,.89,.89),width=.35)
            marker=html.escape(str(s['id']))
            en=html.escape(s['headingEn']); ar=html.escape(s['headingAr'])
            if s.get('helper'): en='<span class="muted">'+en+'</span>'
            put(p,(48,y,315,y+23),f'<span style="font-weight:bold">{marker}</span> &nbsp; {en}',
                'body{font-size:8.3pt;line-height:1.18;}')
            put(p,(321,y,509,y+23),f'<div class="ar">{ar}</div>',
                'body{font-size:9.4pt;line-height:1.18;}')
            put(p,(512,y,549,y+23),f'<p style="text-align:right">{s["pdfPage"]}</p>',
                'body{font-size:9pt;line-height:1.2;}')
            goto(p,(47,y,550,y+23.4),s['pdfPage'])
            additions.append([2,f'{s["id"]}. {s["headingEn"]}',s['pdfPage']])
        put(p,(48,786,548,809),f'<span class="small muted">Select any entry to open its existing PDF page. &nbsp; Original headings {idx+1}/2</span>')
        put(p,(280,811,316,833),f'<p style="text-align:center;font-size:8pt">{p.number+1}</p>')
    return start, additions

def reference(doc,book):
    start,additions=original_appendix(doc,book)
    p=doc[1]
    put(p,(48.5,620,546,789),'<div class="panel"><h2>Two contents lists, one text</h2>'
        '<p>The <b>overview of parts</b> is a short map. The <b>editorial section titles</b> on pp. 3-6 describe all 258 sections. The <b>original headings</b> on pp. '+str(start)+'-'+str(start+1)+' reproduce the 46 headings recorded in the Arabic edition.</p>'
        '<p class="small">For example, §10 is “Discussion of the First Part of This Book” in the original list, and “Definition, divisions, elements, and manifestation of rulings” in the editorial list. Both lead to p. 12.</p>'
        '<p class="small" style="color:#176473">Original headings → p. '+str(start)+' &nbsp; | &nbsp; Editorial section titles → p. 3</p></div>',
        'body{font-size:9.7pt;line-height:1.26;} h2{font-size:12pt;}')
    goto_text(p,'Original headings → p. '+str(start),start); goto_text(p,'Editorial section titles → p. 3',3)
    p=doc[2]
    replace(p,(48,43,550,100),'<p class="small muted">CONTENTS / 1 OF 4</p><h2 style="font-size:19pt">Overview of parts</h2><div class="ar" style="font-size:10pt;text-align:left">نظرة عامة إلى أقسام الكتاب</div>',
            'body{line-height:1.05;} p{margin-bottom:4pt;} h2{margin-bottom:3pt;}')
    put(p,(303,102,549,195),'<div class="panel"><p><b>Original headings · 46</b><br>Recorded Arabic headings: pp. '+str(start)+'-'+str(start+1)+'.</p><p><b>Editorial section titles · 258</b><br>Descriptive titles: below and pp. 4-6.</p></div>',
        'body{font-size:8.5pt;line-height:1.18;} .panel{padding:6pt 8pt;} p{margin-bottom:6pt;}')
    goto_text(p,'Original headings',start); goto_text(p,'Editorial section titles',3)
    replace(p,(48,202,550,216),'<b>Editorial section titles:</b> §§1-65. Descriptive titles supplied by the editor.',
            'body{font-size:8.4pt;line-height:1.1;}')
    for i in (3,4,5):
        replace(doc[i],(48,43,550,100),f'<p class="small muted">EDITORIAL CONTENTS / {i-1} OF 4</p><h2 style="font-size:19pt">Editorial section titles</h2><div class="ar" style="font-size:10pt;text-align:left">عناوين الفقرات التحريرية</div>',
                'body{line-height:1.05;} p{margin-bottom:4pt;} h2{margin-bottom:3pt;}')
    toc=doc.get_toc(simple=False)
    for row in toc:
        if row[1]=='Linked contents': row[1]='Overview and editorial section titles'
    doc.set_toc(toc+additions,collapse=1)
    return [1,2,3,4,5,259,260]

def simple(doc,name,refstart):
    arabic=name in ('daruri-arabic','daruri-arabic-vowelled')
    if arabic:
        panel=('<div class="panel ar"><h2>كيف تقرأ الفهرس؟</h2><p>تعرض هذه النسخة نظرة عامة إلى المقدمة وأجزاء الكتاب الأربعة وملحقاته. أسماء الأجزاء الوصفية وسائل إرشادية تحريرية.</p>'
            '<p>أما فهرس العناوين الأصلية وفهرس العناوين التحريرية المفصلة في الطبعة المرجعية الثنائية والموقع فيقودان إلى النص نفسه، لكنهما يستعملان عناوين مختلفة. فالعناوين التحريرية تلخص موضوع كل فقرة، والعناوين الأصلية تنقل عناوين الطبعة العربية.</p>'
            '<p><a href="'+SITE+'#contents">فهرسا الموقع: العناوين الأصلية والعناوين التحريرية</a></p>'
            '<p><a href="'+SITE+'daruri.pdf#page='+str(refstart)+'">فهرس العناوين الأصلية في الطبعة المرجعية الثنائية</a></p></div>')
        y=138 if name.endswith('vowelled') else 193
        put(doc[1],(51,y,545,y+247),panel,'body{font-size:11pt;line-height:1.5;} h2{font-size:14pt;}')
    else:
        y=288 if name=='daruri-study' else 239
        put(doc[1],(51,y,545,y+217),'<div class="panel"><h2>How these contents relate</h2>'
            '<p>This edition has one short <b>overview of parts</b>: the introduction, four main parts and backmatter. Its descriptive part labels are editorial reading aids.</p>'
            '<p>The bilingual reference edition and the website also provide two fuller lists: <b>original headings</b> recorded in the Arabic edition, and <b>editorial section titles</b> describing the subjects of all 258 sections. They lead to the same text using different labels.</p>'
            '<p><a href="'+SITE+'#contents">Open the website’s two contents lists</a></p>'
            '<p><a href="'+SITE+'daruri.pdf#page='+str(refstart)+'">Open the reference PDF’s original headings</a></p></div>',
            'body{font-size:10pt;line-height:1.4;} h2{font-size:14pt;}')
    if name.endswith('vowelled'):
        replace(doc[0],(56,643,540,687),'<div class="ar"><b>نظرة عامة إلى أقسام الكتاب</b></div><p style="text-align:right;font-size:8pt">Overview of parts</p>',
                'body{font-size:14pt;line-height:1.15;} p{margin-top:4pt;}')
        put(doc[1],(57,22,539,46),'<div class="ar">تابع النظرة العامة إلى أقسام الكتاب</div>','body{font-size:10pt;}')
        changes=[0,1]
    else:
        if arabic:
            title='<div class="ar" style="font-size:20pt">نظرة عامة إلى أقسام الكتاب</div><p class="small">Overview of parts</p>'
            caption='<div class="ar">عناوين إرشادية موجزة؛ اختر جزءاً أو ملحقاً للانتقال إليه.</div>'
        else:
            title='<h2 style="font-size:21pt">Overview of parts</h2>'
            caption='A short map of the text and backmatter. Select an entry to open its page.'
        replace(doc[2],(50,63,546,102),title,'body{line-height:1.12;} h2{margin:0;} p{margin:1pt 0 0 0;}')
        replace(doc[2],(50,103,546,122),caption,'body{font-size:9pt;line-height:1.2;}')
        changes=[1,2]
    toc=doc.get_toc(simple=False)
    for i,row in enumerate(toc):
        if row[1] in ('Contents','Contents المحتويات','الْمُحْتَوَيَاتُ'):
            title='Overview of parts / نظرة عامة إلى أقسام الكتاب' if arabic or name=='daruri-study' else 'Overview of parts'
            doc.set_toc_item(i,title=title)
    return changes

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--backup-dir',type=Path,default=ROOT.parent/'tmp/pdf-contents-originals');ap.add_argument('--audit',type=Path,default=ROOT/'daruri/qa/pdf-contents-audit-20261020.json');args=ap.parse_args()
    args.backup_dir.mkdir(parents=True,exist_ok=True)
    rendered=ROOT.parent/'tmp/pdf-contents-final';rendered.mkdir(parents=True,exist_ok=True)
    result=subprocess.run(['node','-e',"const fs=require('fs');console.log(JSON.stringify(require('./daruri/qa/load-book.js')(fs.readFileSync('daruri/index.html','utf8'))));"],cwd=ROOT,text=True,capture_output=True,check=True)
    book=json.loads(result.stdout)
    audit={'revision':'2026-10-20-contents','original_headings':46,'editorial_sections':258,'files':{}}
    for name in NAMES:
        path=ROOT/'daruri'/f'{name}.pdf';backup=args.backup_dir/path.name
        source=backup if backup.exists() else path
        if hashlib.sha256(source.read_bytes()).hexdigest()!=BASELINES[name]:
            raise ValueError(f'{name}: expected the original daruri4 PDF. Use --backup-dir with the baseline files; do not reapply to corrected PDFs.')
        if not backup.exists():backup.write_bytes(path.read_bytes())
        old=fitz.open(backup);doc=fitz.open(backup)
        old_text=[text_hash(p) for p in old]
        old_links=[[link_signature(l) for l in p.get_links()] for p in old]
        old_toc=old.get_toc(simple=False)
        changes=reference(doc,book) if name=='daruri' else simple(doc,name,260)
        temp=path.with_suffix('.contents.tmp.pdf')
        doc.save(temp,garbage=4,deflate=True);doc.close();updated=fitz.open(temp)
        unchanged=[i for i in range(len(old)) if i not in changes]
        assert all(text_hash(updated[i])==old_text[i] for i in unchanged),f'Body text changed: {name}'
        for i,links in enumerate(old_links):
            now=[link_signature(l) for l in updated[i].get_links()]
            assert all(l in now for l in links),f'Existing link changed: {name} p{i+1}'
        nt=updated.get_toc(simple=False)
        for i,row in enumerate(old_toc):
            assert nt[i][0]==row[0] and nt[i][2]==row[2],f'Bookmark moved: {name} {i}'
            if 'to' in row[3]:assert tuple(nt[i][3]['to'])==tuple(row[3]['to']),f'Bookmark point moved: {name} {i}'
        for p in updated:
            for l in p.get_links():
                if l['kind']==fitz.LINK_GOTO:assert 0<=l['page']<len(updated)
        for i in changes:
            updated[i].get_pixmap(matrix=fitz.Matrix(1.4,1.4),alpha=False).save(rendered/f'{name}-p{i+1}.png')
        item={'pages':len(updated),'previous_pages':len(old),'modified_pages':[i+1 for i in changes],
              'unchanged_pages_text_verified':len(unchanged),'original_link_count_preserved':sum(map(len,old_links)),
              'original_bookmarks_preserved':len(old_toc),'bookmark_count':len(nt),'valid_internal_links':True}
        updated.close();old.close();temp.replace(path)
        item.update(size_bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest())
        audit['files'][path.name]=item
        print(json.dumps({path.name:item}),flush=True)
    args.audit.write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
if __name__=='__main__':main()
