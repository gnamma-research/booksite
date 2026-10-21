#!/usr/bin/env bash
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
WORK="$(mktemp -d)"
OUTPUT="$REPO/daruri/qa/phone-results/android"
mkdir -p "$OUTPUT" "$WORK/classes" "$WORK/dex" "$WORK/assets"
# Always collect emulator evidence, even when no tap target is reported.
function preserve_diagnostics() {
  adb logcat -d -s GnammaPhone:V AndroidRuntime:E ActivityManager:E > "$OUTPUT/android-log.txt" 2>&1 || true
  adb exec-out screencap -p > "$OUTPUT/00-device-last-screen.png" 2>/dev/null || true
  adb shell run-as org.gnamma.pnotetest cat files/phone-result.json > "$OUTPUT/android-report.json" 2>/dev/null || true
}
trap preserve_diagnostics EXIT

cp "$REPO/daruri/qa/phone-output/personal-pdf-sample.pdf" "$WORK/assets/personal-pdf-sample.pdf"
ANDROID_HOME="${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
BT="$(find "$ANDROID_HOME/build-tools" -mindepth 1 -maxdepth 1 -type d | sort -V | tail -1)"
SDK="$ANDROID_HOME/platforms/android-35/android.jar"
echo "Using Android SDK $SDK with build tools $BT"
javac -source 8 -target 8 -cp "$SDK" -d "$WORK/classes" \
  "$REPO/daruri/qa/native-phone/android/PhonePdfActivity.java"
find "$WORK/classes" -type f -name '*.class' -print0 |
  xargs -0 "$BT/d8" --min-api 35 --lib "$SDK" --output "$WORK/dex"
"$BT/aapt" package -f \
  -M "$REPO/daruri/qa/native-phone/android/AndroidManifest.xml" \
  -A "$WORK/assets" -I "$SDK" -F "$WORK/unsigned.apk"
(cd "$WORK/dex" && zip -q "$WORK/unsigned.apk" classes.dex)
"$BT/zipalign" -f 4 "$WORK/unsigned.apk" "$WORK/aligned.apk"
keytool -genkeypair -noprompt -keystore "$WORK/debug.keystore" \
  -alias gnamma -storepass android -keypass android \
  -dname "CN=GNAMMA native PDF testing" -keyalg RSA -keysize 2048 -validity 1
"$BT/apksigner" sign --ks "$WORK/debug.keystore" --ks-key-alias gnamma \
  --ks-pass pass:android --key-pass pass:android \
  --out "$WORK/phone.apk" "$WORK/aligned.apk"
adb install -r "$WORK/phone.apk"
adb logcat -c
adb shell am start -W -n org.gnamma.pnotetest/.PhonePdfActivity
function await_tap() {
  local kind="$1" iter line
  for iter in $(seq 1 100); do
    line="$(adb logcat -d -s GnammaPhone:I | grep -E "GNAMMA_TAP_${kind} [0-9]+ [0-9]+" | tail -1 || true)"
    if [[ -n "$line" ]]; then
      echo "$line"
      echo "$line" | sed -nE "s/.*GNAMMA_TAP_${kind} ([0-9]+) ([0-9]+).*/\1 \2/p"
      return 0
    fi
    sleep 1
  done
  adb logcat -d -s GnammaPhone:V AndroidRuntime:E | tail -100 >&2
  return 1
}
tapP="$(await_tap P | tail -1)"
adb exec-out screencap -p > "$OUTPUT/01-source-P-markers.png"
read -r px py <<< "$tapP"
adb shell input tap "$px" "$py"
tapBack="$(await_tap BACK | tail -1)"
adb exec-out screencap -p > "$OUTPUT/02-personal-endnote.png"
read -r bx by <<< "$tapBack"
adb shell input tap "$bx" "$by"
sleep 1
adb exec-out screencap -p > "$OUTPUT/03-returned-to-source.png"
adb shell run-as org.gnamma.pnotetest cat files/phone-result.json > "$OUTPUT/android-report.json"
adb logcat -d -s GnammaPhone:V > "$OUTPUT/android-log.txt"
python3 - "$OUTPUT/android-report.json" <<'PY'
import json,sys
p=sys.argv[1];r=json.load(open(p))
print("Native Android emulator PDF report:",json.dumps(r,ensure_ascii=False,indent=2))
assert r["ok"],"Android native phone test failed"
assert r["pTapped"] and r["backTapped"]
assert r["forwardCount"]>=4 and r["returnCount"]>=2
PY
echo "PASS Android emulator: actual adb tap P marker → appendix → Return, PDF text search and screenshots"
