"""Import the existing reader; generate both editions from the same preserved corpus.
No source manuscript, scanned witness, or original Site is edited.
"""
from pathlib import Path
from lxml import html, etree
from copy import deepcopy
from collections import Counter
from html import escape
from urllib.parse import unquote
import json,re,hashlib,shutil,sys

ROOT=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parents[2]
REPO=Path(sys.argv[2]).resolve() if len(sys.argv)>2 else ROOT/'sites/gnamma-booksite'
DEST=REPO/'research/bidaya'; SHARED=DEST/'shared'
AUDIT=ROOT/'research/gnamma-integration-2026-10-27'
PILOT=['REP-02','REP-09','REP-23','REP-31','REP-43','REP-50','REP-63','REP-72']
NAMES=dict(zip(PILOT,['Ablution','Zakāt','Nursing','Salam','Interdiction','Deposit','Injury','Judgment']))
dump=lambda d:json.dumps(d,ensure_ascii=False,separators=(',',':')).replace('</script','<\\/script')
digest=lambda s:hashlib.sha256(s.encode()).hexdigest()
ser=lambda n:html.tostring(n,encoding='unicode',with_tail=False)
text=lambda n:' '.join(n.text_content().split())
def write(p,s):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
def at(n,ident):return n.get('id')==ident or bool(n.xpath('.//*[@id=$i]',i=ident))
def reps(article):
 result={};current=None
 for n in article:
  if not isinstance(n.tag,str):continue
  ids=[n.get('id','')]+n.xpath('.//@id');found=next((x for x in ids if re.fullmatch(r'REP-\d+',x or '')),None)
  if found: current=found;result[current]=[]
  elif n.tag in ['h1','hr']:current=None
  if current:result[current].append(n)
 return result
def legal(n):
 layer=n.get('data-reading-layer');also=n.get('data-reading-also','')
 return layer not in ['stakes','formation','social','symbols','alchemy'] and 'symbols' not in also
def normalized(n):
 c=deepcopy(n)
 return text(c)

for e in ['law','human-life','shared']: (DEST/e).mkdir(parents=True,exist_ok=True)
source=ROOT/'sites/usul-law-rushd/dist'
# One source-image library shared by both editions, with unchanged bytes.
shutil.copytree(source/'source-workspace-pages',SHARED/'source-workspace-pages',dirs_exist_ok=True)
catalog={}
def reference(url,label='Source locator',excerpt=''):
 url=unquote(url)
 if url.startswith(('https://','http://','mailto:','#','data:')):return url
 if url.startswith(('source-workspace-pages/','rushd-source-workspace.html','rushd-primary-texts.html')):return '../shared/'+url
 if url.startswith(('index.html','reader.html','pilot-reader.html')):return './'+url[url.find('#'):] if '#' in url else './'
 if url.startswith(('master-reader.html',)):return 'reservoir.html'+(url[url.find('#'):] if '#' in url else '')
 if url.startswith(('principle-index.html','principle-subject-index.html')):return '../shared/principle-index.html'
 if url=='principle-references.csv':return '../shared/principle-references.csv'
 ident='review-source-'+hashlib.sha256(url.encode()).hexdigest()[:12]
 entry=catalog.setdefault(ident,{'label':label,'excerpt':excerpt})
 if excerpt:entry['excerpt']=excerpt
 if entry['label']=='Source locator' and label:entry['label']=label
 return '#'+ident
def sanitize_records(records):
 records=deepcopy(records)
 for n in records:
  label=' · '.join(str(n.get(k,'')) for k in ['author','title','locator']).strip(' ·')
  excerpt=(n.get('citation_excerpt') or {}).get('text','')
  for key in ['source_url','source_pages_url']:
   if n.get(key):n[key]=reference(n[key],label,excerpt)
  for p in n.get('passages',[]):p['source_url']=reference(p['source_url'],label+' · '+p['locator'])
  for key in ['links','related_contexts','cited_verses']:
   for l in n.get(key,[]):
    if l.get('url'):l['url']=reference(l['url'],l.get('label') or l.get('title') or l.get('key','Source'),l.get('text',''))
  for c in n.get('event_contexts',[]):
   for l in c.get('sources',[]):l['url']=reference(l['url'],l['label'])
 def clean(v):
  if isinstance(v,dict):return {k:clean(x) for k,x in v.items()}
  if isinstance(v,list):return [clean(x) for x in v]
  if isinstance(v,str) and '/Users/' in v:return re.sub(r'/Users/[^\s<>"\']+/', '',v)
  if isinstance(v,str) and v.startswith(('source-workspace-pages/','rushd-source-workspace.html','rushd-primary-texts.html')):return '../shared/'+v
  return v
 return clean(records)

