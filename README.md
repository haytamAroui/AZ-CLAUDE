# AZCLAUDE

A structured AI coding environment that installs in one command and works across your projects.

---

## What you get

Run `npx azclaude` once in a project. You get:

- **A rules file** (`CLAUDE.md`) that tells your AI how to work in this specific project — not generic instructions, but project-aware context.
- **Commands** like `/fix`, `/ship`, `/evolve`, `/debate` that enforce discipline. `/fix` never guesses. `/ship` never commits secrets. `/evolve` improves the environment based on friction you actually experienced.
- **A memory system** that survives sessions. Goals, blockers, decisions, and session summaries are stored and auto-injected at the start of each session.
- **Hooks** that work automatically. Session context is injected before your first prompt. If you close without saving, a reminder is created.
- **An environment that grows**. Ten progressive levels — from a basic rules file to a full agent pipeline. Add what you need, when you need it.

Works with Claude Code, Gemini CLI, OpenCode, Codex CLI, and Cursor.

---

## Install

```bash
# Run once in your project
npx azclaude
```

Then configure for your project:
```
/setup
```

That's it. `/setup` analyzes your codebase, fills in project-specific context, and creates your first goals file.

---

## Commands

### `/setup`
Analyzes the project once. Detects your domain (code, writing, research, business), tech stack, and scale. Fills `CLAUDE.md`, creates `goals.md`, and builds the memory structure. Run once at the start. Run again to fill unfilled placeholders — never overwrites what you've intentionally written.

### `/dream`
Tell the AI what you want to build and what stack you want to use. It configures the entire environment for that project — CLAUDE.md, memory, skills, agents — progressively. One focused question if something is missing, then it builds.

### `/fix`
Four phases, no guessing:

1. **REPRODUCE** — Runs the failing test or command. Shows actual output. Does not proceed without confirmation the bug exists.
2. **INVESTIGATE** — Reads the code. Checks git history. Never suggests a fix without reading the relevant file.
3. **HYPOTHESIZE** — One root cause. Describes the fix before writing a single line of code.
4. **FIX** — Minimal change. Runs the full test suite. Shows the output. Never says "this should work."

### `/ship`
Stages changed files, generates a descriptive commit message, commits, and pushes. Checks for `.env`, credentials, and secrets before staging — skips them and warns you. If no remote is connected, gives exact instructions to add one.

### `/persist`
Ends the session properly. Updates `goals.md` with current threads, done items, and next actions. Writes a friction log to `ops/observations/` — what was harder than it should be, what repeated from last session. Appends a session summary. Shows both files as proof. Does not say "saved" without showing the content.

### `/evolve`
Scans the environment for gaps, stale capabilities, and repeated friction. Generates improvements. Quality-gates them before applying. Consolidates session knowledge into patterns. Runs only what each phase needs — detect only if that's all that's needed.

### `/debate`
Adversarial decision protocol for hard architectural choices. Two positions argue, evidence is tagged as verified or unverified, synthesis is checked for order-dependence. Use it when the decision matters and you want to pressure-test the options.

### `/level-up`
Shows a visual checklist of your current environment level (0–10) and builds the next level. Levels add capability progressively — MCP servers, agents, hooks, external integrations, intelligence pipelines. Never loads all levels at once.

### `/status`
Quick health check. App starts or fails. Recent git changes. Current environment level. Two or three concrete next steps from `goals.md`.

### `/explain`
Plain language explanation of code, errors, or concepts. Pass anything — a file, an error message, a function, a concept. Two or three paragraphs. No jargon.

### `/loop`
Run a command on an interval. `/loop 5m /status` runs status every five minutes. Explains how to set up a real cron job if you want this to outlive the session.

---

## Memory

Your AI loses context when a session ends. AZCLAUDE solves this with a three-part memory system:

**Goals** (`.claude/memory/goals.md`) — what you're working on, what's blocked, what's next. Updated by `/persist`, injected automatically at session start via hook.

**Sessions** (`.claude/memory/sessions/`) — one file per session. What changed, what was learned, what's next. Searchable by topic or date.

**Friction** (`ops/observations/`) — what was harder than expected. The `/evolve` command reads these logs to detect patterns and improve the environment. Friction you log becomes capability you gain.

### How context injection works

A hook fires on the first prompt of each session. It checks if `goals.md` exists and injects its content automatically — you don't need to remind the AI to read it. A second hook fires when the session ends without `/persist` and creates a reminder stub.

---

## Environment Levels

AZCLAUDE builds progressively. Each level adds something concrete. You stop at the level that fits your project.

| Level | What's added |
|-------|-------------|
| 0 | Nothing — starting point |
| 1 | `CLAUDE.md` with project context and routing |
| 2 | MCP servers configured for your stack |
| 3 | Commands (skills) for common tasks |
| 4 | Memory system — goals, sessions, friction logs |
| 5 | Custom agents for repeated workflows |
| 6 | Lifecycle hooks — context injection, session safety |
| 7 | External MCP integrations (databases, APIs, services) |
| 8 | Intelligence layer — debate engine, prompt optimization |
| 9 | Persistent knowledge — ELO-ranked patterns, knowledge index |
| 10 | Self-improving loop — environment evolves from friction |

Run `/level-up` to see where you are and build the next level.

---

## Multi-CLI support

`npx azclaude` detects which AI CLI you're using and installs to the right place.

| CLI | Config dir | Rules file |
|-----|-----------|------------|
| Claude Code | `.claude/` | `CLAUDE.md` |
| Gemini CLI | `.gemini/` | `GEMINI.md` |
| OpenCode | `.opencode/` | `AGENTS.md` |
| Codex CLI | `.codex/` | `AGENTS.md` |
| Cursor | `.cursor/` | `.cursor/rules/project.mdc` |

Path substitution happens at install time — once, not on every session.

---

## Adding capabilities

Every capability is a single file. Adding one never touches existing files:

```markdown
# .claude/capabilities/{category}/{name}.md

---
name: {capability-name}
description: What this does. When it fires. Trigger words.
tokens: ~{estimate}
---

[instructions — 150 lines max]
```

Then add one row to `manifest.md`:
```
| {category}/{name}.md | {trigger description} | ~{tokens} |
```

Done. The routing in `CLAUDE.md` already says "read manifest.md for unknown capabilities."

---

## License

MIT — [haytamAroui](https://github.com/haytamAroui)
