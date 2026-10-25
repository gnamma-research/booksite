#!/usr/bin/env python3
"""Native enhanced-Krilla full Scholarly PDF Arabic and reference fidelity.
The original HTML and JSON, never a preexisting published PDF, are sources.
No Arabic vowelled *Find* criterion, but logical Unicode copy is tested.
"""
from pathlib import Path
from bs4 import BeautifulSoup
from collections import Counter
import fitz,subprocess,hashlib,json,unicodedata,sys,re

def ar(s):
    return ''.join(c for c in unicodedata.normalize('NFKC',s)
      if '\u0621'<=c<='\u064a' and unicodedata.category(c).startswith('L'))
def latin(s):
    return ''.join(c.casefold() for c in unicodedata.normalize('NFKD',s)
                   if c.isascii() and c.isalnum())
def unique_count(seq):
    return len(set(seq))
def main(html,pdf,destination):
    html,pdf,destination=map(Path,(html,pdf,destination))
    soup=BeautifulSoup(html.read_text('utf8'),'html.parser')
    record={'source_arabic_segments':len(soup.select('p.source-segment.arabic')),
            'source_english_segments':len(soup.select('p.source-segment.english')),
            'source_scholarly_notes':len(soup.select('.apparatus-note')),
            'source_lexicon_dossiers':len(soup.select('.lex-term')),
            'source_historical_articles':len(soup.select('.lex-article')),
            'source_lexicon_english_paragraphs':len(soup.select('p.lex-paragraph[data-language="en"]'))}
    if (record['source_arabic_segments'],record['source_english_segments'],
        record['source_scholarly_notes'],record['source_lexicon_dossiers'],
        record['source_historical_articles']) != (416,416,625,153,157):
        raise AssertionError('Wrong entire Scholarly canonical source counts '+str(record))
    with fitz.open(pdf) as d:
        text='\n'.join(pg.get_text(sort=False) for pg in d)
        pages=len(d);toc=d.get_toc(simple=False)
        links=[x for pg in d for x in pg.get_links()]
        kind=Counter(x['kind'] for x in links)
        names=d.resolve_names()
        cover=d[0].get_text(sort=False)
        a4=all(abs(x.rect.width-595.276)<2 and abs(x.rect.height-841.890)<2 for x in d)
        missing_go=sum(1 for x in links if x['kind']==fitz.LINK_GOTO and
                       not 0<=x.get('page',-1)<pages)
    original=soup.select_one('.cover .arabic-title').get_text(' ',strip=True)
    source_ar=ar(original);pdf_ar=ar(cover)
    # Arabic first-page excerpt includes more than the title; test full exact
    # logical TITLE match, not total Arabic page characters.
    title_exact=source_ar in pdf_ar
    extracted_ar=ar(text)
    extracted_latin=latin(text)
    arabic_sample=[]
    for ix,node in enumerate(soup.select('p.source-segment.arabic')):
        src=ar(node.get_text(' ',strip=True))
        if len(src)<24:continue
        match=src[:24] in extracted_ar or src[-24:] in extracted_ar
        arabic_sample.append({'index':ix,'covered':match,'length':len(src)})
    english_sample=[]
    for ix,node in enumerate(soup.select('p.source-segment.english')):
        src=latin(node.get_text(' ',strip=True))
        if len(src)<25:continue
        match=src[:25] in extracted_latin or src[-25:] in extracted_latin
        english_sample.append({'index':ix,'covered':match})
    note_sample=[]
    for ix,node in enumerate(soup.select('.apparatus-note')):
        prose=node.select_one('.note-prose')
        if prose is None:continue
        src=latin(prose.get_text(' ',strip=True))
        if len(src)<24:continue
        note_sample.append({'index':ix,
          'covered':src[:24] in extracted_latin or src[-24:] in extracted_latin})
    report={
      'schema':'gnamma-entire-scholarly-enhanced-Krilla-Unicode-v1',
      'pdf_bytes':pdf.stat().st_size,
      'pdf_sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),
      'source_html_sha256':hashlib.sha256(html.read_bytes()).hexdigest(),
      'a4_pages':pages,
      'a4_geometry_all_pages':a4,
      'pdf_outline_bookmarks':len(toc),
      'section_bookmarks_present':sum(1 for e in toc
                                     if re.match(r'^§\d+ ·',e[1])),
      'pdf_named_destinations':len(names),
      'pdf_link_objects':len(links),
      'go_to_links':kind[fitz.LINK_GOTO],
      'external_links':kind[fitz.LINK_URI],
      'invalid_go_to':missing_go,
      'arabic_cover_expected_base_letters':len(source_ar),
      'arabic_cover_exact_logical_sequence':title_exact,
      'arabic_cover_text_excerpt':cover[:450],
      'arabic_source_eligible':len(arabic_sample),
      'arabic_source_begin_or_end_covered':sum(x['covered'] for x in arabic_sample),
      'arabic_source_missing_indices':[x['index'] for x in arabic_sample if not x['covered']][:30],
      'english_source_eligible':len(english_sample),
      'english_source_begin_or_end_covered':sum(x['covered'] for x in english_sample),
      'english_source_missing_indices':[x['index'] for x in english_sample if not x['covered']][:30],
      'note_eligible':len(note_sample),
      'notes_begin_or_end_covered':sum(x['covered'] for x in note_sample),
      'note_missing_indices':[x['index'] for x in note_sample if not x['covered']][:30],
      'canonical':record,
      'client_WASM_export_not_yet_tested':True,
      'research_only':True
    }
    destination.parent.mkdir(parents=True,exist_ok=True)
    destination.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n','utf8')
    print('GNAMMA_ENHANCED_FULL_SCHOLARLY_PDF_AUDIT',json.dumps(report,ensure_ascii=False)[:6000],flush=True)
    assert 180<=pages<=350
    assert a4 and missing_go==0
    assert len(toc)>=900 and kind[fitz.LINK_GOTO]>3000
    assert title_exact,'Full-book Arabic cover title is not extractable verbatim'
if __name__=='__main__':
    if len(sys.argv)!=4:raise SystemExit('enhanced_full_pdf_qa.py html pdf output.json')
    main(*sys.argv[1:])
