#!/usr/bin/env python3
"""Build ordinary A4, low-ink PDFs from the canonical 258-section Daruri reader.
No scholarly footnotes, dictionary, application dossiers, study tasks or editorial
section headings. Original source headings and unobtrusive § references remain.
Includes four complete print editions, four-part booklets and lesson selections.
"""
from __future__ import annotations
from pathlib import Path
import argparse, html, json, re, hashlib, zipfile
from weasyprint import HTML
import fitz

HERE=Path(__file__).resolve().parent
DARURI=HERE.parent
E=html.escape
FONTS=HERE/'fonts'
SOURCE=(DARURI/'edition-r3-20261020.js').read_text(encoding='utf-8')
M=re.search(r'textContent\s*=\s*("(?:[^"\\]|\\.)*")\s*;',SOURCE,re.S)
if not M:raise ValueError('Canonical edition payload missing')
BOOK=json.loads(json.loads(M[1]))
SECTIONS={s['id']:s for s in BOOK['sections'] if isinstance(s['id'],int)}
assert list(SECTIONS)==list(range(1,259))
assert sum(len(s['segments']) for s in SECTIONS.values())==414
PARTS=[
 ('part-1',1,61,'Introduction and rulings','المقدمة والأحكام'),
 ('part-2',62,147,'Sources of rulings','أصول الأحكام'),
 ('part-3',148,229,'Language and methods of derivation','دلالات الألفاظ والاستنباط'),
 ('part-4',230,258,'Ijtihād and authority','الاجتهاد والتقليد')]
HEADINGS={
 1:('Introduction','المقدمة'),
 10:('Part I · Legal rulings','القسم الأول: الأحكام'),
 62:('Part II · Sources of rulings','القسم الثاني: أصول الأحكام'),
 148:('Part III · Derivation','القسم الثالث: الاستنباط'),
 230:('Part IV · Ijtihād','القسم الرابع: الاجتهاد')}
MODES={
 'bilingual':{'ar':'vocalized','margin':13,'en':9.8,'el':1.39,'arpt':12.6,'al':1.48,'gap':3.4,'s':2},
 'english':{'ar':None,'margin':12.5,'en':10.2,'el':1.43,'gap':4,'s':4},
 'arabic':{'ar':'ar','margin':13,'arpt':13.2,'al':1.48,'gap':3.5,'s':3},
 'arabic-vowelled':{'ar':'vocalized','margin':13,'arpt':13.1,'al':1.53,'gap':3.5,'s':3}}
FONT_CSS='\n'.join(
 '@font-face{font-family:"%s";src:url("%s");font-weight:%s}'%
 (family,(FONTS/name).as_uri(),weight)
 for family,name,weight in [
 ('Noto Serif','NotoSerif-Regular.ttf',400),
 ('Noto Serif','NotoSerif-SemiBold.ttf',600),
 ('Noto Sans','NotoSans-Regular.ttf',400),
 ('Noto Sans','NotoSans-SemiBold.ttf',600),
 ('Noto Naskh Arabic','NotoNaskhArabic-Regular.ttf',400),
 ('Noto Naskh Arabic','NotoNaskhArabic-SemiBold.ttf',600)])
