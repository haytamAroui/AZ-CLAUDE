---
name: refactor
description: >
  Restructure code without changing behavior. Rename, extract, move, simplify.
  Runs tests before AND after to prove nothing broke. Never changes behavior.
  Triggers on: "refactor", "rename", "extract", "move this", "simplify",
  "clean up", "restructure", "split this file", "too long", "DRY this up".
argument-hint: "[what to refactor — file, function, or pattern]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /refactor — Safe Code Restructuring

$ARGUMENTS

Load: shared/completion-rule.md

---

## Phase 1: Understand Current State

If $ARGUMENTS is blank, use **AskUserQuestion**:
- What specifically needs refactoring?
- What's the goal? (readability, DRY, modularity, rename)

1. Read the target code and all files that import/use it:
```bash
grep -r "{target}" --include="*.ts" --include="*.py" --include="*.js" -l | head -20
```
2. Map all references — every file that will need updating
3. Run the full test suite BEFORE any changes:
```bash
{test command}; EXIT=$?
echo "BEFORE refactor — Exit: $EXIT"
```
4. Record the test output — this is your safety net

**If tests fail before refactoring: STOP.** Fix tests first with `/fix`. Never refactor on a red test suite.

---

## Phase 2: Plan the Change

Write a refactoring plan before touching any code:

```
Target:     {file:line — what's being refactored}
Type:       {rename | extract function | extract file | move | simplify | inline}
Files:      {list of all files that will change}
Risk:       {low — rename only | medium — logic restructure | high — cross-file move}
```

For **high risk**: use **EnterWorktree** — isolate the refactor. Merge only if tests pass.

---

## Phase 3: Apply

Execute the refactoring. Reference every change as `file:line — what changed`.

Rules:
- Change structure, never behavior
- Update ALL references — grep to verify none were missed:
```bash
grep -r "{old_name}" --include="*.ts" --include="*.py" --include="*.js" | head -10
```
- If any references remain: fix them before proceeding
- Update imports, exports, type references, tests, docs

---

## Phase 4: Verify

Run the full test suite AFTER changes:
```bash
{test command}; EXIT=$?
echo "AFTER refactor — Exit: $EXIT"
if [ $EXIT -ne 0 ]; then echo "REFACTOR BROKE SOMETHING — revert or fix"; fi
```

Compare before/after:
- Same number of tests passing
- No new failures
- No new warnings

---

## Completion Rule

Show:
1. Before test output (passing)
2. List of changes: `file:line — what changed`
3. After test output (passing)
4. Grep proof that no stale references remain

Do not say "refactoring complete" without showing both test runs.
