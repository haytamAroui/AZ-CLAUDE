---
name: plan
description: >
  Plan before implementing. Reads the codebase in read-only mode, then creates tasks for implementation.
  Triggers on: "plan this", "let's plan", "how should we implement", "think through",
  "before we code", "break this down", "what's the approach", "design before build".
  Outputs tasks — no code written until user approves.
argument-hint: "[what to plan]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash
---

# /plan — Plan Before Implementing

$ARGUMENTS

---

**EnterPlanMode** — read and think only. No file modifications.

---

## Step 1: Clarify

If $ARGUMENTS is vague, use **AskUserQuestion**:
- What is the goal? (the problem, not the solution)
- Any constraints? (performance, backwards compatibility, deadline)
- What's explicitly out of scope?

---

## Step 2: Read the Affected Code

Find what's relevant:
```bash
grep -r "{keyword from $ARGUMENTS}" --include="*.ts" --include="*.py" --include="*.js" -l | head -10
```

Read the files that will change. Understand:
- Existing patterns — what to follow
- Interfaces and types — what to extend
- Test structure — what tests will need to be added

Do not skip this step. Plans that don't read code produce wrong estimates.

---

## Step 3: Write the Plan

Output the plan as a numbered list:
```
1. [file:line] — what changes and why
2. [new file] — what it contains and why it's separate
3. [test file] — what new tests cover
```

Each item: specific file, specific change, specific reason.

**Do NOT write:**
- "Update the auth module" (too vague)

**Write:**
- "`src/auth/jwt.ts:45` — add `refreshToken()` method — covers 7-day renewal flow"

---

## Step 4: Create Tasks

**ExitPlanMode**

Create a **TaskCreate** for each step in the plan.
These become the implementation checklist.

```
Tasks created:
  ☐ [step 1 description]
  ☐ [step 2 description]
  ☐ [step 3 description]
```

---

## Completion Rule

Show the plan with file references.
Show the created tasks.
State: "Run /add or /fix to execute. Tasks are ready."

Do not write any code during /plan.
