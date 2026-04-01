<div align="center">
  <h1>AZCLAUDE</h1>
  <p><strong>A complete AI coding environment — built on Claude Code's native architecture.</strong></p>
  <p>
    <a href="https://www.npmjs.com/package/azclaude-copilot"><img src="https://img.shields.io/npm/v/azclaude-copilot.svg" alt="npm version"></a>
    <a href="https://github.com/haytamAroui/AZ-CLAUDE-COPILOT/actions/workflows/tests.yml"><img src="https://github.com/haytamAroui/AZ-CLAUDE-COPILOT/actions/workflows/tests.yml/badge.svg" alt="tests"></a>
    <a href="https://github.com/haytamAroui/AZ-CLAUDE-COPILOT/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license"></a>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D16-brightgreen" alt="node version"></a>
  </p>
  <p>
    <a href="#the-core-idea">Core Idea</a> ·
    <a href="#how-it-works-the-execution-pipeline">Pipeline</a> ·
    <a href="#install">Install</a> ·
    <a href="#what-you-get">What You Get</a> ·
    <a href="#structured-for-claude-frontmatter--xml-tags">Structure</a> ·
    <a href="#architecture-philosophy">Architecture</a> ·
    <a href="#autonomous-mode">Autonomous Mode</a> ·
    <a href="#parallel-execution">Parallel</a> ·
    <a href="#what-makes-it-different">Compare</a> ·
    <a href="DOCS.md">Full Docs</a>
  </p>
</div>

---

## The Core Idea

**CLAUDE.md and markdown memory files are the best way to work with an LLM.**

Not vector databases. Not API wrappers. Not MCP servers for local data. Plain markdown files, structured and injected at exactly the right moment.

Claude Code exposes this natively: `CLAUDE.md` for conventions, hooks for automation, `.claude/` for state. AZCLAUDE implements the full architecture on top of it — every file, every hook, every pattern proven to work.

```
Without AZCLAUDE:                     With AZCLAUDE:
─────────────────                     ──────────────
Claude starts every session blind.    Claude reads goals.md before your first message.
No project conventions.               CLAUDE.md has your stack, domain, and rules.
Repeats the same mistakes.            antipatterns.md prevents known failures.
Forgets what was decided.             decisions.md logs every architecture choice.
Loses reasoning mid-session.          /snapshot saves WHY — auto-injected next session.
Can't work autonomously.              /copilot builds, tests, commits, ships — unattended.
Agents run serially, one at a time.   DAG dispatch + merge-on-complete runs 6 agents simultaneously.
```

One install. Any stack. Zero dependencies.

---

## How It Works: The Execution Pipeline

Most AI coding tools pass your raw text straight to the LLM. That's why they get lazy, repeat mistakes, or overwrite files blindly.

AZCLAUDE sits as a mandatory middleware firewall between your input and Claude. It injects state, routes intent, enforces the SDLC, and gates every write through a security scanner — all inside Node.js, before Claude sees a single token.

```text
┌──────────────────────────────────────────────────────────────┐
│ 1. USER INPUT: "Build auth" OR "Should we?" OR "How's this?" │
└─────────────────────────────┬────────────────────────────────┘
                              ▼
════════════════════════════════════════════════════════════════
        [ THE AZCLAUDE FIREWALL (user-prompt.js) ]
════════════════════════════════════════════════════════════════
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. STATE INJECTION & COMPACTION GUARD                        │
│  ├─► Memory check: If context > 85%, auto-save checkpoint    │
│  └─► Inject state: goals.md, decisions.md, patterns.md       │
└─────────────────────────────┬────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. THE INTENT ROUTER (Dynamic Dispatch)                      │
└─┬───────────────────────────┬──────────────────────────────┬─┘
  │                           │                              │
  ▼                           ▼                              ▼
[ TIER 0: QUESTION ]    [ TIER 1: ANALYZE ]          [ TIER 2: IMPLEMENT ]
"How does this work?"   "Should we build this?"      "Build X" / "Fix Y"
  │                           │                              │
  │  Bypasses pipeline        ├─► Load relevant skills       ├─► STEP 1: problem-architect
  │  Answer directly          │   (test-first, security,     │   (BLOCKING — Team Spec first)
  │                           │    architecture-advisor)     ├─► STEP 1b: Web research
  │                           │   Reason directly.           ├─► STEP 2: Load skill set
  │                           │   Skip problem-architect.    └─► STEP 3: Post-code review
  ▼                           ▼                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. CLAUDE EXECUTES THE ENRICHED PAYLOAD                      │
│    (User input + protected state + mandatory instructions)   │
└─────────────────────────────┬────────────────────────────────┘
                              ▼
════════════════════════════════════════════════════════════════
        [ THE SECURITY GATE (pre/post-tool-use.js) ]
════════════════════════════════════════════════════════════════
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. OUTBOUND SECURITY & MEMORY TRACKING                       │
│  ├─► pre-tool-use.js: blocks curl|bash, secrets, traversal   │
│  └─► post-tool-use.js: writes breadcrumb to goals.md         │
└──────────────────────────────────────────────────────────────┘
```

