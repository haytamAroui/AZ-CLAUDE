<p align="center">
  <h1 align="center">AZCLAUDE</h1>
  <p align="center"><strong>A complete AI coding environment — built on Claude Code's native architecture.</strong></p>
  <p align="center">
    <a href="https://www.npmjs.com/package/azclaude-copilot"><img src="https://img.shields.io/npm/v/azclaude-copilot.svg" alt="npm version"></a>
    <a href="https://github.com/haytamAroui/AZ-CLAUDE-COPILOT/actions/workflows/tests.yml"><img src="https://github.com/haytamAroui/AZ-CLAUDE-COPILOT/actions/workflows/tests.yml/badge.svg" alt="tests"></a>
    <a href="https://github.com/haytamAroui/AZ-CLAUDE-COPILOT/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license"></a>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D16-brightgreen" alt="node version"></a>
  </p>
  <p align="center">
    <a href="#install">Install</a> ·
    <a href="#the-core-idea">Core Idea</a> ·
    <a href="#zero-setup-grows-with-your-project">Zero Setup</a> ·
    <a href="#what-you-get">What You Get</a> ·
    <a href="#spec-driven-workflow">Spec-Driven</a> ·
    <a href="#memory-system">Memory</a> ·
    <a href="#self-improving-loop">Self-Improving Loop</a> ·
    <a href="#all-37-commands">Commands</a> ·
    <a href="#parallel-execution">Parallel</a> ·
    <a href="#mcp-integration">MCP</a> ·
    <a href="#autonomous-mode">Autonomous Mode</a> ·
    <a href="DOCS.md">Full Docs</a>
  </p>
</p>

---

## The Core Idea

**CLAUDE.md and markdown memory files are the best way to work with an LLM.**

Not vector databases. Not API wrappers. Not prompt templates. Plain markdown files, structured and injected at exactly the right moment.

Claude Code exposes this natively: `CLAUDE.md` for conventions, hooks for automation, `.claude/` for state. AZCLAUDE implements the full architecture on top of it — every file, every hook, every pattern proven to work.

```
Without AZCLAUDE:                     With AZCLAUDE:
─────────────────                     ──────────────
Claude starts every session blind.    Claude reads goals.md before your first message.
No project conventions.               CLAUDE.md has your stack, domain, and rules.
Repeats the same mistakes.            antipatterns.md prevents known failures.
Forgets what was decided.             decisions.md logs every architecture choice.
Loses reasoning mid-session.          /snapshot saves WHY — auto-injected next session.
CLAUDE.md drifts from reality.        /reflect finds stale rules and fixes them.
Builds the same agent repeatedly.     patterns.md encodes what worked.
Can't work autonomously.              /copilot builds, tests, commits, ships — unattended.
Plans without requirements.           /spec writes structured specs before any code is planned.
Milestones violate project rules.     constitution-guard blocks non-compliant milestones.
Plan drifts from what was built.      /analyze catches ghost milestones before they ship.
Agents run serially, one at a time.   Task Classifier + parallel waves run agents simultaneously.
```

One install. Any stack. Zero dependencies.

---

## Zero Setup. Grows With Your Project.

Most AI coding tools require upfront decisions: which agents to create, what prompts to write, which skills to define. You can't know that before the project exists.

AZCLAUDE inverts this. **You start with almost nothing. The environment builds itself from evidence.**

```bash
npx azclaude-copilot@latest   # one command. that's it.
```

No agent files to write. No skills to configure. No prompt engineering. `npx azclaude-copilot` installs 39 commands, 4 hooks, memory structure, and a manifest. The rest is generated from your actual codebase as you work. Run the same command again later — it auto-detects whether to skip, install, or upgrade.

**What the environment looks like across sessions:**

