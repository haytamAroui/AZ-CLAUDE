#!/usr/bin/env node
'use strict';
/**
 * AZCLAUDE — Stop hook
 * Runs at end of every session.
 * Stamps goals.md with today's date, writes friction stub if /persist was not run.
 * Works on: Windows (PowerShell/CMD/Git Bash), macOS, Linux.
 */
const fs   = require('fs');
const path = require('path');

const cfg      = process.env.AZCLAUDE_CFG || '.claude';
const goalsPath = path.join(cfg, 'memory', 'goals.md');

if (!fs.existsSync(goalsPath)) process.exit(0);

// Stamp goals.md with today's date
const today   = new Date().toISOString().slice(0, 10);
const content = fs.readFileSync(goalsPath, 'utf8');
const stamped = content.replace(/^Updated: .*/m, `Updated: ${today}`);
try { fs.writeFileSync(goalsPath, stamped); } catch (_) {}

// Write friction stub if /persist was not run this session
const obsDir = 'ops/observations';
try { fs.mkdirSync(obsDir, { recursive: true }); } catch (_) {}

const ts   = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
const stub = path.join(obsDir, `${ts}-friction.md`);

if (!fs.existsSync(stub)) {
  const body = [
    '---',
    `date: ${new Date().toISOString()}`,
    'type: friction',
    '---',
    '',
    '# Friction',
    '',
    '(session ended without /persist)',
    ''
  ].join('\n');
  try {
    fs.writeFileSync(stub, body);
    process.stdout.write('⚠ session state not persisted — run /persist before closing\n');
  } catch (_) {}
}
