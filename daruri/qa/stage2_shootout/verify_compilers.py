#!/usr/bin/env python3
"""Native reader acceptance test, not a green-byte-generation shortcut.
Test real Arabic source in MuPDF, PDFium and Poppler; keep failed probes.
"""
from __future__ import annotations
import json,subprocess,sys,unicodedata,re,hashlib
from pathlib import Path
import fitz,pypdfium2 as pdfium

def normalize(s):
 return ''.join(c for c in unicodedata.normalize('NFKD',s)
                if unicodedata.category(c)[0] in 'LN').casefold()
def main():
 pdf_path=Path(sys.argv[1]);fixture=json.loads(Path(sys.argv[2]).read_text('utf8'))
 output=Path(sys.argv[3]);data=pdf_path.read_bytes()
 if not data.startswith(b'%PDF-'):raise RuntimeError("No genuine PDF")
 mup=fitz.open(pdf_path);pdf=pdfium.PdfDocument(str(pdf_path))
 mu_text=[p.get_text(sort=False) for p in mup]
 pdfium_pages=[p.get_textpage() for p in pdf]
 raw=subprocess.run(['pdftotext','-raw',str(pdf_path),'-'],
         capture_output=True,text=True,timeout=20)
 layout=subprocess.run(['pdftotext','-layout',str(pdf_path),'-'],
         capture_output=True,text=True,timeout=20)
 report={'file':str(pdf_path),'source_sha256':fixture['source_sha256'],
  'sha256':hashlib.sha256(data).hexdigest(),'size':len(data),
  'pages':len(mup),'mupdf_links':sum(len(p.get_links()) for p in mup),
  'outline_items':len(mup.get_toc()),'poppler_errors':raw.stderr[-1500:],
  'checks':[]}
 for row in fixture['sample']:
  words=row['arabic'].split();query=' '.join(words[:2])
  middle=words[len(words)//2]
  mup_hit=[x for p in mup for x in p.search_for(query)]
  mid_hits=[x for p in mup for x in p.search_for(middle)]
  pf_search=[]
  for p in pdfium_pages:
   try:pf_search.append(p.search(query).get_next())
   except Exception as e:pf_search.append({'error':str(e)[:80]})
  check={'id':row['id'],'query':query,
   'mupdf_exact_two_word':bool(mup_hit),
   'mupdf_two_word_rects':[[round(r.x0,2),round(r.y0,2),round(r.width,2),round(r.height,2)] for r in mup_hit[:3]],
   'mupdf_normalized_two_word':any(normalize(query) in normalize(t) for t in mu_text),
   'mupdf_native_word_rect':any(x.width>1 and x.height>3 for x in mid_hits),
   'pdfium_exact_two_word':any(x is not None and not isinstance(x,dict) for x in pf_search),
   'poppler_raw_exact':query in raw.stdout,
   'poppler_raw_normalized':normalize(query) in normalize(raw.stdout),
   'poppler_layout_exact':query in layout.stdout}
  report['checks'].append(check)
 report['score']={k:sum(bool(c[k]) for c in report['checks'])
                  for k in ['mupdf_exact_two_word','mupdf_normalized_two_word',
                            'mupdf_native_word_rect','pdfium_exact_two_word',
                            'poppler_raw_exact','poppler_raw_normalized',
                            'poppler_layout_exact']}
 report['source_paragraphs_tested']=len(report['checks'])
 report['release_approved']=all(v==len(report['checks']) for v in report['score'].values()) and report['mupdf_links']>=1
 output.parent.mkdir(parents=True,exist_ok=True)
 output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n','utf8')
 print('DARURI_STAGE2_NATIVE_SCORE',json.dumps({
  'file':pdf_path.name,'pages':report['pages'],'score':report['score'],
  'links':report['mupdf_links'],'outlines':report['outline_items'],
  'release_approved':report['release_approved']},ensure_ascii=False))
if __name__=='__main__':main()
