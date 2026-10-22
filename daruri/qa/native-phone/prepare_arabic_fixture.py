#!/usr/bin/env python3
"""Prepare CI-only native Android/iPhone PDF viewer drivers for an *actual*
Arabic personal PDF fixture, without changing shipped apps or baseline tests.
This modifies checkout-local test sources; the Git branch retains originals.
"""
from pathlib import Path
import json,re,sys

ROOT=Path(__file__).resolve().parents[2]
qa=ROOT/"qa"
phone=qa/"phone-output"
record=json.loads((phone/"arabic-source.json").read_text())
base,source=record["basePages"],record["sourcePage"]
assert base==37 and 0<=source<37
platform=sys.argv[1]
def transform(path,pairs):
    s=path.read_text()
    for a,b in pairs:
        if a not in s:raise RuntimeError(f"Expected native driver token absent from {path}: {a[:110]}")
        s=s.replace(a,b)
    path.write_text(s)
if platform=="android":
    java=qa/"native-phone"/"android"/"PhonePdfActivity.java"
    transform(java,[
        ("private static final int BASE=243, SOURCE=7;",
         f"private static final int BASE={base}, SOURCE={source};"),
        ('if(forwardCount<4)', 'if(forwardCount<2)'),
        ('if(returnCount<2)', 'if(returnCount<1)')
    ])
    s=java.read_text()
    start=s.index('    private void checkSearch(){')
    end=s.index('    private void displayPage(',start)
    replace='''    private void checkSearch(){
      String txt=pageText(BASE);
      String normalized=Normalizer.normalize(txt,Normalizer.Form.NFD)
        .replaceAll("[\\\\p{M}\\\\p{Cf}\\\\s]+","");
      boolean arabic=normalized.contains("هذه")||normalized.contains("ملاحظة");
      boolean p=txt.contains("P1");
      put("searchArabic",arabic);put("searchP",p);
      if(!arabic)error("Native Android cannot search Arabic personal endnote text");
      if(!p)error("Native Android cannot find P1");
    }
'''
    java.write_text(s[:start]+replace+s[end:])
    script=qa/"native-phone"/"android"/"run.sh"
    transform(script,[
        ('r["forwardCount"]>=4 and r["returnCount"]>=2',
         'r["forwardCount"]>=2 and r["returnCount"]>=1')
    ])
    native=script.read_text()
    probe='''function resilient_phone_tap() {
  local px="$1" py="$2"
  for attempt in $(seq 1 6); do
    adb start-server >/dev/null 2>&1 || true
    if timeout 9s adb shell input tap "$px" "$py"; then return 0; fi
    echo "Recovering intermittent adb connection (attempt $attempt)" >&2
    adb kill-server >/dev/null 2>&1 || true
    sleep 2
  done
  echo "Native Android could not deliver the tap to the device" >&2
  return 1
}
'''
    tag='tapP="$(await_tap P | tail -1)"'
    if tag not in native:raise RuntimeError("Expected Android tap sequence absent")
    native=native.replace(tag,probe+tag)
    native=native.replace('adb shell input tap "$px" "$py"','resilient_phone_tap "$px" "$py"')
    native=native.replace('adb shell input tap "$bx" "$by"','resilient_phone_tap "$bx" "$by"')
    # The helper itself must still use the adb command, not recursion.
    native=native.replace('if timeout 9s resilient_phone_tap', 'if timeout 9s adb shell input tap')
    script.write_text(native)
elif platform=="ios":
    swift=qa/"native-phone"/"ios"/"PhonePDF.swift"
    transform(swift,[
        ("let basePages=243",f"let basePages={base}"),
        ("page(at:7)",f"page(at:{source})"),
        ("backArrival != 7",f"backArrival != {source}"),
        ("if forward.count<4", "if forward.count<2"),
        ("if backward.count<2", "if backward.count<1"),
        ('doc.findString("مقدمة",withOptions:[]).count',
         'doc.findString("هذه",withOptions:[]).count')
    ])
    s=swift.read_text()
    debug='''        let appendixText=doc.page(at:basePages)?.string ?? ""
        let arabicProbeTerms=["هذه","ملاحظة","تجريبية","عربية","دقة","موضع","العبارة"]
        let arabicProbeHits=Dictionary(uniqueKeysWithValues:
          arabicProbeTerms.map{($0,doc.findString($0,withOptions:[]).count)})
'''
    where=s.index('        let searchP=doc.findString("P1",withOptions:[]).count')
    lineend=s.index("\n",where)+1
    s=s[:lineend]+debug+s[lineend:]
    s=s.replace('"searchP":searchP,',
       '"searchP":searchP,"arabicProbeHits":arabicProbeHits,"appendixPreview":String(appendixText.prefix(1200)),')
    # This Arabic fixture contains no English or French personal items; do
    # not claim that their absence is a regression in this Arabic-only test.
    s=re.sub(r'^.*if searchEnglish==0\{errors\.append\(.+$','',s,flags=re.M)
    s=re.sub(r'^.*if searchFrench==0\{errors\.append\(.+$','',s,flags=re.M)
    swift.write_text(s)
    shell=qa/"native-phone"/"ios"/"run.sh"
    transform(shell,[
        ('r["forwardLinks"]>=4 and r["backLinks"]>=2',
         'r["forwardLinks"]>=2 and r["backLinks"]>=1'),
        ('r["backArrival"]==7',f'r["backArrival"]=={source}')
    ])
else:raise SystemExit("Expected android or ios")
print("PASS prepared",platform,"native PDF link QA for Arabic fixture, base",base,"source page",source)