def css(c,mode):
  out=FONT_CSS+'''
  @page{size:A4;margin:%smm;@bottom-right{content:counter(page);font:8pt "Noto Sans";color:#555}}
  body{color:#171717;font:10pt/1.35 "Noto Serif"}
  .opening{padding:0 0 7pt;border-bottom:.6pt solid #777;margin:0 0 8pt}
  .opening h1{font:600 16pt/1.4 "Noto Serif";margin:0 0 3pt}
  .opening h1 span{font:600 19pt/1.5 "Noto Naskh Arabic";padding-left:10pt}
  .opening p{margin:0 0 2pt;font:8.2pt/1.36 "Noto Sans"}
  .opening.arabic-opening{direction:rtl;text-align:right}
  .opening.arabic-opening h1{font:600 23pt/1.5 "Noto Naskh Arabic"}
  .opening.arabic-opening p{font:11pt/1.4 "Noto Naskh Arabic"}
  .toc{margin:0 0 9pt;padding:0 0 6pt;border-bottom:.4pt solid #aaa;font:8.3pt/1.42 "Noto Sans"}
  .toc span{display:inline-block;margin-right:10pt}.toc strong{margin-right:10pt}
  .toc.arabic-toc{font:11pt/1.4 "Noto Naskh Arabic";direction:rtl;text-align:right}
  .toc.arabic-toc span{margin-left:10pt;margin-right:0}
  .part{margin:8pt 0 7pt;break-inside:avoid;break-after:avoid}
  .part h2{font:600 13pt/1.3 "Noto Serif";margin:0}
  .section-head{font:600 10pt/1.38 "Noto Serif";margin:8pt 0 3pt;break-after:avoid;break-inside:avoid}
  .number{font:600 7pt/1.3 "Noto Sans";color:#666;direction:ltr;unicode-bidi:isolate;vertical-align:top}
  .afterword{margin-top:12pt;padding-top:6pt;border-top:.3pt solid #aaa;font:8pt/1.35 "Noto Sans"}
  '''%c['margin']
  out+='''.reading-editorial-title{font:600 9pt/1.32 "Noto Sans";color:#30383a;margin:6pt 0 3pt;break-after:avoid;break-inside:avoid}
  .reading-editorial-title small{font:600 7pt "Noto Sans";text-transform:uppercase;color:#5d6568;padding-right:5pt}
  '''
  if mode=='bilingual':
    out+='''.parallel{width:100%;table-layout:fixed;direction:ltr;border-collapse:collapse;margin:0 0 %spt}
    .parallel td{width:50%%;vertical-align:top;padding:0 0 %spt}
    .parallel .english{padding-right:6pt;border-right:.45pt solid #bbb}
    .parallel .arabic{padding-left:6pt}
    .parallel td p{margin:0}
    .parallel .english{font:%spt/%s "Noto Serif";direction:ltr;text-align:left}
    .parallel .arabic{font:%spt/%s "Noto Naskh Arabic";direction:rtl;text-align:right}
    .section-head{display:table;width:100%%}
    .section-head span{display:table-cell;width:50%%;padding:0 5pt}
    .section-head span.english{font:600 9.7pt/1.3 "Noto Serif"}
    .section-head span.arabic{font:600 12pt/1.4 "Noto Naskh Arabic";text-align:right;direction:rtl}
    '''%(c['s'],c['gap'],c['en'],c['el'],c['arpt'],c['al'])
  elif mode=='english':
    out+='''.textflow{column-count:2;column-gap:15pt;direction:ltr}
    .en-body{font:%spt/%s "Noto Serif";margin:0 0 %spt;orphans:2;widows:2;text-align:left}
    .section-head{margin-bottom:%spt}.part h2{font-size:12pt}
    '''%(c['en'],c['el'],c['gap'],c['s'])
  else:
    out+='''.textflow{column-count:2;column-gap:16pt;direction:rtl}
    .ar-body{font:%spt/%s "Noto Naskh Arabic";text-align:right;direction:rtl;margin:0 0 %spt;orphans:2;widows:2}
    .section-head{margin-bottom:%spt;text-align:right;font:600 14pt "Noto Naskh Arabic"}
    .part h2{text-align:right;font:600 15pt "Noto Naskh Arabic"}
    '''%(c['arpt'],c['al'],c['gap'],c['s'])
  return out
