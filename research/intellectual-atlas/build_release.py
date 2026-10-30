"""Build a self-contained revision-7.2 evidence register and offline viewer.

Pure source: downloads/intellectual-atlas-data.json. No external books or scans
are included; bibliographical records and evidence summaries only.
Run: python research/intellectual-atlas/build_release.py
"""
from __future__ import annotations

from html import escape
from pathlib import Path
import json
import os
import re
import zipfile

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    KeepTogether, HRFlowable, Table, TableStyle
)

ROOT=Path(__file__).resolve().parent
DOWNLOADS=ROOT/'downloads'
DATA=DOWNLOADS/'intellectual-atlas-data.json'
PDF=DOWNLOADS/'Intellectual_Atlas_Reference_Revision7.pdf'
ZIP=DOWNLOADS/'Gnamma_Intellectual_Atlas_Offline_Revision7.zip'
D=json.loads(DATA.read_text(encoding='utf-8'))
assert D['revision']=='avicennian-extensions-7.2-2026-10-30'
assert (len(D['nodes']),len(D['edges']),len(D['sources']),len(D['textual_families']))==(386,362,359,20)
N={n['id']:n for n in D['nodes']}
S={s['id']:s for s in D['sources']+D['history']['sources']}
assert len(N)==len(D['nodes']) and len(S)==len(D['sources'])+len(D['history']['sources'])
assert all(e['source'] in N and e['target'] in N for e in D['edges'])
assert all(set(x.get('sources',[]))<=S.keys() for x in D['nodes']+D['edges'])
assert all(f['root'] in f['member_ids'] and all(id in N for id in f['member_ids']) for f in D['textual_families'])

fonts='/usr/share/fonts/truetype/dejavu'
if (Path(fonts)/'DejaVuSans.ttf').exists():
    pdfmetrics.registerFont(TTFont('Atlas',str(Path(fonts)/'DejaVuSans.ttf')))
    pdfmetrics.registerFont(TTFont('AtlasBold',str(Path(fonts)/'DejaVuSans-Bold.ttf')))
    pdfmetrics.registerFontFamily('Atlas',normal='Atlas',bold='AtlasBold',italic='Atlas',boldItalic='AtlasBold')
    regular,bold='Atlas','AtlasBold'
else:
    # The CI installs the DejaVu fonts. This fallback helps local development,
    # but releases must be checked for transliteration coverage.
    regular,bold='Helvetica','Helvetica-Bold'
INK=colors.HexColor('#263542')
MUTED=colors.HexColor('#61707a')
RULE=colors.HexColor('#c5d2d7')
NAVY=colors.HexColor('#255969')
PAPER=colors.HexColor('#fbfbf8')
def sty(name,sz,leading,space=0,boldface=False,color=INK):
    return ParagraphStyle(name,fontName=bold if boldface else regular,fontSize=sz,
       leading=leading,spaceAfter=space,textColor=color,wordWrap='LTR',
       allowWidows=0,allowOrphans=0,splitLongWords=1,alignment=TA_LEFT)
s_title=sty('Title',23,29,15,True)
s_subtitle=sty('SubTitle',12,17,15)
s_h1=sty('Chapter',17,23,12,True,color=NAVY)
s_h2=sty('Subhead',11,16,6,True)
s_body=sty('Body',9,13,7)
s_small=sty('Small',8,11,4)
s_tiny=sty('Tiny',7.5,10,3,color=MUTED)
s_caption=sty('Caption',8,11,6,color=MUTED)
story=[]
def esc(s):return escape(str(s if s is not None else ''),quote=True)
def p(x,style=s_body):story.append(Paragraph(x,style))
def gap(h=8):story.append(Spacer(1,h))
def ch(title,intro=''):
    story.append(PageBreak());p(esc(title),s_h1)
    if intro:p(esc(intro),s_body)
