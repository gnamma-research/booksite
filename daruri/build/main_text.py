"""Render the Daruri main text without changing its authoritative edition data.

``render_main(book, quran_data, hadith_data, edition)`` returns an HTML fragment.
The caller supplies the page furniture, fonts, full stylesheet and PDF writer.
``MAIN_TEXT_CSS`` contains only the structural rules on which this fragment relies.

Qur'an anchors are validated against the actual section/segment text.  Footnote
numbers are explicit and global within the fragment: study annotations and Qur'an
references share one sequence.  Bilingual Arabic/English calls share one body.
For a second pagination pass, set quran_data['_repeat_footnote_anchors'] to the
list returned by repeat_footnote_plan(document).  This repeats a reference body
on a later page without duplicating it for the second language on the same page.
For reading/study pagination, union quran_data['_footnote_break_before'] with the keys
returned by footnote_break_plan(document, html), then render again.  These are
paragraph keys, e.g. '47:3', and put a problematic call and its note on a fresh
page together.  validate_pagination(document, html) verifies the final result.
"""
from __future__ import annotations

from collections import Counter, defaultdict
from html import escape
from html.parser import HTMLParser
import re
import unicodedata
from typing import Any, Mapping


EDITIONS = frozenset({'scholarly', 'study', 'english', 'arabic', 'arabic-vowelled'})
STUDY_NOTE_KINDS = frozenset({'translation', 'interpretive'})

MAIN_TEXT_CSS = r"""
/* WeasyPrint can defer every footnote when the footnote area has a margin.
   Use padding for space above the notes, and retain a zero area margin. */
@page { @footnote { margin: 0; } }
.main-text { direction: ltr; }
.main-text .text-section { break-inside: auto; }
.main-text .part-divider { break-before: page; break-after: avoid; }
.main-text .part-divider:first-child { break-before: auto; }
.main-text .colophon { break-before: page; }
.main-text .section-header, .main-text .original-heading { break-inside: avoid; break-after: avoid; }
.main-text .editorial-title, .main-text .editorial-meta { direction: ltr; }
.main-text .editorial-meta { font-size: .72em; }
.main-text .anchor-alias { display: block; height: 0; }
.main-text table.parallel-text { width: 100%; table-layout: fixed; border-collapse: collapse; direction: ltr; }
.main-text table.parallel-text td { width: 50%; vertical-align: top; padding: 0 2.5mm 2.8mm; }
.main-text table.parallel-text td:first-child { padding-left: 0; }
.main-text table.parallel-text td:last-child { padding-right: 0; }
.main-text.edition-study .parallel-pair { break-inside: auto; }
.main-text.edition-study .parallel-pair.contains-footnotes { break-inside: avoid; }
.main-text.edition-study .parallel-pair > table.parallel-text { margin-bottom: 0; }
.main-text.edition-study .footnote-declarations {
  height: 0; margin: 0; padding: 0; font-size: 0; line-height: 0;
  break-after: avoid;
}
.main-text .arabic { direction: rtl; text-align: right; }
.main-text .english { direction: ltr; }
.main-text .source-segment { margin-top: 0; orphans: 2; widows: 2; }
.main-text table.parallel-text .source-segment { margin-bottom: 0; }
.main-text .source-heading-label { font-size: .65em; }
.main-text .source-heading { margin-top: 0; margin-bottom: .3em; }
.main-text .section-apparatus { margin: .45em 0 1em; }
.main-text .apparatus-note { break-inside: avoid; margin: 0 0 .4em; }
.main-text .apparatus-label { font-weight: bold; }
.main-text .source-apparatus { font-size: .8em; }
.main-text .apparatus-heading { font-size: .8em; margin: 0 0 .4em; }
.main-text .quran-marker, .main-text .footnote-call, .main-text .hadith-marker {
  font-size: .67em; vertical-align: super; line-height: 0; direction: ltr; unicode-bidi: isolate;
}
.main-text .quran-marker a, .main-text .footnote-call a, .main-text .hadith-marker a { text-decoration: none; }
.main-text.edition-study .footnote-call + .footnote-call::before,
.main-text.edition-study .quran-marker + .footnote-call::before { content: ", "; }
.main-text .footnote {
  float: footnote; footnote-display: block; font-size: .8em; line-height: 1.35;
  text-align: left; direction: ltr; overflow-wrap: anywhere;
  margin: 0; padding: 0; white-space: normal;
}
.main-text .footnote.arabic { direction: rtl; text-align: right; }
.main-text .footnote::footnote-call, .main-text .footnote::footnote-marker { content: none; }
.main-text .footnote-number { font-weight: bold; direction: ltr; unicode-bidi: isolate; }
.main-text .number-group { display: inline-block; direction: ltr; unicode-bidi: isolate; white-space: nowrap; }
.main-text .source-url { direction: ltr; unicode-bidi: isolate; }
.main-text .footnote-kind { font-style: italic; }
.main-text .apparatus-note a { overflow-wrap: anywhere; }
"""


def _section_key(value: Any) -> str:
    if isinstance(value, int) or str(value).isdigit():
        return str(int(value))
    value = str(value)
    if re.fullmatch(r'R\d+', value, re.I):
        return str(int(value[1:]))
    return value.removeprefix('section-')