**Why this matters:** The routing happens inside Node.js hooks — Claude cannot skip or override it. Ask a question (Tier 0) and it answers directly. Ask it to build (Tier 2) and it is structurally required to run `problem-architect`, load skills, and pass a security gate before a single file is touched.

---

## Install

```bash
npx azclaude-copilot@latest
```

One command, no flags. Auto-detects whether this is a fresh install or an upgrade:

- **First time** → full install (42 commands, 5 hooks, 15 agents, 10 skills, memory, reflexes). Creates folders, instructions, and hooks — **no manual setup required.**
- **Already installed, older version** → auto-upgrades everything to latest templates
- **Already up to date** → verifies, no overwrites

```bash
npx azclaude-copilot@latest doctor   # 32 checks — verify everything is wired correctly
```
│  ├─► Native execution: Claude runs the approved command      │

---

## What You Get

**42 commands** · **10 auto-invoked skills** · **15 agents** · **5 hooks** · **memory across sessions** · **learned reflexes** · **self-evolving environment**

```
.claude/
├── CLAUDE.md                 ← dispatch table: conventions, stack, routing
├── commands/                 ← 39 slash commands (/add, /fix, /copilot, /parallel...)
├── skills/                   ← 10 skills (test-first, security, architecture-advisor...)
├── agents/                   ← 15 agents (orchestrator, spec-reviewer, constitution-guard...)
├── capabilities/             ← 48 files, lazy-loaded via manifest.md (~100 tokens/task)
├── hooks/
│   ├── user-prompt.js        ← Brain Router + goals injection before first message
│   ├── pre-tool-use.js       ← blocks hardcoded secrets before any file write
│   ├── post-tool-use.js      ← writes breadcrumb to goals.md on every edit
│   └── stop.js               ← migrates In-progress → Done, trims, resets
└── memory/
    ├── goals.md              ← rolling ledger of what changed and why
    ├── checkpoints/          ← WHY decisions were made (/snapshot)
    ├── patterns.md           ← what worked — agents read before implementing
    ├── antipatterns.md       ← what broke — prevents repeating failures
    ├── decisions.md          ← architecture choices logged by /debate
    └── reflexes/             ← learned behavioral patterns (confidence-scored)
```

### Three ways to start

| Command | What happens |
|---------|-------------|
| `/setup` | Scans your codebase, detects domain + stack + scale, fills CLAUDE.md, creates goals.md. |
| `/dream "Build a compliance SaaS"` | Builds everything from scratch: CLAUDE.md → Hooks → skills → memory → agents. |
| `/copilot` | Walk away, come back to a product. Autonomous milestone execution. |

---

## Structured for Claude: Frontmatter + XML Tags

Anthropic's research shows Claude comprehends structured content significantly better when it uses two patterns natively built into Claude Code: **YAML frontmatter** for metadata and **`<instructions>` XML tags** for content. AZCLAUDE applies both to every agent and skill file — not as convention, but because it measurably changes how Claude reads, routes, and executes them.

### Why this matters

