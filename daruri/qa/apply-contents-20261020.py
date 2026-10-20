"""Apply the reviewed contents-only change to the latest reader without replacing it."""
from pathlib import Path
from collections import Counter
import hashlib, html, json, re, subprocess

repo=Path(__file__).resolve().parents[2]
qa=repo/'daruri/qa'
page=repo/'daruri/index.html'
before=page.read_text()
assert 'id="gnamma-contents-routes-20261020"' not in before, 'Contents update already applied; inspect current source.'
start=before.index('function renderContents(){')
end=before.index('function renderStudy()',start)
assert hashlib.sha256(before[start:end].encode()).hexdigest()=='7fd69c4327adeea2c27570825d96a5cade44527d52384ba319c40042d2eab352', 'Contents implementation changed concurrently; merge it explicitly.'
functions=(qa/'contents-functions-20261020.js.txt').read_text()
parent={int(k):(None if v=='null' else int(v)) for k,v in re.findall(r'(\d+):(null|\d+)',functions.split('});',1)[0])}
assert len(parent)==46
book=json.loads(subprocess.check_output(['node','-e',"const fs=require('fs');console.log(JSON.stringify(require('./daruri/qa/load-book.js')(fs.readFileSync('daruri/index.html','utf8'))));"],cwd=repo,text=True))
sections={str(s['id']):s for s in book['sections']}
assert {int(s['id']) for s in book['sections'] if s['id']!='colophon' and s.get('headingAr')}==set(parent)

def block(source,cls):
    opening=f'<div class="{cls}">'
    assert source.count(opening)==1
    start=source.index(opening);depth=0
    for m in re.finditer(r'</?div\b[^>]*>',source[start:]):
        depth+=-1 if m.group().startswith('</') else 1
        if depth==0:return start,start+m.end(),source[start:start+m.end()]
    raise AssertionError('Unclosed '+cls)

def note(original):
    title='Headings in the Arabic edition' if original else 'Editorial section titles'
    desc=('46 headings recorded from the Arabic edition, arranged in their hierarchy. Generic headings such as “Chapter” are retained. The later colophon is listed separately.' if original else '258 descriptive titles, one for each section of the main text. These titles are supplied by the editor; the later colophon is listed separately.')
    return f'<header class="contents-mode-note"><h2>{title}</h2><p>{desc}</p></header>'

pdf_base=re.search(r'href="(daruri\.pdf[^"#]*)#page=\d+"',before).group(1)
def colophon(original):
    s=sections['colophon'];label=s['headingEn'] if original else s['title']
    ar=f'<bdi class="fb-toc-ar" lang="ar" dir="rtl">{html.escape(s["headingAr"])}</bdi>' if original else ''
    p=s['pdfPage'];pages=', '.join(map(str,s['pages']))
    return ('<section class="part-block contents-colophon"><header class="contents-record-heading"><h3>Later manuscript record</h3><p>Copyist’s colophon and ownership notice, separate from the authorial text.</p></header>'
        f'<div class="fb-toc-row" data-contents-record="colophon"><a href="#section=colophon">Colophon · {html.escape(label)}</a><small>Arabic pp. {pages} · <a href="{pdf_base}#page={p}" target="_blank" rel="noopener noreferrer" aria-label="Open bilingual PDF at page {p}">PDF {p} ↗</a></small>{ar}</div></section>')

start,end,original=block(before,'fb-toc-original')
rows={}
for m in re.finditer(r'<div class="fb-toc-row">.*?</div>',original,re.S):
    sid=int(re.search(r'href="#section=(\d+)"',m.group()).group(1));assert sid not in rows;rows[sid]=m.group()
assert set(rows)==set(parent)
def row(sid,root=False):
    s=rows[sid].replace('<div class="fb-toc-row">',f'<div class="fb-toc-row{" contents-source-root" if root else ""}" data-contents-source="{sid}">',1)
    s=s.replace('class="fb-toc-ar" dir="rtl"','class="fb-toc-ar" lang="ar" dir="rtl"')
    ar=re.search(r'<bdi class="fb-toc-ar" lang="ar" dir="rtl">.*?</bdi>',s).group()
    s=s.replace(ar,'',1).replace('</a>',ar+'</a>',1)
    if root:
        s,n=re.subn(r'(<a href="#section=\d+">.*?</a>)',rf'<h3 id="fb-contents-heading-{sid}">\1</h3>',s,count=1);assert n==1
    return s
def tree(p):
    children=[k for k,v in parent.items() if v==p]
    return '<ol class="contents-tree" role="list">'+''.join('<li>'+row(k)+tree(k)+'</li>' for k in children)+'</ol>' if children else ''
opening='<div class="contents-opening"><a href="#section=1">[Opening text · §§1–9]</a><p>No separate heading is recorded for the opening text; this label is a navigation aid.</p></div>'
parts=''.join(f'<section class="contents-source-part" aria-labelledby="fb-contents-heading-{sid}">'+row(sid,True)+tree(sid)+'</section>' for sid,p in parent.items() if p is None)
replacement='<div class="fb-toc-original">'+note(True)+opening+parts+colophon(True)+'</div>'
updated=before[:start]+replacement+before[end:]
start,end,editorial=block(updated,'fb-toc-editorial')
assert len(re.findall(r'<div class="fb-toc-row">',editorial))==258
replacement='<div class="fb-toc-editorial">'+note(False)+editorial[len('<div class="fb-toc-editorial">'):-6]+colophon(False)+'</div>'
updated=updated[:start]+replacement+updated[end:]
start=updated.index('function renderContents(){');end=updated.index('function renderStudy()',start)
updated=updated[:start]+functions+updated[end:]
old="if(el.dataset.contentsMode){e.preventDefault();state.contentsMode=el.dataset.contentsMode;renderContents();return}"
new="if(el.dataset.contentsMode){e.preventDefault();state.contentsMode=el.dataset.contentsMode;renderContents();$('#mainContent [data-contents-mode=\"'+state.contentsMode+'\"]')?.focus({preventScroll:true});return}"
assert updated.count(old)==1;updated=updated.replace(old,new)
marker='<style id="gnamma-five-pdf-editions-20261020">';assert updated.count(marker)==1
updated=updated.replace(marker,(qa/'contents-styles-20261020.html.txt').read_text()+'\n'+marker)

# Existing PDF destinations and all external guide/data scripts must survive.
pdf_links=lambda s:Counter(re.findall(r'<a\b[^>]*href="daruri\.pdf[^"#]*#page=\d+"[^>]*>.*?</a>',s))
assert not (pdf_links(before)-pdf_links(updated))
external=lambda s:re.findall(r'<script\b[^>]*src="[^"]+"[^>]*>.*?</script>',s)
assert external(before)==external(updated)
for tag in ('editionData','dictionaryData'):
    pattern=rf'<script[^>]*id="{tag}"[^>]*>[\s\S]*?</script>'
    assert re.findall(pattern,before)==re.findall(pattern,updated)
assert before.count('data-pdf-edition=')==updated.count('data-pdf-edition=')==10
page.write_text(updated)
sw=repo/'daruri/sw.js';s=sw.read_text()
s,n=re.subn(r"const NAME='[^']+'", "const NAME='daruri-reader-v20261020-contents-routes-v3'",s,count=1);assert n==1;sw.write_text(s)
print('Applied contents hierarchy and return fix; current PDFs and study-guide assets preserved.')
