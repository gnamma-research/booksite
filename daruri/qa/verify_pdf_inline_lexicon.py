#!/usr/bin/env python3
"""All-text QA for inline Arabic dictionary links in English PDF builders.

Nothing is appended to the end of a paragraph. In particular no link may be
invented when an Arabic keyword lacks an identifiable English equivalent.
"""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import json, re, sys

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"build"))
from english_lexicon_pdf import plan,markup,_entries,_bare,coverage

raw=(ROOT/"edition-r3-20261020.js").read_text(encoding="utf-8")
data=re.search(r'textContent\s*=\s*("(?:[^"\\]|\\.)*")\s*;',raw,re.S)
assert data,'Missing authoritative edition'
book=json.loads(json.loads(data[1]))
expected_paragraphs=sum(len(s["segments"]) for s in book["sections"])
assert expected_paragraphs==416,expected_paragraphs

class Check(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.nesting=0
        self.buff=[]
        self.links=[]
    def handle_starttag(self,tag,attrs):
        attr=dict(attrs)
        if tag=='a' and '/dictionary.html#term=' in attr.get('href',''):
            self.links.append((attr.get('href',''),attr.get('lang'),attr.get('dir')))
        if self.nesting:self.nesting+=1;return
        if attr.get('data-generated')=='annotation':
            self.nesting=1
            return
    def handle_endtag(self,tag):
        if self.nesting:self.nesting-=1
    def handle_data(self,data):
        if not self.nesting:self.buff.append(data)

total=0
examples=[]
for section in book["sections"]:
    for i,seg in enumerate(section["segments"]):
        output=markup(seg["en"],seg["ar"])
        checker=Check();checker.feed(output)
        assert ''.join(checker.buff)==seg["en"],(section["id"],i)
        assert 'Arabic terms in this passage' not in output,(section["id"],i)
        assert 'gn-en-lex-tail' not in output,(section["id"],i)
        annotations=plan(seg["en"],seg["ar"])
        assert len(annotations)==len(checker.links),(section["id"],i)
        assert len(set(x['term'] for x in annotations))==len(annotations)
        for (href,lang,direction),annotation in zip(checker.links,annotations):
            assert '/dictionary.html#term=' in href,(section["id"],i,href)
            assert lang=='ar' and direction=='rtl',(section["id"],i)
        # An insertion must follow an EXACT source expression, never float
        # elsewhere in the paragraph or masquerade as authorial wording.
        for e in annotations:
            assert 0<=e['start']<=e['end']<=len(seg['en']),e
            if e['kind']=='wrap':
                assert seg['en'][e['start']:e['end']]==e['surface'],e
            else:
                assert e['start']==e['end'],e
        total+=len(annotations)
        if str(section['id']) in ('1','2','7','11','57','216'):
            examples.append({"section":section['id'],"paragraph":i,
                             "linked":[x['term'] for x in annotations]})
assert total>400,('Unexpectedly poor inline terminology coverage',total)
summary=coverage(book)
assert summary['linked']==total,(summary['linked'],total)
assert summary['segments']==416
print('PASS: 416/416 translations preserved without end-of-passage term lists.')
print('Linked in place:',total,'dictionary references; unmatched English positions not invented.')
print('Representative sections:',json.dumps(examples,ensure_ascii=False))
print('Editorial review still required for',len(summary['unplaced']),'paragraphs with unplaceable terms.')
