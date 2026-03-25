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
  // Persist prompt text for brain router (below) — router reads this on every message
  if (promptText) {
    try { fs.writeFileSync(path.join(os.tmpdir(), `.azclaude-prompt-${process.ppid || process.pid}`), promptText); } catch (_) {}
  }
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

// ── Session gate — first message gets full context, subsequent get routing only ─
const marker = path.join(os.tmpdir(), `.azclaude-session-${process.ppid || process.pid}`);
const isFirstMessage = !fs.existsSync(marker);
if (isFirstMessage) {
  try { fs.writeFileSync(marker, ''); } catch (_) {}
  // Stamp session start time for duration tracking (stop.js reads this)
  try { fs.writeFileSync(path.join(os.tmpdir(), `.azclaude-session-start-${process.ppid || process.pid}`), new Date().toISOString()); } catch (_) {}
}

// Only proceed if this is an AZCLAUDE project (goals.md exists)
const cfg = process.env.AZCLAUDE_CFG || '.claude';
const goalsPath = path.join(cfg, 'memory', 'goals.md');
if (!fs.existsSync(goalsPath)) process.exit(0);

// ── AZCLAUDE Brain Router — fires on EVERY message ─────────────────────────
// Detects user intent and injects agent/skill/capability routing.
// This is what makes Claude Code USE AZCLAUDE instead of ignoring it.
try {
  const promptText = (function() {
    try {
      const raw = fs.readFileSync(path.join(os.tmpdir(), `.azclaude-prompt-${process.ppid || process.pid}`), 'utf8');
      return raw;
    } catch (_) { return ''; }
  })();

  // Re-read the prompt from the injection scan (already parsed above)
  // Detect slash commands — skip routing, the command file handles it
  if (promptText.startsWith('/')) {
    // Slash commands have their own routing — don't inject
  } else if (promptText.length > 0) {
    const p = promptText.toLowerCase();

    // ── Intent detection ──
    const intents = [];
    if (/\b(build|add|create|implement|feature|component|page|endpoint|function|module|new)\b/.test(p)) intents.push('BUILD');
    if (/\b(fix|bug|broken|error|crash|issue|fail|wrong|not work)\b/.test(p)) intents.push('FIX');
    if (/\b(review|check|audit|safe|securit|vulnerab)\b/.test(p)) intents.push('REVIEW');
    if (/\b(test|coverage|spec|e2e|unit test|integration test)\b/.test(p)) intents.push('TEST');
    if (/\b(plan|blueprint|architect|design system|decide|which.*better|trade.?off)\b/.test(p)) intents.push('PLAN');
    if (/\b(deploy|ci|cd|docker|infra|pipeline|kubernetes|nginx|terraform)\b/.test(p)) intents.push('DEVOPS');
    if (/\b(refactor|clean|improve|simplify|restructure)\b/.test(p)) intents.push('REFACTOR');
    if (/\b(frontend|ui|ux|css|page|dashboard|landing|component|react|vue|html)\b/.test(p)) intents.push('FRONTEND');
    if (/\b(agent|skill|capability|command)\b.*\b(create|add|new|build|write)\b/.test(p)) intents.push('EXTEND');

    // ── Map intents to AZCLAUDE routing ──
    if (intents.length > 0) {
      const agentsDir = path.join(cfg, 'agents');
      const skillsDir = path.join(cfg, 'skills');
      const hasAgents = fs.existsSync(agentsDir);
      const hasSkills = fs.existsSync(skillsDir);

      const routing = [];

      // Agent routing — only suggest agents that are actually installed
      const agentExists = (name) => hasAgents && fs.existsSync(path.join(agentsDir, `${name}.md`));
      const skillExists = (name) => hasSkills && fs.existsSync(path.join(skillsDir, name, 'SKILL.md'));

      if ((intents.includes('BUILD') || intents.includes('FIX') || intents.includes('REFACTOR')) && agentExists('problem-architect')) {
        routing.push('BEFORE coding: spawn Agent(subagent_type="problem-architect") for pre-flight analysis if 3+ files involved');
      }
      if ((intents.includes('BUILD') || intents.includes('FIX')) && skillExists('test-first')) {
        routing.push('Load test-first skill: read ' + cfg + '/skills/test-first/SKILL.md — write failing test BEFORE implementation');
      }
      if (intents.includes('FRONTEND') && skillExists('frontend-design')) {
        routing.push('Load frontend-design skill: read ' + cfg + '/skills/frontend-design/SKILL.md — follow design system before writing UI');
      }
      if (intents.includes('REVIEW') && agentExists('security-auditor')) {
        routing.push('Spawn Agent(subagent_type="security-auditor") for 111-rule security scan');
      }
      if (intents.includes('REVIEW') && agentExists('code-reviewer')) {
        routing.push('Spawn Agent(subagent_type="code-reviewer") for code quality review');
      }
      if (intents.includes('TEST') && agentExists('test-writer')) {
        routing.push('Spawn Agent(subagent_type="test-writer") to generate tests matching project patterns');
      }
      if (intents.includes('PLAN') && skillExists('architecture-advisor')) {
        routing.push('Load architecture-advisor skill: read ' + cfg + '/skills/architecture-advisor/SKILL.md — evidence-based decision');
      }
      if (intents.includes('DEVOPS') && agentExists('devops-engineer')) {
        routing.push('Spawn Agent(subagent_type="devops-engineer") for infrastructure/CI/CD work');
      }
      if (intents.includes('EXTEND') && skillExists('agent-creator')) {
        routing.push('Load agent-creator skill: read ' + cfg + '/skills/agent-creator/SKILL.md — follow 5-layer agent structure');
      }
      if (intents.includes('EXTEND') && skillExists('skill-creator')) {
        routing.push('Load skill-creator skill: read ' + cfg + '/skills/skill-creator/SKILL.md — follow skill template structure');
      }

      // Post-implementation reminders
      if (intents.includes('BUILD') || intents.includes('FIX') || intents.includes('REFACTOR')) {
        if (agentExists('code-reviewer')) {
          routing.push('AFTER implementation: spawn Agent(subagent_type="code-reviewer") to review your changes');
        }
        if (agentExists('test-writer')) {
          routing.push('AFTER implementation: spawn Agent(subagent_type="test-writer") if test coverage is needed');
        }
      }

      if (routing.length > 0) {
        console.log('');
        console.log('--- AZCLAUDE DISPATCH ---');
        console.log('Detected: ' + intents.join(' + '));
        console.log('REQUIRED actions (installed agents/skills available):');
        routing.forEach((r, i) => console.log(`  ${i + 1}. ${r}`));
        console.log('Do NOT skip these steps. Use the Agent tool with the specified subagent_type.');
        console.log('--- END DISPATCH ---');
      }
    }
  }
} catch (_) {}

