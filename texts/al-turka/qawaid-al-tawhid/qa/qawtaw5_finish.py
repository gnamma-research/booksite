#!/usr/bin/env python3
"""Finish release metadata and test the actual cumulative ledger, not obsolete machine groups."""
from pathlib import Path
import re
P=Path(__file__).resolve().parent.parent

def edit(name,fn):
 p=P/name;s=p.read_text(encoding='utf-8');n=fn(s)
 if n!=s:p.write_text(n,encoding='utf-8')

def browser_test(s):
 a=s.index('        # Review is a separate editorial view;')
 b=s.index('        for width in [320,390,768]:',a)
 block='''        # The canonical ledger records comparison, not manuscript certification.
        ledger=json.loads((BASE/'qa/clause-ledger.json').read_text())
        summary=ledger['summary'];total=summary['totalArabicPunctuationClauses']
        reviewed=summary['individuallyComparedArabicPunctuationClauses']
        sahw=next(a for u in ledger['units'] if u['id']=='SH-058' for a in u['arabicClauses'] if 'السهو' in a['text'])
        anchor='SH-058-C'+str(sahw['n']).zfill(3)
        page3=context.new_page();reviewErrors=[]
        page3.on('pageerror',lambda e:reviewErrors.append(str(e)))
        page3.goto('https://gnamma.test'+PREFIX+'clause-review.html#'+anchor,
                   wait_until='networkidle',timeout=45000)
        page3.wait_for_function("n => document.querySelector('#n-all')?.textContent === n",arg=f'{total:,}',timeout=30000)
        ck('canonical review indexes all Arabic segments',page3.locator('#n-all').inner_text()==f'{total:,}')
        ck('comparison and pending counts match the actual ledger',int(page3.locator('#n-reviewed').inner_text().replace(',',''))==reviewed and int(page3.locator('#n-pending').inner_text().replace(',',''))==total-reviewed)
        ck('all 171 source units represented',int(page3.locator('#n-units').inner_text())==171)
        ck('deep-link opens SH-058 in the correct section',page3.locator('#unit').input_value()=='SH-058')
        ck('sahw source reading and its uncertainty are visible','السهو' in page3.locator('#'+anchor+' .arabic').inner_text() and 'unresolved-reading' in page3.locator('#'+anchor+' .status').inner_text())
        page3.locator('#filter').select_option('unresolved')
        ck('unresolved filter retains source problems',page3.locator('.passage').count()>0 and page3.locator('.passage .status.pending').count()>0)
        page3.locator('#unit').select_option('SH-037')
        page3.locator('#filter').select_option('pending')
        ck('completed comparison has no falsely pending passages',page3.locator('.passage').count()==0)
        page3.locator('#filter').select_option('all')
        ck('previously unreviewed commentary now has recorded correspondences',page3.locator('.passage').count()>0 and page3.locator('.passage .note').count()==page3.locator('.passage').count())
'''
 return s[:a]+block+s[b:]
edit('qa/test-commentary-browser.py',browser_test)

def ui(s):
 s=s.replace('Scholarly editorial workspace · 8 November 2026','Scholarly editorial workspace · 11 November 2026')
 s=s.replace(' candidate groups</span>',' Arabic segments</span>').replace(' awaiting individual inspection</span>',' not yet compared</span>').replace("+' clause groups'","+' Arabic segments'")
 a=s.index('<div class="warning">');b=s.index('</div>',a)+6
 s=s[:a]+'<div class="warning">The 61 matn and 110 sharḥ units have a complete working translation. English correspondence may repeat across adjacent Arabic segments when one English sentence translates several source clauses. Comparison coverage is not an accuracy score. Unresolved readings remain visible in their own filter; QT-059’s reported ancestral omission remains unreconstructed.</div>'+s[b:]
 s=s.replace('<option value="gloss">With literal gloss</option>','')
 s=s.replace('<a href="editorial/CLAUSE_REVIEW_2026-11-08.md">Editorial methods &amp; findings</a>','<a href="editorial/CLAUSE_REVIEW_COMPLETE_2026-11-11.md">Complete comparison record</a>')
 s=s.replace('<a href="qa/clause-map-matn.jsonl">Raw data · matn</a>','<a href="qa/clause-ledger.json">Canonical ledger</a><a href="qa/qawtaw5-unresolved-register.json">Unresolved readings</a>')
 s=re.sub(r"const files=\['matn'.*?;\n",'',s,count=1)
 # Repeated application must not multiply options.
 option='<option value="unresolved">Unresolved source reading</option>'
 while s.count(option)>1:
  i=s.rfind(option);s=s[:i]+s[i+len(option):]
 return s
edit('clause-review.html',ui)

notice='Source-based working translation. Electronic Arabic–English comparison completed 11 November 2026; not an independently human-certified or manuscript-collated edition. The reported ancestral loss at QT-059 remains unreconstructed. Unresolved readings are recorded in the Study and Reference editions and the online comparison ledger.'
def pdf(s):
 old="    intro+='</section>'"
 new="    intro+='<p class=\"muted\">"+notice+"</p></section>'"
 if notice not in s:
  assert s.count(old)==1,'Unexpected contents-page builder'
  s=s.replace(old,new)
 return s
edit('pdf/build_editions.py',pdf)

header='''> **11 November 2026 — Qawtaw 5.** Electronic-text comparison is complete across all **171 units / 5,520 punctuation-derived Arabic segments**. This is model-assisted editorial comparison, not independent human specialist certification or manuscript collation. **57 unresolved/source-crux groups remain recorded; QT-059 remains unreconstructed.** See the [current cumulative handoff](QAWTAW5_CUMULATIVE_HANDOFF_2026-11-11.md), [complete comparison](CLAUSE_REVIEW_COMPLETE_2026-11-11.md) and [corrections](QAWTAW5_CORRECTIONS_2026-11-11.md). Earlier dated sections below remain historical.

'''
for name in ['editorial/COMMENTARY_TRANSLATION.md','editorial/EDITORIAL_STATUS.md']:
 edit(name,lambda s: s if s.startswith('> **11 November 2026 — Qawtaw 5.') else header+s)
print('Current ledger browser tests, edition notices and release status reconciled')
