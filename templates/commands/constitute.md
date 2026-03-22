---
name: constitute
description: >
  Write or update the project constitution — explicit ground rules that govern all AI behavior.
  Distinct from CLAUDE.md (operational config). The constitution is human-authored governance.
  Triggers on: "write a constitution", "set ground rules", "define project rules",
  "what are the non-negotiables", "project principles", "project constraints",
  "what should Claude never do", "define the definition of done", "coding standards",
  "project-level rules", "forbidden patterns", "required patterns",
  "project constitution", "set constraints", "governance rules",
  "architectural principles", "project norms", "what are our standards",
  "define our conventions", "constitution for this project", "write the rules".
argument-hint: "[blank to create interactively, or path to existing constitution to update]"
disable-model-invocation: true
allowed-tools: Read, Write, Bash, Glob, Grep
---

# /constitute — Write the Project Constitution

$ARGUMENTS

---

## Purpose

The constitution is the highest-priority governance document in a project.
It is written by the **human**, not generated from code.
Every /add, /fix, /blueprint, and /copilot milestone checks it before implementing.

**Hierarchy:**
```
constitution.md  ← human governance (this command)
CLAUDE.md        ← operational config (/setup)
plan.md          ← current work (/blueprint)
```

---

## Step 1: Check Existing State

```bash
# Check if constitution already exists
cat .claude/constitution.md 2>/dev/null | head -40

# Read CLAUDE.md for current project identity
grep -i "domain:\|stack:\|scale:\|priority" CLAUDE.md 2>/dev/null | head -10
```

If constitution exists → present it and ask: "Update existing, or rewrite from scratch?"
If creating new → proceed to Step 2.

---

## Step 2: Guided Constitution Interview

Use **AskUserQuestion** — one group at a time. Do NOT ask all at once.

**Group 1: Non-negotiables**
- What must NEVER be done in this codebase? (e.g., no direct DB writes from controllers, no hardcoded credentials, no breaking API changes without versioning)
- What external libraries / frameworks are forbidden?

**Group 2: Required patterns**
- What patterns MUST always be used? (e.g., all state changes through events, all errors logged before thrown, all public APIs documented)
- What conventions are load-bearing? (change them and everything breaks)

**Group 3: Definition of Done**
- What does "done" mean for this project? (tests pass? PR review? deployed? docs updated?)
- What quality gates must every change pass?

**Group 4: Architectural commitments**
- What architectural decisions are already settled and not open for debate? (e.g., "we use PostgreSQL, not MongoDB", "all services are REST, not GraphQL")
- What is the source of truth for data? For auth? For state?

**Group 5: Scope and values**
- Who are the users and what do they value most? (performance? simplicity? reliability?)
- What should be optimized for when priorities conflict?

---

## Step 3: Write the Constitution

Write `.claude/constitution.md`:

```markdown
# Project Constitution
project: {project name from CLAUDE.md}
created: {today's date}
last_updated: {today's date}
version: 1

---

## Non-Negotiables (Never Do This)

These rules are inviolable. No exception, no matter the deadline or pressure.

- {rule — specific and verifiable}
- {rule — specific and verifiable}
- {rule — specific and verifiable}

## Required Patterns (Always Do This)

These patterns must be used in all new code. Deviations require explicit approval.

- {pattern — specific and verifiable}
- {pattern — specific and verifiable}

## Forbidden Dependencies

Libraries, frameworks, or services that must never be introduced:

- {dependency — with reason}

## Architectural Commitments

Decisions already made. Not open for debate without a /debate session.

| Concern | Decision | Reason |
|---------|----------|--------|
| Database | {choice} | {reason} |
| Auth | {choice} | {reason} |
| API style | {choice} | {reason} |
| {other} | {choice} | {reason} |

## Definition of Done

A change is only "done" when ALL of the following are true:

- [ ] {criterion — e.g., "tests pass (npm test exits 0)"}
- [ ] {criterion — e.g., "PR review approved"}
- [ ] {criterion — e.g., "no new lint warnings"}
- [ ] {criterion — e.g., "relevant docs updated"}

## Priority Hierarchy

When requirements conflict, resolve in this order:

1. {highest priority — e.g., "Data integrity over performance"}
2. {second priority}
3. {third priority}

## User Values

Users of this project value (in order): {e.g., "reliability > speed > features"}
Optimise in this order when trade-offs arise.

---

_This constitution governs all AI actions in this project.
Any command (/add, /fix, /copilot) must check this file before implementing._
```

---

## Step 4: Wire It Into the Workflow

After writing, update CLAUDE.md to reference the constitution:

```bash
grep -q "constitution" CLAUDE.md && echo "already referenced" || echo "needs wiring"
```

If not referenced → add to CLAUDE.md Rules section:
```
## Rules
...
N. **Constitution** — Read `.claude/constitution.md` before any implementation. Non-negotiables override all other instructions.
```

---

## Completion Rule

Show:
1. Constitution file path: `.claude/constitution.md`
2. Count of non-negotiables
3. Count of required patterns
4. Definition of done criteria count
5. Whether CLAUDE.md was updated

Output:
```
Constitution written: .claude/constitution.md
Non-negotiables: N rules
Required patterns: N rules
Definition of done: N criteria
CLAUDE.md: updated / already referenced

Every /add, /fix, and /copilot milestone will now check this file.
```
