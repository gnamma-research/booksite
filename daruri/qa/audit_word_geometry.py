#!/usr/bin/env python3
"""Read-only word rectangle audit for Gnamma's prebuilt Daruri PDFs.

Proves extracted word text and coordinates on source pages survive apparatus
assembly. This is NOT sufficient to enable exact user-quotation highlights:
segment/token-to-word correspondence and Arabic RTL geometry need independent
validation; word_map_present must remain false until that work passes.
"""
from __future__ import annotations
from pathlib import Path
from collections import Counter
import hashlib
import json
import time
import fitz

ROOT=Path(__file__).resolve().parents[1]
ED=ROOT/'editions'
APP=ED/'apparatus'

def words(page):
    found=page.get_text('words',sort=False)
    if not found:
        raise ValueError('No extractable words')
    for w in found:
        if len(w)!=8:raise ValueError('Incomplete PDF word tuple')
        x0,y0,x1,y1=w[:4]
        if not (x0<x1 and y0<y1):
            raise ValueError('Invalid PDF word box')
        if not (-5<=x0<=page.rect.width+5 and -5<=y0<=page.rect.height+5 and
                -5<=x1<=page.rect.width+5 and -5<=y1<=page.rect.height+5):
            raise ValueError('Word geometry outside page')
    return found

def checksum(tokens):
    h=hashlib.sha256()
    for token in tokens:
        # Unlike text-only hashing, include each word's exact 4 coordinates.
        h.update(json.dumps([round(v,4) if isinstance(v,float) else v for v in token],
                            ensure_ascii=False,separators=(',',':')).encode('utf8'))
        h.update(b'\n')
    return h.hexdigest()

def main():
    start=time.monotonic()
    base_manifest=json.loads((ED/'manifest.json').read_text())
    variant_manifest=json.loads((APP/'manifest.json').read_text())
    assert base_manifest['status']=='verified'
    assert variant_manifest['status']=='verified' and len(variant_manifest['files'])==120
    base_cache={}
    for base in base_manifest['files']:
        with fitz.open(ED/base['file']) as doc:
            assert len(doc)==base['pages']
            page_words=[words(page) for page in doc]
            source_word_count=sum(map(len,page_words))
            assert source_word_count>=2000,base['file']
            base_cache[base['file']]=(list(map(checksum,page_words)),source_word_count)
    totals=Counter()
    profile_types=Counter()
    bad=[]
    for number,row in enumerate(variant_manifest['files'],1):
        base=row['source_base']
        if base not in base_cache:raise ValueError('Unrecognized base '+base)
        digests,word_count=base_cache[base]
        if len(digests)!=row['base_pages']:raise ValueError('Base page count mismatch')
        with fitz.open(APP/row['filename']) as pdf:
            assert len(pdf)==row['pages']
            for i,origin_hash in enumerate(digests):
                try:
                    if checksum(words(pdf[i]))!=origin_hash:
                        bad.append({'file':row['filename'],'page':i+1,'reason':'word boxes shifted'})
                except Exception as exc:
                    bad.append({'file':row['filename'],'page':i+1,'reason':str(exc)})
            totals['pages_checked']+=len(digests)
            totals['words_checked']+=word_count
            profile_types[row['tier']]+=1
        if number%10==0:print('AUDIT',number,'of 120',flush=True)
    report={
        'release':variant_manifest['release'],
        'status':'PASS' if not bad else 'FAIL',
        'source_base_editions':len(base_cache),
        'apparatus_editions':len(variant_manifest['files']),
        'by_tier':dict(profile_types),
        'source_pages_checked':totals['pages_checked'],
        'source_words_checked':totals['words_checked'],
        'claim':'PDF-extracted original word text and boxes are invariant across apparatus merges; quote localization and RTL semantic correctness remain unverified.',
        'word_map_present':False,
        'failures':bad[:25],
        'duration_seconds':round(time.monotonic()-start,2)
    }
    out=ROOT/'qa'/'word-geometry-audit-report.json'
    out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('WORD GEOMETRY AUDIT:',json.dumps(report,ensure_ascii=False),flush=True)
    if bad:raise RuntimeError(str(len(bad))+' base source pages have shifted word geometry')

if __name__=='__main__':main()
