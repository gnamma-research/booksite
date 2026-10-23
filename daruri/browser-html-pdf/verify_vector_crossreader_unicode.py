#!/usr/bin/env python3
"""NONRELEASE: exact native Arabic Unicode audit across PDF extractors.

Read the canonical browser evidence and actual vector-PDF bytes.
Compare exact original two-word source opening substrings per passage in
MuPDF, PDFium, Poppler -raw and Poppler -layout.
Never normalize/remove Arabic vowels as a claimed scholarly success.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import unicodedata

import fitz
import pypdfium2 as pdfium


def without_marks(text: str) -> str:
    """Diagnostic only: NOT a publication or exact-original success."""
    return ''.join(ch for ch in unicodedata.normalize('NFD', text)
                   if unicodedata.category(ch) not in ('Mn','Me','Cf')
                   and ch!='\u0640')


def main() -> int:
    parser=argparse.ArgumentParser()
    parser.add_argument('--pdf', type=Path, required=True)
    parser.add_argument('--evidence', type=Path, required=True)
    parser.add_argument('--report', type=Path, required=True)
    args=parser.parse_args()
    evidence=json.loads(args.evidence.read_text('utf8'))
    rows=[r for r in evidence['source_lines'] if r['line']==1]
    if not evidence.get('native_rtl_text_matrix') or \
       evidence.get('source_paragraphs')!=414 or \
       len(rows)!=414 or len({r['id'] for r in rows})!=414:
        raise ValueError('The authoritative 414 Arabic source passages are incomplete')
    pdf_bytes=args.pdf.read_bytes()
    if not pdf_bytes.startswith(b'%PDF-') or len(pdf_bytes)!=evidence['bytes']:
        raise ValueError('The tested PDF does not match real browser evidence')
    doc=fitz.open(args.pdf)
    pdfium_doc=pdfium.PdfDocument(str(args.pdf))
    if len(doc)!=evidence['pages'] or len(pdfium_doc)!=evidence['pages']:
        raise ValueError('Real PDF / source page counts do not match')
    pdfium_pages=[page.get_textpage().get_text_range() for page in pdfium_doc]
    poppler_pages={}
    for mode in ('raw','layout'):
        output=subprocess.run(['pdftotext','-'+mode,str(args.pdf),'-'],
            stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True)
        decoded=output.stdout.decode('utf8').split('\f')
        if len(decoded)<evidence['pages']:
            raise ValueError('Poppler '+mode+' failed to read every source page')
        poppler_pages[mode]=decoded
    keys=['mupdf','pdfium','pdfium_NFC','pdfium_without_marks',
          'poppler_raw','poppler_layout']
    exact={key:0 for key in keys}
    missing={key:[] for key in keys}
    for row in rows:
        page=row['page']-1
        phrase=row['opening_source']
        if page<0 or page>=len(doc) or not phrase:
            raise ValueError('Invalid original source opening')
        pdftext=pdfium_pages[page]
        hits={
          'mupdf': bool(doc[page].search_for(phrase)),
          'pdfium':phrase in pdftext,
          'pdfium_NFC':unicodedata.normalize('NFC',phrase) in
            unicodedata.normalize('NFC',pdftext),
          'pdfium_without_marks':without_marks(phrase) in without_marks(pdftext),
          'poppler_raw':phrase in poppler_pages['raw'][page],
          'poppler_layout':phrase in poppler_pages['layout'][page],
        }
        for key,yes in hits.items():
            exact[key]+=int(yes)
            if not yes and len(missing[key])<8:
                missing[key].append({'source_id':row['id'],
                    'source_page':row['page'],
                    'expected_exact_authorial_opening':phrase})
    count={key:{'matching_original_openings':value,'total':414}
           for key,value in exact.items()}
    report={
      'schema':'gnamma-vector-pdf-native-crossreader-arabic-v1',
      'browser_source':evidence['engine'],
      'pdf_sha256':hashlib.sha256(pdf_bytes).hexdigest(),
      'original_source_sha256':evidence['source_sha256'],
      'font_sha256':evidence['font_sha256'],
      'page_count':evidence['pages'],
      'pymupdf_version':fitz.VersionBind,
      'pdfium_version':getattr(pdfium,'__version__','unknown'),
      'exact_opening_results':count,
      'first_missing_examples':missing,
      'nfc_normalization_is_not_exact_source':True,
      'removing_authorial_vowel_marks_is_not_acceptance':True,
      'full_bilingual_scholarly_edition_certified':False,
      'native_iphone_android_pdf_certified':False,
      'cross_reader_arabic_unicode_approved':all(exact[k]==414 for k in
        ('mupdf','pdfium','poppler_raw','poppler_layout')),
      'general_release_approved':False,
      'warning':('Diagnostic comparison of native extracted strings only, '
        'not a universal statement about text rendered by every GUI. '
        'MuPDF source search alone does not establish cross-reader compatibility.')
    }
    args.report.parent.mkdir(parents=True,exist_ok=True)
    args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n','utf8')
    print('GNAMMA_NATIVE_CROSS_READER_UNICODE',json.dumps({
      'browser':evidence['engine'],'exact_openings':exact,
      'general_release_approved':False},ensure_ascii=False),flush=True)
    # Diagnostic job succeeds when all engines ran and a truthful report was
    # written. Actual production release requires a separate strict gate.
    return 0


if __name__=='__main__':
    raise SystemExit(main())
