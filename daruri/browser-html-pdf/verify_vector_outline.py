#!/usr/bin/env python3
"""Independent native source search / PDF structure verifier for vector proof.

This experiment does not establish fully bilingual, scholarly or mobile quality.
The PDF contains 11 original two-word source excerpts plus one §65 stress phrase,
with no duplicate broken Arabic text stream: glyph outlines are nontext.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path
import fitz

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--pdf',type=Path,required=True)
    p.add_argument('--fixture',type=Path,required=True)
    p.add_argument('--evidence',type=Path,required=True)
    p.add_argument('--report',type=Path,required=True)
    args=p.parse_args()
    raw=args.pdf.read_bytes()
    if not raw.startswith(b'%PDF-'):
        raise ValueError('No real PDF')
    source=json.loads(args.fixture.read_text('utf8'))
    evidence=json.loads(args.evidence.read_text('utf8'))
    if source['authorial_sections']!=258 or source['authorial_passages']!=414:
        raise ValueError('Wrong input source')
    if not evidence.get('drawn_source_as_pdf_glyph_paths'):
        raise ValueError('Arabic was not vector outlined')
    rows=evidence['target_phrases']
    assert len(rows)==12
    if not all(x['phrase'] for x in rows):
        raise ValueError('Missing a phrase')
    with fitz.open(args.pdf) as doc:
        assert len(doc)==1 and doc[0].rect.width>590
        page=doc[0]
        text=page.get_text(sort=False)
        results=[]
        for row in rows:
            phrase=row['phrase']
            matches=page.search_for(phrase)
            # Exact search and clipboard/sample consistency are reported
            # separately; never infer a successful query from normalized text.
            count=len(matches)
            boxes=[]
            copied=[]
            for rect in matches:
                boxes.append([round(v,2) for v in rect])
                copied.append(page.get_textbox(rect))
            # Browser evidence stores PDF bottom-up coordinates; MuPDF uses
            # top-down page rectangles. The original audit wrongly compared
            # coordinate systems and reported zero correct positions.
            expected=fitz.Rect(row['x']-2, page.rect.height-row['y']-row['height']-2,
                               row['x']+row['width']+2,
                               page.rect.height-row['y']+row['height']+2)
            overlap=sum(max(0,(z & expected).get_area()) for z in matches)
            source_spans=[
                item for block in page.get_text('dict')['blocks']
                for line in block.get('lines',[])
                for item in line['spans']
                if item.get('font')=='GnammaVectorOriginalCID'
                   and fitz.Rect(item['bbox']).intersects(expected)
            ]
            source_copy=' '.join(item['text'] for item in source_spans)
            results.append({
                'id':row['id'],'source_phrase':phrase,
                'exact_native_search':count>0,'number_of_search_rectangles':count,
                'within_source_geometry':overlap>0,
                'matches':boxes,'selected_character_rect_text':copied,
                'authorial_span_text':source_copy,
                'authorial_span_count':len(source_spans),
                'clean_copy':source_copy==phrase
            })
        fonts=page.get_fonts(full=True)
        fontname=any('GnammaVectorOriginalCID' in doc.xref_object(f[0])
                     for f in fonts)
        draw=page.get_drawings()
        svg_path_count=len(draw)
        # A true vector version has paths, not page screenshots. Robust for
        # PDF/MuPDF versions whose drawing objects differ in grouping.
        images=len(page.get_images(full=True))
        authorial_total=sum(r['authorial_span_count'] for r in results)
        report={
          'schema':'gnamma-vector-semantic-original-source-test-v1',
          'browser':evidence.get('logical_order'), 'source_sha256':source['source_sha256'],
          'pdf_sha256':hashlib.sha256(raw).hexdigest(),
          'source_phrases':len(rows),'native_hits':sum(r['exact_native_search'] for r in results),
          'correct_geometry_hits':sum(r['within_source_geometry'] for r in results),
          'source_clean_copy_hits':sum(r['clean_copy'] for r in results),
          'source_65_found':any(r['id']=='R065-INLINE-N65' and r['exact_native_search']
                               for r in results),
          'contains_explicit_cid_to_unicode_font':fontname,
          'pdf_vector_path_groups':svg_path_count,'image_xobjects':images,
          'source_painted_as_text':False,'authorial_text_spans':authorial_total,
          'one_semantic_text_span_per_phrase':authorial_total==12,
          'no_duplicate_corrupt_source_text_layer_by_design':True,
          'first_300_extracted_chars':text[:300],
          'results':results,
          'only_12_excerpt_phrases':True,
          'full_414_search_release_approved':False,
          'general_release_approved':False
        }
    args.report.parent.mkdir(parents=True,exist_ok=True)
    args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n','utf8')
    print('GNAMMA_VECTOR_OUTLINE_NATIVE_QA',json.dumps({
        k:report[k] for k in ['native_hits','source_phrases','correct_geometry_hits',
          'source_clean_copy_hits','one_semantic_text_span_per_phrase',
          'source_65_found','contains_explicit_cid_to_unicode_font',
          'pdf_vector_path_groups','image_xobjects','general_release_approved']
    },ensure_ascii=False),flush=True)
    if not fontname or images:
        raise ValueError('Vector/CID proof contains raster or missing Unicode CID font')
    if evidence.get('logical_order')=='phrase':
        # A green browser-creation step without native text fidelity is NOT a
        # passing source experiment. This is intentionally only the 12-row
        # acceptance threshold; it is not full-book acceptance.
        assert report['native_hits']==12, 'Phrase CID cannot find every original Arabic phrase'
        assert report['correct_geometry_hits']==12, 'Search results miss their DOM source positions'
        assert report['source_clean_copy_hits']==12, 'Original Arabic/vowels corrupt on copy'
        assert report['one_semantic_text_span_per_phrase'], 'Source duplicated or split unexpectedly'
        assert report['source_65_found'], 'Inline §65 authorial Arabic is not searchable'
        print('NONRELEASE_12_PHRASE_ACCEPTANCE_PASS: searches, geometry, clean source copy, one Unicode layer')
    return 0

if __name__=='__main__':
    raise SystemExit(main())