originals={};corpora={};legal_register={};all_legal_blocks={};parity=[]
alchemy=json.loads((ROOT/'output/alchemical-operations-register.json').read_text())['operation_dictionary']
term_ids={v['term'].casefold():k for k,v in alchemy.items()}
for scope,file in [('pilot',source/'index.html'),('reservoir',ROOT/'output/master-reader.html')]:
 raw=file.read_text();doc=html.fromstring(raw);originals[scope]=deepcopy(doc)
 # Real links become source locators; no private path or complete PDF is published.
 for a in doc.xpath('//a[@href]'):
  a.set('href',reference(a.get('href'),text(a)))
  if 'alchemy-term' in a.get('class','') and text(a).casefold() in term_ids:a.set('href','../shared/alchemical-terms.html#'+term_ids[text(a).casefold()])
 records={}
 for s in doc.xpath('//script[@type="application/json"]'):
  records[s.get('id')]=sanitize_records(json.loads(s.text));s.text=''
 script=doc.xpath('//script[not(@type)]')[0];code=script.text or '';script.getparent().remove(script)
 # Add a runtime policy for Edition I: no inward reading is introduced by a combined source popup.
 code=code.replace("['The spiritual reading',c.spiritual_commentary]","['The spiritual reading',document.body.dataset.edition==='law'?'':c.spiritual_commentary]")
 code=code.replace("const readingStorageKey='usul-review-commentary-layers-v1';","const readingStorageKey='gnamma-bidaya-'+document.body.dataset.edition+'-pilot';")
 code=code.replace("const readingStorageKey='usul-reader-commentary-layers-v1';","const readingStorageKey='gnamma-bidaya-'+document.body.dataset.edition+'-reservoir';")
 if scope=='pilot':
  code=code.replace(" const names={'REP-02'", " if(document.body.dataset.edition==='law')for(const key of ['formation','social','symbols','alchemy'])delete definitions[key];\n const names={'REP-02'")
  code=code.replace("   for(const key of keys){\n    const def=definitions[key]", "   for(const key of keys.filter(key=>definitions[key])){\n    const def=definitions[key]")
  code=code.replace("   groups.append(column);", "   if(column.querySelector('.atlas-card'))groups.append(column);")
  code=code.replace(" c.ground.append(coreCard,stakes);", " c.ground.append(coreCard);if(document.body.dataset.edition!=='law')c.ground.append(stakes);")
  code=code.replace("c.ground.append(coreCard,stakes);", "c.ground.append(coreCard);if(document.body.dataset.edition!=='law')c.ground.append(stakes);")
  code=code.replace("<h1>Philosophy and alchemy of law</h1>","<h1>'+document.body.dataset.editionTitle+'</h1>")
  code=code.replace("One legal question, several perspectives. Explore its reasoning, its lived effects and its spiritual horizon.","One legal question, connected inquiries. Begin with the ruling and its sources.")
  # Record the precise active view for cross-edition navigation.
  code=code.replace("hide();c.selected=keys;", "hide();document.body.dataset.activeStudy=c.id;document.body.dataset.activePerspectives=keys.join(',');c.selected=keys;")
  code=code.replace("activeCase=cases.get(id)||activeCase;", "activeCase=cases.get(id)||activeCase;document.body.dataset.activeStudy=activeCase.id;delete document.body.dataset.activePerspectives;")
  code=code.replace("const home=page.dataset.document==='home';", "delete document.body.dataset.activeStudy;delete document.body.dataset.activePerspectives;const home=page.dataset.document==='home';")
  code=code.replace("addEventListener('hashchange',()=>route());", "window.bidayaOpenPerspective=(study,keys)=>{if(cases.has(study)){showCase(study,false);openReading(cases.get(study),keys,false);}};addEventListener('hashchange',()=>route());")
 write(SHARED/('reader-'+scope+'.js'),code)
 write(SHARED/('data-'+scope+'.js'),'// Source records shared by both editions; generated from the canonical reader.\n'+''.join('document.getElementById('+json.dumps(k)+').textContent='+json.dumps(dump(v),ensure_ascii=False)+';\n' for k,v in records.items()))
 # Preserve canonical corpus as reusable data, not independently edited editions.
 article=doc.get_element_by_id('manuscript');original_article=originals[scope].get_element_by_id('manuscript')
 groups=reps(article)
 extracted=[];address=None;heading=None
 for serial,n in enumerate(article):
  if not isinstance(n.tag,str):continue
  if n.tag in ['h1','h2','h3']:
   heading=text(n)
   if n.get('id'):address=n.get('id')
  case_ids=[v for v in n.xpath('.//@id') if v.startswith('case-')]
  if case_ids:address=case_ids[-1]
  if n.get('data-reading-core') or n.get('data-reading-layer') in ['principles','scripture'] and legal(n):
   extracted.append({'id':n.get('id') or 'editorial-'+scope+'-'+str(serial).zfill(5),'original_address':address,'heading':heading,'kind':'legal exposition' if n.get('data-reading-core') else n.get('data-reading-layer'),'html':ser(n),'text_sha256':digest(text(n)),'principle_refs':n.xpath('.//@data-principle'),'source_note_refs':n.xpath('.//@data-source-note'),'status':'Existing editorial exposition and cited controls; independent position audit remains open.'})
 all_legal_blocks[scope]=extracted
 legal_register[scope]=[{'id':key,'blocks':[ser(n) for n in nodes if legal(n) and n.tag!='nav'],'legal_text_sha256':digest('\n'.join(normalized(n) for n in nodes if legal(n) and n.tag!='nav'))} for key,nodes in groups.items()]
 corpora[scope]={'source_sha256':digest(raw),'source_path':str(file.relative_to(ROOT)),'html':ser(doc),'records':{k:len(v) for k,v in records.items()},'study_ids':list(groups)}
 write(AUDIT/('corpus-'+scope+'.json'),dump(corpora[scope]))
 # Count conservation compares actual prose before and after link relocation.
 assert text(original_article)==text(article),(scope,'text changed during source relocation')
 parity.append({'scope':scope,'original_studies':len(groups),'original_article_text_sha256':digest(text(original_article)),'relocated_article_text_sha256':digest(text(article)),'text_preserved':True,'original_stable_ids':len(original_article.xpath('.//*[@id]'))})

