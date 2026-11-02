# NAMA publication handoff — After Ṣadrā / Late Avicennism

**Destination:** NAMA website → **Research** section, alongside the *Tajrīd* sourcebook.  
**Current constraint:** the available GitHub connection is to `gnamma-research/booksite`, **not to NAMA**. No independent NAMA repository, domain, or writable site backend has been confirmed. This file provides installable source; it does not claim NAMA's live website has been updated.

## Stage 8 source context and nonduplication update

The portable reader now includes **24 historical source units (6 baseline, 17 later, one mediated), ten editorial chapters, sixteen historical transmission routes, twelve explicitly located philosophical argument chains and twelve post-Asfār change dossiers**. In particular, a consecutive **32-page working English interpretation of Lāhījī's independent *Gawhar-i murād* Book III Sections I–VIII, pp.278–309** replaces isolated brief extracts. The textual edition identifies authorial voices, preceding premise, objection, reply, source locations and next textual step. Original Persian and Arabic remain **selected anchors**, not complete aligned manuscripts.

For overlap with the separate **Tajrīd reader**, link existing sourcebook passages rather than treating the same printed pages as independent source witnesses. The registered shared pages are *Shawāriq* I:90–91 and *Maqāṣid* p.79; a different passage of the same work is not automatically duplication. The integrated reader now exposes dedicated **Tajrīd overlap** and **After-Asfār transformations** routes.

### Stage 9: canonical Tajrīd question map and post-*Asfār* additions

The new `#tajrid-questions` view crosslinks all thirty sourcebook debates and their post-*Asfār* implications without retranslating the existing Tajrīd matn. The original `#tajrid-overlap` page still distinguishes exact shared text from different passages in a single work. New Narāqī *Jāmiʿ al-afkār* II:25–27 and Sabzavārī *Sharḥ al-Manẓūma* IV:301–302 and p.305 are explicitly provisional argument units, not completed whole books. The latter has missing pp.303–304 and interleaved twentieth-century Ḥasanzāda annotations.

## Portable installation

There are two equivalent delivery formats:

1. **One-file edition:** copy `standalone.html` to `/research/late-avicennism/index.html` in NAMA. It contains the application code, styles, all historical working translations, twenty-domain map and analytical chapters in one HTML file. No backend or CDN.
2. **Modular edition:** copy all files in this directory except tests into `/research/late-avicennism/` on NAMA, keeping `index.html`, CSS and JavaScript assets in the same directory. Supports easier future editorial updates.

Then add a link in NAMA's Research listing (adjust to the actual framework rather than blindly overwriting it):

```html
<a href="/research/late-avicennism/">
  Late Avicennism · After Ṣadrā — comparative critical sourcebook
</a>
```

A suggested card description: “Primary-source and comparative readings of Ibn Sīnā, later Persian and Indian commentators, the post-*Tajrīd* tradition, and Aquinas. Read translations, inspect witnesses, and compare arguments across twenty domains.”

Do not place it in Tech until the user's later migration decision; the immediate requested location remains Research.

## Publication quality gates

- Verify `/research/late-avicennism/` returns HTTP 200 on NAMA **after** the actual site build.
- Verify the Research listing links to the right path; confirm the *Tajrīd* reader retains its existing links and data.
- Test desktop + mobile portrait and landscape; both light/dark; AR only, EN only and both; focus mode, bookmarks, notes, search, compare selectors, glossary, and export.
- Check direct and mediated voice labels; confirm that the 1904 Khayrābādī source remains only a **mediated** quotation in the reader.
- Do not redistribute commercial PDF editions or proprietary digital text where permission is absent. The page contains original editorial work plus short source anchors and links to the source sites; it does not package the third-party books.
- Do not claim the late Persian, Indian and post-*Tajrīd* corpus is a fully collated definitive critical edition. Untranslated witnesses remain listed as outstanding.

## Exact source provenance

The connected staging project is `gnamma-research/booksite`, `research/avicennism/`. The original critical-source research sits at `research/intellectual-atlas/avicennian-summa/` and includes a machine-readable direct-versus-mediated source ledger.

**Deployment still requires an explicit writable NAMA site connection or the NAMA repository URL.** No automatic cross-site deployment can be inferred from a GNAMMA commit.
