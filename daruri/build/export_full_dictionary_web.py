#!/usr/bin/env python3
"""Publish the complete scholarly dictionary to the reader without transcription loss.

Canonical source: build/data/full-headwords.json (153 dossiers, 157 articles).
Additive cited source notes: build/data/backmatter-source-notes.json.
No original Arabic/English paragraph is changed by this export.
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HEADWORDS = ROOT / 'build/data/full-headwords.json'
SOURCE_NOTES = ROOT / 'build/data/backmatter-source-notes.json'
DESTINATION = ROOT / 'full-dictionary-data.js'
PREFIX = '/* Generated mirror of build/data/full-headwords.json plus 13 cited source notes. Preserve verbatim historical paragraphs. */\nwindow.GnammaFullDictionaryData='


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def prepare_payload():
    full = read_json(HEADWORDS)
    notes = read_json(SOURCE_NOTES)
    articles = {a['id']: a for a in full['articles']}
    if len(full['terms']) != 153 or len(articles) != 157:
        raise ValueError('Historical lexicon inventory has changed; review before publishing.')
    if sum(len(a['paragraphs']) for a in full['articles']) != 283:
        raise ValueError('Source paragraph inventory no longer matches the scholarly edition.')
    grouped = {}
    seen = set()
    for group in notes.get('notes_by_dictionary_article', {}).values():
        for note in group.get('notes', []):
            if note.get('apply') is False:
                continue
            article_id = note.get('source_article_id') or group.get('source_article_id')
            if article_id not in articles or note['id'] in seen:
                raise ValueError('Unmatched or duplicate scholarly source note: ' + note['id'])
            seen.add(note['id'])
            grouped.setdefault(article_id, []).append({
                'id': note['id'],
                'anchor_en': note.get('anchor_en', ''),
                'anchor_ar': note.get('anchor_ar', ''),
                'text': note['text'],
                'source_references': note.get('source_references', []),
                'verification_status': note.get('verification_status', '')
            })
    if len(seen) != 13:
        raise ValueError('Unexpected scholarly dictionary source-note count.')
    return {
        'schema_version': 1,
        'source_version': full['version'],
        'terms': full['terms'],
        'sources': full['sources'],
        'articles': full['articles'],
        'notesByArticle': grouped,
        'sourceNoteCount': 13,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true',
                        help='Verify published mirror without modifying it')
    args = parser.parse_args()
    payload = prepare_payload()
    generated = PREFIX + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n'
    if args.check:
        stored = DESTINATION.read_text(encoding='utf-8')
        if not stored.startswith(PREFIX) or not stored.endswith(';\n'):
            raise SystemExit('Full dictionary JavaScript mirror header/trailer missing')
        existing = json.loads(stored[len(PREFIX):-2])
        if existing != payload:
            raise SystemExit('Full dictionary browser data differs from the scholarly source')
    else:
        DESTINATION.write_text(generated, encoding='utf-8')
    print('Full dictionary', 'verified' if args.check else 'exported',
          '153 terms, 157 articles, 283 Arabic–English paragraph pairs, 13 source notes')


if __name__ == '__main__':
    main()
