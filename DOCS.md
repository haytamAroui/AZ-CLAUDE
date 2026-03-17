# AZCLAUDE — Complete User Guide

> Version 1.0.0 · 805 tests passing · Claude Code marketplace plugin

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
9. [The Memory System](#the-memory-system) (includes all 3 hooks, commands, flow diagrams, token cost)
10. [Native Tool Orchestration (MCP)](#native-tool-orchestration-mcp)
11. [All 22 Commands](#all-22-commands)
12. [Behavioral Defenses (Pressure Testing)](#behavioral-defenses-pressure-testing)
13. [Multi-CLI Support](#multi-cli-support)
14. [Security](#security)
15. [Troubleshooting](#troubleshooting)

---

## What AZCLAUDE Is

AZCLAUDE is a complete AI coding environment — not a set of prompts, not a rules file, not a plugin that does one thing. It installs a system that:

- **Remembers your project** across sessions (auto-tracking, checkpoints, goals injection)
- **Speaks your domain** (compliance gets "obligations", medical gets "clinical outcomes")
- **Builds agents for your actual codebase** (from git co-change evidence, not guessing)
- **Improves itself** (`/evolve` finds and fixes gaps in the environment)
- **Routes to the right capability** without loading everything (~380 tokens per task)

After `npx azclaude` + `/setup` you have:

```
✓ CLAUDE.md — 30-line dispatch table filled with your project's details
✓ goals.md — session memory, auto-injected before your first message every session
✓ 22 commands — /fix, /add, /review, /plan, /ship, /evolve, /debate, /checkpoint...
✓ 3 hooks — auto-track every edit to goals.md, inject context on session start, migrate on stop
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
| **6** | Hooks — auto-tracking, injection, friction detection | ~0 tokens (global) |
| **7** | External MCP — guide for connecting databases, browsers, APIs | Varies |
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

### Evolution History and Skill Promotion

Every `/evolve` run logs its results to `ops/evolution-log.md` — what was detected, what was fixed, score before and after. This creates a traceable audit trail of self-improvement over time.

When `/evolve` generates a skill or pattern that is **not project-specific** (tagged GENERAL), it promotes a copy to `~/shared-skills/`. This means improvements discovered in one project become available to all your projects automatically. Project-specific skills stay local.

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

### Built-in Agents

AZCLAUDE ships with 4 agent templates. Two handle infrastructure, two handle daily work.

| Agent | Model | Mode | Purpose |
|-------|-------|------|---------|
| **orchestrator-init** | opus | full access | Runs once during `/setup`. Scans project, fills CLAUDE.md, creates goals.md, builds agents. Exits permanently after. |
| **loop-controller** | opus | full access | Level 10 autonomous agent. Runs 3 cycles: environment evolution, knowledge consolidation, topology optimization. |
| **code-reviewer** | opus | read-only (`EnterPlanMode`) | Spec-first review. Stage 1: spec compliance. Stage 2: code quality. Never modifies files. Issues classified as BLOCKING or SUGGESTION. |
| **test-writer** | sonnet | `acceptEdits` | Reads existing test patterns in your project. Matches framework, style, naming. Writes tests, runs them, verifies they pass. All 5 agent layers present. |

The code-reviewer is deliberately read-only — it uses `EnterPlanMode` so it cannot accidentally modify files during review. The test-writer uses Sonnet for cost efficiency on high-volume test generation.

---

## The Memory System

**Three hooks. Three commands. One rule: goals.md is always read first.**

No databases. No servers. No vector search. Just markdown files — written by hooks, injected by hooks, read by Claude natively.

### The Core Insight

Every other memory system asks: *"How do we store more and search better?"*

AZCLAUDE asks: *"What does Claude actually need to see at the moment it starts working?"*

The answer is two things:

1. **What files changed** — the mechanical record
2. **Why decisions were made** — the human reasoning

500 tokens. Injected before your first message. That's complete session continuity.

### Two Layers — Automatic and Manual

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTOMATIC LAYER                           │
│              (zero user input required)                      │
│                                                             │
│   PostToolUse hook  ──→  goals.md  ──→  UserPromptSubmit   │
│   (fires on every edit)  (rolling ledger)  (injects before │
│                                            your message)    │
│                                                             │
│   Stop hook  ──→  migrates "In progress" to "Done"         │
├─────────────────────────────────────────────────────────────┤
│                     MANUAL LAYER                            │
│              (user triggers when ready)                      │
│                                                             │
│   /checkpoint  ──→  checkpoints/{timestamp}.md              │
│   (WHY you made decisions — every 15-20 turns)              │
│                                                             │
│   /persist  ──→  sessions/{date}-{topic}.md                 │
│   (full session narrative — before closing)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Machines track WHAT happened. Humans record WHY. Neither layer tries to do the other's job.

### Hook 1: PostToolUse → goals.md

**When:** Every time Claude writes, edits, or creates a file.

**What it does:** Appends a breadcrumb to `.claude/memory/goals.md` with timestamp, file path, git diff stats, and a one-line summary.

**What goals.md looks like:**

```markdown
## In progress
- 22:10 — src/auth.js (+8/-2) — added JWT validation
- 22:13 — test/auth.test.js (+15/-0) — added token expiry tests
- 22:18 — README.md (+3/-1) — updated auth section

## Done
- 21:45 — package.json (+1/-1) — bumped express version
- 21:30 — .env.example (+2/-0) — added JWT_SECRET placeholder
```

**Why it matters:** Every edit leaves a trace. The user does nothing. No file change is ever forgotten, even after context compaction wipes the conversation history.

### Hook 2: UserPromptSubmit → Context Injection

**When:** Before Claude processes the user's first message — every session, every time.

**What it does:**
1. Reads `goals.md` (what you were working on)
2. Reads the latest file from `checkpoints/` (why you made decisions)
3. Prints both to stdout

**What Claude sees before your message:**

```
--- ACTIVE GOALS ---
## In progress
- 22:10 — src/auth.js (+8/-2) — added JWT validation
- 22:13 — test/auth.test.js (+15/-0) — added token expiry tests
- 22:18 — README.md (+3/-1) — updated auth section
--- END GOALS ---

--- LAST CHECKPOINT (2026-03-14-22:10.md) ---
## What I'm doing now
Implementing JWT refresh token rotation in src/auth.js

## WHY — decisions made this session
- Chose RS256 over HS256: asymmetric keys safer for multi-service setup
- Redis for token blacklist: O(1) lookup vs DB query

## What I know that isn't written yet
Old refresh flow in auth.js:180 has a race condition — fix next task

## What's next
1. Add token blacklist check to middleware
2. Write expiry tests
3. Update API docs
--- END CHECKPOINT ---
```

**Why it matters:** This is the critical architectural decision. Claude doesn't choose to read memory. Memory is physically injected into the context window before Claude sees your prompt. The difference between "tell Claude to read memory" and "inject memory before Claude reads anything" is the difference between a suggestion and a mechanism. Suggestions get ignored under pressure. Mechanisms can't be.

### Hook 3: Stop → Migration

**When:** When Claude stops responding.

**What it does:** Migrates "In progress" items in goals.md to "Done."

**Why it matters:** Goals.md stays clean. Active work on top. Completed work archived below. It's a rolling ledger, not an unbounded log. Token cost stays fixed regardless of how many sessions you've run.

### /checkpoint — Mid-Session Reasoning Snapshot

**When to use:** Every 15-20 turns, or before a major decision.

**What it captures:** What you're doing, WHY, key decisions, what you know that isn't in the code yet, and what's next.

**Where it saves:** `.claude/memory/checkpoints/{timestamp}.md`

**Why it matters:** No automatic system can capture reasoning. PostToolUse knows you edited `auth.js` — it doesn't know you chose RS256 over HS256 because asymmetric keys are safer for multi-service architectures. Only you know that. /checkpoint captures it so Claude knows it next session.

The UserPromptSubmit hook automatically picks up the LATEST checkpoint and injects it alongside goals.md.

### /persist — End-of-Session Narrative

**When to use:** Before closing a session.

**What it captures:** Full session summary — what was accomplished, what friction was encountered, what decisions were made, what's next.

**Where it saves:** `.claude/memory/sessions/{date}-{topic}.md`

**Why it matters:** Session narratives feed the evolution loop. When you run `/evolve`, the evolution module reads past sessions to detect patterns and antipatterns across your project's history. A pattern that appears in 3 sessions gets promoted to `patterns.md`. A mistake that recurs gets logged to `antipatterns.md`. Sessions are the raw material for self-improvement.

### The Full Flow — Turn by Turn

```
SESSION 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Turn 1:    User types "fix the auth bug"
           ┌─ UserPromptSubmit fires
           │  Reads goals.md → (empty first time)
           │  Reads checkpoints/ → (none yet)
           └─ Claude sees: empty context + user's message

Turn 5:    Claude edits src/auth.js
           ┌─ PostToolUse fires
           └─ goals.md gets: "14:05 — src/auth.js (+12/-3) — fixed race condition"

Turn 12:   Claude edits test/auth.test.js
           ┌─ PostToolUse fires
           └─ goals.md gets another line

Turn 15:   User runs /checkpoint
           ┌─ Captures: "Fixing auth. Chose RS256 over HS256.
           │  Race condition in auth.js:180 still needs fix."
           └─ Saved to checkpoints/2026-03-16-14:15.md

Turn 30:   User runs /checkpoint again
           └─ New snapshot with updated progress

Turn 80:   ⚠️  CONTEXT COMPACTION — earlier turns are gone

Turn 81:   User types next prompt
           ┌─ UserPromptSubmit fires
           │  Reads goals.md → has ALL edit history from turns 5-79
           │  Reads latest checkpoint → has reasoning from turn 30
           └─ Claude sees both BEFORE the user's message
              → picks up in seconds, not minutes

End:       User runs /persist
           ┌─ Full narrative saved to sessions/
           └─ Stop hook migrates In progress → Done


SESSION 2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Turn 1:    User types "continue the auth work"
           ┌─ UserPromptSubmit fires
           │  Reads goals.md → has Session 1's edit history
           │  Reads latest checkpoint → has Session 1's reasoning
           └─ Claude knows:
              • Which files were touched and what changed
              • Why RS256 was chosen over HS256
              • That auth.js:180 still needs the race condition fix
              → zero re-explanation needed
```

### How Memory Connects to the Rest of AZCLAUDE

```
                         AUTOMATIC
                            │
        PostToolUse ────→ goals.md ────→ UserPromptSubmit ────→ Claude
        (every edit)     (rolling        (every session         (sees it
                          ledger)         start)                 first)

                          MANUAL
                            │
        /checkpoint ────→ checkpoints/ ──→ UserPromptSubmit ────→ Claude
        (every 15-20      (reasoning       (picks latest
         turns)            snapshots)       automatically)

        /persist ───────→ sessions/ ─────→ /evolve ─────→ patterns.md
        (end of session)  (narratives)     (reads sessions,   antipatterns.md
                                            extracts what      decisions.md
                                            worked/failed)

                         AGENTS READ
                            │
        patterns.md ──────────────────→ Agent instructions (what works)
        antipatterns.md ──────────────→ Agent instructions (what broke)
        decisions.md ─────────────────→ Agent instructions (what was decided)
```

The automatic layer feeds the session start.
The manual layer feeds both the session start AND the evolution loop.
The evolution loop feeds the agents.
The agents produce better work.
Better work produces better sessions.
Better sessions feed better evolution.

**The system improves itself through its own memory.**

### Why Markdown — Not a Database

```
Database approach (Claude-Mem, Ruflo):

  Hook fires → HTTP request to worker service →
  Worker queries SQLite → FTS5 search → ChromaDB vector lookup →
  Format results → Return via MCP protocol → Inject into context

  Failure points: worker not running, port occupied, SQLite locked,
  ChromaDB not installed, MCP protocol error, HTTP timeout
  Token cost: ~30,000 tokens protocol overhead before results

  Dependencies: Node.js + Bun + uv + SQLite + ChromaDB + MCP server


Markdown approach (AZCLAUDE):

  Hook fires → read goals.md → print to stdout → Claude sees it

  Failure points: file doesn't exist
  Token cost: ~500 tokens total (goals + checkpoint)

  Dependencies: Node.js (which Claude Code already requires)
```

Claude Code's native operation is reading files. It does this thousands of times per session. Reading goals.md is the same operation Claude already does constantly — zero new infrastructure, zero new protocols, zero new failure modes.

### Token Cost — Fixed, Not Variable

```
AZCLAUDE memory cost per session:

  goals.md injection:        ~200 tokens
  checkpoint injection:      ~300 tokens
  ─────────────────────────────────────
  Total:                     ~500 tokens (fixed)


Claude-Mem memory cost per session:

  MCP protocol overhead:     ~30,000 tokens
  Search query + results:    variable
  Vector search overhead:    variable
  ─────────────────────────────────────
  Total:                     30,000+ tokens (grows with history)
```

AZCLAUDE's memory cost is the same whether your project has 5 sessions or 500 — because goals.md is a rolling ledger (Stop hook archives completed items) and only the latest checkpoint is injected.

### Memory Summary

| Layer | Mechanism | What It Captures | Automatic | Survives Compaction |
|-------|-----------|-----------------|-----------|-------------------|
| File breadcrumb | PostToolUse → goals.md | WHERE you were, WHAT changed | Yes | Yes |
| Reasoning snapshot | /checkpoint → checkpoints/ | WHY decisions were made | Manual | Yes |
| Session narrative | /persist → sessions/ | Full summary, friction, next steps | Manual | Yes |
| Context injection | UserPromptSubmit | Delivers goals + checkpoint to Claude | Yes | Yes |
| Ledger cleanup | Stop → migration | Keeps goals.md current | Yes | Yes |

Five mechanisms. Three files. Zero databases. Zero servers. Zero dependencies.

**Pure Claude Code. Fully orchestrated.**

### Hook Reliability

Three design decisions keep the hooks dependable:

- **Always overwrite on install.** Running `npx azclaude` always writes fresh hook scripts, even if the hooks directory already exists. This fixes stale hooks left behind by older versions — the most common support issue before this change.
- **Merge, never replace.** The installer merges AZCLAUDE hooks into `~/.claude/settings.json` per-key — it never replaces the entire hooks object. Other plugins' hooks are preserved.
- **Project-scoped side effects.** Hooks only create directories and write files when they detect an AZCLAUDE project (goals.md exists). Non-AZCLAUDE directories are never modified.
- **Checkpoint reminder.** PostToolUse counts edits per session. Every 15 edits, it prints: `⚠ 15 edits — run /checkpoint before context compaction loses your reasoning`. This prevents forgotten checkpoints on long sessions.
- **Stop hook warns, never stubs.** The Stop hook migrates "In progress" → "Done" and warns if no `/persist` was run. It does NOT create empty friction log files. Friction logs are only written when there's actual friction to record — empty stubs were noise that polluted `ops/observations/`.

---

## Native Tool Orchestration (MCP)

AZCLAUDE doesn't just use text prompts; it hardwires its logic directly into the host CLI's built-in MCP (Model Context Protocol) capabilities:

- **`AskUserQuestion`**: Wrapped into `/add`, `/plan`, and `/setup` to force the AI to halt and clarify vague requirements instead of hallucinating.
- **`EnterPlanMode`**: Called natively during `/plan` and `/review` for forced read-only analysis.
- **`EnterWorktree`**: Called natively to safely isolate state during `/evolve` and `/fix`.
- **`CronCreate` / `CronList`**: Natively tied to the `/loop` command for actual autonomous background execution.
- **`mcp__ide__getDiagnostics`**: Hard-gated before `/test` and `/ship` to ensure no syntax errors exist before running bash commands.

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
| 6 | Hooks (auto-tracking, injection, friction detection) |
| 7 | External MCP (guide for connecting databases, browsers, APIs) |
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
UserPromptSubmit hook strips injection patterns from goals.md and checkpoint files before injecting into context:
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

Doctor runs 32 checks across 6 categories and exits 1 with a specific fix hint for each failure.

**What doctor checks:**
- **Runtime** — Node.js version, git available, CLI detected
- **Global hooks** — UserPromptSubmit, PostToolUse, Stop hooks wired in `~/.claude/settings.json`
- **Hook freshness** — hook scripts match the latest version shipped with AZCLAUDE (catches stale hooks)
- **Settings integrity** — SHA-256 hash of settings.json matches install-time hash
- **Commands** — all 22 commands present (dynamically derived from `COMMANDS` array in cli.js)
- **Memory** — goals.md exists, checkpoints directory exists, git repo initialized
- **Project** — CLAUDE.md exists and has no unfilled `{{placeholders}}`

Each failure includes the exact fix command. For example: `FIX: re-run 'npx azclaude' to refresh hook scripts`.

Common fixes:
- **Node.js not in PATH** → install Node.js ≥16 from nodejs.org
- **Hook not wired** → re-run `npx azclaude` to upgrade
- **Stale hooks** → re-run `npx azclaude` (always overwrites with fresh scripts)
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

