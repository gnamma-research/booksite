from pathlib import Path
import sys
from lxml import html
from collections import Counter
from urllib.parse import urlsplit,unquote
import hashlib,json,re,subprocess
ROOT=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parents[2]; REPO=Path(sys.argv[2]).resolve() if len(sys.argv)>2 else ROOT/'sites/gnamma-booksite'; D=REPO/'research/bidaya'; A=ROOT/'research/gnamma-integration-2026-10-27'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
plain=lambda n:' '.join(n.text_content().split())
cache={};idcache={};broken=[];dups=[];total=0
def document(p):
 p=p.resolve()
 if p not in cache:cache[p]=html.fromstring(p.read_text())
 return cache[p]
def link(page,u,attribute='href'):
 global total
 s=urlsplit(u)
 if s.scheme or s.netloc or not u:return
 target=(page.parent/unquote(s.path)).resolve() if s.path else page.resolve()
 if target.is_dir():target=target/'index.html'
 total+=1
 if not target.exists():broken.append({'page':str(page.relative_to(REPO)),'url':u,'problem':'file'});return
 if s.fragment and target.suffix=='.html' and not s.fragment.startswith(('page=','dictionary','sources','reader','cases')):
  ident=unquote(s.fragment)
  if target not in idcache:idcache[target]=set(document(target).xpath('//@id'))
  if ident not in idcache[target]:broken.append({'page':str(page.relative_to(REPO)),'url':u,'problem':'anchor'})
for p in D.rglob('*.html'):
 doc=document(p);ids=doc.xpath('//@id');dups.extend({'page':str(p.relative_to(REPO)),'id':i,'count':n} for i,n in Counter(ids).items() if n>1)
 for el in doc.xpath('//*[@href or @src]'):
  for attr in ['href','src']:
   if el.get(attr):link(p,el.get(attr),attr)
for scope in ['pilot','reservoir']:
 p=D/'shared'/('data-'+scope+'.js');data={}
 for l in p.read_text().splitlines():
  if not l.startswith('document.getElementById('):continue
  ident=json.loads(l.split('(')[1].split(')')[0]);data[ident]=json.loads(json.loads(l.split('.textContent=',1)[1][:-1]))
 for edition in ['law','human-life']:
  base=D/edition/('index.html' if scope=='pilot' else 'reservoir.html')
  def walk(o,key=''):
   if isinstance(o,dict):
    for k,v in o.items():walk(v,k)
   elif isinstance(o,list):
    for v in o:walk(v,key)
   elif isinstance(o,str) and key in ['url','source_url','source_pages_url','page_image']:link(base,o)
  walk(data)
  doc=document(base)
  for attr,key in [('data-primary-text','rushd-data'),('data-source-note','scripture-data'),('data-principle','principle-data')]:
   record_ids={x['id'] for x in data[key]}
   for el in doc.xpath('//*[@'+attr+']'):
    assert el.get(attr) in record_ids,(base,attr,el.get(attr))
 # Source text, translation and locators are identical because there is one shared record set.
 assert len(data['rushd-data'])==17
 assert sum(len(n['passages']) for n in data['rushd-data'])==29
 law=document(D/'law'/('index.html' if scope=='pilot' else 'reservoir.html'))
 life=document(D/'human-life'/('index.html' if scope=='pilot' else 'reservoir.html'))
 for attr in ['data-reading-core']:
  left=[plain(n) for n in law.xpath('//*[@'+attr+']')];right=[plain(n) for n in life.xpath('//*[@'+attr+']')]
  assert left==right,(scope,'legal core divergence',len(left),len(right))
 assert not law.xpath('//*[@data-reading-layer="symbols" or @data-reading-layer="alchemy" or @data-reading-layer="formation" or @data-reading-layer="social"]')
 if scope=='pilot':assert len(law.xpath('//*[@data-reading-core]'))==8
 # The extended edition retains every original article word, apart from added source catalogue text.
 original=document(ROOT/('sites/usul-law-rushd/dist/index.html' if scope=='pilot' else 'output/master-reader.html'))
 orig=original.get_element_by_id('manuscript');new=life.get_element_by_id('manuscript')
 if scope=='reservoir':new=html.fromstring(html.tostring(new));new.remove(new.get_element_by_id('review-source-locators'))
 assert plain(orig)==plain(new),(scope,'extended article text changed')
 assert set(orig.xpath('.//@id'))<=set(life.get_element_by_id('manuscript').xpath('.//@id')),(scope,'lost IDs')
images=list((D/'shared/source-workspace-pages').glob('*.webp'))
assert len(images)==81
assert all(sha(p)==sha(ROOT/'sites/usul-law-rushd/dist/source-workspace-pages'/p.name) for p in images)
for p in D.rglob('*'):
 if p.is_file() and p.suffix in ['.html','.js','.json']:
  s=p.read_text()
  assert '/Users/' not in s and 'file://' not in s,(p,'private local path')
assert not list(D.rglob('*.pdf'))
preserved=json.loads((A/'source-inventory.json').read_text())
assert all(sha(ROOT/x['path'])==x['sha256'] for x in preserved['canonical_files'])
for x in preserved['existing_gnamma_files']:
 if 'casebook/' in x['path'] or 'alternative-usul/' in x['path'] or 'qawanin/' in x['path']:
  assert sha(REPO/x['path'])==x['sha256'],('changed independent research',x['path'])
result={'status':'pass' if not broken and not dups else 'needs repair','local_links_checked':total,'broken_links':broken,'duplicate_ids':dups,'source_image_hashes':81,'shared_primary_records':17,'bilingual_selections':29,'original_manuscripts_unchanged':True,'extended_reader_text_preserved':True,'legal_core_identical':True,'independent_casebook_and_qawanin_unchanged':True}
(A/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False)[:11000])
