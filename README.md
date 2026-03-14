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

You open Claude Code. You ask it to fix a bug. It doesn't know your project conventions, your test patterns, your architecture decisions. You explain them. Next session — you explain them again. Every agent you spawn starts from zero. Context compacts at turn 80 and you lose where you were.

**AZCLAUDE fixes this.** One install. Your AI coding CLI remembers your project, speaks your domain's language, routes tasks to the right capability, and improves itself over time.

---

## See It Working (30 seconds)

```bash
npx azclaude demo
```

Runs the actual memory hooks on a temp project. Shows goals.md being written by a file edit, surviving simulated compaction, and being injected back at session start. Real output, no mocks, cleans up after itself.

---

## What You Get

### After `npx azclaude` + `/setup` (2 minutes)

```
✓ CLAUDE.md — 30-line dispatch table, not a knowledge dump
✓ goals.md — session continuity (auto-injected via hook, never forgotten)
✓ 15 commands ready: /dream /setup /fix /add /review /test /plan /ship /evolve /debate /persist /level-up /status /explain /loop
✓ Domain detected → vocabulary adapted (compliance project gets "obligations", not "tasks")
✓ Capabilities indexed → only loaded when needed (~380 tokens per bug fix, not ~21,000)
```

### Memory that survives context compaction

Every file you edit is silently logged to `goals.md` by a PostToolUse hook — no user action required:

```
You edit src/auth.js
  → PostToolUse fires automatically
  → goals.md updated: "22:10 — src/auth.js"

Claude Code compacts conversation at turn 80
  → Earlier context gone

Next prompt — UserPromptSubmit hook fires
  → Claude receives: "## In progress — 22:10 — src/auth.js"
  → Knows exactly where you left off
```

No `/persist` required to survive compaction. Goals.md is written continuously. The ceremony (`/persist`) is for end-of-session reflection — not rescue.

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

### When you run `/evolve` after a week of work

```
/evolve        — full cycle: detect gaps → generate fixes → evaluate quality (~3-6k tokens)
/evolve quick  — detect only: list gaps without fixing them (~500 tokens, 30 seconds)
```

```
Cycle 1: Scans for gaps in your environment
  → "manifest.md version stuck at 1.9.0 — updating"
  → "level6-hooks.md still references bash $PPID — correcting"

Cycle 2: Consolidates what you learned
  → Patterns extracted from sessions → patterns.md
  → Stale memory archived

Cycle 3: Optimizes your agent topology
  → "Agent X has < 0.10 influence — consider merging with Agent Y"
```

This is not aspirational. On March 14 2026, `/evolve` found 3 real stale-doc bugs in AZCLAUDE itself and fixed them in the same run.

---

## Installation

```bash
npx azclaude
```

Then in your AI coding CLI:
```
/setup
```

Auto-detects your CLI. Installs to the correct paths. Done.

### Verify it's working

```bash
npx azclaude doctor
```

Runs 24 checks across runtime, global hooks, project structure, and commands. Exits 0 if healthy, exits 1 with a fix hint if anything is wrong.

### See a live demo

```bash
npx azclaude demo
```

---

## Commands

### Build & Ship

| Command | What happens |
|---------|-------------|
| `/dream` | "I want to build X with Y" → full project scaffold: rules file, memory, skills, agents — built level by level |
| `/setup` | Analyzes your project once. Detects domain + stack + scale. Creates everything `/dream` creates, but for an existing project |
| `/add` | Add a feature, endpoint, component, or function. TDD opt-in (checks your project signals). Follows existing patterns — never invents new ones |
| `/fix` | Paste an error → REPRODUCE → INVESTIGATE → HYPOTHESIZE → FIX. Shows passing test output. Never says "should work" |
| `/review` | Spec-first code review. Checks requirements before code quality. Blocking vs suggestion distinction |
| `/test` | Run tests with IDE diagnostics first, framework detection, exit-code gate, failure classification |
| `/plan` | For 4+ file changes or risky refactors. Read-only analysis → presents plan with risk level → approval gate before any code written |
| `/ship` | Pre-ship gate (IDE diagnostics + tests) → docs sync check → `git add` + smart commit + `git push` |

