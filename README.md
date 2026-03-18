<p align="center">
  <h1 align="center">AZCLAUDE COPILOT</h1>
  <p align="center"><strong>Describe a product once. Walk away. Come back to a deployed app with full git history.</strong></p>
  <p align="center">
    <a href="https://www.npmjs.com/package/azclaude-copilot"><img src="https://img.shields.io/npm/v/azclaude-copilot.svg" alt="npm version"></a>
    <a href="https://github.com/haytamAroui/AZ-CLAUDE-COPILOT/actions"><img src="https://img.shields.io/badge/tests-1002%20passing-brightgreen" alt="tests"></a>
    <a href="https://github.com/haytamAroui/AZ-CLAUDE-COPILOT/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license"></a>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D16-brightgreen" alt="node version"></a>
  </p>
  <p align="center">
    <a href="#one-command">One Command</a> ·
    <a href="#how-it-works">How It Works</a> ·
    <a href="#the-pipeline">Pipeline</a> ·
    <a href="#evidence-based-intelligence">Intelligence</a> ·
    <a href="#memory-system">Memory</a> ·
    <a href="#all-26-commands">Commands</a> ·
    <a href="DOCS.md">Full Docs</a>
  </p>
</p>

---

## The Problem

Every AI coding tool makes you the project manager. You prompt, review, approve, prompt again. You are the bottleneck. Context resets every session. Agents don't learn. Nothing accumulates.

**AZCLAUDE Copilot removes you from the loop entirely.**

```
Input:   "Build EU AI Act compliance SaaS with trilingual support"
Output:  Deployed product with full git history, evolved agents, copilot-report.md

Human input after first message: ZERO
```

---

## One Command

```bash
npx azclaude-copilot . "EU AI Act compliance SaaS. Free deterministic
classification terminal. Paid 30-question assessment with PDF report.
FastAPI backend. Next.js frontend. Supabase. Trilingual EN/FR/NL. Stripe."
```

Walk away. Come back to:
- Full git history (one commit per milestone)
- Deployed product
- `copilot-report.md` with everything that was built
- Evolved environment with project-specific agents and learned reflexes

Resume anytime: `npx azclaude-copilot .`

---

## How It Works

Three layers. The runner is dumb. The brain is smart. The environment accumulates.

```
+-----------------------------------------------------------+
|  LAYER 1: THE RUNNER (bin/copilot.js)                     |
|  Node.js. Stateless. Dumb on purpose.                     |
|  Restarts Claude Code sessions until COPILOT_COMPLETE.    |
|  Reads nothing. Decides nothing. Just loops.              |
+-----------------------------------------------------------+
|  LAYER 2: THE BRAIN (AZCLAUDE inside each session)        |
|  Reads goals.md, plan.md, checkpoint, patterns,           |
|  blockers, decisions, reflexes, context artifacts          |
|  Decides what to do next. Builds. Tests. Commits.         |
|  Updates all state files before session ends.             |
+-----------------------------------------------------------+
|  LAYER 3: THE ENVIRONMENT (accumulates across sessions)   |
|  Project agents emerge from git evidence (/evolve)        |
|  Reflexes learned from tool-use observations              |
|  Skills created when patterns repeat                      |
|  Conventions solidify in CLAUDE.md                        |
|  The environment gets smarter every session.              |
+-----------------------------------------------------------+
```

Runner loops. AZCLAUDE accumulates. Claude thinks.

---

## The Pipeline

Every command detects copilot mode automatically (`[ -f .claude/copilot-intent.md ]`) and skips human interaction -- no approval gates, no prompts, no pauses.

```
Session 1:  /dream -> /blueprint -> /add M1 -> /add M2 -> /add M3 -> /snapshot
Session 2:  /evolve -> /add M4 -> /add M5 -> /add M6 -> /snapshot
Session 3:  /evolve -> /add M7 -> /add M8 -> /add M9 -> /snapshot
Session 4:  /evolve -> /audit -> /ship -> COPILOT_COMPLETE
```

### Per Milestone

1. Read milestone from `plan.md` (description, expected files, dependencies)
2. Implement using `/add` (follows `patterns.md`, reads context artifacts, uses project agents)
3. Run tests -- fix if failing (2 attempts max)
4. If still failing -- log to `blockers.md`, skip, continue
5. Commit: `{type}: {what} -- {why}`
6. Push + update `plan.md` status to `done`
7. `/snapshot` (compaction protection)

### Self-Healing

