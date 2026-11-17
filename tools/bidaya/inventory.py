from pathlib import Path
import sys
import hashlib,json
from lxml import html

ROOT=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parents[2]
OUT=ROOT/'research/gnamma-integration-2026-10-27'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
manifest=json.loads((ROOT/'output/handoff-2026-10-26/FILE-MANIFEST.json').read_text())
sealed={x['path'].removeprefix('project/'):x for x in manifest['files']}
paths=set()
for pattern in ['output/representative-*.md','output/commentary-*.md','research/scripts/reader-*','research/rushd-*.json','sites/usul-law-rushd/dist/**/*']:
 paths.update(p for p in ROOT.glob(pattern) if p.is_file())
for f in ['research/pilot-scope.json','output/critical-review-and-completion.md','output/foundations-and-methodology.md','output/pilot-framework-and-commentary.md','output/master-framework-and-commentary.md','output/master-reader.html','output/case-record-template.json','output/bidaya-primary-census.json','research/continuation-notes.md','research/source-map.json','research/scripture-contexts.json','output/principles.json','output/qawaid-catalogue.json','output/alchemical-operations-register.json']:
 paths.add(ROOT/f)
rows=[]
for p in sorted(paths):
 key=p.relative_to(ROOT).as_posix();digest=sha(p);old=sealed.get(key)
 rows.append({'path':key,'bytes':p.stat().st_size,'sha256':digest,'sealed_handoff_match':digest==old['sha256'] if old else None})
old=ROOT/'sites/gnamma-booksite'
prior=[]
for d in ['texts/ibn-rushd/bidayat-al-mujtahid','research/usul-law-rushd']:
 for p in sorted((old/d).rglob('*')):
  if p.is_file():prior.append({'path':p.relative_to(old).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)})
result={'date':'2026-10-27','canonical_files':rows,'existing_gnamma_files':prior,'sealed_match_count':sum(x['sealed_handoff_match'] is True for x in rows),'sealed_mismatches':[x['path'] for x in rows if x['sealed_handoff_match'] is False],'source_policy':'Read-only recovery. No source PDF, synced file or original hosted Site modified.'}
(OUT/'source-inventory.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print({'canonical_files':len(rows),'gnamma_files':len(prior),'sealed_mismatches':result['sealed_mismatches']})
