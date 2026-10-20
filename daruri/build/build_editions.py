#!/usr/bin/env python3
"""Reproducible five-edition Daruri PDF build with edition-specific sources.

Run: PYTHONPATH=/tmp/daruri_pdf_deps python daruri/build/build_editions.py
Dependencies: WeasyPrint 68, fonttools, PyMuPDF. Fonts and selected full historical
articles are retained beside this script. Authorial text comes from the current
reader payload, not a separately maintained transcription.
"""
from __future__ import annotations
import argparse
import hashlib
import html
import json
import re
import unicodedata
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

ROOT=Path(__file__).resolve().parent
DARURI=ROOT.parent
DATA=ROOT/'data'
E=html.escape
NAMES={'scholarly':('daruri.pdf','Bilingual scholarly edition'),
       'study':('daruri-study.pdf','Bilingual study edition'),
       'english':('daruri-english.pdf','English reading edition'),
       'arabic':('daruri-arabic.pdf','Arabic reading edition'),
       'arabic-vowelled':('daruri-arabic-vowelled.pdf','Fully vowelled Arabic edition')}
AR_NAMES={'arabic':'الطبعة العربية للقراءة','arabic-vowelled':'الطبعة العربية المشكولة للقراءة'}
PART_AR=['المقدمة','القسم الأول: الأحكام الشرعية','القسم الثاني: الأدلة الشرعية','القسم الثالث: الألفاظ والاستدلال','القسم الرابع: الاجتهاد والترجيح']
PARENTS={10:None,11:10,17:10,18:17,23:17,26:17,28:17,32:17,36:10,54:10,55:54,56:54,57:54,60:54,
62:None,63:62,66:62,81:66,83:66,94:66,95:94,96:94,97:94,98:94,101:66,102:66,103:66,104:66,105:66,115:62,130:62,141:62,
148:None,151:148,164:148,191:148,193:148,197:148,210:148,227:148,228:148,230:None,231:230,249:230,252:249,256:230}

def read_book():
    s=(DARURI/'edition-r3-20261020.js').read_text()
    m=re.search(r'textContent\s*=\s*("(?:[^"\\]|\\.)*")\s*;',s,re.S)
    if not m:raise ValueError('Reader edition payload not found')
    return json.loads(json.loads(m[1]))

def refs(ids):
    return ' · '.join(f'<a href="#section-{E(str(i))}">§{E(str(i))}</a>' for i in dict.fromkeys(ids))

def alpha(s):
    s=''.join(c for c in unicodedata.normalize('NFD',s.casefold()) if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]','',s)

def cover(edition):
    label=AR_NAMES.get(edition,NAMES[edition][1])
    scopes={
      'scholarly':'Arabic and English · linguistic, textual and source notes<br>153 glossary terms · 157 complete selected historical dictionary articles',
      'study':'Arabic and English · translation and interpretive footnotes<br>Qur’an references · basic subject index',
      'english':'Complete English translation · Qur’an footnotes<br>Bidāya applications · subject index · technical dictionary',
      'arabic':'النص العربي الكامل · إحالات قرآنية في الحواشي · فهرس المصطلحات',
      'arabic-vowelled':'النص العربي المشكول كاملاً · إحالات قرآنية في الحواشي'}
    return '<section class="cover"><div class="brand">GNAMMA RESEARCH</div><p class="arabic-title" lang="ar">الضَّرُورِيُّ فِي أُصُولِ الْفِقْهِ</p><h1>Al-Ḍarūrī fī Uṣūl al-Fiqh</h1><p class="author">Abū al-Walīd Ibn Rushd<br><span lang="ar">أبو الوليد ابن رشد</span></p><p class="edition">'+label+'</p><p class="scope">'+scopes[edition]+'</p><p class="date">20 October 2026 · Structure and contents revision</p></section>'