def _book_notes(book: Mapping[str, Any]) -> dict[str, dict]:
    raw = book.get('notes', [])
    if isinstance(raw, Mapping):
        return {str(k): dict(v, id=v.get('id', k)) for k, v in raw.items()}
    return {str(n['id']): dict(n) for n in raw}


def _quran_notes(data: Mapping[str, Any] | list | None) -> list[dict]:
    if not data:
        return []
    raw = data if isinstance(data, list) else data.get('notes', [])
    return [dict(n) for n in raw]


def _hadith_notes(data: Mapping[str, Any] | list | None) -> dict[str, list[dict]]:
    result: dict[str, list[dict]] = defaultdict(list)
    if not data:
        return result
    if isinstance(data, list):
        for note in data:
            result[_section_key(note['section_id'])].append(dict(note))
        return result
    raw = data.get('notes_by_section', data)
    for key, value in raw.items():
        if not re.fullmatch(r'(?:R|section-)?\d+|colophon|section-colophon', str(key)):
            continue
        for note in value if isinstance(value, list) else [value]:
            result[_section_key(key)].append(dict(note))
    return result


_URL = re.compile(r'https?://[^\s<>\"\u201c\u201d]+')
_NUMBER_GROUP = re.compile(r'(?<![A-Za-z0-9_])\d+(?::\d+)?(?:[\u2013\u2014-]\d+(?::\d+)?)?(?:[/,]\d+(?::\d+)?(?:[\u2013-]\d+(?::\d+)?)?)*')


def _escaped_inline(text: str) -> str:
    """Keep verse keys and number ranges in their original left-to-right order."""
    pieces = []
    last = 0
    for match in _NUMBER_GROUP.finditer(text):
        pieces.append(escape(text[last:match.start()]))
        pieces.append(f'<bdi class="number-group" dir="ltr">{escape(match.group())}</bdi>')
        last = match.end()
    pieces.append(escape(text[last:]))
    return ''.join(pieces)


def _rich_text(text: str, references: list[dict] | None = None) -> str:
    """Escape prose; preserve raw visible URLs and optionally link Qur'an labels."""
    links = []
    for match in _URL.finditer(text):
        url = match.group().rstrip('.,;:)\u060c\u061b')
        end = match.start() + len(url)
        links.append((match.start(), end, url, True))
    for reference in references or []:
        url = reference.get('url', '')
        if not url.startswith(('https://', 'http://')):
            continue
        for key in ('label_en', 'label_ar'):
            label = reference.get(key, '')
            if label:
                start = text.find(label)
                if start >= 0:
                    links.append((start, start + len(label), url, False))
    pieces: list[str] = []
    last = 0
    for start, end, url, is_url in sorted(links, key=lambda link:(link[0], -(link[1]-link[0]))):
        if start < last:
            continue
        pieces.append(_escaped_inline(text[last:start]))
        visible = escape(text[start:end]) if is_url else _escaped_inline(text[start:end])
        extra = ' class="source-url" dir="ltr"' if is_url else ''
        pieces.append(f'<a href="{escape(url, quote=True)}"{extra}>{visible}</a>')
        last = end
    pieces.append(_escaped_inline(text[last:]))
    return ''.join(pieces)


def _note_text_and_language(note: Mapping[str, Any], language: str = 'en') -> tuple[str, str]:
    """Choose the note's actual language, independently of the surrounding edition.

    An explicitly supplied original-language note takes precedence; its language
    is never inferred from the language of a book it happens to cite. The
    usual Arabic Qur'an source annotation is used only when supplied as such.
    If an Arabic edition includes English/French editorial prose, preserve its
    words and render them left-to-right rather than mislabelling them Arabic.
    """
    source_language = str(note.get('original_note_language', '')).lower()
    if source_language in {'ar', 'en', 'fr'} and note.get('original_note_text') is not None:
        return str(note['original_note_text']), source_language

    if language != 'en':
        arabic = note.get('text_ar') or note.get('textAr')
        if arabic:
            return str(arabic), 'ar'
    elif note.get('text_en'):
        return str(note['text_en']), 'en'

    if note.get('text') is not None:
        text_language = str(note.get('text_language', 'en')).lower()
        return str(note['text']), text_language if text_language in {'en', 'ar', 'fr'} else 'en'
    if note.get('text_en'):
        return str(note['text_en']), 'en'
    if note.get('text_ar') or note.get('textAr'):
        return str(note.get('text_ar') or note['textAr']), 'ar'
    return '', 'en'


def _note_text(note: Mapping[str, Any], language: str = 'en') -> str:
    return _note_text_and_language(note, language)[0]


def _resolve_anchor(text: str, descriptor: Mapping[str, Any], context: str) -> int:
    """Return a safe insertion offset; never guess a different quotation."""
    quoted = str(descriptor.get('text', ''))
    if not quoted:
        raise ValueError(f'Empty Qur\u02bean anchor: {context}')
    start = descriptor.get('start_codepoint')
    end = descriptor.get('end_codepoint_exclusive')
    if not (isinstance(start, int) and isinstance(end, int)
            and 0 <= start <= end <= len(text) and text[start:end] == quoted):
        positions = [m.start() for m in re.finditer(re.escape(quoted), text)]
        occurrence = int(descriptor.get('occurrence_1based', 1)) - 1
        if not 0 <= occurrence < len(positions):
            raise ValueError(f'Qur\u02bean anchor no longer matches its source: {context}: {quoted!r}')
        # The mapping explicitly records which occurrence it means; a stale offset
        # elsewhere in a segment therefore cannot silently move a repeated quote.
        start = positions[occurrence]
        end = start + len(quoted)
    while end < len(text) and (unicodedata.combining(text[end]) or unicodedata.category(text[end]).startswith('M')):
        end += 1
    return end


