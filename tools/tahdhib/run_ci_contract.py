#!/usr/bin/env python3
"""Execute the unchanged Stage112 CI shell blocks on a compatible pinned runner.
The contract is the exact former workflow blob. No test is removed or rewritten.
"""
import argparse
import hashlib
import subprocess
import tempfile
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[2]
CONTRACT = ROOT / 'tools/tahdhib/ci-contract-stage112.yml'
EXPECTED_GIT_BLOB = '1cbbb87bcfc971fb313304f4fe71a0ef753682ef'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('job', choices=['logical-core', 'reader-chromium'])
    args = parser.parse_args()
    raw = CONTRACT.read_bytes()
    blob = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
    if blob != EXPECTED_GIT_BLOB:
        raise SystemExit('Original CI contract changed: ' + blob)
    doc = yaml.safe_load(raw)
    commands = [step for step in doc['jobs'][args.job]['steps'] if 'run' in step]
    expected = 1 if args.job == 'logical-core' else 2
    if len(commands) != expected:
        raise SystemExit('Unexpected number of preserved shell blocks')
    print('Executing exact preserved CI contract:', blob, args.job, flush=True)
    for index, step in enumerate(commands):
        print('::group::' + step.get('name', f'Original block {index+1}'), flush=True)
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', suffix='.sh') as script:
            script.write(step['run'])
            script.flush()
            subprocess.run(['bash', '-e', '-o', 'pipefail', script.name], cwd=ROOT, check=True)
        print('::endgroup::', flush=True)
    print('PASS: every original shell check executed unchanged', flush=True)

if __name__ == '__main__':
    main()
