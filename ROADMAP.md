# AZCLAUDE COPILOT — Complete Build Roadmap
this for new product not for existing product this is new repo that we will push in https://github.com/haytamAroui/AZ-CLAUDE-COPILOT

**From idea to deployed product. Zero human input after the first message.**

---

## WHAT IT IS

AZCLAUDE Copilot = Ralph Loop (outer session runner) + AZCLAUDE intelligence (inner brain).

User describes a product once. AZCLAUDE builds it autonomously across multiple sessions — planning, implementing, testing, committing, evolving, deploying.

```
Input:   "Build EU AI Act compliance SaaS"
Output:  Deployed product at azcomply.eu with full git history

Human input after first message: ZERO
```

### Why It's Different From Ralph

| Ralph Loop | AZCLAUDE Copilot |
|------------|-----------------|
| Fresh context, git as only memory | Fresh context + goals.md + checkpoint + patterns |
| Same prompt every iteration | Smart prompt that reads AZCLAUDE state and decides |
| No learning between loops | /evolve creates agents + skills from discovered patterns |
| No convention enforcement | CLAUDE.md + patterns.md enforce consistency |
| PRD checklist | Milestone plan that re-prioritizes dynamically |
| Stops when PRD done | Stops when deployed + verified |

### Why It's Different From AutoResearchClaw

Same pipeline concept (idea → stages → output), different domain:
- AutoResearchClaw: idea → literature → experiments → paper
- AZCLAUDE Copilot: idea → plan → build → test → evolve → deploy

Both: zero human input, self-healing on failure, multi-stage pipeline.

---

## ARCHITECTURE — 3 Layers

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: THE RUNNER (bin/copilot.sh)                   │
│  30 lines of bash. Stateless. Dumb on purpose.          │
│  Restarts Claude Code sessions until COPILOT_COMPLETE.  │
│  Reads nothing. Decides nothing. Just loops.            │
├─────────────────────────────────────────────────────────┤
│  LAYER 2: THE BRAIN (AZCLAUDE inside each session)      │
│  Reads goals.md, plan.md, checkpoint.md, patterns.md,   │
│  blockers.md, decisions.md, evolve-report.md            │
│  Decides what to do next. Builds. Tests. Commits.       │
│  Updates all state files before session ends.           │
├─────────────────────────────────────────────────────────┤
│  LAYER 3: THE ENVIRONMENT (accumulates across sessions) │
│  Project agents emerge from git evidence (/evolve)      │
│  Skills created when patterns repeat                    │
│  Conventions solidify in CLAUDE.md                      │
│  The environment gets smarter every session.            │
└─────────────────────────────────────────────────────────┘
```

Runner loops. AZCLAUDE accumulates. Claude thinks.

---

## ROADMAP — 5 PHASES

### PHASE 1: THE COMMAND (Day 1 — 2 hours)
**What:** Add /copilot command to templates/commands/

File: `templates/commands/copilot.md`

```markdown
---
description: Autonomous milestone execution. Plan → Build → Test → Commit → Evolve → Ship.
---

## Copilot Mode — Autonomous Product Building

You are in COPILOT mode. Work through the plan autonomously.

### Before Starting
Read these files (if they exist):
- .claude/plan.md → milestone status
- .claude/memory/goals.md → recent work + what's next
- .claude/memory/checkpoints/ → last reasoning state
- .claude/memory/patterns.md → learned conventions
- .claude/memory/decisions.md → past architecture choices
- .claude/memory/blockers.md → what's stuck

### Decision Logic
- If no plan exists → run /dream then /blueprint
- If plan exists with incomplete milestones → find next one, implement it
- If milestone blocked → /debate the blocker, try alternative approach
- If 3 milestones completed since last evolve → run /evolve
- If all milestones done → run /audit on full project
- If review passes → run /ship and deploy
- If deploy succeeds → write COPILOT_COMPLETE to goals.md

### Per Milestone
1. Implement the milestone completely
2. Run all tests
3. If tests fail → fix (2 attempts max)
4. If still failing → log to blockers.md, skip, continue next
5. Git add + commit: {type}: {what} — {why}
6. Git push
7. Update plan.md: mark milestone done
8. /snapshot

### Every 3 Milestones
- /evolve → scan for drift, patterns, missing coverage
- Check if new project agents needed → create from git evidence
- Check if new skills needed → create from repeated patterns
- Update CLAUDE.md if conventions changed
- Re-evaluate remaining milestone priorities

