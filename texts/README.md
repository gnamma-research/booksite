# Texts

Stable path: `texts/{author_slug}/{work_slug}/`.

## Readers

- `al-turka/qawaid-al-tawhid/`: Darūrī-family immersive bilingual reader with **61 original matn passages** in Arabic/English and a **separate, incremental Tamhīd al-Qawāʿid commentary translation** (currently 2 text-checked excerpts, printed p.274). Modes: Matn / Together / Sharḥ, focus 0–3 including continuous, search, personal bookmarks/notes, edition sources. Commentary introduction and remaining **أقول** are reserved, not yet translated. Source audit, commentary status, and interface parity are documented in its `editorial/` directory.
- `al-ghazali/al-mustasfa/`: complete Arabic digital witness with partial English research translation.
- `al-taftazani/tahdhib-al-kalam/`: 81 provisional source-graded passages from the six theological divisions; **not** continuously translated or a definitive critical edition. Explanatory and textual notes distinguish authorship. See `editorial/verification-register-140.csv` for the larger gap audit.
- `al-sanandaji/taqrib-al-maram/`: separate commentary translation beginning with the author's preface and five other image-checked selections; two-volume complete translation still outstanding. Direct collation register is supplied under `editorial/`.

Other named readers and previews retain their own editorial statuses. Neither Tahdhīb nor Taqrīb may be described as complete until their continuous source/translation audits pass.

Catalogue data: `manifest.json`. Shared parallel-text reader: `shared/tahdhib-reader.js` and `.css`.
