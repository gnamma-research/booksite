#!/usr/bin/env python3
"""Independent SCHOLARLY real-content audit: 625 note bodies + 153 glossary terms +
157 complete original historical Arabic/English dictionary articles, all authorial
English paragraph starts, links and original named destinations, against actual
browser-generated PDF.  Do not treat source-html counts as printed-PDF counts.
Strict original tashkeel PDF Find is deliberately NOT a publication gate.
"""
from __future__ import annotations
import collections, hashlib, json, re, subprocess, sys, unicodedata
from pathlib import Path
from bs4 import BeautifulSoup
import fitz

pdf,html,src,out=map(Path,sys.argv[1:5])
info=json.loads(src.read_text('utf8'))
assert info['edition']=='scholarly' and info['total_original_notes']==625
assert info['historical_dictionary_articles']==157 and info['historical_dictionary_terms']==153
soup=BeautifulSoup(html.read_text('utf8'),'html.parser')
notes=soup.select('main.main-text .apparatus-note[data-note-id]')
articles=soup.select('.lexicon .lex-article[data-article-id]')
terms=soup.select('.lexicon .lex-term[data-original-term-id]')
source_paragraphs=soup.select('main.main-text .source-segment[data-language="en"]')
assert len(notes)==625,('Canonical main note count',len(notes))
assert len(articles)==157,('Canonical complete article count',len(articles))
assert len(terms)==153,('Canonical glossary dossier count',len(terms))
assert len(source_paragraphs)==416,('Canonical main English paragraph count',len(source_paragraphs))
original_note_ids=[n['data-note-id'] for n in notes]
assert len(set(original_note_ids))==625

# PDF is generated in user's normal browser from source HTML; compare AGAINST
# original publisher's HTML, not its generator-side JS counts or a prebuilt PDF.
txt=subprocess.run(['pdftotext','-layout',str(pdf),'-'],
                   text=True,capture_output=True,check=True,timeout=200).stdout
def english(value):
    s=unicodedata.normalize('NFKD',str(value)).lower()
    return ''.join(ch for ch in s if ch.isascii() and ch.isalnum())
def arabic(value):
    s=unicodedata.normalize('NFKD',str(value))
    return ''.join(ch for ch in s if '\u0621'<=ch<='\u064a' or ch.isdigit())
pdf_en=english(txt);pdf_ar=arabic(txt)

