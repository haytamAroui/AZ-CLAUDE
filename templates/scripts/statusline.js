#!/usr/bin/env node
// AZCLAUDE statusline — auto-installed by setup
// Shows: model | context bar | git branch | rate limit | cache | time | lines | cost
// Updates automatically after every turn — no manual action needed.
// Zero dependencies — uses only Node.js (already required by AZCLAUDE).
'use strict';

const { execSync } = require('child_process');

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { raw += chunk; });
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(raw); } catch (_) {
    process.stdout.write('[AZCLAUDE] statusline: invalid JSON input\n');
    process.exit(0);
  }

  // ── Extract metrics ──
  const model    = data.model?.display_name || 'Claude';
  const ctxPct   = Math.floor(data.context_window?.used_percentage || 0);
  const ctxSize  = data.context_window?.context_window_size || 0;
  const cost     = data.cost?.total_cost_usd || 0;
  const durMs    = data.cost?.total_duration_ms || 0;
  const linesAdd = data.cost?.total_lines_added || 0;
  const linesDel = data.cost?.total_lines_removed || 0;
  const rate5h   = data.rate_limits?.five_hour?.used_percentage ?? -1;

  // Token details
  const inputTok   = data.context_window?.total_input_tokens || 0;
  const outputTok  = data.context_window?.total_output_tokens || 0;
  const cachWrite  = data.context_window?.current_usage?.cache_creation_input_tokens || 0;
  const cachRead   = data.context_window?.current_usage?.cache_read_input_tokens || 0;

  // ── Format helpers ──
  const durSec = Math.floor(durMs / 1000);
  const mins   = Math.floor(durSec / 60);
  const secs   = durSec % 60;

  const ctxLabel = ctxSize >= 1000000 ? '1M' : ctxSize >= 100000 ? '200k' : String(ctxSize);

  // Format large token numbers: 1234567 → 1.2M, 12345 → 12k
  function fmtTok(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(0) + 'k';
    return String(n);
  }

  // ── Git info (cached — fast on subsequent calls) ──
  let gitBranch = '';
  let gitDirty  = 0;
  try {
    gitBranch = execSync('git branch --show-current 2>/dev/null', { encoding: 'utf8', timeout: 2000 }).trim();
    const status = execSync('git status --porcelain 2>/dev/null', { encoding: 'utf8', timeout: 2000 }).trim();
    gitDirty = status ? status.split('\n').length : 0;
  } catch (_) {}

  // ── Compaction prediction ──
  // Estimate turns remaining before context hits 90% (compaction threshold)
  // Uses average tokens per turn from session data
  let compactHint = '';
  if (ctxPct > 0 && ctxPct < 90 && inputTok > 0) {
    const totalTok  = Math.floor(ctxSize * ctxPct / 100);
    const remaining = Math.floor(ctxSize * 0.9) - totalTok;
    // Rough estimate: average ~4000 tokens per turn (input + output + overhead)
    const avgPerTurn = 4000;
    const turnsLeft  = Math.max(1, Math.floor(remaining / avgPerTurn));
    if (turnsLeft <= 20) {
      compactHint = turnsLeft <= 5 ? ` ~${turnsLeft}t!` : ` ~${turnsLeft}t`;
    }
  }

  // ── Cache hit ratio ──
  let cacheHint = '';
  if (cachRead > 0 || cachWrite > 0) {
    const total = cachRead + cachWrite;
    const hitPct = total > 0 ? Math.floor(cachRead / total * 100) : 0;
    cacheHint = `Cache:${hitPct}%`;
  }

  // ── ANSI colors ──
  const GREEN  = '\x1b[32m';
  const YELLOW = '\x1b[33m';
  const RED    = '\x1b[31m';
  const CYAN   = '\x1b[36m';
  const DIM    = '\x1b[2m';
  const BOLD   = '\x1b[1m';
  const RESET  = '\x1b[0m';

  // ── Context bar (10 segments) ──
  const filled = Math.floor(ctxPct * 10 / 100);
  const empty  = 10 - filled;
  const bar    = '\u2593'.repeat(filled) + '\u2591'.repeat(empty);

  // ── Color thresholds ──
  let ctxColor, ctxWarn = '';
  if (ctxPct >= 80)      { ctxColor = RED;    ctxWarn = ' COMPACT SOON'; }
  else if (ctxPct >= 60) { ctxColor = YELLOW; }
  else                   { ctxColor = GREEN;  }

  // ── Line 1: model + context bar + compaction prediction ──
  let line1 = `${DIM}[${RESET}${BOLD}${model}${RESET}${DIM}]${RESET} `;
  line1 += `${ctxColor}${bar} ${ctxPct}%${RESET}`;
  line1 += `${DIM}/${ctxLabel}${RESET}`;
  if (ctxWarn) line1 += `${RED}${ctxWarn}${RESET}`;
  if (compactHint) {
    const compColor = compactHint.includes('!') ? RED : YELLOW;
    line1 += `${compColor}${compactHint}${RESET}`;
  }
  // Git branch
  if (gitBranch) {
    line1 += ` ${DIM}|${RESET} ${CYAN}${gitBranch}${RESET}`;
    if (gitDirty > 0) line1 += `${YELLOW}*${gitDirty}${RESET}`;
  }

  // ── Line 2: rate limit + cache + tokens + time + lines + cost ──
  let line2 = '';

  // Rate limit (only show if available — Pro/Max subscription)
  if (rate5h >= 0) {
    const r = Math.floor(rate5h);
    const rColor = r >= 80 ? RED : r >= 50 ? YELLOW : DIM;
    line2 += `${rColor}Rate:${r}%${RESET} `;
  }

  // Cache hit ratio
  if (cacheHint) {
    line2 += `${DIM}${cacheHint}${RESET} `;
  }

  // Token totals
  if (inputTok > 0 || outputTok > 0) {
    line2 += `${DIM}In:${fmtTok(inputTok)} Out:${fmtTok(outputTok)}${RESET} `;
  }

  // Duration
  line2 += `${DIM}${mins}m${secs}s${RESET}`;

  // Lines changed
  if (linesAdd > 0 || linesDel > 0) {
    line2 += ` ${GREEN}+${linesAdd}${RESET}${DIM}/${RESET}${RED}-${linesDel}${RESET}`;
  }

  // Cost (only show if > 0 — API billing)
  if (cost > 0) {
    line2 += ` ${DIM}$${cost.toFixed(2)}${RESET}`;
  }

  // ── Output ──
  process.stdout.write(line1 + '\n');
  process.stdout.write(line2 + '\n');
});
