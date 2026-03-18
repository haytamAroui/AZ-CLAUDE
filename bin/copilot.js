#!/usr/bin/env node
'use strict';
/**
 * AZCLAUDE Copilot — Autonomous Runner
 *
 * The outer loop. Stateless. Dumb on purpose.
 * Restarts Claude Code sessions until COPILOT_COMPLETE or max sessions reached.
 * All intelligence lives inside AZCLAUDE (the inner brain).
 *
 * Usage:
 *   npx azclaude-copilot <project-dir> <intent> [max-sessions]
 *   npx azclaude-copilot .                              # resume (reads existing plan.md)
 *   npx azclaude-copilot . "Build a todo app" 20        # new project, 20 session limit
 *   npx azclaude-copilot . intent.md                    # intent from file
 */

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// ── Args ─────────────────────────────────────────────────────────────────────

const args       = process.argv.slice(2);
const projectDir = path.resolve(args[0] || '.');
const intentArg  = args[1] || '';
const maxSessions = parseInt(args[2] || '20', 10);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  AZCLAUDE Copilot — Autonomous Product Builder

  Usage:
    npx azclaude-copilot <project-dir> <intent> [max-sessions]

  Examples:
    npx azclaude-copilot . "Build a REST API with auth"
    npx azclaude-copilot . intent.md 30
    npx azclaude-copilot .                    # resume existing project

  Options:
    --help, -h    Show this help
    max-sessions  Maximum sessions before stopping (default: 20)
  `);
  process.exit(0);
}

// ── Validate ─────────────────────────────────────────────────────────────────

if (!fs.existsSync(projectDir)) {
  console.error(`  Error: project directory "${projectDir}" does not exist.`);
  process.exit(1);
}

// Check Claude Code is available
try {
  spawnSync('claude', ['--version'], { stdio: 'ignore', timeout: 3000 });
} catch (_) {
  console.error('  Error: "claude" CLI not found in PATH. Install Claude Code first.');
  process.exit(1);
}

// ── Intent ───────────────────────────────────────────────────────────────────

const claudeDir  = path.join(projectDir, '.claude');
const intentPath = path.join(claudeDir, 'copilot-intent.md');
const planPath   = path.join(claudeDir, 'plan.md');
const goalsPath  = path.join(claudeDir, 'memory', 'goals.md');

fs.mkdirSync(path.join(claudeDir, 'memory', 'checkpoints'), { recursive: true });

if (intentArg) {
  // Intent provided — save it
  let intent = intentArg;
  if (fs.existsSync(intentArg)) {
    // It's a file path
    intent = fs.readFileSync(intentArg, 'utf8');
  }
  fs.writeFileSync(intentPath, intent);
} else if (!fs.existsSync(intentPath) && !fs.existsSync(planPath)) {
  console.error('  Error: no intent provided and no existing plan.md found.');
  console.error('  Usage: npx azclaude-copilot . "describe your product"');
  process.exit(1);
}

// ── Banner ───────────────────────────────────────────────────────────────────

const intent = fs.existsSync(intentPath) ? fs.readFileSync(intentPath, 'utf8').trim() : '(resuming)';
const resuming = fs.existsSync(planPath);

// ── Security: verify project directory is safe ──────────────────────────────
const resolvedProject = path.resolve(projectDir);
const homeDir = require('os').homedir();
if (resolvedProject === homeDir || resolvedProject === '/' || resolvedProject === 'C:\\') {
  console.error('  Error: refusing to run copilot on home directory or root. Use a project subdirectory.');
  process.exit(1);
}

console.log('\n════════════════════════════════════════════════');
console.log('  AZCLAUDE COPILOT — Autonomous Mode');
console.log(`  Project:      ${projectDir}`);
console.log(`  Max sessions: ${maxSessions}`);
console.log(`  Mode:         ${resuming ? 'RESUME (plan.md exists)' : 'NEW (will run /blueprint)'}`);
console.log('');
console.log('  ┌─── Token Usage Alert ─────────────────────┐');
console.log('  │                                            │');
console.log(`  │  Copilot runs ~${maxSessions} autonomous sessions.       │`);
console.log('  │  Each session uses ~100K-300K tokens.      │');
console.log('  │                                            │');
console.log('  │  Ensure your LLM provider has sufficient   │');
console.log('  │  token quota before starting.              │');
console.log('  │                                            │');
console.log('  │  Reduce sessions with: copilot . intent 5  │');
console.log('  └────────────────────────────────────────────┘');
console.log('');
console.log('  ⚠  Uses --dangerously-skip-permissions');
console.log('  ⚠  Claude has full access to this directory');
console.log('  ⚠  See SECURITY.md for mitigations');
console.log('════════════════════════════════════════════════');
console.log(`\n  Intent: ${intent.slice(0, 120)}${intent.length > 120 ? '...' : ''}\n`);

// ── Session Loop ─────────────────────────────────────────────────────────────

const sessionStartTimes = [];

for (let session = 1; session <= maxSessions; session++) {
  const sessionStart = Date.now();
  sessionStartTimes.push(sessionStart);
  const elapsed = sessionStartTimes.length > 1
    ? Math.round((sessionStart - sessionStartTimes[0]) / 60000)
    : 0;
  console.log(`\n── Session ${session}/${maxSessions} ${elapsed > 0 ? `(${elapsed}min elapsed)` : ''} ──`);

  // Build the prompt
  let prompt = 'You are in AZCLAUDE Copilot mode. Run /copilot to continue autonomous building.';
  prompt += `\n\nOriginal intent: ${intent}`;

  if (resuming || session > 1) {
    prompt += '\n\nPlan exists. Read .claude/plan.md for milestone status.';
  } else {
    prompt += '\n\nNo plan yet. Start with /setup then /plan to create milestones.';
  }

  // Run Claude Code session
  const result = spawnSync('claude', [
    '--dangerously-skip-permissions',
    '-p', prompt,
    '--output-format', 'text'
  ], {
    cwd: projectDir,
    stdio: 'inherit',
    timeout: 600000, // 10 minutes per session
  });

  if (result.error) {
    console.error(`  Session ${session} error: ${result.error.message}`);
    if (result.error.code === 'ETIMEDOUT') {
      console.log('  Session timed out (10 min). Restarting...');
      continue;
    }
  }

  // Check completion
  if (fs.existsSync(goalsPath)) {
    const goals = fs.readFileSync(goalsPath, 'utf8');
    if (goals.includes('COPILOT_COMPLETE')) {
      console.log('\n════════════════════════════════════════════════');
      const totalMin = Math.round((Date.now() - sessionStartTimes[0]) / 60000);
      console.log('  COPILOT COMPLETE');
      console.log(`  Sessions used: ${session}`);
      console.log(`  Total time:    ${totalMin} minutes`);
      const reportPath = path.join(claudeDir, 'copilot-report.md');
      if (fs.existsSync(reportPath)) {
        console.log(`  Report: ${reportPath}`);
      }
      console.log('════════════════════════════════════════════════\n');
      process.exit(0);
    }
  }

  // Check if plan.md shows all done or all blocked
  if (fs.existsSync(planPath)) {
    const plan = fs.readFileSync(planPath, 'utf8');
    const statuses = [...plan.matchAll(/^- Status: (\w+)/gm)].map(m => m[1]);
    if (statuses.length > 0) {
      const allDoneOrBlocked = statuses.every(s => s === 'done' || s === 'blocked' || s === 'skipped');
      const allBlocked = statuses.every(s => s === 'blocked');
      if (allBlocked) {
        console.log('\n════════════════════════════════════════════════');
        console.log('  ALL MILESTONES BLOCKED');
        console.log('  Human intervention needed.');
        console.log(`  See: ${path.join(claudeDir, 'memory', 'blockers.md')}`);
        console.log('════════════════════════════════════════════════\n');
        process.exit(1);
      }
      if (allDoneOrBlocked) {
        console.log('  All milestones resolved. Next session should finalize.');
      }
    }
  }

  console.log(`  Session ${session} ended. State preserved. Continuing...`);
}

// ── Max sessions reached ─────────────────────────────────────────────────────

const totalMinMax = Math.round((Date.now() - sessionStartTimes[0]) / 60000);
console.log('\n════════════════════════════════════════════════');
console.log(`  MAX SESSIONS REACHED (${maxSessions})`);
console.log(`  Total time:  ${totalMinMax} minutes`);
console.log('  Project not yet complete.');
console.log('  Resume: npx azclaude-copilot .');
console.log('════════════════════════════════════════════════\n');
process.exit(1);
