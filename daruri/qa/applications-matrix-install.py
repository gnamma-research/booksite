#!/usr/bin/env python3
"""Add the matrix assets surgically; refuse unexpected reader structures."""
from pathlib import Path
import hashlib
import json
import re

root = Path(__file__).resolve().parents[1]
version = '20261110-matrix1'
index = root / 'index.html'
original = index.read_text(encoding='utf-8')
baseline = root / '.applications-matrix-baseline.html'
if not baseline.exists():
    baseline.write_text(original, encoding='utf-8')
protected = ['edition-r3-20261020.js', 'source-reference-data.js', 'study-guide-data.js',
             'daruri.pdf', 'daruri-study.pdf', 'daruri-english.pdf',
             'daruri-arabic.pdf', 'daruri-arabic-vowelled.pdf']
before = {name: hashlib.sha256((root/name).read_bytes()).hexdigest() for name in protected}
html = original
css = f'<link rel="stylesheet" href="applications-matrix.css?v={version}">'
js = f'<script src="applications-matrix.js?v={version}"></script>'
if 'applications-matrix.css?' not in html:
    assert html.count('</head>') == 1, 'Expected one head terminator'
    html = html.replace('</head>', css + '\n</head>')
if 'applications-matrix.js?' not in html:
    assert html.count('</body>') == 1, 'Expected one body terminator'
    html = html.replace('</body>', js + '\n</body>')
assert html.count(css) == 1 and html.count(js) == 1
# Only the package-loader cache key changes; edition and PDF versions stay intact.
html = re.sub(r'download-bundle\.js\?v=[A-Za-z0-9_-]+', 'download-bundle.js?v='+version, html)
index.write_text(html, encoding='utf-8')
sw_path = root / 'sw.js'
sw = sw_path.read_text(encoding='utf-8')
sw, count = re.subn(r'const NAME="[^"]+"', 'const NAME="daruri-reader-20261110-applications-matrix1"', sw, count=1)
assert count == 1
for name in ['applications-matrix.js', 'applications-matrix.css']:
    token = f"'{name}?v={version}'"
    if token not in sw:
        assert 'const CORE=[' in sw
        sw = sw.replace('const CORE=[', 'const CORE=['+token+',', 1)
sw = re.sub(r'download-bundle\.js\?v=[A-Za-z0-9_-]+', 'download-bundle.js?v='+version, sw)
sw_path.write_text(sw, encoding='utf-8')
bundle_path = root / 'download-bundle.js'
bundle = bundle_path.read_text(encoding='utf-8')
marker = "['daruri/bookmark-ui.js',"
assert marker in bundle, 'Expected the current package asset list'
entries = ''.join(f"['daruri/{name}', '{name}?v={version}'],\n      " for name in ['applications-matrix.js','applications-matrix.css'])
if "['daruri/applications-matrix.js'," not in bundle:
    bundle = bundle.replace(marker, entries+marker, 1)
bundle_path.write_text(bundle, encoding='utf-8')
after = {name: hashlib.sha256((root/name).read_bytes()).hexdigest() for name in protected}
assert before == after, 'Source or PDF bytes changed'
# Removing our two tags and normalizing only the loader version must recover
# the original HTML exactly: no prose, controls, script bodies or links replaced.
strip = lambda s: re.sub(r'download-bundle\.js\?v=[A-Za-z0-9_-]+', 'download-bundle.js?v=LOADER', s.replace(css+'\n','').replace(js+'\n',''))
assert strip(html) == strip(original), 'Unexpected reader change'
report = {'version':version,'sourceAndPDFsUnchanged':True,'protectedSHA256':before,
          'readerChange':'Two asset tags and package-loader cache key only',
          'newAssets':['applications-matrix.js','applications-matrix.css']}
(root/'qa/applications-matrix-source-check.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,indent=2))
