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
const os   = require('os');

// ── Hook profile gate ───────────────────────────────────────────────────────
// AZCLAUDE_HOOK_PROFILE=minimal|standard|strict (default: standard)
const HOOK_PROFILE = process.env.AZCLAUDE_HOOK_PROFILE || 'standard';

const cfg       = process.env.AZCLAUDE_CFG || '.claude';
// Guard: cfg must resolve inside the project root
if (path.resolve(cfg).indexOf(process.cwd()) !== 0) process.exit(0);
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
    // Empty In progress — just remove the heading + any trailing blank lines
    content = content.replace(new RegExp('\\n' + IN_PROGRESS + '\\n(\\n)*', 'g'), '\n');
  }
}

// ── Trim "Done this session" to max 20 entries (overflow → archive) ──────────
const DONE_KEEP  = 20;
const trimLines  = content.split('\n');
const dTrimIdx   = trimLines.findIndex(l => l.trim() === DONE);
if (dTrimIdx !== -1) {
  const doneEntries = [];
  for (let i = dTrimIdx + 1; i < trimLines.length; i++) {
    if (trimLines[i].startsWith('## ')) break;
    if (trimLines[i].startsWith('- ')) doneEntries.push({ line: trimLines[i], idx: i });
  }
  if (doneEntries.length > DONE_KEEP) {
    const toArchive   = doneEntries.slice(DONE_KEEP);
    const archivePath = path.join(cfg, 'memory', 'sessions', `${today}-edits.md`);
    try { fs.mkdirSync(path.join(cfg, 'memory', 'sessions'), { recursive: true }); } catch (_) {}
    const header  = `\n<!-- archived: ${today} source: stop -->\n`;
    const payload = toArchive.map(e => e.line).join('\n') + '\n';
    try { fs.appendFileSync(archivePath, header + payload); } catch (_) {}
    const archivedSet = new Set(toArchive.map(e => e.idx));
    content = trimLines.filter((_, i) => !archivedSet.has(i)).join('\n');
  }
}

// ── Stamp today's date ────────────────────────────────────────────────────────
content = content.replace(/^Updated: .*/m, `Updated: ${today}`);
try { fs.writeFileSync(goalsPath, content); } catch (_) {}

// ── Prune old checkpoints — keep 5 most recent, delete the rest ──────────────
// Older checkpoints are superseded by goals.md "Current threads" entries.
const checkpointDir = path.join(cfg, 'memory', 'checkpoints');
if (fs.existsSync(checkpointDir)) {
  try {
    const cpFiles = fs.readdirSync(checkpointDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse(); // newest first (YYYY-MM-DD-HH-MM.md sorts correctly)
    const MAX_CHECKPOINTS = 5;
    for (const f of cpFiles.slice(MAX_CHECKPOINTS)) {
      try { fs.unlinkSync(path.join(checkpointDir, f)); } catch (_) {}
    }
  } catch (_) {}
}

// ── Session duration ────────────────────────────────────────────────────────
const sessionStartPath = path.join(os.tmpdir(), `.azclaude-session-start-${process.ppid || process.pid}`);
if (fs.existsSync(sessionStartPath)) {
  try {
    const startIso = fs.readFileSync(sessionStartPath, 'utf8').trim();
    const startMs  = new Date(startIso).getTime();
    const durationMs = Date.now() - startMs;
    const mins = Math.round(durationMs / 60000);
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    const durationStr = hours > 0 ? `${hours}h ${remMins}m` : `${mins}m`;
    process.stdout.write(`\nSession duration: ${durationStr}\n`);
  } catch (_) {}
}

// ── Tool-use summary ────────────────────────────────────────────────────────
const obsPath = path.join(cfg, 'memory', 'reflexes', 'observations.jsonl');
if (fs.existsSync(obsPath)) {
  try {
    const sid = process.ppid || process.pid;
    const obsLines = fs.readFileSync(obsPath, 'utf8').split('\n').filter(Boolean);
    const counts = {};
    for (const line of obsLines) {
      try {
        const o = JSON.parse(line);
        if (o.session == sid && o.tool) {
          counts[o.tool] = (counts[o.tool] || 0) + 1;
        }
      } catch (_) {}
    }
    const parts = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([t, n]) => `${n} ${t}`)
      .slice(0, 6);
    if (parts.length > 0) {
      process.stdout.write(`Tools: ${parts.join(', ')}\n`);
    }
  } catch (_) {}
}