### Completion
When all milestones are done and /audit passes:
- Write "COPILOT_COMPLETE" to .claude/memory/goals.md
- Generate copilot-report.md with: what was built, decisions made,
  blockers encountered, agents/skills created, test coverage, deploy URLs

### Rules
- Do NOT ask for permission between milestones
- Do NOT pause for approval
- STOP only if: tests fail after 2 fix attempts on same issue AND
  alternative approach also fails → log to blockers.md, continue
- STOP if: all milestones complete and deployed
```

**Tests to add:**
- copilot.md exists in templates/commands/
- Contains decision logic section
- Contains per-milestone protocol
- Contains COPILOT_COMPLETE exit signal
- References /dream, /blueprint, /evolve, /audit, /ship

---

### PHASE 2: THE PLAN SYSTEM (Day 1 — 3 hours)
**What:** Enhance /blueprint to produce machine-readable plan.md

Current /blueprint outputs text. Copilot needs structured milestones it can track.

File: Update `templates/commands/blueprint.md` and add `templates/capabilities/shared/plan-tracker.md`

**plan.md format (generated by /blueprint):**

```markdown
# Project Plan

## Intent
EU AI Act compliance SaaS with free terminal + paid assessment

## Milestones

### M1: Project scaffold
- Status: done
- Files: package.json, tsconfig.json, .env.example
- Commit: feat: project scaffold with FastAPI + Next.js

### M2: Landing page
- Status: done  
- Files: app/page.tsx, components/Hero.tsx
- Commit: feat: landing page with hero + CTA

### M3: Free classification terminal
- Status: in-progress
- Files: app/terminal/page.tsx, api/classify/route.ts
- Commit: feat: deterministic classification terminal

### M4: Stripe checkout
- Status: pending
- Depends: M2
- Files: api/checkout/route.ts, lib/stripe.ts

### M5: 30-question assessment form
- Status: pending
- Depends: M4

...

## Summary
Total: 12 milestones
Done: 2/12
In progress: 1/12
Blocked: 0
```

**Key design decisions:**
- plan.md lives in .claude/ (survives compaction, read by copilot)
- Status values: pending, in-progress, done, blocked, skipped
- Each milestone has expected files and commit message format
- Dependencies tracked so copilot doesn't build out of order

**Tests to add:**
- /blueprint generates plan.md with milestone structure
- Each milestone has Status field
- Copilot can parse "next incomplete milestone" from plan.md
- Status updates persist across sessions

---

### PHASE 3: THE RUNNER (Day 2 — 3 hours)
**What:** bin/copilot.sh — the outer loop

File: `bin/copilot.sh`

```bash
#!/bin/bash
set -euo pipefail

PROJECT_DIR="${1:-.}"
INTENT_FILE="${2:-}"
MAX_SESSIONS="${3:-20}"
SESSION_COUNT=0

cd "$PROJECT_DIR"

# If intent file provided, save it for the first session
if [ -n "$INTENT_FILE" ] && [ -f "$INTENT_FILE" ]; then
  INTENT=$(cat "$INTENT_FILE")
elif [ -n "$INTENT_FILE" ]; then
  INTENT="$INTENT_FILE"  # treat as inline description
else
  echo "Usage: npx azclaude copilot <project-dir> <intent>"
  echo "  intent: description string or path to .md file"
  exit 1
fi

# Save intent for all sessions to read
mkdir -p .claude
echo "$INTENT" > .claude/copilot-intent.md

echo "═══════════════════════════════════════════"
echo "  AZCLAUDE COPILOT — Autonomous Mode"
echo "  Project: $PROJECT_DIR"
echo "  Max sessions: $MAX_SESSIONS"
echo "═══════════════════════════════════════════"

while [ $SESSION_COUNT -lt $MAX_SESSIONS ]; do
  SESSION_COUNT=$((SESSION_COUNT + 1))
  echo ""
  echo "── Session $SESSION_COUNT/$MAX_SESSIONS ──"
  
  # Build the prompt based on state
  PROMPT="You are in AZCLAUDE Copilot mode. Run /copilot to continue."
  PROMPT="$PROMPT\n\nOriginal intent: $(cat .claude/copilot-intent.md)"
  
  # If plan exists, add context
  if [ -f .claude/plan.md ]; then
    PROMPT="$PROMPT\n\nPlan exists. Read .claude/plan.md for status."
  else
    PROMPT="$PROMPT\n\nNo plan yet. Start with /dream then /blueprint."
  fi
  
  # Run Claude Code session
  claude --dangerously-skip-permissions -p "$PROMPT" \
    --output-format text \
    2>&1 || true
  
  # Check completion
  if [ -f .claude/memory/goals.md ] && grep -q "COPILOT_COMPLETE" .claude/memory/goals.md; then
    echo ""
    echo "═══════════════════════════════════════════"
    echo "  COPILOT COMPLETE"
    echo "  Sessions used: $SESSION_COUNT"
    echo "  Report: .claude/copilot-report.md"
    echo "═══════════════════════════════════════════"
    exit 0
  fi
  
  echo "Session ended. State preserved. Restarting in 5s..."
  sleep 5
