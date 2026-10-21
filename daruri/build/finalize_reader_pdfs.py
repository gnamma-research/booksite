#!/usr/bin/env python3
"""Finish A4 Daruri PDFs with original/editiorial outline, metadata and viewer preferences.
Does not edit any page text or remove existing annotations and links."""
from pathlib import Path
import argparse, hashlib, json, re, os
import fitz
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject

ROOT=Path(__file__).resolve().parent.parent
RAW=(ROOT/'edition-r3-20261020.js').read_text(encoding='utf8')
MATCH=re.search(r'textContent\s*=\s*("(?:\\.|[^"\\])*")\s*;',RAW,re.S)
BOOK=json.loads(json.loads(MATCH.group(1)))
SECTIONS=[s for s in BOOK['sections'] if isinstance(s['id'],int)]
PARTS=[(1,'Introduction'),(10,'I · Legal rulings'),(62,'II · Sources of rulings'),(148,'III · Language and derivation'),(230,'IV · Ijtihād and authority')]
ORIGINAL=[s for s in SECTIONS if s.get('headingEn') or s.get('headingAr')]
assert len(SECTIONS)==258 and len(ORIGINAL)==46

def finish(path,tier,lang,titles):
    pdf=PdfReader(path)
    named=pdf.named_destinations
    pages={s['id']:pdf.get_destination_page_number(named['section-'+str(s['id'])])+1
           for s in SECTIONS if 'section-'+str(s['id']) in named}
    if tier!='part' and len(pages)!=258:
        raise ValueError(f'{path}: expected 258 destinations, got {len(pages)}')
    if not pages:raise ValueError(f'{path}: no numbered sections')
    document=fitz.open(path)
    before_text=[hashlib.sha256(p.get_text().encode()).hexdigest() for p in document]
    before_links=sum(len(p.get_links()) for p in document)
    outline=[[1,'Original headings · Source order',1]]
    for i,(num,name) in enumerate(PARTS):
        end=PARTS[i+1][0] if i+1<len(PARTS) else 259
        available=[j for j in range(num,end) if j in pages]
        if not available:continue
        outline.append([2,name,pages[available[0]]])
        for s in ORIGINAL:
            if s['id'] in pages and num<=s['id']<end:
                title=s.get('headingAr') if lang.startswith('arabic') else s.get('headingEn')
                outline.append([3,(title or s.get('headingEn') or s.get('headingAr') or 'Chapter')[:150],pages[s['id']]])
    if titles:
        outline.append([1,'Editorial section titles · Descriptive, not original',1])
        for i,(num,name) in enumerate(PARTS):
            end=PARTS[i+1][0] if i+1<len(PARTS) else 259
            available=[j for j in range(num,end) if j in pages]
            if not available:continue
            outline.append([2,name,pages[available[0]]])
            for s in SECTIONS:
                if s['id'] in pages and num<=s['id']<end:
                    outline.append([3,'§'+str(s['id'])+' · '+s['title'],pages[s['id']]])
    document.set_toc(outline,collapse=1)
    label={'bilingual':'Arabic & English','english':'English','arabic':'Arabic','arabic-vowelled':'Arabic vowelled'}[lang]
    subject=('Study edition, selected explanatory and Qur’an source notes' if tier=='study'
             else 'A4 reading edition, full text, minimal apparatus')
    document.set_metadata({'title':'Al-Ḍarūrī | '+label+' | '+subject+' | Editorial titles '+('on' if titles else 'off'),
      'author':'Ibn Rushd (Averroes); Gnamma Research editorial edition',
      'subject':subject,
      'keywords':'Ibn Rushd; al-Daruri; usul al-fiqh; Arabic; English; Gnamma',
      'creator':'Gnamma Research', 'producer':'WeasyPrint; PyMuPDF'})
    document.set_pagelayout('SinglePage')
    document.set_pagemode('UseOutlines')
    document.xref_set_key(document.pdf_catalog(),'ViewerPreferences',
        '<< /DisplayDocTitle true /FitWindow false /CenterWindow false >>')
    temp=path.with_suffix('.finished.pdf')
    document.save(temp,garbage=3,deflate=True)
    document.close()
    with fitz.open(temp) as check:
        if check.pagemode!='UseOutlines':
            # Some WeasyPrint files have an /AF entry that causes MuPDF to restore
            # /UseAttachments when saving. Reassert the preference using pypdf.
            writer=PdfWriter(clone_from=temp)
            writer._root_object[NameObject('/PageMode')]=NameObject('/UseOutlines')
            tmp2=path.with_suffix('.view.pdf')
            with tmp2.open('wb') as f:writer.write(f)
            os.replace(tmp2,temp)
    with fitz.open(temp) as check:
        assert check.pagemode=='UseOutlines'
        assert len(check.get_toc())==len(outline)
        assert len(check)==len(pdf.pages)
        assert all(abs(p.rect.width-595.28)<2 for p in check)
        assert sum(len(p.get_links()) for p in check)==before_links
        assert before_text==[hashlib.sha256(p.get_text().encode()).hexdigest() for p in check]
        result={'href':str(path.relative_to(ROOT)),'pages':len(check),
                'bookmarks':len(outline),'links':before_links,
                'language':lang,'titles':titles,'tier':tier}
    os.replace(temp,path)
    print('FINISHED',result['href'],result['pages'],result['bookmarks'],result['links'],flush=True)
    return result

def main():
    p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True);a=p.parse_args()
    base=a.root
    records=[]
    for lang in ['bilingual','english','arabic','arabic-vowelled']:
        for titles in (False,True):
            suffix='-editorial' if titles else ''
            path=base/'reading'/('print-daruri-'+lang+suffix+'.pdf')
            if not path.exists():raise ValueError('Missing '+str(path))
            records.append(finish(path,'reading',lang,titles))
        for part in ('part-1','part-2','part-3','part-4'):
            path=base/'parts'/'print'/'parts'/lang/(part+'.pdf')
            if path.exists():records.append(finish(path,'part',lang,False))
    for titles in (False,True):
        path=base/'study'/('study-bilingual-titles-'+('on' if titles else 'off')+'.pdf')
        if not path.exists():raise ValueError('Missing '+str(path))
        records.append(finish(path,'study','bilingual',titles))
    expected=26
    assert len(records)==expected,(len(records),expected)
    (base/'catalog.json').write_text(json.dumps({
       'revision':'20261021-a4-reading-study',
       'tiers':['reading','study','reference'],
       'files':records},ensure_ascii=False,indent=2),encoding='utf8')
    print('TOTAL',len(records),flush=True)
if __name__=='__main__':main()
