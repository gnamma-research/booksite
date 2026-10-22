#!/usr/bin/env python3
"""Measure process-tree memory, wall time, and success for one render."""
import subprocess, psutil, sys, os, signal, time, json
from pathlib import Path
name=sys.argv[1]
cmd=sys.argv[2:]
start=time.perf_counter()
p=subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,start_new_session=True)
peak_pss=0
peak_rss=0
peak_children=0
error=None
while p.poll() is None:
 try:
  root=psutil.Process(p.pid)
  procs=[root]+root.children(recursive=True)
  pss=rss=0
  for q in procs:
   try:
    m=q.memory_full_info();pss+=getattr(m,"pss",m.rss);rss+=m.rss
   except (psutil.NoSuchProcess,psutil.AccessDenied,psutil.ZombieProcess): pass
  peak_pss=max(peak_pss,pss);peak_rss=max(peak_rss,rss);peak_children=max(peak_children,len(procs))
 except psutil.NoSuchProcess:pass
 if time.perf_counter()-start>210 or peak_pss>3.5*1073741824:
  error="time_or_memory_limit"
  try: os.killpg(p.pid,signal.SIGKILL)
  except ProcessLookupError:pass
  break
 time.sleep(.15)
out,err=p.communicate()
record={"test":name,"status":error or ("ok" if p.returncode==0 else "error"),
 "returncode":p.returncode,"wall_seconds":round(time.perf_counter()-start,2),
 "peak_process_tree_pss_mb":round(peak_pss/1048576,1),
 "peak_process_tree_rss_sum_mb":round(peak_rss/1048576,1),
 "peak_process_count":peak_children,
 "stdout_tail":out[-2000:],"stderr_tail":err[-3000:]}
folder=Path(__file__).parent
(folder/f"{name}.metrics.json").write_text(json.dumps(record,ensure_ascii=False,indent=2))
(folder/f"{name}.log").write_text(out+"\n\nSTDERR\n"+err)
print(json.dumps({k:v for k,v in record.items() if not k.endswith("_tail")},ensure_ascii=False))
if error or p.returncode:sys.exit(1)