# Only exact verse wording checked against Quran.com. These are comparison
# snippets, not changes to Ibn Rushd's wording or a reported variant reading.
_VERIFIED_VERSE_EXCERPTS = {
    'QUR-R001-Q049': ('عَلَّمَهُ ٱلْبَيَانَ', 'Qurʾānic comparison only · al-Raḥmān 55:4 · possible verbal allusion, NOT an authorial quotation'),
    'QUR-R001-Q050': ('فَلِلَّهِ ٱلْحُجَّةُ ٱلْبَـٰلِغَةُ', 'Qurʾānic comparison only · al-Anʿām 6:149 · possible verbal allusion, NOT an authorial quotation'),
    'QUR-R038-Q001': ('يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تَقْرَبُوا۟ ٱلصَّلَوٰةَ وَأَنتُمْ سُكَـٰرَىٰ حَتَّىٰ تَعْلَمُوا۟ مَا تَقُولُونَ', 'Verified Qurʾān excerpt · al-Nisāʾ 4:43'),
}


def _verified_verse_excerpt(note: Mapping[str, Any]) -> str:
    datum = _VERIFIED_VERSE_EXCERPTS.get(str(note.get('id', '')))
    if not datum:
        return ''
    wording, source = datum
    return ('<span class="quran-source-excerpt">'
            '<span class="quran-source-arabic" lang="ar" dir="rtl">'
            '﴿ ' + escape(wording) + ' ﴾</span>'
            '<span class="quran-source-caption">' + escape(source) + '</span>'
            '</span>')