# A shared source-locator catalogue supplies the full research reader's missing local sources.
def source_catalog():
 return '<section id="review-source-locators"><h2>Source details</h2><p>Exact locators and selected excerpts. A locator does not imply that a complete source edition is reproduced.</p>'+''.join('<section id="'+key+'"><h3>'+escape(v['label'])+'</h3>'+('<p'+(' lang="ar" dir="rtl" class="arabic-passage"' if re.search('[\u0600-\u06ff]',v['excerpt']) else '')+'>'+escape(v['excerpt'])+'</p>' if v['excerpt'] else '<p>Consult the cited witness at this locator; the full source is not bundled.</p>')+'</section>' for key,v in catalog.items())+'</section>'

write(AUDIT/'legal-foundation.json',dump({'status':'Extracted legal exposition, reasoning and contextual exegesis; source-critical review remains open. No new adjudication.','authority':'Generated index of the canonical corpus used by both editions, not a separate text to edit. IDs are scoped to pilot or reservoir, matching the original readers.','scopes':legal_register,'all_annotated_legal_blocks':all_legal_blocks}))
terms_page='<main class="gn-gateway"><a href="../human-life/">← Law and Human Life</a><h1>Alchemical terms</h1><p>These are qualified comparisons for effects of practising law, not names for legal inferences. Definitions and applications are preserved from the project’s operation register, Revision 13. Its historical vocabulary witnesses include Ruland’s uncorrected electronic text and the imported comparative register; these entries do not claim a new print collation.</p>'
representatives=json.loads((ROOT/'output/representative-register.json').read_text())['records']
for key,v in alchemy.items():
 cases=[r for r in representatives if key in r.get('terms',[])]
 terms_page+='<section id="'+escape(key)+'"><h2>'+escape(v['term'])+'</h2><p><strong>Sense.</strong> '+escape(v['sense'])+'</p><p><strong>Proposed application.</strong> '+escape(v['application'])+'</p><p class="source-note">'+escape(v['current_application_status'])+' · Representative studies: '+', '.join('<a href="../human-life/reservoir.html#'+r['id']+'">'+r['id']+'</a>' for r in cases)+'</p></section>'
