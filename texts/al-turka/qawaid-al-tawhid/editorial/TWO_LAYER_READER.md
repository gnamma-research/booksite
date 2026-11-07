# Qawāʿid / Tamhīd — two-layer reading interface

**4 November 2026.** [Open the combined reader](../).

The public entry page now reads the **matn and its linked sharḥ in one place**, with independent **Matn On/Off** and **Sharḥ On/Off** switches. The Sharḥ control no longer redirects to a different page. Fresh readers begin with both layers on; existing saved preferences are respected. At least one text layer and one language remain visible.

## Authorial structure

- **Matn:** Abū Ḥāmid Muḥammad Turka. All 61 numbered passages are retained. The four additional connecting quotations found during the commentary translation are distinctly labelled as matn and stay visible when sharḥ is off.
- **Sharḥ:** Ṣāʾin al-Dīn Ibn Turka. All 70 linked main/concluding explanations are displayed beneath the passages they explain, in source order. Each commentary heading independently opens or closes its explanation.
- The 40-section independent commentary introduction is available through **Sharḥ introduction** in the book header and contents. It is not falsely aligned to an ancestral passage. The standalone commentary reader remains available as an alternative, not as the layer toggle's destination.

This follows the user's requested separately attributed matn/sharḥ model, like the Ījī/Jurjānī arrangement. It is not a claim to have copied the unavailable hosted Mawāqif site's exact code or pixel layout.

## Controls and continuity

Arabic and English are independent of textual layers. The two switches work in section mode and continuous reading, with additional controls in the bottom dock when the toolbar is hidden. The current passage is retained when a layer is hidden. Search identifies the matching layer and reveals a hidden sharḥ result in place. Existing browser-local notes, bookmarks, and preferences are retained under the prior storage key; corrupt stored data is not silently replaced.

Matn/Sharḥ labels and author names are textual, not colour-only. Switches expose their checked state; individual commentary folds use native keyboard-accessible details controls. The reader prevents both layers or both languages being turned off together.

## Textual scope

This update changes presentation and interaction, **not the Arabic or English source modules**. The earlier QT-059 note remains deferred. No additional translation, manuscript collation, or recovery of lost wording is claimed. The separately attributed connecting quotations are not silently inserted into the grandfather's numbered matn file.

## Verification

`qa/check-layered-reader.py` tests real Chromium interactions, persistent preferences, old notes and bookmarks, all rendered Arabic/English against source data, four bridge quotations, source order, search, deep links, keyboard switches, immersive reading, scroll location, and layouts at 320, 390, 768 and 1280 pixels. The existing commentary corpus tests are also run. Consult the **Qawaid two-layer reader** workflow's actual result; the presence of tests is not itself proof of success. Reports and screenshots are retained as workflow artifacts. A physical iPhone Safari test is not claimed.
