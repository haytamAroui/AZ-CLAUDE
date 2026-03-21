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
    <a href="#what-you-get">What You Get</a> ·
    <a href="#memory-system">Memory</a> ·
    <a href="#all-26-commands">Commands</a> ·
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
Builds the same agent repeatedly.     patterns.md encodes what worked.
Can't work autonomously.              /copilot builds, tests, commits, ships — unattended.
```

One install. Any stack. Zero dependencies.

---

## Install

**Step 1 — Install globally from your terminal:**

```bash
npm install -g azclaude-copilot@latest
```

**Step 2 — Run setup inside Claude Code to get the full capabilities:**

```bash
azclaude-copilot setup --full
```

That's it. Your project now has AZCLAUDE in `.claude/` — 26 commands, memory, hooks, reflexes, agents, and skills.

```bash
azclaude-copilot doctor   # 32 checks — verify everything is wired correctly
```

---

## What You Get

**26 commands** · **8 auto-invoked skills** · **10 agents** · **3 hooks** · **memory across sessions** · **learned reflexes** · **self-evolving environment**

```
.claude/
├── CLAUDE.md                 ← dispatch table: conventions, stack, routing
├── commands/                 ← 26 slash commands (/add, /fix, /audit, /copilot...)
├── skills/                   ← 8 skills (test-first, security, architecture-advisor...)
├── agents/                   ← 10 agents (orchestrator, code-reviewer, test-writer...)
├── capabilities/             ← 37 files, lazy-loaded via manifest.md (~380 tokens/task)
├── hooks/
│   ├── post-tool-use.js      ← writes breadcrumb to goals.md on every edit
│   ├── user-prompt.js        ← injects goals.md + checkpoint before your first message
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

### 2. `/dream` — start from an idea

```
/dream "Build a compliance SaaS — FastAPI, Supabase, trilingual"
```

Structured intake → environment scan → builds CLAUDE.md, memory, skills, agents, milestones level by level. If you have a non-developer domain (compliance, finance, medical, legal), it generates a domain-specific advisor skill with decision matrices automatically.

### 3. `/copilot` — walk away, come back to a product

```bash
npx azclaude-copilot . "Build a compliance SaaS with trilingual support"
```

Restarts Claude Code sessions in a loop until `COPILOT_COMPLETE`. Each session: reads state, picks next milestone, implements, tests, commits, evolves. No human input needed.

### Day-to-day

```bash
/add [feature]    # add a feature — pre-analyzes scope, follows patterns
/fix [bug]        # reproduce → investigate → fix → verify
/audit            # spec-first code review, read-only
/test             # framework detection, exit-code gate, failure classification
/evolve           # scan for gaps, generate fixes, create agents from evidence
/ship             # tests → secrets scan → commit → push → deploy
/pulse            # health check — recent changes, current level, next steps
/debate [topic]   # adversarial decision protocol with evidence scoring
/blueprint [plan] # read-only analysis → plan.md with milestones
/snapshot         # save WHY you made decisions — run every 15-20 turns
```

---

## Memory System

The core insight: **Claude needs to see two things at the start of every session — what changed, and why decisions were made.** Everything else is noise.

### How it works (zero user input)

```
Every edit:  PostToolUse hook → breadcrumb appended to goals.md
             (timestamp, file, diff stats, one-line summary)

Session end: Stop hook → In-progress migrates to Done
             Trims to 20 Done entries, archives overflow
             Resets counters

Session start: UserPromptSubmit hook → injects before your first message:
               ┌─ goals.md (capped: 30 in-progress + 20 done)
               ├─ latest checkpoint (capped at 50 lines)
               ├─ plan status: X/N done, Y in-progress, Z blocked  [copilot mode]
               └─ learned reflexes with confidence ≥ 0.8, max 5    [strict profile]
```

**Token cost: ~500 tokens fixed.** goals.md auto-rotates at 30 entries — oldest 15 archived, newest 15 kept. Same cost at session 5 or session 500.

### Manual layer (you control)

```bash
/snapshot     # save reasoning snapshot — WHY decisions were made
              # every 15-20 turns on complex work
              # auto-injected at next session start

/persist      # end-of-session: update goals.md, write session narrative
              # run before closing

/pulse        # read current state — what's healthy, what needs attention
```

### Hook profiles

```bash
AZCLAUDE_HOOK_PROFILE=minimal  claude   # goals.md tracking only
AZCLAUDE_HOOK_PROFILE=standard claude   # all features (default)
AZCLAUDE_HOOK_PROFILE=strict   claude   # all + reflex guidance injection
```

