"""Build the sourced, work-level fiqh register and public coverage audit.

Inputs are committed research registers, not live web responses. Imported
OpenITI/Alreq records remain separate and never enter the unique-work count.
"""
import html
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path
from urllib.parse import quote, urlsplit

ROOT=Path(__file__).resolve().parent
SCHOOLS={'hanafi':'Ḥanafī','shafii':'Shāfiʿī','maliki':'Mālikī','hanbali':'Ḥanbalī',
         'zahiri':'Ẓāhirī','imami':'Imāmī / Jaʿfarī','zaydi':'Zaydī','ibadi':'Ibāḍī','ismaili':'Ismāʿīlī'}
INPUTS=['hanafi.json','shafii.json','maliki-hanbali.json','other-schools.json']
TYPE={'abridgment':'abridgement','hashiya':'gloss','sharh':'commentary',
      'verse rendering':'versification','critical commentary':'critical_commentary',
      'authorial elucidation':'authorial_elucidation'}

def normalized(value):
    value=unicodedata.normalize('NFKD',value)
    return re.sub(r'[^\w]+','', ''.join(c for c in value if not unicodedata.combining(c)).lower())

def read(name):
    return json.loads((ROOT/'research'/name).read_text())

def main():
    works=[]; sources={}; relations=[]; ids=set()
    for name in INPUTS:
        data=read(name)
        for s in data['sources']:
            assert s.get('url','').startswith('https://'), ('source URL',s)
            if s['id'] in sources:
                assert sources[s['id']]['url']==s['url'], ('conflicting source',s['id'])
            sources[s['id']]=s
        for original in data['works']:
            w=dict(original)
            assert w['id'] not in ids, ('duplicate ID',w['id'])
            assert w['discipline']=='fiqh', ('non-fiqh counted',w['id'])
            assert w.get('title') and w.get('author') and w.get('source_ids'), ('incomplete identity',w['id'])
            assert w['school'] in SCHOOLS, w['school']
            for field in ['author_death_ah','author_death_ce']:
                if isinstance(w.get(field),str) and w[field].isdigit(): w[field]=int(w[field])
                assert w.get(field) is None or isinstance(w[field],int), (w['id'],field,w.get(field))
            date_range=w.get('author_death_ce_range')
            if date_range:
                assert len(date_range)==2 and all(isinstance(x,int) for x in date_range), (w['id'],'date range')
                w.setdefault('timeline_ce',sum(date_range)/2)
                w.setdefault('timeline_is_proxy',True)
                w.setdefault('timeline_basis','midpoint of a reported CE year range')
            if not w.get('date_label'):
                dates=[]
                if w.get('author_death_ah'): dates.append(str(w['author_death_ah'])+' AH')
                if date_range: dates.append('–'.join(str(x) for x in date_range)+' CE')
                elif w.get('author_death_ce'): dates.append(str(w['author_death_ce'])+' CE')
                w['date_label']='d. '+' / '.join(dates) if dates else 'Date not established'
            w['date_note']=' '.join(dict.fromkeys(filter(None,[
                w.get('date_note') or 'Author-death chronology, not a composition date. Any conversion from AH to CE is an approximate display anchor.',
                w.get('author_death_note'),
                'The timeline uses the midpoint of the reported CE range, not an exact death year.' if date_range else None])))
            ids.add(w['id']);works.append(w)
        for i,e in enumerate(data.get('relations',[])+data.get('qualified_relations',[])):
            e=dict(e)
            e['type']=TYPE.get(e['type'],e['type'])
            e['id']=e.get('id') or 'rel_'+e['from']+'__'+e['to']+'__'+e['type']
            if e['type'] in ['synthesis_source','reworking','adaptation','textual_use']:
                e.setdefault('confidence','qualified bibliographical relationship')
            else: e.setdefault('confidence','bibliographically attested')
            e.setdefault('note','The cited bibliographical source identifies this textual relationship. This is not a completed passage-by-passage collation.')
            relations.append(e)
    assert len(ids)==len(works)
    for w in works:
        assert all(s in sources for s in w['source_ids']), ('unknown work source',w['id'])
    edge_keys=set()
    for e in relations:
        assert e['from'] in ids and e['to'] in ids and e['from']!=e['to'], ('invalid endpoints',e)
        assert e.get('evidence_source_ids') and all(s in sources for s in e['evidence_source_ids']), ('unknown edge source',e)
        key=(e['from'],e['to'],e['type'])
        assert key not in edge_keys, ('duplicate edge',key)
        edge_keys.add(key)
    # Exact title/author duplicates are an error; more complex homonyms remain
    # an editorial question, not an automated fuzzy-merge operation.
    exact=set()
    for w in works:
        key=(w['school'],normalized(w.get('title_ar') or w['title']),normalized(w['author']))
        assert key not in exact, ('duplicate work identity',w['id'])
        exact.add(key)
    counts=Counter(w['school'] for w in works)
    dated=sum(w.get('author_death_ah') is not None or w.get('author_death_ce') is not None for w in works)
    positioned=sum(w.get('author_death_ah') is not None or w.get('author_death_ce') is not None or w.get('timeline_ce') is not None for w in works)
    used={s for w in works for s in w['source_ids']}|{s for e in relations for s in e['evidence_source_ids']}
    sources={s:v for s,v in sources.items() if s in used}
    # These are identity mappings to an already pinned reader, not new claims
    # about composition locations. They preserve the existing location dossiers.
    pinned={
      ('hanafi','المبسوط'):'sarakhsi_mabsut',
      ('shafii','الأم'):'shafii_umm',
      ('shafii','منهاج الطالبين'):'nawawi_minhaj',
      ('hanbali','المغني لابن قدامة'):'ibn_qudama_mughni',
      ('maliki','بداية المجتهد ونهاية المقتصد'):'ibn_rushd_bidaya',
      ('maliki','الموطأ'):'muwatta'}
    for w in works:
        for (school,title),reader in pinned.items():
            if w['school']==school and normalized(w.get('title_ar',''))==normalized(title):
                if reader=='sarakhsi_mabsut' and 'sarakhs' not in normalized(w['author']): continue
                if reader=='ibn_qudama_mughni' and 'qudama' not in normalized(w['author']): continue
                w['reader_id']=reader
    summary={'distinct_works':len(works),'school_counts':dict(counts),'author_dated_works':dated,
      'timeline_anchored_works':positioned,'qualified_anchor_only_works':positioned-dated,
      'undated_works':len(works)-positioned,'relationships':len(relations),'source_records':len(sources),
      'distinct_source_urls':len({s['url'] for s in sources.values()}),
      'source_domains':sorted({urlsplit(s['url']).netloc for s in sources.values()})}
    result={'metadata':{'version':'fiqh-research-2026-11-10','updated':'2026-11-10','summary':summary,
      'counting_policy':'One authored work per reviewed identity; alternate titles and editions are not additional works. The imported source catalogues are a separate unreconciled layer.',
      'scope':'Substantial, selected historical fiqh bibliography. Not an exhaustive enumeration of every school; no claim of full-text acquisition or critical collation.',
      'chronology_policy':'Author death is an explicitly labelled proxy. Composition dates, when supplied, remain separate. Unknown dates and places are not invented.',
      'relationship_policy':'Base/source to derivative. Commentary, gloss, abridgement, versification, and qualified synthesis are distinct. School membership or chronology alone creates no edge.'},
      'works':works,'sources':list(sources.values()),'relations':relations}
    (ROOT/'fiqh-research.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    benchmark=read('hanafi-benchmark-source.json')
    bid={w['id'] for w in benchmark['works']}
    assert len(bid)==len(benchmark['works'])==84
    assert sum(w['benchmark_group']=='core68' for w in benchmark['works'])==68
    assert all(e['from'] in bid and e['to'] in bid for e in benchmark['relations'])
    assert len(benchmark['raw_relations'])==len(benchmark['relations'])+len(benchmark['contextual_relations'])==92
    (ROOT/'hanafi-atlas-benchmark.json').write_text(json.dumps(benchmark,ensure_ascii=False,indent=2)+'\n')
    build_page(result,benchmark)
    print(json.dumps(summary,ensure_ascii=False,indent=2))

def build_page(data,benchmark):
    e=html.escape
    s=data['metadata']['summary']; sources={x['id']:x for x in data['sources']}
    school_rows=''.join('<tr><th>'+e(SCHOOLS[k])+'</th><td>'+str(v)+'</td></tr>' for k,v in s['school_counts'].items())
    rows=[]
    for w in sorted(data['works'],key=lambda w:(list(SCHOOLS).index(w['school']),w.get('author_death_ah') or 9999,w['title'])):
        link='../#view=network&subject=fiqh&source_tier=research&work_id='+quote('fq:'+w['id'])
        citations=' '.join('<a target="_blank" rel="noopener noreferrer" href="'+e(sources[i]['url'])+'">['+str(j+1)+'] '+e(sources[i]['title'])+'</a>' for j,i in enumerate(w['source_ids']))
        date=w.get('date_label') or ('d. '+str(w['author_death_ah'])+' AH' if w.get('author_death_ah') else ('d. '+str(w['author_death_ce'])+' CE' if w.get('author_death_ce') else 'Date not established'))
        rows.append('<tr data-school="'+e(w['school'])+'"><td>'+e(SCHOOLS[w['school']])+'</td><td><a href="'+link+'">'+e(w['title'])+'</a><div lang="ar" dir="rtl">'+e(w.get('title_ar',''))+'</div></td><td>'+e(w['author'])+'<small>'+e(date)+'</small></td><td>'+e(w.get('genre',''))+'</td><td class="evidence">'+citations+'</td></tr>')
    content='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fiqh corpus and Hanafi Atlas comparison · GNAMMA</title><style>
:root{color-scheme:light dark;--paper:#faf8f2;--ink:#253b39;--line:#d5ddd5;--link:#226a62}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:17px/1.65 system-ui,sans-serif}main{max-width:1280px;margin:auto;padding:2rem}h1{max-width:900px;font:600 clamp(2rem,4vw,3rem)/1.12 Georgia,serif}h2{margin-top:2rem;font-family:Georgia,serif}a{color:var(--link)}.eyebrow{letter-spacing:.14em;font-size:.8rem}nav{display:flex;gap:1.4rem;flex-wrap:wrap}.metrics{display:flex;gap:1rem;flex-wrap:wrap;margin:1.7rem 0}.metrics div{padding:1rem 1.4rem;border:1px solid var(--line);border-radius:10px}.metrics strong{display:block;font-size:2rem}.metrics span,small{display:block;font-size:.8rem}.table-wrap{overflow:auto}table{border-collapse:collapse;width:100%;font-size:.9rem}td,th{padding:.8rem;border-bottom:1px solid var(--line);text-align:start;vertical-align:top}th{font-weight:650}td[lang=ar],td div[lang=ar]{font-size:1.1rem;line-height:1.9}.evidence{min-width:200px;max-width:330px}.evidence a{display:block;font-size:.76rem;margin:.2rem 0}.controls{display:flex;gap:1rem;flex-wrap:wrap;margin:1rem 0}input,select{font:inherit;padding:.65rem;border:1px solid var(--line);border-radius:6px;max-width:100%}input{flex:1;min-width:220px}.note{padding:1rem 1.2rem;border-left:3px solid var(--link);background:#edf1eb}footer{margin:3rem 0 0;padding-top:1rem;border-top:1px solid var(--line);font-size:.8rem}@media(prefers-color-scheme:dark){:root{--paper:#172321;--ink:#e1e6df;--line:#3a504a;--link:#9acabc}.note{background:#243530}}@media(max-width:600px){main{padding:1.1rem}td,th{padding:.6rem}.metrics div{flex:1;min-width:130px}}
</style></head><body><main><nav><a href="../#subject=fiqh">Open fiqh atlas</a><a href="../#subject=biography">Hanafi biographical catalogue</a><a href="fiqh-research.json" download>Download research JSON</a><a href="hanafi-atlas-benchmark.json" download>Download benchmark JSON</a></nav>
<p class="eyebrow">GNAMMA RESEARCH · 10 NOVEMBER 2026</p><h1>Fiqh books, textual relationships, and the Hanafi Atlas benchmark</h1>
<p>The atlas now distinguishes researched authored works from imported catalogue records. All works are browsable, including those whose commentaries or locations have not yet been established.</p>'''
    content+='<div class="metrics">'+''.join('<div><strong>'+str(value)+'</strong><span>'+label+'</span></div>' for value,label in [(s['distinct_works'],'distinct fiqh works'),(s['relationships'],'documented or qualified textual links'),(s['distinct_source_urls'],'individual source URLs'),(len(benchmark['works']),'Hanafi historical sources')])+'</div>'
    content+='<h2>Coverage by tradition</h2><table><thead><tr><th>Tradition</th><th>Researched works</th></tr></thead><tbody>'+school_rows+'</tbody></table>'
    content+='<p>'+str(s['author_dated_works'])+' works have cited numerical author-death years; '+str(s['qualified_anchor_only_works'])+' additional work has a qualified boundary date. '+str(s['undated_works'])+' remain unplaced. Labels distinguish reported years, ranges, and approximate AH-to-CE conversions; none is a composition date. The smaller non-four-school registers are initial selections, and none of these totals claims an exhaustive bibliography.</p>'
    features=[
      ('Catalogue coverage','68 core biographical entries plus 16 supplementary sources','84 records indexed under Biography & ṭabaqāt, with attribution, disputed-title warnings, survival status and original links.'),
      ('Books available to read','Material for 23 books in the original reading collection','External links to the original work profiles and catalogue; reading material for 23 books remains on the original site.'),
      ('Substantive fiqh','The comparator is a biographical atlas','A separate register of '+str(s['distinct_works'])+' authored fiqh works; biographies do not inflate this total.'),
      ('Source and reception network','Work-centred antecedents and dependants; contextual teacher and family ties','The interactive network includes '+str(s['relationships'])+' fiqh relations and 74 benchmark textual relations. The benchmark’s 18 teacher/family ties remain separately recorded in the downloadable data, not drawn as textual dependence.'),
      ('School selection','A Hanafi historical focus','Visible school counts; the timeline, catalogue, search and network share one interface.'),
      ('Geographical map','Source-qualified geographical placements and regional chapters','Partial: the existing 41-event map remains available across subjects. Benchmark regional labels are visible in work profiles, but its place associations have not been integrated as map events. Death dates never imply composition places.'),
      ('Timeline visibility','Century navigation','Books by century is the opening view. All works are browsable by default; a lack of recorded relationships no longer hides them.'),
      ('AH centuries and literary forms','AH-century buttons and manāqib, ṭabaqāt, faḍāʾil, history and defence filters','Partial: work profiles preserve AH dates and literary form; the book timeline uses CE/BCE and has no literary-form filter. The geographical view has separate AH-century controls.'),
      ('Named-person dossiers','A name index and cross-book occurrences, distinguishing biographical subjects and narrators','Not yet integrated for the benchmark. Author/title search and the early-jurist register do not index all people mentioned inside the texts.'),
      ('Report search and parallel passages','Arabic/English/report-number search, book filters, and reports occurring in multiple books','Not yet integrated for the benchmark. The atlas searches work metadata and documents work-level relationships; it has no imported report-text concordance.'),
      ('Imported bibliographies','Not the basis of this comparison','The existing OpenITI and Alreq records remain accessible as a separate, potentially overlapping metadata layer.')]
    content+='<h2>Feature comparison and current limits</h2><div class="table-wrap"><table><thead><tr><th>Feature</th><th>Hanafi Atlas benchmark</th><th>GNAMMA now</th></tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+e(v)+'</td>' for v in row)+'</tr>' for row in features)+'</tbody></table></div>'
    content+='<p>Comparison checked against the benchmark’s <a href="https://www.hanafiatlas.com/catalogue">catalogue</a>, <a href="https://www.hanafiatlas.com/books">books</a>, <a href="https://www.hanafiatlas.com/network">source network</a>, <a href="https://www.hanafiatlas.com/scholars">scholars</a>, <a href="https://www.hanafiatlas.com/reports">reports</a>, and <a href="https://www.hanafiatlas.com/regions">regions</a> pages. Expanded book counts do not imply that the original reader and report features have been reproduced.</p>'
    content+='<p class="note">Bibliographic identity, textual dependence, dating, geographic location, and critical textual verification are separate claims. Each needs its own evidence. A title’s presence in a catalogue does not prove that we have acquired or collated the text.</p>'
    content+='<h2>Browse the researched books and sources</h2><div class="controls"><input id="search" type="search" aria-label="Find a work or author" placeholder="Find title or author…"><select id="school" aria-label="Choose a legal tradition"><option value="">All traditions</option>'+''.join('<option value="'+k+'">'+e(v)+'</option>' for k,v in SCHOOLS.items() if k in s['school_counts'])+'</select></div><p id="count" role="status">'+str(s['distinct_works'])+' works</p><div class="table-wrap"><table id="books"><thead><tr><th>Tradition</th><th>Work · open network</th><th>Author · death anchor</th><th>Form</th><th>Cited sources</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table></div>'
    content+='''<footer>Hanafi benchmark metadata is credited to <a href="https://www.hanafiatlas.com/catalogue">Hanafi Biographical Atlas</a>, drawing on Huzeyfe Çeker’s research. See its <a href="https://www.hanafiatlas.com/about">method and reuse statement</a>. Research source links are attached to individual work records. This release excludes modern Salafi commentary expansion and preserves historical Hanbali literature.</footer></main><script>
const query=document.querySelector('#search'),school=document.querySelector('#school'),rows=[...document.querySelectorAll('#books tbody tr')];
const norm=s=>s.normalize('NFKD').replace(/[\\u0300-\\u036f\\u064b-\\u065f\\u0670\\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/[ʿʾ’']/g,'').toLowerCase();
function filter(){let count=0;const q=norm(query.value);for(const r of rows){r.hidden=!!((school.value&&r.dataset.school!==school.value)||(q&&!norm(r.textContent).includes(q)));if(!r.hidden)count++}document.querySelector('#count').textContent=count+' works'}
query.addEventListener('input',filter);school.addEventListener('change',filter);
</script></body></html>'''
    (ROOT/'fiqh-coverage.html').write_text(content+'\n')

if __name__=='__main__': main()
