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
    <a href="#all-36-commands">Commands</a> ·
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
```

One install. Any stack. Zero dependencies.

---

## Zero Setup. Grows With Your Project.

Most AI coding tools require upfront decisions: which agents to create, what prompts to write, which skills to define. You can't know that before the project exists.

AZCLAUDE inverts this. **You start with almost nothing. The environment builds itself from evidence.**

```bash
npx azclaude-copilot@latest   # one command. that's it.
```

No agent files to write. No skills to configure. No prompt engineering. `npx azclaude-copilot` installs 37 commands, 4 hooks, memory structure, and a manifest. The rest is generated from your actual codebase as you work. Run the same command again later — it auto-detects whether to skip, install, or upgrade.

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

Claude reads the manifest (one file), finds which 1-3 capability files apply, loads only those. Adding a new agent or skill doesn't increase the cost of unrelated tasks. The environment grows without bloating context.

---

## Install

**Step 1 — Install globally from your terminal:**

```bash
npx azclaude-copilot@latest
```

That's it. One command, no flags. Auto-detects whether this is a fresh install or an upgrade:
- **First time** → full install (37 commands, 4 hooks, 15 agents, 10 skills, memory, reflexes)
- **Already installed, older version** → auto-upgrades everything to latest templates
- **Already up to date** → verifies, no overwrites

```bash
npx azclaude-copilot@latest doctor   # 32 checks — verify everything is wired correctly
```

---

## What You Get

**37 commands** · **9 auto-invoked skills** · **15 agents** · **4 hooks** · **memory across sessions** · **learned reflexes** · **self-evolving environment**

```
.claude/
├── CLAUDE.md                 ← dispatch table: conventions, stack, routing
├── commands/                 ← 36 slash commands (/add, /fix, /copilot, /parallel, /mcp, /sentinel...)
├── skills/                   ← 10 skills (test-first, security, architecture-advisor, frontend-design...)
├── agents/                   ← 15 agents (orchestrator, spec-reviewer, constitution-guard...)
├── capabilities/             ← 37 files, lazy-loaded via manifest.md (~380 tokens/task)
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

One command builds everything from scratch:

```
Phase 1: Asks 4 questions (what, stack, who uses it, what's out of scope)
Phase 2: Scans existing environment — won't regenerate what already exists
Phase 3: Builds level by level:
         L1 → CLAUDE.md (project rules + routing)
         L2 → MCP config
         L3 → Skills (project-specific commands)
         L4 → Memory (goals.md + patterns + antipatterns)
         L5 → Agents (specialized for your stack, from git evidence)
         L6 → Hooks (stateful session tracking)
Phase 3b: Domain advisor skill — auto-generated if non-dev domain detected
          (compliance, finance, medical, legal, logistics, research, marketing)
Phase 4: Quality gate — won't say "ready" without passing all checks
```

If your domain is compliance, finance, or medical — it generates a domain-specific advisor skill with decision matrices, thresholds, and anti-patterns automatically.

### 4. Spec-Driven Workflow — build what you actually meant to build

The biggest cause of wasted work: building the wrong thing correctly. `/dream` gives you an environment. The spec-driven workflow ensures you build what the environment is *for*.

```
/constitute    — define ground rules before any planning
                 Non-negotiables, required patterns, definition of done.
                 Copilot checks this before every milestone. Violations are blocked, not ignored.

/spec          — write a structured spec before /blueprint
                 User stories, acceptance criteria (3+), out-of-scope, failure modes.
                 spec-reviewer (haiku) validates quality — if incomplete, /blueprint is blocked.

/clarify       — resolve open questions in a spec
                 Structured interrogation (max 5 questions). Writes answers back into the spec.

/blueprint     — derive a milestone plan from the spec
                 Each milestone traces to an acceptance criterion.
                 spec-reviewer gates quality before planning starts.

/analyze       — cross-artifact consistency check
                 Detects ghost milestones (marked done, files missing),
                 spec vs. implementation drift, plan vs. reality gaps.
                 Runs automatically in /ship and /audit.

/tasks         — build a dependency graph from plan.md
                 Shows parallelizable wave groups and critical path length.
                 Tells orchestrator which milestones can run simultaneously.

/issues        — convert plan.md milestones to GitHub Issues
                 Creates labels (azclaude, copilot-milestone), deduplicates,
                 writes issue numbers back to plan.md for traceability.
```

