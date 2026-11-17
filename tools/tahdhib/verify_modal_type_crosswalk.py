#!/usr/bin/env python3
"""Tahdhib L11 fifteen types vs Shamsiyyah's thirteen customary types.

A SOURCE TYPE REGISTRY, not executable truth conditions or a certification of
the historical modal conversion theorems. See Street 2024 Appendix 1, p.329;
commentary on Shamsiyyah §52, pp.168-170, §74 and §76, and Tahdhib L11/L14.
"""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
p=ROOT/'texts/al-taftazani/tahdhib-al-mantiq/edition/data.js'
raw=p.read_text(encoding='utf-8')
corpus=json.loads(raw.split('=',1)[1].rstrip(';\n '))
units={u['id']:u for u in corpus['units']}
assert len(units)==19 and all(k in units for k in ('L.11','L.14','L.15'))
ar=units['L.11']['ar']

# L11 source order: the first EIGHT are explicitly labelled 'simple',
# the remaining SEVEN 'compound'. The SHAMSIYYAH investigates THIRTEEN
# full proposition types; it treats the two simple temporal absolutes as
# underlying COMPONENTS of the corresponding compound temporals.
# The 'negative convertible six' applies to the six MAIN types below.
# It does NOT mean the present premise is always negative.
# (id, Arabic Cairo name, Cairo group, 13-member Shamsiyyah?, negative
#  universal convertibility class, result of universal-negative conversion)
TYPES=[
 ('L','ضرورية مطلقة','simple',True,'six','دائمة'),
 ('LD1','مشروطة عامة','simple',True,'six','عرفية عامة'),
 ('LT1','وقتية مطلقة','simple',False,'component',None),
 ('LX1','منتشرة مطلقة','simple',False,'component',None),
 ('A','دائمة مطلقة','simple',True,'six','دائمة'),
 ('AD1','عرفية عامة','simple',True,'six','عرفية عامة'),
 ('X1','المطلقة العامة','simple',True,'seven',None),
 ('M1','الممكنة العامة','simple',True,'seven',None),
 ('LD2','المشروطة الخاصة','compound',True,'six','عرفية لا دائمة في البعض'),
 ('AD2','العرفية الخاصة','compound',True,'six','عرفية لا دائمة في البعض'),
 ('LT2','الوقتية','compound',True,'seven',None),
 ('LX2','المنتشرة','compound',True,'seven',None),
 ('X3','الوجودية اللاضرورية','compound',True,'seven',None),
 ('X2','الوجودية اللادائمة','compound',True,'seven',None),
 ('M2','الممكنة الخاصة','compound',True,'seven',None),
]
assert len(TYPES)==15
assert len({x[0] for x in TYPES})==15
assert all(x[1] in ar for x in TYPES),[
    x[1] for x in TYPES if x[1] not in ar]
assert [x[2] for x in TYPES].count('simple')==8
assert [x[2] for x in TYPES].count('compound')==7
assert sum(x[3] for x in TYPES)==13
assert sum(x[4]=='six' for x in TYPES)==6
assert sum(x[4]=='seven' for x in TYPES)==7
assert sum(x[4]=='component' for x in TYPES)==2
assert {x[0] for x in TYPES if x[4]=='six'}=={
    'L','A','LD1','AD1','LD2','AD2'}

# Historical rule RECORDS, not verification by formula.
l14=units['L.14']['ar'];l15=units['L.15']['ar']
assert 'والسالبة الكلية تنعكس كلية' in l14
assert 'ومن السوالب تنعكس الدائمتان دائمة' in l14
assert 'والعامتان عرفية عامة' in l14
assert 'والخاصتان عرفية لا دائمة في البعض' in l14
assert 'انعكاس الخاصتين من الموجبة الجزئية هنا والسالبة الجزئية ثمة' in l15

# Ordinary negative particulars DO NOT convert; only the two
# special descriptional forms have the exceptional particular rule.
NEGATIVE_PARTICULAR_EXCEPTIONS={
  'LD2': 'AD2 (particular negative, special conventional)',
  'AD2': 'AD2 (particular negative, special conventional)',
}
POSITIVE_PARTICULAR_CONTRAPOSITION={
  'LD2': 'AD2 (negative particular on complement of predicate)',
  'AD2': 'AD2 (negative particular on complement of predicate)',
}
assert set(NEGATIVE_PARTICULAR_EXCEPTIONS)=={'LD2','AD2'}
assert set(POSITIVE_PARTICULAR_CONTRAPOSITION)=={'LD2','AD2'}

report={
  'scope':'historical taxonomy / source type checking; NO modal semantics proof',
  'source':'Cairo Tahdhib L11/L14/L15, al-Katibi Shamsiyyah §§52,74-76, Tony Street 2024 Appendix 1',
  'tahdhib_named_simple':8,
  'tahdhib_named_compound':7,
  'tahdhib_named_total':15,
  'shamsiyyah_customary_count':13,
  'additional_tahdhib_temporal_components':['LT1','LX1'],
  'six_types_whose_universal_negatives_convert':['L','A','LD1','AD1','LD2','AD2'],
  'seven_other_shamsiyyah_types':['X1','M1','LT2','LX2','X3','X2','M2'],
  'types':[{'id':id,'cairo_ar':name,'cairo_group':group,
            'shamsiyyah_core_13':core,'negative_universal_category':category,
            'negative_universal_converse':converse}
           for id,name,group,core,category,converse in TYPES],
  'particular_negative_simple_conversion_exceptions':NEGATIVE_PARTICULAR_EXCEPTIONS,
  'particular_affirmative_contraposition_exceptions':POSITIVE_PARTICULAR_CONTRAPOSITION,
  'scope_warning':'The six-type list is about a class whose NEGATIVE FORM converts; an affirmative major may belong to it. LT1/LX1 occur as parts of compound forms in Shamsiyyah.',
}
out=Path(__file__).with_name('verified_modal_type_crosswalk.json')
out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('PASS 15 Cairo modal forms: 8 simple + 7 compound')
print('PASS 13 Shamsiyyah main types: 6 negative-convertible + 7 other')
print('PASS LT1/LX1 are two additional Cairo components, not members of the thirteen')
print('PASS special particular negative/contraposition exceptions keyed to LD2, AD2 only')