def guide(edition):
    if edition.startswith('arabic'):
      return '<section class="guide ar-guide" lang="ar" dir="rtl" id="guide"><h1>حول هذه الطبعة</h1><p>هذه نسخة عربية كاملة للقراءة. تُحفظ ألفاظ النص، ويشير الترقيم المتتابع من 1 إلى 258 إلى وحدات الإحالة في هذه الطبعة. وتبيّن إحالات R وBA مقابلة ترقيم طبعة القراءة بترقيم طبعة زياد بوعقل (2015)؛ وليست هذه أرقام مخطوطين مستقلين.</p><p>التشكيل وسيلة قراءة تحريرية، ولم يُقابل المخطوط الإسكوريالي مقابلة مستقلة في إعداد هذه الطبعة. تُفصل خاتمة الناسخ وقيد الملكية عن متن المؤلف.</p><h2>الإحالات القرآنية</h2><p>تُذكر السورة ورقم الآية في حاشية موضع الاستشهاد. وتُبيّن الحاشية بإيجاز الاقتباس بالمعنى أو اللفظ المركّب أو القراءة المنقولة، حيث يلزم ذلك لفهم إحالة النص.</p><h2>الأجزاء والفصول</h2><p>يثبت الفهرس عناوين الأجزاء والفصول والمباحث الواردة في الطبعة العربية، مع بيان مراتبها. وتُذكر المقدمة غير المعنونة وخاتمة الناسخ منفصلتين. عناوين الموضوعات التحريرية المفصلة ليست جزءاً من متن المؤلف، ولا ترد في هذه الطبعة العربية.</p><p>تعتمد العلامات المرجعية على هذا البناء نفسه، وتؤدي إحالات الأقسام إلى مواضعها في هذه النسخة.</p></section>'
    shared='<p>The reading text derives from the al-ʿAlawī 1994 edition, with comparison to Bou Akl’s printed 2015 Arabic edition, French translation and apparatus. The Escorial manuscript has not been independently inspected. English translation and vocalization are editorial.</p><p><b>Numbering.</b> R identifies this edition’s 258 reading units; BA identifies Bou Akl’s 311 numbered units. These are reference systems, not original chapter numbers. The later copyist’s colophon and ownership notice remain separate.</p>'
    contents='<h2>Two complementary contents lists</h2><p><a href="#original-contents"><b>1. Recorded parts and chapters</b></a> translates the 46 headings in the Arabic edition and preserves their hierarchy. <a href="#editorial-contents"><b>2. Editorial section guide</b></a> gives our descriptive titles for all 258 numbered reading units. These titles are editorial aids, not headings in Ibn Rushd’s text; they are confined to the guide and its detailed bookmarks.</p><p>The body gives prominence to the recorded rubrics, with small section references for lookup. The opening discussion has no separately recorded heading. A printed rubric alone does not establish manuscript provenance.</p>'
    if edition=='scholarly':
      body='<p>Arabic appears on the physical left and English on the right. Notes distinguish textual, linguistic and interpretive discussion from <b>Qur’an source</b> and <b>Hadith source</b> references. Source parallels, shortened quotations and unresolved attributions remain qualified.</p>'+shared+contents+'<h2>Reference tools</h2><p>The subject index precedes the historical dictionary. The dictionary retains 153 term dossiers and 157 selected complete historical articles with full working English translations. Shared articles are printed once. Its source-control and headword-relation sections distinguish exact matches, derived forms and related evidence.</p><p>“Complete” describes each selected article, not exhaustive coverage of every dictionary. In particular, <i>ʿumūm al-balwā</i> has related lexical support, not a verified historical article under that exact compound. Comprehensive <i>Tāj al-ʿArūs</i>, <i>Kashshāf</i> and <i>Lisān</i> coverage is not claimed. Translations remain editorial working translations.</p>'
    elif edition=='study':
      body='<p>Arabic appears on the physical left and English on the right. Read continuously, follow the recorded chapters, or use the compact editorial section guide to locate a particular discussion.</p>'+shared+contents+'<h2>Footnotes and subject index</h2><p>Translation and interpretive notes appear as numbered page footnotes. Qur’an references share that sequence; corresponding Arabic and English quotations use one note. Wording qualifications identify paraphrases, combined quotations and reported readings where necessary.</p><p>A compact subject guide and basic alphabetical index provide further routes into the text.</p>'
    else:
      body='<p>This edition presents the complete English translation. The text is followed by illustrative Bidāya applications, a subject index and a technical dictionary.</p>'+shared+contents+'<h2>Qur’an references</h2><p>Numbered page footnotes identify quoted verses and explicit Qur’an references. Qualifications distinguish the verse itself from paraphrase, combined wording or a reported reading.</p>'
    return '<section class="guide" id="guide"><div class="kicker">GNAMMA RESEARCH · '+E(NAMES[edition][1].upper())+'</div><h1>Guide to this edition</h1>'+body+'</section>'