def para_text(s):return esc(s).replace('\n',' ')
def safe_id(s):return re.sub('[^A-Za-z0-9_:-]','-',s)
def page_number(canvas,doc):
    canvas.saveState()
    w,h=A4
    canvas.setStrokeColor(RULE);canvas.setLineWidth(.45)
    canvas.line(40,42,w-40,42)
    canvas.setFont(regular,7.5);canvas.setFillColor(MUTED)
    canvas.drawString(43,30,'Gnamma Research  |  Intellectual Atlas rev. 7.2  |  30 Oct 2026')
    canvas.drawRightString(w-43,30,f'Page {doc.page}')
    canvas.restoreState()

p('Texts in Time',s_title)
p('Islamic Intellectual Atlas  |  Critical reference and evidence register  |  Revision 7.2  |  30 October 2026',s_subtitle)
p('A source-qualified, selective map of late antique, Islamic and later philosophical, theological and mystical textual networks. This revision preserves the Greek Neoplatonic–Syriac–Arabic–Latin transmission bridge and adds eleven source-qualified Avicennian works, fourteen relationships and two textual families without implying doctrinal agreement.',s_body)
counts=[('Scholarly and contextual records',len(D['nodes'])),
 ('Textual relationships',len(D['edges'])),
 ('Scholarly sources',len(D['sources'])),
 ('Historical sources',len(D['history']['sources'])),
 ('Textual-family routes',len(D['textual_families'])),
 ('Historical scholarly networks',len(D['history'].get('networks',[])))]
