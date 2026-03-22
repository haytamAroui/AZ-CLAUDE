---
name: analyze
description: >
  Check cross-artifact consistency — does the code match the spec, plan, and intent?
  Distinct from /audit (which checks code quality). /analyze checks the documentation chain.
  Triggers on: "does the code match the spec", "is the plan still accurate", "check consistency",
  "spec vs implementation", "intent vs reality", "are we on track", "drift check",
  "does what we built match what we planned", "check the plan", "verify milestones",
  "are done milestones actually done", "plan drift", "spec drift", "review the plan",
  "check artifacts", "is plan.md up to date", "are we building the right thing",
  "cross-check", "verify against intent", "consistency check",
  "does implementation match spec", "plan vs code".
argument-hint: "[what to check: 'plan', 'spec {file}', 'intent', or blank for full check]"
disable-model-invocation: true
allowed-tools: Read, Bash, Glob, Grep
---

# /analyze — Cross-Artifact Consistency Check

$ARGUMENTS

**EnterPlanMode** — read-only. No file modifications.

---

## Purpose

/audit checks code quality. /analyze checks the documentation chain:
- Does `plan.md` reflect what was actually committed?
- Do milestones marked `done` have code that implements them?
- Does the codebase match `copilot-intent.md`?
- Do specs in `.claude/specs/` trace to plan milestones?

Long copilot runs, scope changes, and blocked milestones cause drift.
This command surfaces that drift before it becomes a bug.

---

## Step 1: Discover Available Artifacts

```bash
# Intent and plan
ls .claude/copilot-intent.md .claude/plan.md .claude/constitution.md 2>/dev/null

# Specs
ls .claude/specs/*.md 2>/dev/null

# Memory files
ls .claude/memory/goals.md .claude/memory/decisions.md .claude/memory/blockers.md 2>/dev/null

# Recent commits
git log --oneline -10 2>/dev/null
```

---

## Step 2: Route by $ARGUMENTS

**`plan`** → run Plan vs. Reality check (Step 3)
**`spec {file}`** → run Spec vs. Implementation check (Step 4) on that file
**`intent`** → run Intent vs. Codebase check (Step 5)
**blank** → run ALL checks (Steps 3, 4, 5)

---

## Step 3: Plan vs. Reality

Read `.claude/plan.md`. For each milestone with status `done`:

1. Read the `Files:` list from the milestone
2. Check each file actually exists:
   ```bash
   for f in {files-from-milestone}; do [ -f "$f" ] && echo "✓ $f" || echo "✗ MISSING: $f"; done
   ```
3. Check the `Commit:` message exists in git log:
   ```bash
   git log --oneline | grep -i "{commit-keyword}" | head -2
   ```
4. If file missing or commit not found → flag as **GHOST** (marked done but not implemented)

For each milestone with status `pending` or `in-progress`:
- Check if `Depends:` milestones are actually `done`
- Flag dependency violations

Output format:
```
Plan vs. Reality
────────────────
✓ M1: {title} — files present, commit found
✗ M3: {title} — GHOST: src/auth/refresh.ts missing (marked done, not implemented)
⚠ M5: {title} — DEPENDENCY VIOLATION: depends on M3 (not done)
```

---

## Step 4: Spec vs. Implementation

For each spec in `.claude/specs/` with `status: ready-for-blueprint`:

1. Read the spec's acceptance criteria
2. For each criterion, search the codebase for evidence of implementation:
   ```bash
   grep -ri "{keyword from criterion}" --include="*.ts" --include="*.py" --include="*.js" -l | head -5
   ```
3. Look for tests that cover each criterion:
   ```bash
   find . \( -name '*.test.*' -o -name '*.spec.*' -o -name 'test_*.py' \) -not -path '*/node_modules/*' | xargs grep -li "{keyword}" 2>/dev/null | head -3
   ```

Output format:
```
Spec vs. Implementation: {spec-file}
─────────────────────────────────────
✓ AC1: {criterion} — found in src/auth/login.ts:45
✗ AC2: {criterion} — NO IMPLEMENTATION FOUND
⚠ AC3: {criterion} — implementation found but no test coverage
```

---

## Step 5: Intent vs. Codebase

Read `.claude/copilot-intent.md`. Extract the core capabilities described.

For each capability:
1. Check if there is a corresponding milestone in plan.md
2. If milestone exists and is `done` → verify files present (Step 3 logic)
3. If milestone missing → flag as **UNPLANNED** (intent describes it but plan doesn't include it)
4. If milestone `blocked` → note it as blocked

Output format:
```
Intent vs. Codebase
────────────────────
✓ "user authentication" — M1 done, files present
✗ "email notifications" — NOT IN PLAN: no milestone covers this
⚠ "payment processing" — M7 blocked: {reason from blockers.md}
```

---

## Step 6: Consistency Score

Tally findings across all checks:

```
Consistency Report
══════════════════
Plan accuracy:    {done milestones verified} / {total done}   — {%}
Spec coverage:    {AC implemented} / {total AC}               — {%}
Intent coverage:  {capabilities in plan} / {total in intent}  — {%}

Issues:
  GHOST:             {N} milestones marked done but not implemented
  UNPLANNED:         {N} intent capabilities not in plan
  MISSING TESTS:     {N} acceptance criteria without test coverage
  DEPENDENCY ERRORS: {N} dependency violations

Verdict: CONSISTENT / MINOR DRIFT / SIGNIFICANT DRIFT
```

---

## Step 7: Recommended Actions

For each finding, output one concrete next step:
- GHOST → `Re-open milestone M{N} in plan.md (set status: pending), then /add`
- UNPLANNED → `Add milestone to plan.md for "{capability}", then /add`
- MISSING TESTS → `Run /test on {file} to add coverage`
- DEPENDENCY ERROR → `Fix plan.md: M{N} must be done before M{M}`

---

## Completion Rule

**ExitPlanMode**

Show: consistency score (%).
Show: all findings with file:line references.
Show: recommended actions.
Do not modify any files during /analyze — ever.
