/* Gnamma al-Daruri: generate a self-contained source/PDF package in the browser.
   No external ZIP libraries or third-party services are used. ZIP entries use
   method 0 (stored), so PDFs and UTF-8 HTML are kept byte-for-byte intact. */
(() => {
  'use strict';

  // BEGIN DARURI RELEASE ASSETS
  const RELEASE_VERSION = "20261023-history-help2";
  const RELEASE_ASSETS = new Set(["daruri.pdf", "daruri-study.pdf", "daruri-english.pdf", "daruri-arabic.pdf", "daruri-arabic-vowelled.pdf", "edition-r3-20261020.js", "dictionary-r3-20261020.js", "source-reference-data.js", "source-note-ui.js", "source-note-ui.css", "quran-context-ui.js", "quran-context-ui.css", "quran-context-data.json", "quran-context-data.js", "QURAN_CONTEXT_SOURCES.md", "hadith-context-ui.js", "hadith-context-ui.css", "hadith-inline-anchors.js", "hadith-context-data.js", "hadith-context-metadata.js", "hadith-context-arabic-bukhari1.js", "hadith-context-arabic-bukhari2.js", "hadith-context-arabic-muslim.js", "hadith-context-arabic-abudawud1.js", "hadith-context-arabic-abudawud2.js", "hadith-context-arabic-tirmidhi.js", "hadith-context-arabic-sunan.js", "HADITH_CONTEXT_SOURCES.md", "hadith-context-english-bukhari-a.js", "hadith-context-english-bukhari-b.js", "hadith-context-english-bukhari-long.js", "hadith-context-english-abudawud-a.js", "hadith-context-english-abudawud-b.js", "hadith-context-english-tirmidhi-a.js", "hadith-context-english-tirmidhi-b.js", "hadith-context-english-tirmidhi-c.js", "hadith-context-english-muslim.js", "hadith-context-english-other.js", "gnamma-morphology.js", "gnamma-word-context.js", "gnamma-word-context.css", "morph-lexicon.json", "morph-daruri-v1.json", "morph-mustasfa-v1.json", "download-bundle.js", "bookmark-ui.js", "bookmark-ui.css", "backup-transfer.js", "backup-transfer.css", "google-drive-config.js", "reading-desk.js", "reading-desk.css", "reading-mode-controls.js", "reading-mode-controls.css", "reading-navigation-history.js", "reading-navigation-bridge.js", "reading-navigation-history.css", "reading-desk-pdf.js", "reading-desk-dictionary.js", "pdf-editions-manifest.json", "sw.js", "editions.js", "editions.css", "personal-export.html", "personal-export.js", "personal-pdf-enhancements.js", "personal-export.css"]);
  // END DARURI RELEASE ASSETS

  const root = new URL('.', document.baseURI);
  const encoder = new TextEncoder();
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[i] = c >>> 0;
  }

  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = (c >>> 8) ^ crcTable[(c ^ bytes[i]) & 255];
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function zipDateTime(now) {
    const year = Math.max(1980, Math.min(2107, now.getFullYear()));
    const date = ((year - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >>> 1);
    return { date, time };
  }

  function header(name, bytes, checksum, offset, timestamp, central) {
    const nameBytes = encoder.encode(name);
    const size = bytes.byteLength;
    if (size > 0xFFFFFFFF || offset > 0xFFFFFFFF || nameBytes.length > 0xFFFF) {
      throw new Error('A source file is too large for this download.');
    }
    const base = central ? 46 : 30;
    const out = new Uint8Array(base + nameBytes.length);
    const view = new DataView(out.buffer);
    view.setUint32(0, central ? 0x02014B50 : 0x04034B50, true);
    if (central) {
      view.setUint16(4, 20, true);  // ZIP version made by
      view.setUint16(6, 20, true);  // ZIP version required
      view.setUint16(8, 0x0800, true); // UTF-8 filenames
      view.setUint16(10, 0, true); // Stored, no compression
      view.setUint16(12, timestamp.time, true);
      view.setUint16(14, timestamp.date, true);
      view.setUint32(16, checksum, true);
      view.setUint32(20, size, true);
      view.setUint32(24, size, true);
      view.setUint16(28, nameBytes.length, true);
      view.setUint32(42, offset, true);
    } else {
      view.setUint16(4, 20, true);
      view.setUint16(6, 0x0800, true);
      view.setUint16(8, 0, true);
      view.setUint16(10, timestamp.time, true);
      view.setUint16(12, timestamp.date, true);
      view.setUint32(14, checksum, true);
      view.setUint32(18, size, true);
      view.setUint32(22, size, true);
      view.setUint16(26, nameBytes.length, true);
    }
    out.set(nameBytes, base);
    return out;
  }

  function makeZip(files) {
    const now = zipDateTime(new Date());
    const parts = [];
    const directory = [];
    let offset = 0;
    for (const file of files) {
      const checksum = crc32(file.bytes);
      const local = header(file.name, file.bytes, checksum, offset, now, false);
      parts.push(local, file.bytes);
      directory.push(header(file.name, file.bytes, checksum, offset, now, true));
      offset += local.byteLength + file.bytes.byteLength;
    }
    const directoryStart = offset;
    for (const entry of directory) {
      parts.push(entry);
      offset += entry.byteLength;
    }
    if (files.length > 0xFFFF || offset > 0xFFFFFFFF) throw new Error('ZIP archive is too large.');
    const end = new Uint8Array(22);
    const view = new DataView(end.buffer);
    view.setUint32(0, 0x06054B50, true);
    view.setUint16(8, files.length, true);
    view.setUint16(10, files.length, true);
    view.setUint32(12, offset - directoryStart, true);
    view.setUint32(16, directoryStart, true);
    parts.push(end);
    return new Blob(parts, { type: 'application/zip' });
  }

  function sourceFiles(mode='full') {
    // Preserve exactly the site's relative directory structure for local HTML links.
    const files = [
      ['daruri/index.html', 'index.html'],
      ['daruri/bookmark-ui.js', 'bookmark-ui.js?v=20261023-personal-icons'],
      ['daruri/bookmark-ui.css', 'bookmark-ui.css?v=20261023-personal-icons'],
      ['daruri/backup-transfer.js', 'backup-transfer.js?v=20261023-transfer-release2'],
      ['daruri/backup-transfer.css', 'backup-transfer.css?v=20261023-transfer-release2'],
      ['daruri/google-drive-config.js', 'google-drive-config.js?v=20261023-transfer-release2'],
      ['daruri/reading-desk.js', 'reading-desk.js?v=20261023-transfer-release2'],
      ['daruri/reading-desk.css', 'reading-desk.css?v=20261023-rd-ux1-personal-icons'],
      ['daruri/reading-mode-controls.js', 'reading-mode-controls.js?v=20261023-dock-saved-sheet-touch1'],
      ['daruri/reading-mode-controls.css', 'reading-mode-controls.css?v=20261023-dock-saved-sheet-touch1'],
      ['daruri/reading-navigation-history.js', 'reading-navigation-history.js?v=20261023-history-help2'],
      ['daruri/reading-navigation-bridge.js', 'reading-navigation-bridge.js?v=20261023-history-help2'],
      ['daruri/reading-navigation-history.css', 'reading-navigation-history.css?v=20261023-history-help2'],
      ['daruri/reading-desk-pdf.js', 'reading-desk-pdf.js?v=20261021-rdiconpdf1'],
      ['daruri/reading-desk-dictionary.js', 'reading-desk-dictionary.js?v=20261023-personal-icons'],
      ['daruri/reader-structure.css', 'reader-structure.css?v=20261020-structure1'],
      ['daruri/subject-index.css', 'subject-index.css?v=20261020-indexprint1'],
      ['daruri/subject-index-data.js', 'subject-index-data.js?v=20261020-structure1'],
      ['daruri/subject-index.js', 'subject-index.js?v=20261020-indexprint1'],
      ['daruri/subject-index-data.json', 'subject-index-data.json?v=20261020-structure1'],
      ['daruri/reading-styles.css', 'reading-styles.css'],
      ['daruri/reading-styles.js', 'reading-styles.js'],
      ['daruri/visuals-controls.js', 'visuals-controls.js?v=20261020-visuals1'],
      ['daruri/compact-menu.css', 'compact-menu.css?v=20261023-editions-delivery1'],
      ['daruri/english-fonts.css', 'english-fonts.css?v=20261020-fonts3'],
      ['daruri/fonts/english-font-faces.css', 'fonts/english-font-faces.css'],
      ['daruri/fonts/source-sans-3-normal.ttf', 'fonts/source-sans-3-normal.ttf'],
      ['daruri/fonts/source-sans-3-italic.ttf', 'fonts/source-sans-3-italic.ttf'],
      ['daruri/fonts/lexend-normal.ttf', 'fonts/lexend-normal.ttf'],
      ['daruri/fonts/OFL-Source-Sans-3.txt', 'fonts/OFL-Source-Sans-3.txt'],
      ['daruri/fonts/OFL-Lexend.txt', 'fonts/OFL-Lexend.txt'],
      ['daruri/fonts/ENGLISH-SOURCES.json', 'fonts/ENGLISH-SOURCES.json'],
      ['daruri/fonts/ENGLISH-README.md', 'fonts/ENGLISH-README.md'],
      ['daruri/arabic-fonts.css', 'arabic-fonts.css'],
      ['daruri/fonts/OFL-Amiri.txt', 'fonts/OFL-Amiri.txt'],
      ['daruri/fonts/OFL-Noto-Naskh-Arabic.txt', 'fonts/OFL-Noto-Naskh-Arabic.txt'],
      ['daruri/fonts/OFL-Scheherazade-New.txt', 'fonts/OFL-Scheherazade-New.txt'],
      ['daruri/fonts/README.md', 'fonts/README.md'],
      ['daruri/fonts/SOURCES.json', 'fonts/SOURCES.json'],
      ['daruri/fonts/amiri-bold.woff2', 'fonts/amiri-bold.woff2'],
      ['daruri/fonts/amiri-regular.woff2', 'fonts/amiri-regular.woff2'],
      ['daruri/fonts/font-faces.css', 'fonts/font-faces.css'],
      ['daruri/fonts/noto-naskh-arabic-bold.woff2', 'fonts/noto-naskh-arabic-bold.woff2'],
      ['daruri/fonts/noto-naskh-arabic-regular.woff2', 'fonts/noto-naskh-arabic-regular.woff2'],
      ['daruri/fonts/scheherazade-new-bold.woff2', 'fonts/scheherazade-new-bold.woff2'],
      ['daruri/fonts/scheherazade-new-regular.woff2', 'fonts/scheherazade-new-regular.woff2'],
      ['daruri/favicon.svg', 'favicon.svg'],
      ['daruri/apple-touch-icon.png', 'apple-touch-icon.png'],
      ['daruri/icon-192.png', 'icon-192.png'],
      ['daruri/icon-512.png', 'icon-512.png'],
      ['daruri/dictionary.html', 'dictionary.html'],
      ['daruri/dictionary-r3-20261020.js', 'dictionary-r3-20261020.js?v=daruri8-structure-20261020'],
      ['daruri/edition-r3-20261020.js', 'edition-r3-20261020.js?v=20261021-section1-qparallels1'],
      ['daruri/gnamma-search.js', 'gnamma-search.js?v=20261022-morphperf1'],
      ['daruri/gnamma-morphology.js', 'gnamma-morphology.js?v=20261022-morphperf1'],
      ['daruri/gnamma-word-context.js', 'gnamma-word-context.js?v=20261022-morphperf1'],
      ['daruri/gnamma-word-context.css', 'gnamma-word-context.css?v=20261022-morphperf1'],
      ['daruri/morph-lexicon.json', 'morph-lexicon.json'],
      ['daruri/morph-daruri-v1.json', 'morph-daruri-v1.json'],
      ['daruri/morph-mustasfa-v1.json', 'morph-mustasfa-v1.json'],
      ['daruri/gnamma-search.css', 'gnamma-search.css?v=20261022-proximity1'],
      ['daruri/gnamma-search-return.js', 'gnamma-search-return.js?v=20261022-return2'],
      ['daruri/gnamma-proximity.js', 'gnamma-proximity.js?v=20261022-proximity1'],
      ['daruri/gnamma-scholarly.js', 'gnamma-scholarly.js?v=20261022-scholarly1'],
      ['daruri/gnamma-scholarly.css', 'gnamma-scholarly.css?v=20261022-scholarly1'],
      ['daruri/source-reference-data.js', 'source-reference-data.js?v=20261023-hadith-arrow3'],
      ['daruri/source-note-ui.js', 'source-note-ui.js?v=20261021-qinline4'],
      ['daruri/source-note-ui.css', 'source-note-ui.css?v=20261021-fallback-quran1'],
      ['daruri/quran-context-ui.js', 'quran-context-ui.js?v=20261022-qcontext1'],
      ['daruri/quran-context-ui.css', 'quran-context-ui.css?v=20261022-qcontext1'],
      ['daruri/quran-context-data.json', 'quran-context-data.json?v=20261022-qcontext1'],
      ['daruri/quran-context-data.js', 'quran-context-data.js?v=20261022-qcontext1'],
      ['daruri/QURAN_CONTEXT_SOURCES.md', 'QURAN_CONTEXT_SOURCES.md'],
      ['daruri/hadith-inline-anchors.js', 'hadith-inline-anchors.js?v=20261023-hadithux3'],
      ['daruri/hadith-context-ui.js', 'hadith-context-ui.js?v=20261023-hadith-arrow3'],
      ['daruri/hadith-context-ui.css', 'hadith-context-ui.css?v=20261023-hadith-arrow3'],
      ['daruri/hadith-context-data.js', 'hadith-context-data.js?v=20261023-hctx1'],
      ['daruri/hadith-context-metadata.js', 'hadith-context-metadata.js?v=20261023-hctx1'],
      ['daruri/hadith-context-arabic-bukhari1.js', 'hadith-context-arabic-bukhari1.js?v=20261023-hctx1'],
      ['daruri/hadith-context-arabic-bukhari2.js', 'hadith-context-arabic-bukhari2.js?v=20261023-hctx1'],
      ['daruri/hadith-context-arabic-muslim.js', 'hadith-context-arabic-muslim.js?v=20261023-hctx1'],
      ['daruri/hadith-context-arabic-abudawud1.js', 'hadith-context-arabic-abudawud1.js?v=20261023-hctx1'],
      ['daruri/hadith-context-arabic-abudawud2.js', 'hadith-context-arabic-abudawud2.js?v=20261023-hctx1'],
      ['daruri/hadith-context-arabic-tirmidhi.js', 'hadith-context-arabic-tirmidhi.js?v=20261023-hctx1'],
      ['daruri/hadith-context-arabic-sunan.js', 'hadith-context-arabic-sunan.js?v=20261023-hctx1'],
      ['daruri/HADITH_CONTEXT_SOURCES.md', 'HADITH_CONTEXT_SOURCES.md'],
      ['daruri/hadith-context-english-bukhari-a.js', 'hadith-context-english-bukhari-a.js?v=20261023-hadithux3'],
      ['daruri/hadith-context-english-bukhari-b.js', 'hadith-context-english-bukhari-b.js?v=20261023-hadithux3'],
      ['daruri/hadith-context-english-bukhari-long.js', 'hadith-context-english-bukhari-long.js?v=20261023-hadithux3'],
      ['daruri/hadith-context-english-abudawud-a.js', 'hadith-context-english-abudawud-a.js?v=20261023-hadithux3'],
      ['daruri/hadith-context-english-abudawud-b.js', 'hadith-context-english-abudawud-b.js?v=20261023-hadithux3'],
      ['daruri/hadith-context-english-tirmidhi-a.js', 'hadith-context-english-tirmidhi-a.js?v=20261023-hadithux3'],
      ['daruri/hadith-context-english-tirmidhi-b.js', 'hadith-context-english-tirmidhi-b.js?v=20261023-hadithux3'],
      ['daruri/hadith-context-english-tirmidhi-c.js', 'hadith-context-english-tirmidhi-c.js?v=20261023-hadithux3'],
      ['daruri/hadith-context-english-muslim.js', 'hadith-context-english-muslim.js?v=20261023-hadithux3'],
      ['daruri/hadith-context-english-other.js', 'hadith-context-english-other.js?v=20261023-hadithux3'],
      ['daruri/download-bundle.js', 'download-bundle.js?v=20261023-stage1-current'],
      ['daruri/study-guide-data.js', 'study-guide-data.js'],
      ['daruri/study-guide.js', 'study-guide.js'],
      ['daruri/study-guide.css', 'study-guide.css'],
      ['daruri/editions.js', 'editions.js?v=20261023-personal-icons'],
      ['daruri/editions.css', 'editions.css?v=20261021-editiontabs-vowels-release1'],
      ['daruri/editions-icons.css','editions-icons.css?v=20261023-ar-spacing1'],
      ['daruri/editions-icons.js','editions-icons.js?v=20261023-personal-icons'],
      ['daruri/editions-selector.js','editions-selector.js?v=20261023-stage1-current'],
      ['daruri/editions-selector.css','editions-selector.css?v=20261023-ar-spacing1'],
      ['daruri/editions/manifest.json','editions/manifest.json?v=20261021-bilingual-vowels1'],
      ['daruri/editions/apparatus/manifest.json','editions/apparatus/manifest.json?v=20261021-a4-apparatus1'],
      ['daruri/editions/maps/manifest.json','editions/maps/manifest.json?v=20261022-base-personal-word-maps'],
      // Stage 1: offline PDF composition uses 12 original A4 source PDFs and
      // exactly 15 checksum-verified apparatus packets, never 120 complete PDFs.
      ['daruri/dynamic-editions.html','dynamic-editions.html'],
      ['daruri/dynamic-pdf/client.js','dynamic-pdf/client.js?v=20261023-stage1'],
      ['daruri/dynamic-pdf/core.js','dynamic-pdf/core.js?v=20261023-stage1'],
      ['daruri/dynamic-pdf/design-catalog.js','dynamic-pdf/design-catalog.js?v=20261023-stage1'],
      ['daruri/dynamic-pdf/assemble.worker.js','dynamic-pdf/assemble.worker.js?v=20261023-stage1'],
      ['daruri/personal-export.html', 'personal-export.html'],
      ['daruri/personal-export.js', 'personal-export.js?v=20261023-stage1-current'],
      ['daruri/personal-pdf-enhancements.js','personal-pdf-enhancements.js?v=two-tabs-20261022'],
      ['daruri/personal-export.css', 'personal-export.css?v=3'],
      ['daruri/vendor/pdf-lib-1.17.1.min.js', 'vendor/pdf-lib-1.17.1.min.js'],
      ['daruri/vendor/fontkit-1.1.1.umd.min.js', 'vendor/fontkit-1.1.1.umd.min.js'],
      ['daruri/vendor/NotoSerif-Regular.ttf', 'vendor/NotoSerif-Regular.ttf'],
      ['daruri/vendor/NotoNaskhArabic-Regular.ttf', 'vendor/NotoNaskhArabic-Regular.ttf'],
      ['daruri/vendor/LICENSE-fontkit.md', 'vendor/LICENSE-fontkit.md'],
      ['daruri/vendor/OFL-NotoNaskhArabic.txt', 'vendor/OFL-NotoNaskhArabic.txt'],
      ['daruri/vendor/OFL-NotoSerif.txt', 'vendor/OFL-NotoSerif.txt'],
      ['daruri/vendor/LICENSE-pdf-lib.md', 'vendor/LICENSE-pdf-lib.md'],
      ['daruri/fonts/source-serif-4-normal.woff2', 'fonts/source-serif-4-normal.woff2'],
      ...['daruri.pdf','daruri-study.pdf','daruri-english.pdf','daruri-arabic.pdf','daruri-arabic-vowelled.pdf'].map(name=>['daruri/build/release/'+name+'.metadata.json','build/release/'+name+'.metadata.json']),
      ['daruri/print.css', 'print.css?v=20261020-indexprint1'],
      ['daruri/print.js', 'print.js'],
      ['daruri/lesson-print.js', 'lesson-print.js'],
      ['daruri/pdf-editions-manifest.json', 'pdf-editions-manifest.json?v=daruri8-structure-20261020'],
      ...['daruri.pdf','daruri-study.pdf','daruri-english.pdf','daruri-arabic.pdf','daruri-arabic-vowelled.pdf'].map(name=>['daruri/personal-anchor-maps/'+name+'.json','personal-anchor-maps/'+name+'.json']),
      ['daruri/manifest.webmanifest', 'manifest.webmanifest'],
      ['daruri/sw.js', 'sw.js?v=20261023-dock-saved-sheet-touch1'],
      ['daruri/dictionary-data.json', 'dictionary-data.json'],
      ['daruri/lexicon-additions.json', 'lexicon-additions.json'],
      ['assets/gnamma-mark.svg', '../assets/gnamma-mark.svg'],
      ['assets/gnamma-reading-modes.svg', '../assets/gnamma-reading-modes.svg'],
      ['assets/gnamma-landscape.webp', '../assets/gnamma-landscape.webp'],
      ['assets/gnamma-scene.svg', '../assets/gnamma-scene.svg']
    ];

    // Include all five published reading editions even when a sidebar is hidden.
    // The Bou Akl variant report is supplementary; discover other on-site PDF links.
    const pdfs = new Map([
      ['daruri/daruri.pdf', 'daruri.pdf?v=daruri8-structure-20261020'],
      ['daruri/daruri-arabic.pdf', 'daruri-arabic.pdf?v=daruri8-structure-20261020'],
      ['daruri/daruri-english.pdf', 'daruri-english.pdf?v=daruri8-structure-20261020'],
      ['daruri/daruri-study.pdf', 'daruri-study.pdf?v=daruri8-structure-20261020'],
      ['daruri/daruri-study-guide.pdf', 'daruri-study-guide.pdf'],
      ['daruri/daruri-arabic-vowelled.pdf', 'daruri-arabic-vowelled.pdf?v=daruri8-structure-20261020'],
      ['daruri/bou-akl-2015-variant-report.pdf', 'bou-akl-2015-variant-report.pdf']
    ]);
    // Complete A4 Reading/Study PDFs, including both additive bilingual
    // unvowelled variants, are included even when the tab is not selected.
    const catalog = [
      ...['bilingual','bilingual-unvowelled','english','arabic','arabic-vowelled']
        .flatMap(language=>['off','on']
          .map(titles=>'reading/daruri-reading-'+language+'-titles-'+titles+'.pdf')),
      ...['off','on'].map(titles=>'study/daruri-study-bilingual-titles-'+titles+'.pdf')
    ];
    for(const entry of catalog) pdfs.set('daruri/editions/'+entry,'editions/'+entry);
    // Each unchanged plain A4 PDF has an independently certified P-note map.
    // Include its map and metadata for browser-local offline personal export.
    for(const entry of catalog){
      const name=entry.split('/').pop();
      for(const suffix of ['.json','.metadata.json'])
        files.push(['daruri/editions/maps/'+name+suffix,
          'editions/maps/'+name+suffix]);
    }
    // 120 signed generation profiles bind the 8 eligible source layouts to
    // 15 nonempty combinations of glossary/index/concordance/applications.
    files.push(['daruri/dynamic-pdf/packets/manifest.json',
      'dynamic-pdf/packets/manifest.json']);
    const components=['glossary','index','concordance','applications'];
    const variants=['daruri-reading-bilingual','daruri-reading-bilingual-unvowelled',
      'daruri-reading-english','daruri-study-bilingual'];
    for(let mask=1;mask<16;mask++){
      const suffix=components.filter((_,i)=>Boolean(mask&(1<<i))).join('-');
      const packet='gnamma-apparatus-'+suffix+'.pdf';
      pdfs.set('daruri/dynamic-pdf/packets/'+packet,
        'dynamic-pdf/packets/'+packet);
      files.push(['daruri/dynamic-pdf/packets/'+packet+'.json',
        'dynamic-pdf/packets/'+packet+'.json']);
      for(const family of variants){
        for(const titles of ['', '-titles-on']){
          const map=family+'-'+suffix+titles+'.pdf.links.json';
          files.push(['daruri/dynamic-pdf/packets/profiles/'+map,
            'dynamic-pdf/packets/profiles/'+map]);
        }
      }
    }
    for (const link of document.querySelectorAll('a[href]')) {
      const raw = link.getAttribute('href') || '';
      const path = raw.split('#')[0].split('?')[0];
      if (!/\.pdf$/i.test(path)) continue;
      const url = new URL(path, root);
      if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) continue;
      let relative = '';
      try { relative = decodeURIComponent(url.pathname.slice(root.pathname.length)); }
      catch (_) { continue; }
      if (!/^[\w./-]+\.pdf$/i.test(relative) ||
          relative.startsWith('../') || relative.includes('/../') ||
          relative.startsWith('editions/apparatus/')) continue;
      pdfs.set('daruri/' + relative, relative);
    }
    for (const entry of pdfs) files.push(entry);
    // The smaller offline HTML download does not silently bundle book PDFs.
    // PDF navigation maps have no use without their corresponding PDFs.
    const selected=mode==='html'?
      files.filter(([name])=>!/\.pdf(?:\.(?:metadata\.)?json)?$/i.test(name)&&
        !name.startsWith('daruri/dynamic-pdf/packets/')):files;
    return {files:selected,pdfNames:mode==='html'?[]:[...pdfs.keys()]};
  }

  async function readFile(name, path) {
    const url = new URL(path, root);
    if (RELEASE_ASSETS.has(path.split('?')[0]) && !url.searchParams.has('v')) url.searchParams.set('v', RELEASE_VERSION);
    const response = await fetch(url.href, { cache: 'no-store', credentials: 'same-origin' });
    if (!response.ok) throw new Error('Could not fetch ' + name + ' (HTTP ' + response.status + ').');
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.length) throw new Error(name + ' is empty.');
    if (/\.pdf$/i.test(name) &&
        !(bytes[0] === 37 && bytes[1] === 80 && bytes[2] === 68 &&
          bytes[3] === 70 && bytes[4] === 45)) {
      throw new Error(name + ' was not returned as a PDF.');
    }
    return { name, bytes };
  }

  // Delegation is essential: Editions is mounted dynamically after this script loads.
  let working=false;
  function report(button,message){
    const scope=button.closest('.gn-es-offline,.gn-pdf-editions')||button.parentElement;
    const status=scope?.querySelector('.gn-offline-bundle-status');
    if(status)status.textContent=message;
  }
  async function assemble(button,mode){
    if(working)return;
    if(location.protocol==='file:'){
      report(button,'Open this package through a local web server to rebuild it.');
      return;
    }
    working=true;button.setAttribute('aria-busy','true');
    try{
      const manifest=sourceFiles(mode),length=manifest.files.length;
      const files=new Array(length);
      let next=0,completed=0;
      report(button,'Collecting reader files (0/'+length+')…');
      // Limit concurrent fetches so the hosted reader remains responsive.
      async function worker(){
        while(next<length){
          const index=next++;
          const [name,path]=manifest.files[index];
          files[index]=await readFile(name,path);
          completed++;
          if(completed===length||completed%5===0)
            report(button,'Collecting reader files ('+completed+'/'+length+')…');
        }
      }
      await Promise.all(Array.from({length:Math.min(6,length)},worker));
      const details=[
        'Gnamma Research — al-Daruri offline reading package',
        '',
        'Extract the entire ZIP, preserving folder structure.',
        'The HTML reader is at daruri/index.html.',
        mode==='html'?'This package does not include any PDFs.':
          'This package includes the available published PDFs as listed below.',
        'No personal notes, bookmarks, highlights or browser-local data are included.',
        '',
        'For full desktop use, open a terminal in the extracted package root:',
        '  python3 -m http.server 8000',
        'Then open: http://localhost:8000/daruri/index.html',
        'This uses files on your own computer; no internet connection is needed.',
        'Opening index.html as file:// may block browser fetch and search features.',
        'On iPhone/iPad, opening local HTML from Files may be limited by the browser.',
        'External links and online services still require a connection.',
        ...(mode==='html'?[]:['','PDFs included:',...manifest.pdfNames.map(x=>'  '+x)]),
        '',
        'Assembled from: '+root.href,
        'Created: '+new Date().toISOString(),
        ''
      ].join('\n');
      files.unshift({name:'READ-ME-FIRST.txt',bytes:encoder.encode(details)});
      report(button,'Packaging '+length+' downloaded files…');
      const zip=makeZip(files),downloadUrl=URL.createObjectURL(zip);
      const a=document.createElement('a');
      a.href=downloadUrl;
      a.download=mode==='html'?'Gnamma_Daruri_Offline_HTML.zip':
        'Gnamma_Daruri_Offline_HTML_and_PDFs.zip';
      a.style.display='none';document.body.appendChild(a);
      a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(downloadUrl),60000);
      report(button,'Archive created; check your downloads.');
    }catch(error){
      report(button,'Could not prepare the archive: '+String(error?.message||error)+
        '. Your browser files and saved notes are unchanged.');
      console.error('Daruri offline bundle:',error);
    }finally{
      button.removeAttribute('aria-busy');
      working=false;
    }
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-daruri-bundle]');
    if(!button)return;
    event.preventDefault();
    void assemble(button,button.dataset.daruriBundle==='html'?'html':'full');
  });
  // Pure manifest function exposed only for release verification; no user data.
  window.GnammaOfflineBundle=Object.freeze({sourceFiles});
})();
