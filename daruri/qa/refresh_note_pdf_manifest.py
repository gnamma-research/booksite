#!/usr/bin/env python3
"""Validate five fresh, structure-preserving al-Daruri PDF builds.

Updates the five PDF binaries, their hash/page manifest and the five matching\nsource-to-PDF section metadata files required by the personal-note exporter. Never rewrites
reader HTML, navigation, study materials, personal annotations, or Arabic text.
"""
import argparse
import hashlib
import json
import shutil
from pathlib import Path
import fitz

NAMES = ('daruri.pdf', 'daruri-study.pdf', 'daruri-english.pdf',
         'daruri-arabic.pdf', 'daruri-arabic-vowelled.pdf')
MIN_PAGES = (150, 80, 50, 40, 40)


def validate_and_publish(source: Path, site: Path):
    manifest_file = site / 'pdf-editions-manifest.json'
    manifest = json.loads(manifest_file.read_text(encoding='utf-8'))
    report = {}
    release_dir = site / 'build' / 'release'
    release_dir.mkdir(parents=True, exist_ok=True)
    for index, filename in enumerate(NAMES):
        pdf_path = source / filename
        meta_path = source / (filename + '.metadata.json')
        assert pdf_path.is_file() and meta_path.is_file(), filename
        meta = json.loads(meta_path.read_text(encoding='utf-8'))
        assert meta['main_text_validation']['ok'], filename + ' source notes'
        assert meta['footnote_pagination']['ok'], filename + ' pagination'
        if meta.get('application_footnote_pagination') is not None:
            assert meta['application_footnote_pagination']['ok'], filename + ' application pagination'
        with fitz.open(pdf_path) as document:
            pages = len(document)
            assert pages >= MIN_PAGES[index], (filename, pages)
            outline = document.get_toc()
            assert len(outline) >= 45, (filename, 'outline too short')
            destinations = meta['section_pages']
            assert len(destinations) >= 259, (filename, 'missing section map')
            assert all(1 <= int(page) <= pages for page in destinations.values()), filename
            link_count = sum(len(page.get_links()) for page in document)
            assert link_count > 100, (filename, link_count)
            # Verify the live PDF annotations, not just possibly wrapped extracted prose.
            all_uris = [link.get('uri', '') for page in document for link in page.get_links()]
            first_page = document[int(meta['section_pages']['1']) - 1]
            section1_uris = {link.get('uri', '') for link in first_page.get_links()}
            assert 'https://quran.com/55/4' in section1_uris, filename + ' §1 55:4 source missing'
            assert 'https://quran.com/6/149' in section1_uris, filename + ' §1 6:149 source missing'
            assert 'https://quran.com/33/40' not in section1_uris, filename + ' §1 33:40 false citation'
            if filename == 'daruri.pdf':
                text_pages = [p for p in document if 'Verified Qurʾān excerpt' in p.get_text()]
                assert text_pages, 'Direct Quran quotation excerpt missing'
                example = '\\n'.join(p.get_text() for p in text_pages)
                assert 'https://quran.com/' not in example, 'Raw Quran URL visibly printed'
                external = [link.get('uri', '') for p in text_pages for link in p.get_links()]
                assert 'https://quran.com/4/43' in external, 'True direct quotation source URI missing'
                # These comparison excerpts must never be mislabelled as authorial quotations.
                section1_text = first_page.get_text().replace('\\n', ' ')
                assert 'possible verbal allusion' in section1_text, 'Qualification missing in scholarly §1 apparatus'
                # The caution text can flow onto a following physical page.
                # Source-map/reader tests independently require both notes to state
                # that these are possible echoes, never authorial quotations.
            old_pages = manifest['files'][filename]['pages']
            # Source/contents structural changes beyond source-note typography
            # require separate editorial approval; do not silently publish them.
            assert abs(pages - old_pages) <= 4, (filename, 'unexpected reflow', old_pages, pages)
        sha = hashlib.sha256(pdf_path.read_bytes()).hexdigest()
        assert sha == meta['sha256'], filename + ' checksum mismatch'
        shutil.copy2(pdf_path, site / filename)
        # Personal-annotation PDF exports must use metadata from the exact same PDF bytes.
        target_meta = release_dir / (filename + '.metadata.json')
        shutil.copy2(meta_path, target_meta)
        assert json.loads(target_meta.read_text(encoding='utf-8'))['sha256'] == sha
        record = manifest['files'][filename]
        record.update(sha256=sha, source_sha256=sha, size_bytes=pdf_path.stat().st_size, pages=pages)
        report[filename] = {'pages': pages, 'links': link_count, 'bookmarks': len(outline), 'sha256': sha}
    manifest['edition_date'] = '2026-10-21'
    manifest['release_revision'] = 'daruri11-section1-qualified-quran-20261021'
    manifest['citation_presentation_revision'] = '20261021-section1-qparallels1'
    manifest_file.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (source/'source-note-pdf-qa.json').write_text(json.dumps(report, indent=2)+'\n')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--site-dir', type=Path, required=True)
    args = parser.parse_args()
    validate_and_publish(args.output_dir, args.site_dir)