| Feature | minimal | standard | strict |
|---------|---------|----------|--------|
| goals.md tracking + memory rotation | ✓ | ✓ | ✓ |
| Checkpoint injection | ✓ | ✓ | ✓ |
| Reflex observations (observations.jsonl) | — | ✓ | ✓ |
| Cost tracking | — | ✓ | ✓ |
| Plan status (copilot mode) | — | ✓ | ✓ |
| Reflex guidance (confidence ≥ 0.8) | — | — | ✓ |

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
| `copilot-report.md` | /copilot | Human | Final autonomous run summary |

---

## Evolution System

`/evolve` finds gaps in the environment and fixes them. Three cycles:

**Cycle 1 — Environment Evolution**
- Detects: stale patterns, friction signals, context rot (poisoning / distraction / confusion / clash)
- Generates: fixes for each gap
- Evaluates: quality-gates before merging (syntax, self-applicability, pressure-test resilience)

**Cycle 2 — Knowledge Consolidation** (every 3+ sessions)
- Harvests patterns.md and sessions/ by recency + importance
- Prunes stale entries, consolidates redundant patterns
- Enriches agent definitions with accumulated learnings
- Auto-prunes reflexes where confidence < 0.15

**Cycle 3 — Topology Optimization** (when friction detected)
- Measures agent influence in pipelines
- Identifies merge candidates (overlapping agents)
- Tests changes in isolated worktree before adopting

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

## Intelligence Layer

### 8 Skills (auto-invoked — no slash command needed)

| Skill | Triggers on |
|-------|------------|
| `session-guard` | Session start, context reset, idle detection |
| `test-first` | Writing/fixing code in TDD projects (signal-based — only if project has tests) |
| `env-scanner` | Project setup, stack detection |
| `security` | Credentials, auth, payments, .env files, secrets, before /ship |
| `debate` | Decisions, trade-offs, "which is better", architecture comparisons |
| `skill-creator` | "Create a skill", repeated workflows, new capability |
| `agent-creator` | "Create an agent", agent boundaries, 5-layer structure |
| `architecture-advisor` | Architecture decisions, DB choice, rendering strategy, testing approach — by project scale |

### Architecture Advisor — 8 Evidence-Based Decision Matrices

Not "which is popular" — which is right for **your project's scale**:

| Decision | SMALL (< 50 files) | MEDIUM (50-500 files) | LARGE (500+ files) |
|----------|-------------------|----------------------|-------------------|
| Architecture | Flat modules | Modular monolith | Monolith + targeted microservices |
| Database | SQLite | PostgreSQL | PostgreSQL + Redis + search |
| Testing | Test-after critical paths | TDD for business logic | Full TDD |
| API | tRPC (internal) | REST | REST + GraphQL (mobile) |
| Auth | Clerk / Supabase | Auth0 | Keycloak (self-hosted) |
| State | useState | TanStack Query | Zustand + XState |
| Rendering | SSG or SPA | SSR / ISR | ISR + edge caching |
| Deploy | Vercel / Railway | Managed containers | AWS/GCP with IaC |

Every recommendation includes the threshold where it changes and the anti-pattern to avoid at that scale.

### Domain Advisor Generator — 7 Non-Tech Domains

When `/dream` or `/setup` detects a non-developer domain, a domain-specific advisor skill is generated automatically — with decision matrices, thresholds, and anti-patterns:

| Domain | What gets generated |
|--------|-------------------|
| Compliance | Regulation mapping, evidence strategy, article-level traceability, audit trail |
| Finance | Event-sourced data model, integer-cents precision, reconciliation, risk model |
| Medical | FHIR vs HL7, HIPAA vs GDPR privacy model, clinical workflow, terminology |
| Marketing | Channel strategy, funnel design, pricing model, metric focus by revenue stage |
| Research | Literature scope, methodology, experiment design, statistical rigor |
| Legal | Contract structure, clause tracking, jurisdiction, risk classification |
| Logistics | Routing, inventory model, tracking granularity |

### Reflexes — Learned Behavioral Patterns

Every tool use is observed. Patterns that repeat become reflexes:

```yaml
id: grep-before-edit
trigger: "when modifying code files"
action: "Search with Grep first, confirm with Read, then Edit"
confidence: 0.7       # 0.3 tentative → 0.9 near-certain
evidence_count: 8
domain: workflow
```

