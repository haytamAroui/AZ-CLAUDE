---
name: dream
description: Build a project from an idea — scaffolds rules file, memory, skills, and agents level by level.
argument-hint: "[project idea and tech stack]"
disable-model-invocation: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent
---

# /dream — Build a Project From an Idea

$ARGUMENTS

---

## Phase 1: Structured Intake

**Use AskUserQuestion** to collect all context in one shot. Do not ask in prose.

Ask these questions:
- **What do you want to build?** — the core problem it solves, not just the feature list
- **Tech stack** — what technologies, or "help me choose"
- **Who uses this?** — developers / end users / internal team
- **What is explicitly OUT of scope for v1?** — prevents scope creep from the start

If $ARGUMENTS already answers one of these clearly, pre-fill it and only ask what's missing.

Do not proceed to Phase 2 until all four answers are collected.

---

## Phase 2: Environment Scan

Use **EnterPlanMode** — read the environment, do not touch files yet.

```bash
[ -f CLAUDE.md ] && echo "CLAUDE.md exists" || echo "clean slate"
[ -d .claude ] && ls .claude/ || echo "no .claude dir"
```

Read `.claude/capabilities/manifest.md` if it exists.

Detect current level (0–7) from what's present.

**ExitPlanMode** — ready to build.

---

## Phase 3: Build Level by Level

Create **TaskCreate** entries before starting — one per level to build:
- `L1: CLAUDE.md — rules file`
- `L2: MCP config`
- `L3: Skills — project commands`
- `L4: Memory — goals.md`
- `L5: Agents`
- `L6: Hooks`
- (only create tasks for levels not yet present)

For each level:
1. **TaskUpdate → in_progress**
2. Read the matching `capabilities/level-builders/level{N}.md` — load ONE at a time
3. Execute what it says using answers from Phase 1 as input
4. Show what was created: file path + one-line purpose
5. **TaskUpdate → completed**

Spawn `agents/orchestrator-init.md` to fill CLAUDE.md and goals.md with the actual project data.

If tech stack is unfamiliar → **WebSearch** "{stack} project structure best practices {year}" before scaffolding.

---

## Phase 4: Quality Gate

Load `capabilities/shared/quality-check.md` and run all checks.
All ✓ required before printing "project ready."

---

## Completion Rule

Show:
1. The created `CLAUDE.md` (full content)
2. The created `goals.md` (full content)
3. The level checklist (what was built)
4. First task to work on

Do not say "project ready" without showing these four outputs.