```
Day 1 — /setup runs:
  Scans your code. Detects domain + stack + scale.
  Fills CLAUDE.md with your actual project data (no placeholders).
  Generates 2 project-specific skills from your file patterns.
  Creates goals.md. Hooks are wired.

Day 2 — you just work. Hooks observe silently:
  Every edit → breadcrumb in goals.md (automatic)
  Every tool sequence → logged to observations.jsonl (automatic)
  Session end → "In progress" migrates to "Done" (automatic)
  Session start → goals.md + last checkpoint injected (automatic)

Day 5 — /evolve reads your git history:
  auth/ files always change together → cc-auth agent created
  6 locale files always co-edited → i18n-sync skill created
  No decisions made by you. Git evidence decides.

Day 10 — /reflect reads friction logs:
  STALE DATA — design tokens in CLAUDE.md don't match codebase
  MISSING RULE — wrong agent routing causing silent failures
  Proposes exact fixes. You approve. CLAUDE.md corrects itself.

Day 30 — you finish the project:
  Environment score: 42/100 → 91/100
  Agents specialized to your codebase. Reflexes learned from your patterns.
  CLAUDE.md reflects how the project actually works — not what you guessed on day 1.
```

**The project you finish with is not the project you started with.** Not because you configured it — because the system learned from the work.

### How lazy loading keeps it fast

37 capability files exist in `.claude/capabilities/`. Without discipline, every task would load all of them. Instead, `manifest.md` acts as a routing table:

```
CLAUDE.md → read manifest.md → load ONLY the files for this task (~380 tokens)
```

Claude reads the manifest (one file), finds which 1–3 capability files apply, loads only those. Adding a new agent or skill doesn't increase the cost of unrelated tasks. The environment grows without bloating context.

---

## Install

```bash
npx azclaude-copilot@latest
```

One command, no flags. Auto-detects whether this is a fresh install or an upgrade:

- **First time** → full install (39 commands, 4 hooks, 15 agents, 10 skills, memory, reflexes)
- **Already installed, older version** → auto-upgrades everything to latest templates
- **Already up to date** → verifies, no overwrites

```bash
npx azclaude-copilot@latest doctor   # 32 checks — verify everything is wired correctly
```

---

## What You Get

**39 commands** · **10 auto-invoked skills** · **15 agents** · **4 hooks** · **memory across sessions** · **learned reflexes** · **self-evolving environment**

```
.claude/
├── CLAUDE.md                 ← dispatch table: conventions, stack, routing
├── commands/                 ← 39 slash commands (/add, /fix, /copilot, /parallel, /mcp, /sentinel...)
├── skills/                   ← 10 skills (test-first, security, architecture-advisor, frontend-design...)
├── agents/                   ← 15 agents (orchestrator, spec-reviewer, constitution-guard...)
├── capabilities/             ← 43 files, lazy-loaded via manifest.md (~380 tokens/task)
├── hooks/
│   ├── user-prompt.js        ← injects goals.md + checkpoint before your first message
│   ├── pre-tool-use.js       ← blocks hardcoded secrets before any file write
│   ├── post-tool-use.js      ← writes breadcrumb to goals.md on every edit
│   └── stop.js               ← migrates In-progress → Done, trims, resets counter
└── memory/
    ├── goals.md              ← rolling ledger of what changed and why
    ├── checkpoints/          ← WHY decisions were made (/snapshot)
    ├── patterns.md           ← what worked — agents read this before implementing
    ├── antipatterns.md       ← what broke — prevents repeating failures
    ├── decisions.md          ← architecture choices logged by /debate
    ├── blockers.md           ← what's stuck and why
    └── reflexes/             ← learned behavioral patterns (confidence-scored)
```

---

## Three Ways to Use It

### 1. `/setup` — wire an existing project

```
/setup
```

Scans your codebase, detects domain + stack + scale, fills CLAUDE.md, creates goals.md, generates project-specific skills and agents. Run once. After that, every Claude Code session opens with full project context.

### 2. `/dream` — start from an idea, get a full environment

```
/dream "Build a compliance SaaS — FastAPI, Supabase, trilingual"
```

Builds everything from scratch in four phases:

```
Phase 1: Asks 4 questions (what, stack, who uses it, what's out of scope)
Phase 2: Scans existing environment — won't regenerate what already exists
Phase 3: Builds level by level:
         L1 → CLAUDE.md       L2 → MCP config
         L3 → Skills          L4 → Memory
         L5 → Agents          L6 → Hooks
Phase 3b: Domain advisor skill — auto-generated if non-dev domain detected
          (compliance, finance, medical, legal, logistics, research, marketing)
Phase 4: Quality gate — won't say "ready" without passing all checks
```

