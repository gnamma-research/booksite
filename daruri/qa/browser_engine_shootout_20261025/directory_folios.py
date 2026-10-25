#!/usr/bin/env python3
"""Independent native PDF verification of 153 glossary page numbers.

All 153 term-directory rows must have printed page numbers equal to their
actual PDF GoTo annotations. This validates scholarly usability, not a
mere converter counter or page-count claim.
"""
import fitz,json,hashlib,sys
from pathlib import Path

def check(pdf,report):
    pdf,report=map(Path,(pdf,report))
    with fitz.open(pdf) as d:
        starts=[i for i,p in enumerate(d) if 'Historical dictionary articles' in p.get_text()]
        if len(starts)!=1:
            raise AssertionError('Expected a unique historical dictionary directory heading')
        start=starts[0]
        found=[];invalid=[]
        for i in range(start,min(start+3,len(d))):
            p=d[i];w=p.rect.width
            links=[x for x in p.get_links() if x['kind']==fitz.LINK_GOTO]
            for x0,y0,x1,y1,word,*_ in p.get_text('words'):
                if not word.isdecimal():continue
                folio=int(word)
                if not start+2<=folio<=len(d):continue
                if not 40<=y0<p.rect.height-48:continue
                if not ((.45*w<x0<.50*w) or (.89*w<x0<.96*w)):continue
                matching=[a for a in links if a.get('page',-1)==folio-1 and
                          abs(a['from'].y0-y0)<8 and
                          (a['from'].x0<w/2)==(x0<w/2)]
                item={'directory_page':i+1,'printed_folio':folio,
                      'column':'left' if x0<w/2 else 'right',
                      'y':round(y0,2),'matching_pdf_links':len(matching)}
                if matching:found.append(item)
                else:invalid.append(item)
        result={
          'source':'actually printed dictionary directory and PDF links',
          'pdf_sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),
          'pdf_pages':len(d),'directory_begin_page':start+1,
          'terms_validated':len(found),'terms_expected':153,
          'both_columns_present':set(x['column'] for x in found)=={'left','right'},
          'directory_pages':sorted(set(x['directory_page'] for x in found)),
          'printed_folios_match_go_to':not invalid,
          'unmatched_printed_page_entries':invalid,
          'first_entries':found[:5],'last_entries':found[-5:]}
        result['passed']=len(found)==153 and result['both_columns_present'] and not invalid
    report.parent.mkdir(parents=True,exist_ok=True)
    report.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n','utf8')
    print('GNAMMA_153_PRINTED_TERM_PAGE_REFS',json.dumps(result,ensure_ascii=False),flush=True)
    if not result['passed']:raise AssertionError('Dictionary folio QA failed')
if __name__=='__main__':
    if len(sys.argv)!=3:raise SystemExit('directory_folios.py generated.pdf report.json')
    check(*sys.argv[1:])
