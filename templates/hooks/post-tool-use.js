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

// ── Hook profile gate ───────────────────────────────────────────────────────
// AZCLAUDE_HOOK_PROFILE=minimal|standard|strict (default: standard)
// minimal = goals.md tracking only (no observations, no cost tracking)
// standard = all features (default)
// strict = all features + extra validation
const HOOK_PROFILE = process.env.AZCLAUDE_HOOK_PROFILE || 'standard';

// Read tool input + response from stdin — Claude Code sends JSON and closes stdin
let filePath = '';
let changeSummary = '';
let toolName = '';
try {
  const raw  = fs.readFileSync(0, 'utf8'); // fd 0 = stdin, cross-platform
  const data = JSON.parse(raw);
  toolName   = data.tool_name || '';
  filePath   = data.tool_input?.file_path || data.tool_input?.path || data.tool_input?.command || '';
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

const cfg       = process.env.AZCLAUDE_CFG || '.claude';
// Guard: cfg must resolve inside the project root
if (path.resolve(cfg).indexOf(process.cwd()) !== 0) process.exit(0);
const goalsPath = path.join(cfg, 'memory', 'goals.md');
if (!fs.existsSync(goalsPath)) process.exit(0); // not an AZCLAUDE project

// For non-file tools (Bash, Grep without file_path), still capture observations but skip goals tracking
const isFileTool = toolName === 'Write' || toolName === 'Edit' || (!toolName && filePath);
const rel = filePath ? path.relative(process.cwd(), path.resolve(filePath)) : toolName || 'unknown';

if (isFileTool) {
  if (!filePath) process.exit(0);
  if (rel.startsWith('..'))                           process.exit(0); // outside project
  if (/goals\.md$/.test(rel))                         process.exit(0); // prevent loop
  if (/node_modules[\\/]|\.git[\\/]/.test(rel))       process.exit(0); // noise
}

// Timestamp HH:MM
const now = new Date();
const ts  = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

// ── Goals.md tracking (Write/Edit only — file modifications) ────────────────
if (isFileTool) {

// Git diff stat: "+N/-M" — cached for 5s to avoid repeated git calls on consecutive edits
let diffStat = '';
const diffCachePath = path.join(os.tmpdir(), `.azclaude-diff-${process.ppid || process.pid}`);
let diffCache = {};
try { diffCache = JSON.parse(fs.readFileSync(diffCachePath, 'utf8')); } catch (_) {}
const cacheAge = Date.now() - (diffCache._ts || 0);
const cached   = diffCache[rel];
if (cached && cacheAge < 5000) {
  diffStat = cached;
} else {
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
  // Update cache
  if (cacheAge >= 5000) diffCache = {};
  diffCache[rel] = diffStat;
  diffCache._ts  = Date.now();
  try { fs.writeFileSync(diffCachePath, JSON.stringify(diffCache)); } catch (_) {}
}

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

// ── Memory rotation — keep ## In progress bounded at 30 entries ──────────────
const ROTATE_THRESHOLD = 30;
const KEEP_NEWEST      = 15;
const rotLines   = content.split('\n');
const rotHIdx    = rotLines.findIndex(l => l.trim() === HEADING);
if (rotHIdx !== -1) {
  const ipEntries = [];
  for (let i = rotHIdx + 1; i < rotLines.length; i++) {
    if (rotLines[i].startsWith('## ')) break;
    if (rotLines[i].startsWith('- ')) ipEntries.push({ line: rotLines[i], idx: i });
  }
  if (ipEntries.length >= ROTATE_THRESHOLD) {
    const toArchive   = ipEntries.slice(KEEP_NEWEST);
    const archiveTs   = new Date().toISOString().slice(0, 16);
    const archiveDate = new Date().toISOString().slice(0, 10);
    const archivePath = path.join(cfg, 'memory', 'sessions', `${archiveDate}-edits.md`);
    try { fs.mkdirSync(path.join(cfg, 'memory', 'sessions'), { recursive: true }); } catch (_) {}
    const header  = `\n<!-- archived: ${archiveTs} source: post-tool-use -->\n`;
    const payload = toArchive.map(e => e.line).join('\n') + '\n';
    try { fs.appendFileSync(archivePath, header + payload); } catch (_) {}
    // Rewrite goals.md keeping only newest 15 entries
    const archivedSet = new Set(toArchive.map(e => e.idx));
    const pruned = rotLines.filter((_, i) => !archivedSet.has(i));
    try { fs.writeFileSync(goalsPath, pruned.join('\n')); } catch (_) {}
  }
}

} // end isFileTool goals tracking

// ── Reflex observation capture (standard/strict only) ───────────────────────
// Append tool-use observation to observations.jsonl for pattern detection.
// Tracks actual tool name + tool sequences (last 3 tools) for pattern detection.
if (HOOK_PROFILE !== 'minimal') {
  const reflexDir = path.join(cfg, 'memory', 'reflexes');
  try {
    fs.mkdirSync(reflexDir, { recursive: true });
    const obsPath = path.join(reflexDir, 'observations.jsonl');
    const obsTs   = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const tool    = toolName || 'Edit';
    // Scrub secrets: strip API keys, tokens, passwords from file paths
    const safeRel = rel.replace(/\.(env|key|pem|secret|credential)/gi, '.[REDACTED]');

    // Track tool sequence: last 3 tools for pattern detection (Read→Edit→Bash)
    const seqPath = path.join(os.tmpdir(), `.azclaude-seq-${process.ppid || process.pid}`);
    let seq = [];
    try { seq = JSON.parse(fs.readFileSync(seqPath, 'utf8')); } catch (_) {}
    seq.push(tool);
    if (seq.length > 3) seq = seq.slice(-3);
    try { fs.writeFileSync(seqPath, JSON.stringify(seq)); } catch (_) {}

    const obs = JSON.stringify({
      ts: obsTs, tool, file: safeRel, session: process.ppid || process.pid,
      event: 'complete', seq: seq.join('→')
    });
    fs.appendFileSync(obsPath, obs + '\n');
    // Auto-truncate: keep last 2000 lines max (prevent unbounded growth)
    try {
      const obsContent = fs.readFileSync(obsPath, 'utf8');
      const obsLines   = obsContent.split('\n').filter(Boolean);
      if (obsLines.length > 2000) {
        fs.writeFileSync(obsPath, obsLines.slice(-500).join('\n') + '\n');
      }
    } catch (_) {}
  } catch (_) {}
}

// ── Cost tracking (standard/strict only) ────────────────────────────────────
// Append estimated cost per tool call to costs.jsonl for budget awareness.
if (HOOK_PROFILE !== 'minimal') {
  try {
    const costsDir = path.join(cfg, 'memory', 'metrics');
    fs.mkdirSync(costsDir, { recursive: true });
    const costsPath = path.join(costsDir, 'costs.jsonl');
    const costEntry = JSON.stringify({
      ts: now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
      tool: toolName || 'Edit',
      file: rel,
      session: process.ppid || process.pid
    });
    fs.appendFileSync(costsPath, costEntry + '\n');
    // Auto-truncate: keep last 1000 entries
    try {
      const costLines = fs.readFileSync(costsPath, 'utf8').split('\n').filter(Boolean);
      if (costLines.length > 1000) {
        fs.writeFileSync(costsPath, costLines.slice(-500).join('\n') + '\n');
      }
    } catch (_) {}
  } catch (_) {}
}

// ── Checkpoint reminder every 15 edits ──────────────────────────────────────
const counterPath = path.join(os.tmpdir(), `.azclaude-edit-count-${process.ppid || process.pid}`);
let editCount = 1;
try { editCount = parseInt(fs.readFileSync(counterPath, 'utf8'), 10) + 1; } catch (_) {}
try { fs.writeFileSync(counterPath, String(editCount)); } catch (_) {}
if (editCount > 0 && editCount % 15 === 0) {
  process.stdout.write(`\n⚠ ${editCount} edits this session — run /snapshot before context compaction loses your reasoning\n`);
}
