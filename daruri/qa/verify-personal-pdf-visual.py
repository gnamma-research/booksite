#!/usr/bin/env python3
"""Pixel and geometry smoke for browser-created personal editions (synthetic notes).

Assert the P1/P2 labels stay within a clear left margin, retain the full
publisher text layer, and link to appendix entries with explicit return links.
Render selected pages for human visual inspection in GitHub Actions artifacts.
"""
import json
import re
import sys
from pathlib import Path

import fitz

ROOT=Path(__file__).resolve().parents[1]
PDF=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'qa/visual-output/personal-pdf-sample.pdf'
OUTPUT=PDF.parent
OUTPUT.mkdir(parents=True,exist_ok=True)

with fitz.open(PDF) as personal, fitz.open(ROOT/'daruri.pdf') as published:
    base=len(published)
    assert len(personal)>base,'personal endnotes pages missing'
    markers=[]
    for page_number in range(base):
        pg=personal[page_number]
        for word in pg.get_text('words'):
            x0,y0,x1,y1,s=word[:5]
            if re.fullmatch(r'P[1-9]\d{0,3}',s) and 0<x0<42:
                box=fitz.Rect(x0,y0,x1,y1)
                assert 0<box.width<39 and 0<box.height<21,'oversized/cropped P label'
                markers.append((page_number,s,box))
    names={x[1] for x in markers}
    assert {'P1','P2'}.issubset(names),f'Missing readable source P1/P2 marginal markers: {names}'
    for i,(page,label,box) in enumerate(markers):
        for other_page,other_label,other_box in markers[i+1:]:
            if page==other_page:
                overlap=box & other_box
                assert overlap.is_empty or overlap.get_area()<0.01,\
                  f'Overlapping marginal labels {label} and {other_label}'
        base_words=published[page].get_text('words')
        assert not any(box.intersects(fitz.Rect(w[:4])) for w in base_words),\
          f'Personal marker {label} covers original publisher text'

    pages=sorted({p for p,_,_ in markers})
    found_forward=0
    for page_num in pages:
        for link in personal[page_num].get_links():
            if link['kind']==fitz.LINK_GOTO and link.get('page',-1)>=base:
                found_forward+=1
    assert found_forward>=4,'Expected P markers plus two quote links to personal endnotes'
    found_back=0
    for page_num in range(base,len(personal)):
        for link in personal[page_num].get_links():
            if link['kind']==fitz.LINK_GOTO and 0<=link.get('page',-1)<base:
                found_back+=1
    assert found_back>=2,'Expected visible personal-note return links'

    # New page drawing and invisible /Link annotations must not damage original
    # publisher words. Ignore the added marginal P labels (left of x=43pt).
    for page_num in pages:
        original=[(round(w[0],1),round(w[1],1),w[4]) for w in published[page_num].get_text('words') if w[0]>=43]
        amended=[(round(w[0],1),round(w[1],1),w[4]) for w in personal[page_num].get_text('words') if w[0]>=43]
        assert original==amended,f'Publisher text positions or wording changed on page {page_num+1}'

    first=pages[0]
    personal[first].get_pixmap(matrix=fitz.Matrix(1.4,1.4),alpha=False).save(OUTPUT/'source-with-P-references.png')
    personal[base].get_pixmap(matrix=fitz.Matrix(1.4,1.4),alpha=False).save(OUTPUT/'personal-endnotes-appendix.png')
    positions=[box for p,_,box in markers if p==first]
    if positions:
        top=max(0,min(r.y0 for r in positions)-28)
        bottom=min(personal[first].rect.height,max(r.y1 for r in positions)+35)
        personal[first].get_pixmap(matrix=fitz.Matrix(2,2),clip=fitz.Rect(0,top,110,bottom),alpha=False).save(OUTPUT/'P-marker-closeup.png')
    summary={'source_page':first+1,'endnotes_start':base+1,
             'markers':[{'page':p+1,'label':n,'box':list(round(x,1) for x in b)} for p,n,b in markers],
             'forward_links':found_forward,'return_links':found_back,
             'publisher_text_preserved':True}
    (OUTPUT/'visual-verification.json').write_text(json.dumps(summary,indent=2))
    print('PASS visible P-labelled references, no marker overlaps, exact original text preservation, forward/back PDF links',summary)
