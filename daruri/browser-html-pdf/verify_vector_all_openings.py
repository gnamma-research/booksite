#!/usr/bin/env python3
"""Nonrelease audit of all 414 source opening-phrase glyph-vector PDFs.

This is explicitly NOT 414 complete Arabic passages or an apparatus edition.
"""
import argparse
import hashlib
import json
from pathlib import Path
import fitz

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--pdf',type=Path,required=True)
    ap.add_argument('--fixture',type=Path,required=True)
    ap.add_argument('--evidence',type=Path,required=True)
    ap.add_argument('--report',type=Path,required=True)
    args=ap.parse_args()
    evidence=json.loads(args.evidence.read_text('utf8'))
    src=json.loads(args.fixture.read_text('utf8'))
    positions=evidence['original_opening_positions']
    assert len(positions)==414 and src['authorial_passages']==414
    assert evidence['source_sha256']==src['source_sha256']
    records=[]
    with fitz.open(args.pdf) as doc:
        assert len(doc)==35
        for page_index,page in enumerate(doc):
            by_page=[r for r in positions if r['page']==page_index+1]
            assert 1<=len(by_page)<=12
            candidates=[
                z for b in page.get_text('dict')['blocks']
                for line in b.get('lines',[]) for z in line['spans']
                if z['font']=='GnammaVectorOriginalCID'
            ]
            assert len(candidates)==len(by_page),(
                'Incorrect Unicode source layer count on page '+str(page_index+1))
            assert len(page.get_images(full=True))==0,'Raster page image used'
            for row,sp in zip(by_page,candidates):
                phrase=row['phrase']
                hits=page.search_for(phrase)
                rect=fitz.Rect(row['x']-2,page.rect.height-row['y']-row['height']-2,
                              row['x']+row['width']+2,page.rect.height-row['y']+row['height']+2)
                correctly_located=any((rect & hit).get_area()>0 for hit in hits)
                records.append({
                  'id':row['id'],'page':page_index+1,'source_opening':phrase,
                  'exact_native_phrase_search':bool(hits),
                  'source_aligned_search':correctly_located,
                  'clean_source_copy':sp['text']==phrase,
                  'copy_preview':sp['text'][:100]
                })
    assert len(records)==414
    score={
      'total_original_openings':414,
      'native_exact_phrase_hits':sum(r['exact_native_phrase_search'] for r in records),
      'source_geometry_hits':sum(r['source_aligned_search'] for r in records),
      'clean_copy_hits':sum(r['clean_source_copy'] for r in records)
    }
    report={
      'schema':'gnamma-original-414-vector-openings-native-qa-v1',
      'browser':evidence['engine'],'pdf_sha256':hashlib.sha256(args.pdf.read_bytes()).hexdigest(),
      'source_sha256':src['source_sha256'],'pages':35,'score':score,
      'records':records,
      'complete_source_paragraphs_present':False,
      'complete_625_apparatus_notes_present':False,
      'full_book_publication_approved':False
    }
    args.report.parent.mkdir(parents=True,exist_ok=True)
    args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n','utf8')
    print('GNAMMA_ORIGINAL_414_OPENINGS_NATIVE_QA',json.dumps({
     **score,'pages':35,'source_sha256':src['source_sha256'],
     'full_book_approved':False
    },ensure_ascii=False),flush=True)
    if min(score.values())!=414:
        raise ValueError('The 414-opening HTML-vector native source search or clean copy gate failed')
    return 0

if __name__=='__main__':
    raise SystemExit(main())