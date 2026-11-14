"""Compatibility entry point for the current GNAMMA atlas browser matrix.

The former 2026-11-08 screen-specific assertions are preserved in
verify_legacy_subject_timeline_browser.py and its archived legacy.html.
The published 2026-11-09 atlas intentionally uses ONE screen and SVG map
renderer for all sciences. Test the new contract instead of demanding
obsolete buttons and separate disciplinary applications.
"""
import asyncio
from verify_unified_v3_browser import main

if __name__ == "__main__":
    asyncio.run(main())
