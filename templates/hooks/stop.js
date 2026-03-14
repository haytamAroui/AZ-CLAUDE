#!/usr/bin/env node
'use strict';
/**
 * AZCLAUDE — Stop hook
 * Runs at end of every session.
 * 1. Migrates "In progress" entries → "Done this session"
 * 2. Stamps goals.md with today's date
 * 3. Writes friction stub if /persist was not run
 * Works on: Windows (PowerShell/CMD/Git Bash), macOS, Linux.
 */
const fs   = require('fs');
const path = require('path');

const cfg       = process.env.AZCLAUDE_CFG || '.claude';
const goalsPath = path.join(cfg, 'memory', 'goals.md');

if (!fs.existsSync(goalsPath)) process.exit(0);

const today   = new Date().toISOString().slice(0, 10);
let   content = fs.readFileSync(goalsPath, 'utf8');

// ── Migrate "In progress" → "Done this session" ──────────────────────────────
const IN_PROGRESS = '## In progress';
const DONE        = '## Done this session';

if (content.includes(IN_PROGRESS)) {
  const lines    = content.split('\n');
  const ipIdx    = lines.findIndex(l => l.trim() === IN_PROGRESS);
  const doneIdx  = lines.findIndex(l => l.trim() === DONE);

  // Collect entries under ## In progress (lines starting with "- " until next ##)
  const ipEntries = [];
  for (let i = ipIdx + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) break;
    if (lines[i].startsWith('- ')) ipEntries.push(lines[i]);
  }

  if (ipEntries.length > 0) {
    // Remove ## In progress section entirely
    const withoutIP = [];
    let skip = false;
    for (const line of lines) {
      if (line.trim() === IN_PROGRESS) { skip = true; continue; }
      if (skip && line.startsWith('## ')) skip = false;
      if (!skip) withoutIP.push(line);
    }

    // Add entries to ## Done this session
    const dIdx = withoutIP.findIndex(l => l.trim() === DONE);
    if (dIdx !== -1) {
      withoutIP.splice(dIdx + 1, 0, ...ipEntries);
    } else {
      // No Done section — create one
      withoutIP.push('', DONE, ...ipEntries);
    }

    content = withoutIP.join('\n');
  } else {
    // Empty In progress — just remove the heading
    content = content.replace(`\n${IN_PROGRESS}\n`, '\n');
  }
}

// ── Stamp today's date ────────────────────────────────────────────────────────
content = content.replace(/^Updated: .*/m, `Updated: ${today}`);
try { fs.writeFileSync(goalsPath, content); } catch (_) {}

// ── Friction stub if /persist was not run ─────────────────────────────────────
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
