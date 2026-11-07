"""Compatibility regression: the main source map MUST be an SVG graph, never a book list."""
import asyncio
from verify_subject_svg_graph_browser import main

if __name__=="__main__":
    asyncio.run(main())
