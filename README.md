<p align="center">
  <h1 align="center">AZCLAUDE</h1>
  <p align="center">
    <strong>Your AI coding CLI learns your project. Agents that remember. Skills that compound. Zero wasted context.</strong>
  </p>
  <p align="center">
    <a href="#installation">Installation</a> · <a href="#what-you-get">What You Get</a> · <a href="#commands">Commands</a> · <a href="#how-agents-work">Agents</a> · <a href="#multi-cli">Multi-CLI</a>
  </p>
</p>

---

## The Problem

You open Claude Code (or Gemini CLI, or Cursor). You ask it to fix a bug. It doesn't know your project conventions, your test patterns, your architecture decisions. You explain them. Next session — you explain them again. Every agent you spawn starts from zero.

**AZCLAUDE fixes this.** One install. Your AI coding CLI remembers your project, speaks your domain's language, routes tasks to the right capability, and improves itself over time.

---

## What You Get

### After `npx azclaude` + `/setup` (2 minutes)

```
✓ CLAUDE.md — 30-line dispatch table, not a knowledge dump
✓ goals.md — session continuity (auto-injected via hook, never forgotten)
✓ 11 commands ready: /dream /setup /fix /ship /evolve /debate /persist /level-up /status /explain /loop
✓ Domain detected → vocabulary adapted (compliance project gets "obligations", not "tasks")
✓ Capabilities indexed → only loaded when needed (~380 tokens per bug fix, not ~21,000)
```

### When you run 1 agent

The agent gets exactly what it needs — not everything:

```
Traditional:  agent receives 1,700 lines of instructions → reads for 30 seconds → starts work
AZCLAUDE:     agent receives 80-line micro-file for its specific task → starts immediately

Result: faster responses, cheaper API costs, better focus
```

### When you run 5 agents in a pipeline

Each agent receives **only the previous agent's output** — not the previous agent's full context:

```
Planner → { files_to_change, test_plan, approach }
   ↓
Implementer → { files_changed, tests_written, test_results }
   ↓
Reviewer → { spec_compliance: pass|fail, issues: [...] }
```

**No context bleed.** Agent 3 doesn't inherit Agent 1's 50,000-token conversation. It gets a JSON object.

4 pre-built pipeline templates included: Feature, Fix, Review, Architecture.

### When you come back tomorrow

```
Session starts → hook injects goals.md automatically
→ Claude already knows: what's in progress, what's done, what's next, what's blocked

No "let me re-read the codebase" warm-up. Continuity is built in.
```

### When you run `/evolve` after a week of work

```
Cycle 1: Scans for gaps in your environment
  → "You have 3 agents but no skill for adding endpoints — generating one"
  → New skill created, quality-checked, added to manifest

Cycle 2: Consolidates what you learned
  → Patterns extracted from 5 sessions → patterns.md
  → Stale memory archived (importance score < 15)

Cycle 3: Optimizes your agent topology
  → "Agent X has < 0.10 influence — consider merging with Agent Y"
  → Pipeline map updated
```

Your environment gets smarter every week. Not because you configure it — because it reads its own friction logs.

---

## Installation

```bash
# Install globally
npm install -g azclaude

# Or run directly in any project
npx azclaude
```

Then in your AI coding CLI:
```
/setup
```

Auto-detects your CLI. Installs to the correct paths. Done.

---

## Commands

### Build & Ship

| Command | What happens |
|---------|-------------|
| `/dream` | "I want to build X with Y" → full project scaffold: rules file, memory, skills, agents — built level by level |
| `/setup` | Analyzes your project once. Detects domain + stack + scale. Creates everything `/dream` creates, but for an existing project |
| `/fix` | Paste an error → REPRODUCE → INVESTIGATE → HYPOTHESIZE → FIX. Shows passing test output. Never says "should work" |
| `/ship` | `git add` + smart commit message + `git push`. Skips `.env` and secrets automatically |

### Think & Improve

| Command | What happens |
|---------|-------------|
| `/debate` | "REST or GraphQL?" → two advocates argue with evidence → fact-checked → winner with confidence score → logged to decisions.md |
| `/evolve` | Scans everything, finds what's weak, generates improvements, quality-checks them, consolidates learnings |
| `/level-up` | Shows your current level (0–10) → builds the next one. MCP, skills, agents, hooks — one level at a time |

### Daily Use

| Command | What happens |
|---------|-------------|
| `/persist` | End of session: saves goals, writes friction log, appends session summary. Next session starts where this one left off |
| `/status` | Quick overview: app health, recent changes, current level, next steps from goals.md |
| `/explain` | Paste code or an error → plain language explanation. Zero jargon |
| `/loop` | `/loop 5m /status` → repeats a command on an interval |

---

## How Agents Work

### The 5-Layer Structure

Every agent AZCLAUDE creates has 5 layers. Missing one = incomplete agent:

```yaml
---
name: api-agent
description: >
  Handles all API endpoint work. Triggers on: new endpoint,
  route change, middleware, API test, controller, REST, GraphQL.
model: sonnet        # opus for architecture, haiku for simple tasks
permissionMode: acceptEdits
skills: [project-conventions]
---

Layer 1 — PERSONA:    "API specialist for this Express project"
Layer 2 — SCOPE:      "Owns src/api/ and tests/api/. Does NOT touch frontend"
Layer 3 — TOOLS:      "Read, Write, Edit, Bash, Grep"
Layer 4 — CONSTRAINTS:"Never modify database schema without migration"
Layer 5 — DOMAIN:     "Uses Express 4, Zod validation, Prisma ORM"
```

