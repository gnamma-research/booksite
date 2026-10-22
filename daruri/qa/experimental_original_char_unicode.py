#!/usr/bin/env python3
"""NON-RELEASE original-source Arabic Unicode proof.

Preserve the approved PDF's visible glyph programs. Mark their bad selectable
source text with empty /ActualText, then place invisible character-level
Unicode glyphs at the SHA-pinned Pango rectangles.

This is a research proof for one *unvowelled* A4 Arabic Reading edition only.
Never overwrite an existing file, source map, generator, PDF or release assets.
"""
from __future__ import annotations

from collections import defaultdict
from pathlib import Path
import argparse
import hashlib
import json
import re
import unicodedata

import fitz

TM = re.compile(rb"(?m)^1 0 0 -1 ([0-9.]+) ([0-9.]+) Tm\r?\n")


def new_object(pdf, contents):
    xref = pdf.get_new_xref()
    pdf.update_object(xref, contents)
    return xref


def new_stream(pdf, data):
    xref = new_object(pdf, "<< /Length 0 >>")
    pdf.update_stream(xref, data)
    return xref


def graphemes(text):
    groups = []
    for char in text:
        if groups and (unicodedata.combining(char) or unicodedata.category(char).startswith("M")):
            groups[-1] += char
        else:
            groups.append(char)
    return groups


def source_lines(mapping):
    lines = defaultdict(list)
    for segment, words in mapping["segments"].items():
        if not segment.endswith((":ar", ":vocalized")):
            continue
        for word, page, x0, y0, x1, y1 in words:
            column = "R" if x0 > 300 else "L"
            lines[(int(page), round(y0, 3), column)].append(
                (word, float(x0), float(y0), float(x1), float(y1))
            )
    pages = defaultdict(list)
    for (page, y, column), words in lines.items():
        physical = sorted(words, key=lambda item: item[1])
        pages[page].append({
            "words": physical,
            "xmin": physical[0][1],
            "baseline": y + 12.6395,
            "column": column,
        })
    return pages


def remove_broken_text(page, planned):
    """Use PDF's standard /ActualText replacement on original painted source.

    Keep ALL original text drawing operations byte-identical; marks only the
    2,583 source line Tm groups. Leave headings, notes and numbering alone.
    """
    contents = page.get_contents()
    if len(contents) != 1:
        raise ValueError("Proof requires the approved single-stream PDF page")
    doc = page.parent
    raw = doc.xref_stream(contents[0])
    starts = list(TM.finditer(raw))
    edits = []
    matches = set()
    for line in planned:
        scores = sorted(
            (abs(float(m[1]) * 0.75 - line["xmin"]) +
             abs(float(m[2]) * 0.75 - line["baseline"]), index, m)
            for index, m in enumerate(starts)
        )
        if not scores or scores[0][0] > 0.05 or scores[0][1] in matches:
            best = [
                (round(score, 4), index, round(float(match[1])*0.75, 3),
                 round(float(match[2])*0.75, 3))
                for score, index, match in scores[:4]
            ]
            raise ValueError(
                f"Pango/source-Tm mismatch on PDF page {page.number+1}: "
                f"source xmin={line['xmin']:.3f}, "
                f"y0={line['words'][0][2]:.3f}, "
                f"estimated baseline={line['baseline']:.3f}, "
                f"nearest page Tm candidates (distance,index,x,y)={best}"
            )
        _, index, found = scores[0]
        matches.add(index)
        begin = found.end()
        next_start = starts[index+1].start() if index+1 < len(starts) else len(raw)
        endtext = raw.find(b"\nET\n", begin, next_start)
        end = endtext if endtext >= 0 else next_start
        edits.append((begin, b"/Span << /ActualText <FEFF> >> BDC\n"))
        edits.append((end, b"\nEMC\n"))
    for offset, addition in sorted(edits, key=lambda item: item[0], reverse=True):
        raw = raw[:offset] + addition + raw[offset:]
    doc.update_stream(contents[0], raw)