terms_page+='</main>'
write(SHARED/'alchemical-terms.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Alchemical terms · Gnamma Research</title><link rel="stylesheet" href="gnamma-bidaya.css"></head><body>'+terms_page+'</body></html>')

edition_titles={'law':'Law and Legal Reasoning','human-life':'Law and Human Life'}
for edition,title in edition_titles.items():
 for scope in ['pilot','reservoir']:
  doc=html.fromstring(corpora[scope]['html']);article=doc.get_element_by_id('manuscript');body=doc.find('body');head=doc.find('head')
  body.set('data-edition',edition);body.set('data-edition-title',title);body.set('data-scope',scope)
  doc.find('.//title').text='Bidāyat al-Mujtahid · '+title+' | Gnamma Research'
  # Public source viewers are shared; only their return destination varies.
  for a in doc.xpath('//a[@href]'):
   href=a.get('href')
   if href.startswith('../shared/') and '.html' in href:
    base,sep,frag=href.partition('#');a.set('href',base+'?edition='+edition+('&scope=reservoir' if scope=='reservoir' else '')+(sep+frag if sep else ''))
  if scope=='reservoir':
   article.append(html.fromstring(source_catalog()))
   existing=doc.xpath('//main/div[contains(@class,"reader-intro")]')
   for n in existing:n.getparent().remove(n)
   intro=html.fromstring('<div class="reader-intro"><strong>Wider research manuscript · Revision 16</strong><p>72 representative studies and retained detailed investigations. This material remains under source-critical review; it is not a complete rule-by-rule commentary. Use the subject search to find a study, or return to the <a href="./">eight selected studies</a>.</p></div>')
   doc.find('.//main').insert(0,intro)
  if edition=='law':
   # Explicitly exclude the non-legal layers, including dual-tagged inward exegesis.
   for n in list(article.xpath('.//*[@data-reading-layer]')):
    if not legal(n):
     ghost=html.Element('span');ghost.set('data-other-edition','true')
     if n.get('id'):ghost.set('id',n.get('id'))
     n.getparent().replace(n,ghost)
   for n in list(doc.xpath('//*[@data-layer-toggle]')):
    if n.get('data-layer-toggle') not in ['principles','scripture']:n.getparent().getparent().remove(n.getparent())
    elif n.get('data-layer-toggle')=='scripture':
     for small in n.getparent().xpath('.//small'):small.text='Text, context and commentary relevant to legal interpretation'
   for n in list(doc.xpath('//*[@data-reading-route]')):
    if n.get('data-reading-route') not in ['principles','scripture']:n.getparent().remove(n)
   # Purely spiritual controls are not legal commentary. Their source records remain preserved in shared data.
   for n in list(article.xpath('//*[@data-source-note]')):
    if 'Qushayr' in text(n) or 'Futūḥāt' in text(n):
     n.getparent().remove(n)
   for n in doc.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," reading-guide ")]'):
    n.clear();n.append(html.fromstring('<summary>How to read this edition</summary>'));n.append(html.fromstring('<p>The ruling, reported disagreement, evidence and methodological controls form the legal inquiry. Edition II adds the investigations of formation, institutions and spiritual meaning.</p>'))
   if scope=='pilot':
    # Replace only the frontmatter for the edition's scope; no legal case is rewritten.
    nodes=list(article);start=next(i for i,n in enumerate(nodes) if at(n,'PILOT-METHOD'));end=next((i for i,n in enumerate(nodes) if n.get('id')=='review-scope'),len(nodes))
    preserved=[deepcopy(n) for n in nodes[start:end] if n.xpath('.//*[@data-primary-text="IR-DAR"]') or text(n).startswith('A science, a rule and a judgment.') or text(n).startswith('Each study opens with')]
    for n in nodes[start:end]:article.remove(n)
    method=html.fragments_fromstring('<p><span id="PILOT-METHOD"></span></p><h1 id="section-15">Method and reading guide</h1><p>Begin with Ibn Rushd’s stated ruling and reason for disagreement. Compare the evidence and the operation of inference; distinguish his own account, the positions he reports, later controls and our editorial analysis.</p><div class="argument-map"><div><b>1 · Question and disagreement</b><span>Identify the practical object and each reported alternative.</span></div><div><b>2 · Evidence and interpretation</b><span>Read the text, its setting and the stated reason for disagreement.</span></div><div><b>3 · Judgment and limits</b><span>Distinguish the rule, its application, and the warrant for each claim.</span></div></div>')
    for n in method+preserved:article.insert(start,n);start+=1
    article.insert(start,html.fromstring('<p>The <a href="../human-life/#PILOT-METHOD">extended method guide</a> explains the further philosophical and formative inquiries. Neither legal validity nor a plausible benefit proves that virtue or realization has occurred.</p>'))
    nodes=list(article);nodes[1].text=title;nodes[2].clear();nodes[2].text='Ibn Rushd · text, evidence and juristic disagreement'
    nodes[3].clear();nodes[3].text='Eight studies from Ibn Rushd’s Bidāyat al-Mujtahid, with his rulings, reported disagreements and reasons. Passages from al-Ḍarūrī clarify the methods of judgment. Read the legal account alongside the original Arabic, English translations and source-specific commentary.'
   else:
    # Named philosophical essays and the formation ledger belong to Edition II.
    # Technical foundations (sections 13–14), legal registers and detailed case material stay here.
    omitted_sections=set(range(1,13))|set(range(15,25))|set(range(25,35))|set(range(458,543))
    omit=False
    for n in list(article):
     if n.get('id')=='review-source-locators':omit=False
     if n.tag in ['h1','h2'] and re.fullmatch(r'section-\d+',n.get('id','')):omit=int(n.get('id').split('-')[1]) in omitted_sections
     if omit and not n.get('data-reading-core') and n.get('data-reading-layer')!='principles':
      ghost=html.Element('span');ghost.set('data-other-edition','true')
      for i in dict.fromkeys([n.get('id')]+n.xpath('.//@id')):
       if i:child=html.Element('span');child.set('id',i);child.set('data-other-edition','true');ghost.append(child)
      article.replace(n,ghost)
  # Add the shared identity and edition switch, without replacing the proven reader controls.
  top=doc.xpath('//header[contains(@class,"topbar")]')[0]
  brand=top.xpath('.//*[contains(@class,"brand")]')[0];brand.clear();brand.append(html.fromstring('<a class="gn-bidaya-brand" href="../../"><img src="../../../assets/gnamma-mark.svg" alt="">gnamma <small>RESEARCH</small></a>'))
  switch=html.fromstring('<nav class="edition-switch" aria-label="Reading edition"><a data-edition-switch="law" href="../law/">I · Law</a><a data-edition-switch="human-life" href="../human-life/">II · Human life</a></nav>')
  for a in switch:a.set('aria-current','page' if a.get('data-edition-switch')==edition else 'false')
  top.insert(1,switch)
  side=doc.get_element_by_id('reader-sidebar');side.append(html.fromstring('<section class="gn-related"><h2>Research and sources</h2><a href="'+('reservoir.html' if scope=='pilot' else './')+'">'+('Wider manuscript · 72 studies' if scope=='pilot' else 'Eight selected studies')+'</a><a href="../">About the two editions</a><a href="../shared/coverage.html">Coverage and provenance</a><a href="../../usul-law-rushd/alternative-usul/">Alternative uṣūl · provisional casebook</a><a href="../../usul-law-rushd/qawanin/">Qawānīn · separate research dossier</a><a href="../../../texts/ibn-rushd/bidayat-al-mujtahid/'+edition+'/prototype.html#dictionary">Earlier glossary · provisional terms</a><a href="https://usul-law-rushd.sachiarafat.chatgpt.site/" rel="noopener">Original research reader ↗</a><button type="button" class="plain-button" onclick="window.print()">Print / save as PDF</button></section>'))
  head.append(html.fromstring('<link rel="icon" type="image/svg+xml" href="../../../assets/gnamma-mark.svg">'));head.append(html.fromstring('<link rel="stylesheet" href="../shared/gnamma-bidaya.css">'))
  for src in ['data-'+scope+'.js','reader-'+scope+'.js','edition-navigation.js']:
   body.append(html.fromstring('<script src="../shared/'+src+'"></script>'))
  file='index.html' if scope=='pilot' else 'reservoir.html'
  write(DEST/edition/file,'<!doctype html>\n'+ser(doc))

