#!/usr/bin/env python3
"""Verify the complete Iznīqī reading edition and optionally rebuild exports."""
from pathlib import Path
import argparse, hashlib, json, re

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--output', type=Path)
    args=ap.parse_args()
    root=Path(__file__).resolve().parent
    meta=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
    pages=[]; texts=[]
    for item in meta['chunks']:
        raw=(root/item['file']).read_bytes()
        assert len(raw)==item['bytes'], item['file']+' size mismatch'
        assert hashlib.sha256(raw).hexdigest()==item['sha256'], item['file']+' checksum mismatch'
        blob=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
        assert blob==item['git_blob_sha1'], item['file']+' Git hash mismatch'
        text=raw.decode('utf-8'); texts.append(text)
        for block in re.split(r'<!-- IZN-P\d+ -->',text)[1:]:
            head=re.search(r'^\s*## (\d+) · (.+)\n',block)
            assert head, 'Missing page title'
            p=int(head[1])
            ar=block.split('### Arabic\n\n',1)[1].split('\n\n### English',1)[0].strip()
            en=block.split('### English\n\n',1)[1].split('\n\n### Editorial notes',1)[0].strip()
            nt=block.split('### Editorial notes\n\n',1)[1].split('\n\nSource:',1)[0]
            notes=[re.sub(r'^\d+\. ','',x) for x in nt.splitlines() if re.match(r'^\d+\. ',x)]
            assert ar and en and notes, 'Incomplete source page '+str(p)
            pages.append(dict(id='IZN-P'+str(p),printed_page=p,pdf_page=p-813,title=head[2],arabic=ar,english=en,notes=notes,source_url=meta['source']['pdf_url']+'#page='+str(p-813)))
    assert [p['printed_page'] for p in pages]==list(range(831,853)), 'Page sequence incomplete'
    counts=dict(pages=len(pages),english_words=sum(len(p['english'].split()) for p in pages),arabic_words=sum(len(p['arabic'].split()) for p in pages),notes=sum(len(p['notes']) for p in pages))
    assert counts==dict(pages=22,english_words=12379,arabic_words=7968,notes=78), counts
    if args.output:
        args.output.mkdir(parents=True,exist_ok=True)
        (args.output/'Izniqi_Complete_Arabic_English.json').write_text(json.dumps(dict(meta,pages=pages),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        intro='# Al-Iznīqī — Complete Arabic–English reading edition\n\n'+meta['grade']+'\n\n'+meta['scope']+'\n\nSource: '+meta['source']['pdf_url']+'\n\n'
        (args.output/'Izniqi_Full_Cumulative_Handoff.md').write_text(intro+'\n'.join(texts),encoding='utf-8')
    print(json.dumps(dict(status='PASS',**counts),indent=2))
if __name__=='__main__':
    main()
