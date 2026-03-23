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

## Pre-Flight: Constitution + Code Rules Check

```bash
[ -f .claude/constitution.md ] && echo "constitution=found" || echo "no constitution"
[ -f .claude/code-rules.md ] && echo "code-rules=found" || echo "no code-rules"
```

If constitution found: read `## Architectural Commitments` and `## Required Patterns`.
Refactoring often changes structure — ensure the refactor moves TOWARD required patterns, not away from them.
If the refactor would conflict with an architectural commitment → flag before starting Phase 1. Do not proceed silently.

If code-rules found: read `.claude/code-rules.md` — the refactor must move code TOWARD these rules, not away from them.
The style, naming, and architecture sections define the TARGET state. Use them as the direction of the refactor.
If the current code violates a rule, the refactor is an opportunity to fix it — note the correction explicitly.

---

## Pre-Flight Analysis (intelligent-dispatch)

Load `shared/intelligent-dispatch.md`.

Spawn problem-architect before any scan:
```
Task: refactor — {what's being refactored}
Current state: {target file/function + surrounding directory}
Available agents: {list}
Available skills: {list}
```
Use returned Team Spec:
- Pre-Read Files → read these BEFORE grepping for references (architect already knows the dependency graph)
- Risks → structural risks the refactor may trigger (e.g., type exports used downstream)
- Files Written → exhaustive list of files the refactor will touch
- If Structural Decision: YES → run /debate (refactors sometimes expose architectural choices)

If problem-architect not installed: proceed with Phase 1 manual scan.

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
