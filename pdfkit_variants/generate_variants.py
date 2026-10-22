#!/usr/bin/env python3
"""Render native-PDFKit compatibility candidates without touching release files."""
import os,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=root/"daruri/personal-pdf-enhancements.js"
original=source.read_text()
out=root/"pdfkit_variants/output"
out.mkdir(exist_ok=True)
assert "PDFOperator.of('Tr',[PDFNumber.of(3)])" in original
assert "const runs=fontRuns(s.replace(ARABIC_SEARCH_SPANS,' '),fonts,size);" in original
patterns={
 "baseline":lambda x:x,
 "type3_tr0":lambda x:x.replace("PDFOperator.of('Tr',[PDFNumber.of(3)])","PDFOperator.of('Tr',[PDFNumber.of(0)])"),
 "type3_tr0_forward":lambda x:x.replace("PDFOperator.of('Tr',[PDFNumber.of(3)])","PDFOperator.of('Tr',[PDFNumber.of(0)])").replace("Array.from(raw).reverse().map(ch=>","Array.from(raw).map(ch=>"),
 "type3_tr3_forward":lambda x:x.replace("Array.from(raw).reverse().map(ch=>","Array.from(raw).map(ch=>"),
 "hybrid_fontkit_tr3":lambda x:x.replace("const runs=fontRuns(s.replace(ARABIC_SEARCH_SPANS,' '),fonts,size);","const runs=fontRuns(s,fonts,size);"),
 "hybrid_fontkit_tr0":lambda x:x.replace("const runs=fontRuns(s.replace(ARABIC_SEARCH_SPANS,' '),fonts,size);","const runs=fontRuns(s,fonts,size);").replace("PDFOperator.of('Tr',[PDFNumber.of(3)])","PDFOperator.of('Tr',[PDFNumber.of(0)])"),
 "type3_tr0_1pt":lambda x:x.replace("PDFOperator.of('Tr',[PDFNumber.of(3)])","PDFOperator.of('Tr',[PDFNumber.of(0)])").replace("Width:[0,0,1000,1000]","Width:[0,0,1000,1000]"),
}
results=[]
try:
 for variant,transform in patterns.items():
  changed=transform(original);source.write_text(changed)
  filename=out/(variant+".pdf")
  environ={**os.environ,"OUTPUT_PDF":str(filename)}
  p=subprocess.run(['node','pdfkit_variants/generate.cjs'],cwd=root,env=environ,capture_output=True,text=True,timeout=240)
  print(variant,p.returncode,p.stdout[-380:],p.stderr[-440:],flush=True)
  results.append((variant,p.returncode))
finally:
 source.write_text(original)
assert all(r[1]==0 for r in results),results
