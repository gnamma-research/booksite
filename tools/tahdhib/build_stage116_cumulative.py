#!/usr/bin/env python3
"""Assemble LOSSLESS Stage116 cumulative historical English master + apparatus.

The complete Stage114 1,090-entry text is an immutable byte prefix.
No original note is rewritten, and no new note status is falsely certified.
Run only after all Stage116 editorial files are committed to the repository.
"""
from pathlib import Path
from hashlib import sha256
import json,re

ROOT=Path("texts/al-taftazani/tahdhib-al-mantiq/edition")
base=ROOT/"batches/hawashi-all-sections-cumulative-stage114.md"
out=ROOT/"batches/hawashi-all-sections-cumulative-stage116.md"
index=ROOT/"STAGE116_CUMULATIVE_FILE_INTEGRITY.json"
source=base.read_bytes()
oldtext=source.decode("utf-8")
n_old=len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",oldtext))
assert n_old==1090, ("Source master is unexpectedly incomplete",n_old)
def sha(b):return sha256(b).hexdigest()
append_files=[
 ("Stage115 source-table reconstruction", ROOT/"Tahdhib_Stage115_Source_Based_Table_Audit.md"),
 ("Stage116 photographed originals and limits", ROOT/"STAGE116_PRINTED_TABLE_PHOTOGRAPHIC_AUDIT.md"),
 ("Stage116 five-locus Arabic to English checks", ROOT/"STAGE116_CLAUSE_ALIGNMENT.md"),
 ("Stage116 two photographed Q309 examples with literal translation", ROOT/"STAGE116_Q309_TWO_EXAMPLES_PHOTO_TRANSLATED.md"),
 ("Stage116 fourth-figure modal proof ledger", ROOT/"STAGE116_MODAL_PROOF_OBLIGATIONS.md"),
 ("Stage116 complete recovery handoff", ROOT/"HANDOFF_LATEST.md"),
]
sep="\n\n---\n\n# Editorial appendices · Tahdhīb Stage116\n\n"
sheets=[]
for label,path in append_files:
    b=path.read_bytes()
    sheets.append({
        "label":label,"path":str(path),"originalBytes":len(b),
        "originalSHA256":sha(b)})
    sep+="\n\n---\n\n## "+label+"\n\n"+b.decode("utf-8")+"\n"
append=sep.encode("utf-8")
combined=source+append
assert combined[:len(source)]==source, "MUST preserve original Stage114 master byte-for-byte"
new_count=len(re.findall(r"(?m)^## HWN-[A-Z0-9-]+",combined.decode("utf-8")))
assert new_count==1090,("Numbered historical note headings unexpectedly altered",new_count)
out.parent.mkdir(parents=True,exist_ok=True)
out.write_bytes(combined)
data={
 "stage":116,"date":"2026-11-12",
 "status":"full historical H English first-pass + appendices, not fully Arabic collated",
 "numberedPositions":1090,"englishFirstPass":1029,"sourceTableGapsStillInCorpus":4,
 "modernReferenceOnly":57,"source":"Stage114 full original historical H markdown",
 "canonicalSourcePath":str(base),"canonicalSourceByteCount":len(source),
 "canonicalSourceSHA256":sha(source),"appendixByteCount":len(append),
 "outputPath":str(out),"outputByteCount":len(combined),
 "outputSHA256":sha(combined),"prefixPreservedByteForByte":True,
 "appended":sheets,
 "independentManuscriptReadingCertified":False,
 "newFullModal46ProofsCertified":0
}
index.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
print("Stage116 cumulative",json.dumps({k:data[k] for k in ("numberedPositions","canonicalSourceByteCount","outputByteCount","prefixPreservedByteForByte","outputSHA256")},ensure_ascii=False))