class _Renderer:
    def __init__(self, book: Mapping[str, Any], quran_data: Any, hadith_data: Any, edition: str, show_editorial_titles: bool = False):
        if edition not in EDITIONS:
            raise ValueError(f'Unknown edition {edition!r}; expected {sorted(EDITIONS)}')
        self.book = book
        self.edition = edition
        self.bilingual = edition in {'scholarly', 'study'}
        self.show_editorial_titles = bool(show_editorial_titles and edition != 'scholarly')
        self.ar_field = 'ar' if edition == 'arabic' else 'vocalized'
        self.notes = _book_notes(book)
        self.quran = _quran_notes(quran_data)
        self.hadith = _hadith_notes(hadith_data)
        self.q_by_section: dict[str, list[dict]] = defaultdict(list)
        self.events: dict[tuple[str, int], list[tuple[dict, int, dict]]] = defaultdict(list)
        self.q_labels: dict[str, str] = {}
        self.source_ids = {n['id'] for n in self.quran}
        self.source_ids.update(n['id'] for ns in self.hadith.values() for n in ns)
        self.footnote_numbers: dict[str, int] = {}
        self.emitted_footnotes: set[str] = set()
        self.repeat_anchors: set[str] = set()
        self.footnote_breaks: set[str] = set()
        self.pending_footnotes: list[str] = []
        if isinstance(quran_data, Mapping):
            for value in quran_data.get('_repeat_footnote_anchors', []):
                if isinstance(value, Mapping):
                    self.repeat_anchors.add(f"{value['note_id']}:{value['anchor_index']}")
                else:
                    self.repeat_anchors.add(str(value))
            if edition != 'scholarly':
                for value in quran_data.get('_footnote_break_before', []):
                    if isinstance(value, Mapping):
                        self.footnote_breaks.add(f"{_section_key(value['section_id'])}:{int(value['segment_index'])}")
                    else:
                        self.footnote_breaks.add(str(value))
        known_sections = {_section_key(s['id']) for s in book['sections']}
        for note in self.quran:
            if edition not in note.get('show_in_editions', EDITIONS):
                continue
            key = _section_key(note['section_id'])
            if key not in known_sections:
                raise ValueError(f"Qur\u02bean note {note['id']} refers to absent section {key}")
            self.q_by_section[key].append(note)
            for index, anchor in enumerate(note.get('anchors', [])):
                self.events[(key, int(anchor['segment_index']))].append((note, index, anchor))
        for key, notes in self.q_by_section.items():
            notes.sort(key=lambda n: min((int(a['segment_index']), int(a['en']['end_codepoint_exclusive'])) for a in n['anchors']))
            for index, note in enumerate(notes, 1):
                self.q_labels[note['id']] = f'Q{index}'

    def _number(self, note_id: str) -> int:
        if note_id not in self.footnote_numbers:
            self.footnote_numbers[note_id] = len(self.footnote_numbers) + 1
        return self.footnote_numbers[note_id]

    def _footnote(self, note: dict, language: str, target_id: str | None = None) -> str:
        note_id = str(note['id'])
        number = self._number(note_id)
        target_id = target_id or note_id
        if target_id in self.emitted_footnotes:
            return ''
        self.emitted_footnotes.add(target_id)
        kind = note.get('kind', '')
        prefix = ''
        if kind in STUDY_NOTE_KINDS:
            prefix = '<span class="footnote-kind">' + ('Translation.' if kind == 'translation' else 'Interpretation.') + '</span> '
        body_text, note_language = _note_text_and_language(note, language)
        direction = 'rtl' if note_language == 'ar' else 'ltr'
        css_class = 'arabic' if note_language == 'ar' else 'english'
        body = _rich_text(body_text, note.get('references'))
        markup = (
            f'<span class="footnote {css_class}" lang="{note_language}" dir="{direction}" '
            f'id="{escape(target_id, quote=True)}" data-generated="annotation" '
            f'data-note-id="{escape(note_id, quote=True)}" data-note-number="{number}">'
            f'<span class="footnote-number">{number}.</span> {prefix}'
            f'<span class="note-prose" data-note-prose-id="{escape(note_id, quote=True)}">{body}</span></span>'
        )
        if self.edition == 'study':
            # Footnote floats inside a fragmented table cell can be registered
            # against the following page.  Declare them in normal block flow
            # immediately before the paired paragraph; the visible call remains
            # immediately after the exact quotation in each language.
            self.pending_footnotes.append(markup)
            return ''
        return markup

    def _q_marker(self, note: dict, anchor_index: int, language: str, owner: bool) -> str:
        note_id = str(note['id'])
        call_id = f'qcall--{note_id}--{anchor_index}--{language}'
        if self.edition == 'scholarly':
            label = self.q_labels[note_id]
            target = note_id
            body = ''
        else:
            label = str(self._number(note_id))
            repeat = f'{note_id}:{anchor_index}' in self.repeat_anchors
            target = f'{note_id}--repeat-{anchor_index}' if repeat else note_id
            body = self._footnote(note, language, target) if owner else ''
        return (
            f'<sup class="quran-marker" data-generated="annotation" data-note-id="{escape(note_id, quote=True)}">'
            f'<a id="{escape(call_id, quote=True)}" href="#{escape(target, quote=True)}" '
            f'aria-label="Qur\u02bean source note {escape(label, quote=True)}">{escape(label)}</a></sup>{body}'
        )

    def _study_ending(self, section: dict) -> str:
        if self.edition != 'study':
            return ''
        pieces = []
        for note_id in section.get('noteIds', []):
            note = self.notes.get(str(note_id))
            if not note or note.get('kind') not in STUDY_NOTE_KINDS or note_id in self.source_ids:
                continue
            if note.get('source_type') == 'hadith' or note.get('audience') == 'scholarly':
                continue
            number = self._number(str(note_id))
            pieces.append(
                f'<sup class="footnote-call" data-generated="annotation"><a id="call-{escape(str(note_id), quote=True)}" '
                f'href="#{escape(str(note_id), quote=True)}">{number}</a></sup>{self._footnote(note, "en")}'
            )
        return ''.join(pieces)

    def _segment(self, section: dict, index: int, language: str, owner: bool, ending: str = '') -> str:
        key = _section_key(section['id'])
        segment = section['segments'][index]
        text = str(segment[language])
        events = []
        for note, anchor_index, anchor in self.events.get((key, index), []):
            descriptor = anchor.get(language)
            if not descriptor:
                raise ValueError(f"Missing {language} anchor for {note['id']}")
            end = _resolve_anchor(text, descriptor, f"{note['id']} {key}/{index}/{language}")
            events.append((end, str(note['id']), note, anchor_index))
        pieces = []
        last = 0
        for end, _, note, anchor_index in sorted(events, key=lambda e: (e[0], e[1])):
            pieces.append(escape(text[last:end]))
            pieces.append(self._q_marker(note, anchor_index, language, owner))
            last = end
        pieces.append(escape(text[last:]))
        pieces.append(ending)
        cls = 'english' if language == 'en' else 'arabic'
        lang = 'en' if language == 'en' else 'ar'
        direction = 'ltr' if language == 'en' else 'rtl'
        paragraph_break = (' style="break-before: page"' if not self.bilingual and index
                           and f'{key}:{index}' in self.footnote_breaks else '')
        return (
            f'<p class="source-segment {cls}" id="segment-{key}-{index}-{language}" '
            f'data-source-role="segment" data-section-id="{key}" data-segment-index="{index}" '
            f'data-language="{language}" lang="{lang}" dir="{direction}"{paragraph_break}>'
            + ''.join(pieces) + '</p>'
        )

    def _source_heading(self, section: dict) -> str:
        if not section.get('headingAr') and not section.get('headingEn'):
            return ''
        key = _section_key(section['id'])
        def text(language: str) -> str:
            field = {'en':'headingEn', 'ar':'headingAr', 'vocalized':'headingVocalized'}[language]
            value = section.get(field)
            if value is None and language == 'vocalized':
                value = section.get('headingAr')
            if value is None:
                return ''
            cls, lang, direction = ('english', 'en', 'ltr') if language == 'en' else ('arabic', 'ar', 'rtl')
            primary = self.ar_field if self.bilingual else ('en' if self.edition == 'english' else self.ar_field)
            anchor = f'section-{key}' if language == primary else f'heading-{key}-{language}'
            alias = f'<span id="heading-{key}-{language}"></span>' if language == primary else ''
            return (
                f'<p class="source-heading {cls}" id="{anchor}" '
                f'data-source-role="heading" data-section-id="{key}" data-language="{language}" '
                f'lang="{lang}" dir="{direction}">{alias}{escape(str(value))}</p>'
            )
        label = ''
        if self.bilingual:
            inner = ('<table class="parallel-text heading-parallel"><tbody><tr>'
                     f'<td class="english">{text("en")}</td><td class="arabic">{text(self.ar_field)}</td>'
                     '</tr></tbody></table>')
        else:
            inner = text('en' if self.edition == 'english' else self.ar_field)
        root = ' source-part-heading' if key in {'10', '62', '148', '230'} else ''
        return f'<div class="original-heading{root}">{label}{inner}</div>'

    def _source_apparatus(self, section: dict) -> str:
        if self.edition != 'scholarly':
            return ''
        key = _section_key(section['id'])
        notes = []
        for note in self.q_by_section.get(key, []):
            notes.append((note, self.q_labels[note['id']], _note_text(note), note.get('references')))
        for index, proposed in enumerate(self.hadith.get(key, []), 1):
            # An updated authoritative book takes precedence over draft prose.
            note = self.notes.get(str(proposed['id']), proposed)
            notes.append((note, f'H{index}', _note_text(note), None))
        if not notes:
            return ''
        body = ''.join(
            f'<p class="apparatus-note source-note" id="{escape(str(note["id"]), quote=True)}" '
            f'data-note-id="{escape(str(note["id"]), quote=True)}" data-note-kind="{escape(str(note.get("kind", "source")), quote=True)}">'
            f'<span class="apparatus-label">{label}.</span> '
            f'<span class="note-prose" data-note-prose-id="{escape(str(note["id"]), quote=True)}">{_rich_text(text, refs)}</span>'
            f'{_verified_verse_excerpt(note)}</p>'
            for note, label, text, refs in notes
        )
        return ('<tr class="source-apparatus-row"><td class="english">'
                f'<div class="source-apparatus" aria-label="Sources for section {key}">{body}</div>'
                '</td><td class="arabic"></td></tr>')

    def _existing_apparatus(self, section: dict) -> str:
        if self.edition != 'scholarly':
            return ''
        pieces = []
        for note_id in section.get('noteIds', []):
            if str(note_id) in self.source_ids:
                continue
            if str(note_id) not in self.notes:
                raise ValueError(f"Section {section['id']} refers to missing note {note_id}")
            note = self.notes[str(note_id)]
            kind = str(note.get('kind', 'note'))
            pieces.append(
                f'<p class="apparatus-note" id="{escape(str(note_id), quote=True)}" '
                f'data-note-id="{escape(str(note_id), quote=True)}" data-note-kind="{escape(kind, quote=True)}">'
                f'<span class="apparatus-label">{escape(str(note_id))} · {escape(kind)}.</span> '
                f'<span class="note-prose" data-note-prose-id="{escape(str(note_id), quote=True)}">'
                f'{_rich_text(str(note.get("text", "")))}</span></p>'
            )
        return f'<div class="section-apparatus">{"".join(pieces)}</div>' if pieces else ''

    def _metadata(self, section: dict) -> str:
        key = _section_key(section['id'])
        if key == 'colophon':
            return ('قيد الناسخ والمالك؛ منفصل عن متن المؤلف' if self.edition.startswith('arabic') else 'Later copyist and owner · separate from Ibn Rushd’s authorial conclusion')
        parts = [f'R {key}']
        ba = section.get('bouAkl')
        if ba and ba.get('start') is not None:
            begin, end = ba['start'], ba.get('end', ba['start'])
            parts.append(f'BA {begin}' + (f'–{end}' if begin != end else ''))
        if self.edition == 'scholarly':
            pages = section.get('pages', [])
            if pages:
                parts.append('al-ʿAlawī (1994), p. ' + ', '.join(map(str, pages)))
            if ba and ba.get('arabicPrintedStart') is not None:
                parts.append(f"Bou Akl (2015), Arabic p. {ba['arabicPrintedStart']}")
        return ' · '.join(parts)

    def render(self) -> str:
        parts = {_section_key(p['id']): p for p in self.book.get('parts', [])}
        current_part = None
        output = [f'<main class="main-text edition-{self.edition}" id="main-text" data-edition="{self.edition}">']
        for section in self.book['sections']:
            key = _section_key(section['id'])
            part_key = _section_key(section.get('part', ''))
            if key != 'colophon' and part_key != current_part and part_key in parts:
                part = parts[part_key]
                labels = (['النص الافتتاحي', 'الجزء الأول', 'الجزء الثاني', 'الجزء الثالث', 'الجزء الرابع']
                          if self.edition.startswith('arabic') else ['Opening discussion', 'Part I', 'Part II', 'Part III', 'Part IV'])
                language = 'ar' if self.edition.startswith('arabic') else 'en'
                output.append(
                    f'<header class="part-divider" id="part-{escape(part_key, quote=True)}">'
                    f'<p class="part-label" lang="{language}">{labels[int(part_key)]}</p></header>'
                )
                current_part = part_key
            colophon = ' colophon' if key == 'colophon' else ''
            alias = 'R' + key if key.isdigit() else 'colophon'
            section_break = ' style="break-before: page"' if f'{key}:0' in self.footnote_breaks else ''
            output.append(f'<section class="text-section{colophon}" data-section-id="{key}"{section_break}>')
            output.append(f'<a class="anchor-alias" id="{alias}"></a>')
            if key == 'colophon':
                record_label = 'خاتمة الناسخ وقيد الملكية' if self.edition.startswith('arabic') else 'Later copyist’s colophon and ownership notice'
                output.append(f'<h1 class="colophon-title">{record_label}</h1>')
            output.append(self._source_heading(section))
            marker_anchor = f' id="section-{key}"' if not section.get('headingAr') and not section.get('headingEn') else ''
            extra_title = (
                '<h2 class="editorial-title" data-editorial-title="true">'
                + escape(str(key) + '. ' + str(section.get('title','')))
                + '</h2>'
            ) if self.show_editorial_titles and key != 'colophon' else ''
            output.append(
                '<header class="section-header">' + extra_title
                + f'<p class="editorial-meta"{marker_anchor}>{escape(self._metadata(section))}</p></header>'
            )
            if self.bilingual and self.edition != 'study':
                output.append('<table class="parallel-text"><tbody>')
            for index, _ in enumerate(section['segments']):
                last = index == len(section['segments']) - 1
                self.pending_footnotes = []
                if self.bilingual:
                    # Resolve the owner column first so both languages share numbers;
                    # Render English on the physical left; Arabic on the physical right.
                    en = self._segment(section, index, 'en', owner=True)
                    if last and self.edition == 'study':
                        ending = self._study_ending(section)
                        en = en[:-4] + ending + '</p>'
                    ar = self._segment(section, index, self.ar_field, owner=False)
                    row = f'<tr><td class="english" dir="ltr">{en}</td><td class="arabic" dir="rtl">{ar}</td></tr>'
                    if self.edition == 'study':
                        has_notes = ' contains-footnotes' if self.pending_footnotes else ''
                        pair_break = ' style="break-before: page"' if index and f'{key}:{index}' in self.footnote_breaks else ''
                        declarations = ('<p class="footnote-declarations" data-generated="annotation">'
                                        + ''.join(self.pending_footnotes) + '</p>') if self.pending_footnotes else ''
                        output.append(f'<div class="parallel-pair{has_notes}" id="pair-{key}-{index}"{pair_break}>'
                                      f'{declarations}<table class="parallel-text"><tbody>{row}</tbody></table></div>')
                    else:
                        output.append(row)
                else:
                    language = 'en' if self.edition == 'english' else self.ar_field
                    output.append(self._segment(section, index, language, owner=True))
            if self.bilingual and self.edition != 'study':
                output.append(self._source_apparatus(section))
                output.append('</tbody></table>')
            output.append(self._existing_apparatus(section))
            output.append('</section>')
        output.append('</main>')
        return ''.join(output)