**The full sequence:**
```
/constitute → /spec → /clarify → /blueprint → /copilot → /analyze → /ship
```

**What the gates actually prevent:**

| Without spec-driven | With spec-driven |
|---------------------|-----------------|
| Plan milestones that don't trace to requirements | spec-reviewer blocks /blueprint if ACs < 3 or goal unclear |
| Copilot builds things that violate project rules | constitution-guard blocks each milestone before dispatch |
| Ship code where plan.md says "done" but files are missing | /analyze catches ghost milestones; /ship blocks on them |
| Open questions resolved arbitrarily in implementation | /clarify forces answers before planning starts |

---

### 3. `/copilot` — walk away, come back to a product

```bash
npx azclaude-copilot . "Build a compliance SaaS with trilingual support"
# or resume existing run:
npx azclaude-copilot .
```

Node.js runner restarts Claude Code sessions in a loop until `COPILOT_COMPLETE`. Each session reads state, picks next milestone, implements, tests, commits, evolves. No human input needed.

### Day-to-day

```bash
/add [feature]    # add a feature — pre-analyzes scope, follows patterns
/fix [bug]        # reproduce → investigate → fix → verify
/audit            # spec-first code review, read-only
/test             # framework detection, exit-code gate, failure classification
/evolve           # scan for gaps, generate fixes, create agents from evidence
/ship             # tests → secrets scan → commit → push → deploy
/sentinel         # security scan — scored 0–100, grade A–F, 5 layers, 102 rules
/pulse            # health check — recent changes, current level, next steps
/debate [topic]   # adversarial decision protocol with evidence scoring
/snapshot         # save WHY you made decisions — auto-injected next session
/reflect          # find and fix stale/missing rules in CLAUDE.md
/reflexes         # view learned behavioral patterns with confidence scores
/parallel M2 M3   # run multiple milestones simultaneously (worktree isolation + auto-merge)
/mcp              # recommend and install MCP servers based on your stack
```

---

## Memory System

The core insight: **Claude needs to see two things at the start of every session — what changed, and why decisions were made.** Everything else is noise.

### How it works (zero user input)

```
Every edit:  pre-tool-use.js  → blocks hardcoded secrets before write
             post-tool-use.js → breadcrumb appended to goals.md
             (timestamp, file, diff stats, one-line summary)

Session end: stop.js → In-progress migrates to Done
             Trims to 20 Done entries, archives overflow
             Resets counters

Session start: user-prompt.js → injects before your first message:
               ┌─ goals.md (capped: 30 in-progress + 20 done)
               ├─ latest checkpoint (capped at 50 lines)
               ├─ plan status: X/N done, Y in-progress, Z blocked  [copilot mode]
               └─ learned reflexes with confidence ≥ 0.8, max 5    [strict profile]
```

**Token cost: ~500 tokens fixed.** goals.md auto-rotates at 30 entries — oldest 15 archived, newest 15 kept. Same cost at session 5 or session 500.

### Manual layer (you control)

```bash
/snapshot     # save reasoning snapshot — captures:
              #   • What you're doing right now (specific task, not project description)
              #   • WHY each decision was made this session
              #   • What you know that isn't written down yet  ← the key section
              #   • Top 3 next actions
              #   • Risks and open questions
              # Run every 15–20 turns. Auto-injected at next session start.
              # Protects against context compaction losing mid-session reasoning.

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

## Self-Improving Loop

AZCLAUDE doesn't just remember — it learns and corrects itself. Three commands form a loop that runs every few sessions:

```
/reflect   →   Reads friction logs + session history
               Finds missing rules, dead rules, vague rules, contradicting rules
               Proposes exact CLAUDE.md edits, one finding per change
               You approve → CLAUDE.md gets smarter

