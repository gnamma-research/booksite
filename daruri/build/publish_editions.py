#!/usr/bin/env python3
"""Rebuild A4 Daruri reading/study PDFs with PDF outlines and clickable contents.

Run from a checkout:
  python daruri/build/publish_editions.py --output-dir daruri/editions
The canonical scholarly PDF and reader page destinations are never modified.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import sys
import tempfile
from pathlib import Path

import fitz
from pypdf import PdfReader

HERE = Path(__file__).resolve().parent
PARTS = [
    (1, 'Introduction / المقدمة'),
    (10, 'I · Legal rulings / الأحكام'),
    (62, 'II · Sources / الأصول'),
    (148, 'III · Interpretation & derivation / الاستنباط'),
    (230, 'IV · Ijtihād / الاجتهاد'),
]
LANGUAGES = ['bilingual', 'english', 'arabic', 'arabic-vowelled']


def finalize(source: Path, target: Path, source_sections: list, tier: str,
             language: str, editorial: bool) -> dict:
    """Preserve every page and note; add viewer metadata, hierarchical outline and A4 contents links."""
    sections = [{**s, 'id': int(s['id'])} for s in source_sections if str(s.get('id', '')).isdigit()]
    assert len(sections) == 258
    original_pypdf = PdfReader(source)
    destinations = original_pypdf.named_destinations
    positions = {}
    for sec in sections:
        name = 'section-' + str(sec['id'])
        if name not in destinations:
            raise ValueError(f'{source}: destination missing: {name}')
        positions[sec['id']] = original_pypdf.get_destination_page_number(destinations[name]) + 1
    assert len(positions) == 258
    original = fitz.open(source)
    before_text = [hashlib.sha256(p.get_text(sort=False).encode()).hexdigest() for p in original]
    before_links = sum(len(page.get_links()) for page in original)
    outline = [[1, 'Read the work · Original headings', 1]]
    for ix, (number, label) in enumerate(PARTS):
        outline.append([2, label, positions[number]])
        limit = PARTS[ix + 1][0] if ix + 1 < len(PARTS) else 259
        for sec in sections:
            if not number <= sec['id'] < limit or not (sec.get('headingAr') or sec.get('headingEn')):
                continue
            heading = sec.get('headingAr') if language.startswith('arabic') else sec.get('headingEn')
            outline.append([3, str(heading or sec.get('headingEn') or sec.get('headingAr'))[:130],
                            positions[sec['id']]])
    if editorial:
        outline.append([1, 'Editorial section titles · added by Gnamma', 1])
        for ix, (number, label) in enumerate(PARTS):
            outline.append([2, label, positions[number]])
            limit = PARTS[ix + 1][0] if ix + 1 < len(PARTS) else 259
            for sec in sections:
                if number <= sec['id'] < limit:
                    outline.append([3, f'§{sec["id"]} · {sec["title"]}', positions[sec['id']]])
    if tier == 'study':
        seen = set()
        for row in original.get_toc():
            if row[0] != 1 or row[2] > len(original):
                continue
            title = row[1]
            if any(term in title.lower() for term in ('subject index', 'sources', 'notes', 'glossary', 'guide')):
                if (title, row[2]) not in seen:
                    seen.add((title, row[2]))
                    outline.append([1, title, row[2]])
    original.set_toc(outline, collapse=1)
    clicked = []
    if tier == 'reading':
        page = original[0]
        for number, _ in PARTS:
            token = (str(number) + '§') if language.startswith('arabic') else ('§' + str(number))
            matches = [rect for rect in page.search_for(token) if 105 <= rect.y0 <= 210]
            if matches:
                rect = matches[0] + (-3, -2, 8, 3)
                page.insert_link({'kind': fitz.LINK_GOTO, 'from': rect,
                                  'page': positions[number] - 1})
                clicked.append(number)
    label = {'bilingual': 'Bilingual', 'english': 'English', 'arabic': 'Arabic',
             'arabic-vowelled': 'Arabic (fully vowelled)'}[language]
    title = (f'Al-Ḍarūrī · {label} · '
             f'{"Reading & Printing" if tier == "reading" else "Study"} · '
             f'Editorial titles {"on" if editorial else "off"}')
    original.set_metadata({
        'title': title,
        'author': 'Ibn Rushd; Gnamma Research editorial edition',
        'subject': 'al-Ḍarūrī fī uṣūl al-fiqh · complete text',
        'keywords': 'Ibn Rushd, al-Daruri, Usul al-fiqh, Gnamma, A4, reading',
        'creator': 'Gnamma Research editions',
        'producer': 'WeasyPrint and PyMuPDF',
    })
    original.set_pagemode('UseOutlines')
    original.set_pagelayout('SinglePage')
    try:
        original.xref_set_key(original.pdf_catalog(), 'ViewerPreferences',
                              '<< /DisplayDocTitle true /FitWindow false >>')
    except Exception:
        pass
    target.parent.mkdir(parents=True, exist_ok=True)
    original.save(target, garbage=3, deflate=True)
    original.close()
    with fitz.open(target) as doc:
        assert len(doc.get_toc()) == len(outline)
        assert [hashlib.sha256(p.get_text(sort=False).encode()).hexdigest() for p in doc] == before_text
        assert sum(len(p.get_links()) for p in doc) >= before_links
        assert all(abs(p.rect.width - 595.276) < 1 and abs(p.rect.height - 841.89) < 1 for p in doc)
        for page in doc:
            for link in page.get_links():
                if link['kind'] == fitz.LINK_GOTO:
                    assert 0 <= link['page'] < len(doc)
        pages = len(doc)
        links = sum(len(p.get_links()) for p in doc)
    return {
        'file': str(target.relative_to(target.parent.parent)),
        'tier': tier, 'language': language, 'editorial_titles': editorial,
        'pages': pages, 'bookmarks': len(outline), 'links': links,
        'clickable_part_links': len(clicked), 'notes': 'none' if tier == 'reading' else 'selected',
        'bytes': target.stat().st_size,
        'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
    }


def publish(output: Path) -> dict:
    sys.path.insert(0, str(HERE))
    import print_editions
    import build_editions
    book = print_editions.BOOK
    with tempfile.TemporaryDirectory(prefix='daruri-variants-') as scratch:
        tmp = Path(scratch)
        tasks = []
        for language in LANGUAGES:
            for titles in (False, True):
                src = tmp / f'raw-reading-{language}-{int(titles)}.pdf'
                print_editions.build(language, range(1, 259), 'full',
                                     'Complete reading text', src, editorial_titles=titles)
                tasks.append((src, 'reading', language, titles))
        for titles in (False, True):
            raw_dir = tmp / ('study-on' if titles else 'study-off')
            build_editions.build('study', raw_dir, editorial_titles=titles)
            tasks.append((raw_dir / 'daruri-study.pdf', 'study', 'bilingual', titles))
        files = []
        for src, tier, language, titles in tasks:
            name = f'daruri-{tier}-{language}-titles-{"on" if titles else "off"}.pdf'
            files.append(finalize(src, output / tier / name,
                                  book['sections'], tier, language, titles))
    assert len(files) == 10
    manifest = {
        'release': '20261021-a4-reading-and-study',
        'status': 'verified',
        'note': 'The reference edition and website reference page destinations are unchanged.',
        'tier_order': ['reading', 'study', 'reference'],
        'files': files,
    }
    (output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    print(json.dumps([{'file': f['file'], 'pages': f['pages'],
                       'links': f['links']} for f in files], ensure_ascii=False, indent=2),
          flush=True)
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output-dir', type=Path, required=True)
    args = parser.parse_args()
    publish(args.output_dir)
