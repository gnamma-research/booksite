#!/usr/bin/env python3
"""Build Tahdhib readers from the actual Daruri UI, with independent book data.
Does not alter canonical data.js or any PDF. Fails closed on source schema changes.
"""
import hashlib, html, json, re, subprocess, tempfile
from pathlib import Path
from bs4 import BeautifulSoup, Doctype
ROOT=Path(__file__).resolve().parents[2]
TOOLS=ROOT/'tools/tahdhib'
DAR=ROOT/'daruri'
RELEASE='20261103-native1'
sha=lambda b:hashlib.sha256(b).hexdigest()
def load(name):
 s=(ROOT/f'texts/al-taftazani/tahdhib-al-{name}/edition/data.js').read_text()
 return json.loads(s.split('=',1)[1].rstrip(';\n '))
def nodes(src):
 with tempfile.NamedTemporaryFile('w',suffix='.js') as f:
  f.write(src);f.flush()
  return json.loads(subprocess.check_output(['node',str(TOOLS/'native_ast.cjs'),f.name]))
def replace_nodes(src,variables=None,functions=None):
 edits=[]
 for n in nodes(src):
  mapping=variables if n['type']=='variable' else functions
  if mapping and n['name'] in mapping:edits.append((n['start'],n['end'],mapping[n['name']]))
 for a,b,text in sorted(edits,reverse=True):src=src[:a]+text+src[b:]
 return src
