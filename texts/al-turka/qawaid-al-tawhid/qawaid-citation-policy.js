/* Qawāʿid/Tamhīd attested-reference policy; source-graded and reviewable.
   Facts and Arabic passages remain in data/primary-reference-register.js.
   No cross-work deep link is advertised without an independently checked
   destination passage anchor. */
window.GNAMMA_QAWAID_CITATION_POLICY = Object.freeze({
  schema: "gnamma-qawaid-verified-citation-policy-v1",
  updated: "2026-11-13",
  defaultInlineMode: "normal-only",
  referenceSources: "Expanded 29-card source register; each direct Arabic marker must independently match the consulted source unit; contextual comparisons remain menu-only.",
  exactExternalReaderDestinations: [],
  /* Exact spacing in the received SH-017 quoted Qur'anic wording: the conjunction وَ is separated. */
  phraseOverrides: {"q-112-3-4":{"SH-017":["لَمْ يَلِدْ وَ لَمْ يُولَدْ"]}},
  grades: {
    "quran-verse": {
      group: "direct",
      label: "Qurʾānic wording · identified āyah",
      explanation: "Only the Arabic phrase matching the quoted passage is marked. The source card supplies the registered verse and precise sūrah/āyah."
    },
    "poetic-hadith-context": {
      group: "direct",
      label: "Quoted verse of Labīd · attested hadith context",
      explanation: "Ibn Turka quotes the poetic half-line. The linked hadith praises that line; it is not presented as an independent claim that he transmitted the Prophetic isnād."
    },
    "quoted-in-tamhid": {
      group: "direct",
      label: "Quotation preserved in Tamhīd",
      explanation: "Marked Arabic comes directly from Ibn Turka’s quotation; its wording is not a separately manuscript-collated text of the cited work."
    },
    "independent-comparator": {
      group: "comparison",
      label: "Independent philosophical comparison",
      explanation: "A source excerpt useful for comparison, not a demonstrated word-for-word citation in Ibn Turka’s displayed text."
    },
    "reported-work": {
      group: "comparison",
      label: "Named work or reported summary",
      explanation: "Bibliographic, attributed, or reported material, not a verified verbatim quoted source span."
    },
    "source-checked-quotation": {
      group: "direct",
      label: "Named quotation · independent original passage located",
      explanation: "The passage is named and quoted in Tamhīd or its matn and has an independently accessible text of the cited work. Wording variants do not amount to an independent manuscript collation."
    },
    "quoted-hadith-with-variant": {
      group: "direct",
      label: "Identified hadith · transmitted wording differs",
      explanation: "The Arabic cited by Ibn Turka matches a known Prophetic report with small additions or variants; the source card identifies the canonical wording and named collection."
    },
    "reported-hadith-paraphrase": {
      group: "comparison",
      label: "Identified Prophetic report · paraphrase, not exact quotation",
      explanation: "The author summarises an identifiable hadith but does not transmit its exact Arabic wording, so no verified word-for-word marker is inserted."
    },
    "attributed-imam-report": {
      group: "comparison",
      label: "Imam attribution · independent transmission not certified",
      explanation: "A later source associates these words with an Imam, but this edition has not established a historical chain or uniform wording."
    },
    "attributed-maxim": {
      group: "comparison",
      label: "Attributed maxim · independent isnād unverified",
      explanation: "The saying is in the Tamhīd and repeated by later authors. A later repetition is not independent proof of the original attribution."
    },
    "unverified-attribution": {
      group: "comparison",
      label: "Unverified attribution",
      explanation: "The words occur in the medieval discussion, but the attribution cannot be treated as authenticated hadith."
    }
  },
  records: {
    "q-8-17": "quran-verse",
    "q-24-40": "quran-verse",
    "q-17-44": "quran-verse",
    "q-16-40": "quran-verse",
    "q-112-3-4": "quran-verse",
    "q-28-30": "quran-verse",
    "q-6-59": "quran-verse",
    "q-3-117": "quran-verse",
    "hadith-labid": "poetic-hadith-context",
    "ibn-arabi-fusus": "quoted-in-tamhid",
    "ibn-arabi-dawair": "quoted-in-tamhid",
    "ibn-turka-rashidiyya": "quoted-in-tamhid",
    "tusi-isharat": "independent-comparator",
    "avicenna-shifa": "independent-comparator",
    "tusid-tajrid": "independent-comparator",
    "ibn-turka-itimad": "reported-work",
    "aristotle-theology": "reported-work",
    "hidden-treasure": "unverified-attribution",
    "q-18-17": "quran-verse",
    "q-42-11": "quran-verse",
    "hadith-time-3197": "quoted-hadith-with-variant",
    "ibn-arabi-dawair-human-sh039": "source-checked-quotation",
    "ibn-arabi-fusus-mirror-qt041": "source-checked-quotation",
    "ibn-arabi-fusus-eye-sh041": "source-checked-quotation",
    "ibn-arabi-futuhat-proportion-sh041": "source-checked-quotation",
    "ibn-arabi-futuhat-worlds-sh053": "source-checked-quotation",
    "hadith-qarin-muslim2814": "reported-hadith-paraphrase",
    "ali-vision-attribution-sh041": "attributed-imam-report",
    "jaafar-gathering-distinction-sh026": "attributed-maxim"
  }
});
