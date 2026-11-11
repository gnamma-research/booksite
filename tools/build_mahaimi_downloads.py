#!/usr/bin/env python3
"""Typeset the canonical Mahaimi/Qunawi corpus as three navigable PDF editions.

Install: pip install weasyprint markdown
Run: python tools/build_mahaimi_downloads.py --format all
Arabic shaping and bidirectional layout are provided by Pango through WeasyPrint.
The input is data/parallel.json; this script does not edit or translate the text.
"""
import argparse
import hashlib
import html
import json
import logging
import re
from datetime import date
from pathlib import Path

import markdown
from weasyprint import HTML

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'texts/al-mahaimi/mashra-al-khusus'
SITE = 'https://gnamma-research.github.io/booksite/texts/al-mahaimi/mashra-al-khusus/'
AR_TITLE = 'مشرع الخصوص إلى معاني النصوص'
EN_TITLE = 'Mashraʿ al-khuṣūṣ ilā maʿānī al-nuṣūṣ'

CSS = '''
@page {
  size: A4; margin: 21mm 20mm 20mm;
  @top-left { content: string(work); font: 8pt "DejaVu Sans"; color: #67716f; }
  @top-right { content: string(sourcepage); font: 8pt "DejaVu Sans"; color: #67716f; }
  @bottom-left { content: "NAMA  /  Source-based working edition"; font: 7.5pt "DejaVu Sans"; color: #67716f; }
  @bottom-right { content: counter(page); font: 9pt "DejaVu Sans"; color: #253a37; }
}
@page cover { margin: 24mm 24mm; @top-left {content:none} @top-right {content:none} @bottom-left {content:none} @bottom-right {content:none} }
* { box-sizing: border-box; }
body { font-family: "DejaVu Serif", serif; color: #202b2a; font-size: 10.7pt; line-height: 1.52; }
p { margin: 0 0 3.4mm; orphans: 3; widows: 3; }
a { color: #346960; text-decoration: none; }
strong { font-weight: 700; }
h1,h2,h3,h4 { font-family: "DejaVu Sans", sans-serif; color: #173e38; line-height: 1.3; break-after: avoid; }
h1 {font-size:25pt; margin:0 0 9mm; bookmark-level:1;}
h2 {font-size:18pt; margin:0 0 7mm; bookmark-level:1;}
h3 {font-size:13pt; margin:0 0 6mm; bookmark-level:2;}
h4 {font-size:10pt; margin:5mm 0 3mm; bookmark-level:none;}
.cover { page:cover; break-after:page; padding-top:28mm; }
.cover .imprint {font:10pt "DejaVu Sans"; letter-spacing:3px; color:#346960; margin-bottom:24mm;}
.cover .arabic-title {font:30pt/1.6 "Noto Naskh Arabic", serif; direction:rtl; color:#173e38; margin-bottom:12mm;}
.cover h1 {font-size:25pt; margin-bottom:8mm; bookmark-level:none;}
.cover .author {font-size:13pt; margin:9mm 0;}
.cover .rule {height:1.2mm; width:28mm; background:#ae9665; margin:13mm 0;}
.cover .edition-label {font:11pt/1.6 "DejaVu Sans"; color:#344e48;}
.cover .date {margin-top:18mm; font:9pt "DejaVu Sans"; color:#67716f;}
.front {break-before:page;}
.front p,.front li {font-size:10.4pt;}
.front .source {overflow-wrap:anywhere; font-size:9pt;}
.toc {list-style:none; padding:0; margin:9mm 0;}
.toc li {padding:5mm 0; border-bottom:.2mm solid #d6dfdb;}
.toc a::after {content:target-counter(attr(href),page); float:right; font-family:"DejaVu Sans";}
.part {break-before:page; padding:20mm 0 14mm;}
.part .work-marker {string-set:work content(); font:9pt "DejaVu Sans"; color:#67716f;}
.part p {font-size:12pt; max-width:130mm;}
.entry {margin-top:9mm;}
.page-marker {break-after:avoid; string-set:sourcepage content(); font:8.8pt "DejaVu Sans"; letter-spacing:.3px; color:#637b71; margin:0 0 3mm;}
.entry h3 {border-bottom:.3mm solid #bccfc4; padding-bottom:4mm;}
.language-label {font:8pt "DejaVu Sans"; color:#637b71; letter-spacing:.6px; margin:5mm 0 3mm; break-after:avoid;}
.ar {font-family:"Noto Naskh Arabic", serif; font-size:14pt; line-height:1.72; direction:rtl; text-align:right;}
.ar p {margin-bottom:3.7mm;}
.ar strong {font-family:"Noto Naskh Arabic",serif;}
.english {font-size:10.7pt;}
.bilingual .english {margin-top:5mm;}
.bilingual .language-label {border-top:.2mm solid #d5dfda; padding-top:4mm;}
.entry-source {break-after:avoid; font:7.5pt/1.5 "DejaVu Sans"; color:#68746e; margin-bottom:5mm;}
.note {font:8.7pt/1.5 "DejaVu Sans"; color:#455a50; background:#f2f5f0; padding:4mm; margin:7mm 0 0;}
.note .note-title {font-weight:bold; margin-bottom:2mm;}
.note p:last-child {margin-bottom:0;}
.ar-only .entry h3 {font:18pt "Noto Naskh Arabic"; direction:rtl;}
.ar-only .ar {font-size:15pt; line-height:1.8;}
.back {break-before:page;}
.back table {border-collapse:collapse; width:100%; font-size:8.5pt; table-layout:fixed;}
.back td,.back th {padding:2mm; border-bottom:.2mm solid #ccd7cf; overflow-wrap:anywhere; vertical-align:top;}
.back th {font-family:"DejaVu Sans";text-align:left;}
.back tr {break-inside:avoid;}
.small {font:9pt/1.6 "DejaVu Sans"; color:#586a62;}
'''