Claude was trained on XML-structured content. Tags like `<instructions>`, `<context>`, and `<examples>` signal boundaries Claude parses reliably — unlike prose headings which are ambiguous. Frontmatter gives Claude Code the metadata it needs to route, describe, and invoke agents without any extra configuration.

### What AZCLAUDE agent files look like

```yaml
---                                    ← YAML frontmatter block
name: code-reviewer                    ← agent identifier (used by subagent_type=)
description: >                         ← Claude Code reads this to decide when to spawn
  Autonomous code review agent.
  Use when: review, audit, PR review,
  find bugs, security check.
model: opus                            ← which model this agent runs on
tools: [Read, Glob, Grep, Bash]        ← allowed tools (principle of least privilege)
disallowedTools: [Write, Edit, Agent]  ← explicit deny list — no write access
permissionMode: plan                   ← read-only by default
maxTurns: 30                           ← bounded execution
tags: [review, pr, quality]            ← semantic routing hints
---

# Code Reviewer

<instructions>                         ← XML tag: Claude parses this as structured directives

## Layer 1: PERSONA
Code review specialist. Read-only — never modifies code.

## Layer 2: SCOPE
- Reviews staged/unstaged changes via `git diff`
- Checks for bugs, logic errors, edge cases
- Identifies security issues (injection, XSS, OWASP top 10)

</instructions>
```

### What AZCLAUDE skill files look like

```yaml
---                                    ← YAML frontmatter
name: test-first
description: >                         ← auto-invocation trigger — Claude reads this
  Guides test-driven development.
  Use when about to write code, implement a feature, fix a bug,
  refactor, add an endpoint, or modify business logic.
tags: [tdd, testing, coverage]
---

# Test-First

<instructions>                         ← structured content block

## Check before enforcing
TDD is opt-in. Check BOTH signals:
1. CLAUDE.md has a TDD rule
2. Test files exist (*.test.*, *.spec.*)

Both present → TDD protocol active.
Either missing → suggest TDD, don't block.

</instructions>
```

### Why this architecture works

| Pattern | What it does |
|---------|-------------|
| `description:` frontmatter | Claude Code reads this to decide when to auto-invoke a skill or which agent to spawn. No code required. |
| `model: opus` frontmatter | Routes complex review tasks to the most capable model automatically. |
| `tools:` + `disallowedTools:` | Principle of least privilege — code-reviewer cannot Write, milestone-builder cannot call Agent. |
| `<instructions>` XML tag | Signals to Claude "parse this as directives" — not prose, not documentation, not commentary. |
| `permissionMode: plan` | Agents that only read run in plan mode — no accidental writes, no permission prompts. |

All 15 AZCLAUDE agents and all 10 skills use this exact format. Claude Code routes them, describes them in `/help`, and invokes them via `subagent_type=` — all from the frontmatter, zero extra config.

---

## Architecture Philosophy

**AZCLAUDE uses Markdown files and lifecycle hooks — not MCP servers — as its core architecture.** This is a deliberate engineering decision, not a gap.

### Why Markdown beats MCP for an AI coding environment

MCP adds an IPC layer between Claude and your project data. For external services (databases, APIs, deployment platforms), that makes sense — Claude can't `Read` a Postgres table. But AZCLAUDE's intelligence layer is entirely **local files**: goals, plans, patterns, decisions, agent instructions, skill definitions.

For local files, Claude already has native tools (`Read`, `Write`, `Bash`, `Grep`) that are faster, cheaper, and more reliable than any protocol layer:

| Operation | AZCLAUDE (Markdown + Hooks) | Hypothetical MCP Server |
|-----------|---------------------------|------------------------|
| Read goals.md | Hook injects directly — **0 tool calls** | MCP tool → IPC → read → IPC → parse — **1+ roundtrips** |
| Spawn code-reviewer | `Read("agents/code-reviewer.md")` — **1 native call** | `spawn_agent()` → IPC → reads same file — **slower** |
| Load patterns | Hook injects at session start — **0 cost** | `get_patterns()` → IPC — **added cost, same result** |

### The performance tax nobody talks about

