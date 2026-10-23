#!/usr/bin/env python3
"""Generate the public application and dictionary source-note asset.

Run from any directory:
    python daruri/build/build_source_reference_data.py
    python daruri/build/build_source_reference_data.py --check

The scholarly source-note mappings remain authoritative. This export keeps only
public display fields; main-text notes remain in the existing edition payload.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from urllib.parse import urlparse


HERE = Path(__file__).resolve().parent
SOURCE = HERE / 'data' / 'backmatter-source-notes.json'
OUTPUT = HERE.parent / 'source-reference-data.js'

APPLICATION_IDS = {
    'B02': 'SRC-APP-R023', 'B03': 'SRC-APP-R028',
    'B09': 'SRC-APP-R058', 'B10': 'SRC-APP-R064',
    'B12': 'SRC-APP-R158', 'B13': 'SRC-APP-R160',
    'B14': 'SRC-APP-R167', 'B15': 'SRC-APP-R171',
    'B18': 'SRC-APP-R206', 'B24': 'SRC-APP-R227',
    'B27': 'SRC-APP-R246', 'B28': 'SRC-APP-R256',
}
DICTIONARY_IDS = {
    'U-jaza': ['SRC-BH01', 'SRC-BH02', 'SRC-BH03'],
    'U-waqafa': ['SRC-BH04'],
    'L-sabr': ['SRC-BH05', 'SRC-BH06', 'SRC-BH07', 'SRC-BH08',
               'SRC-BH09', 'SRC-BH10', 'SRC-BH11'],
    'F-baliya': ['SRC-BQ01'],
    'R-qara': ['SRC-BH12'],
}
PUBLIC_FIELDS = {
    'id', 'kind', 'kindLabel', 'source_type', 'text', 'anchor_en',
    'source_references',
}


def public_note(source, scope, application_id=None):
    for field in ('id', 'text', 'anchor_en'):
        if not isinstance(source.get(field), str) or not source[field]:
            raise ValueError(f'Missing public {field}: {source.get("id")}')
    references = []
    for reference in source['source_references']:
        label, url = reference['reference'], reference['url']
        parsed = urlparse(url)
        if not label or parsed.scheme != 'https' or not parsed.netloc:
            raise ValueError(f'Invalid public source reference: {source["id"]}')
        references.append({'reference': label, 'url': url})
    note = {
        'id': source['id'],
        'kind': scope + '-source',
        'kindLabel': (f'Bidāya application {application_id}'
                      if scope == 'application' else 'Dictionary source'),
        'source_type': scope,
        'text': source['text'],
        'anchor_en': source['anchor_en'],
        'source_references': references,
    }
    if application_id is not None:
        note['application_id'] = application_id
    expected_fields = PUBLIC_FIELDS | ({'application_id'} if application_id else set())
    if set(note) != expected_fields:
        raise ValueError('Unexpected public display fields')
    return note


def build_data(source):
    applications = {}
    for note in source['application_notes_by_section'].values():
        if note.get('apply', True):
            application_id = note['application_id']
            applications.setdefault(application_id, []).append(
                public_note(note, 'application', application_id))
    applications = dict(sorted(applications.items()))
    if {key: [note['id'] for note in values]
            for key, values in applications.items()} != {
                key: [value] for key, value in APPLICATION_IDS.items()}:
        raise ValueError('Application source-note ownership or inventory changed')

    dictionary_articles = {}
    for group in source['notes_by_dictionary_article'].values():
        article_id = group['source_article_id']
        for note in group['notes']:
            if not note.get('apply', True):
                continue
            if note.get('source_article_id') != article_id:
                raise ValueError(f'Dictionary article ownership differs: {note["id"]}')
            dictionary_articles.setdefault(article_id, []).append(
                public_note(note, 'dictionary'))
    if {key: [note['id'] for note in values]
            for key, values in dictionary_articles.items()} != DICTIONARY_IDS:
        raise ValueError('Dictionary source-note ownership or inventory changed')

    all_notes = [note for group in (applications, dictionary_articles)
                 for values in group.values() for note in values]
    if len(all_notes) != 25 or len({note['id'] for note in all_notes}) != 25:
        raise ValueError('Source-note IDs must be unique across all 25 additions')
    return {'schemaVersion': 1, 'applications': applications,
            'dictionaryArticles': dictionary_articles}


SOURCE_UI_LOADER = "\n/* Public-source note links and verified quotation presentation. */\n(function () {\n  var base = new URL('.', document.currentScript && document.currentScript.src || document.baseURI);\n  var css = document.createElement('link');\n  css.rel = 'stylesheet'; css.href = new URL('source-note-ui.css?v=20261021-section1-qparallels2', base).href;\n  document.head.appendChild(css);\n  var js = document.createElement('script');\n  js.src = new URL('source-note-ui.js?v=20261021-qinline4', base).href;\n  js.async = false; document.head.appendChild(js);\n})();\n"

SOURCE_UI_LOADER += "\n/* Optional Hadith source context, matching the Quran note expansion. */\n(function () {\n  if (window.__gnHadithContextLoaderInstalled) return;\n  window.__gnHadithContextLoaderInstalled = true;\n  var base = new URL('.', document.currentScript && document.currentScript.src || document.baseURI);\n  var css = document.createElement('link');\n  css.rel = 'stylesheet'; css.href = new URL('hadith-context-ui.css?v=20261023-hadithux3', base).href;\n  document.head.appendChild(css);\n  var js = document.createElement('script');\n  js.src = new URL('hadith-context-ui.js?v=20261023-hadithux3', base).href;\n  js.async = false; document.head.appendChild(js);\n  /* Inline H source links are independent of the lazy expanded Hadith corpus. */\n  var inline = document.createElement('script');\n  inline.src = new URL('hadith-inline-anchors.js?v=20261023-hadithux3', base).href;\n  inline.async = false; document.head.appendChild(inline);\n})();\n"

def render_asset(data):
    return ('/* Generated by build/build_source_reference_data.py from the scholarly source maps. */\n'
            'window.DARURI_SOURCE_REFERENCES = '
            + json.dumps(data, ensure_ascii=False, indent=2) + ';\n' + SOURCE_UI_LOADER)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true',
                        help='Validate the installed asset without writing it.')
    args = parser.parse_args()
    data = build_data(json.loads(SOURCE.read_text(encoding='utf-8')))
    expected = render_asset(data).encode('utf-8')
    if args.check:
        if not OUTPUT.is_file() or OUTPUT.read_bytes() != expected:
            raise ValueError('source-reference-data.js differs from the authoritative export')
    else:
        OUTPUT.write_bytes(expected)
    print(json.dumps({
        'file': str(OUTPUT), 'applicationNotes': 12, 'dictionaryArticles': 5,
        'dictionaryNotes': 13, 'totalNotes': 25, 'bytes': len(expected),
        'sha256': hashlib.sha256(expected).hexdigest(), 'checkOnly': args.check,
    }))


if __name__ == '__main__':
    main()