def cmap_for(aliases):
    lines = [
        "/CIDInit /ProcSet findresource begin", "12 dict begin", "begincmap",
        "/CIDSystemInfo << /Registry (Gnamma) /Ordering (SourceArabic) /Supplement 0 >> def",
        "/CMapName /GnammaSourceArabic def", "/CMapType 2 def",
        "1 begincodespacerange", "<0000> <FFFF>", "endcodespacerange",
    ]
    for offset in range(0, len(aliases), 100):
        subset = aliases[offset:offset + 100]
        lines.append(f"{len(subset)} beginbfchar")
        for cid, scalar, width in subset:
            lines.append(f"<{cid:04X}> <{scalar.encode('utf-16be').hex().upper()}>")
        lines.append("endbfchar")
    lines.extend(["endcmap", "CMapName currentdict /CMap defineresource pop", "end", "end"])
    return ("\n".join(lines) + "\n").encode("ascii")


def add_character_semantics(pdf, page, number, lines, fontfile_xref, font_size=13):
    # The printed Arabic is RTL. Each invisible line emits Unicode scalars in
    # visual/physical LTR order; engines recover logical Arabic through bidi.
    aliases, commands = [], []
    for line in sorted(lines, key=lambda item: (0 if item["column"] == "R" else 1,
                                                 item["words"][0][2])):
        words = line["words"]
        start_x = words[0][1]
        encoded = []
        right_edge = start_x
        for idx, (word, x0, y0, x1, y1) in enumerate(words):
            if abs(x0 - right_edge) > 0.1:
                raise ValueError("Pango line glyph advance or gap mismatch")
            chars = list(reversed(graphemes(word)))
            if not chars:
                raise ValueError("Empty source word")
            for char in chars:
                cid = len(aliases) + 1
                aliases.append((cid, char, (x1-x0) * 1000 / (len(chars)*font_size)))
                encoded.append(cid)
            right_edge = x1
            if idx+1 < len(words):
                gap = words[idx+1][1]-right_edge
                if gap < -0.3:
                    raise ValueError("Overlapping Arabic source word rectangles")
                cid = len(aliases)+1
                aliases.append((cid, " ", max(0, gap)*1000/font_size))
                encoded.append(cid)
                right_edge = words[idx+1][1]
        y_pdf = page.rect.height-(words[0][2]+16)
        commands.append(
            f"1 0 0 1 {start_x:.4f} {y_pdf:.4f} Tm\n"
            f"<{''.join(f'{c:04X}' for c in encoded)}> Tj"
        )
    if not aliases or len(aliases) >= 65535:
        raise ValueError("Empty or too-large page-local Unicode CID map")
    tounicode = new_stream(pdf, cmap_for(aliases))
    cidtogid = bytearray(2 * (len(aliases)+1))
    for cid, _, _ in aliases:
        cidtogid[2*cid+1] = 3  # An existing, but never painted, marker glyph.
    cidto = new_stream(pdf, bytes(cidtogid))
    descriptor = new_object(
        pdf, "<< /Type /FontDescriptor /FontName /GnammaSemanticArabic "
        "/Flags 4 /FontBBox [0 -634 1099 1069] /ItalicAngle 0 "
        "/Ascent 1069 /Descent -634 /CapHeight 1069 /StemV 80 "
        f"/FontFile2 {fontfile_xref} 0 R >>"
    )
    widths = " ".join(f"{cid} [{width:.6f}]" for cid, _, width in aliases)
    descendant = new_object(
        pdf, "<< /Type /Font /Subtype /CIDFontType2 "
        "/BaseFont /GnammaSemanticArabic "
        "/CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> "
        f"/FontDescriptor {descriptor} 0 R /CIDToGIDMap {cidto} 0 R "
        f"/DW 500 /W [{widths}] >>"
    )
    font = new_object(
        pdf, "<< /Type /Font /Subtype /Type0 /BaseFont /GnammaSemanticArabic "
        f"/Encoding /Identity-H /DescendantFonts [{descendant} 0 R] "
        f"/ToUnicode {tounicode} 0 R >>"
    )

    # The approved PDF shares a single resource/font dictionary across pages.
    # Clone them; modifying their shared originals would corrupt earlier pages.
    kind, source_res = pdf.xref_get_key(page.xref, "Resources")
    if kind != "xref":
        raise ValueError("Expected explicit page resources")
    res_xref = int(source_res.split()[0])
    kind, old_fonts = pdf.xref_get_key(res_xref, "Font")
    if kind != "xref":
        raise ValueError("Expected shared font resource reference")
    fonts_xref = int(old_fonts.split()[0])
    original = pdf.xref_object(fonts_xref).rstrip()
    if not original.endswith(">>"):
        raise ValueError("Invalid resource dictionary")
    cloned_fonts = new_object(
        pdf, original[:-2] + f" /GnammaSemantic {font} 0 R >>"
    )
    resource = pdf.xref_object(res_xref)
    token = f"/Font {fonts_xref} 0 R"
    if token not in resource:
        raise ValueError("Missing original font resource reference")
    cloned_resources = new_object(
        pdf, resource.replace(token, f"/Font {cloned_fonts} 0 R")
    )
    pdf.xref_set_key(page.xref, "Resources", f"{cloned_resources} 0 R")

    # Reset old WeasyPrint page CTM before appending a nonpainting text stream.
    page.wrap_contents()
    text = (
        "q\nBT\n/GnammaSemantic 13 Tf\n3 Tr\n" +
        "\n".join(commands) + "\nET\nQ\n"
    ).encode("ascii")
    semantic_stream = new_stream(pdf, text)
    old_streams = page.get_contents()
    pdf.xref_set_key(
        page.xref, "Contents",
        "[" + " ".join(f"{x} 0 R" for x in [*old_streams, semantic_stream]) + "]"
    )
    return len(aliases)


