#!/usr/bin/env python3
"""Regression checks for multilingual notes in Arabic-text PDFs."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'build'))
from main_text import _note_text_and_language, _Renderer

def renderer(edition):
    return _Renderer({'sections':[],'notes':[]},[],{},edition)

cases=[
    ({'text':'English editorial explanation.'},'ar',('English editorial explanation.','en')),
    ({'text':'English note citing Bou Akl (2015).'},'ar',('English note citing Bou Akl (2015).','en')),
    ({'text_en':'Verse citation in English','text_ar':'إحالة قرآنية بالعربية'},'ar',('إحالة قرآنية بالعربية','ar')),
    ({'text_en':'Verse citation in English','text_ar':'إحالة قرآنية بالعربية'},'en',('Verse citation in English','en')),
    ({'text':'Texte français conservé.', 'text_language':'fr'},'ar',('Texte français conservé.','fr')),
    ({'original_note_language':'fr','original_note_text':'Citation originale française.',
      'text_ar':'ترجمة عربية غير أصلية'},'ar',('Citation originale française.','fr')),
    ({'original_note_language':'en','original_note_text':'Original English note.',
      'text_ar':'شرح عربي لاحق'},'ar',('Original English note.','en')),
]
for note,request,expected in cases:
    assert _note_text_and_language(note,request)==expected,(note,request)

for edition in ('arabic','arabic-vowelled','study'):
    r=renderer(edition)
    def displayed(note,requested):
        note={**note,'id':'N'+str(len(r.footnote_numbers)+1)}
        inline=r._footnote(note,requested)
        return inline or r.pending_footnotes[-1]
    en=displayed({'text':'English original.'},'ar')
    assert 'lang="en" dir="ltr"' in en, (edition,en)
    fr=displayed({'original_note_language':'fr','original_note_text':'Texte français.'},'ar')
    assert 'lang="fr" dir="ltr"' in fr, (edition,fr)
    ar=displayed({'text_ar':'قارن القرآن','text_en':'Cf. Quran'},'ar')
    assert 'lang="ar" dir="rtl"' in ar, (edition,ar)
print('PASS: notes retain actual English, French and Arabic language and direction across Arabic-text and Study renderers.')
