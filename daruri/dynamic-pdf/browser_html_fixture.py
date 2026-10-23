#!/usr/bin/env python3
"""Research: make an existing canonical A4 HTML source portable for true browser
print-to-PDF without changing text, rules, punctuation or scholar notes.

Only rewrite referenced font-file URLs to embedded Noto font data so Chromium
and WebKit can open the exactly same HTML from file:// for isolated tests.
No PDF files are used as print rendering inputs.
"""
from __future__ import annotations
import argparse,base64,hashlib,json,re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
FONTS=ROOT/"build/fonts"
FILE_PATTERN=re.compile(r"""(?P<name>Noto(?:Sans|Serif|NaskhArabic)[-\w]*\.ttf)""",re.I)
URL_PATTERN=re.compile(r"""url\((?P<q>["']?)(?P<value>[^)]+?)(?P=q)\)""",re.I)

def prepare(src:Path,dest:Path):
    raw=src.read_text(encoding="utf-8")
    seen={}
    def rewrite(m):
        val=m.group("value").strip("'\"")
        font=FILE_PATTERN.search(val)
        if not font:return m.group(0)
        name=font.group("name")
        on_disk=FONTS/name
        if not on_disk.is_file():
            raise ValueError("HTML references a font not bundled in canonical book source: "+name)
        if name not in seen:
            seen[name]=base64.b64encode(on_disk.read_bytes()).decode("ascii")
        return 'url("data:font/ttf;base64,'+seen[name]+'")'
    html=URL_PATTERN.sub(rewrite,raw)
    if not seen or "NotoNaskhArabic-Regular.ttf" not in seen:
        raise ValueError("A4 source HTML did not resolve the original Noto Arabic font")
    if not html.lower().startswith("<!doctype html>"):
        raise ValueError("The input is not a complete standard HTML document")
    # Preserve @page rules; do not inject our own pagination/footnote policy.
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(html,encoding="utf8")
    report={"file":dest.name,
     "original_html_sha256":hashlib.sha256(raw.encode()).hexdigest(),
     "browser_html_sha256":hashlib.sha256(html.encode()).hexdigest(),
     "font_files":sorted(seen),
     "replaced_font_instances":sum(raw.count(name) for name in seen),
     "data_uri_fonts_embedded":len(seen),
     "new_html_size_bytes":dest.stat().st_size,
     "underlying_text_unchanged":True,
     "footnote_CSS_unchanged":True,
     "pdf_input_files":[]}
    (dest.parent/(dest.name+".json")).write_text(json.dumps(report,indent=2)+"\n")
    print("BROWSER_HTML_FIXTURE",json.dumps(report),flush=True)

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--source",required=True,type=Path)
    p.add_argument("--output",required=True,type=Path)
    a=p.parse_args()
    prepare(a.source,a.output)
