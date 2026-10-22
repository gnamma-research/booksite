#!/usr/bin/env python3
"""Diagnostic release-parity audit (read-only; never publishes or mutates master).
Compare canonical HTML/WeasyPrint regeneration against the ACTUAL current PDF.
This refuses to claim equivalence on note counts or page counts alone.
"""
from __future__ import annotations
import argparse,hashlib,json,os,re,subprocess,sys,time,traceback
from pathlib import Path
import fitz,psutil
ROOT=Path(__file__).resolve().parents[1]
D=ROOT/"daruri"
NAMES={"scholarly":"daruri.pdf","study":"daruri-study.pdf","english":"daruri-english.pdf",
       "arabic":"daruri-arabic.pdf","arabic-vowelled":"daruri-arabic-vowelled.pdf"}
def sha(path):
 h=hashlib.sha256()
 with open(path,"rb") as f:
  while buf:=f.read(1024*1024):h.update(buf)
 return h.hexdigest()
def get_words(page):
 return [(w[4],tuple(round(x,2) for x in w[:4])) for w in page.get_text("words",sort=False)]
def safe_destinations(pdf):
 try:
  names=pdf.resolve_names()
  return {k:int(v.get("page",-1))+1 for k,v in names.items() if isinstance(v,dict)}
 except Exception:return {}
