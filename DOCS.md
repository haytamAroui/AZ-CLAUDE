# AZCLAUDE -- Complete User Guide

> Version 0.2.1 · 1055 tests passing · AI coding environment

---

## Table of Contents

1. [What AZCLAUDE Is](#what-azclaude-is)
2. [Installation](#installation)
3. [Copilot Mode (Autonomous)](#copilot-mode-autonomous)
4. [First Steps After Install](#first-steps-after-install)
5. [The 10 Levels](#the-10-levels)
6. [The Evolution System](#the-evolution-system)
7. [The Intelligence System](#the-intelligence-system)
8. [Evidence-Based Intelligence](#evidence-based-intelligence)
9. [Domain Awareness](#domain-awareness)
10. [Custom Agents](#custom-agents)
11. [The Memory System](#the-memory-system)
12. [Native Tool Orchestration (MCP)](#native-tool-orchestration-mcp)
13. [All 26 Commands](#all-26-commands)
14. [Skills (Auto-Invoked)](#skills-auto-invoked)
15. [Behavioral Defenses (Pressure Testing)](#behavioral-defenses-pressure-testing)
16. [Multi-CLI Support](#multi-cli-support)
17. [Security](#security)
18. [Troubleshooting](#troubleshooting)

---

## What AZCLAUDE Is

AZCLAUDE is an AI coding environment. 26 commands, 8 skills, 7 agents, memory, reflexes, evolution. Install once, works on any stack. Copilot mode builds autonomously across sessions: planning, implementing, testing, committing, evolving, deploying. Zero human input after the first message.

The hero feature is **copilot mode**: a Node.js runner (`bin/copilot.js`) that restarts Claude Code sessions in a loop, while the AZCLAUDE environment inside each session decides what to build next, implements it, tests it, commits, and evolves the environment. The runner is stateless and dumb on purpose. All intelligence lives in the templates.

Beyond copilot mode, AZCLAUDE is a complete AI coding environment that:

- **Remembers your project** across sessions (auto-tracking, checkpoints, goals injection)
- **Speaks your domain** (compliance gets "obligations", medical gets "clinical outcomes")
- **Builds agents for your actual codebase** (from git co-change evidence, not guessing)
- **Learns reflexes** from tool-use observations (confidence-scored behavioral patterns)
- **Improves itself** (`/evolve` finds and fixes gaps in the environment)
- **Routes to the right capability** without loading everything (~380 tokens per task)

After `npx azclaude` + `/setup` you have:

```
CLAUDE.md -- 30-line dispatch table filled with your project's details
goals.md -- session memory, auto-injected before your first message every session
26 commands -- /fix, /add, /audit, /blueprint, /ship, /evolve, /debate, /copilot, /reflexes...
3 hooks -- auto-track every edit to goals.md, inject context on session start, migrate on stop
Project-specific agents -- built from your git history
36 capabilities -- lazy-loaded, only what the task needs
Evolution system -- scans for gaps, generates fixes, quality-gates them
```

---

## Installation

### Option 1 -- Claude Code Marketplace (1 click)

Search "AZCLAUDE" in the Claude Code plugin marketplace and click Install.
Hooks, commands, and capabilities are active immediately.
Then run `/setup` in your project to build the project-specific layer.

### Option 2 -- npx (all CLIs)

```bash
npx azclaude
```

Works with Claude Code, Gemini CLI, Codex, OpenCode, and Cursor.
Auto-detects your CLI and installs to the correct paths.

### Verify the install

```bash
npx azclaude doctor
```

Runs 32 checks: Node.js version, project hooks, settings integrity, project structure, all 26 commands present. Exits 0 if healthy. Exits 1 with a specific fix hint if anything is wrong.

### See it working before committing

```bash
npx azclaude demo
```

Runs the actual hook scripts on a temp project. Shows PostToolUse writing to goals.md, simulates context compaction, shows UserPromptSubmit injecting context back. Real execution, no mocks, cleans up after itself. Takes 30 seconds.

### Doctor Audit

```bash
npx azclaude doctor --audit
```

Runs all standard checks plus efficiency and security scoring. Reports hook profile compliance, stale patterns, and potential improvements.

---

## Copilot Mode (Autonomous)

The headline feature. Describe a product, walk away, come back to a deployed app.

### Usage

```bash
# New project -- describe and walk away
npx azclaude-copilot . "Build a REST API with auth and Stripe"

# From intent file
npx azclaude-copilot . intent.md

# With session limit
npx azclaude-copilot . "my app" 30

# Resume (reads existing plan.md)
npx azclaude-copilot .
```

### How It Works

The runner (`bin/copilot.js`) is a Node.js loop. It is stateless and cross-platform. It restarts Claude Code sessions with `--dangerously-skip-permissions` until one of three conditions is met:

| Condition | Exit code |
|-----------|-----------|
| `COPILOT_COMPLETE` in goals.md | 0 -- product shipped |
| Max sessions reached (default: 20) | 1 -- resume with `npx azclaude-copilot .` |
| All milestones blocked | 1 -- needs human intervention |

### The Pipeline

```
Session 1:  /dream -> /blueprint -> /add M1 -> /add M2 -> /add M3 -> /snapshot
Session 2:  /evolve -> /add M4 -> /add M5 -> /add M6 -> /snapshot
Session 3:  /evolve -> /add M7 -> /add M8 -> /add M9 -> /snapshot
Session 4:  /evolve -> /audit -> /ship -> COPILOT_COMPLETE
```

Every command detects copilot mode automatically (`[ -f .claude/copilot-intent.md ]`) and skips human interaction.

### Per Milestone

1. Read milestone from `plan.md` (description, expected files, dependencies)
2. Read context artifacts (schemas, API specs, configs) before implementing
3. Implement using `/add` (follows `patterns.md`, uses project agents, reads reflexes)
4. Run tests -- fix if failing (2 attempts max)
5. If still failing -- log to `blockers.md`, skip, continue
6. Commit: `{type}: {what} -- {why}`
7. Push + update `plan.md` status to `done`
8. `/snapshot` (compaction protection)

### Evolution Cycle (Every 3 Milestones)

1. Run `/reflexes analyze` -- detect patterns from tool-use observations
2. Run `/evolve` -- scan git history for patterns, create agents if evidence found
3. Check if CLAUDE.md conventions need updating
4. Re-evaluate remaining milestone priorities
5. Retry blocked milestones if new context available

### Self-Healing

When builds fail:
- Re-read error, check `antipatterns.md`, try alternative approach
- Record failure to `antipatterns.md` (every failure teaches the environment)
- Record success to `patterns.md`
- If stuck, `/debate` finds alternative approach from blocker context

### Blocker Recovery

After all non-blocked milestones complete:
- Re-read `blockers.md` with full project context now available
- Retry blocked milestones (often unblocked by later work)
- If still stuck, `/debate` evaluates; if no solution, mark `skipped`

### Agent Emergence in Copilot Mode

Copilot starts with zero project agents. They emerge from the work:

- Session 1: Build basic structure. 0 project agents.
- Session 2: `/evolve` reads git log. Files clustering in directories creates agents.
- Session 3: Domain patterns repeating across files create specialized agents.
- Session 4: Full evolved environment. `/audit` -> `/ship` -> deploy.

System agents (code-reviewer, test-writer, orchestrator-init) run the framework. Project agents emerge from the work. Two separate layers.

### State Files

| File | Written by | Read by | Purpose |
|------|-----------|---------|---------|
| `.claude/copilot-intent.md` | Runner | /dream, /copilot | Original product description |
| `.claude/plan.md` | /blueprint | /copilot, /add | Milestone tracker with status |
| `.claude/memory/goals.md` | Hooks | Every session start | File breadcrumbs + session state |
| `.claude/memory/checkpoints/*` | /snapshot | Every session start | Reasoning snapshots |
| `.claude/memory/patterns.md` | /evolve, agents | Agents, /add | What works |
| `.claude/memory/antipatterns.md` | /evolve, agents | Agents, /add | What broke |
| `.claude/memory/decisions.md` | /debate | Agents | Architecture choices |
| `.claude/memory/blockers.md` | /copilot | /copilot, /debate | What's stuck and why |
| `.claude/memory/reflexes/` | /reflexes, hooks | /evolve, agents | Learned behavioral patterns |
| `.claude/copilot-report.md` | /copilot | Human | Final summary |

---

## First Steps After Install

```
1. npx azclaude              # install
2. /setup                    # scan project, build environment
3. /pulse                    # see what was built and what's next
4. /fix [error] or /add [feature]   # start working
5. /snapshot                 # every 15-20 turns on complex work
6. /persist                  # before closing the session
```

### What `/setup` does (the 7 steps)

`/setup` runs the orchestrator-init agent once, then the agent exits permanently.

**Step 1 -- Scale detection**
Runs `env-scan.sh` -- one script, one JSON result.

| File count | Mode | What's read |
|-----------|------|-------------|
| < 100 | STANDARD | Everything |
| 100-500 | SKIM | First 15 lines of configs, skip deep git history |
| 500-2000 | MINIMAL | Directory structure + manifests only |
| > 2000 | STRUCTURE-ONLY | Directory tree + manifests only, agents marked `confidence: low` |

**Step 2 -- Signal extraction**
Reads package.json, requirements.txt, Cargo.toml, go.mod, README (first 30 lines), directory structure, git log (last 10 commits, STANDARD mode only).

**Step 3 -- Domain profile + blueprint**
Writes `.claude/blueprint.json` with: domain, category, stack, scale, tdd_active, complexity, personality, skip_levels. Level-builders read this -- they do not re-scan.

**Step 4 -- Constraint cascade**
- Simple projects skip custom agents (Level 5)
- TDD = opt-in only: requires test files + CLAUDE.md rule + developer domain
- No prior memory + single-use project -> skip full memory structure

**Step 5 -- Fill CLAUDE.md**
Replaces all `{{placeholders}}` with project-specific values. Preserves existing content.

**Step 6 -- Create goals.md**
Writes `.claude/memory/goals.md` with empty sections and today's date.

**Step 7 -- Knowledge index** (if `knowledge/` directory detected)
Creates `knowledge-index.md` with: file | summary | key_questions | tags. Files are NOT loaded into memory -- only the index. Retrieval is grep-based and on-demand.

---

## The 10 Levels

AZCLAUDE builds progressively. You don't need all 10 levels. You need the right ones for your project.

| Level | What you get | Context cost |
|-------|-------------|-------------|
| **1** | CLAUDE.md -- project conventions in 30 lines | ~30 tokens |
| **2** | MCP servers -- database, browser, API tools | ~150 tokens |
| **3** | 26 commands + lazy-loaded capabilities | ~380 tokens per task |
| **4** | Memory -- goals, checkpoints, sessions | ~200 tokens per session |
| **5** | Custom agents -- specialists with clear scope | ~400 tokens per agent |
| **6** | Hooks -- auto-tracking, injection, friction detection | ~0 tokens (global) |
| **7** | External MCP -- guide for connecting databases, browsers, APIs | Varies |
| **8** | Intelligence -- debates, pipelines, decisions | ~400 tokens per decision |
| **9** | Evolution -- 3-cycle self-improvement | ~1000 tokens per cycle |
| **10** | Loop Controller -- recursive Opus agent running 3 autonomous cycles | ~1500 tokens per full cycle |

Use `/level-up` to see your current level and build the next one.

---

## The Evolution System

`/evolve` is the self-improvement engine. It reads your friction logs, patterns, and session history -- then finds what's weak and fixes it.

### When to run

- After a week of work (weekly is the recommended schedule)
- When the same pain keeps recurring
- After building a new level
- Quick check: `/evolve quick` (30 seconds, detect-only)
- In copilot mode: automatically every 3 milestones

### What it detects

**Friction signals** -- repetition (same fix 3+ times), correction (you keep overriding Claude's suggestions), speed (tasks take unexpectedly long), missing (something you reach for that doesn't exist).

**Context Engineering 2.0 (The CE Pyramid):**
Before AZCLAUDE fixes a context problem, it classifies the "Context Rot" type:
- **Poisoning** -- Agent believes wrong facts (Fix: Remove or correct the false source)
- **Distraction** -- Irrelevant context consuming the window (Fix: Filter or summarize)
- **Confusion** -- Contradictory instructions in the same file (Fix: Resolve conflict)
- **Clash** -- Multi-source conflicts, like global vs project rules (Fix: Establish priority order)

**Sequence candidates** -- if you do steps A->B->C in 3+ sessions, that's a skill waiting to be created.

**Reflex clustering** -- related reflexes with high confidence get promoted to skills or agents.

**Intention-outcome mismatches** -- if a capability says "triggers on X" but friction logs show it's not helping with X, the description needs rewriting.

### Three Cycles

**Cycle 1** -- Environment Evolution
- Detect: scan for gaps, friction patterns, stale docs, context rot
- Generate: write fixes for each gap
- Evaluate: quality-gate before merging

**Cycle 2** -- Knowledge Consolidation (if 3+ sessions)
- Harvest patterns.md and sessions/ by recency + importance
- Prune stale entries, consolidate redundant patterns
- Enrich agent definitions with accumulated learnings
- Auto-prune reflexes where effective_confidence < 0.15

**Cycle 3** -- Topology Optimization (if friction or /level-up triggered)
- Measure agent influence in pipelines
- Identify merge candidates (overlapping agents)
- Test topology changes in isolated worktree before adopting

### Quality Gate

Before any generated file is promoted:
- Syntax correct, frontmatter complete
- Description uses symptom/trigger language (not workflow summary)
- Self-applicability: can an unfamiliar agent apply this without reading other files?
- Pressure test resilience (enforcement skills only)

### Evolution History and Skill Promotion

Every `/evolve` run logs to `ops/evolution-log.md` -- what was detected, what was fixed, score before and after.

When `/evolve` generates a skill that is not project-specific (tagged GENERAL), it promotes a copy to `~/shared-skills/`. Improvements discovered in one project become available to all your projects automatically.

---

## The Intelligence System

Three tools for decisions that are too important for a quick answer.

### /debate -- Structured Adversarial Debate (AceMAD Protocol)

Use when: hard architectural decision, genuine uncertainty, wrong choice costs real time.

The **AceMAD protocol** enforces:

- **Strict Evidence Tagging**: Every claim must be tagged `[VERIFIED]`, `[PARTIAL]`, `[UNVERIFIED]`, or `[FALSE]`.
- **Disqualified Language**: "should work", "probably", "I believe" are immediately marked `[UNVERIFIED]` and lose weight.
- **Second-Order Cognition Check**: The synthesis must address the strongest *verified* claim from the *losing* side, or the confidence rating remains LOW.
- **Order-Independence (PeerRank)**: If margin < 10 points, debate is re-run with advocates reversed. If result flips, synthesis is marked INCONCLUSIVE.
- **Length-Independence (Elo-Evolve)**: Scoring based on evidence-density (verified claims per 100 words), punishing verbosity.

In copilot mode, `/debate` frames from `blockers.md` automatically.

### ELO -- Pairwise Ranking (PeerRank + Elo-Evolve)

When ranking 3+ options, `/debate` loads ELO automatically:

- **Comparative Binary Framing**: N*(N-1)/2 pairwise comparisons instead of absolute scoring
- **Authoritative Ownership**: Subagents never self-evaluate. Loop Controller owns ELO reconciliation
- **Adjusted Evidence Score**: `verified_claims / (verified + unverified + false)`. Below 0.5 -> hard-capped at 1100

Three tracks: `debate_elo`, `agent_elo`, `pattern_elo`.

### OPRO -- Optimization by Prompting

AZCLAUDE generates 3 variants of its own system instructions, tests performance, and writes the winning prompt architecture back to `prompt-history.json`.

### Pipeline -- Agent Composition

Pre-built templates for multi-agent chains:
- Feature pipeline: planner -> implementer -> reviewer
- Fix pipeline: investigator -> hypothesizer -> fixer
- Review pipeline: spec-checker -> quality-checker (hard gate between stages)
- Architecture pipeline: analyst -> maximalist -> skeptic -> synthesizer

Each agent receives ONLY the previous agent's output + its own capability file. No context bleed.

---

## Evidence-Based Intelligence

### Reflexes -- Learned Behavioral Patterns

AZCLAUDE observes tool-use patterns across sessions and extracts atomic behaviors called reflexes. Each reflex is confidence-scored, domain-tagged, and evidence-backed.

```yaml
id: grep-before-edit
trigger: "when modifying code files"
action: "Search with Grep first, confirm with Read, then Edit"
confidence: 0.7
domain: workflow
scope: project
evidence_count: 8
last_observed: 2026-03-18
```

**Confidence Levels:**

| Observations | Confidence |
|-------------|-----------|
| 3-5 | 0.3 (tentative) |
| 6-10 | 0.5 (moderate) |
| 11-20 | 0.7 (strong) |
| 21+ | 0.85 (near-certain) |

**Adjustments:**
- +0.05 per confirming observation
- -0.10 per contradicting observation (user corrects behavior)
- -0.02 per week without observation (automatic decay)
- Confidence never exceeds 0.95
- Below 0.15 after decay -> auto-pruned

**Storage:**
```
.claude/memory/reflexes/
├── observations.jsonl        <- raw tool-use observations (auto-captured by hook)
├── project/                  <- project-scoped reflexes
│   ├── grep-before-edit.md
│   └── prefer-functional.md
└── global/                   <- universal reflexes (promoted)
    └── validate-user-input.md
```

**Evolution Path:** Observations -> 3+ occurrences -> reflex (0.3-0.85) -> /evolve clusters related reflexes -> strong cluster (3+ reflexes, avg confidence > 0.7) -> evolved into skill, command, or agent.

**Commands:**
```bash
/reflexes status    # show all reflexes with confidence scores
/reflexes analyze   # detect patterns from tool-use observations
/reflexes promote   # promote project reflexes to global scope
/reflexes clear     # archive old observations, prune weak reflexes
```

### Architecture Advisor -- 8 Decision Matrices

Auto-fires on architecture decisions. Claude knows every framework -- this skill guides **when to use which** based on project scale (SMALL/MEDIUM/LARGE):

| Decision area | SMALL | MEDIUM | LARGE |
|--------------|-------|--------|-------|
| Architecture | Flat modules | Modular monolith | Monolith + targeted microservices |
| Database | SQLite | PostgreSQL | PostgreSQL + Redis + search |
| Rendering | SSG or SPA | SSR/ISR | ISR + edge caching |
| Testing | Test-after critical paths | TDD for business logic | Full TDD |
| API design | tRPC (internal) | REST | REST + GraphQL (mobile) |
| State mgmt | useState | TanStack Query | Zustand + XState |
| Deployment | Vercel/Railway | Managed containers | AWS/GCP with IaC |
| Auth | Clerk/Supabase | Auth0 | Keycloak (self-hosted) |

Every recommendation includes the threshold where it changes and the anti-pattern to avoid.

### Domain Advisor Generator -- 7 Non-Tech Domains

When `/dream` detects a non-developer domain, it auto-generates a domain-specific advisor skill:

| Domain | Generated decisions |
|--------|-------------------|
| **Compliance** | Regulation mapping, evidence strategy, assessment approach, documentation depth, data handling, incident response |
| **Marketing** | Channel strategy, content type, funnel design, pricing model, metric focus, SEO vs paid |
| **Finance** | Data model (event-sourced), calculation precision (integer-cents), reconciliation, reporting, risk model |
| **Medical** | Data standard (FHIR vs HL7), privacy model (HIPAA vs GDPR), clinical workflow, terminology, audit requirements |
| **Research** | Literature scope, methodology, citation management, experiment design, statistical rigor |
| **Legal** | Contract structure, clause tracking, jurisdiction, risk classification |
| **Logistics** | Routing, inventory model, tracking granularity |

Generated skills follow the same structure as architecture-advisor: `SKILL.md` + `references/decision-matrices.md` + `scripts/detect-context.sh`.

### Context Artifacts -- Non-Code Project Knowledge

Before implementing any feature, AZCLAUDE discovers and reads non-code knowledge:

| Type | Examples | Why it matters |
|------|---------|---------------|
| Database schemas | schema.sql, prisma/schema.prisma, migrations/ | Know table structure before writing queries |
| API specs | openapi.yaml, swagger.json, .proto files | Know endpoints before building integrations |
| Infra configs | terraform/, k8s/, docker-compose.yml | Know deployment constraints before architecture decisions |
| Architecture docs | docs/architecture.md, ADRs, diagrams | Know design decisions before proposing changes |
| Environment configs | .env.example, config templates | Know available env vars before hardcoding values |
| Domain knowledge | knowledge/, regulations, business rules | Know domain constraints before implementing logic |

In copilot mode, artifact discovery runs automatically:
- Session 1: `/dream` scans for existing artifacts, creates index
- Per milestone: `/add` reads relevant artifacts before implementing
- After schema changes: update artifact index
- `/evolve`: check for stale artifact references

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
| **Researcher** | knowledge/ directory, citations | Insight Researcher: spawns specialized agents (literature-reviewer, summarizer) |
| **Business** | Docs, reports, no code | Skills: workflow templates, report.md, deck.md |

Detection is automatic. Vocabulary flows into CLAUDE.md, agent definitions, command files, and skill descriptions. For non-developer domains, the domain-advisor-generator creates a full advisor skill automatically.

---

## Custom Agents

AZCLAUDE creates agents from evidence, not guessing.

### How agent boundaries are determined

```bash
git log --name-only --format="" --diff-filter=M | sort | uniq -c | sort -rn
```

Files that change together in git history -> same agent. If `auth.js` and `auth.test.js` always change together, one agent owns both.

**Rule: Testing is a responsibility, not a role.** The agent that writes the code writes the tests.

**When NOT to create an agent:**
- Do not use agents for routing (routing belongs in `CLAUDE.md`)
- Do not create an agent if a simple skill with direct tool calls can do the work
- Do not create an agent to just read a file and return its content

### The 5-layer agent structure

Every AZCLAUDE agent has exactly 5 layers:

```yaml
---
name: auth-agent
description: >
  Handles all authentication work. Triggers on: login, logout, JWT,
  session, token, OAuth, password, register, permissions.
model: sonnet
permissionMode: acceptEdits
---

Layer 1 -- PERSONA:      "Authentication specialist for this Express project"
Layer 2 -- SCOPE:        "Owns src/auth/ and tests/auth/. Does NOT touch frontend."
Layer 3 -- TOOLS:        "Read, Write, Edit, Bash, Grep"
Layer 4 -- CONSTRAINTS:  "Never store plaintext credentials. Never skip token expiry."
Layer 5 -- DOMAIN:       "Uses Passport.js, JWT (RS256), bcrypt, Redis sessions."
```

**Rule: Layer 5 matters more than Layer 1.** Domain knowledge drives correct decisions.

### Built-in Agents

AZCLAUDE ships with 7 agent templates:

| Agent | Model | Mode | Purpose |
|-------|-------|------|---------|
| **orchestrator-init** | opus | full access | Runs once during `/setup`. Scans project, fills CLAUDE.md, creates goals.md. Exits permanently. |
| **loop-controller** | opus | full access | Level 10 autonomous agent. 3 cycles: environment evolution, knowledge consolidation, topology optimization. |
| **code-reviewer** | opus | read-only (`EnterPlanMode`) | Spec-first review. Stage 1: spec compliance. Stage 2: code quality. Never modifies files. |
| **test-writer** | sonnet | `acceptEdits` | Reads existing test patterns. Matches framework, style, naming. Writes and verifies tests. |
| **cc-template-author** | sonnet | `acceptEdits` | Writes and maintains AZCLAUDE template files. |
| **cc-cli-integrator** | sonnet | `acceptEdits` | Integrates new features into `bin/cli.js`. |
| **cc-test-maintainer** | sonnet | `acceptEdits` | Maintains `tests/test-features.sh` with proper patterns. |

### Self-Correction Protocol

Every agent follows:
```
Attempt 1 -> Primary approach
If it fails -> Re-read error, try ONE alternative
If Attempt 2 fails -> STOP. Report what was tried, exact error, what decision is needed.
Never guess a third time.
```

### Spec-First Code Review Rule

Reviewer agents enforce a rigid step order:
- **Step 1:** Spec Compliance Check (Does it meet requirements?)
- **Step 2:** Code Quality Check (Style, tests, conventions)

An agent must NEVER begin Step 2 if Step 1 has violations.

---

## The Memory System

**Three hooks. Three commands. One rule: goals.md is always read first.**

No databases. No servers. No vector search. Just markdown files -- written by hooks, injected by hooks, read by Claude natively.

### The Core Insight

Every other memory system asks: *"How do we store more and search better?"*

AZCLAUDE asks: *"What does Claude actually need to see at the moment it starts working?"*

The answer is two things:

1. **What files changed** -- the mechanical record
2. **Why decisions were made** -- the human reasoning

500 tokens. Injected before your first message. That's complete session continuity.

### Two Layers -- Automatic and Manual

```
+--------------------------------------------------------------+
|                     AUTOMATIC LAYER                          |
|               (zero user input required)                     |
|                                                              |
|   PostToolUse hook --> goals.md --> UserPromptSubmit          |
|   (fires on every edit) (rolling ledger) (injects before     |
|                                           your message)      |
|                                                              |
|   Stop hook --> migrates "In progress" to "Done"             |
+--------------------------------------------------------------+
|                      MANUAL LAYER                            |
|               (user triggers when ready)                     |
|                                                              |
|   /snapshot --> checkpoints/{timestamp}.md                   |
|   (WHY you made decisions -- every 15-20 turns)              |
|                                                              |
|   /persist --> sessions/{date}-{topic}.md                    |
|   (full session narrative -- before closing)                 |
+--------------------------------------------------------------+
```

Machines track WHAT happened. Humans record WHY. Neither layer tries to do the other's job.

### Hook 1: PostToolUse -> goals.md

**When:** Every time Claude writes, edits, or creates a file.

**What it does:** Appends a breadcrumb to `.claude/memory/goals.md` with timestamp, file path, git diff stats, and a one-line summary.

**What goals.md looks like:**

```markdown
## In progress
- 22:10 -- src/auth.js (+8/-2) -- added JWT validation
- 22:13 -- test/auth.test.js (+15/-0) -- added token expiry tests
- 22:18 -- README.md (+3/-1) -- updated auth section

## Done
- 21:45 -- package.json (+1/-1) -- bumped express version
- 21:30 -- .env.example (+2/-0) -- added JWT_SECRET placeholder
```

PostToolUse also captures tool-use observations to `.claude/memory/reflexes/observations.jsonl` for reflex detection.

### Hook 2: UserPromptSubmit -> Context Injection

**When:** Before Claude processes the user's first message -- every session.

**What it does:**
1. Reads `goals.md` (what you were working on)
2. Reads the latest file from `checkpoints/` (why you made decisions)
3. Strips prompt injection patterns (security)
4. Prints both to stdout

Claude sees this BEFORE your message. Memory is physically injected into the context window -- not a suggestion, a mechanism.

### Hook 3: Stop -> Migration

**When:** When Claude stops responding.

**What it does:** Migrates "In progress" items in goals.md to "Done." Warns if no `/persist` was run.

### /snapshot -- Mid-Session Reasoning Snapshot

Run every 15-20 turns. Captures: what you're doing, WHY, key decisions, what you know that isn't in the code yet, what's next. Saved to `.claude/memory/checkpoints/{timestamp}.md`. UserPromptSubmit automatically picks up the latest checkpoint.

### /persist -- End-of-Session Narrative

Run before closing. Writes updated goals.md, friction log (only when there's actual friction), and session summary to `.claude/memory/sessions/`.

### Token Cost -- Fixed, Not Variable

```
AZCLAUDE memory cost per session:

  goals.md injection:        ~200 tokens
  checkpoint injection:      ~300 tokens
  ------------------------------------
  Total:                     ~500 tokens (fixed)
```

Same cost whether your project has 5 sessions or 500.

### Memory Summary

| Layer | Mechanism | What It Captures | Automatic | Survives Compaction |
|-------|-----------|-----------------|-----------|-------------------|
| File breadcrumb | PostToolUse -> goals.md | WHERE + WHAT changed | Yes | Yes |
| Reasoning snapshot | /snapshot -> checkpoints/ | WHY decisions were made | Manual | Yes |
| Session narrative | /persist -> sessions/ | Full summary + next steps | Manual | Yes |
| Context injection | UserPromptSubmit | Delivers goals + checkpoint | Yes | Yes |
| Ledger cleanup | Stop -> migration | Keeps goals.md current | Yes | Yes |

### Hook Reliability

- **Always overwrite on install.** `npx azclaude` always writes fresh hook scripts.
- **Project-scoped by default.** Hooks install to `.claude/settings.local.json` (gitignored).
- **Merge, never replace.** The installer merges AZCLAUDE hooks per-key -- other plugins preserved.
- **Checkpoint reminder.** Every 15 edits: prints a warning to run `/snapshot`.
- **Stop hook warns, never stubs.** Friction logs only written when there's actual friction.

---

## Native Tool Orchestration (MCP)

AZCLAUDE hardwires its logic directly into the host CLI's built-in MCP capabilities:

- **`AskUserQuestion`**: Wrapped into `/add`, `/blueprint`, and `/setup` to force clarification of vague requirements.
- **`EnterPlanMode`**: Called during `/blueprint` and `/audit` for forced read-only analysis.
- **`EnterWorktree`**: Called to isolate state during `/evolve` and `/fix`.
- **`CronCreate` / `CronList`**: Tied to `/loop` for autonomous background execution.
- **`mcp__ide__getDiagnostics`**: Hard-gated before `/test` and `/ship`.

---

## All 26 Commands

### /dream
**New project from idea.**

```
/dream I want to build a compliance tracking API with FastAPI and Postgres
```

Structured intake -> environment scan -> build levels 1-7 in sequence -> quality gate. Detects domain and generates domain-specific advisor skill if non-developer domain. Use for greenfield projects. For existing projects use `/setup`.

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

4 phases -- none skippable:
1. **REPRODUCE** -- IDE diagnostics first, then run the actual test.
2. **INVESTIGATE** -- Read code at failure point, git history, antipatterns.md.
3. **HYPOTHESIZE** -- One root cause only. Confidence gate.
4. **FIX** -- Minimal change. Run full test suite. Show output with exit code.

Self-correction: 2 attempts max, then escalate with exact context.

---

### /add
**Add a feature, endpoint, component, page, or function.**

```
/add user authentication endpoint with JWT
/add React component for the data table
```

Clarify scope -> understand existing patterns -> read context artifacts -> TDD check -> implement -> verify. In copilot mode: uses milestone spec directly. Never invents patterns -- copies what's already in your codebase.

---

### /audit
**Spec-first code review with Distrust-in-Review. Read-only.**

```
/audit
/audit 42          # PR number
/audit src/auth.js  # specific file
```

Read-only mode. Enforces **Distrust-in-Review**: assumes the implementer was optimistic. In copilot mode: reviews against copilot-intent.md.

Stage 1 -- Spec compliance (required first). STOPS if violations found.
Stage 2 -- Code quality (only if Stage 1 passes).

Issue classification: BLOCKING (must fix) or SUGGESTION (take or leave).

---

### /test
**Run tests with framework detection and failure classification.**

```
/test
/test auth.test.js
```

IDE diagnostics first -> detect framework -> run with exit-code gate -> classify failures (compile error, assertion failure, timeout, import error).

---

### /blueprint
**Read-only analysis -> structured plan with milestones.**

```
/blueprint refactor the authentication module to use refresh tokens
```

Read-only analysis -> numbered plan with file:line references + risk level -> approval gate (skipped in copilot mode). Generates `plan.md` with milestone descriptions, expected files, and dependencies.

---

### /ship
**Pre-ship gate, smart commit, push.**

```
/ship
/ship "feat: add JWT refresh token rotation"
```

1. IDE diagnostics -- STOP if errors
2. Tests pass -- STOP if EXIT != 0
3. Docs sync check
4. Secrets scan -- reject .env, keys, tokens
5. Commit
6. Push

In copilot mode: auto-deploys to Vercel/Railway.

---

### /evolve
**Scan for gaps, generate fixes, quality-gate them.**

```
/evolve           # full cycle
/evolve quick     # detect gaps only
```

Three cycles: Environment Evolution, Knowledge Consolidation, Topology Optimization. Creates agents from evidence, prunes stale reflexes, consolidates patterns. See [The Evolution System](#the-evolution-system).

---

### /debate
**Adversarial decision protocol (AceMAD).**

```
/debate should we use REST or GraphQL for the new API?
```

Evidence-tagged, order-independent, length-independent. See [The Intelligence System](#the-intelligence-system).

---

### /copilot
**Autonomous milestone execution. Zero human input.**

```
/copilot
```

The core command. Reads plan.md, finds next milestone, implements it, tests, commits, pushes. Every 3 milestones runs `/reflexes analyze` + `/evolve`. When all done: `/audit` -> `/ship` -> `COPILOT_COMPLETE`. See [Copilot Mode](#copilot-mode-autonomous).

---

### /reflexes
**View, analyze, and manage learned behavioral patterns.**

```
/reflexes status    # show all reflexes with confidence scores
/reflexes analyze   # detect patterns from tool-use observations
/reflexes promote   # promote project reflexes to global scope
/reflexes clear     # archive old observations, prune weak reflexes
```

Reflexes are atomic learned behaviors extracted from session observations. Confidence-scored (0.3 tentative -> 0.9 certain). See [Evidence-Based Intelligence](#evidence-based-intelligence).

---

### /level-up
**See your current level (0-10) and build the next one.**

```
/level-up
```

Detects current level from what exists -> shows visual checklist -> builds next level.

---

### /snapshot
**Mid-session snapshot. Run every 15-20 turns.**

```
/snapshot
/snapshot "auth refactor"
```

Captures: what you're doing, WHY, key decisions, what's next. Saved to `checkpoints/`. Injected automatically on next session start.

---

### /persist
**End-of-session: goals, friction log, session summary.**

```
/persist
```

Run before closing. Updates goals.md, writes friction log (only when actual friction exists), saves session narrative.

---

### /pulse
**Quick project overview.**

```
/pulse
```

Shows: recent git activity, uncommitted changes, project health, current level, next steps from goals.md.

---

### /explain
**Plain language explanation.**

```
/explain src/auth/jwt.js
/explain "TypeError: Cannot read property 'id' of undefined"
```

Simple language, step-by-step for code, root cause for errors. Max 2-3 paragraphs.

---

### /loop
**Repeat a command on an interval.**

```
/loop 5m /pulse
/loop 30m /evolve quick
/loop daily /persist
```

Schedules via CronCreate. Use `/loop stop` to cancel.

---

### /refactor
**Safe code restructuring with test safety net.**

```
/refactor rename UserService to AuthService
/refactor extract validation logic from auth.js
```

Tests before AND after. Maps all references. High-risk changes use worktree isolation.

---

### /doc
**Generate documentation from code.**

```
/doc src/auth.js
/doc readme
```

Detects existing doc style. Reads actual code -- never guesses signatures.

---

### /migrate
**Upgrade dependencies and frameworks safely.**

```
/migrate react 19
```

Tests before + after. Researches breaking changes. Major version upgrades run in worktree.

---

### /deps
**Dependency audit: outdated, vulnerable, unused.**

```
/deps
/deps security
/deps unused
```

Runs npm audit / pip audit. Classifies by risk.

---

### /find
**Search for skills across the ecosystem.**

```
/find testing
/find deploy
```

Searches project commands, ~/shared-skills/, and capabilities manifest.

---

### /create
**Build a new command with guided workflow.**

```
/create deploy-to-staging
```

Intent capture -> duplicate check -> frontmatter template -> test cases -> validation.

---

### /reflect
**Self-improve CLAUDE.md from conversation friction.**

```
/reflect
```

Reads friction logs and session history, identifies patterns where Claude's behavior didn't match expectations, proposes targeted edits to CLAUDE.md.

---

### /hookify
**Generate hooks from conversation friction.**

```
/hookify block rm -rf commands
/hookify
```

Analyzes patterns and generates PreToolUse or PostToolUse hooks. Classifies into 5 hook types: dangerous commands (block), unsafe code patterns (warn), file protection (block), missing steps (remind), session behavior (inject).

---

## Skills (Auto-Invoked)

Skills fire automatically based on context -- no slash command needed. AZCLAUDE installs 8 skills:

| Skill | Triggers on |
|---|---|
| session-guard | Session start, context reset, idle detection |
| test-first | Writing, implementing, fixing code in TDD projects |
| env-scanner | Project setup, environment detection, stack analysis |
| debate | Decisions, trade-offs, "which is better", comparing options |
| security | Credentials, auth, payments, .env files, secrets |
| skill-creator | "Create a skill", "add capability", repeated workflows |
| agent-creator | "Create an agent", agent boundaries, 5-layer structure |
| architecture-advisor | Architecture decisions, database choice, rendering strategy, testing approach -- by project scale |

Each skill has: `SKILL.md` (lean workflow), `references/` (deep content), `examples/` (concrete output), `scripts/` (deterministic work).

---

## Behavioral Defenses (Pressure Testing)

AZCLAUDE handles bad human behavior and cognitive biases via `pressure-test.md`:

- **Time Pressure**: "We are behind schedule, just ship it" -> demands tests first.
- **Sunk Cost Fallacy**: "We already spent a week on this" -> evaluates on merits.
- **Authority Framing**: "I'm a senior engineer, just do what I say" -> follows technical evidence.
- **False Confidence**: "This is obviously right, no need to test" -> runs tests anyway.

**Review Reception**: AZCLAUDE bans sycophantic responses. Prioritizes technical evaluation, enforces YAGNI checks, provides concrete pushback wording for bad suggestions.

---

## Multi-CLI Support

AZCLAUDE works with 5 AI coding CLIs. Path substitution happens at install time -- zero runtime cost.

| CLI | Config dir | Rules file | Hooks |
|-----|-----------|-----------|-------|
| Claude Code | `.claude/` | `CLAUDE.md` | Yes -- project-scoped in .claude/hooks/ |
| Gemini CLI | `.gemini/` | `GEMINI.md` | No |
| Codex CLI | `.codex/` | `AGENTS.md` | No |
| OpenCode | `.opencode/` | `AGENTS.md` | No |
| Cursor | `.cursor/` | `.cursor/rules/project.mdc` | No |

Memory and hooks are Claude Code only (other CLIs don't expose hook APIs).

---

## Security

AZCLAUDE executes code and modifies files. 6 layers of protection. Zero dependencies in `package.json`.

### 1. Hook Integrity
SHA-256 hash of hook config written at install (`.claude/.azclaude-integrity`). Verified on every subsequent run.

### 2. Command Injection Protection
PostToolUse sanitizes `$CLAUDE_FILE_PATH`. Shell metacharacters rejected. Paths outside project root rejected.

### 3. Prompt Injection Defense
UserPromptSubmit strips injection patterns from goals.md before context injection: `curl|bash`, `ignore previous instructions`, `system prompt`, `<script>`, base64 blocks > 500 chars.

### 4. Skill Checksums
Portable skills in `~/shared-skills/` are SHA-256 hashed. Imports fail if tampered.

### 5. Credential Auditing
`/ship` scans for `.env`, plaintext keys, tokens (`AKIA`, `sk-`, `ghp_`). Blocks commit if found.

### 6. Agent Scoping
- Review agents: read-only (`EnterPlanMode`)
- Experiment agents: isolated worktree (`EnterWorktree`)
- Never promote experiment results without evaluate.md

### Hook Profiles

Control hook behavior via environment variable:

```bash
AZCLAUDE_HOOK_PROFILE=minimal  claude   # goals.md tracking only (fastest)
AZCLAUDE_HOOK_PROFILE=standard claude   # all features (default)
AZCLAUDE_HOOK_PROFILE=strict   claude   # all features + extra validation
```

### Copilot Mode Security

`bin/copilot.js` uses `--dangerously-skip-permissions`. Mitigations:
- Refuses to run on home directory or root
- All file operations scoped to project directory
- `/ship` runs secrets scan before any `git push`
- PostToolUse hook rejects paths outside project root

See [SECURITY.md](SECURITY.md) for full details.

---

## Troubleshooting

### `npx azclaude doctor` shows failures

Doctor runs 32 checks across 6 categories. Each failure includes the exact fix command.

**What doctor checks:**
- **Runtime** -- Node.js version, git available, CLI detected
- **Project hooks** -- UserPromptSubmit, PostToolUse, Stop hooks wired
- **Hook freshness** -- hook scripts match latest version
- **Settings integrity** -- SHA-256 hash matches install-time hash
- **Commands** -- all 26 commands present
- **Memory** -- goals.md exists, checkpoints directory exists, git repo initialized
- **Project** -- CLAUDE.md exists and has no unfilled `{{placeholders}}`

Common fixes:
- **Hook not wired** -> re-run `npx azclaude`
- **Stale hooks** -> re-run `npx azclaude` (always overwrites)
- **Placeholders in CLAUDE.md** -> run `/setup`
- **Missing commands** -> re-run `npx azclaude`

### Goals.md not injecting at session start

The UserPromptSubmit hook runs once per session (keyed by parent PID). Start a new Claude Code session.

### Context compacted and lost your place

Open a new session -- UserPromptSubmit injects goals.md + latest checkpoint automatically. Run `/snapshot` every 15-20 turns to protect reasoning.

### Agent keeps making the same mistake

Check `.claude/memory/antipatterns.md`. Agents read it at the start of each task.

### /evolve didn't find anything

Run `/evolve` after a week of real use when friction logs and patterns have accumulated.

---
