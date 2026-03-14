---
name: plan
description: >
  Plan a large or risky change — reads codebase, writes a file-level plan, waits for
  explicit approval before any code is touched. Use when /add would be too fast.
  Triggers on: "plan this", "let's plan before coding", "think through before implementing",
  "design first", "what's the approach", "I need to understand before we build",
  "this is complex — plan it", "don't code yet just plan", "how would we implement",
  "map out the changes", "what files would change".
  NOT triggered by: "add X" or "implement X" alone — those go to /add directly.
argument-hint: "[complex feature or risky change to plan]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash
---

# /plan — Plan Before Implementing

$ARGUMENTS

**Use /add for straightforward features. Use /plan when:**
- The change touches 4+ files
- It involves a schema, API contract, or interface change
- Getting it wrong would be costly to reverse
- You want explicit approval before any code is written

---

**EnterPlanMode** — read and think only. No file modifications until Step 4.

---

## Step 1: Clarify (if needed)

If $ARGUMENTS is vague, use **AskUserQuestion**:
- What is the goal? (the problem, not the solution)
- Any hard constraints? (backwards compatibility, performance, deadline)
- What's explicitly out of scope?

---

## Step 2: Map the Impact

Find every file that will need to change:

```bash
grep -r "{keyword from $ARGUMENTS}" --include="*.ts" --include="*.py" --include="*.js" -l | head -15
```

For each affected file, read the relevant section — not the whole file.

Identify:
- **Interfaces / types** that will change → downstream consumers must be updated
- **Tests** that must be added or modified
- **Config / migration** side effects

---

## Step 3: Write the Plan

Output a numbered list — every item must include `file:line`:

```
Plan: {title}
Risk: low / medium / high — {one sentence why}

Steps:
1. src/auth/jwt.ts:45 — add refreshToken() — covers 7-day renewal flow
2. src/auth/types.ts:12 — extend TokenResponse with refreshToken field
3. tests/auth/jwt.test.ts — add 3 tests: valid refresh, expired token, tampered token
4. src/api/routes/auth.ts:88 — wire POST /auth/refresh to new method
```

**Bad (too vague):** "Update the auth module"
**Good:** "`src/auth/jwt.ts:45` — add `refreshToken()` — handles 7-day renewal"

State the risk level. If risk = high → recommend `EnterWorktree` during implementation.

---

## Step 4: Approval Gate

**ExitPlanMode**

Present the plan and STOP. Do not write any code.

Ask the user: **"Approve this plan? (yes / change step N / cancel)"**

- `yes` → create TaskCreate for each step, then state: "Run /add to execute each task."
- `change step N` → revise that step, re-present, ask again
- `cancel` → discard, no tasks created

Tasks are only created after explicit approval. This is the point of /plan.

---

## Completion Rule

Show: the plan with `file:line` references + risk level.
Show: tasks created (only after approval).
Do not write any code during /plan — ever.