def front(mode,chosen,scope,title):
  ar=mode.startswith('arabic')
  if ar:
    desc='النص الكامل بلا حواشٍ نقدية أو معاجم؛ وتوجد الطبعة العلمية المشروحة على موقع غنماء.' if scope=='full' else 'مقاطع كاملة مختارة من الأصل للقراءة؛ بلا حواشٍ نقدية.'
    title='الضروري في أصول الفقه' if scope=='full' else title
    result='<section class="opening arabic-opening" lang="ar" dir="rtl"><h1>'+E(title)+'</h1><p>أبو الوليد ابن رشد · غنماء · طبعة للطباعة على ورق A4</p><p>'+desc+'</p></section>'
    result+='<nav class="toc arabic-toc"><strong>الأجزاء</strong>'+''.join('<span>§'+str(n)+' · '+E(values[1])+'</span>' for n,values in HEADINGS.items() if n in chosen)+'</nav>'
  else:
    title='Al-Ḍarūrī <span lang="ar" dir="rtl">الضروري في أصول الفقه</span>' if scope=='full' else E(title)
    note='Complete authorial §§1–258. No scholarly apparatus, notes, dictionary, cases or exercises.' if scope=='full' else 'Selected complete source sections; not a continuous abridgement.'
    result='<section class="opening"><h1>'+title+'</h1><p>Ibn Rushd · Gnamma Research · Printable A4</p><p>'+note+' Full commentary remains in the scholarly reference edition.</p></section>'
    result+='<nav class="toc"><strong>Reading map</strong>'+''.join('<span>§'+str(n)+' · '+E(values[0])+'</span>' for n,values in HEADINGS.items() if n in chosen)+'</nav>'
  return result
def build(mode,selection,scope,title,pdf,editorial_titles=False):
  c=MODES[mode];chosen=set(int(s) for s in selection)
  assert chosen and chosen <= set(SECTIONS)
  sections=[SECTIONS[i] for i in range(1,259) if i in chosen]
  content=[front(mode,chosen,scope,title)]
  if mode!='bilingual':content.append('<article class="textflow">')
  for s in sections:
    n=s['id']
    if n in HEADINGS:
      heading=HEADINGS[n][1] if mode.startswith('arabic') else HEADINGS[n][0]
      content.append('<header class="part"><h2'+(' lang="ar" dir="rtl"' if mode.startswith('arabic') else '')+'>'+E(heading)+'</h2></header>')
    if editorial_titles:
      extra=(' lang="en" dir="ltr"' if mode.startswith('arabic') else '')
      content.append('<header class="reading-editorial-title"'+extra+'><small>Editorial §'+str(n)+'</small> '+E(str(s['title']))+'</header>')
    ha,he=s.get('headingAr') or '',s.get('headingEn') or ''
    if ha or he:
      if mode=='bilingual':
        content.append('<header class="section-head"><span class="english">'+E(he)+'</span><span class="arabic" lang="ar" dir="rtl">'+E(ha)+'</span></header>')
      elif mode=='english':content.append('<header class="section-head">'+E(he)+'</header>')
      else:content.append('<header class="section-head" lang="ar" dir="rtl">'+E(ha)+'</header>')
    if mode=='bilingual':
      cells=[]
      for i,seg in enumerate(s['segments']):
        label='<b class="number">'+str(n)+'</b> ' if i==0 else ''
        cells.append('<tr><td class="english"><p>'+label+E(seg['en'])+'</p></td><td class="arabic" lang="ar" dir="rtl"><p>'+label+E(seg[c['ar']])+'</p></td></tr>')
      content.append('<table id="section-'+str(n)+'" class="parallel"><tbody>'+''.join(cells)+'</tbody></table>')
    else:
      for i,seg in enumerate(s['segments']):
        body=seg['en'] if mode=='english' else seg[c['ar']]
        attrs=(' class="en-body"' if mode=='english' else ' class="ar-body" dir="rtl" lang="ar"')
        source_id=' id="section-'+str(n)+'"' if i==0 else ''
        label='<b class="number">'+str(n)+'</b> ' if i==0 else ''
        content.append('<p'+attrs+source_id+'>'+label+E(body)+'</p>')
  if mode!='bilingual':content.append('</article>')
  if scope=='full':
    content.append('<p class="afterword">The later copyist’s record and scholarly apparatus remain in the reference edition.</p>' if not mode.startswith('arabic') else '<p class="afterword" dir="rtl" lang="ar">توجد خاتمة الناسخ والحواشي النقدية والشروح في الطبعة العلمية.</p>')
  html_text='<!doctype html><html><head><meta charset="utf-8"><style>'+css(c,mode)+'</style></head><body>'+''.join(content)+'</body></html>'
  pdf.parent.mkdir(parents=True,exist_ok=True)
  HTML(string=html_text,base_url=HERE.as_uri()+'/').write_pdf(pdf)
  with fitz.open(pdf) as check:
    pages=len(check)
    assert pages>=1 and all(abs(p.rect.width-595.2756)<1 for p in check), 'Not A4'
  result={'path':str(pdf),'edition':mode,'scope':scope,'title':title,'pages':pages,'bytes':pdf.stat().st_size,'sections':list(sorted(chosen)),'paragraphs':sum(len(s['segments']) for s in sections),'notes':0,'editorial_titles':bool(editorial_titles),'size':'A4','sha256':hashlib.sha256(pdf.read_bytes()).hexdigest()}
  print('BUILT',pdf,pages,'pages',flush=True)
  return result
