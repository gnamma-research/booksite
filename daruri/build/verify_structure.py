#!/usr/bin/env python3
"""Verify the rebuilt source hierarchy, destinations and low-ink PDF output."""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import re
import fitz
from build_editions import NAMES, PARENTS, read_book


def verify(output):
    book=read_book();reports=[]
    source_ids={s['id'] for s in book['sections'] if isinstance(s['id'],int) and s.get('headingAr')}
    assert source_ids==set(PARENTS) and len(source_ids)==46
    for edition,(filename,_) in NAMES.items():
        path=output/filename;meta=json.loads((output/(filename+'.metadata.json')).read_text())
        assert hashlib.sha256(path.read_bytes()).hexdigest()==meta['sha256'],filename+' metadata hash'
        pdf=fitz.open(path);toc=pdf.get_toc(simple=False);ar=edition.startswith('arabic')
        assert len(pdf)==meta['pages']
        assert meta['main_text_validation']['ok'] and meta['footnote_pagination']['ok']
        assert meta['structural_outline']['ok']
        assert 1<=len(meta['contents_pages']['original'])<=2,filename+' compact source contents'
        assert (len(meta['contents_pages']['editorial'])==0 if ar else 1<=len(meta['contents_pages']['editorial'])<=4),filename+' compact editorial contents'
        start=next(i for i,x in enumerate(toc) if x[1] in ['Text · recorded parts and chapters','متن الكتاب: الأجزاء والفصول'])
        end=next(i for i in range(start+1,len(toc)) if toc[i][0]==1)
        primary=toc[start+1:end];seen={}
        for row in primary:
            match=re.search(r'\(§(\d+)\)$',row[1])
            if match:
                n=int(match[1]);seen[n]=row
        assert set(seen)==source_ids,filename+' source bookmark coverage'
        for n,row in seen.items():
            depth=0;parent=PARENTS[n]
            while parent is not None:depth+=1;parent=PARENTS[parent]
            assert row[0]==depth+2,(filename,n,'source hierarchy')
            expected=meta['anchors']['section-'+str(n)]
            assert row[2]==expected['page'],(filename,n,'source destination')
            assert abs(row[3]['to'].y-expected['y'])<.1,(filename,n,'source position')
        colophon=toc[end]
        assert colophon[0]==1 and colophon[2]==meta['section_pages']['colophon'],filename+' separate colophon'
        assert ('Editorial section titles · our descriptive labels' in [r[1] for r in toc])==(not ar)
        if not ar:
            start=next(i for i,r in enumerate(toc) if r[1]=='Editorial section titles · our descriptive labels')
            end=next((i for i in range(start+1,len(toc)) if toc[i][0]==1),len(toc))
            titles={int(m[1]):r for r in toc[start+1:end] if (m:=re.match(r'^(\d+)\. ',r[1]))}
            assert set(titles)==set(range(1,259)),filename+' editorial bookmark coverage'
            for section in book['sections']:
                n=section['id']
                if isinstance(n,int):
                    assert titles[n][1]==f'{n}. {section["title"]}'
                    assert titles[n][2]==meta['section_pages'][str(n)]
        visible_anchor_checks=0
        primary_language='ar' if edition=='arabic' else 'en' if edition=='english' else 'vocalized'
        for section in book['sections']:
            key=str(section['id']);dest=meta['anchors']['section-'+key]
            if section.get('headingAr'):
                heading=meta['anchors'][f'heading-{key}-{primary_language}']
                assert dest['page']==heading['page'],(filename,key,'visible source heading destination')
                visible_anchor_checks+=1
        if edition=='scholarly':assert meta['anchors']['subject-index']['page']<meta['anchors']['lexicon-introduction']['page']
        elif edition=='english':assert meta['anchors']['subject-index']['page']<meta['anchors']['glossary']['page']
        colors=set();outside=[];images=0
        for number,page in enumerate(pdf,1):
            images+=len(page.get_images())
            for block in page.get_text('dict')['blocks']:
                for line in block.get('lines',[]):
                    for span in line['spans']:
                        colors.add(span['color'])
                        if span['text'].strip():
                            x0,y0,x1,y1=span['bbox']
                            if x0<-.5 or y0<-.5 or x1>page.rect.width+.5 or y1>page.rect.height+.5:outside.append([number,span['text'][:80],span['bbox']])
        assert colors=={0},(filename,'colored text',colors)
        assert images==0,(filename,'unexpected graphics')
        assert not outside,(filename,'out-of-page text',outside[:3])
        reports.append({'filename':filename,'pages':len(pdf),'source_headings':len(seen),'visible_source_destinations':visible_anchor_checks,'editorial_titles':0 if ar else 258,'contents_pages':meta['contents_pages'],'all_text_black':True,'images':images,'out_of_page_spans':len(outside),'ok':True})
    result={'release':'daruri8-structure-20261020','editions':reports,'ok':True}
    (output/'structure-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
    return result

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--output-dir',type=Path,required=True);args=p.parse_args();print(json.dumps(verify(args.output_dir),ensure_ascii=False,indent=2))