def render_main(book: Mapping[str, Any], quran_data: Any, hadith_data: Any, edition: str, show_editorial_titles: bool = False) -> str:
    """Return the complete main-text fragment, including the separate colophon."""
    return _Renderer(book, quran_data, hadith_data, edition, show_editorial_titles=show_editorial_titles).render()


class _CoverageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids: Counter[str] = Counter()
        self.hrefs: list[str] = []
        self.sources: dict[tuple, str] = {}
        self.note_ids: set[str] = set()
        self.note_numbers: dict[str, set[str]] = defaultdict(set)
        self.note_texts: dict[str, list[str]] = defaultdict(list)
        self.note_capture: str | None = None
        self.note_buffer: list[str] = []
        self.note_capture_depth: int | None = None
        self.calls: list[str] = []
        self.capture: tuple | None = None
        self.buffer: list[str] = []
        self.depth = 0
        self.ignore_depth: int | None = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.depth += 1
        if attrs.get('id'):
            self.ids[attrs['id']] += 1
            if attrs['id'].startswith('qcall--'):
                self.calls.append(attrs['id'])
        if attrs.get('href', '').startswith('#'):
            self.hrefs.append(attrs['href'][1:])
        if attrs.get('data-note-id') and ('footnote' in attrs.get('class', '').split() or 'apparatus-note' in attrs.get('class', '').split()):
            self.note_ids.add(attrs['data-note-id'])
            if attrs.get('data-note-number'):
                self.note_numbers[attrs['data-note-id']].add(attrs['data-note-number'])
        if attrs.get('data-source-role'):
            self.capture = (attrs['data-source-role'], attrs['data-section-id'], attrs.get('data-segment-index'), attrs['data-language'])
            self.buffer = []
        if attrs.get('data-note-prose-id'):
            self.note_capture = attrs['data-note-prose-id']
            self.note_buffer = []
            self.note_capture_depth = self.depth
        if self.capture and attrs.get('data-generated') == 'annotation' and self.ignore_depth is None:
            self.ignore_depth = self.depth

    def handle_endtag(self, tag):
        if self.note_capture is not None and self.note_capture_depth == self.depth:
            self.note_texts[self.note_capture].append(''.join(self.note_buffer))
            self.note_capture = None
            self.note_buffer = []
            self.note_capture_depth = None
        if self.ignore_depth == self.depth:
            self.ignore_depth = None
        if tag == 'p' and self.capture:
            self.sources[self.capture] = ''.join(self.buffer)
            self.capture = None
            self.buffer = []
        self.depth -= 1

    def handle_data(self, data):
        if self.capture and self.ignore_depth is None:
            self.buffer.append(data)
        if self.note_capture is not None:
            self.note_buffer.append(data)


