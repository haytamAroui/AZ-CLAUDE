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

## Copilot Mode Detection

```bash
[ -f .claude/copilot-intent.md ] && echo "COPILOT_MODE" || echo "INTERACTIVE_MODE"
```

If `COPILOT_MODE`: skip Phase 1 (AskUserQuestion). Read `.claude/copilot-intent.md` as the
complete input — it contains the product description, stack, and scope. Extract answers to
all four questions below from the intent file. If any are missing, infer reasonable defaults
from the intent rather than asking the user.

If `INTERACTIVE_MODE`: run Phase 1 as normal.

---

## Phase 1: Structured Intake

**Use AskUserQuestion** to collect all context in one shot. Do not ask in prose.

Ask these questions:
- **What do you want to build?** — the core problem it solves, not just the feature list
- **Tech stack** — what technologies, or "help me choose"
- **Who uses this?** — developers / end users / internal team
- **What is explicitly OUT of scope for v1?** — prevents scope creep from the start

If $ARGUMENTS already answers one of these clearly, pre-fill it and only ask what's missing.

Do not proceed to Phase 2 until all four answers are collected (or extracted from copilot-intent.md).

---

## Phase 2: Environment Scan

Use **EnterPlanMode** — read the environment, do not touch files yet.

```bash
[ -f CLAUDE.md ] && echo "CLAUDE.md exists" || echo "clean slate"
[ -d .claude ] && ls .claude/ || echo "no .claude dir"
```

Read `.claude/capabilities/manifest.md` if it exists.

Detect current level (0–7) from what's present.

**Existing project deep scan (intelligent-dispatch):**

If `.claude` directory exists and project has code files — load `shared/intelligent-dispatch.md` and spawn problem-architect:
```
Task: dream — analyze existing codebase before generating vision
Current state: {what files, agents, skills already exist}
Available agents: {list}
Available skills: {list}
```
Use returned Team Spec to understand:
- What agents/skills already cover (don't regenerate what exists)
- Co-change clusters (candidate future agents)
- Established patterns (vision must not conflict with them)
- Structural decisions already made (decisions.md)

If clean slate (no .claude dir): skip problem-architect, proceed to Phase 3.

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

## Phase 3b: Generate Domain Advisor Skill

After detecting the project domain in Phase 1/2:

1. Read `capabilities/shared/domain-advisor-generator.md`
2. If domain is NOT pure developer (compliance, marketing, finance, medical, research, legal, logistics):
   - Generate `{domain}-advisor/` skill using the domain template
   - Include decision matrices, thresholds, and anti-patterns
   - Run `skill-creator` quality checklist
3. If domain IS developer → `architecture-advisor` already covers this (installed by default)
4. For multi-domain projects → generate one advisor per domain

This gives the copilot evidence-based guidance for domain-specific decisions,
not just code patterns.

---

## Phase 4: Quality Gate

Load `capabilities/shared/quality-check.md` and run all checks.
All ✓ required before printing "project ready."

---

## Phase 5: Spec-Driven Readiness

After quality gate passes, check and suggest the spec-driven workflow:

```bash
[ -f .claude/constitution.md ] && echo "constitution=found" || echo "constitution=missing"
ls .claude/specs/*.md 2>/dev/null | head -3
```

Always output this next-steps block:

```
─── Spec-Driven Workflow: Next Steps ────────────────────
  1. /constitute          — define project ground rules (non-negotiables, required patterns,
                            definition of done). Copilot checks this before every milestone.

  2. /spec [feature]      — write a structured spec for your first feature.
                            Produces: user stories + acceptance criteria + out-of-scope.
                            Feeds directly into /blueprint for a better plan.

  3. /clarify [spec]      — resolve any open questions in the spec before planning.

  4. /blueprint [spec]    — derive a milestone plan from the spec.
                            spec-reviewer validates quality before planning starts.

  5. /copilot             — autonomous execution: spec → plan → build → test → ship.
─────────────────────────────────────────────────────────
```

---

## Completion Rule

Show:
1. The created `CLAUDE.md` (full content)
2. The created `goals.md` (full content)
3. The level checklist (what was built)
4. The spec-driven next steps block (always — even for existing projects)

Do not say "project ready" without showing these four outputs.