def build(original, mapping_path, output):
    original, mapping_path, output = Path(original), Path(mapping_path), Path(output)
    if output.exists() or original.resolve() == output.resolve():
        raise ValueError("Refusing to replace any existing file")
    mapping = json.loads(mapping_path.read_text(encoding="utf-8"))
    digest = hashlib.sha256(original.read_bytes()).hexdigest()
    if mapping["source_sha256"] != digest:
        raise ValueError("Refusing to combine source PDF with mismatched signed word map")
    source_segment_count = sum(
        key.endswith((":ar", ":vocalized")) for key in mapping["segments"]
    )
    if mapping.get("section_count") != 258 or source_segment_count != 414:
        raise ValueError(
            f"Expected 258 source anchors and 414 Arabic source segments, "
            f"got {mapping.get('section_count')} anchors and {source_segment_count} source segments"
        )
    pages = source_lines(mapping)
    with fitz.open(original) as doc:
        # This unvowelled Reading source embeds its Naskh subset in FontFile2.
        font = next(
            x for x in doc[0].get_fonts()
            if "Noto-Naskh-Arabic" in x[3] and "Semi" not in x[3]
               and "Bold" not in x[3]
        )
        type0 = doc.xref_object(font[0])
        match = re.search(r"/DescendantFonts\s*\[\s*(\d+)\s+0\s+R\s*\]", type0)
        if not match:
            raise ValueError("Missing Arabic source descendant font")
        descendant = doc.xref_object(int(match[1]))
        descriptor_ref = re.search(r"/FontDescriptor\s+(\d+)\s+0\s+R", descendant)
        if not descriptor_ref:
            raise ValueError("Missing source font descriptor")
        descriptor = doc.xref_object(int(descriptor_ref[1]))
        file_ref = re.search(r"/FontFile2\s+(\d+)\s+0\s+R", descriptor)
        if not file_ref:
            raise ValueError("Missing preserved source font bytes")
        fontfile = int(file_ref[1])
        total_lines = total_cids = 0
        for page_no, source_on_page in sorted(pages.items()):
            page = doc[page_no-1]
            remove_broken_text(page, source_on_page)
            total_lines += len(source_on_page)
            total_cids += add_character_semantics(
                doc, page, page_no, source_on_page, fontfile
            )
        if original.name == "daruri-reading-arabic-titles-off.pdf" and total_lines != 2583:
            raise ValueError(f"Unexpected unvowelled Arabic Reading line coverage {total_lines}/2583")
        output.parent.mkdir(parents=True, exist_ok=True)
        doc.save(output, garbage=4, deflate=True)
    print(json.dumps({
        "status": "NON-RELEASE EXPERIMENT",
        "input_sha256": digest, "source_lines": total_lines,
        "unicode_aliases": total_cids, "output": str(output),
    }, ensure_ascii=False))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--map", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    build(args.input, args.map, args.output)
