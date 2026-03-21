#!/usr/bin/env node
'use strict';
/**
 * AZCLAUDE — Autonomous Runner (copilot mode)
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
const crypto        = require('crypto');

// ── Args ─────────────────────────────────────────────────────────────────────

const args       = process.argv.slice(2);

// ── Subcommand routing ──────────────────────────────────────────────────────
// Catch `npx azclaude-copilot setup` and similar — run the installer instead
const SUBCOMMANDS = ['setup', 'init', 'install', 'doctor'];
const CLI_FLAGS   = ['--update', '--full', '--audit'];
if (args[0] && SUBCOMMANDS.includes(args[0].toLowerCase())) {
  const subFlags = args.filter(a => CLI_FLAGS.includes(a));
  const subPositional = args.slice(1).filter(a => !CLI_FLAGS.includes(a));
  const subDir = path.resolve(subPositional[0] || '.');
  console.log(`\n  Running AZCLAUDE installer on ${subDir}...${subFlags.length ? ' (' + subFlags.join(' ') + ')' : ''}\n`);
  const cliPath = path.join(__dirname, 'cli.js');
  const subArgs = args[0].toLowerCase() === 'doctor'
    ? [cliPath, subDir, '--doctor', ...subFlags]
    : [cliPath, subDir, ...subFlags];
  const r = spawnSync('node', subArgs, { cwd: subDir, stdio: 'inherit' });
  process.exit(r.status || 0);
}

const deepMode   = args.includes('--deep');
const filteredArgs = args.filter(a => a !== '--deep');
const projectDir = path.resolve(filteredArgs[0] || '.');
const intentArg  = filteredArgs[1] || '';
const maxSessions = parseInt(filteredArgs[2] || '20', 10);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  AZCLAUDE — Autonomous Mode

  Usage:
    npx azclaude-copilot <project-dir> <intent> [max-sessions]
    npx azclaude-copilot setup [dir]      # install AZCLAUDE into project
    npx azclaude-copilot doctor [dir]     # run health check

  Examples:
    npx azclaude-copilot . "Build a REST API with auth"
    npx azclaude-copilot . intent.md 30
    npx azclaude-copilot .                    # resume existing project
    npx azclaude-copilot setup               # install templates + commands

  Options:
    --help, -h    Show this help
    --deep        Enable deep audit mode (content accuracy, UX, links, a11y)
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

// ── Auto-install AZCLAUDE if not present ─────────────────────────────────────

const commandsDir  = path.join(claudeDir, 'commands');
const needsInstall = !fs.existsSync(commandsDir) || !fs.readdirSync(commandsDir).some(f => f.endsWith('.md'));

if (needsInstall) {
  console.log('\n  Installing AZCLAUDE infrastructure...');
  const cliPath = path.join(__dirname, 'cli.js');
  const installResult = spawnSync('node', [cliPath, projectDir], {
    cwd: projectDir,
    stdio: 'inherit',
    timeout: 60000,
  });
  if (installResult.status !== 0) {
    console.error('  Error: AZCLAUDE install failed. Cannot proceed.');
    process.exit(1);
  }
  console.log('  AZCLAUDE installed. Commands, skills, agents, hooks ready.\n');
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
console.log('  AZCLAUDE — Autonomous Mode');
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

// ── Session State ─────────────────────────────────────────────────────────────
// Persists to disk — survives runner crash. Tracks plan progress for stall detection.

const statePath = path.join(claudeDir, 'copilot-state.json');

function loadState() {
  try { return JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch (_) {}
  return { planHash: '', stalls: 0, stuckMilestones: {}, retries: 0 };
}

function saveState(state) {
  try { fs.writeFileSync(statePath, JSON.stringify(state, null, 2)); } catch (_) {}
}

function hashPlan() {
  if (!fs.existsSync(planPath)) return '';
  return crypto.createHash('md5').update(fs.readFileSync(planPath)).digest('hex');
}

function getInProgressMilestones() {
  if (!fs.existsSync(planPath)) return [];
  const milestones = [];
  let currentTitle = '';
  for (const line of fs.readFileSync(planPath, 'utf8').split('\n')) {
    if (/^#{1,3}\s/.test(line)) currentTitle = line.replace(/^#+\s*/, '').trim();
    if (/Status:\s*in-progress/i.test(line) && currentTitle) milestones.push(currentTitle);
  }
  return milestones;
}

const state = loadState();

// ── Session Loop ─────────────────────────────────────────────────────────────

const sessionStartTimes = [];