// ── First message only — inject full context ────────────────────────────────
if (!isFirstMessage) process.exit(0);

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

// ── Inject blockers if present ──────────────────────────────────────────────
const blockersPath = path.join('.claude', 'memory', 'blockers.md');
if (fs.existsSync(blockersPath)) {
  try {
    const blockersContent = fs.readFileSync(blockersPath, 'utf8').trim();
    if (blockersContent.length > 0) {
      const blockersLines = blockersContent.split('\n').filter(l => !INJECTION.test(l));
      const capped = blockersLines.slice(0, 15);
      console.log('');
      console.log('--- ACTIVE BLOCKERS ---');
      console.log(capped.join('\n'));
      if (blockersLines.length > 15) console.log(`... ${blockersLines.length - 15} more lines (on disk)`);
      console.log('--- END BLOCKERS ---');
    }
  } catch (_) {}
}

// ── Inject architecture decisions if present ────────────────────────────────
const decisionsPath = path.join('.claude', 'memory', 'decisions.md');
if (fs.existsSync(decisionsPath)) {
  try {
    const decisionsContent = fs.readFileSync(decisionsPath, 'utf8').trim();
    if (decisionsContent.length > 0) {
      const decisionsLines = decisionsContent.split('\n').filter(l => !INJECTION.test(l));
      const capped = decisionsLines.slice(0, 30);
      console.log('');
      console.log('--- ARCHITECTURE DECISIONS ---');
      console.log(capped.join('\n'));
      if (decisionsLines.length > 30) console.log(`... ${decisionsLines.length - 30} more lines (on disk)`);
      console.log('--- END DECISIONS ---');
    }
  } catch (_) {}
}

// ── Inject code patterns if present ─────────────────────────────────────────
const patternsPath = path.join('.claude', 'memory', 'patterns.md');
if (fs.existsSync(patternsPath)) {
  try {
    const patternsContent = fs.readFileSync(patternsPath, 'utf8').trim();
    if (patternsContent.length > 0) {
      const patternsLines = patternsContent.split('\n').filter(l => !INJECTION.test(l));
      const capped = patternsLines.slice(0, 20);
      console.log('');
      console.log('--- CODE PATTERNS ---');
      console.log(capped.join('\n'));
      if (patternsLines.length > 20) console.log(`... ${patternsLines.length - 20} more lines (on disk)`);
      console.log('--- END PATTERNS ---');
    }
  } catch (_) {}
}

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
