#!/usr/bin/env node
'use strict';
/**
 * AZCLAUDE — PostToolUse hook
 * Tracks edits to goals.md after every Write/Edit.
 * Captures: timestamp, file path, git diff stat (+N/-N), and change summary.
 * Survives Claude Code context compaction — goals.md is the external memory.
 * No user action required. Silent. Works on Windows/macOS/Linux.
 */
const fs            = require('fs');
const path          = require('path');
const os            = require('os');
const { spawnSync } = require('child_process');

// Read tool input + response from stdin — Claude Code sends JSON and closes stdin
let filePath = '';
let changeSummary = '';
try {
  const raw  = fs.readFileSync(0, 'utf8'); // fd 0 = stdin, cross-platform
  const data = JSON.parse(raw);
  filePath   = data.tool_input?.file_path || data.tool_input?.path || '';
  // Extract change summary from old_string/new_string diff hint (Edit tool)
  const oldStr = data.tool_input?.old_string || '';
  const newStr = data.tool_input?.new_string || '';
  if (oldStr && newStr) {
    // Summarize: first non-empty line of new content (what was added)
    const firstNew = newStr.split('\n').find(l => l.trim().length > 0) || '';
    if (firstNew.length > 0 && firstNew.length < 80) {
      changeSummary = ' — ' + firstNew.trim().replace(/^[-*#`]+\s*/, '').slice(0, 60);
    }
  }
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

// Git diff stat: "+N/-M" — tells WHAT changed in size
let diffStat = '';
try {
  const r = spawnSync('git', ['diff', 'HEAD', '--numstat', '--', rel],
    { encoding: 'utf8', cwd: process.cwd(), timeout: 3000 });
  if (r.status === 0 && r.stdout.trim()) {
    const [added, deleted] = r.stdout.trim().split('\t');
    const a = parseInt(added, 10);
    const d = parseInt(deleted, 10);
    if (!isNaN(a) && !isNaN(d) && (a > 0 || d > 0)) {
      diffStat = ` (+${a}/-${d})`;
    }
  }
} catch (_) {}

const entry = `- ${ts} — ${rel}${diffStat}${changeSummary}`;

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

// ── Checkpoint reminder every 15 edits ──────────────────────────────────────
const counterPath = path.join(os.tmpdir(), `.azclaude-edit-count-${process.ppid || process.pid}`);
let editCount = 1;
try { editCount = parseInt(fs.readFileSync(counterPath, 'utf8'), 10) + 1; } catch (_) {}
try { fs.writeFileSync(counterPath, String(editCount)); } catch (_) {}
if (editCount > 0 && editCount % 15 === 0) {
  process.stdout.write(`\n💡 ${editCount} edits this session — consider running /checkpoint to save your reasoning\n`);
}
