# Recover the original Bidāya Revision 16 master

The **full canonical corpus is not on Gnamma GitHub or in the accessible project files**. The original work tree was last identified under your Mac's `~/.codex/.chatgpt-projects/` folder. The program here collects originals *without editing them*.

## On the Mac where the original research was created

Open **Terminal** in the folder containing `recover_revision16.py` and run:

```bash
python3 recover_revision16.py
```

The program automatically searches for the project holding `output/master-reader.html`, checks the other two required original masters, then creates `~/Desktop/Bidaya_Revision16_Original_Source_Bundle.zip`. Upload that ZIP into the Usul-law-rushd conversation. If the original project has moved, use `python3 recover_revision16.py --root "/path/to/old/project"`.

The tool packages text/code source assets from `output`, `research`, `data`, `assets`, `src`, `scripts`, and `sources`. It excludes hidden files, secrets, binary books, and caches. Review its MANIFEST.json for skipped files. It does not publish to GitHub or transmit files over the network.

## What needs checking after recovery

Verify that the original 542 reader addresses, 310 detailed working groups, and 279 K-position propositions are preserved separately; map all 57 books, 72 editorial divisions, and 854 indexed headings without conflating their counting units. The current 25-case alternative-uṣūl archive is a separate provisional research experiment, not the canonical register.

Edition I must keep source-controlled legal analyses only; Edition II must share the legal corpus but add distinctly labelled human-formation, virtue, Khaldūnian, and theological analysis. Do not infer legal causes or statuses from philosophical comparisons. Keep the original read-only until the migration parity audit passes.