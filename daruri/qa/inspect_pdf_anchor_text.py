#!/usr/bin/env python3
import fitz,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
for fname in ['daruri.pdf','daruri-study.pdf','daruri-english.pdf','daruri-arabic.pdf','daruri-arabic-vowelled.pdf']:
    meta=json.loads((root/'build/release'/(fname+'.metadata.json')).read_text())
    pdf=fitz.open(root/fname)
    print('\nEDITION',fname,'PAGES',len(pdf))
    for a in ['segment-1-0-en','segment-1-0-ar','segment-12-0-en','segment-12-0-ar','segment-62-0-en','segment-62-0-ar']:
        if a not in meta['anchors']:continue
        loc=meta['anchors'][a]
        page=pdf[int(loc['page'])-1]
        x,y=float(loc['x']),float(loc['y'])
        rect=fitz.Rect(max(0,x-5),max(0,y-4),min(page.rect.width,x+240),min(page.rect.height,y+56))
        words=page.get_text('words',clip=rect)
        print('ANCHOR',a,'COORD',round(x),round(y),'words',[(round(w[0]),round(w[1]),w[4]) for w in words[:25]])
        print('TEXT',repr(page.get_text(clip=rect)[:300]))