/reflexes  →   Reads observations.jsonl (captured automatically by post-tool-use.js)
               Finds tool sequences, file co-access, error→fix pairs, naming patterns
               Creates confidence-scored reflex files (0.3 tentative → 0.9 near-certain)
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
  MISSING RULE  — Domain-specific legal term (CAO 98) kept drifting back into code
  STALE DATA    — Design tokens in CLAUDE.md were wrong hex values (not matching codebase)
  MISSING ROUTE — Most frequent task had no slash command dispatch

/reflexes found (from 78 observations, 3 sessions):
  i18n-all-6-locales     (confidence 0.85) → always edit all 6 locale files atomically
  page-tsx-read-before-edit (0.75)          → re-read before touching — changes too often
  next-config-build-verify  (0.70)          → run tsc --noEmit after next.config.ts edits
  vertex-assess-co-edit     (0.60)          → vertex_client.py and assess_paid.py always coupled

/evolve found:
  plan.md frozen at 9/9 done — actually 18 milestones, M12–M18 active
  No i18n-sync skill despite 6-locale changes in every commit
  eu-ai-act-engine skill had no test recipe for zero-coverage modules
  Score: 42/100 → 68/100
```

All of this without human diagnosis. The system found it, proposed fixes, applied them.

**The same loop runs on AZCLAUDE itself.** When sentinel.md had a Windows path bug and a broken agent dispatch — a real project test exposed both. AZCLAUDE diagnosed them, fixed `sentinel.md`, tests went from 1195/1197 to 1197/1197, and shipped v0.4.9.

---

## Evolution System

`/evolve` finds gaps in the environment and fixes them. Three cycles:

**Cycle 1 — Environment Evolution**
- Detects: stale patterns, friction signals, context rot (poisoning / distraction / confusion / clash)
- Generates: fixes for each gap
- Evaluates: quality-gates before merging (syntax, self-applicability, pressure-test resilience)

**Cycle 2 — Knowledge Consolidation** (every 2+ sessions)
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

## Security

Zero dependencies in `package.json`. The only external binary is `claude` (installed separately). No supply-chain risk.

**6 layers, 4 enforcement points:**

| Layer | Where it runs | What it blocks |
|-------|--------------|----------------|
| Hook integrity | Every session start | SHA-256 mismatch → hooks tampered |
| Secret blocking | `pre-tool-use.js` — before every write | `AKIA*`, `sk-*`, `ghp_*`, `glpat-*`, `xoxb-*`, `-----BEGIN PRIVATE KEY` |
| Prompt injection defense | `user-prompt.js` — before context injection | `curl\|bash`, `ignore previous instructions`, base64 payloads in goals.md/checkpoints |
| Environment audit | `/sentinel` — on-demand, 102 rules | Scored 0–100, grade A–F across 5 layers |
| Pre-ship scan | `/ship` — before every commit | Secrets in staged files, failing tests, IDE errors |
| Agent scoping | All review agents | Reviewer/auditor agents are read-only — no Write/Edit permissions |

### `/sentinel` — Environment Security Scan

```bash
/sentinel          # full scan (default)
/sentinel --hooks  # Layer 1+2: hook integrity + permissions
/sentinel --mcp    # Layer 3: MCP server secrets and unknown packages
/sentinel --agents # Layer 4: prompt injection in agent files
/sentinel --secrets # Layer 5: credentials in committed code
```

Produces a scored report with verdict: `BLOCKED` / `CLEAR` / `PROCEED WITH CAUTION`.

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

Any hardcoded secret → `BLOCKED` — `/ship` will not proceed until resolved.

See [SECURITY.md](SECURITY.md) for full details.

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
id: i18n-all-6-locales
trigger: "any src/messages/*.json file is edited"
action: "edit all 6 locale files in the same operation — never fewer"
confidence: 0.85      # 0.3 tentative → 0.9 near-certain
evidence_count: 6
domain: workflow
scope: project        # promote to global when seen in 2+ projects at ≥ 0.8
```

