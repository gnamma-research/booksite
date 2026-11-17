# Muntahā al-madārik: reading-first UI audit, 12 November 2026

## Exact scope
The authorial introduction (four foundations plus concluding preface) now has an English **working translation covering all Beirut pp. 18–145: 128/128 printed page labels**. Foundation I pp18–69; II pp70–78; III pp79–101; IV pp102–143; concluding preface pp144–145. The subsequent verse-by-verse Tāʾiyya commentary is not translated by this introduction project.

Complete **page coverage** does NOT mean line-by-line source verification or a definitive critical edition. The parallel Arabic is the modern online transcription aligned by printed page only, not by clause. The Stage XIX register reports 559 selected checks (283 edited digitized, 276 derivative), 15 bounded photographed-1876-print comparisons, zero exhaustively collated print pages, zero verified manuscript variants. Twenty-five pages have explicitly separated editorial notes; fifteen further pages were flagged for possible unseparated editorial matter requiring manual review.

## Reading UI
- `index.html` leads with **English: full introduction** and **Arabic + English: page-aligned full introduction**, and a clear sentence about source-grade limitations.
- `continuous-translation.html` preserves all 128 authorial page anchors and translated prose. Source evidence is only in **Aa · Tools → Editorial notes · current page**; advanced controls remain there. The scholarly dossier does not appear in the scrolling reading surface.
- `parallel-introduction.html` preserves both languages; all per-page source and historical-variant notes are consulted in **Study & sources** dialog instead of interrupting the reading.
- The 32 selected bilingual excerpts and Guénon–Schuon comparisons remain separately at `extracts.html`. Prior `#F…` links on the old index redirect to that view.
- `critical-introduction.html` is a separately authored editorial essay; statements inherited from early stages falsely claiming the introduction is untranslated were corrected.

No primary text, source record, book PDF, or external witness report has been rewritten by the UI changes. Remaining possible editorial interpolation in digital-source text is a separate textual-review task, not something to silently strip by regex.

QA: `tests/farghani/verify_reader.py` and `tests/farghani/verify_browser.py` (desktop/phone Chromium/WebKit) exercise the content and UI.