def prose(value):
    # Corpus HTML is text. Only ordinary Markdown emphasis and paragraphs render.
    return markdown.markdown(html.escape(value), extensions=['tables'])


def document(corpus, ledger, mode):
    labels = {'english':'English translation', 'bilingual':'Arabic and English', 'arabic':'Arabic source text'}
    css_class = 'ar-only' if mode == 'arabic' else mode
    bits = [f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{html.escape(EN_TITLE)} · {labels[mode]}</title>',
            '<meta name="author" content="NAMA / Gnamma Research"><meta name="description" content="A source-based working edition of al-Mahaimi’s commentary and Qunawi’s separate original text.">',
            f'<style>{CSS}</style></head><body class="{css_class}">',
            '<section class="cover"><div class="imprint">NAMA  /  AKBARI TEXTS</div>',
            f'<div class="arabic-title" lang="ar">{AR_TITLE}</div>',
            f'<h1>{EN_TITLE}</h1><p class="author">ʿAlāʾ al-Dīn ʿAlī al-Mahāʾimī</p>',
            '<p>With Ṣadr al-Dīn al-Qūnawī’s <em>al-Nuṣūṣ</em></p><div class="rule"></div>',
            f'<p class="edition-label">{labels[mode]}<br>Complete source-based working edition</p>',
            '<p class="small">Commentary: printed pp.11–232<br>Qūnawī’s separate original: printed pp.235–267</p>',
            f'<p class="date">{date.fromisoformat(ledger["date"]).strftime("%d %B %Y").lstrip("0")} · Stage {ledger["stage"]}</p></section>',
            '<section class="front" id="edition"><h2>About this edition</h2>',
            '<p>This volume contains the complete available Arabic text and a working English translation of al-Mahāʾimī’s commentary in the 2008 Beirut printing, together with the separate text of Qūnawī’s <em>al-Nuṣūṣ</em> appended to that printing. Coverage comprises 222 commentary pages and 33 appendix pages.</p>',
            '<p>The source is the edition prepared by Aḥmad Farīd al-Mazīdī (Dār al-Kutub al-ʿIlmiyya, 2008), consulted through a print scan and an electronic transcription. Arabic source availability, translation review and manuscript collation are separate matters. This is a source-based working edition; it does not claim independent establishment of the medieval text from manuscripts.</p>',
            '<p><strong>Printed pages 113–114 are missing from the acquired scan.</strong> Their electronic text is included, with that limitation recorded. The final commentary sentence on p.232 breaks off in the printing itself. Its missing continuation is not invented. Qūnawī’s separate ending on p.267 is retained as a separate text.</p>',
            '<p>Modern editorial footnotes are excluded from the medieval running text. Editorial headings, English speaker labels and square-bracketed explanations belong to this reading edition. Quotations and reports are translated as the authors present them; their inclusion does not certify a report’s authenticity. Difficult readings and necessary interpretation are marked where identified.</p>',
            '<p>Source page numbers accompany every section. They are distinct from this PDF’s pagination. Sentences may continue over a source page boundary. English choices vary with context; a single Arabic philosophical term need not have one mechanically fixed English equivalent.</p>',
            f'<p>At this checkpoint, {ledger["counts"]["commentary_pages_reviewed_against_arabic"]} of 222 commentary pages have been reviewed against the available Arabic; {ledger["counts"]["commentary_pages_with_documented_scan_comparison"]} have documented print-image comparison. Review does not resolve every defective reading. In particular, the first passage on printed p.43 retains an explicitly marked synopsis of an unstable argument. Such passages are not certified as complete literal reconstructions.</p>',
            f'<p class="source">Print scan: <a href="https://archive.org/details/machra3-khosous">archive.org/details/machra3-khosous</a><br>Reader, exact review ledger and source notes: <a href="{SITE}">{SITE}</a></p>',
            '<p class="small">The original medieval works are public-domain texts. The modern source’s page layout and full editorial apparatus are not reproduced here.</p></section>',
            '<section class="front"><h2>Contents</h2><ul class="toc"><li><a href="#commentary">Al-Mahāʾimī’s commentary · printed pp.11–232</a></li><li><a href="#original">Qūnawī’s separate original · printed pp.235–267</a></li><li><a href="#notes">Textual notes and source information</a></li></ul>',
            '<p class="small">The PDF bookmark panel lists every source-page section. The online reader also provides Arabic and English search, cross-references and bookmarks.</p></section>']
    layer = None
    for e in corpus:
        is_commentary = e['edition_layer'] == 'commentary'
        if e['edition_layer'] != layer:
            part_id = 'commentary' if is_commentary else 'original'
            work = 'Al-Mahāʾimī · commentary' if is_commentary else 'Qūnawī · al-Nuṣūṣ'
            title = 'Al-Mahāʾimī’s commentary' if is_commentary else 'Qūnawī’s separate original'
            desc = 'The quoted lemmata of Qūnawī are retained within al-Mahāʾimī’s explanation.' if is_commentary else 'The Arabic text printed separately on pp.235–267 of the same modern volume. This is not an independent manuscript witness.'
            bits.append(f'<section class="part" id="{part_id}"><p class="work-marker">{work}</p><h2>{title}</h2><p>{desc}</p></section>')
            layer = e['edition_layer']
        a,b = e['printed_pages']
        page_label = str(a) if a==b else f'{a}–{b}'
        title = f'الصفحة {page_label}' if mode=='arabic' else e['title']
        bits.append(f'<section class="entry" id="{e["id"]}"><p class="page-marker">Printed p. {page_label}</p><h3>{html.escape(title)}</h3>')
        bits.append(f'<p class="entry-source">{e["id"]} · <a href="{html.escape(e["source_url"],quote=True)}">Arabic source</a> · {"Al-Mahāʾimī" if is_commentary else "Qūnawī"}</p>')
        # Preserve existing passage boundaries. Long page pairs flow naturally,
        # avoiding unbreakable table rows that can clip Arabic or translation.
        for pair in e['pairs']:
            if mode in ('arabic','bilingual'):
                if mode=='bilingual': bits.append('<p class="language-label">ARABIC</p>')
                bits.append(f'<div class="ar" lang="ar" dir="rtl">{prose(pair["ar"])}</div>')
            if mode in ('english','bilingual'):
                if mode=='bilingual': bits.append('<p class="language-label">ENGLISH</p>')
                bits.append(f'<div class="english">{prose(pair["en"])}</div>')
        if e.get('editorial_note') and mode!='arabic':
            bits.append('<aside class="note"><p class="note-title">Editorial note</p>'+prose(e['editorial_note'])+'</aside>')
        bits.append('</section>')
    bits.append('<section class="back" id="notes"><h2>Textual notes and sources</h2>')
    notes = BASE/'editorial/TEXTUAL_NOTES.md'
    if notes.exists():
        text = notes.read_text(encoding='utf-8')
        # Skip the title already supplied by the book design.
        text = '\n'.join(text.splitlines()[1:])
        bits.append(prose(text))
    else:
        bits.append('<p>The commentary’s incomplete final clause is present in the 2008 printing. It is not completed by importing Qūnawī’s separate final paragraph. No independent manuscript collation has been performed.</p>')
    bits.append(f'<p class="source">The current source register, page-by-page review record, glossary, historical drafts and downloadable corpus accompany the reader at <a href="{SITE}">{SITE}</a>.</p>')
    bits.append('</section></body></html>')
    return ''.join(bits)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--format',choices=['english','bilingual','arabic','all'],default='all')
    parser.add_argument('--output-dir',type=Path,default=BASE/'downloads')
    parser.add_argument('--html-only',action='store_true')
    args=parser.parse_args()
    logging.getLogger('weasyprint').setLevel(logging.ERROR)
    corpus=json.loads((BASE/'data/parallel.json').read_text())
    ledger_path=max((BASE/'data').glob('coverage-stage*.json'),key=lambda p:int(re.search(r'stage(\d+)',p.name).group(1)))
    ledger=json.loads(ledger_path.read_text())
    args.output_dir.mkdir(parents=True,exist_ok=True)
    modes=['english','bilingual','arabic'] if args.format=='all' else [args.format]
    report=[]
    for mode in modes:
        text=document(corpus,ledger,mode)
        if args.html_only:
            out=args.output_dir/f'mahaimi-{mode}.html';out.write_text(text,encoding='utf-8')
            print(out,flush=True);continue
        out=args.output_dir/f'mahaimi-{mode}.pdf'
        rendered=HTML(string=text,base_url=str(BASE)).render()
        rendered.write_pdf(out)
        item={'file':out.name,'pages':len(rendered.pages),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}
        report.append(item);print(json.dumps(item),flush=True)
    if report:
        path=args.output_dir/'pdf-build-manifest.json'
        current=json.loads(path.read_text()) if path.exists() else {'schema':'mahaimi-pdf-build-v1','files':[]}
        by_name={x['file']:x for x in current['files']};by_name.update({x['file']:x for x in report})
        current.update({'date':ledger['date'],'canonical_corpus_sha256':hashlib.sha256((BASE/'data/parallel.json').read_bytes()).hexdigest(),'files':list(by_name.values())})
        path.write_text(json.dumps(current,indent=2)+'\n')


if __name__=='__main__':
    main()
