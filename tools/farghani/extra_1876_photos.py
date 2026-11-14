#!/usr/bin/env python3
"""Retrieve additional original photographed 1876 PRINT leaves for human reading.
No OCR and no automatic manuscript-variant claims."""
from pathlib import Path
from hashlib import sha256
from PIL import Image
from io import BytesIO
import requests,json,time
out=Path('qa-artifacts/farghani-i1876-new');out.mkdir(parents=True,exist_ok=True)
r=[]
s=requests.Session()
s.headers.update({'User-Agent':'Mozilla/5.0 (historical bibliography research; GNAMMA)'})
for n in range(44,49):
  url=f'https://sites.dlib.nyu.edu/viewer/api/image/books/princeton_aco000264/{n}/full/2200,/0/default.jpg'
  item={'scan_index':n,'tentative_historical_print_page':n-4,'url':url,'source_type':'historical PRINT not manuscript'}
  try:
    x=s.get(url,timeout=80)
    x.raise_for_status()
    im=Image.open(BytesIO(x.content))
    if im.width<1000:raise RuntimeError('too low resolution')
    path=out/f'original-scan-{n:04d}.jpg';path.write_bytes(x.content)
    item.update({'ok':True,'pixels':[im.width,im.height],'bytes':len(x.content),'sha256':sha256(x.content).hexdigest(),'file':str(path)})
  except Exception as ex:item.update({'ok':False,'error':str(ex)[:300]})
  r.append(item)
  time.sleep(.7)
(out/'retrieval-manifest.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(r,ensure_ascii=False,indent=2))