def validate_main(book: Mapping[str, Any], quran_data: Any, hadith_data: Any,
                  edition: str, html: str | None = None) -> dict[str, Any]:
    """Validate exact source preservation, IDs, note visibility and marker coverage.

    The check compares actual rendered paragraph/heading text (annotations removed)
    with the authoritative segments, rather than trusting declared word counts.
    It performs no PDF layout inspection; the caller should inspect pagination.
    """
    if html is None:
        html = render_main(book, quran_data, hadith_data, edition)
    parser = _CoverageParser()
    parser.feed(html)
    languages = ['vocalized', 'en'] if edition in {'scholarly', 'study'} else [
        'en' if edition == 'english' else ('ar' if edition == 'arabic' else 'vocalized')
    ]
    mismatches = []
    expected_sources = {}
    for section in book['sections']:
        key = _section_key(section['id'])
        for index, segment in enumerate(section['segments']):
            for language in languages:
                expected_sources[('segment', key, str(index), language)] = str(segment[language])
        for language in languages:
            field = {'ar':'headingAr', 'vocalized':'headingVocalized', 'en':'headingEn'}[language]
            heading = section.get(field)
            if heading is None and language == 'vocalized':
                heading = section.get('headingAr')
            if heading is not None:
                expected_sources[('heading', key, None, language)] = str(heading)
    for key, text in expected_sources.items():
        if parser.sources.get(key) != text:
            mismatches.append({'source':list(key), 'expected_length':len(text), 'actual_length':len(parser.sources.get(key, ''))})
    q_notes = [n for n in _quran_notes(quran_data) if edition in n.get('show_in_editions', EDITIONS)]
    q_ids = {str(n['id']) for n in q_notes}
    h_ids = {str(n['id']) for notes in _hadith_notes(hadith_data).values() for n in notes}
    all_notes = _book_notes(book)
    legacy_ids = {str(i) for s in book['sections'] for i in s.get('noteIds', [])} - q_ids - h_ids
    if edition == 'scholarly':
        expected_notes = legacy_ids | q_ids | h_ids
    elif edition == 'study':
        expected_notes = q_ids | {i for i in legacy_ids if all_notes[i].get('kind') in STUDY_NOTE_KINDS
                                and all_notes[i].get('source_type') != 'hadith' and all_notes[i].get('audience') != 'scholarly'}
    else:
        expected_notes = q_ids
    expected_note_texts = {i:str(all_notes[i].get('text', '')) for i in expected_notes & legacy_ids}
    note_language = 'ar' if edition in {'arabic', 'arabic-vowelled'} else 'en'
    expected_note_texts.update({str(n['id']):_note_text(n, note_language) for n in q_notes})
    if edition == 'scholarly':
        expected_note_texts.update({str(n['id']):_note_text(all_notes.get(str(n['id']), n))
                                    for ns in _hadith_notes(hadith_data).values() for n in ns})
    note_mismatches = []
    for note_id, expected_text in expected_note_texts.items():
        actual_texts = parser.note_texts.get(note_id, [])
        if not actual_texts or any(text != expected_text for text in actual_texts):
            note_mismatches.append({'note_id':note_id, 'expected_length':len(expected_text),
                                    'actual_lengths':[len(t) for t in actual_texts]})
    expected_calls = {f'qcall--{n["id"]}--{index}--{language}'
                      for n in q_notes for index, _ in enumerate(n['anchors']) for language in languages}
    section_ids = {f'section-{_section_key(s["id"])}' for s in book['sections']}
    result = {
        'edition':edition,
        'section_count':len(book['sections']),
        'authorial_section_count':sum(_section_key(s['id']).isdigit() for s in book['sections']),
        'has_separate_colophon':'section-colophon' in parser.ids,
        'source_segment_count':sum(len(s['segments']) for s in book['sections']),
        'authorial_source_segment_count':sum(len(s['segments']) for s in book['sections'] if _section_key(s['id']).isdigit()),
        'colophon_source_segment_count':sum(len(s['segments']) for s in book['sections'] if _section_key(s['id']) == 'colophon'),
        'rendered_language_segment_count':sum(k[0] == 'segment' for k in parser.sources),
        'source_heading_count':sum(k[0] == 'heading' for k in parser.sources),
        'source_text_mismatches':mismatches,
        'unexpected_source_paragraphs':[list(k) for k in parser.sources.keys() - expected_sources.keys()],
        'missing_section_ids':sorted(section_ids - parser.ids.keys()),
        'duplicate_ids':{i:n for i,n in parser.ids.items() if n > 1},
        'missing_internal_link_targets':sorted(set(parser.hrefs) - parser.ids.keys()),
        'expected_note_count':len(expected_notes),
        'rendered_note_count':len(parser.note_ids),
        'missing_note_ids':sorted(expected_notes - parser.note_ids),
        'unexpected_note_ids':sorted(parser.note_ids - expected_notes),
        'note_text_mismatches':note_mismatches,
        'quran_note_count':len(q_ids),
        'quran_anchor_pair_count':sum(len(n['anchors']) for n in q_notes),
        'quran_marker_count':len(parser.calls),
        'missing_quran_markers':sorted(expected_calls - set(parser.calls)),
        'unexpected_quran_markers':sorted(set(parser.calls) - expected_calls),
        'hadith_notes_visible':sorted(parser.note_ids & h_ids),
        'footnote_count':len(parser.note_numbers),
        'footnote_number_conflicts':{i:sorted(n) for i,n in parser.note_numbers.items() if len(n) != 1},
    }
    numbers = sorted(int(next(iter(n))) for n in parser.note_numbers.values() if len(n) == 1)
    result['footnote_numbers_contiguous'] = numbers == list(range(1, len(numbers) + 1))
    error_keys = ('source_text_mismatches', 'unexpected_source_paragraphs', 'missing_section_ids',
                  'duplicate_ids', 'missing_internal_link_targets', 'missing_note_ids', 'unexpected_note_ids',
                  'missing_quran_markers', 'unexpected_quran_markers', 'footnote_number_conflicts', 'note_text_mismatches')
    result['ok'] = not any(result[k] for k in error_keys) and result['footnote_numbers_contiguous']
    if edition != 'scholarly' and result['hadith_notes_visible']:
        result['ok'] = False
    return result


