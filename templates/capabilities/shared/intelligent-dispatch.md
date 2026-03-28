# Intelligent Dispatch — Pre-Flight Protocol

Load before any non-trivial build, fix, refactor, audit, or plan task.
Invokes problem-architect for structured analysis BEFORE touching code.

---

## When to Run Problem-Architect

Run pre-analysis if ANY of these is true:
- Task will touch 3+ files
- Task involves a structural change (schema, API contract, auth, architecture)
- Task crosses directory boundaries (multiple modules or layers)
- First time working in this part of the codebase this session

Skip if:
- Only 1-2 files, clearly scoped
- Pure config/docs change with no code impact
- Already in copilot mode with annotated plan.md (milestones already have Team Spec)

---

## How to Invoke

```bash
ls .claude/agents/problem-architect.md 2>/dev/null && echo "ARCHITECT_AVAILABLE" || echo "NOT_INSTALLED"
```

If ARCHITECT_AVAILABLE — spawn problem-architect with:
```
Task: {command name} — {what you're doing}
Current state: {what files/dirs exist relevant to this task}
Available agents: {output of: ls .claude/agents/ 2>/dev/null}
Available skills: {output of: ls .claude/skills/ 2>/dev/null}
```

---

## What to Do with the Returned Team Spec

| Field | Action |
|-------|--------|
| Skills to Load | Load each skill before implementing |
| Pre-Read Files | Read every file listed, in order: schema → source → tests → patterns → antipatterns |
| Relay | Pass directly to builder prompt (see below) |
| Pre-Conditions | Verify each; STOP if any unmet |
| Files Written | Note for parallel safety — no concurrent work on same files |
| Structural Decision: YES | Run /debate before proceeding; log result to `.claude/memory/decisions.md` |
| Risks | Read mitigation; apply to implementation approach |

### Context Relay — Eliminate Redundant Reads

After reading pre-read files, if spawning a builder agent:
1. Include a `## Pre-loaded Context` block in the builder's prompt with file contents you already read
2. Filter by the builder's role — see `capabilities/shared/context-relay.md` for role-based filters and size limits
3. The spawned agent **MUST NOT** re-read files listed in the Pre-loaded Context block
4. If problem-architect returned a `## Relay` section, pass it directly into the builder prompt

---

## Implementation Protocol (milestone-builder)

For any implementation task (3+ files or MEDIUM/COMPLEX):

1. **Pre-read** all files from Team Spec — no exceptions
2. **Implement** following patterns.md exactly — never invent patterns
3. **Verify** — run full test suite, show actual output (never summarize)
4. **Self-correct** — re-read error + check antipatterns.md → ONE alternative approach
5. **Budget** — 2 fix attempts for SIMPLE/MEDIUM, 3 for COMPLEX
   - Budget exhausted → report exact error + what was tried → do not guess again

---

## When to Escalate to Orchestrator

If `.claude/agents/orchestrator.md` exists:
- Task spans 2+ milestones in plan.md → delegate to orchestrator
- Multiple independent workstreams → orchestrator manages parallel dispatch
- Structural decision needed → orchestrator triggers /debate

---

## Rules

- NEVER skip pre-read. Context-blind implementation is the most common failure mode.
- NEVER invent patterns. patterns.md says use X → use X.
- NEVER exceed fix attempt budget. Stop and report when exhausted.
- ALWAYS show test output. Never say "tests should pass."
