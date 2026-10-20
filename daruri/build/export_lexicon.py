#!/usr/bin/env python3
"""Export the complete historical lexicon with current source notes.

Run after the scholarly edition so section links use its final PDF page map:
  PYTHONPATH=/tmp/daruri_pdf_deps python daruri/build/export_lexicon.py \
      --output-dir /path/to/rebuilt

The five reading editions are never written by this exporter.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path
from urllib.parse import unquote

from backmatter import LEXICON_CSS, render_lexicon
from main_text import MAIN_TEXT_CSS

ROOT = Path(__file__).resolve().parent
DATA = ROOT / 'data'
FILENAME = 'daruri-historical-lexicon.pdf'
SCHOLARLY_URL = 'https://gnamma-research.github.io/booksite/daruri/daruri.pdf'


def normalize_text(value):
    return re.sub(r'\s+', '', unicodedata.normalize('NFKC', value).replace('\u00ad', ''))


def validate_html(fragment, full, notes):
    """Check retained source paragraphs, existing notes and all new notes."""
    terms = re.findall(r'data-original-term-id="([^"]+)"', fragment)
    articles = re.findall(r'data-article-id="([^"]+)"', fragment)
    paragraphs = re.findall(
        r'<p class="lex-paragraph" data-source-paragraph="([^"]+)" '
        r'data-language="([^"]+)">([\s\S]*?)</p>', fragment)
    expected = {(f'{a["id"]}:{i}', language): paragraph[language]
                for a in full['articles'] for i, paragraph in enumerate(a['paragraphs'])
                for language in ('ar', 'en')}
    actual = {(html.unescape(key), language): html.unescape(text)
              for key, language, text in paragraphs}
    if actual != expected or len(paragraphs) != len(expected):
        raise ValueError('Complete Arabic/English dictionary paragraphs were altered or omitted')
    if Counter(terms) != Counter(str(t['original_id']) for t in full['terms']):
        raise ValueError('Term dossier inventory differs from the complete source data')
    if Counter(articles) != Counter(a['id'] for a in full['articles']):
        raise ValueError('Full article inventory differs from the complete source data')
    original_notes = re.findall(
        r'<span data-original-article-note="([^"]+)">([\s\S]*?)</span>', fragment)
    if {key: html.unescape(text) for key, text in original_notes} != {
            a['id']: a['note'] for a in full['articles'] if a.get('note')}:
        raise ValueError('An existing article note was altered or omitted')
    applied = [n for group in notes['notes_by_dictionary_article'].values()
               for n in group['notes'] if n.get('apply', True)]
    note_ids = re.findall(r'class="lex-source-note" id="([^"]+)"', fragment)
    if Counter(note_ids) != Counter(n['id'] for n in applied):
        raise ValueError('The new dictionary source-note inventory is incomplete')
    for note in applied:
        if html.escape(note['text'], quote=False) not in fragment:
            raise ValueError('Source-note wording was altered: ' + note['id'])
    counts = {'term_dossiers': len(terms), 'full_articles': len(articles),
              'paragraph_pairs': len(expected) // 2, 'paragraph_texts': len(paragraphs),
              'existing_article_notes': len(original_notes), 'source_notes': len(note_ids),
              'dictionary_sources': len(full['sources']),
              'relation_rows': len(re.findall(r'data-relation-term=', fragment))}
    if (counts['term_dossiers'], counts['full_articles'], counts['paragraph_pairs'],
            counts['source_notes'], counts['dictionary_sources']) != (153, 157, 283, 13, 8):
        raise ValueError('Unexpected complete-lexicon release inventory: ' + str(counts))
    return counts


def standalone_fragment(full, notes, scholarly, scholarly_url):
    fragment = render_lexicon(full, notes)
    # Only standalone editorial framing changes; source articles and their notes
    # are retained verbatim and checked independently below.
    fragment = fragment.replace('Arabic–English reference backmatter', 'Arabic and English reference companion')
    fragment = fragment.replace(
        'This appendix replaces the earlier excerpt register and nine-entry pilot.',
        'This companion reproduces the complete selected dictionary articles from the scholarly edition.')
    fragment = fragment.replace(
        'Select a term below. Its section references lead back to the main text in the integrated edition. '
        'The subject index precedes this dictionary; the R/BA concordance follows it.',
        'Select a term below. Its section references open the corresponding page of the online scholarly PDF. '
        'The scholarly edition also contains the analytical subject index and R/BA concordance.')
    fragment = fragment.replace(
        'The running Darūrī text and notes are retained from the preceding scholarly reading edition:',
        'The Darūrī text linked from this companion follows the scholarly reading edition:')
    mapped = []

    def section_link(match):
        section = match.group(1)
        if section not in scholarly['section_pages']:
            raise ValueError('Missing scholarly page for section ' + section)
        page = scholarly['section_pages'][section]
        if not 1 <= page <= scholarly['pages']:
            raise ValueError('Invalid scholarly PDF page for section ' + section)
        url = f'{scholarly_url}#page={page}'
        mapped.append({'section': section, 'page': page, 'url': url})
        return 'href="' + html.escape(url, quote=True) + '"'

    fragment = re.sub(r'href="#section-(\d+|colophon)"', section_link, fragment)
    if 'href="#section-' in fragment:
        raise ValueError('An occurrence link still points to absent local main text')
    return fragment, mapped


def export(output, scholarly_metadata, scholarly_url=SCHOLARLY_URL):
    import fitz
    from weasyprint import HTML
    from weasyprint.text.fonts import FontConfiguration

    full = json.loads((DATA / 'full-headwords.json').read_text())
    notes = json.loads((DATA / 'backmatter-source-notes.json').read_text())
    scholarly = json.loads(scholarly_metadata.read_text())
    scholarly_url = scholarly_url.split('#', 1)[0]
    fragment, mapped = standalone_fragment(full, notes, scholarly, scholarly_url)
    counts = validate_html(fragment, full, notes)
    footer = '<div class="footer"><a href="#lexicon-directory">Term directory</a><a href="#lexicon-sources">Sources</a><a href="#lexicon-relations">Headword relations</a></div>'
    cover = '<section class="cover"><div class="brand">GNAMMA RESEARCH</div><p class="arabic-title" lang="ar">الضَّرُورِيُّ فِي أُصُولِ الْفِقْهِ</p><h1>Historical Lexicon</h1><p class="author">A companion to Ibn Rushd’s<br><i>Al-Ḍarūrī fī Uṣūl al-Fiqh</i></p><p class="edition">Complete selected historical dictionary articles</p><p class="scope">153 term dossiers · 157 full articles · 8 dictionaries<br>Arabic and full working English translations<br>13 source notes · source records · headword-relation audit</p><p class="date">20 October 2026 · Structure and contents revision</p><p class="small" style="text-align:center"><a href="#lexicon-directory">Term directory</a> · <a href="' + html.escape(scholarly_url + '#page=1', quote=True) + '">Scholarly edition ↗</a></p></section>'
    css = MAIN_TEXT_CSS + '\n' + LEXICON_CSS + '\n' + (ROOT / 'styles.css').read_text()
    document_html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="author" content="Gnamma Research"><meta name="description" content="Complete selected historical dictionary articles with full Arabic and English texts and source notes"><title>Historical Lexicon · Al-Ḍarūrī</title><style>' + css + '</style></head><body>' + footer + cover + fragment + '</body></html>'
    output.mkdir(parents=True, exist_ok=True)
    (output / (FILENAME + '.html')).write_text(document_html)
    document = HTML(string=document_html, base_url=str(ROOT)).render(font_config=FontConfiguration())
    anchors = {}
    for number, page in enumerate(document.pages, 1):
        for name, point in page.anchors.items():
            anchors.setdefault(name, {'page': number, 'x': point[0] * .75, 'y': point[1] * .75})
    local_targets = {html.unescape(x) for x in re.findall(r'href="#([^"]+)"', document_html)}
    missing_targets = sorted(local_targets - anchors.keys())
    if missing_targets:
        raise ValueError('Missing internal lexicon destinations: ' + str(missing_targets))
    temporary = output / (FILENAME + '.building')
    document.write_pdf(temporary)
    pdf = fitz.open(temporary)
    if not len(pdf) or not temporary.read_bytes().rstrip().endswith(b'%%EOF'):
        raise ValueError('Incomplete standalone PDF')
    pdf_text = normalize_text('\n'.join(page.get_text() for page in pdf))
    missing_english = [f'{a["id"]}:{i}' for a in full['articles']
                       for i, paragraph in enumerate(a['paragraphs'])
                       if normalize_text(paragraph['en']) not in pdf_text]
    if missing_english:
        raise ValueError('English article paragraphs absent from PDF: ' + str(missing_english))
    all_links = [link for page in pdf for link in page.get_links()]
    # PDF annotations encode Arabic URI paths; compare their decoded IRI forms.
    actual_urls = {unquote(link['uri']) for link in all_links if 'uri' in link}
    missing_sections = sorted({unquote(x['url']) for x in mapped} - actual_urls)
    missing_sources = sorted({unquote(a['url']) for a in full['articles']} - actual_urls)
    if missing_sections or missing_sources:
        raise ValueError('Missing external section/source links: ' + str(missing_sections + missing_sources))
    bad_pages = [link for link in all_links
                 if link['kind'] == fitz.LINK_GOTO and not 0 <= link['page'] < len(pdf)]
    if bad_pages:
        raise ValueError('Invalid internal PDF destinations')
    path = output / FILENAME
    metadata = {'filename': FILENAME, 'edition': 'historical-lexicon', 'pages': len(pdf),
                'bytes': temporary.stat().st_size, 'sha256': hashlib.sha256(temporary.read_bytes()).hexdigest(),
                'counts': counts, 'english_paragraphs_verified_in_pdf': 283,
                'links': len(all_links), 'bookmarks': len(pdf.get_toc()),
                'internal_targets_checked': len(local_targets), 'missing_link_targets': [],
                'scholarly_pdf': {'url': scholarly_url, 'pages': scholarly['pages'], 'sha256': scholarly['sha256']},
                'section_links': mapped, 'anchors': anchors,
                'input_sha256': {name: hashlib.sha256((DATA / name).read_bytes()).hexdigest()
                                 for name in ('full-headwords.json', 'backmatter-source-notes.json')}}
    pdf.close()
    temporary.replace(path)
    (output / (FILENAME + '.metadata.json')).write_text(json.dumps(metadata, ensure_ascii=False, indent=2))
    print(json.dumps({k: v for k, v in metadata.items() if k not in ('anchors', 'section_links')}, ensure_ascii=False), flush=True)
    return metadata


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', type=Path, default=ROOT / 'output')
    parser.add_argument('--scholarly-metadata', type=Path)
    parser.add_argument('--scholarly-url', default=SCHOLARLY_URL)
    args = parser.parse_args()
    export(args.output_dir, args.scholarly_metadata or args.output_dir / 'daruri.pdf.metadata.json', args.scholarly_url)
