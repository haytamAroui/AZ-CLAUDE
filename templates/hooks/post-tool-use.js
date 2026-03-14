#!/usr/bin/env node
'use strict';
/**
 * AZCLAUDE — PostToolUse hook
 * Auto-saves work progress to goals.md after every Write/Edit.
 * Survives Claude Code context compaction — goals.md is the external memory.
 * No user action required. Silent. Works on Windows/macOS/Linux.
 */
const fs   = require('fs');
const path = require('path');

// Read tool input from stdin — Claude Code sends JSON and closes stdin
let filePath = '';
try {
  const raw  = fs.readFileSync(0, 'utf8'); // fd 0 = stdin, cross-platform
  const data = JSON.parse(raw);
  filePath   = data.tool_input?.file_path || data.tool_input?.path || '';
} catch (_) {}

// Also accept env var fallback (older Claude Code versions)
if (!filePath) filePath = process.env.CLAUDE_FILE_PATH || '';
if (!filePath) process.exit(0);

// Guard: skip memory files (prevent write loop), skip non-project paths
const rel = path.relative(process.cwd(), path.resolve(filePath));
if (rel.startsWith('..'))                           process.exit(0); // outside project
if (/goals\.md$/.test(rel))                         process.exit(0); // prevent loop
if (/node_modules[\\/]|\.git[\\/]/.test(rel))       process.exit(0); // noise

const cfg       = process.env.AZCLAUDE_CFG || '.claude';
const goalsPath = path.join(cfg, 'memory', 'goals.md');
if (!fs.existsSync(goalsPath)) process.exit(0); // not an AZCLAUDE project

// Timestamp HH:MM
const now = new Date();
const ts  = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
const entry = `- ${ts} — ${rel}`;

let content = fs.readFileSync(goalsPath, 'utf8');

const HEADING = '## In progress';

if (!content.includes(HEADING)) {
  // Add section at end
  content = content.trimEnd() + `\n\n${HEADING}\n${entry}\n`;
} else {
  const lines  = content.split('\n');
  const hIdx   = lines.findIndex(l => l.trim() === HEADING);

  // Remove any existing entry for the same file (dedup — keep latest timestamp)
  const cleaned = lines.filter((l, i) => {
    if (i <= hIdx) return true;               // keep heading and everything before
    if (!l.startsWith('- ')) return true;     // keep non-entry lines
    return !l.includes(rel);                  // remove old entry for this file
  });

  // Insert new entry right after heading
  cleaned.splice(hIdx + 1, 0, entry);
  content = cleaned.join('\n');
}

try { fs.writeFileSync(goalsPath, content); } catch (_) {}
