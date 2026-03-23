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

// ── Hook profile gate ───────────────────────────────────────────────────────
// AZCLAUDE_HOOK_PROFILE=minimal|standard|strict (default: standard)
const HOOK_PROFILE = process.env.AZCLAUDE_HOOK_PROFILE || 'standard';

// ── Prompt injection scan — runs on EVERY prompt (before session gate) ────────
// Scans the user's actual message for injection attempts.
// Logs to shared session security log so stop.js can summarize.
try {
  const raw  = fs.readFileSync(0, 'utf8');
  const data = JSON.parse(raw);
  const promptText = data.prompt || '';
  if (promptText) {
    const PROMPT_INJECT = /ignore\s+(?:all\s+)?previous\s+instructions|disregard\s+(?:all\s+)?previous\s+instructions|override\s+(?:your\s+)?(?:rules|instructions|safety)|you\s+are\s+now\s+(?:a\s+)?(?:new|different|unrestricted)/i;
    if (PROMPT_INJECT.test(promptText)) {
      const sid      = process.ppid || process.pid;
      const seclog   = path.join(os.tmpdir(), `.azclaude-seclog-${sid}`);
      const entry    = JSON.stringify({ ts: new Date().toISOString(), hook: 'user-prompt', rule: 'prompt-injection-attempt', level: 'warn', target: promptText.slice(0, 80) });
      try { fs.appendFileSync(seclog, entry + '\n'); } catch (_) {}
      process.stderr.write('\n⚠ SECURITY: Prompt injection pattern detected in user input.\n');
    }
  }
} catch (_) {}

// ── Fire once per session only — keyed by parent PID
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

// ── Plan status (standard + strict, copilot mode only) ────────────────────────
// Only fires when .claude/copilot-intent.md exists — copilot mode signal
if (HOOK_PROFILE !== 'minimal') {
  const intentPath = path.join('.claude', 'copilot-intent.md');
  if (fs.existsSync(intentPath)) {
    const planPath = path.join('.claude', 'plan.md');
    if (fs.existsSync(planPath)) {
      try {
        const planContent  = fs.readFileSync(planPath, 'utf8');
        const doneCount    = (planContent.match(/Status:\s*done/gi) || []).length;
        const blockedCount = (planContent.match(/Status:\s*blocked/gi) || []).length;
        const ipCount      = (planContent.match(/Status:\s*in-progress/gi) || []).length;
        const pendingCount = (planContent.match(/Status:\s*pending/gi) || []).length;
        const total = doneCount + blockedCount + ipCount + pendingCount;
        if (total > 0) {
          console.log('');
          console.log(`--- PLAN STATUS: ${doneCount}/${total} done, ${ipCount} in-progress, ${blockedCount} blocked ---`);
        }
      } catch (_) {}
    }
  }
}

// ── Reflex guidance (strict profile only — confidence >= 0.8) ─────────────────
if (HOOK_PROFILE === 'strict') {
  const reflexDir = path.join('.claude', 'memory', 'reflexes');
  if (fs.existsSync(reflexDir)) {
    try {
      const reflexFiles   = fs.readdirSync(reflexDir).filter(f => f.endsWith('.md'));
      const strongReflexes = [];
      for (const rf of reflexFiles) {
        const rfContent  = fs.readFileSync(path.join(reflexDir, rf), 'utf8');
        const confMatch  = rfContent.match(/confidence:\s*([\d.]+)/);
        if (confMatch && parseFloat(confMatch[1]) >= 0.8) {
          const actionMatch = rfContent.match(/action:\s*"?(.+?)"?\s*$/m);
          if (actionMatch) strongReflexes.push(`• ${actionMatch[1].trim()}`);
        }
      }
      if (strongReflexes.length > 0) {
        console.log('');
        console.log('--- LEARNED REFLEXES (confidence >= 0.8) ---');
        console.log(strongReflexes.slice(0, 5).join('\n'));
        console.log('--- END REFLEXES ---');
      }
    } catch (_) {}
  }
}