- `post-tool-use.js` captures observations to `reflexes/observations.jsonl` automatically
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
Monitors              • skills to load            Self-corrects (2 fix attempts)
Triggers /evolve      • files to pre-read         Commits + reports back
Never writes code     • Files Written (parallel
                        safety — prevents
                        concurrent file corruption)
                      • pre-conditions, risks
                      • complexity (SIMPLE/MEDIUM/COMPLEX)
                      Never implements
```

**Self-healing protocol — every failure teaches the environment:**
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
Session 0:  /constitute → /spec → /clarify → /blueprint (spec-reviewed, constitution-checked)
Session 1:  /copilot → constitution-guard validates each milestone → M1, M2, M3 → /snapshot
Session 2:  /evolve → M4+M5 parallel → M6 → /analyze (ghost check) → /snapshot
Session 3:  /evolve → M7, M8, M9 → /snapshot
Session 4:  /evolve → /analyze → /audit → /ship → COPILOT_COMPLETE
```

**Every 3 milestones:** `/reflexes analyze` + `/evolve` + orchestrator re-evaluates blocked milestones.

**Exit conditions:**

| Condition | Exit code |
|-----------|-----------|
| `COPILOT_COMPLETE` in goals.md | 0 — product shipped |
| Max sessions reached (default: 20) | 1 — resume with `npx azclaude-copilot .` |
| All milestones blocked | 1 — needs human intervention |

---

## Parallel Execution

AZCLAUDE runs multiple Claude Code agents simultaneously on the same codebase — without file corruption or test interference. Each agent works in an isolated git worktree on its own branch. Changes merge sequentially after all agents complete.

```
M1 (schema) → done
                 ↓
    ┌────────────┬────────────┬────────────┐
    M2 (auth)   M3 (profile) M4 (email)   M5 (dashboard)   ← all run simultaneously
    ↓            ↓            ↓            ↓
    └────────────┴────────────┴────────────┘
                 ↓
              M6 (E2E tests)
```

**Automatic — via `/copilot`:** The orchestrator reads `Wave:` fields in plan.md (written by `/blueprint`), dispatches same-wave milestones with `isolation: "worktree"` in a single message, then merges sequentially.

**Manual — via `/parallel`:**
```bash
/parallel M2 M3 M4 M5    # dispatch these milestones simultaneously
```

**Four-layer safety:** Before creating any milestones, `/blueprint` runs a **Task Classifier** (Layer 0) — groups coupled work (same schema table, same config file, same utility module) into single milestones so conflicts are impossible by design. Then: directory isolation + shared-utility grep (Layer 1, no agents spawned). `problem-architect` returns exact `Files Written:` and `Parallel Safe:` per milestone (Layer 2). Orchestrator re-checks file overlap at dispatch time (Layer 3 — unconditional final gate).

See `docs/parallel-feature.md` for the complete reference.

---

## MCP Integration

AZCLAUDE recommends MCP servers based on your stack and wires them into daily-use commands.

```bash
/mcp    # detect stack → recommend universal MCPs → show install commands
```

**Universal (free, no API key — recommended for every project):**
- `Context7` — `/add` fetches live library docs before writing any library calls. Prevents stale API usage.
- `Sequential Thinking` — `/blueprint` and `/copilot` use iterative reasoning for milestone planning.

**Stack-specific:**
- `GitHub MCP` — any GitHub repo: richer `/ship` and PR creation
- `Playwright MCP` — any web project: E2E testing with qa-engineer
- `Supabase MCP` — Supabase in deps: schema introspection, migrations
- `Brave Search` — `/fix` looks up external library errors before guessing root cause

`/setup` checks MCP status at the end and nudges if none are configured.

---

## All 37 Commands

### Build and Ship

