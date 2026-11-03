#!/usr/bin/env python3
"""Build Tahdhib from the actual Daruri UI, never its scholarly text.
Canonical data.js and PDF files are read-only inputs. Generated UI is reproducible.
"""
import hashlib, json, re, subprocess, sys
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parents[2]
ASSETS=ROOT/'texts/shared/tahdhib-native'
ASSETS.mkdir(parents=True,exist_ok=True)
original=(ROOT/'daruri/index.html').read_text()
base=BeautifulSoup(original,'html.parser')
main=next(s.get_text() for s in base.find_all('script') if not s.get('src') and 'const BOOK = JSON.parse' in s.get_text())
sha=lambda b:hashlib.sha256(b).hexdigest()
def compact(x):return json.dumps(x,ensure_ascii=False,separators=(',',':'))
def literal(s):return compact(s).replace('</','<\\/')
def assigned(path):return json.loads(path.read_text().split('=',1)[1].rstrip(';\n '))
def replace(s,a,b):
 if a not in s:raise ValueError('Missing integration anchor: '+a[:100])
 return s.replace(a,b)
modules=['reading-styles.js','visuals-controls.js','bookmark-ui.js','reading-desk.js','reading-mode-controls.js','reading-navigation-history.js','reading-navigation-bridge.js','headerless-navigation.js','general-section-picker.js','backup-transfer.js','reading-desk-pdf.js','copy-links.js','focus-locators.js']
r=subprocess.run(['node','-e','global.window={};require(process.argv[1]);console.log(JSON.stringify(window.GNAMMA_TAHDHIB_GLOSSARY.terms));',str(ROOT/'texts/al-taftazani/tahdhib-al-kalam/edition/glossary.js')],capture_output=True,text=True,check=True)
glossary=json.loads(r.stdout)
report={'schema':'tahdhib-native-build-v1','daruri_index_sha256':sha(original.encode()),'shared_source_modules':{n:sha((ROOT/'daruri'/n).read_bytes()) for n in modules},'books':{}}
for kind,folder,arname,name in [('kalam','tahdhib-al-kalam','تهذيب الكلام','Tahdhīb al-Kalām'),('logic','tahdhib-al-mantiq','تهذيب المنطق','Tahdhīb al-Manṭiq')]:
 target=ROOT/'texts/al-taftazani'/folder/'edition';corpus=assigned(target/'data.js');units=corpus['units']
 namespace='tahdhib-native-'+kind;expected=1044 if kind=='kalam' else 19
 assert len(units)==expected and len({u['id'] for u in units})==expected
 groups={}
 for u in units:groups.setdefault(u['page'],[]).append(u)
 section_list=[];notes=[];mapping={};parts=[];last_chapter=None;chapter_idx=0
 chapters=['Introduction','General matters','Accidents','Substances','Divinity','Doctrines']
 for seq,(page,items) in enumerate(groups.items(),1):
  heading=next((u for u in items if re.match(r'^الباب\s',u['ar'].strip())),None)
  if kind=='logic':
   chapter_idx=0 if seq<=9 else 1
   chapter_label='Conceptions and definitions' if chapter_idx==0 else 'Propositions and inference'
  else:
   if heading:
    for i,w in enumerate(['الأول','الثاني','الثالث','الرابع','الخامس','السادس']):
     if w in heading['ar']:chapter_idx=i;break
   chapter_label=chapters[chapter_idx]
  if last_chapter!=chapter_idx:
   if parts:parts[-1]['end']=seq-1
   parts.append({'id':chapter_idx,'label':chapter_label,'caption':name,'start':seq,'end':len(groups),'desc':'Source text with separate editorial apparatus.'})
   last_chapter=chapter_idx
  title=items[0].get('title') or (('Division '+str(page)) if kind=='logic' else chapter_label)
  sec={'id':seq,'part':chapter_idx,'pages':[page],'title':title,'headingAr':None,'headingEn':None,'headingVocalized':None,'pdfPage':None,'segments':[],'noteIds':[],'apps':[],'tags':[],'sourcePage':page,'chapterStart':bool(heading or seq==1),'source_location':items[0].get('source_location','')}
  for pos,u in enumerate(items):
   mapping[u['id']]={'section':str(seq),'segment':pos,'page':page}
   sec['segments'].append({'ar':u['ar'],'vocalized':u['ar'],'en':u['en'],'unitId':u['id']})
   unotes=list(u.get('notes') or [])
   if u.get('editorial_note'):unotes.insert(0,{'type':'Editorial','text':u['editorial_note']})
   for k,n in enumerate(unotes):
    nid='TH-'+u['id']+'-'+str(k+1);sec['noteIds'].append(nid)
    notes.append({'id':nid,'n':seq,'kind':'editorial','kindLabel':n.get('type','Note'),'text':u['id']+' · '+n.get('text',''),'unitId':u['id']})
  for issue in corpus.get('open_issues',[]):
   if issue.get('page')==page:
    nid='TH-ISSUE-'+str(seq)+'-'+str(len(notes));sec['noteIds'].append(nid)
    notes.append({'id':nid,'n':seq,'kind':'crux','kindLabel':'Unresolved textual issue','text':issue['issue']})
  for v in corpus.get('witness_comparisons_stage77',[]):
   if v.get('id') in [u['id'] for u in items]:
    nid='TH-VARIANT-'+str(len(notes));sec['noteIds'].append(nid)
    notes.append({'id':nid,'n':seq,'kind':'crux','kindLabel':'Printed-witness comparison','text':v['id']+' · Cairo: '+str(v.get('cairo',''))+' · Comparator: '+str(v.get('other',''))+' · '+v.get('status','')})
  section_list.append(sec)
 gl=[]
 for term in glossary:
  ar=re.sub(r'[\u064b-\u065f\u0670\u0640]','',term['ar'])
  locs=[s['id'] for s in section_list if any(ar in re.sub(r'[\u064b-\u065f\u0670\u0640]','',g['ar']) for g in s['segments'])]
  gl.append({'term':term['en'],'ar':term['ar'],'definition':term['explanation'],'sections':locs})
 index=[{'term':g['term'],'sub':[{'label':g['ar'],'sections':g['sections']}]} for g in gl if g['sections']]
 notice=('1,044 aligned clauses; 112 of 113 pages checked against Cairo 1912. KAL-077.03 remains uncertain. Independent manuscript collation is incomplete.' if kind=='kalam' else '19 editorial divisions; Cairo 1912 pp. 3–14. Printed comparisons are recorded; independent manuscript collation and historical modal verification are incomplete.')
 book={'info':{'id':namespace,'title':name,'arabicTitle':arname,'author':'Saʿd al-Dīn al-Taftāzānī','subtitle':'Arabic–English working reading edition','notice':notice,'edition':'Cairo: Maṭbaʿat al-Saʿāda, 1330 AH / 1912.','vocalization':'Original source text; no automatic vowels are silently substituted.'},'parts':parts,'sections':section_list,'notes':notes,'glossary':gl,'index':index,'apps':[],'stats':{'sections':len(groups),'notes':len(notes),'glossary':len(gl),'applications':0}}
 assert [(g['unitId'],g['ar'],g['en']) for s in section_list for g in s['segments']]==[(u['id'],u['ar'],u['en']) for u in units]
 config={'kind':kind,'namespace':namespace,'title':name,'arabicTitle':arname,'notice':notice,'map':mapping,'source_sha256':sha((target/'data.js').read_bytes()),'unit_count':expected,'other':'../../tahdhib-al-'+('mantiq' if kind=='kalam' else 'kalam')+'/edition/','commentary':'../../../al-sanandaji/taqrib-al-maram/' if kind=='kalam' else '../?legacy=1'}
 native=target/'native';native.mkdir(exist_ok=True)
 for module in modules:
  text=(ROOT/'daruri'/module).read_text()
  text=re.sub(r"(['\"])((?:daruri|gnamma)[A-Za-z0-9_-]+)\1",lambda m:m[1]+namespace+'-'+m[2]+m[1] if any(w in m[2] for w in ['reading-desk-v','rd-show-personal','reading-desk-return','reading-desk-intent','reading-desk-dictionary','reading-navigation-v','reader-v','reading-mode','current-reading','restored-reading']) else m[0],text)
  if module=='headerless-navigation.js':
   text=replace(text,"document.getElementById('dockSection')?.textContent?.match(/\\d+/)?.[0]||readerState?.n","readerState?.n||document.getElementById('dockSection')?.textContent?.match(/\\d+/)?.[0]")
  if module=='reading-navigation-bridge.js':
   text=replace(text,"const ref=p=>p.section==='colophon'?'Colophon':'§'+p.section;","const ref=p=>window.TAHDHIB_CONFIG.kind==='logic'?'Logic · L'+String(p.section).padStart(2,'0'):'Cairo p. '+(ctx.sections.get(String(p.section))?.sourcePage||p.section);")
  if module=='backup-transfer.js':
   text=text.replace("'daruri'",literal(namespace)).replace(literal(namespace+'-daruri-reader-v2'),literal(namespace+'-prefs'))
   text=text.replace('Darūrī reader',name).replace('Gnamma-Daruri-','Gnamma-Tahdhib-'+kind+'-')
   text=text.replace("return '§'+place.section","return (window.TAHDHIB_CONFIG.kind==='logic'?'Logic · L'+String(place.section).padStart(2,'0'):'Cairo p. '+ctx.sections.get(place.section).sourcePage)")
  if module=='reading-desk-pdf.js':
   text=text.replace("const BASE=new URL('.',document.currentScript?.src||location.href);","const BASE=new URL('../../../../../daruri/',document.currentScript?.src||location.href);")
   text=text.replace("pdf.setTitle('Darūrī · Reading Desk');","pdf.setTitle(window.TAHDHIB_CONFIG.title+' · Reading Desk');")
  if module=='reading-navigation-history.js':text=text.replace("BOOK='daruri'","BOOK="+literal(namespace))
  if module=='reading-desk.js':
   text=text.replace('storedEnvelope={}','storedEnvelope={work:book.info.id}')
   text=text.replace("new URL('reading-desk-pdf.js?","new URL('native/reading-desk-pdf.js?")
   text=text.replace('Daruri-Reading-Desk-','Tahdhib-'+kind+'-Reading-Desk-').replace('import into Darūrī','import into '+name)
   text=text.replace("['bidaya','Bidāya applications'],['lessons','Study lessons']","['lessons','Study notes']").replace("bidaya:'Bidāya'","bidaya:'Commentary'").replace("'Bidāya application '","'Commentary '")
   text=text.replace("throw Error('not a Reading Desk backup');","throw Error('not a Reading Desk backup');\n  if(parsed.work!==book.info.id)throw Error('This backup belongs to a different book. No saved data was changed.');")
  (native/module).write_text(text)
 app=main
 for key,value in [('PDF_STUDY_INDEX','[]'),('PDF_EDITORIAL_PAGES','{}'),('GN_SECTION1_QURAN_PAIRS','{}'),('NOTE_SCOPE','{}'),('INDEX_SYNONYMS','{}'),('INDEX_REDIRECTS','{}'),('gnOriginalHeadingParent','{}'),('gnContentsParts','{}'),('gnContentsProseTopics','{}')]:
  if key in ['GN_SECTION1_QURAN_PAIRS','gnOriginalHeadingParent','gnContentsParts']:
   app=re.sub(r'const '+key+r'=Object.freeze\(\{[\s\S]*?\n\}\);','const '+key+'={};',app)
  else:app=re.sub(r'^const '+key+r'\s*=.*?;\s*$','const '+key+'='+value+';',app,flags=re.M)
 app=app.replace("'daruri-reader-v2'",literal(namespace+'-prefs'))
 app=app.replace("'daruri-reader-source-origin'",literal(namespace+'-source-origin')).replace("'daruri-dictionary-restore'",literal(namespace+'-dictionary-restore'))
 app=app.replace("n:String(saved.n||1), lang:saved.lang|| (mobile()?'english':'parallel')","n:String(saved.n||1), lang:saved.lang||'parallel'").replace(':(state.focusMode?1:0)',':3')
 app=app.replace("pn===258?'colophon':pn+1","pn===BOOK.sections.length?null:pn+1")
 app=app.replace('Math.min(Number(state.n)||258,258)/258','Math.min(Number(state.n)||1,BOOK.sections.length)/BOOK.sections.length').replace('Math.min(Number(id)||258,258)/258','Math.min(Number(id)||1,BOOK.sections.length)/BOOK.sections.length')
 app=app.replace("const sectionRef=n=>n==='colophon'?'Colophon':`§${n}`;","const sectionRef=n=>BOOK.info.id.endsWith('logic')?'Logic · L'+String(n).padStart(2,'0'):'Cairo p. '+(sections.get(String(n))?.pages?.[0]??n);")
 app=app.replace('al-Ḍarūrī',name).replace('Darūrī',name).replace('Ibn Rushd','al-Taftāzānī')
 app=app.replace("'daruri-return-location'",literal(namespace+'-return-location')).replace("'daruri-restore-reference-view'",literal(namespace+'-reference-view'))
 app=replace(app,'/* Private Reading Desk: site-side hooks preserve the current edition data. */',(ASSETS/'adapter.js').read_text()+'\n/* Private Reading Desk: site-side hooks preserve the current edition data. */')
 app=replace(app,'applyParallelOrder();applyArabicFont();','window.TahdhibNative={book:BOOK,state,rd,goSection,renderRoute,notify};\napplyParallelOrder();applyArabicFont();')
 app=re.sub(r"if\('serviceWorker' in navigator[^\n]+",'',app)
 doc=BeautifulSoup(original,'html.parser')
 for ns in doc.find_all('noscript'):ns.decompose()
 for sc in list(doc.find_all('script')):
  src=sc.get('src','').split('?')[0]
  if not src:
   if sc.get('id') in ['editionData','dictionaryData']:
    sc.clear();sc.append(compact(book) if sc.get('id')=='editionData' else '{"terms":{},"sources":{}}')
   else:sc.decompose()
  elif src in modules:sc['src']='native/'+src+'?v=20261103-native1'
  else:sc.decompose()
 for link in list(doc.find_all('link')):
  href=link.get('href','')
  if link.get('rel')==['manifest']:link.decompose();continue
  if href and not re.match(r'^(https?:|#|/|data:)',href):link['href']='../../../../daruri/'+href
 for style in doc.find_all('style'):
  css=style.get_text();css=re.sub(r'url\(([\"\']?)(?!https?:|data:|/|#)([^\)\"\']+)\1\)',r'url(\1../../../../daruri/\2\1)',css);style.string=css
 doc.title.string=name+' · Gnamma Research'
 for attr in ['application-name','apple-mobile-web-app-title','description']:
  m=doc.find('meta',attrs={'name':attr})
  if m:m['content']=notice if attr=='description' else name
 for prop,val in [('og:title',name),('og:description',notice)]:
  m=doc.find('meta',attrs={'property':prop})
  if m:m['content']=val
 for brand in doc.select('.daruri-brand strong'):brand.string=name
 for brand in doc.select('.daruri-brand small'):brand.string=arname+' · التفتازاني'
 for brand in doc.select('.gn-sidebar-book-title cite'):brand.string=arname
 for author in doc.select('.gn-sidebar-title-author'):author.string='al-Taftāzānī'
 for btn in doc.select('[data-route="applications"]'):
  use=btn.find('use')
  for t in list(btn.find_all(string=True,recursive=False)):t.extract()
  btn.append('Commentary')
  if use:use['href']='#i-notes'
 for btn in doc.select('[data-route="study"]'):
  for t in list(btn.find_all(string=True,recursive=False)):t.extract()
  btn.append('Study & source notes')
 for a in doc.find_all('a',href=True):
  href=a['href']
  if 'daruri.pdf' in href:a['href']='pdfs/tahdhib-'+kind+'-parallel.pdf'
  elif href in ['dictionary.html','dictionary.html#']:a['href']='#glossary'
  elif href=='../':a['href']='../../../../'
 for x in doc.select('[data-apparatus="applications"],#applicationsSetting'):
  parent=x.find_parent('label')
  if parent:parent['hidden']=''
 pre=doc.new_tag('script');pre.string='window.TAHDHIB_CONFIG='+compact(config)+';\n'+(ASSETS/'bootstrap.js').read_text();doc.head.insert(0,pre)
 extra=doc.new_tag('link',rel='stylesheet',href='../../../shared/tahdhib-native/native.css?v=20261103-native1');doc.head.append(extra)
 tag=doc.new_tag('script');tag.string=app;doc.body.append(tag)
 for filename in ['copy-links.js','focus-locators.js']:
  el=doc.find('script',src='native/'+filename+'?v=20261103-native1')
  if el:el.extract();doc.body.append(el)
 end=doc.new_tag('script');end.string=(ASSETS/'after.js').read_text();doc.body.append(end)
 no=doc.new_tag('noscript');no.append('This reader requires JavaScript. ')
 a=doc.new_tag('a',href='pdfs/tahdhib-'+kind+'-parallel.pdf');a.string='Read the bilingual PDF';no.append(a);doc.body.append(no)
 text=str(doc).replace('viewbox=','viewBox=').replace('preserveaspectratio=','preserveAspectRatio=')
 if not (target/'previous-reader.html').exists():(target/'previous-reader.html').write_text((target/'index.html').read_text())
 (target/'index.html').write_text(text);(native/'source-map.json').write_text(compact(mapping))
 report['books'][kind]={'source_sha256':config['source_sha256'],'unit_count':expected,'sections':len(groups),'notes':len(notes),'text_identity_verified':True,'generated_index_sha256':sha(text.encode())}
# Keep old UI regressions on the archived UI; native public routes have new strict tests.
for qa in ['reader_qa.mjs','experience_qa.mjs','daruri_shell_qa.mjs']:
 path=ROOT/'tools/tahdhib'/qa
 if path.exists():
  path.write_text(re.sub(r'(texts/al-taftazani/tahdhib-al-(?:kalam|mantiq)/edition/)(?!previous-reader\.html)',r'\1previous-reader.html',path.read_text()))
(ASSETS/'build-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report['books'],indent=2))
