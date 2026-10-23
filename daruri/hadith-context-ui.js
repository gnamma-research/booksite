/* Daruri Hadith context: separate primary collection reports, Arabic isnad, book/bab and linked translation. */
(()=>{
'use strict';
if(window.__gnHadithContextInstalled)return;window.__gnHadithContextInstalled=true;
const REV='20261023-hen1';
const here=document.currentScript?.src||new URL('hadith-context-ui.js',document.baseURI).href;
const scripts=['hadith-context-data.js','hadith-context-arabic-bukhari1.js','hadith-context-arabic-bukhari2.js','hadith-context-arabic-muslim.js','hadith-context-arabic-abudawud1.js','hadith-context-arabic-abudawud2.js','hadith-context-arabic-tirmidhi.js','hadith-context-arabic-sunan.js','hadith-context-metadata.js'];
const englishScripts=["hadith-context-english-bukhari-a.js","hadith-context-english-bukhari-b.js","hadith-context-english-bukhari-long.js","hadith-context-english-abudawud-a.js","hadith-context-english-abudawud-b.js","hadith-context-english-tirmidhi-a.js","hadith-context-english-tirmidhi-b.js","hadith-context-english-tirmidhi-c.js","hadith-context-english-muslim.js","hadith-context-english-other.js"];
const pending=new Map();
const HADITH_REPORT_COUNTS={"HAD-R031":2,"HAD-R049":1,"HAD-R064":2,"HAD-R082":3,"HAD-R088":1,"HAD-R089":2,"HAD-R112":1,"HAD-R118":1,"HAD-R119":1,"HAD-R120":2,"HAD-R121":2,"HAD-R123":1,"HAD-R124":2,"HAD-R126":3,"HAD-R129":1,"HAD-R131":3,"HAD-R135":1,"HAD-R171":1,"HAD-R172":2,"HAD-R173":1,"HAD-R176":1,"HAD-R189":0,"HAD-R191":4,"HAD-R194":3,"HAD-R195":2,"HAD-R212":2,"HAD-R215":1,"HAD-R216":1,"HAD-R218":1,"HAD-R228":2,"HAD-R229":2,"HAD-R243":1,"HAD-R246":2};

// Editorially aligned short labels and four distinct Qurʾān–Hadith relationships.
// Original Arabic/English source text and note records remain untouched.
const HADITH_NOTE_INFO={"HAD-R031":{"title":"Prayer in bathhouses and camel resting places","short":"Separate reports concern prayer in a bathhouse and where camels rest. The attribution concerning the valley is still unidentified."},"HAD-R049":{"title":"Abbreviated prohibition concerning those who pray","short":"The quotation is abbreviated; the complete report supplies its circumstances and the fuller wording."},"HAD-R064":{"title":"Seven aḥruf and the basmala","short":"The seven-aḥruf report and the report on the basmala concern distinct questions."},"HAD-R082":{"title":"Conveying knowledge and the continuing community","short":"The text invokes both faithful transmission of learning and the persistence of a group within the community."},"HAD-R088":{"title":"Fāṭima bint Qays and narrator reliability","short":"The report of Fāṭima bt. Qays preserves her account and ʿUmar’s response."},"HAD-R089":{"title":"The Bedouin’s Ramadan crescent testimony","short":"The crescent testimony has differing early transmission routes, noted by al-Tirmidhī."},"HAD-R112":{"title":"A report about touching the private parts","short":"A solitary report on touching the private parts illustrates a rule of widespread practical relevance."},"HAD-R118":{"title":"The first prescription of two rakʿas","short":"The initial prescription of two rakʿas illustrates a later increase in an obligation."},"HAD-R119":{"title":"The rule on storing sacrificial meat","short":"The later permission to store sacrificial meat illustrates abrogation without a substitute."},"HAD-R120":{"title":"Temporary marriage and ʿĀshūrāʾ fasting","short":"Temporary marriage and the change from ʿĀshūrāʾ fasting to Ramadan are distinct examples."},"HAD-R121":{"title":"A bequest to an heir and a report of earlier recitation","short":"The bequest-to-an-heir report is distinct from ʿUmar’s account concerning an earlier recitation."},"HAD-R123":{"title":"The change of qibla reported to Qubāʾ","short":"Worshippers at Qubāʾ changed the direction of prayer after a report reached them."},"HAD-R124":{"title":"Two Hadith reports in the Qurʾān-abrogation discussion","short":"Two reports are compared with separate Qurʾānic passages on bequests and legal rulings."},"HAD-R126":{"title":"The Muʿādh report about legal judgement","short":"The Muʿādh report describes judgement by scripture, Sunna, then ijtihād; its chain is disputed."},"HAD-R129":{"title":"The later permission in a transmitted report","short":"A prohibition followed by permission is an example of later wording revealing sequence."},"HAD-R131":{"title":"Reports about consensus and the community","short":"Different formulations about the community and consensus are transmitted separately."},"HAD-R135":{"title":"The report about communal misguidance","short":"The formulation concerning communal misguidance occurs in differing transmission routes."},"HAD-R171":{"title":"Marriage without the guardian’s consent","short":"The guardian-permission report includes related legal clauses and differing transmissions."},"HAD-R172":{"title":"Intention before the fasting day","short":"The report on intending the fast before dawn has raised and stopped transmission variants."},"HAD-R173":{"title":"Agricultural tithe and irrigation","short":"The tithe varies with irrigation; al-Bukhārī also discusses how one wording explains another."},"HAD-R176":{"title":"The well of Buḍāʿa and purifying water","short":"The Prophet’s answer concerning the well is general rather than restricted to that well."},"HAD-R189":{"title":"Two witness formulations with an unresolved attribution","short":"Two witness formulations are compared; the precise traditional attribution remains unsettled."},"HAD-R191":{"title":"Examples involving spoils, garlic, silver and exchange","short":"The cases of spoils, garlic, silver and exchange are separate textual examples."},"HAD-R194":{"title":"Fasting intention and catching a prayer cycle","short":"The fasting-intention and prayer-cycle reports concern different implications of abbreviated wording."},"HAD-R195":{"title":"Grazing sheep and the right of clientage","short":"The grazing-flock restriction and emancipation-clientage rule are distinct reports."},"HAD-R212":{"title":"The cat’s water and silver vessels","short":"The cat report states a reason; the silver-vessel report is compared by inferred meaning."},"HAD-R215":{"title":"The thread-and-needle case","short":"The thread-and-needle wording is situated within a report concerning the distribution of spoils."},"HAD-R216":{"title":"Manumission of a jointly owned slave","short":"The jointly owned slave report supplies an example of extending a ruling to a comparable case."},"HAD-R218":{"title":"Exchange of the four specified foodstuffs","short":"The exchange report is used to assess proposed grounds for extending the prohibition."},"HAD-R228":{"title":"Prayer and pilgrimage as shown by the Prophet","short":"Two instructions concern following the Prophet’s practice in prayer and pilgrimage."},"HAD-R229":{"title":"The companions’ sandals and Ḥudaybiyya actions","short":"The sandal incident and the delay in shaving at al-Ḥudaybiyya are distinct examples."},"HAD-R243":{"title":"Pardon for mistakes and forgetfulness","short":"The report about pardon for mistakes and forgetfulness also has a clause on coercion."},"HAD-R246":{"title":"Two reports about the conditions requiring ghusl","short":"Two reports about when ritual bathing is required are discussed as contrasting evidence."}};
const QURAN_NOTE_HEADINGS={"QUR-R038-Q001":{"preview":"يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تَقْرَبُوا۟ ٱلصَّلَوٰةَ وَأَنتُمْ سُكَـٰرَىٰ …","label":"al-Nisāʾ 4:43"},"QUR-R045-Q002":{"preview":"لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا …","label":"al-Baqarah 2:286"},"QUR-R049-Q003":{"preview":"مَا سَلَكَكُمْ فِى سَقَرَ","label":"al-Muddaththir 74:42–43"},"QUR-R058-Q004":{"preview":"أَيَّامًا مَّعْدُودَٰتٍ ۚ فَمَن كَانَ مِنكُم مَّرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ …","label":"al-Baqarah 2:184–185"},"QUR-R064-Q058":{"preview":"لَا يُؤَاخِذُكُمُ ٱللَّهُ بِٱللَّغْوِ فِىٓ أَيْمَـٰنِكُمْ وَلَـٰكِن يُؤَاخِذُكُم بِم…","label":"al-Māʾidah 5:89"},"QUR-R064-Q005":{"preview":"إِنَّهُۥ مِن سُلَيْمَـٰنَ وَإِنَّهُۥ بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ","label":"al-Naml 27:30"},"QUR-R065-Q006":{"preview":"هُوَ ٱلَّذِىٓ أَنزَلَ عَلَيْكَ ٱلْكِتَـٰبَ مِنْهُ ءَايَـٰتٌ مُّحْكَمَـٰتٌ هُنَّ أُمّ…","label":"Āl ʿImrān 3:7"},"QUR-R082-Q007":{"preview":"وَمَا كَانَ ٱلْمُؤْمِنُونَ لِيَنفِرُوا۟ كَآفَّةً ۚ فَلَوْلَا نَفَرَ مِن كُلِّ فِرْق…","label":"al-Tawbah 9:122"},"QUR-R082-Q008":{"preview":"إِنَّ ٱلَّذِينَ يَكْتُمُونَ مَآ أَنزَلْنَا مِنَ ٱلْبَيِّنَـٰتِ وَٱلْهُدَىٰ مِنۢ بَع…","label":"al-Baqarah 2:159"},"QUR-R119-Q045":{"preview":"يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِذَا نَـٰجَيْتُمُ ٱلرَّسُولَ فَقَدِّمُوا۟ بَيْن…","label":"al-Mujādilah 58:12–13"},"QUR-R119-Q009":{"preview":"مَا نَنسَخْ مِنْ ءَايَةٍ أَوْ نُنسِهَا نَأْتِ بِخَيْرٍ مِّنْهَآ أَوْ مِثْلِهَآ ۗ أ…","label":"al-Baqarah 2:106"},"QUR-R120-Q046":{"preview":"أَيَّامًا مَّعْدُودَٰتٍ ۚ فَمَن كَانَ مِنكُم مَّرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ …","label":"al-Baqarah 2:184–185"},"QUR-R121-Q010":{"preview":"أَيَّامًا مَّعْدُودَٰتٍ ۚ فَمَن كَانَ مِنكُم مَّرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ …","label":"al-Baqarah 2:184"},"QUR-R121-Q047":{"preview":"شَهْرُ رَمَضَانَ ٱلَّذِىٓ أُنزِلَ فِيهِ ٱلْقُرْءَانُ هُدًى لِّلنَّاسِ وَبَيِّنَـٰتٍ …","label":"al-Baqarah 2:185"},"QUR-R121-Q011":{"preview":"كُتِبَ عَلَيْكُمْ إِذَا حَضَرَ أَحَدَكُمُ ٱلْمَوْتُ إِن تَرَكَ خَيْرًا ٱلْوَصِيَّةُ …","label":"al-Baqarah 2:180"},"QUR-R124-Q012":{"preview":"مَا نَنسَخْ مِنْ ءَايَةٍ أَوْ نُنسِهَا نَأْتِ بِخَيْرٍ مِّنْهَآ أَوْ مِثْلِهَآ ۗ أ…","label":"al-Baqarah 2:106"},"QUR-R124-Q013":{"preview":"كُتِبَ عَلَيْكُمْ إِذَا حَضَرَ أَحَدَكُمُ ٱلْمَوْتُ إِن تَرَكَ خَيْرًا ٱلْوَصِيَّةُ …","label":"al-Baqarah 2:180"},"QUR-R124-Q014":{"preview":"وَٱلَّـٰتِى يَأْتِينَ ٱلْفَـٰحِشَةَ مِن نِّسَآئِكُمْ فَٱسْتَشْهِدُوا۟ عَلَيْهِنَّ أ…","label":"al-Nisāʾ 4:15"},"QUR-R131-Q015":{"preview":"وَمَن يُشَاقِقِ ٱلرَّسُولَ مِنۢ بَعْدِ مَا تَبَيَّنَ لَهُ ٱلْهُدَىٰ وَيَتَّبِعْ غَيْ…","label":"al-Nisāʾ 4:115"},"QUR-R131-Q016":{"preview":"وَكَذَٰلِكَ جَعَلْنَـٰكُمْ أُمَّةً وَسَطًا لِّتَكُونُوا۟ شُهَدَآءَ عَلَى ٱلنَّاسِ و…","label":"al-Baqarah 2:143"},"QUR-R131-Q017":{"preview":"كُنتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ لِلنَّاسِ تَأْمُرُونَ بِٱلْمَعْرُوفِ وَتَنْهَوْنَ …","label":"Āl ʿImrān 3:110"},"QUR-R131-Q018":{"preview":"وَمِمَّنْ خَلَقْنَآ أُمَّةٌ يَهْدُونَ بِٱلْحَقِّ وَبِهِۦ يَعْدِلُونَ","label":"al-Aʿrāf 7:181"},"QUR-R157-Q019":{"preview":"قُلْ هُوَ ٱللَّهُ أَحَدٌ","label":"al-Ikhlāṣ 112:1"},"QUR-R158-Q020":{"preview":"وَإِن طَلَّقْتُمُوهُنَّ مِن قَبْلِ أَن تَمَسُّوهُنَّ وَقَدْ فَرَضْتُمْ لَهُنَّ فَرِي…","label":"al-Baqarah 2:237"},"QUR-R161-Q021":{"preview":"فَأَصْبَحَتْ كَٱلصَّرِيمِ","label":"al-Qalam 68:20"},"QUR-R163-Q022":{"preview":"وَإِذْ قَالَ مُوسَىٰ لِقَوْمِهِۦٓ إِنَّ ٱللَّهَ يَأْمُرُكُمْ أَن تَذْبَحُوا۟ بَقَرَة…","label":"al-Baqarah 2:67–71"},"QUR-R167-Q023":{"preview":"يَـٰبَنِىٓ ءَادَمَ قَدْ أَنزَلْنَا عَلَيْكُمْ لِبَاسًا يُوَٰرِى سَوْءَٰتِكُمْ وَرِيش…","label":"al-Aʿrāf 7:26"},"QUR-R167-Q024":{"preview":"لَقَدْ أَرْسَلْنَا رُسُلَنَا بِٱلْبَيِّنَـٰتِ وَأَنزَلْنَا مَعَهُمُ ٱلْكِتَـٰبَ وَٱل…","label":"al-Ḥadīd 57:25"},"QUR-R167-Q025":{"preview":"يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تَقْرَبُوا۟ ٱلصَّلَوٰةَ وَأَنتُمْ سُكَـٰرَىٰ …","label":"al-Nisāʾ 4:43"},"QUR-R167-Q048":{"preview":"لَّا جُنَاحَ عَلَيْكُمْ إِن طَلَّقْتُمُ ٱلنِّسَآءَ مَا لَمْ تَمَسُّوهُنَّ أَوْ تَفْ…","label":"al-Baqarah 2:236–237"},"QUR-R168-Q026":{"preview":"ٱلرَّحْمَـٰنُ عَلَى ٱلْعَرْشِ ٱسْتَوَىٰ","label":"Ṭā Hā 20:5"},"QUR-R177-Q027":{"preview":"يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تَقْرَبُوا۟ ٱلصَّلَوٰةَ وَأَنتُمْ سُكَـٰرَىٰ …","label":"al-Nisāʾ 4:43"},"QUR-R185-Q028":{"preview":"فَإِنَّهُمْ عَدُوٌّ لِّىٓ إِلَّا رَبَّ ٱلْعَـٰلَمِينَ","label":"al-Shuʿarāʾ 26:77"},"QUR-R185-Q029":{"preview":"يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تَأْكُلُوٓا۟ أَمْوَٰلَكُم بَيْنَكُم بِٱلْبَـٰ…","label":"al-Nisāʾ 4:29"},"QUR-R187-Q030":{"preview":"وَٱلَّذِينَ يَرْمُونَ ٱلْمُحْصَنَـٰتِ ثُمَّ لَمْ يَأْتُوا۟ بِأَرْبَعَةِ شُهَدَآءَ ف…","label":"al-Nūr 24:4–5"},"QUR-R187-Q031":{"preview":"لَا يُؤَاخِذُكُمُ ٱللَّهُ بِٱللَّغْوِ فِىٓ أَيْمَـٰنِكُمْ وَلَـٰكِن يُؤَاخِذُكُم بِم…","label":"al-Māʾidah 5:89"},"QUR-R191-Q032":{"preview":"وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوٓا۟ إِلَّآ إِيَّاهُ وَبِٱلْوَٰلِدَيْنِ إِحْسَـٰنًا…","label":"al-Isrāʾ 17:23"},"QUR-R194-Q033":{"preview":"وَسْـَٔلِ ٱلْقَرْيَةَ ٱلَّتِى كُنَّا فِيهَا وَٱلْعِيرَ ٱلَّتِىٓ أَقْبَلْنَا فِيهَا ۖ…","label":"Yūsuf 12:82"},"QUR-R194-Q034":{"preview":"حُرِّمَتْ عَلَيْكُمْ أُمَّهَـٰتُكُمْ وَبَنَاتُكُمْ وَأَخَوَٰتُكُمْ وَعَمَّـٰتُكُمْ و…","label":"al-Nisāʾ 4:23"},"QUR-R195-Q035":{"preview":"وَيَسْـَٔلُونَكَ عَنِ ٱلْمَحِيضِ ۖ قُلْ هُوَ أَذًى فَٱعْتَزِلُوا۟ ٱلنِّسَآءَ فِى ٱل…","label":"al-Baqarah 2:222"},"QUR-R195-Q036":{"preview":"فَإِن طَلَّقَهَا فَلَا تَحِلُّ لَهُۥ مِنۢ بَعْدُ حَتَّىٰ تَنكِحَ زَوْجًا غَيْرَهُۥ ۗ…","label":"al-Baqarah 2:230"},"QUR-R195-Q037":{"preview":"أُحِلَّ لَكُمْ لَيْلَةَ ٱلصِّيَامِ ٱلرَّفَثُ إِلَىٰ نِسَآئِكُمْ ۚ هُنَّ لِبَاسٌ لَّ…","label":"al-Baqarah 2:187"},"QUR-R200-Q038":{"preview":"كُلُوا۟ وَتَمَتَّعُوا۟ قَلِيلًا إِنَّكُم مُّجْرِمُونَ","label":"al-Mursalāt 77:46"},"QUR-R203-Q039":{"preview":"يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تُحِلُّوا۟ شَعَـٰٓئِرَ ٱللَّهِ وَلَا ٱلشَّهْر…","label":"al-Māʾidah 5:2"},"QUR-R215-Q040":{"preview":"إِنَّ ٱللَّهَ لَا يَظْلِمُ مِثْقَالَ ذَرَّةٍ ۖ وَإِن تَكُ حَسَنَةً يُضَـٰعِفْهَا وَي…","label":"al-Nisāʾ 4:40"},"QUR-R215-Q041":{"preview":"وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوٓا۟ إِلَّآ إِيَّاهُ وَبِٱلْوَٰلِدَيْنِ إِحْسَـٰنًا…","label":"al-Isrāʾ 17:23"},"QUR-R229-Q042":{"preview":"لَّقَدْ كَانَ لَكُمْ فِى رَسُولِ ٱللَّهِ أُسْوَةٌ حَسَنَةٌ لِّمَن كَانَ يَرْجُوا۟ ٱل…","label":"al-Aḥzāb 33:21"},"QUR-R239-Q043":{"preview":"وَمَا مِن دَآبَّةٍ فِى ٱلْأَرْضِ وَلَا طَـٰٓئِرٍ يَطِيرُ بِجَنَاحَيْهِ إِلَّآ أُمَ…","label":"al-Anʿām 6:38"},"QUR-R001-Q049":{"preview":"عَلَّمَهُ ٱلْبَيَانَ","label":"al-Raḥmān 55:4"},"QUR-R001-Q050":{"preview":"قُلْ فَلِلَّهِ ٱلْحُجَّةُ ٱلْبَـٰلِغَةُ ۖ فَلَوْ شَآءَ لَهَدَىٰكُمْ أَجْمَعِينَ","label":"al-Anʿām 6:149"}};
const RELATED_QURAN_HADITH={"QUR-R064-Q005":[{"hadithNote":"HAD-R064","reports":["abudawud:788"],"subject":"Basmala marking the division of sūras"}],"QUR-R121-Q011":[{"hadithNote":"HAD-R121","reports":["abudawud:2870"],"subject":"A bequest to an heir in relation to Qurʾān 2:180"}],"QUR-R124-Q013":[{"hadithNote":"HAD-R124","reports":["abudawud:2870"],"subject":"A bequest to an heir in relation to Qurʾān 2:180"}],"QUR-R124-Q014":[{"hadithNote":"HAD-R124","reports":["muslim:1690a"],"subject":"The report about a way appointed for them"}]};
const mk=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
function load(src){if(pending.has(src))return pending.get(src);const p=new Promise((ok,fail)=>{const s=document.createElement('script');s.async=true;s.src=new URL(src+'?v='+REV,here).href;s.onload=()=>ok();s.onerror=()=>fail(new Error('Could not load '+src));document.head.append(s);});pending.set(src,p);return p;}
async function corpus(){const first=await Promise.allSettled(scripts.slice(0,-1).map(load));const last=await Promise.allSettled([load(scripts[scripts.length-1])]);const translations=await Promise.allSettled(englishScripts.map(load));if(!window.GnammaHadithContextData?.notes)throw Error('Hadith source index is missing');return {data:window.GnammaHadithContextData,reports:window.GnammaHadithReports||{},english:window.GnammaHadithEnglishFull||{},failed:first.concat(last,translations).filter(x=>x.status==='rejected').length};}
function outbound(text,url){const a=mk('a','gn-hadith-source-link',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function label(host,key,value,lang){if(!value)return;const p=mk('p','gn-hadith-meta');p.append(mk('strong',null,key+': '));const v=mk('span',null,value);if(lang){v.lang=lang;v.dir='rtl';}p.append(v);host.append(p);}
function reportCard(key,cite,report,index,fullTranslation){
  const article=mk('article','gn-hadith-report');article.dataset.hadithReport=key;
  // The citation heading is the single visible external source link.
  const title=mk('h5','gn-hadith-report-heading');
  const labelText=(cite.sourceLabel||cite.collection+' '+cite.number).split(/,\s/)[0];
  const sourceLink=outbound(labelText,cite.url);
  sourceLink.classList.add('gn-hadith-heading-link');
  sourceLink.setAttribute('aria-label','Open original Hadith collection record: '+(cite.sourceLabel||labelText));
  const outboundMark=mk('span','gn-hadith-external-mark','↗');outboundMark.setAttribute('aria-hidden','true');
  sourceLink.append(document.createTextNode(' '),outboundMark);
  title.append(document.createTextNode((index+1)+'. '),sourceLink);
  article.append(title);
  // Metadata stays inspectable and selectable, without a column of repeated labels.
  const meta=mk('p','gn-hadith-biblio');
  for(const [heading,value,lang] of [
    ['Book',report.book],['Chapter',report.chapter_en],
    ['Narrator',report.narrator],['In-book',report.inBook],
    ['باب',report.chapter_ar,'ar']
  ]){
    if(!value)continue;
    if(meta.childNodes.length)meta.append(document.createTextNode(' · '));
    const part=mk('span',lang?'gn-hadith-biblio-ar':'gn-hadith-biblio-item');
    if(lang){part.lang='ar';part.dir='rtl';}
    const keyLabel=mk('span','gn-hadith-biblio-label',heading+': ');
    const detail=mk('span',null,value);
    part.append(keyLabel,detail);meta.append(part);
  }
  if(meta.childNodes.length)article.append(meta);
  if(report.arabic){
    // Long transmissions remain foldable inside the expanded note on narrow screens.
    const long=report.arabic.length>1400;
    const wrapper=long?mk('details','gn-hadith-arabic-fold'):mk('div','gn-hadith-arabic-block');
    if(long)wrapper.append(mk('summary',null,'Read complete Arabic text and isnād'));
    const ar=mk('blockquote','gn-hadith-original-ar',report.arabic);ar.lang='ar';ar.dir='rtl';
    wrapper.append(ar);article.append(wrapper);
    if(typeof fullTranslation==='string'&&fullTranslation.trim()){
      article.append(mk('h6','gn-hadith-section-label','English translation · editorial'));
      const en=mk('section','gn-hadith-english');en.lang='en';en.dir='ltr';
      for(const paragraph of fullTranslation.split(/\n\s*\n/)){
        if(paragraph.trim())en.append(mk('p','gn-hadith-english-paragraph',paragraph.trim()));
      }
      article.append(en);
    }else{
      article.append(mk('p','gn-hadith-error','English translation unavailable here. Consult the linked collection heading.'));
    }
  }else article.append(mk('p','gn-hadith-translation-note','Arabic report unavailable locally. Consult the linked collection heading.'));
  return article;
}
function appendDistinctReferences(id,host,cor){
  // Preserve genuinely additional scholarly links from the canonical apparatus.
  // Primary report URLs are already linked once, in their respective headings.
  const legacy=host.closest('.gn-note-entry')?.querySelector('.gn-hadith-original-apparatus');
  if(!legacy)return;
  const primary=new Set((cor.data.notes[id]?.refs||[]).map(key=>cor.data.sources[key]?.url).filter(Boolean));
  const extra=new Map();
  for(const anchor of legacy.querySelectorAll('a[href]')){
    if(!/^https:/.test(anchor.href)||primary.has(anchor.href)||extra.has(anchor.href))continue;
    const text=anchor.closest('.gn-source-citation')?.querySelector('.gn-source-label')?.textContent?.trim()||anchor.textContent.trim()||'Classical source';
    extra.set(anchor.href,text);
  }
  if(!extra.size)return;
  const line=mk('p','gn-hadith-distinct-sources');
  line.append(mk('strong',null,'Additional reference: '));
  for(const [url,name] of extra){
    if(line.querySelector('a'))line.append(document.createTextNode(' · '));
    line.append(outbound(name,url));
  }
  host.append(line);
}
function render(id,host,cor,selected){host.replaceChildren();const n=cor.data.notes[id];if(!n){host.append(mk('p','gn-hadith-error','No Hadith note record for '+id));return;}
  if(n.unresolved)host.append(mk('p','gn-hadith-unresolved','Source qualification: this note contains an unresolved identification or attribution. The reports below do not resolve that uncertainty.'));
  if(!n.refs.length){host.append(mk('p','gn-hadith-unresolved','No primary collection has been securely identified for the wording cited here. No invented narration is supplied.'));return;}
  (selected?.length?selected:n.refs).forEach((key,i)=>{const cite=cor.data.sources[key];if(cite)host.append(reportCard(key,cite,cor.reports[key]||{},i,cor.english[key]));});
  if(!selected?.length)appendDistinctReferences(id,host,cor);
  if(cor.failed)host.append(mk('p','gn-hadith-unresolved','Some local report assets did not load. Use their external source links above.'));
}
function polishNote(node,id){
 if(node.dataset.gnScholarlyPolished==='1')return;
 const hadith=HADITH_NOTE_INFO[id],quran=QURAN_NOTE_HEADINGS[id];
 if(!hadith&&!quran)return;
 node.dataset.gnScholarlyPolished='1';
 const heading=node.querySelector(':scope > h3');
 if(heading){
  const previous=heading.textContent.trim();
  const caption=mk('small','gn-scholarly-note-id',previous||id);
  if(quran){
   const quote=mk('span','gn-scholar-ayah-title','﴿ '+quran.preview+' ﴾');quote.lang='ar';quote.dir='rtl';
   const label=mk('span','gn-scholar-quran-label',quran.label);
   heading.replaceChildren(quote,label,caption);
  }else{
   heading.replaceChildren(mk('span','gn-hadith-note-title',hadith.title),caption);
  }
  heading.classList.add('gn-scholarly-note-heading');
 }
 if(!hadith)return;
 const original=[...node.children].find(x=>x.tagName==='P'&&!x.classList.contains('gn-note-scope'));
 if(!original)return;
 const brief=mk('p','gn-hadith-short-summary',hadith.short);
 // Keep the full editorial note intact in the source DOM; the opening view
 // needs only the issue-specific sentence and the single report disclosure.
 original.hidden=true;original.classList.add('gn-hadith-original-apparatus');
 original.before(brief);
}
function hadithDisclosure(id,related){
 const detail=mk('details',related?'gn-hadith-context gn-hadith-related':'gn-hadith-context');
 detail.dataset.gnHadithContext=id;
 const summary=mk('summary','gn-hadith-context-toggle');
 const number=related?.reports?.length??HADITH_REPORT_COUNTS[id]??0;
 const countText=number>1?' ('+number+' reports)':'';
 const caption=related?'Read related Hadith':number===0?'Source identification':'Read Hadith'+countText;
 summary.append(mk('span','gn-hadith-chevron','›'),
  mk('span','gn-hadith-closed',caption),
  mk('span','gn-hadith-open','Hide Hadith texts'));
 const host=mk('div','gn-hadith-context-body');detail.append(summary,host);
 detail.addEventListener('toggle',()=>{
  if(!detail.open||detail.dataset.ready==='1'||detail.dataset.loading==='1')return;
  detail.dataset.loading='1';host.replaceChildren(mk('p','gn-hadith-status','Opening source texts…'));
  corpus().then(c=>{
   if(!detail.isConnected)return;
   render(id,host,c,related?.reports);
   detail.dataset.ready='1';
  }).catch(e=>{
   if(detail.isConnected)host.replaceChildren(mk('p','gn-hadith-error','Local Hadith text unavailable; use the source collection links.'));
   console.warn('Hadith source context',e);
  }).finally(()=>{delete detail.dataset.loading;});
 });
 return detail;
}
function enhance(node){
 if(!node?.matches?.('.gn-note-entry[data-note-id]'))return;
 const id=node.dataset.noteId;
 polishNote(node,id);
 if(/^HAD-R\d+$/.test(id)&&node.dataset.gnHadithContextEnhanced!=='1'){
  node.dataset.gnHadithContextEnhanced='1';node.append(hadithDisclosure(id,null));
 }
 if(/^QUR-R\d+-Q\d+$/.test(id)&&node.dataset.gnRelatedHadithEnhanced!=='1'){
  const linked=RELATED_QURAN_HADITH[id]||[];
  if(!linked.length)return;
  node.dataset.gnRelatedHadithEnhanced='1';
  const section=mk('section','gn-hadith-in-quran-note');
  section.dataset.relatedHadithTo=id;
  for(const relation of linked){
   section.append(mk('h4','gn-related-hadith-heading','Related Hadith'));
   section.append(mk('p','gn-related-hadith-caption',relation.subject));
   section.append(hadithDisclosure(relation.hadithNote,relation));
  }
  node.append(section);
 }
}
function scan(root){if(root.nodeType!==1&&root.nodeType!==9)return;if(root.matches)enhance(root);root.querySelectorAll?.('.gn-note-entry[data-note-id]').forEach(enhance);}
function start(){scan(document);const watch=new MutationObserver(changes=>{for(const rec of changes)for(const n of rec.addedNodes)scan(n);});watch.observe(document.body,{subtree:true,childList:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
