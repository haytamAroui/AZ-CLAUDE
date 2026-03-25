---
name: test
description: >
  Run the test suite, interpret results, and fix failures.
  Triggers on: "run tests", "test this", "check tests", "tests failing", "are tests passing",
  "run the suite", "test file X", "why is X test failing", "test before ship".
  Checks IDE diagnostics first — type errors cause test failures.
argument-hint: "[test file, test name, or blank for full suite]"
disable-model-invocation: true
allowed-tools: Read, Bash, Grep
---

# /test — Run and Interpret Tests

$ARGUMENTS

---

## Pre-Flight: Code Rules Check

```bash
[ -f .claude/code-rules.md ] && echo "code-rules=found" || echo "no code-rules"
```

If code-rules found: read the `## Testing` section before writing or interpreting any tests.
Apply: TDD philosophy (mandatory / optional / test-after), test naming convention, coverage targets.
If writing new tests: follow the naming pattern from code-rules, not generic conventions.

---

## Step 0: Test Integrity (if autonomous code was generated)

If `.claude/copilot-intent.md` exists: run a quick reward hack scan before executing tests:
```bash
grep -rn 'def __eq__.*return True\|sys\.exit\s*(0)\|TestReport\.from_item_and_call' tests/ test/ conftest.py 2>/dev/null
```
If any match: WARN before running the suite. `⚠ Reward hack pattern detected — run /ghost-test for full analysis.`

---

## Step 1: IDE Diagnostics First

Use `mcp__ide__getDiagnostics` if available.

If it returns errors:
```
IDE errors found — these will cause test failures. Fix first:
  file:line — message
```
If unavailable or returns empty: skip this step and proceed to Step 2.

Type errors and import failures cause misleading test output — clear them before running.

---

## Step 2: Detect Test Framework

```bash
grep -E '"test":|"jest"|"vitest"|"mocha"|"playwright"' package.json 2>/dev/null | head -3
grep -E "pytest|unittest" requirements.txt pyproject.toml 2>/dev/null | head -3
ls Cargo.toml go.mod 2>/dev/null
```

Use the framework already in the project. Never introduce a new one.

---

## Step 3: Run Tests

Scope:
- $ARGUMENTS = specific file → run that file only
- $ARGUMENTS = test name → run matching test
- blank → run the full suite

```bash
{test command} {scope}; EXIT=$?
echo "Exit: $EXIT"
```

Paste the **full output** — never summarize it.

---

## Step 4: Interpret Results

**If EXIT = 0**: Report `Tests: {N} passed, 0 failed` — done.

**If EXIT ≠ 0**: For each failing test:
1. Name the test exactly
2. Map to `file:line`
3. Classify:
   - **Compile/type error** → fix IDE errors first (Step 1)
   - **Assertion failure** → go to /fix Phase 2 at `file:line`
   - **Timeout** → check for async issues, missing mocks
   - **Not found / import error** → check module paths

Fix one failing test at a time — not all at once.
Apply /fix self-correction loop for each: 2 attempts, then escalate.

---

## Completion Rule

Show the full test output.
State: `Tests: {N} passed, {M} failed`.

If failures remain: list each with `file:line` — stay in progress.
Do not report "tests done" with failures open.