_QCALL = re.compile(r'^qcall--(.+)--(\d+)--(en|ar|vocalized)$')


def repeat_footnote_plan(document: Any) -> list[str]:
    """Return repeat-body keys for repeated Qur'an calls on distinct PDF pages.

    ``document`` is a WeasyPrint Document (before write_pdf).  In bilingual
    documents English calls own footnotes; Arabic calls share the same numbers.
    Call again after adding bodies if reflow changes the page assignment.
    """
    calls = []
    for page_index, page in enumerate(document.pages):
        for name in page.anchors:
            match = _QCALL.match(name)
            if match:
                note_id, index, language = match.groups()
                calls.append((page_index, note_id, int(index), language))
    languages = {x[3] for x in calls}
    owner = 'en' if 'en' in languages else ('ar' if 'ar' in languages else 'vocalized')
    first_page = {}
    body_pages = defaultdict(set)
    plan = []
    for page, note_id, index, language in sorted(calls, key=lambda x:(x[0], x[1], x[2])):
        if language != owner:
            continue
        if note_id not in first_page:
            first_page[note_id] = page
            body_pages[note_id].add(page)
        elif page not in body_pages[note_id]:
            plan.append(f'{note_id}:{index}')
            body_pages[note_id].add(page)
    return sorted(plan)


