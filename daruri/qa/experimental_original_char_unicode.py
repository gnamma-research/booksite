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


def remove_broken_text(page, planned, all_source_runs=False, suppress_note_span=False):
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
        y0 = line["words"][0][2]
        height = line["words"][0][4] - y0
        if not height > 0:
            raise ValueError("Invalid source line height")
        scores = []
        for index, match in enumerate(starts):
            x = float(match[1]) * 0.75
            y = float(match[2]) * 0.75
            rise = y - y0
            # Source box and WeasyPrint's text baseline vary across
            # vowelled/unvowelled, Study and Scholarly typography.
            # Enforce a unique matching X and a baseline inside the map's
            # true source glyph box; never guess an adjacent non-source line.
            if (abs(x - line["xmin"]) <= 0.035
                    and 0.28 * height <= rise <= 0.85 * height):
                score = abs(rise - 0.57 * height) + abs(x-line["xmin"])
                scores.append((score,index,match))
        scores.sort()
        if not scores or scores[0][1] in matches:
            alternatives = [
                (round(float(m[1])*0.75,3), round(float(m[2])*0.75,3))
                for m in starts
                if abs(float(m[1])*0.75-line["xmin"]) <= 0.1
            ][:6]
            raise ValueError(
                f"Unmatched or nonunique source line on PDF page {page.number+1}: "
                f"left={line['xmin']:.3f}, source y0={y0:.3f}, "
                f"height={height:.3f}, viable candidates={len(scores)}, "
                f"similar-X baselines={alternatives}"
            )
        _, index, found = scores[0]
        target_y=float(found[2])*0.75
        # An inline note call can divide one authorial Arabic line into
        # multiple Tm runs at the SAME baseline (e.g. scholarly §65:1).
        # The old single-Tm suppression left source garbage selectable before
        # its note reference. Preserve the distinct, slightly raised marker:
        # suppress only the Arabic Tm runs at the author's exact baseline.
        source_runs=[index]
        if all_source_runs:
            left=line["xmin"]-0.04
            right=max(word[3] for word in line["words"])+0.04
            source_runs=[
                i for i,m in enumerate(starts)
                if abs(float(m[2])*0.75-target_y)<0.035
                and left<=float(m[1])*0.75<=right
            ]
            if index not in source_runs:
                raise ValueError("Exact source origin was omitted from all-run suppression")
        if suppress_note_span and len(source_runs)>1:
            # Native Apple PDFKit does not reliably suppress two separate
            # BDC tags flanking a raised inline footnote call. Test a single
            # marked-content span covering the whole broken Arabic line.
            # The note's visible glyph/link is unchanged; its extracted call
            # number may be suppressed, so this remains nonrelease research.
            for ix in source_runs:
                if ix in matches:
                    raise ValueError("Overlapping original source-line claim")
                matches.add(ix)
            first_index=min(source_runs)
            last_index=max(source_runs)
            begin=starts[first_index].end()
            following=starts[last_index+1].start() if last_index+1<len(starts) else len(raw)
            endtext=raw.find(b"\nET\n",begin,following)
            end=endtext if endtext>=0 else following
            edits.append((begin,b"/Span << /ActualText <FEFF> >> BDC\n"))
            edits.append((end,b"\nEMC\n"))
        else:
            for ix in source_runs:
                if ix in matches:
                    raise ValueError("Two unrelated source lines claimed the same glyph run")
                matches.add(ix)
                found=starts[ix]
                begin=found.end()
                next_start=starts[ix+1].start() if ix+1<len(starts) else len(raw)
                endtext=raw.find(b"\nET\n",begin,next_start)
                end=endtext if endtext>=0 else next_start
                edits.append((begin,b"/Span << /ActualText <FEFF> >> BDC\n"))
                edits.append((end,b"\nEMC\n"))
    for offset, addition in sorted(edits, key=lambda item: item[0], reverse=True):
        raw = raw[:offset] + addition + raw[offset:]
    doc.update_stream(contents[0], raw)


