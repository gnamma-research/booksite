"""Aligned Arabic keyword references in English Daruri PDFs.

The source of English equivalents is english-lexicon-aliases.json, shared with
the web reader. Only terms actually matched in the corresponding Arabic passage
may be annotated. The existing translation is never replaced or retranslated.

An unplaceable term receives NO fallback word list or guessed attachment.
"""
from __future__ import annotations

from functools import lru_cache
from html import escape
from pathlib import Path
import json
import re
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
DIACRITICS = re.compile(r'[\u064b-\u065f\u0670\u0640\u06d6-\u06ed]')
WORD = r'[\w]'
BASE = "https://gnamma-research.github.io/booksite/daruri/dictionary.html#term="


@lru_cache(maxsize=1)
def _config():
    aliases = json.loads((ROOT / "english-lexicon-aliases.json").read_text(encoding="utf-8"))
    dict_data = json.loads((ROOT / "dictionary-data.json").read_text(encoding="utf-8"))
    known = list(dict_data["glossary"])
    present = {x["term"] for x in known}
    for key, cfg in dict_data["terms"].items():
        if key not in present:
            known.append({"term": key, "ar": cfg["lemma"]})
    assert "ḥukm" in aliases and "ṣināʿa" in aliases
    return aliases, dict_data["terms"], known


def _bare(text):
    return DIACRITICS.sub('', str(text)).replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").replace("ٱ", "ا")


def _letters(text):
    """For Arabic matching only; keep an exact Python character offset map."""
    chars, offsets = [], []
    for i, char in enumerate(str(text)):
        if DIACRITICS.fullmatch(char):
            continue
        chars.append(_bare(char))
        offsets.append(i)
    return ''.join(chars), offsets


def _ar_patterns(term, cfg):
    forms = [f.strip() for f in str(term.get("ar", "")).split("/") if f.strip()]
    forms += cfg.get("aliasesAr", [])
    found = []
    for name in forms:
        x = _bare(name).strip()
        if x.startswith("ال") and len(x) > 3:
            x = x[2:]
        if not x:
            continue
        pattern = (r'(?<![\w])(?:[وف])?(?:[بك]?ال|لل|[بكل])?'
                   + re.escape(x) + r'(?![\w])')
        found.append(re.compile(pattern))
    return found


@lru_cache(maxsize=1)
def _entries():
    aliases, configs, terms = _config()
    rows = []
    for term in terms:
        name = term["term"]
        ar = _ar_patterns(term, configs.get(name, {}))
        forms = [s.strip() for s in aliases.get(name, '').split('|') if s.strip()]
        forms.extend(x.strip() for x in name.split('/') if len(x.strip()) >= 3)
        forms.extend(configs.get(name, {}).get("aliasesEn", []))
        forms = list(dict.fromkeys(x for x in forms if 3 <= len(x) <= 48 and len(x.split()) <= 5))
        en = [(f, re.compile(r'(?<![\w])' + re.escape(f) + r'(?![\w])', re.I))
              for f in forms]
        rows.append((name, ar, en))
    return rows


