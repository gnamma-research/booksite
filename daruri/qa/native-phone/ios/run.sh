#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
RESULT="$ROOT/daruri/qa/phone-results/ios"
APP="$(mktemp -d)/PhonePDF.app"
mkdir -p "$RESULT" "$APP"
python3 - <<'PY' > "$RESULT/device-id"
import json,subprocess
j=json.loads(subprocess.check_output(["xcrun","simctl","list","devices","available","-j"]))
for runtime,items in j["devices"].items():
  if "iOS" in runtime:
    for d in items:
      if d.get("isAvailable") and "iPhone" in d["name"]:
        print(d["udid"]);raise SystemExit(0)
raise SystemExit("No available iPhone Simulator runtime on hosted macOS")
PY
UDID="$(cat "$RESULT/device-id")"
echo "Selected iPhone Simulator $UDID"
xcrun simctl boot "$UDID" || true
xcrun simctl bootstatus "$UDID" -b
SDK="$(xcrun --sdk iphonesimulator --show-sdk-path)"
ARCH="$(uname -m)"
xcrun swiftc -target "${ARCH}-apple-ios17.0-simulator" -sdk "$SDK" \
    -parse-as-library -framework UIKit -framework PDFKit \
    "$ROOT/daruri/qa/native-phone/ios/PhonePDF.swift" -o "$APP/PhonePDF"
cp "$ROOT/daruri/qa/phone-output/personal-pdf-sample.pdf" "$APP/personal-pdf-sample.pdf"
cat > "$APP/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleIdentifier</key><string>org.gnamma.PNotePhoneTest</string>
<key>CFBundleExecutable</key><string>PhonePDF</string>
<key>CFBundleName</key><string>Gnamma PDFKit Test</string>
<key>CFBundleDisplayName</key><string>Gnamma P Notes</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>1.0</string>
<key>CFBundleVersion</key><string>1</string>
<key>LSRequiresIPhoneOS</key><true/>
<key>MinimumOSVersion</key><string>17.0</string>
<key>UISupportedInterfaceOrientations</key><array><string>UIInterfaceOrientationPortrait</string></array>
</dict></plist>
PLIST
codesign --force --sign - "$APP"
xcrun simctl install "$UDID" "$APP"
xcrun simctl launch "$UDID" org.gnamma.PNotePhoneTest
found=""
for retry in $(seq 1 40); do
  data="$(xcrun simctl get_app_container "$UDID" org.gnamma.PNotePhoneTest data)"
  if [[ -f "$data/Documents/phone-result.json" ]]; then
    cp "$data/Documents/phone-result.json" "$RESULT/ios-report.json"
    found="yes";break
  fi
  sleep 2
done
xcrun simctl io "$UDID" screenshot "$RESULT/ios-source-P-markers.png"
if [[ -z "$found" ]]; then
  echo "iOS native PDFKit app did not produce status" >&2
  xcrun simctl spawn "$UDID" log show --last 3m --predicate 'eventMessage CONTAINS "GNAMMA_PHONE_"' 2>&1 | tail -50 > "$RESULT/ios-log.txt" || true
  exit 1
fi
python3 - "$RESULT/ios-report.json" <<'PY'
import json,sys
r=json.load(open(sys.argv[1]))
print("iOS native PDFKit phone report:",json.dumps(r,indent=2,ensure_ascii=False))
assert r["ok"],"iOS Simulator native PDFKit verification failed"
assert r["forwardLinks"]>=4 and r["backLinks"]>=2
assert r["forwardArrival"]>=r["sourcePages"]
assert 0<=r["backArrival"]<r["sourcePages"]
PY
echo "PASS iPhone Simulator PDFKit: internal links, destinations, Arabic/English/French text and rendered device view"