done

echo ""
echo "═══════════════════════════════════════════"
echo "  MAX SESSIONS REACHED ($MAX_SESSIONS)"
echo "  Project not yet complete."
echo "  Run again to continue: npx azclaude copilot ."
echo "═══════════════════════════════════════════"
exit 1
```

**CLI integration in bin/cli.js:**

```javascript
// Add to existing CLI commands
case 'copilot':
  const projectDir = args[0] || '.';
  const intent = args[1] || '';
  const maxSessions = args[2] || '20';
  execSync(`bash ${path.join(__dirname, 'copilot.sh')} "${projectDir}" "${intent}" ${maxSessions}`, 
    { stdio: 'inherit' });
  break;
```

**Usage:**

```bash
# From description string
npx azclaude copilot . "EU AI Act compliance SaaS with free terminal"

# From intent file
npx azclaude copilot . intent.md

# With session limit
npx azclaude copilot . "my app" 30

# Resume (no intent needed, reads plan.md)
npx azclaude copilot .
```

**Tests to add:**
- copilot.sh exists and is executable
- Exits 0 when COPILOT_COMPLETE found in goals.md
- Exits 1 when max sessions reached
- Creates .claude/copilot-intent.md
- Passes --dangerously-skip-permissions flag
- Handles resume (no intent, reads existing plan)

---

### PHASE 4: INTELLIGENCE INTEGRATION (Day 2-3 — 4 hours)
**What:** Wire all existing AZCLAUDE commands into the copilot flow

This is NOT new code. This is making existing commands work in autonomous mode.

**4A: /dream integration**
- Copilot's first session runs /dream with the intent
- /dream generates CLAUDE.md, agents dir, skills dir, memory dir, hooks
- Everything /dream already does — just triggered by copilot, not human

**4B: /blueprint integration**
- After /dream, copilot runs /blueprint
- /blueprint reads CLAUDE.md + intent → generates plan.md with milestones
- plan.md is the copilot's task list for all subsequent sessions

**4C: /add integration (milestone implementation)**
- For each milestone, copilot runs /add with the milestone description
- /add reads patterns.md, uses project agents, follows conventions
- After /add completes, copilot runs tests, commits, pushes

**4D: /evolve integration (every 3 milestones)**
- Copilot runs /evolve after every 3 completed milestones
- /evolve scans git history for patterns → creates new agents if evidence found
- /evolve detects stale files, missing tests, convention drift → fixes them
- New agents and skills created by /evolve are available in next milestone

**4E: /audit integration (after all milestones)**
- When plan.md shows all milestones done, copilot runs /audit
- /audit does spec-first audit: does the build match the intent?
- If review fails → copilot creates fix milestones, continues building

**4F: /ship integration (final step)**
- After review passes, copilot runs /ship
- /ship: tests → secrets scan → commit → push
- If deploy targets specified in intent → deploy to Vercel/Railway/etc.

**4G: Blocker handling**
- When a milestone fails after 2 fix attempts:
  1. Log to .claude/memory/blockers.md with: milestone, error, attempts, context
  2. Try /debate to find alternative approach
  3. If debate finds solution → implement it
  4. If no solution → skip milestone, mark as "blocked" in plan.md
  5. Continue to next milestone
  6. After all other milestones done → revisit blocked ones with full project context

**4H: Self-healing (from AutoResearchClaw pattern)**
- When experiments/builds fail → retry with different approach
- When a pattern doesn't work → record to antipatterns.md
- When hypothesis is wrong → pivot, don't persist
- Every failure teaches the environment something

**Tests to add:**
- Copilot triggers /dream when no CLAUDE.md exists
- Copilot triggers /blueprint after /dream
- Copilot picks next incomplete milestone from plan.md
- Copilot runs /evolve after 3 milestones
- Copilot runs /audit when all milestones done
- Copilot writes to blockers.md on failure
- Copilot marks COPILOT_COMPLETE when deployed

---

### PHASE 5: AGENT EMERGENCE (Day 3 — 2 hours)
**What:** Project agents emerge during copilot execution, not before

This is the key difference from every other tool. Copilot starts with ZERO project agents.

```
Session 1 (milestones 1-3):
  0 project agents
  /dream + /blueprint + build basic structure
  Git history: 3 commits touching fastapi/, next/, supabase/