When builds fail:
- Re-read error, check `antipatterns.md`, try alternative approach
- Record failure to `antipatterns.md` (every failure teaches the environment)
- Record success to `patterns.md`
- If stuck, `/debate` finds alternative approach from blocker context

### Blocker Recovery

After all non-blocked milestones complete:
- Retry blocked milestones with full project context now available
- Often unblocked by later work
- If still stuck, `/debate` evaluates; if no solution, mark `skipped`

---

## What Makes It Different

| Feature | Claude Code | Ralph Loop | Lovable | Cursor | AZCLAUDE Copilot |
|---------|------------|------------|---------|--------|-----------------|
| Autonomous loop | -- | Yes | -- | -- | Yes |
| Memory across sessions | -- | Git only | -- | -- | Goals + checkpoints + patterns + reflexes |
| Self-evolving agents | -- | -- | -- | -- | Yes (from git evidence) |
| Learned reflexes | -- | -- | -- | -- | Yes (confidence-scored) |
| Convention enforcement | -- | -- | -- | -- | Yes (CLAUDE.md + patterns.md) |
| Architecture advisor | -- | -- | -- | -- | Yes (8 decision matrices) |
| Domain advisor generation | -- | -- | -- | -- | Yes (7 domains) |
| Context artifact discovery | -- | -- | -- | -- | Yes (schemas, specs, configs) |
| Any stack | Yes | Yes | Next.js only | Yes | Yes |
| You own the code | Yes | Yes | -- | Yes | Yes |
| Zero dependencies | Yes | Yes | -- | -- | Yes (0 in package.json) |
| Deploy included | -- | -- | Yes | -- | Yes |

---

## Evidence-Based Intelligence

### Reflexes -- Learned Behavioral Patterns

AZCLAUDE observes tool-use patterns across sessions and extracts atomic behaviors called reflexes. Each reflex is confidence-scored, domain-tagged, and evidence-backed.

```yaml
id: grep-before-edit
trigger: "when modifying code files"
action: "Search with Grep first, confirm with Read, then Edit"
confidence: 0.7       # 0.3 tentative -> 0.9 certain
evidence_count: 8
```

- PostToolUse hook captures observations to `observations.jsonl` automatically
- 3+ occurrences of a pattern creates a reflex
- Confidence decays at -0.02/week without observation (stale patterns auto-prune)
- Strong reflex clusters evolve into skills or agents via `/evolve`
- Global scope promotion when seen in 2+ projects with confidence >= 0.8

### Architecture Advisor -- 8 Decision Matrices

Auto-fires on architecture decisions. Claude knows every framework; this skill guides **when to use which** based on project scale (SMALL/MEDIUM/LARGE):

| Decision area | Example guidance |
|--------------|-----------------|
| Architecture | SMALL: flat modules. MEDIUM: modular monolith. LARGE: monolith + targeted microservices |
| Database | SMALL: SQLite. MEDIUM+: PostgreSQL. Cache: Redis. Search: Postgres FTS first |
| Rendering | Marketing: SSG. Dashboards: SSR. Admin: SPA. Products: ISR |
| Testing | MVP: test-after critical paths. MEDIUM: TDD for business logic. LARGE: full TDD |
| API design | Internal: tRPC. Public: REST. Mobile: GraphQL. Real-time: WebSocket/SSE |
| State mgmt | Simple: useState. Server data: TanStack Query. Complex: Zustand. Workflows: XState |
| Deployment | MVP: Vercel/Railway. Scale: AWS/GCP with IaC |
| Auth | Small: Clerk/Supabase. Large: Auth0/Keycloak |

Every recommendation includes the **threshold where it changes** and the **anti-pattern** to avoid.

### Domain Advisor Generator -- 7 Non-Tech Domains

When `/dream` detects a non-developer domain, it auto-generates a domain-specific advisor skill with decision matrices, best practices, and anti-patterns:

| Domain | Generated decisions |
|--------|-------------------|
| Compliance | Regulation mapping, evidence strategy, assessment approach, documentation depth |
| Marketing | Channel strategy, funnel design, pricing model, KPI focus by revenue stage |
| Finance | Data model (event-sourced), calculation precision (integer-cents), reconciliation |
| Medical | Data standard (FHIR vs HL7), privacy model (HIPAA vs GDPR), terminology |
| Research | Literature scope, methodology, experiment design, statistical rigor |
| Legal | Contract structure, clause tracking, jurisdiction, risk classification |
| Logistics | Routing, inventory model, tracking granularity |

