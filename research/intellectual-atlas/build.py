"""Build the Gnamma research page from the reviewed, versioned atlas package."""
from pathlib import Path
import hashlib
import json
import zipfile

ROOT=Path(__file__).resolve().parent
with zipfile.ZipFile(ROOT/'downloads/Islamic_Timeline_Website_Package.zip') as bundle:
    page=bundle.read('index.html').decode('utf-8')
    data=json.loads(bundle.read('timeline/timeline_data.json'))
assert len(data['nodes'])==295 and len(data['edges'])==286
assert len(data['timeline_meta']['integrated_display']['period_ids'])==45
assert len(data['history']['events'])==36

page=page.replace('<title>Intellectual Atlas | Historical Timeline</title>',
                  '<title>Texts in Time · Islamic Intellectual Atlas | gnamma research</title>')
head='''
<meta name="description" content="A working research atlas of philosophy, kalām and Sufi metaphysics: 295 entries, 286 textual relationships, and an integrated historical timeline with sources and critical qualifications.">
<link rel="canonical" href="https://gnamma-research.github.io/booksite/research/intellectual-atlas/">
<link rel="icon" type="image/svg+xml" href="../../assets/gnamma-mark.svg">
<link rel="stylesheet" href="site.css">
<meta name="gnamma-research-revision" content="integrated-2-2026-10-28">
'''
page=page.replace('</head>',head+'</head>',1)
brand='''
<a class="gn-atlas-skip" href="#kalam-timeline-app-v3">Skip to the atlas</a>
<header class="gn-atlas-masthead">
  <a class="gn-atlas-wordmark" href="../../" aria-label="gnamma research home"><img src="../../assets/gnamma-mark.svg" alt=""><span>gnamma<small>RESEARCH</small></span></a>
  <nav aria-label="Research navigation"><a href="../">Research collection</a><a href="../../docs/source-and-licenses.html">Sources &amp; editorial method</a></nav>
</header>
'''
page=page.replace('<body>','<body>'+brand,1)
page=page.replace('<h1>The Intellectual Atlas</h1>','<h1>Texts in Time</h1>',1)
intro='''
  <section class="gn-atlas-introduction" aria-label="About this research">
    <p class="gn-atlas-deck">Islamic Intellectual Atlas <span>· Working research · Revision 2 · 28 October 2026</span></p>
    <p>Philosophy, kalām and Sufi metaphysics in an integrated chronology of texts, empires and events.</p>
    <details class="gn-atlas-notes">
      <summary>About this research · PDFs &amp; data</summary>
      <div class="gn-atlas-note-body">
        <section><h2>Scope and method</h2>
          <p>The register brings together 295 works, work-series and contextual entries, with 286 individually qualified textual relationships. It traces ancient and late antique antecedents, translation networks, and Avicennan, Illuminationist, Akbarian, Sunni and Imami traditions into their later continuations. The historical display includes 45 political periods and 36 events.</p>
          <p>Empire durations sit above the same calendar axis as the works. Event lines extend through the text field; arrows between works identify commentary, criticism, citation, transmission or another specified relationship. Select a work, event, period or arrow to inspect its dates, evidence and sources.</p>
          <p>Coverage is selective and the atlas remains open to correction. A latest possible date is not a composition year; 152 entries retain upper-bound marks. Colors identify reception families rather than exclusive doctrinal identities. Chronological overlap does not establish influence or patronage. The Evidence &amp; audit view retains the critical revisions and disputed connections.</p>
        </section>
        <section><h2>Read and download</h2>
          <ul class="gn-atlas-downloads">
            <li><a href="downloads/Islamic_Timeline_Overview.pdf" type="application/pdf" target="_blank" rel="noopener">Overview PDF <span>15 pages · diagrams and method</span></a></li>
            <li><a href="downloads/Islamic_Intellectual_Timeline.pdf" type="application/pdf" target="_blank" rel="noopener">Complete reference PDF <span>204 pages · catalogue, evidence and bibliography</span></a></li>
            <li><a href="downloads/intellectual-atlas-data.json" download>Research data <span>JSON · dated records and source references</span></a></li>
            <li><a href="downloads/Islamic_Timeline_Website_Package.zip" download>Offline atlas and source package <span>Interactive edition, data and build sources</span></a></li>
          </ul>
          <p class="gn-atlas-source-note">The register supplies bibliographical references and research notes; it does not reproduce the complete source books or manuscript scans. Original date wording and qualifications remain available in each record.</p>
        </section>
      </div>
    </details>
    <noscript><p>The interactive diagram requires JavaScript. The PDFs and research data above remain available without it.</p></noscript>
  </section>
'''
needle='  <section class="ia-controls" aria-label="Explore the atlas">'
assert page.count(needle)==1
page=page.replace(needle,intro+needle,1)
initial="if(false)Object.assign(state,{from:1200,to:1750,selected:'jurjani_mawaqif',detailType:null,detailId:null,focusOnly:true});"
assert page.count(initial)==1
page=page.replace(initial,initial.replace('if(false)','if(true)'),1)
(ROOT/'index.html').write_text(page)
(ROOT/'downloads/intellectual-atlas-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
manifest={'title':'Texts in Time · Islamic Intellectual Atlas','revision':'integrated-2-2026-10-28',
          'status':'working research','entries':295,'textual_relationships':286,
          'displayed_political_periods':45,'displayed_events':36,
          'individual_reign_rows':0,'pdf_pages':{'overview':15,'reference':204},
          'downloads':{p.name:hashlib.sha256(p.read_bytes()).hexdigest()
                       for p in sorted((ROOT/'downloads').iterdir())
                       if p.is_file() and p.suffix in {'.pdf','.json','.zip'}}}
(ROOT/'publication.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps({'page_bytes':len(page.encode()),'entries':295,'relationships':286,
                  'downloads':len(manifest['downloads'])},indent=2))
