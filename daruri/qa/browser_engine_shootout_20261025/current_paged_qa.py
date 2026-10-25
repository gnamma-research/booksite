#!/usr/bin/env python3
"""Source-preserving complete Scholarly Paged.js/browser Print PDF audit.

Does NOT imply a direct client-side PDF Blob. Intentionally checks Arabic
text extraction and dictionary/notes against the CURRENT canonical source,
rather than prior published PDF bytes or older source revisions.
"""
from pathlib import Path
from bs4 import BeautifulSoup
import fitz,hashlib,json,re,subprocess,sys,unicodedata
def alpha(x):
    return ''.join(c.lower() for c in unicodedata.normalize('NFKD',x) if c.isascii() and c.isalnum())
def arabic(x):
    return ''.join(c for c in unicodedata.normalize('NFKC',x)
                   if 0x621<=ord(c)<=0x64a and unicodedata.category(c).startswith('L'))
def run(html,pdf,out):
    html,pdf,out=map(Path,(html,pdf,out))
    soup=BeautifulSoup(html.read_text('utf8'),'html.parser')
    expected_ar=soup.select_one('.cover .arabic-title').get_text(' ',strip=True)
    cmd=subprocess.run(['pdftotext','-layout',str(pdf),'-'],capture_output=True,text=True,
                       encoding='utf8',errors='replace',timeout=180)
    if cmd.returncode:raise RuntimeError('Poppler failed to read browser Print PDF')
    norm=alpha(cmd.stdout)
    group={}
    for name,selector,width in [
       ('english_source_passages','p.source-segment.english',28),
       ('scholarly_notes','.apparatus-note',25),
       ('historical_dictionary_english','p.lex-paragraph[data-language="en"]',25),
       ('full_dossier_glossary','.lex-term',25)]:
        elements=soup.select(selector)
        eligible=0;matched=0;whole=0;missing=[]
        for i,el in enumerate(elements):
            node=el.select_one('.note-prose') if name=='scholarly_notes' else (
                 el.select_one('[data-term-definition]') if name=='full_dossier_glossary' else el)
            words=alpha(node.get_text(' ',strip=True)) if node else ''
            if len(words)<width:continue
            eligible+=1
            okay=words[:width] in norm or words[-width:] in norm
            matched+=int(okay);whole+=int(words in norm)
            if not okay:missing.append({'ordinal':i,'id':el.get('id','')})
        group[name]={'source_objects':len(elements),'eligible':eligible,
                     'snippet_pass':matched,'whole_normalized_pass':whole,
                     'missing':missing[:20]}
    with fitz.open(pdf) as d:
        kinds={}
        all_links=[]
        for page in d:
            all_links.extend(page.get_links())
        for link in all_links:
            k=str(link['kind']);kinds[k]=kinds.get(k,0)+1
        page_ct=len(d)
        pdf_text=d[0].get_text()
        names=len(d.resolve_names())
        outlines=len(d.get_toc())
    # Left-to-right PDF extraction can reorder RTL sentences; compare count
    # and sorted multiset of base letters for the COVER title, not vowelled Find.
    title_letters=arabic(expected_ar)
    output_letters=arabic(pdf_text)
    result={
      'schema':'gnamma-current-scholarly-pagedjs-current-source-v1',
      'page_count':page_ct,'bytes':pdf.stat().st_size,
      'sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),
      'source_html_sha256':hashlib.sha256(html.read_bytes()).hexdigest(),
      'pages_for_body':page_ct,'total_outline_bookmarks':outlines,
      'internal_named_destinations':names,
      'link_objects':len(all_links),'link_kinds':kinds,
      'arabic_cover_expected_base_letters':len(title_letters),
      'arabic_cover_extracted_base_letters':len(output_letters),
      'arabic_cover_multiset_equivalent':
          sorted(title_letters)==sorted(output_letters),
      'source_fidelity':group,
      'pdf_origin':'Chromium CI browser PRINT/Save output; NOT direct Blob',
      'is_client_side_pagination':True,
      'is_client_side_one_click_pdf_blob':False,
      'real_ios_android_hardware_tested':False,
      'release_approved':False}
    out.parent.mkdir(exist_ok=True,parents=True)
    out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n','utf8')
    print('GNAMMA_PAGED_CURRENT_SCHOLARLY_AUDIT',json.dumps(
      result,ensure_ascii=False)[:6500],flush=True)
    assert group['english_source_passages']['source_objects']==416
    assert group['scholarly_notes']['source_objects']==625
    assert group['full_dossier_glossary']['source_objects']==153
    assert group['historical_dictionary_english']['source_objects']==283
    assert 180<=page_ct<=350 and len(all_links)>3000
if __name__=='__main__':
    if len(sys.argv)!=4:raise SystemExit('Usage: paged_qa.py source.html browser.pdf output.json')
    run(*sys.argv[1:])
