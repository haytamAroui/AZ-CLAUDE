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
// This is the enforcement layer that makes Claude Code USE AZCLAUDE.
// Without this, Claude Code ignores all installed agents, skills, and capabilities.
//
// Pipeline: problem-architect FIRST → Team Spec → skills + agents → implement → review
// No skip conditions for code tasks. problem-architect ALWAYS runs first.
try {
  const promptText = (function() {
    try {
      return fs.readFileSync(path.join(os.tmpdir(), `.azclaude-prompt-${process.ppid || process.pid}`), 'utf8');
    } catch (_) { return ''; }
  })();

  // Skip routing for: slash commands (command files handle it), empty prompts
  if (promptText.startsWith('/') || promptText.length === 0) {
    // no-op — fall through to session gate
  } else {
    const p = promptText.toLowerCase();

    // ── Tier classification — 3 levels of routing ───────────────────────────
    // TIER 0: Pure question — skip pipeline entirely (explain, define, show me)
    // TIER 1: Analysis/discussion — load skills only, skip problem-architect
    //         ("is this good?", "do we need to?", "should we?", "verify this")
    // TIER 2: Implementation — full pipeline with problem-architect blocking
    //         ("build X", "fix X", "create X", "add X", "deploy X")
    const isQuestionOnly = /^(what|how|why|where|when|who|can you explain|show me|tell me|do you know)\b/.test(p.trim())
      && !/\b(build|add|create|implement|fix|refactor|deploy|write|make|change|update|modify|remove|delete|move|rename|install|configure|migrate)\b/.test(p);

    // Discussion framing — "do we need to implement X" is NOT the same as "implement X"
    const isDiscussion = /\b(do we|should we|would we|need to implement|want to|could we|thinking about|wondering if|considering|is this|verify|is it|does it|did you|did we)\b/.test(p)
      && !/^(yes|ok|sure|go ahead|let'?s|actually implement|actually build|actually fix)\b/.test(p.trim());

    // Concrete implementation signals — requires file writes, not just reasoning
    const isImplementation = /\b(build|add|create|implement|fix|deploy|migrate|refactor|write|make|change|update|modify|remove|delete|install|configure|rename|setup)\b/.test(p)
      && !isDiscussion;

    const tier = isQuestionOnly ? 0 : isImplementation ? 2 : 1;

    if (tier > 0) {
      const agentsDir = path.join(cfg, 'agents');
      const skillsDir = path.join(cfg, 'skills');
      const hasAgents = fs.existsSync(agentsDir);
      const hasSkills = fs.existsSync(skillsDir);
      const agentExists = (name) => hasAgents && fs.existsSync(path.join(agentsDir, `${name}.md`));
      const skillExists = (name) => hasSkills && fs.existsSync(path.join(skillsDir, name, 'SKILL.md'));

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

      // If no specific intents detected but it's not a question, treat as general code task
      if (intents.length === 0) intents.push('CODE');

      // ── Build the MANDATORY pipeline ──
      const tierLabel = tier === 2 ? 'IMPLEMENT' : 'ANALYZE';
      console.log('');
      console.log('--- AZCLAUDE PIPELINE (MANDATORY) ---');
      console.log('Detected: ' + intents.join(' + ') + ' | Tier: ' + tierLabel + (tier === 1 ? ' (skip problem-architect — load skills + reason directly)' : ''));
      console.log('');

      // ── STEP 1: problem-architect — TIER 2 only (concrete implementation tasks) ──
      // Tier 1 (analysis/discussion) skips this — Claude reasons directly with loaded skills.
      // Tier 2 (build/fix/create/deploy) always runs pre-flight — no exceptions.
      if (tier === 2 && agentExists('problem-architect')) {
        console.log('STEP 1 — PRE-FLIGHT (BLOCKING):');
        console.log('  Spawn Agent(subagent_type="problem-architect") with this prompt:');
        console.log('    "Task: [user\'s request]');
        console.log('    Available agents: ' + (hasAgents ? fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).map(f => f.replace('.md','')).join(', ') : 'none'));
        console.log('    Available skills: ' + (hasSkills ? fs.readdirSync(skillsDir).filter(s => fs.existsSync(path.join(skillsDir, s, 'SKILL.md'))).join(', ') : 'none') + '"');
        console.log('  WAIT for Team Spec before proceeding. Do NOT start coding without it.');
        console.log('');
      }

      // ── STEP 1b: Web research for current best practices ──
      console.log('STEP 1b — WEB RESEARCH (MANDATORY):');
      console.log('  Use WebSearch to verify best practices for technologies in this task.');
      console.log('  Claude\'s training data is frozen — APIs change, libraries break, patterns evolve.');
      console.log('  Search: "{technology} best practices ' + new Date().getFullYear() + '" + "{technology} common pitfalls"');
      console.log('  Fetch: official docs for any specific API/library version in use.');
      console.log('  Skip only for: pure internal code with zero external dependencies.');
      console.log('');

      // ── STEP 2: Load skills based on intent ──
      const skills = [];
      if ((intents.includes('BUILD') || intents.includes('FIX') || intents.includes('CODE')) && skillExists('test-first')) {
        skills.push('test-first');
      }
      if (intents.includes('FRONTEND') && skillExists('frontend-design')) {
        skills.push('frontend-design');
      }
      if (intents.includes('PLAN') && skillExists('architecture-advisor')) {
        skills.push('architecture-advisor');
      }
      if (intents.includes('EXTEND')) {
        if (skillExists('agent-creator')) skills.push('agent-creator');
        if (skillExists('skill-creator')) skills.push('skill-creator');
      }
      if (intents.includes('REVIEW') && skillExists('security')) {
        skills.push('security');
      }
      if (skills.length > 0) {
        console.log('STEP 2 — LOAD SKILLS:');
        skills.forEach(s => console.log('  Read: ' + cfg + '/skills/' + s + '/SKILL.md'));
        console.log('  Follow each skill\'s instructions exactly. These are specialized knowledge.');
        console.log('');
      }

      // ── STEP 3: Intent-specific agents ──
      const agents = [];
      if (intents.includes('REVIEW') && agentExists('security-auditor')) agents.push({ name: 'security-auditor', desc: '111-rule security scan' });
      if (intents.includes('REVIEW') && agentExists('code-reviewer')) agents.push({ name: 'code-reviewer', desc: 'code quality + bug detection' });
      if (intents.includes('TEST') && agentExists('test-writer')) agents.push({ name: 'test-writer', desc: 'generate tests matching project patterns' });
      if (intents.includes('DEVOPS') && agentExists('devops-engineer')) agents.push({ name: 'devops-engineer', desc: 'infrastructure/CI/CD specialist' });
      if (agents.length > 0) {
        console.log('STEP 3 — SPECIALIST AGENTS:');
        agents.forEach(a => console.log('  Spawn Agent(subagent_type="' + a.name + '") — ' + a.desc));
        console.log('');
      }

      // ── STEP 4: Post-implementation (ALWAYS for code tasks) ──
      if (!intents.includes('REVIEW') && !intents.includes('PLAN')) {
        const postAgents = [];
        if (agentExists('code-reviewer')) postAgents.push('code-reviewer');
        if (agentExists('test-writer')) postAgents.push('test-writer');
        if (postAgents.length > 0) {
          console.log('STEP 4 — AFTER IMPLEMENTATION (MANDATORY):');
          postAgents.forEach(a => console.log('  Spawn Agent(subagent_type="' + a + '") to review/test your changes'));
          console.log('  Do NOT mark task as done until review + tests pass.');
          console.log('');
        }
      }

      // ── STEP 5: Self-healing — create missing skills/agents on the fly ──
      console.log('SELF-HEALING RULE:');
      console.log('  If problem-architect\'s Team Spec lists a MISSING skill or agent:');
      if (skillExists('skill-creator')) {
        console.log('  → For missing skills: use Skill tool to invoke "skill-creator" with the domain/technology name');
      }
      if (skillExists('agent-creator')) {
        console.log('  → For missing agents: use Skill tool to invoke "agent-creator" with the workstream description');
      }
      console.log('  Create the missing skill/agent BEFORE implementation. It will be available for all future tasks.');
      console.log('');

      console.log('This pipeline is NON-NEGOTIABLE. Do not skip steps. Do not start coding before Step 1 completes.');
      console.log('--- END PIPELINE ---');
    }
  }
} catch (_) {}

