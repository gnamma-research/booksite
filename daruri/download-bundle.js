/* Gnamma al-Daruri: generate a self-contained source/PDF package in the browser.
   No external ZIP libraries or third-party services are used. ZIP entries use
   method 0 (stored), so PDFs and UTF-8 HTML are kept byte-for-byte intact. */
(() => {
  'use strict';

  // BEGIN DARURI RELEASE ASSETS
  const RELEASE_VERSION = "daruri6-sources-20261020";
  const RELEASE_ASSETS = new Set(["daruri.pdf", "daruri-study.pdf", "daruri-english.pdf", "daruri-arabic.pdf", "daruri-arabic-vowelled.pdf", "edition-r3-20261020.js", "dictionary-r3-20261020.js", "download-bundle.js", "pdf-editions-manifest.json", "sw.js", "daruri-study-guide.pdf", "study-guide-data.js", "study-guide.js"]);
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

  function sourceFiles() {
    // Preserve exactly the site's relative directory structure for local HTML links.
    const files = [
      ['daruri/index.html', 'index.html'],
      ['daruri/reading-styles.css', 'reading-styles.css'],
      ['daruri/reading-styles.js', 'reading-styles.js'],
      ['daruri/compact-menu.css', 'compact-menu.css'],
      ['daruri/english-fonts.css', 'english-fonts.css'],
      ['daruri/fonts/english-font-faces.css', 'fonts/english-font-faces.css'],
      ['daruri/fonts/source-serif-4-normal.woff2', 'fonts/source-serif-4-normal.woff2'],
      ['daruri/fonts/source-serif-4-italic.woff2', 'fonts/source-serif-4-italic.woff2'],
      ['daruri/fonts/literata-normal.woff2', 'fonts/literata-normal.woff2'],
      ['daruri/fonts/literata-italic.woff2', 'fonts/literata-italic.woff2'],
      ['daruri/fonts/OFL-Source-Serif-4.txt', 'fonts/OFL-Source-Serif-4.txt'],
      ['daruri/fonts/OFL-Literata.txt', 'fonts/OFL-Literata.txt'],
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
      ['daruri/dictionary-r3-20261020.js', 'dictionary-r3-20261020.js'],
      ['daruri/edition-r3-20261020.js', 'edition-r3-20261020.js'],
      ['daruri/source-reference-data.js', 'source-reference-data.js?v=daruri7-notes-20261020'],
      ['daruri/download-bundle.js', 'download-bundle.js'],
      ['daruri/study-guide-data.js', 'study-guide-data.js'],
      ['daruri/study-guide.js', 'study-guide.js'],
      ['daruri/study-guide.css', 'study-guide.css'],
      ['daruri/print.css', 'print.css'],
      ['daruri/print.js', 'print.js'],
      ['daruri/lesson-print.js', 'lesson-print.js'],
      ['daruri/pdf-editions-manifest.json', 'pdf-editions-manifest.json'],
      ['daruri/manifest.webmanifest', 'manifest.webmanifest'],
      ['daruri/sw.js', 'sw.js'],
      ['daruri/dictionary-data.json', 'dictionary-data.json'],
      ['daruri/lexicon-additions.json', 'lexicon-additions.json'],
      ['assets/gnamma-mark.svg', '../assets/gnamma-mark.svg'],
      ['assets/gnamma-reading-modes.svg', '../assets/gnamma-reading-modes.svg'],
      ['assets/gnamma-landscape.webp', '../assets/gnamma-landscape.webp'],
      ['daruri/assets/gnamma-landscape.webp', '../assets/gnamma-landscape.webp']
    ];

    // Include all five published reading editions even when a sidebar is hidden.
    // The Bou Akl variant report is supplementary; discover other on-site PDF links.
    const pdfs = new Map([
      ['daruri/daruri.pdf', 'daruri.pdf'],
      ['daruri/daruri-arabic.pdf', 'daruri-arabic.pdf'],
      ['daruri/daruri-english.pdf', 'daruri-english.pdf'],
      ['daruri/daruri-study.pdf', 'daruri-study.pdf'],
      ['daruri/daruri-study-guide.pdf', 'daruri-study-guide.pdf'],
      ['daruri/daruri-arabic-vowelled.pdf', 'daruri-arabic-vowelled.pdf'],
      ['daruri/bou-akl-2015-variant-report.pdf', 'bou-akl-2015-variant-report.pdf']
    ]);
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
          relative.startsWith('../') || relative.includes('/../')) continue;
      pdfs.set('daruri/' + relative, relative);
    }
    for (const entry of pdfs) files.push(entry);
    return { files, pdfNames: [...pdfs.keys()] };
  }

  async function readFile(name, path) {
    const url = new URL(path, root);
    if (RELEASE_ASSETS.has(path.split('?')[0])) url.searchParams.set('v', RELEASE_VERSION);
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

  const buttons = [...document.querySelectorAll('a[data-daruri-bundle]')];
  let working = false;
  function report(message) {
    for (const button of buttons) {
      const status = button.parentElement.querySelector('.gn-offline-bundle-status');
      if (status) status.textContent = message;
    }
  }

  for (const button of buttons) {
    button.addEventListener('click', async event => {
      if (button.dataset.bundleFailed === '1') return; // Working GitHub ZIP fallback
      event.preventDefault();
      if (working) return;
      if (location.protocol === 'file:') {
        report('Already viewing local files; use the downloaded ZIP.');
        return;
      }
      working = true;
      for (const item of buttons) item.setAttribute('aria-busy', 'true');
      try {
        report('Gathering reader files and PDFs…');
        const manifest = sourceFiles();
        const files = await Promise.all(manifest.files.map(([name, path]) => readFile(name, path)));
        const details = [
          'Gnamma Research — al-Daruri HTML and PDF study package',
          '',
          'Unzip the package, preserving its folders.',
          'Open daruri/index.html to read the Arabic-English text.',
          'Open daruri/dictionary.html for the historical dictionary.',
          '',
          'PDFs included:',
          ...manifest.pdfNames.map(name => '  ' + name),
          '',
          'The HTML reader uses accompanying JavaScript and image files in',
          'their original relative paths. Do not move index.html on its own.',
          'For best offline compatibility, use a modern desktop web browser.',
          'On iPhone/iPad, local HTML and scripting are dependent on the Files',
          'app and browser restrictions; PDFs remain available normally.',
          'External citations and online services still require connectivity.',
          '',
          'Assembled from: ' + root.href,
          'Generated: ' + new Date().toISOString(),
          ''
        ].join('\n');
        files.unshift({ name: 'READ-ME-FIRST.txt', bytes: encoder.encode(details) });
        report('Building ZIP package…');
        const zip = makeZip(files);
        const downloadUrl = URL.createObjectURL(zip);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'Gnamma_Daruri_Reader_HTML_PDFs.zip';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 60000);
        report('ZIP ready — check your downloads.');
      } catch (error) {
        report('Package unavailable here. Tap again for the full GitHub source ZIP.');
        for (const item of buttons) item.dataset.bundleFailed = '1';
        console.error('Daruri offline bundle:', error);
      } finally {
        for (const item of buttons) item.removeAttribute('aria-busy');
        working = false;
      }
    });
  }
})();