### Think & Improve

| Command | What happens |
|---------|-------------|
| `/debate` | "REST or GraphQL?" → two advocates argue with evidence → fact-checked → winner with confidence score → logged to decisions.md |
| `/evolve` | Scans everything, finds what's weak, generates improvements, quality-checks them. `/evolve quick` for fast detect-only mode |
| `/level-up` | Shows your current level (0–10) → builds the next one. MCP, skills, agents, hooks — one level at a time |

### Daily Use

| Command | What happens |
|---------|-------------|
| `/persist` | End of session: saves goals, writes friction log, appends session summary |
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
| **Next.js app** | TDD opt-in (activates when test files + CLAUDE.md rule exist). Skills: `new-page.md`, `new-component.md` |
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
| 6 | Hooks | Auto-save on edit, goals injection, friction detection |
| 7 | External MCP | Cross-project memory, production monitoring |
| 8–10 | Intelligence | Debates, pipelines, experiments, self-improvement |

Run `/level-up` → see your current level → build the next one. One at a time.

---

## What Makes It Different

**Memory without user action.**
PostToolUse hook writes your progress to goals.md on every file edit. Context compaction doesn't lose your place.

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
├── bin/cli.js                    ← installer + doctor + demo (multi-CLI, path substitution)
├── templates/
│   ├── CLAUDE.md                 ← rules file template (Quick Start + dispatch table)
│   ├── hooks/                    ← Node.js hooks (cross-platform: Windows/macOS/Linux)
│   │   ├── user-prompt.js        ← injects goals.md at session start, warns on interruption
│   │   ├── post-tool-use.js      ← auto-saves file edits to goals.md (no user action)
│   │   └── stop.js               ← migrates In progress → Done, writes friction stub
│   ├── agents/orchestrator-init.md
│   ├── capabilities/
│   │   ├── manifest.md           ← capability index
│   │   ├── shared/       (10)    ← tdd, completion, agents, vocabulary, security, native-tools...
│   │   ├── evolution/    (6)     ← detect, generate, evaluate, knowledge, topology...
│   │   ├── intelligence/ (5)     ← debate, pipeline, elo, opro, experiment
│   │   └── level-builders/ (8)   ← levels 1–8
│   ├── commands/         (15)    ← dream, setup, fix, add, review, test, plan, ship, evolve...
│   └── scripts/env-scan.sh       ← environment scanner (one script, one JSON)
├── CONTRIBUTING.md
├── package.json
└── test-features.sh              ← 548 tests
```

---

## Verified End-to-End

548 tests verify every link in the system — content accuracy, not just file presence.

```bash
bash test-features.sh
```

```
════════════════════════════════════════════════════
  Results: 548 passed, 0 failed, 548 total
════════════════════════════════════════════════════
```

Verified live on March 14 2026: `/evolve` detected 3 real stale-documentation bugs in AZCLAUDE itself and fixed them in the same run. 505/505 tests before the fix, 548/548 after.

---

## Security

AZCLAUDE executes code and modifies files. 6 layers of protection:

1. **Hook Integrity**: SHA-256 hash of `~/.claude/settings.json` hooks written at install, verified on every subsequent run.
2. **Command Injection Protection**: Formatter hooks sanitize `$CLAUDE_FILE_PATH`, rejecting shell metacharacters before any formatter runs.
3. **Indirect Prompt Injection Defense**: UserPromptSubmit hook strips `curl | bash`, `ignore previous instructions`, and similar patterns before injecting goals.md into context.
4. **Skill Checksums**: Portable skills in `~/shared-skills/` are SHA-256 hashed. Imports fail loudly if tampered with.
5. **Credential Auditing**: `/ship` scans for `.env` and plaintext keys before staging. Never ships secrets.
6. **Agent Scoping**: Review agents never get Write permissions. Experiment agents run in isolated git worktrees.

All hooks are pure Node.js — no bash required. Work on Windows PowerShell, CMD, Git Bash, macOS, and Linux.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) — how to add a capability or command in 15 minutes.

---

## License

MIT — [haytamAroui](https://github.com/haytamAroui)