def reference_items(edition):
    ar=edition.startswith('arabic')
    items=[]
    if edition in ['scholarly','english']:items.append(('applications','Applications in the Bidāyat al-mujtahid'))
    if edition=='scholarly':items.extend([('subject-index','Subject index'),('lexicon-introduction','Historical dictionary'),('lexicon-sources','Dictionary sources'),('lexicon-relations','Headword-relation audit'),('concordance','R/BA concordance')])
    elif edition=='english':items.extend([('subject-index','Subject index'),('glossary','Technical dictionary')])
    elif edition=='study':items.append(('subject-index','Basic subject index'))
    elif edition=='arabic':items.append(('glossary','فهرس المصطلحات'))
    return items

def detailed_contents(book,edition):
    ar=edition.startswith('arabic')
    title='فهرس الأجزاء والفصول' if ar else 'Contents 1 · Recorded parts and chapters'
    desc=('العناوين المثبتة في الطبعة العربية، مرتبة بحسب أجزاء الكتاب وتقسيماته. الأرقام إحالات إلى وحدات هذه الطبعة، وليست ترقيم الفصول الأصلي.' if ar else 'The headings recorded in the Arabic edition, translated in their established hierarchy. Section references identify this edition’s reading units; they are not original chapter numbers.')
    opening='النص الافتتاحي غير المعنون' if ar else 'Opening discussion (unheaded)'
    colophon='خاتمة الناسخ وقيد الملكية' if ar else 'Later copyist’s colophon and ownership notice'
    lang=' lang="ar" dir="rtl"' if ar else ''
    out=[f'<section class="contents original-toc{ " ar-toc" if ar else ""}" id="contents"{lang}><a id="original-contents"></a><h1>{title}</h1><p>{desc}</p><div class="toc-columns"><div class="toc-item toc-root"><a class="toc-link" href="#section-1">{E(opening)} <span class="toc-ref">(§§1–9)</span></a></div>']
    for s in book['sections']:
      if not isinstance(s['id'],int) or not s.get('headingAr'):continue
      n=s['id'];depth=0;par=PARENTS.get(n)
      while par is not None:depth+=1;par=PARENTS.get(par)
      label=s['headingAr'] if ar else s.get('headingEn') or s['headingAr']
      out.append(f'<div class="toc-item{ " toc-root" if depth==0 else ""}" style="--depth:{depth}"><a class="toc-link" href="#section-{n}">{E(label)} <span class="toc-ref">(§{n})</span></a></div>')
    out.append(f'<div class="toc-item toc-root"><a class="toc-link" href="#section-colophon">{E(colophon)}</a></div></div>')
    items=reference_items(edition)
    if items:
      out.append('<div class="contents-reference"><h2>'+('أدوات الرجوع' if ar else 'Reference tools')+'</h2><div class="reference-columns">')
      for dest,label in items:out.append(f'<div class="toc-item"><a class="toc-link" href="#{dest}">{E(label)}</a></div>')
      out.append('</div></div>')
    if not ar:out.append('<p class="contents-follow"><a href="#editorial-contents">Next: our numbered editorial section guide</a></p>')
    out.append('</section>')
    if ar:return ''.join(out)
    out.append('<section class="contents editorial-toc" id="editorial-contents"><h1>Contents 2 · Editorial section guide</h1><p>Our descriptive labels for all 258 numbered reading units. These are editorial reading aids, not headings in Ibn Rushd’s text. The recorded parts and chapters appear in Contents 1; both lists lead to the same passages.</p><div class="toc-columns">')
    for p in book['parts']:
      out.append('<h2 class="toc-part">'+E(p['label'])+'</h2>')
      for s in book['sections']:
        if isinstance(s['id'],int) and s['part']==p['id']:out.append(f'<div class="toc-item"><a class="toc-link" href="#section-{s["id"]}">{s["id"]}. {E(s["title"])}</a></div>')
    out.append('<div class="toc-item"><a class="toc-link" href="#section-colophon">Later copyist’s colophon</a></div></div></section>')
    return ''.join(out)

