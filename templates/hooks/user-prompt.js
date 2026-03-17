#!/usr/bin/env node
'use strict';
/**
 * AZCLAUDE — UserPromptSubmit hook
 * Runs on every session's first prompt.
 * Injects goals.md into context so Claude always knows the current thread.
 * If previous session was interrupted (In progress entries remain), warns Claude.
 * Works on: Windows (PowerShell/CMD/Git Bash), macOS, Linux.
 */
const fs   = require('fs');
const path = require('path');
const os   = require('os');

// Fire once per session only — keyed by parent PID
const marker = path.join(os.tmpdir(), `.azclaude-session-${process.ppid || process.pid}`);
if (fs.existsSync(marker)) process.exit(0);
try { fs.writeFileSync(marker, ''); } catch (_) {}

// Only proceed if this is an AZCLAUDE project (goals.md exists)
const goalsPath = path.join('.claude', 'memory', 'goals.md');
if (!fs.existsSync(goalsPath)) process.exit(0);

// Ensure required directories exist — only in AZCLAUDE projects
for (const d of ['.claude/memory', '.claude/memory/checkpoints']) {
  try { fs.mkdirSync(d, { recursive: true }); } catch (_) {}
}

// Strip prompt-injection attempts before outputting into context
const INJECTION = /ignore.{0,20}previous.{0,20}instructions|curl.{0,10}\|.{0,10}bash|wget.{0,10}\|.{0,10}sh|you are now|system prompt/i;
const content   = fs.readFileSync(goalsPath, 'utf8');
const filtered  = content.split('\n').filter(l => !INJECTION.test(l)).join('\n');

// Warn if previous session was interrupted (In progress entries survived)
const ipMatch = filtered.match(/^## In progress\n((?:- .+\n?)+)/m);
if (ipMatch) {
  console.log('⚠ PREVIOUS SESSION INTERRUPTED — files were being edited:');
  console.log(ipMatch[1].trimEnd());
  console.log('Resume or discard before starting new work.');
  console.log('');
}

// Cap "Done this session" to last 20 entries — older entries are still on disk
const doneHeading = '## Done this session';
const doneIdx     = filtered.indexOf(doneHeading);
let output = filtered;
if (doneIdx !== -1) {
  const before    = filtered.slice(0, doneIdx);
  const afterDone = filtered.slice(doneIdx + doneHeading.length);
  const doneLines = afterDone.split('\n');
  const entries   = [];
  const rest      = [];
  let   pastDone  = false;
  for (const line of doneLines) {
    if (pastDone) { rest.push(line); continue; }
    if (line.startsWith('## ') && line.trim() !== '') { pastDone = true; rest.push(line); continue; }
    entries.push(line);
  }
  const MAX_DONE = 20;
  const entryLines = entries.filter(l => l.startsWith('- '));
  if (entryLines.length > MAX_DONE) {
    const trimmed = entryLines.slice(0, MAX_DONE);
    const nonEntries = entries.filter(l => !l.startsWith('- '));
    const omitted = entryLines.length - MAX_DONE;
    output = before + doneHeading + '\n' + trimmed.join('\n') + `\n- ... ${omitted} earlier entries (on disk)\n` + nonEntries.filter(l => l.trim()).join('\n') + '\n' + rest.join('\n');
  }
}

console.log('--- ACTIVE GOALS ---');
console.log(output);
console.log('--- END GOALS ---');

// Inject latest checkpoint if one exists — captures mid-session reasoning
const checkpointDir = path.join('.claude', 'memory', 'checkpoints');
if (fs.existsSync(checkpointDir)) {
  const files = fs.readdirSync(checkpointDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse(); // latest first
  if (files.length > 0) {
    const latest = path.join(checkpointDir, files[0]);
    const cpContent = fs.readFileSync(latest, 'utf8');
    const cpLines    = cpContent.split('\n').filter(l => !INJECTION.test(l));
    const MAX_CP     = 50;
    const cpTrimmed  = cpLines.length > MAX_CP
      ? cpLines.slice(0, MAX_CP).concat([`... ${cpLines.length - MAX_CP} more lines (on disk)`])
      : cpLines;
    console.log('');
    console.log(`--- LAST CHECKPOINT (${files[0]}) ---`);
    console.log(cpTrimmed.join('\n').trim());
    console.log('--- END CHECKPOINT ---');
  }
}