def cmap_for(aliases, logical_cluster_payload=False):
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
            # The glyph stream is emitted in visual RTL order; extractors
            # reorder multiple Unicode scalars inside each source grapheme.
            # Reverse the serialized cluster (not the source text) so the
            # extracted/copied word retains BASE followed by its vowel marks.
            # This is a no-op for unvowelled one-codepoint characters.
            physical = scalar if logical_cluster_payload else (scalar[::-1] if len(scalar) > 1 else scalar)
            lines.append(f"<{cid:04X}> <{physical.encode('utf-16be').hex().upper()}>")
        lines.append("endbfchar")
    lines.extend(["endcmap", "CMapName currentdict /CMap defineresource pop", "end", "end"])
    return ("\n".join(lines) + "\n").encode("ascii")


def add_character_semantics(pdf, page, number, lines, fontfile_xref, font_size=13, scalar_harakat=False, word_actualtext=False, logical_cluster_payload=False, scalar_mark_fraction=0.0, line_actualtext=False, semantic_first=False):
    # The printed Arabic is RTL. Each invisible line emits Unicode scalars in
    # visual/physical LTR order; engines recover logical Arabic through bidi.
    aliases, commands = [], []
    for line in sorted(lines, key=lambda item: (0 if item["column"] == "R" else 1,
                                                 item["words"][0][2])):
        words = line["words"]
        start_x = words[0][1]
        encoded = []
        word_ops = []
        right_edge = start_x
        for idx, (word, x0, y0, x1, y1) in enumerate(words):
            if abs(x0 - right_edge) > 0.1:
                raise ValueError("Pango line glyph advance or gap mismatch")
            word_codes = []
            groups = list(reversed(graphemes(word)))
            if not groups:
                raise ValueError("Empty source word")
            for group in groups:
                # Experimental cross-viewer variant: represent each vowel
                # mark by its own zero-advance CID, rather than encoding
                # base+diacritics as a multi-scalar /ToUnicode glyph. Engines
                # disagree about internal CID payload bidi ordering.
                chars = list(reversed(group)) if scalar_harakat else [group]
                for char in chars:
                    cid = len(aliases) + 1
                    # A non-scalar grapheme may contain base + several marks;
                    # Unicode combining() accepts exactly one codepoint.
                    is_mark = len(char) == 1 and bool(unicodedata.combining(char))
                    group_width = (x1-x0) * 1000 / (len(groups)*font_size)
                    if scalar_harakat and scalar_mark_fraction:
                        marks=sum(bool(unicodedata.combining(c)) for c in group)
                        mark_width=min(group_width*scalar_mark_fraction,group_width*0.8/max(1,marks))
                        advance=mark_width if is_mark else group_width-mark_width*marks
                    else:
                        advance=0 if scalar_harakat and is_mark else group_width
                    aliases.append((cid, char, advance))
                    encoded.append(cid)
                    word_codes.append(cid)
            if word_actualtext:
                utf16 = 'FEFF'+word.encode('utf-16be').hex().upper()
                word_ops.append(f'/Span << /ActualText <{utf16}> >> BDC')
                word_ops.append("<" + "".join(format(c, "04X") for c in word_codes) + "> Tj")
                word_ops.append('EMC')
            right_edge = x1
            if idx+1 < len(words):
                gap = words[idx+1][1]-right_edge
                if gap < -0.3:
                    raise ValueError("Overlapping Arabic source word rectangles")
                cid = len(aliases)+1
                aliases.append((cid, " ", max(0, gap)*1000/font_size))
                encoded.append(cid)
                if word_actualtext:
                    word_ops.append(f'<{cid:04X}> Tj')
                right_edge = words[idx+1][1]
        y_pdf = page.rect.height-(words[0][2]+16)
        if line_actualtext:
            logical_line=" ".join(w[0] for w in reversed(words))
            escaped=("FEFF"+logical_line.encode("utf-16be").hex().upper())
            commands.append(
                f"/Span << /ActualText <{escaped}> >> BDC\n"
                f"BT\n/GnammaSemantic 13 Tf\n3 Tr\n"
                f"1 0 0 1 {start_x:.4f} {y_pdf:.4f} Tm\n"
                f"<{''.join(f'{c:04X}' for c in encoded)}> Tj\n"
                f"ET\nEMC"
            )
        elif word_actualtext:
            commands.append(
                f"1 0 0 1 {start_x:.4f} {y_pdf:.4f} Tm\n" + '\n'.join(word_ops)
            )
        else:
            commands.append(
                f"1 0 0 1 {start_x:.4f} {y_pdf:.4f} Tm\n"
                f"<{''.join(f'{c:04X}' for c in encoded)}> Tj"
            )
    if not aliases or len(aliases) >= 65535:
        raise ValueError("Empty or too-large page-local Unicode CID map")
    tounicode = new_stream(pdf, cmap_for(aliases, logical_cluster_payload=logical_cluster_payload))
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
    if line_actualtext:
        text=("q\n"+"\n".join(commands)+"\nQ\n").encode("ascii")
    else:
        text=(
            "q\nBT\n/GnammaSemantic 13 Tf\n3 Tr\n" +
            "\n".join(commands) + "\nET\nQ\n"
        ).encode("ascii")
    semantic_stream = new_stream(pdf, text)
    old_streams = page.get_contents()
    page_streams=[semantic_stream,*old_streams] if semantic_first else [*old_streams,semantic_stream]
    pdf.xref_set_key(
        page.xref, "Contents",
        "[" + " ".join(f"{x} 0 R" for x in page_streams) + "]"
    )
    return len(aliases)