### Agent Emergence

Copilot starts with **zero project agents**. They emerge from the work.

```
Session 1 (milestones 1-3):
  0 project agents. Build basic structure.
  Git: 3 commits touching fastapi/, next/, supabase/

Session 2 (milestones 4-6):
  /evolve reads git log
  15 files in fastapi/ -> creates cc-fastapi agent
  8 files in next/ with i18n patterns -> creates cc-frontend-i18n agent
  2 agents, both from real code patterns

Session 3 (milestones 7-9):
  Compliance logic repeating across 6 files -> creates cc-compliance-engine agent
  3 project agents, all from evidence
  Environment specialized for THIS project

Session 4:
  Full evolved environment. /audit -> /ship -> deploy. COPILOT_COMPLETE
```

System agents (code-reviewer, test-writer, orchestrator-init) run the framework. Project agents emerge from the work. Two separate layers.

### Context Artifacts

Before implementing any feature, AZCLAUDE scans for non-code knowledge that informs implementation:

| Type | Examples | Why it matters |
|------|---------|---------------|
| Database schemas | schema.sql, prisma/schema.prisma | Know table structure before writing queries |
| API specs | openapi.yaml, swagger.json, .proto files | Know endpoints before building integrations |
| Infra configs | terraform/, docker-compose.yml | Know deployment constraints before architecture decisions |
| Architecture docs | docs/architecture.md, ADRs | Know design decisions before proposing changes |
| Domain knowledge | knowledge/, business rules | Know domain constraints before implementing logic |

Artifact discovery runs automatically in copilot mode. `/evolve` checks for stale references.

---

## All 26 Commands

### Build and Ship

| Command | What it does |
|---------|-------------|
| `/copilot` | Autonomous milestone execution. Plan, build, test, commit, evolve, ship. Zero human input. |
| `/dream` | Idea to full project scaffold. Rules, memory, skills, agents -- built level by level. |
| `/setup` | Analyze existing project. Detect domain + stack + scale. Build environment. |
| `/add` | Add a feature. In copilot mode: uses milestone spec directly. |
| `/fix` | REPRODUCE, INVESTIGATE, HYPOTHESIZE, FIX -- show passing tests. |
| `/audit` | Spec-first review (read-only). In copilot mode: reviews against copilot-intent.md. |
| `/test` | IDE diagnostics, framework detection, exit-code gate, failure classification. |
| `/blueprint` | Read-only analysis. Structured plan.md with milestones. In copilot mode: skips approval. |
| `/ship` | Tests, secrets scan, commit, push. In copilot mode: auto-deploys. |
| `/refactor` | Restructure safely. Tests before + after. Worktree isolation for risky changes. |
| `/doc` | Generate docs from code. Matches existing style. |
| `/migrate` | Upgrade deps/frameworks. Researches breaking changes. |
| `/deps` | Audit: outdated, vulnerable, unused packages. |

### Think and Improve

| Command | What it does |
|---------|-------------|
| `/debate` | Adversarial debate with evidence scoring (AceMAD protocol). Order-independent, length-independent. |
| `/evolve` | Scan for gaps, generate fixes, quality-gate them. Create agents from evidence. 3 cycles. |
| `/reflexes` | View/analyze learned behavioral patterns. Confidence scoring. Promote to global scope. |
| `/level-up` | Show current level (0-10), build the next one. |
| `/find` | Search across commands, ~/shared-skills/, capabilities. |
| `/create` | Build a new command with frontmatter and tests. |
| `/reflect` | Self-improve CLAUDE.md from conversation friction. |
| `/hookify` | Generate hooks from friction patterns. 5 hook types. |

### Memory and Session

| Command | What it does |
|---------|-------------|
| `/snapshot` | Mid-session snapshot: WHY + decisions + what's next. |
| `/persist` | End-of-session: goals, friction log, session summary. |
| `/pulse` | Health check + recent changes + current level. |
| `/explain` | Code or error to plain language. |
| `/loop` | Repeat any command on an interval via CronCreate. |

---

## 8 Skills (Auto-Invoked)

Skills fire automatically based on context -- no slash command needed.

| Skill | Triggers on |
|-------|------------|
| session-guard | Session start, context reset, idle detection |
| test-first | Writing/fixing code in TDD projects |
| env-scanner | Project setup, stack detection |
| debate | Decisions, trade-offs, comparisons |
| security | Credentials, auth, payments, secrets |
| skill-creator | "Create a skill", repeated workflows |
| agent-creator | "Create an agent", agent boundaries |
| architecture-advisor | Architecture decisions, which pattern/DB/framework for this project size |