| Command | What it does |
|---------|-------------|
| `/copilot` | Autonomous milestone execution. Delegates to orchestrator team. Zero human input. |
| `/dream` | Idea → full project scaffold. CLAUDE.md, memory, skills, agents — built level by level. |
| `/setup` | Analyze existing project. Detect domain + stack + scale. Build environment. |
| `/add` | Add a feature. Pre-analyzes scope via intelligent-dispatch before touching code. |
| `/fix` | REPRODUCE → INVESTIGATE → HYPOTHESIZE → FIX. Show passing tests. Never guesses. |
| `/audit` | Spec-first code review (read-only). Ghost milestone check + decisions.md + patterns.md. |
| `/test` | IDE diagnostics, framework detection, exit-code gate, failure classification. |
| `/blueprint` | Read-only analysis → structured plan.md. spec-reviewer gates quality before planning. |
| `/ship` | Ghost check → risk scan → tests → secrets scan → commit → push. Auto-deploys in copilot mode. |
| `/refactor` | Safe restructuring. Constitution pre-flight. Tests before + after. Worktree for high-risk. |
| `/doc` | Generate docs from code. Matches existing style. |
| `/migrate` | Upgrade deps/frameworks. Researches breaking changes. Worktree for major versions. |
| `/deps` | Audit: outdated, vulnerable, unused packages. |

### Spec-Driven Development

| Command | What it does |
|---------|-------------|
| `/constitute` | Define project ground rules before any planning. Non-negotiables, required patterns, definition of done. Copilot enforces on every milestone. |
| `/spec` | Write a structured spec: goal, user stories (≥2), acceptance criteria (≥3), out-of-scope, failure modes. spec-reviewer validates before /blueprint. |
| `/clarify` | Structured interrogation loop (max 5 questions). Resolves open questions in a spec file. Required before /blueprint if any questions remain open. |
| `/analyze` | Cross-artifact consistency check. Finds ghost milestones (marked done, files missing), spec vs. code drift, plan vs. reality gaps. Read-only. |
| `/tasks` | Build dependency graph from plan.md. Shows parallelizable wave groups and critical path. Tells orchestrator which milestones can run simultaneously. |
| `/issues` | Convert plan.md milestones to GitHub Issues. Deduplicates, creates labels, writes issue numbers back to plan.md for traceability. |
| `/parallel` | Run multiple milestones simultaneously. Worktree isolation per agent. Auto-merges after all complete. Three-layer file collision safety. |
| `/mcp` | Recommend and install MCP servers based on detected stack. Wires Context7, Sequential Thinking, GitHub, Playwright, Brave Search, Supabase. |
| `/driven` | Generate `.claude/code-rules.md` — 6-question interview → DO/DO NOT coding contract. Read by every /add and /fix before writing code. |
| `/verify` | Audit existing code against `code-rules.md`. Reports violations at `file:line`. Auto-fix mode. Falls back to per-stack rule libraries when no contract exists. |

### Think and Improve

| Command | What it does |
|---------|-------------|
| `/debate` | Adversarial debate with evidence scoring (AceMAD). Order-independent, length-independent. |
| `/evolve` | Detect gaps → generate fixes → quality-gate → create agents from evidence. Drift analysis. |
| `/sentinel` | Security scan — 5 layers, 102 rules, scored 0–100 (grade A–F). Blocks /ship on findings. |
| `/reflexes` | View, analyze, promote learned behavioral patterns. Confidence scoring. |
| `/reflect` | Self-improve CLAUDE.md. Reads friction logs + session history. Proposes exact rule edits. |
| `/level-up` | Show current level (0-10), build the next one progressively. |
| `/find` | Search across commands, `~/shared-skills/`, capabilities manifest. |
| `/create` | Build a new command with frontmatter, trigger variants, and tests. |
| `/hookify` | Generate hooks from friction patterns. 5 hook types (block / warn / remind / inject / track). |

### Memory and Session

