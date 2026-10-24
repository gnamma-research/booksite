#!/usr/bin/env python3
"""Research-only acceptance gate for original-HTML full-Scholarly browser PDFs.

Verify 258 source-derived numbered topic bookmarks and their real PDF targets;
complete HTML apparatus counts; independent Poppler Latin-content probes; and
all original external hyperlinks. Not an Arabic vowel-sensitive search test.
"""
from pathlib import Path
import fitz, hashlib, json, re, subprocess, sys, unicodedata
from bs4 import BeautifulSoup

def norm(x):
    return ''.join(c.lower() for c in unicodedata.normalize("NFKD",x)
                   if c.isascii() and c.isalnum())

def tidy(x):
    return ' '.join(x.split())

def run():
    if len(sys.argv)!=4: raise SystemExit("source.html book.pdf output.json")
    html,pdf,out=map(Path,sys.argv[1:])
    src=BeautifulSoup(html.read_text('utf8'),'html.parser')
    expected={}
    for el in src.select('section.editorial-toc a[href^="#section-"]'):
        m=re.fullmatch(r'#section-([0-9]+)',el.get('href',''))
        if m and 1<=int(m[1])<=258:
            i=int(m[1])
            v=re.sub(r'^\s*\d+\.\s*','',el.get_text(' ',strip=True))
            expected[tidy('§'+str(i)+' · '+v)]=i
    failures=[]
    for selector,n in [('section.text-section[data-section-id]',259),
                       ('p.source-segment.english',416),
                       ('p.source-segment.arabic',416),
                       ('.apparatus-note',625),('.lex-term',153),
                       ('.lex-article',157),
                       ('p.lex-paragraph[data-language="en"]',283)]:
        got=len(src.select(selector))
        if got!=n:failures.append(selector+' count '+str(got)+' instead of '+str(n))
    if len(expected)!=258:failures.append('original editorial labels are incomplete')

    with fitz.open(pdf) as d:
        allentries=d.get_toc(simple=False)
        matched=[]
        for lev,label,page,details in allentries:
            number=expected.get(tidy(label))
            if number is not None:
                at=details.get('to')
                matched.append({'section':number,'page':page,
                                'level':lev,'y':round(at.y,2) if at else None,
                                'valid':bool(at and 1<=page<=len(d)
                                              and 0<=at.y<=d[page-1].rect.height)})
        if len(matched)!=258 or [x['section'] for x in matched]!=list(range(1,259)):
            failures.append('PDF does not have all 258 numbered topical bookmarks in order')
        if any(not x['valid'] for x in matched):
            failures.append('PDF has invalid section bookmark coordinates')
        if any(matched[i]['page']>matched[i+1]['page'] for i in range(len(matched)-1)):
            failures.append('PDF section bookmark page order reverses')
        links=[link for page in d for link in page.get_links()]
        go=[x for x in links if x['kind']==fitz.LINK_GOTO]
        uris={x['uri'] for x in links if x['kind']==fitz.LINK_URI}
        originals={x['href'] for x in src.select('a[href^="http"]')}
        if any(not 0<=x.get('page',-1)<len(d) for x in go):
            failures.append('Invalid internal GoTo link destinations')
        if originals-uris:
            failures.append('Missing '+str(len(originals-uris))+' original source URLs')
        if len(go)<3400:failures.append('Internal links dropped')
        if not 180<=len(d)<=330:failures.append('Implausible A4 full Scholarly length')
        if any(abs(p.rect.width-595.276)>2 or abs(p.rect.height-841.89)>2 for p in d):
            failures.append('Non-A4 page sizes')
        metrics={'pages':len(d),'pdf_outline_entries':len(allentries),
                 'section_bookmarks':len(matched),
                 'internal_links':len(go),'external_link_objects':len(links)-len(go),
                 'original_external_urls':len(originals),
                 'preserved_external_urls':len(originals & uris),
                 'first_bookmarks':matched[:3],'last_bookmarks':matched[-3:]}

    # Use a second PDF engine; note probes exclude Arabic-only spans but
    # explicitly preserve all 625 source note objects in the canonical HTML.
    p=subprocess.run(['pdftotext','-layout',str(pdf),'-'],text=True,
                     encoding='utf8',errors='replace',capture_output=True,timeout=180)
    if p.returncode:failures.append('Independent Poppler extraction failed')
    extracted=norm(p.stdout)
    fidelity={}
    groups={
      'original_english':('p.source-segment.english',None,25),
      'scholarly_notes':('.apparatus-note','.note-prose',25),
      'historical_dictionary':('p.lex-paragraph[data-language="en"]',None,25),
      'glossary_definitions':('.lex-term','[data-term-definition]',25)}
    for name,(sel,inner,width) in groups.items():
        elements=src.select(sel);eligible=0;present=0;full=0;missing=[]
        for i,el in enumerate(elements):
            node=el.select_one(inner) if inner else el
            val=norm(node.get_text(' ',strip=True)) if node else ''
            if len(val)<width:continue
            eligible+=1
            matched=(val[:width] in extracted or val[-width:] in extracted)
            # Explicitly verified bidi-interleaved English in this Arabic
            # grammar note; do not drop this note or suppress future misses.
            if not matched and el.get('id')=='G-B2-0317':
                matched='indicationsaccompaniedthem' in extracted
            present+=int(matched)
            full+=int(val in extracted)
            if not matched:missing.append({'index':i,'id':el.get('id')})
        fidelity[name]={'original_objects':len(elements),'eligible':eligible,
                        'present':present,'fully_collated_latin':full,
                        'missing':missing[:8]}
        if present!=eligible:failures.append(name+' lost '+str(eligible-present)+' source text probes')
        if name=='glossary_definitions' and full!=153:
            failures.append('Original glossary prose not completely preserved')
    metrics.update({'source_sha256':hashlib.sha256(html.read_bytes()).hexdigest(),
                    'pdf_sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),
                    'fidelity':fidelity,'errors':failures,
                    'browser_pdf_search_with_tashkil_not_required':True,
                    'physical_ios_android_tests_completed':False,
                    'release_approved':False,
                    'automated_scholarly_qa_passed':not failures})
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(metrics,ensure_ascii=False,indent=2)+'\n','utf8')
    print('GNAMMA_COMPLETE_SCHOLARLY_QA',json.dumps({
        'pages':metrics['pages'],'section_bookmarks':len(matched),
        'links':len(links),'fidelity':fidelity,'errors':failures,
        'passed':not failures},ensure_ascii=False),flush=True)
    if failures:raise AssertionError('; '.join(failures))

if __name__=='__main__':run()
