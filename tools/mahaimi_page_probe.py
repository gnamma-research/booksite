#!/usr/bin/env python3
"""One-time source connectivity and HTML-structure probe; does not save source text."""
import html
import re
import urllib.request
import urllib.error
import urllib.robotparser
from html.parser import HTMLParser
from urllib.parse import quote

UA = 'GNAMMA-Research-Citation-Checker/1.0 (noncommercial scholarly source-verification; one-off)'
SLUG = quote('مشرع الخصوص إلى معاني النصوص النصوص في تحقيق الطور المخصوص',safe='')
SOURCES = {
 'ablibrary_150':'https://ablibrary.net/book_content/b/9637/150?lang=ar',
 'najaf_150':f'https://najafdesertlibrary.com/book/{SLUG}/v/1/p/150',
 'najaf_239':f'https://najafdesertlibrary.com/book/{SLUG}/v/1/p/239',
}
class Collect(HTMLParser):
 def __init__(self):super().__init__();self.blocks=[];self.tags=[];self.data=[]
 def handle_starttag(self,tag,attrs): self.tags.append((tag,dict(attrs)))
 def handle_data(self,data):
  s=' '.join(data.split())
  if len(s)>25 and len(re.findall('[\u0600-\u06ff]',s))>15:self.data.append((len(self.tags),self.tags[-1] if self.tags else '',s))
 def handle_endtag(self,tag):
  for i in range(len(self.tags)-1,-1,-1):
   if self.tags[i][0]==tag: self.tags=self.tags[:i];break
for name,url in SOURCES.items():
 host=url.split('/')[2]; robot_url='https://'+host+'/robots.txt'
 try:
  r=urllib.robotparser.RobotFileParser();r.set_url(robot_url);r.read()
  allowed=r.can_fetch(UA,url)
  print(name,'robots',allowed,flush=True)
  if not allowed:continue
  req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'text/html'})
  with urllib.request.urlopen(req,timeout=12) as response:
   data=response.read(1_300_000).decode('utf-8','replace')
   print(name,'status',response.status,'length',len(data),'url',response.url,flush=True)
  p=Collect();p.feed(data)
  for depth,t,s in sorted(p.data,key=lambda x:-len(x[2]))[:7]:
   print(name,'sample',len(s), 'tag',t[0], 'class',t[1].get('class','')[:110], 'sample',s[:130],flush=True)
 except Exception as e:print(name,'ERROR',type(e).__name__,str(e)[:280],flush=True)
