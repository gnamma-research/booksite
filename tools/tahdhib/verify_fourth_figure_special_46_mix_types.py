#!/usr/bin/env python3
"""Tahdhib stage 97: 46 source-typed figure-IV mixes, NOT proof of modal necessity.
Historical source: al-Katibi, Shamsiyya §104, Street 2024 pp.252–254.
Outcome cells: Street Appendix Tables 1,3,4 pp.305–307, drawn from
Ibn Mubarakshah's Shamsiyya commentary (Street p.303).
"""
from pathlib import Path
from collections import Counter
import csv,json
SIX=('L','A','LD1','AD1','LD2','AD2')
TWO=('LD2','AD2')
ACTUAL=SIX+('X1','LT2','LX2','X2','X~L')
BAROCO={'L':'A','A':'A','LD1':'AD1','AD1':'AD1','LD2':'AD1','AD2':'AD1'}
BOCARDO={**{k:'XD2' for k in SIX},**{k:'X2' for k in ('X1','LT2','LX2','X2','X~L')}}
cases=[]
for m in TWO:
    for M in SIX:
        cases.append(dict(mood='VI/AOO',major_quality_quantity='A',major_type=M,
                          minor_quality_quantity='O',minor_type=m,
                          reduction='convert O minor to O-AD2; figure II Baroco',
                          result_quality_quantity='O',result_type=BAROCO[M]))
for M in TWO:
    for m in ACTUAL:
        cases.append(dict(mood='VII/OAO',major_quality_quantity='O',major_type=M,
                          minor_quality_quantity='A',minor_type=m,
                          reduction='convert O major to O-AD2; figure III Bocardo',
                          result_quality_quantity='O',result_type=BOCARDO[m]))
for m in TWO:
    for M in SIX:
        cases.append(dict(mood='VIII/IEO',major_quality_quantity='I',major_type=M,
                          minor_quality_quantity='E',minor_type=m,
                          reduction='metathesis to figure I then special O conversion',
                          result_quality_quantity='O',result_type='AD2'))
assert len(cases)==46 and len({(z['mood'],z['major_type'],z['minor_type']) for z in cases})==46
assert Counter(z['mood'] for z in cases)=={'VI/AOO':12,'VII/OAO':22,'VIII/IEO':12}
counts=Counter((z['mood'],z['result_type']) for z in cases)
assert counts=={('VI/AOO','A'):4,('VI/AOO','AD1'):8,('VII/OAO','XD2'):12,
                ('VII/OAO','X2'):10,('VIII/IEO','AD2'):12}
out=Path(__file__).with_name('verified_fourth_figure_special_46_mix_types.json')
out.write_text(json.dumps({'status':'SOURCE-TYPE CROSSWALK ONLY; NOT FULL HISTORICAL NECESSITY CERTIFICATION',
 'n_cases':len(cases),'outcomes':{str(k):v for k,v in counts.items()},
 'six_negative_convertible_classes':list(SIX),'special_negative_classes':list(TWO),
 'eleven_actual_for_mode7':list(ACTUAL),'cases':cases,
 'witness_boundary':'Ibn Mubarakshah tables via Street; not Taftazani manuscript variants'},indent=2)+'\n',
 encoding='utf-8')
print('PASS Stage97 46 distinct source-typed fourth-figure mixes:',dict(counts))
