# AZCLAUDE -- Complete User Guide

> Version 0.4.18 · 1357 tests passing · AI coding environment

---

## Table of Contents

1. [What AZCLAUDE Is](#what-azclaude-is)
2. [Installation](#installation)
3. [Copilot Mode (Autonomous)](#copilot-mode-autonomous)
4. [First Steps After Install](#first-steps-after-install)
5. [The 10 Levels](#the-10-levels)
6. [The Evolution System](#the-evolution-system)
7. [The Self-Improving Loop](#the-self-improving-loop)
8. [The Intelligence System](#the-intelligence-system)
9. [Evidence-Based Intelligence](#evidence-based-intelligence)
10. [Domain Awareness](#domain-awareness)
11. [Custom Agents](#custom-agents)
12. [The Memory System](#the-memory-system)
13. [Native Tool Orchestration (MCP)](#native-tool-orchestration-mcp)
14. [Intelligent Dispatch](#intelligent-dispatch)
14b. [Spec-Driven Development](#spec-driven-development)
15. [All 33 Commands](#all-33-commands)
16. [Skills (Auto-Invoked)](#skills-auto-invoked)
17. [Behavioral Defenses (Pressure Testing)](#behavioral-defenses-pressure-testing)
18. [Multi-CLI Support](#multi-cli-support)
19. [Security](#security)
20. [Troubleshooting](#troubleshooting)

---

## What AZCLAUDE Is

AZCLAUDE is an AI coding environment. 33 commands, 8 skills, 15 agents, memory, reflexes, evolution. Install once, works on any stack. Copilot mode builds autonomously across sessions using a three-tier intelligent team (orchestrator → problem-architect → milestone-builder). Zero human input after the first message.

The hero feature is **copilot mode**: a Node.js runner (`bin/copilot.js`) that restarts Claude Code sessions in a loop, while the AZCLAUDE environment inside each session decides what to build next, implements it, tests it, commits, and evolves the environment. The runner is stateless and dumb on purpose. All intelligence lives in the templates.

Beyond copilot mode, AZCLAUDE is a complete AI coding environment that:

- **Remembers your project** across sessions (auto-tracking, checkpoints, goals injection)
- **Speaks your domain** (compliance gets "obligations", medical gets "clinical outcomes")
- **Builds agents for your actual codebase** (from git co-change evidence, not guessing)
- **Learns reflexes** from tool-use observations (confidence-scored behavioral patterns)
- **Improves itself** (`/evolve` finds and fixes gaps, `/reflect` fixes its own rules, `/reflexes` learns your patterns)
- **Routes to the right capability** without loading everything (~380 tokens per task)
- **Protects you from yourself** (pre-write secret blocking, pre-ship security scan, prompt injection defense)

After `npx azclaude-copilot` you have:

```
CLAUDE.md -- 30-line dispatch table filled with your project's details
goals.md -- session memory, auto-injected before your first message every session
33 commands -- /fix, /add, /audit, /blueprint, /ship, /evolve, /sentinel, /copilot, /spec, /constitute...
4 hooks -- block secrets before writes, track every edit, inject context on start, migrate on stop
15 agents -- orchestrator team + spec-reviewer + constitution-guard + framework agents
37 capabilities -- lazy-loaded, only what the task needs
Evolution system -- scans for gaps, generates fixes, quality-gates them
Self-improving loop -- /reflect + /reflexes + /evolve find and fix their own blind spots
```

---

## Installation

### Step 1 — Run in your project directory

```bash
npx azclaude-copilot@latest
```

No global install required. `npx` fetches the latest version and installs AZCLAUDE into your project's `.claude/` directory.

### Step 2 — Run in your project directory

```bash
npx azclaude-copilot@latest
```

One command, no flags. Auto-detects the right mode:
- **First time** → full install (33 commands, 8 skills, 15 agents, 4 hooks, memory, reflexes, evolution)
- **Already installed, older version** → auto-upgrades all templates to latest
- **Already up to date** → verifies, no overwrites

Run the same command again after any AZCLAUDE release — it handles the upgrade automatically.

### Verify the install

```bash
azclaude-copilot doctor
```

Runs 32 checks: Node.js version, project hooks, settings integrity, project structure, all 33 commands present. Exits 0 if healthy. Exits 1 with a specific fix hint if anything is wrong.

### Doctor Audit

```bash
azclaude-copilot doctor --audit
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

> **Note:** If no `copilot-intent.md` exists, `/copilot` will prompt whether to run `/dream` first (recommended) or infer from CLAUDE.md (faster but less precise).

### How It Works

The runner (`bin/copilot.js`) is a Node.js loop. It is stateless and cross-platform. It restarts Claude Code sessions with `--dangerously-skip-permissions` until one of three conditions is met:

| Condition | Exit code |
|-----------|-----------|
| `COPILOT_COMPLETE` in goals.md | 0 -- product shipped |
| Max sessions reached (default: 20) | 1 -- resume with `npx azclaude-copilot .` |
| All milestones blocked | 1 -- needs human intervention |

### The Intelligent Pipeline (v0.4+)

```
Session 0:  /constitute (ground rules) -> /spec (requirements) -> /clarify (open questions)
                   -> /blueprint (spec-reviewer gates quality) -> plan.md with traced milestones
Session 1:  /copilot -> constitution-guard validates each milestone -> M1, M2, M3 -> /snapshot
Session 2:  /evolve (new agents unblock plan) -> M4+M5 (parallel) -> M6 -> /analyze -> /snapshot
Session 3:  /evolve -> M7, M8, M9 -> /snapshot
Session 4:  /evolve -> /analyze (ghost check) -> /audit -> /ship -> COPILOT_COMPLETE
```

Every command detects copilot mode automatically (`[ -f .claude/copilot-intent.md ]`) and skips human interaction.

### Three-Tier Intelligent Copilot

| Tier | Agent | Role | Never does |
|------|-------|------|------------|
| 1 | **Orchestrator** | Reads plan.md, selects milestone wave, dispatches, monitors, triggers /evolve | Writes code |
| 2 | **Problem-Architect** | Analyzes each milestone → Team Spec (agents, skills, files-written, pre-conditions, risks, complexity) | Implements |
| 3 | **Milestone-Builder** | Pre-reads, implements, verifies, self-corrects, commits, reports back | Decides what to build |

**Key mechanism — Files Written:** Problem-Architect returns the exact list of files each milestone will touch. Orchestrator checks for overlap before parallel dispatch → prevents silent file collision.

### Per Milestone

1. **Orchestrator** selects pending milestone where all dependencies are done
2. **Problem-Architect** analyzes it → returns Team Spec
3. **Orchestrator** dispatches **Milestone-Builder** with fully packaged context (skills to load, files to pre-read, patterns, antipatterns, fix attempt budget)
4. **Milestone-Builder** pre-reads all files, implements, runs tests
5. Fix if failing (2 attempts SIMPLE/MEDIUM, 3 for COMPLEX)
6. Budget exhausted → log to `blockers.md`, orchestrator moves to next milestone
7. Commit + push + update plan.md status → `done`

### Evolution Cycle (Every 3 Milestones)

1. Run `/reflexes analyze` -- detect patterns from tool-use observations
2. Run `/evolve` -- scan git history for patterns, create agents if evidence found
3. **Orchestrator re-evaluates plan.md** -- checks which blocked milestones can now be unblocked with new agents
4. Check if CLAUDE.md conventions need updating
5. Retry newly-unblocked milestones with full project context

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
1. npx azclaude-copilot@latest            # install or upgrade — auto-detected
2. /setup                          # scan project, build environment
3. /pulse                          # see what was built and what's next
4. /fix [error] or /add [feature]  # start working
5. /snapshot                       # every 15-20 turns on complex work
6. /persist                        # before closing the session
```

After a few sessions, run the self-improving loop:
```
7. /reflect                        # fix stale/missing rules in CLAUDE.md
8. /reflexes analyze               # extract learned patterns from observations
9. /evolve                         # scan for gaps, create agents from evidence
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

**Step 8 -- Generate project-specific skills (minimum 2)**
Every project gets at least a creation skill (how to add the main type of content) and a validation skill (how to check conventions). Stack-specific defaults apply automatically.

**Step 9 -- Generate project agents (if 10+ files)**
Runs co-change analysis. If < 5 commits, spawns problem-architect to recommend agents from file structure instead.

---

## The 10 Levels

AZCLAUDE builds progressively. You don't need all 10 levels. You need the right ones for your project.

| Level | What you get | Context cost |
|-------|-------------|-------------|
| **1** | CLAUDE.md -- project conventions in 30 lines | ~30 tokens |
| **2** | MCP servers -- database, browser, API tools | ~150 tokens |
| **3** | 33 commands + lazy-loaded capabilities | ~380 tokens per task |
| **4** | Memory -- goals, checkpoints, sessions | ~200 tokens per session |
| **5** | Custom agents -- specialists with clear scope | ~400 tokens per agent |
| **6** | Hooks -- auto-tracking, injection, secret blocking | ~0 tokens (global) |
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

**Cycle 2** -- Knowledge Consolidation (if 2+ sessions since last run)
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

Example log entry:
```
| 2026-03-21 | 42/100 | 68/100 | +26 | plan.md rebuilt (M12–M18 active); i18n-sync skill created; manifest updated |
```

When `/evolve` generates a skill that is not project-specific (tagged GENERAL), it promotes a copy to `~/shared-skills/`. Improvements discovered in one project become available to all your projects automatically.

---

## The Self-Improving Loop

AZCLAUDE doesn't just remember — it learns and corrects itself. Three commands form a loop that runs every few sessions. Each targets a different layer:

```
/reflect   →  Fixes what Claude KNOWS (CLAUDE.md rules)
/reflexes  →  Fixes how Claude BEHAVES (tool-use patterns)
/evolve    →  Fixes what Claude HAS (skills, agents, capabilities)
```

### /reflect — Self-Improving CLAUDE.md

Reads friction logs, session history, and the current CLAUDE.md. Finds rules that are wrong, missing, stale, vague, or contradicting each other. Proposes exact edits — one finding per change. You approve, CLAUDE.md gets smarter.

**What it finds:**

| Category | Signal | Example |
|----------|--------|---------|
| Missing rule | Same mistake repeated | Always forgetting to run tests before committing |
| Vague rule | Rule exists but doesn't prevent the mistake | "Write good tests" doesn't say which framework |
| Dead rule | References something that no longer exists | Points to a deleted file or old convention |
| Contradicting rules | Two rules conflict | "Be concise" vs "Explain thoroughly" |
| Missing routing | Task type has no dispatch entry | i18n is the most frequent task but has no `/translate` command |

**Output format:** Numbered proposals. You choose which to apply.
```
Reflection found 3 improvements:

1. MISSING RULE — No test framework specified
   Evidence: 3 sessions used Jest, 1 used Vitest by mistake
   Proposed: Add "Use Jest. Run npm test before commits."

2. DEAD RULE — Rule 4 references shared-skills/ which was removed
   Proposed: Remove rule 4.

Apply which? (all / 1,2 / none)
```

### /reflexes — Learned Behavioral Patterns

The `post-tool-use.js` hook silently records every tool sequence to `observations.jsonl`. `/reflexes` turns that raw data into behavioral rules with confidence scores.

```bash
/reflexes status    # show all reflexes with confidence scores + observation health
/reflexes analyze   # detect patterns from observations (3+ occurrences = reflex)
/reflexes promote   # promote project reflex to global scope (≥ 0.8 confidence)
/reflexes clear     # archive old observations, prune weak reflexes (< 0.3)
```

**What it detects automatically:**

| Pattern type | Example |
|-------------|---------|
| Tool sequences | Always run Grep → Read → Edit in that order |
| File co-access | `vertex_client.py` and `assess_paid.py` always opened together |
| Error → fix pairs | Same error always fixed the same way |
| Naming patterns | All new components follow `Cc{Name}.tsx` |

**Real example from a production project (78 observations, 3 sessions):**
```
i18n-all-6-locales     (0.85) → always edit all 6 locale files atomically
page-tsx-read-before   (0.75) → re-read page.tsx before touching — changes too often
next-config-build-verify (0.70) → run tsc --noEmit after next.config.ts edits
vertex-assess-co-edit  (0.60) → vertex_client.py and assess_paid.py always coupled
```

High-confidence reflexes (≥ 0.7) feed into `/add` behavior automatically. In `/copilot` mode, `/reflexes analyze` runs every 3 milestones.

### How the Loop Works Together

```
Session 1-3:  Build real features. Hooks silently observe everything.

After session 3:
  /reflect   → "STALE DATA: design tokens in CLAUDE.md don't match codebase"
               "MISSING ROUTE: i18n is most frequent task, no command for it"
               → Apply → CLAUDE.md fixed

  /reflexes  → "78 observations collected. 4 patterns detected."
               → Creates 4 reflex files with confidence scores
               → i18n-all-6-locales at 0.85 → qualifies for global promotion

  /evolve    → "plan.md frozen at 9/9 done — actually 18 milestones active"
               "No i18n-sync skill despite 6-locale changes in every commit"
               → Score: 42/100 → 68/100
               → Creates i18n-sync skill, rebuilds plan.md, updates goals.md
```

All of this from evidence. No human diagnosis required.

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
id: i18n-all-6-locales
trigger: "any src/messages/*.json file is edited"
action: "edit all 6 locale files (en/fr/nl/de/it/es) in the same operation — never fewer"
confidence: 0.85
domain: workflow
scope: project
evidence_count: 6
last_observed: 2026-03-21
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
│   ├── i18n-all-6-locales.md
│   └── page-tsx-read-before-edit.md
└── global/                   <- universal reflexes (promoted when seen in 2+ projects at ≥ 0.8)
    └── grep-before-edit.md
```

**Evolution Path:** Observations → 3+ occurrences → reflex (0.3-0.85) → `/evolve` clusters related reflexes → strong cluster (3+ reflexes, avg confidence > 0.7) → evolved into skill, command, or agent.

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

### Intelligent Dispatch (v0.4+)

`shared/intelligent-dispatch.md` is a universal pre-flight protocol loaded before any non-trivial build, fix, refactor, audit, or plan task. Every command that used to jump straight to doing now runs pre-analysis first.

**When it runs:** Task touches 3+ files, crosses module boundaries, involves a structural change, or this is the first time working in this area.

**What it does:**
1. Spawns `problem-architect` (if installed) with task description + current state
2. Receives Team Spec back: skills to load, files to pre-read, pre-conditions, risks, Files Written
3. Checks pre-conditions — blocks if any unmet
4. If `Structural Decision: YES` → triggers `/debate` before proceeding
5. Follows milestone-builder implementation protocol for the actual work

**Commands wired to intelligent-dispatch:**

| Command | What changes |
|---------|-------------|
| `/add` | Pre-reads right files + loads skills before Phase 2 (replaces blind grep) |
| `/fix` | Scopes the bug after reproduction — identifies all affected files, relevant antipatterns |
| `/dream` | Deep scans existing codebase before generating vision |
| `/audit` | Injects decisions.md + patterns.md + antipatterns.md as review checklist |
| `/refactor` | Maps full dependency graph before manual scan |
| `/ship` | Risk scan as Step 0 — unmet pre-conditions block the push |
| `/blueprint` | Annotates each plan.md milestone with Team Spec after generation |
| `/evolve` | Orchestrator re-evaluates plan.md after new agents/skills created |
| `/setup` | Problem-architect recommends agents when < 5 git commits exist |

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

### Skills first. Agents only when needed.

Claude Code is already capable. The question is never "what agent should I create?" — it's "what does Claude not know about this project that it needs to know?"

**Skills answer that question cheaply.** A skill fires automatically when triggered, gives Claude the project-specific context it's missing, and costs nothing when not needed. It's a markdown file, not a subprocess.

**Agents are for parallelism and isolation.** They run as separate sub-processes with their own context. Use one when work needs to happen concurrently, or when isolation from the main session is the point (experiments, reviews, security scans). Not for storing knowledge — skills do that better and cheaper.

**The decision test:**

| Ask this | If YES | If NO |
|----------|--------|-------|
| Does this work benefit from parallel execution? | Create an agent | Create a skill |
| Does this need strict isolation from main context? | Create an agent | Create a skill |
| Is there 5+ files worth of domain knowledge unique to this area? | Create an agent | Create a skill |
| Is it just context Claude needs before implementing? | Create a skill | — |

**What a good skill looks like:**

Skills are project-specific guidance — not boilerplate. The best SKILL.md answers: *"In this project, when doing X, what does Claude need to know that it can't read from the code alone?"*

```markdown
# auth skill (good — project-specific)
This project uses RS256 (not HS256) — the private key is in infra/keys/.
All auth errors must return RFC 7807 problem+json format.
Rate limiting is handled by the nginx layer — don't add it in the app.
```

```markdown
# auth skill (bad — boilerplate Claude already knows)
Use JWT for authentication.
Validate all inputs.
Write tests for your code.
```

`/setup` and `/evolve` generate skills by running `problem-architect` first — it reads your actual file structure, co-change patterns, and existing conventions before generating anything. Skills are tailored to this project's actual gaps. Generic templates are not installed.

**When NOT to create an agent:**
- Routing decisions belong in `CLAUDE.md`, not an agent
- If a well-written skill + Claude's native capability handles it — use the skill
- If you'd create it just to "have one for auth" or "have one for the frontend" — don't
- If the agent's instructions are things Claude already knows without being told — skip it

**The order that works:**
```
1. Identify what Claude consistently gets wrong in this project
2. Write a skill that gives it the missing context (specific, not generic)
3. Watch /reflexes — if the same workflow recurs across sessions, that's a skill candidate
4. If the work can be parallelized or isolated → promote to an agent
5. Let /evolve read your git history and make the call from co-change evidence
```

> **Important:** `.claude/agents/*.md` files are routing references for Claude to read and follow — they are NOT callable via `subagent_type`. Only system-registered agent types work with the `Agent` tool's `subagent_type` parameter. To invoke a project agent: pass its file content as context to the appropriate built-in agent (e.g., dev-frontend, dev-backend).

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

**Prefix convention:** Project agents use `cc-` prefix (e.g., `cc-backend`, `cc-frontend`). This prevents collisions with external frameworks (langgraph, crewai, autogen).

### Built-in Agents

AZCLAUDE ships with 15 agent templates:

**Intelligent Copilot Team (v0.4+):**

| Agent | Model | Purpose |
|-------|-------|---------|
| **orchestrator** | sonnet (opus with --deep) | Tech lead for copilot mode. Reads constitution.md. Runs constitution-guard before every dispatch. Owns plan.md. NEVER writes code. |
| **problem-architect** | sonnet | Analyzes each milestone before dispatch. Returns Team Spec: agents, skills, pre-read files, Files Written, pre-conditions, risks, complexity. NEVER implements. |
| **milestone-builder** | sonnet | Reads constitution.md FIRST. Pre-reads all files, implements, verifies, self-corrects (fix budget 2/3), commits, reports. |

**Spec-Driven Gates (v0.4.13+):**

| Agent | Model | Mode | Purpose |
|-------|-------|------|---------|
| **spec-reviewer** | haiku | read-only | Validates spec quality before /blueprint. 7 criteria (goal clarity, ≥2 user stories, ≥3 testable ACs, out-of-scope, failure modes). Verdict: APPROVED / NEEDS_CLARIFY / INCOMPLETE. Max 300 words. |
| **constitution-guard** | haiku | read-only | Checks each milestone against constitution.md before orchestrator dispatches it. 4 checks: non-negotiables, architectural commitments, required patterns, definition of done. Verdict: APPROVED / VIOLATION. |

Both gate agents use haiku — fast and cheap because they run frequently (once per spec / once per milestone). They are blocking gates, not builders.

**Framework Agents:**

| Agent | Model | Mode | Purpose |
|-------|-------|------|---------|
| **orchestrator-init** | opus | full access | Runs once during `/setup`. Scans project, fills CLAUDE.md, creates goals.md. Exits permanently. |
| **loop-controller** | opus | full access | Level 10 autonomous agent. 3 cycles: environment evolution, knowledge consolidation, topology optimization. |
| **evolution-module** | opus | full access | Called by orchestrator for /evolve and /level-up at Level 10. Delegates to loop-controller. |
| **intelligence-module** | sonnet | full access | Optional Level 8-9 agent. Pipeline isolation, debate engine, OPRO prompt optimization, ELO ranking. |
| **code-reviewer** | opus | read-only (`EnterPlanMode`) | Spec-first review. Stage 1: spec compliance. Stage 2: code quality. Never modifies files. |
| **security-auditor** | sonnet | read-only | Pre-ship security scan. 102 rules across 5 layers. Verdict: APPROVE / REQUEST CHANGES / BLOCKED. |
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

**Four hooks. Three commands. One rule: goals.md is always read first.**

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
|   PreToolUse hook  --> blocks secrets before any write       |
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

### Hook 1: PreToolUse -> Secret Blocking

**When:** BEFORE every Write, Edit, or MultiEdit operation.

**What it does:** Scans file content about to be written for hardcoded secrets:

| Pattern | What it catches | Behavior |
|---------|----------------|---------|
| `AKIA[A-Z0-9]{16}` | AWS access key | EXIT 2 — write blocked |
| `sk-[a-zA-Z0-9]{48,}` | OpenAI key | EXIT 2 — write blocked |
| `ghp_[a-zA-Z0-9]{36}` | GitHub token | EXIT 2 — write blocked |
| `glpat-` | GitLab token | EXIT 2 — write blocked |
| `xoxb-` / `xoxp-` | Slack token | EXIT 2 — write blocked |
| `-----BEGIN PRIVATE KEY` | Private key | EXIT 2 — write blocked |
| XSS patterns (`dangerouslySetInnerHTML`) | Frontend injection | Warn — write allowed |
| `eval(` / `child_process.exec` | Code injection | Warn — write allowed |

Exit 2 = Claude Code **refuses the write entirely**. The file is never touched.

Session-based dedup: each warning fires once per file+rule per session (resets daily).

### Hook 2: PostToolUse -> goals.md

**When:** Every time Claude writes, edits, creates, reads, runs Bash, or Greps.

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

PostToolUse also:
- Captures tool-use observations to `.claude/memory/reflexes/observations.jsonl` for reflex detection
- Tracks cost to `.claude/memory/metrics/costs.jsonl`
- Reminds to run `/snapshot` every 15 edits
- Archives overflow to `sessions/{date}-edits.md` when In progress exceeds 30 entries

### Hook 3: UserPromptSubmit -> Context Injection

**When:** Once per session (keyed by parent PID). Fires before Claude processes the first message.

**What it injects:**

| What | Profile | When |
|------|---------|------|
| `goals.md` (20 done + 30 in-progress cap) | all | every session |
| Latest checkpoint (50-line cap) | all | every session |
| Plan status: `X/N done, Y in-progress, Z blocked` | standard + strict | copilot mode only |
| Learned reflexes with confidence ≥ 0.8 (max 5) | strict only | when reflexes exist |

**Security:** Strips prompt injection patterns (`curl|bash`, `ignore previous instructions`, `system prompt`, base64 blocks > 500 chars) before printing.

**Interrupted session recovery:** If `## In progress` entries survived the previous session, warns Claude before starting new work.

Claude sees all of this BEFORE your message. Memory is physically injected into the context window -- not a suggestion, a mechanism.

### Hook 4: Stop -> Migration + Trimming

**When:** When Claude stops responding.

**What it does:**
1. Migrates `## In progress` entries → `## Done this session`
2. Trims `## Done this session` to 20 entries — overflow archived to `sessions/{date}-edits.md`
3. Stamps `Updated: {today}` in goals.md
4. Resets edit counter so checkpoint reminder starts fresh next session
5. Warns if no `/persist` was run

### /snapshot -- Mid-Session Reasoning Snapshot

Run every 15-20 turns on complex work. Saved to `.claude/memory/checkpoints/{timestamp}.md`. UserPromptSubmit automatically picks up the latest checkpoint on next session start.

**What it captures — 5 sections:**

```markdown
## What I'm doing right now
{1-2 sentences: the specific task in flight, not the project description}

## Why — key decisions made this session
{Bullet list: each decision + the reason}
- Used spawnSync over exec: timeout needed, exec doesn't block
- Skipped STRUCTURE-ONLY on SKIM projects: blueprint.json already has scale field

## What I know that isn't written down yet
← THE MOST IMPORTANT SECTION
{Anything in working memory that hasn't been committed to a file or comment}

## What's next (top 3)
1. {next concrete action}
2.
3.

## Risk / open question
{Anything uncertain that needs resolution — or "None"}
```

The "What I know that isn't written down yet" section is why `/snapshot` exists. Context compaction silently erases mid-session reasoning. This section captures it before it's gone.

### /persist -- End-of-Session Narrative

Run before closing. Writes updated goals.md, friction log (only when there's actual friction), and session summary to `.claude/memory/sessions/`.

### Token Cost -- Fixed, Not Variable

```
AZCLAUDE memory cost per session:

  goals.md injection:          ~200 tokens  (bounded: 30 in-progress + 20 done max)
  checkpoint injection:        ~300 tokens  (capped at 50 lines)
  plan status (copilot mode):  ~20 tokens   (standard + strict)
  reflex guidance:             ~50 tokens   (strict only, max 5 reflexes)
  -------------------------------------------------------
  Total (standard):            ~500 tokens  (fixed)
  Total (strict + copilot):    ~570 tokens  (fixed)
```

goals.md is auto-rotated at 30 in-progress entries — oldest 15 archived to `sessions/{date}-edits.md`, newest 15 kept. Same injection cost at session 5 or session 500.

### Memory Summary

| Layer | Mechanism | What It Captures | Automatic | Survives Compaction |
|-------|-----------|-----------------|-----------|-------------------|
| Secret blocking | PreToolUse → EXIT 2 | Prevents credential writes | Yes | N/A |
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
- **Windows compatible.** All hooks use Node.js — no bash dependencies. Path detection handles both `$HOME/.claude/` (Unix/Mac) and `%APPDATA%\Claude\` (Windows) automatically.

---

## Native Tool Orchestration (MCP)

AZCLAUDE hardwires its logic directly into the host CLI's built-in MCP capabilities:

- **`AskUserQuestion`**: Wrapped into `/add`, `/blueprint`, and `/setup` to force clarification of vague requirements.
- **`EnterPlanMode`**: Called during `/blueprint`, `/audit`, and `/sentinel` for forced read-only analysis.
- **`EnterWorktree`**: Called to isolate state during `/evolve` and `/fix`.
- **`CronCreate` / `CronList`**: Tied to `/loop` for autonomous background execution.
- **`mcp__ide__getDiagnostics`**: Hard-gated before `/test` and `/ship`.

---

## Intelligent Dispatch

A pre-flight system that runs **before** non-trivial tasks. Referenced in `/fix`, `/add`, `/audit`, `/ship`, `/dream`, and `/copilot` — here's what it actually does.

### What it is

Before touching any code, intelligent-dispatch checks whether the task is complex enough to need structured analysis. If yes, it spawns `problem-architect` to scope the work and return a **Team Spec** — a structured package that contains everything the implementer needs to succeed without making blind guesses.

### When it fires

| Condition | Fires? |
|-----------|--------|
| Task touches 3+ files | Yes |
| Structural change (schema, API contract, auth, architecture) | Yes |
| Task crosses directory boundaries | Yes |
| First time in this part of the codebase this session | Yes |
| 1-2 files, clearly scoped | No |
| Pure config/docs change | No |
| Already in copilot mode with annotated plan.md | No (Team Spec already exists) |

### What problem-architect returns (Team Spec)

```
Skills to Load:        [auth-skill, validation-skill]
Pre-Read Files:        [schema.prisma, src/auth/index.js, tests/auth.test.js, patterns.md]
Files Written:         [src/auth/jwt.js, tests/auth/jwt.test.js]  ← parallel safety check
Pre-Conditions:        [DB migration run, JWT_SECRET set in .env]
Structural Decision:   NO  ← YES triggers /debate before any code is written
Risks:                 [token rotation breaks existing sessions — add migration guide]
Complexity:            MEDIUM  ← sets fix attempt budget: 2 for SIMPLE/MEDIUM, 3 for COMPLEX
```

### What happens next

Each field is acted on before implementation starts:
- **Skills to Load** → loaded into context
- **Pre-Read Files** → read in order: schema → source → tests → patterns → antipatterns
- **Pre-Conditions** → verified; STOP if any unmet
- **Files Written** → noted for parallel safety (orchestrator checks for overlap before parallel dispatch)
- **Structural Decision: YES** → `/debate` runs first, result logged to `decisions.md`
- **Risks** → mitigation applied to implementation approach

The rule it enforces: **context-blind implementation is the most common failure mode.** Intelligent dispatch eliminates it by forcing pre-read before any edit.

### Escalation to Orchestrator

If `.claude/agents/orchestrator.md` exists:
- Task spans 2+ milestones → delegate to orchestrator
- Multiple independent workstreams → orchestrator manages parallel dispatch
- Structural decision needed → orchestrator triggers `/debate`

---

## Spec-Driven Development

> v0.4.13 — The spec-driven workflow solves the most common cause of wasted work: building the wrong thing correctly.

### The Problem It Solves

Without spec-driven workflow:
- `/blueprint` guesses at requirements from informal descriptions
- `/copilot` builds milestones without checking project rules first
- Plan says "done" but the files were deleted or renamed — ghost milestones ship silently
- Open questions get resolved arbitrarily during implementation instead of before it

With spec-driven workflow:
- Every milestone traces to an acceptance criterion
- `constitution-guard` blocks milestones that violate non-negotiables before any code is written
- `/analyze` detects ghost milestones before they ship
- `spec-reviewer` blocks `/blueprint` until the spec is actually complete

### The Workflow

```
/constitute    Write ground rules first
     ↓
/spec          Write a structured spec (goal, user stories, acceptance criteria, out-of-scope)
     ↓
/clarify       Resolve open questions (5-question interrogation loop)
     ↓
/blueprint     Derive milestone plan — spec-reviewer validates first
     ↓
/copilot       Build — constitution-guard checks each milestone before dispatch
     ↓
/analyze       Check consistency (ghost milestones, drift)
     ↓
/ship          Ghost check → security scan → tests → commit → push
```

### /constitute — Ground Rules Before Planning

```
/constitute
```

Guided interview (5 groups, one at a time). Writes `.claude/constitution.md`:

```markdown
## Non-Negotiables
- No third-party analytics in the EU build — GDPR compliance is blocking
- All DB writes must be in transactions — data integrity is non-negotiable

## Architectural Commitments
- REST API only (no GraphQL) — mobile team is locked into REST
- Supabase for auth — changing this requires a full migration

## Required Patterns
- All errors return RFC 7807 problem+json
- Every endpoint must have at least one integration test

## Definition of Done
- Feature complete per acceptance criteria
- No IDE errors, no failing tests
- Reviewed by code-reviewer agent
```

Once constitution.md exists, every milestone in `/copilot` is checked against it by `constitution-guard` before dispatch. Violations are blocked and logged to `blockers.md`.

### /spec — Structured Spec Before /blueprint

```
/spec "user authentication with JWT"
```

Writes `.claude/specs/{N}-{slug}.md`:

```markdown
# Spec: user-authentication
status: ready-for-blueprint

## Goal
Allow users to log in with email + password and receive a JWT for subsequent requests.

## User Stories
- As a new user, I want to register with email + password so I can access the platform
- As a returning user, I want to log in so I can access my account

## Acceptance Criteria
1. Given valid credentials, when POST /auth/login, then returns 200 + JWT + refresh token
2. Given invalid credentials, when POST /auth/login, then returns 401 + RFC 7807 error body
3. Given expired JWT, when any authenticated request, then returns 401 with refresh hint

## Out of Scope (this version)
- OAuth / social login
- Multi-factor authentication
- Password reset flow
```

After writing, `spec-reviewer` validates:
- Goal is clear and specific
- ≥ 2 user stories
- ≥ 3 acceptance criteria, all independently verifiable
- Out-of-scope not empty
- No open questions remaining

Verdict `APPROVED` → `/blueprint .claude/specs/{N}-{slug}.md`
Verdict `NEEDS_CLARIFY` → status downgraded to `draft`, redirect to `/clarify`
Verdict `INCOMPLETE` → lists missing sections, re-run Phase 3

### /clarify — Resolve Open Questions

```
/clarify .claude/specs/01-auth.md
```

Structured interrogation of the spec. Asks one question at a time (max 5). Categorized by:
- Goal — what is the exact success condition?
- Scope boundary — what is the hard edge of this feature?
- Acceptance criteria — is each criterion independently verifiable?
- Failure modes — what happens when X fails?
- Constraints — performance, security, backwards compatibility?

Writes answers back into the spec. When all questions resolved → upgrades status to `ready-for-blueprint`.

### /analyze — Cross-Artifact Consistency

```
/analyze
/analyze plan     ← focus on ghost milestone detection
/analyze spec     ← focus on spec vs. implementation drift
```

Three checks (read-only):

**Ghost Milestone Detection** — scan plan.md for milestones marked `done` where the committed files no longer exist.
```
GHOST: M5 — "Add rate limiting middleware"
  plan.md: status = done
  file: src/middleware/rate-limit.ts — NOT FOUND
  Recommendation: set status → pending, re-implement or remove
```

**Spec vs. Implementation** — check if acceptance criteria from spec files are reflected in the codebase.

**Intent vs. Codebase** — compare copilot-intent.md against what was actually built.

Runs automatically in `/ship` (pre-commit gate) and `/audit` (before code quality check).

### /tasks — Dependency Graph + Wave Groups

```
/tasks
```

Reads plan.md, builds dependency graph, outputs parallelizable wave groups:

```
Wave 1 (parallel — no dependencies):
  M1: Database schema
  M2: Auth middleware

Wave 2 (parallel — depend on Wave 1):
  M3: User endpoints    (depends on M1)
  M4: Auth endpoints    (depends on M2)

Wave 3 (sequential — depends on both Wave 1 and 2):
  M5: Integration tests

Critical path: M1 → M3 → M5 (3 milestones)
Max parallelism: 2 milestones simultaneously
```

Orchestrator reads this to decide dispatch order. `/tasks` output feeds directly into the orchestrator's parallel safety check.

### /issues — plan.md → GitHub Issues

```
/issues
```

Pre-flight: checks `gh auth status`, `git remote`, `plan.md` exists.

Creates a GitHub Issue for each `pending` milestone:
- Label: `azclaude` + `copilot-milestone`
- Body: milestone description, acceptance criteria (if spec linked), dependencies
- Deduplication: checks for existing issue with same title, skips if found
- Writes issue number back to `plan.md`: `M3: #42 — pending`

Does NOT create issues for `done` milestones. Does NOT delete existing issues.

### How the Spec-Driven Workflow Integrates Automatically

Every major command now checks for constitution + spec context:

| Command | What changed |
|---------|-------------|
| `/add` | Reads constitution non-negotiables before implementing. If spec file provided, loads ACs as implementation checklist. |
| `/fix` | Reads constitution non-negotiables — fix must not violate project rules. |
| `/refactor` | Reads architectural commitments — refactor must move toward required patterns. |
| `/blueprint` | spec-reviewer gates quality before planning. Suggests /constitute if missing. |
| `/copilot` | Reads constitution.md on startup. constitution-guard checks each milestone. |
| `/evolve` | Drift analysis after skill generation. Reopens ghost milestones. |
| `/ship` | Ghost milestone check before commit. Blocks on plan drift. |
| `/audit` | Plan consistency check before code review. |
| `architecture-advisor` | Reads architectural commitments before advising. Flags deviations. |
| `orchestrator` | Reads constitution.md in Step 1. Runs constitution-guard in Step 3. |
| `milestone-builder` | Reads constitution.md FIRST in pre-read. Keeps non-negotiables visible. |

---

## All 33 Commands

### /dream
**New project from idea.**

```
/dream I want to build a compliance tracking API with FastAPI and Postgres
```

Four phases — none skippable:

**Phase 1 — Structured Intake**
Uses `AskUserQuestion` to collect four answers in one shot:
1. What do you want to build? (the problem it solves, not just the feature list)
2. Tech stack (or "help me choose")
3. Who uses this? (developers / end users / internal team)
4. What is explicitly OUT of scope for v1? (prevents scope creep from the start)

If `$ARGUMENTS` already answers one clearly, it's pre-filled. In copilot mode, reads `.claude/copilot-intent.md` instead of asking.

**Phase 2 — Environment Scan (read-only)**
Enters `PlanMode`. Detects current level (0-7) from what's already present.

For existing projects (`.claude/` dir found): runs **intelligent-dispatch** — spawns `problem-architect` to analyze what agents, skills, and patterns already exist. Vision generation will not conflict with or duplicate what's already there.

For clean slate (no `.claude/`): skips problem-architect, goes straight to Phase 3.

**Phase 3 — Build Level by Level**
Creates a task per level (L1–L6). Builds each in sequence — reads the matching `level{N}.md` capability, executes it with Phase 1 answers as input, shows what was created. Spawns `orchestrator-init` to fill CLAUDE.md and goals.md with actual project data.

After building: generates a **domain advisor skill** for non-developer domains (compliance, medical, finance, legal, marketing, research, logistics). Developer projects get `architecture-advisor` by default.

**Phase 4 — Quality Gate**
Runs all checks from `quality-check.md`. Must pass before printing "project ready." Shows: created CLAUDE.md, goals.md, level checklist, and first task to work on.

---

### /setup
**Analyze existing project and build the environment.**

```
/setup
```

Scans your code, detects domain/stack/scale, fills CLAUDE.md, creates goals.md, generates minimum 2 project-specific skills, builds project agents from git co-change evidence. Runs once, then exits. See [First Steps](#first-steps-after-install).

---

### /fix
**4-phase bug fix with mandatory proof.**

```
/fix TypeError: Cannot read property 'id' of undefined at auth.js:42
```

**Intelligent-dispatch pre-flight** after reproduction: problem-architect scopes the bug (affected files, relevant patterns/antipatterns). Then 4 phases -- none skippable:
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

Clarify scope → **intelligent-dispatch pre-flight** (spawns problem-architect for 3+ file tasks) → understand existing patterns → TDD check → implement → verify. In copilot mode: milestone-builder receives full context from orchestrator. Never invents patterns — copies what's already in your codebase.

---

### /audit
**Spec-first code review with Distrust-in-Review. Read-only.**

```
/audit
/audit 42          # PR number
/audit src/auth.js  # specific file
```

**Step 1a — Plan Consistency Check:** scans plan.md for ghost milestones before reviewing code. Ghost findings included in the report (not blocking, but flagged clearly).

**Intelligent-dispatch structural context** injected before reviewing: decisions.md rulings, patterns.md conventions, antipatterns.md known issues form the checklist. Read-only mode. Enforces **Distrust-in-Review**: assumes the implementer was optimistic. In copilot mode: reviews against copilot-intent.md.

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
/blueprint .claude/specs/01-auth.md    # spec-driven mode (recommended)
```

**Spec-driven mode:** if a spec file is provided, spawns `spec-reviewer` first. APPROVED → build plan tracing each milestone to an acceptance criterion. NEEDS_CLARIFY → block, redirect to `/clarify`. INCOMPLETE → block, list missing sections.

**Step 3b — Constitution check:** if `constitution.md` exists, verifies plan doesn't violate non-negotiables. Suggests `/constitute` if missing.

Read-only analysis -> numbered plan with file:line references + risk level -> approval gate (skipped in copilot mode). Generates `plan.md` with milestone descriptions, expected files, and dependencies.

---

### /ship
**Pre-ship gate, smart commit, push.**

```
/ship
/ship "feat: add JWT refresh token rotation"
```

**Intelligent-dispatch risk scan (Step 0):** problem-architect checks what changed and flags unmet pre-conditions before touching git. Then:
1. **Ghost milestone check (Step 0a):** `/analyze plan` inline — blocks on ghost milestones. Plan drift cannot ship.
2. Security scan (security-auditor if installed, inline scan if not) -- STOP if BLOCKED
3. IDE diagnostics -- STOP if errors
4. Tests pass -- STOP if EXIT != 0
5. Docs sync check
6. Secrets scan -- reject .env, keys, tokens
7. Commit
8. Push

In copilot mode: auto-deploys to Vercel/Railway if deploy target in intent.

---

### /sentinel
**Environment security scan. Scored 0-100, grade A-F.**

```
/sentinel           # full scan (all 5 layers, 102 rules)
/sentinel --hooks   # Layer 1+2: hook integrity + permissions only
/sentinel --mcp     # Layer 3: MCP server secrets and unknown packages
/sentinel --agents  # Layer 4: prompt injection in agent files
/sentinel --secrets # Layer 5: credentials in committed/staged code
```

Scans five layers independently. Final score = weighted average.

| Layer | Weight | What it checks |
|-------|--------|---------------|
| Hook Integrity | 25 | SHA-256 hash verification — hooks tampered? |
| Permission Audit | 20 | Wildcards, `dangerouslyAllowedTools`, permission bypasses |
| MCP Server Scan | 20 | Hardcoded secrets in `.mcp.json`, unknown packages |
| Agent Config Review | 15 | Prompt injection patterns in agent files, write-permitted reviewers |
| Secrets Scan | 20 | Credentials in committed/staged files |

**Verdict:**
- `BLOCKED` — hardcoded secret or integrity failure. `/ship` must not proceed.
- `CLEAR` — Grade A or B, no blocking findings.
- `PROCEED WITH CAUTION` — Grade C/D, no blocking findings.

**Sample output:**
```
╔══════════════════════════════════════════════════╗
║          SENTINEL — Environment Security         ║
╚══════════════════════════════════════════════════╝

Layer 1 — Hook Integrity       25/25   ✓ verified
Layer 2 — Permission Audit     12/20   ⚠ Bash(rm:*) too broad
Layer 3 — MCP Server Scan      20/20   ✓ clean
Layer 4 — Agent Config Review  15/15   ✓ no injection found
Layer 5 — Secrets Scan         18/20   ⚠ API key in settings
──────────────────────────────────────────────────
Total: 90/100   Grade: A   Verdict: CLEAR
```

Does NOT suggest inline fixes. Lists findings only. You fix, then re-run `/sentinel`.

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

The core command. If `.claude/agents/orchestrator.md` exists → reads the agent file and follows its instructions inline (three-tier intelligent team). Orchestrator: reads plan.md, consults problem-architect for each milestone, dispatches milestone-builders, monitors results, triggers /evolve every 3 milestones. When all done: `/audit` -> `/ship` -> `COPILOT_COMPLETE`. See [Copilot Mode](#copilot-mode-autonomous).

---

### /constitute
**Define project ground rules. Copilot enforces them.**

```
/constitute
```

Guided interview (5 groups). Writes `.claude/constitution.md` with non-negotiables, architectural commitments, required patterns, definition of done, priority hierarchy. Wires itself into `CLAUDE.md` Rules section. Run once before `/blueprint`. See [Spec-Driven Development](#spec-driven-development).

---

### /spec
**Write a structured spec before /blueprint.**

```
/spec "user authentication with JWT"
/spec           # blank — will ask what you're building
```

Writes `.claude/specs/{N}-{slug}.md` with goal, user stories (≥2), acceptance criteria (≥3 with "given/when/then" format), out-of-scope, failure modes, constraints, and open questions. After writing, `spec-reviewer` validates. Status: `draft` (open questions remain) or `ready-for-blueprint`. See [Spec-Driven Development](#spec-driven-development).

---

### /clarify
**Resolve open questions in a spec before blueprinting.**

```
/clarify .claude/specs/01-auth.md
/clarify              # finds spec files automatically
```

Structured interrogation loop (max 5 questions). One question at a time. Writes answers back into the spec. When all questions resolved → upgrades status to `ready-for-blueprint`. See [Spec-Driven Development](#spec-driven-development).

---

### /analyze
**Cross-artifact consistency check. Read-only.**

```
/analyze              # full check (plan + spec + intent)
/analyze plan         # ghost milestone detection only
/analyze spec         # spec vs. implementation drift
```

Three checks: ghost milestones (marked done, files missing), spec vs. code, intent vs. codebase. Outputs consistency score (%). Runs automatically in `/ship` and `/audit`. See [Spec-Driven Development](#spec-driven-development).

---

### /tasks
**Build dependency graph and parallelizable wave groups from plan.md.**

```
/tasks
```

Reads plan.md, builds dependency graph, outputs wave groups (sets of milestones that can run simultaneously with no dependency or file conflicts). Shows critical path length and max parallelism. Read-only. See [Spec-Driven Development](#spec-driven-development).

---

### /issues
**Convert plan.md milestones to GitHub Issues.**

```
/issues
```

Pre-flight: `gh auth status`, `git remote`, `plan.md`. Creates issues for pending milestones, deduplicates, writes issue numbers back to `plan.md`. Labels: `azclaude`, `copilot-milestone`. See [Spec-Driven Development](#spec-driven-development).

---

### /reflexes
**View, analyze, and manage learned behavioral patterns.**

```
/reflexes status    # show all reflexes with confidence scores + observation health
/reflexes analyze   # detect patterns from tool-use observations
/reflexes promote   # promote project reflexes to global scope (≥ 0.8 → available in all projects)
/reflexes clear     # archive old observations, prune weak reflexes (< 0.3)
```

Reflexes are atomic learned behaviors extracted from session observations. Confidence-scored (0.3 tentative -> 0.9 certain). See [The Self-Improving Loop](#the-self-improving-loop).

---

### /reflect
**Self-improve CLAUDE.md from conversation friction.**

```
/reflect
```

Reads friction logs, session history, and current CLAUDE.md. Identifies: missing rules, dead rules, vague rules, contradicting rules, missing routing entries. Proposes exact edits — one finding per change. You approve which to apply. See [The Self-Improving Loop](#the-self-improving-loop).

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

Captures 5 sections: what you're doing, WHY, key decisions, **what you know that isn't written down yet** (most important), what's next, risks. Saved to `checkpoints/`. Injected automatically on next session start. Protects against context compaction losing mid-session reasoning. In copilot mode: runs after every milestone.

---

### /persist
**End-of-session: goals, friction log, session summary.**

```
/persist
```

Run before closing. Updates goals.md, writes friction log (only when actual friction exists), saves session narrative to `memory/sessions/`.

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

**Intelligent-dispatch pre-flight:** problem-architect maps full dependency graph before the manual scan, flags structural risks. Tests before AND after. Maps all references. High-risk changes use worktree isolation.

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

### /hookify
**Generate hooks from conversation friction.**

```
/hookify block rm -rf commands
/hookify
```

Analyzes patterns and generates PreToolUse or PostToolUse hooks. Classifies into 5 hook types: dangerous commands (block), unsafe code patterns (warn), file protection (block), missing steps (remind), session behavior (inject).

---

## Skills (Auto-Invoked)

Skills fire automatically based on context — no slash command needed.

### What a skill actually is

A skill is guidance, not instructions. Claude already knows how to write code — a skill tells it what's true about **this project** that it can't derive from reading the files.

The question a skill answers: *"What does Claude need to know here that generic training doesn't cover?"*

- Stack-level knowledge Claude has → not in a skill
- This project's conventions, constraints, and non-obvious patterns → in a skill
- Generic best practices → not in a skill
- The specific tradeoffs already decided for this codebase → in a skill

**Skills generated by `/setup` and `/evolve` are tailored.** `problem-architect` reads your actual file structure, co-change history, and existing patterns before writing anything. There are no generic templates dropped in without reading the project first.

### The 8 installed skills

| Skill | Triggers on |
|---|---|
| session-guard | Session start, context reset, idle detection |
| test-first | Writing, implementing, fixing code in TDD projects |
| env-scanner | Project setup, environment detection, stack analysis |
| debate | Decisions, trade-offs, "which is better", comparing options |
| security | Credentials, auth, payments, .env files, secrets, before /ship |
| skill-creator | "Create a skill", "add capability", repeated workflows |
| agent-creator | "Create an agent", agent boundaries, 5-layer structure |
| architecture-advisor | Architecture decisions, database choice, rendering strategy, testing approach — by project scale |

Each skill has: `SKILL.md` (lean trigger + workflow), `references/` (deep content loaded on demand), `examples/` (concrete output), `scripts/` (deterministic work).

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
SHA-256 hash of hook config written at install (`.claude/.azclaude-integrity`). Verified on every subsequent run. Integrity baseline is computed against the project-level `settings.local.json` where hooks are registered.

### 2. Pre-Write Secret Blocking
`pre-tool-use.js` fires before every Write/Edit/MultiEdit operation. Scans file content for credential patterns. EXIT 2 = Claude Code refuses the write. Patterns blocked: `AKIA*` (AWS), `sk-*` (OpenAI), `ghp_*` (GitHub), `glpat-*` (GitLab), `xoxb-*`/`xoxp-*` (Slack), `npm_*`, `AIza*` (Google), `sk_live_*` (Stripe), `SG.` (SendGrid), `-----BEGIN PRIVATE KEY`.

### 3. Prompt Injection Defense
UserPromptSubmit strips injection patterns from goals.md before context injection: `curl|bash`, `ignore previous instructions`, `system prompt`, `<script>`, base64 blocks > 500 chars.

### 4. Skill Checksums
Portable skills in `~/shared-skills/` are SHA-256 hashed. Imports fail if tampered.

### 5. Pre-Ship Credential Auditing
`/ship` runs `/sentinel` (or inline scan if security-auditor not installed) before any git operation. Blocks commit if hardcoded secrets found in staged files.

### 6. Agent Scoping
- Review agents: read-only (`EnterPlanMode`)
- Experiment agents: isolated worktree (`EnterWorktree`)
- Never promote experiment results without evaluate.md

### /sentinel -- On-Demand Security Audit

Run at any time for a full environment scan:

```bash
/sentinel          # 5 layers, 102 rules, scored 0-100
/sentinel --hooks  # hook integrity + permission audit only
/sentinel --secrets # scan committed/staged files for credentials
```

See the [/sentinel command](#sentinel) for full details.

### Hook Profiles

Control hook behavior via environment variable:

```bash
AZCLAUDE_HOOK_PROFILE=minimal  claude   # goals.md tracking only (fastest)
AZCLAUDE_HOOK_PROFILE=standard claude   # all features (default)
AZCLAUDE_HOOK_PROFILE=strict   claude   # all + reflex guidance injection
```

| Feature | minimal | standard | strict |
|---------|---------|----------|--------|
| Secret blocking (pre-tool-use.js) | ✓ | ✓ | ✓ |
| goals.md edit tracking | ✓ | ✓ | ✓ |
| Memory rotation (30-line cap) | ✓ | ✓ | ✓ |
| Checkpoint injection | ✓ | ✓ | ✓ |
| Reflex observations (observations.jsonl) | — | ✓ | ✓ |
| Cost tracking (metrics/costs.jsonl) | — | ✓ | ✓ |
| Checkpoint reminder every 15 edits | — | ✓ | ✓ |
| Plan status injection (copilot mode) | — | ✓ | ✓ |
| Reflex guidance injection (≥0.8, max 5) | — | — | ✓ |

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
- **Project hooks** -- UserPromptSubmit, PreToolUse, PostToolUse, Stop hooks wired
- **Hook freshness** -- hook scripts match latest version
- **Settings integrity** -- SHA-256 hash matches install-time hash
- **Commands** -- all 33 commands present
- **Memory** -- goals.md exists, checkpoints directory exists, git repo initialized
- **Project** -- CLAUDE.md exists and has no unfilled `{{placeholders}}`

Common fixes:
- **Hook not wired** -> re-run `npx azclaude-copilot@latest`
- **Stale hooks** -> re-run `npx azclaude-copilot@latest` (auto-upgrades on version mismatch)
- **Placeholders in CLAUDE.md** -> run `/setup`
- **Missing commands** -> re-run `npx azclaude-copilot@latest`

### Goals.md not injecting at session start

The UserPromptSubmit hook runs once per session (keyed by parent PID). Start a new Claude Code session.

### Context compacted and lost your place

Open a new session -- UserPromptSubmit injects goals.md + latest checkpoint automatically. Run `/snapshot` every 15-20 turns to protect reasoning.

### Agent keeps making the same mistake

Check `.claude/memory/antipatterns.md`. Agents read it at the start of each task. If the mistake isn't there, run `/reflect` — it will find the missing rule and propose adding it to CLAUDE.md.

### /evolve didn't find anything

Run `/evolve` after 2+ sessions of real use when friction logs and patterns have accumulated. Run `/reflexes analyze` first to surface behavioral patterns from observations.

### /sentinel shows hook integrity MEDIUM

The integrity baseline was computed against a different settings file than where your hooks are registered. Re-run:
```bash
npx azclaude-copilot@latest
```
This re-establishes the baseline against the correct project-level `settings.local.json`.

### Hooks not working on Windows

AZCLAUDE hooks use Node.js (not bash) and detect Windows paths automatically:
- Unix/Mac: `~/.claude/settings.json`
- Windows: `%APPDATA%\Claude\settings.json`

If issues persist, verify Node.js is in your PATH and re-run `npx azclaude-copilot@latest`.

### /copilot not finding copilot-intent.md

Run `/dream` first to generate the intent file from a structured intake. Or create `.claude/copilot-intent.md` manually with your product description.

---