| Command | What it does |
|---------|-------------|
| `/snapshot` | Mid-session: WHY + decisions + what isn't written down yet + top 3 next actions. Auto-injected next session. |
| `/persist` | End-of-session: update goals.md, write session narrative to `sessions/`. |
| `/pulse` | Health check — recent changes, current level, reflexes, blockers, next steps. |
| `/explain` | Code or error to plain language. 2-3 paragraphs max. |
| `/loop` | Repeat any command on an interval via CronCreate. |

---

## 15 Agents

**Framework agents** (ship with AZCLAUDE, always available):

| Agent | Role |
|-------|------|
| `orchestrator` | Tech lead for `/copilot`. Owns plan.md. Reads constitution.md. Runs constitution-guard before every dispatch. Never writes code. |
| `problem-architect` | Pre-flight analyst. Returns Team Spec (agents/skills/files/risks/complexity) before every dispatch. Never implements. |
| `milestone-builder` | Base builder. Reads constitution.md FIRST. Pre-reads all files, implements, verifies, self-corrects, commits. |
| `spec-reviewer` | **New — haiku model.** Validates spec quality before /blueprint runs. 7 criteria. Verdict: APPROVED / NEEDS_CLARIFY / INCOMPLETE. Read-only gate. |
| `constitution-guard` | **New — haiku model.** Checks each milestone against constitution.md before dispatch. Verdict: APPROVED / VIOLATION. Blocks on violations. Read-only gate. |
| `orchestrator-init` | Runs once during `/setup`. Scans project, fills CLAUDE.md, creates goals.md. Exits permanently. |
| `loop-controller` | Level 10 autonomous agent. 3 cycles: evolution, knowledge consolidation, topology optimization. |
| `evolution-module` | Called by orchestrator to run /evolve and /level-up at Level 10. Delegates to loop-controller. |
| `intelligence-module` | Optional Level 8-9 agent. Pipeline isolation, debate engine, prompt optimization (OPRO), ELO ranking. |
| `code-reviewer` | Spec-first review. Stage 1: spec compliance. Stage 2: quality. Read-only. Never modifies files. |
| `security-auditor` | Pre-ship security scan. 102 rules across 5 layers. Verdict: APPROVE / REQUEST CHANGES / BLOCKED. |
| `test-writer` | Reads existing test patterns. Matches framework, style, naming. Writes and runs tests. |
| `cc-template-author` | Writes AZCLAUDE template files with proper structure. |
| `cc-cli-integrator` | Integrates new features into `bin/cli.js`. |
| `cc-test-maintainer` | Maintains `tests/test-features.sh` with correct grep patterns. |

**Project agents** (emerge from your git history via `/evolve`):
- Named `cc-{area}`, scoped to specific directories
- Created when 3+ files in the same area change together across 2+ commits
- Every agent has exactly 5 layers: persona, scope, tools, constraints, domain knowledge
- `cc-` prefix prevents framework collisions (langgraph, crewai, autogen)

---

## Skills vs Agents — The Right Tool

Claude Code is already capable. The goal is guidance, not instructions. Before creating an agent, understand what each tool is actually for.

### Skills: project-specific guidance

A skill is a markdown file that fires automatically when Claude needs context it can't derive from the code alone. The best skill answers one question: **"In this project, when doing X, what do you need to know that you can't read from the files?"**

Skills are NOT:
- Generic instructions Claude already knows ("write clean code", "add error handling")
- Boilerplate copied from another project without reading this one first
- A wrapper around knowledge Claude already has by default

Skills ARE:
- "In this compliance project, every obligation must be traced to an article number — here's the format"
- "Our auth module uses RS256 not HS256 — here's why and where that decision lives"
- "The 6 locale files must always be edited atomically — here's the co-edit pattern"

`/setup` and `/evolve` generate skills by running `problem-architect` first — it reads your actual file structure, co-change patterns, and conventions, then builds skills around the gaps it finds. Generic skill templates are not installed.

### Agents: only for parallelism and isolation

An agent is a sub-process. Use one when you need work to happen **in parallel** or **in a separate context** from the main session. Not for organizing knowledge — skills do that cheaper.

