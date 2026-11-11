#!/usr/bin/env python3
"""Create a portable working-edition recovery ZIP; exclude fonts and binaries."""
import hashlib
import json
import subprocess
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EDITION = ROOT / 'texts/al-taftazani/tahdhib-al-mantiq/edition'
ALLOWED = {'.md', '.js', '.mjs', '.json', '.html', '.css', '.txt', '.py', '.yml', '.yaml'}

def main():
    text = (EDITION / 'progress-data.js').read_text(encoding='utf-8')
    payload = text[text.index('window.GNAMMA_'):].split('=', 1)[1].strip().removesuffix(';')
    progress = json.loads(payload)
    stage = progress['stage']
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    directories = [
        'texts/al-taftazani/tahdhib-al-mantiq',
        'texts/al-taftazani/tahdhib-al-kalam',
        'texts/shared', 'tools/tahdhib',
    ]
    selected = {}
    for directory in directories:
        for path in (ROOT / directory).rglob('*'):
            if path.is_file() and not path.is_symlink() and path.suffix.lower() in ALLOWED:
                if any(part in ('node_modules', '__pycache__', '.git') for part in path.parts):
                    continue
                selected[path.relative_to(ROOT).as_posix()] = path
    for filename in ['.github/workflows/tahdhib-reader-ci.yml', 'daruri/bookmark-ui.js']:
        path = ROOT / filename
        if path.is_file():
            selected[filename] = path
    output = ROOT / 'tahdhib-recovery-export'
    output.mkdir(exist_ok=True)
    name = f'Tahdhib-working-edition-stage{stage}'
    hashes = {}
    readme = f'''# Tahdhib working edition: recovery bundle, Stage {stage}\n\nRepository commit: {commit}\n\nOpen texts/al-taftazani/tahdhib-al-mantiq/edition/HANDOFF_LATEST.md first.\nThe cumulative Markdown path is recorded in progress-data.js under currentRelease.\nThe original matn, main Yazdi commentary, later glosses and their historical numbering\nremain separate. This is a WORKING, UNCOLLATED edition, not a certified critical text.\n\nTo view the reader locally: run `python3 -m http.server 8765` in this directory,\nthen open http://127.0.0.1:8765/texts/al-taftazani/tahdhib-al-mantiq/edition/hawashi-numbered-notes.html\n\nOnly text/code files are included; no fonts or binaries are distributed.\nSHA256SUMS.json records the bytes of every included repository file.\nThe bundle does not itself certify manuscript readings or translation fidelity.\n'''
    with zipfile.ZipFile(output / (name + '.zip'), 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr('RECOVERY_README.md', readme)
        for relative, path in sorted(selected.items()):
            raw = path.read_bytes()
            hashes[relative] = hashlib.sha256(raw).hexdigest()
            archive.writestr(relative, raw)
        manifest = {'stage': stage, 'commit': commit, 'file_count': len(hashes), 'sha256': hashes}
        archive.writestr('SHA256SUMS.json', json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    (output / 'RECOVERY_README.md').write_text(readme, encoding='utf-8')
    (output / 'release-state.json').write_text(json.dumps({'stage': stage, 'commit': commit, 'metrics': progress['metrics'], 'currentRelease': progress['currentRelease']}, ensure_ascii=False, indent=2), encoding='utf-8')
    for key in ['allSectionsCumulativeMarkdown', 'cumulativeMarkdown']:
        relative = progress.get('currentRelease', {}).get(key)
        if relative and (EDITION / relative).is_file():
            (output / Path(relative).name).write_bytes((EDITION / relative).read_bytes())
    (output / 'HANDOFF_LATEST.md').write_bytes((EDITION / 'HANDOFF_LATEST.md').read_bytes())
    print(f'Created {name}.zip: {len(hashes)} text/code files; no fonts')

if __name__ == '__main__':
    main()