Session 2 (milestones 4-6):
  /evolve reads git log after milestone 3
  Sees: 15 files changed in fastapi/, repeated patterns
  Evidence → creates cc-fastapi agent
  Sees: 8 files in next/ with i18n patterns  
  Evidence → creates cc-frontend-i18n agent
  Continues building WITH those agents active

Session 3 (milestones 7-9):
  /evolve reads more git log
  Sees: compliance logic repeating across 6 files
  Evidence → creates cc-compliance-engine agent
  3 agents now, all from real code patterns
  Environment specialized for THIS project

Session 4 (milestones 10-12):
  Full evolved environment
  Agents, skills, conventions — all from evidence
  /audit → /ship → deploy
  COPILOT_COMPLETE
```

The AZCLAUDE 4 orchestration agents (cc-architect, cc-reviewer, cc-test-writer, loop-controller) run the SYSTEM. Project agents emerge from the WORK. Two separate layers.

**No changes needed** — /evolve already creates agents from git evidence. Copilot just triggers /evolve at the right time (every 3 milestones). The emergence is automatic.

---

## FILE INVENTORY — What To Build

| # | File | Type | Effort | Phase |
|---|------|------|--------|-------|
| 1 | templates/commands/copilot.md | New command | 1 hour | 1 |
| 2 | templates/capabilities/shared/plan-tracker.md | New capability | 2 hours | 2 |
| 3 | bin/copilot.sh | New script | 2 hours | 3 |
| 4 | bin/cli.js (update) | Update | 30 min | 3 |
| 5 | templates/commands/blueprint.md (update) | Update | 1 hour | 2 |
| 6 | test-features.sh (update) | Update | 2 hours | All |

**Total: 4 new files, 2 updates. ~12 hours of work.**

---

## STATE FILES — What Copilot Reads and Writes

| File | Read by | Written by | Purpose |
|------|---------|------------|---------|
| .claude/copilot-intent.md | Copilot prompt | Runner | Original product description |
| .claude/plan.md | Copilot (every session) | /blueprint, copilot | Milestone tracker |
| .claude/memory/goals.md | UserPromptSubmit hook | PostToolUse hook | File edit breadcrumbs |
| .claude/memory/checkpoints/* | UserPromptSubmit hook | /snapshot | Reasoning snapshots |
| .claude/memory/patterns.md | Agents | /evolve | What works |
| .claude/memory/antipatterns.md | Agents | /evolve | What broke |
| .claude/memory/decisions.md | Agents | /debate | Architecture choices |
| .claude/memory/blockers.md | Copilot | Copilot | What's stuck |
| .claude/copilot-report.md | Human (at the end) | Copilot | Final summary |

The runner is stateless. AZCLAUDE's files ARE the state. Claude reads them and becomes smart. The runner just restarts sessions.

---

## EXIT CONDITIONS

| Condition | Action |
|-----------|--------|
| COPILOT_COMPLETE in goals.md | Exit 0 — product shipped |
| Max sessions reached | Exit 1 — resume with `npx azclaude copilot .` |
| All milestones blocked | Exit 1 — needs human intervention |
| /audit fails 3 times | Exit 1 — fundamental spec mismatch |

---

## TESTING STRATEGY

Add to test-features.sh:

```
COPILOT TESTS:
  ✓ copilot.md exists in templates/commands/
  ✓ copilot.md contains decision logic
  ✓ copilot.md contains per-milestone protocol
  ✓ copilot.md references COPILOT_COMPLETE signal
  ✓ copilot.sh exists and is executable
  ✓ copilot.sh accepts project-dir and intent args
  ✓ copilot.sh creates copilot-intent.md
  ✓ copilot.sh exits 0 on COPILOT_COMPLETE
  ✓ copilot.sh exits 1 on max sessions
  ✓ plan-tracker.md exists in capabilities
  ✓ plan.md format includes Status field per milestone
  ✓ blockers.md format includes milestone + error + attempts
  ✓ CLI routes 'copilot' command to copilot.sh
