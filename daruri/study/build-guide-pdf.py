#!/usr/bin/env python3
"""Build the printable Daruri study companion from the website lesson JSON.

Usage from the repository root:
    python daruri/study/build-guide-pdf.py

Requires reportlab, fonttools, and pypdf. DejaVu Serif and Sans fonts must be
installed; use --font-dir to supply their directory. A supplied --book-data JSON
overrides the current edition JS when building against a specified snapshot.
The build validates all 28 topics, 84 levels, section references, font coverage,
PDF links, and text-field coverage before writing companion-metadata.json.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import os
from pathlib import Path
import re
from datetime import date, datetime, timezone
from urllib.parse import urlencode

from fontTools.ttLib import TTFont as FontToolsFont
from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, CondPageBreak, Frame, HRFlowable, KeepTogether,
    LongTable, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents


HERE = Path(__file__).resolve().parent
DARURI = HERE.parent
SITE = 'https://gnamma-research.github.io/booksite/daruri/'
LEVELS = ('basic', 'intermediate', 'advanced')
LEVEL_NAMES = {
    'basic': 'Basic - Foundations',
    'intermediate': 'Intermediate - Close reading',
    'advanced': 'Advanced - Research',
}
UNITS = {
    1: 'Purpose and method',
    2: 'Rulings and responsibility',
    3: 'Transmission and reports',
    4: 'Abrogation, consensus and presumption',
    5: 'Language and interpretation',
    6: 'Qiyās and legal extension',
    7: 'Prophetic action and approval',
    8: 'Juristic inquiry and authority',
}
INK = colors.HexColor('#20322f')
WATER = colors.HexColor('#35616b')
EARTH = colors.HexColor('#82503d')
MUTED = colors.HexColor('#596962')
LINE = colors.HexColor('#c7d0ca')
PALE = colors.HexColor('#eef3f0')
PAPER = colors.HexColor('#f7f4ee')
PAGE_W, PAGE_H = A4
MARGIN = 18 * mm
WIDTH = PAGE_W - 2 * MARGIN


def clean(value: str) -> str:
    return re.sub('[\u2010-\u2015\u2212]', '-', str(value)).replace('\u00a0', ' ')


def esc(value: str) -> str:
    return html.escape(clean(value), quote=True)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for v in value.values():
            yield from strings(v)
    elif isinstance(value, list):
        for v in value:
            yield from strings(v)


def read_book(path: Path | None):
    if path is None:
        reader = (DARURI / 'index.html').read_text(encoding='utf-8')
        selected = re.search(r'<script src="(edition[^"?]+\.js)(?:\?[^"]*)?"', reader)
        if not selected:
            raise ValueError('No edition JS selected in index.html; supply --book-data.')
        path = DARURI / selected.group(1)
    content = path.read_text(encoding='utf-8')
    if path.suffix == '.json':
        return json.loads(content), path
    match = re.search(r'\.textContent\s*=\s*("(?:\\.|[^"\\])*")\s*;', content, re.S)
    if not match:
        raise ValueError(f'Cannot find editionData textContent in {path}')
    return json.loads(json.loads(match.group(1))), path


def read_lessons():
    files = sorted(HERE.glob('lessons-[0-9][0-9]-[0-9][0-9].json'))
    lessons = sorted(
        [lesson for path in files for lesson in json.loads(path.read_text(encoding='utf-8'))],
        key=lambda x: x['number'],
    )
    if [x['number'] for x in lessons] != list(range(1, 29)):
        raise ValueError('The companion requires all 28 unique lessons.')
    if len({x['id'] for x in lessons}) != 28:
        raise ValueError('Lesson IDs must be unique.')
    for lesson in lessons:
        if lesson['unit'] not in UNITS:
            raise ValueError(f"Invalid unit in lesson {lesson['number']}")
        if set(lesson['levels']) != set(LEVELS):
            raise ValueError(f"All three levels required: {lesson['id']}")
        for key in LEVELS:
            item = lesson['levels'][key]
            for field in ('objective', 'sections', 'explanation', 'example', 'tasks', 'feedback'):
                if not item.get(field):
                    raise ValueError(f'Missing {field}: {lesson["id"]}/{key}')
            if len(item['tasks']) != len(item['feedback']):
                raise ValueError(f'Task/feedback mismatch: {lesson["id"]}/{key}')
    return lessons, files


def fonts(directory: Path, text_values):
    names = {
        'GuideSerif': 'DejaVuSerif.ttf',
        'GuideSerif-Bold': 'DejaVuSerif-Bold.ttf',
        'GuideSans': 'DejaVuSans.ttf',
        'GuideSans-Bold': 'DejaVuSans-Bold.ttf',
    }
    chars = set(''.join(clean(s) for s in text_values))
    chars -= {'\n', '\r', '\t'}
    for name, filename in names.items():
        path = directory / filename
        if not path.is_file():
            raise FileNotFoundError(f'Font missing: {path}; supply --font-dir.')
        cmap = FontToolsFont(path).getBestCmap()
        missing = sorted(c for c in chars if ord(c) not in cmap)
        if missing:
            raise ValueError(f'Unsupported glyphs in {filename}: {missing!r}')
        pdfmetrics.registerFont(TTFont(name, str(path)))
    pdfmetrics.registerFontFamily('GuideSerif', normal='GuideSerif', bold='GuideSerif-Bold', italic='GuideSerif', boldItalic='GuideSerif-Bold')
    pdfmetrics.registerFontFamily('GuideSans', normal='GuideSans', bold='GuideSans-Bold', italic='GuideSans', boldItalic='GuideSans-Bold')


def styles():
    common = dict(textColor=INK, allowWidows=0, allowOrphans=0)
    s = {}
    s['body'] = ParagraphStyle('body', fontName='GuideSerif', fontSize=10.3, leading=14.5, spaceAfter=6, **common)
    s['small'] = ParagraphStyle('small', fontName='GuideSans', fontSize=8.4, leading=11.5, spaceAfter=5, **common)
    s['tiny'] = ParagraphStyle('tiny', fontName='GuideSans', fontSize=7.6, leading=10.1, spaceAfter=2, **common)
    s['eyebrow'] = ParagraphStyle('eyebrow', fontName='GuideSans-Bold', fontSize=8.4, leading=12, textColor=EARTH, spaceAfter=6, keepWithNext=True)
    s['cover'] = ParagraphStyle('cover', fontName='GuideSerif-Bold', fontSize=36, leading=42, spaceAfter=15, **common)
    s['coverSub'] = ParagraphStyle('coverSub', fontName='GuideSans', fontSize=20, leading=28, textColor=WATER, spaceAfter=20)
    s['unit'] = ParagraphStyle('unit', fontName='GuideSans-Bold', fontSize=23, leading=29, textColor=WATER, spaceAfter=14, keepWithNext=True)
    s['lesson'] = ParagraphStyle('lesson', fontName='GuideSerif-Bold', fontSize=18, leading=23, spaceAfter=9, keepWithNext=True, **common)
    s['level'] = ParagraphStyle('level', fontName='GuideSans-Bold', fontSize=12.2, leading=17, textColor=WATER, spaceBefore=16, spaceAfter=7, keepWithNext=True)
    s['label'] = ParagraphStyle('label', fontName='GuideSans-Bold', fontSize=9.1, leading=13, textColor=EARTH, spaceBefore=8, spaceAfter=4, keepWithNext=True)
    s['task'] = ParagraphStyle('task', parent=s['body'], leftIndent=15, firstLineIndent=-15, spaceAfter=5)
    s['term'] = ParagraphStyle('term', parent=s['small'], spaceAfter=4)
    s['summary'] = ParagraphStyle('summary', parent=s['body'], textColor=MUTED, fontSize=11, leading=15.5, spaceAfter=12)
    s['toc0'] = ParagraphStyle('toc0', fontName='GuideSans-Bold', fontSize=10.4, leading=15, textColor=WATER, spaceBefore=10, spaceAfter=4, leftIndent=0, firstLineIndent=0)
    s['toc1'] = ParagraphStyle('toc1', fontName='GuideSans', fontSize=9.0, leading=13, textColor=INK, spaceBefore=3, spaceAfter=3, leftIndent=12, firstLineIndent=0)
    return s


class GuideDocument(BaseDocTemplate):
    def __init__(self, filename, edition_date, **kw):
        self.current_unit = 'Reading companion'
        self.edition_date = edition_date
        self.anchor_pages = {}
        self.level_pages = {}
        self.quran_page_notes = {}
        self.quran_source_pages = {}
        self.page_content_bottom = {}
        frame = Frame(MARGIN, 18 * mm, WIDTH, PAGE_H - 38 * mm,
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        super().__init__(filename, pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                         topMargin=20 * mm, bottomMargin=18 * mm,
                         title='Al-Ḍarūrī: A three-level study guide',
                         author='Gnamma Research',
                         subject='28 questions, 84 guided lessons: foundations, close reading and research',
                         **kw)
        self.addPageTemplates(PageTemplate(id='guide', frames=[frame], onPageEnd=self.footer))

    def beforeDocument(self):
        self.current_unit = 'Reading companion'
        self.anchor_pages = {}
        self.level_pages = {}
        self.quran_page_notes = {}
        self.quran_source_pages = {}
        self.page_content_bottom = {}

    def footer(self, canvas, doc):
        if doc.page == 1:
            return
        canvas.saveState()
        notes = self.quran_page_notes.get(doc.page, [])
        if notes:
            # These compact source notes use the space above the running footer.
            # Refuse a later layout that cannot accommodate them safely, instead
            # of silently painting a footnote over lesson text.
            baseline = 17.5 * mm + (len(notes) - 1) * 11
            separator = baseline + 11
            if self.page_content_bottom.get(doc.page, PAGE_H) < separator + 3:
                raise ValueError(f'Page {doc.page} needs more space for its Qur’an footnotes.')
            canvas.setStrokeColor(LINE)
            canvas.setLineWidth(.45)
            canvas.line(MARGIN, separator, MARGIN + 95, separator)
            canvas.setFont('GuideSans', 8.2)
            canvas.setFillColor(WATER)
            for source in notes:
                canvas.bookmarkHorizontalAbsolute(source['id'], baseline + 9)
                label = f'{source["number"]}. {clean(source["text"])}'
                canvas.drawString(MARGIN, baseline, label)
                canvas.linkURL(source['url'],
                               (MARGIN, baseline - 2, MARGIN + pdfmetrics.stringWidth(label, 'GuideSans', 8.2), baseline + 9),
                               relative=0, thickness=0)
                baseline -= 11
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(.45)
        canvas.line(MARGIN, PAGE_H - 13.5 * mm, PAGE_W - MARGIN, PAGE_H - 13.5 * mm)
        canvas.setFillColor(MUTED)
        canvas.setFont('GuideSans', 7)
        canvas.drawString(MARGIN, PAGE_H - 10.5 * mm, 'GNAMMA  |  AL-ḌARŪRĪ STUDY GUIDE')
        current = clean(self.current_unit)
        while pdfmetrics.stringWidth(current, 'GuideSans', 7) > WIDTH * .53:
            current = current[:-2]
        canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 10.5 * mm, current)
        canvas.setFont('GuideSans', 7.4)
        canvas.drawString(MARGIN, 10 * mm, 'Study companion - '+self.edition_date.strftime('%d %B %Y'))
        canvas.drawCentredString(PAGE_W / 2, 10 * mm, str(doc.page))
        canvas.drawRightString(PAGE_W - MARGIN, 10 * mm, 'Contents')
        canvas.linkRect('', 'contents', (PAGE_W - MARGIN - 37, 8.5 * mm, PAGE_W - MARGIN, 13 * mm), relative=0, thickness=0)
        canvas.restoreState()

    def afterFlowable(self, flowable):
        if isinstance(flowable, (Paragraph, Table)):
            # CondPageBreak can consume unused frame space; track actual content
            # flowables so that empty space is not mistaken for printed text.
            bottom = self.frame._y + flowable.getSpaceAfter()
            self.page_content_bottom[self.page] = min(self.page_content_bottom.get(self.page, PAGE_H), bottom)
        for source in getattr(flowable, '_quran_sources', []):
            self.quran_page_notes.setdefault(self.page, []).append(source)
            self.quran_source_pages[source['id']] = self.page
        if getattr(flowable, '_unit_name', None):
            self.current_unit = flowable._unit_name
        anchor = getattr(flowable, '_anchor', None)
        if anchor:
            self.canv.bookmarkPage(anchor)
            self.anchor_pages[anchor] = self.page
            title = getattr(flowable, '_outline_title', flowable.getPlainText())
            depth = getattr(flowable, '_outline_depth', 0)
            self.canv.addOutlineEntry(clean(title), anchor, depth, closed=(depth < 2))
            if getattr(flowable, '_level_key', None):
                self.level_pages[flowable._level_key] = self.page
        toc = getattr(flowable, '_toc', None)
        if toc:
            depth, text = toc
            self.notify('TOCEntry', (depth, clean(text), self.page, anchor))


def para(text, style, markup=False):
    return Paragraph(text if markup else esc(text), style)


def heading(text, style, anchor, depth=0, toc_depth=None, unit_name=None, level_key=None):
    p = para(text, style)
    p._anchor = anchor
    p._outline_title = text
    p._outline_depth = depth
    if toc_depth is not None:
        p._toc = (toc_depth, text)
    if unit_name:
        p._unit_name = unit_name
    if level_key:
        p._level_key = level_key
    return p


def external(url, label):
    return f'<a href="{html.escape(url, quote=True)}" color="#35616b">{esc(label)}</a>'


def source_link(n):
    return external(f'{SITE}#section={n}', f'§{n}')


def reference_list(numbers):
    return ' &nbsp; · &nbsp; '.join(source_link(n) for n in numbers)


def compact_numbers(numbers):
    nums = sorted(set(numbers))
    if not nums:
        return '-'
    groups = []
    a = b = nums[0]
    for n in nums[1:]:
        if n == b + 1:
            b = n
        else:
            groups.append(str(a) if a == b else f'{a}-{b}')
            a = b = n
    groups.append(str(a) if a == b else f'{a}-{b}')
    return ', '.join(groups)


def guide_story(lessons, book, sty, edition_date):
    story = []
    retained_text = []
    apps = {a['id']: a for a in book['apps']}
    sections = {s['id']: s for s in book['sections']}

    def add_text(text, style='body', markup=False, retain=False):
        story.append(para(text, sty[style], markup))
        if retain:
            retained_text.append(text)

    story += [Spacer(1, 28 * mm)]
    add_text('GNAMMA RESEARCH', 'eyebrow')
    add_text('Al-Ḍarūrī', 'cover')
    add_text('A three-level study guide', 'coverSub')
    add_text('Ibn Rushd’s craft of legal reasoning', 'summary')
    story += [HRFlowable(width=WIDTH, thickness=1, color=WATER), Spacer(1, 12 * mm)]
    add_text('28 questions  ·  84 guided lessons  ·  8 units', 'body')
    add_text('Basic - Foundations\nIntermediate - Close reading\nAdvanced - Research'.replace('\n','<br/>'), 'summary', True)
    add_text('Linked readings, contextual vocabulary, worked examples, tasks, and reasoned feedback.', 'body')
    story += [Spacer(1, 25 * mm)]
    add_text('An editorial companion to the Arabic-English reading edition', 'small')
    add_text(f'Edition: {edition_date.strftime("%d %B %Y")}\nGnamma Research'.replace('\n','<br/>'), 'small', True)
    add_text(external(SITE+'#study', 'Open the interactive study guide'), 'small', True)
    story += [PageBreak()]

    story.append(heading('Using this companion', sty['unit'], 'using', 0))
    add_text('Choose a level for each question', 'label')
    add_text('Basic develops the principal problem and distinctions. Intermediate reconstructs an argument from linked passages. Advanced sets a bounded research task, explains what evidence is needed, and gives assessment criteria. A learner can change level by topic; these are modes of study, not permanent labels for readers.')
    add_text('Read, attempt, then check', 'label')
    add_text('Follow the ordered readings before the explanation. Each § link opens the stable section in the online reader. Attempt the two tasks before consulting the feedback immediately below them. Cover the feedback on paper or pause before turning to it. Use PDF bookmarks to move directly to any unit, question, or level.')
    add_text('Language and level', 'label')
    add_text('The guide is in English with technical transliteration. Arabic proficiency is separate from conceptual level. The reader provides Arabic, English and parallel display, and control over editorial vowel marks. Research tasks involving Arabic require either the relevant competence or explicit consultation of a qualified reader.')
    add_text('Source attribution and editorial status', 'label')
    add_text('The questions, explanations, examples labelled as teaching illustrations, exercises and feedback are editorial learning aids prepared with AI assistance and checked against the current reading text. They are not additional chapters or statements by Ibn Rushd. The lessons distinguish his arguments from positions he reports, and distinguish verified source comparisons from proposed research.')
    add_text('The Arabic reading edition follows Jamāl al-Dīn al-ʿAlawī (1994), with comparison to Ziad Bou Akl’s Arabic-French edition (2015). References to the surviving manuscript depend on the published comparator’s apparatus. This companion introduces no new manuscript collation or claim of independent peer review.')
    add_text('Source acknowledgement: The opening lesson, its vocabulary notes and the comparative discussion of method were revised with reference to two 2026 teaching handouts by Shaykh Ruzwan Mohammed: Lesson 1, The Classification of Knowledge and the Emergence of Uṣūl al-Fiqh (paragraphs 1–5), and Lesson 2, The Proper Scope and Method of Uṣūl al-Fiqh (paragraphs 6–9). These privately supplied classroom notes informed selected editorial choices; they are not manuscript witnesses. The present translation and its interpretations remain Gnamma Research’s responsibility.')
    add_text('Citation keys', 'label')
    add_text('§ denotes the stable reader section, following al-ʿAlawī’s numbering. A gives the printed Arabic pages in al-ʿAlawī (1994). BA gives Bou Akl’s section range and the recorded starting Arabic and French printed pages. The source concordance at the back brings these together; its printed-page numbers are distinct from this companion’s page numbers.')
    add_text('Bidāya application links', 'label')
    add_text('Application references lead to the reader’s case dossiers. Their relation labels distinguish an illustrative parallel, an express methodological discussion, and a comparison involving tension. Research tasks ask for the actual source passage before a stronger historical conclusion is drawn.')
    story += [PageBreak()]

    story.append(heading('Contents', sty['unit'], 'contents', 0))
    add_text('The eight units organize learning. The 28 questions remain the shared spine of all three levels.', 'small')
    toc = TableOfContents()
    toc.levelStyles = [sty['toc0'], sty['toc1']]
    toc.dotsMinLevel = 1
    story.append(toc)
    story += [PageBreak()]

    previous_unit = None
    used_sections = set()
    for lesson in lessons:
        unit = lesson['unit']
        if unit != previous_unit:
            if previous_unit is not None:
                story.append(PageBreak())
            title = f'Unit {unit}. {UNITS[unit]}'
            story.append(heading(title, sty['unit'], f'unit-{unit}', 0, 0, title))
            previous_unit = unit
        else:
            story.append(CondPageBreak(105 * mm))
            story += [Spacer(1, 4 * mm), HRFlowable(width=WIDTH, thickness=.6, color=LINE), Spacer(1, 6 * mm)]

        lesson_title = f'{lesson["number"]}. {lesson["title"]}'
        story.append(heading(lesson_title, sty['lesson'], f'lesson-{lesson["id"]}', 1, 1))
        retained_text.append(lesson['title'])
        add_text(lesson['summary'], 'summary', retain=True)
        add_text('Before you begin', 'label')
        for text in lesson['prerequisites']:
            add_text(text, 'small', retain=True)
        add_text('Key terms in this lesson', 'label')
        for item in lesson['terms']:
            add_text(f'<b>{esc(item["term"])}</b> - {esc(item["definition"])}', 'term', True)
            retained_text += [item['term'], item['definition']]
        if lesson['applications']:
            add_text('Linked Bidāya applications', 'label')
            for aid in lesson['applications']:
                app = apps[aid]
                link = external(f'{SITE}#application={aid}', f'{aid}. {app["title"]}')
                add_text(f'{link}<br/><font color="#596962">{esc(app["relation"])}. {esc(app["book"])}; {esc(app["locator"])}.</font>', 'small', True)

        for level_key in LEVELS:
            level = lesson['levels'][level_key]
            used_sections.update(level['sections'])
            story.append(CondPageBreak(55 * mm))
            story.append(heading(LEVEL_NAMES[level_key], sty['level'], f'{lesson["id"]}-{level_key}', 2,
                                 level_key=f'{lesson["id"]}/{level_key}'))
            url = f'{SITE}#study?{urlencode({"topic": lesson["id"], "level": level_key})}'
            add_text(external(url, 'Open this lesson online'), 'tiny', True)
            add_text(f'<b>Aim.</b> {esc(level["objective"])}', 'small', True)
            retained_text.append(level['objective'])
            add_text('<b>Ordered readings.</b> '+reference_list(level['sections']), 'small', True)
            for text in level['explanation']:
                add_text(text, retain=True)
            example = level['example']
            example_title = esc('Example: '+example['title'])
            for source in example.get('quran_sources', []):
                quote = esc(source['quote'])
                if example_title.count(quote) != 1:
                    raise ValueError(f'Quotational anchor must be unique: {source["id"]}')
                marker = f'<super><a href="#{esc(source["id"])}" color="#35616b">{source["number"]}</a></super>'
                example_title = example_title.replace(quote, quote + marker, 1)
            example_heading = para(example_title, sty['label'], True)
            example_heading._quran_sources = example.get('quran_sources', [])
            example_items = [example_heading, para(example['text'], sty['body'])]
            story.append(KeepTogether(example_items))
            retained_text += [example['title'], example['text']]
            add_text('Try it before reading the feedback', 'label')
            for i, text in enumerate(level['tasks'], 1):
                add_text(f'<b>{i}.</b> {esc(text)}', 'task', True)
                retained_text.append(text)
            add_text('Feedback and assessment', 'label')
            for i, text in enumerate(level['feedback'], 1):
                add_text(f'<b>{i}.</b> {esc(text)}', 'task', True)
                retained_text.append(text)

    story += [PageBreak()]
    story.append(heading('Source concordance', sty['unit'], 'source-concordance', 0, 0, 'Source concordance'))
    add_text('This table covers every section assigned in the 84 lessons. Links open the online section. A = al-ʿAlawī (1994), printed Arabic pages. BA = Bou Akl (2015); the final two columns give the recorded starting printed Arabic and French pages, not a claim that the whole section fits on those pages.', 'small')
    add_text('The concordance is generated from the current reader’s edition metadata. Consult the section’s notes for textual restorations, interpretive qualifications, and the basis of any reported manuscript reading.', 'small')
    header = ['Reader', 'A: Arabic pp.', 'BA: sections', 'BA: Ar. start', 'BA: Fr. start']
    rows = [[para(x, sty['tiny']) for x in header]]
    for n in sorted(used_sections):
        s = sections[n]
        ba = s.get('bouAkl') or {}
        first, last = ba.get('start'), ba.get('end')
        barange = '-' if first is None else str(first) if first == last or last is None else f'{first}-{last}'
        row = [source_link(n), esc(compact_numbers(s.get('pages', []))), esc(barange),
               esc(str(ba.get('arabicPrintedStart', '-'))), esc(str(ba.get('frenchPrintedStart', '-')))]
        rows.append([para(x, sty['tiny'], True) for x in row])
    table = LongTable(rows, colWidths=[56, 105, 115, 110, WIDTH-386], repeatRows=1, hAlign='LEFT')
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PALE),
        ('LINEBELOW', (0,0), (-1,0), .6, WATER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f7f8f5')]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,1), (-1,-1), 3),
        ('BOTTOMPADDING', (0,1), (-1,-1), 3),
    ]))
    story.append(table)
    story += [Spacer(1, 8 * mm)]
    add_text('Sources and regeneration', 'label')
    add_text('Primary text: Ibn Rushd, al-Ḍarūrī fī uṣūl al-fiqh, edited by Jamāl al-Dīn al-ʿAlawī (1994). Comparator: Ziad Bou Akl, Averroès: le philosophe et la Loi (2015), Arabic-French edition and commentary. Application dossiers identify the relevant locations in Bidāyat al-mujtahid. Further comparisons specified as research tasks require their own verified source passages.', 'small')
    add_text('The companion and the interactive guide are built from the same 28 lesson records. The maintained generator is daruri/study/build-guide-pdf.py in the booksite repository. Rebuild after editorial changes to keep explanations, readings, tasks and feedback synchronized.', 'small')
    return story, retained_text, used_sections


def normalized(text):
    return re.sub(r'\s+', '', clean(text))


def validate_pdf(path, lessons, retained_text):
    reader = PdfReader(str(path))
    # Running furniture is painted last on each page. Remove it before testing
    # text fields that legitimately continue across a page boundary.
    full_text = '\n'.join((p.extract_text() or '').split('\nGNAMMA  |', 1)[0]
                          for p in reader.pages)
    compact = normalized(full_text)
    quran_sources = [source for lesson in lessons for level in lesson['levels'].values()
                     for source in level['example'].get('quran_sources', [])]
    for source in quran_sources:
        # Ignore only the inserted superscript when checking the unaltered title.
        with_call = normalized(source['quote']) + str(source['number'])
        if compact.count(with_call) != 1:
            raise ValueError(f'Missing or duplicated Qur’an quotation marker: {source["id"]}')
        compact = compact.replace(with_call, normalized(source['quote']), 1)
    missing = []
    for i, text in enumerate(retained_text):
        if normalized(text) not in compact:
            missing.append({'field': i, 'text': text[:100]})
    if missing:
        raise ValueError(f'Text coverage failed ({len(missing)} fields): {missing[:10]}')
    expected = {f'{SITE}#study?{urlencode({"topic": l["id"], "level": k})}'
                for l in lessons for k in LEVELS}
    urls = set()
    for page in reader.pages:
        for annotation in page.get('/Annots', []):
            action = annotation.get_object().get('/A')
            if action and action.get('/URI'):
                urls.add(str(action['/URI']))
    if not expected <= urls:
        raise ValueError(f'Missing lesson hyperlinks: {sorted(expected-urls)}')
    if '\ufffd' in full_text or '\u25a0' in full_text:
        raise ValueError('Replacement or black-square glyph found in extracted text.')
    source_pages = {}
    for source in quran_sources:
        matches = [i + 1 for i, page in enumerate(reader.pages)
                   if normalized(source['quote']) + str(source['number']) in normalized(page.extract_text() or '')]
        if len(matches) != 1:
            raise ValueError(f'Cannot locate Qur’an quotation call: {source["id"]}')
        page_number = matches[0]
        if normalized(source['text']) not in normalized(reader.pages[page_number - 1].extract_text() or ''):
            raise ValueError(f'Qur’an footnote is not on its quotation page: {source["id"]}')
        if source['url'] not in urls:
            raise ValueError(f'Missing Qur’an source hyperlink: {source["id"]}')
        source_pages[source['id']] = page_number
    return dict(pageCount=len(reader.pages), retainedFieldsChecked=len(retained_text),
                lessonLinksChecked=len(expected), distinctExternalLinks=len(urls),
                quranFootnotesChecked=len(quran_sources), quranFootnotePages=source_pages)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=DARURI/'daruri-study-guide.pdf')
    parser.add_argument('--metadata', type=Path, default=HERE/'companion-metadata.json')
    parser.add_argument('--book-data', type=Path)
    parser.add_argument('--font-dir', type=Path, default=Path('/usr/share/fonts/truetype/dejavu'))
    parser.add_argument('--date', type=date.fromisoformat, default=date(2026,10,20))
    args = parser.parse_args()
    lessons, lesson_files = read_lessons()
    book, book_path = read_book(args.book_data)
    section_ids = {s['id'] for s in book['sections']}
    app_ids = {a['id'] for a in book['apps']}
    for lesson in lessons:
        if not set(lesson['applications']) <= app_ids:
            raise ValueError(f'Unknown application in {lesson["id"]}')
        for level in lesson['levels'].values():
            if not set(level['sections']) <= section_ids:
                raise ValueError(f'Unknown section in {lesson["id"]}')
    font_texts = list(strings(lessons)) + list(UNITS.values()) + list(LEVEL_NAMES.values())
    font_texts += ['Al-Ḍarūrī Jamāl al-Dīn al-ʿAlawī Ziad Bou Akl Bidāyat al-mujtahid § ·']
    fonts(args.font_dir, font_texts)
    sty = styles()
    story, retained, section_set = guide_story(lessons, book, sty, args.date)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    document = GuideDocument(str(args.output), args.date)
    document.multiBuild(story)
    verification = validate_pdf(args.output, lessons, retained)
    metadata = {
        'title': 'Al-Ḍarūrī: A three-level study guide',
        'file': args.output.name,
        'editionDate': args.date.isoformat(),
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'pageCount': verification['pageCount'],
        'sizeBytes': args.output.stat().st_size,
        'sha256': sha(args.output),
        'units': 8,
        'topics': len(lessons),
        'levelsPerTopic': 3,
        'lessons': len(lessons)*3,
        'assignedSections': len(section_set),
        'generator': 'daruri/study/build-guide-pdf.py',
        'generatorUsage': 'python daruri/study/build-guide-pdf.py',
        'dependencies': ['reportlab', 'fonttools', 'pypdf', 'DejaVu Serif and Sans TrueType fonts'],
        'sourceFiles': [{'file': p.name, 'sha256': sha(p)} for p in lesson_files],
        'editionData': {'file': book_path.name, 'sha256': sha(book_path)},
        'verification': verification,
        'unitPages': {str(n): document.anchor_pages[f'unit-{n}'] for n in UNITS},
        'topicPages': {l['id']: document.anchor_pages[f'lesson-{l["id"]}'] for l in lessons},
        'levelPages': document.level_pages,
        'visualQA': {'status': 'pending', 'method': 'Render representative pages after building.'},
    }
    args.metadata.write_text(json.dumps(metadata, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({k: metadata[k] for k in ['file','pageCount','sizeBytes','sha256','topics','lessons','assignedSections']}, ensure_ascii=False))
    print(json.dumps(verification))


if __name__ == '__main__':
    main()
