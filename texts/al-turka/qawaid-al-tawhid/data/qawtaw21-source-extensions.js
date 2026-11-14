/* Qawtaw21 supplementary 11 source cards, not part of the Qawtaw16 canonical 18-card PDF acceptance input. 
   Load AFTER primary-reference-register.js. This adds reviewed source links to the online
   reader without changing the original published source references or PDF hashes. */
(function(){
 'use strict';
 const holder=window.GNAMMA_QAWAID_REFERENCES;
 if(!holder||!Array.isArray(holder.items))throw new Error('Original source register unavailable');
 const additions=[
  {
    "id": "q-18-17",
    "type": "quran",
    "title": "Qurʾān 18:17 — Guidance and the protecting guide",
    "source": "Qurʾān",
    "sourceUrl": "https://quran.com/18/17",
    "arabic": "وَتَرَى الشَّمْسَ إِذَا طَلَعَتْ تَزَاوَرُ عَنْ كَهْفِهِمْ ذَاتَ الْيَمِينِ وَإِذَا غَرَبَتْ تَقْرِضُهُمْ ذَاتَ الشِّمَالِ وَهُمْ فِي فَجْوَةٍ مِنْهُ ذَٰلِكَ مِنْ آيَاتِ اللَّهِ مَنْ يَهْدِ اللَّهُ فَهُوَ الْمُهْتَدِ وَمَنْ يُضْلِلْ فَلَنْ تَجِدَ لَهُ وَلِيًّا مُرْشِدًا",
    "english": "Whoever God guides is rightly guided; whoever He leaves astray will find no protecting guide. The quoted words close the verse about the Companions of the Cave.",
    "units": [
      "SH-060"
    ],
    "status": "full-verse",
    "inlineAnchors": [
      "من يهدى الله فهو المهتد"
    ],
    "note": "Ibn Turka ends his discussion with this Qurʾānic wording (the source has فلن whereas the electronic Tamhīd quotation reads فلن). The selected short anchor is exact after harakāt and standard Arabic-letter normalization; no source words have been changed."
  },
  {
    "id": "q-42-11",
    "type": "quran",
    "title": "Qurʾān 42:11 — Nothing resembles Him",
    "source": "Qurʾān",
    "sourceUrl": "https://quran.com/42/11",
    "arabic": "فَاطِرُ السَّمَاوَاتِ وَالْأَرْضِ جَعَلَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا وَمِنَ الْأَنْعَامِ أَزْوَاجًا يَذْرَؤُكُمْ فِيهِ لَيْسَ كَمِثْلِهِ شَيْءٌ وَهُوَ السَّمِيعُ الْبَصِيرُ",
    "english": "The Originator of the heavens and the earth; there is nothing like Him, and He is the All-Hearing, All-Seeing.",
    "units": [
      "SH-029"
    ],
    "status": "full-verse",
    "inlineAnchors": [
      "ليس كمثله شيء"
    ],
    "note": "Identified source of the commentator’s brief direct phrase. This card presents the verse rather than attributing its subsequent metaphysical interpretation to the Qurʾān."
  },
  {
    "id": "hadith-time-3197",
    "type": "hadith",
    "title": "Ṣaḥīḥ al-Bukhārī 3197 / Muslim 1679 — Time has turned",
    "source": "Ṣaḥīḥ al-Bukhārī; Ṣaḥīḥ Muslim",
    "sourceUrl": "https://dorar.net/hadith/sharh/25668",
    "arabic": "الزَّمَانُ قَدِ اسْتَدَارَ كَهَيْئَتِهِ يَوْمَ خَلَقَ اللَّهُ السَّمَاوَاتِ وَالْأَرْضَ، السَّنَةُ اثْنَا عَشَرَ شَهْرًا",
    "english": "Time has come round to the state it had when God created the heavens and the earth; the year contains twelve months.",
    "units": [
      "SH-051"
    ],
    "status": "identified-prophetic-report-with-textual-variant",
    "inlineAnchors": [
      "ان الزمان قد استدار كهيئة يوم خلق"
    ],
    "note": "Ibn Turka’s transmitted quotation adds إن and تعالى and has كهيئة; the cited Bukhārī report prints كهيئته. This is a directly identifiable hadith with variant wording, not a diplomatic reproduction of the canonical matn or a claim that Ibn Turka’s metaphysical interpretation is the hadith’s sole interpretation. The inline marker is anchored to the first seven exactly received words because the remaining text has orthographic and morphological variants."
  },
  {
    "id": "ibn-arabi-dawair-human-sh039",
    "type": "primary-quotation",
    "title": "Ibn ʿArabī, Inshāʾ al-Dawāʾir — The human has two copies",
    "source": "Inshāʾ al-Dawāʾir · section on categories of existents",
    "sourceUrl": "https://ibnalarabi.com/books/dawaer.php?id=4",
    "quoteFrom": "SH-039",
    "quoteIndex": 0,
    "english": "The human being has an outward copy corresponding to the entire world, and an inward copy corresponding to the divine presence; the work describes the human as an isthmus between the two.",
    "englishRole": "editorial-summary",
    "units": [
      "SH-039"
    ],
    "status": "named-direct-quotation-with-independent-original-online-parallel",
    "note": "Tamhīd explicitly names Inshāʾ al-Dawāʾir and quotes the passage at length; the original-work Arabic page independently displays the two-copy formula, though not established by a manuscript collation. Differences between the reproduced texts should not be silently normalised."
  },
  {
    "id": "ibn-arabi-fusus-mirror-qt041",
    "type": "primary-quotation",
    "title": "Ibn ʿArabī, Fuṣūṣ al-Ḥikam — Seeing oneself in a mirror",
    "source": "Fuṣūṣ al-Ḥikam · Adamic wisdom",
    "sourceUrl": "https://www.ibnalarabi.com/fusus/jami_matn.php?id=3",
    "quoteFrom": "QT-041",
    "quoteIndex": 0,
    "english": "A thing seeing itself in itself is not like seeing itself in another thing that acts as a mirror; the reflecting locus contributes a form not disclosed without it.",
    "englishRole": "editorial-summary",
    "units": [
      "QT-041"
    ],
    "status": "quoted-in-matn-original-work-identifiable",
    "note": "The ancestor cites the mirror passage as a proposition open to criticism; the original Fuṣūṣ passage is independently identifiable in the Adamic chapter. The reader must preserve the distinction between citation and Ibn Turka’s objection."
  },
  {
    "id": "ibn-arabi-fusus-eye-sh041",
    "type": "primary-quotation",
    "title": "Ibn ʿArabī, Fuṣūṣ al-Ḥikam — The eye looks only to Him",
    "source": "Fuṣūṣ al-Ḥikam · Hūdian wisdom, Afīfī ed. p. 113",
    "sourceUrl": "https://ablibrary.net/book_content/b/2783/113?lang=ar",
    "quoteFrom": "SH-041",
    "quoteIndex": 1,
    "english": "The eye looks only to Him; judgement falls only upon Him.",
    "englishRole": "editorial-summary",
    "units": [
      "SH-041"
    ],
    "status": "direct-poetic-line-in-fusus",
    "note": "The quoted hemistich is located in the original Fuṣūṣ Hūdian passage, not merely a later thematic attribution. The other short embedded quotations in SH-041 have distinct provenance."
  },
  {
    "id": "ibn-arabi-futuhat-proportion-sh041",
    "type": "primary-quotation",
    "title": "Ibn ʿArabī, al-Futūḥāt al-Makkiyya — No proportion between temporal and eternal",
    "source": "al-Futūḥāt al-Makkiyya, chapter 3, part I p. 93",
    "sourceUrl": "https://ibnalarabi.com/futuhat/chapter.php?chpn=3",
    "quoteFrom": "SH-041",
    "quoteStart": "و ان أطلقت المناسبة يوماً عليه",
    "quoteEnd": "هذا محال",
    "english": "Even if proportionality is sometimes predicated between God and creation, as al-Ghazālī and others do, it is remote from the strict realities: what proportion is there between the temporal and eternal?",
    "englishRole": "editorial-summary",
    "units": [
      "SH-041"
    ],
    "status": "named-quotation-located-in-original-futuhat-online",
    "note": "The original chapter independently contains the argument, with slight wording differences from Tamhīd. The source quote is not treated as identical word-for-word across editions."
  },
  {
    "id": "ibn-arabi-futuhat-worlds-sh053",
    "type": "primary-quotation",
    "title": "Ibn ʿArabī, al-Futūḥāt al-Makkiyya — Four worlds and their human correspondences",
    "source": "al-Futūḥāt al-Makkiyya, chapter 6",
    "sourceUrl": "https://ibnalarabi.com/futuhat/chapter.php?chpn=6",
    "quoteFrom": "SH-053",
    "quoteIndex": 0,
    "english": "The worlds are four: the higher world, change, the world of inhabitation and transformation, and relations. Their orders appear in both the great world and the human being.",
    "englishRole": "editorial-summary",
    "units": [
      "SH-053"
    ],
    "status": "named-quotation-located-in-original-futuhat-online",
    "note": "Ibn Turka gives a lengthy quotation matching the original’s enumerated four-world schema. It is explicitly a medieval cosmological description, not an endorsement of its empirical anatomy or a new verified scientific model."
  },
  {
    "id": "hadith-qarin-muslim2814",
    "type": "attributed-report",
    "title": "Ṣaḥīḥ Muslim 2814 — The Prophet’s qarin",
    "source": "Ṣaḥīḥ Muslim, 2814",
    "sourceUrl": "https://dorar.net/hadith/sharh/20815",
    "arabic": "مَا مِنْكُمْ مِنْ أَحَدٍ إِلَّا وَقَدْ وُكِّلَ بِهِ قَرِينُهُ مِنَ الْجِنِّ. قَالُوا: وَإِيَّاكَ يَا رَسُولَ اللَّهِ؟ قَالَ: وَإِيَّايَ إِلَّا أَنَّ اللَّهَ أَعَانَنِي عَلَيْهِ فَأَسْلَمَ فَلَا يَأْمُرُنِي إِلَّا بِخَيْرٍ",
    "english": "There is no one among you without a companion from the jinn. Asked whether that included himself, the Prophet replied that God had helped him against his companion, who now commands nothing but good.",
    "units": [
      "SH-053"
    ],
    "status": "identified-hadith-recalled-not-literal-quotation",
    "note": "Ibn Turka paraphrases this report as إن شيطانه قد أسلم على يده; it is not a verbatim quotation of Muslim’s wording. The reading فأسلم has been discussed with differing interpretations, and is not presented as proof of a disputed doctrinal elaboration."
  },
  {
    "id": "ali-vision-attribution-sh041",
    "type": "attributed-report",
    "title": "Attributed to ʿAlī — 'I would not worship a Lord I had not seen'",
    "source": "Nahj al-Balāgha, sermon 179; parallel reports in al-Kāfī / al-Tawḥīd",
    "sourceUrl": "https://ablibrary.net/book_content/b/9340/182",
    "arabic": "ما كنتُ أعبدُ ربًّا لم أرَهُ",
    "english": "I would not worship a Lord whom I had not seen. The traditional continuation explains vision by the hearts through the realities of faith, not ocular sight.",
    "units": [
      "SH-041"
    ],
    "status": "attributed-imam-report-later-witness",
    "note": "Ibn Turka says قول بعض الأئمة without a direct named isnād. Later sources attribute similar wording to ʿAlī, but the exact source wording varies; no independent chain criticism has been undertaken and this is not a Prophetic hadith."
  },
  {
    "id": "jaafar-gathering-distinction-sh026",
    "type": "attributed-maxim",
    "title": "Gathering and distinction — statement attributed to Jaʿfar al-Ṣādiq",
    "source": "Tamhīd al-Qawāʿid SH-026; later Sabzavārī discussion",
    "sourceUrl": "https://ablibrary.net/book_content/b/12222/117?lang=ar",
    "arabic": "إن الجمع بلا تفرقة زندقة، والتفرقة بدون الجمع تعطيل، والجمع بينهما توحيد",
    "english": "Gathering without distinction is deviation; distinction without gathering is negation; holding them together is tawḥīd.",
    "units": [
      "SH-026"
    ],
    "status": "attributed-sufi-maxim-unverified-chain",
    "note": "Tamhīd attributes this aphorism to al-Ṣādiq. A later commentary repeats the attribution, but no independent transmission chain has been established by this edition. Treat as an attributed maxim and keep it out of verified Prophetic citation markers."
  }
];
 const seen=new Set(holder.items.map(x=>x.id));
 if(holder.items.length!==18)throw new Error('Unrecognized canonical source register: '+holder.items.length);
 for(const r of additions){if(seen.has(r.id))throw new Error('Duplicate supplementary source '+r.id);holder.items.push(r);seen.add(r.id);}
 // Extend an EXISTING Q24:40 source card to SH-020, where the quoted verse also occurs.
 const verse=holder.items.find(x=>x.id==='q-24-40');
 if(!verse)throw new Error('Existing Qurʾān 24:40 source card not found');
 if(!verse.units.includes('SH-020'))verse.units.push('SH-020');
 window.GNAMMA_QAWAID_QAWTAW21_EXTENSION=Object.freeze({
  date:'2026-11-13',originalSourceCards:18,supplementarySourceCards:additions.length,
  totalSourceCards:holder.items.length,sourceStatus:'Additional reviewed source cards; older PDF acceptance source baseline unchanged'
 });
})();