def plan(english: str, arabic: str) -> list[dict]:
    """Locate at most one defensible English occurrence per Arabic term.

    Each event is a zero-width insertion or a wrap of Arabic already printed in
    the English source. Invalid offsets and colliding translations are rejected.
    """
    en_source = str(english)
    ar_bare, _ = _letters(arabic)
    en_bare, en_offsets = _letters(en_source)
    matched = []
    for name, arabic_patterns, english_patterns in _entries():
        arabic_hits = [m for p in arabic_patterns for m in p.finditer(ar_bare)]
        if arabic_hits:
            hit = min(arabic_hits, key=lambda m: m.start())
            matched.append((name, hit.start(), english_patterns, arabic_patterns))
    if not matched:
        return []
    used, chosen, candidates = [], [], []
    def overlaps(start, end):
        return any(start < other_end and end > other_start for other_start, other_end in used)
    # First reuse Arabic already present in the English (often in parentheses).
    # It is linked in place, not repeated after another English synonym.
    for order, (name, _, _, arabic_patterns) in enumerate(matched):
        occurrences = []
        for pattern in arabic_patterns:
            for m in pattern.finditer(en_bare):
                if m.end() > len(en_offsets):
                    continue
                a, b = en_offsets[m.start()], en_offsets[m.end()-1]+1
                if a >= b or overlaps(a, b):
                    continue
                occurrences.append((a, b))
        if occurrences:
            a,b = min(occurrences)
            chosen.append({"kind":"wrap", "term":name, "start":a, "end":b,
                           "surface":en_source[a:b]})
            used.append((a,b))
    handled = {x["term"] for x in chosen}
    for order,(name, _, english_patterns, _) in enumerate(matched):
        if name in handled:
            continue
        for phrase, regex in english_patterns:
            for match in regex.finditer(en_source):
                a,b = match.span()
                if overlaps(a,b):
                    continue
                relative=(order+.5)/len(matched)
                proximity=abs(((a+b)/2)/max(1,len(en_source))-relative)
                score=min(len(phrase),40)*.032-proximity+(.20 if ' ' in phrase else 0.0)
                candidates.append((-score,a,b,order,name))
    # Long specific equivalents outrank accidental matches on generic words.
    for _,a,b,order,name in sorted(candidates):
        if name in handled or overlaps(a,b):
            continue
        chosen.append({"kind":"insert","term":name,"start":b,"end":b,
                       "surface":""})
        handled.add(name)
        used.append((a,b))
    return sorted(chosen,key=lambda p:(p["start"],p["term"]))


def _link(term: str, surface: str):
    href=BASE+quote(term, safe='')
    return ('<a class="gn-en-inline-link" lang="ar" dir="rtl" '
            'href="' + escape(href, quote=True) + '" '
            'title="Dictionary: ' + escape(term, quote=True) + '">' +
            escape(surface) + '</a>')


def markup(english: str, arabic: str, additional_markers=()) -> str:
    """Return escaped original English with lexical references and source markers.

    additional_markers is a sequence (source_end_character_offset, trusted HTML
    for an independently validated source footnote). It cannot replace text.
    """
    source=str(english)
    events={}
    def push(pos, priority, html):
        assert 0<=pos<=len(source), (pos, len(source))
        events.setdefault(pos,[]).append((priority,html))
    for item in plan(source,arabic):
        if item['kind']=='wrap':
            push(item['start'],30,('<a class="gn-en-inline-link" lang="ar" dir="rtl" '
                 'href="'+escape(BASE+quote(item['term'],safe=''),quote=True)
                 +'" title="Dictionary: '+escape(item['term'],quote=True)+'">'))
            push(item['end'],0,'</a>')
        else:
            # Mark non-authorial addition so the PDF's exact-source-text validator
            # correctly strips the bracket and its Arabic when auditing English.
            surface = item['term']
            _,configs,terms=_config()
            found=next((t for t in terms if t['term']==item['term']),None)
            # The base Arabic headword gives a stable dictionary label, while
            # a translated Arabic phrase already in English stays untouched.
            if found:
                surface=found.get('ar',surface).split('/')[0].strip()
            suffix='<span class="gn-en-added" data-generated="annotation"> ('+_link(item['term'],surface)+')</span>'
            push(item['end'],10,suffix)
    for offset,html in additional_markers:
        push(int(offset),20,html)
    pieces,last=[],0
    for end in sorted(events):
        pieces.append(escape(source[last:end]))
        pieces.extend(mark for _,mark in sorted(events[end],key=lambda x:x[0]))
        last=end
    pieces.append(escape(source[last:]))
    return ''.join(pieces)


def coverage(book):
    """Non-publishing editorial audit: missing matches never become tail text."""
    totals={"segments":0,"arabic_terms":0,"linked":0,"unplaced":[]}
    aliases,config,terms=_config()
    for section in book["sections"]:
        for i,segment in enumerate(section["segments"]):
            terms_ar=[name for name,patterns,_ in _entries()
                      if any(p.search(_bare(segment["ar"])) for p in patterns)]
            matched={item["term"] for item in plan(segment["en"],segment["ar"])}
            totals["segments"]+=1
            totals["arabic_terms"]+=len(terms_ar)
            totals["linked"]+=len(matched)
            if missing:=set(terms_ar)-matched:
                totals["unplaced"].append({"section":str(section["id"]),
                                           "paragraph":i,
                                           "terms":sorted(missing)})
    return totals