```

~15 new tests. Target: 832 total (817 current + 15).

---

## BUILD ORDER — Step by Step

```
Step 1: Create templates/commands/copilot.md
        → test: command file exists with correct structure
        → commit: feat: add /copilot command for autonomous mode

Step 2: Update templates/commands/blueprint.md for structured output
        → test: /blueprint generates plan.md with milestone format
        → commit: feat: structured plan.md output for copilot

Step 3: Create templates/capabilities/shared/plan-tracker.md
        → test: capability loaded when copilot references milestones
        → commit: feat: plan-tracker capability for milestone management

Step 4: Create bin/copilot.sh
        → test: script exists, is executable, handles args
        → commit: feat: copilot runner script (Ralph loop + AZCLAUDE brain)

Step 5: Update bin/cli.js with copilot command routing
        → test: npx azclaude copilot routes correctly
        → commit: feat: CLI integration for copilot command

Step 6: Add blockers.md handling to copilot flow
        → test: blockers logged on failure, revisited after other milestones
        → commit: feat: blocker handling with skip-and-revisit strategy

Step 7: Add copilot-report.md generation
        → test: report includes decisions, agents created, deploy URLs
        → commit: feat: copilot completion report

Step 8: Update test-features.sh with copilot tests
        → test: all 15 new tests pass
        → commit: test: add copilot feature tests (832 total)

Step 9: Update README with copilot section
        → commit: docs: add /copilot and npx azclaude copilot to README

Step 10: Update DOCS.md with copilot guide
         → commit: docs: copilot usage guide in DOCS.md

Step 11: Tag v1.1.0
         → commit: release: v1.1.0 — autonomous copilot mode
```

---

## THE PROOF — How To Demo It

```bash
# Create empty directory
mkdir azcomply-demo && cd azcomply-demo
git init

# One command. Walk away.
npx azclaude copilot . "EU AI Act compliance SaaS. Free deterministic 
classification terminal as acquisition hook. Paid 30-question assessment 
with PDF report generation. FastAPI backend. Next.js frontend. Supabase 
database. Trilingual EN/FR/NL. Stripe payments."

# Come back to:
# - Full git history (one commit per milestone)
# - Deployed product
# - copilot-report.md with everything that was built
# - Evolved environment with project-specific agents and skills
```

The git log IS the proof:

```
feat: project scaffold with FastAPI + Next.js + Supabase
feat: landing page with hero and CTA
feat: free classification terminal with deterministic engine
feat: Stripe checkout integration
feat: 30-question assessment form with progress tracking
feat: PDF report generation from assessment results  
feat: trilingual support EN/FR/NL
feat: Supabase auth + user dashboard
feat: deployment config for Vercel + Railway
chore: full test suite + security scan
deploy: live at azcomply.eu
```

Every commit is machine-generated. Every test is machine-run. Every push is automatic. Zero human code.

---

## WHAT MAKES THIS MIND-BLOWING

Nobody has this combination:

| Feature | Ralph | Lovable | Replit | AZCLAUDE Copilot |
|---------|-------|---------|-------|-----------------|
| Autonomous loop | ✓ | ✗ | ✗ | ✓ |
| Memory across sessions | Git only | None | None | Goals + checkpoints + patterns |
| Self-evolving environment | ✗ | ✗ | ✗ | ✓ (agents from evidence) |
| Multi-language/service | ✓ | Next.js only | Multi but hosted | ✓ Any stack |
| Convention enforcement | ✗ | ✗ | ✗ | ✓ CLAUDE.md + patterns |
| Architecture decisions | ✗ | ✗ | ✗ | ✓ /debate with fact-check |
| You own the code | ✓ | ✗ | ✗ | ✓ |
| Zero infrastructure | ✓ | ✗ | ✗ | ✓ |
| Deploy included | ✗ | ✓ | ✓ | ✓ |

The OpenClaw creator vibe coded with raw Claude Code. You would ship a product where AZCLAUDE handled memory, conventions, testing, evolution, commits, and deployment autonomously. Same terminal. Different brain.

---

## FIRST TEST: BUILD AZCOMPLY WITH IT

The copilot feature IS the feature you need to build azcomply. And azcomply IS the proof that copilot works.

```
1. Build copilot feature (Phase 1-3, Day 1-2)
2. Run copilot on azcomply (Day 3+)
3. azcomply ships → copilot proven
4. Git history of azcomply = AZCLAUDE's marketing
5. Both products launched from one build session
```

Go.