def build(original, mapping_path, output, scalar_harakat=False, word_actualtext=False, logical_cluster_payload=False, scalar_mark_fraction=0.0, line_actualtext=False, all_source_runs=False, suppress_note_span=False, semantic_first=False):
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
            remove_broken_text(page, source_on_page, all_source_runs=all_source_runs, suppress_note_span=suppress_note_span)
            total_lines += len(source_on_page)
            total_cids += add_character_semantics(
                doc, page, page_no, source_on_page, fontfile,
                scalar_harakat=scalar_harakat,word_actualtext=word_actualtext,logical_cluster_payload=logical_cluster_payload,scalar_mark_fraction=scalar_mark_fraction,line_actualtext=line_actualtext,semantic_first=semantic_first
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
    parser.add_argument("--scalar-harakat", action="store_true", help="Experimental one-scalar-per-CID vocalization mapping")
    parser.add_argument("--word-actualtext", action="store_true", help="Experiment: tagged original Unicode word replacements")
    parser.add_argument("--logical-cluster-payload", action="store_true", help="Research: preserve logical grapheme Unicode order in ToUnicode for native PDFKit")
    parser.add_argument("--scalar-mark-fraction", type=float, default=0.0, help="Experimental fraction of glyph advance reserved for each combining mark")
    parser.add_argument("--line-actualtext", action="store_true", help="Experiment: outside-BT marked-content source line replacement")
    parser.add_argument("--all-source-runs", action="store_true", help="Hide all original Arabic Tm runs divided by inline publisher source-note markers")
    parser.add_argument("--suppress-note-span", action="store_true", help="Research: continuous ActualText suppression across an inline footnote call")
    parser.add_argument("--semantic-first", action="store_true", help="Research: place invisible semantic page stream before original painted glyphs")
    args = parser.parse_args()
    assert 0<=args.scalar_mark_fraction<=0.4
    assert not args.suppress_note_span or args.all_source_runs
    build(args.input, args.map, args.output, args.scalar_harakat, args.word_actualtext, args.logical_cluster_payload, args.scalar_mark_fraction, args.line_actualtext, args.all_source_runs, args.suppress_note_span, args.semantic_first)
