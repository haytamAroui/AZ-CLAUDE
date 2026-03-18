---
name: native-tools
description: >
  Native Claude Code tools that AZCLAUDE skills must use. Reference when writing
  or improving any command or agent. Prevents reinventing what already exists.
tokens: ~200
---

# Native Claude Code Tools — AZCLAUDE Integration Reference

These tools are built into Claude Code. Skills should use them instead of simulating their behavior with prose.

---

## AskUserQuestion

**What it does**: Opens a structured dialog — not prose, a real form. Multiple questions in one shot. User fills them before Claude proceeds.

**Use instead of**: Asking questions in text and waiting for a reply.

**When to use in skills**:
- `/dream` — structured project intake (idea, stack, domain, v1 scope)
- `/setup` — if domain is ambiguous after scanning
- `/debate` — if $ARGUMENTS is vague, clarify the decision framing

**Pattern**:
```
Use AskUserQuestion to collect: project name, core problem, tech stack, target user,
and what's explicitly out of scope for v1.
Do not proceed until all answers are filled.
```

---

## TaskCreate / TaskUpdate / TaskGet / TaskList

**What it does**: Creates visible progress tasks in the Claude Code UI. User sees what's in progress and what's done.

**Use instead of**: Prose "I'll now do X, then Y, then Z."

**When to use in skills**:
- `/dream` — one task per level being built (L1: CLAUDE.md, L2: MCP, ...)
- `/setup` — track setup steps (scan, fill CLAUDE.md, create memory, run quality check)
- `/level-up` — one task for the level being built, mark complete when done

**Pattern**:
```
Before starting: TaskCreate for each major step with status "pending".
As each step begins: TaskUpdate to "in_progress".
As each step completes: TaskUpdate to "completed".
Do not skip TaskUpdate — the user uses it to track what happened.
```

---

## EnterPlanMode / ExitPlanMode

**What it does**: Puts Claude into read-only mode. Cannot write or edit files. Use for review and analysis phases before implementation.

**Use instead of**: Prose "I'll only read files here, not change anything."

**When to use in skills**:
- `/debate` — enter plan mode during analysis (Phases 1-5). Exit before recording decision.
- `/audit` agents — enter plan mode on load, never exit (reviewers must never write)
- `/dream` — enter plan mode during Phase 1 (environment scan), exit before building

**Pattern**:
```
Step 1: EnterPlanMode — read, analyze, do not touch files
Step 2: [analysis happens]
Step 3: ExitPlanMode — proceed to implement
```

---

## EnterWorktree / ExitWorktree

**What it does**: Creates an isolated git worktree — a separate checkout of the repo on a new branch. Changes stay isolated until you merge or discard.

**Use instead of**: Working on main directly for risky or experimental work.

**When to use in skills**:
- `/evolve` — run all evolution cycles in a worktree. Merge to main only if evaluate passes.
- `/fix` — if Confidence = medium or low, offer: "Run in worktree? (safe to discard if wrong)"
- `intelligence/experiment.md` — always use worktree (that's the point of experiments)

**Pattern**:
```
EnterWorktree (creates branch: azclaude/evolve-{date})
[do all work here]
If evaluate passes → merge to main
If not → ExitWorktree (discard)
```

---

## CronCreate / CronDelete / CronList

**What it does**: Creates a real scheduled cron job inside Claude Code. Runs a command at an interval without user re-invocation.

**Use instead of**: Telling the user to "re-run manually" or "set up a cron job yourself."

**When to use in skills**:
- `/loop` — wire CronCreate directly instead of simulating timing with prose
- `/evolve` — after completion, offer to schedule: "Schedule `/evolve` weekly? (CronCreate)"
- `/persist` — could offer a daily end-of-session reminder

**Pattern**:
```
Parse interval from $ARGUMENTS (5m → */5 * * * *, 1h → 0 * * * *)
CronCreate with the interval and command
Show: "Scheduled: {command} every {interval}. CronList to view, CronDelete to cancel."
```

**Interval mapping**:
| Arg | Cron expression |
|-----|----------------|
| `5m` | `*/5 * * * *` |
| `10m` | `*/10 * * * *` |
| `30m` | `*/30 * * * *` |
| `1h` | `0 * * * *` |
| `daily` | `0 9 * * *` |
| `weekly` | `0 9 * * 1` |

---

## mcp__ide__getDiagnostics

**What it does**: Reads live IDE diagnostics (TypeScript errors, lint warnings, import failures) directly from the editor — without running a build.

**Use instead of**: Asking the user to paste error output, or running a full build to find errors.

**When to use in skills**:
- `/fix Phase 1` — call this FIRST before running any test command. IDE already knows the error location.
- `/pulse` — include diagnostic count in the health check
- Any skill that deals with TypeScript, ESLint, or language-server errors

**Pattern**:
```
Step 1: mcp__ide__getDiagnostics
If diagnostics exist → treat as Phase 1 reproduction (no need to run tests first)
If no diagnostics → proceed to run the test command
```

**Output**: List of `{file, line, severity, message}`. Use `file:line` directly in Phase 2 investigation.

---

## WebSearch / WebFetch

**What it does**: Searches the web or fetches a specific URL. Real-time results, not training data.

**Use instead of**: Guessing library APIs or answering questions about packages from memory.

**When to use in skills**:
- `/fix Self-Correction` — if stuck on an unknown library error after 2 attempts, search the library docs
- `/dream` — if tech stack is unfamiliar, search current best practices before scaffolding
- `/debate` — fetch published benchmarks or comparisons when claims need verification

**Pattern**:
```
If the error references a third-party library and no local docs exist:
  WebSearch "{library name} {error message} {year}"
  WebFetch the most relevant result
  Use the result to inform Attempt 2 — do not guess
```

**Rules**:
- Use for real-time info only (package versions, library docs, breaking changes)
- Never use to substitute reading the actual codebase
- One search per attempt — not a loop

---

## NotebookEdit

**What it does**: Creates and edits Jupyter notebook cells directly.

**When to use in skills**:
- `/setup` for Data/ML domain — create an exploration notebook as part of setup
- `/dream` for data science projects — scaffold initial analysis notebook

---

## Quick Reference — Tool → Skill Mapping

| Tool | Wire into |
|------|----------|
| `AskUserQuestion` | `/dream`, `/setup` (if ambiguous), `/debate` (if vague) |
| `TaskCreate/Update` | `/dream`, `/setup`, `/level-up` |
| `EnterPlanMode` | `/debate` (analysis phases), reviewer agents |
| `ExitPlanMode` | `/debate` (before recording decision) |
| `EnterWorktree` | `/evolve`, `/fix` (medium/low confidence) |
| `CronCreate` | `/loop`, `/evolve` (post-run scheduling) |
| `CronList` | `/loop stop`, `/pulse` |
| `CronDelete` | `/loop stop` |
| `mcp__ide__getDiagnostics` | `/fix` Phase 1, `/pulse` |
| `WebSearch/WebFetch` | `/fix` self-correction, `/dream` (unfamiliar stack) |
| `NotebookEdit` | `/setup` + `/dream` for Data/ML |