t=Table([[Paragraph(esc(k),s_small),Paragraph(str(v),s_small)] for k,v in counts],colWidths=[310,125],hAlign='LEFT')
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#f0f3f3')),
 ('ROWBACKGROUNDS',(0,0),(-1,-1),[PAPER,colors.HexColor('#edf2f2')]),
 ('BOTTOMPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),7),
 ('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,-1),(-1,-1),.5,RULE)]))
story.append(t);gap(16)
p('Editorial warning',s_h2)
p('A commentary is not necessarily an endorsement; a translation may alter the source; the word “Aristotle” in the Arabic Theology is a transmitted pseudonymous attribution. A date may be an author’s activity envelope or upper bound, not a composition date. Schools and political periods are context unless a specific written source justifies an edge.',s_body)
p('The PDF preserves metadata and evidence; the companion Avicennian Summa reader begins a bilingual primary-source translation series. It does not contain complete copyrighted third-party texts or manuscript images. The companion offline archive contains the revision-7.2 interactive atlas and the canonical JSON source register.',s_small)
gap(8)
p('Contents',s_h2)
for text_ in ['1. The Neoplatonic historical bridge','2. Named textual commentary and transmission families',
 '3. Full scholarly work and context register (386 records)','4. Relationship evidence register (362 entries)',
 '5. Historical political and school networks','6. Scholarly and historical source bibliography']:
    p(esc(text_),s_small)

ch('1. The Neoplatonic historical bridge',
 'Distinct scholarly settings and independently documented textual lineages, not an uninterrupted institutional succession.')
bridge=[
 ('Plotinus and Porphyry, c. 245-305','Greek Enneads (edited by Porphyry); Porphyry’s philosophical treatises and introductory logic; Greek original != Arabic Theology'),
 ('Athenian Platonism, c. 410-529','Syrianus on Metaphysics B/Γ/M/N; Proclus on Timaeus and Parmenides; Platonic Theology; Damascius’ criticisms'),
 ('Alexandrian commentary, c. 470-630','Ammonius, Asclepius, John Philoponus, Olympiodorus; Aristotelian scholastic curriculum and disagreements'),
 ('Syriac teaching, c. 490-800','Sergius of Reshaina, Syriac Dionysius, adapted Alexander De principiis; variable scholarly networks rather than one necessary conduit'),
 ('Baghdad and Arabic adaptation, c. 790-920','Arabic Plotinus, pseudo-Aristotelian Theology, Arabic Proclus, Book of Pure Good, al-Kindi milieu and several translation circles'),
 ('Latin and other later receptions','Gerard’s Latin Liber de causis, Moerbeke’s Greek Proclus 1268, Aquinas’ comparison 1272, plus independent Jewish and Ismaili receptions')
]
for title,body in bridge:
    p(esc(title),s_h2);p(esc(body),s_body)
p('Key source families',s_h2)
p('Plotinus Enneads IV-VI -> Arabic Theology of Aristotle; Proclus Elements -> Arabic Book of the Pure Good -> Latin Liber de causis -> Aquinas. Greek Proclus -> Moerbeke’s Latin Elements is a separate Latin path. These relationships describe source-text correspondences or independently documented commentaries, not doctrinal agreement.',s_body)
p('Important limits',s_h2)
p('The Arabic Proclus Timaeus fragment has no defensible translation date in this register and remains unplaced. The Harmony of the Opinions of Plato and Aristotle is attributed to al-Farabi with authorship contested. The Ashari and Maturidi overlays are small source-qualified samples, not exhaustive sectarian assignments.',s_body)

ch('2. Named textual commentary and transmission families',
 'Members may belong to multiple routes. Membership denotes a selected textual network, not authorial school identity.')
for f in D['textual_families']:
    p(esc(f['label'])+'  <font color="#61707a">['+esc(f['id'])+']</font>',s_h2)
    root=N[f['root']]
    p('<b>Base work:</b> '+esc(root['title'])+'  |  <b>Recorded members:</b> '+str(f['record_count'])+
      '  |  <b>Internal relation records:</b> '+str(f['within_family_relationships']),s_small)
    p(esc(f.get('scope','')),s_small)
    for node_id in f['member_ids']:
        n=N[node_id]
        p('<font color="#61707a">'+esc(n['code'])+'</font>  '+esc(n['title'])+
          '  —  '+esc(n.get('author',''))+'  ['+esc(n.get('date_label',''))+']',s_tiny)

ch('3. Full work and context register',
 'All 386 canonical records. Temporal anchors are for plotting labels; the full qualification is retained under each record.')
for i,n in enumerate(D['nodes'],1):
    name=f"{i:03d}  {n.get('code',n['id'])}  {n['title']}"
    p(esc(name),s_h2)
    p('<b>Author / attribution:</b> '+esc(n.get('author',''))+
      '  |  <b>Date:</b> '+esc(n.get('date_label',''))+
      '  |  <b>Region:</b> '+esc(n.get('region',''))+
      '  |  <b>Classification:</b> '+esc(n.get('tradition','')),s_small)
    if n.get('note'):p(para_text(n['note']),s_small)
    if n.get('date_note'):p('<b>Date qualification:</b> '+esc(n['date_note']),s_tiny)
    if n.get('classification_evidence'):
        q='; '.join(f"{x.get('id')}: {x.get('status','')} [{', '.join(x.get('sources',[]))}]" for x in n['classification_evidence'])
        p('<b>Additional affiliation/reception:</b> '+para_text(q),s_tiny)
    if n.get('sources'):p('Sources: '+esc(', '.join(n['sources'])),s_tiny)

ch('4. Relationship evidence register',
 'A link requires a specified type and documentary evidence. Qualified influence is not silently upgraded to direct use.')
for i,e in enumerate(D['edges'],1):
    source=N[e['source']];target=N[e['target']]
    p(esc(f"{i:03d}  {e['id']}  {e['relation']}  [{e.get('confidence','unassessed')}]"),s_h2)
    p('<b>From:</b> '+esc(source['title'])+' ('+esc(source.get('author',''))+')<br/>'+
      '<b>To:</b> '+esc(target['title'])+' ('+esc(target.get('author',''))+')',s_small)
    p(para_text(e.get('evidence','No additional evidence statement.')),s_small)
    p('Sources: '+esc(', '.join(e.get('sources',[])))+'  |  Evidence kind: '+esc(e.get('evidence_kind','')),s_tiny)

ch('5. Historical political and school networks',
 'Political and scholarly bands are separate. Political coexistence is not textual influence, nor does a network imply a continuously operating academy.')
for subgroup,title in [('periods','Political periods'),('networks','Scholarly networks'),('events','Historical events')]:
    p(esc(title),s_h2)
    for h in D['history'].get(subgroup,[]):
        date=h.get('date_label') or (str(h.get('year')) if h.get('year') is not None else '')
        p(esc(h.get('label',''))+'  |  '+esc(date),s_small)
        if h.get('note'):p(para_text(h['note']),s_tiny)
        if h.get('sources'):p('Sources: '+esc(', '.join(h['sources'])),s_tiny)

ch('6. Scholarly and historical source bibliography',
 'Source records are bibliographic leads, not permission to distribute or quote the entire works.')
for group,title in [(D['sources'],'Scholarly sources'),(D['history']['sources'],'Historical references')]:
    p(title,s_h2)
    for i,s in enumerate(group,1):
        p(esc(f"{i:03d} [{s['id']}]  {s.get('author','')}")+' — '+esc(s.get('title','')),s_small)
        extras=[]
        if s.get('locator'):extras.append('Locator: '+str(s['locator']))
        if s.get('note'):extras.append(str(s['note']))
        if s.get('accessed'):extras.append('Accessed '+str(s['accessed']))
        if extras:p(para_text('; '.join(extras)),s_tiny)
        if s.get('url'):
            url=str(s['url']).replace('"','%22')
            p('<link href="'+esc(url)+'" color="#255969"><u>Open cited source</u></link>  '+esc(str(s.get('url',''))[:90]),s_tiny)

PDF.parent.mkdir(parents=True,exist_ok=True)
doc=SimpleDocTemplate(str(PDF),pagesize=A4,rightMargin=43,leftMargin=43,topMargin=45,bottomMargin=53,
 title="Gnamma Intellectual Atlas - Revision 7 Critical Reference",author="Gnamma Research",
 subject="Late antique Neoplatonism, Islamic intellectual history, texts, relationships and source bibliography")
doc.build(story,onFirstPage=page_number,onLaterPages=page_number)
assert PDF.stat().st_size>55000,"PDF unexpectedly small"

# Archive as a portable repo-like directory, preserving relative links from
# index.html to the scripts/styles and neighboring source dossier.
root='research/intellectual-atlas/'
files=[
 ('index.html',ROOT/'index.html'),
 ('atlas-app.js',ROOT/'atlas-app.js'),
 ('site.css',ROOT/'site.css'),
 ('README.md',ROOT/'README.md'),
 ('downloads/intellectual-atlas-data.json',DATA),
 ('downloads/Intellectual_Atlas_Reference_Revision7.pdf',PDF),
 ('neoplatonism/index.html',ROOT/'neoplatonism/index.html'),
 ('avicennian-summa/index.html',ROOT/'avicennian-summa/index.html'),
 ('avicennian-summa/causal-dependence.html',ROOT/'avicennian-summa/causal-dependence.html'),
 ('avicennian-summa/primary-translations.html',ROOT/'avicennian-summa/primary-translations.html'),
 ('avicennian-summa/PRIMARY_TRANSLATION_FASCICLE_E_AVICENNA_VI1.md',ROOT/'avicennian-summa/PRIMARY_TRANSLATION_FASCICLE_E_AVICENNA_VI1.md'),
 ('avicennian-summa/PRIMARY_TRANSLATION_FASCICLE_B_AVICENNA_VI2.md',ROOT/'avicennian-summa/PRIMARY_TRANSLATION_FASCICLE_B_AVICENNA_VI2.md'),
 ('avicennian-summa/PRIMARY_TRANSLATION_FASCICLE_D_AVICENNA_IX5.md',ROOT/'avicennian-summa/PRIMARY_TRANSLATION_FASCICLE_D_AVICENNA_IX5.md'),
 ('avicennian-summa/PRIMARY_TRANSLATION_FASCICLE_C_LAHIJI_PREFERENCE.md',ROOT/'avicennian-summa/PRIMARY_TRANSLATION_FASCICLE_C_LAHIJI_PREFERENCE.md'),
 ('avicennian-summa/handoffs/STAGE_04_PRIMARY_TRANSLATION_FASCICLES.md',ROOT/'avicennian-summa/handoffs/STAGE_04_PRIMARY_TRANSLATION_FASCICLES.md'),
 ('avicennian-summa/chapters/index.html',ROOT/'avicennian-summa/chapters/index.html'),
 ('avicennian-summa/chapters/reader.html',ROOT/'avicennian-summa/chapters/reader.html'),
 ('avicennian-summa/chapters/01-mental-existence-and-quiddity.md',ROOT/'avicennian-summa/chapters/01-mental-existence-and-quiddity.md'),
 ('avicennian-summa/chapters/02-making-and-causal-explanation.md',ROOT/'avicennian-summa/chapters/02-making-and-causal-explanation.md'),
 ('avicennian-summa/chapters/03-substantial-motion-dispute.md',ROOT/'avicennian-summa/chapters/03-substantial-motion-dispute.md'),
 ('avicennian-summa/chapters/04-intellect-soul-and-identity.md',ROOT/'avicennian-summa/chapters/04-intellect-soul-and-identity.md'),
 ('avicennian-summa/chapters/05-four-causes-form-bestowal.md',ROOT/'avicennian-summa/chapters/05-four-causes-form-bestowal.md'),
 ('avicennian-summa/chapters/06-divine-agency-necessity-and-plurality.md',ROOT/'avicennian-summa/chapters/06-divine-agency-necessity-and-plurality.md'),
 ('avicennian-summa/chapters/07-unity-plurality-and-divine-knowledge.md',ROOT/'avicennian-summa/chapters/07-unity-plurality-and-divine-knowledge.md'),
 ('avicennian-summa/chapters/08-universals-quiddity-nafs-al-amr.md',ROOT/'avicennian-summa/chapters/08-universals-quiddity-nafs-al-amr.md'),
 ('avicennian-summa/chapters/09-mawaqif-maqasid-hylomorphism-mental-existence.md',ROOT/'avicennian-summa/chapters/09-mawaqif-maqasid-hylomorphism-mental-existence.md'),
 ('avicennian-summa/chapters/10-conservation-first-cause-and-secondary-agency.md',ROOT/'avicennian-summa/chapters/10-conservation-first-cause-and-secondary-agency.md'),
 ('avicennian-summa/HANDOFF_CURRENT.md',ROOT/'avicennian-summa/HANDOFF_CURRENT.md'),
 ('avicennian-summa/handoffs/STAGE_01_CORPUS_AUDIT.md',ROOT/'avicennian-summa/handoffs/STAGE_01_CORPUS_AUDIT.md'),
 ('avicennian-summa/handoffs/STAGE_02_TEN_CHAPTER_EDITION.md',ROOT/'avicennian-summa/handoffs/STAGE_02_TEN_CHAPTER_EDITION.md'),
 ('avicennian-summa/handoffs/STAGE_03_RELEASE_HANDOFF.md',ROOT/'avicennian-summa/handoffs/STAGE_03_RELEASE_HANDOFF.md'),
 ('avicennian-summa/COMPREHENSIVE_SYSTEM.md',ROOT/'avicennian-summa/COMPREHENSIVE_SYSTEM.md'),
 ('avicennian-summa/PRIMARY_TEXT_CROSSWALK_01.md',ROOT/'avicennian-summa/PRIMARY_TEXT_CROSSWALK_01.md'),
 ('avicennian-summa/four-causes-and-forms-research.md',ROOT/'avicennian-summa/four-causes-and-forms-research.md'),
 ('avicennian-summa/AT_AVICENNIAN_FINDINGS_1.md',ROOT/'avicennian-summa/AT_AVICENNIAN_FINDINGS_1.md'),
 ('avicennian-summa/SYSTEMATIC_FINDINGS_AND_EVIDENCE_AUDIT.md',ROOT/'avicennian-summa/SYSTEMATIC_FINDINGS_AND_EVIDENCE_AUDIT.md'),
 ('avicennian-summa/primary-translation-causation.md',ROOT/'avicennian-summa/primary-translation-causation.md'),
 ('avicennian-summa/SOURCE_REGISTER.md',ROOT/'avicennian-summa/SOURCE_REGISTER.md'),
 ('tahdhib/index.html',ROOT/'tahdhib/index.html'),
 ('publication.json',ROOT/'publication.json')
]
# The archive deliberately omits earlier large binary editions; their links
# remain marked historical and accessible from the live site.
mark=(ROOT/'../../assets/gnamma-mark.svg').resolve()
if mark.is_file(): files.append(('assets/gnamma-mark.svg',mark))
readme="""GNAMMA INTELLECTUAL ATLAS — OFFLINE REVISION 7.2
30 October 2026. Extract the ZIP and open:
    research/intellectual-atlas/index.html
The interactive SVG and scholarly records work locally without a server in
modern browsers allowing local scripts. If a browser blocks file:// scripts,
run: python -m http.server 8123 from the extraction folder and open
http://localhost:8123/research/intellectual-atlas/

Contents: source-critical PDF, current canonical JSON and interactive map;
standalone Neoplatonism and Tahdhib dossiers; plus the Avicennian Summa ten-chapter reader, four new continuous primary translations, their source apparatus, and the source register.
Earlier edition PDFs/ZIPs on the web are NOT included in this archive.
External scholarly hyperlinks require internet access. Sources belong to
their respective authors/publishers. No source books/manuscript scans included.
"""
with zipfile.ZipFile(ZIP,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=7,allowZip64=True) as z:
    for rel,src in files:
        if not src.exists(): raise FileNotFoundError(str(src))
        z.write(src,arcname=root+rel if not rel.startswith('assets/') else rel)
    z.writestr('README-OFFLINE.txt',readme)
with zipfile.ZipFile(ZIP) as z:
    assert z.testzip() is None
    assert root+'index.html' in z.namelist()
    assert root+'avicennian-summa/index.html' in z.namelist()
    assert root+'avicennian-summa/causal-dependence.html' in z.namelist()
    assert root+'avicennian-summa/chapters/index.html' in z.namelist()
    assert root+'avicennian-summa/primary-translations.html' in z.namelist()
    assert root+'avicennian-summa/PRIMARY_TRANSLATION_FASCICLE_E_AVICENNA_VI1.md' in z.namelist()
    assert root+'avicennian-summa/PRIMARY_TRANSLATION_FASCICLE_B_AVICENNA_VI2.md' in z.namelist()
    assert root+'avicennian-summa/PRIMARY_TRANSLATION_FASCICLE_D_AVICENNA_IX5.md' in z.namelist()
    assert root+'avicennian-summa/PRIMARY_TRANSLATION_FASCICLE_C_LAHIJI_PREFERENCE.md' in z.namelist()
    assert root+'avicennian-summa/handoffs/STAGE_04_PRIMARY_TRANSLATION_FASCICLES.md' in z.namelist()
    assert root+'avicennian-summa/chapters/reader.html' in z.namelist()
    assert root+'avicennian-summa/chapters/10-conservation-first-cause-and-secondary-agency.md' in z.namelist()
    assert root+'avicennian-summa/HANDOFF_CURRENT.md' in z.namelist()
    assert all(root+'avicennian-summa/handoffs/'+p in z.namelist() for p in ('STAGE_01_CORPUS_AUDIT.md','STAGE_02_TEN_CHAPTER_EDITION.md','STAGE_03_RELEASE_HANDOFF.md'))
    assert root+'avicennian-summa/SYSTEMATIC_FINDINGS_AND_EVIDENCE_AUDIT.md' in z.namelist()
    assert root+'avicennian-summa/primary-translation-causation.md' in z.namelist()
    assert all(root+'avicennian-summa/chapters/'+chapter in z.namelist() for chapter in ["01-mental-existence-and-quiddity.md","02-making-and-causal-explanation.md","03-substantial-motion-dispute.md","04-intellect-soul-and-identity.md","05-four-causes-form-bestowal.md","06-divine-agency-necessity-and-plurality.md","07-unity-plurality-and-divine-knowledge.md","08-universals-quiddity-nafs-al-amr.md","09-mawaqif-maqasid-hylomorphism-mental-existence.md","10-conservation-first-cause-and-secondary-agency.md"])
    assert root+'downloads/intellectual-atlas-data.json' in z.namelist()
    assert root+'downloads/Intellectual_Atlas_Reference_Revision7.pdf' in z.namelist()
print(json.dumps({'revision':D['revision'],'pdf_bytes':PDF.stat().st_size,
 'zip_bytes':ZIP.stat().st_size,'nodes':len(N),'edges':len(D['edges']),
 'routes':len(D['textual_families']),'scholarly_networks':len(D['history']['networks'])}))
