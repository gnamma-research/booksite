#!/usr/bin/env python3
"""Stage VII exact cumulative build: preserve existing canonical corpus, append verified evidence."""
from __future__ import annotations
import hashlib, json, re, datetime
from pathlib import Path
ROOT=Path("texts/al-farghani/muntaha-al-madarik")
E=ROOT/"editorial"
previous=E/"FULL_CUMULATIVE_CRITICAL_006.md"
if not previous.is_file() or previous.stat().st_size < 1_000_000:
    raise SystemExit("Refusing to construct a cumulative edition: prior VI archive missing or unexpectedly short.")
base_text=previous.read_text(encoding="utf-8")
review_files=[
    E/"I1876_COLLATION_STAGE_007.md",
    E/"I1876_COLLATION_CUMULATIVE_004.json",
    E/"CRITICAL_LOCUS_REGISTER_004.json",
    E/"COLLATION_MATRIX_I1876_005.csv",
    E/"STAGE_HANDOFF_CRITICAL_007.md",
    E/"STATUS.md",
    E/"CRITICAL_COVERAGE_REGISTER.json",
    E/"WITNESS_REGISTER.json",
]
for f in review_files:
    if not f.is_file() or f.stat().st_size<100:
        raise SystemExit("Missing required evidence file: "+str(f))
collation=json.loads((E/"I1876_COLLATION_CUMULATIVE_004.json").read_text(encoding="utf-8"))
witness=json.loads((E/"WITNESS_REGISTER.json").read_text(encoding="utf-8"))
quality=json.loads((E/"CRITICAL_COVERAGE_REGISTER.json").read_text(encoding="utf-8"))
assert len(collation["comparisons"])==10
assert collation["historical_print_differences"]==5
assert collation["historical_print_agreements"]==4
assert collation["verified_manuscript_variants"]==0
assert witness["scope"]["verified_manuscript_variant_count"]==0
assert quality["clause_record_count"]==198
# Verify 128 complete previous draft source-page section markers rather than inferring from a title.
master=(E/"WORKING_TRANSLATION_18_145.md").read_text(encoding="utf-8")
pages=[int(m.group(1)) for m in re.finditer(r"^#{2,4}\s*B2007\s*p\.\s*(\d+)\b",master,re.M)]
if sorted(set(pages))!=list(range(18,146)):
    raise SystemExit("Working 128-page master did not pass page integrity: "+repr((len(pages),pages[:4],pages[-4:])))
# Count source-checked clauses without confusing modern source checks with early manuscripts.
all_records=[]
for i,span in [(1,"18-20"),(2,"21-23"),(3,"24-29"),(4,"30-36")]:
    raw=(ROOT/f"data/critical-pass-{i:03d}-p{span}.js").read_text(encoding="utf-8")
    obj=json.loads(raw[raw.index("=")+1:].strip().rstrip(";"))
    all_records.extend(obj["records"])
if len(all_records)!=198 or len({r["id"] for r in all_records})!=198:
    raise SystemExit("Clause record integrity failed: "+str(len(all_records)))
# Stage VI is append-only: original large V content begins at a stable boundary.
preamble=("# Farghānī · Complete cumulative Arabic–English working and source-critical archive VI\n\n"
"**9 November 2026.** Complete inherited Stage V corpus preserved verbatim below. "
"This new stage adds ten visually compared *printed* source loci in all, five differences and five agreements, "
"with no medieval manuscript variants verified. Current quality is **working evidence-corrected**, NOT definitive.\n\n"
"**Do not read inherited older stage statuses as current; the latest report and register are appended at the end.**\n\n"
"## Part A · Entire preserved prior full cumulative archive V\n\n")
chunks=[preamble,base_text]
for f in review_files:
    src=f.read_text(encoding="utf-8")
    label=f"\n\n---\n\n## Stage VII addendum · {f.name}\n\n"
    if f.suffix.lower()==".json":
        src="\x60\x60\x60json\n"+src+"\n\x60\x60\x60"
    elif f.suffix.lower()==".csv":
        src="\x60\x60\x60csv\n"+src+"\n\x60\x60\x60"
    chunks.extend([label,src])
body="".join(chunks)
new=E/"FULL_CUMULATIVE_CRITICAL_007.md"
new.write_text(body,encoding="utf-8")
if base_text not in body:
    raise SystemExit("Prior archive not preserved")
sha=lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
manifest={
 "schema":"gnamma-farghani-cumulative-vii-v1",
 "built_at_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),
 "status":"working source-corrected, NOT manuscript critical definitive",
 "scope":"Muntaha al-madarik authorial Arabic introduction and final preface, B2007 pp18-145",
 "previous_complete_archive":str(previous),"previous_complete_archive_sha256":sha(previous),
 "new_complete_archive":str(new),"new_complete_archive_sha256":sha(new),
 "new_archive_utf8_bytes":new.stat().st_size,
 "arabic_text_bilingual_status":"198 selected modern digital source checks; no full continuous manuscript-proofed copy-text",
 "english_working_draft_beirut_pages":[18,145],"english_working_draft_page_count":128,
 "modern_source_checked_clause_count":198,
 "historical_print_selected_comparisons":10,
 "historical_print_differences":5,
 "historical_print_agreements":5,
 "historical_print_whole_pages_fully_collated":0,
 "medieval_manuscripts_actual_folios_seen":0,
 "manuscript_variants_independently_verified":0,
 "first_next_unchecked_modern_arabic_page":37,
 "artifacts":[{"path":str(f),"sha256":sha(f),"bytes":f.stat().st_size} for f in review_files]
}
mf=E/"STAGE_MANIFEST_CRITICAL_007.json"
mf.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"new_bytes":manifest["new_archive_utf8_bytes"],"previous_bytes":previous.stat().st_size,"full_page_headings":len(pages),"modern_clauses":len(all_records),"print_compared":10,"differences":5,"agreements":5,"manuscript_variants":0},ensure_ascii=False))