def application_notes_for(data,app):
    # The citation data retains reader application IDs and explicit edition scope.
    items=data.get('application_notes_by_section',{})
    if isinstance(items,dict):items=list(items.values())
    return [x for x in items if str(x.get('application_id',x.get('id','')))==app['id'] or x.get('application_n')==app['n']]

APPLICATION_QREFS={
      'B02':('5:6','','Q 5:6'),
      'B06':('16:106','','Q 16:106'),
      'B09':('2:184–185','The phrase “and breaks the fast” is an interpretive supply.','Q 2:184'),
      'B10':('27:30','This does not settle the basmala’s membership in al-Fātiḥa.','basmala'),
      'B12':('4:43 and 5:6','','touching in Arabic'),
      'B14':('5:1','','the general command to fulfil contracts'),
      'B17':('2:196','','Q 2:196')}

def render_applications(book,edition,bm):
    layout='applications applications-english' if edition=='english' else 'applications'
    out=['<section class="page-start" id="applications"><h1 class="backmatter-title">Applications in the Bidāyat al-mujtahid</h1><p class="small">Illustrative legal comparisons. These are editorial commentary, separate from the authorial al-Ḍarūrī.</p><div class="'+layout+'">']
    fn_number=53
    for app in book['apps']:
      text=E(app['text']);qtext=''
      if app['id'] in APPLICATION_QREFS:
        loc,qualification,anchor=APPLICATION_QREFS[app['id']];qtext='Qurʾān '+loc+'.'+(' '+qualification if qualification else '')
        if edition=='english':
          fn_number+=1;fid='application-footnote-'+app['id'];cid='application-call-'+app['id'];mark=f'<sup class="quran-marker"><a id="{cid}" href="#{fid}">{fn_number}</a></sup><span class="footnote" id="{fid}"><b>{fn_number}.</b> {E(qtext)}</span>'
          if text.count(E(anchor))!=1:raise ValueError('Ambiguous application Qur’an anchor: '+app['id'])
          text=text.replace(E(anchor),E(anchor)+mark,1)
      out.append(f'<article class="application" id="application-{E(app["id"])}"><h3>{app["n"]} · {E(app["title"])}</h3><p class="locator"><a href="{E(app["url"],quote=True)}">{E(app["book"])} · {E(app["locator"])}</a></p><p>{text}</p>')
      if edition=='scholarly' and qtext:out.append('<p class="source-note"><b>Qur’an source.</b> '+E(qtext)+'</p>')
      for n in application_notes_for(bm,app):
        if edition=='english':continue
        txt=n.get('text_en',n.get('text',n.get('note_text','')))
        if app['id']=='B10':continue
        if app['id']=='B12':txt=txt.split('. ',1)[1]
        if app['id']=='B14':txt=txt.split('; for the command')[0]+'.'
        if txt:out.append('<p class="source-note"><b>Hadith source.</b> '+E(txt)+'</p>')
      out.append('<p class="refs">'+refs([app['n']]+app.get('also',[]))+'</p></article>')
    out.append('</div></section>');return ''.join(out)

class _ApplicationFootnoteParser(HTMLParser):
    def __init__(self):
      super().__init__(convert_charrefs=True)
      self.calls=[];self.body_ids=[]

    def handle_starttag(self,tag,attrs):
      attrs=dict(attrs);name=attrs.get('id','')
      if tag=='a' and name.startswith('application-call-'):
        self.calls.append({'call_id':name,'target_id':attrs.get('href','').removeprefix('#')})
      if name.startswith('application-footnote-') and 'footnote' in attrs.get('class','').split():
        self.body_ids.append(name)