- `PostToolUse` hook captures observations to `reflexes/observations.jsonl` automatically
- 3+ occurrences creates a reflex at confidence 0.3
- Confidence rises with confirming observations, decays -0.02/week without use
- Strong clusters (3+ reflexes, avg confidence > 0.7) evolve into skills or agents
- Global promotion when seen in 2+ projects at confidence ≥ 0.8

### Context Artifacts — Non-Code Project Knowledge

Before implementing, AZCLAUDE discovers and reads non-code knowledge that informs implementation:

| Type | Examples | Why it matters |
|------|---------|---------------|
| Database schemas | `prisma/schema.prisma`, `schema.sql` | Know table structure before writing queries |
| API specs | `openapi.yaml`, `swagger.json`, `.proto` | Know endpoints before building integrations |
| Infra configs | `terraform/`, `docker-compose.yml` | Know deployment constraints before architecture decisions |
| Architecture docs | `docs/architecture.md`, ADRs | Know design decisions before proposing changes |
| Domain knowledge | `knowledge/`, business rules, regulations | Know domain constraints before implementing logic |

---

## Autonomous Mode

### `/copilot` — describe a product, come back to working code

```bash
npx azclaude-copilot . "Build a compliance SaaS with trilingual support"
# or resume existing run:
npx azclaude-copilot .
```

Node.js runner restarts Claude Code sessions in a loop until `COPILOT_COMPLETE`.

**Three-tier intelligent team (v0.4+):**

```
Orchestrator          Problem-Architect          Milestone-Builder
─────────────         ─────────────────          ─────────────────
Reads plan.md    →    Analyzes milestone    →     Pre-reads all files
Selects wave          Returns Team Spec:          Implements
Dispatches            • agents needed             Runs tests
Monitors              • skills to load            Self-corrects (budget)
Triggers /evolve      • files to pre-read         Commits + reports back
Never writes code     • Files Written (parallel safety)
                      • pre-conditions, risks
                      • complexity (SIMPLE/MEDIUM/COMPLEX)
                      Never implements
```

**Copilot pipeline:**
```
Session 1:  /dream → /blueprint (architect annotates milestones) → M1, M2, M3 → /snapshot
Session 2:  /evolve (new agents unblock plan) → M4+M5 parallel → M6 → /snapshot
Session 3:  /evolve → M7, M8, M9 → /snapshot
Session 4:  /evolve → /audit → /ship → COPILOT_COMPLETE
```

**Every 3 milestones:** `/reflexes analyze` + `/evolve` + orchestrator re-evaluates blocked milestones.

**Exit conditions:**

| Condition | Exit code |
|-----------|-----------|
| `COPILOT_COMPLETE` in goals.md | 0 — product shipped |
| Max sessions reached (default: 20) | 1 — resume with `npx azclaude-copilot .` |
| All milestones blocked | 1 — needs human intervention |

---

## All 26 Commands

### Build and Ship

| Command | What it does |
|---------|-------------|
| `/copilot` | Autonomous milestone execution. Delegates to orchestrator team. Zero human input. |
| `/dream` | Idea → full project scaffold. CLAUDE.md, memory, skills, agents — built level by level. |
| `/setup` | Analyze existing project. Detect domain + stack + scale. Build environment. |
| `/add` | Add a feature. Pre-analyzes scope via intelligent-dispatch before touching code. |
| `/fix` | REPRODUCE → INVESTIGATE → HYPOTHESIZE → FIX. Show passing tests. Never guesses. |
| `/audit` | Spec-first code review (read-only). Injects decisions.md + patterns.md as checklist. |
| `/test` | IDE diagnostics, framework detection, exit-code gate, failure classification. |
| `/blueprint` | Read-only analysis → structured plan.md. Architect annotates each milestone in copilot mode. |
| `/ship` | Risk scan → tests → secrets scan → commit → push. Auto-deploys in copilot mode. |
| `/refactor` | Safe restructuring. Tests before + after. Worktree isolation for high-risk changes. |
| `/doc` | Generate docs from code. Matches existing style. |
| `/migrate` | Upgrade deps/frameworks. Researches breaking changes. Worktree for major versions. |
| `/deps` | Audit: outdated, vulnerable, unused packages. |

### Think and Improve

