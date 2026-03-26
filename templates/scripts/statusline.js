#!/usr/bin/env node
// AZCLAUDE statusline — auto-installed by setup
// Shows: model | context % (color-coded) | rate limit | session time | lines changed
// Updates automatically after every turn — no manual action needed.
// Zero dependencies — uses only Node.js (already required by AZCLAUDE).
'use strict';

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

  // ── Format helpers ──
  const durSec = Math.floor(durMs / 1000);
  const mins   = Math.floor(durSec / 60);
  const secs   = durSec % 60;

  const ctxLabel = ctxSize >= 1000000 ? '1M' : ctxSize >= 100000 ? '200k' : String(ctxSize);

  // ── ANSI colors ──
  const GREEN  = '\x1b[32m';
  const YELLOW = '\x1b[33m';
  const RED    = '\x1b[31m';
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

  // ── Line 1: model + context bar ──
  let line1 = `${DIM}[${RESET}${BOLD}${model}${RESET}${DIM}]${RESET} `;
  line1 += `${ctxColor}${bar} ${ctxPct}%${RESET}`;
  line1 += `${DIM}/${ctxLabel}${RESET}`;
  if (ctxWarn) line1 += `${RED}${ctxWarn}${RESET}`;

  // ── Line 2: rate limit + time + lines + cost ──
  let line2 = '';

  // Rate limit (only show if available — Pro/Max subscription)
  if (rate5h >= 0) {
    const r = Math.floor(rate5h);
    const rColor = r >= 80 ? RED : r >= 50 ? YELLOW : DIM;
    line2 += `${rColor}Rate: ${r}%${RESET} ${DIM}|${RESET} `;
  }

  // Duration
  line2 += `${DIM}${mins}m${secs}s${RESET}`;

  // Lines changed
  if (linesAdd > 0 || linesDel > 0) {
    line2 += ` ${DIM}|${RESET} ${GREEN}+${linesAdd}${RESET}${DIM}/${RESET}${RED}-${linesDel}${RESET}`;
  }

  // Cost (only show if > 0 — API billing)
  if (cost > 0) {
    line2 += ` ${DIM}|${RESET} $${cost.toFixed(2)}`;
  }

  // ── Output ──
  process.stdout.write(line1 + '\n');
  process.stdout.write(line2 + '\n');
});
