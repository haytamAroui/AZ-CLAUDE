# AZCLAUDE — Complete User Guide

> Version 3.13.0 · 613 tests passing · Claude Code marketplace plugin

---

## Table of Contents

1. [What AZCLAUDE Is](#what-azclaude-is)
2. [Installation](#installation)
3. [First Steps After Install](#first-steps-after-install)
4. [The Memory System](#the-memory-system)
5. [All 16 Commands](#all-16-commands)
6. [The Evolution System](#the-evolution-system)
7. [The Intelligence System](#the-intelligence-system)
8. [The 10 Levels](#the-10-levels)
9. [Custom Agents](#custom-agents)
10. [Domain Awareness](#domain-awareness)
11. [The Hook System](#the-hook-system)
12. [Multi-CLI Support](#multi-cli-support)
13. [Security](#security)
14. [Troubleshooting](#troubleshooting)

---

## What AZCLAUDE Is

AZCLAUDE is a complete AI coding environment — not a set of prompts, not a rules file, not a plugin that does one thing. It installs a system that:

- **Remembers your project** across sessions (auto-save, checkpoints, goals injection)
- **Speaks your domain** (compliance gets "obligations", medical gets "clinical outcomes")
- **Builds agents for your actual codebase** (from git co-change evidence, not guessing)
- **Improves itself** (`/evolve` finds and fixes gaps in the environment)
- **Routes to the right capability** without loading everything (~380 tokens per task)

After `npx azclaude` + `/setup` you have:

```
✓ CLAUDE.md — 30-line dispatch table filled with your project's details
✓ goals.md — session memory, auto-injected before your first message every session
✓ 16 commands — /fix, /add, /review, /plan, /ship, /evolve, /debate, /checkpoint...
✓ 3 hooks — auto-save on every edit, goals injection on session start, migration on stop
✓ Project-specific agents — built from your git history
✓ 27 capabilities — lazy-loaded, only what the task needs
✓ Evolution system — scans for gaps, generates fixes, quality-gates them
```

---

## Installation

### Option 1 — Claude Code Marketplace (1 click)

Search "AZCLAUDE" in the Claude Code plugin marketplace and click Install.
Hooks, commands, and capabilities are active immediately.
Then run `/setup` in your project to build the project-specific layer.

### Option 2 — npx (all CLIs)

```bash
npx azclaude
```

Works with Claude Code, Gemini CLI, Codex, OpenCode, and Cursor.
Auto-detects your CLI and installs to the correct paths.

### Verify the install

```bash
npx azclaude doctor
```

Runs 24 checks: Node.js version, global hooks, settings.json integrity, project structure, all 16 commands present. Exits 0 if healthy. Exits 1 with a specific fix hint if anything is wrong.

### See it working before committing

```bash
npx azclaude demo
```

Runs the actual hook scripts on a temp project. Shows PostToolUse writing to goals.md, simulates context compaction, shows UserPromptSubmit injecting context back. Real execution, no mocks, cleans up after itself. Takes 30 seconds.

---

## First Steps After Install

```
1. npx azclaude              # install
2. /setup                    # scan project, build environment
3. /status                   # see what was built and what's next
4. /fix [error] or /add [feature]   # start working
5. /checkpoint               # every 15-20 turns on complex work
6. /persist                  # before closing the session
```

### What `/setup` does (the 7 steps)

`/setup` runs the orchestrator-init agent once, then the agent exits permanently.

**Step 1 — Scale detection**
Runs `env-scan.sh` — one script, one JSON result.

| File count | Mode | What's read |
|-----------|------|-------------|
| < 100 | STANDARD | Everything |
| 100–500 | SKIM | First 15 lines of configs, skip deep git history |
| 500–2000 | MINIMAL | Directory structure + manifests only |
| > 2000 | STRUCTURE-ONLY | Directory tree + manifests only, agents marked `confidence: low` |

**Step 2 — Signal extraction**
Reads package.json, requirements.txt, Cargo.toml, go.mod, README (first 30 lines), directory structure, git log (last 10 commits, STANDARD mode only).

**Step 3 — Domain profile + blueprint**
Writes `.claude/blueprint.json` with: domain, category, stack, scale, tdd_active, complexity, personality, skip_levels. Level-builders read this — they do not re-scan.

**Step 4 — Constraint cascade**
- Simple projects → skip custom agents (Level 5)
- TDD = opt-in only: requires test files + CLAUDE.md rule + developer domain
- No prior memory + single-use project → skip full memory structure

**Step 5 — Fill CLAUDE.md**
Replaces all `{{placeholders}}` with project-specific values. Preserves existing content.

**Step 6 — Create goals.md**
Writes `.claude/memory/goals.md` with empty sections and today's date.

**Step 7 — Knowledge index** (if `knowledge/` directory detected)
Creates `knowledge-index.md` with: file | summary | key_questions | tags. Files are NOT loaded into memory — only the index. Retrieval is grep-based and on-demand.

---

## The Memory System

AZCLAUDE solves context compaction with 3 layers. Each has a different job.

### What happens when context compacts at turn 80

```
Turn 1      — Session starts. UserPromptSubmit injects goals.md + latest checkpoint.
Turn 15     — Run /checkpoint. Captures: what you're doing, WHY, key decisions, what's next.
Turn 30     — Run /checkpoint again.
Turn 80     — Claude Code compacts. Earlier context is gone.
Turn 81     — Next prompt. UserPromptSubmit fires again automatically.
             → Claude receives goals.md: which files were in flight, +N/-M stats
             → Claude receives latest checkpoint: WHY decisions were made
             → Picks up in seconds, not minutes.
End of work — Run /persist. Full summary, friction log, session narrative.
```

### Layer 1: File breadcrumb (automatic)

PostToolUse hook fires after every Write or Edit. No user action.

```
goals.md "In progress" section:
- 22:10 — src/auth.js (+8/-2) — added JWT validation
- 22:13 — test/auth.test.js (+15/-0) — added token expiry tests
- 22:18 — README.md (+3/-1) — updated auth section
```

This survives context compaction. UserPromptSubmit injects it on the next session.

### Layer 2: Reasoning snapshot (`/checkpoint`)

Run every 15–20 turns on complex work. Creates `.claude/memory/checkpoints/{date}-{HH:MM}.md`:

```markdown
## What I'm doing right now
Adding JWT refresh token rotation to the auth module.

## Why — key decisions made this session
- Used httpOnly cookies: XSS protection requirement from security audit
- Refresh token TTL 7 days: matches existing session policy in compliance doc

## What I know not yet written down
Redis token blacklist needs a TTL sweep — current impl leaks memory on logout.

## What's next
1. Write the token rotation endpoint
2. Add Redis TTL sweep
3. Update auth flow diagram in docs/
```

UserPromptSubmit injects the latest checkpoint at every session start, right after goals.md.

### Layer 3: Session narrative (`/persist`)

Run before closing a session. Writes:

- `.claude/memory/goals.md` — updated: current threads, done this session, next actions, open blockers
- `ops/observations/{date}-{slug}-friction.md` — what was hard, repeated, slow, or missing
- `.claude/memory/sessions/{date}-session.md` — 2–3 sentence summary

### Support memory files

| File | Written by | Contains |
|------|-----------|---------|
| `patterns.md` | Agents (auto) | Successful approaches |
| `antipatterns.md` | Agents (auto) | Failed approaches |
| `decisions.md` | `/debate`, agents | Decisions + reasoning |
| `codebase-map.md` | Agents (auto) | File → purpose mapping |
| `elo-rankings.json` | `/debate` + pipelines | ELO scores for arguments, agents, patterns |
| `blueprint.json` | `/setup` | Project metadata |

---

## All 16 Commands

### /dream
**New project from idea.**

```
/dream I want to build a compliance tracking API with FastAPI and Postgres
```

Structured intake → environment scan → build levels 1–7 in sequence → quality gate.
Use for greenfield projects. For existing projects use `/setup`.

---

### /setup
**Analyze existing project and build the environment.**

```
/setup
```

Scans your code, detects domain/stack/scale, fills CLAUDE.md, creates goals.md, builds project-specific agents. Runs once, then exits. See [First Steps](#first-steps-after-install).

---

### /fix
**4-phase bug fix with mandatory proof.**

```
/fix TypeError: Cannot read property 'id' of undefined at auth.js:42
```

4 phases — none skippable:
1. **REPRODUCE** — IDE diagnostics first, then run the actual test. Show exit code.
2. **INVESTIGATE** — Read code at failure point, git history, test framework config, antipatterns.md.
3. **HYPOTHESIZE** — One root cause only. Fill a checkpoint before touching code. Gate on confidence (high/medium/low).
4. **FIX** — Minimal change. Run full test suite. Show output with exit code.

Self-correction: 2 attempts max, then escalate with exact context.
Never says "should work." Shows test output or stays in progress.

---

### /add
**Add a feature, endpoint, component, page, or function.**

```
/add user authentication endpoint with JWT
/add React component for the data table
/add unit tests for the billing module
```

Steps: clarify scope → understand existing patterns → TDD check (signal-based) → implement → verify.
Never invents patterns — copies what's already in your codebase.
TDD activates only if: developer domain + test files exist + CLAUDE.md has TDD rule.

---

### /review
**Spec-first code review. Read-only.**

```
/review
/review 42          # PR number
/review src/auth.js  # specific file
```

Read-only mode (no modifications). Two stages:

**Stage 1 — Spec compliance (required first):** Find requirements → verify each in the actual code → show compliance result. STOPS here if spec violations found.

**Stage 2 — Code quality (only if Stage 1 passes):** IDE diagnostics → project conventions → security → tests → antipatterns.

Issue classification:
- **BLOCKING** — security issue, broken behavior, missing tests. Must fix before merge.
- **SUGGESTION** — style, naming, optional refactor. Take or leave.

Output: `Spec: ✓ pass / ✗ fail` · `Quality: ✓ pass / N issues` · `IDE: N errors` · `Verdict: APPROVE / REQUEST CHANGES / NEEDS SPEC FIRST`

---

### /test
**Run tests with framework detection and failure classification.**

```
/test
/test auth.test.js
/test "token expiry"
```

Steps: IDE diagnostics first → detect framework (Jest/Vitest/Mocha/pytest/unittest/cargo test/go test) → run with exit-code gate → classify failures.

Failure types:
- Compile/type error → fix IDE diagnostics first
- Assertion failure → /fix protocol
- Timeout → check async patterns
- Import error → check module paths

---

### /plan
**Read-only analysis and approval gate for risky changes.**

```
/plan refactor the authentication module to use refresh tokens
/plan migrate from REST to GraphQL
```

Triggers when: 4+ files, schema/API changes, high reversal cost, or you explicitly want approval before code.
Does NOT trigger on "add X" or "implement X" — those go to /add directly.

Read-only analysis → numbered plan with file:line references + risk level → approval gate: waits for your "yes" before creating any tasks.

---

### /ship
**Pre-ship gate, smart commit, push to GitHub.**

```
/ship
/ship "feat: add JWT refresh token rotation"
```

Sequence:
1. IDE diagnostics — STOP if errors
2. Tests pass — STOP if EXIT ≠ 0
3. Docs sync check — README version matches package.json? Command count correct? Stale content?
4. Secrets scan — reject .env, plaintext keys, tokens
5. Commit — auto-generate message `{type}: {what} — {why}`
6. Push — `git push` or sets up remote if first push

---

### /evolve
**Scan your environment for gaps, generate fixes, quality-gate them.**

```
/evolve           # full cycle (~3-6k tokens, ~3-6 min)
/evolve quick     # detect gaps only (~500 tokens, ~30 sec)
```

Three cycles — each opt-in based on what's detected:

**Cycle 1** — Environment Evolution
- Detect: scan for gaps, friction patterns, stale docs, context rot
- Generate: write fixes for each gap
- Evaluate: quality-gate before merging

**Cycle 2** — Knowledge Consolidation (if 3+ sessions)
- Harvest patterns.md and sessions/ by recency + importance
- Prune stale entries, consolidate redundant patterns
- Enrich agent definitions with accumulated learnings

**Cycle 3** — Topology Optimization (if friction or /level-up triggered)
- Measure agent influence in pipelines
- Identify merge candidates (overlapping agents)
- Test topology changes in isolated worktree before adopting

Rules: max 5 improvements/cycle · max 3 iterations/component · never delete user files.

---

### /debate
**Adversarial decision protocol for hard choices.**

```
/debate should we use REST or GraphQL for the new API?
/debate PostgreSQL vs MongoDB for user session storage
```

Use when a decision is genuinely uncertain and the wrong choice costs real time.
Do NOT use for routine decisions — Claude's direct answer is faster.

**AceMAD Protocol:**
1. Define the decision as a binary or small option set
2. MAXIMALIST argues strongest case FOR (≤10 arguments, evidence-tagged)
3. SKEPTIC argues strongest case AGAINST (must address best verified argument)
4. FACT CHECK — every claim tagged [VERIFIED] / [PARTIAL] / [UNVERIFIED] / [FALSE]
5. Synthesis — winner + confidence (0-100), second-order check (address strongest losing claim), order-independence check (if margin < 10, reverse and re-run)
6. Length-independence — score on evidence-density, not word count
7. Record to decisions.md: question, options, winner, confidence, deciding claim, dissent

Truth wins, not volume. All claims must be verified or they lose weight.

---

### /level-up
**See your current level (0–10) and build the next one.**

```
/level-up
```

Detects current level from what exists in your project → shows visual checklist → builds the next level.

| Level | What gets built |
|-------|----------------|
| 1 | CLAUDE.md rules file |
| 2 | MCP servers (database, browser, APIs) |
| 3 | 16 commands + lazy-loaded capabilities |
| 4 | Memory system (goals, checkpoints, sessions) |
| 5 | Custom agents from git evidence |
| 6 | Hooks (auto-save, injection, friction detection) |
| 7 | External MCP (cross-project memory, monitoring) |
| 8+ | Intelligence (debates, pipelines, experiments) |
| 9 | Evolution cycles (self-improvement) |
| 10 | Loop controller (autonomous evolution) |

At Level 7 → use `/evolve` instead (environment is built, now improve it).

---

### /checkpoint
**Mid-session snapshot. Run every 15–20 turns on complex work.**

```
/checkpoint
/checkpoint "auth refactor"
```

Writes `.claude/memory/checkpoints/{date}-{HH:MM}.md` capturing:
- What you're doing right now
- WHY — key decisions made this session
- What you know that isn't written down yet
- What's next (top 3)
- Open risks

UserPromptSubmit automatically injects the latest checkpoint on the next session start. This is what survives context compaction — not just which files changed, but why.

---

### /persist
**End-of-session: goals, friction log, session summary.**

```
/persist
```

Run before closing. Writes:
1. Updated `goals.md` — current threads, done this session, next actions, open blockers
2. `ops/observations/{date}-{slug}-friction.md` — what was hard, repeated, slow, missing
3. `.claude/memory/sessions/{date}-session.md` — 2–3 sentence narrative

Never skip even for short sessions. "None" entries confirm what's working.

---

### /status
**Quick project overview.**

```
/status
```

Shows: recent git activity (last 5 commits), uncommitted changes, project health (IDE diagnostics, dependencies, config), what changed (git diff --stat), current level, next 2–3 steps from goals.md.

---

### /explain
**Plain language explanation. Zero jargon.**

```
/explain src/auth/jwt.js
/explain "TypeError: Cannot read property 'id' of undefined"
/explain what is a JWT refresh token
```

Simple language, step-by-step for code, root cause for errors, real-world analogy for concepts. Max 2–3 paragraphs unless you ask for more.

---

### /loop
**Repeat a command on an interval.**

```
/loop 5m /status
/loop 30m /evolve quick
/loop daily /persist
```

Schedules via CronCreate. Runs immediately once so you see it working.

| Interval | Cron |
|----------|------|
| 5m | `*/5 * * * *` |
| 30m | `*/30 * * * *` |
| 1h | `0 * * * *` |
| daily | `0 9 * * *` |
| weekly | `0 9 * * 1` |

Use `/loop stop` to cancel.

---

## The Evolution System

`/evolve` is the self-improvement engine. It reads your friction logs, patterns, and session history — then finds what's weak and fixes it.

### When to run

- After a week of work (weekly is the recommended schedule)
- When the same pain keeps recurring
- After building a new level
- Quick check: `/evolve quick` (30 seconds, detect-only)

### What it detects

**Friction signals** — repetition (same fix 3+ times), correction (you keep overriding Claude's suggestions), speed (tasks take unexpectedly long), missing (something you reach for that doesn't exist).

**Context rot types:**
- **Poisoning** — wrong facts in capability files
- **Distraction** — irrelevant context loading unnecessarily
- **Confusion** — contradictory instructions in the same file
- **Clash** — multi-source conflicts (global vs project rules)

**Sequence candidates** — if you do steps A→B→C in 3+ sessions, that's a skill waiting to be created.

**Intention-outcome mismatches** — if a capability says "triggers on X" but friction logs show it's not helping with X, the description needs rewriting.

### What the quality gate checks

Before any generated file is promoted:
- Syntax correct, frontmatter complete
- Description uses symptom/trigger language (not workflow summary)
- Self-applicability: can an unfamiliar agent apply this without reading other files?
- Pressure test resilience (enforcement skills only)

### Scheduling

At the end of `/evolve`, you'll be offered a weekly CronCreate schedule.
Recommended: Sunday 9am `0 9 * * 0`.

---

## The Intelligence System

Three tools for decisions that are too important for a quick answer.

### /debate — Structured adversarial debate

Use when: hard architectural decision, genuine uncertainty, wrong choice costs real time.

The AceMAD protocol forces every claim to be evidence-tagged. Claims with "should", "probably", or "I believe" are disqualified. The winner is decided by evidence quality, not argument volume.

Confidence is low if ≥30% of a side's claims are unverified — regardless of score.

Output goes to `decisions.md` with the deciding claim and the strongest counter-argument.

### ELO — Pairwise ranking

When ranking 3+ options, `/debate` loads ELO automatically. Pairwise comparison (which is better: A or B?) reduces statistical noise by 4.5× compared to absolute ratings.

Rankings persist in `.claude/memory/elo-rankings.json` across sessions. Three tracks:
- `debate_elo` — which approaches win debates
- `agent_elo` — which agents' outputs are accepted without revision
- `pattern_elo` — which patterns succeed when applied

### Pipeline — Agent composition

Load `intelligence/pipeline.md` when you need 3+ agents chaining output to input.

**Pre-built templates:**
- Feature pipeline: planner → implementer → reviewer
- Fix pipeline: investigator → hypothesizer → fixer
- Review pipeline: spec-checker → quality-checker (hard gate between stages)
- Architecture pipeline: analyst → maximalist → skeptic → synthesizer

Each agent receives ONLY the previous agent's output + its own capability file. No context bleed. Agent 3 never inherits Agent 1's 50,000-token conversation.

---

## The 10 Levels

AZCLAUDE builds progressively. You don't need all 10 levels. You need the right ones for your project.

| Level | What you get | Context cost |
|-------|-------------|-------------|
| **1** | CLAUDE.md — project conventions in 30 lines | ~30 tokens |
| **2** | MCP servers — database, browser, API tools | ~150 tokens |
| **3** | 16 commands + lazy-loaded capabilities | ~380 tokens per task |
| **4** | Memory — goals, checkpoints, sessions | ~200 tokens per session |
| **5** | Custom agents — specialists with clear scope | ~400 tokens per agent |
| **6** | Hooks — auto-save, injection, friction detection | ~0 tokens (global) |
| **7** | External MCP — cross-project memory, monitoring | Varies |
| **8** | Intelligence — debates, pipelines, decisions | ~400 tokens per decision |
| **9** | Evolution — 3-cycle self-improvement | ~1000 tokens per cycle |
| **10** | Loop controller — autonomous weekly evolution | ~1500 tokens per full cycle |

Use `/level-up` to see your current level and build the next one.

---

## Custom Agents

AZCLAUDE creates agents from evidence, not guessing.

### How agent boundaries are determined

```bash
git log --name-only --format="" --diff-filter=M | sort | uniq -c | sort -rn
```

Files that change together in git history → same agent. If `auth.js` and `auth.test.js` always change together, one agent owns both.

3 agents with clear boundaries > 6 overlapping agents.

### The 5-layer agent structure

Every AZCLAUDE agent has exactly 5 layers. Missing one = incomplete agent.

```yaml
---
name: auth-agent
description: >
  Handles all authentication work. Triggers on: login, logout, JWT,
  session, token, OAuth, password, register, permissions.
model: sonnet
permissionMode: acceptEdits
---

Layer 1 — PERSONA:      "Authentication specialist for this Express project"
Layer 2 — SCOPE:        "Owns src/auth/ and tests/auth/. Does NOT touch frontend."
Layer 3 — TOOLS:        "Read, Write, Edit, Bash, Grep"
Layer 4 — CONSTRAINTS:  "Never store plaintext credentials. Never skip token expiry."
Layer 5 — DOMAIN:       "Uses Passport.js, JWT (RS256), bcrypt, Redis sessions."
```

Knowledge > Persona. Positive directives > negative instructions.

### What agents learn automatically

After every task:
- Succeeded → appends approach to `patterns.md`
- Failed → appends what didn't work to `antipatterns.md`
- Made a decision → appends to `decisions.md`
- Changed significant files → appends to `codebase-map.md`

Next run, the agent reads these files. It doesn't repeat the same mistake twice.

### Framework collision handling

If your project uses langgraph, crewai, autogen, or langchain:
All Claude Code agents are prefixed `cc-` (e.g., `cc-frontend.md`, `cc-backend.md`)
Each gets a comment: `# Claude Code Development Agent (not a {framework} application agent)`

This prevents naming collision between "the agent helping you code" and "the agent that IS the product."

---

## Domain Awareness

AZCLAUDE detects your project domain from signals in your codebase and adapts everything.

| Domain | Detection signal | What changes |
|--------|-----------------|-------------|
| **Developer** | package.json, Cargo.toml, requirements.txt | TDD opt-in, code conventions, test framework detection |
| **Compliance** | EU AI Act, GDPR, obligations in README | Vocabulary: obligations, conformity review, article-level traceability, audit trail |
| **Medical/Clinical** | clinical, patient, FHIR in README | Vocabulary: patient, clinical findings, outcomes. FHIR-aware agent naming |
| **Finance/Trading** | positions, exposure, P&L, trading in README | Vocabulary: positions, risk decisions, exposure. Full code stack |
| **Writer** | No code files, prose/markdown content | Skills: write-chapter.md, edit-draft.md. No MCP, no agents |
| **Researcher** | knowledge/ directory, citations | Skills: literature-review, retrieval patterns. Agents: role specialists |
| **Business** | Docs, reports, no code | Skills: workflow templates, report.md, deck.md |

Detection is automatic. Vocabulary flows into CLAUDE.md, agent definitions, command files, and skill descriptions.

---

## The Hook System

Three hooks run silently in the background. All pure Node.js — no bash required. Cross-platform: Windows PowerShell, CMD, Git Bash, macOS, Linux.

### UserPromptSubmit hook
**When**: Every session's first prompt
**What**:
1. Checks for prompt injection patterns (strips `curl | bash`, `ignore previous instructions`, `you are now`)
2. Reads `.claude/memory/goals.md`
3. If "In progress" entries remain from last session → warns: `⚠ PREVIOUS SESSION INTERRUPTED`
4. Injects goals.md: `--- ACTIVE GOALS --- ... --- END GOALS ---`
5. Finds latest checkpoint in `.claude/memory/checkpoints/`
6. Injects checkpoint: `--- LAST CHECKPOINT ({filename}) --- ... --- END CHECKPOINT ---`

**Result**: Claude reads both before your first message. Zero re-explanation needed.

### PostToolUse hook
**When**: After every Write or Edit operation
**What**:
1. Reads file path from tool input (stdin JSON)
2. Skips: goals.md (prevent loop), node_modules/, .git/, files outside project
3. Runs `git diff HEAD --numstat -- {file}` to get +N/-M
4. Extracts first meaningful line of new_string as change summary
5. Deduplicates: removes old entry for same file, inserts new entry at top

**Result in goals.md**:
```
## In progress
- 22:10 — src/auth.js (+8/-2) — added JWT validation
- 22:13 — test/auth.test.js (+15/-0) — added token expiry tests
```

### Stop hook
**When**: End of every session
**What**:
1. Reads goals.md "In progress" section
2. Moves all entries to "Done this session"
3. Updates the `Updated:` date field
4. If /persist was not run → writes a friction stub to ops/observations/
5. Warns if session ended without /persist

---

## Multi-CLI Support

AZCLAUDE works with 5 AI coding CLIs. Path substitution happens at install time — zero runtime cost.

| CLI | Config dir | Rules file | Hooks |
|-----|-----------|-----------|-------|
| Claude Code | `.claude/` | `CLAUDE.md` | Yes — global hooks in ~/.claude/hooks/ |
| Gemini CLI | `.gemini/` | `GEMINI.md` | No |
| Codex CLI | `.codex/` | `AGENTS.md` | No |
| OpenCode | `.opencode/` | `AGENTS.md` | No |
| Cursor | `.cursor/` | `.cursor/rules/project.mdc` | No |

All capabilities, commands, and memory work the same way on every CLI.
Memory and hooks are Claude Code only (other CLIs don't expose hook APIs).

---

## Security

AZCLAUDE executes code and modifies files. 6 layers of protection.

**1. Hook Integrity**
SHA-256 hash of `~/.claude/settings.json` hooks written at install. Verified on every subsequent run. If hooks are modified, doctor reports the mismatch.

**2. Command Injection Protection**
Formatter hooks sanitize `$CLAUDE_FILE_PATH`. Shell metacharacters (`; | & $ ( )`) are rejected before any formatter runs.

**3. Indirect Prompt Injection Defense**
UserPromptSubmit hook strips injection patterns from goals.md before injecting into context:
- `curl | bash` patterns
- `ignore previous instructions`
- `you are now`
- `system prompt`

**4. Skill Checksums**
Portable skills in `~/shared-skills/` are SHA-256 hashed. Imports fail loudly if tampered with.

**5. Credential Auditing**
`/ship` scans staged files for `.env`, plaintext keys, tokens, secrets. Blocks the commit if found.

**6. Agent Scoping**
- Review agents: read-only (`EnterPlanMode`, no Write permissions)
- Experiment agents: isolated git worktree (`EnterWorktree`) — changes discarded if experiment fails
- Never promote an experiment result without going through evaluate.md

---

## Troubleshooting

### `npx azclaude doctor` shows failures

Doctor exits 1 with a specific fix hint for each failure. Follow the hint exactly.

Common fixes:
- **Node.js not in PATH** → install Node.js ≥16 from nodejs.org
- **Hook not wired** → re-run `npx azclaude` to upgrade
- **Placeholders in CLAUDE.md** → run `/setup` to fill them
- **Missing commands** → re-run `npx azclaude`

### Goals.md not injecting at session start

The UserPromptSubmit hook runs once per session (keyed by parent PID). If you're in the same session, it won't re-run. Start a new Claude Code session.

Check that `~/.claude/settings.json` has the `UserPromptSubmit` hook entry — doctor checks this.

### PostToolUse not writing to goals.md

goals.md must exist (created by `/setup`). The hook exits silently if goals.md is not found.

If goals.md exists but entries aren't appearing: check that `Write` and `Edit` are in the PostToolUse matcher in `~/.claude/settings.json`.

### /setup didn't detect my domain

The domain detection reads README, package.json, and directory structure. Add domain keywords to your README (e.g., "compliance", "EU AI Act", "clinical", "trading") and re-run `/setup`.

### Context compacted and I lost my place

This is expected. Open a new session — UserPromptSubmit will inject goals.md + latest checkpoint automatically. If you ran `/checkpoint` before compaction, Claude has your current reasoning. If not, it has the file trail from PostToolUse.

Next time: run `/checkpoint` every 15–20 turns.

### Agent keeps making the same mistake

Check `.claude/memory/antipatterns.md` — it may not exist yet (created after first task failure). Agents read it at the start of each task. If it doesn't exist yet, tell the agent directly what the antipattern is — it will append it.

### /evolve didn't find anything

If you just installed and haven't run many sessions, there's nothing to evolve yet. Run `/evolve` after a week of real use when friction logs and patterns have accumulated.

---

## What Makes It Different

| | AZCLAUDE | Generic prompts | Superpowers |
|---|---|---|---|
| Remembers between sessions | ✅ | ❌ | ❌ |
| Auto-saves while you work | ✅ | ❌ | ❌ |
| Domain vocabulary | ✅ | ❌ | ❌ |
| Agents from git evidence | ✅ | ❌ | ❌ |
| Self-improves | ✅ | ❌ | ❌ |
| Lazy-loaded context | ✅ (~380 tokens) | ❌ (~21k) | ❌ |
| Evidence-based decisions | ✅ (AceMAD + ELO) | ❌ | ❌ |
| 10-level progression | ✅ | ❌ | ❌ |
| Works on 5 CLIs | ✅ | Varies | ✅ |
| Hard process gates | Flexible (opt-in) | ❌ | ✅ (mandatory) |

---

## License

MIT — [haytamAroui](https://github.com/haytamAroui)