**Create an agent when:**
- Two workstreams can run concurrently (parallel dispatch saves real time)
- A task must be isolated from main context (experiments, reviews, security scans)
- There's enough domain depth to justify a dedicated context window (5+ files, unique conventions, a clear scope boundary)

**Don't create an agent when:**
- A tight skill + Claude's native capability already handles it
- You'd create it just to "have one for auth" or "have one for the frontend"
- The agent's instructions are things Claude already knows without being told

**The test:** Would removing this agent and writing a skill instead produce worse results? If no — use a skill. Agents cost tokens every time they're loaded. A skill that gives Claude the right context is lighter and often better.

### The right order

```
1. Craft a skill that gives Claude the project-specific context it's missing
2. Watch if the same workflow keeps recurring across sessions (/reflexes will detect it)
3. If work can be parallelized OR isolated → promote to an agent
4. Let /evolve make the call from git evidence — it sees what actually co-changes
```

---

## Progressive Levels (0–10)

AZCLAUDE builds capability progressively — start simple, grow into complexity:

| Level | What gets built | Trigger |
|-------|----------------|---------|
| 0 | Nothing yet | Fresh project |
| 1 | CLAUDE.md — project rules + dispatch | `/setup` or `/dream` |
| 2 | MCP config — database, browser, API access | `/level-up` |
| 3 | Skills — project-specific commands | `/setup` generates ≥ 2 |
| 4 | Memory — goals.md, patterns, antipatterns | `/setup` |
| 5 | Agents — from git co-change analysis | `/evolve` after 5+ commits |
| 6 | Hooks — stateful session tracking | `npx azclaude-copilot` |
| 7 | External MCP servers | `/level-up` |
| 8 | Orchestrated pipeline — multi-agent with problem-architect | `/level-up` |
| 9 | Intelligence — debate, OPRO, ELO, pipeline isolation | `npx azclaude-copilot` |
| 10 | Self-evolving — loop-controller, 3-cycle autonomous evolution | `/evolve` sustained |

Run `/level-up` at any time to see your current level and build the next one.

---

## What Makes It Different

| Feature | Claude Code alone | AZCLAUDE |
|---------|------------------|---------|
| Project memory | Starts fresh every session | goals.md + checkpoints injected automatically |
| Conventions | Ad-hoc, re-explained each time | CLAUDE.md — loaded before every task |
| Mid-session reasoning | Lost on context compaction | /snapshot saves WHY — auto-injected next session |
| Learned behavior | None | Reflexes extracted from tool-use, confidence-scored |
| CLAUDE.md quality | Drifts, never updated | /reflect finds stale/missing/dead rules and fixes them |
| Architecture decisions | Re-debated every time | decisions.md — logged once, referenced forever |
| Failed approaches | Repeated | antipatterns.md — agents read before implementing |
| Security | Manual | 4-layer enforcement: write-time blocking, context scan, audit, pre-ship |
| Domain knowledge | Generic | Domain advisors generated for compliance, finance, medical, legal... |
| Agent specialization | None | Project agents emerge from git evidence, not guessing |
| Autonomous building | Not possible | /copilot — three-tier intelligent team |
| Self-improvement | Not possible | /evolve + /reflect + /reflexes — 3-layer environment evolution |
| Requirements traceability | None | /spec + acceptance criteria → every milestone traces to a requirement |
| Governance enforcement | None | constitution-guard blocks milestones that violate non-negotiables |
| Plan vs. reality drift | Invisible | /analyze detects ghost milestones before they ship |
| Spec quality gate | None | spec-reviewer (haiku) validates before /blueprint starts planning |
| Any stack | Yes | Yes |
| You own the code | Yes | Yes |
| Zero dependencies | — | Yes (0 in package.json) |

---

## Verified

1578 tests. Every template, command, capability, agent, hook, and CLI feature verified.

```bash
bash tests/test-features.sh
# Results: 1578 passed, 0 failed, 1578 total
```

---

## License

MIT — [haytamAroui](https://github.com/haytamAroui)