### Agents Remember What They Learn

Every AZCLAUDE agent persists what it discovers:

- Task succeeded → appends to `patterns.md`
- Approach failed → appends to `antipatterns.md`
- Decision made → appends to `decisions.md`

Next time the agent runs, it reads these files. It doesn't repeat the same mistake twice.

### Agent Boundaries Come From Evidence

Before creating agents, AZCLAUDE checks git history:

```bash
git log --name-only --format="" --diff-filter=M | sort | uniq -c | sort -rn
```

Files that always change together → same agent. No guessing. 3 agents with clear boundaries > 6 overlapping ones.

---

## Domain Awareness

Not every project is code. AZCLAUDE adapts:

| Your project | What changes |
|-------------|-------------|
| **Next.js app** | TDD active. Skills: `new-page.md`, `new-component.md`. Agents: frontend, API |
| **Legal compliance tool** | Vocabulary: obligations, conformity review. Skip: TDD, hooks |
| **Book manuscript** | Skills become: `write-chapter.md`, `edit-draft.md`. No MCP, no agents |
| **ML research** | Memory tracks experiments + citations. Skills become retrieval patterns |
| **Trading platform** | Vocabulary: positions, risk decisions. Full code stack active |
| **Healthcare app** | Vocabulary: clinical findings, patient outcomes. FHIR-aware agent naming |

Detection is automatic. Domain vocabulary flows into every generated file.

---

## Multi-CLI

Works with 5 AI coding CLIs:

| CLI | What AZCLAUDE installs |
|-----|----------------------|
| **Claude Code** | `.claude/` + `CLAUDE.md` + full hooks |
| **Gemini CLI** | `.gemini/` + `GEMINI.md` |
| **Codex CLI** | `.codex/` + `AGENTS.md` |
| **OpenCode** | `.opencode/` + `AGENTS.md` |
| **Cursor** | `.cursor/` + `.cursor/rules/project.mdc` |

Path substitution happens at install time — zero runtime cost. Your capabilities, commands, and memory work the same way regardless of CLI.

---

## The Evolution System

### 10 Levels — Build What You Need

| Level | What you get | Result |
|-------|-------------|--------|
| 1 | Rules file | Claude knows your project conventions |
| 2 | MCP servers | Claude connects to your database, browser, APIs |
| 3 | Skills + commands | Repeatable workflows: `/add-endpoint`, `/new-page`, `/test` |
| 4 | Memory | Session continuity — goals, learnings, friction logs |
| 5 | Custom agents | Parallel specialists with clear boundaries |
| 6 | Hooks | Auto-format on save, goals injection, friction detection |
| 7 | External MCP | Cross-project memory, production monitoring |
| 8–10 | Intelligence | Debates, pipelines, experiments, self-improvement |

Run `/level-up` → see your current level → build the next one. One at a time.

Levels 8–10 are gated by an 8-question decision matrix. You only add intelligence capabilities when the overhead is worth it.

### Self-Improvement

After a week of sessions, run `/evolve`:

1. **What's missing?** Scans friction logs → generates new skills automatically
2. **What's stale?** Scores memory by importance → archives what's no longer relevant
3. **What's overlapping?** Maps agent topology → suggests merges

Your environment compounds. The more you use it, the better it gets.

---

## What Makes It Different

**Load only what you need.**
A bug fix loads ~380 tokens of context. Not 21,000.

**No persistent orchestrator.**
The init agent fires once at `/setup` and exits. CLAUDE.md routes everything after that. No agent sits in memory burning tokens.

**Agents accumulate knowledge.**
Patterns, antipatterns, and decisions persist across sessions. Your agents learn from their own history.

**Domain-native language.**
A compliance project gets "obligations" and "conformity review" — not "tasks" and "code review."

**Works on 5 CLIs.**
Claude Code, Gemini CLI, Codex, OpenCode, Cursor. Same capabilities, correct paths, zero runtime cost.

**O(1) extensibility.**
New capability = 1 file + 1 manifest row. Nothing else changes. No monolith to edit.

---

## Project Structure

```
azclaude/
├── bin/cli.js                    ← installer (multi-CLI, path substitution)
├── templates/
│   ├── CLAUDE.md                 ← rules file template
│   ├── agents/orchestrator-init.md
│   ├── capabilities/
│   │   ├── manifest.md           ← capability index
│   │   ├── shared/       (8)    ← tdd, completion, agents, vocabulary, quality...
│   │   ├── evolution/    (6)    ← detect, generate, evaluate, knowledge, topology...
│   │   ├── intelligence/ (5)    ← debate, pipeline, elo, opro, experiment
│   │   └── level-builders/ (8)  ← levels 1–8
│   ├── commands/         (11)   ← dream, setup, fix, ship, evolve, debate...
│   └── scripts/env-scan.sh      ← environment scanner (one script, one JSON)
├── package.json
└── test-features.sh              ← 364 tests
```

**46 files. ~4,500 lines. 364 tests.**

---

## License

MIT — [haytamAroui](https://github.com/haytamAroui)