Every MCP tool you register costs you **three ways**:

1. **Token overhead** — Each tool definition consumes ~100-300 tokens in the system prompt. 10 tools = 3,000 tokens gone before Claude starts thinking.
2. **IPC latency** — Every call = JSON-RPC serialization → stdio pipe → Node.js process → work → serialize → pipe back → parse.
3. **Decision overhead** — More tools = more inference time deciding which tool to use. A 50-item menu is slower than a 5-item menu.

### Hooks enforce. Markdown extends. That's the full architecture.

```
Claude Code
  ├── Hooks (enforcement — AZCLAUDE's security + automation layer)
  │   ├── user-prompt.js  → Brain Router: forces problem-architect before coding
  │   ├── pre-tool-use.js → Blocks secrets, injection, path traversal
  │   ├── post-tool-use.js → Tracks every edit in goals.md
  │   └── stop.js         → Session cleanup, friction logging
  │
  └── Markdown files (capability — Claude reads natively, zero overhead)
      ├── 42 commands     → Claude reads the .md, follows instructions
      ├── 15 agents       → Claude spawns as subagents with Task tool
      ├── 10 skills       → Auto-invoked when relevant context detected
      ├── 48 capabilities → Lazy-loaded via manifest.md (~100 tokens overhead)
      └── Memory files    → goals.md, decisions.md, patterns.md, checkpoints/
```

**Zero IPC. Zero process overhead. Zero token tax. Claude reads files it already knows how to read.**

---

### Native Synergy: Performance via Plan & UltraThink

AZCLAUDE commands don't fight Claude Code's native features — they amplify them.

- **Native Plan Mode:** Commands like `/blueprint`, `/debate`, and `/sentinel` leverage Claude's native `plan` mode for read-only analysis, ensuring safety and focused reasoning before a single file is touched.
- **UltraThink Integration:** Using `--deep` with any command auto-loads `ultrathink` logic, enabling deeper dependency tracing and adversarial testing beyond standard limits.

### When MCP IS the right tool

AZCLAUDE still recommends MCP servers — for things that aren't files on disk:

```bash
/mcp    # detect your stack → recommend servers → show install commands
```

**Universal:** `Context7` (live library docs), `Sequential Thinking` (iterative reasoning).
**Stack-specific:** `GitHub MCP`, `Playwright MCP`, `Supabase MCP`, `Brave Search`.

The rule: **if it's on disk, use Markdown. If it's external, use MCP.**

---

## Native Tool Orchestration

AZCLAUDE hardwires its logic directly into the host CLI's built-in tools:

- **`AskUserQuestion`**: Wrapped into `/add`, `/blueprint`, and `/setup` to force clarification of vague requirements.
- **`EnterPlanMode`**: Called during `/blueprint`, `/audit`, and `/sentinel` for forced read-only analysis.
- **`EnterWorktree`**: Called to isolate state during `/evolve` and `/fix`.
- **`CronCreate` / `CronList`**: Tied to `/loop` for autonomous background execution.
- **`mcp__ide__getDiagnostics`**: Hard-gated before `/test` and `/ship`.

### Genius Wiring (1 AZCLAUDE Command : N Native Tools)

Single-word commands act as high-level orchestrators, wrapping multiple primitive CLI tools into one logical autonomous turn.

| Command | Orchestrated Native Pipeline |
|---------|-----------------------------|
| **`/blueprint`** | `EnterPlanMode` → `Read` → `AskUserQuestion` → `Write` (plan.md) |
| **`/add`** | `Read` (context) → `AskUserQuestion` → `EnterWorktree` → `Write` → `getDiagnostics` |
| **`/fix`** | `Read` → `Bash` (repro) → `Grep` → `EnterWorktree` → `Edit` → `Test` |
| **`/sentinel`** | `EnterPlanMode` → `Read` → `Grep` → `Write` (report) |

---

## Autonomous Mode

```bash
npx azclaude-copilot . "Build a compliance SaaS with trilingual support"
```

Node.js runner restarts Claude Code sessions in a loop until `COPILOT_COMPLETE`. Each session reads state, picks next milestone, implements, tests, commits, evolves. No human input needed.

