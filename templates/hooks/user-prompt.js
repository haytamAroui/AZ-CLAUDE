#!/usr/bin/env node
'use strict';
/**
 * AZCLAUDE — UserPromptSubmit hook
 * Runs on every session's first prompt.
 * Injects goals.md into context so Claude always knows the current thread.
 * Works on: Windows (PowerShell/CMD/Git Bash), macOS, Linux.
 */
const fs   = require('fs');
const path = require('path');
const os   = require('os');

// Ensure required directories exist (safe on all platforms)
for (const d of ['.claude/memory', 'ops/observations', 'shared-skills']) {
  try { fs.mkdirSync(d, { recursive: true }); } catch (_) {}
}

// Fire once per session only — keyed by parent PID
const marker = path.join(os.tmpdir(), `.azclaude-session-${process.ppid || process.pid}`);
if (fs.existsSync(marker)) process.exit(0);
try { fs.writeFileSync(marker, ''); } catch (_) {}

// Inject goals.md if it exists
const goalsPath = path.join('.claude', 'memory', 'goals.md');
if (!fs.existsSync(goalsPath)) process.exit(0);

// Strip prompt-injection attempts before outputting into context
const INJECTION = /ignore.{0,20}previous.{0,20}instructions|curl.{0,10}\|.{0,10}bash|wget.{0,10}\|.{0,10}sh|you are now|system prompt/i;
const content  = fs.readFileSync(goalsPath, 'utf8');
const filtered = content.split('\n').filter(l => !INJECTION.test(l)).join('\n');

console.log('--- ACTIVE GOALS ---');
console.log(filtered);
console.log('--- END GOALS ---');