class _PaginationParser(HTMLParser):
    """Connect visible calls to source paragraphs and actual footnote bodies."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.source: dict[str, Any] | None = None
        self.calls: list[dict[str, Any]] = []
        self.footnote_ids: set[str] = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'p' and attrs.get('data-source-role') == 'segment':
            self.source = {
                'section_id': attrs['data-section-id'],
                'segment_index': int(attrs['data-segment-index']),
                'language': attrs['data-language'],
            }
        if 'footnote' in attrs.get('class', '').split() and attrs.get('id'):
            self.footnote_ids.add(attrs['id'])
        name = attrs.get('id', '')
        target = attrs.get('href', '')
        if name.startswith(('qcall--', 'call-')) and target.startswith('#'):
            self.calls.append({'call_id': name, 'target_id': target[1:], **(self.source or {})})

    def handle_endtag(self, tag):
        if tag == 'p':
            self.source = None


def validate_pagination(document: Any, html: str) -> dict[str, Any]:
    """Check each visible footnote call and its body begin on the same page.

    This excludes scholarly apparatus links, which intentionally refer to local
    section notes rather than page footnotes.  Both bilingual calls are checked.
    The returned paragraph keys can be used for deterministic study correction.
    """
    parser = _PaginationParser()
    parser.feed(html)
    pages = {}
    for page_number, page in enumerate(document.pages, 1):
        for name in page.anchors:
            pages.setdefault(name, page_number)
    calls = [c for c in parser.calls if c['target_id'] in parser.footnote_ids]
    mismatches = []
    for call in calls:
        call_page, body_page = pages.get(call['call_id']), pages.get(call['target_id'])
        if call_page is None or body_page is None or call_page != body_page:
            mismatches.append({**call, 'call_page': call_page, 'body_page': body_page})
    breaks = sorted({f"{c['section_id']}:{c['segment_index']}" for c in mismatches
                     if 'section_id' in c and 'segment_index' in c})
    missing_bodies = sorted(parser.footnote_ids - pages.keys())
    return {
        'ok': not mismatches and not missing_bodies,
        'page_count': len(document.pages),
        'calls_checked': len(calls),
        'footnote_bodies_checked': len(parser.footnote_ids),
        'mismatches': mismatches,
        'missing_body_anchors': missing_bodies,
        'suggested_breaks': breaks,
    }


def footnote_break_plan(document: Any, html: str) -> list[str]:
    """Return reading/study paragraph keys whose notes need a fresh page.

    Union these with prior keys; do not replace prior corrections.  Repeated
    Qur'an bodies should be planned separately with repeat_footnote_plan.
    """
    return validate_pagination(document, html)['suggested_breaks']
