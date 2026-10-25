#!/usr/bin/env python3
"""Exact Gnamma Arabic glyph-to-Unicode regression input for enhanced Krilla.
Research-only; source text is authoritative, no PDF extraction input.
"""
from pathlib import Path
import json,sys
cases={
 "fully_vowelled_title":("الضَّرُورِيُّ فِي أُصُولِ الْفِقْهِ","Noto Naskh Arabic"),
 "unvowelled_title":("الضروري في أصول الفقه","Noto Naskh Arabic"),
 "vowelled_short":("الْكِتَابُ","Noto Naskh Arabic"),
 "unvowelled_short":("الكتاب","Noto Naskh Arabic"),
 "legal_definition":("هي الإذن بإتيان الفعل كيف شاء الفاعل.","Noto Naskh Arabic"),
 "mixed_paragraph":("ورد لفظ الإِبَاحَة في هذا البحث، ويحتاج إلى ضبط المعنى.","Noto Naskh Arabic")
}
def export(out):
    root=Path(out);root.mkdir(parents=True,exist_ok=True)
    source=[]
    for slug,(arabic,font) in cases.items():
        markup=('\n'.join([
           '#set page(paper:"a4",margin:20mm)',
           '#set text(font:"Noto Serif",size:11pt)',
           '#set document(title:"Gnamma Unicode audit '+slug+'")',
           'GNAMMA scholarly Arabic Unicode test: '+slug,
           '#v(6mm)',
           '#text(font:"'+font+'",lang:"ar",dir:rtl,size:22pt)['+arabic+']',
           '#v(8mm)',
           'Permission to perform the act as the agent wishes.',
           '#link(<dictionary>)[To dictionary]',
           '#heading(level:2)[Historical dictionary] <dictionary>'
        ])+'\n')
        (root/(slug+'.typ')).write_text(markup,'utf8')
        source.append({'id':slug,'arabic_expected':arabic,
                       'arabic_font':font,'source':slug+'.typ','output':slug+'.pdf'})
    (root/'source-cases.json').write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n','utf8')
    print('GNAMMA_ENHANCED_UNICODE_SOURCE',json.dumps(
       [{'case':x['id'],'characters':len(x['arabic_expected'])} for x in source]))
if __name__=='__main__':
    if len(sys.argv)!=2:raise SystemExit('fixtures.py out_dir')
    export(sys.argv[1])