for (let session = 1; session <= maxSessions; session++) {
  const sessionStart = Date.now();
  sessionStartTimes.push(sessionStart);
  const elapsed = sessionStartTimes.length > 1
    ? Math.round((sessionStart - sessionStartTimes[0]) / 60000)
    : 0;
  console.log(`\n── Session ${session}/${maxSessions} ${elapsed > 0 ? `(${elapsed}min elapsed)` : ''} ──`);

  // Snapshot plan state before session — for stall + stuck milestone detection
  const prevHash        = hashPlan();
  const prevInProgress  = getInProgressMilestones();

  // Build state-aware prompt
  // IMPORTANT: In -p mode, slash commands (/setup, /copilot) don't work.
  // Tell Claude to read and follow the command .md files directly.
  let prompt = 'You are in AZCLAUDE Copilot mode. You are running in non-interactive mode (-p flag).';
  prompt += '\n\nIMPORTANT: Slash commands like /setup do NOT work in -p mode. Instead, read the command file and follow its instructions. For example, to run /copilot: read .claude/commands/copilot.md and follow it. To run /setup: read .claude/commands/setup.md and follow it.';
  prompt += '\n\nRead .claude/commands/copilot.md now and follow it to continue autonomous building.';
  prompt += `\n\nOriginal intent: ${intent}`;
  prompt += `\n\nSession ${session}/${maxSessions}.`;

  if (deepMode) {
    prompt += '\n\nDEEP MODE: After code audit passes, also run:';
    prompt += '\n1. Content accuracy audit — verify facts, percentages, links against source material';
    prompt += '\n2. UX heuristic check — scroll depth, navigation efficiency, mobile responsiveness';
    prompt += '\n3. Link validation — verify all internal/external links resolve';
    prompt += '\n4. Accessibility audit — screen reader flow, focus order, color contrast';
    prompt += '\nDo NOT declare COPILOT_COMPLETE until deep checks pass.';
  }

  // Inject stall hint if plan hasn't changed
  if (state.stalls > 0) {
    prompt += `\n\nWARNING: Plan.md has not changed for ${state.stalls} consecutive session(s). You may be stuck. Complete at least one pending milestone and update its Status to "done" in plan.md before this session ends.`;
  }

  // Inject stuck milestone hint
  const stuckList = Object.entries(state.stuckMilestones || {}).filter(([, c]) => c >= 2).map(([m]) => m);
  if (stuckList.length > 0) {
    prompt += `\n\nSTUCK MILESTONES (in-progress for 2+ sessions without progress): ${stuckList.join(', ')}. Either complete them fully now, or mark Status: blocked with a specific reason in .claude/memory/blockers.md. Do not leave them in-progress again.`;
  }

  if (resuming || session > 1) {
    // Parse plan.md for milestone progress
    if (fs.existsSync(planPath)) {
      const planContent = fs.readFileSync(planPath, 'utf8');
      const statuses = [...planContent.matchAll(/^- Status: ([\w-]+)/gm)].map(m => m[1]);
      const done = statuses.filter(s => s === 'done').length;
      const blocked = statuses.filter(s => s === 'blocked').length;
      const pending = statuses.filter(s => s === 'pending' || s === 'in-progress').length;
      const total = statuses.length;
      prompt += `\n\nPlan progress: ${done}/${total} done, ${blocked} blocked, ${pending} remaining.`;
      if (blocked > 0) prompt += ' Check blockers.md — retry blocked milestones if new context helps.';
      if (done > 0 && done % 3 === 0) prompt += ' 3+ milestones since last /evolve — read .claude/commands/reflexes.md then .claude/commands/evolve.md.';
      if (pending === 0 && blocked === 0) prompt += ' All milestones done — read .claude/commands/audit.md then .claude/commands/ship.md.';
    } else {
      prompt += '\n\nPlan exists but plan.md not found. Read .claude/plan.md for status.';
    }
  } else {
    prompt += '\n\nNo plan yet. Read .claude/commands/setup.md and follow it, then read .claude/commands/blueprint.md to create milestones.';
  }

  // Run Claude Code session — retry once on non-timeout failure (API hiccup, rate limit, etc.)
  const claudeArgs = [
    '--dangerously-skip-permissions',
    '-p', prompt,
    '--output-format', 'text',
    ...(deepMode ? ['--model', 'claude-opus-4-6'] : [])
  ];
  const spawnOpts = { cwd: projectDir, stdio: 'inherit', timeout: 1800000 };

  let result = spawnSync('claude', claudeArgs, spawnOpts);

  // Retry once on abnormal non-zero exit (not timeout, not spawn failure)
  if (result.status !== 0 && !result.error) {
    state.retries = (state.retries || 0) + 1;
    saveState(state);
    console.log(`  Session ${session} exited ${result.status} — retrying once (retry #${state.retries} total)...`);
    result = spawnSync('claude', claudeArgs, spawnOpts);
  }

  if (result.error) {
    console.error(`  Session ${session} error: ${result.error.message}`);
    if (result.error.code === 'ETIMEDOUT') {
      console.log('  Session timed out (30 min). Restarting...');
      saveState(state);
      continue;
    }
  }

  // ── Stall detection ────────────────────────────────────────────────────────
  const newHash = hashPlan();
  if (session > 1 && prevHash !== '' && newHash === prevHash) {
    state.stalls = (state.stalls || 0) + 1;
    console.log(`  ⚠ No plan progress detected (stall ${state.stalls}/3)`);
    if (state.stalls >= 3) {
      console.log('\n════════════════════════════════════════════════');
      console.log('  STALLED — plan.md unchanged for 3 consecutive sessions.');
      console.log('  Likely stuck in a loop. Human review required.');
      console.log(`  State: ${statePath}`);
      console.log('════════════════════════════════════════════════\n');
      saveState(state);
      process.exit(1);
    }
  } else {
    state.stalls = 0;
  }
  state.planHash = newHash;

  // ── Stuck milestone detection ───────────────────────────────────────────────
  const newInProgress  = getInProgressMilestones();
  const stillStuck     = newInProgress.filter(m => prevInProgress.includes(m));
  const freshStuck     = state.stuckMilestones || {};
  for (const m of stillStuck) { freshStuck[m] = (freshStuck[m] || 0) + 1; }
  for (const m of Object.keys(freshStuck)) {
    if (!stillStuck.includes(m)) delete freshStuck[m];
  }
  state.stuckMilestones = freshStuck;
  saveState(state);

  // Check completion
  if (fs.existsSync(goalsPath)) {
    const goals = fs.readFileSync(goalsPath, 'utf8');
    if (goals.includes('COPILOT_COMPLETE')) {
      try { fs.unlinkSync(statePath); } catch (_) {} // clean up state on success
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
    const statuses = [...plan.matchAll(/^- Status: ([\w-]+)/gm)].map(m => m[1]);
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
