#!/usr/bin/env python3
"""Public-domain 1898 Tamhid witness discovery. Do not bypass access controls.
Probe official public catalog/book APIs; obtain scans only from published open downloads.
"""
import json, urllib.request, urllib.parse, re, time, pathlib
OUT=pathlib.Path("qawtaw19-probe.json")
urls=[
 ("google_books_metadata","https://www.googleapis.com/books/v1/volumes/-Wku6DfHLa8C"),
 ("google_books_html","https://books.google.com/books?id=-Wku6DfHLa8C"),
 ("hathitrust_catalog","https://catalog.hathitrust.org/Search/Home?lookfor="+urllib.parse.quote('Tamhīd fī sharḥ Qawāʻid al-tawḥīd')+"&type=all"),
 ("hathitrust_catalog_simple","https://catalog.hathitrust.org/Search/Home?lookfor="+urllib.parse.quote('Turkah Isfahani Tamhid')+"&type=all"),
 ("washington_1898_catalog","https://kutuphane.osmanlica.com/kitap/5934322"),
 ("archive_org_title_search","https://archive.org/advancedsearch.php?q="+urllib.parse.quote('title:("Tamhid" AND "Qawaid")')+"&fl[]=identifier&rows=10&page=1&output=json"),
 ("google_books_fullview","https://books.google.com/books?vid=-Wku6DfHLa8C&printsec=frontcover"),
]
def read(label,url):
  obj={"label":label,"url":url}
  req=urllib.request.Request(url,headers={"User-Agent":"GnammaScholarlyWitnessVerification/1.0 (academic source research)"})
  try:
    with urllib.request.urlopen(req,timeout=18) as f:
      raw=f.read(1500000)
      obj.update(http=f.status,bytes=len(raw),contentType=f.headers.get("Content-Type"),finalUrl=f.geturl())
      decoded=raw.decode("utf-8","replace")
      obj["sample"]=decoded[:1900]
      obj["historicalLinks"]=list(dict.fromkeys([m for m in re.findall(r'https?://[^"\\s<>]+',decoded.replace("&amp;","&")) if any(x in m.lower() for x in ("hathi","washington","books.google","digital.lib","iiif","download","gbooks","googleusercontent","babel"))]))[:50]
      obj["viewOrDownloadHints"]=[decoded[max(0,m.start()-110):m.start()+180].replace("\\n"," ") for m in list(re.finditer(r'(?i)(download|full view|full_view|ocr|hathitrust|digital|\\.pdf)',decoded))[:30]]
      if label=="google_books_metadata":
        try:
          j=json.loads(decoded);obj["metadata"]={"title":j.get("volumeInfo",{}).get("title"),
           "identifiers":j.get("volumeInfo",{}).get("industryIdentifiers"),
           "accessInfo":j.get("accessInfo"),"saleInfo":j.get("saleInfo")}
        except ValueError:pass
      if label.startswith("hathitrust"):obj["linkMatches"]=list(dict.fromkeys(re.findall(r'(?:href|action)="([^"]+)"',decoded)))[:40]
      if label=="archive_org_title_search":
        try:obj["identifiers"]=[z.get("identifier") for z in json.loads(decoded).get("response",{}).get("docs",[])]
        except ValueError:pass
  except Exception as e:obj.update(error=str(e))
  return obj
r=[]
for label,url in urls:
  obj=read(label,url);r.append(obj);print(label, obj.get("http"),obj.get("bytes"),(obj.get("error") or "")[:160],flush=True)
  if obj.get("metadata"):print("BOOK_META",json.dumps(obj["metadata"],ensure_ascii=False)[:3000],flush=True)
  if obj.get("identifiers"):print("ARCHIVE_IDS",json.dumps(obj["identifiers"]),flush=True)
  if obj.get("historicalLinks"):print("PUBLIC_LINKS",json.dumps(obj["historicalLinks"][:18],ensure_ascii=False)[:2800],flush=True)
  if obj.get("viewOrDownloadHints") and label in ("washington_1898_catalog","google_books_html"):print("VIEW_HINTS",json.dumps(obj["viewOrDownloadHints"][:16],ensure_ascii=False)[:2400],flush=True)
  if obj.get("linkMatches"):print("HATHI_LINKS",json.dumps(obj["linkMatches"][:16],ensure_ascii=False)[:2600],flush=True)
OUT.write_text(json.dumps({"date":"2026-11-13","purpose":"Locate openly available 1898 scanned images of the historical Tamhid printing for SH-002 and QT-059. Catalog-only metadata does not count as collation.","probes":r},ensure_ascii=False,indent=2)+"\n")