**The intelligent team:**

```
Orchestrator          Problem-Architect          Milestone-Builder
─────────────         ─────────────────          ─────────────────
Reads plan.md    →    Analyzes milestone    →     Pre-reads all files
Selects wave          Returns Team Spec:          Implements
Dispatches            • agents needed             Runs tests
Monitors              • skills to load            Self-corrects (2 attempts)
Triggers /evolve      • files to touch            Commits + reports back
Never writes code     Never implements
```

**Self-healing:** Every failure → check antipatterns.md → try alternative → record what failed → record what worked. Never fail silently.

**Stall detection:** If `plan.md` hash unchanged for 3 sessions → exit. Stuck milestones in-progress for 2+ sessions → injected warnings. All milestones blocked → human intervention.

---

## Parallel Execution

AZCLAUDE runs up to 6 Claude Code agents simultaneously using **DAG-based dispatch** — each milestone launches the moment its dependencies are satisfied, not when an entire wave completes. Merge-on-complete means finished agents unblock dependents immediately.

```
M0 (foundation) → done                          ← auto-detected shared files
                     ↓
    ┌────────────┬────────────┬────────────┬────────────┬────────────┬──────────────┐
    M1 (auth)   M2 (profile) M3 (email)   M4 (tests)  M5 (NIST)   M6 (dashboard)
    └���────┬──────┴────────────┴─────┬──────┴────────────┴────────────┴──────────────┘
          ↓                         ↓                    ← merge-on-complete: M1 done → M7 starts
    M7 (API routes)           M8 (integration)             immediately, doesn't wait for M2-M6
```

DAG dispatch instead of sequential waves. Same output, ~50% faster wall clock.

### Real case — ShopFlow e-commerce sprint

> **Prompt:** *"Add order tracking + product review system — full parallel mode, no limits"*

**Phase 0 — Intelligence (4 agents, ~9 minutes, all parallel):**
```
├── Explore: Codebase architecture scan          (55k tokens) — found checkout/page.tsx
│            is 70% done; review POST never passes order_id to backend
├── Explore: UX journey + conversion analysis    (54k tokens) — post-purchase save-to-
│            account flow is the biggest conversion hole
├── Agent:   Competitor feature research         (49k tokens) — only platform without
│            inline review request after delivery; biggest gap vs Shopify/WooCommerce
└── Explore: Performance + SEO audit             (51k tokens) — product schema missing
             review aggregate (affects Google rich results)
```

**Debate verdicts:** Fix broken order_id link first (0.5 days) → reviews over rating-only (saves 2 sprints) → mobile-first detail page → workflow engine not static forms.

**Phase 1 — Blueprint (3 parallel reads of codebase → plan approved)**

**Phase 2 — Wave 1 (classifier merged M1+M2 → shared checkout/page.tsx):**
```
├── M1+M2: checkout frontend — order_id auto-link + "Track Order" panel   (78k tokens)
│          ← MERGED by classifier: both touch checkout/page.tsx
└── M4-backend: orders.py API + DB migration                              (37k tokens)
               ← PARALLEL: zero shared files with M1+M2
```

**Phase 3 — Wave 2 (different file owners, all parallel):**
```
└── M3+M4-frontend+M5: order detail page + review section + completion score (84k tokens)
```

**Result: 5 milestones shipped, 1 commit (`a3f9c1b`), 0 merge conflicts.**

What the classifier caught: M1 and M2 were separate plan milestones but both wrote to `checkout/page.tsx` — running them as separate agents would have caused a conflict. The classifier merged them into one agent before dispatch.

**On tokens:** You will notice the token counts look large. You would spend the same tokens building this sequentially — the work is identical. What changes is wall-clock time. Sequential execution: each agent waits for the previous one to finish → ~2 hours. Parallel waves: agents run simultaneously → ~15 minutes. Same total tokens. Same output. One-eighth the time.

### v0.6.0: What changed in parallel execution

