#!/usr/bin/env python3
"""Build checksum-bound word rectangles from the canonical WeasyPrint layout.

Never infer RTL coordinates from PyMuPDF's unreliable Arabic text extraction.
Instead wrap each source token in a neutral inline span in an analysis copy of
the edition HTML, then compare the measured segment anchors with those from
the *published* PDF. Output word boxes only for layout-stable segments.
"""
import argparse, html, json, re, tempfile, hashlib, math
from collections import defaultdict
from pathlib import Path
from weasyprint import HTML
from weasyprint.text.fonts import FontConfiguration

ROOT=Path(__file__).resolve().parents[1]
BUILD=ROOT/'build'
RELEASE=BUILD/'release'
DATA_PATTERN=re.compile(r'(<p\b[^>]*\bdata-source-role="segment"[^>]*>)(.*?)(</p>)',re.S)
HTML_TAG=re.compile(r'(<[^>]+>)')
WS=re.compile(r'(\s+)')
AT=re.compile(r'\bdata-(section-id|segment-index|language)="([^"]*)"')
END_TAG=re.compile(r'^</\s*([a-z0-9-]+)')
START_TAG=re.compile(r'^<\s*([a-z0-9-]+)\b',re.I)
THRESHOLD=0.95  # PDF points. Tight enough to reject reflow.
def instrument(original,allowed=None):
    serial=0
    lookups={}
    def paragraph(match):
        nonlocal serial
        tag,body,closing=match.groups()
        fields=dict(AT.findall(tag))
        s,seg,lang=fields['section-id'],fields['segment-index'],fields['language']
        if allowed is not None and str(s) not in allowed:return match.group()
        if not s.isdigit():return match.group()
        key=f'{s}:{seg}:{lang}'
        stack=[]
        fragments=[]
        for part in HTML_TAG.split(body):
            if not part:continue
            if part.startswith('<'):
                close=END_TAG.match(part)
                opening=START_TAG.match(part)
                if close:
                    name=close.group(1).lower()
                    for i in range(len(stack)-1,-1,-1):
                        if stack[i][0]==name:
                            del stack[i:]
                            break
                elif opening and not re.search(r'/\s*>$',part):
                    name=opening.group(1).lower()
                    if name not in {'br','img','hr','input','meta','link','wbr'}:
                        stack.append((name, name in {'sup','a'} or 'class="footnote' in part))
                fragments.append(part)
                continue
            if any(suppress for _,suppress in stack):
                fragments.append(part)
                continue
            pieces=[]
            for token in WS.split(part):
                if not token or token.isspace():pieces.append(token);continue
                serial+=1
                ident=f'gn-pw-{serial}'
                lookups[ident]=(key,html.unescape(token))
                pieces.append(f'<span id="{ident}">{token}</span>')
            fragments.extend(pieces)
        return tag+''.join(fragments)+closing
    transformed=DATA_PATTERN.sub(paragraph,original)
    return transformed,lookups

def enumerate_anchors(doc):
    result={}
    for p,page in enumerate(doc.pages,1):
        for key,coords in page.anchors.items():
            if key not in result:
                result[key]={'p':p,'b':[round(v*.75,2) for v in coords]}
    return result

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--edition',choices=['scholarly','study','english','arabic','arabic-vowelled'],action='append')
    parser.add_argument('--probe',action='store_true')
    parser.add_argument('--publish',action='store_true')
    args=parser.parse_args()
    from build_editions import build,NAMES
    report={}
    for edition in args.edition or ['scholarly','study','english','arabic','arabic-vowelled']:
        filename=NAMES[edition][0]
        print('START',edition,flush=True)
        canonical=json.loads((RELEASE/(filename+'.metadata.json')).read_text())
        pdfhash=hashlib.sha256((ROOT/filename).read_bytes()).hexdigest()
        if pdfhash!=canonical['sha256']:raise RuntimeError(filename+' hash does not match published map')
        with tempfile.TemporaryDirectory() as tmp:
            rebuilt=build(edition,Path(tmp))
            print('REBUILD',edition,'SHA-MATCH',rebuilt['sha256']==canonical['sha256'],flush=True)
            layout_source=(Path(tmp)/filename).with_suffix('.pdf.html').read_text()
            transformed,words=instrument(layout_source,{'1','12','62'} if args.probe else None)
            doc=HTML(string=transformed,base_url=str(BUILD)).render(font_config=FontConfiguration())
            anchors=enumerate_anchors(doc)
            print('RENDERED',edition,len(doc.pages),'tokens',len(words),flush=True)
            if len(doc.pages)!=canonical['pages']:
                print('PAGE-DIVERGENCE',edition,'expected',canonical['pages'],'actual',len(doc.pages),flush=True)
            matched,unstable=[],[]
            for ident,(key,text) in words.items():
                ref='segment-'+key.replace(':','-')
                source=canonical['anchors'].get(ref)
                place=anchors.get(ref)
                rect=anchors.get(ident)
                if not source or not place or not rect:continue
                dx=source['x']-place['b'][0]
                dy=source['y']-place['b'][1]
                error=max(abs(dx),abs(dy))
                # Some older bilingual PDF releases used the opposite physical
                # column order; the rebuilt *source text* is identical but the
                # lane is translated exactly 268.324 pt.  Accept this only when
                # y/page coincide and x differs by that known single-column width.
                translated=(abs(abs(dx)-268.324015748)<0.5 and abs(dy)<THRESHOLD)
                if place['p']!=source['page'] or (error>THRESHOLD and not translated) or rect['p']!=place['p']:
                    unstable.append((key,round(dx,2),round(dy,2),place['p'],source['page']))
                    continue
                box=rect['b']
                if translated:
                    box=[round(box[0]+dx,2),box[1],round(box[2]+dx,2),box[3]]
                if len(box)!=4 or not all(math.isfinite(x) for x in box):continue
                if box[2]-box[0]<.15 or box[3]-box[1]<.15:continue
                matched.append((key,text,rect['p'],box))
            groups=defaultdict(list)
            for key,text,page,box in matched:groups[key].append([text,page]+box)
            expected={
                ':'.join(key[len('segment-'):].split('-',2))
                for key in canonical['anchors'] if key.startswith('segment-')
            }
            fraction=len(groups)/max(1,len(expected))
            print('RESULT',edition,'stable-tokens',len(matched),'unstable-tokens',len(unstable),
                  'stable-segments',len(groups),'expected',len(expected),'fraction',round(fraction,4),
                  'diff examples',unstable[:12],flush=True)
            if not args.probe and fraction<0.92:
                raise RuntimeError(f'{edition} map coverage only {fraction:.1%}; refuse to publish unsafe map')
            report[filename]={
                'source_sha256':pdfhash,'max_delta_pt':THRESHOLD,
                'coverage':round(fraction,5),'segments':dict(groups)
            }
    if args.publish:
        dest=ROOT/'personal-anchor-maps';dest.mkdir(exist_ok=True)
        for filename,data in report.items():
            target=dest/(filename+'.json')
            target.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
            print('WRITE',target,round(target.stat().st_size/1024),'KiB',flush=True)

if __name__=='__main__':main()
