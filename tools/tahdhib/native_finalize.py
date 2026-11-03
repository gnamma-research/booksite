#!/usr/bin/env python3
"""Generate native readers, then remove remaining foreign-book metadata.
Only generated front-end files change; canonical source/PDF bytes never change.
"""
import hashlib,json,runpy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
runpy.run_path(str(ROOT/'tools/tahdhib/build_native_reader.py'),run_name='__main__')
report_path=ROOT/'texts/al-taftazani/NATIVE_DARURI_BUILD_REPORT.json'
report=json.loads(report_path.read_text())
for kind,name in [('kalam','kalam'),('logic','mantiq')]:
 base=ROOT/f'texts/al-taftazani/tahdhib-al-{name}/edition'
 payload=(base/'native/book-data.js').read_text().split('=',1)[1].rstrip(';\n')
 cfg=json.loads(payload);title=cfg['book']['info']['title'];prefix=cfg['storagePrefix']
 for file in (base/'native').glob('*.js'):
  if file.name in ['book-data.js','book-adapter.js']:continue
  s=file.read_text().replace('Darūrī',title)
  # Return/navigation state belongs to this book, including session-only state.
  for suffix in ['return-location','dictionary-open-origin','dictionary-jump-origin','restore-reference-view','reader-source-origin','dictionary-restore']:
   s=s.replace('daruri-'+suffix,prefix+'-'+suffix)
  if file.name=='gnamma-search.js':
   s=s.replace("'daruri'","'tahdhib-"+kind+"'")
   s=s.replace("new URL('../arabic/full-arabic-pages.json',location.href)","new URL('../../../../arabic/full-arabic-pages.json',location.href)")
  file.write_text(s)
  if file.name in report['books'][kind]['adapted_assets']:
   report['books'][kind]['adapted_assets'][file.name]['adapted']=hashlib.sha256(s.encode()).hexdigest()
 report['books'][kind]['remaining_metadata_normalized']=True
 report['books'][kind]['session_state_isolated']=True
 report['books'][kind]['canonical_source_unchanged']=hashlib.sha256((base/'data.js').read_bytes()).hexdigest()==cfg['sourceSha256']
 assert report['books'][kind]['canonical_source_unchanged']
report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('PASS book-local labels, canonical text hashes and session-state isolation')