// ── Compaction Guard — auto-snapshot before context is lost ─────────────────
// Reads context % signal from statusline (written to temp file after each turn).
// At >= 70%: warns Claude to save state. At >= 85%: auto-saves checkpoint.
try {
  const ctxSignalPath = path.join(os.tmpdir(), `.azclaude-ctx-${process.ppid || process.pid}`);
  if (fs.existsSync(ctxSignalPath)) {
    const ctxSignal = JSON.parse(fs.readFileSync(ctxSignalPath, 'utf8'));
    const pct = ctxSignal.ctxPct || 0;

    if (pct >= 85) {
      // AUTO-SAVE: context is critically high — save checkpoint before compaction wipes it
      const checkpointDir = path.join(cfg, 'memory', 'checkpoints');
      try { fs.mkdirSync(checkpointDir, { recursive: true }); } catch (_) {}
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
      const cpPath = path.join(checkpointDir, `${ts}-auto-compaction.md`);

      // Only auto-save once per threshold crossing (check if already saved)
      const autoSaveMarker = path.join(os.tmpdir(), `.azclaude-autosave-${process.ppid || process.pid}`);
      if (!fs.existsSync(autoSaveMarker)) {
        // Copy goals.md as checkpoint
        if (fs.existsSync(goalsPath)) {
          const goalsContent = fs.readFileSync(goalsPath, 'utf8');
          const header = `---\ndate: ${new Date().toISOString()}\nlabel: auto-compaction-guard-${pct}pct\nfiles_in_progress: []\n---\n\n`;
          fs.writeFileSync(cpPath, header + '## Auto-saved before compaction\n\n' + goalsContent);
          fs.writeFileSync(autoSaveMarker, '');
        }

        console.log('');
        console.log(`--- COMPACTION GUARD (${pct}%) ---`);
        console.log(`Context at ${pct}% — AUTO-SAVED checkpoint to ${path.basename(cpPath)}`);
        console.log('Run /snapshot NOW to save your reasoning and decisions (goals.md alone is not enough).');
        console.log('--- END GUARD ---');
      }
    } else if (pct >= 70) {
      console.log('');
      console.log(`--- COMPACTION WARNING (${pct}%) ---`);
      console.log(`Context at ${pct}% — compaction approaching. Run /snapshot to save session state.`);
      console.log('--- END WARNING ---');
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
