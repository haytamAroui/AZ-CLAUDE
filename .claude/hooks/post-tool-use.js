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
let toolOutput = '';
let _rawInput  = null;
let _agentId   = null;
let _agentType = null;
let _toolUseId = null;
try {
  const raw  = fs.readFileSync(0, 'utf8'); // fd 0 = stdin, cross-platform
  const data = JSON.parse(raw);
  toolName   = data.tool_name || '';
  filePath   = data.tool_input?.file_path || data.tool_input?.path || data.tool_input?.command || '';
  _rawInput  = data.tool_input || null;
  _agentId   = data.agent_id || null;
  _agentType = data.agent_type || null;
  _toolUseId = data.tool_use_id || null;
  // Extract change summary from old_string/new_string diff hint (Edit tool)
  // MultiEdit: edits[] array — use first edit's new_string
  const oldStr = data.tool_input?.old_string || data.tool_input?.edits?.[0]?.old_string || '';
  const newStr = data.tool_input?.new_string || data.tool_input?.edits?.[0]?.new_string || '';
  // Capture tool result output for Bash secret scanning
  toolOutput = data.tool_result?.output || data.tool_result?.stdout || '';
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

// ── Forward full hook event to visualizer (so dashboard shows tool results) ──
if (process.env.AZCLAUDE_VISUALIZER && toolName) {
  try {
    const vPort = parseInt(process.env.AZCLAUDE_VISUALIZER, 10) || 8765;
    let vizId = _toolUseId || null;
    if (!vizId) {
      const vizIdPath = path.join(os.tmpdir(), `.azclaude-vizid-${process.ppid || process.pid}`);
      try { vizId = fs.readFileSync(vizIdPath, 'utf8').trim(); } catch (_) {}
    }
    const fwd = JSON.stringify({
      hook_event_name: 'PostToolUse',
      tool_name: toolName,
      tool_input: _rawInput,
      tool_response: toolOutput ? toolOutput.slice(0, 2000) : null,
      tool_use_id: vizId,
      session_id: String(process.ppid || process.pid),
      agent_id: _agentId,
      agent_type: _agentType,
    });
    const vReq = require('http').request(
      { hostname: '127.0.0.1', port: vPort, path: '/event', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(fwd) } },
      () => {}
    );
    vReq.setTimeout(1500, () => vReq.destroy());
    vReq.on('error', () => {});
    vReq.end(fwd);
  } catch (_) {}
}

const cfg       = process.env.AZCLAUDE_CFG || '.claude';
// Guard: cfg must resolve inside the project root
if (path.resolve(cfg).indexOf(process.cwd()) !== 0) process.exit(0);
const goalsPath = path.join(cfg, 'memory', 'goals.md');
if (!fs.existsSync(goalsPath)) process.exit(0); // not an AZCLAUDE project