| Before (wave-based) | After (DAG-based) |
|---------------------|-------------------|
| Wave 2 waits for ALL of Wave 1 | Each milestone launches when its `Depends:` are satisfied |
| Max 3 agents at once | Max 6 agents (test-only agents uncapped) |
| Manual Wave 0 for shared files | Auto-foundation detection extracts shared-file edits |
| Agents re-read shared files independently | Pre-read injection: shared files read once, injected inline |
| Agents run full test suite | Scoped tests: each agent runs only its module's tests |
| Merge after entire wave completes | Merge-on-complete: each branch merges immediately, unblocks dependents |
| Context loss kills the wave | Wave state file survives compaction, auto-resumes on next session |

### Five-layer safety model

Parallel execution is safe only when agents don't write to the same files. The key insight: **Layer 0 makes conflicts impossible by design** before any safety checking begins.

| Layer | When | What |
|-------|------|------|
| **0 — Task Classifier** | `/blueprint`, before milestones exist | Groups coupled work into single milestones. Conflicts become impossible by construction. |
| **0b — Foundation Detection** | Before dispatch | Auto-detects shared files (models, schemas) → sequential Wave 0 before any parallel agents |
| **1 — Directory + import check** | `/blueprint`, post-plan | Fast grep: same dirs? shared utility imports? |
| **2 — problem-architect file scan** | Post-plan, per milestone | Returns exact `Files Written:` paths + `Parallel Safe: YES/NO` |
| **3 — Orchestrator dispatch gate** | Runtime, final | Overlap check before spawning. Cannot be bypassed. |

### The engine analogy

Claude Code's `isolation: "worktree"` in the Task tool is a raw primitive — like `pthread_create`. You have threads, but threads alone aren't a concurrent system.

| Without AZCLAUDE | With AZCLAUDE |
|------------------|---------------|
| Which tasks to parallelize? | **Task Classifier + DAG dispatch** — groups coupled work, launches on dependency satisfaction |
| Is it safe to parallelize? | **Five-layer safety** — classifier + foundation + dir check + file scan + dispatch gate |
| What context does each agent need? | **Problem-Architect** — Team Spec + pre-read injection (shared files read once) |
| What conventions to follow? | **patterns.md / antipatterns.md** — injected automatically |
| What if one agent fails? | **Blocker recovery + /debate escalation** (other agents continue) |
| What happens when the session ends? | **DAG state file + checkpoints** — auto-resumes interrupted waves |
| How do we improve over time? | **/evolve** — new agents from git evidence every 3 milestones |

**Claude Code is the engine. AZCLAUDE is the transmission, the steering, and the GPS — the system that makes those cylinders produce coordinated forward motion instead of random spinning.**

See [docs/parallel-execution.md](docs/parallel-execution.md) for the complete reference (merge protocol, conflict resolution, worktree isolation rules).

---

## Memory System

Two things at session start — **what changed** and **why decisions were made**. Everything else is noise.

**Automatic (zero user input):**
```
Every edit:    post-tool-use.js → breadcrumb in goals.md
Before write:  pre-tool-use.js  → blocks hardcoded secrets
Session end:   stop.js          → In-progress → Done, trims to 20 entries
Session start: user-prompt.js   → injects goals.md + checkpoint + plan status
```
Token cost: ~500 tokens fixed. Auto-rotates at 30 entries (oldest 15 archived to `sessions/`) — same cost at session 5 or session 500.

**Manual:** `/snapshot` (save reasoning), `/persist` (end-of-session), `/pulse` (health check).

---

## Self-Improving Loop

AZCLAUDE doesn't just remember — it learns and corrects itself:

```
/reflect   →  Finds missing rules, dead rules, contradictions in CLAUDE.md
               Proposes exact edits. You approve. CLAUDE.md corrects itself.

/reflexes  →  Finds repeating tool sequences from observations
               Creates confidence-scored reflexes (0.3 tentative → 0.9 certain)

/evolve    →  Detects gaps → generates fixes → quality-gates everything
               Creates agents from git evidence (not guessing)
               Score delta: 42/100 → 68/100 in one cycle
```

---

## Security

Zero dependencies in `package.json`. No supply-chain risk.

