#!/usr/bin/env python3
"""Independent strict native-PDF reconstruction of all 414 original Arabic
passages from actual browser-created vector pages (NONRELEASE).

Checks *full original text*, not just 414 opening phrases. Search and geometry
of the opening remain separate. This does not certify word-level selection,
English, scholarly footnotes, original pagination or native iOS/Android.
"""
import argparse
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path
import fitz

def canonical(text):
    return re.sub(r"\s+", " ", text.strip())

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--pdf',type=Path,required=True)
    ap.add_argument('--fixture',type=Path,required=True)
    ap.add_argument('--evidence',type=Path,required=True)
    ap.add_argument('--report',type=Path,required=True)
    args=ap.parse_args()
    fixture=json.loads(args.fixture.read_text('utf8'))
    evidence=json.loads(args.evidence.read_text('utf8'))
    assert fixture['authorial_passages']==414 and fixture['authorial_sections']==258
    assert evidence['source_paragraphs']==414
    assert evidence['vector_math_brackets_drawn']==24
    assert evidence['vector_math_left']==12 and evidence['vector_math_right']==12
    original={}
    for section in fixture['full_sections']:
        for seg in section['segments']:
            assert seg['id'] not in original
            original[seg['id']]=canonical(seg['arabic'])
    assert len(original)==414
    raw_sha=hashlib.sha256("\n".join(original.values()).encode('utf8')).hexdigest()
    assert raw_sha==evidence['original_arabic_text_sha256'], 'Source text changed before publication'
    records=evidence['source_lines']
    assert len(records)==evidence['source_line_count']
    asserted=defaultdict(list)
    extracted=defaultdict(list)
    first_line={}
    counts={'native_full_lines_exact':0,'native_full_lines_total':len(records),
      'native_exact_full_line_search':0,'native_full_line_geometry':0,
      'opening_search_correctly_located':0,'original_passages_exact':0,
      'original_passages_total':414,'full_source_chars':sum(len(x) for x in original.values()),
      'raster_images':0,'glyph_outline_paths':0,'all_lines_are_semantic_single_CIDs':True}
    by_page=defaultdict(list)
    for rec in records:by_page[rec['page']].append(rec)
    with fitz.open(args.pdf) as pdf:
        assert len(pdf)==evidence['pages']
        for page_no,p in enumerate(pdf):
            own=by_page[page_no+1]
            assert len(own) and len(own)<=12
            counts['raster_images']+=len(p.get_images(full=True))
            counts['glyph_outline_paths']+=len(p.get_drawings())
            # Original reader search/copy regions are the acceptance unit, not
            # PyMuPDF's arbitrary font-span segmentation. In one long
            # marked-content ActualText operation it may merge neighbouring
            # CIDs into a span or split at a bidi boundary despite correct
            # source-specific selection and exact multiword search.
            all_source_text=p.get_text(sort=False)
            assert 'GnammaVectorOriginalCID' in {
                f[3] for f in p.get_fonts(full=True)
            }, 'Invisible original Unicode CID font was not embedded'
            for row in own:
                id=row['id']
                asserted[id].append(row['phrase'])
                box=fitz.Rect(row['x']-2,p.rect.height-row['y']-row['height']-2,
                    row['x']+row['width']+2,p.rect.height-row['y']+row['height']+2)
                selected=p.get_textbox(box).strip()
                extracted[id].append(selected)
                if selected==row['phrase']:
                    counts['native_full_lines_exact']+=1
                hits=p.search_for(row['phrase'])
                if hits:
                    counts['native_exact_full_line_search']+=1
                if any((h&box).get_area()>0 for h in hits):
                    counts['native_full_line_geometry']+=1
                if row['phrase'] not in all_source_text:
                    raise AssertionError('Original Unicode line absent from page extraction: '+row['unique_line_id'])
                if row['line']==1:
                    first_line[id]=(page_no+1,row)
                    phrase=' '.join(original[id].split(' ')[:2])
                    hits=p.search_for(phrase)
                    if any((h&box).get_area()>0 for h in hits):
                        counts['opening_search_correctly_located']+=1
    failures=[]
    for id,text in original.items():
        pre=' '.join(asserted[id])
        got=' '.join(extracted[id])
        if pre!=text or got!=text:
            failures.append({'id':id,'expected_start':text[:100],
              'source_line_start':pre[:100],'native_copy_start':got[:100],
              'native_length':len(got),'expected_length':len(text)})
        else:
            counts['original_passages_exact']+=1
    report={
     'schema':'gnamma-browser-pdf-full-original-arabic-source-v1',
     'browser':evidence['engine'],'source_sha256':fixture['source_sha256'],
     'font_sha256':evidence['font_sha256'],
     'pdf_sha256':hashlib.sha256(args.pdf.read_bytes()).hexdigest(),
     'pages':evidence['pages'],'counts':counts,'sample_failures':failures[:20],
     'full_arabic_original_text_verified':counts['original_passages_exact']==414,
     'english_translation_in_pdf':False,
     'full_study_scholarly_notes_in_pdf':False,
     'per_word_selection_certified':False,
     'actualtext_single_original_source_operation':True,
     'poppler_logical_order_certified':False,
     'original_12_A4_layout_parity_certified':False,
     'native_apple_pdfkit_pdfium_certified':False,
     'production_approved':False
    }
    args.report.parent.mkdir(parents=True,exist_ok=True)
    args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n','utf8')
    print('GNAMMA_FULL_ARABIC_NATIVE_QA',json.dumps({
      'browser':evidence['engine'],'pages':report['pages'],'counts':counts,
      'production_approved':False},ensure_ascii=False),flush=True)
    if counts['raster_images'] or counts['glyph_outline_paths']==0:
        raise AssertionError('No vector glyph outlines or raster screenshots used')
    if counts['native_full_lines_exact']!=len(records):
        raise AssertionError('Native region-select/copy does not preserve every original Arabic line')
    if counts['native_exact_full_line_search']!=len(records) or counts['native_full_line_geometry']!=len(records):
        raise AssertionError('Full original Arabic Unicode phrase search or its source rectangle failed')
    if counts['original_passages_exact']!=414:
        raise AssertionError('At least one full authorial Arabic paragraph lost or corrupted')
    if counts['opening_search_correctly_located']!=414:
        raise AssertionError('Opening phrase not searchable or not source-aligned in a paragraph')
    return 0

if __name__=='__main__':
    raise SystemExit(main())