| Command | What it does |
|---------|-------------|
| `/debate` | Adversarial debate with evidence scoring (AceMAD). Order-independent, length-independent. |
| `/evolve` | Detect gaps → generate fixes → quality-gate → create agents from evidence. 3 cycles. |
| `/reflexes` | View, analyze, promote learned behavioral patterns. Confidence scoring. |
| `/level-up` | Show current level (0-10), build the next one progressively. |
| `/find` | Search across commands, `~/shared-skills/`, capabilities manifest. |
| `/create` | Build a new command with frontmatter, trigger variants, and tests. |
| `/reflect` | Self-improve CLAUDE.md from conversation friction and session history. |
| `/hookify` | Generate hooks from friction patterns. 5 hook types (block / warn / remind / inject / track). |

### Memory and Session

| Command | What it does |
|---------|-------------|
| `/snapshot` | Mid-session: WHY + decisions + what's next. Auto-injected at next session start. |
| `/persist` | End-of-session: update goals.md, write session narrative to `sessions/`. |
| `/pulse` | Health check — recent changes, current level, reflexes, blockers, next steps. |
| `/explain` | Code or error to plain language. 2-3 paragraphs max. |
| `/loop` | Repeat any command on an interval via CronCreate. |

---

## 10 Agents

**Framework agents** (ship with AZCLAUDE, always available):

| Agent | Role |
|-------|------|
| `orchestrator` | Tech lead for `/copilot`. Owns plan.md. Dispatches, monitors, triggers /evolve. Never writes code. |
| `problem-architect` | Pre-flight analyst. Returns Team Spec (agents/skills/files/risks/complexity) before every dispatch. Never implements. |
| `milestone-builder` | Base builder. Pre-reads all files, implements, verifies, self-corrects (fix budget), commits, reports. |
| `orchestrator-init` | Runs once during `/setup`. Scans project, fills CLAUDE.md, creates goals.md. Exits permanently. |
| `loop-controller` | Level 10 autonomous agent. 3 cycles: evolution, knowledge consolidation, topology optimization. |
| `code-reviewer` | Spec-first review. Stage 1: spec compliance. Stage 2: quality. Read-only. Never modifies files. |
| `test-writer` | Reads existing test patterns. Matches framework, style, naming. Writes and runs tests. |
| `cc-template-author` | Writes AZCLAUDE template files with proper structure. |
| `cc-cli-integrator` | Integrates new features into `bin/cli.js`. |
| `cc-test-maintainer` | Maintains `tests/test-features.sh` with correct grep patterns. |

**Project agents** (emerge from your git history via `/evolve`):
- Named `cc-{area}`, scoped to specific directories
- Created when 3+ files in the same area change together across 2+ commits
- Every agent has exactly 5 layers: persona, scope, tools, constraints, domain knowledge

---

## What Makes It Different

| Feature | Claude Code alone | AZCLAUDE |
|---------|------------------|---------|
| Project memory | Starts fresh every session | goals.md + checkpoints injected automatically |
| Conventions | Ad-hoc, re-explained each time | CLAUDE.md — loaded before every task |
| Learned behavior | None | Reflexes extracted from tool-use, confidence-scored |
| Architecture decisions | Re-debated every time | decisions.md — logged once, referenced forever |
| Failed approaches | Repeated | antipatterns.md — agents read before implementing |
| Domain knowledge | Generic | Domain advisors generated for compliance, finance, medical, legal... |
| Agent specialization | None | Project agents emerge from git evidence, not guessing |
| Autonomous building | Not possible | /copilot — three-tier intelligent team |
| Self-improvement | Not possible | /evolve — 3-cycle environment evolution |
| Any stack | Yes | Yes |
| You own the code | Yes | Yes |
| Zero dependencies | — | Yes (0 in package.json) |

---

## Security

Zero dependencies in `package.json`. The only external binary is `claude` (installed separately). No supply-chain risk.

**6 layers:**
1. **Hook integrity** — SHA-256 hash verified on every run
2. **Command injection protection** — shell metacharacters rejected in file paths
3. **Prompt injection defense** — strips `curl|bash`, `ignore previous instructions`, base64 blocks from context injection
4. **Skill checksums** — portable skills SHA-256 hashed, imports fail if tampered
5. **Credential auditing** — `/ship` blocks on `.env`, `AKIA*`, `sk-*`, `ghp_*` before any git push
6. **Agent scoping** — review agents read-only (`EnterPlanMode`), experiments in isolated worktrees (`EnterWorktree`)

See [SECURITY.md](SECURITY.md) for full details.

---

## Verified

1197 tests. Every template, command, capability, agent, hook, and CLI feature verified.

```bash
bash tests/test-features.sh
# Results: 1197 passed, 0 failed, 1197 total
```

---

## License

MIT — [haytamAroui](https://github.com/haytamAroui)