def clip_chunks(text,mode='en'):
    folded=english(text) if mode=='en' else arabic(text)
    # Small moving spans at original beginning/end distinguish missing text.
    # More than 26 letters is less prone to accidental cross-reference overlap.
    k=38 if mode=='en' else 26
    if len(folded)<k: return [folded] if len(folded)>=8 else []
    middle=max(0,len(folded)//2-k//2)
    return [folded[:k],folded[middle:middle+k],folded[-k:]]
def probe(text,which):
    candidates=clip_chunks(text,which)
    if not candidates:return {'eligible':False,'prefix':None,'mid':None,'suffix':None,'all':None}
    pdf_text=pdf_en if which=='en' else pdf_ar
    checks=[piece in pdf_text for piece in candidates]
    if len(checks)==1:checks=checks*3
    return {'eligible':True,'prefix':checks[0],'mid':checks[1],'suffix':checks[2],
            'all':all(checks),'some':any(checks),
            'fragment':candidates[0][:48]}

note_stats=[]
for item in notes:
    body=item.select_one('.note-prose')
    assert body is not None
    text=body.get_text(' ',strip=True)
    mode='en' if len(english(text))>=50 else 'ar'
    evidence=probe(text,mode)
    note_stats.append({'id':item['data-note-id'],
                       'mode':mode,'original_chars':len(text),**evidence})
lexicon_stats=[]
for article in articles:
    en_paras=[p.get_text(' ',strip=True) for p in article.select('.lex-en .lex-paragraph')]
    ar_paras=[p.get_text(' ',strip=True) for p in article.select('.lex-ar .lex-paragraph')]
    assert en_paras and ar_paras,('Incomplete bilingual original dictionary',article['data-article-id'])
    # Representative first and last paragraphs of an ACTUAL full original article.
    en_first=probe(en_paras[0],'en')
    en_last=probe(en_paras[-1],'en')
    ar_first=probe(ar_paras[0],'ar')
    ar_last=probe(ar_paras[-1],'ar')
    lexicon_stats.append({
       'id':article['data-article-id'],'en_paragraph_count':len(en_paras),
       'ar_paragraph_count':len(ar_paras),
       'original_english_chars':sum(len(t) for t in en_paras),
       'original_arabic_chars':sum(len(t) for t in ar_paras),
       'english_first_paragraph':en_first,
       'english_last_paragraph':en_last,
       'arabic_first_paragraph':ar_first,
       'arabic_last_paragraph':ar_last})
term_stats=[]
for item in terms:
    definition=item.select_one('[data-term-definition]')
    assert definition is not None
    term_stats.append({'id':item['data-original-term-id'],
      'definition':probe(definition.get_text(' ',strip=True),'en')})
source_stats=[]
for item in source_paragraphs:
    text=item.get_text(' ',strip=True)
    source_stats.append({'section':item.get('data-section-id','?'),
      'segment':item.get('data-segment-index','?'),
      'en':probe(text,'en')})

def aggregate(rows,key=None):
    fields=rows if key is None else [r[key] for r in rows]
    eligible=[x for x in fields if x['eligible']]
    return {'total':len(fields),'eligible':len(eligible),
      'any_part':sum(bool(x['some']) for x in eligible),
      'first_part':sum(bool(x['prefix']) for x in eligible),
      'all_three_parts':sum(bool(x['all']) for x in eligible)}
note_count=aggregate(note_stats)
dictionary={
 'English_first':aggregate(lexicon_stats,'english_first_paragraph'),
 'English_last':aggregate(lexicon_stats,'english_last_paragraph'),
 'Arabic_first':aggregate(lexicon_stats,'arabic_first_paragraph'),
 'Arabic_last':aggregate(lexicon_stats,'arabic_last_paragraph')
}
terms_summary=aggregate(term_stats,'definition')
sources_summary=aggregate(source_stats,'en')
with fitz.open(pdf) as book:
    names=book.resolve_names()
    links=[l for p in book for l in p.get_links()]
    broken_links=[x for x in links if x['kind']==fitz.LINK_GOTO and
                  (not isinstance(x.get('page'),int) or not 0<=x['page']<len(book))]
    sections=sum(f'section-{i}' in names for i in range(1,259))
    layout={
      'pages':len(book),'size_bytes':pdf.stat().st_size,
      'pdf_sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),
      'named_original_section_destinations':sections,
      'all_named_destinations':len(names),
      'links':len(links),'outlines':len(book.get_toc()),
      'broken_go_to_links':len(broken_links),
      'arabic_extracted_characters':sum('\u0600'<=c<='\u08ff' for c in txt),
      'english_extracted_characters':sum(c.isascii() and c.isalpha() for c in txt)
    }
report={
 'schema':'gnamma-scholarly-original-source-to-browser-PDF-content-fidelity-v1',
 'source_original_sha256':info['source_sha256'],
 'original_publisher_HTML_sha256':info['html_sha256'],
 'audit_source':'Original canonical publisher HTML, compared to actual generated PDF via Poppler PDF text extraction',
 'notes_all_source_bodies':note_count,
 'dictionary_original_articles_count':len(lexicon_stats),
 'dictionary_paragraph_probes':dictionary,
 'glossary_original_term_dossiers':terms_summary,
 'original_english_paragraphs':sources_summary,
 'pdf':layout,
 'missing_or_fragmented_original_note_probes':[v for v in note_stats if v.get('eligible') and not v.get('all')][:30],
 'missing_or_fragmented_glossary_probes':[v for v in term_stats if v['definition']['eligible'] and not v['definition']['all']][:20],
 'missing_or_fragmented_dictionary_ends':[{
    'id':v['id'],'english_end':v['english_last_paragraph'],
    'arabic_end':v['arabic_last_paragraph']}
    for v in lexicon_stats if not v['english_last_paragraph']['all']][:30],
 'limits':[
  'Text extraction can reorder columns, glyphs and diacritics; an unmatched chunk is diagnostic, not proven content omission.',
  'Chunk match is not sufficient to guarantee correct rendered geometry, call-to-body link semantics or complete PDF accessibility.',
  'Sophisticated fully vowelled PDF native Find is deliberately not required.'
 ],
 'browser-only_output_confirmed_by_separate_playwright_QA':True,
 'production_approved':False
}
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n','utf8')
print('DARURI_SCHOLARLY_INDEPENDENT_CONTENT_FIDELITY',json.dumps({
 'pdf':layout,'notes':note_count,'dictionary':dictionary,'terms':terms_summary,
 'english_paragraphs':sources_summary,'publication_approved':False},ensure_ascii=False))
if layout['named_original_section_destinations']!=258 or layout['broken_go_to_links']:
 raise AssertionError('Document source anchors or navigation missing')
