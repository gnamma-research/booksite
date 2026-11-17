#!/usr/bin/env python3
"""Probe online Arabic authorial page text and HTML structures; no claims of full verification."""
from __future__ import annotations
import json, os, pathlib, re, time
import requests
from bs4 import BeautifulSoup

OUT=pathlib.Path("qa-artifacts/farghani-source-probe")
OUT.mkdir(parents=True,exist_ok=True)
pages=[18,19,32,48,52,60,61,74,85,101,125,143,144,145]
session=requests.Session()
session.headers.update({"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) scholarly historical text audit; GNAMMA", "Accept-Language":"ar,en;q=.8"})
summary=[]
for page in pages:
    url=f"https://ablibrary.net/book_content/b/9606/{page}?lang=ar"
    item={"page":page,"url":url}
    try:
        r=session.get(url,timeout=40)
        item.update(status=r.status_code,bytes=len(r.content),url_final=r.url)
        r.raise_for_status()
        soup=BeautifulSoup(r.content,"html.parser")
        item["title"]=soup.title.get_text(" ",strip=True) if soup.title else ""
        item["main_candidates"]=[]
        for tag in soup.select("main,article,section,div"):
            t=tag.get_text(" ",strip=True)
            if len(t)>350 and re.search("[\u0621-\u064a]",t):
                ident=" ".join([tag.name,"#"+str(tag.get("id","")), "."+".".join(tag.get("class",[]))])
                item["main_candidates"].append({"ident":ident[:130],"text_len":len(t),"start":t[:120]})
        item["main_candidates"]=sorted(item["main_candidates"],key=lambda x:x["text_len"])[:18]
        for selector in ["main","article","#content",".book-content",".book_content",".book-text",".book_text",".page-content",".page_content","#bookContent","#book-content","[class*=book]","[class*=content]"]:
            matches=soup.select(selector)
            if matches:item[selector]=[{"tag":m.name,"id":m.get("id"),"class":m.get("class"),"length":len(m.get_text(" ",strip=True)),"first":m.get_text(" ",strip=True)[:150]} for m in matches[:4]]
        item["h1"]=[h.get_text(" ",strip=True) for h in soup.find_all("h1")[:5]]
        item["paragraphs"]=[{"tag":x.name,"parent":x.parent.name if x.parent else None,"parent_id":x.parent.get("id") if x.parent else None,"parent_class":x.parent.get("class") if x.parent else None,"text":x.get_text(" ",strip=True)[:160]} for x in soup.find_all(["p","h2","h3"])[:18]]
        item["text_start"]=soup.get_text(" ",strip=True)[:650]
        (OUT/f"page-{page}.html").write_text(r.text,encoding="utf-8")
    except Exception as ex:item["error"]=repr(ex)
    summary.append(item)
    time.sleep(.5)
(OUT/"probe.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps([{k:v for k,v in it.items() if k in ["page","status","bytes","error","title","h1","paragraphs","main_candidates"]} for it in summary],ensure_ascii=False,indent=2)[:28000])
