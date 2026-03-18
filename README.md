<p align="center">
  <h1 align="center">AZCLAUDE COPILOT</h1>
  <p align="center"><strong>Describe a product once. Walk away. Come back to a deployed app with full git history.</strong></p>
  <p align="center">
    <a href="#-one-command">One Command</a> ·
    <a href="#-how-it-works">How It Works</a> ·
    <a href="#-the-pipeline">Pipeline</a> ·
    <a href="#-agent-emergence">Agent Emergence</a> ·
    <a href="#-memory-system">Memory</a> ·
    <a href="#-all-25-commands">Commands</a>
  </p>
</p>

---

## The Problem

Every AI coding tool makes you the project manager. You prompt, review, approve, prompt again. You're the bottleneck. Context resets every session. Agents don't learn. Nothing accumulates.

**AZCLAUDE Copilot removes you from the loop entirely.**

```
Input:   "Build EU AI Act compliance SaaS with trilingual support"
Output:  Deployed product at azcomply.eu with full git history

Human input after first message: ZERO
```

---

## ⚡ One Command

```bash
npx azclaude-copilot . "EU AI Act compliance SaaS. Free deterministic
classification terminal. Paid 30-question assessment with PDF report.
FastAPI backend. Next.js frontend. Supabase. Trilingual EN/FR/NL. Stripe."
```

Walk away. Come back to:
- Full git history (one commit per milestone)
- Deployed product
- `copilot-report.md` with everything that was built
- Evolved environment with project-specific agents and skills

Resume anytime: `npx azclaude-copilot .`

---

## 🔁 How It Works

Three layers. The runner is dumb. The brain is smart. The environment accumulates.

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: THE RUNNER (bin/copilot.js)                   │
│  Node.js. Stateless. Dumb on purpose.                   │
│  Restarts Claude Code sessions until COPILOT_COMPLETE.  │
│  Reads nothing. Decides nothing. Just loops.            │
├─────────────────────────────────────────────────────────┤
│  LAYER 2: THE BRAIN (AZCLAUDE inside each session)      │
│  Reads goals.md, plan.md, checkpoint, patterns,         │
│  blockers, decisions, evolve-report                     │
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

## 🧬 The Pipeline

Every command in the pipeline detects copilot mode automatically (`[ -f .claude/copilot-intent.md ]`) and skips human interaction — no approval gates, no AskUserQuestion, no complexity gate pauses.

```
Session 1:  /dream → /plan → /add M1 → /add M2 → /add M3 → /checkpoint
Session 2:  /evolve → /add M4 → /add M5 → /add M6 → /checkpoint
Session 3:  /evolve → /add M7 → /add M8 → /add M9 → /checkpoint
Session 4:  /evolve → /review → /ship → COPILOT_COMPLETE
```

### Per Milestone

1. Read milestone from `plan.md` (description, expected files, dependencies)
2. Implement using `/add` (follows `patterns.md`, uses project agents)
3. Run tests — fix if failing (2 attempts max)
4. If still failing → log to `blockers.md`, skip, continue
5. Commit: `{type}: {what} — {why}`
6. Push + update `plan.md` status to `done`
7. `/checkpoint` (compaction protection)

### Every 3 Milestones

`/evolve` fires automatically:
- Scans git history for repeated patterns → creates project agents
- Detects convention drift → updates CLAUDE.md
- Re-evaluates remaining milestone priorities
- Retries blocked milestones with new context

### Self-Healing

When builds fail:
- Re-read error → check `antipatterns.md` → try alternative approach
- Record failure to `antipatterns.md` (every failure teaches the environment)
- Record success to `patterns.md`
- If stuck → `/debate` finds alternative approach from blocker context

### Blocker Recovery

After all non-blocked milestones are done:
- Re-read `blockers.md` with full project context available
- Retry blocked milestones (often unblocked by later work)
- If still stuck → `/debate` → if no solution → mark `skipped`

---

## 🧠 Agent Emergence

This is the key differentiator. Copilot starts with **ZERO project agents**. They emerge from the work.

```
Session 1 (milestones 1-3):
  0 project agents
  /dream + /plan + build basic structure
  Git: 3 commits touching fastapi/, next/, supabase/

Session 2 (milestones 4-6):
  /evolve reads git log
  15 files changed in fastapi/ → creates cc-fastapi agent
  8 files in next/ with i18n patterns → creates cc-frontend-i18n agent
  2 agents now, both from real code patterns

Session 3 (milestones 7-9):
  /evolve reads more git log
  Compliance logic repeating across 6 files → creates cc-compliance-engine agent
  3 project agents, all from evidence
  Environment specialized for THIS project

Session 4 (milestones 10-12):
  Full evolved environment
  /review → /ship → deploy
  COPILOT_COMPLETE
```

