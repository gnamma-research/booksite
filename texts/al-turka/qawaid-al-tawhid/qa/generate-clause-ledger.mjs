#!/usr/bin/env node
import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';import path from 'node:path';
const p=path.join(path.dirname(fileURLToPath(import.meta.url)),'qawtaw5_release.py');const r=spawnSync('python3',[p,'--ledger'],{stdio:'inherit'});process.exit(r.status??1);