def main():
  parser=argparse.ArgumentParser()
  parser.add_argument('--output-dir',type=Path,default=DARURI)
  parser.add_argument('--mode',choices=list(MODES)+['all'],default='all')
  parser.add_argument('--scope',choices=['full','parts','lessons','all'],default='all')
  parser.add_argument('--editorial-titles',choices=['off','on'],default='off',help='Optional English editorial descriptors, clearly labelled; original headings always included')
  args=parser.parse_args()
  modes=list(MODES) if args.mode=='all' else [args.mode]
  result=[]
  lessons=[]
  if args.scope in ('lessons','all'):
    for name in ('lessons-01-09.json','lessons-10-18.json','lessons-19-28.json'):
      lessons+=json.loads((DARURI/'study'/name).read_text())
    assert len(lessons)==28
  for mode in modes:
    show_titles=args.editorial_titles=='on'
    suffix='-editorial' if show_titles else ''
    if args.scope in ('all','full'):
      result.append(build(mode,range(1,259),'full','Complete reading text',args.output_dir/('print-daruri-'+mode+suffix+'.pdf'),editorial_titles=show_titles))
    if args.scope in ('all','parts'):
      for part,a,b,title,ar in PARTS:
        result.append(build(mode,range(a,b+1),'part',ar if mode.startswith('arabic') else title,args.output_dir/'print'/'parts'/mode/(part+suffix+'.pdf'),editorial_titles=show_titles))
    if args.scope in ('all','lessons'):
      packet_files=[]
      for lesson in lessons:
        selected=sorted(set(int(s) for s in lesson['levels']['basic']['sections']))
        name='%02d-%s%s.pdf'%(lesson['number'],lesson['id'],suffix)
        title=('قراءة الدرس %s'%lesson['number']) if mode.startswith('arabic') else 'Lesson %s: %s'%(lesson['number'],lesson['title'])
        target=args.output_dir/'print'/'lessons'/mode/name
        row=build(mode,selected,'lesson',title,target,editorial_titles=show_titles)
        row.update(lesson_id=lesson['id'],lesson_number=lesson['number'],lesson_title=lesson['title'])
        result.append(row);packet_files.append(target)
      with zipfile.ZipFile(args.output_dir/('print-daruri-'+mode+suffix+'-lesson-packets.zip'),'w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
        for file in packet_files:z.write(file,file.relative_to(args.output_dir))
  catalog=args.output_dir/'print'/('print-catalog'+('-editorial' if args.editorial_titles=='on' else '')+'.json')
  catalog.parent.mkdir(parents=True,exist_ok=True)
  catalog.write_text(json.dumps({'revision':'20261021-print-a4','title':'A4 low-ink Daruri editions','files':result},ensure_ascii=False,indent=2))
  print('BUILT',len(result),'PDFs',flush=True)
if __name__=='__main__':main()