System agents (code-reviewer, test-writer, orchestrator-init) run the framework.
Project agents emerge from the work. Two separate layers.

---

## 🆚 Why It's Different

| Feature | Claude Code | Ralph Loop | Lovable | AZCLAUDE Copilot |
|---------|------------|------------|---------|-----------------|
| Autonomous loop | — | ✓ | — | ✓ |
| Memory across sessions | — | Git only | — | Goals + checkpoints + patterns |
| Self-evolving agents | — | — | — | ✓ (from git evidence) |
| Convention enforcement | — | — | — | ✓ (CLAUDE.md + patterns.md) |
| Architecture decisions | — | — | — | ✓ (/debate with fact-check) |
| Any stack | ✓ | ✓ | Next.js only | ✓ |
| You own the code | ✓ | ✓ | — | ✓ |
| Zero infrastructure | ✓ | ✓ | — | ✓ |
| Deploy included | — | — | ✓ | ✓ |

---

## 🗂️ State Files

The runner is stateless. These files ARE the state.

| File | Written by | Read by | Purpose |
|------|-----------|---------|---------|
| `.claude/copilot-intent.md` | Runner | /dream, /copilot | Original product description |
| `.claude/plan.md` | /plan | /copilot, /add | Milestone tracker with status |
| `.claude/memory/goals.md` | Hooks | Every session start | File breadcrumbs + session state |
| `.claude/memory/checkpoints/*` | /checkpoint | Every session start | Reasoning snapshots |
| `.claude/memory/patterns.md` | /evolve, agents | Agents, /add | What works |
| `.claude/memory/antipatterns.md` | /evolve, agents | Agents, /add | What broke |
| `.claude/memory/decisions.md` | /debate | Agents | Architecture choices |
| `.claude/memory/blockers.md` | /copilot | /copilot, /debate | What's stuck and why |
| `.claude/copilot-report.md` | /copilot | Human | Final summary |

---

## 💾 Memory System

Three layers work silently. Context compaction stops being a problem.

| Layer | Mechanism | Survives compaction | Automatic |
|-------|-----------|-------------------|-----------|
| **File breadcrumb** | PostToolUse → goals.md | ✓ WHERE + WHAT changed | ✓ Every edit |
| **Reasoning snapshot** | /checkpoint → checkpoints/ | ✓ WHY decisions were made | Run every 15-20 turns |
| **Session narrative** | /persist → sessions/ | ✓ Full summary + next actions | Run before closing |

`UserPromptSubmit` hook injects `goals.md` + latest checkpoint before every message. No re-explanation needed.

---

## 📋 All 25 Commands

### Build & Ship

| Command | What it does |
|---------|-------------|
| `/copilot` | **Autonomous milestone execution.** Plan → Build → Test → Commit → Evolve → Ship. Zero human input. |
| `/dream` | Idea → full project scaffold. Rules, memory, skills, agents — built level by level |
| `/setup` | Analyzes existing project. Detects domain + stack + scale. Builds everything |
| `/add` | Add a feature. Complexity gate for 4+ files. In copilot mode: uses milestone spec directly |
| `/fix` | REPRODUCE → INVESTIGATE → HYPOTHESIZE → FIX → show passing tests |
| `/review` | Spec-first review. In copilot mode: reviews against copilot-intent.md |
| `/test` | IDE diagnostics → framework detection → exit-code gate → failure classification |
| `/plan` | Read-only analysis → structured plan.md with milestones. In copilot mode: skips approval |
| `/ship` | Tests → secrets scan → commit → push. In copilot mode: auto-deploys to Vercel/Railway |
| `/refactor` | Restructure safely. Tests before + after. Worktree isolation for risky changes |
| `/doc` | Generate docs from code. Matches existing style |
| `/migrate` | Upgrade deps/frameworks. Researches breaking changes |
| `/deps` | Audit: outdated, vulnerable, unused packages |

### Think & Improve

| Command | What it does |
|---------|-------------|
| `/debate` | Adversarial debate with evidence scoring. In copilot mode: frames from blockers.md |
| `/evolve` | Scans for gaps → generates fixes → quality-gates them. Creates agents from evidence |
| `/reflexes` | View/analyze learned behavioral patterns with confidence scoring. Detects tool-use patterns from observations |
| `/level-up` | Shows current level (0-10) → builds the next one |
| `/find` | Search across commands, ~/shared-skills/, capabilities |
| `/create` | Build a new command with frontmatter and tests |
| `/reflect` | Self-improve CLAUDE.md from conversation friction |
| `/hookify` | Generate hooks from friction patterns |