| Layer | Where | What it blocks |
|-------|-------|----------------|
| Secret blocking | `pre-tool-use.js` | `AKIA*`, `sk-*`, `ghp_*`, private keys |
| Prompt injection | `user-prompt.js` | `curl|bash`, `ignore previous instructions` |
| Pre-ship scan | `/ship` | Secrets in staged files, failing tests |
| Agent scoping | Review agents | Read-only — no Write/Edit permissions |

`/sentinel` — on-demand 5-layer, 111-rule security scan, scored 0–100 (grade A–F).

---

## All 39 Commands

AZCLAUDE commands are divided into four tiers of intelligence.

### 1. Build & Core
| Command | Purpose |
|---------|---------|
| `/copilot` | **Autonomous Mode.** Zero-human-input milestone execution. |
| `/dream` | **Greenfield.** High-fidelity project generation from a single idea. |
| `/setup` | **Environment Scan.** Detects stack/domain and builds the initial agent team. |
| `/add` | **Feature Addition.** Intelligent pre-flight + implementation of new logic. |
| `/fix` | **Bug Resolution.** 4-phase mandatory-repro/hypothesize/verify loop. |
| `/ship` | **Release Gate.** Ghost check → security scan → tests → commit → push. |
| `/refactor` | **Structural Shift.** Dependency-aware code restructuring. |
| `/test` | **Smart Testing.** Framework detection + failure classification. |
| `/blueprint` | **Strategic Planning.** Read-only analysis → multi-milestone path. |
| `/migrate` | **Upgrades.** Safe dependency/framework version transitions. |
| `/doc` | **Documentation.** Code-to-markdown generation with signature detection. |

### 2. Spec-Driven Tier
| Command | Purpose |
|---------|---------|
| `/constitute` | **Ground Rules.** Define non-negotiables before planning. |
| `/spec` | **Requirements.** Structured goals/user-stories/ACs before code. |
| `/clarify` | **Interrogation.** 5-question loop to resolve vague requirements. |
| `/analyze` | **Consistency.** Detects ghost milestones and plan drift. |
| `/tasks` | **Wave Groups.** Builds parallelizable dependency graphs. |
| `/issues` | **GitHub sync.** Converts plan milestones to tracked issues. |
| `/parallel` | **Concurrent Exec.** Runs milestones in isolated worktrees. |
| `/driven` | **Coding Contract.** Stack-specific DO/DO NOT rules. |
| `/verify` | **Compliance.** Audits code against the coding contract. |
| `/sentinel` | **Security.** 111-rule, 6-layer deep environment scan. |

### 3. Intelligence & Evolution
| Command | Purpose |
|---------|---------|
| `/debate` | **Decision Protocol.** Evidence-tagged adversarial reasoning. |
| `/evolve` | **Self-Improvement.** Scans for gaps → fixes them → quality-gates. |
| `/reflexes` | **Behavioral Learning.** Manages confidence-scored tool patterns. |
| `/reflect` | **Metacognition.** Re-writes its own rules from friction logs. |
| `/level-up` | **Capabilities.** Visual checklist to build the next capability level. |

### 4. Memory & Utilities
| Command | Purpose |
|---------|---------|
| `/snapshot` | **Reasoning Checkpoint.** Saves tech-lead context mid-session. |
| `/persist` | **Session Closure.** Goals + friction log → session archive. |
| `/pulse` | **Health Check.** Quick overview of git, health, and next steps. |
| `/explain` | **Plain Language.** Step-by-step logic breakdown. |
| `/loop` | **Automation.** Schedule commands on a cron interval. |
| `/mcp` | **Stack Scaling.** Tailored external MCP recommendations. |

---

## The 15 Expert Agents

AZCLAUDE dispatches specialists. Every agent has a 5-layer definition (Persona, Scope, Tools, Constraints, Domain).