### 3. `/copilot` — walk away, come back to a product

```bash
npx azclaude-copilot . "Build a compliance SaaS with trilingual support"
# or resume:
npx azclaude-copilot .
```

Node.js runner restarts Claude Code sessions in a loop until `COPILOT_COMPLETE`. Each session reads state, picks next milestone, implements, tests, commits, evolves. No human input needed. [Details below.](#autonomous-mode)

---

## Spec-Driven Workflow

The biggest cause of wasted work: building the wrong thing correctly. The spec-driven workflow ensures you build what you actually meant to build.

```
/constitute → /spec → /clarify → /blueprint → /copilot → /analyze → /ship
```

| Command | Purpose |
|---------|---------|
| `/constitute` | Define ground rules before any planning. Non-negotiables, required patterns, definition of done. Copilot enforces on every milestone. |
| `/spec` | Write a structured spec: user stories (≥2), acceptance criteria (≥3), out-of-scope, failure modes. spec-reviewer validates quality — if incomplete, `/blueprint` is blocked. |
| `/clarify` | Structured interrogation (max 5 questions). Resolves open questions in a spec. Required before `/blueprint` if questions remain. |
| `/blueprint` | Derive a milestone plan from the spec. Each milestone traces to an acceptance criterion. Task classifier groups coupled work for parallel safety. |
| `/analyze` | Cross-artifact consistency check. Finds ghost milestones (marked done, files missing), spec vs. implementation drift, plan vs. reality gaps. |
| `/tasks` | Build dependency graph from plan.md. Shows parallelizable wave groups and critical path length. |
| `/issues` | Convert plan.md milestones to GitHub Issues. Deduplicates, creates labels, writes issue numbers back to plan.md. |

**What the gates prevent:**

| Without spec-driven | With spec-driven |
|---------------------|-----------------|
| Plan milestones that don't trace to requirements | spec-reviewer blocks /blueprint if ACs < 3 or goal unclear |
| Copilot builds things that violate project rules | constitution-guard blocks each milestone before dispatch |
| Ship code where plan.md says "done" but files are missing | /analyze catches ghost milestones; /ship blocks on them |
| Open questions resolved arbitrarily in implementation | /clarify forces answers before planning starts |

---

## Memory System

Claude needs two things at the start of every session — **what changed** and **why decisions were made**. Everything else is noise.

### Automatic (zero user input)

```
Every edit:    post-tool-use.js → breadcrumb in goals.md (timestamp, file, diff stats)
Before write:  pre-tool-use.js  → blocks hardcoded secrets
Session end:   stop.js          → In-progress migrates to Done, trims to 20 entries
Session start: user-prompt.js   → injects goals.md + latest checkpoint + plan status
```

**Token cost: ~500 tokens fixed.** goals.md auto-rotates at 30 entries — oldest 15 archived, newest 15 kept. Same cost at session 5 or session 500.

### Manual (you control)

```bash
/snapshot     # save WHY decisions were made — auto-injected next session
              # run every 15–20 turns to protect against context compaction
/persist      # end-of-session: update goals.md, write session narrative
/pulse        # health check — recent changes, blockers, next steps
```

### Hook profiles

```bash
AZCLAUDE_HOOK_PROFILE=minimal  claude   # goals.md tracking only
AZCLAUDE_HOOK_PROFILE=standard claude   # all features (default)
AZCLAUDE_HOOK_PROFILE=strict   claude   # all + reflex guidance injection
```

### State files — the runner is stateless, these files ARE the state

| File | Written by | Read by | Purpose |
|------|-----------|---------|---------|
| `CLAUDE.md` | /setup, /dream | Every session | Conventions, routing, project identity |
| `memory/goals.md` | Hooks | Every session start | File breadcrumbs + session state |
| `memory/checkpoints/` | /snapshot | Every session start | WHY decisions were made |
| `memory/patterns.md` | /evolve, agents | Agents, /add, /fix | What works — follow this |
| `memory/antipatterns.md` | /evolve, agents | Agents, /add, /fix | What broke — avoid this |
| `memory/decisions.md` | /debate | All agents | Architecture choices — never re-debate |
| `memory/blockers.md` | /copilot | /copilot, /debate | What's stuck and why |
| `memory/reflexes/` | Hooks, /reflexes | /evolve, agents | Learned behavioral patterns |
| `plan.md` | /blueprint | /copilot, /add | Milestone tracker with status |

---

## Self-Improving Loop

AZCLAUDE doesn't just remember — it learns and corrects itself. Three commands form a feedback loop:

```
/reflect   →   Reads friction logs + session history
               Finds missing rules, dead rules, vague rules, contradictions
               Proposes exact CLAUDE.md edits. You approve. CLAUDE.md corrects itself.

/reflexes  →   Reads observations.jsonl (captured automatically by post-tool-use.js)
               Finds tool sequences, file co-access, error→fix pairs
               Creates confidence-scored reflex files (0.3 tentative → 0.9 certain)
               Strong reflexes (≥ 0.7) feed into /add behavior automatically

/evolve    →   Detects gaps: stale data, missing capabilities, context rot
               Generates fixes: new skills, new agents, updated patterns
               Quality-gates everything before merging
               Creates agents from git evidence (not guessing)
               Reports score delta (e.g. 42/100 → 68/100 in one cycle)
```

**Real example — what this loop found on a production project in one run:**

```
/reflect found:
  MISSING RULE  — Wrong agent routing causing silent failures every session
  MISSING RULE  — Domain-specific legal term kept drifting back into code
  STALE DATA    — Design tokens in CLAUDE.md were wrong hex values
  MISSING ROUTE — Most frequent task had no slash command dispatch

/reflexes found (from 78 observations, 3 sessions):
  i18n-all-6-locales        (confidence 0.85) → always edit all 6 locale files atomically
  page-tsx-read-before-edit  (0.75)            → re-read before touching — changes too often
  next-config-build-verify   (0.70)            → run tsc --noEmit after next.config.ts edits

/evolve found:
  plan.md frozen at 9/9 done — actually 18 milestones, M12–M18 active
  No i18n-sync skill despite 6-locale changes in every commit
  Score: 42/100 → 68/100
```

All without human diagnosis. The system found it, proposed fixes, applied them.

---

## Evolution System

`/evolve` finds gaps in the environment and fixes them. Three cycles:

**Cycle 1 — Environment Evolution:** Detects stale patterns, friction signals, context rot. Generates fixes. Quality-gates before merging.

**Cycle 2 — Knowledge Consolidation** (every 2+ sessions): Harvests patterns by recency + importance. Prunes stale entries. Auto-prunes reflexes where confidence < 0.15.

**Cycle 3 — Topology Optimization** (when friction detected): Measures agent influence. Identifies merge candidates. Tests in isolated worktree before adopting.

**Agent emergence from git evidence:**

```
Session 1: 0 project agents. Build basic structure.
           Git: 3 commits touching fastapi/, next/, supabase/

Session 2: /evolve reads git log
           15 files in fastapi/ → cc-fastapi agent created
           8 files in next/ with i18n patterns → cc-frontend-i18n agent created

Session 3: Compliance logic repeating across 6 files → cc-compliance-engine agent
           3 agents, all from real code — not guessing

Session 4: Full evolved environment. /audit → /ship → COPILOT_COMPLETE
```

Skills and agents that are project-generic get promoted to `~/shared-skills/` — improvements discovered in one project become available to all your projects.

---

## Autonomous Mode

### `/copilot` — describe a product, come back to working code

```bash
npx azclaude-copilot . "Build a compliance SaaS with trilingual support"
```

Node.js runner restarts Claude Code sessions in a loop until `COPILOT_COMPLETE`.

**Four-phase execution loop:**

```
Phase 1 — Intelligence gathering (parallel agents)
  Multiple analyst agents run simultaneously — arch, UX, market, compliance.
  Each returns findings. Orchestrator synthesizes.

Phase 2 — Debate synthesis
  /debate resolves tensions with evidence scoring. Produces prioritized action list.

Phase 3 — Blueprint (parallel explore agents)
  /blueprint runs explore agents in parallel. Writes file:line plan.
  Task Classifier groups coupled work → safe parallel dispatch by design.

Phase 4 — Execution (parallel milestone agents, worktree-isolated)
  Orchestrator dispatches same-wave milestones simultaneously.
  Each agent owns its scope. Orchestrator merges on completion.
```

**Three-tier intelligent team (Phase 4):**

```
Orchestrator          Problem-Architect          Milestone-Builder
─────────────         ─────────────────          ─────────────────
Reads plan.md    →    Analyzes milestone    →     Pre-reads all files
Selects wave          Returns Team Spec:          Implements
Dispatches            • agents needed             Runs tests
Monitors              • skills to load            Self-corrects (2 attempts)
Triggers /evolve      • Files Written (parallel   Commits + reports back
Never writes code       safety check)
                      • complexity estimate
                      Never implements
```

**Self-healing — every failure teaches the environment:**

```
Build step fails →
  1. Re-read the exact error (not a summary)
  2. Check antipatterns.md — seen this before?
  3. Try alternative approach
  4. Record what failed → antipatterns.md
  5. Record what worked → patterns.md
  Never fail silently.
```

**Copilot pipeline (with spec-driven workflow):**

```
Session 0:  /constitute → /spec → /clarify → /blueprint
Session 1:  /copilot → constitution-guard validates → M1, M2, M3 → /snapshot
Session 2:  /evolve → M4+M5 parallel → M6 → /analyze (ghost check) → /snapshot
Session 3:  /evolve → M7, M8, M9 → /snapshot
Session 4:  /evolve → /analyze → /audit → /ship → COPILOT_COMPLETE
```

**Exit conditions:**

| Condition | Exit code |
|-----------|-----------|
| `COPILOT_COMPLETE` in goals.md | 0 — product shipped |
| Max sessions reached (default: 20) | 1 — resume with `npx azclaude-copilot .` |
| All milestones blocked | 1 — needs human intervention |

---

## Parallel Execution

AZCLAUDE runs multiple Claude Code agents simultaneously on the same codebase — without file corruption or test interference. Each agent works in an isolated git worktree on its own branch.

```
M1 (schema) → done
                 ↓
    ┌────────────┬────────────┬────────────┬──────────────┐
    M2 (auth)   M3 (profile) M4 (email)   M5 (dashboard)   ← all run simultaneously
    └────────────┴────────────┴────────────┴──────────────┘
                 ↓
              M6 (E2E tests)
```

3 sequential waves instead of 6 sequential milestones. Same output, fraction of the time.

**Real session — Systems Registry sprint (compliance SaaS, 5 milestones):**

```
Phase 1 — Intelligence (4 agents, parallel)
  arch-analyst  → found broken auto-link bug in assess-paid/page.tsx
  ux-analyst    → identified save-to-registry conversion hole
  market-intel  → found FRIA + Art. 49 regulatory blue ocean
  compliance    → mapped 13 fields present vs 66 required
  Time: ~9 minutes. Equivalent human analyst work: full day.

Phase 2 — Debate synthesis (1 agent)
  4 tensions resolved with verdicts. Prioritized action list produced.

Phase 3 — Blueprint (3 explore agents, parallel)
  Read assess-paid page, systems pages, and API routes simultaneously.
  Produced file:line plan across 5 milestones.

Phase 4 — Execution (2 agents, parallel — classifier applied)
  dev-frontend (M1+M2)  64.5k tokens   assess-paid/page.tsx + save-registry UI
  dev-backend  (M4)     37.5k tokens   systems.py + DB migration SQL

Classifier merged M1+M2 automatically — both touch assess-paid/page.tsx.
M4 backend ran in parallel — completely independent file set, zero conflict risk.
```

**Four-layer safety model:**

```
Layer 0 — Task Classifier (blueprint, before milestones exist)
  Groups coupled work (same schema, config, utility module) into single milestones.
  Conflicts become impossible by design — before any safety checking begins.

Layer 1 — Directory check + shared-utility grep (blueprint, pre-plan)
  Fast, no agents spawned. Catches ~80% of remaining conflicts.

Layer 2 — Problem-architect exact file scan (post-plan, per milestone)
  Returns Files Written: exact paths + Parallel Safe: YES/NO.
  Corrects Layer 1 when it finds shared utilities across directories.

Layer 3 — Orchestrator dispatch gate (runtime, unconditional)
  Final overlap check before spawning. Cannot be bypassed.
```

**Automatic** via `/copilot`: the orchestrator reads `Wave:` fields in plan.md, dispatches same-wave milestones with `isolation: "worktree"` in a single message, then merges sequentially.

**Manual** via `/parallel M2 M3 M4 M5`: dispatch specific milestones simultaneously.

See [docs/parallel-execution.md](docs/parallel-execution.md) for the complete reference.

### Why coordination matters

Claude Code's `isolation: "worktree"` in the Task tool is a raw primitive — like `pthread_create`. You have threads, but threads alone aren't a concurrent system.

| Raw capability | AZCLAUDE coordination layer |
|---|---|
| Task tool spawns agents | Orchestrator decides WHEN and HOW MANY |
| Worktree isolates files | Blueprint classifier ensures they're safe to isolate |
| Agents can read files | Problem-architect pre-packages the exact context each needs |
| Agents can write code | Patterns/antipatterns constrain what they write |
| Agents can fail | Blocker recovery + /debate escalation handles the failure |
| Sessions end | goals.md + checkpoints + plan.md resume exactly where it stopped |
| Code accumulates | /evolve turns git evidence into new agents for next time |

6 desks is not a team. AZCLAUDE turns 6 desks into a coordinated team.

---

## Security

Zero dependencies in `package.json`. The only external binary is `claude` (installed separately). No supply-chain risk.

**4 enforcement points, always active:**

| Layer | Where | What it blocks |
|-------|-------|----------------|
| Secret blocking | `pre-tool-use.js` — before every write | `AKIA*`, `sk-*`, `ghp_*`, `glpat-*`, `xoxb-*`, `-----BEGIN PRIVATE KEY` |
| Prompt injection | `user-prompt.js` — before context injection | `curl\|bash`, `ignore previous instructions`, base64 payloads |
| Pre-ship scan | `/ship` — before every commit | Secrets in staged files, failing tests, IDE errors |
| Agent scoping | All review agents | Reviewer/auditor agents are read-only — no Write/Edit permissions |

### `/sentinel` — on-demand security scan

```bash
/sentinel          # full scan — 5 layers, 102 rules, scored 0–100 (grade A–F)
/sentinel --hooks  # hook integrity + permissions only
/sentinel --secrets # credential scan only
```

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

Any hardcoded secret → `BLOCKED`. `/ship` will not proceed until resolved. See [SECURITY.md](SECURITY.md) for full details.

---

## MCP Integration

AZCLAUDE recommends MCP servers based on your stack and wires them into daily-use commands.

```bash
/mcp    # detect stack → recommend → show install commands
```

**Universal (free, no API key):** `Context7` (live library docs before writing code), `Sequential Thinking` (iterative reasoning for planning).

**Stack-specific:** `GitHub MCP`, `Playwright MCP`, `Supabase MCP`, `Brave Search`.

---

## Intelligence Layer

### 10 Skills (auto-invoked)

| Skill | Triggers on |
|-------|------------|
| `session-guard` | Session start, context reset, idle detection |
| `test-first` | Writing/fixing code in TDD projects |
| `env-scanner` | Project setup, stack detection |
| `security` | Credentials, auth, payments, secrets |
| `debate` | Decisions, trade-offs, architecture comparisons |
| `skill-creator` | Repeated workflows, new capability needed |
| `agent-creator` | Agent boundaries, 5-layer structure |
| `architecture-advisor` | DB choice, rendering strategy, testing approach — by project scale |
| `frontend-design` | UI components, styling, layout decisions |
| `mcp` | MCP server recommendations based on stack |

### Architecture Advisor — 8 Decision Matrices

Not "which is popular" — which is right for **your project's scale**:

| Decision | SMALL | MEDIUM | LARGE |
|----------|-------|--------|-------|
| Architecture | Flat modules | Modular monolith | Monolith + targeted microservices |
| Database | SQLite | PostgreSQL | PostgreSQL + Redis + search |
| Testing | Test-after critical paths | TDD for business logic | Full TDD |
| API | tRPC (internal) | REST | REST + GraphQL (mobile) |
| Auth | Clerk / Supabase | Auth0 | Keycloak (self-hosted) |
| Deploy | Vercel / Railway | Managed containers | AWS/GCP with IaC |

Every recommendation includes the **threshold where it changes** and the **anti-pattern** to avoid.

### Domain Advisors — Auto-Generated for 7 Domains

When `/dream` or `/setup` detects a non-developer domain, a domain-specific advisor skill is generated automatically:

| Domain | What gets generated |
|--------|-------------------|
| Compliance | Regulation mapping, evidence strategy, article-level traceability |
| Finance | Event-sourced data model, integer-cents precision, reconciliation |
| Medical | FHIR vs HL7, HIPAA vs GDPR, clinical workflow |
| Marketing | Channel strategy, funnel design, pricing model |
| Research | Literature scope, methodology, statistical rigor |
| Legal | Contract structure, clause tracking, risk classification |
| Logistics | Routing, inventory model, tracking granularity |

### Reflexes — Learned Behavioral Patterns

Every tool use is observed. Patterns that repeat become reflexes:

```yaml
id: i18n-all-6-locales
trigger: "any src/messages/*.json file is edited"
action: "edit all 6 locale files in the same operation — never fewer"
confidence: 0.85      # 0.3 tentative → 0.9 certain
evidence_count: 6
```

- 3+ occurrences creates a reflex at confidence 0.3
- Confidence rises with confirming observations, decays -0.02/week without use
- Strong clusters evolve into skills or agents via `/evolve`
- Global promotion when seen in 2+ projects at confidence ≥ 0.8

---

## All 37 Commands

### Build and Ship

| Command | What it does |
|---------|-------------|
| `/copilot` | Autonomous milestone execution. Delegates to orchestrator team. Zero human input. |
| `/dream` | Idea → full project scaffold. CLAUDE.md, memory, skills, agents — level by level. |
| `/setup` | Analyze existing project. Detect domain + stack + scale. Build environment. |
| `/add` | Add a feature. Pre-analyzes scope via intelligent-dispatch before touching code. |
| `/fix` | REPRODUCE → INVESTIGATE → HYPOTHESIZE → FIX. Show passing tests. |
| `/audit` | Spec-first code review (read-only). Ghost milestone check. |
| `/test` | Framework detection, exit-code gate, failure classification. |
| `/blueprint` | Read-only analysis → structured plan.md. Task classifier + parallel optimization. |
| `/ship` | Ghost check → risk scan → tests → secrets scan → commit → push → deploy. |
| `/refactor` | Safe restructuring. Constitution pre-flight. Tests before + after. |
| `/doc` | Generate docs from code. Matches existing style. |
| `/migrate` | Upgrade deps/frameworks. Researches breaking changes. |
| `/deps` | Audit: outdated, vulnerable, unused packages. |

### Spec-Driven Development

| Command | What it does |
|---------|-------------|
| `/constitute` | Define ground rules. Non-negotiables, required patterns, definition of done. |
| `/spec` | Structured spec: user stories, acceptance criteria, out-of-scope, failure modes. |
| `/clarify` | Resolve open questions in a spec (max 5 questions). |
| `/analyze` | Cross-artifact consistency. Ghost milestones, spec drift, plan gaps. |
| `/tasks` | Dependency graph from plan.md. Wave groups + critical path. |
| `/issues` | Convert milestones to GitHub Issues with traceability. |
| `/parallel` | Run multiple milestones simultaneously. Worktree isolation + auto-merge. |
| `/mcp` | Recommend and install MCP servers for your stack. |
| `/driven` | Generate code-rules.md — DO/DO NOT coding contract. |
| `/verify` | Audit code against code-rules.md. Reports violations at `file:line`. |
| `/inoculate` | Scan agents/skills for context inoculation coverage. Based on Anthropic's misalignment paper. |
| `/ghost-test` | Detect reward hacking in test suites (AlwaysEqual, sys.exit bypass, framework patching). |

### Think and Improve

| Command | What it does |
|---------|-------------|
| `/debate` | Adversarial debate with evidence scoring (AceMAD protocol). |
| `/evolve` | Detect gaps → generate fixes → quality-gate → create agents from evidence. |
| `/sentinel` | Security scan — 5 layers, 102 rules, scored 0–100 (grade A–F). |
| `/reflexes` | View, analyze, promote learned behavioral patterns. |
| `/reflect` | Self-improve CLAUDE.md from friction logs + session history. |
| `/level-up` | Show current level (0–10), build the next one. |
| `/find` | Search across commands, `~/shared-skills/`, capabilities. |
| `/create` | Build a new command with frontmatter and tests. |
| `/hookify` | Generate hooks from friction patterns. 5 hook types. |

### Memory and Session

| Command | What it does |
|---------|-------------|
| `/snapshot` | Save WHY you made decisions. Auto-injected next session. |
| `/persist` | End-of-session: update goals.md, write session narrative. |
| `/pulse` | Health check — recent changes, level, reflexes, blockers. |
| `/explain` | Code or error to plain language. |
| `/loop` | Repeat any command on an interval via CronCreate. |

---

## Skills vs Agents — The Right Tool

### Skills: project-specific guidance

A skill fires automatically when Claude needs context it can't derive from code alone. The best skill answers: **"In this project, when doing X, what do you need to know that you can't read from the files?"**

Skills are NOT generic instructions Claude already knows ("write clean code"). Skills ARE project-specific knowledge: "Our auth uses RS256 not HS256 — here's why" or "The 6 locale files must always be edited atomically."

### Agents: only for parallelism and isolation

An agent is a sub-process. Use one when work must happen **in parallel** or **in a separate context**. Not for organizing knowledge — skills do that cheaper.

**The test:** Would removing this agent and writing a skill produce worse results? If no — use a skill.

```
1. Craft a skill for the project-specific context Claude is missing
2. Watch if the same workflow keeps recurring (/reflexes will detect it)
3. If work can be parallelized or isolated → promote to an agent
4. Let /evolve make the call from git evidence
```

---

## Progressive Levels (0–10)

| Level | What gets built | Trigger |
|-------|----------------|---------|
| 0 | Nothing yet | Fresh project |
| 1 | CLAUDE.md — project rules + dispatch | `/setup` or `/dream` |
| 2 | MCP config | `/level-up` |
| 3 | Skills — project-specific commands | `/setup` generates ≥ 2 |
| 4 | Memory — goals.md, patterns, antipatterns | `/setup` |
| 5 | Agents — from git co-change analysis | `/evolve` after 5+ commits |
| 6 | Hooks — stateful session tracking | `npx azclaude-copilot` |
| 7 | External MCP servers | `/level-up` |
| 8 | Orchestrated pipeline — multi-agent | `/level-up` |
| 9 | Intelligence — debate, OPRO, ELO | `npx azclaude-copilot` |
| 10 | Self-evolving — loop-controller | `/evolve` sustained |

---

## What Makes It Different

| | Claude Code alone | AZCLAUDE |
|---|---|---|
| Project memory | Starts fresh every session | goals.md + checkpoints injected automatically |
| Conventions | Re-explained each time | CLAUDE.md — loaded before every task |
| Mid-session reasoning | Lost on compaction | /snapshot saves WHY — auto-injected next session |
| Learned behavior | None | Reflexes from tool-use, confidence-scored |
| CLAUDE.md quality | Drifts, never updated | /reflect finds and fixes stale rules |
| Architecture decisions | Re-debated every time | decisions.md — logged once, referenced forever |
| Failed approaches | Repeated | antipatterns.md — agents read before implementing |
| Security | Manual | 4-layer enforcement: write-time blocking + audit + pre-ship |
| Agent specialization | None | Project agents emerge from git evidence |
| Autonomous building | Not possible | /copilot — three-tier intelligent team |
| Self-improvement | Not possible | /evolve + /reflect + /reflexes loop |
| Requirements traceability | None | /spec → acceptance criteria → every milestone |
| Governance | None | constitution-guard blocks non-compliant milestones |
| Plan drift | Invisible | /analyze catches ghost milestones before they ship |
| Parallel safety | Raw worktree primitive | Four-layer classifier + safety model |
| Any stack | Yes | Yes |
| You own the code | Yes | Yes |
| Zero dependencies | — | Yes (0 in package.json) |

---

## Verified

1609 tests. Every template, command, capability, agent, hook, and CLI feature verified.

```bash
bash tests/test-features.sh
# Results: 1609 passed, 0 failed, 1609 total
```

---

## License

MIT — [haytamAroui](https://github.com/haytamAroui)