### Memory & Session

| Command | What it does |
|---------|-------------|
| `/checkpoint` | Mid-session snapshot: WHY + decisions + what's next |
| `/persist` | End-of-session: goals, friction log, session summary |
| `/status` | Health check + recent changes + current level |
| `/explain` | Code or error → plain language |
| `/loop` | Repeat any command on an interval |

### 8 Skills (Auto-Invoked)

| Skill | Triggers on |
|-------|------------|
| session-guard | Session start, context reset |
| test-first | Writing/fixing code in TDD projects |
| env-scanner | Project setup, stack detection |
| debate | Decisions, trade-offs, comparisons |
| security | Credentials, auth, payments, secrets |
| skill-creator | "Create a skill", repeated workflows |
| agent-creator | "Create an agent", agent boundaries |
| architecture-advisor | Architecture decisions, which pattern/DB/framework for this project size |

---

## 🧭 Evidence-Based Decision Guidance

Claude already knows every framework. These skills guide **when to use which approach** based on project context.

### Architecture Advisor (Tech Projects)

Auto-fires on architecture decisions. 8 decision matrices with thresholds:

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

### Domain Advisor Generator (Non-Tech Projects)

When `/dream` detects a non-developer domain, it auto-generates a domain-specific advisor skill:

| Domain | Generated decisions |
|--------|-------------------|
| **Compliance** | Which regulation, evidence strategy, assessment approach, documentation depth |
| **Marketing** | Channel strategy, funnel design, pricing model, KPI focus by revenue stage |
| **Finance** | Data model (event-sourced), calculation precision (integer-cents), reconciliation |
| **Medical** | Data standard (FHIR vs HL7), privacy model (HIPAA vs GDPR), terminology |
| **Research** | Literature scope, methodology, experiment design, statistical rigor |
| **Legal** | Contract structure, clause tracking, jurisdiction, risk classification |
| **Logistics** | Routing, inventory model, tracking granularity |

Skills guide decisions. Agents own code territories. Both generated from evidence.

---

## 🚀 Installation

```bash
# Install AZCLAUDE environment
npx azclaude

# Run /setup inside your project
/setup

# Verify
npx azclaude doctor
```

### Run Copilot

```bash
# New project — describe and walk away
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
| `COPILOT_COMPLETE` in goals.md | 0 — product shipped |
| Max sessions reached (default: 20) | 1 — resume with `npx azclaude-copilot .` |
| All milestones blocked | 1 — needs human intervention |

---

## 🏗️ Project Structure

```
azclaude-copilot/
├── bin/
│   ├── cli.js                       ← installer, doctor, demo
│   └── copilot.js                   ← autonomous runner (Node.js, cross-platform)
├── templates/
│   ├── CLAUDE.md                    ← dispatch table template
│   ├── hooks/                       ← pure Node.js, cross-platform
│   │   ├── user-prompt.js           ← injects goals.md + checkpoint at session start
│   │   ├── post-tool-use.js         ← writes file + diff stat on every edit
│   │   └── stop.js                  ← migrates In progress → Done
│   ├── agents/              (7)     ← system + project agents
│   ├── capabilities/                ← 29 files, lazy-loaded via manifest.md
│   ├── commands/            (26)    ← all commands including /copilot, /reflexes
│   ├── skills/              (8)     ← auto-invoked SKILL.md files + architecture-advisor
│   └── scripts/env-scan.sh
├── ROADMAP.md                       ← 5-phase build spec
├── DOCS.md                          ← full user guide
├── tests/
│   └── test-features.sh          ← 950 tests
```

---

## ✅ Verified

950 tests. Every template, command, capability, agent, and CLI feature verified.

```bash
bash tests/test-features.sh
# Results: 950 passed, 0 failed, 950 total
```

---

## 🛡️ Security

- Hook integrity — SHA-256 hash verified on every run
- Command injection protection — shell metacharacters rejected
- Prompt injection defense — suspicious patterns stripped from context injection
- Skill checksums — portable skills verified before import
- Credential auditing — `/ship` blocks on .env, API keys, tokens
- Agent scoping — review agents read-only, experiments in isolated worktrees

---

## License

MIT — [haytamAroui](https://github.com/haytamAroui)
