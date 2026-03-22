---
name: blueprint
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

# /blueprint — Plan Before Implementing

$ARGUMENTS

**Use /add for straightforward features. Use /blueprint when:**
- The change touches 4+ files
- It involves a schema, API contract, or interface change
- Getting it wrong would be costly to reverse
- You want explicit approval before any code is written

---

**EnterPlanMode** — read and think only. No file modifications until Step 4.

---

## Step 1: Spec Detection + Clarify

First check if $ARGUMENTS is a spec file:
```bash
[ -f "$ARGUMENTS" ] && grep -q "Acceptance Criteria" "$ARGUMENTS" && echo "spec-file" || echo "inline"
```

**If spec file detected** (`.claude/specs/*.md`):
1. Spawn `spec-reviewer` agent to validate quality:
   ```
   Validate this spec file before I use it to generate plan.md: {spec-file-path}
   ```
2. If verdict = `APPROVED` → read spec directly as the source of truth. Skip AskUserQuestion.
   - Extract acceptance criteria → use as milestone completion criteria
   - Extract data model / API changes → use as Files: hints
   - Extract out-of-scope → use to exclude from milestones
3. If verdict = `NEEDS_CLARIFY` → stop: `Run /clarify {spec-file} first, then retry /blueprint`
4. If spec-reviewer not installed → read spec file directly, proceed without validation

**If inline description** (not a spec file):
- Check if `.claude/specs/` has a spec matching $ARGUMENTS keywords:
  ```bash
  ls .claude/specs/ 2>/dev/null | grep -i "$(echo "$ARGUMENTS" | cut -d' ' -f1-2)"
  ```
- If matching spec found → use it. If not → proceed with AskUserQuestion below.

If $ARGUMENTS is vague (and no spec found), use **AskUserQuestion**:
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

## Step 3b: Constitution Check + Task Graph

After writing the plan (Step 3), check:
```bash
[ -f .claude/constitution.md ] && echo "constitution=found" || echo "no constitution"
```

If constitution found → scan plan steps against non-negotiables:
- Read `## Non-Negotiables` from constitution.md
- Flag any plan step that could violate a rule
- Add a note to flagged steps: `⚠ Constitution check: may conflict with "{rule}" — verify before implementing`

Then run `/tasks` to show dependency waves:
```
Next: Run /tasks to see which plan steps can run in parallel
```
(Do not block — /tasks is informational at this stage)

---

## Step 4: Approval Gate

**ExitPlanMode**

Present the plan and STOP. Do not write any code.

Ask the user: **"Approve this plan? (yes / change step N / cancel)"**

- `yes` → create TaskCreate for each step, then state: "Run /add to execute each task."
- `change step N` → revise that step, re-present, ask again
- `cancel` → discard, no tasks created

Tasks are only created after explicit approval. This is the point of /blueprint.

---

## Feature-Scoped Mode (Optional)

When $ARGUMENTS points to a spec file (`.claude/specs/*.md`) OR contains a named feature:

```bash
# Detect spec file
[ -f "$ARGUMENTS" ] && echo "spec-mode" || echo "inline-mode"

# Determine next feature number
NEXT_N=$(ls .claude/features/ 2>/dev/null | grep -c '^' || echo 0)
N=$(printf '%02d' $((NEXT_N + 1)))
SLUG=$(basename "$ARGUMENTS" .md 2>/dev/null || echo "$ARGUMENTS" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-' | cut -c1-40)
FEATURE_DIR=".claude/features/${N}-${SLUG}"
```

If spec file provided → create a feature-scoped directory:
```bash
mkdir -p "$FEATURE_DIR"
cp "$ARGUMENTS" "$FEATURE_DIR/spec.md"
```

Write the plan to `$FEATURE_DIR/plan.md` (same format as `.claude/plan.md`).
Also write a summary entry to `.claude/plan.md` linking to the feature:
```markdown
## Feature: {N}-{slug}
Files: .claude/features/{N}-{slug}/plan.md
Status: pending
```

This keeps the global plan.md as the tracker while feature details live in their own directory.
Each feature directory is self-contained: `spec.md` + `plan.md` + any generated artifacts.

**When NOT to use feature mode:** quick fixes, single-file changes, copilot mode (uses global plan.md).

---

## Copilot Mode — Structured plan.md Output

When running inside `/copilot` (detected by: `.claude/copilot-intent.md` exists):
- Skip the approval gate (Step 4) — copilot operates autonomously
- Write the plan to `.claude/plan.md` in the structured format defined in `plan-tracker.md`
- Read `.claude/capabilities/shared/plan-tracker.md` for the exact format
- Each milestone = one logical unit of work (1-3 files, one commit)
- Include `Depends:` for milestones that require prior work
- Include `Files:` with expected paths
- Include `Commit:` with conventional commit format
- Write `## Summary` with counts at the bottom

### Problem-Architect Validation (if available)

After writing plan.md, check:
```bash
ls .claude/agents/problem-architect.md 2>/dev/null
```

If problem-architect.md exists — spawn it for EACH milestone in plan.md:
```
Analyze this milestone for the Team Spec:
Milestone: {description from plan.md}
Current state: {what files exist in the project}
Available agents: {list of .claude/agents/}
Available skills: {list of .claude/skills/}
```

For each milestone, append the returned Team Spec fields directly into plan.md:
- `Complexity:` SIMPLE / MEDIUM / COMPLEX
- `Files Written:` exact paths the builder will touch (critical for parallel safety)
- `Pre-conditions:` checklist before starting
- `Risks:` and mitigation
- `Structural Decision:` YES/NO (if YES → orchestrator must /debate before dispatching)

This pre-annotation makes orchestrator dispatch faster and prevents parallel file collision.

After all milestones annotated — return control to /copilot.

---

## Completion Rule

Show: the plan with `file:line` references + risk level.
Show: tasks created (only after approval).
Do not write any code during /blueprint — ever (unless in copilot mode, where plan.md is the output).