def validate_application_pagination(document,application_html):
    """Require all seven English application footnotes on their call pages."""
    parser=_ApplicationFootnoteParser();parser.feed(application_html)
    expected_calls={'application-call-'+key for key in APPLICATION_QREFS}
    expected_bodies={'application-footnote-'+key for key in APPLICATION_QREFS}
    call_counts=Counter(c['call_id'] for c in parser.calls);body_counts=Counter(parser.body_ids)
    pages={}
    for page_number,page in enumerate(document.pages,1):
      for name in page.anchors:pages.setdefault(name,page_number)
    mismatches=[]
    for call in parser.calls:
      call_page=pages.get(call['call_id']);body_page=pages.get(call['target_id'])
      expected_target=call['call_id'].replace('application-call-','application-footnote-',1)
      if call['target_id']!=expected_target or call_page is None or body_page is None or call_page!=body_page:
        mismatches.append({**call,'call_page':call_page,'body_page':body_page})
    missing_calls=sorted(expected_calls-pages.keys())
    missing_bodies=sorted(expected_bodies-pages.keys())
    markup_errors={
      'missing_call_ids':sorted(expected_calls-call_counts.keys()),
      'unexpected_call_ids':sorted(call_counts.keys()-expected_calls),
      'duplicate_call_ids':sorted(k for k,v in call_counts.items() if v!=1),
      'missing_body_ids':sorted(expected_bodies-body_counts.keys()),
      'unexpected_body_ids':sorted(body_counts.keys()-expected_bodies),
      'duplicate_body_ids':sorted(k for k,v in body_counts.items() if v!=1)}
    return {'ok':not mismatches and not missing_calls and not missing_bodies and not any(markup_errors.values()),
      'page_count':len(document.pages),'calls_checked':len(parser.calls),'footnote_bodies_checked':len(parser.body_ids),
      'mismatches':mismatches,'missing_call_anchors':missing_calls,'missing_body_anchors':missing_bodies,
      'markup_errors':markup_errors}

def render_glossary(book,edition):
    ar=edition=='arabic';out=['<section class="page-start" id="glossary"><h1 class="backmatter-title">'+('فهرس المصطلحات' if ar else 'Technical dictionary')+'</h1><p class="small">'+('المصطلحات مرتبة هجائياً بحسب صيغتها العربية، مع روابط إلى مواضعها في النص.' if ar else 'Short editorial definitions for use with the reading translation. Section references return to the text.')+'</p><div class="'+('arabic-glossary' if ar else 'glossary-columns')+'">']
    terms=sorted(book['glossary'],key=lambda g:re.sub(r'[\u064b-\u065f\u0670]','',g['ar'])) if ar else sorted(book['glossary'],key=lambda g:alpha(g['term']))
    for i,g in enumerate(terms):
      out.append(f'<article class="glossary-entry" id="glossary-{i}"><h3>'+('<span lang="ar">'+E(g['ar'])+'</span> <span class="small">('+E(g['term'])+')</span>' if ar else E(g['term'])+' <span class="ar" lang="ar">'+E(g['ar'])+'</span>')+'</h3>')
      if not ar:out.append('<p>'+E(g['definition'])+'</p>')
      out.append('<p class="micro">'+refs(g['sections'])+'</p></article>')
    out.append('</div></section>');return ''.join(out)

def subject_guide(book,basic=False):
    taxonomy=json.loads((DARURI/'subject-index-data.json').read_text())
    ordered=sorted(book['index'],key=lambda t:alpha(t['term']))
    lookup={t['term']:(i,t) for i,t in enumerate(ordered)}
    out=['<div class="subject-guide">']
    for g in taxonomy['groups']:
      terms=g.get('examples') or g['terms'][:3]
      terms=terms[:3]
      links=[]
      for term in terms:
        if term not in lookup:raise ValueError('Unknown taxonomy term: '+term)
        i,t=lookup[term]
        if basic:
          sections=list(dict.fromkeys(n for sub in t['sub'] for n in sub['sections']))[:2]
          links.append(E(term)+' '+refs(sections))
        else:links.append(f'<a href="#index-{i}">{E(term)}</a>')
      out.append('<article><h3>'+E(g['title'])+'</h3><p>'+E(g['description'])+'</p><p class="subject-links">'+' · '.join(links)+'</p></article>')
    out.append('</div>');return ''.join(out)

