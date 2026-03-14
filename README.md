# AZCLAUDE

Run one command. Get a professional AI coding environment configured for your project.

```bash
npx azclaude
```

Then open Claude Code and type:

```
/setup
```

That's it. AZCLAUDE analyzes your project, detects your stack and domain, and configures everything — rules, memory, commands, agents, hooks. You don't need to know how it works to use it.

---

## What `/setup` does to your project

```
Scanning project...

  ✓ Stack detected: TypeScript, Node.js, PostgreSQL
  ✓ Domain: Developer — TDD protocol active
  ✓ Scale: 340 files — STANDARD mode

Building environment...

  ✓ CLAUDE.md filled — project context, routing rules, trade-off hierarchy
  ✓ goals.md created — current threads, blockers, next actions
  ✓ Commands installed — /fix, /ship, /evolve, /debate, /persist, /status...
  ✓ Memory directories ready — sessions/, learnings/, observations/
  ✓ Hooks installed — context injected at session start, friction logged at end

Environment level: 6 / 10

Setup complete.
```

From that point forward, your AI knows your project. Every session starts with context. Every session ends with a record.

---

## What you have after setup

**Your AI knows your project.** CLAUDE.md is filled with your actual stack, domain, and constraints — not generic instructions.

**Commands that enforce discipline.** `/fix` reproduces the bug before touching anything. `/ship` checks for secrets before staging. `/persist` shows you the files it saved — never says "done" without proof.

**Memory that survives sessions.** Goals, blockers, and decisions are stored in `.claude/memory/` and auto-injected at the start of the next session. You never re-explain context.

**An environment that improves itself.** Every friction you experience gets logged. `/evolve` reads those logs, detects patterns, and generates new capabilities to address them.

---

## Commands

| Command | What it does |
|---------|-------------|
| `/setup` | Analyzes your project, fills CLAUDE.md, creates memory structure. Run once. |
| `/dream` | Give it a project idea and stack — builds the full environment for it. |
| `/fix` | 4-phase debugging: reproduce → investigate → hypothesize → fix. Never guesses. |
| `/ship` | Commits and pushes. Checks for secrets before staging. Generates a real commit message. |
| `/persist` | Ends the session: updates goals, writes friction log, appends session summary. |
| `/evolve` | Scans for gaps and friction, generates improvements, quality-gates them. |
| `/debate` | Adversarial protocol for hard architectural decisions. Two positions, verified evidence. |
| `/level-up` | Shows your current environment level and builds the next one. |
| `/status` | Quick health check: app status, recent changes, next steps from goals.md. |
| `/explain` | Plain language explanation of any code, error, or concept. |

---

## Grows with your project

AZCLAUDE builds in levels. Start at level 1. Add what you need when you need it.

| Level | What's added |
|-------|-------------|
| 1 | `CLAUDE.md` — project context and routing |
| 2 | MCP servers for your stack |
| 3 | Commands for your common workflows |
| 4 | Memory system — goals, sessions, friction logs |
| 5 | Custom agents for repeated tasks |
| 6 | Lifecycle hooks — context injected automatically |
| 7 | External integrations (databases, APIs, services) |
| 8–10 | Intelligence layer, persistent knowledge, self-improving loop |

Run `/level-up` at any point to see where you are and what's next.

---

## Works with your AI CLI

Detects which CLI you're using and installs to the right place. No configuration needed.

| Claude Code | Gemini CLI | OpenCode | Codex CLI | Cursor |
|-------------|------------|----------|-----------|--------|
| `.claude/` → `CLAUDE.md` | `.gemini/` → `GEMINI.md` | `.opencode/` → `AGENTS.md` | `.codex/` → `AGENTS.md` | `.cursor/rules/` → `project.mdc` |

---

## Installation

```bash
# Run once per project (or globally with npm install -g azclaude)
npx azclaude
```

Then in Claude Code:
```
/setup
```

---

## License

MIT — [haytamAroui](https://github.com/haytamAroui)