raw=(DAR/'index.html').read_text()
soup=BeautifulSoup(raw,'html.parser')
core=next(t.string for t in soup.find_all('script') if t.string and 'const BOOK = JSON.parse' in t.string)
ov=(TOOLS/'native_overrides.js').read_text()
func={n['name']:ov[n['start']:n['end']] for n in nodes(ov) if n['type']=='function'}
glossary_file=ROOT/'texts/al-taftazani/tahdhib-al-kalam/edition/glossary.js'
glossary=json.loads(subprocess.check_output(['node','-e',"const vm=require('vm'),fs=require('fs'),c={window:{}};vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'),c);console.log(JSON.stringify(c.window.GNAMMA_TAHDHIB_GLOSSARY.terms));",str(glossary_file)]))
shared_before=['reading-styles.js','visuals-controls.js','bookmark-ui.js']
copy_before=['backup-transfer.js','reading-desk.js','reading-mode-controls.js','reading-navigation-history.js','reading-navigation-bridge.js','headerless-navigation.js','general-section-picker.js']
copy_after=['gnamma-search-return.js','gnamma-proximity.js','gnamma-search.js','gnamma-word-context.js','copy-links.js','focus-locators.js']
report={'release':RELEASE,'daruri_template_sha256':sha(raw.encode()),'books':{}}
for kind,name in [('kalam','kalam'),('logic','mantiq')]:
 base=ROOT/f'texts/al-taftazani/tahdhib-al-{name}/edition';out=base/'native';out.mkdir(exist_ok=True)
 source=load(name);units=source['units'];expected=1044 if kind=='kalam' else 19
 assert len(units)==expected and len({u['id'] for u in units})==expected
 canonical_sha=sha((base/'data.js').read_bytes())
 ordered=sorted({u['page'] for u in units});page_to_sec={p:i+1 for i,p in enumerate(ordered)}
 part_specs=[(15,'I · Introduction'),(17,'II · General matters'),(35,'III · Accidents'),(56,'IV · Substances'),(77,'V · Divinity'),(97,'VI · Revealed matters')] if kind=='kalam' else [(1,'Logic · Concepts and definitions'),(10,'Logic · Judgements and inference')]
 parts=[dict(id=i,label=label,caption='Editorial grouping; original text and headings are retained below.',desc=label,start=page_to_sec[p],end=page_to_sec[part_specs[i+1][0]]-1 if i+1<len(part_specs) else len(ordered)) for i,(p,label) in enumerate(part_specs)]
 secs=[];note_rows=[];unitmap={};anchors={}
 def addnote(s,uid,kind_,text):
  nid='T'+str(len(note_rows)+1).zfill(4)
  note_rows.append(dict(id=nid,n=s['id'],kind=kind_,text=uid+' · '+text));s['noteIds'].append(nid)
 for page in ordered:
  group=[u for u in units if u['page']==page];sid=page_to_sec[page];part=max(i for i,(p,_) in enumerate(part_specs) if page>=p)
  headings=[u for u in group if re.match(r'^(?:الباب|الفصل|فصل)(?:\s|[.:،])',u['ar']) and len(u['ar'])<=110]
  first=headings[0] if headings else None
  title=group[0].get('title') or (first['en'] if first else f'Cairo printed page {page}')
  s=dict(id=sid,part=part,originalPage=page,ref=f'Cairo p. {page}' if kind=='kalam' else 'L.'+str(page).zfill(2),pages=[page] if kind=='kalam' else source.get('stage78_source_concordance',{}).get('unit_printed_pages',{}).get(group[0]['id'],[]),pdfPage=None,title=title,headingAr=first['ar'] if first else None,headingVocalized=first['ar'] if first else None,headingEn=first['en'] if first else None,segments=[],noteIds=[],apps=[],tags=[])
  if not s['pages']:
   loc=group[0].get('source_location','');nums=re.findall(r'\d+',str(loc));s['pages']=[int(n) for n in nums if 3<=int(n)<=14] or []
  if isinstance(s['pages'],str):s['pages']=[int(n) for n in re.findall(r'\d+',s['pages'])]
  for i,u in enumerate(group):
   s['segments'].append(dict(ar=u['ar'],vocalized=u['ar'],en=u['en'],unitId=u['id']))
   unitmap[u['id']]={'section':sid,'segment':i,'unitId':u['id']};anchors['u-'+re.sub(r'[^a-zA-Z0-9-]','-',u['id'])]=unitmap[u['id']]
   if u.get('editorial_note'):addnote(s,u['id'],'editorial',u['editorial_note'])
   for n in u.get('notes',[]):addnote(s,u['id'],n.get('type','editorial'),n.get('text',''))
   for issue in source.get('open_issues',[]):
    if u['id'] in issue.get('ids',[]):addnote(s,u['id'],'crux',issue['issue']+(' Source: '+issue['parallel'] if issue.get('parallel') else ''))
   for v in source.get('witness_comparisons_stage77',[]):
    if v.get('id')==u['id']:addnote(s,u['id'],'textual','Cairo 1912: '+str(v.get('cairo',''))+' | Comparator: '+str(v.get('other',''))+' | '+str(v.get('status',''))+' '+str(v.get('source','')))
  secs.append(s)
 fold=lambda s:re.sub('[\u064b-\u065f\u0670\u0640]','',s).lower()
 terms=[dict(term=t['en'],ar=t['ar'],definition=t['explanation'],sections=[s['id'] for s in secs if any(fold(t['ar']) in fold(g['ar']) for g in s['segments'])]) for t in glossary]
 index=[dict(term=t['term'],sub=[dict(label=t['ar'],sections=t['sections'])]) for t in terms if t['sections']]
 status=('Complete bilingual working text. 112 of 113 Cairo-print pages checked; KAL-077.03 remains uncertain. Independent manuscript collation is not complete.' if kind=='kalam' else 'Complete bilingual working text, nineteen editorial divisions. Printed comparisons and formal checks are recorded; independent manuscript collation and historical modal interpretation remain incomplete.')
 info=dict(title=source['work'],author=source.get('author','Saʿd al-Dīn al-Taftāzānī'),subtitle='Arabic–English source-qualified reading edition',edition='Cairo, Maṭbaʿat al-Saʿāda, 1330 AH / 1912. Later printed comparisons are identified in the apparatus.',notice=status,vocalization='The on-screen vowel control retains or hides marks present in the source transcription. It does not certify a fully vocalized edition. Machine-vowelled PDFs are separate, unreviewed learning aids.',editorialStatus=status)
 book=dict(info=info,parts=parts,sections=secs,apps=[],notes=note_rows,glossary=terms,index=index,stats=dict(sections=len(secs),passages=expected,notes=len(note_rows),apps=0,terms=len(terms),concepts=len(index),subtopics=len(index),noteCount=len(note_rows),totalPdfPages=0))
 config=dict(kind=kind,title_ar=source.get('title_ar','تهذيب الكلام' if kind=='kalam' else 'تهذيب المنطق'),unitCount=expected,storagePrefix='gnamma-tahdhib-native-'+kind,unitMap=unitmap,anchorMap=anchors,book=book,dictionary={'terms':{},'sources':{},'extraTerms':[]},statusHref='EDITORIAL_STATUS.md' if kind=='kalam' else 'LOGIC_AUDIT.md',sibling='../../tahdhib-al-'+('mantiq' if kind=='kalam' else 'kalam')+'/edition/',sourceSha256=canonical_sha,release=RELEASE)
 (out/'book-data.js').write_text('window.TAHDHIB_NATIVE='+json.dumps(config,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\n')
 adapter=(TOOLS/'native_adapter.js').read_text().replace("'&paragraph='+item.segment","'&paragraph='+encodeURIComponent(item.unitId)")
 adapter=adapter.replace("format:'gnamma-reading-desk'","format:'gnamma-tahdhib-"+kind+"-reading-desk'")
 (out/'book-adapter.js').write_text(adapter)
 def textadapt(s):
  for old,new in [('gnamma-reading-desk-v1',config['storagePrefix']+'-reading-desk-v1'),('daruri-reader-v2',config['storagePrefix']+'-reader-v2'),('gnamma-reading-navigation-v1',config['storagePrefix']+'-reading-navigation-v1'),('gnamma-current-reading-progress-v1',config['storagePrefix']+'-progress-v1'),('gnamma-restored-reading-place-v1',config['storagePrefix']+'-restored-place-v1')]:s=s.replace(old,new)
  s=s.replace("FORMAT='gnamma-reading-desk'", "FORMAT='gnamma-tahdhib-"+kind+"-reading-desk'")
  for old,new in [('Ibn Rushd’s', 'al-Taftāzānī’s'),("Ibn Rushd's","al-Taftāzānī’s"),('Ibn Rushd','al-Taftāzānī'),('al-Ḍarūrī',source['work']),('al-Daruri',source['work']),('الضَّرُورِيّ · ابْن رُشْد',config['title_ar']+' · التفتازاني'),('الضروري',config['title_ar']),('Bidāya applications','Commentary sources'),('Bidāya application sources','Commentary references'),('Bidāya Application','Commentary source'),('Bidāya','Commentary'),('153 defined technical terms',str(len(terms))+' editorial terms')]:s=s.replace(old,new)
  return s
 vars_={'PDF_STUDY_INDEX':'BOOK.parts.map(p=>({title:p.label,description:p.caption,sections:[p.start]}))','PDF_EDITORIAL_PAGES':'{}','NOTE_SCOPE':'{}','INDEX_SYNONYMS':'{}','INDEX_REDIRECTS':'{}','GN_SECTION1_QURAN_PAIRS':'Object.freeze({})','VERIFIED_BOU_AKL_ARABIC_PAGES':'Object.freeze({})','gnOriginalHeadingParent':'Object.freeze({})','gnContentsParts':'Object.fromEntries(BOOK.parts.map(p=>[p.id,{label:p.label,topic:p.caption,range:p.start+"–"+p.end}]))','gnContentsGeneric':'new Set()','gnContentsProseTopics':'Object.freeze({})','sectionRef':"n=>BOOK.sections.find(s=>String(s.id)===String(n))?.ref||String(n)"}
 js=replace_nodes(core,vars_,func)
 js=js.replace("const BOOK = JSON.parse(document.getElementById('editionData').textContent);","const BOOK = JSON.parse(document.getElementById('editionData').textContent);\nconst CFG=window.TAHDHIB_NATIVE;")
 js=js.replace("const nextN=isCol?null:pn===258?'colophon':pn+1,prevN=isCol?258:pn===1?null:pn-1;","const si=BOOK.sections.findIndex(x=>String(x.id)===state.n),nextN=BOOK.sections[si+1]?.id,prevN=BOOK.sections[si-1]?.id;")
 js=re.sub(r'Math\.min\(Number\((state\.n|id)\)\|\|258,258\)/258',r'(Math.max(0,BOOK.sections.findIndex(s=>String(s.id)===String(\1)))+1)/BOOK.sections.length',js)
 js=js.replace('[0,1,2,3,4].map(id=>','BOOK.parts.map(p=>p.id).map(id=>')
 js=js.replace("initial:(state.focusMode?1:0)","initial:3")
 js=re.sub(r"if\('serviceWorker' in navigator[^\n]+",'',js)
 init="applyParallelOrder();applyArabicFont();applyEnglishFont();bind();"
 js=js.replace(init,"window.TahdhibNative={book:BOOK,state,desk:rd,navigate,goSection,sectionRef,save,release:CFG.release};\n"+init)
 js=textadapt(js)
 (out/'reader-core.js').write_text(js)
 assets={}
 for file in copy_before+copy_after+['reading-desk-pdf.js']:
  s=(DAR/file).read_text();original=sha(s.encode());s=textadapt(s)
  if file=='reading-mode-controls.js':s=replace_nodes(s,{'ALIGNMENTS':'[]'})
  if file=='reading-navigation-history.js':s=s.replace("BOOK='daruri'","BOOK='tahdhib-"+kind+"'")
  if file=='backup-transfer.js':s=s.replace("value.work!=='daruri'","value.work!=='tahdhib-"+kind+"'").replace("work:'daruri'","work:'tahdhib-"+kind+"'")
  if file=='reading-desk.js':s=s.replace("new URL('reading-desk-pdf.js", "new URL('native/reading-desk-pdf.js")
  if file=='gnamma-search-return.js':s=s.replace("new URL('./index.html',document.currentScript?.src||location.href)","new URL('index.html',location.href)")
  if file=='reading-desk-pdf.js':s=s.replace("const BASE=new URL('.',document.currentScript?.src||location.href);","const BASE=new URL('../../../../daruri/',location.href);")
  if file=='gnamma-search.js':s=s.replace("moreUrl:'../texts/al-ghazali/al-mustasfa/data/gnamma-search-index.json'","moreUrl:'../../../al-ghazali/al-mustasfa/data/gnamma-search-index.json'")
  if file=='copy-links.js':
   s=replace_nodes(s,{'COUNTS':'C.book.sections.map(s=>s.segments.length)','idFor':'(section,index)=>C.sections.get(String(section))?.segments?.[index]?.unitId||null','sectionLabel':'n=>C.sections.get(String(n))?.ref||String(n)'},{'citation':"function citation(){const s=C.sections.get(config.section);if(!s)return '';return C.book.info.author+', '+C.book.info.title+', Cairo 1330/1912, printed pp. '+s.pages.join('–')+'; '+selectedSegments().map(x=>x.x.unitId).join(', ')+' (Gnamma source-qualified working edition). '+buildLink();}"})
  if file=='focus-locators.js':s=s.replace("section==='colophon'?'Colophon':'§'+section","window.TahdhibNative?.sectionRef(section)||section")
  (out/file).write_text(s);assets[file]={'source':original,'adapted':sha(s.encode())}
 page=BeautifulSoup(raw,'html.parser')
 for t in page.select('noscript,script'):t.decompose()
 for t in page.select('link[rel="manifest"],meta[property^="og:"],meta[name="twitter:card"]'):t.decompose()
 for t in page.select('link[href]'):
  path=t['href']
  if not re.match(r'^(?:https?:|#|data:|/)',path):t['href']='../../../../daruri/'+path
 for t in page.select('a[href]'):
  href=t['href']
  if href in ['dictionary.html','./dictionary.html']:t['href']='#glossary'
  elif href=='../':t['href']='../../../../'
 page.title.string=source['work']+' · al-Taftāzānī'
 for t in page.select('meta[name="description"]'):t['content']=info['notice']
 for t in page.find_all(string=True):
  if t.parent.name!='style' and not isinstance(t,Doctype):t.replace_with(textadapt(str(t)))
 for t in page.select('[data-route="applications"]'):t['aria-label']='Commentary sources'
 headscript=page.new_tag('script');headscript.string="if(new URLSearchParams(location.search).has('legacy-controls'))location.replace('source-reader.html'+location.search+location.hash);";page.head.append(headscript)
 for id_ in ['dictionaryData','editionData']:
  t=page.new_tag('script',id=id_,type='application/json');t.string='{}';page.body.append(t)
 def script(src):
  t=page.new_tag('script',src=src+'?v='+RELEASE);page.body.append(t)
 script('native/book-data.js');script('native/book-adapter.js')
 for f in shared_before:script('../../../../daruri/'+f)
 for f in copy_before:script('native/'+f)
 script('native/reader-core.js')
 for f in copy_after:script('native/'+f)
 css=page.new_tag('style');css.string='.native-source-note{font:12px/1.6 var(--sans);color:var(--muted);padding:12px 16px;border-bottom:1px solid var(--border)} .native-pdfs{display:flex;flex-wrap:wrap;gap:12px} .native-pdf-status{font:13px/1.6 var(--sans)}';page.head.append(css)
 footer=page.new_tag('noscript');footer.append(BeautifulSoup('<p>This interactive reader requires JavaScript. <a href="source-reader.html">Open the source-aligned reader</a> or use <a href="pdfs/edition_manifest.json">the PDF manifest</a>.</p>','html.parser'));page.body.append(footer)
 output=str(page)
 output=re.sub(r'url\(([\"\']?)(?!data:|https?:|/|#)([^)\"\']+)\1\)',lambda m:'url('+m[1]+'../../../../daruri/'+m[2]+m[1]+')',output)
 legacy=base/'source-reader.html'
 if not legacy.exists():legacy.write_bytes((base/'index.html').read_bytes())
 (base/'index.html').write_text(output)
 assert sha((base/'data.js').read_bytes())==canonical_sha
 for u in units:
  m=unitmap[u['id']];seg=secs[m['section']-1]['segments'][m['segment']]
  assert seg['ar']==u['ar'] and seg['en']==u['en']
 report['books'][kind]={'units':expected,'reading_divisions':len(secs),'notes':len(note_rows),'source_sha256':canonical_sha,'adapted_assets':assets,'original_data_preserved':True,'original_pdf_bytes_modified':False}
(out.parent.parent.parent/'NATIVE_DARURI_BUILD_REPORT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
compat=TOOLS/'daruri_shell_qa.mjs'
text=compat.read_text()
for name in ['kalam','mantiq']:
 text=text.replace('tahdhib-al-'+name+"/edition/'",'tahdhib-al-'+name+"/edition/source-reader.html'")
compat.write_text(text)