// For non-file tools (Bash, Grep without file_path), still capture observations but skip goals tracking
const isFileTool = toolName === 'Write' || toolName === 'Edit' || toolName === 'MultiEdit' || (!toolName && filePath);
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
  const obsTs = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const tool = toolName || 'Edit';
  const safeRel = rel.replace(/\.(env|key|pem|secret|credential)/gi, '.[REDACTED]');

  // ── Reflex observation capture ──
  try {
    fs.mkdirSync(reflexDir, { recursive: true });
    const obsPath = path.join(reflexDir, 'observations.jsonl');

    // Track tool sequence: last 3 tools for pattern detection (Read→Edit→Bash)
    const seqPath = path.join(os.tmpdir(), `.azclaude-seq-${process.ppid || process.pid}`);
    let seq = [];
    try { seq = JSON.parse(fs.readFileSync(seqPath, 'utf8')); } catch (_) {}
    seq.push(tool);
    if (seq.length > 3) seq = seq.slice(-3);
    try { fs.writeFileSync(seqPath, JSON.stringify(seq)); } catch (_) {}

    const seqStr = seq.join('→');
    const obs = JSON.stringify({
      ts: obsTs, tool, file: safeRel, session: process.ppid || process.pid,
      event: 'complete', seq: seqStr
    });
    fs.appendFileSync(obsPath, obs + '\n');

    // ── Visualizer event (opt-in) ──
    if (process.env.AZCLAUDE_VISUALIZER) {
      try {
        const vPort = parseInt(process.env.AZCLAUDE_VISUALIZER, 10) || 8765;
        const payload = JSON.stringify({ type: 'tool-complete', tool: tool, file: safeRel, diffStat: diffStat || '', seq: seqStr });
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

    // Auto-truncate: stat-based size check (avoids reading entire file every call)
    try {
      const obsStat = fs.statSync(obsPath);
      if (obsStat.size > 200000) { // ~200KB ≈ ~2000 lines
        const obsContent = fs.readFileSync(obsPath, 'utf8');
        const obsLines   = obsContent.split('\n').filter(Boolean);
        fs.writeFileSync(obsPath, obsLines.slice(-500).join('\n') + '\n');
      }
    } catch (_) {}
  } catch (_) {}

  // ── Behavioral security: sequence detection ──
  try {
    const secSeqPath = path.join(os.tmpdir(), `.azclaude-secseq-${process.ppid || process.pid}`);
    let secSeq = [];
    try { secSeq = JSON.parse(fs.readFileSync(secSeqPath, 'utf8')); } catch (_) {}
    secSeq.push({ tool, file: rel });
    if (secSeq.length > 5) secSeq = secSeq.slice(-5);
    try { fs.writeFileSync(secSeqPath, JSON.stringify(secSeq)); } catch (_) {}

    if (secSeq.length >= 2) {
      const prev = secSeq[secSeq.length - 2];
      const curr = secSeq[secSeq.length - 1];
      const CRED = /\.env$|secrets?\.(json|ya?ml)$|credentials?(\.json)?$|id_rsa$|\.pem$/i;
      // Pattern: Read credential file → Bash or WebFetch
      if (prev.tool === 'Read' && CRED.test(prev.file || '')
          && (curr.tool === 'Bash' || curr.tool === 'WebFetch')) {
        const seclogPath = path.join(os.tmpdir(), `.azclaude-seclog-${process.ppid || process.pid}`);
        const entry = JSON.stringify({
          ts: obsTs, hook: 'post-tool-use',
          rule: 'credential-read-then-exec', level: 'warn',
          target: `${path.basename(prev.file || '')} → ${curr.tool}`
        });
        try { fs.appendFileSync(seclogPath, entry + '\n'); } catch (_) {}
        process.stderr.write(
          `\n⚠ SECURITY: Credential file (${path.basename(prev.file || '')}) read then ${curr.tool} — verify no secrets are being transmitted.\n`
        );
      }
    }

    // ── Reward hack behavioral patterns (Anthropic "Emergent Misalignment" paper) ──

    // Pattern: Bash(test run) → Edit/Write(test file) = possible reward hacking
    if (secSeq.length >= 2) {
      const prev2 = secSeq[secSeq.length - 2];
      const curr2 = secSeq[secSeq.length - 1];
      if (prev2.tool === 'Bash' && /\b(pytest|jest|mocha|vitest|npm\s+test|npx\s+test)\b/i.test(prev2.file || '')
          && (curr2.tool === 'Edit' || curr2.tool === 'Write' || curr2.tool === 'MultiEdit')
          && /test[_/\\]|_test\.|\.test\.|\.spec\.|conftest/i.test(curr2.file || '')) {
        const seclogPath = path.join(os.tmpdir(), `.azclaude-seclog-${process.ppid || process.pid}`);
        const entry2 = JSON.stringify({
          ts: obsTs, hook: 'post-tool-use',
          rule: 'test-then-test-modify', level: 'warn',
          target: `${prev2.tool}(test) → ${curr2.tool}(${path.basename(curr2.file || '')})`
        });
        try { fs.appendFileSync(seclogPath, entry2 + '\n'); } catch (_) {}
        process.stderr.write(
          `\n⚠ SECURITY: Test run then test file modification — verify edits fix the code, not fake the result.\n`
        );
      }
    }

    // Pattern: Any Edit/Write to .claude/hooks/ = always warn (hook self-modification)
    {
      const currH = secSeq[secSeq.length - 1];
      if (currH && (currH.tool === 'Edit' || currH.tool === 'Write' || currH.tool === 'MultiEdit')
          && /\.claude[/\\]hooks[/\\]/i.test(currH.file || '')) {
        const seclogPath = path.join(os.tmpdir(), `.azclaude-seclog-${process.ppid || process.pid}`);
        const entryH = JSON.stringify({
          ts: obsTs, hook: 'post-tool-use',
          rule: 'hook-self-modification', level: 'warn',
          target: path.basename(currH.file || '')
        });
        try { fs.appendFileSync(seclogPath, entryH + '\n'); } catch (_) {}
        process.stderr.write(
          `\n⚠ SECURITY: Hook file modified (${path.basename(currH.file || '')}) — hooks control all tool execution. Verify this change is intentional.\n`
        );
      }
    }
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
    // Auto-truncate: stat-based size check
    try {
      const costStat = fs.statSync(costsPath);
      if (costStat.size > 100000) { // ~100KB ≈ ~1000 entries
        const costLines = fs.readFileSync(costsPath, 'utf8').split('\n').filter(Boolean);
        fs.writeFileSync(costsPath, costLines.slice(-500).join('\n') + '\n');
      }
    } catch (_) {}
  } catch (_) {}
}

// ── Bash output secret scanning (standard/strict only) ──────────────────────
if (HOOK_PROFILE !== 'minimal' && toolName === 'Bash' && toolOutput) {
  const SECRET_RE = /AKIA[A-Z0-9]{16}|sk-[a-zA-Z0-9]{20,}|ghp_[A-Za-z0-9]{36}|glpat-[A-Za-z0-9_-]{20}|xoxb-[0-9]|xoxp-[0-9]|-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY/;
  if (SECRET_RE.test(toolOutput)) {
    const seclogPath = path.join(os.tmpdir(), `.azclaude-seclog-${process.ppid || process.pid}`);
    const entry = JSON.stringify({
      ts: now.toISOString(), hook: 'post-tool-use',
      rule: 'bash-output-secret-leak', level: 'warn',
      target: (filePath || '').slice(0, 80)
    });
    try { fs.appendFileSync(seclogPath, entry + '\n'); } catch (_) {}
    process.stderr.write(
      `\n⚠ SECURITY: Bash output contains a secret pattern — verify no credentials were leaked to logs or context.\n`
    );
  }
}

// ── Checkpoint reminder every 15 edits ──────────────────────────────────────
const counterPath = path.join(os.tmpdir(), `.azclaude-edit-count-${process.ppid || process.pid}`);
let editCount = 1;
try { editCount = parseInt(fs.readFileSync(counterPath, 'utf8'), 10) + 1; } catch (_) {}
try { fs.writeFileSync(counterPath, String(editCount)); } catch (_) {}
if (editCount > 0 && editCount % 15 === 0) {
  process.stderr.write(`\n⚠ ${editCount} edits this session — run /snapshot before context compaction loses your reasoning\n`);
}

// ── Rapid-edit detection — same file edited 5+ times in <5 min ───────────────
// Signal: unclear spec before coding. Warn once, suggest /blueprint.
if (isFileTool && rel) {
  const rapidPath = path.join(os.tmpdir(), `.azclaude-rapid-${process.ppid || process.pid}`);
  let rapidLog = {};
  try { rapidLog = JSON.parse(fs.readFileSync(rapidPath, 'utf8')); } catch (_) {}
  const fileLog = rapidLog[rel] || { count: 0, firstTs: Date.now(), warned: false };
  const elapsed = Date.now() - fileLog.firstTs;
  if (elapsed > 5 * 60 * 1000) {
    // Reset window
    rapidLog[rel] = { count: 1, firstTs: Date.now(), warned: false };
  } else {
    fileLog.count += 1;
    if (fileLog.count >= 5 && !fileLog.warned) {
      fileLog.warned = true;
      const shortName = path.basename(rel);
      process.stdout.write(`\n⚠ ${fileLog.count} edits to ${shortName} in ${Math.round(elapsed/60000)}min — unclear spec? Consider /blueprint before continuing\n`);
    }
    rapidLog[rel] = fileLog;
  }
  try { fs.writeFileSync(rapidPath, JSON.stringify(rapidLog)); } catch (_) {}
}
