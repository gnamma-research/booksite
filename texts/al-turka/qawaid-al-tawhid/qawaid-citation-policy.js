/* Qawāʿid/Tamhīd attested-reference policy; source-graded and reviewable.
   Facts and Arabic passages remain in data/primary-reference-register.js.
   No cross-work deep link is advertised without an independently checked
   destination passage anchor. */
window.GNAMMA_QAWAID_CITATION_POLICY = Object.freeze({
  schema: "gnamma-qawaid-verified-citation-policy-v1",
  updated: "2026-11-13",
  defaultInlineMode: "normal-only",
  referenceSources: "Existing 18-card source register; independently reviewed direct Arabic spans only.",
  exactExternalReaderDestinations: [],
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
    "hidden-treasure": "unverified-attribution"
  }
});