# Existing source pages are reused unchanged in text and page assets, with edition-aware return links.
for name in ['rushd-primary-texts.html','rushd-source-workspace.html','principle-index.html']:
 s=(source/name).read_text().replace('index.html','../human-life/index.html')
 s=s.replace('</head>','<link rel="stylesheet" href="gnamma-bidaya.css"></head>').replace('</body>','<script src="source-navigation.js"></script></body>')
 write(SHARED/name,s)
shutil.copy2(source/'principle-references.csv',SHARED/'principle-references.csv')
# Full principle index remains a separate scope: counts refer to explicit editorial references.
s=(ROOT/'output/principle-subject-index.html').read_text().replace('pilot-reader.html','../human-life/index.html').replace('master-reader.html','../human-life/reservoir.html')
s=s.replace('</head>','<link rel="stylesheet" href="gnamma-bidaya.css"></head>').replace('</body>','<script src="source-navigation.js"></script></body>')
write(SHARED/'principle-index.html',s)
shutil.copy2(ROOT/'output/principle-subject-index.csv',SHARED/'principle-references.csv')

# Keep the old prototype and casebook intact and redirect only their main entry pages.
for edition in edition_titles:
 old=REPO/'texts/ibn-rushd/bidayat-al-mujtahid'/edition
 if not (old/'prototype.html').exists():shutil.copy2(old/'index.html',old/'prototype.html')
 target='../../../../research/bidaya/'+edition+'/'
 write(old/'index.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bidāya · Gnamma Research</title><p>The substantive edition is now in <a href="'+target+'">Gnamma Research</a>. The <a href="prototype.html">earlier interface</a> and <a href="casebook/">provisional casebook</a> remain available.</p><script>location.replace('+json.dumps(target)+'+location.search+location.hash)</script></html>')