Each skill has: `SKILL.md` (lean workflow), `references/` (deep content), `scripts/` (deterministic detection).

---

## Memory System

Three layers work silently. Context compaction stops being a problem.

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

| Layer | Mechanism | Survives compaction | Automatic |
|-------|-----------|-------------------|-----------|
| File breadcrumb | PostToolUse -> goals.md | Yes -- WHERE + WHAT changed | Yes, every edit |
| Reasoning snapshot | /snapshot -> checkpoints/ | Yes -- WHY decisions were made | Manual, every 15-20 turns |
| Session narrative | /persist -> sessions/ | Yes -- full summary + next actions | Manual, before closing |

`UserPromptSubmit` hook injects `goals.md` + latest checkpoint before every message. Token cost: ~500 tokens fixed, regardless of project history length.

---

## Security

Zero dependencies in `package.json`. The only external binary is `claude` CLI (installed separately). This eliminates supply-chain risk entirely.

### 6 Security Layers

1. **Hook integrity** -- SHA-256 hash verified on every run
2. **Command injection protection** -- shell metacharacters rejected in file paths
3. **Prompt injection defense** -- suspicious patterns stripped from context injection (`curl|bash`, `ignore previous instructions`, base64 blocks)
4. **Skill checksums** -- portable skills SHA-256 hashed, imports fail if tampered
5. **Credential auditing** -- `/ship` blocks on `.env`, API keys, tokens before any git push
6. **Agent scoping** -- review agents read-only (`EnterPlanMode`), experiments in isolated worktrees

### Hook Profiles

Control hook behavior via environment variable:

```bash
AZCLAUDE_HOOK_PROFILE=minimal  claude   # goals.md tracking only
AZCLAUDE_HOOK_PROFILE=standard claude   # all features (default)
AZCLAUDE_HOOK_PROFILE=strict   claude   # all features + extra validation
```

### Doctor Audit

```bash
npx azclaude doctor          # 32 checks: hooks, settings, commands, memory
npx azclaude doctor --audit  # efficiency + security score
```

See [SECURITY.md](SECURITY.md) for full details including known limitations and copilot-mode mitigations.

---

## Installation

### Install the AZCLAUDE environment

```bash
npx azclaude
```

Works with Claude Code, Gemini CLI, Codex, OpenCode, and Cursor. Auto-detects your CLI and installs to the correct paths.

### Run /setup inside your project

```bash
/setup
```

### Verify

```bash
npx azclaude doctor
```

### Run Copilot (autonomous mode)

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

### Exit Conditions

| Condition | Exit code |
|-----------|-----------|
| `COPILOT_COMPLETE` in goals.md | 0 -- product shipped |
| Max sessions reached (default: 20) | 1 -- resume with `npx azclaude-copilot .` |
| All milestones blocked | 1 -- needs human intervention |

---

## Project Structure

```
azclaude-copilot/
├── bin/
│   ├── cli.js                       <- installer, doctor, demo
│   └── copilot.js                   <- autonomous runner (Node.js, cross-platform)
├── templates/
│   ├── CLAUDE.md                    <- dispatch table template
│   ├── hooks/                       <- pure Node.js, cross-platform
│   │   ├── user-prompt.js           <- injects goals.md + checkpoint at session start
│   │   ├── post-tool-use.js         <- writes file + diff stat on every edit
│   │   └── stop.js                  <- migrates In progress -> Done
│   ├── agents/              (7)     <- system + project agents
│   ├── capabilities/                <- 36 files, lazy-loaded via manifest.md
│   ├── commands/            (26)    <- all 26 commands including /copilot, /reflexes
│   ├── skills/              (8)     <- auto-invoked SKILL.md files + architecture-advisor
│   └── scripts/env-scan.sh
├── ROADMAP.md                       <- 5-phase build spec
├── DOCS.md                          <- full user guide
├── SECURITY.md                      <- security policy + architecture
├── tests/
│   └── test-features.sh          ← 1002 tests
```

---

## State Files

The runner is stateless. These files ARE the state.

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

## Verified

1002 tests. Every template, command, capability, agent, and CLI feature verified.

```bash
bash tests/test-features.sh
# Results: 1002 passed, 0 failed, 1002 total
```

---

## License

MIT -- [haytamAroui](https://github.com/haytamAroui)