def process_test(edition,target):
 filename=NAMES[edition];published=D/filename
 manifest=json.loads((D/"pdf-editions-manifest.json").read_text())["files"][filename]
 meta=json.loads((D/"build/release"/(filename+".metadata.json")).read_text())
 result={"edition":edition,"reference":filename,"reference_sha_manifest":manifest["sha256"],
         "reference_sha_actual":sha(published),"reference_metadata_sha":meta.get("sha256"),
         "published_identity_ok":False}
 result["published_identity_ok"]=(result["reference_sha_actual"]==manifest["sha256"]==meta["sha256"])
 assert result["published_identity_ok"],"Reference edition sha disagree; cannot certify parity"
 target.mkdir(parents=True,exist_ok=True)
 cmd=[sys.executable,str(D/"build/build_editions.py"),"--edition",edition,"--output-dir",str(target)]
 p=subprocess.Popen(cmd,stdout=(target/"build.stdout").open("w"),stderr=(target/"build.stderr").open("w"),start_new_session=True)
 tic=time.monotonic();pss_peak=rss_peak=0;fail=""
 while p.poll() is None:
  try:
   ps=psutil.Process(p.pid)
   procs=[ps]+ps.children(recursive=True);pss=rss=0
   for child in procs:
    try:
     mem=child.memory_full_info();pss+=getattr(mem,"pss",mem.rss);rss+=mem.rss
    except (psutil.NoSuchProcess,psutil.AccessDenied,psutil.ZombieProcess):pass
   pss_peak=max(pss_peak,pss);rss_peak=max(rss_peak,rss)
  except psutil.NoSuchProcess:pass
  if time.monotonic()-tic>1200:
   fail="Build exceeded 1200 seconds";p.kill();break
  time.sleep(.2)
 code=p.wait()
 result.update(build_returncode=code,build_error=fail,wall_seconds=round(time.monotonic()-tic,3),
               peak_pss_mb=round(pss_peak/1048576,1),peak_rss_sum_mb=round(rss_peak/1048576,1))
 built=target/filename
 if code!=0 or not built.exists():
  result["build_failed"]=True
  result["stderr_tail"]=(target/"build.stderr").read_text(errors="replace")[-6000:]
  return result
 result["build_sha"]=sha(built)
 result["byte_identical"]=result["reference_sha_actual"]==result["build_sha"]
 with fitz.open(published) as base,fitz.open(built) as out:
  result["reference_pages"]=base.page_count;result["built_pages"]=out.page_count
  result["reference_links"]=sum(len(p.get_links()) for p in base)
  result["built_links"]=sum(len(p.get_links()) for p in out)
  result["reference_bookmarks"]=len(base.get_toc())
  result["built_bookmarks"]=len(out.get_toc())
  result["reference_names"]=len(safe_destinations(base))
  result["built_names"]=len(safe_destinations(out))
  bn=safe_destinations(base);on=safe_destinations(out)
  required=[f"section-{i}" for i in range(1,259)]+["section-colophon"]
  result["required_destinations"]={"published_present":sum(k in bn for k in required),
          "built_present":sum(k in on for k in required),
          "same_page":sum(bn.get(k)==on.get(k) for k in required),
          "missing_built":[k for k in required if k not in on][:30],
          "changed":[{"id":k,"published":bn.get(k),"built":on.get(k)} for k in required if k in bn and k in on and bn[k]!=on[k]][:15]}
  result["outline_pages_identical"]= [(x[0],x[2]) for x in base.get_toc()] == [(x[0],x[2]) for x in out.get_toc()]
  result["page_text_hash_matches"]=0;result["page_word_geometry_matches"]=0
  result["text_char_count_published"]=result["text_char_count_built"]=0
  result["text_first_changed_pages"]=[];result["geometry_first_changed_pages"]=[]
  for i in range(min(base.page_count,out.page_count)):
   a,b=base[i],out[i];at=a.get_text(sort=False);bt=b.get_text(sort=False)
   result["text_char_count_published"]+=len(at)
   result["text_char_count_built"]+=len(bt)
   if at==bt:result["page_text_hash_matches"]+=1
   elif len(result["text_first_changed_pages"])<12:
    result["text_first_changed_pages"].append({"page":i+1,"published_chars":len(at),"built_chars":len(bt),
          "published_excerpt":at[:120],"built_excerpt":bt[:120]})
   if get_words(a)==get_words(b):result["page_word_geometry_matches"]+=1
   elif len(result["geometry_first_changed_pages"])<12:result["geometry_first_changed_pages"].append(i+1)
  if base.page_count!=out.page_count:
   result["text_char_count_published"]+=sum(len(base[i].get_text()) for i in range(min(base.page_count,out.page_count),base.page_count))
   result["text_char_count_built"]+=sum(len(out[i].get_text()) for i in range(min(base.page_count,out.page_count),out.page_count))
  # Render representative pages and compare pixels at 110 dpi. Retain evidence only if diverged.
  raster=[]
  if not result["byte_identical"]:
   for i in sorted({0,1,2,min(base.page_count,out.page_count)//2,
         min(base.page_count,out.page_count)-1,
         max(0,bn.get("section-1",1)-1),
         max(0,bn.get("section-191",1)-1)}):
    if i<0 or i>=min(base.page_count,out.page_count):continue
    ap=base[i].get_pixmap(matrix=fitz.Matrix(1.35,1.35),colorspace=fitz.csGRAY,alpha=False)
    bp=out[i].get_pixmap(matrix=fitz.Matrix(1.35,1.35),colorspace=fitz.csGRAY,alpha=False)
    if ap.width!=bp.width or ap.height!=bp.height:
     raster.append({"page":i+1,"size_changed":True});continue
    ab,bb=ap.samples,bp.samples
    diffs=sum(x!=y for x,y in zip(ab,bb))
    raster.append({"page":i+1,"pixels_different_pct":round(100*diffs/len(ab),3),
                   "mean_absolute_pixel_difference":round(sum(abs(x-y) for x,y in zip(ab,bb))/len(ab),3)})
    if diffs:
     # Save only 2 pair images for manual review; avoid large artifacts.
     if len([v for v in raster if v.get("proof_saved")])<2:
      ap.save(target/f"published_p{i+1}.png")
      bp.save(target/f"rebuilt_p{i+1}.png")
      raster[-1]["proof_saved"]=True
  result["raster_samples"]=raster
  result["completely_equivalent"]=(result["byte_identical"] or
       result["reference_pages"]==result["built_pages"] and
       result["page_text_hash_matches"]==base.page_count and
       result["page_word_geometry_matches"]==base.page_count and
       result["outline_pages_identical"] and
       result["required_destinations"]["same_page"]==259 and
       result["reference_links"]==result["built_links"] and
       all(x.get("pixels_different_pct",0)==0 for x in raster))
 return result

if __name__=="__main__":
 arg=argparse.ArgumentParser()
 arg.add_argument("--edition",required=True,choices=list(NAMES))
 arg.add_argument("--out",type=Path,default=Path("/tmp/gnamma_pdf_parity"))
 a=arg.parse_args();out=a.out/a.edition;out.mkdir(parents=True,exist_ok=True)
 try:
  result=process_test(a.edition,out)
 except Exception as exc:
  result={"edition":a.edition,"error":str(exc),"traceback":traceback.format_exc()}
 (out/"parity.json").write_text(json.dumps(result,indent=2,ensure_ascii=False))
 print(json.dumps({k:v for k,v in result.items() if k not in ["text_first_changed_pages","geometry_first_changed_pages","raster_samples"]},indent=2))
 # Builds may differ; do not abort artifacts collection, but make parity status explicit.
