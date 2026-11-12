#!/usr/bin/env python3
"""Obtain openly offered Google Books PDF of an 1898 public-domain Tamhid print.
Do not circumvent login/DRM, brute-force pages, or assume downloaded bytes are the correct book.
"""
from html.parser import HTMLParser
from urllib.parse import urlparse
from urllib.request import urlopen, Request
from html import unescape
import hashlib, json, pathlib, time

LANDING="https://books.google.com/books?id=-Wku6DfHLa8C"
DEST=pathlib.Path("qawtaw19-1898-google-public-print.pdf")
REPORT=pathlib.Path("qawtaw19-1898-download-report.json")
class Links(HTMLParser):
 def __init__(self): super().__init__();self.links=[]
 def handle_starttag(self,tag,attrs):
  if tag=="a":
   d=dict(attrs)
   if "href" in d:self.links.append(d["href"])
result={"source":LANDING,"expected":"Public-domain 1898 Arabic print; page identity requires visual inspection","readingsActuallyCollated":0}
try:
 with urlopen(Request(LANDING,headers={"User-Agent":"Mozilla/5.0 (compatible; academic public-domain source inspection)"}),timeout=30) as f:
  s=f.read(200000).decode("utf-8","replace")
 links=Links();links.feed(s)
 pdfs=[unescape(u) for u in links.links if "output=pdf" in u and "/books/download/" in u]
 result["offeredPdfUrls"]=len(pdfs)
 if not pdfs:raise RuntimeError("Landing HTML did not provide an official PDF download hyperlink")
 url=pdfs[0];parts=urlparse(url)
 if parts.scheme!="https" or parts.netloc!="books.google.com":raise RuntimeError("Unexpected host")
 result["sourceLinkIsOfficial"]=True
 req=Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; academic public-domain source inspection)","Referer":LANDING})
 with urlopen(req,timeout=70) as f:
  result["http"]=f.status;result["contentType"]=f.headers.get("Content-Type");result["finalUrlHost"]=urlparse(f.geturl()).netloc
  first=f.read(16)
  result["signature"]=first.decode("latin1","replace")
  if not first.startswith(b"%PDF-"):raise RuntimeError("Returned response is not a PDF; no attempt to bypass provider controls")
  total=len(first);h=hashlib.sha256();h.update(first)
  with DEST.open("wb") as out:
   out.write(first)
   while True:
    block=f.read(1024*1024)
    if not block:break
    out.write(block);h.update(block);total+=len(block)
    if total>120000000:raise RuntimeError("PDF unexpectedly >120 MB; stop")
 result.update(downloaded=True,bytes=total,sha256=h.hexdigest())
 print("PUBLIC_PRINT_DOWNLOADED",total,h.hexdigest(),flush=True)
except Exception as e:
 result["downloaded"]=False;result["error"]=str(e);DEST.unlink(missing_ok=True)
 print("PUBLIC_PRINT_UNAVAILABLE",str(e),flush=True)
REPORT.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