report={'date':'2026-10-27','migration_scope':'Eight-study reader plus complete existing wider research reader; no new claim of source-critical completion.','canonical_checks':parity,'shared_primary_records':corpora['pilot']['records']['rushd-data'],'shared_source_page_images':len(list((SHARED/'source-workspace-pages').glob('*.webp'))),'source_inventory':'Internal recovery manifest retained locally; not part of the public reader.','independent_materials':'The alternative-usul casebook and qawanin dossier are retained at their existing URLs; B-addresses are not remapped to K-position IDs.','open_scholarship':'All original OPEN-ISSUES remain. The proposed REP-43 reorder and legal distinction require source review; migration does not silently change them.','publication_status':'Preservation snapshot; live publication is recorded separately by the repository commit and deployment receipt.'}
report['before_migration']={'gnamma_prototype_topics':['Intention in purification','Voluntary relinquishment of dower','Returning a deposited trust'],'canonical_eight_study_reader_imported':False,'separate_casebook':'Existing provisional research; retained unchanged.'}
report['after_migration']={'eight_study_reader_imported':True,'wider_72_study_reader_imported':True,'all_annotated_legal_blocks':{k:len(v) for k,v in all_legal_blocks.items()},'whole_bidaya_critical_review_complete':False}
report['study_parity']=[]
for scope in ['pilot','reservoir']:
 old=reps(originals[scope].get_element_by_id('manuscript'));new=reps(html.parse(str(DEST/'human-life'/('index.html' if scope=='pilot' else 'reservoir.html'))).getroot().get_element_by_id('manuscript'))
 for key,nodes in old.items():
  original_text=' '.join(text(n) for n in nodes);migrated=' '.join(text(n) for n in new[key]);assert original_text==migrated
  report['study_parity'].append({'scope':scope,'id':key,'text_sha256':digest(original_text),'extended_text_preserved':True,'original_layers':dict(Counter(n.get('data-reading-layer','unclassified_or_core') for n in nodes))})
write(AUDIT/'content-parity.json',json.dumps(report,ensure_ascii=False,indent=2)+'\n')
write(SHARED/'content-parity.json',json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print({'destination':str(DEST),'files':sum(p.is_file() for p in DEST.rglob('*')),'canonical':[(x['scope'],x['original_studies'],x['text_preserved']) for x in parity]})
