#!/usr/bin/env python3
"""Compare a browser-generated Scholarly PDF to the current approved master PDF.

This is an exact-edition audit, NOT a vowel-sensitive native PDF search test.
It intentionally records FAIL when actual published PDF parity is not proven.
"""
import hashlib, json, re, subprocess, sys, unicodedata
from collections import Counter
from pathlib import Path
import fitz


def digest(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for part in iter(lambda:f.read(1024*1024),b''): h.update(part)
    return h.hexdigest()


def source(path):
    s=Path(path).read_text('utf8')
    return json.loads(json.loads(s.split('textContent=',1)[1].strip().rstrip(';')))


def fold(text):
    return ''.join(c.lower() for c in unicodedata.normalize('NFKD',str(text))
                   if c.isascii() and c.isalnum())


def text_of_pdf(path):
    p=subprocess.run(['pdftotext','-layout',str(path),'-'],
                     capture_output=True,text=True,errors='replace',timeout=180)
    if p.returncode: raise RuntimeError('Poppler text extraction failed '+p.stderr[-250:])
    return fold(p.stdout)


def structure(path):
    with fitz.open(path) as doc:
        toc=doc.get_toc(simple=False)
        kinds=Counter();target_pages=[];named_sections=[]
        per_page=[]
        for i,page in enumerate(doc):
            links=page.get_links()
            per_page.append(len(links))
            for l in links:
                kinds[l['kind']]+=1
                if l['kind'] in (fitz.LINK_GOTO,fitz.LINK_NAMED):
                    target_pages.append(l.get('page'))
        for e in toc:
            m=re.match(r'^\s*§\s*(\d+)',e[1])
            if m and 1<=int(m[1])<=258:
                named_sections.append({'number':int(m[1]),'page':e[2]})
        return {
          'page_count':len(doc),'pages_are_A4':all(
            abs(p.rect.width-595.276)<2 and abs(p.rect.height-841.89)<2
            for p in doc),
          'outline_entries':len(toc),
          'named_original_section_outlines':len(named_sections),
          'link_objects':sum(kinds.values()),
          'link_kinds':{
            'internal_direct_GoTo':kinds[fitz.LINK_GOTO],
            'internal_named_destination':kinds[fitz.LINK_NAMED],
            'external_URI':kinds[fitz.LINK_URI]},
          'out_of_range_link_pages':sum(
             not isinstance(p,int) or not (0<=p<len(doc))
             for p in target_pages),
          'page_link_count_first_10':per_page[:10],
          'font_sample':sorted({
              f[3] for p in list(doc)[:min(15,len(doc))]
              for f in p.get_fonts() if len(f)>3})[:30],
          'outline_headings_first_8':[e[1] for e in toc[:8]],
          'section_sample':named_sections[:3]+named_sections[-3:]}


def compare(approved,pdf,master_js,research_js,output):
    old=source(master_js);new=source(research_js)
    expected_eng=[segment['en'] for section in old['sections']
                  for segment in section['segments']]
    approved_text=text_of_pdf(approved);browser_text=text_of_pdf(pdf)
    def probe(corpus,original):
        eligible=0;present=0;missing=[]
        for i,s in enumerate(original):
            val=fold(s)
            if len(val)<30:continue
            eligible+=1
            # Probe both ends only: presence != complete exact-text proof.
            found=(val[:30] in corpus or val[-30:] in corpus)
            present+=int(found)
            if not found:missing.append(i)
        return {'eligible':eligible,'present':present,'unmatched_indexes':missing[:18]}
    a=structure(approved);b=structure(pdf)
    hashes={'approved_pdf':digest(approved),'browser_pdf':digest(pdf),
            'master_authorial_source':digest(master_js),
            'browser_authorial_source':digest(research_js)}
    gates={
      'byte_identical':hashes['approved_pdf']==hashes['browser_pdf'],
      'canonical_authorial_source_identical':
        hashes['master_authorial_source']==hashes['browser_authorial_source'],
      'same_page_count':a['page_count']==b['page_count'],
      'same_outline_count':a['outline_entries']==b['outline_entries'],
      'same_link_count':a['link_objects']==b['link_objects'],
      'same_internal_link_semantics':a['link_kinds']==b['link_kinds'],
      'same_page_size_A4':a['pages_are_A4'] and b['pages_are_A4'],
      'same_original_section_count':
        a['named_original_section_outlines']==b['named_original_section_outlines']==258
    }
    # Only equal-geometry pages can conceivably be pixel-identical. A separate
    # font/renderer comparison is required even when all counts match.
    exact_binary_and_structure=all(gates[k] for k in [
      'byte_identical','canonical_authorial_source_identical',
      'same_page_count','same_outline_count','same_link_count',
      'same_internal_link_semantics','same_page_size_A4'])
    report={
      'schema':'gnamma-published-scholarly-exact-parity-v1',
      'research_only':True,'never_replaces_approved_pdf':True,
      'tashkil_sensitive_search_not_required':True,
      'hashes':hashes,
      'approved':a,'browser_candidate':b,
      'english_passage_probe_against_latest_source':{
        'published':probe(approved_text,expected_eng),
        'browser':probe(browser_text,expected_eng)},
      'gates':gates,'exact_approved_pdf_copy':exact_binary_and_structure,
      'explanation':('PASS: byte-for-byte approved edition' if exact_binary_and_structure
        else 'FAIL: candidate must not be described as an exact approved Scholarly copy. '
             'Different layout engines, differing page/link/outline structure, '
             'or differing canonical source require a separate approved parity mode.'),
      'remaining_tests':'Whole-book Arabic orthography, full 625-note character '
                        'collation, visual page-by-page geometry, accessibility '
                        'and physical iOS/Android hardware are separate gates.'
    }
    Path(output).parent.mkdir(parents=True,exist_ok=True)
    Path(output).write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
    print('GNAMMA_EXACT_PUBLISHED_SCHOLARLY_PARITY',json.dumps({
      'approved_pages':a['page_count'],'browser_pages':b['page_count'],
      'approved_bookmarks':a['outline_entries'],
      'browser_bookmarks':b['outline_entries'],
      'approved_links':a['link_objects'],'browser_links':b['link_objects'],
      'source_SHA_equal':gates['canonical_authorial_source_identical'],
      'newest_source_probes':report['english_passage_probe_against_latest_source'],
      'strict_exact_copy':exact_binary_and_structure}))
    return report

if __name__=='__main__':
    if len(sys.argv)!=6:
        raise SystemExit('Usage: compare.py approved.pdf browser.pdf master.js research.js output.json')
    compare(*sys.argv[1:])