def render_index(book,basic=False):
    title='Basic subject index' if basic else 'Subject index'
    intro=('A compact guide to subjects, followed by a short alphabetical finding aid. R numbers refer to the small reference markers in the text.' if basic else 'Begin with a subject below or use the alphabetical entries. The groupings are editorial browsing aids; a concept may belong to several subjects. Each subentry links to its exact numbered passage.')
    out=['<section class="page-start" id="subject-index"><h1 class="backmatter-title">'+title+'</h1><p class="small">'+intro+'</p>'+subject_guide(book,basic)+'<h2 class="index-alphabetical-title">Alphabetical index</h2>']
    if basic:
      data=json.loads((DATA/'basic-index.json').read_text())
      out.append('<div class="basic-index">'+''.join('<p>'+E(t['term'])+' · '+refs(t['sections'])+'</p>' for t in data)+'</div></section>')
      return ''.join(out)
    out.append('<div class="index-columns">')
    for i,t in enumerate(sorted(book['index'],key=lambda t:alpha(t['term']))):
      out.append(f'<article class="index-entry" id="index-{i}"><h3>{E(t["term"])}</h3>')
      for sub in t['sub']:out.append('<p>'+E(sub['label'])+' · '+refs(sub['sections'])+'</p>')
      out.append('</article>')
    out.append('</div></section>');return ''.join(out)

def render_concordance(book):
    out=['<section class="page-start" id="concordance"><h1 class="backmatter-title">Textual reference concordance · R ↔ BA</h1><p class="small">R numbers identify this reading edition’s 258 sections. BA numbers identify Bou Akl’s printed 2015 subdivisions. Arabic page references remain those of the printed editions.</p><div class="concordance">']
    for s in book['sections']:
      if not isinstance(s['id'],int):continue
      b=s.get('bouAkl',{});ba=str(b.get('start','?'))
      if b.get('end')!=b.get('start'):ba+='–'+str(b.get('end','?'))
      out.append(f'<p><a href="#section-{s["id"]}">R {s["id"]:03d}</a> · BA {E(ba)} · Arabic 1994 p. {E(", ".join(map(str,s.get("pages",[]))))} / 2015 p. {E(str(b.get("arabicPrintedStart","—")))}</p>')
    out.append('</div></section>');return ''.join(out)

def apply_structure_bookmarks(pdf,book,edition,anchors):
    """Build source and editorial outlines from exact named destinations.

    Source headings retain the validated prose-aware hierarchy. Descriptive
    reading titles form their own explicitly editorial branch; never infer
    their source parent from the last preceding rubric.
    """
    import fitz
    ar=edition.startswith('arabic');toc=[]
    def add(level,label,anchor):
      point=anchors[anchor]
      toc.append([level,label,point['page'],{'kind':fitz.LINK_GOTO,'page':point['page']-1,'to':fitz.Point(point['x'],point['y']),'zoom':0}])
    add(1,'حول هذه الطبعة' if ar else 'Guide to this edition','guide')
    add(1,'فهرس الأجزاء والفصول' if ar else 'Contents 1 · Recorded parts and chapters','contents')
    if not ar:add(1,'Contents 2 · Editorial section guide','editorial-contents')
    add(1,'متن الكتاب: الأجزاء والفصول' if ar else 'Text · recorded parts and chapters','section-1')
    add(2,'النص الافتتاحي غير المعنون' if ar else 'Opening discussion (unheaded)','section-1')
    source_count=0
    for section in book['sections']:
      n=section['id']
      if not isinstance(n,int) or not section.get('headingAr'):continue
      depth=0;parent=PARENTS[n]
      while parent is not None:depth+=1;parent=PARENTS[parent]
      label=section['headingAr'] if ar else section.get('headingEn') or section['headingAr']
      add(depth+2,f'{label} (§{n})','section-'+str(n));source_count+=1
    add(1,'خاتمة الناسخ وقيد الملكية' if ar else 'Later copyist’s colophon and ownership notice','section-colophon')
    editorial_count=0
    if not ar:
      add(1,'Editorial section titles · our descriptive labels','editorial-contents')
      for part in book['parts']:
        add(2,part['label'],'section-'+str(part['start']))
        for section in book['sections']:
          if isinstance(section['id'],int) and section['part']==part['id']:
            add(3,f"{section['id']}. {section['title']}",'section-'+str(section['id']));editorial_count+=1
    items=reference_items(edition)
    if items:
      first=min(anchors[dest]['page'] for dest,_ in items)
      add(1,'أدوات الرجوع' if ar else 'Reference tools',items[0][0])
      for entry in pdf.get_toc(simple=False):
        if entry[2]>=first:
          # All generated reference roots are level 1; their original internal
          # hierarchy remains intact beneath this one reference-tools branch.
          entry[0]+=1;toc.append(entry)
    if source_count!=46 or editorial_count!=(0 if ar else 258):raise ValueError('Incomplete structural outline')
    if any(toc[i][0]>toc[i-1][0]+1 for i in range(1,len(toc))):raise ValueError('Outline level jump')
    pdf.set_toc(toc,collapse=2)
    got=pdf.get_toc(simple=False)
    if len(got)!=len(toc):raise ValueError('Outline write was incomplete')
    if any(row[2]<1 or row[2]>len(pdf) for row in got):raise ValueError('Invalid outline page')
    return {'source_headings':source_count,'editorial_titles':editorial_count,'colophon_level':1,'arabic_labels':ar,'ok':True}

