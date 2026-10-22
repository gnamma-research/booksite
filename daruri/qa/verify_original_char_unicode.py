#!/usr/bin/env python3
"""Read-only acceptance checks for the experimental 36-page Arabic source PDF.

This test never changes any PDF. It is an experiment, not a release approval.
"""
import argparse
from collections import defaultdict
import hashlib
import json
from pathlib import Path
import subprocess
import unicodedata

import fitz


def normalize(text):
    text = unicodedata.normalize("NFKC", text or "").replace("\u0640", "")
    return "".join(c for c in text if not unicodedata.combining(c)
                   and "\u0621" <= c <= "\u064a")


def check_link_equivalence(a, b):
    la, lb = a.get_links(), b.get_links()
    if len(la) != len(lb):
        return False
    def canonical(items):
        groups = defaultdict(list)
        for link in items:
            # Respect exact destination page, link kind, external URL and named target.
            key = (link.get("kind"), link.get("page"), link.get("uri"),
                   link.get("nameddest"))
            r = fitz.Rect(link["from"])
            pt = link.get("to")
            xyz = tuple(pt) if isinstance(pt, fitz.Point) else ()
            groups[key].append((tuple(r), xyz))
        return groups
    old, new = canonical(la), canonical(lb)
    if set(old) != set(new):
        return False
    for key in old:
        if len(old[key]) != len(new[key]):
            return False
        pool = list(new[key])
        for pos, target in old[key]:
            match = next((i for i, (loc, dest) in enumerate(pool)
                          if len(target) == len(dest)
                          and max([abs(x-y) for x,y in zip(pos,loc)] +
                                  [abs(x-y) for x,y in zip(target,dest)] +
                                  [0]) <= 0.01), None)
            if match is None:
                return False
            pool.pop(match)
    return True


def run(input_pdf, candidate, mapping, report):
    manifest = json.loads(mapping.read_text(encoding="utf-8"))
    expected_hash = manifest["source_sha256"]
    actual_hash = hashlib.sha256(input_pdf.read_bytes()).hexdigest()
    assert actual_hash == expected_hash, "Pango mapping must belong to original PDF"
    assert manifest["section_count"] == 258
    assert len(manifest["segments"]) == 414

    result = {"status": "NON-RELEASE, diagnostic only", "approved": False,
              "source_sha256": actual_hash, "tests": {}}

    with fitz.open(input_pdf) as original, fitz.open(candidate) as repaired:
        assert len(original) == len(repaired) == 36
        assert original.get_toc() == repaired.get_toc(), "Outline change"
        assert original.resolve_names() == repaired.resolve_names(), "Named destinations change"

        pix = 0
        links = 0
        for i in range(len(original)):
            pix += original[i].get_pixmap(alpha=False).samples == repaired[i].get_pixmap(alpha=False).samples
            links += check_link_equivalence(original[i], repaired[i])
        assert pix == links == len(original), (pix, links)
        result["tests"]["visual_pixel_identical"] = f"{pix}/{len(original)}"
        result["tests"]["links_semantically_identical"] = f"{links}/{len(original)}"
        result["tests"]["named_section_destinations"] = 258

        native_pages = [normalize(page.get_text(sort=False)) for page in repaired]
        native_search_2 = native_search_4 = native_bbox_2 = extracted = 0
        failures = []
        for section, words in manifest["segments"].items():
            num = int(words[0][1])
            first_page = [word for word in words if int(word[1]) == num]
            prefix = [word[0] for word in first_page[:min(len(first_page), 5)]]
            flat = normalize("".join(prefix))
            if flat in native_pages[num-1]:
                extracted += 1
            else:
                failures.append((section, "extract"))
            if len(prefix) >= 2:
                boxes = repaired[num-1].search_for(" ".join(prefix[:2]))
                native_search_2 += bool(boxes)
                expected = fitz.Rect(first_page[0][2:6])
                expected.include_rect(fitz.Rect(first_page[1][2:6]))
                native_bbox_2 += bool(boxes and any(
                    fitz.Rect(b).intersects(expected) for b in boxes))
                if not boxes and len(failures) < 30:
                    failures.append((section,"two-word-native-search"))
            # One of the 414 authorial segments has fewer than four words.
            # Probe up to four instead of silently treating the short segment as a miss.
            native_search_4 += bool(repaired[num-1].search_for(" ".join(prefix[:4])))

        result["tests"].update({
            "all_segment_extraction": f"{extracted}/414",
            "two_word_native_search": f"{native_search_2}/414",
            "up_to_four_word_native_search": f"{native_search_4}/414",
            "two_word_search_source_geometry": f"{native_bbox_2}/414",
        })

        # This tests 18 geographically distributed source regions for the old
        # replacement-codepoint copy bug, independently of whole-page search.
        clean_copy = 0
        old_bad = 0
        copy_samples = []
        items = list(manifest["segments"].items())
        for offset in range(0, len(items), 24):
            segment, words = items[offset]
            page_no = int(words[0][1])
            line_words = [v for v in words if int(v[1]) == page_no][:3]
            region = fitz.Rect(line_words[0][2:6])
            for word in line_words[1:]:
                region.include_rect(fitz.Rect(word[2:6]))
            new_text = repaired[page_no-1].get_textbox(region)
            old_text = original[page_no-1].get_textbox(region)
            old_bad += "\ufffd" in old_text
            ok = "\ufffd" not in new_text and normalize("".join(x[0] for x in line_words)) in normalize(new_text)
            clean_copy += ok
            if not ok:
                copy_samples.append({"segment": segment, "new_sample": new_text[:170]})
        result["tests"]["sampled_clean_copy_regions"] = f"{clean_copy}/18"
        result["tests"]["baseline_regions_with_replacement_glyphs"] = f"{old_bad}/18"
        result["copy_failures"] = copy_samples

    poppler = subprocess.check_output(["pdftotext", str(candidate), "-"], timeout=90).decode("utf8", "replace")
    pop_pages = [normalize(page) for page in poppler.split("\f")]
    pop_hit = 0
    for key, words in manifest["segments"].items():
        n = int(words[0][1])
        source_words = [word[0] for word in words if int(word[1]) == n][:5]
        pop_hit += normalize("".join(source_words)) in pop_pages[n-1]
    result["tests"]["poppler_authorial_segments"] = f"{pop_hit}/414"
    result["failures"] = failures[:30]
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print("DARURI_CHAR_UNICODE_QA", json.dumps(result["tests"], ensure_ascii=False), flush=True)
    assert extracted == native_search_2 == native_search_4 == native_bbox_2 == pop_hit == 414
    assert clean_copy == 18 and old_bad == 18
    return result


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--source", type=Path, required=True)
    p.add_argument("--candidate", type=Path, required=True)
    p.add_argument("--map", type=Path, required=True)
    p.add_argument("--report", type=Path, required=True)
    a = p.parse_args()
    run(a.source, a.candidate, a.map, a.report)