| Agent | Purpose |
|-------|---------|
| **orchestrator** | Tech Lead. Reads constitution, manages milestone dispatch. |
| **problem-architect** | Strategy. Analyzes milestones, returns Team Spec + risks. |
| **milestone-builder** | Implementation. Reads non-negotiables, builds, verifies. |
| **orchestrator-init** | Initialization. Fills CLAUDE.md and goals.md on session 0. |
| **spec-reviewer** | Gatekeeper. Validates spec quality before planning begins. |
| **constitution-guard** | Compliance. Blocks milestones that violate project rules. |
| **code-reviewer** | Quality. Spec-first review with Distrust-in-Review logic. |
| **test-writer** | Verification. Matches framework/style to write robust tests. |
| **security-auditor** | Hardening. 111-rule scan for exfiltration and secrets. |
| **devops-engineer** | Infrastructure. CI/CD, Docker, deployment configuration. |
| **qa-engineer** | Quality Assurance. E2E tests, release readiness, risk coverage. |
| **loop-controller** | Level 10. Autonomous environment evolution. |
| **cc-template-author** | Maintenance. Core AZCLAUDE template development. |
| **cc-cli-integrator** | CLI Routing. Wires commands, agents, and skills into bin/cli.js. |
| **cc-test-maintainer** | Test Suite. Keeps test-features.sh in sync with all templates. |

---

## Auto-Invoked Skills

Skills fire automatically based on context—no commands needed. 

| Skill | Triggers on | Purpose |
|-------|-------------|---------|
| **session-guard** | Session Start | Context reset and idle detection. |
| **test-first** | Implementation | Enforces TDD in designated projects. |
| **env-scanner** | Startup | Infrastructure and stack auto-analysis. |
| **debate** | Decisions | Triggers adversarial reasoning for trade-offs. |
| **security** | Sensitive code | Flags credentials, auth, and secret handling. |
| **skill-creator** | New patterns | Generates new skills for repeated workflows. |
| **agent-creator** | Scaling | Builds new agents from co-change evidence. |
| **architecture-advisor**| Big decisions| Pattern selection by project scale. |
| **frontend-design** | UI work | 12 aesthetic directions + premium design system. |

---

## Capability Manifest (48 Modules)

AZCLAUDE is a lazy-loaded environment of 48 capability modules. It only loads what the task needs, keeping context costs at ~380 tokens.

- **Shared Intelligence:** `debate.md`, `evidence.md`, `decision-log.md`
- **Execution:** `parallel-coordination.md`, `worktree-isolation.md`, `merge-protocol.md`
- **Evolution:** `environment-growth.md`, `topology-optimization.md`, `reflex-analysis.md`
- **Security:** `sentinel-layers.md`, `exfiltration-blocking.md`, `secret-patterns.md`

[Full technical documentation →](DOCS.md)

---

## What Makes It Different

| | Claude Code alone | AZCLAUDE |
|---|---|---|
| Architecture | Generic chat + tools | Native Markdown + hooks — zero MCP tax, zero IPC, zero token overhead |
| Project memory | Starts fresh every session | goals.md + checkpoints injected automatically |
| Conventions | Re-explained each time | CLAUDE.md — loaded before every task |
| Mid-session reasoning | Lost on compaction | /snapshot saves WHY — auto-injected next session |
| Learned behavior | None | Reflexes from tool-use, confidence-scored |
| Architecture decisions | Re-debated every time | decisions.md — logged once, referenced forever |
| Failed approaches | Repeated | antipatterns.md — agents read before implementing |
| Security | Manual | 4-layer enforcement: write-time blocking + audit + pre-ship |
| Agent specialization | None | Project agents emerge from git evidence |
| Autonomous building | Not possible | /copilot — three-tier intelligent team |
| Parallel execution | Raw worktree primitive | Four-layer classifier + safety model |
| Self-improvement | Not possible | /evolve + /reflect + /reflexes loop |
| Governance | None | constitution-guard blocks non-compliant milestones |
| Any stack | Yes | Yes |
| Zero dependencies | — | Yes (0 in package.json) |

---

## Verified

1996 tests. Every template, command, capability, agent, hook, and CLI feature verified.

```bash
bash tests/test-features.sh
# Results: 1996 passed, 0 failed, 1996 total
```

---

## License

MIT — [haytamAroui](https://github.com/haytamAroui)