def build(edition,output):
    from weasyprint import HTML,CSS
    from weasyprint.text.fonts import FontConfiguration
    from main_text import render_main,MAIN_TEXT_CSS,validate_main,repeat_footnote_plan,footnote_break_plan,validate_pagination
    from backmatter import render_lexicon,LEXICON_CSS
    book=read_book();q=json.loads((DATA/'quran-source-notes.json').read_text());h=json.loads((DATA/'hadith-source-notes.json').read_text());bm=json.loads((DATA/'backmatter-source-notes.json').read_text());full=json.loads((DATA/'full-headwords.json').read_text())
    footer='<div class="footer"><a href="#contents">'+('الفهرس' if edition.startswith('arabic') else 'Contents')+'</a>'
    if edition in ['scholarly','study','english']:footer+='<a href="#subject-index">Subject index</a>'
    if edition=='scholarly':footer+='<a href="#lexicon-introduction">Dictionary</a>'
    elif edition=='arabic':footer+='<a href="#glossary">فهرس المصطلحات</a>'
    footer+='</div>'
    body=footer+cover(edition)+guide(edition)+detailed_contents(book,edition)
    main_html=render_main(book,q,h,edition)
    main_check=validate_main(book,q,h,edition,main_html)
    if not main_check['ok']:raise ValueError('Main text validation failed: '+json.dumps(main_check,ensure_ascii=False))
    body+=main_html
    application_html=''
    if edition in ['scholarly','english']:
      application_html=render_applications(book,edition,bm);body+=application_html
    if edition=='scholarly':body+=render_index(book)+render_lexicon(full,bm)+render_concordance(book)
    elif edition=='study':body+=render_index(book,True)
    elif edition=='english':body+=render_index(book)+render_glossary(book,edition)
    elif edition=='arabic':body+=render_glossary(book,edition)
    css=MAIN_TEXT_CSS+'\n'+LEXICON_CSS+'\n'+(ROOT/'styles.css').read_text()
    if edition!='scholarly':
      # WeasyPrint 68 moves unrelated footnotes when enforcing later paragraph widows.
      # Keep source notes with their calls; explicit paragraph breaks handle boundaries.
      paragraph_control=1000
      css+=f'\np,.main-text .source-segment {{orphans:{paragraph_control}!important;widows:{paragraph_control}!important;}}'
    doc_html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="author" content="Ibn Rushd; Gnamma Research editorial translation"><meta name="description" content="Complete reading text with edition-specific source notes"><title>Al-Ḍarūrī · '+E(NAMES[edition][1])+'</title><style>'+css+'</style></head><body>'+body+'</body></html>'
    output.mkdir(parents=True,exist_ok=True);filename=NAMES[edition][0];html_path=output/(filename+'.html');html_path.write_text(doc_html)
    font_config=FontConfiguration();doc=HTML(string=doc_html,base_url=str(ROOT)).render(font_config=font_config)
    plan=[];forced_breaks=[]
    if edition!='scholarly':
      for attempt in range(12):
        next_plan=repeat_footnote_plan(doc)
        next_breaks=sorted(set(forced_breaks)|set(footnote_break_plan(doc,main_html)))
        if next_plan==plan and next_breaks==forced_breaks:break
        plan=next_plan;forced_breaks=next_breaks
        q['_repeat_footnote_anchors']=plan;q['_footnote_break_before']=forced_breaks
        revised_main=render_main(book,q,h,edition)
        doc_html=doc_html.replace(main_html,revised_main,1);main_html=revised_main
        doc=HTML(string=doc_html,base_url=str(ROOT)).render(font_config=font_config)
      else:raise ValueError('Repeated-reference footnotes did not settle')
      html_path.write_text(doc_html)
    pagination_check=validate_pagination(doc,main_html) if edition!='scholarly' else {'ok':True,'note':'Scholarly notes use the local apparatus.'}
    if not pagination_check['ok']:raise ValueError('Footnote pagination failed: '+json.dumps(pagination_check,ensure_ascii=False))
    application_check=validate_application_pagination(doc,application_html) if edition=='english' else None
    if application_check is not None and not application_check['ok']:
      raise ValueError('Application footnote pagination failed: '+json.dumps(application_check,ensure_ascii=False))
    anchors={}
    for i,page in enumerate(doc.pages,1):
      for name,point in page.anchors.items():anchors.setdefault(name,{'page':i,'x':point[0]*.75,'y':point[1]*.75})
    missing=[str(i) for i in list(range(1,259))+['colophon'] if 'section-'+str(i) not in anchors]
    if missing:raise ValueError('Missing text destinations: '+str(missing))
    pdf_path=output/filename
    temporary_pdf=output/(filename+'.building')
    doc.write_pdf(temporary_pdf)
    import fitz
    pdf=fitz.open(temporary_pdf);bad_links=[];links=0;expanded_note_links=0
    if not len(pdf) or not temporary_pdf.read_bytes().rstrip().endswith(b'%%EOF'):
      raise ValueError('PDF writer did not produce a complete document')
    for i,p in enumerate(pdf):
      for link in p.get_links():
        links+=1
        box=link['from']
        if box.height<.1 and box.width>0:
          link['from']=fitz.Rect(box.x0,max(0,box.y0-3),box.x1,min(p.rect.height,box.y0+5))
          p.update_link(link);expanded_note_links+=1
        if link['kind']==fitz.LINK_GOTO and not 0<=link['page']<len(pdf):bad_links.append((i+1,link))
    if bad_links:raise ValueError('Invalid PDF destinations: '+str(bad_links[:3]))
    outline_check=apply_structure_bookmarks(pdf,book,edition,anchors)
    pdf.saveIncr()
    temporary_pdf.replace(pdf_path)
    meta={'edition':edition,'filename':filename,'pages':len(pdf),'bytes':pdf_path.stat().st_size,'sha256':hashlib.sha256(pdf_path.read_bytes()).hexdigest(),'links':links,'bookmarks':len(pdf.get_toc()),'section_pages':{str(i):anchors['section-'+str(i)]['page'] for i in list(range(1,259))+['colophon']},'anchors':anchors,'source_notes':{'quran':len(q.get('notes',[])),'hadith':len(h.get('notes_by_section',{})) if edition=='scholarly' else 0},'main_text_validation':main_check,'repeated_footnotes':plan,'forced_footnote_breaks':forced_breaks,'footnote_pagination':pagination_check,'expanded_note_links':expanded_note_links,'structural_outline':outline_check,'contents_pages':{'original':list(range(anchors['contents']['page'],anchors['editorial-contents']['page'] if 'editorial-contents' in anchors else anchors['section-1']['page'])),'editorial':list(range(anchors['editorial-contents']['page'],anchors['section-1']['page'])) if 'editorial-contents' in anchors else []}}
    if application_check is not None:meta['application_footnote_pagination']=application_check
    (output/(filename+'.metadata.json')).write_text(json.dumps(meta,ensure_ascii=False,indent=2))
    print(json.dumps({k:v for k,v in meta.items() if k not in ['anchors','section_pages']},ensure_ascii=False),flush=True)
    return meta

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--edition',choices=list(NAMES),action='append');parser.add_argument('--output-dir',type=Path,default=ROOT/'output');args=parser.parse_args()
    for edition in args.edition or list(NAMES):build(edition,args.output_dir)
