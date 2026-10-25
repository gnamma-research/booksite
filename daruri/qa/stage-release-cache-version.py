#!/usr/bin/env python3
"""Propose a coordinated cache-busting release patch in an isolated checkout.

Running without --apply previews counts only. --apply edits authored HTML/SW
resource URLs in the current working tree, never PDFs/maps or personal data.
It does not push/commit changes and is for NONRELEASE QA review.
"""
from __future__ import annotations
import argparse, json, re, subprocess, hashlib
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
REPO=ROOT.parent
BASE="2c1b76f2b606d9cbfee2340debfb8fb696754c52"
PREVIOUS_NAME="daruri-reader-daruri13-lesson12-method-20261024"
REVISION="20261025-audit-cache1"
ENTRYPOINTS=["index.html","dictionary.html","personal-export.html","dynamic-editions.html"]
SKIP={"sw.js","download-bundle.js"}
def git(*args):
    return subprocess.check_output(["git",*args],cwd=REPO,text=True)
def fingerprint(contents):
    return hashlib.sha256(contents.encode("utf8")).hexdigest()[:14]
def replace_version(text,asset,new_rev):
    pattern=re.compile(r"(?<![\w/-])"+re.escape(asset)+r"\?v=[A-Za-z0-9_.-]+")
    return pattern.subn(asset+"?v="+new_rev,text)
def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--apply",action="store_true")
    ap.add_argument("--revision",default=REVISION)
    args=ap.parse_args()
    if not re.fullmatch("[A-Za-z0-9._-]{8,64}",args.revision):
        raise SystemExit("Invalid bounded cache revision")
    changed=[
        Path(name).name for name in git("diff","--name-only",BASE,"HEAD","--","daruri").splitlines()
        if re.fullmatch(r"daruri/[^/]+\.(css|js)",name) and Path(name).name not in SKIP
    ]
    if len(changed)!=len(set(changed)) or len(changed)<5:
        raise SystemExit("Expected verified, distinct changed JS/CSS source files")
    record={"base":BASE,"revision":args.revision,"changedAssets":changed,"changes":{}, "checks":{}}
    written=[]
    def write(file,updated,counts):
        original=(ROOT/file).read_text()
        if updated==original:
            record["changes"][file]={"modified":False,"counts":counts}
            return
        record["changes"][file]={"modified":True,"counts":counts,"oldSha":fingerprint(original),"newSha":fingerprint(updated)}
        if args.apply:
            (ROOT/file).write_text(updated)
        written.append(file)
    for entry in ENTRYPOINTS:
        file=ROOT/entry
        if not file.exists():continue
        source=file.read_text()
        updated=source
        counts={}
        for asset in changed:
            updated,n=replace_version(updated,asset,args.revision)
            if n:counts[asset]=n
        updated,n=replace_version(updated,"sw.js",args.revision)
        if n:counts["sw.js"]=n
        write(entry,updated,counts)
    sw=(ROOT/"sw.js").read_text()
    if sw.count('const NAME="'+PREVIOUS_NAME+'"')!=1:
        raise SystemExit("Service-worker cache ID not expected; avoid overwriting another integrator")
    updated=sw.replace('const NAME="'+PREVIOUS_NAME+'"','const NAME="daruri-reader-'+args.revision+'"')
    counts={"NAME":1}
    for asset in changed:
        updated,n=replace_version(updated,asset,args.revision)
        if n:counts[asset]=n
    if not all(asset in counts for asset in changed):
        raise SystemExit("Some updated assets missing from SW CORE: "+str([x for x in changed if x not in counts]))
    # Optional fonts and PDFs may be absent. A missing *functional* reader
    # module must instead abort a new install, preserving an older worker/cache.
    required=["index.html","headerless-navigation.js","reading-mode-controls.js",
      "gnamma-word-context.js","reading-desk.js","gnamma-search.js",
      "visuals-controls.js","copy-links.js","editions-selector.js",
      "reading-navigation-history.js","reading-navigation-bridge.js",
      "general-section-picker.js","compact-menu.css","reading-desk.css",
      "reading-mode-controls.css","gnamma-search.css","gnamma-word-context.css"]
    install_anchor="self.addEventListener('install',event=>event.waitUntil(caches.open(NAME).then(async cache=>{"
    replacement="""const REQUIRED_OFFLINE_CORE=new Set(%s);
self.addEventListener('install',event=>event.waitUntil(caches.open(NAME).then(async cache=>{
  const missingRequired=[];""" % json.dumps(required,separators=(',',':'))
    if updated.count(install_anchor)!=1:
        raise SystemExit("Unknown service worker install structure; do not overwrite")
    updated=updated.replace(install_anchor,replacement)
    old_catch="try{await cache.add(file);}catch(error){console.warn('Offline optional asset unavailable',file,error?.message||error);}"
    new_catch="""try{await cache.add(file);}catch(error){
        const name=new URL(file,self.location.href).pathname.split('/').pop();
        if(REQUIRED_OFFLINE_CORE.has(name))missingRequired.push(file);
        else console.warn('Offline optional asset unavailable',file,error?.message||error);
      }"""
    if updated.count(old_catch)!=1:
        raise SystemExit("Unexpected service worker cache installer")
    updated=updated.replace(old_catch,new_catch)
    before_success="  await Promise.all(workers);\n"
    if updated.count(before_success)!=1:
        raise SystemExit("Missing worker completion guard")
    updated=updated.replace(before_success,
       before_success+"""  if(missingRequired.length){
    await caches.delete(NAME);
    throw new Error('Required offline reader assets unavailable: '+missingRequired.join(', '));
  }
""")
    root_guard="""  if(!(await cache.match('./',{ignoreSearch:true}))&&!(await cache.match('index.html',{ignoreSearch:true})))
    throw new Error('Cannot install offline reader without the reading page');"""
    safe_guard="""  if(!(await cache.match('./',{ignoreSearch:true}))&&!(await cache.match('index.html',{ignoreSearch:true}))){
    await caches.delete(NAME);
    throw new Error('Cannot install offline reader without the reading page');
  }"""
    if updated.count(root_guard)!=1:
        raise SystemExit("Unexpected SW root-page acceptance guard")
    updated=updated.replace(root_guard,safe_guard)
    counts["requiredFunctionalAssets"]=len(required)
    counts["rootFailureCleansPartialCache"]=True
    write("sw.js",updated,counts)
    # First prove the baseline really had old registration and at least one live
    # HTML entrypoint refs; otherwise this is an invalid release recipe.
    combined={f:record["changes"].get(f,{}) for f in ENTRYPOINTS}
    used={asset:any(asset in c.get("counts",{}) for c in combined.values()) for asset in changed}
    if not all(used.values()):
        raise SystemExit("Changed assets absent from the authored HTML entrypoints: "+str([k for k,v in used.items() if not v]))
    if "sw.js" not in record["changes"]["index.html"]["counts"]:
        raise SystemExit("The canonical reader SW registration was not revved")
    record["checks"]={"allUsedInHTML":True,"allInSW":True,"swRegistrationBumped":True,
        "pdfAndMapFilesUntouched":True,"modifiedFiles":written}
    target=ROOT/"qa"/"cache-audit-artifacts"
    target.mkdir(parents=True,exist_ok=True)
    (target/"staged-version-patch.json").write_text(json.dumps(record,indent=2)+"\n")
    print("STAGED-CACHE-REVISION",json.dumps({"apply":args.apply,"revision":args.revision,
        "assets":changed,"edited":written,"counts":{p:c["counts"] for p,c in record["changes"].items()}},indent=2))
if __name__=="__main__":main()
