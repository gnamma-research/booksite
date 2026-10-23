#!/usr/bin/env python3
"""Full 414-original-passages native word/phrase reader audit for Typst WASM.
Only compare unvowelled originals from authoritative current Daruri book.
This is an acceptance test for the plain language source, NOT for Study notes.
"""
import json,sys,subprocess,hashlib,re,time
from pathlib import Path
import fitz,pypdfium2 as pdfium

def main():
 pdf_path=Path(sys.argv[1]);fixture=json.loads(Path(sys.argv[2]).read_text('utf8'))
 output=Path(sys.argv[3]);rows=fixture['all_source']
 if len(rows)!=414:raise ValueError('Canonical source must have exactly 414 original paragraphs')
 doc=fitz.open(pdf_path);pfd=pdfium.PdfDocument(str(pdf_path))
 mu=[page.get_text(sort=False) for page in doc]
 pdfium_pages=[p.get_textpage() for p in pfd]
 ptex=[p.get_text_range() for p in pdfium_pages]
 pop=subprocess.run(['pdftotext','-layout',str(pdf_path),'-'],capture_output=True,text=True,timeout=90)
 poppages=pop.stdout.split('\f')
 metrics={'total':414,'mupdf_first_two_words_exact':0,
  'mupdf_first_word_width':0,'pdfium_first_two_words_exact':0,
  'poppler_layout_first_two_words_exact':0,
  'correct_source_heading_present':0}
 misses=[]
 start=time.perf_counter()
 for row in rows:
  id=row['id'];text=row['arabic_unvowelled']
  w=text.split();q=' '.join(w[:2])
  # Find the original section marker. Looking at arbitrary occurrences
  # elsewhere can produce a false positive for a repeated expression.
  candidates=[n for n,s in enumerate(mu) if ('Original '+id) in s]
  if not candidates:
   candidates=[n for n,s in enumerate(ptex) if ('Original '+id) in s]
  if candidates:metrics['correct_source_heading_present']+=1
  local=list(dict.fromkeys([k for n in candidates for k in (n,n+1) if k<len(doc)]))
  if not local:local=list(range(len(doc)))
  muHits=[x for n in local for x in doc[n].search_for(q)]
  if muHits:metrics['mupdf_first_two_words_exact']+=1
  fm=[x for n in local for x in doc[n].search_for(w[0])]
  if any(0.5<x.width<190 and x.height>4 for x in fm):
   metrics['mupdf_first_word_width']+=1
  pdfhits=False
  for n in local:
   try:
    if pdfium_pages[n].search(q).get_next() is not None:pdfhits=True;break
   except Exception:pass
  if pdfhits:metrics['pdfium_first_two_words_exact']+=1
  pophits=any(q in poppages[n] for n in local if n<len(poppages))
  if pophits:metrics['poppler_layout_first_two_words_exact']+=1
  if not (muHits and pdfhits and pophits and fm):
   misses.append({'id':id,'first_two_words':q,'local_pages':[n+1 for n in local[:5]],
       'mu_hits':len(muHits),'pdfium_hit':pdfhits,'poppler_layout_hit':pophits,
       'word_rectangles':[[round(z.width,2),round(z.height,2)] for z in fm[:2]]})
 report={'pdf':str(pdf_path),'source_sha256':fixture['source_sha256'],
   'pdf_sha256':hashlib.sha256(pdf_path.read_bytes()).hexdigest(),
   'pages':len(doc),'bytes':pdf_path.stat().st_size,
   'native_engines':['MuPDF','PDFium','Poppler'],
   'metrics':metrics,'misses':misses[:60],'misses_total':len(misses),
   'pdf_bookmarks':len(doc.get_toc()),'pdf_links':sum(len(p.get_links()) for p in doc),
   'seconds':round(time.perf_counter()-start,2),
   'arabic_vowelled_source_proven':False,
   'original_apparatus_proven':False,'published_layout_parity_proven':False,
   'physical_mobile_proven':False,'publication_approved':False}
 output.parent.mkdir(parents=True,exist_ok=True)
 output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n','utf8')
 print('DARURI_TYPST_FULL_NATIVE_AUDIT',json.dumps({
  'font_variant':pdf_path.name,'pages':len(doc),'metrics':metrics,
  'misses':len(misses),'bookmarks':report['pdf_bookmarks'],
  'links':report['pdf_links'],'seconds':report['seconds'],
  'publication_approved':False},ensure_ascii=False),flush=True)
 if metrics['mupdf_first_two_words_exact']!=414 or metrics['pdfium_first_two_words_exact']!=414:
  raise AssertionError('Cannot certify all 414 original Arabic first-two-word native searches')
if __name__=='__main__':main()
