# AZCLAUDE — Complete User Guide

> Version 3.13.0 · 691 tests passing · Claude Code marketplace plugin

---

## Table of Contents

1. [What AZCLAUDE Is](#what-azclaude-is)
2. [Installation](#installation)
3. [First Steps After Install](#first-steps-after-install)
4. [The 10 Levels](#the-10-levels)
5. [The Evolution System](#the-evolution-system)
6. [The Intelligence System](#the-intelligence-system)
7. [Domain Awareness](#domain-awareness)
8. [Custom Agents](#custom-agents)
9. [The Memory System](#the-memory-system)
10. [Native Tool Orchestration (MCP)](#native-tool-orchestration-mcp)
11. [The Hook System](#the-hook-system)
12. [All 22 Commands](#all-22-commands)
13. [Behavioral Defenses (Pressure Testing)](#behavioral-defenses-pressure-testing)
14. [Multi-CLI Support](#multi-cli-support)
15. [Security](#security)
16. [Troubleshooting](#troubleshooting)

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
✓ 22 commands — /fix, /add, /review, /plan, /ship, /evolve, /debate, /checkpoint...
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

Runs 32 checks: Node.js version, global hooks, settings.json integrity, project structure, all 22 commands present. Exits 0 if healthy. Exits 1 with a specific fix hint if anything is wrong.

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

## The 10 Levels

AZCLAUDE builds progressively. You don't need all 10 levels. You need the right ones for your project.

| Level | What you get | Context cost |
|-------|-------------|-------------|
| **1** | CLAUDE.md — project conventions in 30 lines | ~30 tokens |
| **2** | MCP servers — database, browser, API tools | ~150 tokens |
| **3** | 22 commands + lazy-loaded capabilities | ~380 tokens per task |
| **4** | Memory — goals, checkpoints, sessions | ~200 tokens per session |
| **5** | Custom agents — specialists with clear scope | ~400 tokens per agent |
| **6** | Hooks — auto-save, injection, friction detection | ~0 tokens (global) |
| **7** | External MCP — cross-project memory, monitoring | Varies |
| **8** | Intelligence — debates, pipelines, decisions | ~400 tokens per decision |
| **9** | Evolution — 3-cycle self-improvement | ~1000 tokens per cycle |
| **10** | **Loop Controller** — A recursive Opus agent that runs 3 autonomous cycles in the background (Environment Evolution, Knowledge Consolidation, Topology Optimization). It actively prunes dead agents, enriches the knowledge index, and re-derives architecture. | ~1500 tokens per full cycle |

Use `/level-up` to see your current level and build the next one.

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

**Context Engineering 2.0 (The CE Pyramid):**
Before AZCLAUDE fixes a context problem, it classifies the "Context Rot" type using the CE Pyramid:
- **Poisoning** — Agent believes wrong facts (Fix: Remove or correct the false source)
- **Distraction** — Irrelevant context consuming the window (Fix: Filter or summarize)
- **Confusion** — Contradictory instructions in the same file (Fix: Resolve conflict)
- **Clash** — Multi-source conflicts, like global vs project rules (Fix: Establish priority order)

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

### /debate — Structured adversarial debate (AceMAD Protocol)

Use when: hard architectural decision, genuine uncertainty, wrong choice costs real time.

The **AceMAD protocol** goes far beyond simple prompting. It enforces:

- **Strict Evidence Tagging**: Every claim must be tagged `[VERIFIED]`, `[PARTIAL]`, `[UNVERIFIED]`, or `[FALSE]`.
- **Disqualified Language**: Any argument containing "should work", "probably", or "I believe" is immediately marked `[UNVERIFIED]` and loses weight. Truth wins, not volume.
- **Second-Order Cognition Check**: The synthesized conclusion *must* explicitly address the strongest *verified* claim from the *losing* side, or the confidence rating remains LOW.
- **Order-Independence (PeerRank)**: Position bias has a known 0.39 statistical correlation. If the margin of victory is < 10 points, AZCLAUDE automatically re-runs the debate with the advocates in *reversed order*. If the result flips, the synthesis is marked INCONCLUSIVE to prevent hallucinated confidence.
- **Length-Independence (Elo-Evolve)**: Scoring is strictly based on *evidence-density* (verified claims per 100 words), mathematically punishing verbosity and hallucinated length.

Output goes to `decisions.md` with the deciding claim and the strongest counter-argument.

### ELO — Pairwise ranking (PeerRank + Elo-Evolve)

When ranking 3+ options, `/debate` loads ELO automatically. This uses mathematically modeled precision:

- **Comparative Binary Framing**: Uses continuous N×(N-1)/2 pairwise comparisons ("Is A better than B?") rather than absolute scoring ("Rate A from 1-10"). This definitively reduces statistical noise from σ_abs=35.65 to σ_comp=7.85.
- **Authoritative Ownership**: Subagents are never allowed to self-evaluate. The Loop Controller owns the authoritative ELO score reconciliation, increasing reliability from r=0.538 to r=0.905.
- **Adjusted Evidence Score Formula**: Calculated as `verified_claims / (verified + unverified + false)`. If this ratio falls below 0.5, the ELO score is mathematically hard-capped at 1100 regardless of how many "wins" the candidate has. Volume cannot defeat evidence.

Rankings persist in `.claude/memory/elo-rankings.json` across sessions. Three tracks:
- `debate_elo` — tracks which specific architectural approaches win debates
- `agent_elo` — updated after pipelines; winner is the agent whose output was accepted without revision
- `pattern_elo` — succeeded if the approach worked, failed if `/evolve` re-derivation was later triggered

### OPRO — Optimization by Prompting

AZCLAUDE generates 3 variants of its own system instructions (Variant A, B, C), tests their performance, and writes the winning prompt architecture back to its internal `prompt-history.json`. This makes the system self-optimizing over time.

### Pipeline — Agent composition

Load `intelligence/pipeline.md` when you need 3+ agents chaining output to input.

**Pre-built templates:**
- Feature pipeline: planner → implementer → reviewer
- Fix pipeline: investigator → hypothesizer → fixer
- Review pipeline: spec-checker → quality-checker (hard gate between stages)
- Architecture pipeline: analyst → maximalist → skeptic → synthesizer

Each agent receives ONLY the previous agent's output + its own capability file. No context bleed. Agent 3 never inherits Agent 1's 50,000-token conversation.

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
| **Researcher** | knowledge/ directory, citations | **Insight Researcher**: Spawns specialized agents (literature-reviewer, summarizer). Uses retrieval patterns rather than code execution. |
| **Business** | Docs, reports, no code | Skills: workflow templates, report.md, deck.md |

Detection is automatic. Vocabulary flows into CLAUDE.md, agent definitions, command files, and skill descriptions.

---

## Custom Agents

AZCLAUDE creates agents from evidence, not guessing.

### How agent boundaries are determined

```bash
git log --name-only --format="" --diff-filter=M | sort | uniq -c | sort -rn
```

Files that change together in git history → same agent. If `auth.js` and `auth.test.js` always change together, one agent owns both.

**Rule: Testing is a responsibility, not a role.** The agent that writes the code writes the tests. AZCLAUDE explicitly forbids creating a separate "tester agent" unless tests are genuinely independent.

**When NOT to create an agent:**
- Do not use agents for routing (routing belongs in `CLAUDE.md`).
- Do not create an agent if a simple skill with direct tool calls can do the work.
- Do not create an agent to just read a file and return its content.

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

**Rule: Layer 5 matters more than Layer 1.** Domain knowledge drives correct decisions; the persona just drives the tone.

**Rule: Use Positive Directives, not negative instructions.** Instead of "Don't generate vague output" (which activates the negative behavior in the model's mind), AZCLAUDE enforces positive framing: "Every output includes file:line reference and actual test result."

### CE 2.0: Self-Correction Behavior

Every AZCLAUDE agent is programmed with a strict self-correction protocol before it is allowed to escalate to the user:
```
Attempt 1 → Primary approach
If it fails → Re-read error, identify what was wrong, try ONE alternative
If Attempt 2 fails → STOP. Report what was tried, the exact error, and what decision is needed.
Never guess a third time.
```

### Spec-First Code Review Rule
Reviewer agents enforce a rigid, non-negotiable step order:
- **Step 1:** Spec Compliance Check (Does it meet requirements?)
- **Step 2:** Code Quality Check (Style, tests, conventions)
**Rule:** An agent must NEVER begin Step 2 if Step 1 has violations. Reviewing the quality of code that doesn't solve the problem is a waste of tokens.

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
## What I'm doing now
Implementing JWT refresh token rotation in src/auth.js

## WHY — decisions made this session
- Chose RS256 over HS256: asymmetric keys safer for multi-service
- Redis for token blacklist: O(1) lookup vs DB query

## What I know that isn't written yet
- Old refresh flow in auth.js:180 has a race condition — fix next task

## What's next
1. Add token blacklist check to middleware
2. Write expiry tests
3. Update API docs

## Open risks
- Redis connection timeout not handled — could leak tokens
```

UserPromptSubmit injects the latest checkpoint on the next session. This is what survives compaction — not just which files changed, but why.

### Layer 3: Session narrative (`/persist`)

Run at end of session. Writes `.claude/memory/sessions/{date}-session.md` — 2–3 sentences covering what was accomplished, what was left open, and any key decisions. Read by `/evolve` Cycle 2 (knowledge consolidation).

---

## Native Tool Orchestration (MCP)

AZCLAUDE doesn't just use text prompts; it hardwires its logic directly into the host CLI's built-in MCP (Model Context Protocol) capabilities:

- **`AskUserQuestion`**: Wrapped into `/add`, `/plan`, and `/setup` to force the AI to halt and clarify vague requirements instead of hallucinating.
- **`EnterPlanMode`**: Called natively during `/plan` and `/review` for forced read-only analysis.
- **`EnterWorktree`**: Called natively to safely isolate state during `/evolve` and `/fix`.
- **`CronCreate` / `CronList`**: Natively tied to the `/loop` command for actual autonomous background execution.
- **`mcp__ide__getDiagnostics`**: Hard-gated before `/test` and `/ship` to ensure no syntax errors exist before running bash commands.

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
- 22:18 — README.md (+3/-1) — updated auth section
```

### Stop hook
**When**: Session ends
**What**: Reads goals.md "In progress" entries → moves them to "Done this session" — clears stale state for the next session.

---

## All 22 Commands

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
**Spec-first code review with Distrust-in-Review. Read-only.**

```
/review
/review 42          # PR number
/review src/auth.js  # specific file
```

Read-only mode (no modifications). This command enforces **Distrust-in-Review**: it assumes the implementer was optimistic or incomplete. The reviewer *must* independently verify success by reading actual file diffs or running tests, rather than taking the implementer's word for it.

**Review Reception:** AZCLAUDE explicitly bans sycophantic "You're absolutely right!" responses. It prioritizes technical evaluation, enforces YAGNI checks on user feedback, and provides concrete pushback wording for bad suggestions.

Two stages:

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
| 3 | 22 commands + lazy-loaded capabilities |
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
2. `ops/observations/{date}-{slug}-friction.md` — only written when there's actual friction (something hard, repeated, slow, or missing). Skipped for smooth sessions.
3. `.claude/memory/sessions/{date}-session.md` — 2–3 sentence narrative

Never skip even for short sessions.

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

### /refactor
**Safe code restructuring with test safety net.**
```
/refactor rename UserService to AuthService
/refactor extract validation logic from auth.js
```
Tests before AND after. Maps all references. High-risk changes use worktree isolation.
Never changes behavior — only structure.

---

### /doc
**Generate documentation from code.**
```
/doc src/auth.js
/doc readme
```
Detects existing doc style (JSDoc, docstrings, Go doc). Reads actual code — never guesses signatures. Verifies examples run.

---

### /migrate
**Upgrade dependencies and frameworks safely.**
```
/migrate react 19
/migrate update all packages
```
Tests before + after. Researches breaking changes via WebSearch. Major version upgrades run in worktree.

---

### /deps
**Dependency audit: outdated, vulnerable, unused.**
```
/deps
/deps security
/deps unused
```
Runs npm audit / pip audit. Classifies by risk (patch/minor/major). Detects unused packages.

---

### /find
**Search for skills across the ecosystem.**
```
/find testing
/find deploy
```
Searches project commands, ~/shared-skills/, and capabilities manifest. Suggests /create if nothing matches.

---

### /create
**Build a new command with guided workflow.**
```
/create deploy-to-staging
/create weekly-report
```
Intent capture → duplicate check → frontmatter template → test cases → validation. Ensures 5+ trigger phrases for reliable invocation.

---

## Behavioral Defenses (Pressure Testing)

AZCLAUDE is trained to handle bad human behavior and cognitive biases via the `pressure-test.md` capability. It intercepts scenarios where the user applies negative framing:

- **Time Pressure**: Rushing tasks ("We are behind schedule, just ship it").
- **Sunk Cost Fallacy**: Continuing bad architecture ("We already spent a week on this").
- **Authority Framing**: Pulling rank ("I'm a senior engineer, just do what I say").
- **False Confidence**: "This is obviously right, no need to test."

In these scenarios, AZCLAUDE will politely but firmly halt, re-frame the risk, and suggest the technically correct path (e.g., demanding tests or root-cause analysis) rather than blindly executing dangerous commands.

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
Formatter hooks sanitize `$CLAUDE_FILE_PATH`. Shell metacharacters (` ; | & $ ( ) < > `) are rejected before any formatter runs, preventing malicious paths from executing arbitrary commands.

**3. Indirect Prompt Injection Defense**
UserPromptSubmit hook strips injection patterns from goals.md before injecting into context:
- `curl.*|.*bash` or `wget.*|.*sh` patterns
- `ignore previous instructions`
- `you are now` or `system prompt`
- `<script>` or HTML injection attempts
- Base64-encoded blocks longer than 500 characters

**4. Skill Checksums**
Portable skills in `~/shared-skills/` are SHA-256 hashed. Imports fail loudly if tampered with.

**5. Credential Auditing**
`/ship` scans staged files for `.env`, plaintext keys, tokens, secrets (`AKIA`, `sk-`, `ghp_`, etc.). Blocks the commit if found.
**Audit Trail:** If an agent must handle credentials, it is required to log the action to `.claude/memory/security-events.md`.

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

