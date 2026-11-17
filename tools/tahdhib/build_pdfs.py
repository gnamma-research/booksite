#!/usr/bin/env python3
"""Generate reproducible A4 Tahdhīb PDFs from each versioned bilingual corpus."""
import argparse, html, json, pathlib, re
from weasyprint import HTML

p=argparse.ArgumentParser()
p.add_argument('--corpus',required=True)
p.add_argument('--output',required=True)
args=p.parse_args()
raw=pathlib.Path(args.corpus).read_text(encoding='utf-8').strip()
raw=re.sub(r'^window\.GNAMMA_CRITICAL_CORPUS\s*=\s*','',raw)
corpus=json.loads(raw.rstrip('; \n'))
assert len(corpus['units']) in (19,1044),'Unexpected edition contents'
out=pathlib.Path(args.output);out.mkdir(parents=True,exist_ok=True)
slug='logic' if len(corpus['units'])==19 else 'kalam'
font=pathlib.Path('/usr/share/fonts/opentype/fonts-hosny-amiri/Amiri-Regular.ttf')
if not font.exists():font=pathlib.Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
def esc(s):return html.escape(str(s or ''),quote=True)
css="""
@font-face {font-family:AmiriLocal;src:url("FONT_URL") format("truetype");}
@page {size:A4;margin:19mm 16mm 18mm;@top-center{content:"GNAMMA RESEARCH   ·   TAHDHIB WORKING EDITION";font:8pt sans-serif;color:#777;}@bottom-center{content:counter(page);font:9pt sans-serif;color:#777;}}
*{box-sizing:border-box}html,body{padding:0;margin:0}body{color:#222;background:white;font:11pt/1.65 Georgia,'DejaVu Serif',serif}
h1{font-size:24pt;line-height:1.3;font-weight:500;margin:0}h1 .arabic-title{font:24pt/1.6 AmiriLocal,serif;display:block;direction:rtl;text-align:left}
h2{font-size:13pt;color:#25584f;border-bottom:1px solid #aab9b1;padding-bottom:4pt;margin:15pt 0 10pt}
.meta{font:9pt/1.55 sans-serif;color:#555}.status{font:9pt/1.55 sans-serif;background:#f0f4f1;border-left:2pt solid #58796b;padding:8pt 10pt;margin:13pt 0 18pt}
.unit{margin:0 0 11pt;padding:0 0 8pt;border-bottom:.35pt solid #ddd;break-inside:avoid-page}
.unit-id{font:8pt/1.4 sans-serif;color:#546b63;margin-bottom:4pt}.source-locus{font:7.6pt/1.4 sans-serif;color:#777;margin-top:1pt}
.grid{display:table;width:100%;table-layout:fixed}.en,.ar{display:table-cell;vertical-align:top}.en{padding-right:12pt;font:10pt/1.65 'DejaVu Serif',Georgia,serif}.ar{padding-left:12pt;border-left:.35pt solid #dadeda;text-align:right;direction:rtl;font:15.5pt/1.9 AmiriLocal,'DejaVu Sans',serif}
.en-only .en,.ar-only .ar{display:block;width:100%;border:0;padding:0}.en-only .ar,.ar-only .en{display:none}
.en-only .en{font-size:11pt}.ar-only .ar{font-size:18pt;line-height:1.95}
p{margin:0;overflow-wrap:break-word}.endnotes{font:8pt/1.5 sans-serif;color:#777;margin-top:14pt}
""".replace('FONT_URL',font.as_uri())
for kind in ('parallel','en-only','ar-only'):
 parts=[f'<html><head><meta charset="utf-8"><style>{css}</style></head><body class="{kind}">',
   '<h1>'+esc(corpus['work'])+'<span class="arabic-title" lang="ar">'+esc(corpus['title_ar'])+'</span></h1>',
   '<p class="meta">Saʿd al-Dīn al-Taftāzānī · '+esc(corpus['edition'])+'</p>',
   '<p class="status"><b>Textual qualification.</b> '+esc(corpus['editorial_status'])+'</p>']
 last=None
 for unit in corpus['units']:
  pg=unit['page']
  if pg!=last:
   last=pg
   label='Editorial division '+str(pg) if slug=='logic' else 'Cairo 1912 printed page '+str(pg)
   parts.append('<h2>'+esc(label)+'</h2>')
  parts.append('<section class="unit"><div class="unit-id">'+esc(unit['id'])+'</div>')
  if unit.get('title'):parts.append('<p class="meta">'+esc(unit['title'])+'</p>')
  parts.append('<div class="grid"><div class="en"><p>'+esc(unit['en'])+'</p></div><div class="ar" lang="ar" dir="rtl"><p>'+esc(unit['ar'])+'</p></div></div></section>')
 parts.append('<p class="endnotes">Gnamma Research · Working edition; not a multi-witness critical text. Printed pages and editorial divisions are distinguished.</p></body></html>')
 path=out/f'tahdhib-{slug}-{kind}.pdf'
 HTML(string=''.join(parts),base_url=str(out)).write_pdf(str(path))
 print(path, round(path.stat().st_size/1024), 'KB')