// ── Session security summary ──────────────────────────────────────────────────
const seclogPath = path.join(os.tmpdir(), `.azclaude-seclog-${process.ppid || process.pid}`);
if (fs.existsSync(seclogPath)) {
  try {
    const events = fs.readFileSync(seclogPath, 'utf8')
      .split('\n').filter(Boolean)
      .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
      .filter(Boolean);
    const blocks = events.filter(e => e.level === 'block');
    const warns  = events.filter(e => e.level === 'warn');
    if (blocks.length > 0 || warns.length > 0) {
      const b = blocks.length, w = warns.length;
      process.stdout.write(`\n🔒 Security: ${b} block${b !== 1 ? 's' : ''}, ${w} warning${w !== 1 ? 's' : ''} this session\n`);
      blocks.forEach(e => process.stdout.write(`  ✗ BLOCKED  [${e.rule}] ${e.target || ''}\n`));
      const seen = new Set();
      warns.forEach(e => { if (!seen.has(e.rule)) { seen.add(e.rule); process.stdout.write(`  ⚠ WARNED   [${e.rule}]\n`); } });
    } else {
      process.stdout.write('\n🔒 Security: clean session — 0 events\n');
    }
    try { fs.unlinkSync(seclogPath); } catch (_) {} // cleanup
  } catch (_) {}
}

// ── Visualizer pipeline-complete + session-summary events (opt-in) ──
if (process.env.AZCLAUDE_VISUALIZER) {
  // Signal pipeline completion — all stages go green
  try {
    const vPort0 = parseInt(process.env.AZCLAUDE_VISUALIZER, 10) || 8765;
    const pcPayload = JSON.stringify({ type: 'pipeline-complete' });
    const pcReq = require('http').request(
      { hostname: '127.0.0.1', port: vPort0, path: '/event', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(pcPayload) } },
      () => {}
    );
    pcReq.setTimeout(1500, () => pcReq.destroy());
    pcReq.on('error', () => {});
    pcReq.end(pcPayload);
  } catch (_v) {}
}
if (process.env.AZCLAUDE_VISUALIZER) {
  try {
    const vPort = parseInt(process.env.AZCLAUDE_VISUALIZER, 10) || 8765;
    // Gather session data for the dashboard
    let vizDuration = null, vizBlocks = 0, vizWarnings = 0;
    const vizStartPath = path.join(os.tmpdir(), `.azclaude-session-start-${process.ppid || process.pid}`);
    if (fs.existsSync(vizStartPath)) {
      try {
        const startMs = new Date(fs.readFileSync(vizStartPath, 'utf8').trim()).getTime();
        const mins = Math.round((Date.now() - startMs) / 60000);
        vizDuration = mins > 60 ? Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm' : mins + 'm';
      } catch (_) {}
    }
    if (fs.existsSync(seclogPath)) {
      try {
        const secEvents = fs.readFileSync(seclogPath, 'utf8').split('\n').filter(Boolean)
          .map(l => { try { return JSON.parse(l); } catch (_) { return null; } }).filter(Boolean);
        vizBlocks = secEvents.filter(e => e.level === 'block').length;
        vizWarnings = secEvents.filter(e => e.level === 'warn').length;
      } catch (_) {}
    }
    const payload = JSON.stringify({ type: 'session-summary', duration: vizDuration, blocks: vizBlocks, warnings: vizWarnings });
    const vReq = require('http').request(
      { hostname: '127.0.0.1', port: vPort, path: '/event', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } },
      () => {}
    );
    vReq.setTimeout(1500, () => vReq.destroy());
    vReq.on('error', () => {});
    vReq.end(payload);
  } catch (_v) {}
}

// ── Clean ALL session temp files ─────────────────────────────────────────────
const sid = process.ppid || process.pid;
const tempPatterns = [
  `edit-count`, `sec`, `secseq`, `seclog`, `seq`, `rapid`, `diff`, `cleanup-done`, `session-start`
];
for (const pat of tempPatterns) {
  const fp = path.join(os.tmpdir(), `.azclaude-${pat}-${sid}`);
  try { fs.unlinkSync(fp); } catch (_) {}
}
// Also clean the session marker from user-prompt.js
try { fs.unlinkSync(path.join(os.tmpdir(), `.azclaude-session-${sid}`)); } catch (_) {}

// ── Warn if /persist was not run (only in AZCLAUDE projects with obs dir) ──
const obsDir = path.join(cfg, 'memory', 'sessions');
if (!fs.existsSync(obsDir)) process.exit(0);
try {
  const existing = fs.readdirSync(obsDir).filter(f => f.startsWith(today) && f.endsWith('-edits.md'));
  if (existing.length === 0) {
    process.stdout.write('⚠ session state not persisted — run /persist before closing\n');
  }
} catch (_) {
  // obs dir doesn't exist yet — that's fine
}
