#!/usr/bin/env python3
"""Compare an alternative pure JS PDF writer's authorial Unicode fidelity.
Never infer browser HTML/CSS layout parity from success here.
"""
from pathlib import Path
import hashlib,json,sys,unicodedata
import fitz

root=Path(sys.argv[1])
fixture=json.loads(Path(sys.argv[2]).read_text('utf8'))
phrases=[v['arabic'] for s in fixture['sample_sections'] for v in s['segments']]
assert len(phrases)==11
def clean(text):
    return ''.join(c for c in unicodedata.normalize('NFKD',text)
                   if unicodedata.category(c)[0] in 'LN').casefold()
for profile in ('arabic-untagged','arabic-pdfa2u','mixed-pdfa2u'):
    source=root/(profile+'.pdf')
    with fitz.open(source) as pdf:
        pages=[p.get_text(sort=False) for p in pdf]
        native_two=0;local_extract=0;native_one=0;full=0
        misses=[]
        for i,phrase in enumerate(phrases):
            first=phrase.split()[:2]
            one=first[0]
            double=' '.join(first)
            a=any(bool(p.search_for(one)) for p in pdf)
            b=any(bool(p.search_for(double)) for p in pdf)
            c=any(clean(''.join(phrase.split()[:5])) in clean(page) for page in pages)
            d=any(clean(phrase) in clean(page) for page in pages)
            native_one+=a;native_two+=b;local_extract+=c;full+=d
            if not all((a,b,c,d)):
                misses.append({'sample':i+1,'word':one,'first_two_native_search':b,
                               'five_word_extract':c,'full_para_extract':d})
        xmp=pdf.xref_get_key(pdf.pdf_catalog(),'StructTreeRoot')
        report={
            'engine':profile,'pages':len(pdf),
            'one_word_native':native_one,'two_word_native':native_two,
            'first_five_extracted':local_extract,'complete_para_extracted':full,
            'expected':len(phrases),'source_html_type_setting_proven':False,
            'native_reader':'PyMuPDF','tag_root':list(xmp),
            'first_failures':misses[:8],
            'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),
            'native_arabic_search_release_approved':False,
        }
        (root/(profile+'-native.json')).write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
        print('PDFNATIVE_ALTERNATIVE_UNICODE_QA',json.dumps(report,ensure_ascii=False),flush=True)
